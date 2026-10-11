import React from 'react';
import { AlertTriangle, ShieldCheck, Waves } from 'lucide-react';

export const TheProblemSection: React.FC = () => {
  return (
    <section id="the-problem" className="py-24 bg-white border-y border-[#DCE7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1677B8]">
            The Industrial Water Paradox
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172B36] sm:text-4xl font-editorial">
            Treated water is discharged while nearby factories deplete freshwater reserves.
          </h2>
          <p className="mt-3 text-base text-[#637680] leading-relaxed">
            Common Effluent Treatment Plants (CETPs) discharge high-grade treated effluent daily. 
            Simultaneously, manufacturing facilities draw potable municipal water for cooling towers.
            The barrier is not supply availability—it is the absence of deterministic quality verification and transparent delivery logistics.
          </p>
        </div>

        {/* Narrative Comparison Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: The Producer Dilemma */}
          <div className="rounded-2xl border border-[#DCE7EB] bg-[#FAFBF9] p-7 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F5F8] text-[#1677B8]">
                <Waves className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#172B36]">
                The Effluent Producer Reality
              </h3>
              <p className="mt-2 text-xs text-[#637680] leading-relaxed">
                Industrial treatment facilities generate consistent batches of tertiary treated water. 
                Without codified discovery, surplus volumes are discharged as industrial waste, incurring disposal levies rather than generating circular revenue.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DCE7EB] text-[11px] text-[#637680] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1677B8]" />
              <span>Surplus capacity unmonetized</span>
            </div>
          </div>

          {/* Card 2: The Consumer Barrier */}
          <div className="rounded-2xl border border-[#DCE7EB] bg-[#FAFBF9] p-7 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF6EC] text-[#8A641B]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#172B36]">
                The Consumer Risk Barrier
              </h3>
              <p className="mt-2 text-xs text-[#637680] leading-relaxed">
                Cooling tower operators fear heat-exchanger scaling and pipe corrosion. 
                Without guaranteed chemical boundary tests (pH, TDS, COD, chlorides), plant managers default to expensive potable groundwater to safeguard millions in machinery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DCE7EB] text-[11px] text-[#8A641B] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8A641B]" />
              <span>Fear of equipment degradation</span>
            </div>
          </div>

          {/* Card 3: The BlueLoop Bridge */}
          <div className="rounded-2xl border border-[#1677B8]/30 bg-gradient-to-br from-[#123B56] to-[#1677B8] p-7 text-white flex flex-col justify-between shadow-elevated">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#24B8C7]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">
                The BlueLoop Deterministic Bridge
              </h3>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                BlueLoop automates the technical gatekeeping. Parameter-level mathematical rules match batch test certificates against buyer tolerance boundaries, calculate landed haulage tariffs, and produce explainable allocation decisions.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/15 text-[11px] text-[#24B8C7] flex items-center gap-2 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#24B8C7]" />
              <span>Fail-closed chemical validation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
