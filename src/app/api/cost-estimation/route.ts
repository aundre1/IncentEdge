import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  SustainabilityTier,
  SUSTAINABILITY_TIERS,
  TierComparisonResult,
  CostEstimationResult
} from '@/types';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const costEstimationSchema = z.object({
  building_type: z.string().min(1),
  total_sqft: z.number().positive(),
  state: z.string().length(2),
  zip_code: z.string().min(5),
  total_units: z.number().optional(),
  stories: z.number().optional(),
  energy_systems: z.array(z.object({
    system_type: z.string(),
    size: z.number().positive()
  })).optional(),
  domestic_content_eligible: z.boolean().optional(),
  prevailing_wage_commitment: z.boolean().optional(),
});

// ============================================================================
// FALLBACK DATA (when database is empty)
// ============================================================================
const FALLBACK_BASE_COSTS: Record<string, number> = {
  multifamily: 295,
  mixed_use: 335,
  commercial: 375,
  industrial: 170,
  solar: 2.5, // per watt
  retail: 225,
  hospitality: 350,
  healthcare: 425,
};

const FALLBACK_REGIONAL_MULTIPLIERS: Record<string, number> = {
  NY: 1.35,
  CA: 1.25,
  TX: 0.92,
  FL: 0.95,
  IL: 1.08,
  PA: 1.05,
  DEFAULT: 1.0,
};

const FALLBACK_TIER_PREMIUMS: Record<SustainabilityTier, { psf: number; pct: number }> = {
  tier_1_efficient: { psf: 8, pct: 0.028 },
  tier_2_high_performance: { psf: 22, pct: 0.075 },
  tier_3_net_zero: { psf: 38, pct: 0.125 },
  tier_3_triple_net_zero: { psf: 52, pct: 0.175 },
};

