# IncentEdge Data Import Guide

**Version:** 1.0
**Date:** Feb 25, 2026
**Migration Dependency:** `016_awarded_applications.sql`

## Overview

This guide covers importing the 6.5M awarded incentive applications into the `awarded_applications` table. This data is the foundation for IncentEdge's probability scoring engine and Grant Writing AI (Silo 2).

The `awarded_applications` table is distinct from `application_outcomes` (migration 010). The outcomes table stores IncentEdge user-submitted and FOIA data for individual ML training. The awarded applications table stores bulk government records for aggregate statistical analysis.

## Expected Data Format

### CSV Schema for Awarded Applications

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| `program_external_id` | VARCHAR(100) | Yes | `IRA-ITC-48` | Maps to `incentive_programs.external_id` |
| `project_type` | VARCHAR(50) | Yes | `commercial` | One of: residential, commercial, mixed_use, industrial, other |
| `sector` | VARCHAR(100) | No | `clean_energy` | One of: affordable_housing, clean_energy, historic_rehab, commercial_re, infrastructure, water_wastewater, transportation, manufacturing, agriculture, education, healthcare, tribal, other |
| `size_sqft` | DECIMAL | No | `45000.00` | Square footage |
| `tdc_range` | VARCHAR(20) | No | `5m_25m` | One of: under_1m, 1m_5m, 5m_25m, 25m_100m, over_100m |
| `jurisdiction_state` | CHAR(2) | Yes | `NY` | Two-letter state code |
| `jurisdiction_county` | VARCHAR(100) | No | `Westchester` | County name |
| `jurisdiction_city` | VARCHAR(100) | No | `White Plains` | City name |
| `census_tract` | VARCHAR(20) | No | `36119000100` | FIPS census tract code |
| `amount_requested` | NUMERIC(15,2) | No | `500000.00` | Amount requested in USD |
| `amount_awarded` | NUMERIC(15,2) | Yes* | `450000.00` | Amount awarded in USD (*required if was_funded=true) |
| `award_date` | DATE | Yes* | `2024-06-15` | ISO 8601 date (*required if was_funded=true) |
| `application_date` | DATE | No | `2024-01-20` | ISO 8601 date |
| `funding_cycle` | VARCHAR(100) | No | `FY2024-Q2` | Funding cycle identifier |
| `applicant_type` | VARCHAR(50) | Yes | `for_profit` | One of: nonprofit, for_profit, government, tribal, other |
| `years_of_experience` | INTEGER | No | `12` | Applicant years in business |
| `prior_awards_count` | INTEGER | No | `3` | Number of prior awards from same program |
| `ira_bonus_claimed` | BOOLEAN | No | `false` | IRA direct pay or transferability bonus |
| `section_6418_transfer` | BOOLEAN | No | `false` | IRA Section 6418 credit transfer |
| `was_funded` | BOOLEAN | No | `true` | Defaults to true |
| `rejection_reason` | VARCHAR(500) | No | `Incomplete documentation` | Only for was_funded=false |
| `compliance_completed` | BOOLEAN | No | `true` | Post-award compliance status |
| `data_source` | VARCHAR(100) | Yes | `SAM.gov` | Origin of this record |
| `confidence_score` | NUMERIC(3,2) | Yes | `0.95` | Data quality score 0.00-1.00 |

## Import Process

### Step 1: Prepare the Data

Before importing, clean and validate the CSV data:

