// ============================================================================
// ELIGIBILITY RULES ENGINE TYPES
// Advanced types for the IncentEdge eligibility matching system
// ============================================================================

import type {
  Project,
  IncentiveProgram,
  SustainabilityTier,
  SectorType,
  IncentiveCategory
} from './index';

// ============================================================================
// RULE CONDITION TYPES
// ============================================================================

/** Supported comparison operators */
export type ComparisonOperator =
  | 'eq'        // equals
  | 'neq'       // not equals
  | 'gt'        // greater than
  | 'gte'       // greater than or equal
  | 'lt'        // less than
  | 'lte'       // less than or equal
  | 'between'   // between min and max (inclusive)
  | 'in'        // value in array
  | 'not_in'    // value not in array
  | 'contains'  // array contains value
  | 'not_contains' // array does not contain value
  | 'starts_with'  // string starts with
  | 'ends_with'    // string ends with
  | 'matches'      // regex match
  | 'exists'       // field exists and is not null
  | 'not_exists';  // field is null or undefined

/** Logical operators for combining conditions */
export type LogicalOperator = 'AND' | 'OR' | 'NOT';

/** Field paths that can be evaluated */
export type EvaluableField =
  // Project fields
  | 'project.state'
  | 'project.county'
  | 'project.city'
  | 'project.zip_code'
  | 'project.census_tract'
  | 'project.sector_type'
  | 'project.building_type'
  | 'project.construction_type'
  | 'project.total_units'
  | 'project.affordable_units'
  | 'project.affordable_percentage'
  | 'project.total_sqft'
  | 'project.capacity_mw'
  | 'project.total_development_cost'
  | 'project.hard_costs'
  | 'project.soft_costs'
  | 'project.target_certification'
  | 'project.renewable_energy_types'
  | 'project.projected_energy_reduction_pct'
  | 'project.domestic_content_eligible'
  | 'project.prevailing_wage_commitment'
  | 'project.estimated_start_date'
  | 'project.estimated_completion_date'
  | 'project.sustainability_tier'
  // Program fields
  | 'program.status'
  | 'program.start_date'
  | 'program.end_date'
  | 'program.application_deadline'
  // Computed fields
  | 'computed.is_affordable_housing'
  | 'computed.affordability_percentage'
  | 'computed.is_energy_community'
  | 'computed.is_low_income_community'
  | 'computed.is_distressed_community'
  | 'computed.cost_per_unit'
  | 'computed.cost_per_sqft'
  | 'computed.project_age_days'
  | 'computed.days_to_start'
  | 'computed.days_to_deadline';

/** Base condition interface */
export interface BaseCondition {
  id?: string;
  description?: string;
  weight?: number; // 0-1, importance of this condition for scoring
  required?: boolean; // If true, failure means disqualification
}

/** Simple comparison condition */
export interface ComparisonCondition extends BaseCondition {
  type: 'comparison';
  field: EvaluableField | string;
  operator: ComparisonOperator;
  value: unknown;
  valueMax?: unknown; // For 'between' operator
}

/** Date-based condition */
export interface DateCondition extends BaseCondition {
  type: 'date';
  field: EvaluableField | string;
  operator: 'before' | 'after' | 'between' | 'within_days' | 'is_active';
  value?: string | Date;
  valueMax?: string | Date;
  relativeDays?: number; // For 'within_days'
  referenceDate?: 'today' | 'project_start' | 'project_completion';
}

/** Geographic condition */
export interface GeographicCondition extends BaseCondition {
  type: 'geographic';
  scope: 'state' | 'county' | 'city' | 'zip_code' | 'census_tract' | 'utility_territory';
  operator: 'in' | 'not_in' | 'any' | 'none';
  values: string[];
  /** If true, federal programs match all locations */
  allowFederal?: boolean;
}

/** Affordability condition */
export interface AffordabilityCondition extends BaseCondition {
  type: 'affordability';
  minPercentage?: number;
  maxPercentage?: number;
  targetAmiLevel?: number; // e.g., 80 for 80% AMI
  minUnitsAtAmi?: number;
  requireLihtc?: boolean;
}

