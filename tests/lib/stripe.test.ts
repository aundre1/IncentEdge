/**
 * Stripe Integration Tests
 *
 * Comprehensive test suite for Stripe integration using mock mode
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStripeClient,
  isStripeMockMode,
  resetStripeClient,
  handleStripeError,
  StripeErrorType,
} from '@/lib/stripe/client';
import {
  PRODUCT_TIERS,
  SOLO_TIER,
  TEAM_TIER,
  ENTERPRISE_TIER,
  getTierById,
  getTierByPriceId,
  formatPrice,
  calculateAnnualSavings,
  SubscriptionTier,
} from '@/lib/stripe/products';
import {
  createSubscription,
  getSubscription,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  calculateProration,
  extractSubscriptionInfo,
  mapSubscriptionStatus,
  isSubscriptionActive,
  needsAttention,
  SubscriptionStatus,
} from '@/lib/stripe/subscriptions';

// ============================================================================
// STRIPE CLIENT TESTS
// ============================================================================

describe('Stripe Client', () => {
  beforeEach(() => {
    resetStripeClient();
  });

  it('should initialize in mock mode when no API key', () => {
    const stripe = getStripeClient();
    expect(stripe).toBeDefined();
    expect(isStripeMockMode()).toBe(true);
  });

  it('should return singleton instance', () => {
    const stripe1 = getStripeClient();
    const stripe2 = getStripeClient();
    expect(stripe1).toBe(stripe2);
  });

  it('should reset client instance', () => {
    const stripe1 = getStripeClient();
    resetStripeClient();
    const stripe2 = getStripeClient();
    expect(stripe1).not.toBe(stripe2);
  });

  it('should handle Stripe errors correctly', () => {
    const error = new Error('Test error');
    const stripeError = handleStripeError(error);

    expect(stripeError).toBeDefined();
    expect(stripeError.type).toBe(StripeErrorType.UNKNOWN_ERROR);
    expect(stripeError.message).toBe('Test error');
  });

  it('should create mock checkout session', async () => {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: 'price_solo_monthly', quantity: 1 }],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    });

    expect(session).toBeDefined();
    expect(session.id).toContain('mock_cs_');
    expect(session.url).toContain('checkout.stripe.com/mock/');
  });

  it('should create mock customer', async () => {
    const stripe = getStripeClient();
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      metadata: { test: 'data' },
    });

    expect(customer).toBeDefined();
    expect(customer.id).toContain('mock_cus_');
    expect(customer.email).toBe('test@example.com');
  });

  it('should create mock subscription', async () => {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.create({
      customer: 'cus_123',
      items: [{ price: 'price_solo_monthly' }],
    });

    expect(subscription).toBeDefined();
    expect(subscription.id).toContain('mock_sub_');
    expect(subscription.status).toBe('active');
  });
});

// ============================================================================
// PRODUCT TIERS TESTS
// ============================================================================

describe('Product Tiers', () => {
  it('should have correct number of tiers', () => {
    expect(PRODUCT_TIERS).toHaveLength(3);
  });

  it('should have correct tier IDs', () => {
    expect(PRODUCT_TIERS.map((t) => t.id)).toEqual([
      SubscriptionTier.SOLO,
      SubscriptionTier.TEAM,
      SubscriptionTier.ENTERPRISE,
    ]);
  });

  it('should have correct Solo tier pricing', () => {
    expect(SOLO_TIER.priceInCents).toBe(850000); // $8,500
    expect(SOLO_TIER.annualPriceInCents).toBe(9180000); // $91,800
  });

  it('should have correct Team tier pricing', () => {
    expect(TEAM_TIER.priceInCents).toBe(1800000); // $18,000
    expect(TEAM_TIER.annualPriceInCents).toBe(19440000); // $194,400
  });

  it('should have correct Enterprise tier pricing', () => {
    expect(ENTERPRISE_TIER.priceInCents).toBe(3500000); // $35,000
    expect(ENTERPRISE_TIER.annualPriceInCents).toBe(37800000); // $378,000
  });

  it('should get tier by ID', () => {
    const tier = getTierById(SubscriptionTier.SOLO);
    expect(tier).toBeDefined();
    expect(tier?.id).toBe(SubscriptionTier.SOLO);
  });

  it('should get tier by price ID', () => {
    const tier = getTierByPriceId('price_solo_monthly');
    expect(tier).toBeDefined();
    expect(tier?.id).toBe(SubscriptionTier.SOLO);
  });

  it('should format price correctly', () => {
    expect(formatPrice(850000, 'month')).toBe('$8,500/month');
    expect(formatPrice(9180000, 'year')).toBe('$91,800/year');
    expect(formatPrice(0)).toBe('Free');
  });

  it('should calculate annual savings correctly', () => {
    const savings = calculateAnnualSavings(850000, 9180000);
    expect(savings).toBe(10); // 10% discount
  });

  it('should have all required features', () => {
    PRODUCT_TIERS.forEach((tier) => {
      expect(tier.features).toBeDefined();
      expect(tier.features.length).toBeGreaterThan(0);
      expect(tier.limits).toBeDefined();
      expect(tier.limits.maxProjects).toBeDefined();
      expect(tier.limits.maxTeamMembers).toBeDefined();
      expect(tier.limits.supportLevel).toBeDefined();
    });
  });

  it('should have Solo tier highlighted', () => {
    expect(SOLO_TIER.highlighted).toBe(true);
  });
});

// ============================================================================
// SUBSCRIPTION MANAGEMENT TESTS
// ============================================================================

describe('Subscription Management', () => {
  it('should create subscription', async () => {
    const subscription = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
      trialDays: 14,
      metadata: { userId: 'user_123' },
    });

    expect(subscription).toBeDefined();
    expect(subscription.id).toContain('mock_sub_');
    expect(subscription.tier).toBe(SubscriptionTier.SOLO);
    expect(subscription.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('should get subscription', async () => {
    // First create a subscription
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_team_monthly',
    });

    // Then retrieve it
    const subscription = await getSubscription(created.id);

    expect(subscription).toBeDefined();
    expect(subscription.id).toBe(created.id);
  });

  it('should update subscription', async () => {
    // Create subscription
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    // Update to Team tier
    const updated = await updateSubscription(created.id, {
      priceId: 'price_team_monthly',
    });

    expect(updated).toBeDefined();
    expect(updated.id).toBe(created.id);
  });

  it('should cancel subscription immediately', async () => {
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    const canceled = await cancelSubscription(created.id, {
      immediately: true,
    });

    expect(canceled).toBeDefined();
    expect(canceled.status).toBe(SubscriptionStatus.CANCELED);
  });

  it('should cancel subscription at period end', async () => {
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    const canceled = await cancelSubscription(created.id, {
      immediately: false,
    });

    expect(canceled).toBeDefined();
    // Mock mode sets cancel_at_period_end in update
    expect(canceled.cancelAtPeriodEnd).toBeDefined();
  });

  it('should resume canceled subscription', async () => {
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    await cancelSubscription(created.id, { immediately: false });
    const resumed = await resumeSubscription(created.id);

    expect(resumed).toBeDefined();
    expect(resumed.cancelAtPeriodEnd).toBe(false);
  });

  it('should calculate proration in mock mode', async () => {
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    const proration = await calculateProration(created.id, 'price_team_monthly');

    expect(proration).toBe(0); // Mock mode returns 0
  });

  it('should map subscription status correctly', () => {
    expect(mapSubscriptionStatus('active')).toBe(SubscriptionStatus.ACTIVE);
    expect(mapSubscriptionStatus('past_due')).toBe(SubscriptionStatus.PAST_DUE);
    expect(mapSubscriptionStatus('canceled')).toBe(SubscriptionStatus.CANCELED);
    expect(mapSubscriptionStatus('trialing')).toBe(SubscriptionStatus.TRIALING);
  });

  it('should identify active subscriptions', () => {
    expect(isSubscriptionActive(SubscriptionStatus.ACTIVE)).toBe(true);
    expect(isSubscriptionActive(SubscriptionStatus.TRIALING)).toBe(true);
    expect(isSubscriptionActive(SubscriptionStatus.CANCELED)).toBe(false);
    expect(isSubscriptionActive(SubscriptionStatus.PAST_DUE)).toBe(false);
  });

  it('should identify subscriptions needing attention', () => {
    expect(needsAttention(SubscriptionStatus.PAST_DUE)).toBe(true);
    expect(needsAttention(SubscriptionStatus.INCOMPLETE)).toBe(true);
    expect(needsAttention(SubscriptionStatus.UNPAID)).toBe(true);
    expect(needsAttention(SubscriptionStatus.ACTIVE)).toBe(false);
  });
});

// ============================================================================
// SUBSCRIPTION INFO EXTRACTION TESTS
// ============================================================================

describe('Subscription Info Extraction', () => {
  it('should extract subscription info correctly', async () => {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.create({
      customer: 'cus_test123',
      items: [{ price: 'price_solo_monthly' }],
    });

    const info = extractSubscriptionInfo(subscription);

    expect(info).toBeDefined();
    expect(info.id).toBe(subscription.id);
    expect(info.customerId).toBe('cus_test123');
    expect(info.status).toBe(SubscriptionStatus.ACTIVE);
    expect(info.tier).toBe(SubscriptionTier.SOLO);
    expect(info.currentPeriodStart).toBeInstanceOf(Date);
    expect(info.currentPeriodEnd).toBeInstanceOf(Date);
  });

  it('should handle subscription metadata', async () => {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.create({
      customer: 'cus_test123',
      items: [{ price: 'price_team_monthly' }],
      metadata: {
        userId: 'user_123',
        organizationId: 'org_456',
      },
    });

    const info = extractSubscriptionInfo(subscription);

    expect(info.metadata).toBeDefined();
    expect(info.metadata.userId).toBe('user_123');
    expect(info.metadata.organizationId).toBe('org_456');
  });

  it('should handle trial subscriptions', async () => {
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
      trialDays: 14,
    });

    expect(created.status).toBe(SubscriptionStatus.ACTIVE);
    // In mock mode, trial_end should be set
    if (created.trialEnd) {
      expect(created.trialEnd).toBeInstanceOf(Date);
    }
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Stripe Integration', () => {
  it('should handle complete subscription lifecycle', async () => {
    // Create subscription
    const created = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
      trialDays: 14,
      metadata: {
        userId: 'user_123',
        organizationId: 'org_456',
      },
    });

    expect(created.tier).toBe(SubscriptionTier.SOLO);
    expect(isSubscriptionActive(created.status)).toBe(true);

    // Update to higher tier
    const upgraded = await updateSubscription(created.id, {
      priceId: 'price_team_monthly',
    });

    expect(upgraded.id).toBe(created.id);

    // Cancel at period end
    const canceled = await cancelSubscription(created.id, {
      immediately: false,
      reason: 'Testing',
    });

    // Mock mode behavior
    expect(canceled).toBeDefined();

    // Resume subscription
    const resumed = await resumeSubscription(created.id);

    expect(resumed.cancelAtPeriodEnd).toBe(false);

    // Cancel immediately
    const terminated = await cancelSubscription(created.id, {
      immediately: true,
    });

    expect(terminated.status).toBe(SubscriptionStatus.CANCELED);
  });

  it('should handle tier upgrades and downgrades', async () => {
    const subscription = await createSubscription({
      customerId: 'cus_test123',
      priceId: 'price_solo_monthly',
    });

    // Upgrade to Team
    const teamSub = await updateSubscription(subscription.id, {
      priceId: 'price_team_monthly',
    });
    expect(teamSub.id).toBe(subscription.id);

    // Upgrade to Enterprise
    const enterpriseSub = await updateSubscription(subscription.id, {
      priceId: 'price_enterprise_monthly',
    });
    expect(enterpriseSub.id).toBe(subscription.id);

    // Downgrade to Solo
    const downgradedSub = await updateSubscription(subscription.id, {
      priceId: 'price_solo_monthly',
    });
    expect(downgradedSub.id).toBe(subscription.id);
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('Error Handling', () => {
  it('should handle invalid price ID in non-mock mode', async () => {
    // Note: In mock mode, this will succeed with a mock subscription
    // In production with real Stripe, this would fail
    if (!isStripeMockMode()) {
      await expect(
        createSubscription({
          customerId: 'cus_test123',
          priceId: 'invalid_price_id',
        })
      ).rejects.toThrow();
    } else {
      // Mock mode accepts any price ID
      const result = await createSubscription({
        customerId: 'cus_test123',
        priceId: 'invalid_price_id',
      });
      expect(result).toBeDefined();
    }
  });

  it('should handle Stripe errors correctly', () => {
    const error = new Error('Card was declined');
    const stripeError = handleStripeError(error);

    expect(stripeError).toBeDefined();
    expect(stripeError.message).toContain('Card was declined');
  });
});
