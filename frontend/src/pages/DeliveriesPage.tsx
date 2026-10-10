import React from 'react';
import { Truck, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const DeliveriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Delivery Logistics & Custody Transfer
            </h2>
            <StatusBadge status="DEMO" label="Architecture Blueprint" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Tracking batch dispatches, dedicated pipeline flow meters, and physical custody transfers.
          </p>
        </div>
      </div>

      {/* Structural Module Spec Card */}
      <div className="rounded-lg border border-dashed border-[#CBD3CA] bg-white p-10 text-center shadow-card">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
          <Truck className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-[#202A24]">
          Chain-of-Custody Tracking & Physical Transfer Verification
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-xs text-[#69736B] leading-relaxed">
          Upon allocation approval, this interface will monitor physical delivery execution: dedicated
          industrial pipeline telemetry or authorized road tanker transport dispatches. Only deliveries
          with confirmed intake sample testing credit verified freshwater displacement to the ledger.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <StatusBadge status="DEMO" label="No Mock Deliveries Active" size="sm" />
          <StatusBadge status="CONFIRMED" label="5-Stage Custody Lifecycle Defined" size="sm" />
        </div>
      </div>

      {/* Planned Lifecycle Pipeline */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 text-xs shadow-card space-y-4">
        <div className="flex items-center gap-2 font-semibold text-[#174D3A]">
          <ShieldCheck className="h-4 w-4 text-[#168779]" />
          <span>Defined Chain-of-Custody Lifecycle Stages</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-center">
            <span className="font-mono text-[10px] text-[#69736B] block">01</span>
            <span className="font-semibold text-[#202A24] text-xs block mt-1">Scheduled</span>
            <span className="text-[10px] text-[#69736B] block mt-0.5">Allocation Approved</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-center">
            <span className="font-mono text-[10px] text-[#69736B] block">02</span>
            <span className="font-semibold text-[#202A24] text-xs block mt-1">Dispatched</span>
            <span className="text-[10px] text-[#69736B] block mt-0.5">Discharge Loading Gate</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-center">
            <span className="font-mono text-[10px] text-[#69736B] block">03</span>
            <span className="font-semibold text-[#202A24] text-xs block mt-1">In Transit</span>
            <span className="text-[10px] text-[#69736B] block mt-0.5">Haversine GPS Telemetry</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-center">
            <span className="font-mono text-[10px] text-[#69736B] block">04</span>
            <span className="font-semibold text-[#202A24] text-xs block mt-1">Sample Tested</span>
            <span className="text-[10px] text-[#69736B] block mt-0.5">On-Site Receiver Check</span>
          </div>
          <div className="rounded border border-[#C2E0D0] bg-[#EDF6F1] p-3 text-center">
            <span className="font-mono text-[10px] text-[#174D3A] block">05</span>
            <span className="font-semibold text-[#10392B] text-xs block mt-1">Accepted</span>
            <span className="text-[10px] text-[#174D3A] block mt-0.5">Displacement Credited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
