"""
BlueLoop Delivery Logistics & Custody Transfer Schemas
Typed contracts for physical delivery records and chain-of-custody lifecycle transitions.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DeliveryLifecycleStatus, DeliveryMode, VerificationStatus


class DeliveryCreateRequest(BaseModel):
    """Payload to schedule a new physical water dispatch."""

    listing_id: str = Field(..., description="Origin supply listing ID (e.g. SYNTH-LIST-01)")
    demand_id: str = Field(..., description="Destination buyer demand ID (e.g. SYNTH-DEM-01)")
    dispatched_volume_kl: float = Field(
        ..., gt=0.0, description="Volume loaded for dispatch in kilolitres (kL)"
    )
    scheduled_date: datetime = Field(..., description="Scheduled delivery timestamp (ISO 8601 UTC)")
    delivery_mode: DeliveryMode = Field(
        ..., description="Logistics conveyance type: PIPELINE or DEDICATED_TANKER"
    )
    allocation_candidate_id: Optional[str] = Field(
        None, description="Optional link to proposed allocation candidate"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listing_id": "SYNTH-LIST-01",
                "demand_id": "SYNTH-DEM-01",
                "dispatched_volume_kl": 500.0,
                "scheduled_date": "2026-01-20T10:00:00Z",
                "delivery_mode": "DEDICATED_TANKER",
            }
        }
    )


class DeliveryStatusUpdateRequest(BaseModel):
    """Payload to transition delivery lifecycle status."""

    lifecycle_status: DeliveryLifecycleStatus = Field(
        ..., description="Target lifecycle state (DISPATCHED, IN_TRANSIT, DELIVERED_SAMPLE_PENDING, ACCEPTED_CONFIRMED, REJECTED_QUALITY_FAILURE)"
    )
    delivered_volume_kl: Optional[float] = Field(
        None, gt=0.0, description="Actual metered intake volume in kilolitres (kL)"
    )
    notes: Optional[str] = Field(
        None, description="Intake inspection or physical gate notes"
    )


class DeliveryRecordResponse(BaseModel):
    """Auditable physical delivery record."""

    id: str
    allocation_candidate_id: Optional[str] = None
    listing_id: str
    demand_id: str
    dispatched_volume_kl: float
    delivered_volume_kl: Optional[float] = None
    scheduled_date: datetime
    delivery_mode: DeliveryMode
    lifecycle_status: DeliveryLifecycleStatus
    verification_status: VerificationStatus
    is_synthetic: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeliveryListResponse(BaseModel):
    """List of delivery records with pagination metadata."""

    items: List[DeliveryRecordResponse]
    total: int
    limit: Optional[int] = None
    offset: Optional[int] = None
    is_synthetic: bool = Field(
        default=True,
        description="True indicates response contains synthetic demonstration fixtures.",
    )
