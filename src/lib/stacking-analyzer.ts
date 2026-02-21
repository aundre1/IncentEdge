/**
 * Stacking Analyzer Engine for IncentEdge
 *
 * Determines which incentives can be combined ("stacked") and calculates
 * total combined value. Implements stacking rules based on:
 * - Jurisdiction level (federal, state, local, utility)
 * - Incentive type (tax_credit, grant, rebate, loan)
 * - IRA bonus adders (domestic content, energy community, prevailing wage)
 *
 * Stacking Rules:
 * - Federal + State programs CAN stack
 * - Federal + Local programs CAN stack
 * - State + Local programs CAN stack
 * - Same-level programs are usually MUTUALLY EXCLUSIVE (especially federal tax credits)
 * - Different incentive types CAN stack (grant + tax credit, loan + grant)
 * - IRA bonus adders ARE stackable on base credits (additive)
 */

import type { IncentiveProgram, IncentiveType } from '@/types';
import type { MatchedIncentive } from './incentive-matcher';

// ============================================================================
// TYPES
// ============================================================================

export type StackingCompatibility = 'STACKABLE' | 'MUTUALLY_EXCLUSIVE' | 'CONDITIONAL';

export interface StackingRule {
  /** First program type or jurisdiction */
  typeA: string;
  /** Second program type or jurisdiction */
  typeB: string;
  /** Whether they can stack */
  compatibility: StackingCompatibility;
  /** Explanation for the rule */
  reason: string;
  /** Optional conditions for CONDITIONAL compatibility */
  conditions?: string[];
}

export interface StackingGroup {
  /** Unique identifier for this stacking group */
  id: string;
  /** Name describing this group */
  name: string;
  /** Incentives that can be combined in this group */
  incentives: MatchedIncentive[];
  /** Total combined value of all incentives in the group */
  totalValue: number;
  /** Explanation of why these stack */
  stackingRationale: string;
  /** Any restrictions or conditions */
  restrictions: string[];
  /** Breakdown by jurisdiction level */
  jurisdictionBreakdown: {
    federal: number;
    state: number;
    local: number;
    utility: number;
  };
}

export interface MutuallyExclusivePair {
  /** First incentive */
  incentiveA: MatchedIncentive;
  /** Second incentive */
  incentiveB: MatchedIncentive;
  /** Reason they cannot stack */
  reason: string;
  /** Recommendation on which to choose */
  recommendation: string;
}

export interface IRABonusBreakdown {
  /** Base credit value */
  baseCredit: number;
  /** Domestic content bonus (10% adder) */
  domesticContentBonus: number;
  /** Energy community bonus (10% adder) */
  energyCommunityBonus: number;
  /** Prevailing wage bonus (typically 5x multiplier or adder) */
  prevailingWageBonus: number;
  /** Total with all bonuses */
  totalWithBonuses: number;
  /** Breakdown explanation */
  explanation: string;
}

export interface StackingResult {
  /** Original matches analyzed */
  inputMatches: MatchedIncentive[];
  /** Groups of stackable incentives */
  stackingGroups: StackingGroup[];
  /** Pairs of mutually exclusive incentives */
  mutuallyExclusivePairs: MutuallyExclusivePair[];
  /** Best stacking scenario (highest total value) */
  optimalStack: StackingGroup | null;
  /** Total combined value of optimal stack */
  totalCombinedValue: number;
  /** IRA bonus breakdowns for eligible programs */
  iraBonusBreakdowns: IRABonusBreakdown[];
  /** Summary statistics */
  summary: {
    totalIncentivesAnalyzed: number;
    stackableCount: number;
    mutuallyExclusiveCount: number;
    potentialValueLost: number; // Value that can't be captured due to exclusivity
    valueByJurisdiction: {
      federal: number;
      state: number;
      local: number;
      utility: number;
    };
  };
}

// ============================================================================
// STACKING RULES
// ============================================================================

/**
 * Predefined stacking rules based on jurisdiction and incentive type
 */
