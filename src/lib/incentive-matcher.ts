// ============================================================================
// INCENTEDGE V41 - INCENTIVE MATCHING ALGORITHM
// Priority: Category → Location → Eligibility
// ============================================================================

import type { Project, IncentiveProgram, IncentiveCategory } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface MatchedIncentive {
  incentive: IncentiveProgram;
  matchScore: number;
  categoryScore: number;
  locationScore: number;
  eligibilityScore: number;
  estimatedValue: number;
  matchReasons: string[];
  eligibilityDetails: EligibilityDetail[];
  tier: 'high' | 'medium' | 'low' | 'potential';
}

export interface EligibilityDetail {
  criterion: string;
  met: boolean;
  description: string;
  weight: number;
}

export interface MatchingResult {
  project: Project;
  matches: MatchedIncentive[];
  byCategory: Record<IncentiveCategory, MatchedIncentive[]>;
  totalPotentialValue: number;
  topMatches: MatchedIncentive[];
  greenIncentives: MatchedIncentive[];
  iraIncentives: MatchedIncentive[];
  summary: MatchingSummary;
}

export interface MatchingSummary {
  totalMatched: number;
  highTier: number;
  mediumTier: number;
  lowTier: number;
  potentialTier: number;
  federalCount: number;
  stateCount: number;
  localCount: number;
  utilityCount: number;
  avgMatchScore: number;
}

export interface MatchingConfig {
  minCategoryScore?: number;
  minLocationScore?: number;
  minEligibilityScore?: number;
  maxResults?: number;
  includePartialMatches?: boolean;
  prioritizeGreen?: boolean;
}

// ============================================================================
// SCORING WEIGHTS (V41 Priority: Category → Location → Eligibility)
// ============================================================================

const WEIGHTS = {
  category: 0.40,      // Highest priority - Category match
  location: 0.35,      // Second priority - Location match
  eligibility: 0.25,   // Third priority - Eligibility criteria
};

// Category hierarchy for matching
const CATEGORY_PRIORITY: Record<IncentiveCategory, number> = {
  federal: 4,   // Federal programs have broadest applicability
  state: 3,     // State programs next
  local: 2,     // Local programs more specific
  utility: 1,   // Utility programs most specific
};

// ============================================================================
// CATEGORY MATCHING (Priority 1)
// ============================================================================

function calculateCategoryScore(
  incentive: IncentiveProgram,
  project: Project
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  const category = incentive.category?.toLowerCase() || 'state';

  // Base category score based on jurisdiction level
  switch (incentive.jurisdiction_level) {
    case 'federal':
      score += 0.4;
      reasons.push('Federal program - broad eligibility');
      break;
    case 'state':
      score += 0.3;
      reasons.push('State-level program');
      break;
    case 'local':
      score += 0.2;
      reasons.push('Local program - targeted benefits');
      break;
    case 'utility':
      score += 0.1;
      reasons.push('Utility program');
      break;
    default:
      score += 0.2;
  }

  // Match incentive type to project needs
  const incentiveType = incentive.incentive_type?.toLowerCase() || '';
  const projectSector = project.sector_type?.toLowerCase() || '';

  // Tax credits are highly valuable for real estate
  if (incentiveType.includes('tax_credit') || incentiveType.includes('tax credit')) {
    score += 0.3;
    reasons.push('Tax credit - direct dollar-for-dollar benefit');
  } else if (incentiveType.includes('grant')) {
    score += 0.25;
    reasons.push('Grant - non-repayable funding');
  } else if (incentiveType.includes('rebate')) {
    score += 0.2;
    reasons.push('Rebate - cost recovery');
  } else if (incentiveType.includes('loan')) {
    score += 0.1;
    reasons.push('Low-interest financing available');
  }

  // Sector alignment bonus
  if (incentive.sector_types?.includes(project.sector_type || '')) {
    score += 0.2;
    reasons.push(`Sector match: ${project.sector_type}`);
  }

  // Building type alignment
  if (incentive.building_types?.includes(project.building_type || '')) {
    score += 0.1;
    reasons.push(`Building type match: ${project.building_type}`);
  }

  return { score: Math.min(1, score), reasons };
}

