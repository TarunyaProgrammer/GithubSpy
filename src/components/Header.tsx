import React from 'react';
import { KeyRound, Sun, MoonStar, Zap, Star } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { RateLimitInfo } from '../types';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  rateLimit: RateLimitInfo | null;
  hasPersonalToken: boolean;
  onOpenTokenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  rateLimit,
  hasPersonalToken,
  onOpenTokenModal,
}) => {
  const isHighLimit = rateLimit ? rateLimit.limit >= 1000 : false;
  const remaining = rateLimit?.remaining ?? null;
  const limit = rateLimit?.limit ?? null;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Minimalist Brand Logo with Vector Emblem */}
        <div className="flex-shrink-0">
          <BrandLogo size="md" />
        </div>

        {/* Right Actions - Ultra Responsive */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
          {/* Star on GitHub CTA */}
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star GithubSpy on GitHub"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-champagne-500/15 via-amber-500/10 to-transparent hover:from-champagne-500/25 border border-champagne-500/30 text-champagne-700 dark:text-champagne-300 hover:text-champagne-800 dark:hover:text-champagne-200 transition-all group focus-visible:ring-1"
          >
            <Star className="w-3.5 h-3.5 fill-champagne-500 text-champagne-500 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="hidden md:inline">Star on GitHub</span>
            <span className="md:hidden">Star</span>
          </a>

          {/* Rate limit badge - visible on tablet and desktop */}
          {rateLimit && (
            <div
              className={`hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono border ${
                isHighLimit
                  ? 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/20'
                  : 'bg-champagne-500/10 text-champagne-700 dark:text-champagne-400 border-champagne-500/20'
              }`}
              title={
                rateLimit.resetDate
                  ? `Resets at ${rateLimit.resetDate.toLocaleTimeString()}`
                  : 'API Rate limit remaining'
              }
            >
              <Zap className="w-3 h-3 text-champagne-500 flex-shrink-0" />
              <span>
                {remaining !== null ? remaining : '--'}/{limit !== null ? limit : '--'}
              </span>
            </div>
          )}

          {/* Token setting trigger */}
          <button
            onClick={onOpenTokenModal}
            aria-label="Configure GitHub API Personal Access Token"
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              hasPersonalToken
                ? 'bg-brand-500/15 text-brand-700 dark:text-brand-300 hover:bg-brand-500/25 border border-brand-500/30'
                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/80'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-champagne-500 flex-shrink-0" />
            <span className="hidden sm:inline">
              {hasPersonalToken ? 'PAT Active' : 'API Token'}
            </span>
            <span className="sm:hidden">
              {hasPersonalToken ? 'PAT' : 'Token'}
            </span>
            {hasPersonalToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping flex-shrink-0" />
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 sm:p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            {darkMode ? <Sun className="w-4 h-4 text-champagne-400" /> : <MoonStar className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
