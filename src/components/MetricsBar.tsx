import React, { useState } from 'react';
import { GitPullRequest, GitMerge, Clock, Shield, Users, HelpCircle, X, RotateCw } from 'lucide-react';
import type { RepoMetrics } from '../types';

interface MetricsBarProps {
  metrics: RepoMetrics;
  fullName: string;
  isCached?: boolean;
  cachedAt?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface TooltipData {
  title: string;
  formula: string;
  explanation: string;
  benchmark: string;
}

const METRIC_EXPLANATIONS: Record<string, TooltipData> = {
  prs: {
    title: 'Total Pull Requests Analyzed',
    formula: 'Count of PRs created in the selected timeframe',
    explanation: 'Represents the complete pull request stream audited for this repository, including open, merged, and closed PRs.',
    benchmark: 'Higher PR count provides greater statistical confidence in merge velocity.',
  },
  acceptance: {
    title: 'PR Acceptance (Merge Rate)',
    formula: '(Merged Pull Requests ÷ Total Pull Requests) × 100%',
    explanation: 'The percentage of submitted pull requests that successfully pass code review and get merged into the main codebase.',
    benchmark: 'Rates > 75% indicate high maintainer receptivity to external applicant proposals.',
  },
  turnaround: {
    title: 'Average Merge Turnaround Velocity',
    formula: 'Σ (Merged Timestamp − Created Timestamp) ÷ Count of Merged PRs',
    explanation: 'The true average latency between a contributor opening a PR and maintainers merging it.',
    benchmark: '< 24 hours is exceptionally responsive; > 7 days indicates slower review cycles.',
  },
  maintainers: {
    title: 'Core Maintainers & Reviewers',
    formula: 'PR author_association ∈ [OWNER, MEMBER, COLLABORATOR] + Merged_By Actors',
    explanation: 'Verified core project leaders with direct write, review, and merge privileges on this repository.',
    benchmark: 'Knowing core maintainers helps you target the right mentors during GSoC.',
  },
  applicants: {
    title: 'Community Contributors & Contenders',
    formula: 'Total Active Contributors − Core Maintainers',
    explanation: 'External developers and prospective applicants actively submitting PRs to this repository.',
    benchmark: 'Shows your competition density and community engagement level.',
  },
};

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  fullName,
  isCached,
  cachedAt,
  onRefresh,
  isRefreshing,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatAvgTime = (hours: number | null) => {
    if (hours === null) return 'N/A';
    if (hours < 1) return '< 1 hr';
    if (hours < 24) return `${hours} hrs`;
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} d`;
  };

  const formatCachedAge = (timestamp?: number) => {
    if (!timestamp) return 'recently';
    const diffMin = Math.max(Math.round((Date.now() - timestamp) / 60000), 0);
    if (diffMin === 0) return 'just now';
    if (diffMin === 1) return '1 min ago';
    return `${diffMin} mins ago`;
  };

  const totalContributorsDisplay = metrics.allTimeContributorsCount || metrics.contributorsCount;

  return (
    <div className="w-full my-3 sm:my-4 relative">
      {/* Target Repo Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        <h2 className="text-lg sm:text-xl font-display font-bold text-[#161514] flex items-center gap-2 flex-wrap">
          <span className="text-[#787571] font-mono text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded bg-white border border-[#E5E0D8]">
            Target
          </span>
          <a
            href={`https://github.com/${fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#9E6212] hover:underline transition-colors font-mono break-all"
          >
            {fullName}
          </a>
        </h2>
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#787571] font-mono flex-wrap">
          <span>{metrics.totalPRs} pull requests analyzed</span>
          <span>•</span>
          <span className="text-[#161514] font-semibold">{totalContributorsDisplay} total contributors</span>
        </div>
      </div>

      {/* Cache & Freshness Transparency Notice */}
      {isCached && (
        <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-[#F7F5F0] border border-[#E5E0D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-[#787571]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
            <span className="text-[#161514] font-semibold">Cached snapshot ({formatCachedAge(cachedAt)} • 10m TTL):</span>
            <span className="text-[#65615B]">PRs submitted seconds ago will appear after the 10m cache window.</span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-[#9E6212] hover:text-[#7C4A0A] font-semibold font-sans hover:underline flex-shrink-0 cursor-pointer disabled:opacity-50"
              title="Bypass 10m cache and fetch live data directly from GitHub API"
            >
              <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Fetching live...' : 'Refresh live'}</span>
            </button>
          )}
        </div>
      )}

