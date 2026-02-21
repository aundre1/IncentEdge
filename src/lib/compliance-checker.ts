/**
 * Compliance Checker Library for IncentEdge
 *
 * Provides comprehensive compliance checking for IRA and incentive requirements:
 * - Prevailing wage requirements verification
 * - Domestic content percentage calculation
 * - Energy community eligibility (census tract lookup)
 * - Low-income community bonus eligibility
 * - Apprenticeship requirement tracking
 * - Overall compliance score calculation
 */

import type {
  PrevailingWageRecord,
  DomesticContentRecord,
  ApprenticeshipRecord,
  EnergyCommunityEligibility,
  LowIncomeCommunityEligibility,
  ProjectComplianceItem,
  ComplianceDocument,
  ComplianceCertification,
  PrevailingWageCheckResult,
  DomesticContentCheckResult,
  EnergyCommunityCheckResult,
  LowIncomeCommunityCheckResult,
  ApprenticeshipCheckResult,
  ComplianceScoreResult,
  ComplianceStatus,
  PrevailingWageSummary,
  DomesticContentSummary,
  ApprenticeshipSummary,
  LowIncomeCommunityCategory,
} from '@/types/compliance';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * IRA Domestic Content thresholds by year
 * Steel/Iron must be 100% US for all years
 * Manufactured products threshold increases over time
 */
export const DOMESTIC_CONTENT_THRESHOLDS: Record<number, { manufactured: number; steel_iron: number }> = {
  2024: { manufactured: 40, steel_iron: 100 },
  2025: { manufactured: 45, steel_iron: 100 },
  2026: { manufactured: 50, steel_iron: 100 },
  2027: { manufactured: 55, steel_iron: 100 },
  2028: { manufactured: 55, steel_iron: 100 },
};

/**
 * Apprenticeship ratio requirements by year
 * Started at 12.5% in 2023, increased to 15% in 2024+
 */
export const APPRENTICESHIP_RATIOS: Record<number, number> = {
  2023: 0.125,
  2024: 0.15,
  2025: 0.15,
  2026: 0.15,
};

/**
 * IRA Bonus percentages
 */
export const IRA_BONUSES = {
  PREVAILING_WAGE: 0.30, // 5x multiplier (6% to 30%)
  DOMESTIC_CONTENT: 0.10, // Additional 10%
  ENERGY_COMMUNITY: 0.10, // Additional 10%
  LOW_INCOME_COMMUNITY_BASE: 0.10, // Categories 1 & 2
  LOW_INCOME_COMMUNITY_ENHANCED: 0.20, // Categories 3 & 4
};

// ============================================================================
// PREVAILING WAGE CHECKER
// ============================================================================

/**
 * Check prevailing wage compliance for a project
 */
