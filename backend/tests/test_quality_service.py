"""
Automated Unit Tests for Deterministic Water Quality Compatibility Service
"""

from app.models.entities import QualityLimits, WaterQualityMeasurements
from app.models.enums import ParameterStatus
from app.services.quality import QualityCompatibilityService


def test_quality_service_all_parameters_pass():
    service = QualityCompatibilityService()

    measurements = WaterQualityMeasurements(
        ph=7.2,
        tds_mg_l=850.0,
        cod_mg_l=35.0,
        bod_mg_l=8.0,
        tss_mg_l=5.0,
        turbidity_ntu=1.2,
        heavy_metals_pass=True,
    )

    limits = QualityLimits(
        min_ph=6.5,
        max_ph=8.5,
        max_tds_mg_l=1200.0,
        max_cod_mg_l=50.0,
        max_bod_mg_l=15.0,
        max_tss_mg_l=10.0,
        max_turbidity_ntu=2.5,
        require_heavy_metals_pass=True,
        required_parameters=["ph", "tds_mg_l", "cod_mg_l", "bod_mg_l", "tss_mg_l", "turbidity_ntu"],
    )

    decision = service.evaluate(measurements, limits)

    assert decision.is_eligible is True
    assert len(decision.failed_parameters) == 0
    assert len(decision.unknown_parameters) == 0
    assert "Eligible: All" in decision.decision_summary
    assert decision.disclaimer is not None

    # Check individual parameter results
    tds_res = next(r for r in decision.parameter_results if "TDS" in r.parameter_name)
    assert tds_res.status == ParameterStatus.PASS
    assert tds_res.measured_value == 850.0
    assert "buffer: 350.0 mg/L" in tds_res.reason


def test_quality_service_parameter_violation():
    service = QualityCompatibilityService()

    measurements = WaterQualityMeasurements(
        ph=7.2,
        tds_mg_l=1600.0,  # Exceeds max 1200.0
        cod_mg_l=35.0,
        bod_mg_l=8.0,
        tss_mg_l=5.0,
        turbidity_ntu=1.2,
        heavy_metals_pass=True,
    )

    limits = QualityLimits(
        min_ph=6.5,
        max_ph=8.5,
        max_tds_mg_l=1200.0,
        max_cod_mg_l=50.0,
        required_parameters=["ph", "tds_mg_l", "cod_mg_l"],
    )

    decision = service.evaluate(measurements, limits)

    assert decision.is_eligible is False
    assert "tds_mg_l" in decision.failed_parameters
    assert "Ineligible: 1 parameter(s) violated" in decision.decision_summary

    tds_res = next(r for r in decision.parameter_results if "TDS" in r.parameter_name)
    assert tds_res.status == ParameterStatus.FAIL
    assert "exceeds maximum threshold 1200.0 mg/L by 400.0 mg/L" in tds_res.reason


def test_quality_service_ph_out_of_bounds():
    service = QualityCompatibilityService()

    # Case A: Too acidic
    acidic_sample = WaterQualityMeasurements(ph=5.8, tds_mg_l=500.0)
    limits = QualityLimits(min_ph=6.5, max_ph=8.5, required_parameters=["ph"])
    res_acidic = service.evaluate(acidic_sample, limits)
    assert res_acidic.is_eligible is False
    assert "ph" in res_acidic.failed_parameters

    # Case B: Too basic
    basic_sample = WaterQualityMeasurements(ph=9.2, tds_mg_l=500.0)
    res_basic = service.evaluate(basic_sample, limits)
    assert res_basic.is_eligible is False
    assert "ph" in res_basic.failed_parameters


def test_quality_service_missing_required_measurement_is_unknown():
    service = QualityCompatibilityService()

    # COD is None (untested/unknown), but buyer requires COD
    measurements = WaterQualityMeasurements(
        ph=7.0,
        tds_mg_l=500.0,
        cod_mg_l=None,
    )

    limits = QualityLimits(
        min_ph=6.5,
        max_ph=8.5,
        max_tds_mg_l=1000.0,
        max_cod_mg_l=50.0,
        required_parameters=["ph", "tds_mg_l", "cod_mg_l"],
    )

    decision = service.evaluate(measurements, limits)

    # Must be marked INELIGIBLE because a required constraint is unknown
    assert decision.is_eligible is False
    assert "cod_mg_l" in decision.unknown_parameters

    cod_res = next(r for r in decision.parameter_results if "COD" in r.parameter_name)
    assert cod_res.status == ParameterStatus.UNKNOWN
    assert cod_res.measured_value is None


def test_quality_service_missing_measurements_object():
    service = QualityCompatibilityService()

    limits = QualityLimits(
        min_ph=6.5,
        max_ph=8.5,
        max_tds_mg_l=1000.0,
        required_parameters=["ph", "tds_mg_l"],
    )

    decision = service.evaluate(None, limits)

    assert decision.is_eligible is False
    assert len(decision.unknown_parameters) == 2
    assert "Ineligible: No water quality measurements provided" in decision.decision_summary


def test_quality_service_heavy_metals_failure():
    service = QualityCompatibilityService()

    measurements = WaterQualityMeasurements(
        ph=7.0,
        tds_mg_l=500.0,
        heavy_metals_pass=False,  # Failed toxicology test
    )

    limits = QualityLimits(
        min_ph=6.5,
        max_ph=8.5,
        require_heavy_metals_pass=True,
        required_parameters=["ph"],
    )

    decision = service.evaluate(measurements, limits)

    assert decision.is_eligible is False
    assert "heavy_metals_pass" in decision.failed_parameters
