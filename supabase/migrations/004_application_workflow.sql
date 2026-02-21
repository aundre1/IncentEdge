-- IncentEdge Database Schema
-- Migration: 004_application_workflow
-- Description: Application workflow automation engine with templates, tasks, comments, reminders, and automations
-- Date: 2026-01-09

-- ============================================================================
-- APPLICATION TEMPLATES TABLE
-- Reusable templates for different incentive programs
-- ============================================================================
CREATE TABLE application_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Program Association
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system_template BOOLEAN DEFAULT false, -- System-wide vs org-specific
    is_active BOOLEAN DEFAULT true,
    -- Template Configuration
    default_tasks JSONB DEFAULT '[]', -- Array of task definitions
    -- Example: [{"title": "Gather financial documents", "category": "documentation", "order": 1, "estimated_days": 3}]
    required_documents JSONB DEFAULT '[]', -- Document types needed
    -- Example: [{"type": "pro_forma", "required": true}, {"type": "site_plan", "required": false}]
    default_deadline_days INTEGER DEFAULT 30, -- Days from start to deadline
    sections JSONB DEFAULT '[]', -- Application sections/form structure
    -- Example: [{"id": "financials", "title": "Financial Information", "fields": [...]}]
    -- Workflow Configuration
    auto_create_tasks BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{}',
    -- Example: {"on_deadline_approaching": true, "days_before": [7, 3, 1]}
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_template_id UUID REFERENCES application_templates(id) ON DELETE SET NULL,
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPLICATION TASKS TABLE
-- Checklist items for each application
-- ============================================================================
CREATE TABLE application_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    -- Task Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- documentation, review, submission, follow_up, compliance
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'blocked', 'completed', 'skipped', 'cancelled'
    )),
    -- Priority & Order
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    sort_order INTEGER DEFAULT 0,
    -- Assignment
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Dependencies
    depends_on UUID[] DEFAULT '{}', -- Array of task IDs this depends on
    blocks UUID[] DEFAULT '{}', -- Array of task IDs this blocks
    -- Dates
    due_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    -- Effort Tracking
    estimated_hours DECIMAL(6,2),
    actual_hours DECIMAL(6,2),
    -- Completion Details
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completion_notes TEXT,
    -- Attachments/Related
    related_document_ids UUID[] DEFAULT '{}',
    -- Automation
    auto_generated BOOLEAN DEFAULT false,
    template_task_id VARCHAR(100), -- Reference to template task definition
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPLICATION COMMENTS TABLE
-- Collaboration and discussion on applications
-- ============================================================================
CREATE TABLE application_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    -- Comment Type
    comment_type VARCHAR(30) DEFAULT 'comment' CHECK (comment_type IN (
        'comment', 'status_change', 'task_update', 'system_notification',
        'question', 'answer', 'approval', 'rejection'
    )),
    -- Content
    content TEXT NOT NULL,
    content_html TEXT, -- Rich text version
    -- Threading
    parent_comment_id UUID REFERENCES application_comments(id) ON DELETE CASCADE,
    thread_depth INTEGER DEFAULT 0,
    -- Visibility
    is_internal BOOLEAN DEFAULT true, -- Internal vs visible to external parties
    visibility VARCHAR(30) DEFAULT 'team' CHECK (visibility IN (
        'private', 'team', 'organization', 'public'
    )),
    -- Mentions & Notifications
    mentioned_user_ids UUID[] DEFAULT '{}',
    -- Attachments
    attachment_ids UUID[] DEFAULT '{}',
    -- Related Entities
    related_task_id UUID REFERENCES application_tasks(id) ON DELETE SET NULL,
    -- Status Change Tracking
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    -- Reactions (simple tracking)
    reactions JSONB DEFAULT '{}', -- {"thumbs_up": ["user_id1", "user_id2"], ...}
    -- Edit History
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    edit_history JSONB DEFAULT '[]', -- Array of previous versions
    -- Soft Delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Metadata
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPLICATION REMINDERS TABLE
-- Scheduled reminders for applications
-- ============================================================================
CREATE TABLE application_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    -- Reminder Type
    reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN (
        'deadline_approaching', 'task_due', 'follow_up', 'status_check',
        'document_expiry', 'review_needed', 'submission_reminder', 'custom'
    )),
    -- Target
    target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role VARCHAR(20), -- Or send to all users with this role
    -- Timing
    remind_at TIMESTAMPTZ NOT NULL,
    remind_before_days INTEGER, -- For deadline-based reminders
    -- Recurrence
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- daily, weekly, monthly, custom
    recurrence_config JSONB DEFAULT '{}', -- {"interval": 7, "unit": "days", "max_occurrences": 5}
    next_occurrence_at TIMESTAMPTZ,
    occurrences_sent INTEGER DEFAULT 0,
    max_occurrences INTEGER,
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT,
    -- Delivery Channels
    channels VARCHAR(30)[] DEFAULT ARRAY['in_app'], -- in_app, email, sms
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'sent', 'cancelled', 'failed', 'snoozed'
    )),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    -- Snooze
    snoozed_until TIMESTAMPTZ,
    snooze_count INTEGER DEFAULT 0,
    -- Related Entities
    related_task_id UUID REFERENCES application_tasks(id) ON DELETE SET NULL,
    -- Automation Source
    automation_id UUID, -- Will reference workflow_automations if auto-generated
    auto_generated BOOLEAN DEFAULT false,
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW AUTOMATIONS TABLE
-- Trigger-based automation rules
-- ============================================================================
CREATE TABLE workflow_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- Automation Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_system_automation BOOLEAN DEFAULT false, -- System-wide vs org-specific
    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'application_created', 'status_changed', 'task_completed', 'task_overdue',
        'deadline_approaching', 'document_uploaded', 'comment_added',
        'all_tasks_completed', 'application_submitted', 'application_approved',
        'application_rejected', 'scheduled', 'manual'
    )),
    trigger_config JSONB DEFAULT '{}',
    -- Example for status_changed: {"from_status": "draft", "to_status": "in-progress"}
    -- Example for deadline_approaching: {"days_before": 7}
    -- Example for scheduled: {"cron": "0 9 * * 1", "timezone": "America/New_York"}
    -- Conditions (all must be true for automation to run)
    conditions JSONB DEFAULT '[]',
    -- Example: [
    --   {"field": "application.status", "operator": "equals", "value": "in-progress"},
    --   {"field": "incentive_program.category", "operator": "in", "value": ["federal", "state"]}
    -- ]
    -- Actions (executed in order)
    actions JSONB NOT NULL DEFAULT '[]',
    -- Example: [
    --   {"type": "create_tasks", "config": {"template_id": "..."}},
    --   {"type": "send_notification", "config": {"template": "deadline_reminder", "to": "assigned_user"}},
    --   {"type": "update_status", "config": {"status": "ready-for-review"}},
    --   {"type": "assign_user", "config": {"role": "manager"}}
    -- ]
    -- Scope
    applies_to_programs UUID[] DEFAULT '{}', -- Empty = all programs
    applies_to_statuses VARCHAR(30)[] DEFAULT '{}', -- Empty = all statuses
    -- Execution Settings
    run_once_per_application BOOLEAN DEFAULT false,
    cooldown_minutes INTEGER, -- Minimum time between executions
    max_executions_per_day INTEGER,
    -- Priority (for ordering when multiple automations trigger)
    priority INTEGER DEFAULT 100, -- Lower = higher priority
    -- Tracking
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    last_error TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    -- Pause on errors
    auto_pause_on_failures INTEGER DEFAULT 5, -- Pause after N consecutive failures
    paused_at TIMESTAMPTZ,
    pause_reason TEXT,
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WORKFLOW AUTOMATION EXECUTIONS LOG
-- Track automation execution history
-- ============================================================================
CREATE TABLE workflow_automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID NOT NULL REFERENCES workflow_automations(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    -- Trigger Info
    trigger_event JSONB NOT NULL, -- The event that triggered execution
    triggered_by VARCHAR(50) NOT NULL, -- 'system', 'user', 'scheduled'
    triggered_by_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Execution Details
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped', 'cancelled'
    )),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    -- Results
    actions_executed JSONB DEFAULT '[]', -- Log of each action and its result
    -- Example: [
    --   {"action": "create_tasks", "status": "success", "result": {"tasks_created": 3}},
    --   {"action": "send_notification", "status": "success", "result": {"notification_id": "..."}}
    -- ]
    error_message TEXT,
    error_details JSONB,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPLICATION STATUS HISTORY TABLE
