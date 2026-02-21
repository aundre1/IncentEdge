# Tier 1 Programs Import Scripts

This directory contains scripts for importing the IncentEdge master incentive programs database into Supabase.

## Overview

**Goal:** Import 19,633 production-ready (Tier 1) incentive programs from the master CSV into Supabase PostgreSQL database.

**Source Data:** `IncentEdge_MASTER_30007_20260123.csv` (30,007 total programs)

**Selection Criteria:** Validation score ≥ 0.70 (based on data completeness)

## Files

### Import Scripts

- **`import-tier1-programs.ts`** - Main import script for Tier 1 programs
  - Reads master CSV (30,007 programs)
  - Calculates validation scores
  - Filters Tier 1 (≥0.70 score)
  - Imports to Supabase
  - Generates statistics

- **`analyze-master-data.ts`** - Data quality analysis script
  - Analyzes all 30,007 programs
  - Generates quality report
  - Calculates tier distribution

### Legacy Scripts

- **`import-incentives.ts`** - Original import script (Steve's code)
  - Generic CSV/XLSX importer
  - Not specific to Tier 1
  - Preserved for reference

## Quick Start

### 1. Prerequisites

```bash
# Ensure you have Supabase credentials in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Apply Database Migration

```bash
# From Site directory
cd /Users/dremacmini/Desktop/OC/IncentEdge/Site

# Apply migration 014
supabase db push
# OR manually run: supabase/migrations/014_tier1_import_schema.sql
```

### 3. Test Import (Dry Run)

```bash
npx ts-node scripts/import-tier1-programs.ts --dry-run
```

Expected output:
- Total programs: 30,007
- Tier 1 programs: 19,633
- No data written

### 4. Execute Import

```bash
npx ts-node scripts/import-tier1-programs.ts
```

Expected duration: 6-10 minutes

### 5. Verify

```sql
SELECT COUNT(*) FROM incentive_programs WHERE tier = 1;
-- Expected: 19,633
```

## Validation Scoring Algorithm

Each program is scored 0.00-1.00 based on completeness:

| Field | Weight | Required for Tier 1? |
|-------|--------|---------------------|
| URL | 25% | Yes (critical) |
| Application Links | 10% | Helpful |
| Funding Amount | 15% | Yes (for ROI) |
| Eligibility | 15% | Yes (for matching) |
| Agency | 10% | Yes (trust) |
| Program Type | 5% | Yes |
| Technology/Category | 5% | Helpful |
| Contact Info | 5% | Helpful |
| State/Location | 5% | Yes |
| Application Steps | 5% | Helpful |

**Tier 1 Threshold:** ≥0.70 (70% completeness)

## Import Safety

### Idempotency ✓
- Uses `external_id` as unique key
- Upsert strategy (insert or update)
- Safe to run multiple times

### Error Handling ✓
- Batch processing (100 programs per batch)
- Individual batch errors don't stop import
- Detailed error logging

### Progress Tracking ✓
- Real-time progress updates
- Statistics saved to `import-stats.json`
- Sample programs logged

## Command-Line Options

```bash
# Dry run (no database writes)
npx ts-node scripts/import-tier1-programs.ts --dry-run

# Custom batch size
npx ts-node scripts/import-tier1-programs.ts --batch-size 50

# Combine options
npx ts-node scripts/import-tier1-programs.ts --dry-run --batch-size 50
```

## Output Files

After running, check these files:

- **`import-stats.json`** - Detailed import statistics
  - State distribution
  - Sample programs
  - Metrics

- **`IMPORT_SUMMARY.md`** - Comprehensive report
  - Full analysis
  - Verification checklist
  - Troubleshooting

## Database Schema

The import adds these fields to `incentive_programs` table:

**CSV-Specific Fields:**
- `deadline_raw`, `application_steps`, `pdf_links`
- `quality_score`, `merged_from`
- AI flags: `funding_ai_filled`, `deadline_ai_filled`, `eligibility_ai_filled`
- `is_api_source`, `funding_currency`
- `funding_amount_raw`, `funding_amount_num`
- `category_tight`, `council_source`, `program_level`

**Calculated Fields:**
- `validation_score` (0.00-1.00)
- `tier` (1-5)

See: `supabase/migrations/014_tier1_import_schema.sql`

## Troubleshooting

### "Missing Supabase credentials"
→ Create `.env.local` with required variables

### "File not found"
→ Verify CSV path matches script configuration

### Import hangs
→ Reduce batch size: `--batch-size 50`

### Duplicate data
→ Not a problem! Script uses upsert, won't create duplicates

### Need to rollback?
→ Delete and re-import:
```sql
DELETE FROM incentive_programs WHERE tier = 1;
-- Then re-run import script
```

## Testing

Run dry-run before live import:

```bash
# 1. Dry run
npx ts-node scripts/import-tier1-programs.ts --dry-run

# 2. Check output
#    - Should show: "19,633 Tier 1 programs"
#    - Should show: "56 states covered"
#    - Should show: "DRY RUN - No data written"

# 3. If looks good, run for real
npx ts-node scripts/import-tier1-programs.ts
```

## Performance

**Expected Performance:**
- CSV parsing: ~5 seconds
- Validation scoring: ~10 seconds
- Database import: ~5-8 minutes
- **Total: 6-10 minutes**

**Optimization:**
- Increase batch size for speed (up to 200)
- Decrease batch size for reliability (down to 50)

## Next Steps After Import

1. Verify row count matches 19,633
2. Check sample programs for data integrity
3. Test frontend queries against real data
4. Run eligibility matching with real programs
5. Generate investor demo reports

## Support

For issues or questions:
1. Check `IMPORT_SUMMARY.md` for detailed docs
2. Review `import-stats.json` for metrics
3. Examine script output for error messages
4. Verify `.env.local` has correct credentials

---

**Last Updated:** 2026-02-17
**Script Version:** 1.0.0
**Target Programs:** 19,633 Tier 1
**Source CSV:** IncentEdge_MASTER_30007_20260123.csv
