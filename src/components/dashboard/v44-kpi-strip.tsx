'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, formatCompactCurrency } from '@/lib/utils';
import { getPortfolioStats, type Incentive } from '@/data/incentives';

interface KPI {
  label: string;
  value: string;
  delta: number;
  deltaLabel: string;
}

interface V44KpiStripProps {
  incentives: Incentive[];
}

export function V44KpiStrip({ incentives }: V44KpiStripProps) {
  const stats = useMemo(() => getPortfolioStats(incentives), [incentives]);

  const kpis: KPI[] = useMemo(
    () => [
      {
        label: 'Incentive AUM',
        value: formatCompactCurrency(stats.total * 1_000_000),
        delta: 12.4,
        deltaLabel: '+12.4%',
      },
      {
        label: 'Expected Value',
        value: formatCompactCurrency(stats.expected * 1_000_000),
        delta: 8.2,
        deltaLabel: '+8.2%',
      },
      {
        label: 'Active Programs',
        value: String(stats.programCount),
        delta: 3,
        deltaLabel: '+3',
      },
      {
        label: 'Capture Rate',
        value: `${stats.captureRate}%`,
        delta: 2.1,
        deltaLabel: '+2.1%',
      },
      {
        label: 'Tax Credits Pipeline',
        value: formatCompactCurrency(stats.pipeline * 1_000_000),
        delta: -1.8,
        deltaLabel: '-1.8%',
      },
      {
        label: 'Portfolio ROI',
        value: `${stats.avgProb}%`,
        delta: 5.6,
        deltaLabel: '+5.6%',
      },
    ],
    [stats]
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((kpi, idx) => (
        <div
          key={kpi.label}
          className={cn(
            'metric-card bg-white dark:bg-deep-900 border border-sage-300 dark:border-teal-800/30',
            'rounded-lg shadow-sm p-4',
            'animate-fade-in-up',
          )}
          style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
        >
          <p className="text-[9.5px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-500">
            {kpi.label}
          </p>
          <p className="font-mono text-[22px] font-bold leading-tight mt-1 text-deep-950 dark:text-sage-200">
            {kpi.value}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-1.5 py-0.5 rounded',
              kpi.delta >= 0
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
            )}
          >
            {kpi.delta >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {kpi.deltaLabel}
          </span>
        </div>
      ))}
    </div>
  );
}
