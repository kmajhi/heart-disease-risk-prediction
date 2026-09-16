"""
PDF Report Generation (Web App Feature Scope.md §9). Builds a downloadable
PDF for one Prediction: inputs, risk score/label, top SHAP factors, the
LLM plain-language summary (if already generated), model used, and the
standard disclaimer. Never triggers a new LLM call — only renders
`prediction.llm_summary` if it has already been cached by the explanation
endpoint.
"""
from io import BytesIO

from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .llm_service import FEATURE_LABELS

DISCLAIMER_TEXT = (
    "Research prototype. Not externally validated, not prospectively evaluated, "
    "and not approved for clinical use. This is not a medical diagnosis."
)

# Superset of labels across Basic/Enhanced/legacy inputs — mirrors
# frontend/src/features/prediction-result/PredictionMetaFooter.tsx exactly,
# since legacy rows can contain fields no longer in the active ML-5 schema.
FIELD_LABELS = {
    "age": "Age",
    "sex": "Sex",
    "height_cm": "Height (cm)",
    "weight_kg": "Weight (kg)",
    "bmi": "BMI",
    "family_history": "Family history",
    "hypertension": "Hypertension",
    "diabetes": "Diabetes",
    "total_cholesterol": "Total cholesterol (mg/dL)",
    "bp": "Blood pressure (mmHg)",
    "chest_pain_history": "Chest pain history",
    "rbs": "Random blood sugar (mmol/L)",
    "hdl": "HDL (mg/dL)",
    "ldl": "LDL (mg/dL)",
    "triglycerides": "Triglycerides (mg/dL)",
    "max_hr": "Max heart rate",
    "haemoglobin": "Haemoglobin (g/dL)",
    "creatinine": "Creatinine (mg/dL)",
    "platelets": "Platelets",
    "sodium": "Sodium (mmol/L)",
    "potassium": "Potassium (mmol/L)",
    "chloride": "Chloride (mmol/L)",
    "troponin_i": "Troponin-I (ng/mL)",
    "troponin_censored_high": "Troponin value censored",
}


def _field_label(key: str) -> str:
    if key in FIELD_LABELS:
        return FIELD_LABELS[key]
    return key.replace("_", " ").title()


def _format_value(value) -> str:
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)


def build_report_pdf(prediction) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )
    styles = getSampleStyleSheet()
    heading = ParagraphStyle("Heading", parent=styles["Heading1"], fontSize=18, spaceAfter=4)
    subheading = ParagraphStyle("Subheading", parent=styles["Heading2"], fontSize=13, spaceBefore=14, spaceAfter=6)
    body = styles["BodyText"]
    small = ParagraphStyle("Small", parent=styles["BodyText"], fontSize=8, textColor=colors.grey)
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=styles["BodyText"], fontSize=9, textColor=colors.HexColor("#92400e")
    )

    story = [
        Paragraph("Heart Risk AI — Prediction Report", heading),
        Paragraph(f"Generated {timezone.now().strftime('%Y-%m-%d %H:%M UTC')}", small),
        Spacer(1, 10),
        Paragraph(DISCLAIMER_TEXT, disclaimer_style),
        Spacer(1, 6),
    ]

    if prediction.tier == "legacy":
        story.append(
            Paragraph(
                "This prediction was produced by an earlier, retired single-tier model — "
                "not the current Basic/Enhanced system.",
                small,
            )
        )

    # --- Result summary ---
    summary_rows = [
        ["Tier", prediction.tier.capitalize()],
        ["Risk label", prediction.risk_label],
        ["Estimated probability", f"{prediction.probability * 100:.1f}%"],
        ["Model", prediction.model_version],
        ["Decision threshold", f"{prediction.threshold_used:.4f}"],
    ]
    if prediction.bmi is not None:
        summary_rows.append(["BMI (reference only, not a model input)", f"{prediction.bmi}"])
    story.append(KeepTogether([Paragraph("Result Summary", subheading), _table(summary_rows)]))

    # --- Submitted inputs ---
    input_rows = [
        [_field_label(key), _format_value(value)]
        for key, value in prediction.input_data.items()
        if key != "tier"
    ]
    if input_rows:
        story.append(KeepTogether([Paragraph("Submitted Inputs", subheading), _table(input_rows)]))

    # --- SHAP factors (only if real explanation exists — never fabricated) ---
    if prediction.explanation and prediction.explanation.get("top_factors"):
        factor_rows = [["Factor", "Direction"]]
        for factor in prediction.explanation["top_factors"]:
            label = FEATURE_LABELS.get(factor["feature"], factor["feature"])
            direction = (
                "Contributed to higher model-estimated risk"
                if factor["direction"] == "increases_risk"
                else "Contributed to lower model-estimated risk"
            )
            factor_rows.append([label, direction])
        story.append(
            KeepTogether(
                [
                    Paragraph("Why the Model Made This Prediction", subheading),
                    Paragraph(
                        "These factors describe how the model weighed the submitted information for "
                        "this specific prediction — not a medical cause.",
                        small,
                    ),
                    Spacer(1, 4),
                    _table(factor_rows, header=True),
                ]
            )
        )

    # --- LLM summary (only if already generated — never triggered here) ---
    if prediction.llm_summary:
        story.append(Paragraph("AI-Generated Summary", subheading))
        story.append(Paragraph(prediction.llm_summary, body))
        story.append(
            Paragraph(
                "This summary was generated by an AI model from the risk estimate above. "
                "Research prototype — not a medical diagnosis, not clinically validated.",
                small,
            )
        )

    story.append(Spacer(1, 16))
    story.append(Paragraph(DISCLAIMER_TEXT, disclaimer_style))

    doc.build(story)
    return buffer.getvalue()


def _table(rows, header: bool = False) -> Table:
    table = Table(rows, colWidths=[2.6 * inch, 3.4 * inch])
    style = [
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#475569")),
    ]
    if header:
        style += [
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("LINEBELOW", (0, 0), (-1, 0), 1, colors.HexColor("#94a3b8")),
        ]
    table.setStyle(TableStyle(style))
    return table