/** Energy/sustainability condition */
export interface SustainabilityCondition extends BaseCondition {
  type: 'sustainability';
  minTier?: SustainabilityTier;
  acceptedTiers?: SustainabilityTier[];
  minEnergyReduction?: number;
  requiredCertifications?: string[];
  requiredRenewables?: string[];
}

/** Financial condition */
export interface FinancialCondition extends BaseCondition {
  type: 'financial';
  metric: 'total_development_cost' | 'hard_costs' | 'soft_costs' | 'cost_per_unit' | 'cost_per_sqft';
  minValue?: number;
  maxValue?: number;
}

/** Entity type condition (who can apply) */
export interface EntityCondition extends BaseCondition {
  type: 'entity';
  allowedTypes: string[];
  requireNonprofit?: boolean;
  requireMwbe?: boolean;
  requireSdvob?: boolean;
  requireSam?: boolean;
}

/** Technology/project type condition */
export interface TechnologyCondition extends BaseCondition {
  type: 'technology';
  requiredTypes?: string[];
  acceptedTypes?: string[];
  excludedTypes?: string[];
  minCapacityKw?: number;
  maxCapacityKw?: number;
}

/** IRA bonus condition */
export interface IraBonusCondition extends BaseCondition {
  type: 'ira_bonus';
  bonusType: 'domestic_content' | 'energy_community' | 'prevailing_wage' | 'low_income';
  bonusPercentage: number;
  /** Additional requirements for this bonus */
  requirements?: RuleCondition[];
}

/** Stacking rule condition */
export interface StackingCondition extends BaseCondition {
  type: 'stacking';
  mode: 'compatible' | 'incompatible' | 'requires' | 'reduces';
  programIds?: string[];
  programTypes?: string[];
  categories?: IncentiveCategory[];
  reductionPercentage?: number; // For 'reduces' mode
}

/** Composite condition with logical operators */
export interface CompositeCondition extends BaseCondition {
  type: 'composite';
  operator: LogicalOperator;
  conditions: RuleCondition[];
}

/** Custom condition with JavaScript evaluator */
export interface CustomCondition extends BaseCondition {
  type: 'custom';
  evaluator: string; // Serialized function or expression
  context?: Record<string, unknown>;
}

/** Union of all condition types */
export type RuleCondition =
  | ComparisonCondition
  | DateCondition
  | GeographicCondition
  | AffordabilityCondition
  | SustainabilityCondition
  | FinancialCondition
  | EntityCondition
  | TechnologyCondition
  | IraBonusCondition
  | StackingCondition
  | CompositeCondition
  | CustomCondition;

// ============================================================================
// ELIGIBILITY RULE
// ============================================================================

/** Complete eligibility rule definition */
export interface EligibilityRule {
  id: string;
  name: string;
  description?: string;
  /** Program this rule belongs to */
  programId: string;
  /** Rule version for tracking changes */
  version: number;
  /** Priority when multiple rules exist */
  priority: number;
  /** Is this rule currently active */
  active: boolean;
  /** Root condition (typically a composite AND) */
  condition: RuleCondition;
  /** Value calculation rules */
  valueCalculation?: ValueCalculation;
  /** Bonus adders applicable */
  bonuses?: IraBonusCondition[];
  /** Stacking rules */
  stackingRules?: StackingCondition[];
  /** Metadata */
  createdAt: string;
  updatedAt: string;
}

/** Value calculation configuration */
export interface ValueCalculation {
  /** Base calculation method */
  method: 'fixed' | 'percentage' | 'per_unit' | 'per_kw' | 'per_sqft' | 'tiered' | 'formula';
  /** Base amount for fixed/percentage */
  baseAmount?: number;
  /** Percentage for percentage-based */
  percentage?: number;
  /** Rate for per-unit calculations */
  rate?: number;
  /** Minimum value */
  minValue?: number;
  /** Maximum value */
  maxValue?: number;
  /** Tiered calculation */
  tiers?: {
    threshold: number;
    rate: number;
    basis: 'units' | 'sqft' | 'cost' | 'kw';
  }[];
  /** Custom formula (e.g., 'cost * 0.30 * efficiency_multiplier') */
  formula?: string;
  /** Fields to apply calculation to */
  basisField?: EvaluableField | string;
}

