/**
 * PDF Report Generator for IncentEdge
 *
 * Generates investor-ready PDF reports using jsPDF.
 * Creates professional incentive analysis reports with:
 * - Executive Summary
 * - Incentive Matrix
 * - Application Checklist
 * - Value Estimates
 *
 * Usage:
 * ```ts
 * const pdf = generateIncentiveReport(reportData);
 * const blob = pdf.output('blob');
 * ```
 */

// Note: jsPDF is a client-side library. For server-side PDF generation,
// we generate structured data that can be rendered client-side.

export interface ReportData {
  projectName: string;
  generatedAt: string;
  summary: {
    location: string;
    buildingType: string;
    totalUnits: number;
    totalSqft: number;
    affordablePercentage: number;
    totalDevelopmentCost?: number;
  };
  incentiveSummary: {
    totalEstimatedValue: number;
    incentiveCount: number;
    byCategory: {
      federal: number;
      state: number;
      local: number;
      utility: number;
    };
  };
  incentives: IncentiveItem[];
  recommendations: string[];
  checklist?: ChecklistSection[];
  directPayEligibility?: DirectPayInfo;
}

export interface IncentiveItem {
  id: string;
  name: string;
  category: 'federal' | 'state' | 'local' | 'utility';
  type: string;
  estimatedValue: number;
  confidence: 'high' | 'medium' | 'low';
  timeline: string;
  requirements: RequirementItem[];
  nextSteps: string[];
}

export interface RequirementItem {
  requirement: string;
  status: 'met' | 'pending' | 'not_met' | 'review_needed';
  notes?: string;
}

