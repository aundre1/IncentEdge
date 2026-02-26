-- IncentEdge Database Schema
-- Migration: 017_probability_scoring
-- Description: Probability scoring cache for project+program approval predictions
-- Date: 2026-02-25
-- Author: CoCo (AI Execution Partner)
-- Target: Supabase PostgreSQL 15 (project pzmunszcxmmncppbufoj)
--
-- CONTEXT:
-- When a user views a project's matched incentive programs, we compute a probability
-- of approval based on comparable awarded applications (migration 016). These scores
-- are expensive to compute (aggregating across millions of records), so we cache them
-- with a 7-day TTL. The cache is keyed on (project_id, program_id) with UPSERT semantics.
--
-- FLOW:
-- 1. User opens project → system checks probability_scores for cached scores
-- 2. If cache miss or stale → compute from awarded_applications + program_award_stats
-- 3. Store result in probability_scores with 7-day expiry
-- 4. Frontend displays "73% approval probability (based on 1,247 comparable awards)"

-- ============================================================================
-- PROBABILITY SCORES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS probability_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- The project+program combination this score is for
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,

    -- The computed probability (0.00 - 100.00)
    approval_probability NUMERIC(5, 2)
        CHECK (approval_probability >= 0 AND approval_probability <= 100),

    -- Confidence in the probability estimate (how many data points we have)
    sample_size INTEGER,
    confidence_level VARCHAR(20) CHECK (confidence_level IN (
        'very_high',          -- 500+ comparable awards
        'high',               -- 100-499 comparable awards
        'medium',             -- 25-99 comparable awards
        'low',                -- 5-24 comparable awards
        'insufficient_data'   -- <5 comparable awards
    )),

    -- Key factors that drove the probability
    -- Example: {"location_match": 0.9, "sector_match": 1.0, "applicant_type_match": 0.7,
    --           "tdc_range_match": 0.85, "ira_bonus_factor": 0.1}
    factors JSONB,

    -- Comparable data used
    comparable_awards_count INTEGER,
    avg_comparable_award NUMERIC(15, 2),

    -- Cache management
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    is_stale BOOLEAN DEFAULT false,

    -- Unique constraint: one score per project+program combination
    UNIQUE(project_id, program_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Lookup by project (show all program scores for a project)
CREATE INDEX IF NOT EXISTS idx_probability_scores_project_id
    ON probability_scores(project_id);

-- Lookup by program (show all project scores for a program)
CREATE INDEX IF NOT EXISTS idx_probability_scores_program_id
    ON probability_scores(program_id);

-- Cache expiry management: find non-stale scores nearing expiration
CREATE INDEX IF NOT EXISTS idx_probability_scores_expires
    ON probability_scores(expires_at)
    WHERE NOT is_stale;

-- High-probability matches (for "top opportunities" features)
CREATE INDEX IF NOT EXISTS idx_probability_scores_high_probability
    ON probability_scores(approval_probability DESC)
    WHERE NOT is_stale AND approval_probability >= 50;

-- ============================================================================
-- TRIGGER: auto-update computed_at on refresh
-- ============================================================================
-- When a score is updated (refreshed), reset the cache timestamps

CREATE OR REPLACE FUNCTION update_probability_score_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- Only reset timestamps if the probability actually changed
    IF OLD.approval_probability IS DISTINCT FROM NEW.approval_probability THEN
        NEW.computed_at = NOW();
        NEW.expires_at = NOW() + INTERVAL '7 days';
        NEW.is_stale = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER probability_scores_timestamp_update
    BEFORE UPDATE ON probability_scores
    FOR EACH ROW EXECUTE FUNCTION update_probability_score_timestamps();

-- ============================================================================
-- FUNCTION: mark_stale_scores
-- Called periodically (e.g., after new awarded_applications imports)
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_stale_probability_scores()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE probability_scores
    SET is_stale = true
    WHERE expires_at < NOW()
      AND is_stale = false;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: get_probability_score
-- Convenience function to get a cached score or NULL if stale/missing
-- ============================================================================

CREATE OR REPLACE FUNCTION get_probability_score(
    p_project_id UUID,
    p_program_id UUID
)
RETURNS TABLE (
    approval_probability NUMERIC(5, 2),
    confidence_level VARCHAR(20),
    sample_size INTEGER,
    factors JSONB,
    comparable_awards_count INTEGER,
    avg_comparable_award NUMERIC(15, 2),
    computed_at TIMESTAMPTZ,
    is_fresh BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ps.approval_probability,
        ps.confidence_level,
        ps.sample_size,
        ps.factors,
        ps.comparable_awards_count,
        ps.avg_comparable_award,
        ps.computed_at,
        (NOT ps.is_stale AND ps.expires_at > NOW()) AS is_fresh
    FROM probability_scores ps
    WHERE ps.project_id = p_project_id
      AND ps.program_id = p_program_id;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE probability_scores ENABLE ROW LEVEL SECURITY;

-- Users can read probability scores for their organization's projects only
-- Joins through projects → organization_id → profiles to check ownership
CREATE POLICY "Org members can view probability scores"
    ON probability_scores
    FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT p.id FROM projects p
            WHERE p.organization_id IN (
                SELECT pr.organization_id FROM profiles pr
                WHERE pr.id = auth.uid()
            )
        )
    );

-- Service role can manage all scores (for background computation jobs)
CREATE POLICY "Service role can manage probability scores"
    ON probability_scores
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_probability_score(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_stale_probability_scores() TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE probability_scores IS 'Cached probability scores for project+program approval predictions. Computed from 6.5M awarded applications data. 7-day TTL with staleness tracking.';
COMMENT ON COLUMN probability_scores.approval_probability IS 'Predicted approval probability 0-100%, based on comparable historical awards';
COMMENT ON COLUMN probability_scores.confidence_level IS 'Statistical confidence based on sample size: very_high (500+), high (100-499), medium (25-99), low (5-24), insufficient_data (<5)';
COMMENT ON COLUMN probability_scores.factors IS 'JSONB breakdown of scoring factors: location_match, sector_match, applicant_type_match, tdc_range_match, etc.';
COMMENT ON COLUMN probability_scores.is_stale IS 'TRUE when the score has expired or been invalidated by new data imports';
COMMENT ON FUNCTION get_probability_score IS 'Retrieve cached probability score for a project+program pair. Returns is_fresh=false if cache has expired.';
COMMENT ON FUNCTION mark_stale_probability_scores IS 'Batch-mark expired probability scores as stale. Run after importing new awarded applications data.';
