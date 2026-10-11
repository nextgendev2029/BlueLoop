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
    limit: Optional[int] = Field(None, description="Maximum number of items requested")
    offset: Optional[int] = Field(None, description="Offset index requested")
    is_synthetic: bool = Field(
        default=True,
        description="True indicates response contains synthetic demonstration fixtures.",
    )


class SupplyListingCreateRequest(BaseModel):
    facility_id: str = Field(..., description="Target supplier facility ID")
    name: str = Field(..., min_length=2, description="Designation of effluent batch")
    water_grade: WaterGrade = Field(..., description="Class of treated effluent")
    available_volume_kl: float = Field(..., gt=0.0, description="Available capacity in kL")
    price_per_kl: float = Field(..., ge=0.0, description="Ex-works price per kL")
    available_from: datetime = Field(..., description="Availability start timestamp")
    available_until: Optional[datetime] = Field(None, description="Availability end timestamp")
    delivery_radius_km: Optional[float] = Field(None, gt=0.0, description="Maximum logistics radius")
    quality_evidence_status: Optional[VerificationStatus] = VerificationStatus.VERIFIED_DEMO
    measurements: Optional[WaterQualityMeasurements] = None
    status: Optional[ListingStatus] = ListingStatus.ACTIVE
