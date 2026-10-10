import React from 'react';
import { ShieldAlert, ArrowRight, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';
import { SupplyDemandBalance } from '../components/common/SupplyDemandBalance';
import { WaterFlowDiagram } from '../components/common/WaterFlowDiagram';
import { DeterministicGatekeeperCard } from '../components/common/DeterministicGatekeeperCard';
import { AllocationComparisonTable } from '../components/common/AllocationComparisonTable';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. Distinctive Editorial Introduction Banner */}
      <div className="rounded-xl border border-[#E0E5DF] bg-white p-6 sm:p-8 shadow-card relative overflow-hidden">
        {/* Subtle Waterflow Organic Background Motif */}
        <div
          className="absolute -right-24 -top-24 w-96 h-96 rounded-full pointer-events-none opacity-40 water-gradient-subtle blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#174D3A] bg-[#EDF6F1] px-2.5 py-1 rounded border border-[#C2E0D0]">
              Environmental Track: Heat and Water
            </span>
            <span className="text-[11px] font-mono font-medium text-[#69736B] bg-[#F7F7F2] px-2.5 py-1 rounded border border-[#E0E5DF]">
              AWS Bharat Builds Tour Hackathon
            </span>
            <StatusBadge status="DEMO" label="Demonstration Environment" size="xs" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#202A24] leading-tight">
            Industrial Water Reuse Intelligence & Procurement Optimisation Platform
          </h1>

          <p className="text-sm sm:text-base text-[#69736B] leading-relaxed max-w-3xl">
            BlueLoop enables commercial water consumers to source certified treated industrial
            effluent with mathematical certainty. The platform executes deterministic water-quality
            compatibility checks, solves multi-facility allocation constraints, and calculates verified
            freshwater displacement without black-box AI approximations.
          </p>

          {/* Key Editorial Metrics Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#ECEFEA]">
            <div>
              <span className="text-[11px] text-[#69736B] block">Available Treated Effluent</span>
              <span className="text-lg font-mono font-bold text-[#168779] block mt-0.5">
                16,200 <span className="text-xs font-normal text-[#69736B]">kL/day</span>
              </span>
              <span className="text-[10px] text-[#8C978F]">Sample Basin Capacity</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Commercial Intake Demand</span>
              <span className="text-lg font-mono font-bold text-[#174D3A] block mt-0.5">
                11,400 <span className="text-xs font-normal text-[#69736B]">kL/day</span>
              </span>
              <span className="text-[10px] text-[#8C978F]">Cooling & Boiler Intake</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Freshwater Displacement</span>
              <span className="text-lg font-mono font-bold text-[#174D3A] block mt-0.5">
                8,900 <span className="text-xs font-normal text-[#69736B]">kL/day</span>
              </span>
              <span className="text-[10px] text-[#8C978F]">Direct Groundwater Offset</span>
            </div>
            <div>
              <span className="text-[11px] text-[#69736B] block">Quality Gatekeeper Logic</span>
              <span className="text-lg font-mono font-bold text-[#202A24] block mt-0.5">
                100% <span className="text-xs font-normal text-[#69736B]">Deterministic</span>
              </span>
              <span className="text-[10px] text-[#8C978F]">Zero Probabilistic Risk</span>
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/allocations"
              className="inline-flex items-center gap-2 rounded-md bg-[#174D3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
            >
              Inspect Allocation Matrix <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/suppliers"
              className="inline-flex items-center gap-2 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-4 py-2 text-xs font-semibold text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
            >
              Browse Treated Water Suppliers
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Synthetic Data Credibility Notice */}
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

      {/* 3. Visual Supply versus Demand Equilibrium */}
      <SupplyDemandBalance />

      {/* 4. Closed-Loop Water Transfer Architecture */}
      <WaterFlowDiagram />

      {/* 5. Deterministic Quality Gatekeeper Inspector */}
      <DeterministicGatekeeperCard />

      {/* 6. Candidate Allocation & Cost Comparison Table */}
      <AllocationComparisonTable />

      {/* 7. Engineering Foundation Verification Matrix */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-6 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-[#E0E5DF] mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-sm font-semibold text-[#202A24]">
              Architecture Foundation Status
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#69736B]">Master Phase 01 Completed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Frontend Architecture</span>
            <span className="font-semibold text-[#202A24] mt-1 block">React 18 + TS + Tailwind</span>
            <span className="text-[11px] text-[#174D3A] font-medium">Design Tokens Verified</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Backend Service</span>
            <span className="font-semibold text-[#202A24] mt-1 block">FastAPI + Python 3.11</span>
            <span className="text-[11px] text-[#174D3A] font-medium">GET /api/v1/health (200 OK)</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">AWS Compute Target</span>
            <span className="font-semibold text-[#202A24] mt-1 block">Mangum ASGI Handler</span>
            <span className="text-[11px] text-[#174D3A] font-medium">Serverless Ready</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] font-mono uppercase block">Engine Philosophy</span>
            <span className="font-semibold text-[#202A24] mt-1 block">Deterministic Constraints</span>
            <span className="text-[11px] text-[#174D3A] font-medium">Explainable Output</span>
          </div>
        </div>
      </div>
    </div>
  );
};
