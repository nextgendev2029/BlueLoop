import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge, StatusType } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Modal } from '../components/common/Modal';
import {
  fetchDeliveries,
  createDelivery,
  updateDeliveryStatus,
} from '../services/deliveries';
import { fetchSupplies } from '../services/suppliers';
import { fetchDemands } from '../services/demands';
import {
  DeliveryRecord,
  DeliveryLifecycleStatus,
  DeliveryMode,
  SupplyListing,
  DemandRequest,
} from '../types/api';

const LIFECYCLE_STAGES: { key: DeliveryLifecycleStatus; label: string; desc: string }[] = [
  { key: 'SCHEDULED', label: 'Scheduled', desc: 'Allocation Approved' },
  { key: 'DISPATCHED', label: 'Dispatched', desc: 'Terminal Gate Departure' },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Conveyance In Motion' },
  { key: 'DELIVERED_SAMPLE_PENDING', label: 'Sample Pending', desc: 'Receiver Gate Intake' },
  { key: 'ACCEPTED_CONFIRMED', label: 'Accepted Confirmed', desc: 'Displacement Credited' },
];

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [transitionDelivery, setTransitionDelivery] = useState<DeliveryRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for scheduling
  const [suppliesList, setSuppliesList] = useState<SupplyListing[]>([]);
  const [demandsList, setDemandsList] = useState<DemandRequest[]>([]);
  const [formListingId, setFormListingId] = useState('');
  const [formDemandId, setFormDemandId] = useState('');
  const [formVolume, setFormVolume] = useState<number>(500);
  const [formMode, setFormMode] = useState<DeliveryMode>('DEDICATED_TANKER');

  // Form states for status transition
  const [transitionStatus, setTransitionStatus] = useState<DeliveryLifecycleStatus>('DISPATCHED');
  const [intakeVolume, setIntakeVolume] = useState<number | undefined>(undefined);
  const [transitionNotes, setTransitionNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deliveriesRes, suppliesRes, demandsRes] = await Promise.all([
        fetchDeliveries(),
        fetchSupplies(),
        fetchDemands(),
      ]);
      setDeliveries(deliveriesRes.items);
      setSuppliesList(suppliesRes.items);
      setDemandsList(demandsRes.items);
      if (suppliesRes.items.length > 0) setFormListingId(suppliesRes.items[0].id);
      if (demandsRes.items.length > 0) setFormDemandId(demandsRes.items[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load physical delivery records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formListingId || !formDemandId || formVolume <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const newDelivery = await createDelivery({
        listing_id: formListingId,
        demand_id: formDemandId,
        dispatched_volume_kl: formVolume,
        scheduled_date: new Date().toISOString(),
        delivery_mode: formMode,
      });
      setDeliveries((prev) => [newDelivery, ...prev]);
      setScheduleModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule delivery dispatch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTransition = (del: DeliveryRecord) => {
    setTransitionDelivery(del);
    // Determine next sequential lifecycle status
    let nextStatus: DeliveryLifecycleStatus = 'DISPATCHED';
    if (del.lifecycle_status === 'SCHEDULED') nextStatus = 'DISPATCHED';
    else if (del.lifecycle_status === 'DISPATCHED') nextStatus = 'IN_TRANSIT';
    else if (del.lifecycle_status === 'IN_TRANSIT') nextStatus = 'DELIVERED_SAMPLE_PENDING';
    else if (del.lifecycle_status === 'DELIVERED_SAMPLE_PENDING') nextStatus = 'ACCEPTED_CONFIRMED';
    setTransitionStatus(nextStatus);
    setIntakeVolume(del.dispatched_volume_kl);
    setTransitionNotes('');
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionDelivery) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateDeliveryStatus(transitionDelivery.id, {
        lifecycle_status: transitionStatus,
        delivered_volume_kl: intakeVolume,
        notes: transitionNotes || undefined,
      });
      setDeliveries((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setTransitionDelivery(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update delivery custody status.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.listing_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.demand_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'ALL' || d.lifecycle_status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: DeliveryLifecycleStatus): { type: StatusType; label: string } => {
    switch (status) {
      case 'ACCEPTED_CONFIRMED':
        return { type: 'CONFIRMED', label: 'Accepted Confirmed' };
      case 'REJECTED_QUALITY_FAILURE':
        return { type: 'REJECTED', label: 'Quality Rejected' };
      case 'DELIVERED_SAMPLE_PENDING':
        return { type: 'PENDING', label: 'Sample Testing' };
      case 'IN_TRANSIT':
        return { type: 'RIVER', label: 'In Transit' };
      case 'DISPATCHED':
        return { type: 'ACTIVE', label: 'Dispatched' };
      default:
        return { type: 'ESTIMATED', label: 'Scheduled' };
    }
  };

  const getStageIndex = (status: DeliveryLifecycleStatus): number => {
    switch (status) {
      case 'SCHEDULED':
        return 0;
      case 'DISPATCHED':
        return 1;
      case 'IN_TRANSIT':
        return 2;
      case 'DELIVERED_SAMPLE_PENDING':
        return 3;
      case 'ACCEPTED_CONFIRMED':
        return 4;
      default:
        return -1;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Delivery Logistics & Physical Custody Tracking
            </h2>
            <StatusBadge status="DEMO" label="Live REST Data" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Tracking batch dispatches, dedicated pipeline flow meters, and physical custody transfers.
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
            onClick={() => setScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Schedule Delivery
          </button>
        </div>
      </div>

      {/* 5-Stage Custody Lifecycle Visual Banner */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 text-xs shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#ECEFEA]">
          <div className="flex items-center gap-2 font-semibold text-[#174D3A]">
            <ShieldCheck className="h-4 w-4 text-[#168779]" />
            <span>Chain-of-Custody Lifecycle Pipeline</span>
          </div>
          <span className="text-[11px] text-[#69736B]">
            Only deliveries in <strong className="text-[#174D3A]">Accepted Confirmed</strong> state credit freshwater displacement
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {LIFECYCLE_STAGES.map((st, idx) => (
            <div
              key={st.key}
              className={`rounded border p-3 text-center transition-colors ${
                idx === 4
                  ? 'bg-[#EDF6F1] border-[#C2E0D0] text-[#174D3A]'
                  : 'bg-[#F7F7F2] border-[#E0E5DF] text-[#202A24]'
              }`}
            >
              <span className="font-mono text-[10px] text-slate-500 block">STEP 0{idx + 1}</span>
              <span className="font-semibold text-xs block mt-1">{st.label}</span>
              <span className="text-[10px] text-[#69736B] block mt-0.5">{st.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative min-w-[240px] max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8C978F]" />
          <input
            type="text"
            placeholder="Search delivery, listing, or demand ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#E0E5DF] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202A24] placeholder-[#8C978F] focus:border-[#174D3A] focus:outline-hidden"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-md border border-[#E0E5DF] bg-white px-2.5 py-1.5 text-xs text-[#202A24] focus:border-[#174D3A] focus:outline-hidden"
        >
          <option value="ALL">All Custody States ({deliveries.length})</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED_SAMPLE_PENDING">Sample Pending</option>
          <option value="ACCEPTED_CONFIRMED">Accepted Confirmed</option>
          <option value="REJECTED_QUALITY_FAILURE">Quality Rejected</option>
        </select>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={loadData} />}

      {/* Loading or Deliveries Table */}
      {loading ? (
        <LoadingSpinner label="Fetching delivery records from BlueLoop API..." />
      ) : filteredDeliveries.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No Delivery Records Found"
          description={
            deliveries.length === 0
              ? 'No physical deliveries have entered the system yet. Deliveries originate when an accepted allocation is scheduled for transport dispatch.'
              : 'No delivery records match the specified search or filter criteria.'
          }
          actionLabel={deliveries.length === 0 ? 'Schedule First Dispatch' : 'Clear Filters'}
          onAction={() => {
            if (deliveries.length === 0) setScheduleModalOpen(true);
            else {
              setSearchQuery('');
              setSelectedStatus('ALL');
            }
          }}
        />
      ) : (
        <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                  <th className="py-3 px-4">Delivery Ref</th>
                  <th className="py-3 px-4">Origin & Destination</th>
                  <th className="py-3 px-4">Conveyance Mode</th>
                  <th className="py-3 px-4 text-right">Dispatched Vol</th>
                  <th className="py-3 px-4 text-right">Metered Intake</th>
                  <th className="py-3 px-4 text-center">Lifecycle Status</th>
                  <th className="py-3 px-4 text-center">Lifecycle Stage</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEFEA]">
                {filteredDeliveries.map((del) => {
                  const statusBadge = getStatusBadge(del.lifecycle_status);
                  const stageIndex = getStageIndex(del.lifecycle_status);
                  const isTerminal =
                    del.lifecycle_status === 'ACCEPTED_CONFIRMED' ||
                    del.lifecycle_status === 'REJECTED_QUALITY_FAILURE';

                  return (
                    <tr key={del.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#174D3A]">
                        {del.id}
                        {del.allocation_candidate_id && (
                          <div className="text-[10px] text-[#8C978F] font-normal font-mono">
                            {del.allocation_candidate_id}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#202A24]">{del.listing_id}</div>
                        <div className="text-[11px] text-[#69736B]">&rarr; {del.demand_id}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#286280] bg-[#EAF3F6] px-2 py-0.5 rounded border border-[#D0E2EB]">
                          <Truck className="h-3 w-3 text-[#397FA3]" />
                          {del.delivery_mode.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#202A24]">
                        {del.dispatched_volume_kl.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-[#69736B]">kL</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#174D3A] font-semibold">
                        {del.delivered_volume_kl !== null && del.delivered_volume_kl !== undefined
                          ? `${del.delivered_volume_kl.toLocaleString()} kL`
                          : <span className="text-[#8C978F] font-normal italic">Pending Meter</span>}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge
                          status={statusBadge.type}
                          label={statusBadge.label}
                          size="xs"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {stageIndex >= 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            {[0, 1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-1.5 w-3 rounded-full ${
                                  step <= stageIndex
                                    ? 'bg-[#168779]'
                                    : 'bg-[#E0E5DF]'
                                }`}
                                title={`Stage ${step + 1}`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-[#972B28] font-mono text-[10px]">REJECTED</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isTerminal ? (
                          <button
                            type="button"
                            onClick={() => handleOpenTransition(del)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#174D3A] hover:text-[#10392B] p-1 rounded hover:bg-[#EDF6F1]"
                          >
                            Advance Status <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8C978F] italic">Finalized</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Delivery Modal */}
      {scheduleModalOpen && (
        <Modal
          isOpen={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          title="Schedule New Physical Delivery Dispatch"
          subtitle="Record transport conveyance for agreed effluent transfer"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#202A24] block mb-1">
                Source Supply Listing
              </label>
              <select
                value={formListingId}
                onChange={(e) => setFormListingId(e.target.value)}
                required
                className="w-full rounded border border-[#E0E5DF] p-2 text-xs focus:border-[#174D3A] focus:outline-hidden"
              >
                {suppliesList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.name} ({s.available_volume_kl.toLocaleString()} kL available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#202A24] block mb-1">
                Destination Buyer Demand Request
              </label>
              <select
                value={formDemandId}
                onChange={(e) => setFormDemandId(e.target.value)}
                required
                className="w-full rounded border border-[#E0E5DF] p-2 text-xs focus:border-[#174D3A] focus:outline-hidden"
              >
                {demandsList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id} - {d.facility_name} ({d.required_volume_kl.toLocaleString()} kL required)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-[#202A24] block mb-1">
                  Dispatched Volume (kL)
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={formVolume}
                  onChange={(e) => setFormVolume(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full rounded border border-[#E0E5DF] p-2 text-xs font-mono focus:border-[#174D3A] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202A24] block mb-1">
                  Delivery Mode
                </label>
                <select
                  value={formMode}
                  onChange={(e) => setFormMode(e.target.value as DeliveryMode)}
                  className="w-full rounded border border-[#E0E5DF] p-2 text-xs focus:border-[#174D3A] focus:outline-hidden"
                >
                  <option value="DEDICATED_TANKER">Dedicated Road Tanker</option>
                  <option value="PIPELINE">Industrial Pipeline</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded border border-[#E0E5DF] bg-[#F7F7F2] text-[11px] text-[#69736B]">
              <strong>Accounting Rule:</strong> Dispatch starts in <code className="font-mono text-[#202A24]">SCHEDULED</code> state.
              Freshwater displacement is NOT credited until physical intake is verified as <code className="font-mono text-[#202A24]">ACCEPTED_CONFIRMED</code>.
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="rounded border border-[#E0E5DF] bg-[#F7F7F2] px-3.5 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-[#174D3A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#10392B] disabled:opacity-50"
              >
                {submitting ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Advance Status Modal */}
      {transitionDelivery && (
        <Modal
          isOpen={!!transitionDelivery}
          onClose={() => setTransitionDelivery(null)}
          title={`Update Custody Lifecycle: ${transitionDelivery.id}`}
          subtitle={`Current Stage: ${transitionDelivery.lifecycle_status}`}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteTransition} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#202A24] block mb-1">
                Target Lifecycle Status
              </label>
              <select
                value={transitionStatus}
                onChange={(e) => setTransitionStatus(e.target.value as DeliveryLifecycleStatus)}
                required
                className="w-full rounded border border-[#E0E5DF] p-2 text-xs font-mono focus:border-[#174D3A] focus:outline-hidden"
              >
                <option value="DISPATCHED">DISPATCHED (Departed Loading Terminal)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (In Active Transit)</option>
                <option value="DELIVERED_SAMPLE_PENDING">DELIVERED_SAMPLE_PENDING (Arrived at Receiver Gate)</option>
                <option value="ACCEPTED_CONFIRMED">ACCEPTED_CONFIRMED (Sample Verified & Intake Metered)</option>
                <option value="REJECTED_QUALITY_FAILURE">REJECTED_QUALITY_FAILURE (Intake Quality Failed)</option>
              </select>
            </div>

            {transitionStatus === 'ACCEPTED_CONFIRMED' && (
              <div>
                <label className="font-semibold text-[#202A24] block mb-1">
                  Metered Receiver Volume (kL)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={intakeVolume || ''}
                  onChange={(e) => setIntakeVolume(parseFloat(e.target.value) || undefined)}
                  required
                  className="w-full rounded border border-[#E0E5DF] p-2 text-xs font-mono focus:border-[#174D3A] focus:outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="font-semibold text-[#202A24] block mb-1">
                Inspection & Verification Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={transitionNotes}
                onChange={(e) => setTransitionNotes(e.target.value)}
                placeholder="Receiver gate lab ticket number or meter reading..."
                className="w-full rounded border border-[#E0E5DF] p-2 text-xs focus:border-[#174D3A] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setTransitionDelivery(null)}
                className="rounded border border-[#E0E5DF] bg-[#F7F7F2] px-3.5 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-[#174D3A] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#10392B] disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Commit Status Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
