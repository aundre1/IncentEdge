/**
 * IncentEdge Eligibility Checker (Phase 2)
 *
 * Matches user projects against incentive programs based on:
 * 1. Project characteristics (sector, location, size, tech)
 * 2. Eligibility criteria (entity type, income, certifications)
 * 3. Bonus eligibility (domestic content, prevailing wage, energy community)
 * 4. Stacking opportunities (compatible programs)
 *
 * Database: Reads from projects, incentive_programs, project_incentive_matches tables
 */

import { createClient } from '@/lib/supabase/server';
import { HybridSearchEngine } from './knowledge-index';

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectProfile {
  id: string;
  sector_type: string;
  building_type?: string;
  state: string;
  city?: string;
  county?: string;
  total_sqft?: number;
  total_units?: number;
  affordable_units?: number;
  total_development_cost: number;
  construction_type: string;
  technologies?: string[];
  certifications?: string[];
  // Bonus eligibility
  domestic_content_eligible: boolean;
  prevailing_wage_commitment: boolean;
  energy_community_eligible: boolean;
  low_income_community_eligible: boolean;
  // Entity info
  entity_type: string;
  organization_id: string;
}

export interface EligibilityScore {
  program_id: string;
  program_name: string;
  match_confidence: number; // 0-1
  estimated_value_low: number;
  estimated_value_high: number;
  estimated_value_best: number;
  requirements_met: number;
  requirements_total: number;
  bonus_opportunities: {
    domestic_content?: number;
    prevailing_wage?: number;
    energy_community?: number;
    low_income?: number;
  };
  missing_requirements: string[];
  stacking_opportunities: string[]; // Program IDs of compatible programs
  stacking_estimated_value: number; // Total estimated value with all stackable programs
  reasons: string[]; // Why this program is a match
  priority_rank: number; // 1-10, higher = more valuable/achievable
}

export interface ProjectEligibilityResult {
  project_id: string;
  total_programs_analyzed: number;
  matching_programs: EligibilityScore[];
  total_potential_value: number;
  total_potential_with_stacking: number;
  top_matches: EligibilityScore[];
  recommendations: string[];
  last_calculated_at: string;
}

// ============================================================================
// ELIGIBILITY CALCULATION ENGINE
// ============================================================================

