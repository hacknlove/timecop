"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
class Cache {
    cache;
    defaultTtl;
    /**
     * Creates a new cache with default TTL
     * @param defaultTtl Default Time to live in milliseconds
     */
    constructor(defaultTtl) {
        this.cache = new Map();
        this.defaultTtl = defaultTtl;
    }
    /**
     * Gets a value from cache
     * @returns undefined if not found or expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return undefined;
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
    set(key, value, ttl) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl: ttl ?? this.defaultTtl,
        });
    }
    /**
     * Clears expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
exports.Cache = Cache;
