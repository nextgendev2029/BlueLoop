"""
BlueLoop Supplier API Schemas
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import FacilityType, VerificationStatus


class SupplierFacilityResponse(BaseModel):
    id: str
    org_id: str
    name: str
    facility_type: FacilityType
    city: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    verification_status: VerificationStatus
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    organisation_name: Optional[str] = None
    is_synthetic: bool = True
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupplierListResponse(BaseModel):
    items: List[SupplierFacilityResponse]
    total: int
    limit: Optional[int] = Field(None, description="Maximum number of items requested")
    offset: Optional[int] = Field(None, description="Offset index requested")
    is_synthetic: bool = Field(
        default=True,
        description="True indicates response contains synthetic demonstration fixtures.",
    )