-- Detailed tracking of status changes
-- ============================================================================
CREATE TABLE application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    -- Status Change
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    -- Context
    change_reason TEXT,
    change_source VARCHAR(30) DEFAULT 'user' CHECK (change_source IN (
        'user', 'automation', 'system', 'external'
    )),
    -- Validation
    validation_passed BOOLEAN DEFAULT true,
    validation_errors JSONB DEFAULT '[]',
    -- Related
    triggered_automations UUID[] DEFAULT '{}', -- Automation IDs triggered by this change
    -- User Info
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Application Templates
CREATE INDEX idx_app_templates_program ON application_templates(incentive_program_id);
CREATE INDEX idx_app_templates_org ON application_templates(organization_id);
CREATE INDEX idx_app_templates_active ON application_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_app_templates_system ON application_templates(is_system_template) WHERE is_system_template = true;

-- Application Tasks
CREATE INDEX idx_app_tasks_application ON application_tasks(application_id);
CREATE INDEX idx_app_tasks_status ON application_tasks(status);
CREATE INDEX idx_app_tasks_assigned ON application_tasks(assigned_to);
CREATE INDEX idx_app_tasks_due_date ON application_tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_app_tasks_app_status ON application_tasks(application_id, status);
CREATE INDEX idx_app_tasks_pending ON application_tasks(application_id) WHERE status = 'pending';

