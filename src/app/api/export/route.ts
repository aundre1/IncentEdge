/**
 * Export API
 *
 * Generate exports in various formats:
 * - CSV: Incentive program data
 * - JSON: Full analysis results
 * - PDF: (stub - would require additional library)
 *
 * GET /api/export?format=csv&type=programs&state=NY
 * GET /api/export?format=json&type=analysis&projectId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';

// Demo incentive data for exports
const EXPORT_PROGRAMS = [
  {
    id: 'IRA-45L',
    name: 'Section 45L Tax Credit',
    category: 'Federal',
    type: 'Tax Credit',
    value: '$2,500-$5,000/unit',
    deadline: '2032-12-31',
    eligibility: 'New residential construction meeting ENERGY STAR',
    directPay: 'Yes',
    transferable: 'Yes',
    administrator: 'IRS',
    sourceUrl: 'https://www.irs.gov/credits-deductions/45l-new-energy-efficient-home-credit',
  },
  {
    id: 'IRA-179D',
    name: 'Section 179D Deduction',
    category: 'Federal',
    type: 'Tax Deduction',
    value: '$0.50-$5.00/sqft',
    deadline: '2032-12-31',
    eligibility: 'Commercial buildings exceeding ASHRAE 90.1 by 25%',
    directPay: 'Yes',
    transferable: 'No',
    administrator: 'IRS',
    sourceUrl: 'https://www.irs.gov/credits-deductions/energy-efficient-commercial-buildings-deduction',
  },
  {
    id: 'IRA-ITC',
    name: 'Investment Tax Credit (Solar)',
    category: 'Federal',
    type: 'Tax Credit',
    value: '30% + bonuses',
    deadline: '2032-12-31',
    eligibility: 'Solar and storage installations',
    directPay: 'Yes',
    transferable: 'Yes',
    administrator: 'IRS',
    sourceUrl: 'https://www.irs.gov/credits-deductions/investment-tax-credit',
  },
  {
    id: 'FED-LIHTC',
    name: 'Low-Income Housing Tax Credit',
    category: 'Federal',
    type: 'Tax Credit',
    value: '4% or 9% of qualified basis',
    deadline: 'Annual allocation',
    eligibility: 'Affordable housing with income restrictions',
    directPay: 'No',
    transferable: 'Yes (syndication)',
    administrator: 'State HFAs',
    sourceUrl: 'https://www.huduser.gov/portal/datasets/lihtc.html',
  },
  {
    id: 'NY-NYSERDA-NC',
    name: 'NYSERDA New Construction',
    category: 'State',
    type: 'Rebate',
    value: 'Up to $3M per project',
    deadline: 'Rolling',
    eligibility: 'NY new construction exceeding energy code',
    directPay: 'N/A',
    transferable: 'N/A',
    administrator: 'NYSERDA',
    sourceUrl: 'https://www.nyserda.ny.gov/All-Programs/New-Construction-Program',
  },
  {
    id: 'NY-LIHTC',
    name: 'NY State LIHTC',
    category: 'State',
    type: 'Tax Credit',
    value: 'Supplements federal LIHTC',
    deadline: 'Annual allocation',
    eligibility: 'Projects receiving federal LIHTC',
    directPay: 'No',
    transferable: 'Yes',
    administrator: 'HCR',
    sourceUrl: 'https://hcr.ny.gov/lihtc',
  },
  {
    id: 'NYC-485X',
    name: 'NYC 485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    category: 'Local',
    type: 'Tax Exemption',
    value: 'Up to 40-year exemption',
    deadline: 'Rolling (active program)',
    eligibility: 'NYC new multifamily construction with min. 25% affordable units; prevailing wage required for 100+ unit projects',
    directPay: 'N/A',
    transferable: 'N/A',
    administrator: 'NYC HPD',
    sourceUrl: 'https://www.nyc.gov/site/hpd/services-and-information/tax-incentives-485x.page',
  },
  {
    id: 'WEST-IDA',
    name: 'Westchester IDA PILOT',
    category: 'Local',
    type: 'Tax Abatement',
    value: '15-year PILOT',
    deadline: 'Application-based',
    eligibility: 'Westchester County projects',
    directPay: 'N/A',
    transferable: 'N/A',
    administrator: 'Westchester IDA',
    sourceUrl: 'https://westchestergov.com/ida',
  },
  {
    id: 'CONED-MF',
    name: 'Con Edison Multifamily Program',
    category: 'Utility',
    type: 'Rebate',
    value: '$500-$1,000/unit',
    deadline: 'While funding lasts',
    eligibility: 'Multifamily in ConEd territory',
    directPay: 'N/A',
    transferable: 'N/A',
    administrator: 'Con Edison',
    sourceUrl: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits',
  },
  {
    id: 'NGRID-EE',
    name: 'National Grid Energy Efficiency',
    category: 'Utility',
    type: 'Rebate',
    value: 'Varies by measure',
    deadline: 'While funding lasts',
    eligibility: 'National Grid service territory',
    directPay: 'N/A',
    transferable: 'N/A',
    administrator: 'National Grid',
    sourceUrl: 'https://www.nationalgridus.com/ny-business/energy-saving-programs',
  },
];

function generateCSV(data: typeof EXPORT_PROGRAMS, includeHeaders = true): string {
  const headers = [
    'ID',
    'Program Name',
    'Category',
    'Type',
    'Value',
    'Deadline',
    'Eligibility',
    'Direct Pay',
    'Transferable',
    'Administrator',
    'Source URL',
  ];

  const rows = data.map((p) => [
    p.id,
    `"${p.name}"`,
    p.category,
    p.type,
    `"${p.value}"`,
    p.deadline,
    `"${p.eligibility}"`,
    p.directPay,
    p.transferable,
    p.administrator,
    p.sourceUrl,
  ]);

  if (includeHeaders) {
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
  return rows.map((r) => r.join(',')).join('\n');
}

function filterPrograms(
  programs: typeof EXPORT_PROGRAMS,
  filters: { state?: string; category?: string; type?: string }
) {
  let filtered = [...programs];

  if (filters.state) {
    // Include federal programs and state-specific
    filtered = filtered.filter(
      (p) =>
        p.category === 'Federal' ||
        p.id.startsWith(filters.state!.toUpperCase()) ||
        (filters.state === 'NY' && ['NYC-485X', 'WEST-IDA', 'CONED-MF', 'NGRID-EE'].includes(p.id))
    );
  }

  if (filters.category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.type) {
    filtered = filtered.filter((p) =>
      p.type.toLowerCase().includes(filters.type!.toLowerCase())
    );
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'csv';
  const exportType = url.searchParams.get('type') || 'programs';
  const state = url.searchParams.get('state');
  const category = url.searchParams.get('category');
  const type = url.searchParams.get('type');

  // Filter programs
  const filteredPrograms = filterPrograms(EXPORT_PROGRAMS, {
    state: state || undefined,
    category: category || undefined,
    type: type || undefined,
  });

  if (format === 'csv') {
    const csv = generateCSV(filteredPrograms);
    const filename = `incentedge-programs-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  if (format === 'json') {
    const filename = `incentedge-programs-${new Date().toISOString().split('T')[0]}.json`;

    return NextResponse.json(
      {
        exportDate: new Date().toISOString(),
        filters: { state, category, type },
        totalPrograms: filteredPrograms.length,
        programs: filteredPrograms,
        disclaimer:
          'This data is for informational purposes only. Always verify program details with administering agencies.',
      },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  if (format === 'pdf') {
    // PDF generation would require a library like puppeteer or jspdf
    // Return a placeholder response
    return NextResponse.json(
      {
        error: 'PDF export requires additional configuration',
        alternative: 'Use CSV or JSON export, or print from the web interface',
        printUrl: '/dashboard?print=true',
      },
      {
        status: 501,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  return NextResponse.json(
    { error: 'Invalid format. Supported: csv, json, pdf' },
    { status: 400 }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
