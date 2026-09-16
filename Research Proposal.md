> **Formatting note:** No university-supplied formatting template was found in
> `Resource files/`. This document assumes standard academic formatting — 12 pt
> Times New Roman, 1-inch margins, 1.5 line spacing, single column — under which
> it is estimated to run approximately **6–7 pages**. Reformat to the actual
> university template if one is supplied later; trim table/figure captions first
> if length needs to be reduced.
>
> **Proposal-stage note:** Consistent with the project's proposal-vs-report
> distinction, dataset characteristics below are stated as known facts (the
> dataset has already been collected and audited). Model performance is *not*
> reported here — methodology, models, and evaluation are described
> prospectively ("will be evaluated," "will be compared"). Measured results
> belong in the final report, not this proposal.

# An Intelligent and Explainable AI-Based Web System for Heart Disease Risk Prediction Using Machine Learning and Large Language Models

**A Research Proposal**

*(Case study: clinical, anthropometric, and biochemical data from Northern Bangladesh)*

---

## 1. Introduction and Background

Cardiovascular disease is a leading cause of morbidity and mortality worldwide,
and its burden is rising in South Asian countries, including Bangladesh, where
risk-factor prevalence, limited screening infrastructure, and constrained access
to specialist cardiology care combine to delay diagnosis. Machine learning (ML)
offers a way to triage risk from routinely collected clinical, anthropometric,
and biochemical measurements, potentially supporting earlier referral decisions
in resource-limited hospital settings. Most published heart-disease prediction
studies rely on Western cohorts (e.g., the UCI/Cleveland dataset) built around
ECG-derived features such as ST depression and thalassemia results, which are
not the data routinely available in many Bangladeshi hospitals. This project
instead uses a real clinical dataset collected at Zia Heart Foundation Hospital
& Research Institute in Northern Bangladesh, built primarily from anthropometric
measurements, blood pressure, a lipid panel, renal and electrolyte markers, and
troponin-I — a feature profile more representative of local clinical practice.
In addition to the predictive model, this project proposes a large language
model (LLM) layer situated around the ML prediction — not in place of it — to
translate model output (probability, risk label, SHAP-based contributing
factors) into plain, cautious natural-language explanations for a non-technical
user, and, optionally, to help structure free-text patient descriptions into
the model's required input fields for user review before submission.

**Related work.** A large share of published ML heart-disease prediction
studies benchmark against the public UCI/Cleveland dataset (303 records, 13
ECG- and exercise-test-centred features), which is neither locally sourced nor
representative of the biochemical-panel-driven workup typical of many South
Asian hospital settings. Studies specific to Bangladeshi clinical populations
remain comparatively limited, and few published pipelines document an explicit
target-leakage audit (e.g., of admission-ward or triage-adjacent variables) or
report calibration alongside discrimination metrics. This project addresses
that gap by combining a locally sourced dataset with an explicit leakage audit,
nested cross-validation, calibration assessment, and explainability reporting,
rather than optimising a single accuracy figure in isolation.

## 2. Problem Statement

Heart-disease risk assessment in Northern Bangladesh currently depends on
clinician judgment applied to routine laboratory and clinical measurements,
without a validated, data-driven decision-support tool calibrated to the local
patient population. Existing predictive models trained on Western,
ECG-feature-based cohorts do not transfer directly to a biochemical-panel-based
local dataset, and no locally derived, leakage-audited, explainable model
currently exists for this hospital's patient population.

## 3. Aim and Objectives

**Aim:** To develop and evaluate a machine-learning-based heart-disease risk
prediction pipeline using clinical, anthropometric, and biochemical data from a
Northern Bangladesh hospital cohort, and to define a deployable, explainable
inference pipeline suitable for integration into a web-based decision-support
prototype.

**Objectives:**
1. Audit and clean the hospital-supplied dataset, documenting all data-quality
   and integrity issues encountered.
2. Identify and exclude variables at risk of target leakage (e.g., admission
   ward, record identifiers) with an explicit, documented prediction-time
   rationale.
