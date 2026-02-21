/**
 * Email Send API Endpoint
 *
 * POST /api/email/send
 *
 * Sends transactional emails using Resend with React Email templates.
 * Includes input validation and rate limiting considerations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { render } from '@react-email/components';

import {
  sendEmail,
  EmailTemplate,
  EmailError,
  isEmailServiceConfigured,
  formatEmailCurrency,
  getAppBaseUrl,
} from '@/lib/email';
import { handleApiError, forbiddenError, unauthorizedError } from '@/lib/error-handler';
import { rateLimiter, getEndpointType, getTierFromSubscription } from '@/lib/rate-limiter';
import { createClient } from '@/lib/supabase/server';

// Import email templates
import WelcomeEmail from '@/emails/welcome';
import ReportReadyEmail from '@/emails/report-ready';
import SubscriptionConfirmedEmail from '@/emails/subscription-confirmed';
import PaymentFailedEmail from '@/emails/payment-failed';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const emailBaseSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
});

const welcomeDataSchema = z.object({
  userName: z.string().min(1),
  userEmail: z.string().email().optional(),
});

const reportReadyDataSchema = z.object({
  userName: z.string().min(1),
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  incentivesFound: z.number().int().positive(),
  totalValue: z.number().positive(),
  directPayEligible: z.boolean(),
  directPayValue: z.number().optional(),
  reportUrl: z.string().url().optional(),
});

const subscriptionConfirmedDataSchema = z.object({
  userName: z.string().min(1),
  planName: z.string().min(1),
  planTier: z.enum(['starter', 'professional', 'team', 'enterprise']),
  features: z.array(z.string()).optional(),
  nextBillingDate: z.string().optional(),
  amount: z.number().positive().optional(),
});

const paymentFailedDataSchema = z.object({
  userName: z.string().min(1),
  planName: z.string().min(1),
  failureReason: z.string().optional(),
  updatePaymentUrl: z.string().url().optional(),
  supportEmail: z.string().email().optional(),
});

const sendEmailRequestSchema = z.discriminatedUnion('template', [
  emailBaseSchema.extend({
    template: z.literal('welcome'),
    data: welcomeDataSchema,
  }),
  emailBaseSchema.extend({
    template: z.literal('report-ready'),
    data: reportReadyDataSchema,
  }),
  emailBaseSchema.extend({
    template: z.literal('subscription-confirmed'),
    data: subscriptionConfirmedDataSchema,
  }),
  emailBaseSchema.extend({
    template: z.literal('payment-failed'),
    data: paymentFailedDataSchema,
  }),
]);

type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>;

// ============================================================================
// TEMPLATE RENDERING
// ============================================================================

interface RenderedEmail {
  subject: string;
  html: string;
}

async function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, unknown>
): Promise<RenderedEmail> {
  switch (template) {
    case 'welcome': {
      const props = data as { userName: string };
      const html = await render(WelcomeEmail(props));
      return {
        subject: 'Welcome to IncentEdge',
        html,
      };
    }

    case 'report-ready': {
      const props = data as {
        userName: string;
        projectName: string;
        projectId: string;
        incentivesFound: number;
        totalValue: number;
        directPayEligible: boolean;
        directPayValue?: number;
        reportUrl?: string;
      };
      const html = await render(ReportReadyEmail(props));
      return {
        subject: `Your Incentive Analysis is Ready - ${props.projectName}`,
        html,
      };
    }

    case 'subscription-confirmed': {
      const props = data as {
        userName: string;
        planName: string;
        planTier: 'starter' | 'professional' | 'team' | 'enterprise';
        features?: string[];
        nextBillingDate?: string;
        amount?: number;
      };
      const html = await render(SubscriptionConfirmedEmail(props));
      return {
        subject: `Welcome to IncentEdge ${props.planName}`,
        html,
      };
    }

    case 'payment-failed': {
      const props = data as {
        userName: string;
        planName: string;
        failureReason?: string;
        updatePaymentUrl?: string;
        supportEmail?: string;
      };
      const html = await render(PaymentFailedEmail(props));
      return {
        subject: 'Action Required: Payment Failed',
        html,
      };
    }

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function POST(request: NextRequest) {
  const context = { route: '/api/email/send', method: 'POST' };

  try {
    // Check if email service is configured
    if (!isEmailServiceConfigured()) {
      // In development, allow emails to be "sent" (logged)
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[EMAIL API] Email service not configured, running in development mode');
      } else {
        return NextResponse.json(
          { error: 'Email service is not configured' },
          { status: 503 }
        );
      }
    }

    // Get user for authentication and rate limiting
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // For internal system calls, we might want to allow unauthenticated requests
    // with a server-side secret. For now, require authentication.
    if (authError || !user) {
      return unauthorizedError(context);
    }

    // Get user's organization for rate limiting tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    let subscriptionTier: string | undefined;
    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_tier')
        .eq('id', profile.organization_id)
        .single();
      subscriptionTier = org?.subscription_tier;
    }

    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = rateLimiter.checkLimit({
      key: `email:${user.id}:${clientIp}`,
      tier: getTierFromSubscription(subscriptionTier),
      endpointType: getEndpointType('POST'),
      cost: 5, // Email sending costs more rate limit tokens
    });

    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many email requests. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimiter.getHeaders(rateLimitResult),
          },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = sendEmailRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { to, template, data } = validationResult.data;

    // Render the email template
    const { subject, html } = await renderEmailTemplate(template, data);

    // Send the email
    const result = await sendEmail({
      to,
      subject,
      html,
      tags: [
        { name: 'template', value: template },
        { name: 'user_id', value: user.id },
      ],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the email send for analytics
    console.log('[EMAIL API] Email sent:', {
      messageId: result.messageId,
      template,
      to: Array.isArray(to) ? to.length + ' recipients' : to,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
      },
      {
        status: 200,
        headers: rateLimiter.getHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    if (error instanceof EmailError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return handleApiError(error, context);
  }
}

// Provide OpenAPI documentation
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
