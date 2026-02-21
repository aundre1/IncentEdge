'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface IncentiveRequirement {
  requirement: string;
  status: 'met' | 'pending' | 'not_met' | 'review_needed';
  notes?: string;
}

export interface IncentiveCardProps {
  programId: string;
  programName: string;
  category: 'federal' | 'state' | 'local' | 'utility' | string;
  matchScore: number;
  eligibilityStatus: 'likely_eligible' | 'review_needed' | 'potential' | 'not_eligible';
  estimatedValue: {
    min: number;
    max: number;
    expected: number;
  };
  requirements?: IncentiveRequirement[];
  nextSteps?: string[];
  applicationDeadline?: string | null;
  complexity?: 'low' | 'medium' | 'high';
  directPayEligible?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'federal':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'state':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'local':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'utility':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
  }
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'met':
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'not_met':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'review_needed':
      return <HelpCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <HelpCircle className="h-4 w-4 text-slate-400" />;
  }
}

function getComplexityBadge(complexity: string | undefined) {
  if (!complexity) return null;
  const colors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };
  return (
    <Badge variant="outline" className={cn('text-xs', colors[complexity as keyof typeof colors])}>
      {complexity.charAt(0).toUpperCase() + complexity.slice(1)} Complexity
    </Badge>
  );
}

export function IncentiveCard({
  programName,
  category,
  matchScore,
  eligibilityStatus,
  estimatedValue,
  requirements = [],
  nextSteps = [],
  applicationDeadline,
  complexity,
  directPayEligible,
}: IncentiveCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const daysUntilDeadline = applicationDeadline
    ? Math.ceil((new Date(applicationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className={cn('text-xs font-medium', getCategoryColor(category))}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
                {directPayEligible && (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs">
                    Direct Pay Eligible
                  </Badge>
                )}
                {getComplexityBadge(complexity)}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                {programName}
              </h3>
              {applicationDeadline && daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                <p className={cn(
                  'text-xs mt-1',
                  daysUntilDeadline <= 30 ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
                )}>
                  <Clock className="inline h-3 w-3 mr-1" />
                  Deadline: {new Date(applicationDeadline).toLocaleDateString()} ({daysUntilDeadline} days)
                </p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(estimatedValue.expected)}
              </p>
              <p className="text-xs text-slate-500">
                {formatCurrency(estimatedValue.min)} - {formatCurrency(estimatedValue.max)}
              </p>
              <p className={cn('text-sm font-medium', getScoreColor(matchScore))}>
                {matchScore}% match
              </p>
            </div>
          </div>

          {/* Expand Button */}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-slate-500 hover:text-slate-700">
              {isOpen ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  View Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Expanded Content */}
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 border-t border-slate-100 dark:border-slate-800">
            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Requirements
                </h4>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {getStatusIcon(req.status)}
                      <div>
                        <p className="text-slate-700 dark:text-slate-300">{req.requirement}</p>
                        {req.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">{req.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {nextSteps.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Next Steps
                </h4>
                <ul className="space-y-1">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="text-blue-500 font-medium">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Eligibility Status */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Eligibility:</span>
                  <Badge variant="outline" className={cn(
                    eligibilityStatus === 'likely_eligible' ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300' :
                    eligibilityStatus === 'potential' ? 'border-amber-300 text-amber-700 dark:text-amber-300' :
                    eligibilityStatus === 'review_needed' ? 'border-blue-300 text-blue-700 dark:text-blue-300' :
                    'border-red-300 text-red-700 dark:text-red-300'
                  )}>
                    {eligibilityStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
