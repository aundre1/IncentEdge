'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Download,
  Printer,
  Mail,
  Building2,
  Loader2,
  FileBarChart,
  PieChart,
  CheckCircle2,
  Clock,
  Leaf,
  AlertCircle,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// ============================================================================
// TYPES
// ============================================================================

interface Project {
  id: string;
  name: string;
  city: string;
  state: string;
  building_type: string;
  total_development_cost: number;
  total_potential_incentives: number;
  total_captured_incentives: number;
}

interface BreakdownItem {
  type: string;
  count: number;
  estimatedValue: number;
  percentage: number;
}

interface TopProgram {
  programId: string;
  name: string;
  estimatedValue: number;
  projectCount: number;
  category: string;
}

interface StateBreakdown {
  state: string;
  count: number;
  estimatedValue: number;
}

interface PortfolioSummaryData {
  reportType: 'portfolio-summary';
  generatedAt: string;
  organization: { id: string; name: string };
  summary: {
    totalProjects: number;
    totalIncentivesIdentified: number;
    estimatedTotalValue: number;
    averagePerProject: number;
  };
  topPrograms: TopProgram[];
  breakdownByType: BreakdownItem[];
  breakdownByState: StateBreakdown[];
  recentActivity: { id: string; type: string; timestamp: string; description: string }[];
}

interface IncentiveAnalysisData {
  reportType: 'incentive-analysis';
  generatedAt: string;
  programs: {
    id: string;
    name: string;
    category: string;
    amountMax: number;
    status: string;
    matchedProjects: number;
  }[];
  totalPrograms: number;
  activePrograms: number;
  byCategory: BreakdownItem[];
}

interface ProjectDetailData {
  reportType: 'project-detail';
  generatedAt: string;
  project: {
    id: string;
    name: string;
    type: string;
    state: string;
    tdc: number;
  };
  matchedPrograms: {
    programId: string;
    name: string;
    category: string;
    estimatedValue: number;
    probability: number;
    status: string;
  }[];
  totalEstimatedValue: number;
  topOpportunity: { programId: string; name: string; estimatedValue: number } | null;
}

interface BrokerSummaryData {
  reportType: 'broker-summary';
  generatedAt: string;
  organization: { id: string; name: string };
  summary: {
    totalProjects: number;
    totalIncentivesIdentified: number;
    estimatedTotalValue: number;
  };
  breakdownByType: BreakdownItem[];
  programHighlights: TopProgram[];
}

