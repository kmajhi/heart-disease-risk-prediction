"""
SHAP explanation helpers for the frozen ML-5 pipelines. Wraps the
already-fitted XGBoost booster inside each pipeline with shap.TreeExplainer
— never retrains, refits, or otherwise modifies the model.
"""
import json
from pathlib import Path

import numpy as np
import pandas as pd
import shap


def build_explainer(pipeline):
    """Wraps the pipeline's fitted model only — read-only with respect to the model."""
    return shap.TreeExplainer(pipeline.named_steps["model"])


def _clean_feature_name(name: str) -> str:
    """Strips ColumnTransformer's 'num__'/'bin__'/'cat__' prefixes and
    collapses one-hot Sex_M/Sex_F into a single 'Sex' label."""
    for prefix in ("num__", "bin__", "cat__"):
        if name.startswith(prefix):
            name = name[len(prefix):]
    return "Sex" if name.startswith("Sex_") else name


def explain_prediction(pipeline, explainer, raw_row: dict, top_n: int = 5) -> dict:
    """
    raw_row: {training-column-name: value} for exactly this tier's features.

    Returns the top_n features ranked by absolute SHAP contribution.
    `direction` describes how each feature pushed THIS model's estimate,
    phrased as "increases/decreases model-estimated risk" — never a causal
    or diagnostic claim ("X contributed to a higher estimate", not
    "X caused the condition").
    """
    frame = pd.DataFrame([raw_row])
    preprocess = pipeline.named_steps["preprocess"]
    transformed = preprocess.transform(frame)
    feature_names = preprocess.get_feature_names_out()

    shap_values = explainer.shap_values(transformed)
    values = np.asarray(shap_values).reshape(-1)

    contributions: dict[str, float] = {}
    for name, value in zip(feature_names, values):
        if "missingindicator" in name:
            continue  # every field is required at prediction time; not meaningful to show
        clean_name = _clean_feature_name(name)
        contributions[clean_name] = contributions.get(clean_name, 0.0) + float(value)

    ranked = sorted(contributions.items(), key=lambda kv: abs(kv[1]), reverse=True)[:top_n]

    return {
        "top_factors": [
            {
                "feature": feature,
                "value": raw_row.get(feature),
                "contribution": round(contribution, 4),
                "direction": "increases_risk" if contribution > 0 else "decreases_risk",
            }
            for feature, contribution in ranked
        ]
    }


def load_global_importance(path: Path) -> list:
    """Reads a precomputed global-importance file (see scripts/generate_shap_global.py).
    Returns [] if it hasn't been generated yet, rather than failing a request."""
    path = Path(path)
    if not path.exists():
        return []
    return json.loads(path.read_text())
