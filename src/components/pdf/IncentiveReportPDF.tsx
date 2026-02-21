'use client';

/**
 * IncentiveReportPDF Component
 *
 * PDF document template using @react-pdf/renderer for client-side generation.
 * Renders a professional incentive analysis report with:
 * - Cover page and executive summary
 * - Matched incentives table
 * - Direct Pay eligibility section
 * - AI recommendations
 * - Next steps and disclaimers
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { ReportData, IncentiveItem, DirectPayInfo } from '@/lib/pdf-generator';

// Register fonts (using Helvetica as fallback - it's built into @react-pdf/renderer)
// For custom fonts, you can use Font.register() with external URLs

// IncentEdge brand colors
const colors = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#1e293b',
  textLight: '#64748b',
  background: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
};

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.text,
    backgroundColor: colors.white,
  },
  // Cover Page Styles
  coverPage: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 30,
    textAlign: 'center',
  },
  coverProjectName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  coverInfo: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 5,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 40,
    textAlign: 'center',
  },
  coverBranding: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 10,
    textAlign: 'center',
  },
  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    marginTop: 15,
  },
  // Summary Box Styles
  summaryBox: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 4,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textLight,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  // Table Styles
  table: {
    marginVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  // Column widths for incentives table
  colName: { width: '30%' },
  colCategory: { width: '15%' },
  colValue: { width: '18%' },
  colConfidence: { width: '12%' },
  colTimeline: { width: '25%' },
  // List Styles
  list: {
    marginVertical: 8,
    paddingLeft: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listBullet: {
    width: 15,
    fontSize: 10,
  },
  listNumber: {
    width: 15,
    fontSize: 9,
    color: colors.textLight,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  // Status badges
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
    color: colors.success,
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: colors.warning,
  },
  badgeDanger: {
    backgroundColor: '#fee2e2',
    color: colors.danger,
  },
  // Direct Pay Section
  directPayBox: {
    padding: 12,
    borderRadius: 4,
    marginVertical: 10,
  },
  directPayEligible: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  directPayIneligible: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  directPayTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  directPayText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  // Paragraph styles
  paragraph: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.textLight,
  },
  // Page break
  pageBreak: {
    marginTop: 'auto',
  },
  // Disclaimer styles
  disclaimer: {
    fontSize: 8,
    color: colors.textLight,
    lineHeight: 1.4,
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
});

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getConfidenceStyle(confidence: 'high' | 'medium' | 'low') {
  switch (confidence) {
    case 'high':
      return styles.badgeSuccess;
    case 'medium':
      return styles.badgeWarning;
    case 'low':
      return styles.badgeDanger;
    default:
      return {};
  }
}

// Component: Cover Page
function CoverPage({ data }: { data: ReportData }) {
  return (
    <Page size="LETTER" style={styles.coverPage}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.coverTitle}>INCENTIVE ANALYSIS REPORT</Text>
        <Text style={styles.coverSubtitle}>Comprehensive Incentive Discovery</Text>

        <View style={{ marginVertical: 30 }}>
          <Text style={styles.coverProjectName}>{data.projectName}</Text>
          <Text style={styles.coverInfo}>{data.summary.location}</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.coverInfo}>
            {data.summary.buildingType} | {data.summary.totalUnits} Units | {data.summary.totalSqft.toLocaleString()} SF
          </Text>
          <Text style={styles.coverInfo}>
            {data.summary.affordablePercentage}% Affordable
          </Text>
          {data.summary.totalDevelopmentCost && (
            <Text style={styles.coverInfo}>
              Total Development Cost: {formatFullCurrency(data.summary.totalDevelopmentCost)}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 50 }}>
          <Text style={[styles.highlightValue, { textAlign: 'center' }]}>
            {formatFullCurrency(data.incentiveSummary.totalEstimatedValue)}
          </Text>
          <Text style={styles.coverInfo}>Total Estimated Incentive Value</Text>
          <Text style={styles.coverInfo}>
            {data.incentiveSummary.incentiveCount} Programs Identified
          </Text>
        </View>
      </View>

      <View>
        <Text style={styles.coverDate}>Generated: {formatDate(data.generatedAt)}</Text>
        <Text style={styles.coverBranding}>Powered by IncentEdge</Text>
      </View>
    </Page>
  );
}

// Component: Executive Summary Page
function ExecutiveSummaryPage({ data }: { data: ReportData }) {
  const topIncentives = [...data.incentives]
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 5);

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionTitle}>Executive Summary</Text>

      {/* Value Highlight Box */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Estimated Incentive Value</Text>
          <Text style={styles.highlightValue}>
            {formatFullCurrency(data.incentiveSummary.totalEstimatedValue)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Programs Identified</Text>
          <Text style={styles.summaryValue}>{data.incentiveSummary.incentiveCount}</Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <Text style={styles.subsectionTitle}>Incentives by Category</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { width: '40%' }]}>Category</Text>
          <Text style={[styles.tableCellHeader, { width: '30%' }]}>Count</Text>
          <Text style={[styles.tableCellHeader, { width: '30%' }]}>Percentage</Text>
        </View>
        {[
          { name: 'Federal', count: data.incentiveSummary.byCategory.federal },
          { name: 'State', count: data.incentiveSummary.byCategory.state },
          { name: 'Local', count: data.incentiveSummary.byCategory.local },
          { name: 'Utility', count: data.incentiveSummary.byCategory.utility },
        ].map((cat, idx) => (
          <View key={cat.name} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, { width: '40%' }]}>{cat.name}</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>{cat.count}</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>
              {data.incentiveSummary.incentiveCount > 0
                ? `${Math.round((cat.count / data.incentiveSummary.incentiveCount) * 100)}%`
                : '0%'}
            </Text>
          </View>
        ))}
      </View>

      {/* Top Incentives */}
      <Text style={styles.subsectionTitle}>Top 5 Incentives by Value</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, styles.colName]}>Program</Text>
          <Text style={[styles.tableCellHeader, styles.colCategory]}>Category</Text>
          <Text style={[styles.tableCellHeader, styles.colValue]}>Est. Value</Text>
          <Text style={[styles.tableCellHeader, styles.colConfidence]}>Confidence</Text>
        </View>
        {topIncentives.map((inc, idx) => (
          <View key={inc.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, styles.colName]}>{inc.name}</Text>
            <Text style={[styles.tableCell, styles.colCategory]}>
              {inc.category.charAt(0).toUpperCase() + inc.category.slice(1)}
            </Text>
            <Text style={[styles.tableCell, styles.colValue]}>{formatCurrency(inc.estimatedValue)}</Text>
            <Text style={[styles.tableCell, styles.colConfidence, getConfidenceStyle(inc.confidence)]}>
              {inc.confidence.charAt(0).toUpperCase() + inc.confidence.slice(1)}
            </Text>
          </View>
        ))}
      </View>

      {/* Direct Pay Eligibility */}
      {data.directPayEligibility && (
        <DirectPaySection directPay={data.directPayEligibility} />
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>IncentEdge - Incentive Analysis Report</Text>
        <Text>Page 2</Text>
      </View>
    </Page>
  );
}

