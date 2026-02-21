/**
 * Email Client Configuration for IncentEdge
 *
 * Uses Resend for transactional email delivery with React Email templates.
 * Provides typed interfaces and error handling for email operations.
 */

import { Resend } from 'resend';

// ============================================================================
// CONFIGURATION
// ============================================================================

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'IncentEdge <noreply@incentedge.com>';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Initialize Resend client (lazy initialization to handle missing API key gracefully)
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      throw new EmailConfigurationError('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

// ============================================================================
// TYPES
// ============================================================================

export type EmailTemplate =
  | 'welcome'
  | 'report-ready'
  | 'subscription-confirmed'
  | 'payment-failed';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface ReportReadyEmailData {
  userName: string;
  userEmail: string;
  projectId: string;
  projectName: string;
  incentivesFound: number;
  totalValue: number;
  directPayEligible: boolean;
  directPayValue?: number;
  reportUrl: string;
}

export interface SubscriptionConfirmedEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  planTier: 'starter' | 'professional' | 'team' | 'enterprise';
  features: string[];
  nextBillingDate?: string;
  amount?: number;
}

export interface PaymentFailedEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  failureReason?: string;
  updatePaymentUrl: string;
  supportEmail: string;
}

// Union type for all email data
export type EmailData =
  | { template: 'welcome'; data: WelcomeEmailData }
  | { template: 'report-ready'; data: ReportReadyEmailData }
  | { template: 'subscription-confirmed'; data: SubscriptionConfirmedEmailData }
  | { template: 'payment-failed'; data: PaymentFailedEmailData };

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class EmailError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'EmailError';
  }
}

export class EmailConfigurationError extends EmailError {
  constructor(message: string) {
    super(message, 'EMAIL_CONFIG_ERROR');
    this.name = 'EmailConfigurationError';
  }
}

export class EmailDeliveryError extends EmailError {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message, 'EMAIL_DELIVERY_ERROR');
    this.name = 'EmailDeliveryError';
  }
}

export class EmailValidationError extends EmailError {
  constructor(message: string) {
    super(message, 'EMAIL_VALIDATION_ERROR');
    this.name = 'EmailValidationError';
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validateEmails(emails: string | string[]): string[] {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  const validatedEmails: string[] = [];

  for (const email of emailArray) {
    const trimmed = email.trim().toLowerCase();
    if (!validateEmail(trimmed)) {
      throw new EmailValidationError(`Invalid email address: ${email}`);
    }
    validatedEmails.push(trimmed);
  }

  return validatedEmails;
}

// ============================================================================
// CORE EMAIL FUNCTIONS
// ============================================================================

/**
 * Send an email using Resend
 *
 * @param options - Email sending options
 * @returns Promise with send result
 *
 * @example
 * ```ts
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to IncentEdge',
 *   html: '<h1>Welcome!</h1>',
 * });
 * ```
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    // Validate recipients
    const validatedTo = validateEmails(options.to);

    // In development, log instead of sending if no API key
    if (!IS_PRODUCTION && !RESEND_API_KEY) {
      console.log('[EMAIL DEV] Would send email:', {
        to: validatedTo,
        subject: options.subject,
        preview: options.html.substring(0, 200),
      });
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    const client = getResendClient();

    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: validatedTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc ? validateEmails(options.cc) : undefined,
      bcc: options.bcc ? validateEmails(options.bcc) : undefined,
      tags: options.tags,
    });

    if (error) {
      console.error('[EMAIL] Send error:', error);
      throw new EmailDeliveryError(error.message, error);
    }

    console.log('[EMAIL] Successfully sent:', {
      messageId: data?.id,
      to: validatedTo,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    if (err instanceof EmailError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[EMAIL] Unexpected error:', err);
    throw new EmailDeliveryError(message, err);
  }
}

/**
 * Send a batch of emails (up to 100 at a time)
 *
 * @param emails - Array of email options
 * @returns Promise with results for each email
 */
export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  // Resend supports up to 100 emails per batch
  const BATCH_SIZE = 100;
  const results: SendEmailResult[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map((email) =>
      sendEmail(email).catch((err) => ({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for email display
 */
export function formatEmailCurrency(value: number): string {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

/**
 * Get the base URL for the application
 */
export function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ||
         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
         'http://localhost:3000';
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return !!RESEND_API_KEY;
}
