/**
 * Rate Limiter Library for IncentEdge
 *
 * Implements token bucket algorithm with support for:
 * - Different limits by endpoint type (read vs write)
 * - Different limits by subscription tier
 * - Rate limit headers
 * - Graceful degradation under load
 */

import {
  RateLimitInfo,
  RateLimitConfig,
  TokenBucketState
} from '@/types/api';

// ============================================================================
// CONSTANTS
// ============================================================================

const SUBSCRIPTION_TIERS = {
  free: {
    read: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 req/min
    write: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 req/min
    burst: 10,
  },
  starter: {
    read: { maxRequests: 500, windowMs: 60 * 1000 },
    write: { maxRequests: 100, windowMs: 60 * 1000 },
    burst: 25,
  },
  professional: {
    read: { maxRequests: 2000, windowMs: 60 * 1000 },
    write: { maxRequests: 500, windowMs: 60 * 1000 },
    burst: 50,
  },
  team: {
    read: { maxRequests: 5000, windowMs: 60 * 1000 },
    write: { maxRequests: 1000, windowMs: 60 * 1000 },
    burst: 100,
  },
  enterprise: {
    read: { maxRequests: 20000, windowMs: 60 * 1000 },
    write: { maxRequests: 5000, windowMs: 60 * 1000 },
    burst: 500,
  },
} as const;

type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
type EndpointType = 'read' | 'write';

// In-memory store (should be replaced with Redis in production)
const rateLimitStore = new Map<string, TokenBucketState>();

// Load tracking for graceful degradation
let currentLoad = 0;
let loadCheckInterval: ReturnType<typeof setInterval> | null = null;

// ============================================================================
// TOKEN BUCKET IMPLEMENTATION
// ============================================================================

export class TokenBucket {
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly burstCapacity: number;

  constructor(
    maxTokens: number,
    refillRatePerSecond: number,
    burstCapacity?: number
  ) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRatePerSecond;
    this.burstCapacity = burstCapacity || maxTokens;
  }

  /**
   * Try to consume tokens from the bucket
   * Returns true if tokens were consumed, false if rate limited
   */
  consume(key: string, tokensToConsume: number = 1): {
    allowed: boolean;
    tokensRemaining: number;
    resetAt: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    let state = rateLimitStore.get(key);

    if (!state) {
      state = {
        tokens: this.maxTokens,
        lastRefill: now,
        requestCount: 0,
      };
    }

    // Calculate tokens to add based on time elapsed
    const timeSinceLastRefill = (now - state.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeSinceLastRefill * this.refillRate);

    if (tokensToAdd > 0) {
      state.tokens = Math.min(
        this.burstCapacity,
        state.tokens + tokensToAdd
      );
      state.lastRefill = now;
    }

    // Check if we can consume
    if (state.tokens >= tokensToConsume) {
      state.tokens -= tokensToConsume;
      state.requestCount++;
      rateLimitStore.set(key, state);

      return {
        allowed: true,
        tokensRemaining: Math.floor(state.tokens),
        resetAt: now + Math.ceil((this.maxTokens - state.tokens) / this.refillRate) * 1000,
      };
    }

    // Rate limited - calculate retry after
    const tokensNeeded = tokensToConsume - state.tokens;
    const secondsUntilTokens = Math.ceil(tokensNeeded / this.refillRate);

    return {
      allowed: false,
      tokensRemaining: 0,
      resetAt: now + secondsUntilTokens * 1000,
      retryAfter: secondsUntilTokens,
    };
  }

  /**
   * Get current state without consuming tokens
   */
  peek(key: string): TokenBucketState | null {
    return rateLimitStore.get(key) || null;
  }

  /**
   * Reset a specific key's bucket
   */
  reset(key: string): void {
    rateLimitStore.delete(key);
  }
}

