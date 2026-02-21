// Compliance Tracking Types for IncentEdge
// Supports IRA bonus credits: prevailing wage, domestic content, energy community, low-income community

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ComplianceStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'verified'
  | 'non_compliant'
  | 'waived'
  | 'expired';

export type ComplianceCategory =
  | 'prevailing_wage'
  | 'domestic_content'
  | 'apprenticeship'
  | 'energy_community'
  | 'low_income_community'
  | 'environmental'
  | 'reporting'
  | 'certification'
  | 'documentation'
  | 'other';

export type VerificationMethod =
  | 'self_attestation'
  | 'third_party_certification'
  | 'government_verification'
  | 'audit'
  | 'documentation_review'
  | 'site_inspection'
  | 'automated_check';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export type DocumentReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export type CertificationStatus = 'pending' | 'active' | 'expired' | 'revoked' | 'suspended';

export type SteelIronOrigin = 'us_melted_poured' | 'us_manufactured' | 'foreign' | 'mixed';

export type LowIncomeCommunityCategory = 'category_1' | 'category_2' | 'category_3' | 'category_4';

// ============================================================================
// IRA BONUS CONSTANTS
// ============================================================================

export const IRA_BONUS_TYPES = {
  prevailing_wage: {
    name: 'Prevailing Wage & Apprenticeship',
    baseBonus: 0.30, // 30% bonus (5x multiplier)
    description: 'Projects meeting prevailing wage and apprenticeship requirements receive a 5x multiplier on base credit',
  },
  domestic_content: {
    name: 'Domestic Content',
    baseBonus: 0.10, // 10% bonus
    description: 'Additional 10% for meeting domestic content requirements',
  },
  energy_community: {
    name: 'Energy Community',
    baseBonus: 0.10, // 10% bonus
    description: 'Additional 10% for projects in energy communities',
  },
  low_income: {
    name: 'Low-Income Community',
    baseBonus: 0.20, // Up to 20% bonus
    description: 'Additional 10-20% for projects in low-income communities',
  },
} as const;

export const DOMESTIC_CONTENT_THRESHOLDS = {
  2024: { manufactured_products: 40, steel_iron: 100 },
  2025: { manufactured_products: 45, steel_iron: 100 },
  2026: { manufactured_products: 50, steel_iron: 100 },
  2027: { manufactured_products: 55, steel_iron: 100 },
} as const;

export const APPRENTICESHIP_REQUIREMENTS = {
  2023: { ratio: 0.125, hours_threshold: 12.5 }, // 12.5%
  2024: { ratio: 0.15, hours_threshold: 15 },    // 15%
  2025: { ratio: 0.15, hours_threshold: 15 },    // 15%
} as const;

// ============================================================================
// COMPLIANCE REQUIREMENT TYPES
// ============================================================================

