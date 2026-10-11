"""
BlueLoop Impact Analytics API Endpoints
Provides multi-stage freshwater displacement metrics separating proposals from verified physical transfers.
"""

from datetime import datetime, timezone
import logging
from fastapi import APIRouter, Depends, status

from app.core.auth import get_current_user
from app.models.entities import User
from app.models.enums import DeliveryLifecycleStatus, VerificationStatus
from app.repositories.memory import get_repository_container
from app.schemas.impact import ImpactSummaryResponse

router = APIRouter()
logger = logging.getLogger("blueloop.api.impact")


@router.get(
    "/summary",
    response_model=ImpactSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Freshwater Displacement Impact Summary",
    description=(
        "Returns multi-tier environmental impact metrics. Separates potential displacement "
        "from active proposals, accepted allocations, metered physical deliveries, and certified savings."
    ),
)
async def get_impact_summary(
    current_user: User = Depends(get_current_user),
) -> ImpactSummaryResponse:
    container = get_repository_container()
    now = datetime.now(timezone.utc)

    # 1. Proposal stage accounting
    all_proposals = container.allocation_proposals.list()
    proposed_runs = [p for p in all_proposals if p.status == "PROPOSED"]
    accepted_runs = [p for p in all_proposals if p.status == "ACCEPTED"]

    potential_displacement = round(
        sum(p.totals.total_potential_displacement_kl for p in proposed_runs), 2
    )
    accepted_displacement = round(
        sum(p.totals.total_potential_displacement_kl for p in accepted_runs), 2
    )

    # 2. Delivery stage accounting
    all_deliveries = container.deliveries.list()
    confirmed_deliveries = [
        d for d in all_deliveries
        if d.lifecycle_status == DeliveryLifecycleStatus.ACCEPTED_CONFIRMED
    ]
    verified_deliveries = [
        d for d in confirmed_deliveries
        if d.verification_status == VerificationStatus.CERTIFIED
    ]

    delivery_confirmed_displacement = round(
        sum(
            d.delivered_volume_kl if d.delivered_volume_kl is not None else d.dispatched_volume_kl
            for d in confirmed_deliveries
        ),
        2,
    )

    verified_displacement = round(
        sum(
            d.delivered_volume_kl if d.delivered_volume_kl is not None else d.dispatched_volume_kl
            for d in verified_deliveries
        ),
        2,
    )

    disclosures = [
        f"Potential displacement ({potential_displacement:,.1f} kL) is modeled across {len(proposed_runs)} pending proposals.",
        f"Accepted allocation displacement ({accepted_displacement:,.1f} kL) represents approved matching awaiting delivery scheduling.",
        f"Delivery-confirmed displacement ({delivery_confirmed_displacement:,.1f} kL) is backed by {len(confirmed_deliveries)} confirmed intake transfers.",
        "Third-party independent verification requires accredited lab telemetry backing; currently zero unverified credits are counted as verified.",
    ]

    logger.debug(
        "Impact summary computed: potential=%.1f kL, accepted=%.1f kL, confirmed=%.1f kL",
        potential_displacement,
        accepted_displacement,
        delivery_confirmed_displacement,
    )

    return ImpactSummaryResponse(
        potential_displacement_kl=potential_displacement,
        accepted_estimated_displacement_kl=accepted_displacement,
        delivery_confirmed_displacement_kl=delivery_confirmed_displacement,
        independently_verified_displacement_kl=verified_displacement,
        total_active_proposals_count=len(proposed_runs),
        total_accepted_allocations_count=len(accepted_runs),
        total_completed_deliveries_count=len(confirmed_deliveries),
        is_independently_verified=(verified_displacement > 0.0),
        freshwater_substitution_ratio_assumption=1.0,
        disclosures=disclosures,
        calculated_at=now,
        is_synthetic=True,
    )