// ============================================================================
// LOCATION MATCHING (Priority 2)
// ============================================================================

function calculateLocationScore(
  incentive: IncentiveProgram,
  project: Project
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Federal programs apply everywhere
  if (incentive.jurisdiction_level === 'federal') {
    score = 1.0;
    reasons.push('Federal - applies nationwide');
    return { score, reasons };
  }

  // State matching
  const incentiveState = incentive.state?.toUpperCase();
  const projectState = project.state?.toUpperCase();

  if (!incentiveState || incentiveState === projectState) {
    score += 0.5;
    if (incentiveState === projectState) {
      reasons.push(`State match: ${projectState}`);
    }
  } else {
    // State mismatch - significant penalty
    reasons.push(`State mismatch: program is for ${incentiveState}, project in ${projectState}`);
    return { score: 0, reasons };
  }

  // County matching
  if (incentive.counties && incentive.counties.length > 0) {
    const projectCounty = project.county?.toLowerCase();
    const matchedCounty = incentive.counties.find(
      c => c.toLowerCase() === projectCounty
    );
    if (matchedCounty) {
      score += 0.3;
      reasons.push(`County match: ${project.county}`);
    } else if (projectCounty) {
      score -= 0.2;
      reasons.push(`County not in eligible list`);
    }
  } else {
    // No county restriction - moderate bonus
    score += 0.2;
  }

  // City/municipality matching
  if (incentive.municipalities && incentive.municipalities.length > 0) {
    const projectCity = project.city?.toLowerCase();
    const matchedCity = incentive.municipalities.find(
      m => m.toLowerCase() === projectCity
    );
    if (matchedCity) {
      score += 0.2;
      reasons.push(`Municipality match: ${project.city}`);
    } else if (projectCity) {
      score -= 0.1;
      reasons.push(`City not in eligible municipalities`);
    }
  } else {
    score += 0.1;
  }

  return { score: Math.max(0, Math.min(1, score)), reasons };
}

// ============================================================================
// ELIGIBILITY MATCHING (Priority 3)
// ============================================================================