3. Compare four standard classification algorithms — Logistic Regression,
   Decision Tree, Support Vector Machine, and Random Forest — under a
   leakage-safe, nested cross-validation protocol.
4. Select a final model using a pre-specified, multi-criteria rule (discrimination,
   calibration, sensitivity/specificity balance, and interpretability), evaluated
   once on a held-out test partition.
5. Apply explainable-AI methods (SHAP, permutation importance) to characterize
   model behaviour without making causal or diagnostic claims.
6. Package the selected model as a versioned, self-contained inference pipeline,
   and define the input/output contract for a future web-based decision-support
   system.
7. Integrate a large language model to (a) translate the ML model's prediction,
   probability, and SHAP-based contributing factors into a plain-language
   explanation for non-technical users, and (b) optionally extract structured
   field values from free-text patient descriptions, subject to explicit user
   review before those values are used as model input.
8. Define and document guardrails constraining the LLM to the model's own
   output (no independently generated medical claims, no diagnosis language),
   so that explainability is enhanced without introducing unverified content.

## 4. Research Questions

1. Which of the four candidate algorithms provides the best-calibrated,
   leakage-safe discrimination of heart-disease status in this cohort?
2. Which variables in the dataset (e.g., admission ward, troponin measurement
   type) pose a credible target-leakage risk, and how should they be handled?
3. How should censored and assay-inconsistent troponin-I values be harmonised
   without distorting the underlying signal?
4. To what extent does model performance generalise across patient subgroups
   (e.g., sex, age band) within this cohort?
5. Which features drive model predictions most strongly, and are these
   consistent with plausible clinical reasoning (without asserting causation)?
6. Does an LLM-generated natural-language explanation of SHAP-based feature
   contributions improve a non-technical user's understanding of a prediction,
   compared with presenting raw SHAP values alone?
7. Can free-text patient descriptions be reliably parsed into the model's
   structured input fields, and what accuracy/verification safeguards are
   needed before such extracted values are used for prediction?

## 5. Dataset Description

The dataset was collected at Zia Heart Foundation Hospital & Research Institute,
Northern Bangladesh, and supplied as a single Excel worksheet.

| Property | Value |
|---|---|
| Records supplied | 1,048 |
| Columns (raw file) | 27 |
| Target variable | `Heart Disease` (binary) |
| Records excluded (paediatric, age < 18) | 13 |
| Modelling population (adults) | 1,035 |
| Candidate predictors after exclusions | 24 |
| Outcome prevalence (full cohort) | ≈56.5% positive |

The 24 candidate predictors span five groups: demographic/anthropometric (age,
sex, height, weight, BMI), history/risk factors (family history, hypertension,
diabetes, chest-pain history), haemodynamic and metabolic measures (blood
pressure, random blood sugar, maximum heart rate), a lipid panel (total
cholesterol, HDL, LDL, triglycerides), and haematological/renal/electrolyte/
cardiac markers (haemoglobin, creatinine, platelets, sodium, potassium,
chloride, troponin-I with an associated censoring indicator).

Three fields present in the raw file are excluded from modelling and are not
treated as predictors: a serial/identifier field (`SL`), the admission ward
(`UNIT`), and the troponin assay-type field. The rationale for each exclusion is
given in Section 7.

Dataset limitations are addressed directly rather than concealed: the cohort is
drawn from a single hospital-admitted population (not a general-population
screening sample), several biochemical fields have non-trivial missingness that
will be handled via a documented, leakage-safe imputation strategy, and troponin
values include instrument-censored entries (e.g., values reported as
`>25000`) requiring explicit harmonisation.

**Missingness.** Missingness is concentrated in a subset of clinical and
biochemical fields rather than spread uniformly across the dataset. The most
affected variables (by proportion of missing entries in the supplied file) are
Hypertension (≈9.5%), BMI (≈8.7%), Chloride (≈7.4%), Platelets (≈7.1%),
Potassium (≈7.0%), Sodium (≈6.8%), Family History (≈6.5%), and Height (≈6.3%);
remaining variables have lower missingness. Several affected fields were also
stored inconsistently (e.g., numeric values recorded as text, or with stray
formatting characters), which will be corrected through documented, auditable
parsing rules rather than blanket deletion. Whether missingness itself carries
information (e.g., a laboratory test not ordered because a clinician judged it
unnecessary) will be assessed empirically before deciding whether to retain
missingness-indicator features.

