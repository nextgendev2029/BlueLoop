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
