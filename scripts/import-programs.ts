#!/usr/bin/env npx ts-node
/**
 * IncentEdge Master Programs Import Script
 *
 * Imports all 30,007 incentive programs from master CSV to Supabase.
 * Validates, transforms, and loads data with comprehensive error handling.
 *
 * Usage:
 *   npm run db:import
 *   npm run db:import -- --dry-run
 *   npm run db:import -- --batch-size 500
 *   npm run db:import -- --tier 1  # Tier 1 only (high quality)
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - csv-parse installed (npm install csv-parse)
 *
 * CSV Source:
 *   Master Lists Final/IncentEdge_MASTER_30007_20260123.csv
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

// ============================================================================
// CONFIGURATION
// ============================================================================

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MASTER_CSV_PATH = path.join(__dirname, '../../Master Lists Final/IncentEdge_MASTER_30007_20260123.csv');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tierFilter = args.find(a => a.startsWith('--tier'))?.split(' ')[1];
const batchSizeArg = args.find(a => a.startsWith('--batch-size'))?.split(' ')[1];
const BATCH_SIZE = batchSizeArg ? parseInt(batchSizeArg, 10) : 1000;

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
  importedByTier: { [tier: number]: number };
  imported: number;
  skipped: number;
  errors: number;
  duplicates: number;
  stateDistribution: { [state: string]: number };
  avgValidationScore: number;
  urlCoverage: number;
  startTime: number;
  endTime?: number;
}

// ============================================================================
// VALIDATION SCORING
// ============================================================================

/**
 * Calculate validation score based on data completeness
 * Score: 0.0 - 1.0 (higher is better)
 */
