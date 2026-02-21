/**
 * API Security Middleware for IncentEdge
 *
 * Provides comprehensive security features:
 * - Rate limiting by IP and user
 * - API key validation for external access
 * - Request signing verification
 * - CORS configuration
 * - Input sanitization helpers
 * - SQL injection prevention utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import {
  ApiError,
  ApiKeyScope,
  SecurityContext,
  SanitizationResult,
  ValidationResult,
  ValidationError,
  SignatureVerificationResult,
  CorsConfig,
} from '@/types/api';
import {
  rateLimiter,
  ipRateLimiter,
  getEndpointType,
  getTierFromSubscription,
} from './rate-limiter';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_KEY_HEADER = 'X-API-Key';
const SIGNATURE_HEADER = 'X-Signature';
const TIMESTAMP_HEADER = 'X-Timestamp';
const REQUEST_ID_HEADER = 'X-Request-ID';

// Signature timestamp tolerance (5 minutes)
const SIGNATURE_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

// Default CORS configuration
const DEFAULT_CORS_CONFIG: CorsConfig = {
  origins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://incentedge.com',
    'https://www.incentedge.com',
    'https://app.incentedge.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Signature',
    'X-Timestamp',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(\b(UNION|JOIN|OR|AND)\b\s+\b(SELECT|1|TRUE)\b)/gi,
  /(--|\#|\/\*|\*\/)/g,
  /(\bOR\b\s+\b1\b\s*=\s*\b1\b)/gi,
  /(\bAND\b\s+\b1\b\s*=\s*\b1\b)/gi,
  /(\'|\"|;|\)|\()/g,
  /(\bSLEEP\b\s*\()/gi,
  /(\bBENCHMARK\b\s*\()/gi,
  /(\bWAITFOR\b\s+\bDELAY\b)/gi,
];

// XSS patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<form\b[^>]*>/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
];

// ============================================================================
// API KEY VALIDATION
// ============================================================================

interface ApiKeyValidationResult {
  valid: boolean;
  keyId?: string;
  organizationId?: string;
  scopes?: ApiKeyScope[];
  tier?: string;
  error?: string;
}

/**
 * Validate API key from request header
 */
export async function validateApiKey(
  request: NextRequest
): Promise<ApiKeyValidationResult> {
  const apiKey = request.headers.get(API_KEY_HEADER);

  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }

  // API key format: ie_[prefix]_[secret]
  const keyPattern = /^ie_([a-zA-Z0-9]{8})_([a-zA-Z0-9]{32})$/;
  const match = apiKey.match(keyPattern);

  if (!match) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const [, prefix, secret] = match;

  try {
    // Hash the key for lookup
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    // Look up the key in the database
    const validationResult = await lookupApiKey(prefix, keyHash);

    if (!validationResult.found) {
      return { valid: false, error: 'API key not found or inactive' };
    }

    // Check expiration
    if (validationResult.expiresAt && new Date(validationResult.expiresAt) < new Date()) {
      return { valid: false, error: 'API key expired' };
    }

    return {
      valid: true,
      keyId: validationResult.id,
      organizationId: validationResult.organizationId,
      scopes: validationResult.scopes,
      tier: validationResult.tier,
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { valid: false, error: 'API key validation failed' };
  }
}

// Real database lookup for API keys
async function lookupApiKey(
  prefix: string,
  keyHash: string
): Promise<{
  found: boolean;
  id?: string;
  organizationId?: string;
  scopes?: ApiKeyScope[];
  tier?: string;
  expiresAt?: string | null;
}> {
  // Import Supabase client dynamically to avoid circular dependencies
  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // SECURITY: No hardcoded development keys allowed
  // In development without Supabase, API key validation is disabled
  // but only if explicitly configured via SKIP_API_KEY_VALIDATION=true
  if (!supabaseUrl || !supabaseServiceKey) {
    const skipValidation = process.env.SKIP_API_KEY_VALIDATION === 'true';
    const isProduction = process.env.NODE_ENV === 'production';

    // CRITICAL: Never skip validation in production
    if (isProduction) {
      console.error('[API Security] CRITICAL: Supabase not configured in production');
      return { found: false };
    }

    if (skipValidation) {
      console.warn('[API Security] WARNING: API key validation disabled - for development only');
      // Return minimal permissions for unauthenticated development access
      return {
        found: true,
        id: `dev_${prefix}`,
        organizationId: 'org_development',
        scopes: [ApiKeyScope.READ], // Read-only in dev mode
        tier: 'free',
        expiresAt: null,
      };
    }

    console.error('[API Security] Supabase not configured and validation not skipped');
    return { found: false };
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[API Security] Missing Supabase configuration');
    return { found: false };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query the api_keys table
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, organization_id, scopes, tier, expires_at, is_active, revoked_at')
      .eq('key_prefix', prefix)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .is('revoked_at', null)
      .single();

    if (error || !data) {
      console.warn('[API Security] API key not found:', prefix);
      return { found: false };
    }

    // Check if key is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.warn('[API Security] API key expired:', prefix);
      return { found: false };
    }

    // Parse scopes from JSON array
    const scopes: ApiKeyScope[] = Array.isArray(data.scopes)
      ? data.scopes.map((s: string) => s as ApiKeyScope)
      : [];

    return {
      found: true,
      id: data.id,
      organizationId: data.organization_id,
      scopes,
      tier: data.tier || 'free',
      expiresAt: data.expires_at,
    };
  } catch (err) {
    console.error('[API Security] Database lookup error:', err);
    return { found: false };
  }
}

