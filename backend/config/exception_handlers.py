import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def safe_exception_handler(exc, context):
    """
    DRF's default handler only recognizes APIException/Http404/PermissionDenied
    and otherwise re-raises, letting Django's DEBUG=True error page (a full
    HTML traceback) reach the client on any genuinely unexpected exception.
    This wraps it so every API response — including truly unhandled bugs —
    stays a sanitized JSON error, regardless of DEBUG. Nothing about the
    underlying exception is exposed; it is logged server-side only.
    """
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    logger.exception("Unhandled exception in API view", exc_info=exc)
    return Response(
        {"detail": "An unexpected error occurred. Please try again."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
