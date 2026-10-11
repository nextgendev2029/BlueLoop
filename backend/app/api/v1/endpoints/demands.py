"""
BlueLoop Demand Requests API Endpoints
"""

from datetime import datetime, timezone
import logging
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user, require_role
from app.models.entities import AuditEvent, DemandRequest, User
from app.models.enums import ActorType, DemandStatus, IntendedUse
from app.repositories.memory import get_repository_container
from app.schemas.demand import (
    DemandListResponse,
    DemandRequestCreate,
    DemandRequestResponse,
)

router = APIRouter()
logger = logging.getLogger("blueloop.api.demands")


@router.get(
    "",
    response_model=DemandListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Buyer Demand Requests",
    description="Returns commercial water intake demands and explicit quality tolerance limits. Scoped to buyer organization.",
)
async def list_demands(
    intended_use: Optional[IntendedUse] = Query(
        None, description="Filter by consumer application type"
    ),
    demand_status: Optional[DemandStatus] = Query(
        None, alias="status", description="Filter by demand lifecycle status"
    ),
    max_distance_km: Optional[float] = Query(
        None, ge=0.0, description="Filter demands accepting at least this transport distance"
    ),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset index for pagination"),
    current_user: User = Depends(get_current_user),
) -> DemandListResponse:
    container = get_repository_container()

    def filter_fn(d: DemandRequest):
        # Tenant Isolation: Buyers only see their own demands
        if current_user.role == "buyer" and d.org_id != current_user.org_id:
            return False
        # Suppliers can discover open buyer demand requests to identify matching opportunities,
        # but cannot view non-open (e.g. DRAFT, FULFILLED, CANCELLED) demands
        if current_user.role == "supplier" and d.status != DemandStatus.OPEN:
            return False
        if intended_use and d.intended_use != intended_use:
            return False
        if demand_status and d.status != demand_status:
            return False
        if max_distance_km and (d.max_distance_km is None or d.max_distance_km < max_distance_km):
            return False
        return True

    demands = container.demands.list(filter_fn)
    total_count = len(demands)
    paginated_demands = demands[offset : offset + limit]

    items = [DemandRequestResponse.model_validate(d) for d in paginated_demands]
    logger.debug("Listed %d demand requests (total: %d) for user %s", len(items), total_count, current_user.email)

    return DemandListResponse(
        items=items,
        total=total_count,
        limit=limit,
        offset=offset,
        is_synthetic=True,
    )


@router.get(
    "/{demand_id}",
    response_model=DemandRequestResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Demand Request Detail",
    description="Returns detailed volume specifications and quality limits for a specific buyer request.",
)
async def get_demand_request(
    demand_id: str,
    current_user: User = Depends(get_current_user),
) -> DemandRequestResponse:
    container = get_repository_container()
    d = container.demands.get(demand_id)
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demand request with ID '{demand_id}' not found.",
        )

    # Tenant Boundary Enforcement
    if current_user.role == "buyer" and d.org_id != current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to demand requests of other organisations.",
        )

    if current_user.role == "supplier" and d.status != DemandStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Suppliers may only inspect open buyer demand opportunities.",
        )

    return DemandRequestResponse.model_validate(d)


@router.post(
    "",
    response_model=DemandRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Demand Request",
    description="Registers an industrial water intake requirement. Strictly restricted to commercial buyers and administrators.",
)
async def create_demand_request(
    payload: DemandRequestCreate,
    current_user: User = Depends(require_role("buyer", "admin")),
) -> DemandRequestResponse:
    container = get_repository_container()

    now = datetime.now(timezone.utc)
    demand_id = f"DEM-{uuid.uuid4().hex[:8].upper()}"

    demand = DemandRequest(
        id=demand_id,
        org_id=current_user.org_id,
        facility_name=payload.facility_name,
        intended_use=payload.intended_use,
        required_volume_kl=payload.required_volume_kl,
        max_price_per_kl=payload.max_price_per_kl,
        total_budget=payload.total_budget,
        max_distance_km=payload.max_distance_km,
        quality_limits=payload.quality_limits,
        status=DemandStatus.OPEN,
        is_synthetic=False,
        created_at=now,
        updated_at=now,
    )

    created = container.demands.create(demand)

    # Record immutable audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="DemandRequest",
            entity_id=demand_id,
            actor_type=ActorType.BUYER,
            action="CREATE_DEMAND",
            explanation=f"Buyer {current_user.email} created demand {demand_id} for {payload.facility_name}.",
            metadata={"required_volume_kl": payload.required_volume_kl, "intended_use": payload.intended_use},
        )
    )

    return DemandRequestResponse.model_validate(created)
