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
query GetRepoIntelligence($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    nameWithOwner
    pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
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

/**
 * Executes a single atomic GraphQL query to retrieve 100 pull requests,
 * contributor associations, and merge metadata in one roundtrip.
 * Requires an active GitHub token.
 */
export async function fetchRepoViaGraphQL(
  owner: string,
  repo: string
): Promise<{
  pullRequests: PullRequest[];
  maintainerLogins: Set<string>;
  rateLimit?: { limit: number; remaining: number; resetDate: Date };
} | null> {
  const token = getActiveToken();
  if (!token) return null; // GraphQL requires authentication

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'GithubSpy-Terminal',
      },
      body: JSON.stringify({
        query: REPO_INTELLIGENCE_QUERY,
        variables: { owner, name: repo },
      }),
    });

    if (!response.ok) {
      return null; // Fallback to REST
    }

    const result: GraphQLResponse = await response.json();
    if (result.errors || !result.data?.repository) {
      return null; // Fallback to REST on query error or missing scope
    }

    const maintainerLogins = new Set<string>();
    const fullName = `${owner}/${repo}`;
    const nodes = result.data.repository.pullRequests.nodes || [];

    const pullRequests: PullRequest[] = nodes.map((node) => {
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

    let rateLimitInfo;
    if (result.data.rateLimit) {
      rateLimitInfo = {
        limit: result.data.rateLimit.limit,
        remaining: result.data.rateLimit.remaining,
        resetDate: new Date(result.data.rateLimit.resetAt),
      };
    }

    return {
      pullRequests,
      maintainerLogins,
      rateLimit: rateLimitInfo,
    };
  } catch {
    // Network or parse failure, fallback gracefully to REST
    return null;
  }
}
