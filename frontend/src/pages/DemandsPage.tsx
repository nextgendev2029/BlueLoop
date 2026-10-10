import React from 'react';
import { FileSpreadsheet, Plus, Info } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const DemandsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Buyer Demand Requests & Intake Tolerances
            </h2>
            <StatusBadge status="DEMO" label="Architecture Blueprint" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Commercial and industrial water intake demands with strict quality tolerance constraints.
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3 py-1.5 text-xs font-semibold text-white opacity-60 cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" /> Submit Demand Request
          </button>
        </div>
      </div>

      {/* Structural Module Spec Card */}
      <div className="rounded-lg border border-dashed border-[#CBD3CA] bg-white p-10 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-[#202A24]">
          Demand Request & Tolerance Specification Module
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[#69736B] leading-relaxed">
          Commercial buyers (e.g. data center evaporative cooling towers, district HVAC loops, industrial boiler feeds,
          construction projects) will declare their required intake volumes and maximum permissible contaminant limits.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <StatusBadge status="DEMO" label="No Mock Demand Records Active" size="sm" />
          <StatusBadge status="CONFIRMED" label="Constraint Boundary Model Ready" size="sm" />
        </div>
      </div>

      {/* Industrial Application Matrix Context */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 text-xs shadow-card space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#174D3A]">
          <Info className="h-4 w-4 text-[#168779]" />
          <span>Planned Application Intake Categories</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Evaporative Cooling Towers</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              Low TDS (&lt; 1,500 mg/L) to prevent scale buildup; strict biological oxygen limits to prevent biofilm fouling.
            </span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Boiler Feed Water</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              High purity requirements; near-zero hardness, silica, and dissolved solids (&lt; 50 mg/L) prior to demineralization.
            </span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Construction & Secondary Use</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              Precast concrete batching, dust suppression, non-potable flushing (neutral pH 6.5–8.5, turbidity &lt; 5 NTU).
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
