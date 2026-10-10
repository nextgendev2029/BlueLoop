import React from 'react';
import {
  ShieldAlert,
  Server,
  Layers,
  ArrowRight,
  Database,
  Calculator,
  Compass,
  FileCheck2,
  Cpu,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Product Banner */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">Environmental Hackathon Track: Heat & Water</Badge>
              <Badge variant="info">Target: AWS Serverless Architecture</Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Water Reuse Intelligence & Procurement Optimisation Platform
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
              BlueLoop facilitates closed-loop water economies by systematically
              evaluating treated industrial effluent against commercial water demands.
              Using deterministic, explainable engineering logic, the platform verifies
              quality thresholds, solves multi-facility allocation constraints, and
              calculates verified freshwater displacement.
            </p>
          </div>
        </div>
      </div>

      {/* Synthetic Data & Engineering Integrity Notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-900">
              Repository Initialisation Phase & Synthetic Data Standard
            </h3>
            <p className="text-xs leading-relaxed text-amber-800">
              This repository represents the architectural foundation established in
              Master Prompt 01. To ensure strict engineering integrity, no fictional
              suppliers, mock laboratory quality metrics, or simulated carbon/water
              savings are presented as operational reality. The deterministic matching
              and allocation engine will be systematically integrated in subsequent stages.
            </p>
          </div>
        </div>
      </div>

      {/* Planned Modules Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          Planned Platform Modules
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <Compass className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Supplier Discovery & Quality Listings
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Treated effluent volume catalogs, treatment stages, certified chemical
                and physical laboratory parameter certificates.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/suppliers"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Module Placeholder <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <FileCheck2 className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Demand Requests & Threshold Specs
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Commercial intake requirements, acceptable tolerance limits (pH, TDS,
                turbidity, microbiological counts), and volumetric timelines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/demands"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Module Placeholder <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <Cpu className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Deterministic Allocation Engine
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Constrained optimization solving multi-source to multi-sink allocation
                with full mathematical auditability and zero black-box AI approximations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/allocations"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Module Placeholder <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <Layers className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Delivery & Custody Tracking
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Logistics status verification, pipeline/tanker batch confirmation,
                and delivery milestone sign-offs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/deliveries"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Module Placeholder <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <Calculator className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                Freshwater Displacement & Cost Audits
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Audited calculations of virgin freshwater saved (kL/day), delivered
                reuse cost estimates, and municipal tariff displacement.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/impact"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Module Placeholder <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 6 */}
          <div className="flex flex-col justify-between rounded-lg border border-stone-200 bg-white p-5 shadow-2xs">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-100 text-teal-800">
                  <Database className="h-4 w-4" />
                </div>
                <Badge variant="neutral" size="sm">Planned</Badge>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                AWS Serverless Data Layer
              </h4>
              <p className="text-xs leading-relaxed text-stone-500">
                Amazon DynamoDB single-table persistence, Amazon S3 document archives,
                and EventBridge scheduled health audits.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <Link
                to="/settings"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-900"
              >
                Inspect Settings & Target Infra <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Setup State */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-teal-700" />
          Repository Initialisation Verification Matrix
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-stone-200 bg-stone-50 p-3">
            <span className="text-[11px] font-medium text-stone-500 block">Frontend Stack</span>
            <span className="text-xs font-semibold text-slate-800 mt-1 block">React 18 + TS + Vite</span>
            <span className="text-[11px] text-teal-700 font-medium">Configured</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3">
            <span className="text-[11px] font-medium text-stone-500 block">Backend Framework</span>
            <span className="text-xs font-semibold text-slate-800 mt-1 block">FastAPI + Python 3.11</span>
            <span className="text-[11px] text-teal-700 font-medium">Configured</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3">
            <span className="text-[11px] font-medium text-stone-500 block">Health Endpoint</span>
            <span className="text-xs font-semibold text-slate-800 mt-1 block">GET /api/v1/health</span>
            <span className="text-[11px] text-teal-700 font-medium">Structured JSON</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3">
            <span className="text-[11px] font-medium text-stone-500 block">Lambda Adapter</span>
            <span className="text-xs font-semibold text-slate-800 mt-1 block">Mangum ASGI Handler</span>
            <span className="text-[11px] text-teal-700 font-medium">Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
