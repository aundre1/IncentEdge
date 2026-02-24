/**
 * Job Processor Library for IncentEdge
 * Handles execution of different job types for async processing
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

export type JobType =
  | 'eligibility_scan'
  | 'report_generation'
  | 'notification_batch'
  | 'deadline_check'
  | 'program_sync'
  | 'document_extraction'
  | 'analytics_refresh';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'dead';
export type JobPriority = 'low' | 'normal' | 'high' | 'critical';

export interface BackgroundJob {
  id: string;
  job_type: JobType;
  name: string;
  organization_id: string | null;
  created_by: string | null;
  priority: JobPriority;
  status: JobStatus;
  progress: number;
  progress_message: string | null;
  current_step: number;
  total_steps: number;
  payload: Record<string, unknown>;
  result: Record<string, unknown>;
  project_id: string | null;
  application_id: string | null;
  document_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  worker_id: string | null;
  attempt: number;
  max_attempts: number;
  last_error: string | null;
  error_stack: string | null;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface JobContext {
  job: BackgroundJob;
  supabase: Awaited<ReturnType<typeof createClient>>;
  workerId: string;
  updateProgress: (progress: number, message?: string) => Promise<void>;
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) => Promise<void>;
}

export interface JobResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export type JobHandler = (context: JobContext) => Promise<JobResult>;

// ============================================================================
// JOB HANDLERS
// ============================================================================

/**
 * Eligibility Scan Handler
 * Calculates incentive eligibility for a project asynchronously
 */
const handleEligibilityScan: JobHandler = async (context) => {
  const { job, supabase, updateProgress, log } = context;
  const { project_id } = job;

  if (!project_id) {
    return { success: false, error: 'No project_id provided' };
  }

  await log('info', 'Starting eligibility scan', { project_id });
  await updateProgress(10, 'Loading project data...');

  // Fetch project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .single();

  if (projectError || !project) {
    return { success: false, error: `Project not found: ${projectError?.message}` };
  }

  await updateProgress(20, 'Fetching incentive programs...');

  // Fetch relevant incentive programs
  const { data: programs, error: programsError } = await supabase
    .from('incentive_programs')
    .select('*')
    .eq('status', 'active')
    .or(`state.is.null,state.eq.${project.state}`);

  if (programsError) {
    return { success: false, error: `Failed to fetch programs: ${programsError.message}` };
  }

  await log('info', `Found ${programs?.length || 0} potential programs`);
  await updateProgress(40, 'Analyzing eligibility criteria...');

  const matches: Array<{
    incentive_program_id: string;
    overall_score: number;
    estimated_value: number;
    match_details: Record<string, unknown>;
  }> = [];

  // Process each program
  const totalPrograms = programs?.length || 0;
  for (let i = 0; i < totalPrograms; i++) {
    const program = programs![i];
    const progress = 40 + Math.floor((i / totalPrograms) * 40);
    await updateProgress(progress, `Evaluating: ${program.short_name || program.name}`);

    // Calculate eligibility score (simplified - real implementation would be more complex)
    const score = calculateEligibilityScore(project, program);

    if (score.overall > 0.3) {
      matches.push({
        incentive_program_id: program.id,
        overall_score: score.overall,
        estimated_value: calculateEstimatedValue(project, program),
        match_details: score.details,
      });
    }
  }

  await updateProgress(85, 'Saving matches...');

  // Upsert matches
  if (matches.length > 0) {
    for (const match of matches) {
      await supabase
        .from('project_incentive_matches')
        .upsert({
          project_id,
          ...match,
          status: 'matched',
        }, {
          onConflict: 'project_id,incentive_program_id',
        });
    }
  }

  // Update project
  await supabase
    .from('projects')
    .update({
      eligibility_scan_count: project.eligibility_scan_count + 1,
      last_eligibility_scan_at: new Date().toISOString(),
      total_potential_incentives: matches.reduce((sum, m) => sum + m.estimated_value, 0),
    })
    .eq('id', project_id);

  await log('info', 'Eligibility scan completed', { matches_found: matches.length });
  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: {
      matches_found: matches.length,
      total_potential_value: matches.reduce((sum, m) => sum + m.estimated_value, 0),
    },
  };
};

