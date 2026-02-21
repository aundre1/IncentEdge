/**
 * Tests for Direct Pay Checker (IRA Section 6417)
 */

import { describe, it, expect } from 'vitest';
import {
  checkDirectPayEligibility,
  estimateDirectPayValue,
  getDirectPayRegistrationInfo,
  type DirectPayEntity,
} from '@/lib/direct-pay-checker';

describe('Direct Pay Checker', () => {
  describe('checkDirectPayEligibility', () => {
    it('should approve tax-exempt nonprofit', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.eligibleCredits.length).toBeGreaterThan(0);
      expect(result.reason).toContain('nonprofit');
    });

    it('should approve municipal entity', () => {
      const entity: DirectPayEntity = {
        type: 'municipal',
        taxStatus: 'municipal',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('Municipal');
    });

    it('should approve state government', () => {
      const entity: DirectPayEntity = {
        type: 'state',
        taxStatus: 'municipal',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('State');
    });

    it('should approve tribal government', () => {
      const entity: DirectPayEntity = {
        type: 'tribal',
        taxStatus: 'tribal',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('tribal');
    });

    it('should approve rural electric cooperative', () => {
      const entity: DirectPayEntity = {
        type: 'rural-electric-coop',
        taxStatus: 'tax-exempt',
        isRuralElectricCoop: true,
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('Rural');
    });

    it('should approve TVA', () => {
      const entity: DirectPayEntity = {
        type: 'other',
        taxStatus: 'tax-exempt',
        isTVA: true,
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('Tennessee Valley Authority');
    });

    it('should approve Alaska Native Corporation', () => {
      const entity: DirectPayEntity = {
        type: 'other',
        taxStatus: 'tax-exempt',
        isAlaskaNativeCorp: true,
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(true);
      expect(result.reason).toContain('Alaska Native');
    });

    it('should reject for-profit entities', () => {
      const entity: DirectPayEntity = {
        type: 'for-profit',
        taxStatus: 'for-profit',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('not eligible');
      expect(result.notes).toContain('Section 6418');
    });

    it('should reject federal agencies', () => {
      const entity: DirectPayEntity = {
        type: 'federal',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(false);
    });

    it('should reject non-tax-exempt nonprofit', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'for-profit',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligible).toBe(false);
      expect(result.reason).toContain('tax-exempt');
    });

    it('should list all eligible credits', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.eligibleCredits).toContain('48');
      expect(result.eligibleCredits).toContain('45');
      expect(result.eligibleCredits).toContain('45V');
      expect(result.eligibleCredits).toContain('48E');
    });

    it('should filter to requested credits only', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity, ['48', '45']);

      expect(result.eligibleCredits).toEqual(['48', '45']);
    });

    it('should include registration requirements', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.requirements.length).toBeGreaterThan(0);
      expect(result.requirements.some(r => r.includes('Pre-filing registration'))).toBe(true);
    });

    it('should include helpful notes', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.notes.length).toBeGreaterThan(0);
      expect(result.notes.some(n => n.includes('501(c)(3)'))).toBe(true);
    });

    it('should include registration deadline', () => {
      const entity: DirectPayEntity = {
        type: 'nonprofit',
        taxStatus: 'tax-exempt',
      };

      const result = checkDirectPayEligibility(entity);

      expect(result.registrationDeadline).toBeDefined();
      expect(result.registrationDeadline).toContain('October');
    });
  });

  describe('estimateDirectPayValue', () => {
    it('should calculate Section 48 ITC correctly', () => {
      const result = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
      });

      expect(result.baseValue).toBe(3000000); // 30% of 10M
      expect(result.totalValue).toBeGreaterThan(result.baseValue);
      expect(result.breakdown.length).toBeGreaterThan(0);
    });

    it('should apply prevailing wage bonus for ITC', () => {
      const withWage = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
      });

      const withoutWage = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: false,
        meetsApprenticeship: false,
      });

      expect(withWage.totalValue).toBeGreaterThan(withoutWage.totalValue);
    });

    it('should apply energy community bonus', () => {
      const withCommunity = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
        inEnergyCommunity: true,
      });

      const withoutCommunity = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
        inEnergyCommunity: false,
      });

      expect(withCommunity.totalValue).toBeGreaterThan(withoutCommunity.totalValue);
    });

    it('should apply domestic content bonus', () => {
      const withDomestic = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        hasDomesticContent: true,
      });

      const withoutDomestic = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        hasDomesticContent: false,
      });

      expect(withDomestic.totalValue).toBeGreaterThan(withoutDomestic.totalValue);
    });

    it('should calculate Section 45 PTC correctly', () => {
      const result = estimateDirectPayValue('45', {
        electricityProduced: 1000000, // kWh
        meetsPrevailingWage: false,
        meetsApprenticeship: false,
      });

      expect(result.baseValue).toBeGreaterThan(0);
      expect(result.breakdown[0]).toContain('PTC');
    });

    it('should apply 5x multiplier for PTC with labor requirements', () => {
      const withLabor = estimateDirectPayValue('45', {
        electricityProduced: 1000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
      });

      const withoutLabor = estimateDirectPayValue('45', {
        electricityProduced: 1000000,
        meetsPrevailingWage: false,
        meetsApprenticeship: false,
      });

      expect(withLabor.totalValue).toBeGreaterThan(withoutLabor.totalValue * 4);
    });

    it('should calculate Section 45V hydrogen credit', () => {
      const result = estimateDirectPayValue('45V', {
        hydrogenProduced: 10000, // kg
      });

      expect(result.baseValue).toBeGreaterThan(0);
      expect(result.breakdown[0]).toContain('H2');
    });

    it('should calculate Section 45Q carbon capture', () => {
      const result = estimateDirectPayValue('45Q', {
        carbonCaptured: 10000, // metric tons
      });

      expect(result.baseValue).toBeGreaterThan(0);
      expect(result.breakdown[0]).toContain('CCUS');
    });

    it('should calculate Section 45W clean vehicles', () => {
      const result = estimateDirectPayValue('45W', {
        vehicleCount: 10,
      });

      expect(result.baseValue).toBe(75000); // 7500 * 10
    });

    it('should provide detailed breakdown', () => {
      const result = estimateDirectPayValue('48', {
        totalInvestment: 10000000,
        meetsPrevailingWage: true,
        meetsApprenticeship: true,
        inEnergyCommunity: true,
        hasDomesticContent: true,
      });

      expect(result.breakdown.length).toBeGreaterThan(3);
      expect(result.breakdown.some(b => b.includes('Base ITC'))).toBe(true);
      expect(result.breakdown.some(b => b.includes('bonus'))).toBe(true);
    });
  });

  describe('getDirectPayRegistrationInfo', () => {
    it('should return registration portal URL', () => {
      const info = getDirectPayRegistrationInfo();

      expect(info.portal).toContain('irs.gov');
    });

    it('should include registration requirements', () => {
      const info = getDirectPayRegistrationInfo();

      expect(info.requirements.length).toBeGreaterThan(0);
      expect(info.requirements.some(r => r.includes('registration number'))).toBe(true);
    });

    it('should include timeline information', () => {
      const info = getDirectPayRegistrationInfo();

      expect(info.timeline.length).toBeGreaterThan(0);
    });

    it('should include required documentation', () => {
      const info = getDirectPayRegistrationInfo();

      expect(info.documentation.length).toBeGreaterThan(0);
      expect(info.documentation.some(d => d.includes('EIN'))).toBe(true);
    });
  });
});
