# MASTER PROJECT INSTRUCTIONS

## Northern Bangladesh Heart Disease Prediction — ML, Research Proposal, and System Development

You are Claude Code working inside VS Code on a university group research/project titled:

**“Machine Learning-Based Heart Disease Prediction Using Clinical, Anthropometric, and Biochemical Data from Northern Bangladesh”**

Your job is to help develop this project systematically and correctly.

The project will eventually contain:

1. Research proposal
2. Machine learning model development
3. Saved ML inference pipeline/artifacts
4. Django REST API
5. React frontend
6. Final documentation/report

At the current stage, the **ML/research methodology and proposal are the priority**. Do not prematurely build the Django/React system unless explicitly requested.

---

# 1. PROJECT FILE STRUCTURE

All reference materials are located inside:

```text
resource files/
```

Before making substantive decisions, inspect the relevant files in that folder.

Expected resources may include:

* Research proposal/document
* Original Excel dataset
* Existing Google Colab/Jupyter notebook for ML
* University project instructions/rubric
* Older drafts or supporting documents

The existing ML notebook is important.

Expected notebook:

```text
Northern_Bangladesh_Heart_Disease_ML_Revised.ipynb
```

Do NOT automatically discard or rebuild the existing notebook from scratch.

First audit it carefully and preserve valid advanced work where appropriate.

---

# 2. SOURCE-OF-TRUTH RULE

The actual dataset and supplied project documents are the primary sources of truth.

Do not invent:

* dataset characteristics
* sample counts
* feature names
* model performance
* research findings
* clinical conclusions
* demographic statistics
* missing-value counts
* accuracy/AUC/F1/etc.
* feature importance rankings

If something has not actually been calculated, clearly label it as:

* proposed
* expected
* to be evaluated
* not yet determined

Never fabricate experimental results.

If the supplied documents conflict with the actual dataset, investigate and explicitly identify the discrepancy.

---

# 3. DATASET — VERIFY ACTUAL STRUCTURE

The current dataset is the clinical cardiac dataset collected from:

**Zia Heart Foundation Hospital & Research Institute, Northern Bangladesh**

The dataset currently appears to contain:

* approximately 1,048 patient records
* 27 columns in the actual Excel file
* binary target: `Heart Disease`

However, these numbers must be rechecked directly from the actual Excel file before being used in final outputs.

The actual columns previously identified are:

```text
SL
 Age
Sex
Height (cm)
Weight (kg)
BMI
Family H/O
Hypertension
Diabetes
Total_Cholesterol(mg/dL)
BP(mmHg)
H/O ChestPain
RBS(mmol/L)
HDL(mg/dL)
LDL(mg/dL)
Triglycerides(mg/dL)
MaxHR
Himoglobin
Creatinine(mg/dL)
Platelets
Sodium(mmol/L)
Potassium
Chloride
Troponin-I 
Troponin- I assay type
Heart Disease
UNIT
```

Do not assume these names are correct if the current Excel file differs.

Always inspect the actual file and preserve the canonical column names required for reproducibility.

---

# 4. DATA AUDIT

Perform a comprehensive audit of the actual dataset.

Check:

## Dataset structure

* number of rows
* number of columns
* column names
* data types
* numerical variables
* categorical variables
* binary variables
* target variable
* identifier-like variables
* duplicated rows
* possible repeated patients
* unique-value counts

## Missing data

Calculate missingness for every variable.

Identify:

* variables with substantial missingness
* whether missingness has a clinically meaningful pattern
* whether missingness itself could be informative
* whether the missing-value strategy is leakage-safe

Do not simply delete rows without justification.

---

# 5. DATA QUALITY AND SUSPICIOUS VALUES

Investigate suspicious or unusual values rather than automatically deleting them.

Pay particular attention to:

* Age
* Height
* Weight
* BMI
* Blood pressure
* RBS
* Cholesterol
* HDL
* LDL
* Triglycerides
* MaxHR
* Hemoglobin
* Creatinine
* Platelets
* Sodium
* Potassium
* Chloride
* Troponin-I

Identify:

