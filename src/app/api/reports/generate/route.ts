/**
 * Report Generation API
 *
 * Handles two contracts:
 *
 * 1. Dashboard Reports (new) — used by /reports page
 *    POST /api/reports/generate
 *    Body: { reportType: "portfolio-summary" | "incentive-analysis" | "project-detail" | "broker-summary",
 *            projectId?, organizationId?, format?: "json"|"pdf", filters? }
 *
 * 2. Legacy PDF Reports — used by export / PDF flows
 *    POST /api/reports/generate
 *    Body: { projectName, projectData: { state, buildingType, ... },
 *            reportType: "executive_summary"|"full_analysis"|"incentive_matrix"|"application_checklist",
 *            format?: "json"|"html"|"pdf"|"text" }
 *
 * The handler auto-detects which contract is in use by checking reportType value.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generatePDFReportStructure,
  generateHTMLReport,
  generateTextReport,
  type ReportData,
  type IncentiveItem,
  type ChecklistSection,
} from '@/lib/pdf-generator';

// ============================================================================
// DASHBOARD REPORT TYPES
// ============================================================================

type DashboardReportType = 'portfolio-summary' | 'incentive-analysis' | 'project-detail' | 'broker-summary';

const DASHBOARD_REPORT_TYPES: DashboardReportType[] = [
  'portfolio-summary',
  'incentive-analysis',
  'project-detail',
  'broker-summary',
];

interface DashboardReportRequest {
  reportType: DashboardReportType;
  projectId?: string;
  organizationId?: string;
  format?: 'json' | 'pdf';
  filters?: {
    state?: string;
    programTypes?: string[];
    dateRange?: { from?: string; to?: string };
  };
}

interface BreakdownItem {
  type: string;
  count: number;
  estimatedValue: number;
  percentage: number;
}

interface TopProgram {
  programId: string;
  name: string;
  estimatedValue: number;
  projectCount: number;
  category: string;
}

interface StateBreakdown {
  state: string;
  count: number;
  estimatedValue: number;
}

interface PortfolioSummaryResponse {
  reportType: 'portfolio-summary';
  generatedAt: string;
  organization: { id: string; name: string };
  summary: {
    totalProjects: number;
    totalIncentivesIdentified: number;
    estimatedTotalValue: number;
    averagePerProject: number;
  };
  topPrograms: TopProgram[];
  breakdownByType: BreakdownItem[];
  breakdownByState: StateBreakdown[];
  recentActivity: { id: string; type: string; timestamp: string; description: string }[];
}

interface IncentiveAnalysisProgram {
  id: string;
  name: string;
  category: string;
  amountMax: number;
  status: string;
  matchedProjects: number;
}

interface IncentiveAnalysisResponse {
  reportType: 'incentive-analysis';
  generatedAt: string;
  programs: IncentiveAnalysisProgram[];
  totalPrograms: number;
  activePrograms: number;
  byCategory: BreakdownItem[];
}

interface ProjectDetailResponse {
  reportType: 'project-detail';
  generatedAt: string;
  project: {
    id: string;
    name: string;
    type: string;
    state: string;
    tdc: number;
  };
  matchedPrograms: {
    programId: string;
    name: string;
    category: string;
    estimatedValue: number;
    probability: number;
    status: string;
  }[];
  totalEstimatedValue: number;
  topOpportunity: { programId: string; name: string; estimatedValue: number } | null;
}

interface BrokerSummaryResponse {
  reportType: 'broker-summary';
  generatedAt: string;
  organization: { id: string; name: string };
  summary: {
    totalProjects: number;
    totalIncentivesIdentified: number;
    estimatedTotalValue: number;
  };
  breakdownByType: BreakdownItem[];
  programHighlights: TopProgram[];
}

// ============================================================================
// LEGACY PDF REPORT TYPES (preserved from original)
// ============================================================================

interface LegacyReportRequest {
  projectId?: string;
  projectName: string;
  projectData: {
    address?: string;
    city?: string;
    state: string;
    county?: string;
    buildingType: string;
    totalUnits?: number;
    totalSqft?: number;
    affordablePercentage?: number;
    totalDevelopmentCost?: number;
    equityInvestment?: number;
    sustainabilityTier?: string;
    entityType?: string;
    taxExempt?: boolean;
  };
  reportType: 'executive_summary' | 'full_analysis' | 'incentive_matrix' | 'application_checklist';
  format?: 'json' | 'html' | 'pdf' | 'text';
  includeCharts?: boolean;
  includeDirectPay?: boolean;
}

// ============================================================================
// MAIN POST HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const reportType = body.reportType as string;

    // Detect which contract is being used
    if (DASHBOARD_REPORT_TYPES.includes(reportType as DashboardReportType)) {
      return handleDashboardReport(body as DashboardReportRequest, startTime);
    }

    // Fall through to legacy PDF report handler
    return handleLegacyReport(body as LegacyReportRequest, startTime);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Report generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// ============================================================================
// DASHBOARD REPORT HANDLER
// ============================================================================

async function handleDashboardReport(
  body: DashboardReportRequest,
  startTime: number
) {
  const supabase = await createClient();

  // Auth required
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user profile + org
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, organizations(name)')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) {
    return NextResponse.json(
      { error: 'No organization found. Create an organization first.' },
      { status: 400 }
    );
  }

  const orgId = body.organizationId || profile.organization_id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join returns unknown shape
  const orgName = (profile as any).organizations?.name || 'Your Organization';

  switch (body.reportType) {
    case 'portfolio-summary':
      return handlePortfolioSummary(supabase, orgId, orgName, body.filters, startTime);
    case 'incentive-analysis':
      return handleIncentiveAnalysis(supabase, orgId, body.filters, startTime);
    case 'project-detail':
      if (!body.projectId) {
        return NextResponse.json(
          { error: 'projectId is required for project-detail reports' },
          { status: 400 }
        );
      }
      return handleProjectDetail(supabase, orgId, body.projectId, startTime);
    case 'broker-summary':
      return handleBrokerSummary(supabase, orgId, orgName, body.filters, startTime);
    default:
      return NextResponse.json(
        { error: 'Report type not found' },
        { status: 404 }
      );
  }
}

// ============================================================================
// PORTFOLIO SUMMARY
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function handlePortfolioSummary(
  supabase: any,
  orgId: string,
  orgName: string,
  filters: DashboardReportRequest['filters'],
  startTime: number
) {
  // Fetch org projects
  let projectQuery = supabase
    .from('projects')
    .select('id, name, state, city, total_development_cost, total_potential_incentives, total_captured_incentives, created_at')
    .eq('organization_id', orgId);

  if (filters?.state) {
    projectQuery = projectQuery.eq('state', filters.state);
  }

  const { data: projects } = await projectQuery;
  const projectList = projects || [];
  const projectIds = projectList.map((p: { id: string }) => p.id);

  // Fetch incentive matches for those projects
  let matchData: { estimated_value: number; project_id: string; incentive_program: { id: string; name: string; category: string; incentive_type: string } | null }[] = [];
  if (projectIds.length > 0) {
    const { data: matches } = await supabase
      .from('project_incentive_matches')
      .select(`
        estimated_value,
        project_id,
        incentive_program:incentive_programs (id, name, category, incentive_type)
      `)
      .in('project_id', projectIds)
      .neq('status', 'dismissed');
    matchData = matches || [];
  }

  // Calculate summary
  const totalIncentivesIdentified = matchData.length;
  const estimatedTotalValue = matchData.reduce((sum: number, m: { estimated_value: number }) => sum + (m.estimated_value || 0), 0);
  const averagePerProject = projectList.length > 0 ? Math.round(estimatedTotalValue / projectList.length) : 0;

  // Top programs: group matches by program
  const programMap = new Map<string, { name: string; category: string; value: number; projects: Set<string> }>();
  for (const m of matchData) {
    const prog = m.incentive_program;
    if (!prog) continue;
    const existing = programMap.get(prog.id) || { name: prog.name, category: prog.category, value: 0, projects: new Set<string>() };
    existing.value += m.estimated_value || 0;
    existing.projects.add(m.project_id);
    programMap.set(prog.id, existing);
  }

  const topPrograms: TopProgram[] = Array.from(programMap.entries())
    .map(([id, data]) => ({
      programId: id,
      name: data.name,
      estimatedValue: data.value,
      projectCount: data.projects.size,
      category: data.category,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 10);

  // Breakdown by type (incentive_type)
  const typeMap = new Map<string, { count: number; value: number }>();
  for (const m of matchData) {
    const typeName = m.incentive_program?.incentive_type || 'Other';
    const label = formatIncentiveType(typeName);
    const existing = typeMap.get(label) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += m.estimated_value || 0;
    typeMap.set(label, existing);
  }

  const breakdownByType: BreakdownItem[] = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      estimatedValue: data.value,
      percentage: estimatedTotalValue > 0 ? Math.round((data.value / estimatedTotalValue) * 100) : 0,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue);

  // Breakdown by state
  const stateMap = new Map<string, { count: number; value: number }>();
  for (const m of matchData) {
    const proj = projectList.find((p: { id: string }) => p.id === m.project_id);
    const state = proj?.state || 'Unknown';
    const existing = stateMap.get(state) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += m.estimated_value || 0;
    stateMap.set(state, existing);
  }

  const breakdownByState: StateBreakdown[] = Array.from(stateMap.entries())
    .map(([state, data]) => ({
      state,
      count: data.count,
      estimatedValue: data.value,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue);

  const response: PortfolioSummaryResponse = {
    reportType: 'portfolio-summary',
    generatedAt: new Date().toISOString(),
    organization: { id: orgId, name: orgName },
    summary: {
      totalProjects: projectList.length,
      totalIncentivesIdentified,
      estimatedTotalValue,
      averagePerProject,
    },
    topPrograms,
    breakdownByType,
    breakdownByState,
    recentActivity: [],
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { 'X-Response-Time': `${Date.now() - startTime}ms` },
  });
}

// ============================================================================
// INCENTIVE ANALYSIS
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function handleIncentiveAnalysis(
  supabase: any,
  orgId: string,
  filters: DashboardReportRequest['filters'],
  startTime: number
) {
  // Count total programs
  const { count: totalPrograms } = await supabase
    .from('incentive_programs')
    .select('*', { count: 'exact', head: true });

  // Count active programs
  const { count: activePrograms } = await supabase
    .from('incentive_programs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get org project IDs for matching
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('organization_id', orgId);
  const projectIds = (projects || []).map((p: { id: string }) => p.id);

  // Get matched programs with details
  let matchedPrograms: IncentiveAnalysisProgram[] = [];
  if (projectIds.length > 0) {
    const { data: matches } = await supabase
      .from('project_incentive_matches')
      .select(`
        estimated_value,
        project_id,
        incentive_program:incentive_programs (id, name, category, incentive_type, amount_max, status)
      `)
      .in('project_id', projectIds)
      .neq('status', 'dismissed');

    // Group by program
    const progMap = new Map<string, { name: string; category: string; amountMax: number; status: string; projects: Set<string> }>();
    for (const m of (matches || [])) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join shape
      const prog = (m as any).incentive_program;
      if (!prog) continue;
      const existing = progMap.get(prog.id) || {
        name: prog.name,
        category: prog.category,
        amountMax: prog.amount_max || 0,
        status: prog.status || 'active',
        projects: new Set<string>(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join shape
      existing.projects.add((m as any).project_id);
      progMap.set(prog.id, existing);
    }

    matchedPrograms = Array.from(progMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      category: data.category,
      amountMax: data.amountMax,
      status: data.status,
      matchedProjects: data.projects.size,
    }));
  }

  // Category breakdown from matched programs
  const catMap = new Map<string, { count: number; value: number }>();
  for (const prog of matchedPrograms) {
    const cat = formatIncentiveType(prog.category);
    const existing = catMap.get(cat) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += prog.amountMax;
    catMap.set(cat, existing);
  }

  const totalCatValue = Array.from(catMap.values()).reduce((sum, d) => sum + d.value, 0);
  const byCategory: BreakdownItem[] = Array.from(catMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      estimatedValue: data.value,
      percentage: totalCatValue > 0 ? Math.round((data.value / totalCatValue) * 100) : 0,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue);

  // Apply filters if specified
  let filteredPrograms = matchedPrograms;
  if (filters?.programTypes && filters.programTypes.length > 0) {
    filteredPrograms = filteredPrograms.filter(p =>
      filters.programTypes!.includes(p.category)
    );
  }

  const response: IncentiveAnalysisResponse = {
    reportType: 'incentive-analysis',
    generatedAt: new Date().toISOString(),
    programs: filteredPrograms.slice(0, 50),
    totalPrograms: totalPrograms || 0,
    activePrograms: activePrograms || 0,
    byCategory,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { 'X-Response-Time': `${Date.now() - startTime}ms` },
  });
}

// ============================================================================
// PROJECT DETAIL
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function handleProjectDetail(
  supabase: any,
  orgId: string,
  projectId: string,
  startTime: number
) {
  // Fetch project
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, building_type, state, total_development_cost')
    .eq('id', projectId)
    .eq('organization_id', orgId)
    .single();

  if (error || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // Fetch matched programs
  const { data: matches } = await supabase
    .from('project_incentive_matches')
    .select(`
      id,
      estimated_value,
      probability_score,
      status,
      incentive_program:incentive_programs (id, name, category)
    `)
    .eq('project_id', projectId)
    .neq('status', 'dismissed')
    .order('estimated_value', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase join shape
  const matchedPrograms = (matches || []).map((m: any) => ({
    programId: m.incentive_program?.id || m.id,
    name: m.incentive_program?.name || 'Unknown Program',
    category: m.incentive_program?.category || 'unknown',
    estimatedValue: m.estimated_value || 0,
    probability: Math.round((m.probability_score || 0) * 100),
    status: m.status || 'identified',
  }));

  const totalEstimatedValue = matchedPrograms.reduce(
    (sum: number, m: { estimatedValue: number }) => sum + m.estimatedValue, 0
  );

  const topOpportunity = matchedPrograms.length > 0
    ? {
        programId: matchedPrograms[0].programId,
        name: matchedPrograms[0].name,
        estimatedValue: matchedPrograms[0].estimatedValue,
      }
    : null;

  const response: ProjectDetailResponse = {
    reportType: 'project-detail',
    generatedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      type: project.building_type || 'Unknown',
      state: project.state || 'Unknown',
      tdc: project.total_development_cost || 0,
    },
    matchedPrograms,
    totalEstimatedValue,
    topOpportunity,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { 'X-Response-Time': `${Date.now() - startTime}ms` },
  });
}

// ============================================================================
// BROKER SUMMARY
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client type
async function handleBrokerSummary(
  supabase: any,
  orgId: string,
  orgName: string,
  filters: DashboardReportRequest['filters'],
  startTime: number
) {
  // Fetch projects
  let projectQuery = supabase
    .from('projects')
    .select('id, name, state, total_development_cost, total_potential_incentives')
    .eq('organization_id', orgId);

  if (filters?.state) {
    projectQuery = projectQuery.eq('state', filters.state);
  }

  const { data: projects } = await projectQuery;
  const projectList = projects || [];
  const projectIds = projectList.map((p: { id: string }) => p.id);

  // Fetch matches
  let matchData: { estimated_value: number; project_id: string; incentive_program: { id: string; name: string; category: string; incentive_type: string } | null }[] = [];
  if (projectIds.length > 0) {
    const { data: matches } = await supabase
      .from('project_incentive_matches')
      .select(`
        estimated_value,
        project_id,
        incentive_program:incentive_programs (id, name, category, incentive_type)
      `)
      .in('project_id', projectIds)
      .neq('status', 'dismissed');
    matchData = matches || [];
  }

  const totalIncentivesIdentified = matchData.length;
  const estimatedTotalValue = matchData.reduce((sum: number, m: { estimated_value: number }) => sum + (m.estimated_value || 0), 0);

  // Breakdown by incentive_type
  const typeMap = new Map<string, { count: number; value: number }>();
  for (const m of matchData) {
    const typeName = m.incentive_program?.incentive_type || 'Other';
    const label = formatIncentiveType(typeName);
    const existing = typeMap.get(label) || { count: 0, value: 0 };
    existing.count += 1;
    existing.value += m.estimated_value || 0;
    typeMap.set(label, existing);
  }

  const breakdownByType: BreakdownItem[] = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      count: data.count,
      estimatedValue: data.value,
      percentage: estimatedTotalValue > 0 ? Math.round((data.value / estimatedTotalValue) * 100) : 0,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue);

  // Top programs
  const programMap = new Map<string, { name: string; category: string; value: number; projects: Set<string> }>();
  for (const m of matchData) {
    const prog = m.incentive_program;
    if (!prog) continue;
    const existing = programMap.get(prog.id) || { name: prog.name, category: prog.category, value: 0, projects: new Set<string>() };
    existing.value += m.estimated_value || 0;
    existing.projects.add(m.project_id);
    programMap.set(prog.id, existing);
  }

  const programHighlights: TopProgram[] = Array.from(programMap.entries())
    .map(([id, data]) => ({
      programId: id,
      name: data.name,
      estimatedValue: data.value,
      projectCount: data.projects.size,
      category: data.category,
    }))
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 5);

  const response: BrokerSummaryResponse = {
    reportType: 'broker-summary',
    generatedAt: new Date().toISOString(),
    organization: { id: orgId, name: orgName },
    summary: {
      totalProjects: projectList.length,
      totalIncentivesIdentified,
      estimatedTotalValue,
    },
    breakdownByType,
    programHighlights,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { 'X-Response-Time': `${Date.now() - startTime}ms` },
  });
}

// ============================================================================
// UTILITY: Format incentive type to display label
// ============================================================================

function formatIncentiveType(type: string): string {
  const typeMap: Record<string, string> = {
    'tax_credit': 'Tax Credit',
    'grant': 'Grant',
    'rebate': 'Rebate',
    'loan': 'Loan',
    'tax_deduction': 'Tax Deduction',
    'tax_exemption': 'Tax Exemption',
    'abatement': 'Abatement',
    'financing': 'Financing',
    'federal': 'Federal',
    'state': 'State',
    'local': 'Local',
    'utility': 'Utility',
  };
  return typeMap[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ============================================================================
// LEGACY PDF REPORT HANDLER (preserved from original)
// ============================================================================

function generateExecutiveSummary(data: LegacyReportRequest['projectData']) {
  const incentives = [];
  let totalValue = 0;

  // Federal incentives
  if (data.totalUnits && data.totalUnits > 0) {
    const value45L = data.totalUnits * 2500;
    incentives.push({
      name: 'Section 45L Tax Credit',
      category: 'Federal',
      estimatedValue: value45L,
      confidence: 'High',
      timeline: 'At placed in service',
    });
    totalValue += value45L;
  }

  if (data.totalSqft && data.totalSqft > 0) {
    const value179D = data.totalSqft * 2.5;
    incentives.push({
      name: 'Section 179D Deduction',
      category: 'Federal',
      estimatedValue: value179D,
      confidence: 'High',
      timeline: 'At placed in service',
    });
    totalValue += value179D;
  }

  if (data.affordablePercentage && data.affordablePercentage >= 20) {
    const qualifiedBasis = (data.totalDevelopmentCost || 0) * 0.7;
    const lihtcValue = qualifiedBasis * 0.04 * 10;
    incentives.push({
      name: 'LIHTC 4% Tax Credit',
      category: 'Federal',
      estimatedValue: lihtcValue,
      confidence: 'Medium',
      timeline: '10-year credit period',
    });
    totalValue += lihtcValue;
  }

  // State incentives (NY)
  if (data.state === 'NY') {
    if (data.totalUnits) {
      const nyserdaValue = data.totalUnits * 1500;
      incentives.push({
        name: 'NYSERDA New Construction',
        category: 'State',
        estimatedValue: nyserdaValue,
        confidence: 'Medium',
        timeline: 'Pre-construction enrollment',
      });
      totalValue += nyserdaValue;
    }
  }

  return {
    summary: {
      projectName: data.address || 'Project Analysis',
      location: `${data.city || ''}, ${data.state}`.trim().replace(/^,\s*/, ''),
      buildingType: data.buildingType,
      totalUnits: data.totalUnits || 0,
      totalSqft: data.totalSqft || 0,
      affordablePercentage: data.affordablePercentage || 0,
    },
    incentiveSummary: {
      totalEstimatedValue: totalValue,
      incentiveCount: incentives.length,
      byCategory: {
        federal: incentives.filter((i) => i.category === 'Federal').length,
        state: incentives.filter((i) => i.category === 'State').length,
        local: incentives.filter((i) => i.category === 'Local').length,
        utility: incentives.filter((i) => i.category === 'Utility').length,
      },
    },
    topIncentives: incentives.slice(0, 5),
    recommendations: [
      data.affordablePercentage && data.affordablePercentage < 20
        ? 'Consider increasing affordable units to 20%+ for LIHTC eligibility'
        : null,
      'Engage energy consultant early for ENERGY STAR/ZERH certification',
      'Pre-enroll with NYSERDA before construction start',
      'Explore IDA PILOT opportunities for additional savings',
    ].filter(Boolean),
  };
}

