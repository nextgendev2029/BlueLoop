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
  Droplets,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { NavItem } from '../types/navigation';
import { Badge } from '../components/common/Badge';

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    description: 'Platform overview & system status',
  },
  {
    title: 'Suppliers',
    path: '/suppliers',
    icon: Factory,
    description: 'Treated water sources & listings',
  },
  {
    title: 'Demand Requests',
    path: '/demands',
    icon: FileSpreadsheet,
    description: 'Buyer specifications & volume requests',
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
    description: 'Dispatch & chain of custody verification',
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
    description: 'Environment & platform configurations',
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
    <div className="min-vh-100 flex min-h-screen bg-stone-50 font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-none md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-stone-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-800 text-white shadow-xs">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                BlueLoop
              </span>
              <span className="block text-[11px] font-medium text-stone-500">
                Water Reuse Platform
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-stone-400 hover:text-stone-600 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Environment Tag */}
        <div className="border-b border-stone-100 bg-stone-50/70 px-5 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Data Mode
            </span>
            <Badge variant="brand" size="sm">
              Synthetic Baseline
            </Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-teal-700'
                          : 'text-stone-400 group-hover:text-stone-600'
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-stone-200 bg-stone-50/50 p-4">
          <div className="rounded-md border border-stone-200 bg-white p-3 text-xs text-stone-600 shadow-2xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-800">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <span>Deterministic Core</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
              Explicit engineering logic enforces compliance. AI does not replace
              mandatory quality validation.
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
            <span>Version 0.1.0</span>
            <span>AWS Target Arch</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-stone-500 hover:text-slate-900 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                {currentNav.title}
              </h1>
              <p className="hidden text-xs text-stone-500 sm:block">
                {currentNav.description}
              </p>
            </div>
          </div>

          {/* Right Header Indicators */}
          <div className="flex items-center gap-3">
            {/* Backend API Status Pill */}
            <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs">
              <span className="text-stone-500">API:</span>
              {backendHealth.status === 'online' ? (
                <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  Online
                </span>
              ) : backendHealth.status === 'checking' ? (
                <span className="inline-flex items-center gap-1 text-stone-500">
                  <RefreshCw className="h-3 w-3 animate-spin text-stone-400" />
                  Checking
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-stone-600">
                  <AlertCircle className="h-3.5 w-3.5 text-stone-400" />
                  Offline
                </span>
              )}
              <button
                type="button"
                onClick={checkBackendHealth}
                className="text-stone-400 hover:text-stone-600 ml-1"
                title="Refresh backend status"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            <Badge variant="neutral">Initialisation Phase</Badge>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
