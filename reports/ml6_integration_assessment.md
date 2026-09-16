# ML-6: Backend Integration Assessment

**Assessment only — no code changes made in this phase.** Everything below
is based on direct inspection of the current codebase (a full read-only
pass) plus direct verification of the ML-5 artifacts (loaded both `.joblib`
pipelines and confirmed they predict correctly with exactly their
documented feature sets — not assumed from the metadata alone).

---

## 1. Current Project Architecture

```
React (Vite) frontend  --/api-->  Django REST backend  -->  SQLite (dev)
     :5173                              :8000
```

Session-cookie + CSRF auth (not JWT). Vite's dev server proxies `/api` to
Django (`changeOrigin: true`), so the browser only ever talks to `:5173`.
No git repo exists yet. Two **separate, currently disconnected** prediction
systems exist side by side:

- **OLD single-tier model** (`Resource files/northern_bangladesh_heart_disease_artifacts/`): fully wired end-to-end (frontend form → DRF serializer → `inference.py` → response → result page), built in an earlier phase, 24 raw features, one Random Forest pipeline.
- **NEW ML-5 two-tier artifacts** (`artifacts/`): exist on disk, verified correct, but **referenced nowhere in any frontend or backend code yet.**

Integrating ML-5 means replacing the prediction *logic* behind an existing,
working endpoint shape — not building a new system from nothing.

## 2. Current Frontend Structure

**Stack** (`frontend/package.json`): React 19, Vite 8, TypeScript 6
(`tsc -b`), React Router 7 (`createBrowserRouter`), TanStack Query v5, React
Hook Form 7 + `@hookform/resolvers` + Zod 4, Tailwind CSS v4 (CSS-first,
via `@tailwindcss/vite` — no `tailwind.config.js`). No component library
(no MUI/shadcn/Radix). Linter is `oxlint`.

**Routes** (`frontend/src/app/router.tsx`):

| Route | Access | Status |
|---|---|---|
| `/`, `/disclaimer`, `/login`, `/register` | public | implemented |
| `/models/compare` | public | **placeholder** — text still describes the *old* 4-classical-algorithm plan |
| `/profile` | protected | implemented |
| `/predict`, `/predictions/:id` | protected | implemented, around the OLD model |
| `/history` | protected | **placeholder** |
| `/admin` | admin-only | **placeholder** |

**State management**: TanStack Query is the only server-state layer;
`AuthContext` is a thin wrapper around one `useQuery(['auth','me'], ...)`
call. No Redux/Zustand. `api/client.ts` is a shared fetch wrapper:
relative `/api` base, `credentials:'include'`, `X-CSRFToken` on unsafe
methods, DRF-shaped error parsing (`ApiError{status, detail, fieldErrors}`
— any top-level response key whose value is an array becomes a field
error). This error-handling convention is important: **new endpoints
should return validation errors in the same raw DRF shape
(`{"field": ["message"]}`) so nothing in `api/client.ts` needs to change.**

## 3. Current Prediction-Related Code

Entirely built around the OLD 24-field, single-tier model:

- `frontend/src/types/prediction.ts` — flat `PredictionInput` (24 fields), `PredictionResult` — no `tier` concept.
- `frontend/src/features/prediction-form/formSchema.ts` — Zod schema, comment explicitly says it "mirrors `backend/predictions/serializers.py`'s `PredictionInputSerializer` field-for-field" (confirmed true).
- `PredictionFormPage.tsx` — one flat form, 6 sections (Demographics, MedicalHistory, Vitals, Lipids, CardiacMarkers, Labs), **no tier selector anywhere**, always submits all 24 fields.
- `PredictionResultPage.tsx` — `RiskGaugeCard`, `ModelUsedBadge` (just prints `model_version` as text), `ThresholdInfoNote`, `PredictionMetaFooter` (dumps all 24 inputs). No explanation/SHAP rendering exists yet.
- `api/predictions.ts` / `hooks/usePredictionMutations.ts` — thin, generic; no tier awareness needed to change much here.

## 4. Existing Backend/API Status

Django 5.2.17 + DRF, two apps:

