'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  UserCheck,
  FolderOpen,
  Search,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

type Range = 'today' | '7d' | '30d' | 'all';

interface FunnelStep {
  step: number;
  label: string;
  count: number;
  pctOfPrevious: number | null;
  deltaVsLastWeek: number | null;
}

interface DailySignup {
  date: string;
  count: number;
}

interface RecentUser {
  email: string;
  signedUpAt: string;
  onboarded: boolean;
  searched: boolean;
  paid: boolean;
}

interface FunnelStatsData {
  funnel: FunnelStep[];
  dailySignups: DailySignup[];
  recentUsers: RecentUser[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RANGE_OPTIONS: Array<{ value: Range; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

const STEP_ICONS = [Users, UserCheck, FolderOpen, Search, CreditCard];

const STEP_COLORS = [
  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
];

const STEP_BAR_COLORS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#10b981'];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface DeltaBadgeProps {
  delta: number | null;
}

function DeltaBadge({ delta }: DeltaBadgeProps) {
  if (delta === null) return null;

  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        +{delta}
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-400">
        <TrendingDown className="h-3 w-3" />
        {delta}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500">
      <Minus className="h-3 w-3" />0
    </span>
  );
}

interface FunnelStepCardProps {
  step: FunnelStep;
  maxCount: number;
  isLast: boolean;
}

function FunnelStepCard({ step, maxCount, isLast }: FunnelStepCardProps) {
  const Icon = STEP_ICONS[step.step - 1] ?? Users;
  const colorClass = STEP_COLORS[step.step - 1] ?? STEP_COLORS[0];
  const barWidth = maxCount > 0 ? Math.round((step.count / maxCount) * 100) : 0;
  const barColor = STEP_BAR_COLORS[step.step - 1] ?? STEP_BAR_COLORS[0];

  return (
    <div className="relative">
      {/* Step card */}
      <div className="rounded-xl border border-navy-700/50 bg-navy-800/40 p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          {/* Left: icon + label */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`rounded-lg border p-2 shrink-0 ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Step {step.step}
              </p>
              <p className="font-semibold text-white truncate">{step.label}</p>
            </div>
          </div>

          {/* Right: count + delta */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold font-mono text-white">
              {step.count.toLocaleString()}
            </p>
            <DeltaBadge delta={step.deltaVsLastWeek} />
          </div>
        </div>

        {/* Width bar showing proportion */}
        <div className="mt-3 h-1.5 w-full rounded-full bg-navy-700/60">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${barWidth}%`, backgroundColor: barColor }}
          />
        </div>
      </div>

      {/* Drop-off connector */}
      {!isLast && step.pctOfPrevious !== null && (
        <div className="flex items-center gap-3 py-1.5 px-4">
          <div className="h-5 w-px bg-navy-700 ml-5" />
          <span className="text-xs text-slate-500">
            {step.pctOfPrevious}% converted from previous step
          </span>
          {step.pctOfPrevious < 50 && (
            <Badge className="text-xs bg-red-900/30 text-red-400 border-red-700/40 border">
              Low
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

interface ChartTooltipPayloadEntry {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-navy-600/50 bg-navy-800 px-3 py-2 shadow-xl">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-white">
        {(payload[0]?.value ?? 0).toLocaleString()} signups
      </p>
    </div>
  );
}

interface RecentUsersTableProps {
  users: RecentUser[];
}

function RecentUsersTable({ users }: RecentUsersTableProps) {
  const [expanded, setExpanded] = useState(false);
  const displayedUsers = expanded ? users : users.slice(0, 10);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-700/50">
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 pr-4">
              Email
            </th>
            <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 pr-4">
              Signed Up
            </th>
            <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 pr-4">
              Onboarded
            </th>
            <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 pr-4">
              Searched
            </th>
            <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
              Paid
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-700/30">
          {displayedUsers.map((u, idx) => (
            <tr
              key={`${u.email}-${idx}`}
              className="hover:bg-navy-700/20 transition-colors"
            >
              <td className="py-2.5 pr-4 font-mono text-xs text-slate-300 truncate max-w-[220px]">
                {u.email}
              </td>
              <td className="py-2.5 pr-4 text-xs text-slate-400 whitespace-nowrap">
                {new Date(u.signedUpAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="py-2.5 pr-4 text-center">
                <StatusDot active={u.onboarded} />
              </td>
              <td className="py-2.5 pr-4 text-center">
                <StatusDot active={u.searched} />
              </td>
              <td className="py-2.5 text-center">
                <StatusDot active={u.paid} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length > 10 && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-400 hover:text-white transition-colors py-1"
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
          {expanded ? 'Show less' : `Show ${users.length - 10} more`}
        </button>
      )}
    </div>
  );
}

interface StatusDotProps {
  active: boolean;
}

function StatusDot({ active }: StatusDotProps) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        active ? 'bg-emerald-400' : 'bg-slate-600'
      }`}
      aria-label={active ? 'Yes' : 'No'}
    />
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function FunnelPage() {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<FunnelStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (selectedRange: Range) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/funnel-stats?range=${selectedRange}`);

      if (response.status === 401) {
        setError('You must be signed in to view this page.');
        return;
      }

      if (response.status === 403) {
        setError('Access denied. Admin role required.');
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json: FunnelStatsData = await response.json();
      setData(json);
    } catch (err) {
      console.error('[FunnelPage] fetch error:', err);
      setError('Failed to load funnel data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(range);
  }, [range, fetchStats]);

  const handleRangeChange = (newRange: Range) => {
    setRange(newRange);
  };

  const maxFunnelCount = data
    ? Math.max(...data.funnel.map((s) => s.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-sora text-white">
              Signup Funnel
            </h1>
            <Badge className="bg-blue-900/40 text-blue-400 border border-blue-700/40 text-xs">
              Admin
            </Badge>
          </div>
          <p className="text-slate-400 mt-1">
            Conversion tracking from lead capture to paid subscriber.
          </p>
        </div>

        {/* Range selector */}
        <div className="flex items-center gap-1 rounded-lg border border-navy-700/50 bg-navy-800/60 p-1 shrink-0">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleRangeChange(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                range === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          {/* Funnel Steps */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Vertical funnel */}
            <div>
              <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-sora text-base text-white">
                    Conversion Funnel
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {range === 'all'
                      ? 'All time totals'
                      : `Last ${range === 'today' ? '24 hours' : range === '7d' ? '7 days' : '30 days'} vs prior week`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 pt-2">
                  {data.funnel.map((step, idx) => (
                    <FunnelStepCard
                      key={step.step}
                      step={step}
                      maxCount={maxFunnelCount}
                      isLast={idx === data.funnel.length - 1}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Summary stats + bar chart breakdown */}
            <div className="space-y-4">
              {/* Quick stat cards */}
              <div className="grid grid-cols-2 gap-3">
                {data.funnel.map((step) => {
                  const Icon = STEP_ICONS[step.step - 1] ?? Users;
                  const colorClass = STEP_COLORS[step.step - 1] ?? STEP_COLORS[0];
                  return (
                    <div
                      key={step.step}
                      className="rounded-xl border border-navy-700/50 bg-navy-800/40 p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`rounded-md border p-1.5 ${colorClass}`}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <span className="text-xs text-slate-400 truncate">{step.label}</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-white">
                        {step.count.toLocaleString()}
                      </p>
                      {step.pctOfPrevious !== null && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {step.pctOfPrevious}% of prev step
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall conversion rate */}
              {data.funnel.length >= 2 && (
                <Card className="border-navy-700/50 bg-navy-800/40">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        Lead-to-Paid Rate
                      </p>
                      <p className="text-3xl font-bold font-mono text-emerald-400 mt-0.5">
                        {data.funnel[0].count > 0
                          ? `${Math.round(
                              ((data.funnel[data.funnel.length - 1].count) /
                                data.funnel[0].count) *
                                100
                            )}%`
                          : '—'}
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-500/10 p-3 border border-emerald-500/20">
                      <CreditCard className="h-6 w-6 text-emerald-400" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Daily Signups Chart */}
          <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-sora text-base text-white">
                Daily New Signups
              </CardTitle>
              <CardDescription className="text-slate-400">
                New user registrations over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.dailySignups}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val: string) => {
                        const d = new Date(val + 'T00:00:00');
                        return d.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Signups Table */}
          <Card className="border-navy-700/50 bg-navy-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-sora text-base text-white">
                    Recent Signups
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest {data.recentUsers.length} registered users with funnel progress
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-600" />
                    Not yet
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentUsers.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  No signups found for this time range.
                </p>
              ) : (
                <RecentUsersTable users={data.recentUsers} />
              )}
            </CardContent>
          </Card>

          {/* Refresh button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(range)}
              className="border-navy-700 text-slate-400 hover:text-white hover:border-navy-500 text-xs"
            >
              Refresh data
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