export function checkPrevailingWageCompliance(
  records: PrevailingWageRecord[]
): PrevailingWageCheckResult {
  if (records.length === 0) {
    return {
      is_compliant: false,
      compliance_percentage: 0,
      total_records: 0,
      compliant_records: 0,
      non_compliant_records: 0,
      total_hours: 0,
      issues: [],
      recommendations: ['No prevailing wage records found. Submit certified payroll records to demonstrate compliance.'],
    };
  }

  const compliantRecords = records.filter(r => r.is_compliant);
  const nonCompliantRecords = records.filter(r => !r.is_compliant);
  const totalHours = records.reduce((sum, r) => sum + r.total_hours, 0);

  const issues = nonCompliantRecords.map(record => ({
    record_id: record.id,
    contractor: record.contractor_name,
    classification: record.labor_classification,
    paid_rate: record.total_hourly_rate,
    required_rate: record.prevailing_wage_rate,
    shortfall: record.prevailing_wage_rate - record.total_hourly_rate,
  }));

  const compliancePercentage = (compliantRecords.length / records.length) * 100;
  const isCompliant = compliancePercentage === 100;

  const recommendations: string[] = [];
  if (!isCompliant) {
    recommendations.push(`${nonCompliantRecords.length} wage record(s) are below prevailing wage rates.`);
    recommendations.push('Work with contractors to ensure all workers receive at least the prevailing wage rate.');
    recommendations.push('Consider wage adjustments or back-pay to bring non-compliant records into compliance.');
  }

  // Check for unverified records
  const unverifiedRecords = records.filter(r => !r.verified);
  if (unverifiedRecords.length > 0) {
    recommendations.push(`${unverifiedRecords.length} record(s) pending verification. Submit certified payroll for review.`);
  }

  // Check for missing certified payroll
  const missingPayroll = records.filter(r => !r.certified_payroll_submitted);
  if (missingPayroll.length > 0) {
    recommendations.push(`${missingPayroll.length} record(s) missing certified payroll documentation.`);
  }

  return {
    is_compliant: isCompliant,
    compliance_percentage: Math.round(compliancePercentage * 100) / 100,
    total_records: records.length,
    compliant_records: compliantRecords.length,
    non_compliant_records: nonCompliantRecords.length,
    total_hours: totalHours,
    issues,
    recommendations,
  };
}

/**
 * Calculate prevailing wage summary statistics
 */
export function calculatePrevailingWageSummary(
  records: PrevailingWageRecord[]
): PrevailingWageSummary {
  const uniqueContractors = Array.from(new Set(records.map(r => r.contractor_name)));

  return {
    total_records: records.length,
    compliant_records: records.filter(r => r.is_compliant).length,
    non_compliant_records: records.filter(r => !r.is_compliant).length,
    verified_records: records.filter(r => r.verified).length,
    unverified_records: records.filter(r => !r.verified).length,
    total_hours: records.reduce((sum, r) => sum + r.total_hours, 0),
    total_wages_paid: records.reduce((sum, r) => sum + (r.total_compensation || 0), 0),
    compliance_rate: records.length > 0
      ? Math.round((records.filter(r => r.is_compliant).length / records.length) * 10000) / 100
      : 0,
    contractors: uniqueContractors,
  };
}

// ============================================================================
// DOMESTIC CONTENT CHECKER
// ============================================================================

/**
 * Get the applicable domestic content threshold for a given year
 */
export function getDomesticContentThreshold(year: number): { manufactured: number; steel_iron: number } {
  // Default to 2024 for years before, latest year for years after
  if (year < 2024) return DOMESTIC_CONTENT_THRESHOLDS[2024];
  if (year > 2028) return DOMESTIC_CONTENT_THRESHOLDS[2028];
  return DOMESTIC_CONTENT_THRESHOLDS[year] || DOMESTIC_CONTENT_THRESHOLDS[2024];
}

/**
 * Calculate domestic content percentage for a project
 */
