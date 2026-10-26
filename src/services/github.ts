import { subDays, parseISO, isAfter, differenceInMinutes } from 'date-fns';
import type {
  ContributorStats,
  PullRequest,
  RepoStats,
  UserStats,
  TimeFilter,
  RateLimitInfo,
  RepoMetrics,
  DateRange,
  OrganizationStats,
  RepositorySummary,
  ChangedFileStat,
  DirectoryFocusStat,
  DeepFileAnalytics,
  DeepReviewAnalytics,
} from '../types';
import { getActiveToken } from './token';
import { appCache } from './cache';

import { fetchRepoViaGraphQL } from './graphql';

// Global rate limit listener
type RateLimitListener = (info: RateLimitInfo) => void;
const rateLimitListeners = new Set<RateLimitListener>();

export function onRateLimitUpdate(listener: RateLimitListener): () => void {
  rateLimitListeners.add(listener);
  return () => rateLimitListeners.delete(listener);
}

export function broadcastRateLimit(info: RateLimitInfo) {
  rateLimitListeners.forEach((fn) => fn(info));
}

function notifyRateLimit(headers: Headers, isAuthenticated: boolean) {
  const limitStr = headers.get('x-ratelimit-limit');
  const remainingStr = headers.get('x-ratelimit-remaining');
  const resetStr = headers.get('x-ratelimit-reset');

  if (limitStr && remainingStr) {
    const limit = parseInt(limitStr, 10);
    const remaining = parseInt(remainingStr, 10);
    const resetDate = resetStr ? new Date(parseInt(resetStr, 10) * 1000) : null;

    const info: RateLimitInfo = {
      limit,
      remaining,
      resetDate,
      isAuthenticated,
    };

    broadcastRateLimit(info);
  }
}

/**
 * Cleanly parse and sanitize any format of GitHub repository input.
 * Strips query parameters (?tab=...), hash fragments (#readme),
 * deep subpaths (/pulls, /tree/main), SSH protocols, and .git extensions.
 */
export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  let raw = input.trim();

  // 1. Strip query parameters (?tab=...) and hash fragments (#readme)
  raw = raw.split('#')[0].split('?')[0].trim();

  // 2. Strip SSH clone prefix (git@github.com:)
  if (raw.toLowerCase().startsWith('git@github.com:')) {
    raw = raw.substring('git@github.com:'.length);
  }

  // 3. Strip web protocol and domain variations
  raw = raw.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, '');

  // 4. Strip trailing .git and slashes
  while (raw.endsWith('/') || raw.endsWith('.git')) {
    if (raw.endsWith('.git')) {
      raw = raw.slice(0, -4);
    }
    if (raw.endsWith('/')) {
      raw = raw.slice(0, -1);
    }
  }

  // 5. Extract owner and repository from path segments
  const parts = raw.split('/').filter(Boolean);

  if (parts.length >= 2) {
    const owner = parts[0].trim();
    const repo = parts[1].replace(/\.git$/i, '').trim();

    // Verify valid GitHub username and repository characters
    if (/^[A-Za-z0-9_.-]+$/.test(owner) && /^[A-Za-z0-9_.-]+$/.test(repo)) {
      return { owner, repo };
    }
  }

  return null;
}

export function getTimeFilterDate(filter: TimeFilter, dateRange?: DateRange): Date {
  const now = new Date();
  switch (filter) {
    case '2w':
      return subDays(now, 14);
    case '1m':
      return subDays(now, 30);
    case '3m':
      return subDays(now, 90);
    case '6m':
      return subDays(now, 180);
    case 'custom':
      return dateRange?.from ? new Date(`${dateRange.from}T00:00:00`) : subDays(now, 30);
    case 'all':
    default:
      return new Date(0);
  }
}

function getTimeFilterEnd(filter: TimeFilter, dateRange?: DateRange): Date | null {
  if (filter !== 'custom' || !dateRange?.to) return null;
  return new Date(`${dateRange.to}T23:59:59.999`);
}

