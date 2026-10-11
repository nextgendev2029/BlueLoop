import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  ArrowRight,
  FileCheck2,
  ShieldCheck,
  Database,
  Sparkles,
} from 'lucide-react';

interface ProvenanceStage {
  id: number;
  key: string;
  name: string;
  shortName: string;
  tierNumber: string;
  statusBadge: string;
  badgeStyle: string;
  definition: string;
  verificationEvidence: {
    title: string;
    description: string;
  }[];
  auditRecognition: string;
  auditBadgeStyle: string;
  sampleMetric: string;
  disclaimer: string;
  verificationCategory: string;
  colorAccent: string;
}

const PROVENANCE_STAGES: ProvenanceStage[] = [
  {
    id: 1,
    key: 'potential',
    name: 'Potential Displacement',
    shortName: '01 Potential',
    tierNumber: 'Tier 1',
    statusBadge: 'Tier 1: Modeled Screening',
    badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300',
    definition:
      'Identified by BlueLoop algorithmic chemical screening and haversine transport modeling. No commercial commitment signed.',
    verificationEvidence: [
      {
        title: 'Certified Laboratory Assay (COA < 90 days old)',
        description: 'Digitized lab profile confirming pH, TDS, COD, and heavy-metal limits within intake range.',
      },
      {
        title: 'Buyer Process Tolerance Band Document',
        description: 'Automated parameter matching against rigid industrial cooling or process specifications.',
      },
      {
        title: 'Geographical Proximity & Haversine Calculation',
        description: 'Transport envelope verification confirming viable logistics distance and route access.',
      },
      {
        title: 'Ex-Works Cost Envelope Comparison',
        description: 'Mathematical cost modeling comparing treated-effluent substitution against baseline utility tariffs.',
      },
    ],
    auditRecognition: '0% Recognized for ESG Disclosures',
    auditBadgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
    sampleMetric: '14,200 kL/month feasible substitution for cooling intake',
    disclaimer: 'Purely mathematical estimation. Does not represent actual freshwater saved.',
    verificationCategory: 'Mathematical Screening Feasibility',
    colorAccent: '#64748b',
  },
  {
    id: 2,
    key: 'accepted',
    name: 'Agreed Allocation',
    shortName: '02 Agreed',
    tierNumber: 'Tier 2',
    statusBadge: 'Tier 2: Commercial Contract',
    badgeStyle: 'bg-water-100 text-water-800 border-water-300',
    definition:
      'Supplier and buyer have formally accepted the bilateral allocation proposal with scheduled volumetric flow and quality SLAs.',
    verificationEvidence: [
      {
        title: 'Bilateral Counterparty Signed Agreement',
        description: 'Digitally accepted allocation terms with immutable timestamps for buyer and supplier entities.',
      },
      {
        title: 'Agreed Quality SLA Envelope',
        description: 'Contractual boundaries established for pH, TDS, COD, Turbidity, and total dissolved solids.',
      },
      {
        title: 'Delivery Schedule (kL/day reservation)',
        description: 'Committed volume reservation registered in the regional capacity balancing registry.',
      },
      {
        title: 'Logistics Dispatch Routing & Modal Choice',
        description: 'Designated carrier mode (dedicated tanker fleet or direct metered tertiary pipeline).',
      },
    ],
    auditRecognition: 'Committed Corporate Pipeline',
    auditBadgeStyle: 'bg-water-100 text-water-800 border-water-200',
    sampleMetric: '10,000 kL monthly firm reservation from Metro Tertiary Plant',
    disclaimer: 'Contracted intent. Water has not yet physically transferred.',
    verificationCategory: 'Commercial Bilateral Commitment',
    colorAccent: '#0284c7',
  },
  {
    id: 3,
    key: 'confirmed',
    name: 'Delivered Displacement',
    shortName: '03 Delivered',
    tierNumber: 'Tier 3',
    statusBadge: 'Tier 3: Physical Telemetry',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    definition:
      'Treated effluent physically transferred, received at industrial facility gate, and confirmed via calibrated flow meters.',
    verificationEvidence: [
      {
        title: 'Source Facility Discharge Flow Meter Telemetry',
        description: 'Calibrated output log recording actual outflow volume leaving the tertiary treatment plant.',
      },
      {
        title: 'Carrier Waybill & Custody Transfer Receipt',
        description: 'Signed bill of lading or pipeline transmission receipt linking dispatcher to facility receiving dock.',
      },
      {
        title: 'Buyer Intake Flow Meter Log (< 1.5% discrepancy)',
        description: 'Dual-meter reconciliation validating physical receipt at consumer cooling intake boundary.',
      },
      {
        title: 'Daily Delivery Ledger Entry in Durable Database',
        description: 'Cryptographic hash logged in persistent storage referencing bilateral agreement ID.',
      },
    ],
    auditRecognition: 'Recognized for Operational Reporting',
    auditBadgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    sampleMetric: '8,450 kL physically metered into industrial cooling loops',
    disclaimer: 'Verified physical transfer. Direct displacement of virgin freshwater.',
    verificationCategory: 'Calibrated Physical Transfer',
    colorAccent: '#059669',
  },
  {
    id: 4,
    key: 'certified',
    name: 'Audited & Certified',
    shortName: '04 Certified',
    tierNumber: 'Tier 4',
    statusBadge: 'Tier 4: Third-Party Verified',
    badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
    definition:
      'Independent accredited environmental auditor has certified the physical mass-balance, diversion from surface discharge, and municipal groundwater baseline offset.',
    verificationEvidence: [
      {
        title: 'ISO 14046 / Water Stewardship Audit Report',
        description: 'Third-party life-cycle water footprint verification performed under accredited assurance standards.',
      },
      {
        title: 'Third-Party Utility Ledger Reconciliation',
        description: 'Proof of virgin municipal withdrawal reduction cross-referenced with municipal water bills.',
      },
      {
        title: 'Municipal Abstraction Reduction Permits',
        description: 'Official groundwater extraction permit offset recognized by regional water board authorities.',
      },
      {
        title: 'Tamper-Evident Ledger Signature & Digital Hash',
        description: 'Durable cryptographically sealed report bundle ready for corporate sustainability disclosures.',
      },
    ],
    auditRecognition: 'Audit-Ready for CSRD, SEC & GRI Filings',
    auditBadgeStyle: 'bg-purple-100 text-purple-800 border-purple-200',
    sampleMetric: '118,500 kL annual verified municipal abstraction reduction',
    disclaimer: 'Highest provenance standard. Zero greenwashing risk.',
    verificationCategory: 'External Auditor Mass-Balance Certification',
    colorAccent: '#9333ea',
  },
];

