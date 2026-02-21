import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// REPORTS API
// Generates data for PDF reports and Excel exports
// ============================================================================

const reportRequestSchema = z.object({
  type: z.enum(['portfolio_summary', 'project_detail', 'incentive_breakdown', 'application_status', 'capital_stack']),
  format: z.enum(['json', 'csv', 'pdf_data']),
  projectId: z.string().uuid().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }).optional(),
  filters: z.object({
    status: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
    tier: z.array(z.string()).optional(),
  }).optional(),
});

export type ReportType = z.infer<typeof reportRequestSchema>['type'];
export type ReportFormat = z.infer<typeof reportRequestSchema>['format'];

// ============================================================================
// REPORT DATA INTERFACES
// ============================================================================

export interface PortfolioSummaryReport {
  generatedAt: string;
  organization: {
    name: string;
    id: string;
  };
  summary: {
    totalProjects: number;
    totalDevelopmentCost: number;
    totalPotentialIncentives: number;
    totalCapturedIncentives: number;
    netCost: number;
    subsidyRate: number;
  };
  projectList: {
    id: string;
    name: string;
    location: string;
    status: string;
    sustainabilityTier: string;
    tdc: number;
    potentialIncentives: number;
    capturedIncentives: number;
    netCost: number;
  }[];
  incentivesByCategory: {
    federal: number;
    state: number;
    local: number;
    utility: number;
  };
  waterfall: {
    label: string;
    value: number;
    type: 'base' | 'deduction' | 'result';
  }[];
}

export interface ProjectDetailReport {
  generatedAt: string;
  project: {
    id: string;
    name: string;
    location: string;
    description: string;
    status: string;
    sustainabilityTier: string;
    totalSqft: number;
    totalUnits: number;
    tdc: number;
    constructionType: string;
  };
  financials: {
    hardCosts: number;
    softCosts: number;
    totalDevelopmentCost: number;
    potentialIncentives: number;
    capturedIncentives: number;
    netCost: number;
    subsidyRate: number;
  };
  incentiveMatches: {
    id: string;
    programName: string;
    category: string;
    type: string;
    estimatedValue: number;
    probability: number;
    status: string;
    deadline: string | null;
  }[];
  applications: {
    id: string;
    programName: string;
    status: string;
    amountRequested: number;
    amountApproved: number | null;
    submissionDate: string | null;
  }[];
  waterfall: {
    label: string;
    value: number;
    type: 'base' | 'deduction' | 'result';
  }[];
}

