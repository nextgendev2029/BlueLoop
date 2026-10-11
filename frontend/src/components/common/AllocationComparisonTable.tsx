import React, { useState, useEffect } from 'react';
import { GitMerge, MapPin, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { fetchAllocations, runAllocation } from '../../services/allocations';
import { AllocationRunResponse, ProposedAllocationItem } from '../../types/api';

export const AllocationComparisonTable: React.FC = () => {
  const [latestRun, setLatestRun] = useState<AllocationRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const runs = await fetchAllocations(1, 0);
      if (runs.length > 0) {
        setLatestRun(runs[0]);
      } else {
        // Trigger a fresh default run if no prior runs exist in memory
        const newRun = await runAllocation();
        setLatestRun(newRun);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load allocation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllocations();
  }, []);

  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-base font-semibold text-[#202A24]">
              Candidate Allocation Ledger & Cost Matrix
            </h3>
            {latestRun ? (
              <StatusBadge
                status={latestRun.status === 'ACCEPTED' ? 'CONFIRMED' : 'ESTIMATED'}
                label={`Status: ${latestRun.status}`}
                size="xs"
              />
            ) : (
              <StatusBadge status="DEMO" label="Connecting Solver..." size="xs" />
            )}
          </div>
          <p className="text-xs text-[#69736B] mt-0.5">
            Deterministic constrained optimization results matching effluent supplies to commercial intake demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAllocations}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-2.5 py-1 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
            title="Refresh allocation proposals"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-[#168779]' : 'text-[#69736B]'}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/app/allocations"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#174D3A] hover:text-[#10392B]"
          >
            Open Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {loading && !latestRun ? (
        <div className="py-12 flex justify-center items-center gap-2 text-xs text-[#69736B]">
          <RefreshCw className="h-4 w-4 animate-spin text-[#168779]" />
          Loading deterministic allocation proposals...
        </div>
      ) : error && !latestRun ? (
        <div className="mt-4 p-4 rounded border border-[#F4D1CE] bg-[#FDF3F2] text-xs text-[#972B28]">
          {error}
        </div>
      ) : latestRun && latestRun.proposed_allocations.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#69736B]">
          No matching allocations found in the current run. Check buyer quality constraints.
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                <th className="py-2.5 px-3">Candidate ID</th>
                <th className="py-2.5 px-3">Source Listing</th>
                <th className="py-2.5 px-3">Buyer Demand ID</th>
                <th className="py-2.5 px-3 text-right">Volume (kL)</th>
                <th className="py-2.5 px-3 text-right">Haversine Distance</th>
                <th className="py-2.5 px-3 text-right">Delivered Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Potential Offset</th>
                <th className="py-2.5 px-3 text-center">Screening Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEFEA]">
              {latestRun?.proposed_allocations.map((item: ProposedAllocationItem) => (
                <tr key={item.candidate_id} className="hover:bg-[#FBFBFA] transition-colors group">
                  <td className="py-3 px-3 font-mono font-medium text-[#174D3A]">
                    {item.candidate_id}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#202A24]">{item.listing_id}</div>
                    <div className="text-[11px] text-[#69736B]">{item.water_grade.replace(/_/g, ' ')}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#202A24]">{item.demand_id}</div>
                    <div className="text-[11px] text-[#69736B]">Commercial Intake</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-[#202A24]">
                    {item.allocated_volume_kl.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#69736B]">
                    {item.cost_estimate.distance_km !== null && item.cost_estimate.distance_km !== undefined ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#168779]" />
                        {item.cost_estimate.distance_km.toFixed(1)} km
                      </span>
                    ) : (
                      <span className="text-[#8C978F] italic">Unknown</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#174D3A]">
                    {item.cost_estimate.delivered_cost_per_kl !== null && item.cost_estimate.delivered_cost_per_kl !== undefined ? (
                      `$${item.cost_estimate.delivered_cost_per_kl.toFixed(2)}/kL`
                    ) : (
                      `$${item.cost_estimate.unit_supplier_price_per_kl.toFixed(2)}/kL ex-works`
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-[#397FA3]">
                    {item.impact_estimate.potential_freshwater_displacement_kl.toLocaleString()} kL
                  </td>
                  <td className="py-3 px-3 text-center">
                    <StatusBadge
                      status="SCREENING_PASS"
                      label="Screening Passed"
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {latestRun && (
        <div className="mt-4 pt-3 border-t border-[#ECEFEA] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#69736B]">
          <span>
            Run <strong className="font-mono text-[#202A24]">{latestRun.run_id}</strong>: Total Allocated{' '}
            <strong className="text-[#174D3A] font-mono">{latestRun.totals.total_allocated_volume_kl.toLocaleString()} kL</strong>{' '}
            ({latestRun.totals.overall_fulfillment_rate.toFixed(1)}% Demand Fulfillment Rate).
          </span>
          <span className="font-mono text-[#8C978F]">Deterministic greedy prioritization</span>
        </div>
      )}
    </div>
  );
};
