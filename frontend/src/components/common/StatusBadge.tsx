import React from 'react';

export type StatusType =
  | 'DEMO'
  | 'CONFIRMED'
  | 'PENDING'
  | 'UNVERIFIED'
  | 'REJECTED'
  | 'ESTIMATED'
  | 'ACTIVE'
  | 'IDLE';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showDot = true,
}) => {
  const configs: Record<
    StatusType,
    { defaultLabel: string; bg: string; text: string; border: string; dot: string }
  > = {
    DEMO: {
      defaultLabel: 'Demo Spec',
      bg: 'bg-[#F2F6F3]',
      text: 'text-[#174D3A]',
      border: 'border-[#D9E8DF]',
      dot: 'bg-[#174D3A]',
    },
    CONFIRMED: {
      defaultLabel: 'Lab Certified',
      bg: 'bg-[#EDF6F1]',
      text: 'text-[#10392B]',
      border: 'border-[#C2E0D0]',
      dot: 'bg-[#10392B]',
    },
    PENDING: {
      defaultLabel: 'Pending Audit',
      bg: 'bg-[#F7F6F1]',
      text: 'text-[#69736B]',
      border: 'border-[#E2DFD2]',
      dot: 'bg-[#929D94]',
    },
    UNVERIFIED: {
      defaultLabel: 'Self-Reported',
      bg: 'bg-[#FAF6EC]',
      text: 'text-[#8A641B]',
      border: 'border-[#EBDCBA]',
      dot: 'bg-[#C49537]',
    },
    REJECTED: {
      defaultLabel: 'Exceeds Tolerance',
      bg: 'bg-[#FDF3F2]',
      text: 'text-[#972B28]',
      border: 'border-[#F4D1CE]',
      dot: 'bg-[#972B28]',
    },
    ESTIMATED: {
      defaultLabel: 'Model Estimate',
      bg: 'bg-[#EDF7F5]',
      text: 'text-[#11655B]',
      border: 'border-[#CFEDE7]',
      dot: 'bg-[#168779]',
    },
    ACTIVE: {
      defaultLabel: 'Operational',
      bg: 'bg-[#EDF6F1]',
      text: 'text-[#174D3A]',
      border: 'border-[#C2E0D0]',
      dot: 'bg-[#168779]',
    },
    IDLE: {
      defaultLabel: 'Inactive',
      bg: 'bg-[#F4F4EE]',
      text: 'text-[#8C978F]',
      border: 'border-[#E0E5DF]',
      dot: 'bg-[#A8B3AB]',
    },
  };

  const current = configs[status] || configs.DEMO;
  const displayLabel = label || current.defaultLabel;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border tracking-tight ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${current.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
