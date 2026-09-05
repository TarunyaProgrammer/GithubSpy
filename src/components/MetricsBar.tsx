import React from 'react';
import { GitPullRequest, GitMerge, Clock, Shield, Users } from 'lucide-react';
import type { RepoMetrics } from '../types';

interface MetricsBarProps {
  metrics: RepoMetrics;
  fullName: string;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, fullName }) => {
  const formatAvgTime = (hours: number | null) => {
    if (hours === null) return 'N/A';
    if (hours < 1) return '< 1 hr';
    if (hours < 24) return `${hours} hrs`;
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} d`;
  };

  return (
    <div className="w-full my-3 sm:my-4">
      {/* Target Repo Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 font-mono text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
            Target
          </span>
          <a
            href={`https://github.com/${fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500 hover:underline transition-colors font-mono break-all"
          >
            {fullName}
          </a>
        </h2>
        <span className="text-[11px] sm:text-xs text-zinc-500 font-mono">
          {metrics.totalPRs} recent pull requests analyzed
        </span>
      </div>

      {/* Grid of 5 Luxury Stat Cards - Highly Responsive (2 col mobile, 3 col tablet/half screen, 5 col desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total PRs */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-brand-500/30 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <GitPullRequest className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span className="truncate">Total PRs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white">
            {metrics.totalPRs}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 flex gap-1.5 sm:gap-2 font-mono flex-wrap">
            <span className="text-amber-600 dark:text-amber-400 font-medium">{metrics.openCount} open</span>
            <span>•</span>
            <span className="text-violet-600 dark:text-violet-400 font-medium">{metrics.mergedCount} mrg</span>
          </div>
        </div>

        {/* Merge Rate */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-violet-500/30 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <GitMerge className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <span className="truncate">Acceptance</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white">
            {metrics.mergeRatePct}%
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-violet-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.mergeRatePct, 100)}%` }}
            />
          </div>
        </div>

        {/* Average Merge Speed */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-champagne-500 flex-shrink-0" />
            <span className="truncate">Turnaround</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 dark:text-white">
            {formatAvgTime(metrics.avgMergeTimeHours)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono">Avg merge time</div>
        </div>

        {/* Maintainers */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-champagne-500/30 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Shield className="w-3.5 h-3.5 text-champagne-500 flex-shrink-0" />
            <span className="truncate">Maintainers</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-champagne-600 dark:text-champagne-400">
            {metrics.maintainersCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono">Active reviewers</div>
        </div>

        {/* External Contributors / Applicants - Spans 2 cols on mobile */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs col-span-2 sm:col-span-2 lg:col-span-1 hover:border-brand-500/30 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <Users className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
            <span className="truncate">Applicants</span>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-brand-600 dark:text-brand-400">
            {metrics.contributorsCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-zinc-500 mt-1 font-mono">External contributors</div>
        </div>
      </div>
    </div>
  );
};
