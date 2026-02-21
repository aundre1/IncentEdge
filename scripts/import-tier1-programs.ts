#!/usr/bin/env npx ts-node
/**
 * IncentEdge Tier 1 Programs Import Script
 *
 * Imports production-ready (Tier 1) programs from master CSV to Supabase.
 * Only imports programs with validation score >= 0.70 (19,633 programs expected).
 *
 * Usage:
 *   npx ts-node scripts/import-tier1-programs.ts
 *   npx ts-node scripts/import-tier1-programs.ts --dry-run
 *   npx ts-node scripts/import-tier1-programs.ts --batch-size 50
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - Master CSV at: ../Master Lists Final/IncentEdge_MASTER_30007_20260123.csv
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MASTER_CSV_PATH = path.join(__dirname, '../../Master Lists Final/IncentEdge_MASTER_30007_20260123.csv');
const TIER_1_THRESHOLD = 0.70; // Minimum validation score for Tier 1

// ============================================================================
// TYPES
// ============================================================================

interface CSVProgram {
  URL?: string;
  Title?: string;
  Agency?: string;
  'Program Type'?: string;
  Technology?: string;
  Category?: string;
  'Funding Amount Raw'?: string;
  'Funding Amount Normalized'?: string;
  'Deadline Date'?: string;
  'Deadline Raw'?: string;
  Eligibility?: string;
  'Application Steps'?: string;
  'Contact Email'?: string;
  'Contact Phone'?: string;
  State?: string;
  'Program Level'?: string;
  'Application Links'?: string;
  'PDF Links'?: string;
  'Source Type'?: string;
  'Quality Score'?: string;
  'Merged From'?: string;
  'Funding AI Filled'?: string;
  'Deadline AI Filled'?: string;
  'Eligibility AI Filled'?: string;
  'Is API Source'?: string;
  'Funding Currency'?: string;
  'Funding Amount'?: string;
  'Funding Amount Num'?: string;
  'Category Tight'?: string;
  Council_Source?: string;
}

interface ValidationResult {
  score: number;
  tier: number;
  issues: string[];
  strengths: string[];
}

interface DatabaseProgram {
  external_id: string;
  name: string;
  description?: string;
  program_type: string;
  category: string;
  jurisdiction_level: string;
  state?: string;
  source_url?: string;
  application_url?: string;
  administering_agency?: string;
  eligibility_summary?: string;
  amount_max?: number;
  amount_min?: number;
  application_deadline?: string;
  contact_email?: string;
  contact_phone?: string;
  technology_types?: string[];
  sector_types?: string[];
  status: string;
  data_source?: string;
  confidence_score?: number;
  last_verified_at: string;
  // CSV-specific fields
  deadline_raw?: string;
  application_steps?: string;
  pdf_links?: string;
  quality_score?: number;
  merged_from?: string;
  funding_ai_filled?: boolean;
  deadline_ai_filled?: boolean;
  eligibility_ai_filled?: boolean;
  is_api_source?: boolean;
  funding_currency?: string;
  funding_amount_raw?: string;
  funding_amount_num?: number;
  category_tight?: string;
  council_source?: string;
  validation_score: number;
  tier: number;
  program_level?: string;
}

interface ImportStats {
  totalPrograms: number;
  tier1Programs: number;
  imported: number;
  skipped: number;
  errors: number;
  duplicates: number;
  stateDistribution: { [state: string]: number };
  avgValidationScore: number;
  urlCoverage: number;
  samplePrograms: Array<{ id: string; title: string; state: string; score: number }>;
}

// ============================================================================
// VALIDATION SCORING (from analyze-master-data.ts)
// ============================================================================

/**
 * Calculate validation score based on data completeness
 * Score: 0.0 - 1.0 (higher is better)
 */
