import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { stripe, getPricingTier } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

// Validation schema for checkout request
const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Valid success URL required'),
  cancelUrl: z.string().url('Valid cancel URL required'),
  customerId: z.string().optional(),
  trialDays: z.number().min(0).max(30).optional().default(14),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { priceId, successUrl, cancelUrl, customerId, trialDays } = validationResult.data;

    // Verify the price ID corresponds to a valid tier
    const tier = getPricingTier(priceId.split('_')[1]) ||
      (priceId.includes('starter') ? getPricingTier('starter') : null) ||
      (priceId.includes('pro') ? getPricingTier('pro') : null);

    if (!tier && !priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    let customerEmail: string | undefined;
    let userId: string | undefined;
    let organizationId: string | undefined;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        customerEmail = user.email || undefined;
        userId = user.id;

        // Get organization ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        organizationId = profile?.organization_id || undefined;
      }
    } catch {
      // Continue without auth - user can still checkout
    }

    // Build checkout session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        tier: tier?.id || 'unknown',
        userId: userId || '',
        organizationId: organizationId || '',
      },
    };

    // Add customer or customer email
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // Add trial period for new subscriptions
    if (trialDays > 0 && !customerId) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: {
          tier: tier?.id || 'unknown',
          userId: userId || '',
          organizationId: organizationId || '',
        },
      };
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Stripe errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as { type: string; message: string };
      return NextResponse.json(
        { error: stripeError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
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
