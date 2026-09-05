import { appCache } from './cache';
import { parseGitHubUrl } from './github';

const RECENT_REPOS_STORAGE_KEY = 'githubspy_recent_urls';
const MAX_RECENT_URLS = 5;

/**
 * Retrieve the last 5 searched repository URLs/names from browser LocalStorage.
 */
export function getRecentRepos(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_REPOS_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, MAX_RECENT_URLS);
    }
  } catch {
    // Non-blocking fallback if LocalStorage is disabled or corrupt
  }
  return [];
}

/**
 * Persist a repository to the recent list in LocalStorage, keeping only the 5 most recent unique entries.
 */
export function addRecentRepo(rawInput: string): string[] {
  if (!rawInput || !rawInput.trim()) return getRecentRepos();

  const parsed = parseGitHubUrl(rawInput);
  const cleanName = parsed ? `${parsed.owner}/${parsed.repo}` : rawInput.trim();

  try {
    const current = getRecentRepos().filter(
      (item) => item.toLowerCase() !== cleanName.toLowerCase()
    );
    const updated = [cleanName, ...current].slice(0, MAX_RECENT_URLS);
    localStorage.setItem(RECENT_REPOS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [cleanName];
  }
}

/**
 * Purges the recent URLs history and frees all cached repository responses from LocalStorage.
 * Keeps personal access token intact so the user doesn't lose their credentials.
 */
export function clearLocalStorageAndHistory(): void {
  try {
    // 1. Clear recent URL history
    localStorage.removeItem(RECENT_REPOS_STORAGE_KEY);

    // 2. Clear application request and repo caches
    appCache.clear();
  } catch {
    // Non-blocking fallback
  }
}
