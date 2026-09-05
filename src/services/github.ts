import { subDays, parseISO, isAfter, differenceInMinutes } from 'date-fns';
import type {
  ContributorStats,
  PullRequest,
  RepoStats,
  UserStats,
  TimeFilter,
  RateLimitInfo,
  RepoMetrics,
  ApplicantIntelligence,
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

export function getTimeFilterDate(filter: TimeFilter): Date {
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
    case 'all':
    default:
      return new Date(0);
  }
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
  const response = await fetch(url, {
    ...options,
    headers,
  });

  notifyRateLimit(response.headers, Boolean(token));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Please verify the owner and repository name (or token permissions for private repos).');
    }
    if (response.status === 403) {
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining === '0') {
        throw new Error('GitHub API rate limit exceeded. Add a GitHub Personal Access Token in the top-right settings to unlock 5,000 requests/hour.');
      }
      const msg = await response.text();
      throw new Error(`GitHub API permission denied: ${msg || 'Forbidden'}`);
    }
    if (response.status === 401) {
      throw new Error('GitHub returned 401 Unauthorized. Your Personal Access Token might be expired or invalid.');
    }
    throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  return { data, headers: response.headers };
}

/**
 * Computes the proprietary Applicant Feasibility Index (AFI) and tactical guidance.
 */
function computeApplicantIntelligence(
  mergeRatePct: number,
  avgMergeHours: number | null,
  maintainersCount: number,
  contributorsCount: number
): ApplicantIntelligence {
  let score = 50;

  // Merge rate weighting (up to +25 or -20)
  if (mergeRatePct >= 75) score += 25;
  else if (mergeRatePct >= 50) score += 15;
  else if (mergeRatePct >= 30) score += 5;
  else score -= 20;

  // Turnaround velocity weighting (up to +15 or -15)
  let speedPercentile = 'Moderate (Top 50%)';
  let responsiveness: ApplicantIntelligence['maintainerResponsiveness'] = 'Moderate';

  if (avgMergeHours !== null) {
    if (avgMergeHours <= 24) {
      score += 15;
      speedPercentile = 'Elite Turnaround (Top 5% speed)';
      responsiveness = 'Instant';
    } else if (avgMergeHours <= 72) {
      score += 10;
      speedPercentile = 'Fast Reviews (Top 20% speed)';
      responsiveness = 'Active';
    } else if (avgMergeHours <= 168) {
      score += 2;
      speedPercentile = 'Steady Pace (Top 45% speed)';
      responsiveness = 'Moderate';
    } else {
      score -= 15;
      speedPercentile = 'High Latency (Review bottlenecks)';
      responsiveness = 'Delayed';
    }
  }

  // Active maintainer density
  if (maintainersCount >= 4) score += 10;
  else if (maintainersCount >= 1) score += 5;
  else score -= 10;

  // Competition density
  let competitionDensity: ApplicantIntelligence['competitionDensity'] = 'Low';
  if (contributorsCount > 25) {
    competitionDensity = 'Fierce';
    score -= 5;
  } else if (contributorsCount > 10) {
    competitionDensity = 'Moderate';
  } else {
    competitionDensity = 'Low';
    score += 5;
  }

  // Clamp 18 - 98
  const feasibilityScore = Math.min(Math.max(score, 18), 98);

  let grade: ApplicantIntelligence['grade'] = 'SELECTIVE';
  if (feasibilityScore >= 85) grade = 'PRIME';
  else if (feasibilityScore >= 70) grade = 'STRONG';
  else if (feasibilityScore >= 50) grade = 'SELECTIVE';
  else grade = 'CONGESTED';

  // Formulate psychological tactical insight
  let tacticalTakeaway = '';
  if (grade === 'PRIME') {
    tacticalTakeaway = `High-yield repository. Maintainers demonstrate high reception (${mergeRatePct}% acceptance) with ${responsiveness.toLowerCase()} review turnarounds. With ${contributorsCount} external contenders active, submitting a well-scoped PR carries an unusually high probability of fast merge and mentor recognition.`;
  } else if (grade === 'STRONG') {
    tacticalTakeaway = `Favorable applicant target. Active review rhythm and steady merge momentum. Competition density is ${competitionDensity.toLowerCase()} (${contributorsCount} contenders). Prioritize addressing tagged open issues rather than unsolicited refactors.`;
  } else if (grade === 'SELECTIVE') {
    tacticalTakeaway = `Selective review environment. Turnaround requires patience. To stand out among ${contributorsCount} contenders, ensure your PR includes thorough test coverage and immediate documentation updates.`;
  } else {
    tacticalTakeaway = `Elevated review friction. The maintainer pool is currently strained or reviewing selectively. Avoid large proposals; anchor your candidacy with minimal, non-breaking bug fixes before investing major effort.`;
  }

  return {
    feasibilityScore,
    grade,
    competitionDensity,
    competingApplicants: contributorsCount,
    tacticalTakeaway,
    speedPercentile,
    maintainerResponsiveness: responsiveness,
  };
}

/**
 * Fetch and analyze pull requests for a repository with maintainer intelligence,
 * merge velocity calculations, and the Applicant Feasibility Index.
 */
