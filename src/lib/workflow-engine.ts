/**
 * IncentEdge Workflow Engine
 *
 * Manages application workflow automation including:
 * - Status transition validation
 * - Automatic task creation
 * - Deadline calculation
 * - Notification triggers
 * - Reminder scheduling
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export type ApplicationStatus =
  | 'draft'
  | 'in-progress'
  | 'ready-for-review'
  | 'submitted'
  | 'under-review'
  | 'additional-info-requested'
  | 'approved'
  | 'partially-approved'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'skipped' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ReminderType =
  | 'deadline_approaching'
  | 'task_due'
  | 'follow_up'
  | 'status_check'
  | 'document_expiry'
  | 'review_needed'
  | 'submission_reminder'
  | 'custom';

export type AutomationTriggerType =
  | 'application_created'
  | 'status_changed'
  | 'task_completed'
  | 'task_overdue'
  | 'deadline_approaching'
  | 'document_uploaded'
  | 'comment_added'
  | 'all_tasks_completed'
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'scheduled'
  | 'manual';

export interface StatusTransitionResult {
  valid: boolean;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  validTransitions?: ApplicationStatus[];
  error?: string;
  code?: string;
  message?: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  category?: string;
  order: number;
  estimatedDays?: number;
  estimatedHours?: number;
  priority?: TaskPriority;
}

export interface ApplicationTask {
  id: string;
  applicationId: string;
  title: string;
  description?: string;
  category?: string;
  status: TaskStatus;
  priority: TaskPriority;
  sortOrder: number;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  completedBy?: string;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  triggerType: AutomationTriggerType;
  triggerConfig: Record<string, unknown>;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  priority: number;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface AutomationAction {
  type: 'create_tasks' | 'send_notification' | 'update_status' | 'assign_user' | 'schedule_reminders' | 'add_comment';
  config: Record<string, unknown>;
}

export interface AutomationExecutionResult {
  success: boolean;
  executionId?: string;
  actionsExecuted: {
    action: string;
    status: 'success' | 'failed';
    result?: unknown;
    error?: string;
  }[];
  durationMs?: number;
  error?: string;
}

export interface DeadlineCalculationResult {
  deadline: Date;
  source: 'program_deadline' | 'processing_time' | 'template' | 'default';
  daysFromNow: number;
}

// ============================================================================
// STATUS TRANSITION VALIDATION
// ============================================================================

/**
 * Valid status transitions map
 * Key: current status, Value: array of valid next statuses
 */
const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  'draft': ['in-progress', 'withdrawn'],
  'in-progress': ['ready-for-review', 'draft', 'withdrawn'],
  'ready-for-review': ['submitted', 'in-progress', 'withdrawn'],
  'submitted': ['under-review', 'withdrawn'],
  'under-review': ['additional-info-requested', 'approved', 'partially-approved', 'rejected'],
  'additional-info-requested': ['under-review', 'withdrawn', 'expired'],
  'approved': [], // Terminal state
  'partially-approved': [], // Terminal state
  'rejected': [], // Terminal state
  'withdrawn': ['draft'], // Can reopen
  'expired': [], // Terminal state
};

/**
 * Human-readable status labels
 */
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  'draft': 'Draft',
  'in-progress': 'In Progress',
  'ready-for-review': 'Ready for Review',
  'submitted': 'Submitted',
  'under-review': 'Under Review',
  'additional-info-requested': 'Additional Info Requested',
  'approved': 'Approved',
  'partially-approved': 'Partially Approved',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
  'expired': 'Expired',
};

/**
 * Status categories for UI grouping
 */
export const STATUS_CATEGORIES = {
  active: ['draft', 'in-progress', 'ready-for-review'] as ApplicationStatus[],
  pending: ['submitted', 'under-review', 'additional-info-requested'] as ApplicationStatus[],
  completed: ['approved', 'partially-approved'] as ApplicationStatus[],
  closed: ['rejected', 'withdrawn', 'expired'] as ApplicationStatus[],
};

/**
 * Get valid transitions from a given status
 */
export function getValidTransitions(currentStatus: ApplicationStatus): ApplicationStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if a status is a terminal state
 */
export function isTerminalStatus(status: ApplicationStatus): boolean {
  return STATUS_TRANSITIONS[status]?.length === 0;
}

