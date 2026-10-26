export type TimeFilter = '2w' | '1m' | '3m' | '6m' | 'all' | 'custom';

export interface DateRange {
  from: string;
  to: string;
}

export type RoleFilter = 'all' | 'contributors_only' | 'maintainers_only';

export interface ContributorStats {
  username: string;
  avatarUrl: string;
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  closedPRs: number;
  isMaintainer: boolean;
  authorAssociation?: string;
  contributions?: number;
}

export interface PullRequest {
  number: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  html_url: string;
  repository_url: string;
  repository_name?: string;
  author_association?: string;
  labels?: string[];
  body?: string | null;
  merged_by?: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface DeepAnalyticsSummary {
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  closedPRs: number;
  averageMergeTimeHours: number | null;
  medianMergeTimeHours: number | null;
  p75MergeTimeHours: number | null;
  oldestOpenPRHours: number | null;
  activeDays: number;
  maintainerAuthoredPct: number;
  topMaintainerActivity: Array<{ username: string; mergedPRs: number; totalPRs: number }>;
  topicCandidates: Array<{ topic: string; mentions: number; mergedMentions: number; prNumbers: number[] }>;
  activityTimeline: Array<{ label: string; opened: number; merged: number; closed: number }>;
  mergeTimeBuckets: Array<{ label: string; count: number }>;
  openAgeBuckets: Array<{ label: string; count: number }>;
}

export interface AIInsightTopic {
  topic: string;
  summary: string;
  evidencePRNumbers: number[];
  mergedPRCount: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface AIRepositoryAnalysis {
  summary: string;
  focusAreas: AIInsightTopic[];
  maintainerPatterns: string[];
  caveats: string[];
  analyzedPRNumbers: number[];
  provider: string;
  model: string;
  generatedAt: string;
}

export interface ChangedFileStat {
  path: string;
  additions: number;
  deletions: number;
  changes: number;
  mergedPRs: number;
  maintainerMergedPRs: number;
  prNumbers: number[];
}

export interface DeepFileAnalytics {
  files: ChangedFileStat[];
  prSizes: Array<{ prNumber: number; filesChanged: number; additions: number; deletions: number; changes: number; mergedAt: string | null; mergeTimeHours: number | null }>;
  analyzedMergedPRs: number;
  availableMergedPRs: number;
  isPartial: boolean;
}

export interface ReviewResponseRow {
  prNumber: number;
  firstReviewHours: number | null;
  firstMaintainerReviewHours: number | null;
  reviewCount: number;
  approvalCount: number;
  changesRequestedCount: number;
  reviewerLogins: string[];
}

export interface DeepReviewAnalytics {
  rows: ReviewResponseRow[];
  scannedPRs: number;
  availablePRs: number;
  isPartial: boolean;
}

export interface RepoMetrics {
  mergeRatePct: number;
  totalPRs: number;
  totalRepositoryPRs?: number;
  isDeepAnalyzed?: boolean;
  mergedCount: number;
  openCount: number;
  closedCount: number;
  maintainersCount: number;
  contributorsCount: number;
  allTimeContributorsCount?: number;
  avgMergeTimeHours: number | null;
}

export interface RepoStats {
  owner: string;
  repo: string;
  fullName: string;
  totalPRs: number;
  totalRepositoryPRs?: number;
  contributors: ContributorStats[];
  recentPRs: PullRequest[];
  metrics: RepoMetrics;
  isCached?: boolean;
  cachedAt?: number;
}

export interface UserStats {
  username: string;
  avatarUrl: string;
  isMaintainer: boolean;
  contributions?: number;
  totalStats: {
    totalPRs: number;
    mergedPRs: number;
    openPRs: number;
    closedPRs: number;
  };
  repositories: {
    [key: string]: {
      totalPRs: number;
      mergedPRs: number;
      openPRs: number;
      closedPRs: number;
    };
  };
  pullRequests: PullRequest[];
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetDate: Date | null;
  isAuthenticated: boolean;
}

export interface RepositorySummary {
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  updatedAt: string;
  pushedAt: string | null;
  isFork: boolean;
  htmlUrl: string;
}

export interface OrganizationStats {
  login: string;
  name: string;
  type: 'Organization' | 'User';
  avatarUrl: string;
  repoCount: number;
  totalStars: number;
  totalOpenIssues: number;
  repositories: RepositorySummary[];
  isCached?: boolean;
  cachedAt?: number;
}