```bash
# Example validation script (Python)
import pandas as pd

df = pd.read_csv('awarded_applications_raw.csv')

# Remove exact duplicates
df = df.drop_duplicates()

# Validate required fields
assert df['program_external_id'].notna().all(), "Missing program IDs"
assert df['jurisdiction_state'].str.len().eq(2).all(), "Invalid state codes"
assert df['data_source'].notna().all(), "Missing data sources"
assert df['confidence_score'].between(0, 1).all(), "Invalid confidence scores"

# Validate amounts for funded records
funded = df[df['was_funded'] == True]
assert funded['amount_awarded'].gt(0).all(), "Funded records must have amount_awarded > 0"

# Validate dates
df['award_date'] = pd.to_datetime(df['award_date'], errors='coerce')
df['application_date'] = pd.to_datetime(df['application_date'], errors='coerce')

# Check: award_date should be >= application_date (where both exist)
both_dates = df.dropna(subset=['award_date', 'application_date'])
invalid_dates = both_dates[both_dates['award_date'] < both_dates['application_date']]
print(f"Records with award_date before application_date: {len(invalid_dates)}")

# Map program_external_id to program_id (UUID)
# This requires querying the incentive_programs table
```

### Step 2: Map Program IDs

The CSV uses `program_external_id` (e.g., `IRA-ITC-48`) but the table needs `program_id` (UUID). Generate the mapping:

```sql
-- Export mapping table
SELECT id AS program_id, external_id AS program_external_id
FROM incentive_programs
WHERE external_id IS NOT NULL;
```

```python
# Apply mapping in Python
program_map = dict(zip(mapping_df['program_external_id'], mapping_df['program_id']))
df['program_id'] = df['program_external_id'].map(program_map)

# Check for unmapped programs
unmapped = df[df['program_id'].isna()]
print(f"Unmapped programs: {len(unmapped)} ({unmapped['program_external_id'].nunique()} unique)")

# Decision: skip unmapped or import with NULL program_id
# Recommendation: Import with NULL, then create the missing programs and backfill
```

### Step 3: Batch Import (Supabase)

#### Option A: Direct PostgreSQL COPY (fastest, recommended for 6.5M rows)

Connect to Supabase PostgreSQL directly:

```bash
# Get connection string from Supabase Dashboard > Settings > Database
psql "postgresql://postgres:[PASSWORD]@db.pzmunszcxmmncppbufoj.supabase.co:5432/postgres"
```

```sql
-- Import from prepared CSV (program_id already resolved)
\COPY awarded_applications(
    program_id, project_type, sector, size_sqft, tdc_range,
    jurisdiction_state, jurisdiction_county, jurisdiction_city, census_tract,
    amount_requested, amount_awarded, award_date, application_date, funding_cycle,
    applicant_type, years_of_experience, prior_awards_count,
    ira_bonus_claimed, section_6418_transfer,
    was_funded, rejection_reason, compliance_completed,
    data_source, confidence_score
)
FROM '/path/to/awarded_applications_clean.csv'
WITH (FORMAT csv, HEADER true, NULL '');
```

Expected import time for 6.5M rows: approximately 5-15 minutes depending on connection speed.

#### Option B: Supabase Client (for smaller batches or cloud functions)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // Must use service_role for INSERT
);

const BATCH_SIZE = 1000;

async function importBatch(data) {
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('awarded_applications')
      .insert(batch);

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE} failed:`, error);
      // Log failed batch for retry
    }

    if (i % (BATCH_SIZE * 100) === 0) {
      console.log(`Progress: ${i.toLocaleString()} / ${data.length.toLocaleString()}`);
    }
  }
}
```

Note: For 6.5M rows at 1000/batch, this is 6,500 API calls. Consider Option A for the initial bulk load, then use Option B for incremental updates.

#### Option C: Split file import (for very large datasets)

```bash
# Split the 6.5M row file into chunks of 500K
split -l 500000 awarded_applications_clean.csv chunk_

# Import each chunk separately
for chunk in chunk_*; do
  psql "postgresql://..." -c "\COPY awarded_applications(...) FROM '$chunk' WITH (FORMAT csv, NULL '');"
  echo "Imported $chunk"
done
```

### Step 4: Refresh Statistics

After import, the `program_award_stats` view automatically reflects new data (it is a regular view, not materialized). No refresh needed.

However, you should mark any existing probability_scores as stale:

