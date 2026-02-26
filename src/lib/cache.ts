/**
 * In-Memory TTL Cache
 *
 * A simple, server-side in-memory cache with TTL-based expiration.
 * Designed for single-process Node.js — no external dependencies, no locking needed.
 * Safe for use in Next.js API routes and server components.
 *
 * Features:
 * - Per-entry TTL (defaults to constructor-level TTL)
 * - Lazy expiry: stale entries are evicted on get()
 * - Proactive cleanup when size exceeds 500 (removes all expired)
 * - Hard cap at 1000 entries: evicts oldest 100 when limit is reached
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  insertedAt: number; // used for LRU-style eviction when cap is hit
}

export class MemoryCache<T> {
  private readonly store: Map<string, CacheEntry<T>>;
  private readonly defaultTtlMs: number;

  private static readonly CLEANUP_THRESHOLD = 500;
  private static readonly MAX_SIZE = 1000;
  private static readonly EVICT_COUNT = 100;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    this.store = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Store a value under the given key.
   * Triggers a cleanup pass if the store exceeds CLEANUP_THRESHOLD entries.
   * Evicts the oldest EVICT_COUNT entries if the hard cap MAX_SIZE is reached.
   */
  set(key: string, value: T, ttlMs?: number): void {
    const now = Date.now();
    const effectiveTtl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;

    this.store.set(key, {
      value,
      expiresAt: now + effectiveTtl,
      insertedAt: now,
    });

    // Proactive cleanup when store grows past threshold
    if (this.store.size > MemoryCache.CLEANUP_THRESHOLD) {
      this.cleanup();
    }

    // Hard cap: evict the oldest entries if still over the limit
    if (this.store.size > MemoryCache.MAX_SIZE) {
      this.evictOldest(MemoryCache.EVICT_COUNT);
    }
  }

  /**
   * Retrieve a cached value.
   * Returns null if the key does not exist or the entry has expired.
   * Expired entries are deleted on access (lazy eviction).
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (entry === undefined) {
      return null;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Remove a specific key from the cache.
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Remove all entries from the cache.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Return the current number of entries in the store.
   * Note: this count may include not-yet-evicted expired entries.
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Remove all entries that have already expired.
   * Called automatically inside set() when the store is large.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Evict the N oldest entries by insertedAt timestamp.
   * Used as a safety valve when the hard cap is hit after cleanup.
   */
  private evictOldest(count: number): void {
    // Collect and sort entries by insertion time (ascending = oldest first)
    const entries = Array.from(this.store.entries()).sort(
      ([, a], [, b]) => a.insertedAt - b.insertedAt
    );

    const toEvict = entries.slice(0, count);
    for (const [key] of toEvict) {
      this.store.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton instances for shared use across API routes
// ---------------------------------------------------------------------------

/**
 * General-purpose search result cache.
 * TTL: 5 minutes — appropriate for user-facing search queries.
 */
export const searchCache = new MemoryCache<unknown>(5 * 60 * 1000);

/**
 * Eligibility computation cache.
 * TTL: 30 minutes — results are stable across sessions until program data changes.
 */
export const eligibilityCache = new MemoryCache<unknown>(30 * 60 * 1000);
