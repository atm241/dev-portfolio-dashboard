import { describe, expect, it, vi } from 'vitest';
import { TtlCache } from '../services/cache.js';

describe('TtlCache', () => {
  it('returns cached values within the TTL and refetches after expiry', async () => {
    vi.useFakeTimers();
    const cache = new TtlCache(1000);
    const fetcher = vi.fn().mockResolvedValue('fresh');

    expect(await cache.getOrFetch('k', fetcher)).toBe('fresh');
    expect(await cache.getOrFetch('k', fetcher)).toBe('fresh');
    expect(fetcher).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1001);
    expect(await cache.getOrFetch('k', fetcher)).toBe('fresh');
    expect(fetcher).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not cache rejected fetches', async () => {
    const cache = new TtlCache(1000);
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue('ok');

    await expect(cache.getOrFetch('k', fetcher)).rejects.toThrow('boom');
    expect(await cache.getOrFetch('k', fetcher)).toBe('ok');
  });
});