async function fetchGitHubApi(endpoint: string, options: RequestInit = {}): Promise<{ data: any; headers: Headers }> {
  const token = getActiveToken();
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/vnd.github.v3+json');
  headers.set('X-GitHub-Api-Version', '2022-11-28');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('GitHub could not be reached. Check your internet connection or whether this browser blocks the GitHub API.');
  }

  notifyRateLimit(response.headers, Boolean(token));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('We could not find that project. Check the GitHub link or enter the owner and project name again.');
    }
    if (response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        throw new Error('GitHub’s public request limit has been reached for this connection. Add a GitHub token to keep checking projects, or wait for the limit to reset.');
      }
      const msg = await response.text();
      throw new Error(`GitHub did not allow this request. ${msg || 'Check that the project is public or that your token has access.'}`);
    }
    if (response.status === 401) {
      throw new Error('GitHub could not use your token. It may be expired, incorrect, or missing access to this project.');
    }
    throw new Error('GitHub could not load this project right now. Please try again in a moment.');
  }

  const data = await response.json();
  return { data, headers: response.headers };
}

type OfficialContributor = { login: string; avatar_url: string; contributions: number };

async function fetchOfficialContributors(owner: string, repo: string): Promise<OfficialContributor[]> {
  try {
    const { data } = await fetchGitHubApi(`/repos/${owner}/${repo}/contributors?per_page=100`);
    if (!Array.isArray(data)) return [];

    return data.map((contributor: any) => ({
      login: contributor.login || 'unknown',
      avatar_url: contributor.avatar_url || `https://github.com/${contributor.login}.png`,
      contributions: contributor.contributions || 0,
    }));
  } catch {
    return [];
  }
}

async function fetchPullRequestsViaRest(
  owner: string,
  repo: string,
  fullName: string,
  filterDate: Date,
  filterEnd: Date | null,
  maxPages: number,
  onProgress?: (message: string) => void
): Promise<{ pullRequests: PullRequest[]; maintainerLogins: string[]; totalRepositoryPRs: number }> {
  const pullRequests: PullRequest[] = [];
  const maintainerLogins = new Set<string>();
  const isAllTime = filterDate.getTime() === 0;

  for (let page = 1; page <= maxPages; page++) {
    onProgress?.(`Loading contributions (page ${page} of ${maxPages})…`);
    const { data: rawPulls } = await fetchGitHubApi(
      `/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}&sort=created&direction=desc`
    );

    if (!Array.isArray(rawPulls) || rawPulls.length === 0) break;

    let crossedDateBoundary = false;
    for (const pr of rawPulls) {
      const createdTime = parseISO(pr.created_at).getTime();
      if (filterEnd && createdTime > filterEnd.getTime()) continue;
      if (!isAllTime && createdTime < filterDate.getTime()) {
        crossedDateBoundary = true;
        break; // Stop collecting older PRs outside the timeframe
      }

      const authorLogin = pr.user?.login || 'ghost';
      const authorAssociation = pr.author_association || 'NONE';

      if (['OWNER', 'MEMBER', 'COLLABORATOR'].includes(authorAssociation)) {
        maintainerLogins.add(authorLogin);
      }
      if (pr.merged_by?.login) maintainerLogins.add(pr.merged_by.login);

      pullRequests.push({
        number: pr.number,
        title: pr.title || `PR #${pr.number}`,
        state: pr.state === 'open' ? 'open' : 'closed',
        created_at: pr.created_at,
        merged_at: pr.merged_at || null,
        closed_at: pr.closed_at || null,
        html_url: pr.html_url,
        repository_url: pr.base?.repo?.html_url || `https://github.com/${fullName}`,
        repository_name: fullName,
        author_association: authorAssociation,
        labels: Array.isArray(pr.labels) ? pr.labels.map((label: any) => label.name).filter(Boolean).slice(0, 12) : [],
        body: typeof pr.body === 'string' ? pr.body.slice(0, 4000) : null,
        merged_by: pr.merged_by?.login || null,
        user: {
          login: authorLogin,
          avatar_url: pr.user?.avatar_url || `https://github.com/${authorLogin}.png`,
        },
      });
    }

    if (crossedDateBoundary || rawPulls.length < 100) break;
  }

  return {
    pullRequests,
    maintainerLogins: Array.from(maintainerLogins),
    totalRepositoryPRs: pullRequests.length,
  };
}