/**
 * Validate if a status transition is allowed
 */
export function validateStatusTransition(
  fromStatus: ApplicationStatus | null,
  toStatus: ApplicationStatus
): StatusTransitionResult {
  // If no current status, only draft is valid
  if (!fromStatus) {
    if (toStatus === 'draft') {
      return {
        valid: true,
        fromStatus: null,
        toStatus,
        message: 'New application created in draft status',
      };
    }
    return {
      valid: false,
      fromStatus: null,
      toStatus,
      error: 'New applications must start in draft status',
      code: 'INVALID_INITIAL_STATUS',
    };
  }

  const validTransitions = getValidTransitions(fromStatus);

  if (validTransitions.includes(toStatus)) {
    return {
      valid: true,
      fromStatus,
      toStatus,
      message: `Status transition from ${STATUS_LABELS[fromStatus]} to ${STATUS_LABELS[toStatus]} is valid`,
    };
  }

  return {
    valid: false,
    fromStatus,
    toStatus,
    validTransitions,
    error: `Cannot transition from ${STATUS_LABELS[fromStatus]} to ${STATUS_LABELS[toStatus]}`,
    code: 'INVALID_TRANSITION',
  };
}

/**
 * Get required actions before a status transition
 */
export function getTransitionRequirements(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): string[] {
  const requirements: string[] = [];

  // Transition-specific requirements
  if (toStatus === 'ready-for-review') {
    requirements.push('All required documents must be uploaded');
    requirements.push('All required fields must be completed');
  }

  if (toStatus === 'submitted') {
    requirements.push('Application must pass internal review');
    requirements.push('All tasks marked as required must be completed');
  }

  if (fromStatus === 'additional-info-requested' && toStatus === 'under-review') {
    requirements.push('Requested information must be provided');
  }

  return requirements;
}

// ============================================================================
// DEADLINE CALCULATION
// ============================================================================

/**
 * Calculate application deadline based on program and template settings
 */
export async function calculateDeadline(
  supabase: SupabaseClient,
  incentiveProgramId: string,
  startDate: Date = new Date()
): Promise<DeadlineCalculationResult> {
  // Try to get program deadline first
  const { data: program } = await supabase
    .from('incentive_programs')
    .select('application_deadline, typical_processing_days')
    .eq('id', incentiveProgramId)
    .single();

  if (program?.application_deadline) {
    const deadline = new Date(program.application_deadline);
    return {
      deadline,
      source: 'program_deadline',
      daysFromNow: Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    };
  }

  if (program?.typical_processing_days) {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + program.typical_processing_days);
    return {
      deadline,
      source: 'processing_time',
      daysFromNow: program.typical_processing_days,
    };
  }

  // Try to get from template
  const { data: template } = await supabase
    .from('application_templates')
    .select('default_deadline_days')
    .eq('incentive_program_id', incentiveProgramId)
    .eq('is_active', true)
    .order('is_system_template', { ascending: false })
    .limit(1)
    .single();

  if (template?.default_deadline_days) {
    const deadline = new Date(startDate);
    deadline.setDate(deadline.getDate() + template.default_deadline_days);
    return {
      deadline,
      source: 'template',
      daysFromNow: template.default_deadline_days,
    };
  }

  // Default to 30 days
  const defaultDays = 30;
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + defaultDays);
  return {
    deadline,
    source: 'default',
    daysFromNow: defaultDays,
  };
}

/**
 * Calculate days until deadline
 */
