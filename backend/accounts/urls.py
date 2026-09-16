from django.urls import path

from .views import (
    AccountDeleteView,
    AvatarUploadView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    MeView,
    PasswordChangeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path(
        "password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth-password-reset-confirm",
    ),
    path("password/change/", PasswordChangeView.as_view(), name="auth-password-change"),
    path("me/delete/", AccountDeleteView.as_view(), name="auth-me-delete"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("me/avatar/", AvatarUploadView.as_view(), name="auth-me-avatar"),
]
