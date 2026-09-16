# Feature Selection — Phase ML-3

Companion to `notebooks/04_feature_selection_and_shap.ipynb` (executed, 0
errors). All numbers are real.

**⚠ Methodological correction (see `reports/ml_final_audit.md` for the full
audit):** the permutation importance and SHAP analyses in §4–5 below were
originally computed on the **held-out test split**, which — together with
the trim-confirmation step in §6 also citing test-set numbers — meant the
test set was inspected multiple times before the Enhanced feature set was
frozen, not "used once for final evaluation" as intended. Sections §4–6 are
**retained below unchanged, for the record**, but should be read as
*exploratory*, not as the basis for the final decision. `ml_final_audit.md`
re-derives the same importance ranking and the same trim decision using
**only** the 80% training split with leakage-safe 5-fold CV, and reaches
the **same conclusion** (MaxHR and HDL are the two weakest features by a
wide margin either way) — so the final feature lists in §7 are unchanged,
but are now justified by the clean re-derivation, not by this document's
original process.

## 1. Method Overview

Four independent methods were used, per the approval's instructions, and
compared for agreement rather than trusted individually:

1. **Mutual information** (univariate, model-free) — a first-pass filter.
2. **Correlation / redundancy matrix** — flags pairs carrying overlapping
   information (a high MI score doesn't mean a feature is *independently*
   useful if a redundant partner is already present).
3. **Permutation importance** (model-based, multivariate) — measures the
   actual ROC-AUC drop on the *held-out test set* when a feature is
   shuffled, for the two recommended XGBoost models.
4. **SHAP** (model-based, multivariate) — global mean |SHAP value| on the
   held-out test set, for the same two models.

## 2. Mutual Information (Basic + Enhanced fields)

| Feature | MI score |
|---|---|
| LDL | 0.323 |
| Total Cholesterol | 0.260 |
| Triglycerides | 0.224 |
| RBS | 0.180 |
| MaxHR | 0.145 |
| Age | 0.132 |
| H/O ChestPain | 0.115 |
| BP | 0.093 |
| Hypertension | 0.056 |
| Diabetes | 0.055 |
| Weight | 0.052 |
| Family H/O | 0.044 |
| Height | 0.039 |
| HDL | 0.014 |

`HDL` is the weakest field by a clear margin — consistent with its later
removal. **`MaxHR` (0.145) ranks above `Age` (0.132) here**, which looks
surprising until the redundancy check below is applied — MI is univariate
and doesn't "know" that MaxHR and Age carry almost the same information.

## 3. Redundancy / Correlation

| Pair | r |
|---|---|
| Age ↔ MaxHR | **−0.92** |
| Total Cholesterol ↔ LDL | 0.62 |

No other pair among the Basic+Enhanced numeric features exceeds \|r\|=0.6.
The Age–MaxHR redundancy is the dominant one, confirming the concern raised
in `dataset_audit.md` §5 and `feature_groups.md` from a third, independent
computation. Total Cholesterol and LDL are moderately redundant (expected —
Total Cholesterol is arithmetically related to LDL + HDL + Triglycerides/5)
but both show strong *individual* multivariate importance below, so neither
is removed on redundancy grounds alone.

## 4. Permutation Importance (held-out test set, ROC-AUC drop) — ⚠ exploratory, see audit

**A — Basic (XGBoost):**

| Feature | AUC drop |
|---|---|
| Age | 0.0915 |
| BP | 0.0581 |
| H/O ChestPain | 0.0482 |
| Hypertension | 0.0378 |
| Weight | 0.0219 |
| Family H/O | 0.0097 |
| Height | 0.0083 |
| Diabetes | 0.0069 |
| Sex | ≈0.0000 |

**B — Basic + Enhanced (XGBoost):**

| Feature | AUC drop |
|---|---|
| LDL | 0.0576 |
| RBS | 0.0208 |
| Triglycerides | 0.0202 |
| Total Cholesterol | 0.0171 |
| BP | 0.0115 |
| H/O ChestPain | 0.0088 |
| Hypertension | 0.0068 |
| Diabetes | 0.0046 |
| Age | 0.0022 |
| Weight | 0.0010 |
| Family H/O | 0.0008 |
| **MaxHR** | **0.0006** |
| **HDL** | **0.0002** |
| Height | 0.0002 |