const TIER_INCENTIVE_MULTIPLIERS: Record<SustainabilityTier, number> = {
  tier_1_efficient: 1.0,
  tier_2_high_performance: 1.15,
  tier_3_net_zero: 1.30,
  tier_3_triple_net_zero: 1.50,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapBuildingType(buildingType: string): string {
  const mapping: Record<string, string> = {
    'multifamily': 'multifamily',
    'mixed-use': 'mixed_use',
    'commercial': 'commercial',
    'industrial': 'industrial',
    'solar': 'solar',
    'storage': 'industrial',
    'hospitality': 'commercial',
    'healthcare': 'commercial',
    'retail': 'commercial',
  };
  return mapping[buildingType] || 'commercial';
}

async function getBaseCost(
  supabase: any,
  buildingType: string
): Promise<number> {
  const mappedType = mapBuildingType(buildingType);

  // Try database first
  const { data } = await supabase
    .from('rs_means_cost_data')
    .select('base_cost_psf')
    .eq('building_type', mappedType)
    .eq('construction_quality', 'average')
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();

  if (data?.base_cost_psf) {
    return data.base_cost_psf;
  }

  // Fallback to static data
  return FALLBACK_BASE_COSTS[mappedType] || FALLBACK_BASE_COSTS.commercial;
}

async function getRegionalMultiplier(
  supabase: any,
  state: string,
  zipCode: string
): Promise<number> {
  const zipPrefix = zipCode.substring(0, 3);

  // Try database first
  const { data } = await supabase
    .from('rs_means_regional_multipliers')
    .select('total_multiplier')
    .eq('state', state)
    .or(`zip_code_prefix.eq.${zipPrefix},zip_code_prefix.is.null`)
    .order('zip_code_prefix', { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (data?.total_multiplier) {
    return data.total_multiplier;
  }

  // Fallback to static data
  return FALLBACK_REGIONAL_MULTIPLIERS[state] || FALLBACK_REGIONAL_MULTIPLIERS.DEFAULT;
}

async function getSustainabilityPremiums(
  supabase: any,
  buildingType: string
): Promise<Record<SustainabilityTier, number>> {
  const mappedType = mapBuildingType(buildingType);

  // Try database first
  const { data } = await supabase
    .from('sustainability_cost_premiums')
    .select('sustainability_tier, premium_psf')
    .eq('building_type', mappedType);

  if (data && data.length > 0) {
    const premiums: Record<string, number> = {};
    data.forEach((row: { sustainability_tier: string; premium_psf: number }) => {
      premiums[row.sustainability_tier] = row.premium_psf;
    });
    return premiums as Record<SustainabilityTier, number>;
  }

  // Fallback to static data
  return {
    tier_1_efficient: FALLBACK_TIER_PREMIUMS.tier_1_efficient.psf,
    tier_2_high_performance: FALLBACK_TIER_PREMIUMS.tier_2_high_performance.psf,
    tier_3_net_zero: FALLBACK_TIER_PREMIUMS.tier_3_net_zero.psf,
    tier_3_triple_net_zero: FALLBACK_TIER_PREMIUMS.tier_3_triple_net_zero.psf,
  };
}

async function calculateEnergySystemsCost(
  supabase: any,
  systems: { system_type: string; size: number }[]
): Promise<{ total: number; breakdown: { type: string; size: number; cost: number }[] }> {
  if (!systems || systems.length === 0) {
    return { total: 0, breakdown: [] };
  }

  const breakdown: { type: string; size: number; cost: number }[] = [];
  let total = 0;

  for (const system of systems) {
    // Try to get cost from database
    const { data } = await supabase
      .from('energy_system_costs')
      .select('total_installed_cost_per_unit')
      .eq('system_type', system.system_type)
      .limit(1)
      .single();

    // Fallback costs per unit
    const fallbackCosts: Record<string, number> = {
      solar: 2500, // $/kW
      battery: 450, // $/kWh
      heat_pump: 6500, // $/ton
      geothermal: 18000, // $/ton
      ev_charging: 6000, // $/port
    };

    const costPerUnit = data?.total_installed_cost_per_unit || fallbackCosts[system.system_type] || 5000;
    const systemCost = costPerUnit * system.size;

    breakdown.push({
      type: system.system_type,
      size: system.size,
      cost: systemCost,
    });

    total += systemCost;
  }

  return { total, breakdown };
}

function estimateIncentivesByTier(
  baseCost: number,
  tier: SustainabilityTier,
  state: string,
  domesticContent: boolean,
  prevailingWage: boolean
): { total: number; breakdown: { federal: number; state: number; local: number; utility: number } } {
  // Base incentive rate varies by tier
  const tierMultiplier = TIER_INCENTIVE_MULTIPLIERS[tier];

  // Base incentive percentages (these are simplified estimates)
  // In production, this would query the eligibility engine
  let federalPct = 0.12 * tierMultiplier; // ~12% base federal (ITC, 45L, etc.)
  let statePct = 0.05 * tierMultiplier;   // ~5% state (NYSERDA, etc.)
  let localPct = 0.08;                      // ~8% local (IDA PILOT, etc.)
  let utilityPct = 0.02 * tierMultiplier;  // ~2% utility

  // IRA bonus adders
  if (domesticContent) {
    federalPct += 0.10; // +10% domestic content bonus
  }
  if (prevailingWage) {
    federalPct += 0.05; // Additional bonus for prevailing wage
  }

  // Higher tiers unlock more programs
  if (tier === 'tier_3_net_zero' || tier === 'tier_3_triple_net_zero') {
    statePct += 0.03; // Additional NYSERDA bonuses
    federalPct += 0.05; // Additional clean energy credits
  }

  const federal = baseCost * federalPct;
  const stateInc = baseCost * statePct;
  const local = baseCost * localPct;
  const utility = baseCost * utilityPct;

  return {
    total: federal + stateInc + local + utility,
    breakdown: {
      federal,
      state: stateInc,
      local,
      utility,
    },
  };
}

// ============================================================================
// API HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const validationResult = costEstimationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const input = validationResult.data;

    // Get cost data
    const baseCostPsf = await getBaseCost(supabase, input.building_type);
    const regionalMultiplier = await getRegionalMultiplier(supabase, input.state, input.zip_code);
    const tierPremiums = await getSustainabilityPremiums(supabase, input.building_type);

    // Calculate base costs
    const adjustedBasePsf = baseCostPsf * regionalMultiplier;
    const baseTotalCost = adjustedBasePsf * input.total_sqft;

    // Calculate energy systems cost (if applicable)
    const energySystems = await calculateEnergySystemsCost(supabase, input.energy_systems || []);

    // Calculate tier comparisons
    const tiers: SustainabilityTier[] = [
      'tier_1_efficient',
      'tier_2_high_performance',
      'tier_3_net_zero',
      'tier_3_triple_net_zero',
    ];

    const tierComparisons: TierComparisonResult[] = [];
    let tier1NetCost = 0;
    let recommendedTier: SustainabilityTier = 'tier_1_efficient';
    let lowestNetCost = Infinity;

    for (const tier of tiers) {
      const tierInfo = SUSTAINABILITY_TIERS[tier];
      const premium = tierPremiums[tier] * input.total_sqft;
      const constructionCost = baseTotalCost + premium;
      const totalCost = constructionCost + energySystems.total;

      const incentives = estimateIncentivesByTier(
        totalCost,
        tier,
        input.state,
        input.domestic_content_eligible || false,
        input.prevailing_wage_commitment || false
      );

      const netCost = totalCost - incentives.total;

      // Track Tier 1 for delta calculation
      if (tier === 'tier_1_efficient') {
        tier1NetCost = netCost;
      }

      // Track lowest net cost for recommendation
      if (netCost < lowestNetCost) {
        lowestNetCost = netCost;
        recommendedTier = tier;
      }

      tierComparisons.push({
        tier,
        tierInfo,
        constructionCost,
        sustainabilityPremium: premium,
        totalCost,
        availableIncentives: incentives.total,
        netCost,
        netCostDelta: netCost - tier1NetCost,
        subsidyRate: (incentives.total / totalCost) * 100,
        isRecommended: false, // Will be set after loop
        incentiveBreakdown: incentives.breakdown,
      });
    }

    // Mark recommended tier
    tierComparisons.forEach((tc) => {
      tc.isRecommended = tc.tier === recommendedTier;
    });

    // Build recommendation
    const recommendedComparison = tierComparisons.find((tc) => tc.tier === recommendedTier)!;
    const tier1Comparison = tierComparisons.find((tc) => tc.tier === 'tier_1_efficient')!;
    const savings = tier1Comparison.netCost - recommendedComparison.netCost;

    let recommendationReason = '';
    if (recommendedTier === 'tier_1_efficient') {
      recommendationReason = 'Tier 1 provides the lowest net cost for this project.';
    } else {
      recommendationReason = `${SUSTAINABILITY_TIERS[recommendedTier].label} saves $${savings.toLocaleString()} compared to Tier 1 after incentives. Higher sustainability tier unlocks ${Math.round(recommendedComparison.subsidyRate)}% subsidy rate.`;
    }

    const result: CostEstimationResult = {
      input,
      baseCostPsf,
      regionalMultiplier,
      baseTotalCost,
      tierComparisons,
      recommendedTier,
      recommendation: {
        tier: recommendedTier,
        reason: recommendationReason,
        savings: Math.max(0, savings),
      },
      energySystemsCost: energySystems.total > 0 ? energySystems.total : null,
      calculatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in POST /api/cost-estimation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// GET: Retrieve cost data for UI
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type') || 'all';

    const response: Record<string, unknown> = {};

    if (dataType === 'all' || dataType === 'building_types') {
      const { data: buildingTypes } = await supabase
        .from('rs_means_cost_data')
        .select('building_type, building_subtype, base_cost_psf')
        .eq('construction_quality', 'average')
        .order('building_type');

      response.buildingTypes = buildingTypes || [];
    }

    if (dataType === 'all' || dataType === 'regions') {
      const { data: regions } = await supabase
        .from('rs_means_regional_multipliers')
        .select('state, city, metro_area, total_multiplier')
        .order('state');

      response.regions = regions || [];
    }

    if (dataType === 'all' || dataType === 'energy_systems') {
      const { data: energySystems } = await supabase
        .from('energy_system_costs')
        .select('system_type, system_subtype, unit_of_measure, total_installed_cost_per_unit, itc_eligible')
        .order('system_type');

      response.energySystems = energySystems || [];
    }

    if (dataType === 'all' || dataType === 'tiers') {
      response.sustainabilityTiers = Object.values(SUSTAINABILITY_TIERS);
    }

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error('Error in GET /api/cost-estimation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
