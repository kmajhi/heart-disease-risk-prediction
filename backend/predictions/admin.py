from django.contrib import admin

from .models import Prediction


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "tier", "risk_label", "probability", "prediction", "created_at")
    list_filter = ("tier", "risk_label", "prediction")
    readonly_fields = [f.name for f in Prediction._meta.fields]
