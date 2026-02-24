/**
 * Incentive Program Processor Library
 *
 * AI-powered extraction of incentive program data from utility/government PDFs.
 * Uses a 3-step chain-of-thought pipeline: classify → extract → validate
 */

import {
  IncentiveProgramExtractedData,
  IncentiveProgramClassification,
  IncentiveProgramValidationResult,
  IncentiveProgramProcessingResult,
} from '@/types/incentive-programs';

// ============================================================================
// PROCESSOR CONFIGURATION
// ============================================================================

interface ProcessorConfig {
  model: string;
  max_tokens: number;
  temperature: number;
}

const DEFAULT_PROCESSOR_CONFIG: ProcessorConfig = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8192,
  temperature: 0,
};

// ============================================================================
// INCENTIVE PROGRAM PROCESSOR CLASS
// ============================================================================

export class IncentiveProgramProcessor {
  private config: ProcessorConfig;
  private anthropicApiKey: string;

  constructor(options?: Partial<ProcessorConfig>) {
    this.config = { ...DEFAULT_PROCESSOR_CONFIG, ...options };
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  /**
   * Main processing method - runs 3-step pipeline on document text
   */
  async processDocument(
    text: string,
    sourceUrl?: string
  ): Promise<IncentiveProgramProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    const programs: IncentiveProgramValidationResult[] = [];

    try {
      // ===== STEP 1: CLASSIFY =====
      let classification: IncentiveProgramClassification;

      try {
        classification = await this.classifyDocument(text);
      } catch (error) {
        return {
          status: 'failed',
          programs: [],
          processing_time_ms: Date.now() - startTime,
          tokens_used: 0,
          errors: [
            `Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
          warnings,
        };
      }

      // ===== STEP 2: EXTRACT =====
      let extractedPrograms: IncentiveProgramExtractedData[];

      try {
        extractedPrograms = await this.extractPrograms(text, classification);
      } catch (error) {
        return {
          status: 'failed',
          programs: [],
          processing_time_ms: Date.now() - startTime,
          tokens_used: 0,
          errors: [
            `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ],
          warnings,
        };
      }

      if (extractedPrograms.length === 0) {
        warnings.push('No programs found in document');
      }

      // ===== STEP 3: VALIDATE & SCORE =====
      let validated: IncentiveProgramValidationResult[] = [];

      try {
        validated = await this.validateAndScore(extractedPrograms, text);
      } catch (error) {
        warnings.push(
          `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        // Fall back to returning unvalidated programs
        validated = extractedPrograms.map((data) => ({
          data,
          confidence_score: 0.5,
          low_confidence_fields: Object.keys(data).filter((k) => data[k as keyof typeof data] === null),
          warnings: ['Validation step failed'],
        }));
      }

      const processingTime = Date.now() - startTime;

      // Determine overall status
      const hasLowConfidence = validated.some((v) => v.confidence_score < 0.8);
      const status = hasLowConfidence ? 'partial' : 'success';

      return {
        status,
        programs: validated,
        processing_time_ms: processingTime,
        tokens_used: 0, // Would need to track across all API calls
        errors,
        warnings,
      };
    } catch (error) {
      return {
        status: 'failed',
        programs: [],
        processing_time_ms: Date.now() - startTime,
        tokens_used: 0,
        errors: [
          `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings,
      };
    }
  }

  // ============================================================================
  // STEP 1: CLASSIFY
  // ============================================================================

  private async classifyDocument(
    text: string
  ): Promise<IncentiveProgramClassification> {
    const systemPrompt = `You are an expert in clean energy incentive programs and government funding.
Analyze this document to determine its document type and content characteristics.

Return a JSON object with:
- doc_type: One of: 'utility_rebate', 'tax_credit', 'grant', 'loan', 'direct_pay', 'performance', 'other'
- issuer: Name of the organization issuing the programs (e.g., "Con Edison", "NYSERDA", "U.S. Department of Energy")
- issuer_type: One of: 'utility', 'state', 'federal', 'local', 'nonprofit'
- region: Geographic coverage (state, county, or specific region)
- estimated_program_count: Approximate number of incentive programs described
- primary_technologies: Array of technologies covered (e.g., ['solar_pv', 'battery_storage', 'ev_charger', 'heat_pump', 'building_envelope'])

Return ONLY valid JSON.`;

    const userPrompt = `Classify this document:\n\n${text}`;

    const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
    const parsed = this.parseJSONResponse<IncentiveProgramClassification>(
      response.content
    );

    if (!parsed) {
      throw new Error('Failed to parse classification response');
    }

    return parsed;
  }

  // ============================================================================
  // STEP 2: EXTRACT
  // ============================================================================

  private async extractPrograms(
    text: string,
    classification: IncentiveProgramClassification
  ): Promise<IncentiveProgramExtractedData[]> {
    const systemPrompt = `You are an expert at extracting structured incentive program data from documents.
This is a ${classification.doc_type} document from ${classification.issuer} covering the ${classification.region} region.

For each incentive program in the document, extract:

Identity & Source:
- program_name: Program name
- issuer: Issuing organization
- issuer_type: Type of issuer
- jurisdiction_state: State (if applicable)
- jurisdiction_local: County/municipality (if applicable)
- program_level: 'federal', 'state', 'local', or 'utility'

Incentive Details:
- incentive_type: 'rebate', 'tax_credit', 'grant', 'loan', 'performance', or 'direct_pay'
- amount_description: Human-readable description of incentive amount
- funding_amount_raw: Raw amount string as written in document
- funding_amount_num: Numeric amount in dollars (if single amount)
- funding_currency: Currency code (usually 'USD')
- min_amount, max_amount: Min/max in dollars
- amount_formula: Formula for calculation (if formula-based)

Eligibility:
- eligible_sectors: Array of applicable sectors (residential, commercial, industrial, nonprofit)
- eligible_technologies: Array of eligible technologies
- eligibility_criteria: Object with detailed criteria requirements
- income_limits: Income restrictions if any
- required_documents: Array of documents needed for application

Timeline:
- deadline_raw: Raw deadline text from document
- application_deadline: Deadline in ISO format YYYY-MM-DD (if parseable)
- program_end_date: When program ends/expires
- funding_status: 'open', 'waitlist', 'closed', or 'unknown'

Application:
- application_url: URL to apply or get more info
- pdf_links: Links to relevant PDFs
- application_steps: Array of steps to apply

Stacking:
- stackable_with: Program names that can stack
- stacking_rules: Detailed stacking rules

Return an array of objects with these fields. Use null for missing values.
Return ONLY valid JSON array.`;

    const userPrompt = `Extract all incentive programs from this ${classification.doc_type} document:\n\n${text}`;

    const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
    const parsed = this.parseJSONResponse<IncentiveProgramExtractedData[]>(
      response.content
    );

    if (!Array.isArray(parsed)) {
      throw new Error('Extraction did not return an array');
    }

    return parsed || [];
  }

  // ============================================================================
  // STEP 3: VALIDATE & SCORE
  // ============================================================================

  private async validateAndScore(
    programs: IncentiveProgramExtractedData[],
    sourceText: string
  ): Promise<IncentiveProgramValidationResult[]> {
    if (programs.length === 0) {
      return [];
    }

    const systemPrompt = `You are a verification expert for incentive programs.
Review these extracted programs against the source document. For each:

1. Verify amounts, dates, and requirements against the original text
2. Assess confidence (0-1) for each program:
   - 0.9-1.0: All critical fields verified, high clarity
   - 0.7-0.89: Most fields verified, minor gaps
   - 0.5-0.69: Some fields unclear or missing
   - 0.0-0.49: Low confidence, requires human review
3. Flag fields with low confidence (when info is vague, conflicting, or unclear)
4. Return warnings if there are inconsistencies

Return JSON array with objects:
{
  "data": { ...same structure as input... },
  "confidence_score": 0.85,
  "low_confidence_fields": ["field1", "field2"],
  "warnings": ["warning text"]
}

Return ONLY valid JSON array.`;

    const userPrompt = `Validate these ${programs.length} extracted programs against the source document:

EXTRACTED PROGRAMS:
${JSON.stringify(programs, null, 2)}

SOURCE DOCUMENT:
${sourceText}`;

    const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
    const parsed = this.parseJSONResponse<IncentiveProgramValidationResult[]>(
      response.content
    );

    if (!Array.isArray(parsed)) {
      throw new Error('Validation did not return an array');
    }

    return parsed || [];
  }

  // ============================================================================
  // API HELPERS
  // ============================================================================

  private async callAnthropicAPI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ content: string; tokens_used: number }> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      tokens_used: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  }

  private parseJSONResponse<T>(content: string): T | null {
    try {
      let jsonStr = content;

      // Check for markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      // Try to find JSON object or array in the content
      const jsonMatch = jsonStr.match(/[\{\[][\s\S]*[\}\]]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      return JSON.parse(jsonStr) as T;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const incentiveProgramProcessor = new IncentiveProgramProcessor();
