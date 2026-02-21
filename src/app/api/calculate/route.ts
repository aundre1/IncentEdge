/**
 * Incentive Calculator API
 *
 * Calculate potential incentives based on project parameters.
 * Returns:
 * - Matched incentive programs
 * - Estimated values
 * - ROI impact analysis
 *
 * POST /api/calculate
 * Body: { project details }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types for project input
interface ProjectInput {
  // Basic project info
  name?: string;
  state: string;
  county?: string;
  municipality?: string;

  // Building details
  buildingType: 'multifamily' | 'commercial' | 'mixed_use' | 'industrial' | 'residential';
  totalUnits?: number;
  totalSqft?: number;
  affordableUnits?: number;
  affordablePercentage?: number;

  // Financial details
  totalDevelopmentCost: number;
  equityInvestment: number;
  projectedNOI?: number;
  holdPeriod?: number;

  // Sustainability
  sustainabilityTier?: 'tier_1_efficient' | 'tier_2_high_performance' | 'tier_3_net_zero';
  solarCapacityKw?: number;
  storageCapacityKwh?: number;

  // Entity type
  entityType?: 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'tax_exempt';
}

// Fallback incentive calculations
const FALLBACK_INCENTIVES = {
  federal: [
    {
      id: 'calc-45L',
      name: 'Section 45L Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: 'Energy efficient home credit',
      estimatedValue: 0,
      perUnit: 2500, // Base amount
      maxPerUnit: 5000, // Zero energy ready
      directPayEligible: true,
      confidence: 0.95,
    },
    {
      id: 'calc-179D',
      name: 'Section 179D Deduction',
      type: 'tax_deduction',
      category: 'federal',
      description: 'Commercial building efficiency deduction',
      estimatedValue: 0,
      perSqft: 1.0, // Base amount
      maxPerSqft: 5.0, // With prevailing wage
      directPayEligible: true,
      confidence: 0.92,
    },
    {
      id: 'calc-ITC',
      name: 'Solar Investment Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: '30% ITC for solar + storage',
      estimatedValue: 0,
      percentage: 30,
      bonuses: { domesticContent: 10, energyCommunity: 10, lowIncome: 20 },
      directPayEligible: true,
      confidence: 0.98,
    },
    {
      id: 'calc-LIHTC',
      name: 'LIHTC 4% Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: 'Low-income housing tax credit',
      estimatedValue: 0,
      percentage: 4, // As-of-right rate
      creditPeriod: 10,
      confidence: 0.90,
    },
  ],
  state: [
    {
      id: 'calc-NY-LIHTC',
      name: 'NY State LIHTC',
      type: 'tax_credit',
      category: 'state',
      description: 'State supplement to federal LIHTC',
      estimatedValue: 0,
      matchPercentage: 100, // Match federal
      states: ['NY'],
      confidence: 0.88,
    },
    {
      id: 'calc-NYSERDA',
      name: 'NYSERDA New Construction',
      type: 'rebate',
      category: 'state',
      description: 'Clean energy incentive',
      estimatedValue: 0,
      perUnit: 1500,
      states: ['NY'],
      confidence: 0.85,
    },
  ],
  local: [
    {
      id: 'calc-421a',
      name: '421-a Tax Exemption',
      type: 'tax_exemption',
      category: 'local',
      description: 'NYC property tax exemption',
      estimatedValue: 0,
      years: 35,
      municipalities: ['New York City'],
      confidence: 0.82,
    },
    {
      id: 'calc-PILOT',
      name: 'IDA PILOT',
      type: 'tax_abatement',
      category: 'local',
      description: 'Payment in lieu of taxes',
      estimatedValue: 0,
      years: 15,
      confidence: 0.75,
    },
  ],
  utility: [
    {
      id: 'calc-ConEd',
      name: 'Con Edison Rebates',
      type: 'rebate',
      category: 'utility',
      description: 'Energy efficiency rebates',
      estimatedValue: 0,
      perUnit: 500,
      territories: ['Con Edison'],
      confidence: 0.80,
    },
  ],
};

// Calculate incentive values based on project parameters
function calculateIncentiveValues(project: ProjectInput) {
  const results: {
    incentives: Array<{
      id: string;
      name: string;
      type: string;
      category: string;
      description: string;
      estimatedValue: number;
      confidence: number;
      eligible: boolean;
      notes: string[];
    }>;
    totals: {
      federal: number;
      state: number;
      local: number;
      utility: number;
      total: number;
    };
    roiImpact: {
      baseIRR: number;
      enhancedIRR: number;
      irrLift: number;
      equityMultipleLift: number;
    };
  } = {
    incentives: [],
    totals: { federal: 0, state: 0, local: 0, utility: 0, total: 0 },
    roiImpact: { baseIRR: 0, enhancedIRR: 0, irrLift: 0, equityMultipleLift: 0 },
  };

  const {
    state,
    buildingType,
    totalUnits = 0,
    totalSqft = 0,
    affordableUnits = 0,
    affordablePercentage = 0,
    totalDevelopmentCost,
    equityInvestment,
    sustainabilityTier,
    solarCapacityKw = 0,
  } = project;

  // Calculate 45L
  if (
    totalUnits > 0 &&
    ['multifamily', 'residential', 'mixed_use'].includes(buildingType)
  ) {
    const tierMultiplier =
      sustainabilityTier === 'tier_3_net_zero'
        ? 2
        : sustainabilityTier === 'tier_2_high_performance'
          ? 1.5
          : 1;
    const perUnitValue = 2500 * tierMultiplier;
    const value45L = totalUnits * perUnitValue;

    results.incentives.push({
      id: 'calc-45L',
      name: 'Section 45L Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: `$${perUnitValue.toLocaleString()}/unit for ${totalUnits} units`,
      estimatedValue: value45L,
      confidence: 0.95,
      eligible: true,
      notes: [
        sustainabilityTier === 'tier_3_net_zero'
          ? 'Zero Energy Ready bonus applied'
          : 'ENERGY STAR certification required',
      ],
    });
    results.totals.federal += value45L;
  }

  // Calculate 179D
  if (
    totalSqft > 0 &&
    ['commercial', 'mixed_use', 'industrial', 'multifamily'].includes(buildingType)
  ) {
    const perSqftValue =
      sustainabilityTier === 'tier_3_net_zero'
        ? 5.0
        : sustainabilityTier === 'tier_2_high_performance'
          ? 2.5
          : 1.0;
    const value179D = totalSqft * perSqftValue;

    results.incentives.push({
      id: 'calc-179D',
      name: 'Section 179D Deduction',
      type: 'tax_deduction',
      category: 'federal',
      description: `$${perSqftValue.toFixed(2)}/sqft for ${totalSqft.toLocaleString()} sqft`,
      estimatedValue: value179D,
      confidence: 0.92,
      eligible: true,
      notes: ['Prevailing wage requirement for full deduction'],
    });
    results.totals.federal += value179D;
  }

  // Calculate Solar ITC
  if (solarCapacityKw > 0) {
    const solarCost = solarCapacityKw * 2500; // ~$2.50/W installed
    const baseITC = solarCost * 0.3;
    const bonuses = solarCost * 0.1; // Assume domestic content bonus

    results.incentives.push({
      id: 'calc-ITC',
      name: 'Solar Investment Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: `30% ITC on ${solarCapacityKw} kW system`,
      estimatedValue: baseITC + bonuses,
      confidence: 0.98,
      eligible: true,
      notes: [
        'Direct pay eligible for tax-exempt entities',
        '+10% domestic content bonus assumed',
      ],
    });
    results.totals.federal += baseITC + bonuses;
  }

  // Calculate LIHTC (if affordable)
  const effectiveAffordable = affordablePercentage || (affordableUnits / totalUnits) * 100;
  if (effectiveAffordable >= 20) {
    const qualifiedBasis = totalDevelopmentCost * 0.7; // Simplified
    const annualCredit = qualifiedBasis * 0.04;
    const totalLIHTC = annualCredit * 10;

    results.incentives.push({
      id: 'calc-LIHTC',
      name: 'LIHTC 4% Tax Credit',
      type: 'tax_credit',
      category: 'federal',
      description: `${effectiveAffordable.toFixed(0)}% affordable qualifying`,
      estimatedValue: totalLIHTC,
      confidence: 0.90,
      eligible: true,
      notes: [
        '10-year credit period',
        'Requires tax-exempt bond financing',
        'Syndicator pricing ~$0.92/credit',
      ],
    });
    results.totals.federal += totalLIHTC;
  }

  // State incentives (NY-specific)
  if (state === 'NY') {
    // NYSERDA
    if (totalUnits > 0) {
      const nyserdaValue = totalUnits * 1500;
      results.incentives.push({
        id: 'calc-NYSERDA',
        name: 'NYSERDA New Construction',
        type: 'rebate',
        category: 'state',
        description: `Clean energy rebate for ${totalUnits} units`,
        estimatedValue: nyserdaValue,
        confidence: 0.85,
        eligible: true,
        notes: ['Pre-construction enrollment required'],
      });
      results.totals.state += nyserdaValue;
    }

    // NY State LIHTC supplement
    if (effectiveAffordable >= 20) {
      const stateLIHTC = results.totals.federal * 0.15; // ~15% state supplement
      results.incentives.push({
        id: 'calc-NY-LIHTC',
        name: 'NY State LIHTC',
        type: 'tax_credit',
        category: 'state',
        description: 'State supplement to federal LIHTC',
        estimatedValue: stateLIHTC,
        confidence: 0.88,
        eligible: true,
        notes: ['Awarded through HCR unified funding'],
      });
      results.totals.state += stateLIHTC;
    }
  }

  // Local incentives
  if (state === 'NY' && project.municipality === 'New York City') {
    // 421-a
    const estimatedTaxSavings = totalDevelopmentCost * 0.015 * 35; // Rough estimate
    results.incentives.push({
      id: 'calc-421a',
      name: '421-a Tax Exemption',
      type: 'tax_exemption',
      category: 'local',
      description: '35-year property tax exemption',
      estimatedValue: estimatedTaxSavings,
      confidence: 0.82,
      eligible: effectiveAffordable >= 25,
      notes: effectiveAffordable >= 25
        ? ['Affordable requirement met']
        : ['Requires 25% affordable units'],
    });
    if (effectiveAffordable >= 25) results.totals.local += estimatedTaxSavings;
  }

  // IDA PILOT (Westchester example)
  if (state === 'NY' && project.county === 'Westchester') {
    const pilotSavings = totalDevelopmentCost * 0.01 * 15;
    results.incentives.push({
      id: 'calc-PILOT',
      name: 'Westchester IDA PILOT',
      type: 'tax_abatement',
      category: 'local',
      description: '15-year PILOT agreement',
      estimatedValue: pilotSavings,
      confidence: 0.75,
      eligible: true,
      notes: ['Subject to IDA approval', 'Job creation requirements apply'],
    });
    results.totals.local += pilotSavings;
  }

  // Utility rebates
  if (state === 'NY' && totalUnits > 0) {
    const utilityRebate = totalUnits * 500;
    results.incentives.push({
      id: 'calc-ConEd',
      name: 'Utility Energy Efficiency',
      type: 'rebate',
      category: 'utility',
      description: 'Energy efficiency rebates',
      estimatedValue: utilityRebate,
      confidence: 0.80,
      eligible: true,
      notes: ['Varies by utility territory'],
    });
    results.totals.utility += utilityRebate;
  }

  // Calculate totals
  results.totals.total =
    results.totals.federal +
    results.totals.state +
    results.totals.local +
    results.totals.utility;

  // Calculate ROI impact
  const projectedNOI = project.projectedNOI || totalDevelopmentCost * 0.065;
  const holdPeriod = project.holdPeriod || 5;
  const exitCapRate = 0.055;
  const debtRate = 0.065;
  const debtAmount = totalDevelopmentCost - equityInvestment;

  // Base case (no incentives)
  const baseExitValue = (projectedNOI * Math.pow(1.025, holdPeriod)) / exitCapRate;
  const baseTotalReturn = projectedNOI * holdPeriod + baseExitValue - debtAmount;
  const baseIRR = ((baseTotalReturn / equityInvestment) ** (1 / holdPeriod) - 1) * 100;

  // Enhanced case (with incentives)
  const effectiveEquity = Math.max(equityInvestment - results.totals.total * 0.5, equityInvestment * 0.1);
  const enhancedTotalReturn = baseTotalReturn + results.totals.total * 0.5;
  const enhancedIRR = ((enhancedTotalReturn / effectiveEquity) ** (1 / holdPeriod) - 1) * 100;

  results.roiImpact = {
    baseIRR: Math.min(baseIRR, 50),
    enhancedIRR: Math.min(enhancedIRR, 80),
    irrLift: Math.min(enhancedIRR - baseIRR, 30),
    equityMultipleLift: (enhancedTotalReturn / effectiveEquity) - (baseTotalReturn / equityInvestment),
  };

  return results;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.state || !body.totalDevelopmentCost || !body.equityInvestment) {
      return NextResponse.json(
        { error: 'Missing required fields: state, totalDevelopmentCost, equityInvestment' },
        { status: 400 }
      );
    }

    // Calculate incentives
    const results = calculateIncentiveValues(body as ProjectInput);

    return NextResponse.json(
      {
        project: {
          state: body.state,
          buildingType: body.buildingType || 'multifamily',
          totalUnits: body.totalUnits || 0,
          totalSqft: body.totalSqft || 0,
          totalDevelopmentCost: body.totalDevelopmentCost,
          equityInvestment: body.equityInvestment,
        },
        results,
        meta: {
          calculatedAt: new Date().toISOString(),
          responseTime: `${Date.now() - startTime}ms`,
          version: '1.0.0',
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
    console.error('Error in POST /api/calculate:', error);
    return NextResponse.json(
      { error: 'Calculation failed', details: String(error) },
      { status: 500 }
    );
  }
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