export class EligibilityChecker {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabaseClient: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabaseClient;
  }

  /**
   * Calculate eligibility for a project against all programs
   */
  async calculateEligibility(project: ProjectProfile): Promise<ProjectEligibilityResult> {
    const startTime = Date.now();

    // 1. Fetch all active programs
    const { data: programs, error: programError } = await this.supabase
      .from('incentive_programs')
      .select('*')
      .eq('status', 'active');

    if (programError) {
      throw new Error(`Failed to fetch programs: ${programError.message}`);
    }

    if (!programs || programs.length === 0) {
      return {
        project_id: project.id,
        total_programs_analyzed: 0,
        matching_programs: [],
        total_potential_value: 0,
        total_potential_with_stacking: 0,
        top_matches: [],
        recommendations: ['No programs found in database'],
        last_calculated_at: new Date().toISOString(),
      };
    }

    // 2. Score each program against the project
    const scores: EligibilityScore[] = [];

    for (const program of programs) {
      const score = await this.scoreProgram(project, program);
      if (score.match_confidence > 0) {
        scores.push(score);
      }
    }

    // 3. Detect stacking opportunities
    const scoredWithStacking = await this.calculateStacking(scores, project);

    // 4. Sort by priority and value
    const sorted = scoredWithStacking
      .sort((a, b) => {
        // Primary: match confidence
        if (a.match_confidence !== b.match_confidence) {
          return b.match_confidence - a.match_confidence;
        }
        // Secondary: estimated value
        return b.estimated_value_best - a.estimated_value_best;
      })
      .map((score, index) => ({
        ...score,
        priority_rank: index + 1,
      }));

    // 5. Generate recommendations
    const recommendations = this.generateRecommendations(sorted, project);

    const result: ProjectEligibilityResult = {
      project_id: project.id,
      total_programs_analyzed: programs.length,
      matching_programs: sorted.filter((s) => s.match_confidence >= 0.3),
      total_potential_value: sorted.reduce((sum, s) => sum + s.estimated_value_best, 0),
      total_potential_with_stacking: sorted.reduce((sum, s) => sum + s.stacking_estimated_value, 0),
      top_matches: sorted.slice(0, 10),
      recommendations,
      last_calculated_at: new Date().toISOString(),
    };

    // Log calculation time
    console.log(
      `Eligibility calculation completed in ${Date.now() - startTime}ms for project ${project.id}`
    );

    return result;
  }

  /**
   * Score a single program against a project
   */
  private async scoreProgram(project: ProjectProfile, program: any): Promise<EligibilityScore> {
    const reasons: string[] = [];
    let requirementsMet = 0;
    let requirementsTotal = 0;
    const missingRequirements: string[] = [];

    // 1. Check geographic eligibility
    const geoMatch = this.checkGeographicEligibility(project, program);
    if (geoMatch.match) {
      requirementsMet += 1;
      reasons.push(`Available in ${project.state}`);
    } else {
      missingRequirements.push(geoMatch.reason);
    }
    requirementsTotal += 1;

    // 2. Check sector/building type
    const sectorMatch = this.checkSectorEligibility(project, program);
    if (sectorMatch.match) {
      requirementsMet += 1;
      reasons.push(sectorMatch.reason);
    } else {
      missingRequirements.push(sectorMatch.reason);
    }
    requirementsTotal += 1;

    // 3. Check entity type
    const entityMatch = this.checkEntityEligibility(project, program);
    if (entityMatch.match) {
      requirementsMet += 1;
      reasons.push('Entity type eligible');
    } else {
      missingRequirements.push('Entity type not eligible');
    }
    requirementsTotal += 1;

    // 4. Check size requirements
    const sizeMatch = this.checkSizeEligibility(project, program);
    if (sizeMatch.match) {
      requirementsMet += 1;
      reasons.push(sizeMatch.reason);
    } else {
      missingRequirements.push(sizeMatch.reason);
    }
    requirementsTotal += 1;

    // 5. Check technology match
    const techMatch = this.checkTechnologyMatch(project, program);
    if (techMatch.match) {
      requirementsMet += 1;
      reasons.push(`Supports ${techMatch.matchedTechs.join(', ')}`);
    }
    requirementsTotal += 1;

    // 6. Calculate incentive value
    const valueCalc = this.calculateIncentiveValue(project, program);

    // 7. Check bonus eligibility
    const bonusCalc = this.calculateBonuses(project, program);

    // 8. Base confidence: requirements met percentage + geographic proximity
    const requirementsConfidence = requirementsMet / requirementsTotal;
    const geoProximity = geoMatch.match ? 1.0 : 0.5; // Full credit if in state, partial otherwise
    const baseConfidence = requirementsConfidence * 0.7 + geoProximity * 0.3;

    // 9. Adjust confidence for program popularity/reliability
    const programReliability = (program.confidence_score || 0.5) * (program.popularity_score || 50) / 100;
    const finalConfidence = Math.min(1, baseConfidence * 0.85 + programReliability * 0.15);

    return {
      program_id: program.id,
      program_name: program.name,
      match_confidence: finalConfidence,
      estimated_value_low: valueCalc.low,
      estimated_value_high: valueCalc.high,
      estimated_value_best: valueCalc.best + bonusCalc.totalBonus,
      requirements_met: requirementsMet,
      requirements_total: requirementsTotal,
      bonus_opportunities: bonusCalc.breakdown,
      missing_requirements: missingRequirements,
      stacking_opportunities: [], // Filled in by calculateStacking
      stacking_estimated_value: valueCalc.best + bonusCalc.totalBonus,
      reasons,
      priority_rank: 0, // Assigned later
    };
  }

  /**
   * Check geographic eligibility
   */
  private checkGeographicEligibility(
    project: ProjectProfile,
    program: any
  ): { match: boolean; reason: string } {
    const programStates = program.states || [];
    const programCounties = program.counties || [];
    const programMunicipalities = program.municipalities || [];

    // Federal programs apply everywhere
    if (program.jurisdiction_level === 'federal') {
      return { match: true, reason: 'Federal program applies nationwide' };
    }

    // State level
    if (program.jurisdiction_level === 'state') {
      if (programStates.includes(project.state) || programStates.length === 0) {
        return { match: true, reason: `Available in ${project.state}` };
      }
      return { match: false, reason: `Not available in ${project.state}` };
    }

    // Local level
    if (program.jurisdiction_level === 'local') {
      if (programCounties.includes(project.county) || programMunicipalities.includes(project.city)) {
        return { match: true, reason: `Available in ${project.city || project.county}` };
      }
      return { match: false, reason: `Not available in ${project.city || project.county}` };
    }

    return { match: false, reason: 'Unknown jurisdiction type' };
  }

  /**
   * Check sector/building type eligibility
   */
  private checkSectorEligibility(
    project: ProjectProfile,
    program: any
  ): { match: boolean; reason: string } {
    const programSectors = program.sector_types || [];
    const programBuildingTypes = program.building_types || [];

    // No restrictions = eligible
    if (programSectors.length === 0 && programBuildingTypes.length === 0) {
      return { match: true, reason: 'Program open to all sectors' };
    }

    // Check sector match
    if (programSectors.length > 0 && !programSectors.includes(project.sector_type)) {
      return { match: false, reason: `Program not available for ${project.sector_type} sector` };
    }

    // Check building type match
    if (programBuildingTypes.length > 0 && project.building_type) {
      if (!programBuildingTypes.includes(project.building_type)) {
        return {
          match: false,
          reason: `Program not available for ${project.building_type} buildings`,
        };
      }
    }

    return { match: true, reason: `Eligible for ${project.sector_type} sector` };
  }

  /**
   * Check entity type eligibility
   */
  private checkEntityEligibility(project: ProjectProfile, program: any): { match: boolean } {
    const eligibleEntityTypes = program.entity_types || [];

    // No restrictions = eligible
    if (eligibleEntityTypes.length === 0) {
      return { match: true };
    }

    // Check entity type match
    return { match: eligibleEntityTypes.includes(project.entity_type) };
  }

  /**
   * Check size-based eligibility
   */
  private checkSizeEligibility(
    project: ProjectProfile,
    program: any
  ): { match: boolean; reason: string } {
    const minSize = program.min_project_size;
    const maxSize = program.max_project_size;

    // Determine relevant size metric
    let projectSize = project.total_development_cost;
    if (project.sector_type === 'clean-energy') {
      projectSize = project.total_sqft || project.total_development_cost;
    }

    if (minSize && projectSize < minSize) {
      return {
        match: false,
        reason: `Project size below minimum of ${minSize.toLocaleString()}`,
      };
    }

    if (maxSize && projectSize > maxSize) {
      return {
        match: false,
        reason: `Project size exceeds maximum of ${maxSize.toLocaleString()}`,
      };
    }

    return { match: true, reason: `Within size requirements` };
  }

  /**
   * Check technology match
   */
  private checkTechnologyMatch(
    project: ProjectProfile,
    program: any
  ): { match: boolean; matchedTechs: string[] } {
    const programTechs = program.technology_types || [];
    const projectTechs = project.technologies || [];

    // No restrictions = match
    if (programTechs.length === 0) {
      return { match: true, matchedTechs: [] };
    }

    // Find matching technologies
    const matchedTechs = projectTechs.filter((tech) => programTechs.includes(tech));

    return {
      match: matchedTechs.length > 0,
      matchedTechs,
    };
  }

  /**
   * Calculate estimated incentive value
   */
  private calculateIncentiveValue(
    project: ProjectProfile,
    program: any
  ): { low: number; high: number; best: number } {
    let low = 0;
    let high = 0;

    const { amount_type, amount_fixed, amount_percentage, amount_per_unit, amount_per_kw, amount_per_sqft, amount_min, amount_max } = program;

    switch (amount_type) {
      case 'fixed':
        low = amount_fixed || 0;
        high = amount_fixed || 0;
        break;

      case 'percentage':
        const percent = (amount_percentage || 0) * project.total_development_cost;
        low = percent;
        high = percent;
        break;

      case 'per_unit':
        const units = project.total_units || 1;
        const perUnit = amount_per_unit || 0;
        low = units * perUnit;
        high = units * perUnit;
        break;

      case 'per_kw':
        // TODO: Get capacity_mw from project if available
        low = 0;
        high = 0;
        break;

      case 'per_sqft':
        const sqft = project.total_sqft || 0;
        const perSqft = amount_per_sqft || 0;
        low = sqft * perSqft;
        high = sqft * perSqft;
        break;

      case 'variable':
      default:
        low = amount_min || 0;
        high = amount_max || 0;
        break;
    }

    // Apply caps
    if (amount_min) low = Math.max(low, amount_min);
    if (amount_max) high = Math.min(high, amount_max);

    const best = (low + high) / 2;

    return { low, high, best };
  }

  /**
   * Calculate bonus opportunities
   */
  private calculateBonuses(
    project: ProjectProfile,
    program: any
  ): {
    totalBonus: number;
    breakdown: {
      domestic_content?: number;
      prevailing_wage?: number;
      energy_community?: number;
      low_income?: number;
    };
  } {
    const breakdown: any = {};
    let totalBonus = 0;

    // Domestic content bonus
    if (project.domestic_content_eligible && program.domestic_content_bonus) {
      const bonus = program.amount_fixed * (program.domestic_content_bonus || 0.1);
      breakdown.domestic_content = bonus;
      totalBonus += bonus;
    }

    // Prevailing wage bonus
    if (project.prevailing_wage_commitment && program.prevailing_wage_bonus) {
      const bonus = program.amount_fixed * (program.prevailing_wage_bonus || 0.1);
      breakdown.prevailing_wage = bonus;
      totalBonus += bonus;
    }

    // Energy community bonus
    if (project.energy_community_eligible && program.energy_community_bonus) {
      const bonus = program.amount_fixed * (program.energy_community_bonus || 0.1);
      breakdown.energy_community = bonus;
      totalBonus += bonus;
    }

    // Low income community bonus
    if (project.low_income_community_eligible && program.low_income_bonus) {
      const bonus = program.amount_fixed * (program.low_income_bonus || 0.1);
      breakdown.low_income = bonus;
      totalBonus += bonus;
    }

    return { totalBonus, breakdown };
  }

  /**
   * Calculate stacking opportunities
   */
  private async calculateStacking(
    scores: EligibilityScore[],
    project: ProjectProfile
  ): Promise<EligibilityScore[]> {
    return scores.map((score) => {
      // Find compatible programs
      const stackablePrograms = scores.filter(
        (other) =>
          other.program_id !== score.program_id &&
          other.match_confidence >= 0.3 && // Only consider reasonably matched programs
          !this.areConflicting(score.program_id, other.program_id)
      );

      const stackingValue = stackablePrograms.reduce(
        (sum, prog) => sum + prog.estimated_value_best,
        0
      );

      return {
        ...score,
        stacking_opportunities: stackablePrograms.map((p) => p.program_id),
        stacking_estimated_value: score.estimated_value_best + stackingValue,
      };
    });
  }

  /**
   * Check if two programs have stacking conflicts
   */
  private areConflicting(programId1: string, programId2: string): boolean {
    // TODO: Implement conflict checking from program data
    // Programs might have explicit conflict lists
    return false;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    scores: EligibilityScore[],
    project: ProjectProfile
  ): string[] {
    const recommendations: string[] = [];

    if (scores.length === 0) {
      recommendations.push('No programs matched. Consider adjusting project parameters.');
      return recommendations;
    }

    const topMatch = scores[0];

    // Top program recommendation
    recommendations.push(
      `Priority: Apply for ${topMatch.program_name} (${(topMatch.match_confidence * 100).toFixed(0)}% confidence, est. $${topMatch.estimated_value_best.toLocaleString()})`
    );

    // Bonus recommendations
    const bonusCount = Object.values(topMatch.bonus_opportunities).filter((b) => b).length;
    if (bonusCount > 0) {
      recommendations.push(`Pursue ${bonusCount} bonus eligibility requirements to maximize value`);
    }

    // Stacking recommendation
    const stackingOpportunities = scores.filter((s) => s.stacking_opportunities.length > 0);
    if (stackingOpportunities.length > 0) {
      const totalStacking = stackingOpportunities.reduce(
        (sum, s) => sum + s.stacking_estimated_value,
        0
      );
      recommendations.push(
        `Combine with compatible programs for total potential of $${totalStacking.toLocaleString()}`
      );
    }

    // Missing requirements guidance
    if (topMatch.missing_requirements.length > 0) {
      recommendations.push(`Address these to increase eligibility: ${topMatch.missing_requirements[0]}`);
    }

    return recommendations;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EligibilityChecker;
