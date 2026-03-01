/**
 * Street View Image Cache Manager
 *
 * Efficiently manages cached Street View images with:
 * - localStorage-based caching with automatic eviction (FIFO)
 * - Base64 data URL storage with 5MB total limit per domain
 * - Exponential backoff retry logic for failed requests
 * - Graceful error handling with null fallback
 *
 * Features:
 * - Max 50 cached images (FIFO eviction when exceeded)
 * - Per-image size limiting to prevent quota issues
 * - Retry logic with exponential backoff (max 2 attempts)
 * - Simple address hashing for cache key generation
 * - Server-side deduplication cache (1-hour TTL)
 * - Parallel preload support for multiple addresses
 */

import { MemoryCache } from './cache';

// Server-side deduplication cache (1-hour TTL)
const streetViewCache = new MemoryCache<string>(60 * 60 * 1000);

// Client-side configuration constants
const CACHE_PREFIX = 'incentedge_streetview_';
const METADATA_KEY = 'incentedge_streetview_metadata';
const MAX_CACHED_IMAGES = 50;
const MAX_TOTAL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per domain
const MAX_IMAGE_SIZE_BYTES = 250 * 1024; // 250KB per image
const REQUEST_TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

// Track failed addresses with timestamp for retry logic
const failedAddresses = new Map<string, number>();

/**
 * Cache entry metadata stored in localStorage
 */
interface StreetViewCacheEntry {
  imageUrl: string;
  timestamp: number;
  address: string;
}

/**
 * Cache metadata for size and count tracking
 */
interface CacheMetadata {
  totalSize: number;
  imageCount: number;
  lastCleaned: number;
}

/**
 * Generates a simple hash for an address string to use as cache key.
 * Uses a basic DJB2 algorithm for consistency and collision avoidance.
 *
 * @param address - The address to hash
 * @returns Hash string (alphanumeric)
 */
export function getAddressHash(address: string): string {
  let hash = 5381;
  const trimmed = address.toLowerCase().trim();

  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) + hash + trimmed.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Retrieves cache metadata from localStorage.
 * Returns default metadata if none exists.
 */
function getMetadata(): CacheMetadata {
  try {
    if (typeof window === 'undefined') return defaultMetadata();

    const stored = localStorage.getItem(METADATA_KEY);
    if (!stored) return defaultMetadata();

    const parsed = JSON.parse(stored);
    return {
      totalSize: typeof parsed.totalSize === 'number' ? parsed.totalSize : 0,
      imageCount: typeof parsed.imageCount === 'number' ? parsed.imageCount : 0,
      lastCleaned:
        typeof parsed.lastCleaned === 'number' ? parsed.lastCleaned : 0,
    };
  } catch {
    console.warn('[StreetViewCache] Failed to parse metadata, resetting');
    return defaultMetadata();
  }
}

/**
 * Returns default metadata object.
 */
function defaultMetadata(): CacheMetadata {
  return {
    totalSize: 0,
    imageCount: 0,
    lastCleaned: Date.now(),
  };
}

/**
 * Persists metadata to localStorage.
 */
function saveMetadata(metadata: CacheMetadata): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.warn('[StreetViewCache] Failed to save metadata:', error);
  }
}

/**
 * Gets the estimated size of a string in bytes (UTF-8).
 */
function getStringSize(str: string): number {
  if (typeof str !== 'string') return 0;
  return new Blob([str]).size;
}

/**
 * Performs FIFO eviction: removes the oldest cached image.
 * Returns true if an image was evicted, false if cache is empty.
 */
function evictOldestImage(): boolean {
  try {
    if (typeof window === 'undefined') return false;

    const metadata = getMetadata();
    if (metadata.imageCount === 0) return false;

    // Find the oldest cached image by scanning all entries
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(CACHE_PREFIX)) continue;

      try {
        const entry = JSON.parse(localStorage.getItem(key) || '{}');
        if (entry.timestamp && entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
          oldestKey = key;
        }
      } catch {
        // Skip malformed entries
      }
    }

    if (oldestKey) {
      const entry = JSON.parse(localStorage.getItem(oldestKey) || '{}');
      const entrySize = getStringSize(entry.imageUrl || '');

      localStorage.removeItem(oldestKey);

      metadata.imageCount = Math.max(0, metadata.imageCount - 1);
      metadata.totalSize = Math.max(0, metadata.totalSize - entrySize);
      saveMetadata(metadata);

      return true;
    }

    return false;
  } catch (error) {
    console.warn('[StreetViewCache] Failed to evict oldest image:', error);
    return false;
  }
}

/**
 * Cleans up oversized cache entries.
 * Removes entries until total size falls below threshold.
 */
