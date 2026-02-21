-- Migration: 011_stripe_subscriptions.sql
-- Description: Add Stripe subscription and billing tables
-- Created: 2026-01-19
-- Author: IncentEdge Team

-- =============================================================================
-- SUBSCRIPTIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Stripe identifiers
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,

    -- IncentEdge references
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

    -- Subscription details
    tier VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive' CHECK (status IN (
        'active', 'past_due', 'canceled', 'trialing',
        'incomplete', 'incomplete_expired', 'unpaid', 'paused', 'inactive'
    )),

    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
    ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id
    ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
    ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier
    ON public.subscriptions(tier);

-- =============================================================================
-- BILLING EVENTS TABLE (for audit trail)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Stripe identifiers
    stripe_invoice_id VARCHAR(255),
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255),

    -- Event details
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'payment_succeeded', 'payment_failed',
        'subscription_created', 'subscription_updated', 'subscription_canceled',
        'invoice_created', 'invoice_finalized',
        'refund_created', 'refund_failed'
    )),

    -- Financial details
    amount INTEGER, -- Amount in cents
    currency VARCHAR(3) DEFAULT 'usd',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_customer_id
    ON public.billing_events(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_stripe_subscription_id
    ON public.billing_events(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type
    ON public.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at
    ON public.billing_events(created_at DESC);

-- =============================================================================
-- ADD STRIPE COLUMNS TO ORGANIZATIONS TABLE
-- =============================================================================

-- Add Stripe-related columns to organizations if they don't exist
DO $$
BEGIN
    -- Add stripe_customer_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN stripe_customer_id VARCHAR(255);

        CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id
            ON public.organizations(stripe_customer_id);
    END IF;

    -- Add stripe_subscription_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN stripe_subscription_id VARCHAR(255);
    END IF;

    -- Add subscription_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'subscription_status'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'inactive';
    END IF;

    -- Add trial_ends_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organizations'
        AND column_name = 'trial_ends_at'
    ) THEN
        ALTER TABLE public.organizations
        ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own organization's subscriptions
CREATE POLICY "Users can view own organization subscriptions"
    ON public.subscriptions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM public.profiles
            WHERE id = auth.uid()
        )
    );

-- Policy: Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable RLS on billing_events table
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage all billing events
CREATE POLICY "Service role can manage billing events"
    ON public.billing_events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Admin users can view their organization's billing events
CREATE POLICY "Admins can view organization billing events"
    ON public.billing_events FOR SELECT
    USING (
        stripe_customer_id IN (
            SELECT stripe_customer_id FROM public.organizations
            WHERE id IN (
                SELECT organization_id FROM public.profiles
                WHERE id = auth.uid() AND role IN ('admin', 'owner')
            )
        )
    );

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update updated_at timestamp on subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get active subscription for an organization
CREATE OR REPLACE FUNCTION get_organization_subscription(org_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    tier VARCHAR(50),
    status VARCHAR(50),
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.tier,
        s.status,
        s.current_period_end,
        s.trial_end,
        s.cancel_at_period_end
    FROM public.subscriptions s
    WHERE s.organization_id = org_id
    AND s.status IN ('active', 'trialing', 'past_due')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if organization has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(org_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    active_sub BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE organization_id = org_id
        AND status IN ('active', 'trialing')
        AND (current_period_end IS NULL OR current_period_end > NOW())
    ) INTO active_sub;

    RETURN active_sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription tier for an organization
CREATE OR REPLACE FUNCTION get_subscription_tier(org_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    tier_name VARCHAR(50);
BEGIN
    SELECT tier INTO tier_name
    FROM public.subscriptions
    WHERE organization_id = org_id
    AND status IN ('active', 'trialing')
    ORDER BY created_at DESC
    LIMIT 1;

    RETURN COALESCE(tier_name, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records linked to organizations';
COMMENT ON TABLE public.billing_events IS 'Audit trail for all billing-related events';

COMMENT ON COLUMN public.subscriptions.tier IS 'Subscription tier: free, starter, pro, enterprise';
COMMENT ON COLUMN public.subscriptions.status IS 'Stripe subscription status';
COMMENT ON COLUMN public.subscriptions.current_period_end IS 'When the current billing period ends';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'If true, subscription will not renew';

COMMENT ON COLUMN public.billing_events.amount IS 'Amount in cents (e.g., 29900 = $299.00)';
COMMENT ON COLUMN public.billing_events.event_type IS 'Type of billing event for audit purposes';