function calculateValidationScore(program: CSVProgram): ValidationResult {
  let score = 0.0;
  const issues: string[] = [];
  const strengths: string[] = [];

  // URL (25% weight) - Critical for user access
  if (program.URL && program.URL.trim() && !['N/A', 'nan', ''].includes(program.URL.trim())) {
    score += 0.25;
    strengths.push('Has valid URL');
  } else {
    issues.push('Missing URL');
  }

  // Application Links (10% weight)
  if (program['Application Links'] && program['Application Links'].trim()) {
    score += 0.10;
    strengths.push('Has application link');
  } else {
    issues.push('No application link');
  }

  // Funding Amount (15% weight) - Users need to know money available
  if ((program['Funding Amount Raw'] && program['Funding Amount Raw'].trim()) ||
      (program['Funding Amount Normalized'] && program['Funding Amount Normalized'].trim())) {
    score += 0.15;
    strengths.push('Has funding info');
  } else {
    issues.push('Missing funding amount');
  }

  // Eligibility (15% weight) - Critical for matching
  if (program.Eligibility && program.Eligibility.trim()) {
    score += 0.15;
    strengths.push('Has eligibility criteria');
  } else {
    issues.push('Missing eligibility');
  }

  // Agency (10% weight) - Trust signal
  if (program.Agency && program.Agency.trim()) {
    score += 0.10;
    strengths.push('Has agency');
  } else {
    issues.push('Missing agency');
  }

  // Program Type (5% weight)
  if (program['Program Type'] && program['Program Type'].trim()) {
    score += 0.05;
  } else {
    issues.push('Missing program type');
  }

  // Technology/Category (5% weight)
  if ((program.Technology && program.Technology.trim()) ||
      (program.Category && program.Category.trim())) {
    score += 0.05;
  } else {
    issues.push('Missing technology/category');
  }

  // Contact Info (5% weight) - Email or Phone
  if ((program['Contact Email'] && program['Contact Email'].trim()) ||
      (program['Contact Phone'] && program['Contact Phone'].trim())) {
    score += 0.05;
  } else {
    issues.push('Missing contact info');
  }

  // State/Geography (5% weight)
  if (program.State && program.State.trim()) {
    score += 0.05;
  } else {
    issues.push('Missing state/location');
  }

  // Application Steps (5% weight)
  if (program['Application Steps'] && program['Application Steps'].trim()) {
    score += 0.05;
  } else {
    issues.push('Missing application steps');
  }

  return {
    score: Math.min(score, 1.0),
    tier: assignTier(score, program),
    issues,
    strengths
  };
}

/**
 * Assign tier based on validation score
 */
