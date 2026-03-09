// Admin Error Logs API Route
// Provides admin-only access to production error and warning logs
// Requires role = 'admin' or 'super_admin' in profiles table

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ============================================================================
// TYPES
// ============================================================================

interface LogRecord {
  id: string;
  timestamp: string;
  severity: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  details: Record<string, unknown> | null;
  count: number;
  user_id?: string | null;
  stack_trace?: string | null;
}

interface LogSummary {
  errorsLastHour: number;
  warningsLastHour: number;
  errorRateTrend: 'up' | 'down' | 'stable';
}

interface ErrorLogsResponse {
  logs: LogRecord[];
  summary: LogSummary;
  total: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

const querySchema = z.object({
  severity: z.enum(['error', 'warn', 'info', 'all']).optional().default('all'),
  hours: z.coerce.number().int().positive().max(720).optional().default(24),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
});

// ============================================================================
// MOCK DATA FALLBACK
// Returned when no suitable log table exists in the database
// ============================================================================

function buildMockLogs(
  severity: string,
  hours: number,
  search: string | undefined,
  page: number,
  limit: number,
): ErrorLogsResponse {
  const now = new Date();

  const rawMock: LogRecord[] = [
    {
      id: 'mock-1',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      severity: 'error',
      source: '/api/analytics',
      message: 'Failed to fetch eligibility matches: relation "eligibility_matches" does not exist',
      details: { code: 'PGRST116', hint: null },
      count: 3,
      user_id: null,
      stack_trace: 'Error: PGRST116\n  at SupabaseClient.from (/app/.next/server/chunks/supabase.js:42)\n  at GET (/app/.next/server/chunks/analytics.js:88)',
    },
    {
      id: 'mock-2',
      timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      severity: 'warn',
      source: '/api/jobs/process',
      message: 'Job timeout exceeded: eligibility_scan after 300s',
      details: { job_id: 'jb_abc123', job_type: 'eligibility_scan', timeout_seconds: 300 },
      count: 1,
      user_id: 'usr_xyz789',
      stack_trace: null,
    },
    {
      id: 'mock-3',
      timestamp: new Date(now.getTime() - 28 * 60 * 1000).toISOString(),
      severity: 'error',
      source: '/api/stripe/webhook',
      message: 'Stripe webhook signature verification failed',
      details: { error_type: 'SignatureVerificationError' },
      count: 1,
      user_id: null,
      stack_trace: 'Error: No signatures found matching the expected signature for payload\n  at Webhooks.constructEvent (/app/.next/server/chunks/stripe.js:12)',
    },
    {
      id: 'mock-4',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      severity: 'info',
      source: '/api/programs/sync',
      message: 'Program sync completed: 248 records updated',
      details: { updated: 248, skipped: 12, duration_ms: 4320 },
      count: 1,
      user_id: null,
      stack_trace: null,
    },
    {
      id: 'mock-5',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'warn',
      source: '/api/auth',
      message: 'Rate limit threshold reached for IP 192.168.1.45',
      details: { ip: '192.168.1.45', requests_per_minute: 95, threshold: 100 },
      count: 8,
      user_id: null,
      stack_trace: null,
    },
    {
      id: 'mock-6',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      severity: 'error',
      source: '/api/documents',
      message: 'PDF generation failed: out of memory',
      details: { document_id: 'doc_999', project_id: 'prj_abc', memory_usage_mb: 512 },
      count: 2,
      user_id: 'usr_def456',
      stack_trace: 'RangeError: Out of memory\n  at PDFKit.addPage (/app/.next/server/chunks/pdfkit.js:88)',
    },
  ];

  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

  let filtered = rawMock.filter((log) => new Date(log.timestamp) >= cutoff);

  if (severity !== 'all') {
    filtered = filtered.filter((log) => log.severity === severity);
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term),
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const errorsLastHour = rawMock.filter(
    (l) => l.severity === 'error' && new Date(l.timestamp) >= oneHourAgo,
  ).reduce((sum, l) => sum + l.count, 0);
  const warningsLastHour = rawMock.filter(
    (l) => l.severity === 'warn' && new Date(l.timestamp) >= oneHourAgo,
  ).reduce((sum, l) => sum + l.count, 0);

  return {
    logs: paginated,
    summary: {
      errorsLastHour,
      warningsLastHour,
      errorRateTrend: errorsLastHour > 2 ? 'up' : errorsLastHour > 0 ? 'stable' : 'down',
    },
    total,
  };
}

// ============================================================================
// SCHEMA DISCOVERY
// Determines which table and columns are available for log querying
// ============================================================================

interface TableSchema {
  tableName: string;
  hasTimestamp: boolean;
  hasSeverity: boolean;
  hasMessage: boolean;
  hasSource: boolean;
  hasDetails: boolean;
  hasUserId: boolean;
  hasStackTrace: boolean;
  timestampCol: string;
  severityCol: string;
  messageCol: string;
  sourceCol: string;
  detailsCol: string | null;
  userIdCol: string | null;
  stackTraceCol: string | null;
}

async function discoverLogSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<TableSchema | null> {
  // Probe candidate tables with a lightweight SELECT to discover the schema.
  // information_schema queries require service-role key which is not used here,
  // so we attempt a .limit(1) against each table name and inspect the result shape.
  const candidateTables = ['job_logs', 'activity_logs', 'error_logs', 'logs', 'system_logs'];

  for (const tableName of candidateTables) {
    const { data, error: probeError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (probeError || !data) continue;

    // Inspect the shape of a sample row (or assume common column names)
    const sample: Record<string, unknown> = data[0] ?? {};
    const keys = Object.keys(sample);

    const find = (...candidates: string[]): string | null =>
      candidates.find((c) => keys.includes(c)) ?? null;

    const timestampCol = find('created_at', 'timestamp', 'occurred_at', 'logged_at') ?? 'created_at';
    const severityCol = find('severity', 'level', 'log_level', 'type') ?? 'severity';
    const messageCol = find('message', 'msg', 'description', 'error_message') ?? 'message';
    const sourceCol = find('source', 'route', 'path', 'endpoint', 'service', 'job_type') ?? 'source';
    const detailsCol = find('details', 'metadata', 'context', 'payload', 'error_details');
    const userIdCol = find('user_id', 'userId', 'created_by');
    const stackTraceCol = find('stack_trace', 'stack', 'stacktrace', 'error_stack');

    return {
      tableName,
      hasTimestamp: true,
      hasSeverity: !!find('severity', 'level', 'log_level'),
      hasMessage: !!find('message', 'msg', 'description', 'error_message'),
      hasSource: !!find('source', 'route', 'path', 'endpoint', 'service', 'job_type'),
      hasDetails: !!detailsCol,
      hasUserId: !!userIdCol,
      hasStackTrace: !!stackTraceCol,
      timestampCol,
      severityCol,
      messageCol,
      sourceCol,
      detailsCol,
      userIdCol,
      stackTraceCol,
    };
  }

  return null;
}

// ============================================================================
// ROW NORMALIZER
// Maps arbitrary DB row shapes into the canonical LogRecord interface
// ============================================================================

function normalizeRow(
  row: Record<string, unknown>,
  schema: TableSchema,
  idx: number,
): LogRecord {
  const rawSeverity = String(row[schema.severityCol] ?? 'info').toLowerCase();
  let severity: 'error' | 'warn' | 'info' = 'info';
  if (rawSeverity.includes('error') || rawSeverity.includes('fail') || rawSeverity === 'critical') {
    severity = 'error';
  } else if (rawSeverity.includes('warn')) {
    severity = 'warn';
  }

  const details =
    schema.detailsCol && row[schema.detailsCol] != null
      ? (row[schema.detailsCol] as Record<string, unknown>)
      : null;

  return {
    id: String(row['id'] ?? `row-${idx}`),
    timestamp: String(row[schema.timestampCol] ?? new Date().toISOString()),
    severity,
    source: String(row[schema.sourceCol] ?? 'unknown'),
    message: String(row[schema.messageCol] ?? ''),
    details,
    count: Number(row['count'] ?? 1),
    user_id: schema.userIdCol ? (row[schema.userIdCol] as string | null) : null,
    stack_trace: schema.stackTraceCol ? (row[schema.stackTraceCol] as string | null) : null,
  };
}

// ============================================================================
// GET /api/admin/error-logs
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    // --- Auth check ---
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Admin role check ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
    }