function calculateValidationScore(program: CSVProgram, index: number): ValidationResult {
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

  // Title (20% weight) - Essential
  if (program.Title && program.Title.trim()) {
    score += 0.20;
    strengths.push('Has title');
  } else {
    issues.push('Missing title');
  }

  // Funding Amount (15% weight) - Users need to know money available
  if (
    (program['Funding Amount Raw'] && program['Funding Amount Raw'].trim()) ||
    (program['Funding Amount Normalized'] && program['Funding Amount Normalized'].trim()) ||
    (program['Funding Amount Num'] && program['Funding Amount Num'].trim())
  ) {
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

  // Application Links (5% weight)
  if (program['Application Links'] && program['Application Links'].trim()) {
    score += 0.05;
    strengths.push('Has application link');
  }

  // Contact Info (5% weight) - Email or Phone
  if (
    (program['Contact Email'] && program['Contact Email'].trim()) ||
    (program['Contact Phone'] && program['Contact Phone'].trim())
  ) {
    score += 0.05;
    strengths.push('Has contact info');
  }

  // State/Geography (5% weight)
  if (program.State && program.State.trim() && program.State.trim().length <= 2) {
    score += 0.05;
    strengths.push('Has state');
  } else if (program.State === 'National') {
    score += 0.02;
  }

  // Program Type (5% weight)
  if (program['Program Type'] && program['Program Type'].trim()) {
    score += 0.05;
    strengths.push('Has program type');
  }

  return {
    score: Math.min(score, 1.0),
    tier: assignTier(score),
    issues,
    strengths
  };
}

/**
 * Assign tier based on validation score
 */
function assignTier(score: number): number {
  if (score >= 0.70) return 1; // Production ready
  if (score >= 0.50) return 2; // Needs enrichment
  if (score >= 0.30) return 3; // URL recovery/basic research
  if (score >= 0.10) return 4; // Research queue
  return 5; // Quarantine
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function normalizeCategory(category?: string, programLevel?: string): string {
  const val = (category || programLevel || '').toLowerCase().trim();
  if (val.includes('federal') || val.includes('national')) return 'federal';
  if (val.includes('state')) return 'state';
  if (val.includes('local') || val.includes('county') || val.includes('city') || val.includes('municipal')) return 'local';
  if (val.includes('utility')) return 'utility';
  return 'state'; // Default
}

function normalizeJurisdiction(category?: string, programLevel?: string): string {
  return normalizeCategory(category, programLevel);
}

function parseAmount(value?: string): number | undefined {
  if (!value || !value.trim()) return undefined;
  const cleaned = value.replace(/[$,]/g, '').trim();
  const match = cleaned.match(/[\d.]+/);
  if (!match) return undefined;
  let num = parseFloat(match[0]);
  if (isNaN(num)) return undefined;
  // Cap at max DECIMAL(15, 2) value: 9,999,999,999,999.99
  if (num > 9999999999999.99) {
    return 9999999999999.99;
  }
  return num;
}

function parseDeadline(value?: string): string | undefined {
  if (!value || !value.trim()) return undefined;
  if (value.match(/\d{4}-\d{2}-\d{2}/)) {
    return value.match(/\d{4}-\d{2}-\d{2}/)![0]; // ISO format
  }
  if (value.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
    const [month, day, year] = value.match(/\d{1,2}\/\d{1,2}\/\d{4}/)![0].split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return undefined;
}

function sanitizeString(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (['N/A', 'nan', 'NaN', 'null', '', 'None'].includes(trimmed)) return undefined;
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Transform CSV row to database program
 */
function transformProgram(program: CSVProgram, index: number): DatabaseProgram | null {
  const validation = calculateValidationScore(program, index);
  const name = sanitizeString(program.Title) || sanitizeString(program.Agency) || `Program ${index}`;

  return {
    external_id: `MASTER-${String(index).padStart(6, '0')}`,
    name: name.substring(0, 500),
    description: sanitizeString(program['Application Steps']),
    program_type: sanitizeString(program['Program Type']) || 'other',
    category: normalizeCategory(program.Category, program['Program Level']),
    jurisdiction_level: normalizeJurisdiction(program.Category, program['Program Level']),
    state: sanitizeString(program.State)?.substring(0, 2).toUpperCase(),
    source_url: sanitizeString(program.URL),
    application_url: sanitizeString(program['Application Links']),
    administering_agency: sanitizeString(program.Agency),
    eligibility_summary: sanitizeString(program.Eligibility),
    amount_min: parseAmount(program['Funding Amount Raw'] || program['Funding Amount Normalized']),
    amount_max: parseAmount(program['Funding Amount Raw'] || program['Funding Amount Normalized']),
    application_deadline: parseDeadline(program['Deadline Date'] || program['Deadline Raw']),
    contact_email: sanitizeString(program['Contact Email']),
    contact_phone: sanitizeString(program['Contact Phone']),
    technology_types: sanitizeString(program.Technology)
      ? [program.Technology]
      : [],
    sector_types: sanitizeString(program.Category)
      ? [program.Category]
      : [],
    status: 'active',
    data_source: sanitizeString(program['Source Type']) || 'MASTER_CSV',
    confidence_score: validation.score,
    last_verified_at: new Date().toISOString(),
    // CSV-specific fields
    deadline_raw: sanitizeString(program['Deadline Raw']),
    application_steps: sanitizeString(program['Application Steps']),
    pdf_links: sanitizeString(program['PDF Links']),
    quality_score: parseAmount(program['Quality Score']),
    merged_from: sanitizeString(program['Merged From']),
    funding_ai_filled: program['Funding AI Filled']?.toLowerCase() === 'true' || false,
    deadline_ai_filled: program['Deadline AI Filled']?.toLowerCase() === 'true' || false,
    eligibility_ai_filled: program['Eligibility AI Filled']?.toLowerCase() === 'true' || false,
    is_api_source: program['Is API Source']?.toLowerCase() === 'true' || false,
    funding_currency: sanitizeString(program['Funding Currency']) || 'USD',
    funding_amount_raw: sanitizeString(program['Funding Amount Raw']),
    funding_amount_num: parseAmount(program['Funding Amount Num']),
    category_tight: sanitizeString(program['Category Tight']),
    council_source: sanitizeString(program['Council_Source']),
    validation_score: validation.score,
    tier: validation.tier,
    program_level: sanitizeString(program['Program Level'])
  };
}

// ============================================================================
// IMPORT EXECUTION
// ============================================================================

async function importPrograms(): Promise<void> {
  const stats: ImportStats = {
    totalPrograms: 0,
    importedByTier: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    imported: 0,
    skipped: 0,
    errors: 0,
    duplicates: 0,
    stateDistribution: {},
    avgValidationScore: 0,
    urlCoverage: 0,
    startTime: Date.now()
  };

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     IncentEdge Master Programs Import                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ ERROR: Missing Supabase credentials');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!fs.existsSync(MASTER_CSV_PATH)) {
    console.error(`❌ ERROR: CSV file not found at ${MASTER_CSV_PATH}`);
    process.exit(1);
  }

  console.log(`📁 CSV Source: ${MASTER_CSV_PATH}`);
  console.log(`⚙️  Batch Size: ${BATCH_SIZE} records`);
  console.log(`🔍 Mode: ${dryRun ? 'DRY RUN (no database writes)' : 'PRODUCTION'}`);
  if (tierFilter) {
    console.log(`🎯 Tier Filter: Tier ${tierFilter} only`);
  }
  console.log('');

  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Read and parse CSV
    console.log('📖 Reading CSV file...');
    const fileContent = fs.readFileSync(MASTER_CSV_PATH, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax: true,
      relax_quotes: true
    });

    console.log(`✅ Parsed ${records.length} records from CSV\n`);
    stats.totalPrograms = records.length;

    let urlCount = 0;
    let scoreSum = 0;
    const programs: DatabaseProgram[] = [];

    // Transform records
    console.log('🔄 Transforming records...');
    for (let i = 0; i < records.length; i++) {
      try {
        const program = transformProgram(records[i], i + 1);
        if (!program) {
          stats.skipped++;
          continue;
        }

        // Apply tier filter if specified
        if (tierFilter && program.tier !== parseInt(tierFilter, 10)) {
          continue;
        }

        programs.push(program);
        stats.importedByTier[program.tier]++;

        if (program.source_url) urlCount++;
        scoreSum += program.confidence_score || 0;

        // Track state distribution
        if (program.state) {
          stats.stateDistribution[program.state] = (stats.stateDistribution[program.state] || 0) + 1;
        }

        if ((i + 1) % 5000 === 0) {
          console.log(`  └─ Processed ${i + 1}/${records.length} records`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`  ❌ Error transforming record ${i + 1}:`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`✅ Transformed ${programs.length} records\n`);

    // Calculate stats
    stats.urlCoverage = programs.length > 0 ? (urlCount / programs.length) * 100 : 0;
    stats.avgValidationScore = programs.length > 0 ? scoreSum / programs.length : 0;

    // Batch insert
    if (!dryRun && programs.length > 0) {
      console.log('🚀 Importing to Supabase...');
      for (let i = 0; i < programs.length; i += BATCH_SIZE) {
        const batch = programs.slice(i, i + BATCH_SIZE);
        try {
          const { error, count } = await supabase
            .from('incentive_programs')
            .insert(batch)
            .select();

          if (error) {
            // Check if it's a duplicate error
            if (error.message.includes('duplicate') || error.message.includes('unique')) {
              stats.duplicates += batch.length;
              console.log(`  ⚠️  Batch ${Math.floor(i / BATCH_SIZE) + 1}: Skipped ${batch.length} duplicates`);
            } else {
              stats.errors += batch.length;
              console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, error.message);
            }
          } else {
            stats.imported += batch.length;
            console.log(
              `  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1}: Inserted ${batch.length} records (Total: ${stats.imported}/${programs.length})`
            );
          }
        } catch (error) {
          stats.errors += batch.length;
          console.error(`  ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} exception:`, error instanceof Error ? error.message : error);
        }
      }
    } else if (dryRun) {
      console.log(`📊 DRY RUN: Would insert ${programs.length} records`);
      stats.imported = programs.length;
    }

    stats.endTime = Date.now();

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    IMPORT SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Statistics:`);
    console.log(`   Total Records:        ${stats.totalPrograms}`);
    console.log(`   Successfully Imported: ${stats.imported}`);
    console.log(`   Skipped:              ${stats.skipped}`);
    console.log(`   Duplicate Conflicts:  ${stats.duplicates}`);
    console.log(`   Errors:               ${stats.errors}`);
    console.log('');

    console.log(`🎯 Quality Distribution:`);
    console.log(`   Tier 1 (Production): ${stats.importedByTier[1]} programs`);
    console.log(`   Tier 2 (Enrichment): ${stats.importedByTier[2]} programs`);
    console.log(`   Tier 3 (Research):   ${stats.importedByTier[3]} programs`);
    console.log(`   Tier 4 (Queue):      ${stats.importedByTier[4]} programs`);
    console.log(`   Tier 5 (Quarantine): ${stats.importedByTier[5]} programs`);
    console.log('');

    console.log(`📈 Data Quality:`);
    console.log(`   Average Confidence:  ${(stats.avgValidationScore * 100).toFixed(1)}%`);
    console.log(`   URL Coverage:        ${stats.urlCoverage.toFixed(1)}%`);
    console.log('');

    console.log(`🗺️  Top 10 States:`);
    const topStates = Object.entries(stats.stateDistribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    topStates.forEach(([state, count]) => {
      console.log(`   ${state}: ${count} programs`);
    });
    console.log('');

    const duration = ((stats.endTime || Date.now()) - stats.startTime) / 1000;
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    console.log('');

    if (stats.imported === programs.length && stats.errors === 0) {
      console.log('✅ IMPORT COMPLETE - All programs loaded successfully!');
    } else if (stats.imported > 0) {
      console.log(`⚠️  IMPORT PARTIAL - ${stats.imported}/${programs.length} programs imported (${stats.errors} errors)`);
    } else {
      console.log('❌ IMPORT FAILED - No programs imported');
    }
  } catch (error) {
    console.error('❌ Fatal error during import:');
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================

importPrograms().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
