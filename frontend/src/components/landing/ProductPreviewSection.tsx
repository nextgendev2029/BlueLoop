import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GitMerge,
  ShieldCheck,
  Truck,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'allocations' | 'gatekeeper' | 'deliveries'>(
    'allocations'
  );

  return (
    <section id="product-preview" className="py-24 bg-white border-y border-[#DCE7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1677B8]">
              Platform Interface Preview
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172B36] sm:text-4xl font-editorial">
              Engineered for Industrial Procurement Teams
            </h2>
            <p className="mt-2 text-sm text-[#637680] max-w-xl">
              An operational workspace designed for transparent environmental infrastructure decisions-combining chemical rigor with logistics optimization.
            </p>
          </div>

          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#123B56] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#1677B8] transition-colors shrink-0"
          >
            <span>Launch Live Console</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Tab Selection */}
        <div className="mt-10 flex border-b border-[#DCE7EB] gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('allocations')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'allocations'
                ? 'border-[#1677B8] text-[#1677B8]'
                : 'border-transparent text-[#637680] hover:text-[#172B36]'
            }`}
          >
            <GitMerge className="h-3.5 w-3.5" />
            Allocation Solver Output
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gatekeeper')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gatekeeper'
                ? 'border-[#1677B8] text-[#1677B8]'
                : 'border-transparent text-[#637680] hover:text-[#172B36]'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Chemical Compatibility Gatekeeper
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deliveries')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'deliveries'
                ? 'border-[#1677B8] text-[#1677B8]'
                : 'border-transparent text-[#637680] hover:text-[#172B36]'
            }`}
          >
            <Truck className="h-3.5 w-3.5" />
            Chain of Custody Tracking
          </button>
        </div>

        {/* Realistic Console Window */}
        <div className="mt-6 rounded-2xl border border-[#DCE7EB] bg-[#FAFBF9] p-5 md:p-8 shadow-elevated">
          {/* Mock Console Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE7EB] mb-6">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E0E5DF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E0E5DF]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E0E5DF]" />
              <span className="ml-2 text-xs font-mono text-[#637680]">
                console.blueloop.local / session-demo
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#1677B8] px-2 py-0.5 rounded-sm bg-[#E8F5F8]">
              Synthetic Seed Mode: Active
            </div>
          </div>

          {/* Tab 1: Allocations Preview */}
          {activeTab === 'allocations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-[#DCE7EB] bg-white p-3">
                  <span className="text-[#637680] text-[11px] block">Solver Algorithm</span>
                  <span className="font-semibold text-[#172B36]">Greedy Constrained Cost Minimizer</span>
                </div>
                <div className="rounded-xl border border-[#DCE7EB] bg-white p-3">
                  <span className="text-[#637680] text-[11px] block">Proposed Allocation</span>
                  <span className="font-semibold text-[#1677B8]">400 kL / 400 kL (100% Demand Met)</span>
                </div>
                <div className="rounded-xl border border-[#DCE7EB] bg-white p-3">
                  <span className="text-[#637680] text-[11px] block">Delivered Tariff</span>
                  <span className="font-semibold text-[#172B36]">₹39.54 / kL (Haulage: 14.2 km)</span>
                </div>
                <div className="rounded-xl border border-[#DCE7EB] bg-white p-3">
                  <span className="text-[#637680] text-[11px] block">Proposal Status</span>
                  <span className="font-semibold text-[#174D3A] inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-[#168779]" /> ACCEPTED
                  </span>
                </div>
              </div>

              {/* Candidates Table Preview */}
              <div className="rounded-xl border border-[#DCE7EB] bg-white overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FAFBF9] border-b border-[#DCE7EB] text-[11px] font-semibold text-[#637680]">
                    <tr>
                      <th className="py-2.5 px-4">Supplier Source</th>
                      <th className="py-2.5 px-4">Consumer Intake</th>
                      <th className="py-2.5 px-4">Volume</th>
                      <th className="py-2.5 px-4">Delivered Cost</th>
                      <th className="py-2.5 px-4">Decision Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8F0F3]">
                    <tr className="hover:bg-[#F0F9FB]/50">
                      <td className="py-2.5 px-4 font-medium text-[#172B36]">
                        Koyambedu Water Reclamation (Grade A)
                      </td>
                      <td className="py-2.5 px-4 text-[#637680]">Apex Automobile Cooling Tower</td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-[#1677B8]">400 kL</td>
                      <td className="py-2.5 px-4 font-mono text-[#172B36]">₹15,816</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#174D3A] font-medium">
                          <CheckCircle2 className="h-3 w-3 text-[#168779]" /> 6/6 Parameters Compliant
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#F0F9FB]/50 opacity-75">
                      <td className="py-2.5 px-4 font-medium text-[#172B36]">
                        Industrial CETP Maraimalai (Grade B)
                      </td>
                      <td className="py-2.5 px-4 text-[#637680]">Thermal Power Station Boiler</td>
                      <td className="py-2.5 px-4 font-mono text-[#8A9BA4]">0 kL (Rejected)</td>
                      <td className="py-2.5 px-4 font-mono text-[#8A9BA4]">--</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#972B28] font-medium">
                          <XCircle className="h-3 w-3 text-[#972B28]" /> TDS (1850 mg/L) exceeds limit
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Gatekeeper Preview */}
          {activeTab === 'gatekeeper' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#DCE7EB] bg-white p-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8F0F3]">
                  <div>
                    <span className="text-xs font-bold text-[#172B36]">
                      Candidate Pair: SYNTH-LIST-01 &harr; SYNTH-DEM-01
                    </span>
                    <p className="text-[11px] text-[#637680] mt-0.5">
                      Cooling Tower Makeup Specification vs Tertiary Polished Effluent
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#174D3A] bg-[#EBF5F3] px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#168779]" /> SCREENING PASS
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] text-center">
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">pH</span>
                    <span className="font-semibold text-[#172B36]">7.2</span>
                    <span className="text-[9px] text-[#168779] block">Pass (6.5-8.5)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">TDS</span>
                    <span className="font-semibold text-[#172B36]">450 mg/L</span>
                    <span className="text-[9px] text-[#168779] block">Pass (&le; 1000)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">TSS</span>
                    <span className="font-semibold text-[#172B36]">12 mg/L</span>
                    <span className="text-[9px] text-[#168779] block">Pass (&le; 30)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">COD</span>
                    <span className="font-semibold text-[#172B36]">35 mg/L</span>
                    <span className="text-[9px] text-[#168779] block">Pass (&le; 50)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">BOD</span>
                    <span className="font-semibold text-[#172B36]">8 mg/L</span>
                    <span className="text-[9px] text-[#168779] block">Pass (&le; 10)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB]">
                    <span className="text-[#637680] block text-[10px]">Turbidity</span>
                    <span className="font-semibold text-[#172B36]">1.8 NTU</span>
                    <span className="text-[9px] text-[#168779] block">Pass (&le; 5.0)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Deliveries Preview */}
          {activeTab === 'deliveries' && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#DCE7EB] bg-white p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-bold text-[#172B36]">Transfer DEL-2026-001 (Road Tanker)</span>
                    <span className="text-[#637680] block text-[11px]">Koyambedu &rarr; Apex Assembly Plant</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#1677B8] bg-[#E8F5F8] px-2 py-0.5 rounded-sm">
                    400 kL Metered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-[#EBF5F3] border border-[#D9E8DF] text-[#174D3A] font-semibold">
                    1. Scheduled
                  </div>
                  <div className="p-2 rounded-lg bg-[#EBF5F3] border border-[#D9E8DF] text-[#174D3A] font-semibold">
                    2. Dispatched
                  </div>
                  <div className="p-2 rounded-lg bg-[#EBF5F3] border border-[#D9E8DF] text-[#174D3A] font-semibold">
                    3. In Transit
                  </div>
                  <div className="p-2 rounded-lg bg-[#E8F5F8] border border-[#DCE7EB] text-[#1677B8] font-semibold">
                    4. Pending Verification
                  </div>
                  <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#DCE7EB] text-[#8A9BA4]">
                    5. Verified Confirmed
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