function calculateEligibilityScore(
  incentive: IncentiveProgram,
  project: Project
): { score: number; reasons: string[]; details: EligibilityDetail[] } {
  const reasons: string[] = [];
  const details: EligibilityDetail[] = [];
  let score = 0;
  let maxScore = 0;

  // ---- Affordability Requirements ----
  if (project.total_units && project.affordable_units) {
    const affordabilityPct = (project.affordable_units / project.total_units) * 100;

    // Check if program requires affordability
    const requiresAffordability = incentive.name?.toLowerCase().includes('affordable') ||
      incentive.name?.toLowerCase().includes('lihtc') ||
      (incentive.sector_types as string[] | undefined)?.includes('affordable-housing');

    if (requiresAffordability) {
      maxScore += 0.3;
      if (affordabilityPct >= 20) {
        score += 0.3;
        details.push({
          criterion: 'Affordability',
          met: true,
          description: `${affordabilityPct.toFixed(0)}% affordable units`,
          weight: 0.3,
        });
        reasons.push(`Meets affordability: ${affordabilityPct.toFixed(0)}%`);
      } else {
        details.push({
          criterion: 'Affordability',
          met: false,
          description: `Only ${affordabilityPct.toFixed(0)}% affordable - may need 20%+`,
          weight: 0.3,
        });
      }
    }
  }

  // ---- Project Size Requirements ----
  if (project.total_units) {
    maxScore += 0.2;
    if (project.total_units >= 5) {
      score += 0.2;
      details.push({
        criterion: 'Project Size',
        met: true,
        description: `${project.total_units} units qualifies`,
        weight: 0.2,
      });
      reasons.push(`Project size qualifies: ${project.total_units} units`);
    } else {
      details.push({
        criterion: 'Project Size',
        met: false,
        description: `${project.total_units} units - some programs require 5+`,
        weight: 0.2,
      });
    }
  }

  // ---- Sustainability/Clean Energy ----
  const isGreenIncentive =
    incentive.name?.toLowerCase().includes('solar') ||
    incentive.name?.toLowerCase().includes('energy') ||
    incentive.name?.toLowerCase().includes('clean') ||
    incentive.name?.toLowerCase().includes('renewable') ||
    incentive.name?.toLowerCase().includes('efficiency') ||
    incentive.technology_types?.length > 0;

  if (isGreenIncentive) {
    maxScore += 0.25;
    const hasSustainability =
      project.target_certification ||
      project.projected_energy_reduction_pct ||
      (project.renewable_energy_types && project.renewable_energy_types.length > 0);

    if (hasSustainability) {
      score += 0.25;
      details.push({
        criterion: 'Sustainability',
        met: true,
        description: project.target_certification || 'Clean energy features planned',
        weight: 0.25,
      });
      reasons.push(`Sustainability match: ${project.target_certification || 'green features'}`);
    } else {
      details.push({
        criterion: 'Sustainability',
        met: false,
        description: 'No sustainability features specified',
        weight: 0.25,
      });
    }
  }

  // ---- Financial Thresholds ----
  if (project.total_development_cost) {
    maxScore += 0.15;
    if (project.total_development_cost >= 1000000) {
      score += 0.15;
      details.push({
        criterion: 'Project Scale',
        met: true,
        description: `TDC: $${(project.total_development_cost / 1e6).toFixed(1)}M`,
        weight: 0.15,
      });
      reasons.push(`Significant project scale: $${(project.total_development_cost / 1e6).toFixed(1)}M TDC`);
    } else {
      details.push({
        criterion: 'Project Scale',
        met: false,
        description: `TDC may be below minimum for some programs`,
        weight: 0.15,
      });
    }
  }

  // ---- Timeline/Deadline Check ----
  if (incentive.application_deadline) {
    maxScore += 0.1;
    const deadline = new Date(incentive.application_deadline);
    const now = new Date();
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil > 0) {
      score += 0.1;
      details.push({
        criterion: 'Deadline',
        met: true,
        description: `${daysUntil} days until deadline`,
        weight: 0.1,
      });
      if (daysUntil <= 90) {
        reasons.push(`Deadline approaching: ${daysUntil} days`);
      }
    } else {
      details.push({
        criterion: 'Deadline',
        met: false,
        description: 'Application deadline passed',
        weight: 0.1,
      });
    }
  }

  // ---- IRA Bonuses ----
  if (incentive.domestic_content_bonus || incentive.energy_community_bonus || incentive.prevailing_wage_bonus) {
    maxScore += 0.2;
    let bonusScore = 0;

    if (incentive.domestic_content_bonus && project.domestic_content_eligible) {
      bonusScore += 0.07;
      reasons.push(`+${(incentive.domestic_content_bonus * 100).toFixed(0)}% domestic content bonus`);
    }
    if (incentive.energy_community_bonus) {
      bonusScore += 0.07;
      reasons.push(`Energy community bonus available`);
    }
    if (incentive.prevailing_wage_bonus && project.prevailing_wage_commitment) {
      bonusScore += 0.06;
      reasons.push(`+${(incentive.prevailing_wage_bonus * 100).toFixed(0)}% prevailing wage bonus`);
    }

    score += bonusScore;
    details.push({
      criterion: 'IRA Bonuses',
      met: bonusScore > 0,
      description: bonusScore > 0 ? 'Bonus credits available' : 'Bonus requirements not met',
      weight: 0.2,
    });
  }

  // Normalize score
  const normalizedScore = maxScore > 0 ? score / maxScore : 0.5;

  return {
    score: Math.min(1, normalizedScore),
    reasons,
    details,
  };
}

