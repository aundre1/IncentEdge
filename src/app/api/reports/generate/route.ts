/**
 * Report Generation API
 *
 * Generate project-specific incentive reports.
 *
 * POST /api/reports/generate
 * Body: { projectId, projectData, reportType, format }
 *
 * Supported formats:
 * - json (default): Returns structured report data
 * - html: Returns printable HTML document
 * - pdf: Returns PDF structure for client-side rendering
 *
 * Returns: Report data in requested format
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generatePDFReportStructure,
  generateHTMLReport,
  generateTextReport,
  type ReportData,
  type IncentiveItem,
  type ChecklistSection,
} from '@/lib/pdf-generator';

interface ReportRequest {
  projectId?: string;
  projectName: string;
  projectData: {
    address?: string;
    city?: string;
    state: string;
    county?: string;
    buildingType: string;
    totalUnits?: number;
    totalSqft?: number;
    affordablePercentage?: number;
    totalDevelopmentCost?: number;
    equityInvestment?: number;
    sustainabilityTier?: string;
    entityType?: string;
    taxExempt?: boolean;
  };
  reportType: 'executive_summary' | 'full_analysis' | 'incentive_matrix' | 'application_checklist';
  format?: 'json' | 'html' | 'pdf' | 'text';
  includeCharts?: boolean;
  includeDirectPay?: boolean;
}

function generateExecutiveSummary(data: ReportRequest['projectData']) {
  const incentives = [];
  let totalValue = 0;

  // Federal incentives
  if (data.totalUnits && data.totalUnits > 0) {
    const value45L = data.totalUnits * 2500;
    incentives.push({
      name: 'Section 45L Tax Credit',
      category: 'Federal',
      estimatedValue: value45L,
      confidence: 'High',
      timeline: 'At placed in service',
    });
    totalValue += value45L;
  }

  if (data.totalSqft && data.totalSqft > 0) {
    const value179D = data.totalSqft * 2.5;
    incentives.push({
      name: 'Section 179D Deduction',
      category: 'Federal',
      estimatedValue: value179D,
      confidence: 'High',
      timeline: 'At placed in service',
    });
    totalValue += value179D;
  }

  if (data.affordablePercentage && data.affordablePercentage >= 20) {
    const qualifiedBasis = (data.totalDevelopmentCost || 0) * 0.7;
    const lihtcValue = qualifiedBasis * 0.04 * 10;
    incentives.push({
      name: 'LIHTC 4% Tax Credit',
      category: 'Federal',
      estimatedValue: lihtcValue,
      confidence: 'Medium',
      timeline: '10-year credit period',
    });
    totalValue += lihtcValue;
  }

  // State incentives (NY)
  if (data.state === 'NY') {
    if (data.totalUnits) {
      const nyserdaValue = data.totalUnits * 1500;
      incentives.push({
        name: 'NYSERDA New Construction',
        category: 'State',
        estimatedValue: nyserdaValue,
        confidence: 'Medium',
        timeline: 'Pre-construction enrollment',
      });
      totalValue += nyserdaValue;
    }
  }

  return {
    summary: {
      projectName: data.address || 'Project Analysis',
      location: `${data.city || ''}, ${data.state}`.trim().replace(/^,\s*/, ''),
      buildingType: data.buildingType,
      totalUnits: data.totalUnits || 0,
      totalSqft: data.totalSqft || 0,
      affordablePercentage: data.affordablePercentage || 0,
    },
    incentiveSummary: {
      totalEstimatedValue: totalValue,
      incentiveCount: incentives.length,
      byCategory: {
        federal: incentives.filter((i) => i.category === 'Federal').length,
        state: incentives.filter((i) => i.category === 'State').length,
        local: incentives.filter((i) => i.category === 'Local').length,
        utility: incentives.filter((i) => i.category === 'Utility').length,
      },
    },
    topIncentives: incentives.slice(0, 5),
    recommendations: [
      data.affordablePercentage && data.affordablePercentage < 20
        ? 'Consider increasing affordable units to 20%+ for LIHTC eligibility'
        : null,
      'Engage energy consultant early for ENERGY STAR/ZERH certification',
      'Pre-enroll with NYSERDA before construction start',
      'Explore IDA PILOT opportunities for additional savings',
    ].filter(Boolean),
  };
}

