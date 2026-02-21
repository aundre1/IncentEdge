/**
 * Stripe Product Definitions
 *
 * Production SaaS pricing tiers for IncentEdge:
 * - Solo: $8,500/month
 * - Team: $18,000/month
 * - Enterprise: $35,000/month
 */

/**
 * Subscription tier identifiers
 */
export enum SubscriptionTier {
  FREE = 'free',
  SOLO = 'solo',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

/**
 * Pricing tier feature limits
 */
export interface TierLimits {
  /** Maximum number of active projects */
  maxProjects: number | 'unlimited';
  /** Maximum analyses per month */
  maxAnalyses: number | 'unlimited';
  /** Maximum team members */
  maxTeamMembers: number | 'unlimited';
  /** Maximum API requests per month */
  maxApiRequests: number | 'unlimited';
  /** Maximum data storage in GB */
  maxStorageGB: number | 'unlimited';
  /** Export formats available */
  exportFormats: string[];
  /** Support level */
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

/**
 * Product tier definition
 */
export interface ProductTier {
  /** Tier identifier */
  id: SubscriptionTier;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Monthly price in cents */
  priceInCents: number;
  /** Stripe Price ID (from environment or default) */
  stripePriceId: string;
  /** Annual price in cents (if available) */
  annualPriceInCents?: number;
  /** Stripe Annual Price ID */
  stripeAnnualPriceId?: string;
  /** List of features included */
  features: string[];
  /** Feature limits */
  limits: TierLimits;
  /** Is this tier highlighted/recommended */
  highlighted?: boolean;
  /** Call-to-action text */
  ctaText: string;
  /** Custom badge text */
  badge?: string;
}

/**
 * Free tier (for reference/fallback)
 */
export const FREE_TIER: ProductTier = {
  id: SubscriptionTier.FREE,
  name: 'Free',
  description: 'For exploring IncentEdge capabilities',
  priceInCents: 0,
  stripePriceId: '',
  features: [
    'Limited database access',
    '1 project per month',
    '5 basic analyses',
    'Community support',
    'Basic PDF exports',
  ],
  limits: {
    maxProjects: 1,
    maxAnalyses: 5,
    maxTeamMembers: 1,
    maxApiRequests: 100,
    maxStorageGB: 1,
    exportFormats: ['pdf'],
    supportLevel: 'community',
  },
  ctaText: 'Get Started',
};

/**
 * Solo tier - $8,500/month
 * Perfect for individual developers and consultants
 */
export const SOLO_TIER: ProductTier = {
  id: SubscriptionTier.SOLO,
  name: 'Solo',
  description: 'For individual developers and consultants',
  priceInCents: 850000, // $8,500
  stripePriceId: process.env.STRIPE_SOLO_PRICE_ID || 'price_solo_monthly',
  annualPriceInCents: 9180000, // $91,800 (10% discount)
  stripeAnnualPriceId: process.env.STRIPE_SOLO_ANNUAL_PRICE_ID || 'price_solo_annual',
  features: [
    'Full incentive database access (24,458+ programs)',
    'Up to 10 active projects',
    'Unlimited eligibility analyses',
    'AI-powered recommendations',
    'Advanced stacking analysis',
    'Direct Pay (IRA 6417) eligibility checker',
    'Priority email support',
    'PDF & Excel exports',
    'Custom report branding',
    'API access (10K requests/month)',
  ],
  limits: {
    maxProjects: 10,
    maxAnalyses: 'unlimited',
    maxTeamMembers: 1,
    maxApiRequests: 10000,
    maxStorageGB: 50,
    exportFormats: ['pdf', 'excel', 'csv'],
    supportLevel: 'email',
  },
  ctaText: 'Start Free Trial',
  badge: 'Most Popular',
  highlighted: true,
};

/**
 * Team tier - $18,000/month
 * For development teams and growing firms
 */
export const TEAM_TIER: ProductTier = {
  id: SubscriptionTier.TEAM,
  name: 'Team',
  description: 'For development teams and growing firms',
  priceInCents: 1800000, // $18,000
  stripePriceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team_monthly',
  annualPriceInCents: 19440000, // $194,400 (10% discount)
  stripeAnnualPriceId: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID || 'price_team_annual',
  features: [
    'Everything in Solo',
    'Unlimited active projects',
    'Up to 10 team members',
    'Advanced scenario modeling',
    'Bulk project import',
    'Priority email & chat support',
    'API access (100K requests/month)',
    'Custom integrations (Procore, Autodesk)',
    'Compliance tracking & alerts',
    'Team collaboration tools',
    'Advanced analytics dashboard',
  ],
  limits: {
    maxProjects: 'unlimited',
    maxAnalyses: 'unlimited',
    maxTeamMembers: 10,
    maxApiRequests: 100000,
    maxStorageGB: 500,
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    supportLevel: 'priority',
  },
  ctaText: 'Start Free Trial',
  badge: 'Best Value',
};

/**
 * Enterprise tier - $35,000/month
 * For large organizations with custom needs
 */
export const ENTERPRISE_TIER: ProductTier = {
  id: SubscriptionTier.ENTERPRISE,
  name: 'Enterprise',
  description: 'For large organizations with custom needs',
  priceInCents: 3500000, // $35,000
  stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
  annualPriceInCents: 37800000, // $378,000 (10% discount)
  stripeAnnualPriceId: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || 'price_enterprise_annual',
  features: [
    'Everything in Team',
    'Unlimited team members',
    'Dedicated account manager',
    'Custom AI model training',
    'White-label options',
    'SLA guarantees (99.9% uptime)',
    'Unlimited API access',
    'On-premise deployment option',
    'Custom data integrations',
    'Priority feature requests',
    'Compliance & audit support',
    'Custom contract terms',
    '24/7 phone support',
  ],
  limits: {
    maxProjects: 'unlimited',
    maxAnalyses: 'unlimited',
    maxTeamMembers: 'unlimited',
    maxApiRequests: 'unlimited',
    maxStorageGB: 'unlimited',
    exportFormats: ['pdf', 'excel', 'csv', 'json', 'xml'],
    supportLevel: 'dedicated',
  },
  ctaText: 'Contact Sales',
};

/**
 * All available tiers in order
 */
export const PRODUCT_TIERS: ProductTier[] = [
  SOLO_TIER,
  TEAM_TIER,
  ENTERPRISE_TIER,
];

/**
 * All tiers including free
 */
export const ALL_TIERS: ProductTier[] = [
  FREE_TIER,
  ...PRODUCT_TIERS,
];

/**
 * Get tier by ID
 *
 * @param tierId - Tier identifier
 * @returns Product tier or undefined
 */
export function getTierById(tierId: SubscriptionTier | string): ProductTier | undefined {
  return ALL_TIERS.find((tier) => tier.id === tierId);
}

/**
 * Get tier by Stripe Price ID
 *
 * @param priceId - Stripe Price ID
 * @returns Product tier or undefined
 */
export function getTierByPriceId(priceId: string): ProductTier | undefined {
  return ALL_TIERS.find(
    (tier) =>
      tier.stripePriceId === priceId ||
      tier.stripeAnnualPriceId === priceId
  );
}

/**
 * Check if a price ID is for annual billing
 *
 * @param priceId - Stripe Price ID
 * @returns true if annual billing
 */
export function isAnnualPrice(priceId: string): boolean {
  return ALL_TIERS.some((tier) => tier.stripeAnnualPriceId === priceId);
}

/**
 * Format price for display
 *
 * @param cents - Price in cents
 * @param interval - Billing interval
 * @returns Formatted price string
 */
export function formatPrice(
  cents: number,
  interval: 'month' | 'year' = 'month'
): string {
  if (cents === 0) return 'Free';

  const dollars = cents / 100;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars);

