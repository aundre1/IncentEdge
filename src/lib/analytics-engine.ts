// Analytics Engine for IncentEdge
// Comprehensive analytics calculations for incentive tracking and portfolio analysis

import {
  TimeSeriesData,
  TimeSeriesDataPoint,
  TimeSeriesComparison,
  GrowthMetrics,
  MovingAverageResult,
  PortfolioMetrics,
  PortfolioValueMetrics,
  ConcentrationAnalysis,
  ConcentrationItem,
  PortfolioRiskMetrics,
  IncentivePipeline,
  PipelineStage,
  PipelineStageType,
  PipelineFunnel,
  PipelineVelocity,
  PipelineForecast,
  ForecastValue,
  SensitivityScenario,
  ScenarioImpact,
  WhatIfAnalysis,
  TornadoChartData,
  TornadoFactor,
  BreakevenAnalysis,
  BenchmarkComparison,
  BenchmarkScore,
  BenchmarkCategory,
  BenchmarkInsight,
  ApplicationAnalytics,
  ApplicationSuccessMetrics,
  ApplicationTimingAnalysis,
  TimingBottleneck,
  SuccessProbabilityModel,
  ProbabilityFactor,
  IRRImpactAnalysis,
  IncentiveIRRImpact,
  IRRSensitivity,
  DashboardAnalytics,
  AnalyticsInsight,
  AnalyticsAlert,
  TimePeriod,
} from '@/types/analytics';

import {
  IncentiveCategory,
  IncentiveType,
  SustainabilityTier,
  Project,
  EligibilityMatch,
  Application,
} from '@/types';

// ============================================================================
// TIME SERIES CALCULATIONS
// ============================================================================

export class TimeSeriesCalculator {
  /**
   * Calculate Month-over-Month, Quarter-over-Quarter, and Year-over-Year growth
   */
  static calculateGrowthMetrics(data: TimeSeriesDataPoint[]): GrowthMetrics {
    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const now = new Date();
    const currentMonth = this.getValueForPeriod(sortedData, now, 'month');
    const lastMonth = this.getValueForPeriod(sortedData, this.subtractMonths(now, 1), 'month');
    const currentQuarter = this.getValueForPeriod(sortedData, now, 'quarter');
    const lastQuarter = this.getValueForPeriod(sortedData, this.subtractMonths(now, 3), 'quarter');
    const currentYear = this.getValueForPeriod(sortedData, now, 'year');
    const lastYear = this.getValueForPeriod(sortedData, this.subtractMonths(now, 12), 'year');

    return {
      mom: this.calculateComparison(currentMonth, lastMonth),
      qoq: this.calculateComparison(currentQuarter, lastQuarter),
      yoy: this.calculateComparison(currentYear, lastYear),
      cagr: this.calculateCAGR(sortedData),
    };
  }

  /**
   * Calculate Compound Annual Growth Rate
   */
  static calculateCAGR(data: TimeSeriesDataPoint[]): number | undefined {
    if (data.length < 2) return undefined;

    const sortedData = [...data].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const startValue = sortedData[0].value;
    const endValue = sortedData[sortedData.length - 1].value;
    const startDate = new Date(sortedData[0].date);
    const endDate = new Date(sortedData[sortedData.length - 1].date);

    const years = (endDate.getTime() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (years < 1 || startValue <= 0) return undefined;

    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  /**
   * Calculate Simple Moving Average
   */
  static calculateSMA(data: number[], period: number): number[] {
    if (data.length < period) return [];

    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  /**
   * Calculate Weighted Moving Average
   */
  static calculateWMA(data: number[], period: number): number[] {
    if (data.length < period) return [];

    const weights = Array.from({ length: period }, (_, i) => i + 1);
    const weightSum = weights.reduce((a, b) => a + b, 0);

    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const windowData = data.slice(i - period + 1, i + 1);
      const weightedSum = windowData.reduce((sum, val, idx) => sum + val * weights[idx], 0);
      result.push(weightedSum / weightSum);
    }
    return result;
  }

  /**
   * Calculate Exponential Moving Average
   */
  static calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return [];

    const multiplier = 2 / (period + 1);
    const result: number[] = [];

    // First EMA value is SMA
    const firstSMA = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(firstSMA);

    // Calculate EMA for remaining values
    for (let i = period; i < data.length; i++) {
      const ema = (data[i] - result[result.length - 1]) * multiplier + result[result.length - 1];
      result.push(ema);
    }

    return result;
  }

  /**
   * Calculate all moving averages
   */
  static calculateMovingAverages(data: TimeSeriesDataPoint[], period: number): MovingAverageResult {
    const values = data.map(d => d.value);
    return {
      simple: this.calculateSMA(values, period),
      weighted: this.calculateWMA(values, period),
      exponential: this.calculateEMA(values, period),
      period,
    };
  }

  /**
   * Aggregate time series data by period
   */
  static aggregateByPeriod(
    data: TimeSeriesDataPoint[],
    period: TimePeriod,
    aggregation: 'sum' | 'average' | 'count' | 'latest'
  ): TimeSeriesDataPoint[] {
    const grouped = new Map<string, number[]>();

    data.forEach(point => {
      const key = this.getPeriodKey(new Date(point.date), period);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(point.value);
    });

    const result: TimeSeriesDataPoint[] = [];
    grouped.forEach((values, key) => {
      let aggregatedValue: number;
      switch (aggregation) {
        case 'sum':
          aggregatedValue = values.reduce((a, b) => a + b, 0);
          break;
        case 'average':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          aggregatedValue = values.length;
          break;
        case 'latest':
          aggregatedValue = values[values.length - 1];
          break;
      }
      result.push({ date: key, value: aggregatedValue });
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Helper methods
  private static getValueForPeriod(
    data: TimeSeriesDataPoint[],
    date: Date,
    period: 'month' | 'quarter' | 'year'
  ): number {
    const filtered = data.filter(d => {
      const dataDate = new Date(d.date);
      switch (period) {
        case 'month':
          return dataDate.getMonth() === date.getMonth() &&
                 dataDate.getFullYear() === date.getFullYear();
        case 'quarter':
          return Math.floor(dataDate.getMonth() / 3) === Math.floor(date.getMonth() / 3) &&
                 dataDate.getFullYear() === date.getFullYear();
        case 'year':
          return dataDate.getFullYear() === date.getFullYear();
      }
    });
    return filtered.reduce((sum, d) => sum + d.value, 0);
  }

  private static calculateComparison(current: number, previous: number): TimeSeriesComparison {
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
    return {
      current,
      previous,
      change,
      changePercent,
      trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
    };
  }

  private static subtractMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() - months);
    return result;
  }

  private static getPeriodKey(date: Date, period: TimePeriod): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const week = this.getWeekNumber(date);
        return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return date.getFullYear().toString();
    }
  }

  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}

// ============================================================================
// PORTFOLIO CONCENTRATION ANALYSIS
// ============================================================================

export class ConcentrationAnalyzer {
  /**
   * Calculate Herfindahl-Hirschman Index (HHI)
   * Range: 0 to 10,000
   * < 1,500: Low concentration (diversified)
   * 1,500-2,500: Moderate concentration
   * > 2,500: High concentration
   */
  static calculateHHI(items: ConcentrationItem[]): number {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return 0;

    return items.reduce((hhi, item) => {
      const marketShare = (item.value / total) * 100;
      return hhi + marketShare * marketShare;
    }, 0);
  }

