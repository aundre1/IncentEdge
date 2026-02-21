'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Target,
  TrendingUp,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Filter,
  Zap,
  Leaf,
  Info,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { Project, IncentiveProgram, IncentiveCategory } from '@/types';
import {
  matchIncentivesToProject,
  type MatchedIncentive,
  type MatchingResult,
} from '@/lib/incentive-matcher';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function getTierColor(tier: string) {
  switch (tier) {
    case 'high': return 'bg-emerald-500';
    case 'medium': return 'bg-blue-500';
    case 'low': return 'bg-amber-500';
    default: return 'bg-slate-400';
  }
}

function getTierBadge(tier: string) {
  switch (tier) {
    case 'high':
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">High Match</Badge>;
    case 'medium':
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Medium Match</Badge>;
    case 'low':
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Low Match</Badge>;
    default:
      return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20">Potential</Badge>;
  }
}

function getCategoryBadge(category: IncentiveCategory) {
  switch (category) {
    case 'federal':
      return <span className="badge-federal">Federal</span>;
    case 'state':
      return <span className="badge-state">State</span>;
    case 'local':
      return <span className="badge-local">Local</span>;
    case 'utility':
      return <span className="badge-utility">Utility</span>;
    default:
      return <span className="badge-state">State</span>;
  }
}

// ============================================================================
// MATCHED INCENTIVE CARD
// ============================================================================

interface IncentiveCardProps {
  match: MatchedIncentive;
  compact?: boolean;
  onViewDetails?: (id: string) => void;
}

