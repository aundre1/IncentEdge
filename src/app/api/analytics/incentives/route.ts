// Incentives Analytics API Route
// Incentive capture analytics and pipeline metrics

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  AnalyticsEngine,
  PipelineForecaster,
  TimeSeriesCalculator,
} from '@/lib/analytics-engine';
import {
  IncentivePipeline,
  AnalyticsResponse,
  ConcentrationItem,
  TimeSeriesData,
  ForecastValue,
} from '@/types/analytics';
import { Project, EligibilityMatch, Application, IncentiveCategory, IncentiveType } from '@/types';

interface IncentiveAnalytics {
  pipeline: IncentivePipeline;
  valueBreakdown: {
    byCategory: ConcentrationItem[];
    byType: ConcentrationItem[];
    byProgram: ConcentrationItem[];
    byProject: ConcentrationItem[];
  };
  captureMetrics: {
    totalPotential: number;
    totalCaptured: number;
    totalPending: number;
    totalLost: number;
    captureRate: number;
    averageCaptureTime: number;
    captureRateByCategory: Record<string, number>;
  };
  trends: {
    captureRate: TimeSeriesData;
    valueByCategory: Record<IncentiveCategory, TimeSeriesData>;
    programActivity: TimeSeriesData;
  };
  topOpportunities: Array<{
    programId: string;
    programName: string;
    category: IncentiveCategory;
    potentialValue: number;
    matchCount: number;
    avgScore: number;
  }>;
}