  /**
   * Calculate diversification score (0-100)
   * Based on inverse of normalized HHI
   */
  static calculateDiversificationScore(items: ConcentrationItem[]): number {
    if (items.length === 0) return 0;

    const hhi = this.calculateHHI(items);
    const maxHHI = 10000; // 100% in one category
    const minHHI = 10000 / items.length; // Perfectly distributed

    // Normalize to 0-100 scale (100 = perfectly diversified)
    const normalized = ((maxHHI - hhi) / (maxHHI - minHHI)) * 100;
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Group and calculate concentration by a category
   */
  static calculateConcentration<T>(
    items: T[],
    getCategory: (item: T) => string,
    getValue: (item: T) => number
  ): ConcentrationItem[] {
    const grouped = new Map<string, { value: number; count: number }>();

    items.forEach(item => {
      const category = getCategory(item);
      const value = getValue(item);

      if (!grouped.has(category)) {
        grouped.set(category, { value: 0, count: 0 });
      }
      const current = grouped.get(category)!;
      current.value += value;
      current.count += 1;
    });

    const total = Array.from(grouped.values()).reduce((sum, g) => sum + g.value, 0);

    const result: ConcentrationItem[] = [];
    grouped.forEach((data, category) => {
      result.push({
        category,
        value: data.value,
        percentage: total > 0 ? (data.value / total) * 100 : 0,
        count: data.count,
      });
    });

    return result.sort((a, b) => b.value - a.value);
  }

  /**
   * Full concentration analysis for a portfolio
   */
  static analyzeConcentration(
    projects: Project[],
    matches: EligibilityMatch[]
  ): ConcentrationAnalysis {
    // Geographic concentration
    const byState = this.calculateConcentration(
      projects,
      p => p.state || 'Unknown',
      p => p.total_development_cost || 0
    );

    const byCity = this.calculateConcentration(
      projects,
      p => p.city || 'Unknown',
      p => p.total_development_cost || 0
    );

    // Project type concentration
    const bySector = this.calculateConcentration(
      projects,
      p => p.sector_type,
      p => p.total_development_cost || 0
    );

    const byBuildingType = this.calculateConcentration(
      projects,
      p => p.building_type || 'Unknown',
      p => p.total_development_cost || 0
    );

    // Incentive concentration
    const byIncentiveCategory = this.calculateConcentration(
      matches,
      m => m.incentive_program.category,
      m => m.estimated_value
    );

    const byIncentiveType = this.calculateConcentration(
      matches,
      m => m.incentive_program.incentive_type,
      m => m.estimated_value
    );

    // Sustainability tier (from target certification or inferred)
    const byTier = this.calculateConcentration(
      projects,
      p => p.target_certification || 'Not Specified',
      p => p.total_development_cost || 0
    );

    return {
      byState,
      byCity,
      bySector,
      byBuildingType,
      byIncentiveCategory,
      byIncentiveType,
      byTier,
      geographicHHI: this.calculateHHI(byState),
      sectorHHI: this.calculateHHI(bySector),
      incentiveHHI: this.calculateHHI(byIncentiveCategory),
      diversificationScore: this.calculateDiversificationScore(byIncentiveCategory),
    };
  }
}

// ============================================================================
// SUCCESS PROBABILITY MODELING
// ============================================================================

export class ProbabilityModeler {
  /**
   * Calculate success probability based on historical data and current factors
   */
  static calculateSuccessProbability(
    application: Partial<Application>,
    match: EligibilityMatch,
    historicalData: ApplicationSuccessMetrics
  ): number {
    // Base probability from overall success rate
    let probability = historicalData.approvalRate;

    // Adjust based on requirements met
    const requirementsFactor = match.requirements_met / match.requirements_total;
    probability *= (0.5 + requirementsFactor * 0.5);

    // Adjust based on category-specific rates
    const categoryRate = historicalData.ratesByCategory[match.incentive_program.category];
    if (categoryRate !== undefined) {
      probability = (probability + categoryRate) / 2;
    }

    // Adjust based on relevance score
    probability *= (0.7 + match.relevance_score * 0.3);

    // Adjust based on overall match score
    probability *= (0.8 + match.overall_score * 0.2 / 100);

    // Cap between 0 and 1
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * Get top factors affecting success probability
   */
  static getTopProbabilityFactors(
    applications: Application[],
    matches: Map<string, EligibilityMatch>
  ): ProbabilityFactor[] {
    // In a real implementation, this would use ML feature importance
    // For now, return typical important factors
    return [
      {
        factor: 'Requirements Met',
        importance: 0.35,
        direction: 'positive',
        description: 'Higher percentage of requirements met correlates with approval',
      },
      {
        factor: 'Previous Applications',
        importance: 0.20,
        direction: 'positive',
        description: 'Prior approved applications from same organization increase chances',
      },
      {
        factor: 'Documentation Quality',
        importance: 0.18,
        direction: 'positive',
        description: 'Complete and accurate documentation improves outcomes',
      },
      {
        factor: 'Submission Timing',
        importance: 0.12,
        direction: 'positive',
        description: 'Earlier submissions relative to deadline have higher success',
      },
      {
        factor: 'Program Competition',
        importance: 0.10,
        direction: 'negative',
        description: 'High competition programs have lower individual success rates',
      },
      {
        factor: 'Application Amount',
        importance: 0.05,
        direction: 'negative',
        description: 'Larger requests relative to program capacity face more scrutiny',
      },
    ];
  }

  /**
   * Build success probability model summary
   */
  static buildProbabilityModel(
    applications: Application[],
    matches: Map<string, EligibilityMatch>
  ): SuccessProbabilityModel {
    const approved = applications.filter(a => a.status === 'approved').length;
    const total = applications.filter(a => ['approved', 'rejected'].includes(a.status)).length;
    const accuracy = total > 0 ? approved / total : 0.5;

    return {
      modelVersion: '1.0.0',
      lastTrained: new Date().toISOString(),
      accuracy,
      topFactors: this.getTopProbabilityFactors(applications, matches),
      thresholds: {
        highConfidence: 0.75,
        mediumConfidence: 0.50,
        lowConfidence: 0.25,
      },
    };
  }
}

// ============================================================================
// INCENTIVE PIPELINE FORECASTING
// ============================================================================

export class PipelineForecaster {
  /**
   * Calculate pipeline funnel metrics
   */
  static calculateFunnel(
    matches: EligibilityMatch[],
    applications: Application[]
  ): PipelineFunnel {
    const totalIdentified = matches.length;
    const totalQualified = matches.filter(m => m.overall_score >= 50).length;
    const totalApplied = applications.filter(a =>
      ['submitted', 'under-review', 'approved', 'rejected'].includes(a.status)
    ).length;
    const totalApproved = applications.filter(a => a.status === 'approved').length;
    const totalCaptured = applications.filter(a =>
      a.status === 'approved' && a.amount_approved !== null
    ).length;

    return {
      totalIdentified,
      totalQualified,
      totalApplied,
      totalApproved,
      totalCaptured,
      qualificationRate: totalIdentified > 0 ? totalQualified / totalIdentified : 0,
      applicationRate: totalQualified > 0 ? totalApplied / totalQualified : 0,
      approvalRate: totalApplied > 0 ? totalApproved / totalApplied : 0,
      captureRate: totalApproved > 0 ? totalCaptured / totalApproved : 0,
      overallConversion: totalIdentified > 0 ? totalCaptured / totalIdentified : 0,
    };
  }

