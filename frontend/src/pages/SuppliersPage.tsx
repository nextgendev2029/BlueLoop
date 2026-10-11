import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  Search,
  Plus,
  Info,
  Droplet,
  MapPin,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { StatusBadge, StatusType } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { Modal } from '../components/common/Modal';
import { fetchSuppliers, fetchSupplies } from '../services/suppliers';
import { SupplierFacility, SupplyListing } from '../types/api';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierFacility[]>([]);
  const [supplies, setSupplies] = useState<SupplyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('ALL');
  const [selectedWaterGrade, setSelectedWaterGrade] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'listings' | 'facilities'>('listings');

  // Modal inspection states
  const [selectedSupply, setSelectedSupply] = useState<SupplyListing | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<SupplierFacility | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [suppliersRes, suppliesRes] = await Promise.all([
        fetchSuppliers(),
        fetchSupplies(),
      ]);
      setSuppliers(suppliersRes.items);
      setSupplies(suppliesRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load supplier records from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered supply listings
  const filteredSupplies = useMemo(() => {
    return supplies.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.facility_name && item.facility_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade =
        selectedWaterGrade === 'ALL' || item.water_grade === selectedWaterGrade;
      return matchesSearch && matchesGrade;
    });
  }, [supplies, searchQuery, selectedWaterGrade]);

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return suppliers.filter((fac) => {
      const matchesSearch =
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        selectedFacilityType === 'ALL' || fac.facility_type === selectedFacilityType;
      return matchesSearch && matchesType;
    });
  }, [suppliers, searchQuery, selectedFacilityType]);

  const mapStatusToBadge = (status: string): { type: StatusType; label: string } => {
    switch (status) {
      case 'VERIFIED':
        return { type: 'CONFIRMED', label: 'Lab Evidence Tested' };
      case 'PENDING_AUDIT':
      case 'PENDING_REVIEW':
        return { type: 'PENDING', label: 'Audit Pending' };
      case 'FLAGGED':
      case 'REJECTED':
        return { type: 'REJECTED', label: 'Flagged / Ineligible' };
      default:
        return { type: 'SELF_REPORTED', label: 'Self-Reported' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Treated Water Suppliers & Listing Directory
            </h2>
            <StatusBadge status="DEMO" label="Live REST Data" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Registered effluent treatment facilities, tertiary recycling streams, and laboratory test profiles.
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
            onClick={() => setRegistrationModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#174D3A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Register Supplier
          </button>
        </div>
      </div>

      {/* Tabs and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* Tab Toggle */}
        <div className="inline-flex rounded-lg border border-[#E0E5DF] bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'listings'
                ? 'bg-[#174D3A] text-white'
                : 'text-[#69736B] hover:text-[#202A24]'
            }`}
          >
            Supply Batches ({supplies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facilities')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === 'facilities'
                ? 'bg-[#174D3A] text-white'
                : 'text-[#69736B] hover:text-[#202A24]'
            }`}
          >
            Treatment Facilities ({suppliers.length})
          </button>
        </div>

        {/* Search and Grade/Type Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8C978F]" />
            <input
              type="text"
              placeholder="Search by facility, stream, or ID..."
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

          {activeTab === 'listings' ? (
            <select
              value={selectedWaterGrade}
              onChange={(e) => setSelectedWaterGrade(e.target.value)}
              className="rounded-md border border-[#E0E5DF] bg-white px-2.5 py-1.5 text-xs text-[#202A24] focus:border-[#174D3A] focus:outline-hidden"
            >
              <option value="ALL">All Water Grades</option>
              <option value="RO_PERMEATE">RO Permeate</option>
              <option value="TERTIARY_POLISHED">Tertiary Polished</option>
              <option value="SECONDARY_CLARIFIED">Secondary Clarified</option>
              <option value="INDUSTRIAL_RECYCLED">Industrial Recycled</option>
            </select>
          ) : (
            <select
              value={selectedFacilityType}
              onChange={(e) => setSelectedFacilityType(e.target.value)}
              className="rounded-md border border-[#E0E5DF] bg-white px-2.5 py-1.5 text-xs text-[#202A24] focus:border-[#174D3A] focus:outline-hidden"
            >
              <option value="ALL">All Facility Types</option>
              <option value="CETP">Common Effluent Plant (CETP)</option>
              <option value="INDUSTRIAL_STP">Industrial STP</option>
              <option value="MANUFACTURING_WWTP">Manufacturing WWTP</option>
              <option value="MUNICIPAL_TERTIARY">Municipal Tertiary</option>
            </select>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onRetry={loadData} />}

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner label="Fetching supplier directory from BlueLoop API..." />
      ) : activeTab === 'listings' ? (
        /* Listings Table */
        filteredSupplies.length === 0 ? (
          <EmptyState
            title="No Supply Listings Found"
            description={
              searchQuery || selectedWaterGrade !== 'ALL'
                ? 'No water batches match the selected search or water grade filters.'
                : 'No supply listings are currently available in the system.'
            }
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedWaterGrade('ALL');
            }}
          />
        ) : (
          <div className="rounded-lg border border-[#E0E5DF] bg-white shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
                    <th className="py-3 px-4">Batch ID & Stream Name</th>
                    <th className="py-3 px-4">Origin Facility</th>
                    <th className="py-3 px-4">Water Grade</th>
                    <th className="py-3 px-4 text-right">Available Volume</th>
                    <th className="py-3 px-4 text-right">Ex-Works Price</th>
                    <th className="py-3 px-4 text-center">Lab Evidence</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECEFEA]">
                  {filteredSupplies.map((listing) => {
                    const evidenceBadge = mapStatusToBadge(listing.quality_evidence_status);
                    return (
                      <tr key={listing.id} className="hover:bg-[#FBFBFA] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-[#202A24]">
                          <div className="font-semibold">{listing.name}</div>
                          <div className="font-mono text-[11px] text-[#69736B]">{listing.id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#202A24] font-medium">
                            {listing.facility_name || listing.facility_id}
                          </div>
                          <div className="text-[11px] text-[#8C978F] font-mono">
                            {listing.facility_id}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#174D3A] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
                            <Droplet className="h-3 w-3 text-[#168779]" />
                            {listing.water_grade.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#174D3A]">
                          {listing.available_volume_kl.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-[#69736B]">kL</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#202A24]">
                          ${listing.price_per_kl.toFixed(2)}{' '}
                          <span className="text-[10px] text-[#69736B]">/kL</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge
                            status={evidenceBadge.type}
                            label={evidenceBadge.label}
                            size="xs"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge
                            status={listing.status === 'AVAILABLE' ? 'ACTIVE' : 'IDLE'}
                            label={listing.status}
                            size="xs"
                          />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedSupply(listing)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#397FA3] hover:text-[#286280] p-1 rounded hover:bg-[#EAF3F6] transition-colors"
                          >
                            Inspect Lab Profile <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-[#FAFAF8] border-t border-[#ECEFEA] flex justify-between items-center text-[11px] text-[#69736B]">
              <span>Showing {filteredSupplies.length} of {supplies.length} supply listings</span>
              <span className="font-mono">All volumes in metric kilolitres (kL = m³)</span>
            </div>
          </div>
        )
      ) : (
        /* Facilities Table */
        filteredFacilities.length === 0 ? (
          <EmptyState
            title="No Facilities Found"
            description="No industrial facilities match the specified search query or type filter."
            actionLabel="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setSelectedFacilityType('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((fac) => {
              const statusBadge = mapStatusToBadge(fac.verification_status);
              return (
                <div
                  key={fac.id}
                  className="rounded-lg border border-[#E0E5DF] bg-white p-5 shadow-card hover:border-[#CBD3CA] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
                          <Factory className="h-4 w-4" />
                        </span>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#69736B] block">
                            {fac.facility_type.replace(/_/g, ' ')}
                          </span>
                          <h4 className="text-sm font-bold text-[#202A24] leading-snug">
                            {fac.name}
                          </h4>
                        </div>
                      </div>
                      <StatusBadge
                        status={statusBadge.type}
                        label={statusBadge.label}
                        size="xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#69736B]">
                      <MapPin className="h-3.5 w-3.5 text-[#168779] shrink-0" />
                      <span>{fac.city}, {fac.state}</span>
                      {fac.latitude && fac.longitude && (
                        <span className="text-[10px] font-mono text-[#8C978F]">
                          ({fac.latitude.toFixed(3)}, {fac.longitude.toFixed(3)})
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#69736B] pt-1">
                      Organization: <strong className="text-[#202A24]">{fac.organisation_name || fac.org_id}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ECEFEA] flex items-center justify-between text-xs">
                    <span className="font-mono text-[10px] text-[#8C978F]">{fac.id}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFacility(fac)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#174D3A] hover:text-[#10392B]"
                    >
                      Facility Details <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Quality Measurement Inspection Modal */}
      {selectedSupply && (
        <Modal
          isOpen={!!selectedSupply}
          onClose={() => setSelectedSupply(null)}
          title={`Laboratory Quality Profile: ${selectedSupply.name}`}
          subtitle={`Batch ID: ${selectedSupply.id} • Origin: ${selectedSupply.facility_name || selectedSupply.facility_id}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F7F2] p-3 rounded-md text-xs border border-[#E0E5DF]">
              <div>
                <span className="text-[#69736B] block">Water Grade:</span>
                <span className="font-semibold text-[#174D3A]">
                  {selectedSupply.water_grade.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Available Volume:</span>
                <span className="font-mono font-bold text-[#202A24]">
                  {selectedSupply.available_volume_kl.toLocaleString()} kL
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Ex-Works Unit Price:</span>
                <span className="font-mono font-medium text-[#202A24]">
                  ${selectedSupply.price_per_kl.toFixed(2)}/kL
                </span>
              </div>
              <div>
                <span className="text-[#69736B] block">Evidence Status:</span>
                <span className="font-medium text-[#168779]">
                  {selectedSupply.quality_evidence_status}
                </span>
              </div>
            </div>

            {selectedSupply.measurements ? (
              <div>
                <h4 className="text-xs font-bold text-[#202A24] mb-2 uppercase tracking-wider">
                  Continuous Chemical & Physical Parameters
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">pH Scale</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.ph ?? 'N/A'}
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Acid / Base Equilibrium</span>
                  </div>
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">Total Dissolved Solids</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.tds_mg_l ?? 'N/A'}{' '}
                      <span className="text-[10px] font-normal text-[#69736B]">mg/L</span>
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Salinity & Mineralization</span>
                  </div>
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">Chemical Oxygen Demand</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.cod_mg_l ?? 'N/A'}{' '}
                      <span className="text-[10px] font-normal text-[#69736B]">mg/L</span>
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Organic Oxidizable Mass</span>
                  </div>
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">Biochemical Oxygen Demand</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.bod_mg_l ?? 'N/A'}{' '}
                      <span className="text-[10px] font-normal text-[#69736B]">mg/L</span>
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Biodegradable Organic Load</span>
                  </div>
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">Total Suspended Solids</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.tss_mg_l ?? 'N/A'}{' '}
                      <span className="text-[10px] font-normal text-[#69736B]">mg/L</span>
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Particulate Filtration</span>
                  </div>
                  <div className="rounded border border-[#E0E5DF] p-2.5 text-xs bg-white">
                    <span className="text-[#69736B] text-[10px] uppercase block">Nephelometric Turbidity</span>
                    <span className="text-base font-mono font-bold text-[#202A24]">
                      {selectedSupply.measurements.turbidity_ntu ?? 'N/A'}{' '}
                      <span className="text-[10px] font-normal text-[#69736B]">NTU</span>
                    </span>
                    <span className="text-[10px] text-[#8C978F] block">Optical Clarity</span>
                  </div>
                </div>

                {selectedSupply.measurements.heavy_metals && (
                  <div className="mt-4 p-3 rounded border border-[#E0E5DF] bg-[#F7F7F2] text-xs">
                    <span className="font-semibold text-[#202A24] block mb-1">
                      CPCB Heavy Metal Trace Screening:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-[#69736B]">
                      <div>Cd: {selectedSupply.measurements.heavy_metals.cadmium_mg_l ?? '-'} mg/L</div>
                      <div>Cr: {selectedSupply.measurements.heavy_metals.chromium_mg_l ?? '-'} mg/L</div>
                      <div>Pb: {selectedSupply.measurements.heavy_metals.lead_mg_l ?? '-'} mg/L</div>
                      <div>Ni: {selectedSupply.measurements.heavy_metals.nickel_mg_l ?? '-'} mg/L</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded border border-[#EBDCBA] bg-[#FAF6EC] text-xs text-[#8A641B]">
                No structured laboratory measurement object attached to this stream record.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setSelectedSupply(null)}
                className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-4 py-2 text-xs font-semibold text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Facility Inspection Modal */}
      {selectedFacility && (
        <Modal
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
          title={`Facility Profile: ${selectedFacility.name}`}
          subtitle={`Facility ID: ${selectedFacility.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 space-y-1.5">
              <div>
                <span className="text-[#69736B]">Facility Classification:</span>{' '}
                <strong className="text-[#202A24]">{selectedFacility.facility_type.replace(/_/g, ' ')}</strong>
              </div>
              <div>
                <span className="text-[#69736B]">Operating Municipality:</span>{' '}
                <strong className="text-[#202A24]">{selectedFacility.city}, {selectedFacility.state}</strong>
              </div>
              <div>
                <span className="text-[#69736B]">Operating Entity:</span>{' '}
                <strong className="text-[#202A24]">{selectedFacility.organisation_name || selectedFacility.org_id}</strong>
              </div>
              {selectedFacility.contact_email && (
                <div>
                  <span className="text-[#69736B]">Contact Channel:</span>{' '}
                  <span className="font-mono text-[#174D3A]">{selectedFacility.contact_email}</span>
                </div>
              )}
            </div>

            <p className="text-[#69736B] leading-relaxed">
              This treatment facility publishes periodic discharge capacity listings through BlueLoop.
              Effluent batches produced at this facility are screened against buyer tolerance boundaries
              before physical dispatch.
            </p>

            <div className="flex justify-end pt-3 border-t border-[#ECEFEA]">
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-4 py-2 text-xs font-semibold text-[#202A24] hover:bg-[#ECEFEA]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Supplier Registration Notice Modal */}
      {registrationModalOpen && (
        <Modal
          isOpen={registrationModalOpen}
          onClose={() => setRegistrationModalOpen(false)}
          title="Supplier Facility Registration"
          subtitle="Facility Onboarding & Quality Certification"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-lg border border-water-200 bg-water-50/60 p-4 text-water-900">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-water-600" />
                <div className="space-y-1">
                  <span className="font-semibold block">Commercial Supplier Intake</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    New facility streams require an accredited laboratory certificate of analysis (COA &lt; 90 days old) confirming pH, TDS, COD, and heavy metal concentrations prior to network publication.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Active facilities listed in the directory represent verified sample municipal and industrial treatment plants configured for evaluation in this demonstration workspace.
            </p>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegistrationModalOpen(false)}
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
