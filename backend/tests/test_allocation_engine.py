"""
Comprehensive Automated Test Suite for BlueLoop Stage 3 Core Intelligence Engine.
Tests:
- Deterministic candidate generation and feasibility gates
- Linear capacity constraints and prevention of double-counting
- Strict water-quality compatibility enforcement (fail-closed)
- Missing quality data handling (REQUIRES_FURTHER_TESTING)
- Distance and budget constraint exclusions
- Cost breakdown arithmetic and unknown logistics handling
- Environmental impact substitution ratio boundaries
- Deterministic tie-breaking reproducibility
- REST API integration: POST /api/v1/allocations/run, GET /api/v1/allocations/{run_id}, GET /api/v1/allocations
"""

from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.entities import (
    DemandRequest,
    QualityLimits,
    SupplierFacility,
    SupplyListing,
    WaterQualityMeasurements,
)
from app.models.enums import (
    DemandStatus,
    EligibilityStatus,
    FacilityType,
    IntendedUse,
    ListingStatus,
    VerificationStatus,
    WaterGrade,
)
from app.repositories.memory import get_repository_container
from app.core.seeds import seed_demonstration_data
from app.services.allocation_engine import AllocationEngine
from app.services.candidate import CandidateEvaluator
from app.services.cost import CostCalculator
from app.services.geo import GeoDistanceCalculator, haversine_distance_km
from app.services.impact import ImpactCalculator

client = TestClient(app)


# =============================================================================
# 1. Geographic & Distance Tests
# =============================================================================


def test_geo_haversine_known_coordinates():
    # Maraimalai Nagar (12.7932, 80.0245) to Guindy (13.0067, 80.2052)
    dist = haversine_distance_km(12.7932, 80.0245, 13.0067, 80.2052)
    assert dist is not None
    assert 28.0 < dist < 32.0

    # Class static method produces identical result
    dist_class = GeoDistanceCalculator.calculate_distance_km(12.7932, 80.0245, 13.0067, 80.2052)
    assert dist_class == dist


def test_geo_identical_coordinates():
    dist = haversine_distance_km(13.0, 80.0, 13.0, 80.0)
    assert dist == 0.0


def test_geo_missing_coordinates():
    assert haversine_distance_km(None, 80.0, 13.0, 80.0) is None
    assert haversine_distance_km(13.0, None, 13.0, 80.0) is None
    assert haversine_distance_km(13.0, 80.0, None, 80.0) is None
    assert haversine_distance_km(13.0, 80.0, 13.0, None) is None


def test_geo_invalid_boundary_coordinates():
    with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
        haversine_distance_km(95.0, 80.0, 13.0, 80.0)

    with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
        haversine_distance_km(13.0, 185.0, 13.0, 80.0)


# =============================================================================
# 2. Procurement & Logistics Cost Calculator Tests
# =============================================================================


def test_cost_calculator_with_complete_data():
    volume = 1000.0
    unit_price = 1.20
    distance_km = 20.0
    rate = 0.015

    estimate = CostCalculator.calculate(
        volume_kl=volume,
        unit_price_per_kl=unit_price,
        distance_km=distance_km,
        transport_rate_per_kl_km=rate,
    )

    assert estimate.allocated_volume_kl == 1000.0
    assert estimate.unit_supplier_price_per_kl == 1.20
    assert estimate.supplier_subtotal == 1200.0  # 1000 * 1.20

    assert estimate.is_transport_cost_known is True
    assert estimate.transport_subtotal == 300.0  # 1000 * 20.0 * 0.015
    assert estimate.unit_transport_cost_per_kl == 0.30

    assert estimate.total_delivered_cost == 1500.0  # 1200 + 300
    assert estimate.delivered_cost_per_kl == 1.50


def test_cost_calculator_missing_distance_honesty():
    # If distance is unverified/unknown, logistics cost MUST NOT default to 0.0
    estimate = CostCalculator.calculate(
        volume_kl=1000.0,
        unit_price_per_kl=1.20,
        distance_km=None,
        transport_rate_per_kl_km=0.015,
    )

    assert estimate.supplier_subtotal == 1200.0
    assert estimate.is_transport_cost_known is False
    assert estimate.transport_subtotal is None
    assert estimate.total_delivered_cost is None
    assert estimate.delivered_cost_per_kl is None


