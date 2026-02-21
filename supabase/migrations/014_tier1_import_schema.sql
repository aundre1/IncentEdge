-- IncentEdge Database Schema Enhancement
-- Migration: 014_tier1_import_schema
-- Description: Add fields to support Tier 1 CSV import from master dataset
-- Date: 2026-02-17
-- Purpose: Import 19,633 production-ready programs from IncentEdge_MASTER_30007_20260123.csv

-- ============================================================================
-- EXTEND INCENTIVE_PROGRAMS TABLE FOR CSV IMPORT
-- ============================================================================

-- Add CSV-specific columns that don't exist in current schema
ALTER TABLE incentive_programs
  ADD COLUMN IF NOT EXISTS deadline_raw TEXT,
  ADD COLUMN IF NOT EXISTS application_steps TEXT,
  ADD COLUMN IF NOT EXISTS pdf_links TEXT,
  ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS merged_from TEXT,
  ADD COLUMN IF NOT EXISTS funding_ai_filled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deadline_ai_filled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS eligibility_ai_filled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_api_source BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS funding_currency VARCHAR(3) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS funding_amount_raw TEXT,
  ADD COLUMN IF NOT EXISTS funding_amount_num DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS category_tight VARCHAR(100),
  ADD COLUMN IF NOT EXISTS council_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS validation_score DECIMAL(3, 2),
  ADD COLUMN IF NOT EXISTS tier INTEGER CHECK (tier BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS program_level VARCHAR(50);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_programs_tier ON incentive_programs(tier) WHERE tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programs_validation_score ON incentive_programs(validation_score DESC) WHERE validation_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programs_quality_score ON incentive_programs(quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programs_program_level ON incentive_programs(program_level) WHERE program_level IS NOT NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN incentive_programs.deadline_raw IS 'Raw deadline text from source (before parsing)';
COMMENT ON COLUMN incentive_programs.application_steps IS 'Step-by-step application instructions';
COMMENT ON COLUMN incentive_programs.pdf_links IS 'Links to PDF documentation';
COMMENT ON COLUMN incentive_programs.quality_score IS 'Original quality score from source data (0-100)';
COMMENT ON COLUMN incentive_programs.merged_from IS 'Source identifier if merged from multiple sources';
COMMENT ON COLUMN incentive_programs.funding_ai_filled IS 'True if funding amount was extracted by AI';
COMMENT ON COLUMN incentive_programs.deadline_ai_filled IS 'True if deadline was extracted by AI';
COMMENT ON COLUMN incentive_programs.eligibility_ai_filled IS 'True if eligibility was extracted by AI';
COMMENT ON COLUMN incentive_programs.is_api_source IS 'True if data came from API vs web scraping';
COMMENT ON COLUMN incentive_programs.funding_currency IS 'Currency code (USD, CAD, etc)';
COMMENT ON COLUMN incentive_programs.funding_amount_raw IS 'Raw funding amount text from source';
COMMENT ON COLUMN incentive_programs.funding_amount_num IS 'Parsed numeric funding amount';
COMMENT ON COLUMN incentive_programs.category_tight IS 'Narrow category classification';
COMMENT ON COLUMN incentive_programs.council_source IS 'Council or organization source';
COMMENT ON COLUMN incentive_programs.validation_score IS 'Calculated validation score (0.00-1.00) based on data completeness';
COMMENT ON COLUMN incentive_programs.tier IS 'Data tier: 1=Production Ready, 2=Needs Enrichment, 3=URL Recovery, 4=Research Queue, 5=Quarantine';
COMMENT ON COLUMN incentive_programs.program_level IS 'Program level classification from source data';

-- ============================================================================
-- UPDATE RLS POLICIES
-- ============================================================================
-- No RLS changes needed - existing policies cover new columns
