"""
BlueLoop Suppliers API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.models.enums import FacilityType
from app.repositories.memory import get_repository_container
from app.schemas.supplier import SupplierFacilityResponse, SupplierListResponse

router = APIRouter()


@router.get(
    "",
    response_model=SupplierListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Treated Water Suppliers",
    description="Returns registered wastewater treatment facilities and effluent dischargers.",
)
async def list_suppliers(
    city: Optional[str] = Query(None, description="Filter by municipal city"),
    facility_type: Optional[FacilityType] = Query(
        None, description="Filter by facility classification (CETP, STP, etc.)"
    ),
) -> SupplierListResponse:
    container = get_repository_container()

    def filter_fn(fac):
        if city and fac.city.lower() != city.lower():
            return False
        if facility_type and fac.facility_type != facility_type:
            return False
        return True

    facilities = container.facilities.list(filter_fn)
    items = []
    for fac in facilities:
        org = container.organisations.get(fac.org_id)
        org_name = org.name if org else None
        item = SupplierFacilityResponse(
            id=fac.id,
            org_id=fac.org_id,
            name=fac.name,
            facility_type=fac.facility_type,
            city=fac.city,
            state=fac.state,
            latitude=fac.latitude,
            longitude=fac.longitude,
            verification_status=fac.verification_status,
            contact_email=fac.contact_email,
            contact_phone=fac.contact_phone,
            organisation_name=org_name,
            is_synthetic=fac.is_synthetic,
            created_at=fac.created_at,
        )
        items.append(item)

    return SupplierListResponse(
        items=items,
        total=len(items),
        is_synthetic=True,
    )


@router.get(
    "/{facility_id}",
    response_model=SupplierFacilityResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Supplier Facility Detail",
    description="Returns detailed profile of a specific treatment facility.",
)
async def get_supplier_facility(facility_id: str) -> SupplierFacilityResponse:
    container = get_repository_container()
    fac = container.facilities.get(facility_id)
    if not fac:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supplier facility with ID '{facility_id}' not found.",
        )

    org = container.organisations.get(fac.org_id)
    org_name = org.name if org else None

    return SupplierFacilityResponse(
        id=fac.id,
        org_id=fac.org_id,
        name=fac.name,
        facility_type=fac.facility_type,
        city=fac.city,
        state=fac.state,
        latitude=fac.latitude,
        longitude=fac.longitude,
        verification_status=fac.verification_status,
        contact_email=fac.contact_email,
        contact_phone=fac.contact_phone,
        organisation_name=org_name,
        is_synthetic=fac.is_synthetic,
        created_at=fac.created_at,
    )
