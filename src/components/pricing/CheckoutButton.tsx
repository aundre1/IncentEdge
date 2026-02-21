/**
 * CheckoutButton Component
 *
 * Button to initiate Stripe Checkout flow
 */

'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SubscriptionTier } from '@/lib/stripe/products';

/**
 * CheckoutButton props
 */
export interface CheckoutButtonProps {
  /** Stripe price ID */
  priceId: string;
  /** Subscription tier */
  tier: SubscriptionTier | string;
  /** Button text */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Trial days */
  trialDays?: number;
  /** Success URL override */
  successUrl?: string;
  /** Cancel URL override */
  cancelUrl?: string;
}

/**
 * CheckoutButton component
 */
export function CheckoutButton({
  priceId,
  tier,
  children = 'Subscribe',
  className = '',
  onSuccess,
  onError,
  disabled = false,
  trialDays = 14,
  successUrl,
  cancelUrl,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Call checkout API
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          trialDays,
          successUrl,
          cancelUrl,
          metadata: {
            tier,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
        onSuccess?.();
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('[CheckoutButton] Error:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <Loader2 className="absolute left-4 h-5 w-5 animate-spin" />
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}

/**
 * Manage Billing Button
 * Opens Stripe Customer Portal
 */
export interface ManageBillingButtonProps {
  /** Button text */
  children?: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Return URL override */
  returnUrl?: string;
}

export function ManageBillingButton({
  children = 'Manage Billing',
  className = '',
  onSuccess,
  onError,
  disabled = false,
  returnUrl,
}: ManageBillingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePortal = async () => {
    try {
      setIsLoading(true);

      // Call portal API
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create portal session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Portal
      if (url) {
        window.location.href = url;
        onSuccess?.();
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('[ManageBillingButton] Error:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePortal}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <Loader2 className="absolute left-4 h-5 w-5 animate-spin" />
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}