export function calculateDomesticContentPercentage(
  records: DomesticContentRecord[]
): DomesticContentSummary {
  if (records.length === 0) {
    return {
      total_components: 0,
      us_manufactured_count: 0,
      foreign_manufactured_count: 0,
      total_cost: 0,
      us_content_cost: 0,
      foreign_content_cost: 0,
      overall_us_percentage: 0,
      steel_iron_compliant: false,
      manufactured_products_compliant: false,
      meets_ira_threshold: false,
      applicable_threshold: 40,
    };
  }

  const currentYear = new Date().getFullYear();
  const threshold = getDomesticContentThreshold(currentYear);

  // Separate steel/iron from manufactured products
  const steelIronRecords = records.filter(r =>
    r.component_type === 'steel' || r.component_type === 'iron'
  );
  const manufacturedRecords = records.filter(r =>
    r.component_type !== 'steel' && r.component_type !== 'iron'
  );

  // Calculate steel/iron compliance (must be 100% US)
  const steelIronTotalCost = steelIronRecords.reduce((sum, r) => sum + r.total_component_cost, 0);
  const steelIronUSCost = steelIronRecords.reduce((sum, r) => sum + (r.us_content_cost || 0), 0);
  const steelIronUSPercentage = steelIronTotalCost > 0
    ? (steelIronUSCost / steelIronTotalCost) * 100
    : 100;
  const steelIronCompliant = steelIronRecords.length === 0 || steelIronUSPercentage >= threshold.steel_iron;

  // Calculate manufactured products compliance
  const manufacturedTotalCost = manufacturedRecords.reduce((sum, r) => sum + r.total_component_cost, 0);
  const manufacturedUSCost = manufacturedRecords.reduce((sum, r) => sum + (r.us_content_cost || 0), 0);
  const manufacturedUSPercentage = manufacturedTotalCost > 0
    ? (manufacturedUSCost / manufacturedTotalCost) * 100
    : 0;
  const manufacturedCompliant = manufacturedUSPercentage >= threshold.manufactured;

  // Overall totals
  const totalCost = records.reduce((sum, r) => sum + r.total_component_cost, 0);
  const usContentCost = records.reduce((sum, r) => sum + (r.us_content_cost || 0), 0);
  const foreignContentCost = records.reduce((sum, r) => sum + (r.foreign_content_cost || 0), 0);
  const overallPercentage = totalCost > 0 ? (usContentCost / totalCost) * 100 : 0;

  return {
    total_components: records.length,
    us_manufactured_count: records.filter(r => r.is_us_manufactured).length,
    foreign_manufactured_count: records.filter(r => !r.is_us_manufactured).length,
    total_cost: totalCost,
    us_content_cost: usContentCost,
    foreign_content_cost: foreignContentCost,
    overall_us_percentage: Math.round(overallPercentage * 100) / 100,
    steel_iron_compliant: steelIronCompliant,
    manufactured_products_compliant: manufacturedCompliant,
    meets_ira_threshold: steelIronCompliant && manufacturedCompliant,
    applicable_threshold: threshold.manufactured,
  };
}

/**
 * Check domestic content compliance for a project
 */
export function checkDomesticContentCompliance(
  records: DomesticContentRecord[],
  projectYear?: number
): DomesticContentCheckResult {
  const year = projectYear || new Date().getFullYear();
  const threshold = getDomesticContentThreshold(year);
  const summary = calculateDomesticContentPercentage(records);

  const issues: { component_id: string; component_name: string; issue: string }[] = [];
  const recommendations: string[] = [];

  // Check for foreign steel/iron
  const foreignSteelIron = records.filter(r =>
    (r.component_type === 'steel' || r.component_type === 'iron') &&
    !r.is_us_manufactured
  );
  foreignSteelIron.forEach(r => {
    issues.push({
      component_id: r.id,
      component_name: r.component_name,
      issue: 'Steel/iron component not US manufactured. All steel and iron must be melted and poured in the US.',
    });
  });

  // Check for unverified components
  const unverified = records.filter(r => !r.verified);
  if (unverified.length > 0) {
    recommendations.push(`${unverified.length} component(s) pending verification. Obtain manufacturer certifications.`);
  }

  // Check for missing manufacturer certifications
  const missingCerts = records.filter(r => !r.manufacturer_certification_received);
  if (missingCerts.length > 0) {
    recommendations.push(`${missingCerts.length} component(s) missing manufacturer certification.`);
  }

  // Recommendations based on compliance status
  if (!summary.steel_iron_compliant) {
    recommendations.push('All steel and iron must be US melted and poured. Source from domestic suppliers or apply for a waiver.');
  }
  if (!summary.manufactured_products_compliant) {
    recommendations.push(`Manufactured products US content (${summary.overall_us_percentage}%) is below the ${threshold.manufactured}% threshold.`);
    recommendations.push('Consider substituting foreign components with domestic alternatives.');
  }

  return {
    meets_steel_iron_requirement: summary.steel_iron_compliant,
    meets_manufactured_products_requirement: summary.manufactured_products_compliant,
    overall_compliant: summary.meets_ira_threshold,
    steel_iron_percentage: summary.steel_iron_compliant ? 100 : 0,
    manufactured_products_percentage: summary.overall_us_percentage,
    applicable_threshold: threshold.manufactured,
    threshold_year: year,
    components_summary: {
      total: summary.total_components,
      us_manufactured: summary.us_manufactured_count,
      foreign_manufactured: summary.foreign_manufactured_count,
      unverified: unverified.length,
    },
    issues,
    recommendations,
  };
}

