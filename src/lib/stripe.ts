import Stripe from 'stripe';

// Lazy initialization of Stripe client to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility (but prefer getStripe())
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : (null as unknown as Stripe);

// ============================================================================
// PRICING CONFIGURATION
// ============================================================================

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  pilotPrice: number;
  priceId: string;         // Stripe Price ID for monthly
  pilotPriceId: string;    // Stripe Price ID for pilot discount
  features: string[];
  limits: {
    projectsPerMonth: number | 'unlimited';
    analysesPerMonth: number | 'unlimited';
    teamMembers: number | 'unlimited';
    apiAccess: boolean;
    prioritySupport: boolean;
    customIntegrations: boolean;
  };
  highlighted?: boolean;
  ctaText: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual developers and small projects',
    monthlyPrice: 299,
    pilotPrice: 149,
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_monthly',
    pilotPriceId: process.env.STRIPE_STARTER_PILOT_PRICE_ID || 'price_starter_pilot',
    features: [
      'Up to 5 projects per month',
      '25 incentive analyses',
      'Basic eligibility matching',
      'PDF report exports',
      'Email support',
      'Standard database access',
    ],
    limits: {
      projectsPerMonth: 5,
      analysesPerMonth: 25,
      teamMembers: 1,
      apiAccess: false,
      prioritySupport: false,
      customIntegrations: false,
    },
    ctaText: 'Start Free Trial',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers and growing teams',
    monthlyPrice: 999,
    pilotPrice: 499,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    pilotPriceId: process.env.STRIPE_PRO_PILOT_PRICE_ID || 'price_pro_pilot',
    features: [
      'Unlimited projects',
      'Unlimited analyses',
      'AI-powered recommendations',
      'Advanced stacking analysis',
      'Direct Pay eligibility checker',
      'Priority email & chat support',
      'API access',
      'Custom report branding',
      'Team collaboration (up to 5)',
    ],
    limits: {
      projectsPerMonth: 'unlimited',
      analysesPerMonth: 'unlimited',
      teamMembers: 5,
      apiAccess: true,
      prioritySupport: true,
      customIntegrations: false,
    },
    highlighted: true,
    ctaText: 'Start Free Trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    monthlyPrice: 0, // Custom pricing
    pilotPrice: 0,
    priceId: '', // Contact sales
    pilotPriceId: '',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom AI training',
      'White-label options',
      'Bulk data imports',
      'On-premise deployment option',
      'Compliance & audit support',
    ],
    limits: {
      projectsPerMonth: 'unlimited',
      analysesPerMonth: 'unlimited',
      teamMembers: 'unlimited',
      apiAccess: true,
      prioritySupport: true,
      customIntegrations: true,
    },
    ctaText: 'Contact Sales',
  },
];

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface SubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  tier: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  trialEnd: Date | null;
}

export interface CheckoutSessionParams {
  priceId: string;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialDays?: number;
}

export interface PortalSessionParams {
  customerId: string;
  returnUrl: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pricing tier by ID
 */
export function getPricingTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}

/**
 * Get pricing tier by Stripe Price ID
 */
export function getTierByPriceId(priceId: string): PricingTier | undefined {
  return PRICING_TIERS.find(
    tier => tier.priceId === priceId || tier.pilotPriceId === priceId
  );
}

/**
 * Check if a price is a pilot/discount price
 */
export function isPilotPrice(priceId: string): boolean {
  return PRICING_TIERS.some(tier => tier.pilotPriceId === priceId);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  if (amount === 0) return 'Custom';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(original: number, discounted: number): number {
  if (original === 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

/**
 * Map Stripe subscription status to our status
 */
export function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    'active': 'active',
    'past_due': 'past_due',
    'canceled': 'canceled',
    'trialing': 'trialing',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'unpaid': 'unpaid',
    'paused': 'paused',
  };
  return statusMap[stripeStatus] || 'incomplete';
}

/**
 * Extract subscription info from Stripe subscription object
 */
export function extractSubscriptionInfo(
  subscription: Stripe.Subscription
): SubscriptionInfo {
  const priceId = subscription.items.data[0]?.price.id || '';
  const tier = getTierByPriceId(priceId);

  // Access properties from the subscription object
  // Using type assertion for API compatibility with different Stripe versions
  const sub = subscription as unknown as {
    id: string;
    status: string;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
    trial_end: number | null;
    current_period_start: number;
    current_period_end: number;
  };

  return {
    id: sub.id,
    status: mapStripeStatus(sub.status),
    tier: tier?.id || 'unknown',
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: sub.canceled_at
      ? new Date(sub.canceled_at * 1000)
      : null,
    trialEnd: sub.trial_end
      ? new Date(sub.trial_end * 1000)
      : null,
  };
}
