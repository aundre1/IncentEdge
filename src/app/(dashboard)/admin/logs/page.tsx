'use client';

// Admin Error Log Feed
// Provides real-time visibility into production errors and warnings.
// Fetches from /api/admin/error-logs, auto-refreshes every 60 seconds.

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Search,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type Severity = 'error' | 'warn' | 'info';
type SeverityFilter = Severity | 'all';
type TimeRange = '1h' | '6h' | '24h' | '7d';

interface LogRecord {
  id: string;
  timestamp: string;
  severity: Severity;
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
  _source?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGE_HOURS: Record<TimeRange, number> = {
  '1h': 1,
  '6h': 6,
  '24h': 24,
  '7d': 168,
};

const SEVERITY_FILTERS: { value: SeverityFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'error', label: 'Errors' },
  { value: 'warn', label: 'Warnings' },
  { value: 'info', label: 'Info' },
];

const TIME_RANGE_FILTERS: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
];

const REFRESH_INTERVAL_MS = 60_000;
const PAGE_LIMIT = 50;

// ============================================================================
// HELPERS
// ============================================================================

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function severityConfig(severity: Severity): {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  rowClass: string;
} {
  switch (severity) {
    case 'error':
      return {
        label: 'ERROR',
        badgeClass: 'bg-red-900/40 text-red-400 border border-red-700/50',
        icon: AlertCircle,
        rowClass: 'border-l-2 border-l-red-600/60',
      };
    case 'warn':
      return {
        label: 'WARN',
        badgeClass: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50',
        icon: AlertTriangle,
        rowClass: 'border-l-2 border-l-yellow-500/60',
      };
    case 'info':
      return {
        label: 'INFO',
        badgeClass: 'bg-blue-900/40 text-blue-400 border border-blue-700/50',
        icon: Info,
        rowClass: 'border-l-2 border-l-blue-500/60',
      };
  }
}

