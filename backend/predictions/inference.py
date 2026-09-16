"""
Loads the frozen ML-5 tier pipelines + metadata from artifacts/ (NOT the
retired old model under Resource files/.../) once per tier, cached, and
runs single-record predictions + SHAP explanations.

The OLD single-tier model is never loaded here — it is retired from new
predictions (see predictions/views.py) but its artifacts remain on disk
untouched, as historical research material.
"""
import json
import logging
from functools import lru_cache
from pathlib import Path

import joblib
import pandas as pd

from . import shap_utils
from .serializers import BASIC_FIELD_TO_COLUMN, ENHANCED_FIELD_TO_COLUMN

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "artifacts"

TIER_CONFIG = {
    "basic": {
        "pipeline_path": ARTIFACTS_DIR / "a_basic_xgboost_pipeline.joblib",
        "metadata_path": ARTIFACTS_DIR / "a_basic_model_metadata.json",
        "metadata_key": "A_Basic",
        "global_shap_path": ARTIFACTS_DIR / "a_basic_shap_global.json",
        "field_to_column": BASIC_FIELD_TO_COLUMN,
    },
    "enhanced": {
        "pipeline_path": ARTIFACTS_DIR / "b_enhanced_xgboost_pipeline.joblib",
        "metadata_path": ARTIFACTS_DIR / "b_enhanced_model_metadata.json",
        "metadata_key": "B_Enhanced",
        "global_shap_path": ARTIFACTS_DIR / "b_enhanced_shap_global.json",
        "field_to_column": ENHANCED_FIELD_TO_COLUMN,
    },
}


class ModelUnavailableError(Exception):
    """Raised when a tier's pipeline/metadata can't be loaded or a
    prediction otherwise fails. Callers (views.py) must turn this into a
    sanitized 503 — never let the underlying exception reach the client."""


@lru_cache(maxsize=len(TIER_CONFIG))
def _load_tier(tier: str) -> dict:
    if tier not in TIER_CONFIG:
        raise ValueError(f"Unknown tier: {tier}")
    config = TIER_CONFIG[tier]
    try:
        pipeline = joblib.load(config["pipeline_path"])
        metadata = json.loads(config["metadata_path"].read_text())
        model_meta = metadata["models"][config["metadata_key"]]
        explainer = shap_utils.build_explainer(pipeline)
        global_importance = shap_utils.load_global_importance(config["global_shap_path"])
    except Exception:
        logger.exception("Failed to load ML-5 '%s' tier artifacts", tier)
        raise ModelUnavailableError(tier)

    return {
        "pipeline": pipeline,
        "threshold": model_meta["threshold"]["chosen"],
        "algorithm": model_meta["algorithm"],
        "explainer": explainer,
        "field_to_column": config["field_to_column"],
        "global_importance": global_importance,
    }


def _model_version(tier: str, algorithm: str) -> str:
    return f"{algorithm} ({tier.capitalize()})"


def compute_bmi(height_cm: float, weight_kg: float) -> float:
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 1)


def risk_label(probability: float, threshold: float) -> str:
    if probability >= threshold:
        return "High"
    if probability >= 0.3:
        return "Moderate"
    return "Low"


def get_global_importance(tier: str) -> list:
    return _load_tier(tier)["global_importance"]


def predict(tier: str, validated_data: dict) -> dict:
    """
    validated_data: a tier serializer's validated_data (snake_case API
    field names -> values). Builds the pipeline's input using exactly the
    documented tier schema (BASIC_FIELD_TO_COLUMN / ENHANCED_FIELD_TO_COLUMN)
    — deliberately not pipeline.feature_names_in_, which lists 29 unrelated
    training-time columns that are not a runtime requirement (verified
    during the ML-6 integration audit).
    """
    tier_state = _load_tier(tier)
    field_to_column = tier_state["field_to_column"]
    # Booleans must become 0.0/1.0 floats to match the training dtype —
    # SimpleImputer (numeric branch) rejects a native Python bool column.
    row = {}
    for field, column in field_to_column.items():
        value = validated_data[field]
        row[column] = float(value) if isinstance(value, bool) else value

    try:
        frame = pd.DataFrame([row])[list(field_to_column.values())]
        probability = float(tier_state["pipeline"].predict_proba(frame)[0, 1])
        explanation = shap_utils.explain_prediction(tier_state["pipeline"], tier_state["explainer"], row)
    except Exception:
        logger.exception("Prediction failed for tier=%s", tier)
        raise ModelUnavailableError(tier)

    threshold = tier_state["threshold"]
    bmi = compute_bmi(validated_data["height_cm"], validated_data["weight_kg"])

    return {
        "probability": probability,
        "prediction": probability >= threshold,
        "risk_label": risk_label(probability, threshold),
        "threshold_used": threshold,
        "model_version": _model_version(tier, tier_state["algorithm"]),
        "bmi": bmi,
        "explanation": explanation,
    }
