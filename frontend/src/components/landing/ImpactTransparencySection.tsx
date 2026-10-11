import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Scale,
  Award,
} from 'lucide-react';

interface TierData {
  tier: number;
  label: string;
  badge: string;
  badgeColor: string;
  status: string;
  description: string;
  dataRequirements: string[];
  auditWeight: string;
  example: string;
}

const IMPACT_TIERS: TierData[] = [
  {
    tier: 1,
    label: 'Algorithmic Potential',
    badge: 'Tier 1 • Screening',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'Uncommitted match proposal',
    description:
      'Identified by the BlueLoop constrained optimization engine based on chemical compatibility and geographical proximity. No commercial commitment has yet been signed.',
    dataRequirements: [
      'Certified Laboratory Assay (COA < 90d old)',
      'Buyer Tolerance Specification Document',
      'Haversine / Road Route Distance Matrix',
      'Ex-Works Cost Envelope Comparison',
    ],
    auditWeight: '0% Recognized for ESG disclosures',
    example: '14,200 m³/month potential substitution for Cooling Tower Circuit #3.',
  },
  {
    tier: 2,
    label: 'Contracted Allocation',
    badge: 'Tier 2 • Bilateral Agreement',
    badgeColor: 'bg-water-100 text-water-800 border-water-200',
    status: 'Commercially committed',
    description:
      'Supplier and buyer have formally accepted the bilateral allocation proposal with agreed volumetric flow rates, quality SLA bands, and delivery schedule.',
    dataRequirements: [
      'Bilateral Counterparty Acceptance Sign-off',
      'Agreed Quality SLA (pH, TDS, COD, Turbidity)',
      'Allocated Volume Schedule (m³/day)',
      'Logistics Dispatch Agreement (Pipeline/Tanker)',
    ],
    auditWeight: 'Committed substitution pipeline',
    example: 'Firm monthly reservation of 10,000 m³ from Metro Tertiary STP.',
  },
  {
    tier: 3,
    label: 'Delivered & Custody-Logged',
    badge: 'Tier 3 • Physical Custody',
    badgeColor: 'bg-aqua-100 text-aqua-900 border-aqua-300',
    status: 'Physically transferred',
    description:
      'Water has been physically transferred and metered at intake. Both dispatch and receiving flow meter readings, GPS transit records, and batch receipts are verified.',
    dataRequirements: [
      'Calibrated Flow Meter Telemetry / Calibration Logs',
      'Consignment Waybill & Delivery Seal Number',
      'Dual-Party Gate Intake Receipt Timestamp',
      'In-situ Intake Quality Screening (pH & TDS check)',
    ],
    auditWeight: '100% Recognized internal freshwater displacement',
    example: 'Batch #BL-2026-DEL-084: 450 m³ delivered to Boiler Makeup reservoir.',
  },
  {
    tier: 4,
    label: 'Independently Verified',
    badge: 'Tier 4 • Regulatory Grade',
    badgeColor: 'bg-forest-100 text-forest-800 border-forest-200',
    status: 'Third-party audited',
    description:
      'Third-party accredited environmental auditor has certified the physical mass-balance, verified that treated effluent was diverted from surface discharge, and confirmed baseline groundwater reduction.',
    dataRequirements: [
      'ISO 14046 / Alliance for Water Stewardship Audit',
      'Third-Party Mass Balance & Utility Ledger Review',
      'Groundwater Abstraction Withdrawal Reduction Receipts',
      'Tamper-Evident Hash on Environmental Impact Ledger',
    ],
    auditWeight: 'Audit-ready for CSRD, SEC & GRI disclosures',
    example: 'Annual verified abatement: 118,500 m³ municipal groundwater preserved.',
  },
];

export const ImpactTransparencySection: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<number>(3);
  const activeData = IMPACT_TIERS.find((t) => t.tier === selectedTier) || IMPACT_TIERS[2];

  return (
    <section id="provenance" className="py-24 sm:py-32 bg-[#F6F8F6] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-50 border border-water-200/80 text-water-800 text-xs font-semibold tracking-wide uppercase mb-4">
            <Scale className="h-3.5 w-3.5 text-water-600" />
            Impact Provenance Protocol
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ink leading-tight">
            Water accounting that withstands financial and regulatory scrutiny.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Generic carbon calculators rely on speculative emissions factors. BlueLoop implements
            a strict 4-tier chain of custody where claimed freshwater savings must be proved with
            physical telemetry and calibrated intake meters before entering corporate disclosures.
          </p>
        </div>

        {/* Interactive 4-Tier Provenance Ladder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tier Selection Column */}
          <div className="lg:col-span-5 space-y-3">
            {IMPACT_TIERS.map((tier) => {
              const isSelected = tier.tier === selectedTier;
              return (
                <button
                  key={tier.tier}
                  onClick={() => setSelectedTier(tier.tier)}
                  type="button"
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-white border-water-500 shadow-md ring-1 ring-water-400'
                      : 'bg-white/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${tier.badgeColor}`}
                    >
                      {tier.badge}
                    </span>
                    <span className="text-xs font-mono font-medium text-slate-500">
                      Tier {tier.tier} of 4
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-ink flex items-center gap-2">
                    {tier.label}
                    {tier.tier >= 3 && (
                      <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tier.description}
                  </p>

                  {isSelected && (
                    <motion.div
                      layoutId="tierIndicator"
                      className="absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:flex h-6 w-6 rounded-full bg-water-600 text-white items-center justify-center shadow-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tier Detailed Inspection Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border ${activeData.badgeColor}`}
                    >
                      {activeData.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Status: <strong className="text-ink">{activeData.status}</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold text-ink mt-2">
                    {activeData.label}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                    Disclosure Weight
                  </span>
                  <span className="text-sm font-semibold text-water-800">
                    {activeData.auditWeight}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Verification Criteria
                </h4>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {activeData.description}
                </p>
              </div>

              {/* Data Requirements Checklist */}
              <div className="mt-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
                  Required Cryptographic & Physical Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeData.dataRequirements.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-slate-200/80 text-xs"
                    >
                      <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium leading-snug">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real World Example */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-start gap-3">
                <FileCheck2 className="h-5 w-5 text-water-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Sample Ledger Entry
                  </span>
                  <p className="text-xs text-ink font-mono font-medium mt-0.5">
                    {activeData.example}
                  </p>
                </div>
              </div>
            </div>

            {/* Anti-Greenwashing Callout Banner */}
            <div className="mt-6 bg-gradient-to-r from-ocean-900 to-ocean-800 text-white rounded-xl p-6 shadow-sm border border-ocean-700">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                  <Award className="h-5 w-5 text-aqua-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">
                    Zero Synthetic Carbon Credits • 100% Calibrated Physical Meters
                  </h4>
                  <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                    BlueLoop never inflates ESG reporting with estimated multipliers. Every metric
                    exported in our audited impact reports points directly to a counterparty intake
                    manifest, a custody batch timestamp, and accredited laboratory water chemistry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
