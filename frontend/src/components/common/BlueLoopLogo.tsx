import React from 'react';

interface BlueLoopLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'brand';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const BlueLoopLogo: React.FC<BlueLoopLogoProps> = ({
  size = 'md',
  variant = 'brand',
  showWordmark = true,
  showSubtitle = false,
  className = '',
}) => {
  // Dimension mappings
  const dimensions = {
    sm: { icon: 24, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 32, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 40, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 52, text: 'text-2xl', sub: 'text-xs' },
  }[size];

  // Color mappings
  const textColor = {
    light: 'text-white',
    dark: 'text-ink',
    brand: 'text-ocean-950',
  }[variant];

  const subColor = {
    light: 'text-aqua-300',
    dark: 'text-slate-500',
    brand: 'text-water-700',
  }[variant];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Original BlueLoop Connected Water Loop Mark */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="blueloop-grad-1" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16B8D4" />
            <stop offset="50%" stopColor="#1677B8" />
            <stop offset="100%" stopColor="#10354A" />
          </linearGradient>
          <linearGradient id="blueloop-grad-loop" x1="12" y1="24" x2="36" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#24B8C7" />
            <stop offset="100%" stopColor="#1677B8" />
          </linearGradient>
        </defs>

        {/* Outer Circular Circulation Path */}
        <path
          d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C33.9411 42 42 33.9411 42 24"
          stroke="url(#blueloop-grad-1)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="opacity-40"
        />

        {/* Dynamic Continuous Fluid Loop (Industrial Closed Loop) */}
        <path
          d="M24 10C16.268 10 10 16.268 10 24C10 29.8 13.5 34.8 18.5 36.9C21.8 38.3 26.2 38.3 29.5 36.9C34.5 34.8 38 29.8 38 24C38 16.268 31.732 10 24 10Z"
          stroke="url(#blueloop-grad-1)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Center Droplet Nucleus */}
        <path
          d="M24 14C24 14 17 23.5 17 28C17 31.866 20.134 35 24 35C27.866 35 31 31.866 31 28C31 23.5 24 14 24 14Z"
          fill="url(#blueloop-grad-loop)"
        />

        {/* Refractive Inner Highlight */}
        <ellipse cx="22" cy="26" rx="2" ry="3.5" transform="rotate(-25 22 26)" fill="#FFFFFF" fillOpacity="0.65" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-editorial font-bold tracking-tight ${dimensions.text} ${textColor}`}>
              BlueLoop
            </span>
          </div>
          {showSubtitle && (
            <span className={`font-mono uppercase tracking-wider font-semibold -mt-0.5 ${dimensions.sub} ${subColor}`}>
              Water Reuse Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
};
