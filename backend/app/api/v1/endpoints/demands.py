"""
BlueLoop Demand Requests API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.enums import DemandStatus, IntendedUse
from app.repositories.memory import get_repository_container
from app.schemas.demand import DemandListResponse, DemandRequestResponse

router = APIRouter()


@router.get(
    "",
    response_model=DemandListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Buyer Demand Requests",
    description="Returns commercial water intake demands and explicit quality tolerance limits.",
)
async def list_demands(
    intended_use: Optional[IntendedUse] = Query(
        None, description="Filter by consumer application type"
    ),
    demand_status: Optional[DemandStatus] = Query(
        None, alias="status", description="Filter by demand lifecycle status"
    ),
) -> DemandListResponse:
    container = get_repository_container()

    def filter_fn(d):
        if intended_use and d.intended_use != intended_use:
            return False
        if demand_status and d.status != demand_status:
            return False
        return True

    demands = container.demands.list(filter_fn)
    items = [DemandRequestResponse.model_validate(d) for d in demands]

    return DemandListResponse(
        items=items,
        total=len(items),
        is_synthetic=True,
    )


@router.get(
    "/{demand_id}",
    response_model=DemandRequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Demand Request Detail",
    description="Returns detailed volume specifications and quality limits for a specific buyer request.",
)
async def get_demand_request(demand_id: str) -> DemandRequestResponse:
    container = get_repository_container()
    d = container.demands.get(demand_id)
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demand request with ID '{demand_id}' not found.",
        )
    return DemandRequestResponse.model_validate(d)
