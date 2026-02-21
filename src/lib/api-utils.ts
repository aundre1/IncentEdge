/**
 * API Utilities for IncentEdge
 *
 * Provides common utilities for API routes:
 * - Standard error response formatting
 * - Request validation helpers
 * - Pagination utilities
 * - Response caching helpers
 * - Health check endpoint logic
 * - API versioning helpers
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ApiError,
  ApiErrorCode,
  PaginatedRequest,
  PaginatedResponse,
  PaginationMeta,
  CursorPaginatedResponse,
  CacheConfig,
  CacheHeaders,
  ApiVersion,
  VersionedResponse,
  HealthCheckResult,
  HealthCheck,
  SystemMetrics,
} from '@/types/api';
import { getCorsHeaders as _getCorsHeaders } from './api-security';
import { rateLimiter } from './rate-limiter';

// Re-export getCorsHeaders for convenience
export const getCorsHeaders = _getCorsHeaders;

// ============================================================================
// ERROR RESPONSE FORMATTING
// ============================================================================

const ERROR_STATUS_CODES: Record<ApiErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  RATE_LIMIT_EXCEEDED: 429,
  INTERNAL_ERROR: 500,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  SERVICE_UNAVAILABLE: 503,
  INVALID_API_KEY: 401,
  INVALID_SIGNATURE: 401,
  EXPIRED_TOKEN: 401,
  INSUFFICIENT_SCOPE: 403,
};

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  options?: {
    details?: Record<string, unknown>;
    requestId?: string;
    path?: string;
    headers?: Record<string, string>;
  }
): NextResponse<ApiError> {
  const statusCode = ERROR_STATUS_CODES[code] || 500;

  const error: ApiError = {
    code,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(options?.details && { details: options.details }),
    ...(options?.requestId && { requestId: options.requestId }),
    ...(options?.path && { path: options.path }),
  };

  return NextResponse.json(error, {
    status: statusCode,
    headers: options?.headers,
  });
}

/**
 * Create success response with standard format
 */
export function createSuccessResponse<T>(
  data: T,
  options?: {
    status?: number;
    headers?: Record<string, string>;
    meta?: Record<string, unknown>;
  }
): NextResponse {
  const response: { data: T; meta?: Record<string, unknown> } = { data };

  if (options?.meta) {
    response.meta = options.meta;
  }

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

/**
 * Handle unknown errors safely
 */
export function handleError(
  error: unknown,
  options?: {
    requestId?: string;
    path?: string;
  }
): NextResponse<ApiError> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === 'production'
        ? 'An internal error occurred'
        : error.message;

    return createErrorResponse('INTERNAL_ERROR', message, options);
  }

  return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', options);
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Parse and validate JSON body from request
 */
export async function parseJsonBody<T>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const text = await request.text();

    if (!text) {
      return { success: false, error: 'Request body is empty' };
    }

    const data = JSON.parse(text) as T;
    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON in request body' };
    }
    return { success: false, error: 'Failed to parse request body' };
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  requiredFields: (keyof T)[]
): { valid: true } | { valid: false; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = body[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(String(field));
    }
  }

  if (missingFields.length > 0) {
    return { valid: false, missingFields };
  }

  return { valid: true };
}

/**
 * Validate field types in request body
 */