function IncentiveCard({ match, compact = false, onViewDetails }: IncentiveCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const category = (match.incentive.category || match.incentive.jurisdiction_level || 'state') as IncentiveCategory;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 hover:border-blue-500/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-8 rounded-full ${getTierColor(match.tier)}`} />
          <div>
            <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
              {match.incentive.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {getCategoryBadge(category)}
              <span className="text-xs text-slate-500">{formatPercent(match.matchScore)} match</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(match.estimatedValue)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="card-v41 overflow-hidden">
      <div className="flex">
        {/* Tier indicator */}
        <div className={`w-1.5 ${getTierColor(match.tier)}`} />

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getCategoryBadge(category)}
                {getTierBadge(match.tier)}
                {match.incentive.application_deadline && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Deadline
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-slate-900 dark:text-white">
                {match.incentive.name}
              </h4>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {match.matchReasons.slice(0, 2).join(' | ')}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="text-xs text-slate-500 mb-1">Estimated Value</p>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(match.estimatedValue)}
              </p>
            </div>
          </div>

          {/* Match Scores */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-navy-900">
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <div className="flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-blue-500" />
                <span className="font-mono font-semibold">{formatPercent(match.categoryScore)}</span>
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-navy-900">
              <p className="text-xs text-slate-500 mb-1">Location</p>
              <div className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-teal-500" />
                <span className="font-mono font-semibold">{formatPercent(match.locationScore)}</span>
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-navy-900">
              <p className="text-xs text-slate-500 mb-1">Eligibility</p>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="font-mono font-semibold">{formatPercent(match.eligibilityScore)}</span>
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-navy-700">
              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Eligibility Criteria
              </h5>
              <div className="space-y-2">
                {match.eligibilityDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {detail.met ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {detail.criterion}:
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">
                        {detail.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-navy-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-slate-500"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </Button>

            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onViewDetails?.(match.incentive.id)}
            >
              View Program
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface IncentiveMatcherProps {
  project: Project;
  incentives: IncentiveProgram[];
  onViewIncentive?: (id: string) => void;
  compact?: boolean;
}

export function IncentiveMatcher({
  project,
  incentives,
  onViewIncentive,
  compact = false,
}: IncentiveMatcherProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [showOnlyHighMatches, setShowOnlyHighMatches] = useState(false);

  // Run matching algorithm
  const matchingResult = useMemo(() => {
    return matchIncentivesToProject(project, incentives, {
      includePartialMatches: !showOnlyHighMatches,
      prioritizeGreen: true,
    });
  }, [project, incentives, showOnlyHighMatches]);

  const displayMatches = useMemo(() => {
    switch (activeTab) {
      case 'federal':
        return matchingResult.byCategory.federal;
      case 'state':
        return matchingResult.byCategory.state;
      case 'local':
        return matchingResult.byCategory.local;
      case 'utility':
        return matchingResult.byCategory.utility;
      case 'green':
        return matchingResult.greenIncentives;
      case 'ira':
        return matchingResult.iraIncentives;
      default:
        return matchingResult.matches;
    }
  }, [activeTab, matchingResult]);

  if (compact) {
    return (
      <Card className="card-v41">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <CardTitle className="font-sora text-base">Matched Incentives</CardTitle>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              {matchingResult.summary.highTier + matchingResult.summary.mediumTier} matches
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {matchingResult.topMatches.slice(0, 5).map((match) => (
            <IncentiveCard
              key={match.incentive.id}
              match={match}
              compact
              onViewDetails={onViewIncentive}
            />
          ))}
          {matchingResult.matches.length > 5 && (
            <Button variant="ghost" className="w-full text-slate-500" size="sm">
              View All {matchingResult.matches.length} Matches
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="card-v41 bg-gradient-to-r from-blue-500/5 to-teal-500/5 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-sora text-slate-900 dark:text-white">
                  Incentive Match Analysis
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                  {matchingResult.summary.totalMatched} programs matched for {project.name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(matchingResult.totalPotentialValue)}
                </p>
                <p className="text-xs text-slate-500">Potential Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-blue-600">
                  {matchingResult.summary.highTier}
                </p>
                <p className="text-xs text-slate-500">High Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-teal-600">
                  {matchingResult.greenIncentives.length}
                </p>
                <p className="text-xs text-slate-500">Green Programs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-slate-600">
                  {formatPercent(matchingResult.summary.avgMatchScore)}
                </p>
                <p className="text-xs text-slate-500">Avg Match</p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 rounded-lg bg-blue-500/10 text-center cursor-help">
                    <p className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                      {matchingResult.summary.federalCount}
                    </p>
                    <p className="text-xs text-slate-500">Federal</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Federal programs have the broadest eligibility</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="p-3 rounded-lg bg-blue-400/10 text-center">
              <p className="text-lg font-bold font-mono text-blue-600 dark:text-blue-300">
                {matchingResult.summary.stateCount}
              </p>
              <p className="text-xs text-slate-500">State</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-300/10 text-center">
              <p className="text-lg font-bold font-mono text-blue-500 dark:text-blue-200">
                {matchingResult.summary.localCount}
              </p>
              <p className="text-xs text-slate-500">Local</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-200/10 text-center">
              <p className="text-lg font-bold font-mono text-blue-400">
                {matchingResult.summary.utilityCount}
              </p>
              <p className="text-xs text-slate-500">Utility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-100 dark:bg-navy-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700">
              All ({matchingResult.matches.length})
            </TabsTrigger>
            <TabsTrigger value="federal" className="data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700">
              Federal
            </TabsTrigger>
            <TabsTrigger value="state" className="data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700">
              State
            </TabsTrigger>
            <TabsTrigger value="green" className="data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700">
              <Leaf className="w-3 h-3 mr-1" />
              Green
            </TabsTrigger>
            <TabsTrigger value="ira" className="data-[state=active]:bg-white dark:data-[state=active]:bg-navy-700">
              <Zap className="w-3 h-3 mr-1" />
              IRA
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={showOnlyHighMatches ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOnlyHighMatches(!showOnlyHighMatches)}
            className={showOnlyHighMatches ? 'bg-blue-600' : ''}
          >
            <Filter className="w-4 h-4 mr-1" />
            High Matches Only
          </Button>
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-4">
        {displayMatches.length === 0 ? (
          <Card className="card-v41">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                No matches in this category
              </h3>
              <p className="mt-2 text-sm text-slate-500 text-center max-w-md">
                Try adjusting filters or select a different category to see more results.
              </p>
            </CardContent>
          </Card>
        ) : (
          displayMatches.map((match) => (
            <IncentiveCard
              key={match.incentive.id}
              match={match}
              onViewDetails={onViewIncentive}
            />
          ))
        )}
      </div>

      {/* Matching Methodology Note */}
      <Card className="card-v41 border-slate-200 dark:border-navy-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <p className="font-medium text-slate-600 dark:text-slate-300">V41 Matching Algorithm</p>
              <p className="mt-1">
                Incentives are matched using a weighted priority system:{' '}
                <span className="font-medium">Category (40%)</span> {'->'}{' '}
                <span className="font-medium">Location (35%)</span> {'->'}{' '}
                <span className="font-medium">Eligibility (25%)</span>.
                Estimated values are calculated based on project parameters and program formulas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// QUICK MATCH WIDGET (for dashboard cards)
// ============================================================================

interface QuickMatchWidgetProps {
  project: Project;
  incentives: IncentiveProgram[];
  onViewAll?: () => void;
}

export function QuickMatchWidget({ project, incentives, onViewAll }: QuickMatchWidgetProps) {
  const result = useMemo(() => {
    return matchIncentivesToProject(project, incentives, {
      maxResults: 3,
      includePartialMatches: false,
    });
  }, [project, incentives]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Top Matches
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {result.summary.totalMatched} total
        </span>
      </div>

      {result.topMatches.slice(0, 3).map((match, idx) => (
        <div
          key={match.incentive.id}
          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-navy-800"
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${getTierColor(match.tier)}`} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              {match.incentive.name}
            </span>
          </div>
          <span className="text-sm font-mono font-semibold text-emerald-600">
            {formatCurrency(match.estimatedValue)}
          </span>
        </div>
      ))}

      {onViewAll && (
        <Button variant="ghost" size="sm" className="w-full text-slate-500" onClick={onViewAll}>
          View All Matches
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
