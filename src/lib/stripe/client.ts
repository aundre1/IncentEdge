/**
 * Stripe Client Wrapper
 *
 * Production-ready Stripe client with:
 * - Lazy initialization
 * - Mock mode for testing (when no API key)
 * - Type-safe API methods
 * - Comprehensive error handling
 * - Singleton pattern
 */

import Stripe from 'stripe';

/**
 * Mock Stripe client for testing and development
 * Returns safe mock responses when STRIPE_SECRET_KEY is not set
 */
class MockStripe {
  private mockMode = true;

  get checkout() {
    return {
      sessions: {
        create: async (params: Stripe.Checkout.SessionCreateParams) => {
          console.warn('[MockStripe] Creating mock checkout session:', params);
          return {
            id: `mock_cs_${Date.now()}`,
            url: `https://checkout.stripe.com/mock/${Date.now()}`,
            customer: params.customer || `mock_cus_${Date.now()}`,
            subscription: `mock_sub_${Date.now()}`,
            metadata: params.metadata,
          } as Stripe.Checkout.Session;
        },
        retrieve: async (id: string) => {
          console.warn('[MockStripe] Retrieving mock checkout session:', id);
          return {
            id,
            customer: `mock_cus_${Date.now()}`,
            subscription: `mock_sub_${Date.now()}`,
            payment_status: 'paid',
          } as Stripe.Checkout.Session;
        },
      },
    };
  }

  get customers() {
    return {
      create: async (params: Stripe.CustomerCreateParams) => {
        console.warn('[MockStripe] Creating mock customer:', params);
        return {
          id: `mock_cus_${Date.now()}`,
          email: params.email,
          metadata: params.metadata,
        } as Stripe.Customer;
      },
      retrieve: async (id: string) => {
        console.warn('[MockStripe] Retrieving mock customer:', id);
        return {
          id,
          email: 'mock@example.com',
          deleted: false,
        } as unknown as Stripe.Customer;
      },
      update: async (id: string, params: Stripe.CustomerUpdateParams) => {
        console.warn('[MockStripe] Updating mock customer:', id, params);
        return {
          id,
          metadata: params.metadata,
        } as Stripe.Customer;
      },
    };
  }

  get subscriptions() {
    return {
      create: async (params: Stripe.SubscriptionCreateParams) => {
        console.warn('[MockStripe] Creating mock subscription:', params);
        return this.createMockSubscription(params);
      },
      retrieve: async (id: string) => {
        console.warn('[MockStripe] Retrieving mock subscription:', id);
        return this.createMockSubscription({
          customer: `mock_cus_${Date.now()}`,
          items: [{ price: 'mock_price_solo' }],
        });
      },
      update: async (id: string, params: Stripe.SubscriptionUpdateParams) => {
        console.warn('[MockStripe] Updating mock subscription:', id, params);
        const sub = this.createMockSubscription({
          customer: `mock_cus_${Date.now()}`,
          items: [{ price: 'mock_price_solo' }],
          metadata: params.metadata,
        });
        return {
          ...sub,
          cancel_at_period_end: params.cancel_at_period_end ?? false,
        } as Stripe.Subscription;
      },
      cancel: async (id: string) => {
        console.warn('[MockStripe] Canceling mock subscription:', id);
        const sub = this.createMockSubscription({
          customer: `mock_cus_${Date.now()}`,
          items: [{ price: 'mock_price_solo' }],
        });
        return {
          ...sub,
          status: 'canceled',
          canceled_at: Math.floor(Date.now() / 1000),
        } as Stripe.Subscription;
      },
      list: async () => {
        console.warn('[MockStripe] Listing mock subscriptions');
        return {
          object: 'list' as const,
          data: [],
          has_more: false,
          url: '/v1/subscriptions',
        } as Stripe.ApiList<Stripe.Subscription>;
      },
    };
  }

  get invoices() {
    return {
      retrieveUpcoming: async (params: Stripe.InvoiceRetrieveUpcomingParams) => {
        console.warn('[MockStripe] Retrieving mock upcoming invoice:', params);
        return {
          object: 'invoice' as const,
          lines: { object: 'list' as const, data: [], has_more: false, url: '' },
          total: 0,
        } as unknown as Stripe.Invoice;
      },
    };
  }

  get billingPortal() {
    return {
      sessions: {
        create: async (params: Stripe.BillingPortal.SessionCreateParams) => {
          console.warn('[MockStripe] Creating mock billing portal session:', params);
          return {
            id: `mock_bps_${Date.now()}`,
            url: `https://billing.stripe.com/mock/${Date.now()}`,
            customer: params.customer,
            return_url: params.return_url,
          } as Stripe.BillingPortal.Session;
        },
      },
    };
  }

  get webhooks() {
    return {
      constructEvent: (payload: string, signature: string, secret: string) => {
        console.warn('[MockStripe] Constructing mock webhook event');
        throw new Error('Mock Stripe: Webhook verification not supported in mock mode');
      },
    };
  }

