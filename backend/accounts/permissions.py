from rest_framework.permissions import BasePermission

from .models import User


class IsAdmin(BasePermission):
    """Backend-enforced counterpart to the frontend's AdminRoute — that
    route only hides the link/page in the UI, it does not itself protect
    the API, so admin-only endpoints must check this independently."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == User.Role.ADMIN
        )
