/**
 * Document Processor Library for IncentEdge
 *
 * Provides AI-powered document extraction capabilities for various document types
 * including pro formas, site plans, certifications, and utility bills.
 */

import {
  DocumentType,
  ExtractedData,
  ExtractionResult,
  ExtractionStatus,
  ExtractionError,
  FieldMappingSuggestion,
  ProFormaExtractedData,
  SitePlanExtractedData,
  CertificationExtractedData,
  UtilityBillExtractedData,
  DocumentMetadata,
} from '@/types/documents';

// ============================================================================
// EXTRACTION CONFIGURATION
// ============================================================================

interface ExtractionConfig {
  model: string;
  max_tokens: number;
  temperature: number;
  use_ocr: boolean;
  extract_tables: boolean;
  extract_images: boolean;
}

const DEFAULT_EXTRACTION_CONFIG: ExtractionConfig = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8192,
  temperature: 0,
  use_ocr: true,
  extract_tables: true,
  extract_images: true,
};

// ============================================================================
// AI EXTRACTION INTERFACE
// ============================================================================

export interface AIExtractionResult<T> {
  success: boolean;
  data: T | null;
  confidence: number;
  raw_response: string;
  tokens_used: number;
  processing_time_ms: number;
  errors: ExtractionError[];
  warnings: string[];
}

// ============================================================================
// DOCUMENT PROCESSOR CLASS
// ============================================================================

export class DocumentProcessor {
  private config: ExtractionConfig;
  private anthropicApiKey: string;
  private openaiApiKey: string | null;