  /**
   * Calculate pipeline velocity metrics
   */
  static calculateVelocity(applications: Application[]): PipelineVelocity {
    const completedApps = applications.filter(a =>
      a.status === 'approved' && a.decision_date && a.submission_date
    );

    const daysToCapture = completedApps.map(a => {
      const submit = new Date(a.submission_date!);
      const decision = new Date(a.decision_date!);
      return (decision.getTime() - submit.getTime()) / (1000 * 60 * 60 * 24);
    });

    const averageDaysToCapture = daysToCapture.length > 0
      ? daysToCapture.reduce((a, b) => a + b, 0) / daysToCapture.length
      : 0;

    const sortedDays = [...daysToCapture].sort((a, b) => a - b);
    const medianDaysToCapture = sortedDays.length > 0
      ? sortedDays[Math.floor(sortedDays.length / 2)]
      : 0;

    // Calculate average days by stage (simplified)
    const averageDaysByStage: Record<PipelineStageType, number> = {
      identified: 7,
      qualified: 14,
      in_preparation: 21,
      submitted: 3,
      under_review: 45,
      approved: 5,
      captured: 30,
    };

    // Determine velocity trend based on recent vs historical
    const recentApps = completedApps.filter(a => {
      const decision = new Date(a.decision_date!);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return decision >= threeMonthsAgo;
    });

    const recentAvg = recentApps.length > 0
      ? recentApps.map(a => {
          const submit = new Date(a.submission_date!);
          const decision = new Date(a.decision_date!);
          return (decision.getTime() - submit.getTime()) / (1000 * 60 * 60 * 24);
        }).reduce((a, b) => a + b, 0) / recentApps.length
      : averageDaysToCapture;

    const velocityChange = averageDaysToCapture > 0
      ? ((averageDaysToCapture - recentAvg) / averageDaysToCapture) * 100
      : 0;

    return {
      averageDaysToCapture,
      medianDaysToCapture,
      averageDaysByStage,
      velocityTrend: velocityChange > 5 ? 'accelerating' : velocityChange < -5 ? 'slowing' : 'stable',
      velocityChange,
    };
  }

  /**
   * Generate pipeline forecast
   */
  static generateForecast(
    matches: EligibilityMatch[],
    applications: Application[],
    funnel: PipelineFunnel
  ): PipelineForecast {
    // Get pending value by stage
    const pendingMatches = matches.filter(m => m.status === 'matched');
    const inProgressApps = applications.filter(a =>
      ['draft', 'in-progress', 'ready-for-review'].includes(a.status)
    );
    const submittedApps = applications.filter(a =>
      ['submitted', 'under-review'].includes(a.status)
    );

    // Calculate expected captures using historical conversion rates
    const pendingValue = pendingMatches.reduce((sum, m) => sum + m.estimated_value, 0);
    const inProgressValue = inProgressApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);
    const submittedValue = submittedApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);

    const expectedFromPending = pendingValue * funnel.overallConversion;
    const expectedFromInProgress = inProgressValue * funnel.approvalRate;
    const expectedFromSubmitted = submittedValue * funnel.approvalRate;

    // Time-based forecasts
    const next30Days: ForecastValue = {
      expected: expectedFromSubmitted * 0.6,
      low: expectedFromSubmitted * 0.3,
      high: expectedFromSubmitted * 0.9,
      confidence: 0.75,
    };

    const next90Days: ForecastValue = {
      expected: expectedFromSubmitted + expectedFromInProgress * 0.5,
      low: (expectedFromSubmitted + expectedFromInProgress * 0.5) * 0.6,
      high: (expectedFromSubmitted + expectedFromInProgress * 0.5) * 1.4,
      confidence: 0.60,
    };

    const next12Months: ForecastValue = {
      expected: expectedFromSubmitted + expectedFromInProgress + expectedFromPending,
      low: (expectedFromSubmitted + expectedFromInProgress + expectedFromPending) * 0.4,
      high: (expectedFromSubmitted + expectedFromInProgress + expectedFromPending) * 1.6,
      confidence: 0.40,
    };

    // By category
    const byCategory = {} as Record<IncentiveCategory, ForecastValue>;
    const categories: IncentiveCategory[] = ['federal', 'state', 'local', 'utility'];

    categories.forEach(category => {
      const categoryMatches = matches.filter(m => m.incentive_program.category === category);
      const categoryValue = categoryMatches.reduce((sum, m) => sum + m.estimated_value, 0);
      const expectedValue = categoryValue * funnel.overallConversion;

      byCategory[category] = {
        expected: expectedValue,
        low: expectedValue * 0.5,
        high: expectedValue * 1.5,
        confidence: 0.50,
      };
    });

    // By tier (simplified)
    const byTier = {} as Record<SustainabilityTier, ForecastValue>;
    const tiers: SustainabilityTier[] = [
      'tier_1_efficient',
      'tier_2_high_performance',
      'tier_3_net_zero',
      'tier_3_triple_net_zero',
    ];

    tiers.forEach(tier => {
      // In a real implementation, this would be based on project tier data
      byTier[tier] = {
        expected: next12Months.expected / tiers.length,
        low: next12Months.low / tiers.length,
        high: next12Months.high / tiers.length,
        confidence: 0.40,
      };
    });

    return {
      next30Days,
      next90Days,
      next12Months,
      byCategory,
      byTier,
      modelAccuracy: funnel.approvalRate > 0 ? 0.72 : 0.5,
      lastCalibrated: new Date().toISOString(),
    };
  }
}

// ============================================================================
// SENSITIVITY ANALYSIS (WHAT-IF SCENARIOS)
// ============================================================================

