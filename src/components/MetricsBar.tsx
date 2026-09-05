import React from 'react';
import { GitPullRequest, GitMerge, Clock, Shield, Users, RotateCw } from 'lucide-react';
import type { RepoMetrics } from '../types';

interface MetricsBarProps {
  metrics: RepoMetrics;
  fullName: string;
  isCached?: boolean;
  cachedAt?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const formatReviewTime = (hours: number | null) => {
  if (hours === null) return 'Not enough data';
  if (hours < 1) return 'Under 1 hour';
  if (hours < 24) return `${Math.round(hours)} hours`;
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

const formatCachedAge = (timestamp?: number) => {
  if (!timestamp) return 'just now';
  const minutes = Math.max(Math.round((Date.now() - timestamp) / 60000), 0);
  if (minutes < 1) return 'just now';
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
};

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  fullName,
  isCached,
  cachedAt,
  onRefresh,
  isRefreshing,
}) => {
  const totalContributors = metrics.allTimeContributorsCount || metrics.contributorsCount;
  const reviewMessage = metrics.avgMergeTimeHours === null
    ? 'There are not enough merged contributions in this period to estimate review time.'
    : metrics.avgMergeTimeHours <= 72
      ? 'Recent merged contributions were reviewed within a few days.'
      : 'Recent merged contributions took more time to review, so plan for a slower response.';

  return (
    <section className="w-full my-4 sm:my-6" aria-labelledby="project-overview-title">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4">
        <div>
          <p className="text-xs font-medium text-[#787571]">Project overview</p>
          <h2 id="project-overview-title" className="mt-0.5 text-xl sm:text-2xl font-display font-bold tracking-tight text-[#161514] break-all">
            <a href={`https://github.com/${fullName}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#9E6212] hover:underline">
              {fullName}
            </a>
          </h2>
        </div>
        <p className="text-xs text-[#787571]">Based on {metrics.totalPRs} pull requests and {totalContributors} known contributors.</p>
      </div>

      {isCached && (
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#EFECE6] px-3 py-2 text-xs text-[#524E48]">
          <p>Showing a saved result from {formatCachedAge(cachedAt)} so repeated checks stay fast.</p>
          {onRefresh && (
            <button type="button" onClick={onRefresh} disabled={isRefreshing} className="inline-flex items-center gap-1 font-semibold text-[#9E6212] hover:underline disabled:opacity-50">
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Checking for updates…' : 'Get latest activity'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 border border-[#E5E0D8] rounded-2xl overflow-hidden bg-white">
        <Metric icon={GitPullRequest} label="Recent contributions" value={metrics.totalPRs} detail={`${metrics.openCount} still open`} />
        <Metric icon={GitMerge} label="Contributions merged" value={`${metrics.mergeRatePct}%`} detail="of the pull requests checked" tone="emerald" />
        <Metric icon={Clock} label="Typical review time" value={formatReviewTime(metrics.avgMergeTimeHours)} detail="from opening to merging" />
        <Metric icon={Shield} label="People reviewing" value={metrics.maintainersCount} detail="maintainers found in this activity" tone="amber" />
        <Metric icon={Users} label="Other active people" value={metrics.contributorsCount} detail={`${totalContributors} known across the project`} />
      </div>

      <div className="mt-3 rounded-2xl bg-[#161514] px-4 py-4 sm:px-5 text-[#F7F5F0]">
        <p className="text-sm font-semibold">What this may mean for you</p>
        <p className="mt-1 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#D5D0C7]">
          {metrics.mergeRatePct >= 60
            ? 'A good share of the contributions in this period were merged. That can be a positive sign, but read recent pull requests before choosing an issue.'
            : 'Fewer contributions were merged in this period. Look through recent pull requests to understand the project’s expectations before you invest time.'}{' '}
          {reviewMessage}
        </p>
      </div>
    </section>
  );
};

function Metric({ icon: Icon, label, value, detail, tone = 'default' }: {
  icon: typeof GitPullRequest;
  label: string;
  value: string | number;
  detail: string;
  tone?: 'default' | 'emerald' | 'amber';
}) {
  const colors = { default: 'text-[#161514]', emerald: 'text-emerald-700', amber: 'text-[#9E6212]' };

  return (
    <div className="min-h-[132px] border-b border-[#E5E0D8] p-4 last:border-b-0 lg:border-b-0 lg:border-l first:border-l-0">
      <div className="flex items-center gap-2 text-xs font-medium text-[#65615B]">
        <Icon className={`h-4 w-4 ${colors[tone]}`} />
        <span>{label}</span>
      </div>
      <p className={`mt-3 text-xl sm:text-2xl font-display font-bold tracking-tight ${colors[tone]}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-[#787571]">{detail}</p>
    </div>
  );
}
