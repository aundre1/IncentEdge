import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createWorkflowEngine } from '@/lib/workflow-engine';

// Validation schema for updating an application
const updateApplicationSchema = z.object({
  amount_requested: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  application_number: z.string().max(100).optional(),
  fee_type: z.enum(['fixed', 'success', 'none']).optional(),
  fee_amount: z.number().optional(),
  fee_paid: z.boolean().optional(),
  review_notes: z.string().optional(),
  ai_generated_content: z.record(z.unknown()).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * Get a single application with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get application with all related data
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        project:projects(
          id,
          name,
          address_line1,
          city,
          state,
          zip_code,
          total_sqft,
          total_units,
          building_type,
          sector_type
        ),
        incentive_program:incentive_programs(
          id,
          name,
          short_name,
          category,
          program_type,
          incentive_type,
          amount_type,
          amount_fixed,
          amount_percentage,
          amount_max,
          application_deadline,
          typical_processing_days,
          required_documents,
          application_url,
          administering_agency
        ),
        incentive_match:project_incentive_matches(
          id,
          overall_score,
          estimated_value,
          match_details
        ),
        created_by_user:profiles!applications_created_by_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        reviewer:profiles!applications_reviewer_id_fkey(
          id,
          full_name,
          email
        ),
        tasks:application_tasks(
          id,
          title,
          description,
          category,
          status,
          priority,
          sort_order,
          assigned_to,
          due_date,
          completed_at
        ),
        comments:application_comments(
          id,
          content,
          comment_type,
          author_id,
          created_at,
          is_deleted
        ),
        reminders:application_reminders(
          id,
          reminder_type,
          title,
          remind_at,
          status
        ),
        documents:documents(
          id,
          name,
          document_type,
          file_path,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      console.error('Error fetching application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get workflow engine for computed fields
    const workflowEngine = createWorkflowEngine(supabase);

    // Calculate task completion
    const taskCompletion = await workflowEngine.getTaskCompletionPercentage(id);

    // Calculate days until deadline
    const deadline = application.deadline ? new Date(application.deadline) : null;
    const daysUntilDeadline = deadline
      ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    // Get status history
    const { data: statusHistory } = await supabase
      .from('application_status_history')
      .select(`
        id,
        from_status,
        to_status,
        change_reason,
        change_source,
        changed_by,
        created_at,
        changer:profiles!application_status_history_changed_by_fkey(full_name)
      `)
      .eq('application_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Get valid next statuses
    const validTransitions = workflowEngine.getValidTransitions(
      application.status as Parameters<typeof workflowEngine.getValidTransitions>[0]
    );

    // Process response
    const responseData = {
      ...application,
      // Filter out deleted comments
      comments: application.comments?.filter((c: { is_deleted: boolean }) => !c.is_deleted) || [],
      // Computed fields
      task_completion: taskCompletion,
      days_until_deadline: daysUntilDeadline,
      is_overdue: daysUntilDeadline !== null && daysUntilDeadline < 0,
      deadline_urgency: deadline ? workflowEngine.getDeadlineUrgency(deadline) : null,
      valid_transitions: validTransitions,
      status_history_detailed: statusHistory || [],
      is_terminal: workflowEngine.isTerminalStatus(
        application.status as Parameters<typeof workflowEngine.isTerminalStatus>[0]
      ),
    };

    return NextResponse.json({ data: responseData });
  } catch (error) {
    console.error('Error in GET /api/applications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]
 * Update an application
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify application exists and belongs to organization
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, organization_id, incentive_program_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (fetchError || !existingApplication) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    // Check if application is in a terminal state
    const workflowEngine = createWorkflowEngine(supabase);
    if (workflowEngine.isTerminalStatus(existingApplication.status)) {
      return NextResponse.json(
        { error: 'Cannot modify an application in a terminal state' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update application
    const { data: application, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        project:projects(id, name),
        incentive_program:incentive_programs(id, name, category)
      `)
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'application',
      p_entity_id: application.id,
      p_entity_name: `Application ${application.application_number || application.id}`,
      p_details: { updated_fields: Object.keys(updateData) },
    });

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (only allowed for draft status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify application exists and belongs to organization
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('id, status, organization_id, incentive_program_id')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (fetchError || !existingApplication) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow deletion of draft applications (or by admin)
    if (existingApplication.status !== 'draft' && profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only draft applications can be deleted. Consider withdrawing instead.' },
        { status: 400 }
      );
    }

    // Get program name for logging
    const { data: program } = await supabase
      .from('incentive_programs')
      .select('name')
      .eq('id', existingApplication.incentive_program_id)
      .single();

    // Delete application (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting application:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'application',
      p_entity_id: id,
      p_entity_name: `Application for ${program?.name || 'Unknown Program'}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/applications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
