import React from 'react';
import { CheckCircle2, ShieldCheck, Factory, Building2, Filter } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const WaterFlowDiagram: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">
              Closed-Loop Architecture
            </span>
            <StatusBadge status="DEMO" label="Demonstration Flow Architecture" size="xs" />
          </div>
          <h3 className="text-base font-semibold text-[#202A24] mt-0.5">
            Deterministic Effluent-to-Intake Transfer Logic
          </h3>
        </div>
        <div className="text-xs text-[#69736B] hidden sm:block">
          Zero Black-Box Approximation
        </div>
      </div>

      {/* Visual Flow Architecture */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Stage 1: Supplier Origin */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#D9E8DF] text-[#174D3A]">
                <Factory className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STAGE 01
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Industrial Source</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Industrial CETP / Private Wastewater Treatment Plant discharge.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Sample Volume:</span>
              <span className="font-mono font-medium text-[#202A24]">3,500 kL/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Origin Grade:</span>
              <span className="font-medium text-[#174D3A]">Tertiary RO Permeate</span>
            </div>
          </div>
        </div>

        {/* Stage 2: Quality Laboratory Certification */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#D9E8DF] text-[#174D3A]">
                <Filter className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STAGE 02
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Parameter Profiling</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Codified lab report verification for chemical & physical criteria.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Mandatory Tests:</span>
              <span className="font-mono font-medium text-[#202A24]">pH, TDS, COD, BOD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Verification:</span>
              <span className="font-medium text-[#168779]">NABL Standard / Lab Key</span>
            </div>
          </div>
        </div>

        {/* Stage 3: BlueLoop Deterministic Gatekeeper */}
        <div className="rounded-md border-2 border-[#168779] bg-[#EBF5F3]/50 p-4 flex flex-col justify-between relative shadow-subtle">
          <div className="absolute -top-2.5 right-3">
            <span className="bg-[#168779] text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              BlueLoop Engine
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#168779] text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#10645A] px-1.5 py-0.5 rounded bg-white border border-[#D0ECE7]">
                GATEKEEPER
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#10392B]">Deterministic Check</h4>
            <p className="text-[11px] text-[#174D3A] mt-1 leading-relaxed">
              Mathematical constraint evaluation against buyer threshold limits.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D0ECE7] text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-[#10392B] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#168779]" />
              <span>Tolerance Compliant</span>
            </div>
            <div className="flex justify-between text-[#174D3A]">
              <span>Haversine Logistics:</span>
              <span className="font-mono">14.2 km (Dedicated)</span>
            </div>
          </div>
        </div>

        {/* Stage 4: Consumer Intake & Displacement */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#D9E8DF] text-[#174D3A]">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STAGE 04
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Commercial Intake</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Data center cooling towers, industrial boilers, construction batching.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Displacement:</span>
              <span className="font-mono font-semibold text-[#174D3A]">3,500 kL Virgin Water</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Cost Delta:</span>
              <span className="font-mono text-[#168779]">-28% vs Municipal Grid</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ECEFEA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#69736B]">
        <span>
          <strong className="text-[#202A24]">Engineering Logic Rule:</strong> If candidate effluent violates ANY parameter threshold, allocation fails automatically with complete decision reason.
        </span>
        <span className="font-mono text-[#8C978F]">Deterministic Pipeline v0.1.0</span>
      </div>
    </div>
  );
};
