'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  CreditCard,
  Mail,
  Brain,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

type ServiceStatus = 'up' | 'degraded' | 'down';
type OverallStatus = 'up' | 'degraded' | 'down';

interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseMs: number;
  checkedAt: string;
  detail?: string;
}

interface HealthStatusResponse {
  services: ServiceCheck[];
  overall: OverallStatus;
  checkedAt: string;
}

interface Incident {
  id: string;
  serviceName: string;
  status: ServiceStatus;
  startedAt: string;
  resolvedAt: string | null;
  durationMs: number | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const POLL_INTERVAL_MS = 30_000;

const SERVICE_ICONS: Record<string, React.ElementType> = {
  'Supabase DB': Database,
  'Stripe': CreditCard,
  'Resend Email': Mail,
  'AI Service (Anthropic)': Brain,
  'App Server': Server,
};

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dotClass: string; badgeClass: string; Icon: React.ElementType }
> = {
  up: {
    label: 'Operational',
    dotClass: 'bg-emerald-500 shadow-emerald-500/50',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    dotClass: 'bg-amber-400 shadow-amber-400/50',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    Icon: AlertTriangle,
  },
  down: {
    label: 'Down',
    dotClass: 'bg-red-500 shadow-red-500/50',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    Icon: XCircle,
  },
};

const OVERALL_BANNER_CLASS: Record<OverallStatus, string> = {
  up: 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-900/10',
  degraded: 'border-amber-200 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-900/10',
  down: 'border-red-200 bg-red-50/60 dark:border-red-800/50 dark:bg-red-900/10',
};

const OVERALL_TEXT: Record<OverallStatus, string> = {
  up: 'All Systems Operational',
  degraded: 'Partial Degradation Detected',
  down: 'Service Disruption',
};

// ============================================================================
// HELPERS
// ============================================================================

function formatRelativeSeconds(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  return remSec > 0 ? `${min}m ${remSec}s` : `${min}m`;
}

