-- IncentEdge Database Schema
-- Migration: 008_background_jobs
-- Description: Background jobs and async processing system
-- Date: 2026-01-09

-- ============================================================================
-- JOB STATUS ENUM
-- ============================================================================
CREATE TYPE job_status AS ENUM (
    'pending',      -- Job is queued but not started
    'running',      -- Job is currently being processed
    'completed',    -- Job finished successfully
    'failed',       -- Job failed with an error
    'cancelled',    -- Job was cancelled before completion
    'dead'          -- Job moved to dead letter queue after max retries
);

-- ============================================================================
-- JOB PRIORITY ENUM
-- ============================================================================
CREATE TYPE job_priority AS ENUM ('low', 'normal', 'high', 'critical');

-- ============================================================================
-- JOB TYPE ENUM
-- ============================================================================
CREATE TYPE job_type AS ENUM (
    'eligibility_scan',       -- Async eligibility calculation
    'report_generation',      -- Generate PDF/Excel reports
    'notification_batch',     -- Send batch notifications
    'deadline_check',         -- Check for upcoming deadlines
    'program_sync',           -- Sync incentive programs from external sources
    'document_extraction',    -- AI document processing
    'analytics_refresh'       -- Update analytics cache
);

-- ============================================================================
-- BACKGROUND_JOBS TABLE
-- Main job queue with status tracking
-- ============================================================================
CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Job Identity
    job_type job_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    -- Ownership
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Priority & Scheduling
    priority job_priority DEFAULT 'normal',
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    -- Status
    status job_status DEFAULT 'pending',
    -- Progress Tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    progress_message TEXT,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 1,
    -- Payload & Results
    payload JSONB DEFAULT '{}',             -- Input data for the job
    result JSONB DEFAULT '{}',              -- Output data from the job
    -- Related Entities
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    -- Execution Details
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    worker_id VARCHAR(100),                 -- ID of the worker processing this job
    -- Retry Logic
    attempt INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    error_stack TEXT,
    next_retry_at TIMESTAMPTZ,
    -- Timeout
    timeout_seconds INTEGER DEFAULT 300,    -- 5 minute default
    expires_at TIMESTAMPTZ,                 -- Job expires if not started by this time
    -- Metadata
    idempotency_key VARCHAR(255) UNIQUE,    -- Prevent duplicate jobs
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- JOB_SCHEDULES TABLE
-- Recurring job schedules using cron expressions
-- ============================================================================
CREATE TABLE job_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Schedule Identity
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    -- Job Configuration
    job_type job_type NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    priority job_priority DEFAULT 'normal',
    payload JSONB DEFAULT '{}',             -- Default payload for scheduled jobs
    timeout_seconds INTEGER DEFAULT 300,
    max_attempts INTEGER DEFAULT 3,
    -- Cron Expression (standard 5-field format)
    -- minute hour day-of-month month day-of-week
    -- Example: "0 6 * * *" = 6 AM daily
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    -- Scope
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- NULL = system-wide
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Execution Tracking
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_job_id UUID REFERENCES background_jobs(id) ON DELETE SET NULL,
    run_count INTEGER DEFAULT 0,
    consecutive_failures INTEGER DEFAULT 0,
    -- Restrictions
    max_concurrent INTEGER DEFAULT 1,       -- Max concurrent jobs from this schedule
    skip_if_previous_running BOOLEAN DEFAULT true,
    -- Notifications
    notify_on_failure BOOLEAN DEFAULT true,
    notify_email VARCHAR(255),
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- JOB_LOGS TABLE
-- Execution history and audit trail
-- ============================================================================
CREATE TABLE job_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES background_jobs(id) ON DELETE CASCADE,
    -- Log Level
    level VARCHAR(20) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    -- Log Content
    message TEXT NOT NULL,
    -- Context
    step INTEGER,
    step_name VARCHAR(100),
    -- Additional Data
    data JSONB DEFAULT '{}',
    error_code VARCHAR(50),
    -- Performance
    duration_ms INTEGER,
    memory_usage_mb DECIMAL(10,2),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DEAD_LETTER_QUEUE TABLE
