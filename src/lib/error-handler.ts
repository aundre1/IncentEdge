/**
 * Centralized Error Handling
 *
 * SECURITY: This module provides secure error handling that:
 * 1. Never exposes internal error details to clients in production
 * 2. Generates unique error IDs for tracking/debugging
 * 3. Logs full error details server-side only
 * 4. Sanitizes error messages to prevent information leakage
 */

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

export interface ApiError {
  error: string;
  error_id?: string;
  details?: unknown;
}

export interface ErrorContext {
  route: string;
  method?: string;
  userId?: string;
  organizationId?: string;
  additionalContext?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// CONFIGURATION
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ENABLE_ERROR_IDS = true;

// Error messages that are safe to pass through to clients
const SAFE_ERROR_PATTERNS = [
  /^validation failed$/i,
  /^unauthorized$/i,
  /^forbidden$/i,
  /^not found$/i,
  /^bad request$/i,
  /^too many requests$/i,
  /^insufficient permissions$/i,
  /is required$/i,
  /must be a valid/i,
  /^no .+ found$/i,
  /^only .+ can/i,
  /^at least one .+ is required$/i,
];

// Patterns that indicate sensitive information that should NEVER be exposed
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /key/i,
  /credential/i,
  /connection.*string/i,
  /database/i,
  /postgres/i,
  /supabase/i,
  /api.*key/i,
  /auth/i,
  /stack/i,
  /trace/i,
  /\.ts:\d+/i, // Stack trace line numbers
  /at\s+\w+\s+\(/i, // Stack trace function calls
  /node_modules/i,
  /ECONNREFUSED/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
];

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `ERR_${timestamp}_${random}`.toUpperCase();
}

/**
 * Check if an error message is safe to expose to clients
 */
function isSafeErrorMessage(message: string): boolean {
  // Check for sensitive patterns first (blocklist)
  if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(message))) {
    return false;
  }

  // Then check if it matches safe patterns (allowlist)
  return SAFE_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Sanitize an error message for client exposure
 */
function sanitizeErrorMessage(error: unknown, fallback: string): string {
  if (!error) {
    return fallback;
  }

  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    message = String((error as { message: unknown }).message);
  } else {
    return fallback;
  }

  // In development, be more permissive (but still block sensitive info)
  if (!IS_PRODUCTION) {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(message))) {
      return fallback;
    }
    return message;
  }

  // In production, only allow explicitly safe messages
  if (isSafeErrorMessage(message)) {
    return message;
  }

  return fallback;
}

/**
 * Determine error severity based on error type and status
 */
function determineErrorSeverity(
  error: unknown,
  status: number
): ErrorSeverity {
  if (status >= 500) {
    return 'high';
  }
  if (status === 401 || status === 403) {
    return 'medium';
  }
  if (error instanceof Error && error.message.includes('CRITICAL')) {
    return 'critical';
  }
  return 'low';
}

// ============================================================================
// LOGGING
// ============================================================================

/**
 * Log error details server-side with full context
 * SECURITY: Full error details are only logged server-side, never sent to clients
 */
