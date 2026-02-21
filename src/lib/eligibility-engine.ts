// ============================================================================
// INCENTEDGE ELIGIBILITY RULES ENGINE
// Advanced eligibility matching for affordable housing and clean energy deals
// ============================================================================

import type {
  Project,
  IncentiveProgram,
  SustainabilityTier,
  AffordableBreakdown,
  IncentiveCategory,
  SUSTAINABILITY_TIERS,
} from '@/types';

import type {
  RuleCondition,
  ComparisonCondition,
  DateCondition,
  GeographicCondition,
  AffordabilityCondition,
  SustainabilityCondition,
  FinancialCondition,
  EntityCondition,
  TechnologyCondition,
  IraBonusCondition,
  StackingCondition,
  CompositeCondition,
  CustomCondition,
  EligibilityRule,
  ConditionResult,
  MatchBreakdown,
  AppliedBonus,
  ValueBreakdown,
  MatchResult,
  StackingRule,
  StackingAnalysisResult,
  EngineConfig,
  EligibilityInput,
  EligibilityOutput,
  ValueCalculation,
} from '@/types/eligibility';

// ============================================================================
// ENGINE VERSION & CONSTANTS
// ============================================================================

export const ENGINE_VERSION = '2.0.0';

const DEFAULT_CONFIG: EngineConfig = {
  includeInactive: false,
  minScore: 0.4,
  maxResults: 100,
  includeBreakdown: true,
  analyzeStacking: true,
  evaluationDate: new Date(),
};

// Sustainability tier order for comparison
const TIER_ORDER: Record<SustainabilityTier, number> = {
  tier_1_efficient: 1,
  tier_2_high_performance: 2,
  tier_3_net_zero: 3,
  tier_3_triple_net_zero: 4,
};