// Component: Direct Pay Section
function DirectPaySection({ directPay }: { directPay: DirectPayInfo }) {
  return (
    <View style={{ marginTop: 15 }}>
      <Text style={styles.subsectionTitle}>Direct Pay Eligibility (IRA Section 6417)</Text>
      <View
        style={[
          styles.directPayBox,
          directPay.eligible ? styles.directPayEligible : styles.directPayIneligible,
        ]}
      >
        <Text style={styles.directPayTitle}>
          {directPay.eligible ? 'Eligible for Direct Pay' : 'Not Eligible for Direct Pay'}
        </Text>
        <Text style={styles.directPayText}>{directPay.reason}</Text>

        {directPay.eligible && directPay.eligibleCredits.length > 0 && (
          <View style={styles.list}>
            <Text style={[styles.directPayText, { marginTop: 5, marginBottom: 3 }]}>
              Eligible Credits:
            </Text>
            {directPay.eligibleCredits.map((credit, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listBullet}>-</Text>
                <Text style={styles.listText}>Section {credit}</Text>
              </View>
            ))}
          </View>
        )}

        {directPay.estimatedValue && (
          <Text style={[styles.directPayText, { marginTop: 5, fontWeight: 'bold' }]}>
            Estimated Direct Pay Value: {formatFullCurrency(directPay.estimatedValue)}
          </Text>
        )}
      </View>
    </View>
  );
}