// ============================================================================
// MATCH RESULTS
// ============================================================================

/** Result of evaluating a single condition */
export interface ConditionResult {
  conditionId?: string;
  conditionType: RuleCondition['type'];
  description: string;
  passed: boolean;
  required: boolean;
  weight: number;
  /** Actual value found */
  actualValue?: unknown;
  /** Expected value(s) */
  expectedValue?: unknown;
  /** Human-readable explanation */
  message: string;
  /** Nested results for composite conditions */
  children?: ConditionResult[];
}

/** Detailed breakdown of why a program matched or didn't */
export interface MatchBreakdown {
  /** All condition evaluations */
  conditions: ConditionResult[];
  /** Required conditions that passed */
  requiredPassed: number;
  /** Required conditions that failed */
  requiredFailed: number;
  /** Optional conditions that passed */
  optionalPassed: number;
  /** Total conditions evaluated */
  totalConditions: number;
  /** Weighted score (0-1) */
  weightedScore: number;
  /** Critical failures that disqualify */
  disqualifyingReasons: string[];
  /** Warnings (non-blocking issues) */
  warnings: string[];
  /** Suggestions for improving eligibility */
  suggestions: string[];
}

/** Applied bonus breakdown */
export interface AppliedBonus {
  type: IraBonusCondition['bonusType'];
  name: string;
  percentage: number;
  amount: number;
  eligible: boolean;
  reason?: string;
}

/** Value calculation breakdown */
export interface ValueBreakdown {
  /** Calculation method used */
  method: ValueCalculation['method'];
  /** Base value before bonuses */
  baseValue: number;
  /** Basis used (e.g., total cost, units) */
  basisValue: number;
  basisLabel: string;
  /** Applied bonuses */
  bonuses: AppliedBonus[];
  /** Total bonus amount */
  totalBonusAmount: number;
  /** Final calculated value */
  finalValue: number;
  /** Confidence in calculation (0-1) */
  confidence: number;
  /** Value range */
  valueLow: number;
  valueHigh: number;
  /** Calculation steps for transparency */
  steps: {
    description: string;
    operation: string;
    value: number;
  }[];
}

/** Complete match result for a program */
export interface MatchResult {
  /** Program being evaluated */
  programId: string;
  programName: string;
  category: IncentiveCategory;
  /** Did the project qualify */
  qualified: boolean;
  /** Overall match score (0-100) */
  overallScore: number;
  /** Probability of approval (0-1) */
  probabilityScore: number;
  /** Relevance to project goals (0-1) */
  relevanceScore: number;
  /** Detailed eligibility breakdown */
  eligibilityBreakdown: MatchBreakdown;
  /** Value calculation details */
  valueBreakdown: ValueBreakdown;
  /** Final estimated value */
  estimatedValue: number;
  estimatedValueLow: number;
  estimatedValueHigh: number;
  /** Stacking analysis */
  stackingAnalysis: {
    compatible: string[];
    incompatible: string[];
    reduces: { programId: string; reductionPercent: number }[];
    requires: string[];
  };
  /** Priority rank among matches */
  priorityRank?: number;
  /** Recommendation tier */
  recommendationTier: 'high' | 'medium' | 'low' | 'explore';
  /** Timestamp */
  evaluatedAt: string;
}

// ============================================================================
// STACKING RULES
// ============================================================================

/** Rule defining how programs can be combined */
export interface StackingRule {
  id: string;
  name: string;
  description?: string;
  /** Source program(s) */
  sourceProgramIds?: string[];
  sourceCategory?: IncentiveCategory;
  sourceType?: string;
  /** Target program(s) affected by this rule */
  targetProgramIds?: string[];
  targetCategory?: IncentiveCategory;
  targetType?: string;
  /** Rule type */
  ruleType: 'allow' | 'deny' | 'reduce' | 'require' | 'conditional';
  /** For 'reduce' type, percentage to reduce */
  reductionPercentage?: number;
  /** Condition that must be true for rule to apply */
  condition?: RuleCondition;
  /** Priority (higher = evaluated first) */
  priority: number;
  /** Effective dates */
  effectiveFrom?: string;
  effectiveUntil?: string;
  /** Is rule active */
  active: boolean;
}