// ============================================================================
// VALUE ESTIMATION
// ============================================================================

function estimateIncentiveValue(
  incentive: IncentiveProgram,
  project: Project
): number {
  let value = 0;

  // Fixed amount
  if (incentive.amount_fixed) {
    value = incentive.amount_fixed;
  }
  // Percentage of TDC
  else if (incentive.amount_percentage && project.total_development_cost) {
    const pct = incentive.amount_percentage > 1
      ? incentive.amount_percentage / 100
      : incentive.amount_percentage;
    value = project.total_development_cost * pct;
  }
  // Per unit
  else if (incentive.amount_per_unit && project.total_units) {
    value = incentive.amount_per_unit * project.total_units;
  }
  // Per kW
  else if (incentive.amount_per_kw && project.capacity_mw) {
    value = incentive.amount_per_kw * project.capacity_mw * 1000;
  }
  // Fallback to max amount estimate
  else if (incentive.amount_max) {
    value = incentive.amount_max * 0.5; // Conservative 50% estimate
  }

  // Apply caps
  if (incentive.amount_min && value < incentive.amount_min) {
    value = incentive.amount_min;
  }
  if (incentive.amount_max && value > incentive.amount_max) {
    value = incentive.amount_max;
  }

  return value;
}

// ============================================================================
// MAIN MATCHING FUNCTION
// ============================================================================