* impossible values
* implausible values
* extreme outliers
* formatting artifacts
* numeric values stored as text
* inconsistent categorical values
* inconsistent units

Every cleaning rule must have a reason.

Do not remove an observation merely because it is statistically unusual.

---

# 6. TROponin-I — SPECIAL INVESTIGATION

Troponin-I requires special attention.

The dataset may contain both:

```text
Quantitative Troponin-I (ng/mL)
High-Sensitivity Troponin-I (ng/L)
```

and values such as:

```text
>25000
```

Investigate carefully:

1. Troponin assay type
2. Troponin unit
3. Conversion possibilities
4. Whether values are directly comparable
5. Whether assay-specific normalization is required
6. Whether censored values such as `>25000` represent threshold-censored measurements
7. Whether replacing `>25000` with `25000` would introduce distortion
8. Whether log transformation is appropriate
9. Whether assay type itself should be retained
10. Whether troponin or assay information could represent target leakage depending on the clinical prediction timing

Do not silently convert measurements without documenting the reasoning.

If a scientifically defensible harmonization is impossible, explicitly consider:

* assay-specific transformation
* indicator variables
* censoring representation
* exclusion of the problematic feature

Choose the most defensible approach and document it.

---

# 7. IDENTIFIER AND LEAKAGE AUDIT

Investigate:

## `SL`

Determine whether `SL` is merely a serial/identifier field.

If so, it must NOT be used as a predictive feature.

## `UNIT`

Investigate whether `UNIT` contains:

* General
* CCU
* or other ward/unit information.

Determine whether `UNIT` is known at the intended prediction time.

If the variable represents admission/clinical placement that may occur after the underlying disease status has already influenced the clinical decision, treat it as potential target leakage.

Do not automatically include it merely because it improves model performance.

## Other possible leakage

Investigate whether any variable could have been measured, recorded, or assigned after the diagnosis/outcome was determined.

Pay special attention to:

* Troponin
* ward/unit
* diagnostic history
* chest pain history
* treatment-related information
* target construction

Explicitly document the prediction-time assumption.

---

# 8. TARGET INVESTIGATION

The target is:

```text
Heart Disease
```

Verify:

* exact target values
* class counts
* class proportions
* missing target values
* target encoding

Investigate how the target may have been constructed.

If there is any evidence that predictor variables were directly used to construct the target, identify this as possible label leakage or circularity.

Do not make causal claims.

---

# 9. PEDIATRIC RECORDS

The dataset contains a small number of records with Age below 18.

Do not automatically remove them.

Investigate:

* how many pediatric records exist
* whether they are clinically appropriate for the research question
* whether the proposal defines an adult heart disease population
* whether inclusion/exclusion is justified
* whether sensitivity analysis is useful

If the research question is explicitly adult heart disease prediction, propose a defensible adult-population rule and report how many records are affected.

Do not make an arbitrary decision without documenting it.

---

# 10. DUPLICATE / REPEATED PATIENT RISK

Determine whether the dataset contains:

* duplicate rows
* repeated patient records
* multiple visits from the same patient
* potential patient identifiers

If patient-level grouping is possible, prevent the same patient from appearing in both training and test sets.

If patient identity cannot be established from the available dataset, state this as a limitation.

---

# 11. RESEARCH PROPOSAL — HARD PAGE LIMIT

The research proposal has a strict maximum length of:

**6–7 pages maximum.**

This is a hard constraint.

The proposal must NOT become a long technical report.

When writing or revising the proposal:

* prioritize important content
* remove repetition
* use concise academic writing
* avoid unnecessary background material
* avoid excessive technical implementation details
* use compact tables where appropriate
* keep methodology rigorous but concise
* do not include lengthy explanations of standard ML concepts

The final proposal should realistically fit within approximately 6–7 pages under normal university formatting.

Before finalizing the proposal, estimate its page length based on:

* font
* font size
* line spacing
* margins
* headings
* tables
* figures

If exact university formatting is supplied in the resource files, follow it.

If formatting requirements are not supplied, state the assumed formatting.

---

# 12. PROPOSAL STRUCTURE

Use a compact academic structure such as:

