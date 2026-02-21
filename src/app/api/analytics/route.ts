// Analytics Dashboard API Route
// Main analytics endpoint for dashboard data

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AnalyticsEngine,
  TimeSeriesCalculator,
  InsightGenerator,
} from '@/lib/analytics-engine';
import {
  DashboardAnalytics,
  AnalyticsRequest,
  AnalyticsResponse,
  DateRange,
} from '@/types/analytics';
import { Project, EligibilityMatch, Application } from '@/types';

// GET /api/analytics - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const organizationId = userData.organization_id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const projectIds = searchParams.get('projectIds')?.split(',').filter(Boolean);
    const states = searchParams.get('states')?.split(',').filter(Boolean);
    const sectors = searchParams.get('sectors')?.split(',').filter(Boolean);

    // Fetch projects
    let projectsQuery = supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    if (projectIds && projectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', projectIds);
    }
    if (states && states.length > 0) {
      projectsQuery = projectsQuery.in('state', states);
    }
    if (sectors && sectors.length > 0) {
      projectsQuery = projectsQuery.in('sector_type', sectors);
    }

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectIdList = projects?.map(p => p.id) || [];

    // Fetch eligibility matches
    let matchesQuery = supabase
      .from('eligibility_matches')
      .select(`
        *,
        incentive_program:incentive_programs(*)
      `);

    if (projectIdList.length > 0) {
      matchesQuery = matchesQuery.in('project_id', projectIdList);
    }

    const { data: matches, error: matchesError } = await matchesQuery;

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json(
        { error: 'Failed to fetch eligibility matches' },
        { status: 500 }
      );
    }

    // Fetch applications
    let applicationsQuery = supabase
      .from('applications')
      .select('*');

    if (projectIdList.length > 0) {
      applicationsQuery = applicationsQuery.in('project_id', projectIdList);
    }

    // Apply date range filter if provided
    if (startDate) {
      applicationsQuery = applicationsQuery.gte('created_at', startDate);
    }
    if (endDate) {
      applicationsQuery = applicationsQuery.lte('created_at', endDate);
    }

    const { data: applications, error: applicationsError } = await applicationsQuery;

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Calculate dashboard analytics
    const dashboardAnalytics = AnalyticsEngine.calculateDashboardAnalytics(
      (projects || []) as Project[],
      (matches || []) as EligibilityMatch[],
      (applications || []) as Application[]
    );

    // Update organization ID
    dashboardAnalytics.organizationId = organizationId;

    // Build response
    const response: AnalyticsResponse<DashboardAnalytics> = {
      data: dashboardAnalytics,
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Calculate analytics with specific parameters
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: AnalyticsRequest = await request.json();
    const { organizationId, dateRange, filters, groupBy, metrics } = body;

    // Verify user has access to organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || userData?.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized access to organization' },
        { status: 403 }
      );
    }

    // Build project query with filters
    let projectsQuery = supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    if (filters?.projectIds && filters.projectIds.length > 0) {
      projectsQuery = projectsQuery.in('id', filters.projectIds);
    }
    if (filters?.states && filters.states.length > 0) {
      projectsQuery = projectsQuery.in('state', filters.states);
    }
    if (filters?.sectors && filters.sectors.length > 0) {
      projectsQuery = projectsQuery.in('sector_type', filters.sectors);
    }

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectIdList = projects?.map(p => p.id) || [];

    // Fetch matches with incentive program data
    let matchesQuery = supabase
      .from('eligibility_matches')
      .select(`
        *,
        incentive_program:incentive_programs(*)
      `);

    if (projectIdList.length > 0) {
      matchesQuery = matchesQuery.in('project_id', projectIdList);
    }

    if (filters?.categories && filters.categories.length > 0) {
      // This would need a join condition - simplified here
    }

    const { data: matches, error: matchesError } = await matchesQuery;

    if (matchesError) {
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    // Fetch applications
    let applicationsQuery = supabase
      .from('applications')
      .select('*');

    if (projectIdList.length > 0) {
      applicationsQuery = applicationsQuery.in('project_id', projectIdList);
    }

    if (dateRange?.start) {
      applicationsQuery = applicationsQuery.gte('created_at', dateRange.start);
    }
    if (dateRange?.end) {
      applicationsQuery = applicationsQuery.lte('created_at', dateRange.end);
    }

    if (filters?.statuses && filters.statuses.length > 0) {
      applicationsQuery = applicationsQuery.in('status', filters.statuses);
    }

    const { data: applications, error: applicationsError } = await applicationsQuery;

    if (applicationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const dashboardAnalytics = AnalyticsEngine.calculateDashboardAnalytics(
      (projects || []) as Project[],
      (matches || []) as EligibilityMatch[],
      (applications || []) as Application[]
    );

    dashboardAnalytics.organizationId = organizationId;

    const response: AnalyticsResponse<DashboardAnalytics> = {
      data: dashboardAnalytics,
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
