-- IncentEdge Knowledge Index Migration
-- Phase 2: Semantic Search + Eligibility Matching
-- Description: Add embedding storage, full-text search index, and semantic search functions
-- Date: 2026-02-24

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ADD EMBEDDING COLUMN TO INCENTIVE_PROGRAMS
-- ============================================================================

ALTER TABLE incentive_programs
ADD COLUMN IF NOT EXISTS embedding vector(1536) NULL;

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS incentive_programs_embedding_idx
ON incentive_programs
USING hnsw (embedding vector_cosine_ops)
WITH (m = 4, ef_construction = 64);

-- ============================================================================
-- ADD FULL-TEXT SEARCH SUPPORT
-- ============================================================================

-- Create generated full-text search column
ALTER TABLE incentive_programs
ADD COLUMN IF NOT EXISTS fts tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(short_name, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(eligibility_summary, '')
  )
) STORED;

-- Create GiST index for full-text search
CREATE INDEX IF NOT EXISTS incentive_programs_fts_idx
ON incentive_programs
USING gist(fts);

-- ============================================================================
-- SEMANTIC SEARCH FUNCTION
-- ============================================================================

-- Vector similarity search using cosine distance
CREATE OR REPLACE FUNCTION search_programs_semantic(
  query_embedding vector,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name varchar,
  short_name varchar,
  category varchar,
  program_type varchar,
  summary text,
  amount_max decimal,
  amount_type varchar,
  state varchar,
  status varchar,
  similarity float
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip.id,
    ip.name,
    ip.short_name,
    ip.category,
    ip.program_type,
    ip.summary,
    ip.amount_max,
    ip.amount_type,
    ip.state,
    ip.status,
    (1 - (ip.embedding <=> query_embedding)) as similarity
  FROM incentive_programs ip
  WHERE ip.embedding IS NOT NULL
    AND ip.status = 'active'
    AND (1 - (ip.embedding <=> query_embedding)) > match_threshold
  ORDER BY ip.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- HYBRID SEARCH FUNCTION (Semantic + Keyword)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_programs_hybrid(
  search_query text,
  query_embedding vector,
  semantic_weight float DEFAULT 0.6,
  keyword_weight float DEFAULT 0.4,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  name varchar,
  short_name varchar,
  category varchar,
  program_type varchar,
  summary text,
  amount_max decimal,
  amount_type varchar,
  state varchar,
  status varchar,
  semantic_score float,
  keyword_score float,
  combined_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH semantic_results AS (
    SELECT
      ip.id,
      ip.name,
      ip.short_name,
      ip.category,
      ip.program_type,
      ip.summary,
      ip.amount_max,
      ip.amount_type,
      ip.state,
      ip.status,
      (1 - (ip.embedding <=> query_embedding)) as semantic_score,
      0::float as keyword_score
    FROM incentive_programs ip
    WHERE ip.embedding IS NOT NULL
      AND ip.status = 'active'
      AND (1 - (ip.embedding <=> query_embedding)) > match_threshold
  ),
  keyword_results AS (
    SELECT
      ip.id,
      ip.name,
      ip.short_name,
      ip.category,
      ip.program_type,
      ip.summary,
      ip.amount_max,
      ip.amount_type,
      ip.state,
      ip.status,
      0::float as semantic_score,
      ts_rank(ip.fts, to_tsquery('english', websearch_to_tsquery('english', search_query)))::float as keyword_score
    FROM incentive_programs ip
    WHERE ip.status = 'active'
      AND ip.fts @@ to_tsquery('english', websearch_to_tsquery('english', search_query))
  ),
  merged AS (
    SELECT
      coalesce(s.id, k.id) as id,
      coalesce(s.name, k.name) as name,
      coalesce(s.short_name, k.short_name) as short_name,
      coalesce(s.category, k.category) as category,
      coalesce(s.program_type, k.program_type) as program_type,
      coalesce(s.summary, k.summary) as summary,
      coalesce(s.amount_max, k.amount_max) as amount_max,
      coalesce(s.amount_type, k.amount_type) as amount_type,
      coalesce(s.state, k.state) as state,
      coalesce(s.status, k.status) as status,
      coalesce(s.semantic_score, k.semantic_score) as semantic_score,
      coalesce(k.keyword_score, s.keyword_score) as keyword_score
    FROM semantic_results s
    FULL OUTER JOIN keyword_results k ON s.id = k.id
  )
  SELECT
    merged.id,
    merged.name,
    merged.short_name,
    merged.category,
    merged.program_type,
    merged.summary,
    merged.amount_max,
    merged.amount_type,
    merged.state,
    merged.status,
    merged.semantic_score,
    merged.keyword_score,
    (merged.semantic_score * semantic_weight + merged.keyword_score * keyword_weight) as combined_score
  FROM merged
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- GEOGRAPHIC ELIGIBILITY FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_programs_by_location(
  target_state varchar,
  target_county varchar DEFAULT NULL,
  limit_results int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  name varchar,
  state varchar,
  category varchar,
  amount_max decimal,
  jurisdiction_level varchar
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip.id,
    ip.name,
    ip.state,
    ip.category,
    ip.amount_max,
    ip.jurisdiction_level
  FROM incentive_programs ip
  WHERE ip.status = 'active'
    AND (
      ip.jurisdiction_level = 'federal'
      OR (ip.jurisdiction_level = 'state' AND (ip.state = target_state OR ip.state IS NULL))
      OR (ip.jurisdiction_level = 'local' AND ip.state = target_state AND (
        CASE
          WHEN target_county IS NOT NULL THEN ip.counties @> ARRAY[target_county]
          ELSE TRUE
        END
      ))
    )
  ORDER BY
    CASE ip.jurisdiction_level
      WHEN 'federal' THEN 1
      WHEN 'state' THEN 2
      WHEN 'local' THEN 3
      ELSE 4
    END,
    ip.popularity_score DESC NULLS LAST
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- STACKING COMPATIBILITY FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_stackable_programs(
  program_id uuid,
  min_confidence float DEFAULT 0.5
)
RETURNS TABLE (
  compatible_program_id uuid,
  compatible_program_name varchar,
  stacking_restrictions text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ip2.id,
    ip2.name,
    ip1.stacking_restrictions::text
  FROM incentive_programs ip1
  CROSS JOIN incentive_programs ip2
  WHERE ip1.id = program_id
    AND ip2.status = 'active'
    AND ip2.id != ip1.id
    AND NOT (ip1.conflicts_with @> ARRAY[ip2.id::text])
    AND ip1.stackable = true
  ORDER BY ip2.popularity_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE PARALLEL SAFE;

-- ============================================================================
-- MATERIALIZED VIEW FOR CACHED ELIGIBILITY
-- ============================================================================

-- This view caches program metadata useful for eligibility checking
CREATE MATERIALIZED VIEW IF NOT EXISTS v_eligible_programs AS
SELECT
  id,
  name,
  short_name,
  category,
  program_type,
  state,
  status,
  amount_max,
  amount_min,
  amount_type,
  jurisdiction_level,
  sector_types,
  technology_types,
  building_types,
  entity_types,
  min_project_size,
  max_project_size,
  domestic_content_bonus,
  prevailing_wage_bonus,
  energy_community_bonus,
  low_income_bonus,
  direct_pay_eligible,
  stackable,
  popularity_score,
  confidence_score,
  COALESCE(array_length(sector_types, 1), 0) as sector_count,
  COALESCE(array_length(technology_types, 1), 0) as technology_count,
  CASE
    WHEN direct_pay_eligible THEN 1
    ELSE 0
  END as direct_pay_score
FROM incentive_programs
WHERE status = 'active';

-- Create index on materialized view for faster queries
CREATE INDEX IF NOT EXISTS v_eligible_programs_state_idx
ON v_eligible_programs(state);

CREATE INDEX IF NOT EXISTS v_eligible_programs_category_idx
ON v_eligible_programs(category);

CREATE INDEX IF NOT EXISTS v_eligible_programs_program_type_idx
ON v_eligible_programs(program_type);

-- ============================================================================
-- REFRESH FUNCTION FOR MATERIALIZED VIEW
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_eligible_programs_view()
RETURNS void AS $$
BEGIN
  -- Use non-concurrent refresh during migration (no unique index required);
  -- the trigger-based function uses CONCURRENTLY for runtime refreshes after
  -- the view is populated and a unique index exists.
  REFRESH MATERIALIZED VIEW v_eligible_programs;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR KEEPING FTS UP-TO-DATE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_incentive_programs_fts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fts := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.short_name, '') || ' ' ||
    coalesce(NEW.summary, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.eligibility_summary, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS incentive_programs_fts_update ON incentive_programs;
CREATE TRIGGER incentive_programs_fts_update
BEFORE INSERT OR UPDATE ON incentive_programs
FOR EACH ROW
EXECUTE FUNCTION update_incentive_programs_fts();

-- ============================================================================
-- PERFORMANCE STATISTICS
-- ============================================================================

-- Add column for tracking search performance
ALTER TABLE incentive_programs
ADD COLUMN IF NOT EXISTS last_search_at TIMESTAMPTZ;

ALTER TABLE incentive_programs
ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0;

-- Update search statistics trigger
CREATE OR REPLACE FUNCTION increment_program_search_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE incentive_programs
  SET
    search_count = search_count + 1,
    last_search_at = NOW()
  WHERE id = NEW.incentive_program_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger should be applied to project_incentive_matches after insertion
-- to track which programs are being searched/viewed

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Allow public read access to search functions
GRANT EXECUTE ON FUNCTION search_programs_semantic(vector, float, int) TO anon;
GRANT EXECUTE ON FUNCTION search_programs_hybrid(text, vector, float, float, float, int) TO anon;
GRANT EXECUTE ON FUNCTION get_programs_by_location(varchar, varchar, int) TO anon;
GRANT EXECUTE ON FUNCTION get_stackable_programs(uuid, float) TO authenticated;
GRANT SELECT ON v_eligible_programs TO anon;

-- ============================================================================
-- INITIAL DATA UPDATES
-- ============================================================================

-- Note: Embeddings will be generated by the application layer
-- This migration sets up the infrastructure, but actual embeddings
-- should be generated via src/lib/knowledge-index.ts EmbeddingService

-- Comment out the line below - embeddings are generated by the app
-- UPDATE incentive_programs SET embedding = NULL WHERE embedding IS NULL;

-- Initialize search counts
UPDATE incentive_programs SET search_count = 0 WHERE search_count IS NULL;

-- Refresh the materialized view
SELECT refresh_eligible_programs_view();
