/**
 * Stripe Customer Portal API
 *
 * Creates a Stripe Customer Portal session for subscription management
 * POST /api/stripe/portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripeClient, handleStripeError } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

/**
 * Request validation schema
 */
const portalRequestSchema = z.object({
  returnUrl: z.string().url('Valid return URL required').optional(),
});

/**
 * Create customer portal session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = portalRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { returnUrl } = validation.data;

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json(
        { error: 'No organization found for user' },
        { status: 400 }
      );
    }

    // Get organization's Stripe customer ID
    const { data: organization } = await supabase
      .from('organizations')
      .select('stripe_customer_id, name')
      .eq('id', profile.organization_id)
      .single();

    if (!organization?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: 'No billing account found. Please subscribe first.',
          needsSubscription: true,
        },
        { status: 400 }
      );
    }

    // Build return URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const finalReturnUrl = returnUrl || `${baseUrl}/dashboard/settings/billing`;

    // Get Stripe client
    const stripe = getStripeClient();

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: finalReturnUrl,
    });

    // Return session URL
    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    console.error('[Portal] Error creating session:', error);

    const stripeError = handleStripeError(error);

    return NextResponse.json(
      {
        error: 'Failed to create portal session',
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