// Tier incentive multipliers
const TIER_MULTIPLIERS: Record<SustainabilityTier, number> = {
  tier_1_efficient: 1.0,
  tier_2_high_performance: 1.15,
  tier_3_net_zero: 1.30,
  tier_3_triple_net_zero: 1.50,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Parse date string or Date to Date object
 */
function parseDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate affordability percentage from breakdown
 */
function calculateAffordabilityPercentage(
  affordable: number | null,
  total: number | null,
  breakdown?: AffordableBreakdown | null
): number {
  if (total === null || total === 0) return 0;

  if (affordable !== null) {
    return (affordable / total) * 100;
  }

  if (breakdown) {
    const affordableUnits =
      (breakdown.ami_30 || 0) +
      (breakdown.ami_50 || 0) +
      (breakdown.ami_60 || 0) +
      (breakdown.ami_80 || 0);
    return (affordableUnits / total) * 100;
  }

  return 0;
}

// ============================================================================
// COMPUTED VALUES CALCULATOR
// ============================================================================

interface ComputedValues {
  is_affordable_housing: boolean;
  affordability_percentage: number;
  is_energy_community: boolean;
  is_low_income_community: boolean;
  is_distressed_community: boolean;
  cost_per_unit: number;
  cost_per_sqft: number;
  project_age_days: number;
  days_to_start: number;
  days_to_deadline: number;
  sustainability_tier: SustainabilityTier | null;
}

/**
 * Calculate derived/computed values from project data
 */
function calculateComputedValues(
  project: Project,
  program?: IncentiveProgram,
  evaluationDate: Date = new Date()
): ComputedValues {
  const affordabilityPct = calculateAffordabilityPercentage(
    project.affordable_units,
    project.total_units,
    project.affordable_breakdown
  );

  const costPerUnit = project.total_development_cost && project.total_units
    ? project.total_development_cost / project.total_units
    : 0;

  const costPerSqft = project.total_development_cost && project.total_sqft
    ? project.total_development_cost / project.total_sqft
    : 0;

  const createdDate = parseDate(project.created_at);
  const startDate = parseDate(project.estimated_start_date);
  const deadline = program?.application_deadline ? parseDate(program.application_deadline) : null;

  // Infer sustainability tier from certification and energy reduction
  let sustainabilityTier: SustainabilityTier | null = null;
  const cert = project.target_certification?.toLowerCase() || '';
  const energyReduction = project.projected_energy_reduction_pct || 0;

  if (cert.includes('living building') || energyReduction >= 100) {
    sustainabilityTier = 'tier_3_triple_net_zero';
  } else if (cert.includes('passive house') || cert.includes('net zero') || energyReduction >= 80) {
    sustainabilityTier = 'tier_3_net_zero';
  } else if (cert.includes('leed gold') || cert.includes('leed platinum') || energyReduction >= 50) {
    sustainabilityTier = 'tier_2_high_performance';
  } else if (cert.includes('energy star') || energyReduction >= 20) {
    sustainabilityTier = 'tier_1_efficient';
  }

  return {
    is_affordable_housing: affordabilityPct >= 20,
    affordability_percentage: affordabilityPct,
    // These would typically be looked up from external data sources
    is_energy_community: false, // TODO: Implement energy community lookup
    is_low_income_community: false, // TODO: Implement LIHTC QCT lookup
    is_distressed_community: false, // TODO: Implement distressed community lookup
    cost_per_unit: costPerUnit,
    cost_per_sqft: costPerSqft,
    project_age_days: createdDate ? daysBetween(createdDate, evaluationDate) : 0,
    days_to_start: startDate ? daysBetween(evaluationDate, startDate) : 0,
    days_to_deadline: deadline ? daysBetween(evaluationDate, deadline) : 999,
    sustainability_tier: sustainabilityTier,
  };
}

// ============================================================================
// CONDITION EVALUATORS
// ============================================================================

interface EvaluationContext {
  project: Project;
  program: IncentiveProgram;
  computed: ComputedValues;
  config: EngineConfig;
  overrides?: Record<string, unknown>;
}

/**
 * Get field value from context
 */
function getFieldValue(field: string, ctx: EvaluationContext): unknown {
  // Check overrides first
  if (ctx.overrides && field in ctx.overrides) {
    return ctx.overrides[field];
  }

  // Parse field path
  const [prefix, ...rest] = field.split('.');
  const fieldPath = rest.join('.');

  switch (prefix) {
    case 'project':
      return getNestedValue(ctx.project as unknown as Record<string, unknown>, fieldPath);
    case 'program':
      return getNestedValue(ctx.program as unknown as Record<string, unknown>, fieldPath);
    case 'computed':
      return getNestedValue(ctx.computed as unknown as Record<string, unknown>, fieldPath);
    default:
      // Try direct field access on project
      return getNestedValue(ctx.project as unknown as Record<string, unknown>, field);
  }
}

/**
 * Evaluate a comparison condition
 */
function evaluateComparison(
  condition: ComparisonCondition,
  ctx: EvaluationContext
): ConditionResult {
  const actualValue = getFieldValue(condition.field, ctx);
  const expectedValue = condition.value;
  const { operator, valueMax } = condition;

  let passed = false;
  let message = '';

  switch (operator) {
    case 'eq':
      passed = actualValue === expectedValue;
      message = passed
        ? `${condition.field} equals ${expectedValue}`
        : `${condition.field} is ${actualValue}, expected ${expectedValue}`;
      break;

    case 'neq':
      passed = actualValue !== expectedValue;
      message = passed
        ? `${condition.field} does not equal ${expectedValue}`
        : `${condition.field} is ${actualValue}, should not be ${expectedValue}`;
      break;

    case 'gt':
      passed = typeof actualValue === 'number' && actualValue > (expectedValue as number);
      message = passed
        ? `${condition.field} (${actualValue}) is greater than ${expectedValue}`
        : `${condition.field} (${actualValue}) must be greater than ${expectedValue}`;
      break;

    case 'gte':
      passed = typeof actualValue === 'number' && actualValue >= (expectedValue as number);
      message = passed
        ? `${condition.field} (${actualValue}) meets minimum of ${expectedValue}`
        : `${condition.field} (${actualValue}) must be at least ${expectedValue}`;
      break;

    case 'lt':
      passed = typeof actualValue === 'number' && actualValue < (expectedValue as number);
      message = passed
        ? `${condition.field} (${actualValue}) is less than ${expectedValue}`
        : `${condition.field} (${actualValue}) must be less than ${expectedValue}`;
      break;

    case 'lte':
      passed = typeof actualValue === 'number' && actualValue <= (expectedValue as number);
      message = passed
        ? `${condition.field} (${actualValue}) is within maximum of ${expectedValue}`
        : `${condition.field} (${actualValue}) must not exceed ${expectedValue}`;
      break;

    case 'between':
      passed = typeof actualValue === 'number' &&
        actualValue >= (expectedValue as number) &&
        actualValue <= (valueMax as number);
      message = passed
        ? `${condition.field} (${actualValue}) is between ${expectedValue} and ${valueMax}`
        : `${condition.field} (${actualValue}) must be between ${expectedValue} and ${valueMax}`;
      break;

    case 'in':
      passed = Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      message = passed
        ? `${condition.field} (${actualValue}) is in allowed values`
        : `${condition.field} (${actualValue}) is not in allowed values`;
      break;

    case 'not_in':
      passed = Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      message = passed
        ? `${condition.field} (${actualValue}) is not in excluded values`
        : `${condition.field} (${actualValue}) is in excluded values`;
      break;

    case 'contains':
      passed = Array.isArray(actualValue) && actualValue.includes(expectedValue);
      message = passed
        ? `${condition.field} contains ${expectedValue}`
        : `${condition.field} does not contain ${expectedValue}`;
      break;

    case 'not_contains':
      passed = !Array.isArray(actualValue) || !actualValue.includes(expectedValue);
      message = passed
        ? `${condition.field} does not contain ${expectedValue}`
        : `${condition.field} contains excluded value ${expectedValue}`;
      break;

    case 'starts_with':
      passed = typeof actualValue === 'string' &&
        actualValue.startsWith(expectedValue as string);
      message = passed
        ? `${condition.field} starts with ${expectedValue}`
        : `${condition.field} does not start with ${expectedValue}`;
      break;

    case 'ends_with':
      passed = typeof actualValue === 'string' &&
        actualValue.endsWith(expectedValue as string);
      message = passed
        ? `${condition.field} ends with ${expectedValue}`
        : `${condition.field} does not end with ${expectedValue}`;
      break;

    case 'matches':
      passed = typeof actualValue === 'string' &&
        new RegExp(expectedValue as string).test(actualValue);
      message = passed
        ? `${condition.field} matches pattern`
        : `${condition.field} does not match required pattern`;
      break;

    case 'exists':
      passed = actualValue !== null && actualValue !== undefined;
      message = passed
        ? `${condition.field} is provided`
        : `${condition.field} is required but missing`;
      break;

    case 'not_exists':
      passed = actualValue === null || actualValue === undefined;
      message = passed
        ? `${condition.field} is correctly absent`
        : `${condition.field} should not be provided`;
      break;
  }

  return {
    conditionId: condition.id,
    conditionType: 'comparison',
    description: condition.description || `Compare ${condition.field} ${operator} ${expectedValue}`,
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.5,
    actualValue,
    expectedValue,
    message,
  };
}

/**
 * Evaluate a date-based condition
 */
function evaluateDate(
  condition: DateCondition,
  ctx: EvaluationContext
): ConditionResult {
  const evaluationDate = ctx.config.evaluationDate || new Date();
  const actualDate = parseDate(getFieldValue(condition.field, ctx) as string | Date);

  let passed = false;
  let message = '';

  if (condition.operator === 'is_active') {
    // Check if program is currently active
    const startDate = parseDate(ctx.program.start_date);
    const endDate = parseDate(ctx.program.end_date);

    const afterStart = !startDate || evaluationDate >= startDate;
    const beforeEnd = !endDate || evaluationDate <= endDate;
    passed = afterStart && beforeEnd;

    message = passed
      ? 'Program is currently active'
      : 'Program is not active during project timeline';
  } else if (!actualDate) {
    passed = false;
    message = `${condition.field} date is not available`;
  } else {
    const compareDate = condition.value ? parseDate(condition.value) : evaluationDate;

    switch (condition.operator) {
      case 'before':
        passed = compareDate ? actualDate < compareDate : false;
        message = passed
          ? `${condition.field} is before deadline`
          : `${condition.field} is past deadline`;
        break;

      case 'after':
        passed = compareDate ? actualDate > compareDate : false;
        message = passed
          ? `${condition.field} is after required date`
          : `${condition.field} is before required date`;
        break;

      case 'between':
        const maxDate = condition.valueMax ? parseDate(condition.valueMax) : null;
        passed = !!compareDate && !!maxDate && actualDate >= compareDate && actualDate <= maxDate;
        message = passed
          ? `${condition.field} is within valid date range`
          : `${condition.field} is outside valid date range`;
        break;

      case 'within_days':
        const days = condition.relativeDays || 0;
        const diff = Math.abs(daysBetween(actualDate, evaluationDate));
        passed = diff <= days;
        message = passed
          ? `${condition.field} is within ${days} days`
          : `${condition.field} is more than ${days} days away`;
        break;
    }
  }

  return {
    conditionId: condition.id,
    conditionType: 'date',
    description: condition.description || `Date check: ${condition.field} ${condition.operator}`,
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.3,
    actualValue: actualDate?.toISOString(),
    expectedValue: condition.value,
    message,
  };
}

/**
 * Evaluate a geographic condition
 */
function evaluateGeographic(
  condition: GeographicCondition,
  ctx: EvaluationContext
): ConditionResult {
  const { scope, operator, values, allowFederal } = condition;

  // Federal programs match any location
  if (allowFederal && ctx.program.jurisdiction_level === 'federal') {
    return {
      conditionId: condition.id,
      conditionType: 'geographic',
      description: condition.description || 'Federal program - no geographic restriction',
      passed: true,
      required: condition.required ?? true,
      weight: condition.weight ?? 0.8,
      message: 'Federal program applies nationwide',
    };
  }

  // Get project location value for scope
  let projectValue: string | string[] | null = null;
  switch (scope) {
    case 'state':
      projectValue = ctx.project.state;
      break;
    case 'county':
      projectValue = ctx.project.county;
      break;
    case 'city':
      projectValue = ctx.project.city;
      break;
    case 'zip_code':
      projectValue = ctx.project.zip_code;
      break;
    case 'census_tract':
      projectValue = ctx.project.census_tract;
      break;
    case 'utility_territory':
      // Would need to look up utility territory from location
      projectValue = null;
      break;
  }

  let passed = false;
  let message = '';

  if (!projectValue) {
    passed = operator === 'any' || values.length === 0;
    message = passed
      ? `No ${scope} restriction`
      : `Project ${scope} is required but not provided`;
  } else {
    const valueArr = Array.isArray(projectValue) ? projectValue : [projectValue];

    switch (operator) {
      case 'in':
        passed = valueArr.some(v =>
          values.some(allowed => allowed.toLowerCase() === v.toLowerCase())
        );
        message = passed
          ? `Project ${scope} (${projectValue}) is in eligible area`
          : `Project ${scope} (${projectValue}) is not in eligible areas: ${values.join(', ')}`;
        break;

      case 'not_in':
        passed = !valueArr.some(v =>
          values.some(excluded => excluded.toLowerCase() === v.toLowerCase())
        );
        message = passed
          ? `Project ${scope} is not in excluded areas`
          : `Project ${scope} (${projectValue}) is in excluded area`;
        break;

      case 'any':
        passed = true;
        message = 'Any location is eligible';
        break;

      case 'none':
        passed = false;
        message = 'No locations are eligible';
        break;
    }
  }

  return {
    conditionId: condition.id,
    conditionType: 'geographic',
    description: condition.description || `Geographic match: ${scope}`,
    passed,
    required: condition.required ?? true,
    weight: condition.weight ?? 0.8,
    actualValue: projectValue,
    expectedValue: values,
    message,
  };
}

/**
 * Evaluate an affordability condition
 */
function evaluateAffordability(
  condition: AffordabilityCondition,
  ctx: EvaluationContext
): ConditionResult {
  const affordabilityPct = ctx.computed.affordability_percentage;
  const affordableUnits = ctx.project.affordable_units || 0;
  const breakdown = ctx.project.affordable_breakdown;

  const checks: { passed: boolean; message: string }[] = [];

  // Check minimum percentage
  if (condition.minPercentage !== undefined) {
    const passed = affordabilityPct >= condition.minPercentage;
    checks.push({
      passed,
      message: passed
        ? `Affordability (${affordabilityPct.toFixed(1)}%) meets minimum (${condition.minPercentage}%)`
        : `Affordability (${affordabilityPct.toFixed(1)}%) below minimum (${condition.minPercentage}%)`
    });
  }

  // Check maximum percentage
  if (condition.maxPercentage !== undefined) {
    const passed = affordabilityPct <= condition.maxPercentage;
    checks.push({
      passed,
      message: passed
        ? `Affordability (${affordabilityPct.toFixed(1)}%) within maximum (${condition.maxPercentage}%)`
        : `Affordability (${affordabilityPct.toFixed(1)}%) exceeds maximum (${condition.maxPercentage}%)`
    });
  }

  // Check units at specific AMI level
  if (condition.targetAmiLevel !== undefined && condition.minUnitsAtAmi !== undefined && breakdown) {
    let unitsAtAmi = 0;
    if (condition.targetAmiLevel <= 30) unitsAtAmi = breakdown.ami_30 || 0;
    else if (condition.targetAmiLevel <= 50) unitsAtAmi = (breakdown.ami_30 || 0) + (breakdown.ami_50 || 0);
    else if (condition.targetAmiLevel <= 60) unitsAtAmi = (breakdown.ami_30 || 0) + (breakdown.ami_50 || 0) + (breakdown.ami_60 || 0);
    else if (condition.targetAmiLevel <= 80) unitsAtAmi = (breakdown.ami_30 || 0) + (breakdown.ami_50 || 0) + (breakdown.ami_60 || 0) + (breakdown.ami_80 || 0);

    const passed = unitsAtAmi >= condition.minUnitsAtAmi;
    checks.push({
      passed,
      message: passed
        ? `${unitsAtAmi} units at/below ${condition.targetAmiLevel}% AMI meets requirement (${condition.minUnitsAtAmi})`
        : `Only ${unitsAtAmi} units at/below ${condition.targetAmiLevel}% AMI, need ${condition.minUnitsAtAmi}`
    });
  }

  const passed = checks.length === 0 || checks.every(c => c.passed);

  return {
    conditionId: condition.id,
    conditionType: 'affordability',
    description: condition.description || 'Affordability requirements',
    passed,
    required: condition.required ?? true,
    weight: condition.weight ?? 0.9,
    actualValue: { percentage: affordabilityPct, units: affordableUnits },
    expectedValue: { min: condition.minPercentage, max: condition.maxPercentage },
    message: checks.map(c => c.message).join('; ') || 'No affordability requirements',
  };
}

/**
 * Evaluate a sustainability condition
 */
function evaluateSustainability(
  condition: SustainabilityCondition,
  ctx: EvaluationContext
): ConditionResult {
  const projectTier = ctx.computed.sustainability_tier ||
    (ctx.config.sustainabilityTier as SustainabilityTier);
  const projectEnergyReduction = ctx.project.projected_energy_reduction_pct || 0;
  const projectCerts = [ctx.project.target_certification?.toLowerCase()].filter((c): c is string => Boolean(c));
  const projectRenewables = ctx.project.renewable_energy_types || [];

  const checks: { passed: boolean; message: string }[] = [];

  // Check minimum tier
  if (condition.minTier && projectTier) {
    const passed = TIER_ORDER[projectTier] >= TIER_ORDER[condition.minTier];
    checks.push({
      passed,
      message: passed
        ? `Project tier (${projectTier}) meets minimum (${condition.minTier})`
        : `Project tier (${projectTier}) below minimum (${condition.minTier})`
    });
  }

  // Check accepted tiers
  if (condition.acceptedTiers && projectTier) {
    const passed = condition.acceptedTiers.includes(projectTier);
    checks.push({
      passed,
      message: passed
        ? `Project tier (${projectTier}) is accepted`
        : `Project tier (${projectTier}) not in accepted tiers`
    });
  }

  // Check energy reduction
  if (condition.minEnergyReduction !== undefined) {
    const passed = projectEnergyReduction >= condition.minEnergyReduction;
    checks.push({
      passed,
      message: passed
        ? `Energy reduction (${projectEnergyReduction}%) meets minimum (${condition.minEnergyReduction}%)`
        : `Energy reduction (${projectEnergyReduction}%) below minimum (${condition.minEnergyReduction}%)`
    });
  }

  // Check required certifications
  if (condition.requiredCertifications && condition.requiredCertifications.length > 0) {
    const hasRequired = condition.requiredCertifications.some(cert =>
      projectCerts.some(pc => pc.includes(cert.toLowerCase()))
    );
    checks.push({
      passed: hasRequired,
      message: hasRequired
        ? 'Project has required certification'
        : `Missing required certification: ${condition.requiredCertifications.join(' or ')}`
    });
  }

  // Check required renewables
  if (condition.requiredRenewables && condition.requiredRenewables.length > 0) {
    const hasRequired = condition.requiredRenewables.every(renew =>
      projectRenewables.some(pr => pr.toLowerCase().includes(renew.toLowerCase()))
    );
    checks.push({
      passed: hasRequired,
      message: hasRequired
        ? 'Project has required renewable energy systems'
        : `Missing required renewables: ${condition.requiredRenewables.join(', ')}`
    });
  }

  const passed = checks.length === 0 || checks.every(c => c.passed);

  return {
    conditionId: condition.id,
    conditionType: 'sustainability',
    description: condition.description || 'Sustainability requirements',
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.7,
    actualValue: { tier: projectTier, energyReduction: projectEnergyReduction },
    message: checks.map(c => c.message).join('; ') || 'No sustainability requirements',
  };
}

/**
 * Evaluate a financial condition
 */
function evaluateFinancial(
  condition: FinancialCondition,
  ctx: EvaluationContext
): ConditionResult {
  let actualValue: number;

  switch (condition.metric) {
    case 'total_development_cost':
      actualValue = ctx.project.total_development_cost || 0;
      break;
    case 'hard_costs':
      actualValue = ctx.project.hard_costs || 0;
      break;
    case 'soft_costs':
      actualValue = ctx.project.soft_costs || 0;
      break;
    case 'cost_per_unit':
      actualValue = ctx.computed.cost_per_unit;
      break;
    case 'cost_per_sqft':
      actualValue = ctx.computed.cost_per_sqft;
      break;
  }

  const checks: { passed: boolean; message: string }[] = [];

  if (condition.minValue !== undefined) {
    const passed = actualValue >= condition.minValue;
    checks.push({
      passed,
      message: passed
        ? `${condition.metric} (${formatCurrency(actualValue)}) meets minimum (${formatCurrency(condition.minValue)})`
        : `${condition.metric} (${formatCurrency(actualValue)}) below minimum (${formatCurrency(condition.minValue)})`
    });
  }

  if (condition.maxValue !== undefined) {
    const passed = actualValue <= condition.maxValue;
    checks.push({
      passed,
      message: passed
        ? `${condition.metric} (${formatCurrency(actualValue)}) within maximum (${formatCurrency(condition.maxValue)})`
        : `${condition.metric} (${formatCurrency(actualValue)}) exceeds maximum (${formatCurrency(condition.maxValue)})`
    });
  }

  const passed = checks.length === 0 || checks.every(c => c.passed);

  return {
    conditionId: condition.id,
    conditionType: 'financial',
    description: condition.description || `Financial requirement: ${condition.metric}`,
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.5,
    actualValue,
    expectedValue: { min: condition.minValue, max: condition.maxValue },
    message: checks.map(c => c.message).join('; ') || 'No financial requirements',
  };
}

/**
 * Evaluate an entity type condition
 */
function evaluateEntity(
  condition: EntityCondition,
  ctx: EvaluationContext
): ConditionResult {
  // Entity evaluation would typically check organization data
  // For now, assume entity types are compatible
  const passed = true;

  return {
    conditionId: condition.id,
    conditionType: 'entity',
    description: condition.description || 'Entity type requirements',
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.3,
    message: 'Entity type check passed (requires organization data)',
  };
}

/**
 * Evaluate a technology condition
 */
function evaluateTechnology(
  condition: TechnologyCondition,
  ctx: EvaluationContext
): ConditionResult {
  const projectTechTypes = [
    ...(ctx.project.renewable_energy_types || []),
    ctx.project.building_type,
    ctx.project.sector_type,
  ].filter((t): t is string => Boolean(t)).map(t => t.toLowerCase());

  const capacityKw = (ctx.project.capacity_mw || 0) * 1000;

  const checks: { passed: boolean; message: string }[] = [];

  // Check required types
  if (condition.requiredTypes && condition.requiredTypes.length > 0) {
    const hasAll = condition.requiredTypes.every(req =>
      projectTechTypes.some(pt => pt.includes(req.toLowerCase()))
    );
    checks.push({
      passed: hasAll,
      message: hasAll
        ? 'All required technology types present'
        : `Missing required technology: ${condition.requiredTypes.join(', ')}`
    });
  }

  // Check accepted types
  if (condition.acceptedTypes && condition.acceptedTypes.length > 0) {
    const hasOne = condition.acceptedTypes.some(acc =>
      projectTechTypes.some(pt => pt.includes(acc.toLowerCase()))
    );
    checks.push({
      passed: hasOne,
      message: hasOne
        ? 'Project has accepted technology type'
        : `No accepted technology types found`
    });
  }

  // Check excluded types
  if (condition.excludedTypes && condition.excludedTypes.length > 0) {
    const hasExcluded = condition.excludedTypes.some(exc =>
      projectTechTypes.some(pt => pt.includes(exc.toLowerCase()))
    );
    checks.push({
      passed: !hasExcluded,
      message: !hasExcluded
        ? 'No excluded technology types present'
        : `Project has excluded technology type`
    });
  }

  // Check capacity
  if (condition.minCapacityKw !== undefined) {
    const passed = capacityKw >= condition.minCapacityKw;
    checks.push({
      passed,
      message: passed
        ? `Capacity (${capacityKw} kW) meets minimum (${condition.minCapacityKw} kW)`
        : `Capacity (${capacityKw} kW) below minimum (${condition.minCapacityKw} kW)`
    });
  }

  if (condition.maxCapacityKw !== undefined) {
    const passed = capacityKw <= condition.maxCapacityKw;
    checks.push({
      passed,
      message: passed
        ? `Capacity (${capacityKw} kW) within maximum (${condition.maxCapacityKw} kW)`
        : `Capacity (${capacityKw} kW) exceeds maximum (${condition.maxCapacityKw} kW)`
    });
  }

  const passed = checks.length === 0 || checks.every(c => c.passed);

  return {
    conditionId: condition.id,
    conditionType: 'technology',
    description: condition.description || 'Technology requirements',
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.6,
    actualValue: { types: projectTechTypes, capacityKw },
    message: checks.map(c => c.message).join('; ') || 'No technology requirements',
  };
}

/**
 * Evaluate IRA bonus eligibility
 */
function evaluateIraBonus(
  condition: IraBonusCondition,
  ctx: EvaluationContext
): ConditionResult {
  let eligible = false;
  let message = '';

  switch (condition.bonusType) {
    case 'domestic_content':
      eligible = ctx.project.domestic_content_eligible === true;
      message = eligible
        ? `Domestic content bonus eligible (+${condition.bonusPercentage * 100}%)`
        : 'Domestic content commitment not made';
      break;

    case 'energy_community':
      eligible = ctx.computed.is_energy_community;
      message = eligible
        ? `Energy community bonus eligible (+${condition.bonusPercentage * 100}%)`
        : 'Project not in designated energy community';
      break;

    case 'prevailing_wage':
      eligible = ctx.project.prevailing_wage_commitment === true;
      message = eligible
        ? `Prevailing wage bonus eligible (+${condition.bonusPercentage * 100}%)`
        : 'Prevailing wage commitment not made';
      break;

    case 'low_income':
      eligible = ctx.computed.is_low_income_community || ctx.computed.affordability_percentage >= 50;
      message = eligible
        ? `Low-income community bonus eligible (+${condition.bonusPercentage * 100}%)`
        : 'Project not in low-income community';
      break;
  }

  // Evaluate any additional requirements
  if (eligible && condition.requirements && condition.requirements.length > 0) {
    const reqResults = condition.requirements.map(req => evaluateCondition(req, ctx));
    eligible = reqResults.every(r => r.passed);
    if (!eligible) {
      message = 'Bonus requirements not fully met';
    }
  }

  return {
    conditionId: condition.id,
    conditionType: 'ira_bonus',
    description: condition.description || `IRA ${condition.bonusType} bonus`,
    passed: eligible,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.5,
    actualValue: { eligible, bonusType: condition.bonusType },
    expectedValue: { bonusPercentage: condition.bonusPercentage },
    message,
  };
}

/**
 * Evaluate a stacking condition
 */
function evaluateStacking(
  condition: StackingCondition,
  ctx: EvaluationContext
): ConditionResult {
  // Stacking is evaluated separately in the stacking analysis
  // This condition just records the rule for later processing
  return {
    conditionId: condition.id,
    conditionType: 'stacking',
    description: condition.description || `Stacking rule: ${condition.mode}`,
    passed: true, // Stacking conditions are informational
    required: false,
    weight: 0,
    actualValue: { mode: condition.mode },
    message: `Stacking ${condition.mode}: ${condition.programIds?.join(', ') || condition.categories?.join(', ') || 'various programs'}`,
  };
}

/**
 * Evaluate a composite condition (AND/OR/NOT)
 */
function evaluateComposite(
  condition: CompositeCondition,
  ctx: EvaluationContext
): ConditionResult {
  const childResults = condition.conditions.map(child => evaluateCondition(child, ctx));

  let passed: boolean;
  let message: string;

  switch (condition.operator) {
    case 'AND':
      passed = childResults.every(r => r.passed);
      message = passed
        ? 'All conditions met'
        : `Failed conditions: ${childResults.filter(r => !r.passed).map(r => r.description).join(', ')}`;
      break;

    case 'OR':
      passed = childResults.some(r => r.passed);
      message = passed
        ? `Conditions met: ${childResults.filter(r => r.passed).map(r => r.description).join(', ')}`
        : 'No conditions met';
      break;

    case 'NOT':
      // NOT applies to first condition only
      passed = childResults.length > 0 && !childResults[0].passed;
      message = passed
        ? 'Exclusion condition satisfied'
        : 'Exclusion condition not satisfied';
      break;
  }

  return {
    conditionId: condition.id,
    conditionType: 'composite',
    description: condition.description || `${condition.operator} condition group`,
    passed,
    required: condition.required ?? false,
    weight: condition.weight ?? Math.max(...childResults.map(r => r.weight)),
    message,
    children: childResults,
  };
}

/**
 * Evaluate a custom condition
 */
function evaluateCustom(
  condition: CustomCondition,
  ctx: EvaluationContext
): ConditionResult {
  // Custom conditions would need safe evaluation - for now, return true
  // In production, this could use a sandboxed evaluator
  return {
    conditionId: condition.id,
    conditionType: 'custom',
    description: condition.description || 'Custom condition',
    passed: true,
    required: condition.required ?? false,
    weight: condition.weight ?? 0.5,
    message: 'Custom condition evaluation not implemented',
  };
}

/**
 * Main condition evaluator - dispatches to specific evaluators
 */
function evaluateCondition(
  condition: RuleCondition,
  ctx: EvaluationContext
): ConditionResult {
  switch (condition.type) {
    case 'comparison':
      return evaluateComparison(condition, ctx);
    case 'date':
      return evaluateDate(condition, ctx);
    case 'geographic':
      return evaluateGeographic(condition, ctx);
    case 'affordability':
      return evaluateAffordability(condition, ctx);
    case 'sustainability':
      return evaluateSustainability(condition, ctx);
    case 'financial':
      return evaluateFinancial(condition, ctx);
    case 'entity':
      return evaluateEntity(condition, ctx);
    case 'technology':
      return evaluateTechnology(condition, ctx);
    case 'ira_bonus':
      return evaluateIraBonus(condition, ctx);
    case 'stacking':
      return evaluateStacking(condition, ctx);
    case 'composite':
      return evaluateComposite(condition, ctx);
    case 'custom':
      return evaluateCustom(condition, ctx);
    default:
      return {
        conditionType: 'custom',
        description: 'Unknown condition type',
        passed: false,
        required: false,
        weight: 0,
        message: `Unknown condition type: ${(condition as RuleCondition).type}`,
      };
  }
}

// ============================================================================
// VALUE CALCULATION
// ============================================================================

/**
 * Calculate the estimated incentive value
 */
function calculateValue(
  program: IncentiveProgram,
  project: Project,
  ctx: EvaluationContext,
  bonusResults: AppliedBonus[]
): ValueBreakdown {
  const steps: { description: string; operation: string; value: number }[] = [];

  let baseValue = 0;
  let basisValue = 0;
  let basisLabel = '';
  let method: ValueCalculation['method'] = 'fixed';

  // Determine calculation method based on program settings
  if (program.amount_fixed) {
    method = 'fixed';
    baseValue = program.amount_fixed;
    basisValue = 1;
    basisLabel = 'Fixed amount';
    steps.push({
      description: 'Fixed incentive amount',
      operation: 'base',
      value: baseValue,
    });
  } else if (program.amount_percentage && project.total_development_cost) {
    method = 'percentage';
    basisValue = project.total_development_cost;
    basisLabel = 'Total development cost';

    // Handle percentage (could be 0.30 for 30% or 30 for 30%)
    const pct = program.amount_percentage > 1
      ? program.amount_percentage / 100
      : program.amount_percentage;

    baseValue = basisValue * pct;
    steps.push({
      description: `${(pct * 100).toFixed(1)}% of total development cost`,
      operation: `${formatCurrency(basisValue)} × ${(pct * 100).toFixed(1)}%`,
      value: baseValue,
    });
  } else if (program.amount_per_unit && project.total_units) {
    method = 'per_unit';
    basisValue = project.total_units;
    basisLabel = 'Total units';
    baseValue = program.amount_per_unit * basisValue;
    steps.push({
      description: `${formatCurrency(program.amount_per_unit)} per unit`,
      operation: `${formatCurrency(program.amount_per_unit)} × ${basisValue} units`,
      value: baseValue,
    });
  } else if (program.amount_per_kw && project.capacity_mw) {
    method = 'per_kw';
    basisValue = project.capacity_mw * 1000; // Convert MW to kW
    basisLabel = 'System capacity (kW)';
    baseValue = program.amount_per_kw * basisValue;
    steps.push({
      description: `${formatCurrency(program.amount_per_kw)}/kW`,
      operation: `${formatCurrency(program.amount_per_kw)} × ${basisValue.toLocaleString()} kW`,
      value: baseValue,
    });
  } else if (program.amount_max) {
    // Fall back to estimate at 50% of max
    method = 'fixed';
    baseValue = program.amount_max * 0.5;
    basisValue = program.amount_max;
    basisLabel = 'Maximum amount (estimated at 50%)';
    steps.push({
      description: 'Estimated at 50% of maximum',
      operation: `${formatCurrency(program.amount_max)} × 50%`,
      value: baseValue,
    });
  }

  // Apply sustainability tier multiplier
  const tier = ctx.computed.sustainability_tier || ctx.config.sustainabilityTier;
  if (tier && TIER_MULTIPLIERS[tier] > 1) {
    const multiplier = TIER_MULTIPLIERS[tier];
    const tierBonus = baseValue * (multiplier - 1);
    baseValue = baseValue * multiplier;
    steps.push({
      description: `Sustainability tier bonus (${tier})`,
      operation: `× ${(multiplier * 100).toFixed(0)}%`,
      value: tierBonus,
    });
  }

  // Apply IRA bonuses
  let totalBonusAmount = 0;
  const appliedBonuses: AppliedBonus[] = [];

  for (const bonus of bonusResults) {
    if (bonus.eligible) {
      const bonusAmount = baseValue * bonus.percentage;
      totalBonusAmount += bonusAmount;

      appliedBonuses.push({
        ...bonus,
        amount: bonusAmount,
      });

      steps.push({
        description: bonus.name,
        operation: `+ ${(bonus.percentage * 100).toFixed(0)}%`,
        value: bonusAmount,
      });
    } else {
      appliedBonuses.push({
        ...bonus,
        amount: 0,
      });
    }
  }

  let finalValue = baseValue + totalBonusAmount;

  // Apply minimum
  if (program.amount_min && finalValue < program.amount_min) {
    finalValue = program.amount_min;
    steps.push({
      description: 'Applied minimum amount',
      operation: `min(${formatCurrency(program.amount_min)})`,
      value: finalValue,
    });
  }

  // Apply maximum cap
  if (program.amount_max && finalValue > program.amount_max) {
    const capped = finalValue;
    finalValue = program.amount_max;
    steps.push({
      description: 'Applied maximum cap',
      operation: `cap(${formatCurrency(program.amount_max)})`,
      value: program.amount_max,
    });
  }

  // Calculate confidence based on how much data we have
  let confidence = 0.5;
  if (project.total_development_cost) confidence += 0.15;
  if (project.total_units) confidence += 0.1;
  if (project.capacity_mw) confidence += 0.1;
  if (program.amount_fixed || program.amount_percentage) confidence += 0.1;
  confidence = Math.min(confidence, 0.95);

  // Calculate value range
  const valueLow = finalValue * (0.9 - (1 - confidence) * 0.3);
  const valueHigh = finalValue * (1.1 + (1 - confidence) * 0.3);

  return {
    method,
    baseValue,
    basisValue,
    basisLabel,
    bonuses: appliedBonuses,
    totalBonusAmount,
    finalValue,
    confidence,
    valueLow,
    valueHigh,
    steps,
  };
}

// ============================================================================
// PROGRAM MATCHING
// ============================================================================

/**
 * Build default rules from program configuration
 */
function buildDefaultRules(program: IncentiveProgram): RuleCondition[] {
  const conditions: RuleCondition[] = [];

  // Geographic rules
  if (program.state || program.counties.length > 0 || program.municipalities.length > 0) {
    if (program.state) {
      conditions.push({
        type: 'geographic',
        scope: 'state',
        operator: 'in',
        values: [program.state],
        allowFederal: program.jurisdiction_level === 'federal',
        required: true,
        weight: 0.9,
        description: `State eligibility: ${program.state}`,
      });
    }

    if (program.counties.length > 0) {
      conditions.push({
        type: 'geographic',
        scope: 'county',
        operator: 'in',
        values: program.counties,
        required: true,
        weight: 0.85,
        description: `County eligibility: ${program.counties.join(', ')}`,
      });
    }
  } else if (program.jurisdiction_level === 'federal') {
    conditions.push({
      type: 'geographic',
      scope: 'state',
      operator: 'any',
      values: [],
      allowFederal: true,
      required: true,
      weight: 0.9,
      description: 'Federal program - nationwide eligibility',
    });
  }

  // Sector type
  if (program.sector_types && program.sector_types.length > 0) {
    conditions.push({
      type: 'comparison',
      field: 'project.sector_type',
      operator: 'in',
      value: program.sector_types,
      required: true,
      weight: 0.8,
      description: `Sector eligibility: ${program.sector_types.join(', ')}`,
    });
  }

  // Building type
  if (program.building_types && program.building_types.length > 0) {
    conditions.push({
      type: 'comparison',
      field: 'project.building_type',
      operator: 'in',
      value: program.building_types,
      required: false,
      weight: 0.6,
      description: `Building type: ${program.building_types.join(', ')}`,
    });
  }

  // Technology types
  if (program.technology_types && program.technology_types.length > 0) {
    conditions.push({
      type: 'technology',
      acceptedTypes: program.technology_types,
      required: false,
      weight: 0.7,
      description: `Technology types: ${program.technology_types.join(', ')}`,
    });
  }

  // Date rules
  conditions.push({
    type: 'date',
    field: 'program.status',
    operator: 'is_active',
    required: true,
    weight: 1.0,
    description: 'Program is currently active',
  });

  if (program.application_deadline) {
    conditions.push({
      type: 'date',
      field: 'program.application_deadline',
      operator: 'after',
      value: new Date().toISOString(),
      required: true,
      weight: 0.95,
      description: 'Application deadline has not passed',
    });
  }

  return conditions;
}

/**
 * Build bonus conditions from program data
 */
function buildBonusConditions(program: IncentiveProgram): IraBonusCondition[] {
  const bonuses: IraBonusCondition[] = [];

  if (program.domestic_content_bonus) {
    bonuses.push({
      type: 'ira_bonus',
      bonusType: 'domestic_content',
      bonusPercentage: program.domestic_content_bonus,
      description: 'Domestic Content Bonus',
    });
  }

  if (program.energy_community_bonus) {
    bonuses.push({
      type: 'ira_bonus',
      bonusType: 'energy_community',
      bonusPercentage: program.energy_community_bonus,
      description: 'Energy Community Bonus',
    });
  }

  if (program.prevailing_wage_bonus) {
    bonuses.push({
      type: 'ira_bonus',
      bonusType: 'prevailing_wage',
      bonusPercentage: program.prevailing_wage_bonus,
      description: 'Prevailing Wage Bonus',
    });
  }

  return bonuses;
}

/**
 * Evaluate a single program against a project
 */
function evaluateProgram(
  program: IncentiveProgram,
  project: Project,
  config: EngineConfig
): MatchResult {
  const startTime = Date.now();

  // Calculate computed values
  const computed = calculateComputedValues(project, program, config.evaluationDate);

  // Build evaluation context
  const ctx: EvaluationContext = {
    project,
    program,
    computed,
    config,
  };

  // Get or build rules
  const conditions = buildDefaultRules(program);
  const bonusConditions = buildBonusConditions(program);

  // Evaluate all conditions
  const conditionResults: ConditionResult[] = conditions.map(c => evaluateCondition(c, ctx));

  // Evaluate bonus conditions
  const bonusResults: AppliedBonus[] = bonusConditions.map(bonus => {
    const result = evaluateCondition(bonus, ctx);
    return {
      type: bonus.bonusType,
      name: bonus.description || bonus.bonusType,
      percentage: bonus.bonusPercentage,
      amount: 0, // Calculated later
      eligible: result.passed,
      reason: result.message,
    };
  });

  // Calculate match breakdown
  const requiredConditions = conditionResults.filter(r => r.required);
  const optionalConditions = conditionResults.filter(r => !r.required);

  const requiredPassed = requiredConditions.filter(r => r.passed).length;
  const requiredFailed = requiredConditions.filter(r => !r.passed).length;
  const optionalPassed = optionalConditions.filter(r => r.passed).length;

  // Calculate weighted score
  const totalWeight = conditionResults.reduce((sum, r) => sum + r.weight, 0);
  const passedWeight = conditionResults.filter(r => r.passed).reduce((sum, r) => sum + r.weight, 0);
  const weightedScore = totalWeight > 0 ? passedWeight / totalWeight : 0;

  // Determine if qualified (all required conditions must pass)
  const qualified = requiredFailed === 0;

  // Collect disqualifying reasons
  const disqualifyingReasons = conditionResults
    .filter(r => r.required && !r.passed)
    .map(r => r.message);

  // Generate warnings
  const warnings = conditionResults
    .filter(r => !r.required && !r.passed && r.weight >= 0.5)
    .map(r => r.message);

  // Generate suggestions
  const suggestions: string[] = [];
  if (!project.domestic_content_eligible && program.domestic_content_bonus) {
    suggestions.push(`Consider domestic content commitment for +${(program.domestic_content_bonus * 100).toFixed(0)}% bonus`);
  }
  if (!project.prevailing_wage_commitment && program.prevailing_wage_bonus) {
    suggestions.push(`Consider prevailing wage commitment for +${(program.prevailing_wage_bonus * 100).toFixed(0)}% bonus`);
  }

  const eligibilityBreakdown: MatchBreakdown = {
    conditions: conditionResults,
    requiredPassed,
    requiredFailed,
    optionalPassed,
    totalConditions: conditionResults.length,
    weightedScore,
    disqualifyingReasons,
    warnings,
    suggestions,
  };

  // Calculate value
  const valueBreakdown = calculateValue(program, project, ctx, bonusResults);

  // Calculate scores
  const overallScore = qualified ? Math.round(weightedScore * 100) : Math.round(weightedScore * 40);
  const probabilityScore = qualified ? Math.min(0.95, weightedScore * 0.85 + 0.1) : weightedScore * 0.3;
  const relevanceScore = weightedScore;

  // Determine recommendation tier
  let recommendationTier: 'high' | 'medium' | 'low' | 'explore';
  if (!qualified) {
    recommendationTier = 'explore';
  } else if (overallScore >= 80 && valueBreakdown.finalValue > 100000) {
    recommendationTier = 'high';
  } else if (overallScore >= 60) {
    recommendationTier = 'medium';
  } else {
    recommendationTier = 'low';
  }

  return {
    programId: program.id,
    programName: program.name,
    category: program.category,
    qualified,
    overallScore,
    probabilityScore,
    relevanceScore,
    eligibilityBreakdown,
    valueBreakdown,
    estimatedValue: valueBreakdown.finalValue,
    estimatedValueLow: valueBreakdown.valueLow,
    estimatedValueHigh: valueBreakdown.valueHigh,
    stackingAnalysis: {
      compatible: [],
      incompatible: [],
      reduces: [],
      requires: [],
    },
    recommendationTier,
    evaluatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// STACKING ANALYSIS
// ============================================================================

/**
 * Analyze stacking compatibility between matched programs
 */
function analyzeStacking(
  matches: MatchResult[],
  programs: IncentiveProgram[]
): StackingAnalysisResult {
  const conflicts: string[] = [];
  const adjustedValues: { programId: string; originalValue: number; adjustedValue: number; reductionApplied: number; reason?: string }[] = [];

  // Map programs by ID for quick lookup
  const programMap = new Map(programs.map(p => [p.id, p]));

  // Default stacking rules
  const stackingRules: StackingRule[] = [
    // Federal tax credits generally stack with everything
    {
      id: 'federal-stacks',
      name: 'Federal tax credits stack with state/local',
      sourceCategory: 'federal',
      ruleType: 'allow',
      priority: 100,
      active: true,
    },
    // Same-source grants may not stack
    {
      id: 'same-source-reduction',
      name: 'Same funding source reduction',
      sourceCategory: 'federal',
      targetCategory: 'federal',
      ruleType: 'reduce',
      reductionPercentage: 0.3,
      priority: 50,
      active: true,
    },
  ];

  // Check each program for stacking restrictions
  for (const match of matches) {
    const program = programMap.get(match.programId);
    if (!program) continue;

    let adjustedValue = match.estimatedValue;
    let totalReduction = 0;

    // Check stacking restrictions from program
    if (program.stacking_restrictions && program.stacking_restrictions.length > 0) {
      for (const restriction of program.stacking_restrictions) {
        // Check if any conflicting program is in matches
        const conflicting = matches.find(m =>
          m.programId !== match.programId &&
          (restriction.includes(m.programId) || restriction.includes(m.programName))
        );

        if (conflicting) {
          conflicts.push(`${program.name} may have stacking restrictions with ${conflicting.programName}`);
        }
      }
    }

    // Apply category-based stacking rules
    for (const otherMatch of matches) {
      if (otherMatch.programId === match.programId) continue;

      const otherProgram = programMap.get(otherMatch.programId);
      if (!otherProgram) continue;

      // Same-source federal programs may reduce each other
      if (program.category === 'federal' && otherProgram.category === 'federal') {
        if (program.incentive_type === 'grant' && otherProgram.incentive_type === 'grant') {
          // Federal grants from same agency may not fully stack
          totalReduction = Math.max(totalReduction, 0.2);
        }
      }

      // Track compatible programs
      match.stackingAnalysis.compatible.push(otherMatch.programId);
    }

    adjustedValue = adjustedValue * (1 - totalReduction);

    adjustedValues.push({
      programId: match.programId,
      originalValue: match.estimatedValue,
      adjustedValue,
      reductionApplied: totalReduction,
      reason: totalReduction > 0 ? 'Stacking reduction applied' : undefined,
    });
  }

  // Calculate combined value
  const combinedValue = adjustedValues.reduce((sum, av) => sum + av.adjustedValue, 0);

  // Determine recommended order (highest value first)
  const recommendedOrder = matches
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .map(m => m.programId);

  return {
    canStack: conflicts.length === 0 || conflicts.every(c => c.includes('may have')),
    combinedValue,
    adjustedValues,
    appliedRules: stackingRules.filter(r => r.active),
    conflicts,
    recommendedOrder,
  };
}

// ============================================================================
// MAIN ENGINE
// ============================================================================

/**
 * Main eligibility engine function
 */
export async function evaluateEligibility(
  input: EligibilityInput
): Promise<EligibilityOutput> {
  const startTime = Date.now();
  const config = { ...DEFAULT_CONFIG, ...input.config };

  const { project, programs = [] } = input;

  // Evaluate each program
  const matches: MatchResult[] = [];

  for (const program of programs) {
    // Skip inactive programs unless configured otherwise
    if (!config.includeInactive && program.status !== 'active') {
      continue;
    }

    try {
      const result = evaluateProgram(program, project, config);

      // Filter by minimum score
      if (result.overallScore >= (config.minScore || 0) * 100 || result.qualified) {
        matches.push(result);
      }
    } catch (error) {
      console.error(`Error evaluating program ${program.id}:`, error);
    }
  }

  // Sort by estimated value (descending)
  matches.sort((a, b) => b.estimatedValue - a.estimatedValue);

  // Assign priority ranks
  matches.forEach((match, index) => {
    match.priorityRank = index + 1;
  });

  // Limit results
  const limitedMatches = matches.slice(0, config.maxResults || 100);

  // Analyze stacking if enabled
  let stackingResult: StackingAnalysisResult | null = null;
  if (config.analyzeStacking && limitedMatches.length > 1) {
    stackingResult = analyzeStacking(limitedMatches, programs);
  }

  // Group by category
  const byCategory: Record<IncentiveCategory, MatchResult[]> = {
    federal: limitedMatches.filter(m => m.category === 'federal'),
    state: limitedMatches.filter(m => m.category === 'state'),
    local: limitedMatches.filter(m => m.category === 'local'),
    utility: limitedMatches.filter(m => m.category === 'utility'),
  };

  // Calculate totals
  const valueByCategory: Record<IncentiveCategory, number> = {
    federal: byCategory.federal.reduce((sum, m) => sum + m.estimatedValue, 0),
    state: byCategory.state.reduce((sum, m) => sum + m.estimatedValue, 0),
    local: byCategory.local.reduce((sum, m) => sum + m.estimatedValue, 0),
    utility: byCategory.utility.reduce((sum, m) => sum + m.estimatedValue, 0),
  };

  const totalPotentialValue = limitedMatches.reduce((sum, m) => sum + m.estimatedValue, 0);
  const optimizedTotalValue = stackingResult?.combinedValue || totalPotentialValue;

  // Determine recommended stack
  const qualifiedMatches = limitedMatches.filter(m => m.qualified);
  const recommendedStack = {
    programs: qualifiedMatches.slice(0, 5),
    totalValue: qualifiedMatches.slice(0, 5).reduce((sum, m) => sum + m.estimatedValue, 0),
    reason: qualifiedMatches.length > 0
      ? `Top ${Math.min(5, qualifiedMatches.length)} programs by estimated value`
      : 'No qualified programs found',
  };

  // Calculate summary
  const summary = {
    totalProgramsEvaluated: programs.length,
    totalQualified: qualifiedMatches.length,
    totalDisqualified: limitedMatches.length - qualifiedMatches.length,
    averageScore: limitedMatches.length > 0
      ? limitedMatches.reduce((sum, m) => sum + m.overallScore, 0) / limitedMatches.length
      : 0,
    highConfidenceMatches: qualifiedMatches.filter(m => m.probabilityScore >= 0.7).length,
  };

  const durationMs = Date.now() - startTime;

  return {
    projectId: project.id,
    projectName: project.name,
    matches: limitedMatches,
    byCategory,
    totalPotentialValue,
    valueByCategory,
    optimizedTotalValue,
    recommendedStack,
    summary,
    meta: {
      evaluatedAt: new Date().toISOString(),
      engineVersion: ENGINE_VERSION,
      config,
      durationMs,
    },
  };
}

// ============================================================================
// HELPER EXPORTS
// ============================================================================

export {
  calculateComputedValues,
  evaluateCondition,
  buildDefaultRules,
  buildBonusConditions,
  analyzeStacking,
  TIER_ORDER,
  TIER_MULTIPLIERS,
};

// ============================================================================
// RULE TEMPLATES FOR COMMON SCENARIOS
// ============================================================================

export const RULE_TEMPLATES = {
  /** LIHTC 9% eligibility */
  lihtc9Percent: {
    id: 'lihtc-9-percent',
    name: 'LIHTC 9% Competitive',
    description: '9% LIHTC for affordable housing',
    conditions: [
      {
        type: 'affordability' as const,
        minPercentage: 40,
        targetAmiLevel: 60,
        required: true,
        weight: 1.0,
      },
      {
        type: 'comparison' as const,
        field: 'project.construction_type',
        operator: 'in' as const,
        value: ['new-construction', 'substantial-rehab'],
        required: true,
        weight: 0.9,
      },
    ],
  },

  /** IRA Section 48 ITC */
  section48Itc: {
    id: 'ira-48-itc',
    name: 'IRA Section 48 ITC',
    description: 'Investment Tax Credit for clean energy',
    conditions: [
      {
        type: 'technology' as const,
        acceptedTypes: ['solar', 'battery', 'geothermal', 'fuel-cell', 'wind'],
        required: true,
        weight: 1.0,
      },
      {
        type: 'comparison' as const,
        field: 'project.sector_type',
        operator: 'in' as const,
        value: ['clean-energy', 'real-estate'],
        required: true,
        weight: 0.8,
      },
    ],
    bonuses: [
      { type: 'ira_bonus' as const, bonusType: 'domestic_content' as const, bonusPercentage: 0.10 },
      { type: 'ira_bonus' as const, bonusType: 'energy_community' as const, bonusPercentage: 0.10 },
      { type: 'ira_bonus' as const, bonusType: 'prevailing_wage' as const, bonusPercentage: 0.10 },
    ],
  },

  /** NYSERDA programs */
  nyserdaMultifamily: {
    id: 'nyserda-mf',
    name: 'NYSERDA Multifamily',
    description: 'NYSERDA programs for NY multifamily',
    conditions: [
      {
        type: 'geographic' as const,
        scope: 'state' as const,
        operator: 'in' as const,
        values: ['NY'],
        required: true,
        weight: 1.0,
      },
      {
        type: 'comparison' as const,
        field: 'project.building_type',
        operator: 'in' as const,
        value: ['multifamily', 'mixed-use'],
        required: true,
        weight: 0.9,
      },
      {
        type: 'comparison' as const,
        field: 'project.total_units',
        operator: 'gte' as const,
        value: 5,
        required: true,
        weight: 0.8,
      },
    ],
  },
};
