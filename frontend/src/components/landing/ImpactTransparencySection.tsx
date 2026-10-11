import React, { useState } from 'react';
import {
  CheckCircle2,
  Scale,
  ArrowRight,
  FileCheck2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface ProvenanceStage {
  id: number;
  key: string;
  name: string;
  statusBadge: string;
  badgeStyle: string;
  definition: string;
  verificationEvidence: string[];
  auditRecognition: string;
  sampleMetric: string;
  disclaimer: string;
}

const PROVENANCE_STAGES: ProvenanceStage[] = [
  {
    id: 1,
    key: 'potential',
    name: 'Potential Displacement',
    statusBadge: 'Tier 1: Modeled Screening',
    badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300',
    definition:
      'Identified by BlueLoop algorithmic chemical screening and haversine transport modeling. No commercial commitment signed.',
    verificationEvidence: [
      'Certified Laboratory Assay (COA < 90 days old)',
      'Buyer Process Tolerance Band Document',
      'Geographical Proximity & Road Route Calculation',
      'Ex-Works Cost Envelope Comparison',
    ],
    auditRecognition: '0% Recognized for ESG Disclosures',
    sampleMetric: '14,200 kL/month feasible substitution for cooling intake',
    disclaimer: 'Purely mathematical estimation. Does not represent actual freshwater saved.',
  },
  {
    id: 2,
    key: 'accepted',
    name: 'Agreed Allocation',
    statusBadge: 'Tier 2: Commercial Contract',
    badgeStyle: 'bg-water-100 text-water-800 border-water-300',
    definition:
      'Supplier and buyer have formally accepted the bilateral allocation proposal with scheduled volumetric flow and quality SLAs.',
    verificationEvidence: [
      'Bilateral Counterparty Signed Agreement',
      'Agreed Quality SLA Envelope (pH, TDS, COD, Turbidity)',
      'Delivery Schedule (kL/day reservation)',
      'Logistics Dispatch Routing (Pipeline or Tanker)',
    ],
    auditRecognition: 'Committed Corporate Pipeline',
    sampleMetric: '10,000 kL monthly firm reservation from Metro Tertiary Plant',
    disclaimer: 'Contracted intent. Water has not yet physically transferred.',
  },
  {
    id: 3,
    key: 'confirmed',
    name: 'Delivered Displacement',
    statusBadge: 'Tier 3: Physical Telemetry',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    definition:
      'Treated effluent physically transferred, received at industrial facility gate, and confirmed via calibrated flow meters.',
    verificationEvidence: [
      'Source Facility Discharge Flow Meter Telemetry',
      'Carrier Waybill & Custody Transfer Receipt',
      'Buyer Intake Flow Meter Log (< 1.5% discrepancy)',
      'Daily Delivery Ledger Entry in Durable Database',
    ],
    auditRecognition: 'Recognized for Operational Reporting',
    sampleMetric: '8,450 kL physically metered into industrial cooling loops',
    disclaimer: 'Verified physical transfer. Direct displacement of virgin freshwater.',
  },
  {
    id: 4,
    key: 'certified',
    name: 'Audited & Certified',
    statusBadge: 'Tier 4: Third-Party Verified',
    badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
    definition:
      'Independent accredited environmental auditor has certified the physical mass-balance, diversion from surface discharge, and municipal groundwater baseline offset.',
    verificationEvidence: [
      'ISO 14046 / Water Stewardship Audit Report',
      'Third-Party Utility Ledger Reconciliation',
      'Municipal Abstraction Reduction Permits',
      'Tamper-Evident Ledger Signature & Digital Hash',
    ],
    auditRecognition: 'Audit-Ready for CSRD, SEC & GRI Filings',
    sampleMetric: '118,500 kL annual verified municipal abstraction reduction',
    disclaimer: 'Highest provenance standard. Zero greenwashing risk.',
  },
];

export const ImpactTransparencySection: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<number>(3);
  const activeStage = PROVENANCE_STAGES.find((s) => s.id === activeStageId) || PROVENANCE_STAGES[2];

  return (
    <section id="impact" className="py-24 sm:py-32 bg-[#FAFBF9] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
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

        {/* 4-Stage Horizontal Progression Bar */}
        <div className="mb-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PROVENANCE_STAGES.map((stage) => {
              const isActive = stage.id === activeStageId;
              const isPast = stage.id < activeStageId;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStageId(stage.id)}
                  className={`p-3.5 rounded-xl text-left transition-all relative ${
                    isActive
                      ? 'bg-ocean-950 text-white shadow-sm ring-1 ring-ocean-900'
                      : isPast
                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
                        isActive ? 'text-aqua-300' : 'text-slate-500'
                      }`}
                    >
                      Stage 0{stage.id}
                    </span>
                    {stage.id >= 3 && (
                      <CheckCircle2
                        className={`h-3.5 w-3.5 ${
                          isActive ? 'text-forest-400' : 'text-forest-600'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`block text-xs font-bold truncate ${
                      isActive ? 'text-white' : 'text-ink'
                    }`}
                  >
                    {stage.name}
                  </span>
                  <span
                    className={`block text-[11px] mt-0.5 truncate ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {stage.id === 1 ? 'Proposed' : stage.id === 2 ? 'Contracted' : stage.id === 3 ? 'Delivered' : 'Audited'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Stage Evidence Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Stage Overview & Definition */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span
                className={`inline-flex items-center text-xs font-mono font-semibold px-2.5 py-1 rounded border ${activeStage.badgeStyle}`}
              >
                {activeStage.statusBadge}
              </span>
              <h3 className="text-2xl font-editorial font-bold text-ink mt-3">
                {activeStage.name}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeStage.definition}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                Accounting Weight
              </span>
              <span className="text-sm font-semibold text-ocean-950 block">
                {activeStage.auditRecognition}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-water-50/70 border border-water-200/80 space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-water-800 block">
                Demonstration Metric
              </span>
              <span className="text-xs font-semibold text-water-950 block">
                {activeStage.sampleMetric}
              </span>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 italic border-t border-slate-100 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0 mt-0.5" />
              <span>{activeStage.disclaimer}</span>
            </div>
          </div>

          {/* Right Column: Required Verification Audit Artifacts */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-water-600" />
                <h4 className="text-sm font-bold text-ink">
                  Required Evidence & Verification Checklist
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Stage {activeStage.id} of 4
              </span>
            </div>

            <div className="space-y-3.5">
              {activeStage.verificationEvidence.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono text-xs font-semibold text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-ink block">{req}</span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Cryptographically bound to bilateral allocation record and facility ID.
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Callout */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Audited mass balance ledger updated with every physical delivery.</span>
              </div>
              <a
                href="#how-it-works"
                className="font-semibold text-water-700 hover:text-water-900 inline-flex items-center gap-1"
              >
                <span>Learn How Matching Works</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
