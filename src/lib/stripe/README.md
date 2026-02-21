# Stripe Integration

Production-ready Stripe subscription integration for IncentEdge.

## Features

- Full subscription lifecycle management
- Mock mode for testing (works without API keys)
- TypeScript strict mode
- Comprehensive error handling
- Next.js 14 App Router integration
- Webhook handling for subscription events
- Customer portal for self-service billing

## Directory Structure

```
stripe/
├── client.ts              # Stripe client wrapper with mock mode
├── products.ts            # Product tier definitions
├── subscriptions.ts       # Subscription management
├── index.ts              # Centralized exports
└── README.md             # This file
```

## Pricing Tiers

### Solo - $8,500/month
- 10 active projects
- Unlimited analyses
- AI-powered recommendations
- API access (10K req/month)
- 1 team member

### Team - $18,000/month
- Unlimited projects
- Advanced features
- 10 team members
- API access (100K req/month)
- Custom integrations

### Enterprise - $35,000/month
- Everything in Team
- Unlimited team members
- Dedicated support
- SLA guarantees
- On-premise option

## Setup

### 1. Environment Variables

Add to `.env.local`:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_SOLO_PRICE_ID=price_...
STRIPE_SOLO_ANNUAL_PRICE_ID=price_...
STRIPE_TEAM_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
```

### 2. Create Products in Stripe

1. Go to Stripe Dashboard > Products
2. Create three products:
   - **Solo**: $8,500/month, $91,800/year
   - **Team**: $18,000/month, $194,400/year
   - **Enterprise**: $35,000/month, $378,000/year
3. Copy the Price IDs to your `.env.local`

### 3. Configure Webhooks

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Usage

### Basic Checkout

```tsx
import { CheckoutButton } from '@/components/pricing/CheckoutButton';
import { SOLO_TIER } from '@/lib/stripe/products';

export function PricingPage() {
  return (
    <CheckoutButton
      priceId={SOLO_TIER.stripePriceId}
      tier={SOLO_TIER.id}
    >
      Subscribe to Solo
    </CheckoutButton>
  );
}
```

### Pricing Table

```tsx
import { PricingTable } from '@/components/pricing/PricingTable';

export function PricingPage() {
  return (
    <PricingTable
      showAnnualToggle={true}
      onTierSelect={(tier, interval) => {
        console.log('Selected:', tier, interval);
      }}
    />
  );
}
```

### Subscription Hook

```tsx
import { useSubscription } from '@/hooks/useSubscription';

export function Dashboard() {
  const { subscription, isActive, isLoading } = useSubscription();

  if (isLoading) return <div>Loading...</div>;
  if (!isActive) return <div>No active subscription</div>;

  return (
    <div>
      <h1>Current Plan: {subscription.tier}</h1>
      <p>Status: {subscription.status}</p>
    </div>
  );
}
```

### Manage Billing

```tsx
import { ManageBillingButton } from '@/components/pricing/CheckoutButton';

export function BillingSettings() {
  return (
    <ManageBillingButton>
      Manage Subscription
    </ManageBillingButton>
  );
}
```

### Server-Side Subscription Management

```tsx
import {
  createSubscription,
  updateSubscription,
  cancelSubscription,
} from '@/lib/stripe/subscriptions';

// Create subscription
const subscription = await createSubscription({
  customerId: 'cus_123',
  priceId: 'price_solo_monthly',
  trialDays: 14,
});

// Update subscription (tier change)
await updateSubscription(subscription.id, {
  priceId: 'price_team_monthly',
});

// Cancel subscription
await cancelSubscription(subscription.id, {
  immediately: false,
  reason: 'Customer request',
});
```

## Mock Mode

The integration works in mock mode when `STRIPE_SECRET_KEY` is not set. This is useful for:

- Development without Stripe account
- Testing subscription flows
- CI/CD pipelines

Mock mode returns realistic responses but doesn't make actual Stripe API calls.

```typescript
import { isStripeMockMode } from '@/lib/stripe/client';

if (isStripeMockMode()) {
  console.log('Running in mock mode');
}
```

## Testing

Run tests with:

```bash
npm test tests/lib/stripe.test.ts
```

Tests cover:
- Stripe client initialization
- Product tier management
- Subscription lifecycle
- Error handling
- Mock mode functionality

## API Routes

### Create Checkout Session
`POST /api/stripe/create-checkout`

```json
{
  "priceId": "price_solo_monthly",
  "trialDays": 14,
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

### Create Portal Session
`POST /api/stripe/portal`

```json
{
  "returnUrl": "https://app.com/settings"
}
```

### Webhook Handler
`POST /api/stripe/webhook`

Automatically processes Stripe webhook events.

## Database Schema

Required tables:

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table additions
ALTER TABLE organizations ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE organizations ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE organizations ADD COLUMN subscription_status TEXT;
ALTER TABLE organizations ADD COLUMN subscription_expires_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMPTZ;

-- Billing events table
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_invoice_id TEXT NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  event_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security

- Webhook signatures are verified
- All API routes require authentication (except webhook)
- Sensitive data is stored server-side only
- No API keys exposed to client
- RLS policies protect subscription data

## Error Handling

All Stripe operations use comprehensive error handling:

```typescript
import { handleStripeError, StripeErrorType } from '@/lib/stripe/client';

try {
  await createSubscription(params);
} catch (error) {
  const stripeError = handleStripeError(error);

  switch (stripeError.type) {
    case StripeErrorType.CARD_ERROR:
      // Handle card error
      break;
    case StripeErrorType.RATE_LIMIT_ERROR:
      // Handle rate limit
      break;
    default:
      // Handle other errors
  }
}
```

## Support

For issues or questions:
- Check [Stripe documentation](https://stripe.com/docs)
- Review test suite for examples
- Contact development team

## License

Proprietary - IncentEdge 2026
