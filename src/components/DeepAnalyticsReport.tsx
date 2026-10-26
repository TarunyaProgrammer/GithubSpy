import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BarChart3, Clock3, Compass, FolderTree, GitMerge, GitPullRequest, Gauge, ShieldCheck, Target, Users, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { DateRange, DeepFileAnalytics, DirectoryFocusStat, RepoStats, RoleFilter, TimeFilter } from '../types';
import { buildAIInput, buildDeepAnalyticsSummary } from '../services/analytics';
import { fetchDeepFileAnalytics, fetchDeepReviewAnalytics } from '../services/github';
import { AIInsightsPanel } from './AIInsightsPanel';
import { DeepAnalyticsCharts } from './DeepAnalyticsCharts';

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
  const scopeLabel = getScopeLabel(timeFilter, dateRange);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [reviewerFilter, setReviewerFilter] = useState('all');
  const [fileAnalytics, setFileAnalytics] = useState<DeepFileAnalytics | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState('');
  const [reviewAnalytics, setReviewAnalytics] = useState<import('../types').DeepReviewAnalytics | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewProgress, setReviewProgress] = useState('');

  const labels = useMemo(() => Array.from(new Set(stats.recentPRs.flatMap((pr) => pr.labels || []))).sort((a, b) => a.localeCompare(b)), [stats.recentPRs]);
  const reviewers = reviewAnalytics?.topReviewers.map((reviewer) => reviewer.username) || [];
  const filteredPRs = useMemo(() => stats.recentPRs.filter((pr) => {
    const maintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '');
    const roleMatches = roleFilter === 'all' || (roleFilter === 'maintainers_only' ? maintainer : !maintainer);
    const labelMatches = labelFilter === 'all' || (pr.labels || []).includes(labelFilter);
    const reviewerMatches = reviewerFilter === 'all' || Boolean(reviewAnalytics?.rows.find((row) => row.prNumber === pr.number)?.reviewerLogins.includes(reviewerFilter));
    return roleMatches && labelMatches && reviewerMatches;
  }), [labelFilter, reviewerFilter, reviewAnalytics, roleFilter, stats.recentPRs]);
  const summary = useMemo(() => buildDeepAnalyticsSummary(filteredPRs), [filteredPRs]);

  useEffect(() => {
    if (!hasPersonalToken || fileAnalytics || fileLoading) return;
    setFileLoading(true);
    fetchDeepFileAnalytics(stats.owner, stats.repo, stats.recentPRs, setFileProgress)
      .then(setFileAnalytics)
      .catch((error) => setFileError(error instanceof Error ? error.message : 'Changed-file analysis could not be loaded.'))
      .finally(() => setFileLoading(false));
  }, [fileAnalytics, fileLoading, hasPersonalToken, stats.owner, stats.repo, stats.recentPRs]);

  useEffect(() => {
    if (!hasPersonalToken || reviewAnalytics || reviewLoading) return;
    setReviewLoading(true);
    fetchDeepReviewAnalytics(stats.owner, stats.repo, stats.recentPRs, setReviewProgress)
      .then(setReviewAnalytics)
      .catch((error) => setReviewError(error instanceof Error ? error.message : 'Review analytics could not be loaded.'))
      .finally(() => setReviewLoading(false));
  }, [hasPersonalToken, reviewAnalytics, reviewLoading, stats.owner, stats.repo, stats.recentPRs]);

  const evidence = useMemo(() => buildAIInput(filteredPRs, summary, fileAnalytics?.files || [], fileAnalytics?.directories || [], reviewAnalytics), [filteredPRs, summary, fileAnalytics, reviewAnalytics]);

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
        <EvidenceFilters roleFilter={roleFilter} labelFilter={labelFilter} reviewerFilter={reviewerFilter} labels={labels} reviewers={reviewers} onRoleChange={setRoleFilter} onLabelChange={setLabelFilter} onReviewerChange={setReviewerFilter} onClear={() => { setRoleFilter('all'); setLabelFilter('all'); setReviewerFilter('all'); }} filteredCount={filteredPRs.length} totalCount={stats.recentPRs.length} />
      </header>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Deep analytics summary">
        <ReportMetric icon={Clock3} label="Average merge time" value={formatHours(summary.averageMergeTimeHours)} detail="opened → merged" />
        <ReportMetric icon={TrendingUp} label="Median merge time" value={formatHours(summary.medianMergeTimeHours)} detail="50th percentile" />
        <ReportMetric icon={Clock3} label="90% merge time" value={formatHours(summary.p90MergeTimeHours)} detail={`${summary.mergeSampleSize} merged PRs sampled`} />
        <ReportMetric icon={GitPullRequest} label="Oldest open PR" value={formatHours(summary.oldestOpenPRHours)} detail="age at report time" />
      </section>

      <DecisionSummary summary={summary} scopeLabel={scopeLabel} />

      <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6">
        <div className="flex items-start gap-3"><div className="rounded-xl bg-[#EAA036]/15 p-2 text-[#9E6212]"><BarChart3 className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514] sm:text-lg">What happened in {scopeLabel}</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">These are calculations, not model guesses. For example, a 10-hour value means the average or percentile was calculated from the PRs loaded inside this exact window.</p></div></div>
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4"><MiniStat icon={GitPullRequest} label="Total PRs" value={summary.totalPRs} /><MiniStat icon={GitMerge} label="Merged" value={summary.mergedPRs} /><MiniStat icon={ShieldCheck} label="Maintainer authored" value={`${summary.maintainerAuthoredPct}%`} /><MiniStat icon={Users} label="Active days" value={summary.activeDays} /></div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopicOutcomeMatrix topics={summary.topicOutcomeMatrix} limit={getFocusLimit(summary.totalPRs)} scopeLabel={scopeLabel} />
        <MaintainerActivity items={summary.topMaintainerActivity} />
      </section>

      <ContributorConversionCard conversion={summary.contributorConversion} />

      <ChangedFilesSection analytics={fileAnalytics} loading={fileLoading} progress={fileProgress} error={fileError} hasPersonalToken={hasPersonalToken} onOpenTokenModal={onOpenTokenModal} />

      <DirectoryFocusSection analytics={fileAnalytics} scopeLabel={scopeLabel} />

      <DeepAnalyticsCharts summary={summary} fileAnalytics={fileAnalytics} reviewAnalytics={reviewAnalytics} reviewLoading={reviewLoading} reviewProgress={reviewProgress} reviewError={reviewError} />

      <AIInsightsPanel evidence={evidence} />
    </section>
  );
};

