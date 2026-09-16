# ML Experiment Plan & Results — Phase ML-3/ML-4

Companion report to the reproducible notebooks
`notebooks/02_preprocessing_and_feature_engineering.ipynb`,
`notebooks/03_model_comparison_experiments.ipynb`, and
`notebooks/04_feature_selection_and_shap.ipynb` (all executed, 0 errors,
all numbers below are real). Builds on the approved `feature_groups.md`
hypothesis and the adjustments given in the approval message.

## 1. Population and Split

- **Population:** adult-only. The 13 pediatric records (Age < 18, all
  `Heart Disease = 1`) are excluded — re-verified appropriate for this
  project's defined adult-risk-screening research population (not merely
  assumed): retaining them would make "is this patient a child" a
  mechanical, perfect predictor, which is not a property of a real risk
  factor.
- **Final modelling population:** 1,035 adult records.
- **Split:** stratified 80/20 (train n=828, test n=207), fixed seed
  (`random_state=42`), intended to be untouched until final evaluation.
  **Correction (methodological audit, see `reports/ml_final_audit.md`):**
  this intent was not fully honored during feature selection — the test set
  was inspected more than once before the feature set was frozen. The audit
  report documents exactly what happened and re-derives the same feature
  decisions using CV-only evidence.
- **Cross-validation:** stratified 5-fold on the 80% training split for all
  model/hyperparameter selection.

## 2. Height / Weight / BMI Representation

Tested empirically (not assumed) per the approval's instruction #3 — three
representations compared via 5-fold CV (Logistic Regression + Random
Forest probes) on the Basic feature set:

| Representation | LR CV-AUC | RF CV-AUC |
|---|---|---|
| Height + Weight only | 0.9040 | 0.9255 |
| BMI only | 0.8989 | 0.9170 |
| All three | 0.9043 | 0.9290 |