function generateLegacyIncentiveMatrix(data: LegacyReportRequest['projectData']) {
  const matrix = {
    federal: {
      category: 'Federal',
      programs: [
        {
          name: 'Section 45L',
          applicable: data.totalUnits && data.totalUnits > 0,
          value: data.totalUnits ? `$${(data.totalUnits * 2500).toLocaleString()}` : 'N/A',
          requirements: ['ENERGY STAR certification', 'New construction'],
          deadline: '2032',
        },
        {
          name: 'Section 179D',
          applicable: data.totalSqft && data.totalSqft > 0,
          value: data.totalSqft ? `$${(data.totalSqft * 2.5).toLocaleString()}` : 'N/A',
          requirements: ['25% above ASHRAE 90.1', 'Commercial/MF common areas'],
          deadline: '2032',
        },
        {
          name: 'Solar ITC',
          applicable: true,
          value: '30% of solar cost',
          requirements: ['Solar installation', 'Domestic content for bonus'],
          deadline: '2032',
        },
        {
          name: 'LIHTC 4%',
          applicable: data.affordablePercentage && data.affordablePercentage >= 20,
          value: data.totalDevelopmentCost
            ? `$${((data.totalDevelopmentCost * 0.7 * 0.04 * 10) / 1000000).toFixed(1)}M`
            : 'TBD',
          requirements: ['20%+ affordable', 'Bond financing', '30-year commitment'],
          deadline: 'Ongoing',
        },
      ],
    },
    state: {
      category: 'State',
      programs:
        data.state === 'NY'
          ? [
              {
                name: 'NYSERDA New Construction',
                applicable: true,
                value: data.totalUnits ? `$${(data.totalUnits * 1500).toLocaleString()}` : 'TBD',
                requirements: ['NY location', 'Pre-enrollment', 'Energy modeling'],
                deadline: 'Rolling',
              },
              {
                name: 'NY State LIHTC',
                applicable: data.affordablePercentage && data.affordablePercentage >= 20,
                value: 'Supplements federal',
                requirements: ['Federal LIHTC award'],
                deadline: 'Annual',
              },
            ]
          : [
              {
                name: 'State Programs',
                applicable: true,
                value: 'Research required',
                requirements: [`${data.state} specific requirements`],
                deadline: 'Varies',
              },
            ],
    },
    local: {
      category: 'Local',
      programs: [
        {
          name: 'IDA PILOT',
          applicable: true,
          value: 'Up to 15 years',
          requirements: ['IDA application', 'Job creation'],
          deadline: 'Application-based',
        },
        {
          name: 'Property Tax Exemption',
          applicable: data.affordablePercentage && data.affordablePercentage >= 25,
          value: 'Varies by municipality',
          requirements: ['Affordability requirements', 'Local approval'],
          deadline: 'Varies',
        },
      ],
    },
    utility: {
      category: 'Utility',
      programs: [
        {
          name: 'Energy Efficiency Rebates',
          applicable: true,
          value: data.totalUnits ? `$${(data.totalUnits * 500).toLocaleString()}` : 'TBD',
          requirements: ['Utility territory', 'Efficiency measures'],
          deadline: 'While funding lasts',
        },
      ],
    },
  };

  return matrix;
}