/**
 * Report Generation Handler
 * Generates PDF/Excel reports asynchronously
 */
const handleReportGeneration: JobHandler = async (context) => {
  const { job, supabase, updateProgress, log } = context;
  const payload = job.payload as {
    report_type: string;
    format: 'pdf' | 'excel';
    project_id?: string;
    date_range?: { start: string; end: string };
  };

  await log('info', 'Starting report generation', payload);
  await updateProgress(10, 'Gathering data...');

  // Placeholder for actual report generation logic
  // In production, this would use libraries like puppeteer for PDF or exceljs for Excel

  await updateProgress(30, 'Processing data...');

  // Simulate data processing
  const reportData: Record<string, unknown> = {
    generated_at: new Date().toISOString(),
    report_type: payload.report_type,
    format: payload.format,
  };

  await updateProgress(60, 'Generating report...');

  // In production, generate actual file and store it
  const reportPath = `/reports/${job.organization_id}/${Date.now()}.${payload.format}`;

  await updateProgress(90, 'Saving report...');

  // Create document record
  if (job.organization_id) {
    await supabase
      .from('documents')
      .insert({
        organization_id: job.organization_id,
        project_id: payload.project_id || null,
        name: `${payload.report_type}_${new Date().toISOString().split('T')[0]}.${payload.format}`,
        document_type: 'report',
        category: 'generated',
        file_path: reportPath,
        mime_type: payload.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  }

  await log('info', 'Report generated successfully');
  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: {
      report_path: reportPath,
      ...reportData,
    },
  };
};

/**
 * Notification Batch Handler
 * Sends batch notifications to users
 */
const handleNotificationBatch: JobHandler = async (context) => {
  const { supabase, updateProgress, log } = context;

  await log('info', 'Starting notification batch processing');
  await updateProgress(10, 'Fetching pending notifications...');

  // Get users with unread notifications that need to be emailed
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select(`
      *,
      profiles:user_id (
        email,
        full_name,
        preferences
      )
    `)
    .eq('read', false)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(100);

  if (error) {
    return { success: false, error: `Failed to fetch notifications: ${error.message}` };
  }

  await updateProgress(30, `Processing ${notifications?.length || 0} notifications...`);

  let sent = 0;
  let skipped = 0;

  // Group notifications by user for digest emails
  const userNotifications = new Map<string, typeof notifications>();

  for (const notification of notifications || []) {
    const userId = notification.user_id;
    if (!userNotifications.has(userId)) {
      userNotifications.set(userId, []);
    }
    userNotifications.get(userId)!.push(notification);
  }

  // Process each user's notifications
  const totalUsers = userNotifications.size;
  let processed = 0;

  const userEntries: [string, typeof userNotifications extends Map<string, infer V> ? V : never][] = [];
  userNotifications.forEach((value, key) => userEntries.push([key, value]));

  for (const [userId, userNotifs] of userEntries) {
    processed++;
    const progress = 30 + Math.floor((processed / totalUsers) * 60);
    await updateProgress(progress, `Sending to user ${processed}/${totalUsers}...`);

    // Check user preferences
    const user = userNotifs[0].profiles as Record<string, unknown> | null;
    const preferences = (user?.preferences as Record<string, unknown>) || {};

    if (preferences.notifications === false) {
      skipped += userNotifs.length;
      continue;
    }

    // In production, send actual email using service like Resend/SendGrid
    // For now, just log and count
    await log('debug', `Would send ${userNotifs.length} notifications to user ${userId}`);
    sent += userNotifs.length;
  }

  await log('info', 'Notification batch completed', { sent, skipped });
  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: { sent, skipped, total: notifications?.length || 0 },
  };
};

/**
 * Deadline Check Handler
 * Checks for upcoming application deadlines and creates notifications
 */