## 6. Proposed Methodology

**Data audit and cleaning.** Every variable will be checked for implausible
values, unit inconsistencies, and numeric values stored as text before analysis.
Cleaning rules will be documented individually rather than applied uniformly;
no observation will be removed solely for being statistically unusual.

**Troponin-I harmonisation.** Given the mixed presence of quantitative and
high-sensitivity troponin assays and instrument-censored values, the assay type,
unit, and censoring status will be investigated jointly. A defensible
harmonisation strategy — potentially including a censoring indicator variable
and/or transformation — will be selected and documented rather than applying an
ad hoc unit conversion.

**Leakage audit.** `SL` is a record identifier and will not be used as a
predictor. `UNIT` (admission ward, e.g., CCU vs. General) reflects a clinical
placement decision that may itself encode prior knowledge of disease status
before the prediction is intended to occur, and will be treated as a
prediction-time leakage risk unless a clear justification for inclusion emerges.
Troponin assay-type, diagnostic-history fields, and any variable plausibly
recorded after outcome determination will be assessed on the same basis, with
the prediction-time assumption stated explicitly for each retained feature.

**Population definition.** Because the study targets adult heart-disease risk,
the 13 paediatric records (age < 18) will be excluded from the primary modelling
population, with the exclusion's effect on sample composition reported openly.

**Preprocessing.** All preprocessing (imputation, scaling, encoding) will be
implemented using scikit-learn `Pipeline`/`ColumnTransformer` objects fitted
only on training data within each cross-validation fold, to prevent
information leakage from held-out data into model fitting.

**Class imbalance.** The outcome is mildly imbalanced. A class-weighted
baseline will be established first; resampling techniques such as SMOTE will
only be introduced, if at all, strictly within the training folds of
cross-validation, never applied to validation or test data.

**Patient-level integrity.** The dataset will be checked for duplicate or
repeated-patient records. Where a patient identifier is not recoverable from
the supplied fields, this will be stated as an explicit limitation on the
train/test independence assumption, rather than assumed away.

## 7. Model Selection

Four algorithms will be compared: **Logistic Regression** (interpretable
baseline), **Decision Tree** (rule-based interpretability), **Support Vector
Machine**, and **Random Forest** (ensemble method). These were chosen to span a
range of interpretability and flexibility while remaining tractable to explain
and deploy in a hospital-facing prototype. Hyperparameters for each will be
tuned using nested cross-validation, so that no tuning decision has access to
data used for final evaluation.

## 8. Evaluation Strategy

