import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Clock3, GitMerge, GitPullRequest, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DateRange, DeepFileAnalytics, RepoStats, TimeFilter } from '../types';
import { buildAIInput, buildDeepAnalyticsSummary } from '../services/analytics';
import { fetchDeepFileAnalytics } from '../services/github';
import { AIInsightsPanel } from './AIInsightsPanel';

interface DeepAnalyticsReportProps {
  stats: RepoStats;
  timeFilter: TimeFilter;
  dateRange: DateRange;
  onBack: () => void;
  hasPersonalToken: boolean;
  onOpenTokenModal: () => void;
}

const PRESET_LABELS: Record<Exclude<TimeFilter, 'custom'>, string> = {
  '2w': 'Last 2 weeks',
  '1m': 'Last month',
  '3m': 'Last 3 months',
  '6m': 'Last 6 months',
  all: 'All available history',
};

export const DeepAnalyticsReport: React.FC<DeepAnalyticsReportProps> = ({ stats, timeFilter, dateRange, onBack, hasPersonalToken, onOpenTokenModal }) => {
  const summary = useMemo(() => buildDeepAnalyticsSummary(stats.recentPRs), [stats.recentPRs]);
  const scopeLabel = getScopeLabel(timeFilter, dateRange);
  const [fileAnalytics, setFileAnalytics] = useState<DeepFileAnalytics | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState('');

  useEffect(() => {
    if (!hasPersonalToken || fileAnalytics || fileLoading) return;
    setFileLoading(true);
    fetchDeepFileAnalytics(stats.owner, stats.repo, stats.recentPRs, setFileProgress)
      .then(setFileAnalytics)
      .catch((error) => setFileError(error instanceof Error ? error.message : 'Changed-file analysis could not be loaded.'))
      .finally(() => setFileLoading(false));
  }, [fileAnalytics, fileLoading, hasPersonalToken, stats.owner, stats.repo, stats.recentPRs]);

  const evidence = useMemo(() => buildAIInput(stats.recentPRs, summary, fileAnalytics?.files || []), [stats.recentPRs, summary, fileAnalytics]);

  return (
    <section className="space-y-4 sm:space-y-6 animate-fade-in" aria-labelledby="deep-report-title">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-semibold text-[#65615B] hover:text-[#9E6212]"><ArrowLeft className="h-3.5 w-3.5" /> Back to repository overview</button>

      <header className="rounded-3xl border border-[#E5E0D8] bg-white p-5 shadow-xs sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#787571]">Deep analytics report</p>
            <h1 id="deep-report-title" className="mt-1 text-2xl font-display font-bold tracking-tight text-[#161514] sm:text-4xl">{stats.fullName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#524E48]">A timeline-scoped report of pull-request throughput, maintainer activity, and repository focus areas.</p>
          </div>
          <div className="rounded-2xl border border-[#EAA036]/35 bg-[#FFF9EF] px-3 py-2 text-right"><p className="text-[10px] font-medium uppercase tracking-wide text-[#9E6212]">Analysis window</p><p className="mt-1 text-xs font-semibold text-[#161514]">{scopeLabel}</p><p className="mt-1 text-[10px] text-[#787571]">{summary.totalPRs.toLocaleString()} PRs in evidence</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-mono text-[#787571]"><span className="rounded-full bg-[#EFECE6] px-2.5 py-1">All metrics below use this window</span><span className="rounded-full bg-[#EFECE6] px-2.5 py-1">Cached GitHub evidence: {stats.isCached ? 'yes' : 'no'}</span>{stats.metrics.totalRepositoryPRs && stats.metrics.totalRepositoryPRs > summary.totalPRs && <span className="rounded-full bg-[#FFF9EF] px-2.5 py-1 text-[#9E6212]">Repository total exceeds fetched window</span>}</div>
      </header>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Deep analytics summary">
        <ReportMetric icon={Clock3} label="Average merge time" value={formatHours(summary.averageMergeTimeHours)} detail="opened → merged" />
        <ReportMetric icon={TrendingUp} label="Median merge time" value={formatHours(summary.medianMergeTimeHours)} detail="50th percentile" />
        <ReportMetric icon={Clock3} label="75% merge time" value={formatHours(summary.p75MergeTimeHours)} detail="three out of four are faster" />
        <ReportMetric icon={GitPullRequest} label="Oldest open PR" value={formatHours(summary.oldestOpenPRHours)} detail="age at report time" />
      </section>

      <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-[#EAA036]/15 p-2 text-[#9E6212]"><BarChart3 className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514] sm:text-lg">What happened in {scopeLabel}</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">These are calculations, not model guesses. For example, a 10-hour value means the average or percentile was calculated from the PRs loaded inside this exact window.</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4"><MiniStat icon={GitPullRequest} label="Total PRs" value={summary.totalPRs} /><MiniStat icon={GitMerge} label="Merged" value={summary.mergedPRs} /><MiniStat icon={ShieldCheck} label="Maintainer authored" value={`${summary.maintainerAuthoredPct}%`} /><MiniStat icon={Users} label="Active days" value={summary.activeDays} /></div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopicCandidates topics={summary.topicCandidates} limit={getFocusLimit(summary.totalPRs)} />
        <MaintainerActivity items={summary.topMaintainerActivity} />
      </section>

      <ChangedFilesSection analytics={fileAnalytics} loading={fileLoading} progress={fileProgress} error={fileError} hasPersonalToken={hasPersonalToken} onOpenTokenModal={onOpenTokenModal} />

      <AIInsightsPanel evidence={evidence} />
    </section>
  );
};

function ChangedFilesSection({ analytics, loading, progress, error, hasPersonalToken, onOpenTokenModal }: { analytics: DeepFileAnalytics | null; loading: boolean; progress: string; error: string | null; hasPersonalToken: boolean; onOpenTokenModal: () => void }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-display font-bold text-[#161514]">Changed-file focus</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#787571]">Exact files touched by merged PRs in this report. Maintainer-associated activity is counted separately from community activity.</p></div>{analytics?.isPartial && <span className="rounded-full bg-[#FFF9EF] px-2.5 py-1 text-[10px] font-mono text-[#9E6212]">Top 25 merged PRs scanned</span>}</div>{!hasPersonalToken && <div className="mt-4 rounded-xl border border-[#EAA036]/35 bg-[#FFF9EF] px-3 py-2 text-xs text-[#65615B]">Connect a GitHub PAT to scan changed-file metadata without exhausting the public request limit. <button type="button" onClick={onOpenTokenModal} className="font-semibold text-[#9E6212] hover:underline">Add PAT</button></div>}{loading && <p className="mt-4 text-xs font-mono text-[#9E6212]">{progress || 'Reading changed files…'}</p>}{error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">{error}</p>}{analytics && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#F7F5F0] text-[10px] uppercase tracking-wide text-[#787571]"><tr><th className="rounded-l-lg px-3 py-2">File</th><th className="px-3 py-2">Merged PRs</th><th className="px-3 py-2">Maintainer-associated</th><th className="px-3 py-2">+ / − lines</th><th className="rounded-r-lg px-3 py-2">Evidence</th></tr></thead><tbody className="divide-y divide-[#E5E0D8]">{analytics.files.slice(0, 15).map((file) => <tr key={file.path} className="hover:bg-[#F7F5F0]"><td className="max-w-[280px] truncate px-3 py-2.5 font-mono text-[11px] text-[#161514]">{file.path}</td><td className="px-3 py-2.5 font-mono text-[#65615B]">{file.mergedPRs}</td><td className="px-3 py-2.5 font-mono text-[#9E6212]">{file.maintainerMergedPRs}</td><td className="px-3 py-2.5 font-mono text-[#65615B]">+{file.additions} / −{file.deletions}</td><td className="px-3 py-2.5 font-mono text-[10px] text-[#787571]">#{file.prNumbers.slice(0, 4).join(', #')}</td></tr>)}</tbody></table>{!analytics.files.length && <p className="py-5 text-xs text-[#787571]">No changed-file metadata was returned for the scanned merged PRs.</p>}</div>}</section>;
}

function TopicCandidates({ topics, limit }: { topics: ReturnType<typeof buildDeepAnalyticsSummary>['topicCandidates']; limit: number }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><h2 className="text-base font-display font-bold text-[#161514]">Repository focus candidates</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">Showing the top {limit} recurring focus areas for this PR volume. Repeated labels and meaningful title terms are ranked by merged mentions first.</p><div className="mt-4 space-y-2">{topics.slice(0, limit).map((topic) => <div key={topic.topic} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F5F0] px-3 py-2"><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#161514]">{topic.topic}</p><p className="mt-0.5 text-[10px] font-mono text-[#787571]">PRs {topic.prNumbers.join(', ')}</p></div><span className="flex-shrink-0 text-[10px] font-mono text-[#9E6212]">{topic.mergedMentions}/{topic.mentions} merged</span></div>)}{!topics.length && <p className="py-5 text-xs text-[#787571]">No repeated labels or terms were found in this window.</p>}</div></section>;
}

function MaintainerActivity({ items }: { items: ReturnType<typeof buildDeepAnalyticsSummary>['topMaintainerActivity'] }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><h2 className="text-base font-display font-bold text-[#161514]">Maintainer activity</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">People identified by GitHub as owner, member, or collaborator in the selected evidence.</p><div className="mt-4 space-y-2">{items.map((item) => <div key={item.username} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F5F0] px-3 py-2"><span className="truncate font-mono text-xs text-[#161514]">{item.username}</span><span className="flex-shrink-0 text-[10px] font-mono text-[#787571]">{item.mergedPRs} merged / {item.totalPRs} PRs</span></div>)}{!items.length && <p className="py-5 text-xs text-[#787571]">No maintainer-authored PRs were identified in this window.</p>}</div></section>;
}

function ReportMetric({ icon: Icon, label, value, detail }: { icon: typeof Clock3; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-[#E5E0D8] bg-white p-3 shadow-xs sm:p-4"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#787571]"><Icon className="h-3.5 w-3.5 text-[#EAA036]" /> {label}</div><p className="mt-2 text-xl font-display font-bold text-[#161514] sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-[#787571]">{detail}</p></div>; }
function MiniStat({ icon: Icon, label, value }: { icon: typeof GitPullRequest; label: string; value: number | string }) { return <div className="rounded-xl bg-[#F7F5F0] p-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#787571]"><Icon className="h-3.5 w-3.5 text-[#9E6212]" /> {label}</div><p className="mt-2 text-lg font-display font-bold text-[#161514]">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>; }
function formatHours(hours: number | null) { if (hours === null) return 'No data'; if (hours < 24) return `${hours}h`; return `${Math.round((hours / 24) * 10) / 10}d`; }
function getScopeLabel(filter: TimeFilter, range: DateRange) { if (filter === 'custom' && range.from && range.to) return `${format(parseISO(`${range.from}T00:00:00`), 'MMM d, yyyy')} – ${format(parseISO(`${range.to}T00:00:00`), 'MMM d, yyyy')}`; return PRESET_LABELS[filter === 'custom' ? '1m' : filter]; }
function getFocusLimit(totalPRs: number) { if (totalPRs < 20) return 3; if (totalPRs < 100) return 6; return 10; }
