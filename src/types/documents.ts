// Document Management Types for IncentEdge

// ============================================================================
// DOCUMENT TYPE ENUMS
// ============================================================================

export enum DocumentType {
  PRO_FORMA = 'pro_forma',
  SITE_PLAN = 'site_plan',
  CERTIFICATION = 'certification',
  UTILITY_BILL = 'utility_bill',
  ENVIRONMENTAL_REPORT = 'environmental_report',
  APPRAISAL = 'appraisal',
  TITLE_REPORT = 'title_report',
  SURVEY = 'survey',
  ARCHITECTURAL_PLANS = 'architectural_plans',
  ENGINEERING_REPORT = 'engineering_report',
  ENERGY_MODEL = 'energy_model',
  TAX_RETURNS = 'tax_returns',
  FINANCIAL_STATEMENTS = 'financial_statements',
  OPERATING_AGREEMENT = 'operating_agreement',
  ORGANIZATIONAL_DOCS = 'organizational_docs',
  APPLICATION_FORM = 'application_form',
  COMPLIANCE_REPORT = 'compliance_report',
  PERMIT = 'permit',
  CONTRACT = 'contract',
  INCENTIVE_PROGRAM_SOURCE = 'incentive_program_source',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING_UPLOAD = 'pending_upload',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  EXTRACTED = 'extracted',
  EXTRACTION_FAILED = 'extraction_failed',
  ARCHIVED = 'archived',
}

export enum ExtractionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

// ============================================================================
// EXTRACTED DATA INTERFACES
// ============================================================================

// Pro Forma extracted data
export interface ProFormaExtractedData {
  // Project costs
  total_development_cost: number | null;
  hard_costs: number | null;
  soft_costs: number | null;
  land_acquisition_cost: number | null;
  construction_cost: number | null;
  contingency: number | null;
  developer_fee: number | null;

  // Unit information
  total_units: number | null;
  unit_mix: UnitMixItem[] | null;
  affordable_units: number | null;
  affordable_breakdown: AffordableBreakdown | null;

  // Square footage
  total_gross_sf: number | null;
  total_net_sf: number | null;
  residential_sf: number | null;
  commercial_sf: number | null;
  common_area_sf: number | null;
  parking_sf: number | null;

  // Financing structure
  financing_sources: FinancingSource[] | null;
  total_debt: number | null;
  total_equity: number | null;
  ltc_ratio: number | null;
  dscr: number | null;

  // Operating projections
  gross_potential_rent: number | null;
  vacancy_rate: number | null;
  effective_gross_income: number | null;
  operating_expenses: number | null;
  noi: number | null;

  // Returns
  irr: number | null;
  cash_on_cash: number | null;
  equity_multiple: number | null;
  development_yield: number | null;

  // Timeline
  construction_start: string | null;
  construction_end: string | null;
  stabilization_date: string | null;
}

export interface UnitMixItem {
  unit_type: string;
  bedroom_count: number;
  bathroom_count: number;
  unit_count: number;
  avg_sf: number;
  rent_per_unit: number;
  rent_per_sf: number;
  ami_level: number | null;
}

export interface AffordableBreakdown {
  ami_30: number;
  ami_50: number;
  ami_60: number;
  ami_80: number;
  ami_100: number;
  ami_120: number;
  market_rate: number;
}

export interface FinancingSource {
  source_name: string;
  source_type: 'senior_debt' | 'mezzanine' | 'equity' | 'grant' | 'tax_credit' | 'other';
  amount: number;
  rate: number | null;
  term_years: number | null;
  amortization_years: number | null;
}

// Site Plan extracted data
export interface SitePlanExtractedData {
  // Address and location
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  county: string | null;
  parcel_id: string | null;
  tax_lot: string | null;
  block: string | null;

  // Land characteristics
  total_acreage: number | null;
  lot_area_sf: number | null;
  buildable_area_sf: number | null;
  impervious_coverage: number | null;
  building_coverage: number | null;
  green_space_pct: number | null;