const handleDeadlineCheck: JobHandler = async (context) => {
  const { supabase, updateProgress, log } = context;

  await log('info', 'Starting deadline check');
  await updateProgress(10, 'Checking upcoming deadlines...');

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Find applications with upcoming deadlines
  const { data: applications, error: appError } = await supabase
    .from('applications')
    .select(`
      *,
      projects (name, organization_id),
      incentive_programs (name, short_name)
    `)
    .not('status', 'in', '("approved","rejected","withdrawn","expired")')
    .not('deadline', 'is', null)
    .lte('deadline', in30Days.toISOString())
    .gte('deadline', now.toISOString());

  if (appError) {
    return { success: false, error: `Failed to fetch applications: ${appError.message}` };
  }

  await updateProgress(40, `Found ${applications?.length || 0} upcoming deadlines`);

  // Find incentive programs with upcoming deadlines
  const { data: programs, error: progError } = await supabase
    .from('incentive_programs')
    .select('*')
    .eq('status', 'active')
    .not('application_deadline', 'is', null)
    .lte('application_deadline', in30Days.toISOString())
    .gte('application_deadline', now.toISOString());

  if (progError) {
    await log('warn', `Failed to fetch program deadlines: ${progError.message}`);
  }

  await updateProgress(60, 'Creating notifications...');

  let notificationsCreated = 0;

  // Create notifications for application deadlines
  for (const app of applications || []) {
    const deadline = new Date(app.deadline);
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';
    if (daysUntil <= 3) priority = 'urgent';
    else if (daysUntil <= 7) priority = 'high';

    const project = app.projects as Record<string, unknown>;
    const program = app.incentive_programs as Record<string, unknown>;

    // Get organization users
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .eq('organization_id', project?.organization_id as string);

    for (const user of users || []) {
      await supabase
        .from('notifications')
        .upsert({
          user_id: user.id,
          title: `Deadline in ${daysUntil} days`,
          message: `Application for ${program?.short_name || program?.name} (${project?.name}) is due on ${deadline.toLocaleDateString()}`,
          notification_type: 'deadline',
          priority,
          project_id: app.project_id,
          application_id: app.id,
          action_url: `/applications/${app.id}`,
          action_label: 'View Application',
        }, {
          onConflict: 'user_id,application_id',
          ignoreDuplicates: true,
        });
      notificationsCreated++;
    }
  }

  await log('info', 'Deadline check completed', {
    applications_checked: applications?.length || 0,
    programs_checked: programs?.length || 0,
    notifications_created: notificationsCreated,
  });

  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: {
      applications_with_deadlines: applications?.length || 0,
      programs_with_deadlines: programs?.length || 0,
      notifications_created: notificationsCreated,
    },
  };
};

/**
 * Program Sync Handler
 * Syncs incentive programs from external sources (DSIRE, etc.)
 */
const handleProgramSync: JobHandler = async (context) => {
  const { job, supabase, updateProgress, log } = context;
  const payload = job.payload as {
    source?: string;
    state?: string;
    full_sync?: boolean;
  };

  await log('info', 'Starting program sync', payload);
  await updateProgress(10, 'Connecting to external sources...');

  // In production, this would connect to DSIRE API, utility APIs, etc.
  // For now, we simulate the sync process

  const sources = payload.source ? [payload.source] : ['dsire', 'utility_apis', 'state_programs'];
  let totalSynced = 0;
  let totalUpdated = 0;
  let totalNew = 0;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const progress = 10 + Math.floor((i / sources.length) * 80);
    await updateProgress(progress, `Syncing from ${source}...`);
    await log('info', `Syncing from source: ${source}`);

    // Simulate fetching and processing data
    // In production, this would:
    // 1. Fetch data from external API
    // 2. Transform to our schema
    // 3. Upsert into incentive_programs table

    // Update last_verified_at for existing programs
    const { data: updatedPrograms, error: updateError } = await supabase
      .from('incentive_programs')
      .update({
        last_verified_at: new Date().toISOString(),
      })
      .eq('data_source', source)
      .select('id');

    if (!updateError && updatedPrograms) {
      totalUpdated += updatedPrograms.length;
    }
  }

  await updateProgress(95, 'Finalizing sync...');

  await log('info', 'Program sync completed', {
    sources_processed: sources.length,
    programs_updated: totalUpdated,
    programs_new: totalNew,
  });

  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: {
      synced: totalSynced,
      updated: totalUpdated,
      new: totalNew,
    },
  };
};

