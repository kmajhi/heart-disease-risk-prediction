from django.conf import settings
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import ensure_csrf_cookie
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from PIL import Image, UnidentifiedImageError
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    AccountDeleteSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)

PASSWORD_RESET_SENT_MESSAGE = "If an account exists for that email, a reset link has been sent."
PASSWORD_RESET_INVALID_MESSAGE = "This password reset link is invalid or has expired."

MAX_AVATAR_BYTES = 5 * 1024 * 1024


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST
            )
        login(request, user)
        return Response(UserSerializer(user, context={"request": request}).data)


class GoogleLoginView(APIView):
    """
    Sign in (or, on first use, silently provision) an account from a Google
    Identity Services ID token — no separate manual registration step.
    Accounts created this way get set_unusable_password(): they can only
    ever sign in through Google, never via the email/password form, unless
    they later use "forgot password" (not yet implemented) to set one.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        client_id = getattr(settings, "GOOGLE_OAUTH_CLIENT_ID", None)
        if not client_id:
            return Response(
                {"detail": "Google sign-in is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            payload = google_id_token.verify_oauth2_token(
                serializer.validated_data["credential"],
                google_requests.Request(),
                client_id,
            )
        except ValueError:
            return Response(
                {"detail": "Invalid or expired Google credential."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not payload.get("email_verified"):
            return Response(
                {"detail": "Your Google account's email address is not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = payload["email"].lower()
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": payload.get("given_name", ""),
                "last_name": payload.get("family_name", ""),
            },
        )
        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])

        login(request, user)
        return Response(
            UserSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class PasswordResetRequestView(APIView):
    """
    Always returns the same generic response regardless of whether the
    email exists, is Google-only (has_usable_password() False), or is
    inactive — this endpoint must never leak which of those is true.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()

        user = User.objects.filter(email=email).first()
        if user is not None and user.is_active and user.has_usable_password():
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_ORIGIN}/reset-password/{uid}/{token}"
            send_mail(
                subject="Reset your Heart Risk AI password",
                message=(
                    "Someone requested a password reset for this account.\n\n"
                    f"Reset your password: {reset_url}\n\n"
                    "If you didn't request this, you can safely ignore this email — "
                    "your password will stay unchanged."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
            )

        return Response({"detail": PASSWORD_RESET_SENT_MESSAGE})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({"detail": PASSWORD_RESET_INVALID_MESSAGE}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"detail": PASSWORD_RESET_INVALID_MESSAGE}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordChangeView(APIView):
    """
    Change password (existing usable password) or set one for the first
    time (Google-only account). The current-password check is only
    enforced in the former case.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if user.has_usable_password():
            current_password = serializer.validated_data.get("current_password", "")
            if not current_password or not user.check_password(current_password):
                return Response(
                    {"current_password": ["Current password is incorrect."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        # Without this, changing the password invalidates the session's
        # auth hash and the user is immediately logged out by their own
        # password-change request.
        update_session_auth_hash(request, user)
        return Response(UserSerializer(user, context={"request": request}).data)


class AccountDeleteView(APIView):
    """
    Permanently deletes the caller's own account (and, via
    Prediction.user's on_delete=CASCADE, every prediction they made).
    Requires their current password as confirmation when they have one;
    Google-only accounts (no usable password) just confirm via the
    frontend's own "type DELETE" style prompt, enforced client-side.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AccountDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user

        if user.has_usable_password():
            password = serializer.validated_data.get("password", "")
            if not password or not user.check_password(password):
                return Response(
                    {"password": ["Password is incorrect."]}, status=status.HTTP_400_BAD_REQUEST
                )

        logout(request)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """
    Deliberately AllowAny + a manual is_authenticated check, rather than
    IsAuthenticated: DRF's SessionAuthentication has no authenticate_header,
    so an IsAuthenticated 401 becomes a misleading 403. The frontend's
    useCurrentUser() expects a real 401 for "logged out".
    """

    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={"request": request}).data)


class AvatarUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = request.FILES.get("avatar")
        if upload is None:
            return Response({"avatar": ["No file provided."]}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > MAX_AVATAR_BYTES:
            return Response(
                {"avatar": ["Image must be smaller than 5 MB."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            image = Image.open(upload)
            image.verify()
        except UnidentifiedImageError:
            return Response(
                {"avatar": ["File is not a valid image."]}, status=status.HTTP_400_BAD_REQUEST
            )
        upload.seek(0)

        request.user.avatar = upload
        request.user.save(update_fields=["avatar"])
        return Response(UserSerializer(request.user, context={"request": request}).data)