// ============================================================================
// ENERGY COMMUNITY CHECKER
// ============================================================================

/**
 * Energy Community census tract data structure
 * In production, this would be fetched from a database or API
 */
interface EnergyCommunityData {
  census_tract: string;
  state: string;
  is_brownfield: boolean;
  in_statistical_area: boolean;
  statistical_area_type: string | null;
  fossil_fuel_employment_met: boolean;
  unemployment_met: boolean;
  coal_closure_met: boolean;
}

/**
 * Known energy community census tracts (sample data)
 * In production, this would query the IRS energy community database
 */
const SAMPLE_ENERGY_COMMUNITIES: EnergyCommunityData[] = [
  // Example Appalachian coal communities
  { census_tract: '54039010100', state: 'WV', is_brownfield: false, in_statistical_area: true, statistical_area_type: 'non-MSA', fossil_fuel_employment_met: true, unemployment_met: true, coal_closure_met: true },
  { census_tract: '21195970100', state: 'KY', is_brownfield: false, in_statistical_area: true, statistical_area_type: 'non-MSA', fossil_fuel_employment_met: true, unemployment_met: true, coal_closure_met: true },
  // Example Texas oil/gas communities
  { census_tract: '48135950100', state: 'TX', is_brownfield: false, in_statistical_area: true, statistical_area_type: 'MSA', fossil_fuel_employment_met: true, unemployment_met: false, coal_closure_met: false },
];

/**
 * Check if a census tract is in an energy community
 */
export function checkEnergyCommunityEligibility(
  censusTract: string,
  state: string,
  additionalData?: {
    is_brownfield?: boolean;
    brownfield_documentation?: string;
  }
): EnergyCommunityCheckResult {
  // Check for brownfield (this would need EPA brownfield database lookup)
  if (additionalData?.is_brownfield && additionalData?.brownfield_documentation) {
    return {
      is_eligible: true,
      eligibility_category: 'brownfield',
      census_tract: censusTract,
      brownfield_eligible: true,
      statistical_area_eligible: false,
      coal_closure_eligible: false,
      bonus_percentage: IRA_BONUSES.ENERGY_COMMUNITY,
      data_source: 'User-provided brownfield documentation',
      verification_date: new Date().toISOString(),
    };
  }

  // Look up census tract in energy community database
  const communityData = SAMPLE_ENERGY_COMMUNITIES.find(
    ec => ec.census_tract === censusTract && ec.state === state
  );

  if (communityData) {
    let category = 'statistical_area_fossil_fuel';
    if (communityData.coal_closure_met) {
      category = 'coal_closure';
    }

    return {
      is_eligible: true,
      eligibility_category: category,
      census_tract: censusTract,
      brownfield_eligible: communityData.is_brownfield,
      statistical_area_eligible: communityData.in_statistical_area && communityData.fossil_fuel_employment_met,
      coal_closure_eligible: communityData.coal_closure_met,
      bonus_percentage: IRA_BONUSES.ENERGY_COMMUNITY,
      data_source: 'IRS Energy Community Database',
      verification_date: new Date().toISOString(),
    };
  }

  // Not found in database - would need manual verification
  return {
    is_eligible: false,
    eligibility_category: null,
    census_tract: censusTract,
    brownfield_eligible: false,
    statistical_area_eligible: false,
    coal_closure_eligible: false,
    bonus_percentage: 0,
    data_source: 'Census tract not found in energy community database',
    verification_date: new Date().toISOString(),
  };
}

