/**
 * Admin API Health Status Endpoint
 *
 * Checks the health of all external services:
 * - Supabase DB (SELECT 1 probe)
 * - Stripe (charges list with limit=1)
 * - Resend Email (env key presence)
 * - Anthropic AI (env key presence)
 * - App Server (always measured, always up if this runs)
 *
 * Access: admin role only (checks profiles table via Supabase auth)
 * Method: GET /api/admin/health-status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

type ServiceStatus = 'up' | 'degraded' | 'down';
type OverallStatus = 'up' | 'degraded' | 'down';

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseMs: number;
  checkedAt: string;
  detail?: string;
}

interface HealthStatusResponse {
  services: ServiceCheck[];
  overall: OverallStatus;
  checkedAt: string;
}

// ============================================================================
// SERVICE CHECKERS
// ============================================================================

async function checkSupabase(): Promise<ServiceCheck> {
  const name = 'Supabase DB';
  const start = Date.now();

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('version').single();

    // Fallback: if rpc('version') isn't available, run a raw select
    if (error) {
      // Try a simpler approach — query a system table
      const fallbackStart = Date.now();
      const { error: fallbackError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const responseMs = Date.now() - fallbackStart;

      if (fallbackError) {
        return {
          name,
          status: 'down',
          responseMs,
          checkedAt: new Date().toISOString(),
          detail: fallbackError.message,
        };
      }

      return {
        name,
        status: responseMs > 2000 ? 'degraded' : 'up',
        responseMs,
        checkedAt: new Date().toISOString(),
      };
    }

    const responseMs = Date.now() - start;

    return {
      name,
      status: responseMs > 2000 ? 'degraded' : 'up',
      responseMs,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      name,
      status: 'down',
      responseMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      detail: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkStripe(): Promise<ServiceCheck> {
  const name = 'Stripe';
  const start = Date.now();
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    return {
      name,
      status: 'down',
      responseMs: 0,
      checkedAt: new Date().toISOString(),
      detail: 'STRIPE_SECRET_KEY not configured',
    };
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/charges?limit=1', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      // Short timeout to avoid blocking the health check
      signal: AbortSignal.timeout(5000),
    });

    const responseMs = Date.now() - start;

    if (response.status === 200 || response.status === 401) {
      // 401 means key is wrong but Stripe is reachable — still "up"
      // 200 means key works and Stripe is healthy
      const status: ServiceStatus = response.ok
        ? responseMs > 3000
          ? 'degraded'
          : 'up'
        : 'degraded';

      return {
        name,
        status,
        responseMs,
        checkedAt: new Date().toISOString(),
        detail: response.ok ? undefined : `HTTP ${response.status}`,
      };
    }

    return {
      name,
      status: 'down',
      responseMs,
      checkedAt: new Date().toISOString(),
      detail: `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      name,
      status: 'down',
      responseMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
      detail: err instanceof Error ? err.message : 'Request failed',
    };
  }
}

function checkResend(): ServiceCheck {
  const name = 'Resend Email';
  const apiKey = process.env.RESEND_API_KEY;
  const isConfigured = typeof apiKey === 'string' && apiKey.trim().length > 0;

  return {
    name,
    status: isConfigured ? 'up' : 'down',
    responseMs: 0,
    checkedAt: new Date().toISOString(),
    detail: isConfigured ? undefined : 'RESEND_API_KEY not configured',
  };
}

function checkAnthropic(): ServiceCheck {
  const name = 'AI Service (Anthropic)';
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isConfigured = typeof apiKey === 'string' && apiKey.trim().length > 0;

  return {
    name,
    status: isConfigured ? 'up' : 'down',
    responseMs: 0,
    checkedAt: new Date().toISOString(),
    detail: isConfigured ? undefined : 'ANTHROPIC_API_KEY not configured',
  };
}

function checkAppServer(): ServiceCheck {
  return {
    name: 'App Server',
    status: 'up',
    responseMs: 0,
    checkedAt: new Date().toISOString(),
  };
}

// ============================================================================
// OVERALL STATUS DERIVATION
// ============================================================================

function deriveOverallStatus(services: ServiceCheck[]): OverallStatus {
  const hasDown = services.some((s) => s.status === 'down');
  const hasDegraded = services.some((s) => s.status === 'degraded');

  if (hasDown) return 'degraded'; // partial failure = degraded, not fully down
  if (hasDegraded) return 'degraded';
  return 'up';
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role via profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 401 }
      );
    }

    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(profile.role as string)) {
      return NextResponse.json(
        { error: 'Forbidden: admin access required' },
        { status: 403 }
      );
    }

    // Run all checks — Supabase and Stripe are async; Resend, Anthropic, App are sync
    const [supabaseCheck, stripeCheck] = await Promise.all([
      checkSupabase(),
      checkStripe(),
    ]);

    const resendCheck = checkResend();
    const anthropicCheck = checkAnthropic();
    const appServerCheck = checkAppServer();

    const services: ServiceCheck[] = [
      supabaseCheck,
      stripeCheck,
      resendCheck,
      anthropicCheck,
      appServerCheck,
    ];

    const overall = deriveOverallStatus(services);

    const body: HealthStatusResponse = {
      services,
      overall,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('[admin/health-status] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
