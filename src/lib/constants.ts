// IncentEdge Constants

export const APP_NAME = 'IncentEdge';
export const APP_DESCRIPTION = "Infrastructure's Bloomberg Terminal for Incentives";

// Navigation Items
export const MAIN_NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'FolderKanban',
    badge: 12,
    children: [
      { label: 'Active', href: '/projects?status=active' },
      { label: 'Archived', href: '/projects?status=archived' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: 'Database',
    children: [
      { label: 'Federal', href: '/programs?category=federal' },
      { label: 'State', href: '/programs?category=state' },
      { label: 'Local', href: '/programs?category=local' },
      { label: 'Utility', href: '/programs?category=utility' },
    ],
  },
  {
    label: 'Applications',
    href: '/applications',
    icon: 'FileText',
    badge: 3,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
  },
] as const;

export const BOTTOM_NAV_ITEMS = [
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Help & Docs', href: '/help', icon: 'HelpCircle' },
  { label: 'Billing', href: '/billing', icon: 'CreditCard' },
] as const;

// Property Types
export const PROPERTY_TYPES = [
  { value: 'multifamily', label: 'Multifamily Residential' },
  { value: 'mixed-use', label: 'Mixed-Use' },
  { value: 'commercial', label: 'Commercial Office' },
  { value: 'industrial', label: 'Industrial / Warehouse' },
  { value: 'solar', label: 'Solar Farm' },
  { value: 'storage', label: 'Battery Storage' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare / Medical' },
  { value: 'retail', label: 'Retail' },
] as const;

// Development Types
export const DEVELOPMENT_TYPES = [
  { value: 'new-construction', label: 'New Construction' },
  { value: 'substantial-rehab', label: 'Substantial Rehabilitation' },
  { value: 'acquisition', label: 'Acquisition' },
  { value: 'refinance', label: 'Refinance' },
] as const;

// Energy Systems
export const ENERGY_SYSTEMS = [
  { id: 'solar', label: 'Solar PV' },
  { id: 'battery', label: 'Battery Storage' },
  { id: 'geothermal', label: 'Geothermal' },
  { id: 'fuel-cell', label: 'Fuel Cell' },
  { id: 'wind', label: 'Wind' },
  { id: 'ev-charging', label: 'EV Charging' },
  { id: 'heat-pump', label: 'Heat Pump' },
] as const;

// Building Certifications
export const CERTIFICATIONS = [
  { id: 'leed', label: 'LEED' },
  { id: 'passive-house', label: 'Passive House' },
  { id: 'energy-star', label: 'ENERGY STAR' },
  { id: 'well', label: 'WELL Building' },
  { id: 'fitwel', label: 'Fitwel' },
  { id: 'ngbs', label: 'NGBS Green' },
] as const;

// AMI Levels
export const AMI_LEVELS = ['30%', '50%', '60%', '80%', '100%', '120%'] as const;

// Project Status
export const PROJECT_STATUS = [
  { value: 'active', label: 'Active', color: 'emerald' },
  { value: 'on-hold', label: 'On Hold', color: 'amber' },
  { value: 'completed', label: 'Completed', color: 'blue' },
  { value: 'archived', label: 'Archived', color: 'slate' },
] as const;

// Application Status
export const APPLICATION_STATUS = [
  { value: 'draft', label: 'Draft', color: 'slate' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'ready-for-review', label: 'Ready for Review', color: 'amber' },
  { value: 'submitted', label: 'Submitted', color: 'purple' },
  { value: 'under-review', label: 'Under Review', color: 'indigo' },
  { value: 'approved', label: 'Approved', color: 'emerald' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'slate' },
] as const;

// Incentive Categories
export const INCENTIVE_CATEGORIES = [
  { value: 'federal', label: 'Federal', color: '#3b82f6' },
  { value: 'state', label: 'State', color: '#10b981' },
  { value: 'local', label: 'Local', color: '#f59e0b' },
  { value: 'utility', label: 'Utility', color: '#8b5cf6' },
] as const;

// Incentive Types
export const INCENTIVE_TYPES = [
  { value: 'tax_credit', label: 'Tax Credit' },
  { value: 'grant', label: 'Grant' },
  { value: 'rebate', label: 'Rebate' },
  { value: 'loan', label: 'Loan' },
  { value: 'tax_exemption', label: 'Tax Exemption' },
  { value: 'financing', label: 'Financing' },
] as const;

// US States
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
] as const;

// User Roles
export const USER_ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'manager', label: 'Manager', description: 'Can manage projects and team' },
  { value: 'analyst', label: 'Analyst', description: 'Can view and edit projects' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
] as const;

// ============================================================================
// SUSTAINABILITY TIERS
// ============================================================================
export const SUSTAINABILITY_TIERS = [
  {
    value: 'tier_1_efficient',
    label: 'Efficient',
    shortLabel: 'Tier 1',
    color: '#64748b', // slate
    description: 'Energy Star, code+20% insulation, LED lighting',
    incentiveMultiplier: 1.0,
  },
  {
    value: 'tier_2_high_performance',
    label: 'High Performance',
    shortLabel: 'Tier 2',
    color: '#0ea5e9', // sky
    description: 'Passive House OR LEED Gold, 50%+ energy reduction',
    incentiveMultiplier: 1.15,
  },
  {
    value: 'tier_3_net_zero',
    label: 'Net Zero',
    shortLabel: 'Tier 3',
    color: '#10b981', // emerald
    description: 'Passive House + renewables + zero carbon operations',
    incentiveMultiplier: 1.30,
  },
  {
    value: 'tier_3_triple_net_zero',
    label: 'Triple Net Zero',
    shortLabel: 'TNZ',
    color: '#8b5cf6', // violet
    description: 'Net zero energy + water recycling + 95% waste diversion',
    incentiveMultiplier: 1.50,
  },
] as const;

// RS Means Building Types (mapped to our building types)
export const RS_MEANS_BUILDING_TYPES = [
  { value: 'multifamily', label: 'Multifamily Residential', rsMeans: 'multifamily' },
  { value: 'mixed-use', label: 'Mixed-Use', rsMeans: 'mixed_use' },
  { value: 'commercial', label: 'Commercial Office', rsMeans: 'commercial' },
  { value: 'industrial', label: 'Industrial / Warehouse', rsMeans: 'industrial' },
  { value: 'solar', label: 'Solar Farm', rsMeans: 'solar' },
  { value: 'retail', label: 'Retail', rsMeans: 'commercial' },
  { value: 'hospitality', label: 'Hospitality', rsMeans: 'commercial' },
  { value: 'healthcare', label: 'Healthcare', rsMeans: 'commercial' },
] as const;

// Energy Systems for cost estimation
export const ENERGY_SYSTEM_TYPES = [
  { value: 'solar', label: 'Solar PV', unit: 'kW', defaultSize: 100 },
  { value: 'battery', label: 'Battery Storage', unit: 'kWh', defaultSize: 200 },
  { value: 'heat_pump', label: 'Heat Pump', unit: 'ton', defaultSize: 50 },
  { value: 'geothermal', label: 'Geothermal', unit: 'ton', defaultSize: 100 },
  { value: 'ev_charging', label: 'EV Charging', unit: 'ports', defaultSize: 20 },
] as const;