function cleanup(): void {
  try {
    if (typeof window === 'undefined') return;

    let metadata = getMetadata();

    // Keep removing oldest images until we're below the threshold
    while (
      metadata.totalSize > MAX_TOTAL_SIZE_BYTES &&
      metadata.imageCount > 0
    ) {
      if (!evictOldestImage()) break;
      metadata = getMetadata();
    }

    metadata.lastCleaned = Date.now();
    saveMetadata(metadata);
  } catch (error) {
    console.warn('[StreetViewCache] Cleanup failed:', error);
  }
}

/**
 * Caches a Street View image as a base64 data URL in localStorage.
 * Implements size limiting and automatic FIFO eviction.
 *
 * @param address - The verified address
 * @param imageUrl - Base64 data URL of the Street View image
 */
export function cacheStreetViewImage(
  address: string,
  imageUrl: string
): void {
  try {
    if (typeof window === 'undefined') return;

    const imageSize = getStringSize(imageUrl);

    // Skip if image is too large
    if (imageSize > MAX_IMAGE_SIZE_BYTES) {
      console.warn(
        `[StreetViewCache] Image for "${address}" is ${imageSize} bytes, exceeds limit of ${MAX_IMAGE_SIZE_BYTES}`
      );
      return;
    }

    const hash = getAddressHash(address);
    const cacheKey = `${CACHE_PREFIX}${hash}`;

    let metadata = getMetadata();

    // Remove old entry if it exists to update size calculation
    const existingEntry = localStorage.getItem(cacheKey);
    if (existingEntry) {
      try {
        const parsed = JSON.parse(existingEntry);
        const oldSize = getStringSize(parsed.imageUrl || '');
        metadata.totalSize = Math.max(0, metadata.totalSize - oldSize);
      } catch {
        // Ignore parse errors
      }
    } else {
      // Only increment count if this is a new entry
      metadata.imageCount += 1;
    }

    // Add new size to total
    metadata.totalSize += imageSize;

    // FIFO eviction: keep removing oldest until we fit
    while (
      metadata.imageCount > MAX_CACHED_IMAGES ||
      metadata.totalSize > MAX_TOTAL_SIZE_BYTES
    ) {
      if (!evictOldestImage()) break;
      metadata = getMetadata();
    }

    // Now store the new entry
    const entry: StreetViewCacheEntry = {
      imageUrl,
      timestamp: Date.now(),
      address,
    };

    localStorage.setItem(cacheKey, JSON.stringify(entry));
    metadata.imageCount = Math.max(0, metadata.imageCount); // Ensure positive
    saveMetadata(metadata);

    console.debug(
      `[StreetViewCache] Cached image for "${address}" (${(imageSize / 1024).toFixed(2)}KB)`
    );
  } catch (error) {
    console.warn('[StreetViewCache] Failed to cache image:', error);
  }
}

/**
 * Clears all cached Street View images from localStorage.
 */
export function clearStreetViewCache(): void {
  try {
    if (typeof window === 'undefined') return;

    const keysToDelete: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(METADATA_KEY);

    failedAddresses.clear();
    streetViewCache.clear();

    console.debug(`[StreetViewCache] Cleared ${keysToDelete.length} images`);
  } catch (error) {
    console.warn('[StreetViewCache] Failed to clear cache:', error);
  }
}

/**
 * Implements exponential backoff delay for retry logic.
 *
 * @param attemptNumber - The retry attempt number (0-indexed)
 * @returns Delay in milliseconds
 */
function getBackoffDelay(attemptNumber: number): number {
  return INITIAL_BACKOFF_MS * Math.pow(2, attemptNumber);
}

/**
 * Fetches a Street View image with exponential backoff retry logic.
 *
 * @param address - Verified address
 * @param apiKey - Google Maps API key
 * @param attemptNumber - Current attempt (0-indexed)
 * @returns Promise resolving to base64 data URL or null
 */
