import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Demo organization
const DEMO_ORGANIZATION = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'AoRa Development LLC',
  legal_name: 'AoRa Development LLC',
  organization_type: 'developer',
  tax_status: 'for-profit',
  mwbe_certified: true,
  mwbe_certification_state: 'NY',
  subscription_tier: 'professional',
  settings: { defaultState: 'NY', enabledFeatures: ['projects', 'incentives', 'reports', 'applications'] },
};

// Demo projects
const DEMO_PROJECTS = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Mount Vernon Mixed-Use',
    description: 'A transformational 747-unit mixed-use development in downtown Mount Vernon featuring affordable housing, retail, and community space.',
    address_line1: '225 South 4th Avenue',
    city: 'Mount Vernon',
    state: 'NY',
    zip_code: '10550',
    county: 'Westchester',
    sector_type: 'real-estate',
    building_type: 'mixed_use',
    construction_type: 'new-construction',
    total_units: 747,
    affordable_units: 224,
    total_sqft: 850000,
    stories: 12,
    total_development_cost: 588800000,
    hard_costs: 450000000,
    soft_costs: 88800000,
    target_certification: 'LEED Gold',
    renewable_energy_types: ['solar', 'battery'],
    projected_energy_reduction_pct: 35,
    domestic_content_eligible: true,
    prevailing_wage_commitment: true,
    low_income_community_eligible: true,
    project_status: 'active',
    total_potential_incentives: 252200000,
    total_captured_incentives: 88100000,
    tags: ['westchester', 'affordable', 'mixed-use', 'tod'],
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Yonkers Affordable Housing',
    description: '312-unit 100% affordable housing development in Yonkers near transit.',
    address_line1: '87 Warburton Avenue',
    city: 'Yonkers',
    state: 'NY',
    zip_code: '10701',
    county: 'Westchester',
    sector_type: 'real-estate',
    building_type: 'multifamily',
    construction_type: 'new-construction',
    total_units: 312,
    affordable_units: 312,
    total_sqft: 340000,
    stories: 8,
    total_development_cost: 323800000,
    hard_costs: 248000000,
    soft_costs: 45800000,
    target_certification: 'Passive House',
    renewable_energy_types: ['solar', 'geothermal'],
    projected_energy_reduction_pct: 55,
    domestic_content_eligible: true,
    prevailing_wage_commitment: true,
    energy_community_eligible: true,
    low_income_community_eligible: true,
    project_status: 'active',
    total_potential_incentives: 138700000,
    total_captured_incentives: 31900000,
    tags: ['yonkers', 'affordable', 'passive-house', 'lihtc'],
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'New Rochelle Transit Hub',
    description: '428-unit transit-oriented development adjacent to New Rochelle Metro-North station.',
    address_line1: '150 Main Street',
    city: 'New Rochelle',
    state: 'NY',
    zip_code: '10801',
    county: 'Westchester',
    sector_type: 'real-estate',
    building_type: 'mixed_use',
    construction_type: 'new-construction',
    total_units: 428,
    affordable_units: 86,
    total_sqft: 520000,
    stories: 18,
    total_development_cost: 217900000,
    hard_costs: 165000000,
    soft_costs: 32900000,
    target_certification: 'ENERGY STAR',
    renewable_energy_types: ['solar'],
    projected_energy_reduction_pct: 28,
    prevailing_wage_commitment: true,
    project_status: 'active',
    total_potential_incentives: 93300000,
    total_captured_incentives: 14800000,
    tags: ['new-rochelle', 'tod', 'mixed-use'],
  },
];

