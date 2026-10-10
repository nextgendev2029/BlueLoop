"""
BlueLoop Supply Listings API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.enums import WaterGrade
from app.repositories.memory import get_repository_container
from app.schemas.supply import SupplyListingResponse, SupplyListResponse

router = APIRouter()


@router.get(
    "",
    response_model=SupplyListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Treated Water Supply Batches",
    description="Returns available treated effluent batches with water grade and quality measurements.",
)
async def list_supplies(
    water_grade: Optional[WaterGrade] = Query(None, description="Filter by water quality grade"),
    min_volume_kl: Optional[float] = Query(
        None, ge=0.0, description="Minimum available capacity in kilolitres"
    ),
    max_price_per_kl: Optional[float] = Query(
        None, ge=0.0, description="Maximum acceptable price per kilolitre"
    ),
) -> SupplyListResponse:
    container = get_repository_container()

    def filter_fn(listing):
        if water_grade and listing.water_grade != water_grade:
            return False
        if min_volume_kl and listing.available_volume_kl < min_volume_kl:
            return False
        if max_price_per_kl and listing.price_per_kl > max_price_per_kl:
            return False
        return True

    listings = container.listings.list(filter_fn)
    items = []
    for l in listings:
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

    return SupplyListResponse(
        items=items,
        total=len(items),
        is_synthetic=True,
    )


@router.get(
    "/{listing_id}",
    response_model=SupplyListingResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Supply Listing Detail",
    description="Returns detailed parameters and quality profile for a specific water batch.",
)
async def get_supply_listing(listing_id: str) -> SupplyListingResponse:
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
