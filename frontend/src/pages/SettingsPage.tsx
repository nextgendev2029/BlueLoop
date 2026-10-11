import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Sliders,
  Save,
  ShieldCheck,
  Server,
  User,
  LogOut,
  Users,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { fetchHealth, HealthStatus } from '../services/health';
import { useAuth } from '../context/AuthContext';
import { listUsers, updateUserStatus } from '../services/auth';
import { AuthUser } from '../types/auth';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User-facing preferences (stored in localStorage)
  const [volumeUnit, setVolumeUnit] = useState<string>(
    () => localStorage.getItem('blueloop_unit') || 'kl'
  );
  const [failClosedAlerts, setFailClosedAlerts] = useState<boolean>(
    () => localStorage.getItem('blueloop_alert_quality') !== 'false'
  );
  const [proposalAlerts, setProposalAlerts] = useState<boolean>(
    () => localStorage.getItem('blueloop_alert_proposal') !== 'false'
  );
  const [meterDiscrepancyAlerts, setMeterDiscrepancyAlerts] = useState<boolean>(
    () => localStorage.getItem('blueloop_alert_meter') !== 'false'
  );
  const [saveToast, setSaveToast] = useState(false);

  // Admin User Management State
  const [usersList, setUsersList] = useState<AuthUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoadingHealth(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoadingHealth(false);
    }
  };

  const loadAdminUsers = async () => {
    if (user?.role !== 'admin') return;
    setLoadingUsers(true);
    try {
      const users = await listUsers();
      setUsersList(users);
    } catch (err: any) {
      console.error('Failed to load user list for admin:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    checkStatus();
    if (user?.role === 'admin') {
      loadAdminUsers();
    }
  }, [user]);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('blueloop_unit', volumeUnit);
    localStorage.setItem('blueloop_alert_quality', String(failClosedAlerts));
    localStorage.setItem('blueloop_alert_proposal', String(proposalAlerts));
    localStorage.setItem('blueloop_alert_meter', String(meterDiscrepancyAlerts));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleToggleUserStatus = async (targetUser: AuthUser) => {
    if (targetUser.id === user?.id) {
      alert('Cannot disable your own active administrator account.');
      return;
    }
    setUpdatingUserId(targetUser.id);
    try {
      const updated = await updateUserStatus(targetUser.id, !targetUser.is_active);
      setUsersList((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, is_active: updated.is_active } : u))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update user account status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink font-editorial">
              Platform Settings & Account Security
            </h1>
            <StatusBadge status="CONFIRMED" label="Active Workspace" size="xs" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your user profile, organisation data, measurement units, and quality alerting preferences.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={checkStatus}
            disabled={loadingHealth}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingHealth ? 'animate-spin text-water-600' : 'text-slate-400'}`} />
            Check Connection
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={checkStatus} />}

      {saveToast && (
        <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
          <span className="font-medium">Preferences successfully updated for this browser workspace.</span>
        </div>
      )}

      {/* 1. Profile & Organisation Identity Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-ocean-900" />
            <h2 className="text-sm font-bold text-ink">
              User Identity & Organisation Membership
            </h2>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : user?.role === 'supplier'
                ? 'bg-water-100 text-water-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {user?.role || 'Guest'} Role
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Authenticated Full Name
            </span>
            <span className="font-semibold text-ink text-sm block">
              {user?.name || 'Authorized User'}
            </span>
            <span className="text-slate-500 text-[11px] block">{user?.email}</span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-1">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Registered Organisation
            </span>
            <span className="font-semibold text-ink text-sm block">
              {user?.organisation?.name || 'Enterprise Tenant'}
            </span>
            <span className="text-slate-500 text-[11px] block">
              Type: {user?.organisation?.org_type || 'Commercial'} • Org ID: {user?.org_id}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-forest-600" />
            PBKDF2-HMAC-SHA256 session authenticated. Tenancy isolated.
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Current Session</span>
          </button>
        </div>
      </div>

      {/* 2. Measurement Preferences */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="h-4 w-4 text-water-600" />
            <h2 className="text-sm font-bold text-ink">
              Measurement & Display Units
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Volumetric Flow & Storage Unit
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setVolumeUnit('kl')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    volumeUnit === 'kl'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400 font-semibold text-water-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Kiloliters (kL)</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    Standard industrial tariff format (1 kL = 1,000 Liters)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVolumeUnit('m3')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    volumeUnit === 'm3'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400 font-semibold text-water-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Cubic Meters (m³)</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    International SI municipal accounting format (1 m³ = 1 kL)
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <span className="block font-medium text-slate-700 mb-1">
                Standard Water Quality Metric Boundaries
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                Evaluations use rigid standard units: pH (logarithmic 0-14), Total Dissolved Solids
                (mg/L), Chemical Oxygen Demand (mg/L), Turbidity (NTU), and Conductivity (&mu;S/cm).
              </p>
            </div>
          </div>
        </div>

        {/* 3. Notification & Quality Gate Alerting */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="h-4 w-4 text-water-600" />
            <h2 className="text-sm font-bold text-ink">
              Quality & Allocation Notifications
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={failClosedAlerts}
                onChange={(e) => setFailClosedAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-water-600 focus:ring-water-500"
              />
              <div>
                <span className="font-semibold text-ink block">
                  Fail-Closed Quality Breach Warnings
                </span>
                <span className="text-[11px] text-slate-500 leading-snug">
                  Notify when a candidate supply violates COD, TDS, or heavy metals tolerance thresholds.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={proposalAlerts}
                onChange={(e) => setProposalAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-water-600 focus:ring-water-500"
              />
              <div>
                <span className="font-semibold text-ink block">
                  Bilateral Allocation Proposals
                </span>
                <span className="text-[11px] text-slate-500 leading-snug">
                  Notify when the constrained greedy solver identifies a 100% compatible least-cost match.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={meterDiscrepancyAlerts}
                onChange={(e) => setMeterDiscrepancyAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-water-600 focus:ring-water-500"
              />
              <div>
                <span className="font-semibold text-ink block">
                  Physical Meter Telemetry Discrepancies
                </span>
                <span className="text-[11px] text-slate-500 leading-snug">
                  Alert if dispatched flow meter volumes deviate from gate intake receipts by &gt; 1.5%.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ocean-950 hover:bg-ocean-900 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>

      {/* 4. Admin User Management Section (Restricted to Admin Role Only) */}
      {user?.role === 'admin' && (
        <div className="rounded-2xl border border-purple-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-700" />
              <h2 className="text-sm font-bold text-ink">
                Administrator User Governance
              </h2>
            </div>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
              Operational Privilege
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Manage authenticated platform accounts. Disabling an account immediately revokes all active sessions.
          </p>

          {loadingUsers ? (
            <div className="text-xs text-slate-500 flex items-center gap-2 py-4">
              <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
              <span>Loading user records...</span>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Org ID</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-ink block">{u.name}</span>
                        <span className="text-[11px] text-slate-500">{u.email}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono uppercase text-[11px]">{u.role}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{u.org_id}</td>
                      <td className="py-2.5 px-4">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-forest-700 text-[11px] font-medium">
                            <CheckCircle2 className="h-3 w-3 text-forest-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 text-[11px] font-medium">
                            <AlertCircle className="h-3 w-3 text-red-600" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {u.id !== user.id ? (
                          <button
                            type="button"
                            disabled={updatingUserId === u.id}
                            onClick={() => handleToggleUserStatus(u)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                              u.is_active
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {updatingUserId === u.id
                              ? 'Saving...'
                              : u.is_active
                              ? 'Disable'
                              : 'Enable'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Current Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Operational System Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-ocean-900" />
            <h2 className="text-sm font-bold text-ink">
              System Service Status
            </h2>
          </div>
          {health ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-md border border-forest-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" /> Operational (200 OK)
            </span>
          ) : loadingHealth ? (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-slate-400" /> Checking...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
              <AlertCircle className="h-3.5 w-3.5 text-red-600" /> Service Unavailable
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Application Edition
            </span>
            <span className="font-bold text-ink mt-1 block">
              {health?.app_name || 'BlueLoop Platform'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">v{health?.version || '0.1.0'}</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Dataset Mode
            </span>
            <span className="font-bold text-ocean-900 mt-1 block">
              {health?.synthetic_data_mode ? 'Demonstration Sandbox' : 'Enterprise Live'}
            </span>
            <span className="text-[11px] text-slate-500">Sample Facilities Labeled</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Last Connectivity Sync
            </span>
            <span className="font-mono text-ink mt-1 block truncate">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500">Local Gateway</span>
          </div>
        </div>

        <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-forest-600 shrink-0" />
          <span>Continuous deterministic quality rules enforced across all active sessions.</span>
        </div>
      </div>
    </div>
  );
};