// Demo incentive programs
const DEMO_PROGRAMS = [
  {
    id: '00000000-0000-0000-0002-000000000001',
    external_id: 'IRA-45L',
    name: 'Section 45L New Energy Efficient Home Credit',
    short_name: '45L Tax Credit',
    description: 'Federal tax credit for new residential construction meeting energy efficiency standards.',
    program_type: 'tax_credit',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_credit',
    amount_type: 'per_unit',
    amount_per_unit: 5000,
    direct_pay_eligible: true,
    transferable: true,
    status: 'active',
    administrator: 'IRS',
    administering_agency: 'Internal Revenue Service',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    external_id: 'IRA-179D',
    name: 'Section 179D Energy Efficient Commercial Building Deduction',
    short_name: '179D Deduction',
    description: 'Tax deduction for commercial buildings meeting energy efficiency requirements.',
    program_type: 'tax_deduction',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_deduction',
    amount_type: 'per_sqft',
    amount_per_sqft: 5.0,
    direct_pay_eligible: true,
    status: 'active',
    administrator: 'IRS',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    external_id: 'IRA-48-ITC',
    name: 'Investment Tax Credit (ITC) for Solar & Storage',
    short_name: 'Solar ITC',
    description: 'Investment tax credit for solar energy systems and battery storage.',
    program_type: 'tax_credit',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_credit',
    amount_type: 'percentage',
    amount_percentage: 0.3,
    direct_pay_eligible: true,
    transferable: true,
    domestic_content_bonus: 0.1,
    energy_community_bonus: 0.1,
    low_income_bonus: 0.2,
    status: 'active',
    administrator: 'IRS',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    external_id: 'FED-LIHTC-4',
    name: 'Low-Income Housing Tax Credit (4%)',
    short_name: 'LIHTC 4%',
    description: 'Federal tax credit for affordable housing developments.',
    program_type: 'tax_credit',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_credit',
    amount_type: 'percentage',
    amount_percentage: 0.04,
    transferable: true,
    status: 'active',
    administrator: 'State HFAs',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    external_id: 'NY-NYSERDA-NC',
    name: 'NYSERDA New Construction Program',
    short_name: 'NYSERDA New Construction',
    description: 'Incentives for new multifamily buildings exceeding energy code.',
    program_type: 'rebate',
    category: 'state',
    jurisdiction_level: 'state',
    state: 'NY',
    incentive_type: 'rebate',
    amount_type: 'variable',
    amount_max: 3000000,
    status: 'active',
    administrator: 'NYSERDA',
    confidence_score: 0.9,
  },
  {
    id: '00000000-0000-0000-0002-000000000006',
    external_id: 'WEST-IDA-PILOT',
    name: 'Westchester IDA PILOT Program',
    short_name: 'Westchester PILOT',
    description: 'Payment in Lieu of Taxes program for qualified developments.',
    program_type: 'tax_abatement',
    category: 'local',
    jurisdiction_level: 'local',
    state: 'NY',
    counties: ['Westchester'],
    incentive_type: 'tax_abatement',
    amount_type: 'variable',
    status: 'active',
    administrator: 'Westchester IDA',
    confidence_score: 0.85,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple protection
  if (secret !== 'seed-demo-2024') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const results: string[] = [];

  try {
    // 1. Insert organization
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert(DEMO_ORGANIZATION, { onConflict: 'id' });

    if (orgError) {
      results.push(`Organization error: ${orgError.message}`);
    } else {
      results.push('Organization created: AoRa Development LLC');
    }

    // 2. Insert incentive programs
    const { error: programsError } = await supabase
      .from('incentive_programs')
      .upsert(DEMO_PROGRAMS, { onConflict: 'id' });

    if (programsError) {
      results.push(`Programs error: ${programsError.message}`);
    } else {
      results.push(`Created ${DEMO_PROGRAMS.length} incentive programs`);
    }

    // 3. Insert projects
    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(DEMO_PROJECTS, { onConflict: 'id' });

    if (projectsError) {
      results.push(`Projects error: ${projectsError.message}`);
    } else {
      results.push(`Created ${DEMO_PROJECTS.length} projects`);
    }

    // 4. Create incentive matches
    let matchCount = 0;
    for (const project of DEMO_PROJECTS) {
      for (const program of DEMO_PROGRAMS) {
        const score = 0.6 + Math.random() * 0.35;
        let estimatedValue = 0;

        if (program.amount_per_unit && project.total_units) {
          estimatedValue = program.amount_per_unit * project.total_units;
        } else if (program.amount_per_sqft && project.total_sqft) {
          estimatedValue = program.amount_per_sqft * project.total_sqft;
        } else if (program.amount_percentage && project.total_development_cost) {
          estimatedValue = program.amount_percentage * project.total_development_cost;
        } else {
          estimatedValue = Math.floor(Math.random() * 5000000) + 500000;
        }

        const match = {
          project_id: project.id,
          incentive_program_id: program.id,
          overall_score: Math.round(score * 100) / 100,
          estimated_value: Math.round(estimatedValue),
          status: score > 0.8 ? 'shortlisted' : 'matched',
        };

        const { error } = await supabase
          .from('project_incentive_matches')
          .upsert(match, { onConflict: 'project_id,incentive_program_id' });

        if (!error) matchCount++;
      }
    }
    results.push(`Created ${matchCount} incentive matches`);

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      results,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
    }, { status: 500 });
  }
}
