// Portfolio Analytics API Route
// Portfolio-level metrics and trends

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AnalyticsEngine,
  ConcentrationAnalyzer,
  TimeSeriesCalculator,
} from '@/lib/analytics-engine';
import {
  PortfolioMetrics,
  AnalyticsResponse,
  GrowthMetrics,
  ConcentrationAnalysis,
  TimeSeriesData,
} from '@/types/analytics';
import { Project, EligibilityMatch, Application } from '@/types';

// GET /api/analytics/portfolio - Get portfolio metrics
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
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const historyMonths = parseInt(searchParams.get('historyMonths') || '12', 10);

    // Fetch all projects for organization
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectIdList = projects?.map(p => p.id) || [];

    // Fetch eligibility matches
    const { data: matches, error: matchesError } = await supabase
      .from('eligibility_matches')
      .select(`
        *,
        incentive_program:incentive_programs(*)
      `)
      .in('project_id', projectIdList.length > 0 ? projectIdList : ['']);

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json(
        { error: 'Failed to fetch eligibility matches' },
        { status: 500 }
      );
    }

    // Fetch applications
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .in('project_id', projectIdList.length > 0 ? projectIdList : ['']);

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Calculate portfolio metrics
    const portfolioMetrics = AnalyticsEngine.calculatePortfolioMetrics(
      (projects || []) as Project[],
      (matches || []) as EligibilityMatch[],
      (applications || []) as Application[]
    );

    portfolioMetrics.organizationId = organizationId;

    // Calculate historical trends if requested
    if (includeHistory) {
      const historicalData = await calculateHistoricalTrends(
        supabase,
        projectIdList,
        historyMonths
      );

      portfolioMetrics.trends = {
        ...portfolioMetrics.trends,
        ...historicalData,
      };
    }

    // Build response
    const response: AnalyticsResponse<PortfolioMetrics> = {
      data: portfolioMetrics,
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Portfolio analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate historical trends
async function calculateHistoricalTrends(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[],
  months: number
) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Fetch historical applications with dates
  const { data: historicalApps, error } = await supabase
    .from('applications')
    .select('*')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error || !historicalApps) {
    return {};
  }

  // Build time series for captured value
  const capturedByMonth = new Map<string, number>();
  const volumeByMonth = new Map<string, number>();
  const successByMonth = new Map<string, { approved: number; total: number }>();

  historicalApps.forEach(app => {
    const date = new Date(app.created_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // Volume
    volumeByMonth.set(monthKey, (volumeByMonth.get(monthKey) || 0) + 1);

    // Captured value
    if (app.status === 'approved' && app.amount_approved) {
      capturedByMonth.set(monthKey, (capturedByMonth.get(monthKey) || 0) + app.amount_approved);
    }

    // Success tracking
    if (['approved', 'rejected'].includes(app.status)) {
      const current = successByMonth.get(monthKey) || { approved: 0, total: 0 };
      current.total += 1;
      if (app.status === 'approved') {
        current.approved += 1;
      }
      successByMonth.set(monthKey, current);
    }
  });

  // Convert to time series format
  const incentiveCaptureData: TimeSeriesData = {
    id: 'trend-capture',
    name: 'Incentive Capture',
    metric: 'capturedValue',
    period: 'monthly',
    dataPoints: Array.from(capturedByMonth.entries()).map(([date, value]) => ({
      date: `${date}-01`,
      value,
    })),
    aggregation: 'sum',
  };

  const applicationVolumeData: TimeSeriesData = {
    id: 'trend-volume',
    name: 'Application Volume',
    metric: 'applicationCount',
    period: 'monthly',
    dataPoints: Array.from(volumeByMonth.entries()).map(([date, value]) => ({
      date: `${date}-01`,
      value,
    })),
    aggregation: 'count',
  };

  const successRateData: TimeSeriesData = {
    id: 'trend-success',
    name: 'Success Rate',
    metric: 'approvalRate',
    period: 'monthly',
    dataPoints: Array.from(successByMonth.entries()).map(([date, { approved, total }]) => ({
      date: `${date}-01`,
      value: total > 0 ? (approved / total) * 100 : 0,
    })),
    aggregation: 'average',
  };

  // Calculate growth metrics
  const captureDataPoints = incentiveCaptureData.dataPoints;
  const growth = TimeSeriesCalculator.calculateGrowthMetrics(captureDataPoints);

  return {
    incentiveCapture: incentiveCaptureData,
    applicationVolume: applicationVolumeData,
    successRate: successRateData,
    growth,
  };
}

// POST /api/analytics/portfolio/concentration - Detailed concentration analysis
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

    const body = await request.json();
    const { organizationId, analysisType } = body;

    // Verify access
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userData?.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch data
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    const projectIds = projects?.map(p => p.id) || [];

    const { data: matches } = await supabase
      .from('eligibility_matches')
      .select(`*, incentive_program:incentive_programs(*)`)
      .in('project_id', projectIds.length > 0 ? projectIds : ['']);

    // Perform concentration analysis
    const concentration = ConcentrationAnalyzer.analyzeConcentration(
      (projects || []) as Project[],
      (matches || []) as EligibilityMatch[]
    );

    // Add detailed HHI interpretation
    const hiiInterpretation = {
      geographic: interpretHHI(concentration.geographicHHI),
      sector: interpretHHI(concentration.sectorHHI),
      incentive: interpretHHI(concentration.incentiveHHI),
    };

    const response: AnalyticsResponse<ConcentrationAnalysis & { interpretation: typeof hiiInterpretation }> = {
      data: {
        ...concentration,
        interpretation: hiiInterpretation,
      },
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Concentration analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function interpretHHI(hhi: number): {
  level: 'low' | 'moderate' | 'high';
  description: string;
  recommendation: string;
} {
  if (hhi < 1500) {
    return {
      level: 'low',
      description: 'Well diversified - low concentration risk',
      recommendation: 'Current diversification is healthy',
    };
  } else if (hhi < 2500) {
    return {
      level: 'moderate',
      description: 'Moderate concentration - some risk exposure',
      recommendation: 'Consider expanding into additional areas to reduce risk',
    };
  } else {
    return {
      level: 'high',
      description: 'High concentration - significant risk exposure',
      recommendation: 'Strongly recommend diversifying to reduce single-point-of-failure risk',
    };
  }
}
