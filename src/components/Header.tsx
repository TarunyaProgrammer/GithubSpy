import React, { useState } from 'react';
import { KeyRound, Zap, Star, HelpCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { RateLimitPopover } from './RateLimitPopover';
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
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const isHighLimit = rateLimit ? rateLimit.limit >= 1000 : false;
  const remaining = rateLimit?.remaining ?? null;
  const limit = rateLimit?.limit ?? null;

  return (
    <>
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
              aria-label="Star GitHub Spy on GitHub"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] shadow-xs transition-all group focus-visible:ring-2 focus-visible:ring-[#EAA036]"
            >
              <Star className="w-3.5 h-3.5 fill-[#161514] text-[#161514] group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="hidden md:inline">Star on GitHub</span>
              <span className="md:hidden">Star</span>
            </a>

            {/* Real-time GitHub API Quota Badge (Clickable with Explainer Popover) */}
            {rateLimit && (
              <button
                type="button"
                onClick={() => setIsExplainerOpen(true)}
                aria-label="See available GitHub checks"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer ${
                  isHighLimit
                    ? 'bg-[#EAA036]/10 text-[#9E6212] border-[#EAA036]/30 hover:bg-[#EAA036]/20'
                    : remaining !== null && remaining <= 12
                    ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 animate-pulse'
                    : 'bg-white text-[#423E38] border-[#E5E0D8] hover:bg-[#EFECE6]'
                }`}
              title="See how many GitHub requests are available"
              >
                <Zap
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    remaining !== null && remaining <= 12 && !isHighLimit
                      ? 'text-rose-600'
                      : 'text-[#EAA036]'
                  }`}
                />
                <span className="text-[11px] sm:text-xs">
                  <strong>{remaining !== null ? remaining.toLocaleString() : '--'}</strong>
                  <span className="hidden xs:inline">
                    {' '}
                    of {limit !== null ? (limit >= 1000 ? '5k' : limit) : '60'} checks left
                  </span>
                  <span className="xs:hidden">
                    /{limit !== null ? (limit >= 1000 ? '5k' : limit) : '60'}
                  </span>
                </span>
                {remaining !== null && remaining <= 12 && !isHighLimit && (
                  <span className="text-[10px] font-sans font-semibold px-1 rounded bg-rose-200/70 text-rose-900 hidden lg:inline">
                    Running low
                  </span>
                )}
                <HelpCircle className="w-3 h-3 text-[#787571] hidden sm:inline flex-shrink-0 opacity-60 hover:opacity-100" />
              </button>
            )}

            {/* Token setting trigger */}
            <button
              onClick={onOpenTokenModal}
              aria-label="Add or manage a GitHub access token"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                hasPersonalToken
                  ? 'bg-[#EAA036]/15 text-[#9E6212] hover:bg-[#EAA036]/25 border border-[#EAA036]/35'
                  : 'bg-white text-[#161514] hover:bg-[#EFECE6] border border-[#E5E0D8]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              <span className="hidden sm:inline">
                {hasPersonalToken ? 'Token connected' : 'Add GitHub token'}
              </span>
              <span className="sm:hidden">
                {hasPersonalToken ? 'Connected' : 'Token'}
              </span>
              {hasPersonalToken && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAA036] animate-ping flex-shrink-0" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Rate Limit Explainer Popover */}
      {rateLimit && (
        <RateLimitPopover
          rateLimit={rateLimit}
          isOpen={isExplainerOpen}
          onClose={() => setIsExplainerOpen(false)}
          onOpenTokenModal={onOpenTokenModal}
        />
      )}
    </>
  );
};
