# Dataset Audit — Northern Bangladesh Heart Disease Dataset

**Source file:** `Resource files/Heart_diasease_dataset_from_Northern_Bangladesh.xlsx`
(sheet `Our Dataset`). *Note: the ML-integration brief referenced `data/...xlsx`;
no `data/` folder exists in this project — the original file location under
`Resource files/` is used directly rather than duplicating it, to avoid two
copies drifting out of sync.* The file is untouched by this audit.

**Continuity note:** This project already has one executed, leakage-audited
ML notebook (`Resource files/Northern_Bangladesh_Heart_Disease_ML_Revised.executed.ipynb`)
and a deployed single-tier Random Forest model (Phase 3 of the web app, already
live). This audit recomputes everything **directly from the raw Excel file**
rather than trusting memory of that earlier work, and cross-checks against it
below — the numbers match everywhere they overlap, which is a useful
independent confirmation. Where this audit finds something the earlier pass
already established (e.g. `UNIT` leakage, pediatric records, troponin
censoring), that's noted explicitly rather than presented as new.

## 1. Shape and Structure

- **1,048 rows × 27 columns**, exactly as documented.
- **Zero exact duplicate rows.**
- Three column names have stray whitespace that must be stripped before use:
  `' Age'` (leading space), `'Troponin-I '` (trailing space), and
  `'Troponin- I assay type'` (embedded space). Using the raw names as-is
  silently breaks column lookups (e.g. `'Age' in df.columns` is `False` on
  the raw file) — this is a data-quality issue in its own right, not just a
  formatting nuisance.

## 2. Column-by-Column Audit

