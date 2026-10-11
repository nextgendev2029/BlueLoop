"""
Comprehensive Automated Test Suite for BlueLoop Stage 4 Backend APIs
Tests:
- Suppliers & Supplies filters and bounded pagination
- Demands filters and bounded pagination
- Allocation proposal acceptance, rejection, and invalid state transition guards
- Physical deliveries: creation, retrieval, filters, valid lifecycle progression, and transition guards
- Impact summary analytics: clean separation of potential, accepted, confirmed, and verified displacement
- Standardized error handling and validation responses
"""

from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.enums import (
    DeliveryLifecycleStatus,
    DeliveryMode,
    ListingStatus,
    VerificationStatus,
)
from app.core.config import settings
from app.core.seeds import seed_demonstration_data
from app.repositories.memory import get_repository_container

client = TestClient(app)
client.cookies.set(settings.session_cookie_name, "blueloop-test-admin-token")


# =============================================================================
# 1. Suppliers & Supplies Filters and Bounded Pagination
# =============================================================================


def test_suppliers_filters_and_pagination():
    seed_demonstration_data()

    # Pagination: limit=1, offset=0
    res1 = client.get("/api/v1/suppliers?limit=1&offset=0")
    assert res1.status_code == 200
    data1 = res1.json()
    assert len(data1["items"]) == 1
    assert data1["total"] >= 3
    assert data1["limit"] == 1
    assert data1["offset"] == 0

    # Filter by state
    res_state = client.get("/api/v1/suppliers?state=Tamil%20Nadu")
    assert res_state.status_code == 200
    for fac in res_state.json()["items"]:
        assert fac["state"].lower() == "tamil nadu"

    # Filter by verification status
    res_status = client.get("/api/v1/suppliers?verification_status=VERIFIED_DEMO")
    assert res_status.status_code == 200
    assert res_status.json()["total"] >= 1

    # Invalid pagination bound: limit <= 0 returns 422
    res_bad = client.get("/api/v1/suppliers?limit=0")
    assert res_bad.status_code == 422
    assert res_bad.json()["error"] == "ValidationError"


def test_supplies_filters_and_pagination():
    seed_demonstration_data()

    # Filter by status = ACTIVE
    res_active = client.get("/api/v1/supplies?status=ACTIVE")
    assert res_active.status_code == 200
    assert res_active.json()["total"] >= 4
    for l in res_active.json()["items"]:
        assert l["status"] == "ACTIVE"

    # Filter by quality_evidence_status = CERTIFIED
    res_cert = client.get("/api/v1/supplies?quality_evidence_status=CERTIFIED")
    assert res_cert.status_code == 200
    for l in res_cert.json()["items"]:
        assert l["quality_evidence_status"] == "CERTIFIED"

    # Pagination: limit=2, offset=1
    res_page = client.get("/api/v1/supplies?limit=2&offset=1")
    assert res_page.status_code == 200
    page_data = res_page.json()
    assert len(page_data["items"]) == 2
    assert page_data["limit"] == 2
    assert page_data["offset"] == 1


# =============================================================================
# 2. Buyer Demands Filters and Bounded Pagination
# =============================================================================


def test_demands_filters_and_pagination():
    seed_demonstration_data()

    # Filter by max_distance_km
    res_dist = client.get("/api/v1/demands?max_distance_km=30.0")
    assert res_dist.status_code == 200
    for d in res_dist.json()["items"]:
        assert d["max_distance_km"] >= 30.0

    # Pagination
    res_page = client.get("/api/v1/demands?limit=1&offset=1")
    assert res_page.status_code == 200
    data = res_page.json()
    assert len(data["items"]) == 1
    assert data["limit"] == 1
    assert data["offset"] == 1

    # Non-existent demand detail returns 404
    res_missing = client.get("/api/v1/demands/DEMAND-UNKNOWN-999")
    assert res_missing.status_code == 404
    assert res_missing.json()["error"] == "ResourceNotFound"


# =============================================================================
# 3. Allocation Proposal Review & Lifecycle Guards
# =============================================================================


