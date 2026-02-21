// Core Types for IncentEdge

// ============================================================================
// SUSTAINABILITY TIERS
// ============================================================================
export type SustainabilityTier =
  | 'tier_1_efficient'        // Energy Star, code+20%, LED
  | 'tier_2_high_performance' // Passive House OR LEED Gold, 50%+ energy reduction
  | 'tier_3_net_zero'         // Passive House + renewables + zero carbon
  | 'tier_3_triple_net_zero'; // Energy + Water recycling + Waste diversion (95%+)

export interface SustainabilityTierInfo {
  tier: SustainabilityTier;
  label: string;
  shortLabel: string;
  description: string;
  requirements: string[];
  certificationPaths: string[];
  typicalPremiumPct: number;
  incentiveMultiplier: number;
}

export const SUSTAINABILITY_TIERS: Record<SustainabilityTier, SustainabilityTierInfo> = {
  tier_1_efficient: {
    tier: 'tier_1_efficient',
    label: 'Efficient',
    shortLabel: 'Tier 1',
    description: 'Code-compliant with enhanced efficiency measures',
    requirements: [
      'Energy Star certification eligible',
      'Code +20% insulation',
      'LED lighting throughout',
      'High-efficiency HVAC'
    ],
    certificationPaths: ['Energy Star', 'NGBS Bronze'],
    typicalPremiumPct: 2.8,
    incentiveMultiplier: 1.0
  },
  tier_2_high_performance: {
    tier: 'tier_2_high_performance',
    label: 'High Performance',
    shortLabel: 'Tier 2',
    description: 'Significantly reduced energy consumption',
    requirements: [
      'Passive House OR LEED Gold',
      '50%+ energy reduction vs code',
      'Enhanced air sealing',
      'Heat pump systems',
      'ERV/HRV ventilation'
    ],
    certificationPaths: ['LEED Gold', 'Passive House', 'NGBS Gold'],
    typicalPremiumPct: 7.5,
    incentiveMultiplier: 1.15
  },
  tier_3_net_zero: {
    tier: 'tier_3_net_zero',
    label: 'Net Zero',
    shortLabel: 'Tier 3',
    description: 'Zero net energy consumption',
    requirements: [
      'Passive House certified',
      'On-site renewable energy',
      'Zero carbon operations',
      'Battery storage'
    ],
    certificationPaths: ['LEED Platinum', 'Passive House', 'Net Zero Certification'],
    typicalPremiumPct: 12.5,
    incentiveMultiplier: 1.30
  },
  tier_3_triple_net_zero: {
    tier: 'tier_3_triple_net_zero',
    label: 'Triple Net Zero',
    shortLabel: 'TNZ',
    description: 'Net zero energy, water, and waste',
    requirements: [
      'All Net Zero requirements',
      'Water recycling/rainwater harvesting',
      '95%+ waste diversion',
      'Closed-loop systems'
    ],
    certificationPaths: ['Living Building Challenge', 'Triple Net Zero'],
    typicalPremiumPct: 17.5,
    incentiveMultiplier: 1.50
  }
};

// ============================================================================
// COST ESTIMATION TYPES
// ============================================================================
export interface RSMeansCostData {
  id: string;
  building_type: string;
  building_subtype: string | null;
  construction_quality: 'economy' | 'average' | 'custom' | 'luxury';
  base_cost_psf: number;
  hard_cost_ratio: number;
  soft_cost_ratio: number;
  effective_date: string;
}

export interface RegionalMultiplier {
  id: string;
  state: string;
  city: string | null;
  zip_code_prefix: string | null;
  metro_area: string | null;
  total_multiplier: number;
  material_multiplier: number;
  labor_multiplier: number;
}

export interface SustainabilityCostPremium {
  id: string;
  building_type: string;
  sustainability_tier: SustainabilityTier;
  premium_psf: number;
  premium_percentage: number | null;
  envelope_premium_psf: number | null;
  hvac_premium_psf: number | null;
  renewable_premium_psf: number | null;
  water_systems_psf: number | null;
  waste_systems_psf: number | null;
  certification_path: string[];
  energy_savings_annual_psf: number | null;
}

export interface EnergySystemCost {
  id: string;
  system_type: string;
  system_subtype: string | null;
  unit_of_measure: string;
  cost_per_unit: number;
  installation_cost_per_unit: number | null;
  total_installed_cost_per_unit: number | null;
  annual_production_per_unit: number | null;
  lifespan_years: number | null;
  itc_eligible: boolean;
  domestic_content_available: boolean;
}

