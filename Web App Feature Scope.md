# Web App Feature Scope

Project title: *An Intelligent and Explainable AI-Based Web System for Heart
Disease Risk Prediction Using Machine Learning and Large Language Models.*

Scope: **Essential + Strongly Recommended** tiers from `Project plan.md`, **plus
the LLM explanation layer**, since the LLM component is now part of the
official project title and is no longer optional. Other Advanced-tier items
(doctor dashboard, model versioning, extra models beyond the required four,
external validation) remain deferred — see rationale at the bottom.

Stack: **React** (frontend) + **Django REST Framework** (backend), backed by
the saved inference pipeline in
`Resource files/northern_bangladesh_heart_disease_artifacts/`
(`heart_disease_inference_pipeline.joblib` + `model_metadata.json`), plus an
**LLM service** that consumes only the ML pipeline's own output (never raw
patient data) to generate explanations. LLM provider (e.g., Claude API vs. a
self-hosted model) is not yet decided — to be picked when this feature is
built.

---

## 1. Authentication & Roles

- Registration / login (email + password, hashed).
- Two roles: **User** and **Admin**. (Doctor role deferred — see exclusions.)
- Profile management (basic demographic fields only — no unnecessary PII storage).
- Session/token-based auth (DRF token or JWT).

## 2. Prediction Input & Risk Output

- Patient data entry form matching the actual saved feature schema (24 predictors —
  age, sex, height, weight, BMI, family history, hypertension, diabetes, chest-pain
  history, BP, RBS, lipid panel [total cholesterol/HDL/LDL/triglycerides], MaxHR,
  haemoglobin, creatinine, platelets, sodium, potassium, chloride, troponin-I +
  censoring flag). Field list and types come from `model_metadata.json`, which is
  the authoritative schema (`Project plan.md` has since been corrected to match
  it too — treat `model_metadata.json` as the source of truth if they ever diverge).
- Backend calls the saved pipeline and returns:
  - `probability` (calibrated risk score)
  - `risk_label` (derived from a documented threshold — see §8)
  - `prediction` (0/1 at that threshold)
- No raw "Heart Disease: Yes/No" without the probability — probability is always shown.

## 3. Multiple Model Comparison

- Compare the four models actually trained: **Logistic Regression, Decision Tree,
  SVM, Random Forest** (per methodology constraint — no KNN/XGBoost/NN).
- Display real nested-CV and held-out-test metrics from `model_metadata.json`
  (accuracy, balanced accuracy, sensitivity, specificity, PPV, NPV, F1, ROC-AUC,
  Brier score, with confidence intervals) — not placeholder numbers.
- Selected model (Random Forest) clearly marked, with the selection rule stated
  (highest nested CV AUC; parsimony tiebreak via DeLong test).

## 4. Explainable AI (SHAP)

- Global feature importance chart (from the notebook's SHAP analysis).
- Per-prediction explanation: top contributing / protective factors for that
  specific input, phrased as "the model relied more heavily on…", never as
  causal/diagnostic language.

## 5. LLM Explanation Layer *(new — required by project title)*

- After the ML pipeline returns `prediction` / `probability` / SHAP top
  factors, an LLM call turns that structured output into a short plain-language
  summary for the user (e.g., "This estimate is higher than average, driven
  mainly by cholesterol and blood pressure. This is not a medical diagnosis.").
- **Guardrail:** the LLM is given only the ML model's own output as input —
  never raw patient PII, never asked to reason independently about medical
  facts. It restates/contextualises; it does not diagnose.
- Fixed, reviewed prompt template (not open-ended chat) for the MVP — matches
  the "Essential" framing of the plan rather than the full open-ended "AI
  health assistant" concept.
- Every LLM-generated explanation carries the same disclaimer as the rest of
  the app (§10).
- **Optional, secondary feature (build only if time allows):** free-text
  symptom entry (e.g., "I'm 52, my BP is 150/95...") parsed by the LLM into
  structured form fields, always shown back to the user for confirmation/edit
  before those values are submitted to the ML model. The LLM never writes
  directly into the prediction request — only into an editable draft form.

## 6. Risk Visualization

- Risk gauge/badge (probability + Low/Moderate/High label).
- Per-factor contribution bars for the individual prediction (from SHAP output).

## 7. Prediction History

- Per-user list of past predictions (date, probability, risk label).
- No trend claims beyond what's shown — this is a log, not a diagnostic timeline.

## 8. Decision Threshold Handling

- Backend uses one documented, frozen threshold from `model_metadata.json`
  (default 0.5, or the Youden/sensitivity-target alternatives already computed) —
  the choice and rationale must be stated in the report, not silently picked.

## 9. PDF Report Generation

- Downloadable report per prediction: patient inputs, risk score/label, top
  contributing factors, LLM-generated plain-language summary, model used, and
  the standard research-prototype disclaimer (§10).

## 10. Admin Dashboard

- Aggregate stats: registered users, total predictions, risk-tier distribution.
- Model performance panel using the **real** metrics (§3) — and whenever the
  headline test ROC-AUC (0.9916) is shown, it must be paired with the
  sensitivity-analysis figure (0.976, lipid-variables removed) and a one-line
  case-mix/spectrum-bias caveat. Never display 0.9916 alone.

## 11. Disclaimer & Ethics (shown on every prediction result)

- "Research prototype. Not externally validated, not prospectively evaluated,
  not approved for clinical use. This is not a medical diagnosis."
- No patient-identifying fields (name, phone, address, national ID) collected
  anywhere in the app.
- Applies to both the raw ML output and the LLM-generated summary.

## 12. Security

- Password hashing, input validation, authenticated/authorized API endpoints,
  HTTPS in deployment, no secrets in source/docs.
- LLM API calls (if using a third-party provider) send only model output —
  never patient-identifying data.

---

## Explicitly excluded (still deferred, not part of this scope)

- Open-ended AI chat assistant (only the fixed-template explanation layer in
  §5 is in scope for now — a free-form chat interface is a larger, separate
  feature).
- Doctor role / doctor dashboard.
- Model versioning / MLOps monitoring.
- Any model beyond the four required (KNN, XGBoost, Neural Network, ensembling).
- External validation dataset, fairness analysis across demographic groups.

**Rationale:** the project's academic weight is in the rigorous, leakage-safe
ML methodology already completed (see `project_ml_status` memory), now paired
with the LLM explanation layer the title requires. Other Advanced-tier items
still add integration risk/scope without strengthening the research
contribution, so they remain deferred and can be revisited once this scope is
built and there's time remaining.
