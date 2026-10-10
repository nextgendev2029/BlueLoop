import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}) => {
  return (
    <div className="rounded-lg border border-dashed border-[#CBD3CA] bg-white p-8 sm:p-12 text-center shadow-card">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-[#EDF6F1] text-[#174D3A]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3.5 text-sm font-bold text-[#202A24]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs text-[#69736B] leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            disabled={actionDisabled}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
              actionDisabled
                ? 'bg-[#E0E5DF] text-[#8C978F] cursor-not-allowed'
                : 'bg-[#174D3A] text-white hover:bg-[#10392B]'
            }`}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};
