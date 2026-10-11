import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BlueLoopLogo } from '../common/BlueLoopLogo';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-ocean-950 text-white border-t border-ocean-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-ocean-800/60">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center group">
              <BlueLoopLogo size="lg" variant="light" showWordmark showSubtitle />
            </Link>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Industrial water reuse intelligence and procurement optimization. Connecting treated
              effluent suppliers with commercial buyers through fail-closed chemical screening and
              auditable custody transfer.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-forest-400 animate-pulse" />
              <span>Enterprise Platform - Demonstration Sandbox Active</span>
            </div>
          </div>

          {/* Platform Workspaces */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Workspaces
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/app/suppliers" className="hover:text-white transition-colors">
                  Supply Directory
                </Link>
              </li>
              <li>
                <Link to="/app/demands" className="hover:text-white transition-colors">
                  Demand Requests
                </Link>
              </li>
              <li>
                <Link to="/app/allocations" className="hover:text-white transition-colors">
                  Allocation Console
                </Link>
              </li>
              <li>
                <Link to="/app/deliveries" className="hover:text-white transition-colors">
                  Custody & Logistics
                </Link>
              </li>
              <li>
                <Link to="/app/impact" className="hover:text-white transition-colors">
                  Impact Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Quality Gate Logic
                </a>
              </li>
              <li>
                <a
                  href="#the-problem"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Transport Economics
                </a>
              </li>
              <li>
                <a
                  href="#impact"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  4-Stage Provenance
                </a>
              </li>
              <li>
                <Link
                  to="/app/settings"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Compliance Alerts
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Organization */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Access
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white transition-colors">
                  Register Organization
                </Link>
              </li>
              <li>
                <Link
                  to="/app/dashboard"
                  className="hover:text-white transition-colors inline-flex items-center gap-1 text-aqua-300 font-medium"
                >
                  Live Demo Sandbox <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
              <li>
                <Link to="/app/settings" className="hover:text-white transition-colors">
                  System Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Integrity Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-forest-400 shrink-0" />
            <span>
              BlueLoop Water Intelligence. Built for verifiable circular water procurement.
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span>Synthetic Demonstration Data</span>
            <span>Deterministic Math</span>
            <span>Audited ESG Accounting</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
