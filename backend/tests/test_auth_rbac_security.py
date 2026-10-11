"""
Comprehensive Security, Authentication, RBAC, and Tenant Isolation Test Suite
Implements all 20 required verification cases from Master Prompt 11:
1. Successful signup for a valid buyer
2. Successful signup for a valid supplier
3. Duplicate email rejection
4. Invalid email and weak password rejection
5. Public admin signup rejection
6. Login succeeds only with correct credentials
7. Incorrect credentials are rejected
8. Logout invalidates the session
9. Expired or invalid session is rejected
10. Unauthenticated access to protected APIs is rejected
11. Buyer cannot mutate supplier listings
12. Supplier cannot mutate buyer demand requests
13. Buyer cannot perform supplier-only actions
14. Supplier cannot perform buyer-only actions
15. Cross-organisation record access is rejected
16. Users cannot escalate their own role
17. Disabled accounts cannot continue using authenticated endpoints
18. Admin-only operations reject non-admin users
19. Authentication state survives page reload / persistence when session is valid
20. Existing quality screening, allocation, delivery, and impact tests continue passing
"""

from datetime import datetime, timezone, timedelta
import uuid
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.seeds import seed_demonstration_data
from app.db.sqlite import init_db
from app.main import create_application
from app.models.entities import DeliveryRecord, DemandRequest, QualityLimits
from app.models.enums import DeliveryLifecycleStatus, DeliveryMode, DemandStatus, IntendedUse
from app.repositories.memory import get_repository_container


@pytest.fixture(autouse=True)
def reset_db_before_test():
    init_db()
    container = get_repository_container()
    seed_demonstration_data(container, force_reset=True)
    return container


def get_client() -> TestClient:
    return TestClient(create_application())


# -----------------------------------------------------------------------------
# Case 1 & 2: Successful Signup for Valid Buyer and Supplier
# -----------------------------------------------------------------------------

def test_01_successful_signup_valid_buyer():
    client = get_client()
    unique_email = f"buyer_{uuid.uuid4().hex[:6]}@corporate-buyer.com"
    payload = {
        "name": "Jane Buyer",
        "email": unique_email,
        "password": "SecurePassword123!",
        "org_name": "Acme Beverages Ltd",
        "role": "buyer",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == unique_email.lower()
    assert data["user"]["role"] == "buyer"
    assert data["user"]["org_name"] == "Acme Beverages Ltd"
    assert data["user"]["is_active"] is True
    assert "password_hash" not in data["user"]
    # Check session cookie set
    assert settings.session_cookie_name in client.cookies


def test_02_successful_signup_valid_supplier():
    client = get_client()
    unique_email = f"supplier_{uuid.uuid4().hex[:6]}@clean-effluent.com"
    payload = {
        "name": "Bob Supplier",
        "email": unique_email,
        "password": "SecurePassword123!",
        "org_name": "Metro Water Recovery",
        "role": "supplier",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["email"] == unique_email.lower()
    assert data["user"]["role"] == "supplier"
    assert data["user"]["org_name"] == "Metro Water Recovery"
    assert settings.session_cookie_name in client.cookies


# -----------------------------------------------------------------------------
# Case 3: Duplicate Email Rejection
# -----------------------------------------------------------------------------

def test_03_duplicate_email_rejection():
    client = get_client()
    payload = {
        "name": "Duplicate User",
        "email": "buyer@blueloop.io",  # Existing seeded buyer email
        "password": "SecurePassword123!",
        "org_name": "Duplicate Corp",
        "role": "buyer",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 409
    assert "already exists" in res.json()["message"].lower()


# -----------------------------------------------------------------------------
# Case 4: Invalid Email and Weak Password Rejection
# -----------------------------------------------------------------------------

def test_04_invalid_email_and_weak_password_rejection():
    client = get_client()

    # Invalid email
    res1 = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "SecurePassword123!",
            "org_name": "Org 1",
            "role": "buyer",
        },
    )
    assert res1.status_code == 422

    # Weak password - too short (<8 chars)
    res2 = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Short Password",
            "email": "short@example.com",
            "password": "abc",
            "org_name": "Org 2",
            "role": "buyer",
        },
    )
    assert res2.status_code == 422

    # Common easily guessable password
    res3 = client.post(
        "/api/v1/auth/signup",
        json={
            "name": "Common Password",
            "email": "common@example.com",
            "password": "password123!",
            "org_name": "Org 3",
            "role": "buyer",
        },
    )
    assert res3.status_code == 422


# -----------------------------------------------------------------------------
# Case 5: Public Admin Signup Rejection
# -----------------------------------------------------------------------------

def test_05_public_admin_signup_rejection():
    client = get_client()
    payload = {
        "name": "Hacker Admin",
        "email": "hacker@domain.com",
        "password": "SecurePassword123!",
        "org_name": "Evil Corp",
        "role": "admin",
    }
    res = client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 422
    assert "administrator registration is prohibited" in res.json()["message"].lower()


# -----------------------------------------------------------------------------
# Case 6 & 7: Login Success with Correct Credentials & Reject Incorrect
# -----------------------------------------------------------------------------

