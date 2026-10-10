import React, { useState, useEffect } from 'react';
import { Scale, Droplet, Layers, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { fetchSupplies } from '../../services/suppliers';
import { fetchDemands } from '../../services/demands';
import { SupplyListing, DemandRequest } from '../../types/api';

export const SupplyDemandBalance: React.FC = () => {
  const [supplies, setSupplies] = useState<SupplyListing[]>([]);
  const [demands, setDemands] = useState<DemandRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [suppliesRes, demandsRes] = await Promise.all([
          fetchSupplies(),
          fetchDemands(),
        ]);
        if (isMounted) {
          setSupplies(suppliesRes.items);
          setDemands(demandsRes.items);
        }
      } catch (err) {
        // Handled silently for widget fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSupplyKl = supplies.reduce((sum, s) => sum + s.available_volume_kl, 0);
  const totalDemandKl = demands.reduce((sum, d) => sum + d.required_volume_kl, 0);
  const netBalance = totalSupplyKl - totalDemandKl;

  // Breakdown by water grade
  const gradeBreakdown: Record<string, number> = {};
  supplies.forEach((s) => {
    gradeBreakdown[s.water_grade] = (gradeBreakdown[s.water_grade] || 0) + s.available_volume_kl;
  });

  // Breakdown by intended use
  const useBreakdown: Record<string, number> = {};
  demands.forEach((d) => {
    useBreakdown[d.intended_use] = (useBreakdown[d.intended_use] || 0) + d.required_volume_kl;
  });

  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-[#174D3A]" />
            <h3 className="text-base font-semibold text-[#202A24]">
              Regional Water Supply vs Demand Equilibrium
            </h3>
            <StatusBadge status="DEMO" label="Demonstration Dataset" size="xs" />
          </div>
          <p className="text-xs text-[#69736B]">
            Aggregated industrial effluent volume vs registered intake requests across active demo facilities.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#69736B]">Net Basin Balance:</span>
          {netBalance >= 0 ? (
            <span className="font-mono font-semibold text-[#174D3A] bg-[#EDF6F1] px-2 py-0.5 rounded border border-[#C2E0D0]">
              +{netBalance.toLocaleString()} kL Potential Surplus
            </span>
          ) : (
            <span className="font-mono font-semibold text-[#972B28] bg-[#FDF3F2] px-2 py-0.5 rounded border border-[#F4D1CE]">
              {netBalance.toLocaleString()} kL Deficit
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center gap-2 text-xs text-[#69736B]">
          <RefreshCw className="h-4 w-4 animate-spin text-[#168779]" />
          Computing regional supply & demand balance...
        </div>
      ) : (
        /* Comparative Balance Grid */
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
                {totalSupplyKl.toLocaleString()} <span className="text-xs font-normal text-[#69736B]">kL</span>
              </span>
            </div>

            {/* Volume Breakdown Bars */}
            <div className="space-y-3">
              {Object.entries(gradeBreakdown).map(([grade, vol]) => {
                const pct = totalSupplyKl > 0 ? ((vol / totalSupplyKl) * 100).toFixed(1) : '0';
                return (
                  <div key={grade}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#202A24] font-medium flex items-center gap-1.5 truncate">
                        <Droplet className="h-3 w-3 text-[#168779] shrink-0" />
                        {grade.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[#69736B]">
                        {vol.toLocaleString()} kL ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                      <div
                        className="h-full bg-[#168779] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E0E5DF] flex justify-between text-[11px] text-[#69736B]">
              <span>Active Supply Listings: <strong className="text-[#202A24]">{supplies.length} Batches</strong></span>
              <span>Available Effluent Source: <strong className="text-[#202A24]">Metropolitan Corridor</strong></span>
            </div>
          </div>

          {/* Right Column: Commercial & Industrial Demand */}
          <div className="rounded-md border border-[#E0E5DF] bg-[#F7F7F2] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#397FA3]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#202A24]">
                  Commercial Demand Requests
                </h4>
              </div>
              <span className="text-sm font-mono font-bold text-[#397FA3]">
                {totalDemandKl.toLocaleString()} <span className="text-xs font-normal text-[#69736B]">kL</span>
              </span>
            </div>

            {/* Volume Demand Breakdown Bars */}
            <div className="space-y-3">
              {Object.entries(useBreakdown).map(([use, vol]) => {
                const pct = totalDemandKl > 0 ? ((vol / totalDemandKl) * 100).toFixed(1) : '0';
                return (
                  <div key={use}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#202A24] font-medium flex items-center gap-1.5 truncate">
                        <Layers className="h-3 w-3 text-[#397FA3] shrink-0" />
                        {use.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono text-[#69736B]">
                        {vol.toLocaleString()} kL ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#E0E5DF] overflow-hidden">
                      <div
                        className="h-full bg-[#397FA3] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E0E5DF] flex justify-between text-[11px] text-[#69736B]">
              <span>Active Demand Requests: <strong className="text-[#202A24]">{demands.length} Facilities</strong></span>
              <span>Intake Coverage: <strong className="text-[#174D3A]">{totalDemandKl > 0 ? ((Math.min(totalSupplyKl, totalDemandKl) / totalDemandKl) * 100).toFixed(0) : 0}% Potential</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
