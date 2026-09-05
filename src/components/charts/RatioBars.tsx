import React from 'react';
import { GitMerge, GitPullRequest, GitPullRequestClosed, Users, Shield } from 'lucide-react';
import type { RepoMetrics } from '../../types';

interface RatioBarsProps {
  metrics: RepoMetrics;
}

export const RatioBars: React.FC<RatioBarsProps> = ({ metrics }) => {
  const { totalPRs, mergedCount, openCount, closedCount, maintainersCount, contributorsCount } = metrics;
  const totalPeople = maintainersCount + contributorsCount;

  const mergedPct = totalPRs > 0 ? Math.round((mergedCount / totalPRs) * 100) : 0;
  const openPct = totalPRs > 0 ? Math.round((openCount / totalPRs) * 100) : 0;
  const closedPct = totalPRs > 0 ? Math.max(100 - mergedPct - openPct, 0) : 0;

  const applicantPct = totalPeople > 0 ? Math.round((contributorsCount / totalPeople) * 100) : 0;
  const maintainerPct = totalPeople > 0 ? Math.max(100 - applicantPct, 0) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      {/* PR Status Breakdown Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-violet-500" />
            <span>PR Resolution Breakdown</span>
          </span>
          <span className="font-mono text-zinc-500">{totalPRs} pull requests</span>
        </div>

        {/* Multi-segment bar */}
        <div
          className="h-3.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex"
          role="progressbar"
          aria-valuenow={mergedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`PR status breakdown: ${mergedPct}% merged, ${openPct}% open, ${closedPct}% closed.`}
        >
          {mergedPct > 0 && (
            <div
              style={{ width: `${mergedPct}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              title={`Merged: ${mergedCount} (${mergedPct}%)`}
            />
          )}
          {openPct > 0 && (
            <div
              style={{ width: `${openPct}%` }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
              title={`Open: ${openCount} (${openPct}%)`}
            />
          )}
          {closedPct > 0 && (
            <div
              style={{ width: `${closedPct}%` }}
              className="h-full bg-zinc-400 dark:bg-zinc-600 transition-all duration-500"
              title={`Closed without merge: ${closedCount} (${closedPct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            <span>Merged: <strong>{mergedPct}%</strong> ({mergedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Open: <strong>{openPct}%</strong> ({openCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-zinc-400" />
            <span>Closed: <strong>{closedPct}%</strong> ({closedCount})</span>
          </div>
        </div>
      </div>

      {/* Community vs Maintainer Dynamics */}
      <div className="p-4 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-brand-500" />
            <span>Community vs Core Maintainers</span>
          </span>
          <span className="font-mono text-zinc-500">{totalPeople} unique active contributors</span>
        </div>

        {/* Multi-segment bar */}
        <div
          className="h-3.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex"
          role="progressbar"
          aria-valuenow={applicantPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Participant dynamics: ${applicantPct}% external community applicants, ${maintainerPct}% core maintainers.`}
        >
          {applicantPct > 0 && (
            <div
              style={{ width: `${applicantPct}%` }}
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
              title={`Applicants: ${contributorsCount} (${applicantPct}%)`}
            />
          )}
          {maintainerPct > 0 && (
            <div
              style={{ width: `${maintainerPct}%` }}
              className="h-full bg-gradient-to-r from-champagne-400 to-champagne-600 transition-all duration-500"
              title={`Maintainers: ${maintainersCount} (${maintainerPct}%)`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>Applicants / External: <strong>{applicantPct}%</strong> ({contributorsCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-champagne-500" />
            <span>Maintainers: <strong>{maintainerPct}%</strong> ({maintainersCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
