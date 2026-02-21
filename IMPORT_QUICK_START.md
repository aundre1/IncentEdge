# Tier 1 Import - Quick Start Guide

**Ready to import 19,633 production-ready programs in 3 steps!**

## Prerequisites

You need Supabase credentials. Get them here:
- https://app.supabase.com → Your Project → Settings → API

## Step 1: Configure Credentials (1 minute)

Edit `/Users/dremacmini/Desktop/OC/IncentEdge/Site/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to find:**
- Supabase Dashboard → Settings → API
- Copy: Project URL, anon key, service_role key

## Step 2: Apply Database Migration (1 minute)

```bash
cd /Users/dremacmini/Desktop/OC/IncentEdge/Site

# If using Supabase CLI:
supabase db push

# OR manually apply migration:
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of: supabase/migrations/014_tier1_import_schema.sql
# 3. Execute
```

## Step 3: Run Import (6-10 minutes)

```bash
cd /Users/dremacmini/Desktop/OC/IncentEdge/Site

# Test first (recommended):
npx ts-node scripts/import-tier1-programs.ts --dry-run

# Then import for real:
npx ts-node scripts/import-tier1-programs.ts
```

**Expected output:**
```
========================================
IncentEdge Tier 1 Programs Import
========================================

📊 CSV Path: .../IncentEdge_MASTER_30007_20260123.csv
🎯 Tier 1 Threshold: 0.7 (validation score)
🔧 Mode: LIVE IMPORT
📦 Batch Size: 100

📖 Loading master CSV...
✓ Loaded 30,007 programs

🔍 Calculating validation scores...
✓ Processed all 30,007 programs
✓ Tier 1 Programs: 19,633

💾 Importing to Supabase...
  Imported: 19,633/19,633

✅ Import Complete!

========================================
IMPORT SUMMARY
========================================
Total programs scanned: 30,007
Tier 1 programs found: 19,633
Successfully imported: 19,633
Errors: 0
```

## Step 4: Verify (1 minute)

Open Supabase SQL Editor and run:

```sql
-- Check count (should be 19,633)
SELECT COUNT(*) FROM incentive_programs WHERE tier = 1;

-- Check states (should be 56)
SELECT COUNT(DISTINCT state) FROM incentive_programs WHERE tier = 1;

-- Sample data
SELECT name, state, validation_score, tier
FROM incentive_programs
WHERE tier = 1
LIMIT 10;
```

## Done! ✅

Your IncentEdge database now has 19,633 production-ready incentive programs ready for:
- Eligibility matching
- Search/filter
- AI recommendations
- Investor demos

---

## Troubleshooting

### Error: "Missing Supabase credentials"
→ Check `.env.local` has all 3 variables set correctly

### Error: "File not found"
→ Verify CSV exists: `ls "/Users/dremacmini/Desktop/OC/IncentEdge/Master Lists Final/IncentEdge_MASTER_30007_20260123.csv"`

### Import hangs
→ Reduce batch size: `npx ts-node scripts/import-tier1-programs.ts --batch-size 50`

### Need to re-run?
→ **Safe!** Script uses upsert - duplicates will be updated, not created

---

**Full Documentation:** See `IMPORT_SUMMARY.md` for detailed information
