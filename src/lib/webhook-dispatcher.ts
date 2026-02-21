/**
 * Webhook Dispatcher for IncentEdge
 *
 * Handles webhook event dispatching with:
 * - Event types and payload formatting
 * - Signature verification (HMAC-SHA256)
 * - Retry logic with exponential backoff
 * - Event filtering based on webhook configuration
 */

import { createHmac } from 'crypto';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// EVENT TYPES
// ============================================================================

export const WebhookEventTypes = {
  // Project events
  'project.created': 'project.created',
  'project.updated': 'project.updated',
  'project.deleted': 'project.deleted',
  'project.status_changed': 'project.status_changed',
  'project.archived': 'project.archived',

  // Eligibility events
  'eligibility.scan_completed': 'eligibility.scan_completed',
  'eligibility.new_match': 'eligibility.new_match',
  'eligibility.match_updated': 'eligibility.match_updated',
  'eligibility.match_expired': 'eligibility.match_expired',

  // Application events
  'application.created': 'application.created',
  'application.submitted': 'application.submitted',
  'application.status_changed': 'application.status_changed',
  'application.approved': 'application.approved',
  'application.rejected': 'application.rejected',
  'application.document_added': 'application.document_added',

  // Deadline events
  'deadline.approaching': 'deadline.approaching',
  'deadline.today': 'deadline.today',
  'deadline.passed': 'deadline.passed',

  // Incentive program events
  'program.new_available': 'program.new_available',
  'program.updated': 'program.updated',
  'program.expiring': 'program.expiring',
  'program.expired': 'program.expired',

  // Document events
  'document.uploaded': 'document.uploaded',
  'document.processed': 'document.processed',
  'document.ai_extracted': 'document.ai_extracted',

  // Cost estimation events
  'cost_estimate.generated': 'cost_estimate.generated',
  'cost_estimate.updated': 'cost_estimate.updated',

  // Integration events
  'integration.connected': 'integration.connected',
  'integration.disconnected': 'integration.disconnected',
  'integration.sync_completed': 'integration.sync_completed',
  'integration.sync_failed': 'integration.sync_failed',

  // System events
  'webhook.test': 'webhook.test',
} as const;

export type WebhookEventType = keyof typeof WebhookEventTypes;

// ============================================================================
// PAYLOAD TYPES
// ============================================================================

export interface WebhookPayload<T = unknown> {
  id: string; // Unique event ID
  event: WebhookEventType;
  created_at: string;
  organization_id: string;
  api_version: string;
  data: T;
  metadata?: {
    user_id?: string;
    user_email?: string;
    ip_address?: string;
    triggered_by?: string;
  };
}

export interface ProjectEventData {
  project_id: string;
  project_name: string;
  previous_status?: string;
  current_status?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export interface ApplicationEventData {
  application_id: string;
  project_id: string;
  project_name: string;
  incentive_program_id: string;
  program_name: string;
  previous_status?: string;
  current_status?: string;
  amount_requested?: number;
  amount_approved?: number;
}

export interface DeadlineEventData {
  project_id: string;
  project_name: string;
  application_id?: string;
  incentive_program_id: string;
  program_name: string;
  deadline: string;
  days_remaining: number;
}

export interface EligibilityEventData {
  project_id: string;
  project_name: string;
  matches_count: number;
  total_potential_value: number;
  new_matches?: Array<{
    incentive_program_id: string;
    program_name: string;
    estimated_value: number;
    match_score: number;
  }>;
}

// ============================================================================
// SIGNATURE VERIFICATION
// ============================================================================

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signaturePayload)
    .digest('hex');
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Verify incoming webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  tolerance: number = 300 // 5 minutes
): { valid: boolean; error?: string } {
  try {
    // Parse signature
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith('v1='));

    if (!timestampPart || !signaturePart) {
      return { valid: false, error: 'Invalid signature format' };
    }

    const timestamp = parseInt(timestampPart.substring(2), 10);
    const receivedSignature = signaturePart.substring(3);

    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      return { valid: false, error: 'Timestamp outside tolerance' };
    }

    // Compute expected signature
    const signaturePayload = `${timestamp}.${payload}`;
    const expectedSignature = createHmac('sha256', secret)
      .update(signaturePayload)
      .digest('hex');

    // Timing-safe comparison
    const receivedBuffer = Buffer.from(receivedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (receivedBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Signature mismatch' };
    }

    let result = 0;
    for (let i = 0; i < receivedBuffer.length; i++) {
      result |= receivedBuffer[i] ^ expectedBuffer[i];
    }

    if (result !== 0) {
      return { valid: false, error: 'Signature mismatch' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Signature verification failed' };
  }
}

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 3600000, // 1 hour
  backoffMultiplier: 2,
};