/**
 * Check if API key has required scope
 */
export function hasScope(
  scopes: ApiKeyScope[],
  requiredScope: ApiKeyScope
): boolean {
  // Admin has all permissions
  if (scopes.includes(ApiKeyScope.ADMIN)) {
    return true;
  }

  // Direct match
  if (scopes.includes(requiredScope)) {
    return true;
  }

  // Write scope includes read
  if (requiredScope === ApiKeyScope.READ && scopes.includes(ApiKeyScope.WRITE)) {
    return true;
  }

  // Resource-specific scopes
  const resourceWriteScope = requiredScope.replace(':read', ':write');
  if (requiredScope.endsWith(':read') && scopes.includes(resourceWriteScope as ApiKeyScope)) {
    return true;
  }

  return false;
}

// ============================================================================
// REQUEST SIGNING
// ============================================================================

/**
 * Verify request signature (HMAC-SHA256)
 */
export function verifyRequestSignature(
  request: NextRequest,
  secretKey: string,
  body?: string
): SignatureVerificationResult {
  const signature = request.headers.get(SIGNATURE_HEADER);
  const timestamp = request.headers.get(TIMESTAMP_HEADER);
  const keyId = request.headers.get(API_KEY_HEADER)?.split('_')[1];

  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature or timestamp' };
  }

  // Check timestamp
  const requestTimestamp = parseInt(timestamp, 10);
  const now = Date.now();

  if (isNaN(requestTimestamp)) {
    return { valid: false, error: 'Invalid timestamp format' };
  }

  if (Math.abs(now - requestTimestamp) > SIGNATURE_TIMESTAMP_TOLERANCE_MS) {
    return { valid: false, error: 'Request timestamp expired' };
  }

  // Build signature payload
  const method = request.method;
  const url = request.url;
  const payload = `${method}\n${url}\n${timestamp}\n${body || ''}`;

  // Calculate expected signature
  const expectedSignature = createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature' };
    }

    const isValid = timingSafeEqual(signatureBuffer, expectedBuffer);

    return {
      valid: isValid,
      keyId,
      timestamp: requestTimestamp,
      error: isValid ? undefined : 'Invalid signature',
    };
  } catch {
    return { valid: false, error: 'Signature verification failed' };
  }
}

/**
 * Generate request signature (for clients)
 */
export function generateRequestSignature(
  method: string,
  url: string,
  timestamp: number,
  body: string | undefined,
  secretKey: string
): string {
  const payload = `${method}\n${url}\n${timestamp}\n${body || ''}`;
  return createHmac('sha256', secretKey).update(payload).digest('hex');
}

// ============================================================================
// CORS HANDLING
// ============================================================================

/**
 * Create CORS headers for response
 *
 * SECURITY: Wildcard origin (*) is NEVER allowed with credentials
 * This violates the CORS specification and creates security vulnerabilities
 */
