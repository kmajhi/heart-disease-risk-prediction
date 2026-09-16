# ML Final Audit — Test-Set Discipline, Wording, and Consistency Review

Companion to `notebooks/05_methodological_audit.ipynb` (executed, 0 errors).
This audit was requested before approving Phase ML-5. It finds **one real
methodological error** (test-set discipline), corrects it, and confirms the
final feature/model decisions are unchanged after the correction. Two
wording issues are also corrected. No experiment results are hidden or
discarded — see `ml_experiment_plan.md` and `feature_selection.md`, which
now carry inline ⚠ pointers to this document at the affected sections.

## 1. The Test-Set Issue — Confirmed Real, Not a False Alarm

**What was claimed:** `ml_experiment_plan.md` said the test set was "used
exactly once per group" for final evaluation.

**What actually happened**, confirmed by re-inspecting
`notebooks/04_feature_selection_and_shap.ipynb` cell-by-cell (see notebook
05 §1 for the grep-level proof):

| Notebook 04 cell | What it did | Touches `test_df`? |
|---|---|---|
| 8 | Permutation importance for A and B | **Yes** |
| 11 | SHAP global importance for A and B | **Yes** |
| 14 | Full-vs-trimmed Enhanced comparison — printed CV-AUC **and** Test-AUC/Test-Recall together, and the accompanying markdown cited both as joint justification | **Yes** |
| 17 | "Final" recommended-model metrics | Yes (intended as the single final look) |

