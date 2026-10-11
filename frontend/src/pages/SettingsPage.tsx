import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  Sliders,
  Save,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { fetchHealth, HealthStatus } from '../services/health';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
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

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('blueloop_unit', volumeUnit);
    localStorage.setItem('blueloop_alert_quality', String(failClosedAlerts));
    localStorage.setItem('blueloop_alert_proposal', String(proposalAlerts));
    localStorage.setItem('blueloop_alert_meter', String(meterDiscrepancyAlerts));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Platform Settings & Preferences
            </h1>
            <StatusBadge status="CONFIRMED" label="Active Workspace" size="xs" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure volumetric measurement units, compliance alerting thresholds, and inspect
            operational API connectivity.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-water-600' : 'text-slate-400'}`} />
            Check Connection
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={checkStatus} />}

      {saveToast && (
        <div className="p-3.5 rounded-xl bg-forest-50 border border-forest-200 text-forest-800 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
          <span className="font-medium">Preferences successfully updated for this browser workspace.</span>
        </div>
      )}

      {/* 1. Operational Measurement Preferences */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
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
                  className={`p-3 rounded-lg border text-left transition-all ${
                    volumeUnit === 'kl'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400 font-semibold text-water-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Kiloliters (kL)</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    Standard industrial tariff format (1 kL = 1 m³)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setVolumeUnit('m3')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    volumeUnit === 'm3'
                      ? 'bg-water-50 border-water-500 ring-1 ring-water-400 font-semibold text-water-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">Cubic Meters (m³)</span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    International SI municipal accounting format
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <span className="block font-medium text-slate-700 mb-1">
                Water Quality Standard Tolerances
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                Evaluations use rigid standard units: pH (logarithmic 0–14), Total Dissolved Solids
                (mg/L), Chemical Oxygen Demand (mg/L), Turbidity (NTU), and Conductivity (&mu;S/cm).
              </p>
            </div>
          </div>
        </div>

        {/* 2. Notification & Quality Gate Alerting */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
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
                  Notify when a candidate supply violates a COD, TDS, or heavy metals tolerance
                  threshold.
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
                  Notify when the constrained greedy solver identifies a 100% compatible
                  least-cost match.
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
                  Alert if dispatched flow meter volumes deviate from gate intake meter receipts
                  by &gt; 1.5%.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-water-600 hover:bg-water-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. Operational System Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
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
          ) : loading ? (
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Application Edition
            </span>
            <span className="font-bold text-ink mt-1 block">
              {health?.app_name || 'BlueLoop Platform'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">v{health?.version || '0.1.0'}</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
            <span className="text-slate-500 text-[10px] uppercase font-mono block">
              Dataset Mode
            </span>
            <span className="font-bold text-ocean-900 mt-1 block">
              {health?.synthetic_data_mode ? 'Demonstration Sandbox' : 'Enterprise Live'}
            </span>
            <span className="text-[11px] text-slate-500">Sample Facilities Labeled</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
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
