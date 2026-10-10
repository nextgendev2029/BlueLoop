"""
Automated Unit Tests for In-Memory Repository Layer & Seed Data Consistency
"""

import pytest
from app.core.errors import EntityNotFoundError
from app.core.seeds import seed_demonstration_data
from app.models.entities import Organisation
from app.models.enums import OrgType, VerificationStatus
from app.repositories.memory import InMemoryRepository, RepositoryContainer


def test_repository_crud_operations():
    repo = InMemoryRepository[Organisation](id_field_name="id", entity_name="Organisation")

    org = Organisation(
        id="ORG-TEST-99",
        name="Alpha Effluent",
        org_type=OrgType.SUPPLIER,
        verification_status=VerificationStatus.UNVERIFIED,
    )

    # 1. Create
    created = repo.create(org)
    assert created.id == "ORG-TEST-99"
    assert repo.count() == 1

    # 2. Get
    fetched = repo.get("ORG-TEST-99")
    assert fetched is not None
    assert fetched.name == "Alpha Effluent"

    # 3. List
    all_orgs = repo.list()
    assert len(all_orgs) == 1

    # 4. Update
    updated_org = Organisation(
        id="ORG-TEST-99",
        name="Alpha Effluent Updated",
        org_type=OrgType.SUPPLIER,
        verification_status=VerificationStatus.VERIFIED_DEMO,
    )
    repo.update(updated_org)
    re_fetched = repo.get("ORG-TEST-99")
    assert re_fetched.name == "Alpha Effluent Updated"
    assert re_fetched.verification_status == VerificationStatus.VERIFIED_DEMO

    # 5. Delete
    deleted = repo.delete("ORG-TEST-99")
    assert deleted is True
    assert repo.get("ORG-TEST-99") is None
    assert repo.count() == 0


def test_repository_missing_record_behavior():
    repo = InMemoryRepository[Organisation](id_field_name="id", entity_name="Organisation")

    # Get non-existent
    assert repo.get("NON-EXISTENT") is None

    # Delete non-existent
    assert repo.delete("NON-EXISTENT") is False

    # Update non-existent raises EntityNotFoundError
    dummy_org = Organisation(
        id="NON-EXISTENT",
        name="Ghost Org",
        org_type=OrgType.SUPPLIER,
    )
    with pytest.raises(EntityNotFoundError) as exc_info:
        repo.update(dummy_org)
    assert "not found" in str(exc_info.value)


def test_repository_mutation_isolation():
    """Verify that caller mutations do not leak into stored repository models."""
    repo = InMemoryRepository[Organisation](id_field_name="id", entity_name="Organisation")

    org = Organisation(
        id="ORG-ISO-01",
        name="Immutable Original",
        org_type=OrgType.SUPPLIER,
    )
    repo.create(org)

    # Fetch and mutate local instance
    fetched = repo.get("ORG-ISO-01")
    assert fetched is not None
    fetched.name = "Mutated In Memory"

    # Fresh get from repo should retain original name
    stored = repo.get("ORG-ISO-01")
    assert stored.name == "Immutable Original"


def test_seed_demonstration_data_consistency():
    container = RepositoryContainer()
    seed_demonstration_data(container)

    # 1. Verify counts
    assert container.organisations.count() >= 6
    assert container.facilities.count() >= 3
    assert container.listings.count() >= 4
    assert container.demands.count() >= 3
    assert container.evidences.count() >= 3

    # 2. Verify all entities are marked synthetic
    for org in container.organisations.list():
        assert org.is_synthetic is True

    for fac in container.facilities.list():
        assert fac.is_synthetic is True
        # Verify foreign key to organisation
        assert container.organisations.get(fac.org_id) is not None

    for listing in container.listings.list():
        assert listing.is_synthetic is True
        # Verify foreign key to facility
        assert container.facilities.get(listing.facility_id) is not None
        assert listing.available_volume_kl > 0
        assert listing.price_per_kl >= 0

    for demand in container.demands.list():
        assert demand.is_synthetic is True
        # Verify foreign key to organisation
        assert container.organisations.get(demand.org_id) is not None
        assert demand.required_volume_kl > 0

    # 3. Verify specific test fixtures
    # Missing evidence fixture
    missing_evid_listing = container.listings.get("SYNTH-LIST-04")
    assert missing_evid_listing is not None
    assert missing_evid_listing.measurements is None

    # Ultra-pure RO fixture
    ro_listing = container.listings.get("SYNTH-LIST-02")
    assert ro_listing is not None
    assert ro_listing.measurements.tds_mg_l == 280.0
