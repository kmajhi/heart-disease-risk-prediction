"""
LLM Explanation Layer (Web App Feature Scope.md §5).

Guardrail, enforced structurally: generate_explanation() only accepts the
ML pipeline's own output (probability, risk_label, prediction, tier, SHAP
top_factors). It has no parameter for raw patient input (age, sex, BP, ...),
so that data cannot reach the LLM through this function no matter what the
caller has on hand. The prompt template below is fixed and not user- or
DB-editable, per the "fixed, reviewed prompt template, not open-ended chat"
requirement.
"""
import os

from django.conf import settings
from google import genai
from google.genai import types
from google.genai.errors import APIError

# "-latest" alias (per Google's own AI Studio-generated quickstart for this
# key) rather than a pinned dated ID — pinned IDs returned spurious 401s
# against this key/project during verification, the alias didn't.
MODEL_NAME = "gemini-flash-latest"

# Mirrors frontend/src/features/prediction-result/ExplanationCard.tsx's
# FEATURE_LABELS map, so the LLM prompt uses the same human-readable names
# already shown to the user in the SHAP bars.
FEATURE_LABELS = {
    "Age": "Age",
    "Sex": "Sex",
    "Height (cm)": "Height",
    "Weight (kg)": "Weight",
    "BP(mmHg)": "Blood pressure",
    "Family H/O": "Family history",
    "Hypertension": "Hypertension",
    "Diabetes": "Diabetes",
    "H/O ChestPain": "Chest pain history",
    "Total_Cholesterol(mg/dL)": "Total cholesterol",
    "LDL(mg/dL)": "LDL",
    "Triglycerides(mg/dL)": "Triglycerides",
    "RBS(mmol/L)": "Random blood sugar",
}

SYSTEM_INSTRUCTION = """You are a plain-language explanation writer for a heart disease risk \
screening research prototype. You are given ONLY a machine-learning model's own output for one \
prediction: its estimated probability, risk label, and the statistical factors it weighted most \
heavily. You are NOT given the patient's raw data, medical history, or any other information, and \
you must never claim or imply you have more information than what is given below.

Write a short, plain-English summary (3-4 sentences, no medical jargon) that:
1. States the risk label and probability in plain language.
2. Names the one or two factors that contributed most, using strictly non-causal phrasing such as \
"contributed to a higher/lower model-estimated risk" or "was weighted heavily by the model" — never \
"causes", "leads to", or other diagnostic/causal language.
3. Explicitly states this is a statistical model estimate, not a medical diagnosis.

Do not invent any clinical facts beyond what is listed below. Do not recommend any treatment, \
medication, or lifestyle change. Do not address the reader as a specific named person. Output only \
the summary paragraph, nothing else."""


class LlmUnavailableError(Exception):
    """Raised whenever the LLM explanation cannot be generated for any reason."""


def _client() -> genai.Client:
    api_key = getattr(settings, "GEMINI_API_KEY", None) or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise LlmUnavailableError("GEMINI_API_KEY is not configured.")
    return genai.Client(api_key=api_key)


def _format_factors(top_factors: list[dict]) -> str:
    lines = []
    for factor in top_factors:
        label = FEATURE_LABELS.get(factor["feature"], factor["feature"])
        direction = "higher" if factor["direction"] == "increases_risk" else "lower"
        lines.append(f"- {label}: contributed to {direction} model-estimated risk")
    return "\n".join(lines)


def generate_explanation(
    *,
    probability: float,
    risk_label: str,
    prediction: bool,
    tier: str,
    top_factors: list[dict],
) -> str:
    content = (
        f"Model output for this prediction (tier: {tier}):\n"
        f"- Estimated probability: {probability:.2f}\n"
        f"- Risk label: {risk_label}\n"
        f"- Classification at the model's threshold: {'Positive' if prediction else 'Negative'}\n"
        f"- Top contributing factors:\n{_format_factors(top_factors)}\n"
    )

    try:
        client = _client()
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=content,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
                max_output_tokens=300,
                # This is a short, fixed-template restatement task, not a
                # reasoning task — thinking tokens were otherwise consuming
                # the whole max_output_tokens budget and truncating the
                # visible summary before it finished.
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
    except APIError as exc:
        raise LlmUnavailableError(str(exc)) from exc
    except LlmUnavailableError:
        raise
    except Exception as exc:  # network errors, SDK-internal errors, etc.
        raise LlmUnavailableError(str(exc)) from exc

    text = (response.text or "").strip()
    if not text:
        raise LlmUnavailableError("Empty response from LLM.")
    return text