1. Title
2. Introduction / Background
3. Problem Statement
4. Aim
5. Objectives
6. Research Questions
7. Dataset Description
8. Proposed Methodology
9. Model Selection
10. Evaluation Strategy
11. Explainability
12. Expected Outcomes
13. Proposed System Architecture
14. Scope and Limitations
15. Ethical/Privacy Considerations
16. Conclusion
17. References, if required

Do not force every heading if combining sections produces a better 6–7 page proposal.

The proposal should clearly communicate:

* what problem is being addressed
* why it matters in the Northern Bangladesh context
* what data will be used
* what ML models will be compared
* how leakage will be prevented
* how models will be evaluated
* how the final model will be selected
* how explainability will be addressed
* how the eventual ML model will integrate into a software system

---

# 13. ER MODEL — INCLUDE ONLY IF JUSTIFIED

Determine whether an **ER (Entity-Relationship) model/diagram** is necessary or useful for the proposal.

Do NOT include an ER diagram simply to fill space.

An ER model is appropriate if it helps explain the planned application/database structure for the eventual system.

If an ER model is included:

* keep it simple
* make it consistent with the proposed Django backend
* use meaningful entities and relationships
* do not invent database fields that are not needed
* distinguish between the ML dataset and the application's operational database
* avoid unnecessarily complex database normalization in the proposal

A reasonable conceptual design may involve entities such as:

* Patient
* ClinicalAssessment / PatientAssessment
* Prediction
* User/Clinician, if authentication is part of the proposed system

But these are examples only.

Inspect the proposal and project requirements before deciding the final ER structure.

If an ER model adds little value or threatens the 6–7 page limit, explicitly recommend omitting it.

If included, create a clean conceptual ER diagram suitable for academic submission and ensure the written proposal references it briefly.

---

# 14. MACHINE LEARNING METHODOLOGY

The required core models are:

1. Logistic Regression
2. Decision Tree
3. Support Vector Machine (SVM)
4. Random Forest

Do not replace these models unless there is a strong methodological reason.

Additional models may only be introduced if they clearly improve the research and do not make the project unnecessarily complex.

---

# 15. TRAIN/TEST SPLITTING

Use a leakage-safe evaluation design.

The test set must remain untouched until final evaluation.

Use:

* stratified splitting for classification
* a fixed random seed for reproducibility
* appropriate validation/cross-validation on training data only

Do not fit preprocessing on the complete dataset before splitting.

---

# 16. PREPROCESSING

Use scikit-learn `Pipeline` and `ColumnTransformer` wherever appropriate.

All preprocessing must be learned from training data only.

Potential preprocessing includes:

* numeric imputation
* categorical imputation
* scaling
* one-hot encoding
* appropriate transformations for skewed variables
* feature engineering only when justified

Do not perform data leakage such as:

```text
fit_transform(X_all)
```

before the train/test split.

Preprocessing must be inside the pipeline used during cross-validation and final inference.

---

# 17. MISSING VALUES

Choose missing-value strategies based on the actual dataset.

Possible approaches include:

* median imputation for appropriate continuous variables
* most-frequent imputation for categorical variables
* missing-indicator variables where justified
* model-specific handling where appropriate

Do not use a single arbitrary strategy for every variable.

Explain the final strategy.

---

# 18. CLASS IMBALANCE

The target appears mildly imbalanced.

Do NOT automatically use SMOTE.

First establish a baseline using:

* stratified splitting
* appropriate evaluation metrics
* class weighting where appropriate

If SMOTE or another resampling technique is evaluated:

* apply it only within the training portion
* perform it inside cross-validation
* never apply it to the held-out test set
* compare it fairly against the baseline

Never oversample before train/test splitting.

---

# 19. MODEL TRAINING AND TUNING

Use appropriate hyperparameter tuning.

Potential approaches:

* GridSearchCV
* RandomizedSearchCV
* nested cross-validation where justified

The existing notebook may already contain nested CV.

Audit that implementation before replacing it.

Ensure:

* tuning happens only on training data
* validation folds are independent
* test data is never used for tuning
* preprocessing is included within the CV pipeline
* model comparison is fair

---

# 20. REQUIRED EVALUATION METRICS