function generateIncentiveMatrix(data: ReportRequest['projectData']) {
  const matrix = {
    federal: {
      category: 'Federal',
      programs: [
        {
          name: 'Section 45L',
          applicable: data.totalUnits && data.totalUnits > 0,
          value: data.totalUnits ? `$${(data.totalUnits * 2500).toLocaleString()}` : 'N/A',
          requirements: ['ENERGY STAR certification', 'New construction'],
          deadline: '2032',
        },
        {
          name: 'Section 179D',
          applicable: data.totalSqft && data.totalSqft > 0,
          value: data.totalSqft ? `$${(data.totalSqft * 2.5).toLocaleString()}` : 'N/A',
          requirements: ['25% above ASHRAE 90.1', 'Commercial/MF common areas'],
          deadline: '2032',
        },
        {
          name: 'Solar ITC',
          applicable: true,
          value: '30% of solar cost',
          requirements: ['Solar installation', 'Domestic content for bonus'],
          deadline: '2032',
        },
        {
          name: 'LIHTC 4%',
          applicable: data.affordablePercentage && data.affordablePercentage >= 20,
          value: data.totalDevelopmentCost
            ? `$${((data.totalDevelopmentCost * 0.7 * 0.04 * 10) / 1000000).toFixed(1)}M`
            : 'TBD',
          requirements: ['20%+ affordable', 'Bond financing', '30-year commitment'],
          deadline: 'Ongoing',
        },
      ],
    },
    state: {
      category: 'State',
      programs:
        data.state === 'NY'
          ? [
              {
                name: 'NYSERDA New Construction',
                applicable: true,
                value: data.totalUnits ? `$${(data.totalUnits * 1500).toLocaleString()}` : 'TBD',
                requirements: ['NY location', 'Pre-enrollment', 'Energy modeling'],
                deadline: 'Rolling',
              },
              {
                name: 'NY State LIHTC',
                applicable: data.affordablePercentage && data.affordablePercentage >= 20,
                value: 'Supplements federal',
                requirements: ['Federal LIHTC award'],
                deadline: 'Annual',
              },
            ]
          : [
              {
                name: 'State Programs',
                applicable: true,
                value: 'Research required',
                requirements: [`${data.state} specific requirements`],
                deadline: 'Varies',
              },
            ],
    },
    local: {
      category: 'Local',
      programs: [
        {
          name: 'IDA PILOT',
          applicable: true,
          value: 'Up to 15 years',
          requirements: ['IDA application', 'Job creation'],
          deadline: 'Application-based',
        },
        {
          name: 'Property Tax Exemption',
          applicable: data.affordablePercentage && data.affordablePercentage >= 25,
          value: 'Varies by municipality',
          requirements: ['Affordability requirements', 'Local approval'],
          deadline: 'Varies',
        },
      ],
    },
    utility: {
      category: 'Utility',
      programs: [
        {
          name: 'Energy Efficiency Rebates',
          applicable: true,
          value: data.totalUnits ? `$${(data.totalUnits * 500).toLocaleString()}` : 'TBD',
          requirements: ['Utility territory', 'Efficiency measures'],
          deadline: 'While funding lasts',
        },
      ],
    },
  };

  return matrix;
}