  constructor(options?: Partial<ExtractionConfig>) {
    this.config = { ...DEFAULT_EXTRACTION_CONFIG, ...options };
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Main extraction method - routes to specific extractors based on document type
   */
  async extractData(
    documentContent: string | Buffer,
    documentType: DocumentType,
    metadata?: Partial<DocumentMetadata>
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const errors: ExtractionError[] = [];
    const warnings: string[] = [];

    try {
      let extractedData: ExtractedData | null = null;
      let confidence = 0;

      switch (documentType) {
        case DocumentType.PRO_FORMA:
          const proFormaResult = await this.extractProFormaData(documentContent);
          if (proFormaResult.success && proFormaResult.data) {
            extractedData = { type: 'pro_forma', data: proFormaResult.data };
            confidence = proFormaResult.confidence;
            errors.push(...proFormaResult.errors);
            warnings.push(...proFormaResult.warnings);
          }
          break;

        case DocumentType.SITE_PLAN:
          const sitePlanResult = await this.extractSitePlanData(documentContent);
          if (sitePlanResult.success && sitePlanResult.data) {
            extractedData = { type: 'site_plan', data: sitePlanResult.data };
            confidence = sitePlanResult.confidence;
            errors.push(...sitePlanResult.errors);
            warnings.push(...sitePlanResult.warnings);
          }
          break;

        case DocumentType.CERTIFICATION:
          const certResult = await this.extractCertificationData(documentContent);
          if (certResult.success && certResult.data) {
            extractedData = { type: 'certification', data: certResult.data };
            confidence = certResult.confidence;
            errors.push(...certResult.errors);
            warnings.push(...certResult.warnings);
          }
          break;

        case DocumentType.UTILITY_BILL:
          const utilityResult = await this.extractUtilityBillData(documentContent);
          if (utilityResult.success && utilityResult.data) {
            extractedData = { type: 'utility_bill', data: utilityResult.data };
            confidence = utilityResult.confidence;
            errors.push(...utilityResult.errors);
            warnings.push(...utilityResult.warnings);
          }
          break;

        default:
          // Generic extraction for other document types
          extractedData = { type: 'other', data: {} };
          confidence = 0.5;
          warnings.push(`Generic extraction used for document type: ${documentType}`);
      }

      const processingTime = Date.now() - startTime;

      // Generate field mapping suggestions for auto-population
      const fieldMappingSuggestions = extractedData
        ? this.generateFieldMappingSuggestions(extractedData, documentType)
        : [];

      return {
        document_id: metadata?.id || '',
        status: errors.length > 0 ? ExtractionStatus.PARTIAL : ExtractionStatus.COMPLETED,
        extracted_data: extractedData,
        confidence,
        processing_time_ms: processingTime,
        errors,
        warnings,
        field_mapping_suggestions: fieldMappingSuggestions,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        document_id: metadata?.id || '',
        status: ExtractionStatus.FAILED,
        extracted_data: null,
        confidence: 0,
        processing_time_ms: processingTime,
        errors: [
          {
            code: 'EXTRACTION_ERROR',
            message: error instanceof Error ? error.message : 'Unknown extraction error',
            recoverable: false,
          },
        ],
        warnings,
        field_mapping_suggestions: [],
      };
    }
  }

  // ============================================================================
  // PRO FORMA EXTRACTION
  // ============================================================================

  async extractProFormaData(
    content: string | Buffer
  ): Promise<AIExtractionResult<ProFormaExtractedData>> {
    const startTime = Date.now();

    const systemPrompt = `You are an expert real estate financial analyst specializing in pro forma analysis.
Extract all relevant financial and project data from the provided pro forma document.
Return the data in a structured JSON format with the following fields when available:

- total_development_cost: Total project cost in dollars
- hard_costs: Construction/hard costs in dollars
- soft_costs: Soft costs (design, legal, financing) in dollars
- land_acquisition_cost: Land purchase cost
- construction_cost: Direct construction costs
- contingency: Contingency reserve amount
- developer_fee: Developer fee amount

- total_units: Total residential units
- unit_mix: Array of unit types with bedroom count, unit count, SF, and rents
- affordable_units: Number of affordable/income-restricted units
- affordable_breakdown: Units by AMI level (30%, 50%, 60%, 80%, 100%, 120%, market)

- total_gross_sf: Gross building square footage
- total_net_sf: Net rentable square footage
- residential_sf: Residential square footage
- commercial_sf: Commercial/retail square footage
- common_area_sf: Common area square footage
- parking_sf: Parking area square footage

- financing_sources: Array of financing sources with name, type, amount, rate, term
- total_debt: Total debt financing
- total_equity: Total equity investment
- ltc_ratio: Loan-to-cost ratio
- dscr: Debt service coverage ratio

- gross_potential_rent: Annual gross potential rent
- vacancy_rate: Vacancy/collection loss percentage
- effective_gross_income: EGI
- operating_expenses: Annual operating expenses
- noi: Net operating income

- irr: Internal rate of return
- cash_on_cash: Cash-on-cash return
- equity_multiple: Equity multiple
- development_yield: Yield on cost

- construction_start: Construction start date
- construction_end: Construction completion date
- stabilization_date: Stabilization date

Be precise with numbers. Extract dates in ISO format (YYYY-MM-DD).
If a value is not found, return null.
Return ONLY valid JSON.`;

    const userPrompt = `Extract all pro forma data from this document:\n\n${content}`;

    try {
      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
      const processingTime = Date.now() - startTime;

      const parsed = this.parseJSONResponse<ProFormaExtractedData>(response.content);

      if (!parsed) {
        return {
          success: false,
          data: null,
          confidence: 0,
          raw_response: response.content,
          tokens_used: response.tokens_used,
          processing_time_ms: processingTime,
          errors: [
            {
              code: 'PARSE_ERROR',
              message: 'Failed to parse pro forma extraction response',
              recoverable: true,
            },
          ],
          warnings: [],
        };
      }

      // Calculate confidence based on data completeness
      const confidence = this.calculateProFormaConfidence(parsed);

      return {
        success: true,
        data: parsed,
        confidence,
        raw_response: response.content,
        tokens_used: response.tokens_used,
        processing_time_ms: processingTime,
        errors: [],
        warnings: this.validateProFormaData(parsed),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        data: null,
        confidence: 0,
        raw_response: '',
        tokens_used: 0,
        processing_time_ms: processingTime,
        errors: [
          {
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'API call failed',
            recoverable: true,
          },
        ],
        warnings: [],
      };
    }
  }

  // ============================================================================
  // SITE PLAN EXTRACTION
  // ============================================================================

  async extractSitePlanData(
    content: string | Buffer
  ): Promise<AIExtractionResult<SitePlanExtractedData>> {
    const startTime = Date.now();

    const systemPrompt = `You are an expert land use planner and civil engineer specializing in site plan analysis.
Extract all relevant location, land, and zoning data from the provided site plan document.
Return the data in a structured JSON format with the following fields when available:

Address and Location:
- address: Full street address
- city: City name
- state: State abbreviation (2 letters)
- zip_code: ZIP code
- county: County name
- parcel_id: Tax parcel ID
- tax_lot: Tax lot number
- block: Block number

Land Characteristics:
- total_acreage: Total lot size in acres
- lot_area_sf: Lot area in square feet
- buildable_area_sf: Buildable area after setbacks
- impervious_coverage: Impervious surface percentage
- building_coverage: Building footprint percentage
- green_space_pct: Green/open space percentage

Zoning:
- zoning_district: Zoning district code (e.g., R-5, C-2)
- zoning_description: Full zoning description
- overlay_districts: Array of overlay zone names
- special_districts: Special district designations
- use_classification: Use classification (residential, commercial, mixed-use)
- variance_required: Whether variance is needed (boolean)

Setbacks (in feet):
- front_setback, rear_setback, side_setback_left, side_setback_right

Building Envelope:
- max_building_height: Maximum height in feet
- max_stories: Maximum number of stories
- max_far: Maximum FAR allowed
- proposed_far: Proposed FAR

Parking:
- parking_spaces_required: Required parking spaces
- parking_spaces_provided: Proposed parking spaces
- parking_type: Type (surface, structured, underground, mixed)

Utilities:
- water_service, sewer_service, gas_service, electric_service: boolean availability
- utility_notes: Any notes about utility connections

Environmental:
- wetlands_present: boolean
- flood_zone: FEMA flood zone designation
- environmental_constraints: Array of environmental issues

Be precise with measurements. Return ONLY valid JSON. Use null for unavailable values.`;

    const userPrompt = `Extract all site plan data from this document:\n\n${content}`;

    try {
      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
      const processingTime = Date.now() - startTime;

      const parsed = this.parseJSONResponse<SitePlanExtractedData>(response.content);

      if (!parsed) {
        return {
          success: false,
          data: null,
          confidence: 0,
          raw_response: response.content,
          tokens_used: response.tokens_used,
          processing_time_ms: processingTime,
          errors: [
            {
              code: 'PARSE_ERROR',
              message: 'Failed to parse site plan extraction response',
              recoverable: true,
            },
          ],
          warnings: [],
        };
      }

      const confidence = this.calculateSitePlanConfidence(parsed);

      return {
        success: true,
        data: parsed,
        confidence,
        raw_response: response.content,
        tokens_used: response.tokens_used,
        processing_time_ms: processingTime,
        errors: [],
        warnings: this.validateSitePlanData(parsed),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        data: null,
        confidence: 0,
        raw_response: '',
        tokens_used: 0,
        processing_time_ms: processingTime,
        errors: [
          {
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'API call failed',
            recoverable: true,
          },
        ],
        warnings: [],
      };
    }
  }

  // ============================================================================
  // CERTIFICATION EXTRACTION
  // ============================================================================

  async extractCertificationData(
    content: string | Buffer
  ): Promise<AIExtractionResult<CertificationExtractedData>> {
    const startTime = Date.now();

    const systemPrompt = `You are an expert in green building certifications and sustainability standards.
Extract all relevant certification data from the provided document.
Return the data in a structured JSON format with the following fields when available:

Certification Details:
- certification_type: One of: leed, energy_star, passive_house, ngbs, well, fitwel, living_building, enterprise_green, other
- certification_level: Level achieved (e.g., "Gold", "Platinum", "Classic", "Plus")
- certification_version: Version of standard (e.g., "LEED v4.1", "PHIUS 2021")
- certificate_number: Official certificate number
- certifying_body: Certifying organization name

Dates:
- issue_date: Date issued (YYYY-MM-DD)
- expiration_date: Expiration date if applicable (YYYY-MM-DD)

Scores and Metrics:
- total_points: Total points achieved
- points_available: Maximum possible points
- points_percentage: Percentage of points achieved

Energy Performance:
- energy_star_score: Energy Star score (1-100)
- site_eui: Site Energy Use Intensity (kBtu/sf/year)
- source_eui: Source EUI (kBtu/sf/year)
- energy_reduction_pct: Energy reduction vs baseline

LEED Category Scores (if LEED):
- leed_category_scores: Object with scores for each category:
  - integrative_process
  - location_transportation
  - sustainable_sites
  - water_efficiency
  - energy_atmosphere
  - materials_resources
  - indoor_environmental_quality
  - innovation
  - regional_priority

Passive House Metrics (if Passive House):
- passive_house_metrics: Object with:
  - heating_demand (kWh/m2/year)
  - cooling_demand (kWh/m2/year)
  - primary_energy (kWh/m2/year)
  - airtightness (ACH50)
  - source_energy (kWh/m2/year)
  - psi_value

NGBS Scores (if NGBS):
- ngbs_scores: Object with category scores:
  - lot_design_development
  - resource_efficiency
  - energy_efficiency
  - water_efficiency
  - indoor_environmental_quality
  - building_operation_maintenance

- additional_certifications: Array of any additional certifications mentioned

Return ONLY valid JSON. Use null for unavailable values.`;

    const userPrompt = `Extract all certification data from this document:\n\n${content}`;

    try {
      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
      const processingTime = Date.now() - startTime;

      const parsed = this.parseJSONResponse<CertificationExtractedData>(response.content);

      if (!parsed) {
        return {
          success: false,
          data: null,
          confidence: 0,
          raw_response: response.content,
          tokens_used: response.tokens_used,
          processing_time_ms: processingTime,
          errors: [
            {
              code: 'PARSE_ERROR',
              message: 'Failed to parse certification extraction response',
              recoverable: true,
            },
          ],
          warnings: [],
        };
      }

      const confidence = this.calculateCertificationConfidence(parsed);

      return {
        success: true,
        data: parsed,
        confidence,
        raw_response: response.content,
        tokens_used: response.tokens_used,
        processing_time_ms: processingTime,
        errors: [],
        warnings: this.validateCertificationData(parsed),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        data: null,
        confidence: 0,
        raw_response: '',
        tokens_used: 0,
        processing_time_ms: processingTime,
        errors: [
          {
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'API call failed',
            recoverable: true,
          },
        ],
        warnings: [],
      };
    }
  }

  // ============================================================================
  // UTILITY BILL EXTRACTION
  // ============================================================================

  async extractUtilityBillData(
    content: string | Buffer
  ): Promise<AIExtractionResult<UtilityBillExtractedData>> {
    const startTime = Date.now();

    const systemPrompt = `You are an expert utility analyst specializing in energy consumption and billing analysis.
Extract all relevant utility billing data from the provided document.
Return the data in a structured JSON format with the following fields when available:

Bill Details:
- utility_type: One of: electric, gas, water, sewer, combined
- utility_provider: Name of utility company
- account_number: Account number
- meter_number: Meter number

Service Address:
- service_address: Full service address

Billing Period:
- billing_period_start: Start date (YYYY-MM-DD)
- billing_period_end: End date (YYYY-MM-DD)
- days_in_period: Number of days in billing period

Consumption (use appropriate field based on utility type):
- consumption_kwh: Electric consumption in kWh
- consumption_therms: Gas consumption in therms
- consumption_gallons: Water consumption in gallons
- consumption_ccf: Gas/water in CCF (hundred cubic feet)
- peak_demand_kw: Peak demand in kW (for commercial electric)

Costs (in dollars):
- total_amount: Total bill amount
- energy_charges: Energy/commodity charges
- demand_charges: Demand charges (if applicable)
- delivery_charges: Delivery/distribution charges
- taxes_fees: Taxes and fees

Rates:
- average_rate: Calculated average rate ($/unit)
- rate_schedule: Rate schedule name/code

Historical Comparison (if shown on bill):
- prior_year_consumption: Same period last year consumption
- prior_year_cost: Same period last year cost
- consumption_change_pct: Year-over-year change percentage

Normalized Metrics (calculate if building SF is known):
- consumption_per_sf: Consumption per square foot
- cost_per_sf: Cost per square foot

Return ONLY valid JSON. Use null for unavailable values.`;

    const userPrompt = `Extract all utility bill data from this document:\n\n${content}`;

    try {
      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);
      const processingTime = Date.now() - startTime;

      const parsed = this.parseJSONResponse<UtilityBillExtractedData>(response.content);

      if (!parsed) {
        return {
          success: false,
          data: null,
          confidence: 0,
          raw_response: response.content,
          tokens_used: response.tokens_used,
          processing_time_ms: processingTime,
          errors: [
            {
              code: 'PARSE_ERROR',
              message: 'Failed to parse utility bill extraction response',
              recoverable: true,
            },
          ],
          warnings: [],
        };
      }

      const confidence = this.calculateUtilityBillConfidence(parsed);

      return {
        success: true,
        data: parsed,
        confidence,
        raw_response: response.content,
        tokens_used: response.tokens_used,
        processing_time_ms: processingTime,
        errors: [],
        warnings: this.validateUtilityBillData(parsed),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        data: null,
        confidence: 0,
        raw_response: '',
        tokens_used: 0,
        processing_time_ms: processingTime,
        errors: [
          {
            code: 'API_ERROR',
            message: error instanceof Error ? error.message : 'API call failed',
            recoverable: true,
          },
        ],
        warnings: [],
      };
    }
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
      // Try to extract JSON from the response
      // Handle cases where the response might have markdown code blocks
      let jsonStr = content;

      // Check for markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      }

      // Try to find JSON object in the content
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      return JSON.parse(jsonStr) as T;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // CONFIDENCE CALCULATIONS
  // ============================================================================

  private calculateProFormaConfidence(data: ProFormaExtractedData): number {
    const criticalFields = [
      'total_development_cost',
      'hard_costs',
      'total_units',
      'total_gross_sf',
      'financing_sources',
    ];

    const importantFields = [
      'soft_costs',
      'unit_mix',
      'noi',
      'irr',
      'ltc_ratio',
    ];

    let score = 0;
    let maxScore = 0;

    for (const field of criticalFields) {
      maxScore += 2;
      if (data[field as keyof ProFormaExtractedData] !== null) {
        score += 2;
      }
    }

    for (const field of importantFields) {
      maxScore += 1;
      if (data[field as keyof ProFormaExtractedData] !== null) {
        score += 1;
      }
    }

    return Math.round((score / maxScore) * 100) / 100;
  }

  private calculateSitePlanConfidence(data: SitePlanExtractedData): number {
    const criticalFields = [
      'address',
      'city',
      'state',
      'total_acreage',
      'zoning_district',
    ];

    const importantFields = [
      'lot_area_sf',
      'max_building_height',
      'max_far',
      'parking_spaces_required',
    ];

    let score = 0;
    let maxScore = 0;

    for (const field of criticalFields) {
      maxScore += 2;
      if (data[field as keyof SitePlanExtractedData] !== null) {
        score += 2;
      }
    }

    for (const field of importantFields) {
      maxScore += 1;
      if (data[field as keyof SitePlanExtractedData] !== null) {
        score += 1;
      }
    }

    return Math.round((score / maxScore) * 100) / 100;
  }

  private calculateCertificationConfidence(data: CertificationExtractedData): number {
    const criticalFields = [
      'certification_type',
      'certification_level',
      'issue_date',
    ];

    const importantFields = [
      'certificate_number',
      'total_points',
      'energy_star_score',
      'site_eui',
    ];

    let score = 0;
    let maxScore = 0;

    for (const field of criticalFields) {
      maxScore += 2;
      if (data[field as keyof CertificationExtractedData] !== null) {
        score += 2;
      }
    }

    for (const field of importantFields) {
      maxScore += 1;
      if (data[field as keyof CertificationExtractedData] !== null) {
        score += 1;
      }
    }

    return Math.round((score / maxScore) * 100) / 100;
  }

  private calculateUtilityBillConfidence(data: UtilityBillExtractedData): number {
    const criticalFields = [
      'utility_type',
      'billing_period_start',
      'billing_period_end',
      'total_amount',
    ];

    const importantFields = [
      'consumption_kwh',
      'consumption_therms',
      'average_rate',
      'utility_provider',
    ];

    let score = 0;
    let maxScore = 0;

    for (const field of criticalFields) {
      maxScore += 2;
      if (data[field as keyof UtilityBillExtractedData] !== null) {
        score += 2;
      }
    }

    for (const field of importantFields) {
      maxScore += 1;
      if (data[field as keyof UtilityBillExtractedData] !== null) {
        score += 1;
      }
    }

    return Math.round((score / maxScore) * 100) / 100;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private validateProFormaData(data: ProFormaExtractedData): string[] {
    const warnings: string[] = [];

    if (data.total_development_cost && data.hard_costs && data.soft_costs) {
      const sum = data.hard_costs + data.soft_costs;
      const diff = Math.abs(sum - data.total_development_cost);
      if (diff > data.total_development_cost * 0.1) {
        warnings.push('Hard + soft costs do not match TDC within 10%');
      }
    }

    if (data.ltc_ratio && (data.ltc_ratio < 0.3 || data.ltc_ratio > 0.95)) {
      warnings.push(`Unusual LTC ratio: ${data.ltc_ratio}`);
    }

    if (data.vacancy_rate && data.vacancy_rate > 0.15) {
      warnings.push(`High vacancy rate assumption: ${data.vacancy_rate * 100}%`);
    }

    return warnings;
  }

  private validateSitePlanData(data: SitePlanExtractedData): string[] {
    const warnings: string[] = [];

    if (data.lot_area_sf && data.total_acreage) {
      const expectedSf = data.total_acreage * 43560;
      const diff = Math.abs(expectedSf - data.lot_area_sf);
      if (diff > expectedSf * 0.05) {
        warnings.push('Lot area SF does not match acreage calculation');
      }
    }

    if (data.max_far && data.proposed_far && data.proposed_far > data.max_far) {
      warnings.push('Proposed FAR exceeds maximum FAR - variance may be required');
    }

    return warnings;
  }

  private validateCertificationData(data: CertificationExtractedData): string[] {
    const warnings: string[] = [];

    if (data.expiration_date) {
      const expirationDate = new Date(data.expiration_date);
      const today = new Date();
      if (expirationDate < today) {
        warnings.push('Certification has expired');
      } else if (expirationDate < new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
        warnings.push('Certification expires within 90 days');
      }
    }

    if (data.total_points && data.points_available) {
      const pct = (data.total_points / data.points_available) * 100;
      if (data.points_percentage && Math.abs(pct - data.points_percentage) > 2) {
        warnings.push('Calculated percentage does not match stated percentage');
      }
    }

    return warnings;
  }

  private validateUtilityBillData(data: UtilityBillExtractedData): string[] {
    const warnings: string[] = [];

    if (data.consumption_kwh && data.total_amount && data.average_rate) {
      const calculatedCost = data.consumption_kwh * data.average_rate;
      const diff = Math.abs(calculatedCost - data.total_amount);
      if (diff > data.total_amount * 0.2) {
        warnings.push('Calculated cost from consumption does not match total');
      }
    }

    if (data.consumption_change_pct && Math.abs(data.consumption_change_pct) > 50) {
      warnings.push(`Large year-over-year consumption change: ${data.consumption_change_pct}%`);
    }

    return warnings;
  }

  // ============================================================================
  // FIELD MAPPING SUGGESTIONS
  // ============================================================================

  private generateFieldMappingSuggestions(
    extractedData: ExtractedData,
    documentType: DocumentType
  ): FieldMappingSuggestion[] {
    const suggestions: FieldMappingSuggestion[] = [];

    if (extractedData.type === 'pro_forma') {
      const data = extractedData.data;

      if (data.total_development_cost) {
        suggestions.push({
          source_field: 'total_development_cost',
          target_entity: 'project',
          target_field: 'total_development_cost',
          extracted_value: data.total_development_cost,
          confidence: 0.9,
          requires_confirmation: true,
        });
      }

      if (data.hard_costs) {
        suggestions.push({
          source_field: 'hard_costs',
          target_entity: 'project',
          target_field: 'hard_costs',
          extracted_value: data.hard_costs,
          confidence: 0.9,
          requires_confirmation: true,
        });
      }

      if (data.soft_costs) {
        suggestions.push({
          source_field: 'soft_costs',
          target_entity: 'project',
          target_field: 'soft_costs',
          extracted_value: data.soft_costs,
          confidence: 0.9,
          requires_confirmation: true,
        });
      }

      if (data.total_units) {
        suggestions.push({
          source_field: 'total_units',
          target_entity: 'project',
          target_field: 'total_units',
          extracted_value: data.total_units,
          confidence: 0.95,
          requires_confirmation: false,
        });
      }

      if (data.affordable_units) {
        suggestions.push({
          source_field: 'affordable_units',
          target_entity: 'project',
          target_field: 'affordable_units',
          extracted_value: data.affordable_units,
          confidence: 0.9,
          requires_confirmation: true,
        });
      }

      if (data.total_gross_sf) {
        suggestions.push({
          source_field: 'total_gross_sf',
          target_entity: 'project',
          target_field: 'total_sqft',
          extracted_value: data.total_gross_sf,
          confidence: 0.85,
          requires_confirmation: true,
        });
      }
    }

    if (extractedData.type === 'site_plan') {
      const data = extractedData.data;

      if (data.address) {
        suggestions.push({
          source_field: 'address',
          target_entity: 'project',
          target_field: 'address_line1',
          extracted_value: data.address,
          confidence: 0.95,
          requires_confirmation: false,
        });
      }

      if (data.city) {
        suggestions.push({
          source_field: 'city',
          target_entity: 'project',
          target_field: 'city',
          extracted_value: data.city,
          confidence: 0.95,
          requires_confirmation: false,
        });
      }

      if (data.state) {
        suggestions.push({
          source_field: 'state',
          target_entity: 'project',
          target_field: 'state',
          extracted_value: data.state,
          confidence: 0.95,
          requires_confirmation: false,
        });
      }

      if (data.zip_code) {
        suggestions.push({
          source_field: 'zip_code',
          target_entity: 'project',
          target_field: 'zip_code',
          extracted_value: data.zip_code,
          confidence: 0.95,
          requires_confirmation: false,
        });
      }

      if (data.county) {
        suggestions.push({
          source_field: 'county',
          target_entity: 'project',
          target_field: 'county',
          extracted_value: data.county,
          confidence: 0.9,
          requires_confirmation: false,
        });
      }
    }

    if (extractedData.type === 'certification') {
      const data = extractedData.data;

      if (data.certification_type && data.certification_level) {
        const certString = `${data.certification_type.toUpperCase()} ${data.certification_level}`;
        suggestions.push({
          source_field: 'certification_type + certification_level',
          target_entity: 'project',
          target_field: 'target_certification',
          extracted_value: certString,
          confidence: 0.85,
          requires_confirmation: true,
        });
      }

      if (data.energy_reduction_pct) {
        suggestions.push({
          source_field: 'energy_reduction_pct',
          target_entity: 'project',
          target_field: 'projected_energy_reduction_pct',
          extracted_value: data.energy_reduction_pct,
          confidence: 0.8,
          requires_confirmation: true,
        });
      }
    }

    return suggestions;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get document type from file extension/MIME type
 */
export function inferDocumentType(fileName: string, mimeType?: string): DocumentType {
  const lowerName = fileName.toLowerCase();

  // Check for common patterns in file names
  if (lowerName.includes('pro forma') || lowerName.includes('proforma') || lowerName.includes('pro-forma')) {
    return DocumentType.PRO_FORMA;
  }
  if (lowerName.includes('site plan') || lowerName.includes('siteplan')) {
    return DocumentType.SITE_PLAN;
  }
  if (lowerName.includes('leed') || lowerName.includes('passive house') ||
      lowerName.includes('energy star') || lowerName.includes('certification') ||
      lowerName.includes('ngbs')) {
    return DocumentType.CERTIFICATION;
  }
  if (lowerName.includes('utility') || lowerName.includes('electric bill') ||
      lowerName.includes('gas bill') || lowerName.includes('water bill')) {
    return DocumentType.UTILITY_BILL;
  }
  if (lowerName.includes('environmental') || lowerName.includes('phase i') ||
      lowerName.includes('phase ii') || lowerName.includes('esa')) {
    return DocumentType.ENVIRONMENTAL_REPORT;
  }
  if (lowerName.includes('appraisal')) {
    return DocumentType.APPRAISAL;
  }
  if (lowerName.includes('survey')) {
    return DocumentType.SURVEY;
  }
  if (lowerName.includes('title')) {
    return DocumentType.TITLE_REPORT;
  }
  if (lowerName.includes('architectural') || lowerName.includes('floor plan')) {
    return DocumentType.ARCHITECTURAL_PLANS;
  }
  if (lowerName.includes('engineering')) {
    return DocumentType.ENGINEERING_REPORT;
  }
  if (lowerName.includes('energy model')) {
    return DocumentType.ENERGY_MODEL;
  }
  if (lowerName.includes('tax return')) {
    return DocumentType.TAX_RETURNS;
  }
  if (lowerName.includes('financial statement')) {
    return DocumentType.FINANCIAL_STATEMENTS;
  }
  if (lowerName.includes('operating agreement')) {
    return DocumentType.OPERATING_AGREEMENT;
  }
  if (lowerName.includes('permit')) {
    return DocumentType.PERMIT;
  }
  if (lowerName.includes('contract') || lowerName.includes('agreement')) {
    return DocumentType.CONTRACT;
  }
  if (lowerName.includes('compliance')) {
    return DocumentType.COMPLIANCE_REPORT;
  }

  return DocumentType.OTHER;
}

/**
 * Get supported file extensions for upload
 */
export function getSupportedFileExtensions(): string[] {
  return [
    // Documents
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.csv',
    // Images
    '.png',
    '.jpg',
    '.jpeg',
    '.tiff',
    '.tif',
    // CAD/Plans
    '.dwg',
    '.dxf',
  ];
}

/**
 * Get max file size in bytes (50MB default)
 */
export function getMaxFileSize(): number {
  return 50 * 1024 * 1024;
}

/**
 * Validate file for upload
 */
export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType?: string
): { valid: boolean; error?: string } {
  const extension = '.' + fileName.split('.').pop()?.toLowerCase();
  const supportedExtensions = getSupportedFileExtensions();

  if (!supportedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type: ${extension}. Supported types: ${supportedExtensions.join(', ')}`,
    };
  }

  const maxSize = getMaxFileSize();
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB. Maximum size: ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor();
