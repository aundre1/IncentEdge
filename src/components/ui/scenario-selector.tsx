'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// BLOOMBERG/COSTAR INSTITUTIONAL SCENARIO SELECTOR
// ============================================================================
// Design Philosophy:
// - Maximum information density (Bloomberg Terminal aesthetic)
// - Single-line horizontal layout
// - Subtle tonal variations using slate/gray palette
// - Confidence percentages shown on hover only
// - Designed for sophisticated institutional users
// ============================================================================

export interface Scenario {
  id: string;
  /** Short label: CONS, REAL, OPT, BEST */
  abbrev: string;
  /** Full label for tooltip */
  label: string;
  /** Confidence percentage (0-100) */
  confidence: number;
  /** Dollar value */
  value: number;
}

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  /** Currently selected scenario ID */
  selectedId: string;
  /** Callback when scenario is selected */
  onSelect: (id: string) => void;
  /** Optional className for container */
  className?: string;
  /** Compact mode uses smaller text */
  compact?: boolean;
}

// Default scenarios matching the spec
export const DEFAULT_SCENARIOS: Scenario[] = [
  { id: 'conservative', abbrev: 'CONS', label: 'Conservative', confidence: 80, value: 88100000 },
  { id: 'realistic', abbrev: 'REAL', label: 'Realistic', confidence: 65, value: 156100000 },
  { id: 'optimistic', abbrev: 'OPT', label: 'Optimistic', confidence: 40, value: 204500000 },
  { id: 'best', abbrev: 'BEST', label: 'Best Case', confidence: 20, value: 252200000 },
];

/** Format currency in millions with 1 decimal place */
function formatValue(value: number): string {
  const millions = value / 1_000_000;
  return `$${millions.toFixed(1)}M`;
}

/** Format confidence as percentage */
function formatConfidence(confidence: number): string {
  return `${confidence}%`;
}