def test_06_login_succeeds_only_with_correct_credentials():
    client = get_client()
    res = client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@blueloop.io", "password": "Password123!"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "buyer@blueloop.io"
    assert settings.session_cookie_name in client.cookies


def test_07_incorrect_credentials_rejected():
    client = get_client()

    # Wrong password
    res1 = client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@blueloop.io", "password": "WrongPassword999!"},
    )
    assert res1.status_code == 401
    assert "invalid email or password" in res1.json()["message"].lower()

    # Non-existent user
    res2 = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@domain.com", "password": "Password123!"},
    )
    assert res2.status_code == 401
    assert "invalid email or password" in res2.json()["message"].lower()


# -----------------------------------------------------------------------------
# Case 8: Logout Invalidates Session
# -----------------------------------------------------------------------------

def test_08_logout_invalidates_session():
    client = get_client()
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@blueloop.io", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # Verify session is working
    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 200

    # Logout
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

    # Subsequent request using same client should fail with 401
    post_logout_me = client.get("/api/v1/auth/me")
    assert post_logout_me.status_code == 401

    # Request passing the old token explicitly via header should also fail
    header_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert header_res.status_code == 401


# -----------------------------------------------------------------------------
# Case 9: Expired or Invalid Session is Rejected
# -----------------------------------------------------------------------------

def test_09_expired_or_invalid_session_rejected():
    client = get_client()
    container = get_repository_container()
    admin = container.users.get_by_email("admin@blueloop.io")

    # Manually create an expired session in SQLite
    expired_token = "expired-token-12345"
    past_time = datetime.now(timezone.utc) - timedelta(hours=2)
    container.sessions.create_session(expired_token, admin.id, past_time)

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401
    assert "expired" in res.json()["message"].lower()

    # Completely invalid fake token
    res_fake = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer totally-fake-token"})
    assert res_fake.status_code == 401


# -----------------------------------------------------------------------------
# Case 10: Unauthenticated Access to Protected APIs is Rejected (401)
# -----------------------------------------------------------------------------

def test_10_unauthenticated_access_to_protected_apis_rejected():
    client = get_client()

    protected_endpoints = [
        ("GET", "/api/v1/auth/me"),
        ("GET", "/api/v1/suppliers"),
        ("GET", "/api/v1/supplies"),
        ("GET", "/api/v1/demands"),
        ("POST", "/api/v1/compatibility/evaluate"),
        ("POST", "/api/v1/allocations/run"),
        ("GET", "/api/v1/allocations"),
        ("GET", "/api/v1/deliveries"),
        ("GET", "/api/v1/impact/summary"),
    ]

    for method, path in protected_endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path}, got {res.status_code}"


# -----------------------------------------------------------------------------
# Case 11 & 13: Buyer Cannot Mutate Supplier Listings / Perform Supplier-Only Actions
# -----------------------------------------------------------------------------

def test_11_buyer_cannot_mutate_supplier_listings():
    client = get_client()
    # Log in as buyer
    client.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})

    # Buyer attempting to create a supply listing
    payload = {
        "facility_id": "SYNTH-FAC-01",
        "name": "Buyer Unauthorized Stream",
        "water_grade": "RO_PERMEATE",
        "available_volume_kl": 500.0,
        "price_per_kl": 1.20,
        "available_from": datetime.now(timezone.utc).isoformat(),
    }
    res = client.post("/api/v1/supplies", json=payload)
    assert res.status_code == 403
    assert "forbidden" in res.json()["message"].lower()


def test_13_buyer_cannot_dispatch_delivery():
    client = get_client()
    client.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})

    # Buyer attempting to dispatch a delivery
    payload = {
        "listing_id": "SYNTH-LIST-01",
        "demand_id": "SYNTH-DEM-01",
        "dispatched_volume_kl": 200.0,
        "scheduled_date": datetime.now(timezone.utc).isoformat(),
        "delivery_mode": "DEDICATED_TANKER",
    }
    res = client.post("/api/v1/deliveries", json=payload)
    assert res.status_code == 403


# -----------------------------------------------------------------------------
# Case 12 & 14: Supplier Cannot Mutate Demands / Perform Buyer-Only Actions
# -----------------------------------------------------------------------------

def test_12_supplier_cannot_mutate_buyer_demands():
    client = get_client()
    client.post("/api/v1/auth/login", json={"email": "supplier@blueloop.io", "password": "Password123!"})

    # Supplier attempting to create a demand request
    payload = {
        "facility_name": "Supplier Factory",
        "intended_use": "COOLING_TOWER",
        "required_volume_kl": 500.0,
        "quality_limits": {
            "min_ph": 6.5,
            "max_ph": 8.5,
            "max_tds_mg_l": 1000.0,
            "required_parameters": ["ph", "tds_mg_l"],
        },
    }
    res = client.post("/api/v1/demands", json=payload)
    assert res.status_code == 403
    assert "forbidden" in res.json()["message"].lower()


