# ML-5: Final Model Selection

Companion to `notebooks/06_final_model_selection.ipynb` (executed, 0
errors). This phase uses a **fresh, previously-unseen test split**
(`random_state=2026`) because the ML-3/4 test split (`random_state=42`) had
been inspected multiple times during earlier feature selection (see
`reports/ml_final_audit.md`). **ML-3/4 results are preserved as historical**
in `ml_experiment_plan.md`/`feature_selection.md` and are labeled
accordingly wherever compared below — nothing from that phase was deleted
or overwritten.

## 1. Final Dataset Population

1,048 records supplied → 13 pediatric records (Age < 18, all
`Heart Disease = 1`) excluded → **1,035 adult records**, the same
population used throughout ML-3/4. Re-derived from the raw Excel file in
this notebook (not reused from a pickle) for full independence and
reproducibility.

## 2. Fresh Train/Development/Final-Test Split

- **Stratified 80/20**, `random_state=2026`: development n=828, final test
  n=207. Class balance preserved in both (56.5% / 43.5%).
- **Confirmed genuinely different from the ML-3/4 split**: only 44 of 207
  rows (21%) overlap with the old (`random_state=42`) test set — consistent
  with two independent random 20% draws, not a re-labeled copy of the same
  split.
- **The new 20% test set is used exactly once**, in §11 below, after every
  decision in §3–§9 was frozen using development-set evidence only.

## 3. Exact Feature Schemas (frozen, not re-derived)

| Tier | Fields |
|---|---|
| **Basic** (9) | Age, Sex, Height (cm), Weight (kg), BP(mmHg), Family H/O, Hypertension, Diabetes, H/O ChestPain |
| **Enhanced** (13 = 9 Basic + 4) | + Total_Cholesterol(mg/dL), LDL(mg/dL), Triglycerides(mg/dL), RBS(mmol/L) |
| **Advanced** (research/sensitivity only) | + Troponin-I (harmonised), Sodium, Potassium, Chloride, Creatinine, Platelets, Haemoglobin, Troponin-censoring flag |
| **Excluded** | SL, UNIT, Troponin-I assay type (used only internally to harmonise Troponin-I units) |

**BMI is never a model feature or a form field** — computed from
Height+Weight for display only, per the approved architecture.

## 4. Preprocessing Pipeline

Identical design to ML-3/4, rebuilt fresh for this notebook: numeric fields
→ median imputation with missingness indicators → standardisation; binary
yes/no fields → most-frequent imputation; `Sex` → most-frequent imputation +
one-hot encoding. All fit **inside** each development-set CV fold via
`Pipeline` + `ColumnTransformer` — never on the full dataset, and never
touching the final test set.

## 5. Cross-Validation Methodology

Stratified 5-fold CV on the **828-record development set only**
(`random_state=2026`, same seed as the split for full traceability). Used
for: hyperparameter search, algorithm comparison, the RF-vs-XGBoost paired
significance test, out-of-fold threshold selection, and out-of-fold
calibration assessment. The 207-record final test set is not involved in
any of this section.

## 6. Model / Hyperparameter Selection (development-set CV only)

All 6 required algorithms (Logistic Regression, **Decision Tree**
[CLAUDE.md requirement], Random Forest, XGBoost, SVM, KNN) re-run across
Basic/Enhanced/Advanced on the new development set, same hyperparameter
grids as ML-3/4 (no new algorithms introduced):

| Algorithm | Basic | Enhanced | Advanced (research) |
|---|---|---|---|
| Logistic Regression | 0.9014 | 0.9790 | 0.9912 |
| **Decision Tree** | 0.8595 | 0.9303 | 0.9528 |
| Random Forest | 0.9327 | 0.9853 | 0.9978 |
| XGBoost | 0.9386 | 0.9830 | 0.9964 |
| SVM | 0.9299 | 0.9836 | 0.9906 |
| KNN | 0.9110 | 0.9724 | 0.9789 |

**Decision Tree is again the weakest of all six algorithms in every
feature set** — the CLAUDE.md-vs-brief algorithm conflict resolves the same
way on an entirely independent split, reinforcing that this isn't an
artifact of one particular partition.

**Full metric suite, top contenders per tier (development CV):**

| Tier | Algorithm | AUC | Accuracy | Precision | Recall | Specificity | F1 |
|---|---|---|---|---|---|---|---|
| Basic | **XGBoost** | 0.939 | 0.868 | 0.913 | 0.848 | 0.894 | 0.879 |
| Basic | Random Forest | 0.933 | 0.861 | 0.904 | 0.844 | 0.883 | 0.873 |
| Basic | SVM | 0.930 | 0.852 | 0.922 | 0.806 | 0.911 | 0.859 |
| Enhanced | Random Forest | 0.985 | 0.938 | 0.963 | 0.927 | 0.953 | 0.944 |
| Enhanced | SVM | 0.984 | 0.936 | 0.957 | 0.930 | 0.944 | 0.943 |
| Enhanced | **XGBoost** | 0.983 | 0.924 | 0.953 | 0.910 | 0.942 | 0.931 |
| Enhanced | Logistic Regression | 0.979 | 0.930 | 0.961 | 0.915 | 0.950 | 0.937 |

