/**
 * Admin Revenue Stats API
 *
 * Returns MRR/ARR, subscription counts, churn, and monthly revenue breakdown.
 * Requires admin or super_admin role in the profiles table.
 *
 * GET /api/admin/revenue-stats
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface RecentSubscription {
  id: string;
  email: string;
  plan: string;
  amount: number;
  startDate: string;
  status: string;
}

interface RecentChurn {
  id: string;
  email: string;
  plan: string;
  churnedDate: string;
  revenueLost: number;
}

interface RevenueStatsResponse {
  mrr: number;
  arr: number;
  newToday: number;
  trialConversions: number;
  churnRate: number;
  monthlyRevenue: MonthlyRevenue[];
  recentSubscriptions: RecentSubscription[];
  recentChurn: RecentChurn[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase admin configuration');
  }

  return createAdminClient(url, key);
}

/**
 * Build an ISO date string for the start of N months ago (UTC).
 */
function monthsAgoIso(n: number): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString();
}

/**
 * Format a Date (or ISO string) as "Mon YYYY" label.
 */
function formatMonthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Build last 6 month labels in ascending order (oldest → newest).
 */
function buildMonthBuckets(): { key: string; label: string }[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    const iso = d.toISOString();
    return {
      key: iso.slice(0, 7), // "YYYY-MM"
      label: formatMonthLabel(iso),
    };
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // ── 1. Auth: require authenticated user ──────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Auth: require admin or super_admin role ───────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminRoles = ['admin', 'super_admin'] as const;
    if (!adminRoles.includes(profile.role as (typeof adminRoles)[number])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 3. Use service-role client for unrestricted reads ───────────────────
    const adminDb = getSupabaseAdmin();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfMonth = new Date(now);
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const sixMonthsAgo = monthsAgoIso(6);
    const oneMonthAgo = monthsAgoIso(1);

    // ── 4. Fetch subscriptions data ──────────────────────────────────────────
    const [
      { data: activeRows, error: activeErr },
      { data: trialRows, error: trialErr },
      { data: canceledRows, error: canceledErr },
      { data: newTodayRows, error: newTodayErr },
      { data: recentSubRows, error: recentSubErr },
    ] = await Promise.all([
      // Active subscriptions (for MRR)
      adminDb
        .from('subscriptions')
        .select('tier, stripe_subscription_id, stripe_customer_id, current_period_start')
        .eq('status', 'active'),

      // Trialing subscriptions
      adminDb
        .from('subscriptions')
        .select('tier, stripe_subscription_id')
        .eq('status', 'trialing'),

      // Canceled this month (churn)
      adminDb
        .from('subscriptions')
        .select('tier, stripe_subscription_id, canceled_at, stripe_customer_id')
        .eq('status', 'canceled')
        .gte('canceled_at', startOfMonth.toISOString()),

      // New subscriptions created today
      adminDb
        .from('subscriptions')
        .select('stripe_subscription_id')
        .in('status', ['active', 'trialing'])
        .gte('created_at', startOfToday.toISOString()),

      // Recent 10 subscriptions for the table
      adminDb
        .from('subscriptions')
        .select('stripe_subscription_id, stripe_customer_id, tier, status, current_period_start')
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (activeErr) {
      console.error('[Revenue API] Error fetching active subscriptions:', activeErr.message);
    }
    if (trialErr) {
      console.error('[Revenue API] Error fetching trial subscriptions:', trialErr.message);
    }
    if (canceledErr) {
      console.error('[Revenue API] Error fetching canceled subscriptions:', canceledErr.message);
    }
    if (newTodayErr) {
      console.error('[Revenue API] Error fetching new today:', newTodayErr.message);
    }
    if (recentSubErr) {
      console.error('[Revenue API] Error fetching recent subscriptions:', recentSubErr.message);
    }

    // ── 5. Fetch billing events for monthly revenue ──────────────────────────
    const { data: billingRows, error: billingErr } = await adminDb
      .from('billing_events')
      .select('amount, created_at, stripe_subscription_id')
      .eq('event_type', 'payment_succeeded')
      .gte('created_at', sixMonthsAgo)
      .order('created_at', { ascending: true });

    if (billingErr) {
      console.error('[Revenue API] Error fetching billing events:', billingErr.message);
    }

    // Recent churn data from canceled subscriptions (last 30 days for table)
    const { data: recentChurnRows, error: recentChurnErr } = await adminDb
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, tier, canceled_at')
      .eq('status', 'canceled')
      .gte('canceled_at', oneMonthAgo)
      .order('canceled_at', { ascending: false })
      .limit(10);

    if (recentChurnErr) {
      console.error('[Revenue API] Error fetching recent churn:', recentChurnErr.message);
    }

    // ── 6. Tier → monthly price mapping (in dollars) ─────────────────────────
    const TIER_PRICE_MAP: Record<string, number> = {
      solo: 8500,
      team: 18000,
      enterprise: 35000,
      free: 0,
    };

    // ── 7. Calculate MRR from active subscriptions ───────────────────────────
    const safActiveRows = activeRows ?? [];
    const mrr = safActiveRows.reduce((sum, row) => {
      const price = TIER_PRICE_MAP[row.tier as string] ?? 0;
      return sum + price;
    }, 0);

    const arr = mrr * 12;

    // ── 8. New today and trial conversions this month ────────────────────────
    const newToday = (newTodayRows ?? []).length;

    // Trial conversions = subscriptions that moved from trialing to active this month
    // We approximate this as active subscriptions whose period started this month
    const trialConversions = safActiveRows.filter((row) => {
      if (!row.current_period_start) return false;
      return new Date(row.current_period_start) >= startOfMonth;
    }).length;

    // ── 9. Churn rate = canceled this month / (active + canceled this month) ─
    const activeCount = safActiveRows.length;
    const canceledCount = (canceledRows ?? []).length;
    const churnDenominator = activeCount + canceledCount;
    const churnRate =
      churnDenominator > 0
        ? Math.round((canceledCount / churnDenominator) * 1000) / 10
        : 0;

    // ── 10. Monthly revenue buckets (last 6 months) ──────────────────────────
    const buckets = buildMonthBuckets();

    // Sum billing_events by month key
    const revenueByMonth = new Map<string, number>();
    for (const bucket of buckets) {
      revenueByMonth.set(bucket.key, 0);
    }

    for (const row of billingRows ?? []) {
      const key = (row.created_at as string).slice(0, 7);
      if (revenueByMonth.has(key)) {
        const current = revenueByMonth.get(key) ?? 0;
        // amount is in cents, convert to dollars
        revenueByMonth.set(key, current + (row.amount as number) / 100);
      }
    }

    const monthlyRevenue: MonthlyRevenue[] = buckets.map((b) => ({
      month: b.label,
      revenue: Math.round((revenueByMonth.get(b.key) ?? 0) * 100) / 100,
    }));

    // ── 11. Build recent subscriptions table rows ────────────────────────────
    const recentSubscriptions: RecentSubscription[] = (recentSubRows ?? []).map(
      (row) => ({
        id: row.stripe_subscription_id as string,
        email: `customer-${(row.stripe_customer_id as string).slice(-6)}@stripe`, // no email in subscriptions table — use placeholder
        plan: (row.tier as string) ?? 'unknown',
        amount: TIER_PRICE_MAP[(row.tier as string) ?? ''] ?? 0,
        startDate: (row.current_period_start as string) ?? '',
        status: (row.status as string) ?? 'unknown',
      })
    );

    // ── 12. Build recent churn table rows ────────────────────────────────────
    const recentChurn: RecentChurn[] = (recentChurnRows ?? []).map((row) => ({
      id: row.stripe_subscription_id as string,
      email: `customer-${(row.stripe_customer_id as string).slice(-6)}@stripe`,
      plan: (row.tier as string) ?? 'unknown',
      churnedDate: (row.canceled_at as string) ?? '',
      revenueLost: TIER_PRICE_MAP[(row.tier as string) ?? ''] ?? 0,
    }));

    // ── 13. Build response ────────────────────────────────────────────────────
    const responseBody: RevenueStatsResponse = {
      mrr,
      arr,
      newToday,
      trialConversions,
      churnRate,
      monthlyRevenue,
      recentSubscriptions,
      recentChurn,
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Revenue API] Unhandled error:', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
