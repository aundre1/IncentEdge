import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

type Range = 'today' | '7d' | '30d' | 'all';

interface FunnelStep {
  step: number;
  label: string;
  count: number;
  pctOfPrevious: number | null;
  deltaVsLastWeek: number | null;
}

interface DailySignup {
  date: string;
  count: number;
}

interface RecentUser {
  email: string;
  signedUpAt: string;
  onboarded: boolean;
  searched: boolean;
  paid: boolean;
}

interface FunnelStatsResponse {
  funnel: FunnelStep[];
  dailySignups: DailySignup[];
  recentUsers: RecentUser[];
}

// ============================================================================
// HELPERS
// ============================================================================

function getRangeStart(range: Range): string | null {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start.toISOString();
    }
    case '7d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return start.toISOString();
    }
    case '30d': {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return start.toISOString();
    }
    case 'all':
      return null;
    default:
      return null;
  }
}

function getLastWeekStart(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 14);
  return start.toISOString();
}

function getLastWeekEnd(): string {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() - 7);
  return end.toISOString();
}

function calcPct(count: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round((count / previous) * 100);
}

function calcDelta(current: number, lastWeek: number): number {
  return current - lastWeek;
}

function isValidRange(value: string | null): value is Range {
  return value === 'today' || value === '7d' || value === '30d' || value === 'all';
}

