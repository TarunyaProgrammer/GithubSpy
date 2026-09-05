export type TimeFilter = '2w' | '1m' | '3m' | '6m' | 'all';

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
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface ApplicantIntelligence {
  feasibilityScore: number; // 0 - 100
  grade: 'PRIME' | 'STRONG' | 'SELECTIVE' | 'CONGESTED';
  competitionDensity: 'Low' | 'Moderate' | 'Fierce';
  competingApplicants: number;
  tacticalTakeaway: string;
  speedPercentile: string;
  maintainerResponsiveness: 'Instant' | 'Active' | 'Moderate' | 'Delayed';
}

export interface RepoMetrics {
  mergeRatePct: number;
  totalPRs: number;
  mergedCount: number;
  openCount: number;
  closedCount: number;
  maintainersCount: number;
  contributorsCount: number;
  avgMergeTimeHours: number | null;
  intelligence: ApplicantIntelligence;
}

export interface RepoStats {
  owner: string;
  repo: string;
  fullName: string;
  totalPRs: number;
  contributors: ContributorStats[];
  recentPRs: PullRequest[];
  metrics: RepoMetrics;
}

export interface UserStats {
  username: string;
  avatarUrl: string;
  isMaintainer: boolean;
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
