#!/usr/bin/env npx ts-node
/**
 * NYSERDA Grant Awards Scraper
 *
 * Scrapes NYSERDA's open data portal for clean energy grant awards
 * Source: data.ny.gov - "NYSERDA Supported Projects and Investments"
 *
 * Target: 500-1,000 high-quality redacted awards for AI training
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface NYSERDAAward {
  award_id: string;
  source: string;
  applicant_type: string;
  project_title: string;
  narrative: string;
  award_amount: number;
  technology: string;
  location: string;
  year_awarded: number;
  redaction_level: string;
  narrative_word_count: number;
  has_budget: boolean;
  has_outcomes: boolean;
  quality_score: number;
}

interface ScrapeStats {
  total_records: number;
  records_processed: number;
  high_quality_awards: number;
  skipped_low_quality: number;
  errors: number;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
}

/**
 * NYSERDA Open Data API Configuration
 * Dataset: "NYSERDA Supported Projects and Investments"
 */
const NYSERDA_API_CONFIG = {
  // Note: This is a placeholder - actual API endpoint needs to be verified
  base_url: 'https://data.ny.gov/api/views/',
  dataset_id: 'PLACEHOLDER', // Need to find actual dataset ID
  format: 'json',
  limit: 1000, // Records per page
};

/**
 * Technology keywords for categorization
 */
const TECH_KEYWORDS = {
  'Solar PV': ['solar', 'photovoltaic', 'pv system', 'solar panel'],
  'Wind': ['wind turbine', 'wind energy', 'wind power'],
  'Energy Efficiency': ['efficiency', 'insulation', 'hvac', 'lighting', 'retrofit'],
  'Battery Storage': ['battery', 'storage', 'energy storage'],
  'EV Charging': ['electric vehicle', 'ev charging', 'charging station'],
  'Heat Pump': ['heat pump', 'air source', 'ground source', 'geothermal'],
  'Combined Heat Power': ['chp', 'cogeneration', 'combined heat'],
  'Building Controls': ['building automation', 'controls', 'ems', 'bms'],
};

/**
 * Applicant type mapping (for redaction)
 */
const APPLICANT_TYPE_MAP: { [key: string]: string } = {
  'commercial': 'Commercial Building Owner',
  'industrial': 'Industrial Facility',
  'residential': 'Residential Property Owner',
  'nonprofit': 'Nonprofit Organization',
  'municipal': 'Municipal Government',
  'school': 'Educational Institution',
  'hospital': 'Healthcare Facility',
};

/**
 * Calculate quality score for grant award
 */
function calculateQualityScore(award: Partial<NYSERDAAward>): number {
  let score = 0.0;

  // Narrative quality (40%)
  if (award.narrative_word_count && award.narrative_word_count >= 200) {
    score += 0.40;
  } else if (award.narrative_word_count && award.narrative_word_count >= 100) {
    score += 0.20;
  }

  // Has budget (20%)
  if (award.has_budget && award.award_amount && award.award_amount > 0) {
    score += 0.20;
  }

  // Has outcomes/impact (20%)
  if (award.has_outcomes) {
    score += 0.20;
  }

  // Technology identified (10%)
  if (award.technology && award.technology !== 'Other') {
    score += 0.10;
  }

  // Location specificity (10%)
  if (award.location && award.location.includes(',')) {
    score += 0.10;
  }

  return Math.min(score, 1.0);
}

/**
 * Identify technology from project description
 */
function identifyTechnology(text: string): string {
  const lowerText = text.toLowerCase();

  for (const [tech, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return tech;
    }
  }

  return 'Other';
}

/**
 * Redact sensitive information from text
 */
function redactSensitiveInfo(text: string, applicantType: string): string {
  let redacted = text;

  // Redact potential organization names (capitalized multi-word phrases)
  // This is a simple heuristic - may need refinement
  redacted = redacted.replace(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s+(?:Inc|LLC|Corp|Company|Association)\b/g, applicantType);

  // Redact email addresses
  redacted = redacted.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[REDACTED EMAIL]');

  // Redact phone numbers
  redacted = redacted.replace(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED PHONE]');

  // Redact specific street addresses (keep city/state)
  redacted = redacted.replace(/\b\d+\s+[A-Z][a-z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd)\b/gi, '[Address]');

  return redacted;
}

/**
 * Mock scraping function (replace with actual API calls)
 * For demonstration - shows structure of what real scraper would do
 */
