-- IncentEdge Database Schema
-- Migration: 016_awarded_applications
-- Description: Awarded applications data foundation for probability scoring engine (6.5M records)
-- Date: 2026-02-25
-- Author: CoCo (AI Execution Partner)
-- Target: Supabase PostgreSQL 15 (project pzmunszcxmmncppbufoj)
--
-- CONTEXT:
-- This table stores 6.5M successfully awarded incentive applications across all programs.
-- It is the data foundation for Silo 2 (Grant Writing AI) — enabling probability-based
-- approval predictions like "Based on 6.5M successful awards, your project has a 73%
-- probability of approval for this program."
--
-- RELATIONSHIP TO application_outcomes (migration 010):
-- application_outcomes = IncentEdge user-submitted + FOIA data (internal/organic)
-- awarded_applications = bulk external award data from government databases (6.5M records)
-- They are complementary datasets. awarded_applications is optimized for aggregate
-- statistical analysis; application_outcomes is optimized for individual case learning.

-- ============================================================================
-- AWARDED APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS awarded_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Link to incentive program
    program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,

    -- Project characteristics at time of award
    project_type VARCHAR(50) CHECK (project_type IN (
        'residential', 'commercial', 'mixed_use', 'industrial', 'other'
    )),
    sector VARCHAR(100) CHECK (sector IN (
        'affordable_housing', 'clean_energy', 'historic_rehab',
        'commercial_re', 'infrastructure', 'water_wastewater',
        'transportation', 'manufacturing', 'agriculture',
        'education', 'healthcare', 'tribal', 'other'
    )),
    size_sqft DECIMAL(12, 2),
    tdc_range VARCHAR(20) CHECK (tdc_range IN (
        'under_1m', '1m_5m', '5m_25m', '25m_100m', 'over_100m'
    )),

    -- Jurisdiction
    jurisdiction_state CHAR(2),
    jurisdiction_county VARCHAR(100),
    jurisdiction_city VARCHAR(100),
    census_tract VARCHAR(20),

    -- Award details
    amount_requested NUMERIC(15, 2),
    amount_awarded NUMERIC(15, 2),
    award_date DATE,
    application_date DATE,
    funding_cycle VARCHAR(100),

    -- Applicant characteristics
    applicant_type VARCHAR(50) CHECK (applicant_type IN (
        'nonprofit', 'for_profit', 'government', 'tribal', 'other'
    )),
    years_of_experience INTEGER,
    prior_awards_count INTEGER,

    -- IRA-specific fields
    ira_bonus_claimed BOOLEAN DEFAULT false,
    section_6418_transfer BOOLEAN DEFAULT false,

    -- Outcome
    was_funded BOOLEAN DEFAULT true,
    rejection_reason VARCHAR(500),
    compliance_completed BOOLEAN,

    -- Metadata
    data_source VARCHAR(100),
    confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup: join to incentive_programs for per-program stats
CREATE INDEX IF NOT EXISTS idx_awarded_applications_program_id
    ON awarded_applications(program_id);

-- Composite: geographic + project type queries (most common filter pattern)
CREATE INDEX IF NOT EXISTS idx_awarded_applications_state_type
    ON awarded_applications(jurisdiction_state, project_type);

-- Partial: quick approval rate queries (funded records by program)
CREATE INDEX IF NOT EXISTS idx_awarded_applications_funded_program
    ON awarded_applications(program_id)
    WHERE was_funded = true;

-- Trend analysis: award dates for time-series queries
CREATE INDEX IF NOT EXISTS idx_awarded_applications_award_date
    ON awarded_applications(award_date);

-- Provenance: filter by data source for confidence-weighted queries
CREATE INDEX IF NOT EXISTS idx_awarded_applications_data_source
    ON awarded_applications(data_source);

-- Sector filtering
CREATE INDEX IF NOT EXISTS idx_awarded_applications_sector
    ON awarded_applications(sector);

-- Applicant type filtering (for "projects like yours" comparisons)
CREATE INDEX IF NOT EXISTS idx_awarded_applications_applicant_type
    ON awarded_applications(applicant_type);

