import { fetchWithTimeout } from './request';

const TOKEN_STORAGE_KEY = 'githubspy_pat';

/**
 * Clean and sanitize a GitHub token to avoid silent 401s from whitespace/quotes.
 */
export function sanitizeToken(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '');
}

/** Personal tokens stay in this browser and are sent directly to GitHub. */
export function getActiveToken(): string | null {
  try {
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (localToken) {
      const cleaned = sanitizeToken(localToken);
      if (cleaned.length > 0) return cleaned;
    }
  } catch {
    // Non-blocking fallback if storage is restricted
  }

  return null;
}

export function getTokenCacheScope(token = getActiveToken()): string {
  if (!token) return 'public';
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash = Math.imul(hash ^ token.charCodeAt(index), 16777619);
  }
  return `token-${(hash >>> 0).toString(36)}`;
}

export function hasPersonalToken(): boolean {
  try {
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    return Boolean(localToken && sanitizeToken(localToken).length > 0);
  } catch {
    return false;
  }
}

export function savePersonalToken(token: string): boolean {
  try {
    const cleaned = sanitizeToken(token);
    if (!cleaned) return false;
    localStorage.setItem(TOKEN_STORAGE_KEY, cleaned);
    return localStorage.getItem(TOKEN_STORAGE_KEY) === cleaned;
  } catch {
    return false;
  }
}

export function removePersonalToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Return a safe, masked representation of the active personal token
 * (e.g. "ghp_••••••••ab12") for UI confirmation without revealing secrets.
 */
export function getMaskedToken(): string | null {
  try {
    const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!localToken) return null;
    const cleaned = sanitizeToken(localToken);
    if (!cleaned) return null;

    if (cleaned.length <= 8) {
      return '••••••••';
    }
    const prefix = cleaned.slice(0, 4);
    const suffix = cleaned.slice(-4);
    return `${prefix}••••••••${suffix}`;
  } catch {
    return null;
  }
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
    const response = await fetchWithTimeout('https://api.github.com/user', {
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
