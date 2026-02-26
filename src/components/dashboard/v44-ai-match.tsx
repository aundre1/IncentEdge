'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Incentive } from '@/data/incentives';

interface MatchMetric {
  label: string;
  value: number;
  color: string;
}

interface V44AiMatchProps {
  incentives: Incentive[];
}

export function V44AiMatch({ incentives }: V44AiMatchProps) {
  const scores = useMemo(() => {
    if (incentives.length === 0) {
      return { category: 0, location: 0, eligibility: 0, composite: 0 };
    }

    // Derive scores from probability distribution of incentives
    const avgProb = incentives.reduce((s, i) => s + i.prob, 0) / incentives.length;
    const highProbCount = incentives.filter((i) => i.prob >= 80).length;
    const highProbRatio = highProbCount / incentives.length;

    const category = Math.min(99, Math.round(avgProb * 1.05));
    const location = Math.min(99, Math.round(highProbRatio * 100 + 10));
    const eligibility = Math.min(99, Math.round(avgProb * 0.95 + 5));

    // Weighted composite: 40% category, 35% location, 25% eligibility
    const composite = Math.round(
      category * 0.4 + location * 0.35 + eligibility * 0.25
    );

    return { category, location, eligibility, composite };
  }, [incentives]);

  const metrics: MatchMetric[] = [
    { label: 'Category Match', value: scores.category, color: 'bg-teal-500' },
    { label: 'Location Score', value: scores.location, color: 'bg-emerald-500' },
    { label: 'Eligibility', value: scores.eligibility, color: 'bg-teal-400' },
  ];

  return (
    <Card className="card-v41 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-500 dark:text-teal-400" />
            <CardTitle className="text-sm font-semibold text-deep-950 dark:text-sage-200">
              AI Match Engine
            </CardTitle>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
              'text-[10px] font-bold uppercase tracking-wider',
              'bg-gradient-to-r from-emerald-500/20 to-emerald-400/10',
              'text-emerald-600 dark:text-emerald-400',
              'border border-emerald-500/20 dark:border-emerald-500/30'
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-ring" />
            LIVE
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress metrics */}
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between gap-3">
              <span className="text-xs text-sage-600 dark:text-sage-500 w-28 shrink-0">
                {metric.label}
              </span>
              <div className="h-1 w-20 rounded-full bg-sage-200 dark:bg-deep-700 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', metric.color)}
                  style={{ width: `${metric.value}%` }}
                />
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-deep-950 dark:text-sage-200 w-8 text-right">
                {metric.value}%
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-sage-200 dark:border-teal-800/30" />

        {/* Composite score */}
        <div className="text-center space-y-1">
          <p className="text-[9.5px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-500">
            Composite Score
          </p>
          <p className="font-mono text-3xl font-bold text-teal-600 dark:text-teal-400">
            {scores.composite}
          </p>
          <p className="text-[10px] text-sage-500 dark:text-sage-600">
            Weighting: 40 / 35 / 25
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