/** Fetch public pull-request activity for a repository. */
export async function fetchRepoStats(
  rawInput: string,
  timeFilter: TimeFilter,
  onProgress?: (message: string) => void,
  forceRefresh = false,
  dateRange?: DateRange
): Promise<RepoStats> {
  if (timeFilter === 'custom' && (!dateRange?.from || !dateRange.to || dateRange.from > dateRange.to)) {
    throw new Error('Choose a valid custom date range with both a start date and an end date.');
  }

  const target = parseGitHubUrl(rawInput);
  if (!target) {
    throw new Error('Enter a GitHub project link, such as github.com/facebook/react, or use owner/project.');
  }

  const { owner, repo } = target;
  const fullName = `${owner}/${repo}`;
  const rawCacheKey = `repo_raw_${fullName}_${timeFilter}_${dateRange?.from || ''}_${dateRange?.to || ''}`;

  onProgress?.(forceRefresh ? `Force refreshing live data for ${fullName}...` : `Inspecting ${fullName}...`);
  const filterDate = getTimeFilterDate(timeFilter, dateRange);
  const filterEnd = getTimeFilterEnd(timeFilter, dateRange);
  const token = getActiveToken();

  // Step 1: Retrieve or fetch raw repository PRs & maintainers (cached for 10 minutes per timeframe)
  const { data: rawRepoData, isCached, timestamp } = await appCache.getOrFetch(
    rawCacheKey,
    async () => {
    onProgress?.(`Loading activity for ${fullName}…`);
    const contributorsPromise = fetchOfficialContributors(owner, repo);
    const fallback = () => fetchPullRequestsViaRest(
      owner,
      repo,
      fullName,
      filterDate,
      filterEnd,
      token ? (filterDate.getTime() === 0 ? 10 : 20) : (filterDate.getTime() === 0 ? 5 : 10),
      onProgress
    );

    const activityPromise = token
      ? fetchRepoViaGraphQL(owner, repo, filterDate, filterEnd, onProgress).then(async (result) => {
          if (!result) return fallback();
          if (result.rateLimit) {
            broadcastRateLimit({ ...result.rateLimit, isAuthenticated: true });
          }
          return {
            pullRequests: result.pullRequests,
            maintainerLogins: Array.from(result.maintainerLogins),
            totalRepositoryPRs: result.totalRepositoryPRs,
          };
        })
      : fallback();

    const [officialContributors, activity] = await Promise.all([contributorsPromise, activityPromise]);

    return {
      maintainerLogins: activity.maintainerLogins,
      pullRequests: activity.pullRequests,
      totalRepositoryPRs: activity.totalRepositoryPRs || activity.pullRequests.length,
      officialContributors,
    };
  });

  onProgress?.('Putting the project overview together…');

  const maintainerLogins = new Set<string>(rawRepoData.maintainerLogins);
  // Pull requests are already strictly bounded to the requested timeframe at the network layer
  const activePRs = rawRepoData.pullRequests;

  // Map contributors starting with ALL official GitHub commit contributors (90+ contributors)
  const contributorMap = new Map<string, ContributorStats>();
  let totalMergedDurationMinutes = 0;
  let mergedWithDatesCount = 0;

  for (const c of rawRepoData.officialContributors || []) {
    contributorMap.set(c.login.toLowerCase(), {
      username: c.login,
      avatarUrl: c.avatar_url || `https://github.com/${c.login}.png`,
      totalPRs: 0,
      mergedPRs: 0,
      openPRs: 0,
      closedPRs: 0,
      isMaintainer: maintainerLogins.has(c.login),
      contributions: c.contributions,
    });
  }

  // Aggregate pull request statistics across active PRs
  for (const pr of activePRs) {
    const login = pr.user.login;
    const loginKey = login.toLowerCase();
    const existing = contributorMap.get(loginKey) || {
      username: login,
      avatarUrl: pr.user.avatar_url,
      totalPRs: 0,
      mergedPRs: 0,
      openPRs: 0,
      closedPRs: 0,
      isMaintainer: maintainerLogins.has(login),
      authorAssociation: pr.author_association,
      contributions: 0,
    };

    existing.totalPRs++;
    if (pr.merged_at) {
      existing.mergedPRs++;
      const created = parseISO(pr.created_at);
      const merged = parseISO(pr.merged_at);
      const diff = differenceInMinutes(merged, created);
      if (diff >= 0) {
        totalMergedDurationMinutes += diff;
        mergedWithDatesCount++;
      }
    } else if (pr.state === 'open') {
      existing.openPRs++;
    } else {
      existing.closedPRs++;
    }

    if (maintainerLogins.has(login)) {
      existing.isMaintainer = true;
    }

    contributorMap.set(loginKey, existing);
  }

  const contributors = Array.from(contributorMap.values()).sort((a, b) => {
    if (b.totalPRs !== a.totalPRs) {
      return b.totalPRs - a.totalPRs;
    }
    return (b.contributions || 0) - (a.contributions || 0);
  });

  // Calculate metrics
  const totalPRs = activePRs.length;
  const mergedCount = activePRs.filter((p) => p.merged_at !== null).length;
  const openCount = activePRs.filter((p) => p.state === 'open').length;
  const closedCount = activePRs.filter((p) => p.state === 'closed' && p.merged_at === null).length;
  const maintainersCount = contributors.filter((c) => c.isMaintainer).length;
  const contributorsCount = contributors.length - maintainersCount;
  const allTimeContributorsCount = rawRepoData.officialContributors?.length || contributors.length;

  const mergeRatePct = totalPRs > 0 ? Math.round((mergedCount / totalPRs) * 100) : 0;
  const avgMergeTimeHours =
    mergedWithDatesCount > 0 ? Math.round((totalMergedDurationMinutes / mergedWithDatesCount / 60) * 10) / 10 : null;

  const totalRepositoryPRs = rawRepoData.totalRepositoryPRs || rawRepoData.pullRequests.length;
  const isDeepAnalyzed = totalRepositoryPRs > totalPRs;

  const metrics: RepoMetrics = {
    mergeRatePct,
    totalPRs,
    totalRepositoryPRs,
    isDeepAnalyzed,
    mergedCount,
    openCount,
    closedCount,
    maintainersCount,
    contributorsCount,
    allTimeContributorsCount,
    avgMergeTimeHours,
  };

  return {
    owner,
    repo,
    fullName,
    totalPRs,
    totalRepositoryPRs,
    contributors,
    recentPRs: activePRs,
    metrics,
    isCached,
    cachedAt: timestamp,
  };
}

