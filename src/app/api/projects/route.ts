import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  sector_type: z.enum(['real-estate', 'clean-energy', 'water', 'waste', 'transportation', 'industrial']),
  building_type: z.string().min(1, 'Building type is required'),
  construction_type: z.enum(['new-construction', 'substantial-rehab', 'acquisition', 'refinance']),
  address_line1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State is required'),
  zip_code: z.string().min(5, 'ZIP code is required'),
  county: z.string().optional(),
  total_sqft: z.number().optional(),
  total_units: z.number().optional(),
  affordable_units: z.number().optional(),
  capacity_mw: z.number().optional(),
  stories: z.number().optional(),
  total_development_cost: z.number().optional(),
  hard_costs: z.number().optional(),
  soft_costs: z.number().optional(),
  target_certification: z.string().optional(),
  renewable_energy_types: z.array(z.string()).optional(),
  projected_energy_reduction_pct: z.number().optional(),
  domestic_content_eligible: z.boolean().optional(),
  prevailing_wage_commitment: z.boolean().optional(),
  estimated_start_date: z.string().optional(),
  estimated_completion_date: z.string().optional(),
});

// Helper: Format currency values
function formatCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// Demo project data for fallback - now includes frontend-compatible format
const DEMO_PROJECTS = {
  'mt-vernon': {
    id: 'mt-vernon',
    name: 'Mount Vernon Mixed-Use',
    shortName: 'Mt Vernon',
    address: '225 South 4th Ave, Mount Vernon, NY 10550',
    city: 'Mount Vernon',
    state: 'NY',
    county: 'Westchester',
    buildingType: 'mixed_use',
    units: '747 units',
    type: 'Mixed-Use',
    tier: 'Tier 3',
    totalUnits: 747,
    totalSqft: 850000,
    affordableUnits: 224,
    affordablePercentage: 30,
    tdc: 588.8, // TDC in millions for display
    totalDevelopmentCost: 588800000,
    status: 'in_development',
    statusBadge: '2 Actions Required',
    statusColor: 'blue',
    thumbnail: 'Ground level.jpg',
    // Raw KPI values (numbers) - CONSERVATIVE WITH 10% DAC BONUS
    // Mount Vernon Census Tract 31 = confirmed LIC/OZ (disadvantaged community)
    // Bonuses applied: §48E LIC (+10-20%), LIHTC basis boost (+30% residential), §48 domestic content (+10%), NYSERDA community adder (~10%)
    // Conservative approach: apply +10% across all scenarios for confirmed DAC designation benefits
    kpisRaw: {
      totalIncentiveValue: 193900000,
      capturedValue: 57600000,
      pendingValue: 87500000,
      atRiskValue: 48800000,
      programCount: 48,
      actionsRequired: 2,
    },
    // Formatted KPIs for frontend display
    kpis: {
      value: '$588.8M',
      identified: '$193.9M',
      captured: '$57.6M',
      rate: '33%',
      programs: 48,
      actions: 2,
    },
    // Probability-weighted scenarios with 10% DAC bonus
    scenarios: {
      conservative: { value: 57.6, coverage: 9.8, confidence: 80, label: 'Conservative', desc: 'Ministerial programs + federal base credits + 10% DAC bonus (LIC tract 31, LIHTC basis boost)' },
      realistic: { value: 96.9, coverage: 16.5, confidence: 65, label: 'Realistic (Base Case)', desc: 'State/federal credits + WOTC + 10% DAC bonus (§48E LIC, LIHTC QCT/DDA, NYSERDA community adder)' },
      optimistic: { value: 145.4, coverage: 24.7, confidence: 40, label: 'Optimistic', desc: 'Full stack with competitive programs + 10% DAC bonus (domestic content, residential basis boost, community solar)' },
      bestcase: { value: 193.9, coverage: 32.9, confidence: 20, label: 'Best Case', desc: 'All programs approve at max benefit + 10% DAC bonus (energy community brownfield, optimal stacking, full ITC allocation)' },
    },
  },
  'yonkers': {
    id: 'yonkers',
    name: 'Yonkers Affordable Housing',
    shortName: 'Yonkers',
    address: '87 Warburton Ave, Yonkers, NY 10701',
    city: 'Yonkers',
    state: 'NY',
    county: 'Westchester',
    buildingType: 'multifamily',
    units: '312 units',
    type: 'Affordable Housing',
    tier: 'Tier 2',
    totalUnits: 312,
    totalSqft: 340000,
    affordableUnits: 312,
    affordablePercentage: 100,
    tdc: 323.8,
    totalDevelopmentCost: 323800000,
    status: 'in_development',
    statusBadge: '1 Critical Action',
    statusColor: 'red',
    thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=160&h=160&fit=crop',
    kpisRaw: {
      totalIncentiveValue: 127600000,
      capturedValue: 41100000,
      pendingValue: 64800000,
      atRiskValue: 21700000,
      programCount: 26,
      actionsRequired: 1,
    },
    kpis: {
      value: '$323.8M',
      identified: '$127.6M',
      captured: '$41.1M',
      rate: '39%',
      programs: 26,
      actions: 1,
    },
    scenarios: {
      conservative: { value: 38.5, coverage: 11.9, confidence: 80, label: 'Conservative', desc: 'Ministerial programs + federal base credits + 10% DAC bonus (100% affordable, LIHTC 9% credit + basis boost)' },
      realistic: { value: 64.9, coverage: 20.0, confidence: 65, label: 'Realistic (Base Case)', desc: 'State housing credits + WOTC + 10% DAC bonus (LIHTC 4% + 9% stacking, QCT/DDA designation)' },
      optimistic: { value: 82.4, coverage: 25.4, confidence: 40, label: 'Optimistic', desc: 'Competitive programs + 10% DAC bonus (all financing tools, historic credits if applicable, renewable energy components)' },
      bestcase: { value: 127.6, coverage: 39.4, confidence: 20, label: 'Best Case', desc: 'Full program stack + 10% DAC bonus (130% basis boost, max 9% allocation, new construction premium, all stacking limits utilized)' },
    },
  },
  'new-rochelle': {
    id: 'new-rochelle',
    name: 'New Rochelle Transit Hub',
    shortName: 'New Rochelle',
    address: '150 Main St, New Rochelle, NY 10801',
    city: 'New Rochelle',
    state: 'NY',
    county: 'Westchester',
    buildingType: 'mixed_use',
    units: '428 units',
    type: 'Transit-Oriented',
    tier: 'Tier 1',
    totalUnits: 428,
    totalSqft: 520000,
    affordableUnits: 86,
    affordablePercentage: 20,
    tdc: 217.9,
    totalDevelopmentCost: 217900000,
    status: 'planning',
    statusBadge: 'On Track',
    statusColor: 'blue',
    thumbnail: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=160&h=160&fit=crop',
    kpisRaw: {
      totalIncentiveValue: 90300000,
      capturedValue: 23900000,
      pendingValue: 50600000,
      atRiskValue: 15800000,
      programCount: 26,
      actionsRequired: 0,
    },
    kpis: {
      value: '$217.9M',
      identified: '$90.3M',
      captured: '$23.9M',
      rate: '41%',
      programs: 26,
      actions: 0,
    },
    scenarios: {
      conservative: { value: 26.7, coverage: 12.3, confidence: 80, label: 'Conservative', desc: 'Ministerial programs + federal base credits + 10% DAC bonus (OZ location attraction, 20% affordable housing LIHTC base)' },
      realistic: { value: 44.6, coverage: 20.5, confidence: 65, label: 'Realistic (Base Case)', desc: 'State/local + WOTC + 10% DAC bonus (mixed-income LIHTC allocation, transit oriented development bonus, OZ capital access)' },
      optimistic: { value: 57.1, coverage: 26.2, confidence: 40, label: 'Optimistic', desc: 'Full stack with competitive programs + 10% DAC bonus (TOD credits if available, renewable energy, property tax abatement, transit subsidies)' },
      bestcase: { value: 90.3, coverage: 41.5, confidence: 20, label: 'Best Case', desc: 'All programs approve at max benefit + 10% DAC bonus (full LIHTC 9%+4% stacking, energy credits, OZ investor equity at preferred rates, all local incentives)' },
    },
  },
};

