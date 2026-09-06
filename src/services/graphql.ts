import type { PullRequest } from '../types';
import { getActiveToken } from './token';

interface GraphQLPRNode {
  number: number;
  title: string;
  state: 'OPEN' | 'MERGED' | 'CLOSED';
  createdAt: string;
  mergedAt: string | null;
  closedAt: string | null;
  url: string;
  authorAssociation: string;
  author: {
    login: string;
    avatarUrl: string;
  } | null;
  mergedBy: {
    login: string;
  } | null;
}

interface GraphQLResponse {
  data?: {
    repository?: {
      nameWithOwner: string;
      pullRequests: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: GraphQLPRNode[];
      };
    };
    rateLimit?: {
      limit: number;
      cost: number;
      remaining: number;
      resetAt: string;
    };
  };
  errors?: Array<{ message: string }>;
}

const REPO_INTELLIGENCE_QUERY = `
query GetRepoIntelligence($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    nameWithOwner
    pullRequests(first: 100, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        number
        title
        state
        createdAt
        mergedAt
        closedAt
        url
        authorAssociation
        author {
          login
          avatarUrl
        }
        mergedBy {
          login
        }
      }
    }
  }
  rateLimit {
    limit
    cost
    remaining
    resetAt
  }
}
`;

const MAX_TIMEFRAME_PAGES = 20; // Up to 2,000 PRs for exact 2w/1m/3m/6m timeframes
const MAX_ALL_PAGES = 10; // Up to 1,000 PRs for all-time view

/**
 * Executes paginated GraphQL queries until the entire specified timeframe
 * is exhaustively retrieved (for 2w, 1m, 3m, 6m) or up to 1,000 PRs for all-time.
 */
export async function fetchRepoViaGraphQL(
  owner: string,
  repo: string,
  filterDate: Date,
  onProgress?: (message: string) => void
): Promise<{
  pullRequests: PullRequest[];
  maintainerLogins: Set<string>;
  totalRepositoryPRs: number;
  rateLimit?: { limit: number; remaining: number; resetDate: Date };
} | null> {
  const token = getActiveToken();
  if (!token) return null; // GraphQL requires authentication

  try {
    const maintainerLogins = new Set<string>();
    const fullName = `${owner}/${repo}`;
    const allNodes: GraphQLPRNode[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;
    let pageCount = 0;
    let totalRepoPRs = 0;
    let lastRateLimit: { limit: number; remaining: number; resetDate: Date } | undefined;

    const isAllTime = filterDate.getTime() === 0;
    const maxPages = isAllTime ? MAX_ALL_PAGES : MAX_TIMEFRAME_PAGES;

    while (hasNextPage && pageCount < maxPages) {
      pageCount++;
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'GithubSpy-Terminal',
        },
        body: JSON.stringify({
          query: REPO_INTELLIGENCE_QUERY,
          variables: { owner, name: repo, cursor },
        }),
      });

      if (!response.ok) {
        if (allNodes.length > 0) break; // Partial success, use what we have
        return null; // Fallback to REST
      }

      const result: GraphQLResponse = await response.json();
      if (result.errors || !result.data?.repository) {
        if (allNodes.length > 0) break;
        return null;
      }

      const prData = result.data.repository.pullRequests;
      totalRepoPRs = prData.totalCount || 0;
      const nodes = prData.nodes || [];

      if (result.data.rateLimit) {
        lastRateLimit = {
          limit: result.data.rateLimit.limit,
          remaining: result.data.rateLimit.remaining,
          resetDate: new Date(result.data.rateLimit.resetAt),
        };
      }

      let crossedDateBoundary = false;
      for (const node of nodes) {
        const createdTime = new Date(node.createdAt).getTime();
        // If outside timeframe, we have crossed the boundary
        if (!isAllTime && createdTime < filterDate.getTime()) {
          crossedDateBoundary = true;
          break; // Stop collecting older PRs
        }
        allNodes.push(node);
      }

      onProgress?.(
        isAllTime
          ? `Analyzing all-time contributions (${allNodes.length} of ${Math.min(totalRepoPRs, MAX_ALL_PAGES * 100)})…`
          : `Analyzing contributions in timeframe (${allNodes.length} captured)…`
      );

      // If we crossed the date boundary, all older PRs in the repository are also outside the window!
      if (crossedDateBoundary) {
        break;
      }

      hasNextPage = Boolean(prData.pageInfo?.hasNextPage && prData.pageInfo?.endCursor);
      cursor = prData.pageInfo?.endCursor || null;

      if (nodes.length === 0) break;
    }

    const pullRequests: PullRequest[] = allNodes.map((node) => {
      const authorLogin = node.author?.login || 'ghost';
      const authorAvatar = node.author?.avatarUrl || 'https://github.com/identicons/placeholder.png';
      const association = node.authorAssociation || 'NONE';

      const isMaintainer = ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(association);
      if (isMaintainer) {
        maintainerLogins.add(authorLogin);
      }
      if (node.mergedBy?.login) {
        maintainerLogins.add(node.mergedBy.login);
      }

      return {
        number: node.number,
        title: node.title,
        state: node.state === 'OPEN' ? 'open' : 'closed',
        created_at: node.createdAt,
        merged_at: node.mergedAt,
        closed_at: node.closedAt,
        html_url: node.url,
        repository_url: `https://github.com/${fullName}`,
        repository_name: fullName,
        author_association: association,
        user: {
          login: authorLogin,
          avatar_url: authorAvatar,
        },
      };
    });

    return {
      pullRequests,
      maintainerLogins,
      totalRepositoryPRs: totalRepoPRs || pullRequests.length,
      rateLimit: lastRateLimit,
    };
  } catch {
    // Network or parse failure, fallback gracefully to REST
    return null;
  }
}