function logError(
  errorId: string,
  error: unknown,
  context: ErrorContext,
  severity: ErrorSeverity
): void {
  const timestamp = new Date().toISOString();
  const logData = {
    error_id: errorId,
    timestamp,
    severity,
    route: context.route,
    method: context.method,
    user_id: context.userId,
    organization_id: context.organizationId,
    error_type: error instanceof Error ? error.constructor.name : typeof error,
    error_message: error instanceof Error ? error.message : String(error),
    stack_trace:
      error instanceof Error && !IS_PRODUCTION ? error.stack : undefined,
    additional_context: context.additionalContext,
  };

  // In production, use structured logging
  if (IS_PRODUCTION) {
    // Remove undefined values for cleaner logs
    const cleanLogData = Object.fromEntries(
      Object.entries(logData).filter(([, v]) => v !== undefined)
    );
    console.error(JSON.stringify(cleanLogData));
  } else {
    // In development, use readable format
    console.error(`[${severity.toUpperCase()}] ${errorId}:`, error);
    if (context.additionalContext) {
      console.error('Context:', context.additionalContext);
    }
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Create a standardized error response
 *
 * @example
 * // In an API route:
 * catch (error) {
 *   return handleApiError(error, { route: '/api/projects' });
 * }
 */
export function handleApiError(
  error: unknown,
  context: ErrorContext,
  options?: {
    status?: number;
    fallbackMessage?: string;
    includeErrorId?: boolean;
  }
): NextResponse<ApiError> {
  const status = options?.status ?? 500;
  const fallbackMessage = options?.fallbackMessage ?? 'Internal server error';
  const includeErrorId = options?.includeErrorId ?? ENABLE_ERROR_IDS;

  // Generate error ID for tracking
  const errorId = generateErrorId();

  // Determine severity and log full error details
  const severity = determineErrorSeverity(error, status);
  logError(errorId, error, context, severity);

  // Sanitize message for client
  const clientMessage = sanitizeErrorMessage(error, fallbackMessage);

  // Build response
  const response: ApiError = {
    error: clientMessage,
  };

  // Include error ID for tracking (helps users report issues)
  if (includeErrorId && status >= 500) {
    response.error_id = errorId;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle database/Supabase errors specifically
 */
export function handleDatabaseError(
  error: unknown,
  context: ErrorContext
): NextResponse<ApiError> {
  // Check for specific database error codes
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message?: string };

    switch (dbError.code) {
      case '23505': // Unique violation
        return handleApiError(error, context, {
          status: 409,
          fallbackMessage: 'Resource already exists',
        });
      case '23503': // Foreign key violation
        return handleApiError(error, context, {
          status: 400,
          fallbackMessage: 'Referenced resource not found',
        });
      case '23502': // Not null violation
        return handleApiError(error, context, {
          status: 400,
          fallbackMessage: 'Required field missing',
        });
      case '42501': // Insufficient privilege
        return handleApiError(error, context, {
          status: 403,
          fallbackMessage: 'Insufficient permissions',
        });
      case 'PGRST116': // Supabase: row not found
        return handleApiError(error, context, {
          status: 404,
          fallbackMessage: 'Resource not found',
        });
    }
  }

  // Default database error handling
  return handleApiError(error, context, {
    status: 500,
    fallbackMessage: 'Database operation failed',
  });
}

/**
 * Handle validation errors with details
 */
export function handleValidationError(
  errors: Array<{ path: string[]; message: string }>,
  context: ErrorContext
): NextResponse<ApiError & { details: unknown }> {
  const errorId = generateErrorId();

  logError(
    errorId,
    new Error('Validation failed'),
    {
      ...context,
      additionalContext: { ...context.additionalContext, validation_errors: errors },
    },
    'low'
  );

  return NextResponse.json(
    {
      error: 'Validation failed',
      details: errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 }
  );
}

/**
 * Create a not found error response
 */
export function notFoundError(
  resourceType: string,
  context: ErrorContext
): NextResponse<ApiError> {
  return handleApiError(new Error(`${resourceType} not found`), context, {
    status: 404,
    fallbackMessage: `${resourceType} not found`,
  });
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(context: ErrorContext): NextResponse<ApiError> {
  return handleApiError(new Error('Unauthorized'), context, {
    status: 401,
    fallbackMessage: 'Unauthorized',
  });
}

/**
 * Create a forbidden error response
 */
export function forbiddenError(
  message: string,
  context: ErrorContext
): NextResponse<ApiError> {
  return handleApiError(new Error(message), context, {
    status: 403,
    fallbackMessage: 'Insufficient permissions',
  });
}

/**
 * Create a rate limit error response
 */
export function rateLimitError(
  retryAfter: number,
  context: ErrorContext
): NextResponse<ApiError> {
  const errorId = generateErrorId();
  logError(errorId, new Error('Rate limit exceeded'), context, 'medium');

  return new NextResponse(
    JSON.stringify({
      error: 'Too many requests',
      error_id: errorId,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}