function getPortfolioSummary() {
  const projects = Object.values(DEMO_PROJECTS);
  const totals = {
    totalIncentiveValue: 0,
    capturedValue: 0,
    pendingValue: 0,
    atRiskValue: 0,
    programCount: 0,
    actionsRequired: 0,
    projectCount: projects.length,
    totalUnits: 0,
    totalSqft: 0,
    totalTDC: 0,
  };
  projects.forEach((p) => {
    totals.totalIncentiveValue += p.kpisRaw.totalIncentiveValue;
    totals.capturedValue += p.kpisRaw.capturedValue;
    totals.pendingValue += p.kpisRaw.pendingValue;
    totals.atRiskValue += p.kpisRaw.atRiskValue;
    totals.programCount += p.kpisRaw.programCount;
    totals.actionsRequired += p.kpisRaw.actionsRequired;
    totals.totalUnits += p.totalUnits;
    totals.totalSqft += p.totalSqft;
    totals.totalTDC += p.totalDevelopmentCost;
  });

  // Format for frontend display
  const captureRate = totals.totalIncentiveValue > 0
    ? Math.round((totals.capturedValue / totals.totalIncentiveValue) * 100)
    : 0;

  return {
    id: 'portfolio',
    name: 'Full Portfolio',
    address: `${totals.projectCount} projects in Westchester County`,
    kpisRaw: totals,
    kpis: {
      value: formatCurrency(totals.totalTDC),
      identified: formatCurrency(totals.totalIncentiveValue),
      captured: formatCurrency(totals.capturedValue),
      rate: `${captureRate}%`,
      programs: totals.programCount,
      actions: totals.actionsRequired,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id');
  const demoMode = searchParams.get('demo') === 'true';

  // Return demo data if requested or auth fails
  if (demoMode || projectId) {
    if (projectId && projectId !== 'portfolio') {
      const project = DEMO_PROJECTS[projectId as keyof typeof DEMO_PROJECTS];
      if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        project,
        fallback: true,
      });
    }

    // Return portfolio with all projects
    return NextResponse.json({
      success: true,
      portfolio: getPortfolioSummary(),
      projects: Object.values(DEMO_PROJECTS),
      fallback: true,
    });
  }

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      // Require authentication for API access (no CORS wildcard)
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

    // Parse query parameters
    const status = searchParams.get('status');
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('project_status', status);
    }

    if (sector) {
      query = query.eq('sector_type', sector);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,address_line1.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('[API] [GET /api/projects]:', { error: error.message, status: 500 });
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({
      data: projects,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[API] [GET /api/projects]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const projectData = validationResult.data;

    // Create project
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        organization_id: profile.organization_id,
        created_by: user.id,
        project_status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('[API] [POST /api/projects]:', { error: error.message, status: 500 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'project',
      p_entity_id: project.id,
      p_entity_name: project.name,
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('[API] [POST /api/projects]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
