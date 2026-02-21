'use client';

import { useState, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Percent,
  Info,
  ChevronDown,
  ChevronUp,
  PieChart,
  ArrowUpRight,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ROICalculatorProps {
  // Pre-filled values from project
  initialTDC?: number;
  initialEquity?: number;
  initialPotentialIncentives?: number;
  initialCapturedIncentives?: number;
  projectName?: string;
  compact?: boolean;
}

interface ROIMetrics {
  incentiveTDCRatio: number;
  cashOnCashReturn: number;
  netEquityRequired: number;
  leverageMultiple: number;
  effectiveDiscount: number;
  annualizedROI: number;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function ROICalculator({
  initialTDC = 0,
  initialEquity = 0,
  initialPotentialIncentives = 0,
  initialCapturedIncentives = 0,
  projectName,
  compact = false,
}: ROICalculatorProps) {
  const [tdc, setTDC] = useState(initialTDC);
  const [equity, setEquity] = useState(initialEquity || initialTDC * 0.35); // Default 35% equity
  const [potentialIncentives, setPotentialIncentives] = useState(initialPotentialIncentives);
  const [capturedIncentives, setCapturedIncentives] = useState(initialCapturedIncentives);
  const [expanded, setExpanded] = useState(!compact);
  const [holdPeriod, setHoldPeriod] = useState(10); // Default 10-year hold

  // Calculate ROI Metrics
  const metrics: ROIMetrics = useMemo(() => {
    const totalIncentives = potentialIncentives > 0 ? potentialIncentives : capturedIncentives;

    // 1. Incentive/TDC Ratio - % of project funded by incentives
    const incentiveTDCRatio = tdc > 0 ? (totalIncentives / tdc) * 100 : 0;

    // 2. Cash-on-Cash Return - Annual incentive value / Equity invested
    const annualIncentiveValue = totalIncentives / holdPeriod;
    const cashOnCashReturn = equity > 0 ? (annualIncentiveValue / equity) * 100 : 0;

    // 3. Net Equity Required (after incentives)
    const netEquityRequired = Math.max(0, equity - totalIncentives);

    // 4. Leverage Multiple - TDC / Net Equity
    const leverageMultiple = netEquityRequired > 0 ? tdc / netEquityRequired : 0;

    // 5. Effective Discount - Incentives as % of Equity
    const effectiveDiscount = equity > 0 ? (totalIncentives / equity) * 100 : 0;

    // 6. Annualized ROI
    const annualizedROI = tdc > 0 ? (totalIncentives / tdc / holdPeriod) * 100 : 0;

    return {
      incentiveTDCRatio,
      cashOnCashReturn,
      netEquityRequired,
      leverageMultiple,
      effectiveDiscount,
      annualizedROI,
    };
  }, [tdc, equity, potentialIncentives, capturedIncentives, holdPeriod]);

  // Value captured progress
  const captureProgress = potentialIncentives > 0
    ? (capturedIncentives / potentialIncentives) * 100
    : 0;

  if (compact && !expanded) {
    return (
      <Card className="card-v41 metric-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calculator className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ROI Analysis</p>
                <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {formatPercent(metrics.incentiveTDCRatio)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(true)}
              className="text-slate-500"
            >
              Expand
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-v41">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="font-sora text-lg">
                {projectName ? `${projectName} ROI` : 'ROI Value Calculator'}
              </CardTitle>
              <CardDescription>
                Incentive impact on project economics
              </CardDescription>
            </div>
          </div>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="text-slate-500"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Incentive/TDC Ratio */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-blue-500" />
              <span className="metric-label">Incentive/TDC Ratio</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Percentage of Total Development Cost covered by incentives.
                      Higher = more project funded by incentives.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="metric-value highlight font-mono">
              {formatPercent(metrics.incentiveTDCRatio)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of project funded
            </p>
          </div>

          {/* Cash-on-Cash Return */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-500" />
              <span className="metric-label">Cash-on-Cash</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Annual incentive value as percentage of equity invested.
                      Based on {holdPeriod}-year hold period.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="metric-value font-mono text-teal-600 dark:text-teal-400">
              {formatPercent(metrics.cashOnCashReturn)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              annual return
            </p>
          </div>

          {/* Net Equity Required */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="metric-label">Net Equity</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-sm">
                      Equity required after incentive offsets.
                      Lower = less capital needed from investors.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="metric-value font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(metrics.netEquityRequired)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              after incentives
            </p>
          </div>

          {/* Leverage Multiple */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-purple-500" />
              <span className="metric-label">Leverage</span>
            </div>
            <p className="metric-value font-mono">
              {metrics.leverageMultiple > 0 ? `${metrics.leverageMultiple.toFixed(1)}x` : 'N/A'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              TDC / Net Equity
            </p>
          </div>

          {/* Effective Discount */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              <span className="metric-label">Equity Offset</span>
            </div>
            <p className="metric-value font-mono text-amber-600 dark:text-amber-400">
              {formatPercent(metrics.effectiveDiscount)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              of equity covered
            </p>
          </div>

          {/* Value Capture Progress */}
          <div className="metric-card card-v41 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span className="metric-label">Captured</span>
            </div>
            <p className="metric-value font-mono">
              {formatCurrency(capturedIncentives)}
            </p>
            <div className="mt-2">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(captureProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatPercent(captureProgress)} of potential
              </p>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="border-t border-slate-200 dark:border-navy-700 pt-6">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Adjust Parameters
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-slate-500">Total Development Cost</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={tdc || ''}
                  onChange={(e) => setTDC(Number(e.target.value))}
                  className="pl-8 font-mono text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Equity Investment</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={equity || ''}
                  onChange={(e) => setEquity(Number(e.target.value))}
                  className="pl-8 font-mono text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Potential Incentives</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  value={potentialIncentives || ''}
                  onChange={(e) => setPotentialIncentives(Number(e.target.value))}
                  className="pl-8 font-mono text-sm"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Hold Period (Years)</Label>
              <Input
                type="number"
                value={holdPeriod}
                onChange={(e) => setHoldPeriod(Number(e.target.value) || 1)}
                className="mt-1 font-mono text-sm"
                min={1}
                max={30}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Value Summary
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {potentialIncentives > 0 ? (
                  <>
                    Identified <span className="font-semibold text-blue-600">{formatCurrency(potentialIncentives)}</span> in
                    potential incentives, representing <span className="font-semibold text-teal-600">{formatPercent(metrics.incentiveTDCRatio)}</span> of
                    your total development cost. This could reduce your net equity requirement
                    to <span className="font-semibold text-emerald-600">{formatCurrency(metrics.netEquityRequired)}</span>.
                  </>
                ) : (
                  'Enter project details above to calculate potential ROI from incentives.'
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for dashboard cards
export function ROIQuickView({
  potentialIncentives,
  capturedIncentives,
  tdc,
}: {
  potentialIncentives: number;
  capturedIncentives: number;
  tdc: number;
}) {
  const ratio = tdc > 0 ? ((potentialIncentives || capturedIncentives) / tdc) * 100 : 0;
  const captureRate = potentialIncentives > 0 ? (capturedIncentives / potentialIncentives) * 100 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
          {formatPercent(ratio)}
        </p>
        <p className="text-xs text-slate-500">ROI Ratio</p>
      </div>
      <div className="h-8 w-px bg-slate-200 dark:bg-navy-700" />
      <div className="text-center">
        <p className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
          {formatPercent(captureRate)}
        </p>
        <p className="text-xs text-slate-500">Captured</p>
      </div>
    </div>
  );
}
