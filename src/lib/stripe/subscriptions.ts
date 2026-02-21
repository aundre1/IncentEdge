/**
 * Stripe Subscription Management
 *
 * Production-ready subscription operations:
 * - Create subscriptions
 * - Update subscriptions
 * - Cancel subscriptions
 * - Handle proration
 * - Get subscription status
 */

import Stripe from 'stripe';
import { getStripeClient, handleStripeError, isStripeMockMode } from './client';
import { getTierById, getTierByPriceId, SubscriptionTier } from './products';

/**
 * Subscription status enum
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  UNPAID = 'unpaid',
  PAUSED = 'paused',
}

/**
 * Subscription information
 */
export interface SubscriptionInfo {
  /** Stripe subscription ID */
  id: string;
  /** Current status */
  status: SubscriptionStatus;
  /** Subscription tier */
  tier: SubscriptionTier;
  /** Stripe customer ID */
  customerId: string;
  /** Current period start timestamp */
  currentPeriodStart: Date;
  /** Current period end timestamp */
  currentPeriodEnd: Date;
  /** Will cancel at period end */
  cancelAtPeriodEnd: boolean;
  /** Canceled at timestamp */
  canceledAt: Date | null;
  /** Trial end timestamp */
  trialEnd: Date | null;
  /** Price ID */
  priceId: string;
  /** Metadata */
  metadata: Record<string, string>;
}

/**
 * Create subscription parameters
 */
