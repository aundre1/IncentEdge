import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createJob, getJobs, type JobType, type JobPriority, type JobStatus } from '@/lib/job-processor';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createJobSchema = z.object({
  job_type: z.enum([
    'eligibility_scan',
    'report_generation',
    'notification_batch',
    'deadline_check',
    'program_sync',
    'document_extraction',
    'analytics_refresh',
  ]),
  name: z.string().min(1, 'Job name is required'),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional().default('normal'),
  payload: z.record(z.unknown()).optional().default({}),
  project_id: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  document_id: z.string().uuid().optional(),
  scheduled_at: z.string().datetime().optional(),
  timeout_seconds: z.number().min(1).max(3600).optional().default(300),
  max_attempts: z.number().min(1).max(10).optional().default(3),
  idempotency_key: z.string().optional(),
});

const listJobsSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled', 'dead']).optional(),
  job_type: z.enum([
    'eligibility_scan',
    'report_generation',
    'notification_batch',
    'deadline_check',
    'program_sync',
    'document_extraction',
    'analytics_refresh',
  ]).optional(),
  project_id: z.string().uuid().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// ============================================================================
// GET - List background jobs
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = {
      status: searchParams.get('status') || undefined,
      job_type: searchParams.get('job_type') || undefined,
      project_id: searchParams.get('project_id') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validationResult = listJobsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { status, job_type, project_id, page, limit } = validationResult.data;
    const offset = (page - 1) * limit;

    // Fetch jobs using the job processor
    const { jobs, total } = await getJobs({
      organizationId: profile.organization_id,
      status: status as JobStatus | undefined,
      jobType: job_type as JobType | undefined,
      projectId: project_id,
      limit,
      offset,
    });

    return NextResponse.json({
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST - Create a new background job
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createJobSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validate related entities exist
    if (data.project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', data.project_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    if (data.application_id) {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('id')
        .eq('id', data.application_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
    }

    if (data.document_id) {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('id')
        .eq('id', data.document_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (docError || !document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
    }

    // Create the job
    const result = await createJob({
      jobType: data.job_type as JobType,
      name: data.name,
      organizationId: profile.organization_id,
      createdBy: user.id,
      priority: data.priority as JobPriority,
      payload: data.payload,
      projectId: data.project_id,
      applicationId: data.application_id,
      documentId: data.document_id,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      timeoutSeconds: data.timeout_seconds,
      maxAttempts: data.max_attempts,
      idempotencyKey: data.idempotency_key,
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Fetch the created job
    const { data: job } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', result.id)
      .single();

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'background_job',
      p_entity_id: result.id,
      p_entity_name: data.name,
      p_details: { job_type: data.job_type },
    });

    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Cancel pending jobs (bulk)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Only admins and managers can cancel jobs
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { job_ids } = body as { job_ids?: string[] };

    if (!job_ids || !Array.isArray(job_ids) || job_ids.length === 0) {
      return NextResponse.json({ error: 'job_ids array is required' }, { status: 400 });
    }

    // Cancel pending jobs
    const { data: cancelled, error } = await supabase
      .from('background_jobs')
      .update({ status: 'cancelled' })
      .in('id', job_ids)
      .eq('organization_id', profile.organization_id)
      .eq('status', 'pending')
      .select('id');

    if (error) {
      console.error('Error cancelling jobs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        cancelled: cancelled?.length || 0,
        requested: job_ids.length,
      },
    });
  } catch (error) {
    console.error('Error in DELETE /api/jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
