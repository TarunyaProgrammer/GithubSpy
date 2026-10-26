import { differenceInMinutes, format, parseISO } from 'date-fns';
import type { ChangedFileStat, DeepAnalyticsSummary, DeepReviewAnalytics, DirectoryFocusStat, PullRequest, TopicOutcomeStat } from '../types';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'when', 'fix', 'fixed', 'add', 'added',
  'update', 'updates', 'use', 'using', 'make', 'made', 'allow', 'allows', 'test', 'tests', 'new', 'issue',
  'pr', 'pull', 'request', 'merge', 'merged', 'change', 'changes', 'of', 'to', 'in', 'on', 'a', 'an', 'as',
]);

export function buildDeepAnalyticsSummary(pullRequests: PullRequest[]): DeepAnalyticsSummary {
  const merged = pullRequests.filter((pr) => Boolean(pr.merged_at));
  const durations = merged
    .map((pr) => differenceInMinutes(parseISO(pr.merged_at as string), parseISO(pr.created_at)) / 60)
    .filter((hours) => Number.isFinite(hours) && hours >= 0)
    .sort((a, b) => a - b);
  const openAges = pullRequests
    .filter((pr) => pr.state === 'open')
    .map((pr) => differenceInMinutes(new Date(), parseISO(pr.created_at)) / 60)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);

  const maintainerMap = new Map<string, { mergedPRs: number; totalPRs: number }>();
  const authorMap = new Map<string, PullRequest[]>();
  for (const pr of pullRequests) {
    const authorPRs = authorMap.get(pr.user.login) || [];
    authorPRs.push(pr);
    authorMap.set(pr.user.login, authorPRs);
    if (!['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '')) continue;
    const current = maintainerMap.get(pr.user.login) || { mergedPRs: 0, totalPRs: 0 };
    current.totalPRs++;
    if (pr.merged_at) current.mergedPRs++;
    maintainerMap.set(pr.user.login, current);
  }

  const topicMap = new Map<string, { mentions: number; mergedMentions: number; mergedDurations: number[]; maintainerMergedCount: number; prNumbers: Set<number>; createdAt: number[] }>();
  const timelineMap = new Map<string, { opened: number; merged: number; closed: number; open: number }>();
  const mergeBuckets = new Map<string, number>([
    ['Under 6h', 0],
    ['6–24h', 0],
    ['1–3d', 0],
    ['3–7d', 0],
    ['7–30d', 0],
    ['30d+', 0],
  ]);
  const openAgeBuckets = new Map<string, number>([
    ['Under 2d', 0],
    ['2–7d', 0],
    ['8–30d', 0],
    ['31–90d', 0],
    ['90d+', 0],
  ]);
  openAges.forEach((hours) => {
    const bucket = hours < 48 ? 'Under 2d' : hours < 168 ? '2–7d' : hours < 720 ? '8–30d' : hours < 2160 ? '31–90d' : '90d+';
    openAgeBuckets.set(bucket, (openAgeBuckets.get(bucket) || 0) + 1);
  });
  for (const pr of pullRequests) {
    const openedLabel = format(parseISO(pr.created_at), 'MMM yyyy');
    const openedBucket = timelineMap.get(openedLabel) || { opened: 0, merged: 0, closed: 0, open: 0 };
    openedBucket.opened++;
    if (pr.state === 'open') openedBucket.open++;
    timelineMap.set(openedLabel, openedBucket);
    if (pr.merged_at) {
      const mergedLabel = format(parseISO(pr.merged_at), 'MMM yyyy');
      const mergedBucket = timelineMap.get(mergedLabel) || { opened: 0, merged: 0, closed: 0, open: 0 };
      mergedBucket.merged++;
      timelineMap.set(mergedLabel, mergedBucket);
    } else if (pr.closed_at) {
      const closedLabel = format(parseISO(pr.closed_at), 'MMM yyyy');
      const closedBucket = timelineMap.get(closedLabel) || { opened: 0, merged: 0, closed: 0, open: 0 };
      closedBucket.closed++;
      timelineMap.set(closedLabel, closedBucket);
    }
    if (pr.merged_at) {
      const duration = differenceInMinutes(parseISO(pr.merged_at), parseISO(pr.created_at)) / 60;
      const bucket = duration < 6 ? 'Under 6h' : duration < 24 ? '6–24h' : duration < 72 ? '1–3d' : duration < 168 ? '3–7d' : duration < 720 ? '7–30d' : '30d+';
      mergeBuckets.set(bucket, (mergeBuckets.get(bucket) || 0) + 1);
    }
    const labels = pr.labels || [];
    const titleTokens = pr.title
      .toLowerCase()
      .replace(/[^a-z0-9+#.-]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
    const topics = new Set([...labels.map((label) => label.toLowerCase()), ...titleTokens]);
    topics.forEach((topic) => {
      const current = topicMap.get(topic) || { mentions: 0, mergedMentions: 0, mergedDurations: [], maintainerMergedCount: 0, prNumbers: new Set<number>(), createdAt: [] };
      current.mentions++;
      current.createdAt.push(parseISO(pr.created_at).getTime());
      if (pr.merged_at) {
        current.mergedMentions++;
        const duration = differenceInMinutes(parseISO(pr.merged_at), parseISO(pr.created_at)) / 60;
        if (Number.isFinite(duration) && duration >= 0) current.mergedDurations.push(duration);
        if (['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '')) current.maintainerMergedCount++;
      }
      current.prNumbers.add(pr.number);
      topicMap.set(topic, current);
    });
  }

  const timeline = Array.from(timelineMap.entries())
    .sort(([a], [b]) => new Date(`1 ${a}`).getTime() - new Date(`1 ${b}`).getTime())
    .map(([label, values], index, entries) => ({
      label,
      ...values,
      movingAverage: round(entries.slice(Math.max(0, index - 3), index + 1).reduce((sum, [, item]) => sum + item.opened, 0) / Math.min(index + 1, 4)),
    }));

  const windowTimes = pullRequests.map((pr) => parseISO(pr.created_at).getTime()).filter(Number.isFinite);
  const midpoint = windowTimes.length ? Math.min(...windowTimes) + (Math.max(...windowTimes) - Math.min(...windowTimes)) / 2 : 0;
  const topicOutcomeMatrix = Array.from(topicMap.entries())
    .map(([topic, values]) => {
      const recentCount = values.createdAt.filter((time) => time >= midpoint).length;
      const earlierCount = values.createdAt.length - recentCount;
      const recentTrend: TopicOutcomeStat['recentTrend'] = values.createdAt.length < 4 || recentCount === earlierCount
        ? 'stable'
        : recentCount > earlierCount * 1.2 ? 'rising' : recentCount * 1.2 < earlierCount ? 'falling' : 'stable';
      return {
        topic,
        prCount: values.mentions,
        mergedCount: values.mergedMentions,
        mergeRatePct: values.mentions ? Math.round((values.mergedMentions / values.mentions) * 100) : 0,
        medianMergeTimeHours: percentile([...values.mergedDurations].sort((a, b) => a - b), 0.5),
        maintainerAssociatedMergedCount: values.maintainerMergedCount,
        recentTrend,
        prNumbers: Array.from(values.prNumbers).slice(0, 12),
      };
    })
    .filter((item) => item.prCount >= 2 || item.mergedCount >= 1)
    .sort((a, b) => b.mergedCount - a.mergedCount || b.prCount - a.prCount)
    .slice(0, 20);

  const conversionRows = Array.from(authorMap.values()).map((prs) => [...prs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
  const firstPRMergedAuthors = conversionRows.filter((prs) => Boolean(prs[0]?.merged_at)).length;
  const repeatAuthors = conversionRows.filter((prs) => prs.length > 1);
  const repeatMergedAuthors = repeatAuthors.filter((prs) => prs.some((pr) => Boolean(pr.merged_at))).length;

  return {
    totalPRs: pullRequests.length,
    mergedPRs: merged.length,
    openPRs: pullRequests.filter((pr) => pr.state === 'open').length,
    closedPRs: pullRequests.filter((pr) => pr.state === 'closed' && !pr.merged_at).length,
    averageMergeTimeHours: durations.length ? round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
    medianMergeTimeHours: percentile(durations, 0.5),
    p75MergeTimeHours: percentile(durations, 0.75),
    p90MergeTimeHours: percentile(durations, 0.9),
    fastestMergeTimeHours: durations.length ? durations[0] : null,
    slowestMergeTimeHours: durations.length ? durations[durations.length - 1] : null,
    mergeSampleSize: durations.length,
    oldestOpenPRHours: openAges.length ? round(Math.max(...openAges)) : null,
    activeDays: new Set(pullRequests.map((pr) => pr.created_at.slice(0, 10))).size,
    maintainerAuthoredPct: pullRequests.length ? Math.round((Array.from(maintainerMap.values()).reduce((sum, item) => sum + item.totalPRs, 0) / pullRequests.length) * 100) : 0,
    topMaintainerActivity: Array.from(maintainerMap.entries())
      .map(([username, values]) => ({ username, ...values }))
      .sort((a, b) => b.mergedPRs - a.mergedPRs || b.totalPRs - a.totalPRs)
      .slice(0, 8),
    topicCandidates: Array.from(topicMap.entries())
      .map(([topic, values]) => ({ topic, mentions: values.mentions, mergedMentions: values.mergedMentions, prNumbers: Array.from(values.prNumbers).slice(0, 12) }))
      .filter((item) => item.mentions >= 2 || item.mergedMentions >= 1)
      .sort((a, b) => b.mergedMentions - a.mergedMentions || b.mentions - a.mentions)
      .slice(0, 20),
    topicOutcomeMatrix,
    contributorConversion: {
      uniqueAuthors: conversionRows.length,
      authorsWithMergedPR: conversionRows.filter((prs) => prs.some((pr) => Boolean(pr.merged_at))).length,
      firstPRMergedAuthors,
      repeatAuthors: repeatAuthors.length,
      repeatMergedAuthors,
      oneAndDoneAuthors: conversionRows.filter((prs) => prs.length === 1).length,
      coverage: 'selected-window',
    },
    mergeFunnel: {
      opened: pullRequests.length,
      reviewed: null,
      approved: null,
      merged: merged.length,
      closedWithoutMerge: pullRequests.filter((pr) => pr.state === 'closed' && !pr.merged_at).length,
      open: pullRequests.filter((pr) => pr.state === 'open').length,
    },
    activityTimeline: timeline,
    mergeTimeBuckets: Array.from(mergeBuckets.entries()).map(([label, count]) => ({ label, count })),
    openAgeBuckets: Array.from(openAgeBuckets.entries()).map(([label, count]) => ({ label, count })),
  };
}

export function buildAIInput(pullRequests: PullRequest[], summary: DeepAnalyticsSummary, files: ChangedFileStat[] = [], directories: DirectoryFocusStat[] = [], review: DeepReviewAnalytics | null = null) {
  return {
    instructions: 'Analyze only the supplied pull requests and deterministic evidence. Do not infer repository-wide facts. Every focus area must cite supplied PR numbers and distinguish deterministic evidence from interpretation. Counts and dates must come from the evidence packet.',
    summary,
    changedFiles: files.slice(0, 100),
    directories: directories.slice(0, 40),
    reviewAnalytics: review ? {
      funnel: review.funnel,
      topReviewers: review.topReviewers,
      topReviewerPct: review.topReviewerPct,
      topThreeReviewerPct: review.topThreeReviewerPct,
      rows: review.rows.slice(0, 40),
    } : null,
    pullRequests: pullRequests.slice(0, 250).map((pr) => ({
      number: pr.number,
      title: pr.title,
      labels: pr.labels || [],
      body: pr.body ? pr.body.slice(0, 1200) : null,
      createdAt: pr.created_at,
      mergedAt: pr.merged_at,
      state: pr.state,
      authorAssociation: pr.author_association || 'UNKNOWN',
      author: pr.user.login,
    })),
  };
}

function percentile(values: number[], ratio: number): number | null {
  if (!values.length) return null;
  return round(values[Math.min(values.length - 1, Math.floor((values.length - 1) * ratio))]);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
