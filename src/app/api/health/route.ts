/**
 * Health Check API Endpoint for IncentEdge
 *
 * Provides comprehensive health status including:
 * - Database connectivity check
 * - External service checks
 * - Memory/CPU metrics
 * - Version information
 *
 * Usage:
 *   GET /api/health - Full health check
 *   GET /api/health?quick=true - Quick liveness check
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  performHealthCheck,
  getSystemMetrics,
  createErrorResponse,
  getCorsHeaders,
} from '@/lib/api-utils';
import { ipRateLimiter, getEndpointType } from '@/lib/rate-limiter';
import { getClientIp, generateRequestId } from '@/lib/api-security';
import { HealthCheckResult, HealthCheck } from '@/types/api';

// Version info - should match package.json
const APP_VERSION = process.env.npm_package_version || '1.0.0';
const BUILD_TIME = process.env.BUILD_TIME || new Date().toISOString();
const GIT_COMMIT = process.env.GIT_COMMIT || 'unknown';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Track start time for uptime calculation
const startTime = Date.now();

/**
 * GET /api/health
 *
 * Returns the health status of the application and its dependencies.
 *
 * Query Parameters:
 *   - quick: boolean - If true, returns only liveness status (no dependency checks)
 *   - verbose: boolean - If true, includes additional metrics and details
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();
  const ip = getClientIp(request);
  const url = new URL(request.url);

  // Rate limiting - more lenient for health checks
  const rateLimitResult = ipRateLimiter.checkIp(ip, {
    tier: 'professional',
    endpointType: getEndpointType(request.method),
  });

  if (!rateLimitResult.allowed) {
    return createErrorResponse('RATE_LIMIT_EXCEEDED', 'Too many health check requests', {
      requestId,
      headers: {
        ...getCorsHeaders(request),
        'X-Request-ID': requestId,
        'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
      },
    });
  }

  // Quick liveness check
  const isQuickCheck = url.searchParams.get('quick') === 'true';
  const isVerbose = url.searchParams.get('verbose') === 'true';

  if (isQuickCheck) {
    return NextResponse.json(
      {
        status: 'alive',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      },
      {
        status: 200,
        headers: {
          ...getCorsHeaders(request),
          'X-Request-ID': requestId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  try {
    // Perform comprehensive health check
    const healthResult = await performHealthCheck(APP_VERSION);

    // Add additional info
    const response: HealthCheckResult & {
      environment?: string;
      build?: {
        time: string;
        commit: string;
      };
      dependencies?: Record<string, string>;
    } = {
      ...healthResult,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };

    // Add verbose details if requested
    if (isVerbose) {
      response.environment = NODE_ENV;
      response.build = {
        time: BUILD_TIME,
        commit: GIT_COMMIT,
      };

      // Add dependency versions (from package.json in production)
      response.dependencies = {
        next: '15.x',
        react: '19.x',
        supabase: '2.x',
      };
    }

    // Determine HTTP status based on health
    const httpStatus = getHttpStatusFromHealth(healthResult.status);

    return NextResponse.json(response, {
      status: httpStatus,
      headers: {
        ...getCorsHeaders(request),
        'X-Request-ID': requestId,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Status': healthResult.status,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks: [
          {
            name: 'health_check',
            status: 'fail',
            message: error instanceof Error ? error.message : 'Health check failed',
            lastChecked: new Date().toISOString(),
          },
        ],
        metrics: getSystemMetrics(),
      } as HealthCheckResult,
      {
        status: 503,
        headers: {
          ...getCorsHeaders(request),
          'X-Request-ID': requestId,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Health-Status': 'unhealthy',
        },
      }
    );
  }
}

/**
 * HEAD /api/health
 *
 * Simple liveness check - returns 200 if the service is running
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(request),
      'X-Health-Status': 'alive',
      'X-Version': APP_VERSION,
    },
  });
}

/**
 * OPTIONS /api/health
 *
 * CORS preflight handler
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

/**
 * Map health status to HTTP status code
 */
function getHttpStatusFromHealth(status: 'healthy' | 'degraded' | 'unhealthy'): number {
  switch (status) {
    case 'healthy':
      return 200;
    case 'degraded':
      return 200; // Still operational, but with warnings
    case 'unhealthy':
      return 503; // Service Unavailable
    default:
      return 500;
  }
}

// Internal helpers for Kubernetes-style probes
// These are kept as internal functions to avoid Next.js route validation issues
// If needed externally, move these to a lib/health-utils.ts file

/**
 * Kubernetes-style readiness probe
 * Returns 200 only if all critical dependencies are healthy
 * Note: Prefixed with underscore to indicate intentionally unused
 */
async function _checkReadiness(): Promise<{
  ready: boolean;
  checks: HealthCheck[];
}> {
  try {
    const health = await performHealthCheck(APP_VERSION);

    // Check if all critical services are passing
    const criticalChecks = health.checks.filter(
      (c) => c.name === 'database' // Add other critical services here
    );

    const allCriticalPassing = criticalChecks.every((c) => c.status !== 'fail');

    return {
      ready: allCriticalPassing,
      checks: criticalChecks,
    };
  } catch {
    return {
      ready: false,
      checks: [],
    };
  }
}

/**
 * Kubernetes-style liveness probe
 * Returns 200 if the process is running
 * Note: Prefixed with underscore to indicate intentionally unused
 */
function _checkLiveness(): { alive: boolean; uptime: number } {
  return {
    alive: true,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };
}