function assignTier(score: number, program: CSVProgram): number {
  if (score >= 0.70) return 1; // Production ready
  if (score >= 0.50) return 2; // Needs enrichment
  if (score >= 0.30 && (!program.URL || !program.URL.trim())) return 3; // URL recovery
  if (score >= 0.10) return 4; // Research queue
  return 5; // Quarantine
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function normalizeCategory(category?: string, programLevel?: string): string {
  const val = (category || programLevel || '').toLowerCase();
  if (val.includes('federal') || val.includes('national')) return 'federal';
  if (val.includes('state')) return 'state';
  if (val.includes('local') || val.includes('county') || val.includes('city')) return 'local';
  if (val.includes('utility')) return 'utility';
  return 'state'; // Default
}

function normalizeJurisdiction(category?: string, programLevel?: string): string {
  const val = (category || programLevel || '').toLowerCase();
  if (val.includes('federal') || val.includes('national')) return 'federal';
  if (val.includes('state')) return 'state';
  if (val.includes('local') || val.includes('county') || val.includes('city')) return 'local';
  if (val.includes('utility')) return 'utility';
  return 'state';
}

function parseAmount(value?: string): number | undefined {
  if (!value || !value.trim()) return undefined;
  const cleaned = value.replace(/[$,]/g, '').trim();
  const match = cleaned.match(/[\d.]+/);
  if (!match) return undefined;
  const num = parseFloat(match[0]);
  return isNaN(num) ? undefined : num;
}

function parseDate(value?: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

function parseBooleanString(value?: string): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

function generateExternalId(program: CSVProgram, index: number): string {
  const state = program.State || 'US';
  const titleSlug = (program.Title || 'program')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  return `tier1-${state}-${titleSlug}-${index}`;
}

function csvToDatabase(program: CSVProgram, validation: ValidationResult, index: number): DatabaseProgram {
  const category = normalizeCategory(program.Category, program['Program Level']);
  const jurisdiction = normalizeJurisdiction(program.Category, program['Program Level']);

  // Parse technology types
  const techTypes: string[] = [];
  if (program.Technology) {
    techTypes.push(...program.Technology.split(/[,;|]/).map(t => t.trim()).filter(Boolean));
  }
  if (program.Category && program.Category.trim()) {
    techTypes.push(program.Category.trim());
  }

  return {
    external_id: generateExternalId(program, index),
    name: program.Title || 'Untitled Program',
    program_type: program['Program Type'] || 'incentive',
    category,
    jurisdiction_level: jurisdiction,
    state: program.State && program.State.trim() ? program.State.trim() : undefined,
    source_url: program.URL && program.URL.trim() ? program.URL.trim() : undefined,
    application_url: program['Application Links'] && program['Application Links'].trim()
      ? program['Application Links'].trim()
      : undefined,
    administering_agency: program.Agency && program.Agency.trim() ? program.Agency.trim() : undefined,
    eligibility_summary: program.Eligibility && program.Eligibility.trim()
      ? program.Eligibility.trim()
      : undefined,
    amount_max: parseAmount(program['Funding Amount Normalized'] || program['Funding Amount']),
    application_deadline: parseDate(program['Deadline Date']),
    contact_email: program['Contact Email'] && program['Contact Email'].trim()
      ? program['Contact Email'].trim()
      : undefined,
    contact_phone: program['Contact Phone'] && program['Contact Phone'].trim()
      ? program['Contact Phone'].trim()
      : undefined,
    technology_types: techTypes.length > 0 ? techTypes : undefined,
    status: 'active',
    data_source: program['Source Type'] || 'master_csv_import',
    confidence_score: validation.score,
    last_verified_at: new Date().toISOString(),
    // CSV-specific fields
    deadline_raw: program['Deadline Raw'],
    application_steps: program['Application Steps'],
    pdf_links: program['PDF Links'],
    quality_score: program['Quality Score'] ? parseFloat(program['Quality Score']) : undefined,
    merged_from: program['Merged From'],
    funding_ai_filled: parseBooleanString(program['Funding AI Filled']),
    deadline_ai_filled: parseBooleanString(program['Deadline AI Filled']),
    eligibility_ai_filled: parseBooleanString(program['Eligibility AI Filled']),
    is_api_source: parseBooleanString(program['Is API Source']),
    funding_currency: program['Funding Currency'] || 'USD',
    funding_amount_raw: program['Funding Amount Raw'],
    funding_amount_num: parseAmount(program['Funding Amount Num']),
    category_tight: program['Category Tight'],
    council_source: program.Council_Source,
    validation_score: validation.score,
    tier: validation.tier,
    program_level: program['Program Level']
  };
}

// ============================================================================
// MAIN IMPORT LOGIC
// ============================================================================

async function importTier1Programs(options: {
  dryRun?: boolean;
  batchSize?: number;
}) {
  const { dryRun = false, batchSize = 100 } = options;

  console.log('\n========================================');
  console.log('IncentEdge Tier 1 Programs Import');
  console.log('========================================\n');

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials!');
    console.error('Required environment variables:');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nPlease create .env.local with these values.');
    process.exit(1);
  }

  // Validate CSV file exists
  if (!fs.existsSync(MASTER_CSV_PATH)) {
    console.error(`❌ Master CSV not found: ${MASTER_CSV_PATH}`);
    process.exit(1);
  }

  console.log(`📊 CSV Path: ${MASTER_CSV_PATH}`);
  console.log(`🎯 Tier 1 Threshold: ${TIER_1_THRESHOLD} (validation score)`);
  console.log(`🔧 Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  console.log(`📦 Batch Size: ${batchSize}\n`);

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Load and parse CSV
  console.log('📖 Loading master CSV...');
  const csvContent = fs.readFileSync(MASTER_CSV_PATH, 'utf-8');
  const programs = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  }) as CSVProgram[];

  console.log(`✓ Loaded ${programs.length.toLocaleString()} programs\n`);

  // Calculate validation scores and filter Tier 1
  console.log('🔍 Calculating validation scores...');
  const tier1Programs: DatabaseProgram[] = [];
  const stats: ImportStats = {
    totalPrograms: programs.length,
    tier1Programs: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    duplicates: 0,
    stateDistribution: {},
    avgValidationScore: 0,
    urlCoverage: 0,
    samplePrograms: []
  };

  let totalScore = 0;
  let urlCount = 0;

  programs.forEach((program, index) => {
    const validation = calculateValidationScore(program);
    totalScore += validation.score;

    if (program.URL && program.URL.trim()) {
      urlCount++;
    }

    if (validation.tier === 1) {
      const dbProgram = csvToDatabase(program, validation, index);
      tier1Programs.push(dbProgram);
      stats.tier1Programs++;

      // Track state distribution
      const state = dbProgram.state || 'Unknown';
      stats.stateDistribution[state] = (stats.stateDistribution[state] || 0) + 1;

      // Collect sample programs (first 10)
      if (stats.samplePrograms.length < 10) {
        stats.samplePrograms.push({
          id: dbProgram.external_id,
          title: dbProgram.name,
          state: state,
          score: validation.score
        });
      }
    }

    if ((index + 1) % 1000 === 0) {
      process.stdout.write(`\r  Processed: ${(index + 1).toLocaleString()}/${programs.length.toLocaleString()}`);
    }
  });

  console.log(`\r✓ Processed all ${programs.length.toLocaleString()} programs`);
  console.log(`✓ Tier 1 Programs: ${stats.tier1Programs.toLocaleString()}\n`);

  stats.avgValidationScore = totalScore / programs.length;
  stats.urlCoverage = (urlCount / programs.length) * 100;

  // Show summary
  console.log('📊 TIER 1 SUMMARY');
  console.log('─────────────────');
  console.log(`Total programs in CSV: ${stats.totalPrograms.toLocaleString()}`);
  console.log(`Tier 1 programs (≥0.70): ${stats.tier1Programs.toLocaleString()}`);
  console.log(`Average validation score: ${stats.avgValidationScore.toFixed(3)}`);
  console.log(`URL coverage: ${stats.urlCoverage.toFixed(1)}%\n`);

  // Top 10 states
  const topStates = Object.entries(stats.stateDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('🗺️  TOP 10 STATES BY PROGRAM COUNT');
  console.log('───────────────────────────────────');
  topStates.forEach(([state, count], i) => {
    console.log(`${i + 1}. ${state.padEnd(15)} ${count.toLocaleString()} programs`);
  });
  console.log('');

  if (dryRun) {
    console.log('🔍 DRY RUN - No data written to database\n');
    console.log('Sample programs that would be imported:');
    stats.samplePrograms.forEach((p, i) => {
      console.log(`${i + 1}. [${p.state}] ${p.title} (score: ${p.score.toFixed(2)})`);
    });
    console.log('\n✓ Dry run complete. Run without --dry-run to import.');
    return stats;
  }

  // Import to Supabase
  console.log('💾 Importing to Supabase...\n');

  for (let i = 0; i < tier1Programs.length; i += batchSize) {
    const batch = tier1Programs.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('incentive_programs')
        .upsert(batch, {
          onConflict: 'external_id',
          ignoreDuplicates: false
        })
        .select('id');

      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        stats.errors += batch.length;
      } else {
        stats.imported += data?.length || batch.length;
      }
    } catch (err) {
      console.error(`\n❌ Batch ${Math.floor(i / batchSize) + 1} exception:`, err);
      stats.errors += batch.length;
    }

    // Progress indicator
    if ((i + batchSize) % 1000 === 0 || i + batchSize >= tier1Programs.length) {
      const progress = Math.min(i + batchSize, tier1Programs.length);
      process.stdout.write(`\r  Imported: ${progress.toLocaleString()}/${tier1Programs.length.toLocaleString()}`);
    }
  }

  console.log(`\n\n✅ Import Complete!\n`);

  return stats;
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const options: any = {
    dryRun: args.includes('--dry-run'),
    batchSize: 100
  };

  // Parse batch size
  const batchIndex = args.indexOf('--batch-size');
  if (batchIndex >= 0 && args[batchIndex + 1]) {
    options.batchSize = parseInt(args[batchIndex + 1], 10);
  }

  try {
    const stats = await importTier1Programs(options);

    // Print final summary
    console.log('========================================');
    console.log('IMPORT SUMMARY');
    console.log('========================================');
    console.log(`Total programs scanned: ${stats.totalPrograms.toLocaleString()}`);
    console.log(`Tier 1 programs found: ${stats.tier1Programs.toLocaleString()}`);
    console.log(`Successfully imported: ${stats.imported.toLocaleString()}`);
    console.log(`Errors: ${stats.errors.toLocaleString()}`);
    console.log(`Average validation score: ${stats.avgValidationScore.toFixed(3)}`);
    console.log(`URL coverage: ${stats.urlCoverage.toFixed(1)}%`);
    console.log(`States covered: ${Object.keys(stats.stateDistribution).length}`);
    console.log('========================================\n');

    // Save detailed stats
    const statsPath = path.join(__dirname, '../import-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log(`📄 Detailed stats saved to: ${statsPath}\n`);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
