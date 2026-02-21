'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}

/**
 * StatsCard - Reusable statistics display card component
 *
 * @example
 * <StatsCard
 *   title="Total Programs"
 *   value={24805}
 *   description="Active incentive programs"
 *   icon={Database}
 *   trend={{ value: 5, direction: 'up', label: 'vs last month' }}
 * />
 */
export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  loading = false,
  className,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = React.useState<string | number>(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Animate number on mount
  React.useEffect(() => {
    if (typeof value === 'number' && !hasAnimated && !loading) {
      const duration = 1000; // 1 second animation
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animateValue = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart);

        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animateValue);
        } else {
          setDisplayValue(endValue);
          setHasAnimated(true);
        }
      };

      requestAnimationFrame(animateValue);
    } else if (typeof value === 'string') {
      setDisplayValue(value);
    }
  }, [value, hasAnimated, loading]);

  // Format number with commas
  const formatDisplayValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  // Trend indicator styles
  const trendStyles = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const trendArrows = {
    up: '\u2191',
    down: '\u2193',
    neutral: '\u2192',
  };

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 w-24 bg-muted rounded" />
            {description && <div className="h-4 w-32 bg-muted rounded mt-2" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">
              {formatDisplayValue(displayValue)}
            </div>
            {(description || trend) && (
              <div className="flex items-center gap-2 mt-1">
                {trend && (
                  <span className={cn('text-xs font-medium', trendStyles[trend.direction])}>
                    {trendArrows[trend.direction]} {trend.value}%
                    {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
                  </span>
                )}
                {description && !trend && (
                  <p className="text-xs text-muted-foreground">{description}</p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