function generateApplicationChecklist(data: ReportRequest['projectData']) {
  const checklist = {
    preConstruction: [
      {
        item: 'NYSERDA Program Enrollment',
        status: 'pending',
        deadline: 'Before breaking ground',
        priority: 'high',
        notes: 'Must enroll before construction start to preserve eligibility',
      },
      {
        item: 'Energy Modeling',
        status: 'pending',
        deadline: '60 days pre-construction',
        priority: 'high',
        notes: 'Required for NYSERDA and 45L certification pathway',
      },
      {
        item: 'IDA PILOT Application',
        status: 'pending',
        deadline: 'Before construction',
        priority: 'medium',
        notes: 'Submit application to County IDA',
      },
      {
        item: 'LIHTC Application (if applicable)',
        status: data.affordablePercentage && data.affordablePercentage >= 20 ? 'pending' : 'n/a',
        deadline: 'HFA deadline',
        priority: 'high',
        notes: 'Coordinate with bond application',
      },
    ],
    construction: [
      {
        item: 'Prevailing Wage Documentation',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'high',
        notes: 'Required for maximum 179D deduction',
      },
      {
        item: 'Domestic Content Tracking',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'medium',
        notes: 'For 10% ITC bonus',
      },
      {
        item: 'Progress Photos/Documentation',
        status: 'pending',
        deadline: 'Ongoing',
        priority: 'medium',
        notes: 'Required for various certifications',
      },
    ],
    postConstruction: [
      {
        item: 'ENERGY STAR Certification',
        status: 'pending',
        deadline: 'At completion',
        priority: 'high',
        notes: 'Required for 45L credit',
      },
      {
        item: '179D Certification Study',
        status: 'pending',
        deadline: 'At placed in service',
        priority: 'high',
        notes: 'Third-party certification required',
      },
      {
        item: 'Cost Certification',
        status: 'pending',
        deadline: 'Within 90 days of completion',
        priority: 'high',
        notes: 'Required for LIHTC',
      },
      {
        item: 'Utility Rebate Claims',
        status: 'pending',
        deadline: 'Within 6 months',
        priority: 'medium',
        notes: 'Submit with supporting documentation',
      },
    ],
  };

  return checklist;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: ReportRequest = await request.json();

    if (!body.projectData || !body.projectData.state) {
      return NextResponse.json(
        { error: 'Project data with state is required' },
        { status: 400 }
      );
    }

    const reportType = body.reportType || 'executive_summary';
    const format = body.format || 'json';

    let reportContent;
    switch (reportType) {
      case 'executive_summary':
        reportContent = generateExecutiveSummary(body.projectData);
        break;
      case 'incentive_matrix':
        reportContent = generateIncentiveMatrix(body.projectData);
        break;
      case 'application_checklist':
        reportContent = generateApplicationChecklist(body.projectData);
        break;
      case 'full_analysis':
        reportContent = {
          executiveSummary: generateExecutiveSummary(body.projectData),
          incentiveMatrix: generateIncentiveMatrix(body.projectData),
          applicationChecklist: generateApplicationChecklist(body.projectData),
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    // Build report data for PDF/HTML generation
    const generatedAt = new Date().toISOString();
    const projectName = body.projectName || 'Project Report';

    // Handle different output formats
    if (format === 'html' || format === 'pdf' || format === 'text') {
      // Build ReportData structure for PDF generator
      const pdfReportData = buildPDFReportData(body, reportContent, generatedAt);

      if (format === 'html') {
        const pdfStructure = generatePDFReportStructure(pdfReportData);
        const htmlContent = generateHTMLReport(pdfStructure);

        return new NextResponse(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `inline; filename="${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_report.html"`,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (format === 'pdf') {
        // Return PDF structure for client-side rendering with jsPDF
        const pdfStructure = generatePDFReportStructure(pdfReportData);

        return NextResponse.json(
          {
            success: true,
            format: 'pdf',
            pdfStructure,
            reportData: pdfReportData,
            meta: {
              responseTime: `${Date.now() - startTime}ms`,
              version: '1.0.0',
              note: 'Use jsPDF on client-side to render this structure to PDF',
            },
          },
          {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      if (format === 'text') {
        const textContent = generateTextReport(pdfReportData);

        return new NextResponse(textContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_report.txt"`,
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Default JSON format
    return NextResponse.json(
      {
        success: true,
        report: {
          type: reportType,
          projectName,
          generatedAt,
          content: reportContent,
        },
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          version: '1.0.0',
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Report generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Build ReportData structure from report content for PDF generation
 */
function buildPDFReportData(
  body: ReportRequest,
  reportContent: ReturnType<typeof generateExecutiveSummary> | ReturnType<typeof generateIncentiveMatrix> | ReturnType<typeof generateApplicationChecklist> | {
    executiveSummary: ReturnType<typeof generateExecutiveSummary>;
    incentiveMatrix: ReturnType<typeof generateIncentiveMatrix>;
    applicationChecklist: ReturnType<typeof generateApplicationChecklist>;
  },
  generatedAt: string
): ReportData {
  // Extract data based on report type
  let summary: ReturnType<typeof generateExecutiveSummary> | undefined;
  let matrix: ReturnType<typeof generateIncentiveMatrix> | undefined;
  let checklist: ReturnType<typeof generateApplicationChecklist> | undefined;

  if ('executiveSummary' in reportContent) {
    // Full analysis
    summary = reportContent.executiveSummary;
    matrix = reportContent.incentiveMatrix;
    checklist = reportContent.applicationChecklist;
  } else if ('summary' in reportContent) {
    // Executive summary
    summary = reportContent;
  } else if ('federal' in reportContent) {
    // Incentive matrix
    matrix = reportContent;
  } else if ('preConstruction' in reportContent) {
    // Application checklist
    checklist = reportContent;
  }

  // Build incentives list from matrix
  const incentives: IncentiveItem[] = [];
  if (matrix) {
    const categories = ['federal', 'state', 'local', 'utility'] as const;
    for (const cat of categories) {
      const catData = matrix[cat];
      if (catData && 'programs' in catData) {
        for (const prog of catData.programs) {
          if (prog.applicable) {
            incentives.push({
              id: prog.name.toLowerCase().replace(/\s+/g, '-'),
              name: prog.name,
              category: cat,
              type: 'Tax Credit', // Default type
              estimatedValue: parseEstimatedValue(prog.value),
              confidence: 'medium',
              timeline: prog.deadline || 'TBD',
              requirements: prog.requirements.map((req: string) => ({
                requirement: req,
                status: 'pending' as const,
              })),
              nextSteps: [`Review ${prog.name} requirements`, 'Gather documentation'],
            });
          }
        }
      }
    }
  }

  // Build checklist sections
  const checklistSections: ChecklistSection[] = [];
  if (checklist) {
    if ('preConstruction' in checklist) {
      checklistSections.push({
        phase: 'Pre-Construction',
        items: checklist.preConstruction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
    if ('construction' in checklist) {
      checklistSections.push({
        phase: 'Construction',
        items: checklist.construction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
    if ('postConstruction' in checklist) {
      checklistSections.push({
        phase: 'Post-Construction',
        items: checklist.postConstruction.map((item: { item: string; status: string; deadline: string; priority: string; notes?: string }) => ({
          item: item.item,
          status: item.status as 'pending' | 'in_progress' | 'completed' | 'n/a',
          deadline: item.deadline,
          priority: item.priority as 'high' | 'medium' | 'low',
          notes: item.notes,
        })),
      });
    }
  }

  // Calculate totals
  const totalValue = incentives.reduce((sum, inc) => sum + inc.estimatedValue, 0);

  return {
    projectName: body.projectName || 'Project Report',
    generatedAt,
    summary: {
      location: `${body.projectData.city || ''}, ${body.projectData.state}`.trim().replace(/^,\s*/, ''),
      buildingType: body.projectData.buildingType || 'Multifamily',
      totalUnits: body.projectData.totalUnits || 0,
      totalSqft: body.projectData.totalSqft || 0,
      affordablePercentage: body.projectData.affordablePercentage || 0,
      totalDevelopmentCost: body.projectData.totalDevelopmentCost,
    },
    incentiveSummary: {
      totalEstimatedValue: totalValue || (summary?.incentiveSummary?.totalEstimatedValue ?? 0),
      incentiveCount: incentives.length || (summary?.incentiveSummary?.incentiveCount ?? 0),
      byCategory: {
        federal: incentives.filter(i => i.category === 'federal').length || (summary?.incentiveSummary?.byCategory?.federal ?? 0),
        state: incentives.filter(i => i.category === 'state').length || (summary?.incentiveSummary?.byCategory?.state ?? 0),
        local: incentives.filter(i => i.category === 'local').length || (summary?.incentiveSummary?.byCategory?.local ?? 0),
        utility: incentives.filter(i => i.category === 'utility').length || (summary?.incentiveSummary?.byCategory?.utility ?? 0),
      },
    },
    incentives,
    recommendations: summary?.recommendations?.filter((r): r is string => r !== null) || [],
    checklist: checklistSections.length > 0 ? checklistSections : undefined,
  };
}

/**
 * Parse estimated value string to number
 */
function parseEstimatedValue(value: string): number {
  if (!value || value === 'N/A' || value === 'TBD') return 0;

  // Remove currency symbols and commas
  const cleaned = value.replace(/[$,]/g, '').trim();

  // Handle ranges (take the first number)
  const rangeMatch = cleaned.match(/([\d.]+)/);
  if (!rangeMatch) return 0;

  let num = parseFloat(rangeMatch[1]);

  // Handle M for millions
  if (cleaned.toLowerCase().includes('m')) {
    num *= 1000000;
  }
  // Handle K for thousands
  else if (cleaned.toLowerCase().includes('k')) {
    num *= 1000;
  }

  return Math.round(num);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