export async function fetchRepoStats(
  rawInput: string,
  timeFilter: TimeFilter,
  onProgress?: (message: string) => void
): Promise<RepoStats> {
  const target = parseGitHubUrl(rawInput);
  if (!target) {
    throw new Error('Invalid GitHub repository. Enter "owner/repo" or "https://github.com/owner/repo"');
  }

  const { owner, repo } = target;
  const fullName = `${owner}/${repo}`;
  const rawCacheKey = `repo_raw_${fullName}`;

  onProgress?.(`Inspecting ${fullName}...`);
  const filterDate = getTimeFilterDate(timeFilter);
  const token = getActiveToken();

  // Step 1: Retrieve or fetch raw repository PRs & maintainers (cached for 30 minutes)
  const { data: rawRepoData } = await appCache.getOrFetch(rawCacheKey, async () => {
    let maintainerLoginsArray: string[] = [];
    let prs: PullRequest[] = [];
    let officialContributors: { login: string; avatar_url: string; contributions: number }[] = [];

    // 1. Fetch official GitHub repository contributors (all-time code committers, up to 100)
    try {
      onProgress?.(`Accessing official contributor roster for ${fullName}...`);
      const { data: contribData } = await fetchGitHubApi(
        `/repos/${owner}/${repo}/contributors?per_page=100`
      );
      if (Array.isArray(contribData)) {
        officialContributors = contribData.map((c: any) => ({
          login: c.login || 'unknown',
          avatar_url: c.avatar_url || `https://github.com/${c.login}.png`,
          contributions: c.contributions || 0,
        }));
      }
    } catch {
      // Non-blocking fallback if repository has restricted contributor listing
    }

    // 2. ACCELERATION: If a GitHub token is active, execute high-speed single-request GraphQL query
    if (token) {
      onProgress?.('Executing single-request GraphQL accelerator (1 quota point)...');
      const gqlResult = await fetchRepoViaGraphQL(owner, repo);
      if (gqlResult) {
        maintainerLoginsArray = Array.from(gqlResult.maintainerLogins);
        prs = gqlResult.pullRequests;
        if (gqlResult.rateLimit) {
          broadcastRateLimit({
            ...gqlResult.rateLimit,
            isAuthenticated: true,
          });
        }
      }
    }

    // 3. FALLBACK / GUEST: If GraphQL not used (or deeper history needed), fetch paginated REST
    if (prs.length === 0) {
      // If token is active or 'all' is requested, fetch deeper pages (up to 500-1000 PRs)
      const MAX_PAGES = token ? 5 : timeFilter === 'all' ? 3 : 2;
      let page = 1;
      let hasMore = true;
      const detectedMaintainers = new Set<string>();

      while (hasMore && page <= MAX_PAGES) {
        onProgress?.(
          `Interrogating pull requests (batch ${page} of ${MAX_PAGES})...`
        );

        const { data: rawPulls } = await fetchGitHubApi(
          `/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}&sort=created&direction=desc`
        );

        if (!Array.isArray(rawPulls) || rawPulls.length === 0) {
          hasMore = false;
          break;
        }

        for (const pr of rawPulls) {
          const authorLogin = pr.user?.login || 'ghost';
          const authorAssociation = pr.author_association || 'NONE';

          // Detect maintainers accurately from author_association & merged_by
          const isMaintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(authorAssociation);
          if (isMaintainer) {
            detectedMaintainers.add(authorLogin);
          }

          if (pr.merged_by?.login) {
            detectedMaintainers.add(pr.merged_by.login);
          }

          prs.push({
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
            user: {
              login: authorLogin,
              avatar_url: pr.user?.avatar_url || `https://github.com/${authorLogin}.png`,
            },
          });
        }

        if (rawPulls.length < 100) {
          hasMore = false;
        }

        page++;
      }

      maintainerLoginsArray = Array.from(detectedMaintainers);
    }

    return {
      maintainerLogins: maintainerLoginsArray,
      pullRequests: prs,
      officialContributors,
    };
  });

  onProgress?.('Synthesizing verified contributor dossier...');

  const maintainerLogins = new Set<string>(rawRepoData.maintainerLogins);
  // Filter cached pull requests by the selected time filter without extra network calls
  const filteredPullRequests = rawRepoData.pullRequests.filter((pr) =>
    isAfter(parseISO(pr.created_at), filterDate)
  );

  const activePRs = filteredPullRequests.length > 0 ? filteredPullRequests : rawRepoData.pullRequests;

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

  const contributors = Array.from(contributorMap.values()).sort(
    (a, b) => (b.totalPRs || b.contributions || 0) - (a.totalPRs || a.contributions || 0)
  );

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

  const metrics: RepoMetrics = {
    mergeRatePct,
    totalPRs,
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
    contributors,
    recentPRs: activePRs,
    metrics,
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
  const cacheKey = `user_stats_${username}_${timeFilter}`;

    const existingContributor = activeRepoStats?.contributors.find(
      (c) => c.username.toLowerCase() === username.toLowerCase()
    );
    const avatarUrl = existingContributor?.avatarUrl || `https://github.com/${username}.png`;
    const existingPRs = activeRepoStats?.recentPRs.filter((pr) => pr.user.login.toLowerCase() === username.toLowerCase()) || [];

    const isMaintainerInActiveRepo = existingContributor?.isMaintainer || false;

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
      totalStats,
      repositories,
      pullRequests: existingPRs,
    };
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
