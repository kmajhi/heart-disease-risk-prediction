from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from predictions.views import AdminStatsView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/predictions/", include("predictions.urls")),
    path("api/admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
