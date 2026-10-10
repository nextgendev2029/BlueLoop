"""
Automated Unit Tests for BlueLoop Domain Models & Validation Rules
"""

from datetime import datetime, timezone
import pytest
from pydantic import ValidationError

from app.core.errors import InvalidConstraintError
from app.models.entities import (
    DemandRequest,
    Organisation,
    QualityLimits,
    SupplierFacility,
    SupplyListing,
    WaterQualityMeasurements,
)
from app.models.enums import (
    FacilityType,
    IntendedUse,
    OrgType,
    VerificationStatus,
    WaterGrade,
)


def test_valid_organisation_construction():
    org = Organisation(
        id="ORG-TEST-01",
        name="Test Clean Water Inc",
        org_type=OrgType.SUPPLIER,
        verification_status=VerificationStatus.VERIFIED_DEMO,
    )
    assert org.id == "ORG-TEST-01"
    assert org.name == "Test Clean Water Inc"
    assert org.is_synthetic is True


def test_valid_supplier_facility_construction():
    fac = SupplierFacility(
        id="FAC-TEST-01",
        org_id="ORG-TEST-01",
        name="Central CETP Facility",
        facility_type=FacilityType.CETP,
        city="Chennai",
        state="Tamil Nadu",
        latitude=13.0827,
        longitude=80.2707,
    )
    assert fac.id == "FAC-TEST-01"
    assert fac.city == "Chennai"
    assert fac.latitude == 13.0827


def test_invalid_latitude_raises_validation_error():
    with pytest.raises(ValidationError):
        SupplierFacility(
            id="FAC-INV-01",
            org_id="ORG-TEST-01",
            name="Invalid Lat Facility",
            facility_type=FacilityType.CETP,
            city="Chennai",
            state="Tamil Nadu",
            latitude=195.0,  # Invalid latitude (> 90)
            longitude=80.0,
        )


def test_supply_listing_volume_and_price_validation():
    now = datetime.now(timezone.utc)

    # Valid listing
    listing = SupplyListing(
        id="LIST-TEST-01",
        facility_id="FAC-TEST-01",
        name="Treated RO Permeate",
        water_grade=WaterGrade.RO_PERMEATE,
        available_volume_kl=1000.0,
        price_per_kl=0.85,
        available_from=now,
    )
    assert listing.available_volume_kl == 1000.0
    assert listing.price_per_kl == 0.85

    # Invalid volume <= 0
    with pytest.raises(ValidationError):
        SupplyListing(
            id="LIST-INV-01",
            facility_id="FAC-TEST-01",
            name="Zero Volume",
            water_grade=WaterGrade.RO_PERMEATE,
            available_volume_kl=0.0,
            price_per_kl=0.85,
            available_from=now,
        )

    # Negative price < 0
    with pytest.raises(ValidationError):
        SupplyListing(
            id="LIST-INV-02",
            facility_id="FAC-TEST-01",
            name="Negative Price",
            water_grade=WaterGrade.RO_PERMEATE,
            available_volume_kl=1000.0,
            price_per_kl=-1.50,
            available_from=now,
        )


def test_quality_limits_ph_range_validation():
    # Valid range
    limits = QualityLimits(min_ph=6.5, max_ph=8.5)
    assert limits.min_ph == 6.5
    assert limits.max_ph == 8.5

    # Equal min and max is acceptable
    limits_equal = QualityLimits(min_ph=7.0, max_ph=7.0)
    assert limits_equal.min_ph == 7.0

    # Invalid min_ph > max_ph raises InvalidConstraintError
    with pytest.raises(InvalidConstraintError) as exc_info:
        QualityLimits(min_ph=8.5, max_ph=6.5)
    assert "cannot be greater than max_ph" in str(exc_info.value)


def test_water_quality_measurements_unknown_handling():
    # Null values represent UNKNOWN, not zero
    measurements = WaterQualityMeasurements(
        ph=7.2,
        tds_mg_l=450.0,
        cod_mg_l=None,  # explicitly untested
    )
    assert measurements.ph == 7.2
    assert measurements.tds_mg_l == 450.0
    assert measurements.cod_mg_l is None  # UNKNOWN, not 0.0


def test_demand_request_validation():
    demand = DemandRequest(
        id="DEM-TEST-01",
        org_id="ORG-BUYER-01",
        facility_name="Cooling Complex",
        intended_use=IntendedUse.COOLING_TOWER,
        required_volume_kl=2500.0,
        quality_limits=QualityLimits(min_ph=6.5, max_ph=8.5, max_tds_mg_l=1000.0),
    )
    assert demand.required_volume_kl == 2500.0
    assert demand.quality_limits.max_tds_mg_l == 1000.0

    # Zero required volume raises error
    with pytest.raises(ValidationError):
        DemandRequest(
            id="DEM-INV-01",
            org_id="ORG-BUYER-01",
            facility_name="Zero Vol",
            intended_use=IntendedUse.COOLING_TOWER,
            required_volume_kl=0.0,
            quality_limits=QualityLimits(min_ph=6.5, max_ph=8.5),
        )
