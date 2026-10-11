import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Info,
  Layers,
  MapPin,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { StatusBadge, StatusType } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Modal } from '../components/common/Modal';
import { fetchDemands } from '../services/demands';
import { DemandRequest, DemandStatus } from '../types/api';

export const DemandsPage: React.FC = () => {
  const [demands, setDemands] = useState<DemandRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUse, setSelectedUse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal inspection states
  const [selectedDemand, setSelectedDemand] = useState<DemandRequest | null>(null);
  const [demandModalOpen, setDemandModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDemands();
      setDemands(response.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load buyer demand requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Demands
  const filteredDemands = useMemo(() => {
    return demands.filter((item) => {
      const matchesSearch =
        item.facility_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.org_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesUse = selectedUse === 'ALL' || item.intended_use === selectedUse;
      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      return matchesSearch && matchesUse && matchesStatus;
    });
  }, [demands, searchQuery, selectedUse, selectedStatus]);

  const mapStatusToBadge = (status: DemandStatus): { type: StatusType; label: string } => {
    switch (status) {
      case 'OPEN':
        return { type: 'ACTIVE', label: 'Seeking Allocation' };
      case 'ALLOCATED':
        return { type: 'CONFIRMED', label: 'Fulfilled' };
      case 'PARTIALLY_ALLOCATED':
        return { type: 'ESTIMATED', label: 'Partially Allocated' };
      case 'CANCELLED':
        return { type: 'REJECTED', label: 'Cancelled' };
      default:
        return { type: 'PENDING', label: status };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Buyer Demand Requests & Intake Tolerances
            </h2>
            <StatusBadge status="DEMO" label="Live REST Data" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Registered commercial water consumers, volume requirements, procurement budgets, and chemical boundary tolerances.
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
            onClick={() => setDemandModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Submit Demand Request
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative min-w-[260px] max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8C978F]" />
          <input
            type="text"
            placeholder="Search by facility, buyer org, or request ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#E0E5DF] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202A24] placeholder-[#8C978F] focus:border-[#174D3A] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-[#8C978F] hover:text-[#202A24]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedUse}
            onChange={(e) => setSelectedUse(e.target.value)}
            className="rounded-md border border-[#E0E5DF] bg-white px-2.5 py-1.5 text-xs text-[#202A24] focus:border-[#174D3A] focus:outline-hidden"
          >
            <option value="ALL">All Intended Uses</option>
            <option value="COOLING_TOWER">Cooling Tower</option>
            <option value="BOILER_FEED">Boiler Feed Makeup</option>
            <option value="INDUSTRIAL_PROCESS">Industrial Process</option>
            <option value="CONSTRUCTION_BATCHING">Construction Batching</option>
            <option value="LANDSCAPING_NON_POTABLE">Landscaping Non-Potable</option>
            <option value="TOILET_FLUSHING">Toilet Flushing</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-[#E0E5DF] bg-white px-2.5 py-1.5 text-xs text-[#202A24] focus:border-[#174D3A] focus:outline-hidden"
          >
            <option value="ALL">All Lifecycle Statuses</option>
            <option value="OPEN">Open (Seeking Match)</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="PARTIALLY_ALLOCATED">Partially Allocated</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={loadData} />}

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner label="Fetching demand requests from BlueLoop API..." />
      ) : filteredDemands.length === 0 ? (
        <EmptyState
          title="No Demand Requests Found"
          description={
            searchQuery || selectedUse !== 'ALL' || selectedStatus !== 'ALL'
              ? 'No buyer requests match the specified search or filter criteria.'
              : 'No demand requests have been recorded in the system.'
          }
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedUse('ALL');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        /* Demands Table */
        <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                  <th className="py-3 px-4">Request ID & Facility</th>
                  <th className="py-3 px-4">Intended Intake Use</th>
                  <th className="py-3 px-4 text-right">Required Volume</th>
                  <th className="py-3 px-4 text-right">Max Price / Budget</th>
                  <th className="py-3 px-4 text-right">Transit Radius</th>
                  <th className="py-3 px-4 text-center">Quality Boundaries</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEFEA]">
                {filteredDemands.map((demand) => {
                  const statusBadge = mapStatusToBadge(demand.status);
                  return (
                    <tr key={demand.id} className="hover:bg-[#FBFBFA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#202A24]">{demand.facility_name}</div>
                        <div className="font-mono text-[11px] text-[#69736B]">
                          {demand.id} • {demand.org_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#286280] bg-[#EAF3F6] px-2 py-0.5 rounded border border-[#D0E2EB]">
                          <Layers className="h-3 w-3 text-[#397FA3]" />
                          {demand.intended_use.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#174D3A]">
                        {demand.required_volume_kl.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-[#69736B]">kL</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#202A24]">
                        {demand.max_price_per_kl !== null && demand.max_price_per_kl !== undefined ? (
                          <div>
                            <span>${demand.max_price_per_kl.toFixed(2)}/kL</span>
                            {demand.total_budget && (
                              <div className="text-[10px] text-[#8C978F]">
                                Budget: ${demand.total_budget.toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8C978F] italic">Market Rate</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#69736B]">
                        {demand.max_distance_km !== null && demand.max_distance_km !== undefined ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#168779]" />
                            &le; {demand.max_distance_km} km
                          </span>
                        ) : (
                          <span className="text-[#8C978F] italic">No Limit</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#174D3A] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
                          <ShieldCheck className="h-3 w-3 text-[#168779]" />
                          {demand.quality_limits.max_tds_mg_l
                            ? `TDS &le; ${demand.quality_limits.max_tds_mg_l}`
                            : 'Limits Codified'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge
                          status={statusBadge.type}
                          label={statusBadge.label}
                          size="xs"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedDemand(demand)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#174D3A] hover:text-[#10392B] p-1 rounded hover:bg-[#EDF6F1] transition-colors"
                        >
                          View Limits <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-[#FAFAF8] border-t border-[#ECEFEA] flex justify-between items-center text-[11px] text-[#69736B]">
            <span>Showing {filteredDemands.length} of {demands.length} demand requests</span>
            <span className="font-mono">Total Volume: {filteredDemands.reduce((acc, d) => acc + d.required_volume_kl, 0).toLocaleString()} kL</span>
          </div>
        </div>
      )}

      {/* Demand Quality Limits Inspection Modal */}
      {selectedDemand && (
        <Modal
          isOpen={!!selectedDemand}
          onClose={() => setSelectedDemand(null)}
          title={`Intake Specification: ${selectedDemand.facility_name}`}
          subtitle={`Request ID: ${selectedDemand.id} • Intended Use: ${selectedDemand.intended_use.replace(/_/g, ' ')}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F7F2] p-3 rounded-md text-xs border border-[#E0E5DF]">
              <div>
                <span className="text-[#69736B] block">Required Intake:</span>
                <span className="font-mono font-bold text-[#174D3A]">
                  {selectedDemand.required_volume_kl.toLocaleString()} kL
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Price Ceiling:</span>
                <span className="font-mono font-medium text-[#202A24]">
                  {selectedDemand.max_price_per_kl ? `$${selectedDemand.max_price_per_kl.toFixed(2)}/kL` : 'Unconstrained'}
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Logistics Radius:</span>
                <span className="font-mono font-medium text-[#202A24]">
                  {selectedDemand.max_distance_km ? `${selectedDemand.max_distance_km} km max` : 'Unlimited'}
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Status:</span>
                <span className="font-medium text-[#168779]">
                  {selectedDemand.status}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#202A24] mb-2 uppercase tracking-wider">
                Codified Water-Quality Acceptance Limits
              </h4>
              <p className="text-[11px] text-[#69736B] mb-3">
                Candidate effluent streams must satisfy every individual parameter boundary to be deemed eligible.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">pH Tolerance Range</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.min_ph ?? '0.0'} &ndash;{' '}
                    {selectedDemand.quality_limits.max_ph ?? '14.0'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Corrosion / scaling bound</span>
                </div>
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">Maximum TDS Limit</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.max_tds_mg_l !== null && selectedDemand.quality_limits.max_tds_mg_l !== undefined
                      ? `${selectedDemand.quality_limits.max_tds_mg_l} mg/L`
                      : 'No boundary'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Total Dissolved Solids</span>
                </div>
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">Maximum COD Limit</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.max_cod_mg_l !== null && selectedDemand.quality_limits.max_cod_mg_l !== undefined
                      ? `${selectedDemand.quality_limits.max_cod_mg_l} mg/L`
                      : 'No boundary'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Chemical Oxygen Demand</span>
                </div>
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">Maximum BOD Limit</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.max_bod_mg_l !== null && selectedDemand.quality_limits.max_bod_mg_l !== undefined
                      ? `${selectedDemand.quality_limits.max_bod_mg_l} mg/L`
                      : 'No boundary'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Biological Oxygen Demand</span>
                </div>
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">Maximum TSS Limit</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.max_tss_mg_l !== null && selectedDemand.quality_limits.max_tss_mg_l !== undefined
                      ? `${selectedDemand.quality_limits.max_tss_mg_l} mg/L`
                      : 'No boundary'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Suspended Particulates</span>
                </div>
                <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                  <span className="text-[#69736B] text-[10px] uppercase block">Maximum Turbidity</span>
                  <span className="text-sm font-mono font-bold text-[#202A24]">
                    {selectedDemand.quality_limits.max_turbidity_ntu !== null && selectedDemand.quality_limits.max_turbidity_ntu !== undefined
                      ? `${selectedDemand.quality_limits.max_turbidity_ntu} NTU`
                      : 'No boundary'}
                  </span>
                  <span className="text-[10px] text-[#8C978F] block">Nephelometric Turbidity</span>
                </div>
              </div>

              {selectedDemand.quality_limits.heavy_metals_must_pass && (
                <div className="mt-3 p-3 rounded border border-[#C2E0D0] bg-[#EDF6F1] text-xs text-[#10392B] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#168779] shrink-0" />
                  <span>Mandatory CPCB Heavy Metal Non-Toxicity Certification Required</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setSelectedDemand(null)}
                className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-4 py-2 text-xs font-semibold text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Close Specification
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Demand Registration Notice Modal */}
      {demandModalOpen && (
        <Modal
          isOpen={demandModalOpen}
          onClose={() => setDemandModalOpen(false)}
          title="Demand Specification Intake"
          subtitle="Intake Tolerances & Volume Requirements"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-water-200 bg-water-50/60 p-4 text-water-900">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-water-600" />
                <div className="space-y-1">
                  <span className="font-semibold block">Commercial Buyer Intake</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Specify application tolerances (cooling tower, boiler feed, or industrial process), maximum acceptable transport distance, and target volumetric flow rates.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Active demand requests listed in the console demonstrate realistic operational requirements, including compatible matches and boundary test cases to showcase fail-closed screening.
            </p>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDemandModalOpen(false)}
                className="rounded-lg bg-water-600 px-4 py-2 text-xs font-semibold text-white hover:bg-water-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
