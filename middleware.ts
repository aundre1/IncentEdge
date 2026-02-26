import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Security headers to protect against common web vulnerabilities
 * Applied to all responses through middleware
 */
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Enable browser XSS filter
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restrict permissions/features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',

  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
};

/**
 * Content Security Policy - Strict but allows necessary functionality
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
  "frame-src https://accounts.google.com https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "upgrade-insecure-requests",
];

/**
 * Apply security headers to response
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP header
  const csp = CSP_DIRECTIVES.join('; ');
  response.headers.set('Content-Security-Policy', csp);

  // HSTS - Only in production over HTTPS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// ============================================================================
// RATE LIMITING PROTECTION
// ============================================================================

// Simple in-memory rate limiting for middleware (complements API rate limiting)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MIDDLEWARE_RATE_LIMIT = 100; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Periodically cleanup expired records (every ~100 requests)
  if (requestCounts.size > 100) {
    cleanupExpiredRecords();
  }

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MIDDLEWARE_RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

// Cleanup old rate limit records during rate limit checks
// Note: setInterval is not available in Edge runtime, so cleanup happens inline
function cleanupExpiredRecords(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  requestCounts.forEach((record, ip) => {
    if (now > record.resetTime) {
      keysToDelete.push(ip);
    }
  });

  keysToDelete.forEach((ip) => requestCounts.delete(ip));
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);

  // Check rate limit at middleware level
  if (!checkRateLimit(ip)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  // Update Supabase session
  const response = await updateSession(request);

  // Apply security headers to all responses
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
