"""
BlueLoop Supply Listings API Endpoints
"""

from datetime import datetime, timezone
import logging
from typing import Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user, require_role
from app.models.entities import AuditEvent, SupplyListing, User
from app.models.enums import ActorType, ListingStatus, VerificationStatus, WaterGrade
from app.repositories.memory import get_repository_container
from app.schemas.supply import (
    SupplyListingCreateRequest,
    SupplyListingResponse,
    SupplyListResponse,
)

router = APIRouter()
logger = logging.getLogger("blueloop.api.supplies")


@router.get(
    "",
    response_model=SupplyListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Treated Water Supply Batches",
    description="Returns available treated effluent batches with water grade and quality measurements.",
)
async def list_supplies(
    water_grade: Optional[WaterGrade] = Query(None, description="Filter by water quality grade"),
    listing_status: Optional[ListingStatus] = Query(
        None, alias="status", description="Filter by supply listing status (ACTIVE, DEPLETED, SUSPENDED)"
    ),
    min_volume_kl: Optional[float] = Query(
        None, ge=0.0, description="Minimum available capacity in kilolitres"
    ),
    max_price_per_kl: Optional[float] = Query(
        None, ge=0.0, description="Maximum acceptable price per kilolitre"
    ),
    quality_evidence_status: Optional[VerificationStatus] = Query(
        None, description="Filter by laboratory verification accreditation status"
    ),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset index for pagination"),
    current_user: User = Depends(get_current_user),
) -> SupplyListResponse:
    container = get_repository_container()

    def filter_fn(listing):
        if water_grade and listing.water_grade != water_grade:
            return False
        if listing_status and listing.status != listing_status:
            return False
        if min_volume_kl and listing.available_volume_kl < min_volume_kl:
            return False
        if max_price_per_kl and listing.price_per_kl > max_price_per_kl:
            return False
        if quality_evidence_status and listing.quality_evidence_status != quality_evidence_status:
            return False
        return True

    listings = container.listings.list(filter_fn)
    total_count = len(listings)
    paginated_listings = listings[offset : offset + limit]

    items = []
    for l in paginated_listings:
        fac = container.facilities.get(l.facility_id)
        fac_name = fac.name if fac else None
        item = SupplyListingResponse(
            id=l.id,
            facility_id=l.facility_id,
            facility_name=fac_name,
            name=l.name,
            water_grade=l.water_grade,
            available_volume_kl=l.available_volume_kl,
            price_per_kl=l.price_per_kl,
            available_from=l.available_from,
            available_until=l.available_until,
            delivery_radius_km=l.delivery_radius_km,
            quality_evidence_status=l.quality_evidence_status,
            measurements=l.measurements,
            status=l.status,
            is_synthetic=l.is_synthetic,
            created_at=l.created_at,
        )
        items.append(item)

    logger.debug("Listed %d supply listings (total: %d)", len(items), total_count)
    return SupplyListResponse(
        items=items,
        total=total_count,
        limit=limit,
        offset=offset,
        is_synthetic=True,
    )


@router.get(
    "/{listing_id}",
    response_model=SupplyListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Supply Listing Detail",
    description="Returns detailed parameters and quality profile for a specific water batch.",
)
async def get_supply_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
) -> SupplyListingResponse:
    container = get_repository_container()
    l = container.listings.get(listing_id)
    if not l:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supply listing with ID '{listing_id}' not found.",
        )

    fac = container.facilities.get(l.facility_id)
    fac_name = fac.name if fac else None

    return SupplyListingResponse(
        id=l.id,
        facility_id=l.facility_id,
        facility_name=fac_name,
        name=l.name,
        water_grade=l.water_grade,
        available_volume_kl=l.available_volume_kl,
        price_per_kl=l.price_per_kl,
        available_from=l.available_from,
        available_until=l.available_until,
        delivery_radius_km=l.delivery_radius_km,
        quality_evidence_status=l.quality_evidence_status,
        measurements=l.measurements,
        status=l.status,
        is_synthetic=l.is_synthetic,
        created_at=l.created_at,
    )


@router.post(
    "",
    response_model=SupplyListingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Supply Listing",
    description="Suppliers publish available treated effluent batches. Restricts access to authorized facility owners.",
)
async def create_supply_listing(
    payload: SupplyListingCreateRequest,
    current_user: User = Depends(require_role("supplier", "admin")),
) -> SupplyListingResponse:
    container = get_repository_container()

    fac = container.facilities.get(payload.facility_id)
    if not fac:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Facility with ID '{payload.facility_id}' not found.",
        )

    # Tenant scoping: supplier can only publish for their own facility
    if current_user.role == "supplier" and fac.org_id != current_user.org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot create supply listings for facilities belonging to another organisation.",
        )

    now = datetime.now(timezone.utc)
    listing_id = f"LST-{uuid.uuid4().hex[:8].upper()}"

    listing = SupplyListing(
        id=listing_id,
        facility_id=payload.facility_id,
        name=payload.name,
        water_grade=payload.water_grade,
        available_volume_kl=payload.available_volume_kl,
        price_per_kl=payload.price_per_kl,
        available_from=payload.available_from,
        available_until=payload.available_until,
        delivery_radius_km=payload.delivery_radius_km,
        quality_evidence_status=payload.quality_evidence_status or VerificationStatus.VERIFIED_DEMO,
        measurements=payload.measurements,
        status=payload.status or ListingStatus.ACTIVE,
        is_synthetic=False,
        created_at=now,
    )

    created = container.listings.create(listing)

    # Record immutable audit event
    container.audit_events.create(
        AuditEvent(
            event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            entity_type="SupplyListing",
            entity_id=listing_id,
            actor_type=ActorType.SUPPLIER,
            action="CREATE_LISTING",
            explanation=f"Supplier {current_user.email} created listing {listing_id} ({payload.name}) for facility {fac.name}.",
            metadata={"volume_kl": payload.available_volume_kl, "price_per_kl": payload.price_per_kl},
        )
    )

    return SupplyListingResponse(
        id=created.id,
        facility_id=created.facility_id,
        facility_name=fac.name,
        name=created.name,
        water_grade=created.water_grade,
        available_volume_kl=created.available_volume_kl,
        price_per_kl=created.price_per_kl,
        available_from=created.available_from,
        available_until=created.available_until,
        delivery_radius_km=created.delivery_radius_km,
        quality_evidence_status=created.quality_evidence_status,
        measurements=created.measurements,
        status=created.status,
        is_synthetic=created.is_synthetic,
        created_at=created.created_at,
    )