export function getCorsHeaders(
  request: NextRequest,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {};

  // SECURITY: Validate CORS configuration
  if (config.credentials && config.origins.includes('*')) {
    console.error('[Security] CRITICAL: Wildcard origin with credentials is not allowed');
    // Return restrictive headers instead of insecure configuration
    return {
      'Access-Control-Allow-Methods': config.methods.join(', '),
      'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    };
  }

  // Check if origin is explicitly allowed (whitelist approach)
  if (origin && config.origins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;

    // Only include credentials header when origin is explicitly whitelisted
    if (config.credentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  } else if (config.origins.includes('*') && !config.credentials) {
    // Wildcard only allowed WITHOUT credentials
    headers['Access-Control-Allow-Origin'] = '*';
  }
  // If origin not in whitelist and not using wildcard, no CORS headers added

  headers['Access-Control-Allow-Methods'] = config.methods.join(', ');
  headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
  headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = config.maxAge.toString();

  return headers;
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(
  request: NextRequest,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): NextResponse {
  const headers = getCorsHeaders(request, config);
  return new NextResponse(null, { status: 204, headers });
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize string input for SQL injection and XSS
 *
 * SECURITY: This function DETECTS threats and marks them.
 * It does NOT attempt to "clean" malicious input - that approach is flawed.
 * Callers should REJECT input when threats are detected.
 *
 * For database operations, always use parameterized queries (Supabase does this).
 * For output, use React's built-in escaping (don't use dangerouslySetInnerHTML).
 */
export function sanitizeInput(input: string): SanitizationResult {
  const threats: string[] = [];
  let hasSqlInjection = false;
  let hasXss = false;

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      hasSqlInjection = true;
    }
    // Reset regex lastIndex
    pattern.lastIndex = 0;
  }

  // Check for XSS patterns - but be more selective to avoid false positives
  // The on\w+= pattern is too aggressive, so we check for specific dangerous patterns
  const dangerousXssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript\s*:/gi,
    /<iframe\b[^>]*>/gi,
    /<object\b[^>]*>/gi,
    /<embed\b[^>]*>/gi,
    /expression\s*\(/gi,
    /\bon(load|error|click|mouse|focus|blur|submit|change|keydown|keyup|keypress)\s*=/gi,
  ];

  for (const pattern of dangerousXssPatterns) {
    if (pattern.test(input)) {
      hasXss = true;
    }
    pattern.lastIndex = 0;
  }

  if (hasSqlInjection) threats.push('sql_injection');
  if (hasXss) threats.push('xss');

  // HTML entity encode special characters for safe output
  // This is the ONLY modification we make - and it's for display safety, not "cleaning"
  const sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

  return {
    sanitized,
    wasModified: sanitized !== input,
    threats: Array.from(new Set(threats)),
  };
}

/**
 * Validate input and REJECT if threats detected
 * Use this for input validation - it throws on threats instead of trying to clean them
 */
export function validateInputSecurity(
  input: string,
  fieldName: string = 'input'
): { valid: true; value: string } | { valid: false; error: string; threats: string[] } {
  const result = sanitizeInput(input);

  if (result.threats.length > 0) {
    console.warn(`[Security] Threat detected in ${fieldName}:`, result.threats);
    return {
      valid: false,
      error: `Invalid characters detected in ${fieldName}`,
      threats: result.threats,
    };
  }

  // Return original input if no threats (don't encode for storage)
  return { valid: true, value: input };
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): { sanitized: T; threats: string[] } {
  const allThreats: string[] = [];

  function sanitizeValue(value: unknown): unknown {
    if (typeof value === 'string') {
      const result = sanitizeInput(value);
      allThreats.push(...result.threats);
      return result.sanitized;
    }

    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }

    if (value !== null && typeof value === 'object') {
      const sanitizedObj: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        const sanitizedKey = sanitizeInput(key).sanitized;
        sanitizedObj[sanitizedKey] = sanitizeValue(val);
      }
      return sanitizedObj;
    }

    return value;
  }

  return {
    sanitized: sanitizeValue(obj) as T,
    threats: Array.from(new Set(allThreats)),
  };
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

/**
 * Check if input contains SQL injection patterns
 */
export function detectSqlInjection(input: string): boolean {
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      pattern.lastIndex = 0;
      return true;
    }
    pattern.lastIndex = 0;
  }
  return false;
}

/**
 * Escape SQL special characters (for use with parameterized queries)
 */
