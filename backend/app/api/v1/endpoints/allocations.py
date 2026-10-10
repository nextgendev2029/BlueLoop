"""
BlueLoop Allocation Optimization API Endpoints
Deterministic multi-facility matching, feasibility screening, and constrained volume allocation.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from app.models.entities import AllocationCandidate, AllocationRun
from app.models.enums import DemandStatus, EligibilityStatus, ListingStatus
from app.repositories.memory import get_repository_container
from app.schemas.allocation import (
    AllocationRunRequest,
    AllocationRunResponse,
)
from app.services.allocation_engine import AllocationEngine

router = APIRouter()
allocation_engine = AllocationEngine()


@router.post(
    "/run",
    response_model=AllocationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Deterministic Allocation Optimization Run",
    description=(
        "Executes a deterministic multi-facility allocation optimization between active supply "
        "listings and buyer demands. Respects hard quality gates, distance constraints, and "
        "linear capacity limits without double-counting supply."
    ),
)
async def run_allocation(
    payload: Optional[AllocationRunRequest] = None,
) -> AllocationRunResponse:
    container = get_repository_container()
    req = payload or AllocationRunRequest()

    # 1. Resolve Listings
    if req.listing_ids is not None:
        listings = []
        for lid in req.listing_ids:
            item = container.listings.get(lid)
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Supply listing '{lid}' not found.",
                )
            listings.append(item)
    else:
        # Default: all active supply listings
        listings = container.listings.list(lambda l: l.status == ListingStatus.ACTIVE)

    # 2. Resolve Demands
    if req.demand_ids is not None:
        demands = []
        for did in req.demand_ids:
            item = container.demands.get(did)
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Demand request '{did}' not found.",
                )
            demands.append(item)
    else:
        # Default: all open demand requests
        demands = container.demands.list(lambda d: d.status == DemandStatus.OPEN)

    # 3. Resolve Facilities Map
    all_facilities = container.facilities.list()
    facilities_map = {f.id: f for f in all_facilities}

    # 4. Execute Engine
    result = allocation_engine.run_allocation(
        listings=listings,
        demands=demands,
        facilities_map=facilities_map,
        substitution_ratio=req.substitution_ratio,
        transport_rate_per_kl_km=req.transport_rate_per_kl_km,
    )

    # 5. Persist Proposal in-memory
    container.allocation_proposals.create(result)

    # 6. Also persist Domain AllocationRun entity for data-layer completeness
    domain_candidates = [
        AllocationCandidate(
            candidate_id=p.candidate_id,
            run_id=result.run_id,
            listing_id=p.listing_id,
            demand_id=p.demand_id,
            proposed_volume_kl=p.allocated_volume_kl,
            unit_price_per_kl=p.cost_estimate.unit_supplier_price_per_kl,
            estimated_transport_cost_per_kl=p.cost_estimate.unit_transport_cost_per_kl,
            estimated_delivered_cost_per_kl=p.cost_estimate.delivered_cost_per_kl,
            eligibility_status=EligibilityStatus.ELIGIBLE,
            decision_reasons=p.decision_reasons,
            estimated_freshwater_displacement_kl=p.impact_estimate.potential_freshwater_displacement_kl,
            is_synthetic=True,
        )
        for p in result.proposed_allocations
    ]
    domain_run = AllocationRun(
        run_id=result.run_id,
        created_at=result.run_timestamp,
        input_demand_ids=[d.id for d in demands],
        input_listing_ids=[l.id for l in listings],
        candidates=domain_candidates,
        status="PROPOSED",
    )
    container.allocation_runs.create(domain_run)

    return result


@router.get(
    "/{run_id}",
    response_model=AllocationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Allocation Run Proposal Detail",
    description="Returns the stored proposal, candidate feasibility traces, and accounting totals for a run.",
)
async def get_allocation_run(run_id: str) -> AllocationRunResponse:
    container = get_repository_container()
    proposal = container.allocation_proposals.get(run_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Allocation run '{run_id}' not found.",
        )
    return proposal


@router.get(
    "",
    response_model=List[AllocationRunResponse],
    status_code=status.HTTP_200_OK,
    summary="List Stored Allocation Runs",
    description="Returns all allocation proposal runs stored in memory during the current session.",
)
async def list_allocation_runs() -> List[AllocationRunResponse]:
    container = get_repository_container()
    runs = container.allocation_proposals.list()
    # Sort newest first
    return sorted(runs, key=lambda r: r.run_timestamp, reverse=True)