-- TDC range filtering (cost bracket comparisons)
CREATE INDEX IF NOT EXISTS idx_awarded_applications_tdc_range
    ON awarded_applications(tdc_range);

-- ============================================================================
-- TRIGGER: auto-update updated_at
-- ============================================================================
-- Reuses the update_updated_at_column() function from migration 001

CREATE TRIGGER update_awarded_applications_updated_at
    BEFORE UPDATE ON awarded_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEW: program_award_stats
-- Aggregated award statistics by program, project type, state, and applicant type
-- Regular view (not materialized) — Supabase handles caching at the query layer
-- ============================================================================

CREATE OR REPLACE VIEW program_award_stats AS
SELECT
    program_id,
    project_type,
    jurisdiction_state,
    applicant_type,
    COUNT(*) AS total_applications,
    SUM(CASE WHEN was_funded THEN 1 ELSE 0 END) AS total_funded,
    CASE
        WHEN COUNT(*) > 0
        THEN ROUND(
            SUM(CASE WHEN was_funded THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100,
            1
        )
        ELSE NULL
    END AS approval_rate_pct,
    AVG(amount_awarded) FILTER (WHERE was_funded) AS avg_award_amount,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount_awarded)
        FILTER (WHERE was_funded) AS median_award_amount,
    MIN(award_date) AS earliest_award,
    MAX(award_date) AS most_recent_award,
    AVG((award_date - application_date))
        FILTER (WHERE award_date IS NOT NULL AND application_date IS NOT NULL)
        AS avg_processing_days,
    MAX(confidence_score) AS max_data_confidence
FROM awarded_applications
GROUP BY program_id, project_type, jurisdiction_state, applicant_type;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE awarded_applications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all awarded applications data
-- This is aggregate/anonymous public record data, not user-private data
CREATE POLICY "Authenticated users can view awarded applications"
    ON awarded_applications
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service_role can insert (bulk data imports from ETL pipelines)
-- Note: service_role bypasses RLS by default in Supabase, but we define
-- explicit policies for documentation and defense-in-depth
CREATE POLICY "Service role can insert awarded applications"
    ON awarded_applications
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Only service_role can update (data corrections, confidence score updates)
CREATE POLICY "Service role can update awarded applications"
    ON awarded_applications
    FOR UPDATE
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- GRANT: view access on the stats view
-- ============================================================================

GRANT SELECT ON program_award_stats TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE awarded_applications IS 'Historical data of 6.5M awarded incentive applications from government databases. Foundation for probability scoring engine and Grant Writing AI (Silo 2).';
COMMENT ON COLUMN awarded_applications.program_id IS 'FK to incentive_programs — which program this award was for';
COMMENT ON COLUMN awarded_applications.project_type IS 'Project type at time of award: residential, commercial, mixed_use, industrial, other';
COMMENT ON COLUMN awarded_applications.sector IS 'Industry sector: affordable_housing, clean_energy, historic_rehab, etc.';
COMMENT ON COLUMN awarded_applications.tdc_range IS 'Total development cost bracket: under_1m through over_100m';
COMMENT ON COLUMN awarded_applications.ira_bonus_claimed IS 'Whether IRA direct pay or transferability bonus was claimed';
COMMENT ON COLUMN awarded_applications.section_6418_transfer IS 'Whether IRA Section 6418 credit transfer was used';
COMMENT ON COLUMN awarded_applications.was_funded IS 'TRUE if application was funded, FALSE if rejected. Defaults to TRUE since most imported records are successful awards.';
COMMENT ON COLUMN awarded_applications.data_source IS 'Origin of record: SAM.gov, HUD, DOE, Grants.gov, state database, etc.';
COMMENT ON COLUMN awarded_applications.confidence_score IS 'Data reliability score 0.00-1.00. Higher = more fields verified from official source.';
COMMENT ON VIEW program_award_stats IS 'Aggregated approval rates, award amounts, and processing times grouped by program, project type, state, and applicant type. Drives the probability scoring engine.';
