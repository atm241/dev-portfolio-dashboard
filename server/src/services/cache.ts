interface Entry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Minimal in-memory TTL cache. External APIs (GitHub, LeetCode) are rate
 * limited, so responses are held for `ttlMs` before re-fetching.
 */
export class TtlCache {
  private store = new Map<string, Entry<unknown>>();

  constructor(private ttlMs: number) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  async getOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await fetcher();
    this.set(key, value);
    return value;
  }
}

export const apiCache = new TtlCache(10 * 60 * 1000);
