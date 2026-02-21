// API Security and Rate Limiting Types for IncentEdge

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId?: string;
  path?: string;
  statusCode: number;
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'SERVICE_UNAVAILABLE'
  | 'INVALID_API_KEY'
  | 'INVALID_SIGNATURE'
  | 'EXPIRED_TOKEN'
  | 'INSUFFICIENT_SCOPE';

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  cursor?: string;
  filters?: Record<string, string | number | boolean | string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  cursor: {
    next: string | null;
    previous: string | null;
  };
  hasMore: boolean;
}

// ============================================================================
// RATE LIMITING TYPES
// ============================================================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  resetInSeconds: number;
  retryAfter?: number;
  policy: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  handler?: (info: RateLimitInfo) => void;
}

export interface RateLimitTierConfig {
  free: RateLimitConfig;
  starter: RateLimitConfig;
  professional: RateLimitConfig;
  team: RateLimitConfig;
  enterprise: RateLimitConfig;
}

export interface TokenBucketState {
  tokens: number;
  lastRefill: number;
  requestCount: number;
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  PROJECTS_READ = 'projects:read',
  PROJECTS_WRITE = 'projects:write',
  INCENTIVES_READ = 'incentives:read',
  INCENTIVES_WRITE = 'incentives:write',
  APPLICATIONS_READ = 'applications:read',
  APPLICATIONS_WRITE = 'applications:write',
  ANALYTICS_READ = 'analytics:read',
  WEBHOOKS_MANAGE = 'webhooks:manage',
  API_KEYS_MANAGE = 'api_keys:manage',
}

export interface ApiKey {
  id: string;
  organizationId: string;
  name: string;
  keyPrefix: string; // First 8 chars for identification
  keyHash: string; // SHA-256 hash of the full key
  scopes: ApiKeyScope[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  rateLimit: number | null; // Custom rate limit override
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyCreateRequest {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string;
  rateLimit?: number;
  metadata?: Record<string, unknown>;
}

export interface ApiKeyCreateResponse {
  apiKey: ApiKey;
  secret: string; // Only returned once at creation
}

// ============================================================================
// REQUEST SIGNING TYPES
// ============================================================================

export interface SignedRequest {
  timestamp: number;
  signature: string;
  keyId: string;
  body?: string;
}

export interface SignatureVerificationResult {
  valid: boolean;
  error?: string;
  keyId?: string;
  timestamp?: number;
}

// ============================================================================
// CORS TYPES
// ============================================================================

export interface CorsConfig {
  origins: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

// ============================================================================
// SECURITY TYPES
// ============================================================================

export interface SecurityContext {
  userId?: string;
  organizationId?: string;
  apiKeyId?: string;
  scopes: ApiKeyScope[];
  ip: string;
  userAgent: string;
  requestId: string;
  timestamp: number;
}

export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  threats: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
  metrics: SystemMetrics;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
  lastChecked: string;
}

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  requests: {
    total: number;
    perSecond: number;
    averageResponseTime: number;
  };
}

// ============================================================================
// API VERSIONING TYPES
// ============================================================================

export type ApiVersion = 'v1' | 'v2';

export interface VersionedResponse<T> {
  apiVersion: ApiVersion;
  data: T;
  deprecation?: {
    message: string;
    sunsetDate: string;
    alternativeUrl?: string;
  };
}

// ============================================================================
// CACHING TYPES
// ============================================================================

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number;
  tags?: string[];
  key?: string;
}

export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  etag?: string;
  tags: string[];
}

export interface CacheHeaders {
  'Cache-Control': string;
  ETag?: string;
  'Last-Modified'?: string;
  Vary?: string;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  signature: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  retryPolicy: {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
  };
}
