/**
 * Email Trigger Helper Functions
 *
 * Provides convenient functions to send emails at key moments in the user journey.
 * These functions render React Email templates and send via Resend.
 */

import { render } from '@react-email/components';
import {
  sendEmail,
  SendEmailResult,
  WelcomeEmailData,
  ReportReadyEmailData,
  SubscriptionConfirmedEmailData,
  PaymentFailedEmailData,
  formatEmailCurrency,
  getAppBaseUrl,
  isEmailServiceConfigured,
} from './email';

// Import email templates
import WelcomeEmail from '@/emails/welcome';
import ReportReadyEmail from '@/emails/report-ready';
import SubscriptionConfirmedEmail from '@/emails/subscription-confirmed';
import PaymentFailedEmail from '@/emails/payment-failed';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  name?: string | null;
}

export interface Project {
  id: string;
  name: string;
}

export interface AnalysisResult {
  incentivesFound: number;
  totalValue: number;
  directPayEligible: boolean;
  directPayValue?: number;
}

export interface SubscriptionPlan {
  name: string;
  tier: 'starter' | 'professional' | 'team' | 'enterprise';
  features?: string[];
  nextBillingDate?: string;
  amount?: number;
}

// ============================================================================
// DEFAULT PLAN FEATURES
// ============================================================================

const DEFAULT_PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    'Up to 5 projects',
    'Basic incentive matching',
    'PDF report exports',
    'Email support',
  ],
  professional: [
    'Unlimited projects',
    'AI-powered incentive matching',
    'PDF report generation',
    'Direct Pay eligibility checking',
    'Priority email support',
  ],
  team: [
    'Everything in Professional',
    'Team collaboration features',
    'Role-based access control',
    'Shared project portfolios',
    'Dedicated account manager',
  ],
  enterprise: [
    'Everything in Team',
    'Custom integrations',
    'API access',
    'SSO/SAML authentication',
    'White-glove onboarding',
    '24/7 phone support',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getUserName(user: User): string {
  return user.full_name || user.name || user.email.split('@')[0] || 'there';
}

// ============================================================================
// EMAIL TRIGGER FUNCTIONS
// ============================================================================

/**
 * Send welcome email to a new user
 *
 * @param user - User object with email and optional name
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * // After user signup
 * await sendWelcomeEmail({
 *   id: 'user-123',
 *   email: 'user@example.com',
 *   full_name: 'John Doe',
 * });
 * ```
 */
export async function sendWelcomeEmail(user: User): Promise<SendEmailResult> {
  const userName = getUserName(user);

  try {
    const html = await render(WelcomeEmail({ userName }));

    return await sendEmail({
      to: user.email,
      subject: 'Welcome to IncentEdge',
      html,
      tags: [
        { name: 'template', value: 'welcome' },
        { name: 'user_id', value: user.id },
      ],
    });
  } catch (error) {
    console.error('[EMAIL TRIGGER] Failed to send welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

/**
 * Send report ready email when an analysis is complete
 *
 * @param user - User object
 * @param project - Project that was analyzed
 * @param analysis - Analysis results
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * // After analysis completes
 * await sendReportReadyEmail(
 *   user,
 *   { id: 'proj-123', name: 'Mount Vernon Mixed-Use' },
 *   { incentivesFound: 48, totalValue: 252200000, directPayEligible: true, directPayValue: 88000000 }
 * );
 * ```
 */
export async function sendReportReadyEmail(
  user: User,
  project: Project,
  analysis: AnalysisResult
): Promise<SendEmailResult> {
  const userName = getUserName(user);
  const baseUrl = getAppBaseUrl();
  const reportUrl = `${baseUrl}/projects/${project.id}/report?source=email`;

  try {
    const html = await render(
      ReportReadyEmail({
        userName,
        projectId: project.id,
        projectName: project.name,
        incentivesFound: analysis.incentivesFound,
        totalValue: analysis.totalValue,
        directPayEligible: analysis.directPayEligible,
        directPayValue: analysis.directPayValue,
        reportUrl,
      })
    );

    return await sendEmail({
      to: user.email,
      subject: `Your Incentive Analysis is Ready - ${project.name}`,
      html,
      tags: [
        { name: 'template', value: 'report-ready' },
        { name: 'user_id', value: user.id },
        { name: 'project_id', value: project.id },
      ],
    });
  } catch (error) {
    console.error('[EMAIL TRIGGER] Failed to send report ready email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send report ready email',
    };
  }
}

/**
 * Send subscription confirmed email after successful payment
 *
 * @param user - User object
 * @param plan - Subscription plan details
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * // After successful payment
 * await sendSubscriptionConfirmedEmail(
 *   user,
 *   { name: 'Professional', tier: 'professional', amount: 299 }
 * );
 * ```
 */
export async function sendSubscriptionConfirmedEmail(
  user: User,
  plan: SubscriptionPlan
): Promise<SendEmailResult> {
  const userName = getUserName(user);
  const features = plan.features || DEFAULT_PLAN_FEATURES[plan.tier] || [];

  try {
    const html = await render(
      SubscriptionConfirmedEmail({
        userName,
        planName: plan.name,
        planTier: plan.tier,
        features,
        nextBillingDate: plan.nextBillingDate,
        amount: plan.amount,
      })
    );

    return await sendEmail({
      to: user.email,
      subject: `Welcome to IncentEdge ${plan.name}`,
      html,
      tags: [
        { name: 'template', value: 'subscription-confirmed' },
        { name: 'user_id', value: user.id },
        { name: 'plan', value: plan.tier },
      ],
    });
  } catch (error) {
    console.error('[EMAIL TRIGGER] Failed to send subscription confirmed email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send subscription confirmed email',
    };
  }
}

/**
 * Send payment failed email when a subscription payment fails
 *
 * @param user - User object
 * @param options - Additional options (plan name, failure reason)
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * // After payment failure webhook
 * await sendPaymentFailedEmail(user, {
 *   planName: 'Professional',
 *   failureReason: 'Card declined',
 * });
 * ```
 */
export async function sendPaymentFailedEmail(
  user: User,
  options?: {
    planName?: string;
    failureReason?: string;
  }
): Promise<SendEmailResult> {
  const userName = getUserName(user);
  const baseUrl = getAppBaseUrl();
  const updatePaymentUrl = `${baseUrl}/account/billing?source=payment-failed-email`;
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@incentedge.com';

  try {
    const html = await render(
      PaymentFailedEmail({
        userName,
        planName: options?.planName || 'your subscription',
        failureReason: options?.failureReason,
        updatePaymentUrl,
        supportEmail,
      })
    );

    return await sendEmail({
      to: user.email,
      subject: 'Action Required: Payment Failed',
      html,
      tags: [
        { name: 'template', value: 'payment-failed' },
        { name: 'user_id', value: user.id },
      ],
    });
  } catch (error) {
    console.error('[EMAIL TRIGGER] Failed to send payment failed email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send payment failed email',
    };
  }
}

// ============================================================================
// BATCH EMAIL FUNCTIONS
// ============================================================================

/**
 * Send welcome emails to multiple users (for bulk imports)
 *
 * @param users - Array of user objects
 * @returns Promise with results for each user
 */
export async function sendBulkWelcomeEmails(
  users: User[]
): Promise<Map<string, SendEmailResult>> {
  const results = new Map<string, SendEmailResult>();

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (user) => {
      const result = await sendWelcomeEmail(user);
      results.set(user.id, result);
    });

    await Promise.all(batchPromises);

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < users.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  isEmailServiceConfigured,
  formatEmailCurrency,
  getAppBaseUrl,
};