Data will be split into training and held-out test partitions using stratified
sampling with a fixed random seed; the test partition will remain untouched
until final evaluation. Model comparison will use nested cross-validation on
the training partition, evaluated with ROC-AUC, accuracy, balanced accuracy,
sensitivity, specificity, precision (PPV), NPV, F1-score, and Brier score for
calibration. Where appropriate, statistical comparison between candidate models
(e.g., DeLong's test on ROC-AUC) will be used to judge whether an apparent
performance difference is meaningful rather than incidental. A decision
threshold will be selected using training/cross-validation data only (e.g., via
Youden's index or a sensitivity target) and frozen before the single, final
test-set evaluation — the test set will not be used to choose the threshold.
Final model selection will weigh discrimination, calibration, sensitivity/
specificity balance, interpretability, and deployment practicality; the
highest-accuracy model will not automatically be selected if these other
criteria are not also satisfied.

Model comparison is planned as a nested cross-validation design — an outer loop
for unbiased performance estimation and an inner loop for hyperparameter search
— so that no fold used to select hyperparameters is also used to score the
model. Calibration will be assessed visually (calibration curves) and
numerically (Brier score), since a model that ranks patients correctly but
outputs poorly calibrated probabilities is of limited use for a risk-percentage
display. Performance will also be examined across clinically relevant
subgroups (e.g., sex, age band) to check for concentration of error in a
specific patient group, reported descriptively rather than as a formal
fairness certification given the modest sample size.

## 9. Explainability

Model behaviour will be characterised using SHAP values and permutation
importance, reported at both the global (population-level feature importance)
and individual-prediction level. Explanations describe how the model used the
available features to arrive at a prediction; they will not be presented as
evidence of causation, biological mechanism, or clinical risk-factor status.
Reporting will consistently use language such as "the model relied more heavily
on…" rather than causal phrasing.

**LLM-based explanation layer.** A large language model will be used to
translate the model's own numeric output (probability, risk label, ranked
SHAP contributing factors) into a short, plain-language summary for the end
user. The LLM is constrained to restate and contextualise the ML model's
existing output, not to generate independent medical claims, a diagnosis, or
information not derivable from the prediction and SHAP values it is given.
Prompt templates will be fixed and reviewed rather than open-ended, and every
generated explanation will end with the same research-prototype disclaimer
used elsewhere in the system. This design keeps the LLM's role auditable: its
input (model output) and permitted output style are both constrained, so a
hallucinated or overconfident response is a template/prompt failure that can
be inspected, rather than an open-ended generation risk.

## 10. Expected Outcomes

The study is expected to produce: (i) a documented, reproducible data-cleaning
and leakage-audit record for the dataset; (ii) a fair, leakage-safe comparison
of four candidate classifiers; (iii) a selected model with an accompanying
calibration and threshold-selection rationale; (iv) global and per-prediction
explainability outputs; and (v) a versioned, self-contained inference pipeline
(preprocessing plus model) with documented metadata, ready for integration into
a downstream web application. Quantitative performance figures are not reported
in this proposal and will be presented, with appropriate confidence intervals
and limitations, in the final project report.

## 11. Proposed System Architecture

The eventual system is a **React** frontend communicating with a **Django REST
Framework** backend, which loads the saved inference pipeline and serves
predictions without duplicating preprocessing logic in application code. An
**LLM service** sits alongside the ML pipeline, consuming only the ML model's
own output (Section 9) to generate natural-language explanations, and
optionally assisting with free-text-to-structured-field extraction subject to
user review. The detailed feature scope (authentication and roles, prediction
input/output, model-comparison dashboard, SHAP-based explanations, the LLM
explanation layer, risk visualisation, prediction history, PDF report
generation, and an admin dashboard) is maintained separately in
`Web App Feature Scope.md` and is summarised here at architecture level only,
to keep this proposal within its page limit.

```
        React Frontend
              |
     Django REST API (auth, patient
     data entry, prediction endpoint)
              |
        ┌─────┴─────┐
        |           |
Saved inference   LLM service (explanation
pipeline (pre-    generation; optional
processing +      free-text field
selected model)   extraction, user-reviewed)
        |           |
        └─────┬─────┘
              |
         PostgreSQL/MySQL
   (users, predictions, prediction history)
```

**Conceptual data model (operational database, distinct from the ML training
dataset):**

| Entity | Key attributes | Relationship |
|---|---|---|
| `User` | id, email, hashed password, role (user/admin) | 1–many with `Assessment` |
| `Assessment` | id, user (FK), input feature values, timestamp | 1–1 with `Prediction` |
| `Prediction` | id, assessment (FK), probability, risk label, model version | belongs to `Assessment` |

This conceptual ER structure is kept intentionally simple — no additional
normalisation or entities are proposed unless a concrete feature requires them.
It is included because it materially clarifies how the ML dataset (used only
for training) differs from the application's operational database (used to
store user-submitted assessments and predictions at inference time).

**Inference API contract.** The Django backend will expose a prediction
endpoint accepting the raw feature values listed in Section 5 and returning a
structured response, for example:

```json
{
  "prediction": 1,
  "probability": 0.87,
  "risk_label": "High",
  "model_version": "random_forest_v1",
  "explanation": {
    "top_factors": ["Total_Cholesterol(mg/dL)", "BP(mmHg)", "Age"],
    "llm_summary": "This estimate is higher than average, driven mainly by
      cholesterol and blood pressure values in the input. This is not a
      medical diagnosis."
  }
}
```

