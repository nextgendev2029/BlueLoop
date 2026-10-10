import React from 'react';
import { Truck, Info } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const DeliveriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Delivery Status & Verification</h2>
          <p className="text-xs text-stone-500">
            Logistics milestones, chain-of-custody tracking, and water batch delivery sign-offs.
          </p>
        </div>
      </div>

      {/* Structural Placeholder Card */}
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-teal-800">
          <Truck className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Delivery Tracking & Custody Verification Module
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-stone-500 leading-relaxed">
          This module is a structural placeholder in the current repository initialisation stage.
          Once allocations are approved, logistics operations (dedicated pipeline or tanker dispatch)
          will record dispatch status, volume transferred, and destination receipt acknowledgment.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <Badge variant="brand" size="sm">Lifecycle States Defined</Badge>
          <Badge variant="neutral" size="sm">No Mock Deliveries Active</Badge>
        </div>
      </div>

      {/* Architecture Context */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">Planned Delivery Lifecycles:</span>
            <p className="text-stone-500 leading-relaxed">
              States include: Pending Dispatch, In Transit, Sample Confirmed On-Site, Custody Accepted,
              and Completed. Only completed and verified deliveries increment verified freshwater displacement records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
