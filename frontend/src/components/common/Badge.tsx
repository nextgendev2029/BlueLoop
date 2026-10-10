import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'forest' | 'brand' | 'teal' | 'mist' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded border tracking-tight';

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  const variantStyles = {
    neutral: 'bg-[#F2F3EE] text-[#69736B] border-[#E0E5DF]',
    forest: 'bg-[#EDF6F1] text-[#174D3A] border-[#D9E8DF]',
    brand: 'bg-[#EDF6F1] text-[#174D3A] border-[#D9E8DF]', // mapped to forest
    teal: 'bg-[#EDF7F5] text-[#11655B] border-[#D0ECE7]',
    mist: 'bg-[#D9E8DF] text-[#10392B] border-[#C6D9CE]',
    warning: 'bg-[#FAF6EC] text-[#8A641B] border-[#EBDCBA]',
    info: 'bg-[#F0F4FC] text-[#2C5282] border-[#D2E0F5]',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