-- Failed jobs that exceeded retry limits
-- ============================================================================
CREATE TABLE job_dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_job_id UUID NOT NULL,
    -- Job Details (copied from original)
    job_type job_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    priority job_priority,
    payload JSONB DEFAULT '{}',
    -- Failure Details
    total_attempts INTEGER NOT NULL,
    last_error TEXT,
    error_stack TEXT,
    failure_reason TEXT,
    -- Recovery Options
    can_retry BOOLEAN DEFAULT true,
    retry_after TIMESTAMPTZ,                -- Manual hold until this time
    -- Resolution
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolution_action VARCHAR(50) CHECK (resolution_action IN ('retried', 'discarded', 'manual')),
    resolution_notes TEXT,
    -- Metadata
    moved_at TIMESTAMPTZ DEFAULT NOW(),
    original_created_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- ============================================================================
-- JOB_METRICS TABLE
-- Aggregated metrics for job performance monitoring
-- ============================================================================
CREATE TABLE job_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Time Window
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
    -- Job Type
    job_type job_type NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    -- Counts
    jobs_created INTEGER DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    jobs_failed INTEGER DEFAULT 0,
    jobs_retried INTEGER DEFAULT 0,
    -- Timing (in milliseconds)
    avg_duration_ms INTEGER,
    min_duration_ms INTEGER,
    max_duration_ms INTEGER,
    p95_duration_ms INTEGER,
    -- Queue Metrics
    avg_queue_time_ms INTEGER,              -- Time from creation to start
    max_queue_time_ms INTEGER,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint for upsert
    UNIQUE(metric_date, metric_hour, job_type, organization_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Background Jobs - Query patterns
CREATE INDEX idx_jobs_status ON background_jobs(status);
CREATE INDEX idx_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_jobs_organization ON background_jobs(organization_id);
CREATE INDEX idx_jobs_project ON background_jobs(project_id);
CREATE INDEX idx_jobs_scheduled ON background_jobs(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_jobs_priority ON background_jobs(priority DESC, scheduled_at ASC) WHERE status = 'pending';
CREATE INDEX idx_jobs_created ON background_jobs(created_at DESC);
CREATE INDEX idx_jobs_worker ON background_jobs(worker_id) WHERE status = 'running';
CREATE INDEX idx_jobs_retry ON background_jobs(next_retry_at) WHERE status = 'failed' AND attempt < max_attempts;
CREATE INDEX idx_jobs_expires ON background_jobs(expires_at) WHERE expires_at IS NOT NULL AND status = 'pending';

-- Job Schedules
CREATE INDEX idx_schedules_next_run ON job_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX idx_schedules_type ON job_schedules(job_type);
CREATE INDEX idx_schedules_organization ON job_schedules(organization_id);

-- Job Logs
CREATE INDEX idx_logs_job ON job_logs(job_id);
CREATE INDEX idx_logs_level ON job_logs(level) WHERE level IN ('error', 'fatal');
CREATE INDEX idx_logs_created ON job_logs(created_at DESC);

-- Dead Letter Queue
CREATE INDEX idx_dlq_resolved ON job_dead_letter_queue(resolved) WHERE resolved = false;
CREATE INDEX idx_dlq_type ON job_dead_letter_queue(job_type);
CREATE INDEX idx_dlq_organization ON job_dead_letter_queue(organization_id);

-- Job Metrics
CREATE INDEX idx_metrics_date ON job_metrics(metric_date DESC);
CREATE INDEX idx_metrics_type_date ON job_metrics(job_type, metric_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_dead_letter_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_metrics ENABLE ROW LEVEL SECURITY;

-- Background Jobs: Org members can view their jobs
CREATE POLICY "Org members can view jobs" ON background_jobs
    FOR SELECT USING (
        organization_id IS NULL OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can create jobs" ON background_jobs
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Job Schedules: Org admins can manage schedules
CREATE POLICY "Org members can view schedules" ON job_schedules
    FOR SELECT USING (
        organization_id IS NULL OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org admins can manage schedules" ON job_schedules
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Job Logs: Org members can view logs for their jobs
CREATE POLICY "Org members can view job logs" ON job_logs
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM background_jobs
            WHERE organization_id IS NULL OR
            organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Dead Letter Queue: Org admins can manage
CREATE POLICY "Org members can view dead letters" ON job_dead_letter_queue
    FOR SELECT USING (
        organization_id IS NULL OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org admins can manage dead letters" ON job_dead_letter_queue
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Job Metrics: Org members can view their metrics
CREATE POLICY "Org members can view metrics" ON job_metrics
    FOR SELECT USING (
        organization_id IS NULL OR
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp (if not exists)
-- Already exists from initial migration, but included for completeness
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
CREATE TRIGGER update_background_jobs_updated_at BEFORE UPDATE ON background_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_schedules_updated_at BEFORE UPDATE ON job_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_metrics_updated_at BEFORE UPDATE ON job_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a background job
CREATE OR REPLACE FUNCTION create_background_job(
    p_job_type job_type,
    p_name VARCHAR,
    p_organization_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_priority job_priority DEFAULT 'normal',
    p_payload JSONB DEFAULT '{}',
    p_project_id UUID DEFAULT NULL,
    p_application_id UUID DEFAULT NULL,
    p_document_id UUID DEFAULT NULL,
    p_scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    p_timeout_seconds INTEGER DEFAULT 300,
    p_max_attempts INTEGER DEFAULT 3,
    p_idempotency_key VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_job_id UUID;
BEGIN
    -- Check for duplicate using idempotency key
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_job_id
        FROM background_jobs
        WHERE idempotency_key = p_idempotency_key;

        IF FOUND THEN
            RETURN v_job_id;
        END IF;
    END IF;

    INSERT INTO background_jobs (
        job_type, name, organization_id, created_by, priority, payload,
        project_id, application_id, document_id,
        scheduled_at, timeout_seconds, max_attempts, idempotency_key
    ) VALUES (
        p_job_type, p_name, p_organization_id, p_created_by, p_priority, p_payload,
        p_project_id, p_application_id, p_document_id,
        p_scheduled_at, p_timeout_seconds, p_max_attempts, p_idempotency_key
    )
    RETURNING id INTO v_job_id;

    RETURN v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to claim a job for processing
CREATE OR REPLACE FUNCTION claim_next_job(
    p_worker_id VARCHAR,
    p_job_types job_type[] DEFAULT NULL
)
RETURNS SETOF background_jobs AS $$
DECLARE
    v_job background_jobs%ROWTYPE;
BEGIN
    -- Find and claim the next available job
    UPDATE background_jobs
    SET
        status = 'running',
        started_at = NOW(),
        worker_id = p_worker_id,
        attempt = attempt + 1
    WHERE id = (
        SELECT id FROM background_jobs
        WHERE status = 'pending'
        AND scheduled_at <= NOW()
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (p_job_types IS NULL OR job_type = ANY(p_job_types))
        ORDER BY
            CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 2
                WHEN 'normal' THEN 3
                WHEN 'low' THEN 4
            END,
            scheduled_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING * INTO v_job;

    IF FOUND THEN
        RETURN NEXT v_job;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a job
CREATE OR REPLACE FUNCTION complete_job(
    p_job_id UUID,
    p_result JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    UPDATE background_jobs
    SET
        status = 'completed',
        completed_at = NOW(),
        progress = 100,
        result = p_result
    WHERE id = p_job_id AND status = 'running';

    -- Update metrics
    INSERT INTO job_metrics (
        metric_date, metric_hour, job_type, organization_id,
        jobs_completed
    )
    SELECT
        CURRENT_DATE,
        EXTRACT(HOUR FROM NOW())::INTEGER,
        job_type,
        organization_id,
        1
    FROM background_jobs
    WHERE id = p_job_id
    ON CONFLICT (metric_date, metric_hour, job_type, organization_id)
    DO UPDATE SET
        jobs_completed = job_metrics.jobs_completed + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fail a job
CREATE OR REPLACE FUNCTION fail_job(
    p_job_id UUID,
    p_error TEXT,
    p_error_stack TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_job RECORD;
    v_retry_delay INTEGER;
BEGIN
    SELECT * INTO v_job FROM background_jobs WHERE id = p_job_id;

    IF v_job.attempt < v_job.max_attempts THEN
        -- Calculate exponential backoff: 30s, 90s, 270s, etc.
        v_retry_delay := 30 * POWER(3, v_job.attempt - 1);

        UPDATE background_jobs
        SET
            status = 'failed',
            last_error = p_error,
            error_stack = p_error_stack,
            next_retry_at = NOW() + (v_retry_delay || ' seconds')::INTERVAL
        WHERE id = p_job_id;
    ELSE
        -- Move to dead letter queue
        UPDATE background_jobs
        SET status = 'dead'
        WHERE id = p_job_id;

        INSERT INTO job_dead_letter_queue (
            original_job_id, job_type, name, organization_id, priority, payload,
            total_attempts, last_error, error_stack,
            failure_reason, original_created_at
        ) VALUES (
            p_job_id, v_job.job_type, v_job.name, v_job.organization_id, v_job.priority, v_job.payload,
            v_job.attempt, p_error, p_error_stack,
            'Max retries exceeded', v_job.created_at
        );
    END IF;

    -- Update metrics
    INSERT INTO job_metrics (
        metric_date, metric_hour, job_type, organization_id,
        jobs_failed
    )
    SELECT
        CURRENT_DATE,
        EXTRACT(HOUR FROM NOW())::INTEGER,
        job_type,
        organization_id,
        1
    FROM background_jobs
    WHERE id = p_job_id
    ON CONFLICT (metric_date, metric_hour, job_type, organization_id)
    DO UPDATE SET
        jobs_failed = job_metrics.jobs_failed + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update job progress
CREATE OR REPLACE FUNCTION update_job_progress(
    p_job_id UUID,
    p_progress INTEGER,
    p_message TEXT DEFAULT NULL,
    p_current_step INTEGER DEFAULT NULL,
    p_total_steps INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE background_jobs
    SET
        progress = LEAST(GREATEST(p_progress, 0), 100),
        progress_message = COALESCE(p_message, progress_message),
        current_step = COALESCE(p_current_step, current_step),
        total_steps = COALESCE(p_total_steps, total_steps)
    WHERE id = p_job_id AND status = 'running';
END;
$$ LANGUAGE plpgsql;

-- Function to log job activity
CREATE OR REPLACE FUNCTION log_job(
    p_job_id UUID,
    p_level VARCHAR,
    p_message TEXT,
    p_step INTEGER DEFAULT NULL,
    p_step_name VARCHAR DEFAULT NULL,
    p_data JSONB DEFAULT '{}',
    p_duration_ms INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO job_logs (
        job_id, level, message, step, step_name, data, duration_ms
    ) VALUES (
        p_job_id, p_level, p_message, p_step, p_step_name, p_data, p_duration_ms
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed jobs
CREATE OR REPLACE FUNCTION retry_pending_jobs()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH retried AS (
        UPDATE background_jobs
        SET
            status = 'pending',
            next_retry_at = NULL
        WHERE status = 'failed'
        AND next_retry_at <= NOW()
        AND attempt < max_attempts
        RETURNING id
    )
    SELECT COUNT(*) INTO v_count FROM retried;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old jobs
CREATE OR REPLACE FUNCTION cleanup_old_jobs(
    p_completed_retention_days INTEGER DEFAULT 7,
    p_failed_retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM background_jobs
        WHERE (
            (status = 'completed' AND completed_at < NOW() - (p_completed_retention_days || ' days')::INTERVAL)
            OR
            (status = 'dead' AND updated_at < NOW() - (p_failed_retention_days || ' days')::INTERVAL)
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO v_count FROM deleted;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to parse next run time from cron expression
-- Note: This is a simplified parser. For production, consider using pg_cron extension
CREATE OR REPLACE FUNCTION calculate_next_run(
    p_cron_expression VARCHAR,
    p_timezone VARCHAR DEFAULT 'America/New_York'
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    v_parts TEXT[];
    v_minute INTEGER;
    v_hour INTEGER;
    v_next TIMESTAMPTZ;
    v_now TIMESTAMPTZ;
BEGIN
    -- Parse cron expression (simplified: minute hour * * *)
    v_parts := string_to_array(p_cron_expression, ' ');

    IF array_length(v_parts, 1) != 5 THEN
        RAISE EXCEPTION 'Invalid cron expression: %', p_cron_expression;
    END IF;

    v_now := NOW() AT TIME ZONE p_timezone;

    -- Simple implementation for daily jobs at specific time
    IF v_parts[1] != '*' AND v_parts[2] != '*' THEN
        v_minute := v_parts[1]::INTEGER;
        v_hour := v_parts[2]::INTEGER;

        v_next := date_trunc('day', v_now) + (v_hour || ' hours')::INTERVAL + (v_minute || ' minutes')::INTERVAL;

        IF v_next <= v_now THEN
            v_next := v_next + INTERVAL '1 day';
        END IF;

        RETURN v_next AT TIME ZONE p_timezone;
    END IF;

    -- Default: next hour
    RETURN date_trunc('hour', NOW()) + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to process schedules and create jobs
CREATE OR REPLACE FUNCTION process_job_schedules()
RETURNS INTEGER AS $$
DECLARE
    v_schedule RECORD;
    v_job_id UUID;
    v_count INTEGER := 0;
    v_running_count INTEGER;
BEGIN
    FOR v_schedule IN
        SELECT * FROM job_schedules
        WHERE is_active = true
        AND next_run_at <= NOW()
    LOOP
        -- Check if previous job is still running
        IF v_schedule.skip_if_previous_running THEN
            SELECT COUNT(*) INTO v_running_count
            FROM background_jobs
            WHERE job_type = v_schedule.job_type
            AND organization_id IS NOT DISTINCT FROM v_schedule.organization_id
            AND status = 'running';

            IF v_running_count >= v_schedule.max_concurrent THEN
                CONTINUE;
            END IF;
        END IF;

        -- Create the job
        v_job_id := create_background_job(
            p_job_type := v_schedule.job_type,
            p_name := v_schedule.job_name,
            p_organization_id := v_schedule.organization_id,
            p_priority := v_schedule.priority,
            p_payload := v_schedule.payload,
            p_timeout_seconds := v_schedule.timeout_seconds,
            p_max_attempts := v_schedule.max_attempts
        );

        -- Update schedule
        UPDATE job_schedules
        SET
            last_run_at = NOW(),
            next_run_at = calculate_next_run(cron_expression, timezone),
            last_job_id = v_job_id,
            run_count = run_count + 1
        WHERE id = v_schedule.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT SCHEDULES (System-wide)
-- ============================================================================

INSERT INTO job_schedules (name, description, job_type, job_name, cron_expression, priority) VALUES
-- Daily at 6 AM - Check upcoming deadlines
('deadline_check_daily', 'Check for upcoming application deadlines', 'deadline_check', 'Daily Deadline Check', '0 6 * * *', 'high'),
-- Every 6 hours - Sync incentive programs
('program_sync_6h', 'Sync incentive programs from DSIRE and other sources', 'program_sync', 'Program Database Sync', '0 */6 * * *', 'normal'),
-- Daily at 2 AM - Refresh analytics cache
('analytics_refresh_daily', 'Update analytics and dashboard cache', 'analytics_refresh', 'Daily Analytics Refresh', '0 2 * * *', 'low'),
-- Every hour - Process notification batches
('notification_batch_hourly', 'Send pending notification batches', 'notification_batch', 'Hourly Notification Batch', '0 * * * *', 'normal');

-- Update next_run_at for all schedules
UPDATE job_schedules
SET next_run_at = calculate_next_run(cron_expression, timezone)
WHERE is_active = true;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE background_jobs IS 'Main job queue for async processing';
COMMENT ON TABLE job_schedules IS 'Recurring job schedules using cron expressions';
COMMENT ON TABLE job_logs IS 'Execution logs for job debugging and monitoring';
COMMENT ON TABLE job_dead_letter_queue IS 'Failed jobs that exceeded retry limits';
COMMENT ON TABLE job_metrics IS 'Aggregated performance metrics for jobs';
COMMENT ON TYPE job_status IS 'Status states for background jobs';
COMMENT ON TYPE job_priority IS 'Priority levels for job queue ordering';
COMMENT ON TYPE job_type IS 'Types of background jobs supported by IncentEdge';