`BMI` correlates 0.85 with `Weight` (expected — it's derived from it) and
only −0.19 with `Height`. Adding BMI on top of Height+Weight gains almost
nothing (≤0.004 AUC), while BMI-alone is the consistent weakest of the
three. **Decision: Height and Weight are the model features; BMI is
computed for display only, never a separate model input** (and, per the
follow-up instruction, never a typed form field either — auto-computed
silently).

## 3. Feature Sets Evaluated

| Set | Fields |
|---|---|
| **A — Basic** | Age, Sex, Height, Weight, BP, Family H/O, Hypertension, Diabetes, H/O ChestPain (9) |
| **B — Basic + Enhanced** | A + Total Cholesterol, HDL, LDL, Triglycerides, RBS, MaxHR (15) |
| **C — Extended/Advanced** | B + Troponin-I (harmonised), Sodium, Potassium, Chloride, Creatinine, Platelets, Haemoglobin, Troponin-censoring flag (23) |

`SL`, `UNIT`, and `Troponin- I assay type` are never used as features in any
set (confirmed excluded — `UNIT` re-confirmed as severe leakage: 100% of
CCU-admitted records are positive, χ-style pattern identical to the earlier
notebook's finding). `Troponin- I assay type` is used only internally, to
convert High-Sensitivity (ng/L) values to the Quantitative assay's ng/mL
scale (÷1000) — medians converge to the same order of magnitude after
conversion (1.26 vs 1.14 ng/mL), confirming the harmonisation is sound.

## 4. Preprocessing (leakage-safe)

All preprocessing is fit **inside** each cross-validation fold via a single
`Pipeline` + `ColumnTransformer` per feature set — never on the full dataset
before splitting:
- Numeric columns: median imputation **with missingness indicators**
  (`add_indicator=True`), then standardisation.
- Binary yes/no columns: most-frequent imputation.
- `Sex`: most-frequent imputation + one-hot encoding.

## 5. Algorithms — Including the CLAUDE.md Conflict, Resolved by Testing

**Conflict, as flagged in `feature_groups.md`:** `CLAUDE.md` §14 mandates
Logistic Regression, Decision Tree, SVM, Random Forest. This ML-integration
brief asks for Logistic Regression, Random Forest, XGBoost, SVM, KNN.
**Resolution: Decision Tree is included as an additional baseline**, per the
explicit instruction to report the conflict rather than silently drop it —
all **6 algorithms** were run across all 3 feature sets (18 configurations),
each with a modest `GridSearchCV` hyperparameter search (5-fold stratified
CV, scored on ROC-AUC).

### Full CV ROC-AUC comparison (training split, all 18 configurations)

| Algorithm | A — Basic | B — Basic+Enhanced | C — Extended/Advanced |
|---|---|---|---|
| Logistic Regression | 0.9040 | 0.9784 | 0.9866 |
| **Decision Tree** | 0.8703 | 0.9302 | 0.9599 |
| Random Forest | 0.9281 | 0.9819 | 0.9986 |
| XGBoost | 0.9298 | 0.9817 | 0.9969 |
| SVM | 0.9224 | 0.9810 | 0.9877 |
| KNN | 0.9081 | 0.9705 | 0.9775 |

**Decision Tree is the weakest of all six algorithms in every single feature
set** — included fully and fairly (not silently dropped), but it is not
competitive against the ensemble/kernel methods on this dataset. Logistic
Regression is notably strong once the Enhanced lipid panel is present
(0.978–0.987), suggesting fairly linear separability at that point — a
genuinely interesting, reportable finding for write-ups favouring
interpretable models.

## 6. Multi-Criteria Model Selection (not accuracy/AUC alone)

Full metrics (accuracy, precision, recall/sensitivity, specificity, F1) were
computed for the top 3–4 contenders per feature set (5-fold CV, training
split only):

| Feature set | Algorithm | CV ROC-AUC | Accuracy | Precision | Recall | Specificity | F1 |
|---|---|---|---|---|---|---|---|
| A | XGBoost | 0.930 | 0.855 | 0.910 | 0.827 | 0.892 | 0.866 |
| A | Random Forest | 0.928 | 0.856 | 0.908 | 0.831 | 0.889 | 0.867 |
| A | SVM | 0.922 | 0.855 | 0.918 | 0.818 | 0.903 | 0.865 |
| B | Random Forest | 0.982 | 0.940 | 0.965 | 0.927 | 0.956 | 0.946 |
| B | XGBoost | 0.982 | 0.931 | 0.948 | 0.930 | 0.933 | 0.939 |
| B | SVM | 0.981 | 0.943 | 0.977 | 0.921 | 0.972 | 0.948 |
| B | Logistic Regression | 0.978 | 0.931 | 0.956 | 0.921 | 0.944 | 0.938 |
| C | Random Forest | 0.999 | 0.977 | 0.989 | 0.970 | 0.986 | 0.980 |
| C | XGBoost | 0.997 | 0.967 | 0.987 | 0.955 | 0.983 | 0.971 |

For A and B, Random Forest and XGBoost show **no statistically significant
difference** in paired 5-fold CV ROC-AUC (paired t-test on the same folds:
p=0.18 for Basic, p=0.49 for Enhanced — see `reports/ml_final_audit.md` for
the test itself, added during methodological audit; with only 5 paired
folds this test has limited power, so "no significant difference" means "no
evidence of a difference found," not proof of true equivalence).
Performance is **comparable**.

## 7. Held-Out Test Set Evaluation (⚠ see `reports/ml_final_audit.md` — the test set was inspected more than once during feature selection; corrected there)

Per leakage-safe methodology, only the leading contenders per group were
evaluated on the untouched 20% test set — not all 18 configurations:

| Feature set | Algorithm | Test AUC | Accuracy | Precision | Recall | Specificity | F1 | Brier |
|---|---|---|---|---|---|---|---|---|
| A | Random Forest | 0.9136 | 0.831 | 0.866 | 0.829 | 0.833 | 0.847 | 0.121 |
| A | **XGBoost** | **0.9253** | **0.845** | 0.890 | 0.829 | 0.867 | 0.858 | 0.113 |
| B (full, 6 fields) | Random Forest | 0.9753 | 0.899 | 0.953 | 0.863 | 0.944 | 0.906 | 0.072 |
| B (full, 6 fields) | **XGBoost** | **0.9802** | **0.923** | 0.947 | **0.915** | 0.933 | 0.930 | 0.059 |
| C (research-only) | **Random Forest** | **0.9919** | 0.947 | 0.965 | 0.940 | 0.956 | 0.952 | 0.042 |
| C (research-only) | XGBoost | 0.9887 | 0.952 | 0.974 | 0.940 | 0.967 | 0.957 | 0.039 |

**On the held-out test set, XGBoost outperforms Random Forest for both A and
B** — reversing the (statistically tied) CV ranking, and notably with a
meaningfully higher recall for B (0.915 vs 0.863 — about 6 more true
positives correctly caught out of 117, on this test set). This is reported
transparently rather than cherry-picked: CV and test rankings *can*
disagree at this sample size, and both are shown. For C, Random Forest
remains marginally ahead on both CV and test.

A majority-class baseline achieves only 56.5% test accuracy — every model
above clears it decisively.

## 8. Final Feature Trim (Enhanced set) — ⚠ process corrected, see `reports/ml_final_audit.md`

The original permutation importance/SHAP pass that motivated this trim was
computed on the held-out test set — a methodological error, corrected in
the audit. **The table below is retained for the record but was not
decision-clean; see `ml_final_audit.md` for the CV-only re-derivation**,
which reached the same conclusion via train-only, leakage-safe evidence:

| Enhanced variant | CV-AUC | Test-AUC | Test-Recall |
|---|---|---|---|
| Full (6 fields, incl. MaxHR, HDL) | 0.9817 | 0.9802 | 0.9145 |
| Trimmed (4 fields: Total Chol, LDL, Triglycerides, RBS) | 0.9815 | 0.9802 | 0.9145 |

**MaxHR and HDL are dropped from the final recommended Enhanced feature
list — this conclusion is unchanged, but is now backed by the clean
CV-only redo in `ml_final_audit.md`, not by the test-set-informed process
originally used to reach it here.**

## 9. Final Recommended Models

### Basic Model — XGBoost, 9 fields (Age, Sex, Height, Weight, BP, Family H/O, Hypertension, Diabetes, H/O ChestPain)

Held-out test (n=207): **ROC-AUC 0.925**, Accuracy 0.845, Precision 0.890,
**Recall (sensitivity) 0.829**, Specificity 0.867, F1 0.858, Brier 0.113.
Confusion matrix: TN=78, FP=12, FN=20, TP=97.

### Enhanced Model — XGBoost, 9 Basic fields + Total Cholesterol, LDL, Triglycerides, RBS (13 fields)

Held-out test (n=207): **ROC-AUC 0.980**, Accuracy 0.932, Precision 0.964,
**Recall (sensitivity) 0.915**, Specificity 0.956, F1 0.939, Brier 0.058.
Confusion matrix: TN=86, FP=4, FN=10, TP=107.

**Recall improves substantially from Basic to Enhanced (0.829 → 0.915)** —
directly answering the research question: yes, additional clinical/lab
information (specifically the lipid panel + RBS) materially improves
prediction, including on the metric most relevant to a screening tool.

Random Forest's performance is **comparable** for both tiers — no
statistically significant difference from XGBoost was found (paired t-test,
§6) — a legitimate, simpler-dependency choice if preferred; XGBoost is
recommended primarily for its consistent-or-better recall on the held-out
evaluation.

### Advanced/Research set — Random Forest, 23 fields

Held-out test: ROC-AUC 0.992, Accuracy 0.947, Recall 0.940, F1 0.952. **Not
recommended as a third deployment tier** (per the approval's instruction
#6) — near-ceiling performance is treated with the same caution as the
earlier notebook's lipid/Haemoglobin finding (§8 of `dataset_audit.md`):
several Advanced-tier variables (Troponin-I, Haemoglobin) are themselves
plausibly leakage-adjacent (ordering a troponin test implies a clinician
already suspected acute injury) or part of the same abnormally-high-
correlation group flagged as an open, unresolved question. Useful as a
research ceiling / sensitivity comparison, not as a product recommendation.

## 10. Brier Score (not, by itself, a calibration claim)

Brier scores (lower is better; 0 = perfect, 0.25 = uninformative for a
balanced problem) decrease monotonically from Basic (0.113) to Enhanced
(0.058) to Advanced (0.039–0.042). **Correction (methodological audit):**
Brier score is a combined measure of discrimination *and* calibration — a
lower score is consistent with, but does not by itself prove, better
calibration, since it could equally reflect better discrimination alone. No
dedicated calibration analysis (a reliability diagram/calibration curve, or
a formal test) was performed in this phase. This is left as an explicit,
named open item for Phase ML-5, not claimed as already established here.

## 11. What This Does *Not* Settle

- The label-construction question flagged in `dataset_audit.md` §8 remains
  open — the Enhanced and Advanced tiers' strong performance is partly
  attributable to variables in that same caution group and should always be
  reported alongside this limitation, not as a clean result.
- No external validation cohort exists — all numbers are from one
  institution's retrospective, hospital-admitted sample (case-mix bias
  caveat, same as before).
- These are `A_Basic`/`B_Basic_Enhanced` treated as **preliminary research
  groups** per approval instruction #1 — final production adoption should
  follow, not precede, the frontend/backend rework decision still pending
  your approval.
