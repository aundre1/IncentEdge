// Analytics Types for IncentEdge

import { SustainabilityTier, IncentiveCategory, IncentiveType, SectorType } from './index';

// ============================================================================
// TIME SERIES DATA
// ============================================================================

export interface TimeSeriesDataPoint {
  date: string;           // ISO date string
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  id: string;
  name: string;
  metric: string;
  period: TimePeriod;
  dataPoints: TimeSeriesDataPoint[];
  aggregation: 'sum' | 'average' | 'count' | 'latest';
  metadata?: Record<string, unknown>;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TimeSeriesComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface GrowthMetrics {
  mom: TimeSeriesComparison;  // Month over Month
  qoq: TimeSeriesComparison;  // Quarter over Quarter
  yoy: TimeSeriesComparison;  // Year over Year
  cagr?: number;              // Compound Annual Growth Rate
}

export interface MovingAverageResult {
  simple: number[];           // Simple Moving Average
  weighted: number[];         // Weighted Moving Average
  exponential: number[];      // Exponential Moving Average
  period: number;
}

// ============================================================================
// PORTFOLIO METRICS
// ============================================================================

export interface PortfolioMetrics {
  id: string;
  organizationId: string;
  calculatedAt: string;

  // Portfolio Overview
  summary: PortfolioSummary;

  // Value Metrics
  valueMetrics: PortfolioValueMetrics;

  // Concentration Analysis
  concentration: ConcentrationAnalysis;

  // Performance Trends
  trends: PortfolioTrends;

  // Risk Metrics
  risk: PortfolioRiskMetrics;
}

export interface PortfolioSummary {
  totalProjects: number;
  activeProjects: number;
  totalSquareFootage: number;
  totalUnits: number;
  totalDevelopmentCost: number;
  averageProjectSize: number;
}

export interface PortfolioValueMetrics {
  // Incentive Values
  totalPotentialIncentives: number;
  capturedIncentives: number;
  pendingIncentives: number;
  lostIncentives: number;

  // Rates
  captureRate: number;          // captured / potential
  subsidyRate: number;          // captured / totalDevelopmentCost

  // Per-unit metrics
  incentivesPerUnit: number;
  incentivesPerSqFt: number;

  // Value by category
  valueByCategory: Record<IncentiveCategory, number>;
  valueByType: Record<IncentiveType, number>;
}

export interface ConcentrationAnalysis {
  // Geographic concentration
  byState: ConcentrationItem[];
  byCity: ConcentrationItem[];

  // Project type concentration
  bySector: ConcentrationItem[];
  byBuildingType: ConcentrationItem[];

  // Incentive concentration
  byIncentiveCategory: ConcentrationItem[];
  byIncentiveType: ConcentrationItem[];

  // Sustainability tier distribution
  byTier: ConcentrationItem[];

  // Risk scores
  geographicHHI: number;        // Herfindahl-Hirschman Index
  sectorHHI: number;
  incentiveHHI: number;
  diversificationScore: number; // 0-100, higher is more diversified
}

export interface ConcentrationItem {
  category: string;
  value: number;
  percentage: number;
  count: number;
}

export interface PortfolioTrends {
  incentiveCapture: TimeSeriesData;
  applicationVolume: TimeSeriesData;
  successRate: TimeSeriesData;
  averageProcessingTime: TimeSeriesData;

  // Growth metrics
  growth: GrowthMetrics;
}

export interface PortfolioRiskMetrics {
  // Application risk
  pendingExposure: number;        // Value at risk from pending applications
  rejectionRisk: number;          // Historical rejection rate applied to pending

  // Deadline risk
  expiringPrograms: number;       // Number of programs expiring soon
  upcomingDeadlines: number;      // Number of deadlines in next 30 days
  missedDeadlines: number;        // Count of missed deadlines

  // Concentration risk
  topProgramExposure: number;     // % of value in top program
  singlePointOfFailure: boolean;  // Any single program > 25% of value

  // Overall risk score
  riskScore: number;              // 0-100, higher is riskier
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// INCENTIVE PIPELINE
// ============================================================================

export interface IncentivePipeline {
  id: string;
  organizationId: string;
  calculatedAt: string;

  // Pipeline stages
  stages: PipelineStage[];

  // Conversion funnel
  funnel: PipelineFunnel;

  // Velocity metrics
  velocity: PipelineVelocity;

  // Forecasts
  forecast: PipelineForecast;
}

export interface PipelineStage {
  stage: PipelineStageType;
  count: number;
  value: number;
  averageAge: number;           // Days in stage
  conversionRate: number;       // Rate to next stage
}

export type PipelineStageType =
  | 'identified'
  | 'qualified'
  | 'in_preparation'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'captured';

export interface PipelineFunnel {
  totalIdentified: number;
  totalQualified: number;
  totalApplied: number;
  totalApproved: number;
  totalCaptured: number;

