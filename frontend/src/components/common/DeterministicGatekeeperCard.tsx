import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Check, Info } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface QualityRow {
  parameter: string;
  unit: string;
  candidateValue: number;
  buyerLimit: { min?: number; max?: number };
  status: 'PASS' | 'FAIL';
  marginText: string;
}

const sampleParameters: QualityRow[] = [
  {
    parameter: 'Hydrogen-Ion Concentration (pH)',
    unit: 'pH scale',
    candidateValue: 7.35,
    buyerLimit: { min: 6.5, max: 8.5 },
    status: 'PASS',
    marginText: '+0.85 above min, -1.15 below max (Optimal neutral)',
  },
  {
    parameter: 'Total Dissolved Solids (TDS)',
    unit: 'mg/L',
    candidateValue: 980,
    buyerLimit: { max: 1500 },
    status: 'PASS',
    marginText: '-520 mg/L safety buffer (34.7% below threshold)',
  },
  {
    parameter: 'Chemical Oxygen Demand (COD)',
    unit: 'mg/L',
    candidateValue: 38.0,
    buyerLimit: { max: 50.0 },
    status: 'PASS',
    marginText: '-12.0 mg/L safety buffer (24.0% below threshold)',
  },
  {
    parameter: 'Biochemical Oxygen Demand (BOD)',
    unit: 'mg/L',
    candidateValue: 8.5,
    buyerLimit: { max: 15.0 },
    status: 'PASS',
    marginText: '-6.5 mg/L safety buffer (43.3% below threshold)',
  },
  {
    parameter: 'Nephelometric Turbidity',
    unit: 'NTU',
    candidateValue: 1.4,
    buyerLimit: { max: 2.5 },
    status: 'PASS',
    marginText: '-1.1 NTU safety buffer (44.0% below threshold)',
  },
  {
    parameter: 'Total Suspended Solids (TSS)',
    unit: 'mg/L',
    candidateValue: 6.0,
    buyerLimit: { max: 10.0 },
    status: 'PASS',
    marginText: '-4.0 mg/L safety buffer (40.0% below threshold)',
  },
];

export const DeterministicGatekeeperCard: React.FC = () => {
  const [expandedTrace, setExpandedTrace] = useState(false);

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
            <StatusBadge status="CONFIRMED" label="Deterministic Evaluation: Pass" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-0.5">
            Evaluating candidate effluent stream against commercial cooling tower tolerance bounds.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpandedTrace(!expandedTrace)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
        >
          <Info className="h-3.5 w-3.5 text-[#168779]" />
          {expandedTrace ? 'Hide Audit Trace' : 'View Decision Audit Trace'}
          {expandedTrace ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Candidate Pair Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F7F7F2] p-3 rounded-md border border-[#E0E5DF]">
        <div>
          <span className="text-[#69736B] block">Evaluated Candidate Listing:</span>
          <span className="font-semibold text-[#202A24]">
            CETP Maraimalai Stream 01-A (Tertiary Polished)
          </span>
          <span className="text-[11px] text-[#69736B] block mt-0.5">
            Lab Certificate: <span className="font-mono text-[#174D3A]">NABL-CHEM-2026-0814</span>
          </span>
        </div>
        <div>
          <span className="text-[#69736B] block">Consumer Intake Specification:</span>
          <span className="font-semibold text-[#202A24]">
            Automotive Assembly Plant — HVAC Cooling Loop (Zone B)
          </span>
          <span className="text-[11px] text-[#69736B] block mt-0.5">
            Standard: <span className="font-mono text-[#174D3A]">CPCB Industrial Non-Potable Category II</span>
          </span>
        </div>
      </div>

      {/* Chemical & Physical Verification Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
              <th className="py-2.5 px-3">Quality Parameter</th>
              <th className="py-2.5 px-3">Sample Value</th>
              <th className="py-2.5 px-3">Buyer Threshold Limit</th>
              <th className="py-2.5 px-3">Compliance Margin</th>
              <th className="py-2.5 px-3 text-right">Gate Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECEFEA]">
            {sampleParameters.map((row) => (
              <tr key={row.parameter} className="hover:bg-[#FBFBFA] transition-colors">
                <td className="py-2.5 px-3 font-medium text-[#202A24]">
                  {row.parameter}
                </td>
                <td className="py-2.5 px-3 font-mono text-[#202A24]">
                  {row.candidateValue} <span className="text-[10px] text-[#69736B]">{row.unit}</span>
                </td>
                <td className="py-2.5 px-3 font-mono text-[#69736B]">
                  {row.buyerLimit.min !== undefined && `min ${row.buyerLimit.min} | `}
                  max {row.buyerLimit.max} {row.unit}
                </td>
                <td className="py-2.5 px-3 text-[11px] text-[#174D3A] font-medium">
                  {row.marginText}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#10392B] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
                    <Check className="h-3 w-3 text-[#168779]" /> PASS
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expandable Mathematical Audit Trace */}
      {expandedTrace && (
        <div className="mt-4 rounded-md border border-[#D9E8DF] bg-[#EDF6F1]/50 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#10392B]">
            <ShieldCheck className="h-4 w-4 text-[#168779]" />
            <span>Deterministic Solver Decision Trace #EV-80419</span>
          </div>
          <p className="text-[11px] text-[#174D3A] leading-relaxed">
            The verification algorithm evaluated 6 continuous chemical variables against the buyer-specified
            boundary constraints. Every tested parameter satisfies the criterion with a minimum safety margin of 24.0%
            (COD). No non-deterministic heuristic or probabilistic model was consulted in this determination.
          </p>
          <div className="pt-2 border-t border-[#D9E8DF] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#69736B] font-mono">
            <span>Algorithm: DeterministicThresholdGatekeeper v1.0</span>
            <span>Execution Time: 0.42 ms (Zero API Dependency)</span>
            <span>Audit Key: SHA256:7b1e8a9...</span>
          </div>
        </div>
      )}
    </div>
  );
};