```sql
-- Mark all cached probability scores as stale (they need recomputation)
SELECT mark_stale_probability_scores();

-- Or force-stale everything after a major import:
UPDATE probability_scores SET is_stale = true;
```

### Step 5: Quality Checks

Run these queries after import to verify data integrity:

```sql
-- 1. Check total count (should be ~6.5M)
SELECT COUNT(*) AS total_records FROM awarded_applications;

-- 2. Check counts by data source
SELECT data_source, COUNT(*) AS record_count
FROM awarded_applications
GROUP BY data_source
ORDER BY record_count DESC;

-- 3. Check approval rates are reasonable (should be 20-80% for most programs)
SELECT
    ip.name AS program_name,
    pas.approval_rate_pct,
    pas.total_applications,
    pas.total_funded
FROM program_award_stats pas
JOIN incentive_programs ip ON ip.id = pas.program_id
WHERE pas.approval_rate_pct < 5 OR pas.approval_rate_pct > 95
ORDER BY pas.approval_rate_pct;

-- 4. Check for orphaned records (program_id not in incentive_programs)
SELECT COUNT(*) AS orphaned_records
FROM awarded_applications aa
LEFT JOIN incentive_programs ip ON aa.program_id = ip.id
WHERE aa.program_id IS NOT NULL AND ip.id IS NULL;

-- 5. Check confidence score distribution
SELECT
    CASE
        WHEN confidence_score >= 0.90 THEN '0.90-1.00 (Excellent)'
        WHEN confidence_score >= 0.75 THEN '0.75-0.89 (Good)'
        WHEN confidence_score >= 0.50 THEN '0.50-0.74 (Fair)'
        ELSE '0.00-0.49 (Low)'
    END AS confidence_band,
    COUNT(*) AS record_count,
    ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 1) AS pct
FROM awarded_applications
GROUP BY 1
ORDER BY 1;

-- 6. Check date range coverage
SELECT
    MIN(award_date) AS earliest_award,
    MAX(award_date) AS latest_award,
    COUNT(DISTINCT EXTRACT(YEAR FROM award_date)) AS years_covered
FROM awarded_applications
WHERE award_date IS NOT NULL;

-- 7. Check geographic coverage
SELECT
    jurisdiction_state,
    COUNT(*) AS record_count
FROM awarded_applications
WHERE jurisdiction_state IS NOT NULL
GROUP BY jurisdiction_state
ORDER BY record_count DESC
LIMIT 20;

-- 8. Verify index usage (run after a few queries)
SELECT
    indexrelname AS index_name,
    idx_scan AS times_used,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE relname = 'awarded_applications'
ORDER BY idx_scan DESC;
```

## Deduplication Strategy

### During Import

Before importing, deduplicate on this composite key:
- `program_external_id` + `jurisdiction_state` + `award_date` + `amount_awarded` + `applicant_type`

```python
# Deduplicate in Python before import
dedup_cols = ['program_external_id', 'jurisdiction_state', 'award_date',
              'amount_awarded', 'applicant_type']
df = df.drop_duplicates(subset=dedup_cols, keep='first')
```

### After Import

If duplicates slip through, use this query to identify and remove them:

```sql
-- Find duplicates
WITH dupes AS (
    SELECT id, program_id, jurisdiction_state, award_date, amount_awarded, applicant_type,
           ROW_NUMBER() OVER (
               PARTITION BY program_id, jurisdiction_state, award_date, amount_awarded, applicant_type
               ORDER BY confidence_score DESC NULLS LAST, created_at ASC
           ) AS rn
    FROM awarded_applications
)
SELECT COUNT(*) AS duplicate_count FROM dupes WHERE rn > 1;

-- Remove duplicates (keep highest confidence record)
DELETE FROM awarded_applications
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY program_id, jurisdiction_state, award_date, amount_awarded, applicant_type
                   ORDER BY confidence_score DESC NULLS LAST, created_at ASC
               ) AS rn
        FROM awarded_applications
    ) sub
    WHERE rn > 1
);
```

