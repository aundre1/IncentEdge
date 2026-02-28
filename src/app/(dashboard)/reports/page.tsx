'use client';

import { useState, Suspense } from 'react';
import {
  FileText,
  Download,
  Printer,
  Building2,
  FileBarChart,
  PieChart,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  MapPin,
  Calendar,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  allIncentives,
  projectData,
  getPortfolioStats,
  type Incentive,
} from '@/data/incentives';

// ============================================================================
// TYPES
// ============================================================================

type ProjectKey = 'portfolio' | 'mt-vernon' | 'yonkers' | 'new-rochelle';
type ReportType = 'portfolio-summary' | 'incentive-analysis' | 'project-detail';

interface TypeBreakdown {
  type: string;
  label: string;
  count: number;
  value: number;
  color: string;
  bgColor: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROJECT_BUTTONS: { key: ProjectKey; label: string; shortLabel: string }[] = [
  { key: 'portfolio', label: 'Portfolio Overview', shortLabel: 'Portfolio' },
  { key: 'mt-vernon', label: 'Mount Vernon', shortLabel: 'Mt Vernon' },
  { key: 'yonkers', label: 'Yonkers', shortLabel: 'Yonkers' },
  { key: 'new-rochelle', label: 'New Rochelle', shortLabel: 'New Rochelle' },
];

const REPORT_TABS: { key: ReportType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'portfolio-summary', label: 'Portfolio Summary', icon: PieChart },
  { key: 'incentive-analysis', label: 'Incentive Analysis', icon: BarChart3 },
  { key: 'project-detail', label: 'Project Detail', icon: FileBarChart },
];

const TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; badgeClass: string }> = {
  federal:  { label: 'Federal',  color: 'text-blue-700 dark:text-blue-300',   bgColor: 'bg-blue-50 dark:bg-blue-950/40',   badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' },
  state:    { label: 'State',    color: 'text-teal-700 dark:text-teal-300',   bgColor: 'bg-teal-50 dark:bg-teal-950/40',   badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' },
  local:    { label: 'Local',    color: 'text-violet-700 dark:text-violet-300', bgColor: 'bg-violet-50 dark:bg-violet-950/40', badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200' },
  utility:  { label: 'Utility',  color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950/40', badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' },
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  captured: { label: 'Captured',   icon: CheckCircle2, className: 'text-green-600 dark:text-green-400' },
  pending:  { label: 'Pending',    icon: Clock,        className: 'text-amber-600 dark:text-amber-400' },
  'at-risk':{ label: 'At Risk',    icon: AlertCircle,  className: 'text-red-600 dark:text-red-400' },
};

// ============================================================================
// HELPERS
// ============================================================================

function fmt(val: number, decimals = 1): string {
  return `$${val.toFixed(decimals)}M`;
}

function getIncentivesForProject(key: ProjectKey): Incentive[] {
  if (key === 'portfolio') {
    return Object.values(allIncentives).flat();
  }
  return allIncentives[key] || [];
}

function buildTypeBreakdown(incentives: Incentive[]): TypeBreakdown[] {
  const types = ['federal', 'state', 'local', 'utility'] as const;
  const total = incentives.reduce((s, i) => s + i.amount, 0);
  return types.map(t => {
    const items = incentives.filter(i => i.type === t);
    const value = items.reduce((s, i) => s + i.amount, 0);
    const cfg = TYPE_CONFIG[t];
    return {
      type: t,
      label: cfg.label,
      count: items.length,
      value,
      color: cfg.color,
      bgColor: cfg.bgColor,
    };
  }).filter(b => b.count > 0).sort((a, b) => b.value - a.value);
}

function getTopPrograms(incentives: Incentive[], n = 5): Incentive[] {
  return [...incentives].sort((a, b) => b.amount - a.amount).slice(0, n);
}

// ============================================================================
// MINI BAR CHART
// ============================================================================

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ============================================================================
// DONUT CHART (CSS-based)
// ============================================================================

function DonutSegment({ breakdowns }: { breakdowns: TypeBreakdown[] }) {
  const total = breakdowns.reduce((s, b) => s + b.value, 0);
  const colors = ['bg-blue-500', 'bg-teal-500', 'bg-violet-500', 'bg-amber-500'];
  let cumulativePct = 0;
  const segments = breakdowns.map((b, i) => {
    const pct = total > 0 ? (b.value / total) * 100 : 0;
    const start = cumulativePct;
    cumulativePct += pct;
    return { ...b, pct, start, color: colors[i] || 'bg-gray-400' };
  });

  return (
    <div className="flex items-center gap-6">
      {/* Stacked bar as donut proxy */}
      <div className="flex h-32 w-32 flex-shrink-0 flex-col overflow-hidden rounded-full border-4 border-gray-100 dark:border-gray-800 shadow-inner relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-bold text-deep-900 dark:text-white">{fmt(total, 0)}</div>
            <div className="text-[10px] text-deep-500 dark:text-gray-400">Total</div>
          </div>
        </div>
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {segments.map((seg, i) => {
            const dashOffset = 100 - seg.start;
            return (
              <circle
                key={i}
                cx="18" cy="18" r="14"
                fill="none"
                stroke={['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b'][i] || '#9ca3af'}
                strokeWidth="5"
                strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                strokeDashoffset={dashOffset}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-sm flex-shrink-0 ${seg.color}`} />
            <span className="text-sm text-deep-700 dark:text-gray-300">{seg.label}</span>
            <span className="ml-auto pl-4 text-sm font-semibold text-deep-900 dark:text-white">{fmt(seg.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-deep-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-deep-900 dark:text-white">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-deep-500 dark:text-gray-400">{sub}</p>}
          </div>
          <div className={`rounded-lg p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REPORT: PORTFOLIO SUMMARY
// ============================================================================

function PortfolioSummaryReport({ projectKey }: { projectKey: ProjectKey }) {
  const incentives = getIncentivesForProject(projectKey);
  const stats = getPortfolioStats(incentives);
  const breakdown = buildTypeBreakdown(incentives);
  const top5 = getTopPrograms(incentives, 5);

  const projectKeys: Array<'mt-vernon' | 'yonkers' | 'new-rochelle'> = projectKey === 'portfolio'
    ? ['mt-vernon', 'yonkers', 'new-rochelle']
    : [projectKey as 'mt-vernon' | 'yonkers' | 'new-rochelle'];

  const totalTDC: number = projectKeys.reduce((s, k) => s + (projectData[k]?.tdc || 0), 0);
  const projectCount = projectKeys.length;

  return (
    <div className="space-y-6">
      {/* Summary KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Incentive Value"
          value={fmt(stats.total)}
          sub={`${stats.programCount} programs`}
          icon={DollarSign}
          color="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
        />
        <StatCard
          label="Expected Value"
          value={fmt(stats.expected)}
          sub={`${stats.avgProb}% avg probability`}
          icon={TrendingUp}
          color="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
        />
        <StatCard
          label="Captured"
          value={fmt(stats.captured)}
          sub={`${stats.captureRate}% capture rate`}
          icon={CheckCircle2}
          color="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300"
        />
        <StatCard
          label="Pipeline Value"
          value={fmt(stats.pipeline)}
          sub={`${stats.pendingCount + stats.atRiskCount} active programs`}
          icon={Target}
          color="bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300"
        />
      </div>

      {/* Second row: additional project stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={projectCount > 1 ? 'Projects' : 'Project'}
          value={String(projectCount)}
          sub="active in portfolio"
          icon={Building2}
          color="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        />
        <StatCard
          label="Total Dev Cost"
          value={fmt(totalTDC)}
          sub="combined TDC"
          icon={Layers}
          color="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
        />
        <StatCard
          label="Incentive Ratio"
          value={totalTDC > 0 ? `${Math.round((stats.total / totalTDC) * 100)}%` : '—'}
          sub="of TDC from incentives"
          icon={ArrowUpRight}
          color="bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
        />
        <StatCard
          label="At Risk"
          value={fmt(stats.atRisk)}
          sub={`${stats.atRiskCount} programs need action`}
          icon={AlertCircle}
          color="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Breakdown by type */}
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Breakdown by Source</CardTitle>
            <CardDescription>Distribution across federal, state, local and utility programs</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutSegment breakdowns={breakdown} />
            <Separator className="my-4" />
            <div className="space-y-3">
              {breakdown.map(b => (
                <div key={b.type}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={`font-medium ${b.color}`}>{b.label}</span>
                    <span className="text-deep-700 dark:text-gray-300">{fmt(b.value)} · {b.count} programs</span>
                  </div>
                  <MiniBar
                    value={b.value}
                    max={incentives.reduce((s, i) => s + i.amount, 0)}
                    color={
                      b.type === 'federal' ? 'bg-blue-500' :
                      b.type === 'state' ? 'bg-teal-500' :
                      b.type === 'local' ? 'bg-violet-500' : 'bg-amber-500'
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 programs */}
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top 5 Programs by Value</CardTitle>
            <CardDescription>Highest-value incentive opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top5.map((prog, i) => {
                const cfg = TYPE_CONFIG[prog.type];
                const statusCfg = STATUS_CONFIG[prog.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={prog.id} className="flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700/50 p-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/50 text-xs font-bold text-teal-700 dark:text-teal-300">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-deep-900 dark:text-white">{prog.program}</p>
                      <p className="truncate text-xs text-deep-500 dark:text-gray-400">{prog.agency}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-deep-900 dark:text-white">{fmt(prog.amount)}</span>
                      <span className={`inline-flex items-center gap-0.5 text-xs ${statusCfg.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project-level comparison (portfolio view only) */}
      {projectKey === 'portfolio' && (
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Project Comparison</CardTitle>
            <CardDescription>Total incentive potential by project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 text-left font-medium text-deep-500 dark:text-gray-400">Project</th>
                    <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Units</th>
                    <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">TDC</th>
                    <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Programs</th>
                    <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Total Value</th>
                    <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">% of TDC</th>
                  </tr>
                </thead>
                <tbody>
                  {(['mt-vernon', 'yonkers', 'new-rochelle'] as const).map(k => {
                    const proj = projectData[k];
                    const inc = allIncentives[k] || [];
                    const total = inc.reduce((s, i) => s + i.amount, 0);
                    const pctTDC = proj.tdc > 0 ? Math.round((total / proj.tdc) * 100) : 0;
                    return (
                      <tr key={k} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                        <td className="py-3">
                          <div className="font-medium text-deep-900 dark:text-white">{proj.name}</div>
                          <div className="text-xs text-deep-500 dark:text-gray-400">{proj.type}</div>
                        </td>
                        <td className="py-3 text-right text-deep-700 dark:text-gray-300">{proj.units}</td>
                        <td className="py-3 text-right text-deep-700 dark:text-gray-300">{fmt(proj.tdc)}</td>
                        <td className="py-3 text-right text-deep-700 dark:text-gray-300">{inc.length}</td>
                        <td className="py-3 text-right font-semibold text-deep-900 dark:text-white">{fmt(total)}</td>
                        <td className="py-3 text-right">
                          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                            {pctTDC}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                    <td className="py-3 font-bold text-deep-900 dark:text-white">Portfolio Total</td>
                    <td className="py-3 text-right font-bold text-deep-900 dark:text-white">1,487 units</td>
                    <td className="py-3 text-right font-bold text-deep-900 dark:text-white">{fmt(totalTDC)}</td>
                    <td className="py-3 text-right font-bold text-deep-900 dark:text-white">{incentives.length}</td>
                    <td className="py-3 text-right font-bold text-teal-700 dark:text-teal-300">{fmt(stats.total)}</td>
                    <td className="py-3 text-right">
                      <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 font-bold">
                        {totalTDC > 0 ? Math.round((stats.total / totalTDC) * 100) : 0}%
                      </Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// REPORT: INCENTIVE ANALYSIS
// ============================================================================

function IncentiveAnalysisReport({ projectKey }: { projectKey: ProjectKey }) {
  const incentives = getIncentivesForProject(projectKey);
  const stats = getPortfolioStats(incentives);
  const breakdown = buildTypeBreakdown(incentives);

  // Stacking opportunities: programs with same project that are not at-risk
  const stackingGroups = breakdown.filter(b => b.value > 0);

  // Capture timeline: group by deadline
  const urgentCount = incentives.filter(i => i.deadline !== '-' && parseInt(i.deadline) <= 60).length;
  const nearTermCount = incentives.filter(i => i.deadline !== '-' && parseInt(i.deadline) > 60 && parseInt(i.deadline) <= 120).length;
  const longTermCount = incentives.filter(i => i.deadline !== '-' && parseInt(i.deadline) > 120).length;
  const capturedAlready = incentives.filter(i => i.deadline === '-').length;

  return (
    <div className="space-y-6">
      {/* Status distribution */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 p-4 text-center">
          <CheckCircle2 className="mx-auto h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">{fmt(stats.captured)}</div>
          <div className="text-sm text-green-600 dark:text-green-400">{stats.capturedCount} programs captured</div>
        </div>
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
          <Clock className="mx-auto h-6 w-6 text-amber-600 dark:text-amber-400 mb-2" />
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{fmt(stats.pending)}</div>
          <div className="text-sm text-amber-600 dark:text-amber-400">{stats.pendingCount} programs pending</div>
        </div>
        <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 p-4 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-red-600 dark:text-red-400 mb-2" />
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{fmt(stats.atRisk)}</div>
          <div className="text-sm text-red-600 dark:text-red-400">{stats.atRiskCount} programs at risk</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stacking analysis */}
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Stacking Analysis</CardTitle>
            <CardDescription>Incentives that can be combined for maximum value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stackingGroups.map(g => {
              const cfg = TYPE_CONFIG[g.type];
              return (
                <div key={g.type} className={`rounded-lg p-3 ${g.bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${g.color}`}>{g.label} Programs</span>
                    <span className={`text-sm font-bold ${g.color}`}>{fmt(g.value)}</span>
                  </div>
                  <div className="text-xs text-deep-600 dark:text-gray-400 mb-2">
                    {g.count} programs — stackable with other sources
                  </div>
                  <MiniBar
                    value={g.value}
                    max={incentives.reduce((s, i) => s + i.amount, 0)}
                    color={
                      g.type === 'federal' ? 'bg-blue-500' :
                      g.type === 'state' ? 'bg-teal-500' :
                      g.type === 'local' ? 'bg-violet-500' : 'bg-amber-500'
                    }
                  />
                </div>
              );
            })}
            <div className="rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/20 p-3">
              <div className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-1">
                Maximum Stack Value
              </div>
              <div className="text-xl font-bold text-teal-700 dark:text-teal-300">{fmt(stats.total)}</div>
              <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                All programs are stackable across federal, state, local, and utility sources
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capture timeline */}
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Capture Timeline</CardTitle>
            <CardDescription>Programs organized by urgency and deadline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 p-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-red-800 dark:text-red-200">Urgent (0–60 days)</div>
                <div className="text-xs text-red-600 dark:text-red-400">{urgentCount} programs require immediate action</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-amber-800 dark:text-amber-200">Near-Term (61–120 days)</div>
                <div className="text-xs text-amber-600 dark:text-amber-400">{nearTermCount} programs in preparation phase</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 p-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">Long-Term (120+ days)</div>
                <div className="text-xs text-blue-600 dark:text-blue-400">{longTermCount} programs for future capture</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 p-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-green-800 dark:text-green-200">Already Captured</div>
                <div className="text-xs text-green-600 dark:text-green-400">{capturedAlready} programs secured</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">AI Recommendations</CardTitle>
          <CardDescription>Priority actions to maximize incentive capture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                priority: 'Critical',
                color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
                action: 'File IDA PILOT applications within 60 days',
                impact: `${fmt(breakdown.find(b => b.type === 'local')?.value || 0)} local incentive value at stake`,
              },
              {
                priority: 'High',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                action: 'Engage NYSERDA for New Construction pathway approval',
                impact: 'State programs require 90–150 day lead time',
              },
              {
                priority: 'High',
                color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
                action: 'Lock in Section 48 ITC with energy consultant',
                impact: `${fmt(breakdown.find(b => b.type === 'federal')?.value || 0)} federal programs require documentation`,
              },
              {
                priority: 'Medium',
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                action: 'Begin Con Edison demand response pre-qualification',
                impact: 'Utility incentives available on rolling basis',
              },
            ].map((rec, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-700/50 p-3">
                <Badge className={rec.color}>{rec.priority}</Badge>
                <div>
                  <div className="text-sm font-medium text-deep-900 dark:text-white">{rec.action}</div>
                  <div className="text-xs text-deep-500 dark:text-gray-400 mt-0.5">{rec.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// REPORT: PROJECT DETAIL
// ============================================================================

function ProjectDetailReport({ projectKey }: { projectKey: ProjectKey }) {
  const effectiveKey: Exclude<ProjectKey, 'portfolio'> = projectKey === 'portfolio' ? 'mt-vernon' : projectKey;
  const proj = projectData[effectiveKey];
  const incentives = allIncentives[effectiveKey] || [];
  const stats = getPortfolioStats(incentives);
  const breakdown = buildTypeBreakdown(incentives);
  const maxIncentive = Math.max(...incentives.map(i => i.amount));

  const [filterType, setFilterType] = useState<string>('all');
  const filtered = filterType === 'all' ? incentives : incentives.filter(i => i.type === filterType);

  return (
    <div className="space-y-6">
      {projectKey === 'portfolio' && (
        <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          Showing detail for <strong>Mount Vernon Mixed-Use</strong> (select a specific project above for its detail report).
        </div>
      )}

      {/* Project header */}
      <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-100 dark:bg-teal-900/50 p-3">
                <Building2 className="h-6 w-6 text-teal-700 dark:text-teal-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-deep-900 dark:text-white">{proj.name}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-deep-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {proj.address}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">{proj.type}</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">{proj.tier}</Badge>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Residential Units', value: proj.units },
              { label: 'Total Dev Cost', value: fmt(proj.tdc) },
              { label: 'Total Incentive Value', value: fmt(stats.total) },
              { label: 'Incentive / TDC', value: `${Math.round((stats.total / proj.tdc) * 100)}%` },
            ].map(item => (
              <div key={item.label}>
                <div className="text-xs font-medium uppercase tracking-wider text-deep-500 dark:text-gray-400">{item.label}</div>
                <div className="mt-1 text-lg font-bold text-deep-900 dark:text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Type filter + incentive table */}
      <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">All Incentive Programs</CardTitle>
              <CardDescription>{incentives.length} programs · {fmt(stats.total)} total value</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'federal', 'state', 'local', 'utility'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    filterType === t
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-deep-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t === 'all' ? `All (${incentives.length})` : `${TYPE_CONFIG[t]?.label} (${incentives.filter(i => i.type === t).length})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 text-left font-medium text-deep-500 dark:text-gray-400">Program</th>
                  <th className="pb-2 text-left font-medium text-deep-500 dark:text-gray-400 hidden sm:table-cell">Agency</th>
                  <th className="pb-2 text-left font-medium text-deep-500 dark:text-gray-400">Type</th>
                  <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Value</th>
                  <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Prob</th>
                  <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400">Status</th>
                  <th className="pb-2 text-right font-medium text-deep-500 dark:text-gray-400 hidden sm:table-cell">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => {
                  const typeCfg = TYPE_CONFIG[inc.type];
                  const statusCfg = STATUS_CONFIG[inc.status];
                  const StatusIcon = statusCfg.icon;
                  return (
                    <tr key={inc.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-deep-900 dark:text-white">{inc.program}</div>
                        <div className="text-xs text-deep-500 dark:text-gray-400 mt-0.5 max-w-xs truncate">{inc.desc}</div>
                        <div className="mt-1">
                          <MiniBar value={inc.amount} max={maxIncentive} color="bg-teal-400 dark:bg-teal-500" />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-deep-600 dark:text-gray-400 hidden sm:table-cell whitespace-nowrap">{inc.agency}</td>
                      <td className="py-3 pr-4">
                        <Badge className={typeCfg.badgeClass}>{typeCfg.label}</Badge>
                      </td>
                      <td className="py-3 pr-2 text-right font-bold text-deep-900 dark:text-white whitespace-nowrap">{fmt(inc.amount)}</td>
                      <td className="py-3 pr-2 text-right whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          inc.prob >= 80 ? 'text-green-600 dark:text-green-400' :
                          inc.prob >= 60 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>{inc.prob}%</span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`inline-flex items-center gap-1 whitespace-nowrap ${statusCfg.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span className="text-xs">{statusCfg.label}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right text-deep-500 dark:text-gray-400 hidden sm:table-cell whitespace-nowrap">
                        {inc.deadline === '-' ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 text-xs">Secured</Badge>
                        ) : (
                          <Badge className={
                            parseInt(inc.deadline) <= 60
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs'
                              : parseInt(inc.deadline) <= 120
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 text-xs'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs'
                          }>
                            {inc.deadline}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Type breakdown footer */}
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {breakdown.map(b => {
              const cfg = TYPE_CONFIG[b.type];
              return (
                <div key={b.type} className={`rounded-lg p-3 ${b.bgColor}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${b.color}`}>{b.label}</div>
                  <div className={`text-lg font-bold mt-1 ${b.color}`}>{fmt(b.value)}</div>
                  <div className="text-xs text-deep-500 dark:text-gray-400">{b.count} programs</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

function ReportsContent() {
  const [selectedProject, setSelectedProject] = useState<ProjectKey>('portfolio');
  const [reportType, setReportType] = useState<ReportType>('portfolio-summary');

  const incentives = getIncentivesForProject(selectedProject);
  const stats = getPortfolioStats(incentives);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">IncentEdge — Incentive Report</div>
            <div className="text-sm text-gray-500">Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-teal-600" />
              <h1 className="text-2xl font-bold text-deep-900 dark:text-white">Reports</h1>
            </div>
            <p className="text-sm text-deep-500 dark:text-gray-400">
              Professional incentive reports — portfolio overview, analysis, and project detail
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handlePrint}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Project selector — inline buttons */}
        <div className="mb-6 print:hidden">
          <div className="flex flex-wrap gap-2">
            {PROJECT_BUTTONS.map(btn => (
              <button
                key={btn.key}
                onClick={() => setSelectedProject(btn.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium border transition-all ${
                  selectedProject === btn.key
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-deep-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-300'
                }`}
              >
                {btn.key !== 'portfolio' && <Building2 className="h-3.5 w-3.5" />}
                {btn.key === 'portfolio' && <PieChart className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{btn.label}</span>
                <span className="sm:hidden">{btn.shortLabel}</span>
                {selectedProject === btn.key && (
                  <Badge className="ml-1 bg-teal-500 text-white text-[10px] px-1.5 py-0">
                    {fmt(stats.total, 0)}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Report type tabs */}
        <div className="mb-6 print:hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {REPORT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setReportType(tab.key)}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                    reportType === tab.key
                      ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                      : 'border-transparent text-deep-500 dark:text-gray-400 hover:text-deep-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report content */}
        {reportType === 'portfolio-summary' && (
          <PortfolioSummaryReport projectKey={selectedProject} />
        )}
        {reportType === 'incentive-analysis' && (
          <IncentiveAnalysisReport projectKey={selectedProject} />
        )}
        {reportType === 'project-detail' && (
          <ProjectDetailReport projectKey={selectedProject} />
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-deep-500 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
