# Heart Risk AI

An intelligent and explainable AI-based web system for heart disease risk
prediction, built as an academic CSE research project. It combines a
frozen ML-5 XGBoost model pair (Basic / Enhanced tiers), SHAP
explainability, and a guardrailed LLM explanation layer behind a React
frontend and a Django REST Framework backend.

**This is a research prototype, not a medical diagnostic tool.** Its
predictions must not replace professional medical advice.

## Tech stack

- **Backend:** Django 5 + Django REST Framework, SQLite (dev), session-cookie auth
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4
- **ML:** XGBoost (prediction) + SHAP (feature-contribution explanations)
- **LLM layer:** Google Gemini, guardrailed to only ever see the model's own structured output

## Prerequisites

- Git
- Python 3.11+
- Node.js 20+ and npm

## Setup (Git Bash)

Commands below are for Git Bash on Windows. On macOS/Linux, replace
`source .venv/Scripts/activate` with `source .venv/bin/activate`.

### 1. Clone

```bash
git clone https://github.com/kmajhi/heart-disease-risk-prediction.git
cd heart-disease-risk-prediction
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate

pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and set:

- `GEMINI_API_KEY` — required for the AI explanation feature. Free key: https://aistudio.google.com/apikey
- `GOOGLE_OAUTH_CLIENT_ID` — optional, only needed for "Login with Google" (see [Google sign-in setup](#optional-google-sign-in-setup) below).

Then apply migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver 8000
```

Leave this running. `db.sqlite3` isn't checked into the repo, so `migrate`
creates a fresh, empty database — you start with no users or predictions.

### 3. Frontend

In a **second Git Bash window**:

```bash
cd heart-disease-risk-prediction/frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The trained model artifacts in
`artifacts/` are already in the repo, so predictions work immediately —
no retraining needed.

### Optional: Google sign-in setup

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **Create Credentials → OAuth client ID** → type **Web application**.
2. Add `http://localhost:5173` under **Authorized JavaScript origins**.
3. Copy the Client ID into **both**:
   - `backend/.env` → `GOOGLE_OAUTH_CLIENT_ID=...`
   - `frontend/.env` (copy from `frontend/.env.example` first) → `VITE_GOOGLE_CLIENT_ID=...`
4. Restart both dev servers.

## Testing the user role

1. Go to http://localhost:5173/register and create an account with any email/password (or use "Log in with Google" if configured).
2. Log in — you land on the **Dashboard**, empty until you run an assessment.
3. Go to **Predict**, choose **Basic** or **Enhanced**, fill in the form, and submit. You'll be taken to a result page with the estimated risk, SHAP factors, and (if `GEMINI_API_KEY` is set) a plain-language AI summary.
4. Check **History** — your past assessments, with an **Export CSV** button and the ability to select two assessments to **Compare**.
5. Check **Dashboard** again — stats, risk breakdown, and recent activity should now be populated.
6. Check **Profile → Account settings** — change your password, or delete the account.
7. Confirm you do **not** see an "Admin" link in the nav bar — regular users can't reach `/admin`.

## Testing the admin role

Promote a user to admin one of two ways:

**Option A — create a superuser directly** (gets the `admin` role automatically):

```bash
cd backend
source .venv/Scripts/activate
python manage.py createsuperuser
```

**Option B — promote an existing account** via the Django shell:

```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
U = get_user_model()
u = U.objects.get(email='your-account@example.com')
u.role = U.Role.ADMIN
u.is_staff = True
u.save()
"
```

Then:

1. Log in as that account — an **Admin** link now appears in the nav bar.
2. Go to **Admin** (`/admin` in the app, not Django's `/admin/`) — you should see live, real aggregate stats: total users, total predictions, tier/risk breakdowns, a 14-day prediction trend, and model-version usage.
3. Confirm a **non-admin** account still gets redirected/blocked if it tries to visit `/admin` directly (both the frontend route and the backend `/api/admin/stats/` endpoint enforce this independently).

## Project structure

```
backend/          Django REST API (accounts, predictions, admin stats)
frontend/         React SPA
artifacts/        Frozen ML-5 model pipelines + metadata (used at runtime)
notebooks/        ML research notebooks (dataset audit → final model selection)
reports/          Markdown write-ups of each research phase
Resource files/   Earlier single-tier model + aggregate research tables/figures
```

Raw per-patient clinical data is intentionally excluded from this repo —
see `.gitignore`.
