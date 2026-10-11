import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Factory,
  FileSpreadsheet,
  GitMerge,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Droplet,
  Info,
  ExternalLink,
} from 'lucide-react';
import { NavItem } from '../types/navigation';
import { fetchHealth, HealthStatus } from '../services/health';

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/app/dashboard',
    icon: LayoutDashboard,
    description: 'Regional water balance & operational workspace',
  },
  {
    title: 'Suppliers',
    path: '/app/suppliers',
    icon: Factory,
    description: 'Treated effluent streams & laboratory profiles',
  },
  {
    title: 'Demand Requests',
    path: '/app/demands',
    icon: FileSpreadsheet,
    description: 'Intake volumes & parameter tolerances',
  },
  {
    title: 'Allocations',
    path: '/app/allocations',
    icon: GitMerge,
    description: 'Deterministic supply-demand matching console',
  },
  {
    title: 'Deliveries',
    path: '/app/deliveries',
    icon: Truck,
    description: 'Chain of custody & physical transfer logs',
  },
  {
    title: 'Impact Reports',
    path: '/app/impact',
    icon: BarChart3,
    description: 'Audited freshwater displacement ledger',
  },
  {
    title: 'Settings',
    path: '/app/settings',
    icon: Settings,
    description: 'Cloud environment & system configuration',
  },
];

interface HealthState {
  status: 'online' | 'offline' | 'checking';
  data?: HealthStatus;
  lastChecked?: string;
  errorMessage?: string;
}

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState<HealthState>({
    status: 'checking',
  });
  const location = useLocation();

  const checkBackendHealth = async () => {
    setBackendHealth((prev) => ({ ...prev, status: 'checking' }));
    try {
      const data = await fetchHealth();
      setBackendHealth({
        status: 'online',
        data,
        lastChecked: new Date().toLocaleTimeString(),
      });
    } catch (err: any) {
      setBackendHealth({
        status: 'offline',
        errorMessage: err.message || 'Service unavailable',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const currentNav =
    navigationItems.find((item) => location.pathname === item.path) ||
    navigationItems[0];

  return (
    <div className="min-h-screen flex flex-col bg-canvas font-sans text-ink antialiased">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-ocean-950/50 backdrop-blur-xs md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Art-Directed Clean Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-900 text-white shadow-xs group-hover:bg-water-600 transition-colors">
                <Droplet className="h-4 w-4 text-aqua-300" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-ink">
                  BlueLoop
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-water-600">
                  Reuse Intelligence
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 md:hidden p-1 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Landing Page Shortcut */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2">
            <Link
              to="/"
              className="flex items-center justify-between text-[11px] text-slate-500 hover:text-water-700 transition-colors"
            >
              <span className="font-medium">Public Overview</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400">
                View Site <ExternalLink className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-water-50 text-water-900 font-semibold shadow-xs border-l-2 border-water-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-water-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer Callout */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 font-semibold text-ocean-900">
                <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0" />
                <span className="text-[11px]">Deterministic Logic</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Algorithmic chemical compatibility & least-cost allocation. Zero speculative multipliers.
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>System Active</span>
              <span>Sample Sandbox</span>
            </div>
          </div>
        </aside>

        {/* Main Viewport */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-slate-500 hover:text-ink md:hidden p-1 rounded-md"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-ink tracking-tight">
                  {currentNav.title}
                </h1>
                <p className="hidden text-[11px] text-slate-500 sm:block">
                  {currentNav.description}
                </p>
              </div>
            </div>

            {/* Right Header Indicators */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Live Backend API Status Pill */}
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                <span className="text-[11px] text-slate-500 font-mono">API:</span>
                {backendHealth.status === 'online' ? (
                  <span className="inline-flex items-center gap-1 text-forest-700 font-medium text-[11px]">
                    <CheckCircle2 className="h-3 w-3 text-forest-600" />
                    Online
                  </span>
                ) : backendHealth.status === 'checking' ? (
                  <span className="inline-flex items-center gap-1 text-slate-500 text-[11px]">
                    <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                    Checking
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-red-700 text-[11px] font-medium">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    Offline
                  </span>
                )}
                <button
                  type="button"
                  onClick={checkBackendHealth}
                  className="text-slate-400 hover:text-slate-700 ml-0.5 transition-colors p-0.5"
                  title="Check backend health"
                  aria-label="Refresh backend health"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              {/* Compact Demo Mode Badge with Popover (Replaces Intrusive Top Strip) */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ice-500/20 border border-ice-500/40 text-ocean-900 text-[11px] font-mono font-medium cursor-help hover:bg-ice-500/30 transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-water-500 animate-pulse" />
                  <span>DEMO MODE</span>
                  <Info className="h-3 w-3 text-ocean-600 ml-0.5" />
                </div>

                {/* Hover Popover */}
                <div className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-white border border-slate-200 shadow-xl rounded-xl text-xs hidden group-hover:block z-50">
                  <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest-600" />
                    <span>Synthetic Demonstration Sandbox</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Showing synthetic industrial facilities, laboratory certificates, and allocations.
                    No real customer data is accessed.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Viewport Content */}
          <main className="flex-1 overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