export function escapeSqlString(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Validate and sanitize SQL identifier (table/column names)
 */
export function sanitizeSqlIdentifier(identifier: string): string | null {
  // Only allow alphanumeric and underscore
  const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  if (!pattern.test(identifier)) {
    return null;
  }
  return identifier;
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return pattern.test(uuid);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate request body against schema
 */
export function validateRequestBody(
  body: Record<string, unknown>,
  schema: {
    required?: string[];
    types?: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>;
    validators?: Record<string, (value: unknown) => boolean>;
  }
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in body) || body[field] === undefined || body[field] === null) {
        errors.push({
          field,
          message: `${field} is required`,
        });
      }
    }
  }

  // Check types
  if (schema.types) {
    for (const [field, expectedType] of Object.entries(schema.types)) {
      if (field in body && body[field] !== undefined) {
        const value = body[field];
        let actualType: string = typeof value;

        if (Array.isArray(value)) {
          actualType = 'array';
        }

        if (actualType !== expectedType) {
          errors.push({
            field,
            message: `${field} must be a ${expectedType}`,
            value,
          });
        }
      }
    }
  }

  // Run custom validators
  if (schema.validators) {
    for (const [field, validator] of Object.entries(schema.validators)) {
      if (field in body && body[field] !== undefined) {
        if (!validator(body[field])) {
          errors.push({
            field,
            message: `${field} validation failed`,
            value: body[field],
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

export interface SecurityMiddlewareOptions {
  requireApiKey?: boolean;
  requireSignature?: boolean;
  requiredScopes?: ApiKeyScope[];
  rateLimit?: boolean;
  corsConfig?: CorsConfig;
  sanitizeBody?: boolean;
}

/**
 * Create security context from request
 */
export function createSecurityContext(
  request: NextRequest,
  options?: {
    userId?: string;
    organizationId?: string;
    apiKeyId?: string;
    scopes?: ApiKeyScope[];
  }
): SecurityContext {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const requestId = request.headers.get(REQUEST_ID_HEADER) || generateRequestId();

  return {
    userId: options?.userId,
    organizationId: options?.organizationId,
    apiKeyId: options?.apiKeyId,
    scopes: options?.scopes || [],
    ip,
    userAgent,
    requestId,
    timestamp: Date.now(),
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  // Check common headers for proxied IP
  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('X-Real-IP');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return '127.0.0.1';
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${random}`;
}

/**
 * Security middleware for API routes
 */
export async function securityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<{ success: true; context: SecurityContext } | { success: false; response: NextResponse }> {
  const {
    requireApiKey = false,
    requireSignature = false,
    requiredScopes = [],
    rateLimit = true,
    corsConfig = DEFAULT_CORS_CONFIG,
    sanitizeBody = true,
  } = options;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return {
      success: false,
      response: handleCorsPreflightRequest(request, corsConfig),
    };
  }

  const ip = getClientIp(request);
  const requestId = generateRequestId();

  // Rate limiting
  if (rateLimit) {
    const rateLimitResult = ipRateLimiter.checkIp(ip, {
      endpointType: getEndpointType(request.method),
    });

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        response: NextResponse.json(
          {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: 429,
          } as ApiError,
          {
            status: 429,
            headers: {
              ...rateLimiter.getHeaders(rateLimitResult),
              ...getCorsHeaders(request, corsConfig),
              'X-Request-ID': requestId,
            },
          }
        ),
      };
    }
  }

  // API key validation
  let apiKeyResult: ApiKeyValidationResult = { valid: false };
  if (requireApiKey) {
    apiKeyResult = await validateApiKey(request);

    if (!apiKeyResult.valid) {
      return {
        success: false,
        response: NextResponse.json(
          {
            code: 'INVALID_API_KEY',
            message: apiKeyResult.error || 'Invalid API key',
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: 401,
          } as ApiError,
          {
            status: 401,
            headers: {
              ...getCorsHeaders(request, corsConfig),
              'X-Request-ID': requestId,
            },
          }
        ),
      };
    }

    // Check required scopes
    if (requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every((scope) =>
        hasScope(apiKeyResult.scopes || [], scope)
      );

      if (!hasAllScopes) {
        return {
          success: false,
          response: NextResponse.json(
            {
              code: 'INSUFFICIENT_SCOPE',
              message: 'API key does not have required permissions',
              details: { required: requiredScopes },
              timestamp: new Date().toISOString(),
              requestId,
              statusCode: 403,
            } as ApiError,
            {
              status: 403,
              headers: {
                ...getCorsHeaders(request, corsConfig),
                'X-Request-ID': requestId,
              },
            }
          ),
        };
      }
    }
  }

  // Request signature verification
  if (requireSignature) {
    // Get secret key for verification (from database or env)
    const secretKey = process.env.API_SIGNING_SECRET;

    if (!secretKey) {
      console.error('API_SIGNING_SECRET not configured');
      return {
        success: false,
        response: NextResponse.json(
          {
            code: 'INTERNAL_ERROR',
            message: 'Server configuration error',
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: 500,
          } as ApiError,
          {
            status: 500,
            headers: {
              ...getCorsHeaders(request, corsConfig),
              'X-Request-ID': requestId,
            },
          }
        ),
      };
    }

    const body = await request.text();
    const signatureResult = verifyRequestSignature(request, secretKey, body);

    if (!signatureResult.valid) {
      return {
        success: false,
        response: NextResponse.json(
          {
            code: 'INVALID_SIGNATURE',
            message: signatureResult.error || 'Invalid request signature',
            timestamp: new Date().toISOString(),
            requestId,
            statusCode: 401,
          } as ApiError,
          {
            status: 401,
            headers: {
              ...getCorsHeaders(request, corsConfig),
              'X-Request-ID': requestId,
            },
          }
        ),
      };
    }
  }

  // Create security context
  const context = createSecurityContext(request, {
    organizationId: apiKeyResult.organizationId,
    apiKeyId: apiKeyResult.keyId,
    scopes: apiKeyResult.scopes,
  });

  return { success: true, context };
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DEFAULT_CORS_CONFIG };

export type { ApiKeyValidationResult };