def test_allocation_proposal_accept_and_reject_lifecycle():
    seed_demonstration_data()
    container = get_repository_container()

    # 1. Trigger an allocation run
    run_res = client.post("/api/v1/allocations/run", json={})
    assert run_res.status_code == 200
    run_id = run_res.json()["run_id"]
    assert run_res.json()["status"] == "PROPOSED"

    # 2. Accept proposal
    accept_res = client.post(f"/api/v1/allocations/{run_id}/accept")
    assert accept_res.status_code == 200
    assert accept_res.json()["status"] == "ACCEPTED"

    # Verify audit event was logged
    audit_events = container.audit_events.list(lambda a: a.entity_id == run_id)
    assert len(audit_events) >= 1
    assert any(a.action == "ACCEPT_PROPOSAL" for a in audit_events)

    # 3. Guard: Attempt to reject an already accepted proposal must fail with 400
    reject_attempt = client.post(f"/api/v1/allocations/{run_id}/reject")
    assert reject_attempt.status_code == 400
    assert reject_attempt.json()["error"] == "BadRequest"
    assert "already been accepted" in reject_attempt.json()["message"]


def test_allocation_proposal_reject_then_accept_guard():
    seed_demonstration_data()

    # 1. Trigger run
    run_res = client.post("/api/v1/allocations/run", json={})
    run_id = run_res.json()["run_id"]

    # 2. Reject proposal
    reject_res = client.post(f"/api/v1/allocations/{run_id}/reject")
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "REJECTED"

    # 3. Guard: Attempt to accept an already rejected proposal must fail with 400
    accept_attempt = client.post(f"/api/v1/allocations/{run_id}/accept")
    assert accept_attempt.status_code == 400
    assert accept_attempt.json()["error"] == "BadRequest"
    assert "already been rejected" in accept_attempt.json()["message"]

    # 4. Unknown proposal ID returns 404
    missing_res = client.post("/api/v1/allocations/RUN-DOES-NOT-EXIST/accept")
    assert missing_res.status_code == 404


# =============================================================================
# 4. Physical Deliveries Lifecycle & Transition Guards
# =============================================================================


