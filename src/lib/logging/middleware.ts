/**
 * Logging Middleware
 * Express/Next.js middleware for automatic request/response logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { LogContext } from './types';

/**
 * Generate unique request ID
 */
export const generateRequestId = (): string => {
  return uuidv4();
};

/**
 * Extract client IP from request
 */
export const getClientIp = (req: NextRequest): string | undefined => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return undefined;
};

/**
 * Extract user agent from request
 */
export const getUserAgent = (req: NextRequest): string | undefined => {
  return req.headers.get('user-agent') || undefined;
};

/**
 * Create request context
 */
export const createRequestContext = (req: NextRequest, requestId?: string): LogContext => {
  const url = new URL(req.url);

  return {
    requestId: requestId || generateRequestId(),
    method: req.method,
    path: url.pathname,
    query: url.search,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    timestamp: new Date().toISOString()
  };
};

/**
 * Next.js API route logging wrapper
 */
export const withLogging = <T>(
  handler: (req: NextRequest, context?: LogContext) => Promise<NextResponse<T>>
) => {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const context = createRequestContext(req, requestId);

    // Log incoming request
    logger.info('Incoming request', context);

    try {
      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      // Log successful response
      logger.info('Request completed', {
        ...context,
        statusCode: response.status,
        duration
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logger.error('Request failed', {
        ...context,
        duration,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });

      throw error;
    }
  };
};

/**
 * Express-style middleware for Next.js
 */
export const loggingMiddleware = (req: NextRequest): NextResponse | undefined => {
  const requestId = generateRequestId();
  const context = createRequestContext(req, requestId);

  // Skip logging for static assets and health checks
  const path = new URL(req.url).pathname;
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/static/') ||
    path === '/favicon.ico' ||
    path === '/api/health'
  ) {
    return undefined;
  }

  // Log request
  logger.info('HTTP Request', context);

  return undefined;
};

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (req: NextRequest): NextResponse | undefined => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const context = createRequestContext(req, requestId);

  // Use request metadata to track performance
  // Note: In Next.js middleware, we don't have access to the response
  // Performance logging will be done in the withLogging wrapper

  return undefined;
};

/**
 * Error logging helper for API routes
 */
export const logApiError = (
  error: unknown,
  context?: LogContext
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error('API Error', {
    ...context,
    error: errorMessage,
    stack,
    timestamp: new Date().toISOString()
  });
};

/**
 * Success logging helper for API routes
 */
export const logApiSuccess = (
  message: string,
  context?: LogContext
): void => {
  logger.info(`API Success: ${message}`, {
    ...context,
    timestamp: new Date().toISOString()
  });
};

/**
 * Create logger for specific API route
 */
export const createApiLogger = (routePath: string) => {
  return {
    info: (message: string, context?: LogContext) => {
      logger.info(message, {
        ...context,
        route: routePath
      });
    },
    error: (message: string, context?: LogContext) => {
      logger.error(message, {
        ...context,
        route: routePath
      });
    },
    warn: (message: string, context?: LogContext) => {
      logger.warn(message, {
        ...context,
        route: routePath
      });
    },
    debug: (message: string, context?: LogContext) => {
      logger.debug(message, {
        ...context,
        route: routePath
      });
    }
  };
};

/**
 * UUID package mock for environments where it's not available
 */
function v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
