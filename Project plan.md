> **Note (title finalized):** The project's official title is now:
> *"An Intelligent and Explainable AI-Based Web System for Heart Disease Risk
> Prediction Using Machine Learning and Large Language Models"* — this matches
> the second suggested title at the bottom of this document, which means the
> LLM component (§7/§8, Natural Language Input / AI Health Assistant) is now
> **in scope**, not optional. See `Web App Feature Scope.md` §5 for the scoped
> (guardrailed, non-diagnostic) version of this feature being built.

> **Note (updated):** This document was originally written as a generic final-year
> CSE project template, and its example clinical field list below (chest pain type,
> resting ECG, ST depression, slope, thalassemia, etc.) was drawn from the public
> UCI Heart Disease (Cleveland) dataset — not from this project's actual data.
> This project uses the **Northern Bangladesh Heart Disease dataset** (Zia Heart
> Foundation Hospital & Research Institute), which is a biochemical/anthropometric
> panel with a different field set (lipid panel, troponin-I, haemoglobin,
> creatinine, electrolytes, RBS, etc.). The field list below has been corrected to
> match the real dataset; the actual authoritative schema lives in
> `Resource files/northern_bangladesh_heart_disease_artifacts/model_metadata.json`,
> and the finalized feature scope is in `Web App Feature Scope.md`.

For a final-year CSE project/research project, a Heart Disease Prediction System should ideally be more than a simple form that takes age, cholesterol, BP, etc. and outputs “Heart Disease: Yes/No.” A stronger project combines ML prediction + explainable AI + user management + visualization + proper evaluation.
A good scope would look like this:
🫀 Recommended Feature Set
1. Patient/User Registration & Login
Standard web-app functionality.
•	User registration/login
•	Role-based access:
o	Patient/User
o	Doctor/Medical Professional
o	Admin
•	Secure password handling
•	Profile management
•	Patient history
For a student project, you can keep the roles simple if implementing a full doctor system is too much.
________________________________________
2. Heart Disease Risk Prediction
This is the core ML component.
User enters clinical attributes matching the actual Northern Bangladesh dataset schema:
•	Age
•	Sex
•	Height (cm) / Weight (kg) / BMI
•	Family history of heart disease
•	Hypertension
•	Diabetes
•	History of chest pain
•	Blood pressure (BP)
•	Random blood sugar (RBS)
•	Total cholesterol / HDL / LDL / Triglycerides
•	Maximum heart rate (MaxHR)
•	Haemoglobin
•	Creatinine
•	Platelets
•	Sodium / Potassium / Chloride
•	Troponin-I (with censoring flag for values reported as ">25000")
(Full field list and types: `model_metadata.json`. `SL`, `UNIT`, and
`Troponin_Assay_Type` are deliberately excluded — see the leakage audit in the ML
notebook.)
Then the system produces something like:
Predicted Risk: 72%
Risk Category: High
Rather than only:
❌ Heart Disease Detected
A probability/risk score makes the project much more useful and research-oriented.
________________________________________
3. Multiple ML Models
This is particularly valuable for a CSE research project.
Instead of using only one algorithm, compare several:
Algorithm	Purpose
Logistic Regression	Baseline
Decision Tree	Interpretable model
Random Forest	Strong traditional ML
SVM	Classification comparison
KNN	Distance-based comparison
XGBoost/LightGBM	Advanced model
Neural Network	AI/deep-learning comparison
Then compare:
•	Accuracy
•	Precision
•	Recall
•	F1-score
•	ROC-AUC
•	Confusion matrix
You can select the best-performing model for the final prediction system.
________________________________________
4. Explainable AI — ⭐ Highly Recommended
This is one of the features I'd strongly recommend adding.
A medical prediction system shouldn't simply say:
High Risk — 78%
The user should also understand why.
For example:
Prediction Explanation
Risk: 78% — High
Main contributing factors:
🔴 High cholesterol
🔴 High resting blood pressure
🟠 Low maximum heart rate
🟠 Exercise-induced angina
Protective factors:
🟢 Younger age
🟢 Normal fasting blood sugar
You can implement this using:
•	SHAP
•	LIME
•	Feature importance
SHAP is particularly good for a research project because you can show both global model explanations and individual prediction explanations.
________________________________________
5. Risk Visualization
Make the prediction page visually understandable.
For example:
             HEART RISK
          ┌───────────────┐
          │      72%      │
          │   HIGH RISK   │
          └───────────────┘

