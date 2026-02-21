/**
 * Demo Data Seeder
 *
 * Seeds the database with demo projects, organizations, and sample incentive matches.
 * Use this for development and demo purposes.
 *
 * Usage:
 *   npx ts-node scripts/seed-demo-data.ts
 *   npx ts-node scripts/seed-demo-data.ts --clean   # Clear existing demo data first
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials. Please set:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Demo organization
const DEMO_ORGANIZATION = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'AoRa Development LLC',
  legal_name: 'AoRa Development LLC',
  organization_type: 'developer',
  tax_status: 'for-profit' as const,
  mwbe_certified: true,
  mwbe_certification_state: 'NY',
  subscription_tier: 'professional' as const,
  settings: {
    defaultState: 'NY',
    enabledFeatures: ['projects', 'incentives', 'reports', 'applications'],
  },
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
    latitude: 40.9126,
    longitude: -73.8371,
    sector_type: 'real-estate' as const,
    building_type: 'mixed_use',
    construction_type: 'new-construction' as const,
    total_units: 747,
    affordable_units: 224,
    affordable_breakdown: { ami_30: 45, ami_50: 75, ami_60: 60, ami_80: 44 },
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
    energy_community_eligible: false,
    low_income_community_eligible: true,
    project_status: 'active' as const,
    estimated_start_date: '2025-06-01',
    estimated_completion_date: '2028-12-31',
    total_potential_incentives: 252200000,
    total_captured_incentives: 88100000,
    eligibility_scan_count: 3,
    tags: ['westchester', 'affordable', 'mixed-use', 'tod'],
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'Yonkers Affordable Housing',
    description: '312-unit 100% affordable housing development in Yonkers near transit, serving families at 30-80% AMI.',
    address_line1: '87 Warburton Avenue',
    city: 'Yonkers',
    state: 'NY',
    zip_code: '10701',
    county: 'Westchester',
    latitude: 40.9312,
    longitude: -73.8987,
    sector_type: 'real-estate' as const,
    building_type: 'multifamily',
    construction_type: 'new-construction' as const,
    total_units: 312,
    affordable_units: 312,
    affordable_breakdown: { ami_30: 62, ami_50: 125, ami_60: 75, ami_80: 50 },
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
    project_status: 'active' as const,
    estimated_start_date: '2025-09-01',
    estimated_completion_date: '2028-06-30',
    total_potential_incentives: 138700000,
    total_captured_incentives: 31900000,
    eligibility_scan_count: 2,
    tags: ['yonkers', 'affordable', 'passive-house', 'lihtc'],
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    organization_id: DEMO_ORGANIZATION.id,
    name: 'New Rochelle Transit Hub',
    description: '428-unit transit-oriented development adjacent to New Rochelle Metro-North station with 20% affordable units.',
    address_line1: '150 Main Street',
    city: 'New Rochelle',
    state: 'NY',
    zip_code: '10801',
    county: 'Westchester',
    latitude: 40.9117,
    longitude: -73.7826,
    sector_type: 'real-estate' as const,
    building_type: 'mixed_use',
    construction_type: 'new-construction' as const,
    total_units: 428,
    affordable_units: 86,
    affordable_breakdown: { ami_50: 43, ami_60: 43 },
    total_sqft: 520000,
    stories: 18,
    total_development_cost: 217900000,
    hard_costs: 165000000,
    soft_costs: 32900000,
    target_certification: 'ENERGY STAR',
    renewable_energy_types: ['solar'],
    projected_energy_reduction_pct: 28,
    domestic_content_eligible: false,
    prevailing_wage_commitment: true,
    energy_community_eligible: false,
    low_income_community_eligible: false,
    project_status: 'active' as const,
    estimated_start_date: '2026-03-01',
    estimated_completion_date: '2029-06-30',
    total_potential_incentives: 93300000,
    total_captured_incentives: 14800000,
    eligibility_scan_count: 1,
    tags: ['new-rochelle', 'tod', 'mixed-use'],
  },
];

// Demo incentive programs
const DEMO_INCENTIVE_PROGRAMS = [
  {
    id: '00000000-0000-0000-0002-000000000001',
    external_id: 'IRA-45L',
    name: 'Section 45L New Energy Efficient Home Credit',
    short_name: '45L Tax Credit',
    description: 'Federal tax credit for new residential construction meeting energy efficiency standards.',
    summary: 'Up to $5,000 per dwelling unit for homes meeting ENERGY STAR or Zero Energy Ready Home certification.',
    program_type: 'tax_credit',
    category: 'federal' as const,
    sector_types: ['real-estate'],
    technology_types: ['energy-efficiency'],
    building_types: ['multifamily', 'single-family'],
    jurisdiction_level: 'federal' as const,
    incentive_type: 'tax_credit',
    amount_type: 'per_unit' as const,
    amount_per_unit: 5000,
    amount_min: 2500,
    amount_max: 5000,
    eligibility_summary: 'New construction or substantial rehabilitation meeting ENERGY STAR Multifamily New Construction certification or Zero Energy Ready Home.',
    direct_pay_eligible: true,
    transferable: true,
    prevailing_wage_bonus: 0.0,
    status: 'active' as const,
    start_date: '2023-01-01',
    end_date: '2032-12-31',
    administrator: 'IRS',
    administering_agency: 'Internal Revenue Service',
    source_url: 'https://www.irs.gov/credits-deductions/45l-new-energy-efficient-home-credit',
    application_url: 'https://www.irs.gov/forms-pubs/about-form-8908',
    application_complexity: 'moderate' as const,
    typical_processing_days: 90,
    stackable: true,
    data_source: 'IRS',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    external_id: 'IRA-179D',
    name: 'Section 179D Energy Efficient Commercial Building Deduction',
    short_name: '179D Deduction',
    description: 'Tax deduction for commercial buildings meeting energy efficiency requirements.',
    summary: 'Up to $5.00 per square foot for buildings exceeding ASHRAE 90.1 by 25% or more.',
    program_type: 'tax_deduction',
    category: 'federal' as const,
    sector_types: ['real-estate'],
    technology_types: ['energy-efficiency', 'hvac', 'lighting', 'building-envelope'],
    building_types: ['commercial', 'multifamily'],
    jurisdiction_level: 'federal' as const,
    incentive_type: 'tax_deduction',
    amount_type: 'per_sqft' as const,
    amount_per_sqft: 5.0,
    amount_min: 0.5,
    amount_max: 5.0,
    eligibility_summary: 'Commercial buildings or multifamily common areas exceeding ASHRAE 90.1-2007 by 25% or more.',
    direct_pay_eligible: true,
    transferable: false,
    prevailing_wage_bonus: 4.0,
    status: 'active' as const,
    start_date: '2023-01-01',
    end_date: '2032-12-31',
    administrator: 'IRS',
    administering_agency: 'Internal Revenue Service',
    source_url: 'https://www.irs.gov/credits-deductions/energy-efficient-commercial-buildings-deduction',
    application_complexity: 'complex' as const,
    typical_processing_days: 120,
    stackable: true,
    data_source: 'IRS',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    external_id: 'IRA-48-ITC',
    name: 'Investment Tax Credit (ITC) for Solar & Storage',
    short_name: 'Solar ITC',
    description: 'Investment tax credit for solar energy systems and battery storage.',
    summary: '30% base credit with bonuses up to 70% for domestic content, energy communities, and low-income projects.',
    program_type: 'tax_credit',
    category: 'federal' as const,
    sector_types: ['clean-energy', 'real-estate'],
    technology_types: ['solar', 'battery-storage'],
    building_types: ['commercial', 'multifamily', 'industrial'],
    jurisdiction_level: 'federal' as const,
    incentive_type: 'tax_credit',
    amount_type: 'percentage' as const,
    amount_percentage: 0.3,
    eligibility_summary: 'Solar photovoltaic systems and battery storage installations. Bonus credits available for domestic content, energy communities, and low-income projects.',
    direct_pay_eligible: true,
    transferable: true,
    domestic_content_bonus: 0.1,
    energy_community_bonus: 0.1,
    low_income_bonus: 0.2,
    status: 'active' as const,
    start_date: '2023-01-01',
    end_date: '2032-12-31',
    administrator: 'IRS',
    administering_agency: 'Internal Revenue Service',
    source_url: 'https://www.irs.gov/credits-deductions/investment-tax-credit',
    application_complexity: 'moderate' as const,
    typical_processing_days: 90,
    stackable: true,
    data_source: 'IRS',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    external_id: 'FED-LIHTC-4',
    name: 'Low-Income Housing Tax Credit (4%)',
    short_name: 'LIHTC 4%',
    description: 'Federal tax credit for affordable housing developments financed with tax-exempt bonds.',
    summary: 'Approximately 4% credit rate over 10 years for affordable housing, typically paired with tax-exempt bond financing.',
    program_type: 'tax_credit',
    category: 'federal' as const,
    sector_types: ['real-estate'],
    technology_types: [],
    building_types: ['multifamily'],
    jurisdiction_level: 'federal' as const,
    incentive_type: 'tax_credit',
    amount_type: 'percentage' as const,
    amount_percentage: 0.04,
    eligibility_summary: 'Rental housing with at least 20% of units affordable to 50% AMI or 40% affordable to 60% AMI. Must be paired with tax-exempt bond financing.',
    direct_pay_eligible: false,
    transferable: true,
    status: 'active' as const,
    administrator: 'State HFAs',
    administering_agency: 'HUD / State Housing Finance Agencies',
    source_url: 'https://www.huduser.gov/portal/datasets/lihtc.html',
    application_complexity: 'very_complex' as const,
    typical_processing_days: 180,
    stackable: true,
    data_source: 'HUD',
    confidence_score: 0.95,
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    external_id: 'NY-NYSERDA-NC',
    name: 'NYSERDA New Construction Program',
    short_name: 'NYSERDA New Construction',
    description: 'Incentives for new multifamily buildings exceeding energy code requirements.',
    summary: 'Up to $3M per project for new construction achieving significant energy savings beyond code.',
    program_type: 'rebate',
    category: 'state' as const,
    sector_types: ['real-estate'],
    technology_types: ['energy-efficiency', 'hvac', 'building-envelope'],
    building_types: ['multifamily', 'commercial'],
    jurisdiction_level: 'state' as const,
    state: 'NY',
    incentive_type: 'rebate',
    amount_type: 'variable' as const,
    amount_max: 3000000,
    eligibility_summary: 'New construction in New York achieving significant energy savings beyond ECCCNYS. Must pre-enroll before construction start.',
    status: 'active' as const,
    administrator: 'NYSERDA',
    administering_agency: 'New York State Energy Research and Development Authority',
    source_url: 'https://www.nyserda.ny.gov/All-Programs/New-Construction-Program',
    application_url: 'https://www.nyserda.ny.gov/All-Programs/New-Construction-Program/Participate',
    application_complexity: 'moderate' as const,
    typical_processing_days: 60,
    stackable: true,
    data_source: 'NYSERDA',
    confidence_score: 0.9,
  },
  {
    id: '00000000-0000-0000-0002-000000000006',
    external_id: 'NY-HCR-LIHTC',
    name: 'New York State LIHTC',
    short_name: 'NY State LIHTC',
    description: 'New York state credit supplementing federal LIHTC allocation.',
    summary: 'State tax credits to supplement federal LIHTC awards for affordable housing.',
    program_type: 'tax_credit',
    category: 'state' as const,
    sector_types: ['real-estate'],
    technology_types: [],
    building_types: ['multifamily'],
    jurisdiction_level: 'state' as const,
    state: 'NY',
    incentive_type: 'tax_credit',
    amount_type: 'variable' as const,
    eligibility_summary: 'Projects receiving federal LIHTC allocation from NY HCR.',
    status: 'active' as const,
    administrator: 'HCR',
    administering_agency: 'New York Homes and Community Renewal',
    source_url: 'https://hcr.ny.gov/lihtc',
    application_complexity: 'very_complex' as const,
    typical_processing_days: 180,
    stackable: true,
    data_source: 'NY HCR',
    confidence_score: 0.9,
  },
  {
    id: '00000000-0000-0000-0002-000000000007',
    external_id: 'WEST-IDA-PILOT',
    name: 'Westchester IDA PILOT Program',
    short_name: 'Westchester PILOT',
    description: 'Payment in Lieu of Taxes program for qualified development projects.',
    summary: 'Up to 15-year PILOT reducing property tax burden for eligible development projects.',
    program_type: 'tax_abatement',
    category: 'local' as const,
    sector_types: ['real-estate'],
    technology_types: [],
    building_types: ['multifamily', 'commercial', 'mixed_use'],
    jurisdiction_level: 'local' as const,
    state: 'NY',
    counties: ['Westchester'],
    incentive_type: 'tax_abatement',
    amount_type: 'variable' as const,
    eligibility_summary: 'New construction or substantial rehabilitation in Westchester County creating jobs or affordable housing.',
    status: 'active' as const,
    administrator: 'Westchester IDA',
    administering_agency: 'Westchester County Industrial Development Agency',
    source_url: 'https://westchestergov.com/ida',
    application_complexity: 'complex' as const,
    typical_processing_days: 90,
    stackable: true,
    data_source: 'Westchester IDA',
    confidence_score: 0.85,
  },
  {
    id: '00000000-0000-0000-0002-000000000008',
    external_id: 'CONED-MF-REBATE',
    name: 'Con Edison Multifamily Program',
    short_name: 'ConEd MF Rebate',
    description: 'Rebates for energy efficiency in multifamily buildings.',
    summary: 'Per-unit rebates for energy efficiency measures in multifamily buildings in ConEd territory.',
    program_type: 'rebate',
    category: 'utility' as const,
    sector_types: ['real-estate'],
    technology_types: ['energy-efficiency', 'hvac', 'lighting'],
    building_types: ['multifamily'],
    jurisdiction_level: 'utility' as const,
    state: 'NY',
    utility_territories: ['ConEd'],
    incentive_type: 'rebate',
    amount_type: 'per_unit' as const,
    amount_per_unit: 1000,
    amount_max: 500000,
    eligibility_summary: 'Multifamily buildings (5+ units) in Con Edison electric service territory.',
    status: 'active' as const,
    administrator: 'Con Edison',
    administering_agency: 'Consolidated Edison Company of New York',
    source_url: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits',
    application_complexity: 'simple' as const,
    typical_processing_days: 30,
    stackable: true,
    data_source: 'Con Edison',
    confidence_score: 0.85,
  },
];

async function seedDemoData(clean: boolean = false) {
  console.log('\n========================================');
  console.log('IncentEdge Demo Data Seeder');
  console.log('========================================\n');

  if (clean) {
    console.log('Cleaning existing demo data...');

    // Delete in reverse order of dependencies
    await supabase.from('project_incentive_matches').delete().eq('project_id', DEMO_PROJECTS[0].id);
    await supabase.from('project_incentive_matches').delete().eq('project_id', DEMO_PROJECTS[1].id);
    await supabase.from('project_incentive_matches').delete().eq('project_id', DEMO_PROJECTS[2].id);

    for (const project of DEMO_PROJECTS) {
      await supabase.from('projects').delete().eq('id', project.id);
    }

    for (const program of DEMO_INCENTIVE_PROGRAMS) {
      await supabase.from('incentive_programs').delete().eq('id', program.id);
    }

    await supabase.from('organizations').delete().eq('id', DEMO_ORGANIZATION.id);

    console.log('Existing demo data cleaned.\n');
  }

  // Insert organization
  console.log('Creating demo organization...');
  const { error: orgError } = await supabase
    .from('organizations')
    .upsert(DEMO_ORGANIZATION, { onConflict: 'id' });

  if (orgError) {
    console.error('Error creating organization:', orgError.message);
  } else {
    console.log('Organization created: AoRa Development LLC');
  }

  // Insert incentive programs
  console.log('\nCreating demo incentive programs...');
  const { error: programsError } = await supabase
    .from('incentive_programs')
    .upsert(DEMO_INCENTIVE_PROGRAMS, { onConflict: 'id' });

  if (programsError) {
    console.error('Error creating programs:', programsError.message);
  } else {
    console.log(`Created ${DEMO_INCENTIVE_PROGRAMS.length} incentive programs`);
  }

  // Insert projects
  console.log('\nCreating demo projects...');
  const { error: projectsError } = await supabase
    .from('projects')
    .upsert(DEMO_PROJECTS, { onConflict: 'id' });

  if (projectsError) {
    console.error('Error creating projects:', projectsError.message);
  } else {
    console.log(`Created ${DEMO_PROJECTS.length} projects`);
  }

  // Create incentive matches for each project
  console.log('\nCreating incentive matches...');
  let matchCount = 0;

  for (const project of DEMO_PROJECTS) {
    for (const program of DEMO_INCENTIVE_PROGRAMS) {
      // Calculate mock match score and value
      const score = 0.6 + Math.random() * 0.35;
      let estimatedValue = 0;

      if (program.amount_per_unit && project.total_units) {
        estimatedValue = program.amount_per_unit * project.total_units;
      } else if (program.amount_per_sqft && project.total_sqft) {
        estimatedValue = program.amount_per_sqft * project.total_sqft;
      } else if (program.amount_percentage && project.total_development_cost) {
        estimatedValue = program.amount_percentage * project.total_development_cost;
      } else {
        estimatedValue = Math.floor(Math.random() * 5000000) + 100000;
      }

      const match = {
        project_id: project.id,
        incentive_program_id: program.id,
        overall_score: Math.round(score * 100) / 100,
        probability_score: Math.round((score - 0.1 + Math.random() * 0.2) * 100) / 100,
        relevance_score: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
        estimated_value: Math.round(estimatedValue),
        value_low: Math.round(estimatedValue * 0.7),
        value_high: Math.round(estimatedValue * 1.3),
        requirements_met: Math.floor(Math.random() * 5) + 5,
        requirements_total: 10,
        status: score > 0.8 ? 'shortlisted' : 'matched',
        domestic_content_bonus_eligible: project.domestic_content_eligible,
        energy_community_bonus_eligible: project.energy_community_eligible,
        prevailing_wage_bonus_eligible: project.prevailing_wage_commitment,
      };

      const { error } = await supabase
        .from('project_incentive_matches')
        .upsert(match, { onConflict: 'project_id,incentive_program_id' });

      if (!error) matchCount++;
    }
  }

  console.log(`Created ${matchCount} incentive matches`);

  console.log('\n========================================');
  console.log('Demo Data Seeding Complete!');
  console.log('========================================');
  console.log('\nSummary:');
  console.log(`  Organizations: 1`);
  console.log(`  Projects: ${DEMO_PROJECTS.length}`);
  console.log(`  Incentive Programs: ${DEMO_INCENTIVE_PROGRAMS.length}`);
  console.log(`  Matches: ${matchCount}`);
}

// Parse CLI arguments
const clean = process.argv.includes('--clean');

seedDemoData(clean).catch(console.error);
