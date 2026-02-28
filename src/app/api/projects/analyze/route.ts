/**
 * Project Analysis API
 *
 * Analyzes a project and returns matched incentives with eligibility scoring.
 * Uses live database queries via Supabase with eligibility engine scoring.
 *
 * POST /api/projects/analyze
 * Body: Project details
 *
 * Returns: Matched incentives, eligibility assessment, optimization suggestions
 *
 * Optional AI Enhancement:
 * Set includeAIRecommendations: true in request body to get Claude-powered:
 * - Narrative summary suitable for investor reports
 * - Detailed match explanations
 * - Gap analysis with remediation suggestions
 * - Optimization recommendations
 * - Stacking strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { matchIncentivesToProject, type MatchedIncentive } from '@/lib/incentive-matcher';
import { evaluateEligibility, ENGINE_VERSION } from '@/lib/eligibility-engine';
import {
  checkDirectPayEligibility,
  type DirectPayEntity,
  type EntityType,
  type TaxStatus,
} from '@/lib/direct-pay-checker';
import {
  generateIncentiveRecommendations,
  getQuickRecommendation,
  type AIRecommendation,
  type QuickRecommendation,
} from '@/lib/ai-recommendation-engine';
import type { Project, IncentiveProgram } from '@/types';

interface AnalysisRequest {
  // Project identification
  projectName?: string;

  // Location
  state: string;
  county?: string;
  municipality?: string;
  zipCode?: string;

  // Building type
  buildingType: string;
  projectType: 'new_construction' | 'rehabilitation' | 'acquisition';

  // Size
  totalUnits?: number;
  totalSqft?: number;
  stories?: number;

  // Affordability
  affordableUnits?: number;
  affordablePercentage?: number;
  targetAMI?: number[];

  // Financials
  totalDevelopmentCost?: number;
  acquisitionCost?: number;
  hardCosts?: number;
  softCosts?: number;

  // Sustainability
  targetCertification?: string;
  solarPlanned?: boolean;
  solarCapacityKw?: number;
  storageCapacityKwh?: number;
  evChargers?: number;

  // Timeline
  constructionStart?: string;
  expectedCompletion?: string;

  // Entity
  entityType?: string;
  taxExempt?: boolean;

  // AI Recommendations (optional)
  includeAIRecommendations?: boolean;
  aiRecommendationConfig?: {
    maxMatchExplanations?: number;
    includeStacking?: boolean;
    investorNarrative?: boolean;
    focusAreas?: ('affordability' | 'sustainability' | 'tax_credits' | 'grants')[];
  };
}

// Demo matched programs for analysis
const DEMO_MATCHES = [
  {
    programId: 'federal-45L',
    programName: 'Section 45L Tax Credit',
    category: 'federal',
    matchScore: 95,
    eligibilityStatus: 'likely_eligible',
    estimatedValue: { min: 500000, max: 1000000, expected: 750000 },
    requirements: [
      { requirement: 'Energy efficiency certification', status: 'met', notes: 'ENERGY STAR required' },
      { requirement: 'Residential units', status: 'met', notes: '' },
      { requirement: 'Placed in service by 2032', status: 'met', notes: '' },
    ],
    nextSteps: ['Engage energy consultant for ENERGY STAR pathway', 'Confirm unit count for credit calculation'],
    applicationDeadline: null,
    complexity: 'medium',
  },
  {
    programId: 'federal-179D',
    programName: 'Section 179D Deduction',
    category: 'federal',
    matchScore: 88,
    eligibilityStatus: 'likely_eligible',
    estimatedValue: { min: 200000, max: 750000, expected: 450000 },
    requirements: [
      { requirement: '25% efficiency improvement', status: 'review_needed', notes: 'Energy modeling required' },
      { requirement: 'Commercial space or common areas', status: 'met', notes: '' },
      { requirement: 'Prevailing wage compliance', status: 'pending', notes: 'For maximum deduction' },
    ],
    nextSteps: ['Commission energy model', 'Verify prevailing wage requirements'],
    applicationDeadline: null,
    complexity: 'medium',
  },
  {
    programId: 'federal-ITC',
    programName: 'Investment Tax Credit (Solar)',
    category: 'federal',
    matchScore: 92,
    eligibilityStatus: 'likely_eligible',
    estimatedValue: { min: 300000, max: 600000, expected: 400000 },
    requirements: [
      { requirement: 'Solar system installation', status: 'pending', notes: 'Design phase' },
      { requirement: 'Domestic content (bonus)', status: 'review_needed', notes: '+10% if met' },
      { requirement: 'Low-income community (bonus)', status: 'review_needed', notes: '+10-20% if applicable' },
    ],
    nextSteps: ['Finalize solar system design', 'Research energy community designation'],
    applicationDeadline: null,
    complexity: 'medium',
  },
  {
    programId: 'federal-LIHTC',
    programName: 'LIHTC 4% Tax Credit',
    category: 'federal',
    matchScore: 85,
    eligibilityStatus: 'likely_eligible',
    estimatedValue: { min: 8000000, max: 15000000, expected: 12000000 },
    requirements: [
      { requirement: 'Minimum 20% affordable', status: 'met', notes: '50% of units proposed' },
      { requirement: 'Tax-exempt bond financing', status: 'pending', notes: 'Bond application required' },
      { requirement: '30-year affordability period', status: 'met', notes: 'In project plan' },
    ],
    nextSteps: ['File bond application', 'Engage LIHTC syndicator', 'Submit to HFA'],
    applicationDeadline: '2025-03-15',
    complexity: 'high',
  },
  {
    programId: 'state-NYSERDA',
    programName: 'NYSERDA New Construction Program',
    category: 'state',
    matchScore: 90,
    eligibilityStatus: 'likely_eligible',
    estimatedValue: { min: 500000, max: 2000000, expected: 1200000 },
    requirements: [
      { requirement: 'NY location', status: 'met', notes: '' },
      { requirement: 'Pre-construction enrollment', status: 'pending', notes: 'Must enroll before breaking ground' },
      { requirement: 'Energy modeling', status: 'pending', notes: 'Required for incentive tier' },
    ],
    nextSteps: ['Complete NYSERDA enrollment', 'Submit preliminary energy model'],
    applicationDeadline: 'Rolling',
    complexity: 'medium',
  },
  {
    programId: 'local-485x',
    programName: '485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    category: 'local',
    matchScore: 78,
    eligibilityStatus: 'review_needed',
    estimatedValue: { min: 5000000, max: 30000000, expected: 18000000 },
    requirements: [
      { requirement: 'NYC location (5 boroughs)', status: 'met', notes: '' },
      { requirement: 'Minimum 25% affordable units', status: 'review_needed', notes: 'AMI thresholds vary by track and borough' },
      { requirement: 'Prevailing wage (100+ unit projects)', status: 'pending', notes: 'Required for buildings over 100 units — both construction and ongoing building services' },
    ],
    nextSteps: ['Confirm track (A vs B) based on affordability depth', 'Verify AMI targeting by unit type', 'Engage NYC HPD for pre-application meeting'],
    applicationDeadline: 'Rolling — no sunset date',
    complexity: 'high',
  },
];

function analyzeProject(project: AnalysisRequest) {
  const analysis = {
    projectSummary: {
      name: project.projectName || 'New Project',
      location: `${project.municipality || ''}, ${project.state}`.trim().replace(/^,\s*/, ''),
      buildingType: project.buildingType,
      projectType: project.projectType,
      totalUnits: project.totalUnits || 0,
      totalSqft: project.totalSqft || 0,
      affordablePercentage: project.affordablePercentage || 0,
      sustainabilityTarget: project.targetCertification || 'Code Minimum',
    },
    matchedPrograms: [] as typeof DEMO_MATCHES,
    totals: {
      totalPrograms: 0,
      highConfidence: 0,
      reviewNeeded: 0,
      estimatedTotal: { min: 0, max: 0, expected: 0 },
      byCategory: {
        federal: { count: 0, value: 0 },
        state: { count: 0, value: 0 },
        local: { count: 0, value: 0 },
        utility: { count: 0, value: 0 },
      },
    },
    recommendations: [] as string[],
    warnings: [] as string[],
  };

  // Filter and customize matches based on project
  let matches = [...DEMO_MATCHES];

  // Filter by state
  if (project.state !== 'NY') {
    matches = matches.filter((m) => m.category === 'federal');
    analysis.recommendations.push(`Research ${project.state}-specific state and local incentives`);
  }

  // Filter by municipality
  if (project.state === 'NY' && project.municipality !== 'New York City') {
    matches = matches.filter((m) => m.programId !== 'local-485x');
    if (project.county === 'Westchester') {
      matches.push({
        programId: 'local-PILOT',
        programName: 'Westchester IDA PILOT',
        category: 'local',
        matchScore: 75,
        eligibilityStatus: 'review_needed',
        estimatedValue: { min: 500000, max: 3000000, expected: 1500000 },
        requirements: [
          { requirement: 'Westchester location', status: 'met', notes: '' },
          { requirement: 'Job creation', status: 'pending', notes: 'Commitment required' },
        ],
        nextSteps: ['Contact Westchester IDA', 'Prepare PILOT application'],
        applicationDeadline: null,
        complexity: 'medium',
      });
    }
  }

  // Adjust LIHTC based on affordability
  const affordablePct = project.affordablePercentage || 0;
  if (affordablePct < 20) {
    matches = matches.filter((m) => m.programId !== 'federal-LIHTC');
    analysis.recommendations.push('Consider increasing affordable units to 20%+ to qualify for LIHTC');
  }

  // Adjust ITC based on solar plans
  if (!project.solarPlanned && !project.solarCapacityKw) {
    const itcMatch = matches.find((m) => m.programId === 'federal-ITC');
    if (itcMatch) {
      itcMatch.matchScore = 50;
      itcMatch.eligibilityStatus = 'review_needed';
      itcMatch.requirements[0].status = 'not_met';
    }
    analysis.recommendations.push('Adding solar would unlock 30%+ Investment Tax Credit');
  }

  // Scale values based on project size
  const scaleFactor = Math.max(1, (project.totalUnits || 100) / 100);
  matches.forEach((m) => {
    m.estimatedValue.min = Math.round(m.estimatedValue.min * scaleFactor);
    m.estimatedValue.max = Math.round(m.estimatedValue.max * scaleFactor);
    m.estimatedValue.expected = Math.round(m.estimatedValue.expected * scaleFactor);
  });

  // Calculate totals
  matches.forEach((m) => {
    analysis.totals.totalPrograms++;
    if (m.matchScore >= 85) analysis.totals.highConfidence++;
    else analysis.totals.reviewNeeded++;

    analysis.totals.estimatedTotal.min += m.estimatedValue.min;
    analysis.totals.estimatedTotal.max += m.estimatedValue.max;
    analysis.totals.estimatedTotal.expected += m.estimatedValue.expected;

    const cat = m.category as keyof typeof analysis.totals.byCategory;
    if (analysis.totals.byCategory[cat]) {
      analysis.totals.byCategory[cat].count++;
      analysis.totals.byCategory[cat].value += m.estimatedValue.expected;
    }
  });

  analysis.matchedPrograms = matches.sort((a, b) => b.matchScore - a.matchScore);

  // Add warnings
  if (project.projectType === 'new_construction' && !project.constructionStart) {
    analysis.warnings.push('Construction start date needed for accurate deadline tracking');
  }

  if (affordablePct >= 20 && affordablePct < 25) {
    analysis.warnings.push('At 25% affordable, additional local incentives may be available');
  }

  return analysis;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AnalysisRequest = await request.json();

    // Validate required fields
    if (!body.state) {
      return NextResponse.json(
        { error: 'State is required for analysis' },
        { status: 400 }
      );
    }

    // Check if we should use live data
    const useLiveData = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    let analysis;
    let dataSource: 'live' | 'demo' = 'demo';

    if (useLiveData) {
      try {
        analysis = await analyzeProjectLive(body);
        dataSource = 'live';
      } catch (dbError) {
        console.warn('Live database query failed, falling back to demo:', dbError);
        analysis = analyzeProject(body);
        dataSource = 'demo';
      }
    } else {
      analysis = analyzeProject(body);
    }

    return NextResponse.json(
      {
        success: true,
        analysis,
        meta: {
          analyzedAt: new Date().toISOString(),
          responseTime: `${Date.now() - startTime}ms`,
          version: '1.0.0',
          engineVersion: ENGINE_VERSION,
          dataSource,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error in POST /api/projects/analyze:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Analyze project using live database
 */
async function analyzeProjectLive(body: AnalysisRequest) {
  const supabase = await createClient();

  // Build project object for matching
  // Map incoming project type to construction_type enum
  const constructionTypeMap: Record<string, Project['construction_type']> = {
    'new_construction': 'new-construction',
    'rehabilitation': 'substantial-rehab',
    'acquisition': 'acquisition',
  };

  const project: Partial<Project> = {
    id: body.projectName?.toLowerCase().replace(/\s+/g, '-') || 'analysis-project',
    name: body.projectName || 'New Project',
    state: body.state,
    county: body.county,
    city: body.municipality,
    zip_code: body.zipCode,
    building_type: body.buildingType,
    construction_type: constructionTypeMap[body.projectType],
    total_units: body.totalUnits,
    total_sqft: body.totalSqft,
    affordable_units: body.affordableUnits,
    total_development_cost: body.totalDevelopmentCost,
    hard_costs: body.hardCosts,
    soft_costs: body.softCosts,
    target_certification: body.targetCertification,
    renewable_energy_types: body.solarPlanned ? ['solar'] : [],
    capacity_mw: body.solarCapacityKw ? body.solarCapacityKw / 1000 : undefined,
    estimated_start_date: body.constructionStart,
    sector_type: 'real-estate',
  };

  // Query programs from database
  // Filter by state (include federal and matching state programs)
  let query = supabase
    .from('incentive_programs')
    .select('*')
    .eq('status', 'active')
    .or(`jurisdiction_level.eq.federal,state.eq.${body.state},state.is.null`);

  // Add sector filter if building type suggests a sector
  const sectorMap: Record<string, string[]> = {
    multifamily: ['real-estate', 'affordable-housing', 'multifamily'],
    'mixed-use': ['real-estate', 'commercial', 'multifamily'],
    commercial: ['real-estate', 'commercial'],
    residential: ['real-estate', 'residential'],
    industrial: ['real-estate', 'industrial', 'manufacturing'],
  };

  const sectors = sectorMap[body.buildingType?.toLowerCase()] || ['real-estate'];

  // Limit results for performance
  const { data: programs, error } = await query.limit(500);

  if (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!programs || programs.length === 0) {
    // Return empty analysis if no programs found
    return {
      projectSummary: {
        name: project.name,
        location: `${body.municipality || ''}, ${body.state}`.trim().replace(/^,\s*/, ''),
        buildingType: body.buildingType,
        projectType: body.projectType,
        totalUnits: body.totalUnits || 0,
        totalSqft: body.totalSqft || 0,
        affordablePercentage: body.affordablePercentage || 0,
        sustainabilityTarget: body.targetCertification || 'Code Minimum',
      },
      matchedPrograms: [],
      totals: {
        totalPrograms: 0,
        highConfidence: 0,
        reviewNeeded: 0,
        estimatedTotal: { min: 0, max: 0, expected: 0 },
        byCategory: {
          federal: { count: 0, value: 0 },
          state: { count: 0, value: 0 },
          local: { count: 0, value: 0 },
          utility: { count: 0, value: 0 },
        },
      },
      recommendations: ['No matching programs found. Try broadening search criteria.'],
      warnings: ['Database may not have programs for this state yet.'],
      directPay: null,
    };
  }

  // Use incentive matcher for scoring
  const matchResult = matchIncentivesToProject(
    project as Project,
    programs as IncentiveProgram[],
    {
      maxResults: 50,
      includePartialMatches: true,
      minLocationScore: 0.3,
    }
  );

  // Convert matched incentives to API response format
  const matchedPrograms = matchResult.matches.map(match => ({
    programId: match.incentive.id,
    programName: match.incentive.name,
    category: match.incentive.category || match.incentive.jurisdiction_level || 'state',
    matchScore: Math.round(match.matchScore * 100),
    eligibilityStatus: match.tier === 'high' ? 'likely_eligible' :
      match.tier === 'medium' ? 'likely_eligible' :
        match.tier === 'low' ? 'review_needed' : 'potential',
    estimatedValue: {
      min: Math.round(match.estimatedValue * 0.8),
      max: Math.round(match.estimatedValue * 1.2),
      expected: match.estimatedValue,
    },
    requirements: match.eligibilityDetails.map(detail => ({
      requirement: detail.criterion,
      status: detail.met ? 'met' : 'pending',
      notes: detail.description,
    })),
    nextSteps: getNextSteps(match),
    applicationDeadline: match.incentive.application_deadline,
    complexity: match.tier === 'high' ? 'low' : match.tier === 'medium' ? 'medium' : 'high',
  }));

  // Calculate totals
  const totals = {
    totalPrograms: matchedPrograms.length,
    highConfidence: matchResult.summary.highTier,
    reviewNeeded: matchResult.summary.lowTier + matchResult.summary.potentialTier,
    estimatedTotal: {
      min: Math.round(matchResult.totalPotentialValue * 0.7),
      max: Math.round(matchResult.totalPotentialValue * 1.3),
      expected: Math.round(matchResult.totalPotentialValue),
    },
    byCategory: {
      federal: {
        count: matchResult.summary.federalCount,
        value: matchResult.byCategory.federal.reduce((sum, m) => sum + m.estimatedValue, 0),
      },
      state: {
        count: matchResult.summary.stateCount,
        value: matchResult.byCategory.state.reduce((sum, m) => sum + m.estimatedValue, 0),
      },
      local: {
        count: matchResult.summary.localCount,
        value: matchResult.byCategory.local.reduce((sum, m) => sum + m.estimatedValue, 0),
      },
      utility: {
        count: matchResult.summary.utilityCount,
        value: matchResult.byCategory.utility.reduce((sum, m) => sum + m.estimatedValue, 0),
      },
    },
  };

  // Generate recommendations
  const recommendations = generateRecommendations(body, matchResult);
  const warnings = generateWarnings(body, matchResult);

  // Check Direct Pay eligibility if entity info provided
  let directPay = null;
  if (body.entityType) {
    const entityTypeMap: Record<string, EntityType> = {
      nonprofit: 'nonprofit',
      municipal: 'municipal',
      tribal: 'tribal',
      state: 'state',
      federal: 'federal',
      'for-profit': 'for-profit',
      'rural-electric-coop': 'rural-electric-coop',
    };

    const taxStatusMap: Record<string, TaxStatus> = {
      nonprofit: 'nonprofit',
      municipal: 'municipal',
      tribal: 'tribal',
      'tax-exempt': 'tax-exempt',
      'for-profit': 'for-profit',
    };

    const directPayEntity: DirectPayEntity = {
      type: entityTypeMap[body.entityType.toLowerCase()] || 'other',
      taxStatus: body.taxExempt ? 'tax-exempt' :
        taxStatusMap[body.entityType.toLowerCase()] || 'for-profit',
    };

    directPay = checkDirectPayEligibility(directPayEntity);
  }

  const baseResult = {
    projectSummary: {
      name: project.name,
      location: `${body.municipality || ''}, ${body.state}`.trim().replace(/^,\s*/, ''),
      buildingType: body.buildingType,
      projectType: body.projectType,
      totalUnits: body.totalUnits || 0,
      totalSqft: body.totalSqft || 0,
      affordablePercentage: body.affordablePercentage || 0,
      sustainabilityTarget: body.targetCertification || 'Code Minimum',
    },
    matchedPrograms,
    totals,
    recommendations,
    warnings,
    directPay,
    greenIncentives: matchResult.greenIncentives.slice(0, 5).map(m => ({
      id: m.incentive.id,
      name: m.incentive.name,
      estimatedValue: m.estimatedValue,
    })),
    iraIncentives: matchResult.iraIncentives.slice(0, 5).map(m => ({
      id: m.incentive.id,
      name: m.incentive.name,
      estimatedValue: m.estimatedValue,
    })),
    // Quick recommendation always included
    quickRecommendation: getQuickRecommendation(project as Project, matchResult),
  };

  // Optionally generate full AI recommendations
  if (body.includeAIRecommendations) {
    try {
      const aiRecommendations = await generateIncentiveRecommendations(
        project as Project,
        matchResult,
        body.aiRecommendationConfig
      );
      return {
        ...baseResult,
        aiRecommendations,
      };
    } catch (aiError) {
      console.warn('AI recommendations failed, returning base analysis:', aiError);
      return {
        ...baseResult,
        aiRecommendations: null,
        aiRecommendationsError: 'AI analysis unavailable',
      };
    }
  }

  return baseResult;
}

/**
 * Generate next steps based on match
 */
function getNextSteps(match: MatchedIncentive): string[] {
  const steps: string[] = [];
  const incentive = match.incentive;

  // Add program-specific steps
  if (incentive.application_deadline) {
    const deadline = new Date(incentive.application_deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 90) {
      steps.push(`Application deadline in ${daysUntil} days - prioritize this program`);
    }
  }

  // Add requirement-based steps
  const pendingReqs = match.eligibilityDetails.filter(d => !d.met);
  if (pendingReqs.length > 0) {
    steps.push(`Review ${pendingReqs.length} pending requirement(s)`);
  }

  // Add tier-specific steps
  if (match.tier === 'high') {
    steps.push('Begin application process');
    steps.push('Gather supporting documentation');
  } else if (match.tier === 'medium') {
    steps.push('Verify eligibility requirements');
    steps.push('Contact program administrator for clarification');
  } else {
    steps.push('Explore potential eligibility pathways');
  }

  return steps.slice(0, 3);
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(body: AnalysisRequest, matchResult: ReturnType<typeof matchIncentivesToProject>): string[] {
  const recommendations: string[] = [];

  // Affordability recommendations
  const affordablePct = body.affordablePercentage || 0;
  if (affordablePct > 0 && affordablePct < 20) {
    recommendations.push('Consider increasing affordable units to 20%+ for LIHTC and other affordability incentives');
  } else if (affordablePct >= 20 && affordablePct < 50) {
    recommendations.push('Current affordability level qualifies for multiple programs - explore deep affordability bonuses');
  }

  // Solar/energy recommendations
  if (!body.solarPlanned && matchResult.greenIncentives.length > 0) {
    const solarValue = matchResult.greenIncentives
      .filter(m => m.incentive.name?.toLowerCase().includes('solar') || m.incentive.name?.toLowerCase().includes('itc'))
      .reduce((sum, m) => sum + m.estimatedValue, 0);
    if (solarValue > 0) {
      recommendations.push(`Adding solar could unlock up to ${formatCurrency(solarValue)} in additional incentives`);
    }
  }

  // IRA bonus recommendations
  if (matchResult.iraIncentives.length > 0) {
    recommendations.push('Explore IRA bonus credits: domestic content, energy community, and prevailing wage requirements');
  }

  // State-specific recommendations
  if (body.state !== 'NY' && matchResult.summary.stateCount < 3) {
    recommendations.push(`Research additional ${body.state}-specific state and local incentive programs`);
  }

  // Pre-construction timing
  if (body.projectType === 'new_construction' && !body.constructionStart) {
    recommendations.push('Many programs require pre-construction enrollment - finalize timeline soon');
  }

  return recommendations.slice(0, 5);
}

/**
 * Generate warnings based on analysis
 */
function generateWarnings(body: AnalysisRequest, matchResult: ReturnType<typeof matchIncentivesToProject>): string[] {
  const warnings: string[] = [];

  // Deadline warnings
  const upcomingDeadlines = matchResult.matches.filter(m => {
    if (!m.incentive.application_deadline) return false;
    const deadline = new Date(m.incentive.application_deadline);
    const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 60;
  });

  if (upcomingDeadlines.length > 0) {
    warnings.push(`${upcomingDeadlines.length} program(s) have deadlines within 60 days`);
  }

  // Data quality warnings
  if (!body.totalDevelopmentCost) {
    warnings.push('Total development cost not provided - value estimates may be inaccurate');
  }

  if (!body.totalUnits && !body.totalSqft) {
    warnings.push('Project size not specified - some eligibility checks may be incomplete');
  }

  // Complexity warnings
  const highComplexity = matchResult.matches.filter(m => m.tier === 'potential').length;
  if (highComplexity > 5) {
    warnings.push(`${highComplexity} programs need additional review to confirm eligibility`);
  }

  return warnings;
}

/**
 * Format currency for recommendations
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