  // Zoning
  zoning_district: string | null;
  zoning_description: string | null;
  overlay_districts: string[] | null;
  special_districts: string[] | null;
  use_classification: string | null;
  variance_required: boolean | null;

  // Setbacks
  front_setback: number | null;
  rear_setback: number | null;
  side_setback_left: number | null;
  side_setback_right: number | null;

  // Building envelope
  max_building_height: number | null;
  max_stories: number | null;
  max_far: number | null;
  proposed_far: number | null;

  // Parking
  parking_spaces_required: number | null;
  parking_spaces_provided: number | null;
  parking_type: 'surface' | 'structured' | 'underground' | 'mixed' | null;

  // Utilities
  water_service: boolean | null;
  sewer_service: boolean | null;
  gas_service: boolean | null;
  electric_service: boolean | null;
  utility_notes: string | null;

  // Environmental
  wetlands_present: boolean | null;
  flood_zone: string | null;
  environmental_constraints: string[] | null;
}

// Certification document extracted data
export interface CertificationExtractedData {
  // Certification details
  certification_type: CertificationType | null;
  certification_level: string | null;
  certification_version: string | null;
  certificate_number: string | null;
  certifying_body: string | null;

  // Dates
  issue_date: string | null;
  expiration_date: string | null;

  // Scores and metrics
  total_points: number | null;
  points_available: number | null;
  points_percentage: number | null;

  // Energy performance
  energy_star_score: number | null;
  site_eui: number | null;
  source_eui: number | null;
  energy_reduction_pct: number | null;

  // LEED-specific
  leed_category_scores: LEEDCategoryScores | null;

  // Passive House specific
  passive_house_metrics: PassiveHouseMetrics | null;

  // NGBS specific
  ngbs_scores: NGBSScores | null;

  // Additional certifications
  additional_certifications: string[] | null;
}

export type CertificationType =
  | 'leed'
  | 'energy_star'
  | 'passive_house'
  | 'ngbs'
  | 'well'
  | 'fitwel'
  | 'living_building'
  | 'enterprise_green'
  | 'other';

export interface LEEDCategoryScores {
  integrative_process: number | null;
  location_transportation: number | null;
  sustainable_sites: number | null;
  water_efficiency: number | null;
  energy_atmosphere: number | null;
  materials_resources: number | null;
  indoor_environmental_quality: number | null;
  innovation: number | null;
  regional_priority: number | null;
}

export interface PassiveHouseMetrics {
  heating_demand: number | null; // kWh/m2/year
  cooling_demand: number | null; // kWh/m2/year
  primary_energy: number | null; // kWh/m2/year
  airtightness: number | null; // ACH50
  source_energy: number | null; // kWh/m2/year
  psi_value: number | null;
}

export interface NGBSScores {
  lot_design_development: number | null;
  resource_efficiency: number | null;
  energy_efficiency: number | null;
  water_efficiency: number | null;
  indoor_environmental_quality: number | null;
  building_operation_maintenance: number | null;
}

// Utility Bill extracted data
export interface UtilityBillExtractedData {
  // Bill details
  utility_type: 'electric' | 'gas' | 'water' | 'sewer' | 'combined';
  utility_provider: string | null;
  account_number: string | null;
  meter_number: string | null;

  // Service address
  service_address: string | null;

  // Billing period
  billing_period_start: string | null;
  billing_period_end: string | null;
  days_in_period: number | null;

  // Consumption
  consumption_kwh: number | null;
  consumption_therms: number | null;
  consumption_gallons: number | null;
  consumption_ccf: number | null;
  peak_demand_kw: number | null;

  // Costs
  total_amount: number | null;
  energy_charges: number | null;
  demand_charges: number | null;
  delivery_charges: number | null;
  taxes_fees: number | null;

  // Rates
  average_rate: number | null;
  rate_schedule: string | null;

  // Historical comparison
  prior_year_consumption: number | null;
  prior_year_cost: number | null;
  consumption_change_pct: number | null;

  // Normalized metrics
  consumption_per_sf: number | null;
  cost_per_sf: number | null;
}

