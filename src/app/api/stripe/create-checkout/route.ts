/**
 * Stripe Checkout Session API
 *
 * Creates a Stripe Checkout session for subscription purchase
 * POST /api/stripe/create-checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripeClient, handleStripeError, isStripeMockMode } from '@/lib/stripe/client';
import { getTierByPriceId, SubscriptionTier } from '@/lib/stripe/products';
import { createClient } from '@/lib/supabase/server';

/**
 * Request validation schema
 */
const checkoutRequestSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Valid success URL required').optional(),
  cancelUrl: z.string().url('Valid cancel URL required').optional(),
  trialDays: z.number().min(0).max(30).default(14),
  metadata: z.record(z.string()).optional(),
});

/**
 * Create checkout session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { priceId, successUrl, cancelUrl, trialDays, metadata } = validation.data;

    // Validate tier exists
    const tier = getTierByPriceId(priceId);
    if (!tier && !isStripeMockMode()) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get authenticated user (optional)
    let userEmail: string | undefined;
    let userId: string | undefined;
    let organizationId: string | undefined;
    let customerId: string | undefined;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userEmail = user.email || undefined;
        userId = user.id;

        // Get user's organization
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        if (profile?.organization_id) {
          organizationId = profile.organization_id;

          // Get existing Stripe customer ID if available
          const { data: org } = await supabase
            .from('organizations')
            .select('stripe_customer_id')
            .eq('id', organizationId)
            .single();

          customerId = org?.stripe_customer_id || undefined;
        }
      }
    } catch (error) {
      // Continue without authentication
      console.log('User not authenticated, continuing with guest checkout');
    }

    // Build session URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalSuccessUrl = successUrl || `${baseUrl}/dashboard?checkout=success`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/pricing?checkout=canceled`;

    // Get Stripe client
    const stripe = getStripeClient();

    // Build checkout session params
    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${finalSuccessUrl}${finalSuccessUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: finalCancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        tier: tier?.id || SubscriptionTier.SOLO,
        userId: userId || '',
        organizationId: organizationId || '',
        ...metadata,
      },
      subscription_data: {
        metadata: {
          tier: tier?.id || SubscriptionTier.SOLO,
          userId: userId || '',
          organizationId: organizationId || '',
          ...metadata,
        },
      },
    };

    // Add customer or email
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    // Add trial period for new subscriptions
    if (trialDays > 0 && !customerId) {
      sessionParams.subscription_data.trial_period_days = trialDays;
    }

    // Add tax collection
    sessionParams.automatic_tax = { enabled: true };

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Return session info
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      tier: tier?.id,
      priceId,
    });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);

    const stripeError = handleStripeError(error);

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: stripeError.message,
        code: stripeError.code,
      },
      { status: stripeError.statusCode || 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
