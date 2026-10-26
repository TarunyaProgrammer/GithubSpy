import React, { useMemo } from 'react';
import { ArrowLeft, Clock3, GitMerge, GitPullRequest, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import type { RepoStats, TimeFilter, DateRange } from '../types';
import { buildDeepAnalyticsSummary } from '../services/analytics';
import { format, parseISO } from 'date-fns';

interface OrganizationComparisonProps {
  stats: RepoStats[];
  timeFilter: TimeFilter;
  dateRange: DateRange;
  onBack: () => void;
  onOpenRepository: (fullName: string) => void;
}

export const OrganizationComparison: React.FC<OrganizationComparisonProps> = ({ stats, timeFilter, dateRange, onBack, onOpenRepository }) => {
  const rows = useMemo(() => stats.map((repo) => {
    const summary = buildDeepAnalyticsSummary(repo.recentPRs);
    const score = opportunityScore(summary);
    return { repo, summary, score };
  }).sort((a, b) => b.score - a.score), [stats]);
  const scope = getScopeLabel(timeFilter, dateRange);

  return <section className="space-y-4 sm:space-y-6 animate-fade-in" aria-labelledby="comparison-title">
    <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-[#65615B] hover:text-[#9E6212]"><ArrowLeft className="h-3.5 w-3.5" /> Back to organization</button>
    <header className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-xs sm:p-7"><p className="text-xs font-medium text-[#787571]">Organization comparison</p><h1 id="comparison-title" className="mt-1 text-2xl font-display font-bold tracking-tight text-[#161514] sm:text-4xl">Contribution opportunity map</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#524E48]">A transparent comparison of the selected repositories for <strong>{scope}</strong>. The score is a heuristic, not a universal ranking.</p><div className="mt-4 flex flex-wrap gap-2 text-[10px] font-mono text-[#787571]"><span className="rounded-full bg-[#EFECE6] px-2.5 py-1">{rows.length} repositories compared</span><span className="rounded-full bg-[#EFECE6] px-2.5 py-1">Same timeline and evidence rules</span></div></header>

    <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[1320px] text-left text-xs"><thead className="bg-[#F7F5F0] text-[10px] uppercase tracking-wide text-[#787571]"><tr><th className="rounded-l-lg px-3 py-2">Repository</th><th className="px-3 py-2">Opportunity</th><th className="px-3 py-2">Merge rate</th><th className="px-3 py-2">Median merge</th><th className="px-3 py-2">Newcomer proxy</th><th className="px-3 py-2">Trend</th><th className="px-3 py-2">Backlog</th><th className="px-3 py-2">PR volume</th><th className="px-3 py-2">Focus topic</th><th className="px-3 py-2">Author concentration</th><th className="rounded-r-lg px-3 py-2">Merger concentration</th></tr></thead><tbody className="divide-y divide-[#E5E0D8]">{rows.map(({ repo, summary, score }) => <tr key={repo.fullName} className="hover:bg-[#F7F5F0]"><td className="px-3 py-3"><button type="button" onClick={() => onOpenRepository(repo.fullName)} className="font-mono font-semibold text-[#161514] hover:text-[#9E6212] hover:underline">{repo.fullName}</button><p className="mt-0.5 text-[10px] text-[#787571]">{repo.isCached ? 'cached evidence' : 'fresh evidence'}</p></td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 font-mono text-[10px] ${score >= 70 ? 'bg-emerald-50 text-emerald-800' : score >= 45 ? 'bg-[#FFF9EF] text-[#9E6212]' : 'bg-rose-50 text-rose-800'}`}>{score}/100</span></td><td className="px-3 py-3 font-mono">{summary.totalPRs ? `${Math.round((summary.mergedPRs / summary.totalPRs) * 100)}%` : '—'}</td><td className="px-3 py-3 font-mono">{formatHours(summary.medianMergeTimeHours)}</td><td className="px-3 py-3 font-mono">{formatPercent(summary.contributorConversion.authorsWithMergedPR, summary.contributorConversion.uniqueAuthors)}</td><td className={`px-3 py-3 font-mono ${activityTrend(summary) === 'rising' ? 'text-emerald-700' : activityTrend(summary) === 'falling' ? 'text-rose-700' : 'text-[#787571]'}`}><span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" />{activityTrend(summary)}</span></td><td className="px-3 py-3 font-mono">{summary.openPRs}</td><td className="px-3 py-3 font-mono">{summary.totalPRs}</td><td className="max-w-32 truncate px-3 py-3 font-mono">{summary.topicOutcomeMatrix[0]?.topic || '—'}</td><td className="px-3 py-3 font-mono">{mergedAuthorConcentration(summary)}%</td><td className="px-3 py-3 font-mono">{mergerConcentration(summary)}%</td></tr>)}</tbody></table></div><p className="mt-4 text-[10px] leading-relaxed text-[#787571]">Review-event timing is intentionally deferred to each repository’s deep report so organization comparison does not silently trigger review requests across every repository. “Newcomer proxy” is selected-window evidence, not lifetime contributor retention. Focus topic and concentrations are deterministic signals from the same selected window.</p></section>

    <section className="grid grid-cols-2 gap-2 lg:grid-cols-4"><ComparisonNote icon={GitMerge} label="Acceptance" text="Merge rate rewards repositories that turn contribution attempts into merged work." /><ComparisonNote icon={Clock3} label="Throughput" text="Median merge time penalizes slow feedback without being distorted by outliers." /><ComparisonNote icon={Users} label="Access" text="Contributor volume and maintainer share are used as signals of participation breadth." /><ComparisonNote icon={ShieldCheck} label="Interpretation" text="Always inspect topics and files before choosing a repository." /></section>
  </section>;
};

function opportunityScore(summary: ReturnType<typeof buildDeepAnalyticsSummary>) {
  const mergeRate = summary.totalPRs ? (summary.mergedPRs / summary.totalPRs) * 45 : 0;
  const activity = Math.min(summary.totalPRs / 50, 1) * 20;
  const breadth = Math.min(summary.contributorConversion.uniqueAuthors / 12, 1) * 15;
  const newcomer = summary.contributorConversion.uniqueAuthors ? (summary.contributorConversion.authorsWithMergedPR / summary.contributorConversion.uniqueAuthors) * 20 : 0;
  const backlogPenalty = summary.totalPRs ? Math.min(summary.openPRs / summary.totalPRs, 1) * 20 : 0;
  return Math.max(0, Math.min(100, Math.round(mergeRate + activity + breadth + newcomer - backlogPenalty)));
}

function activityTrend(summary: ReturnType<typeof buildDeepAnalyticsSummary>): 'rising' | 'stable' | 'falling' {
  const timeline = summary.activityTimeline;
  if (timeline.length < 2) return 'stable';
  const midpoint = Math.max(1, Math.floor(timeline.length / 2));
  const earlier = timeline.slice(0, midpoint).reduce((sum, item) => sum + item.opened, 0);
  const recent = timeline.slice(midpoint).reduce((sum, item) => sum + item.opened, 0);
  return recent > earlier * 1.2 ? 'rising' : recent * 1.2 < earlier ? 'falling' : 'stable';
}

function mergedAuthorConcentration(summary: ReturnType<typeof buildDeepAnalyticsSummary>): number {
  if (!summary.mergedPRs) return 0;
  const top = summary.topMaintainerActivity.reduce((sum, item) => sum + item.mergedPRs, 0);
  return Math.round((top / summary.mergedPRs) * 100);
}

function mergerConcentration(summary: ReturnType<typeof buildDeepAnalyticsSummary>): number {
  if (!summary.mergedPRs) return 0;
  const topThree = summary.topMergerActivity.slice(0, 3).reduce((sum, item) => sum + item.mergedPRs, 0);
  return Math.round((topThree / summary.mergedPRs) * 100);
}

function formatPercent(value: number, total: number): string { return total ? `${Math.round((value / total) * 100)}%` : '—'; }

function ComparisonNote({ icon: Icon, label, text }: { icon: typeof GitMerge; label: string; text: string }) { return <article className="rounded-2xl border border-[#E5E0D8] bg-white p-3 shadow-xs"><Icon className="h-4 w-4 text-[#EAA036]" /><p className="mt-2 text-xs font-semibold text-[#161514]">{label}</p><p className="mt-1 text-[10px] leading-relaxed text-[#787571]">{text}</p></article>; }
function formatHours(hours: number | null) { if (hours === null) return '—'; if (hours < 24) return `${Math.round(hours * 10) / 10}h`; return `${Math.round((hours / 24) * 10) / 10}d`; }
function getScopeLabel(filter: TimeFilter, range: DateRange) { if (filter === 'custom' && range.from && range.to) return `${format(parseISO(`${range.from}T00:00:00`), 'MMM d, yyyy')} – ${format(parseISO(`${range.to}T00:00:00`), 'MMM d, yyyy')}`; return ({ '2w': 'Last 2 weeks', '1m': 'Last month', '3m': 'Last 3 months', '6m': 'Last 6 months', all: 'All available history', custom: 'Selected period' } as Record<TimeFilter, string>)[filter]; }
