import { differenceInMinutes, parseISO } from 'date-fns';
import type { ChangedFileStat, DeepAnalyticsSummary, PullRequest } from '../types';

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
  for (const pr of pullRequests) {
    if (!['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '')) continue;
    const current = maintainerMap.get(pr.user.login) || { mergedPRs: 0, totalPRs: 0 };
    current.totalPRs++;
    if (pr.merged_at) current.mergedPRs++;
    maintainerMap.set(pr.user.login, current);
  }

  const topicMap = new Map<string, { mentions: number; mergedMentions: number; prNumbers: Set<number> }>();
  for (const pr of pullRequests) {
    const labels = pr.labels || [];
    const titleTokens = pr.title
      .toLowerCase()
      .replace(/[^a-z0-9+#.-]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
    const topics = new Set([...labels.map((label) => label.toLowerCase()), ...titleTokens]);
    topics.forEach((topic) => {
      const current = topicMap.get(topic) || { mentions: 0, mergedMentions: 0, prNumbers: new Set<number>() };
      current.mentions++;
      if (pr.merged_at) current.mergedMentions++;
      current.prNumbers.add(pr.number);
      topicMap.set(topic, current);
    });
  }

  return {
    totalPRs: pullRequests.length,
    mergedPRs: merged.length,
    openPRs: pullRequests.filter((pr) => pr.state === 'open').length,
    closedPRs: pullRequests.filter((pr) => pr.state === 'closed' && !pr.merged_at).length,
    averageMergeTimeHours: durations.length ? round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
    medianMergeTimeHours: percentile(durations, 0.5),
    p75MergeTimeHours: percentile(durations, 0.75),
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
  };
}

export function buildAIInput(pullRequests: PullRequest[], summary: DeepAnalyticsSummary, files: ChangedFileStat[] = []) {
  return {
    instructions: 'Analyze only the supplied pull requests. Do not infer repository-wide facts. Every focus area must cite supplied PR numbers. Counts and dates must come from the evidence packet.',
    summary,
    changedFiles: files.slice(0, 100),
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
