import React from 'react';
import { Factory, Plus, Filter, Info } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const SuppliersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Treated Water Suppliers</h2>
          <p className="text-xs text-stone-500">
            Directory of industrial wastewater treatment plants, municipal tertiary facilities, and water reuse listings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-400 cursor-not-allowed"
          >
            <Filter className="h-3.5 w-3.5" /> Filter Parameters
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 rounded-md bg-teal-800 px-3 py-1.5 text-xs font-medium text-white opacity-60 cursor-not-allowed"
          >
            <Plus className="h-3.5 w-3.5" /> Register Supplier
          </button>
        </div>
      </div>

      {/* Structural Placeholder Card */}
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-teal-800">
          <Factory className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          Supplier Directory & Water Quality Registry Module
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs text-stone-500 leading-relaxed">
          This module is a structural placeholder in the current repository initialisation stage.
          In subsequent stages, suppliers will register available daily volumes (kL/day), treatment processes,
          and certified water quality reports (pH, TDS, COD, BOD, Turbidity, heavy metal concentrations).
        </p>
        <div className="mt-4 inline-flex items-center gap-2">
          <Badge variant="brand" size="sm">Schema Defined in docs/data-model.md</Badge>
          <Badge variant="neutral" size="sm">No Mock Records Active</Badge>
        </div>
      </div>

      {/* Architecture Context */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 text-xs text-stone-600">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">Planned Quality Data Fields:</span>
            <p className="text-stone-500 leading-relaxed">
              Every supplier profile will require mandatory testing credentials: pH range, Total Dissolved Solids (mg/L),
              Chemical Oxygen Demand (mg/L), Biochemical Oxygen Demand (mg/L), Total Suspended Solids (mg/L), Turbidity (NTU),
              along with daily discharge capacity and GPS location for transport optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
