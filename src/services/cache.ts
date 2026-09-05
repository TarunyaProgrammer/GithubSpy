interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const STORAGE_PREFIX = 'githubspy_cache_';
const MAX_LOCAL_STORAGE_ITEMS = 30;

/**
 * High-performance hybrid LRU & persistent LocalStorage Cache with TTL.
 * Prevents redundant GitHub API requests across page reloads and back-and-forth searches.
 */
class RequestCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();
  private readonly maxEntries: number;

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries;
    this.cleanupExpiredPersistentEntries();
  }

  private getStorageKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  private cleanupExpiredPersistentEntries(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(k) || '');
            if (!item || now - item.timestamp > item.ttl) {
              keysToRemove.push(k);
            }
          } catch {
            keysToRemove.push(k);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Non-blocking storage fallback
    }
  }

  get<T>(key: string): { data: T; timestamp: number } | null {
    // 1. Check memory cache
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry) {
      if (Date.now() - memEntry.timestamp <= memEntry.ttl) {
        // Refresh LRU position
        this.memoryCache.delete(key);
        this.memoryCache.set(key, memEntry);
        return { data: memEntry.data, timestamp: memEntry.timestamp };
      }
      this.memoryCache.delete(key);
    }

    // 2. Check persistent localStorage
    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      if (stored) {
        const parsed = JSON.parse(stored) as CacheEntry<T>;
        if (Date.now() - parsed.timestamp <= parsed.ttl) {
          // Promote to memory cache
          this.memoryCache.set(key, parsed);
          return { data: parsed.data, timestamp: parsed.timestamp };
        }
        localStorage.removeItem(this.getStorageKey(key));
      }
    } catch {
      // LocalStorage access disabled or full
    }

    return null;
  }

  set<T>(key: string, data: T, ttlMs = 30 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    // 1. Save to memory cache
    if (this.memoryCache.size >= this.maxEntries) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }
    this.memoryCache.set(key, entry);

    // 2. Persist to localStorage
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
    } catch {
      // If storage quota exceeded, prune older items and retry
      this.cleanupExpiredPersistentEntries();
      try {
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
      } catch {
        // Silent fallback to memory-only
      }
    }
  }

  /**
   * Deduplicates concurrent in-flight calls and returns cached data if fresh.
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 30 * 60 * 1000,
    forceRefresh = false
  ): Promise<{ data: T; isCached: boolean; timestamp: number }> {
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return { data: cached.data, isCached: true, timestamp: cached.timestamp };
      }
    }

    if (this.inFlight.has(key)) {
      const result = await (this.inFlight.get(key) as Promise<T>);
      return { data: result, isCached: false, timestamp: Date.now() };
    }

    const promise = fetcher()
      .then((result) => {
        this.set(key, result, ttlMs);
        return result;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    const data = await promise;
    return { data, isCached: false, timestamp: Date.now() };
  }

  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch {
      // Ignored
    }
  }

  clear(): void {
    this.memoryCache.clear();
    this.inFlight.clear();
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignored
    }
  }
}

export const appCache = new RequestCache(100);