-- Application Comments
CREATE INDEX idx_app_comments_application ON application_comments(application_id);
CREATE INDEX idx_app_comments_author ON application_comments(author_id);
CREATE INDEX idx_app_comments_parent ON application_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_app_comments_created ON application_comments(application_id, created_at DESC);
CREATE INDEX idx_app_comments_not_deleted ON application_comments(application_id) WHERE is_deleted = false;

-- Application Reminders
CREATE INDEX idx_app_reminders_application ON application_reminders(application_id);
CREATE INDEX idx_app_reminders_user ON application_reminders(target_user_id);
CREATE INDEX idx_app_reminders_scheduled ON application_reminders(remind_at) WHERE status = 'scheduled';
CREATE INDEX idx_app_reminders_status ON application_reminders(status);

-- Workflow Automations
CREATE INDEX idx_automations_org ON workflow_automations(organization_id);
CREATE INDEX idx_automations_trigger ON workflow_automations(trigger_type);
CREATE INDEX idx_automations_active ON workflow_automations(is_active) WHERE is_active = true;
CREATE INDEX idx_automations_system ON workflow_automations(is_system_automation) WHERE is_system_automation = true;

-- Workflow Automation Executions
CREATE INDEX idx_automation_exec_automation ON workflow_automation_executions(automation_id);
CREATE INDEX idx_automation_exec_application ON workflow_automation_executions(application_id);
CREATE INDEX idx_automation_exec_status ON workflow_automation_executions(status);
CREATE INDEX idx_automation_exec_created ON workflow_automation_executions(created_at DESC);

