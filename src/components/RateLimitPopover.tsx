import React, { useState, useEffect } from 'react';
import { Zap, Clock, Wifi, KeyRound, X, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import type { RateLimitInfo } from '../types';

interface RateLimitPopoverProps {
  rateLimit: RateLimitInfo;
  isOpen: boolean;
  onClose: () => void;
  onOpenTokenModal: () => void;
}

export const RateLimitPopover: React.FC<RateLimitPopoverProps> = ({
  rateLimit,
  isOpen,
  onClose,
  onOpenTokenModal,
}) => {
  const { limit, remaining, resetDate, isAuthenticated } = rateLimit;
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  // Real-time ticking countdown to hourly rate-limit reset
  useEffect(() => {
    if (!resetDate) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diffMs = resetDate.getTime() - now;

      if (diffMs <= 0) {
        setTimeLeftStr('Resetting now...');
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      setTimeLeftStr(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [resetDate]);

  if (!isOpen) return null;

  const pctRemaining = limit > 0 ? Math.min(Math.max(Math.round((remaining / limit) * 100), 0), 100) : 0;
  const isDepleted = remaining === 0;
  const isLow = remaining <= 12 && !isAuthenticated;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end p-3 sm:p-6 sm:pt-16 bg-black/25 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white border border-[#E5E0D8] shadow-xl p-4 sm:p-5 text-[#161514] font-sans relative mt-12 sm:mt-2 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="GitHub request limit"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8]">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${
                isDepleted
                  ? 'bg-rose-100 text-rose-700'
                  : isLow
                  ? 'bg-amber-100 text-[#9E6212]'
                  : 'bg-[#EAA036]/15 text-[#9E6212]'
              }`}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase font-mono text-[#524E48]">
                GitHub request limit
              </h3>
              <p className="text-[11px] text-[#787571]">
                {isAuthenticated ? 'Your token is connected' : 'Using public GitHub access'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popover"
            className="p-1 rounded-lg text-[#787571] hover:text-[#161514] hover:bg-[#F7F5F0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Quota Bar & Numbers */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8]">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl font-bold font-mono ${
                  isDepleted ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-[#161514]'
                }`}
              >
                {remaining.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-[#787571]">
                / {limit >= 1000 ? `${(limit / 1000).toFixed(0)}k` : limit} checks per hour
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#787571]">
              {pctRemaining}% remaining
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#E5E0D8] overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isDepleted ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-[#EAA036]'
              }`}
              style={{ width: `${pctRemaining}%` }}
            />
          </div>

          {/* Reset Countdown Timer */}
          {resetDate && (
            <div className="mt-2.5 pt-2 border-t border-[#E5E0D8]/60 flex items-center justify-between text-[11px] text-[#524E48]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#EAA036]" />
                <span>Resets in:</span>
              </span>
              <span className="font-mono font-bold text-[#161514]">
                {timeLeftStr || 'in ~1 hr'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3.5 space-y-2 text-xs text-[#524E48] leading-relaxed">
          <div className="flex items-start gap-2">
            <Wifi className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong className="text-[#161514]">Why this limit changes:</strong> Without a token, GitHub shares 60 requests per hour across activity from this internet connection, including other apps or devices.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0 mt-0.5" />
            <p className="text-[11px]">
              <strong className="text-[#161514]">Saved results help:</strong> GitHub Spy reuses recent results when it can, so changing the time period or opening a contributor often does not need another GitHub request.
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-4 pt-3 border-t border-[#E5E0D8]">
            <div className="p-3 rounded-xl bg-[#EAA036]/10 border border-[#EAA036]/30 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#9E6212] mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EAA036]" />
                <span>Up to 5,000 checks per hour</span>
              </div>
              <p className="text-[11px] text-[#524E48] leading-normal">
                Add a free GitHub personal access token to use your own GitHub limit instead of the shared public limit.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTokenModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#EAA036] hover:bg-[#DF9126] active:bg-[#C87E18] text-[#161514] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Add a GitHub token</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
