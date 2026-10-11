"""
BlueLoop Allocation Optimization API Endpoints
Deterministic multi-facility matching, feasibility screening, and constrained volume allocation.
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import get_current_user, require_role
from app.models.entities import AllocationCandidate, AllocationRun, AuditEvent, User
from app.models.enums import ActorType, DemandStatus, EligibilityStatus, ListingStatus
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
    current_user: User = Depends(get_current_user),
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
async def get_allocation_run(
    run_id: str,
    current_user: User = Depends(get_current_user),
) -> AllocationRunResponse:
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
async def list_allocation_runs(
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return"),
    offset: int = Query(0, ge=0, description="Offset index for pagination"),
    current_user: User = Depends(get_current_user),
) -> List[AllocationRunResponse]:
    container = get_repository_container()
    runs = container.allocation_proposals.list()
    # Sort newest first
    sorted_runs = sorted(runs, key=lambda r: r.run_timestamp, reverse=True)
    return sorted_runs[offset : offset + limit]


@router.post(
    "/{run_id}/accept",
    response_model=AllocationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Accept Allocation Proposal",
    description=(
        "Transitions an allocation proposal from PROPOSED to ACCEPTED. "
        "Strictly restricted to buyers and administrators. Prevents accepting already rejected runs."
    ),
)
async def accept_allocation_proposal(
    run_id: str,
    current_user: User = Depends(require_role("buyer", "admin")),
) -> AllocationRunResponse:
    container = get_repository_container()
    proposal = container.allocation_proposals.get(run_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Allocation run '{run_id}' not found.",
        )

    # Tenant Ownership Verification: Buyers can only accept proposals involving their own demands
    if current_user.role == "buyer":
        user_demand_ids = {d.id for d in container.demands.list(lambda d: d.org_id == current_user.org_id)}
        alloc_items = getattr(proposal, "proposed_allocations", getattr(proposal, "allocations", []))
        has_matching_demand = any(item.demand_id in user_demand_ids for item in alloc_items)
        if not has_matching_demand and alloc_items:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot accept allocation proposals for other buyer organisations.",
            )

    if proposal.status == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot accept allocation proposal '{run_id}' because it has already been rejected.",
        )

    if proposal.status != "ACCEPTED":
        proposal.status = "ACCEPTED"
        container.allocation_proposals.update(proposal)

        domain_run = container.allocation_runs.get(run_id)
        if domain_run:
            domain_run.status = "ACCEPTED"
            container.allocation_runs.update(domain_run)

        # Record immutable audit event
        container.audit_events.create(
            AuditEvent(
                event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
                entity_type="AllocationRun",
                entity_id=run_id,
                actor_type=ActorType.BUYER if current_user.role == "buyer" else ActorType.USER_OPERATOR,
                action="ACCEPT_PROPOSAL",
                explanation=f"Allocation proposal '{run_id}' accepted by {current_user.email}.",
                metadata={"total_allocated_kl": proposal.totals.total_allocated_volume_kl, "user_id": current_user.id},
            )
        )

    return proposal


@router.post(
    "/{run_id}/reject",
    response_model=AllocationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Reject Allocation Proposal",
    description=(
        "Transitions an allocation proposal from PROPOSED to REJECTED. "
        "Strictly restricted to buyers and administrators. Prevents rejecting an already accepted allocation run."
    ),
)
async def reject_allocation_proposal(
    run_id: str,
    current_user: User = Depends(require_role("buyer", "admin")),
) -> AllocationRunResponse:
    container = get_repository_container()
    proposal = container.allocation_proposals.get(run_id)
    if not proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Allocation run '{run_id}' not found.",
        )

    # Tenant Ownership Verification: Buyers can only reject proposals involving their own demands
    if current_user.role == "buyer":
        user_demand_ids = {d.id for d in container.demands.list(lambda d: d.org_id == current_user.org_id)}
        alloc_items = getattr(proposal, "proposed_allocations", getattr(proposal, "allocations", []))
        has_matching_demand = any(item.demand_id in user_demand_ids for item in alloc_items)
        if not has_matching_demand and alloc_items:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot reject allocation proposals for other buyer organisations.",
            )

    if proposal.status == "ACCEPTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject allocation proposal '{run_id}' because it has already been accepted.",
        )

    if proposal.status != "REJECTED":
        proposal.status = "REJECTED"
        container.allocation_proposals.update(proposal)

        domain_run = container.allocation_runs.get(run_id)
        if domain_run:
            domain_run.status = "REJECTED"
            container.allocation_runs.update(domain_run)

        # Record immutable audit event
        container.audit_events.create(
            AuditEvent(
                event_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
                entity_type="AllocationRun",
                entity_id=run_id,
                actor_type=ActorType.BUYER if current_user.role == "buyer" else ActorType.USER_OPERATOR,
                action="REJECT_PROPOSAL",
                explanation=f"Allocation proposal '{run_id}' rejected by {current_user.email}.",
                metadata={"run_id": run_id, "user_id": current_user.id},
            )
        )

    return proposal