Blood Pressure     █████████░  High
Cholesterol        ████████░░  High
Max Heart Rate     ██████░░░░  Moderate
Age                █████░░░░░  Moderate
You can use:
•	Gauge chart
•	Bar charts
•	Radar chart
•	Feature contribution chart
•	Risk trend chart
________________________________________
6. Patient History
Very useful for making the project feel like a real application.
Example:
Date	Risk	Result
Sep 15	72%	High
Aug 20	61%	Moderate
Jul 10	43%	Low
Then the user can see whether their predicted risk is changing over time.
________________________________________
7. AI Health Assistant — ⭐
Since you specifically mentioned ML and AI, you can add an AI assistant.
For example:
User:
My risk is 72%. What does this mean?
AI:
Your prediction indicates a higher estimated risk based on the information you entered. Some of the strongest contributing factors were...
The assistant could explain:
•	What each medical parameter means
•	What the prediction means
•	General lifestyle information
•	Questions users might discuss with a doctor
Important
Don't make the AI say:
"You have heart disease."
Instead:
"The model estimates a higher risk based on the provided information. This is not a medical diagnosis."
That's much more appropriate for a research project.
________________________________________
8. Natural Language Input — Advanced Feature
This could make your project more interesting.
Instead of requiring the user to understand every medical field, allow:
"I'm 52 years old, my BP is 150/95 and cholesterol is 240. I sometimes experience chest pain when exercising."
AI extracts relevant information:
Age: 52
BP: 150/95
Cholesterol: 240
Exercise Angina: Yes
Chest Pain: Present
Then the structured information goes to the ML model.
This gives you a nice:
LLM → Information Extraction → ML Model → XAI → AI Explanation
architecture.
________________________________________
9. Doctor/Medical Dashboard
If you want the project to look more like a complete system:
Doctor Dashboard
•	Patient list
•	Patient risk scores
•	Prediction history
•	Patient profile
•	Risk-factor visualization
•	Download patient report
•	Review previous predictions
You don't necessarily need to implement actual doctor-patient communication.
________________________________________
10. PDF Report Generation
Very good final-year-project feature.
After prediction:
Generate Report
The PDF could contain:
HEART DISEASE RISK ASSESSMENT

Patient Information
--------------------
Age: 52
Sex: Male

Clinical Parameters
--------------------
Blood Pressure: 150/95
Cholesterol: 240
Max Heart Rate: 130

ML Prediction
-------------
Risk Score: 72%
Risk Level: HIGH

Major Contributing Factors
--------------------------
1. Blood Pressure
2. Cholesterol
3. Exercise Angina

Model Used
----------
Random Forest

Disclaimer
----------
This prediction is for research/educational purposes
and is not a medical diagnosis.
________________________________________
11. Admin Dashboard
For the CSE aspect, an admin panel adds useful functionality.
Admin can see:
•	Number of registered users
•	Number of predictions
•	Low/medium/high risk distribution
•	Model performance
•	Most frequently entered risk factors
•	System activity
Example:
------------------------------------------
 HEART RISK SYSTEM ADMIN DASHBOARD
------------------------------------------

Users              1,248
Predictions        3,841
High Risk           623
Medium Risk         891
Low Risk           2,327

Model Accuracy       89.4%
Model F1 Score       87.9%
ROC-AUC              92.1%
------------------------------------------
________________________________________
12. ML Model Performance Dashboard — ⭐ Research Feature
This is especially important if you're calling it a research project.
Show:
Model Comparison
                    Accuracy    F1     AUC

Logistic Regression   84.2%    83.7%   89.1%
Decision Tree         81.5%    80.2%   84.7%
Random Forest         89.4%    87.9%   92.1%
SVM                   86.8%    85.9%   90.3%
XGBoost               91.1%    90.2%   94.5%
Then your research question becomes something meaningful:
"Which machine learning algorithm provides the most reliable heart disease risk prediction on the selected dataset?"
That's much stronger academically than simply building a prediction form.
________________________________________
13. Dataset & Data Preprocessing
Your project should document the ML pipeline:
Dataset
   ↓
