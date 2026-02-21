/**
 * AI Recommendation Engine for IncentEdge
 *
 * Enhances the V41 algorithm-based incentive matching with Claude-powered
 * explanations, gap analysis, and optimization suggestions.
 *
 * Following Boris Cherney's pattern: AI adds reasoning layer on top of
 * algorithmic scoring, not replacing it.
 */

import type { Project, IncentiveProgram } from '@/types';
import type { MatchedIncentive, MatchingResult } from './incentive-matcher';
import { analyzeStackingOpportunities, type StackingResult } from './stacking-analyzer';

// ============================================================================
// TYPES
// ============================================================================

export interface AIRecommendation {
  /** Overall narrative summary suitable for investor reports */
  narrativeSummary: string;

  /** Detailed explanations for top matches */
  matchExplanations: MatchExplanation[];

  /** Gaps in project profile that limit eligibility */
  gaps: GapAnalysis[];

  /** Optimization suggestions to unlock more incentives */
  optimizations: OptimizationSuggestion[];

  /** Stacking recommendations for combining incentives */
  stackingStrategy: StackingStrategy | null;

  /** Processing metadata */
  meta: {
    generatedAt: string;
    modelUsed: string;
    tokensUsed: number;
    processingTimeMs: number;
  };
}

export interface MatchExplanation {
  programId: string;
  programName: string;
  /** Why this program is a good fit for THIS specific project */
  whyGoodFit: string;
  /** Key requirements and how the project meets them */
  requirementAnalysis: string;
  /** Potential concerns or risks */
  concerns: string[];
  /** Recommended priority (1-5, 1 = highest) */
  priority: number;
}

export interface GapAnalysis {
  /** What's missing or weak in the project profile */
  gap: string;
  /** Which incentives this gap affects */
  affectedPrograms: string[];
  /** How to address the gap */
  remediation: string;
  /** Estimated value unlocked if gap is addressed */
  potentialValueUnlocked: number;
  /** Difficulty to address (low/medium/high) */
  difficulty: 'low' | 'medium' | 'high';
}

export interface OptimizationSuggestion {
  /** What change to make */
  suggestion: string;
  /** Detailed explanation */
  rationale: string;
  /** Programs this would affect */
  affectedPrograms: string[];
  /** Estimated additional value */
  estimatedAdditionalValue: number;
  /** Implementation complexity */
  complexity: 'low' | 'medium' | 'high';
  /** Whether this requires project changes or just documentation */
  type: 'project_change' | 'documentation' | 'timing' | 'entity_structure';
}

export interface StackingStrategy {
  /** Recommended combination of incentives */
  recommendedStack: string[];
  /** Total estimated value from stacking */
  totalStackValue: number;
  /** Explanation of why these stack well */
  rationale: string;
  /** Any restrictions or considerations */
  restrictions: string[];
  /** Detailed stacking analysis from the stacking analyzer */
  detailedAnalysis?: StackingResult;
}

export interface AIRecommendationConfig {
  /** Maximum number of matches to explain in detail */
  maxMatchExplanations?: number;
  /** Whether to include stacking analysis */
  includeStacking?: boolean;
  /** Whether to generate investor-grade narrative */
  investorNarrative?: boolean;
  /** Custom focus areas */
  focusAreas?: ('affordability' | 'sustainability' | 'tax_credits' | 'grants')[];
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: Required<AIRecommendationConfig> = {
  maxMatchExplanations: 5,
  includeStacking: true,
  investorNarrative: true,
  focusAreas: [],
};

// ============================================================================
// AI RECOMMENDATION ENGINE CLASS
// ============================================================================

export class AIRecommendationEngine {
  private anthropicApiKey: string;
  private model: string;

  constructor() {
    this.anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    this.model = 'claude-3-5-sonnet-20241022';
  }

