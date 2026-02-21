#!/usr/bin/env npx ts-node
/**
 * IncentEdge Master Data Quality Analysis
 *
 * Analyzes the 30K+ incentives database for:
 * - Data completeness
 * - Validation scoring
 * - Tier classification
 * - Production readiness
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface IncentiveProgram {
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

interface DataQualityReport {
  totalPrograms: number;
  tierDistribution: { [key: number]: number };
  fieldCompleteness: { [key: string]: number };
  productionReady: number;
  needsEnrichment: number;
  needsURLRecovery: number;
  researchQueue: number;
  quarantine: number;
  topIssues: string[];
  recommendations: string[];
}

/**
 * Calculate validation score based on data completeness
 * Score: 0.0 - 1.0 (higher is better)
 */
function calculateValidationScore(program: IncentiveProgram): ValidationResult {
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
 * Tier 1: Production ready (0.70+)
 * Tier 2: Needs enrichment (0.50-0.69)
 * Tier 3: Needs URL recovery (0.30-0.49, missing URL)
 * Tier 4: Research queue (0.10-0.29)
 * Tier 5: Quarantine (<0.10)
 */
function assignTier(score: number, program: IncentiveProgram): number {
  if (score >= 0.70) return 1; // Production ready
  if (score >= 0.50) return 2; // Needs enrichment
  if (score >= 0.30 && (!program.URL || !program.URL.trim())) return 3; // URL recovery
  if (score >= 0.10) return 4; // Research queue
  return 5; // Quarantine
}

/**
 * Analyze master data file
 */
function analyzeData(csvPath: string): DataQualityReport {
  console.log('📊 Loading master data...\n');

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  }) as IncentiveProgram[];

  console.log(`✓ Loaded ${records.length} programs\n`);
  console.log('🔍 Analyzing data quality...\n');

  const report: DataQualityReport = {
    totalPrograms: records.length,
    tierDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    fieldCompleteness: {},
    productionReady: 0,
    needsEnrichment: 0,
    needsURLRecovery: 0,
    researchQueue: 0,
    quarantine: 0,
    topIssues: [],
    recommendations: []
  };

  const allIssues: { [key: string]: number } = {};
  const fieldKeys = Object.keys(records[0] || {});

  // Calculate field completeness
  fieldKeys.forEach(key => {
    const filledCount = records.filter(r => {
      const val = r[key as keyof IncentiveProgram];
      return val && String(val).trim() && !['N/A', 'nan', ''].includes(String(val).trim());
    }).length;
    report.fieldCompleteness[key] = (filledCount / records.length) * 100;
  });

  // Analyze each program
  records.forEach(program => {
    const validation = calculateValidationScore(program);

    // Update tier distribution
    report.tierDistribution[validation.tier]++;

    // Track issues
    validation.issues.forEach(issue => {
      allIssues[issue] = (allIssues[issue] || 0) + 1;
    });
  });

  // Calculate tier totals
  report.productionReady = report.tierDistribution[1];
  report.needsEnrichment = report.tierDistribution[2];
  report.needsURLRecovery = report.tierDistribution[3];
  report.researchQueue = report.tierDistribution[4];
  report.quarantine = report.tierDistribution[5];

  // Get top issues
  report.topIssues = Object.entries(allIssues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([issue, count]) => `${issue} (${count} programs, ${((count/records.length)*100).toFixed(1)}%)`);

  // Generate recommendations
  if (report.productionReady < 15000) {
    report.recommendations.push(`⚠️  Only ${report.productionReady.toLocaleString()} Tier 1 programs. Target: 15,000+ for production launch`);
  } else {
    report.recommendations.push(`✓ ${report.productionReady.toLocaleString()} Tier 1 programs - EXCEEDS production target of 15,000`);
  }

  if (report.fieldCompleteness['URL'] < 50) {
    report.recommendations.push('🔧 High priority: URL recovery pipeline for federal programs');
  }

  if (report.fieldCompleteness['Eligibility'] < 60) {
    report.recommendations.push('🤖 Consider AI extraction for eligibility criteria');
  }

  if (report.needsEnrichment > 5000) {
    report.recommendations.push(`📈 ${report.needsEnrichment.toLocaleString()} Tier 2 programs ready for enrichment`);
  }

  return report;
}

/**
 * Print report
 */
function printReport(report: DataQualityReport) {
  console.log('\n========================================');
  console.log('DATA QUALITY REPORT');
  console.log('========================================\n');

  console.log(`Total Programs: ${report.totalPrograms.toLocaleString()}\n`);

  console.log('TIER DISTRIBUTION');
  console.log('─────────────────');
  const tierLabels: { [key: number]: string } = {
    1: 'Production Ready',
    2: 'Needs Enrichment',
    3: 'URL Recovery',
    4: 'Research Queue',
    5: 'Quarantine'
  };

  Object.entries(report.tierDistribution).forEach(([tier, count]) => {
    const percentage = ((count / report.totalPrograms) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(Number(percentage) / 2));
    console.log(`Tier ${tier} (${tierLabels[Number(tier)]}):`);
    console.log(`  ${count.toLocaleString()} programs (${percentage}%) ${bar}`);
  });

  console.log('\nFIELD COMPLETENESS (Top 15)');
  console.log('────────────────────────────');
  const sortedFields = Object.entries(report.fieldCompleteness)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  sortedFields.forEach(([field, percentage]) => {
    const bar = '█'.repeat(Math.floor(percentage / 2));
    const icon = percentage >= 70 ? '✓' : percentage >= 50 ? '○' : '✗';
    console.log(`${icon} ${field.padEnd(25)} ${percentage.toFixed(1)}% ${bar}`);
  });

  console.log('\nTOP ISSUES');
  console.log('──────────');
  report.topIssues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });

  console.log('\nRECOMMENDATIONS');
  console.log('───────────────');
  report.recommendations.forEach(rec => {
    console.log(rec);
  });

  console.log('\n========================================');
  console.log('PRODUCTION READINESS');
  console.log('========================================');
  const readinessScore = (report.productionReady / report.totalPrograms) * 100;
  console.log(`Production-ready programs: ${report.productionReady.toLocaleString()} / ${report.totalPrograms.toLocaleString()} (${readinessScore.toFixed(1)}%)`);

  if (report.productionReady >= 15000) {
    console.log('✓ READY FOR PRODUCTION LAUNCH');
  } else {
    const deficit = 15000 - report.productionReady;
    console.log(`⚠️  Need ${deficit.toLocaleString()} more Tier 1 programs for production target`);
    console.log(`   → Promote ${Math.min(deficit, report.needsEnrichment).toLocaleString()} from Tier 2 via enrichment`);
    if (deficit > report.needsEnrichment) {
      console.log(`   → Recover ${Math.min(deficit - report.needsEnrichment, report.needsURLRecovery).toLocaleString()} from Tier 3 via URL recovery`);
    }
  }

  console.log('\n');
}

/**
 * Main execution
 */
function main() {
  const csvPath = path.join(__dirname, '../../Master Lists Final/IncentEdge_MASTER_30007_20260123.csv');

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Master data file not found: ${csvPath}`);
    console.error('Please ensure the file exists at the specified path.');
    process.exit(1);
  }

  const report = analyzeData(csvPath);
  printReport(report);

  // Save JSON report
  const reportPath = path.join(__dirname, '../data-quality-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);
}

main();