export interface ChecklistSection {
  phase: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  item: string;
  status: 'pending' | 'in_progress' | 'completed' | 'n/a';
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface DirectPayInfo {
  eligible: boolean;
  reason: string;
  eligibleCredits: string[];
  estimatedValue?: number;
}

/**
 * PDF Report structure for client-side rendering
 *
 * Returns structured data that can be rendered with jsPDF on the client.
 * This approach avoids server-side PDF generation complexity.
 */
export interface PDFReportStructure {
  metadata: {
    title: string;
    subject: string;
    author: string;
    createdAt: string;
    version: string;
  };
  pages: PDFPage[];
  styles: PDFStyles;
}

export interface PDFPage {
  type: 'cover' | 'summary' | 'matrix' | 'detail' | 'checklist' | 'appendix';
  title: string;
  sections: PDFSection[];
}

export interface PDFSection {
  type: 'header' | 'paragraph' | 'table' | 'list' | 'chart' | 'spacer';
  content: unknown;
  style?: Partial<PDFStyles>;
}

export interface PDFStyles {
  fontFamily: string;
  fontSize: {
    title: number;
    heading: number;
    subheading: number;
    body: number;
    small: number;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    text: string;
    textLight: string;
    background: string;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const DEFAULT_STYLES: PDFStyles = {
  fontFamily: 'helvetica',
  fontSize: {
    title: 24,
    heading: 16,
    subheading: 12,
    body: 10,
    small: 8,
  },
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: '#1e293b',
    textLight: '#64748b',
    background: '#f8fafc',
  },
  margins: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  },
};

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Format full currency value
 */
function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Get status color
 */
function getStatusColor(status: string, styles: PDFStyles): string {
  switch (status) {
    case 'met':
    case 'completed':
    case 'high':
      return styles.colors.success;
    case 'pending':
    case 'in_progress':
    case 'medium':
      return styles.colors.warning;
    case 'not_met':
    case 'low':
      return styles.colors.danger;
    default:
      return styles.colors.textLight;
  }
}

/**
 * Generate cover page
 */
function generateCoverPage(data: ReportData, styles: PDFStyles): PDFPage {
  return {
    type: 'cover',
    title: 'Cover',
    sections: [
      { type: 'spacer', content: { height: 100 } },
      {
        type: 'header',
        content: {
          text: 'INCENTIVE ANALYSIS REPORT',
          level: 1,
          align: 'center',
        },
      },
      { type: 'spacer', content: { height: 20 } },
      {
        type: 'header',
        content: {
          text: data.projectName,
          level: 2,
          align: 'center',
        },
        style: { colors: { ...styles.colors, text: styles.colors.primary } },
      },
      { type: 'spacer', content: { height: 40 } },
      {
        type: 'paragraph',
        content: {
          text: data.summary.location,
          align: 'center',
        },
      },
      { type: 'spacer', content: { height: 60 } },
      {
        type: 'table',
        content: {
          headers: [],
          rows: [
            ['Building Type', data.summary.buildingType],
            ['Total Units', data.summary.totalUnits.toString()],
            ['Total Sq Ft', data.summary.totalSqft.toLocaleString()],
            ['Affordable %', `${data.summary.affordablePercentage}%`],
            ['Total Development Cost', data.summary.totalDevelopmentCost
              ? formatFullCurrency(data.summary.totalDevelopmentCost)
              : 'TBD'],
          ],
          style: 'summary',
        },
      },
      { type: 'spacer', content: { height: 80 } },
      {
        type: 'paragraph',
        content: {
          text: `Generated: ${new Date(data.generatedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          align: 'center',
        },
        style: { fontSize: { ...styles.fontSize, body: styles.fontSize.small } },
      },
      {
        type: 'paragraph',
        content: {
          text: 'Powered by IncentEdge',
          align: 'center',
        },
        style: {
          fontSize: { ...styles.fontSize, body: styles.fontSize.small },
          colors: { ...styles.colors, text: styles.colors.textLight },
        },
      },
    ],
  };
}

/**
 * Generate executive summary page
 */
function generateSummaryPage(data: ReportData, styles: PDFStyles): PDFPage {
  const sections: PDFSection[] = [
    {
      type: 'header',
      content: { text: 'Executive Summary', level: 1 },
    },
    { type: 'spacer', content: { height: 20 } },
  ];

  // Total Value Highlight
  sections.push({
    type: 'table',
    content: {
      headers: [],
      rows: [
        ['Total Estimated Incentive Value', formatFullCurrency(data.incentiveSummary.totalEstimatedValue)],
        ['Number of Programs Identified', data.incentiveSummary.incentiveCount.toString()],
      ],
      style: 'highlight',
    },
  });

  sections.push({ type: 'spacer', content: { height: 20 } });

  // By Category Breakdown
  sections.push({
    type: 'header',
    content: { text: 'Incentives by Category', level: 2 },
  });

  sections.push({
    type: 'table',
    content: {
      headers: ['Category', 'Count', 'Percentage'],
      rows: [
        ['Federal', data.incentiveSummary.byCategory.federal.toString(),
          `${((data.incentiveSummary.byCategory.federal / data.incentiveSummary.incentiveCount) * 100).toFixed(0)}%`],
        ['State', data.incentiveSummary.byCategory.state.toString(),
          `${((data.incentiveSummary.byCategory.state / data.incentiveSummary.incentiveCount) * 100).toFixed(0)}%`],
        ['Local', data.incentiveSummary.byCategory.local.toString(),
          `${((data.incentiveSummary.byCategory.local / data.incentiveSummary.incentiveCount) * 100).toFixed(0)}%`],
        ['Utility', data.incentiveSummary.byCategory.utility.toString(),
          `${((data.incentiveSummary.byCategory.utility / data.incentiveSummary.incentiveCount) * 100).toFixed(0)}%`],
      ],
      style: 'striped',
    },
  });

  sections.push({ type: 'spacer', content: { height: 20 } });

  // Top Incentives
  const topIncentives = data.incentives
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 5);

  sections.push({
    type: 'header',
    content: { text: 'Top 5 Incentives by Value', level: 2 },
  });

  sections.push({
    type: 'table',
    content: {
      headers: ['Program', 'Category', 'Est. Value', 'Confidence'],
      rows: topIncentives.map(inc => [
        inc.name,
        inc.category.charAt(0).toUpperCase() + inc.category.slice(1),
        formatCurrency(inc.estimatedValue),
        inc.confidence.charAt(0).toUpperCase() + inc.confidence.slice(1),
      ]),
      style: 'bordered',
    },
  });

  // Direct Pay Eligibility (if applicable)
  if (data.directPayEligibility) {
    sections.push({ type: 'spacer', content: { height: 20 } });
    sections.push({
      type: 'header',
      content: { text: 'Direct Pay Eligibility (IRA Section 6417)', level: 2 },
    });

    sections.push({
      type: 'paragraph',
      content: {
        text: data.directPayEligibility.eligible
          ? `✓ Eligible: ${data.directPayEligibility.reason}`
          : `✗ Not Eligible: ${data.directPayEligibility.reason}`,
      },
      style: {
        colors: {
          ...styles.colors,
          text: data.directPayEligibility.eligible ? styles.colors.success : styles.colors.danger,
        },
      },
    });

    if (data.directPayEligibility.eligible && data.directPayEligibility.eligibleCredits.length > 0) {
      sections.push({
        type: 'list',
        content: {
          items: data.directPayEligibility.eligibleCredits.map(c => `Section ${c}`),
          style: 'bullet',
        },
      });
    }
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    sections.push({ type: 'spacer', content: { height: 20 } });
    sections.push({
      type: 'header',
      content: { text: 'Key Recommendations', level: 2 },
    });
    sections.push({
      type: 'list',
      content: {
        items: data.recommendations,
        style: 'numbered',
      },
    });
  }

  return {
    type: 'summary',
    title: 'Executive Summary',
    sections,
  };
}

/**
 * Generate incentive matrix page
 */
function generateMatrixPage(data: ReportData, styles: PDFStyles): PDFPage {
  const sections: PDFSection[] = [
    {
      type: 'header',
      content: { text: 'Incentive Matrix', level: 1 },
    },
    { type: 'spacer', content: { height: 20 } },
  ];

  // Group incentives by category
  const categories: Array<'federal' | 'state' | 'local' | 'utility'> = ['federal', 'state', 'local', 'utility'];

  for (const category of categories) {
    const categoryIncentives = data.incentives.filter(i => i.category === category);
    if (categoryIncentives.length === 0) continue;

    sections.push({
      type: 'header',
      content: {
        text: `${category.charAt(0).toUpperCase() + category.slice(1)} Programs`,
        level: 2,
      },
    });

    sections.push({
      type: 'table',
      content: {
        headers: ['Program', 'Type', 'Est. Value', 'Timeline', 'Status'],
        rows: categoryIncentives.map(inc => {
          const reqStatus = inc.requirements.every(r => r.status === 'met')
            ? 'Ready'
            : inc.requirements.some(r => r.status === 'not_met')
              ? 'Review Needed'
              : 'In Progress';

          return [
            inc.name,
            inc.type,
            formatCurrency(inc.estimatedValue),
            inc.timeline,
            reqStatus,
          ];
        }),
        style: 'bordered',
      },
    });

    sections.push({ type: 'spacer', content: { height: 15 } });
  }

  return {
    type: 'matrix',
    title: 'Incentive Matrix',
    sections,
  };
}

/**
 * Generate detail pages for each major incentive
 */
function generateDetailPages(data: ReportData, styles: PDFStyles): PDFPage[] {
  const pages: PDFPage[] = [];

  // Only generate detail pages for high-value incentives
  const majorIncentives = data.incentives
    .filter(i => i.estimatedValue >= 100000 || i.confidence === 'high')
    .slice(0, 10);

  for (const incentive of majorIncentives) {
    const sections: PDFSection[] = [
      {
        type: 'header',
        content: { text: incentive.name, level: 1 },
      },
      { type: 'spacer', content: { height: 10 } },
      {
        type: 'table',
        content: {
          headers: [],
          rows: [
            ['Category', incentive.category.charAt(0).toUpperCase() + incentive.category.slice(1)],
            ['Type', incentive.type],
            ['Estimated Value', formatFullCurrency(incentive.estimatedValue)],
            ['Confidence', incentive.confidence.charAt(0).toUpperCase() + incentive.confidence.slice(1)],
            ['Timeline', incentive.timeline],
          ],
          style: 'summary',
        },
      },
      { type: 'spacer', content: { height: 15 } },
    ];

    // Requirements
    if (incentive.requirements.length > 0) {
      sections.push({
        type: 'header',
        content: { text: 'Requirements', level: 2 },
      });

      sections.push({
        type: 'table',
        content: {
          headers: ['Requirement', 'Status', 'Notes'],
          rows: incentive.requirements.map(req => [
            req.requirement,
            req.status.replace('_', ' ').toUpperCase(),
            req.notes || '-',
          ]),
          style: 'bordered',
        },
      });

      sections.push({ type: 'spacer', content: { height: 15 } });
    }

    // Next Steps
    if (incentive.nextSteps.length > 0) {
      sections.push({
        type: 'header',
        content: { text: 'Next Steps', level: 2 },
      });

      sections.push({
        type: 'list',
        content: {
          items: incentive.nextSteps,
          style: 'numbered',
        },
      });
    }

    pages.push({
      type: 'detail',
      title: incentive.name,
      sections,
    });
  }

  return pages;
}

/**
 * Generate checklist page
 */
function generateChecklistPage(data: ReportData, styles: PDFStyles): PDFPage | null {
  if (!data.checklist || data.checklist.length === 0) return null;

  const sections: PDFSection[] = [
    {
      type: 'header',
      content: { text: 'Application Checklist', level: 1 },
    },
    { type: 'spacer', content: { height: 20 } },
  ];

  for (const section of data.checklist) {
    sections.push({
      type: 'header',
      content: { text: section.phase, level: 2 },
    });

    sections.push({
      type: 'table',
      content: {
        headers: ['Item', 'Deadline', 'Priority', 'Status'],
        rows: section.items.map(item => [
          item.item,
          item.deadline,
          item.priority.toUpperCase(),
          item.status.replace('_', ' ').toUpperCase(),
        ]),
        style: 'bordered',
      },
    });

    sections.push({ type: 'spacer', content: { height: 15 } });
  }

  return {
    type: 'checklist',
    title: 'Application Checklist',
    sections,
  };
}

/**
 * Generate appendix page with disclaimers
 */
function generateAppendixPage(styles: PDFStyles): PDFPage {
  return {
    type: 'appendix',
    title: 'Appendix',
    sections: [
      {
        type: 'header',
        content: { text: 'Disclaimers & Notes', level: 1 },
      },
      { type: 'spacer', content: { height: 20 } },
      {
        type: 'paragraph',
        content: {
          text: 'This report is for informational purposes only and does not constitute financial, legal, or tax advice. All incentive values are estimates based on available information and project parameters provided.',
        },
        style: { fontSize: { ...styles.fontSize, body: styles.fontSize.small } },
      },
      { type: 'spacer', content: { height: 10 } },
      {
        type: 'paragraph',
        content: {
          text: 'Key Assumptions:',
        },
      },
      {
        type: 'list',
        content: {
          items: [
            'Incentive values are estimates and may vary based on final project specifications',
            'Eligibility is preliminary and subject to formal application review',
            'Deadlines and program availability are subject to change',
            'Stacking of multiple incentives may be subject to restrictions',
            'Tax credits assume sufficient tax liability unless Direct Pay is utilized',
          ],
          style: 'bullet',
        },
        style: { fontSize: { ...styles.fontSize, body: styles.fontSize.small } },
      },
      { type: 'spacer', content: { height: 20 } },
      {
        type: 'paragraph',
        content: {
          text: 'For the most current information, always verify with the administering agency before making financial decisions.',
        },
        style: {
          fontSize: { ...styles.fontSize, body: styles.fontSize.small },
          colors: { ...styles.colors, text: styles.colors.textLight },
        },
      },
      { type: 'spacer', content: { height: 40 } },
      {
        type: 'paragraph',
        content: {
          text: '© 2026 IncentEdge. All rights reserved.',
          align: 'center',
        },
        style: {
          fontSize: { ...styles.fontSize, body: styles.fontSize.small },
          colors: { ...styles.colors, text: styles.colors.textLight },
        },
      },
    ],
  };
}

/**
 * Main function to generate PDF report structure
 *
 * This returns a structured object that can be rendered client-side with jsPDF
 * or converted to other formats.
 */
export function generatePDFReportStructure(data: ReportData): PDFReportStructure {
  const styles = DEFAULT_STYLES;

  const pages: PDFPage[] = [
    generateCoverPage(data, styles),
    generateSummaryPage(data, styles),
    generateMatrixPage(data, styles),
    ...generateDetailPages(data, styles),
  ];

  const checklistPage = generateChecklistPage(data, styles);
  if (checklistPage) {
    pages.push(checklistPage);
  }

  pages.push(generateAppendixPage(styles));

  return {
    metadata: {
      title: `Incentive Analysis - ${data.projectName}`,
      subject: 'Incentive Analysis Report',
      author: 'IncentEdge',
      createdAt: data.generatedAt,
      version: '1.0.0',
    },
    pages,
    styles,
  };
}

/**
 * Convert report structure to HTML for printing or preview
 */
export function generateHTMLReport(structure: PDFReportStructure): string {
  const { metadata, pages, styles } = structure;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title}</title>
  <style>
    @page { size: letter; margin: 0.5in; }
    @media print {
      .page-break { page-break-after: always; }
    }
    body {
      font-family: ${styles.fontFamily}, sans-serif;
      font-size: ${styles.fontSize.body}pt;
      color: ${styles.colors.text};
      line-height: 1.4;
      margin: 0;
      padding: 20px;
    }
    .page {
      max-width: 8.5in;
      margin: 0 auto 40px;
      padding: 40px;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { font-size: ${styles.fontSize.title}pt; color: ${styles.colors.primary}; margin: 0 0 20px; }
    h2 { font-size: ${styles.fontSize.heading}pt; color: ${styles.colors.text}; margin: 20px 0 10px; }
    h3 { font-size: ${styles.fontSize.subheading}pt; color: ${styles.colors.secondary}; margin: 15px 0 8px; }
    p { margin: 8px 0; }
    .text-center { text-align: center; }
    .text-muted { color: ${styles.colors.textLight}; }
    .text-success { color: ${styles.colors.success}; }
    .text-warning { color: ${styles.colors.warning}; }
    .text-danger { color: ${styles.colors.danger}; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th { background: ${styles.colors.background}; font-weight: 600; }
    .table-bordered th, .table-bordered td { border: 1px solid #e2e8f0; }
    .table-striped tr:nth-child(even) { background: ${styles.colors.background}; }
    .table-highlight td:last-child { font-weight: 600; color: ${styles.colors.primary}; }
    .table-summary { width: auto; }
    .table-summary td:first-child { font-weight: 500; padding-right: 40px; }
    ul, ol { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    .spacer { height: 20px; }
    .cover-page { text-align: center; padding-top: 100px; }
    .cover-page h1 { font-size: 32pt; }
    .cover-page h2 { font-size: 24pt; color: ${styles.colors.primary}; }
  </style>
</head>
<body>
`;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const pageClass = page.type === 'cover' ? 'page cover-page' : 'page';

    html += `<div class="${pageClass}">`;

    for (const section of page.sections) {
      html += renderSection(section, styles);
    }

    html += '</div>';

    if (i < pages.length - 1) {
      html += '<div class="page-break"></div>';
    }
  }

  html += '</body></html>';
  return html;
}

/**
 * Render a single section to HTML
 */
function renderSection(section: PDFSection, styles: PDFStyles): string {
  const sectionStyles = { ...styles, ...section.style };

  switch (section.type) {
    case 'header': {
      const content = section.content as { text: string; level: number; align?: string };
      const tag = `h${content.level}`;
      const alignClass = content.align === 'center' ? ' class="text-center"' : '';
      return `<${tag}${alignClass}>${content.text}</${tag}>`;
    }

    case 'paragraph': {
      const content = section.content as { text: string; align?: string };
      const alignClass = content.align === 'center' ? ' class="text-center"' : '';
      return `<p${alignClass}>${content.text}</p>`;
    }

    case 'table': {
      const content = section.content as {
        headers: string[];
        rows: string[][];
        style?: string;
      };

      let tableClass = 'table';
      if (content.style === 'bordered') tableClass += ' table-bordered';
      if (content.style === 'striped') tableClass += ' table-striped';
      if (content.style === 'highlight') tableClass += ' table-highlight';
      if (content.style === 'summary') tableClass += ' table-summary';

      let html = `<table class="${tableClass}">`;

      if (content.headers.length > 0) {
        html += '<thead><tr>';
        for (const header of content.headers) {
          html += `<th>${header}</th>`;
        }
        html += '</tr></thead>';
      }

      html += '<tbody>';
      for (const row of content.rows) {
        html += '<tr>';
        for (const cell of row) {
          html += `<td>${cell}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table>';

      return html;
    }

    case 'list': {
      const content = section.content as { items: string[]; style: 'bullet' | 'numbered' };
      const tag = content.style === 'numbered' ? 'ol' : 'ul';

      let html = `<${tag}>`;
      for (const item of content.items) {
        html += `<li>${item}</li>`;
      }
      html += `</${tag}>`;

      return html;
    }

    case 'spacer': {
      const content = section.content as { height: number };
      return `<div class="spacer" style="height: ${content.height}px;"></div>`;
    }

    default:
      return '';
  }
}

/**
 * Generate a simple text-based report for fallback
 */
export function generateTextReport(data: ReportData): string {
  const lines: string[] = [];

  lines.push('═'.repeat(60));
  lines.push('INCENTIVE ANALYSIS REPORT');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`Project: ${data.projectName}`);
  lines.push(`Location: ${data.summary.location}`);
  lines.push(`Generated: ${new Date(data.generatedAt).toLocaleDateString()}`);
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('EXECUTIVE SUMMARY');
  lines.push('─'.repeat(60));
  lines.push('');
  lines.push(`Total Estimated Value: ${formatFullCurrency(data.incentiveSummary.totalEstimatedValue)}`);
  lines.push(`Programs Identified: ${data.incentiveSummary.incentiveCount}`);
  lines.push('');
  lines.push('By Category:');
  lines.push(`  Federal: ${data.incentiveSummary.byCategory.federal}`);
  lines.push(`  State: ${data.incentiveSummary.byCategory.state}`);
  lines.push(`  Local: ${data.incentiveSummary.byCategory.local}`);
  lines.push(`  Utility: ${data.incentiveSummary.byCategory.utility}`);
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('TOP INCENTIVES');
  lines.push('─'.repeat(60));
  lines.push('');

  const topIncentives = data.incentives
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 10);

  for (const inc of topIncentives) {
    lines.push(`${inc.name}`);
    lines.push(`  Category: ${inc.category} | Type: ${inc.type}`);
    lines.push(`  Estimated Value: ${formatFullCurrency(inc.estimatedValue)}`);
    lines.push(`  Confidence: ${inc.confidence}`);
    lines.push('');
  }

  if (data.recommendations.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('RECOMMENDATIONS');
    lines.push('─'.repeat(60));
    lines.push('');
    data.recommendations.forEach((rec, i) => {
      lines.push(`${i + 1}. ${rec}`);
    });
    lines.push('');
  }

  lines.push('─'.repeat(60));
  lines.push('DISCLAIMER');
  lines.push('─'.repeat(60));
  lines.push('');
  lines.push('This report is for informational purposes only.');
  lines.push('Always verify with administering agencies before proceeding.');
  lines.push('');
  lines.push('═'.repeat(60));
  lines.push('Generated by IncentEdge');
  lines.push('═'.repeat(60));

  return lines.join('\n');
}
