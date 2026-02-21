import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  createWorkflowEngine,
  validateStatusTransition,
  getValidTransitions,
  getTransitionRequirements,
  ApplicationStatus,
  STATUS_LABELS,
  STATUS_CATEGORIES,
  isTerminalStatus,
} from '@/lib/workflow-engine';

// All valid application statuses
const APPLICATION_STATUSES = [
  'draft',
  'in-progress',
  'ready-for-review',
  'submitted',
  'under-review',
  'additional-info-requested',
  'approved',
  'partially-approved',
  'rejected',
  'withdrawn',
  'expired',
] as const;

// Validation schema for status change
const statusChangeSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  reason: z.string().max(1000).optional(),
  // For approval/rejection
  amount_approved: z.number().positive().optional(),
  decision_notes: z.string().max(5000).optional(),
  decision_date: z.string().datetime().optional(),
  // For additional info requests
  requested_info: z.array(z.string()).optional(),
  // Force status change (admin only)
  force: z.boolean().optional().default(false),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]/status
 * Get current status and available transitions
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

    // Get application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        status_history,
        deadline,
        submission_date,
        decision_date,
        amount_requested,
        amount_approved,
        decision_notes
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const currentStatus = application.status as ApplicationStatus;
    const validTransitions = getValidTransitions(currentStatus);

    // Get status history with user details
    const { data: statusHistory } = await supabase
      .from('application_status_history')
      .select(`
        id,
        from_status,
        to_status,
        change_reason,
        change_source,
        validation_passed,
        created_at,
        changer:profiles!application_status_history_changed_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Build transition options with requirements
    const transitionOptions = validTransitions.map(status => ({
      status,
      label: STATUS_LABELS[status],
      requirements: getTransitionRequirements(currentStatus, status),
      is_terminal: isTerminalStatus(status),
      category: Object.entries(STATUS_CATEGORIES).find(
        ([, statuses]) => statuses.includes(status)
      )?.[0] || 'unknown',
    }));

    // Calculate time in current status
    const lastStatusChange = statusHistory?.[0];
    const timeInCurrentStatus = lastStatusChange
      ? Math.floor((Date.now() - new Date(lastStatusChange.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      data: {
        application_id: applicationId,
        current_status: currentStatus,
        current_status_label: STATUS_LABELS[currentStatus],
        is_terminal: isTerminalStatus(currentStatus),
        status_category: Object.entries(STATUS_CATEGORIES).find(
          ([, statuses]) => statuses.includes(currentStatus)
        )?.[0] || 'unknown',
        valid_transitions: transitionOptions,
        status_history: statusHistory || [],
        time_in_current_status_days: timeInCurrentStatus,
        deadline: application.deadline,
        submission_date: application.submission_date,
        decision_date: application.decision_date,
        amount_requested: application.amount_requested,
        amount_approved: application.amount_approved,
      },
      meta: {
        all_statuses: APPLICATION_STATUSES.map(status => ({
          status,
          label: STATUS_LABELS[status as ApplicationStatus],
          is_terminal: isTerminalStatus(status as ApplicationStatus),
          category: Object.entries(STATUS_CATEGORIES).find(
            ([, statuses]) => statuses.includes(status as ApplicationStatus)
          )?.[0] || 'unknown',
        })),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]/status
 * Change application status with validation
 */
export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = statusChangeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      status: newStatus,
      reason,
      amount_approved,
      decision_notes,
      decision_date,
      requested_info,
      force,
    } = validationResult.data;

    // Get current application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        organization_id,
        incentive_program_id,
        created_by,
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

    const currentStatus = application.status as ApplicationStatus;

    // Validate status transition
    const transitionValidation = validateStatusTransition(currentStatus, newStatus as ApplicationStatus);

    if (!transitionValidation.valid) {
      // Check if admin is forcing the change
      if (force && profile.role === 'admin') {
        // Allow admin to force any transition with warning
        console.warn(`Admin ${user.id} forcing status change from ${currentStatus} to ${newStatus}`);
      } else {
        return NextResponse.json(
          {
            error: transitionValidation.error,
            code: transitionValidation.code,
            current_status: currentStatus,
            requested_status: newStatus,
            valid_transitions: transitionValidation.validTransitions?.map(s => ({
              status: s,
              label: STATUS_LABELS[s],
            })),
          },
          { status: 400 }
        );
      }
    }

    // Build update data based on new status
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewer_id: user.id,
    };

    // Handle specific status transitions
    switch (newStatus) {
      case 'submitted':
        updateData.submission_date = new Date().toISOString();
        break;

      case 'approved':
      case 'partially-approved':
        updateData.amount_approved = amount_approved;
        updateData.decision_date = decision_date || new Date().toISOString();
        updateData.decision_notes = decision_notes;
        break;

      case 'rejected':
        updateData.decision_date = decision_date || new Date().toISOString();
        updateData.decision_notes = decision_notes || reason;
        break;

      case 'additional-info-requested':
        // Store requested info in review_notes or custom field
        if (requested_info && requested_info.length > 0) {
          updateData.review_notes = `Requested information:\n- ${requested_info.join('\n- ')}`;
        }
        break;
    }

    // Update application
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Note: The trigger will automatically log to application_status_history
    // and update the status_history JSONB field

    // Create a status change comment
    let commentContent = `Status changed from ${STATUS_LABELS[currentStatus]} to ${STATUS_LABELS[newStatus as ApplicationStatus]}`;
    if (reason) {
      commentContent += `\n\nReason: ${reason}`;
    }
    if (decision_notes) {
      commentContent += `\n\nDecision Notes: ${decision_notes}`;
    }
    if (requested_info && requested_info.length > 0) {
      commentContent += `\n\nRequested Information:\n- ${requested_info.join('\n- ')}`;
    }
    if (amount_approved) {
      commentContent += `\n\nAmount Approved: $${amount_approved.toLocaleString()}`;
    }

    await supabase
      .from('application_comments')
      .insert({
        application_id: applicationId,
        author_id: user.id,
        comment_type: 'status_change',
        content: commentContent,
        old_status: currentStatus,
        new_status: newStatus,
        visibility: 'team',
      });

    // Trigger workflow automations
    const workflowEngine = createWorkflowEngine(supabase);

    await workflowEngine.triggerAutomations(
      'status_changed',
      applicationId,
      { fromStatus: currentStatus, toStatus: newStatus },
      user.id
    );

    // Trigger specific automations based on new status
    if (newStatus === 'approved') {
      await workflowEngine.triggerAutomations(
        'application_approved',
        applicationId,
        { amount_approved },
        user.id
      );
    } else if (newStatus === 'rejected') {
      await workflowEngine.triggerAutomations(
        'application_rejected',
        applicationId,
        {},
        user.id
      );
    }

    // Notify application creator if someone else changed the status
    if (application.created_by && application.created_by !== user.id) {
      await workflowEngine.notifyStatusChange(
        applicationId,
        currentStatus,
        newStatus as ApplicationStatus,
        user.id
      );
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'status_change',
      p_entity_type: 'application',
      p_entity_id: applicationId,
      p_entity_name: `Application for ${(application.incentive_program as unknown as { name: string } | null)?.name || 'Unknown Program'}`,
      p_details: {
        from_status: currentStatus,
        to_status: newStatus,
        reason,
        forced: force && profile.role === 'admin',
      },
    });

    // Build response with next steps based on new status
    const nextSteps = getNextStepsForStatus(newStatus as ApplicationStatus);

    return NextResponse.json({
      data: {
        ...updatedApplication,
        previous_status: currentStatus,
        status_label: STATUS_LABELS[newStatus as ApplicationStatus],
      },
      transition: {
        from: currentStatus,
        from_label: STATUS_LABELS[currentStatus],
        to: newStatus,
        to_label: STATUS_LABELS[newStatus as ApplicationStatus],
        changed_by: profile.full_name,
        changed_at: new Date().toISOString(),
        reason,
      },
      next_steps: nextSteps,
    });
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get recommended next steps based on status
 */
function getNextStepsForStatus(status: ApplicationStatus): string[] {
  switch (status) {
    case 'draft':
      return [
        'Complete all required fields in the application',
        'Upload necessary documents',
        'Start the workflow when ready',
      ];

    case 'in-progress':
      return [
        'Complete all tasks in the checklist',
        'Upload required documents',
        'Request internal review when ready',
      ];

    case 'ready-for-review':
      return [
        'Have a team member review the application',
        'Address any feedback or concerns',
        'Submit when review is complete',
      ];

    case 'submitted':
      return [
        'Monitor email for updates from the program',
        'Be prepared to provide additional information if requested',
        'Track processing time against typical program timelines',
      ];

    case 'under-review':
      return [
        'Application is being reviewed by the program',
        'Respond promptly to any communication',
        'Check for status updates regularly',
      ];

    case 'additional-info-requested':
      return [
        'Review the requested information carefully',
        'Gather and prepare the requested documents',
        'Submit the additional information promptly',
        'Contact the program if clarification is needed',
      ];

    case 'approved':
      return [
        'Review the approval terms and conditions',
        'Complete any required compliance documentation',
        'Track disbursement timeline',
        'Set up reporting requirements if applicable',
      ];

    case 'partially-approved':
      return [
        'Review the partial approval amount and terms',
        'Understand what was not approved and why',
        'Consider appealing or reapplying if appropriate',
        'Complete requirements for approved portion',
      ];

    case 'rejected':
      return [
        'Review the rejection reasons carefully',
        'Consider requesting feedback from the program',
        'Evaluate if reapplication makes sense',
        'Explore alternative funding programs',
      ];

    case 'withdrawn':
      return [
        'Application has been withdrawn',
        'You may create a new application if circumstances change',
      ];

    case 'expired':
      return [
        'Application has expired',
        'Create a new application if still interested',
        'Ensure to submit before deadline next time',
      ];

    default:
      return [];
  }
}