const JURISDICTION_STACKING_RULES: StackingRule[] = [
  // Federal + other levels
  {
    typeA: 'federal',
    typeB: 'state',
    compatibility: 'STACKABLE',
    reason: 'Federal and state incentives can generally be combined as they come from different funding sources',
  },
  {
    typeA: 'federal',
    typeB: 'local',
    compatibility: 'STACKABLE',
    reason: 'Federal and local incentives can be combined as they are from different government levels',
  },
  {
    typeA: 'federal',
    typeB: 'utility',
    compatibility: 'STACKABLE',
    reason: 'Federal incentives can stack with utility rebates as they are from different sources',
  },
  // State + other levels
  {
    typeA: 'state',
    typeB: 'local',
    compatibility: 'STACKABLE',
    reason: 'State and local incentives can generally be combined',
  },
  {
    typeA: 'state',
    typeB: 'utility',
    compatibility: 'STACKABLE',
    reason: 'State incentives can stack with utility programs',
  },
  // Local + utility
  {
    typeA: 'local',
    typeB: 'utility',
    compatibility: 'STACKABLE',
    reason: 'Local incentives can stack with utility rebates',
  },
  // Same level - generally exclusive
  {
    typeA: 'federal',
    typeB: 'federal',
    compatibility: 'CONDITIONAL',
    reason: 'Multiple federal programs may be mutually exclusive for the same activity',
    conditions: [
      'Different federal tax credits for the same activity are typically mutually exclusive',
      'IRA bonus adders can stack on base credits',
      'Grants and tax credits from different federal programs may stack if for different activities',
    ],
  },
  {
    typeA: 'state',
    typeB: 'state',
    compatibility: 'CONDITIONAL',
    reason: 'Multiple state programs may have stacking restrictions',
    conditions: ['Check individual program requirements for stacking limitations'],
  },
  {
    typeA: 'local',
    typeB: 'local',
    compatibility: 'CONDITIONAL',
    reason: 'Multiple local programs may have stacking restrictions',
    conditions: ['Local programs often have combined caps or limitations'],
  },
];

/**
 * Incentive type stacking rules
 */
