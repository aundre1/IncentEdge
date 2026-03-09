'use client';

import * as React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface RecentSubscription {
  id: string;
  email: string;
  plan: string;
  amount: number;
  startDate: string;
  status: string;
}

interface RecentChurn {
  id: string;
  email: string;
  plan: string;
  churnedDate: string;
  revenueLost: number;
}

interface RevenueStats {
  mrr: number;
  arr: number;
  newToday: number;
  trialConversions: number;
  churnRate: number;
  monthlyRevenue: MonthlyRevenue[];
  recentSubscriptions: RecentSubscription[];
  recentChurn: RecentChurn[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const STATUS_BADGE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  trialing: 'secondary',
  canceled: 'destructive',
};

const PLAN_COLOR: Record<string, string> = {
  solo: 'text-emerald-400',
  team: 'text-blue-400',
  enterprise: 'text-purple-400',
  free: 'text-slate-400',
  unknown: 'text-slate-400',
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconClass?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
}: StatCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'rounded-lg p-2',
              iconClass ?? 'bg-slate-800 text-slate-400'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {trend && trend !== 'neutral' && (
          <div
            className={cn(
              'mt-3 flex items-center gap-1 text-xs',
              trend === 'up' ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend === 'up' ? 'Growing' : 'Declining'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Chart Tooltip ─────────────────────────────────────────────────────────────

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold text-white">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function RevenueDashboardPage() {
  const [stats, setStats] = React.useState<RevenueStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = React.useState<Date | null>(null);

  const fetchStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/revenue-stats');
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as RevenueStats;
      setStats(data);
      setLastRefreshed(new Date());
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load revenue data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-sora text-2xl font-bold text-white">
            Revenue Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Stripe subscription metrics and MRR breakdown
          </p>
          {lastRefreshed && (
            <p className="mt-0.5 text-xs text-slate-600">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchStats()}
          disabled={loading}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-900 bg-red-900/20 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-300">Failed to load revenue data</p>
            <p className="mt-0.5 text-sm text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-auto p-0 text-red-400 hover:text-red-300"
              onClick={() => void fetchStats()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-slate-900 border-slate-800">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                    <div className="h-7 w-28 animate-pulse rounded bg-slate-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="h-56 animate-pulse rounded bg-slate-800" />
            </CardContent>
          </Card>
        </div>
      )}

      {stats && (
        <>
          {/* ── Stat Row ─────────────────────────────────────────────────── */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="MRR"
              value={formatCurrency(stats.mrr)}
              subtitle="Monthly Recurring Revenue"
              icon={DollarSign}
              iconClass="bg-emerald-900/50 text-emerald-400"
              trend="up"
            />
            <StatCard
              title="ARR"
              value={formatCurrency(stats.arr)}
              subtitle="Annual Run Rate"
              icon={TrendingUp}
              iconClass="bg-blue-900/50 text-blue-400"
              trend="up"
            />
            <StatCard
              title="New Today"
              value={String(stats.newToday)}
              subtitle="New subscribers"
              icon={Users}
              iconClass="bg-indigo-900/50 text-indigo-400"
            />
            <StatCard
              title="Trial Conversions"
              value={String(stats.trialConversions)}
              subtitle="Converted this month"
              icon={UserCheck}
              iconClass="bg-violet-900/50 text-violet-400"
            />
            <StatCard
              title="Churn Rate"
              value={`${stats.churnRate}%`}
              subtitle="Canceled this month"
              icon={TrendingDown}
              iconClass={
                stats.churnRate > 5
                  ? 'bg-red-900/50 text-red-400'
                  : 'bg-slate-800 text-slate-400'
              }
              trend={stats.churnRate > 5 ? 'down' : 'neutral'}
            />
          </div>

          {/* ── MRR Bar Chart ─────────────────────────────────────────────── */}
          <Card className="mb-6 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Monthly Recurring Revenue</CardTitle>
              <CardDescription className="text-slate-400">
                Revenue collected over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.monthlyRevenue.every((r) => r.revenue === 0) ? (
                <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                  No billing events recorded yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={stats.monthlyRevenue}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1e293b"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => formatCurrency(v)}
                      width={72}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Recent Subscriptions Table ─────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Subscriptions</CardTitle>
                <CardDescription className="text-slate-400">
                  Latest active and trialing customers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {stats.recentSubscriptions.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-slate-500">
                    No active subscriptions yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-left">
                          <th className="px-6 py-3 font-medium text-slate-400">
                            Customer
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Plan
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Amount
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Started
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentSubscriptions.map((sub) => (
                          <tr
                            key={sub.id}
                            className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-3">
                              <span className="font-mono text-xs text-slate-300">
                                {sub.email}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'font-medium',
                                  PLAN_COLOR[sub.plan] ?? 'text-slate-300'
                                )}
                              >
                                {capitalize(sub.plan)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {formatCurrency(sub.amount)}
                              <span className="text-slate-500">/mo</span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {formatDate(sub.startDate)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  STATUS_BADGE_VARIANT[sub.status] ?? 'outline'
                                }
                                className="text-xs"
                              >
                                {capitalize(sub.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Recent Churn Table ─────────────────────────────────────── */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Churn</CardTitle>
                <CardDescription className="text-slate-400">
                  Canceled subscriptions in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {stats.recentChurn.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-slate-500">
                    No churn in the last 30 days
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-left">
                          <th className="px-6 py-3 font-medium text-slate-400">
                            Customer
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Plan
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Churned
                          </th>
                          <th className="px-4 py-3 font-medium text-slate-400">
                            Lost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentChurn.map((row) => (
                          <tr
                            key={row.id}
                            className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30"
                          >
                            <td className="px-6 py-3">
                              <span className="font-mono text-xs text-slate-300">
                                {row.email}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'font-medium',
                                  PLAN_COLOR[row.plan] ?? 'text-slate-300'
                                )}
                              >
                                {capitalize(row.plan)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {formatDate(row.churnedDate)}
                            </td>
                            <td className="px-4 py-3 text-red-400">
                              -{formatCurrency(row.revenueLost)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