def test_cost_calculator_invalid_inputs():
    with pytest.raises(ValueError, match="positive"):
        CostCalculator.calculate(volume_kl=0.0, unit_price_per_kl=1.0)

    with pytest.raises(ValueError, match="negative"):
        CostCalculator.calculate(volume_kl=100.0, unit_price_per_kl=-0.50)


# =============================================================================
# 3. Environmental Impact Calculator Tests
# =============================================================================


def test_impact_calculator_valid_substitution():
    # 1:1 displacement
    res1 = ImpactCalculator.estimate(volume_kl=1500.0, substitution_ratio=1.0)
    assert res1.potential_freshwater_displacement_kl == 1500.0
    assert res1.substitution_ratio == 1.0

    # 80% displacement
    res2 = ImpactCalculator.estimate(volume_kl=1500.0, substitution_ratio=0.8)
    assert res2.potential_freshwater_displacement_kl == 1200.0
    assert res2.substitution_ratio == 0.8


def test_impact_calculator_invalid_ratio_bounds():
    with pytest.raises(ValueError, match="between 0.0 and 1.0"):
        ImpactCalculator.estimate(volume_kl=1000.0, substitution_ratio=-0.1)

    with pytest.raises(ValueError, match="between 0.0 and 1.0"):
        ImpactCalculator.estimate(volume_kl=1000.0, substitution_ratio=1.2)


def test_impact_calculator_invalid_volume():
    with pytest.raises(ValueError, match="positive"):
        ImpactCalculator.estimate(volume_kl=0.0, substitution_ratio=1.0)


# =============================================================================
# 4. Candidate Evaluator & Hard Feasibility Gate Tests
# =============================================================================


def test_candidate_evaluator_eligible_pair():
    seed_demonstration_data()
    container = get_repository_container()

    evaluator = CandidateEvaluator()
    listing = container.listings.get("SYNTH-LIST-01")  # Tertiary Polished
    demand = container.demands.get("SYNTH-DEM-01")  # Cooling Tower
    facility = container.facilities.get(listing.facility_id)

    res = evaluator.evaluate_pair(listing, demand, facility)
    assert res.eligibility_status == EligibilityStatus.ELIGIBLE
    assert "QUALITY_ELIGIBLE" in res.reason_codes
    assert res.quality_decision is not None
    assert res.quality_decision.is_eligible is True


def test_candidate_evaluator_quality_mismatch():
    seed_demonstration_data()
    container = get_repository_container()

    evaluator = CandidateEvaluator()
    listing = container.listings.get("SYNTH-LIST-03")  # Secondary Clarified (High TDS: 2200, COD: 110)
    demand = container.demands.get("SYNTH-DEM-01")  # Cooling tower limit: max TDS 1200, COD 45
    facility = container.facilities.get(listing.facility_id)

    res = evaluator.evaluate_pair(listing, demand, facility)
    assert res.eligibility_status == EligibilityStatus.INELIGIBLE
    assert "QUALITY_FAILED_TDS_MG_L" in res.reason_codes
    assert "QUALITY_FAILED_COD_MG_L" in res.reason_codes
    assert "tds_mg_l" in res.quality_decision.failed_parameters
    assert "cod_mg_l" in res.quality_decision.failed_parameters


def test_candidate_evaluator_missing_laboratory_evidence():
    seed_demonstration_data()
    container = get_repository_container()

    evaluator = CandidateEvaluator()
    listing = container.listings.get("SYNTH-LIST-04")  # Uncharacterised stream (measurements=None)
    demand = container.demands.get("SYNTH-DEM-01")
    facility = container.facilities.get(listing.facility_id)

    res = evaluator.evaluate_pair(listing, demand, facility)
    assert res.eligibility_status == EligibilityStatus.REQUIRES_FURTHER_TESTING
    assert "QUALITY_UNKNOWN_PH" in res.reason_codes
    assert res.quality_decision is not None
    assert res.quality_decision.is_eligible is False


