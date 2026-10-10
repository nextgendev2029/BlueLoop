"""
BlueLoop Quality Compatibility API Schemas
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.models.entities import (
    ParameterEvaluationResult,
    QualityLimits,
    WaterQualityMeasurements,
)


class CompatibilityEvaluationRequest(BaseModel):
    """
    Request payload to evaluate water quality compatibility.
    Can reference an existing listing_id and demand_id,
    or provide custom measurements and limits directly.
    """

    listing_id: Optional[str] = Field(
        None, description="Existing supply listing ID (e.g. SYNTH-LIST-01)"
    )
    demand_id: Optional[str] = Field(
        None, description="Existing demand request ID (e.g. SYNTH-DEM-01)"
    )
    custom_measurements: Optional[WaterQualityMeasurements] = Field(
        None, description="Ad-hoc water quality measurements to test"
    )
    custom_limits: Optional[QualityLimits] = Field(
        None, description="Ad-hoc quality limits to test against"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "listing_id": "SYNTH-LIST-01",
                "demand_id": "SYNTH-DEM-01",
            }
        }
    )


class CompatibilityEvaluationResponse(BaseModel):
    listing_id: Optional[str] = None
    demand_id: Optional[str] = None
    is_eligible: bool
    decision_summary: str
    parameter_results: List[ParameterEvaluationResult]
    failed_parameters: List[str]
    unknown_parameters: List[str]
    disclaimer: str
    evaluated_at: datetime
    is_synthetic: bool = True

    model_config = ConfigDict(from_attributes=True)