function generateApplicationChecklist(data: LegacyReportRequest['projectData']) {
  const checklist = {
    preConstruction: [
      {
        item: 'NYSERDA Program Enrollment',
        status: 'pending',
        deadline: 'Before breaking ground',
        priority: 'high',
        notes: 'Must enroll before construction start to preserve eligibility',
      },
      {
        item: 'Energy Modeling',
        status: 'pending',
        deadline: '60 days pre-construction',
        priority: 'high',
        notes: 'Required for NYSERDA and 45L certification pathway',
      },
      {
        item: 'IDA PILOT Application',
        status: 'pending',
        deadline: 'Before construction',
        priority: 'medium',
        notes: 'Submit application to County IDA',
      },
      {
        item: 'LIHTC Application (if applicable)',
        status: data.affordablePercentage && data.affordablePercentage >= 20 ? 'pending' : 'n/a',
        deadline: 'HFA deadline',
        priority: 'high',
        notes: 'Coordinate with bond application',
      },
    ],
    construction: [
      {
        item: 'Prevailing Wage Documentation',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'high',
        notes: 'Required for maximum 179D deduction',
      },
      {
        item: 'Domestic Content Tracking',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'medium',
        notes: 'For 10% ITC bonus',
      },
      {
        item: 'Progress Photos/Documentation',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'medium',
        notes: 'Required for various certifications',
      },
    ],
    postConstruction: [
      {
        item: 'ENERGY STAR Certification',
        status: 'pending',
        deadline: 'At completion',
        priority: 'high',
        notes: 'Required for 45L credit',
      },
      {
        item: '179D Certification Study',
        status: 'pending',
        deadline: 'At placed in service',
        priority: 'high',
        notes: 'Third-party certification required',
      },
      {
        item: 'Cost Certification',
        status: 'pending',
        deadline: 'Within 90 days of completion',
        priority: 'high',
        notes: 'Required for LIHTC',
      },
      {
        item: 'Utility Rebate Claims',
        status: 'pending',
        deadline: 'Within 6 months',
        priority: 'medium',
        notes: 'Submit with supporting documentation',
      },
    ],
  };

  return checklist;
}

