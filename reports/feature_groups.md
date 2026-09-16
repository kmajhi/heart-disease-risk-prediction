# Feature Grouping — Basic / Enhanced / Advanced / Excluded

Based on `dataset_audit.md`. These are **preliminary** groupings for
approval — final membership may shift slightly once Phase ML-3/4 (actual
feature selection and model-based importance) runs, but the reasoning below
is meant to be the defensible starting point, not a placeholder.

## Grouping Criteria, and How They Were Weighed

The brief lists: predictive usefulness, clinical relevance, missingness,
data quality, redundancy, feature importance, usability for ordinary users,
model performance, research justification. Two of these need a clarification
before the table makes sense:

1. **Missingness in the historical dataset ≠ difficulty for a live user.**
   A field like `Hypertension` has 9.45% missingness in the *hospital
   records* (because a chart wasn't always completed), but a live web form
   can simply require an answer — "have you been told you have high blood
   pressure?" is a trivial yes/no for almost anyone to answer, regardless of
   how often it happened to be recorded historically. Missingness was
   therefore weighted heavily for *lab-value* columns (where a user
   genuinely may not know the number without a test) and lightly for
   *self-reportable yes/no history* columns.
2. **Correlation strength was deliberately not the deciding factor** for the
   lipid panel and Haemoglobin — see the continuity flag in
   `dataset_audit.md` §8. High correlation pushed them toward "useful," but
   the leakage-adjacent caution pushed them toward stricter tiers than raw
   correlation alone would suggest.

---

## A. Basic / Mandatory (Basic Prediction)

| Field | Why mandatory |
|---|---|
| Age | 0% missing, universally known. |
| Sex | 0% missing, universally known. |
| Height (cm) | Self-measurable without equipment beyond a tape measure; low burden. |
| Weight (kg) | Self-measurable with a household scale; low burden. |
| BMI | **Not a form field at all.** Deterministic function of height/weight (`weight_kg / height_m²`) — computed silently and used as a model input, never shown to the user as something to type or edit. (Note: this is a UX tightening vs. the existing Phase 3 frontend, which currently shows BMI as an auto-filled *but editable* field — that will need to change to a fully hidden, non-editable computation when the prediction form is reworked for Basic/Enhanced in a later phase.) |
| Family H/O (family history) | Simple yes/no, universally answerable, r=0.333. |
| Hypertension | Simple yes/no ("has a doctor told you…"), r=0.271. Historical missingness (9.45%) reflects incomplete charting, not difficulty answering live. |
| Diabetes | Simple yes/no, r=0.346. |
| H/O ChestPain | Simple yes/no symptom history, r=0.449 — one of the stronger self-reportable signals. |
| BP(mmHg) | Extremely common vital (home monitors, routine checkups), lowest missingness of any lab-adjacent field (1.05%). Univariate correlation is surprisingly weak (§8 of the audit) — retained anyway as a standard, low-burden clinical vital; multivariate importance will be re-checked in Phase ML-3/4 rather than excluded on a univariate number. |

**9 user-entered fields + 1 auto-derived (BMI) = 10 Basic fields.** This is
intentionally the smallest set that still spans demographics, simple yes/no
history, and one easy vital — no lab test is required for a Basic
Prediction.

## B. Enhanced / Optional

| Field | Why optional-but-useful |
|---|---|
| Total_Cholesterol(mg/dL) | Common routine-checkup lab value; r=0.601 — but see the leakage-adjacent caution in the audit; must be sensitivity-tested, not blindly trusted. |
| HDL(mg/dL) | Same lipid panel, typically drawn together with the above; r=−0.181. |
| LDL(mg/dL) | Same lipid panel; r=0.674, the single strongest correlate in the dataset — same caution as Total Cholesterol applies, arguably more so. |
| Triglycerides(mg/dL) | Same lipid panel; r=0.566 — same caution. |
| RBS(mmol/L) | Random blood sugar — commonly known by diabetics or from a routine checkup; r=0.443. |
| MaxHR | Correlates strongly with the outcome (r=−0.373) but is **substantially redundant with Age** (r=−0.926 with Age; the earlier notebook found MaxHR ≈ 206.13 − 0.75×Age, R²≈0.85) and isn't something an ordinary user can state without a stress test — Enhanced rather than Basic despite the correlation, and a candidate for de-prioritisation in Phase ML-3 feature selection precisely because of the Age redundancy. |

These six require a routine blood-panel visit (lipid panel + RBS) or,
for MaxHR, a fitness assessment — more than the Basic tier, but still
substantially more accessible than the Advanced tier below (no hospital
admission or acute-care context implied).

## C. Advanced / Specialized Clinical

| Field | Why advanced, not enhanced |
|---|---|
| Troponin-I | **Flagged specifically, as requested.** Acute myocardial injury marker; ordering it at all typically implies a clinician already suspects acute cardiac injury, which is a triage judgement, not background risk information an ordinary user has. Two incompatible assay scales are mixed in the raw column (§6 of the audit) and require harmonisation before any use. Recommend: Advanced tier only, and even there, run the same before/after sensitivity analysis the earlier notebook used for the lipid panel, given the plausible leakage-adjacency. |
| Sodium(mmol/L) | Electrolyte panel, lab-only, r=−0.271 (moderate). |
| Potassium | Electrolyte panel, lab-only, r=−0.024 (essentially no univariate signal) — candidate for exclusion during Phase ML-3 feature selection, but kept as a tier-appropriate candidate for now rather than pre-emptively dropped, per "don't include a feature simply because it improves accuracy" applied in reverse (don't exclude one on a single weak univariate statistic either — let the actual feature-selection phase decide). |
| Chloride | Electrolyte panel, lab-only, r=0.103 (weak). |
| Creatinine(mg/dL) | Renal-function lab, lab-only, r=0.374 (moderate). |
| Platelets | Haematology lab, lab-only, r=−0.072 (weak) — same feature-selection candidate note as Potassium. |
| Himoglobin [sic] | Routine CBC value, technically no harder to obtain than the lipid panel — placed in Advanced rather than Enhanced specifically because it's one of the four variables in the leakage-adjacent correlation caution (r=−0.524, second-strongest in the dataset) from `dataset_audit.md` §8. Grouping it with the "handle carefully" tier keeps that caution visible in the architecture itself, not just in a footnote. |

All seven require an actual blood draw and lab processing — appropriate for
a hospital/clinical deployment context, not a general public web form.

## D. Excluded (not used as ML features)

| Field | Reason |
|---|---|
| SL | Confirmed to be literally the row position (`SL == index + 1` for all 1,048 rows) — zero information content. |
| UNIT | **Severe, confirmed leakage.** 100% of CCU-admitted records are positive (§7 of the audit). Ward assignment is a downstream/concurrent clinical decision, not information available when a prediction would actually be made. |
| Troponin- I assay type | Metadata about *which instrument* was used, not a patient risk factor. Needed internally to harmonise the Troponin-I values (§6), but not exposed as a standalone ML input or user-facing field — and its selection is itself plausibly triage-influenced, the same class of concern as `UNIT`. |

## E. Population-Level Decision (not a feature, but must be stated)

**13 pediatric records (Age < 18), all `Heart Disease = 1`.** Recommend
excluding them from the modelling population for both Basic and Enhanced
experiments, consistent with the earlier notebook and with this project's
stated adult-risk-screening audience. This is a row-exclusion decision, made
explicitly and reported with the exact count, not a silent filter.

## Summary Table

| Group | Fields | Count |
|---|---|---|
| Basic (mandatory) | Age, Sex, Height, Weight, BMI*, Family H/O, Hypertension, Diabetes, H/O ChestPain, BP | 10 (9 entered + 1 derived) |
| Enhanced (optional) | Total Cholesterol, HDL, LDL, Triglycerides, RBS, MaxHR | 6 |
| Advanced (specialized) | Troponin-I, Sodium, Potassium, Chloride, Creatinine, Platelets, Haemoglobin | 7 |
| Excluded | SL, UNIT, Troponin assay type | 3 |
| **Total accounted for** | | **26** of 27 (+ target `Heart Disease`) |

## Open Questions for Your Approval

1. **Does the Basic (10-field) set look right**, or should any field move
   tiers (e.g. `H/O ChestPain` into Enhanced since it's a symptom rather than
   a static risk factor, or `BP` reconsidered given its weak univariate
   correlation)?
2. **Advanced tier scope:** build and evaluate it at all in Phase ML-4, or
   treat Advanced features as sensitivity-analysis-only (matching how the
   earlier notebook treated the lipid/Haemoglobin caution) rather than a
   third deployable prediction mode?
3. **Algorithm list conflict:** this brief asks for Logistic Regression,
   Random Forest, XGBoost, SVM, and KNN. The project's own `CLAUDE.md`
   (§14) mandates exactly Logistic Regression, Decision Tree, SVM, and
   Random Forest, and says not to substitute without strong justification.
   Flagging this now, before Phase ML-4, rather than silently picking one —
   confirm which list to use (XGBoost's addition is easy to justify as
   research value; whether to keep Decision Tree, drop it, or run all five
   is your call).
4. **Existing deployed model:** the web app's Phase 3 (already built and
   browser-verified) currently ships a single-tier model requiring all 24
   original fields. Moving to Basic/Enhanced means the prediction form and
   Django API will need real rework in a later phase (per your own note that
   the frontend fields must match the final ML schema) — flagging the size
   of that follow-on change now so it's expected, not rebuilding anything
   yet.
