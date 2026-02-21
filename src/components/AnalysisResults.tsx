'use client';

import { DollarSign, FileText, Lightbulb, AlertTriangle, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IncentiveCard } from '@/components/IncentiveCard';
import { cn } from '@/lib/utils';

export interface MatchedProgram {
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
  requirements?: {
    requirement: string;
    status: 'met' | 'pending' | 'not_met' | 'review_needed';
    notes?: string;
  }[];
  nextSteps?: string[];
  applicationDeadline?: string | null;
  complexity?: 'low' | 'medium' | 'high';
}

export interface QuickRecommendation {
  summary: string;
  topOpportunities: string[];
  keyActions: string[];
  estimatedTotalValue: number;
}

export interface ProjectSummary {
  name: string;
  location: string;
  buildingType: string;
  projectType: string;
  totalUnits: number;
  totalSqft: number;
  affordablePercentage: number;
  sustainabilityTarget: string;
}

export interface AnalysisTotals {
  totalPrograms: number;
  highConfidence: number;
  reviewNeeded: number;
  estimatedTotal: {
    min: number;
    max: number;
    expected: number;
  };
  byCategory: {
    federal: { count: number; value: number };
    state: { count: number; value: number };
    local: { count: number; value: number };
    utility: { count: number; value: number };
  };
}

export interface AnalysisResultsProps {
  projectSummary: ProjectSummary;
  matchedPrograms: MatchedProgram[];
  totals: AnalysisTotals;
  recommendations: string[];
  warnings: string[];
  quickRecommendation?: QuickRecommendation | null;
  directPay?: {
    eligible: boolean;
    eligibleCredits: string[];
    explanation: string;
  } | null;
  onNewAnalysis?: () => void;
  onExportPDF?: () => void;
  isExporting?: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

export function AnalysisResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Card Skeleton */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-blue-400/30" />
              <Skeleton className="h-10 w-40 bg-blue-400/30" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-4 w-32 bg-blue-400/30 ml-auto" />
              <Skeleton className="h-10 w-20 bg-blue-400/30 ml-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-12 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Incentive Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-20 ml-auto" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AnalysisResults({
  projectSummary,
  matchedPrograms,
  totals,
  recommendations,
  warnings,
  quickRecommendation,
  directPay,
  onNewAnalysis,
  onExportPDF,
  isExporting = false,
}: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-100 text-sm">Total Potential Value</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">
                {formatCurrency(totals.estimatedTotal.expected)}
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Range: {formatCurrency(totals.estimatedTotal.min)} - {formatCurrency(totals.estimatedTotal.max)}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-2">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold">{totals.totalPrograms}</p>
                  <p className="text-blue-200 text-sm">Programs</p>
                </div>
                <div className="w-px h-10 bg-blue-400/30" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-300">{totals.highConfidence}</p>
                  <p className="text-blue-200 text-sm">High Match</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Project Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Project Name</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Location</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.location}</p>
            </div>
            <div>
              <p className="text-slate-500">Building Type</p>
              <p className="font-medium text-slate-900 dark:text-white capitalize">{projectSummary.buildingType}</p>
            </div>
            <div>
              <p className="text-slate-500">Project Type</p>
              <p className="font-medium text-slate-900 dark:text-white capitalize">
                {projectSummary.projectType.replace(/_/g, ' ')}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Total Units</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.totalUnits.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Sqft</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.totalSqft.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-500">Affordable %</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.affordablePercentage}%</p>
            </div>
            <div>
              <p className="text-slate-500">Sustainability</p>
              <p className="font-medium text-slate-900 dark:text-white">{projectSummary.sustainabilityTarget}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(totals.byCategory).map(([category, data]) => (
          <Card key={category} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-4">
              <p className="text-sm text-slate-500 capitalize">{category}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(data.value)}
              </p>
              <p className="text-xs text-slate-400">{data.count} program{data.count !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Recommendation */}
      {quickRecommendation && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Lightbulb className="h-5 w-5" />
              AI Quick Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
              {quickRecommendation.summary}
            </p>
            {quickRecommendation.keyActions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200 mb-1">Key Actions:</p>
                <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                  {quickRecommendation.keyActions.slice(0, 3).map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">-</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <TrendingUp className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, i) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">-</span>
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Direct Pay Info */}
      {directPay && directPay.eligible && (
        <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <DollarSign className="h-5 w-5" />
              Direct Pay Eligible (IRA Section 6417)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-2">
              {directPay.explanation}
            </p>
            {directPay.eligibleCredits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {directPay.eligibleCredits.map((credit, i) => (
                  <Badge key={i} variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-300">
                    {credit}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Matched Programs */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Matched Incentive Programs</span>
            <Badge variant="outline">{matchedPrograms.length} programs</Badge>
          </CardTitle>
          <CardDescription>
            Programs ranked by eligibility match score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matchedPrograms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No matching programs found for this project.</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your project parameters.</p>
            </div>
          ) : (
            matchedPrograms.map((program) => (
              <IncentiveCard
                key={program.programId}
                programId={program.programId}
                programName={program.programName}
                category={program.category}
                matchScore={program.matchScore}
                eligibilityStatus={program.eligibilityStatus}
                estimatedValue={program.estimatedValue}
                requirements={program.requirements}
                nextSteps={program.nextSteps}
                applicationDeadline={program.applicationDeadline}
                complexity={program.complexity}
                directPayEligible={
                  directPay?.eligible &&
                  directPay.eligibleCredits.some((c) =>
                    program.programName.toLowerCase().includes(c.toLowerCase())
                  )
                }
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={onNewAnalysis}
          className="flex-1"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          New Analysis
        </Button>
        <Button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isExporting ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
