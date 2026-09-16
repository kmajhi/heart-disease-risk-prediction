from django.urls import path

from .views import (
    PredictionCreateView,
    PredictionDetailView,
    PredictionExplanationView,
    PredictionReportView,
)

urlpatterns = [
    path("", PredictionCreateView.as_view(), name="prediction-create"),
    path("<int:pk>/", PredictionDetailView.as_view(), name="prediction-detail"),
    path("<int:pk>/explanation/", PredictionExplanationView.as_view(), name="prediction-explanation"),
    path("<int:pk>/report/", PredictionReportView.as_view(), name="prediction-report"),
]