// ============================================================================
// GET /api/admin/funnel-stats
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // --- Auth check ---
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Admin role check ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    const allowedRoles = ['admin', 'super_admin'];
    if (!allowedRoles.includes(profile.role as string)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // --- Parse range param ---
    const { searchParams } = new URL(request.url);
    const rawRange = searchParams.get('range');
    const range: Range = isValidRange(rawRange) ? rawRange : '30d';

    const rangeStart = getRangeStart(range);
    const lastWeekStart = getLastWeekStart();
    const lastWeekEnd = getLastWeekEnd();

    // -------------------------------------------------------------------------
    // Step 1: Leads Captured — count from lead_captures table
    // -------------------------------------------------------------------------
    let leadsQuery = supabase
      .from('lead_captures')
      .select('id', { count: 'exact', head: true });

    if (rangeStart) {
      leadsQuery = leadsQuery.gte('created_at', rangeStart);
    }

    const { count: leadsCount, error: leadsError } = await leadsQuery;

    let leadsLastWeek = 0;
    if (range !== 'all') {
      const { count } = await supabase
        .from('lead_captures')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', lastWeekStart)
        .lt('created_at', lastWeekEnd);
      leadsLastWeek = count ?? 0;
    }

    if (leadsError) {
      console.error('[funnel-stats] leads query error:', leadsError.message);
    }

    // -------------------------------------------------------------------------
    // Step 2: Signed Up — count from profiles table
    // -------------------------------------------------------------------------
    let signupsQuery = supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (rangeStart) {
      signupsQuery = signupsQuery.gte('created_at', rangeStart);
    }

    const { count: signupsCount, error: signupsError } = await signupsQuery;

    let signupsLastWeek = 0;
    if (range !== 'all') {
      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', lastWeekStart)
        .lt('created_at', lastWeekEnd);
      signupsLastWeek = count ?? 0;
    }

    if (signupsError) {
      console.error('[funnel-stats] signups query error:', signupsError.message);
    }

    // -------------------------------------------------------------------------
    // Step 3: Onboarded — distinct user_ids who created a project
    // -------------------------------------------------------------------------
    let projectsQuery = supabase
      .from('projects')
      .select('created_by', { count: 'exact', head: false });

    if (rangeStart) {
      projectsQuery = projectsQuery.gte('created_at', rangeStart);
    }

    const { data: projectsData, error: projectsError } = await projectsQuery;

    const onboardedCount = projectsData
      ? new Set(projectsData.map((r: { created_by: string }) => r.created_by)).size
      : 0;

    let onboardedLastWeek = 0;
    if (range !== 'all') {
      const { data: lwProjectsData } = await supabase
        .from('projects')
        .select('created_by')
        .gte('created_at', lastWeekStart)
        .lt('created_at', lastWeekEnd);
      onboardedLastWeek = lwProjectsData
        ? new Set(lwProjectsData.map((r: { created_by: string }) => r.created_by)).size
        : 0;
    }

    if (projectsError) {
      console.error('[funnel-stats] projects query error:', projectsError.message);
    }

    // -------------------------------------------------------------------------
    // Step 4: First Incentive Search — users who ran an analysis
    // We check the eligibility_results table (or activity_logs) for distinct users.
    // We try eligibility_results first; fall back gracefully if absent.
    // -------------------------------------------------------------------------
    let searchedCount = 0;
    let searchedLastWeek = 0;

    // Build eligibility_results query inline (no IIFE — avoids inference issues)
    let erQuery = supabase.from('eligibility_results').select('user_id');
    if (rangeStart) {
      erQuery = erQuery.gte('created_at', rangeStart);
    }
    const { data: searchData, error: searchError } = await erQuery;

    if (!searchError && searchData) {
      searchedCount = new Set(
        (searchData as Array<{ user_id: string }>).map((r) => r.user_id)
      ).size;

      if (range !== 'all') {
        const { data: lwSearch } = await supabase
          .from('eligibility_results')
          .select('user_id')
          .gte('created_at', lastWeekStart)
          .lt('created_at', lastWeekEnd);
        searchedLastWeek = lwSearch
          ? new Set((lwSearch as Array<{ user_id: string }>).map((r) => r.user_id)).size
          : 0;
      }
    } else if (searchError) {
      // eligibility_results may not exist yet — fall back to activity_logs
      let alQuery = supabase
        .from('activity_logs')
        .select('user_id')
        .eq('action_type', 'analyze');
      if (rangeStart) {
        alQuery = alQuery.gte('created_at', rangeStart);
      }
      const { data: actData, error: actError } = await alQuery;

      if (!actError && actData) {
        searchedCount = new Set(
          (actData as Array<{ user_id: string }>).map((r) => r.user_id)
        ).size;

        if (range !== 'all') {
          const { data: lwAct } = await supabase
            .from('activity_logs')
            .select('user_id')
            .eq('action_type', 'analyze')
            .gte('created_at', lastWeekStart)
            .lt('created_at', lastWeekEnd);
          searchedLastWeek = lwAct
            ? new Set((lwAct as Array<{ user_id: string }>).map((r) => r.user_id)).size
            : 0;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Step 5: Paid — active subscriptions
    // -------------------------------------------------------------------------
    let paidQuery = supabase
      .from('subscriptions')
      .select('user_id', { head: false })
      .eq('status', 'active');

    if (rangeStart) {
      paidQuery = paidQuery.gte('created_at', rangeStart);
    }

    const { data: paidData, error: paidError } = await paidQuery;

    const paidCount = paidData
      ? new Set((paidData as Array<{ user_id: string }>).map((r) => r.user_id)).size
      : 0;

    let paidLastWeek = 0;
    if (range !== 'all') {
      const { data: lwPaid } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'active')
        .gte('created_at', lastWeekStart)
        .lt('created_at', lastWeekEnd);
      paidLastWeek = lwPaid
        ? new Set((lwPaid as Array<{ user_id: string }>).map((r) => r.user_id)).size
        : 0;
    }

    if (paidError) {
      console.error('[funnel-stats] subscriptions query error:', paidError.message);
    }

    // -------------------------------------------------------------------------
    // Build funnel array
    // -------------------------------------------------------------------------
    const steps: Array<{ label: string; count: number; lastWeekCount: number }> = [
      { label: 'Leads Captured', count: leadsCount ?? 0, lastWeekCount: leadsLastWeek },
      { label: 'Signed Up', count: signupsCount ?? 0, lastWeekCount: signupsLastWeek },
      { label: 'Onboarded', count: onboardedCount, lastWeekCount: onboardedLastWeek },
      { label: 'First Incentive Search', count: searchedCount, lastWeekCount: searchedLastWeek },
      { label: 'Paid', count: paidCount, lastWeekCount: paidLastWeek },
    ];

    const funnel: FunnelStep[] = steps.map((step, idx) => ({
      step: idx + 1,
      label: step.label,
      count: step.count,
      pctOfPrevious:
        idx === 0 ? null : calcPct(step.count, steps[idx - 1].count),
      deltaVsLastWeek:
        range === 'all' ? null : calcDelta(step.count, step.lastWeekCount),
    }));

    // -------------------------------------------------------------------------
    // Daily signups for last 30 days (always shown regardless of range selector)
    // -------------------------------------------------------------------------
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: rawDailySignups, error: dailyError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (dailyError) {
      console.error('[funnel-stats] daily signups error:', dailyError.message);
    }

    // Aggregate by date string YYYY-MM-DD
    const dailyMap = new Map<string, number>();
    (rawDailySignups ?? []).forEach((row: { created_at: string }) => {
      const date = row.created_at.slice(0, 10);
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    });

    // Fill in zeros for all 30 days so chart has a continuous x-axis
    const dailySignups: DailySignup[] = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return { date: dateStr, count: dailyMap.get(dateStr) ?? 0 };
    });

    // -------------------------------------------------------------------------
    // Recent users table — last 50 signups with onboarded/searched/paid flags
    // -------------------------------------------------------------------------
    const { data: recentProfilesData, error: recentError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (recentError) {
      console.error('[funnel-stats] recent profiles error:', recentError.message);
    }

    const recentProfiles = (recentProfilesData ?? []) as Array<{
      id: string;
      email: string;
      created_at: string;
    }>;

    // Collect all user ids for batch lookups
    const recentIds = recentProfiles.map((p) => p.id);

    // Who has a project?
    const { data: onboardedIds } = recentIds.length
      ? await supabase
          .from('projects')
          .select('created_by')
          .in('created_by', recentIds)
      : { data: [] };

    const onboardedSet = new Set(
      (onboardedIds ?? []).map((r: { created_by: string }) => r.created_by)
    );

    // Who has searched? Try eligibility_results first
    let searchedSet = new Set<string>();
    if (recentIds.length) {
      const { data: searchedIds, error: sErr } = await supabase
        .from('eligibility_results')
        .select('user_id')
        .in('user_id', recentIds);

      if (!sErr && searchedIds) {
        searchedSet = new Set(
          (searchedIds as Array<{ user_id: string }>).map((r) => r.user_id)
        );
      } else {
        // Fallback: activity_logs
        const { data: actIds } = await supabase
          .from('activity_logs')
          .select('user_id')
          .in('user_id', recentIds)
          .eq('action_type', 'analyze');
        searchedSet = new Set(
          ((actIds ?? []) as Array<{ user_id: string }>).map((r) => r.user_id)
        );
      }
    }

    // Who has paid?
    const { data: paidIds } = recentIds.length
      ? await supabase
          .from('subscriptions')
          .select('user_id')
          .in('user_id', recentIds)
          .eq('status', 'active')
      : { data: [] };

    const paidSet = new Set(
      ((paidIds ?? []) as Array<{ user_id: string }>).map((r) => r.user_id)
    );

    const recentUsers: RecentUser[] = recentProfiles.map((p) => ({
      email: p.email,
      signedUpAt: p.created_at,
      onboarded: onboardedSet.has(p.id),
      searched: searchedSet.has(p.id),
      paid: paidSet.has(p.id),
    }));

    // -------------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------------
    const responseBody: FunnelStatsResponse = {
      funnel,
      dailySignups,
      recentUsers,
    };

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[funnel-stats] unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
