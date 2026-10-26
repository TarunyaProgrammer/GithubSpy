import React, { useMemo } from 'react';
import { BarChart3, Clock3, GitPullRequest, Hourglass, MessageSquare, Ruler, Users } from 'lucide-react';
import type { DeepAnalyticsSummary, DeepFileAnalytics, DeepReviewAnalytics } from '../types';

interface DeepAnalyticsChartsProps {
  summary: DeepAnalyticsSummary;
  fileAnalytics: DeepFileAnalytics | null;
  reviewAnalytics: DeepReviewAnalytics | null;
  reviewLoading: boolean;
  reviewProgress: string;
  reviewError: string | null;
}

export const DeepAnalyticsCharts: React.FC<DeepAnalyticsChartsProps> = ({ summary, fileAnalytics, reviewAnalytics, reviewLoading, reviewProgress, reviewError }) => (
  <div className="space-y-4">
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Activity and merge-time charts">
      <ActivityChart timeline={summary.activityTimeline} />
      <MergeTimeChart buckets={summary.mergeTimeBuckets} summary={summary} />
    </section>
    <MergeFunnelChart summary={summary} reviewAnalytics={reviewAnalytics} />
    <OpenAgeChart buckets={summary.openAgeBuckets} />
    <SizeChart fileAnalytics={fileAnalytics} />
    <SizeMergeChart fileAnalytics={fileAnalytics} />
    <ReviewResponseSection analytics={reviewAnalytics} loading={reviewLoading} progress={reviewProgress} error={reviewError} />
  </div>
);

function ActivityChart({ timeline }: { timeline: DeepAnalyticsSummary['activityTimeline'] }) {
  const max = Math.max(...timeline.map((item) => Math.max(item.opened, item.merged, item.closed)), 1);
  return (
    <ChartShell icon={BarChart3} title="Activity over time" description="Opened, merged, and closed PR events in the selected period.">
      <div className="flex h-44 items-end gap-2 overflow-x-auto pb-6 pt-4">
        {timeline.map((item) => (
          <div key={item.label} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-1">
            <div className="flex h-32 w-full max-w-10 items-end gap-0.5">
              <Bar value={item.opened} max={max} color="bg-[#D5D0C7]" title={`${item.opened} opened`} />
              <Bar value={item.merged} max={max} color="bg-emerald-600" title={`${item.merged} merged`} />
              <Bar value={item.closed} max={max} color="bg-[#EAA036]" title={`${item.closed} closed without merge`} />
              <Bar value={item.open} max={max} color="bg-sky-500" title={`${item.open} still open`} />
            </div>
            <span className="max-w-16 truncate text-[9px] font-mono text-[#787571]">{item.label}</span>
          </div>
        ))}
      </div>
      <Legend items={[["Opened", "bg-[#D5D0C7]"], ["Merged", "bg-emerald-600"], ["Closed", "bg-[#EAA036]"], ["Still open", "bg-sky-500"]]} />
      <p className="mt-3 text-[10px] text-[#787571]">The thin label below each period is a four-period moving average of opened PRs: {timeline.length ? `${timeline[timeline.length - 1].movingAverage} opened per period recently.` : 'not available.'}</p>
    </ChartShell>
  );
}

