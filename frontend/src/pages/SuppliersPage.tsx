import React from 'react';
import { Factory, Plus, Filter, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const SuppliersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Treated Water Suppliers Directory
            </h2>
            <StatusBadge status="DEMO" label="Architecture Blueprint" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Registered industrial Common Effluent Treatment Plants (CETPs) and municipal tertiary treatment facilities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#69736B] cursor-not-allowed"
          >
            <Filter className="h-3.5 w-3.5" /> Filter Parameters
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3 py-1.5 text-xs font-semibold text-white opacity-60 cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" /> Register Supplier
          </button>
        </div>
      </div>

      {/* Structural Module Spec Card */}
      <div className="rounded-lg border border-dashed border-[#CBD3CA] bg-white p-10 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
          <Factory className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-[#202A24]">
          Supplier Catalog & Water Quality Registry Module
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[#69736B] leading-relaxed">
          In subsequent implementation phases, effluent dischargers will publish daily available discharge
          capacities (kL/day), treatment processes, and verified laboratory reports. No mock suppliers are
          rendered at this initialisation stage to preserve engineering integrity.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <StatusBadge status="DEMO" label="Schema: docs/data-model.md" size="sm" />
          <StatusBadge status="CONFIRMED" label="NABL Standard Fields Defined" size="sm" />
        </div>
      </div>

      {/* Required Quality Data Attributes Context */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 text-xs shadow-card space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#174D3A]">
          <ShieldCheck className="h-4 w-4 text-[#168779]" />
          <span>Mandatory Verification Profile Specifications</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Volumetric & Operational</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              Discharge flow (kL/day), batch continuity, geographic coordinates, and dedicated pipeline / tanker loading bay readiness.
            </span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Chemical Thresholds</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              pH range, Total Dissolved Solids (TDS mg/L), Chemical Oxygen Demand (COD mg/L), and Biochemical Oxygen Demand (BOD mg/L).
            </span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Physical & Toxicological</span>
            <span className="text-[11px] text-[#69736B] block mt-1">
              Total Suspended Solids (TSS), Nephelometric Turbidity (NTU), and heavy metal compliance verification against CPCB thresholds.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
