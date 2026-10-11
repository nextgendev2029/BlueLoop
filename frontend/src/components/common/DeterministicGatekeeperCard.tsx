import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Check, X, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { evaluateCompatibility } from '../../services/compatibility';
import { CompatibilityEvaluationResponse, ParameterEvaluationResult } from '../../types/api';

export const DeterministicGatekeeperCard: React.FC = () => {
  const [expandedTrace, setExpandedTrace] = useState(false);
  const [evaluation, setEvaluation] = useState<CompatibilityEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await evaluateCompatibility({
        listing_id: 'SYNTH-LIST-01',
        demand_id: 'SYNTH-DEM-01',
      });
      setEvaluation(result);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate compatibility from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, []);

  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-base font-semibold text-[#202A24]">
              Deterministic Quality Gatekeeper Inspector
            </h3>
            {evaluation?.is_eligible ? (
              <StatusBadge status="SCREENING_PASS" label="Screening Verdict: Eligible" size="xs" />
            ) : evaluation ? (
              <StatusBadge status="REJECTED" label="Screening Verdict: Ineligible" size="xs" />
            ) : (
              <StatusBadge status="DEMO" label="Connecting Engine..." size="xs" />
            )}
          </div>
          <p className="text-xs text-[#69736B] mt-0.5">
            Evaluating laboratory effluent analysis against buyer-specified tolerance boundary criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runEvaluation}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-2.5 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
            title="Re-run screening check"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#168779]' : 'text-[#69736B]'}`} />
            <span className="hidden sm:inline">Evaluate Live</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandedTrace(!expandedTrace)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
          >
            <Info className="h-3.5 w-3.5 text-[#168779]" />
            {expandedTrace ? 'Hide Decision Audit' : 'Inspect Decision Audit'}
            {expandedTrace ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Candidate Pair Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7F7F2] p-3 rounded-md border border-[#E0E5DF]">
        <div>
          <span className="text-[#69736B] block">Evaluated Candidate Listing:</span>
          <span className="font-semibold text-[#202A24]">
            SYNTH-LIST-01 — CETP Maraimalai Stream 01-A (Tertiary Polished)
          </span>
          <span className="text-[11px] text-[#69736B] block mt-0.5">
            Lab Certificate: <span className="font-mono text-[#174D3A]">SYNTH-CERT-01 (Synthetic Demonstration Record)</span>
          </span>
        </div>
        <div>
          <span className="text-[#69736B] block">Consumer Intake Specification:</span>
          <span className="font-semibold text-[#202A24]">
            SYNTH-DEM-01 — Precision Auto Assembly (Evaporative Cooling Tower)
          </span>
          <span className="text-[11px] text-[#69736B] block mt-0.5">
            Compliance Policy: <span className="font-mono text-[#397FA3]">Fail-Closed Strict Tolerance</span>
          </span>
        </div>
      </div>

      {/* Chemical & Physical Verification Table */}
      <div className="mt-4 overflow-x-auto">
        {loading && !evaluation ? (
          <div className="py-8 text-center text-xs text-[#69736B] flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#168779]" />
            Running deterministic compatibility check...
          </div>
        ) : error && !evaluation ? (
          <div className="p-4 rounded border border-[#F4D1CE] bg-[#FDF3F2] text-xs text-[#972B28]">
            {error}
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                <th className="py-2.5 px-3">Quality Parameter</th>
                <th className="py-2.5 px-3">Sample Value</th>
                <th className="py-2.5 px-3">Buyer Threshold Limit</th>
                <th className="py-2.5 px-3">Reason / Buffer Analysis</th>
                <th className="py-2.5 px-3 text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEFEA]">
              {evaluation?.parameter_results.map((row: ParameterEvaluationResult) => {
                const isPass = row.status === 'PASS';
                const isUnknown = row.status === 'UNKNOWN';
                return (
                  <tr key={row.parameter_name} className="hover:bg-[#FBFBFA] transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#202A24]">
                      {row.parameter_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#202A24]">
                      {row.measured_value !== null ? row.measured_value : '—'}{' '}
                      <span className="text-[10px] text-[#69736B]">{row.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#69736B]">
                      {row.buyer_min !== null && `min ${row.buyer_min} | `}
                      {row.buyer_max !== null ? `max ${row.buyer_max} ${row.unit}` : 'No max limit'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#69736B] max-w-xs">
                      {row.reason}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#10392B] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
                          <Check className="h-3 w-3 text-[#168779]" /> PASS
                        </span>
                      ) : isUnknown ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#8A641B] bg-[#FAF6EC] px-2 py-0.5 rounded border border-[#EBDCBA]">
                          <AlertTriangle className="h-3 w-3 text-[#C49537]" /> UNKNOWN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-[#972B28] bg-[#FDF3F2] px-2 py-0.5 rounded border border-[#F4D1CE]">
                          <X className="h-3 w-3 text-[#972B28]" /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Expandable Mathematical Audit Trace */}
      {expandedTrace && (
        <div className="mt-4 rounded-md border border-[#D9E8DF] bg-[#EDF6F1]/50 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#10392B]">
            <ShieldCheck className="h-4 w-4 text-[#168779]" />
            <span>Deterministic Quality Engine Decision Trace</span>
          </div>
          <p className="text-[11px] text-[#174D3A] leading-relaxed">
            {evaluation?.decision_summary || 'Evaluation summary ready.'}
          </p>
          <div className="text-[10px] text-[#69736B] leading-relaxed italic">
            {evaluation?.disclaimer}
          </div>
          <div className="pt-2 border-t border-[#D9E8DF] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#69736B] font-mono">
            <span>Algorithm: QualityCompatibilityService (Fail-Closed)</span>
            <span>Evaluated At: {evaluation?.evaluated_at || new Date().toISOString()}</span>
            <span>Synthetic Mode: {evaluation?.is_synthetic ? 'True' : 'False'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
