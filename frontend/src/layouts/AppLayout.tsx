import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { NavItem } from '../types/navigation';
import { StatusBadge } from '../components/common/StatusBadge';

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    description: 'Regional water balance & system status',
  },
  {
    title: 'Suppliers',
    path: '/suppliers',
    icon: Factory,
    description: 'Treated effluent streams & lab profiles',
  },
  {
    title: 'Demand Requests',
    path: '/demands',
    icon: FileSpreadsheet,
    description: 'Intake volumes & parameter tolerances',
  },
  {
    title: 'Allocations',
    path: '/allocations',
    icon: GitMerge,
    description: 'Deterministic supply-demand matching',
  },
  {
    title: 'Deliveries',
    path: '/deliveries',
    icon: Truck,
    description: 'Chain of custody & physical transfer logs',
  },
  {
    title: 'Impact Reports',
    path: '/impact',
    icon: BarChart3,
    description: 'Freshwater displacement & cost audits',
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Cloud environment & security parameters',
  },
];

interface HealthState {
  status: 'online' | 'offline' | 'checking';
  version?: string;
  environment?: string;
  lastChecked?: string;
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
      const response = await fetch('/api/v1/health');
      if (response.ok) {
        const data = await response.json();
        setBackendHealth({
          status: 'online',
          version: data.version,
          environment: data.environment,
          lastChecked: new Date().toLocaleTimeString(),
        });
      } else {
        setBackendHealth({
          status: 'offline',
          lastChecked: new Date().toLocaleTimeString(),
        });
      }
    } catch {
      setBackendHealth({
        status: 'offline',
        lastChecked: new Date().toLocaleTimeString(),
      });
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const currentNav = navigationItems.find((item) =>
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  ) || navigationItems[0];

  return (
    <div className="min-h-screen flex bg-[#F7F7F2] font-sans text-[#202A24]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#202A24]/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Compact Editorial Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E0E5DF] bg-[#FFFFFF] transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#E0E5DF] px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#174D3A] text-white shadow-xs">
              <Droplet className="h-4 w-4 text-[#D9E8DF]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#202A24]">
                BlueLoop
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-[#69736B]">
                Water Reuse Platform
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-[#69736B] hover:text-[#202A24] md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Environment Tag */}
        <div className="border-b border-[#ECEFEA] bg-[#F7F7F2] px-5 py-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69736B]">
              Environment
            </span>
            <StatusBadge status="DEMO" label="Demo Safe Mode" size="xs" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EDF6F1] text-[#174D3A] font-semibold shadow-xs'
                      : 'text-[#69736B] hover:bg-[#F7F7F2] hover:text-[#202A24]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#174D3A]'
                          : 'text-[#8C978F] group-hover:text-[#69736B]'
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
        <div className="border-t border-[#E0E5DF] bg-[#F7F7F2]/60 p-4">
          <div className="rounded-md border border-[#E0E5DF] bg-white p-3 text-xs shadow-card">
            <div className="flex items-center gap-1.5 font-semibold text-[#174D3A]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#168779]" />
              <span className="text-[11px]">Deterministic Logic</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-[#69736B]">
              Explicit physical parameter math. AI does not replace mandatory quality validation.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-[#8C978F]">
            <span>Version 0.1.0</span>
            <span>AWS Target</span>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E0E5DF] bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[#69736B] hover:text-[#202A24] md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#202A24] tracking-tight">
                {currentNav.title}
              </h1>
              <p className="hidden text-[11px] text-[#69736B] sm:block">
                {currentNav.description}
              </p>
            </div>
          </div>

          {/* Right Header Indicators */}
          <div className="flex items-center gap-3">
            {/* Live Backend API Pill */}
            <div className="flex items-center gap-2 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-2.5 py-1 text-xs">
              <span className="text-[11px] text-[#69736B]">FastAPI:</span>
              {backendHealth.status === 'online' ? (
                <span className="inline-flex items-center gap-1 text-[#174D3A] font-medium text-[11px]">
                  <CheckCircle2 className="h-3 w-3 text-[#168779]" />
                  Active (200 OK)
                </span>
              ) : backendHealth.status === 'checking' ? (
                <span className="inline-flex items-center gap-1 text-[#69736B] text-[11px]">
                  <RefreshCw className="h-3 w-3 animate-spin text-[#8C978F]" />
                  Checking
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[#8C978F] text-[11px]">
                  <AlertCircle className="h-3 w-3 text-[#8C978F]" />
                  Offline
                </span>
              )}
              <button
                type="button"
                onClick={checkBackendHealth}
                className="text-[#8C978F] hover:text-[#202A24] ml-1 transition-colors"
                title="Refresh backend status"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            <StatusBadge status="DEMO" label="Synthetic Baseline" size="sm" />
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F7F2] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