The test set was inspected **at least three times** — to compute
permutation importance, to compute SHAP, and again while confirming the
trim — all before the feature set that cell 17 then evaluated was actually
frozen. Additionally, `notebooks/03_model_comparison_experiments.ipynb`
cell 13 evaluated Random Forest vs XGBoost on `test_df` for the
**untrimmed** B feature set, before the trim decision existed at all, and
that observation (XGBoost's test-set recall edge) was cited when
recommending XGBoost. **The user's concern is correct: the "used once"
claim was not accurate, and the algorithm recommendation, not just the
MaxHR/HDL trim, was also partly informed by test-set numbers.**

This is a genuine process error, not a numerical leakage that necessarily
invalidates the final metrics (see §5), but it does mean the strict
guarantee "the final test set remained unseen until all decisions were
frozen" cannot honestly be claimed for the process as originally run.

## 2. Redo: MaxHR/HDL Decision, CV-Only (train split only)

Per the requested correction, both the permutation-importance ranking and
the full-vs-trimmed comparison were **redone using only the 80% training
split**, with leakage-safe, out-of-fold 5-fold CV (fit on each fold's
training portion, evaluate importance on that fold's untouched validation
portion — `test_df` never referenced). Full code and output:
`notebooks/05_methodological_audit.ipynb` §2–3.

**Out-of-fold permutation importance (train-only):**

| Feature | AUC drop |
|---|---|
| LDL | 0.0565 |
| Triglycerides | 0.0293 |
| RBS | 0.0193 |
| Total Cholesterol | 0.0178 |
| BP | 0.0079 |
| Diabetes | 0.0064 |
| H/O ChestPain | 0.0040 |
| Age | 0.0035 |
| Hypertension | 0.0022 |
| Weight | 0.0014 |
| **MaxHR** | **0.0005** |
| **HDL** | **0.0002** |
| Height | 0.0002 |
| Family H/O | 0.0001 |

**Full-vs-trimmed, CV-only:**

| Variant | CV-AUC | CV-Recall |
|---|---|---|
| Full (6 fields) | 0.9817 ± 0.0045 | 0.9295 ± 0.0248 |
| **Trimmed (4 fields)** | 0.9815 ± 0.0044 | **0.9359 ± 0.0151** |

**Result: the same conclusion.** MaxHR and HDL remain the two weakest
features by roughly the same wide margin, and the trimmed set costs
nothing on clean CV evidence (recall is actually slightly *higher* and more
stable — lower SD — for the trimmed set). **No change to the final Enhanced
feature list.** The original test-set-informed process happened to reach
the same answer a clean process reaches — reassuring, but the process
itself still needed correcting, which is why this redo was necessary
regardless of the outcome matching.

## 3. Statistical Test: Random Forest vs XGBoost

Per instruction #2, "statistically equivalent" is not used unless a test
was actually run. One now has been: a **paired t-test on 5-fold CV ROC-AUC
scores** (same folds for both algorithms, since both use the identical
`StratifiedKFold(random_state=42)` object — legitimately paired), on the
**frozen** Basic and Enhanced-trimmed feature sets, train split only:

| Feature set | XGBoost folds | RF folds | t | p |
|---|---|---|---|---|
| A_Basic | [0.900, 0.911, 0.937, 0.968, 0.933] | [0.899, 0.897, 0.917, 0.966, 0.936] | 1.627 | **0.179** |
| B_Enhanced_trimmed | [0.977, 0.982, 0.976, 0.988, 0.984] | [0.974, 0.983, 0.979, 0.991, 0.985] | −0.755 | **0.492** |

**No statistically significant difference at α=0.05 for either feature
set.** Corrected wording now used throughout: Random Forest's performance
is **"comparable"** to XGBoost's, with the paired-test result cited as
support. Important caveat, stated explicitly rather than glossed over:
**with only 5 paired folds, this test has low statistical power** — "no
significant difference found" means exactly that, not "proven equivalent."
Both `ml_experiment_plan.md` locations that used "statistically
indistinguishable" / "statistically equivalent" have been corrected in
place.

## 4. Calibration Wording

Per instruction #1: `ml_experiment_plan.md` §10 previously said decreasing
Brier scores meant probabilities were "better calibrated." **Corrected.**
Brier score combines discrimination and calibration; a lower score is
consistent with, but does not prove, better calibration on its own — no
reliability diagram, calibration curve, or formal calibration test (e.g.
Hosmer–Lemeshow) was performed in this phase. The section has been renamed
"Brier Score (not, by itself, a calibration claim)" and now explicitly
defers a real calibration analysis to Phase ML-5, rather than asserting one
already happened.

## 5. Does the Test-Set-Discipline Issue Invalidate the Reported Final Numbers?

**No — the final reported metrics themselves are very likely still
reliable point estimates**, for a specific, checkable reason: the decision
that was influenced by early test-set peeking (drop MaxHR/HDL) is
**re-derived identically from clean CV-only evidence** in §2 above. The
feature set being evaluated in the "final" test-set pass (cell 17 of
notebook 04) is therefore the *same* feature set a fully clean process
would have arrived at — the contamination affected the *process*, not the
*outcome*, in this specific case. This is a claim that was checked, not
assumed.

**What is genuinely still an open limitation, not fully resolved by the
redo:** this specific 20%-test-split has now been *inspected* (not just
re-derived-around) multiple times by the person running these experiments.
Strict test-set discipline would call for either (a) accepting this
split's numbers with this limitation disclosed, given the redo
independently confirms the decision, or (b) generating a fresh held-out
split for a truly first-look final evaluation. Given the redo converges on
an identical answer and the practical bias risk is low, **(a) is
recommended** rather than re-splitting and re-running the full comparison —
but this is flagged explicitly as a judgment call, not asserted as settled,
since only you can weigh whether that residual risk is acceptable for this
project's purposes.

## 6. Confusion-Matrix / Metric Consistency Check

Every reported confusion matrix was independently re-derived from its raw
TN/FP/FN/TP counts and compared to the reported accuracy/precision/recall/
specificity/F1 (notebook 05 §5):

| Model | Result |
|---|---|
| A_Basic / XGBoost (final) | **CONSISTENT** — all 5 metrics match to 4 decimal places |
| B_Enhanced_trimmed / XGBoost (final) | **CONSISTENT** |
| B_full / Random Forest | **CONSISTENT** |

No arithmetic errors found. Row totals also independently confirmed to
equal n=207 in every case, and TN+FP=90 / FN+TP=117 consistently across all
checked matrices, matching the test split's known class counts.

## Answers

**A. Are the current ML-3/ML-4 results methodologically clean as-is?**
Not as originally documented — the test set was inspected multiple times
during feature selection, and two wording claims overstated what was
shown. Both are corrected now, in place, in the original reports (marked
with ⚠ pointers to this document, nothing deleted).

**B. Does any experiment need to be rerun?**
The MaxHR/HDL feature-selection comparison **has been rerun** cleanly
(CV-only) — same conclusion, no change to the Enhanced feature list. The
RF-vs-XGBoost comparison **has been rerun** as a formal paired test — same
practical conclusion ("comparable"), now with a real test behind the
wording. **No experiment needs a further rerun.** The one residual, open
question is whether you want a *fresh test split* for extra rigor (§5) —
recommended not strictly necessary, but your call.

**C. Exact final Basic feature schema (unchanged):**
`Age`, `Sex`, `Height (cm)`, `Weight (kg)`, `BP(mmHg)`, `Family H/O`,
`Hypertension`, `Diabetes`, `H/O ChestPain` — 9 fields. `BMI` computed from
Height+Weight for display only, never a model feature or form field.

**D. Exact final Enhanced feature schema (unchanged, now on clean grounds):**
9 Basic fields **+** `Total_Cholesterol(mg/dL)`, `LDL(mg/dL)`,
`Triglycerides(mg/dL)`, `RBS(mmol/L)` — 13 fields total. `MaxHR` and `HDL`
confirmed excluded by clean CV-only evidence.

**E. Does XGBoost remain the recommended deployment model?**
Yes, for both tiers — but the reason is now stated correctly: not because
it's "statistically superior" or "proven equivalent to RF," but because its
performance is **comparable to Random Forest with no significant
difference found**, and it showed a **consistent-or-better recall** on the
single legitimate test-set look available (0.829 vs 0.829 tied for Basic;
0.915 vs 0.863 favoring XGBoost for Enhanced). Random Forest remains a
documented, defensible, simpler-dependency alternative.

**F. Ready to proceed to ML-5 / final model selection?**
**Yes**, with the corrections in this document treated as the
authoritative, current state of the methodology — the underlying feature
groups, algorithm choice, and headline metrics from ML-3/ML-4 all survive
the audit unchanged; only the process description and two wording claims
needed fixing, and both are now fixed in place.