- **`accounts`** — custom email-based `User` (with `role`), session+CSRF auth (register/login/logout/me). Fully working, **out of scope for this integration, do not touch.**
- **`predictions`** — the OLD model's API. `Prediction` model (user FK, `input_data` JSON, `probability`, `risk_label`, `prediction`, `model_version`, `threshold_used`, `created_at`). `PredictionInputSerializer` has a `FIELD_TO_COLUMN` map for all 24 fields. **`inference.py` is the critical file** — verbatim:

```python
ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "Resource files" / "northern_bangladesh_heart_disease_artifacts"
PIPELINE_PATH = ARTIFACTS_DIR / "heart_disease_inference_pipeline.joblib"
METADATA_PATH = ARTIFACTS_DIR / "model_metadata.json"
THRESHOLD_KEY = "sensitivity_target_train_derived"
...
def get_threshold(): return get_metadata()["thresholds"][THRESHOLD_KEY]
def get_model_version(): return get_metadata()["selection"]["selected_model"]
```

Confirmed on disk: this loads a **1.87 MB** pipeline dated Sep 10 — the OLD
model, definitively distinct from the ML-5 artifacts (different directory,
different filenames, ~228 KB each, dated Sep 15). **This code would
`KeyError` if pointed at the new ML-5 metadata files as-is** — they have no
`thresholds`/`selection` keys; the shape is `models.A_Basic.threshold.chosen`
/ `models.B_Enhanced.threshold.chosen` instead.

## 5. ML-5 Artifact Locations — Verified Directly, Not Assumed

- `artifacts/a_basic_xgboost_pipeline.joblib` (232,341 bytes) — loaded and test-predicted successfully using **only** its 9 documented fields (`Age, Sex, Height (cm), Weight (kg), BP(mmHg), Family H/O, Hypertension, Diabetes, H/O ChestPain`). `pipeline.feature_names_in_` lists 29 columns (everything the training DataFrame happened to contain, including `SL`, `UNIT`, the target itself) — **this is a red herring, not a runtime requirement**: `ColumnTransformer` only pulls the named columns it was configured with, confirmed by successfully predicting with a 9-column input DataFrame containing nothing else. The OLD `inference.py`'s pattern of doing `frame = pd.DataFrame([row])[pipeline.feature_names_in_]` **must not be copied** for the new pipelines — it would require supplying 29 irrelevant columns unnecessarily.
- `artifacts/b_enhanced_xgboost_pipeline.joblib` (227,703 bytes) — same confirmation, with exactly its 13 documented fields.
- `artifacts/a_basic_model_metadata.json` / `b_enhanced_model_metadata.json` — read in full. **The two files are near-duplicates**: each contains *both* tiers' complete data under `models.A_Basic`/`models.B_Enhanced`, plus a `this_file_describes` + `model` key pointing at whichever tier the filename suggests. Minor redundancy, not a blocker — a future cleanup could consolidate to one `model_metadata.json` with both tiers, but either file already has everything needed.
- Frozen thresholds confirmed exactly as you specified: Basic 0.4681 (Youden-optimal), Enhanced 0.3335 (95%-sensitivity target).
- `xgboost` is confirmed **absent** from `backend/requirements.txt` — loading either pipeline from the Django backend will fail with `ModuleNotFoundError` until it's added (verified: `backend/.venv` currently lacks it; the global Python env used for the ML notebooks has `xgboost==3.4.1`, which is the version to pin).

## 6. Recommended Backend Technology

**Stay on Django/DRF — extend the existing `predictions` app, do not
introduce a new service or framework.** A separate FastAPI microservice
(or similar) would add a second deployment target, a second auth story,
and duplicate the DB access `Prediction` already needs — the opposite of
"smallest clean architecture." Django already has the venv, the DB, the
auth integration, and the URL namespace; the change needed is *internal*
to `predictions` (new inference logic, new serializers, one new model
field), not a new system.

## 7. Proposed API Endpoints

Reuse the existing URLs — extend their behavior with a `tier` field, rather
than minting a new URL per tier:

- `POST /api/predictions/` — body includes `"tier": "basic" | "enhanced"` plus the tier-appropriate fields.
- `GET /api/predictions/<id>/` — unchanged shape, response now includes `tier` and `explanation`.
- *(Later phase, not now)* `GET /api/models/comparison/` — to back the already-placeholder `/models/compare` page, sourced from `ml5_final_model_selection.md`'s numbers.