export function ScenarioSelector({
  scenarios = DEFAULT_SCENARIOS,
  selectedId,
  onSelect,
  className,
  compact = false,
}: ScenarioSelectorProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          // Container: inline-flex, no wrap, tight spacing
          'inline-flex items-center',
          // Bloomberg-style dark border/divider aesthetic
          'rounded border',
          'border-slate-200 dark:border-slate-700',
          'bg-slate-50/50 dark:bg-slate-900/50',
          // Subtle shadow for depth
          'shadow-sm',
          className
        )}
        role="tablist"
        aria-label="Scenario selection"
      >
        {scenarios.map((scenario, index) => {
          const isSelected = scenario.id === selectedId;
          const isFirst = index === 0;
          const isLast = index === scenarios.length - 1;

          return (
            <Tooltip key={scenario.id}>
              <TooltipTrigger asChild>
                <button
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelect(scenario.id)}
                  className={cn(
                    // Base layout
                    'relative inline-flex items-center gap-1',
                    'transition-all duration-100',
                    // Padding: extremely tight for Bloomberg density
                    compact ? 'px-1.5 py-0.5' : 'px-2 py-1',
                    // Typography
                    compact ? 'text-[10px]' : 'text-[11px]',
                    'font-mono tracking-tight',
                    // Border radius handling
                    isFirst && 'rounded-l',
                    isLast && 'rounded-r',
                    // Divider between items (except first)
                    !isFirst && 'border-l border-slate-200 dark:border-slate-700',
                    // Default state: muted
                    !isSelected && [
                      'text-slate-500 dark:text-slate-400',
                      'hover:text-slate-700 dark:hover:text-slate-200',
                      'hover:bg-slate-100 dark:hover:bg-slate-800',
                    ],
                    // Selected state: prominent with accent
                    isSelected && [
                      'bg-slate-100 dark:bg-slate-800',
                      'text-slate-900 dark:text-slate-50',
                      // Subtle top border accent for selected
                      'shadow-[inset_0_2px_0_0_rgb(59_130_246_/_0.5)]',
                      'dark:shadow-[inset_0_2px_0_0_rgb(96_165_250_/_0.6)]',
                    ],
                    // Focus styles
                    'focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50',
                    'focus-visible:z-10'
                  )}
                >
                  {/* Scenario abbreviation */}
                  <span
                    className={cn(
                      'font-semibold uppercase',
                      // Subtle color coding by scenario type
                      scenario.id === 'conservative' && 'text-slate-500 dark:text-slate-400',
                      scenario.id === 'realistic' && isSelected && 'text-blue-600 dark:text-blue-400',
                      scenario.id === 'optimistic' && isSelected && 'text-slate-700 dark:text-slate-200',
                      scenario.id === 'best' && isSelected && 'text-slate-700 dark:text-slate-200',
                      // Override colors when not selected
                      !isSelected && 'text-inherit'
                    )}
                  >
                    {scenario.abbrev}
                  </span>

                  {/* Value - always visible */}
                  <span
                    className={cn(
                      'tabular-nums',
                      isSelected ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    {formatValue(scenario.value)}
                  </span>
                </button>
              </TooltipTrigger>

              {/* Tooltip with full details */}
              <TooltipContent
                side="bottom"
                className={cn(
                  'bg-slate-900 dark:bg-slate-950',
                  'border border-slate-700',
                  'px-2.5 py-1.5',
                  'text-[11px]'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-100">
                      {scenario.label}
                    </span>
                    <span className="font-mono text-slate-400">
                      {formatConfidence(scenario.confidence)} prob
                    </span>
                  </div>
                  <div className="text-slate-300 font-mono">
                    {formatValue(scenario.value)} incentive value
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// ULTRA-COMPACT VARIANT (for even tighter spaces)
// ============================================================================
// When you need absolute minimum space - shows only values, abbreviations on hover

interface ScenarioSelectorMicroProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ScenarioSelectorMicro({
  scenarios = DEFAULT_SCENARIOS,
  selectedId,
  onSelect,
  className,
}: ScenarioSelectorMicroProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div
        className={cn(
          'inline-flex items-center gap-px',
          'rounded-sm',
          'bg-slate-100 dark:bg-slate-800',
          className
        )}
        role="tablist"
      >
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedId;

          return (
            <Tooltip key={scenario.id}>
              <TooltipTrigger asChild>
                <button
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelect(scenario.id)}
                  className={cn(
                    'px-1.5 py-0.5',
                    'text-[10px] font-mono tabular-nums',
                    'transition-colors duration-75',
                    'first:rounded-l-sm last:rounded-r-sm',
                    !isSelected && [
                      'text-slate-400 dark:text-slate-500',
                      'hover:text-slate-600 dark:hover:text-slate-300',
                      'hover:bg-slate-200/50 dark:hover:bg-slate-700/50',
                    ],
                    isSelected && [
                      'bg-white dark:bg-slate-700',
                      'text-slate-900 dark:text-slate-100',
                      'font-semibold',
                      'shadow-sm',
                    ],
                    'focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/30'
                  )}
                >
                  {formatValue(scenario.value)}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-slate-900 border-slate-700 text-[10px] px-2 py-1"
              >
                <span className="text-slate-100 font-medium">{scenario.label}</span>
                <span className="text-slate-400 ml-1.5">{formatConfidence(scenario.confidence)}</span>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

// ============================================================================
// INLINE TEXT VARIANT (seamless with text flow)
// ============================================================================
// For embedding directly in text without visual container

interface ScenarioSelectorInlineProps {
  scenarios: Scenario[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function ScenarioSelectorInline({
  scenarios = DEFAULT_SCENARIOS,
  selectedId,
  onSelect,
  className,
}: ScenarioSelectorInlineProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <span
        className={cn('inline-flex items-center', className)}
        role="tablist"
      >
        {scenarios.map((scenario, index) => {
          const isSelected = scenario.id === selectedId;
          const showDivider = index > 0;

          return (
            <React.Fragment key={scenario.id}>
              {showDivider && (
                <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => onSelect(scenario.id)}
                    className={cn(
                      'text-[11px] font-mono tabular-nums',
                      'transition-colors duration-75',
                      'rounded-sm px-0.5',
                      !isSelected && [
                        'text-slate-400 dark:text-slate-500',
                        'hover:text-slate-600 dark:hover:text-slate-300',
                        'hover:underline hover:decoration-dotted hover:underline-offset-2',
                      ],
                      isSelected && [
                        'text-slate-900 dark:text-slate-100',
                        'font-semibold',
                        'underline decoration-blue-500/50 underline-offset-2',
                      ],
                      'focus:outline-none focus-visible:text-blue-600 dark:focus-visible:text-blue-400'
                    )}
                  >
                    {formatValue(scenario.value)}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-slate-900 border-slate-700 text-[10px] px-2 py-1"
                >
                  <span className="text-slate-100 font-medium">{scenario.label}</span>
                  <span className="text-slate-400 ml-1.5">{formatConfidence(scenario.confidence)}</span>
                </TooltipContent>
              </Tooltip>
            </React.Fragment>
          );
        })}
      </span>
    </TooltipProvider>
  );
}