function ChangedFilesSection({ analytics, loading, progress, error, hasPersonalToken, onOpenTokenModal }: { analytics: DeepFileAnalytics | null; loading: boolean; progress: string; error: string | null; hasPersonalToken: boolean; onOpenTokenModal: () => void }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-base font-display font-bold text-[#161514]">Changed-file focus</h2><p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#787571]">Exact files touched by the bounded PR scan. Maintainer-associated activity is counted separately from community activity.</p></div>{analytics?.isPartial && <span className="rounded-full bg-[#FFF9EF] px-2.5 py-1 text-[10px] font-mono text-[#9E6212]">Bounded PR scan</span>}</div>{!hasPersonalToken && <div className="mt-4 rounded-xl border border-[#EAA036]/35 bg-[#FFF9EF] px-3 py-2 text-xs text-[#65615B]">Connect a GitHub PAT to scan changed-file metadata without exhausting the public request limit. <button type="button" onClick={onOpenTokenModal} className="font-semibold text-[#9E6212] hover:underline">Add PAT</button></div>}{loading && <p className="mt-4 text-xs font-mono text-[#9E6212]">{progress || 'Reading changed files…'}</p>}{error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">{error}</p>}{analytics && <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#F7F5F0] text-[10px] uppercase tracking-wide text-[#787571]"><tr><th className="rounded-l-lg px-3 py-2">File</th><th className="px-3 py-2">Merged / scanned</th><th className="px-3 py-2">Contributors</th><th className="px-3 py-2">Median merge</th><th className="px-3 py-2">+ / − lines</th><th className="rounded-r-lg px-3 py-2">Evidence</th></tr></thead><tbody className="divide-y divide-[#E5E0D8]">{analytics.files.slice(0, 15).map((file) => <tr key={file.path} className="hover:bg-[#F7F5F0]"><td className="max-w-[250px] truncate px-3 py-2.5 font-mono text-[11px] text-[#161514]">{file.path}</td><td className="px-3 py-2.5 font-mono text-[#65615B]">{file.mergedPRs}/{file.totalPRs}</td><td className="px-3 py-2.5 font-mono text-[#65615B]">{file.uniqueContributors}</td><td className="px-3 py-2.5 font-mono text-[#9E6212]">{formatHours(file.medianMergeTimeHours)}</td><td className="px-3 py-2.5 font-mono text-[#65615B]">+{file.additions} / −{file.deletions}</td><td className="px-3 py-2.5 font-mono text-[10px] text-[#787571]">#{file.prNumbers.slice(0, 4).join(', #')}</td></tr>)}</tbody></table>{!analytics.files.length && <p className="py-5 text-xs text-[#787571]">No changed-file metadata was returned for the scanned pull requests.</p>}</div>}</section>;
}

function TopicOutcomeMatrix({ topics, limit, scopeLabel }: { topics: ReturnType<typeof buildDeepAnalyticsSummary>['topicOutcomeMatrix']; limit: number; scopeLabel: string }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#EFECE6] p-2 text-[#9E6212]"><Target className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514]">Topic / outcome matrix</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">What work appeared in {scopeLabel}, and how often did it become merged work?</p></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="text-[10px] uppercase tracking-wide text-[#787571]"><tr><th className="px-2 py-2">Topic</th><th className="px-2 py-2">PRs</th><th className="px-2 py-2">Merge rate</th><th className="px-2 py-2">Median</th><th className="px-2 py-2">Trend</th><th className="px-2 py-2">Evidence</th></tr></thead><tbody className="divide-y divide-[#E5E0D8]">{topics.slice(0, limit).map((topic) => <tr key={topic.topic}><td className="max-w-32 truncate px-2 py-2 font-semibold text-[#161514]">{topic.topic}</td><td className="px-2 py-2 font-mono">{topic.prCount}</td><td className="px-2 py-2 font-mono text-[#9E6212]">{topic.mergeRatePct}%</td><td className="px-2 py-2 font-mono">{formatHours(topic.medianMergeTimeHours)}</td><td className={`px-2 py-2 font-mono ${topic.recentTrend === 'rising' ? 'text-emerald-700' : topic.recentTrend === 'falling' ? 'text-rose-700' : 'text-[#787571]'}`}>{topic.recentTrend}</td><td className="px-2 py-2 font-mono text-[10px] text-[#787571]">#{topic.prNumbers.slice(0, 3).join(', #')}</td></tr>)}</tbody></table>{!topics.length && <p className="py-5 text-xs text-[#787571]">No repeated labels or terms were found in this window.</p>}</div></section>;
}

function DecisionSummary({ summary, scopeLabel }: { summary: ReturnType<typeof buildDeepAnalyticsSummary>; scopeLabel: string }) {
  const focus = summary.topicOutcomeMatrix[0];
  const accessible = [...summary.topicOutcomeMatrix].filter((topic) => topic.prCount >= 3).sort((a, b) => b.mergeRatePct - a.mergeRatePct)[0];
  const backlog = summary.openPRs > 0 ? `${summary.openPRs} open PRs; ${summary.oldestOpenPRHours === null ? 'age unavailable' : `${formatHours(summary.oldestOpenPRHours)} oldest`}` : 'No open PR backlog in this window';
  return <section className="rounded-3xl border border-[#161514] bg-[#161514] p-4 text-white shadow-lg sm:p-6" aria-labelledby="decision-summary-title"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#EAA036] p-2 text-[#161514]"><Compass className="h-4 w-4" /></div><div><h2 id="decision-summary-title" className="text-base font-display font-bold sm:text-lg">Contributor decision summary</h2><p className="mt-1 text-xs leading-relaxed text-[#BDB8AF]">Deterministic signals from {scopeLabel}; no AI interpretation is used in these bullets.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-3"><DecisionItem icon={Target} label="Active focus" value={focus ? `${focus.topic} · ${focus.mergedCount}/${focus.prCount} merged` : 'No clear focus'} /><DecisionItem icon={Gauge} label="Most accessible sampled topic" value={accessible ? `${accessible.topic} · ${accessible.mergeRatePct}% merge rate` : 'Not enough volume'} /><DecisionItem icon={FolderTree} label="Queue health" value={backlog} /></div></section>;
}

function DecisionItem({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#BDB8AF]"><Icon className="h-3.5 w-3.5 text-[#EAA036]" />{label}</div><p className="mt-2 text-sm font-semibold leading-snug text-white">{value}</p></div>; }

function EvidenceFilters({ roleFilter, labelFilter, reviewerFilter, labels, reviewers, onRoleChange, onLabelChange, onReviewerChange, onClear, filteredCount, totalCount }: { roleFilter: RoleFilter; labelFilter: string; reviewerFilter: string; labels: string[]; reviewers: string[]; onRoleChange: (value: RoleFilter) => void; onLabelChange: (value: string) => void; onReviewerChange: (value: string) => void; onClear: () => void; filteredCount: number; totalCount: number }) {
  const selectClass = 'rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514] outline-none focus:border-[#EAA036]';
  return <div className="mt-5 rounded-2xl border border-[#E5E0D8] bg-[#F7F5F0] p-3"><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"><label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#787571]">Author role<select value={roleFilter} onChange={(event) => onRoleChange(event.target.value as RoleFilter)} className={selectClass}><option value="all">Everyone</option><option value="contributors_only">Community authors</option><option value="maintainers_only">Maintainer-associated</option></select></label><label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#787571]">Label<select value={labelFilter} onChange={(event) => onLabelChange(event.target.value)} className={selectClass}><option value="all">All labels</option>{labels.map((label) => <option key={label} value={label}>{label}</option>)}</select></label><label className="grid gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#787571]">Reviewer<select value={reviewerFilter} onChange={(event) => onReviewerChange(event.target.value)} className={selectClass}><option value="all">All reviewers</option>{reviewers.map((reviewer) => <option key={reviewer} value={reviewer}>{reviewer}</option>)}</select></label><button type="button" onClick={onClear} className="rounded-xl border border-[#D5D0C7] bg-white px-3 py-2 text-xs font-semibold text-[#65615B] hover:border-[#EAA036]">Clear filters</button><span className="text-[10px] font-mono text-[#787571]">Showing {filteredCount} of {totalCount} PRs</span></div>{!reviewers.length && <p className="mt-2 text-[10px] text-[#9E6212]">Reviewer filters become available after the PAT-backed review scan finishes.</p>}</div>;
}

function DirectoryFocusSection({ analytics, scopeLabel }: { analytics: DeepFileAnalytics | null; scopeLabel: string }) {
  const directories = analytics?.directories || [];
  const [selectedDirectory, setSelectedDirectory] = useState('all');
  const visibleDirectories = selectedDirectory === 'all' ? directories.slice(0, 12) : directories.filter((directory) => directory.path === selectedDirectory);
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#EFECE6] p-2 text-[#9E6212]"><FolderTree className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514]">Directory focus and opportunity</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">Merged work concentration and contributor breadth in the selected scan for {scopeLabel}.</p></div></div>{analytics && <select value={selectedDirectory} onChange={(event) => setSelectedDirectory(event.target.value)} className="rounded-xl border border-[#E5E0D8] bg-white px-3 py-2 text-xs text-[#161514]"><option value="all">Top directories</option>{directories.map((directory) => <option key={directory.path} value={directory.path}>{directory.path}</option>)}</select>}</div>{analytics ? <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-[#F7F5F0] text-[10px] uppercase tracking-wide text-[#787571]"><tr><th className="rounded-l-lg px-3 py-2">Area</th><th className="px-3 py-2">Merged / scanned</th><th className="px-3 py-2">Merge rate</th><th className="px-3 py-2">Median merge</th><th className="px-3 py-2">Contributors</th><th className="rounded-r-lg px-3 py-2">Evidence</th></tr></thead><tbody className="divide-y divide-[#E5E0D8]">{visibleDirectories.map((directory) => <tr key={directory.path}><td className="px-3 py-2.5 font-mono font-semibold">{directory.path}</td><td className="px-3 py-2.5 font-mono">{directory.mergedPRs}/{directory.totalPRs}</td><td className="px-3 py-2.5 font-mono text-[#9E6212]">{directory.mergeRatePct}%</td><td className="px-3 py-2.5 font-mono">{formatHours(directory.medianMergeTimeHours)}</td><td className="px-3 py-2.5 font-mono">{directory.uniqueContributors}</td><td className="px-3 py-2.5 font-mono text-[10px] text-[#787571]">#{directory.prNumbers.slice(0, 4).join(', #')}</td></tr>)}</tbody></table>{!directories.length && <p className="py-5 text-xs text-[#787571]">No directory metadata was returned.</p>}</div> : <div className="mt-4 rounded-xl border border-dashed border-[#D5D0C7] bg-[#F7F5F0] px-3 py-5 text-xs text-[#787571]">Connect a GitHub PAT to scan directory-level changed-file evidence.</div>}</section>;
}

function MaintainerActivity({ items }: { items: ReturnType<typeof buildDeepAnalyticsSummary>['topMaintainerActivity'] }) {
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><h2 className="text-base font-display font-bold text-[#161514]">Maintainer activity</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">People identified by GitHub as owner, member, or collaborator in the selected evidence.</p><div className="mt-4 space-y-2">{items.map((item) => <div key={item.username} className="flex items-center justify-between gap-3 rounded-xl bg-[#F7F5F0] px-3 py-2"><span className="truncate font-mono text-xs text-[#161514]">{item.username}</span><span className="flex-shrink-0 text-[10px] font-mono text-[#787571]">{item.mergedPRs} merged / {item.totalPRs} PRs</span></div>)}{!items.length && <p className="py-5 text-xs text-[#787571]">No maintainer-authored PRs were identified in this window.</p>}</div></section>;
}

function ContributorConversionCard({ conversion }: { conversion: ReturnType<typeof buildDeepAnalyticsSummary>['contributorConversion'] }) {
  const mergedRate = conversion.uniqueAuthors ? Math.round((conversion.authorsWithMergedPR / conversion.uniqueAuthors) * 100) : 0;
  const repeatRate = conversion.uniqueAuthors ? Math.round((conversion.repeatAuthors / conversion.uniqueAuthors) * 100) : 0;
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-display font-bold text-[#161514]">Contributor conversion</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">A selected-window proxy for newcomer accessibility. It is not a lifetime contributor-retention metric.</p></div><span className="rounded-full bg-[#EFECE6] px-2.5 py-1 text-[10px] font-mono text-[#787571]">Window-scoped</span></div><div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5"><MiniStat icon={Users} label="Unique authors" value={conversion.uniqueAuthors} /><MiniStat icon={GitMerge} label="Authors with merge" value={`${mergedRate}%`} /><MiniStat icon={Target} label="First PR merged" value={conversion.firstPRMergedAuthors} /><MiniStat icon={TrendingUp} label="Repeat authors" value={`${repeatRate}%`} /><MiniStat icon={GitPullRequest} label="One and done" value={conversion.oneAndDoneAuthors} /></div></section>;
}

function ReportMetric({ icon: Icon, label, value, detail }: { icon: typeof Clock3; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-[#E5E0D8] bg-white p-3 shadow-xs sm:p-4"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#787571]"><Icon className="h-3.5 w-3.5 text-[#EAA036]" /> {label}</div><p className="mt-2 text-xl font-display font-bold text-[#161514] sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-[#787571]">{detail}</p></div>; }
function MiniStat({ icon: Icon, label, value }: { icon: typeof GitPullRequest; label: string; value: number | string }) { return <div className="rounded-xl bg-[#F7F5F0] p-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#787571]"><Icon className="h-3.5 w-3.5 text-[#9E6212]" /> {label}</div><p className="mt-2 text-lg font-display font-bold text-[#161514]">{typeof value === 'number' ? value.toLocaleString() : value}</p></div>; }
function formatHours(hours: number | null) { if (hours === null) return 'No data'; if (hours < 24) return `${hours}h`; return `${Math.round((hours / 24) * 10) / 10}d`; }
function getScopeLabel(filter: TimeFilter, range: DateRange) { if (filter === 'custom' && range.from && range.to) return `${format(parseISO(`${range.from}T00:00:00`), 'MMM d, yyyy')} – ${format(parseISO(`${range.to}T00:00:00`), 'MMM d, yyyy')}`; return PRESET_LABELS[filter === 'custom' ? '1m' : filter]; }
function getFocusLimit(totalPRs: number) { if (totalPRs < 20) return 3; if (totalPRs < 100) return 6; return 10; }