## 8. Request/Response JSON Schemas

**Basic request:**
```json
{
  "tier": "basic",
  "age": 55, "sex": "M", "height_cm": 170, "weight_kg": 80, "bp": 150,
  "family_history": true, "hypertension": true, "diabetes": false, "chest_pain_history": true
}
```

**Enhanced request:** Basic fields + `total_cholesterol`, `ldl`, `triglycerides`, `rbs`.

**Success response (either tier):**
```json
{
  "id": 1,
  "tier": "basic",
  "prediction": true,
  "probability": 0.87,
  "risk_label": "High",
  "bmi": 27.7,
  "model_version": "XGBoost (Basic)",
  "threshold_used": 0.4681,
  "explanation": {
    "top_factors": [
      {"feature": "Age", "value": 55, "contribution": 0.32, "direction": "increases_risk"},
      {"feature": "H/O ChestPain", "value": true, "contribution": 0.21, "direction": "increases_risk"},
      {"feature": "Hypertension", "value": true, "contribution": 0.14, "direction": "increases_risk"}
    ]
  },
  "disclaimer": "Research prototype. Not externally validated, not prospectively evaluated, not approved for clinical use. This is not a medical diagnosis.",
  "created_at": "2026-...",
  "input": { "...tier fields echoed back..." }
}
```
`bmi` is returned for display only, computed server-side from
`height_cm`/`weight_kg` — never accepted as an input field, never used by
the model.

**Validation error (400)** — kept in the *existing* raw DRF shape so
`api/client.ts` needs no changes: `{"age": ["Must be between 1 and 120."], "sex": ["This field is required."]}`.

**Model/artifact load failure (503):** `{"detail": "Prediction service is temporarily unavailable. Please try again shortly."}` — full exception logged server-side only, never in the response.

**Unexpected server error (500):** same sanitized shape via a DRF custom
exception handler — this matters concretely here because `settings.py`
currently has `DEBUG = True`, which makes Django's default error response
an HTML page with a full stack trace; a custom handler (or at minimum
`DEBUG=False` + `ALLOWED_HOSTS` set before any real deployment) is needed
so a crash never leaks internals to the frontend.

## 9. Basic vs Enhanced Workflow

- **One form, a tier toggle at the top** (Basic / Enhanced) — not two
  separate pages. Selecting Enhanced reveals the 4 extra lab fields;
  selecting Basic hides them.
- **Enhanced fields become conditionally required**: a Zod schema
  discriminated on `tier` (RHF already supports this cleanly) — if `tier`
  is `"enhanced"`, the 4 lab fields are required and missing ones block
  submission with inline errors identifying exactly which are missing, per
  your instruction not to silently send incomplete Enhanced input.
- No third tier is ever surfaced — Advanced/research fields
  (`Troponin-I`, electrolytes, Haemoglobin, Creatinine, Platelets, `MaxHR`,
  `HDL`) are removed from the active prediction flow entirely, not just
  hidden.
- BMI: calculated client-side (already implemented this way) from
  height/weight for display, and again server-side for the response `bmi`
  field — never sent as input, never a model feature, on either tier.

## 10. SHAP / Explainable AI Integration Approach

- **`shap.TreeExplainer`** on the already-fitted XGBoost booster inside
  each pipeline — exact, fast (ms-scale) for tree ensembles at this
  feature count, and **does not modify the model** in any way (matches
  your non-negotiable rule).
- **Local (per-prediction) explanation**: computed live in the request
  path — run the pipeline's `preprocess` step's `.transform()` on the
  single input row, feed the transformed row to `TreeExplainer`, map the
  resulting SHAP values back to human-readable original feature names
  (undoing one-hot encoding for `Sex`; missing-indicator columns should
  never fire in practice since the form requires every field).
- **Global feature importance**: recommend **precomputing this once
  offline** (a small one-off script run against the ML-5 development set,
  the same way `feature_selection.md`'s permutation importance was
  computed) and saving the result as a static JSON per tier
  (e.g. `artifacts/a_basic_shap_global.json`). Recomputing a global summary
  from raw training data on every backend request or startup is
  unnecessary cost and would require shipping the training data alongside
  the deployed backend — the static file avoids both.