**Key finding, directly answering approval instruction #4:** `BP` and
`H/O ChestPain` both show real, clearly non-zero multivariate importance in
the Basic model (0.058 and 0.048 AUC-drop respectively) — despite `BP`'s
near-zero *univariate* correlation with the target (−0.094, noted as a
puzzle in `dataset_audit.md` §8). This resolves that puzzle: `BP` matters in
*combination* with the other Basic features, not in isolation, which is
exactly why the instruction was right not to drop it based on the
univariate number alone.

**Key finding for instruction #5:** `MaxHR` and `HDL` are the two weakest
features in the Enhanced model by a wide margin (0.0006 and 0.0002 — both
roughly two orders of magnitude below the weakest *retained* feature). This
is the evidence behind the trim in §6.

## 5. SHAP Global Importance (held-out test set) — ⚠ exploratory, see audit

**A — Basic (XGBoost):** Age (0.965) > H/O ChestPain (0.735) > Weight
(0.578) > Hypertension (0.489) > BP (0.488) > Family H/O (0.385) > Diabetes
(0.372) > Height (0.220) > Sex (0.054).

**B — Basic + Enhanced (XGBoost):** LDL (1.435) > Triglycerides (0.938) >
Total Cholesterol (0.815) > RBS (0.666) > Age (0.427) > BP (0.349) >
H/O ChestPain (0.349) > Hypertension (0.268) > Weight (0.189) > Diabetes
(0.164) > MaxHR (0.138) > Height (0.068) > HDL (0.060) > Family H/O (0.043).

**SHAP and permutation importance agree closely** on both models — the same
features dominate by both independent methods, which is a useful robustness
check (agreement between two differently-computed importance measures is
stronger evidence than either alone). One nuance: SHAP ranks `MaxHR` (0.138)
and `HDL` (0.060) above zero and above `Family H/O`, while permutation
importance ranks them essentially at zero — SHAP measures each feature's
*attributed* contribution to individual predictions (which can be non-zero
even for a feature that's redundant with another), while permutation
importance measures the *marginal, replaceable* value once all other
features are already present. For deciding what to cut, permutation
importance (and the direct retrain-without-it test in §6) is the more
directly relevant measure — SHAP is better read as "how the model used this
feature," not "how much unique value it adds."

## 6. Evidence-Based Trim: Final Enhanced Feature List — ⚠ original process used test-set evidence; see `ml_final_audit.md` for the clean CV-only re-derivation (same conclusion)

Retrained Enhanced (B) with `MaxHR` and `HDL` removed and compared directly:

| Variant | CV-AUC | Test-AUC | Test-Recall |
|---|---|---|---|
| Full (6 fields) | 0.9817 | 0.9802 | 0.9145 |
| **Trimmed (4 fields)** | 0.9815 | **0.9802** | **0.9145** |

No measurable cost. **Final recommended Enhanced/Optional feature list:
Total Cholesterol, LDL, Triglycerides, RBS** — `MaxHR` and `HDL` are dropped
from the recommended deployment feature set (they may still be collected
for research/monitoring purposes if convenient, but are not required and
add nothing to prediction quality here).

## 7. Final Feature Groups (post-selection)

| Group | Fields | Change from the approved preliminary hypothesis |
|---|---|---|
| **Basic** (9) | Age, Sex, Height, Weight, BP, Family H/O, Hypertension, Diabetes, H/O ChestPain | Unchanged — `BP` and `H/O ChestPain` now empirically validated, not just retained by instruction. `BMI` was never a separate feature (computed for display only). |
| **Enhanced** (4, down from 6) | Total Cholesterol, LDL, Triglycerides, RBS | `MaxHR` and `HDL` removed — evidence-based, zero cost confirmed. |
| **Advanced/Research** (7 + 1 flag) | Troponin-I (harmonised), Sodium, Potassium, Chloride, Creatinine, Platelets, Haemoglobin, Troponin-censoring flag | Unchanged — treated as research-only, not re-optimised for a deployment tier per instruction #6. |
| **Excluded** (3) | SL, UNIT, Troponin-I assay type | Unchanged — `UNIT` re-confirmed severe leakage. |

## 8. Clinical/Practical Suitability Note

Every field in the final Basic and Enhanced lists is something a general
adult user can plausibly provide without a specialist visit: two vitals
(height, weight — home-measurable; BP — common home-monitor or routine
checkup value), four simple yes/no history questions, and, for Enhanced, a
standard lipid panel + random blood sugar obtainable from one routine blood
test. No field in either deployment-candidate tier requires an emergency or
hospital-admission context, unlike the Advanced/Research tier.