  // Conversion rates
  qualificationRate: number;
  applicationRate: number;
  approvalRate: number;
  captureRate: number;

  // Overall funnel efficiency
  overallConversion: number;
}

export interface PipelineVelocity {
  averageDaysToCapture: number;
  medianDaysToCapture: number;
  averageDaysByStage: Record<PipelineStageType, number>;

  // Velocity trends
  velocityTrend: 'accelerating' | 'stable' | 'slowing';
  velocityChange: number;
}

export interface PipelineForecast {
  // Expected captures
  next30Days: ForecastValue;
  next90Days: ForecastValue;
  next12Months: ForecastValue;

  // By category
  byCategory: Record<IncentiveCategory, ForecastValue>;

  // By tier
  byTier: Record<SustainabilityTier, ForecastValue>;

  // Confidence
  modelAccuracy: number;
  lastCalibrated: string;
}

export interface ForecastValue {
  expected: number;
  low: number;
  high: number;
  confidence: number;
}

// ============================================================================
// SENSITIVITY ANALYSIS
// ============================================================================

export interface SensitivityScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;

  // Input parameters
  parameters: ScenarioParameter[];

  // Results
  baselineValue: number;
  scenarioValue: number;
  delta: number;
  deltaPercent: number;

  // Impact analysis
  impacts: ScenarioImpact[];
}

export type ScenarioType =
  | 'policy_change'
  | 'rate_change'
  | 'deadline_change'
  | 'eligibility_change'
  | 'market_change'
  | 'custom';

export interface ScenarioParameter {
  name: string;
  baseValue: number | string | boolean;
  scenarioValue: number | string | boolean;
  unit?: string;
}

export interface ScenarioImpact {
  metric: string;
  baseline: number;
  projected: number;
  change: number;
  changePercent: number;
  severity: 'positive' | 'neutral' | 'negative';
}

export interface WhatIfAnalysis {
  scenarios: SensitivityScenario[];

  // Tornado chart data
  tornadoChart: TornadoChartData;

  // Breakeven analysis
  breakeven: BreakevenAnalysis;
}

export interface TornadoChartData {
  metric: string;
  baseline: number;
  factors: TornadoFactor[];
}

export interface TornadoFactor {
  name: string;
  lowValue: number;
  highValue: number;
  lowResult: number;
  highResult: number;
  sensitivity: number;
}

export interface BreakevenAnalysis {
  metric: string;
  currentValue: number;
  breakevenPoint: number;
  buffer: number;
  bufferPercent: number;
}

// ============================================================================
// BENCHMARK COMPARISON
// ============================================================================

export interface BenchmarkComparison {
  id: string;
  organizationId: string;
  calculatedAt: string;
  benchmarkSource: string;

  // Overall comparison
  overall: BenchmarkScore;

  // Category comparisons
  categories: BenchmarkCategory[];

  // Peer comparison (if available)
  peerComparison?: PeerComparison;

  // Recommendations
  insights: BenchmarkInsight[];
}

export interface BenchmarkScore {
  userValue: number;
  benchmarkValue: number;
  percentile: number;
  difference: number;
  differencePercent: number;
  rating: 'below_average' | 'average' | 'above_average' | 'top_performer';
}

export interface BenchmarkCategory {
  category: string;
  metric: string;
  unit: string;
  score: BenchmarkScore;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PeerComparison {
  peerGroupSize: number;
  peerGroupCriteria: string;
  rank: number;
  percentile: number;
  topPerformerGap: number;
  medianGap: number;
}

export interface BenchmarkInsight {
  id: string;
  type: InsightType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  benchmarkValue: number;
  gap: number;
  recommendation?: string;
  potentialImpact?: number;
}

export type InsightType =
  | 'outperforming'
  | 'underperforming'
  | 'opportunity'
  | 'risk'
  | 'trend';

// ============================================================================
// APPLICATION ANALYTICS
// ============================================================================

export interface ApplicationAnalytics {
  id: string;
  organizationId: string;
  calculatedAt: string;

  // Success metrics
  successMetrics: ApplicationSuccessMetrics;

  // Timing analysis
  timing: ApplicationTimingAnalysis;

  // Failure analysis
  failures: ApplicationFailureAnalysis;

  // Probability modeling
  probability: SuccessProbabilityModel;
}

export interface ApplicationSuccessMetrics {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalWithdrawn: number;

  // Rates
  approvalRate: number;
  rejectionRate: number;
  withdrawalRate: number;

  // By category
  ratesByCategory: Record<IncentiveCategory, number>;
  ratesByType: Record<IncentiveType, number>;
  ratesByTier: Record<SustainabilityTier, number>;

  // Value metrics
  valueRequested: number;
  valueApproved: number;
  valueLost: number;
  captureEfficiency: number;  // valueApproved / valueRequested
}

export interface ApplicationTimingAnalysis {
  averageDaysToDecision: number;
  medianDaysToDecision: number;

