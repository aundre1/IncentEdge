/**
 * Tests for Eligibility Engine v2
 *
 * Tests the core business logic for matching projects to incentive programs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateEligibility,
  calculateComputedValues,
  buildDefaultRules,
  analyzeStacking,
  ENGINE_VERSION,
} from '@/lib/eligibility-engine';
import { createMockProject, createMockIncentive, createMockLIHTC } from '../utils/test-helpers';

describe('Eligibility Engine v2', () => {
  describe('Engine Metadata', () => {
    it('should have correct version', () => {
      expect(ENGINE_VERSION).toBe('2.0.0');
    });
  });

  describe('calculateComputedValues', () => {
    it('should calculate affordability percentage correctly', () => {
      const project = createMockProject({
        total_units: 100,
        affordable_units: 60,
      });

      const computed = calculateComputedValues(project);

      expect(computed.affordability_percentage).toBe(60);
      expect(computed.is_affordable_housing).toBe(true);
    });

    it('should calculate affordability from breakdown if units not provided', () => {
      const project = createMockProject({
        total_units: 100,
        affordable_units: null,
        affordable_breakdown: {
          ami_30: 20,
          ami_50: 20,
          ami_60: 10,
          ami_80: 10,
        },
      });

      const computed = calculateComputedValues(project);

      expect(computed.affordability_percentage).toBe(60); // 60/100
      expect(computed.is_affordable_housing).toBe(true);
    });

    it('should calculate cost per unit', () => {
      const project = createMockProject({
        total_development_cost: 25000000,
        total_units: 100,
      });

      const computed = calculateComputedValues(project);

      expect(computed.cost_per_unit).toBe(250000);
    });

    it('should calculate cost per sqft', () => {
      const project = createMockProject({
        total_development_cost: 25000000,
        total_sqft: 75000,
      });

      const computed = calculateComputedValues(project);

      expect(computed.cost_per_sqft).toBeCloseTo(333.33, 2);
    });

    it('should infer sustainability tier from certification', () => {
      const projectLeedGold = createMockProject({
        target_certification: 'LEED Gold',
      });
      const computedGold = calculateComputedValues(projectLeedGold);
      expect(computedGold.sustainability_tier).toBe('tier_2_high_performance');

      const projectPassive = createMockProject({
        target_certification: 'Passive House',
      });
      const computedPassive = calculateComputedValues(projectPassive);
      expect(computedPassive.sustainability_tier).toBe('tier_3_net_zero');

      const projectLiving = createMockProject({
        target_certification: 'Living Building Challenge',
      });
      const computedLiving = calculateComputedValues(projectLiving);
      expect(computedLiving.sustainability_tier).toBe('tier_3_triple_net_zero');
    });

    it('should infer sustainability tier from energy reduction', () => {
      const project100 = createMockProject({
        target_certification: null,
        projected_energy_reduction_pct: 100,
      });
      const computed100 = calculateComputedValues(project100);
      expect(computed100.sustainability_tier).toBe('tier_3_triple_net_zero');

      const project80 = createMockProject({
        target_certification: null,
        projected_energy_reduction_pct: 80,
      });
      const computed80 = calculateComputedValues(project80);
      expect(computed80.sustainability_tier).toBe('tier_3_net_zero');

      const project50 = createMockProject({
        target_certification: null,
        projected_energy_reduction_pct: 50,
      });
      const computed50 = calculateComputedValues(project50);
      expect(computed50.sustainability_tier).toBe('tier_2_high_performance');

      const project20 = createMockProject({
        target_certification: null,
        projected_energy_reduction_pct: 20,
      });
      const computed20 = calculateComputedValues(project20);
      expect(computed20.sustainability_tier).toBe('tier_1_efficient');
    });
  });

  describe('buildDefaultRules', () => {
    it('should build geographic rules for state programs', () => {
      const program = createMockIncentive({
        jurisdiction_level: 'state',
        state: 'NY',
        counties: ['Kings', 'Queens'],
      });

      const rules = buildDefaultRules(program);

      const geoRules = rules.filter(r => r.type === 'geographic');
      expect(geoRules.length).toBeGreaterThan(0);

      const stateRule = geoRules.find(r => r.scope === 'state');
      expect(stateRule).toBeDefined();
      expect(stateRule?.values).toContain('NY');
    });

    it('should build geographic rules for federal programs', () => {
      const program = createMockIncentive({
        jurisdiction_level: 'federal',
      });

      const rules = buildDefaultRules(program);

      const geoRules = rules.filter(r => r.type === 'geographic');
      const federalRule = geoRules.find(r => r.allowFederal === true);
      expect(federalRule).toBeDefined();
    });

    it('should build sector type rules', () => {
      const program = createMockIncentive({
        sector_types: ['affordable-housing', 'clean-energy'],
      });

      const rules = buildDefaultRules(program);

      const sectorRule = rules.find(
        r => r.type === 'comparison' && r.field === 'project.sector_type'
      );
      expect(sectorRule).toBeDefined();
      expect(sectorRule?.operator).toBe('in');
    });

    it('should build date rules for active status', () => {
      const program = createMockIncentive({
        start_date: '2022-01-01',
        end_date: '2030-12-31',
      });

      const rules = buildDefaultRules(program);

      const dateRule = rules.find(
        r => r.type === 'date' && r.operator === 'is_active'
      );
      expect(dateRule).toBeDefined();
      expect(dateRule?.required).toBe(true);
    });
  });

  describe('evaluateEligibility - Happy Path', () => {
    it('should match a qualified project to a federal incentive', async () => {
      const project = createMockProject({
        state: 'NY',
        sector_type: 'clean-energy',
        renewable_energy_types: ['solar'],
      });

      const program = createMockIncentive({
        jurisdiction_level: 'federal',
        sector_types: ['clean-energy'],
        technology_types: ['solar'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].qualified).toBe(true);
      expect(result.matches[0].programId).toBe(program.id);
      expect(result.summary.totalQualified).toBe(1);
    });

    it('should calculate estimated value for percentage-based incentive', async () => {
      const project = createMockProject({
        total_development_cost: 10000000,
        sector_type: 'clean-energy',
      });

      const program = createMockIncentive({
        amount_percentage: 0.30,
        sector_types: ['clean-energy'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      expect(result.matches.length).toBeGreaterThan(0);
      const match = result.matches[0];
      expect(match.estimatedValue).toBe(3000000); // 30% of 10M
    });

    it('should calculate estimated value for per-unit incentive', async () => {
      const project = createMockProject({
        total_units: 100,
        sector_type: 'affordable-housing',
      });

      const program = createMockIncentive({
        amount_per_unit: 5000,
        sector_types: ['affordable-housing'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      expect(result.matches.length).toBeGreaterThan(0);
      const match = result.matches[0];
      expect(match.estimatedValue).toBe(500000); // 5000 * 100
    });

    it('should apply bonus adders for IRA programs', async () => {
      const project = createMockProject({
        domestic_content_eligible: true,
        prevailing_wage_commitment: true,
        sector_type: 'clean-energy',
      });

      const program = createMockIncentive({
        amount_fixed: 1000000,
        domestic_content_bonus: 0.10,
        prevailing_wage_bonus: 0.10,
        sector_types: ['clean-energy'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      expect(result.matches.length).toBeGreaterThan(0);
      const match = result.matches[0];

      // Base + 10% domestic + 10% prevailing wage = 1.2M
      expect(match.valueBreakdown.totalBonusAmount).toBeGreaterThan(0);
      expect(match.estimatedValue).toBeGreaterThan(1000000);
    });
  });

  describe('evaluateEligibility - Disqualification Cases', () => {
    it('should disqualify project in wrong state', async () => {
      const project = createMockProject({
        state: 'CA',
      });

      const program = createMockIncentive({
        jurisdiction_level: 'state',
        state: 'NY',
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      const match = result.matches.find(m => m.programId === program.id);
      expect(match?.qualified).toBe(false);
      expect(match?.eligibilityBreakdown.disqualifyingReasons.length).toBeGreaterThan(0);
    });

    it('should disqualify for missing required sector type', async () => {
      const project = createMockProject({
        sector_type: 'commercial',
      });

      const program = createMockIncentive({
        sector_types: ['affordable-housing', 'clean-energy'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      const match = result.matches.find(m => m.programId === program.id);
      expect(match?.qualified).toBe(false);
    });

    it('should skip inactive programs by default', async () => {
      const project = createMockProject();

      const activeProgram = createMockIncentive({
        id: 'active-1',
        status: 'active',
      });

      const inactiveProgram = createMockIncentive({
        id: 'inactive-1',
        status: 'inactive',
      });

      const result = await evaluateEligibility({
        project,
        programs: [activeProgram, inactiveProgram],
      });

      expect(result.matches.find(m => m.programId === 'active-1')).toBeDefined();
      expect(result.matches.find(m => m.programId === 'inactive-1')).toBeUndefined();
    });

    it('should include inactive programs when configured', async () => {
      const project = createMockProject();

      const inactiveProgram = createMockIncentive({
        id: 'inactive-1',
        status: 'inactive',
      });

      const result = await evaluateEligibility({
        project,
        programs: [inactiveProgram],
        config: { includeInactive: true },
      });

      expect(result.matches.find(m => m.programId === 'inactive-1')).toBeDefined();
    });
  });

  describe('evaluateEligibility - Sorting and Ranking', () => {
    it('should sort matches by estimated value descending', async () => {
      const project = createMockProject();

      const programs = [
        createMockIncentive({ id: 'low', amount_fixed: 100000 }),
        createMockIncentive({ id: 'high', amount_fixed: 1000000 }),
        createMockIncentive({ id: 'medium', amount_fixed: 500000 }),
      ];

      const result = await evaluateEligibility({
        project,
        programs,
      });

      expect(result.matches[0].programId).toBe('high');
      expect(result.matches[1].programId).toBe('medium');
      expect(result.matches[2].programId).toBe('low');
    });

    it('should assign priority ranks', async () => {
      const project = createMockProject();
      const programs = [
        createMockIncentive({ id: '1', amount_fixed: 300000 }),
        createMockIncentive({ id: '2', amount_fixed: 200000 }),
        createMockIncentive({ id: '3', amount_fixed: 100000 }),
      ];

      const result = await evaluateEligibility({
        project,
        programs,
      });

      expect(result.matches[0].priorityRank).toBe(1);
      expect(result.matches[1].priorityRank).toBe(2);
      expect(result.matches[2].priorityRank).toBe(3);
    });
  });

  describe('evaluateEligibility - Grouping and Summary', () => {
    it('should group matches by category', async () => {
      const project = createMockProject();

      const programs = [
        createMockIncentive({ id: 'fed-1', category: 'federal', jurisdiction_level: 'federal' }),
        createMockIncentive({ id: 'state-1', category: 'state', jurisdiction_level: 'state', state: 'NY' }),
        createMockIncentive({ id: 'local-1', category: 'local', jurisdiction_level: 'local', state: 'NY' }),
      ];

      const result = await evaluateEligibility({
        project: { ...project, state: 'NY' },
        programs,
      });

      expect(result.byCategory.federal.length).toBeGreaterThan(0);
      expect(result.byCategory.state.length).toBeGreaterThan(0);
      expect(result.byCategory.local.length).toBeGreaterThan(0);
    });

    it('should calculate total potential value', async () => {
      const project = createMockProject();

      const programs = [
        createMockIncentive({ id: '1', amount_fixed: 100000 }),
        createMockIncentive({ id: '2', amount_fixed: 200000 }),
        createMockIncentive({ id: '3', amount_fixed: 300000 }),
      ];

      const result = await evaluateEligibility({
        project,
        programs,
      });

      expect(result.totalPotentialValue).toBe(600000);
    });

    it('should provide summary statistics', async () => {
      const project = createMockProject({
        sector_type: 'clean-energy',
      });

      const qualifiedProgram = createMockIncentive({
        id: 'qualified',
        sector_types: ['clean-energy'],
      });

      const notQualifiedProgram = createMockIncentive({
        id: 'not-qualified',
        sector_types: ['manufacturing'],
      });

      const result = await evaluateEligibility({
        project,
        programs: [qualifiedProgram, notQualifiedProgram],
      });

      expect(result.summary.totalProgramsEvaluated).toBe(2);
      expect(result.summary.totalQualified).toBeGreaterThanOrEqual(1);
    });
  });

  describe('analyzeStacking', () => {
    it('should identify stackable programs from different jurisdictions', () => {
      const federalMatch = {
        programId: 'fed-1',
        programName: 'Federal ITC',
        category: 'federal' as const,
        qualified: true,
        overallScore: 85,
        probabilityScore: 0.8,
        relevanceScore: 0.9,
        estimatedValue: 1000000,
        stackingAnalysis: { compatible: [], incompatible: [], reduces: [], requires: [] },
        recommendationTier: 'high' as const,
        eligibilityBreakdown: {} as any,
        valueBreakdown: {} as any,
        estimatedValueLow: 900000,
        estimatedValueHigh: 1100000,
        evaluatedAt: new Date().toISOString(),
      };

      const stateMatch = {
        ...federalMatch,
        programId: 'state-1',
        programName: 'State Grant',
        category: 'state' as const,
        estimatedValue: 500000,
      };

      const programs = [
        createMockIncentive({ id: 'fed-1', category: 'federal', jurisdiction_level: 'federal' }),
        createMockIncentive({ id: 'state-1', category: 'state', jurisdiction_level: 'state' }),
      ];

      const result = analyzeStacking([federalMatch, stateMatch], programs);

      expect(result.canStack).toBe(true);
      expect(result.combinedValue).toBeGreaterThan(0);
    });

    it('should calculate combined value for stackable programs', () => {
      const match1 = {
        programId: 'fed-1',
        programName: 'Federal ITC',
        category: 'federal' as const,
        qualified: true,
        overallScore: 85,
        probabilityScore: 0.8,
        relevanceScore: 0.9,
        estimatedValue: 1000000,
        stackingAnalysis: { compatible: [], incompatible: [], reduces: [], requires: [] },
        recommendationTier: 'high' as const,
        eligibilityBreakdown: {} as any,
        valueBreakdown: {} as any,
        estimatedValueLow: 900000,
        estimatedValueHigh: 1100000,
        evaluatedAt: new Date().toISOString(),
      };

      const match2 = {
        ...match1,
        programId: 'state-1',
        category: 'state' as const,
        estimatedValue: 500000,
      };

      const programs = [
        createMockIncentive({ id: 'fed-1', category: 'federal', jurisdiction_level: 'federal' }),
        createMockIncentive({ id: 'state-1', category: 'state', jurisdiction_level: 'state' }),
      ];

      const result = analyzeStacking([match1, match2], programs);

      expect(result.combinedValue).toBeCloseTo(1500000, -3); // May have reduction
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty programs array', async () => {
      const project = createMockProject();

      const result = await evaluateEligibility({
        project,
        programs: [],
      });

      expect(result.matches).toEqual([]);
      expect(result.totalPotentialValue).toBe(0);
    });

    it('should handle projects with missing data gracefully', async () => {
      const project = createMockProject({
        total_development_cost: null,
        total_units: null,
        total_sqft: null,
      });

      const program = createMockIncentive();

      const result = await evaluateEligibility({
        project,
        programs: [program],
      });

      // Should not throw, may have low confidence
      expect(result.matches.length).toBeGreaterThanOrEqual(0);
    });

    it('should respect maxResults configuration', async () => {
      const project = createMockProject();
      const programs = Array.from({ length: 50 }, (_, i) =>
        createMockIncentive({ id: `prog-${i}` })
      );

      const result = await evaluateEligibility({
        project,
        programs,
        config: { maxResults: 10 },
      });

      expect(result.matches.length).toBeLessThanOrEqual(10);
    });

    it('should filter by minScore threshold', async () => {
      const project = createMockProject({
        sector_type: 'clean-energy',
      });

      const highMatchProgram = createMockIncentive({
        id: 'high',
        sector_types: ['clean-energy'],
        jurisdiction_level: 'federal',
      });

      const lowMatchProgram = createMockIncentive({
        id: 'low',
        sector_types: ['manufacturing'],
        jurisdiction_level: 'local',
      });

      const result = await evaluateEligibility({
        project,
        programs: [highMatchProgram, lowMatchProgram],
        config: { minScore: 0.7 },
      });

      // Only high-scoring matches should pass
      const lowMatch = result.matches.find(m => m.programId === 'low');
      if (lowMatch) {
        expect(lowMatch.overallScore).toBeGreaterThanOrEqual(70);
      }
    });
  });
});