/**
 * Expensive, explicit deep-scan step. File metadata is not requested during
 * the normal repository overview; it is fetched only after the report opens.
 */
export async function fetchDeepFileAnalytics(
  owner: string,
  repo: string,
  pullRequests: PullRequest[],
  onProgress?: (message: string) => void
): Promise<DeepFileAnalytics> {
  const mergedPRs = pullRequests.filter((pr) => Boolean(pr.merged_at));
  const selectedPRs = [...pullRequests]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 40);
  const fileMap = new Map<string, ChangedFileStat>();
  const directoryMap = new Map<string, DirectoryFocusStat>();
  const fileContributors = new Map<string, Set<string>>();
  const directoryContributors = new Map<string, Set<string>>();
  const fileMergeTimes = new Map<string, number[]>();
  const directoryMergeTimes = new Map<string, number[]>();
  const prSizes: DeepFileAnalytics['prSizes'] = [];

  for (let index = 0; index < selectedPRs.length; index += 1) {
    const pr = selectedPRs[index];
    onProgress?.(`Reading changed files (${index + 1} of ${selectedPRs.length})…`);
    try {
      const result = await appCache.getOrFetch(
        `pr_files_${owner}_${repo}_${pr.number}`,
        async () => {
          const { data } = await fetchGitHubApi(`/repos/${owner}/${repo}/pulls/${pr.number}/files?per_page=100`);
          return Array.isArray(data) ? data.map((file: any) => ({
            path: String(file.filename || 'unknown'),
            additions: Number(file.additions || 0),
            deletions: Number(file.deletions || 0),
            changes: Number(file.changes || 0),
          })) : [];
        },
        30 * 60 * 1000
      );

      const fileRows = result.data as Array<{ path: string; additions: number; deletions: number; changes: number }>;
      const mergeTimeHours = pr.merged_at ? Math.max(0, differenceInMinutes(parseISO(pr.merged_at), parseISO(pr.created_at)) / 60) : null;
      if (pr.merged_at) {
        prSizes.push({
          prNumber: pr.number,
          filesChanged: fileRows.length,
          additions: fileRows.reduce((sum, file) => sum + file.additions, 0),
          deletions: fileRows.reduce((sum, file) => sum + file.deletions, 0),
          changes: fileRows.reduce((sum, file) => sum + file.changes, 0),
          mergedAt: pr.merged_at,
          mergeTimeHours,
        });
      }

      for (const file of fileRows) {
        const directory = getDirectory(file.path);
        const current = fileMap.get(file.path) || {
          path: file.path,
          additions: 0,
          deletions: 0,
          changes: 0,
          totalPRs: 0,
          mergedPRs: 0,
          maintainerMergedPRs: 0,
          uniqueContributors: 0,
          medianMergeTimeHours: null,
          prNumbers: [],
        };
        current.additions += file.additions;
        current.deletions += file.deletions;
        current.changes += file.changes;
        current.totalPRs += 1;
        if (pr.merged_at) current.mergedPRs += 1;
        if (pr.merged_at && ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '')) current.maintainerMergedPRs += 1;
        if (!current.prNumbers.includes(pr.number)) current.prNumbers.push(pr.number);
        const fileContributorSet = fileContributors.get(file.path) || new Set<string>();
        fileContributorSet.add(pr.user.login);
        fileContributors.set(file.path, fileContributorSet);
        current.uniqueContributors = fileContributorSet.size;
        if (mergeTimeHours !== null) {
          const mergeTimes = fileMergeTimes.get(file.path) || [];
          mergeTimes.push(mergeTimeHours);
          fileMergeTimes.set(file.path, mergeTimes);
          current.medianMergeTimeHours = medianNumber(mergeTimes);
        }
        fileMap.set(file.path, current);

        const directoryRow = directoryMap.get(directory) || {
          path: directory,
          totalPRs: 0,
          mergedPRs: 0,
          maintainerMergedPRs: 0,
          mergeRatePct: 0,
          additions: 0,
          deletions: 0,
          medianMergeTimeHours: null,
          uniqueContributors: 0,
          prNumbers: [],
        };
        directoryRow.totalPRs += 1;
        if (pr.merged_at) directoryRow.mergedPRs += 1;
        if (pr.merged_at && ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(pr.author_association || '')) directoryRow.maintainerMergedPRs += 1;
        directoryRow.additions += file.additions;
        directoryRow.deletions += file.deletions;
        if (!directoryRow.prNumbers.includes(pr.number)) directoryRow.prNumbers.push(pr.number);
        const directoryContributorSet = directoryContributors.get(directory) || new Set<string>();
        directoryContributorSet.add(pr.user.login);
        directoryContributors.set(directory, directoryContributorSet);
        directoryRow.uniqueContributors = directoryContributorSet.size;
        if (mergeTimeHours !== null) {
          const mergeTimes = directoryMergeTimes.get(directory) || [];
          mergeTimes.push(mergeTimeHours);
          directoryMergeTimes.set(directory, mergeTimes);
          directoryRow.medianMergeTimeHours = medianNumber(mergeTimes);
        }
        directoryRow.mergeRatePct = directoryRow.totalPRs ? Math.round((directoryRow.mergedPRs / directoryRow.totalPRs) * 100) : 0;
        directoryMap.set(directory, directoryRow);
      }
    } catch {
      // A single inaccessible PR should not invalidate the rest of the report.
    }
  }

  return {
    files: Array.from(fileMap.values()).sort((a, b) => b.maintainerMergedPRs - a.maintainerMergedPRs || b.mergedPRs - a.mergedPRs || b.changes - a.changes),
    directories: Array.from(directoryMap.values()).sort((a, b) => b.mergedPRs - a.mergedPRs || b.totalPRs - a.totalPRs || b.additions - a.additions),
    prSizes,
    analyzedMergedPRs: selectedPRs.filter((pr) => Boolean(pr.merged_at)).length,
    availableMergedPRs: mergedPRs.length,
    isPartial: pullRequests.length > selectedPRs.length,
  };
}

