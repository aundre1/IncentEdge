import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getJob } from '@/lib/job-processor';

// ============================================================================
// GET - Get job details by ID
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Fetch job with related data
    const { data: job, error } = await supabase
      .from('background_jobs')
      .select(`
        *,
        projects (id, name),
        applications (id, status),
        documents (id, name),
        profiles:created_by (id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      console.error('Error fetching job:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check organization access (system jobs have null organization_id)
    if (job.organization_id && job.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch job logs
    const { data: logs } = await supabase
      .from('job_logs')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: true })
      .limit(100);

    return NextResponse.json({
      data: {
        ...job,
        logs: logs || [],
      },
    });
  } catch (error) {
    console.error('Error in GET /api/jobs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH - Update job (cancel or retry)
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Only admins and managers can modify jobs
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch current job
    const { data: job, error: fetchError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check organization access
    if (job.organization_id && job.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { action, priority } = body as { action?: string; priority?: string };

    // Handle actions
    if (action === 'cancel') {
      if (!['pending', 'running'].includes(job.status)) {
        return NextResponse.json(
          { error: 'Only pending or running jobs can be cancelled' },
          { status: 400 }
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from('background_jobs')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Log the cancellation
      await supabase.rpc('log_job', {
        p_job_id: id,
        p_level: 'info',
        p_message: `Job cancelled by ${profile.role}`,
        p_data: { cancelled_by: user.id },
      });

      return NextResponse.json({ data: updated });
    }

    if (action === 'retry') {
      if (!['failed', 'dead'].includes(job.status)) {
        return NextResponse.json(
          { error: 'Only failed or dead jobs can be retried' },
          { status: 400 }
        );
      }

      // Create a new job with the same parameters
      const { data: newJobId, error: createError } = await supabase.rpc('create_background_job', {
        p_job_type: job.job_type,
        p_name: `[Retry] ${job.name}`,
        p_organization_id: job.organization_id,
        p_created_by: user.id,
        p_priority: job.priority,
        p_payload: { ...job.payload, _retried_from: id },
        p_project_id: job.project_id,
        p_application_id: job.application_id,
        p_document_id: job.document_id,
        p_timeout_seconds: job.timeout_seconds,
        p_max_attempts: 1,
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      // Fetch the new job
      const { data: newJob } = await supabase
        .from('background_jobs')
        .select('*')
        .eq('id', newJobId)
        .single();

      return NextResponse.json({
        data: newJob,
        message: `Job retried. New job ID: ${newJobId}`,
      });
    }

    if (priority) {
      if (!['low', 'normal', 'high', 'critical'].includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority. Must be one of: low, normal, high, critical' },
          { status: 400 }
        );
      }

      if (job.status !== 'pending') {
        return NextResponse.json(
          { error: 'Only pending jobs can have their priority changed' },
          { status: 400 }
        );
      }

      const { data: updated, error: updateError } = await supabase
        .from('background_jobs')
        .update({ priority })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ data: updated });
    }

    return NextResponse.json(
      { error: 'No valid action or update provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/jobs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Delete a job (only pending/cancelled/completed)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Only admins can delete jobs
    if (profile.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can delete jobs' }, { status: 403 });
    }

    // Fetch current job
    const { data: job, error: fetchError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check organization access
    if (job.organization_id && job.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only allow deletion of non-running jobs
    if (job.status === 'running') {
      return NextResponse.json(
        { error: 'Cannot delete a running job. Cancel it first.' },
        { status: 400 }
      );
    }

    // Delete the job (cascades to logs)
    const { error: deleteError } = await supabase
      .from('background_jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'background_job',
      p_entity_id: id,
      p_entity_name: job.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/jobs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
