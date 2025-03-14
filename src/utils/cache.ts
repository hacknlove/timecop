interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;  // Individual TTL for each entry
}

export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private defaultTtl: number;

  /**
   * Creates a new cache with default TTL
   * @param defaultTtl Default Time to live in milliseconds
   */
  constructor(defaultTtl: number) {
    this.cache = new Map();
    this.defaultTtl = defaultTtl;
  }

  /**
   * Gets a value from cache
   * @returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Sets a value in cache with optional TTL override
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Optional TTL override
   */
  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl,
    });
  }

  /**
   * Clears expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
} 