export function getDaysUntilDeadline(deadline: Date | string): number {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get deadline urgency level
 */
export function getDeadlineUrgency(deadline: Date | string): 'normal' | 'warning' | 'urgent' | 'overdue' {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return 'overdue';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warning';
  return 'normal';
}

// ============================================================================
// TASK MANAGEMENT
// ============================================================================

/**
 * Create tasks from a template for an application
 */
export async function createTasksFromTemplate(
  supabase: SupabaseClient,
  applicationId: string,
  templateId?: string,
  userId?: string
): Promise<{ success: boolean; tasksCreated: number; taskIds: string[]; error?: string }> {
  // Call the database function
  const { data, error } = await supabase.rpc('create_tasks_from_template', {
    p_application_id: applicationId,
    p_template_id: templateId || null,
    p_user_id: userId || null,
  });

  if (error) {
    console.error('Error creating tasks from template:', error);
    return {
      success: false,
      tasksCreated: 0,
      taskIds: [],
      error: error.message,
    };
  }

  return {
    success: data?.success ?? false,
    tasksCreated: data?.tasks_created ?? 0,
    taskIds: data?.task_ids ?? [],
    error: data?.error,
  };
}

/**
 * Get task completion percentage for an application
 */
export async function getTaskCompletionPercentage(
  supabase: SupabaseClient,
  applicationId: string
): Promise<{ total: number; completed: number; percentage: number }> {
  const { data: tasks, error } = await supabase
    .from('application_tasks')
    .select('status')
    .eq('application_id', applicationId)
    .not('status', 'in', '("skipped","cancelled")');

  if (error || !tasks) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

/**
 * Check if all required tasks are completed
 */
export async function areRequiredTasksCompleted(
  supabase: SupabaseClient,
  applicationId: string
): Promise<{ allCompleted: boolean; pendingTasks: string[] }> {
  const { data: tasks, error } = await supabase
    .from('application_tasks')
    .select('id, title, status, priority')
    .eq('application_id', applicationId)
    .in('priority', ['high', 'urgent'])
    .not('status', 'in', '("completed","skipped","cancelled")');

  if (error) {
    return { allCompleted: false, pendingTasks: [] };
  }

  const pendingTasks = tasks?.map(t => t.title) || [];
  return {
    allCompleted: pendingTasks.length === 0,
    pendingTasks,
  };
}

/**
 * Get overdue tasks for an application
 */
export async function getOverdueTasks(
  supabase: SupabaseClient,
  applicationId: string
): Promise<ApplicationTask[]> {
  const { data, error } = await supabase
    .from('application_tasks')
    .select('*')
    .eq('application_id', applicationId)
    .lt('due_date', new Date().toISOString())
    .in('status', ['pending', 'in_progress', 'blocked'])
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue tasks:', error);
    return [];
  }

  return data?.map(task => ({
    id: task.id,
    applicationId: task.application_id,
    title: task.title,
    description: task.description,
    category: task.category,
    status: task.status,
    priority: task.priority,
    sortOrder: task.sort_order,
    assignedTo: task.assigned_to,
    dueDate: task.due_date,
    completedAt: task.completed_at,
    completedBy: task.completed_by,
  })) || [];
}

// ============================================================================
// REMINDER SCHEDULING
// ============================================================================

/**
 * Schedule deadline reminders for an application
 */
export async function scheduleDeadlineReminders(
  supabase: SupabaseClient,
  applicationId: string,
  daysBefore: number[] = [14, 7, 3, 1]
): Promise<{ success: boolean; remindersCreated: number; error?: string }> {
  const { data, error } = await supabase.rpc('schedule_deadline_reminders', {
    p_application_id: applicationId,
    p_days_before: daysBefore,
  });

  if (error) {
    console.error('Error scheduling reminders:', error);
    return {
      success: false,
      remindersCreated: 0,
      error: error.message,
    };
  }

  return {
    success: data?.success ?? false,
    remindersCreated: data?.reminders_created ?? 0,
    error: data?.error,
  };
}

/**
 * Get pending reminders for a user
 */
export async function getPendingReminders(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 10
): Promise<{ reminders: unknown[]; error?: string }> {
  const { data, error } = await supabase
    .from('application_reminders')
    .select(`
      *,
      application:applications(
        id,
        incentive_program:incentive_programs(name)
      )
    `)
    .eq('target_user_id', userId)
    .eq('status', 'scheduled')
    .lte('remind_at', new Date().toISOString())
    .order('remind_at', { ascending: true })
    .limit(limit);

  if (error) {
    return { reminders: [], error: error.message };
  }

  return { reminders: data || [] };
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  supabase: SupabaseClient,
  reminderId: string,
  snoozeMinutes: number = 60
): Promise<{ success: boolean; error?: string }> {
  const snoozeUntil = new Date();
  snoozeUntil.setMinutes(snoozeUntil.getMinutes() + snoozeMinutes);

  const { error } = await supabase
    .from('application_reminders')
    .update({
      status: 'snoozed',
      snoozed_until: snoozeUntil.toISOString(),
      snooze_count: supabase.rpc('increment', { x: 1 }),
    })
    .eq('id', reminderId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// WORKFLOW AUTOMATION
// ============================================================================

/**
 * Trigger workflow automations for an event
 */
export async function triggerAutomations(
  supabase: SupabaseClient,
  triggerType: AutomationTriggerType,
  applicationId: string,
  eventData: Record<string, unknown>,
  userId?: string
): Promise<AutomationExecutionResult[]> {
  // Get matching automations
  const { data: automations, error } = await supabase
    .from('workflow_automations')
    .select('*')
    .eq('trigger_type', triggerType)
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error || !automations?.length) {
    return [];
  }

  const results: AutomationExecutionResult[] = [];

  for (const automation of automations) {
    // Check trigger config matches
    if (!matchesTriggerConfig(automation.trigger_config, eventData)) {
      continue;
    }

    // Check conditions
    if (!await checkConditions(supabase, automation.conditions, applicationId)) {
      continue;
    }

    // Execute automation
    const { data: result, error: execError } = await supabase.rpc('process_workflow_automation', {
      p_automation_id: automation.id,
      p_application_id: applicationId,
      p_trigger_event: { type: triggerType, ...eventData },
      p_triggered_by: userId ? 'user' : 'system',
    });

    if (execError) {
      results.push({
        success: false,
        actionsExecuted: [],
        error: execError.message,
      });
    } else {
      results.push({
        success: result?.success ?? false,
        executionId: result?.execution_id,
        actionsExecuted: result?.actions_executed ?? [],
        durationMs: result?.duration_ms,
      });
    }
  }

  return results;
}

/**
 * Check if event data matches trigger configuration
 */
function matchesTriggerConfig(
  triggerConfig: Record<string, unknown>,
  eventData: Record<string, unknown>
): boolean {
  for (const [key, value] of Object.entries(triggerConfig)) {
    if (key === 'from_status' && eventData.fromStatus !== value) {
      return false;
    }
    if (key === 'to_status' && eventData.toStatus !== value) {
      return false;
    }
    if (key === 'days_before' && eventData.daysBefore !== value) {
      return false;
    }
  }
  return true;
}

/**
 * Check if all automation conditions are met
 */
async function checkConditions(
  supabase: SupabaseClient,
  conditions: AutomationCondition[],
  applicationId: string
): Promise<boolean> {
  if (!conditions?.length) {
    return true;
  }

  // Get application with related data for condition checking
  const { data: application } = await supabase
    .from('applications')
    .select(`
      *,
      incentive_program:incentive_programs(*)
    `)
    .eq('id', applicationId)
    .single();

  if (!application) {
    return false;
  }

  for (const condition of conditions) {
    const fieldValue = getFieldValue(application, condition.field);
    if (!evaluateCondition(fieldValue, condition.operator, condition.value)) {
      return false;
    }
  }

  return true;
}

/**
 * Get nested field value from object
 */
function getFieldValue(obj: Record<string, unknown>, fieldPath: string): unknown {
  const parts = fieldPath.split('.');
  let value: unknown = obj;
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return value;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(
  fieldValue: unknown,
  operator: AutomationCondition['operator'],
  compareValue: unknown
): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === compareValue;
    case 'not_equals':
      return fieldValue !== compareValue;
    case 'in':
      return Array.isArray(compareValue) && compareValue.includes(fieldValue);
    case 'not_in':
      return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(String(compareValue));
    case 'greater_than':
      return Number(fieldValue) > Number(compareValue);
    case 'less_than':
      return Number(fieldValue) < Number(compareValue);
    default:
      return false;
  }
}

// ============================================================================
// NOTIFICATION TRIGGERS
// ============================================================================

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  applicationId?: string;
  projectId?: string;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Create a notification for status change
 */
export async function notifyStatusChange(
  supabase: SupabaseClient,
  applicationId: string,
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus,
  userId: string
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  // Get application details
  const { data: application } = await supabase
    .from('applications')
    .select(`
      id,
      created_by,
      incentive_program:incentive_programs(name)
    `)
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: 'Application not found' };
  }

  const programName = (application.incentive_program as unknown as { name: string } | null)?.name || 'Unknown Program';
  const isPositiveChange = ['approved', 'partially-approved'].includes(toStatus);
  const isNegativeChange = ['rejected', 'expired', 'withdrawn'].includes(toStatus);

  let priority: NotificationPayload['priority'] = 'normal';
  if (isPositiveChange) priority = 'high';
  if (isNegativeChange) priority = 'urgent';

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: application.created_by,
      title: `Application Status: ${STATUS_LABELS[toStatus]}`,
      message: `Your application for "${programName}" has been updated from ${STATUS_LABELS[fromStatus]} to ${STATUS_LABELS[toStatus]}.`,
      notification_type: 'status_change',
      priority,
      application_id: applicationId,
      action_url: `/applications/${applicationId}`,
      action_label: 'View Application',
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, notificationId: data?.id };
}