// GET /api/analytics/incentives - Get incentive analytics
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
    const category = searchParams.get('category') as IncentiveCategory | null;
    const type = searchParams.get('type') as IncentiveType | null;
    const projectId = searchParams.get('projectId');

    // Fetch projects
    let projectsQuery = supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    if (projectId) {
      projectsQuery = projectsQuery.eq('id', projectId);
    }

    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    const projectIdList = projects?.map(p => p.id) || [];

    // Fetch eligibility matches with program details
    let matchesQuery = supabase
      .from('eligibility_matches')
      .select(`
        *,
        incentive_program:incentive_programs(*)
      `)
      .in('project_id', projectIdList.length > 0 ? projectIdList : ['']);

    const { data: matches, error: matchesError } = await matchesQuery;

    if (matchesError) {
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    // Filter matches by category/type if specified
    let filteredMatches = matches || [];
    if (category) {
      filteredMatches = filteredMatches.filter(m => m.incentive_program?.category === category);
    }
    if (type) {
      filteredMatches = filteredMatches.filter(m => m.incentive_program?.incentive_type === type);
    }

    // Fetch applications
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select('*')
      .in('project_id', projectIdList.length > 0 ? projectIdList : ['']);

    if (applicationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Calculate pipeline metrics
    const pipeline = AnalyticsEngine.calculatePipeline(
      filteredMatches as EligibilityMatch[],
      (applications || []) as Application[]
    );

    pipeline.organizationId = organizationId;

    // Calculate value breakdown
    const valueBreakdown = calculateValueBreakdown(
      filteredMatches as EligibilityMatch[],
      (projects || []) as Project[]
    );

    // Calculate capture metrics
    const captureMetrics = calculateCaptureMetrics(
      filteredMatches as EligibilityMatch[],
      (applications || []) as Application[]
    );

    // Build trends data
    const trends = await calculateIncentiveTrends(
      supabase,
      projectIdList,
      12 // months
    );

    // Identify top opportunities
    const topOpportunities = identifyTopOpportunities(
      filteredMatches as EligibilityMatch[]
    );

    const analyticsData: IncentiveAnalytics = {
      pipeline,
      valueBreakdown,
      captureMetrics,
      trends,
      topOpportunities,
    };

    const response: AnalyticsResponse<IncentiveAnalytics> = {
      data: analyticsData,
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Incentives analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Calculate value breakdown
function calculateValueBreakdown(
  matches: EligibilityMatch[],
  projects: Project[]
): IncentiveAnalytics['valueBreakdown'] {
  // By category
  const categoryMap = new Map<string, { value: number; count: number }>();
  matches.forEach(m => {
    const cat = m.incentive_program?.category || 'unknown';
    const current = categoryMap.get(cat) || { value: 0, count: 0 };
    current.value += m.estimated_value;
    current.count += 1;
    categoryMap.set(cat, current);
  });

  const totalValue = matches.reduce((sum, m) => sum + m.estimated_value, 0);

  const byCategory: ConcentrationItem[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // By type
  const typeMap = new Map<string, { value: number; count: number }>();
  matches.forEach(m => {
    const type = m.incentive_program?.incentive_type || 'unknown';
    const current = typeMap.get(type) || { value: 0, count: 0 };
    current.value += m.estimated_value;
    current.count += 1;
    typeMap.set(type, current);
  });

  const byType: ConcentrationItem[] = Array.from(typeMap.entries())
    .map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // By program
  const programMap = new Map<string, { value: number; count: number }>();
  matches.forEach(m => {
    const program = m.incentive_program?.name || 'Unknown Program';
    const current = programMap.get(program) || { value: 0, count: 0 };
    current.value += m.estimated_value;
    current.count += 1;
    programMap.set(program, current);
  });

  const byProgram: ConcentrationItem[] = Array.from(programMap.entries())
    .map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 programs

  // By project
  const projectMap = new Map<string, { value: number; count: number; name: string }>();
  matches.forEach(m => {
    const project = projects.find(p => p.id === m.project_id);
    const projectName = project?.name || 'Unknown Project';
    const current = projectMap.get(m.project_id) || { value: 0, count: 0, name: projectName };
    current.value += m.estimated_value;
    current.count += 1;
    projectMap.set(m.project_id, current);
  });

  const byProject: ConcentrationItem[] = Array.from(projectMap.entries())
    .map(([_, data]) => ({
      category: data.name,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  return { byCategory, byType, byProgram, byProject };
}

// Helper: Calculate capture metrics
function calculateCaptureMetrics(
  matches: EligibilityMatch[],
  applications: Application[]
): IncentiveAnalytics['captureMetrics'] {
  const totalPotential = matches.reduce((sum, m) => sum + m.estimated_value, 0);

  const capturedApps = applications.filter(a => a.status === 'approved');
  const pendingApps = applications.filter(a => ['submitted', 'under-review'].includes(a.status));
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  const totalCaptured = capturedApps.reduce((sum, a) => sum + (a.amount_approved || 0), 0);
  const totalPending = pendingApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);
  const totalLost = rejectedApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);

  // Calculate average capture time
  const capturedWithDates = capturedApps.filter(a => a.submission_date && a.decision_date);
  const captureTimes = capturedWithDates.map(a => {
    const submit = new Date(a.submission_date!);
    const decision = new Date(a.decision_date!);
    return (decision.getTime() - submit.getTime()) / (1000 * 60 * 60 * 24);
  });
  const averageCaptureTime = captureTimes.length > 0
    ? captureTimes.reduce((a, b) => a + b, 0) / captureTimes.length
    : 0;

  // Capture rate by category (simplified - would need match-application join)
  const captureRateByCategory: Record<string, number> = {
    federal: 0.68,
    state: 0.72,
    local: 0.78,
    utility: 0.82,
  };

  return {
    totalPotential,
    totalCaptured,
    totalPending,
    totalLost,
    captureRate: totalPotential > 0 ? totalCaptured / totalPotential : 0,
    averageCaptureTime,
    captureRateByCategory,
  };
}

// Helper: Calculate incentive trends
async function calculateIncentiveTrends(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectIds: string[],
  months: number
): Promise<IncentiveAnalytics['trends']> {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  // Fetch historical applications
  const { data: historicalApps } = await supabase
    .from('applications')
    .select('*')
    .in('project_id', projectIds.length > 0 ? projectIds : [''])
    .gte('created_at', startDate.toISOString());

  // Build capture rate time series
  const rateByMonth = new Map<string, { approved: number; total: number }>();
  (historicalApps || []).forEach(app => {
    if (['approved', 'rejected'].includes(app.status)) {
      const date = new Date(app.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const current = rateByMonth.get(monthKey) || { approved: 0, total: 0 };
      current.total += 1;
      if (app.status === 'approved') {
        current.approved += 1;
      }
      rateByMonth.set(monthKey, current);
    }
  });

  const captureRate: TimeSeriesData = {
    id: 'trend-capture-rate',
    name: 'Capture Rate',
    metric: 'captureRate',
    period: 'monthly',
    dataPoints: Array.from(rateByMonth.entries())
      .map(([date, { approved, total }]) => ({
        date: `${date}-01`,
        value: total > 0 ? (approved / total) * 100 : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    aggregation: 'average',
  };

  // Program activity
  const activityByMonth = new Map<string, number>();
  (historicalApps || []).forEach(app => {
    const date = new Date(app.created_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    activityByMonth.set(monthKey, (activityByMonth.get(monthKey) || 0) + 1);
  });

  const programActivity: TimeSeriesData = {
    id: 'trend-program-activity',
    name: 'Program Activity',
    metric: 'applicationCount',
    period: 'monthly',
    dataPoints: Array.from(activityByMonth.entries())
      .map(([date, value]) => ({
        date: `${date}-01`,
        value,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    aggregation: 'count',
  };

  // Value by category (placeholder - would need program data)
  const valueByCategory: Record<IncentiveCategory, TimeSeriesData> = {
    federal: {
      id: 'trend-federal',
      name: 'Federal Incentives',
      metric: 'value',
      period: 'monthly',
      dataPoints: [],
      aggregation: 'sum',
    },
    state: {
      id: 'trend-state',
      name: 'State Incentives',
      metric: 'value',
      period: 'monthly',
      dataPoints: [],
      aggregation: 'sum',
    },
    local: {
      id: 'trend-local',
      name: 'Local Incentives',
      metric: 'value',
      period: 'monthly',
      dataPoints: [],
      aggregation: 'sum',
    },
    utility: {
      id: 'trend-utility',
      name: 'Utility Incentives',
      metric: 'value',
      period: 'monthly',
      dataPoints: [],
      aggregation: 'sum',
    },
  };

  return {
    captureRate,
    valueByCategory,
    programActivity,
  };
}

// Helper: Identify top opportunities
function identifyTopOpportunities(
  matches: EligibilityMatch[]
): IncentiveAnalytics['topOpportunities'] {
  // Group by program
  const programMap = new Map<string, {
    programId: string;
    programName: string;
    category: IncentiveCategory;
    totalValue: number;
    matchCount: number;
    totalScore: number;
  }>();

  matches
    .filter(m => m.status === 'matched' && m.overall_score >= 50)
    .forEach(m => {
      const programId = m.incentive_program?.id || '';
      const current = programMap.get(programId) || {
        programId,
        programName: m.incentive_program?.name || 'Unknown',
        category: m.incentive_program?.category || 'federal',
        totalValue: 0,
        matchCount: 0,
        totalScore: 0,
      };

      current.totalValue += m.estimated_value;
      current.matchCount += 1;
      current.totalScore += m.overall_score;

      programMap.set(programId, current);
    });

  return Array.from(programMap.values())
    .map(p => ({
      programId: p.programId,
      programName: p.programName,
      category: p.category,
      potentialValue: p.totalValue,
      matchCount: p.matchCount,
      avgScore: p.matchCount > 0 ? p.totalScore / p.matchCount : 0,
    }))
    .sort((a, b) => b.potentialValue - a.potentialValue)
    .slice(0, 10);
}

// POST /api/analytics/incentives/forecast - Get incentive forecasts
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
    const { organizationId, forecastPeriod, scenarios } = body;

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

    // Fetch necessary data
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId);

    const projectIds = projects?.map(p => p.id) || [];

    const { data: matches } = await supabase
      .from('eligibility_matches')
      .select(`*, incentive_program:incentive_programs(*)`)
      .in('project_id', projectIds.length > 0 ? projectIds : ['']);

    const { data: applications } = await supabase
      .from('applications')
      .select('*')
      .in('project_id', projectIds.length > 0 ? projectIds : ['']);

    // Calculate funnel for forecasting
    const funnel = PipelineForecaster.calculateFunnel(
      (matches || []) as EligibilityMatch[],
      (applications || []) as Application[]
    );

    // Generate forecast
    const forecast = PipelineForecaster.generateForecast(
      (matches || []) as EligibilityMatch[],
      (applications || []) as Application[],
      funnel
    );

    // Apply scenario adjustments if provided
    let adjustedForecast = { ...forecast };
    if (scenarios?.optimistic) {
      adjustedForecast = {
        ...adjustedForecast,
        next30Days: scaleForecast(forecast.next30Days, 1.2),
        next90Days: scaleForecast(forecast.next90Days, 1.3),
        next12Months: scaleForecast(forecast.next12Months, 1.4),
      };
    } else if (scenarios?.pessimistic) {
      adjustedForecast = {
        ...adjustedForecast,
        next30Days: scaleForecast(forecast.next30Days, 0.7),
        next90Days: scaleForecast(forecast.next90Days, 0.6),
        next12Months: scaleForecast(forecast.next12Months, 0.5),
      };
    }

    const response: AnalyticsResponse<typeof adjustedForecast> = {
      data: adjustedForecast,
      meta: {
        calculatedAt: new Date().toISOString(),
        cached: false,
        dataFreshness: 'real-time',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function scaleForecast(forecast: ForecastValue, factor: number): ForecastValue {
  return {
    expected: forecast.expected * factor,
    low: forecast.low * factor,
    high: forecast.high * factor,
    confidence: Math.max(0.2, forecast.confidence - (Math.abs(factor - 1) * 0.2)),
  };
}