export function validateTypes<T extends Record<string, unknown>>(
  body: T,
  typeMap: Partial<Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array'>>
): { valid: true } | { valid: false; errors: { field: string; expected: string; actual: string }[] } {
  const errors: { field: string; expected: string; actual: string }[] = [];

  for (const [field, expectedType] of Object.entries(typeMap)) {
    const value = body[field as keyof T];

    if (value !== undefined && value !== null) {
      let actualType: string = typeof value;
      if (Array.isArray(value)) {
        actualType = 'array';
      }

      if (actualType !== expectedType) {
        errors.push({
          field,
          expected: expectedType as string,
          actual: actualType,
        });
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number,
  options: { min?: number; max?: number }
): boolean {
  if (options.min !== undefined && value < options.min) {
    return false;
  }
  if (options.max !== undefined && value > options.max) {
    return false;
  }
  return true;
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  options: { min?: number; max?: number }
): boolean {
  if (options.min !== undefined && value.length < options.min) {
    return false;
  }
  if (options.max !== undefined && value.length > options.max) {
    return false;
  }
  return true;
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

/**
 * Parse pagination parameters from request
 */
export function parsePaginationParams(
  request: NextRequest,
  defaults?: {
    page?: number;
    limit?: number;
    maxLimit?: number;
  }
): PaginatedRequest {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get('page') || '', 10) || defaults?.page || 1;
  const requestedLimit = parseInt(url.searchParams.get('limit') || '', 10);
  const maxLimit = defaults?.maxLimit || 100;
  const limit = Math.min(requestedLimit || defaults?.limit || 20, maxLimit);

  const sortBy = url.searchParams.get('sortBy') || undefined;
  const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
  const cursor = url.searchParams.get('cursor') || undefined;

  // Parse filters
  const filters: Record<string, string | number | boolean | string[]> = {};
  url.searchParams.forEach((value, key) => {
    if (!['page', 'limit', 'sortBy', 'sortOrder', 'cursor'].includes(key)) {
      // Handle array values (comma-separated)
      if (value.includes(',')) {
        filters[key] = value.split(',').map((v) => v.trim());
      } else if (value === 'true' || value === 'false') {
        filters[key] = value === 'true';
      } else if (!isNaN(Number(value)) && value !== '') {
        filters[key] = Number(value);
      } else {
        filters[key] = value;
      }
    }
  });

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    cursor,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginatedRequest,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: createPaginationMeta(total, pagination.page || 1, pagination.limit || 20),
  };
}

/**
 * Create cursor-based paginated response
 */
export function createCursorPaginatedResponse<T extends { id: string }>(
  data: T[],
  limit: number,
  hasMore: boolean
): CursorPaginatedResponse<T> {
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
  const previousCursor = data.length > 0 ? data[0].id : null;

  return {
    data,
    cursor: {
      next: nextCursor,
      previous: previousCursor,
    },
    hasMore,
  };
}

/**
 * Calculate offset for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

// ============================================================================
// RESPONSE CACHING
// ============================================================================

/**
 * Generate cache headers based on config
 */
export function createCacheHeaders(config: CacheConfig): CacheHeaders {
  const directives: string[] = [];

  if (config.ttl > 0) {
    directives.push('public');
    directives.push(`max-age=${config.ttl}`);

    if (config.staleWhileRevalidate) {
      directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }
  } else {
    directives.push('no-store');
    directives.push('no-cache');
    directives.push('must-revalidate');
  }

  return {
    'Cache-Control': directives.join(', '),
  };
}

/**
 * Generate ETag from data
 */
export function generateETag(data: unknown): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex');
  return `"${hash}"`;
}

/**
 * Check if client cache is still valid (If-None-Match)
 */
export function isClientCacheValid(
  request: NextRequest,
  currentETag: string
): boolean {
  const clientETag = request.headers.get('If-None-Match');
  return clientETag === currentETag;
}

/**
 * Create 304 Not Modified response
 */
export function createNotModifiedResponse(
  etag: string,
  headers?: Record<string, string>
): NextResponse {
  return new NextResponse(null, {
    status: 304,
    headers: {
      ETag: etag,
      ...headers,
    },
  });
}

// Simple in-memory cache for API responses
const responseCache = new Map<
  string,
  { data: unknown; expiresAt: number; etag: string }
>();

/**
 * Get cached response if valid
 */
export function getCachedResponse<T>(key: string): {
  data: T;
  etag: string;
} | null {
  const cached = responseCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    responseCache.delete(key);
    return null;
  }

  return { data: cached.data as T, etag: cached.etag };
}

/**
 * Set cached response
 */
export function setCachedResponse(
  key: string,
  data: unknown,
  ttlSeconds: number
): void {
  const etag = generateETag(data);
  responseCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
    etag,
  });
}

/**
 * Invalidate cached responses by tag
 */