async function handleLegacyReport(body: LegacyReportRequest, startTime: number) {
  if (!body.projectData || !body.projectData.state) {
    return NextResponse.json(
      { error: 'Project data with state is required' },
      { status: 400 }
    );
  }

  const reportType = body.reportType || 'executive_summary';
  const format = body.format || 'json';

  let reportContent;
  switch (reportType) {
    case 'executive_summary':
      reportContent = generateExecutiveSummary(body.projectData);
      break;
    case 'incentive_matrix':
      reportContent = generateLegacyIncentiveMatrix(body.projectData);
      break;
    case 'application_checklist':
      reportContent = generateApplicationChecklist(body.projectData);
      break;
    case 'full_analysis':
      reportContent = {
        executiveSummary: generateExecutiveSummary(body.projectData),
        incentiveMatrix: generateLegacyIncentiveMatrix(body.projectData),
        applicationChecklist: generateApplicationChecklist(body.projectData),
      };
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      );
  }

  // Build report data for PDF/HTML generation
  const generatedAt = new Date().toISOString();
  const projectName = body.projectName || 'Project Report';

  // Handle different output formats
  if (format === 'html' || format === 'pdf' || format === 'text') {
    const pdfReportData = buildPDFReportData(body, reportContent, generatedAt);

    if (format === 'html') {
      const pdfStructure = generatePDFReportStructure(pdfReportData);
      const htmlContent = generateHTMLReport(pdfStructure);

      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_report.html"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (format === 'pdf') {
      const pdfStructure = generatePDFReportStructure(pdfReportData);

      return NextResponse.json(
        {
          success: true,
          format: 'pdf',
          pdfStructure,
          reportData: pdfReportData,
          meta: {
            responseTime: `${Date.now() - startTime}ms`,
            version: '1.0.0',
            note: 'Use jsPDF on client-side to render this structure to PDF',
          },
        },
        {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    if (format === 'text') {
      const textContent = generateTextReport(pdfReportData);

      return new NextResponse(textContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_report.txt"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // Default JSON format
  return NextResponse.json(
    {
      success: true,
      report: {
        type: reportType,
        projectName,
        generatedAt,
        content: reportContent,
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        version: '1.0.0',
      },
    },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// ============================================================================
// PDF REPORT DATA BUILDER (preserved from original)
// ============================================================================

function buildPDFReportData(
  body: LegacyReportRequest,
  reportContent: ReturnType<typeof generateExecutiveSummary> | ReturnType<typeof generateLegacyIncentiveMatrix> | ReturnType<typeof generateApplicationChecklist> | {
    executiveSummary: ReturnType<typeof generateExecutiveSummary>;
    incentiveMatrix: ReturnType<typeof generateLegacyIncentiveMatrix>;
    applicationChecklist: ReturnType<typeof generateApplicationChecklist>;
  },
  generatedAt: string
): ReportData {
  let summary: ReturnType<typeof generateExecutiveSummary> | undefined;
  let matrix: ReturnType<typeof generateLegacyIncentiveMatrix> | undefined;
  let checklist: ReturnType<typeof generateApplicationChecklist> | undefined;

  if ('executiveSummary' in reportContent) {
    summary = reportContent.executiveSummary;
    matrix = reportContent.incentiveMatrix;
    checklist = reportContent.applicationChecklist;
  } else if ('summary' in reportContent) {
    summary = reportContent;
  } else if ('federal' in reportContent) {
    matrix = reportContent;
  } else if ('preConstruction' in reportContent) {
    checklist = reportContent;
  }

  // Build incentives list from matrix
  const incentives: IncentiveItem[] = [];
  if (matrix) {
    const categories = ['federal', 'state', 'local', 'utility'] as const;
    for (const cat of categories) {
      const catData = matrix[cat];
      if (catData && 'programs' in catData) {
        for (const prog of catData.programs) {
          if (prog.applicable) {
            incentives.push({
              id: prog.name.toLowerCase().replace(/\s+/g, '-'),
              name: prog.name,
              category: cat,
              type: 'Tax Credit',
              estimatedValue: parseEstimatedValue(prog.value),
              confidence: 'medium',
              timeline: prog.deadline || 'TBD',
              requirements: prog.requirements.map((req: string) => ({
                requirement: req,
                status: 'pending' as const,
              })),
              nextSteps: [`Review ${prog.name} requirements`, 'Gather documentation'],
            });
          }
        }
      }
    }
  }

  // Build checklist sections
  const checklistSections: ChecklistSection[] = [];
  if (checklist) {
    if ('preConstruction' in checklist) {
      checklistSections.push({
        phase: 'Pre-Construction',
        items: checklist.preConstruction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
    if ('construction' in checklist) {
      checklistSections.push({
        phase: 'Construction',
        items: checklist.construction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
    if ('postConstruction' in checklist) {
      checklistSections.push({
        phase: 'Post-Construction',
        items: checklist.postConstruction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
  }

  const totalValue = incentives.reduce((sum, inc) => sum + inc.estimatedValue, 0);

  return {
    projectName: body.projectName || 'Project Report',
    generatedAt,
    summary: {
      location: `${body.projectData.city || ''}, ${body.projectData.state}`.trim().replace(/^,\s*/, ''),
      buildingType: body.projectData.buildingType || 'Multifamily',
      totalUnits: body.projectData.totalUnits || 0,
      totalSqft: body.projectData.totalSqft || 0,
      affordablePercentage: body.projectData.affordablePercentage || 0,
      totalDevelopmentCost: body.projectData.totalDevelopmentCost,
    },
    incentiveSummary: {
      totalEstimatedValue: totalValue || (summary?.incentiveSummary?.totalEstimatedValue ?? 0),
      incentiveCount: incentives.length || (summary?.incentiveSummary?.incentiveCount ?? 0),
      byCategory: {
        federal: incentives.filter(i => i.category === 'federal').length || (summary?.incentiveSummary?.byCategory?.federal ?? 0),
        state: incentives.filter(i => i.category === 'state').length || (summary?.incentiveSummary?.byCategory?.state ?? 0),
        local: incentives.filter(i => i.category === 'local').length || (summary?.incentiveSummary?.byCategory?.local ?? 0),
        utility: incentives.filter(i => i.category === 'utility').length || (summary?.incentiveSummary?.byCategory?.utility ?? 0),
      },
    },
    incentives,
    recommendations: summary?.recommendations?.filter((r): r is string => r !== null) || [],
    checklist: checklistSections.length > 0 ? checklistSections : undefined,
  };
}

function parseEstimatedValue(value: string): number {
  if (!value || value === 'N/A' || value === 'TBD') return 0;

  const cleaned = value.replace(/[$,]/g, '').trim();
  const rangeMatch = cleaned.match(/([\d.]+)/);
  if (!rangeMatch) return 0;

  let num = parseFloat(rangeMatch[1]);

  if (cleaned.toLowerCase().includes('m')) {
    num *= 1000000;
  } else if (cleaned.toLowerCase().includes('k')) {
    num *= 1000;
  }

  return Math.round(num);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
