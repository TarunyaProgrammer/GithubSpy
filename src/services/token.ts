const TOKEN_STORAGE_KEY = 'githubspy_pat';

/**
 * Clean and sanitize a GitHub token to avoid silent 401s from whitespace/quotes.
 */
export function sanitizeToken(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '');
}

/**
 * Get active token:
 * 1. User's personal token from localStorage (highest priority)
 * 2. Pre-configured environment token (VITE_GITHUB_TOKEN) if provided
 */
export function getActiveToken(): string | null {
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (localToken) {
    const cleaned = sanitizeToken(localToken);
    if (cleaned.length > 0) return cleaned;
  }

  const envToken = import.meta.env.VITE_GITHUB_TOKEN;
  if (envToken && typeof envToken === 'string') {
    const cleaned = sanitizeToken(envToken);
    if (cleaned.length > 0) return cleaned;
  }

  return null;
}

export function hasPersonalToken(): boolean {
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
  return Boolean(localToken && sanitizeToken(localToken).length > 0);
}

export function savePersonalToken(token: string): void {
  const cleaned = sanitizeToken(token);
  localStorage.setItem(TOKEN_STORAGE_KEY, cleaned);
}

export function removePersonalToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Validate token with GitHub API
 */
export async function testTokenValidity(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
  const cleaned = sanitizeToken(token);
  if (!cleaned) {
    return { valid: false, error: 'Token is empty' };
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${cleaned}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      return { valid: true, username: data.login };
    }

    if (response.status === 401) {
      return { valid: false, error: 'Invalid or expired token (401 Unauthorized)' };
    }

    return { valid: false, error: `GitHub returned status ${response.status}` };
  } catch (err) {
    return { valid: false, error: err instanceof Error ? err.message : 'Network request failed' };
  }
}