// Component: Incentive Matrix Page
function IncentiveMatrixPage({ data }: { data: ReportData }) {
  const categories: Array<'federal' | 'state' | 'local' | 'utility'> = ['federal', 'state', 'local', 'utility'];

  return (
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.sectionTitle}>Matched Incentives</Text>

      {categories.map((category) => {
        const categoryIncentives = data.incentives.filter((i) => i.category === category);
        if (categoryIncentives.length === 0) return null;

        return (
          <View key={category} style={styles.section}>
            <Text style={styles.subsectionTitle}>
              {category.charAt(0).toUpperCase() + category.slice(1)} Programs ({categoryIncentives.length})
            </Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCellHeader, styles.colName]}>Program</Text>
                <Text style={[styles.tableCellHeader, styles.colCategory]}>Type</Text>
                <Text style={[styles.tableCellHeader, styles.colValue]}>Est. Value</Text>
                <Text style={[styles.tableCellHeader, styles.colConfidence]}>Confidence</Text>
                <Text style={[styles.tableCellHeader, styles.colTimeline]}>Timeline</Text>
              </View>
              {categoryIncentives.map((inc, idx) => (
                <View key={inc.id} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, styles.colName]}>{inc.name}</Text>
                  <Text style={[styles.tableCell, styles.colCategory]}>{inc.type}</Text>
                  <Text style={[styles.tableCell, styles.colValue]}>{formatCurrency(inc.estimatedValue)}</Text>
                  <Text style={[styles.tableCell, styles.colConfidence]}>
                    {inc.confidence.charAt(0).toUpperCase() + inc.confidence.slice(1)}
                  </Text>
                  <Text style={[styles.tableCell, styles.colTimeline]}>{inc.timeline}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>IncentEdge - Incentive Analysis Report</Text>
        <Text>Page 3</Text>
      </View>
    </Page>
  );
}

// Component: Recommendations Page
function RecommendationsPage({ data }: { data: ReportData }) {
  // Collect all next steps from incentives
  const allNextSteps = data.incentives
    .flatMap((inc) => inc.nextSteps.map((step) => ({ incentive: inc.name, step })))
    .slice(0, 15);

  return (
    <Page size="LETTER" style={styles.page}>
      {/* AI Recommendations */}
      {data.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Recommendations</Text>
          <View style={styles.list}>
            {data.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={styles.listNumber}>{idx + 1}.</Text>
                <Text style={styles.listText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Next Steps */}
      {allNextSteps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <Text style={styles.paragraph}>
            The following action items are recommended to maximize your incentive capture:
          </Text>
          <View style={styles.list}>
            {allNextSteps.map((item, idx) => (
              <View key={idx} style={[styles.listItem, { marginBottom: 6 }]}>
                <Text style={styles.listBullet}>-</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.listText, { fontWeight: 'bold' }]}>{item.incentive}</Text>
                  <Text style={styles.listText}>{item.step}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Disclaimers & Notes</Text>
        <Text>
          This report is for informational purposes only and does not constitute financial, legal, or tax advice.
          All incentive values are estimates based on available information and project parameters provided.
        </Text>
        <Text style={{ marginTop: 5 }}>Key Assumptions:</Text>
        <Text>- Incentive values are estimates and may vary based on final project specifications</Text>
        <Text>- Eligibility is preliminary and subject to formal application review</Text>
        <Text>- Deadlines and program availability are subject to change</Text>
        <Text>- Stacking of multiple incentives may be subject to restrictions</Text>
        <Text>- Tax credits assume sufficient tax liability unless Direct Pay is utilized</Text>
        <Text style={{ marginTop: 5 }}>
          For the most current information, always verify with the administering agency before making financial decisions.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>IncentEdge - Incentive Analysis Report</Text>
        <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
      </View>
    </Page>
  );
}

// Main PDF Document Component
export interface IncentiveReportPDFProps {
  report: ReportData;
}

export function IncentiveReportPDF({ report }: IncentiveReportPDFProps) {
  return (
    <Document
      title={`Incentive Analysis - ${report.projectName}`}
      subject="Incentive Analysis Report"
      author="IncentEdge"
      creator="IncentEdge Platform"
      producer="@react-pdf/renderer"
    >
      <CoverPage data={report} />
      <ExecutiveSummaryPage data={report} />
      <IncentiveMatrixPage data={report} />
      <RecommendationsPage data={report} />
    </Document>
  );
}

export default IncentiveReportPDF;