Evaluate the models using appropriate classification metrics.

At minimum consider:

* ROC-AUC
* Accuracy
* Balanced Accuracy
* Sensitivity / Recall
* Specificity
* Precision / PPV
* NPV
* F1-score
* Confusion Matrix

Also evaluate calibration where appropriate:

* Brier score
* calibration curve

Generate appropriate visualizations such as:

* ROC curves
* confusion matrices
* calibration curves
* model comparison plots

Do not claim that one metric alone determines the best clinical model.

---

# 21. THRESHOLD ANALYSIS

Do not automatically assume:

```text
threshold = 0.50
```

If threshold optimization is performed:

* choose the threshold using training/CV or out-of-fold predictions
* do not choose the threshold using the held-out test set
* freeze the threshold before final test evaluation

Explain the rationale for the chosen threshold.

---

# 22. MODEL COMPARISON

Compare the four required models fairly.

If the existing notebook contains:

* nested cross-validation
* DeLong test
* statistical comparison of ROC-AUC
* calibration analysis
* threshold analysis

preserve and audit those components rather than removing them unnecessarily.

Use statistical comparison only when methodologically appropriate.

Do not use significance testing mechanically to declare a model clinically superior.

---

# 23. FINAL MODEL SELECTION

Select the final model based on a clearly stated criterion.

Consider:

* discrimination
* sensitivity
* specificity
* balanced accuracy
* calibration
* clinical interpretability
* robustness
* computational practicality
* suitability for deployment

Do not simply select the model with the highest accuracy.

Do not select the model based on the test set after seeing all test results without a predefined rationale.

---

# 24. EXPLAINABLE AI

Use explainability methods where appropriate.

Possible methods:

* SHAP
* permutation importance
* model-specific feature importance

The existing notebook already contains SHAP/permutation-importance work, so audit it carefully.

Explain:

* global feature importance
* individual prediction explanations where appropriate

IMPORTANT:

Feature importance and SHAP values describe model behavior.

They do NOT prove:

* causation
* biological mechanisms
* clinical risk factors
* treatment effects

Use language such as:

> “The model relied more heavily on…”

rather than:

> “This variable causes heart disease.”

---

# 25. EXISTING NOTEBOOK AUDIT

Inspect the existing:

```text
Northern_Bangladesh_Heart_Disease_ML_Revised.ipynb
```

cell by cell.

Determine:

* what is already correct
* what is incomplete
* what is redundant
* what is potentially leaky
* what is incorrect
* what needs modification
* what should be preserved

The existing notebook is reportedly advanced and may already contain:

* data-quality checks
* troponin harmonisation
* adult-population handling
* leakage assessment
* nested cross-validation
* DeLong comparison
* held-out test evaluation
* calibration
* threshold analysis
* subgroup performance
* permutation importance
* SHAP
* sample prediction
* saved model artifacts

Do not remove these simply to produce a shorter notebook.

Verify whether they are implemented correctly.

---

# 26. NOTEBOOK REQUIREMENTS

The final ML notebook should have a logical structure approximately like:

1. Project introduction
2. Environment setup
3. Imports
4. Load dataset
5. Dataset overview
6. Data-quality audit
7. Data cleaning
8. Troponin harmonization
9. Censored-value handling
10. Numeric artifact handling
11. Pediatric/adult population decision
12. Leakage assessment
13. Target analysis
14. EDA
15. Train/test split
16. Feature/target separation
17. Preprocessing pipelines
18. Class-imbalance strategy
19. Model definitions
20. Cross-validation
21. Hyperparameter tuning
22. Model evaluation
23. ROC comparison
24. Confusion matrices
25. Calibration
26. Threshold analysis
27. Final model selection
28. Held-out test evaluation
29. SHAP
30. Permutation importance
31. Subgroup analysis where justified
32. Sample prediction
33. Save inference artifacts
34. Final summary
35. Limitations

Adapt this structure to the actual existing notebook.

---

# 27. SAVED MODEL / DEPLOYMENT ARTIFACT

The final model must be saved as a complete inference pipeline.