/**
 * Create a notification for approaching deadline
 */
export async function notifyDeadlineApproaching(
  supabase: SupabaseClient,
  applicationId: string,
  daysRemaining: number
): Promise<{ success: boolean; error?: string }> {
  const { data: application } = await supabase
    .from('applications')
    .select(`
      id,
      created_by,
      incentive_program:incentive_programs(name)
    `)
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: 'Application not found' };
  }

  const programName = (application.incentive_program as unknown as { name: string } | null)?.name || 'Unknown Program';
  const priority = daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'high' : 'normal';

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: application.created_by,
      title: `Deadline in ${daysRemaining} day(s)`,
      message: `Your application for "${programName}" has a deadline approaching in ${daysRemaining} day(s).`,
      notification_type: 'deadline',
      priority,
      application_id: applicationId,
      action_url: `/applications/${applicationId}`,
      action_label: 'View Application',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Create a notification for task assignment
 */
export async function notifyTaskAssignment(
  supabase: SupabaseClient,
  taskId: string,
  assignedToUserId: string,
  assignedByUserId: string
): Promise<{ success: boolean; error?: string }> {
  const { data: task } = await supabase
    .from('application_tasks')
    .select(`
      id,
      title,
      due_date,
      application:applications(
        id,
        incentive_program:incentive_programs(name)
      )
    `)
    .eq('id', taskId)
    .single();

  if (!task) {
    return { success: false, error: 'Task not found' };
  }

  const { data: assignedBy } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', assignedByUserId)
    .single();

  const application = task.application as unknown as { id: string; incentive_program: { name: string } } | null;
  const dueDateStr = task.due_date ? ` (due ${new Date(task.due_date).toLocaleDateString()})` : '';

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: assignedToUserId,
      title: 'New Task Assigned',
      message: `${assignedBy?.full_name || 'Someone'} assigned you a task: "${task.title}"${dueDateStr}`,
      notification_type: 'task_assignment',
      priority: task.due_date && getDaysUntilDeadline(task.due_date) <= 3 ? 'high' : 'normal',
      application_id: application?.id,
      action_url: `/applications/${application?.id}?task=${taskId}`,
      action_label: 'View Task',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// APPLICATION LIFECYCLE
// ============================================================================

/**
 * Start an application workflow (move from draft to in-progress)
 */
export async function startApplicationWorkflow(
  supabase: SupabaseClient,
  applicationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Validate transition
  const { data: application } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: 'Application not found' };
  }

  const validation = validateStatusTransition(
    application.status as ApplicationStatus,
    'in-progress'
  );

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Update status (triggers will handle task creation and reminders)
  const { error } = await supabase
    .from('applications')
    .update({
      status: 'in-progress',
      reviewer_id: userId,
    })
    .eq('id', applicationId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Trigger automations
  await triggerAutomations(supabase, 'status_changed', applicationId, {
    fromStatus: application.status,
    toStatus: 'in-progress',
  }, userId);

  return { success: true };
}

