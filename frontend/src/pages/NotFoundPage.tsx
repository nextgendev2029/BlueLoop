import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="rounded-lg border border-[#E0E5DF] bg-white p-12 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-[#F7F7F2] text-[#69736B]">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-[#202A24]">Page Not Located</h2>
      <p className="mx-auto mt-2 max-w-sm text-xs text-[#69736B]">
        The requested URL path does not correspond to an active route within the BlueLoop platform.
      </p>
      <div className="mt-6">
        <Link
          to="/app/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-[#174D3A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#10392B] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Regional Dashboard
        </Link>
      </div>
    </div>
  );
};
