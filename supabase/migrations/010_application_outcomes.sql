-- IncentEdge Database Schema
-- Migration: 010_application_outcomes
-- Description: Application outcomes table for data moat (ML training data)
-- Date: 2026-01-15
-- Reference: PRD Section 4.3 - application_outcomes table

-- ============================================================================
-- APPLICATION OUTCOMES TABLE (Data Moat)
-- ============================================================================
-- This table collects historical application data from FOIA requests,
-- public records, and user submissions. Used for ML training and
-- success prediction algorithms.

CREATE TABLE IF NOT EXISTS application_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,

    -- Application Details
    applicant_type VARCHAR(50), -- developer, owner, nonprofit, municipal, etc.
    project_type VARCHAR(50), -- multifamily, solar, battery, mixed_use, etc.
    project_size_sqft DECIMAL(12, 2),
    project_cost DECIMAL(15, 2),
    amount_requested DECIMAL(15, 2),

    -- Outcome
    outcome VARCHAR(20) CHECK (outcome IN ('approved', 'denied', 'partial', 'withdrawn')),
    amount_approved DECIMAL(15, 2),
    decision_date DATE,

    -- Timeline
    submission_date DATE,
    days_to_decision INTEGER,

    -- Learning Data (for ML training)
    denial_reasons JSONB, -- Array of reason codes/descriptions
    reviewer_feedback TEXT,
    appeal_outcome VARCHAR(20) CHECK (appeal_outcome IN ('approved', 'denied', 'pending', NULL)),
    appeal_date DATE,

    -- Location Context
    state VARCHAR(2),
    county VARCHAR(100),
    census_tract VARCHAR(20),

    -- Project Characteristics
    affordable_percentage DECIMAL(5, 2),
    has_prevailing_wage BOOLEAN,
    has_domestic_content BOOLEAN,
    energy_community BOOLEAN,

    -- Source
    data_source VARCHAR(50) CHECK (data_source IN ('foia', 'public_record', 'user_submitted', 'api_import')),
    source_document_url TEXT,
    source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

    -- Confidence in data accuracy
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Query by program for success rate analysis
CREATE INDEX idx_outcomes_program ON application_outcomes(incentive_program_id);

-- Query by outcome for statistics
CREATE INDEX idx_outcomes_outcome ON application_outcomes(outcome);

-- Query by project type for pattern analysis
CREATE INDEX idx_outcomes_project_type ON application_outcomes(project_type);

-- Query by state for geographic analysis
CREATE INDEX idx_outcomes_state ON application_outcomes(state);

-- Query by source for data quality analysis
CREATE INDEX idx_outcomes_source ON application_outcomes(data_source);

-- Query by date for trend analysis
CREATE INDEX idx_outcomes_decision_date ON application_outcomes(decision_date);

-- Query approved amounts for value analysis
CREATE INDEX idx_outcomes_approved ON application_outcomes(amount_approved) WHERE amount_approved IS NOT NULL;

-- GIN index on denial reasons for searching
CREATE INDEX idx_outcomes_denial_reasons ON application_outcomes USING GIN(denial_reasons);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE application_outcomes ENABLE ROW LEVEL SECURITY;

-- Public read access to aggregated outcome data (anonymized)
-- Specific implementation depends on privacy requirements
CREATE POLICY "Anyone can view anonymized outcomes" ON application_outcomes
    FOR SELECT USING (true);

-- Only admins can insert/update outcome data
CREATE POLICY "Admins can manage outcomes" ON application_outcomes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- TRIGGER
-- ============================================================================

CREATE TRIGGER update_application_outcomes_updated_at
    BEFORE UPDATE ON application_outcomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE application_outcomes IS 'Historical application outcomes for ML training and success prediction. Data moat for IncentEdge competitive advantage.';
COMMENT ON COLUMN application_outcomes.denial_reasons IS 'JSONB array of denial reason codes and descriptions for pattern analysis';
COMMENT ON COLUMN application_outcomes.confidence_score IS 'Data quality confidence from 0.00 (low) to 1.00 (high)';
COMMENT ON COLUMN application_outcomes.data_source IS 'Origin of data: FOIA request, public record, user submission, or API import';
