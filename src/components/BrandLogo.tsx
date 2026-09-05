import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * Ultra-minimalist luxury vector insignia for GithubSpy.
 * Features a geometric GitHub silhouette fused with a stealth radar aperture
 * and a precision champagne-gold beacon node.
 * Designed to remain razor-sharp at any resolution (from 16px to 512px).
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true }) => {
  const sizeMap = {
    sm: { box: 28, icon: 18, text: 'text-base' },
    md: { box: 36, icon: 22, text: 'text-lg' },
    lg: { box: 48, icon: 30, text: 'text-2xl' },
  };

  const { box, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none group cursor-pointer">
      {/* Precision Vector Emblem */}
      <div
        style={{ width: box, height: box }}
        className="rounded-xl bg-zinc-900 dark:bg-obsidian-900 border border-zinc-700/80 dark:border-zinc-800 flex items-center justify-center relative shadow-sm group-hover:border-brand-500/50 transition-all"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 transition-transform group-hover:scale-105 duration-200"
          aria-hidden="true"
        >
          {/* Subtle Outer Radar Arc */}
          <circle
            cx="16"
            cy="16"
            r="13"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 3"
            className="text-zinc-600 dark:text-zinc-700"
          />

          {/* Minimalist GitHub Silhouette Contour */}
          <path
            d="M16 5C9.92 5 5 9.92 5 16C5 20.87 8.16 24.99 12.54 26.45C13.09 26.55 13.29 26.21 13.29 25.92C13.29 25.66 13.28 24.77 13.27 23.86C10.21 24.52 9.57 22.54 9.57 22.54C9.07 21.27 8.35 20.93 8.35 20.93C7.35 20.25 8.43 20.27 8.43 20.27C9.53 20.35 10.11 21.41 10.11 21.41C11.09 23.09 12.69 22.61 13.31 22.33C13.41 21.62 13.69 21.13 14 20.86C11.55 20.58 8.98 19.64 8.98 15.42C8.98 14.22 9.41 13.23 10.12 12.46C10.01 12.18 9.63 11.06 10.23 9.55C10.23 9.55 11.16 9.25 13.27 10.68C14.15 10.43 15.08 10.31 16 10.31C16.92 10.31 17.85 10.43 18.73 10.68C20.84 9.25 21.77 9.55 21.77 9.55C22.37 11.06 21.99 12.18 21.88 12.46C22.59 13.23 23.02 14.22 23.02 15.42C23.02 19.65 20.44 20.58 17.98 20.85C18.37 21.19 18.72 21.84 18.72 22.84C18.72 24.28 18.71 25.44 18.71 25.79C18.71 26.09 18.91 26.43 19.47 26.32C23.84 24.85 27 20.74 27 16C27 9.92 22.08 5 16 5Z"
            fill="currentColor"
            className="text-white dark:text-zinc-100"
          />

          {/* Minimal Radar Reticle Center Crosshair */}
          <line
            x1="16"
            y1="13"
            x2="16"
            y2="19"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="13"
            y1="16"
            x2="19"
            y2="16"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Precision Champagne Gold Beacon Node */}
          <circle
            cx="16"
            cy="16"
            r="2.2"
            fill="#f59e0b"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`${text} font-display font-bold tracking-tight text-zinc-900 dark:text-white`}>
            GithubSpy
          </span>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            Radar
          </span>
        </div>
      )}
    </div>
  );
};
