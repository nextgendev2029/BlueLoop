from datetime import datetime, timezone
from fastapi import APIRouter, status
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service Health Check",
    description="Returns application health status, version, and operational configuration mode."
)
async def check_health() -> HealthResponse:
    """
    Health check endpoint returning system status and configuration indicators.
    """
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        timestamp=datetime.now(timezone.utc),
        synthetic_data_mode=settings.use_synthetic_data
    )
