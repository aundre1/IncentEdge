/**
 * useSubscription Hook
 *
 * React hook for managing subscription state and operations
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionTier } from '@/lib/stripe/products';

/**
 * Subscription data from database
 */
export interface SubscriptionData {
  id: string;
  tier: SubscriptionTier;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd: Date | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

/**
 * Hook state
 */
export interface UseSubscriptionState {
  /** Current subscription data */
  subscription: SubscriptionData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Is subscription active */
  isActive: boolean;
  /** Is in trial period */
  isTrialing: boolean;
  /** Days remaining in trial */
  trialDaysRemaining: number | null;
  /** Days until renewal */
  daysUntilRenewal: number | null;
  /** Refresh subscription data */
  refresh: () => Promise<void>;
}

/**
 * useSubscription hook
 *
 * @param organizationId - Organization ID to fetch subscription for
 * @returns Subscription state and operations
 */
export function useSubscription(organizationId?: string): UseSubscriptionState {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch subscription data
   */
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Get user if organizationId not provided
      let orgId = organizationId;
      if (!orgId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSubscription(null);
          return;
        }

        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        orgId = profile?.organization_id;
      }

      if (!orgId) {
        setSubscription(null);
        return;
      }

      // Fetch organization subscription
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select(`
          stripe_customer_id,
          stripe_subscription_id,
          subscription_tier,
          subscription_status,
          subscription_expires_at,
          trial_ends_at
        `)
        .eq('id', orgId)
        .single();

      if (orgError) throw orgError;

      if (!org?.stripe_subscription_id) {
        setSubscription(null);
        return;
      }

      // Fetch detailed subscription data
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', org.stripe_subscription_id)
        .single();

      if (subError) throw subError;

      if (sub) {
        setSubscription({
          id: sub.id,
          tier: sub.tier as SubscriptionTier,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start),
          currentPeriodEnd: new Date(sub.current_period_end),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          trialEnd: sub.trial_end ? new Date(sub.trial_end) : null,
          stripeCustomerId: sub.stripe_customer_id,
          stripeSubscriptionId: sub.stripe_subscription_id,
        });
      }
    } catch (err) {
      console.error('[useSubscription] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  // Load subscription on mount and when organizationId changes
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Subscribe to subscription changes
  useEffect(() => {
    if (!subscription?.stripeSubscriptionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `stripe_subscription_id=eq.${subscription.stripeSubscriptionId}`,
        },
        () => {
          console.log('[useSubscription] Subscription changed, refreshing...');
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscription?.stripeSubscriptionId, fetchSubscription]);

  // Calculate derived state
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isTrialing = subscription?.status === 'trialing';

  const trialDaysRemaining = subscription?.trialEnd
    ? Math.max(0, Math.ceil((subscription.trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const daysUntilRenewal = subscription?.currentPeriodEnd
    ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    subscription,
    isLoading,
    error,
    isActive,
    isTrialing,
    trialDaysRemaining,
    daysUntilRenewal,
    refresh: fetchSubscription,
  };
}

/**
 * Check if user has access to a feature based on subscription tier
 *
 * @param requiredTier - Minimum tier required
 * @param currentTier - User's current tier
 * @returns true if user has access
 */
export function hasFeatureAccess(
  requiredTier: SubscriptionTier,
  currentTier: SubscriptionTier
): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.SOLO]: 1,
    [SubscriptionTier.TEAM]: 2,
    [SubscriptionTier.ENTERPRISE]: 3,
  };

  return tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
}

/**
 * Hook to check feature access
 *
 * @param requiredTier - Minimum tier required
 * @returns Object with hasAccess boolean and current tier
 */
export function useFeatureAccess(requiredTier: SubscriptionTier) {
  const { subscription, isLoading } = useSubscription();

  const hasAccess = subscription
    ? hasFeatureAccess(requiredTier, subscription.tier)
    : false;

  return {
    hasAccess,
    currentTier: subscription?.tier || SubscriptionTier.FREE,
    isLoading,
  };
}