/**
 * Submit an application for review
 */
export async function submitApplication(
  supabase: SupabaseClient,
  applicationId: string,
  userId: string
): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  const warnings: string[] = [];

  // Get current application
  const { data: application } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single();

  if (!application) {
    return { success: false, error: 'Application not found' };
  }

  // Check if we need to go through ready-for-review first
  let targetStatus: ApplicationStatus = 'submitted';
  if (application.status === 'in-progress') {
    targetStatus = 'ready-for-review';
  }

  // Validate transition
  const validation = validateStatusTransition(
    application.status as ApplicationStatus,
    targetStatus
  );

  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check required tasks
  const { allCompleted, pendingTasks } = await areRequiredTasksCompleted(supabase, applicationId);
  if (!allCompleted) {
    warnings.push(`The following high-priority tasks are incomplete: ${pendingTasks.join(', ')}`);
  }

  // Check task completion percentage
  const { percentage } = await getTaskCompletionPercentage(supabase, applicationId);
  if (percentage < 80) {
    warnings.push(`Only ${percentage}% of tasks are completed. Consider completing more tasks before submission.`);
  }

  // Update status
  const { error } = await supabase
    .from('applications')
    .update({
      status: targetStatus,
      reviewer_id: userId,
      ...(targetStatus === 'submitted' ? { submission_date: new Date().toISOString() } : {}),
    })
    .eq('id', applicationId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Trigger automations
  await triggerAutomations(supabase, 'status_changed', applicationId, {
    fromStatus: application.status,
    toStatus: targetStatus,
  }, userId);

  if (targetStatus === 'submitted') {
    await triggerAutomations(supabase, 'application_submitted', applicationId, {}, userId);
  }

  return { success: true, warnings: warnings.length > 0 ? warnings : undefined };
}

