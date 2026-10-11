import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { WaterFlowScene } from '../components/landing/WaterFlowScene';
import { TheProblemSection } from '../components/landing/TheProblemSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { ProductPreviewSection } from '../components/landing/ProductPreviewSection';
import { ImpactTransparencySection } from '../components/landing/ImpactTransparencySection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased flex flex-col selection:bg-water-100 selection:text-water-900">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#EDF6FA] via-[#FAFBF9] to-canvas">
        {/* Interactive Fluid Three.js Canvas: positioned on right/center with zero click interception */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 z-0 opacity-85 pointer-events-none overflow-hidden">
          <WaterFlowScene className="w-full h-full" />
        </div>

        {/* Subtle radial mask overlay to guarantee text legibility on left */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-canvas via-canvas/90 to-transparent lg:w-3/5 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs mb-6 text-xs text-slate-700">
              <span className="flex h-2 w-2 rounded-full bg-water-600 animate-pulse" />
              <span className="font-semibold text-ocean-900">BlueLoop Platform</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium text-[11px]">Industrial Water Reuse Intelligence</span>
            </div>

            {/* Editorial Serif Hero Title */}
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-ink leading-[1.08]">
              Water has <br />
              <span className="italic text-water-600 font-normal">another life.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-xl">
              Connect certified treated-effluent suppliers with commercial consumers. Optimize supply
              allocation with deterministic water-quality screening, transport economics, and
              audit-ready custody tracking.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/app/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-water-600 hover:bg-water-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Live Demo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#preview"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
              >
                <span>Inspect Matching Console</span>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </a>

              <Link
                to="/login"
                className="inline-flex items-center px-4 py-3.5 text-xs font-semibold text-slate-700 hover:text-ink transition-colors underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            </div>

            {/* Proof Metric Strip */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-2xl font-editorial font-bold text-ocean-900">
                  3 Streams
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Secondary & Tertiary STP
                </span>
              </div>
              <div>
                <span className="block text-2xl font-editorial font-bold text-ocean-900">
                  100% Match
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Fail-Closed Chemical Gate
                </span>
              </div>
              <div>
                <span className="block text-2xl font-editorial font-bold text-ocean-900">
                  4-Tier
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Impact Provenance
                </span>
              </div>
              <div>
                <span className="block text-2xl font-editorial font-bold text-ocean-900">
                  Haversine
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                  Logistics & Tariff Model
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Wave Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
      </section>

      {/* The Problem: Industrial Effluent Paradox */}
      <TheProblemSection />

      {/* How It Works: 4-Step Pipeline */}
      <HowItWorksSection />

      {/* Interactive Product Preview Console */}
      <ProductPreviewSection />

      {/* Impact Transparency: 4-Tier Provenance Protocol */}
      <ImpactTransparencySection />

      {/* Call to Action Banner before Footer */}
      <section className="py-20 bg-ocean-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#24B8C7_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-aqua-300 text-xs font-mono mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Operational Water Procurement Workspace
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
            Explore certified water allocation in action.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Experience the complete end-to-end workflow: chemical compatibility checks,
            cost-optimized matching, physical delivery logs, and transparent displacement reports.
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-water-500 hover:bg-water-400 text-white font-semibold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <span>Open Platform Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              <span>Sign In to Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
