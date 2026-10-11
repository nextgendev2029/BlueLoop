"""
BlueLoop Synthetic Demonstration Data Seeds
Deterministic fixture dataset for local development and automated testing.
Explicitly tagged as synthetic data; fictional facility and organisation names.
"""

from datetime import datetime, timezone, timedelta
from app.core.security import hash_password
from app.models.entities import (
    DemandRequest,
    DeliveryRecord,
    Organisation,
    QualityEvidence,
    QualityLimits,
    SupplierFacility,
    SupplyListing,
    User,
    WaterQualityMeasurements,
)
from app.models.enums import (
    DemandStatus,
    DeliveryLifecycleStatus,
    DeliveryMode,
    EvidenceType,
    FacilityType,
    IntendedUse,
    ListingStatus,
    OrgType,
    VerificationStatus,
    WaterGrade,
)
from app.repositories.memory import RepositoryContainer, get_repository_container


def get_demo_organisations() -> list[Organisation]:
    now = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    return [
        Organisation(
            id="SYNTH-ORG-00",
            name="BlueLoop Platform Operations",
            org_type=OrgType.PLATFORM_OPERATOR,
            verification_status=VerificationStatus.CERTIFIED,
            contact_email="admin@blueloop.io",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-01",
            name="Maraimalai Clean Tech Industrial Park",
            org_type=OrgType.SUPPLIER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="ops@maraimalai-cleantech.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-02",
            name="Guindy Municipal Water Recovery Authority",
            org_type=OrgType.SUPPLIER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="dispatch@guindy-water.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-03",
            name="Ambattur Common Effluent Reclamation Co",
            org_type=OrgType.SUPPLIER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="reclamation@ambattur-cetp.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-04",
            name="Apex Hyperscale Data Center Campus",
            org_type=OrgType.BUYER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="facilities@apex-dc.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-05",
            name="Precision Automotive Engine Works",
            org_type=OrgType.BUYER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="sustainability@precision-auto.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
        Organisation(
            id="SYNTH-ORG-06",
            name="Metro Rail Precast Infrastructure Yard",
            org_type=OrgType.BUYER,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="procurement@metrorail-precast.demo.local",
            is_synthetic=True,
            created_at=now,
        ),
    ]


def get_demo_facilities() -> list[SupplierFacility]:
    now = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    return [
        SupplierFacility(
            id="SYNTH-FAC-01",
            org_id="SYNTH-ORG-01",
            name="Maraimalai CETP Sector A",
            facility_type=FacilityType.CETP,
            city="Maraimalai Nagar",
            state="Tamil Nadu",
            latitude=12.7932,
            longitude=80.0245,
            coordinates_synthetic=True,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="cetp-ops@maraimalai-cleantech.demo.local",
            contact_phone="+91-44-2745-0001",
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        SupplierFacility(
            id="SYNTH-FAC-02",
            org_id="SYNTH-ORG-02",
            name="Guindy Tertiary STP",
            facility_type=FacilityType.MUNICIPAL_TERTIARY,
            city="Chennai",
            state="Tamil Nadu",
            latitude=13.0067,
            longitude=80.2052,
            coordinates_synthetic=True,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="stp@guindy-water.demo.local",
            contact_phone="+91-44-2235-0002",
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        SupplierFacility(
            id="SYNTH-FAC-03",
            org_id="SYNTH-ORG-03",
            name="Ambattur Effluent Polishing Facility",
            facility_type=FacilityType.INDUSTRIAL_STP,
            city="Ambattur",
            state="Tamil Nadu",
            latitude=13.1143,
            longitude=80.1548,
            coordinates_synthetic=True,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            contact_email="quality@ambattur-cetp.demo.local",
            contact_phone="+91-44-2625-0003",
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
    ]


def get_demo_quality_evidences() -> list[QualityEvidence]:
    measured_time = datetime(2026, 1, 10, 10, 30, 0, tzinfo=timezone.utc)
    return [
        QualityEvidence(
            id="SYNTH-EVID-01",
            facility_id="SYNTH-FAC-01",
            listing_id="SYNTH-LIST-01",
            measured_at=measured_time,
            evidence_type=EvidenceType.CERTIFIED_LAB_REPORT,
            verification_status=VerificationStatus.CERTIFIED,
            lab_name="NABL Certified Environmental Testing Labs (Chennai)",
            lab_accreditation="ISO/IEC 17025:2017 #TC-8012",
            measurements=WaterQualityMeasurements(
                ph=7.35,
                tds_mg_l=980.0,
                cod_mg_l=38.0,
                bod_mg_l=8.5,
                tss_mg_l=6.0,
                turbidity_ntu=1.4,
                heavy_metals_pass=True,
            ),
            source_notes="Sample collected from tertiary filter effluent holding tank #2.",
            is_synthetic=True,
            created_at=measured_time,
        ),
        QualityEvidence(
            id="SYNTH-EVID-02",
            facility_id="SYNTH-FAC-02",
            listing_id="SYNTH-LIST-02",
            measured_at=measured_time,
            evidence_type=EvidenceType.CERTIFIED_LAB_REPORT,
            verification_status=VerificationStatus.CERTIFIED,
            lab_name="State Water Analytics Center (Guindy)",
            lab_accreditation="NABL Accredited Lab #TC-5491",
            measurements=WaterQualityMeasurements(
                ph=6.90,
                tds_mg_l=280.0,
                cod_mg_l=12.0,
                bod_mg_l=3.0,
                tss_mg_l=1.0,
                turbidity_ntu=0.4,
                heavy_metals_pass=True,
            ),
            source_notes="Post-RO membrane permeate stream. High purity.",
            is_synthetic=True,
            created_at=measured_time,
        ),
        QualityEvidence(
            id="SYNTH-EVID-03",
            facility_id="SYNTH-FAC-03",
            listing_id="SYNTH-LIST-03",
            measured_at=measured_time,
            evidence_type=EvidenceType.SELF_REPORTED,
            verification_status=VerificationStatus.PENDING_REVIEW,
            lab_name="Ambattur In-house WWTP Testing Unit",
            lab_accreditation="Internal Quality Telemetry",
            measurements=WaterQualityMeasurements(
                ph=7.80,
                tds_mg_l=2200.0,
                cod_mg_l=110.0,
                bod_mg_l=28.0,
                tss_mg_l=22.0,
                turbidity_ntu=6.5,
                heavy_metals_pass=True,
            ),
            source_notes="Secondary clarifier overflow. Elevated TDS and COD.",
            is_synthetic=True,
            created_at=measured_time,
        ),
    ]


def get_demo_listings() -> list[SupplyListing]:
    now = datetime(2026, 1, 10, 0, 0, 0, tzinfo=timezone.utc)
    until = now + timedelta(days=90)
    return [
        SupplyListing(
            id="SYNTH-LIST-01",
            facility_id="SYNTH-FAC-01",
            name="Maraimalai Tertiary Polished Stream 01",
            water_grade=WaterGrade.TERTIARY_POLISHED,
            available_volume_kl=3500.0,
            price_per_kl=0.78,
            available_from=now,
            available_until=until,
            delivery_radius_km=25.0,
            quality_evidence_status=VerificationStatus.CERTIFIED,
            quality_evidence_id="SYNTH-EVID-01",
            measurements=WaterQualityMeasurements(
                ph=7.35,
                tds_mg_l=980.0,
                cod_mg_l=38.0,
                bod_mg_l=8.5,
                tss_mg_l=6.0,
                turbidity_ntu=1.4,
                heavy_metals_pass=True,
            ),
            status=ListingStatus.ACTIVE,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        SupplyListing(
            id="SYNTH-LIST-02",
            facility_id="SYNTH-FAC-02",
            name="Guindy RO Permeate Ultrapure Batch A",
            water_grade=WaterGrade.RO_PERMEATE,
            available_volume_kl=4200.0,
            price_per_kl=1.15,
            available_from=now,
            available_until=until,
            delivery_radius_km=30.0,
            quality_evidence_status=VerificationStatus.CERTIFIED,
            quality_evidence_id="SYNTH-EVID-02",
            measurements=WaterQualityMeasurements(
                ph=6.90,
                tds_mg_l=280.0,
                cod_mg_l=12.0,
                bod_mg_l=3.0,
                tss_mg_l=1.0,
                turbidity_ntu=0.4,
                heavy_metals_pass=True,
            ),
            status=ListingStatus.ACTIVE,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        SupplyListing(
            id="SYNTH-LIST-03",
            facility_id="SYNTH-FAC-03",
            name="Ambattur Secondary Clarified Stream B",
            water_grade=WaterGrade.SECONDARY_CLARIFIED,
            available_volume_kl=1800.0,
            price_per_kl=0.55,
            available_from=now,
            available_until=until,
            delivery_radius_km=20.0,
            quality_evidence_status=VerificationStatus.PENDING_REVIEW,
            quality_evidence_id="SYNTH-EVID-03",
            measurements=WaterQualityMeasurements(
                ph=7.80,
                tds_mg_l=2200.0,
                cod_mg_l=110.0,
                bod_mg_l=28.0,
                tss_mg_l=22.0,
                turbidity_ntu=6.5,
                heavy_metals_pass=True,
            ),
            status=ListingStatus.ACTIVE,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        SupplyListing(
            id="SYNTH-LIST-04",
            facility_id="SYNTH-FAC-01",
            name="Maraimalai Seasonal Overflow Batch C (Uncharacterised)",
            water_grade=WaterGrade.INDUSTRIAL_RECYCLED,
            available_volume_kl=1200.0,
            price_per_kl=0.40,
            available_from=now,
            available_until=until,
            delivery_radius_km=15.0,
            quality_evidence_status=VerificationStatus.UNVERIFIED,
            quality_evidence_id=None,
            measurements=None,  # Missing quality evidence case
            status=ListingStatus.ACTIVE,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
    ]


def get_demo_demands() -> list[DemandRequest]:
    now = datetime(2026, 1, 10, 0, 0, 0, tzinfo=timezone.utc)
    delivery_date = now + timedelta(days=14)
    return [
        DemandRequest(
            id="SYNTH-DEM-01",
            org_id="SYNTH-ORG-04",
            facility_name="Apex Hyperscale Data Center - Evaporative Cooling Loops",
            intended_use=IntendedUse.COOLING_TOWER,
            required_volume_kl=3000.0,
            max_price_per_kl=1.25,
            total_budget=3750.0,
            required_delivery_date=delivery_date,
            max_distance_km=35.0,
            latitude=12.9815,
            longitude=80.2180,
            quality_limits=QualityLimits(
                min_ph=6.5,
                max_ph=8.5,
                max_tds_mg_l=1200.0,
                max_cod_mg_l=45.0,
                max_bod_mg_l=10.0,
                max_tss_mg_l=10.0,
                max_turbidity_ntu=2.0,
                require_heavy_metals_pass=True,
                required_parameters=["ph", "tds_mg_l", "cod_mg_l", "bod_mg_l", "tss_mg_l", "turbidity_ntu"],
            ),
            status=DemandStatus.OPEN,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        DemandRequest(
            id="SYNTH-DEM-02",
            org_id="SYNTH-ORG-06",
            facility_name="Metro Rail Precast Yard - Concrete Curing & Batching",
            intended_use=IntendedUse.CONSTRUCTION_BATCHING,
            required_volume_kl=1500.0,
            max_price_per_kl=0.80,
            total_budget=1200.0,
            required_delivery_date=delivery_date,
            max_distance_km=25.0,
            latitude=13.0827,
            longitude=80.1800,
            quality_limits=QualityLimits(
                min_ph=6.0,
                max_ph=9.0,
                max_tds_mg_l=2500.0,
                max_cod_mg_l=150.0,
                max_tss_mg_l=30.0,
                max_turbidity_ntu=10.0,
                require_heavy_metals_pass=False,
                required_parameters=["ph", "tds_mg_l", "tss_mg_l"],
            ),
            status=DemandStatus.OPEN,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
        DemandRequest(
            id="SYNTH-DEM-03",
            org_id="SYNTH-ORG-05",
            facility_name="Precision Automotive Engine Plant - High-Pressure Boiler Feed",
            intended_use=IntendedUse.BOILER_FEED,
            required_volume_kl=2000.0,
            max_price_per_kl=1.50,
            total_budget=3000.0,
            required_delivery_date=delivery_date,
            max_distance_km=30.0,
            latitude=12.9249,
            longitude=80.1000,
            quality_limits=QualityLimits(
                min_ph=6.8,
                max_ph=7.5,
                max_tds_mg_l=350.0,
                max_cod_mg_l=20.0,
                max_bod_mg_l=5.0,
                max_tss_mg_l=2.0,
                max_turbidity_ntu=1.0,
                require_heavy_metals_pass=True,
                required_parameters=["ph", "tds_mg_l", "cod_mg_l", "bod_mg_l", "tss_mg_l", "turbidity_ntu"],
            ),
            status=DemandStatus.OPEN,
            is_synthetic=True,
            created_at=now,
            updated_at=now,
        ),
    ]


# Pre-computed OWASP PBKDF2 hashes for instant seed execution without CPU overhead
DEMO_PASSWORD_HASH = "pbkdf2_sha256$600000$be92e0cc1929677b583008e83b3e91b5$f274c87e67612c2c04af5365964ad6803f519fef58b57471a10278002fdc9082"
ADMIN_PASSWORD_HASH = "pbkdf2_sha256$600000$7c2de5f6173d2d36abe79d71080a9b64$b992e7a80ad34d12c8eec98d61c29361a0246d664feeedd9f86459b53c3ebf13"


def get_demo_users() -> list[User]:
    now = datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    return [
        User(
            id="USR-ADMIN-01",
            org_id="SYNTH-ORG-00",
            name="System Administrator",
            email="admin@blueloop.io",
            role="admin",
            password_hash=ADMIN_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-SUP-01",
            org_id="SYNTH-ORG-01",
            name="Maraimalai Plant Director",
            email="supplier@blueloop.io",
            role="supplier",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-SUP-02",
            org_id="SYNTH-ORG-02",
            name="Guindy Operations Lead",
            email="guindy.supplier@blueloop.io",
            role="supplier",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-SUP-03",
            org_id="SYNTH-ORG-03",
            name="Ambattur Reclamation Supervisor",
            email="ambattur.supplier@blueloop.io",
            role="supplier",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-BUY-01",
            org_id="SYNTH-ORG-04",
            name="Apex Data Center Facilities Lead",
            email="buyer@blueloop.io",
            role="buyer",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-BUY-02",
            org_id="SYNTH-ORG-05",
            name="Precision Auto Sustainability Engineer",
            email="precision.buyer@blueloop.io",
            role="buyer",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
        User(
            id="USR-BUY-03",
            org_id="SYNTH-ORG-06",
            name="Metro Rail Batching Manager",
            email="metrorail.buyer@blueloop.io",
            role="buyer",
            password_hash=DEMO_PASSWORD_HASH,
            is_active=True,
            created_at=now,
        ),
    ]


def get_demo_deliveries() -> list[DeliveryRecord]:
    now = datetime(2026, 3, 1, 0, 0, 0, tzinfo=timezone.utc)
    return [
        DeliveryRecord(
            id="SYNTH-DEL-01",
            allocation_candidate_id=None,
            listing_id="SYNTH-LIST-01",
            demand_id="SYNTH-DEM-01",
            dispatched_volume_kl=450.0,
            delivered_volume_kl=None,
            scheduled_date=now - timedelta(hours=6),
            delivery_mode=DeliveryMode.DEDICATED_TANKER,
            lifecycle_status=DeliveryLifecycleStatus.IN_TRANSIT,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            is_synthetic=True,
            created_at=now - timedelta(hours=8),
            updated_at=now - timedelta(hours=2),
        ),
        DeliveryRecord(
            id="SYNTH-DEL-02",
            allocation_candidate_id=None,
            listing_id="SYNTH-LIST-02",
            demand_id="SYNTH-DEM-03",
            dispatched_volume_kl=600.0,
            delivered_volume_kl=None,
            scheduled_date=now - timedelta(days=2),
            delivery_mode=DeliveryMode.DEDICATED_TANKER,
            lifecycle_status=DeliveryLifecycleStatus.DELIVERED_SAMPLE_PENDING,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            is_synthetic=True,
            created_at=now - timedelta(days=2, hours=4),
            updated_at=now - timedelta(days=1),
        ),
        DeliveryRecord(
            id="SYNTH-DEL-03",
            allocation_candidate_id=None,
            listing_id="SYNTH-LIST-03",
            demand_id="SYNTH-DEM-02",
            dispatched_volume_kl=350.0,
            delivered_volume_kl=None,
            scheduled_date=now + timedelta(hours=12),
            delivery_mode=DeliveryMode.PIPELINE,
            lifecycle_status=DeliveryLifecycleStatus.DISPATCHED,
            verification_status=VerificationStatus.VERIFIED_DEMO,
            is_synthetic=True,
            created_at=now - timedelta(hours=1),
            updated_at=now,
        ),
    ]


def seed_demonstration_data(
    container: RepositoryContainer | None = None,
    force_reset: bool = True,
) -> RepositoryContainer:
    """Populates repository container with the deterministic synthetic sample dataset."""
    target_container = container or get_repository_container()

    if force_reset:
        target_container.reset_all(clear_sessions=True)

    for org in get_demo_organisations():
        if force_reset or not target_container.organisations.get(org.id):
            target_container.organisations.create(org)

    for user in get_demo_users():
        if force_reset or not target_container.users.get(user.id):
            target_container.users.create(user)

    if hasattr(target_container, "sessions") and target_container.sessions:
        if force_reset or not target_container.sessions.get_session("blueloop-test-admin-token"):
            target_container.sessions.create_session(
                "blueloop-test-admin-token",
                "USR-ADMIN-01",
                datetime.now(timezone.utc) + timedelta(days=7),
            )

    for fac in get_demo_facilities():
        if force_reset or not target_container.facilities.get(fac.id):
            target_container.facilities.create(fac)

    for evid in get_demo_quality_evidences():
        if force_reset or not target_container.evidences.get(evid.id):
            target_container.evidences.create(evid)

    for listing in get_demo_listings():
        if force_reset or not target_container.listings.get(listing.id):
            target_container.listings.create(listing)

    for demand in get_demo_demands():
        if force_reset or not target_container.demands.get(demand.id):
            target_container.demands.create(demand)

    for deliv in get_demo_deliveries():
        if force_reset or not target_container.deliveries.get(deliv.id):
            target_container.deliveries.create(deliv)

    return target_container
