// Incentive Levels
export const INCENTIVE_LEVELS = [
  { value: 'all', label: 'All Levels' },
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'local', label: 'Local/NYC' },
  { value: 'utility', label: 'Utility' },
  { value: 'foundation', label: 'Foundation' }
];

// Project Types - Complete coverage for all 2,240 programs
export const PROJECT_TYPES = [
  { value: 'all', label: 'All Projects' },
  { value: 'energy efficiency', label: 'Energy Efficiency' },
  { value: 'renewable energy', label: 'Renewable Energy' },
  { value: 'energy storage', label: 'Energy Storage' },
  { value: 'solar', label: 'Solar Projects' },
  { value: 'wind', label: 'Wind Projects' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'transportation', label: 'Transportation/EV' },
  { value: 'climate', label: 'Climate & Resilience' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'rural', label: 'Rural Projects' },
  { value: 'advanced', label: 'Advanced Technologies' }
];

// Technology Types
export const TECHNOLOGY_TYPES = [
  { value: 'all', label: 'All Technologies' },
  { value: 'energy efficiency', label: 'Energy Efficiency' },
  { value: 'solar', label: 'Solar/Renewable' },
  { value: 'hvac', label: 'HVAC/Heat Pumps' },
  { value: 'energy storage', label: 'Energy Storage' },
  { value: 'electric vehicle', label: 'EV/Transportation' },
  { value: 'research', label: 'Research/Innovation' }
];

// Status Types - labels will be dynamically updated with real-time counts
export const STATUS_TYPES = [
  { value: 'all', label: 'All Statuses', baseLabel: 'All Statuses' },
  { value: 'ongoing_category', label: 'Ongoing Programs', baseLabel: 'Ongoing Programs' },
  { value: 'multiyear_category', label: 'Multi-year Programs', baseLabel: 'Multi-year Programs' },
  { value: 'annual_category', label: 'Annual Cycles', baseLabel: 'Annual Cycles' },
  { value: 'expiring_category', label: 'Expiring Soon', baseLabel: 'Expiring Soon' },
  { value: 'dated_category', label: 'Fixed Dates', baseLabel: 'Fixed Dates' }
];

// Amount Ranges
export const AMOUNT_RANGES = [
  { value: 'any', label: 'Any Amount' },
  { value: '10000', label: '$10,000+' },
  { value: '50000', label: '$50,000+' },
  { value: '100000', label: '$100,000+' },
  { value: '500000', label: '$500,000+' },
  { value: '1000000', label: '$1,000,000+' }
];

// Chart colors - Professional gradient scheme for IncentEdge
export const CHART_COLORS = {
  federal: '#2563eb',     // Professional blue
  state: '#059669',       // Emerald green  
  local: '#dc2626',       // Red
  utility: '#ea580c',     // Orange
  foundation: '#7c3aed'   // Purple
};

// Technology distribution colors
export const TECH_COLORS = {
  efficiency: '#10b981',   // Emerald - energy efficiency
  renewable: '#f59e0b',    // Amber - solar/renewable
  hvac: '#3b82f6',        // Blue - HVAC systems
  storage: '#8b5cf6',     // Purple - energy storage
  ev: '#06b6d4',          // Cyan - electric vehicles
  research: '#ef4444'     // Red - research/innovation
};

// Calculator Project Types
export const CALCULATOR_PROJECT_TYPES = [
  { value: 'commercial-retrofit', label: 'Commercial Retrofit' },
  { value: 'commercial-new', label: 'Commercial New Construction' },
  { value: 'multifamily-retrofit', label: 'Multifamily Retrofit' },
  { value: 'multifamily-new', label: 'Multifamily New Construction' },
  { value: 'affordable', label: 'Affordable Housing' }
];
