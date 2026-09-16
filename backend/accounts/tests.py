import io
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


def make_test_image(name="avatar.png"):
    buffer = io.BytesIO()
    Image.new("RGB", (10, 10), color="red").save(buffer, format="PNG")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/png")


class AvatarUploadTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="avatar@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)

    def test_upload_avatar_persists_and_returned_by_me(self):
        response = self.client.post(
            "/api/auth/me/avatar/", {"avatar": make_test_image()}, format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["avatar"])

        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)
        self.assertTrue(me.data["avatar"])

    def test_non_image_file_rejected(self):
        bad_file = SimpleUploadedFile("not-an-image.txt", b"hello world", content_type="text/plain")
        response = self.client.post("/api/auth/me/avatar/", {"avatar": bad_file}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("avatar", response.data)

    def test_avatar_upload_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/api/auth/me/avatar/", {"avatar": make_test_image()}, format="multipart"
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class SharePreferencesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="prefs@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)

    def test_share_preferences_round_trip_through_me_patch(self):
        response = self.client.patch(
            "/api/auth/me/",
            {"share_preferences": {"twitter": True, "linkedin": False}},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["share_preferences"], {"twitter": True, "linkedin": False})

        self.user.refresh_from_db()
        self.assertEqual(self.user.share_preferences, {"twitter": True, "linkedin": False})


class GoogleLoginTests(APITestCase):
    def _payload(self, **overrides):
        payload = {
            "email": "googleuser@example.com",
            "email_verified": True,
            "given_name": "Google",
            "family_name": "User",
        }
        payload.update(overrides)
        return payload

    def test_not_configured_returns_503(self):
        response = self.client.post("/api/auth/google/", {"credential": "token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client-id")
    @patch("accounts.views.google_id_token.verify_oauth2_token")
    def test_first_time_google_login_creates_account_without_separate_registration(self, mock_verify):
        mock_verify.return_value = self._payload()
        response = self.client.post("/api/auth/google/", {"credential": "token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "googleuser@example.com")
        self.assertEqual(response.data["first_name"], "Google")

        user = User.objects.get(email="googleuser@example.com")
        self.assertFalse(user.has_usable_password())

        # The session created by login() actually authenticates them.
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client-id")
    @patch("accounts.views.google_id_token.verify_oauth2_token")
    def test_existing_account_signs_in_without_duplicating(self, mock_verify):
        User.objects.create_user(email="googleuser@example.com", password="TestPass123!")
        mock_verify.return_value = self._payload()

        response = self.client.post("/api/auth/google/", {"credential": "token"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(email="googleuser@example.com").count(), 1)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client-id")
    @patch("accounts.views.google_id_token.verify_oauth2_token")
    def test_invalid_credential_rejected(self, mock_verify):
        mock_verify.side_effect = ValueError("bad token")
        response = self.client.post("/api/auth/google/", {"credential": "token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(GOOGLE_OAUTH_CLIENT_ID="test-client-id")
    @patch("accounts.views.google_id_token.verify_oauth2_token")
    def test_unverified_email_rejected(self, mock_verify):
        mock_verify.return_value = self._payload(email_verified=False)
        response = self.client.post("/api/auth/google/", {"credential": "token"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="reset@example.com", password="OldPass123!")

    def _extract_uid_token(self, email_body):
        # "...reset-password/<uid>/<token>\n\n..."
        url_line = next(line for line in email_body.splitlines() if "/reset-password/" in line)
        path = url_line.split("/reset-password/", 1)[1].strip()
        uid, token = path.split("/", 1)
        return uid, token

    def test_request_always_returns_generic_message(self):
        response = self.client.post(
            "/api/auth/password-reset/", {"email": "nobody@example.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("detail", response.data)

    def test_request_for_real_account_sends_email_and_full_flow_works(self):
        from django.core import mail

        response = self.client.post(
            "/api/auth/password-reset/", {"email": "reset@example.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        uid, token = self._extract_uid_token(mail.outbox[0].body)
        confirm = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(confirm.status_code, status.HTTP_204_NO_CONTENT)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass456!"))

        # The token is single-use — replaying it must fail.
        replay = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": token, "new_password": "AnotherPass789!"},
            format="json",
        )
        self.assertEqual(replay.status_code, status.HTTP_400_BAD_REQUEST)

    def test_google_only_account_gets_no_email(self):
        from django.core import mail

        google_user = User.objects.create_user(email="googleonly@example.com", password=None)
        google_user.set_unusable_password()
        google_user.save()

        response = self.client.post(
            "/api/auth/password-reset/", {"email": "googleonly@example.com"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

    def test_invalid_token_rejected(self):
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        response = self.client.post(
            "/api/auth/password-reset/confirm/",
            {"uid": uid, "token": "not-a-real-token", "new_password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordChangeTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="changepw@example.com", password="OldPass123!")
        self.client.force_authenticate(user=self.user)

    def test_requires_correct_current_password(self):
        response = self.client.post(
            "/api/auth/password/change/",
            {"current_password": "WrongPass!", "new_password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_changes_password_and_keeps_session_valid(self):
        response = self.client.post(
            "/api/auth/password/change/",
            {"current_password": "OldPass123!", "new_password": "BrandNewPass456!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("BrandNewPass456!"))

        # update_session_auth_hash must have kept the existing session alive.
        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, status.HTTP_200_OK)

    def test_google_only_account_can_set_a_password_without_current_password(self):
        google_user = User.objects.create_user(email="googleonly2@example.com", password=None)
        self.client.force_authenticate(user=google_user)

        response = self.client.post(
            "/api/auth/password/change/", {"new_password": "BrandNewPass456!"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["has_usable_password"], True)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            "/api/auth/password/change/",
            {"current_password": "OldPass123!", "new_password": "BrandNewPass456!"},
            format="json",
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class AccountDeleteTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="deleteme@example.com", password="MyPass123!")
        self.client.force_authenticate(user=self.user)

    def test_requires_correct_password(self):
        response = self.client.post("/api/auth/me/delete/", {"password": "WrongPass!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(User.objects.filter(pk=self.user.pk).exists())

    def test_deletes_account_and_logs_out(self):
        # A real session login (not force_authenticate, which stubs
        # request.user in-memory and would keep "authenticating" as the
        # since-deleted user) — this exercises the actual logout()+delete()
        # session-invalidation behavior an API client would see.
        self.client.logout()
        self.client.login(email="deleteme@example.com", password="MyPass123!")

        response = self.client.post("/api/auth/me/delete/", {"password": "MyPass123!"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())

        me = self.client.get("/api/auth/me/")
        self.assertEqual(me.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_deletes_predictions_too(self):
        from predictions.models import Prediction

        Prediction.objects.create(
            user=self.user,
            tier="basic",
            input_data={},
            probability=0.5,
            risk_label="Moderate",
            prediction=False,
            model_version="test",
            threshold_used=0.5,
        )
        self.client.post("/api/auth/me/delete/", {"password": "MyPass123!"}, format="json")
        self.assertEqual(Prediction.objects.filter(user_id=self.user.pk).count(), 0)

    def test_google_only_account_deletes_without_password(self):
        google_user = User.objects.create_user(email="googleonly3@example.com", password=None)
        self.client.force_authenticate(user=google_user)
        response = self.client.post("/api/auth/me/delete/", {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
