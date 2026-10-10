"""
BlueLoop Core Domain Entities
Validated models with explicit units, strict boundaries, and audit metadata.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.core.errors import InvalidConstraintError
from app.models.enums import (
    ActorType,
    DeliveryLifecycleStatus,
    DeliveryMode,
    DemandStatus,
    EligibilityStatus,
    EvidenceType,
    FacilityType,
    IntendedUse,
    ListingStatus,
    OrgType,
    ParameterStatus,
    VerificationStatus,
    WaterGrade,
)


class BaseDomainModel(BaseModel):
    """Base domain model enabling attribute protection and strict serialization."""

    model_config = ConfigDict(
        use_enum_values=True,
        validate_assignment=True,
        arbitrary_types_allowed=False,
    )


# -----------------------------------------------------------------------------
# A. User and Organisation
# -----------------------------------------------------------------------------


class Organisation(BaseDomainModel):
    """An industrial enterprise, utility, or platform entity."""

    id: str = Field(..., description="Stable organisation identifier (e.g. ORG-SUP-01)")
    name: str = Field(..., min_length=2, description="Legal or operating name of organisation")
    org_type: OrgType = Field(..., description="Role in water reuse market")
    verification_status: VerificationStatus = Field(
        default=VerificationStatus.UNVERIFIED,
        description="Account accreditation or verification level",
    )
    contact_email: Optional[str] = Field(None, description="Primary contact email")
    is_synthetic: bool = Field(
        default=True,
        description="Explicit flag ensuring demonstration records are never confused with real legal entities",
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC registration timestamp",
    )


class User(BaseDomainModel):
    """An authorised operator or administrator within an organisation."""

    id: str = Field(..., description="Stable user identifier (e.g. USR-001)")
    org_id: str = Field(..., description="Organisation to which user belongs")
    name: str = Field(..., min_length=2, description="Display or real name")
    email: str = Field(..., description="User login email")
    role: str = Field(default="OPERATOR", description="Access role identifier")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC creation timestamp",
    )


# -----------------------------------------------------------------------------
# B. Supplier Facility
# -----------------------------------------------------------------------------


class SupplierFacility(BaseDomainModel):
    """Physical treatment plant or discharge facility producing treated effluent."""

    id: str = Field(..., description="Stable facility ID (e.g. FAC-01)")
    org_id: str = Field(..., description="Operating organisation ID")
    name: str = Field(..., min_length=2, description="Plant or facility designation")
    facility_type: FacilityType = Field(..., description="Class of treatment plant")
    city: str = Field(..., description="Municipal jurisdiction")
    state: str = Field(..., description="Province or state")
    latitude: Optional[float] = Field(
        None, ge=-90.0, le=90.0, description="GPS Latitude in decimal degrees"
    )
    longitude: Optional[float] = Field(
        None, ge=-180.0, le=180.0, description="GPS Longitude in decimal degrees"
    )
    coordinates_synthetic: bool = Field(
        default=True, description="True when GPS coordinates are synthetic/fictional"
    )
    verification_status: VerificationStatus = Field(
        default=VerificationStatus.UNVERIFIED,
        description="On-site verification status of treatment operations",
    )
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    is_synthetic: bool = Field(
        default=True,
        description="Explicit demonstration label for hackathon data integrity",
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -----------------------------------------------------------------------------
# E. Water Quality Measurements & Evidence
# -----------------------------------------------------------------------------


class WaterQualityMeasurements(BaseDomainModel):
    """
    Physical and chemical water quality measurements.
    Missing measurements are explicitly None (UNKNOWN), never 0 and never passing.
    """

    ph: Optional[float] = Field(
        None, ge=0.0, le=14.0, description="Hydrogen-ion concentration on standard pH scale (0.0 to 14.0)"
    )
    tds_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Total Dissolved Solids in milligrams per litre (mg/L)"
    )
    cod_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Chemical Oxygen Demand in milligrams per litre (mg/L)"
    )
    bod_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Biochemical Oxygen Demand in milligrams per litre (mg/L)"
    )
    tss_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Total Suspended Solids in milligrams per litre (mg/L)"
    )
    turbidity_ntu: Optional[float] = Field(
        None, ge=0.0, description="Nephelometric Turbidity Units (NTU)"
    )
    heavy_metals_pass: Optional[bool] = Field(
        None, description="Binary certification that toxic heavy metals are below CPCB/EPA thresholds"
    )

    @property
    def standard_units(self) -> Dict[str, str]:
        """Codified physical units for each tested parameter."""
        return {
            "ph": "pH scale",
            "tds_mg_l": "mg/L",
            "cod_mg_l": "mg/L",
            "bod_mg_l": "mg/L",
            "tss_mg_l": "mg/L",
            "turbidity_ntu": "NTU",
            "heavy_metals_pass": "pass/fail",
        }


class QualityEvidence(BaseDomainModel):
    """Laboratory test report or telemetry proof backing water quality measurements."""

    id: str = Field(..., description="Stable quality evidence ID (e.g. EVID-01)")
    facility_id: Optional[str] = Field(None, description="Associated supplier facility")
    listing_id: Optional[str] = Field(None, description="Associated supply listing ID")
    measured_at: datetime = Field(..., description="Timestamp of physical laboratory sampling")
    evidence_type: EvidenceType = Field(..., description="Source provenance of data")
    verification_status: VerificationStatus = Field(
        default=VerificationStatus.UNVERIFIED, description="Accreditation status"
    )
    lab_name: Optional[str] = Field(None, description="Name of certified testing laboratory")
    lab_accreditation: Optional[str] = Field(
        None, description="Accreditation body certificate (e.g. NABL / ISO 17025)"
    )
    measurements: WaterQualityMeasurements = Field(
        ..., description="Chemical and physical parameters measured in this sample"
    )
    source_notes: Optional[str] = None
    is_synthetic: bool = Field(
        default=True,
        description="Explicit demonstration label indicating synthetic test report",
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -----------------------------------------------------------------------------
# C. Supply Listing
# -----------------------------------------------------------------------------


class SupplyListing(BaseDomainModel):
    """Active or scheduled batch of treated effluent available for procurement."""

    id: str = Field(..., description="Stable supply listing ID (e.g. LIST-01)")
    facility_id: str = Field(..., description="Origin supplier facility ID")
    name: str = Field(..., min_length=2, description="Listing title (e.g. Tertiary Polished Stream A)")
    water_grade: WaterGrade = Field(..., description="Categorised reuse grade")
    available_volume_kl: float = Field(
        ..., gt=0.0, description="Available supply volume in kilolitres (kL)"
    )
    price_per_kl: float = Field(
        ..., ge=0.0, description="Ex-works unit procurement price per kilolitre ($/kL or ₹/kL)"
    )
    available_from: datetime = Field(..., description="Earliest availability date/time")
    available_until: Optional[datetime] = Field(
        None, description="Latest availability date/time"
    )
    delivery_radius_km: Optional[float] = Field(
        None, gt=0.0, description="Maximum feasible logistics transport radius in kilometres"
    )
    quality_evidence_status: VerificationStatus = Field(
        default=VerificationStatus.UNVERIFIED,
        description="Audit status of associated laboratory test report",
    )
    quality_evidence_id: Optional[str] = Field(
        None, description="Link to QualityEvidence record"
    )
    measurements: Optional[WaterQualityMeasurements] = Field(
        None, description="Denormalised quality parameters for fast screening"
    )
    status: ListingStatus = Field(default=ListingStatus.ACTIVE)
    is_synthetic: bool = Field(
        default=True,
        description="Explicit flag ensuring synthetic status is visible to buyers",
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("available_volume_kl")
    @classmethod
    def validate_volume(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Available volume must be greater than zero kilolitres.")
        return v

    @field_validator("price_per_kl")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Price per kilolitre cannot be negative.")
        return v


# -----------------------------------------------------------------------------
# D. Buyer Demand Request & Quality Limits
# -----------------------------------------------------------------------------


class QualityLimits(BaseDomainModel):
    """
    Explicit buyer-defined acceptable quality thresholds.
    Never assume default suitability: limits must be explicitly configured.
    """

    min_ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Minimum acceptable pH")
    max_ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Maximum acceptable pH")
    max_tds_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Maximum allowable TDS in mg/L"
    )
    max_cod_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Maximum allowable COD in mg/L"
    )
    max_bod_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Maximum allowable BOD in mg/L"
    )
    max_tss_mg_l: Optional[float] = Field(
        None, ge=0.0, description="Maximum allowable TSS in mg/L"
    )
    max_turbidity_ntu: Optional[float] = Field(
        None, ge=0.0, description="Maximum allowable turbidity in NTU"
    )
    require_heavy_metals_pass: bool = Field(
        default=True, description="Whether passing heavy metals test is strictly mandatory"
    )
    required_parameters: List[str] = Field(
        default_factory=lambda: ["ph", "tds_mg_l", "cod_mg_l", "turbidity_ntu"],
        description="List of parameter field names that cannot be missing/unknown",
    )

    @model_validator(mode="after")
    def validate_ph_range(self) -> "QualityLimits":
        if self.min_ph is not None and self.max_ph is not None:
            if self.min_ph > self.max_ph:
                raise InvalidConstraintError(
                    "ph",
                    f"min_ph ({self.min_ph}) cannot be greater than max_ph ({self.max_ph}).",
                )
        return self


class DemandRequest(BaseDomainModel):
    """Commercial intake demand with explicit volume and tolerance constraints."""

    id: str = Field(..., description="Stable demand ID (e.g. DEMAND-01)")
    org_id: str = Field(..., description="Buyer organisation ID")
    facility_name: str = Field(..., min_length=2, description="Consuming facility name")
    intended_use: IntendedUse = Field(..., description="Application category")
    required_volume_kl: float = Field(
        ..., gt=0.0, description="Total volume requested in kilolitres (kL)"
    )
    max_price_per_kl: Optional[float] = Field(
        None, ge=0.0, description="Maximum acceptable delivered cost per kL"
    )
    total_budget: Optional[float] = Field(
        None, ge=0.0, description="Maximum total procurement budget"
    )
    required_delivery_date: Optional[datetime] = None
    max_distance_km: Optional[float] = Field(
        None, gt=0.0, description="Maximum acceptable transport distance from source"
    )
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    quality_limits: QualityLimits = Field(
        ..., description="Explicit quality tolerance boundaries for this application"
    )
    status: DemandStatus = Field(default=DemandStatus.OPEN)
    is_synthetic: bool = Field(
        default=True,
        description="Demonstration label ensuring synthetic demand requests are clearly tagged",
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator("required_volume_kl")
    @classmethod
    def validate_volume(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Required volume must be greater than zero kilolitres.")
        return v


# -----------------------------------------------------------------------------
# Decision & Compatibility Models
# -----------------------------------------------------------------------------


class ParameterEvaluationResult(BaseDomainModel):
    """Auditable evaluation result for an individual physical/chemical parameter."""

    parameter_name: str
    measured_value: Optional[float] = None
    unit: str
    buyer_min: Optional[float] = None
    buyer_max: Optional[float] = None
    status: ParameterStatus
    reason: str


class CompatibilityDecision(BaseDomainModel):
    """
    Structured outcome of deterministic water quality screening.
    Safety disclaimer included explicitly on every result.
    """

    is_eligible: bool
    decision_summary: str
    parameter_results: List[ParameterEvaluationResult]
    failed_parameters: List[str]
    unknown_parameters: List[str]
    disclaimer: str = Field(
        default=(
            "BlueLoop Screening Tool Notice: This evaluation compares supplied laboratory "
            "measurements against buyer-specified boundaries. It does not certify regulatory "
            "compliance, plant process fitness, or guarantee water safety."
        )
    )
    evaluated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -----------------------------------------------------------------------------
# F. Allocation Run & Allocation Candidate
# -----------------------------------------------------------------------------


class AllocationCandidate(BaseDomainModel):
    """A proposed pairing between an effluent listing and a buyer demand."""

    candidate_id: str
    run_id: str
    listing_id: str
    demand_id: str
    proposed_volume_kl: float = Field(..., gt=0.0)
    unit_price_per_kl: float = Field(..., ge=0.0)
    estimated_transport_cost_per_kl: Optional[float] = None
    estimated_delivered_cost_per_kl: Optional[float] = None
    eligibility_status: EligibilityStatus
    decision_reasons: List[str]
    compatibility_result: Optional[CompatibilityDecision] = None
    estimated_freshwater_displacement_kl: Optional[float] = None
    is_synthetic: bool = True


class AllocationRun(BaseDomainModel):
    """A multi-facility matching solver execution."""

    run_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    input_demand_ids: List[str]
    input_listing_ids: List[str]
    candidates: List[AllocationCandidate]
    status: str = Field(default="PROPOSED")


# -----------------------------------------------------------------------------
# G. Delivery Record and Audit Event
# -----------------------------------------------------------------------------


class DeliveryRecord(BaseDomainModel):
    """Physical delivery execution tracking against an accepted allocation."""

    id: str
    allocation_candidate_id: Optional[str] = None
    listing_id: str
    demand_id: str
    dispatched_volume_kl: float = Field(..., gt=0.0)
    delivered_volume_kl: Optional[float] = None
    scheduled_date: datetime
    delivery_mode: DeliveryMode
    lifecycle_status: DeliveryLifecycleStatus = DeliveryLifecycleStatus.SCHEDULED
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED
    is_synthetic: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditEvent(BaseDomainModel):
    """Immutable audit trail event capturing decision history and state transitions."""

    event_id: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    entity_type: str
    entity_id: str
    actor_type: ActorType
    actor_id: Optional[str] = None
    action: str
    explanation: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