export interface CreateSubscriptionParams {
  /** Stripe customer ID */
  customerId: string;
  /** Stripe price ID */
  priceId: string;
  /** Trial period in days */
  trialDays?: number;
  /** Metadata to attach */
  metadata?: Record<string, string>;
  /** Proration behavior */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

/**
 * Update subscription parameters
 */
export interface UpdateSubscriptionParams {
  /** New price ID (for tier change) */
  priceId?: string;
  /** Update metadata */
  metadata?: Record<string, string>;
  /** Proration behavior */
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  /** When to apply the change */
  prorationDate?: number;
}

/**
 * Cancel subscription parameters
 */
export interface CancelSubscriptionParams {
  /** Cancel immediately or at period end */
  immediately?: boolean;
  /** Cancellation reason */
  reason?: string;
}

/**
 * Create a new subscription
 *
 * @param params - Subscription creation parameters
 * @returns Subscription information
 * @throws StripeError if creation fails
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<SubscriptionInfo> {
  try {
    const stripe = getStripeClient();

    if (isStripeMockMode()) {
      console.warn('[Subscriptions] Creating subscription in mock mode');
    }

    // Validate tier exists
    const tier = getTierByPriceId(params.priceId);
    if (!tier && !isStripeMockMode()) {
      throw new Error(`Invalid price ID: ${params.priceId}`);
    }

    // Build subscription params
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: params.customerId,
      items: [
        {
          price: params.priceId,
        },
      ],
      metadata: {
        tier: tier?.id || 'unknown',
        ...params.metadata,
      },
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    };

    // Add trial period if specified
    if (params.trialDays && params.trialDays > 0) {
      subscriptionParams.trial_period_days = params.trialDays;
    }

    // Add proration behavior
    if (params.prorationBehavior) {
      subscriptionParams.proration_behavior = params.prorationBehavior;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    return extractSubscriptionInfo(subscription);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Get subscription by ID
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns Subscription information
 * @throws StripeError if retrieval fails
 */
export async function getSubscription(
  subscriptionId: string
): Promise<SubscriptionInfo> {
  try {
    const stripe = getStripeClient();

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return extractSubscriptionInfo(subscription);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Get all subscriptions for a customer
 *
 * @param customerId - Stripe customer ID
 * @returns Array of subscription information
 * @throws StripeError if retrieval fails
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<SubscriptionInfo[]> {
  try {
    const stripe = getStripeClient();

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
    });

    return subscriptions.data.map(extractSubscriptionInfo);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Update a subscription
 *
 * @param subscriptionId - Stripe subscription ID
 * @param params - Update parameters
 * @returns Updated subscription information
 * @throws StripeError if update fails
 */
export async function updateSubscription(
  subscriptionId: string,
  params: UpdateSubscriptionParams
): Promise<SubscriptionInfo> {
  try {
    const stripe = getStripeClient();

    const updateParams: Stripe.SubscriptionUpdateParams = {};

    // Update price (tier change)
    if (params.priceId) {
      const tier = getTierByPriceId(params.priceId);
      if (!tier && !isStripeMockMode()) {
        throw new Error(`Invalid price ID: ${params.priceId}`);
      }

      // Get current subscription to find subscription item ID
      const currentSub = await stripe.subscriptions.retrieve(subscriptionId);
      const currentItemId = currentSub.items.data[0]?.id;

      if (!currentItemId) {
        throw new Error('No subscription item found');
      }

      updateParams.items = [
        {
          id: currentItemId,
          price: params.priceId,
        },
      ];

      // Update tier in metadata
      updateParams.metadata = {
        ...params.metadata,
        tier: tier?.id || 'unknown',
      };
    } else if (params.metadata) {
      updateParams.metadata = params.metadata;
    }

    // Set proration behavior
    if (params.prorationBehavior) {
      updateParams.proration_behavior = params.prorationBehavior;
    }

    // Set proration date
    if (params.prorationDate) {
      updateParams.proration_date = params.prorationDate;
    }

    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );

    return extractSubscriptionInfo(subscription);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Cancel a subscription
 *
 * @param subscriptionId - Stripe subscription ID
 * @param params - Cancellation parameters
 * @returns Canceled subscription information
 * @throws StripeError if cancellation fails
 */
export async function cancelSubscription(
  subscriptionId: string,
  params: CancelSubscriptionParams = {}
): Promise<SubscriptionInfo> {
  try {
    const stripe = getStripeClient();

    let subscription: Stripe.Subscription;

    if (params.immediately) {
      // Cancel immediately
      subscription = await stripe.subscriptions.cancel(subscriptionId, {
        invoice_now: false,
        prorate: false,
      });
    } else {
      // Cancel at period end
      subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        cancellation_details: params.reason
          ? { comment: params.reason }
          : undefined,
      });
    }

    return extractSubscriptionInfo(subscription);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Resume a canceled subscription
 *
 * @param subscriptionId - Stripe subscription ID
 * @returns Resumed subscription information
 * @throws StripeError if resume fails
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<SubscriptionInfo> {
  try {
    const stripe = getStripeClient();

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return extractSubscriptionInfo(subscription);
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Calculate proration amount for tier change
 *
 * @param subscriptionId - Stripe subscription ID
 * @param newPriceId - New price ID
 * @returns Proration amount in cents (can be negative for credits)
 * @throws StripeError if calculation fails
 */
export async function calculateProration(
  subscriptionId: string,
  newPriceId: string
): Promise<number> {
  try {
    const stripe = getStripeClient();

    // Mock mode returns zero
    if (isStripeMockMode()) {
      console.warn('[Subscriptions] Calculating proration in mock mode');
      return 0;
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = subscription.items.data[0]?.id;

    if (!currentItemId) {
      throw new Error('No subscription item found');
    }

    // Create upcoming invoice preview with the change
    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.customer as string,
      subscription: subscriptionId,
      subscription_items: [
        {
          id: currentItemId,
          price: newPriceId,
        },
      ],
      subscription_proration_behavior: 'create_prorations',
    });

    // Calculate total proration amount
    let prorationAmount = 0;

    for (const line of upcomingInvoice.lines.data) {
      if (line.proration) {
        prorationAmount += line.amount;
      }
    }

    return prorationAmount;
  } catch (error) {
    throw handleStripeError(error);
  }
}

/**
 * Extract subscription information from Stripe subscription object
 *
 * @param subscription - Stripe subscription object
 * @returns Normalized subscription information
 */
export function extractSubscriptionInfo(
  subscription: Stripe.Subscription
): SubscriptionInfo {
  const priceId = subscription.items.data[0]?.price.id || '';
  const tier = getTierByPriceId(priceId);

  return {
    id: subscription.id,
    status: mapSubscriptionStatus(subscription.status),
    tier: tier?.id || SubscriptionTier.FREE,
    customerId: subscription.customer as string,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null,
    trialEnd: subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null,
    priceId,
    metadata: subscription.metadata as Record<string, string>,
  };
}

/**
 * Map Stripe subscription status to our enum
 *
 * @param status - Stripe subscription status
 * @returns Normalized subscription status
 */
export function mapSubscriptionStatus(status: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELED,
    trialing: SubscriptionStatus.TRIALING,
    incomplete: SubscriptionStatus.INCOMPLETE,
    incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
    unpaid: SubscriptionStatus.UNPAID,
    paused: SubscriptionStatus.PAUSED,
  };

  return statusMap[status] || SubscriptionStatus.INCOMPLETE;
}

/**
 * Check if subscription is active
 *
 * @param status - Subscription status
 * @returns true if subscription provides access
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.TRIALING,
  ].includes(status);
}

/**
 * Check if subscription needs attention
 *
 * @param status - Subscription status
 * @returns true if subscription has issues
 */
export function needsAttention(status: SubscriptionStatus): boolean {
  return [
    SubscriptionStatus.PAST_DUE,
    SubscriptionStatus.INCOMPLETE,
    SubscriptionStatus.UNPAID,
  ].includes(status);
}
