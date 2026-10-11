"""
BlueLoop Demand Request API Schemas
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.entities import QualityLimits
from app.models.enums import DemandStatus, IntendedUse


class DemandRequestResponse(BaseModel):
    id: str
    org_id: str
    facility_name: str
    intended_use: IntendedUse
    required_volume_kl: float
    max_price_per_kl: Optional[float] = None
    total_budget: Optional[float] = None
    max_distance_km: Optional[float] = None
    quality_limits: QualityLimits
    status: DemandStatus
    is_synthetic: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DemandListResponse(BaseModel):
    items: List[DemandRequestResponse]
    total: int
    limit: Optional[int] = Field(None, description="Maximum number of items requested")
    offset: Optional[int] = Field(None, description="Offset index requested")
    is_synthetic: bool = Field(
        default=True,
        description="True indicates response contains synthetic demonstration fixtures.",
    )


class DemandRequestCreate(BaseModel):
    facility_name: str = Field(..., min_length=2, description="Consumer plant or application name")
    intended_use: IntendedUse = Field(..., description="Target process use (cooling, boiler, etc.)")
    required_volume_kl: float = Field(..., gt=0.0, description="Volume needed in kL")
    max_price_per_kl: Optional[float] = Field(None, ge=0.0, description="Maximum acceptable price/kL")
    total_budget: Optional[float] = Field(None, ge=0.0, description="Total procurement budget")
    max_distance_km: Optional[float] = Field(None, gt=0.0, description="Acceptable logistics radius")
    quality_limits: QualityLimits = Field(..., description="Rigid chemical tolerance parameters")
