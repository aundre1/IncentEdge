#!/usr/bin/env npx ts-node
/**
 * IncentEdge AI Enrichment Pipeline
 *
 * Promotes 2,000-4,000 Tier 2 programs to Tier 1 using AI extraction
 * - Funding amounts: ~2,000 programs
 * - Eligibility criteria: ~1,500 programs
 * - Agency identification: ~1,000 programs (regex-based)
 *
 * Uses Claude Sonnet 4 via API (FREE on Claude Max plan)
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import Anthropic from '@anthropic-ai/sdk';

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
  missingFields: string[];
}

interface EnrichmentLog {
  programsProcessed: number;
  fundingExtracted: number;
  eligibilityExtracted: number;
  agencyIdentified: number;
  apiCallsMade: number;
  successRate: number;
  tierPromotions: number;
  errors: Array<{ url: string; error: string }>;
  sampleExtractions: Array<{
    url: string;
    field: string;
    extracted: string;
    confidence: string;
  }>;
  byFieldType: {
    funding: { attempted: number; success: number; failed: number };
    eligibility: { attempted: number; success: number; failed: number };
    agency: { attempted: number; success: number; failed: number };
  };
}

interface FundingExtraction {
  funding_amount_raw: string | null;
  funding_amount_normalized: string | null;
  funding_currency: string;
  funding_type: string | null;
  confidence: 'high' | 'medium' | 'low';
}

interface EligibilityExtraction {
  eligible_applicants: string[];
  project_types: string[];
  geographic_restrictions: string | null;
  business_size: string | null;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Agency domain mapping (URL pattern -> Agency name)
 */
const AGENCY_MAP: Record<string, string> = {
  // Federal agencies
  'energy.gov': 'U.S. Department of Energy',
  'doe.gov': 'U.S. Department of Energy',
  'epa.gov': 'U.S. Environmental Protection Agency',
  'hud.gov': 'U.S. Department of Housing and Urban Development',
  'usda.gov': 'U.S. Department of Agriculture',
  'transportation.gov': 'U.S. Department of Transportation',
  'dot.gov': 'U.S. Department of Transportation',
  'sba.gov': 'U.S. Small Business Administration',
  'commerce.gov': 'U.S. Department of Commerce',
  'treasury.gov': 'U.S. Department of the Treasury',
  'irs.gov': 'Internal Revenue Service',

  // State agencies - California
  'ca.gov': 'State of California',
  'energy.ca.gov': 'California Energy Commission',
  'cpuc.ca.gov': 'California Public Utilities Commission',
  'arb.ca.gov': 'California Air Resources Board',
  'calrecycle.ca.gov': 'CalRecycle',

  // State agencies - New York
  'ny.gov': 'State of New York',
  'nyserda.ny.gov': 'New York State Energy Research and Development Authority',
  'dec.ny.gov': 'NY Department of Environmental Conservation',

  // State agencies - Texas
  'texas.gov': 'State of Texas',
  'tceq.texas.gov': 'Texas Commission on Environmental Quality',
  'comptroller.texas.gov': 'Texas Comptroller of Public Accounts',

  // State agencies - Other
  'mass.gov': 'Commonwealth of Massachusetts',
  'masscec.com': 'Massachusetts Clean Energy Center',
  'illinois.gov': 'State of Illinois',
  'florida.gov': 'State of Florida',
  'colorado.gov': 'State of Colorado',
  'oregon.gov': 'State of Oregon',
  'washington.gov': 'State of Washington',

  // Regional/Local
  'pge.com': 'Pacific Gas & Electric',
  'sce.com': 'Southern California Edison',
  'sdge.com': 'San Diego Gas & Electric',
  'bge.com': 'Baltimore Gas & Electric',
  'coned.com': 'Consolidated Edison',

  // Regional Energy Networks
  '3c-ren.org': '3C-REN',
  'bayren.org': 'BayREN',
  'mcecleanenergy.org': 'MCE Clean Energy',

  // Councils of Governments
  'sacog.org': 'Sacramento Area Council of Governments',
  'abag.ca.gov': 'Association of Bay Area Governments',
  'scag.ca.gov': 'Southern California Association of Governments',
  'sandag.org': 'San Diego Association of Governments',
  'marc.org': 'Mid-America Regional Council',
  'drcog.org': 'Denver Regional Council of Governments',
  'noaca.org': 'Northeast Ohio Areawide Coordinating Agency',
  'semcog.org': 'Southeast Michigan Council of Governments',

  // Foundations
  'rockefellerfoundation.org': 'Rockefeller Foundation',
  'fordfoundation.org': 'Ford Foundation',
  'bloomberg.org': 'Bloomberg Philanthropies',
  'bezosearthfund.org': 'Bezos Earth Fund',
  'kresge.org': 'Kresge Foundation',
  'turnerfoundation.org': 'Turner Foundation',
};