  private createMockSubscription(params: Partial<Stripe.SubscriptionCreateParams>): Stripe.Subscription {
    const now = Math.floor(Date.now() / 1000);
    const trialDays = (params as any).trial_period_days || 0;
    return {
      id: `mock_sub_${Date.now()}`,
      object: 'subscription',
      customer: params.customer as string,
      status: 'active',
      items: {
        object: 'list',
        data: [
          {
            id: `mock_si_${Date.now()}`,
            object: 'subscription_item',
            price: {
              id: (params.items?.[0] as { price: string })?.price || 'mock_price_solo',
              object: 'price',
              active: true,
              currency: 'usd',
              unit_amount: 850000,
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            } as Stripe.Price,
            quantity: 1,
          } as Stripe.SubscriptionItem,
        ],
        has_more: false,
        url: '/v1/subscription_items',
      },
      current_period_start: now,
      current_period_end: now + 30 * 24 * 60 * 60,
      cancel_at_period_end: false,
      canceled_at: null,
      trial_end: trialDays > 0 ? now + (trialDays * 24 * 60 * 60) : null,
      metadata: params.metadata || {},
    } as Stripe.Subscription;
  }
}

/**
 * Stripe client singleton instance
 */
let stripeInstance: Stripe | MockStripe | null = null;

/**
 * Initialize and return Stripe client
 * Uses mock mode when STRIPE_SECRET_KEY is not set
 *
 * @returns Stripe client instance
 */
export function getStripeClient(): Stripe | MockStripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    console.warn(
      '[Stripe] STRIPE_SECRET_KEY not found. Running in MOCK MODE. ' +
      'Set STRIPE_SECRET_KEY environment variable for production.'
    );
    stripeInstance = new MockStripe();
    return stripeInstance;
  }

  try {
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
      typescript: true,
      appInfo: {
        name: 'IncentEdge',
        version: '1.0.0',
        url: 'https://incentedge.com',
      },
    });

    console.log('[Stripe] Client initialized successfully');
    return stripeInstance;
  } catch (error) {
    console.error('[Stripe] Failed to initialize client:', error);
    throw new Error('Failed to initialize Stripe client');
  }
}

/**
 * Check if Stripe is running in mock mode
 *
 * @returns true if mock mode is active
 */
export function isStripeMockMode(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

/**
 * Reset Stripe client instance
 * Useful for testing
 */
export function resetStripeClient(): void {
  stripeInstance = null;
}

/**
 * Stripe error types
 */
export enum StripeErrorType {
  API_ERROR = 'StripeAPIError',
  AUTHENTICATION_ERROR = 'StripeAuthenticationError',
  CARD_ERROR = 'StripeCardError',
  INVALID_REQUEST_ERROR = 'StripeInvalidRequestError',
  RATE_LIMIT_ERROR = 'StripeRateLimitError',
  VALIDATION_ERROR = 'StripeValidationError',
  UNKNOWN_ERROR = 'StripeUnknownError',
}

/**
 * Custom error class for Stripe operations
 */
export class StripeError extends Error {
  public type: StripeErrorType;
  public code?: string;
  public statusCode?: number;

  constructor(
    message: string,
    type: StripeErrorType = StripeErrorType.UNKNOWN_ERROR,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'StripeError';
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Handle and normalize Stripe errors
 *
 * @param error - Error from Stripe operation
 * @returns Normalized StripeError
 */
export function handleStripeError(error: unknown): StripeError {
  if (error instanceof StripeError) {
    return error;
  }

  if (error instanceof Error) {
    // Check if it's a Stripe error
    const stripeError = error as unknown as Stripe.StripeRawError;

    if (stripeError.type) {
      const typeMap: Record<string, StripeErrorType> = {
        'StripeAPIError': StripeErrorType.API_ERROR,
        'StripeAuthenticationError': StripeErrorType.AUTHENTICATION_ERROR,
        'StripeCardError': StripeErrorType.CARD_ERROR,
        'StripeInvalidRequestError': StripeErrorType.INVALID_REQUEST_ERROR,
        'StripeRateLimitError': StripeErrorType.RATE_LIMIT_ERROR,
      };

      return new StripeError(
        stripeError.message || 'Unknown Stripe error',
        typeMap[stripeError.type] || StripeErrorType.UNKNOWN_ERROR,
        stripeError.code,
        stripeError.statusCode
      );
    }

    // Generic error
    return new StripeError(error.message, StripeErrorType.UNKNOWN_ERROR);
  }

  // Unknown error type
  return new StripeError('An unknown error occurred', StripeErrorType.UNKNOWN_ERROR);
}

/**
 * Type guard to check if error is a Stripe error
 */
export function isStripeError(error: unknown): error is StripeError {
  return error instanceof StripeError;
}

// Default export for backwards compatibility
export default getStripeClient;