async function scrapeNYSERDAData(limit: number = 1000): Promise<NYSERDAAward[]> {
  console.log(`🔍 Scraping NYSERDA awards (target: ${limit})...`);
  console.log('📡 Source: data.ny.gov (NYSERDA Open Data Portal)\n');

  const awards: NYSERDAAward[] = [];
  const stats: ScrapeStats = {
    total_records: 0,
    records_processed: 0,
    high_quality_awards: 0,
    skipped_low_quality: 0,
    errors: 0,
    start_time: new Date().toISOString(),
  };

  // NOTE: This is a MOCK implementation
  // In production, this would:
  // 1. Fetch data from NYSERDA Open Data API
  // 2. Parse JSON/CSV responses
  // 3. Extract relevant fields
  // 4. Structure into our schema

  console.log('⚠️  MOCK MODE: Generating sample data for testing');
  console.log('⚠️  Replace with actual API calls to data.ny.gov\n');

  // Generate sample awards for testing
  const sampleTechnologies = ['Solar PV', 'Energy Efficiency', 'Heat Pump', 'EV Charging', 'Wind'];
  const sampleLocations = ['Buffalo, NY', 'Rochester, NY', 'Syracuse, NY', 'Albany, NY', 'New York, NY'];
  const sampleApplicantTypes = Object.values(APPLICANT_TYPE_MAP);

  for (let i = 0; i < Math.min(limit, 100); i++) {
    const tech = sampleTechnologies[Math.floor(Math.random() * sampleTechnologies.length)];
    const location = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
    const applicantType = sampleApplicantTypes[Math.floor(Math.random() * sampleApplicantTypes.length)];
    const year = 2018 + Math.floor(Math.random() * 8);
    const amount = 50000 + Math.floor(Math.random() * 500000);

    const narrative = `Problem: The facility was experiencing high energy costs and outdated ${tech.toLowerCase()} systems. ` +
      `Solution: Install modern ${tech} technology with a capacity of ${Math.floor(Math.random() * 500) + 50} kW. ` +
      `Impact: Expected to reduce energy costs by ${Math.floor(Math.random() * 40) + 20}% and decrease emissions by ${Math.floor(Math.random() * 100) + 50} tons CO2 annually. ` +
      `The project will be completed in ${Math.floor(Math.random() * 12) + 6} months and will serve as a demonstration project for similar facilities in the region.`;

    const award: NYSERDAAward = {
      award_id: `NYSERDA-${year}-${String(i + 1).padStart(5, '0')}`,
      source: 'NYSERDA',
      applicant_type: applicantType,
      project_title: `${tech} Installation at ${applicantType}`,
      narrative: redactSensitiveInfo(narrative, applicantType),
      award_amount: amount,
      technology: tech,
      location: location,
      year_awarded: year,
      redaction_level: 'Full',
      narrative_word_count: narrative.split(/\s+/).length,
      has_budget: true,
      has_outcomes: narrative.includes('Impact:'),
      quality_score: 0,
    };

    // Calculate quality score
    award.quality_score = calculateQualityScore(award);

    // Only include high-quality awards (score >= 0.60)
    if (award.quality_score >= 0.60) {
      awards.push(award);
      stats.high_quality_awards++;
    } else {
      stats.skipped_low_quality++;
    }

    stats.records_processed++;

    // Progress update every 100 records
    if (stats.records_processed % 100 === 0) {
      console.log(`  Processed ${stats.records_processed} records, ${stats.high_quality_awards} high-quality awards found`);
    }
  }

  stats.total_records = stats.records_processed;
  stats.end_time = new Date().toISOString();
  const duration = (new Date(stats.end_time).getTime() - new Date(stats.start_time).getTime()) / 1000 / 60;
  stats.duration_minutes = Math.round(duration * 100) / 100;

  console.log('\n✅ Scraping complete!');
  console.log(`   Total records: ${stats.total_records}`);
  console.log(`   High-quality awards: ${stats.high_quality_awards}`);
  console.log(`   Skipped (low quality): ${stats.skipped_low_quality}`);
  console.log(`   Duration: ${stats.duration_minutes} minutes\n`);

  // Save stats
  const statsPath = path.join(__dirname, '../../Grant_Training_Data/NYSERDA_Awards/scrape_stats.json');
  fs.mkdirSync(path.dirname(statsPath), { recursive: true });
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

  return awards;
}

/**
 * Export awards to CSV
 */
