import React from 'react';
import { GitMerge, GitPullRequest, GitPullRequestClosed, Users, Shield, Clock } from 'lucide-react';
import type { RepoMetrics } from '../../types';

interface CompactChartsProps {
  metrics: RepoMetrics;
}

export const CompactCharts: React.FC<CompactChartsProps> = ({ metrics }) => {
  const {
    totalPRs,
    mergedCount,
    openCount,
    closedCount,
    maintainersCount,
    contributorsCount,
    allTimeContributorsCount,
    avgMergeTimeHours,
  } = metrics;

  // Safe percentage calculations for PR resolution
  const mergedPct = totalPRs > 0 ? Math.round((mergedCount / totalPRs) * 100) : 0;
  const openPct = totalPRs > 0 ? Math.round((openCount / totalPRs) * 100) : 0;
  const closedPct = totalPRs > 0 ? Math.max(100 - mergedPct - openPct, 0) : 0;

  // Donut chart SVG geometry (radius 40, circumference ~251.3)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const mergedStroke = (mergedPct / 100) * circumference;
  const openStroke = (openPct / 100) * circumference;
  const closedStroke = (closedPct / 100) * circumference;

  const mergedOffset = 0;
  const openOffset = -mergedStroke;
  const closedOffset = -(mergedStroke + openStroke);

  const totalPeople = (allTimeContributorsCount || (maintainersCount + contributorsCount));
  const maintainerRatio = totalPeople > 0 ? Math.min(Math.round((maintainersCount / totalPeople) * 100), 100) : 0;
  const applicantRatio = 100 - maintainerRatio;

  const formatTurnaround = (hours: number | null) => {
    if (hours === null) return 'N/A';
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${hours} hours`;
    return `${Math.round((hours / 24) * 10) / 10} days`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 sm:my-4">
      {/* Compact Card 1: PR Resolution Donut / Pie Chart */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]/60 text-xs">
          <span className="font-display font-bold text-[#161514] flex items-center gap-1.5">
            <GitMerge className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>PR Resolution Breakdown</span>
          </span>
          <span className="font-mono text-[11px] text-[#787571]">{totalPRs} analyzed</span>
        </div>

        <div className="flex items-center justify-between gap-4 py-2">
          {/* SVG Donut / Pie */}
          <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#EFECE6"
                strokeWidth="12"
              />
              {/* Merged segment */}
              {mergedPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeDasharray={`${mergedStroke} ${circumference}`}
                  strokeDashoffset={mergedOffset}
                  strokeLinecap="round"
                />
              )}
              {/* Open segment */}
              {openPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#EAA036"
                  strokeWidth="12"
                  strokeDasharray={`${openStroke} ${circumference}`}
                  strokeDashoffset={openOffset}
                  strokeLinecap="round"
                />
              )}
              {/* Closed segment */}
              {closedPct > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#A8A29E"
                  strokeWidth="12"
                  strokeDasharray={`${closedStroke} ${circumference}`}
                  strokeDashoffset={closedOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-display font-bold text-[#161514] leading-none">
                {mergedPct}%
              </span>
              <span className="text-[9px] font-mono text-[#787571] uppercase mt-0.5">Merged</span>
            </div>
          </div>

          {/* Compact Legend & Counts */}
          <div className="flex-1 space-y-1.5 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#161514]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Merged</span>
              </span>
              <span className="font-mono font-medium text-[#161514]">
                {mergedCount} <span className="text-[#787571] text-[11px]">({mergedPct}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#161514]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EAA036] flex-shrink-0" />
                <span>Open</span>
              </span>
              <span className="font-mono font-medium text-[#161514]">
                {openCount} <span className="text-[#787571] text-[11px]">({openPct}%)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#161514]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A8A29E] flex-shrink-0" />
                <span>Closed</span>
              </span>
              <span className="font-mono font-medium text-[#161514]">
                {closedCount} <span className="text-[#787571] text-[11px]">({closedPct}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Card 2: Community vs Maintainer Balance */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E5E0D8] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D8]/60 text-xs">
          <span className="font-display font-bold text-[#161514] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#EAA036] flex-shrink-0" />
            <span>Reviewers vs. Community</span>
          </span>
          <span className="font-mono text-[11px] text-[#787571]">
            {totalPeople} total people
          </span>
        </div>

        <div className="py-2 space-y-2">
          {/* Progress Bar comparing Core Maintainers to Applicants */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#9E6212] font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> {maintainersCount} Maintainers ({maintainerRatio}%)
              </span>
              <span className="text-[#524E48] flex items-center gap-1">
                <Users className="w-3 h-3 text-[#EAA036]" /> {contributorsCount} Contenders ({applicantRatio}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#EFECE6] overflow-hidden flex">
              <div
                style={{ width: `${maintainerRatio}%` }}
                className="h-full bg-[#9E6212] transition-all duration-500"
                title={`${maintainersCount} Maintainers`}
              />
              <div
                style={{ width: `${applicantRatio}%` }}
                className="h-full bg-[#EAA036] transition-all duration-500"
                title={`${contributorsCount} Contenders`}
              />
            </div>
          </div>

          {/* Turnaround Velocity Quick Callout */}
          <div className="pt-1.5 flex items-center justify-between text-xs text-[#524E48] font-mono border-t border-[#E5E0D8]/40">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#EAA036]" /> Avg Review Turnaround:
            </span>
            <span className="font-bold text-[#161514]">
              {formatTurnaround(avgMergeTimeHours)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
