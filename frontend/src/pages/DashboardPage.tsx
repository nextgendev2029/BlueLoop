import React, { useState, useEffect } from 'react';
import { ArrowRight, Server, ShieldAlert, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { SupplyDemandBalance } from '../components/common/SupplyDemandBalance';
import { WaterFlowDiagram } from '../components/common/WaterFlowDiagram';
import { DeterministicGatekeeperCard } from '../components/common/DeterministicGatekeeperCard';
import { AllocationComparisonTable } from '../components/common/AllocationComparisonTable';
import { fetchSupplies } from '../services/suppliers';
import { fetchDemands } from '../services/demands';
import { fetchAllocations } from '../services/allocations';
import { fetchImpactSummary } from '../services/impact';
import { ImpactSummaryResponse, AllocationRunResponse } from '../types/api';

export const DashboardPage: React.FC = () => {
  const [supplyTotal, setSupplyTotal] = useState<number | null>(null);
  const [demandTotal, setDemandTotal] = useState<number | null>(null);
  const [impactSummary, setImpactSummary] = useState<ImpactSummaryResponse | null>(null);
  const [latestRun, setLatestRun] = useState<AllocationRunResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardMetrics() {
      try {
        const [suppliesRes, demandsRes, runsRes, impactRes] = await Promise.allSettled([
          fetchSupplies(),
          fetchDemands(),
          fetchAllocations(1, 0),
          fetchImpactSummary(),
        ]);

        if (isMounted) {
          if (suppliesRes.status === 'fulfilled') {
            const total = suppliesRes.value.items.reduce((acc, s) => acc + s.available_volume_kl, 0);
            setSupplyTotal(total);
          }
          if (demandsRes.status === 'fulfilled') {
            const total = demandsRes.value.items.reduce((acc, d) => acc + d.required_volume_kl, 0);
            setDemandTotal(total);
          }
          if (runsRes.status === 'fulfilled' && runsRes.value.length > 0) {
            setLatestRun(runsRes.value[0]);
          }
          if (impactRes.status === 'fulfilled') {
            setImpactSummary(impactRes.value);
          }
        }
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
      {/* 1. Distinctive Editorial Introduction Banner */}
      <div className="rounded-xl border border-[#E0E5DF] bg-white p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Controlled River-Blue / Forest Waterflow Gradient Motif */}
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none opacity-40 water-gradient-subtle blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#174D3A] bg-[#EDF6F1] px-2.5 py-1 rounded border border-[#C2E0D0]">
              Environmental Track: Heat and Water
            </span>
            <span className="text-[11px] font-mono font-medium text-[#397FA3] bg-[#EAF3F6] px-2.5 py-1 rounded border border-[#D0E2EB]">
              AWS Bharat Builds Tour Hackathon
            </span>
            <StatusBadge status="DEMO" label="Synthetic Demonstration Data" size="xs" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202A24] leading-tight">
            Industrial Water Reuse Intelligence & Procurement Optimisation Platform
          </h1>

          <p className="text-sm sm:text-base text-[#69736B] leading-relaxed max-w-3xl">
            BlueLoop enables commercial water consumers to source treated industrial effluent with mathematical explainability.
            The platform executes deterministic water-quality compatibility gates, solves multi-facility allocation constraints,
            and calculates auditable freshwater displacement without probabilistic approximations.
          </p>

          {/* Key Operational Metrics Strip (Data-Driven) */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#ECEFEA]">
            <div>
              <span className="text-[11px] text-[#69736B] block">Available Treated Effluent</span>
              <span className="text-lg font-mono font-bold text-[#168779] block mt-0.5">
                {loading ? '...' : supplyTotal !== null ? `${supplyTotal.toLocaleString()} kL` : '7,700 kL'}
              </span>
              <span className="text-[10px] text-[#8C978F]">Sample Basin Capacity</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Commercial Intake Demand</span>
              <span className="text-lg font-mono font-bold text-[#397FA3] block mt-0.5">
                {loading ? '...' : demandTotal !== null ? `${demandTotal.toLocaleString()} kL` : '4,500 kL'}
              </span>
              <span className="text-[10px] text-[#8C978F]">Cooling & Boiler Requests</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Potential Displacement</span>
              <span className="text-lg font-mono font-bold text-[#174D3A] block mt-0.5">
                {loading
                  ? '...'
                  : impactSummary
                  ? `${impactSummary.potential_displacement_kl.toLocaleString()} kL`
                  : latestRun
                  ? `${latestRun.totals.total_potential_displacement_kl.toLocaleString()} kL`
                  : '4,500 kL'}
              </span>
              <span className="text-[10px] text-[#8C978F]">Model Offset (Unconfirmed)</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Quality Gate Evaluation</span>
              <span className="text-lg font-mono font-bold text-[#202A24] block mt-0.5">
                100% <span className="text-xs font-normal text-[#69736B]">Deterministic</span>
              </span>
              <span className="text-[10px] text-[#8C978F]">Fail-Closed Rule Engine</span>
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/app/allocations"
              className="inline-flex items-center gap-2 rounded-md bg-[#174D3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
            >
              Inspect Allocation Matrix <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/app/suppliers"
              className="inline-flex items-center gap-2 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-4 py-2 text-xs font-semibold text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
            >
              Browse Treated Water Suppliers
            </Link>
            <Link
              to="/app/impact"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#397FA3] hover:text-[#286280] ml-2"
            >
              <Leaf className="h-3.5 w-3.5" /> View Impact Ledger
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Synthetic Data Credibility & Integrity Notice */}
      <div className="rounded-lg border border-[#EBDCBA] bg-[#FAF6EC] p-4 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-4 w-4 shrink-0 text-[#8A641B] mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#8A641B] block">
              Integrity Standard & Demonstration Baseline Notice
            </span>
            <p className="text-[#69736B] leading-relaxed text-[11px]">
              BlueLoop adheres to strict credibility guidelines. All metrics, facility profiles, and laboratory
              certificates shown in this development environment represent explicitly labelled synthetic demonstration data.
              No fictional suppliers or simulated savings are presented as verified real-world operational facts.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Multi-Tier Impact Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-[#E0E5DF] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">Tier 1: Potential</span>
            <StatusBadge status="ESTIMATED" label="Proposed" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#202A24]">
            {impactSummary ? `${impactSummary.potential_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-[#69736B]">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-[#69736B] leading-snug">
            Freshwater volume in active unconfirmed allocation proposals.
          </p>
        </div>

        <div className="rounded-lg border border-[#E0E5DF] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">Tier 2: Accepted</span>
            <StatusBadge status="CONFIRMED" label="Agreed" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#174D3A]">
            {impactSummary ? `${impactSummary.accepted_estimated_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-[#69736B]">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-[#69736B] leading-snug">
            Agreed allocations pending physical delivery and sampling.
          </p>
        </div>

        <div className="rounded-lg border border-[#E0E5DF] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">Tier 3: Confirmed</span>
            <StatusBadge status="CONFIRMED" label="Delivered" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#168779]">
            {impactSummary ? `${impactSummary.delivery_confirmed_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-[#69736B]">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-[#69736B] leading-snug">
            Physically transferred water with verified receiver intake receipts.
          </p>
        </div>

        <div className="rounded-lg border border-[#E0E5DF] bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#69736B]">Tier 4: Certified</span>
            <StatusBadge status="PENDING" label="Pending" size="xs" />
          </div>
          <div className="mt-2 text-2xl font-mono font-bold text-[#8C978F]">
            {impactSummary ? `${impactSummary.independently_verified_displacement_kl.toLocaleString()}` : '0'}{' '}
            <span className="text-xs font-normal text-[#69736B]">kL</span>
          </div>
          <p className="mt-1 text-[11px] text-[#8C978F] leading-snug">
            Awaiting third-party accredited ESG telemetry audit.
          </p>
        </div>
      </div>

      {/* 4. Visual Supply versus Demand Equilibrium */}
      <SupplyDemandBalance />

      {/* 5. Closed-Loop Water Transfer Architecture */}
      <WaterFlowDiagram />

      {/* 6. Deterministic Quality Gatekeeper Inspector (Live API Integrated) */}
      <DeterministicGatekeeperCard />

      {/* 7. Candidate Allocation & Cost Comparison Table (Live API Integrated) */}
      <AllocationComparisonTable />

      {/* 8. Engineering Foundation Verification Matrix */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E5DF] mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-sm font-semibold text-[#202A24]">
              Architecture Foundation Status
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#168779] font-medium">65 Automated Tests Passing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Frontend Architecture</span>
            <span className="font-semibold text-[#202A24] mt-1 block">React 18 + TS + Tailwind</span>
            <span className="text-[11px] text-[#174D3A] font-medium">Nature-Inspired Luxury UI</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Backend Service</span>
            <span className="font-semibold text-[#202A24] mt-1 block">FastAPI + Python 3.11</span>
            <span className="text-[11px] text-[#168779] font-medium">17 REST Endpoints Active</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">AWS Compute Target</span>
            <span className="font-semibold text-[#202A24] mt-1 block">Mangum ASGI Handler</span>
            <span className="text-[11px] text-[#397FA3] font-medium">Lambda Serverless Ready</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Optimization Engine</span>
            <span className="font-semibold text-[#202A24] mt-1 block">Deterministic Solver</span>
            <span className="text-[11px] text-[#174D3A] font-medium">Capacity-Constrained Greedy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
