import React from 'react';
import { FileSpreadsheet, Plus, Info } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const DemandsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Buyer Demand Requests</h2>
          <p className="text-xs text-stone-500">
            Intake requirements for commercial and industrial water consumers seeking treated reuse water.
          </p>
        </div>
        <div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-800 px-3 py-1.5 text-xs font-medium text-white opacity-60 cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" /> Submit Demand Request
          </button>
        </div>
      </div>

      {/* Structural Placeholder Card */}
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-teal-800">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Demand Request & Quality Tolerance Module
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-stone-500 leading-relaxed">
          This module is a structural placeholder in the current repository initialisation stage.
          Commercial buyers (e.g., cooling towers, construction sites, industrial boilers, landscape irrigation)
          will specify their volumetric requirements and maximum contaminant thresholds.
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <Badge variant="brand" size="sm">Schema Defined in docs/data-model.md</Badge>
          <Badge variant="neutral" size="sm">No Mock Requests Active</Badge>
        </div>
      </div>

      {/* Architecture Context */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">Planned Compatibility Validation:</span>
            <p className="text-stone-500 leading-relaxed">
              Every demand request specifies critical tolerance limits. BlueLoop's deterministic matching
              engine will strictly reject any candidate supplier water exceeding any individual parameter limit,
              preventing industrial equipment degradation and contamination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
