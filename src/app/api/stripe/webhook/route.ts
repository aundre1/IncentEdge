/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for subscription lifecycle:
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 *
 * POST /api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';
import { extractSubscriptionInfo } from '@/lib/stripe/subscriptions';
import { getTierByPriceId, SubscriptionTier } from '@/lib/stripe/products';
import { createClient } from '@supabase/supabase-js';

/**
 * Service role client for webhook operations (bypasses RLS)
 */
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase configuration for webhook handler');
  }

  return createClient(url, key);
};

/**
 * Webhook events to process
 */
const RELEVANT_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

/**
 * Webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('[Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Webhook] Signature verification failed: ${message}`);
      return NextResponse.json(
        { error: `Webhook verification failed: ${message}` },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

    // Only process relevant events
    if (!RELEVANT_EVENTS.has(event.type)) {
      console.log(`[Webhook] Ignoring event type: ${event.type}`);
      return NextResponse.json({ received: true, processed: false });
    }

    // Process event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }

      console.log(`[Webhook] Successfully processed: ${event.type}`);
      return NextResponse.json({ received: true, processed: true });
    } catch (error) {
      console.error(`[Webhook] Error processing ${event.type}:`, error);
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout completed: ${session.id}`);

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const metadata = session.metadata || {};

  if (!customerId || !subscriptionId) {
    console.error('[Webhook] Missing customer or subscription ID');
    return;
  }

  const stripe = getStripeClient();

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const subscriptionInfo = extractSubscriptionInfo(subscription);
  const tier = getTierByPriceId(subscription.items.data[0]?.price.id || '');

  const supabase = getSupabaseAdmin();

  // Update organization subscription
  if (metadata.organizationId) {
    await supabase
      .from('organizations')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_tier: tier?.id || SubscriptionTier.SOLO,
        subscription_status: subscriptionInfo.status,
        subscription_expires_at: subscriptionInfo.currentPeriodEnd.toISOString(),
        trial_ends_at: subscriptionInfo.trialEnd?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', metadata.organizationId);

    console.log(`[Webhook] Updated organization: ${metadata.organizationId}`);
  }

  // Create subscription record
  await supabase.from('subscriptions').upsert({
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    user_id: metadata.userId || null,
    organization_id: metadata.organizationId || null,
    tier: tier?.id || SubscriptionTier.SOLO,
    status: subscriptionInfo.status,
    current_period_start: subscriptionInfo.currentPeriodStart.toISOString(),
    current_period_end: subscriptionInfo.currentPeriodEnd.toISOString(),
    trial_end: subscriptionInfo.trialEnd?.toISOString() || null,
    cancel_at_period_end: subscriptionInfo.cancelAtPeriodEnd,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  console.log('[Webhook] Checkout processed successfully');
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing subscription update: ${subscription.id}`);

  const subscriptionInfo = extractSubscriptionInfo(subscription);
  const tier = getTierByPriceId(subscription.items.data[0]?.price.id || '');
  const metadata = subscription.metadata || {};

  const supabase = getSupabaseAdmin();

  // Update subscription record
  await supabase.from('subscriptions').upsert({
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    user_id: metadata.userId || null,
    organization_id: metadata.organizationId || null,
    tier: tier?.id || SubscriptionTier.SOLO,
    status: subscriptionInfo.status,
    current_period_start: subscriptionInfo.currentPeriodStart.toISOString(),
    current_period_end: subscriptionInfo.currentPeriodEnd.toISOString(),
    trial_end: subscriptionInfo.trialEnd?.toISOString() || null,
    cancel_at_period_end: subscriptionInfo.cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  });

  // Update organization if linked
  if (metadata.organizationId) {
    await supabase
      .from('organizations')
      .update({
        subscription_tier: tier?.id || SubscriptionTier.SOLO,
        subscription_status: subscriptionInfo.status,
        subscription_expires_at: subscriptionInfo.currentPeriodEnd.toISOString(),
        trial_ends_at: subscriptionInfo.trialEnd?.toISOString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', metadata.organizationId);
  }

  console.log('[Webhook] Subscription updated successfully');
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Processing subscription deletion: ${subscription.id}`);

  const metadata = subscription.metadata || {};
  const supabase = getSupabaseAdmin();

  // Update subscription record
  await supabase.from('subscriptions').upsert({
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    user_id: metadata.userId || null,
    organization_id: metadata.organizationId || null,
    tier: SubscriptionTier.FREE,
    status: 'canceled',
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: null,
    cancel_at_period_end: true,
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Downgrade organization to free tier
  if (metadata.organizationId) {
    await supabase
      .from('organizations')
      .update({
        subscription_tier: SubscriptionTier.FREE,
        subscription_status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', metadata.organizationId);
  }

  console.log('[Webhook] Subscription canceled successfully');
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing payment succeeded: ${invoice.id}`);

  const supabase = getSupabaseAdmin();

  // Log billing event
  await supabase.from('billing_events').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string || null,
    event_type: 'payment_succeeded',
    amount: invoice.amount_paid,
    currency: invoice.currency,
    created_at: new Date().toISOString(),
  });

  console.log('[Webhook] Payment logged successfully');
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Processing payment failed: ${invoice.id}`);

  const supabase = getSupabaseAdmin();

  // Log billing event
  await supabase.from('billing_events').insert({
    stripe_invoice_id: invoice.id,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: invoice.subscription as string || null,
    event_type: 'payment_failed',
    amount: invoice.amount_due,
    currency: invoice.currency,
    created_at: new Date().toISOString(),
  });

  // Update subscription status if needed
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === 'past_due') {
      const metadata = subscription.metadata || {};
      if (metadata.organizationId) {
        await supabase
          .from('organizations')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', metadata.organizationId);
      }
    }
  }

  console.log('[Webhook] Payment failure logged');
}
