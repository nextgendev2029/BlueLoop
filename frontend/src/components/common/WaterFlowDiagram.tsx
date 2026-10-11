import React from 'react';
import { CheckCircle2, ShieldCheck, Factory, Building2, Filter } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const WaterFlowDiagram: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#397FA3]">
              Circularity Pipeline
            </span>
            <StatusBadge status="CONFIRMED" label="Transfer Workflow" size="xs" />
          </div>
          <h3 className="text-base font-semibold text-[#202A24] mt-0.5">
            Deterministic Effluent-to-Intake Transfer Sequence
          </h3>
        </div>
        <div className="text-xs text-[#69736B] hidden sm:block font-mono">
          Rule-Based Screening Gates
        </div>
      </div>

      {/* Visual Flow Architecture */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1: Supplier Origin */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#D9E8DF] text-[#174D3A]">
                <Factory className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STEP 01
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Effluent Origin</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Industrial CETP / Municipal STP discharge streams published with available capacity.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Volume Tracking:</span>
              <span className="font-mono font-medium text-[#202A24]">Metered kL/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Grades:</span>
              <span className="font-medium text-[#174D3A]">RO, Tertiary, Recycled</span>
            </div>
          </div>
        </div>

        {/* Step 2: Quality Laboratory Certification */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#EAF3F6] text-[#286280]">
                <Filter className="h-4 w-4 text-[#397FA3]" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STEP 02
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Laboratory Evidence</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Laboratory certificates tested against codified physical and chemical standards.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Required Tests:</span>
              <span className="font-mono font-medium text-[#202A24]">pH, TDS, COD, BOD, TSS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Policy:</span>
              <span className="font-medium text-[#168779]">Fail-Closed on Missing</span>
            </div>
          </div>
        </div>

        {/* Step 3: BlueLoop Deterministic Gatekeeper */}
        <div className="rounded-md border-2 border-[#168779] bg-[#EBF5F3]/50 p-4 flex flex-col justify-between relative shadow-subtle">
          <div className="absolute -top-2.5 right-3">
            <span className="bg-[#168779] text-white text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
              Deterministic Gate
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
            <h4 className="text-xs font-bold text-[#10392B]">Boundary Screening</h4>
            <p className="text-[11px] text-[#174D3A] mt-1 leading-relaxed">
              Continuous parameter math comparing candidate values against buyer tolerance bounds.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#D0ECE7] text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 text-[#10392B] font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#168779]" />
              <span>Quantitative Safety Margins</span>
            </div>
            <div className="flex justify-between text-[#174D3A]">
              <span>Haversine Logistics:</span>
              <span className="font-mono">Distance Radius Verified</span>
            </div>
          </div>
        </div>

        {/* Step 4: Consumer Intake & Displacement */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded bg-[#D9E8DF] text-[#174D3A]">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-mono font-medium text-[#69736B] px-1.5 py-0.5 rounded bg-white border border-[#E0E5DF]">
                STEP 04
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#202A24]">Commercial Intake</h4>
            <p className="text-[11px] text-[#69736B] mt-1 leading-relaxed">
              Evaporative cooling, boiler feed pretreatment, precast concrete, and industrial HVAC.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E0E5DF] text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#69736B]">Accounting:</span>
              <span className="font-mono font-semibold text-[#174D3A]">Metered Displacement</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#69736B]">Custody:</span>
              <span className="font-mono text-[#397FA3]">5-Stage Transfer Chain</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ECEFEA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#69736B]">
        <span>
          <strong className="text-[#202A24]">Fail-Closed Safety Standard:</strong> Missing required lab parameters evaluate as UNKNOWN; candidate matches violating ANY threshold are automatically excluded.
        </span>
        <span className="font-mono text-[#8C978F]">Automated Compatibility Check</span>
      </div>
    </div>
  );
};