### Random Forest vs XGBoost — paired significance test (development CV, frozen features)

| Tier | XGBoost fold AUCs | RF fold AUCs | t | p |
|---|---|---|---|---|
| Basic | [0.952, 0.918, 0.945, 0.914, 0.948] | [0.944, 0.909, 0.948, 0.913, 0.949] | 1.069 | 0.345 |
| Enhanced | [0.979, 0.978, 0.990, 0.975, 0.993] | [0.980, 0.981, 0.988, 0.983, 0.995] | −1.409 | 0.232 |

**No statistically significant difference detected** at either tier
(consistent with the ML-3/4 finding on the old split, p=0.18/0.49 there —
two independent splits, two independent non-significant results).
Wording used throughout: **"comparable performance,"** not "statistically
equivalent" (5 paired folds is low power — this means no evidence of a
difference was found, not proof of true equivalence).

**Decision (per your directive, confirmed by the evidence above): XGBoost
is the primary model for both tiers; Random Forest is retained as the
documented comparison/alternative.**

## 7. Final Basic Model

- **Algorithm:** XGBoost (`n_estimators=200, max_depth=3, learning_rate=0.05`)
- **Features (9):** Age, Sex, Height, Weight, BP, Family H/O, Hypertension, Diabetes, H/O ChestPain
- **Threshold: 0.4681 (Youden-optimal, not the sensitivity-target)** — reasoned
  choice, not mechanical: forcing 95% sensitivity on Basic's weaker
  discrimination (AUC≈0.94) would cost specificity down to ~0.60 (roughly
  40% false-positive rate among healthy users) on development out-of-fold
  data. The balanced Youden point (sens 0.848 / spec 0.883, dev OOF) is a
  more usable operating point for a low-burden first-pass screen.
- Development out-of-fold: AUC 0.9357, Brier 0.1015.

## 8. Final Enhanced Model

- **Algorithm:** XGBoost (`n_estimators=200, max_depth=3, learning_rate=0.05`)
- **Features (13):** 9 Basic fields + Total Cholesterol, LDL, Triglycerides, RBS
- **Threshold: 0.3335 (95%-sensitivity target)** — Enhanced's stronger
  discrimination (AUC≈0.98) affords a high-sensitivity operating point
  while keeping specificity reasonable (~0.90, dev OOF), consistent with
  prioritising sensitivity for a screening-support tool once the model has
  enough signal to support it without an unreasonable false-positive cost.
- Development out-of-fold: AUC 0.9822, Brier 0.0533.

## 9. Random Forest Comparison (both tiers)

Documented alternative, evaluated at the default 0.5 threshold for a fair
reference point (the Basic/Enhanced thresholds above were selected
specifically for XGBoost's probability distribution and are not
transferable across algorithms without re-deriving them for RF):

| Tier | Dev CV AUC | vs XGBoost |
|---|---|---|
| Basic | 0.9327 | comparable (p=0.345, §6) |
| Enhanced | 0.9853 | comparable (p=0.232, §6) |

## 10. Calibration Analysis

**Brier score is not, by itself, evidence of calibration** — it combines
discrimination and calibration. The actual calibration check is the
reliability diagram (§14).

| Tier | Dev OOF Brier | Final test Brier |
|---|---|---|
| Basic | 0.1015 | 0.1121 |
| Enhanced | 0.0533 | 0.0487 |

## 11. Final Evaluation on the Untouched New Test Set (used exactly once)

| Tier | Model | AUC | Accuracy | Precision | Recall | Specificity | F1 | Brier |
|---|---|---|---|---|---|---|---|---|
| Basic | **XGBoost** (thresh 0.4681) | 0.9135 | 0.8454 | 0.8829 | 0.8376 | 0.8556 | 0.8596 | 0.1121 |
| Basic | Random Forest (thresh 0.5) | 0.9102 | 0.8502 | 0.8909 | 0.8376 | 0.8667 | 0.8634 | 0.1178 |
| Enhanced | **XGBoost** (thresh 0.3335) | 0.9787 | 0.9420 | 0.9412 | 0.9573 | 0.9222 | 0.9492 | 0.0487 |
| Enhanced | Random Forest (thresh 0.5) | 0.9777 | 0.9469 | 0.9732 | 0.9316 | 0.9667 | 0.9520 | 0.0540 |

Majority-class baseline test accuracy: 0.5652 — all four models clear it
decisively.

**Comparison with the historical ML-3/4 test results (old split,
`random_state=42`, XGBoost)** — shown side by side to make old vs. new
explicit, not to average or combine them:

| Tier | ML-3/4 (old split) AUC | ML-5 (NEW split) AUC | ML-3/4 Recall | ML-5 Recall |
|---|---|---|---|---|
| Basic | 0.925 | **0.914** | 0.829 | **0.838** |
| Enhanced | 0.980 | **0.979** | 0.915 | **0.957** |

Results are close across two independent splits — a reassuring stability
signal, not a coincidence to rely on alone, but consistent with the
earlier findings not being an artifact of one particular test partition.

