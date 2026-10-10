"""
BlueLoop Candidate Generation and Feasibility Evaluation Service
Evaluates potential supply-demand pairings using deterministic feasibility rules.
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.models.entities import (
    CompatibilityDecision,
    DemandRequest,
    SupplierFacility,
    SupplyListing,
)
from app.models.enums import EligibilityStatus, ListingStatus, WaterGrade
from app.services.geo import haversine_distance_km
from app.services.quality import QualityCompatibilityService


class CandidateEvaluation(BaseModel):
    """
    Comprehensive evaluation of a candidate supply-to-demand pairing.
    Maintains all raw inputs, constraints checked, and machine-readable reason codes.
    """

    candidate_id: str
    listing_id: str
    facility_id: str
    demand_id: str
    available_volume_kl: float
    requested_volume_kl: float
    water_grade: WaterGrade
    supplier_price_per_kl: float

    distance_km: Optional[float] = None
    is_distance_known: bool = False

    eligibility_status: EligibilityStatus
    reason_codes: List[str] = Field(default_factory=list)
    human_reasons: List[str] = Field(default_factory=list)

    quality_decision: Optional[CompatibilityDecision] = None

    model_config = ConfigDict(from_attributes=True)


class CandidateEvaluator:
    """
    Evaluates individual pairs against operational, physical, and economic gates.
    """

    def __init__(self, quality_service: Optional[QualityCompatibilityService] = None):
        self._quality_service = quality_service or QualityCompatibilityService()

    def evaluate_pair(
        self,
        listing: SupplyListing,
        demand: DemandRequest,
        facility: Optional[SupplierFacility] = None,
    ) -> CandidateEvaluation:
        candidate_id = f"CAND-{listing.id}-{demand.id}"
        reason_codes: List[str] = []
        human_reasons: List[str] = []

        is_ineligible = False
        is_unknown = False

        # 1. Operational Listing Status
        if listing.status != ListingStatus.ACTIVE:
            is_ineligible = True
            reason_codes.append("LISTING_INACTIVE")
            human_reasons.append(f"Supply listing is currently in {listing.status} status (must be ACTIVE).")

        # 2. Positive Volume Feasibility
        if listing.available_volume_kl <= 0:
            is_ineligible = True
            reason_codes.append("SUPPLY_VOLUME_ZERO")
            human_reasons.append("Supply listing has zero or non-positive available capacity.")

        if demand.required_volume_kl <= 0:
            is_ineligible = True
            reason_codes.append("DEMAND_VOLUME_ZERO")
            human_reasons.append("Demand request has zero or non-positive volume requirement.")

        # 3. Distance and Logistics Constraints
        distance_km = None
        is_dist_known = False

        if facility is not None and facility.latitude is not None and facility.longitude is not None:
            if demand.latitude is not None and demand.longitude is not None:
                distance_km = haversine_distance_km(
                    facility.latitude,
                    facility.longitude,
                    demand.latitude,
                    demand.longitude,
                )
                is_dist_known = distance_km is not None

        if demand.max_distance_km is not None:
            if is_dist_known and distance_km is not None:
                if distance_km > demand.max_distance_km:
                    is_ineligible = True
                    reason_codes.append("DISTANCE_EXCEEDED")
                    human_reasons.append(
                        f"Calculated distance of {distance_km:.1f} km exceeds buyer maximum limit of {demand.max_distance_km:.1f} km."
                    )
                else:
                    reason_codes.append("DISTANCE_WITHIN_LIMIT")
                    human_reasons.append(
                        f"Distance of {distance_km:.1f} km is within buyer limit of {demand.max_distance_km:.1f} km."
                    )
            else:
                # Mandatory distance constraint cannot be verified
                is_unknown = True
                reason_codes.append("DISTANCE_UNKNOWN_MISSING_COORDINATES")
                human_reasons.append(
                    f"Buyer requires maximum distance <= {demand.max_distance_km:.1f} km, but facility or demand coordinates are missing."
                )

        # 4. Ex-Works Unit Price Ceiling
        if demand.max_price_per_kl is not None:
            if listing.price_per_kl > demand.max_price_per_kl:
                is_ineligible = True
                excess = listing.price_per_kl - demand.max_price_per_kl
                reason_codes.append("PRICE_EXCEEDS_MAX_LIMIT")
                human_reasons.append(
                    f"Supplier ex-works price {listing.price_per_kl:.2f}/kL exceeds buyer maximum limit "
                    f"{demand.max_price_per_kl:.2f}/kL by {excess:.2f}/kL."
                )
            else:
                reason_codes.append("PRICE_WITHIN_LIMIT")
                human_reasons.append(
                    f"Supplier ex-works price {listing.price_per_kl:.2f}/kL satisfies buyer ceiling <= {demand.max_price_per_kl:.2f}/kL."
                )

        # 5. Deterministic Water Quality Screening Gate
        quality_decision = self._quality_service.evaluate(
            measurements=listing.measurements,
            limits=demand.quality_limits,
        )

        if not quality_decision.is_eligible:
            if quality_decision.failed_parameters:
                is_ineligible = True
                for fp in quality_decision.failed_parameters:
                    reason_codes.append(f"QUALITY_FAILED_{fp.upper()}")
                human_reasons.append(
                    f"Water quality failed: {', '.join(quality_decision.failed_parameters)} violated buyer tolerance limits."
                )

            if quality_decision.unknown_parameters:
                is_unknown = True
                for up in quality_decision.unknown_parameters:
                    reason_codes.append(f"QUALITY_UNKNOWN_{up.upper()}")
                human_reasons.append(
                    f"Water quality evidence incomplete: {', '.join(quality_decision.unknown_parameters)} required measurement(s) missing."
                )
        else:
            reason_codes.append("QUALITY_ELIGIBLE")
            human_reasons.append(
                f"All {len(quality_decision.parameter_results)} evaluated water quality parameters satisfy buyer thresholds."
            )

        # Determine Final Status
        if is_ineligible:
            status = EligibilityStatus.INELIGIBLE
        elif is_unknown:
            status = EligibilityStatus.REQUIRES_FURTHER_TESTING
        else:
            status = EligibilityStatus.ELIGIBLE

        return CandidateEvaluation(
            candidate_id=candidate_id,
            listing_id=listing.id,
            facility_id=listing.facility_id,
            demand_id=demand.id,
            available_volume_kl=listing.available_volume_kl,
            requested_volume_kl=demand.required_volume_kl,
            water_grade=listing.water_grade,
            supplier_price_per_kl=listing.price_per_kl,
            distance_km=distance_km,
            is_distance_known=is_dist_known,
            eligibility_status=status,
            reason_codes=reason_codes,
            human_reasons=human_reasons,
            quality_decision=quality_decision,
        )
