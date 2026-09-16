"""
One-off offline script: precomputes GLOBAL SHAP feature importance for each
frozen ML-5 tier pipeline, against the same 828-row development set the
pipelines were fit on (notebooks/ml5_dev.pkl), and writes the result to
artifacts/<tier>_shap_global.json.

This is intentionally NOT run in the request path — the backend loads the
static JSON output of this script (predictions/inference.py ->
shap_utils.load_global_importance), so no training data ships with the
deployed app and no per-request recomputation is needed.

Does not retrain or modify the models — shap.TreeExplainer only inspects
the already-fitted booster inside each pipeline (same reuse as
predictions/shap_utils.py, imported directly here so the aggregation logic
is identical to what the backend uses for per-prediction explanations).

Run from the project root with the backend venv:
    backend/.venv/Scripts/python.exe scripts/generate_shap_global.py
"""
import json
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

import joblib  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402

from predictions import shap_utils  # noqa: E402
from predictions.serializers import BASIC_FIELD_TO_COLUMN, ENHANCED_FIELD_TO_COLUMN  # noqa: E402

ARTIFACTS_DIR = PROJECT_ROOT / "artifacts"
DEV_SET_PATH = PROJECT_ROOT / "notebooks" / "ml5_dev.pkl"

TIERS = {
    "basic": {
        "pipeline_path": ARTIFACTS_DIR / "a_basic_xgboost_pipeline.joblib",
        "field_to_column": BASIC_FIELD_TO_COLUMN,
        "out_path": ARTIFACTS_DIR / "a_basic_shap_global.json",
    },
    "enhanced": {
        "pipeline_path": ARTIFACTS_DIR / "b_enhanced_xgboost_pipeline.joblib",
        "field_to_column": ENHANCED_FIELD_TO_COLUMN,
        "out_path": ARTIFACTS_DIR / "b_enhanced_shap_global.json",
    },
}


def main():
    dev_df = pd.read_pickle(DEV_SET_PATH)
    print(f"Loaded dev set: {dev_df.shape}")

    for tier, config in TIERS.items():
        pipeline = joblib.load(config["pipeline_path"])
        columns = list(config["field_to_column"].values())
        frame = dev_df[columns]

        preprocess = pipeline.named_steps["preprocess"]
        transformed = preprocess.transform(frame)
        feature_names = preprocess.get_feature_names_out()

        explainer = shap_utils.build_explainer(pipeline)
        shap_values = np.asarray(explainer.shap_values(transformed))

        mean_abs: dict[str, float] = {}
        for i, name in enumerate(feature_names):
            if "missingindicator" in name:
                continue
            clean_name = shap_utils._clean_feature_name(name)
            mean_abs[clean_name] = mean_abs.get(clean_name, 0.0) + float(np.abs(shap_values[:, i]).mean())

        ranked = sorted(mean_abs.items(), key=lambda kv: kv[1], reverse=True)
        result = [{"feature": f, "mean_abs_shap": round(v, 4)} for f, v in ranked]

        config["out_path"].write_text(json.dumps(result, indent=2))
        print(f"{tier}: wrote {config['out_path']} ({len(result)} features)")
        for r in result:
            print(f"    {r['feature']:24s} {r['mean_abs_shap']:.4f}")


if __name__ == "__main__":
    main()
