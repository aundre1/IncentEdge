/**
 * Incentive Programs Search API
 *
 * Full-featured search with filters for:
 * - Category (federal, state, local, utility)
 * - Geography (state, county, municipality)
 * - Program type, sector, technology, building type
 * - IRA features (direct pay, transferable)
 * - Sustainability tiers
 *
 * Includes fallback demo data when Supabase is unavailable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Fallback demo programs for when Supabase is unavailable
const FALLBACK_PROGRAMS = [
  {
    id: 'demo-1',
    external_id: 'IRA-45L',
    name: 'Section 45L New Energy Efficient Home Credit',
    short_name: '45L Tax Credit',
    description: 'Tax credit for builders of energy-efficient residential properties. Enhanced under IRA with tiered benefits based on efficiency levels.',
    summary: 'Up to $5,000 per dwelling unit for ENERGY STAR or Zero Energy Ready homes.',
    program_type: 'tax_credit',
    category: 'federal',
    subcategory: 'IRA',
    sector_types: ['residential', 'multifamily'],
    technology_types: ['energy_efficiency', 'building_envelope'],
    building_types: ['multifamily', 'single_family', 'townhouse'],
    jurisdiction_level: 'federal',
    state: null,
    counties: null,
    municipalities: null,
    utility_territories: null,
    incentive_type: 'tax_credit',
    amount_type: 'per_unit',
    amount_fixed: null,
    amount_percentage: null,
    amount_per_unit: 5000,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: 2500,
    amount_max: 5000,
    direct_pay_eligible: true,
    transferable: true,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: true,
    low_income_bonus: false,
    status: 'active',
    start_date: '2023-01-01',
    end_date: '2032-12-31',
    application_deadline: null,
    next_deadline: null,
    funding_remaining: null,
    administrator: 'Internal Revenue Service',
    administering_agency: 'IRS',
    source_url: 'https://www.irs.gov/credits-deductions/45l-new-energy-efficient-home-credit',
    application_url: null,
    application_complexity: 'medium',
    typical_processing_days: 30,
    stackable: true,
    eligibility_criteria: { min_efficiency: 'ENERGY STAR' },
    eligibility_summary: 'Available to builders of new energy-efficient homes meeting ENERGY STAR or Zero Energy Ready standards.',
    entity_types: ['corporation', 'partnership', 'llc'],
    tier_bonuses: { zero_energy: 5000, energy_star: 2500 },
    minimum_sustainability_tier: 'tier_1_efficient',
    last_verified_at: new Date().toISOString(),
    data_source: 'IRS',
    confidence_score: 0.98,
    popularity_score: 95,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    external_id: 'IRA-179D',
    name: 'Section 179D Commercial Buildings Energy Efficiency Deduction',
    short_name: '179D Deduction',
    description: 'Tax deduction for energy-efficient commercial building improvements. Significantly enhanced under IRA with higher deduction amounts.',
    summary: 'Up to $5/sq ft for buildings meeting efficiency targets, with bonus for prevailing wage.',
    program_type: 'tax_deduction',
    category: 'federal',
    subcategory: 'IRA',
    sector_types: ['commercial', 'industrial', 'multifamily'],
    technology_types: ['energy_efficiency', 'hvac', 'lighting', 'building_envelope'],
    building_types: ['office', 'retail', 'warehouse', 'multifamily'],
    jurisdiction_level: 'federal',
    state: null,
    counties: null,
    municipalities: null,
    utility_territories: null,
    incentive_type: 'tax_deduction',
    amount_type: 'per_sqft',
    amount_fixed: null,
    amount_percentage: null,
    amount_per_unit: null,
    amount_per_kw: null,
    amount_per_sqft: 5.00,
    amount_min: 0.50,
    amount_max: 5.00,
    direct_pay_eligible: true,
    transferable: false,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: true,
    low_income_bonus: false,
    status: 'active',
    start_date: '2023-01-01',
    end_date: '2032-12-31',
    application_deadline: null,
    next_deadline: null,
    funding_remaining: null,
    administrator: 'Internal Revenue Service',
    administering_agency: 'IRS',
    source_url: 'https://www.irs.gov/credits-deductions/energy-efficient-commercial-buildings-deduction',
    application_url: null,
    application_complexity: 'medium',
    typical_processing_days: 30,
    stackable: true,
    eligibility_criteria: { min_efficiency: '25% above ASHRAE' },
    eligibility_summary: 'Available to building owners and designers for improvements that reduce energy use by 25%+ vs ASHRAE 90.1.',
    entity_types: ['corporation', 'partnership', 'llc', 'individual'],
    tier_bonuses: { prevailing_wage: 5.00, standard: 1.00 },
    minimum_sustainability_tier: 'tier_1_efficient',
    last_verified_at: new Date().toISOString(),
    data_source: 'IRS',
    confidence_score: 0.98,
    popularity_score: 92,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    external_id: 'IRA-ITC',
    name: 'Investment Tax Credit for Solar and Storage',
    short_name: 'ITC Solar',
    description: 'Investment Tax Credit for solar energy systems and battery storage. Extended and expanded under IRA through 2032.',
    summary: '30% tax credit for solar + storage installations with bonus adders for domestic content, low-income, and energy communities.',
    program_type: 'tax_credit',
    category: 'federal',
    subcategory: 'IRA',
    sector_types: ['commercial', 'industrial', 'residential', 'multifamily'],
    technology_types: ['solar', 'battery_storage', 'renewable_energy'],
    building_types: ['all'],
    jurisdiction_level: 'federal',
    state: null,
    counties: null,
    municipalities: null,
    utility_territories: null,
    incentive_type: 'tax_credit',
    amount_type: 'percentage',
    amount_fixed: null,
    amount_percentage: 30,
    amount_per_unit: null,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: null,
    amount_max: null,
    direct_pay_eligible: true,
    transferable: true,
    domestic_content_bonus: true,
    energy_community_bonus: true,
    prevailing_wage_bonus: true,
    low_income_bonus: true,
    status: 'active',
    start_date: '2022-08-16',
    end_date: '2032-12-31',
    application_deadline: null,
    next_deadline: null,
    funding_remaining: null,
    administrator: 'Internal Revenue Service',
    administering_agency: 'IRS',
    source_url: 'https://www.irs.gov/credits-deductions/investment-tax-credit',
    application_url: null,
    application_complexity: 'medium',
    typical_processing_days: 30,
    stackable: true,
    eligibility_criteria: { min_capacity: '1 kW' },
    eligibility_summary: 'Available for solar, storage, and other clean energy property placed in service after August 2022.',
    entity_types: ['corporation', 'partnership', 'llc', 'tax_exempt'],
    tier_bonuses: { domestic_content: 10, energy_community: 10, low_income: 20 },
    minimum_sustainability_tier: null,
    last_verified_at: new Date().toISOString(),
    data_source: 'IRS',
    confidence_score: 0.99,
    popularity_score: 98,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    external_id: 'NY-NYSERDA-PON4000',
    name: 'NYSERDA Clean Energy Internship Program',
    short_name: 'PON 4000',
    description: 'Funding for clean energy internships to build workforce capacity in New York. Covers 50% of intern wages up to $20/hour.',
    summary: 'Up to $10,000 per intern for clean energy workforce development.',
    program_type: 'grant',
    category: 'state',
    subcategory: 'workforce',
    sector_types: ['clean_energy', 'all'],
    technology_types: ['all'],
    building_types: ['all'],
    jurisdiction_level: 'state',
    state: 'NY',
    counties: null,
    municipalities: null,
    utility_territories: null,
    incentive_type: 'wage_subsidy',
    amount_type: 'per_unit',
    amount_fixed: null,
    amount_percentage: 50,
    amount_per_unit: 10000,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: 5000,
    amount_max: 10000,
    direct_pay_eligible: false,
    transferable: false,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: false,
    low_income_bonus: false,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2026-12-31',
    application_deadline: '2025-12-31',
    next_deadline: '2025-03-31',
    funding_remaining: 2500000,
    administrator: 'NYSERDA',
    administering_agency: 'New York State Energy Research and Development Authority',
    source_url: 'https://www.nyserda.ny.gov/Funding-Opportunities/Current-Funding-Opportunities/PON-4000',
    application_url: 'https://portal.nyserda.ny.gov/',
    application_complexity: 'low',
    typical_processing_days: 14,
    stackable: true,
    eligibility_criteria: { location: 'NY', min_interns: 1 },
    eligibility_summary: 'Available to NY-based businesses hiring interns for clean energy roles.',
    entity_types: ['corporation', 'partnership', 'llc', 'nonprofit'],
    tier_bonuses: null,
    minimum_sustainability_tier: null,
    last_verified_at: new Date().toISOString(),
    data_source: 'NYSERDA',
    confidence_score: 0.95,
    popularity_score: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-5',
    external_id: 'NY-LIHTC',
    name: 'New York State Low-Income Housing Tax Credit',
    short_name: 'NY LIHTC',
    description: 'State tax credit for developers of affordable housing. Works in conjunction with federal LIHTC to increase project feasibility.',
    summary: 'Up to 9% annual credit for 10 years on qualified basis for new construction affordable housing.',
    program_type: 'tax_credit',
    category: 'state',
    subcategory: 'affordable_housing',
    sector_types: ['multifamily', 'residential'],
    technology_types: ['affordable_housing'],
    building_types: ['multifamily', 'senior_housing'],
    jurisdiction_level: 'state',
    state: 'NY',
    counties: null,
    municipalities: null,
    utility_territories: null,
    incentive_type: 'tax_credit',
    amount_type: 'percentage',
    amount_fixed: null,
    amount_percentage: 9,
    amount_per_unit: null,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: null,
    amount_max: null,
    direct_pay_eligible: false,
    transferable: true,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: false,
    low_income_bonus: true,
    status: 'active',
    start_date: '2000-01-01',
    end_date: null,
    application_deadline: '2025-02-28',
    next_deadline: '2025-02-28',
    funding_remaining: null,
    administrator: 'HCR',
    administering_agency: 'NY Homes and Community Renewal',
    source_url: 'https://hcr.ny.gov/lihtc',
    application_url: 'https://hcr.ny.gov/apply-lihtc',
    application_complexity: 'high',
    typical_processing_days: 120,
    stackable: true,
    eligibility_criteria: { min_affordable_units: 20, max_ami: 60 },
    eligibility_summary: 'Available to developers committing to income restrictions for at least 20% of units at 60% AMI or below.',
    entity_types: ['corporation', 'partnership', 'llc'],
    tier_bonuses: null,
    minimum_sustainability_tier: null,
    last_verified_at: new Date().toISOString(),
    data_source: 'HCR',
    confidence_score: 0.97,
    popularity_score: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    external_id: 'NY-485X',
    name: '485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    short_name: '485-x',
    description: 'Property tax exemption for new multifamily construction in NYC (5 boroughs). Signed April 2024, this program replaces the expired 421-a. Projects must include minimum 25% affordable units at specified AMI levels. Buildings with 100+ units must pay prevailing wages for construction workers and ongoing building services staff.',
    summary: 'Up to 40-year property tax exemption for NYC new construction — active, no sunset date. Supersedes expired 421-a.',
    program_type: 'tax_exemption',
    category: 'local',
    subcategory: 'affordable_housing',
    sector_types: ['multifamily', 'residential'],
    technology_types: ['affordable_housing'],
    building_types: ['multifamily', 'mixed_use'],
    jurisdiction_level: 'local',
    state: 'NY',
    counties: ['New York', 'Kings', 'Queens', 'Bronx', 'Richmond'],
    municipalities: ['New York City'],
    utility_territories: null,
    incentive_type: 'tax_exemption',
    amount_type: 'percentage',
    amount_fixed: null,
    amount_percentage: 100,
    amount_per_unit: null,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: null,
    amount_max: null,
    direct_pay_eligible: false,
    transferable: false,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: true,
    low_income_bonus: true,
    status: 'active',
    start_date: '2024-04-20',
    end_date: null,
    application_deadline: null,
    next_deadline: null,
    funding_remaining: null,
    administrator: 'NYC HPD',
    administering_agency: 'NYC Department of Housing Preservation and Development',
    source_url: 'https://www.nyc.gov/site/hpd/services-and-information/tax-incentives-485x.page',
    application_url: 'https://www.nyc.gov/site/hpd/services-and-information/485x.page',
    application_complexity: 'high',
    typical_processing_days: 180,
    stackable: true,
    eligibility_criteria: { location: 'NYC', min_affordable: 25, prevailing_wage_required_above_units: 100 },
    eligibility_summary: 'NYC developers building new multifamily with min. 25% affordable units. Projects 100+ units require prevailing wage for construction AND building services workers.',
    entity_types: ['corporation', 'partnership', 'llc'],
    tier_bonuses: null,
    minimum_sustainability_tier: null,
    last_verified_at: new Date().toISOString(),
    data_source: 'HPD',
    confidence_score: 0.96,
    popularity_score: 88,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    external_id: 'CONED-EE-MULTI',
    name: 'Con Edison Multifamily Energy Efficiency Program',
    short_name: 'ConEd MF EE',
    description: 'Rebates for energy efficiency upgrades in multifamily buildings in Con Edison territory.',
    summary: 'Up to $1,000/unit for comprehensive energy efficiency improvements.',
    program_type: 'rebate',
    category: 'utility',
    subcategory: 'energy_efficiency',
    sector_types: ['multifamily'],
    technology_types: ['energy_efficiency', 'hvac', 'lighting', 'appliances'],
    building_types: ['multifamily'],
    jurisdiction_level: 'utility',
    state: 'NY',
    counties: ['New York', 'Bronx', 'Westchester', 'Queens'],
    municipalities: null,
    utility_territories: ['Con Edison'],
    incentive_type: 'rebate',
    amount_type: 'per_unit',
    amount_fixed: null,
    amount_percentage: null,
    amount_per_unit: 1000,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: 250,
    amount_max: 1000,
    direct_pay_eligible: false,
    transferable: false,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: false,
    low_income_bonus: true,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2025-12-31',
    application_deadline: null,
    next_deadline: null,
    funding_remaining: 5000000,
    administrator: 'Con Edison',
    administering_agency: 'Consolidated Edison Company of New York',
    source_url: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-multifamily-customers',
    application_url: 'https://www.coned.com/multifamily',
    application_complexity: 'low',
    typical_processing_days: 30,
    stackable: true,
    eligibility_criteria: { utility: 'ConEd', min_units: 5 },
    eligibility_summary: 'Available to multifamily buildings with 5+ units in Con Edison electric service territory.',
    entity_types: ['corporation', 'partnership', 'llc', 'individual'],
    tier_bonuses: { low_income: 1.5 },
    minimum_sustainability_tier: null,
    last_verified_at: new Date().toISOString(),
    data_source: 'Con Edison',
    confidence_score: 0.94,
    popularity_score: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-8',
    external_id: 'WESTCHESTER-GREENPRINT',
    name: 'Westchester County Green Building Tax Credit',
    short_name: 'Greenprint',
    description: 'Local property tax abatement for LEED-certified buildings in Westchester County.',
    summary: 'Up to 10-year property tax abatement for LEED Gold or higher certified buildings.',
    program_type: 'tax_abatement',
    category: 'local',
    subcategory: 'green_building',
    sector_types: ['commercial', 'multifamily', 'mixed_use'],
    technology_types: ['green_building', 'energy_efficiency', 'sustainability'],
    building_types: ['office', 'multifamily', 'mixed_use'],
    jurisdiction_level: 'local',
    state: 'NY',
    counties: ['Westchester'],
    municipalities: null,
    utility_territories: null,
    incentive_type: 'tax_abatement',
    amount_type: 'percentage',
    amount_fixed: null,
    amount_percentage: 50,
    amount_per_unit: null,
    amount_per_kw: null,
    amount_per_sqft: null,
    amount_min: null,
    amount_max: null,
    direct_pay_eligible: false,
    transferable: false,
    domestic_content_bonus: false,
    energy_community_bonus: false,
    prevailing_wage_bonus: false,
    low_income_bonus: false,
    status: 'active',
    start_date: '2020-01-01',
    end_date: null,
    application_deadline: null,
    next_deadline: null,
    funding_remaining: null,
    administrator: 'Westchester IDA',
    administering_agency: 'Westchester County Industrial Development Agency',
    source_url: 'https://westchestergov.com/ida',
    application_url: 'https://westchestergov.com/ida/apply',
    application_complexity: 'medium',
    typical_processing_days: 60,
    stackable: true,
    eligibility_criteria: { certification: 'LEED Gold+', location: 'Westchester' },
    eligibility_summary: 'Available for new construction or major renovation achieving LEED Gold or higher certification.',
    entity_types: ['corporation', 'partnership', 'llc'],
    tier_bonuses: null,
    minimum_sustainability_tier: 'tier_2_high_performance',
    last_verified_at: new Date().toISOString(),
    data_source: 'Westchester IDA',
    confidence_score: 0.90,
    popularity_score: 65,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Query parameter validation schema
const querySchema = z.object({
  // Filtering
  category: z.enum(['federal', 'state', 'local', 'utility']).optional(),
  state: z.string().length(2).optional(),
  county: z.string().optional(),
  municipality: z.string().optional(),
  program_type: z.string().optional(),
  sector: z.string().optional(),
  technology: z.string().optional(),
  building_type: z.string().optional(),
  status: z.enum(['active', 'inactive', 'expired', 'pending']).optional(),

  // IRA-specific filters
  direct_pay_eligible: z.string().transform(v => v === 'true').optional(),
  transferable: z.string().transform(v => v === 'true').optional(),

  // Sustainability tier filters
  min_tier: z.enum(['tier_1_efficient', 'tier_2_high_performance', 'tier_3_net_zero', 'tier_3_triple_net_zero']).optional(),

  // Search
  search: z.string().optional(),

  // Pagination
  page: z.string().transform(v => parseInt(v) || 1).optional(),
  limit: z.string().transform(v => Math.min(parseInt(v) || 20, 100)).optional(),

  // Sorting
  sort_by: z.enum(['name', 'created_at', 'updated_at', 'amount_max', 'application_deadline', 'popularity_score']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Validate parameters
    const validationResult = querySchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      category,
      state,
      county,
      municipality,
      program_type,
      sector,
      technology,
      building_type,
      status = 'active',
      direct_pay_eligible,
      transferable,
      min_tier,
      search,
      page = 1,
      limit = 20,
      sort_by = 'popularity_score',
      sort_order = 'desc',
    } = validationResult.data;

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('incentive_programs')
      .select(`
        id,
        external_id,
        name,
        short_name,
        description,
        summary,
        program_type,
        category,
        subcategory,
        sector_types,
        technology_types,
        building_types,
        jurisdiction_level,
        state,
        counties,
        municipalities,
        utility_territories,
        incentive_type,
        amount_type,
        amount_fixed,
        amount_percentage,
        amount_per_unit,
        amount_per_kw,
        amount_per_sqft,
        amount_min,
        amount_max,
        direct_pay_eligible,
        transferable,
        domestic_content_bonus,
        energy_community_bonus,
        prevailing_wage_bonus,
        low_income_bonus,
        status,
        start_date,
        end_date,
        application_deadline,
        next_deadline,
        funding_remaining,
        administrator,
        administering_agency,
        source_url,
        application_url,
        application_complexity,
        typical_processing_days,
        stackable,
        eligibility_criteria,
        eligibility_summary,
        entity_types,
        tier_bonuses,
        minimum_sustainability_tier,
        last_verified_at,
        data_source,
        confidence_score,
        popularity_score,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (state) {
      // Match programs that are either federal (no state) or match the specified state
      query = query.or(`state.eq.${state},state.is.null`);
    }

    if (county) {
      query = query.contains('counties', [county]);
    }

    if (municipality) {
      query = query.contains('municipalities', [municipality]);
    }

    if (program_type) {
      query = query.eq('program_type', program_type);
    }

    if (sector) {
      query = query.contains('sector_types', [sector]);
    }

    if (technology) {
      query = query.contains('technology_types', [technology]);
    }

    if (building_type) {
      query = query.contains('building_types', [building_type]);
    }

    if (direct_pay_eligible !== undefined) {
      query = query.eq('direct_pay_eligible', direct_pay_eligible);
    }

    if (transferable !== undefined) {
      query = query.eq('transferable', transferable);
    }

    if (min_tier) {
      // Filter programs that support the specified tier or have no tier requirement
      query = query.or(`minimum_sustainability_tier.is.null,minimum_sustainability_tier.lte.${min_tier}`);
    }

    // Apply search
    if (search && search.trim()) {
      const searchTerm = search.trim();
      query = query.or(
        `name.ilike.%${searchTerm}%,` +
        `short_name.ilike.%${searchTerm}%,` +
        `description.ilike.%${searchTerm}%,` +
        `summary.ilike.%${searchTerm}%,` +
        `administrator.ilike.%${searchTerm}%,` +
        `administering_agency.ilike.%${searchTerm}%`
      );
    }

    // Apply sorting
    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending, nullsFirst: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: programs, error, count } = await query;

    if (error) {
      console.error('Error fetching programs:', error);
      // Throw to trigger fallback
      throw new Error(error.message);
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: programs,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters_applied: {
        category,
        state,
        county,
        municipality,
        program_type,
        sector,
        technology,
        building_type,
        status,
        direct_pay_eligible,
        transferable,
        min_tier,
        search: search || null,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/programs:', error);

    // Return filtered fallback data when Supabase is unavailable
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const validationResult = querySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      category,
      state,
      sector,
      building_type,
      search,
      page = 1,
      limit = 20,
    } = validationResult.data;

    // Filter fallback programs
    let filteredPrograms = [...FALLBACK_PROGRAMS];

    if (category) {
      filteredPrograms = filteredPrograms.filter((p) => p.category === category);
    }

    if (state) {
      filteredPrograms = filteredPrograms.filter(
        (p) => p.state === state || p.state === null // Include federal
      );
    }

    if (sector) {
      filteredPrograms = filteredPrograms.filter(
        (p) => p.sector_types?.includes(sector) || p.sector_types?.includes('all')
      );
    }

    if (building_type) {
      filteredPrograms = filteredPrograms.filter(
        (p) => p.building_types?.includes(building_type) || p.building_types?.includes('all')
      );
    }

    if (search && search.trim()) {
      const term = search.toLowerCase();
      filteredPrograms = filteredPrograms.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.short_name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.summary.toLowerCase().includes(term)
      );
    }

    // Paginate
    const offset = (page - 1) * limit;
    const paginatedPrograms = filteredPrograms.slice(offset, offset + limit);
    const totalPages = Math.ceil(filteredPrograms.length / limit);

    return NextResponse.json(
      {
        data: paginatedPrograms,
        meta: {
          page,
          limit,
          total: filteredPrograms.length,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          fallback: true,
        },
        filters_applied: {
          category,
          state,
          sector,
          building_type,
          search: search || null,
        },
      },
      {
        status: 200,
        headers: {
          'X-Fallback': 'true',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}

// GET /api/programs/stats - Get aggregated statistics
export async function HEAD(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get counts by category
    const { data: categoryStats, error: categoryError } = await supabase
      .from('incentive_programs')
      .select('category')
      .eq('status', 'active');

    if (categoryError) {
      return new NextResponse(null, { status: 500 });
    }

    // Count by category
    const categoryCounts = categoryStats?.reduce((acc, prog) => {
      acc[prog.category] = (acc[prog.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Return stats in headers
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Total-Programs': String(categoryStats?.length || 0),
        'X-Federal-Count': String(categoryCounts['federal'] || 0),
        'X-State-Count': String(categoryCounts['state'] || 0),
        'X-Local-Count': String(categoryCounts['local'] || 0),
        'X-Utility-Count': String(categoryCounts['utility'] || 0),
      },
    });
  } catch (error) {
    console.error('Error in HEAD /api/programs:', error);
    return new NextResponse(null, { status: 500 });
  }
}
