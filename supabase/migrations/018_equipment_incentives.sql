-- IncentEdge Database Schema
-- Migration: 018_equipment_incentives
-- Description: Equipment incentive category enhancement for 700+ equipment-specific programs
-- Date: 2026-02-25
-- Author: CoCo (AI Execution Partner)
-- Target: Supabase PostgreSQL 15 (project pzmunszcxmmncppbufoj)
--
-- CONTEXT:
-- The platform has 700+ equipment incentives (HVAC, lighting, solar, EV chargers,
-- manufacturing equipment, etc.) mixed in with real estate incentives. This migration
-- adds proper categorization so equipment incentives can be filtered, searched, and
-- matched separately from real estate development incentives.
--
-- NOTE ON EXISTING COLUMNS:
-- incentive_programs already has:
--   - sector_types TEXT[] (from 001) — broad sector classification
--   - technology_types TEXT[] (from 001) — technology classification
-- This migration adds:
--   - equipment_category VARCHAR(100) — specific equipment type classification
--   - sector_tags TEXT[] — flexible tagging for cross-cutting concerns

-- ============================================================================
-- ADD EQUIPMENT CATEGORY COLUMN
-- ============================================================================

ALTER TABLE incentive_programs
    ADD COLUMN IF NOT EXISTS equipment_category VARCHAR(100);

-- ============================================================================
-- ADD SECTOR TAGS COLUMN
-- ============================================================================
-- Flexible tagging system for cross-cutting concerns that don't fit neatly
-- into the existing sector_types array. Examples: 'equipment', 'retrofit',
-- 'new_construction_only', 'disadvantaged_community', 'rural'

ALTER TABLE incentive_programs
    ADD COLUMN IF NOT EXISTS sector_tags TEXT[] DEFAULT '{}';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Equipment category filter (partial index — only rows with equipment)
CREATE INDEX IF NOT EXISTS idx_incentive_programs_equipment_category
    ON incentive_programs(equipment_category)
    WHERE equipment_category IS NOT NULL;

-- GIN index on sector_tags for array containment queries (@>, &&)
CREATE INDEX IF NOT EXISTS idx_incentive_programs_sector_tags
    ON incentive_programs USING GIN(sector_tags);

-- ============================================================================
-- CHECK CONSTRAINT: valid equipment categories
-- ============================================================================
-- Using a check constraint rather than an ENUM to allow future categories
-- without a migration. The application layer should validate against this list.

ALTER TABLE incentive_programs
    ADD CONSTRAINT chk_equipment_category_valid
    CHECK (equipment_category IS NULL OR equipment_category IN (
        'hvac',
        'lighting',
        'solar_pv',
        'ev_charging',
        'energy_storage',
        'manufacturing_equipment',
        'agricultural_equipment',
        'medical_equipment',
        'vehicles',
        'building_envelope',
        'water_heating',
        'appliances',
        'other'
    ));

-- ============================================================================
-- CONVENIENCE VIEW: equipment_incentive_programs
-- Unified view of all equipment-related incentive programs
-- ============================================================================

CREATE OR REPLACE VIEW equipment_incentive_programs AS
SELECT
    id,
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    equipment_category,
    sector_tags,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    municipalities,
    incentive_type,
    amount_type,
    amount_fixed,
    amount_percentage,
    amount_per_unit,
    amount_per_kw,
    amount_per_sqft,
    amount_min,
    amount_max,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    end_date,
    application_deadline,
    administrator,
    administering_agency,
    source_url,
    application_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score,
    popularity_score,
    created_at,
    updated_at
FROM incentive_programs
WHERE equipment_category IS NOT NULL
   OR 'equipment' = ANY(sector_tags);

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Equipment view follows the same access pattern as incentive_programs (public read for active)
GRANT SELECT ON equipment_incentive_programs TO anon;
GRANT SELECT ON equipment_incentive_programs TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN incentive_programs.equipment_category IS 'Equipment type classification: hvac, lighting, solar_pv, ev_charging, energy_storage, manufacturing_equipment, agricultural_equipment, medical_equipment, vehicles, building_envelope, water_heating, appliances, other';
COMMENT ON COLUMN incentive_programs.sector_tags IS 'Flexible text array tags for cross-cutting concerns: equipment, retrofit, new_construction_only, disadvantaged_community, rural, etc.';
COMMENT ON VIEW equipment_incentive_programs IS 'Convenience view of all equipment-related incentive programs. Includes programs with equipment_category set OR tagged with equipment in sector_tags.';

-- ============================================================================
-- SEED: Tag existing equipment programs
-- ============================================================================
-- Update programs that are likely equipment-related based on technology_types
-- This is a best-effort categorization; manual review is recommended.

UPDATE incentive_programs
SET equipment_category = 'solar_pv',
    sector_tags = array_append(COALESCE(sector_tags, '{}'), 'equipment')
WHERE equipment_category IS NULL
  AND ('solar' = ANY(technology_types) OR 'solar_pv' = ANY(technology_types))
  AND (program_type ILIKE '%rebate%' OR program_type ILIKE '%equipment%')
  AND id NOT IN (SELECT id FROM incentive_programs WHERE equipment_category IS NOT NULL);

UPDATE incentive_programs
SET equipment_category = 'energy_storage',
    sector_tags = array_append(COALESCE(sector_tags, '{}'), 'equipment')
WHERE equipment_category IS NULL
  AND ('battery_storage' = ANY(technology_types) OR 'battery' = ANY(technology_types))
  AND (program_type ILIKE '%rebate%' OR program_type ILIKE '%equipment%');

UPDATE incentive_programs
SET equipment_category = 'ev_charging',
    sector_tags = array_append(COALESCE(sector_tags, '{}'), 'equipment')
WHERE equipment_category IS NULL
  AND ('ev_charging' = ANY(technology_types) OR 'ev' = ANY(technology_types));

UPDATE incentive_programs
SET equipment_category = 'hvac',
    sector_tags = array_append(COALESCE(sector_tags, '{}'), 'equipment')
WHERE equipment_category IS NULL
  AND ('geothermal_heat_pump' = ANY(technology_types) OR 'chp' = ANY(technology_types))
  AND (program_type ILIKE '%rebate%' OR program_type ILIKE '%equipment%');

-- Refresh the materialized eligibility view to include new columns
-- (safe to call — function exists from migration 015)
-- Note: Only run if the materialized view exists and has been set up
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'v_eligible_programs') THEN
        PERFORM refresh_eligible_programs_view();
    END IF;
END $$;