      {/* Grid of 5 Architectural Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total PRs */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs hover:border-[#EAA036] transition-all relative group">
          <div className="flex items-center justify-between text-xs text-[#65615B] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <GitPullRequest className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              <span className="truncate">Total PRs</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'prs' ? null : 'prs')}
              className="text-[#A8A29E] hover:text-[#161514] p-0.5 transition-colors"
              aria-label="Explain Total PRs calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
            {metrics.totalPRs}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#787571] mt-1 flex gap-1.5 sm:gap-2 font-mono flex-wrap">
            <span className="text-[#9E6212] font-medium">{metrics.openCount} open</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">{metrics.mergedCount} mrg</span>
          </div>
        </div>

        {/* Merge Rate */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs hover:border-[#EAA036] transition-all relative group">
          <div className="flex items-center justify-between text-xs text-[#65615B] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <GitMerge className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Acceptance</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'acceptance' ? null : 'acceptance')}
              className="text-[#A8A29E] hover:text-[#161514] p-0.5 transition-colors"
              aria-label="Explain Acceptance rate calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
            {metrics.mergeRatePct}%
          </div>
          <div className="w-full bg-[#EFECE6] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#EAA036] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.mergeRatePct, 100)}%` }}
            />
          </div>
        </div>

        {/* Average Merge Speed */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs hover:border-[#EAA036] transition-all relative group">
          <div className="flex items-center justify-between text-xs text-[#65615B] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              <span className="truncate">Turnaround</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'turnaround' ? null : 'turnaround')}
              className="text-[#A8A29E] hover:text-[#161514] p-0.5 transition-colors"
              aria-label="Explain Turnaround velocity calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
            {formatAvgTime(metrics.avgMergeTimeHours)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#787571] mt-1 font-mono">Avg merge time</div>
        </div>

        {/* Maintainers */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs hover:border-[#EAA036] transition-all relative group">
          <div className="flex items-center justify-between text-xs text-[#65615B] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <Shield className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
              <span className="truncate">Maintainers</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'maintainers' ? null : 'maintainers')}
              className="text-[#A8A29E] hover:text-[#161514] p-0.5 transition-colors"
              aria-label="Explain Maintainers calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-[#9E6212]">
            {metrics.maintainersCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#787571] mt-1 font-mono">Active reviewers</div>
        </div>

        {/* External Contributors / Applicants */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs col-span-2 sm:col-span-2 lg:col-span-1 hover:border-[#EAA036] transition-all relative group">
          <div className="flex items-center justify-between text-xs text-[#65615B] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <Users className="w-3.5 h-3.5 text-[#161514] flex-shrink-0" />
              <span className="truncate">Contributors</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(activeTooltip === 'applicants' ? null : 'applicants')}
              className="text-[#A8A29E] hover:text-[#161514] p-0.5 transition-colors"
              aria-label="Explain Contributors calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-[#161514]">
            {metrics.contributorsCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#787571] mt-1 font-mono">
            {metrics.allTimeContributorsCount ? `${metrics.allTimeContributorsCount} all-time` : 'Community active'}
          </div>
        </div>
      </div>

      {/* Floating Formula & Calculation Explainer Modal */}
      {activeTooltip && METRIC_EXPLANATIONS[activeTooltip] && (
        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#EAA036]/50 shadow-md text-xs font-sans animate-fade-in relative">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#EAA036]/15 text-[#9E6212]">
                Formula & Math
              </span>
              <h4 className="font-bold text-[#161514] text-xs sm:text-sm">
                {METRIC_EXPLANATIONS[activeTooltip].title}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(null)}
              className="p-1 rounded text-[#787571] hover:text-[#161514]"
              aria-label="Close formula tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[#524E48]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#787571] block">Exact Calculation:</span>
              <code className="text-[11px] font-mono font-bold text-[#161514] bg-[#F7F5F0] px-2 py-1 rounded block mt-0.5 border border-[#E5E0D8]">
                {METRIC_EXPLANATIONS[activeTooltip].formula}
              </code>
            </div>
            <p className="text-xs leading-relaxed pt-1">
              {METRIC_EXPLANATIONS[activeTooltip].explanation}
            </p>
            <p className="text-[11px] text-[#9E6212] font-medium pt-0.5">
              Target Benchmark: {METRIC_EXPLANATIONS[activeTooltip].benchmark}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