/**
 * Lookup energy community status using coordinates
 * This would typically call the Census Bureau API for tract lookup
 */
export async function lookupEnergyCommunityByLocation(
  latitude: number,
  longitude: number,
  state: string
): Promise<EnergyCommunityCheckResult> {
  // In production, this would:
  // 1. Call Census Bureau geocoding API to get census tract
  // 2. Query IRS energy community database
  // 3. Return eligibility result

  // Placeholder implementation
  return {
    is_eligible: false,
    eligibility_category: null,
    census_tract: 'unknown',
    brownfield_eligible: false,
    statistical_area_eligible: false,
    coal_closure_eligible: false,
    bonus_percentage: 0,
    data_source: 'Geocoding lookup not implemented',
    verification_date: new Date().toISOString(),
  };
}

// ============================================================================
// LOW-INCOME COMMUNITY CHECKER
// ============================================================================

/**
 * Check low-income community eligibility for a project
 */
export function checkLowIncomeCommunityEligibility(
  censusTract: string,
  state: string,
  projectData?: {
    is_indian_land?: boolean;
    tribal_name?: string;
    affordable_housing_percentage?: number;
    is_economic_benefit_project?: boolean;
    economic_benefit_type?: string;
  }
): LowIncomeCommunityCheckResult {
  // Category 2: Indian Land
  if (projectData?.is_indian_land && projectData?.tribal_name) {
    return {
      is_eligible: true,
      category: 'category_2',
      category_description: 'Project located on Indian land',
      census_tract: censusTract,
      bonus_percentage: IRA_BONUSES.LOW_INCOME_COMMUNITY_BASE,
      requires_allocation: true,
      allocation_status: 'pending',
    };
  }

  // Category 3: Qualified Low-Income Residential Building
  if (projectData?.affordable_housing_percentage && projectData.affordable_housing_percentage >= 50) {
    return {
      is_eligible: true,
      category: 'category_3',
      category_description: 'Qualified low-income residential building project',
      census_tract: censusTract,
      bonus_percentage: IRA_BONUSES.LOW_INCOME_COMMUNITY_ENHANCED,
      requires_allocation: true,
      allocation_status: 'pending',
    };
  }

  // Category 4: Economic Benefit Project
  if (projectData?.is_economic_benefit_project) {
    return {
      is_eligible: true,
      category: 'category_4',
      category_description: 'Qualified low-income economic benefit project',
      census_tract: censusTract,
      bonus_percentage: IRA_BONUSES.LOW_INCOME_COMMUNITY_ENHANCED,
      requires_allocation: true,
      allocation_status: 'pending',
    };
  }

  // Category 1: Located in Low-Income Community
  // Would need to look up census tract poverty/income data
  // This is a placeholder - real implementation would query CIMS data
  const isLowIncomeTract = checkIfLowIncomeTract(censusTract, state);

  if (isLowIncomeTract) {
    return {
      is_eligible: true,
      category: 'category_1',
      category_description: 'Project located in a low-income community',
      census_tract: censusTract,
      bonus_percentage: IRA_BONUSES.LOW_INCOME_COMMUNITY_BASE,
      requires_allocation: true,
      allocation_status: 'pending',
    };
  }

  return {
    is_eligible: false,
    category: null,
    category_description: null,
    census_tract: censusTract,
    bonus_percentage: 0,
    requires_allocation: false,
    allocation_status: null,
  };
}

/**
 * Check if census tract qualifies as low-income
 * In production, would query CDFI Fund data
 */
function checkIfLowIncomeTract(censusTract: string, state: string): boolean {
  // Placeholder - would query actual CIMS database
  // Low-income communities are defined as having:
  // - Poverty rate >= 20%, OR
  // - Median family income <= 80% of area/state median
  return false;
}

