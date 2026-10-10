import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'brand' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded border';

  const sizeStyles = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
  };

  const variantStyles = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    brand: 'bg-teal-50 text-teal-800 border-teal-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`}>
      {children}
    </span>
  );
};
