'use client';

import { cn, formatCompactCurrency } from '@/lib/utils';

interface Scenario {
  key: string;
  label: string;
  pct: number;
  confidence: number;
}

const scenarios: Scenario[] = [
  { key: 'conservative', label: 'Conservative', pct: 65, confidence: 80 },
  { key: 'expected', label: 'Expected', pct: 80, confidence: 92 },
  { key: 'optimistic', label: 'Optimistic', pct: 92, confidence: 68 },
  { key: 'best-case', label: 'Best Case', pct: 100, confidence: 45 },
];

interface V44ScenarioStripProps {
  totalAmount: number;
  selectedScenario: string;
  onSelect: (key: string) => void;
}

export function V44ScenarioStrip({
  totalAmount,
  selectedScenario,
  onSelect,
}: V44ScenarioStripProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {scenarios.map((scenario) => {
        const isActive = selectedScenario === scenario.key;
        const value = totalAmount * (scenario.pct / 100);

        return (
          <button
            key={scenario.key}
            type="button"
            onClick={() => onSelect(scenario.key)}
            className={cn(
              'relative rounded-lg border p-4 text-left transition-all duration-150',
              'bg-white dark:bg-deep-900',
              'hover:border-teal-400 dark:hover:border-teal-600',
              isActive
                ? 'border-teal-500 dark:border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm ring-1 ring-teal-500/20'
                : 'border-sage-300 dark:border-teal-800/30'
            )}
          >
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-500">
              {scenario.label}
            </p>
            <p
              className={cn(
                'font-mono text-[22px] font-bold leading-tight mt-1',
                isActive
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-deep-950 dark:text-sage-200'
              )}
            >
              {formatCompactCurrency(value * 1_000_000)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 flex-1 rounded-full bg-sage-200 dark:bg-deep-700 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isActive
                      ? 'bg-teal-500'
                      : 'bg-sage-400 dark:bg-sage-600'
                  )}
                  style={{ width: `${scenario.confidence}%` }}
                />
              </div>
              <span
                className={cn(
                  'text-xs font-mono font-semibold tabular-nums',
                  isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-sage-600 dark:text-sage-500'
                )}
              >
                {scenario.confidence}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