export interface ComplianceRequirement {
  id: string;
  incentive_program_id: string | null;
  name: string;
  short_name: string | null;
  description: string | null;
  category: ComplianceCategory;
  // IRA Specific
  is_ira_requirement: boolean;
  ira_bonus_type: string | null;
  bonus_percentage: number | null;
  // Requirement Specifications
  requirement_type: string | null;
  threshold_value: number | null;
  threshold_unit: string | null;
  threshold_operator: string | null;
  // Timing
  timing_requirement: string | null;
  verification_frequency: string | null;
  due_date_offset_days: number | null;
  due_date_milestone: string | null;
  // Verification
  verification_method: VerificationMethod;
  required_documents: string[];
  certifying_authority: string | null;
  // Penalties
  non_compliance_penalty: string | null;
  recapture_risk: boolean;
  recapture_period_years: number | null;
  // Guidance
  guidance_url: string | null;
  form_number: string | null;
  // Status
  is_active: boolean;
  effective_date: string | null;
  expiration_date: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROJECT COMPLIANCE ITEM TYPES
// ============================================================================

export interface StatusHistoryEntry {
  status: ComplianceStatus;
  timestamp: string;
  user_id: string | null;
  note: string | null;
}

export interface ActionItem {
  item: string;
  assigned_to: string | null;
  due_date: string | null;
  completed: boolean;
}

export interface ProjectComplianceItem {
  id: string;
  project_id: string;
  compliance_requirement_id: string | null;
  incentive_program_id: string | null;
  // Custom Requirements
  custom_name: string | null;
  custom_description: string | null;
  category: ComplianceCategory;
  // Status
  status: ComplianceStatus;
  status_history: StatusHistoryEntry[];
  // Values
  current_value: number | null;
  target_value: number | null;
  value_unit: string | null;
  compliance_percentage: number | null;
  // Verification
  verification_method: VerificationMethod | null;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  // Dates
  due_date: string | null;
  completed_date: string | null;
  next_review_date: string | null;
  // IRA Bonus Tracking
  bonus_at_risk: number | null;
  bonus_secured: boolean;
  // Priority & Risk
  priority_level: PriorityLevel;
  risk_score: number | null;
  days_until_due: number | null;
  // Notes
  internal_notes: string | null;
  action_items: ActionItem[];
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined Data
  compliance_requirement?: ComplianceRequirement;
}

// ============================================================================
// COMPLIANCE DOCUMENT TYPES
// ============================================================================

export interface ComplianceDocument {
  id: string;
  project_id: string;
  compliance_item_id: string | null;
  organization_id: string;
  // Document Details
  name: string;
  description: string | null;
  document_type: string;
  category: ComplianceCategory | null;
  // Storage
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  file_hash: string | null;
  // Document Period
  period_start: string | null;
  period_end: string | null;
  reporting_period: string | null;
  // Verification
  is_certified: boolean;
  certified_by: string | null;
  certification_date: string | null;
  certification_type: string | null;
  // Review
  review_status: DocumentReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  // Expiration
  expiration_date: string | null;
  renewal_reminder_days: number | null;
  // AI Processing
  ai_extracted_data: Record<string, unknown> | null;
  ai_confidence_score: number | null;
  ai_processed_at: string | null;
  // Version Control
  version: number;
  parent_document_id: string | null;
  is_current: boolean;
  // Metadata
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMPLIANCE CERTIFICATION TYPES
// ============================================================================

export interface VerificationChainEntry {
  verifier: string;
  date: string;
  method: string;
  result: string;
}

export interface ComplianceCertification {
  id: string;
  project_id: string;
  compliance_item_id: string | null;
  organization_id: string;
  // Certification Details
  certification_type: string;
  certification_name: string;
  description: string | null;
  // Certifying Party
  certifying_organization: string;
  certifier_name: string | null;
  certifier_title: string | null;
  certifier_contact_email: string | null;
  certifier_contact_phone: string | null;
  certifier_license_number: string | null;
  // Status
  status: CertificationStatus;
  // Dates
  issue_date: string;
  effective_date: string | null;
  expiration_date: string | null;
  last_renewal_date: string | null;
  // Coverage
  coverage_details: Record<string, unknown> | null;
  coverage_amount: number | null;
  coverage_percentage: number | null;
  // IRA Specific
  ira_form_reference: string | null;
  ira_bonus_certified: boolean;
  ira_bonus_type: string | null;
  ira_bonus_percentage: number | null;
  // Documents
  certificate_document_id: string | null;
  supporting_documents: string[];
  // Verification
  verification_chain: VerificationChainEntry[];
  audit_notes: string | null;
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PREVAILING WAGE TYPES
// ============================================================================

export interface PrevailingWageRecord {
  id: string;
  project_id: string;
  organization_id: string;
  compliance_item_id: string | null;
  // Reporting Period
  period_start: string;
  period_end: string;
  reporting_week: number | null;
  // Contractor Information
  contractor_name: string;
  contractor_ein: string | null;
  contractor_type: string | null;
  prime_contractor_id: string | null;
  // Labor Classification
  labor_classification: string;
  labor_classification_code: string | null;
  craft_trade: string | null;
  // Location
  work_location: string | null;
  county: string | null;
  state: string | null;
  davis_bacon_wage_determination: string | null;
  // Hours & Wages
  total_hours: number;
  regular_hours: number | null;
  overtime_hours: number | null;
  base_hourly_rate: number;
  fringe_hourly_rate: number | null;
  total_hourly_rate: number;
  prevailing_wage_rate: number;
  // Compliance
  is_compliant: boolean;
  wage_differential: number;
  // Wages Paid
  gross_wages_paid: number | null;
  fringe_benefits_paid: number | null;
  total_compensation: number | null;
  // Certified Payroll
  certified_payroll_submitted: boolean;
  certified_payroll_document_id: string | null;
  payroll_certification_date: string | null;
  // Apprenticeship
  is_apprentice: boolean;
  apprentice_ratio_compliant: boolean | null;
  registered_apprenticeship_program: string | null;
  apprenticeship_registration_number: string | null;
  // Verification
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_method: VerificationMethod | null;
  verification_notes: string | null;
  // Issues
  has_issues: boolean;
  issue_description: string | null;
  issue_resolved: boolean | null;
  resolution_date: string | null;
  resolution_notes: string | null;
  // Metadata
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrevailingWageSummary {
  total_records: number;
  compliant_records: number;
  non_compliant_records: number;
  verified_records: number;
  unverified_records: number;
  total_hours: number;
  total_wages_paid: number;
  compliance_rate: number;
  contractors: string[];
}

// ============================================================================
// DOMESTIC CONTENT TYPES
// ============================================================================

export interface SupplyChainEntry {
  supplier: string;
  tier: number;
  location: string;
  certification: string | null;
}

export interface DomesticContentRecord {
  id: string;
  project_id: string;
  organization_id: string;
  compliance_item_id: string | null;
  // Component Details
  component_name: string;
  component_type: string;
  component_category: string | null;
  product_description: string | null;
  // Manufacturer Information
  manufacturer_name: string | null;
  manufacturer_location_country: string | null;
  manufacturer_location_state: string | null;
  manufacturer_location_city: string | null;
  manufacturer_facility_id: string | null;
  // Origin Classification
  origin_country: string;
  is_us_manufactured: boolean;
  is_us_mined_produced: boolean | null;
  // Steel/Iron Specific
  steel_iron_origin: SteelIronOrigin | null;
  steel_iron_percentage_us: number | null;
  // Manufactured Product Specific
  manufacturing_process_location: string | null;
  us_component_percentage: number | null;
  adjusted_percentage: number | null;
  // Cost Values
  total_component_cost: number;
  us_content_cost: number | null;
  foreign_content_cost: number | null;
  // Thresholds
  applicable_threshold_percentage: number | null;
  threshold_year: number | null;
  meets_threshold: boolean | null;
  // Certification
  manufacturer_certification_received: boolean;
  manufacturer_certification_date: string | null;
  manufacturer_certification_document_id: string | null;
  certification_affidavit: string | null;
  // Alternative Compliance
  alternative_compliance_used: boolean;
  alternative_compliance_type: string | null;
  alternative_compliance_justification: string | null;
  // Verification
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_method: VerificationMethod | null;
  verification_notes: string | null;
  // Supply Chain
  supply_chain_documentation: SupplyChainEntry[];
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DomesticContentSummary {
  total_components: number;
  us_manufactured_count: number;
  foreign_manufactured_count: number;
  total_cost: number;
  us_content_cost: number;
  foreign_content_cost: number;
  overall_us_percentage: number;
  steel_iron_compliant: boolean;
  manufactured_products_compliant: boolean;
  meets_ira_threshold: boolean;
  applicable_threshold: number;
}

// ============================================================================
// APPRENTICESHIP TYPES
// ============================================================================

export interface ApprenticeDetail {
  name: string;
  program: string;
  hours: number;
  trade: string;
  start_date: string;
}

export interface ApprenticeshipRecord {
  id: string;
  project_id: string;
  organization_id: string;
  compliance_item_id: string | null;
  // Reporting Period
  period_start: string;
  period_end: string;
  // Contractor Information
  contractor_name: string;
  contractor_ein: string | null;
  // Apprenticeship Program
  program_name: string;
  program_registration_number: string | null;
  program_sponsor: string | null;
  program_type: string | null;
  dol_approved: boolean;
  state_approved_state: string | null;
  // Hours Summary
  total_labor_hours: number;
  apprentice_hours: number;
  journeyworker_hours: number | null;
  // Ratio Calculation
  apprentice_ratio: number;
  required_ratio: number;
  ratio_compliant: boolean;
  // Apprentice Details
  apprentice_count: number | null;
  apprentice_details: ApprenticeDetail[];
  // Good Faith Effort
  good_faith_effort_claimed: boolean;
  good_faith_effort_documentation: Record<string, unknown> | null;
  good_faith_effort_approved: boolean | null;
  // Verification
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  // Metadata
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprenticeshipSummary {
  total_records: number;
  compliant_records: number;
  non_compliant_records: number;
  total_labor_hours: number;
  total_apprentice_hours: number;
  overall_ratio: number;
  required_ratio: number;
  is_compliant: boolean;
  programs: string[];
}

// ============================================================================
// ENERGY COMMUNITY TYPES
// ============================================================================

export interface EnergyCommunityEligibility {
  id: string;
  project_id: string;
  census_tract: string;
  state: string;
  county: string | null;
  // Eligibility Categories
  brownfield_site: boolean;
  brownfield_documentation: string | null;
  // Statistical Area
  in_statistical_area: boolean;
  statistical_area_name: string | null;
  statistical_area_type: string | null;
  // Employment Criteria
  fossil_fuel_employment_threshold_met: boolean;
  fossil_fuel_employment_percentage: number | null;
  fossil_fuel_employment_source: string | null;
  // Unemployment Criteria
  unemployment_rate: number | null;
  national_unemployment_rate: number | null;
  unemployment_threshold_met: boolean;
  // Coal Criteria
  coal_closure_criteria_met: boolean;
  coal_mine_closure_date: string | null;
  coal_plant_closure_date: string | null;
  coal_facility_name: string | null;
  // Final Eligibility
  is_eligible: boolean;
  eligibility_category: string | null;
  eligibility_determination_date: string | null;
  eligibility_source: string | null;
  // Bonus
  bonus_percentage: number;
  // Verification
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_method: string | null;
  verification_notes: string | null;
  // Documents
  supporting_documents: string[];
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// LOW-INCOME COMMUNITY TYPES
// ============================================================================

export interface LowIncomeCommunityEligibility {
  id: string;
  project_id: string;
  census_tract: string;
  state: string;
  county: string | null;
  // Category
  category: LowIncomeCommunityCategory;
  category_description: string | null;
  // Category 1: Low-Income Community
  is_low_income_community: boolean;
  median_income_percentage: number | null;
  poverty_rate: number | null;
  // Category 2: Indian Land
  is_indian_land: boolean;
  tribal_name: string | null;
  tribal_land_type: string | null;
  // Category 3: Qualified Residential
  is_qualified_residential: boolean;
  residential_building_type: string | null;
  affordable_housing_percentage: number | null;
  // Category 4: Economic Benefit
  is_economic_benefit_project: boolean;
  economic_benefit_type: string | null;
  // Capacity Allocation
  capacity_applied_mw: number | null;
  capacity_allocated_mw: number | null;
  allocation_round: number | null;
  allocation_date: string | null;
  allocation_reference_number: string | null;
  // Bonus
  bonus_percentage: number | null;
  // Application Status
  application_submitted: boolean;
  application_date: string | null;
  application_status: string | null;
  approval_date: string | null;
  // Verification
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

// ============================================================================
// COMPLIANCE SCORE TYPES
// ============================================================================

export interface ComplianceScoreHistory {
  id: string;
  project_id: string;
  overall_score: number;
  prevailing_wage_score: number | null;
  domestic_content_score: number | null;
  apprenticeship_score: number | null;
  documentation_score: number | null;
  // Status Counts
  total_requirements: number | null;
  completed_requirements: number | null;
  in_progress_requirements: number | null;
  at_risk_requirements: number | null;
  non_compliant_requirements: number | null;
  // Bonus Tracking
  total_potential_bonus: number | null;
  secured_bonus: number | null;
  at_risk_bonus: number | null;
  // Breakdown
  score_breakdown: Record<string, unknown>;
  // Metadata
  calculated_at: string;
  calculated_by: string | null;
  calculation_notes: string | null;
  created_at: string;
}

export interface ProjectComplianceSummary {
  compliance_score: number | null;
  compliance_status: string;
  last_compliance_check_at: string | null;
  compliance_summary: {
    overall_score: number;
    prevailing_wage_score: number | null;
    domestic_content_score: number | null;
    apprenticeship_score: number | null;
    documentation_score: number | null;
    total_items: number;
    verified_items: number;
    in_progress_items: number;
    non_compliant_items: number;
  };
  ira_bonus_potential: number;
  ira_bonus_secured: number;
  ira_bonus_at_risk: number;
  prevailing_wage_status: string;
  domestic_content_status: string;
  apprenticeship_status: string;
  energy_community_verified: boolean;
  low_income_community_verified: boolean;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ComplianceOverviewResponse {
  project_id: string;
  project_name: string;
  overall_score: number;
  status: ComplianceStatus;
  ira_bonuses: {
    prevailing_wage: {
      eligible: boolean;
      status: string;
      bonus_percentage: number;
      bonus_value: number;
    };
    domestic_content: {
      eligible: boolean;
      status: string;
      bonus_percentage: number;
      bonus_value: number;
    };
    energy_community: {
      eligible: boolean;
      status: string;
      bonus_percentage: number;
      bonus_value: number;
    };
    low_income_community: {
      eligible: boolean;
      status: string;
      bonus_percentage: number;
      bonus_value: number;
    };
  };
  total_potential_bonus: number;
  secured_bonus: number;
  at_risk_bonus: number;
  items_summary: {
    total: number;
    verified: number;
    in_progress: number;
    pending: number;
    non_compliant: number;
  };
  upcoming_deadlines: {
    item_id: string;
    item_name: string;
    due_date: string;
    days_remaining: number;
    priority: PriorityLevel;
  }[];
  recent_activity: {
    timestamp: string;
    action: string;
    item_name: string;
    user_name: string | null;
  }[];
}

export interface CreateComplianceItemRequest {
  compliance_requirement_id?: string;
  custom_name?: string;
  custom_description?: string;
  category: ComplianceCategory;
  target_value?: number;
  value_unit?: string;
  due_date?: string;
  priority_level?: PriorityLevel;
  internal_notes?: string;
}

export interface UpdateComplianceItemRequest {
  status?: ComplianceStatus;
  current_value?: number;
  target_value?: number;
  compliance_percentage?: number;
  verification_method?: VerificationMethod;
  verification_notes?: string;
  due_date?: string;
  priority_level?: PriorityLevel;
  internal_notes?: string;
  action_items?: ActionItem[];
}

export interface CreatePrevailingWageRecordRequest {
  period_start: string;
  period_end: string;
  contractor_name: string;
  contractor_ein?: string;
  contractor_type?: string;
  labor_classification: string;
  labor_classification_code?: string;
  craft_trade?: string;
  work_location?: string;
  county?: string;
  state?: string;
  davis_bacon_wage_determination?: string;
  total_hours: number;
  regular_hours?: number;
  overtime_hours?: number;
  base_hourly_rate: number;
  fringe_hourly_rate?: number;
  total_hourly_rate: number;
  prevailing_wage_rate: number;
  gross_wages_paid?: number;
  fringe_benefits_paid?: number;
  total_compensation?: number;
  is_apprentice?: boolean;
  registered_apprenticeship_program?: string;
}

export interface CreateDomesticContentRecordRequest {
  component_name: string;
  component_type: string;
  component_category?: string;
  product_description?: string;
  manufacturer_name?: string;
  manufacturer_location_country?: string;
  manufacturer_location_state?: string;
  manufacturer_location_city?: string;
  origin_country: string;
  is_us_manufactured: boolean;
  is_us_mined_produced?: boolean;
  steel_iron_origin?: SteelIronOrigin;
  steel_iron_percentage_us?: number;
  us_component_percentage?: number;
  total_component_cost: number;
  us_content_cost?: number;
  foreign_content_cost?: number;
}

export interface CreateCertificationRequest {
  certification_type: string;
  certification_name: string;
  description?: string;
  certifying_organization: string;
  certifier_name?: string;
  certifier_title?: string;
  certifier_contact_email?: string;
  issue_date: string;
  effective_date?: string;
  expiration_date?: string;
  ira_bonus_type?: string;
  ira_bonus_percentage?: number;
}

// ============================================================================
// COMPLIANCE CHECKER TYPES
// ============================================================================

export interface PrevailingWageCheckResult {
  is_compliant: boolean;
  compliance_percentage: number;
  total_records: number;
  compliant_records: number;
  non_compliant_records: number;
  total_hours: number;
  issues: {
    record_id: string;
    contractor: string;
    classification: string;
    paid_rate: number;
    required_rate: number;
    shortfall: number;
  }[];
  recommendations: string[];
}

export interface DomesticContentCheckResult {
  meets_steel_iron_requirement: boolean;
  meets_manufactured_products_requirement: boolean;
  overall_compliant: boolean;
  steel_iron_percentage: number;
  manufactured_products_percentage: number;
  applicable_threshold: number;
  threshold_year: number;
  components_summary: {
    total: number;
    us_manufactured: number;
    foreign_manufactured: number;
    unverified: number;
  };
  issues: {
    component_id: string;
    component_name: string;
    issue: string;
  }[];
  recommendations: string[];
}

export interface EnergyCommunityCheckResult {
  is_eligible: boolean;
  eligibility_category: string | null;
  census_tract: string;
  brownfield_eligible: boolean;
  statistical_area_eligible: boolean;
  coal_closure_eligible: boolean;
  bonus_percentage: number;
  data_source: string;
  verification_date: string;
}

export interface LowIncomeCommunityCheckResult {
  is_eligible: boolean;
  category: LowIncomeCommunityCategory | null;
  category_description: string | null;
  census_tract: string;
  bonus_percentage: number;
  requires_allocation: boolean;
  allocation_status: string | null;
}

export interface ApprenticeshipCheckResult {
  is_compliant: boolean;
  current_ratio: number;
  required_ratio: number;
  total_labor_hours: number;
  apprentice_hours: number;
  shortfall_hours: number;
  good_faith_effort_available: boolean;
  programs: string[];
  recommendations: string[];
}

export interface ComplianceScoreResult {
  overall_score: number;
  category_scores: {
    prevailing_wage: number | null;
    domestic_content: number | null;
    apprenticeship: number | null;
    documentation: number | null;
    certifications: number | null;
  };
  bonus_status: {
    prevailing_wage_bonus: {
      eligible: boolean;
      secured: boolean;
      value: number;
    };
    domestic_content_bonus: {
      eligible: boolean;
      secured: boolean;
      value: number;
    };
    energy_community_bonus: {
      eligible: boolean;
      secured: boolean;
      value: number;
    };
    low_income_bonus: {
      eligible: boolean;
      secured: boolean;
      value: number;
    };
  };
  total_potential_bonus: number;
  secured_bonus: number;
  at_risk_bonus: number;
  risk_factors: string[];
  recommendations: string[];
}
