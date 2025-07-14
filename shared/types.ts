// Additional types for the application that are not directly tied to the database schema

// Incentives summary data for charts and statistics
export interface IncentivesSummary {
  totalPrograms: number;
  totalFunding: string;
  avgIncentive: string;
  expiringCount: number;
  programDistribution: {
    federal: number;
    state: number;
    local: number;
    utility: number;
    foundation: number;
  };
  technologyDistribution: {
    efficiency: number;
    renewable: number;
    hvac: number;
    storage: number;
    ev: number;
    research: number;
  };
}

// For calculator results
export interface CalculatorResult {
  totalIncentive: number;
  breakdownByProgram: Record<string, number>;
}

// Filter options for incentives
export interface IncentiveFilters {
  level?: string;
  projectTypes?: string[];
  technology?: string;
  status?: string;
  amount?: number;
  searchTerm?: string;
}

export interface ScraperJobSummary {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  lastRunTime?: string;
  nextScheduledRun?: string;
  recentJobs: Array<{
    id: number;
    source: string;
    status: string;
    startedAt: string;
    recordsImported: number;
  }>;
}

export interface ScraperJob {
  id: number;
  status: string;
  source: string;
  startedAt: string;
  recordsImported: number;
  endedAt?: string;
  error?: string;
}

export interface ScrapedIncentive {
  id: number;
  jobId: number;
  url: string;
  extractedData: any;
  processed: boolean;
  createdAt: string;
  incentiveId?: number;
}

export interface ScrapingRequest {
  sources: string[];
  immediate?: boolean;
  config?: Record<string, any>;
}

export interface DataSourceConfig {
  name: string;
  type: string;
  baseUrl: string;
  selectors?: Record<string, string>;
  headers?: Record<string, string>;
  rateLimit?: number;
  timeout?: number;
}

// Re-export the database types for convenience
export type { 
  User, 
  InsertUser,
  Incentive, 
  InsertIncentive,
  Lead, 
  InsertLead,
  CalculatorSubmission,
  InsertCalculatorSubmission
} from './schema';