function computeUptimePercent(incidents: Incident[], serviceName: string): string {
  const serviceIncidents = incidents.filter((i) => i.serviceName === serviceName);
  if (serviceIncidents.length === 0) return '100.00%';

  // Use a 24-hour window for uptime calculation
  const windowMs = 24 * 60 * 60 * 1000;
  const windowStart = Date.now() - windowMs;

  let downtimeMs = 0;
  for (const incident of serviceIncidents) {
    const incidentStart = Math.max(new Date(incident.startedAt).getTime(), windowStart);
    const incidentEnd = incident.resolvedAt
      ? new Date(incident.resolvedAt).getTime()
      : Date.now();
    const overlap = Math.max(0, incidentEnd - incidentStart);
    downtimeMs += overlap;
  }

  const uptimeRatio = Math.max(0, 1 - downtimeMs / windowMs);
  return `${(uptimeRatio * 100).toFixed(2)}%`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthStatusResponse | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  // Track the previous service statuses to detect transitions
  const [prevStatuses, setPrevStatuses] = useState<Record<string, ServiceStatus>>({});

  const fetchHealthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/health-status', {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please sign in.');
        } else if (response.status === 403) {
          setError('Access denied. Admin role required.');
        } else {
          setError(`Unexpected response: HTTP ${response.status}`);
        }
        return;
      }

      const freshData: HealthStatusResponse = await response.json();
      setData(freshData);
      setError(null);
      setLastFetchedAt(new Date().toISOString());
      setSecondsSinceUpdate(0);

      // Detect transitions to degraded/down and record incidents
      setIncidents((prev) => {
        const next = [...prev];
        const now = new Date().toISOString();

        for (const service of freshData.services) {
          const prevStatus = prevStatuses[service.name];
          const currentStatus = service.status;

          if (
            prevStatus === undefined ||
            (prevStatus === 'up' && currentStatus !== 'up')
          ) {
            // New incident: service transitioned to degraded/down
            if (currentStatus !== 'up') {
              next.push({
                id: `${service.name}-${Date.now()}`,
                serviceName: service.name,
                status: currentStatus,
                startedAt: now,
                resolvedAt: null,
                durationMs: null,
              });
            }
          } else if (prevStatus !== 'up' && currentStatus === 'up') {
            // Resolve open incident for this service
            const openIdx = next.findIndex(
              (i) => i.serviceName === service.name && i.resolvedAt === null
            );
            if (openIdx !== -1) {
              const startMs = new Date(next[openIdx].startedAt).getTime();
              next[openIdx] = {
                ...next[openIdx],
                resolvedAt: now,
                durationMs: Date.now() - startMs,
              };
            }
          }
        }

        return next;
      });

      // Update prevStatuses from freshData
      setPrevStatuses(() => {
        const updated: Record<string, ServiceStatus> = {};
        for (const s of freshData.services) {
          updated[s.name] = s.status;
        }
        return updated;
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health status'
      );
    } finally {
      setLoading(false);
    }
  }, [prevStatuses]);

  // Initial fetch + polling
  useEffect(() => {
    fetchHealthStatus();
    const pollTimer = setInterval(fetchHealthStatus, POLL_INTERVAL_MS);
    return () => clearInterval(pollTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick the "last updated X seconds ago" counter every second
  useEffect(() => {
    const ticker = setInterval(() => {
      setSecondsSinceUpdate((s) => s + 1);
    }, 1000);
    return () => clearInterval(ticker);
  }, []);

  const openIncidents = incidents.filter((i) => i.resolvedAt === null);
  const resolvedIncidents = incidents.filter((i) => i.resolvedAt !== null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            API Health Monitor
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Real-time status of all external service integrations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetchedAt && (
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {secondsSinceUpdate < 5 ? 'just now' : `${secondsSinceUpdate}s ago`}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealthStatus}
            disabled={loading}
            className="border-navy-200 dark:border-navy-700"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Card className="border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-900/10">
          <CardContent className="flex items-center gap-3 py-4">
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Overall status banner */}
      {data && (
        <Card
          className={`border ${OVERALL_BANNER_CLASS[data.overall]}`}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <Activity
              className={`h-6 w-6 shrink-0 ${
                data.overall === 'up'
                  ? 'text-emerald-500'
                  : data.overall === 'degraded'
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
            />
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">
                {OVERALL_TEXT[data.overall]}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last checked {formatRelativeSeconds(data.checkedAt)}
              </p>
            </div>
            <Badge
              className={`ml-auto ${STATUS_CONFIG[data.overall].badgeClass}`}
            >
              {data.overall === 'up' ? 'All Clear' : data.overall === 'degraded' ? 'Degraded' : 'Down'}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Service cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && !data
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="card-v41 animate-pulse border-navy-200 dark:border-navy-700"
              >
                <CardHeader className="pb-3">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-navy-700" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 w-20 rounded bg-slate-200 dark:bg-navy-700" />
                  <div className="h-3 w-28 rounded bg-slate-100 dark:bg-navy-800" />
                </CardContent>
              </Card>
            ))
          : data?.services.map((service) => {
              const config = STATUS_CONFIG[service.status];
              const Icon = SERVICE_ICONS[service.name] ?? Server;
              const uptimePercent = computeUptimePercent(incidents, service.name);

              return (
                <Card
                  key={service.name}
                  className="card-v41 border-navy-200 dark:border-navy-700"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <CardTitle className="text-sm font-medium text-navy-900 dark:text-white">
                          {service.name}
                        </CardTitle>
                      </div>
                      {/* Status dot with pulse animation for non-up states */}
                      <span className="relative flex h-2.5 w-2.5">
                        {service.status !== 'up' && (
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`}
                          />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2.5 w-2.5 shadow-md ${config.dotClass}`}
                        />
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Status badge */}
                    <Badge className={`text-xs ${config.badgeClass}`}>
                      {config.label}
                    </Badge>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Response</p>
                        <p className="font-mono font-medium text-navy-900 dark:text-white">
                          {service.responseMs === 0 ? '—' : `${service.responseMs}ms`}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Uptime (24h)</p>
                        <p className="font-mono font-medium text-navy-900 dark:text-white">
                          {uptimePercent}
                        </p>
                      </div>
                    </div>

                    {/* Last checked */}
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeSeconds(service.checkedAt)}
                    </p>

                    {/* Optional detail message (e.g. missing key) */}
                    {service.detail && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 truncate" title={service.detail}>
                        {service.detail}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Incidents section */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white">
          Incidents
        </h2>

        {openIncidents.length === 0 && resolvedIncidents.length === 0 ? (
          <Card className="card-v41 border-navy-200 dark:border-navy-700">
            <CardContent className="flex items-center gap-3 py-6">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No incidents recorded this session.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {/* Open incidents */}
            {openIncidents.map((incident) => {
              const config = STATUS_CONFIG[incident.status];
              const IncidentIcon = config.Icon;

              return (
                <Card
                  key={incident.id}
                  className="border-amber-200 dark:border-amber-800/50 bg-amber-50/40 dark:bg-amber-900/10"
                >
                  <CardContent className="flex items-start gap-3 py-4">
                    <IncidentIcon className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">
                          {incident.serviceName}
                        </p>
                        <Badge className={`text-xs ${config.badgeClass}`}>
                          {config.label}
                        </Badge>
                        <Badge className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          Ongoing
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Started {formatRelativeSeconds(incident.startedAt)} &bull; Ongoing
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Resolved incidents */}
            {resolvedIncidents.map((incident) => {
              const config = STATUS_CONFIG[incident.status];
              const IncidentIcon = config.Icon;

              return (
                <Card
                  key={incident.id}
                  className="card-v41 border-navy-200 dark:border-navy-700 opacity-80"
                >
                  <CardContent className="flex items-start gap-3 py-4">
                    <IncidentIcon className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-navy-900 dark:text-white">
                          {incident.serviceName}
                        </p>
                        <Badge className={`text-xs ${config.badgeClass}`}>
                          {config.label}
                        </Badge>
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          Resolved
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Started {formatRelativeSeconds(incident.startedAt)}
                        {incident.durationMs !== null && (
                          <> &bull; Duration {formatDuration(incident.durationMs)}</>
                        )}
                        {incident.resolvedAt && (
                          <> &bull; Resolved {formatRelativeSeconds(incident.resolvedAt)}</>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Polling every 30 seconds &bull; Uptime calculated over the last 24 hours &bull; Incidents tracked for current session only
      </p>
    </div>
  );
}
