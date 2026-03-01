/**
 * Address Verification Service
 *
 * Provides address verification using Google Geocoding API with caching,
 * rate limiting, and comprehensive error handling.
 *
 * Features:
 * - Google Geocoding API integration for address normalization and validation
 * - localStorage-based caching to prevent duplicate API calls
 * - Rate limiting (1 request per 500ms per address)
 * - Detailed error handling with meaningful fallback values
 * - Full TypeScript type safety
 */

/**
 * Result of address verification
 */
export interface AddressVerificationResult {
  isValid: boolean;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  error?: string;
  cached?: boolean;
}

/**
 * Internal cache structure for verified addresses
 */
interface CachedAddress {
  result: AddressVerificationResult;
  timestamp: number;
}

/**
 * Google Geocoding API response
 */
interface GeocodeResponse {
  results?: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
  error_message?: string;
}

// Rate limiting store: maps address to last request timestamp
const rateLimitMap = new Map<string, number>();

// Cache TTL: 24 hours (in milliseconds)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Rate limit: 1 request per 500ms per address
const RATE_LIMIT_MS = 500;

// Cache storage key
const CACHE_STORAGE_KEY = 'incentedge_verified_addresses';

/**
 * Normalizes an address string for consistent caching and API calls
 * Trims whitespace and converts to lowercase for comparison
 */
function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Generates a deterministic cache key from an address
 */
function getCacheKey(address: string): string {
  return `addr_${Buffer.from(normalizeAddress(address)).toString('base64')}`;
}

/**
 * Checks if an address is rate-limited
 * Returns true if the address was recently queried (within 500ms)
 */
function isRateLimited(address: string): boolean {
  const normalizedAddress = normalizeAddress(address);
  const lastRequestTime = rateLimitMap.get(normalizedAddress);

  if (!lastRequestTime) {
    return false;
  }

  const timeSinceLastRequest = Date.now() - lastRequestTime;
  return timeSinceLastRequest < RATE_LIMIT_MS;
}

/**
 * Records a request timestamp for rate limiting
 */
function recordRequest(address: string): void {
  const normalizedAddress = normalizeAddress(address);
  rateLimitMap.set(normalizedAddress, Date.now());
}

/**
 * Retrieves a cached address verification result from localStorage
 *
 * @param address - The address to look up
 * @returns The cached result or null if not found or expired
 */
export function getCachedAddress(address: string): AddressVerificationResult | null {
  try {
    // Only available in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    const cacheKey = getCacheKey(address);
    const cachedData = window.localStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const cached: CachedAddress = JSON.parse(cachedData);
    const now = Date.now();

    // Check if cache has expired
    if (now - cached.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(cacheKey);
      return null;
    }

    return {
      ...cached.result,
      cached: true,
    };
  } catch (error) {
    // Silently fail on cache retrieval errors
    console.error('[address-verification] Cache retrieval error:', error);
    return null;
  }
}

/**
 * Caches an address verification result in localStorage
 *
 * @param address - The original address string
 * @param result - The verification result to cache
 */
export function cacheVerifiedAddress(
  address: string,
  result: AddressVerificationResult
): void {
  try {
    // Only available in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const cacheKey = getCacheKey(address);
    const cacheEntry: CachedAddress = {
      result: {
        ...result,
        cached: undefined, // Don't cache the cached flag itself
      },
      timestamp: Date.now(),
    };

    window.localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
  } catch (error) {
    // Silently fail on cache write errors (quota exceeded, etc.)
    console.error('[address-verification] Cache write error:', error);
  }
}

/**
 * Clears all cached addresses from localStorage
 */
export function clearAddressCache(): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('addr_')) {
        keys.push(key);
      }
    }

    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch (error) {
    console.error('[address-verification] Cache clear error:', error);
  }
}

/**
 * Validates an address using Google Geocoding API
 *
 * Performs address verification and returns normalized coordinates and
 * formatted address. Includes rate limiting and caching to minimize API calls.
 *
 * @param address - The address string to verify
 * @returns A promise resolving to the verification result
 *
 * @example
 * const result = await verifyAddress('1600 Amphitheatre Parkway, Mountain View, CA');
 * if (result.isValid) {
 *   console.log(`Address: ${result.formattedAddress}`);
 *   console.log(`Coordinates: ${result.lat}, ${result.lng}`);
 * } else {
 *   console.error(`Verification failed: ${result.error}`);
 * }
 */
export async function verifyAddress(address: string): Promise<AddressVerificationResult> {
  // Validate input
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Invalid address: address must be a non-empty string',
    };
  }

  // Trim and validate non-empty after trimming
  const trimmedAddress = address.trim();
  if (trimmedAddress.length === 0) {
    return {
      isValid: false,
      error: 'Invalid address: address cannot be empty',
    };
  }

  // Check cache first
  const cached = getCachedAddress(trimmedAddress);
  if (cached) {
    return cached;
  }

  // Check rate limiting
  if (isRateLimited(trimmedAddress)) {
    return {
      isValid: false,
      error: `Rate limited: Please wait before verifying another address`,
    };
  }

  try {
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return {
        isValid: false,
        error: 'Address verification unavailable: Missing API configuration',
      };
    }

    // Record this request for rate limiting
    recordRequest(trimmedAddress);

    // Encode address for URL
    const encodedAddress = encodeURIComponent(trimmedAddress);

    // Call Google Geocoding API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        isValid: false,
        error: `Address verification failed: HTTP ${response.status}`,
      };
    }

    const data: GeocodeResponse = await response.json();

    // Handle API errors
    if (data.status === 'REQUEST_DENIED') {
      return {
        isValid: false,
        error: 'Address verification unavailable: API access denied',
      };
    }

    if (data.status === 'INVALID_REQUEST') {
      return {
        isValid: false,
        error: 'Invalid address provided',
      };
    }

    if (data.status === 'OVER_QUERY_LIMIT') {
      return {
        isValid: false,
        error: 'Address verification temporarily unavailable: Rate limit reached',
      };
    }

    if (data.status === 'UNKNOWN_ERROR') {
      return {
        isValid: false,
        error: 'Address verification service error: Please try again',
      };
    }

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        isValid: false,
        error: 'Address not found',
      };
    }

    // Extract the first result
    const result = data.results[0];
    const verificationResult: AddressVerificationResult = {
      isValid: true,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };

    // Cache the result
    cacheVerifiedAddress(trimmedAddress, verificationResult);

    return verificationResult;
  } catch (error) {
    // Handle network and parsing errors
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error('[address-verification] Verification error:', error);

    return {
      isValid: false,
      error: `Address verification failed: ${errorMessage}`,
    };
  }
}

/**
 * Verifies multiple addresses in sequence with respect to rate limiting
 *
 * @param addresses - Array of addresses to verify
 * @returns Promise resolving to array of verification results
 */
export async function verifyMultipleAddresses(
  addresses: string[]
): Promise<AddressVerificationResult[]> {
  const results: AddressVerificationResult[] = [];

  for (const address of addresses) {
    const result = await verifyAddress(address);
    results.push(result);

    // Add delay between requests to respect rate limiting
    if (addresses.indexOf(address) < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    }
  }

  return results;
}

/**
 * Checks if an address is valid without detailed verification
 * Uses cache if available, otherwise performs full verification
 *
 * @param address - The address to check
 * @returns Promise resolving to a boolean indicating validity
 */
export async function isAddressValid(address: string): Promise<boolean> {
  const result = await verifyAddress(address);
  return result.isValid;
}
