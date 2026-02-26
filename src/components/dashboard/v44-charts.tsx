'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Incentive } from '@/data/incentives';

// ============================================================================
// SHARED PALETTE & TOOLTIP
// ============================================================================

const V44_COLORS = {
  navy: '#1A2B4A',
  teal: '#287A89',
  sage: '#8FB5A6',
  lteal: '#4A99A8',
  green: '#10B981',
  red: '#EF4444',
  white: '#FFFFFF',
} as const;

const TYPE_COLORS: Record<string, string> = {
  Federal: V44_COLORS.navy,
  State: V44_COLORS.teal,
  Local: V44_COLORS.sage,
  Utility: V44_COLORS.lteal,
};

const STATUS_COLORS: Record<string, string> = {
  Captured: V44_COLORS.green,
  Pending: V44_COLORS.teal,
  'At Risk': V44_COLORS.red,
};

interface IncentiveRow extends Incentive {
  project: string;
  projectName: string;
}

// Shared custom tooltip wrapper
function ChartTooltipWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 px-3 py-2 shadow-lg',
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// CHART 1: INCENTIVE BY TYPE (BAR CHART)
// ============================================================================

interface IncentiveTypeChartProps {
  incentives: IncentiveRow[];
}

function TypeBarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { type: string; amount: number; count: number } }> }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <ChartTooltipWrapper>
      <p className="text-xs font-semibold text-deep-900 dark:text-white">{data.type}</p>
      <p className="text-sm font-mono text-teal mt-0.5">${data.amount.toFixed(1)}M</p>
      <p className="text-[10px] text-deep-400 dark:text-sage-500">{data.count} programs</p>
    </ChartTooltipWrapper>
  );
}

export function IncentiveTypeChart({ incentives }: IncentiveTypeChartProps) {
  const data = useMemo(() => {
    const grouped: Record<string, { amount: number; count: number }> = {
      Federal: { amount: 0, count: 0 },
      State: { amount: 0, count: 0 },
      Local: { amount: 0, count: 0 },
      Utility: { amount: 0, count: 0 },
    };

    incentives.forEach((inc) => {
      const key = inc.type.charAt(0).toUpperCase() + inc.type.slice(1);
      if (grouped[key]) {
        grouped[key].amount += inc.amount;
        grouped[key].count++;
      }
    });

    return Object.entries(grouped).map(([type, vals]) => ({
      type,
      amount: parseFloat(vals.amount.toFixed(1)),
      count: vals.count,
      fill: TYPE_COLORS[type] || V44_COLORS.teal,
    }));
  }, [incentives]);

  return (
    <Card className="border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-sora text-sm text-deep-900 dark:text-white">
          Incentives by Type
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #E6F0EB)" vertical={false} />
            <XAxis
              dataKey="type"
              tick={{ fontSize: 11, fill: '#5A7E7A' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#5A7E7A' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}M`}
            />
            <Tooltip content={<TypeBarTooltip />} cursor={{ fill: 'rgba(40,122,137,0.06)' }} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(v: number) => `$${v}M`}
                style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono, monospace)', fill: '#1A2B4A' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART 2: CAPTURE TIMELINE (AREA CHART)
// ============================================================================

interface CaptureTimelineChartProps {
  incentives: IncentiveRow[];
}

const TIMELINE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIMELINE_VALUES = [12, 18, 24, 35, 42, 48, 67, 89, 105, 128, 152, 168.7];

function TimelineTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipWrapper>
      <p className="text-xs font-semibold text-deep-900 dark:text-white">{label}</p>
      <p className="text-sm font-mono text-teal mt-0.5">${payload[0].value.toFixed(1)}M</p>
    </ChartTooltipWrapper>
  );
}