// ============================================================================
// DOCUMENT METADATA INTERFACE
// ============================================================================

export interface DocumentMetadata {
  id: string;
  organization_id: string;
  project_id: string | null;
  application_id: string | null;

  // File information
  file_name: string;
  original_file_name: string;
  file_type: string; // MIME type
  file_size: number; // bytes
  file_extension: string;
  storage_path: string;
  storage_bucket: string;

  // Document classification
  document_type: DocumentType;
  document_status: DocumentStatus;

  // Version control
  version: number;
  is_current_version: boolean;
  parent_document_id: string | null;

  // AI Extraction
  extraction_status: ExtractionStatus;
  extraction_started_at: string | null;
  extraction_completed_at: string | null;
  extraction_error: string | null;
  extracted_data: ExtractedData | null;
  extraction_confidence: number | null;

  // User tracking
  uploaded_by: string;
  uploaded_at: string;
  last_accessed_at: string | null;
  access_count: number;

  // Metadata
  description: string | null;
  tags: string[];
  notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Union type for all extracted data types
export type ExtractedData =
  | { type: 'pro_forma'; data: ProFormaExtractedData }
  | { type: 'site_plan'; data: SitePlanExtractedData }
  | { type: 'certification'; data: CertificationExtractedData }
  | { type: 'utility_bill'; data: UtilityBillExtractedData }
  | { type: 'incentive_program'; data: Record<string, unknown> }
  | { type: 'other'; data: Record<string, unknown> };

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface DocumentUploadRequest {
  project_id?: string;
  application_id?: string;
  document_type: DocumentType;
  file_name: string;
  file_type: string;
  file_size: number;
  description?: string;
  tags?: string[];
}

export interface SignedUploadResponse {
  upload_url: string;
  storage_path: string;
  document_id: string;
  expires_at: string;
}

export interface DocumentListParams {
  project_id?: string;
  application_id?: string;
  document_type?: DocumentType;
  status?: DocumentStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'file_name' | 'file_size' | 'document_type';
  sort_order?: 'asc' | 'desc';
}

export interface ExtractionRequest {
  document_id: string;
  force_reextract?: boolean;
  extraction_options?: {
    extract_tables?: boolean;
    extract_images?: boolean;
    use_ocr?: boolean;
    target_fields?: string[];
  };
}

export interface ExtractionResult {
  document_id: string;
  status: ExtractionStatus;
  extracted_data: ExtractedData | null;
  confidence: number | null;
  processing_time_ms: number;
  errors: ExtractionError[];
  warnings: string[];
  field_mapping_suggestions: FieldMappingSuggestion[];
}

export interface ExtractionError {
  code: string;
  message: string;
  field?: string;
  recoverable: boolean;
}

export interface FieldMappingSuggestion {
  source_field: string;
  target_entity: 'project' | 'application';
  target_field: string;
  extracted_value: unknown;
  confidence: number;
  requires_confirmation: boolean;
}

// ============================================================================
// DOCUMENT PROCESSING STATUS
// ============================================================================

export interface DocumentProcessingStatus {
  document_id: string;
  status: DocumentStatus;
  extraction_status: ExtractionStatus;
  progress_pct: number;
  current_step: string;
  steps_completed: string[];
  estimated_time_remaining_sec: number | null;
  error_message: string | null;
}

// ============================================================================
// DOCUMENT ANALYSIS TYPES
// ============================================================================

export interface DocumentAnalysisRequest {
  document_ids: string[];
  analysis_type: 'comparison' | 'summary' | 'validation' | 'gap_analysis';
  options?: {
    include_recommendations?: boolean;
    compare_to_baseline?: boolean;
    validate_against_requirements?: boolean;
  };
}

export interface DocumentAnalysisResult {
  analysis_id: string;
  analysis_type: string;
  summary: string;
  findings: AnalysisFinding[];
  recommendations: string[];
  data_quality_score: number;
  completeness_score: number;
}

export interface AnalysisFinding {
  category: 'discrepancy' | 'missing_data' | 'validation_error' | 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_fields: string[];
  suggested_action: string | null;
}
