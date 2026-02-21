-- IncentEdge Database Schema
-- Migration: 007_webhooks_integrations
-- Description: Webhooks, API keys, and external integration connections
-- Date: 2026-01-09

-- ============================================================================
-- WEBHOOKS TABLE
-- Organization webhook configurations for outbound event notifications
-- ============================================================================
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Configuration
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    -- Security
    secret VARCHAR(255) NOT NULL, -- Used for HMAC signature verification
    -- Event subscriptions (which events trigger this webhook)
    events TEXT[] NOT NULL DEFAULT '{}',
    -- Filtering
    event_filters JSONB DEFAULT '{}', -- Optional filters like {project_ids: [...], statuses: [...]}
    -- Headers to include with each request
    custom_headers JSONB DEFAULT '{}',
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Retry configuration
    max_retries INTEGER DEFAULT 3,
    retry_interval_seconds INTEGER DEFAULT 60,
    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    -- Metadata
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    -- Created/Updated by
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- WEBHOOK EVENTS TABLE
-- Log of all webhook delivery attempts
-- ============================================================================
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Event details
    event_type VARCHAR(100) NOT NULL,
    event_id VARCHAR(100) NOT NULL, -- Unique identifier for this event occurrence
    -- Related entities
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,
    -- Payload
    payload JSONB NOT NULL,
    payload_hash VARCHAR(64), -- SHA256 hash for deduplication
    -- Delivery status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sending', 'delivered', 'failed', 'retrying', 'exhausted'
    )),
    -- Request details
    request_url TEXT,
    request_headers JSONB,
    request_body TEXT,
    -- Response details
    response_status_code INTEGER,
    response_headers JSONB,
    response_body TEXT,
    response_time_ms INTEGER,
    -- Retry tracking
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 4, -- 1 initial + 3 retries
    next_retry_at TIMESTAMPTZ,
    -- Error details
    error_message TEXT,
    error_code VARCHAR(50),
    -- Timestamps
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- API KEYS TABLE
-- Organization API keys for external access
-- ============================================================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Key identification
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Key values (key_prefix is visible, key_hash is stored securely)
    key_prefix VARCHAR(12) NOT NULL, -- First 12 chars for identification (e.g., "ie_live_abc123")
    key_hash VARCHAR(64) NOT NULL, -- SHA256 hash of full key
    -- Permissions
    scopes TEXT[] DEFAULT '{}', -- e.g., ['projects:read', 'applications:write', 'webhooks:manage']
    -- Access restrictions
    allowed_ips INET[] DEFAULT '{}', -- Empty means all IPs allowed
    allowed_domains TEXT[] DEFAULT '{}', -- For CORS restrictions
    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_day INTEGER DEFAULT 10000,
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    request_count INTEGER DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Expiration
    expires_at TIMESTAMPTZ,
    -- Environment
    environment VARCHAR(20) DEFAULT 'live' CHECK (environment IN ('live', 'test')),
    -- Created/Revoked by
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    revoked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INTEGRATION CONNECTIONS TABLE
-- OAuth connections to external services
-- ============================================================================
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Connection identification
    provider VARCHAR(50) NOT NULL, -- crux, foss_co, quickbooks, salesforce, zapier, make, etc.
    provider_display_name VARCHAR(100),
    -- OAuth tokens (encrypted at rest)
    access_token TEXT, -- Encrypted
    refresh_token TEXT, -- Encrypted
    token_type VARCHAR(50) DEFAULT 'Bearer',
    token_expires_at TIMESTAMPTZ,
    -- Provider-specific data
    provider_account_id VARCHAR(255), -- External account ID
    provider_account_name VARCHAR(255), -- External account name/email
    provider_metadata JSONB DEFAULT '{}', -- Additional provider-specific data
    -- Scopes granted
    scopes TEXT[] DEFAULT '{}',
    -- Configuration
    settings JSONB DEFAULT '{}', -- Connection-specific settings
    sync_enabled BOOLEAN DEFAULT true,
    sync_frequency VARCHAR(20) DEFAULT 'realtime' CHECK (sync_frequency IN ('realtime', 'hourly', 'daily', 'manual')),
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(30),
    last_sync_error TEXT,
    -- Status
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'error', 'pending')),
    -- Health monitoring
    health_check_at TIMESTAMPTZ,
    health_status VARCHAR(20) DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    consecutive_failures INTEGER DEFAULT 0,
    -- Created/Updated by
    connected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    disconnected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    disconnected_at TIMESTAMPTZ,
    disconnected_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure one connection per provider per organization
    UNIQUE(organization_id, provider)
);

