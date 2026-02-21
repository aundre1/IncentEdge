/**
 * AI Extraction Service
 *
 * Handles web scraping and AI-powered data extraction using Claude API
 * Uses Claude Sonnet 4 (FREE on Claude Max plan)
 */

import Anthropic from '@anthropic-ai/sdk';

export interface FundingExtraction {
  funding_amount_raw: string | null;
  funding_amount_normalized: string | null;
  funding_currency: string;
  funding_type: string | null;
  confidence: 'high' | 'medium' | 'low';
}

export interface EligibilityExtraction {
  eligible_applicants: string[];
  project_types: string[];
  geographic_restrictions: string | null;
  business_size: string | null;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Fetch HTML content from URL with timeout and error handling
 */
export async function fetchHTML(url: string, timeoutMs: number = 10000): Promise<string | null> {
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
 * Removes scripts, styles, and keeps only relevant text content
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
export async function extractFundingAmount(
  url: string,
  html: string,
  apiKey: string
): Promise<FundingExtraction | null> {

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

    // Parse JSON response
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
export async function extractEligibility(
  url: string,
  html: string,
  apiKey: string
): Promise<EligibilityExtraction | null> {

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

    // Parse JSON response
    const extracted = JSON.parse(responseText) as EligibilityExtraction;

    return extracted;

  } catch (error) {
    console.error(`Error extracting eligibility for ${url}:`, error);
    return null;
  }
}

/**
 * Rate limiter utility
 */
export class RateLimiter {
  private lastRequestTime: number = 0;
  private msPerRequest: number;

  constructor(requestsPerMinute: number) {
    this.msPerRequest = (60 * 1000) / requestsPerMinute;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const waitTime = Math.max(0, this.msPerRequest - timeSinceLastRequest);

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }
}

/**
 * Exponential backoff for API retries
 */
export async function withRetry<T>(
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
