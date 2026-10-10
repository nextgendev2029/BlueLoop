import React from 'react';
import { Scale, Droplet, Layers } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const SupplyDemandBalance: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-base font-semibold text-[#202A24]">
              Regional Water Supply vs Demand Equilibrium
            </h3>
            <StatusBadge status="DEMO" label="Demo Industrial Basin" size="xs" />
          </div>
          <p className="text-xs text-[#69736B]">
            Aggregated industrial effluent output vs registered intake demand across participating facilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#69736B]">Net Basin Balance:</span>
          <span className="font-mono font-semibold text-[#174D3A] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
            +4,800 kL/day Potential Surplus
          </span>
        </div>
      </div>

      {/* Comparative Gauge Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Available Treated Supply */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#168779]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A24]">
                Treated Effluent Supply Available
              </h4>
            </div>
            <span className="text-sm font-mono font-bold text-[#168779]">
              16,200 <span className="text-xs font-normal text-[#69736B]">kL/day</span>
            </span>
          </div>

          {/* Volume Breakdown Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Droplet className="h-3 w-3 text-[#168779]" /> Grade A: RO Permeate (TDS &lt; 500)
                </span>
                <span className="font-mono text-[#69736B]">6,400 kL (39.5%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#168779] rounded-full" style={{ width: '39.5%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Droplet className="h-3 w-3 text-[#174D3A]" /> Grade B: Tertiary Polished (TDS 500–1500)
                </span>
                <span className="font-mono text-[#69736B]">7,100 kL (43.8%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#174D3A] rounded-full" style={{ width: '43.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Droplet className="h-3 w-3 text-[#8C978F]" /> Grade C: Secondary Clarified (Non-Process)
                </span>
                <span className="font-mono text-[#69736B]">2,700 kL (16.7%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#8C978F] rounded-full" style={{ width: '16.7%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E0E5DF] flex justify-between text-[11px] text-[#69736B]">
            <span>Active Supplier Facilities: <strong className="text-[#202A24]">4 Units</strong></span>
            <span>Avg Distance to Corridor: <strong className="text-[#202A24]">18.4 km</strong></span>
          </div>
        </div>

        {/* Right Column: Commercial & Industrial Demand */}
        <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#174D3A]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A24]">
                Commercial Demand Intake Requests
              </h4>
            </div>
            <span className="text-sm font-mono font-bold text-[#174D3A]">
              11,400 <span className="text-xs font-normal text-[#69736B]">kL/day</span>
            </span>
          </div>

          {/* Volume Demand Breakdown Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-[#174D3A]" /> Cooling Towers (HVAC & Data Centers)
                </span>
                <span className="font-mono text-[#69736B]">5,800 kL (50.8%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#174D3A] rounded-full" style={{ width: '50.8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-[#168779]" /> Industrial Boiler Feed Makeup
                </span>
                <span className="font-mono text-[#69736B]">3,100 kL (27.2%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#168779] rounded-full" style={{ width: '27.2%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#202A24] font-medium flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-[#8C978F]" /> Construction Batching & Dust Control
                </span>
                <span className="font-mono text-[#69736B]">2,500 kL (22.0%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                <div className="h-full bg-[#8C978F] rounded-full" style={{ width: '22.0%' }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E0E5DF] flex justify-between text-[11px] text-[#69736B]">
            <span>Active Buyer Requests: <strong className="text-[#202A24]">6 Requests</strong></span>
            <span>Target Displacement Ratio: <strong className="text-[#174D3A]">94.2%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
