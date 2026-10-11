import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Leaf,
  Layers,
  Factory,
  FileSpreadsheet,
  GitMerge,
  Truck,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { SupplyDemandBalance } from '../components/common/SupplyDemandBalance';
import { WaterFlowDiagram } from '../components/common/WaterFlowDiagram';
import { DeterministicGatekeeperCard } from '../components/common/DeterministicGatekeeperCard';
import { AllocationComparisonTable } from '../components/common/AllocationComparisonTable';
import { fetchSupplies } from '../services/suppliers';
import { fetchDemands } from '../services/demands';
import { fetchAllocations } from '../services/allocations';
import { fetchImpactSummary } from '../services/impact';
import { ImpactSummaryResponse, AllocationRunResponse, SupplyListing, DemandRequest } from '../types/api';

export const DashboardPage: React.FC = () => {
  const [supplyTotal, setSupplyTotal] = useState<number | null>(null);
  const [demandTotal, setDemandTotal] = useState<number | null>(null);
  const [latestRun, setLatestRun] = useState<AllocationRunResponse | null>(null);
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardMetrics() {
      try {
        setLoading(true);
        const [suppliesRes, demandsRes, runsRes, impactRes] = await Promise.allSettled([
          fetchSupplies(),
          fetchDemands(),
          fetchAllocations(1, 0),
          fetchImpactSummary(),
        ]);

        if (!isMounted) return;

        if (suppliesRes.status === 'fulfilled') {
          const totalVol = suppliesRes.value.items.reduce(
            (acc: number, curr: SupplyListing) => acc + curr.available_volume_kl,
            0
          );
          setSupplyTotal(totalVol);
        }

        if (demandsRes.status === 'fulfilled') {
          const totalVol = demandsRes.value.items.reduce(
            (acc: number, curr: DemandRequest) => acc + curr.required_volume_kl,
            0
          );
          setDemandTotal(totalVol);
        }

        if (runsRes.status === 'fulfilled' && runsRes.value.length > 0) {
          setLatestRun(runsRes.value[0]);
        }

        if (impactRes.status === 'fulfilled' && impactRes.value) {
          setImpactSummary(impactRes.value);
        }
      } catch (err) {
        console.error('Error loading dashboard operational metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboardMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Operational Overview Command Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none opacity-20 bg-gradient-to-br from-water-400 to-aqua-400 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-water-800 bg-water-50 px-2.5 py-1 rounded-md border border-water-200/80">
              Operational Workspace
            </span>
            <StatusBadge status="DEMO" label="Demonstration Network" size="xs" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight font-editorial">
            Regional Water Balance & Allocation Command
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Real-time balance of certified treated-wastewater supplies, commercial buyer intake
            demands, deterministic chemical compatibility gates, and auditable freshwater
            displacement.
          </p>

          {/* Key Operational Metrics Strip (Data-Driven) */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Available Treated Effluent
              </span>
              <span className="text-xl font-mono font-bold text-forest-700 block mt-0.5">
                {loading ? '...' : supplyTotal !== null ? `${supplyTotal.toLocaleString()} kL` : '10,700 kL'}
              </span>
              <span className="text-[10px] text-slate-400">Published Basin Supply</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Commercial Intake Demand
              </span>
              <span className="text-xl font-mono font-bold text-water-700 block mt-0.5">
                {loading ? '...' : demandTotal !== null ? `${demandTotal.toLocaleString()} kL` : '6,500 kL'}
              </span>
              <span className="text-[10px] text-slate-400">Cooling & Boiler Intake</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Potential Displacement
              </span>
              <span className="text-xl font-mono font-bold text-ocean-900 block mt-0.5">
                {loading
                  ? '...'
                  : impactSummary
                  ? `${impactSummary.potential_displacement_kl.toLocaleString()} kL`
                  : latestRun
                  ? `${latestRun.totals.total_potential_displacement_kl.toLocaleString()} kL`
                  : '5,700 kL'}
              </span>
              <span className="text-[10px] text-slate-400">Feasible Matching Volume</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Quality Gatekeeper
              </span>
              <span className="text-xl font-mono font-bold text-forest-700 block mt-0.5">
                100% Active
              </span>
              <span className="text-[10px] text-slate-400">Fail-Closed Tolerance Math</span>
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/app/allocations"
              className="inline-flex items-center gap-2 rounded-xl bg-ocean-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ocean-900 transition-colors"
            >
              <span>Run Allocation Solver</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/app/suppliers"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-ink hover:bg-slate-100 transition-colors"
            >
              Browse Treated Streams
            </Link>
            <Link
              to="/app/impact"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-water-700 hover:text-water-900 ml-2"
            >
              <Leaf className="h-3.5 w-3.5" /> View Impact Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Multi-Tier Impact Provenance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Tier 1: Potential
            </span>
            <StatusBadge status="ESTIMATED" label="Proposed" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-ink">
            {impactSummary ? `${impactSummary.potential_displacement_kl.toLocaleString()}` : '5,700'}{' '}
            <span className="text-xs font-normal text-slate-500">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            Freshwater volume in active uncommitted allocation proposals.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Tier 2: Accepted
            </span>
            <StatusBadge status="CONFIRMED" label="Agreed" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-water-800">
            {impactSummary ? `${impactSummary.accepted_estimated_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-slate-500">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            Bilateral agreements accepted by counterparty; scheduled for dispatch.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Tier 3: Confirmed
            </span>
            <StatusBadge status="CONFIRMED" label="Delivered" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-forest-700">
            {impactSummary ? `${impactSummary.delivery_confirmed_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-slate-500">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            Physically delivered volume with calibrated intake meter receipts.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Tier 4: Certified
            </span>
            <StatusBadge status="PENDING" label="Audited" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-slate-400">
            {impactSummary ? `${impactSummary.independently_verified_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-slate-500">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            Accredited third-party mass balance and disclosure verification.
          </p>
        </div>
      </div>

      {/* 3. Visual Supply versus Demand Equilibrium */}
      <SupplyDemandBalance />

      {/* 4. Closed-Loop Water Transfer Sequence */}
      <WaterFlowDiagram />

      {/* 5. Deterministic Quality Gatekeeper Inspector */}
      <DeterministicGatekeeperCard />

      {/* 6. Candidate Allocation & Cost Comparison Table */}
      <AllocationComparisonTable />

      {/* 7. Procurement Action Hub */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-ocean-900" />
            <h3 className="text-sm font-bold text-ink">
              Water Procurement & Operations Hub
            </h3>
          </div>
          <span className="text-[11px] font-mono text-water-700 font-medium">
            Active Procurement Console
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <Link
            to="/app/suppliers"
            className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-water-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Factory className="h-5 w-5 text-water-600" />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-water-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-semibold text-ink block">Effluent Streams</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Inspect STP/CETP discharge listings with laboratory assay data.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-mono font-medium text-forest-700">
              3 Facilities Active
            </span>
          </Link>

          <Link
            to="/app/demands"
            className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-water-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="h-5 w-5 text-water-600" />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-water-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-semibold text-ink block">Buyer Requirements</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Specify cooling tower & boiler tolerance bands and price ceilings.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-mono font-medium text-water-700">
              3 Demands Registered
            </span>
          </Link>

          <Link
            to="/app/allocations"
            className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-water-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <GitMerge className="h-5 w-5 text-water-600" />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-water-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-semibold text-ink block">Matching Console</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Execute constrained greedy allocation solver and review match proposals.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-mono font-medium text-forest-700">
              Deterministic Math
            </span>
          </Link>

          <Link
            to="/app/deliveries"
            className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 hover:bg-white hover:border-water-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <Truck className="h-5 w-5 text-water-600" />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-water-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="font-semibold text-ink block">Custody & Logistics</span>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Track physical transit, road tanker logs, and gate intake waybills.
              </p>
            </div>
            <span className="mt-3 text-[11px] font-mono font-medium text-slate-500">
              Chain-of-Custody Log
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
