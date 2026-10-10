"""
BlueLoop Dedicated Procurement & Delivery Cost Calculation Service
Honest arithmetic distinguishing known supplier prices from estimated/unknown logistics.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


def round_curr(val: float | Decimal) -> float:
    """Rounds currency amounts to 2 decimal places using standard accounting rounding."""
    d = Decimal(str(val))
    return float(d.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


from app.schemas.allocation import CostEstimate


class CostCalculator:
    """
    Calculates procurement costs with strict distinction between verified
    ex-works charges and estimated logistics charges.
    """

    DEFAULT_ROAD_TANKER_RATE_PER_KL_KM: float = 0.015  # e.g., standard industrial logistics tariff

    @classmethod
    def calculate(
        cls,
        volume_kl: float,
        unit_price_per_kl: float,
        distance_km: Optional[float] = None,
        transport_rate_per_kl_km: Optional[float] = None,
    ) -> CostEstimate:
        """
        Calculate procurement and delivered costs.

        If distance or rate is unknown, transport cost is marked as unknown (None),
        and total_delivered_cost is NOT fabricated as zero.
        """
        if volume_kl <= 0:
            raise ValueError(f"Allocated volume must be positive. Received: {volume_kl}")
        if unit_price_per_kl < 0:
            raise ValueError(f"Unit price cannot be negative. Received: {unit_price_per_kl}")

        components: List[str] = []
        assumptions: List[str] = []

        # 1. Supplier Ex-Works Subtotal
        supplier_subtotal = round_curr(volume_kl * unit_price_per_kl)
        components.append(f"Water Procurement (Ex-Works): {volume_kl:,.1f} kL @ {unit_price_per_kl:.2f}/kL = {supplier_subtotal:,.2f}")

        # 2. Logistics & Transport Evaluation
        if distance_km is not None and transport_rate_per_kl_km is not None and distance_km >= 0 and transport_rate_per_kl_km >= 0:
            is_transport_cost_known = True
            unit_transport_cost = round_curr(distance_km * transport_rate_per_kl_km)
            transport_subtotal = round_curr(volume_kl * unit_transport_cost)
            total_delivered = round_curr(supplier_subtotal + transport_subtotal)
            delivered_cost_per_kl = round_curr(total_delivered / volume_kl)

            components.append(
                f"Logistics Transportation: {distance_km:.1f} km @ {transport_rate_per_kl_km:.4f}/kL/km = "
                f"{transport_subtotal:,.2f} ({unit_transport_cost:.2f}/kL)"
            )
            assumptions.append(
                f"Logistics tariff modeled at {transport_rate_per_kl_km:.4f} per kL-km based on dedicated transport."
            )
        else:
            is_transport_cost_known = False
            unit_transport_cost = None
            transport_subtotal = None
            total_delivered = None
            delivered_cost_per_kl = None

            missing_reasons = []
            if distance_km is None:
                missing_reasons.append("distance between facility and demand is unknown")
            if transport_rate_per_kl_km is None:
                missing_reasons.append("transport rate is unspecified")

            components.append(
                f"Logistics Transportation: UNKNOWN ({', '.join(missing_reasons)}). Delivery cost not added to subtotal."
            )
            assumptions.append(
                "Delivered cost cannot be computed with full certainty because logistics charges are unverified."
            )

        return CostEstimate(
            allocated_volume_kl=volume_kl,
            unit_supplier_price_per_kl=unit_price_per_kl,
            supplier_subtotal=supplier_subtotal,
            distance_km=distance_km,
            transport_rate_per_kl_km=transport_rate_per_kl_km,
            is_transport_cost_known=is_transport_cost_known,
            transport_subtotal=transport_subtotal,
            unit_transport_cost_per_kl=unit_transport_cost,
            total_delivered_cost=total_delivered,
            delivered_cost_per_kl=delivered_cost_per_kl,
            cost_components=components,
            assumptions=assumptions,
        )
