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

  const { username, avatarUrl, isMaintainer, totalStats, pullRequests, contributions } = userStats;
  const mergeRate = totalStats.totalPRs > 0
    ? Math.round((totalStats.mergedPRs / totalStats.totalPRs) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#161514]/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#E5E0D8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#F7F5F0]">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={avatarUrl}
              alt=""
              className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl ring-2 ring-[#E5E0D8] flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 id="user-modal-title" className="text-lg sm:text-xl font-display font-bold text-[#161514] truncate">
                  {username}
                </h3>
                {isMaintainer ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#9E6212] bg-[#EAA036]/15 px-2 py-0.5 rounded-full border border-[#EAA036]/30 flex-shrink-0">
                    <Shield className="w-3 h-3 fill-[#9E6212]" />
                    Maintainer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#524E48] bg-white px-2 py-0.5 rounded-full border border-[#E5E0D8] flex-shrink-0">
                    <Users className="w-3 h-3" />
                    Community contributor
                  </span>
                )}
              </div>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open GitHub profile for ${username}`}
                className="text-xs text-[#787571] hover:text-[#9E6212] inline-flex items-center gap-1 mt-0.5 font-mono truncate transition-colors"
              >
                <span>github.com/{username}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog (Press Escape)"
            className="p-2 rounded-xl text-[#787571] hover:text-[#161514] hover:bg-[#EFECE6] transition-colors flex-shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className={`p-3.5 sm:p-6 grid gap-2 sm:gap-2.5 border-b border-[#E5E0D8] text-center font-mono ${
          contributions !== undefined && contributions > 0 ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'
        }`}>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8]">
            <div className="text-[11px] sm:text-xs text-[#787571]">Pull requests</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#161514] mt-0.5">
              {totalStats.totalPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-[11px] sm:text-xs text-emerald-800 font-medium">Merged</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-emerald-900 mt-0.5">
              {totalStats.mergedPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#EAA036]/10 border border-[#EAA036]/25">
            <div className="text-[11px] sm:text-xs text-[#9E6212] font-medium">Open</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#9E6212] mt-0.5">
              {totalStats.openPRs}
            </div>
          </div>
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8]">
            <div className="text-[11px] sm:text-xs text-[#65615B] font-medium">Merge rate</div>
            <div className="text-xl sm:text-2xl font-display font-bold text-[#161514] mt-0.5">
              {mergeRate}%
            </div>
          </div>
          {contributions !== undefined && contributions > 0 && (
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#F7F5F0] border border-[#E5E0D8] col-span-2 sm:col-span-1" title="All-time Git commits including merge commits via GitHub API">
              <div className="text-[11px] sm:text-xs text-[#65615B] font-medium">Total commits</div>
              <div className="text-xl sm:text-2xl font-display font-bold text-[#9E6212] mt-0.5">
                {contributions}
              </div>
            </div>
          )}
        </div>

        {/* Pull Requests in Scope */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-2.5 sm:space-y-3">
          <h4 className="text-xs font-semibold text-[#787571] uppercase tracking-wider font-mono">
            Pull requests recorded ({pullRequests.length})
          </h4>

          {pullRequests.length === 0 ? (
            <div className="py-8 text-center space-y-3 font-sans">
              <p className="text-xs text-[#787571]">
                No pull requests found in the current sample for @{username}.
                {contributions ? ` However, they authored ${contributions} all-time Git commits on this repository.` : ''}
              </p>
              <a
                href={`https://github.com/search?q=type%3Apr+author%3A${username}&type=pullrequests`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E0D8] hover:border-[#EAA036] hover:text-[#9E6212] text-xs font-mono font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <span>Search all PRs by @{username} on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {pullRequests.map((pr) => {
                const isMerged = Boolean(pr.merged_at);
                const isOpen = pr.state === 'open';

                return (
                  <div
                    key={`${pr.repository_name}-${pr.number}`}
                    className="p-3 sm:p-3.5 rounded-2xl border border-[#E5E0D8] bg-[#F7F5F0] flex items-start justify-between gap-2.5 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={pr.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#161514] hover:text-[#9E6212] hover:underline flex items-start gap-1"
                      >
                        <span className="line-clamp-2">{pr.title}</span>
                        <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#8F8B83]" />
                      </a>
                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-[#787571] font-mono flex-wrap">
                        <span>#{pr.number}</span>
                        <span>•</span>
                        <span>{format(parseISO(pr.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {isMerged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <GitMerge className="w-3 h-3" />
                          Merged
                        </span>
                      ) : isOpen ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAA036]/15 text-[#9E6212] border border-[#EAA036]/30">
                          <GitPullRequest className="w-3 h-3" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFECE6] text-[#65615B] border border-[#E5E0D8]">
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