function buildCsvContent(logs: LogRecord[]): string {
  const header = ['Timestamp', 'Severity', 'Source', 'Message', 'Count', 'User ID'].join(',');
  const rows = logs.map((log) =>
    [
      log.timestamp,
      log.severity,
      `"${log.source.replace(/"/g, '""')}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      log.count,
      log.user_id ?? '',
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

function downloadCsv(logs: LogRecord[]): void {
  const csv = buildCsvContent(logs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `error-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryBar({ summary, isMock }: { summary: LogSummary; isMock: boolean }) {
  const TrendIcon =
    summary.errorRateTrend === 'up'
      ? TrendingUp
      : summary.errorRateTrend === 'down'
        ? TrendingDown
        : Minus;

  const trendClass =
    summary.errorRateTrend === 'up'
      ? 'text-red-400'
      : summary.errorRateTrend === 'down'
        ? 'text-emerald-400'
        : 'text-slate-400';

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 rounded-md bg-red-900/20 border border-red-700/30 px-3 py-2">
        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
        <span className="font-mono text-sm text-red-300">
          <span className="font-bold text-red-200">{summary.errorsLastHour}</span> error
          {summary.errorsLastHour !== 1 ? 's' : ''} last hour
        </span>
        <TrendIcon className={cn('h-4 w-4 shrink-0', trendClass)} />
      </div>

      <div className="flex items-center gap-2 rounded-md bg-yellow-900/20 border border-yellow-700/30 px-3 py-2">
        <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
        <span className="font-mono text-sm text-yellow-300">
          <span className="font-bold text-yellow-200">{summary.warningsLastHour}</span> warning
          {summary.warningsLastHour !== 1 ? 's' : ''} last hour
        </span>
      </div>

      {isMock && (
        <Badge className="bg-slate-700/50 text-slate-400 border border-slate-600/50 font-mono text-xs">
          demo data — no log table detected
        </Badge>
      )}
    </div>
  );
}

interface LogRowProps {
  log: LogRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

function LogRow({ log, isExpanded, onToggle }: LogRowProps) {
  const { label, badgeClass, icon: SeverityIcon, rowClass } = severityConfig(log.severity);

  return (
    <div className={cn('bg-slate-900/60 rounded-md overflow-hidden', rowClass)}>
      {/* Summary row — always visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Severity badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 shrink-0 rounded px-2 py-0.5 font-mono text-xs font-semibold',
              badgeClass,
            )}
          >
            <SeverityIcon className="h-3 w-3" />
            {label}
          </span>

          {/* Timestamp */}
          <span className="font-mono text-xs text-slate-500 shrink-0 pt-0.5 hidden sm:inline">
            {formatTimestamp(log.timestamp)}
          </span>

          {/* Source */}
          <span className="font-mono text-xs text-slate-400 shrink-0 max-w-[140px] truncate pt-0.5">
            {log.source}
          </span>

          {/* Message */}
          <span className="font-mono text-sm text-slate-200 flex-1 truncate leading-tight">
            {log.message}
          </span>

          {/* Count badge */}
          {log.count > 1 && (
            <span className="shrink-0 rounded-full bg-slate-700/60 px-2 py-0.5 font-mono text-xs text-slate-400">
              ×{log.count}
            </span>
          )}

          {/* Expand icon */}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          )}
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-700/40">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">
                Timestamp
              </p>
              <p className="font-mono text-xs text-slate-300">{log.timestamp}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">
                Source / Route
              </p>
              <p className="font-mono text-xs text-slate-300">{log.source}</p>
            </div>
            {log.user_id && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">
                  User ID
                </p>
                <p className="font-mono text-xs text-slate-300">{log.user_id}</p>
              </div>
            )}
          </div>

          {/* Full message */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
              Message
            </p>
            <p className="font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
              {log.message}
            </p>
          </div>

          {/* Details JSON */}
          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
                Details
              </p>
              <pre className="font-mono text-xs text-slate-300 bg-slate-950/60 rounded p-3 overflow-x-auto whitespace-pre-wrap break-words">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}

          {/* Stack trace */}
          {log.stack_trace && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-1">
                Stack Trace
              </p>
              <pre className="font-mono text-xs text-red-400/80 bg-slate-950/60 rounded p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                {log.stack_trace}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminLogsPage() {
  // --- Filter state ---
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // --- Data state ---
  const [data, setData] = useState<ErrorLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // --- Expanded rows ---
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // --- Ref for interval cleanup ---
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Fetch function ---
  const fetchLogs = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          severity,
          hours: String(TIME_RANGE_HOURS[timeRange]),
          page: String(page),
          limit: String(PAGE_LIMIT),
        });
        if (search) params.set('search', search);

        const response = await fetch(`/api/admin/error-logs?${params.toString()}`);

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? `HTTP ${response.status}`,
          );
        }

        const json: ErrorLogsResponse = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load logs');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [severity, timeRange, search, page],
  );

  // --- Initial load + filter changes reset page to 1 ---
  useEffect(() => {
    setPage(1);
    setExpandedIds(new Set());
  }, [severity, timeRange, search]);

  // --- Fetch on filter/page change ---
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // --- Auto-refresh every 60 seconds ---
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchLogs({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLogs]);

  // --- Handlers ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleToggleRow = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportCsv = () => {
    if (data?.logs) downloadCsv(data.logs);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_LIMIT) : 0;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Error Log Feed</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Production error monitoring — admin only
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs({ silent: true })}
            disabled={isRefreshing}
            className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white"
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-1.5', isRefreshing && 'animate-spin')}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!data?.logs?.length}
            className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/60 hover:text-white"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {data?.summary && (
        <SummaryBar summary={data.summary} isMock={data._source === 'mock' || data._source === 'mock_fallback'} />
      )}

      {/* Filters */}
      <Card className="bg-slate-900/70 border-slate-700/50">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Severity filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500 shrink-0" />
              <div className="flex rounded-md overflow-hidden border border-slate-700/60">
                {SEVERITY_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSeverity(value)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium font-mono transition-colors',
                      severity === value
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time range filter */}
            <div className="flex rounded-md overflow-hidden border border-slate-700/60">
              {TIME_RANGE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeRange(value)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium font-mono transition-colors',
                    timeRange === value
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[180px] max-w-sm">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full bg-slate-800/50 border border-slate-700/60 rounded-md pl-8 pr-3 py-1.5 text-sm font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </form>

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 font-mono"
              >
                Clear search
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card className="bg-slate-900/70 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-200">
              Log Entries
              {data && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {data.total.toLocaleString()} total
                </span>
              )}
            </CardTitle>

            {data && data.total > PAGE_LIMIT && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 rounded border border-slate-700/50 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 rounded border border-slate-700/50 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <RefreshCw className="h-5 w-5 text-slate-500 animate-spin" />
              <span className="text-slate-400 font-mono text-sm">Loading logs…</span>
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="flex items-center gap-3 rounded-md bg-red-900/20 border border-red-700/30 px-4 py-4">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-300">Failed to load logs</p>
                <p className="text-xs text-red-400/70 font-mono mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && data?.logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <Info className="h-8 w-8 text-slate-600" />
              <p className="text-slate-400 font-medium">No logs found</p>
              <p className="text-slate-600 text-sm font-mono">
                Try expanding the time range or changing the filter
              </p>
            </div>
          )}

          {/* Log rows */}
          {!isLoading && !error && data && data.logs.length > 0 && (
            <div className="space-y-1.5">
              {data.logs.map((log) => (
                <LogRow
                  key={log.id}
                  log={log}
                  isExpanded={expandedIds.has(log.id)}
                  onToggle={() => handleToggleRow(log.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
