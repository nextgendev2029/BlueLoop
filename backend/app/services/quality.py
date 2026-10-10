"""
BlueLoop Deterministic Water Quality Compatibility Service
Screening engine enforcing physical and chemical tolerance bounds.
Zero probabilistic/LLM guesswork: exact linear constraint evaluation.
"""

from typing import List, Optional
from app.models.entities import (
    CompatibilityDecision,
    ParameterEvaluationResult,
    QualityLimits,
    WaterQualityMeasurements,
)
from app.models.enums import ParameterStatus


class QualityCompatibilityService:
    """
    Deterministic service evaluating water quality compliance.
    Compares candidate effluent measurements against buyer tolerance thresholds.
    """

    DISCLAIMER_TEXT = (
        "BlueLoop Screening Tool Notice: This evaluation compares supplied laboratory "
        "measurements against buyer-specified boundaries. It does not certify regulatory "
        "compliance, plant process fitness, or guarantee water safety."
    )

    def evaluate(
        self,
        measurements: Optional[WaterQualityMeasurements],
        limits: QualityLimits,
    ) -> CompatibilityDecision:
        """
        Evaluate candidate water measurements against explicit buyer limits.

        Rules:
        1. Compare only parameters with known values and compatible units.
        2. Treat missing required measurements as UNKNOWN.
        3. A candidate is eligible ONLY when all evaluated required parameters pass.
        4. Ineligible if any parameter fails or any required parameter is unknown.
        """
        results: List[ParameterEvaluationResult] = []
        failed_params: List[str] = []
        unknown_params: List[str] = []

        # If measurements object is entirely missing
        if measurements is None:
            for req_param in limits.required_parameters:
                results.append(
                    ParameterEvaluationResult(
                        parameter_name=req_param,
                        measured_value=None,
                        unit="unknown",
                        buyer_min=limits.min_ph if req_param == "ph" else None,
                        buyer_max=self._get_buyer_max(req_param, limits),
                        status=ParameterStatus.UNKNOWN,
                        reason="No water quality evidence or laboratory measurements provided.",
                    )
                )
                unknown_params.append(req_param)

            return CompatibilityDecision(
                is_eligible=False,
                decision_summary="Ineligible: No water quality measurements provided for required parameters.",
                parameter_results=results,
                failed_parameters=[],
                unknown_parameters=unknown_params,
                disclaimer=self.DISCLAIMER_TEXT,
            )

        # 1. Hydrogen-Ion Concentration (pH)
        ph_res = self._evaluate_ph(measurements.ph, limits)
        results.append(ph_res)
        if ph_res.status == ParameterStatus.FAIL:
            failed_params.append("ph")
        elif ph_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("ph")

        # 2. Total Dissolved Solids (TDS)
        tds_res = self._evaluate_numeric_parameter(
            param_key="tds_mg_l",
            param_display_name="Total Dissolved Solids (TDS)",
            measured_val=measurements.tds_mg_l,
            buyer_max=limits.max_tds_mg_l,
            unit="mg/L",
            is_required="tds_mg_l" in limits.required_parameters,
        )
        results.append(tds_res)
        if tds_res.status == ParameterStatus.FAIL:
            failed_params.append("tds_mg_l")
        elif tds_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("tds_mg_l")

        # 3. Chemical Oxygen Demand (COD)
        cod_res = self._evaluate_numeric_parameter(
            param_key="cod_mg_l",
            param_display_name="Chemical Oxygen Demand (COD)",
            measured_val=measurements.cod_mg_l,
            buyer_max=limits.max_cod_mg_l,
            unit="mg/L",
            is_required="cod_mg_l" in limits.required_parameters,
        )
        results.append(cod_res)
        if cod_res.status == ParameterStatus.FAIL:
            failed_params.append("cod_mg_l")
        elif cod_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("cod_mg_l")

        # 4. Biochemical Oxygen Demand (BOD)
        bod_res = self._evaluate_numeric_parameter(
            param_key="bod_mg_l",
            param_display_name="Biochemical Oxygen Demand (BOD)",
            measured_val=measurements.bod_mg_l,
            buyer_max=limits.max_bod_mg_l,
            unit="mg/L",
            is_required="bod_mg_l" in limits.required_parameters,
        )
        results.append(bod_res)
        if bod_res.status == ParameterStatus.FAIL:
            failed_params.append("bod_mg_l")
        elif bod_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("bod_mg_l")

        # 5. Total Suspended Solids (TSS)
        tss_res = self._evaluate_numeric_parameter(
            param_key="tss_mg_l",
            param_display_name="Total Suspended Solids (TSS)",
            measured_val=measurements.tss_mg_l,
            buyer_max=limits.max_tss_mg_l,
            unit="mg/L",
            is_required="tss_mg_l" in limits.required_parameters,
        )
        results.append(tss_res)
        if tss_res.status == ParameterStatus.FAIL:
            failed_params.append("tss_mg_l")
        elif tss_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("tss_mg_l")

        # 6. Turbidity (NTU)
        turbidity_res = self._evaluate_numeric_parameter(
            param_key="turbidity_ntu",
            param_display_name="Turbidity",
            measured_val=measurements.turbidity_ntu,
            buyer_max=limits.max_turbidity_ntu,
            unit="NTU",
            is_required="turbidity_ntu" in limits.required_parameters,
        )
        results.append(turbidity_res)
        if turbidity_res.status == ParameterStatus.FAIL:
            failed_params.append("turbidity_ntu")
        elif turbidity_res.status == ParameterStatus.UNKNOWN:
            unknown_params.append("turbidity_ntu")

        # 7. Heavy Metals
        if limits.require_heavy_metals_pass:
            metals_res = self._evaluate_heavy_metals(measurements.heavy_metals_pass)
            results.append(metals_res)
            if metals_res.status == ParameterStatus.FAIL:
                failed_params.append("heavy_metals_pass")
            elif metals_res.status == ParameterStatus.UNKNOWN:
                unknown_params.append("heavy_metals_pass")

        # Formulate Decision Summary
        if failed_params:
            is_eligible = False
            summary = (
                f"Ineligible: {len(failed_params)} parameter(s) violated buyer tolerance limits: "
                f"{', '.join(failed_params)}."
            )
        elif unknown_params:
            is_eligible = False
            summary = (
                f"Ineligible: {len(unknown_params)} required parameter(s) have unknown/missing values: "
                f"{', '.join(unknown_params)}."
            )
        else:
            is_eligible = True
            passed_count = sum(1 for r in results if r.status == ParameterStatus.PASS)
            summary = (
                f"Eligible: All {passed_count} evaluated parameters satisfy buyer tolerance limits."
            )

        return CompatibilityDecision(
            is_eligible=is_eligible,
            decision_summary=summary,
            parameter_results=results,
            failed_parameters=failed_params,
            unknown_parameters=unknown_params,
            disclaimer=self.DISCLAIMER_TEXT,
        )

    def _evaluate_ph(
        self,
        measured_ph: Optional[float],
        limits: QualityLimits,
    ) -> ParameterEvaluationResult:
        is_required = "ph" in limits.required_parameters or (
            limits.min_ph is not None or limits.max_ph is not None
        )

        if measured_ph is None:
            if is_required:
                return ParameterEvaluationResult(
                    parameter_name="Hydrogen-Ion Concentration (pH)",
                    measured_value=None,
                    unit="pH scale",
                    buyer_min=limits.min_ph,
                    buyer_max=limits.max_ph,
                    status=ParameterStatus.UNKNOWN,
                    reason="pH measurement is missing/untested but required by buyer.",
                )
            return ParameterEvaluationResult(
                parameter_name="Hydrogen-Ion Concentration (pH)",
                measured_value=None,
                unit="pH scale",
                buyer_min=limits.min_ph,
                buyer_max=limits.max_ph,
                status=ParameterStatus.SKIPPED,
                reason="pH not constrained by buyer.",
            )

        # Check bounds
        if limits.min_ph is not None and measured_ph < limits.min_ph:
            delta = limits.min_ph - measured_ph
            return ParameterEvaluationResult(
                parameter_name="Hydrogen-Ion Concentration (pH)",
                measured_value=measured_ph,
                unit="pH scale",
                buyer_min=limits.min_ph,
                buyer_max=limits.max_ph,
                status=ParameterStatus.FAIL,
                reason=f"pH {measured_ph:.2f} is below minimum tolerance {limits.min_ph:.2f} by {delta:.2f} units.",
            )

        if limits.max_ph is not None and measured_ph > limits.max_ph:
            delta = measured_ph - limits.max_ph
            return ParameterEvaluationResult(
                parameter_name="Hydrogen-Ion Concentration (pH)",
                measured_value=measured_ph,
                unit="pH scale",
                buyer_min=limits.min_ph,
                buyer_max=limits.max_ph,
                status=ParameterStatus.FAIL,
                reason=f"pH {measured_ph:.2f} exceeds maximum tolerance {limits.max_ph:.2f} by {delta:.2f} units.",
            )

        range_desc = ""
        if limits.min_ph is not None and limits.max_ph is not None:
            range_desc = f" [{limits.min_ph:.1f} – {limits.max_ph:.1f}]"
        elif limits.max_ph is not None:
            range_desc = f" <= {limits.max_ph:.1f}"

        return ParameterEvaluationResult(
            parameter_name="Hydrogen-Ion Concentration (pH)",
            measured_value=measured_ph,
            unit="pH scale",
            buyer_min=limits.min_ph,
            buyer_max=limits.max_ph,
            status=ParameterStatus.PASS,
            reason=f"pH {measured_ph:.2f} satisfies required range{range_desc}.",
        )

    def _evaluate_numeric_parameter(
        self,
        param_key: str,
        param_display_name: str,
        measured_val: Optional[float],
        buyer_max: Optional[float],
        unit: str,
        is_required: bool,
    ) -> ParameterEvaluationResult:
        if measured_val is None:
            if is_required or buyer_max is not None:
                return ParameterEvaluationResult(
                    parameter_name=param_display_name,
                    measured_value=None,
                    unit=unit,
                    buyer_min=None,
                    buyer_max=buyer_max,
                    status=ParameterStatus.UNKNOWN,
                    reason=f"{param_display_name} measurement is missing/untested but is required.",
                )
            return ParameterEvaluationResult(
                parameter_name=param_display_name,
                measured_value=None,
                unit=unit,
                buyer_min=None,
                buyer_max=buyer_max,
                status=ParameterStatus.SKIPPED,
                reason=f"{param_display_name} not constrained by buyer.",
            )

        # Has value and buyer set limit
        if buyer_max is not None:
            if measured_val > buyer_max:
                excess = measured_val - buyer_max
                return ParameterEvaluationResult(
                    parameter_name=param_display_name,
                    measured_value=measured_val,
                    unit=unit,
                    buyer_min=None,
                    buyer_max=buyer_max,
                    status=ParameterStatus.FAIL,
                    reason=(
                        f"{param_display_name} of {measured_val:.1f} {unit} exceeds "
                        f"maximum threshold {buyer_max:.1f} {unit} by {excess:.1f} {unit}."
                    ),
                )
            margin = buyer_max - measured_val
            pct_margin = (margin / buyer_max) * 100.0 if buyer_max > 0 else 0.0
            return ParameterEvaluationResult(
                parameter_name=param_display_name,
                measured_value=measured_val,
                unit=unit,
                buyer_min=None,
                buyer_max=buyer_max,
                status=ParameterStatus.PASS,
                reason=(
                    f"{param_display_name} of {measured_val:.1f} {unit} satisfies threshold "
                    f"<= {buyer_max:.1f} {unit} (buffer: {margin:.1f} {unit}, {pct_margin:.1f}% safety margin)."
                ),
            )

        # Has value, no buyer limit
        return ParameterEvaluationResult(
            parameter_name=param_display_name,
            measured_value=measured_val,
            unit=unit,
            buyer_min=None,
            buyer_max=None,
            status=ParameterStatus.PASS,
            reason=f"{param_display_name} reported as {measured_val:.1f} {unit}; no ceiling enforced.",
        )

    def _evaluate_heavy_metals(
        self,
        heavy_metals_pass: Optional[bool],
    ) -> ParameterEvaluationResult:
        if heavy_metals_pass is None:
            return ParameterEvaluationResult(
                parameter_name="Toxic Heavy Metals Certification",
                measured_value=None,
                unit="status",
                buyer_min=None,
                buyer_max=None,
                status=ParameterStatus.UNKNOWN,
                reason="Heavy metals toxicology test report is missing.",
            )

        if not heavy_metals_pass:
            return ParameterEvaluationResult(
                parameter_name="Toxic Heavy Metals Certification",
                measured_value=0.0,
                unit="status",
                buyer_min=None,
                buyer_max=None,
                status=ParameterStatus.FAIL,
                reason="Heavy metals toxicology test report indicates parameter exceedance.",
            )

        return ParameterEvaluationResult(
            parameter_name="Toxic Heavy Metals Certification",
            measured_value=1.0,
            unit="status",
            buyer_min=None,
            buyer_max=None,
            status=ParameterStatus.PASS,
            reason="Heavy metals toxicology verified compliant with discharge standards.",
        )

    def _get_buyer_max(self, param_key: str, limits: QualityLimits) -> Optional[float]:
        mapping = {
            "tds_mg_l": limits.max_tds_mg_l,
            "cod_mg_l": limits.max_cod_mg_l,
            "bod_mg_l": limits.max_bod_mg_l,
            "tss_mg_l": limits.max_tss_mg_l,
            "turbidity_ntu": limits.max_turbidity_ntu,
        }
        return mapping.get(param_key)