## 12. Confusion Matrices (final test set, n=207)

```
Basic / XGBoost  (threshold 0.4681)        Basic / Random Forest (threshold 0.5)
              Pred 0   Pred 1                            Pred 0   Pred 1
Actual 0        77       13                Actual 0        78       12
Actual 1        19       98                Actual 1        19       98

Enhanced / XGBoost (threshold 0.3335)      Enhanced / Random Forest (threshold 0.5)
              Pred 0   Pred 1                            Pred 0   Pred 1
Actual 0        83        7                Actual 0        87        3
Actual 1         5      112                Actual 1         8      109
```

All four matrices were independently re-derived arithmetically from their
reported metrics and confirmed consistent (same check as
`ml_final_audit.md` §6).

## 13. Metrics (see §11 table — repeated here per the requested structure)

Accuracy, Precision, Recall/Sensitivity, Specificity, F1, ROC-AUC, and
Brier score for all four final-test evaluations are in §11.

## 14. Calibration Curves

Reliability diagrams saved to `reports/figures/`:
- `ml5_calibration_dev_oof.png` — **primary** calibration evidence
  (development out-of-fold, n=828, larger and less noisy).
- `ml5_calibration_test.png` — final test set (n=207), shown for
  corroboration.

**Development OOF (primary read):** both tiers track the diagonal
reasonably closely across the probability range, with mild overconfidence
at the extreme high end (predicted ~0.95–0.99 vs. observed 1.0 in the
top 1–2 bins) — plausibly a small-bin-count artifact rather than systematic
miscalibration, given the dev set's own bin sizes there are still modest.

**Final test set (n=207, 10 bins ⇒ ~20 points/bin):** noisier, as expected
at this sample size — the Basic tier shows visible deviation in low
probability bins (observed frequency higher than predicted in the lowest
bins), while the Enhanced tier tracks the diagonal closely throughout. This
is reported as an honest observation, not smoothed over: **the Basic
model's calibration in the low-risk region is the weakest link found in
this analysis** and would benefit from a larger validation sample or an
explicit recalibration step (e.g. Platt scaling / isotonic regression) if
this tier is deployed — noted as a limitation (§16), not fixed here, since
adding a recalibration wrapper wasn't part of the frozen model
configuration and would itself need dev-only validation before being
adopted.

## 15. Final Model Artifacts / Deployment Configuration

Saved under `artifacts/` (new location — does **not** touch or overwrite
the original single-tier model's artifacts in
`Resource files/northern_bangladesh_heart_disease_artifacts/`):

- `a_basic_xgboost_pipeline.joblib` — complete fitted sklearn `Pipeline`
  (preprocessing + XGBoost), fit on the full 828-record development set.
- `b_enhanced_xgboost_pipeline.joblib` — same, Enhanced tier.
- `a_basic_model_metadata.json` / `b_enhanced_model_metadata.json` —
  feature list, hyperparameters, frozen threshold + rationale + documented
  alternatives (default/Youden/sensitivity-target), development and
  final-test metrics, and limitations, in the same style as the original
  deployed model's metadata file.

These are ML-5 deliverables only — **no backend or API integration has
been done with them**, per your instruction.

## 16. Limitations and External-Validation Caveats

- Single-institution, retrospective, hospital-admitted cohort — not a
  population-screening sample (case-mix bias caveat, unchanged from every
  earlier phase).
- The label-construction question (how `Heart Disease` was originally
  assigned) remains open and independently unverifiable — Enhanced tier's
  strong performance still leans partly on the same LDL/Total-Cholesterol/
  Triglycerides variables flagged in the original audit.
- **No external validation cohort exists** — both the old (seed=42) and new
  (seed=2026) splits are draws from the *same* single-institution sample,
  so their agreement (§11) demonstrates within-sample split-stability, not
  generalisation to a different population or institution.
- Basic-tier calibration in the low-probability region is the weakest
  empirical finding in this phase (§14) — worth a larger sample or explicit
  recalibration before relying on the raw probability number for Basic in
  a real deployment.
- Advanced/research feature set was evaluated for the "does more
  information help" research question only (§6 shows it does, reaching
  AUC≈0.998 on development CV) — it remains excluded from the deployment
  architecture per your instruction, and its near-ceiling performance
  carries the same leakage-adjacent caution as before (Troponin-I,
  Haemoglobin).
- Only 5 CV folds were available for the paired significance tests (§6) —
  low statistical power; "no significant difference" should not be read as
  "proven equivalent."

## 17. Test-Set Discipline Statement

**The new final test set (`random_state=2026`, n=207) was not used for any
model selection, feature selection, hyperparameter tuning, threshold
selection, or algorithm comparison decision in this phase.** It was loaded
once for split-provenance logging (notebook 06, cell 2) and not referenced
again until §11/§12 above, after every decision in §6–§10 was frozen using
development-set (n=828) evidence exclusively. This was verified by
construction (the notebook's cell order and variable scope), the same way
the ML-3/4 violation was originally detected by inspecting cell-by-cell
`test_df` references (`ml_final_audit.md` §1) — that same check was applied
to this notebook before writing this statement, not assumed.