/**
 * Calculate next retry delay with exponential backoff and jitter
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  // Exponential backoff: baseDelay * multiplier^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attemptNumber);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Add jitter (0-25% of delay) to prevent thundering herd
  const jitter = cappedDelay * 0.25 * Math.random();

  return Math.floor(cappedDelay + jitter);
}

// ============================================================================
// EVENT FILTERING
// ============================================================================

export interface WebhookFilters {
  project_ids?: string[];
  application_ids?: string[];
  incentive_program_ids?: string[];
  statuses?: string[];
  sectors?: string[];
  states?: string[];
  min_value?: number;
  max_value?: number;
}

/**
 * Check if event passes webhook filters
 */
export function eventPassesFilters(
  eventData: Record<string, unknown>,
  filters: WebhookFilters
): boolean {
  // No filters = allow all
  if (!filters || Object.keys(filters).length === 0) {
    return true;
  }

  // Check project_ids filter
  if (filters.project_ids && filters.project_ids.length > 0) {
    const projectId = eventData.project_id as string;
    if (!projectId || !filters.project_ids.includes(projectId)) {
      return false;
    }
  }

  // Check application_ids filter
  if (filters.application_ids && filters.application_ids.length > 0) {
    const applicationId = eventData.application_id as string;
    if (!applicationId || !filters.application_ids.includes(applicationId)) {
      return false;
    }
  }

  // Check incentive_program_ids filter
  if (filters.incentive_program_ids && filters.incentive_program_ids.length > 0) {
    const programId = eventData.incentive_program_id as string;
    if (!programId || !filters.incentive_program_ids.includes(programId)) {
      return false;
    }
  }

  // Check statuses filter
  if (filters.statuses && filters.statuses.length > 0) {
    const status = (eventData.current_status || eventData.status) as string;
    if (!status || !filters.statuses.includes(status)) {
      return false;
    }
  }

  // Check value filters
  const value = eventData.estimated_value as number || eventData.amount_requested as number;
  if (value !== undefined) {
    if (filters.min_value !== undefined && value < filters.min_value) {
      return false;
    }
    if (filters.max_value !== undefined && value > filters.max_value) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// WEBHOOK DISPATCHER CLASS
// ============================================================================

export interface DispatchOptions {
  projectId?: string;
  applicationId?: string;
  incentiveProgramId?: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  immediate?: boolean; // Skip queue and dispatch immediately
}

export interface DispatchResult {
  eventId: string;
  webhookEventsCreated: number;
  errors: string[];
}

export class WebhookDispatcher {
  private static API_VERSION = '2026-01-01';

  /**
   * Generate a unique event ID
   */
  private static generateEventId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `evt_${timestamp}${randomPart}`;
  }

  /**
   * Format webhook payload
   */
  static formatPayload<T>(
    event: WebhookEventType,
    data: T,
    organizationId: string,
    options: DispatchOptions = {}
  ): WebhookPayload<T> {
    return {
      id: this.generateEventId(),
      event,
      created_at: new Date().toISOString(),
      organization_id: organizationId,
      api_version: this.API_VERSION,
      data,
      metadata: {
        user_id: options.userId,
        user_email: options.userEmail,
        ip_address: options.ipAddress,
        triggered_by: options.immediate ? 'immediate' : 'queue',
      },
    };
  }

  /**
   * Dispatch a webhook event
   */
  static async dispatch<T>(
    event: WebhookEventType,
    data: T,
    organizationId: string,
    options: DispatchOptions = {}
  ): Promise<DispatchResult> {
    const supabase = await createClient();
    const errors: string[] = [];
    let webhookEventsCreated = 0;

    // Format payload
    const payload = this.formatPayload(event, data, organizationId, options);

    try {
      // Find all active webhooks for this organization that subscribe to this event
      const { data: webhooks, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .contains('events', [event]);

      if (webhooksError) {
        errors.push(`Failed to fetch webhooks: ${webhooksError.message}`);
        return { eventId: payload.id, webhookEventsCreated, errors };
      }

      if (!webhooks || webhooks.length === 0) {
        return { eventId: payload.id, webhookEventsCreated, errors };
      }

      // Queue event for each matching webhook
      for (const webhook of webhooks) {
        try {
          // Check filters
          if (webhook.event_filters && Object.keys(webhook.event_filters).length > 0) {
            if (!eventPassesFilters(data as Record<string, unknown>, webhook.event_filters)) {
              continue; // Skip this webhook
            }
          }

          const payloadString = JSON.stringify(payload);

          // Create webhook event record
          const { error: insertError } = await supabase
            .from('webhook_events')
            .insert({
              webhook_id: webhook.id,
              organization_id: organizationId,
              event_type: event,
              event_id: payload.id,
              project_id: options.projectId,
              application_id: options.applicationId,
              incentive_program_id: options.incentiveProgramId,
              payload,
              payload_hash: Buffer.from(payloadString).toString('base64').substring(0, 64),
              status: options.immediate ? 'sending' : 'pending',
              request_url: webhook.url,
              max_attempts: webhook.max_retries + 1,
              scheduled_at: new Date().toISOString(),
            });

          if (insertError) {
            errors.push(`Failed to queue event for webhook ${webhook.id}: ${insertError.message}`);
            continue;
          }

          webhookEventsCreated++;

          // If immediate dispatch requested, send now
          if (options.immediate) {
            await this.sendWebhookEvent(webhook, payload);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error processing webhook ${webhook.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Dispatch error: ${errorMessage}`);
    }

    return { eventId: payload.id, webhookEventsCreated, errors };
  }

  /**
   * Send a webhook event immediately
   */
  private static async sendWebhookEvent<T>(
    webhook: {
      id: string;
      url: string;
      secret: string;
      custom_headers?: Record<string, string>;
    },
    payload: WebhookPayload<T>
  ): Promise<{ success: boolean; statusCode?: number; error?: string }> {
    const supabase = await createClient();
    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, webhook.secret);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'IncentEdge-Webhook/1.0',
      'X-IncentEdge-Signature': signature,
      'X-IncentEdge-Event': payload.event,
      'X-IncentEdge-Delivery': payload.id,
      ...(webhook.custom_headers || {}),
    };

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();

      // Update webhook event with result
      await supabase
        .from('webhook_events')
        .update({
          status: response.ok ? 'delivered' : 'failed',
          response_status_code: response.status,
          response_headers: Object.fromEntries(response.headers.entries()),
          response_body: responseBody.substring(0, 10000),
          response_time_ms: responseTime,
          sent_at: new Date(startTime).toISOString(),
          delivered_at: response.ok ? new Date().toISOString() : null,
          failed_at: !response.ok ? new Date().toISOString() : null,
          attempt_count: 1,
          error_message: !response.ok ? `HTTP ${response.status}` : null,
        })
        .eq('event_id', payload.id)
        .eq('webhook_id', webhook.id);

      // Update webhook stats
      if (response.ok) {
        await supabase
          .from('webhooks')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_success_at: new Date().toISOString(),
          })
          .eq('id', webhook.id);
      } else {
        await supabase
          .from('webhooks')
          .update({
            last_triggered_at: new Date().toISOString(),
            last_failure_at: new Date().toISOString(),
          })
          .eq('id', webhook.id);
      }

      return {
        success: response.ok,
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? (error.name === 'AbortError' ? 'Request timeout' : error.message)
        : 'Unknown error';

      await supabase
        .from('webhook_events')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          attempt_count: 1,
          error_message: errorMessage,
        })
        .eq('event_id', payload.id)
        .eq('webhook_id', webhook.id);

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Retry failed webhook events
   * This should be called by a background job/cron
   */
  static async retryFailedEvents(): Promise<{ processed: number; succeeded: number; failed: number }> {
    const supabase = await createClient();
    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      // Get events that need retry
      const { data: events } = await supabase
        .from('webhook_events')
        .select(`
          *,
          webhooks (*)
        `)
        .eq('status', 'retrying')
        .lte('next_retry_at', new Date().toISOString())
        .lt('attempt_count', 'max_attempts')
        .limit(100);

      if (!events || events.length === 0) {
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      for (const event of events) {
        processed++;
        const webhook = event.webhooks;

        if (!webhook || !webhook.is_active) {
          // Mark as exhausted if webhook is gone/inactive
          await supabase
            .from('webhook_events')
            .update({ status: 'exhausted', error_message: 'Webhook inactive or deleted' })
            .eq('id', event.id);
          failed++;
          continue;
        }

        const result = await this.sendWebhookEvent(
          {
            id: webhook.id,
            url: webhook.url,
            secret: webhook.secret,
            custom_headers: webhook.custom_headers,
          },
          event.payload
        );

        if (result.success) {
          succeeded++;
        } else {
          // Check if we should schedule another retry
          const newAttemptCount = event.attempt_count + 1;
          if (newAttemptCount >= event.max_attempts) {
            await supabase
              .from('webhook_events')
              .update({
                status: 'exhausted',
                attempt_count: newAttemptCount,
              })
              .eq('id', event.id);
          } else {
            const nextRetry = new Date(Date.now() + calculateRetryDelay(newAttemptCount));
            await supabase
              .from('webhook_events')
              .update({
                status: 'retrying',
                attempt_count: newAttemptCount,
                next_retry_at: nextRetry.toISOString(),
              })
              .eq('id', event.id);
          }
          failed++;
        }
      }
    } catch (error) {
      console.error('Error retrying failed events:', error);
    }

    return { processed, succeeded, failed };
  }
}

// ============================================================================
// CONVENIENCE DISPATCH FUNCTIONS
// ============================================================================

/**
 * Dispatch project created event
 */
export async function dispatchProjectCreated(
  organizationId: string,
  data: ProjectEventData,
  options?: DispatchOptions
): Promise<DispatchResult> {
  return WebhookDispatcher.dispatch('project.created', data, organizationId, {
    ...options,
    projectId: data.project_id,
  });
}

/**
 * Dispatch application submitted event
 */
export async function dispatchApplicationSubmitted(
  organizationId: string,
  data: ApplicationEventData,
  options?: DispatchOptions
): Promise<DispatchResult> {
  return WebhookDispatcher.dispatch('application.submitted', data, organizationId, {
    ...options,
    projectId: data.project_id,
    applicationId: data.application_id,
    incentiveProgramId: data.incentive_program_id,
  });
}

/**
 * Dispatch deadline approaching event
 */
export async function dispatchDeadlineApproaching(
  organizationId: string,
  data: DeadlineEventData,
  options?: DispatchOptions
): Promise<DispatchResult> {
  return WebhookDispatcher.dispatch('deadline.approaching', data, organizationId, {
    ...options,
    projectId: data.project_id,
    applicationId: data.application_id,
    incentiveProgramId: data.incentive_program_id,
  });
}

/**
 * Dispatch eligibility scan completed event
 */
export async function dispatchEligibilityScanCompleted(
  organizationId: string,
  data: EligibilityEventData,
  options?: DispatchOptions
): Promise<DispatchResult> {
  return WebhookDispatcher.dispatch('eligibility.scan_completed', data, organizationId, {
    ...options,
    projectId: data.project_id,
  });
}

export default WebhookDispatcher;