The saved artifact should contain all necessary preprocessing and model steps so that Django can later receive raw user inputs and produce a prediction without manually duplicating preprocessing logic.

Potential artifacts:

```text
model_pipeline.joblib
model_metadata.json
feature_schema.json
```

Use appropriate filenames based on the final project structure.

The metadata should document, where appropriate:

* model name
* feature names
* preprocessing
* categorical mappings
* target mapping
* selected threshold
* training configuration
* version/date
* relevant assumptions

Do not save a model that requires undocumented manual preprocessing.

---

# 28. DJANGO API CONTRACT — DOCUMENT ONLY FOR NOW

Do not build the Django backend unless explicitly instructed.

However, the ML stage should define the future inference contract.

Document:

## Input

Which raw features Django must provide.

## Output

For example:

```json
{
  "prediction": 1,
  "probability": 0.87,
  "risk_label": "High"
}
```

This is only an example.

The actual output format must be based on the final model and project requirements.

Ensure the saved pipeline and future Django input schema match exactly.

---

# 29. FRONTEND — DO NOT IMPLEMENT YET

The eventual React frontend may include:

* patient data entry form
* prediction result
* probability/risk information
* basic explanation
* disclaimer

But do not implement frontend functionality during the ML stage unless explicitly requested.

---

# 30. ETHICS AND CLINICAL DISCLAIMER

The system is a research/decision-support prototype.

Do not describe it as:

* a replacement for physicians
* a definitive diagnostic system
* clinically validated
* ready for real-world medical deployment

unless such validation actually exists.

Clearly state:

* dataset limitations
* retrospective nature if applicable
* sample-size limitations
* potential selection bias
* missing data
* external-validation limitations
* possible institutional bias
* limitations of generalization
* need for clinical validation

Avoid overstating performance.

---

# 31. PRIVACY

Do not expose unnecessary patient-level information.

Do not include:

* names
* phone numbers
* addresses
* IDs
* credentials
* secrets

in generated documentation or source code.

If the dataset contains potentially identifiable information, flag it and avoid reproducing it unnecessarily.

---

# 32. CODING STANDARDS

When modifying or creating code:

* use Python
* use pandas
* use NumPy
* use scikit-learn
* use matplotlib/seaborn where appropriate
* use SHAP where justified
* use joblib for model persistence where appropriate

Follow clean, reproducible coding practices.

Use fixed random seeds where appropriate.

Prefer modular, readable code.

Do not introduce unnecessary libraries.

---

# 33. DEBUGGING RULE

If code fails:

1. Identify the actual error.
2. Determine its root cause.
3. Fix the underlying issue.
4. Re-run the affected section.
5. Verify that the fix did not introduce leakage or alter the methodology incorrectly.

Do not hide errors.

Do not fabricate successful outputs.

Do not change the methodology merely to make code run.

---

# 34. REPRODUCIBILITY

The final project must be reproducible.

Record:

* random seeds
* package requirements where practical
* preprocessing decisions
* feature lists
* target encoding
* train/test strategy
* CV strategy
* hyperparameters
* threshold-selection method
* final model
* artifact filenames

---

# 35. PROPOSAL VS EXPERIMENTAL RESULTS

The proposal must not contain fabricated final model results.

Before the ML experiments are completed, proposal language should use:

* “will evaluate”
* “will compare”
* “will investigate”
* “is expected to”
* “the study aims to”

After actual experiments are completed, the final report may contain real measured results.

---

# 36. ACADEMIC WRITING

Use clear academic English appropriate for a university research proposal.

Avoid:

* exaggerated claims
* unnecessary jargon
* marketing language
* unsupported medical claims
* repetitive explanations

The proposal should be concise enough to fit the **6–7 page maximum**.

---

# 37. REFERENCES

Do not invent citations.

If references already exist in the proposal/resources, preserve relevant ones.

If new references are required, identify them clearly and use credible academic sources.

Do not create fake:

* authors
* journal names
* DOI numbers
* publication years

---

# 38. FINAL QUALITY CHECK

Before declaring the work complete, verify:

## Dataset

