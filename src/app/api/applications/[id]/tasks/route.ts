import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { createWorkflowEngine, TaskStatus, TaskPriority } from '@/lib/workflow-engine';

// Validation schema for creating a task
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  category: z.enum(['documentation', 'review', 'submission', 'follow_up', 'compliance', 'other']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime().optional(),
  assigned_to: z.string().uuid().optional(),
  estimated_hours: z.number().positive().optional(),
  depends_on: z.array(z.string().uuid()).optional(),
});

// Validation schema for updating a task
const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  category: z.enum(['documentation', 'review', 'submission', 'follow_up', 'compliance', 'other']).optional(),
  status: z.enum(['pending', 'in_progress', 'blocked', 'completed', 'skipped', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  due_date: z.string().datetime().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  estimated_hours: z.number().positive().nullable().optional(),
  actual_hours: z.number().positive().nullable().optional(),
  completion_notes: z.string().optional(),
  sort_order: z.number().int().optional(),
});

// Validation schema for bulk task operations
const bulkTaskSchema = z.object({
  task_ids: z.array(z.string().uuid()),
  action: z.enum(['complete', 'skip', 'cancel', 'reassign', 'update_priority']),
  assigned_to: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]/tasks
 * Get all tasks for an application
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

    // Verify application access
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, organization_id')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assigned_to');
    const category = searchParams.get('category');
    const includeCompleted = searchParams.get('include_completed') === 'true';

    // Build query
    let query = supabase
      .from('application_tasks')
      .select(`
        *,
        assigned_user:profiles!application_tasks_assigned_to_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        completed_by_user:profiles!application_tasks_completed_by_fkey(
          id,
          full_name
        ),
        created_by_user:profiles!application_tasks_created_by_fkey(
          id,
          full_name
        )
      `)
      .eq('application_id', applicationId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    } else if (!includeCompleted) {
      query = query.not('status', 'in', '("completed","skipped","cancelled")');
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (assignedTo) {
      if (assignedTo === 'me') {
        query = query.eq('assigned_to', user.id);
      } else if (assignedTo === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', assignedTo);
      }
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate summary statistics
    const allTasks = tasks || [];
    const summary = {
      total: allTasks.length,
      pending: allTasks.filter(t => t.status === 'pending').length,
      in_progress: allTasks.filter(t => t.status === 'in_progress').length,
      blocked: allTasks.filter(t => t.status === 'blocked').length,
      completed: allTasks.filter(t => t.status === 'completed').length,
      skipped: allTasks.filter(t => t.status === 'skipped').length,
      cancelled: allTasks.filter(t => t.status === 'cancelled').length,
      overdue: allTasks.filter(t =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        !['completed', 'skipped', 'cancelled'].includes(t.status)
      ).length,
      completion_percentage: allTasks.length > 0
        ? Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100)
        : 0,
    };

    // Add computed fields to tasks
    const processedTasks = allTasks.map(task => ({
      ...task,
      is_overdue: task.due_date &&
        new Date(task.due_date) < new Date() &&
        !['completed', 'skipped', 'cancelled'].includes(task.status),
      days_until_due: task.due_date
        ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
    }));

    return NextResponse.json({
      data: processedTasks,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/applications/[id]/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/applications/[id]/tasks
 * Create a new task or perform bulk operations
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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Verify application exists and belongs to organization
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, status, organization_id')
      .eq('id', applicationId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found or access denied' },
        { status: 404 }
      );
    }

    // Check if application is in a terminal state
    const workflowEngine = createWorkflowEngine(supabase);
    if (workflowEngine.isTerminalStatus(application.status as Parameters<typeof workflowEngine.isTerminalStatus>[0])) {
      return NextResponse.json(
        { error: 'Cannot modify tasks for an application in a terminal state' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Check if this is a bulk operation
    if (body.action && body.task_ids) {
      const bulkValidation = bulkTaskSchema.safeParse(body);
      if (!bulkValidation.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: bulkValidation.error.errors },
          { status: 400 }
        );
      }

      const { task_ids, action, assigned_to, priority } = bulkValidation.data;

      // Perform bulk operation
      let updateData: Record<string, unknown> = {};

      switch (action) {
        case 'complete':
          updateData = {
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: user.id,
          };
          break;
        case 'skip':
          updateData = { status: 'skipped' };
          break;
        case 'cancel':
          updateData = { status: 'cancelled' };
          break;
        case 'reassign':
          if (!assigned_to) {
            return NextResponse.json(
              { error: 'assigned_to is required for reassign action' },
              { status: 400 }
            );
          }
          updateData = {
            assigned_to,
            assigned_at: new Date().toISOString(),
            assigned_by: user.id,
          };
          break;
        case 'update_priority':
          if (!priority) {
            return NextResponse.json(
              { error: 'priority is required for update_priority action' },
              { status: 400 }
            );
          }
          updateData = { priority };
          break;
      }

      const { data: updatedTasks, error: updateError } = await supabase
        .from('application_tasks')
        .update(updateData)
        .eq('application_id', applicationId)
        .in('id', task_ids)
        .select();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Trigger automation if tasks completed
      if (action === 'complete') {
        const { total, completed } = await workflowEngine.getTaskCompletionPercentage(applicationId);
        if (total > 0 && total === completed) {
          await workflowEngine.triggerAutomations(
            'all_tasks_completed',
            applicationId,
            { completedCount: completed },
            user.id
          );
        }
      }

      return NextResponse.json({
        data: updatedTasks,
        updated_count: updatedTasks?.length || 0,
      });
    }

    // Regular task creation
    const validationResult = createTaskSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const taskData = validationResult.data;

    // Get max sort order
    const { data: maxOrderResult } = await supabase
      .from('application_tasks')
      .select('sort_order')
      .eq('application_id', applicationId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (maxOrderResult?.sort_order || 0) + 1;

    // Create task
    const { data: task, error: createError } = await supabase
      .from('application_tasks')
      .insert({
        application_id: applicationId,
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        due_date: taskData.due_date,
        assigned_to: taskData.assigned_to,
        assigned_at: taskData.assigned_to ? new Date().toISOString() : null,
        assigned_by: taskData.assigned_to ? user.id : null,
        estimated_hours: taskData.estimated_hours,
        depends_on: taskData.depends_on || [],
        sort_order: nextSortOrder,
        created_by: user.id,
        auto_generated: false,
      })
      .select(`
        *,
        assigned_user:profiles!application_tasks_assigned_to_fkey(
          id,
          full_name,
          email
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Notify assigned user if different from creator
    if (taskData.assigned_to && taskData.assigned_to !== user.id) {
      await workflowEngine.notifyTaskAssignment(task.id, taskData.assigned_to, user.id);
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'task',
      p_entity_id: task.id,
      p_entity_name: task.title,
      p_details: { application_id: applicationId },
    });

    return NextResponse.json({ data: task }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/applications/[id]/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/applications/[id]/tasks
 * Update a specific task (task_id in query param or body)
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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id') || body.task_id;

    if (!taskId) {
      return NextResponse.json(
        { error: 'task_id is required in query parameter or request body' },
        { status: 400 }
      );
    }

    // Verify task belongs to this application
    const { data: existingTask, error: taskError } = await supabase
      .from('application_tasks')
      .select(`
        *,
        application:applications(id, status, organization_id)
      `)
      .eq('id', taskId)
      .eq('application_id', applicationId)
      .single();

    if (taskError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const app = existingTask.application as { id: string; status: string; organization_id: string };
    if (app.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate update data
    const validationResult = updateTaskSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...validationResult.data };
    delete updateData.task_id; // Remove task_id if present

    // Handle status change to completed
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = user.id;
    }

    // Handle assignment change
    if (updateData.assigned_to !== undefined && updateData.assigned_to !== existingTask.assigned_to) {
      updateData.assigned_at = updateData.assigned_to ? new Date().toISOString() : null;
      updateData.assigned_by = updateData.assigned_to ? user.id : null;
    }

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('application_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        assigned_user:profiles!application_tasks_assigned_to_fkey(
          id,
          full_name,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Notify new assignee if changed
    if (
      updateData.assigned_to &&
      updateData.assigned_to !== existingTask.assigned_to &&
      updateData.assigned_to !== user.id
    ) {
      const workflowEngine = createWorkflowEngine(supabase);
      await workflowEngine.notifyTaskAssignment(taskId, updateData.assigned_to as string, user.id);
    }

    // Trigger automation if task completed
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      const workflowEngine = createWorkflowEngine(supabase);
      await workflowEngine.triggerAutomations(
        'task_completed',
        applicationId,
        { taskId, taskTitle: task.title },
        user.id
      );

      // Check if all tasks completed
      const { total, completed } = await workflowEngine.getTaskCompletionPercentage(applicationId);
      if (total > 0 && total === completed) {
        await workflowEngine.triggerAutomations(
          'all_tasks_completed',
          applicationId,
          { completedCount: completed },
          user.id
        );
      }
    }

    return NextResponse.json({ data: task });
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/applications/[id]/tasks
 * Delete a task
 */
export async function DELETE(
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
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'task_id is required as query parameter' },
        { status: 400 }
      );
    }

    // Verify task belongs to this application and organization
    const { data: existingTask, error: taskError } = await supabase
      .from('application_tasks')
      .select(`
        id,
        title,
        auto_generated,
        application:applications(organization_id)
      `)
      .eq('id', taskId)
      .eq('application_id', applicationId)
      .single();

    if (taskError || !existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const app = existingTask.application as unknown as { organization_id: string } | null;
    if (!app || app.organization_id !== profile.organization_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from('application_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'delete',
      p_entity_type: 'task',
      p_entity_id: taskId,
      p_entity_name: existingTask.title,
      p_details: { application_id: applicationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/applications/[id]/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