// ============================================================================
// RATE LIMITER CLASS
// ============================================================================

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();

  constructor() {
    this.initializeLoadMonitoring();
  }

  /**
   * Initialize load monitoring for graceful degradation
   */
  private initializeLoadMonitoring(): void {
    if (typeof window === 'undefined' && !loadCheckInterval) {
      loadCheckInterval = setInterval(() => {
        // Decay load over time
        currentLoad = Math.max(0, currentLoad * 0.95);
      }, 1000);
    }
  }

  /**
   * Get or create a token bucket for a specific tier and endpoint type
   */
  private getBucket(tier: SubscriptionTier, endpointType: EndpointType): TokenBucket {
    const key = `${tier}-${endpointType}`;

    if (!this.buckets.has(key)) {
      const config = SUBSCRIPTION_TIERS[tier][endpointType];
      const burst = SUBSCRIPTION_TIERS[tier].burst;

      // Calculate refill rate: requests per second
      const refillRate = config.maxRequests / (config.windowMs / 1000);

      this.buckets.set(key, new TokenBucket(
        config.maxRequests,
        refillRate,
        config.maxRequests + burst
      ));
    }

    return this.buckets.get(key)!;
  }

  /**
   * Check rate limit for a request
   */
  checkLimit(options: {
    key: string; // Usually IP or user ID
    tier?: SubscriptionTier;
    endpointType?: EndpointType;
    cost?: number; // Some endpoints cost more tokens
  }): RateLimitInfo & { allowed: boolean } {
    const {
      key,
      tier = 'free',
      endpointType = 'read',
      cost = 1,
    } = options;

    // Apply graceful degradation under load
    const adjustedCost = this.applyLoadDegradation(cost);

    const bucket = this.getBucket(tier, endpointType);
    const fullKey = `${tier}:${endpointType}:${key}`;
    const result = bucket.consume(fullKey, adjustedCost);

    const config = SUBSCRIPTION_TIERS[tier][endpointType];
    const resetInSeconds = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));

    return {
      allowed: result.allowed,
      limit: config.maxRequests,
      remaining: result.tokensRemaining,
      reset: Math.floor(result.resetAt / 1000), // Unix timestamp
      resetInSeconds,
      retryAfter: result.retryAfter,
      policy: `${config.maxRequests} requests per ${config.windowMs / 1000} seconds`,
    };
  }

  /**
   * Apply graceful degradation based on current load
   */
  private applyLoadDegradation(baseCost: number): number {
    // At high load, increase token cost to reduce throughput
    if (currentLoad > 0.9) {
      return baseCost * 3; // Severely limit at very high load
    } else if (currentLoad > 0.75) {
      return baseCost * 2; // Double cost at high load
    } else if (currentLoad > 0.5) {
      return baseCost * 1.5; // Moderate increase at medium-high load
    }
    return baseCost;
  }

  /**
   * Record a request for load tracking
   */
  recordRequest(): void {
    currentLoad = Math.min(1, currentLoad + 0.001);
  }

  /**
   * Get current load level (0-1)
   */
  getCurrentLoad(): number {
    return currentLoad;
  }

  /**
   * Get rate limit headers for response
   */
  getHeaders(info: RateLimitInfo): Record<string, string> {
    const headers: Record<string, string> = {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': info.remaining.toString(),
      'X-RateLimit-Reset': info.reset.toString(),
      'X-RateLimit-Policy': info.policy,
    };

    if (info.retryAfter !== undefined) {
      headers['Retry-After'] = info.retryAfter.toString();
    }

    return headers;
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clearAll(): void {
    rateLimitStore.clear();
    this.buckets.clear();
  }
}

// ============================================================================
// SLIDING WINDOW RATE LIMITER (Alternative Implementation)
// ============================================================================

export class SlidingWindowRateLimiter {
  private windows: Map<string, number[]> = new Map();
  private readonly windowSizeMs: number;
  private readonly maxRequests: number;

  constructor(windowSizeMs: number = 60000, maxRequests: number = 100) {
    this.windowSizeMs = windowSizeMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if a request is allowed using sliding window
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowStart = now - this.windowSizeMs;

    // Get or create window
    let timestamps = this.windows.get(key) || [];

    // Remove expired timestamps
    timestamps = timestamps.filter(ts => ts > windowStart);

    if (timestamps.length < this.maxRequests) {
      timestamps.push(now);
      this.windows.set(key, timestamps);

      return {
        allowed: true,
        remaining: this.maxRequests - timestamps.length,
        resetAt: timestamps[0] ? timestamps[0] + this.windowSizeMs : now + this.windowSizeMs,
      };
    }

    // Rate limited
    const oldestTimestamp = timestamps[0];
    const resetAt = oldestTimestamp + this.windowSizeMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  /**
   * Clean up expired windows
   */
  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowSizeMs;
    const keysToProcess: string[] = [];

    this.windows.forEach((_, key) => keysToProcess.push(key));

    keysToProcess.forEach((key) => {
      const timestamps = this.windows.get(key);
      if (timestamps) {
        const validTimestamps = timestamps.filter(ts => ts > windowStart);
        if (validTimestamps.length === 0) {
          this.windows.delete(key);
        } else {
          this.windows.set(key, validTimestamps);
        }
      }
    });
  }
}