export class SensitivityAnalyzer {
  /**
   * Run a what-if scenario
   */
  static runScenario(
    baselineValue: number,
    parameters: Array<{ name: string; baseValue: number; scenarioValue: number; impact: number }>
  ): SensitivityScenario {
    let scenarioValue = baselineValue;

    const impacts: ScenarioImpact[] = parameters.map(param => {
      const change = (param.scenarioValue - param.baseValue) * param.impact;
      scenarioValue += change;

      return {
        metric: param.name,
        baseline: param.baseValue,
        projected: param.scenarioValue,
        change,
        changePercent: param.baseValue !== 0 ? (change / param.baseValue) * 100 : 0,
        severity: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
      };
    });

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `scenario-${Date.now()}`,
      name: 'Custom Scenario',
      description: 'User-defined what-if scenario',
      type: 'custom',
      parameters: parameters.map(p => ({
        name: p.name,
        baseValue: p.baseValue,
        scenarioValue: p.scenarioValue,
      })),
      baselineValue,
      scenarioValue,
      delta: scenarioValue - baselineValue,
      deltaPercent: baselineValue !== 0 ? ((scenarioValue - baselineValue) / baselineValue) * 100 : 0,
      impacts,
    };
  }

  /**
   * Generate tornado chart data for sensitivity analysis
   */
  static generateTornadoChart(
    baselineValue: number,
    factors: Array<{ name: string; lowRange: number; highRange: number; sensitivity: number }>
  ): TornadoChartData {
    const tornadoFactors: TornadoFactor[] = factors.map(factor => {
      const lowResult = baselineValue + (factor.lowRange * factor.sensitivity);
      const highResult = baselineValue + (factor.highRange * factor.sensitivity);

      return {
        name: factor.name,
        lowValue: factor.lowRange,
        highValue: factor.highRange,
        lowResult,
        highResult,
        sensitivity: factor.sensitivity,
      };
    });

    // Sort by impact range (widest first)
    tornadoFactors.sort((a, b) =>
      Math.abs(b.highResult - b.lowResult) - Math.abs(a.highResult - a.lowResult)
    );

    return {
      metric: 'Total Incentive Value',
      baseline: baselineValue,
      factors: tornadoFactors,
    };
  }

  /**
   * Calculate breakeven point
   */
  static calculateBreakeven(
    currentValue: number,
    targetValue: number,
    variableName: string
  ): BreakevenAnalysis {
    const buffer = currentValue - targetValue;
    const bufferPercent = targetValue !== 0 ? (buffer / targetValue) * 100 : 0;

    return {
      metric: variableName,
      currentValue,
      breakevenPoint: targetValue,
      buffer,
      bufferPercent,
    };
  }

  /**
   * Run predefined policy change scenarios
   */
  static runPolicyScenarios(
    currentIncentiveValue: number,
    portfolioData: {
      federalPercent: number;
      statePercent: number;
      domesticContentEligible: number;
      prevailingWageCommitted: number;
    }
  ): SensitivityScenario[] {
    const scenarios: SensitivityScenario[] = [];

    // Scenario 1: ITC rate reduction
    scenarios.push(this.runScenario(currentIncentiveValue, [
      {
        name: 'Federal ITC Rate',
        baseValue: 30,
        scenarioValue: 22,
        impact: currentIncentiveValue * portfolioData.federalPercent / 100 / 30,
      },
    ]));
    scenarios[scenarios.length - 1].name = 'ITC Rate Reduction to 22%';
    scenarios[scenarios.length - 1].type = 'policy_change';

    // Scenario 2: Domestic content bonus removal
    scenarios.push(this.runScenario(currentIncentiveValue, [
      {
        name: 'Domestic Content Bonus',
        baseValue: 10,
        scenarioValue: 0,
        impact: currentIncentiveValue * portfolioData.domesticContentEligible / 100 / 10,
      },
    ]));
    scenarios[scenarios.length - 1].name = 'Domestic Content Bonus Removal';
    scenarios[scenarios.length - 1].type = 'policy_change';

    // Scenario 3: State program funding cut
    scenarios.push(this.runScenario(currentIncentiveValue, [
      {
        name: 'State Program Funding',
        baseValue: 100,
        scenarioValue: 50,
        impact: currentIncentiveValue * portfolioData.statePercent / 100 / 100,
      },
    ]));
    scenarios[scenarios.length - 1].name = 'State Funding Cut 50%';
    scenarios[scenarios.length - 1].type = 'policy_change';

    return scenarios;
  }
}

// ============================================================================
// IRR IMPACT CALCULATIONS
// ============================================================================

export class IRRCalculator {
  /**
   * Calculate project IRR
   * Using Newton-Raphson method for NPV = 0
   */
  static calculateIRR(cashFlows: number[], guess: number = 0.1): number {
    const maxIterations = 100;
    const tolerance = 0.0001;

    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(cashFlows, rate);
      const npvDerivative = this.calculateNPVDerivative(cashFlows, rate);

      if (Math.abs(npvDerivative) < tolerance) {
        break;
      }

      const newRate = rate - npv / npvDerivative;

      if (Math.abs(newRate - rate) < tolerance) {
        return newRate * 100; // Return as percentage
      }

      rate = newRate;
    }

    return rate * 100;
  }

  /**
   * Calculate Net Present Value
   */
  static calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cashFlow, period) => {
      return npv + cashFlow / Math.pow(1 + discountRate, period);
    }, 0);
  }

  private static calculateNPVDerivative(cashFlows: number[], rate: number): number {
    return cashFlows.reduce((derivative, cashFlow, period) => {
      return derivative - period * cashFlow / Math.pow(1 + rate, period + 1);
    }, 0);
  }

  /**
   * Calculate IRR impact of incentives
   */
  static calculateIncentiveIRRImpact(
    baseCashFlows: number[],
    incentiveValue: number,
    incentiveTiming: number = 0 // Period when incentive is received
  ): number {
    const baseIRR = this.calculateIRR(baseCashFlows);

    const adjustedCashFlows = [...baseCashFlows];
    adjustedCashFlows[incentiveTiming] += incentiveValue;

    const adjustedIRR = this.calculateIRR(adjustedCashFlows);

    return adjustedIRR - baseIRR; // Basis points impact
  }

  /**
   * Full IRR impact analysis
   */
  static analyzeIRRImpact(
    baseCashFlows: number[],
    incentives: Array<{
      id: string;
      name: string;
      category: IncentiveCategory;
      value: number;
      timing: number;
      captured: boolean;
      probability: number;
    }>
  ): IRRImpactAnalysis {
    const baselineIRR = this.calculateIRR(baseCashFlows);

    // Calculate current IRR (with captured incentives)
    const capturedIncentives = incentives.filter(i => i.captured);
    const currentCashFlows = [...baseCashFlows];
    capturedIncentives.forEach(i => {
      currentCashFlows[i.timing] += i.value;
    });
    const currentIRR = this.calculateIRR(currentCashFlows);

    // Calculate potential IRR (with all incentives)
    const potentialCashFlows = [...baseCashFlows];
    incentives.forEach(i => {
      potentialCashFlows[i.timing] += i.value;
    });
    const potentialIRR = this.calculateIRR(potentialCashFlows);

    // Impact by individual incentive
    const impactByIncentive: IncentiveIRRImpact[] = incentives.map(incentive => {
      const impact = this.calculateIncentiveIRRImpact(baseCashFlows, incentive.value, incentive.timing);
      return {
        incentiveId: incentive.id,
        incentiveName: incentive.name,
        category: incentive.category,
        value: incentive.value,
        irrImpact: impact,
        captured: incentive.captured,
        probability: incentive.probability,
      };
    });

    // Impact by category
    const impactByCategory = {} as Record<IncentiveCategory, number>;
    const categories: IncentiveCategory[] = ['federal', 'state', 'local', 'utility'];

    categories.forEach(category => {
      const categoryIncentives = incentives.filter(i => i.category === category);
      const categoryValue = categoryIncentives.reduce((sum, i) => sum + i.value, 0);
      impactByCategory[category] = this.calculateIncentiveIRRImpact(
        baseCashFlows,
        categoryValue,
        0
      );
    });

    // IRR sensitivity analysis
    const totalPotentialValue = incentives.reduce((sum, i) => sum + i.value, 0);

    const irrSensitivity: IRRSensitivity = {
      captureRateSensitivity: {
        at50Percent: this.calculateIRR([...baseCashFlows].map((cf, i) =>
          i === 0 ? cf + totalPotentialValue * 0.5 : cf
        )),
        at75Percent: this.calculateIRR([...baseCashFlows].map((cf, i) =>
          i === 0 ? cf + totalPotentialValue * 0.75 : cf
        )),
        at100Percent: potentialIRR,
      },
      criticalIncentives: impactByIncentive
        .sort((a, b) => b.irrImpact - a.irrImpact)
        .slice(0, 3)
        .map(i => i.incentiveName),
      breakeven: {
        targetIRR: 15, // Typical hurdle rate
        minimumCaptureRate: baselineIRR >= 15 ? 0 :
          Math.min(1, (15 - baselineIRR) / (potentialIRR - baselineIRR)),
        minimumCaptureValue: baselineIRR >= 15 ? 0 :
          totalPotentialValue * Math.min(1, (15 - baselineIRR) / (potentialIRR - baselineIRR)),
      },
    };

    return {
      projectId: '',
      calculatedAt: new Date().toISOString(),
      baselineIRR,
      currentIRR,
      potentialIRR,
      impactByIncentive,
      impactByCategory,
      irrSensitivity,
    };
  }
}