- **Output shape**: top-N features ranked by \|SHAP value\|, each tagged
  `"increases_risk"` / `"decreases_risk"` (see §8's `explanation.top_factors`).
- **Language rule, stated explicitly so it survives implementation**:
  outputs must say *"X contributed to a higher/lower model-estimated
  risk,"* never *"X caused/diagnoses the condition."* This is the same
  non-causal framing already established in `Research Proposal.md` and
  should be treated as a hard constraint on whatever text the frontend
  renders around the `explanation` data, not just a backend-side note.

## 11. Files That Need to Be Created

- `backend/predictions/shap_utils.py` — `TreeExplainer` wrapper + global-importance loader.
- A one-off precompute script (not part of the request path) producing `artifacts/a_basic_shap_global.json` / `b_enhanced_shap_global.json`.
- `backend/predictions/migrations/000X_add_tier.py` — new migration for the `tier` field.
- `frontend/src/features/prediction-form/TierToggle.tsx` — Basic/Enhanced selector.
- `frontend/src/features/prediction-result/ExplanationCard.tsx` (or similarly named) — renders `top_factors`, using the non-causal phrasing from §10. (This matches the `ShapFactorBars` component name from the original 7-phase frontend blueprint — same intended role.)

## 12. Existing Files That Need Modification

| File | Change |
|---|---|
| `backend/predictions/inference.py` | Rewritten: load tier-specific pipeline + metadata from `artifacts/` (not `Resource files/...`), resolve threshold via `models.<tier>.threshold.chosen`, add SHAP call |
| `backend/predictions/serializers.py` | Replace the 24-field `PredictionInputSerializer`/`FIELD_TO_COLUMN` with tier-aware serializers (9 or 13 fields) |
| `backend/predictions/views.py` | Dispatch by `tier` |
| `backend/predictions/models.py` | Add `tier` field |
| `backend/predictions/admin.py` | Add `tier` to `list_display` |
| `backend/requirements.txt` | Add `xgboost==3.4.1`, `shap==0.52.0` |
| `frontend/src/types/prediction.ts` | Tier-discriminated types + `explanation` shape |
| `frontend/src/features/prediction-form/formSchema.ts` | Tier-discriminated Zod schema (9 or 13 fields, not 24) |
| `frontend/src/routes/predict/PredictionFormPage.tsx` | Add tier toggle; render only the sections/fields the chosen tier needs |
| `frontend/src/features/prediction-form/sections/VitalsSection.tsx` | Drop `MaxHR` |
| `frontend/src/features/prediction-form/sections/LipidsSection.tsx` | Trim to the 4 Enhanced fields (drop `HDL`); becomes conditionally shown/required |
| `frontend/src/routes/predict/PredictionResultPage.tsx` | Render tier badge + `ExplanationCard` |
| `frontend/src/api/predictions.ts` | Payload shape includes `tier` |

`CardiacMarkersSection.tsx` and `LabsSection.tsx` become unused by the
active flow (Troponin/electrolytes/Haemoglobin/Creatinine/Platelets are
Advanced-only, not deployed) — **recommend deleting them** rather than
leaving dead code referencing excluded fields, but flagged here rather than
done unilaterally since removing files is your call.

## 13. Files That Must Remain Untouched

`Resource files/**` (original dataset, old executed notebook, old
artifacts — historical record), `notebooks/**` and their pickled
intermediates, `reports/*.md` (historical, corrected-in-place only, never
rewritten), `backend/accounts/**`, `frontend/src/app/**`,
`frontend/src/features/auth/**`, `frontend/src/routes/auth/**`,
`frontend/src/routes/admin/**`, `frontend/src/routes/history/**`,
`CLAUDE.md`, `Project plan.md`, `Research Proposal.md`,
`Web App Feature Scope.md`.

## 14. Dependency Changes Required

- **Backend**: `xgboost==3.4.1` (required — pipelines won't load without it), `shap==0.52.0` (required for §10). Both already verified working together in the global Python env used for ML-5; pinning the same versions avoids any train/serve mismatch.
- **Frontend**: no new dependency is strictly required. The original 7-phase blueprint anticipated `recharts` for a SHAP bar chart, but it was never installed (confirmed absent from `package.json`) and a plain Tailwind horizontal-bar list can render `top_factors` without adding a charting library — recommended, to keep the dependency footprint minimal, unless you'd prefer a real chart component.

## 15. Security Considerations

- **Existing, pre-integration risk worth flagging now**: `settings.py` has `DEBUG=True`, a hardcoded insecure `SECRET_KEY`, and `ALLOWED_HOSTS=[]`. Fine for local dev, but must change before any real deployment — noted here since a crash in the new inference/SHAP code is exactly the kind of thing that would otherwise leak a full traceback via Django's debug page.
- Server-side validation is non-negotiable and already the established pattern (DRF serializers) — the new tier serializers must enforce the same numeric-range discipline as the current `PredictionInputSerializer`, not trust the frontend's Zod validation alone.
- Wrap pipeline loading and inference in explicit `try/except`, returning the sanitized 503/500 shapes from §8 — the current `inference.py` has no error handling around `joblib.load`/`predict` at all.
- No raw `input_data` or prediction internals in application logs at INFO level.
- CORS/CSRF are already scoped tightly to the Vite dev origin (`http://localhost:5173`) — fine as-is for this phase, revisit for any real deployment.
- Move `SECRET_KEY` (and any future third-party keys, e.g. if the LLM explanation layer from the original blueprint is added later) into environment variables — pre-existing gap, low-cost to fix alongside this work, not a new requirement from ML-5 itself.
- No new patient-identifying data is introduced — the response/`Prediction` model already stores only the same categories of clinical input the app was designed to collect.

## 16. Step-by-Step Implementation Plan (proposed for the NEXT phase — not started)

1. Add `xgboost`, `shap` to `backend/requirements.txt`; install into `backend/.venv`.
2. Rewrite `backend/predictions/inference.py` to load tier-specific pipeline + metadata from `artifacts/`, resolve threshold per tier, add a `explain(tier, input_dict)` using `shap_utils.py`.
3. Add `tier` field + migration to the `Prediction` model; update `admin.py`.
4. Replace `serializers.py` with tier-aware input serializers (two explicit serializers is cleaner than one large conditional) + an output serializer including `tier`/`explanation`.
5. Update `views.py` to dispatch by `tier`.
6. **Resolve the open question in §17 below** (retire the old endpoint or not) before finishing this step.
7. Frontend: tier-discriminated `formSchema.ts` and `types/prediction.ts`; add `TierToggle`; update `PredictionFormPage.tsx` to show only the relevant sections per tier and gate submission on tier-appropriate completeness; trim/retire `CardiacMarkersSection`/`LabsSection`.
8. Add `ExplanationCard` to `PredictionResultPage.tsx`, with the non-causal phrasing from §10.
9. Manual end-to-end browser verification for both tiers, including a deliberately-incomplete Enhanced submission to confirm the blocking UX works as intended.
10. *(Lower priority, can follow later)* Wire `/models/compare` to real ML-5 comparison data.

## 17. Open Questions — Need Your Confirmation Before Implementation

1. **Should the OLD single-tier prediction endpoint be retired or kept
   alongside?** It's currently fully working, but keeping three prediction
   paths (old single-tier, Basic, Enhanced) live at once contradicts
   "smallest clean architecture" and would make it unclear which model
   produced any given historical `Prediction` row going forward. I
   recommend **retiring it** — replacing its logic in place, as described
   above — but this changes/removes currently-working code, so I'm
   flagging it rather than deciding it unilaterally.
2. **SHAP visualization**: plain Tailwind bar list (no new dependency) or
   add `recharts` for an actual chart, as the original blueprint
   envisioned? Recommend the former unless you'd rather have the latter.
3. Existing historical `Prediction` rows (created against the OLD model,
   if any exist in `db.sqlite3`) will have no `tier` value once the field
   is added — recommend backfilling them as `"legacy"` via the migration
   rather than leaving `tier` nullable/ambiguous. Confirm this is fine, or
   state a preference.

---

**Stopping here, as instructed. No implementation has started.** Awaiting
your review of this assessment before any of the files in §11/§12 are
touched.