// ============================================================================
// API HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
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
      .select('organization_id, organizations(name)')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = reportRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { type, format, projectId, filters } = validationResult.data;
    const orgId = profile.organization_id;
    const orgName = (profile as any).organizations?.name || 'Organization';

    let reportData: unknown;

    switch (type) {
      case 'portfolio_summary':
        reportData = await generatePortfolioSummary(supabase, orgId, orgName, filters);
        break;
      case 'project_detail':
        if (!projectId) {
          return NextResponse.json({ error: 'projectId required for project_detail report' }, { status: 400 });
        }
        reportData = await generateProjectDetail(supabase, orgId, orgName, projectId);
        break;
      case 'incentive_breakdown':
        reportData = await generateIncentiveBreakdown(supabase, orgId, projectId, filters);
        break;
      case 'application_status':
        reportData = await generateApplicationStatus(supabase, orgId, projectId, filters);
        break;
      case 'capital_stack':
        reportData = await generateCapitalStack(supabase, orgId, projectId);
        break;
      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 });
    }

    // Format output
    if (format === 'csv') {
      const csv = convertToCSV(reportData, type);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ data: reportData });
  } catch (error) {
    console.error('Error in POST /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// REPORT GENERATORS
// ============================================================================

async function generatePortfolioSummary(
  supabase: any,
  orgId: string,
  orgName: string,
  filters?: { status?: string[]; tier?: string[] }
): Promise<PortfolioSummaryReport> {
  // Get projects
  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId);

  if (filters?.status && filters.status.length > 0) {
    query = query.in('project_status', filters.status);
  }
  if (filters?.tier && filters.tier.length > 0) {
    query = query.in('sustainability_tier', filters.tier);
  }

  const { data: projects } = await query;

  // Calculate totals
  const totalDevelopmentCost = projects?.reduce((sum: number, p: any) => sum + (p.total_development_cost || 0), 0) || 0;
  const totalPotentialIncentives = projects?.reduce((sum: number, p: any) => sum + (p.total_potential_incentives || 0), 0) || 0;
  const totalCapturedIncentives = projects?.reduce((sum: number, p: any) => sum + (p.total_captured_incentives || 0), 0) || 0;

  // Get incentives by category
  const projectIds = projects?.map((p: any) => p.id) || [];
  const { data: matches } = await supabase
    .from('project_incentive_matches')
    .select(`
      estimated_value,
      incentive_program:incentive_programs (category)
    `)
    .in('project_id', projectIds)
    .neq('status', 'dismissed');

  const incentivesByCategory = { federal: 0, state: 0, local: 0, utility: 0 };
  matches?.forEach((m: any) => {
    const cat = m.incentive_program?.category as keyof typeof incentivesByCategory;
    if (cat && incentivesByCategory.hasOwnProperty(cat)) {
      incentivesByCategory[cat] += m.estimated_value || 0;
    }
  });

  // Build waterfall
  const waterfall = [
    { label: 'Total Development Cost', value: totalDevelopmentCost, type: 'base' as const },
    { label: 'Federal Incentives', value: -incentivesByCategory.federal, type: 'deduction' as const },
    { label: 'State Incentives', value: -incentivesByCategory.state, type: 'deduction' as const },
    { label: 'Local Incentives', value: -incentivesByCategory.local, type: 'deduction' as const },
    { label: 'Utility Incentives', value: -incentivesByCategory.utility, type: 'deduction' as const },
    { label: 'Net Cost', value: totalDevelopmentCost - totalPotentialIncentives, type: 'result' as const },
  ];

  return {
    generatedAt: new Date().toISOString(),
    organization: { name: orgName, id: orgId },
    summary: {
      totalProjects: projects?.length || 0,
      totalDevelopmentCost,
      totalPotentialIncentives,
      totalCapturedIncentives,
      netCost: totalDevelopmentCost - totalCapturedIncentives,
      subsidyRate: totalDevelopmentCost > 0 ? (totalPotentialIncentives / totalDevelopmentCost) * 100 : 0,
    },
    projectList: (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      location: `${p.city || ''}, ${p.state || ''}`.trim().replace(/^,\s*/, ''),
      status: p.project_status,
      sustainabilityTier: p.sustainability_tier || 'tier_1_efficient',
      tdc: p.total_development_cost || 0,
      potentialIncentives: p.total_potential_incentives || 0,
      capturedIncentives: p.total_captured_incentives || 0,
      netCost: (p.total_development_cost || 0) - (p.total_captured_incentives || 0),
    })),
    incentivesByCategory,
    waterfall,
  };
}