export function CaptureTimelineChart({ incentives }: CaptureTimelineChartProps) {
  const data = useMemo(() => {
    // Scale timeline to actual portfolio total
    const totalAmount = incentives.reduce((s, i) => s + i.amount, 0);
    const baseTotal = TIMELINE_VALUES[TIMELINE_VALUES.length - 1];
    const scale = totalAmount > 0 ? totalAmount / baseTotal : 1;

    return TIMELINE_MONTHS.map((month, idx) => ({
      month,
      value: parseFloat((TIMELINE_VALUES[idx] * scale).toFixed(1)),
    }));
  }, [incentives]);

  const endValue = data[data.length - 1]?.value || 0;

  return (
    <Card className="border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-sora text-sm text-deep-900 dark:text-white">
            Capture Timeline
          </CardTitle>
          <span className="text-xs font-mono font-semibold text-teal">
            ${endValue.toFixed(1)}M
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={V44_COLORS.teal} stopOpacity={0.15} />
                <stop offset="100%" stopColor={V44_COLORS.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #E6F0EB)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#5A7E7A' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#5A7E7A' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}M`}
            />
            <Tooltip content={<TimelineTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={V44_COLORS.teal}
              strokeWidth={2}
              fill="url(#tealGradient)"
              dot={false}
              activeDot={{ r: 4, fill: V44_COLORS.teal, stroke: V44_COLORS.white, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART 3: STATUS DISTRIBUTION (DONUT CHART)
// ============================================================================

interface StatusDistributionChartProps {
  incentives: IncentiveRow[];
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { count: number } }> }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const count = payload[0].payload.count;
  return (
    <ChartTooltipWrapper>
      <p className="text-xs font-semibold text-deep-900 dark:text-white">{name}</p>
      <p className="text-sm font-mono text-teal mt-0.5">${value.toFixed(1)}M</p>
      <p className="text-[10px] text-deep-400 dark:text-sage-500">{count} programs</p>
    </ChartTooltipWrapper>
  );
}

export function StatusDistributionChart({ incentives }: StatusDistributionChartProps) {
  const { data, totalCount } = useMemo(() => {
    const grouped: Record<string, { amount: number; count: number }> = {
      Captured: { amount: 0, count: 0 },
      Pending: { amount: 0, count: 0 },
      'At Risk': { amount: 0, count: 0 },
    };

    const statusMap: Record<string, string> = {
      captured: 'Captured',
      pending: 'Pending',
      'at-risk': 'At Risk',
    };

    incentives.forEach((inc) => {
      const key = statusMap[inc.status] || 'Pending';
      grouped[key].amount += inc.amount;
      grouped[key].count++;
    });

    const total = incentives.length;
    const chartData = Object.entries(grouped).map(([name, vals]) => ({
      name,
      value: parseFloat(vals.amount.toFixed(1)),
      count: vals.count,
      fill: STATUS_COLORS[name] || V44_COLORS.teal,
    }));

    return { data: chartData, totalCount: total };
  }, [incentives]);

  return (
    <Card className="border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-sora text-sm text-deep-900 dark:text-white">
          Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 0 }}>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-deep-900 dark:text-white leading-none">
                {totalCount}
              </p>
              <p className="text-[10px] text-deep-400 dark:text-sage-500 uppercase tracking-wider mt-0.5">
                programs
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-[11px] text-deep-500 dark:text-sage-400">
                {entry.name}
              </span>
              <span className="text-[11px] font-mono font-semibold text-deep-700 dark:text-sage-300">
                {entry.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PIPELINE BREAKDOWN (HORIZONTAL BAR — SIDEBAR)
// ============================================================================

interface PipelineBreakdownChartProps {
  incentives: IncentiveRow[];
}

export function PipelineBreakdownChart({ incentives }: PipelineBreakdownChartProps) {
  const data = useMemo(() => {
    const statusMap: Record<string, string> = {
      captured: 'Captured',
      pending: 'Pending',
      'at-risk': 'At Risk',
    };

    const grouped: Record<string, number> = {
      Captured: 0,
      Pending: 0,
      'At Risk': 0,
    };

    incentives.forEach((inc) => {
      const key = statusMap[inc.status] || 'Pending';
      grouped[key] += inc.amount;
    });

    return Object.entries(grouped).map(([name, amount]) => ({
      name,
      amount: parseFloat(amount.toFixed(1)),
      fill: STATUS_COLORS[name] || V44_COLORS.teal,
    }));
  }, [incentives]);

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Card className="border-deep-100 dark:border-deep-700 bg-white dark:bg-deep-800 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-sora text-sm text-deep-900 dark:text-white">
          Pipeline Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {data.map((entry) => (
          <div key={entry.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-xs text-deep-600 dark:text-sage-400">{entry.name}</span>
              </div>
              <span className="text-xs font-mono font-semibold text-deep-900 dark:text-white">
                ${entry.amount.toFixed(1)}M
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-deep-100 dark:bg-deep-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(entry.amount / maxAmount) * 100}%`,
                  backgroundColor: entry.fill,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
