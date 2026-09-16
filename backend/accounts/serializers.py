from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    # True for a normal email/password account; False for an account
    # provisioned via Google sign-in that never set a password — the
    # frontend uses this to show "Signed in with Google" vs. a change-
    # password form on the account settings page.
    has_usable_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "avatar",
            "share_preferences",
            "role",
            "date_joined",
            "has_usable_password",
        ]
        read_only_fields = ["id", "email", "avatar", "role", "date_joined", "has_usable_password"]

    def get_has_usable_password(self, obj):
        return obj.has_usable_password()


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return email

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleLoginSerializer(serializers.Serializer):
    # The ID token (a signed JWT) returned by Google Identity Services on
    # the frontend — verified server-side in GoogleLoginView, never trusted
    # as-is.
    credential = serializers.CharField()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class PasswordChangeSerializer(serializers.Serializer):
    # Not required: an account with no usable password yet (Google-only)
    # is *setting* a password for the first time, so there is nothing to
    # confirm — PasswordChangeView enforces the current-password check
    # only when the account already has one.
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])


class AccountDeleteSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "share_preferences"]
