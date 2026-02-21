/**
 * Tests for Stacking Analyzer
 */

import { describe, it, expect } from 'vitest';
import {
  analyzeStackingOpportunities,
  canStack,
  getStackingRules,
  hasIRABonuses,
} from '@/lib/stacking-analyzer';
import { createMockIncentive } from '../utils/test-helpers';
import type { MatchedIncentive } from '@/lib/incentive-matcher';

describe('Stacking Analyzer', () => {
  function createMockMatch(overrides: Partial<MatchedIncentive> = {}): MatchedIncentive {
    return {
      incentive: createMockIncentive(),
      matchScore: 0.8,
      categoryScore: 0.7,
      locationScore: 0.9,
      eligibilityScore: 0.8,
      estimatedValue: 500000,
      matchReasons: ['Test reason'],
      eligibilityDetails: [],
      tier: 'high',
      ...overrides,
    };
  }

  describe('analyzeStackingOpportunities', () => {
    it('should allow stacking federal + state programs', () => {
      const federalMatch = createMockMatch({
        incentive: createMockIncentive({ id: 'fed', jurisdiction_level: 'federal' }),
        estimatedValue: 1000000,
      });

      const stateMatch = createMockMatch({
        incentive: createMockIncentive({ id: 'state', jurisdiction_level: 'state' }),
        estimatedValue: 500000,
      });

      const result = analyzeStackingOpportunities([federalMatch, stateMatch]);

      expect(result.mutuallyExclusivePairs.length).toBe(0);
      expect(result.optimalStack?.incentives.length).toBe(2);
      expect(result.totalCombinedValue).toBeGreaterThan(0);
    });

    it('should identify mutually exclusive federal tax credits', () => {
      const itc = createMockMatch({
        incentive: createMockIncentive({
          id: 'itc',
          name: 'Section 48 ITC',
          jurisdiction_level: 'federal',
          incentive_type: 'tax_credit',
          technology_types: ['solar'],
        }),
      });

      const ptc = createMockMatch({
        incentive: createMockIncentive({
          id: 'ptc',
          name: 'Section 45 PTC',
          jurisdiction_level: 'federal',
          incentive_type: 'tax_credit',
          technology_types: ['solar'],
        }),
      });

      const result = analyzeStackingOpportunities([itc, ptc]);

      expect(result.mutuallyExclusivePairs.length).toBeGreaterThan(0);
    });

    it('should allow stacking tax credit + grant', () => {
      const taxCredit = createMockMatch({
        incentive: createMockIncentive({
          id: 'tc',
          incentive_type: 'tax_credit',
        }),
      });

      const grant = createMockMatch({
        incentive: createMockIncentive({
          id: 'grant',
          incentive_type: 'grant',
        }),
      });

      const result = analyzeStackingOpportunities([taxCredit, grant]);

      expect(result.optimalStack?.incentives.length).toBe(2);
    });

    it('should calculate IRA bonuses when eligible', () => {
      const iraProgram = createMockMatch({
        incentive: createMockIncentive({
          name: 'IRA Section 48',
          domestic_content_bonus: 0.10,
          energy_community_bonus: 0.10,
          prevailing_wage_bonus: 0.10,
        }),
        estimatedValue: 1000000,
      });

      const result = analyzeStackingOpportunities([iraProgram], {
        domesticContentEligible: true,
        energyCommunityEligible: true,
        prevailingWageCommitment: true,
      });

      expect(result.iraBonusBreakdowns.length).toBeGreaterThan(0);
      expect(result.iraBonusBreakdowns[0].totalWithBonuses).toBeGreaterThan(1000000);
    });

    it('should handle single match', () => {
      const match = createMockMatch();

      const result = analyzeStackingOpportunities([match]);

      expect(result.stackingGroups.length).toBe(1);
      expect(result.optimalStack?.incentives.length).toBe(1);
      expect(result.mutuallyExclusivePairs.length).toBe(0);
    });

    it('should handle empty array', () => {
      const result = analyzeStackingOpportunities([]);

      expect(result.inputMatches).toEqual([]);
      expect(result.stackingGroups).toEqual([]);
      expect(result.totalCombinedValue).toBe(0);
    });

    it('should create multiple stacking groups', () => {
      const matches = [
        createMockMatch({ incentive: createMockIncentive({ id: '1', jurisdiction_level: 'federal' }) }),
        createMockMatch({ incentive: createMockIncentive({ id: '2', jurisdiction_level: 'state' }) }),
        createMockMatch({ incentive: createMockIncentive({ id: '3', jurisdiction_level: 'local' }) }),
      ];

      const result = analyzeStackingOpportunities(matches, { maxGroups: 5 });

      expect(result.stackingGroups.length).toBeGreaterThan(0);
    });

    it('should provide recommendations for mutually exclusive pairs', () => {
      const high = createMockMatch({
        incentive: createMockIncentive({
          id: 'high',
          jurisdiction_level: 'federal',
          incentive_type: 'tax_credit',
          name: 'High Value Credit',
          technology_types: ['solar'],
        }),
        estimatedValue: 1000000,
      });

      const low = createMockMatch({
        incentive: createMockIncentive({
          id: 'low',
          jurisdiction_level: 'federal',
          incentive_type: 'tax_credit',
          name: 'Low Value Credit',
          technology_types: ['solar'],
        }),
        estimatedValue: 100000,
      });

      const result = analyzeStackingOpportunities([high, low]);

      const pair = result.mutuallyExclusivePairs[0];
      if (pair) {
        expect(pair.recommendation).toContain('High Value Credit');
      }
    });

    it('should calculate value by jurisdiction', () => {
      const matches = [
        createMockMatch({
          incentive: createMockIncentive({ jurisdiction_level: 'federal' }),
          estimatedValue: 1000000,
        }),
        createMockMatch({
          incentive: createMockIncentive({ jurisdiction_level: 'state' }),
          estimatedValue: 500000,
        }),
      ];

      const result = analyzeStackingOpportunities(matches);

      expect(result.summary.valueByJurisdiction.federal).toBe(1000000);
      expect(result.summary.valueByJurisdiction.state).toBe(500000);
    });

    it('should respect maxGroups limit', () => {
      const matches = Array.from({ length: 10 }, (_, i) =>
        createMockMatch({
          incentive: createMockIncentive({ id: `prog-${i}` }),
        })
      );

      const result = analyzeStackingOpportunities(matches, { maxGroups: 3 });

      expect(result.stackingGroups.length).toBeLessThanOrEqual(3);
    });
  });

  describe('canStack', () => {
    it('should return true for federal + state', () => {
      const federal = createMockMatch({
        incentive: createMockIncentive({ jurisdiction_level: 'federal' }),
      });

      const state = createMockMatch({
        incentive: createMockIncentive({ jurisdiction_level: 'state' }),
      });

      expect(canStack(federal, state)).toBe(true);
    });

    it('should return false when stackable flag is false', () => {
      const match1 = createMockMatch({
        incentive: createMockIncentive({ stackable: false }),
      });

      const match2 = createMockMatch({
        incentive: createMockIncentive(),
      });

      expect(canStack(match1, match2)).toBe(false);
    });

    it('should respect stacking restrictions', () => {
      const match1 = createMockMatch({
        incentive: createMockIncentive({
          id: '1',
          name: 'Program A',
          stacking_restrictions: ['Program B'],
        }),
      });

      const match2 = createMockMatch({
        incentive: createMockIncentive({
          id: '2',
          name: 'Program B',
        }),
      });

      expect(canStack(match1, match2)).toBe(false);
    });
  });

  describe('getStackingRules', () => {
    it('should return jurisdiction rules', () => {
      const rules = getStackingRules();

      expect(rules.jurisdictionRules.length).toBeGreaterThan(0);
      expect(rules.jurisdictionRules.some(r => r.typeA === 'federal' && r.typeB === 'state')).toBe(true);
    });

    it('should return incentive type rules', () => {
      const rules = getStackingRules();

      expect(rules.incentiveTypeRules.length).toBeGreaterThan(0);
      expect(rules.incentiveTypeRules.some(r => r.typeA === 'tax_credit' && r.typeB === 'grant')).toBe(true);
    });
  });

  describe('hasIRABonuses', () => {
    it('should detect IRA program by name', () => {
      const iraProgram = createMockIncentive({
        name: 'IRA Section 48 ITC',
      });

      expect(hasIRABonuses(iraProgram)).toBe(true);
    });

    it('should detect IRA program by bonuses', () => {
      const iraProgram = createMockIncentive({
        domestic_content_bonus: 0.10,
      });

      expect(hasIRABonuses(iraProgram)).toBe(true);
    });

    it('should return false for non-IRA program', () => {
      const regularProgram = createMockIncentive({
        name: 'State Grant Program',
        domestic_content_bonus: null,
        energy_community_bonus: null,
        prevailing_wage_bonus: null,
      });

      expect(hasIRABonuses(regularProgram)).toBe(false);
    });
  });
});
