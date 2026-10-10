"""
BlueLoop Delivery Logistics & Custody Transfer API Endpoints
Manages physical batch dispatches, lifecycle progression, and transfer verification.
"""

from datetime import datetime, timezone
import logging
from typing import Optional
import uuid
from fastapi import APIRouter, HTTPException, Query, status

from app.models.entities import AuditEvent, DeliveryRecord
from app.models.enums import (
    ActorType,
    DeliveryLifecycleStatus,
    DeliveryMode,
    VerificationStatus,
)
from app.repositories.memory import get_repository_container
from app.schemas.delivery import (
    DeliveryCreateRequest,
    DeliveryListResponse,
    DeliveryRecordResponse,
    DeliveryStatusUpdateRequest,
)

router = APIRouter()
logger = logging.getLogger("blueloop.api.deliveries")

VALID_TRANSITIONS = {
    DeliveryLifecycleStatus.SCHEDULED: {
        DeliveryLifecycleStatus.DISPATCHED,
        DeliveryLifecycleStatus.REJECTED_QUALITY_FAILURE,
    },
    DeliveryLifecycleStatus.DISPATCHED: {
        DeliveryLifecycleStatus.IN_TRANSIT,
        DeliveryLifecycleStatus.REJECTED_QUALITY_FAILURE,
    },
    DeliveryLifecycleStatus.IN_TRANSIT: {
        DeliveryLifecycleStatus.DELIVERED_SAMPLE_PENDING,
        DeliveryLifecycleStatus.REJECTED_QUALITY_FAILURE,
    },
    DeliveryLifecycleStatus.DELIVERED_SAMPLE_PENDING: {
        DeliveryLifecycleStatus.ACCEPTED_CONFIRMED,
        DeliveryLifecycleStatus.REJECTED_QUALITY_FAILURE,
    },
    DeliveryLifecycleStatus.ACCEPTED_CONFIRMED: set(),  # Terminal state
    DeliveryLifecycleStatus.REJECTED_QUALITY_FAILURE: set(),  # Terminal state
}


@router.get(
    "",
    response_model=DeliveryListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Physical Delivery Records",
    description="Returns tracked water batch dispatches and custody status.",
)
async def list_deliveries(
    lifecycle_status: Optional[DeliveryLifecycleStatus] = Query(
        None, description="Filter by custody lifecycle state"
    ),
    delivery_mode: Optional[DeliveryMode] = Query(
        None, description="Filter by logistics mechanism (PIPELINE or DEDICATED_TANKER)"
    ),
    listing_id: Optional[str] = Query(None, description="Filter by supply listing ID"),
    demand_id: Optional[str] = Query(None, description="Filter by buyer demand ID"),
    limit: int = Query(50, ge=1, le=100, description="Maximum items to return"),
    offset: int = Query(0, ge=0, description="Offset index for pagination"),
) -> DeliveryListResponse:
    container = get_repository_container()

    def filter_fn(deliv: DeliveryRecord):
        if lifecycle_status and deliv.lifecycle_status != lifecycle_status:
            return False
        if delivery_mode and deliv.delivery_mode != delivery_mode:
            return False
        if listing_id and deliv.listing_id != listing_id:
            return False
        if demand_id and deliv.demand_id != demand_id:
            return False
        return True

    deliveries = container.deliveries.list(filter_fn)
    total_count = len(deliveries)
    # Sort newest first
    sorted_deliveries = sorted(deliveries, key=lambda d: d.created_at, reverse=True)
    paginated = sorted_deliveries[offset : offset + limit]

    items = [DeliveryRecordResponse.model_validate(d) for d in paginated]
    logger.debug("Listed %d deliveries (total: %d)", len(items), total_count)

    return DeliveryListResponse(
        items=items,
        total=total_count,
        limit=limit,
        offset=offset,
        is_synthetic=True,
    )


@router.get(
    "/{delivery_id}",
    response_model=DeliveryRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Delivery Record Detail",
    description="Returns detailed telemetry and lifecycle state for a physical batch dispatch.",
)
async def get_delivery(delivery_id: str) -> DeliveryRecordResponse:
    container = get_repository_container()
    deliv = container.deliveries.get(delivery_id)
    if not deliv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery record with ID '{delivery_id}' not found.",
        )
    return DeliveryRecordResponse.model_validate(deliv)


