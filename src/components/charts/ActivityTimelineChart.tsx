import React, { useState, useMemo } from 'react';
import { parseISO, format, differenceInDays, min, max } from 'date-fns';
import { GitPullRequest, GitMerge, TrendingUp } from 'lucide-react';
import type { PullRequest, TimeFilter } from '../../types';

interface ActivityTimelineChartProps {
  pullRequests: PullRequest[];
  timeFilter: TimeFilter;
}

interface Bucket {
  label: string;
  total: number;
  merged: number;
  open: number;
  closed: number;
}

export const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ pullRequests }) => {
  const [activeBucketIndex, setActiveBucketIndex] = useState<number | null>(null);

  const buckets: Bucket[] = useMemo(() => {
    if (pullRequests.length === 0) return [];

    const dates = pullRequests.map((pr) => parseISO(pr.created_at));
    const earliest = min(dates);
    const latest = max(dates);
    const daySpan = Math.max(differenceInDays(latest, earliest), 1);

    // Dynamic bucket count (between 6 and 12 buckets)
    const bucketCount = Math.min(Math.max(Math.floor(daySpan / 3), 6), 12);
    const intervalMs = (latest.getTime() - earliest.getTime()) / bucketCount;

    const bList: Bucket[] = Array.from({ length: bucketCount }, (_, i) => {
      const startMs = earliest.getTime() + i * intervalMs;
      const endMs = startMs + intervalMs;
      const startD = new Date(startMs);
      const endD = new Date(endMs);

      return {
        label: `${format(startD, 'MMM d')} - ${format(endD, 'MMM d')}`,
        total: 0,
        merged: 0,
        open: 0,
        closed: 0,
      };
    });

    for (const pr of pullRequests) {
      const prTime = parseISO(pr.created_at).getTime();
      let index = Math.floor((prTime - earliest.getTime()) / intervalMs);
      if (index >= bucketCount) index = bucketCount - 1;
      if (index < 0) index = 0;

      bList[index].total++;
      if (pr.merged_at) {
        bList[index].merged++;
      } else if (pr.state === 'open') {
        bList[index].open++;
      } else {
        bList[index].closed++;
      }
    }

    return bList;
  }, [pullRequests]);

  const maxTotal = useMemo(() => {
    return Math.max(...buckets.map((b) => b.total), 1);
  }, [buckets]);

  if (buckets.length === 0) return null;

  const chartHeight = 130;
  const chartWidth = 600;
  const barWidth = Math.max((chartWidth / buckets.length) * 0.55, 12);
  const gap = chartWidth / buckets.length;

  const activeBucket = activeBucketIndex !== null ? buckets[activeBucketIndex] : null;

  return (
    <div
      className="p-5 rounded-2xl bg-white dark:bg-obsidian-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs"
      role="region"
      aria-label="Pull Request Activity Timeline"
    >
      {/* Chart Title & Quick Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-display font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>PR Influx & Merge Timeline</span>
          </h4>
          <p className="text-xs text-zinc-500 mt-0.5">
            Distribution of pull request submissions and merge resolutions over time.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Total PRs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-400" />
            <span className="text-zinc-600 dark:text-zinc-400">Merged</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-32 overflow-visible"
          role="img"
          aria-label={`Interactive chart showing ${pullRequests.length} pull requests across ${buckets.length} time intervals.`}
        >
          <defs>
            <linearGradient id="totalBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="mergedBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="0"
            y1={chartHeight - 20}
            x2={chartWidth}
            y2={chartHeight - 20}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={chartHeight / 2 - 10}
            x2={chartWidth}
            y2={chartHeight / 2 - 10}
            stroke="currentColor"
            className="text-zinc-100 dark:text-zinc-800/40"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Bars */}
          {buckets.map((b, i) => {
            const x = i * gap + (gap - barWidth) / 2;
            const availableHeight = chartHeight - 30;
            const barH = (b.total / maxTotal) * availableHeight;
            const y = chartHeight - 20 - barH;

            const mergedH = (b.merged / maxTotal) * availableHeight;
            const mergedY = chartHeight - 20 - mergedH;

            const isHovered = activeBucketIndex === i;

            return (
              <g
                key={b.label}
                tabIndex={0}
                role="button"
                aria-label={`${b.label}: ${b.total} PRs, ${b.merged} merged`}
                onMouseEnter={() => setActiveBucketIndex(i)}
                onMouseLeave={() => setActiveBucketIndex(null)}
                onFocus={() => setActiveBucketIndex(i)}
                onBlur={() => setActiveBucketIndex(null)}
                className="cursor-pointer focus:outline-none"
              >
                {/* Total PR background pillar */}
                <rect
                  x={x}
                  y={Math.max(y, 10)}
                  width={barWidth}
                  height={Math.max(barH, 2)}
                  rx="3"
                  fill="url(#totalBarGrad)"
                  className={`transition-all duration-150 ${
                    isHovered ? 'filter drop-shadow(0 0 6px rgba(99,102,241,0.5)) opacity-100' : 'opacity-85'
                  }`}
                />

                {/* Merged sub-bar */}
                {b.merged > 0 && (
                  <rect
                    x={x + 2}
                    y={Math.max(mergedY, 10)}
                    width={Math.max(barWidth - 4, 2)}
                    height={Math.max(mergedH, 2)}
                    rx="2"
                    fill="url(#mergedBarGrad)"
                    className="transition-all duration-150"
                  />
                )}

                {/* X Axis Label */}
                {(i === 0 || i === Math.floor(buckets.length / 2) || i === buckets.length - 1) && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 4}
                    textAnchor="middle"
                    className="text-[9px] fill-zinc-400 dark:fill-zinc-500 font-mono select-none"
                  >
                    {b.label.split(' - ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Callout */}
        {activeBucket && (
          <div className="mt-2.5 p-2 rounded-xl bg-zinc-900 dark:bg-obsidian-950 text-white border border-zinc-800 text-xs font-mono flex items-center justify-between gap-4 animate-fade-in">
            <span className="text-zinc-400 font-sans">{activeBucket.label}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-brand-400">
                <GitPullRequest className="w-3 h-3" />
                <strong>{activeBucket.total}</strong> PRs
              </span>
              <span className="flex items-center gap-1 text-violet-300">
                <GitMerge className="w-3 h-3" />
                <strong>{activeBucket.merged}</strong> merged
              </span>
              <span className="text-zinc-400">
                ({activeBucket.open} open, {activeBucket.closed} closed)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