function getDirectory(path: string): string {
  const separator = path.indexOf('/');
  return separator === -1 ? '(root)' : path.slice(0, separator);
}

function medianNumber(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return Math.round(sorted[Math.floor((sorted.length - 1) * 0.5)] * 10) / 10;
}

/** Explicit review-event scan used only by the deep report. */
export async function fetchDeepReviewAnalytics(
  owner: string,
  repo: string,
  pullRequests: PullRequest[],
  onProgress?: (message: string) => void
): Promise<DeepReviewAnalytics> {
  const candidates = [...pullRequests]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);
  const rows: DeepReviewAnalytics['rows'] = [];
  const reviewerMap = new Map<string, { reviewedPRs: number; approvals: number }>();

  for (let index = 0; index < candidates.length; index += 1) {
    const pr = candidates[index];
    onProgress?.(`Reading review history (${index + 1} of ${candidates.length})…`);
    try {
      const result = await appCache.getOrFetch(
        `pr_reviews_${owner}_${repo}_${pr.number}`,
        async () => {
          const { data } = await fetchGitHubApi(`/repos/${owner}/${repo}/pulls/${pr.number}/reviews?per_page=100`);
          return Array.isArray(data) ? data : [];
        },
        30 * 60 * 1000
      );
      const reviews = (result.data as any[])
        .filter((review) => review.submitted_at && review.state !== 'PENDING')
        .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
      let commentCount = 0;
      try {
        const commentResult = await appCache.getOrFetch(
          `pr_review_comments_${owner}_${repo}_${pr.number}`,
          async () => {
            const { data } = await fetchGitHubApi(`/repos/${owner}/${repo}/pulls/${pr.number}/comments?per_page=100`);
            return Array.isArray(data) ? data.length : 0;
          },
          30 * 60 * 1000
        );
        commentCount = Number(commentResult.data || 0);
      } catch {
        commentCount = 0;
      }
      const firstReview = reviews[0];
      const maintainerReview = reviews.find((review) => ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(review.author_association || ''));
      const firstApproval = reviews.find((review) => review.state === 'APPROVED');
      const hoursBetween = (timestamp?: string) => timestamp ? Math.max(0, differenceInMinutes(parseISO(timestamp), parseISO(pr.created_at)) / 60) : null;
      const firstApprovalHours = hoursBetween(firstApproval?.submitted_at);
      rows.push({
        prNumber: pr.number,
        firstReviewHours: hoursBetween(firstReview?.submitted_at),
        firstMaintainerReviewHours: hoursBetween(maintainerReview?.submitted_at),
        firstApprovalHours,
        approvalToMergeHours: firstApprovalHours !== null && pr.merged_at ? Math.max(0, differenceInMinutes(parseISO(pr.merged_at), parseISO(firstApproval.submitted_at)) / 60) : null,
        reviewCount: reviews.length,
        approvalCount: reviews.filter((review) => review.state === 'APPROVED').length,
        changesRequestedCount: reviews.filter((review) => review.state === 'CHANGES_REQUESTED').length,
        reviewRounds: reviews.filter((review) => review.state === 'CHANGES_REQUESTED').length,
        commentCount,
        reviewerLogins: Array.from(new Set(reviews.map((review) => review.user?.login).filter(Boolean))).slice(0, 10),
      });
      for (const reviewer of Array.from(new Set(reviews.map((review) => review.user?.login).filter(Boolean)))) {
        const current = reviewerMap.get(reviewer as string) || { reviewedPRs: 0, approvals: 0 };
        current.reviewedPRs++;
        current.approvals += reviews.filter((review) => review.user?.login === reviewer && review.state === 'APPROVED').length;
        reviewerMap.set(reviewer as string, current);
      }
    } catch {
      // Keep partial report availability when an individual PR cannot be read.
    }
  }

  const reviewedPRs = rows.filter((row) => row.reviewCount > 0).length;
  const totalReviewerTouchedPRs = Array.from(reviewerMap.values()).reduce((sum, item) => sum + item.reviewedPRs, 0);
  const topReviewers = Array.from(reviewerMap.entries())
    .map(([username, values]) => ({ username, ...values }))
    .sort((a, b) => b.reviewedPRs - a.reviewedPRs || b.approvals - a.approvals)
    .slice(0, 8);
  const mergeCandidates = candidates.filter((pr) => Boolean(pr.merged_at));
  const closedWithoutMerge = candidates.filter((pr) => pr.state === 'closed' && !pr.merged_at).length;
  return {
    rows,
    scannedPRs: candidates.length,
    availablePRs: pullRequests.length,
    isPartial: pullRequests.length > candidates.length,
    funnel: {
      opened: candidates.length,
      reviewed: reviewedPRs,
      approved: rows.filter((row) => row.approvalCount > 0).length,
      merged: mergeCandidates.length,
      closedWithoutMerge,
      open: candidates.filter((pr) => pr.state === 'open').length,
    },
    topReviewers,
    topReviewerPct: totalReviewerTouchedPRs ? Math.round((topReviewers[0]?.reviewedPRs || 0) / totalReviewerTouchedPRs * 100) : 0,
    topThreeReviewerPct: totalReviewerTouchedPRs ? Math.round((topReviewers.slice(0, 3).reduce((sum, item) => sum + item.reviewedPRs, 0) / totalReviewerTouchedPRs) * 100) : 0,
  };
}

