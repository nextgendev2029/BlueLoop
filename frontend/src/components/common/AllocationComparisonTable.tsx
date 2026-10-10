import React from 'react';
import { GitMerge, MapPin } from 'lucide-react';
import { StatusBadge, StatusType } from './StatusBadge';

interface AllocationItem {
  id: string;
  supplier: string;
  listingGrade: string;
  buyer: string;
  application: string;
  volumeKlPerDay: number;
  distanceKm: number;
  deliveredCostPerKl: string;
  displacementKl: number;
  status: StatusType;
  statusLabel: string;
}

const demoAllocations: AllocationItem[] = [
  {
    id: 'AL-1081',
    supplier: 'CETP Maraimalai Sector 01',
    listingGrade: 'Tertiary Polished (TDS 980)',
    buyer: 'Automotive Precision Assembly',
    application: 'Cooling Tower Closed Circuit',
    volumeKlPerDay: 2400,
    distanceKm: 14.2,
    deliveredCostPerKl: '$0.78 / kL',
    displacementKl: 2400,
    status: 'CONFIRMED',
    statusLabel: 'Verified Quality',
  },
  {
    id: 'AL-1082',
    supplier: 'Guindy Industrial Park STP',
    listingGrade: 'RO Permeate (TDS 310)',
    buyer: 'Apex Hyperscale Data Center',
    application: 'Evaporative Cooling Loops',
    volumeKlPerDay: 3500,
    distanceKm: 8.6,
    deliveredCostPerKl: '$0.92 / kL',
    displacementKl: 3500,
    status: 'CONFIRMED',
    statusLabel: 'Verified Quality',
  },
  {
    id: 'AL-1083',
    supplier: 'Ambattur Common Effluent Plant',
    listingGrade: 'Tertiary Clarified (TDS 1420)',
    buyer: 'Metro Rail Casting Yard',
    application: 'Precast Concrete & Dust Suppression',
    volumeKlPerDay: 1800,
    distanceKm: 19.5,
    deliveredCostPerKl: '$0.64 / kL',
    displacementKl: 1800,
    status: 'ESTIMATED',
    statusLabel: 'Optimized Model',
  },
  {
    id: 'AL-1084',
    supplier: 'Sriperumbudur Eco-Tech Discharger',
    listingGrade: 'Secondary Polished (TDS 1150)',
    buyer: 'Thermal Heat Recovery Plant',
    application: 'Scrubber Makeup Water',
    volumeKlPerDay: 1200,
    distanceKm: 22.1,
    deliveredCostPerKl: '$0.71 / kL',
    displacementKl: 1200,
    status: 'PENDING',
    statusLabel: 'Lab Recertification Due',
  },
];

export const AllocationComparisonTable: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-base font-semibold text-[#202A24]">
              Candidate Allocation Ledger & Cost Matrix
            </h3>
            <StatusBadge status="DEMO" label="Sample Industrial Pairings" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-0.5">
            Optimized multi-facility supply allocations with logistics cost and freshwater displacement metrics.
          </p>
        </div>
        <div className="text-xs text-[#69736B] font-mono">
          Algorithm: Linear Constrained Transport
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E0E5DF] text-[#69736B] font-semibold bg-[#FAFAF8]">
              <th className="py-2.5 px-3">Pairing ID</th>
              <th className="py-2.5 px-3">Treated Effluent Supplier</th>
              <th className="py-2.5 px-3">Consumer Intake Application</th>
              <th className="py-2.5 px-3 text-right">Volume (kL/day)</th>
              <th className="py-2.5 px-3 text-right">Distance</th>
              <th className="py-2.5 px-3 text-right">Delivered Cost</th>
              <th className="py-2.5 px-3 text-right">Displacement</th>
              <th className="py-2.5 px-3 text-center">Quality Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECEFEA]">
            {demoAllocations.map((item) => (
              <tr key={item.id} className="hover:bg-[#FBFBFA] transition-colors group">
                <td className="py-3 px-3 font-mono font-medium text-[#174D3A]">
                  {item.id}
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-[#202A24]">{item.supplier}</div>
                  <div className="text-[11px] text-[#69736B]">{item.listingGrade}</div>
                </td>
                <td className="py-3 px-3">
                  <div className="font-medium text-[#202A24]">{item.buyer}</div>
                  <div className="text-[11px] text-[#69736B]">{item.application}</div>
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-[#202A24]">
                  {item.volumeKlPerDay.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-[#69736B]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#168779]" />
                    {item.distanceKm} km
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono font-medium text-[#174D3A]">
                  {item.deliveredCostPerKl}
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-[#174D3A]">
                  {item.displacementKl.toLocaleString()} kL
                </td>
                <td className="py-3 px-3 text-center">
                  <StatusBadge
                    status={item.status}
                    label={item.statusLabel}
                    size="xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-[#ECEFEA] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#69736B]">
        <span>
          Cumulative Displacement: <strong className="text-[#174D3A] font-mono">8,900 kL virgin groundwater/day</strong> across 4 demo pairings.
        </span>
        <span className="font-mono text-[#8C978F]">All calculations deterministic</span>
      </div>
    </div>
  );
};