export interface ProjectCostEstimate {
  id: string;
  project_id: string;
  version: number;
  is_current: boolean;
  estimate_type: 'preliminary' | 'detailed' | 'final';
  // Base costs
  base_construction_cost: number | null;
  base_cost_psf: number | null;
  regional_multiplier: number | null;
  adjusted_base_cost: number | null;
  // Tier comparisons
  tier_1_total_cost: number | null;
  tier_1_premium: number | null;
  tier_1_incentives: number | null;
  tier_1_net_cost: number | null;
  tier_2_total_cost: number | null;
  tier_2_premium: number | null;
  tier_2_incentives: number | null;
  tier_2_net_cost: number | null;
  tier_3_total_cost: number | null;
  tier_3_premium: number | null;
  tier_3_incentives: number | null;
  tier_3_net_cost: number | null;
  tier_3_tnz_total_cost: number | null;
  tier_3_tnz_premium: number | null;
  tier_3_tnz_incentives: number | null;
  tier_3_tnz_net_cost: number | null;
  // Recommendation
  recommended_tier: SustainabilityTier | null;
  recommendation_reason: string | null;
  // Detailed breakdown
  cost_breakdown: Record<string, unknown>;
  incentive_breakdown: Record<string, unknown>;
  energy_systems_cost: number | null;
  energy_systems_detail: unknown[];
  // Metadata
  calculated_at: string;
  created_at: string;
}

export interface TierComparisonResult {
  tier: SustainabilityTier;
  tierInfo: SustainabilityTierInfo;
  constructionCost: number;
  sustainabilityPremium: number;
  totalCost: number;
  availableIncentives: number;
  netCost: number;
  netCostDelta: number; // Difference from Tier 1
  subsidyRate: number;
  isRecommended: boolean;
  incentiveBreakdown: {
    federal: number;
    state: number;
    local: number;
    utility: number;
  };
}

export interface CostEstimationInput {
  building_type: string;
  total_sqft: number;
  state: string;
  zip_code: string;
  total_units?: number;
  stories?: number;
  energy_systems?: {
    system_type: string;
    size: number;
  }[];
  domestic_content_eligible?: boolean;
  prevailing_wage_commitment?: boolean;
}

export interface CostEstimationResult {
  input: CostEstimationInput;
  baseCostPsf: number;
  regionalMultiplier: number;
  baseTotalCost: number;
  tierComparisons: TierComparisonResult[];
  recommendedTier: SustainabilityTier;
  recommendation: {
    tier: SustainabilityTier;
    reason: string;
    savings: number;
  };
  energySystemsCost: number | null;
  calculatedAt: string;
}

// User & Organization Types
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  organization_type: string | null;
  tax_status: 'for-profit' | 'nonprofit' | 'municipal' | 'tribal';
  tax_exempt: boolean;
  ein: string | null;
  duns_number: string | null;
  sam_uei: string | null;
  mwbe_certified: boolean;
  sdvob_certified: boolean;
  subscription_tier: 'free' | 'starter' | 'professional' | 'team' | 'enterprise';
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Project Types
export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  // Location
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  county: string | null;
  census_tract: string | null;
  latitude: number | null;
  longitude: number | null;
  // Project Details
  sector_type: SectorType;
  building_type: string | null;
  construction_type: 'new-construction' | 'substantial-rehab' | 'acquisition' | 'refinance';
  total_units: number | null;
  affordable_units: number | null;
  affordable_breakdown: AffordableBreakdown | null;
  total_sqft: number | null;
  capacity_mw: number | null;
  // Financials
  total_development_cost: number | null;
  hard_costs: number | null;
  soft_costs: number | null;
  // Sustainability
  target_certification: string | null;
  renewable_energy_types: string[];
  projected_energy_reduction_pct: number | null;
  domestic_content_eligible: boolean;
  prevailing_wage_commitment: boolean;
  // Timeline
  project_status: 'active' | 'on-hold' | 'completed' | 'archived';
  estimated_start_date: string | null;
  estimated_completion_date: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

export type SectorType =
  | 'real-estate'
  | 'clean-energy'
  | 'water'
  | 'waste'
  | 'transportation'
  | 'industrial';