// ============================================================================
// APPRENTICESHIP CHECKER
// ============================================================================

/**
 * Get required apprenticeship ratio for a given year
 */
export function getRequiredApprenticeshipRatio(year: number): number {
  if (year < 2024) return APPRENTICESHIP_RATIOS[2023];
  return APPRENTICESHIP_RATIOS[year] || APPRENTICESHIP_RATIOS[2026];
}

/**
 * Calculate apprenticeship summary statistics
 */
export function calculateApprenticeshipSummary(
  records: ApprenticeshipRecord[]
): ApprenticeshipSummary {
  const currentYear = new Date().getFullYear();
  const requiredRatio = getRequiredApprenticeshipRatio(currentYear);

  const totalLaborHours = records.reduce((sum, r) => sum + r.total_labor_hours, 0);
  const totalApprenticeHours = records.reduce((sum, r) => sum + r.apprentice_hours, 0);
  const overallRatio = totalLaborHours > 0 ? totalApprenticeHours / totalLaborHours : 0;
  const uniquePrograms = Array.from(new Set(records.map(r => r.program_name)));

  return {
    total_records: records.length,
    compliant_records: records.filter(r => r.ratio_compliant).length,
    non_compliant_records: records.filter(r => !r.ratio_compliant).length,
    total_labor_hours: totalLaborHours,
    total_apprentice_hours: totalApprenticeHours,
    overall_ratio: Math.round(overallRatio * 10000) / 100, // Convert to percentage
    required_ratio: requiredRatio * 100,
    is_compliant: overallRatio >= requiredRatio,
    programs: uniquePrograms,
  };
}

/**
 * Check apprenticeship compliance for a project
 */
export function checkApprenticeshipCompliance(
  records: ApprenticeshipRecord[],
  projectYear?: number
): ApprenticeshipCheckResult {
  const year = projectYear || new Date().getFullYear();
  const requiredRatio = getRequiredApprenticeshipRatio(year);
  const summary = calculateApprenticeshipSummary(records);

  const shortfallHours = summary.is_compliant
    ? 0
    : (summary.total_labor_hours * requiredRatio) - summary.total_apprentice_hours;

  const recommendations: string[] = [];

  if (!summary.is_compliant) {
    recommendations.push(
      `Current apprentice ratio (${summary.overall_ratio}%) is below the required ${summary.required_ratio}% threshold.`
    );
    recommendations.push(
      `Need approximately ${Math.ceil(shortfallHours)} additional apprentice hours to meet requirement.`
    );
    recommendations.push(
      'Consider engaging with registered apprenticeship programs to increase apprentice utilization.'
    );
  }

  // Check for DOL-approved programs
  const nonApprovedPrograms = records.filter(r => !r.dol_approved);
  if (nonApprovedPrograms.length > 0) {
    recommendations.push(
      `${nonApprovedPrograms.length} apprenticeship program(s) not DOL-approved. Ensure all programs are registered.`
    );
  }

  // Good faith effort option
  const canClaimGoodFaith = !summary.is_compliant && shortfallHours < summary.total_labor_hours * 0.05;

  return {
    is_compliant: summary.is_compliant,
    current_ratio: summary.overall_ratio / 100,
    required_ratio: requiredRatio,
    total_labor_hours: summary.total_labor_hours,
    apprentice_hours: summary.total_apprentice_hours,
    shortfall_hours: Math.max(0, shortfallHours),
    good_faith_effort_available: canClaimGoodFaith,
    programs: summary.programs,
    recommendations,
  };
}

// ============================================================================
// OVERALL COMPLIANCE SCORE CALCULATOR
// ============================================================================

/**
 * Calculate weight for each compliance category
 */
