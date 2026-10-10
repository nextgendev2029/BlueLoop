"""
BlueLoop Geographic & Logistics Calculation Utilities
Deterministic Haversine distance calculation between industrial coordinates.
"""

import math
from typing import Optional


def haversine_distance_km(
    lat1: Optional[float],
    lon1: Optional[float],
    lat2: Optional[float],
    lon2: Optional[float],
) -> Optional[float]:
    """
    Calculate the great-circle distance between two points on the Earth
    using the Haversine formula.

    Returns:
        Distance in kilometres (float rounded to 2 decimal places),
        or None if any coordinate is missing.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    # Validate coordinate boundaries
    if not (-90.0 <= lat1 <= 90.0 and -90.0 <= lat2 <= 90.0):
        raise ValueError(f"Latitude must be between -90 and 90 degrees. Received: ({lat1}, {lat2})")
    if not (-180.0 <= lon1 <= 180.0 and -180.0 <= lon2 <= 180.0):
        raise ValueError(f"Longitude must be between -180 and 180 degrees. Received: ({lon1}, {lon2})")

    # Identical coordinates
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    earth_radius_km = 6371.0  # Mean radius of the Earth

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    # Clamp to handle potential floating point precision errors
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = earth_radius_km * c
    return round(distance, 2)


class GeoDistanceCalculator:
    """Class wrapper providing static geographic distance calculation."""

    @staticmethod
    def calculate_distance_km(
        lat1: Optional[float],
        lon1: Optional[float],
        lat2: Optional[float],
        lon2: Optional[float],
    ) -> Optional[float]:
        return haversine_distance_km(lat1, lon1, lat2, lon2)
