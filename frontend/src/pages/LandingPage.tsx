import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ExternalLink, Factory, Building2, Droplets } from 'lucide-react';
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

      {/* Hero Section: Perfectly Balanced 2-Column Composition with Zero Canvas Overlap */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#EDF6FA] via-[#FAFBF9] to-canvas border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 z-10 space-y-6">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-xs text-slate-700">
                <span className="flex h-2 w-2 rounded-full bg-water-600 animate-pulse" />
                <span className="font-semibold text-ocean-950">BlueLoop Platform</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-600 font-medium text-[11px]">Industrial Water Reuse Intelligence</span>
              </div>

              {/* Editorial Display Headline */}
              <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-ink leading-[1.08]">
                Give industrial water <br />
                <span className="italic text-water-700 font-normal">another useful life.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-xl">
                Connect certified treated-effluent suppliers with commercial consumers. Optimize supply
                allocation with deterministic water-quality screening, transport economics, and
                audit-ready custody tracking.
              </p>

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Live Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/app/allocations"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
                >
                  <span>Inspect Matching Console</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-3.5 text-xs font-semibold text-slate-700 hover:text-ink transition-colors underline-offset-4 hover:underline"
                >
                  Sign In
                </Link>
              </div>

              {/* Product Metric Strip with Transparent Demonstration Disclosures */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="block text-2xl font-editorial font-bold text-ocean-950">
                    3 Streams
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Certified Effluent
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-editorial font-bold text-ocean-950">
                    100% Match
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Fail-Closed Gate
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-editorial font-bold text-ocean-950">
                    4 Tiers
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Audit Provenance
                  </span>
                </div>
                <div>
                  <span className="block text-2xl font-editorial font-bold text-forest-700">
                    -40% Cost
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Tariff Savings
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                Demonstration platform showing preloaded industrial water streams and facilities.
              </div>
            </div>

            {/* Right Column: Three.js Interactive Water Visual in an Elegant Framed Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-elevated overflow-hidden">
                {/* Visual Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-water-600" />
                    <span className="text-xs font-semibold text-ocean-950">
                      Closed-Loop Water Circulation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase text-water-700 bg-water-50 px-2 py-0.5 rounded border border-water-200/60 font-semibold">
                    Real-Time 3D Flow
                  </span>
                </div>

                {/* 3D Canvas Viewport: Transparent, Contained, Zero Click Interception */}
                <div className="relative h-72 sm:h-96 w-full rounded-2xl bg-gradient-to-b from-slate-50/50 to-water-50/30 overflow-hidden flex items-center justify-center">
                  <WaterFlowScene className="w-full h-full" />

                  {/* Minimal Flow Overlay Labels */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-white/90 border border-slate-200 text-[10px] font-mono text-slate-700 shadow-2xs pointer-events-none flex items-center gap-1.5">
                    <Factory className="h-3 w-3 text-water-600" />
                    <span>Tertiary STP Source</span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-white/90 border border-slate-200 text-[10px] font-mono text-slate-700 shadow-2xs pointer-events-none flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-aqua-600" />
                    <span>Industrial Intake</span>
                  </div>
                </div>

                {/* Caption Footer */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Continuous batch conveyance</span>
                  <span className="font-mono text-forest-700 font-medium">100% Compatible SLA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Narrative Section */}
      <TheProblemSection />

      {/* How BlueLoop Works: 4-Step Process */}
      <HowItWorksSection />

      {/* Platform Capabilities & Interactive Console Preview */}
      <ProductPreviewSection />

      {/* Impact Transparency: 4-Stage Provenance Protocol */}
      <ImpactTransparencySection />

      {/* Closing Call to Action Banner */}
      <section className="py-20 bg-ocean-950 text-white relative overflow-hidden border-t border-ocean-800">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-water-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-aqua-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-water-900/60 border border-water-500/30 text-aqua-300 text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            Empowering Resilient Industrial Ecosystems
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight max-w-3xl mx-auto">
            Ready to close the loop on your industrial water footprint?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore active treated water streams, simulate intake matching scenarios, and discover
            how deterministic quality screening protects your facilities.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-water-600 hover:bg-water-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              <span>Explore Live Sandbox Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-colors"
            >
              <span>Register an Organization</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Professional Footer */}
      <LandingFooter />
    </div>
  );
};