// ============================================================================
// WORKFLOW ENGINE CLASS
// ============================================================================

/**
 * Main workflow engine class for managing application workflows
 */
export class WorkflowEngine {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Status Management
  validateTransition = validateStatusTransition;
  getValidTransitions = getValidTransitions;
  isTerminalStatus = isTerminalStatus;
  getTransitionRequirements = getTransitionRequirements;

  // Deadline Management
  async calculateDeadline(programId: string, startDate?: Date) {
    return calculateDeadline(this.supabase, programId, startDate);
  }

  getDaysUntilDeadline = getDaysUntilDeadline;
  getDeadlineUrgency = getDeadlineUrgency;

  // Task Management
  async createTasksFromTemplate(applicationId: string, templateId?: string, userId?: string) {
    return createTasksFromTemplate(this.supabase, applicationId, templateId, userId);
  }

  async getTaskCompletionPercentage(applicationId: string) {
    return getTaskCompletionPercentage(this.supabase, applicationId);
  }

  async areRequiredTasksCompleted(applicationId: string) {
    return areRequiredTasksCompleted(this.supabase, applicationId);
  }

  async getOverdueTasks(applicationId: string) {
    return getOverdueTasks(this.supabase, applicationId);
  }

  // Reminder Management
  async scheduleDeadlineReminders(applicationId: string, daysBefore?: number[]) {
    return scheduleDeadlineReminders(this.supabase, applicationId, daysBefore);
  }

  async getPendingReminders(userId: string, limit?: number) {
    return getPendingReminders(this.supabase, userId, limit);
  }

  async snoozeReminder(reminderId: string, snoozeMinutes?: number) {
    return snoozeReminder(this.supabase, reminderId, snoozeMinutes);
  }

  // Automation
  async triggerAutomations(
    triggerType: AutomationTriggerType,
    applicationId: string,
    eventData: Record<string, unknown>,
    userId?: string
  ) {
    return triggerAutomations(this.supabase, triggerType, applicationId, eventData, userId);
  }

  // Notifications
  async notifyStatusChange(
    applicationId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    userId: string
  ) {
    return notifyStatusChange(this.supabase, applicationId, fromStatus, toStatus, userId);
  }

  async notifyDeadlineApproaching(applicationId: string, daysRemaining: number) {
    return notifyDeadlineApproaching(this.supabase, applicationId, daysRemaining);
  }

  async notifyTaskAssignment(taskId: string, assignedToUserId: string, assignedByUserId: string) {
    return notifyTaskAssignment(this.supabase, taskId, assignedToUserId, assignedByUserId);
  }

  // Lifecycle
  async startWorkflow(applicationId: string, userId: string) {
    return startApplicationWorkflow(this.supabase, applicationId, userId);
  }

  async submitApplication(applicationId: string, userId: string) {
    return submitApplication(this.supabase, applicationId, userId);
  }
}

/**
 * Create a workflow engine instance
 */
export function createWorkflowEngine(supabase: SupabaseClient): WorkflowEngine {
  return new WorkflowEngine(supabase);
}

export default WorkflowEngine;