def test_deliveries_crud_and_lifecycle():
    seed_demonstration_data()
    now = datetime(2026, 1, 20, 10, 0, 0, tzinfo=timezone.utc)

    # 1. Schedule a new delivery
    payload = {
        "listing_id": "SYNTH-LIST-01",
        "demand_id": "SYNTH-DEM-01",
        "dispatched_volume_kl": 600.0,
        "scheduled_date": now.isoformat(),
        "delivery_mode": "DEDICATED_TANKER",
    }
    create_res = client.post("/api/v1/deliveries", json=payload)
    assert create_res.status_code == 201
    delivery = create_res.json()
    delivery_id = delivery["id"]
    assert delivery["lifecycle_status"] == "SCHEDULED"
    assert delivery["dispatched_volume_kl"] == 600.0
    assert delivery["delivered_volume_kl"] is None
    assert delivery["verification_status"] == "UNVERIFIED"

    # 2. Get delivery by ID
    get_res = client.get(f"/api/v1/deliveries/{delivery_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == delivery_id

    # 3. List deliveries
    list_res = client.get("/api/v1/deliveries?limit=10")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Progress lifecycle: SCHEDULED -> DISPATCHED
    res_disp = client.patch(
        f"/api/v1/deliveries/{delivery_id}/status",
        json={"lifecycle_status": "DISPATCHED"},
    )
    assert res_disp.status_code == 200
    assert res_disp.json()["lifecycle_status"] == "DISPATCHED"

    # 5. DISPATCHED -> IN_TRANSIT
    res_transit = client.patch(
        f"/api/v1/deliveries/{delivery_id}/status",
        json={"lifecycle_status": "IN_TRANSIT"},
    )
    assert res_transit.status_code == 200
    assert res_transit.json()["lifecycle_status"] == "IN_TRANSIT"

    # 6. IN_TRANSIT -> DELIVERED_SAMPLE_PENDING
    res_sample = client.patch(
        f"/api/v1/deliveries/{delivery_id}/status",
        json={"lifecycle_status": "DELIVERED_SAMPLE_PENDING"},
    )
    assert res_sample.status_code == 200
    assert res_sample.json()["lifecycle_status"] == "DELIVERED_SAMPLE_PENDING"

    # 7. DELIVERED_SAMPLE_PENDING -> ACCEPTED_CONFIRMED (with actual metered volume)
    res_confirm = client.patch(
        f"/api/v1/deliveries/{delivery_id}/status",
        json={"lifecycle_status": "ACCEPTED_CONFIRMED", "delivered_volume_kl": 595.0},
    )
    assert res_confirm.status_code == 200
    assert res_confirm.json()["lifecycle_status"] == "ACCEPTED_CONFIRMED"
    assert res_confirm.json()["delivered_volume_kl"] == 595.0

    # 8. Guard: Invalid transition backwards from terminal ACCEPTED_CONFIRMED state
    res_invalid = client.patch(
        f"/api/v1/deliveries/{delivery_id}/status",
        json={"lifecycle_status": "SCHEDULED"},
    )
    assert res_invalid.status_code == 400
    assert res_invalid.json()["error"] == "BadRequest"


def test_delivery_creation_validation_errors():
    seed_demonstration_data()
    now = datetime(2026, 1, 20, 10, 0, 0, tzinfo=timezone.utc)

    # Missing listing
    res1 = client.post(
        "/api/v1/deliveries",
        json={
            "listing_id": "LIST-NON-EXISTENT",
            "demand_id": "SYNTH-DEM-01",
            "dispatched_volume_kl": 500.0,
            "scheduled_date": now.isoformat(),
            "delivery_mode": "PIPELINE",
        },
    )
    assert res1.status_code == 404

    # Missing demand
    res2 = client.post(
        "/api/v1/deliveries",
        json={
            "listing_id": "SYNTH-LIST-01",
            "demand_id": "DEMAND-NON-EXISTENT",
            "dispatched_volume_kl": 500.0,
            "scheduled_date": now.isoformat(),
            "delivery_mode": "PIPELINE",
        },
    )
    assert res2.status_code == 404

    # Invalid non-positive volume
    res3 = client.post(
        "/api/v1/deliveries",
        json={
            "listing_id": "SYNTH-LIST-01",
            "demand_id": "SYNTH-DEM-01",
            "dispatched_volume_kl": 0.0,
            "scheduled_date": now.isoformat(),
            "delivery_mode": "PIPELINE",
        },
    )
    assert res3.status_code == 422


# =============================================================================
# 5. Impact Analytics Summary Tests
# =============================================================================


def test_impact_summary_analytics():
    seed_demonstration_data()

    # 1. Trigger an allocation run (status=PROPOSED)
    run_res = client.post("/api/v1/allocations/run", json={})
    assert run_res.status_code == 200
    run_id = run_res.json()["run_id"]

    # 2. Check initial impact summary
    sum_res1 = client.get("/api/v1/impact/summary")
    assert sum_res1.status_code == 200
    data1 = sum_res1.json()

    assert data1["potential_displacement_kl"] > 0
    assert data1["total_active_proposals_count"] >= 1
    assert data1["accepted_estimated_displacement_kl"] == 0.0
    assert data1["total_accepted_allocations_count"] == 0
    assert data1["delivery_confirmed_displacement_kl"] == 0.0
    assert data1["independently_verified_displacement_kl"] == 0.0
    assert data1["is_independently_verified"] is False
    assert len(data1["disclosures"]) >= 4

    # 3. Accept proposal
    client.post(f"/api/v1/allocations/{run_id}/accept")

    # 4. Check that displacement transferred from potential to accepted
    sum_res2 = client.get("/api/v1/impact/summary")
    data2 = sum_res2.json()
    assert data2["accepted_estimated_displacement_kl"] > 0
    assert data2["total_accepted_allocations_count"] >= 1

    # 5. Create and confirm a physical delivery
    now = datetime(2026, 1, 20, 10, 0, 0, tzinfo=timezone.utc)
    deliv_res = client.post(
        "/api/v1/deliveries",
        json={
            "listing_id": "SYNTH-LIST-01",
            "demand_id": "SYNTH-DEM-01",
            "dispatched_volume_kl": 800.0,
            "scheduled_date": now.isoformat(),
            "delivery_mode": "PIPELINE",
        },
    )
    deliv_id = deliv_res.json()["id"]

    # Progress to confirmed
    client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "DISPATCHED"})
    client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "IN_TRANSIT"})
    client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "DELIVERED_SAMPLE_PENDING"})
    client.patch(
        f"/api/v1/deliveries/{deliv_id}/status",
        json={"lifecycle_status": "ACCEPTED_CONFIRMED", "delivered_volume_kl": 790.0},
    )

    # 6. Verify delivery confirmed displacement is now accounted for
    sum_res3 = client.get("/api/v1/impact/summary")
    data3 = sum_res3.json()
    assert data3["delivery_confirmed_displacement_kl"] == 790.0
    assert data3["total_completed_deliveries_count"] >= 1
    # Without third-party certified testing, independently verified stays 0.0
    assert data3["independently_verified_displacement_kl"] == 0.0
    assert data3["is_independently_verified"] is False


