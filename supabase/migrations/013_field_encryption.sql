-- IncentEdge Database Schema
-- Migration: 013_field_encryption
-- Description: Add encrypted columns for sensitive PII data at rest
-- Date: 2026-02-17
-- Security: Implements AES-256-GCM encryption for sensitive fields

-- ============================================================================
-- OVERVIEW
-- ============================================================================
-- This migration adds encrypted columns for sensitive data fields.
-- Data is encrypted at the application layer using AES-256-GCM.
--
-- Encrypted Fields:
-- - organizations: ein, duns_number, sam_uei
-- - webhook_configs: secret (HMAC signing key)
-- - api_keys: key_hash (encrypted API key hash)
-- - prevailing_wage_certifications: contractor_ein
-- - apprenticeship_reports: contractor_ein
--
-- Strategy:
-- 1. Add encrypted_* columns alongside existing columns
-- 2. Application will encrypt new data going forward
-- 3. Gradual migration of existing data (via background job)
-- 4. Eventually drop old plaintext columns (separate migration)
--
-- ============================================================================

-- ============================================================================
-- ORGANIZATIONS - Add encrypted PII columns
-- ============================================================================

-- Add encrypted columns for organization identifiers
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS encrypted_ein TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_duns_number TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_sam_uei TEXT,
  ADD COLUMN IF NOT EXISTS encryption_key_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS encrypted_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN organizations.encrypted_ein IS 'Encrypted EIN using AES-256-GCM';
COMMENT ON COLUMN organizations.encrypted_duns_number IS 'Encrypted DUNS number using AES-256-GCM';
COMMENT ON COLUMN organizations.encrypted_sam_uei IS 'Encrypted SAM.gov UEI using AES-256-GCM';
COMMENT ON COLUMN organizations.encryption_key_id IS 'ID of encryption key used';
COMMENT ON COLUMN organizations.encrypted_at IS 'Timestamp when data was last encrypted';

-- ============================================================================
-- WEBHOOK_CONFIGS - Encrypt webhook secrets
-- ============================================================================

-- Add encrypted secret column
ALTER TABLE webhook_configs
  ADD COLUMN IF NOT EXISTS encrypted_secret TEXT,
  ADD COLUMN IF NOT EXISTS secret_encryption_key_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS secret_encrypted_at TIMESTAMPTZ;

-- Update comment
COMMENT ON COLUMN webhook_configs.secret IS 'DEPRECATED: Use encrypted_secret instead';
COMMENT ON COLUMN webhook_configs.encrypted_secret IS 'Encrypted webhook HMAC secret using AES-256-GCM';

-- ============================================================================
-- API_KEYS - Encrypt API key hashes
-- ============================================================================

-- Add encrypted key hash column
ALTER TABLE api_keys
  ADD COLUMN IF NOT EXISTS encrypted_key_hash TEXT,
  ADD COLUMN IF NOT EXISTS key_encryption_key_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS key_encrypted_at TIMESTAMPTZ;

-- Update comment
COMMENT ON COLUMN api_keys.key_hash IS 'DEPRECATED: Use encrypted_key_hash instead';
COMMENT ON COLUMN api_keys.encrypted_key_hash IS 'Encrypted API key hash using AES-256-GCM';

-- ============================================================================
-- PREVAILING_WAGE_CERTIFICATIONS - Encrypt contractor EINs
-- ============================================================================

-- Add encrypted contractor EIN
ALTER TABLE prevailing_wage_certifications
  ADD COLUMN IF NOT EXISTS encrypted_contractor_ein TEXT,
  ADD COLUMN IF NOT EXISTS ein_encryption_key_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ein_encrypted_at TIMESTAMPTZ;

COMMENT ON COLUMN prevailing_wage_certifications.encrypted_contractor_ein IS 'Encrypted contractor EIN using AES-256-GCM';

-- ============================================================================
-- APPRENTICESHIP_REPORTS - Encrypt contractor EINs
-- ============================================================================

-- Add encrypted contractor EIN
ALTER TABLE apprenticeship_reports
  ADD COLUMN IF NOT EXISTS encrypted_contractor_ein TEXT,
  ADD COLUMN IF NOT EXISTS ein_encryption_key_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ein_encrypted_at TIMESTAMPTZ;

COMMENT ON COLUMN apprenticeship_reports.encrypted_contractor_ein IS 'Encrypted contractor EIN using AES-256-GCM';

-- ============================================================================
-- ENCRYPTION AUDIT LOG
-- ============================================================================

-- Create audit log for encryption operations
CREATE TABLE IF NOT EXISTS encryption_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Operation details
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('encrypt', 'decrypt', 'reencrypt', 'rotate')),
    table_name VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    record_id UUID,

    -- Key information
    encryption_key_id VARCHAR(50) NOT NULL,
    key_version INTEGER,

    -- Result
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,

    -- Context
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    ip_address INET,

    -- Metadata
    operation_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX idx_encryption_audit_table ON encryption_audit_log(table_name, column_name);