/**
 * Document Extraction Handler
 * AI-powered document processing and data extraction
 * Routes to specialized extractors based on resource_type
 */
const handleDocumentExtraction: JobHandler = async (context) => {
  const { job, supabase, updateProgress, log } = context;
  const payload = job.payload as Record<string, unknown> | undefined;
  const resourceType = (job as any).resource_type as string | undefined;

  await log('info', 'Starting document extraction', {
    document_id: job.document_id,
    resource_type: resourceType,
  });

  // Route to appropriate extractor based on payload or metadata
  const resourceTypeFromPayload = (payload?.resource_type as string) || resourceType;

  if (resourceTypeFromPayload === 'incentive_program') {
    // Import here to avoid circular dependencies
    const { processIncentiveExtraction } = await import('./incentive-extraction-worker');

    try {
      await updateProgress(10, 'Starting incentive program extraction...');

      const result = await processIncentiveExtraction(job.id, job.organization_id || undefined);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Incentive extraction failed',
        };
      }

      await log('info', 'Incentive extraction completed', {
        programs_extracted: result.programs_extracted,
        programs_needing_review: result.programs_needing_review,
      });

      return {
        success: true,
        data: {
          programs_extracted: result.programs_extracted,
          programs_needing_review: result.programs_needing_review,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await log('error', `Incentive extraction failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Generic document extraction (fallback)
  if (!job.document_id) {
    return { success: false, error: 'No document_id provided' };
  }

  await updateProgress(10, 'Loading document...');

  // Fetch document
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', job.document_id)
    .single();

  if (docError || !document) {
    return { success: false, error: `Document not found: ${docError?.message}` };
  }

  await updateProgress(20, 'Downloading file...');

  // In production, this would:
  // 1. Download the file from storage
  // 2. Process with OCR if needed
  // 3. Send to AI for extraction

  await updateProgress(40, 'Processing with AI...');

  // Simulate AI processing
  const extractedData: Record<string, unknown> = {
    document_type: document.document_type,
    processed_at: new Date().toISOString(),
    // In production, this would contain actual extracted data
    extracted_fields: {},
    confidence_score: 0.85,
  };

  await updateProgress(80, 'Saving extracted data...');

  // Update document with extracted data
  await supabase
    .from('documents')
    .update({
      ai_extracted_data: extractedData,
      ai_processed: true,
      ai_processed_at: new Date().toISOString(),
    })
    .eq('id', job.document_id);

  await log('info', 'Document extraction completed', { confidence: 0.85 });
  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: extractedData,
  };
};

/**
 * Analytics Refresh Handler
 * Updates analytics cache and aggregations
 */
const handleAnalyticsRefresh: JobHandler = async (context) => {
  const { job, supabase, updateProgress, log } = context;

  await log('info', 'Starting analytics refresh');
  await updateProgress(10, 'Calculating project metrics...');

  // Refresh project statistics
  const { data: projectStats, error: projError } = await supabase
    .from('projects')
    .select('id, organization_id, project_status, sector_type, total_potential_incentives, total_captured_incentives')
    .not('project_status', 'eq', 'archived');

  if (projError) {
    await log('warn', `Failed to fetch project stats: ${projError.message}`);
  }

  await updateProgress(30, 'Calculating application metrics...');

  // Aggregate application statistics
  const { data: appStats, error: appError } = await supabase
    .from('applications')
    .select('id, organization_id, status, amount_requested, amount_approved');

  if (appError) {
    await log('warn', `Failed to fetch application stats: ${appError.message}`);
  }

  await updateProgress(50, 'Calculating incentive metrics...');

  // Get program match statistics
  const { data: matchStats, error: matchError } = await supabase
    .from('project_incentive_matches')
    .select('id, status, estimated_value, overall_score');

  if (matchError) {
    await log('warn', `Failed to fetch match stats: ${matchError.message}`);
  }

  await updateProgress(70, 'Updating job metrics...');

  // Update job metrics summary
  const { count: completedJobs } = await supabase
    .from('background_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  await updateProgress(90, 'Finalizing...');

  const summary = {
    projects: {
      total: projectStats?.length || 0,
      by_status: groupBy(projectStats || [], 'project_status'),
      by_sector: groupBy(projectStats || [], 'sector_type'),
      total_potential: (projectStats || []).reduce((sum, p) => sum + (Number(p.total_potential_incentives) || 0), 0),
      total_captured: (projectStats || []).reduce((sum, p) => sum + (Number(p.total_captured_incentives) || 0), 0),
    },
    applications: {
      total: appStats?.length || 0,
      by_status: groupBy(appStats || [], 'status'),
      total_requested: (appStats || []).reduce((sum, a) => sum + (Number(a.amount_requested) || 0), 0),
      total_approved: (appStats || []).reduce((sum, a) => sum + (Number(a.amount_approved) || 0), 0),
    },
    matches: {
      total: matchStats?.length || 0,
      by_status: groupBy(matchStats || [], 'status'),
      total_value: (matchStats || []).reduce((sum, m) => sum + (Number(m.estimated_value) || 0), 0),
      avg_score: matchStats?.length ? (matchStats.reduce((sum, m) => sum + (Number(m.overall_score) || 0), 0) / matchStats.length) : 0,
    },
    jobs: {
      completed_24h: completedJobs || 0,
    },
    refreshed_at: new Date().toISOString(),
  };

  await log('info', 'Analytics refresh completed', summary);
  await updateProgress(100, 'Complete');

  return {
    success: true,
    data: summary,
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEligibilityScore(
  project: Record<string, unknown>,
  program: Record<string, unknown>
): { overall: number; details: Record<string, unknown> } {
  let score = 0;
  let maxScore = 0;
  const details: Record<string, unknown> = {};

  // Check state match
  maxScore += 1;
  if (!program.state || program.state === project.state) {
    score += 1;
    details.state_match = true;
  } else {
    details.state_match = false;
  }

  // Check sector match
  maxScore += 1;
  const sectorTypes = (program.sector_types as string[]) || [];
  if (sectorTypes.length === 0 || sectorTypes.includes(project.sector_type as string)) {
    score += 1;
    details.sector_match = true;
  } else {
    details.sector_match = false;
  }

  // Check building type match
  maxScore += 1;
  const buildingTypes = (program.building_types as string[]) || [];
  if (buildingTypes.length === 0 || buildingTypes.includes(project.building_type as string)) {
    score += 1;
    details.building_type_match = true;
  } else {
    details.building_type_match = false;
  }

  // Check entity type
  maxScore += 1;
  const entityTypes = (program.entity_types as string[]) || [];
  // Simplified - in production would check organization tax status
  if (entityTypes.length === 0) {
    score += 0.5;
    details.entity_type_match = 'partial';
  } else {
    score += 1;
    details.entity_type_match = true;
  }

  return {
    overall: maxScore > 0 ? score / maxScore : 0,
    details,
  };
}

function calculateEstimatedValue(
  project: Record<string, unknown>,
  program: Record<string, unknown>
): number {
  const amountType = program.amount_type as string;
  const tdc = (project.total_development_cost as number) || 0;
  const units = (project.total_units as number) || 0;
  const sqft = (project.total_sqft as number) || 0;
  const capacityKw = ((project.capacity_mw as number) || 0) * 1000;

  switch (amountType) {
    case 'fixed':
      return (program.amount_fixed as number) || 0;
    case 'percentage':
      return tdc * ((program.amount_percentage as number) || 0);
    case 'per_unit':
      return units * ((program.amount_per_unit as number) || 0);
    case 'per_sqft':
      return sqft * ((program.amount_per_sqft as number) || 0);
    case 'per_kw':
      return capacityKw * ((program.amount_per_kw as number) || 0);
    default:
      // Use max amount as fallback
      return (program.amount_max as number) || 0;
  }
}

function groupBy<T>(items: T[], key: keyof T): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = String(item[key] || 'unknown');
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ============================================================================
// JOB HANDLER REGISTRY
// ============================================================================

const jobHandlers: Record<JobType, JobHandler> = {
  eligibility_scan: handleEligibilityScan,
  report_generation: handleReportGeneration,
  notification_batch: handleNotificationBatch,
  deadline_check: handleDeadlineCheck,
  program_sync: handleProgramSync,
  document_extraction: handleDocumentExtraction,
  analytics_refresh: handleAnalyticsRefresh,
};

// ============================================================================
// MAIN PROCESSOR
// ============================================================================

/**
 * Process a single background job
 */
export async function processJob(job: BackgroundJob, workerId: string): Promise<JobResult> {
  const supabase = await createClient();
  const startTime = Date.now();

  // Create context
  const context: JobContext = {
    job,
    supabase,
    workerId,
    updateProgress: async (progress: number, message?: string) => {
      await supabase.rpc('update_job_progress', {
        p_job_id: job.id,
        p_progress: progress,
        p_message: message || null,
      });
    },
    log: async (level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>) => {
      await supabase.rpc('log_job', {
        p_job_id: job.id,
        p_level: level,
        p_message: message,
        p_data: data || {},
      });
    },
  };

  // Get handler
  const handler = jobHandlers[job.job_type];
  if (!handler) {
    const error = `No handler found for job type: ${job.job_type}`;
    await context.log('error', error);
    return { success: false, error };
  }

  try {
    // Execute handler with timeout
    const timeoutMs = (job.timeout_seconds || 300) * 1000;
    const result = await Promise.race([
      handler(context),
      new Promise<JobResult>((_, reject) =>
        setTimeout(() => reject(new Error('Job timeout exceeded')), timeoutMs)
      ),
    ]);

    const duration = Date.now() - startTime;
    await context.log('info', 'Job completed', { duration_ms: duration, success: result.success });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await context.log('error', `Job failed: ${errorMessage}`, {
      stack: errorStack,
      duration_ms: Date.now() - startTime,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a new background job
 */
export async function createJob(params: {
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
}): Promise<{ id: string } | null> {
  const supabase = await createClient();

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
    p_scheduled_at: params.scheduledAt?.toISOString() || new Date().toISOString(),
    p_timeout_seconds: params.timeoutSeconds || 300,
    p_max_attempts: params.maxAttempts || 3,
    p_idempotency_key: params.idempotencyKey || null,
  });

  if (error) {
    console.error('Failed to create job:', error);
    return null;
  }

  return { id: data };
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<BackgroundJob | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('background_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Failed to get job:', error);
    return null;
  }

  return data as BackgroundJob;
}

/**
 * Get jobs with filters
 */
export async function getJobs(params: {
  organizationId?: string;
  status?: JobStatus;
  jobType?: JobType;
  projectId?: string;
  limit?: number;
  offset?: number;
}): Promise<{ jobs: BackgroundJob[]; total: number }> {
  const supabase = await createClient();

  let query = supabase
    .from('background_jobs')
    .select('*', { count: 'exact' });

  if (params.organizationId) {
    query = query.eq('organization_id', params.organizationId);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.jobType) {
    query = query.eq('job_type', params.jobType);
  }
  if (params.projectId) {
    query = query.eq('project_id', params.projectId);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Failed to get jobs:', error);
    return { jobs: [], total: 0 };
  }

  return {
    jobs: (data || []) as BackgroundJob[],
    total: count || 0,
  };
}

export default {
  processJob,
  createJob,
  getJob,
  getJobs,
};
