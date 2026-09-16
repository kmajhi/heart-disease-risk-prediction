from rest_framework import serializers

from .models import Prediction

# snake_case API field name -> exact column name the ML-5 pipelines expect.
# Raw column names like "BP(mmHg)" aren't valid Python/JS identifiers, so
# this explicit table is the single place the two naming schemes are
# bridged. Scoped per tier (not one flat 24-field table) since the old
# single-tier model is retired.
BASIC_FIELD_TO_COLUMN = {
    "age": "Age",
    "sex": "Sex",
    "height_cm": "Height (cm)",
    "weight_kg": "Weight (kg)",
    "bp": "BP(mmHg)",
    "family_history": "Family H/O",
    "hypertension": "Hypertension",
    "diabetes": "Diabetes",
    "chest_pain_history": "H/O ChestPain",
}

ENHANCED_FIELD_TO_COLUMN = {
    **BASIC_FIELD_TO_COLUMN,
    "total_cholesterol": "Total_Cholesterol(mg/dL)",
    "ldl": "LDL(mg/dL)",
    "triglycerides": "Triglycerides(mg/dL)",
    "rbs": "RBS(mmol/L)",
}


class BasicPredictionInputSerializer(serializers.Serializer):
    """
    ML-5 Basic tier — 9 fields, frozen XGBoost pipeline, threshold 0.4681.
    Field bounds are wide sanity guardrails against fat-finger input (e.g. a
    negative age), not clinical judgement thresholds. BMI is deliberately
    not a field here — it is computed server-side from height/weight for
    display only and is never a model input.
    """

    age = serializers.IntegerField(min_value=1, max_value=120)
    sex = serializers.ChoiceField(choices=["M", "F"])
    height_cm = serializers.FloatField(min_value=50, max_value=250)
    weight_kg = serializers.FloatField(min_value=10, max_value=300)
    bp = serializers.FloatField(min_value=40, max_value=300)
    family_history = serializers.BooleanField()
    hypertension = serializers.BooleanField()
    diabetes = serializers.BooleanField()
    chest_pain_history = serializers.BooleanField()

    field_to_column = BASIC_FIELD_TO_COLUMN

    def to_pipeline_row(self) -> dict:
        return {
            column: self.validated_data[field]
            for field, column in self.field_to_column.items()
        }


class EnhancedPredictionInputSerializer(BasicPredictionInputSerializer):
    """ML-5 Enhanced tier — Basic's 9 fields plus 4 lab values, threshold 0.3335."""

    total_cholesterol = serializers.FloatField(min_value=0, max_value=1000)
    ldl = serializers.FloatField(min_value=0, max_value=400)
    triglycerides = serializers.FloatField(min_value=0, max_value=1000)
    rbs = serializers.FloatField(min_value=0, max_value=50)

    field_to_column = ENHANCED_FIELD_TO_COLUMN


TIER_SERIALIZERS = {
    Prediction.Tier.BASIC: BasicPredictionInputSerializer,
    Prediction.Tier.ENHANCED: EnhancedPredictionInputSerializer,
}


class PredictionSerializer(serializers.ModelSerializer):
    input = serializers.JSONField(source="input_data")

    class Meta:
        model = Prediction
        fields = [
            "id",
            "tier",
            "prediction",
            "probability",
            "risk_label",
            "bmi",
            "model_version",
            "threshold_used",
            "explanation",
            "created_at",
            "input",
        ]
        read_only_fields = fields