    const isAdmin =
      profile.role === 'admin' || profile.role === 'super_admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: admin access required' },
        { status: 403 },
      );
    }

    // --- Parse & validate query params ---
    const { searchParams } = new URL(request.url);
    const parseResult = querySchema.safeParse({
      severity: searchParams.get('severity') ?? undefined,
      hours: searchParams.get('hours') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.errors },
        { status: 400 },
      );
    }

    const { severity, hours, search, page, limit } = parseResult.data;

    // --- Schema discovery ---
    const schema = await discoverLogSchema(supabase);

    if (!schema) {
      // No log table found — return mock data so the UI still renders
      const mockResponse = buildMockLogs(severity, hours, search, page, limit);
      return NextResponse.json({ ...mockResponse, _source: 'mock' });
    }

    // --- Build query ---
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const offset = (page - 1) * limit;

    let selectCols = `id, ${schema.timestampCol}, ${schema.severityCol}, ${schema.sourceCol}, ${schema.messageCol}`;
    if (schema.detailsCol) selectCols += `, ${schema.detailsCol}`;
    if (schema.userIdCol) selectCols += `, ${schema.userIdCol}`;
    if (schema.stackTraceCol) selectCols += `, ${schema.stackTraceCol}`;

    let query = supabase
      .from(schema.tableName)
      .select(selectCols, { count: 'exact' })
      .gte(schema.timestampCol, cutoff)
      .order(schema.timestampCol, { ascending: false })
      .range(offset, offset + limit - 1);

    // Severity filter — only apply if the table has a real severity column
    if (severity !== 'all' && schema.hasSeverity) {
      // Match common severity naming conventions
      const severityValues: Record<string, string[]> = {
        error: ['error', 'Error', 'ERROR', 'critical', 'Critical', 'CRITICAL', 'fatal', 'Fatal', 'FATAL'],
        warn: ['warn', 'Warn', 'WARN', 'warning', 'Warning', 'WARNING'],
        info: ['info', 'Info', 'INFO', 'debug', 'Debug', 'DEBUG'],
      };
      query = query.in(schema.severityCol, severityValues[severity] ?? [severity]);
    }

    // Text search
    if (search && schema.hasMessage) {
      query = query.ilike(schema.messageCol, `%${search}%`);
    }

    const { data: rows, error: queryError, count } = await query;

    if (queryError) {
      console.error('[admin/error-logs] Query error:', queryError);
      // Fall back to mock data rather than returning a hard error
      const mockResponse = buildMockLogs(severity, hours, search, page, limit);
      return NextResponse.json({ ...mockResponse, _source: 'mock_fallback' });
    }

    const logs: LogRecord[] = (rows ?? []).map((row, idx) =>
      normalizeRow(row as unknown as Record<string, unknown>, schema, idx),
    );

    // --- Summary counts (last hour) ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const [errorsNow, errorsBefore, warningsNow] = await Promise.all([
      supabase
        .from(schema.tableName)
        .select('id', { count: 'exact', head: true })
        .gte(schema.timestampCol, oneHourAgo)
        .in(schema.severityCol, ['error', 'Error', 'ERROR', 'critical', 'Critical', 'fatal']),
      supabase
        .from(schema.tableName)
        .select('id', { count: 'exact', head: true })
        .gte(schema.timestampCol, twoHoursAgo)
        .lt(schema.timestampCol, oneHourAgo)
        .in(schema.severityCol, ['error', 'Error', 'ERROR', 'critical', 'Critical', 'fatal']),
      supabase
        .from(schema.tableName)
        .select('id', { count: 'exact', head: true })
        .gte(schema.timestampCol, oneHourAgo)
        .in(schema.severityCol, ['warn', 'Warn', 'WARN', 'warning', 'Warning']),
    ]);

    const errorsLastHour = errorsNow.count ?? 0;
    const errorsPrevHour = errorsBefore.count ?? 0;
    const warningsLastHour = warningsNow.count ?? 0;

    let errorRateTrend: 'up' | 'down' | 'stable' = 'stable';
    if (errorsLastHour > errorsPrevHour + 1) {
      errorRateTrend = 'up';
    } else if (errorsLastHour < errorsPrevHour) {
      errorRateTrend = 'down';
    }

    const response: ErrorLogsResponse = {
      logs,
      summary: { errorsLastHour, warningsLastHour, errorRateTrend },
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[admin/error-logs] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
