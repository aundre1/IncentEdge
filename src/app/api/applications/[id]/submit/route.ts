import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  createWorkflowEngine,
  validateStatusTransition,
  getTransitionRequirements,
  ApplicationStatus,
} from '@/lib/workflow-engine';

// Validation schema for submission
const submitApplicationSchema = z.object({
  // Optional: Override to force submit even with warnings
  force: z.boolean().optional().default(false),
  // Optional: Notes for the submission
  submission_notes: z.string().max(2000).optional(),
  // Optional: Application number from external system
  application_number: z.string().max(100).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]/submit
 * Get submission readiness check
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get application with related data
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        deadline,
        organization_id,
        amount_requested,
        incentive_program:incentive_programs(
          id,
          name,
          required_documents,
          application_url
        ),
        tasks:application_tasks(
          id,
          title,
          status,
          priority,
          category
        ),
        documents:documents(
          id,
          document_type
        )
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const workflowEngine = createWorkflowEngine(supabase);
    const currentStatus = application.status as ApplicationStatus;

    // Determine target status based on current status
    let targetStatus: ApplicationStatus = 'submitted';
    if (currentStatus === 'draft') {
      targetStatus = 'in-progress'; // Need to start workflow first
    } else if (currentStatus === 'in-progress') {
      targetStatus = 'ready-for-review';
    } else if (currentStatus === 'ready-for-review') {
      targetStatus = 'submitted';
    }

    // Validate transition
    const transitionValidation = validateStatusTransition(currentStatus, targetStatus);

    // Get task completion stats
    const taskCompletion = await workflowEngine.getTaskCompletionPercentage(applicationId);
    const { allCompleted: requiredTasksCompleted, pendingTasks } =
      await workflowEngine.areRequiredTasksCompleted(applicationId);

    // Check required documents
    const program = application.incentive_program as { required_documents?: { type: string; required: boolean }[] };
    const requiredDocs = (program.required_documents || [])
      .filter((doc: { required: boolean }) => doc.required)
      .map((doc: { type: string }) => doc.type);

    const uploadedDocTypes = (application.documents || []).map((doc: { document_type: string }) => doc.document_type);
    const missingDocuments = requiredDocs.filter((docType: string) => !uploadedDocTypes.includes(docType));

    // Check deadline
    const deadline = application.deadline ? new Date(application.deadline) : null;
    const daysUntilDeadline = deadline
      ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;

    // Build readiness assessment
    const blockers: string[] = [];
    const warnings: string[] = [];

    // Check transition validity
    if (!transitionValidation.valid) {
      blockers.push(transitionValidation.error || 'Invalid status transition');
    }

    // Check required tasks
    if (!requiredTasksCompleted && pendingTasks.length > 0) {
      blockers.push(`Required tasks incomplete: ${pendingTasks.join(', ')}`);
    }

    // Check required documents
    if (missingDocuments.length > 0) {
      blockers.push(`Missing required documents: ${missingDocuments.join(', ')}`);
    }

    // Check task completion percentage
    if (taskCompletion.percentage < 50) {
      warnings.push(`Only ${taskCompletion.percentage}% of tasks completed`);
    } else if (taskCompletion.percentage < 80) {
      warnings.push(`${taskCompletion.percentage}% of tasks completed. Consider completing more before submission.`);
    }

    // Check deadline
    if (isOverdue) {
      warnings.push('Application deadline has passed');
    } else if (daysUntilDeadline !== null && daysUntilDeadline <= 3) {
      warnings.push(`Deadline is in ${daysUntilDeadline} day(s)`);
    }

    // Check amount requested
    if (!application.amount_requested) {
      warnings.push('No amount requested specified');
    }

    // Determine overall readiness
    const isReady = blockers.length === 0;
    const requiresReview = currentStatus !== 'ready-for-review' && targetStatus === 'submitted';

    return NextResponse.json({
      data: {
        application_id: applicationId,
        current_status: currentStatus,
        target_status: targetStatus,
        is_ready: isReady,
        requires_review: requiresReview,
        blockers,
        warnings,
        task_completion: taskCompletion,
        required_tasks_completed: requiredTasksCompleted,
        pending_required_tasks: pendingTasks,
        missing_documents: missingDocuments,
        days_until_deadline: daysUntilDeadline,
        is_overdue: isOverdue,
        transition_requirements: getTransitionRequirements(currentStatus, targetStatus),
        application_url: (application.incentive_program as { application_url?: string })?.application_url,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/submit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications/[id]/submit
 * Submit an application (or move to ready-for-review)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = await createClient();
    const { id: applicationId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, full_name, role')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const validationResult = submitApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { force, submission_notes, application_number } = validationResult.data;

    // Get application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        deadline,
        organization_id,
        incentive_program_id,
        incentive_program:incentive_programs(name)
      `)
      .eq('id', applicationId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    const workflowEngine = createWorkflowEngine(supabase);
    const currentStatus = application.status as ApplicationStatus;

    // Determine target status and workflow path
    let targetStatus: ApplicationStatus;
    let workflowPath: ApplicationStatus[] = [];

    if (currentStatus === 'draft') {
      // Need to go through: draft -> in-progress -> ready-for-review -> submitted
      workflowPath = ['in-progress', 'ready-for-review', 'submitted'];
      targetStatus = 'submitted';
    } else if (currentStatus === 'in-progress') {
      // Need to go through: in-progress -> ready-for-review -> submitted
      workflowPath = ['ready-for-review', 'submitted'];
      targetStatus = 'submitted';
    } else if (currentStatus === 'ready-for-review') {
      // Direct submission: ready-for-review -> submitted
      workflowPath = ['submitted'];
      targetStatus = 'submitted';
    } else {
      return NextResponse.json(
        { error: `Cannot submit application in ${currentStatus} status` },
        { status: 400 }
      );
    }

    // Run readiness check
    const { allCompleted: requiredTasksCompleted, pendingTasks } =
      await workflowEngine.areRequiredTasksCompleted(applicationId);

    const blockers: string[] = [];

    if (!requiredTasksCompleted && !force) {
      blockers.push(`Required tasks incomplete: ${pendingTasks.join(', ')}`);
    }

    // If there are blockers and not forcing, return error
    if (blockers.length > 0 && !force) {
      return NextResponse.json(
        {
          error: 'Application is not ready for submission',
          blockers,
          hint: 'Set force=true to submit anyway',
        },
        { status: 400 }
      );
    }

    // Execute workflow path
    let currentApplicationStatus: ApplicationStatus = currentStatus;
    const transitionResults: { from: string; to: string; success: boolean }[] = [];

    for (const nextStatus of workflowPath) {
      // Validate transition
      const validation = validateStatusTransition(currentApplicationStatus, nextStatus);
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: `Cannot transition from ${currentApplicationStatus} to ${nextStatus}`,
            details: validation.error,
            completed_transitions: transitionResults,
          },
          { status: 400 }
        );
      }

      // Build update data
      const updateData: Record<string, unknown> = {
        status: nextStatus,
        reviewer_id: user.id,
      };

      // Add submission-specific data on final transition
      if (nextStatus === 'submitted') {
        updateData.submission_date = new Date().toISOString();
        if (application_number) {
          updateData.application_number = application_number;
        }
        if (submission_notes) {
          updateData.review_notes = submission_notes;
        }
      }

      // Update status
      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (updateError) {
        return NextResponse.json(
          {
            error: `Failed to transition to ${nextStatus}`,
            details: updateError.message,
            completed_transitions: transitionResults,
          },
          { status: 500 }
        );
      }

      transitionResults.push({
        from: currentApplicationStatus,
        to: nextStatus,
        success: true,
      });

      // Trigger automations for this transition
      await workflowEngine.triggerAutomations(
        'status_changed',
        applicationId,
        { fromStatus: currentApplicationStatus, toStatus: nextStatus },
        user.id
      );

      // Trigger specific automation for submission
      if (nextStatus === 'submitted') {
        await workflowEngine.triggerAutomations(
          'application_submitted',
          applicationId,
          {},
          user.id
        );
      }

      // Create status change comment
      await supabase
        .from('application_comments')
        .insert({
          application_id: applicationId,
          author_id: user.id,
          comment_type: 'status_change',
          content: `Application status changed from ${currentApplicationStatus} to ${nextStatus}${nextStatus === 'submitted' ? '. Application has been submitted.' : ''}`,
          old_status: currentApplicationStatus,
          new_status: nextStatus,
          visibility: 'team',
        });

      currentApplicationStatus = nextStatus;
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'submit',
      p_entity_type: 'application',
      p_entity_id: applicationId,
      p_entity_name: `Application for ${(application.incentive_program as unknown as { name: string } | null)?.name || 'Unknown Program'}`,
      p_details: {
        workflow_path: workflowPath,
        forced: force,
      },
    });

    // Get updated application
    const { data: updatedApplication } = await supabase
      .from('applications')
      .select(`
        *,
        project:projects(id, name),
        incentive_program:incentive_programs(id, name, category, application_url)
      `)
      .eq('id', applicationId)
      .single();

    return NextResponse.json({
      data: updatedApplication,
      transitions: transitionResults,
      message: 'Application submitted successfully',
      next_steps: [
        'Monitor your email for updates from the program administrator',
        'Track the application status in IncentEdge',
        'Respond promptly to any requests for additional information',
      ],
    });
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/submit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