  // By category
  timingByCategory: Record<IncentiveCategory, number>;

  // Cycle time breakdown
  averageDraftTime: number;
  averagePreparationTime: number;
  averageReviewTime: number;

  // Bottleneck identification
  bottlenecks: TimingBottleneck[];
}

export interface TimingBottleneck {
  stage: string;
  averageDays: number;
  benchmarkDays: number;
  delayDays: number;
  affectedApplications: number;
  recommendation: string;
}

export interface ApplicationFailureAnalysis {
  totalRejections: number;

  // Rejection reasons
  reasonBreakdown: FailureReason[];

  // Patterns
  commonPatterns: FailurePattern[];

  // Prevention metrics
  preventableRejections: number;
  preventableValue: number;
}

export interface FailureReason {
  reason: string;
  count: number;
  percentage: number;
  totalValueLost: number;
}

export interface FailurePattern {
  pattern: string;
  frequency: number;
  impact: number;
  suggestion: string;
}

export interface SuccessProbabilityModel {
  // Model metadata
  modelVersion: string;
  lastTrained: string;
  accuracy: number;

  // Feature importance
  topFactors: ProbabilityFactor[];

  // Prediction thresholds
  thresholds: {
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
  };
}

export interface ProbabilityFactor {
  factor: string;
  importance: number;
  direction: 'positive' | 'negative';
  description: string;
}

// ============================================================================
// IRR IMPACT CALCULATIONS
// ============================================================================

export interface IRRImpactAnalysis {
  projectId: string;
  calculatedAt: string;

  // Baseline IRR (without incentives)
  baselineIRR: number;

  // IRR with all captured incentives
  currentIRR: number;

  // IRR with all potential incentives
  potentialIRR: number;

  // Impact breakdown
  impactByIncentive: IncentiveIRRImpact[];
  impactByCategory: Record<IncentiveCategory, number>;

  // Sensitivity
  irrSensitivity: IRRSensitivity;
}

export interface IncentiveIRRImpact {
  incentiveId: string;
  incentiveName: string;
  category: IncentiveCategory;
  value: number;
  irrImpact: number;           // Basis points of IRR improvement
  captured: boolean;
  probability: number;
}

export interface IRRSensitivity {
  // How IRR changes with incentive capture rate
  captureRateSensitivity: {
    at50Percent: number;
    at75Percent: number;
    at100Percent: number;
  };

  // Critical incentives (largest IRR impact)
  criticalIncentives: string[];

  // Minimum capture needed for target IRR
  breakeven: {
    targetIRR: number;
    minimumCaptureRate: number;
    minimumCaptureValue: number;
  };
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export interface DashboardAnalytics {
  organizationId: string;
  calculatedAt: string;

  // Key metrics
  metrics: DashboardMetrics;

  // Charts data
  charts: DashboardCharts;

  // AI-generated insights
  insights: AnalyticsInsight[];

  // Alerts
  alerts: AnalyticsAlert[];
}

export interface DashboardMetrics {
  totalIncentiveValue: number;
  capturedValue: number;
  captureRate: number;
  pendingValue: number;

  // Growth
  momGrowth: number;
  qoqGrowth: number;
  yoyGrowth: number;

  // Applications
  activeApplications: number;
  successRate: number;
  averageTimeToCapture: number;

  // Portfolio
  totalProjects: number;
  totalDevelopmentCost: number;
  subsidyRate: number;
}

export interface DashboardCharts {
  incentiveTrend: TimeSeriesData;
  categoryBreakdown: ConcentrationItem[];
  tierDistribution: ConcentrationItem[];
  applicationFunnel: PipelineFunnel;
  successRateTrend: TimeSeriesData;
  upcomingDeadlines: DeadlineChartItem[];
}

export interface DeadlineChartItem {
  date: string;
  count: number;
  totalValue: number;
  programs: string[];
}

export interface AnalyticsInsight {
  id: string;
  type: InsightType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  comparison?: number;
  comparisonLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  actionable: boolean;
  action?: string;
}

export interface AnalyticsAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  category: string;
  timestamp: string;
  acknowledged: boolean;
  relatedEntity?: {
    type: 'project' | 'application' | 'program';
    id: string;
    name: string;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface AnalyticsRequest {
  organizationId: string;
  dateRange?: DateRange;
  filters?: AnalyticsFilters;
  groupBy?: string[];
  metrics?: string[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsFilters {
  projectIds?: string[];
  states?: string[];
  sectors?: SectorType[];
  categories?: IncentiveCategory[];
  types?: IncentiveType[];
  tiers?: SustainabilityTier[];
  statuses?: string[];
}

export interface AnalyticsResponse<T> {
  data: T;
  meta: {
    calculatedAt: string;
    cached: boolean;
    cacheExpiry?: string;
    dataFreshness: string;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface AnalyticsExport {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  data: unknown;
  filename: string;
  generatedAt: string;
  parameters: AnalyticsRequest;
}