  return interval === 'year' ? `${formatted}/year` : `${formatted}/month`;
}

/**
 * Calculate annual savings
 *
 * @param monthlyPrice - Monthly price in cents
 * @param annualPrice - Annual price in cents
 * @returns Savings percentage
 */
export function calculateAnnualSavings(
  monthlyPrice: number,
  annualPrice: number
): number {
  const monthlyAnnual = monthlyPrice * 12;
  return Math.round(((monthlyAnnual - annualPrice) / monthlyAnnual) * 100);
}

/**
 * Get tier comparison data for pricing table
 *
 * @returns Array of comparison features
 */
export interface TierComparisonFeature {
  category: string;
  features: {
    name: string;
    free: string | boolean;
    solo: string | boolean;
    team: string | boolean;
    enterprise: string | boolean;
  }[];
}

export function getTierComparison(): TierComparisonFeature[] {
  return [
    {
      category: 'Core Features',
      features: [
        {
          name: 'Incentive Database Access',
          free: 'Limited',
          solo: 'Full',
          team: 'Full',
          enterprise: 'Full',
        },
        {
          name: 'Active Projects',
          free: '1',
          solo: '10',
          team: 'Unlimited',
          enterprise: 'Unlimited',
        },
        {
          name: 'Analyses per Month',
          free: '5',
          solo: 'Unlimited',
          team: 'Unlimited',
          enterprise: 'Unlimited',
        },
        {
          name: 'AI Recommendations',
          free: false,
          solo: true,
          team: true,
          enterprise: true,
        },
        {
          name: 'Stacking Analysis',
          free: false,
          solo: true,
          team: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Team & Collaboration',
      features: [
        {
          name: 'Team Members',
          free: '1',
          solo: '1',
          team: '10',
          enterprise: 'Unlimited',
        },
        {
          name: 'Team Collaboration',
          free: false,
          solo: false,
          team: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'API & Integrations',
      features: [
        {
          name: 'API Access',
          free: 'Limited',
          solo: '10K/mo',
          team: '100K/mo',
          enterprise: 'Unlimited',
        },
        {
          name: 'Custom Integrations',
          free: false,
          solo: false,
          team: true,
          enterprise: true,
        },
      ],
    },
    {
      category: 'Support',
      features: [
        {
          name: 'Support Level',
          free: 'Community',
          solo: 'Email',
          team: 'Priority',
          enterprise: 'Dedicated',
        },
        {
          name: 'SLA Guarantee',
          free: false,
          solo: false,
          team: false,
          enterprise: '99.9%',
        },
      ],
    },
  ];
}
