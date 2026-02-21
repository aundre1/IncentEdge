import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// DASHBOARD STATS API
// Returns KPIs, portfolio summary, and aggregated metrics
// ============================================================================

export interface DashboardStats {
  // Portfolio KPIs
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  // Financial KPIs
  totalDevelopmentCost: number;
  totalPotentialIncentives: number;
  totalCapturedIncentives: number;
  netCost: number;
  subsidyRate: number;
  // Application KPIs
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  successRate: number;
  // By Category Breakdown
  incentivesByCategory: {
    federal: number;
    state: number;
    local: number;
    utility: number;
  };
  // Sustainability Breakdown
  projectsByTier: {
    tier_1_efficient: number;
    tier_2_high_performance: number;
    tier_3_net_zero: number;
    tier_3_triple_net_zero: number;
  };
  // Time-based metrics
  capturedThisMonth: number;
  capturedThisQuarter: number;
  capturedThisYear: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const orgId = profile.organization_id;

    // ========================================================================
    // PROJECT STATS
    // ========================================================================
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        project_status,
        total_development_cost,
        total_potential_incentives,
        total_captured_incentives,
        sustainability_tier
      `)
      .eq('organization_id', orgId);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json({ error: projectsError.message }, { status: 500 });
    }

    // Calculate project counts
    const totalProjects = projects?.length || 0;
    const activeProjects = projects?.filter(p => p.project_status === 'active').length || 0;
    const completedProjects = projects?.filter(p => p.project_status === 'completed').length || 0;
    const onHoldProjects = projects?.filter(p => p.project_status === 'on-hold').length || 0;

    // Calculate financial totals
    const totalDevelopmentCost = projects?.reduce((sum, p) => sum + (p.total_development_cost || 0), 0) || 0;
    const totalPotentialIncentives = projects?.reduce((sum, p) => sum + (p.total_potential_incentives || 0), 0) || 0;
    const totalCapturedIncentives = projects?.reduce((sum, p) => sum + (p.total_captured_incentives || 0), 0) || 0;
    const netCost = totalDevelopmentCost - totalCapturedIncentives;
    const subsidyRate = totalDevelopmentCost > 0 ? (totalPotentialIncentives / totalDevelopmentCost) * 100 : 0;

    // Count by sustainability tier
    const projectsByTier = {
      tier_1_efficient: projects?.filter(p => p.sustainability_tier === 'tier_1_efficient' || !p.sustainability_tier).length || 0,
      tier_2_high_performance: projects?.filter(p => p.sustainability_tier === 'tier_2_high_performance').length || 0,
      tier_3_net_zero: projects?.filter(p => p.sustainability_tier === 'tier_3_net_zero').length || 0,
      tier_3_triple_net_zero: projects?.filter(p => p.sustainability_tier === 'tier_3_triple_net_zero').length || 0,
    };

    // ========================================================================
    // APPLICATION STATS
    // ========================================================================
    const { data: applications } = await supabase
      .from('applications')
      .select('id, status, amount_approved, created_at')
      .eq('organization_id', orgId);

    const totalApplications = applications?.length || 0;
    const pendingApplications = applications?.filter(a =>
      ['draft', 'in-progress', 'submitted', 'under-review'].includes(a.status)
    ).length || 0;
    const approvedApplications = applications?.filter(a =>
      ['approved', 'partially-approved'].includes(a.status)
    ).length || 0;
    const rejectedApplications = applications?.filter(a => a.status === 'rejected').length || 0;
    const decidedApplications = approvedApplications + rejectedApplications;
    const successRate = decidedApplications > 0 ? (approvedApplications / decidedApplications) * 100 : 0;

    // ========================================================================
    // INCENTIVES BY CATEGORY
    // ========================================================================
    const { data: matches } = await supabase
      .from('project_incentive_matches')
      .select(`
        estimated_value,
        status,
        incentive_program:incentive_programs (category)
      `)
      .in('project_id', projects?.map(p => p.id) || [])
      .neq('status', 'dismissed');

    const incentivesByCategory = {
      federal: 0,
      state: 0,
      local: 0,
      utility: 0,
    };

    matches?.forEach((match: any) => {
      const category = match.incentive_program?.category;
      if (category && incentivesByCategory.hasOwnProperty(category)) {
        incentivesByCategory[category as keyof typeof incentivesByCategory] += match.estimated_value || 0;
      }
    });

    // ========================================================================
    // TIME-BASED METRICS
    // ========================================================================
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const { data: capturedApps } = await supabase
      .from('applications')
      .select('amount_approved, decision_date')
      .eq('organization_id', orgId)
      .eq('status', 'approved')
      .not('amount_approved', 'is', null);

    let capturedThisMonth = 0;
    let capturedThisQuarter = 0;
    let capturedThisYear = 0;

    capturedApps?.forEach((app: any) => {
      const decisionDate = new Date(app.decision_date);
      const amount = app.amount_approved || 0;

      if (decisionDate >= startOfMonth) {
        capturedThisMonth += amount;
      }
      if (decisionDate >= startOfQuarter) {
        capturedThisQuarter += amount;
      }
      if (decisionDate >= startOfYear) {
        capturedThisYear += amount;
      }
    });

    // ========================================================================
    // BUILD RESPONSE
    // ========================================================================
    const stats: DashboardStats = {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalDevelopmentCost,
      totalPotentialIncentives,
      totalCapturedIncentives,
      netCost,
      subsidyRate,
      totalApplications,
      pendingApplications,
      approvedApplications,
      successRate,
      incentivesByCategory,
      projectsByTier,
      capturedThisMonth,
      capturedThisQuarter,
      capturedThisYear,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