CREATE INDEX idx_encryption_audit_key ON encryption_audit_log(encryption_key_id);
CREATE INDEX idx_encryption_audit_created ON encryption_audit_log(created_at DESC);
CREATE INDEX idx_encryption_audit_failures ON encryption_audit_log(success, created_at DESC) WHERE success = false;

-- Enable RLS on audit log
ALTER TABLE encryption_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view encryption audit log" ON encryption_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE encryption_audit_log IS 'Audit trail for all encryption operations';

-- ============================================================================
-- ENCRYPTION KEY METADATA
-- ============================================================================

-- Table to track encryption key metadata
CREATE TABLE IF NOT EXISTS encryption_keys (
    id VARCHAR(50) PRIMARY KEY,

    -- Key metadata (NOT the actual key - that stays in env vars)
    version INTEGER NOT NULL,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'AES-256-GCM',
    key_length INTEGER NOT NULL DEFAULT 32,

    -- Status
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    rotated_at TIMESTAMPTZ,

    -- KMS integration (optional)
    kms_arn TEXT,
    kms_region VARCHAR(20),

    -- Usage tracking
    encryption_count BIGINT DEFAULT 0,
    decryption_count BIGINT DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Metadata
    created_by UUID REFERENCES profiles(id),
    notes TEXT
);

-- Indexes for encryption keys
CREATE INDEX idx_encryption_keys_active ON encryption_keys(is_active, created_at DESC) WHERE is_active = true;
CREATE INDEX idx_encryption_keys_version ON encryption_keys(version DESC);