-- Application Status History
CREATE INDEX idx_status_history_application ON application_status_history(application_id);
CREATE INDEX idx_status_history_created ON application_status_history(application_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Application Templates Policies
CREATE POLICY "Anyone can view system templates" ON application_templates
    FOR SELECT USING (is_system_template = true);

CREATE POLICY "Org members can view org templates" ON application_templates
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage org templates" ON application_templates
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Application Tasks Policies
CREATE POLICY "Org members can view tasks" ON application_tasks
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage tasks" ON application_tasks
    FOR ALL USING (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Application Comments Policies
CREATE POLICY "Org members can view comments" ON application_comments
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can insert comments" ON application_comments
    FOR INSERT WITH CHECK (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Authors can update own comments" ON application_comments
    FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own comments" ON application_comments
    FOR DELETE USING (author_id = auth.uid());

-- Application Reminders Policies
CREATE POLICY "Users can view own reminders" ON application_reminders
    FOR SELECT USING (
        target_user_id = auth.uid() OR
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage reminders" ON application_reminders
    FOR ALL USING (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Workflow Automations Policies
CREATE POLICY "Anyone can view system automations" ON workflow_automations
    FOR SELECT USING (is_system_automation = true);

CREATE POLICY "Org members can view org automations" ON workflow_automations
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org admins can manage org automations" ON workflow_automations
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Automation Executions Policies
CREATE POLICY "Org members can view executions" ON workflow_automation_executions
    FOR SELECT USING (
        automation_id IN (
            SELECT id FROM workflow_automations
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
            OR is_system_automation = true
        )
    );

-- Status History Policies
CREATE POLICY "Org members can view status history" ON application_status_history
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM applications
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_app_templates_updated_at BEFORE UPDATE ON application_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_tasks_updated_at BEFORE UPDATE ON application_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_comments_updated_at BEFORE UPDATE ON application_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_reminders_updated_at BEFORE UPDATE ON application_reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON workflow_automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS: Status Transition Validation
-- ============================================================================

-- Define valid status transitions
CREATE OR REPLACE FUNCTION get_valid_status_transitions(current_status VARCHAR(30))
RETURNS VARCHAR(30)[] AS $$
BEGIN
    CASE current_status
        WHEN 'draft' THEN
            RETURN ARRAY['in-progress', 'withdrawn'];
        WHEN 'in-progress' THEN
            RETURN ARRAY['ready-for-review', 'draft', 'withdrawn'];
        WHEN 'ready-for-review' THEN
            RETURN ARRAY['submitted', 'in-progress', 'withdrawn'];
        WHEN 'submitted' THEN
            RETURN ARRAY['under-review', 'withdrawn'];
        WHEN 'under-review' THEN
            RETURN ARRAY['additional-info-requested', 'approved', 'partially-approved', 'rejected'];
        WHEN 'additional-info-requested' THEN
            RETURN ARRAY['under-review', 'withdrawn', 'expired'];
        WHEN 'approved' THEN
            RETURN ARRAY[]::VARCHAR(30)[]; -- Terminal state
        WHEN 'partially-approved' THEN
            RETURN ARRAY[]::VARCHAR(30)[]; -- Terminal state
        WHEN 'rejected' THEN
            RETURN ARRAY[]::VARCHAR(30)[]; -- Terminal state
        WHEN 'withdrawn' THEN
            RETURN ARRAY['draft']; -- Can reopen from withdrawn
        WHEN 'expired' THEN
            RETURN ARRAY[]::VARCHAR(30)[]; -- Terminal state
        ELSE
            RETURN ARRAY[]::VARCHAR(30)[];
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Validate status transition
CREATE OR REPLACE FUNCTION validate_application_status_transition(
    p_application_id UUID,
    p_new_status VARCHAR(30),
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_current_status VARCHAR(30);
    v_valid_transitions VARCHAR(30)[];
    v_result JSONB;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status
    FROM applications
    WHERE id = p_application_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'valid', false,
            'error', 'Application not found',
            'code', 'NOT_FOUND'
        );
    END IF;

    -- Get valid transitions
    v_valid_transitions := get_valid_status_transitions(v_current_status);

    -- Check if transition is valid
    IF p_new_status = ANY(v_valid_transitions) THEN
        RETURN jsonb_build_object(
            'valid', true,
            'from_status', v_current_status,
            'to_status', p_new_status,
            'message', 'Status transition is valid'
        );
    ELSE
        RETURN jsonb_build_object(
            'valid', false,
            'from_status', v_current_status,
            'to_status', p_new_status,
            'valid_transitions', v_valid_transitions,
            'error', format('Cannot transition from %s to %s', v_current_status, p_new_status),
            'code', 'INVALID_TRANSITION'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTIONS: Calculate Application Deadline
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_application_deadline(
    p_incentive_program_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    v_program RECORD;
    v_deadline TIMESTAMPTZ;
    v_template_days INTEGER;
BEGIN
    -- Get program details
    SELECT * INTO v_program
    FROM incentive_programs
    WHERE id = p_incentive_program_id;

    IF NOT FOUND THEN
        RETURN p_start_date + INTERVAL '30 days'; -- Default 30 days
    END IF;

    -- Check for program deadline first
    IF v_program.application_deadline IS NOT NULL THEN
        v_deadline := v_program.application_deadline::TIMESTAMPTZ;
    ELSIF v_program.typical_processing_days IS NOT NULL THEN
        -- Calculate based on typical processing time + buffer
        v_deadline := p_start_date + (v_program.typical_processing_days * INTERVAL '1 day');
    ELSE
        -- Get default from template if exists
        SELECT default_deadline_days INTO v_template_days
        FROM application_templates
        WHERE incentive_program_id = p_incentive_program_id
        AND is_active = true
        ORDER BY is_system_template DESC, created_at DESC
        LIMIT 1;

        v_deadline := p_start_date + (COALESCE(v_template_days, 30) * INTERVAL '1 day');
    END IF;

    RETURN v_deadline;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTIONS: Auto-Create Tasks from Template
-- ============================================================================

CREATE OR REPLACE FUNCTION create_tasks_from_template(
    p_application_id UUID,
    p_template_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_application RECORD;
    v_template RECORD;
    v_task JSONB;
    v_task_id UUID;
    v_tasks_created INTEGER := 0;
    v_created_task_ids UUID[] := '{}';
    v_due_date TIMESTAMPTZ;
BEGIN
    -- Get application details
    SELECT * INTO v_application
    FROM applications
    WHERE id = p_application_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Application not found'
        );
    END IF;

    -- Get template (explicit or find best match)
    IF p_template_id IS NOT NULL THEN
        SELECT * INTO v_template
        FROM application_templates
        WHERE id = p_template_id AND is_active = true;
    ELSE
        -- Find best matching template
        SELECT * INTO v_template
        FROM application_templates
        WHERE (incentive_program_id = v_application.incentive_program_id OR incentive_program_id IS NULL)
        AND (organization_id = v_application.organization_id OR organization_id IS NULL)
        AND is_active = true
        AND auto_create_tasks = true
        ORDER BY
            CASE WHEN incentive_program_id = v_application.incentive_program_id THEN 0 ELSE 1 END,
            CASE WHEN organization_id = v_application.organization_id THEN 0 ELSE 1 END,
            is_system_template DESC,
            usage_count DESC
        LIMIT 1;
    END IF;

    IF NOT FOUND OR v_template.default_tasks IS NULL OR jsonb_array_length(v_template.default_tasks) = 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'tasks_created', 0,
            'message', 'No template tasks to create'
        );
    END IF;

    -- Create each task from template
    FOR v_task IN SELECT * FROM jsonb_array_elements(v_template.default_tasks)
    LOOP
        -- Calculate due date based on estimated days
        IF v_task->>'estimated_days' IS NOT NULL AND v_application.deadline IS NOT NULL THEN
            v_due_date := v_application.deadline - ((v_task->>'estimated_days')::INTEGER * INTERVAL '1 day');
        ELSE
            v_due_date := NULL;
        END IF;

        INSERT INTO application_tasks (
            application_id,
            title,
            description,
            category,
            priority,
            sort_order,
            due_date,
            estimated_hours,
            auto_generated,
            template_task_id,
            created_by
        ) VALUES (
            p_application_id,
            v_task->>'title',
            v_task->>'description',
            v_task->>'category',
            COALESCE(v_task->>'priority', 'medium'),
            COALESCE((v_task->>'order')::INTEGER, v_tasks_created + 1),
            v_due_date,
            (v_task->>'estimated_hours')::DECIMAL,
            true,
            v_task->>'id',
            p_user_id
        )
        RETURNING id INTO v_task_id;

        v_created_task_ids := array_append(v_created_task_ids, v_task_id);
        v_tasks_created := v_tasks_created + 1;
    END LOOP;

    -- Update template usage
    UPDATE application_templates
    SET usage_count = usage_count + 1, last_used_at = NOW()
    WHERE id = v_template.id;

    RETURN jsonb_build_object(
        'success', true,
        'tasks_created', v_tasks_created,
        'task_ids', v_created_task_ids,
        'template_id', v_template.id,
        'template_name', v_template.name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTIONS: Schedule Deadline Reminders
-- ============================================================================

CREATE OR REPLACE FUNCTION schedule_deadline_reminders(
    p_application_id UUID,
    p_days_before INTEGER[] DEFAULT ARRAY[14, 7, 3, 1]
)
RETURNS JSONB AS $$
DECLARE
    v_application RECORD;
    v_day INTEGER;
    v_remind_at TIMESTAMPTZ;
    v_reminders_created INTEGER := 0;
BEGIN
    -- Get application details
    SELECT a.*, p.full_name as creator_name
    INTO v_application
    FROM applications a
    LEFT JOIN profiles p ON a.created_by = p.id
    WHERE a.id = p_application_id;

    IF NOT FOUND OR v_application.deadline IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Application not found or has no deadline'
        );
    END IF;

    -- Create reminder for each interval
    FOREACH v_day IN ARRAY p_days_before
    LOOP
        v_remind_at := v_application.deadline - (v_day * INTERVAL '1 day');

        -- Only create if reminder date is in the future
        IF v_remind_at > NOW() THEN
            INSERT INTO application_reminders (
                application_id,
                reminder_type,
                target_user_id,
                remind_at,
                remind_before_days,
                title,
                message,
                auto_generated
            ) VALUES (
                p_application_id,
                'deadline_approaching',
                v_application.created_by,
                v_remind_at,
                v_day,
                format('Application deadline in %s day(s)', v_day),
                format('The deadline for your application is approaching. %s day(s) remaining.', v_day),
                true
            )
            ON CONFLICT DO NOTHING;

            v_reminders_created := v_reminders_created + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'reminders_created', v_reminders_created
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTIONS: Process Workflow Automation
-- ============================================================================

CREATE OR REPLACE FUNCTION process_workflow_automation(
    p_automation_id UUID,
    p_application_id UUID,
    p_trigger_event JSONB,
    p_triggered_by VARCHAR(50) DEFAULT 'system'
)
RETURNS JSONB AS $$
DECLARE
    v_automation RECORD;
    v_execution_id UUID;
    v_action JSONB;
    v_action_result JSONB;
    v_actions_executed JSONB := '[]';
    v_start_time TIMESTAMPTZ;
    v_success BOOLEAN := true;
    v_error_message TEXT;
BEGIN
    v_start_time := clock_timestamp();

    -- Get automation
    SELECT * INTO v_automation
    FROM workflow_automations
    WHERE id = p_automation_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Automation not found or inactive'
        );
    END IF;

    -- Create execution record
    INSERT INTO workflow_automation_executions (
        automation_id,
        application_id,
        trigger_event,
        triggered_by,
        status,
        started_at
    ) VALUES (
        p_automation_id,
        p_application_id,
        p_trigger_event,
        p_triggered_by,
        'running',
        v_start_time
    )
    RETURNING id INTO v_execution_id;

    -- Process each action
    FOR v_action IN SELECT * FROM jsonb_array_elements(v_automation.actions)
    LOOP
        BEGIN
            -- Execute action based on type
            CASE v_action->>'type'
                WHEN 'create_tasks' THEN
                    v_action_result := create_tasks_from_template(
                        p_application_id,
                        (v_action->'config'->>'template_id')::UUID
                    );

                WHEN 'schedule_reminders' THEN
                    v_action_result := schedule_deadline_reminders(
                        p_application_id,
                        COALESCE(
                            (SELECT array_agg(x::INTEGER) FROM jsonb_array_elements_text(v_action->'config'->'days_before') x),
                            ARRAY[14, 7, 3, 1]
                        )
                    );

                WHEN 'add_comment' THEN
                    INSERT INTO application_comments (
                        application_id,
                        comment_type,
                        content,
                        author_id,
                        visibility
                    ) VALUES (
                        p_application_id,
                        'system_notification',
                        v_action->'config'->>'message',
                        (SELECT created_by FROM applications WHERE id = p_application_id),
                        'team'
                    );
                    v_action_result := jsonb_build_object('success', true);

                ELSE
                    v_action_result := jsonb_build_object(
                        'success', true,
                        'message', format('Action type %s logged', v_action->>'type')
                    );
            END CASE;

            v_actions_executed := v_actions_executed || jsonb_build_object(
                'action', v_action->>'type',
                'status', 'success',
                'result', v_action_result
            );

        EXCEPTION WHEN OTHERS THEN
            v_success := false;
            v_error_message := SQLERRM;
            v_actions_executed := v_actions_executed || jsonb_build_object(
                'action', v_action->>'type',
                'status', 'failed',
                'error', v_error_message
            );
        END;
    END LOOP;

    -- Update execution record
    UPDATE workflow_automation_executions
    SET
        status = CASE WHEN v_success THEN 'completed' ELSE 'failed' END,
        completed_at = clock_timestamp(),
        duration_ms = EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))::INTEGER,
        actions_executed = v_actions_executed,
        error_message = v_error_message
    WHERE id = v_execution_id;

    -- Update automation stats
    UPDATE workflow_automations
    SET
        execution_count = execution_count + 1,
        last_executed_at = NOW(),
        consecutive_failures = CASE WHEN v_success THEN 0 ELSE consecutive_failures + 1 END,
        last_error = CASE WHEN v_success THEN NULL ELSE v_error_message END
    WHERE id = p_automation_id;

    RETURN jsonb_build_object(
        'success', v_success,
        'execution_id', v_execution_id,
        'actions_executed', v_actions_executed,
        'duration_ms', EXTRACT(MILLISECONDS FROM (clock_timestamp() - v_start_time))::INTEGER
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Auto-Create Tasks on Application Start
-- ============================================================================

CREATE OR REPLACE FUNCTION on_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Log status change
    INSERT INTO application_status_history (
        application_id,
        from_status,
        to_status,
        change_source,
        changed_by
    ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        'user',
        NEW.reviewer_id
    );

    -- Auto-create tasks when moving to in-progress for first time
    IF OLD.status = 'draft' AND NEW.status = 'in-progress' THEN
        v_result := create_tasks_from_template(NEW.id, NULL, NEW.created_by);
        v_result := schedule_deadline_reminders(NEW.id);
    END IF;

    -- Update status history on the application
    NEW.status_history := COALESCE(OLD.status_history, '[]'::JSONB) || jsonb_build_object(
        'status', NEW.status,
        'timestamp', NOW(),
        'from_status', OLD.status
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER application_status_change_trigger
    BEFORE UPDATE OF status ON applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION on_application_status_change();

-- ============================================================================
-- SEED DATA: Default Application Templates
-- ============================================================================

INSERT INTO application_templates (
    name,
    description,
    is_system_template,
    is_active,
    default_deadline_days,
    default_tasks,
    required_documents
) VALUES
(
    'Federal Tax Credit Application',
    'Standard template for federal ITC and PTC applications',
    true,
    true,
    90,
    '[
        {"id": "gather_project_docs", "title": "Gather project documentation", "description": "Collect all required project documents including site plans, engineering reports, and financials", "category": "documentation", "order": 1, "estimated_days": 14, "priority": "high"},
        {"id": "verify_eligibility", "title": "Verify eligibility requirements", "description": "Confirm project meets all ITC/PTC eligibility criteria", "category": "review", "order": 2, "estimated_days": 7, "priority": "high"},
        {"id": "prepare_cost_cert", "title": "Prepare cost certification", "description": "Prepare cost basis documentation and certification", "category": "documentation", "order": 3, "estimated_days": 10, "priority": "medium"},
        {"id": "domestic_content", "title": "Document domestic content compliance", "description": "If applicable, document compliance with domestic content requirements", "category": "compliance", "order": 4, "estimated_days": 7, "priority": "medium"},
        {"id": "prevailing_wage", "title": "Verify prevailing wage compliance", "description": "Document prevailing wage and apprenticeship compliance", "category": "compliance", "order": 5, "estimated_days": 5, "priority": "medium"},
        {"id": "internal_review", "title": "Complete internal review", "description": "Conduct internal review of all documentation", "category": "review", "order": 6, "estimated_days": 5, "priority": "high"},
        {"id": "submit_application", "title": "Submit application", "description": "Submit completed application with all required documentation", "category": "submission", "order": 7, "estimated_days": 2, "priority": "urgent"}
    ]'::JSONB,
    '[
        {"type": "project_proforma", "required": true, "description": "Project pro forma financial model"},
        {"type": "site_plan", "required": true, "description": "Site plan and engineering drawings"},
        {"type": "cost_certification", "required": true, "description": "CPA-certified cost basis"},
        {"type": "ownership_structure", "required": true, "description": "Entity ownership documentation"},
        {"type": "domestic_content_affidavit", "required": false, "description": "Domestic content certification if applicable"}
    ]'::JSONB
),
(
    'State Grant Application',
    'Standard template for state-level grant applications',
    true,
    true,
    60,
    '[
        {"id": "review_requirements", "title": "Review program requirements", "description": "Review all program requirements and eligibility criteria", "category": "review", "order": 1, "estimated_days": 3, "priority": "high"},
        {"id": "gather_docs", "title": "Gather required documents", "description": "Collect all documents specified in application checklist", "category": "documentation", "order": 2, "estimated_days": 10, "priority": "high"},
        {"id": "draft_narrative", "title": "Draft project narrative", "description": "Write project description and impact narrative", "category": "documentation", "order": 3, "estimated_days": 5, "priority": "medium"},
        {"id": "prepare_budget", "title": "Prepare project budget", "description": "Complete detailed project budget form", "category": "documentation", "order": 4, "estimated_days": 5, "priority": "medium"},
        {"id": "obtain_letters", "title": "Obtain support letters", "description": "Request and collect letters of support if required", "category": "documentation", "order": 5, "estimated_days": 10, "priority": "low"},
        {"id": "internal_review", "title": "Internal review", "description": "Review all materials before submission", "category": "review", "order": 6, "estimated_days": 3, "priority": "high"},
        {"id": "submit", "title": "Submit application", "description": "Submit via program portal or mail", "category": "submission", "order": 7, "estimated_days": 1, "priority": "urgent"}
    ]'::JSONB,
    '[
        {"type": "project_description", "required": true, "description": "Detailed project description"},
        {"type": "budget", "required": true, "description": "Project budget and cost breakdown"},
        {"type": "timeline", "required": true, "description": "Project timeline and milestones"},
        {"type": "support_letters", "required": false, "description": "Letters of community support"}
    ]'::JSONB
),
(
    'Utility Rebate Application',
    'Streamlined template for utility rebate programs',
    true,
    true,
    30,
    '[
        {"id": "verify_utility", "title": "Verify utility eligibility", "description": "Confirm property is in utility service territory", "category": "review", "order": 1, "estimated_days": 1, "priority": "high"},
        {"id": "get_specs", "title": "Get equipment specifications", "description": "Collect specifications for eligible equipment", "category": "documentation", "order": 2, "estimated_days": 3, "priority": "high"},
        {"id": "get_quotes", "title": "Obtain contractor quotes", "description": "Get quotes from approved contractors", "category": "documentation", "order": 3, "estimated_days": 5, "priority": "medium"},
        {"id": "complete_forms", "title": "Complete application forms", "description": "Fill out utility application forms", "category": "submission", "order": 4, "estimated_days": 2, "priority": "medium"},
        {"id": "submit", "title": "Submit pre-approval application", "description": "Submit for pre-approval before installation", "category": "submission", "order": 5, "estimated_days": 1, "priority": "high"}
    ]'::JSONB,
    '[
        {"type": "equipment_specs", "required": true, "description": "Equipment specifications and model numbers"},
        {"type": "contractor_quote", "required": true, "description": "Contractor quote or estimate"},
        {"type": "utility_bill", "required": true, "description": "Recent utility bill showing account number"}
    ]'::JSONB
);

