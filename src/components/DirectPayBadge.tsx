'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface DirectPayBadgeProps {
  /** Whether the entity is eligible for Direct Pay */
  eligible: boolean;
  /** Optional entity type (e.g., 'nonprofit', 'municipal', 'tribal') */
  entityType?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the tooltip */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// IRS Building Icon (simplified)
const IRSIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21h18" />
    <path d="M5 21V7l7-4 7 4v14" />
    <path d="M9 21v-6h6v6" />
    <path d="M10 10h.01" />
    <path d="M14 10h.01" />
  </svg>
);

// Checkmark Icon
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X Icon for ineligible
const XIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * DirectPayBadge - Visual indicator for IRA Section 6417 Direct Pay eligibility
 *
 * Direct Pay allows certain tax-exempt entities (nonprofits, municipalities,
 * tribal governments, etc.) to receive direct payments instead of tax credits.
 *
 * @example
 * // Eligible nonprofit
 * <DirectPayBadge eligible={true} entityType="nonprofit" />
 *
 * // Not eligible for-profit
 * <DirectPayBadge eligible={false} entityType="for-profit" />
 */
export function DirectPayBadge({
  eligible,
  entityType,
  size = 'md',
  showTooltip = true,
  className,
}: DirectPayBadgeProps) {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Entity-specific tooltip text
  const getEntityInfo = () => {
    if (!entityType) return '';

    const entityDescriptions: Record<string, string> = {
      'nonprofit': 'Tax-exempt organizations (501(c)(3))',
      'municipal': 'Municipal government entities',
      'state': 'State government entities',
      'tribal': 'Indian tribal governments',
      'rural-electric-coop': 'Rural electric cooperatives',
      'for-profit': 'For-profit entities (may use credit transferability under Section 6418)',
    };

    return entityDescriptions[entityType] || '';
  };

  const tooltipContent = (
    <div className="max-w-xs space-y-2">
      <div className="font-semibold">
        {eligible ? 'Direct Pay Eligible' : 'Not Direct Pay Eligible'}
      </div>
      <div className="text-xs opacity-90">
        <strong>IRA Section 6417:</strong> Allows tax-exempt entities to receive
        direct payments from the IRS instead of tax credits.
      </div>
      {entityType && (
        <div className="text-xs opacity-75">
          <strong>Entity Type:</strong> {getEntityInfo()}
        </div>
      )}
      {eligible && (
        <div className="text-xs opacity-75">
          <strong>Eligible Credits:</strong> ITC (48/48E), PTC (45/45Y), Clean Hydrogen (45V),
          Carbon Capture (45Q), and more.
        </div>
      )}
      {!eligible && entityType === 'for-profit' && (
        <div className="text-xs opacity-75 mt-1">
          For-profit entities may still transfer credits under Section 6418.
        </div>
      )}
    </div>
  );

  const badgeContent = (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border transition-colors',
        sizeStyles[size],
        eligible
          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700',
        className
      )}
    >
      <IRSIcon className={iconSizes[size]} />
      <span>{eligible ? 'Direct Pay Eligible' : 'Not Direct Pay'}</span>
      {eligible ? (
        <CheckIcon className={cn(iconSizes[size], 'text-emerald-600 dark:text-emerald-400')} />
      ) : (
        <XIcon className={cn(iconSizes[size], 'text-gray-500 dark:text-gray-500')} />
      )}
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * DirectPayIndicator - Compact inline indicator for tables/lists
 */
export function DirectPayIndicator({
  eligible,
  className,
}: Pick<DirectPayBadgeProps, 'eligible' | 'className'>) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              eligible
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-500',
              className
            )}
          >
            <IRSIcon className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-gray-900 text-white border-gray-800">
          <span className="text-sm">
            {eligible ? 'Direct Pay Eligible (IRA Section 6417)' : 'Not Direct Pay Eligible'}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