const CATEGORY_WEIGHTS = {
  prevailing_wage: 0.30,
  domestic_content: 0.25,
  apprenticeship: 0.15,
  documentation: 0.15,
  certifications: 0.15,
};

/**
 * Calculate overall compliance score for a project
 */
export function calculateComplianceScore(
  complianceItems: ProjectComplianceItem[],
  prevailingWageRecords: PrevailingWageRecord[],
  domesticContentRecords: DomesticContentRecord[],
  apprenticeshipRecords: ApprenticeshipRecord[],
  documents: ComplianceDocument[],
  certifications: ComplianceCertification[],
  projectBaseValue: number,
  options?: {
    energyCommunityEligible?: boolean;
    lowIncomeEligible?: boolean;
    lowIncomeCategory?: LowIncomeCommunityCategory;
  }
): ComplianceScoreResult {
  // Calculate individual category scores
  const pwCheck = checkPrevailingWageCompliance(prevailingWageRecords);
  const dcCheck = checkDomesticContentCompliance(domesticContentRecords);
  const appCheck = checkApprenticeshipCompliance(apprenticeshipRecords);

  // Documentation score
  const approvedDocs = documents.filter(d => d.review_status === 'approved').length;
  const documentationScore = documents.length > 0
    ? (approvedDocs / documents.length) * 100
    : 0;

  // Certifications score
  const activeCerts = certifications.filter(c => c.status === 'active').length;
  const certificationsScore = certifications.length > 0
    ? (activeCerts / certifications.length) * 100
    : 0;

  // Calculate weighted overall score
  const categoryScores = {
    prevailing_wage: pwCheck.compliance_percentage,
    domestic_content: dcCheck.overall_compliant ? 100 : dcCheck.manufactured_products_percentage,
    apprenticeship: appCheck.is_compliant ? 100 : (appCheck.current_ratio / appCheck.required_ratio) * 100,
    documentation: documentationScore,
    certifications: certificationsScore,
  };

  const overallScore = Math.round(
    (categoryScores.prevailing_wage * CATEGORY_WEIGHTS.prevailing_wage) +
    (categoryScores.domestic_content * CATEGORY_WEIGHTS.domestic_content) +
    (categoryScores.apprenticeship * CATEGORY_WEIGHTS.apprenticeship) +
    (categoryScores.documentation * CATEGORY_WEIGHTS.documentation) +
    (categoryScores.certifications * CATEGORY_WEIGHTS.certifications)
  );

  // Calculate bonus values
  const prevailingWageBonusValue = projectBaseValue * IRA_BONUSES.PREVAILING_WAGE;
  const domesticContentBonusValue = projectBaseValue * IRA_BONUSES.DOMESTIC_CONTENT;
  const energyCommunityBonusValue = projectBaseValue * IRA_BONUSES.ENERGY_COMMUNITY;
  const lowIncomeBonusPercentage = options?.lowIncomeCategory === 'category_3' || options?.lowIncomeCategory === 'category_4'
    ? IRA_BONUSES.LOW_INCOME_COMMUNITY_ENHANCED
    : IRA_BONUSES.LOW_INCOME_COMMUNITY_BASE;
  const lowIncomeBonusValue = projectBaseValue * lowIncomeBonusPercentage;

  // Determine bonus status
  const pwBonusSecured = pwCheck.is_compliant && appCheck.is_compliant;
  const dcBonusSecured = dcCheck.overall_compliant;
  const ecBonusSecured = options?.energyCommunityEligible ?? false;
  const licBonusSecured = options?.lowIncomeEligible ?? false;

  const bonusStatus = {
    prevailing_wage_bonus: {
      eligible: prevailingWageRecords.length > 0,
      secured: pwBonusSecured,
      value: prevailingWageBonusValue,
    },
    domestic_content_bonus: {
      eligible: domesticContentRecords.length > 0,
      secured: dcBonusSecured,
      value: domesticContentBonusValue,
    },
    energy_community_bonus: {
      eligible: options?.energyCommunityEligible ?? false,
      secured: ecBonusSecured,
      value: energyCommunityBonusValue,
    },
    low_income_bonus: {
      eligible: options?.lowIncomeEligible ?? false,
      secured: licBonusSecured,
      value: lowIncomeBonusValue,
    },
  };

  // Calculate total bonus amounts
  const totalPotentialBonus =
    (bonusStatus.prevailing_wage_bonus.eligible ? prevailingWageBonusValue : 0) +
    (bonusStatus.domestic_content_bonus.eligible ? domesticContentBonusValue : 0) +
    (bonusStatus.energy_community_bonus.eligible ? energyCommunityBonusValue : 0) +
    (bonusStatus.low_income_bonus.eligible ? lowIncomeBonusValue : 0);

  const securedBonus =
    (pwBonusSecured ? prevailingWageBonusValue : 0) +
    (dcBonusSecured ? domesticContentBonusValue : 0) +
    (ecBonusSecured ? energyCommunityBonusValue : 0) +
    (licBonusSecured ? lowIncomeBonusValue : 0);

  const atRiskBonus = totalPotentialBonus - securedBonus;

  // Identify risk factors
  const riskFactors: string[] = [];
  if (!pwCheck.is_compliant) {
    riskFactors.push('Prevailing wage compliance issues detected');
  }
  if (!appCheck.is_compliant) {
    riskFactors.push('Apprenticeship ratio below required threshold');
  }
  if (!dcCheck.overall_compliant) {
    riskFactors.push('Domestic content requirements not met');
  }
  if (documents.filter(d => d.review_status === 'rejected').length > 0) {
    riskFactors.push('Some compliance documents have been rejected');
  }

  // Generate recommendations
  const recommendations: string[] = [
    ...pwCheck.recommendations,
    ...dcCheck.recommendations,
    ...appCheck.recommendations,
  ];

  if (riskFactors.length === 0) {
    recommendations.push('All IRA bonus requirements are being met. Continue monitoring compliance.');
  }

  return {
    overall_score: Math.min(100, Math.max(0, overallScore)),
    category_scores: {
      prevailing_wage: Math.round(categoryScores.prevailing_wage),
      domestic_content: Math.round(categoryScores.domestic_content),
      apprenticeship: Math.round(categoryScores.apprenticeship),
      documentation: Math.round(categoryScores.documentation),
      certifications: Math.round(categoryScores.certifications),
    },
    bonus_status: bonusStatus,
    total_potential_bonus: totalPotentialBonus,
    secured_bonus: securedBonus,
    at_risk_bonus: atRiskBonus,
    risk_factors: riskFactors,
    recommendations: recommendations.slice(0, 10), // Limit to top 10 recommendations
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status color for UI display
 */
export function getComplianceStatusColor(status: ComplianceStatus): string {
  const colors: Record<ComplianceStatus, string> = {
    not_started: 'gray',
    in_progress: 'blue',
    pending_review: 'yellow',
    verified: 'green',
    non_compliant: 'red',
    waived: 'purple',
    expired: 'orange',
  };
  return colors[status] || 'gray';
}

/**
 * Calculate days until due
 */
export function getDaysUntilDue(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine priority based on days until due and current status
 */
export function calculatePriority(
  daysUntilDue: number | null,
  status: ComplianceStatus
): 'low' | 'medium' | 'high' | 'critical' {
  if (status === 'non_compliant') return 'critical';
  if (status === 'verified' || status === 'waived') return 'low';

  if (daysUntilDue === null) return 'medium';
  if (daysUntilDue < 0) return 'critical'; // Past due
  if (daysUntilDue <= 7) return 'critical';
  if (daysUntilDue <= 30) return 'high';
  if (daysUntilDue <= 90) return 'medium';
  return 'low';
}

/**
 * Format currency value
 */
export function formatBonusValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