Data Cleaning
   ↓
Missing Value Handling
   ↓
Encoding
   ↓
Feature Scaling
   ↓
Feature Selection
   ↓
Train/Test Split
   ↓
Model Training
   ↓
Hyperparameter Optimization
   ↓
Evaluation
   ↓
Best Model
   ↓
Web Application
Possible techniques:
•	Missing-value handling
•	Encoding categorical variables
•	Standardization
•	Feature selection
•	SMOTE if class imbalance exists
•	Cross-validation
•	Hyperparameter tuning
________________________________________
14. Security Features
Since this is CSE, don't ignore security.
At minimum:
•	Password hashing
•	Input validation
•	Authentication
•	Authorization
•	Session/token security
•	SQL injection protection
•	HTTPS in deployment
•	Avoid exposing patient information
•	Secure API endpoints
You can even have a section in your report:
Security and Privacy Considerations
That can make the project substantially stronger.
________________________________________
15. Model Monitoring / Versioning — Advanced
If you want to push it toward a more professional project:
Store:
Model Version: RF_v2.1
Training Dataset: Dataset_v3
Accuracy: 89.4%
Training Date: 2026-09-01
When a new model is trained, the system can record:
Model v1 → 84.2%
Model v2 → 87.6%
Model v3 → 89.4%
This is a nice MLOps component.
________________________________________
⭐ What I Would Recommend for Your Final-Year Project
Don't try to implement every possible feature. I'd divide it into three levels.
🟢 Essential
These should definitely be there:
1.	User registration/login
2.	Patient data input
3.	ML prediction
4.	Risk probability
5.	Multiple ML algorithms
6.	Model comparison
7.	Accuracy/precision/recall/F1/AUC
8.	Confusion matrix
9.	Prediction history
10.	Visualization
🟡 Strongly Recommended
These make it stand out:
11.	SHAP Explainable AI
12.	Feature importance
13.	AI health-information assistant
14.	PDF report
15.	Admin dashboard
16.	Cross-validation
17.	Hyperparameter optimization
18.	Security/authentication
🔴 Advanced / Research-Level
If you have enough time:
19.	Natural-language medical information extraction
20.	LLM → ML integration
21.	Model versioning
22.	Model monitoring
23.	Ensemble model
24.	External validation dataset
25.	Comparative research study
26.	Fairness analysis across demographic groups
________________________________________
🏗️ Suggested Overall Architecture
I'd design your system roughly like this:
                    ┌──────────────────┐
                    │   Web Frontend   │
                    │ React / Next.js  │
                    └────────┬─────────┘
                             │
                ┌────────────▼────────────┐
                │       Backend API       │
                │   FastAPI / Django      │
                └────────────┬────────────┘
                             │
           ┌─────────────────┼──────────────────┐
           │                 │                  │
           ▼                 ▼                  ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │ ML Service  │  │  AI Service  │  │ Auth Service │
    │             │  │              │  │              │
    │ RF/XGBoost  │  │ LLM Assistant│  │ JWT/Session  │
    │ SVM/LR      │  │ Explanation  │  │              │
    └──────┬──────┘  └──────┬───────┘  └──────────────┘
           │                 │
           ▼                 ▼
    ┌───────────────────────────────────┐
    │       Explainable AI Layer        │
    │          SHAP / LIME              │
    └─────────────────┬─────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Database    │
              │ PostgreSQL/   │
              │    MySQL      │
              └───────────────┘
The most impressive part of this architecture is:
Patient Data → ML Model → Risk Probability → SHAP Explanation → AI-generated understandable explanation → PDF Report
That gives you a clear combination of CSE + Machine Learning + AI + Web Development + Explainable AI.
🎓 A strong project title
Instead of simply:
Heart Disease Prediction System
I'd use something like:
"An Explainable AI-Driven Web-Based Heart Disease Risk Prediction System Using Machine Learning"
Or, if you implement the LLM component:
"An Intelligent and Explainable AI-Based Web System for Heart Disease Risk Prediction Using Machine Learning and Large Language Models"
That second title gives you a lot more room for a final-year research paper, because you can investigate whether combining ML prediction with explainability and AI-generated explanations improves user understanding—without claiming that the system itself is a medical diagnostic tool.