type ReportData = PortfolioSummaryData | IncentiveAnalysisData | ProjectDetailData | BrokerSummaryData;

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCategoryBadgeClass(category: string): string {
  const map: Record<string, string> = {
    'Tax Credit': 'badge-federal',
    'Grant': 'badge-state',
    'Rebate': 'badge-utility',
    'Tax Deduction': 'badge-federal',
    'Abatement': 'badge-local',
    'Loan': 'badge-state',
    'Federal': 'badge-federal',
    'State': 'badge-state',
    'Local': 'badge-local',
    'Utility': 'badge-utility',
  };
  return map[category] || 'badge-federal';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const REPORT_TYPES = [
  {
    id: 'portfolio-summary',
    name: 'Portfolio Summary',
    description: 'High-level overview of all projects and total incentive value',
    icon: FileBarChart,
  },
  {
    id: 'incentive-analysis',
    name: 'Incentive Analysis',
    description: 'Detailed breakdown of eligible incentives by category',
    icon: PieChart,
  },
  {
    id: 'project-detail',
    name: 'Project Detail Report',
    description: 'Comprehensive single-project incentive report for clients',
    icon: Building2,
  },
  {
    id: 'broker-summary',
    name: 'Broker Client Summary',
    description: 'Print-ready report for broker client presentations',
    icon: FileText,
  },
];

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ReportLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

function ReportError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="card-v41">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-2">
          Report Generation Failed
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
          {message}
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

function ReportEmptyState() {
  return (
    <Card className="card-v41">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-2">
          No Data Yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          No data yet -- create a project and run matching to see your portfolio report.
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REPORT VIEW: PORTFOLIO SUMMARY
// ============================================================================

function PortfolioSummaryReport({
  data,
  userName,
}: {
  data: PortfolioSummaryData;
  userName: string;
}) {
  if (data.summary.totalIncentivesIdentified === 0 && data.summary.totalProjects === 0) {
    return <ReportEmptyState />;
  }

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8 print:p-0 print:shadow-none">
      {/* Report Header */}
      <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <FileBarChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora text-navy-900 dark:text-white">
              Portfolio Summary Report
            </h1>
            <p className="text-slate-500">
              Generated by IncentEdge on {formatDate(data.generatedAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Prepared for</p>
          <p className="font-semibold text-navy-900 dark:text-white">{userName}</p>
          <p className="text-sm text-slate-500">{data.organization.name}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Executive Summary
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Projects</p>
            <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">
              {data.summary.totalProjects}
            </p>
          </div>
          <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Incentives Identified</p>
            <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">
              {data.summary.totalIncentivesIdentified}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Estimated Total Value</p>
            <p className="text-2xl font-bold font-mono text-blue-600">
              {formatCurrency(data.summary.estimatedTotalValue)}
            </p>
          </div>
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">Avg Per Project</p>
            <p className="text-2xl font-bold font-mono text-teal-600">
              {formatCurrency(data.summary.averagePerProject)}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown by Type */}
      {data.breakdownByType.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Incentive Breakdown by Category
          </h2>
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Category</th>
                <th className="text-right">Count</th>
                <th className="text-right">Est. Value</th>
                <th className="text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdownByType.map((item) => (
                <tr key={item.type}>
                  <td>
                    <span className={`${getCategoryBadgeClass(item.type)} text-xs px-2 py-1 rounded`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="text-right font-mono">{item.count}</td>
                  <td className="text-right font-mono">{formatCurrency(item.estimatedValue)}</td>
                  <td className="text-right">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <td>Total</td>
                <td className="text-right font-mono">
                  {data.breakdownByType.reduce((sum, i) => sum + i.count, 0)}
                </td>
                <td className="text-right font-mono text-blue-600">
                  {formatCurrency(data.summary.estimatedTotalValue)}
                </td>
                <td className="text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Top Programs */}
      {data.topPrograms.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Top Programs
          </h2>
          <div className="space-y-3">
            {data.topPrograms.slice(0, 5).map((prog) => (
              <div
                key={prog.programId}
                className="flex items-center justify-between p-3 bg-navy-50 dark:bg-navy-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{prog.name}</p>
                  <p className="text-sm text-slate-500">
                    {prog.category} -- {prog.projectCount} project{prog.projectCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <p className="font-bold font-mono text-blue-600">
                  {formatCurrency(prog.estimatedValue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State Breakdown */}
      {data.breakdownByState.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Breakdown by State
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.breakdownByState.map((s) => (
              <div
                key={s.state}
                className="flex items-center justify-between p-3 bg-navy-50 dark:bg-navy-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{s.state}</p>
                  <p className="text-sm text-slate-500">{s.count} incentive{s.count !== 1 ? 's' : ''}</p>
                </div>
                <p className="font-bold font-mono text-teal-600">
                  {formatCurrency(s.estimatedValue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Recommended Next Steps
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-teal-500 mt-0.5" />
            <div>
              <p className="font-medium text-navy-900 dark:text-white">Complete eligibility verification</p>
              <p className="text-sm text-slate-500">Confirm project parameters meet program requirements</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-navy-900 dark:text-white">Review application deadlines</p>
              <p className="text-sm text-slate-500">Check upcoming deadlines for identified programs</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-navy-50 dark:bg-navy-800 rounded-lg">
            <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-navy-900 dark:text-white">Prepare documentation</p>
              <p className="text-sm text-slate-500">Energy models, cost certifications, and compliance reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-navy-200 dark:border-navy-700 pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            <p>Generated by IncentEdge V41</p>
            <p>Confidential - For Client Use Only</p>
          </div>
          <div className="text-right">
            <p>{formatDate(data.generatedAt)}</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT VIEW: INCENTIVE ANALYSIS
// ============================================================================

function IncentiveAnalysisReport({ data }: { data: IncentiveAnalysisData }) {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8 print:p-0 print:shadow-none">
      <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <PieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora text-navy-900 dark:text-white">
              Incentive Analysis Report
            </h1>
            <p className="text-slate-500">
              Generated by IncentEdge on {formatDate(data.generatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Programs</p>
          <p className="text-2xl font-bold font-mono text-navy-900 dark:text-white">
            {data.totalPrograms.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Programs</p>
          <p className="text-2xl font-bold font-mono text-emerald-600">
            {data.activePrograms.toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Matched to Your Projects</p>
          <p className="text-2xl font-bold font-mono text-blue-600">
            {data.programs.length}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      {data.byCategory.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Breakdown by Category
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {data.byCategory.map((cat) => (
              <div key={cat.type} className="flex items-center justify-between p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{cat.type}</p>
                  <p className="text-sm text-slate-500">{cat.count} program{cat.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-blue-600">{formatCurrency(cat.estimatedValue)}</p>
                  <p className="text-sm text-slate-500">{cat.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matched Programs List */}
      {data.programs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Matched Programs
          </h2>
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Program</th>
                <th>Category</th>
                <th className="text-right">Max Amount</th>
                <th className="text-center">Projects</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.programs.slice(0, 20).map((prog) => (
                <tr key={prog.id}>
                  <td className="font-medium">{prog.name}</td>
                  <td>
                    <Badge variant="outline" className="text-xs">{prog.category}</Badge>
                  </td>
                  <td className="text-right font-mono">{formatCurrency(prog.amountMax)}</td>
                  <td className="text-center">{prog.matchedProjects}</td>
                  <td className="text-center">
                    <Badge variant={prog.status === 'active' ? 'success' : 'secondary'} className="text-xs">
                      {prog.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.programs.length === 0 && <ReportEmptyState />}

      {/* Footer */}
      <div className="border-t border-navy-200 dark:border-navy-700 pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>Generated by IncentEdge V41 -- Confidential</p>
          <p>{formatDate(data.generatedAt)}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT VIEW: PROJECT DETAIL
// ============================================================================

function ProjectDetailReport({ data }: { data: ProjectDetailData }) {
  if (data.matchedPrograms.length === 0) {
    return <ReportEmptyState />;
  }

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8 print:p-0 print:shadow-none">
      <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora text-navy-900 dark:text-white">
              {data.project.name} -- Incentive Report
            </h1>
            <p className="text-slate-500">
              {data.project.type} in {data.project.state} -- Generated {formatDate(data.generatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Project Type</p>
          <p className="text-lg font-bold font-mono text-navy-900 dark:text-white">
            {data.project.type}
          </p>
        </div>
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Development Cost</p>
          <p className="text-lg font-bold font-mono text-navy-900 dark:text-white">
            {formatCurrency(data.project.tdc)}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Total Estimated</p>
          <p className="text-lg font-bold font-mono text-blue-600">
            {formatCurrency(data.totalEstimatedValue)}
          </p>
        </div>
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">Programs Matched</p>
          <p className="text-lg font-bold font-mono text-teal-600">
            {data.matchedPrograms.length}
          </p>
        </div>
      </div>

      {/* Top Opportunity */}
      {data.topOpportunity && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg border border-blue-500/20">
          <h3 className="font-semibold text-navy-900 dark:text-white mb-2">Top Opportunity</h3>
          <p className="text-slate-600 dark:text-slate-400">
            <strong className="text-blue-600">{data.topOpportunity.name}</strong> with an estimated
            value of{' '}
            <strong className="text-teal-600">{formatCurrency(data.topOpportunity.estimatedValue)}</strong>
          </p>
        </div>
      )}

      {/* Matched Programs Table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Matched Incentive Programs
        </h2>
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>Program</th>
              <th>Category</th>
              <th className="text-right">Est. Value</th>
              <th className="text-center">Probability</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.matchedPrograms.map((prog) => (
              <tr key={prog.programId}>
                <td className="font-medium">{prog.name}</td>
                <td>
                  <span className={`${getCategoryBadgeClass(prog.category)} text-xs px-2 py-1 rounded`}>
                    {prog.category}
                  </span>
                </td>
                <td className="text-right font-mono">{formatCurrency(prog.estimatedValue)}</td>
                <td className="text-center">
                  <Badge
                    variant={prog.probability >= 80 ? 'success' : prog.probability >= 50 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {prog.probability}%
                  </Badge>
                </td>
                <td className="text-center capitalize">{prog.status}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={2}>Total</td>
              <td className="text-right font-mono text-blue-600">
                {formatCurrency(data.totalEstimatedValue)}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-navy-200 dark:border-navy-700 pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <p>Generated by IncentEdge V41 -- Confidential</p>
          <p>{formatDate(data.generatedAt)}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT VIEW: BROKER SUMMARY
// ============================================================================

function BrokerSummaryReport({
  data,
  userName,
}: {
  data: BrokerSummaryData;
  userName: string;
}) {
  if (data.summary.totalIncentivesIdentified === 0 && data.summary.totalProjects === 0) {
    return <ReportEmptyState />;
  }

  return (
    <div className="bg-white dark:bg-navy-900 rounded-lg shadow-lg p-8 print:p-0 print:shadow-none">
      <div className="flex items-start justify-between border-b border-navy-200 dark:border-navy-700 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora text-navy-900 dark:text-white">
              Broker Client Summary
            </h1>
            <p className="text-slate-500">
              {data.organization.name} -- {formatDate(data.generatedAt)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Prepared by</p>
          <p className="font-semibold text-navy-900 dark:text-white">{userName}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Projects</p>
          <p className="text-3xl font-bold font-mono text-navy-900 dark:text-white">
            {data.summary.totalProjects}
          </p>
        </div>
        <div className="p-4 bg-navy-50 dark:bg-navy-800 rounded-lg text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Incentives Found</p>
          <p className="text-3xl font-bold font-mono text-navy-900 dark:text-white">
            {data.summary.totalIncentivesIdentified}
          </p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-3xl font-bold font-mono text-blue-600">
            {formatCurrency(data.summary.estimatedTotalValue)}
          </p>
        </div>
      </div>

      {/* Type Breakdown */}
      {data.breakdownByType.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
            Incentive Breakdown
          </h2>
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th className="text-right">Count</th>
                <th className="text-right">Value</th>
                <th className="text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdownByType.map((item) => (
                <tr key={item.type}>
                  <td>{item.type}</td>
                  <td className="text-right font-mono">{item.count}</td>
                  <td className="text-right font-mono">{formatCurrency(item.estimatedValue)}</td>
                  <td className="text-right">{item.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Program Highlights */}
      {data.programHighlights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Top Program Opportunities
          </h2>
          <div className="space-y-3">
            {data.programHighlights.map((prog) => (
              <div
                key={prog.programId}
                className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
              >
                <div>
                  <p className="font-medium text-navy-900 dark:text-white">{prog.name}</p>
                  <p className="text-sm text-emerald-600">{prog.category} -- {prog.projectCount} project{prog.projectCount !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(prog.estimatedValue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-navy-200 dark:border-navy-700 pt-6 mt-8">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            <p>Generated by IncentEdge V41</p>
            <p>Confidential - For Client Use Only</p>
          </div>
          <div className="text-right">
            <p>{formatDate(data.generatedAt)}</p>
            <p>Page 1 of 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN REPORTS CONTENT
// ============================================================================

function ReportsContent() {
  const searchParams = useSearchParams();
  const { profile, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedReportType, setSelectedReportType] = useState<string>('portfolio-summary');
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Load projects
  useEffect(() => {
    async function fetchProjects() {
      if (!profile?.organization_id) return;

      const supabase = createClient();
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (data) {
        setProjects(data);
      }
      setLoading(false);
    }

    fetchProjects();
  }, [profile?.organization_id]);

  // Check for project param in URL
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) {
      setSelectedProject(projectId);
      setSelectedReportType('project-detail');
    }
  }, [searchParams]);

  // Generate report via real API
  const handleGenerateReport = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        reportType: selectedReportType,
        format: 'json',
      };

      if (selectedProject !== 'all') {
        body.projectId = selectedProject;
      }

      if (profile?.organization_id) {
        body.organizationId = profile.organization_id;
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errData.error || `Report generation failed (${response.status})`);
      }

      const data = await response.json();
      setReportData(data);
      setShowReport(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
    } finally {
      setGenerating(false);
    }
  }, [selectedReportType, selectedProject, profile?.organization_id]);

  // Print report
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const userName = profile?.full_name || user?.email || 'User';

  // Show report view
  if (showReport && reportData) {
    return (
      <div className="space-y-6">
        {/* Report Header - No Print */}
        <div className="flex items-center justify-between no-print">
          <Button variant="outline" onClick={() => setShowReport(false)}>
            Back to Reports
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Render report based on type */}
        <div ref={reportRef}>
          {reportData.reportType === 'portfolio-summary' && (
            <PortfolioSummaryReport data={reportData as PortfolioSummaryData} userName={userName} />
          )}
          {reportData.reportType === 'incentive-analysis' && (
            <IncentiveAnalysisReport data={reportData as IncentiveAnalysisData} />
          )}
          {reportData.reportType === 'project-detail' && (
            <ProjectDetailReport data={reportData as ProjectDetailData} />
          )}
          {reportData.reportType === 'broker-summary' && (
            <BrokerSummaryReport data={reportData as BrokerSummaryData} userName={userName} />
          )}
        </div>
      </div>
    );
  }

  // Show loading skeleton while generating
  if (generating) {
    return <ReportLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
          Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Generate professional incentive analysis reports for clients
        </p>
      </div>

      {/* Error State */}
      {error && (
        <ReportError message={error} onRetry={handleGenerateReport} />
      )}

      {/* Report Generator */}
      <Card className="card-v41">
        <CardHeader>
          <CardTitle className="font-sora">Generate Report</CardTitle>
          <CardDescription>
            Create print-ready reports for brokers and client presentations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedReportType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-navy-200 dark:border-navy-700 hover:border-blue-300'
                }`}
              >
                <type.icon className={`w-6 h-6 mb-2 ${
                  selectedReportType === type.id ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <p className="font-medium text-navy-900 dark:text-white">{type.name}</p>
                <p className="text-xs text-slate-500 mt-1">{type.description}</p>
              </button>
            ))}
          </div>

          <Separator />

          {/* Project Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects (Portfolio)</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.city}, {project.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedReportType === 'project-detail' && selectedProject === 'all' && (
                <p className="text-xs text-amber-600 mt-1">
                  Select a specific project for the Project Detail report
                </p>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={generating || (selectedReportType === 'project-detail' && selectedProject === 'all')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="card-v41">
        <CardHeader>
          <CardTitle className="font-sora">Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No reports generated yet</p>
            <p className="text-sm">Generate your first report above</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// PAGE WRAPPER
// ============================================================================

function LoadingState() {
  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading reports...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportsContent />
    </Suspense>
  );
}
