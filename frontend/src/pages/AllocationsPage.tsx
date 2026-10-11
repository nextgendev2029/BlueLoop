import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, StatusType } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Modal } from '../components/common/Modal';
import {
  runAllocation,
  fetchAllocations,
  fetchAllocationById,
  acceptAllocationProposal,
  rejectAllocationProposal,
} from '../services/allocations';
import { fetchSupplies } from '../services/suppliers';
import { fetchDemands } from '../services/demands';
import {
  AllocationRunResponse,
  SupplyListing,
  DemandRequest,
} from '../types/api';

export const AllocationsPage: React.FC = () => {
  const { user } = useAuth();
  const [currentRun, setCurrentRun] = useState<AllocationRunResponse | null>(null);
  const [runsHistory, setRunsHistory] = useState<AllocationRunResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingRun, setSubmittingRun] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter/tab state
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<'accept' | 'reject' | null>(null);

  // Solver Configuration Params
  const [substitutionRatio, setSubstitutionRatio] = useState<number>(1.0);
  const [transportRate, setTransportRate] = useState<number>(0.015);
  const [selectedDemandIds, setSelectedDemandIds] = useState<string[]>([]);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);

  // Seed reference data for selector
  const [allSupplies, setAllSupplies] = useState<SupplyListing[]>([]);
  const [allDemands, setAllDemands] = useState<DemandRequest[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [historyRes, suppliesRes, demandsRes] = await Promise.all([
        fetchAllocations(20, 0),
        fetchSupplies(),
        fetchDemands(),
      ]);
      setRunsHistory(historyRes);
      setAllSupplies(suppliesRes.items);
      setAllDemands(demandsRes.items);

      if (historyRes.length > 0) {
        setCurrentRun(historyRes[0]);
      } else {
        // Execute initial default run if in-memory list is empty
        const initialRun = await runAllocation();
        setCurrentRun(initialRun);
        setRunsHistory([initialRun]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize allocation console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteSolver = async () => {
    setSubmittingRun(true);
    setError(null);
    try {
      const payload = {
        substitution_ratio: substitutionRatio,
        transport_rate_per_kl_km: transportRate,
        demand_ids: selectedDemandIds.length > 0 ? selectedDemandIds : undefined,
        listing_ids: selectedListingIds.length > 0 ? selectedListingIds : undefined,
      };
      const result = await runAllocation(payload);
      setCurrentRun(result);
      setRunsHistory((prev) => [result, ...prev]);
      setShowConfigModal(false);
      setActiveTab('current');
    } catch (err: any) {
      setError(err.message || 'Allocation solver execution failed.');
    } finally {
      setSubmittingRun(false);
    }
  };

  const handleAcceptProposal = async () => {
    if (!currentRun) return;
    setActionInProgress(true);
    try {
      const updated = await acceptAllocationProposal(currentRun.run_id);
      setCurrentRun(updated);
      setRunsHistory((prev) =>
        prev.map((r) => (r.run_id === updated.run_id ? updated : r))
      );
      setReviewModal(null);
    } catch (err: any) {
      setError(err.message || 'Failed to accept allocation proposal.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRejectProposal = async () => {
    if (!currentRun) return;
    setActionInProgress(true);
    try {
      const updated = await rejectAllocationProposal(currentRun.run_id);
      setCurrentRun(updated);
      setRunsHistory((prev) =>
        prev.map((r) => (r.run_id === updated.run_id ? updated : r))
      );
      setReviewModal(null);
    } catch (err: any) {
      setError(err.message || 'Failed to reject allocation proposal.');
    } finally {
      setActionInProgress(false);
    }
  };

  const loadPastRun = async (runId: string) => {
    setLoading(true);
    try {
      const run = await fetchAllocationById(runId);
      setCurrentRun(run);
      setActiveTab('current');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch historical run details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string): { type: StatusType; label: string } => {
    switch (status) {
      case 'ACCEPTED':
        return { type: 'CONFIRMED', label: 'Proposal Accepted' };
      case 'REJECTED':
        return { type: 'REJECTED', label: 'Proposal Rejected' };
      default:
        return { type: 'ESTIMATED', label: 'Proposed (Pending Review)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Bilateral Supply Allocation Engine & Console
            </h2>
            <StatusBadge status="CONFIRMED" label="Optimization Active" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Capacity-constrained multi-facility allocation solver matching effluent supplies with buyer intake demand.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading || submittingRun}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#168779]' : 'text-[#69736B]'}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            disabled={submittingRun}
            className="inline-flex items-center gap-1.5 rounded-md bg-water-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-water-700 transition-colors disabled:opacity-50"
          >
            {submittingRun ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Solving...
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" /> Execute Solver Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-[#ECEFEA] pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'current'
                ? 'bg-water-600 text-white shadow-xs'
                : 'text-[#69736B] hover:text-[#202A24]'
            }`}
          >
            Active Run Results {currentRun && `(${currentRun.run_id})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-water-600 text-white shadow-xs'
                : 'text-[#69736B] hover:text-[#202A24]'
            }`}
          >
            Run History ({runsHistory.length})
          </button>
        </div>

        <div className="text-[11px] text-[#69736B] hidden sm:block">
          Active Workspace • Real-Time Constrained Matching
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={loadData} />}

      {/* Main Content Area */}
      {loading && !currentRun ? (
        <LoadingSpinner label="Solving supply-demand allocation constraints..." />
      ) : activeTab === 'history' ? (
        /* History View */
        <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
          <div className="p-4 border-b border-[#ECEFEA] bg-[#FAFAF8] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#202A24]">Prior Allocation Proposals Ledger</span>
            <span className="text-[#69736B] font-mono">{runsHistory.length} Proposals Recorded</span>
          </div>
          <div className="divide-y divide-[#ECEFEA]">
            {runsHistory.map((run) => {
              const badge = getStatusBadge(run.status);
              return (
                <div
                  key={run.run_id}
                  className="p-4 hover:bg-[#FBFBFA] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#174D3A]">{run.run_id}</span>
                      <StatusBadge status={badge.type} label={badge.label} size="xs" />
                    </div>
                    <div className="text-[#69736B] text-[11px]">
                      Timestamp: {new Date(run.run_timestamp).toLocaleString()} • Solver:{' '}
                      {run.algorithm_info.strategy || 'Greedy Prioritization'}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-[11px]">
                    <div>
                      <span className="text-[#69736B] block">Allocated:</span>
                      <span className="font-mono font-bold text-[#202A24]">
                        {run.totals.total_allocated_volume_kl.toLocaleString()} kL
                      </span>
                    </div>
                    <div>
                      <span className="text-[#69736B] block">Fulfillment:</span>
                      <span className="font-mono font-semibold text-[#168779]">
                        {run.totals.overall_fulfillment_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[#69736B] block">Delivered Cost:</span>
                      <span className="font-mono text-[#202A24]">
                        {run.totals.total_delivered_cost
                          ? `$${run.totals.total_delivered_cost.toLocaleString()}`
                          : `$${run.totals.total_supplier_cost.toLocaleString()} ex-works`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadPastRun(run.run_id)}
                      className="rounded border border-[#E0E5DF] bg-[#F7F7F2] px-2.5 py-1 text-[11px] font-semibold text-[#174D3A] hover:bg-[#EDF6F1]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : currentRun ? (
        /* Active Run Details */
        <div className="space-y-6">
          {/* Run Summary Banner with Review Actions */}
          <div className="rounded-xl border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#ECEFEA]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold font-mono text-[#202A24]">
                    {currentRun.run_id}
                  </span>
                  <StatusBadge
                    status={getStatusBadge(currentRun.status).type}
                    label={getStatusBadge(currentRun.status).label}
                    size="sm"
                  />
                </div>
                <div className="text-[11px] text-[#69736B] mt-0.5">
                  Generated at {new Date(currentRun.run_timestamp).toLocaleString()} • Strategy:{' '}
                  {currentRun.algorithm_info.strategy}
                </div>
              </div>

              {/* Review Proposal Actions */}
              <div className="flex items-center gap-2">
                {currentRun.status === 'PROPOSED' ? (
                  user?.role === 'supplier' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                      <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span>Commercial Buyer approval required</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setReviewModal('accept')}
                        disabled={actionInProgress}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Accept Proposal
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewModal('reject')}
                        disabled={actionInProgress}
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#F4D1CE] bg-[#FDF3F2] px-3 py-1.5 text-xs font-semibold text-[#972B28] hover:bg-[#FCE8E6] transition-colors disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject Proposal
                      </button>
                    </>
                  )
                ) : (
                  <span className="text-xs text-[#69736B] italic font-mono">
                    Decision Committed ({currentRun.status})
                  </span>
                )}
              </div>
            </div>

            {/* Run Totals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
                <span className="text-[#69736B] text-[10px] uppercase block">Requested Volume</span>
                <span className="text-base font-mono font-bold text-[#202A24] mt-0.5 block">
                  {currentRun.totals.total_requested_volume_kl.toLocaleString()} kL
                </span>
                <span className="text-[10px] text-[#8C978F]">All evaluated demands</span>
              </div>
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
                <span className="text-[#69736B] text-[10px] uppercase block">Allocated Volume</span>
                <span className="text-base font-mono font-bold text-[#174D3A] mt-0.5 block">
                  {currentRun.totals.total_allocated_volume_kl.toLocaleString()} kL
                </span>
                <span className="text-[10px] text-[#168779] font-medium">
                  {currentRun.totals.overall_fulfillment_rate.toFixed(1)}% Satisfied
                </span>
              </div>
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
                <span className="text-[#69736B] text-[10px] uppercase block">Unfulfilled Demand</span>
                <span className="text-base font-mono font-bold text-[#972B28] mt-0.5 block">
                  {currentRun.totals.total_unfulfilled_volume_kl.toLocaleString()} kL
                </span>
                <span className="text-[10px] text-[#8C978F]">Capacity / Quality bounds</span>
              </div>
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
                <span className="text-[#69736B] text-[10px] uppercase block">Total Delivered Cost</span>
                <span className="text-base font-mono font-bold text-[#202A24] mt-0.5 block">
                  {currentRun.totals.total_delivered_cost
                    ? `$${currentRun.totals.total_delivered_cost.toLocaleString()}`
                    : `$${currentRun.totals.total_supplier_cost.toLocaleString()}`}
                </span>
                <span className="text-[10px] text-[#8C978F]">
                  {currentRun.totals.is_delivered_cost_fully_known
                    ? 'Ex-works + Freight'
                    : 'Supplier subtotal (no freight)'}
                </span>
              </div>
              <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
                <span className="text-[#69736B] text-[10px] uppercase block">Potential Displacement</span>
                <span className="text-base font-mono font-bold text-[#397FA3] mt-0.5 block">
                  {currentRun.totals.total_potential_displacement_kl.toLocaleString()} kL
                </span>
                <span className="text-[10px] text-[#8C978F]">Modeled Virgin Offset</span>
              </div>
            </div>
          </div>

          {/* Proposed Allocations Table */}
          <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
            <div className="p-4 border-b border-[#ECEFEA] bg-[#FAFAF8] flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#168779]" />
                <h3 className="font-bold text-[#202A24]">
                  Proposed Feasible Matchings ({currentRun.proposed_allocations.length})
                </h3>
              </div>
              <span className="text-[11px] text-[#69736B] font-mono">
                Linear capacity constraints satisfied without double-counting
              </span>
            </div>

            {currentRun.proposed_allocations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#69736B]">
                No candidate pairings met all feasibility and quality tolerance gates.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                      <th className="py-3 px-4">Candidate Pair</th>
                      <th className="py-3 px-4">Source & Grade</th>
                      <th className="py-3 px-4">Destination Intake</th>
                      <th className="py-3 px-4 text-right">Volume</th>
                      <th className="py-3 px-4 text-right">Haversine Dist</th>
                      <th className="py-3 px-4 text-right">Delivered Unit Cost</th>
                      <th className="py-3 px-4 text-right">Potential Offset</th>
                      <th className="py-3 px-4 text-right">Decision Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEFEA]">
                    {currentRun.proposed_allocations.map((alloc) => {
                      const isExpanded = expandedCandidateId === alloc.candidate_id;
                      return (
                        <React.Fragment key={alloc.candidate_id}>
                          <tr className="hover:bg-[#FBFBFA] transition-colors">
                            <td className="py-3 px-4 font-mono font-medium text-[#174D3A]">
                              {alloc.candidate_id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#202A24]">{alloc.listing_id}</div>
                              <div className="text-[11px] text-[#69736B]">
                                {alloc.water_grade.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-[#202A24]">{alloc.demand_id}</div>
                              <div className="text-[11px] text-[#69736B]">Commercial Intake</div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#174D3A]">
                              {alloc.allocated_volume_kl.toLocaleString()}{' '}
                              <span className="text-[10px] font-normal text-[#69736B]">kL</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-[#69736B]">
                              {alloc.cost_estimate.distance_km !== null && alloc.cost_estimate.distance_km !== undefined ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-[#168779]" />
                                  {alloc.cost_estimate.distance_km.toFixed(1)} km
                                </span>
                              ) : (
                                <span className="italic text-[#8C978F]">Unknown</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-medium text-[#202A24]">
                              {alloc.cost_estimate.delivered_cost_per_kl !== null && alloc.cost_estimate.delivered_cost_per_kl !== undefined
                                ? `$${alloc.cost_estimate.delivered_cost_per_kl.toFixed(2)}/kL`
                                : `$${alloc.cost_estimate.unit_supplier_price_per_kl.toFixed(2)}/kL ex-works`}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-[#397FA3]">
                              {alloc.impact_estimate.potential_freshwater_displacement_kl.toLocaleString()} kL
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCandidateId(isExpanded ? null : alloc.candidate_id)
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#397FA3] hover:text-[#286280] p-1 rounded hover:bg-[#EAF3F6]"
                              >
                                {isExpanded ? 'Hide Reasons' : 'Explain Match'}
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Decision Explanation Expandable Row */}
                          {isExpanded && (
                            <tr className="bg-[#F7F7F2]">
                              <td colSpan={8} className="p-4 border-t border-[#E0E5DF]">
                                <div className="space-y-3 text-xs">
                                  <div className="flex items-center gap-2 font-bold text-[#174D3A]">
                                    <ShieldCheck className="h-4 w-4 text-[#168779]" />
                                    <span>Decision Audit Reasons & Cost Breakdown</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded border border-[#E0E5DF] space-y-1">
                                      <span className="font-semibold text-[#202A24] block">
                                        Specification Decision Trail:
                                      </span>
                                      <ul className="list-disc list-inside space-y-1 text-[11px] text-[#69736B]">
                                        {alloc.decision_reasons.map((r, i) => (
                                          <li key={i}>{r}</li>
                                        ))}
                                      </ul>
                                      <div className="pt-2 flex flex-wrap gap-1">
                                        {alloc.reason_codes.map((code) => (
                                          <span
                                            key={code}
                                            className="font-mono text-[10px] bg-[#EDF6F1] text-[#174D3A] px-1.5 py-0.5 rounded border border-[#C2E0D0]"
                                          >
                                            {code}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="bg-white p-3 rounded border border-[#E0E5DF] space-y-1">
                                      <span className="font-semibold text-[#202A24] block">
                                        Accounting Components:
                                      </span>
                                      <div className="text-[11px] space-y-1 text-[#69736B]">
                                        <div className="flex justify-between">
                                          <span>Supplier Subtotal:</span>
                                          <span className="font-mono text-[#202A24]">
                                            ${alloc.cost_estimate.supplier_subtotal.toFixed(2)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Transport Logistics:</span>
                                          <span className="font-mono text-[#202A24]">
                                            {alloc.cost_estimate.is_transport_cost_known
                                              ? `$${alloc.cost_estimate.transport_subtotal?.toFixed(2)}`
                                              : 'Unknown (Freight not calculated)'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between border-t border-[#ECEFEA] pt-1 font-semibold text-[#174D3A]">
                                          <span>Total Delivered Cost:</span>
                                          <span className="font-mono">
                                            {alloc.cost_estimate.total_delivered_cost
                                              ? `$${alloc.cost_estimate.total_delivered_cost.toFixed(2)}`
                                              : `$${alloc.cost_estimate.supplier_subtotal.toFixed(2)} ex-works`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rejected Candidates Table */}
          {currentRun.rejected_candidates.length > 0 && (
            <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
              <div className="p-4 border-b border-[#ECEFEA] bg-[#FAFAF8] flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-[#972B28]" />
                  <h3 className="font-bold text-[#202A24]">
                    Excluded Candidate Pairings ({currentRun.rejected_candidates.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#69736B]">
                  Fail-closed safety filtering: excluded before linear solver
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                      <th className="py-2.5 px-4">Pairing ID</th>
                      <th className="py-2.5 px-4">Supply Listing</th>
                      <th className="py-2.5 px-4">Buyer Demand</th>
                      <th className="py-2.5 px-4">Eligibility Status</th>
                      <th className="py-2.5 px-4">Decision Rejection Reasons</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECEFEA]">
                    {currentRun.rejected_candidates.map((rej) => (
                      <tr key={rej.candidate_id} className="hover:bg-[#FDF3F2]/40 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-[#69736B]">
                          {rej.candidate_id}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#202A24]">{rej.listing_id}</td>
                        <td className="py-2.5 px-4 font-mono text-[#202A24]">{rej.demand_id}</td>
                        <td className="py-2.5 px-4">
                          <StatusBadge status="REJECTED" label={rej.eligibility_status} size="xs" />
                        </td>
                        <td className="py-2.5 px-4 text-[#972B28] text-[11px]">
                          {rej.human_reasons.join('; ')}
                          {rej.failed_quality_parameters.length > 0 && (
                            <div className="text-[10px] text-[#972B28] mt-0.5 font-mono">
                              Violated limits: {rej.failed_quality_parameters.join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fulfillment & Utilization Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demand Fulfillment */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card space-y-3">
              <h4 className="text-xs font-bold text-[#202A24] uppercase tracking-wider">
                Buyer Demand Fulfillment Accounting
              </h4>
              <div className="space-y-3">
                {currentRun.demand_fulfillment.map((dem) => (
                  <div key={dem.demand_id} className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#202A24]">
                        {dem.facility_name} ({dem.demand_id})
                      </span>
                      <span className="font-mono text-[#174D3A] font-semibold">
                        {dem.allocated_volume_kl.toLocaleString()} / {dem.required_volume_kl.toLocaleString()} kL ({dem.fulfillment_percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                      <div
                        className="h-full bg-[#174D3A] rounded-full transition-all"
                        style={{ width: `${Math.min(dem.fulfillment_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Utilization */}
            <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card space-y-3">
              <h4 className="text-xs font-bold text-[#202A24] uppercase tracking-wider">
                Effluent Supply Capacity Utilization
              </h4>
              <div className="space-y-3">
                {currentRun.supply_utilization.map((sup) => (
                  <div key={sup.listing_id} className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#202A24]">
                        {sup.listing_name} ({sup.listing_id})
                      </span>
                      <span className="font-mono text-[#168779] font-semibold">
                        {sup.allocated_volume_kl.toLocaleString()} / {sup.available_volume_kl.toLocaleString()} kL ({sup.utilization_percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                      <div
                        className="h-full bg-[#168779] rounded-full transition-all"
                        style={{ width: `${Math.min(sup.utilization_percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Solver Configuration Modal */}
      {showConfigModal && (
        <Modal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          title="Configure Bilateral Supply Allocation Run"
          subtitle="Set linear parameters and optional entity filter subsets"
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#202A24] block mb-1">
                  Freshwater Substitution Ratio (0.0 &ndash; 1.0)
                </label>
                <input
                  type="number"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={substitutionRatio}
                  onChange={(e) => setSubstitutionRatio(parseFloat(e.target.value) || 1.0)}
                  className="w-full rounded border border-[#E0E5DF] p-2 text-xs font-mono focus:border-[#174D3A] focus:outline-hidden"
                />
                <span className="text-[10px] text-[#69736B] mt-0.5 block">
                  Cubic meters of virgin freshwater displaced per kL treated water (1.0 = 100% offset).
                </span>
              </div>

              <div>
                <label className="font-semibold text-[#202A24] block mb-1">
                  Logistics Transport Tariff ($/kL/km)
                </label>
                <input
                  type="number"
                  min="0.0"
                  step="0.001"
                  value={transportRate}
                  onChange={(e) => setTransportRate(parseFloat(e.target.value) || 0.015)}
                  className="w-full rounded border border-[#E0E5DF] p-2 text-xs font-mono focus:border-[#174D3A] focus:outline-hidden"
                />
                <span className="text-[10px] text-[#69736B] mt-0.5 block">
                  Haversine distance freight tariff multiplier (standard $0.015/kL/km).
                </span>
              </div>
            </div>

            <div className="p-3 rounded border border-[#E0E5DF] bg-[#F7F7F2] space-y-3">
              <span className="font-semibold text-[#202A24] block">
                Targeted Allocation Subset (Optional):
              </span>
              <p className="text-[11px] text-[#69736B]">
                Leave unselected to run across all {allDemands.length} open buyer demands and {allSupplies.length} available supply listings. Click to toggle specific subsets.
              </p>

              <div>
                <span className="text-[11px] font-semibold text-[#202A24] block mb-1">
                  Demand Subset: {selectedDemandIds.length === 0 ? '(All Open)' : `(${selectedDemandIds.length} selected)`}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allDemands.map((d) => (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => {
                        setSelectedDemandIds((prev) =>
                          prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                        );
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                        selectedDemandIds.includes(d.id)
                          ? 'bg-[#174D3A] text-white border-[#174D3A]'
                          : 'bg-white text-[#202A24] border-[#E0E5DF] hover:bg-[#F0F2EE]'
                      }`}
                    >
                      {d.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-[#202A24] block mb-1">
                  Supply Subset: {selectedListingIds.length === 0 ? '(All Available)' : `(${selectedListingIds.length} selected)`}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allSupplies.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => {
                        setSelectedListingIds((prev) =>
                          prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                        );
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                        selectedListingIds.includes(s.id)
                          ? 'bg-[#168779] text-white border-[#168779]'
                          : 'bg-white text-[#202A24] border-[#E0E5DF] hover:bg-[#F0F2EE]'
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="rounded border border-[#E0E5DF] bg-[#F7F7F2] px-3.5 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSolver}
                disabled={submittingRun}
                className="rounded bg-[#174D3A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#10392B] disabled:opacity-50"
              >
                {submittingRun ? 'Executing Solver...' : 'Run Solver Now'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Accept / Reject Confirmation Modal */}
      {reviewModal && currentRun && (
        <Modal
          isOpen={!!reviewModal}
          onClose={() => setReviewModal(null)}
          title={reviewModal === 'accept' ? 'Accept Allocation Proposal' : 'Reject Allocation Proposal'}
          subtitle={`Run ID: ${currentRun.run_id}`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-[#202A24] leading-relaxed">
              {reviewModal === 'accept' ? (
                <>
                  Are you sure you want to <strong>ACCEPT</strong> this allocation proposal?
                  This action formally records an agreed allocation for{' '}
                  <strong className="font-mono text-[#174D3A]">
                    {currentRun.totals.total_allocated_volume_kl.toLocaleString()} kL
                  </strong>{' '}
                  and moves the environmental impact from <em>Potential</em> to{' '}
                  <em>Accepted Estimated Displacement</em>.
                </>
              ) : (
                <>
                  Are you sure you want to <strong>REJECT</strong> this allocation proposal?
                  This will mark the run as rejected and prevent its candidate pairings from being scheduled for delivery.
                </>
              )}
            </p>

            <div className="rounded border border-[#ECEFEA] bg-[#F7F7F2] p-3 text-[11px] text-[#69736B]">
              <strong>Audit Ledger Notice:</strong> This state transition creates an immutable{' '}
              <code className="font-mono text-[#202A24]">AuditEvent</code> entry in the repository.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="rounded border border-[#E0E5DF] bg-[#F7F7F2] px-3.5 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={reviewModal === 'accept' ? handleAcceptProposal : handleRejectProposal}
                disabled={actionInProgress}
                className={`rounded px-4 py-1.5 text-xs font-semibold text-white ${
                  reviewModal === 'accept'
                    ? 'bg-[#174D3A] hover:bg-[#10392B]'
                    : 'bg-[#972B28] hover:bg-[#7D2321]'
                } disabled:opacity-50`}
              >
                {actionInProgress
                  ? 'Committing...'
                  : reviewModal === 'accept'
                  ? 'Confirm Acceptance'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