| Column | dtype (raw) | Missing | % | Unique | Notes |
|---|---|---|---|---|---|
| SL | int64 | 0 | 0.0% | 1048 | **Confirmed pure row index**: `SL == row_position + 1` for all 1048 rows. Carries zero information beyond ordering. |
| Age | int64 | 0 | 0.0% | 83 | Range 4–97. 13 records < 18 (pediatric) — see §4. |
| Sex | object | 0 | 0.0% | 2 | `M` / `F`. |
| Height (cm) | float64 | 66 | 6.30% | 46 | Range 102–186 (pediatric records pull the low end). |
| Weight (kg) | float64 | 27 | 2.58% | 69 | Range 17–101; the three lowest values (17, 17, 18 kg) belong to pediatric records, not data errors. |
| BMI | float64 | 91 | 8.68% | 561 | Continuous, derivable from height/weight. |
| Family H/O | float64 | 68 | 6.49% | 2 | Binary 1.0/0.0. |
| Hypertension | float64 | 99 | 9.45% | 2 | Binary; highest missingness among the binary history flags. |
| Diabetes | float64 | 34 | 3.24% | 2 | Binary. |
| Total_Cholesterol(mg/dL) | float64 | 21 | 2.00% | 161 | Range 120–294. |
| BP(mmHg) | float64 | 11 | 1.05% | 20 | **Single composite value** (e.g. 120, 130) — confirmed not split systolic/diastolic, consistent with the earlier notebook. |
| H/O ChestPain | float64 | 33 | 3.15% | 2 | Binary. |
| RBS(mmol/L) | float64 | 20 | 1.91% | 260 | Random blood sugar. Range 3.16–31.6. |
| HDL(mg/dL) | float64 | 44 | 4.20% | 53 | |
| LDL(mg/dL) | float64 | 46 | 4.39% | 159 | |
| Triglycerides(mg/dL) | float64 | 51 | 4.87% | 234 | |
| MaxHR | float64 | 0 | 0.0% | 146 | See §5 — strongly age-derived. |
| Himoglobin [sic] | **object** | 51 | 4.87% | 121 | Stored as text; one stray value `` `2.6 `` (leading backtick) needs cleaning. Parseable range 3.4–17.6 g/dL. |
| Creatinine(mg/dL) | float64 | 48 | 4.58% | 200 | |
| Platelets | float64 | 74 | 7.06% | 251 | |
| Sodium(mmol/L) | float64 | 71 | 6.77% | 240 | |
| Potassium | **object** | 73 | 6.97% | 65 | Stored as text; one stray value `4,3` (comma decimal). Parseable range 2.3–6.9. |
| Chloride | **object** | 78 | 7.44% | 208 | Stored as text; two stray values `106,4` and `106. 8` (comma decimal / space-after-decimal). Parseable range 78.0–131.1. |
| Troponin-I | **object** | 46 | 4.39% | 572 | Stored as text — see §6, censored values present. |
| Troponin- I assay type | object | 46 | 4.39% | 2 | `Quantitative Troponin-I (ng/mL)` vs `High-Sensitivity Troponin-I (ng/L)` — two different units/scales, see §6. |
| **Heart Disease** (target) | int64 | 0 | 0.0% | 2 | 598 positive (57.1%) / 450 negative (42.9%). Mild imbalance. |
| UNIT | object | 0 | 0.0% | 2 | `CCU` / `General` — see §7, severe leakage. |

Four columns that are semantically numeric (Himoglobin, Potassium, Chloride,
Troponin-I) are stored as **text**, each with a small number of stray
formatting artifacts (backtick, comma-decimal, space-after-decimal) on top of
genuine numeric values as strings — these need explicit, documented parsing
before modelling, not a blanket `pd.to_numeric(errors='coerce')` (which would
silently turn the 21 troponin censored/artifact values into `NaN`, discarding
real information — see §6).

## 3. Target Distribution

`Heart Disease`: **598 positive / 450 negative** (57.1% / 42.9%) — mild class
imbalance, consistent with the earlier notebook. No missing target values.

## 4. Pediatric Records (Age < 18)

**13 records**, ages `[4, 4, 5, 6, 6, 8, 9, 11, 11, 12, 13, 15, 16]`, and
**all 13 are `Heart Disease = 1`** with no exceptions. If these records stay
in the modelling population, "is this patient a child" becomes a perfect,
mechanical predictor of the positive class in the training data — a
population-definition problem, not a feature-engineering one. This project's
stated audience (general adult risk screening) and this finding together
argue for restricting the modelling population to adults (Age ≥ 18),
consistent with the earlier notebook's approach. This is a **data-population**
decision, separate from feature selection, and should be made explicitly
(and reported as an exclusion with a record count) rather than silently.

## 5. Derived-Variable Check: MaxHR vs Age

`MaxHR` correlates with `Age` at **r = −0.926** — a very strong relationship,
consistent with MaxHR being substantially explained by an age-based formula
(the earlier notebook found R² ≈ 0.849 for MaxHR ≈ 206.13 − 0.75×Age). This
matters directly for the Basic/Enhanced feature-group decision (§ see
`feature_groups.md`): once `Age` is a mandatory Basic field, `MaxHR` adds
comparatively little independent information, and it is not something an
ordinary user can self-report without a stress test or a target-heart-rate
calculation — both push it out of the "Basic" tier regardless of its raw
correlation with the outcome.

## 6. Troponin-I — Detailed Investigation

- **Two assay types** are mixed in a single column with incompatible scales:
  - `Quantitative Troponin-I (ng/mL)`: n=800, range 0.01–33.95
  - `High-Sensitivity Troponin-I (ng/L)`: n=181, range 45.0–65,860.0
  These are different units on different instruments — they are **not
  directly comparable as a single numeric feature** without harmonisation
  (unit conversion and/or an assay-type indicator), exactly as the earlier
  notebook concluded.
- **Censored values are present on both ends**, not just the high end
  previously documented: 18 values contain `>` (e.g. `>25000`, `>2.5` —
  instrument-saturated highs), and at least one value (`<2.50`) is
  **low-censored**, which the earlier notebook's `Troponin_Censored_High`
  flag does not capture. This is a genuine refinement over the earlier
  pass and should be handled explicitly (e.g. a two-sided or general
  `is_censored` indicator) rather than assumed to be high-only.
- Parseable (non-censored) values range up to 65,860 (High-Sensitivity
  assay), with 94 values above 1,000 — large dynamic range even within one
  assay type.
- **Clinical appropriateness concern (as specifically requested):** troponin
  is an acute myocardial injury marker, ordered when acute cardiac injury is
  already clinically suspected — the *decision to draw it*, and *which assay
  was used*, likely both reflect a clinical triage judgement made before the
  prediction would occur, not background risk information an ordinary user
  could supply. This is the same category of concern as `UNIT` below, just
  less absolute. See `feature_groups.md` for the resulting tier decision and
  the recommended sensitivity-analysis treatment.

## 7. UNIT — Confirmed Severe Leakage

| UNIT | n | Heart Disease = 0 | Heart Disease = 1 |
|---|---|---|---|
| CCU | 370 | 0 | 370 |
| General | 678 | 450 | 228 |

**100% of CCU-admitted records are positive.** Ward assignment is a
downstream clinical decision made *after* (or concurrent with) diagnosis —
using it as a predictor would let the model trivially "cheat" by learning
"admitted to CCU ⇒ positive," which is not predictive information available
at the point a real user would use this tool. Confirmed excluded, consistent
with the earlier notebook.

## 8. Correlation with Target (numeric/binary features, Pearson)

| Feature | r with Heart Disease |
|---|---|
| LDL(mg/dL) | **0.674** |
| Total_Cholesterol(mg/dL) | **0.601** |
| Triglycerides(mg/dL) | **0.566** |
| Himoglobin | **−0.524** |
| H/O ChestPain | 0.449 |
| RBS(mmol/L) | 0.443 |
| Age | 0.427 |
| Creatinine(mg/dL) | 0.374 |
| MaxHR | −0.373 |
| Diabetes | 0.346 |
| Family H/O | 0.333 |
| Sodium(mmol/L) | −0.271 |
| Hypertension | 0.271 |
| Weight (kg) | 0.259 |
| BMI | 0.250 |
| Troponin-I | 0.226 |
| HDL(mg/dL) | −0.181 |
| Chloride | 0.103 |
| BP(mmHg) | −0.094 |
| Platelets | −0.072 |
| Height (cm) | 0.025 |
| Potassium | −0.024 |

**Important continuity flag:** the four strongest correlations — **LDL,
Total Cholesterol, Triglycerides, and Haemoglobin** — are exactly the same
four variables the earlier notebook flagged as showing *abnormally high*
correlation with the target for a retrospective clinical cohort, and treated
as an open, unresolved limitation (documented in project memory as the
"label-construction blocker": a supervisor/custodian check on how the
`Heart Disease` label was actually assigned was never obtainable, and the
concern was only *bounded*, not resolved, via a sensitivity analysis showing
the model still reaches ~0.976 AUC with these four removed, attributed to
case-mix/spectrum bias). This audit reproduces the same four variables from
first principles on the raw file, which is a useful independent confirmation
that this isn't a one-off artifact of the earlier cleaning pipeline — but it
does **not** resolve the underlying question. The same caution must be
carried into the new Basic/Enhanced/Advanced experiments: these four
variables should not be placed in "Basic/mandatory" purely on correlation
strength, and any model that leans heavily on them should be re-run with them
removed as a sensitivity check, exactly as before.

Also notable: **BP has a near-zero, slightly negative univariate correlation
(−0.094)** despite being a standard cardiovascular risk factor — this may
reflect a nonlinear or interaction effect (plausible clinically) rather than
BP being uninformative, and should be re-examined with model-based
(multivariate) importance in Phase ML-3/4 rather than judged on this
univariate number alone.

## 9. Implausible / Out-of-Range Values (loose sanity bounds only)

Using wide sanity bounds (not clinical thresholds — see the same caveat
applied throughout the rest of this project):

- **Weight:** 3 values at 17–18 kg — all belong to the pediatric records
  (§4), clinically plausible for that age, not data errors.
- No other numeric column produced values outside its loose sanity bounds
  (age, height, BMI, BP, MaxHR, RBS, cholesterol/HDL/LDL/triglycerides,
  creatinine, platelets, sodium all fell within wide physiological ranges
  once parsed).
- The only genuine *formatting* artifacts are the four text-value columns
  already listed in §2 (backtick, comma-decimal, space-after-decimal,
  troponin censoring) — these are parsing issues, not implausible
  measurements.

## 10. Limitations Carried Forward

- **No patient identifier exists** beyond `SL` (which is just row order) —
  duplicate/repeated-patient detection is not possible from the supplied
  columns; exact-row duplication is ruled out (0 found), but repeat visits
  by the same patient cannot be. This is an inherited limitation, not new.
- **Label construction is still not independently verifiable** (§8) — this
  audit does not resolve it, only reconfirms the same signal from raw data.
- Retrospective, single-institution, hospital-admitted cohort — not a
  population-screening sample. Same case-mix caveat as before applies to any
  new results.

## 11. What Changed vs. the Earlier Audit

Nothing already established was overturned. This pass adds: (a) the
double-sided troponin censoring finding (`<2.50` as well as `>25000`-style
highs), (b) explicit identification of the exact stray-text values in
Himoglobin/Potassium/Chloride, (c) confirmation that `SL` is literally row
position (not just "looks like an identifier"), and (d) the MaxHR–Age
redundancy finding framed specifically for the new Basic/Enhanced tiering
decision. See `feature_groups.md` for how these facts translate into the
proposed Basic / Enhanced / Advanced / Excluded architecture.