-- Enable RLS
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Only admins can view key metadata
CREATE POLICY "Admins can view encryption key metadata" ON encryption_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can manage keys
CREATE POLICY "Admins can manage encryption keys" ON encryption_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE encryption_keys IS 'Metadata for encryption keys (NOT the actual keys)';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to log encryption operations
CREATE OR REPLACE FUNCTION log_encryption_operation(
    p_operation VARCHAR,
    p_table_name VARCHAR,
    p_column_name VARCHAR,
    p_record_id UUID,
    p_key_id VARCHAR,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO encryption_audit_log (
        operation,
        table_name,
        column_name,
        record_id,
        encryption_key_id,
        success,
        error_message,
        user_id,
        organization_id
    )
    VALUES (
        p_operation,
        p_table_name,
        p_column_name,
        p_record_id,
        p_key_id,
        p_success,
        p_error_message,
        auth.uid(),
        (SELECT organization_id FROM profiles WHERE id = auth.uid())
    )
    RETURNING id INTO v_id;

    -- Update key usage stats
    UPDATE encryption_keys
    SET
        encryption_count = CASE WHEN p_operation = 'encrypt' THEN encryption_count + 1 ELSE encryption_count END,
        decryption_count = CASE WHEN p_operation = 'decrypt' THEN decryption_count + 1 ELSE decryption_count END,
        last_used_at = NOW()
    WHERE id = p_key_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get encryption statistics
CREATE OR REPLACE FUNCTION get_encryption_stats()
RETURNS TABLE (
    total_encrypted_fields BIGINT,
    total_operations BIGINT,
    failed_operations BIGINT,
    active_keys INTEGER,
    last_encryption TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (
            SELECT COUNT(*) FROM organizations WHERE encrypted_ein IS NOT NULL
        ) + (
            SELECT COUNT(*) FROM webhook_configs WHERE encrypted_secret IS NOT NULL
        ) + (
            SELECT COUNT(*) FROM api_keys WHERE encrypted_key_hash IS NOT NULL
        ) AS total_encrypted_fields,
        (
            SELECT COUNT(*) FROM encryption_audit_log
        ) AS total_operations,
        (
            SELECT COUNT(*) FROM encryption_audit_log WHERE success = false
        ) AS failed_operations,
        (
            SELECT COUNT(*)::INTEGER FROM encryption_keys WHERE is_active = true
        ) AS active_keys,
        (
            SELECT MAX(created_at) FROM encryption_audit_log
        ) AS last_encryption;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATA MIGRATION HELPER FUNCTION
-- ============================================================================

-- Function to migrate existing plaintext data to encrypted columns
-- This should be run as a background job, not during migration
CREATE OR REPLACE FUNCTION migrate_plaintext_to_encrypted(
    p_table_name VARCHAR,
    p_source_column VARCHAR,
    p_target_column VARCHAR,
    p_batch_size INTEGER DEFAULT 100
)
RETURNS TABLE (
    processed INTEGER,
    encrypted INTEGER,
    failed INTEGER
) AS $$
DECLARE
    v_processed INTEGER := 0;
    v_encrypted INTEGER := 0;
    v_failed INTEGER := 0;
BEGIN
    -- This is a placeholder function
    -- The actual encryption must be done at the application layer
    -- because we don't store encryption keys in the database

    RAISE NOTICE 'Data migration must be performed at application layer';
    RAISE NOTICE 'Table: %, Source: %, Target: %', p_table_name, p_source_column, p_target_column;

    -- Return summary
    RETURN QUERY SELECT v_processed, v_encrypted, v_failed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VIEWS FOR ENCRYPTED DATA MONITORING
-- ============================================================================

-- View to monitor encryption coverage
CREATE OR REPLACE VIEW v_encryption_coverage AS
SELECT
    'organizations' AS table_name,
    'ein' AS field_name,
    COUNT(*) AS total_records,
    COUNT(encrypted_ein) AS encrypted_records,
    COUNT(*) - COUNT(encrypted_ein) AS unencrypted_records,
    ROUND(100.0 * COUNT(encrypted_ein) / NULLIF(COUNT(*), 0), 2) AS encryption_percentage
FROM organizations
UNION ALL
SELECT
    'organizations',
    'duns_number',
    COUNT(*),
    COUNT(encrypted_duns_number),
    COUNT(*) - COUNT(encrypted_duns_number),
    ROUND(100.0 * COUNT(encrypted_duns_number) / NULLIF(COUNT(*), 0), 2)
FROM organizations
UNION ALL
SELECT
    'organizations',
    'sam_uei',
    COUNT(*),
    COUNT(encrypted_sam_uei),
    COUNT(*) - COUNT(encrypted_sam_uei),
    ROUND(100.0 * COUNT(encrypted_sam_uei) / NULLIF(COUNT(*), 0), 2)
FROM organizations
UNION ALL
SELECT
    'webhook_configs',
    'secret',
    COUNT(*),
    COUNT(encrypted_secret),
    COUNT(*) - COUNT(encrypted_secret),
    ROUND(100.0 * COUNT(encrypted_secret) / NULLIF(COUNT(*), 0), 2)
FROM webhook_configs
UNION ALL
SELECT
    'api_keys',
    'key_hash',
    COUNT(*),
    COUNT(encrypted_key_hash),
    COUNT(*) - COUNT(encrypted_key_hash),
    ROUND(100.0 * COUNT(encrypted_key_hash) / NULLIF(COUNT(*), 0), 2)
FROM api_keys;

COMMENT ON VIEW v_encryption_coverage IS 'Monitor encryption coverage across tables';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE encryption_audit_log IS 'Complete audit trail of all encryption/decryption operations';
COMMENT ON TABLE encryption_keys IS 'Metadata about encryption keys (actual keys stored in environment)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations - encrypted field lookups (cannot be indexed directly, but can index metadata)
CREATE INDEX idx_organizations_encrypted_at ON organizations(encrypted_at DESC) WHERE encrypted_ein IS NOT NULL;
CREATE INDEX idx_organizations_encryption_key ON organizations(encryption_key_id) WHERE encryption_key_id IS NOT NULL;

-- Webhook configs
CREATE INDEX idx_webhook_secret_encrypted ON webhook_configs(secret_encrypted_at DESC) WHERE encrypted_secret IS NOT NULL;

-- API keys
CREATE INDEX idx_api_keys_encrypted ON api_keys(key_encrypted_at DESC) WHERE encrypted_key_hash IS NOT NULL;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant execute on helper functions to authenticated users
GRANT EXECUTE ON FUNCTION log_encryption_operation TO authenticated;
GRANT EXECUTE ON FUNCTION get_encryption_stats TO authenticated;

-- Grant select on views to authenticated users
GRANT SELECT ON v_encryption_coverage TO authenticated;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- IMPORTANT: Data migration steps
--
-- 1. Deploy this migration to add encrypted columns
-- 2. Deploy application code with encryption library
-- 3. Run background job to encrypt existing data:
--    - Read plaintext field
--    - Encrypt using application layer
--    - Write to encrypted_* column
--    - Set encryption_key_id and encrypted_at
-- 4. Monitor encryption_coverage view
-- 5. Once 100% encrypted, update application to use encrypted columns
-- 6. After validation period, drop plaintext columns (separate migration)
--
-- ROLLBACK: If needed, plaintext columns remain intact until explicitly dropped
--
-- SECURITY NOTES:
-- - Encryption keys NEVER stored in database
-- - Keys managed via ENCRYPTION_MASTER_SECRET environment variable
-- - Use PBKDF2 with 100,000+ iterations for key derivation
-- - AES-256-GCM provides authenticated encryption
-- - Monitor encryption_audit_log for failed operations (may indicate tampering)