async function generateProjectDetail(
  supabase: any,
  orgId: string,
  orgName: string,
  projectId: string
): Promise<ProjectDetailReport> {
  // Get project
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('organization_id', orgId)
    .single();

  if (error || !project) {
    throw new Error('Project not found');
  }

  // Get incentive matches
  const { data: matches } = await supabase
    .from('project_incentive_matches')
    .select(`
      id,
      estimated_value,
      probability_score,
      status,
      incentive_program:incentive_programs (
        name,
        category,
        incentive_type,
        application_deadline
      )
    `)
    .eq('project_id', projectId)
    .neq('status', 'dismissed')
    .order('estimated_value', { ascending: false });

  // Get applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      amount_requested,
      amount_approved,
      submission_date,
      incentive_program:incentive_programs (name)
    `)
    .eq('project_id', projectId);

  // Calculate category totals for waterfall
  const categoryTotals = { federal: 0, state: 0, local: 0, utility: 0 };
  matches?.forEach((m: any) => {
    const cat = m.incentive_program?.category as keyof typeof categoryTotals;
    if (cat && categoryTotals.hasOwnProperty(cat)) {
      categoryTotals[cat] += m.estimated_value || 0;
    }
  });

  const tdc = project.total_development_cost || 0;
  const totalPotential = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return {
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      location: `${project.address_line1 || ''}, ${project.city || ''}, ${project.state || ''} ${project.zip_code || ''}`.trim(),
      description: project.description || '',
      status: project.project_status,
      sustainabilityTier: project.sustainability_tier || 'tier_1_efficient',
      totalSqft: project.total_sqft || 0,
      totalUnits: project.total_units || 0,
      tdc,
      constructionType: project.construction_type || 'new-construction',
    },
    financials: {
      hardCosts: project.hard_costs || 0,
      softCosts: project.soft_costs || 0,
      totalDevelopmentCost: tdc,
      potentialIncentives: totalPotential,
      capturedIncentives: project.total_captured_incentives || 0,
      netCost: tdc - (project.total_captured_incentives || 0),
      subsidyRate: tdc > 0 ? (totalPotential / tdc) * 100 : 0,
    },
    incentiveMatches: (matches || []).map((m: any) => ({
      id: m.id,
      programName: m.incentive_program?.name || 'Unknown',
      category: m.incentive_program?.category || 'unknown',
      type: m.incentive_program?.incentive_type || 'unknown',
      estimatedValue: m.estimated_value || 0,
      probability: (m.probability_score || 0) * 100,
      status: m.status,
      deadline: m.incentive_program?.application_deadline || null,
    })),
    applications: (applications || []).map((a: any) => ({
      id: a.id,
      programName: a.incentive_program?.name || 'Unknown',
      status: a.status,
      amountRequested: a.amount_requested || 0,
      amountApproved: a.amount_approved,
      submissionDate: a.submission_date,
    })),
    waterfall: [
      { label: 'Total Development Cost', value: tdc, type: 'base' as const },
      { label: 'Federal Incentives', value: -categoryTotals.federal, type: 'deduction' as const },
      { label: 'State Incentives', value: -categoryTotals.state, type: 'deduction' as const },
      { label: 'Local Incentives', value: -categoryTotals.local, type: 'deduction' as const },
      { label: 'Utility Incentives', value: -categoryTotals.utility, type: 'deduction' as const },
      { label: 'Net Cost', value: tdc - totalPotential, type: 'result' as const },
    ],
  };
}

async function generateIncentiveBreakdown(
  supabase: any,
  orgId: string,
  projectId?: string,
  filters?: { category?: string[] }
) {
  // Get project IDs
  let projectIds: string[] = [];
  if (projectId) {
    projectIds = [projectId];
  } else {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('organization_id', orgId);
    projectIds = projects?.map((p: any) => p.id) || [];
  }

  // Get all matches
  let query = supabase
    .from('project_incentive_matches')
    .select(`
      *,
      project:projects (id, name),
      incentive_program:incentive_programs (*)
    `)
    .in('project_id', projectIds)
    .neq('status', 'dismissed');

  const { data: matches } = await query;

  // Filter by category if specified
  let filteredMatches = matches || [];
  if (filters?.category && filters.category.length > 0) {
    filteredMatches = filteredMatches.filter((m: any) =>
      filters.category!.includes(m.incentive_program?.category)
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    totalMatches: filteredMatches.length,
    totalValue: filteredMatches.reduce((sum: number, m: any) => sum + (m.estimated_value || 0), 0),
    incentives: filteredMatches.map((m: any) => ({
      matchId: m.id,
      projectName: m.project?.name || 'Unknown',
      projectId: m.project?.id,
      programId: m.incentive_program?.id,
      programName: m.incentive_program?.name || 'Unknown',
      category: m.incentive_program?.category,
      type: m.incentive_program?.incentive_type,
      jurisdictionLevel: m.incentive_program?.jurisdiction_level,
      estimatedValue: m.estimated_value || 0,
      valueLow: m.value_low || 0,
      valueHigh: m.value_high || 0,
      probabilityScore: m.probability_score || 0,
      overallScore: m.overall_score || 0,
      status: m.status,
      administrator: m.incentive_program?.administrator,
      deadline: m.incentive_program?.application_deadline,
      sourceUrl: m.incentive_program?.source_url,
    })),
  };
}

async function generateApplicationStatus(
  supabase: any,
  orgId: string,
  projectId?: string,
  filters?: { status?: string[] }
) {
  let query = supabase
    .from('applications')
    .select(`
      *,
      project:projects (id, name),
      incentive_program:incentive_programs (id, name, category)
    `)
    .eq('organization_id', orgId);

  if (projectId) {
    query = query.eq('project_id', projectId);
  }
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  const { data: applications } = await query.order('created_at', { ascending: false });

  return {
    generatedAt: new Date().toISOString(),
    totalApplications: applications?.length || 0,
    applications: (applications || []).map((a: any) => ({
      id: a.id,
      projectName: a.project?.name || 'Unknown',
      projectId: a.project?.id,
      programName: a.incentive_program?.name || 'Unknown',
      programCategory: a.incentive_program?.category,
      status: a.status,
      amountRequested: a.amount_requested,
      amountApproved: a.amount_approved,
      submissionDate: a.submission_date,
      deadline: a.deadline,
      decisionDate: a.decision_date,
      createdAt: a.created_at,
    })),
    byStatus: {
      draft: applications?.filter((a: any) => a.status === 'draft').length || 0,
      inProgress: applications?.filter((a: any) => a.status === 'in-progress').length || 0,
      submitted: applications?.filter((a: any) => a.status === 'submitted').length || 0,
      underReview: applications?.filter((a: any) => a.status === 'under-review').length || 0,
      approved: applications?.filter((a: any) => a.status === 'approved').length || 0,
      rejected: applications?.filter((a: any) => a.status === 'rejected').length || 0,
    },
  };
}

async function generateCapitalStack(
  supabase: any,
  orgId: string,
  projectId?: string
) {
  // Get projects
  let projects: any[] = [];
  if (projectId) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('organization_id', orgId);
    projects = data || [];
  } else {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', orgId);
    projects = data || [];
  }

  const totalTDC = projects.reduce((sum, p) => sum + (p.total_development_cost || 0), 0);
  const totalPotential = projects.reduce((sum, p) => sum + (p.total_potential_incentives || 0), 0);
  const totalCaptured = projects.reduce((sum, p) => sum + (p.total_captured_incentives || 0), 0);

  // Estimate capital stack components (simplified)
  const seniorDebt = totalTDC * 0.65; // Assume 65% LTC
  const mezzDebt = totalTDC * 0.10; // Assume 10% mezz
  const incentives = totalPotential;
  const requiredEquity = Math.max(0, totalTDC - seniorDebt - mezzDebt - incentives);

  return {
    generatedAt: new Date().toISOString(),
    projectCount: projects.length,
    summary: {
      totalDevelopmentCost: totalTDC,
      totalPotentialIncentives: totalPotential,
      totalCapturedIncentives: totalCaptured,
      netCost: totalTDC - totalCaptured,
      subsidyRate: totalTDC > 0 ? (totalPotential / totalTDC) * 100 : 0,
    },
    capitalStack: [
      { source: 'Senior Debt', amount: seniorDebt, percentage: (seniorDebt / totalTDC) * 100 },
      { source: 'Mezzanine/Preferred', amount: mezzDebt, percentage: (mezzDebt / totalTDC) * 100 },
      { source: 'Incentives & Credits', amount: incentives, percentage: (incentives / totalTDC) * 100 },
      { source: 'Required Sponsor Equity', amount: requiredEquity, percentage: (requiredEquity / totalTDC) * 100 },
    ],
    waterfall: [
      { label: 'Total Development Cost', value: totalTDC, running: totalTDC },
      { label: 'Less: Senior Debt', value: -seniorDebt, running: totalTDC - seniorDebt },
      { label: 'Less: Mezz/Preferred', value: -mezzDebt, running: totalTDC - seniorDebt - mezzDebt },
      { label: 'Less: Incentives', value: -incentives, running: totalTDC - seniorDebt - mezzDebt - incentives },
      { label: 'Required Equity', value: requiredEquity, running: requiredEquity },
    ],
  };
}

// ============================================================================
// CSV CONVERTER
// ============================================================================

function convertToCSV(data: any, type: ReportType): string {
  let rows: string[][] = [];
  let headers: string[] = [];

  switch (type) {
    case 'portfolio_summary':
      headers = ['Project Name', 'Location', 'Status', 'Sustainability Tier', 'TDC', 'Potential Incentives', 'Captured', 'Net Cost'];
      rows = data.projectList.map((p: any) => [
        p.name,
        p.location,
        p.status,
        p.sustainabilityTier,
        p.tdc.toString(),
        p.potentialIncentives.toString(),
        p.capturedIncentives.toString(),
        p.netCost.toString(),
      ]);
      break;

    case 'incentive_breakdown':
      headers = ['Project', 'Program', 'Category', 'Type', 'Estimated Value', 'Probability', 'Status', 'Deadline'];
      rows = data.incentives.map((i: any) => [
        i.projectName,
        i.programName,
        i.category,
        i.type,
        i.estimatedValue.toString(),
        `${(i.probabilityScore * 100).toFixed(0)}%`,
        i.status,
        i.deadline || '',
      ]);
      break;

    case 'application_status':
      headers = ['Project', 'Program', 'Status', 'Requested', 'Approved', 'Submitted', 'Deadline'];
      rows = data.applications.map((a: any) => [
        a.projectName,
        a.programName,
        a.status,
        a.amountRequested?.toString() || '',
        a.amountApproved?.toString() || '',
        a.submissionDate || '',
        a.deadline || '',
      ]);
      break;

    default:
      return JSON.stringify(data);
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}
