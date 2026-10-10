"""
BlueLoop Impact Analytics Schemas
Typed data contract for multi-stage freshwater displacement and ESG verification metrics.
"""

from datetime import datetime
from typing import List
from pydantic import BaseModel, ConfigDict, Field


class ImpactSummaryResponse(BaseModel):
    """
    Audited environmental freshwater displacement summary.
    Separates unconfirmed proposals, accepted allocations, metered deliveries, and certified savings.
    """

    potential_displacement_kl: float = Field(
        ..., ge=0.0, description="Freshwater displacement from unconfirmed proposals currently in PROPOSED state"
    )
    accepted_estimated_displacement_kl: float = Field(
        ..., ge=0.0, description="Freshwater displacement from buyer/supplier approved runs in ACCEPTED state"
    )
    delivery_confirmed_displacement_kl: float = Field(
        ..., ge=0.0, description="Physically metered displacement from deliveries in ACCEPTED_CONFIRMED custody state"
    )
    independently_verified_displacement_kl: float = Field(
        ..., ge=0.0, description="Displacement backed by accredited laboratory or third-party ESG certificate"
    )

    total_active_proposals_count: int = Field(
        ..., ge=0, description="Number of allocation proposals in PROPOSED state"
    )
    total_accepted_allocations_count: int = Field(
        ..., ge=0, description="Number of allocation proposals in ACCEPTED state"
    )
    total_completed_deliveries_count: int = Field(
        ..., ge=0, description="Number of physical deliveries in ACCEPTED_CONFIRMED state"
    )

    is_independently_verified: bool = Field(
        default=False,
        description="True only if certified displacement > 0 with accredited third-party backing",
    )
    freshwater_substitution_ratio_assumption: float = Field(
        default=1.0,
        description="Assumed cubic meters of virgin freshwater displaced per cubic meter of treated water",
    )

    disclaimer: str = Field(
        default=(
            "BlueLoop Impact Accounting Disclosure: Potential figures reflect algorithmic screening "
            "proposals. Only metered deliveries with confirmed receiver sample analysis represent actual "
            "freshwater displacement. Synthetic demonstration fixtures are never presented as verified operational truth."
        )
    )
    disclosures: List[str] = Field(
        default_factory=list, description="Explicit accounting disclosures and lifecycle assumptions"
    )

    calculated_at: datetime
    is_synthetic: bool = True

    model_config = ConfigDict(from_attributes=True)
