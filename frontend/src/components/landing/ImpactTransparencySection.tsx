import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const isJumpingRef = useRef<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Continuous scroll scrubbing calculation
  const handleScroll = useCallback(() => {
    if (isJumpingRef.current) return;
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight > 100 ? window.innerHeight : 900;
    const totalScrollable = sectionHeight - viewportHeight;

    if (totalScrollable <= 0) return;

    // Fixed navbar offset is ~72px
    const navbarOffset = 72;
    const currentScrolled = -(rect.top - navbarOffset);
    const rawProgress = currentScrolled / totalScrollable;
    const progress = Math.max(0, Math.min(1, rawProgress));

    setScrollProgress(progress);

    // Map progress to 4 distinct stages with balanced zones:
    // 0.00 to 0.22 -> Stage 1
    // 0.22 to 0.46 -> Stage 2
    // 0.46 to 0.72 -> Stage 3
    // 0.72 to 1.00 -> Stage 4
    let targetStage = 1;
    if (progress >= 0.72) {
      targetStage = 4;
    } else if (progress >= 0.46) {
      targetStage = 3;
    } else if (progress >= 0.22) {
      targetStage = 2;
    } else {
      targetStage = 1;
    }

    setActiveStageId(targetStage);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleScroll]);

  // Jump to specific stage by calculating document target scroll
  const jumpToStage = (stageId: number) => {
    const section = sectionRef.current;
    if (!section) {
      setActiveStageId(stageId);
      return;
    }

    isJumpingRef.current = true;
    setActiveStageId(stageId);

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight > 100 ? window.innerHeight : 900;
    const totalScrollable = sectionHeight - viewportHeight;
    const navbarOffset = 72;

    const progressTargetMap: Record<number, number> = {
      1: 0.05,
      2: 0.34,
      3: 0.60,
      4: 0.88,
    };

    const targetProgress = progressTargetMap[stageId] ?? 0.05;
    const targetScrollY = sectionTop - navbarOffset + targetProgress * totalScrollable;

    window.scrollTo({
      top: targetScrollY,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    // Reset jump lock after smooth scroll completes
    setTimeout(() => {
      isJumpingRef.current = false;
      handleScroll();
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent, stageId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      jumpToStage(stageId);
    }
  };

  const activeStage = PROVENANCE_STAGES.find((s) => s.id === activeStageId) || PROVENANCE_STAGES[0];

  return (
    <section
      id="impact"
      ref={sectionRef}
      className="relative bg-[#FAFBF9] border-t border-slate-200/80"
      style={{ height: '320vh', minHeight: '2600px' }} // Natural document scroll distance to scrub through 4 stages
    >
      {/* Sticky presentation container pinned below the fixed navbar */}
      <div className="sticky top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] min-h-[580px] max-h-[920px] flex flex-col justify-between overflow-hidden py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col h-full justify-between">
          {/* Top Section Header */}
          <div className="shrink-0 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-water-50 border border-water-200/80 text-water-800 text-[11px] font-semibold tracking-wide uppercase">
                  <Scale className="h-3.5 w-3.5 text-water-600" />
                  Impact Provenance Protocol
                </div>
                <span className="text-slate-400 text-xs hidden sm:inline">|</span>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  Scroll or select to scrub through proof tiers
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Scrub Progress:</span>
                  <span className="font-bold text-ocean-950">
                    Stage 0{activeStageId} of 04
                  </span>
                </div>
                <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-water-500 to-forest-600 transition-all duration-150"
                    style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-ink mt-2">
              Water accounting that withstands regulatory and financial scrutiny.
            </h2>
          </div>

          {/* Mobile Horizontal Stepper: Always visible on mobile above the single panel */}
          <div className="lg:hidden shrink-0 mb-3 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-4 gap-1.5">
              {PROVENANCE_STAGES.map((stage) => {
                const isActive = stage.id === activeStageId;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => jumpToStage(stage.id)}
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Jump to Stage 0${stage.id}: ${stage.name}`}
                    className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-ocean-950 text-white shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-medium'
                    }`}
                  >
                    <span className="block text-[10px] font-mono leading-none">
                      0{stage.id}
                    </span>
                    <span className="block text-[11px] truncate mt-1">
                      {stage.id === 1 ? 'Potential' : stage.id === 2 ? 'Agreed' : stage.id === 3 ? 'Delivered' : 'Certified'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Presentation: Compact Navigation Rail (Left) + EXACTLY ONE Content Panel (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-stretch flex-1 min-h-0 pb-1">
            {/* Left Column: Compact Vertical Navigation Rail */}
            <div className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    Provenance Stage Track
                  </span>
                  <span className="text-xs font-mono font-bold text-water-700">
                    0{activeStageId} / 04
                  </span>
                </div>

                {/* 4 Interactive Vertical Rail Nodes */}
                <div className="space-y-2.5 relative">
                  {PROVENANCE_STAGES.map((stage) => {
                    const isActive = stage.id === activeStageId;
                    const isPast = stage.id < activeStageId;

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => jumpToStage(stage.id)}
                        onKeyDown={(e) => handleKeyDown(e, stage.id)}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Jump to Stage 0${stage.id}: ${stage.name}`}
                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-water-500 cursor-pointer ${
                          isActive
                            ? 'bg-ocean-950 text-white border-ocean-950 shadow-sm ring-1 ring-ocean-900'
                            : isPast
                            ? 'bg-slate-50/90 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                          className={`font-bold text-xs sm:text-sm ${
                            isActive ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {stage.name}
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 truncate ${
                            isActive ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {stage.verificationCategory}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rail Bottom Integrity Card */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Database className="h-3.5 w-3.5 text-water-600" />
                  <span>Durable Ledger Protocol</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Stage navigation is not verification. Each delivery tier requires calibrated sensor evidence before qualification.
                </p>
              </div>
            </div>

            {/* Right Column: EXACTLY ONE Stage Content Panel Visible at a Time */}
            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
              <div
                key={activeStage.id}
                className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs flex flex-col justify-between h-full overflow-y-auto ${
                  prefersReducedMotion
                    ? 'opacity-100'
                    : 'animate-fadeIn transition-all duration-200 ease-out'
                }`}
              >
                {/* Top Bar of the Single Active Panel */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="h-7 w-7 rounded-lg bg-ocean-950 text-white flex items-center justify-center font-mono text-xs font-bold shadow-2xs">
                        0{activeStage.id}
                      </span>
                      <span
                        className={`inline-flex items-center text-xs font-mono font-semibold px-2.5 py-0.5 rounded border ${activeStage.badgeStyle}`}
                      >
                        {activeStage.statusBadge}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500">
                      Provenance Stage {activeStage.id} of 4
                    </span>
                  </div>

                  {/* Stage Headline & Narrative */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-editorial font-bold text-ink">
                      {activeStage.name}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeStage.definition}
                    </p>
                  </div>

                  {/* Dual Metric Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                        Accounting Recognition
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-ocean-950 block">
                        {activeStage.auditRecognition}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-water-50/70 border border-water-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-water-800 block">
                          Demonstration Seed Metric
                        </span>
                        <span className="text-[9px] font-mono bg-water-200/60 text-water-900 px-1.5 py-0.5 rounded">
                          Synthetic Ledger
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-water-950 block">
                        {activeStage.sampleMetric}
                      </span>
                    </div>
                  </div>

                  {/* Required Evidence Checklist */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileCheck2 className="h-4 w-4 text-water-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Required Audit Artifacts & Telemetry
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {activeStage.verificationEvidence.map((evidence, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                        >
                          <div className="h-5 w-5 rounded-md bg-white border border-slate-200 flex items-center justify-center font-mono text-[10px] font-semibold text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-ink block">
                              {evidence.title}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed line-clamp-2">
                              {evidence.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Disclaimer & Navigation Guide */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-start gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] italic">{activeStage.disclaimer}</span>
                  </div>

                  {activeStage.id < 4 ? (
                    <button
                      type="button"
                      onClick={() => jumpToStage(activeStage.id + 1)}
                      className="text-xs font-semibold text-water-700 hover:text-water-900 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <span>Scroll or click to advance to Stage 0{activeStage.id + 1}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs font-mono font-medium text-purple-700 flex items-center gap-1 self-start sm:self-auto shrink-0">
                      <Sparkles className="h-3 w-3" />
                      <span>Highest Provenance Standard • Continue scrolling for sandbox</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
