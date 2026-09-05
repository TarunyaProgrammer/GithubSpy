import React, { useEffect } from 'react';
import { X, ExternalLink, Shield, Users, GitPullRequest, GitMerge, GitPullRequestClosed } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { UserStats } from '../types';

interface UserModalProps {
  userStats: UserStats | null;
  onClose: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ userStats, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!userStats) return null;

  const { username, avatarUrl, isMaintainer, totalStats, pullRequests } = userStats;
  const mergeRate = totalStats.totalPRs > 0
    ? Math.round((totalStats.mergedPRs / totalStats.totalPRs) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-obsidian-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fluid flex */}
        <div className="p-4 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarUrl}
              alt=""
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ring-2 ring-zinc-200 dark:ring-zinc-700 flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 id="user-modal-title" className="text-lg sm:text-xl font-serif font-bold text-zinc-900 dark:text-white truncate">
                  {username}
                </h3>
                {isMaintainer ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-champagne-700 dark:text-champagne-300 bg-champagne-100 dark:bg-champagne-950/60 px-2 py-0.5 rounded-full border border-champagne-300 dark:border-champagne-800 flex-shrink-0">
                    <Shield className="w-3 h-3" />
                    Maintainer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/60 px-2 py-0.5 rounded-full border border-brand-300 dark:border-brand-800 flex-shrink-0">
                    <Users className="w-3 h-3" />
                    Applicant
                  </span>
                )}
              </div>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open GitHub profile for ${username}`}
                className="text-xs text-zinc-500 hover:text-brand-500 inline-flex items-center gap-1 mt-0.5 font-mono truncate"
              >
                <span>github.com/{username}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog (Press Escape)"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip - 2 cols on mobile, 4 cols on desktop */}
        <div className="p-3.5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 border-b border-zinc-100 dark:border-zinc-800 text-center font-mono">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40">
            <div className="text-[11px] sm:text-xs text-zinc-500">Total PRs</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 dark:text-white mt-0.5">
              {totalStats.totalPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-violet-50/50 dark:bg-violet-950/30">
            <div className="text-[11px] sm:text-xs text-violet-600 dark:text-violet-400 font-medium">Merged</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-violet-700 dark:text-violet-300 mt-0.5">
              {totalStats.mergedPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30">
            <div className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">Open</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-amber-700 dark:text-amber-300 mt-0.5">
              {totalStats.openPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30">
            <div className="text-[11px] sm:text-xs text-brand-600 dark:text-brand-400 font-medium">Acceptance</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-brand-700 dark:text-brand-300 mt-0.5">
              {mergeRate}%
            </div>
          </div>
        </div>

        {/* Pull Requests in Repository */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-2.5 sm:space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
            Submissions in Selected Scope ({pullRequests.length})
          </h4>

          {pullRequests.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center">
              No pull requests recorded in the current timeframe.
            </p>
          ) : (
            <div className="space-y-2">
              {pullRequests.map((pr) => {
                const isMerged = Boolean(pr.merged_at);
                const isOpen = pr.state === 'open';

                return (
                  <div
                    key={`${pr.repository_name}-${pr.number}`}
                    className="p-3 sm:p-3.5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20 flex items-start justify-between gap-2.5 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-zinc-900 dark:text-white hover:text-brand-500 hover:underline flex items-start gap-1"
                      >
                        <span className="line-clamp-2">{pr.title}</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-zinc-400" />
                      </a>
                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono flex-wrap">
                        <span>#{pr.number}</span>
                        <span>•</span>
                        <span>{format(parseISO(pr.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isMerged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/25">
                          <GitMerge className="w-3 h-3" />
                          Merged
                        </span>
                      ) : isOpen ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                          <GitPullRequest className="w-3 h-3" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/25">
                          <GitPullRequestClosed className="w-3 h-3" />
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
