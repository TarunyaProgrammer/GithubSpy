interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const STORAGE_PREFIX = 'githubspy_cache_';
const MAX_LOCAL_STORAGE_ITEMS = 30;
const MAX_PERSISTED_ENTRY_CHARS = 750_000;

/**
 * High-performance hybrid LRU & persistent LocalStorage Cache with TTL.
 * Prevents redundant GitHub API requests across page reloads and back-and-forth searches.
 */
class RequestCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();
  private readonly maxEntries: number;
  private generation = 0;

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
      const entries: Array<{ key: string; timestamp: number }> = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) {
          try {
            const item = JSON.parse(localStorage.getItem(k) || '');
            if (!item || now - item.timestamp > item.ttl) {
              localStorage.removeItem(k);
            } else {
              entries.push({ key: k, timestamp: Number(item.timestamp) || 0 });
            }
          } catch {
            localStorage.removeItem(k);
          }
        }
      }
      entries.sort((a, b) => a.timestamp - b.timestamp);
      while (entries.length > MAX_LOCAL_STORAGE_ITEMS) {
        const oldest = entries.shift();
        if (oldest) localStorage.removeItem(oldest.key);
      }
    } catch {
      // Non-blocking storage fallback
    }
  }

  private makePersistentRoom(storageKey: string): void {
    this.cleanupExpiredPersistentEntries();
    try {
      if (localStorage.getItem(storageKey)) return;
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
      }
      if (keys.length < MAX_LOCAL_STORAGE_ITEMS) return;
      keys.sort((a, b) => {
        const readTimestamp = (key: string) => {
          try { return Number(JSON.parse(localStorage.getItem(key) || '{}').timestamp) || 0; }
          catch { return 0; }
        };
        return readTimestamp(a) - readTimestamp(b);
      });
      const oldest = keys.find((key) => key !== storageKey);
      if (oldest) localStorage.removeItem(oldest);
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

  set<T>(key: string, data: T, ttlMs = 10 * 60 * 1000): void {
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
      const storageKey = this.getStorageKey(key);
      const serialized = JSON.stringify(entry);
      if (serialized.length > MAX_PERSISTED_ENTRY_CHARS) {
        localStorage.removeItem(storageKey);
        return;
      }
      this.makePersistentRoom(storageKey);
      localStorage.setItem(storageKey, serialized);
    } catch {
      // If storage quota exceeded, prune older items and retry
      this.cleanupExpiredPersistentEntries();
      try {
        const serialized = JSON.stringify(entry);
        if (serialized.length <= MAX_PERSISTED_ENTRY_CHARS) {
          this.makePersistentRoom(this.getStorageKey(key));
          localStorage.setItem(this.getStorageKey(key), serialized);
        }
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
    ttlMs = 10 * 60 * 1000,
    forceRefresh = false
  ): Promise<{ data: T; isCached: boolean; timestamp: number }> {
    const generation = this.generation;
    if (!forceRefresh) {
      const cached = this.get<T>(key);
      if (cached !== null) {
        return { data: cached.data, isCached: true, timestamp: cached.timestamp };
      }
    }

    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) {
      try {
        const result = await existing;
        return { data: result, isCached: false, timestamp: Date.now() };
      } catch {
        // A caller may have cancelled the shared request. Let this caller retry it.
        if (this.inFlight.get(key) === existing) this.inFlight.delete(key);
      }
    }

    let promise: Promise<T>;
    promise = fetcher()
      .then((result) => {
        if (generation === this.generation) this.set(key, result, ttlMs);
        return result;
      })
      .finally(() => {
        if (this.inFlight.get(key) === promise) this.inFlight.delete(key);
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
    this.generation += 1;
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