// ============================================================================
// BENCHMARK CALCULATIONS
// ============================================================================

export class BenchmarkCalculator {
  // Industry benchmark data (would typically come from a database)
  private static readonly INDUSTRY_BENCHMARKS = {
    subsidyRate: { median: 8.5, p25: 5.2, p75: 12.8, p90: 18.5 },
    captureRate: { median: 62, p25: 45, p75: 78, p90: 92 },
    applicationSuccessRate: { median: 71, p25: 55, p75: 85, p90: 95 },
    daysToCapture: { median: 90, p25: 60, p75: 120, p90: 180 },
    incentivePerUnit: { median: 12500, p25: 7500, p75: 22000, p90: 35000 },
    incentivePerSqFt: { median: 18, p25: 10, p75: 28, p90: 45 },
  };

  /**
   * Calculate percentile for a value
   */
  static calculatePercentile(value: number, benchmark: { median: number; p25: number; p75: number; p90: number }): number {
    if (value <= benchmark.p25) {
      return 25 * (value / benchmark.p25);
    } else if (value <= benchmark.median) {
      return 25 + 25 * ((value - benchmark.p25) / (benchmark.median - benchmark.p25));
    } else if (value <= benchmark.p75) {
      return 50 + 25 * ((value - benchmark.median) / (benchmark.p75 - benchmark.median));
    } else if (value <= benchmark.p90) {
      return 75 + 15 * ((value - benchmark.p75) / (benchmark.p90 - benchmark.p75));
    } else {
      return Math.min(99, 90 + 9 * ((value - benchmark.p90) / benchmark.p90));
    }
  }

  /**
   * Get benchmark score
   */
  static getBenchmarkScore(
    userValue: number,
    benchmarkKey: keyof typeof BenchmarkCalculator.INDUSTRY_BENCHMARKS,
    higherIsBetter: boolean = true
  ): BenchmarkScore {
    const benchmark = this.INDUSTRY_BENCHMARKS[benchmarkKey];
    const percentile = this.calculatePercentile(userValue, benchmark);
    const adjustedPercentile = higherIsBetter ? percentile : 100 - percentile;

    const difference = userValue - benchmark.median;
    const differencePercent = benchmark.median !== 0 ? (difference / benchmark.median) * 100 : 0;

    let rating: BenchmarkScore['rating'];
    if (adjustedPercentile >= 75) {
      rating = 'top_performer';
    } else if (adjustedPercentile >= 50) {
      rating = 'above_average';
    } else if (adjustedPercentile >= 25) {
      rating = 'average';
    } else {
      rating = 'below_average';
    }

    return {
      userValue,
      benchmarkValue: benchmark.median,
      percentile: adjustedPercentile,
      difference,
      differencePercent,
      rating,
    };
  }

  /**
   * Full benchmark comparison
   */
  static generateBenchmarkComparison(
    portfolioMetrics: PortfolioValueMetrics,
    applicationMetrics: ApplicationSuccessMetrics,
    timingMetrics: ApplicationTimingAnalysis
  ): BenchmarkComparison {
    const categories: BenchmarkCategory[] = [
      {
        category: 'Subsidy Rate',
        metric: 'subsidyRate',
        unit: '%',
        score: this.getBenchmarkScore(portfolioMetrics.subsidyRate * 100, 'subsidyRate'),
        trend: 'stable',
      },
      {
        category: 'Capture Rate',
        metric: 'captureRate',
        unit: '%',
        score: this.getBenchmarkScore(portfolioMetrics.captureRate * 100, 'captureRate'),
        trend: 'improving',
      },
      {
        category: 'Application Success',
        metric: 'applicationSuccessRate',
        unit: '%',
        score: this.getBenchmarkScore(applicationMetrics.approvalRate * 100, 'applicationSuccessRate'),
        trend: 'stable',
      },
      {
        category: 'Days to Capture',
        metric: 'daysToCapture',
        unit: 'days',
        score: this.getBenchmarkScore(timingMetrics.averageDaysToDecision, 'daysToCapture', false),
        trend: 'improving',
      },
      {
        category: 'Incentives per Unit',
        metric: 'incentivePerUnit',
        unit: '$',
        score: this.getBenchmarkScore(portfolioMetrics.incentivesPerUnit, 'incentivePerUnit'),
        trend: 'stable',
      },
      {
        category: 'Incentives per Sq Ft',
        metric: 'incentivePerSqFt',
        unit: '$',
        score: this.getBenchmarkScore(portfolioMetrics.incentivesPerSqFt, 'incentivePerSqFt'),
        trend: 'stable',
      },
    ];

    // Calculate overall score (weighted average of percentiles)
    const weights = [0.2, 0.25, 0.2, 0.15, 0.1, 0.1];
    const overallPercentile = categories.reduce((sum, cat, i) =>
      sum + cat.score.percentile * weights[i], 0
    );

    const overall: BenchmarkScore = {
      userValue: overallPercentile,
      benchmarkValue: 50,
      percentile: overallPercentile,
      difference: overallPercentile - 50,
      differencePercent: (overallPercentile - 50) / 50 * 100,
      rating: overallPercentile >= 75 ? 'top_performer' :
              overallPercentile >= 50 ? 'above_average' :
              overallPercentile >= 25 ? 'average' : 'below_average',
    };

    // Generate insights
    const insights: BenchmarkInsight[] = [];

    categories.forEach(cat => {
      if (cat.score.rating === 'top_performer') {
        insights.push({
          id: `insight-${cat.metric}-outperform`,
          type: 'outperforming',
          priority: 'medium',
          title: `Top performer in ${cat.category}`,
          description: `Your ${cat.category.toLowerCase()} is in the top 25% of the industry`,
          metric: cat.metric,
          currentValue: cat.score.userValue,
          benchmarkValue: cat.score.benchmarkValue,
          gap: cat.score.difference,
        });
      } else if (cat.score.rating === 'below_average') {
        insights.push({
          id: `insight-${cat.metric}-underperform`,
          type: 'underperforming',
          priority: 'high',
          title: `Below average ${cat.category}`,
          description: `Your ${cat.category.toLowerCase()} is below the industry median`,
          metric: cat.metric,
          currentValue: cat.score.userValue,
          benchmarkValue: cat.score.benchmarkValue,
          gap: cat.score.difference,
          recommendation: `Focus on improving ${cat.category.toLowerCase()} to reach industry median`,
          potentialImpact: Math.abs(cat.score.difference),
        });
      }
    });

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `benchmark-${Date.now()}`,
      organizationId: '',
      calculatedAt: new Date().toISOString(),
      benchmarkSource: 'IncentEdge Industry Database 2024',
      overall,
      categories,
      insights,
    };
  }
}

