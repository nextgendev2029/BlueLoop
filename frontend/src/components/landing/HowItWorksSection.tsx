import React from 'react';
import { Search, ShieldAlert, GitMerge, FileText, CheckCircle2 } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Discover Available Supply',
      description:
        'Treatment facilities publish periodic batch listings with accredited laboratory test profiles-pH, TDS, TSS, COD, BOD, and heavy metals.',
      icon: Search,
      highlight: 'Explicit water grades (A–D)',
    },
    {
      step: '02',
      title: 'Deterministic Quality Screening',
      description:
        'The engine checks batch lab tests against buyer intake limits. Missing measurements evaluate to UNKNOWN and fail closed. Compliance is never assumed.',
      icon: ShieldAlert,
      highlight: 'Fail-closed chemical gatekeeping',
    },
    {
      step: '03',
      title: 'Constrained Allocation Optimisation',
      description:
        'A deterministic greedy solver assigns available volumes, computes Haversine transport tariffs, enforces price ceilings, and generates explicit rejection reason codes.',
      icon: GitMerge,
      highlight: 'Explainable matching traces',
    },
    {
      step: '04',
      title: 'Custody Tracking & Impact Ledger',
      description:
        'Approved proposals progress through 5 custody stages. Environmental displacement is isolated across 4 strict provenance tiers to eliminate greenwashing.',
      icon: FileText,
      highlight: 'Auditable 4-tier ESG accounting',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#FAFBF9]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#1677B8]">
            Deterministic Engineering
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#172B36] sm:text-4xl font-editorial">
            How BlueLoop Powers Industrial Water Circularity
          </h2>
          <p className="mt-3 text-sm text-[#637680] leading-relaxed">
            From treated effluent stream discovery to verified custody transfer, every decision is governed by explainable rules rather than black-box approximations.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-[#DCE7EB] bg-white p-6 shadow-subtle hover:shadow-elevated transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#DCE7EB] font-mono">
                      {item.step}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F5F8] text-[#1677B8]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-sm font-bold text-[#172B36]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#637680] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-[#E8F0F3]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1677B8]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#24B8C7]" />
                    {item.highlight}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
