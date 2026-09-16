from django.conf import settings
from django.db import models


class Prediction(models.Model):
    class Tier(models.TextChoices):
        LEGACY = "legacy", "Legacy (retired single-tier model)"
        BASIC = "basic", "Basic"
        ENHANCED = "enhanced", "Enhanced"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="predictions"
    )
    # Existing rows predate the tier concept and are backfilled to LEGACY by
    # the migration. New rows must always explicitly pass tier="basic" or
    # "enhanced" — the field default exists only to make that migration safe,
    # application code never relies on it for a real create.
    tier = models.CharField(max_length=10, choices=Tier.choices, default=Tier.LEGACY)
    input_data = models.JSONField()
    probability = models.FloatField()
    risk_label = models.CharField(max_length=20)
    prediction = models.BooleanField()
    model_version = models.CharField(max_length=100)
    threshold_used = models.FloatField()
    # New for ML-5 tiers. Null for legacy rows (the old schema stored bmi
    # inside input_data instead, and never computed a SHAP explanation).
    bmi = models.FloatField(null=True, blank=True)
    explanation = models.JSONField(null=True, blank=True)
    # LLM Explanation Layer (Web App Feature Scope.md §5). Null until first
    # requested via GET .../explanation/, then cached here permanently so a
    # given prediction never re-calls the LLM API more than once.
    llm_summary = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Prediction({self.id}, user={self.user_id}, tier={self.tier}, risk={self.risk_label})"
