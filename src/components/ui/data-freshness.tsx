'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, RefreshCw, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface DataFreshnessProps {
  /** Last update timestamp */
  lastUpdated?: string | Date | null;
  /** Source of the data */
  source?: string;
  /** Update frequency description */
  updateFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  /** Custom stale threshold in minutes */
  staleThresholdMinutes?: number;
  /** Show as compact badge */
  compact?: boolean;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Is currently refreshing */
  isRefreshing?: boolean;
  /** Additional class names */
  className?: string;
}

type FreshnessStatus = 'live' | 'fresh' | 'recent' | 'stale' | 'outdated' | 'unknown';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getMinutesSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60));
}

function formatTimeAgo(date: Date): string {
  const minutes = getMinutesSince(date);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getFreshnessStatus(
  date: Date | null,
  updateFrequency: string,
  staleThreshold?: number
): FreshnessStatus {
  if (!date) return 'unknown';

  const minutes = getMinutesSince(date);

  // Custom threshold
  if (staleThreshold) {
    if (minutes < staleThreshold * 0.25) return 'live';
    if (minutes < staleThreshold * 0.5) return 'fresh';
    if (minutes < staleThreshold) return 'recent';
    if (minutes < staleThreshold * 2) return 'stale';
    return 'outdated';
  }

  // Default thresholds based on update frequency
  switch (updateFrequency) {
    case 'realtime':
      if (minutes < 5) return 'live';
      if (minutes < 15) return 'fresh';
      if (minutes < 60) return 'recent';
      if (minutes < 360) return 'stale';
      return 'outdated';

    case 'hourly':
      if (minutes < 60) return 'fresh';
      if (minutes < 120) return 'recent';
      if (minutes < 360) return 'stale';
      return 'outdated';

    case 'daily':
      if (minutes < 1440) return 'fresh'; // 24 hours
      if (minutes < 2880) return 'recent'; // 48 hours
      if (minutes < 10080) return 'stale'; // 1 week
      return 'outdated';

    case 'weekly':
      if (minutes < 10080) return 'fresh'; // 1 week
      if (minutes < 20160) return 'recent'; // 2 weeks
      if (minutes < 43200) return 'stale'; // 1 month
      return 'outdated';

    case 'monthly':
      if (minutes < 43200) return 'fresh'; // 1 month
      if (minutes < 86400) return 'recent'; // 2 months
      if (minutes < 129600) return 'stale'; // 3 months
      return 'outdated';

    default:
      if (minutes < 60) return 'fresh';
      if (minutes < 1440) return 'recent';
      if (minutes < 10080) return 'stale';
      return 'outdated';
  }
}

function getStatusStyles(status: FreshnessStatus): {
  dotColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'live':
      return {
        dotColor: 'bg-emerald-500',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
      };
    case 'fresh':
      return {
        dotColor: 'bg-teal-500',
        textColor: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
      };
    case 'recent':
      return {
        dotColor: 'bg-blue-500',
        textColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
      };
    case 'stale':
      return {
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
      };
    case 'outdated':
      return {
        dotColor: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
      };
    default:
      return {
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-500 dark:text-slate-400',
        bgColor: 'bg-slate-500/10',
        borderColor: 'border-slate-500/20',
      };
  }
}

function getStatusLabel(status: FreshnessStatus): string {
  switch (status) {
    case 'live': return 'Live';
    case 'fresh': return 'Fresh';
    case 'recent': return 'Recent';
    case 'stale': return 'Stale';
    case 'outdated': return 'Outdated';
    default: return 'Unknown';
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DataFreshness({
  lastUpdated,
  source,
  updateFrequency = 'daily',
  staleThresholdMinutes,
  compact = false,
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  className,
}: DataFreshnessProps) {
  const [now, setNow] = useState(new Date());

  // Update every minute for time display
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const date = useMemo(() => {
    if (!lastUpdated) return null;
    return typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  }, [lastUpdated]);

  const status = useMemo(() => {
    return getFreshnessStatus(date, updateFrequency, staleThresholdMinutes);
  }, [date, updateFrequency, staleThresholdMinutes, now]);

  const styles = getStatusStyles(status);
  const timeAgo = date ? formatTimeAgo(date) : 'Never';
  const statusLabel = getStatusLabel(status);

  // Compact badge version
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border',
                styles.bgColor,
                styles.textColor,
                styles.borderColor,
                className
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', styles.dotColor, status === 'live' && 'animate-pulse')} />
              <span>{timeAgo}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{statusLabel}</p>
              {source && <p className="text-slate-400">Source: {source}</p>}
              {date && <p className="text-slate-400">{date.toLocaleString()}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full version
  return (
    <div className={cn('data-freshness', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              {/* Pulse indicator */}
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  styles.dotColor,
                  status === 'live' && 'pulse-indicator'
                )}
              />

              {/* Time display */}
              <span className={cn('text-xs font-mono', styles.textColor)}>
                {timeAgo}
              </span>

              {/* Status icon for stale/outdated */}
              {(status === 'stale' || status === 'outdated') && (
                <AlertTriangle className={cn('w-3 h-3', styles.textColor)} />
              )}

              {/* Refresh button */}
              {showRefresh && onRefresh && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh();
                  }}
                  disabled={isRefreshing}
                  className={cn(
                    'p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors',
                    isRefreshing && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RefreshCw
                    className={cn(
                      'w-3 h-3 text-slate-400',
                      isRefreshing && 'animate-spin'
                    )}
                  />
                </button>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', styles.dotColor)} />
                <span className="font-medium">{statusLabel}</span>
              </div>
              {source && (
                <p className="text-slate-400">
                  <span className="font-medium">Source:</span> {source}
                </p>
              )}
              <p className="text-slate-400">
                <span className="font-medium">Updated:</span>{' '}
                {date ? date.toLocaleString() : 'Never'}
              </p>
              <p className="text-slate-400">
                <span className="font-medium">Frequency:</span>{' '}
                {updateFrequency.charAt(0).toUpperCase() + updateFrequency.slice(1)}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// ============================================================================
// PRESETS
// ============================================================================

/** Real-time data indicator (stock/market style) */
export function LiveDataIndicator({ lastUpdated, className }: { lastUpdated?: string | Date | null; className?: string }) {
  return (
    <DataFreshness
      lastUpdated={lastUpdated || new Date()}
      updateFrequency="realtime"
      compact
      className={className}
    />
  );
}

/** Program database freshness */
export function ProgramDataFreshness({
  lastUpdated,
  source = 'DSIRE Database',
  showRefresh,
  onRefresh,
  isRefreshing,
}: {
  lastUpdated?: string | Date | null;
  source?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <DataFreshness
      lastUpdated={lastUpdated}
      source={source}
      updateFrequency="weekly"
      showRefresh={showRefresh}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
    />
  );
}

/** Project data freshness */
export function ProjectDataFreshness({ lastUpdated }: { lastUpdated?: string | Date | null }) {
  return (
    <DataFreshness
      lastUpdated={lastUpdated}
      source="Project Database"
      updateFrequency="daily"
      compact
    />
  );
}

// ============================================================================
// FRESHNESS SUMMARY CARD
// ============================================================================

interface FreshnessSummaryProps {
  items: {
    label: string;
    lastUpdated: string | Date | null;
    source?: string;
    updateFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  }[];
}

export function FreshnessSummary({ items }: FreshnessSummaryProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Clock className="w-3 h-3" />
        <span>Data Freshness</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
            <DataFreshness
              lastUpdated={item.lastUpdated}
              source={item.source}
              updateFrequency={item.updateFrequency || 'daily'}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataFreshness;