const INCENTIVE_TYPE_STACKING_RULES: StackingRule[] = [
  {
    typeA: 'tax_credit',
    typeB: 'grant',
    compatibility: 'STACKABLE',
    reason: 'Tax credits and grants are different funding mechanisms and can typically stack',
  },
  {
    typeA: 'tax_credit',
    typeB: 'rebate',
    compatibility: 'STACKABLE',
    reason: 'Tax credits and rebates can be combined as they are different benefit types',
  },
  {
    typeA: 'tax_credit',
    typeB: 'loan',
    compatibility: 'STACKABLE',
    reason: 'Tax credits can be combined with low-interest loans',
  },
  {
    typeA: 'grant',
    typeB: 'rebate',
    compatibility: 'STACKABLE',
    reason: 'Grants and rebates can typically be combined',
  },
  {
    typeA: 'grant',
    typeB: 'loan',
    compatibility: 'STACKABLE',
    reason: 'Grants can be combined with financing programs',
  },
  {
    typeA: 'rebate',
    typeB: 'loan',
    compatibility: 'STACKABLE',
    reason: 'Rebates and loans can be combined',
  },
  {
    typeA: 'tax_credit',
    typeB: 'tax_credit',
    compatibility: 'CONDITIONAL',
    reason: 'Multiple tax credits for the same activity are usually mutually exclusive',
    conditions: [
      'Different tax credits for different activities (e.g., solar + EV charging) can stack',
      'Same-type credits for the same system/activity typically cannot stack',
    ],
  },
  {
    typeA: 'grant',
    typeB: 'grant',
    compatibility: 'CONDITIONAL',
    reason: 'Multiple grants may have combined funding caps',
    conditions: ['Total grants may be limited to a percentage of project costs'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the jurisdiction level from an incentive
 */
function getJurisdictionLevel(incentive: IncentiveProgram): string {
  return incentive.jurisdiction_level || incentive.category || 'state';
}

/**
 * Get the incentive type
 */
function getIncentiveType(incentive: IncentiveProgram): IncentiveType {
  return incentive.incentive_type || 'tax_credit';
}

/**
 * Check if an incentive is an IRA program with bonus adders
 */
function isIRAProgram(incentive: IncentiveProgram): boolean {
  const name = incentive.name?.toLowerCase() || '';
  return (
    name.includes('ira') ||
    name.includes('inflation reduction') ||
    name.includes('section 45') ||
    name.includes('section 48') ||
    name.includes('45l') ||
    name.includes('45y') ||
    name.includes('45z') ||
    name.includes('48e') ||
    name.includes('179d') ||
    incentive.domestic_content_bonus != null ||
    incentive.energy_community_bonus != null ||
    incentive.prevailing_wage_bonus != null
  );
}

/**
 * Check if two incentives target the same activity/system
 */
function targetsSameActivity(
  incentiveA: IncentiveProgram,
  incentiveB: IncentiveProgram
): boolean {
  // Check technology types overlap
  const techA = new Set(incentiveA.technology_types || []);
  const techB = new Set(incentiveB.technology_types || []);
  const techOverlap = Array.from(techA).some(t => techB.has(t));

  // Check name similarity for common activities
  const nameA = incentiveA.name?.toLowerCase() || '';
  const nameB = incentiveB.name?.toLowerCase() || '';

  const solarKeywords = ['solar', 'photovoltaic', 'pv', 'itc'];
  const bothSolar = solarKeywords.some(k => nameA.includes(k)) &&
    solarKeywords.some(k => nameB.includes(k));

  const evKeywords = ['ev', 'electric vehicle', 'charging'];
  const bothEV = evKeywords.some(k => nameA.includes(k)) &&
    evKeywords.some(k => nameB.includes(k));

  const hvacKeywords = ['hvac', 'heat pump', 'heating', 'cooling'];
  const bothHVAC = hvacKeywords.some(k => nameA.includes(k)) &&
    hvacKeywords.some(k => nameB.includes(k));

  const affordableKeywords = ['lihtc', 'affordable', 'low-income'];
  const bothAffordable = affordableKeywords.some(k => nameA.includes(k)) &&
    affordableKeywords.some(k => nameB.includes(k));

  return techOverlap || bothSolar || bothEV || bothHVAC || bothAffordable;
}

/**
 * Find applicable stacking rule for two jurisdictions
 */
function findJurisdictionRule(levelA: string, levelB: string): StackingRule | undefined {
  return JURISDICTION_STACKING_RULES.find(rule =>
    (rule.typeA === levelA && rule.typeB === levelB) ||
    (rule.typeA === levelB && rule.typeB === levelA)
  );
}

/**
 * Find applicable stacking rule for two incentive types
 */
function findIncentiveTypeRule(typeA: IncentiveType, typeB: IncentiveType): StackingRule | undefined {
  return INCENTIVE_TYPE_STACKING_RULES.find(rule =>
    (rule.typeA === typeA && rule.typeB === typeB) ||
    (rule.typeA === typeB && rule.typeB === typeA)
  );
}

/**
 * Determine stacking compatibility between two matched incentives
 */
function determineStackingCompatibility(
  matchA: MatchedIncentive,
  matchB: MatchedIncentive
): { compatible: boolean; reason: string } {
  const incentiveA = matchA.incentive;
  const incentiveB = matchB.incentive;

  // Check explicit stackable flags
  if (incentiveA.stackable === false || incentiveB.stackable === false) {
    return {
      compatible: false,
      reason: 'One or both programs explicitly marked as non-stackable',
    };
  }

  // Check for stacking restrictions
  const restrictionsA = incentiveA.stacking_restrictions || [];
  const restrictionsB = incentiveB.stacking_restrictions || [];

  if (restrictionsA.length > 0 || restrictionsB.length > 0) {
    // Check if either program restricts the other
    const nameB = incentiveB.name?.toLowerCase() || '';
    const nameA = incentiveA.name?.toLowerCase() || '';

    const aRestrictsB = restrictionsA.some(r => nameB.includes(r.toLowerCase()));
    const bRestrictsA = restrictionsB.some(r => nameA.includes(r.toLowerCase()));

    if (aRestrictsB || bRestrictsA) {
      return {
        compatible: false,
        reason: 'Program stacking restrictions apply',
      };
    }
  }

  const levelA = getJurisdictionLevel(incentiveA);
  const levelB = getJurisdictionLevel(incentiveB);
  const typeA = getIncentiveType(incentiveA);
  const typeB = getIncentiveType(incentiveB);

  // Different jurisdiction levels - generally stackable
  if (levelA !== levelB) {
    const rule = findJurisdictionRule(levelA, levelB);
    if (rule && rule.compatibility === 'STACKABLE') {
      return {
        compatible: true,
        reason: rule.reason,
      };
    }
  }

  // Same jurisdiction level - check if same activity
  if (levelA === levelB) {
    // Federal tax credits for the same activity are typically mutually exclusive
    if (levelA === 'federal' && typeA === 'tax_credit' && typeB === 'tax_credit') {
      if (targetsSameActivity(incentiveA, incentiveB)) {
        return {
          compatible: false,
          reason: 'Federal tax credits for the same activity are typically mutually exclusive',
        };
      }
    }

    // Different incentive types at same level can stack
    if (typeA !== typeB) {
      const typeRule = findIncentiveTypeRule(typeA, typeB);
      if (typeRule && typeRule.compatibility === 'STACKABLE') {
        return {
          compatible: true,
          reason: `${typeRule.reason} (within ${levelA} level)`,
        };
      }
    }
  }

  // Different incentive types - generally stackable
  if (typeA !== typeB) {
    const typeRule = findIncentiveTypeRule(typeA, typeB);
    if (typeRule) {
      return {
        compatible: typeRule.compatibility === 'STACKABLE',
        reason: typeRule.reason,
      };
    }
  }

  // Default: check if same activity for same type
  if (typeA === typeB && targetsSameActivity(incentiveA, incentiveB)) {
    return {
      compatible: false,
      reason: `Multiple ${typeA} programs for the same activity may be mutually exclusive`,
    };
  }

  // Default to stackable if no explicit rule against it
  return {
    compatible: true,
    reason: 'No explicit stacking restrictions found',
  };
}

/**
 * Calculate IRA bonus breakdown for an eligible program
 */
function calculateIRABonus(
  match: MatchedIncentive,
  domesticContentEligible: boolean,
  energyCommunityEligible: boolean,
  prevailingWageCommitment: boolean
): IRABonusBreakdown | null {
  const incentive = match.incentive;

  if (!isIRAProgram(incentive)) {
    return null;
  }

  const baseCredit = match.estimatedValue;
  let domesticContentBonus = 0;
  let energyCommunityBonus = 0;
  let prevailingWageBonus = 0;

  // Domestic content bonus (typically 10% adder)
  if (domesticContentEligible && incentive.domestic_content_bonus) {
    domesticContentBonus = baseCredit * incentive.domestic_content_bonus;
  }

  // Energy community bonus (typically 10% adder)
  if (energyCommunityEligible && incentive.energy_community_bonus) {
    energyCommunityBonus = baseCredit * incentive.energy_community_bonus;
  }

  // Prevailing wage bonus (can be 5x multiplier or adder depending on credit)
  if (prevailingWageCommitment && incentive.prevailing_wage_bonus) {
    prevailingWageBonus = baseCredit * incentive.prevailing_wage_bonus;
  }

  const totalWithBonuses = baseCredit + domesticContentBonus + energyCommunityBonus + prevailingWageBonus;

  const bonusParts: string[] = [];
  if (domesticContentBonus > 0) bonusParts.push(`Domestic Content: +$${domesticContentBonus.toLocaleString()}`);
  if (energyCommunityBonus > 0) bonusParts.push(`Energy Community: +$${energyCommunityBonus.toLocaleString()}`);
  if (prevailingWageBonus > 0) bonusParts.push(`Prevailing Wage: +$${prevailingWageBonus.toLocaleString()}`);

  return {
    baseCredit,
    domesticContentBonus,
    energyCommunityBonus,
    prevailingWageBonus,
    totalWithBonuses,
    explanation: bonusParts.length > 0
      ? `Base: $${baseCredit.toLocaleString()} + ${bonusParts.join(' + ')}`
      : `Base credit only: $${baseCredit.toLocaleString()}`,
  };
}

// ============================================================================
// MAIN ANALYZER FUNCTION
// ============================================================================

export interface StackingAnalyzerOptions {
  /** Whether the project qualifies for domestic content */
  domesticContentEligible?: boolean;
  /** Whether the project is in an energy community */
  energyCommunityEligible?: boolean;
  /** Whether prevailing wages will be paid */
  prevailingWageCommitment?: boolean;
  /** Maximum number of stacking groups to return */
  maxGroups?: number;
}

/**
 * Analyze stacking opportunities for matched incentives
 *
 * @param matches Array of matched incentives to analyze
 * @param options Configuration options
 * @returns StackingResult with groups and recommendations
 */
export function analyzeStackingOpportunities(
  matches: MatchedIncentive[],
  options: StackingAnalyzerOptions = {}
): StackingResult {
  const {
    domesticContentEligible = false,
    energyCommunityEligible = false,
    prevailingWageCommitment = false,
    maxGroups = 5,
  } = options;

  // Handle edge cases
  if (!matches || matches.length === 0) {
    return createEmptyResult();
  }

  if (matches.length === 1) {
    return createSingleMatchResult(matches[0], {
      domesticContentEligible,
      energyCommunityEligible,
      prevailingWageCommitment,
    });
  }

  // Build compatibility matrix
  const mutuallyExclusivePairs: MutuallyExclusivePair[] = [];
  const compatibilityMatrix: Map<string, Set<string>> = new Map();

  // Initialize compatibility sets for each incentive
  for (const match of matches) {
    compatibilityMatrix.set(match.incentive.id, new Set([match.incentive.id]));
  }

  // Check pairwise compatibility
  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const matchA = matches[i];
      const matchB = matches[j];
      const { compatible, reason } = determineStackingCompatibility(matchA, matchB);

      if (compatible) {
        // Add to each other's compatible sets
        compatibilityMatrix.get(matchA.incentive.id)?.add(matchB.incentive.id);
        compatibilityMatrix.get(matchB.incentive.id)?.add(matchA.incentive.id);
      } else {
        // Record mutually exclusive pair
        const higherValue = matchA.estimatedValue >= matchB.estimatedValue ? matchA : matchB;
        mutuallyExclusivePairs.push({
          incentiveA: matchA,
          incentiveB: matchB,
          reason,
          recommendation: `Consider ${higherValue.incentive.name} for higher value ($${higherValue.estimatedValue.toLocaleString()})`,
        });
      }
    }
  }

  // Build stacking groups using greedy algorithm
  const stackingGroups = buildStackingGroups(matches, compatibilityMatrix, maxGroups);

  // Calculate IRA bonus breakdowns
  const iraBonusBreakdowns: IRABonusBreakdown[] = [];
  for (const match of matches) {
    const breakdown = calculateIRABonus(match, domesticContentEligible, energyCommunityEligible, prevailingWageCommitment);
    if (breakdown) {
      iraBonusBreakdowns.push(breakdown);
    }
  }

  // Find optimal stack (highest total value)
  const optimalStack = stackingGroups.length > 0
    ? stackingGroups.reduce((best, current) =>
      current.totalValue > best.totalValue ? current : best
    )
    : null;

  // Calculate summary statistics
  const summary = calculateSummary(matches, stackingGroups, mutuallyExclusivePairs);

  return {
    inputMatches: matches,
    stackingGroups,
    mutuallyExclusivePairs,
    optimalStack,
    totalCombinedValue: optimalStack?.totalValue || 0,
    iraBonusBreakdowns,
    summary,
  };
}

/**
 * Build stacking groups using greedy algorithm
 */
function buildStackingGroups(
  matches: MatchedIncentive[],
  compatibilityMatrix: Map<string, Set<string>>,
  maxGroups: number
): StackingGroup[] {
  const groups: StackingGroup[] = [];
  const usedIncentives = new Set<string>();

  // Sort matches by value (descending) to build highest-value groups first
  const sortedMatches = [...matches].sort((a, b) => b.estimatedValue - a.estimatedValue);

  for (const startMatch of sortedMatches) {
    if (usedIncentives.has(startMatch.incentive.id) && groups.length >= maxGroups) {
      continue;
    }

    // Build a group starting with this match
    const groupIncentives: MatchedIncentive[] = [startMatch];
    const compatibleIds = compatibilityMatrix.get(startMatch.incentive.id) || new Set();

    // Add compatible incentives
    for (const otherMatch of sortedMatches) {
      if (otherMatch.incentive.id === startMatch.incentive.id) continue;

      // Check if this incentive is compatible with ALL incentives already in the group
      const isCompatibleWithGroup = groupIncentives.every(groupMember =>
        compatibilityMatrix.get(groupMember.incentive.id)?.has(otherMatch.incentive.id)
      );

      if (isCompatibleWithGroup) {
        groupIncentives.push(otherMatch);
      }
    }

    // Only create group if it has more than one incentive or is the only option
    if (groupIncentives.length > 1 || groups.length === 0) {
      const group = createStackingGroup(groupIncentives, groups.length + 1);

      // Check if this group is unique enough (not a subset of existing groups)
      const isUnique = !groups.some(existingGroup =>
        groupIncentives.every(gi =>
          existingGroup.incentives.some(ei => ei.incentive.id === gi.incentive.id)
        )
      );

      if (isUnique) {
        groups.push(group);
        groupIncentives.forEach(gi => usedIncentives.add(gi.incentive.id));
      }
    }

    if (groups.length >= maxGroups) break;
  }

  // Sort groups by total value
  return groups.sort((a, b) => b.totalValue - a.totalValue);
}

/**
 * Create a stacking group from a set of compatible incentives
 */
function createStackingGroup(incentives: MatchedIncentive[], groupNumber: number): StackingGroup {
  const totalValue = incentives.reduce((sum, m) => sum + m.estimatedValue, 0);

  const jurisdictionBreakdown = {
    federal: 0,
    state: 0,
    local: 0,
    utility: 0,
  };

  const restrictions: string[] = [];

  for (const match of incentives) {
    const level = getJurisdictionLevel(match.incentive) as keyof typeof jurisdictionBreakdown;
    if (level in jurisdictionBreakdown) {
      jurisdictionBreakdown[level] += match.estimatedValue;
    }

    // Collect any stacking restrictions
    if (match.incentive.stacking_restrictions?.length) {
      restrictions.push(...match.incentive.stacking_restrictions);
    }
  }

  // Build rationale
  const federalCount = incentives.filter(m => getJurisdictionLevel(m.incentive) === 'federal').length;
  const stateCount = incentives.filter(m => getJurisdictionLevel(m.incentive) === 'state').length;
  const localCount = incentives.filter(m => getJurisdictionLevel(m.incentive) === 'local').length;
  const utilityCount = incentives.filter(m => getJurisdictionLevel(m.incentive) === 'utility').length;

  const levelParts: string[] = [];
  if (federalCount > 0) levelParts.push(`${federalCount} federal`);
  if (stateCount > 0) levelParts.push(`${stateCount} state`);
  if (localCount > 0) levelParts.push(`${localCount} local`);
  if (utilityCount > 0) levelParts.push(`${utilityCount} utility`);

  const rationale = `This stack combines ${levelParts.join(', ')} incentives from different funding sources for a total of $${totalValue.toLocaleString()}. Different jurisdiction levels and incentive types allow these programs to be captured together.`;

  return {
    id: `stack-${groupNumber}`,
    name: `Stacking Opportunity ${groupNumber}`,
    incentives,
    totalValue,
    stackingRationale: rationale,
    restrictions: Array.from(new Set(restrictions)),
    jurisdictionBreakdown,
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummary(
  matches: MatchedIncentive[],
  groups: StackingGroup[],
  exclusivePairs: MutuallyExclusivePair[]
): StackingResult['summary'] {
  const valueByJurisdiction = {
    federal: 0,
    state: 0,
    local: 0,
    utility: 0,
  };

  for (const match of matches) {
    const level = getJurisdictionLevel(match.incentive) as keyof typeof valueByJurisdiction;
    if (level in valueByJurisdiction) {
      valueByJurisdiction[level] += match.estimatedValue;
    }
  }

  // Calculate potential value lost due to exclusivity
  // This is the minimum value among each exclusive pair
  const potentialValueLost = exclusivePairs.reduce((sum, pair) => {
    const minValue = Math.min(pair.incentiveA.estimatedValue, pair.incentiveB.estimatedValue);
    return sum + minValue;
  }, 0);

  // Count stackable incentives (those appearing in at least one group with others)
  const stackableIds = new Set<string>();
  for (const group of groups) {
    if (group.incentives.length > 1) {
      group.incentives.forEach(m => stackableIds.add(m.incentive.id));
    }
  }

  return {
    totalIncentivesAnalyzed: matches.length,
    stackableCount: stackableIds.size,
    mutuallyExclusiveCount: exclusivePairs.length,
    potentialValueLost,
    valueByJurisdiction,
  };
}

/**
 * Create empty result for no matches
 */
function createEmptyResult(): StackingResult {
  return {
    inputMatches: [],
    stackingGroups: [],
    mutuallyExclusivePairs: [],
    optimalStack: null,
    totalCombinedValue: 0,
    iraBonusBreakdowns: [],
    summary: {
      totalIncentivesAnalyzed: 0,
      stackableCount: 0,
      mutuallyExclusiveCount: 0,
      potentialValueLost: 0,
      valueByJurisdiction: {
        federal: 0,
        state: 0,
        local: 0,
        utility: 0,
      },
    },
  };
}

/**
 * Create result for single match
 */
function createSingleMatchResult(
  match: MatchedIncentive,
  bonusOptions: {
    domesticContentEligible: boolean;
    energyCommunityEligible: boolean;
    prevailingWageCommitment: boolean;
  }
): StackingResult {
  const iraBonusBreakdowns: IRABonusBreakdown[] = [];
  const breakdown = calculateIRABonus(
    match,
    bonusOptions.domesticContentEligible,
    bonusOptions.energyCommunityEligible,
    bonusOptions.prevailingWageCommitment
  );
  if (breakdown) {
    iraBonusBreakdowns.push(breakdown);
  }

  const level = getJurisdictionLevel(match.incentive) as 'federal' | 'state' | 'local' | 'utility';
  const valueByJurisdiction = {
    federal: 0,
    state: 0,
    local: 0,
    utility: 0,
  };
  valueByJurisdiction[level] = match.estimatedValue;

  const singleGroup: StackingGroup = {
    id: 'stack-1',
    name: 'Single Incentive',
    incentives: [match],
    totalValue: match.estimatedValue,
    stackingRationale: 'Single incentive - no stacking analysis needed',
    restrictions: match.incentive.stacking_restrictions || [],
    jurisdictionBreakdown: valueByJurisdiction,
  };

  return {
    inputMatches: [match],
    stackingGroups: [singleGroup],
    mutuallyExclusivePairs: [],
    optimalStack: singleGroup,
    totalCombinedValue: match.estimatedValue,
    iraBonusBreakdowns,
    summary: {
      totalIncentivesAnalyzed: 1,
      stackableCount: 0,
      mutuallyExclusiveCount: 0,
      potentialValueLost: 0,
      valueByJurisdiction,
    },
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick check if two incentives can stack
 */
export function canStack(matchA: MatchedIncentive, matchB: MatchedIncentive): boolean {
  return determineStackingCompatibility(matchA, matchB).compatible;
}

/**
 * Get all stacking rules for reference
 */
export function getStackingRules(): {
  jurisdictionRules: StackingRule[];
  incentiveTypeRules: StackingRule[];
} {
  return {
    jurisdictionRules: [...JURISDICTION_STACKING_RULES],
    incentiveTypeRules: [...INCENTIVE_TYPE_STACKING_RULES],
  };
}

/**
 * Check if an incentive is IRA-eligible with bonus adders
 */
export function hasIRABonuses(incentive: IncentiveProgram): boolean {
  return isIRAProgram(incentive);
}