  /**
   * Generate AI-powered recommendations for matched incentives
   */
  async generateRecommendations(
    project: Project,
    matchingResult: MatchingResult,
    config: AIRecommendationConfig = {}
  ): Promise<AIRecommendation> {
    const startTime = Date.now();
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    // If no API key, return fallback
    if (!this.anthropicApiKey) {
      console.warn('ANTHROPIC_API_KEY not set, using fallback recommendations');
      return this.generateFallbackRecommendations(project, matchingResult, startTime);
    }

    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(project, matchingResult, mergedConfig);

      const response = await this.callAnthropicAPI(systemPrompt, userPrompt);

      const parsed = this.parseResponse(response.content, project, matchingResult);

      return {
        ...parsed,
        meta: {
          generatedAt: new Date().toISOString(),
          modelUsed: this.model,
          tokensUsed: response.tokensUsed,
          processingTimeMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('AI recommendation generation failed:', error);
      return this.generateFallbackRecommendations(project, matchingResult, startTime);
    }
  }

  /**
   * Build system prompt for Claude
   */
  private buildSystemPrompt(): string {
    return `You are an expert incentive analyst for IncentEdge, an AI-powered platform helping real estate developers discover and capture tax credits, grants, rebates, and other incentives.

Your role is to analyze project-incentive matches and provide:
1. Clear explanations of WHY each incentive is a good fit
2. Gap analysis identifying what's missing from the project profile
3. Optimization suggestions to unlock additional value
4. Stacking strategies for combining multiple incentives

Guidelines:
- Be specific and actionable, not generic
- Reference actual project attributes and program requirements
- Quantify value opportunities when possible
- Prioritize high-impact, low-effort optimizations
- Consider timing, entity structure, and documentation requirements
- Write for sophisticated real estate professionals

Output Format:
Return a valid JSON object with this structure:
{
  "narrativeSummary": "2-3 paragraph executive summary suitable for investor reports",
  "matchExplanations": [
    {
      "programId": "id",
      "programName": "name",
      "whyGoodFit": "specific explanation",
      "requirementAnalysis": "how project meets requirements",
      "concerns": ["concern1", "concern2"],
      "priority": 1
    }
  ],
  "gaps": [
    {
      "gap": "what's missing",
      "affectedPrograms": ["program1", "program2"],
      "remediation": "how to fix",
      "potentialValueUnlocked": 100000,
      "difficulty": "low"
    }
  ],
  "optimizations": [
    {
      "suggestion": "what to do",
      "rationale": "why it helps",
      "affectedPrograms": ["program1"],
      "estimatedAdditionalValue": 50000,
      "complexity": "medium",
      "type": "project_change"
    }
  ],
  "stackingStrategy": {
    "recommendedStack": ["program1", "program2"],
    "totalStackValue": 500000,
    "rationale": "why these work together",
    "restrictions": ["restriction1"]
  }
}`;
  }

  /**
   * Build user prompt with project and match details
   */
  private buildUserPrompt(
    project: Project,
    matchingResult: MatchingResult,
    config: Required<AIRecommendationConfig>
  ): string {
    const topMatches = matchingResult.topMatches.slice(0, config.maxMatchExplanations);

    const projectSummary = this.formatProjectSummary(project);
    const matchesSummary = this.formatMatchesSummary(topMatches, matchingResult);

    return `## Project Analysis Request

### Project Details
${projectSummary}

### Matched Incentives (Top ${topMatches.length} of ${matchingResult.matches.length} total)
${matchesSummary}

### Matching Summary
- Total Potential Value: $${matchingResult.totalPotentialValue.toLocaleString()}
- High Confidence Matches: ${matchingResult.summary.highTier}
- Medium Confidence: ${matchingResult.summary.mediumTier}
- Federal Programs: ${matchingResult.summary.federalCount}
- State Programs: ${matchingResult.summary.stateCount}
- Local Programs: ${matchingResult.summary.localCount}
- Utility Programs: ${matchingResult.summary.utilityCount}

### Green/IRA Incentives
${matchingResult.greenIncentives.length > 0 ? matchingResult.greenIncentives.slice(0, 3).map(m => `- ${m.incentive.name}: $${m.estimatedValue.toLocaleString()}`).join('\n') : 'None matched'}

### Focus Areas
${config.focusAreas.length > 0 ? config.focusAreas.join(', ') : 'General analysis'}

Please analyze this project and provide detailed recommendations in the JSON format specified.`;
  }

  /**
   * Format project details for the prompt
   */
  private formatProjectSummary(project: Project): string {
    const affordablePct = project.total_units && project.affordable_units
      ? ((project.affordable_units / project.total_units) * 100).toFixed(1)
      : 'N/A';

    return `
- Name: ${project.name}
- Location: ${project.city || 'N/A'}, ${project.state || 'N/A'} ${project.zip_code || ''}
- County: ${project.county || 'N/A'}
- Building Type: ${project.building_type || 'N/A'}
- Construction Type: ${project.construction_type || 'N/A'}
- Total Units: ${project.total_units || 'N/A'}
- Affordable Units: ${project.affordable_units || 0} (${affordablePct}%)
- Total Sqft: ${project.total_sqft?.toLocaleString() || 'N/A'}
- Total Development Cost: $${project.total_development_cost?.toLocaleString() || 'N/A'}
- Target Certification: ${project.target_certification || 'None specified'}
- Renewable Energy: ${project.renewable_energy_types?.join(', ') || 'None'}
- Domestic Content Eligible: ${project.domestic_content_eligible ? 'Yes' : 'No'}
- Prevailing Wage Commitment: ${project.prevailing_wage_commitment ? 'Yes' : 'No'}
- Sector: ${project.sector_type || 'real-estate'}`;
  }

  /**
   * Format matched incentives for the prompt
   */
  private formatMatchesSummary(
    topMatches: MatchedIncentive[],
    matchingResult: MatchingResult
  ): string {
    return topMatches.map((match, idx) => {
      const incentive = match.incentive;
      return `
${idx + 1}. ${incentive.name}
   - ID: ${incentive.id}
   - Type: ${incentive.incentive_type} (${incentive.jurisdiction_level})
   - Match Score: ${(match.matchScore * 100).toFixed(0)}% (Tier: ${match.tier})
   - Estimated Value: $${match.estimatedValue.toLocaleString()}
   - Category Score: ${(match.categoryScore * 100).toFixed(0)}%
   - Location Score: ${(match.locationScore * 100).toFixed(0)}%
   - Eligibility Score: ${(match.eligibilityScore * 100).toFixed(0)}%
   - Match Reasons: ${match.matchReasons.slice(0, 3).join('; ')}
   - Eligibility Details: ${match.eligibilityDetails.map(d => `${d.criterion}: ${d.met ? 'Met' : 'Not Met'}`).join('; ')}`;
    }).join('\n');
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropicAPI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ content: string; tokensUsed: number }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.3,
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
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const content = data.content?.[0]?.text || '';
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    return { content, tokensUsed };
  }