export const ImpactTransparencySection: React.FC = () => {
  // Start cleanly at Stage 1
  const [activeStageId, setActiveStageId] = useState<number>(1);

  // Bidirectional scroll detection
  const handleScroll = useCallback(() => {
    const cardElements = PROVENANCE_STAGES.map((s) => ({
      id: s.id,
      element: document.getElementById(`stage-card-${s.id}`),
    }));

    const viewportCenter = window.innerHeight * 0.45;
    let closestStage = 1;
    let minDistance = Infinity;

    cardElements.forEach(({ id, element }) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const cardCenter = rect.top + rect.height * 0.4;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestStage = id;
      }
    });

    setActiveStageId(closestStage);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Smooth scroll to a chosen stage card
  const scrollToStage = (stageId: number) => {
    setActiveStageId(stageId);
    const element = document.getElementById(`stage-card-${stageId}`);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, stageId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToStage(stageId);
    }
  };

  return (
    <section id="impact" className="py-24 sm:py-32 bg-[#FAFBF9] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-50 border border-water-200/80 text-water-800 text-xs font-semibold tracking-wide uppercase mb-4">
            <Scale className="h-3.5 w-3.5 text-water-600" />
            Impact Provenance Protocol
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-medium tracking-tight text-ink leading-tight">
            Water accounting that withstands regulatory and financial scrutiny.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Generic carbon calculators rely on speculative emissions multipliers. BlueLoop implements
            a strict 4-stage provenance protocol where claimed freshwater savings must be proved with
            physical telemetry and calibrated intake meters before entering corporate disclosures.
          </p>
        </div>

        {/* Mobile Sticky Horizontal Stepper */}
        <div className="lg:hidden sticky top-16 z-20 mb-8 bg-[#FAFBF9]/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-slate-200/80">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {PROVENANCE_STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => scrollToStage(stage.id)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-ocean-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? 'bg-aqua-400' : 'bg-slate-300'
                    }`}
                  />
                  <span>{stage.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Story Grid: Desktop Sticky Indicator Rail + Vertical Stacked Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Desktop Left Rail: Sticky Progress Story Navigation */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 self-start space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Provenance Progression Rail
                </span>
                <span className="text-xs font-mono font-bold text-water-700">
                  Stage 0{activeStageId} / 04
                </span>
              </div>

              {/* Stepped Timeline */}
              <div className="space-y-3 relative">
                {PROVENANCE_STAGES.map((stage) => {
                  const isActive = stage.id === activeStageId;
                  const isPast = stage.id < activeStageId;

                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => scrollToStage(stage.id)}
                      onKeyDown={(e) => handleKeyDown(e, stage.id)}
                      aria-current={isActive ? 'step' : undefined}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-water-500 ${
                        isActive
                          ? 'bg-ocean-950 text-white border-ocean-950 shadow-sm'
                          : isPast
                          ? 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                            isActive ? 'text-aqua-300' : 'text-slate-400'
                          }`}
                        >
                          Stage 0{stage.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-ocean-900 border-ocean-700 text-aqua-300'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {stage.tierNumber}
                        </span>
                      </div>
                      <div
                        className={`font-bold text-sm ${
                          isActive ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {stage.name}
                      </div>
                      <div
                        className={`text-[11px] mt-1 line-clamp-1 ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {stage.verificationCategory}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informational Callout */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Database className="h-3.5 w-3.5 text-water-600" />
                  <span>Durable Ledger Protocol</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  BlueLoop separates modeled volume from physical flow-meter receipts and accredited auditor attestations. Scroll through the ledger or click any stage to explore the evidence chain.
                </p>
              </div>
            </div>

            {/* Quick Summary Pill */}
            <div className="p-4 rounded-xl bg-water-50/60 border border-water-200/60 text-xs text-water-900 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-water-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Regulatory Rigor</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Only Deliveries verified with calibrated meter telemetry qualify for CSRD and GRI reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Right Main Column: 4 Full Sequential Stage Cards */}
          <div className="lg:col-span-8 space-y-10">
            {PROVENANCE_STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;

              return (
                <div
                  key={stage.id}
                  id={`stage-card-${stage.id}`}
                  className={`rounded-2xl border transition-all p-6 sm:p-8 ${
                    isActive
                      ? 'bg-white border-water-500/80 shadow-md ring-1 ring-water-500/20'
                      : 'bg-white/90 border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-ocean-950 text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs">
                        0{stage.id}
                      </span>
                      <span
                        className={`inline-flex items-center text-xs font-mono font-semibold px-2.5 py-0.5 rounded border ${stage.badgeStyle}`}
                      >
                        {stage.statusBadge}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      Provenance Stage {stage.id} of 4
                    </span>
                  </div>

                  {/* Stage Headline & Narrative */}
                  <div>
                    <h3 className="text-2xl font-editorial font-bold text-ink">
                      {stage.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {stage.definition}
                    </p>
                  </div>

                  {/* Recognition & Sample Demonstration Metric Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                        Accounting Recognition
                      </span>
                      <span className="text-sm font-semibold text-ocean-950 block">
                        {stage.auditRecognition}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-water-50/70 border border-water-200/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-water-800 block">
                          Demonstration Seed Metric
                        </span>
                        <span className="text-[10px] font-mono bg-water-200/60 text-water-900 px-1.5 py-0.5 rounded">
                          Synthetic Ledger
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-water-950 block">
                        {stage.sampleMetric}
                      </span>
                    </div>
                  </div>

                  {/* Required Verification Evidence List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <FileCheck2 className="h-4 w-4 text-water-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Required Audit Artifacts & Data Points
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {stage.verificationEvidence.map((evidence, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <div className="h-5 w-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono text-[11px] font-semibold text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-ink block">
                              {evidence.title}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                              {evidence.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Disclaimer & Guidance */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2 text-slate-500">
                      <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] italic">{stage.disclaimer}</span>
                    </div>

                    {stage.id < 4 && (
                      <button
                        type="button"
                        onClick={() => scrollToStage(stage.id + 1)}
                        className="text-xs font-semibold text-water-700 hover:text-water-900 inline-flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>Next: Stage 0{stage.id + 1}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
