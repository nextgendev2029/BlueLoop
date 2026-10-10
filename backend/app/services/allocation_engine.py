"""
BlueLoop Constrained Allocation Intelligence Engine
Transforms supplier listings and buyer demands into an explainable allocation proposal.
Enforces all hard capacity, quality, and distance constraints deterministically.
"""

from datetime import datetime, timezone
import uuid
from typing import Dict, List, Optional

from app.models.entities import DemandRequest, SupplierFacility, SupplyListing
from app.models.enums import EligibilityStatus
from app.schemas.allocation import (
    AllocationRunResponse,
    AllocationRunTotals,
    DemandFulfillmentStatus,
    ProposedAllocationItem,
    RejectedCandidateItem,
    SupplyUtilizationStatus,
)
from app.services.candidate import CandidateEvaluator
from app.services.cost import CostCalculator
from app.services.impact import ImpactCalculator


class AllocationEngine:
    """
    Deterministic Constrained Allocation Engine.
    Coordinates candidate generation, feasibility gates, competing demand resolution,
    cost computation, and auditable decision explanation.
    """

    ALGORITHM_NAME = "BlueLoop Deterministic Constrained Allocation Solver"
    ALGORITHM_VERSION = "1.0.0"

    DISCLAIMER_TEXT = (
        "BlueLoop Allocation Screening Tool Notice: Proposed allocations represent "
        "screened compatibility matches and mathematical volume sharing. They do not constitute "
        "binding legal contracts, regulatory water safety certification, or confirmed physical delivery."
    )

    def __init__(self, candidate_evaluator: Optional[CandidateEvaluator] = None):
        self._candidate_evaluator = candidate_evaluator or CandidateEvaluator()

    def run_allocation(
        self,
        listings: List[SupplyListing],
        demands: List[DemandRequest],
        facilities_map: Dict[str, SupplierFacility],
        substitution_ratio: float = 1.0,
        transport_rate_per_kl_km: Optional[float] = 0.015,
        run_id: Optional[str] = None,
    ) -> AllocationRunResponse:
        """
        Executes a deterministic allocation optimization run.

        Rules enforced:
        1. All hard quality, distance, and price constraints are evaluated first.
        2. Ineligible and unknown-quality pairs receive ZERO allocation.
        3. Total allocated per supply listing <= available_volume_kl (no double-counting).
        4. Total allocated per buyer demand <= required_volume_kl.
        5. Competing demands are prioritized by unit delivered cost, transport distance,
           and stable deterministic identifier ordering.
        """
        now = datetime.now(timezone.utc)
        resolved_run_id = run_id or f"RUN-{now.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

        # Step 1: Candidate Generation and Feasibility Evaluation
        eligible_candidates = []
        rejected_candidates: List[RejectedCandidateItem] = []

        for demand in demands:
            for listing in listings:
                fac = facilities_map.get(listing.facility_id)
                evaluation = self._candidate_evaluator.evaluate_pair(
                    listing=listing,
                    demand=demand,
                    facility=fac,
                )

                if evaluation.eligibility_status == EligibilityStatus.ELIGIBLE:
                    eligible_candidates.append(evaluation)
                else:
                    failed_q = (
                        evaluation.quality_decision.failed_parameters
                        if evaluation.quality_decision
                        else []
                    )
                    unknown_q = (
                        evaluation.quality_decision.unknown_parameters
                        if evaluation.quality_decision
                        else []
                    )
                    rejected_candidates.append(
                        RejectedCandidateItem(
                            candidate_id=evaluation.candidate_id,
                            listing_id=evaluation.listing_id,
                            demand_id=evaluation.demand_id,
                            eligibility_status=evaluation.eligibility_status,
                            reason_codes=evaluation.reason_codes,
                            human_reasons=evaluation.human_reasons,
                            failed_quality_parameters=failed_q,
                            unknown_quality_parameters=unknown_q,
                        )
                    )

        # Step 2: Deterministic Prioritization of Eligible Candidates
        def sort_key(cand):
            # 1. Estimated delivered cost (unit price + transport rate * distance)
            dist = cand.distance_km if cand.is_distance_known and cand.distance_km is not None else 0.0
            rate = transport_rate_per_kl_km if transport_rate_per_kl_km is not None else 0.0
            unit_cost = cand.supplier_price_per_kl + (dist * rate)

            # 2. Distance tie breaker (closer first)
            dist_key = cand.distance_km if cand.is_distance_known and cand.distance_km is not None else 999999.0

            # 3. Volume priority (larger batch sizes first to avoid fragmentation)
            vol_key = -cand.requested_volume_kl

            # 4. Deterministic stable tie-breaker
            return (round(unit_cost, 4), dist_key, vol_key, cand.candidate_id)

        sorted_eligible = sorted(eligible_candidates, key=sort_key)

        # Step 3: Constrained Allocation (No double-counting of supply or demand)
        remaining_supply = {listing.id: float(listing.available_volume_kl) for listing in listings}
        remaining_demand = {demand.id: float(demand.required_volume_kl) for demand in demands}

        supply_allocated = {listing.id: 0.0 for listing in listings}
        demand_allocated = {demand.id: 0.0 for demand in demands}

        proposed_allocations: List[ProposedAllocationItem] = []

        for cand in sorted_eligible:
            avail = remaining_supply.get(cand.listing_id, 0.0)
            needed = remaining_demand.get(cand.demand_id, 0.0)

            if avail > 0.0 and needed > 0.0:
                alloc_vol = round(min(avail, needed), 2)
                if alloc_vol > 0.0:
                    remaining_supply[cand.listing_id] = round(avail - alloc_vol, 2)
                    remaining_demand[cand.demand_id] = round(needed - alloc_vol, 2)

                    supply_allocated[cand.listing_id] = round(supply_allocated[cand.listing_id] + alloc_vol, 2)
                    demand_allocated[cand.demand_id] = round(demand_allocated[cand.demand_id] + alloc_vol, 2)

                    # Compute accurate cost and impact breakdowns
                    cost_est = CostCalculator.calculate(
                        volume_kl=alloc_vol,
                        unit_price_per_kl=cand.supplier_price_per_kl,
                        distance_km=cand.distance_km,
                        transport_rate_per_kl_km=transport_rate_per_kl_km,
                    )

                    impact_est = ImpactCalculator.estimate(
                        volume_kl=alloc_vol,
                        substitution_ratio=substitution_ratio,
                        lifecycle_stage="POTENTIAL_PROPOSED",
                    )

                    decision_reasons = [
                        "Water-quality screening passed: all required chemical and physical limits satisfied.",
                        f"Allocated {alloc_vol:,.1f} kL based on available supplier capacity and buyer intake demand.",
                        f"Ex-works price: {cand.supplier_price_per_kl:.2f}/kL.",
                    ]
                    if cand.is_distance_known and cand.distance_km is not None:
                        decision_reasons.append(
                            f"One-way transport distance: {cand.distance_km:.1f} km (within buyer limit)."
                        )
                    else:
                        decision_reasons.append("Logistics distance between facility and buyer is unverified.")

                    proposed_allocations.append(
                        ProposedAllocationItem(
                            candidate_id=cand.candidate_id,
                            listing_id=cand.listing_id,
                            facility_id=cand.facility_id,
                            demand_id=cand.demand_id,
                            water_grade=cand.water_grade,
                            allocated_volume_kl=alloc_vol,
                            cost_estimate=cost_est,
                            impact_estimate=impact_est,
                            decision_reasons=decision_reasons,
                            reason_codes=[
                                "QUALITY_ELIGIBLE",
                                "CAPACITY_CONSTRAINTS_SATISFIED",
                                "PRIORITY_COST_OPTIMIZED",
                            ],
                        )
                    )
            else:
                # Candidate was eligible, but capacity was exhausted by higher-priority pairings
                reasons = []
                codes = []
                if avail <= 0.0:
                    codes.append("SUPPLY_CAPACITY_EXHAUSTED")
                    reasons.append("Eligible supply capacity was exhausted by competing higher-priority buyer demands.")
                if needed <= 0.0:
                    codes.append("DEMAND_ALREADY_FULFILLED")
                    reasons.append("Buyer demand was already fully satisfied by other compatible supplier allocations.")

                rejected_candidates.append(
                    RejectedCandidateItem(
                        candidate_id=cand.candidate_id,
                        listing_id=cand.listing_id,
                        demand_id=cand.demand_id,
                        eligibility_status=EligibilityStatus.ELIGIBLE,  # Feasible, but unallocated due to capacity
                        reason_codes=codes,
                        human_reasons=reasons,
                        failed_quality_parameters=[],
                        unknown_quality_parameters=[],
                    )
                )

        # Step 4: Accounting Summaries for Demands and Supplies
        demand_status_list: List[DemandFulfillmentStatus] = []
        for demand in demands:
            alloc = demand_allocated.get(demand.id, 0.0)
            req = demand.required_volume_kl
            unfulfilled = max(0.0, round(req - alloc, 2))
            pct = round((alloc / req) * 100.0, 1) if req > 0 else 0.0
            demand_status_list.append(
                DemandFulfillmentStatus(
                    demand_id=demand.id,
                    facility_name=demand.facility_name,
                    required_volume_kl=req,
                    allocated_volume_kl=alloc,
                    unfulfilled_volume_kl=unfulfilled,
                    fulfillment_percentage=pct,
                )
            )

        supply_status_list: List[SupplyUtilizationStatus] = []
        for listing in listings:
            alloc = supply_allocated.get(listing.id, 0.0)
            avail = listing.available_volume_kl
            rem = max(0.0, round(avail - alloc, 2))
            pct = round((alloc / avail) * 100.0, 1) if avail > 0 else 0.0
            supply_status_list.append(
                SupplyUtilizationStatus(
                    listing_id=listing.id,
                    listing_name=listing.name,
                    available_volume_kl=avail,
                    allocated_volume_kl=alloc,
                    remaining_volume_kl=rem,
                    utilization_percentage=pct,
                )
            )

        # Step 5: Overall Run Totals
        total_requested = round(sum(d.required_volume_kl for d in demands), 2)
        total_available = round(sum(l.available_volume_kl for l in listings), 2)
        total_allocated = round(sum(p.allocated_volume_kl for p in proposed_allocations), 2)
        total_unfulfilled = max(0.0, round(total_requested - total_allocated, 2))
        overall_fulfillment = (
            round((total_allocated / total_requested) * 100.0, 1) if total_requested > 0 else 0.0
        )

        total_supplier_cost = round(
            sum(p.cost_estimate.supplier_subtotal for p in proposed_allocations), 2
        )
        is_delivered_cost_known = bool(
            proposed_allocations
            and all(p.cost_estimate.is_transport_cost_known for p in proposed_allocations)
        )
        total_delivered_cost = (
            round(sum(p.cost_estimate.total_delivered_cost for p in proposed_allocations if p.cost_estimate.total_delivered_cost is not None), 2)
            if is_delivered_cost_known
            else None
        )

        total_potential_displacement = round(
            sum(p.impact_estimate.potential_freshwater_displacement_kl for p in proposed_allocations),
            2,
        )

        assumptions = [
            f"Freshwater substitution ratio modeled at {substitution_ratio:.2f} per kL of treated water.",
            f"Logistics transport tariff modeled at {transport_rate_per_kl_km if transport_rate_per_kl_km is not None else 0.0:.4f}/kL-km where distances are known.",
            "Algorithm strictly excludes pairs violating quality constraints or with missing required laboratory evidence.",
            "Supply volumes are allocated under linear capacity constraints without double-counting.",
        ]

        totals = AllocationRunTotals(
            total_requested_volume_kl=total_requested,
            total_available_volume_kl=total_available,
            total_allocated_volume_kl=total_allocated,
            total_unfulfilled_volume_kl=total_unfulfilled,
            overall_fulfillment_rate=overall_fulfillment,
            total_supplier_cost=total_supplier_cost,
            total_delivered_cost=total_delivered_cost,
            is_delivered_cost_fully_known=is_delivered_cost_known,
            total_potential_displacement_kl=total_potential_displacement,
        )

        return AllocationRunResponse(
            run_id=resolved_run_id,
            run_timestamp=now,
            status="PROPOSED",
            algorithm_info={
                "name": self.ALGORITHM_NAME,
                "version": self.ALGORITHM_VERSION,
                "strategy": "Deterministic Constrained Prioritization (Lowest Unit Cost & Distance)",
                "limitations": (
                    "Greedy multi-pass capacity allocation with deterministic tie-breaking. "
                    "Guarantees exact feasibility and zero constraint violation; may differ from "
                    "complex multi-commodity integer programming optimum on cyclic networks."
                ),
            },
            totals=totals,
            proposed_allocations=proposed_allocations,
            rejected_candidates=rejected_candidates,
            demand_fulfillment=demand_status_list,
            supply_utilization=supply_status_list,
            assumptions=assumptions,
            disclaimer=self.DISCLAIMER_TEXT,
            is_synthetic=True,
        )
