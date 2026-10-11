import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Shield,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { fetchHealth, HealthStatus } from '../services/health';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend health check.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[#E0E5DF]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
              Platform Environment, Runtime Status & Cloud Architecture
            </h2>
            <StatusBadge status="DEMO" label="System Telemetry" size="xs" />
          </div>
          <p className="text-xs text-[#69736B] mt-1">
            Live backend runtime health, persistence mode limits, and target AWS serverless infrastructure blueprint.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={checkStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E0E5DF] bg-[#F7F7F2] px-3 py-1.5 text-xs font-medium text-[#202A24] hover:bg-[#ECEFEA] transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#168779]' : 'text-[#69736B]'}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={checkStatus} />}

      {/* 1. Live Runtime Status Card */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEFEA]">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#174D3A]" />
            <h3 className="text-sm font-bold text-[#202A24]">
              Active Local Runtime Telemetry
            </h3>
          </div>
          {health ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#174D3A] bg-[#EDF6F1] px-2.5 py-1 rounded border border-[#C2E0D0]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#168779]" /> API Healthy (200 OK)
            </span>
          ) : loading ? (
            <span className="text-xs text-[#69736B] flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" /> Querying...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#972B28] bg-[#FDF3F2] px-2.5 py-1 rounded border border-[#F4D1CE]">
              <AlertCircle className="h-3.5 w-3.5" /> Backend Offline
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] uppercase font-mono block">Application Version</span>
            <span className="font-mono font-bold text-[#202A24] mt-1 block">
              {health?.version || '0.1.0'}
            </span>
            <span className="text-[10px] text-[#8C978F]">{health?.app_name || 'BlueLoop Platform'}</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] uppercase font-mono block">Environment Mode</span>
            <span className="font-mono font-bold text-[#174D3A] mt-1 block">
              {health?.environment || 'development'}
            </span>
            <span className="text-[10px] text-[#8C978F]">Local Hackathon Host</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] uppercase font-mono block">Data Integrity Mode</span>
            <span className="font-mono font-bold text-[#8A641B] mt-1 block">
              {health?.synthetic_data_mode ? 'SYNTHETIC_SAFE' : 'PRODUCTION'}
            </span>
            <span className="text-[10px] text-[#8C978F]">Fictional Entities Labeled</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="text-[#69736B] text-[10px] uppercase font-mono block">Telemetry Timestamp</span>
            <span className="font-mono text-[11px] text-[#202A24] mt-1 block truncate">
              {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
            </span>
            <span className="text-[10px] text-[#8C978F]">UTC ISO-8601</span>
          </div>
        </div>
      </div>

      {/* 2. Operational Capabilities vs Known Boundaries Matrix */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#ECEFEA]">
          <Cpu className="h-5 w-5 text-[#174D3A]" />
          <h3 className="text-sm font-bold text-[#202A24]">
            Implemented Platform Capabilities & Operational Boundaries
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded border border-[#C2E0D0] bg-[#EDF6F1]/50 p-4 space-y-2">
            <span className="font-bold text-[#10392B] flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 text-[#168779]" /> Implemented Operational Capabilities (Stage 4)
            </span>
            <ul className="space-y-1.5 text-[11px] text-[#174D3A]">
              <li>&bull; <strong>Deterministic Quality Gate:</strong> Mathematical boundary screening with fail-closed missing data handling.</li>
              <li>&bull; <strong>Constrained Allocation Solver:</strong> Multi-facility greedy optimization respecting capacity & distance.</li>
              <li>&bull; <strong>Haversine Logistics Calculator:</strong> Accurate one-way freight distance calculation.</li>
              <li>&bull; <strong>5-Stage Custody Lifecycle:</strong> Full state machine progression from dispatch to confirmed receipt.</li>
              <li>&bull; <strong>Multi-Tier Impact Accounting:</strong> Strict segregation of potential, accepted, confirmed, and certified savings.</li>
              <li>&bull; <strong>65 Automated Unit & Integration Tests:</strong> 100% passing test suite across models, services, and APIs.</li>
            </ul>
          </div>

          <div className="rounded border border-[#EBDCBA] bg-[#FAF6EC] p-4 space-y-2">
            <span className="font-bold text-[#8A641B] flex items-center gap-1.5 text-xs">
              <Database className="h-4 w-4 text-[#C49537]" /> Current Architectural Limitations
            </span>
            <ul className="space-y-1.5 text-[11px] text-[#69736B]">
              <li>&bull; <strong>Volatile In-Memory Storage:</strong> Data is stored in thread-safe Python memory dictionaries. New allocation proposals and delivery records persist across HTTP requests during server lifetime, but reset upon uvicorn restart.</li>
              <li>&bull; <strong>Synchronous Execution:</strong> Allocation runs execute in-process within the HTTP request cycle (suitable for demo datasets).</li>
              <li>&bull; <strong>Open Access:</strong> API endpoints do not enforce authentication tokens in local development mode.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Target AWS Serverless Architecture Blueprint (Planned for Stage 6) */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEFEA]">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-[#397FA3]" />
            <h3 className="text-sm font-bold text-[#202A24]">
              Target AWS Cloud Infrastructure Blueprint
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#397FA3] bg-[#EAF3F6] px-2 py-0.5 rounded border border-[#D0E2EB]">
            Planned for Cloud Deployment (Stage 6)
          </span>
        </div>

        <p className="text-xs text-[#69736B] leading-relaxed">
          The planned AWS cloud infrastructure is documented in <code className="rounded bg-[#F7F7F2] border border-[#E0E5DF] px-1.5 py-0.5 text-[#202A24] font-mono">infra/README.md</code>.
          Zero live AWS cloud resources are provisioned during local development.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Amazon API Gateway</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">REST API routing, throttling & CORS integration</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Blueprint Ready</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">AWS Lambda (Python 3.11)</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">FastAPI serverless execution via Mangum adapter</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Handler Configured</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Amazon DynamoDB</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Single-table high throughput persistence store</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Schema Codified</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Amazon S3</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Lab test certificates & static SPA distribution</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Bucket IAM Mapped</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Amazon Cognito</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Multi-tenant role-based buyer & supplier auth</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Planned</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3">
            <span className="font-semibold text-[#202A24] block">Amazon CloudFront</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Global edge distribution & SSL termination</span>
            <span className="text-[10px] font-mono text-[#8C978F] mt-1 block">Status: Planned</span>
          </div>
        </div>
      </div>

      {/* 4. Security & Compliance Governance Policy */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-5 sm:p-6 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#174D3A]" />
          <h3 className="text-sm font-bold text-[#202A24]">
            Security, Credentials & Compliance Policy
          </h3>
        </div>
        <p className="text-xs text-[#69736B] leading-relaxed">
          Zero actual credentials, AWS access keys, or IAM secrets are stored in this codebase.
          Environment variables are defined exclusively via safe templates in <code className="font-mono text-[#202A24]">.env.example</code>,
          with live <code className="font-mono text-[#202A24]">.env</code> files strictly excluded by git.
          Production deployment will utilize AWS Secrets Manager and IAM role-based authentication.
        </p>
      </div>
    </div>
  );
};