/**
 * Calculate validation score (from analyze-master-data.ts)
 */
function calculateValidationScore(program: IncentiveProgram): ValidationResult {
  let score = 0.0;
  const missingFields: string[] = [];

  // URL (25%)
  if (program.URL && program.URL.trim() && !['N/A', 'nan', ''].includes(program.URL.trim())) {
    score += 0.25;
  } else {
    missingFields.push('URL');
  }

  // Application Links (10%)
  if (program['Application Links'] && program['Application Links'].trim()) {
    score += 0.10;
  } else {
    missingFields.push('Application Links');
  }

  // Funding Amount (15%)
  if ((program['Funding Amount Raw'] && program['Funding Amount Raw'].trim()) ||
      (program['Funding Amount Normalized'] && program['Funding Amount Normalized'].trim())) {
    score += 0.15;
  } else {
    missingFields.push('Funding Amount');
  }

  // Eligibility (15%)
  if (program.Eligibility && program.Eligibility.trim()) {
    score += 0.15;
  } else {
    missingFields.push('Eligibility');
  }

  // Agency (10%)
  if (program.Agency && program.Agency.trim()) {
    score += 0.10;
  } else {
    missingFields.push('Agency');
  }

  // Program Type (5%)
  if (program['Program Type'] && program['Program Type'].trim()) {
    score += 0.05;
  } else {
    missingFields.push('Program Type');
  }

  // Technology/Category (5%)
  if ((program.Technology && program.Technology.trim()) ||
      (program.Category && program.Category.trim())) {
    score += 0.05;
  } else {
    missingFields.push('Technology/Category');
  }

  // Contact Info (5%)
  if ((program['Contact Email'] && program['Contact Email'].trim()) ||
      (program['Contact Phone'] && program['Contact Phone'].trim())) {
    score += 0.05;
  } else {
    missingFields.push('Contact Info');
  }

  // State (5%)
  if (program.State && program.State.trim()) {
    score += 0.05;
  } else {
    missingFields.push('State');
  }

  // Application Steps (5%)
  if (program['Application Steps'] && program['Application Steps'].trim()) {
    score += 0.05;
  } else {
    missingFields.push('Application Steps');
  }

  return {
    score: Math.min(score, 1.0),
    tier: score >= 0.70 ? 1 : score >= 0.50 ? 2 : score >= 0.30 ? 3 : score >= 0.10 ? 4 : 5,
    missingFields
  };
}

/**
 * Identify agency from URL using regex patterns
 */