* [ ] Actual dataset inspected
* [ ] Rows/columns verified
* [ ] Exact column names verified
* [ ] Data types checked
* [ ] Missingness checked
* [ ] Duplicates checked
* [ ] Suspicious values checked
* [ ] Target checked
* [ ] Class balance checked

## Leakage

* [ ] `SL` investigated
* [ ] `UNIT` investigated
* [ ] Troponin investigated
* [ ] Target construction investigated
* [ ] Prediction-time assumptions documented
* [ ] No preprocessing leakage
* [ ] No test-set tuning
* [ ] No train/test patient overlap where identifiable

## ML

* [ ] Logistic Regression
* [ ] Decision Tree
* [ ] SVM
* [ ] Random Forest
* [ ] Stratified split
* [ ] Pipeline/ColumnTransformer
* [ ] Missing-value handling
* [ ] Encoding
* [ ] Scaling where appropriate
* [ ] Class imbalance strategy justified
* [ ] CV performed correctly
* [ ] Hyperparameter tuning performed correctly
* [ ] Final test set untouched until final evaluation
* [ ] Threshold selection leakage-free
* [ ] Calibration checked where appropriate
* [ ] SHAP/permutation importance checked

## Proposal

* [ ] Maximum 6–7 pages
* [ ] Concise academic writing
* [ ] No fabricated results
* [ ] Research questions align with methodology
* [ ] Objectives align with actual work
* [ ] Models align with implementation
* [ ] Dataset description is accurate
* [ ] Methodology is leakage-safe
* [ ] Limitations are realistic
* [ ] Ethical considerations included
* [ ] ER model included only if justified
* [ ] Figures/tables do not unnecessarily expand page count

## Deployment readiness

* [ ] Complete inference pipeline saved
* [ ] Feature schema documented
* [ ] Threshold documented
* [ ] Model metadata saved
* [ ] Future Django input contract defined
* [ ] No manual preprocessing required outside the saved pipeline

---

# 39. REQUIRED WORKING BEHAVIOR

Do not immediately rewrite everything.

Follow this sequence:

### Phase 1 — Inspect

Inspect:

* `resource files/`
* proposal
* dataset
* existing notebook
* project instructions/rubric if available

### Phase 2 — Audit

Produce an internal assessment of:

* dataset quality
* methodology
* notebook correctness
* leakage risks
* proposal inconsistencies
* missing components

### Phase 3 — Plan

Create a concrete correction/improvement plan.

Prioritize genuine problems over cosmetic changes.

### Phase 4 — Implement

Modify the notebook/code/proposal only where needed.

Preserve valid existing work.

### Phase 5 — Execute

Run the ML workflow against the actual dataset.

Do not fabricate results.

### Phase 6 — Validate

Check the final workflow for:

* leakage
* reproducibility
* evaluation correctness
* model-selection correctness
* deployment compatibility

### Phase 7 — Finalize

Produce:

* corrected ML notebook
* saved model artifacts
* concise proposal within 6–7 pages
* ER model only if justified
* final methodology summary
* limitations
* deployment input/output contract

---

# 40. IMPORTANT PRIORITY RULE

When requirements conflict, prioritize in this order:

1. Data correctness
2. Leakage prevention
3. Scientific/methodological validity
4. Reproducibility
5. University/project requirements
6. Proposal page limit
7. Deployment compatibility
8. Presentation/cosmetic improvements

Never sacrifice methodological correctness just to achieve a higher metric, shorter code, or prettier presentation.

---

# 41. FIRST TASK WHEN STARTING THIS PROJECT

When I ask you to review or work on this project, first inspect the contents of:

```text
resource files/
```

Then inspect the relevant source files.

Do not guess what is inside them.

Start by identifying:

* available files
* proposal version
* dataset file
* existing notebook
* project instructions/rubric
* any additional supporting material

Then audit the project before making major modifications.

---

# 42. FINAL PRINCIPLE

This is a university research project, not a demonstration built around artificially high accuracy.

The goal is to produce a:

**methodologically sound, reproducible, leakage-safe, explainable, and realistically deployable heart disease prediction prototype using data from Northern Bangladesh.**

Accuracy must never be manufactured.

All decisions must be defensible from the actual data, research question, and methodology.
