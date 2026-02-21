/**
 * Job Scheduler Library for IncentEdge
 * Handles cron parsing, job queuing, retry logic, and scheduling
 */

import { createClient } from '@/lib/supabase/server';
import type { JobType, JobPriority, BackgroundJob } from '@/lib/job-processor';

// ============================================================================
// TYPES
// ============================================================================

export interface CronParts {
  minute: number[] | '*';
  hour: number[] | '*';
  dayOfMonth: number[] | '*';
  month: number[] | '*';
  dayOfWeek: number[] | '*';
}

export interface JobSchedule {
  id: string;
  name: string;
  description: string | null;
  job_type: JobType;
  job_name: string;
  priority: JobPriority;
  payload: Record<string, unknown>;
  timeout_seconds: number;
  max_attempts: number;
  cron_expression: string;
  timezone: string;
  organization_id: string | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  last_job_id: string | null;
  run_count: number;
  consecutive_failures: number;
  max_concurrent: number;
  skip_if_previous_running: boolean;
  notify_on_failure: boolean;
  notify_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeadLetterEntry {
  id: string;
  original_job_id: string;
  job_type: JobType;
  name: string;
  organization_id: string | null;
  priority: JobPriority;
  payload: Record<string, unknown>;
  total_attempts: number;
  last_error: string | null;
  error_stack: string | null;
  failure_reason: string | null;
  can_retry: boolean;
  retry_after: string | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_action: 'retried' | 'discarded' | 'manual' | null;
  resolution_notes: string | null;
  moved_at: string;
  original_created_at: string | null;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelaySeconds: number;
  maxDelaySeconds: number;
  backoffMultiplier: number;
  jitterPercent: number;
}

// ============================================================================
// CRON EXPRESSION PARSER
// ============================================================================

const CRON_ALIASES: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

/**
 * Parse a cron expression into its component parts
 */
export function parseCronExpression(expression: string): CronParts {
  // Handle aliases
  const normalizedExpression = CRON_ALIASES[expression.toLowerCase()] || expression;

  const parts = normalizedExpression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: expected 5 parts, got ${parts.length}`);
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return {
    minute: parseField(minute, 0, 59),
    hour: parseField(hour, 0, 23),
    dayOfMonth: parseField(dayOfMonth, 1, 31),
    month: parseField(month, 1, 12),
    dayOfWeek: parseField(dayOfWeek, 0, 6),
  };
}

/**
 * Parse a single cron field
 */
function parseField(field: string, min: number, max: number): number[] | '*' {
  if (field === '*') {
    return '*';
  }

  const values: number[] = [];

  // Handle comma-separated values
  const parts = field.split(',');

  for (const part of parts) {
    if (part.includes('/')) {
      // Handle step values (e.g., */5 or 0-30/5)
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);

      let start = min;
      let end = max;

      if (range !== '*') {
        if (range.includes('-')) {
          const [startStr, endStr] = range.split('-');
          start = parseInt(startStr, 10);
          end = parseInt(endStr, 10);
        } else {
          start = parseInt(range, 10);
        }
      }

      for (let i = start; i <= end; i += step) {
        if (i >= min && i <= max && !values.includes(i)) {
          values.push(i);
        }
      }
    } else if (part.includes('-')) {
      // Handle ranges (e.g., 1-5)
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      for (let i = start; i <= end; i++) {
        if (i >= min && i <= max && !values.includes(i)) {
          values.push(i);
        }
      }
    } else {
      // Handle single values
      const value = parseInt(part, 10);
      if (value >= min && value <= max && !values.includes(value)) {
        values.push(value);
      }
    }
  }

  return values.sort((a, b) => a - b);
}

/**
 * Calculate the next run time for a cron expression
 */
export function getNextRunTime(
  cronExpression: string,
  timezone: string = 'America/New_York',
  after: Date = new Date()
): Date {
  const parts = parseCronExpression(cronExpression);

  // Convert to target timezone
  const current = new Date(after.toLocaleString('en-US', { timeZone: timezone }));
  current.setSeconds(0, 0);
  current.setMinutes(current.getMinutes() + 1); // Start from next minute

  // Max iterations to prevent infinite loop
  const maxIterations = 366 * 24 * 60; // ~1 year of minutes

  for (let i = 0; i < maxIterations; i++) {
    const minute = current.getMinutes();
    const hour = current.getHours();
    const dayOfMonth = current.getDate();
    const month = current.getMonth() + 1;
    const dayOfWeek = current.getDay();

    const minuteMatch = parts.minute === '*' || parts.minute.includes(minute);
    const hourMatch = parts.hour === '*' || parts.hour.includes(hour);
    const dayOfMonthMatch = parts.dayOfMonth === '*' || parts.dayOfMonth.includes(dayOfMonth);
    const monthMatch = parts.month === '*' || parts.month.includes(month);
    const dayOfWeekMatch = parts.dayOfWeek === '*' || parts.dayOfWeek.includes(dayOfWeek);

    if (minuteMatch && hourMatch && dayOfMonthMatch && monthMatch && dayOfWeekMatch) {
      // Convert back from timezone
      return new Date(current.toLocaleString('en-US', { timeZone: 'UTC' }));
    }

    // Increment by one minute
    current.setMinutes(current.getMinutes() + 1);
  }

  // Fallback: next hour
  const fallback = new Date(after);
  fallback.setHours(fallback.getHours() + 1, 0, 0, 0);
  return fallback;
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): { valid: boolean; error?: string } {
  try {
    parseCronExpression(expression);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid cron expression',
    };
  }
}

/**
 * Get a human-readable description of a cron expression
 */
export function describeCronExpression(expression: string): string {
  // Handle aliases
  const aliases: Record<string, string> = {
    '@yearly': 'Once a year on January 1st at midnight',
    '@annually': 'Once a year on January 1st at midnight',
    '@monthly': 'Once a month on the 1st at midnight',
    '@weekly': 'Once a week on Sunday at midnight',
    '@daily': 'Every day at midnight',
    '@midnight': 'Every day at midnight',
    '@hourly': 'Every hour',
  };

  if (aliases[expression.toLowerCase()]) {
    return aliases[expression.toLowerCase()];
  }

  try {
    const parts = parseCronExpression(expression);
    const descriptions: string[] = [];

    // Minute
    if (parts.minute === '*') {
      descriptions.push('every minute');
    } else if (parts.minute.length === 1) {
      descriptions.push(`at minute ${parts.minute[0]}`);
    }

    // Hour
    if (parts.hour === '*') {
      descriptions.push('every hour');
    } else if (parts.hour.length === 1) {
      const hour = parts.hour[0];
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      descriptions.push(`at ${displayHour}:${parts.minute === '*' ? '00' : String(parts.minute[0]).padStart(2, '0')} ${period}`);
    }

    // Day of week
    if (parts.dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayNames = parts.dayOfWeek.map(d => days[d]);
      descriptions.push(`on ${dayNames.join(', ')}`);
    }

    // Day of month
    if (parts.dayOfMonth !== '*') {
      descriptions.push(`on day ${parts.dayOfMonth.join(', ')} of the month`);
    }

    // Month
    if (parts.month !== '*') {
      const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const monthNames = parts.month.map(m => months[m]);
      descriptions.push(`in ${monthNames.join(', ')}`);
    }

    return descriptions.join(' ') || 'Custom schedule';
  } catch {
    return 'Invalid schedule';
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelaySeconds: 30,
  maxDelaySeconds: 3600, // 1 hour
  backoffMultiplier: 3,
  jitterPercent: 10,
};

/**
 * Calculate the delay before the next retry attempt
 */
export function calculateRetryDelay(
  attempt: number,
  config: Partial<RetryConfig> = {}
): number {
  const {
    baseDelaySeconds,
    maxDelaySeconds,
    backoffMultiplier,
    jitterPercent,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  // Exponential backoff
  let delay = baseDelaySeconds * Math.pow(backoffMultiplier, attempt - 1);

  // Cap at max delay
  delay = Math.min(delay, maxDelaySeconds);

  // Add jitter to prevent thundering herd
  const jitterRange = delay * (jitterPercent / 100);
  const jitter = Math.random() * jitterRange * 2 - jitterRange;
  delay = Math.max(0, delay + jitter);

  return Math.round(delay);
}

/**
 * Check if a job should be retried
 */
export function shouldRetry(
  attempt: number,
  error: Error | string,
  config: Partial<RetryConfig> = {}
): boolean {
  const { maxAttempts } = { ...DEFAULT_RETRY_CONFIG, ...config };

  // Don't retry if max attempts reached
  if (attempt >= maxAttempts) {
    return false;
  }

  // Check for non-retryable errors
  const errorMessage = typeof error === 'string' ? error : error.message;
  const nonRetryablePatterns = [
    'invalid configuration',
    'permission denied',
    'unauthorized',
    'not found',
    'validation error',
  ];

  for (const pattern of nonRetryablePatterns) {
    if (errorMessage.toLowerCase().includes(pattern)) {
      return false;
    }
  }

  return true;
}

// ============================================================================
// JOB QUEUING
// ============================================================================

/**
 * Queue a job with priority
 */
export async function queueJob(params: {
  jobType: JobType;
  name: string;
  organizationId?: string;
  createdBy?: string;
  priority?: JobPriority;
  payload?: Record<string, unknown>;
  projectId?: string;
  applicationId?: string;
  documentId?: string;
  scheduledAt?: Date;
  timeoutSeconds?: number;
  maxAttempts?: number;
  idempotencyKey?: string;
}): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();

  // Check for duplicate using idempotency key
  if (params.idempotencyKey) {
    const { data: existing } = await supabase
      .from('background_jobs')
      .select('id, status')
      .eq('idempotency_key', params.idempotencyKey)
      .single();

    if (existing) {
      return { id: existing.id };
    }
  }

  const { data, error } = await supabase.rpc('create_background_job', {
    p_job_type: params.jobType,
    p_name: params.name,
    p_organization_id: params.organizationId || null,
    p_created_by: params.createdBy || null,
    p_priority: params.priority || 'normal',
    p_payload: params.payload || {},
    p_project_id: params.projectId || null,
    p_application_id: params.applicationId || null,
    p_document_id: params.documentId || null,
    p_scheduled_at: (params.scheduledAt || new Date()).toISOString(),
    p_timeout_seconds: params.timeoutSeconds || 300,
    p_max_attempts: params.maxAttempts || 3,
    p_idempotency_key: params.idempotencyKey || null,
  });

  if (error) {
    console.error('Failed to queue job:', error);
    return { error: error.message };
  }

  return { id: data };
}

/**
 * Queue multiple jobs in batch
 */
export async function queueBatch(
  jobs: Array<{
    jobType: JobType;
    name: string;
    organizationId?: string;
    createdBy?: string;
    priority?: JobPriority;
    payload?: Record<string, unknown>;
    projectId?: string;
    scheduledAt?: Date;
  }>
): Promise<{ queued: number; failed: number; ids: string[] }> {
  const results = await Promise.all(jobs.map(job => queueJob(job)));

  const queued = results.filter(r => 'id' in r).length;
  const failed = results.filter(r => 'error' in r).length;
  const ids = results.filter(r => 'id' in r).map(r => (r as { id: string }).id);

  return { queued, failed, ids };
}

// ============================================================================
// SCHEDULE MANAGEMENT
// ============================================================================

/**
 * Create a new job schedule
 */
export async function createSchedule(params: {
  name: string;
  description?: string;
  jobType: JobType;
  jobName: string;
  cronExpression: string;
  timezone?: string;
  organizationId?: string;
  priority?: JobPriority;
  payload?: Record<string, unknown>;
  timeoutSeconds?: number;
  maxAttempts?: number;
  maxConcurrent?: number;
  skipIfPreviousRunning?: boolean;
  notifyOnFailure?: boolean;
  notifyEmail?: string;
}): Promise<{ schedule: JobSchedule } | { error: string }> {
  // Validate cron expression
  const validation = validateCronExpression(params.cronExpression);
  if (!validation.valid) {
    return { error: `Invalid cron expression: ${validation.error}` };
  }

  const supabase = await createClient();
  const nextRun = getNextRunTime(params.cronExpression, params.timezone || 'America/New_York');

  const { data, error } = await supabase
    .from('job_schedules')
    .insert({
      name: params.name,
      description: params.description || null,
      job_type: params.jobType,
      job_name: params.jobName,
      cron_expression: params.cronExpression,
      timezone: params.timezone || 'America/New_York',
      organization_id: params.organizationId || null,
      priority: params.priority || 'normal',
      payload: params.payload || {},
      timeout_seconds: params.timeoutSeconds || 300,
      max_attempts: params.maxAttempts || 3,
      max_concurrent: params.maxConcurrent || 1,
      skip_if_previous_running: params.skipIfPreviousRunning ?? true,
      notify_on_failure: params.notifyOnFailure ?? true,
      notify_email: params.notifyEmail || null,
      next_run_at: nextRun.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create schedule:', error);
    return { error: error.message };
  }

  return { schedule: data as JobSchedule };
}

/**
 * Update a job schedule
 */
export async function updateSchedule(
  scheduleId: string,
  params: Partial<{
    name: string;
    description: string;
    cronExpression: string;
    timezone: string;
    priority: JobPriority;
    payload: Record<string, unknown>;
    timeoutSeconds: number;
    maxAttempts: number;
    maxConcurrent: number;
    skipIfPreviousRunning: boolean;
    isActive: boolean;
    notifyOnFailure: boolean;
    notifyEmail: string;
  }>
): Promise<{ schedule: JobSchedule } | { error: string }> {
  const supabase = await createClient();

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (params.name !== undefined) updateData.name = params.name;
  if (params.description !== undefined) updateData.description = params.description;
  if (params.priority !== undefined) updateData.priority = params.priority;
  if (params.payload !== undefined) updateData.payload = params.payload;
  if (params.timeoutSeconds !== undefined) updateData.timeout_seconds = params.timeoutSeconds;
  if (params.maxAttempts !== undefined) updateData.max_attempts = params.maxAttempts;
  if (params.maxConcurrent !== undefined) updateData.max_concurrent = params.maxConcurrent;
  if (params.skipIfPreviousRunning !== undefined) updateData.skip_if_previous_running = params.skipIfPreviousRunning;
  if (params.isActive !== undefined) updateData.is_active = params.isActive;
  if (params.notifyOnFailure !== undefined) updateData.notify_on_failure = params.notifyOnFailure;
  if (params.notifyEmail !== undefined) updateData.notify_email = params.notifyEmail;

  // Handle cron expression update
  if (params.cronExpression !== undefined) {
    const validation = validateCronExpression(params.cronExpression);
    if (!validation.valid) {
      return { error: `Invalid cron expression: ${validation.error}` };
    }
    updateData.cron_expression = params.cronExpression;
    updateData.next_run_at = getNextRunTime(
      params.cronExpression,
      params.timezone || 'America/New_York'
    ).toISOString();
  }

  if (params.timezone !== undefined) {
    updateData.timezone = params.timezone;
    // Recalculate next run if timezone changes
    const { data: current } = await supabase
      .from('job_schedules')
      .select('cron_expression')
      .eq('id', scheduleId)
      .single();

    if (current) {
      updateData.next_run_at = getNextRunTime(
        current.cron_expression,
        params.timezone
      ).toISOString();
    }
  }

  const { data, error } = await supabase
    .from('job_schedules')
    .update(updateData)
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update schedule:', error);
    return { error: error.message };
  }

  return { schedule: data as JobSchedule };
}

/**
 * Delete a job schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('job_schedules')
    .delete()
    .eq('id', scheduleId);

  if (error) {
    console.error('Failed to delete schedule:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get all schedules
 */
export async function getSchedules(params?: {
  organizationId?: string;
  isActive?: boolean;
  jobType?: JobType;
}): Promise<JobSchedule[]> {
  const supabase = await createClient();

  let query = supabase.from('job_schedules').select('*');

  if (params?.organizationId) {
    query = query.or(`organization_id.is.null,organization_id.eq.${params.organizationId}`);
  }
  if (params?.isActive !== undefined) {
    query = query.eq('is_active', params.isActive);
  }
  if (params?.jobType) {
    query = query.eq('job_type', params.jobType);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Failed to get schedules:', error);
    return [];
  }

  return (data || []) as JobSchedule[];
}

// ============================================================================
// DEAD LETTER QUEUE
// ============================================================================

/**
 * Get dead letter queue entries
 */
export async function getDeadLetterQueue(params?: {
  organizationId?: string;
  resolved?: boolean;
  jobType?: JobType;
  limit?: number;
  offset?: number;
}): Promise<{ entries: DeadLetterEntry[]; total: number }> {
  const supabase = await createClient();

  let query = supabase.from('job_dead_letter_queue').select('*', { count: 'exact' });

  if (params?.organizationId) {
    query = query.eq('organization_id', params.organizationId);
  }
  if (params?.resolved !== undefined) {
    query = query.eq('resolved', params.resolved);
  }
  if (params?.jobType) {
    query = query.eq('job_type', params.jobType);
  }

  query = query
    .order('moved_at', { ascending: false })
    .range(params?.offset || 0, (params?.offset || 0) + (params?.limit || 20) - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Failed to get dead letter queue:', error);
    return { entries: [], total: 0 };
  }

  return {
    entries: (data || []) as DeadLetterEntry[],
    total: count || 0,
  };
}

/**
 * Retry a dead letter queue entry
 */
export async function retryDeadLetter(
  entryId: string,
  userId: string
): Promise<{ jobId: string } | { error: string }> {
  const supabase = await createClient();

  // Get the dead letter entry
  const { data: entry, error: fetchError } = await supabase
    .from('job_dead_letter_queue')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !entry) {
    return { error: 'Dead letter entry not found' };
  }

  if (!entry.can_retry) {
    return { error: 'This entry cannot be retried' };
  }

  // Create a new job from the dead letter entry
  const result = await queueJob({
    jobType: entry.job_type,
    name: `[Retry] ${entry.name}`,
    organizationId: entry.organization_id,
    priority: entry.priority,
    payload: {
      ...entry.payload,
      _retried_from: entryId,
    },
    maxAttempts: 1, // Single attempt for retries
  });

  if ('error' in result) {
    return result;
  }

  // Mark entry as resolved
  await supabase
    .from('job_dead_letter_queue')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_action: 'retried',
      resolution_notes: `Retried as job ${result.id}`,
    })
    .eq('id', entryId);

  return { jobId: result.id };
}

/**
 * Discard a dead letter queue entry
 */
export async function discardDeadLetter(
  entryId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('job_dead_letter_queue')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
      resolution_action: 'discarded',
      resolution_notes: reason || 'Manually discarded',
    })
    .eq('id', entryId);

  if (error) {
    console.error('Failed to discard dead letter:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// JOB PROGRESS TRACKING
// ============================================================================

/**
 * Track job progress with step details
 */
export async function trackProgress(
  jobId: string,
  progress: number,
  message?: string,
  currentStep?: number,
  totalSteps?: number
): Promise<void> {
  const supabase = await createClient();

  await supabase.rpc('update_job_progress', {
    p_job_id: jobId,
    p_progress: Math.min(100, Math.max(0, progress)),
    p_message: message || null,
    p_current_step: currentStep || null,
    p_total_steps: totalSteps || null,
  });
}

/**
 * Create a progress tracker for a job
 */
export function createProgressTracker(
  jobId: string,
  totalSteps: number = 1
): {
  setStep: (step: number, message?: string) => Promise<void>;
  complete: (message?: string) => Promise<void>;
  fail: (error: string) => Promise<void>;
} {
  let currentStep = 0;

  return {
    async setStep(step: number, message?: string) {
      currentStep = step;
      const progress = Math.round((step / totalSteps) * 100);
      await trackProgress(jobId, progress, message, step, totalSteps);
    },

    async complete(message?: string) {
      await trackProgress(jobId, 100, message || 'Complete', totalSteps, totalSteps);
    },

    async fail(error: string) {
      await trackProgress(jobId, currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0, `Failed: ${error}`);
    },
  };
}

// ============================================================================
// PROCESS SCHEDULES (for cron worker)
// ============================================================================

/**
 * Process all due schedules and create jobs
 */
export async function processSchedules(): Promise<{
  processed: number;
  created: number;
  skipped: number;
}> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('process_job_schedules');

  return {
    processed: data || 0,
    created: data || 0,
    skipped: 0,
  };
}

/**
 * Retry failed jobs that are due
 */
export async function retryPendingJobs(): Promise<{ retried: number }> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('retry_pending_jobs');

  return { retried: data || 0 };
}

/**
 * Clean up old completed jobs
 */
export async function cleanupJobs(params?: {
  completedRetentionDays?: number;
  failedRetentionDays?: number;
}): Promise<{ deleted: number }> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('cleanup_old_jobs', {
    p_completed_retention_days: params?.completedRetentionDays || 7,
    p_failed_retention_days: params?.failedRetentionDays || 30,
  });

  return { deleted: data || 0 };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Cron parsing
  parseCronExpression,
  getNextRunTime,
  validateCronExpression,
  describeCronExpression,

  // Retry logic
  calculateRetryDelay,
  shouldRetry,

  // Job queuing
  queueJob,
  queueBatch,

  // Schedule management
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedules,

  // Dead letter queue
  getDeadLetterQueue,
  retryDeadLetter,
  discardDeadLetter,

  // Progress tracking
  trackProgress,
  createProgressTracker,

  // Schedule processing
  processSchedules,
  retryPendingJobs,
  cleanupJobs,
};