def test_candidate_evaluator_distance_constraint_violation():
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    evaluator = CandidateEvaluator()

    # Facility in Mumbai (19.0760, 72.8777)
    facility = SupplierFacility(
        id="FAC-MUMBAI",
        org_id="ORG-1",
        name="Mumbai WWTP",
        facility_type=FacilityType.CETP,
        city="Mumbai",
        state="Maharashtra",
        latitude=19.0760,
        longitude=72.8777,
        verification_status=VerificationStatus.VERIFIED_DEMO,
        is_synthetic=True,
    )

    listing = SupplyListing(
        id="LIST-MUMBAI",
        facility_id="FAC-MUMBAI",
        name="Mumbai Effluent",
        water_grade=WaterGrade.RO_PERMEATE,
        available_volume_kl=1000.0,
        price_per_kl=1.0,
        available_from=now,
        delivery_radius_km=50.0,
        measurements=WaterQualityMeasurements(
            ph=7.0, tds_mg_l=100.0, cod_mg_l=10.0, turbidity_ntu=0.5, heavy_metals_pass=True
        ),
        status=ListingStatus.ACTIVE,
    )

    # Buyer in Chennai (13.0827, 80.2707) with max 30 km radius
    demand = DemandRequest(
        id="DEM-CHENNAI",
        org_id="ORG-2",
        facility_name="Chennai Intake",
        intended_use=IntendedUse.COOLING_TOWER,
        required_volume_kl=500.0,
        max_distance_km=30.0,
        latitude=13.0827,
        longitude=80.2707,
        quality_limits=QualityLimits(
            min_ph=6.5, max_ph=8.5, max_tds_mg_l=500.0, required_parameters=["ph", "tds_mg_l"]
        ),
        status=DemandStatus.OPEN,
    )

    res = evaluator.evaluate_pair(listing, demand, facility)
    assert res.eligibility_status == EligibilityStatus.INELIGIBLE
    assert "DISTANCE_EXCEEDED" in res.reason_codes


def test_candidate_evaluator_ex_works_price_ceiling_violation():
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)
    evaluator = CandidateEvaluator()

    facility = SupplierFacility(
        id="FAC-EXPENSIVE",
        org_id="ORG-1",
        name="High Cost Plant",
        facility_type=FacilityType.CETP,
        city="Chennai",
        state="Tamil Nadu",
        latitude=13.0,
        longitude=80.0,
        verification_status=VerificationStatus.VERIFIED_DEMO,
        is_synthetic=True,
    )

    listing = SupplyListing(
        id="LIST-EXPENSIVE",
        facility_id="FAC-EXPENSIVE",
        name="Expensive Water",
        water_grade=WaterGrade.RO_PERMEATE,
        available_volume_kl=1000.0,
        price_per_kl=3.50,  # Price is 3.50
        available_from=now,
        delivery_radius_km=50.0,
        measurements=WaterQualityMeasurements(
            ph=7.0, tds_mg_l=100.0, cod_mg_l=10.0, turbidity_ntu=0.5, heavy_metals_pass=True
        ),
        status=ListingStatus.ACTIVE,
    )

    demand = DemandRequest(
        id="DEM-BUDGET",
        org_id="ORG-2",
        facility_name="Budget Plant",
        intended_use=IntendedUse.COOLING_TOWER,
        required_volume_kl=500.0,
        max_price_per_kl=1.50,  # Buyer ceiling is 1.50
        latitude=13.05,
        longitude=80.05,
        quality_limits=QualityLimits(
            min_ph=6.5, max_ph=8.5, max_tds_mg_l=500.0, required_parameters=["ph", "tds_mg_l"]
        ),
        status=DemandStatus.OPEN,
    )

    res = evaluator.evaluate_pair(listing, demand, facility)
    assert res.eligibility_status == EligibilityStatus.INELIGIBLE
    assert "PRICE_EXCEEDS_MAX_LIMIT" in res.reason_codes


# =============================================================================
# 5. Core Allocation Engine Optimization Tests
# =============================================================================