function exportToCSV(awards: NYSERDAAward[], outputPath: string): void {
  console.log(`📄 Exporting ${awards.length} awards to CSV...`);

  const headers = [
    'award_id',
    'source',
    'applicant_type',
    'project_title',
    'narrative',
    'award_amount',
    'technology',
    'location',
    'year_awarded',
    'redaction_level',
    'narrative_word_count',
    'has_budget',
    'has_outcomes',
    'quality_score',
  ];

  const csvLines = [headers.join(',')];

  awards.forEach(award => {
    const row = headers.map(header => {
      let value = award[header as keyof NYSERDAAward];

      // Escape commas and quotes in text fields
      if (typeof value === 'string') {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      return value;
    });

    csvLines.push(row.join(','));
  });

  fs.writeFileSync(outputPath, csvLines.join('\n'));
  console.log(`✅ CSV exported: ${outputPath}\n`);
}

/**
 * Export awards to JSON
 */
function exportToJSON(awards: NYSERDAAward[], outputPath: string): void {
  console.log(`📄 Exporting ${awards.length} awards to JSON...`);
  fs.writeFileSync(outputPath, JSON.stringify(awards, null, 2));
  console.log(`✅ JSON exported: ${outputPath}\n`);
}

/**
 * Generate quality report
 */
function generateQualityReport(awards: NYSERDAAward[], outputPath: string): void {
  console.log('📊 Generating quality report...');

  const avgQualityScore = awards.reduce((sum, a) => sum + a.quality_score, 0) / awards.length;
  const avgNarrativeLength = awards.reduce((sum, a) => sum + a.narrative_word_count, 0) / awards.length;
  const avgAwardAmount = awards.reduce((sum, a) => sum + a.award_amount, 0) / awards.length;

  const techCounts: { [key: string]: number } = {};
  awards.forEach(a => {
    techCounts[a.technology] = (techCounts[a.technology] || 0) + 1;
  });

  const yearCounts: { [key: number]: number } = {};
  awards.forEach(a => {
    yearCounts[a.year_awarded] = (yearCounts[a.year_awarded] || 0) + 1;
  });

  const report = `# NYSERDA Grant Awards - Quality Report
**Generated:** ${new Date().toISOString()}
**Total Awards:** ${awards.length}

## Quality Metrics

- **Average Quality Score:** ${avgQualityScore.toFixed(3)}
- **Average Narrative Length:** ${Math.round(avgNarrativeLength)} words
- **Average Award Amount:** $${Math.round(avgAwardAmount).toLocaleString()}
- **Awards with Budget:** ${awards.filter(a => a.has_budget).length} (${((awards.filter(a => a.has_budget).length / awards.length) * 100).toFixed(1)}%)
- **Awards with Outcomes:** ${awards.filter(a => a.has_outcomes).length} (${((awards.filter(a => a.has_outcomes).length / awards.length) * 100).toFixed(1)}%)

## Technology Distribution

${Object.entries(techCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([tech, count]) => `- **${tech}:** ${count} awards (${((count / awards.length) * 100).toFixed(1)}%)`)
  .join('\n')}

## Year Distribution

${Object.entries(yearCounts)
  .sort((a, b) => Number(b[0]) - Number(a[0]))
  .map(([year, count]) => `- **${year}:** ${count} awards`)
  .join('\n')}

## Sample Award (Highest Quality)

${(() => {
  const best = awards.reduce((max, a) => a.quality_score > max.quality_score ? a : max, awards[0]);
  return `
**Award ID:** ${best.award_id}
**Title:** ${best.project_title}
**Technology:** ${best.technology}
**Amount:** $${best.award_amount.toLocaleString()}
**Quality Score:** ${best.quality_score.toFixed(3)}

**Narrative:**
${best.narrative.substring(0, 300)}${best.narrative.length > 300 ? '...' : ''}
`;
})()}

## Next Steps

1. Review sample awards for quality
2. Adjust scraping filters if needed
3. Run production scrape for full 188K dataset
4. Train AI on high-quality subset (score >= 0.70)
`;

  fs.writeFileSync(outputPath, report);
  console.log(`✅ Quality report generated: ${outputPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('========================================');
  console.log('NYSERDA GRANT AWARDS SCRAPER');
  console.log('========================================\n');

  const outputDir = path.join(__dirname, '../../Grant_Training_Data/NYSERDA_Awards');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'raw_data'), { recursive: true });
  fs.mkdirSync(path.join(outputDir, 'processed'), { recursive: true });

  // Scrape awards (mock for now)
  const awards = await scrapeNYSERDAData(1000);

  // Export to various formats
  const csvPath = path.join(outputDir, 'processed/nyserda_awards.csv');
  const jsonPath = path.join(outputDir, 'processed/nyserda_awards.json');
  const reportPath = path.join(outputDir, 'QUALITY_REPORT.md');

  exportToCSV(awards, csvPath);
  exportToJSON(awards, jsonPath);
  generateQualityReport(awards, reportPath);

  console.log('========================================');
  console.log('✅ SCRAPING COMPLETE');
  console.log('========================================');
  console.log(`Awards collected: ${awards.length}`);
  console.log(`Output directory: ${outputDir}`);
  console.log('\n📋 Next steps:');
  console.log('1. Review quality report');
  console.log('2. Replace mock scraping with real API calls');
  console.log('3. Run production scrape for full dataset');
  console.log('========================================\n');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
