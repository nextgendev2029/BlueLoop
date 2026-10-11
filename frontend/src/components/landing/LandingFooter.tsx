import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, ArrowUpRight, ShieldCheck } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-ocean-950 text-white border-t border-ocean-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-ocean-800/60">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-water-600 flex items-center justify-center text-white shadow-sm group-hover:bg-water-500 transition-colors">
                <Droplet className="h-5 w-5" />
              </div>
              <span className="font-editorial text-2xl font-medium tracking-tight text-white">
                BlueLoop
              </span>
            </Link>
            <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
              Industrial water reuse intelligence and procurement optimization. Connecting treated
              effluent suppliers with commercial buyers through fail-closed chemical screening and
              auditable custody transfer.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-forest-400 animate-pulse" />
              <span>Deterministic Engine v0.1 • Hackathon Edition</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/app/suppliers" className="hover:text-white transition-colors">
                  Supply Directory
                </Link>
              </li>
              <li>
                <Link to="/app/demands" className="hover:text-white transition-colors">
                  Demand Specifications
                </Link>
              </li>
              <li>
                <Link to="/app/allocations" className="hover:text-white transition-colors">
                  Allocation Engine
                </Link>
              </li>
              <li>
                <Link to="/app/deliveries" className="hover:text-white transition-colors">
                  Custody Transfer Logs
                </Link>
              </li>
              <li>
                <Link to="/app/impact" className="hover:text-white transition-colors">
                  Impact Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture Column */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Architecture
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
                  href="#preview"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Constrained Matching
                </a>
              </li>
              <li>
                <a
                  href="#provenance"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  4-Tier Provenance
                </a>
              </li>
              <li>
                <Link to="/app/settings" className="hover:text-white transition-colors">
                  Cloud Infrastructure
                </Link>
              </li>
            </ul>
          </div>

          {/* Access / Get Started */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-aqua-400 mb-4 font-semibold">
              Access
            </h4>
            <div className="space-y-3">
              <Link
                to="/app/dashboard"
                className="inline-flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-water-600 hover:bg-water-500 text-white font-medium text-xs shadow-xs transition-colors"
              >
                Launch Live Demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors border border-white/10"
              >
                Sign In to Account
              </Link>
              <div className="pt-2 text-[11px] text-slate-400 leading-normal flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-forest-400 shrink-0" />
                <span>Zero login credentials required for demonstration review.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BlueLoop Intelligence. All synthetic datasets clearly demarcated.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Built with precision for sustainable industry
            </span>
            <Link to="/app/settings" className="hover:text-white transition-colors">
              System Health
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