def test_allocation_engine_full_run_with_seed_data():
    seed_demonstration_data()
    container = get_repository_container()

    listings = container.listings.list()
    demands = container.demands.list()
    facilities_map = {f.id: f for f in container.facilities.list()}

    engine = AllocationEngine()
    result = engine.run_allocation(
        listings=listings,
        demands=demands,
        facilities_map=facilities_map,
        substitution_ratio=1.0,
        transport_rate_per_kl_km=0.015,
    )

    # 1. Structural assertions
    assert result.status == "PROPOSED"
    assert len(result.proposed_allocations) > 0
    assert len(result.rejected_candidates) > 0

    # 2. Hard constraint enforcement: no double-counting
    total_allocated = sum(p.allocated_volume_kl for p in result.proposed_allocations)
    assert total_allocated <= result.totals.total_available_volume_kl
    assert total_allocated <= result.totals.total_requested_volume_kl

    # 3. Verify that SYNTH-LIST-04 (uncharacterised) receives ZERO allocation
    allocated_list_04 = [p for p in result.proposed_allocations if p.listing_id == "SYNTH-LIST-04"]
    assert len(allocated_list_04) == 0

    # 4. Verify that SYNTH-LIST-03 was rejected for SYNTH-DEM-01
    rejected_pair = [
        r for r in result.rejected_candidates
        if r.listing_id == "SYNTH-LIST-03" and r.demand_id == "SYNTH-DEM-01"
    ]
    assert len(rejected_pair) == 1
    assert any("QUALITY_FAILED" in code for code in rejected_pair[0].reason_codes)


def test_allocation_engine_prevents_double_counting_competing_demands():
    now = datetime(2026, 1, 1, tzinfo=timezone.utc)

    facility = SupplierFacility(
        id="FAC-SCARCE",
        org_id="ORG-S",
        name="Scarce Plant",
        facility_type=FacilityType.CETP,
        city="Chennai",
        state="Tamil Nadu",
        latitude=13.0,
        longitude=80.0,
        verification_status=VerificationStatus.VERIFIED_DEMO,
        is_synthetic=True,
    )

    # Only 1000 kL available
    scarce_listing = SupplyListing(
        id="LIST-SCARCE",
        facility_id="FAC-SCARCE",
        name="Scarce Batch",
        water_grade=WaterGrade.RO_PERMEATE,
        available_volume_kl=1000.0,
        price_per_kl=1.00,
        available_from=now,
        delivery_radius_km=50.0,
        measurements=WaterQualityMeasurements(
            ph=7.0, tds_mg_l=100.0, cod_mg_l=10.0, turbidity_ntu=0.5, heavy_metals_pass=True
        ),
        status=ListingStatus.ACTIVE,
    )

    # Two competing demands, each wanting 700 kL (total needed = 1400 kL > 1000 kL)
    demand_a = DemandRequest(
        id="DEM-A",
        org_id="ORG-A",
        facility_name="Intake A",
        intended_use=IntendedUse.COOLING_TOWER,
        required_volume_kl=700.0,
        latitude=13.01,
        longitude=80.01,
        quality_limits=QualityLimits(
            min_ph=6.0, max_ph=8.0, max_tds_mg_l=500.0, required_parameters=["ph", "tds_mg_l"]
        ),
        status=DemandStatus.OPEN,
    )

    demand_b = DemandRequest(
        id="DEM-B",
        org_id="ORG-B",
        facility_name="Intake B",
        intended_use=IntendedUse.COOLING_TOWER,
        required_volume_kl=700.0,
        latitude=13.05,
        longitude=80.05,
        quality_limits=QualityLimits(
            min_ph=6.0, max_ph=8.0, max_tds_mg_l=500.0, required_parameters=["ph", "tds_mg_l"]
        ),
        status=DemandStatus.OPEN,
    )

    engine = AllocationEngine()
    result = engine.run_allocation(
        listings=[scarce_listing],
        demands=[demand_a, demand_b],
        facilities_map={"FAC-SCARCE": facility},
    )

    # Total allocated must strictly equal available supply (1000 kL)
    total_allocated = sum(p.allocated_volume_kl for p in result.proposed_allocations)
    assert total_allocated == 1000.0

    # Supply utilization must be 100%
    supply_util = result.supply_utilization[0]
    assert supply_util.allocated_volume_kl == 1000.0
    assert supply_util.remaining_volume_kl == 0.0
    assert supply_util.utilization_percentage == 100.0

    # One demand got 700 kL (100%), the other got 300 kL (42.9%)
    allocations_by_demand = {p.demand_id: p.allocated_volume_kl for p in result.proposed_allocations}
    assert (
        (allocations_by_demand["DEM-A"] == 700.0 and allocations_by_demand["DEM-B"] == 300.0)
        or (allocations_by_demand["DEM-B"] == 700.0 and allocations_by_demand["DEM-A"] == 300.0)
    )


