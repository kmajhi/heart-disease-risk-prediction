from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Prediction

User = get_user_model()

BASIC_PAYLOAD = {
    "tier": "basic",
    "age": 55,
    "sex": "M",
    "height_cm": 170,
    "weight_kg": 80,
    "bp": 150,
    "family_history": True,
    "hypertension": True,
    "diabetes": False,
    "chest_pain_history": True,
}

ENHANCED_EXTRA = {
    "total_cholesterol": 240,
    "ldl": 160,
    "triglycerides": 200,
    "rbs": 6.5,
}


class PredictionAPITests(APITestCase):
    """
    Covers the ML-6 Phase 8 backend scenarios. Exercises the real ML-5
    artifacts (no mocking of the model/pipeline) except where explicitly
    simulating a failure (tests 14/15).
    """

    def setUp(self):
        self.user = User.objects.create_user(email="tester@example.com", password="TestPass123!")
        self.other_user = User.objects.create_user(email="other@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)

    # 1. Basic valid prediction
    def test_basic_valid_prediction(self):
        response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["tier"], "basic")
        self.assertIn(response.data["risk_label"], ["Low", "Moderate", "High"])

    # 2. Enhanced valid prediction
    def test_enhanced_valid_prediction(self):
        payload = {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["tier"], "enhanced")

    # 3. Missing Basic field
    def test_missing_basic_field_rejected(self):
        payload = {k: v for k, v in BASIC_PAYLOAD.items() if k != "age"}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("age", response.data)

    # 4. Missing Enhanced field
    def test_missing_enhanced_field_rejected(self):
        extra = {k: v for k, v in ENHANCED_EXTRA.items() if k != "rbs"}
        payload = {**BASIC_PAYLOAD, "tier": "enhanced", **extra}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("rbs", response.data)

    # 5. Invalid tier
    def test_invalid_tier_rejected(self):
        payload = {**BASIC_PAYLOAD, "tier": "advanced"}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tier", response.data)

    def test_legacy_tier_rejected_for_creation(self):
        payload = {**BASIC_PAYLOAD, "tier": "legacy"}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tier", response.data)

    # 6. Invalid numeric value
    def test_invalid_numeric_value_rejected(self):
        payload = {**BASIC_PAYLOAD, "age": -5}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("age", response.data)

    # 7. Boundary validation
    def test_age_boundary_values(self):
        ok = self.client.post("/api/predictions/", {**BASIC_PAYLOAD, "age": 120}, format="json")
        self.assertEqual(ok.status_code, status.HTTP_201_CREATED)
        too_high = self.client.post("/api/predictions/", {**BASIC_PAYLOAD, "age": 121}, format="json")
        self.assertEqual(too_high.status_code, status.HTTP_400_BAD_REQUEST)
        too_low = self.client.post("/api/predictions/", {**BASIC_PAYLOAD, "age": 0}, format="json")
        self.assertEqual(too_low.status_code, status.HTTP_400_BAD_REQUEST)

    # 8. BMI calculation
    def test_bmi_calculated_correctly(self):
        payload = {**BASIC_PAYLOAD, "height_cm": 170, "weight_kg": 80}
        response = self.client.post("/api/predictions/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # 80 / (1.70^2) = 27.68... -> rounded to 1 decimal
        self.assertAlmostEqual(response.data["bmi"], 27.7, places=1)

    # 9. Correct threshold selection
    def test_threshold_matches_tier(self):
        basic = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertAlmostEqual(basic.data["threshold_used"], 0.4681, places=4)
        enhanced = self.client.post(
            "/api/predictions/", {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}, format="json"
        )
        self.assertAlmostEqual(enhanced.data["threshold_used"], 0.3335, places=4)

    # 10. Correct model selected for each tier
    def test_model_version_matches_tier(self):
        basic = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertEqual(basic.data["model_version"], "XGBoost (Basic)")
        enhanced = self.client.post(
            "/api/predictions/", {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}, format="json"
        )
        self.assertEqual(enhanced.data["model_version"], "XGBoost (Enhanced)")

    # 11. SHAP explanation returned
    def test_shap_explanation_returned(self):
        response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertIsNotNone(response.data["explanation"])
        factors = response.data["explanation"]["top_factors"]
        self.assertGreater(len(factors), 0)
        for factor in factors:
            self.assertIn(factor["direction"], ["increases_risk", "decreases_risk"])
            self.assertIn("feature", factor)
            self.assertIn("contribution", factor)

    # 12. Prediction saved with correct tier
    def test_prediction_persisted_with_tier(self):
        response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        saved = Prediction.objects.get(id=response.data["id"])
        self.assertEqual(saved.tier, "basic")
        self.assertEqual(saved.user, self.user)

    # 13. Legacy rows remain intact
    def test_legacy_row_unchanged_and_viewable(self):
        legacy = Prediction.objects.create(
            user=self.user,
            tier=Prediction.Tier.LEGACY,
            input_data={"age": 50, "sex": "F"},
            probability=0.75,
            risk_label="High",
            prediction=True,
            model_version="Random Forest",
            threshold_used=0.5675,
        )
        response = self.client.get(f"/api/predictions/{legacy.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["tier"], "legacy")
        self.assertIsNone(response.data["bmi"])
        self.assertIsNone(response.data["explanation"])
        self.assertEqual(response.data["model_version"], "Random Forest")
        # Untouched in the DB too.
        legacy.refresh_from_db()
        self.assertEqual(legacy.input_data, {"age": 50, "sex": "F"})

    def test_owner_scoping_404_not_403(self):
        mine = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/predictions/{mine.data['id']}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 14. Model loading failure returns sanitized 503
    def test_model_unavailable_returns_sanitized_503(self):
        from . import inference

        inference._load_tier.cache_clear()
        with patch("predictions.inference.joblib.load", side_effect=OSError("disk read error")):
            response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        inference._load_tier.cache_clear()  # don't poison the cache for later tests
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertNotIn("OSError", str(response.data))
        self.assertNotIn("Traceback", str(response.data))
        self.assertIn("detail", response.data)

    # 15. Unexpected error does not leak a traceback
    def test_unexpected_error_returns_sanitized_500(self):
        with patch("predictions.views.Prediction.objects.create", side_effect=RuntimeError("boom, unexpected")):
            response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertNotIn("boom", str(response.data))
        self.assertNotIn("RuntimeError", str(response.data))
        self.assertNotIn("Traceback", str(response.data))
        self.assertIn("detail", response.data)

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class PredictionExplanationAPITests(APITestCase):
    """
    LLM Explanation Layer (Web App Feature Scope.md §5). Mocks
    predictions.llm_service.generate_explanation throughout — never calls the
    real Gemini API in the test suite.
    """

    def setUp(self):
        self.user = User.objects.create_user(email="tester2@example.com", password="TestPass123!")
        self.other_user = User.objects.create_user(email="other2@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)
        create = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.prediction_id = create.data["id"]

    def test_generates_and_persists_on_first_call(self):
        with patch("predictions.views.llm_service.generate_explanation", return_value="A generated summary.") as mock_gen:
            response = self.client.get(f"/api/predictions/{self.prediction_id}/explanation/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["llm_summary"], "A generated summary.")
        mock_gen.assert_called_once()
        # Guardrail: only the ML model's own output is passed, never raw
        # patient input (e.g. no "age"/"sex"/"bp" kwargs reach the LLM layer).
        _, kwargs = mock_gen.call_args
        self.assertEqual(set(kwargs.keys()), {"probability", "risk_label", "prediction", "tier", "top_factors"})
        saved = Prediction.objects.get(id=self.prediction_id)
        self.assertEqual(saved.llm_summary, "A generated summary.")

    def test_second_call_returns_cached_without_regenerating(self):
        with patch("predictions.views.llm_service.generate_explanation", return_value="First summary.") as mock_gen:
            self.client.get(f"/api/predictions/{self.prediction_id}/explanation/")
            response = self.client.get(f"/api/predictions/{self.prediction_id}/explanation/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["llm_summary"], "First summary.")
        mock_gen.assert_called_once()

    def test_legacy_tier_has_no_explanation_endpoint(self):
        legacy = Prediction.objects.create(
            user=self.user,
            tier=Prediction.Tier.LEGACY,
            input_data={"age": 50},
            probability=0.5,
            risk_label="Moderate",
            prediction=False,
            model_version="Random Forest",
            threshold_used=0.5,
        )
        response = self.client.get(f"/api/predictions/{legacy.id}/explanation/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_scoping_404(self):
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/predictions/{self.prediction_id}/explanation/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_llm_unavailable_returns_sanitized_503(self):
        from . import llm_service

        with patch(
            "predictions.views.llm_service.generate_explanation",
            side_effect=llm_service.LlmUnavailableError("upstream API key invalid: sk-secret-detail"),
        ):
            response = self.client.get(f"/api/predictions/{self.prediction_id}/explanation/")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertNotIn("sk-secret-detail", str(response.data))
        self.assertIn("detail", response.data)
        saved = Prediction.objects.get(id=self.prediction_id)
        self.assertIsNone(saved.llm_summary)


class PredictionReportAPITests(APITestCase):
    """PDF Report Generation (Web App Feature Scope.md §9)."""

    def setUp(self):
        self.user = User.objects.create_user(email="report@example.com", password="TestPass123!")
        self.other_user = User.objects.create_user(email="report-other@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)

    def test_basic_report_downloads_as_pdf(self):
        create = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        prediction_id = create.data["id"]

        response = self.client.get(f"/api/predictions/{prediction_id}/report/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"], "application/pdf")
        self.assertIn("attachment", response["Content-Disposition"])
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_enhanced_report_downloads_as_pdf(self):
        payload = {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}
        create = self.client.post("/api/predictions/", payload, format="json")
        prediction_id = create.data["id"]

        response = self.client.get(f"/api/predictions/{prediction_id}/report/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_legacy_report_generates_minimal_pdf_without_erroring(self):
        legacy = Prediction.objects.create(
            user=self.user,
            tier=Prediction.Tier.LEGACY,
            input_data={"age": 50, "sex": "F"},
            probability=0.75,
            risk_label="High",
            prediction=True,
            model_version="Random Forest",
            threshold_used=0.5675,
        )
        response = self.client.get(f"/api/predictions/{legacy.id}/report/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.content.startswith(b"%PDF"))

    def test_owner_scoping_404(self):
        create = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        prediction_id = create.data["id"]
        self.client.force_authenticate(user=self.other_user)
        response = self.client.get(f"/api/predictions/{prediction_id}/report/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_requires_authentication(self):
        create = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        prediction_id = create.data["id"]
        self.client.force_authenticate(user=None)
        response = self.client.get(f"/api/predictions/{prediction_id}/report/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class PredictionListAPITests(APITestCase):
    """History page (Web App Feature Scope.md §7)."""

    def setUp(self):
        self.user = User.objects.create_user(email="history@example.com", password="TestPass123!")
        self.other_user = User.objects.create_user(email="history-other@example.com", password="TestPass123!")
        self.client.force_authenticate(user=self.user)

    def test_list_returns_only_own_predictions_newest_first(self):
        first = self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json").data
        second = self.client.post(
            "/api/predictions/", {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}, format="json"
        ).data

        self.client.force_authenticate(user=self.other_user)
        self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")

        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/predictions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [row["id"] for row in response.data]
        self.assertEqual(ids, [second["id"], first["id"]])

    def test_list_empty_for_fresh_account(self):
        response = self.client.get("/api/predictions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_list_requires_authentication(self):
        self.client.force_authenticate(user=None)
        response = self.client.get("/api/predictions/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class AdminStatsAPITests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin@example.com", password="TestPass123!", role=User.Role.ADMIN
        )
        self.user = User.objects.create_user(email="regular@example.com", password="TestPass123!")

    def test_requires_admin_role(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/admin/stats/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_requires_authentication(self):
        response = self.client.get("/api/admin/stats/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_returns_real_aggregate_counts(self):
        self.client.force_authenticate(user=self.user)
        self.client.post("/api/predictions/", BASIC_PAYLOAD, format="json")
        self.client.post(
            "/api/predictions/", {**BASIC_PAYLOAD, "tier": "enhanced", **ENHANCED_EXTRA}, format="json"
        )

        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/admin/stats/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_users"], 2)
        self.assertEqual(response.data["total_predictions"], 2)
        self.assertEqual(response.data["tier_counts"]["basic"], 1)
        self.assertEqual(response.data["tier_counts"]["enhanced"], 1)
        self.assertEqual(len(response.data["predictions_per_day"]), 14)
        self.assertIsNotNone(response.data["average_probability"])