export interface AffordableBreakdown {
  ami_30: number;
  ami_50: number;
  ami_60: number;
  ami_80: number;
  ami_100: number;
  ami_120: number;
  market_rate: number;
}

// Incentive Program Types
export interface IncentiveProgram {
  id: string;
  external_id: string | null;
  name: string;
  description: string | null;
  // Classification
  program_type: string;
  category: IncentiveCategory;
  subcategory: string | null;
  sector_types: SectorType[];
  technology_types: string[];
  building_types: string[];
  // Geography
  jurisdiction_level: 'federal' | 'state' | 'local' | 'utility';
  state: string | null;
  counties: string[];
  municipalities: string[];
  census_tracts: string[];
  utility_territories: string[];
  // Incentive Details
  incentive_type: IncentiveType;
  amount_type: 'fixed' | 'percentage' | 'per_unit' | 'per_kw' | 'variable';
  amount_fixed: number | null;
  amount_percentage: number | null;
  amount_per_unit: number | null;
  amount_per_kw: number | null;
  amount_min: number | null;
  amount_max: number | null;
  // Eligibility
  eligibility_criteria: Record<string, unknown>;
  entity_types: string[];
  direct_pay_eligible: boolean;
  transferable: boolean;
  // Bonus Criteria
  domestic_content_bonus: number | null;
  energy_community_bonus: number | null;
  prevailing_wage_bonus: number | null;
  // Status & Dates
  status: 'active' | 'inactive' | 'expired';
  start_date: string | null;
  end_date: string | null;
  application_deadline: string | null;
  // Administration
  administrator: string | null;
  source_url: string | null;
  application_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  // Stacking
  stackable: boolean;
  stacking_restrictions: string[];
  // Metadata
  last_verified_at: string | null;
  data_source: string | null;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export type IncentiveCategory = 'federal' | 'state' | 'local' | 'utility';
export type IncentiveType = 'tax_credit' | 'grant' | 'rebate' | 'loan' | 'tax_exemption' | 'financing';

// Eligibility Match Types
export interface EligibilityMatch {
  id: string;
  project_id: string;
  incentive_program_id: string;
  incentive_program: IncentiveProgram;
  // Scoring
  overall_score: number;
  probability_score: number;
  relevance_score: number;
  // Calculated Values
  estimated_value: number;
  value_low: number;
  value_high: number;
  // Qualification Details
  requirements_met: number;
  requirements_total: number;
  match_details: MatchDetail[];
  // Status
  status: 'matched' | 'applied' | 'awarded' | 'dismissed';
  dismissed_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchDetail {
  requirement: string;
  met: boolean;
  value: string | null;
  note: string | null;
}

// Application Types
export interface Application {
  id: string;
  project_id: string;
  eligibility_match_id: string;
  incentive_program_id: string;
  // Status
  status: ApplicationStatus;
  status_history: StatusHistoryEntry[];
  // Application Details
  submission_date: string | null;
  amount_requested: number | null;
  amount_approved: number | null;
  // AI Generation
  ai_generated_content: Record<string, unknown> | null;
  human_reviewed: boolean;
  reviewer_id: string | null;
  // Documents
  documents: ApplicationDocument[];
  // Timeline
  deadline: string | null;
  decision_date: string | null;
  // Metadata
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'draft'
  | 'in-progress'
  | 'ready-for-review'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  timestamp: string;
  user_id: string | null;
  note: string | null;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

// Dashboard Types
export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  total_potential_value: number;
  captured_value: number;
  pending_applications: number;
  success_rate: number;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'application_submitted' | 'status_changed' | 'deadline_approaching';
  title: string;
  description: string;
  timestamp: string;
  project_id?: string;
  application_id?: string;
}

export interface UpcomingDeadline {
  id: string;
  program_name: string;
  deadline: string;
  days_remaining: number;
  project_id: string;
  project_name: string;
}

// Form Types
export interface ProjectFormData {
  name: string;
  description?: string;
  address_line1: string;
  city: string;
  state: string;
  zip_code: string;
  sector_type: SectorType;
  building_type: string;
  construction_type: string;
  total_units?: number;
  affordable_units?: number;
  total_sqft?: number;
  total_development_cost?: number;
  hard_costs?: number;
  soft_costs?: number;
  target_certification?: string;
  renewable_energy_types?: string[];
  domestic_content_eligible?: boolean;
  prevailing_wage_commitment?: boolean;
  estimated_start_date?: string;
  estimated_completion_date?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
