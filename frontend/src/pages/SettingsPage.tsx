import React from 'react';
import { Cloud, Shield } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#E0E5DF]">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-[#202A24]">
            Platform Environment & Target Cloud Blueprint
          </h2>
          <StatusBadge status="DEMO" label="Local Dev / Target Architecture" size="xs" />
        </div>
        <p className="text-xs text-[#69736B] mt-1">
          Operational configurations, security boundaries, and AWS serverless production infrastructure mappings.
        </p>
      </div>

      {/* Target Cloud Infrastructure Summary */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-[#174D3A]" />
          <h3 className="text-sm font-semibold text-[#202A24]">
            Target AWS Serverless Production Architecture
          </h3>
        </div>
        <p className="text-xs text-[#69736B] leading-relaxed">
          The planned AWS cloud infrastructure is documented in <code className="rounded bg-[#F7F7F2] border border-[#E0E5DF] px-1.5 py-0.5 text-[#202A24] font-mono">infra/README.md</code>.
          Zero live AWS resources are created during local initialisation.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">Amazon API Gateway</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">REST API routing, throttling & CORS</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">AWS Lambda (Python 3.11)</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">FastAPI runtime via Mangum ASGI adapter</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">Amazon DynamoDB</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Single-table high throughput persistence</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">Amazon S3</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Quality report documents & static SPA</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">Amazon Cognito</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Role-based buyer & supplier auth pools</span>
          </div>
          <div className="rounded border border-[#E0E5DF] bg-[#F7F7F2] p-3 text-xs">
            <span className="font-semibold text-[#202A24] block">Amazon CloudFront</span>
            <span className="text-[#69736B] text-[11px] block mt-0.5">Global edge distribution & SSL termination</span>
          </div>
        </div>
      </div>

      {/* Security & Secrets Management Policy */}
      <div className="rounded-lg border border-[#E0E5DF] bg-white p-6 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#174D3A]" />
          <h3 className="text-sm font-semibold text-[#202A24]">
            Security & Secrets Management Policy
          </h3>
        </div>
        <p className="text-xs text-[#69736B] leading-relaxed">
          Zero actual credentials, AWS access keys, or IAM secrets are stored in this repository.
          Local development is governed through safe configuration templates in <code className="rounded bg-[#F7F7F2] border border-[#E0E5DF] px-1.5 py-0.5 text-[#202A24] font-mono">.env.example</code>,
          with all live <code className="rounded bg-[#F7F7F2] border border-[#E0E5DF] px-1.5 py-0.5 text-[#202A24] font-mono">.env</code> files strictly ignored by git.
        </p>
      </div>
    </div>
  );
};