/**
 * Fetch detailed user statistics without exhausting Search API quotas.
 */
export async function fetchUserStats(
  username: string,
  activeRepoStats: RepoStats | null,
  timeFilter: TimeFilter,
  onProgress?: (message: string) => void
): Promise<UserStats> {
  const existingContributor = activeRepoStats?.contributors.find(
    (c) => c.username.toLowerCase() === username.toLowerCase()
  );
  const avatarUrl = existingContributor?.avatarUrl || `https://github.com/${username}.png`;
  const isMaintainerInActiveRepo = existingContributor?.isMaintainer || false;
  const contributions = existingContributor?.contributions;

  let existingPRs = activeRepoStats?.recentPRs.filter(
    (pr) => pr.user.login.toLowerCase() === username.toLowerCase()
  ) || [];

  // If no PRs found in the recent window, attempt an on-demand Search API query to find historical PRs
  if (existingPRs.length === 0 && activeRepoStats?.fullName) {
    try {
      onProgress?.(`Looking up historical pull requests for ${username}…`);
      const { data: searchResults } = await fetchGitHubApi(
        `/search/issues?q=repo:${activeRepoStats.fullName}+type:pr+author:${username}&per_page=30`
      );
      if (searchResults && Array.isArray(searchResults.items) && searchResults.items.length > 0) {
        existingPRs = searchResults.items.map((item: any) => ({
          number: item.number,
          title: item.title,
          state: item.state === 'open' ? 'open' : 'closed',
          created_at: item.created_at,
          merged_at: item.pull_request?.merged_at || (item.state === 'closed' ? item.closed_at : null),
          closed_at: item.closed_at || null,
          html_url: item.html_url,
          repository_url: `https://github.com/${activeRepoStats.fullName}`,
          repository_name: activeRepoStats.fullName,
          author_association: item.author_association || 'NONE',
          labels: [],
          body: null,
          merged_by: null,
          user: {
            login: item.user?.login || username,
            avatar_url: item.user?.avatar_url || avatarUrl,
          },
        }));
      }
    } catch {
      // Non-blocking fallback if search API is rate limited
    }
  }

  const repositories: UserStats['repositories'] = {};
  const totalStats = {
    totalPRs: 0,
    mergedPRs: 0,
    openPRs: 0,
    closedPRs: 0,
  };

  for (const pr of existingPRs) {
    const repoName = pr.repository_name || 'unknown/repo';
    if (!repositories[repoName]) {
      repositories[repoName] = {
        totalPRs: 0,
        mergedPRs: 0,
        openPRs: 0,
        closedPRs: 0,
      };
    }

    repositories[repoName].totalPRs++;
    totalStats.totalPRs++;

    if (pr.merged_at) {
      repositories[repoName].mergedPRs++;
      totalStats.mergedPRs++;
    } else if (pr.state === 'open') {
      repositories[repoName].openPRs++;
      totalStats.openPRs++;
    } else {
      repositories[repoName].closedPRs++;
      totalStats.closedPRs++;
    }
  }

  return {
    username,
    avatarUrl,
    isMaintainer: isMaintainerInActiveRepo,
    contributions,
    totalStats,
    repositories,
    pullRequests: existingPRs,
  };
}