async function fetchStreetViewWithRetry(
  address: string,
  apiKey: string,
  attemptNumber: number = 0
): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${encoded}&key=${apiKey}&return_error_code=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 403) {
        // Quota exceeded - don't retry
        console.warn('[StreetViewCache] API quota exceeded for Street View');
        return null;
      }

      if (response.status >= 500 && attemptNumber < MAX_RETRIES) {
        // Server error - retry with backoff
        const delay = getBackoffDelay(attemptNumber);
        console.warn(
          `[StreetViewCache] Server error (attempt ${attemptNumber + 1}/${MAX_RETRIES}), retrying in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchStreetViewWithRetry(address, apiKey, attemptNumber + 1);
      }

      console.warn(
        `[StreetViewCache] Failed to fetch Street View for "${address}": HTTP ${response.status}`
      );
      return null;
    }

    // Convert response blob to base64 data URL
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.warn('[StreetViewCache] Failed to read response blob');
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      if (attemptNumber < MAX_RETRIES) {
        // Timeout - retry with backoff
        const delay = getBackoffDelay(attemptNumber);
        console.warn(
          `[StreetViewCache] Request timeout (attempt ${attemptNumber + 1}/${MAX_RETRIES}), retrying in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchStreetViewWithRetry(address, apiKey, attemptNumber + 1);
      }
      console.warn(`[StreetViewCache] Request timeout for "${address}"`);
      return null;
    }

    console.warn(
      '[StreetViewCache] Fetch error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Retrieves a Street View image from cache or fetches from API.
 * Implements exponential backoff for failed requests.
 *
 * Returns null if image is not cached and fetch fails.
 * Logs errors but doesn't throw — gracefully degrades to fallback.
 *
 * @param address - Verified address (required)
 * @param apiKey - Google Maps API key (required)
 * @returns Promise resolving to base64 data URL or null on failure
 */
export async function getOrFetchStreetViewImage(
  address: string,
  apiKey: string
): Promise<string | null> {
  try {
    // Input validation
    if (!address || address.trim() === '') {
      console.warn('[StreetViewCache] Invalid address provided');
      return null;
    }

    if (!apiKey || apiKey.trim() === '') {
      console.warn('[StreetViewCache] API key not configured');
      return null;
    }

    const hash = getAddressHash(address);
    const cacheKey = `${CACHE_PREFIX}${hash}`;

    // Check server-side cache first (deduplication)
    const serverCached = streetViewCache.get(cacheKey);
    if (serverCached) {
      console.debug(`[StreetViewCache] Server cache hit for "${address}"`);
      return serverCached;
    }

    // Check client-side cache next
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const entry: StreetViewCacheEntry = JSON.parse(cached);
          // Restore to server cache for this session
          streetViewCache.set(cacheKey, entry.imageUrl);
          console.debug(`[StreetViewCache] Client cache hit for "${address}"`);
          return entry.imageUrl;
        }
      } catch (error) {
        console.warn(
          '[StreetViewCache] Failed to retrieve from client cache:',
          error
        );
      }
    }

    // Check if we recently failed for this address (avoid hammering API)
    const lastFailedTime = failedAddresses.get(address);
    if (lastFailedTime && Date.now() - lastFailedTime < 5 * 60 * 1000) {
      // Failed in the last 5 minutes — don't retry yet
      console.debug(
        `[StreetViewCache] Skipping fetch for "${address}" (failed recently)`
      );
      return null;
    }

    // Fetch from API with retry logic
    console.debug(`[StreetViewCache] Fetching Street View for "${address}"`);
    const imageUrl = await fetchStreetViewWithRetry(address, apiKey);

    if (imageUrl) {
      // Cache successful fetch on both server and client
      streetViewCache.set(cacheKey, imageUrl);
      cacheStreetViewImage(address, imageUrl);
      failedAddresses.delete(address);
      return imageUrl;
    }

    // Track failure for this address
    failedAddresses.set(address, Date.now());
    return null;
  } catch (error) {
    console.warn(
      '[StreetViewCache] Unexpected error in getOrFetchStreetViewImage:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

/**
 * Preload multiple Street View images in parallel
 * Useful for eager loading when showing multiple properties
 *
 * @param addresses - Array of addresses to preload
 * @param apiKey - Google Maps API key
 * @returns Map of address to image URL (or null if failed)
 */
export async function preloadStreetViewImages(
  addresses: string[],
  apiKey: string
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();

  const promises = addresses.map(async (address) => {
    const imageUrl = await getOrFetchStreetViewImage(address, apiKey);
    results.set(address, imageUrl);
  });

  await Promise.all(promises);
  return results;
}

/**
 * Get cache statistics (for debugging)
 *
 * @returns Object with cache size statistics
 */
export function getStreetViewCacheStats(): {
  serverCacheSize: number;
  clientCacheCount: number;
  clientCacheSizeBytes: number;
} {
  const stats = {
    serverCacheSize: streetViewCache.size(),
    clientCacheCount: 0,
    clientCacheSizeBytes: 0,
  };

  if (typeof window !== 'undefined') {
    try {
      const metadata = getMetadata();
      stats.clientCacheCount = metadata.imageCount;
      stats.clientCacheSizeBytes = metadata.totalSize;
    } catch (error) {
      console.warn('[StreetViewCache] Failed to get cache stats:', error);
    }
  }

  return stats;
}