export function matchIncentivesToProject(
  project: Project,
  incentives: IncentiveProgram[],
  config: MatchingConfig = {}
): MatchingResult {
  const {
    minCategoryScore = 0.2,
    minLocationScore = 0.3,
    minEligibilityScore = 0.1,
    maxResults = 100,
    includePartialMatches = true,
    prioritizeGreen = true,
  } = config;

  const matches: MatchedIncentive[] = [];

  for (const incentive of incentives) {
    // Skip inactive programs
    if (incentive.status && incentive.status !== 'active') continue;

    // Calculate scores in priority order
    const categoryResult = calculateCategoryScore(incentive, project);
    const locationResult = calculateLocationScore(incentive, project);
    const eligibilityResult = calculateEligibilityScore(incentive, project);

    // Apply minimum thresholds
    if (categoryResult.score < minCategoryScore) continue;
    if (locationResult.score < minLocationScore) continue;
    if (!includePartialMatches && eligibilityResult.score < minEligibilityScore) continue;

    // Calculate weighted total score (V41 priorities)
    const matchScore =
      (categoryResult.score * WEIGHTS.category) +
      (locationResult.score * WEIGHTS.location) +
      (eligibilityResult.score * WEIGHTS.eligibility);

    // Estimate value
    const estimatedValue = estimateIncentiveValue(incentive, project);

    // Combine reasons
    const matchReasons = [
      ...categoryResult.reasons,
      ...locationResult.reasons,
      ...eligibilityResult.reasons,
    ];

    // Determine tier
    let tier: 'high' | 'medium' | 'low' | 'potential';
    if (matchScore >= 0.75 && locationResult.score >= 0.8) {
      tier = 'high';
    } else if (matchScore >= 0.55 && locationResult.score >= 0.5) {
      tier = 'medium';
    } else if (matchScore >= 0.35) {
      tier = 'low';
    } else {
      tier = 'potential';
    }

    matches.push({
      incentive,
      matchScore,
      categoryScore: categoryResult.score,
      locationScore: locationResult.score,
      eligibilityScore: eligibilityResult.score,
      estimatedValue,
      matchReasons,
      eligibilityDetails: eligibilityResult.details,
      tier,
    });
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => {
    // First by tier
    const tierOrder = { high: 4, medium: 3, low: 2, potential: 1 };
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[b.tier] - tierOrder[a.tier];
    }
    // Then by estimated value
    if (a.estimatedValue !== b.estimatedValue) {
      return b.estimatedValue - a.estimatedValue;
    }
    // Finally by match score
    return b.matchScore - a.matchScore;
  });

  // Limit results
  const limitedMatches = matches.slice(0, maxResults);

  // Group by category
  const byCategory: Record<IncentiveCategory, MatchedIncentive[]> = {
    federal: limitedMatches.filter(m => m.incentive.category === 'federal' || m.incentive.jurisdiction_level === 'federal'),
    state: limitedMatches.filter(m => m.incentive.category === 'state' || m.incentive.jurisdiction_level === 'state'),
    local: limitedMatches.filter(m => m.incentive.category === 'local' || m.incentive.jurisdiction_level === 'local'),
    utility: limitedMatches.filter(m => m.incentive.category === 'utility' || m.incentive.jurisdiction_level === 'utility'),
  };

  // Identify green/IRA incentives
  const greenIncentives = limitedMatches.filter(m =>
    m.incentive.name?.toLowerCase().includes('solar') ||
    m.incentive.name?.toLowerCase().includes('energy') ||
    m.incentive.name?.toLowerCase().includes('clean') ||
    m.incentive.name?.toLowerCase().includes('renewable') ||
    m.incentive.name?.toLowerCase().includes('efficiency') ||
    m.incentive.name?.toLowerCase().includes('ev') ||
    m.incentive.name?.toLowerCase().includes('geothermal') ||
    (m.incentive.technology_types && m.incentive.technology_types.length > 0)
  );

  const iraIncentives = limitedMatches.filter(m =>
    m.incentive.name?.toLowerCase().includes('ira') ||
    m.incentive.name?.toLowerCase().includes('inflation reduction') ||
    m.incentive.domestic_content_bonus ||
    m.incentive.energy_community_bonus ||
    m.incentive.prevailing_wage_bonus
  );

  // Calculate totals
  const totalPotentialValue = limitedMatches.reduce((sum, m) => sum + m.estimatedValue, 0);

  // Top matches (high tier or top 10 by value)
  const topMatches = limitedMatches
    .filter(m => m.tier === 'high' || m.tier === 'medium')
    .slice(0, 10);

  // Summary stats
  const summary: MatchingSummary = {
    totalMatched: limitedMatches.length,
    highTier: limitedMatches.filter(m => m.tier === 'high').length,
    mediumTier: limitedMatches.filter(m => m.tier === 'medium').length,
    lowTier: limitedMatches.filter(m => m.tier === 'low').length,
    potentialTier: limitedMatches.filter(m => m.tier === 'potential').length,
    federalCount: byCategory.federal.length,
    stateCount: byCategory.state.length,
    localCount: byCategory.local.length,
    utilityCount: byCategory.utility.length,
    avgMatchScore: limitedMatches.length > 0
      ? limitedMatches.reduce((sum, m) => sum + m.matchScore, 0) / limitedMatches.length
      : 0,
  };

  return {
    project,
    matches: limitedMatches,
    byCategory,
    totalPotentialValue,
    topMatches,
    greenIncentives,
    iraIncentives,
    summary,
  };
}

// ============================================================================
// QUICK MATCH FOR UI (lightweight version)
// ============================================================================

export interface QuickMatch {
  id: string;
  name: string;
  category: IncentiveCategory;
  estimatedValue: number;
  tier: 'high' | 'medium' | 'low' | 'potential';
  matchScore: number;
  topReason: string;
}

export function getQuickMatches(
  project: Project,
  incentives: IncentiveProgram[],
  limit: number = 5
): QuickMatch[] {
  const result = matchIncentivesToProject(project, incentives, {
    maxResults: limit,
    includePartialMatches: false,
  });

  return result.matches.map(m => ({
    id: m.incentive.id,
    name: m.incentive.name,
    category: (m.incentive.category || m.incentive.jurisdiction_level || 'state') as IncentiveCategory,
    estimatedValue: m.estimatedValue,
    tier: m.tier,
    matchScore: m.matchScore,
    topReason: m.matchReasons[0] || 'Eligible program',
  }));
}
