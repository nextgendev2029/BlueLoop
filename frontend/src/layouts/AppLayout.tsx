import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
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
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { NavItem } from '../types/navigation';
import { fetchHealth, HealthStatus } from '../services/health';
import { useAuth } from '../context/AuthContext';

const navigationItems: (NavItem & { roles?: Array<'buyer' | 'supplier' | 'admin'> })[] = [
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
    roles: ['buyer', 'admin'],
  },
  {
    title: 'Allocations',
    path: '/app/allocations',
    icon: GitMerge,
    description: 'Deterministic supply-demand matching console',
    roles: ['buyer', 'admin'],
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filter navigation items based on current user role
  const visibleNavItems = navigationItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return true;
    return item.roles.includes(user.role);
  });

  const currentNav =
    visibleNavItems.find((item) => location.pathname.startsWith(item.path)) ||
    navigationItems[0];

  return (
    <div className="flex h-screen bg-canvas font-sans antialiased text-ink">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-ocean-950/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Structural Frame */}
      <div className="flex h-full w-full overflow-hidden">
        {/* Collapsible/Static Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 md:translate-x-0 max-md:-translate-x-full'
          }`}
        >
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-water-600 text-white shadow-xs group-hover:bg-water-700 transition-colors">
                <Droplet className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-editorial text-lg font-bold tracking-tight text-ocean-950">
                  BlueLoop
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-water-700 -mt-1 font-semibold">
                  Water Intelligence
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600 md:hidden p-1 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close sidebar"
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
            {visibleNavItems.map((item) => {
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

          {/* Sidebar Footer User Card & Sign Out */}
          <div className="border-t border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
            {user ? (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-ocean-100 text-ocean-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-semibold text-ink truncate">
                        {user.name}
                      </span>
                      <span className="block text-[10px] text-slate-500 truncate">
                        {user.organisation?.name || user.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase shrink-0 ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : user.role === 'supplier'
                        ? 'bg-water-100 text-water-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-[11px] font-medium transition-colors"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-water-600 hover:bg-water-700 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>RBAC & Tenancy Active</span>
              <span>Isolated</span>
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

              {/* Current Role Pill */}
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <span className="text-slate-500 text-[11px]">Org:</span>
                  <span className="font-semibold text-ocean-950 text-[11px] max-w-[120px] truncate">
                    {user.organisation?.name || user.email}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : user.role === 'supplier'
                        ? 'bg-water-100 text-water-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              )}

              {/* Compact Mode Badge with Popover */}
              <div className="relative group">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ice-500/20 border border-ice-500/40 text-ocean-900 text-[11px] font-mono font-medium cursor-help hover:bg-ice-500/30 transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-water-500 animate-pulse" />
                  <span>AUTHENTICATED</span>
                  <Info className="h-3 w-3 text-ocean-600 ml-0.5" />
                </div>

                {/* Hover Popover */}
                <div className="absolute right-0 top-full mt-2 w-72 p-3.5 bg-white border border-slate-200 shadow-xl rounded-xl text-xs hidden group-hover:block z-50">
                  <div className="font-semibold text-ink mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-forest-600" />
                    <span>Durable Multi-Tenant Workspace</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Your session is protected with PBKDF2-HMAC-SHA256 authenticated sessions and
                    strict organisation-level data isolation.
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