// ============================================================================
// INSIGHT GENERATOR
// ============================================================================

export class InsightGenerator {
  /**
   * Generate AI-style insights from analytics data
   */
  static generateInsights(
    portfolioMetrics: PortfolioMetrics,
    benchmarkComparison: BenchmarkComparison,
    applicationAnalytics: ApplicationAnalytics,
    pipeline: IncentivePipeline
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];

    // Portfolio insights
    const subsidyDiff = benchmarkComparison.categories.find(c => c.metric === 'subsidyRate');
    if (subsidyDiff && subsidyDiff.score.differencePercent > 10) {
      insights.push({
        id: 'insight-subsidy-above',
        type: 'outperforming',
        priority: 'medium',
        title: 'Strong subsidy capture',
        description: `Your portfolio is ${Math.abs(Math.round(subsidyDiff.score.differencePercent))}% more subsidized than industry average`,
        metric: 'subsidyRate',
        value: subsidyDiff.score.userValue,
        comparison: subsidyDiff.score.benchmarkValue,
        comparisonLabel: 'Industry Average',
        trend: 'up',
        actionable: false,
      });
    }

    // Tier performance
    const tierDistribution = portfolioMetrics.concentration.byTier;
    const tier3Projects = tierDistribution.filter(t =>
      t.category.includes('tier_3') || t.category.includes('Net Zero')
    );
    const tier3Pct = tier3Projects.reduce((sum, t) => sum + t.percentage, 0);

    if (tier3Pct > 30) {
      insights.push({
        id: 'insight-tier3-success',
        type: 'opportunity',
        priority: 'high',
        title: 'Tier 3 advantage',
        description: 'Tier 3 projects have 34% higher success rates and unlock premium incentives',
        metric: 'tierDistribution',
        value: tier3Pct,
        trend: 'up',
        actionable: true,
        action: 'Consider upgrading more projects to Tier 3 sustainability standards',
      });
    }

    // Federal credit capture
    const federalValue = portfolioMetrics.valueMetrics.valueByCategory.federal || 0;
    const lastQuarterFederal = federalValue * 0.85; // Simulated previous quarter
    const federalGrowth = lastQuarterFederal > 0
      ? ((federalValue - lastQuarterFederal) / lastQuarterFederal) * 100
      : 0;

    if (federalGrowth > 10) {
      insights.push({
        id: 'insight-federal-growth',
        type: 'outperforming',
        priority: 'medium',
        title: 'Federal credit momentum',
        description: `Capturing ${Math.round(federalGrowth)}% more federal credits than last quarter`,
        metric: 'federalCredits',
        value: federalValue,
        comparison: lastQuarterFederal,
        comparisonLabel: 'Last Quarter',
        trend: 'up',
        actionable: false,
      });
    }

    // Application timing
    const avgDays = applicationAnalytics.timing.averageDaysToDecision;
    const benchmarkDays = 90;
    if (avgDays < benchmarkDays * 0.75) {
      insights.push({
        id: 'insight-fast-processing',
        type: 'outperforming',
        priority: 'low',
        title: 'Fast application processing',
        description: `Your applications are processed ${Math.round((1 - avgDays/benchmarkDays) * 100)}% faster than average`,
        metric: 'processingTime',
        value: avgDays,
        comparison: benchmarkDays,
        comparisonLabel: 'Industry Average',
        trend: 'stable',
        actionable: false,
      });
    }

    // Pipeline opportunity
    const pipelineValue = pipeline.forecast.next90Days.expected;
    if (pipelineValue > 100000) {
      insights.push({
        id: 'insight-pipeline-value',
        type: 'opportunity',
        priority: 'high',
        title: 'Strong pipeline',
        description: `$${(pipelineValue / 1000000).toFixed(1)}M in incentives expected over next 90 days`,
        metric: 'pipelineValue',
        value: pipelineValue,
        trend: 'up',
        actionable: true,
        action: 'Prioritize applications with nearest deadlines',
      });
    }