export function invalidateCacheByTag(tag: string): void {
  const keysToDelete: string[] = [];
  responseCache.forEach((_, key) => {
    if (key.includes(tag)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => responseCache.delete(key));
}

/**
 * Clear all cached responses
 */
export function clearAllCache(): void {
  responseCache.clear();
}

// ============================================================================
// HEALTH CHECK UTILITIES
// ============================================================================

/**
 * Get system metrics
 */
export function getSystemMetrics(): SystemMetrics {
  // Node.js process metrics
  const memoryUsage = process.memoryUsage();

  return {
    memory: {
      used: memoryUsage.heapUsed,
      total: memoryUsage.heapTotal,
      percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    },
    cpu: {
      usage: 0, // Would need additional monitoring in production
    },
    requests: {
      total: 0, // Would be tracked by monitoring system
      perSecond: 0,
      averageResponseTime: 0,
    },
  };
}

/**
 * Perform database health check
 */
export async function checkDatabaseHealth(): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    // Import dynamically to avoid circular dependencies
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Simple query to check connectivity
    const { error } = await supabase.from('organizations').select('id').limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        name: 'database',
        status: 'fail',
        responseTime,
        message: error.message,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name: 'database',
      status: responseTime > 1000 ? 'warn' : 'pass',
      responseTime,
      message: responseTime > 1000 ? 'Slow response time' : 'Connected',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Perform external service health check
 */
export async function checkExternalService(
  name: string,
  url: string,
  timeout: number = 5000
): Promise<HealthCheck> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        name,
        status: 'warn',
        responseTime,
        message: `HTTP ${response.status}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      name,
      status: responseTime > 2000 ? 'warn' : 'pass',
      responseTime,
      message: 'Available',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name,
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: error instanceof Error ? error.message : 'Connection failed',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Create comprehensive health check result
 */
export async function performHealthCheck(
  version: string
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: HealthCheck[] = [];

  // Database check
  const dbCheck = await checkDatabaseHealth();
  checks.push(dbCheck);

  // External services (configurable)
  // const externalChecks = await Promise.all([
  //   checkExternalService('stripe', 'https://api.stripe.com'),
  //   checkExternalService('geocoding', 'https://maps.googleapis.com'),
  // ]);
  // checks.push(...externalChecks);

  // Determine overall status
  const hasFailure = checks.some((c) => c.status === 'fail');
  const hasWarning = checks.some((c) => c.status === 'warn');

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (hasFailure) {
    status = 'unhealthy';
  } else if (hasWarning) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version,
    uptime: process.uptime(),
    checks,
    metrics: getSystemMetrics(),
  };
}

// ============================================================================
// API VERSIONING
// ============================================================================

/**
 * Parse API version from request
 */
export function parseApiVersion(request: NextRequest): ApiVersion {
  // Check header first
  const headerVersion = request.headers.get('X-API-Version');
  if (headerVersion && isValidVersion(headerVersion)) {
    return headerVersion as ApiVersion;
  }

  // Check URL path
  const url = new URL(request.url);
  const pathMatch = url.pathname.match(/\/api\/(v\d+)\//);
  if (pathMatch && isValidVersion(pathMatch[1])) {
    return pathMatch[1] as ApiVersion;
  }

  // Check query parameter
  const queryVersion = url.searchParams.get('version');
  if (queryVersion && isValidVersion(queryVersion)) {
    return queryVersion as ApiVersion;
  }

  // Default to latest version
  return 'v1';
}

/**
 * Check if version string is valid
 */
function isValidVersion(version: string): boolean {
  return ['v1', 'v2'].includes(version);
}

/**
 * Create versioned response
 */
export function createVersionedResponse<T>(
  data: T,
  version: ApiVersion,
  deprecation?: {
    message: string;
    sunsetDate: string;
    alternativeUrl?: string;
  }
): VersionedResponse<T> {
  return {
    apiVersion: version,
    data,
    ...(deprecation && { deprecation }),
  };
}

/**
 * Add deprecation headers to response
 */
export function addDeprecationHeaders(
  response: NextResponse,
  sunsetDate: string,
  alternativeUrl?: string
): NextResponse {
  response.headers.set('Deprecation', 'true');
  response.headers.set('Sunset', new Date(sunsetDate).toUTCString());

  if (alternativeUrl) {
    response.headers.set('Link', `<${alternativeUrl}>; rel="successor-version"`);
  }

  return response;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create response with all standard headers
 */
export function createApiResponse<T>(
  data: T,
  request: NextRequest,
  options?: {
    status?: number;
    cache?: CacheConfig;
    version?: ApiVersion;
    rateLimitInfo?: {
      limit: number;
      remaining: number;
      reset: number;
      policy: string;
    };
  }
): NextResponse {
  const headers: Record<string, string> = {
    ...getCorsHeaders(request),
    'Content-Type': 'application/json',
  };

  // Add cache headers
  if (options?.cache) {
    Object.assign(headers, createCacheHeaders(options.cache));

    // Generate and add ETag
    const etag = generateETag(data);
    headers['ETag'] = etag;

    // Check for conditional request
    if (isClientCacheValid(request, etag)) {
      return createNotModifiedResponse(etag, headers);
    }
  }

  // Add rate limit headers
  if (options?.rateLimitInfo) {
    headers['X-RateLimit-Limit'] = options.rateLimitInfo.limit.toString();
    headers['X-RateLimit-Remaining'] = options.rateLimitInfo.remaining.toString();
    headers['X-RateLimit-Reset'] = options.rateLimitInfo.reset.toString();
    headers['X-RateLimit-Policy'] = options.rateLimitInfo.policy;
  }

  // Add version header
  if (options?.version) {
    headers['X-API-Version'] = options.version;
  }

  return NextResponse.json({ data }, {
    status: options?.status || 200,
    headers,
  });
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  request: NextRequest,
  response: NextResponse,
  duration: number
): void {
  const log = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: new URL(request.url).pathname,
    status: response.status,
    duration,
    userAgent: request.headers.get('User-Agent'),
  };

  console.log('API Request:', JSON.stringify(log));
}

/**
 * Wrap API handler with standard error handling
 */
export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      const response = await handler(request);
      logApiRequest(request, response, Date.now() - startTime);
      return response;
    } catch (error) {
      const errorResponse = handleError(error);
      logApiRequest(request, errorResponse, Date.now() - startTime);
      return errorResponse;
    }
  };
}
