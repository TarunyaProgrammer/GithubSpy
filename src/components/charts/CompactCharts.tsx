import React from 'react';
import { GitMerge, GitPullRequest, GitPullRequestClosed, Users, Shield, Clock } from 'lucide-react';
import type { RepoMetrics } from '../../types';

interface CompactChartsProps {
  metrics: RepoMetrics;
}

const formatTurnaround = (hours: number | null) => {
  if (hours === null) return 'We need more merged pull requests to estimate this.';
  if (hours < 1) return 'Usually under an hour';
  if (hours < 24) return `Usually about ${Math.round(hours)} hours`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `Usually about ${days} ${days === 1 ? 'day' : 'days'}`;
};

export const CompactCharts: React.FC<CompactChartsProps> = ({ metrics }) => {
  const total = Math.max(metrics.totalPRs, 1);
  const outcomes = [
    { label: 'Merged', count: metrics.mergedCount, color: 'bg-emerald-600', icon: GitMerge, description: 'became part of the project' },
    { label: 'Still open', count: metrics.openCount, color: 'bg-[#EAA036]', icon: GitPullRequest, description: 'are still being discussed or reviewed' },
    { label: 'Closed without merging', count: metrics.closedCount, color: 'bg-[#A8A29E]', icon: GitPullRequestClosed, description: 'did not become part of the project' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4" aria-label="Contribution activity details">
      <article className="rounded-2xl border border-[#E5E0D8] bg-white p-4 sm:p-5">
        <h3 className="text-base font-display font-bold text-[#161514]">What happened to recent contributions?</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#787571]">This helps you see whether contributions tend to move forward, stay in review, or stop before merging.</p>

        <div className="mt-4 flex h-3 overflow-hidden rounded-md bg-[#EFECE6]" aria-hidden="true">
          {outcomes.map((outcome) => (
            <div key={outcome.label} className={outcome.color} style={{ width: `${(outcome.count / total) * 100}%` }} />
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {outcomes.map(({ label, count, color, icon: Icon, description }) => (
            <li key={label} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-[#524E48]">
                <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
                <Icon className="h-3.5 w-3.5 text-[#787571]" />
                <span><strong className="font-semibold text-[#161514]">{label}:</strong> {description}</span>
              </span>
              <span className="font-semibold tabular-nums text-[#161514]">{count}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-2xl border border-[#E5E0D8] bg-white p-4 sm:p-5">
        <h3 className="text-base font-display font-bold text-[#161514]">Who is active here?</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#787571]">These are people found in the pull requests we checked. Counts are a signal of activity, not a ranking of contributors.</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#EAA036]/10 p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#9E6212]"><Shield className="h-3.5 w-3.5" /> Maintainers</span>
            <p className="mt-2 text-2xl font-display font-bold text-[#161514]">{metrics.maintainersCount}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#787571]">People identified as reviewing or managing contributions.</p>
          </div>
          <div className="rounded-xl bg-[#F7F5F0] p-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[#524E48]"><Users className="h-3.5 w-3.5" /> Contributors</span>
            <p className="mt-2 text-2xl font-display font-bold text-[#161514]">{metrics.contributorsCount}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#787571]">Other people who opened pull requests in this period.</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 border-t border-[#E5E0D8] pt-3 text-xs text-[#524E48]">
          <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#EAA036]" />
          <p><strong className="text-[#161514]">Review pace:</strong> {formatTurnaround(metrics.avgMergeTimeHours)} from opening a pull request to merging it.</p>
        </div>
      </article>
    </section>
  );
};