function normalizeOwnerInput(rawInput: string): string {
  const trimmed = rawInput.trim().replace(/^@/, '');
  const parsed = parseGitHubUrl(trimmed);
  if (parsed) return parsed.owner;
  return trimmed.replace(/^https?:\/\/(www\.)?github\.com\//i, '').split('/')[0].trim();
}

/** Fetch a low-cost organization/user overview. Full PR scans remain opt-in. */
export async function fetchOrganizationOverview(
  rawInput: string,
  forceRefresh = false
): Promise<OrganizationStats> {
  const login = normalizeOwnerInput(rawInput);
  if (!/^[A-Za-z0-9_.-]+$/.test(login)) {
    throw new Error('Enter a GitHub organization or username, such as microsoft or octocat.');
  }

  const cacheKey = `owner_overview_${login.toLowerCase()}`;
  const result = await appCache.getOrFetch(
    cacheKey,
    async () => {
      let ownerData: any = null;
      let rawRepos: any[] = [];

      try {
        const response = await fetchGitHubApi(`/orgs/${encodeURIComponent(login)}/repos?per_page=100&sort=stars&direction=desc&type=all`);
        rawRepos = Array.isArray(response.data) ? response.data : [];
        ownerData = await fetchGitHubApi(`/orgs/${encodeURIComponent(login)}`).then((r) => r.data).catch(() => null);
      } catch {
        const response = await fetchGitHubApi(`/users/${encodeURIComponent(login)}/repos?per_page=100&sort=stars&direction=desc&type=owner`);
        rawRepos = Array.isArray(response.data) ? response.data : [];
        ownerData = await fetchGitHubApi(`/users/${encodeURIComponent(login)}`).then((r) => r.data).catch(() => null);
      }

      const repositories: RepositorySummary[] = rawRepos
        .filter((repo) => !repo.archived)
        .sort((a, b) => ((b.stargazers_count || 0) + (b.forks_count || 0)) - ((a.stargazers_count || 0) + (a.forks_count || 0)))
        .slice(0, 20)
        .map((repo) => ({
          fullName: repo.full_name,
          name: repo.name,
          owner: repo.owner?.login || login,
          description: repo.description || null,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          openIssues: repo.open_issues_count || 0,
          language: repo.language || null,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at || null,
          isFork: Boolean(repo.fork),
          htmlUrl: repo.html_url,
        }));

      return {
        login,
        name: ownerData?.name || ownerData?.login || login,
        type: ownerData?.type === 'User' ? 'User' : 'Organization',
        avatarUrl: ownerData?.avatar_url || `https://github.com/${login}.png`,
        repoCount: ownerData?.public_repos ?? rawRepos.length,
        totalStars: rawRepos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0),
        totalOpenIssues: rawRepos.reduce((total, repo) => total + (repo.open_issues_count || 0), 0),
        repositories,
      } satisfies Omit<OrganizationStats, 'isCached' | 'cachedAt'>;
    },
    15 * 60 * 1000,
    forceRefresh
  );

  return { ...result.data, isCached: result.isCached, cachedAt: result.timestamp };
}

/**
 * Check initial rate limit status on app mount
 */
export async function checkCurrentRateLimit(): Promise<RateLimitInfo | null> {
  try {
    const { headers } = await fetchGitHubApi('/rate_limit');
    const token = getActiveToken();
    const limitStr = headers.get('x-ratelimit-limit');
    const remainingStr = headers.get('x-ratelimit-remaining');
    const resetStr = headers.get('x-ratelimit-reset');

    if (limitStr && remainingStr) {
      return {
        limit: parseInt(limitStr, 10),
        remaining: parseInt(remainingStr, 10),
        resetDate: resetStr ? new Date(parseInt(resetStr, 10) * 1000) : null,
        isAuthenticated: Boolean(token),
      };
    }
  } catch (e) {
    // Silent non-blocking fallback
  }
  return null;
}
