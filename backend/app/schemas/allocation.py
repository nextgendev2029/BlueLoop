"""
BlueLoop Allocation Optimization Schemas
Typed input and output models for allocation runs, proposals, and audit traces.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import ParameterEvaluationResult
from app.models.enums import EligibilityStatus, WaterGrade


class CostEstimate(BaseModel):
    """
    Detailed cost breakdown for an allocated water transfer.
    Explicitly distinguishes verified supplier subtotal from unknown or estimated transport costs.
    """

    allocated_volume_kl: float = Field(..., gt=0.0, description="Allocated water volume in kilolitres")
    unit_supplier_price_per_kl: float = Field(..., ge=0.0, description="Ex-works price per kilolitre")
    supplier_subtotal: float = Field(..., ge=0.0, description="Subtotal for water volume (volume * unit_price)")

    distance_km: Optional[float] = Field(None, ge=0.0, description="One-way road/pipeline distance in km")
    transport_rate_per_kl_km: Optional[float] = Field(
        None, ge=0.0, description="Freight tariff per kL per km ($/kL/km or ₹/kL/km)"
    )

    is_transport_cost_known: bool = Field(
        ..., description="True only when both distance and transport rate are known"
    )
    transport_subtotal: Optional[float] = Field(
        None, description="Logistics subtotal if known (volume * distance * rate)"
    )
    unit_transport_cost_per_kl: Optional[float] = Field(
        None, description="Transport cost per kilolitre if known"
    )

    total_delivered_cost: Optional[float] = Field(
        None, description="Complete delivered cost (supplier_subtotal + transport_subtotal) if known"
    )
    delivered_cost_per_kl: Optional[float] = Field(
        None, description="Delivered cost per kilolitre if known"
    )

    cost_components: List[str] = Field(
        default_factory=list, description="Explanation of cost items included"
    )
    assumptions: List[str] = Field(
        default_factory=list, description="Explicit accounting assumptions"
    )

    model_config = ConfigDict(from_attributes=True)


class ImpactEstimate(BaseModel):
    """
    Environmental impact accounting model.
    Clearly marks whether displacement is proposed potential or delivery-confirmed.
    """

    allocated_volume_kl: float = Field(..., gt=0.0, description="Allocated reused volume in kilolitres")
    substitution_ratio: float = Field(
        ..., ge=0.0, le=1.0, description="Assumed displacement ratio of virgin freshwater per kL of reused water"
    )
    potential_freshwater_displacement_kl: float = Field(
        ..., ge=0.0, description="Calculated displacement: allocated_volume_kl * substitution_ratio"
    )
    impact_lifecycle_stage: str = Field(
        default="POTENTIAL_PROPOSED",
        description="One of: POTENTIAL_PROPOSED, ESTIMATED_ACCEPTED, DELIVERY_CONFIRMED, INDEPENDENTLY_VERIFIED",
    )
    assumptions: List[str] = Field(
        default_factory=list, description="Explicit accounting disclosures"
    )

    model_config = ConfigDict(from_attributes=True)


class ProposedAllocationItem(BaseModel):
    """An individual proposed allocation of water from a supplier to a buyer."""

    candidate_id: str
    listing_id: str
    facility_id: str
    demand_id: str
    water_grade: WaterGrade
    allocated_volume_kl: float = Field(..., gt=0.0)

    cost_estimate: CostEstimate
    impact_estimate: ImpactEstimate

    decision_reasons: List[str]
    reason_codes: List[str]

    model_config = ConfigDict(from_attributes=True)


class RejectedCandidateItem(BaseModel):
    """An evaluated pairing that was excluded from allocation."""

    candidate_id: str
    listing_id: str
    demand_id: str
    eligibility_status: EligibilityStatus
    reason_codes: List[str]
    human_reasons: List[str]
    failed_quality_parameters: List[str] = Field(default_factory=list)
    unknown_quality_parameters: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class DemandFulfillmentStatus(BaseModel):
    """Fulfillment accounting for an individual buyer demand."""

    demand_id: str
    facility_name: str
    required_volume_kl: float
    allocated_volume_kl: float
    unfulfilled_volume_kl: float
    fulfillment_percentage: float


class SupplyUtilizationStatus(BaseModel):
    """Capacity utilization accounting for an individual supply listing."""

    listing_id: str
    listing_name: str
    available_volume_kl: float
    allocated_volume_kl: float
    remaining_volume_kl: float
    utilization_percentage: float


class AllocationRunTotals(BaseModel):
    total_requested_volume_kl: float
    total_available_volume_kl: float
    total_allocated_volume_kl: float
    total_unfulfilled_volume_kl: float
    overall_fulfillment_rate: float

    total_supplier_cost: float
    total_delivered_cost: Optional[float] = None
    is_delivered_cost_fully_known: bool = False

    total_potential_displacement_kl: float


class AllocationRunRequest(BaseModel):
    """Request payload to trigger an allocation optimization run."""

    demand_ids: Optional[List[str]] = Field(
        None, description="Optional list of demand IDs to evaluate. If omitted, all OPEN demands are evaluated."
    )
    listing_ids: Optional[List[str]] = Field(
        None, description="Optional list of listing IDs to evaluate. If omitted, all ACTIVE listings are evaluated."
    )
    substitution_ratio: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Assumed displacement ratio of virgin freshwater [0.0 - 1.0]"
    )
    transport_rate_per_kl_km: Optional[float] = Field(
        default=0.015, ge=0.0, description="Logistics transport rate per kL per km"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "substitution_ratio": 1.0,
                "transport_rate_per_kl_km": 0.015,
            }
        }
    )


class AllocationRunResponse(BaseModel):
    """Structured, reproducible allocation proposal and decision audit trace."""

    run_id: str
    run_timestamp: datetime
    status: str = "PROPOSED"
    algorithm_info: Dict[str, str]

    totals: AllocationRunTotals
    proposed_allocations: List[ProposedAllocationItem]
    rejected_candidates: List[RejectedCandidateItem]

    demand_fulfillment: List[DemandFulfillmentStatus]
    supply_utilization: List[SupplyUtilizationStatus]

    assumptions: List[str]
    disclaimer: str
    is_synthetic: bool = True

    model_config = ConfigDict(from_attributes=True)
