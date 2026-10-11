"""
Automated Integration Tests for BlueLoop REST API Endpoints
"""

from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from app.core.config import settings
from app.main import app
from app.repositories.memory import get_repository_container

client = TestClient(app)
client.cookies.set(settings.session_cookie_name, "blueloop-test-admin-token")


def test_list_suppliers_endpoint():
    response = client.get("/api/v1/suppliers")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 3
    assert data["is_synthetic"] is True

    first_item = data["items"][0]
    assert "id" in first_item
    assert "name" in first_item
    assert "city" in first_item
    assert "organisation_name" in first_item


def test_list_suppliers_filter_by_city():
    response = client.get("/api/v1/suppliers?city=Chennai")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["city"].lower() == "chennai"


def test_get_supplier_facility_by_id():
    response = client.get("/api/v1/suppliers/SYNTH-FAC-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "SYNTH-FAC-01"
    assert data["name"] == "Maraimalai CETP Sector A"
    assert data["organisation_name"] == "Maraimalai Clean Tech Industrial Park"

    # Non-existent ID returns 404
    missing_res = client.get("/api/v1/suppliers/NON-EXISTENT-FAC")
    assert missing_res.status_code == 404


def test_list_supplies_endpoint():
    response = client.get("/api/v1/supplies")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 4
    assert data["is_synthetic"] is True


def test_list_supplies_filter_by_water_grade():
    response = client.get("/api/v1/supplies?water_grade=RO_PERMEATE")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    for item in data["items"]:
        assert item["water_grade"] == "RO_PERMEATE"


def test_get_supply_listing_by_id():
    response = client.get("/api/v1/supplies/SYNTH-LIST-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "SYNTH-LIST-01"
    assert data["water_grade"] == "TERTIARY_POLISHED"
    assert data["measurements"]["ph"] == 7.35

    # Non-existent ID returns 404
    missing_res = client.get("/api/v1/supplies/NON-EXISTENT-LIST")
    assert missing_res.status_code == 404


def test_list_demands_endpoint():
    response = client.get("/api/v1/demands")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 3
    assert data["is_synthetic"] is True


def test_get_demand_request_by_id():
    response = client.get("/api/v1/demands/SYNTH-DEM-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "SYNTH-DEM-01"
    assert data["intended_use"] == "COOLING_TOWER"
    assert data["quality_limits"]["max_tds_mg_l"] == 1200.0

    # Non-existent ID returns 404
    missing_res = client.get("/api/v1/demands/NON-EXISTENT-DEM")
    assert missing_res.status_code == 404


def test_evaluate_compatibility_matching_pair():
    # SYNTH-LIST-01 (TDS 980) meets SYNTH-DEM-01 (max TDS 1200)
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={
            "listing_id": "SYNTH-LIST-01",
            "demand_id": "SYNTH-DEM-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_eligible"] is True
    assert "Eligible: All" in data["decision_summary"]
    assert len(data["failed_parameters"]) == 0
    assert data["is_synthetic"] is True
    assert "BlueLoop Screening Tool Notice" in data["disclaimer"]


def test_evaluate_compatibility_mismatching_pair():
    # SYNTH-LIST-03 (TDS 2200, COD 110) violates SYNTH-DEM-01 (max TDS 1200, max COD 45)
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={
            "listing_id": "SYNTH-LIST-03",
            "demand_id": "SYNTH-DEM-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_eligible"] is False
    assert "tds_mg_l" in data["failed_parameters"]
    assert "cod_mg_l" in data["failed_parameters"]
    assert "Ineligible" in data["decision_summary"]


def test_evaluate_compatibility_missing_measurements_listing():
    # SYNTH-LIST-04 has no quality measurements -> marked INELIGIBLE with UNKNOWN params
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={
            "listing_id": "SYNTH-LIST-04",
            "demand_id": "SYNTH-DEM-01",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_eligible"] is False
    assert len(data["unknown_parameters"]) > 0


def test_evaluate_compatibility_custom_payload():
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={
            "custom_measurements": {
                "ph": 7.4,
                "tds_mg_l": 420.0,
                "cod_mg_l": 15.0,
                "turbidity_ntu": 0.8,
                "heavy_metals_pass": True,
            },
            "custom_limits": {
                "min_ph": 6.5,
                "max_ph": 8.5,
                "max_tds_mg_l": 500.0,
                "max_cod_mg_l": 30.0,
                "max_turbidity_ntu": 2.0,
                "required_parameters": ["ph", "tds_mg_l", "cod_mg_l", "turbidity_ntu"],
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_eligible"] is True
    assert len(data["failed_parameters"]) == 0


def test_evaluate_compatibility_invalid_payload_returns_400():
    # Empty payload with neither IDs nor custom limits
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={},
    )
    assert response.status_code == 400


def test_evaluate_compatibility_missing_entity_returns_404():
    response = client.post(
        "/api/v1/compatibility/evaluate",
        json={
            "listing_id": "NON-EXISTENT",
            "demand_id": "SYNTH-DEM-01",
        },
    )
    assert response.status_code == 404
