import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-12 text-center shadow-2xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-900">Page Not Found</h2>
      <p className="mx-auto mt-2 max-w-sm text-xs text-stone-500">
        The requested path does not exist in the BlueLoop application.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-teal-800 px-3.5 py-2 text-xs font-medium text-white hover:bg-teal-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