def test_allocation_engine_reproducibility():
    seed_demonstration_data()
    container = get_repository_container()

    listings = container.listings.list()
    demands = container.demands.list()
    facilities_map = {f.id: f for f in container.facilities.list()}

    engine = AllocationEngine()

    run1 = engine.run_allocation(listings, demands, facilities_map, run_id="FIXED-RUN-ID")
    run2 = engine.run_allocation(listings, demands, facilities_map, run_id="FIXED-RUN-ID")

    assert run1.totals.total_allocated_volume_kl == run2.totals.total_allocated_volume_kl
    assert run1.totals.total_supplier_cost == run2.totals.total_supplier_cost
    assert len(run1.proposed_allocations) == len(run2.proposed_allocations)

    for p1, p2 in zip(run1.proposed_allocations, run2.proposed_allocations):
        assert p1.candidate_id == p2.candidate_id
        assert p1.allocated_volume_kl == p2.allocated_volume_kl
        assert p1.cost_estimate.supplier_subtotal == p2.cost_estimate.supplier_subtotal


# =============================================================================
# 6. REST API Endpoints Integration Tests
# =============================================================================


def test_api_post_allocation_run_default():
    seed_demonstration_data()

    response = client.post("/api/v1/allocations/run", json={})
    assert response.status_code == 200
    data = response.json()

    assert "run_id" in data
    assert data["status"] == "PROPOSED"
    assert "totals" in data
    assert data["totals"]["total_allocated_volume_kl"] > 0
    assert data["totals"]["total_supplier_cost"] > 0
    assert len(data["proposed_allocations"]) > 0
    assert len(data["rejected_candidates"]) > 0
    assert len(data["demand_fulfillment"]) > 0
    assert len(data["supply_utilization"]) > 0
    assert data["is_synthetic"] is True


def test_api_post_allocation_run_custom_filters():
    seed_demonstration_data()

    payload = {
        "demand_ids": ["SYNTH-DEM-01"],
        "listing_ids": ["SYNTH-LIST-01", "SYNTH-LIST-02"],
        "substitution_ratio": 0.9,
        "transport_rate_per_kl_km": 0.02,
    }
    response = client.post("/api/v1/allocations/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["totals"]["total_requested_volume_kl"] == 3000.0  # DEM-01 requirement
    assert len(data["demand_fulfillment"]) == 1
    assert data["demand_fulfillment"][0]["demand_id"] == "SYNTH-DEM-01"


def test_api_post_allocation_run_invalid_ids_returns_404():
    seed_demonstration_data()

    # Invalid demand ID
    res1 = client.post(
        "/api/v1/allocations/run",
        json={"demand_ids": ["NON-EXISTENT-DEMAND"]},
    )
    assert res1.status_code == 404

    # Invalid listing ID
    res2 = client.post(
        "/api/v1/allocations/run",
        json={"listing_ids": ["NON-EXISTENT-LISTING"]},
    )
    assert res2.status_code == 404


def test_api_get_allocation_run_by_id():
    seed_demonstration_data()

    # 1. Trigger a run
    post_res = client.post("/api/v1/allocations/run", json={})
    assert post_res.status_code == 200
    run_id = post_res.json()["run_id"]

    # 2. Fetch the stored run
    get_res = client.get(f"/api/v1/allocations/{run_id}")
    assert get_res.status_code == 200
    fetched_data = get_res.json()
    assert fetched_data["run_id"] == run_id
    assert fetched_data["totals"] == post_res.json()["totals"]

    # 3. Non-existent run ID returns 404
    missing_res = client.get("/api/v1/allocations/RUN-NON-EXISTENT-999")
    assert missing_res.status_code == 404


def test_api_list_allocation_runs():
    seed_demonstration_data()

    # Run two allocations
    client.post("/api/v1/allocations/run", json={})
    client.post("/api/v1/allocations/run", json={})

    response = client.get("/api/v1/allocations")
    assert response.status_code == 200
    runs = response.json()
    assert isinstance(runs, list)
    assert len(runs) >= 2