def test_end_to_end_demo_workflow():
    """
    Validates complete bilateral workflow across roles:
    1. Buyer creates water demand
    2. Quality compatibility evaluated
    3. Allocation run executes
    4. Buyer accepts allocation proposal
    5. Supplier schedules delivery
    6. Delivery moves through custody chain to confirmed
    7. Impact ledger credits confirmed freshwater displacement
    """
    from starlette.testclient import TestClient
    from app.main import app

    buyer_client = TestClient(app)
    supplier_client = TestClient(app)

    # 1. Logins
    login_b = buyer_client.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})
    assert login_b.status_code == 200
    b_hdr = {"Authorization": f"Bearer {login_b.json()['token']}"}

    login_s = supplier_client.post("/api/v1/auth/login", json={"email": "supplier@blueloop.io", "password": "Password123!"})
    assert login_s.status_code == 200
    s_hdr = {"Authorization": f"Bearer {login_s.json()['token']}"}

    # 2. Create Demand (Buyer)
    demand_payload = {
        "facility_name": "Apex Clean Server Hall B",
        "intended_use": "COOLING_TOWER",
        "required_volume_kl": 500.0,
        "quality_limits": {
            "min_ph": 6.5,
            "max_ph": 8.5,
            "max_tds_mg_l": 1000.0,
            "required_parameters": ["ph", "tds_mg_l"],
        },
    }
    d_res = buyer_client.post("/api/v1/demands", json=demand_payload, headers=b_hdr)
    assert d_res.status_code == 201
    demand_id = d_res.json()["id"]

    # 3. Quality Compatibility Evaluation
    comp_res = buyer_client.post("/api/v1/compatibility/evaluate", json={"listing_id": "SYNTH-LIST-01", "demand_id": demand_id}, headers=b_hdr)
    assert comp_res.status_code == 200

    # 4. Run Allocation (Buyer)
    run_res = buyer_client.post("/api/v1/allocations/run", json={"demand_ids": [demand_id]}, headers=b_hdr)
    assert run_res.status_code == 200
    run_id = run_res.json()["run_id"]

    # 5. Accept Allocation (Buyer)
    acc_res = buyer_client.post(f"/api/v1/allocations/{run_id}/accept", headers=b_hdr)
    assert acc_res.status_code == 200
    assert acc_res.json()["status"] == "ACCEPTED"

    # 6. Create Delivery (Supplier)
    deliv_payload = {
        "listing_id": "SYNTH-LIST-01",
        "demand_id": demand_id,
        "dispatched_volume_kl": 350.0,
        "scheduled_date": "2026-03-10T10:00:00Z",
        "delivery_mode": "DEDICATED_TANKER",
    }
    del_res = supplier_client.post("/api/v1/deliveries", json=deliv_payload, headers=s_hdr)
    assert del_res.status_code == 201
    deliv_id = del_res.json()["id"]

    # 7. Custody Lifecycle Progression
    supplier_client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "DISPATCHED"}, headers=s_hdr)
    supplier_client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "IN_TRANSIT"}, headers=s_hdr)
    buyer_client.patch(f"/api/v1/deliveries/{deliv_id}/status", json={"lifecycle_status": "DELIVERED_SAMPLE_PENDING"}, headers=b_hdr)
    p_acc = buyer_client.patch(
        f"/api/v1/deliveries/{deliv_id}/status",
        json={"lifecycle_status": "ACCEPTED_CONFIRMED", "delivered_volume_kl": 350.0},
        headers=b_hdr,
    )
    assert p_acc.status_code == 200

    # 8. Impact Summary Verification
    imp_res = buyer_client.get("/api/v1/impact/summary", headers=b_hdr)
    assert imp_res.status_code == 200
    assert imp_res.json()["delivery_confirmed_displacement_kl"] >= 350.0
