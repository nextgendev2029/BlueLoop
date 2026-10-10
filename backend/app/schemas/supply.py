"""
BlueLoop Supply Listing API Schemas
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.entities import WaterQualityMeasurements
from app.models.enums import ListingStatus, VerificationStatus, WaterGrade


class SupplyListingResponse(BaseModel):
    id: str
    facility_id: str
    facility_name: Optional[str] = None
    name: str
    water_grade: WaterGrade
    available_volume_kl: float
    price_per_kl: float
    available_from: datetime
    available_until: Optional[datetime] = None
    delivery_radius_km: Optional[float] = None
    quality_evidence_status: VerificationStatus
    measurements: Optional[WaterQualityMeasurements] = None
    status: ListingStatus
    is_synthetic: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplyListResponse(BaseModel):
    items: List[SupplyListingResponse]
    total: int
    is_synthetic: bool = Field(
        default=True,
        description="True indicates response contains synthetic demonstration fixtures.",
    )
