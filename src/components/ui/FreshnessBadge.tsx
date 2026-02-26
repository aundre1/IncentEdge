'use client';

import { cn } from '@/lib/utils';

type FreshnessLevel = 'live' | 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';

interface FreshnessBadgeProps {
  lastVerified: Date | string | null | undefined;
  className?: string;
  showDot?: boolean;
}

function getFreshnessLevel(lastVerified: Date | string | null | undefined): FreshnessLevel {
  if (!lastVerified) return 'unknown';
  const date = typeof lastVerified === 'string' ? new Date(lastVerified) : lastVerified;
  if (isNaN(date.getTime())) return 'unknown';
  const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 1) return 'live';
  if (diffDays < 7) return 'fresh';
  if (diffDays < 30) return 'recent';
  if (diffDays < 90) return 'stale';
  return 'outdated';
}

const FRESHNESS_STYLES: Record<FreshnessLevel, { label: string; className: string }> = {
  live:     { label: 'Live',     className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  fresh:    { label: 'Fresh',    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  recent:   { label: 'Recent',   className: 'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400' },
  stale:    { label: 'Stale',    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  outdated: { label: 'Outdated', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  unknown:  { label: 'Unknown',  className: 'bg-gray-100 text-gray-600 dark:bg-navy-800 dark:text-navy-400' },
};

export function FreshnessBadge({ lastVerified, className, showDot = true }: FreshnessBadgeProps) {
  const level = getFreshnessLevel(lastVerified);
  const { label, className: levelClass } = FRESHNESS_STYLES[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        levelClass,
        className
      )}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {label}
    </span>
  );
}

export default FreshnessBadge;
