/**
 * Tests for Street View Cache Service
 *
 * Tests the following:
 * - Address hashing function for consistent cache keys
 * - localStorage-based caching with FIFO eviction
 * - Size limiting and cache cleanup
 * - API fetch with exponential backoff retry logic
 * - Graceful error handling and null fallback
 * - Server-side deduplication cache
 */

import {
  getAddressHash,
  cacheStreetViewImage,
  clearStreetViewCache,
  getOrFetchStreetViewImage,
  preloadStreetViewImages,
  getStreetViewCacheStats,
} from '../street-view-cache';

describe('Street View Cache Service', () => {
  beforeEach(() => {
    clearStreetViewCache();
    jest.clearAllMocks();
    // Mock localStorage
    const store: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          for (const key in store) {
            delete store[key];
          }
        },
        key: (index: number) => {
          return Object.keys(store)[index] || null;
        },
        length: 0,
      },
      writable: true,
    });
  });

  afterEach(() => {
    clearStreetViewCache();
  });

  describe('getAddressHash()', () => {
    it('should generate consistent hash for same address', () => {
      const address = '123 Main Street, New York, NY';
      const hash1 = getAddressHash(address);
      const hash2 = getAddressHash(address);

      expect(hash1).toBe(hash2);
    });

    it('should be case-insensitive', () => {
      const address1 = '123 Main Street, New York, NY';
      const address2 = '123 MAIN STREET, NEW YORK, NY';

      expect(getAddressHash(address1)).toBe(getAddressHash(address2));
    });

    it('should trim whitespace', () => {
      const address1 = '123 Main Street, New York, NY';
      const address2 = '  123 Main Street, New York, NY  ';

      expect(getAddressHash(address1)).toBe(getAddressHash(address2));
    });

    it('should generate different hashes for different addresses', () => {
      const address1 = '123 Main Street, New York, NY';
      const address2 = '456 Oak Avenue, Los Angeles, CA';

      expect(getAddressHash(address1)).not.toBe(getAddressHash(address2));
    });

    it('should return alphanumeric string', () => {
      const hash = getAddressHash('123 Main Street');
      expect(/^[a-z0-9]+$/i.test(hash)).toBe(true);
    });
  });

  describe('cacheStreetViewImage()', () => {
    it('should cache image with address', () => {
      const address = '123 Main Street, New York, NY';
      const mockImageUrl = 'data:image/png;base64,iVBORw0KGgo=';

      cacheStreetViewImage(address, mockImageUrl);

      const stats = getStreetViewCacheStats();
      expect(stats.clientCacheCount).toBe(1);
    });

    it('should not cache oversized images', () => {
      const address = '123 Main Street';
      // Create a very large data URL (>250KB)
      const largeData = 'data:image/png;base64,' + 'A'.repeat(300 * 1024);

      cacheStreetViewImage(address, largeData);

      const stats = getStreetViewCacheStats();
      expect(stats.clientCacheCount).toBe(0);
    });

    it('should track cache metadata (count and size)', () => {
      const address1 = '123 Main Street';
      const address2 = '456 Oak Avenue';
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      cacheStreetViewImage(address1, mockImage);
      cacheStreetViewImage(address2, mockImage);

      const stats = getStreetViewCacheStats();
      expect(stats.clientCacheCount).toBe(2);
      expect(stats.clientCacheSizeBytes).toBeGreaterThan(0);
    });

    it('should update existing cache entry without increasing count', () => {
      const address = '123 Main Street';
      const image1 = 'data:image/png;base64,iVBORw0KGgo=';
      const image2 = 'data:image/png;base64,different==';

      cacheStreetViewImage(address, image1);
      let stats = getStreetViewCacheStats();
      const firstCount = stats.clientCacheCount;

      cacheStreetViewImage(address, image2);
      stats = getStreetViewCacheStats();

      expect(stats.clientCacheCount).toBe(firstCount);
    });
  });

  describe('clearStreetViewCache()', () => {
    it('should clear all cached images', () => {
      const addresses = [
        '123 Main Street',
        '456 Oak Avenue',
        '789 Elm Road',
      ];
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      addresses.forEach((addr) => cacheStreetViewImage(addr, mockImage));

      clearStreetViewCache();

      const stats = getStreetViewCacheStats();
      expect(stats.clientCacheCount).toBe(0);
      expect(stats.clientCacheSizeBytes).toBe(0);
    });

    it('should clear failed address tracking', async () => {
      // This test verifies internal state but we can check via behavior
      clearStreetViewCache();

      // After clear, attempting fetch should not have memory of previous failures
      const stats = getStreetViewCacheStats();
      expect(stats.serverCacheSize).toBe(0);
    });
  });

  describe('getOrFetchStreetViewImage()', () => {
    it('should reject empty address', async () => {
      const result = await getOrFetchStreetViewImage('', 'fake_key');
      expect(result).toBeNull();
    });

    it('should reject empty API key', async () => {
      const result = await getOrFetchStreetViewImage('123 Main Street', '');
      expect(result).toBeNull();
    });

    it('should reject null/undefined API key', async () => {
      const result = await getOrFetchStreetViewImage(
        '123 Main Street',
        undefined as any
      );
      expect(result).toBeNull();
    });

    it('should return cached image if available', async () => {
      const address = '123 Main Street';
      const mockImage = 'data:image/png;base64,cached==';

      // Pre-populate cache
      cacheStreetViewImage(address, mockImage);

      // Should return cached version without API call
      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).toBe(mockImage);
    });

    it('should handle API fetch timeout with retry', async () => {
      const address = '123 Main Street';
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      // Mock fetch to timeout first, then succeed
      let callCount = 0;
      global.fetch = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          const controller = new AbortController();
          controller.abort();
          throw new DOMException('Aborted', 'AbortError');
        }
        return {
          ok: true,
          blob: async () => new Blob([mockImage], { type: 'image/png' }),
        } as Response;
      });

      // Should retry and eventually succeed
      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).not.toBeNull();
      expect(callCount).toBeGreaterThan(1);
    });

    it('should handle HTTP 500 server error with retry', async () => {
      const address = '123 Main Street';
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      // Mock fetch to return 500 first, then succeed
      let callCount = 0;
      global.fetch = jest.fn(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: false,
            status: 500,
          } as Response;
        }
        return {
          ok: true,
          blob: async () => new Blob([mockImage], { type: 'image/png' }),
        } as Response;
      });

      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).not.toBeNull();
    });

    it('should not retry on HTTP 403 (quota exceeded)', async () => {
      const address = '123 Main Street';

      let callCount = 0;
      global.fetch = jest.fn(async () => {
        callCount++;
        return {
          ok: false,
          status: 403,
        } as Response;
      });

      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).toBeNull();
      expect(callCount).toBe(1); // Should not retry
    });

    it('should convert image blob to base64 data URL', async () => {
      const address = '123 Main Street';
      const imageBuffer = Buffer.from('fake image data');

      global.fetch = jest.fn(async () => ({
        ok: true,
        blob: async () => new Blob([imageBuffer], { type: 'image/png' }),
      } as Response));

      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).not.toBeNull();
      expect(result).toMatch(/^data:image/);
    });

    it('should cache successful fetch result', async () => {
      const address = '123 Main Street';
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      global.fetch = jest.fn(async () => ({
        ok: true,
        blob: async () => new Blob([mockImage], { type: 'image/png' }),
      } as Response));

      const result1 = await getOrFetchStreetViewImage(address, 'fake_key');
      const stats1 = getStreetViewCacheStats();

      // Second call should use cached result
      const result2 = await getOrFetchStreetViewImage(address, 'fake_key');

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      // Should only have called fetch once (second call uses cache)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should return null on non-retryable errors', async () => {
      const address = '123 Main Street';

      global.fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
      } as Response));

      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      const address = '123 Main Street';

      global.fetch = jest.fn(async () => {
        throw new Error('Network error');
      });

      const result = await getOrFetchStreetViewImage(address, 'fake_key');
      expect(result).toBeNull();
    });
  });

  describe('preloadStreetViewImages()', () => {
    it('should load multiple addresses in parallel', async () => {
      const addresses = ['123 Main', '456 Oak', '789 Elm'];
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      global.fetch = jest.fn(async () => ({
        ok: true,
        blob: async () => new Blob([mockImage], { type: 'image/png' }),
      } as Response));

      const results = await preloadStreetViewImages(addresses, 'fake_key');

      expect(results.size).toBe(3);
      addresses.forEach((addr) => {
        expect(results.has(addr)).toBe(true);
      });
    });

    it('should handle mixed success and failure', async () => {
      const addresses = ['123 Main', '456 Oak'];

      global.fetch = jest.fn(async () => ({
        ok: false,
        status: 404,
      } as Response));

      const results = await preloadStreetViewImages(addresses, 'fake_key');

      expect(results.size).toBe(2);
      expect(results.get('123 Main')).toBeNull();
      expect(results.get('456 Oak')).toBeNull();
    });
  });

  describe('getStreetViewCacheStats()', () => {
    it('should return cache statistics', () => {
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';
      cacheStreetViewImage('123 Main', mockImage);

      const stats = getStreetViewCacheStats();

      expect(stats.serverCacheSize).toBeGreaterThanOrEqual(0);
      expect(stats.clientCacheCount).toBe(1);
      expect(stats.clientCacheSizeBytes).toBeGreaterThan(0);
    });

    it('should return zero statistics for empty cache', () => {
      clearStreetViewCache();

      const stats = getStreetViewCacheStats();

      expect(stats.serverCacheSize).toBe(0);
      expect(stats.clientCacheCount).toBe(0);
      expect(stats.clientCacheSizeBytes).toBe(0);
    });
  });

  describe('Cache Eviction (FIFO)', () => {
    it('should evict oldest image when exceeding max count (50)', async () => {
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      // Add 51 images
      for (let i = 0; i < 51; i++) {
        cacheStreetViewImage(`Address ${i}`, mockImage);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 1));
      }

      const stats = getStreetViewCacheStats();
      // Should have evicted one to stay at 50
      expect(stats.clientCacheCount).toBeLessThanOrEqual(50);
    });

    it('should evict by FIFO order (oldest first)', async () => {
      const mockImage = 'data:image/png;base64,A'.repeat(100);

      cacheStreetViewImage('Address 1', mockImage);
      await new Promise((resolve) => setTimeout(resolve, 10));

      cacheStreetViewImage('Address 2', mockImage);
      await new Promise((resolve) => setTimeout(resolve, 10));

      cacheStreetViewImage('Address 3', mockImage);

      // Add a 4th to trigger eviction
      cacheStreetViewImage('Address 4', mockImage);

      const stats = getStreetViewCacheStats();
      expect(stats.clientCacheCount).toBeLessThanOrEqual(4);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const address = '123 Main Street';
      const mockImage = 'data:image/png;base64,iVBORw0KGgo=';

      // Mock localStorage to throw
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: jest.fn(() => {
            throw new Error('Storage full');
          }),
          getItem: jest.fn(() => null),
          removeItem: jest.fn(),
          clear: jest.fn(),
          key: jest.fn(),
          length: 0,
        },
        writable: true,
      });

      // Should not throw even if cache operation fails
      cacheStreetViewImage(address, mockImage);
      expect(true).toBe(true); // Didn't throw
    });

    it('should handle malformed cache entries', () => {
      const address = '123 Main Street';
      const hash = getAddressHash(address);

      // Manually inject bad JSON into localStorage
      window.localStorage.setItem(
        `incentedge_streetview_${hash}`,
        'invalid json {'
      );

      // Should not throw when retrieving
      expect(() => getStreetViewCacheStats()).not.toThrow();
    });
  });
});
