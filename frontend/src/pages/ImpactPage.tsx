import React from 'react';
import { BarChart3, Download, ShieldCheck, Leaf, DollarSign } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const ImpactPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Freshwater Displacement & Economic Auditing
            </h2>
            <StatusBadge status="DEMO" label="Architecture Blueprint" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Audited virgin freshwater displaced, groundwater stress mitigation, and municipal tariff savings.
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#69736B] cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" /> Export Audit Ledger
          </button>
        </div>
      </div>

      {/* Structural Module Spec Card */}
      <div className="rounded-lg border border-dashed border-[#CBD3CA] bg-white p-10 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-[#202A24]">
          Freshwater Displacement & Economic Impact Ledger
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[#69736B] leading-relaxed">
          In Phase 2 & 3, this reporting module will compute the net environmental delta for participating
          buyers and suppliers. Impact numbers will derive exclusively from accepted delivery receipts,
          preventing arbitrarily inflated sustainability claims.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <StatusBadge status="DEMO" label="No Unverified Numbers Displayed" size="sm" />
          <StatusBadge status="CONFIRMED" label="Displacement Formula Codified" size="sm" />
        </div>
      </div>

      {/* Audited Mathematical Formulae Context */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 text-xs shadow-card space-y-3">
        <div className="flex items-center gap-2 font-semibold text-[#174D3A]">
          <ShieldCheck className="h-4 w-4 text-[#168779]" />
          <span>Accounting Formulae & Verification Standard</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-1">
            <span className="font-semibold text-[#202A24] flex items-center gap-1.5">
              <Leaf className="h-3.5 w-3.5 text-[#174D3A]" /> Direct Freshwater Displacement Equation
            </span>
            <p className="font-mono text-[11px] text-[#174D3A] pt-1">
              Freshwater_Displaced (kL) = Σ (Accepted_Delivery_Volume_kL × Displacement_Coeff)
            </p>
            <p className="text-[11px] text-[#69736B] leading-relaxed pt-1">
              Displacement coefficient equals 1.0 for closed-circuit applications replacing potable municipal
              groundwater supplies.
            </p>
          </div>

          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-1">
            <span className="font-semibold text-[#202A24] flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-[#168779]" /> Delivered Procurement Delta Equation
            </span>
            <p className="font-mono text-[11px] text-[#168779] pt-1">
              Net_Savings = (Tariff_Municipal - [Base_Price_ExWorks + Logistics_Cost_km]) × Volume_kL
            </p>
            <p className="text-[11px] text-[#69736B] leading-relaxed pt-1">
              Calculates net cost variance against regional commercial municipal tariffs (standard ₹/kL or $/kL).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
