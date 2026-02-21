/**
 * Tests for Incentive Matcher v41
 *
 * Tests the AI-powered matching algorithm
 */

import { describe, it, expect } from 'vitest';
import {
  matchIncentivesToProject,
  getQuickMatches,
} from '@/lib/incentive-matcher';
import { createMockProject, createMockIncentive, createMockStateIncentive } from '../utils/test-helpers';

describe('Incentive Matcher v41', () => {
  describe('matchIncentivesToProject', () => {
    it('should match project to eligible federal incentive', () => {
      const project = createMockProject({
        state: 'NY',
        sector_type: 'clean-energy',
        renewable_energy_types: ['solar'],
      });

      const incentive = createMockIncentive({
        jurisdiction_level: 'federal',
        sector_types: ['clean-energy'],
        technology_types: ['solar'],
      });

      const result = matchIncentivesToProject(project, [incentive]);

      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].tier).toBe('high');
    });

    it('should prioritize category match (v41 weight: 40%)', () => {
      const project = createMockProject({
        state: 'NY',
        sector_type: 'clean-energy',
      });

      const perfectCategoryMatch = createMockIncentive({
        id: 'perfect',
        jurisdiction_level: 'federal',
        incentive_type: 'tax_credit',
        sector_types: ['clean-energy'],
      });

      const poorCategoryMatch = createMockIncentive({
        id: 'poor',
        jurisdiction_level: 'local',
        incentive_type: 'loan',
        sector_types: ['manufacturing'],
      });

      const result = matchIncentivesToProject(project, [perfectCategoryMatch, poorCategoryMatch]);

      expect(result.matches[0].categoryScore).toBeGreaterThan(result.matches[1]?.categoryScore || 0);
    });

    it('should match state correctly (v41 weight: 35%)', () => {
      const project = createMockProject({
        state: 'NY',
      });

      const nyIncentive = createMockStateIncentive('NY');
      const caIncentive = createMockStateIncentive('CA');

      const result = matchIncentivesToProject(project, [nyIncentive, caIncentive]);

      const nyMatch = result.matches.find(m => m.incentive.id === nyIncentive.id);
      const caMatch = result.matches.find(m => m.incentive.id === caIncentive.id);

      expect(nyMatch?.locationScore).toBeGreaterThan(caMatch?.locationScore || 0);
    });

    it('should calculate eligibility score (v41 weight: 25%)', () => {
      const project = createMockProject({
        total_units: 100,
        affordable_units: 60,
        total_development_cost: 10000000,
      });

      const incentive = createMockIncentive({
        sector_types: ['affordable-housing'],
      });

      const result = matchIncentivesToProject(project, [incentive]);

      expect(result.matches[0].eligibilityScore).toBeGreaterThan(0);
      expect(result.matches[0].eligibilityDetails.length).toBeGreaterThan(0);
    });

    it('should estimate value correctly for percentage-based incentive', () => {
      const project = createMockProject({
        total_development_cost: 10000000,
      });

      const incentive = createMockIncentive({
        amount_percentage: 0.30, // 30%
      });

      const result = matchIncentivesToProject(project, [incentive]);

      expect(result.matches[0].estimatedValue).toBe(3000000);
    });

    it('should estimate value for per-unit incentive', () => {
      const project = createMockProject({
        total_units: 100,
      });

      const incentive = createMockIncentive({
        amount_per_unit: 5000,
      });

      const result = matchIncentivesToProject(project, [incentive]);

      expect(result.matches[0].estimatedValue).toBe(500000);
    });

    it('should group results by category', () => {
      const project = createMockProject({ state: 'NY' });

      const federal = createMockIncentive({ category: 'federal', jurisdiction_level: 'federal' });
      const state = createMockStateIncentive('NY');
      const local = createMockIncentive({ category: 'local', jurisdiction_level: 'local', state: 'NY' });

      const result = matchIncentivesToProject(project, [federal, state, local]);

      expect(result.byCategory.federal.length).toBeGreaterThan(0);
      expect(result.byCategory.state.length).toBeGreaterThan(0);
      expect(result.byCategory.local.length).toBeGreaterThan(0);
    });

    it('should identify green/clean energy incentives', () => {
      const project = createMockProject({
        renewable_energy_types: ['solar'],
      });

      const solarIncentive = createMockIncentive({
        name: 'Solar Investment Tax Credit',
        technology_types: ['solar'],
      });

      const nonGreenIncentive = createMockIncentive({
        name: 'Generic Grant',
        technology_types: [],
      });

      const result = matchIncentivesToProject(project, [solarIncentive, nonGreenIncentive]);

      expect(result.greenIncentives.length).toBeGreaterThan(0);
      expect(result.greenIncentives[0].incentive.id).toBe(solarIncentive.id);
    });

    it('should identify IRA incentives', () => {
      const project = createMockProject();

      const iraIncentive = createMockIncentive({
        name: 'IRA Section 48 ITC',
        domestic_content_bonus: 0.10,
        energy_community_bonus: 0.10,
      });

      const nonIRAIncentive = createMockIncentive({
        name: 'State Program',
      });

      const result = matchIncentivesToProject(project, [iraIncentive, nonIRAIncentive]);

      expect(result.iraIncentives.length).toBeGreaterThan(0);
    });

    it('should calculate total potential value', () => {
      const project = createMockProject();

      const incentives = [
        createMockIncentive({ id: '1', amount_fixed: 100000 }),
        createMockIncentive({ id: '2', amount_fixed: 200000 }),
        createMockIncentive({ id: '3', amount_fixed: 300000 }),
      ];

      const result = matchIncentivesToProject(project, incentives);

      expect(result.totalPotentialValue).toBe(600000);
    });

    it('should provide top matches', () => {
      const project = createMockProject();

      const incentives = Array.from({ length: 20 }, (_, i) =>
        createMockIncentive({
          id: `incentive-${i}`,
          amount_fixed: (i + 1) * 10000,
        })
      );

      const result = matchIncentivesToProject(project, incentives);

      expect(result.topMatches.length).toBeLessThanOrEqual(10);
      expect(result.topMatches[0].tier).toMatch(/high|medium/);
    });

    it('should assign correct tiers based on match score and location', () => {
      const project = createMockProject({ state: 'NY' });

      const highTierIncentive = createMockIncentive({
        id: 'high',
        jurisdiction_level: 'federal',
        sector_types: ['affordable-housing'],
        amount_fixed: 1000000,
      });

      const result = matchIncentivesToProject(
        { ...project, sector_type: 'affordable-housing' },
        [highTierIncentive]
      );

      const match = result.matches[0];
      expect(match.matchScore).toBeGreaterThan(0.7);
      expect(['high', 'medium']).toContain(match.tier);
    });

    it('should skip inactive programs', () => {
      const project = createMockProject();

      const active = createMockIncentive({ id: 'active', status: 'active' });
      const inactive = createMockIncentive({ id: 'inactive', status: 'inactive' });

      const result = matchIncentivesToProject(project, [active, inactive]);

      expect(result.matches.find(m => m.incentive.id === 'active')).toBeDefined();
      expect(result.matches.find(m => m.incentive.id === 'inactive')).toBeUndefined();
    });

    it('should respect minCategoryScore threshold', () => {
      const project = createMockProject({
        sector_type: 'clean-energy',
      });

      const poorMatch = createMockIncentive({
        sector_types: ['manufacturing'],
        jurisdiction_level: 'local',
      });

      const result = matchIncentivesToProject(project, [poorMatch], {
        minCategoryScore: 0.5,
      });

      // Poor category match should be filtered out
      expect(result.matches.length).toBe(0);
    });

    it('should respect maxResults limit', () => {
      const project = createMockProject();

      const incentives = Array.from({ length: 50 }, (_, i) =>
        createMockIncentive({ id: `incentive-${i}` })
      );

      const result = matchIncentivesToProject(project, incentives, {
        maxResults: 10,
      });

      expect(result.matches.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getQuickMatches', () => {
    it('should return limited quick match results', () => {
      const project = createMockProject();
      const incentives = Array.from({ length: 20 }, (_, i) =>
        createMockIncentive({ id: `incentive-${i}` })
      );

      const result = getQuickMatches(project, incentives, 5);

      expect(result.length).toBeLessThanOrEqual(5);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('estimatedValue');
      expect(result[0]).toHaveProperty('tier');
    });

    it('should include top reason in quick match', () => {
      const project = createMockProject();
      const incentive = createMockIncentive({
        jurisdiction_level: 'federal',
      });

      const result = getQuickMatches(project, [incentive], 5);

      expect(result[0].topReason).toBeDefined();
      expect(result[0].topReason.length).toBeGreaterThan(0);
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate correct summary', () => {
      const project = createMockProject({ state: 'NY' });

      const incentives = [
        createMockIncentive({ id: 'fed', category: 'federal', jurisdiction_level: 'federal' }),
        createMockStateIncentive('NY'),
        createMockIncentive({ id: 'local', category: 'local', jurisdiction_level: 'local', state: 'NY' }),
      ];

      const result = matchIncentivesToProject(project, incentives);

      expect(result.summary.totalMatched).toBe(3);
      expect(result.summary.federalCount).toBe(1);
      expect(result.summary.stateCount).toBe(1);
      expect(result.summary.localCount).toBe(1);
      expect(result.summary.avgMatchScore).toBeGreaterThan(0);
    });

    it('should count matches by tier', () => {
      const project = createMockProject();

      const incentives = Array.from({ length: 10 }, (_, i) =>
        createMockIncentive({
          id: `incentive-${i}`,
          amount_fixed: (i + 1) * 100000,
        })
      );

      const result = matchIncentivesToProject(project, incentives);

      const tierCounts =
        result.summary.highTier +
        result.summary.mediumTier +
        result.summary.lowTier +
        result.summary.potentialTier;

      expect(tierCounts).toBe(result.summary.totalMatched);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty incentives array', () => {
      const project = createMockProject();

      const result = matchIncentivesToProject(project, []);

      expect(result.matches).toEqual([]);
      expect(result.totalPotentialValue).toBe(0);
      expect(result.summary.totalMatched).toBe(0);
    });

    it('should handle project with minimal data', () => {
      const minimalProject = createMockProject({
        total_development_cost: null,
        total_units: null,
        renewable_energy_types: null,
      });

      const incentive = createMockIncentive();

      const result = matchIncentivesToProject(minimalProject, [incentive]);

      // Should not throw
      expect(result).toBeDefined();
    });

    it('should handle incentive with no amount data', () => {
      const project = createMockProject();

      const noAmountIncentive = createMockIncentive({
        amount_fixed: null,
        amount_percentage: null,
        amount_per_unit: null,
        amount_per_kw: null,
        amount_max: 500000,
      });

      const result = matchIncentivesToProject(project, [noAmountIncentive]);

      // Should estimate at 50% of max
      expect(result.matches[0].estimatedValue).toBe(250000);
    });
  });
});