/** Result of stacking analysis between programs */
export interface StackingAnalysisResult {
  /** Can these programs be combined */
  canStack: boolean;
  /** Total combined value */
  combinedValue: number;
  /** Individual program values after stacking adjustments */
  adjustedValues: {
    programId: string;
    originalValue: number;
    adjustedValue: number;
    reductionApplied: number;
    reason?: string;
  }[];
  /** Rules that were applied */
  appliedRules: StackingRule[];
  /** Any conflicts or warnings */
  conflicts: string[];
  /** Optimal stacking order */
  recommendedOrder: string[];
}

// ============================================================================
// ENGINE CONFIGURATION
// ============================================================================

/** Configuration for the eligibility engine */
export interface EngineConfig {
  /** Include inactive programs */
  includeInactive?: boolean;
  /** Minimum score to include in results */
  minScore?: number;
  /** Maximum results to return */
  maxResults?: number;
  /** Include detailed breakdown */
  includeBreakdown?: boolean;
  /** Run stacking analysis */
  analyzeStacking?: boolean;
  /** Custom date for date-based rules (default: now) */
  evaluationDate?: Date;
  /** Sustainability tier to evaluate */
  sustainabilityTier?: SustainabilityTier;
  /** Additional context for evaluation */
  context?: Record<string, unknown>;
}

/** Input to the eligibility engine */
export interface EligibilityInput {
  project: Project;
  programs?: IncentiveProgram[];
  config?: EngineConfig;
  /** Override computed values */
  computedOverrides?: Partial<Record<string, unknown>>;
}

/** Output from the eligibility engine */
export interface EligibilityOutput {
  /** Project that was evaluated */
  projectId: string;
  projectName: string;
  /** All match results */
  matches: MatchResult[];
  /** Programs grouped by category */
  byCategory: Record<IncentiveCategory, MatchResult[]>;
  /** Total potential value */
  totalPotentialValue: number;
  /** Value by category */
  valueByCategory: Record<IncentiveCategory, number>;
  /** Stacking-optimized total (accounting for incompatibilities) */
  optimizedTotalValue: number;
  /** Recommended program combination */
  recommendedStack: {
    programs: MatchResult[];
    totalValue: number;
    reason: string;
  };
  /** Summary statistics */
  summary: {
    totalProgramsEvaluated: number;
    totalQualified: number;
    totalDisqualified: number;
    averageScore: number;
    highConfidenceMatches: number;
  };
  /** Engine metadata */
  meta: {
    evaluatedAt: string;
    engineVersion: string;
    config: EngineConfig;
    durationMs: number;
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/** Type guard for condition types */
export type ConditionTypeMap = {
  comparison: ComparisonCondition;
  date: DateCondition;
  geographic: GeographicCondition;
  affordability: AffordabilityCondition;
  sustainability: SustainabilityCondition;
  financial: FinancialCondition;
  entity: EntityCondition;
  technology: TechnologyCondition;
  ira_bonus: IraBonusCondition;
  stacking: StackingCondition;
  composite: CompositeCondition;
  custom: CustomCondition;
};

/** Utility type for condition type checking */
export function isConditionType<T extends RuleCondition['type']>(
  condition: RuleCondition,
  type: T
): condition is ConditionTypeMap[T] {
  return condition.type === type;
}

/** Pre-built rule templates for common scenarios */
export interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: 'federal' | 'state' | 'affordability' | 'energy' | 'geographic';
  condition: RuleCondition;
  valueCalculation?: ValueCalculation;
}

/** Audit log entry for eligibility evaluation */
export interface EligibilityAuditEntry {
  id: string;
  projectId: string;
  evaluatedAt: string;
  triggeredBy: 'user' | 'system' | 'schedule';
  userId?: string;
  config: EngineConfig;
  resultsCount: number;
  totalValue: number;
  durationMs: number;
  errors?: string[];
}
