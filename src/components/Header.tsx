import React from 'react';
import { KeyRound, Sun, MoonStar, Zap, Star } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import type { RateLimitInfo } from '../types';

interface HeaderProps {
  rateLimit: RateLimitInfo | null;
  hasPersonalToken: boolean;
  onOpenTokenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  rateLimit,
  hasPersonalToken,
  onOpenTokenModal,
}) => {
  const isHighLimit = rateLimit ? rateLimit.limit >= 1000 : false;
  const remaining = rateLimit?.remaining ?? null;
  const limit = rateLimit?.limit ?? null;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E5E0D8] bg-[#F7F5F0]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2">
        {/* Minimalist Brand Logo */}
        <div className="flex-shrink-0">
          <BrandLogo size="md" />
        </div>

        {/* Right Actions - Warm Editorial Styling */}
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
          {/* Star on GitHub CTA - Signature Honey Amber Solid Button */}
          <a
            href="https://github.com/TarunyaProgrammer/GithubSpy"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star GithubSpy on GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] shadow-xs transition-all group focus-visible:ring-2 focus-visible:ring-[#EAA036]"
          >
            <Star className="w-3.5 h-3.5 fill-[#161514] text-[#161514] group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="hidden md:inline">Star on GitHub</span>
            <span className="md:hidden">Star</span>
          </a>

          {/* Rate limit badge - visible on tablet and desktop */}
          {rateLimit && (
            <div
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border ${
                isHighLimit
                  ? 'bg-[#EAA036]/10 text-[#9E6212] border-[#EAA036]/25'
                  : 'bg-white text-[#524E48] border-[#E5E0D8]'
              }`}
              title={
                rateLimit.resetDate
                  ? `Resets at ${rateLimit.resetDate.toLocaleTimeString()}`
                  : 'API Rate limit remaining'
              }
            >
              <Zap className="w-3 h-3 text-[#EAA036] flex-shrink-0" />
              <span>
                {remaining !== null ? remaining : '--'}/{limit !== null ? limit : '--'} req/hr
              </span>
            </div>
          )}

          {/* Token setting trigger */}
          <button
            onClick={onOpenTokenModal}
            aria-label="Configure GitHub API Personal Access Token"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              hasPersonalToken
                ? 'bg-[#EAA036]/15 text-[#9E6212] hover:bg-[#EAA036]/25 border border-[#EAA036]/35'
                : 'bg-white text-[#161514] hover:bg-[#EFECE6] border border-[#E5E0D8]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
            <span className="hidden sm:inline">
              {hasPersonalToken ? 'PAT Active' : 'API Token'}
            </span>
            <span className="sm:hidden">
              {hasPersonalToken ? 'PAT' : 'Token'}
            </span>
            {hasPersonalToken && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAA036] animate-ping flex-shrink-0" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