The exact fields, probability threshold, and risk-label bands will be finalised
once the model-selection stage (Section 8) is complete, and will be documented
in a versioned metadata file distributed alongside the saved inference pipeline
so that Django never needs to re-implement preprocessing logic independently.
The `llm_summary` field is always derived from the same response's
`prediction`/`explanation.top_factors` values — the LLM service is never given
authority to alter `prediction` or `probability`.

## 12. Scope and Limitations

This is a retrospective, single-institution study; findings are not assumed to
generalise beyond a hospital-admitted symptomatic population, and no external
validation cohort is currently available. A hospital-admitted cohort typically
presents with a higher and more clearly symptomatic prior probability of
disease than a general-population screening sample, which can inflate apparent
discrimination independent of any modelling choice; this spectrum/case-mix
effect will be discussed alongside any reported performance figures rather than
presented as evidence of population-level accuracy. Missing data affects
several biochemical fields; the chosen imputation strategy will be documented,
and its potential influence acknowledged rather than assumed negligible. The
dataset size (1,035 adult records after exclusions) limits the granularity of
subgroup analysis and the precision of any subgroup-specific performance
estimate. Because admission ward and certain biochemical values may reflect
information available only at or after clinical triage, care is taken
throughout to state the assumed prediction-time information set explicitly,
and any uncertainty about how the outcome label itself was determined at the
source hospital is treated as an open limitation rather than resolved by
assumption. Finally, one derived variable (maximum heart rate) is physiologically
related to age by a well-known formula; whether this represents genuine
measurement or a derived quantity will be investigated, since a strongly
age-derived feature could artificially inflate the apparent value of age-related
signal.

The LLM explanation layer introduces its own limitations: outputs from a
language model are not themselves clinically validated, and even a
template-constrained model can occasionally misstate or oversimplify the
numeric result it is restating. LLM-generated text will therefore be
evaluated for factual consistency with the underlying prediction/SHAP values
before deployment, and the same disclaimer applied to ML predictions will be
attached to every LLM-generated explanation. If free-text field extraction is
implemented, extracted values will always be shown to the user for
confirmation before being used as model input, since extraction accuracy from
unconstrained natural language cannot be guaranteed.

## 13. Ethical and Privacy Considerations

The dataset does not include patient names, contact details, or other directly
identifying information in the fields used for modelling; no such information
will be reproduced in project documentation, code, or the eventual web
application. The system is proposed strictly as a research/decision-support
prototype and will not be described as a diagnostic tool, a replacement for
clinical judgement, or as clinically validated, since no such validation exists
at this stage. Any prediction shown to a user will be accompanied by an
explicit disclaimer stating the model's research-prototype status and its
lack of prospective or external clinical validation. The eventual web
application will store only the minimum data needed for its stated function,
will not display raw patient-identifying data anywhere in the interface, and
will use standard security practice (hashed credentials, authenticated and
authorised API access, input validation, and HTTPS in deployment). If the LLM
service uses a third-party API, only the ML model's own output (probability,
risk label, feature names/contributions) will be sent to it — no
patient-identifying information — and this data-handling boundary will be
documented explicitly before implementation.

## 14. Conclusion

This proposal outlines a methodologically rigorous approach to heart-disease
risk prediction using a locally sourced Northern Bangladesh clinical dataset,
prioritising leakage prevention, reproducibility, and explainability over
maximising a single performance metric. The resulting model and inference
pipeline are intended to inform a subsequent decision-support web application
in which a large language model layer makes the ML model's own output — not
independently generated medical content — understandable to a non-technical
user. All methodological choices — data cleaning, leakage exclusions, model
selection, threshold choice, and the constraints placed on the LLM layer —
are documented and defensible from the data and the model's own output,
rather than assumed.

## 15. References

*(To be completed with citations from the supplied literature review, if any
exists in `Resource files/`, plus any additional peer-reviewed sources
identified during proposal finalisation. No references are fabricated here.)*
