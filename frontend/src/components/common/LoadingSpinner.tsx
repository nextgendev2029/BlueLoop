import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading live data...',
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-[#69736B]">
      <RefreshCw className={`${iconSizes[size]} animate-spin text-[#168779] mb-2.5`} />
      <span className="text-xs font-medium text-[#69736B]">{label}</span>
    </div>
  );
};
