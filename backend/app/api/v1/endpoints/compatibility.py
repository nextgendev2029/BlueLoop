"""
BlueLoop Water Quality Compatibility Screening API Endpoint
"""

from fastapi import APIRouter, HTTPException, status
from app.repositories.memory import get_repository_container
from app.schemas.compatibility import (
    CompatibilityEvaluationRequest,
    CompatibilityEvaluationResponse,
)
from app.services.quality import QualityCompatibilityService

router = APIRouter()
compatibility_service = QualityCompatibilityService()


@router.post(
    "/evaluate",
    response_model=CompatibilityEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Deterministic Water Quality Compatibility",
    description=(
        "Performs deterministic threshold evaluation comparing a water supply's physical "
        "and chemical parameters against a buyer's explicit tolerance limits. "
        "Evaluates either by referencing stored listing_id and demand_id, or by submitting "
        "custom ad-hoc measurement and limit payloads."
    ),
)
async def evaluate_compatibility(
    payload: CompatibilityEvaluationRequest,
) -> CompatibilityEvaluationResponse:
    container = get_repository_container()

    # Case A: By IDs
    if payload.listing_id and payload.demand_id:
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

        measurements = listing.measurements
        limits = demand.quality_limits

    # Case B: Ad-hoc custom payloads
    elif payload.custom_measurements and payload.custom_limits:
        measurements = payload.custom_measurements
        limits = payload.custom_limits

    # Case C: Listing ID with custom limits
    elif payload.listing_id and payload.custom_limits:
        listing = container.listings.get(payload.listing_id)
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Supply listing '{payload.listing_id}' not found.",
            )
        measurements = listing.measurements
        limits = payload.custom_limits

    # Case D: Custom measurements with demand ID
    elif payload.custom_measurements and payload.demand_id:
        demand = container.demands.get(payload.demand_id)
        if not demand:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Demand request '{payload.demand_id}' not found.",
            )
        measurements = payload.custom_measurements
        limits = demand.quality_limits

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid evaluation request. Provide either ('listing_id' and 'demand_id') "
                "or ('custom_measurements' and 'custom_limits')."
            ),
        )

    decision = compatibility_service.evaluate(measurements, limits)

    return CompatibilityEvaluationResponse(
        listing_id=payload.listing_id,
        demand_id=payload.demand_id,
        is_eligible=decision.is_eligible,
        decision_summary=decision.decision_summary,
        parameter_results=decision.parameter_results,
        failed_parameters=decision.failed_parameters,
        unknown_parameters=decision.unknown_parameters,
        disclaimer=decision.disclaimer,
        evaluated_at=decision.evaluated_at,
        is_synthetic=True,
    )