function identifyAgencyFromURL(url: string): string | null {
  if (!url || !url.trim()) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');

    // Check exact match
    if (AGENCY_MAP[hostname]) {
      return AGENCY_MAP[hostname];
    }

    // Check if hostname contains any of the agency domains
    for (const [domain, agency] of Object.entries(AGENCY_MAP)) {
      if (hostname.includes(domain)) {
        return agency;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

// Get API key from environment
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY || '';

/**
 * Fetch HTML content from URL with timeout and error handling
 */
async function fetchHTML(url: string, timeoutMs: number = 10000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    return html;

  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.error(`Timeout fetching ${url}`);
    } else {
      console.error(`Error fetching ${url}:`, error);
    }
    return null;
  }
}

/**
 * Clean HTML to reduce token usage
 */
function cleanHTML(html: string): string {
  // Remove script tags and content
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove style tags and content
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  // Truncate if still too long (max ~100K chars to stay under token limits)
  if (cleaned.length > 100000) {
    cleaned = cleaned.substring(0, 100000) + '... [truncated]';
  }
  return cleaned;
}

/**
 * Extract funding amount using Claude API
 */
async function extractFundingFromHTML(url: string, html: string, apiKey: string): Promise<FundingExtraction | null> {
  const client = new Anthropic({ apiKey });

  const prompt = `Extract funding amount information from this incentive program webpage.

URL: ${url}

HTML Content:
${cleanHTML(html)}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "funding_amount_raw": "exact text from page showing funding amount (e.g., 'Up to $5,000 per household')",
  "funding_amount_normalized": "normalized numeric value if possible (e.g., '5000')",
  "funding_currency": "currency code (usually USD)",
  "funding_type": "grant, rebate, tax_credit, loan, or other",
  "confidence": "high, medium, or low"
}

If no funding information is found, return:
{
  "funding_amount_raw": null,
  "funding_amount_normalized": null,
  "funding_currency": "USD",
  "funding_type": null,
  "confidence": "low"
}

Rules:
- Only extract information explicitly stated on the page
- funding_amount_raw should be the verbatim text from the page
- funding_amount_normalized should be a number or null
- confidence should be "high" only if explicit amounts are found
- Return ONLY the JSON object, nothing else`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const extracted = JSON.parse(responseText) as FundingExtraction;
    return extracted;

  } catch (error) {
    console.error(`Error extracting funding for ${url}:`, error);
    return null;
  }
}

/**
 * Extract eligibility criteria using Claude API
 */
async function extractEligibilityFromHTML(url: string, html: string, apiKey: string): Promise<EligibilityExtraction | null> {
  const client = new Anthropic({ apiKey });

  const prompt = `Extract eligibility criteria from this incentive program webpage.

URL: ${url}

HTML Content:
${cleanHTML(html)}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "eligible_applicants": ["list of eligible applicant types, e.g., Residential, Commercial, Nonprofit"],
  "project_types": ["list of eligible project types, e.g., Solar PV, Energy Efficiency, EV Charging"],
  "geographic_restrictions": "geographic limitations or null if statewide/national",
  "business_size": "business size restrictions (e.g., 'Small businesses <100 employees') or null",
  "confidence": "high, medium, or low"
}

If no eligibility information is found, return:
{
  "eligible_applicants": [],
  "project_types": [],
  "geographic_restrictions": null,
  "business_size": null,
  "confidence": "low"
}

Rules:
- Only extract information explicitly stated on the page
- eligible_applicants should include categories like: Residential, Commercial, Industrial, Nonprofit, Municipal, Tribal
- project_types should include specific technologies or improvements mentioned
- confidence should be "high" only if explicit criteria are found
- Return ONLY the JSON object, nothing else`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const extracted = JSON.parse(responseText) as EligibilityExtraction;
    return extracted;

  } catch (error) {
    console.error(`Error extracting eligibility for ${url}:`, error);
    return null;
  }
}

/**
 * Exponential backoff for API retries
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T | null> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.error(`Failed after ${maxRetries} attempts:`, error);
        return null;
      }

      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

/**
 * Wrapper for funding extraction with retry logic
 */
async function extractFundingAmount(url: string, html: string): Promise<FundingExtraction | null> {
  if (!CLAUDE_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Skipping AI extraction.');
    return null;
  }

  return withRetry(() => extractFundingFromHTML(url, html, CLAUDE_API_KEY));
}