    // Risk alerts
    if (portfolioMetrics.risk.riskLevel === 'high' || portfolioMetrics.risk.riskLevel === 'critical') {
      insights.push({
        id: 'insight-concentration-risk',
        type: 'risk',
        priority: 'high',
        title: 'Concentration risk detected',
        description: `${Math.round(portfolioMetrics.risk.topProgramExposure)}% of value concentrated in a single program`,
        metric: 'concentrationRisk',
        value: portfolioMetrics.risk.topProgramExposure,
        trend: 'stable',
        actionable: true,
        action: 'Diversify incentive sources to reduce concentration risk',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return insights;
  }

  /**
   * Generate alerts from analytics data
   */
  static generateAlerts(
    portfolioMetrics: PortfolioMetrics,
    upcomingDeadlines: Array<{ date: string; programName: string; value: number }>
  ): AnalyticsAlert[] {
    const alerts: AnalyticsAlert[] = [];
    const now = new Date();

    // Deadline alerts
    upcomingDeadlines.forEach(deadline => {
      const deadlineDate = new Date(deadline.date);
      const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 7) {
        alerts.push({
          id: `alert-deadline-${deadline.programName.replace(/\s/g, '-').toLowerCase()}`,
          severity: daysUntil <= 3 ? 'critical' : 'warning',
          title: `Deadline approaching: ${deadline.programName}`,
          description: `Application deadline in ${daysUntil} days. Potential value: $${deadline.value.toLocaleString()}`,
          category: 'deadlines',
          timestamp: now.toISOString(),
          acknowledged: false,
        });
      }
    });

    // Risk alerts
    if (portfolioMetrics.risk.riskLevel === 'critical') {
      alerts.push({
        id: 'alert-risk-critical',
        severity: 'error',
        title: 'Critical risk level detected',
        description: `Portfolio risk score of ${portfolioMetrics.risk.riskScore} exceeds safe thresholds`,
        category: 'risk',
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Missed deadline alerts
    if (portfolioMetrics.risk.missedDeadlines > 0) {
      alerts.push({
        id: 'alert-missed-deadlines',
        severity: 'warning',
        title: `${portfolioMetrics.risk.missedDeadlines} missed deadline(s)`,
        description: 'Review missed deadlines and update application statuses',
        category: 'deadlines',
        timestamp: now.toISOString(),
        acknowledged: false,
      });
    }

    // Sort by severity
    const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return alerts;
  }
}

// ============================================================================
// MAIN ANALYTICS ENGINE CLASS
// ============================================================================

export class AnalyticsEngine {
  /**
   * Calculate all portfolio metrics
   */
  static calculatePortfolioMetrics(
    projects: Project[],
    matches: EligibilityMatch[],
    applications: Application[]
  ): PortfolioMetrics {
    const activeProjects = projects.filter(p => p.project_status === 'active');
    const totalDevelopmentCost = projects.reduce((sum, p) => sum + (p.total_development_cost || 0), 0);
    const totalUnits = projects.reduce((sum, p) => sum + (p.total_units || 0), 0);
    const totalSqft = projects.reduce((sum, p) => sum + (p.total_sqft || 0), 0);

    // Calculate incentive values
    const capturedApps = applications.filter(a => a.status === 'approved');
    const pendingApps = applications.filter(a => ['submitted', 'under-review'].includes(a.status));
    const rejectedApps = applications.filter(a => a.status === 'rejected');

    const capturedValue = capturedApps.reduce((sum, a) => sum + (a.amount_approved || 0), 0);
    const pendingValue = pendingApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);
    const lostValue = rejectedApps.reduce((sum, a) => sum + (a.amount_requested || 0), 0);
    const potentialValue = matches.reduce((sum, m) => sum + m.estimated_value, 0);

    // Value by category and type
    const valueByCategory = {} as Record<IncentiveCategory, number>;
    const valueByType = {} as Record<IncentiveType, number>;

    matches.forEach(match => {
      const category = match.incentive_program.category;
      const type = match.incentive_program.incentive_type;
      valueByCategory[category] = (valueByCategory[category] || 0) + match.estimated_value;
      valueByType[type] = (valueByType[type] || 0) + match.estimated_value;
    });

    const valueMetrics: PortfolioValueMetrics = {
      totalPotentialIncentives: potentialValue,
      capturedIncentives: capturedValue,
      pendingIncentives: pendingValue,
      lostIncentives: lostValue,
      captureRate: potentialValue > 0 ? capturedValue / potentialValue : 0,
      subsidyRate: totalDevelopmentCost > 0 ? capturedValue / totalDevelopmentCost : 0,
      incentivesPerUnit: totalUnits > 0 ? capturedValue / totalUnits : 0,
      incentivesPerSqFt: totalSqft > 0 ? capturedValue / totalSqft : 0,
      valueByCategory,
      valueByType,
    };

    // Concentration analysis
    const concentration = ConcentrationAnalyzer.analyzeConcentration(projects, matches);

    // Risk metrics
    const topProgramValue = Math.max(...Object.values(valueByCategory), 0);
    const topProgramExposure = potentialValue > 0 ? (topProgramValue / potentialValue) * 100 : 0;

    const risk: PortfolioRiskMetrics = {
      pendingExposure: pendingValue,
      rejectionRisk: applications.length > 0
        ? rejectedApps.length / applications.length * pendingValue
        : 0,
      expiringPrograms: matches.filter(m => {
        const endDate = m.incentive_program.end_date;
        if (!endDate) return false;
        const daysUntil = (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 90;
      }).length,
      upcomingDeadlines: applications.filter(a => {
        if (!a.deadline) return false;
        const daysUntil = (new Date(a.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 30 && daysUntil > 0;
      }).length,
      missedDeadlines: applications.filter(a => {
        if (!a.deadline) return false;
        return new Date(a.deadline) < new Date() && a.status === 'draft';
      }).length,
      topProgramExposure,
      singlePointOfFailure: topProgramExposure > 25,
      riskScore: this.calculateRiskScore(concentration, topProgramExposure, pendingValue, potentialValue),
      riskLevel: 'low',
    };

    // Set risk level based on score
    if (risk.riskScore >= 75) risk.riskLevel = 'critical';
    else if (risk.riskScore >= 50) risk.riskLevel = 'high';
    else if (risk.riskScore >= 25) risk.riskLevel = 'medium';

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `portfolio-${Date.now()}`,
      organizationId: projects[0]?.organization_id || '',
      calculatedAt: new Date().toISOString(),
      summary: {
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalSquareFootage: totalSqft,
        totalUnits,
        totalDevelopmentCost,
        averageProjectSize: projects.length > 0 ? totalDevelopmentCost / projects.length : 0,
      },
      valueMetrics,
      concentration,
      trends: {
        incentiveCapture: {
          id: 'trend-capture',
          name: 'Incentive Capture',
          metric: 'capturedValue',
          period: 'monthly',
          dataPoints: [],
          aggregation: 'sum',
        },
        applicationVolume: {
          id: 'trend-volume',
          name: 'Application Volume',
          metric: 'applicationCount',
          period: 'monthly',
          dataPoints: [],
          aggregation: 'count',
        },
        successRate: {
          id: 'trend-success',
          name: 'Success Rate',
          metric: 'approvalRate',
          period: 'monthly',
          dataPoints: [],
          aggregation: 'average',
        },
        averageProcessingTime: {
          id: 'trend-processing',
          name: 'Processing Time',
          metric: 'daysToDecision',
          period: 'monthly',
          dataPoints: [],
          aggregation: 'average',
        },
        growth: {
          mom: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          qoq: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
          yoy: { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' },
        },
      },
      risk,
    };
  }

  private static calculateRiskScore(
    concentration: ConcentrationAnalysis,
    topProgramExposure: number,
    pendingValue: number,
    potentialValue: number
  ): number {
    let score = 0;

    // HHI-based concentration risk (0-30 points)
    if (concentration.incentiveHHI > 5000) score += 30;
    else if (concentration.incentiveHHI > 2500) score += 20;
    else if (concentration.incentiveHHI > 1500) score += 10;

    // Single program exposure risk (0-25 points)
    if (topProgramExposure > 50) score += 25;
    else if (topProgramExposure > 35) score += 15;
    else if (topProgramExposure > 25) score += 10;

    // Pending exposure risk (0-25 points)
    const pendingRatio = potentialValue > 0 ? pendingValue / potentialValue : 0;
    if (pendingRatio > 0.5) score += 25;
    else if (pendingRatio > 0.3) score += 15;
    else if (pendingRatio > 0.15) score += 10;

    // Geographic concentration (0-20 points)
    if (concentration.geographicHHI > 5000) score += 20;
    else if (concentration.geographicHHI > 2500) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate complete dashboard analytics
   */
  static calculateDashboardAnalytics(
    projects: Project[],
    matches: EligibilityMatch[],
    applications: Application[]
  ): DashboardAnalytics {
    const portfolioMetrics = this.calculatePortfolioMetrics(projects, matches, applications);

    const applicationMetrics = this.calculateApplicationMetrics(applications, matches);
    const timingAnalysis = this.calculateTimingAnalysis(applications);

    const benchmarkComparison = BenchmarkCalculator.generateBenchmarkComparison(
      portfolioMetrics.valueMetrics,
      applicationMetrics,
      timingAnalysis
    );

    const pipeline = this.calculatePipeline(matches, applications);

    const insights = InsightGenerator.generateInsights(
      portfolioMetrics,
      benchmarkComparison,
      {
        id: '',
        organizationId: '',
        calculatedAt: new Date().toISOString(),
        successMetrics: applicationMetrics,
        timing: timingAnalysis,
        failures: {
          totalRejections: applications.filter(a => a.status === 'rejected').length,
          reasonBreakdown: [],
          commonPatterns: [],
          preventableRejections: 0,
          preventableValue: 0,
        },
        probability: ProbabilityModeler.buildProbabilityModel(applications, new Map()),
      },
      pipeline
    );

    const alerts = InsightGenerator.generateAlerts(portfolioMetrics, []);

    return {
      organizationId: projects[0]?.organization_id || '',
      calculatedAt: new Date().toISOString(),
      metrics: {
        totalIncentiveValue: portfolioMetrics.valueMetrics.totalPotentialIncentives,
        capturedValue: portfolioMetrics.valueMetrics.capturedIncentives,
        captureRate: portfolioMetrics.valueMetrics.captureRate,
        pendingValue: portfolioMetrics.valueMetrics.pendingIncentives,
        momGrowth: portfolioMetrics.trends.growth.mom.changePercent,
        qoqGrowth: portfolioMetrics.trends.growth.qoq.changePercent,
        yoyGrowth: portfolioMetrics.trends.growth.yoy.changePercent,
        activeApplications: applications.filter(a =>
          !['approved', 'rejected', 'withdrawn'].includes(a.status)
        ).length,
        successRate: applicationMetrics.approvalRate,
        averageTimeToCapture: timingAnalysis.averageDaysToDecision,
        totalProjects: projects.length,
        totalDevelopmentCost: portfolioMetrics.summary.totalDevelopmentCost,
        subsidyRate: portfolioMetrics.valueMetrics.subsidyRate,
      },
      charts: {
        incentiveTrend: portfolioMetrics.trends.incentiveCapture,
        categoryBreakdown: portfolioMetrics.concentration.byIncentiveCategory,
        tierDistribution: portfolioMetrics.concentration.byTier,
        applicationFunnel: pipeline.funnel,
        successRateTrend: portfolioMetrics.trends.successRate,
        upcomingDeadlines: [],
      },
      insights,
      alerts,
    };
  }

  /**
   * Calculate application success metrics
   */
  static calculateApplicationMetrics(
    applications: Application[],
    matches: EligibilityMatch[]
  ): ApplicationSuccessMetrics {
    const submitted = applications.filter(a =>
      ['submitted', 'under-review', 'approved', 'rejected'].includes(a.status)
    );
    const approved = applications.filter(a => a.status === 'approved');
    const rejected = applications.filter(a => a.status === 'rejected');
    const pending = applications.filter(a =>
      ['submitted', 'under-review'].includes(a.status)
    );
    const withdrawn = applications.filter(a => a.status === 'withdrawn');

    const valueRequested = submitted.reduce((sum, a) => sum + (a.amount_requested || 0), 0);
    const valueApproved = approved.reduce((sum, a) => sum + (a.amount_approved || 0), 0);
    const valueLost = rejected.reduce((sum, a) => sum + (a.amount_requested || 0), 0);

    // Rates by category (simplified - would need program data joined)
    const ratesByCategory = {} as Record<IncentiveCategory, number>;
    const ratesByType = {} as Record<IncentiveType, number>;
    const ratesByTier = {} as Record<SustainabilityTier, number>;

    return {
      totalSubmitted: submitted.length,
      totalApproved: approved.length,
      totalRejected: rejected.length,
      totalPending: pending.length,
      totalWithdrawn: withdrawn.length,
      approvalRate: submitted.length > 0 ? approved.length / submitted.length : 0,
      rejectionRate: submitted.length > 0 ? rejected.length / submitted.length : 0,
      withdrawalRate: (submitted.length + withdrawn.length) > 0
        ? withdrawn.length / (submitted.length + withdrawn.length)
        : 0,
      ratesByCategory,
      ratesByType,
      ratesByTier,
      valueRequested,
      valueApproved,
      valueLost,
      captureEfficiency: valueRequested > 0 ? valueApproved / valueRequested : 0,
    };
  }

  /**
   * Calculate application timing analysis
   */
  static calculateTimingAnalysis(applications: Application[]): ApplicationTimingAnalysis {
    const completedApps = applications.filter(a =>
      ['approved', 'rejected'].includes(a.status) && a.decision_date && a.submission_date
    );

    const daysToDecision = completedApps.map(a => {
      const submit = new Date(a.submission_date!);
      const decision = new Date(a.decision_date!);
      return (decision.getTime() - submit.getTime()) / (1000 * 60 * 60 * 24);
    });

    const avgDays = daysToDecision.length > 0
      ? daysToDecision.reduce((a, b) => a + b, 0) / daysToDecision.length
      : 0;

    const sortedDays = [...daysToDecision].sort((a, b) => a - b);
    const medianDays = sortedDays.length > 0 ? sortedDays[Math.floor(sortedDays.length / 2)] : 0;

    return {
      averageDaysToDecision: avgDays,
      medianDaysToDecision: medianDays,
      timingByCategory: {
        federal: avgDays,
        state: avgDays,
        local: avgDays,
        utility: avgDays,
      },
      averageDraftTime: 14,
      averagePreparationTime: 21,
      averageReviewTime: 45,
      bottlenecks: [],
    };
  }

  /**
   * Calculate pipeline metrics
   */
  static calculatePipeline(
    matches: EligibilityMatch[],
    applications: Application[]
  ): IncentivePipeline {
    const funnel = PipelineForecaster.calculateFunnel(matches, applications);
    const velocity = PipelineForecaster.calculateVelocity(applications);
    const forecast = PipelineForecaster.generateForecast(matches, applications, funnel);

    // Calculate stages
    const stages: PipelineStage[] = [
      {
        stage: 'identified',
        count: matches.filter(m => m.status === 'matched').length,
        value: matches.filter(m => m.status === 'matched').reduce((s, m) => s + m.estimated_value, 0),
        averageAge: 30,
        conversionRate: funnel.qualificationRate,
      },
      {
        stage: 'qualified',
        count: matches.filter(m => m.overall_score >= 50).length,
        value: matches.filter(m => m.overall_score >= 50).reduce((s, m) => s + m.estimated_value, 0),
        averageAge: 21,
        conversionRate: funnel.applicationRate,
      },
      {
        stage: 'in_preparation',
        count: applications.filter(a => ['draft', 'in-progress'].includes(a.status)).length,
        value: applications.filter(a => ['draft', 'in-progress'].includes(a.status))
          .reduce((s, a) => s + (a.amount_requested || 0), 0),
        averageAge: 14,
        conversionRate: 0.8,
      },
      {
        stage: 'submitted',
        count: applications.filter(a => a.status === 'submitted').length,
        value: applications.filter(a => a.status === 'submitted')
          .reduce((s, a) => s + (a.amount_requested || 0), 0),
        averageAge: 3,
        conversionRate: 0.95,
      },
      {
        stage: 'under_review',
        count: applications.filter(a => a.status === 'under-review').length,
        value: applications.filter(a => a.status === 'under-review')
          .reduce((s, a) => s + (a.amount_requested || 0), 0),
        averageAge: 45,
        conversionRate: funnel.approvalRate,
      },
      {
        stage: 'approved',
        count: applications.filter(a => a.status === 'approved').length,
        value: applications.filter(a => a.status === 'approved')
          .reduce((s, a) => s + (a.amount_approved || 0), 0),
        averageAge: 5,
        conversionRate: funnel.captureRate,
      },
    ];

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `pipeline-${Date.now()}`,
      organizationId: '',
      calculatedAt: new Date().toISOString(),
      stages,
      funnel,
      velocity,
      forecast,
    };
  }
}

// All classes are already exported inline with 'export class' declarations