-- ============================================================================
-- SEED DATA: Default Workflow Automations
-- ============================================================================

INSERT INTO workflow_automations (
    name,
    description,
    is_system_automation,
    is_active,
    trigger_type,
    trigger_config,
    actions,
    priority
) VALUES
(
    'Auto-Create Tasks on Application Start',
    'Automatically creates checklist tasks when an application moves to in-progress status',
    true,
    true,
    'status_changed',
    '{"from_status": "draft", "to_status": "in-progress"}'::JSONB,
    '[
        {"type": "create_tasks", "config": {}},
        {"type": "schedule_reminders", "config": {"days_before": [14, 7, 3, 1]}},
        {"type": "add_comment", "config": {"message": "Application started. Tasks and reminders have been automatically created."}}
    ]'::JSONB,
    10
),
(
    'Notify on Submission',
    'Send notification when application is submitted',
    true,
    true,
    'status_changed',
    '{"to_status": "submitted"}'::JSONB,
    '[
        {"type": "add_comment", "config": {"message": "Application has been submitted successfully. Awaiting review."}},
        {"type": "send_notification", "config": {"template": "application_submitted", "to": "creator"}}
    ]'::JSONB,
    20
),
(
    'Alert on Task Overdue',
    'Create alert when a task becomes overdue',
    true,
    true,
    'task_overdue',
    '{}'::JSONB,
    '[
        {"type": "send_notification", "config": {"template": "task_overdue", "to": "assigned_user"}},
        {"type": "add_comment", "config": {"message": "A task has become overdue. Please review and update."}}
    ]'::JSONB,
    30
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE application_templates IS 'Reusable templates for creating applications with pre-defined tasks and documents';
COMMENT ON TABLE application_tasks IS 'Checklist tasks for tracking application progress';
COMMENT ON TABLE application_comments IS 'Comments and collaboration on applications';
COMMENT ON TABLE application_reminders IS 'Scheduled reminders for application deadlines and tasks';
COMMENT ON TABLE workflow_automations IS 'Configurable automation rules triggered by application events';
COMMENT ON TABLE workflow_automation_executions IS 'Execution history and results for workflow automations';
COMMENT ON TABLE application_status_history IS 'Audit trail of application status changes';

COMMENT ON FUNCTION get_valid_status_transitions IS 'Returns array of valid status transitions from a given status';
COMMENT ON FUNCTION validate_application_status_transition IS 'Validates if a status transition is allowed';
COMMENT ON FUNCTION calculate_application_deadline IS 'Calculates deadline based on program and template settings';
COMMENT ON FUNCTION create_tasks_from_template IS 'Creates tasks for an application from a template';
COMMENT ON FUNCTION schedule_deadline_reminders IS 'Schedules automatic reminders before deadline';
COMMENT ON FUNCTION process_workflow_automation IS 'Executes a workflow automation and logs results';