@router.post(
    "",
    response_model=DeliveryRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule Water Delivery Dispatch",
    description="Registers an actual physical delivery batch against valid supply and demand records.",
)
async def create_delivery(payload: DeliveryCreateRequest) -> DeliveryRecordResponse:
    container = get_repository_container()

    listing = container.listings.get(payload.listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supply listing '{payload.listing_id}' not found.",
        )

    demand = container.demands.get(payload.demand_id)
    if not demand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Demand request '{payload.demand_id}' not found.",
        )

    now = datetime.now(timezone.utc)
    deliv_id = f"DELIV-{now.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

    record = DeliveryRecord(
        id=deliv_id,
        allocation_candidate_id=payload.allocation_candidate_id,
        listing_id=payload.listing_id,
        demand_id=payload.demand_id,
        dispatched_volume_kl=payload.dispatched_volume_kl,
        delivered_volume_kl=None,
        scheduled_date=payload.scheduled_date,
        delivery_mode=payload.delivery_mode,
        lifecycle_status=DeliveryLifecycleStatus.SCHEDULED,
        verification_status=VerificationStatus.UNVERIFIED,
        is_synthetic=True,
        created_at=now,
        updated_at=now,
    )

    created_record = container.deliveries.create(record)

    # Record immutable audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="DeliveryRecord",
            entity_id=deliv_id,
            actor_type=ActorType.USER_OPERATOR,
            action="SCHEDULE_DELIVERY",
            explanation=(
                f"Physical water delivery {deliv_id} scheduled for {payload.dispatched_volume_kl:.1f} kL "
                f"via {payload.delivery_mode} from {listing.id} to {demand.id}."
            ),
            metadata={
                "dispatched_volume_kl": payload.dispatched_volume_kl,
                "scheduled_date": payload.scheduled_date.isoformat(),
            },
        )
    )

    logger.info("Created delivery %s: %.1f kL", deliv_id, payload.dispatched_volume_kl)
    return DeliveryRecordResponse.model_validate(created_record)


@router.patch(
    "/{delivery_id}/status",
    response_model=DeliveryRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Delivery Lifecycle Status",
    description="Transitions the custody status of a physical delivery along the auditable chain-of-custody pipeline.",
)
async def update_delivery_status(
    delivery_id: str,
    payload: DeliveryStatusUpdateRequest,
) -> DeliveryRecordResponse:
    container = get_repository_container()
    record = container.deliveries.get(delivery_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Delivery record with ID '{delivery_id}' not found.",
        )

    current_status = record.lifecycle_status
    target_status = payload.lifecycle_status

    if target_status != current_status:
        allowed_next = VALID_TRANSITIONS.get(DeliveryLifecycleStatus(current_status), set())
        if target_status not in allowed_next:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid custody lifecycle transition from '{current_status}' to '{target_status}'. "
                    f"Allowed next states: {[str(s) for s in allowed_next]}."
                ),
            )

    now = datetime.now(timezone.utc)
    record.lifecycle_status = target_status
    record.updated_at = now

    # If accepted, record delivered volume
    if target_status == DeliveryLifecycleStatus.ACCEPTED_CONFIRMED:
        final_volume = (
            payload.delivered_volume_kl
            if payload.delivered_volume_kl is not None
            else record.dispatched_volume_kl
        )
        record.delivered_volume_kl = final_volume

    updated_record = container.deliveries.update(record)

    # Record immutable audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="DeliveryRecord",
            entity_id=delivery_id,
            actor_type=ActorType.USER_OPERATOR,
            action="UPDATE_DELIVERY_STATUS",
            explanation=f"Delivery {delivery_id} transitioned from {current_status} to {target_status}.",
            metadata={
                "previous_status": str(current_status),
                "new_status": str(target_status),
                "delivered_volume_kl": record.delivered_volume_kl,
                "notes": payload.notes,
            },
        )
    )

    logger.info("Delivery %s transitioned: %s -> %s", delivery_id, current_status, target_status)
    return DeliveryRecordResponse.model_validate(updated_record)