  /**
   * Parse Claude's response into structured format
   */
  private parseResponse(
    content: string,
    project: Project,
    matchingResult: MatchingResult
  ): Omit<AIRecommendation, 'meta'> {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);

      return {
        narrativeSummary: parsed.narrativeSummary || this.generateDefaultNarrative(project, matchingResult),
        matchExplanations: parsed.matchExplanations || [],
        gaps: parsed.gaps || [],
        optimizations: parsed.optimizations || [],
        stackingStrategy: parsed.stackingStrategy || null,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return structured fallback
      return {
        narrativeSummary: this.generateDefaultNarrative(project, matchingResult),
        matchExplanations: this.generateDefaultExplanations(matchingResult),
        gaps: this.identifyBasicGaps(project, matchingResult),
        optimizations: this.generateBasicOptimizations(project, matchingResult),
        stackingStrategy: null,
      };
    }
  }

  /**
   * Generate fallback recommendations when AI is unavailable
   */
  private generateFallbackRecommendations(
    project: Project,
    matchingResult: MatchingResult,
    startTime: number
  ): AIRecommendation {
    return {
      narrativeSummary: this.generateDefaultNarrative(project, matchingResult),
      matchExplanations: this.generateDefaultExplanations(matchingResult),
      gaps: this.identifyBasicGaps(project, matchingResult),
      optimizations: this.generateBasicOptimizations(project, matchingResult),
      stackingStrategy: this.generateBasicStackingStrategy(matchingResult, project),
      meta: {
        generatedAt: new Date().toISOString(),
        modelUsed: 'fallback-algorithm',
        tokensUsed: 0,
        processingTimeMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Generate default narrative summary
   */
  private generateDefaultNarrative(project: Project, matchingResult: MatchingResult): string {
    const totalValue = matchingResult.totalPotentialValue;
    const highTier = matchingResult.summary.highTier;
    const location = `${project.city || ''}, ${project.state || ''}`.trim().replace(/^,\s*/, '') || 'the project location';

    let narrative = `This analysis identified ${matchingResult.matches.length} potential incentive programs for ${project.name || 'this project'} in ${location}, with an estimated total value of $${totalValue.toLocaleString()}. `;

    if (highTier > 0) {
      narrative += `${highTier} programs show high confidence matches based on location, project type, and eligibility criteria. `;
    }

    if (matchingResult.greenIncentives.length > 0) {
      const greenValue = matchingResult.greenIncentives.reduce((sum, m) => sum + m.estimatedValue, 0);
      narrative += `Clean energy and sustainability incentives represent $${greenValue.toLocaleString()} of the total opportunity. `;
    }

    if (matchingResult.iraIncentives.length > 0) {
      narrative += `The project may qualify for IRA bonus credits including domestic content, energy community, and prevailing wage adders. `;
    }

    narrative += `\n\nRecommended next steps include reviewing high-confidence matches, addressing any eligibility gaps, and developing a coordinated application strategy to maximize capture rate.`;

    return narrative;
  }

  /**
   * Generate default match explanations
   */
  private generateDefaultExplanations(matchingResult: MatchingResult): MatchExplanation[] {
    return matchingResult.topMatches.slice(0, 5).map((match, idx) => ({
      programId: match.incentive.id,
      programName: match.incentive.name,
      whyGoodFit: match.matchReasons.slice(0, 2).join('. ') || 'Matches project location and type.',
      requirementAnalysis: match.eligibilityDetails
        .filter(d => d.met)
        .map(d => d.criterion)
        .join(', ') || 'Basic eligibility criteria appear to be met.',
      concerns: match.eligibilityDetails
        .filter(d => !d.met)
        .map(d => `${d.criterion}: ${d.description}`),
      priority: idx + 1,
    }));
  }

  /**
   * Identify basic gaps in project profile
   */
  private identifyBasicGaps(project: Project, matchingResult: MatchingResult): GapAnalysis[] {
    const gaps: GapAnalysis[] = [];

    // Check affordability gap
    const affordablePct = project.total_units && project.affordable_units
      ? (project.affordable_units / project.total_units) * 100
      : 0;

    if (affordablePct < 20) {
      gaps.push({
        gap: 'Affordable unit percentage below 20%',
        affectedPrograms: ['LIHTC', 'Affordable Housing Programs'],
        remediation: 'Consider increasing affordable units to 20%+ to qualify for LIHTC and other affordability incentives',
        potentialValueUnlocked: 5000000, // Rough LIHTC estimate
        difficulty: 'high',
      });
    }

    // Check sustainability gap
    if (!project.target_certification && !project.renewable_energy_types?.length) {
      const greenValue = matchingResult.greenIncentives.reduce((sum, m) => sum + m.estimatedValue, 0);
      gaps.push({
        gap: 'No sustainability certification or renewable energy planned',
        affectedPrograms: matchingResult.greenIncentives.slice(0, 3).map(m => m.incentive.name),
        remediation: 'Adding solar PV and pursuing Energy Star or LEED certification could unlock significant incentives',
        potentialValueUnlocked: greenValue || 500000,
        difficulty: 'medium',
      });
    }

    // Check IRA bonus gaps
    if (!project.domestic_content_eligible) {
      gaps.push({
        gap: 'Domestic content eligibility not confirmed',
        affectedPrograms: matchingResult.iraIncentives.map(m => m.incentive.name),
        remediation: 'Verify domestic content requirements for equipment to capture 10% bonus credits',
        potentialValueUnlocked: 100000,
        difficulty: 'low',
      });
    }

    if (!project.prevailing_wage_commitment) {
      gaps.push({
        gap: 'No prevailing wage commitment',
        affectedPrograms: ['Section 179D', 'ITC', 'PTC'],
        remediation: 'Committing to prevailing wages unlocks maximum credit amounts under IRA',
        potentialValueUnlocked: 200000,
        difficulty: 'medium',
      });
    }

    return gaps;
  }

  /**
   * Generate basic optimization suggestions
   */
  private generateBasicOptimizations(
    project: Project,
    matchingResult: MatchingResult
  ): OptimizationSuggestion[] {
    const optimizations: OptimizationSuggestion[] = [];

    // Solar optimization
    if (!project.renewable_energy_types?.includes('solar')) {
      const itcValue = matchingResult.greenIncentives
        .filter(m => m.incentive.name?.toLowerCase().includes('itc') || m.incentive.name?.toLowerCase().includes('solar'))
        .reduce((sum, m) => sum + m.estimatedValue, 0);

      if (itcValue > 0 || matchingResult.greenIncentives.length > 0) {
        optimizations.push({
          suggestion: 'Add rooftop solar photovoltaic system',
          rationale: 'Solar PV qualifies for 30% federal ITC plus state and utility rebates. ROI typically 5-7 years.',
          affectedPrograms: ['Investment Tax Credit (ITC)', ...matchingResult.greenIncentives.slice(0, 2).map(m => m.incentive.name)],
          estimatedAdditionalValue: itcValue || 300000,
          complexity: 'medium',
          type: 'project_change',
        });
      }
    }

    // Certification optimization
    if (!project.target_certification) {
      optimizations.push({
        suggestion: 'Pursue Energy Star or LEED certification',
        rationale: 'Green building certification increases eligibility for sustainability incentives and may be required for certain programs',
        affectedPrograms: matchingResult.greenIncentives.slice(0, 3).map(m => m.incentive.name),
        estimatedAdditionalValue: 250000,
        complexity: 'medium',
        type: 'documentation',
      });
    }

    // Timing optimization
    const upcomingDeadlines = matchingResult.matches.filter(m => {
      if (!m.incentive.application_deadline) return false;
      const daysUntil = Math.ceil(
        (new Date(m.incentive.application_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil > 0 && daysUntil <= 90;
    });

    if (upcomingDeadlines.length > 0) {
      optimizations.push({
        suggestion: `Prioritize ${upcomingDeadlines.length} programs with deadlines within 90 days`,
        rationale: 'These programs have approaching deadlines and should be prioritized in the application strategy',
        affectedPrograms: upcomingDeadlines.map(m => m.incentive.name),
        estimatedAdditionalValue: upcomingDeadlines.reduce((sum, m) => sum + m.estimatedValue, 0),
        complexity: 'low',
        type: 'timing',
      });
    }

    return optimizations;
  }

  /**
   * Generate basic stacking strategy using the stacking analyzer
   */
  private generateBasicStackingStrategy(
    matchingResult: MatchingResult,
    project?: Project
  ): StackingStrategy | null {
    const stackable = matchingResult.topMatches.filter(m =>
      m.incentive.stackable !== false &&
      (m.tier === 'high' || m.tier === 'medium')
    );

    if (stackable.length < 2) return null;

    // Use the stacking analyzer for detailed analysis
    const stackingResult = analyzeStackingOpportunities(stackable, {
      domesticContentEligible: project?.domestic_content_eligible ?? false,
      energyCommunityEligible: false, // Would need census tract lookup for actual determination
      prevailingWageCommitment: project?.prevailing_wage_commitment ?? false,
      maxGroups: 3,
    });

    // If no optimal stack found, return null
    if (!stackingResult.optimalStack || stackingResult.optimalStack.incentives.length < 2) {
      return null;
    }

    const optimalStack = stackingResult.optimalStack;

    // Build restrictions list from analysis
    const restrictions = [
      ...optimalStack.restrictions,
    ];

    // Add mutual exclusivity warnings
    if (stackingResult.mutuallyExclusivePairs.length > 0) {
      restrictions.push(
        `${stackingResult.mutuallyExclusivePairs.length} program pair(s) are mutually exclusive - review recommendations`
      );
    }

    // Add IRA bonus info if applicable
    if (stackingResult.iraBonusBreakdowns.length > 0) {
      const totalBonuses = stackingResult.iraBonusBreakdowns.reduce(
        (sum, b) => sum + b.domesticContentBonus + b.energyCommunityBonus + b.prevailingWageBonus,
        0
      );
      if (totalBonuses > 0) {
        restrictions.push(`IRA bonus adders available: +$${totalBonuses.toLocaleString()} with qualifying activities`);
      }
    }

    return {
      recommendedStack: optimalStack.incentives.map(m => m.incentive.name),
      totalStackValue: optimalStack.totalValue,
      rationale: optimalStack.stackingRationale,
      restrictions: restrictions.length > 0 ? restrictions : [
        'Verify program-specific stacking requirements',
        'Some programs may require separate applications and timelines',
      ],
      detailedAnalysis: stackingResult,
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTION
// ============================================================================

/**
 * Generate AI recommendations for a project's matched incentives
 */
export async function generateIncentiveRecommendations(
  project: Project,
  matchingResult: MatchingResult,
  config?: AIRecommendationConfig
): Promise<AIRecommendation> {
  const engine = new AIRecommendationEngine();
  return engine.generateRecommendations(project, matchingResult, config);
}

// ============================================================================
// QUICK RECOMMENDATION (for API responses)
// ============================================================================

export interface QuickRecommendation {
  summary: string;
  topOpportunity: string;
  keyAction: string;
  totalPotentialValue: number;
}

/**
 * Generate a quick recommendation summary without full AI analysis
 */
export function getQuickRecommendation(
  project: Project,
  matchingResult: MatchingResult
): QuickRecommendation {
  const topMatch = matchingResult.topMatches[0];
  const totalValue = matchingResult.totalPotentialValue;

  let keyAction = 'Review matched programs and begin application process';

  // Determine most impactful action
  const affordablePct = project.total_units && project.affordable_units
    ? (project.affordable_units / project.total_units) * 100
    : 0;

  if (affordablePct < 20 && affordablePct > 0) {
    keyAction = 'Consider increasing affordable units to 20%+ for LIHTC eligibility';
  } else if (!project.renewable_energy_types?.length) {
    keyAction = 'Adding solar could unlock 30%+ Investment Tax Credit';
  } else if (matchingResult.summary.highTier > 3) {
    keyAction = 'Strong match profile - prioritize high-confidence applications';
  }

  return {
    summary: `${matchingResult.matches.length} programs matched with $${totalValue.toLocaleString()} potential value`,
    topOpportunity: topMatch
      ? `${topMatch.incentive.name} - $${topMatch.estimatedValue.toLocaleString()}`
      : 'No high-confidence matches found',
    keyAction,
    totalPotentialValue: totalValue,
  };
}
