"""
BlueLoop Environmental Impact Estimation Component
Calculates potential freshwater displacement with explicit substitution ratio validation.
"""

from typing import List
from pydantic import BaseModel, ConfigDict, Field


from app.schemas.allocation import ImpactEstimate


class ImpactCalculator:
    """
    Computes audited freshwater displacement metrics.
    Rejects ratios outside [0.0, 1.0].
    """

    DEFAULT_SUBSTITUTION_RATIO: float = 1.0  # 1 kL treated water replaces 1 kL raw freshwater in closed-circuit cooling

    @classmethod
    def estimate(
        cls,
        volume_kl: float,
        substitution_ratio: float = 1.0,
        lifecycle_stage: str = "POTENTIAL_PROPOSED",
        application_context: str | None = None,
    ) -> ImpactEstimate:
        """
        Estimate potential freshwater displacement volume.

        Args:
            volume_kl: Volume allocated in kilolitres.
            substitution_ratio: Valid ratio between 0.0 and 1.0.
            lifecycle_stage: Integrity tracking label.
            application_context: Optional intake application description.
        """
        if volume_kl <= 0:
            raise ValueError(f"Allocated volume must be positive. Received: {volume_kl}")
        if not (0.0 <= substitution_ratio <= 1.0):
            raise ValueError(
                f"Freshwater substitution ratio must be between 0.0 and 1.0. Received: {substitution_ratio}"
            )

        displacement_kl = round(volume_kl * substitution_ratio, 2)

        assumptions = [
            f"Substitution ratio of {substitution_ratio:.2f} applied based on direct replacement of virgin freshwater intake.",
            "Metric represents POTENTIAL displacement from an allocation proposal; not yet confirmed by physical custody transfer.",
            "Carbon emissions abatement is intentionally omitted until verified logistics telemetry is recorded.",
        ]
        if application_context:
            assumptions.append(f"Application context: {application_context}")

        return ImpactEstimate(
            allocated_volume_kl=volume_kl,
            substitution_ratio=substitution_ratio,
            potential_freshwater_displacement_kl=displacement_kl,
            impact_lifecycle_stage=lifecycle_stage,
            assumptions=assumptions,
        )
