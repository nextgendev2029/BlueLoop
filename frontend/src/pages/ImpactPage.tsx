import React, { useState, useEffect } from 'react';
import {
  Download,
  ShieldCheck,
  Leaf,
  DollarSign,
  RefreshCw,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { fetchImpactSummary } from '../services/impact';
import { ImpactSummaryResponse } from '../types/api';

export const ImpactPage: React.FC = () => {
  const [summary, setSummary] = useState<ImpactSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exported, setExported] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchImpactSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch environmental impact metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportLedger = () => {
    if (!summary) return;
    const ledgerExport = {
      export_version: '1.0.0',
      exported_at: new Date().toISOString(),
      platform: 'BlueLoop Water Reuse Intelligence',
      data_provenance: summary.is_synthetic ? 'SYNTHETIC_DEMONSTRATION' : 'PRODUCTION_VERIFIED',
      accounting_metrics: {
        potential_displacement_kl: summary.potential_displacement_kl,
        accepted_estimated_displacement_kl: summary.accepted_estimated_displacement_kl,
        delivery_confirmed_displacement_kl: summary.delivery_confirmed_displacement_kl,
        independently_verified_displacement_kl: summary.independently_verified_displacement_kl,
      },
      counts: {
        active_proposals_count: summary.total_active_proposals_count,
        accepted_allocations_count: summary.total_accepted_allocations_count,
        completed_deliveries_count: summary.total_completed_deliveries_count,
      },
      model_assumptions: {
        substitution_ratio: summary.freshwater_substitution_ratio_assumption,
        is_independently_verified: summary.is_independently_verified,
      },
      disclosures: summary.disclosures,
      disclaimer: summary.disclaimer,
    };

    const blob = new Blob([JSON.stringify(ledgerExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueloop-impact-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Freshwater Displacement & Environmental Impact Ledger
            </h2>
            <StatusBadge status="DEMO" label="Live REST Data" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Multi-tier auditable freshwater displacement metrics, substitution coefficients, and procurement delta formulas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#168779]' : 'text-[#69736B]'}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExportLedger}
            disabled={!summary}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            {exported ? 'Ledger Downloaded!' : 'Export Audit Ledger'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={loadData} />}

      {/* Loading or Impact Content */}
      {loading && !summary ? (
        <LoadingSpinner label="Compiling multi-tier environmental displacement summary..." />
      ) : summary ? (
        <div className="space-y-6">
          {/* 4-Tier Segregated Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tier 1 */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#ECEFEA]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">
                    Tier 1: Potential
                  </span>
                  <StatusBadge status="ESTIMATED" label="Algorithmic Match" size="xs" />
                </div>
                <div className="mt-3 text-3xl font-mono font-bold text-[#202A24]">
                  {summary.potential_displacement_kl.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#69736B]">kL</span>
                </div>
                <p className="mt-1 text-xs text-[#69736B] leading-relaxed">
                  Total virgin water displacement modeled across unconfirmed proposals currently in{' '}
                  <code className="font-mono text-[#202A24]">PROPOSED</code> state.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ECEFEA] text-[11px] text-[#69736B] font-mono">
                {summary.total_active_proposals_count} Active Proposals
              </div>
            </div>

            {/* Tier 2 */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#ECEFEA]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">
                    Tier 2: Accepted
                  </span>
                  <StatusBadge status="CONFIRMED" label="Agreed Contract" size="xs" />
                </div>
                <div className="mt-3 text-3xl font-mono font-bold text-[#174D3A]">
                  {summary.accepted_estimated_displacement_kl.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#69736B]">kL</span>
                </div>
                <p className="mt-1 text-xs text-[#69736B] leading-relaxed">
                  Displacement volume approved between buyers and suppliers in{' '}
                  <code className="font-mono text-[#174D3A]">ACCEPTED</code> state, awaiting delivery.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ECEFEA] text-[11px] text-[#69736B] font-mono">
                {summary.total_accepted_allocations_count} Accepted Allocations
              </div>
            </div>

            {/* Tier 3 */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#ECEFEA]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">
                    Tier 3: Confirmed
                  </span>
                  <StatusBadge status="CONFIRMED" label="Metered Intake" size="xs" />
                </div>
                <div className="mt-3 text-3xl font-mono font-bold text-[#168779]">
                  {summary.delivery_confirmed_displacement_kl.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#69736B]">kL</span>
                </div>
                <p className="mt-1 text-xs text-[#69736B] leading-relaxed">
                  Physically metered volume delivered under valid transfer custody in{' '}
                  <code className="font-mono text-[#168779]">ACCEPTED_CONFIRMED</code> state.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ECEFEA] text-[11px] text-[#69736B] font-mono">
                {summary.total_completed_deliveries_count} Metered Deliveries
              </div>
            </div>

            {/* Tier 4 */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#ECEFEA]">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">
                    Tier 4: Certified
                  </span>
                  <StatusBadge status="PENDING" label="Accreditation Pending" size="xs" />
                </div>
                <div className="mt-3 text-3xl font-mono font-bold text-[#8C978F]">
                  {summary.independently_verified_displacement_kl.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[#69736B]">kL</span>
                </div>
                <p className="mt-1 text-xs text-[#69736B] leading-relaxed">
                  Displacement backed by third-party ESG auditor certificate. No unverified claims allowed.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ECEFEA] text-[11px] text-[#8C978F] font-mono">
                Third-Party Telemetry Inactive
              </div>
            </div>
          </div>

          {/* Audited Mathematical Equations Panel */}
          <div className="rounded-lg border border-[#E0E5DF] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 font-semibold text-[#174D3A] pb-3 border-b border-[#ECEFEA]">
              <ShieldCheck className="h-4 w-4 text-[#168779]" />
              <h3 className="text-sm font-bold text-[#202A24]">
                Accounting Formulae, Coefficients & Governance Disclosures
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-2">
                <span className="font-semibold text-[#202A24] flex items-center gap-1.5 text-xs">
                  <Leaf className="h-4 w-4 text-[#174D3A]" /> Direct Freshwater Displacement Equation
                </span>
                <p className="font-mono text-xs text-[#174D3A] bg-white p-2 rounded border border-[#E0E5DF]">
                  Displacement_kL = Allocated_kL &times; Substitution_Ratio
                </p>
                <div className="text-[11px] text-[#69736B] space-y-1">
                  <p>
                    <strong>Modeled Ratio:</strong>{' '}
                    <span className="font-mono text-[#202A24]">
                      {summary.freshwater_substitution_ratio_assumption.toFixed(2)} kL virgin water / kL treated water
                    </span>
                  </p>
                  <p>
                    Applicable to closed-circuit evaporative cooling towers and boiler pre-treatment loops replacing municipal potable supply.
                  </p>
                </div>
              </div>

              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-2">
                <span className="font-semibold text-[#202A24] flex items-center gap-1.5 text-xs">
                  <DollarSign className="h-4 w-4 text-[#168779]" /> Delivered Procurement Delta Equation
                </span>
                <p className="font-mono text-xs text-[#168779] bg-white p-2 rounded border border-[#E0E5DF]">
                  Delivered_Cost = Supplier_Subtotal + (Dist_km &times; Rate &times; Vol_kL)
                </p>
                <div className="text-[11px] text-[#69736B] space-y-1">
                  <p>
                    <strong>Logistics Tariff Model:</strong>{' '}
                    <span className="font-mono text-[#202A24]">$0.015 / kL / km</span> (where GPS coordinates are verified)
                  </p>
                  <p>
                    When coordinates are absent, transport charges are marked strictly as <em>Unknown</em> rather than fabricating zero freight charges.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclosures and Notice */}
            <div className="rounded-lg border border-[#EBDCBA] bg-[#FAF6EC] p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#8A641B]">
                <Info className="h-4 w-4" />
                <span>Accounting Standards & Provenance Notice</span>
              </div>
              <p className="text-[11px] text-[#69736B] leading-relaxed">
                {summary.disclaimer}
              </p>
              {summary.disclosures.length > 0 && (
                <ul className="list-disc list-inside text-[11px] text-[#69736B] space-y-1 pt-1">
                  {summary.disclosures.map((disc, idx) => (
                    <li key={idx}>{disc}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
