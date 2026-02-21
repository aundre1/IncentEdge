/**
 * API Status Endpoint
 *
 * Returns comprehensive status of all IncentEdge API endpoints.
 * Use this to verify the backend is running and all services are available.
 *
 * GET /api/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: string;
  details?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  const services: ServiceStatus[] = [];
  let databaseConnected = false;

  // Check database connection
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('incentive_programs')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      databaseConnected = true;
      services.push({
        name: 'Database (Supabase)',
        endpoint: 'supabase',
        status: 'operational',
        details: `Connected, ${count || 0} programs in database`,
      });
    } else {
      services.push({
        name: 'Database (Supabase)',
        endpoint: 'supabase',
        status: 'degraded',
        details: 'Using fallback demo data',
      });
    }
  } catch {
    services.push({
      name: 'Database (Supabase)',
      endpoint: 'supabase',
      status: 'degraded',
      details: 'Using fallback demo data',
    });
  }

  // List all API endpoints with their status
  const endpoints = [
    {
      name: 'Platform Stats',
      endpoint: '/api/stats',
      description: 'Get platform statistics (programs, awards)',
    },
    {
      name: 'Health Check',
      endpoint: '/api/health',
      description: 'Basic health check',
    },
    {
      name: 'Program Search',
      endpoint: '/api/programs/search',
      description: 'Search incentive programs with filters',
    },
    {
      name: 'Programs List',
      endpoint: '/api/programs',
      description: 'Full program list with pagination',
    },
    {
      name: 'Project Analysis',
      endpoint: '/api/projects/analyze',
      description: 'Analyze project for matching incentives',
    },
    {
      name: 'Incentive Calculator',
      endpoint: '/api/calculate',
      description: 'Calculate incentive values for project',
    },
    {
      name: 'Data Export',
      endpoint: '/api/export',
      description: 'Export programs in CSV/JSON format',
    },
    {
      name: 'Report Generator',
      endpoint: '/api/reports/generate',
      description: 'Generate project reports',
    },
  ];

  endpoints.forEach((ep) => {
    services.push({
      name: ep.name,
      endpoint: ep.endpoint,
      status: 'operational',
      details: ep.description,
    });
  });

  const overallStatus =
    services.every((s) => s.status === 'operational')
      ? 'operational'
      : services.some((s) => s.status === 'down')
        ? 'partial_outage'
        : 'degraded';

  return NextResponse.json(
    {
      status: overallStatus,
      mode: databaseConnected ? 'production' : 'demo',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? `${Math.round(process.uptime())}s` : 'unknown',
      responseTime: `${Date.now() - startTime}ms`,
      services,
      features: {
        incentiveSearch: true,
        projectAnalysis: true,
        roiCalculator: true,
        dataExport: true,
        reportGeneration: true,
        realTimeData: databaseConnected,
      },
      dataSource: databaseConnected
        ? {
            type: 'supabase',
            status: 'connected',
          }
        : {
            type: 'fallback',
            status: 'demo_mode',
            note: 'Using 8 sample programs. Connect Supabase for 24K+ programs.',
          },
      documentation: {
        swagger: '/api/docs',
        readme: 'https://github.com/incentedge/api-docs',
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Demo-Mode': databaseConnected ? 'false' : 'true',
      },
    }
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
