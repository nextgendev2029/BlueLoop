from datetime import datetime
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Standardized response schema for service health status.
    """
    status: str = Field(..., description="Operational status of the service (e.g. 'ok')")
    app_name: str = Field(..., description="Name of the service")
    version: str = Field(..., description="Semantic version of the application")
    environment: str = Field(..., description="Current running environment (development, staging, production)")
    timestamp: datetime = Field(..., description="UTC ISO timestamp when status was evaluated")
    synthetic_data_mode: bool = Field(..., description="Indicates whether synthetic sample data mode is active")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "app_name": "BlueLoop",
                "version": "0.1.0",
                "environment": "development",
                "timestamp": "2026-10-11T02:30:00Z",
                "synthetic_data_mode": True
            }
        }
    }
