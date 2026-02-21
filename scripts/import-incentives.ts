/**
 * Incentive Programs Import Script
 *
 * Imports incentive program data from CSV into Supabase.
 *
 * Usage:
 *   npx ts-node scripts/import-incentives.ts --file ../../../Incentives/IncentEdge_Master_18_States_2411.csv
 *   npx ts-node scripts/import-incentives.ts --file ../../../Incentives/IncentEdge_FINAL_100PCT_2025-12-30.xlsx
 *
 * Options:
 *   --file    Path to CSV/XLSX file to import
 *   --dry-run Preview import without writing to database
 *   --batch   Batch size for upserts (default: 100)
 *   --state   Filter to only import specific state (e.g., NY)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase credentials. Please set:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// CSV column to DB field mapping
// Supports multiple CSV formats
const CSV_FIELD_MAP: Record<string, string> = {
  // Source identifiers
  source_type: 'data_source',
  ra_program_id: 'external_id',
  'Program ID': 'external_id',
  title: 'name',
  Title: 'name',
  program_name: 'name',
  url: 'source_url',
  URL: 'source_url',
  source_url: 'source_url',

  // Administration
  agency: 'administering_agency',
  Agency: 'administering_agency',
  administrator: 'administrator',
  contact_email: 'contact_email',
  contact_phone: 'contact_phone',

  // Classification
  jurisdiction_level: 'jurisdiction_level',
  program_type: 'program_type',
  'Program Type': 'program_type',
  incentive_type: 'incentive_type',
  category: 'category',
  Category: 'category',
  technology: 'technology_types',
  Technology: 'technology_types',
  eligible_technologies: 'technology_types',

  // Geography
  state: 'state',
  State: 'state',
  city: 'municipalities',
  county_fips: 'counties',

  // Eligibility
  eligibility: 'eligibility_summary',
  Eligibility: 'eligibility_summary',
  eligible_sectors: 'sector_types',
  'Applicable_Sectors': 'sector_types',
  'Primary_Sector': 'subcategory',

  // Funding
  funding_amount: 'amount_max',
  'Funding Amount': 'amount_max',
  funding_range_min: 'amount_min',
  funding_range_max: 'amount_max',

  // Dates
  deadline_date: 'application_deadline',
  start_date: 'start_date',
  end_date: 'end_date',

  // Quality
  quality_score: 'confidence_score',

  // Description
  program_description: 'description',
  summary: 'summary',
  description: 'description',
  Notes: 'description',

  // Application
  application_steps: 'required_documents',
  application_links: 'application_url',

  // Source tracking
  Source_Dataset: 'data_source',
  Status: 'status',
};

// Category normalization
function normalizeCategory(value: string): string {
  const lower = value?.toLowerCase() || '';
  if (lower.includes('federal')) return 'federal';
  if (lower.includes('state')) return 'state';
  if (lower.includes('local') || lower.includes('county') || lower.includes('city')) return 'local';
  if (lower.includes('utility')) return 'utility';
  return 'state'; // Default to state
}

// Jurisdiction level normalization
function normalizeJurisdiction(value: string): string {
  const lower = value?.toLowerCase() || '';
  if (lower.includes('federal')) return 'federal';
  if (lower.includes('state')) return 'state';
  if (lower.includes('local') || lower.includes('county') || lower.includes('city') || lower.includes('municipal')) return 'local';
  if (lower.includes('utility')) return 'utility';
  return 'state';
}

// State code extraction from title/agency/URL
function inferState(row: Record<string, any>): string | null {
  const statePattern = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;

  // Check title
  const titleMatch = row.Title?.match(statePattern) || row.title?.match(statePattern);
  if (titleMatch) return titleMatch[1].toUpperCase();

  // Check agency
  const agencyMatch = row.Agency?.match(statePattern) || row.agency?.match(statePattern);
  if (agencyMatch) return agencyMatch[1].toUpperCase();

  // Check URL for state patterns
  const url = row.URL || row.url || row.source_url || '';
  const urlStatePatterns: Record<string, string> = {
    'nyserda': 'NY', 'california': 'CA', 'texas': 'TX', 'florida': 'FL',
    'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH', 'michigan': 'MI',
    'georgia': 'GA', 'northcarolina': 'NC', 'newjersey': 'NJ', 'virginia': 'VA',
    'washington': 'WA', 'massachusetts': 'MA', 'arizona': 'AZ', 'colorado': 'CO',
    'maryland': 'MD', 'minnesota': 'MN', 'wisconsin': 'WI', 'connecticut': 'CT',
  };
  const lowerUrl = url.toLowerCase();
  for (const [pattern, state] of Object.entries(urlStatePatterns)) {
    if (lowerUrl.includes(pattern)) return state;
  }

  // Check for .gov domains with state codes
  const govMatch = lowerUrl.match(/\.([a-z]{2})\.gov/);
  if (govMatch) return govMatch[1].toUpperCase();

  return null;
}

// Parse amount from various formats
function parseAmount(value: string | number): number | null {
  if (typeof value === 'number') return value;
  if (!value) return null;

  const str = String(value).replace(/[$,]/g, '').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

// Parse date from various formats
function parseDate(value: string): string | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

// Convert CSV row to database record
function csvRowToRecord(row: Record<string, any>): Record<string, any> {
  const record: Record<string, any> = {};

  // Map known fields
  for (const [csvField, dbField] of Object.entries(CSV_FIELD_MAP)) {
    if (row[csvField] !== undefined && row[csvField] !== '') {
      // Handle array fields
      if (['technology_types', 'sector_types', 'municipalities', 'counties'].includes(dbField)) {
        const value = row[csvField];
        if (typeof value === 'string') {
          record[dbField] = value.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean);
        } else if (Array.isArray(value)) {
          record[dbField] = value;
        }
      }
      // Handle date fields
      else if (['application_deadline', 'start_date', 'end_date'].includes(dbField)) {
        record[dbField] = parseDate(row[csvField]);
      }
      // Handle amount fields
      else if (['amount_min', 'amount_max', 'amount_fixed'].includes(dbField)) {
        record[dbField] = parseAmount(row[csvField]);
      }
      // Handle confidence score (normalize to 0-1)
      else if (dbField === 'confidence_score') {
        const score = parseFloat(row[csvField]);
        record[dbField] = isNaN(score) ? null : Math.min(1, score / 100);
      }
      // Standard string fields
      else if (!record[dbField]) {
        record[dbField] = row[csvField];
      }
    }
  }

  // Normalize category and jurisdiction
  if (record.category) {
    record.category = normalizeCategory(record.category);
  } else if (record.jurisdiction_level) {
    record.category = normalizeCategory(record.jurisdiction_level);
  } else {
    record.category = 'state';
  }

  if (record.jurisdiction_level) {
    record.jurisdiction_level = normalizeJurisdiction(record.jurisdiction_level);
  } else {
    record.jurisdiction_level = record.category;
  }

  // Default program_type if missing
  if (!record.program_type) {
    record.program_type = 'incentive';
  }

  // Infer state if missing or "Unknown"
  if (!record.state || record.state === 'Unknown') {
    const inferredState = inferState(row);
    if (inferredState) {
      record.state = inferredState;
    } else {
      // Mark as federal if no state can be inferred
      record.state = null;
      record.jurisdiction_level = 'federal';
      record.category = 'federal';
    }
  }

  // Generate external_id if missing
  if (!record.external_id && record.name) {
    const slug = record.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 50);
    record.external_id = `${record.state || 'US'}-${slug}-${Date.now()}`;
  }

  // Set default status
  if (!record.status || record.status === 'Active') {
    record.status = 'active';
  } else {
    record.status = record.status.toLowerCase();
  }
  record.last_verified_at = new Date().toISOString();

  return record;
}

// Simple CSV parser
function parseCSV(content: string): Record<string, any>[] {
  const lines = content.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const records: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV parsing with quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record: Record<string, any> = {};
    headers.forEach((header, idx) => {
      record[header] = values[idx] || '';
    });
    records.push(record);
  }

  return records;
}

// Main import function
async function importIncentives(options: {
  filePath: string;
  dryRun?: boolean;
  batchSize?: number;
  stateFilter?: string;
}) {
  const { filePath, dryRun = false, batchSize = 100, stateFilter } = options;

  console.log('\n========================================');
  console.log('IncentEdge Incentive Programs Importer');
  console.log('========================================\n');

  // Check file exists
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`File: ${absolutePath}`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Batch size: ${batchSize}`);
  if (stateFilter) console.log(`State filter: ${stateFilter}`);

  // Read file
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  const isCSV = absolutePath.endsWith('.csv');

  if (!isCSV) {
    console.error('Currently only CSV files are supported. XLSX support coming soon.');
    console.error('Convert your XLSX to CSV first.');
    process.exit(1);
  }

  // Parse CSV
  console.log('\nParsing CSV...');
  const rawRecords = parseCSV(fileContent);
  console.log(`Found ${rawRecords.length} records`);

  // Convert to database format
  console.log('Converting to database format...');
  let dbRecords = rawRecords.map(csvRowToRecord);

  // Apply state filter if specified
  if (stateFilter) {
    dbRecords = dbRecords.filter((r) => r.state?.toUpperCase() === stateFilter.toUpperCase());
    console.log(`Filtered to ${dbRecords.length} records for state ${stateFilter}`);
  }

  // Filter out records without required fields
  const validRecords = dbRecords.filter((r) => r.name && r.category && r.jurisdiction_level);
  console.log(`Valid records (with required fields): ${validRecords.length}`);

  if (validRecords.length === 0) {
    console.log('No valid records to import.');
    return;
  }

  // Show sample record
  console.log('\nSample record:');
  console.log(JSON.stringify(validRecords[0], null, 2));

  if (dryRun) {
    console.log('\n[DRY RUN] Would import the following summary:');
    const byState: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    validRecords.forEach((r) => {
      byState[r.state || 'Unknown'] = (byState[r.state || 'Unknown'] || 0) + 1;
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    });
    console.log('\nBy State:', byState);
    console.log('By Category:', byCategory);
    console.log('\n[DRY RUN] No data was written to the database.');
    return;
  }

  // Import in batches
  console.log('\nImporting to Supabase...');
  let imported = 0;
  let errors = 0;

  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize);

    const { data, error } = await supabase
      .from('incentive_programs')
      .upsert(batch, {
        onConflict: 'external_id',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      imported += data?.length || batch.length;
      process.stdout.write(`\rImported: ${imported}/${validRecords.length}`);
    }
  }

  console.log('\n\n========================================');
  console.log('Import Complete!');
  console.log('========================================');
  console.log(`Total records: ${validRecords.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Errors: ${errors}`);
}

// Parse CLI arguments
const args = process.argv.slice(2);
const options: any = {
  filePath: '',
  dryRun: false,
  batchSize: 100,
  stateFilter: undefined,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--file' && args[i + 1]) {
    options.filePath = args[++i];
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--batch' && args[i + 1]) {
    options.batchSize = parseInt(args[++i], 10);
  } else if (arg === '--state' && args[i + 1]) {
    options.stateFilter = args[++i];
  }
}

if (!options.filePath) {
  console.log('Usage: npx ts-node scripts/import-incentives.ts --file <path-to-csv> [options]');
  console.log('\nOptions:');
  console.log('  --file      Path to CSV file (required)');
  console.log('  --dry-run   Preview import without writing');
  console.log('  --batch     Batch size (default: 100)');
  console.log('  --state     Filter to specific state (e.g., NY)');
  process.exit(1);
}

importIncentives(options).catch(console.error);
