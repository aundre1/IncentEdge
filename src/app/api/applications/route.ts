import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  createWorkflowEngine,
  validateStatusTransition,
  ApplicationStatus,
} from '@/lib/workflow-engine';
import { sanitizeSearchTerm, sanitizeQueryParams } from '@/lib/security/input-sanitizer';

// Validation schema for creating an application
const createApplicationSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  incentive_program_id: z.string().uuid('Invalid incentive program ID'),
  incentive_match_id: z.string().uuid().optional(),
  amount_requested: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  fee_type: z.enum(['fixed', 'success', 'none']).optional(),
  fee_amount: z.number().optional(),
  // Optional: use a specific template
  template_id: z.string().uuid().optional(),
  // Optional: start workflow immediately
  start_workflow: z.boolean().optional().default(false),
});

/**
 * GET /api/applications
 * List all applications for the current organization
 */
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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Parse and sanitize query parameters
    const { searchParams } = new URL(request.url);
    const params = sanitizeQueryParams(searchParams);
    const status = params.getString('status', 100);
    const projectId = params.getUUID('project_id');
    const programId = params.getUUID('program_id');
    const search = params.getSearchTerm('search');
    const sortBy = params.getEnum('sort_by', ['created_at', 'deadline', 'status', 'amount_requested', 'submission_date'] as const) || 'created_at';
    const sortOrder = params.getEnum('sort_order', ['asc', 'desc'] as const) || 'desc';
    const page = params.getNumber('page', { min: 1, integer: true }) || 1;
    const limit = params.getNumber('limit', { min: 1, max: 100, integer: true }) || 20;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('applications')
      .select(`
        *,
        project:projects(id, name, address_line1, city, state),
        incentive_program:incentive_programs(id, name, category, program_type, application_deadline),
        created_by_user:profiles!applications_created_by_fkey(id, full_name, email),
        tasks:application_tasks(count),
        comments:application_comments(count)
      `, { count: 'exact' })
      .eq('organization_id', profile.organization_id);

    // Apply filters
    if (status && status !== 'all') {
      // Support comma-separated statuses
      const statuses = status.split(',');
      if (statuses.length === 1) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', statuses);
      }
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (programId) {
      query = query.eq('incentive_program_id', programId);
    }

    if (search) {
      // Search in application number using sanitized search term
      // Supabase's .ilike() operator properly handles parameterization
      const sanitized = sanitizeSearchTerm(search);
      query = query.ilike('application_number', `%${sanitized.value}%`);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    switch (sortBy) {
      case 'deadline':
        query = query.order('deadline', { ascending, nullsFirst: false });
        break;
      case 'status':
        query = query.order('status', { ascending });
        break;
      case 'amount_requested':
        query = query.order('amount_requested', { ascending, nullsFirst: false });
        break;
      case 'submission_date':
        query = query.order('submission_date', { ascending, nullsFirst: false });
        break;
      default:
        query = query.order('created_at', { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process applications to add computed fields
    const processedApplications = applications?.map(app => {
      const deadline = app.deadline ? new Date(app.deadline) : null;
      const daysUntilDeadline = deadline
        ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...app,
        days_until_deadline: daysUntilDeadline,
        is_overdue: daysUntilDeadline !== null && daysUntilDeadline < 0,
        task_count: Array.isArray(app.tasks) ? app.tasks[0]?.count || 0 : 0,
        comment_count: Array.isArray(app.comments) ? app.comments[0]?.count || 0 : 0,
      };
    });

    return NextResponse.json({
      data: processedApplications,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications
 * Create a new application
 */
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
    const validationResult = createApplicationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const applicationData = validationResult.data;

    // Verify project belongs to organization
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, organization_id')
      .eq('id', applicationData.project_id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or does not belong to your organization' },
        { status: 404 }
      );
    }

    // Verify incentive program exists
    const { data: program, error: programError } = await supabase
      .from('incentive_programs')
      .select('id, name, application_deadline, typical_processing_days')
      .eq('id', applicationData.incentive_program_id)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { error: 'Incentive program not found' },
        { status: 404 }
      );
    }

    // Calculate deadline if not provided
    let deadline = applicationData.deadline;
    if (!deadline) {
      const workflowEngine = createWorkflowEngine(supabase);
      const deadlineResult = await workflowEngine.calculateDeadline(
        applicationData.incentive_program_id
      );
      deadline = deadlineResult.deadline.toISOString();
    }

    // Validate initial status (must be draft)
    const statusValidation = validateStatusTransition(null, 'draft');
    if (!statusValidation.valid) {
      return NextResponse.json(
        { error: statusValidation.error },
        { status: 400 }
      );
    }

    // Create application
    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert({
        project_id: applicationData.project_id,
        incentive_program_id: applicationData.incentive_program_id,
        incentive_match_id: applicationData.incentive_match_id,
        organization_id: profile.organization_id,
        status: 'draft',
        amount_requested: applicationData.amount_requested,
        deadline,
        fee_type: applicationData.fee_type,
        fee_amount: applicationData.fee_amount,
        created_by: user.id,
        status_history: [{ status: 'draft', timestamp: new Date().toISOString(), user_id: user.id }],
      })
      .select(`
        *,
        project:projects(id, name),
        incentive_program:incentive_programs(id, name, category)
      `)
      .single();

    if (createError) {
      console.error('Error creating application:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'application',
      p_entity_id: application.id,
      p_entity_name: `Application for ${program.name}`,
      p_details: {
        project_id: applicationData.project_id,
        program_id: applicationData.incentive_program_id,
      },
    });

    // If start_workflow is true, move to in-progress and create tasks
    if (applicationData.start_workflow) {
      const workflowEngine = createWorkflowEngine(supabase);
      const startResult = await workflowEngine.startWorkflow(application.id, user.id);

      if (!startResult.success) {
        // Application created but workflow didn't start - return with warning
        return NextResponse.json({
          data: application,
          warning: `Application created but workflow could not be started: ${startResult.error}`,
        }, { status: 201 });
      }

      // Fetch updated application
      const { data: updatedApplication } = await supabase
        .from('applications')
        .select(`
          *,
          project:projects(id, name),
          incentive_program:incentive_programs(id, name, category),
          tasks:application_tasks(*)
        `)
        .eq('id', application.id)
        .single();

      return NextResponse.json({
        data: updatedApplication,
        workflow_started: true,
      }, { status: 201 });
    }

    return NextResponse.json({ data: application }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
