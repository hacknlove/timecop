import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Cache } from '../cache';

describe('Cache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should store and retrieve values', () => {
    const cache = new Cache<string>(1000);
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should expire entries after TTL', () => {
    const cache = new Cache<string>(1000); // 1 second TTL
    cache.set('key', 'value');

    vi.advanceTimersByTime(1500); // Advance 1.5 seconds
    expect(cache.get('key')).toBeUndefined();
  });

  it('should respect custom TTL', () => {
    const cache = new Cache<string>(1000); // default 1 second TTL
    cache.set('key1', 'value1'); // uses default TTL
    cache.set('key2', 'value2', 2000); // uses 2 second TTL

    vi.advanceTimersByTime(1500); // Advance 1.5 seconds
    expect(cache.get('key1')).toBeUndefined(); // should be expired
    expect(cache.get('key2')).toBe('value2'); // should still be valid
  });

  it('should cleanup expired entries', () => {
    const cache = new Cache<string>(1000);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    vi.advanceTimersByTime(1500);
    cache.cleanup();

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should keep valid entries during cleanup', () => {
    const cache = new Cache<string>(2000);
    cache.set('key1', 'value1');

    vi.advanceTimersByTime(1000);
    cache.set('key2', 'value2');

    vi.advanceTimersByTime(500);
    cache.cleanup();

    expect(cache.get('key1')).toBe('value1');
    expect(cache.get('key2')).toBe('value2');
  });

  it('should handle mixed TTLs during cleanup', () => {
    const cache = new Cache<string>(1000);
    cache.set('key1', 'value1'); // 1 second TTL
    cache.set('key2', 'value2', 2000); // 2 second TTL

    vi.advanceTimersByTime(1500);
    cache.cleanup();

    expect(cache.get('key1')).toBeUndefined(); // should be cleaned up
    expect(cache.get('key2')).toBe('value2'); // should still be valid
  });
});