-- ============================================================================
-- INTEGRATION SYNC LOGS TABLE
-- Track data synchronization with external services
-- ============================================================================
CREATE TABLE integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Sync details
    sync_type VARCHAR(50) NOT NULL, -- full, incremental, webhook, manual
    sync_direction VARCHAR(20) NOT NULL CHECK (sync_direction IN ('inbound', 'outbound', 'bidirectional')),
    -- Entity tracking
    entity_type VARCHAR(50), -- project, application, document, etc.
    entity_id UUID,
    external_entity_id VARCHAR(255),
    -- Results
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'partial', 'failed', 'skipped'
    )),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Webhooks
CREATE INDEX idx_webhooks_organization ON webhooks(organization_id);
CREATE INDEX idx_webhooks_active ON webhooks(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

-- Webhook Events
CREATE INDEX idx_webhook_events_webhook ON webhook_events(webhook_id);
CREATE INDEX idx_webhook_events_organization ON webhook_events(organization_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_retry ON webhook_events(next_retry_at) WHERE status = 'retrying';
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created ON webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_project ON webhook_events(project_id) WHERE project_id IS NOT NULL;

-- API Keys
CREATE INDEX idx_api_keys_organization ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_active ON api_keys(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_api_keys_environment ON api_keys(organization_id, environment);

-- Integration Connections
CREATE INDEX idx_connections_organization ON integration_connections(organization_id);
CREATE INDEX idx_connections_provider ON integration_connections(provider);
CREATE INDEX idx_connections_status ON integration_connections(status);
CREATE INDEX idx_connections_sync ON integration_connections(sync_enabled, last_sync_at) WHERE sync_enabled = true;

-- Integration Sync Logs
CREATE INDEX idx_sync_logs_connection ON integration_sync_logs(connection_id);
CREATE INDEX idx_sync_logs_organization ON integration_sync_logs(organization_id);
CREATE INDEX idx_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_sync_logs_created ON integration_sync_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Webhooks: Org admins/managers can manage
CREATE POLICY "Org members can view webhooks" ON webhooks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Org admins can manage webhooks" ON webhooks
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Webhook Events: Org admins/managers can view
CREATE POLICY "Org members can view webhook events" ON webhook_events
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- API Keys: Org admins can manage
CREATE POLICY "Org admins can view api keys" ON api_keys
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Org admins can manage api keys" ON api_keys
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Integration Connections: Org admins/managers can manage
CREATE POLICY "Org members can view connections" ON integration_connections
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Org admins can manage connections" ON integration_connections
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Integration Sync Logs: Org admins/managers can view
CREATE POLICY "Org members can view sync logs" ON integration_sync_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON integration_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate a secure API key
CREATE OR REPLACE FUNCTION generate_api_key(p_environment VARCHAR DEFAULT 'live')
RETURNS TABLE(full_key TEXT, key_prefix VARCHAR, key_hash VARCHAR) AS $$
DECLARE
    v_prefix VARCHAR;
    v_random_part VARCHAR;
    v_full_key TEXT;
BEGIN
    -- Generate prefix based on environment
    IF p_environment = 'test' THEN
        v_prefix := 'ie_test_';
    ELSE
        v_prefix := 'ie_live_';
    END IF;

    -- Generate random part (32 chars)
    v_random_part := encode(gen_random_bytes(24), 'base64');
    v_random_part := regexp_replace(v_random_part, '[^a-zA-Z0-9]', '', 'g');
    v_random_part := substring(v_random_part from 1 for 32);

    -- Combine
    v_full_key := v_prefix || v_random_part;

    RETURN QUERY SELECT
        v_full_key AS full_key,
        substring(v_full_key from 1 for 12)::VARCHAR AS key_prefix,
        encode(sha256(v_full_key::bytea), 'hex')::VARCHAR AS key_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify an API key
CREATE OR REPLACE FUNCTION verify_api_key(p_key TEXT)
RETURNS TABLE(
    api_key_id UUID,
    organization_id UUID,
    scopes TEXT[],
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_key_hash VARCHAR;
    v_api_key api_keys%ROWTYPE;
BEGIN
    -- Hash the provided key
    v_key_hash := encode(sha256(p_key::bytea), 'hex');

    -- Look up the key
    SELECT * INTO v_api_key
    FROM api_keys
    WHERE key_hash = v_key_hash;

    -- Check if key exists
    IF v_api_key.id IS NULL THEN
        RETURN QUERY SELECT
            NULL::UUID, NULL::UUID, NULL::TEXT[], false, 'Invalid API key'::TEXT;
        RETURN;
    END IF;

    -- Check if key is active
    IF NOT v_api_key.is_active THEN
        RETURN QUERY SELECT
            v_api_key.id, v_api_key.organization_id, v_api_key.scopes, false, 'API key is inactive'::TEXT;
        RETURN;
    END IF;

    -- Check if key is revoked
    IF v_api_key.revoked_at IS NOT NULL THEN
        RETURN QUERY SELECT
            v_api_key.id, v_api_key.organization_id, v_api_key.scopes, false, 'API key has been revoked'::TEXT;
        RETURN;
    END IF;

    -- Check if key is expired
    IF v_api_key.expires_at IS NOT NULL AND v_api_key.expires_at < NOW() THEN
        RETURN QUERY SELECT
            v_api_key.id, v_api_key.organization_id, v_api_key.scopes, false, 'API key has expired'::TEXT;
        RETURN;
    END IF;

    -- Update last used
    UPDATE api_keys
    SET last_used_at = NOW(), request_count = request_count + 1
    WHERE id = v_api_key.id;

    -- Return valid key info
    RETURN QUERY SELECT
        v_api_key.id, v_api_key.organization_id, v_api_key.scopes, true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue a webhook event
CREATE OR REPLACE FUNCTION queue_webhook_event(
    p_organization_id UUID,
    p_event_type VARCHAR,
    p_payload JSONB,
    p_project_id UUID DEFAULT NULL,
    p_application_id UUID DEFAULT NULL,
    p_incentive_program_id UUID DEFAULT NULL
)
RETURNS SETOF UUID AS $$
DECLARE
    v_webhook webhooks%ROWTYPE;
    v_event_id VARCHAR;
    v_inserted_id UUID;
BEGIN
    -- Generate unique event ID
    v_event_id := 'evt_' || encode(gen_random_bytes(12), 'hex');

    -- Find all active webhooks for this organization that subscribe to this event
    FOR v_webhook IN
        SELECT * FROM webhooks
        WHERE organization_id = p_organization_id
          AND is_active = true
          AND p_event_type = ANY(events)
    LOOP
        -- Insert webhook event
        INSERT INTO webhook_events (
            webhook_id,
            organization_id,
            event_type,
            event_id,
            project_id,
            application_id,
            incentive_program_id,
            payload,
            payload_hash,
            status,
            request_url,
            max_attempts,
            scheduled_at
        )
        VALUES (
            v_webhook.id,
            p_organization_id,
            p_event_type,
            v_event_id,
            p_project_id,
            p_application_id,
            p_incentive_program_id,
            p_payload,
            encode(sha256(p_payload::text::bytea), 'hex'),
            'pending',
            v_webhook.url,
            v_webhook.max_retries + 1,
            NOW()
        )
        RETURNING id INTO v_inserted_id;

        RETURN NEXT v_inserted_id;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE webhooks IS 'Organization webhook configurations for outbound event notifications';
COMMENT ON TABLE webhook_events IS 'Log of all webhook delivery attempts and their status';
COMMENT ON TABLE api_keys IS 'API keys for external access to IncentEdge data';
COMMENT ON TABLE integration_connections IS 'OAuth connections to external services like Crux, Salesforce, etc.';
COMMENT ON TABLE integration_sync_logs IS 'Track data synchronization with external services';

COMMENT ON FUNCTION generate_api_key IS 'Generate a secure API key with prefix and hash';
COMMENT ON FUNCTION verify_api_key IS 'Verify an API key and return its metadata';
COMMENT ON FUNCTION queue_webhook_event IS 'Queue a webhook event for delivery to all subscribed webhooks';
