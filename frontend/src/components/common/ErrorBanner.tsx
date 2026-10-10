import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  title = 'API Communication Error',
}) => {
  return (
    <div className="rounded-lg border border-[#F4D1CE] bg-[#FDF3F2] p-4 text-xs text-[#972B28]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#972B28]" />
          <div>
            <h4 className="font-semibold text-[#972B28]">{title}</h4>
            <p className="mt-0.5 text-[#972B28]/90 leading-relaxed">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded border border-[#F4D1CE] bg-white px-2.5 py-1 text-[11px] font-medium text-[#972B28] hover:bg-[#FBF1F0] transition-colors shrink-0 shadow-2xs"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        )}
      </div>
    </div>
  );
};
