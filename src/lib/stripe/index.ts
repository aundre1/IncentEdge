/**
 * Stripe Integration Module
 *
 * Centralized exports for Stripe functionality
 */

// Client
export {
  getStripeClient,
  isStripeMockMode,
  resetStripeClient,
  handleStripeError,
  isStripeError,
  StripeError,
  StripeErrorType,
  type default as Stripe,
} from './client';

// Products
export {
  PRODUCT_TIERS,
  ALL_TIERS,
  SOLO_TIER,
  TEAM_TIER,
  ENTERPRISE_TIER,
  FREE_TIER,
  getTierById,
  getTierByPriceId,
  isAnnualPrice,
  formatPrice,
  calculateAnnualSavings,
  getTierComparison,
  SubscriptionTier,
  type ProductTier,
  type TierLimits,
  type TierComparisonFeature,
} from './products';

// Subscriptions
export {
  createSubscription,
  getSubscription,
  getCustomerSubscriptions,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  calculateProration,
  extractSubscriptionInfo,
  mapSubscriptionStatus,
  isSubscriptionActive,
  needsAttention,
  SubscriptionStatus,
  type SubscriptionInfo,
  type CreateSubscriptionParams,
  type UpdateSubscriptionParams,
  type CancelSubscriptionParams,
} from './subscriptions';
