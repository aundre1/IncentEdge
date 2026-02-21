/**
 * Test Helper Utilities
 */

import type { Project, IncentiveProgram, IncentiveCategory } from '@/types';

/**
 * Create a mock project for testing
 */
export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'test-project-1',
    name: 'Test Multifamily Project',
    organization_id: 'test-org-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',

    // Location
    address_line1: '123 Main St',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '11201',
    county: 'Kings',

    // Project details
    building_type: 'multifamily',
    sector_type: 'affordable-housing',
    construction_type: 'new-construction',

    // Size
    total_units: 100,
    affordable_units: 60,
    total_sqft: 75000,

    // Financial
    total_development_cost: 25000000,
    hard_costs: 20000000,
    soft_costs: 5000000,

    // Sustainability
    target_certification: 'LEED Gold',
    projected_energy_reduction_pct: 40,
    renewable_energy_types: ['solar'],

    // Timeline
    estimated_start_date: '2026-06-01',
    estimated_completion_date: '2028-06-01',

    // Affordability breakdown
    affordable_breakdown: {
      ami_30: 20,
      ami_50: 20,
      ami_60: 20,
      ami_80: 0,
    },

    ...overrides,
  };
}

/**
 * Create a mock incentive program for testing
 */
export function createMockIncentive(overrides: Partial<IncentiveProgram> = {}): IncentiveProgram {
  return {
    id: 'test-incentive-1',
    name: 'Test Federal ITC',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_credit',
    status: 'active',

    // Amounts
    amount_percentage: 0.30,
    amount_min: 100000,
    amount_max: 5000000,

    // Eligibility
    sector_types: ['clean-energy', 'real-estate'],
    building_types: ['multifamily', 'mixed-use'],
    technology_types: ['solar', 'battery'],

    // Geography
    state: null,
    counties: [],
    municipalities: [],

    // IRA bonuses
    domestic_content_bonus: 0.10,
    energy_community_bonus: 0.10,
    prevailing_wage_bonus: 0.10,

    // Dates
    start_date: '2022-08-16',
    end_date: '2032-12-31',
    application_deadline: null,

    // Metadata
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',

    ...overrides,
  };
}

/**
 * Create a mock LIHTC program
 */
export function createMockLIHTC(): IncentiveProgram {
  return createMockIncentive({
    id: 'lihtc-9',
    name: 'LIHTC 9% Competitive',
    category: 'federal',
    jurisdiction_level: 'federal',
    incentive_type: 'tax_credit',
    amount_percentage: 0.09,
    amount_per_unit: null,
    sector_types: ['affordable-housing'],
    building_types: ['multifamily'],
    technology_types: [],
  });
}

/**
 * Create a mock state-level program
 */
export function createMockStateIncentive(state: string = 'NY'): IncentiveProgram {
  return createMockIncentive({
    id: `state-${state.toLowerCase()}-1`,
    name: `${state} Clean Energy Grant`,
    category: 'state',
    jurisdiction_level: 'state',
    incentive_type: 'grant',
    state,
    amount_fixed: 500000,
    amount_percentage: null,
  });
}

/**
 * Create multiple mock incentives
 */
export function createMockIncentives(count: number): IncentiveProgram[] {
  return Array.from({ length: count }, (_, i) =>
    createMockIncentive({
      id: `test-incentive-${i + 1}`,
      name: `Test Incentive ${i + 1}`,
    })
  );
}

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock successful API response
 */
export function mockApiSuccess<T>(data: T) {
  return {
    ok: true,
    json: async () => data,
    status: 200,
    statusText: 'OK',
  } as Response;
}

/**
 * Mock failed API response
 */
export function mockApiError(status: number = 500, message: string = 'Internal Server Error') {
  return {
    ok: false,
    json: async () => ({ error: message }),
    status,
    statusText: message,
  } as Response;
}
