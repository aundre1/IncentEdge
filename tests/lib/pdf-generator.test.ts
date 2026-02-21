/**
 * Tests for PDF Generator
 */

import { describe, it, expect } from 'vitest';
import {
  generatePDFReportStructure,
  generateHTMLReport,
  generateTextReport,
  type ReportData,
} from '@/lib/pdf-generator';

describe('PDF Generator', () => {
  const mockReportData: ReportData = {
    projectName: 'Test Project',
    generatedAt: '2026-01-01T00:00:00Z',
    summary: {
      location: 'Brooklyn, NY',
      buildingType: 'Multifamily',
      totalUnits: 100,
      totalSqft: 75000,
      affordablePercentage: 60,
      totalDevelopmentCost: 25000000,
    },
    incentiveSummary: {
      totalEstimatedValue: 5000000,
      incentiveCount: 10,
      byCategory: {
        federal: 3,
        state: 4,
        local: 2,
        utility: 1,
      },
    },
    incentives: [
      {
        id: '1',
        name: 'Federal ITC',
        category: 'federal',
        type: 'tax_credit',
        estimatedValue: 2000000,
        confidence: 'high',
        timeline: 'Q2 2026',
        requirements: [
          { requirement: 'Submit Form 3468', status: 'pending' },
        ],
        nextSteps: ['Complete application', 'Submit documentation'],
      },
    ],
    recommendations: [
      'Apply for Federal ITC first',
      'Consider stacking with state programs',
    ],
  };

  describe('generatePDFReportStructure', () => {
    it('should generate valid PDF structure', () => {
      const structure = generatePDFReportStructure(mockReportData);

      expect(structure).toBeDefined();
      expect(structure.metadata.title).toContain('Test Project');
      expect(structure.pages.length).toBeGreaterThan(0);
    });

    it('should include cover page', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const coverPage = structure.pages.find(p => p.type === 'cover');

      expect(coverPage).toBeDefined();
      expect(coverPage?.sections.length).toBeGreaterThan(0);
    });

    it('should include summary page', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const summaryPage = structure.pages.find(p => p.type === 'summary');

      expect(summaryPage).toBeDefined();
    });

    it('should include incentive matrix', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const matrixPage = structure.pages.find(p => p.type === 'matrix');

      expect(matrixPage).toBeDefined();
    });

    it('should include detail pages for high-value incentives', () => {
      const highValueData: ReportData = {
        ...mockReportData,
        incentives: [
          {
            ...mockReportData.incentives[0],
            estimatedValue: 500000,
            confidence: 'high',
          },
        ],
      };

      const structure = generatePDFReportStructure(highValueData);
      const detailPages = structure.pages.filter(p => p.type === 'detail');

      expect(detailPages.length).toBeGreaterThan(0);
    });

    it('should include appendix page', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const appendixPage = structure.pages.find(p => p.type === 'appendix');

      expect(appendixPage).toBeDefined();
    });

    it('should include checklist if provided', () => {
      const dataWithChecklist: ReportData = {
        ...mockReportData,
        checklist: [
          {
            phase: 'Pre-Application',
            items: [
              {
                item: 'Gather documentation',
                status: 'pending',
                deadline: '2026-03-01',
                priority: 'high',
              },
            ],
          },
        ],
      };

      const structure = generatePDFReportStructure(dataWithChecklist);
      const checklistPage = structure.pages.find(p => p.type === 'checklist');

      expect(checklistPage).toBeDefined();
    });

    it('should include direct pay eligibility if provided', () => {
      const dataWithDirectPay: ReportData = {
        ...mockReportData,
        directPayEligibility: {
          eligible: true,
          reason: 'Tax-exempt nonprofit',
          eligibleCredits: ['48', '45'],
          estimatedValue: 1000000,
        },
      };

      const structure = generatePDFReportStructure(dataWithDirectPay);
      const summaryPage = structure.pages.find(p => p.type === 'summary');

      expect(summaryPage?.sections.some(s =>
        s.type === 'header' && s.content.text?.includes('Direct Pay')
      )).toBe(true);
    });
  });

  describe('generateHTMLReport', () => {
    it('should generate valid HTML', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const html = generateHTMLReport(structure);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain(mockReportData.projectName);
    });

    it('should include CSS styles', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const html = generateHTMLReport(structure);

      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
    });

    it('should render all pages', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const html = generateHTMLReport(structure);

      expect(html).toContain('Test Project');
      expect(html).toContain('Executive Summary');
    });

    it('should include page breaks', () => {
      const structure = generatePDFReportStructure(mockReportData);
      const html = generateHTMLReport(structure);

      expect(html).toContain('page-break');
    });
  });

  describe('generateTextReport', () => {
    it('should generate plain text report', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('INCENTIVE ANALYSIS REPORT');
      expect(text).toContain(mockReportData.projectName);
      expect(text).toContain('EXECUTIVE SUMMARY');
    });

    it('should include total estimated value', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('Total Estimated Value');
      expect(text).toContain('$5,000,000');
    });

    it('should include category breakdown', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('By Category:');
      expect(text).toContain('Federal: 3');
      expect(text).toContain('State: 4');
    });

    it('should include top incentives', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('TOP INCENTIVES');
      expect(text).toContain('Federal ITC');
    });

    it('should include recommendations', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('RECOMMENDATIONS');
      expect(text).toContain('Apply for Federal ITC first');
    });

    it('should include disclaimer', () => {
      const text = generateTextReport(mockReportData);

      expect(text).toContain('DISCLAIMER');
      expect(text).toContain('informational purposes only');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty incentives array', () => {
      const emptyData: ReportData = {
        ...mockReportData,
        incentives: [],
      };

      const structure = generatePDFReportStructure(emptyData);
      expect(structure.pages.length).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const minimalData: ReportData = {
        ...mockReportData,
        recommendations: [],
        checklist: undefined,
        directPayEligibility: undefined,
      };

      const structure = generatePDFReportStructure(minimalData);
      expect(structure).toBeDefined();
    });
  });
});