// ============================================================================
// IP-BASED RATE LIMITER
// ============================================================================

export class IpRateLimiter {
  private limiter: RateLimiter;
  private blacklist: Set<string> = new Set();
  private whitelist: Set<string> = new Set();

  constructor() {
    this.limiter = new RateLimiter();
  }

  /**
   * Check rate limit by IP address
   */
  checkIp(ip: string, options?: {
    tier?: SubscriptionTier;
    endpointType?: EndpointType;
  }): RateLimitInfo & { allowed: boolean } {
    // Check whitelist
    if (this.whitelist.has(ip)) {
      return {
        allowed: true,
        limit: Infinity,
        remaining: Infinity,
        reset: 0,
        resetInSeconds: 0,
        policy: 'whitelisted',
      };
    }

    // Check blacklist
    if (this.blacklist.has(ip)) {
      return {
        allowed: false,
        limit: 0,
        remaining: 0,
        reset: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        resetInSeconds: 3600,
        retryAfter: 3600,
        policy: 'blacklisted',
      };
    }

    return this.limiter.checkLimit({
      key: `ip:${ip}`,
      ...options,
    });
  }

  /**
   * Add IP to blacklist
   */
  blacklistIp(ip: string): void {
    this.blacklist.add(ip);
    this.whitelist.delete(ip);
  }

  /**
   * Add IP to whitelist
   */
  whitelistIp(ip: string): void {
    this.whitelist.add(ip);
    this.blacklist.delete(ip);
  }

  /**
   * Remove IP from both lists
   */
  removeIp(ip: string): void {
    this.blacklist.delete(ip);
    this.whitelist.delete(ip);
  }
}

// ============================================================================
// DISTRIBUTED RATE LIMITER (Redis-based placeholder)
// ============================================================================

export interface DistributedRateLimiterConfig {
  redisUrl?: string;
  keyPrefix?: string;
  syncInterval?: number;
}

/**
 * Placeholder for Redis-based distributed rate limiter
 * In production, this would use Redis for state management
 */
export class DistributedRateLimiter {
  private localLimiter: RateLimiter;
  private config: DistributedRateLimiterConfig;

  constructor(config: DistributedRateLimiterConfig = {}) {
    this.localLimiter = new RateLimiter();
    this.config = {
      keyPrefix: 'ratelimit:',
      syncInterval: 1000,
      ...config,
    };
  }

  /**
   * Check rate limit with distributed state
   * Falls back to local limiter if Redis is unavailable
   */
  async checkLimit(options: {
    key: string;
    tier?: SubscriptionTier;
    endpointType?: EndpointType;
    cost?: number;
  }): Promise<RateLimitInfo & { allowed: boolean }> {
    // In production, this would check Redis first
    // For now, use local limiter as fallback
    try {
      // TODO: Implement Redis-based rate limiting
      // const redisResult = await this.checkRedis(options);
      // return redisResult;

      return this.localLimiter.checkLimit(options);
    } catch {
      // Graceful fallback to local limiter
      console.warn('Distributed rate limiter falling back to local');
      return this.localLimiter.checkLimit(options);
    }
  }

  /**
   * Get rate limit headers
   */
  getHeaders(info: RateLimitInfo): Record<string, string> {
    return this.localLimiter.getHeaders(info);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Singleton instances
export const rateLimiter = new RateLimiter();
export const ipRateLimiter = new IpRateLimiter();
export const distributedRateLimiter = new DistributedRateLimiter();

// Helper to determine endpoint type from HTTP method
export function getEndpointType(method: string): EndpointType {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return writeMethods.includes(method.toUpperCase()) ? 'write' : 'read';
}

// Helper to get tier from subscription
export function getTierFromSubscription(
  subscription?: string | null
): SubscriptionTier {
  if (!subscription) return 'free';

  const tier = subscription.toLowerCase();
  if (tier in SUBSCRIPTION_TIERS) {
    return tier as SubscriptionTier;
  }

  return 'free';
}