/**
 * Wrapper for eligibility extraction with retry logic
 */
async function extractEligibility(url: string, html: string): Promise<EligibilityExtraction | null> {
  if (!CLAUDE_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Skipping AI extraction.');
    return null;
  }

  return withRetry(() => extractEligibilityFromHTML(url, html, CLAUDE_API_KEY));
}

/**
 * Main enrichment pipeline
 */
async function enrichPrograms(
  programs: IncentiveProgram[],
  options: {
    maxPrograms?: number;
    rateLimit?: number; // requests per minute
    dryRun?: boolean;
  } = {}
): Promise<{ enriched: IncentiveProgram[]; log: EnrichmentLog }> {

  const { maxPrograms = Infinity, rateLimit = 10, dryRun = false } = options;

  const log: EnrichmentLog = {
    programsProcessed: 0,
    fundingExtracted: 0,
    eligibilityExtracted: 0,
    agencyIdentified: 0,
    apiCallsMade: 0,
    successRate: 0,
    tierPromotions: 0,
    errors: [],
    sampleExtractions: [],
    byFieldType: {
      funding: { attempted: 0, success: 0, failed: 0 },
      eligibility: { attempted: 0, success: 0, failed: 0 },
      agency: { attempted: 0, success: 0, failed: 0 }
    }
  };

  console.log(`\n🚀 Starting enrichment pipeline...`);
  console.log(`   Programs to process: ${Math.min(programs.length, maxPrograms)}`);
  console.log(`   Rate limit: ${rateLimit} requests/minute`);
  console.log(`   Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

  const msPerRequest = (60 * 1000) / rateLimit;
  let processed = 0;

  for (const program of programs) {
    if (processed >= maxPrograms) break;

    const validation = calculateValidationScore(program);

    // Only process Tier 2 programs (0.50 - 0.69)
    if (validation.tier !== 2) continue;

    processed++;
    log.programsProcessed++;

    console.log(`[${processed}/${Math.min(programs.length, maxPrograms)}] Processing: ${program.Title?.substring(0, 60)}...`);

    // 1. Agency identification (no API call needed)
    if (validation.missingFields.includes('Agency') && program.URL) {
      log.byFieldType.agency.attempted++;
      const agency = identifyAgencyFromURL(program.URL);
      if (agency && !dryRun) {
        program.Agency = agency;
        log.agencyIdentified++;
        log.byFieldType.agency.success++;
        console.log(`   ✓ Agency identified: ${agency}`);
      } else {
        log.byFieldType.agency.failed++;
      }
    }

    // 2. Funding amount extraction (requires API)
    if (validation.missingFields.includes('Funding Amount') && program.URL) {
      log.byFieldType.funding.attempted++;

      if (!dryRun) {
        try {
          const html = await fetchHTML(program.URL);
          if (html) {
            log.apiCallsMade++;
            const funding = await extractFundingAmount(program.URL, html);
            if (funding && funding.funding_amount_raw) {
              program['Funding Amount Raw'] = funding.funding_amount_raw;
              program['Funding Amount Normalized'] = funding.funding_amount_normalized || '';
              program['Funding AI Filled'] = 'true';
              program['Funding Currency'] = funding.funding_currency;
              log.fundingExtracted++;
              log.byFieldType.funding.success++;

              if (log.sampleExtractions.length < 10) {
                log.sampleExtractions.push({
                  url: program.URL,
                  field: 'funding',
                  extracted: funding.funding_amount_raw,
                  confidence: funding.confidence
                });
              }

              console.log(`   ✓ Funding extracted: ${funding.funding_amount_raw} (${funding.confidence} confidence)`);
            } else {
              log.byFieldType.funding.failed++;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, msPerRequest));
          } else {
            log.byFieldType.funding.failed++;
            log.errors.push({ url: program.URL, error: 'Failed to fetch HTML' });
          }
        } catch (error) {
          log.byFieldType.funding.failed++;
          log.errors.push({ url: program.URL, error: String(error) });
        }
      }
    }

    // 3. Eligibility extraction (requires API)
    if (validation.missingFields.includes('Eligibility') && program.URL) {
      log.byFieldType.eligibility.attempted++;

      if (!dryRun) {
        try {
          const html = await fetchHTML(program.URL);
          if (html) {
            log.apiCallsMade++;
            const eligibility = await extractEligibility(program.URL, html);
            if (eligibility && eligibility.eligible_applicants.length > 0) {
              program.Eligibility = formatEligibility(eligibility);
              program['Eligibility AI Filled'] = 'true';
              log.eligibilityExtracted++;
              log.byFieldType.eligibility.success++;

              if (log.sampleExtractions.length < 10) {
                log.sampleExtractions.push({
                  url: program.URL,
                  field: 'eligibility',
                  extracted: program.Eligibility.substring(0, 100),
                  confidence: eligibility.confidence
                });
              }

              console.log(`   ✓ Eligibility extracted (${eligibility.confidence} confidence)`);
            } else {
              log.byFieldType.eligibility.failed++;
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, msPerRequest));
          } else {
            log.byFieldType.eligibility.failed++;
          }
        } catch (error) {
          log.byFieldType.eligibility.failed++;
          log.errors.push({ url: program.URL, error: String(error) });
        }
      }
    }

    // 4. Check if program can be promoted to Tier 1
    const newValidation = calculateValidationScore(program);
    if (validation.tier === 2 && newValidation.tier === 1) {
      log.tierPromotions++;
      console.log(`   🎉 PROMOTED TO TIER 1! (score: ${newValidation.score.toFixed(2)})`);
    }

    console.log('');
  }

  // Calculate success rate
  const totalAttempted = log.byFieldType.funding.attempted +
                         log.byFieldType.eligibility.attempted +
                         log.byFieldType.agency.attempted;
  const totalSuccess = log.fundingExtracted + log.eligibilityExtracted + log.agencyIdentified;
  log.successRate = totalAttempted > 0 ? (totalSuccess / totalAttempted) * 100 : 0;

  return { enriched: programs, log };
}

/**
 * Format eligibility data as readable string
 */
function formatEligibility(data: EligibilityExtraction): string {
  const parts: string[] = [];

  if (data.eligible_applicants.length > 0) {
    parts.push(`Eligible: ${data.eligible_applicants.join(', ')}`);
  }
  if (data.project_types.length > 0) {
    parts.push(`Projects: ${data.project_types.join(', ')}`);
  }
  if (data.geographic_restrictions) {
    parts.push(`Location: ${data.geographic_restrictions}`);
  }
  if (data.business_size) {
    parts.push(`Size: ${data.business_size}`);
  }

  return parts.join('; ');
}

/**
 * Generate enrichment report
 */
function generateReport(log: EnrichmentLog, initialTier1: number, finalTier1: number): string {
  const report = `# IncentEdge AI Enrichment Report
Generated: ${new Date().toISOString()}

## Summary

- **Programs Processed:** ${log.programsProcessed.toLocaleString()}
- **API Calls Made:** ${log.apiCallsMade.toLocaleString()}
- **Overall Success Rate:** ${log.successRate.toFixed(1)}%

## Enrichment by Field Type

### Funding Amount
- Attempted: ${log.byFieldType.funding.attempted.toLocaleString()}
- Success: ${log.byFieldType.funding.success.toLocaleString()}
- Failed: ${log.byFieldType.funding.failed.toLocaleString()}
- Success Rate: ${log.byFieldType.funding.attempted > 0 ? ((log.byFieldType.funding.success / log.byFieldType.funding.attempted) * 100).toFixed(1) : 0}%

### Eligibility
- Attempted: ${log.byFieldType.eligibility.attempted.toLocaleString()}
- Success: ${log.byFieldType.eligibility.success.toLocaleString()}
- Failed: ${log.byFieldType.eligibility.failed.toLocaleString()}
- Success Rate: ${log.byFieldType.eligibility.attempted > 0 ? ((log.byFieldType.eligibility.success / log.byFieldType.eligibility.attempted) * 100).toFixed(1) : 0}%

### Agency Identification
- Attempted: ${log.byFieldType.agency.attempted.toLocaleString()}
- Success: ${log.byFieldType.agency.success.toLocaleString()}
- Failed: ${log.byFieldType.agency.failed.toLocaleString()}
- Success Rate: ${log.byFieldType.agency.attempted > 0 ? ((log.byFieldType.agency.success / log.byFieldType.agency.attempted) * 100).toFixed(1) : 0}%

## Tier Promotions

- **Tier 2 → Tier 1:** ${log.tierPromotions.toLocaleString()} programs
- **Initial Tier 1 Total:** ${initialTier1.toLocaleString()}
- **Final Tier 1 Total:** ${finalTier1.toLocaleString()}
- **Net Increase:** +${(finalTier1 - initialTier1).toLocaleString()} programs

## Sample Extractions

${log.sampleExtractions.map((sample, i) => `
### Sample ${i + 1}: ${sample.field}
- **URL:** ${sample.url}
- **Extracted:** ${sample.extracted}
- **Confidence:** ${sample.confidence}
`).join('\n')}

## Errors

Total errors: ${log.errors.length}

${log.errors.slice(0, 10).map((err, i) => `
${i + 1}. **URL:** ${err.url}
   **Error:** ${err.error}
`).join('\n')}

${log.errors.length > 10 ? `\n*(Showing first 10 of ${log.errors.length} errors)*` : ''}

## Success Criteria

- [${log.programsProcessed >= 2000 ? 'x' : ' '}] 2,000-4,000 programs enriched (${log.programsProcessed.toLocaleString()})
- [${log.successRate >= 80 ? 'x' : ' '}] 80%+ extraction success rate (${log.successRate.toFixed(1)}%)
- [${log.tierPromotions >= 3000 ? 'x' : ' '}] 3,000+ Tier 2 promoted to Tier 1 (${log.tierPromotions.toLocaleString()})
- [${finalTier1 >= 22000 ? 'x' : ' '}] New Tier 1 total: 22,000-24,000 (${finalTier1.toLocaleString()})

## Cost

**Total Cost:** $0 (Claude Max plan - FREE API usage)

---
*Generated by IncentEdge AI Enrichment Pipeline*
`;

  return report;
}

/**
 * Parse CLI arguments
 */
function parseArgs(): { maxPrograms: number; rateLimit: number; dryRun: boolean; help: boolean } {
  const args = process.argv.slice(2);
  const options = {
    maxPrograms: 4000,
    rateLimit: 10,
    dryRun: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--max-programs':
        options.maxPrograms = parseInt(args[++i], 10);
        break;
      case '--rate-limit':
        options.rateLimit = parseInt(args[++i], 10);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
IncentEdge AI Enrichment Pipeline

Usage: npx ts-node scripts/ai-enrichment-pipeline.ts [OPTIONS]

Options:
  --max-programs <n>   Maximum programs to process (default: 4000)
  --rate-limit <n>     API requests per minute (default: 10)
  --dry-run            Skip API calls, test logic only
  --help               Show this help message

Examples:
  # Dry run (no API calls)
  npx ts-node scripts/ai-enrichment-pipeline.ts --dry-run

  # Test with 10 programs
  npx ts-node scripts/ai-enrichment-pipeline.ts --max-programs 10

  # Full enrichment
  npx ts-node scripts/ai-enrichment-pipeline.ts --max-programs 4000

Environment Variables:
  ANTHROPIC_API_KEY    Claude API key (required for enrichment)
`);
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    return;
  }

  const masterPath = '/Users/dremacmini/Desktop/OC/IncentEdge/Master Lists Final/IncentEdge_MASTER_30007_20260123.csv';
  const outputPath = '/Users/dremacmini/Desktop/OC/IncentEdge/Master Lists Final/IncentEdge_MASTER_ENRICHED_30007_20260217.csv';
  const logPath = '/Users/dremacmini/Desktop/OC/IncentEdge/ENRICHMENT_LOG.json';
  const reportPath = '/Users/dremacmini/Desktop/OC/IncentEdge/ENRICHMENT_REPORT.md';

  console.log('📊 IncentEdge AI Enrichment Pipeline');
  console.log('=====================================\n');

  // Check for API key (unless dry run)
  if (!options.dryRun && !CLAUDE_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY environment variable not set');
    console.error('');
    console.error('To set your API key:');
    console.error('  export ANTHROPIC_API_KEY="your_key_here"');
    console.error('');
    console.error('Or add to .env.local:');
    console.error('  echo "ANTHROPIC_API_KEY=your_key_here" >> .env.local');
    console.error('');
    console.error('To run without API calls (test only):');
    console.error('  npx ts-node scripts/ai-enrichment-pipeline.ts --dry-run');
    process.exit(1);
  }

  // Load master data
  console.log('Loading master data...');
  const csvContent = fs.readFileSync(masterPath, 'utf-8');
  const programs = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  }) as IncentiveProgram[];

  console.log(`✓ Loaded ${programs.length.toLocaleString()} programs\n`);

  // Calculate initial tier distribution
  console.log('Analyzing initial state...');
  const initialTier1Count = programs.filter(p => calculateValidationScore(p).tier === 1).length;
  const tier2Programs = programs.filter(p => calculateValidationScore(p).tier === 2);

  console.log(`✓ Initial Tier 1: ${initialTier1Count.toLocaleString()} programs`);
  console.log(`✓ Tier 2 (candidates): ${tier2Programs.length.toLocaleString()} programs\n`);

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No API calls will be made\n');
  }

  // Run enrichment
  const { enriched, log } = await enrichPrograms(programs, {
    maxPrograms: options.maxPrograms,
    rateLimit: options.rateLimit,
    dryRun: options.dryRun
  });

  // Calculate final tier distribution
  const finalTier1Count = enriched.filter(p => calculateValidationScore(p).tier === 1).length;

  console.log('\n✅ Enrichment complete!\n');
  console.log('Summary:');
  console.log(`  Programs processed: ${log.programsProcessed.toLocaleString()}`);
  console.log(`  Funding extracted: ${log.fundingExtracted.toLocaleString()}`);
  console.log(`  Eligibility extracted: ${log.eligibilityExtracted.toLocaleString()}`);
  console.log(`  Agency identified: ${log.agencyIdentified.toLocaleString()}`);
  console.log(`  Tier promotions: ${log.tierPromotions.toLocaleString()}`);
  console.log(`  Success rate: ${log.successRate.toFixed(1)}%`);
  console.log(`  New Tier 1 total: ${finalTier1Count.toLocaleString()}\n`);

  // Save enriched CSV
  const enrichedCSV = stringify(enriched, { header: true });
  fs.writeFileSync(outputPath, enrichedCSV);
  console.log(`✓ Saved enriched CSV: ${outputPath}`);

  // Save log
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`✓ Saved enrichment log: ${logPath}`);

  // Generate and save report
  const report = generateReport(log, initialTier1Count, finalTier1Count);
  fs.writeFileSync(reportPath, report);
  console.log(`✓ Saved enrichment report: ${reportPath}\n`);

  if (options.dryRun) {
    console.log('ℹ️  This was a DRY RUN. To perform actual enrichment:');
    console.log('   npx ts-node scripts/ai-enrichment-pipeline.ts --max-programs 10');
  }
}

// Run main if this is the entry point
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { enrichPrograms, calculateValidationScore, identifyAgencyFromURL };
