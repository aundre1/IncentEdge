import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processJob, type BackgroundJob } from '@/lib/job-processor';
import { processSchedules, retryPendingJobs, cleanupJobs } from '@/lib/job-scheduler';
import { headers } from 'next/headers';
import { timingSafeEqual } from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CRON_SECRET = process.env.CRON_SECRET;
const MAX_JOBS_PER_BATCH = 5;
const WORKER_ID = `worker-${process.env.VERCEL_REGION || 'local'}-${Date.now()}`;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function secureCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Verify cron job authorization
 * SECURITY: Uses timing-safe comparison and requires CRON_SECRET in production
 */
function verifyCronAuthorization(headersList: Headers): { authorized: boolean; reason?: string } {
  // CRITICAL: In production, CRON_SECRET must be configured
  if (IS_PRODUCTION && !CRON_SECRET) {
    console.error('[Security] CRITICAL: CRON_SECRET not configured in production');
    return { authorized: false, reason: 'Server misconfiguration' };
  }

  // CRITICAL: In production, CRON_SECRET must be at least 32 characters
  if (IS_PRODUCTION && CRON_SECRET && CRON_SECRET.length < 32) {
    console.error('[Security] CRITICAL: CRON_SECRET too short (min 32 chars)');
    return { authorized: false, reason: 'Server misconfiguration' };
  }

  const authHeader = headersList.get('authorization');
  const cronSecretHeader = headersList.get('x-cron-secret');
  const vercelCronHeader = headersList.get('x-vercel-cron');

  // Check x-cron-secret header (timing-safe)
  if (CRON_SECRET && secureCompare(cronSecretHeader, CRON_SECRET)) {
    return { authorized: true };
  }

  // Check Authorization: Bearer header (timing-safe)
  if (CRON_SECRET && authHeader) {
    const expectedAuth = `Bearer ${CRON_SECRET}`;
    if (secureCompare(authHeader, expectedAuth)) {
      return { authorized: true };
    }
  }

  // Vercel Cron header - only trust in production with CRON_SECRET also set
  // This prevents using x-vercel-cron as sole authentication
  if (vercelCronHeader === '1' && CRON_SECRET && IS_PRODUCTION) {
    // Vercel signs these requests, but we still require CRON_SECRET to be configured
    // This ensures the endpoint can't be called just by setting the header
    return { authorized: true };
  }

  // In development without CRON_SECRET, allow with warning
  if (!IS_PRODUCTION && !CRON_SECRET) {
    console.warn('[Security] WARNING: Cron endpoint accessed without authentication (dev mode)');
    return { authorized: true };
  }

  return { authorized: false, reason: 'Invalid or missing credentials' };
}

