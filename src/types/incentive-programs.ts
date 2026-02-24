/**
 * Incentive Program Types for IncentEdge
 *
 * Full schema for extracted incentive program data from PDFs/documents.
 * Maps to the incentive_programs table in Supabase.
 */

// ============================================================================
// EXTRACTED INCENTIVE PROGRAM DATA
// ============================================================================

export interface IncentiveProgramExtractedData {
  // Identity & Source
  program_name: string;
  issuer: string;
  issuer_type: 'utility' | 'state' | 'federal' | 'local' | 'nonprofit';
  jurisdiction_state: string | null;
  jurisdiction_local: string | null;
  program_level: 'federal' | 'state' | 'local' | 'utility';
  source_url?: string | null;

  // Incentive Type & Amount
  incentive_type: 'rebate' | 'tax_credit' | 'grant' | 'loan' | 'performance' | 'direct_pay';
  amount_description: string | null;
  funding_amount_raw: string | null;
  funding_amount_num: number | null;
  funding_currency: string;
  min_amount: number | null;
  max_amount: number | null;
  amount_formula: string | null;

  // Eligibility
  eligible_sectors: ('residential' | 'commercial' | 'industrial' | 'nonprofit')[];
  eligible_technologies: string[];
  eligibility_criteria: Record<string, unknown>;
  income_limits: string | null;
  required_documents: string[];

  // Timeline
  deadline_raw: string | null;
  application_deadline: string | null; // ISO date YYYY-MM-DD if parseable
  program_end_date: string | null;
  funding_status: 'open' | 'waitlist' | 'closed' | 'unknown';

  // Application Details
  application_url: string | null;
  pdf_links: string[];
  application_steps: string[];

  // Stacking & Interactions
  stackable_with: string[];
  stacking_rules: string | null;

  // AI Metadata (maps to Migration 014 columns)
  confidence_score: number; // 0-1
  low_confidence_fields: string[];
  funding_ai_filled: boolean;
  deadline_ai_filled: boolean;
  eligibility_ai_filled: boolean;
  quality_score: number; // 1-5
  category_tight: string | null;
}

// ============================================================================
// PROCESSOR RESULT TYPES
// ============================================================================

export interface IncentiveProgramClassification {
  doc_type: string; // 'utility_rebate', 'tax_credit', 'grant', etc.
  issuer: string;
  issuer_type: 'utility' | 'state' | 'federal' | 'local' | 'nonprofit';
  region: string;
  estimated_program_count: number;
  primary_technologies: string[];
}

export interface IncentiveProgramValidationResult {
  data: IncentiveProgramExtractedData;
  confidence_score: number;
  low_confidence_fields: string[];
  warnings: string[];
}

export interface IncentiveProgramProcessingResult {
  status: 'success' | 'partial' | 'failed';
  programs: IncentiveProgramValidationResult[];
  processing_time_ms: number;
  tokens_used: number;
  raw_response?: string;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface IncentiveProgramIngestRequest {
  // File upload
  file?: File;
  // OR URL
  source_url?: string;
  // Optional source metadata
  issuer?: string;
  region?: string;
}

export interface IncentiveProgramIngestResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'needs_review' | 'failed';
  programs_extracted: number;
  programs_needing_review: number;
  programs?: IncentiveProgramValidationResult[];
}

export interface IncentiveProgramStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed';
  programs_extracted: number;
  programs_needing_review: number;
  results?: {
    program_id?: string;
    program_name: string;
    data: IncentiveProgramExtractedData;
    confidence_score: number;
    needs_review: boolean;
    review_fields?: string[];
  }[];
  error?: string;
}

// ============================================================================
// DATABASE TYPES (Maps to background_jobs table structure)
// ============================================================================

export interface IncentiveProgramExtractionJob {
  id: string;
  type: 'document_extraction';
  resource_type: 'incentive_program';
  status: 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed';
  input: {
    document_id?: string;
    source_url?: string;
    issuer?: string;
    region?: string;
  };
  output: IncentiveProgramProcessingResult | null;
  error?: string;
  metadata: {
    document_name?: string;
    extraction_method: 'pdf_parse' | 'url_fetch' | 'ocr';
    document_size_bytes?: number;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