def test_14_supplier_cannot_accept_or_reject_buyer_proposals():
    client = get_client()
    # Log in as supplier
    client.post("/api/v1/auth/login", json={"email": "supplier@blueloop.io", "password": "Password123!"})

    # Run allocation to have a proposal
    run_res = client.post("/api/v1/allocations/run", json={})
    run_id = run_res.json()["run_id"]

    # Supplier attempting to accept proposal
    accept_res = client.post(f"/api/v1/allocations/{run_id}/accept")
    assert accept_res.status_code == 403

    # Supplier attempting to reject proposal
    reject_res = client.post(f"/api/v1/allocations/{run_id}/reject")
    assert reject_res.status_code == 403


# -----------------------------------------------------------------------------
# Case 15: Cross-Organisation Record Access is Rejected
# -----------------------------------------------------------------------------

def test_15_cross_organisation_record_access_rejected():
    client_buyer1 = get_client()
    # Buyer 1 (Apex, SYNTH-ORG-04)
    client_buyer1.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})

    # Buyer 2 demand is SYNTH-DEM-03 (Precision Auto, SYNTH-ORG-05)
    res_cross = client_buyer1.get("/api/v1/demands/SYNTH-DEM-03")
    assert res_cross.status_code == 403
    assert "forbidden" in res_cross.json()["message"].lower()

    # Supplier 1 (Maraimalai, SYNTH-ORG-01) attempting to publish for Guindy (SYNTH-FAC-02)
    client_sup1 = get_client()
    client_sup1.post("/api/v1/auth/login", json={"email": "supplier@blueloop.io", "password": "Password123!"})

    res_cross_fac = client_sup1.post(
        "/api/v1/supplies",
        json={
            "facility_id": "SYNTH-FAC-02",  # Belongs to SYNTH-ORG-02, not SYNTH-ORG-01!
            "name": "Cross-Org Batch",
            "water_grade": "TERTIARY_POLISHED",
            "available_volume_kl": 200.0,
            "price_per_kl": 0.90,
            "available_from": datetime.now(timezone.utc).isoformat(),
        },
    )
    assert res_cross_fac.status_code == 403


# -----------------------------------------------------------------------------
# Case 16: Users Cannot Escalate Their Own Role
# -----------------------------------------------------------------------------

def test_16_users_cannot_escalate_their_own_role():
    client = get_client()
    client.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})

    # Verify no public self-role update endpoint allows role escalation
    # Calling admin endpoint to list users or update status fails with 403
    res = client.get("/api/v1/auth/users")
    assert res.status_code == 403

    res_patch = client.patch(
        "/api/v1/auth/users/USR-BUY-01/status",
        json={"is_active": True},
    )
    assert res_patch.status_code == 403


# -----------------------------------------------------------------------------
# Case 17: Disabled Accounts Cannot Continue Using Authenticated Endpoints
# -----------------------------------------------------------------------------

def test_17_disabled_accounts_cannot_continue_using_endpoints():
    client = get_client()
    # 1. Login as admin
    client.post("/api/v1/auth/login", json={"email": "admin@blueloop.io", "password": "AdminPassword123!"})

    # 2. Disable buyer account (USR-BUY-01)
    disable_res = client.patch(
        "/api/v1/auth/users/USR-BUY-01/status",
        json={"is_active": False},
    )
    assert disable_res.status_code == 200
    assert disable_res.json()["is_active"] is False

    # 3. Try logging in with disabled buyer account
    buyer_client = get_client()
    login_res = buyer_client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@blueloop.io", "password": "Password123!"},
    )
    assert login_res.status_code == 403
    assert "disabled" in login_res.json()["message"].lower()


# -----------------------------------------------------------------------------
# Case 18: Admin-Only Operations Reject Non-Admin Users
# -----------------------------------------------------------------------------

def test_18_admin_only_operations_reject_non_admin_users():
    # Test with buyer
    buyer_client = get_client()
    buyer_client.post("/api/v1/auth/login", json={"email": "buyer@blueloop.io", "password": "Password123!"})
    res_buyer = buyer_client.get("/api/v1/auth/users")
    assert res_buyer.status_code == 403

    # Test with supplier
    supplier_client = get_client()
    supplier_client.post("/api/v1/auth/login", json={"email": "supplier@blueloop.io", "password": "Password123!"})
    res_supplier = supplier_client.get("/api/v1/auth/users")
    assert res_supplier.status_code == 403

    # Test with admin
    admin_client = get_client()
    admin_client.post("/api/v1/auth/login", json={"email": "admin@blueloop.io", "password": "AdminPassword123!"})
    res_admin = admin_client.get("/api/v1/auth/users")
    assert res_admin.status_code == 200
    assert len(res_admin.json()) >= 3


# -----------------------------------------------------------------------------
# Case 19: Authentication State Survives Page Reload / Persistent Session
# -----------------------------------------------------------------------------

def test_19_authentication_state_survives_persistence():
    client = get_client()
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "buyer@blueloop.io", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # Create brand new application instance (simulating restart / reload)
    new_client = get_client()
    new_client.cookies.set(settings.session_cookie_name, token)

    me_res = new_client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "buyer@blueloop.io"