### Cross-Source Deduplication

When the same award appears in multiple sources (e.g., SAM.gov AND state database), keep the higher-confidence record:

```sql
-- Identify cross-source duplicates
SELECT
    a1.id AS id_1, a1.data_source AS source_1, a1.confidence_score AS conf_1,
    a2.id AS id_2, a2.data_source AS source_2, a2.confidence_score AS conf_2
FROM awarded_applications a1
JOIN awarded_applications a2 ON
    a1.program_id = a2.program_id
    AND a1.jurisdiction_state = a2.jurisdiction_state
    AND a1.award_date = a2.award_date
    AND a1.amount_awarded = a2.amount_awarded
    AND a1.id < a2.id  -- avoid self-join duplicates
LIMIT 100;
```

## Data Sources

The 6.5M awarded applications come from these sources. Each source has a different reliability level:

| Source | Records (est.) | Confidence Score | Fields Available |
|--------|---------------|------------------|-----------------|
| **SAM.gov** | ~2.5M | 0.95 | All fields, official federal record |
| **Grants.gov** | ~1.5M | 0.90 | Most fields, official federal portal |
| **HUD Award Announcements** | ~500K | 0.85 | Award amount, date, location, applicant type |
| **DOE Funding Notices** | ~300K | 0.85 | All fields for energy-specific programs |
| **State Database Exports** | ~1.2M | 0.75-0.90 | Varies by state (NY, CA, TX most complete) |
| **EPA Program Records** | ~200K | 0.80 | Environmental program specifics |
| **IRS Direct Pay Elections** | ~100K | 0.95 | IRA-specific, post-2022 only |
| **Third-Party Aggregators** | ~200K | 0.65 | Verified but potentially incomplete |

## Confidence Scores

Assign confidence scores based on data source quality and field completeness:

| Score Range | Criteria | Example |
|------------|----------|---------|
| **0.95** | Official government database with all required fields present | SAM.gov with complete award record |
| **0.85** | Official source with some fields missing or inferred | HUD announcement, amount present but no applicant_type |
| **0.75** | Government source, multiple fields missing | State database export with only state, amount, date |
| **0.65** | Third-party aggregate, verified against public records | Private grants database, cross-referenced with SAM |
| **0.50** | Estimated or inferred from press releases/public announcements | News article about award, amounts approximate |
| **0.35** | Unverified public claim or incomplete third-party data | Self-reported data, needs manual verification |

## Incremental Updates

After the initial 6.5M import, set up incremental imports:

1. **Weekly:** Pull new SAM.gov awards via API (HTTPS, no scraping)
2. **Monthly:** Process state database exports for NY, CA, TX, IL, FL
3. **Quarterly:** Full reconciliation against all federal sources
4. **On-demand:** Manual imports from FOIA responses

```sql
-- Find the latest award date per source to determine incremental start point
SELECT data_source, MAX(award_date) AS latest_record
FROM awarded_applications
GROUP BY data_source
ORDER BY latest_record DESC;
```

## Rollback

If an import goes wrong:

```sql
-- Delete all records from a specific import batch (by data_source + date range)
DELETE FROM awarded_applications
WHERE data_source = 'SAM.gov'
  AND created_at > '2026-02-25T00:00:00Z';

-- Or delete everything and re-import (nuclear option)
TRUNCATE awarded_applications;
-- Then re-import from clean CSVs
```

## Performance Notes

- The `awarded_applications` table with 6.5M rows will consume approximately 3-5 GB of storage
- The `program_award_stats` view is a regular view (computed at query time), not materialized
- For frequently-run dashboard queries, consider creating a materialized view variant if query times exceed 500ms
- All indexes are partial where possible to minimize storage overhead
- VACUUM ANALYZE should be run after large imports: `VACUUM ANALYZE awarded_applications;`