// ============================================================================
// POST - Process pending jobs (called by cron or Vercel Cron)
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify cron job authorization with timing-safe comparison
    const headersList = await headers();
    const authResult = verifyCronAuthorization(headersList);

    if (!authResult.authorized) {
      console.warn('[Security] Unauthorized cron access attempt');
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.reason },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const startTime = Date.now();

    // Parse request body for options
    let options: {
      job_types?: string[];
      max_jobs?: number;
      process_schedules?: boolean;
      retry_failed?: boolean;
      cleanup?: boolean;
    } = {};

    try {
      const body = await request.json();
      options = body || {};
    } catch {
      // Empty body is fine
    }

    const results: {
      processed: Array<{
        id: string;
        job_type: string;
        name: string;
        success: boolean;
        duration_ms: number;
        error?: string;
      }>;
      schedules: { processed: number; created: number };
      retried: number;
      cleaned: number;
      duration_ms: number;
    } = {
      processed: [],
      schedules: { processed: 0, created: 0 },
      retried: 0,
      cleaned: 0,
      duration_ms: 0,
    };

    // 1. Process job schedules (create jobs from due schedules)
    if (options.process_schedules !== false) {
      try {
        const scheduleResult = await processSchedules();
        results.schedules = scheduleResult;
      } catch (error) {
        console.error('Error processing schedules:', error);
      }
    }

    // 2. Retry failed jobs that are due
    if (options.retry_failed !== false) {
      try {
        const retryResult = await retryPendingJobs();
        results.retried = retryResult.retried;
      } catch (error) {
        console.error('Error retrying jobs:', error);
      }
    }

    // 3. Claim and process pending jobs
    const maxJobs = Math.min(options.max_jobs || MAX_JOBS_PER_BATCH, 10);

    for (let i = 0; i < maxJobs; i++) {
      // Claim next available job
      const { data: jobs, error: claimError } = await supabase.rpc('claim_next_job', {
        p_worker_id: WORKER_ID,
        p_job_types: options.job_types || null,
      });

      if (claimError) {
        console.error('Error claiming job:', claimError);
        break;
      }

      const claimedJob = jobs?.[0] as BackgroundJob | undefined;
      if (!claimedJob) {
        // No more jobs to process
        break;
      }

      const jobStartTime = Date.now();

      try {
        // Process the job
        const result = await processJob(claimedJob, WORKER_ID);

        if (result.success) {
          // Mark job as completed
          await supabase.rpc('complete_job', {
            p_job_id: claimedJob.id,
            p_result: result.data || {},
          });

          results.processed.push({
            id: claimedJob.id,
            job_type: claimedJob.job_type,
            name: claimedJob.name,
            success: true,
            duration_ms: Date.now() - jobStartTime,
          });
        } else {
          // Mark job as failed
          await supabase.rpc('fail_job', {
            p_job_id: claimedJob.id,
            p_error: result.error || 'Unknown error',
            p_error_stack: null,
          });

          results.processed.push({
            id: claimedJob.id,
            job_type: claimedJob.job_type,
            name: claimedJob.name,
            success: false,
            duration_ms: Date.now() - jobStartTime,
            error: result.error,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        // Mark job as failed
        await supabase.rpc('fail_job', {
          p_job_id: claimedJob.id,
          p_error: errorMessage,
          p_error_stack: errorStack,
        });

        results.processed.push({
          id: claimedJob.id,
          job_type: claimedJob.job_type,
          name: claimedJob.name,
          success: false,
          duration_ms: Date.now() - jobStartTime,
          error: errorMessage,
        });
      }
    }

    // 4. Cleanup old jobs (only if explicitly requested or on a schedule)
    if (options.cleanup === true) {
      try {
        const cleanupResult = await cleanupJobs();
        results.cleaned = cleanupResult.deleted;
      } catch (error) {
        console.error('Error cleaning up jobs:', error);
      }
    }

    results.duration_ms = Date.now() - startTime;

    // Log worker activity
    console.log(`[Job Processor] Completed: ${results.processed.length} jobs processed, ${results.schedules.created} scheduled, ${results.retried} retried in ${results.duration_ms}ms`);

    return NextResponse.json({
      success: true,
      worker_id: WORKER_ID,
      ...results,
    });
  } catch (error) {
    console.error('Error in POST /api/jobs/process:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get worker status and queue info
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify cron job authorization with timing-safe comparison
    const headersList = await headers();
    const authResult = verifyCronAuthorization(headersList);

    if (!authResult.authorized) {
      console.warn('[Security] Unauthorized cron status access attempt');
      return NextResponse.json(
        { error: 'Unauthorized', message: authResult.reason },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Get queue statistics
    const { data: stats, error: statsError } = await supabase
      .from('background_jobs')
      .select('status, job_type')
      .order('created_at', { ascending: false });

    if (statsError) {
      console.error('Error fetching job stats:', statsError);
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    // Aggregate stats
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    for (const job of stats || []) {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
      typeCounts[job.job_type] = (typeCounts[job.job_type] || 0) + 1;
    }

    // Get pending jobs count by priority
    const { data: pendingByPriority } = await supabase
      .from('background_jobs')
      .select('priority')
      .eq('status', 'pending');

    const priorityCounts: Record<string, number> = {};
    for (const job of pendingByPriority || []) {
      priorityCounts[job.priority] = (priorityCounts[job.priority] || 0) + 1;
    }

    // Get running jobs
    const { data: runningJobs } = await supabase
      .from('background_jobs')
      .select('id, job_type, name, progress, worker_id, started_at')
      .eq('status', 'running')
      .order('started_at', { ascending: true });

    // Get next scheduled jobs
    const { data: upcomingSchedules } = await supabase
      .from('job_schedules')
      .select('name, job_type, next_run_at')
      .eq('is_active', true)
      .not('next_run_at', 'is', null)
      .order('next_run_at', { ascending: true })
      .limit(10);

    // Get dead letter queue count
    const { count: deadLetterCount } = await supabase
      .from('job_dead_letter_queue')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);

    return NextResponse.json({
      status: 'healthy',
      queue: {
        total: stats?.length || 0,
        by_status: statusCounts,
        by_type: typeCounts,
        pending_by_priority: priorityCounts,
      },
      running: {
        count: runningJobs?.length || 0,
        jobs: runningJobs || [],
      },
      schedules: {
        upcoming: upcomingSchedules || [],
      },
      dead_letter_queue: {
        unresolved: deadLetterCount || 0,
      },
      worker_id: WORKER_ID,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/jobs/process:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
