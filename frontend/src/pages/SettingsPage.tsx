import React from 'react';
import { Cloud, Shield } from 'lucide-react';


export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Platform Settings & Architecture Blueprint</h2>
        <p className="text-xs text-stone-500">
          Environment runtime variables, security boundaries, and target AWS cloud parameters.
        </p>
      </div>

      {/* Target Cloud Infrastructure Summary */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-teal-700" />
          <h3 className="text-sm font-semibold text-slate-900">Target AWS Serverless Architecture</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          The planned production deployment utilizes AWS native serverless services configured in <code className="rounded bg-stone-100 px-1 py-0.5 text-slate-800">infra/</code>:
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">Amazon API Gateway</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">REST API routing & throttling</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">AWS Lambda (Python 3.11)</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">FastAPI runtime via Mangum</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">Amazon DynamoDB</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">Single-table high throughput persistence</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">Amazon S3</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">Quality report documents & static SPA</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">Amazon Cognito</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">Role-based buyer & supplier auth</span>
          </div>
          <div className="rounded border border-stone-200 bg-stone-50 p-3 text-xs">
            <span className="font-semibold text-slate-800 block">Amazon CloudFront</span>
            <span className="text-stone-500 text-[11px] block mt-0.5">Global edge distribution & SSL</span>
          </div>
        </div>
      </div>

      {/* Security & Secret Policy */}
      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-700" />
          <h3 className="text-sm font-semibold text-slate-900">Security & Secrets Management Policy</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Zero real secrets, AWS account numbers, or IAM tokens are stored in the codebase.
          Local configuration is governed via <code className="rounded bg-stone-100 px-1 py-0.5 text-slate-800">.env.example</code> with
          all local <code className="rounded bg-stone-100 px-1 py-0.5 text-slate-800">.env</code> files strictly ignored by git.
        </p>
      </div>
    </div>
  );
};