function MergeTimeChart({ buckets, summary }: { buckets: DeepAnalyticsSummary['mergeTimeBuckets']; summary: DeepAnalyticsSummary }) {
  const max = Math.max(...buckets.map((item) => item.count), 1);
  return (
    <ChartShell icon={Clock3} title="Merge-time distribution" description="How long merged PRs took from opening to merge.">
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TinyMetric label="Median" value={formatHours(summary.medianMergeTimeHours)} />
        <TinyMetric label="P75" value={formatHours(summary.p75MergeTimeHours)} />
        <TinyMetric label="P90" value={formatHours(summary.p90MergeTimeHours)} />
        <TinyMetric label="Sample" value={`${summary.mergeSampleSize} PRs`} />
      </div>
      <div className="mt-5 space-y-3">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="grid grid-cols-[58px_1fr_28px] items-center gap-2 text-[11px]">
            <span className="font-mono text-[#65615B]">{bucket.label}</span>
            <div className="h-3 rounded bg-[#EFECE6]"><div className="h-3 rounded bg-[#EAA036]" style={{ width: `${(bucket.count / max) * 100}%` }} /></div>
            <span className="text-right font-mono text-[#161514]">{bucket.count}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-[#787571]">Fastest: {formatHours(summary.fastestMergeTimeHours)} · Slowest: {formatHours(summary.slowestMergeTimeHours)}. Percentiles are calculated from merged PRs in this report window.</p>
    </ChartShell>
  );
}

function MergeFunnelChart({ summary, reviewAnalytics }: { summary: DeepAnalyticsSummary; reviewAnalytics: DeepReviewAnalytics | null }) {
  const funnel = reviewAnalytics?.funnel || summary.mergeFunnel;
  const stages = [
    { label: 'Opened', value: funnel.opened, color: 'bg-[#D5D0C7]' },
    { label: 'Received review', value: funnel.reviewed, color: 'bg-[#EAA036]' },
    { label: 'Approved', value: funnel.approved, color: 'bg-[#9E6212]' },
    { label: 'Merged', value: funnel.merged, color: 'bg-emerald-600' },
  ];
  const base = funnel.opened || 1;
  return <ChartShell icon={GitPullRequest} title="Merge funnel" description="Where contributions move forward or drop out. Review and approval stages appear after the authenticated deep scan.">
    <div className="mt-5 grid gap-2 md:grid-cols-4">{stages.map((stage, index) => { const previous = index === 0 ? base : stages[index - 1].value; const dropOff = stage.value !== null && previous !== null && previous > 0 ? Math.max(0, Math.round((1 - stage.value / previous) * 100)) : null; return <div key={stage.label} className="relative rounded-xl bg-[#F7F5F0] p-3"><div className={`h-1.5 rounded ${stage.color}`} style={{ width: `${stage.value === null ? 0 : Math.max((stage.value / base) * 100, stage.value ? 5 : 0)}%` }} /><p className="mt-3 text-[10px] uppercase tracking-wide text-[#787571]">{stage.label}</p><p className="mt-1 text-lg font-display font-bold text-[#161514]">{stage.value === null ? '—' : stage.value}</p>{stage.value !== null && <p className="mt-0.5 text-[10px] text-[#787571]">{index === 0 ? '100% of opened' : `${dropOff}% drop-off from prior stage`}</p>}{index < stages.length - 1 && <span className="absolute -right-2 top-12 z-10 hidden text-[#C4BFB6] md:block">→</span>}</div>; })}</div>
    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#787571]"><span className="rounded-full bg-[#F7F5F0] px-2.5 py-1">Closed without merge: {funnel.closedWithoutMerge}</span><span className="rounded-full bg-[#F7F5F0] px-2.5 py-1">Still open: {funnel.open}</span>{!reviewAnalytics && <span className="rounded-full bg-[#FFF9EF] px-2.5 py-1 text-[#9E6212]">Add PAT for review stages</span>}</div>
  </ChartShell>;
}

function OpenAgeChart({ buckets }: { buckets: DeepAnalyticsSummary['openAgeBuckets'] }) {
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  return (
    <ChartShell icon={Hourglass} title="Open PR aging" description="How long currently open pull requests have been waiting, measured from their opening date to now.">
      {total ? <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex h-40 items-end gap-3 overflow-x-auto border-b border-[#E5E0D8] pb-6">
          {buckets.map((bucket) => <div key={bucket.label} className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-mono text-[#65615B]">{bucket.count}</span>
            <div className="w-full max-w-16 rounded-t bg-[#9E6212]" style={{ height: `${Math.max((bucket.count / max) * 100, bucket.count ? 5 : 0)}%` }} title={`${bucket.count} open PRs in ${bucket.label}`} />
            <span className="text-center text-[9px] leading-tight text-[#787571]">{bucket.label}</span>
          </div>)}
        </div>
        <div className="rounded-xl bg-[#F7F5F0] p-3 text-xs text-[#65615B] md:max-w-56">
          <p className="font-display font-bold text-[#161514]">{total} open PR{total === 1 ? '' : 's'}</p>
          <p className="mt-1 leading-relaxed">Older queues can reveal review bottlenecks that merge-time averages hide.</p>
        </div>
      </div> : <EmptyDeepState text="No open pull requests were found in the selected period." />}
    </ChartShell>
  );
}

function SizeChart({ fileAnalytics }: { fileAnalytics: DeepFileAnalytics | null }) {
  const bands = useMemo(() => {
    const rows = fileAnalytics?.prSizes || [];
    const ranges = [{ label: '1–3 files', max: 3 }, { label: '4–10 files', max: 10 }, { label: '11–30 files', max: 30 }, { label: '31+ files', max: Infinity }];
    return ranges.map((range, index) => {
      const min = index === 0 ? 0 : ranges[index - 1].max;
      const selected = rows.filter((row) => row.filesChanged > min && row.filesChanged <= range.max);
      const mergeTimes = selected.map((row) => row.mergeTimeHours).filter((value): value is number => value !== null);
      return { label: range.label, count: selected.length, averageMergeHours: mergeTimes.length ? mergeTimes.reduce((sum, value) => sum + value, 0) / mergeTimes.length : null };
    });
  }, [fileAnalytics]);
  const max = Math.max(...bands.map((band) => band.count), 1);
  return <ChartShell icon={Ruler} title="Change-size profile" description="Merged PRs grouped by number of changed files. This helps contributors calibrate scope before opening a PR.">{fileAnalytics ? <div className="mt-5 space-y-3">{bands.map((band) => <div key={band.label} className="grid grid-cols-[90px_1fr_38px] items-center gap-2 text-[11px]"><span className="font-mono text-[#65615B]">{band.label}</span><div><div className="h-3 rounded bg-[#EFECE6]"><div className="h-3 rounded bg-[#9E6212]" style={{ width: `${(band.count / max) * 100}%` }} /></div><p className="mt-1 text-[9px] text-[#8F8B83]">avg merge {band.averageMergeHours === null ? '—' : formatHours(band.averageMergeHours)}</p></div><span className="text-right font-mono text-[#161514]">{band.count}</span></div>)}</div> : <EmptyDeepState text="Open the report with a GitHub PAT to scan merged PR file sizes." />}</ChartShell>;
}

function SizeMergeChart({ fileAnalytics }: { fileAnalytics: DeepFileAnalytics | null }) {
  const rows = (fileAnalytics?.prSizes || []).filter((row) => row.mergeTimeHours !== null).slice(0, 60);
  const maxChanges = Math.max(...rows.map((row) => row.changes), 1);
  const maxHours = Math.max(...rows.map((row) => row.mergeTimeHours || 0), 1);
  return <ChartShell icon={Ruler} title="PR size versus merge time" description="Each point is a merged PR. Larger changes above the diagonal are a warning sign, not proof of causation.">
    {fileAnalytics ? <div className="mt-5"><div className="relative h-52 rounded-xl border border-[#E5E0D8] bg-[#F7F5F0]"><div className="absolute inset-x-7 bottom-7 top-4 border-b border-l border-[#CFC9BF]">{rows.map((row) => <span key={row.prNumber} title={`PR #${row.prNumber}: ${row.changes} changed lines, ${formatHours(row.mergeTimeHours)}`} className="absolute h-2.5 w-2.5 rounded-full bg-[#9E6212] ring-2 ring-[#FFF9EF]" style={{ left: `${Math.min((row.changes / maxChanges) * 96, 96)}%`, bottom: `${Math.min(((row.mergeTimeHours || 0) / maxHours) * 92, 92)}%` }} />)}</div><span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-[#787571]">changed lines</span><span className="absolute left-1 top-1/2 -rotate-90 text-[9px] text-[#787571]">merge time</span></div><p className="mt-2 text-[10px] text-[#787571]">Showing {rows.length} merged PRs from the bounded file scan. Hover a point for PR evidence.</p></div> : <EmptyDeepState text="Open the report with a GitHub PAT to scan PR size metadata." />}
  </ChartShell>;
}

function ReviewResponseSection({ analytics, loading, progress, error }: { analytics: DeepReviewAnalytics | null; loading: boolean; progress: string; error: string | null }) {
  const firstReviewTimes = analytics?.rows.map((row) => row.firstReviewHours).filter((value): value is number => value !== null) || [];
  const maintainerTimes = analytics?.rows.map((row) => row.firstMaintainerReviewHours).filter((value): value is number => value !== null) || [];
  const approvalToMergeTimes = analytics?.rows.map((row) => row.approvalToMergeHours).filter((value): value is number => value !== null) || [];
  const noReview = analytics ? analytics.rows.filter((row) => row.reviewCount === 0).length : 0;
  const maxReviewerPRs = Math.max(...(analytics?.topReviewers.map((reviewer) => reviewer.reviewedPRs) || [1]));
  return <section className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#EAA036]/15 p-2 text-[#9E6212]"><MessageSquare className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514] sm:text-lg">Review response and friction</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">Authenticated deep scan of review events. It measures response behavior separately from merge time.</p></div></div>{loading && <p className="mt-4 text-xs font-mono text-[#9E6212]">{progress || 'Reading review history…'}</p>}{error && <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">{error}</p>}{!analytics && !loading && !error && <EmptyDeepState text="Connect a GitHub PAT to scan first-review and maintainer-response timing." />}{analytics && <><div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-5"><ReviewStat icon={Clock3} label="First review p50" value={formatHours(percentile(firstReviewTimes, 0.5))} /><ReviewStat icon={Users} label="Maintainer p50" value={formatHours(percentile(maintainerTimes, 0.5))} /><ReviewStat icon={Clock3} label="Approval → merge" value={formatHours(percentile(approvalToMergeTimes, 0.5))} /><ReviewStat icon={MessageSquare} label="No review" value={`${noReview}/${analytics.rows.length}`} /><ReviewStat icon={GitPullRequest} label="PRs scanned" value={`${analytics.rows.length}/${analytics.availablePRs}`} /></div><div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-[#F7F5F0] p-3 text-xs text-[#65615B]"><p className="font-semibold text-[#161514]">Reviewer concentration</p><p className="mt-1">Top reviewer: {analytics.topReviewerPct}% · Top three: {analytics.topThreeReviewerPct}% of reviewer touches.</p><div className="mt-3 space-y-2">{analytics.topReviewers.slice(0, 5).map((reviewer) => <div key={reviewer.username} className="grid grid-cols-[92px_1fr_24px] items-center gap-2 text-[10px]"><span className="truncate font-mono">{reviewer.username}</span><div className="h-2 rounded bg-[#E5E0D8]"><div className="h-2 rounded bg-[#9E6212]" style={{ width: `${(reviewer.reviewedPRs / maxReviewerPRs) * 100}%` }} /></div><span className="text-right font-mono">{reviewer.reviewedPRs}</span></div>)}</div></div><div className="rounded-xl bg-[#F7F5F0] p-3 text-xs text-[#65615B]"><p className="font-semibold text-[#161514]">Revision friction</p><p className="mt-1">{analytics.rows.reduce((sum, row) => sum + row.reviewRounds, 0)} requested-change rounds · {analytics.rows.reduce((sum, row) => sum + row.commentCount, 0)} inline comments.</p></div></div><p className="mt-4 text-[10px] leading-relaxed text-[#787571]">Review times are based on submitted review timestamps, not general comments or merge time. {analytics.isPartial ? 'This is a bounded sample of the selected PR window.' : 'The selected PR window was fully scanned.'}</p></>}</section>;
}

function ChartShell({ icon: Icon, title, description, children }: { icon: typeof BarChart3; title: string; description: string; children: React.ReactNode }) { return <article className="rounded-3xl border border-[#E5E0D8] bg-white p-4 shadow-xs sm:p-6"><div className="flex items-start gap-3"><div className="rounded-xl bg-[#EFECE6] p-2 text-[#9E6212]"><Icon className="h-4 w-4" /></div><div><h2 className="text-base font-display font-bold text-[#161514]">{title}</h2><p className="mt-1 text-xs leading-relaxed text-[#787571]">{description}</p></div></div>{children}</article>; }
function Bar({ value, max, color, title }: { value: number; max: number; color: string; title: string }) { return <div title={title} className={`flex-1 rounded-t ${color}`} style={{ height: `${Math.max((value / max) * 100, value ? 4 : 0)}%` }} />; }
function Legend({ items }: { items: Array<[string, string]> }) { return <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[#787571]">{items.map(([label, color]) => <span key={label} className="inline-flex items-center gap-1"><span className={`h-2 w-2 rounded-sm ${color}`} />{label}</span>)}</div>; }
function EmptyDeepState({ text }: { text: string }) { return <div className="mt-5 rounded-xl border border-dashed border-[#D5D0C7] bg-[#F7F5F0] px-3 py-5 text-xs text-[#787571]">{text}</div>; }
function ReviewStat({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) { return <div className="rounded-xl bg-[#F7F5F0] p-3"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[#787571]"><Icon className="h-3.5 w-3.5 text-[#EAA036]" />{label}</div><p className="mt-2 text-lg font-display font-bold text-[#161514]">{value}</p></div>; }
function median(values: number[]) { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor((sorted.length - 1) / 2)]; }
function percentile(values: number[], ratio: number) { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * ratio))]; }
function TinyMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#F7F5F0] p-2"><p className="text-[9px] uppercase tracking-wide text-[#787571]">{label}</p><p className="mt-1 text-xs font-display font-bold text-[#161514]">{value}</p></div>; }
function formatHours(hours: number | null) { if (hours === null) return 'No data'; if (hours < 24) return `${Math.round(hours * 10) / 10}h`; return `${Math.round((hours / 24) * 10) / 10}d`; }
