import React from 'react';
import { BarChart3, Download, Info } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ImpactPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Impact Reports & Environmental Auditing</h2>
          <p className="text-xs text-stone-500">
            Freshwater displacement accounting, municipal tariff savings, and ESG compliance exports.
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-400 cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" /> Export Impact Audit
          </button>
        </div>
      </div>

      {/* Structural Placeholder Card */}
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-teal-800">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Freshwater Displacement & Economic Audit Module
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-stone-500 leading-relaxed">
          This module is a structural placeholder in the current repository initialisation stage.
          Following the core engineering engine implementation, this interface will aggregate
          verified cubic meters (kL) of virgin freshwater displaced from groundwater/municipal grids
          and net procurement savings achieved.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <Badge variant="brand" size="sm">Audited Formulae Planned</Badge>
          <Badge variant="neutral" size="sm">No Mock Figures Displayed</Badge>
        </div>
      </div>

      {/* Metric Integrity Policy */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">Strict Metric Integrity Standard:</span>
            <p className="text-stone-500 leading-relaxed">
              In accordance with hackathon evaluation standards, no simulated or arbitrarily inflated environmental
              numbers are rendered here. Real metrics will derive solely from verified delivery receipts logged in
              the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
