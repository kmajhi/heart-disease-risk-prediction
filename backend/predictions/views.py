import logging
from datetime import timedelta

from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin

from . import inference, llm_service, report
from .models import Prediction
from .serializers import TIER_SERIALIZERS, PredictionSerializer

logger = logging.getLogger(__name__)

SERVICE_UNAVAILABLE_MESSAGE = "Prediction service is temporarily unavailable. Please try again shortly."
LLM_UNAVAILABLE_MESSAGE = "AI explanation is temporarily unavailable. Please try again shortly."


class PredictionCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # History page (Web App Feature Scope.md §7) — a log of the
        # caller's own predictions, newest first (Prediction.Meta.ordering).
        predictions = Prediction.objects.filter(user=request.user)
        return Response(PredictionSerializer(predictions, many=True).data)

    def post(self, request):
        tier = request.data.get("tier")
        # "legacy" is a historical marker on old rows only — it must never
        # be accepted as a tier for a new prediction.
        serializer_cls = TIER_SERIALIZERS.get(tier)
        if serializer_cls is None:
            return Response(
                {"tier": ['Must be "basic" or "enhanced".']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        input_serializer = serializer_cls(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        try:
            result = inference.predict(tier, input_serializer.validated_data)
        except inference.ModelUnavailableError:
            logger.error("Prediction unavailable for tier=%s", tier)
            return Response(
                {"detail": SERVICE_UNAVAILABLE_MESSAGE},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        prediction = Prediction.objects.create(
            user=request.user,
            tier=tier,
            input_data=input_serializer.validated_data,
            probability=result["probability"],
            risk_label=result["risk_label"],
            prediction=result["prediction"],
            model_version=result["model_version"],
            threshold_used=result["threshold_used"],
            bmi=result["bmi"],
            explanation=result["explanation"],
        )
        return Response(
            PredictionSerializer(prediction).data, status=status.HTTP_201_CREATED
        )


class PredictionDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PredictionSerializer

    def get_queryset(self):
        # Owner-scoped: a mismatched id 404s rather than 403ing, so a
        # prediction's existence for another user is never leaked.
        return Prediction.objects.filter(user=self.request.user)


class PredictionExplanationView(APIView):
    """
    LLM Explanation Layer (Web App Feature Scope.md §5). Lazy: generated on
    first GET, then cached on the row so a given prediction never calls the
    LLM more than once. Legacy rows have no SHAP data, so there is nothing
    for the LLM to explain — 404, never fabricated.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            prediction = Prediction.objects.get(pk=pk, user=request.user)
        except Prediction.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if prediction.tier == Prediction.Tier.LEGACY or prediction.explanation is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if prediction.llm_summary:
            return Response({"llm_summary": prediction.llm_summary})

        try:
            summary = llm_service.generate_explanation(
                probability=prediction.probability,
                risk_label=prediction.risk_label,
                prediction=prediction.prediction,
                tier=prediction.tier,
                top_factors=prediction.explanation["top_factors"],
            )
        except llm_service.LlmUnavailableError:
            logger.error("LLM explanation unavailable for prediction=%s", pk)
            return Response(
                {"detail": LLM_UNAVAILABLE_MESSAGE},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        prediction.llm_summary = summary
        prediction.save(update_fields=["llm_summary"])
        return Response({"llm_summary": summary})


class AdminStatsView(APIView):
    """
    Real, aggregate-only usage/model statistics for the admin dashboard —
    counts and averages computed live from actual rows, never fabricated
    or hardcoded. No per-user PII beyond aggregate counts is exposed.
    """

    permission_classes = [IsAdmin]

    def get(self, request):
        predictions = Prediction.objects.all()

        tier_counts = dict(predictions.values_list("tier").annotate(count=Count("id")))
        risk_label_counts = dict(
            predictions.values_list("risk_label").annotate(count=Count("id"))
        )
        model_version_counts = [
            {"model_version": row["model_version"], "count": row["count"]}
            for row in predictions.values("model_version").annotate(count=Count("id")).order_by("-count")
        ]

        window_start = timezone.now() - timedelta(days=13)
        per_day = (
            predictions.filter(created_at__gte=window_start)
            .annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        per_day_map = {row["date"].isoformat(): row["count"] for row in per_day}
        today = timezone.localdate()
        predictions_per_day = [
            {"date": (today - timedelta(days=offset)).isoformat(), "count": per_day_map.get((today - timedelta(days=offset)).isoformat(), 0)}
            for offset in range(13, -1, -1)
        ]

        average_probability = predictions.aggregate(avg=Avg("probability"))["avg"]

        return Response(
            {
                "total_users": User.objects.count(),
                "total_predictions": predictions.count(),
                "predictions_last_7_days": predictions.filter(
                    created_at__gte=timezone.now() - timedelta(days=7)
                ).count(),
                "tier_counts": {
                    "basic": tier_counts.get(Prediction.Tier.BASIC, 0),
                    "enhanced": tier_counts.get(Prediction.Tier.ENHANCED, 0),
                    "legacy": tier_counts.get(Prediction.Tier.LEGACY, 0),
                },
                "risk_label_counts": {
                    "Low": risk_label_counts.get("Low", 0),
                    "Moderate": risk_label_counts.get("Moderate", 0),
                    "High": risk_label_counts.get("High", 0),
                },
                "model_version_counts": model_version_counts,
                "predictions_per_day": predictions_per_day,
                "average_probability": round(average_probability, 4) if average_probability is not None else None,
            }
        )


class PredictionReportView(APIView):
    """PDF Report Generation (Web App Feature Scope.md §9)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            prediction = Prediction.objects.get(pk=pk, user=request.user)
        except Prediction.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        pdf_bytes = report.build_report_pdf(prediction)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="heart-risk-report-{pk}.pdf"'
        return response
