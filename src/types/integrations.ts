/**
 * Integration Types for IncentEdge
 *
 * Type definitions for:
 * - Webhooks and webhook events
 * - API keys
 * - Integration connections (OAuth)
 * - Tax credit marketplace integrations (Crux, Foss & Co)
 * - Accounting system exports
 * - CRM integrations
 * - Automation platforms (Zapier, Make)
 */

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface Webhook {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  url: string;
  secret: string; // Masked in responses
  events: WebhookEventType[];
  event_filters: WebhookFilters;
  custom_headers: Record<string, string>;
  is_active: boolean;
  max_retries: number;
  retry_interval_seconds: number;
  rate_limit_per_minute: number;
  last_triggered_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  failure_count: number;
  success_count: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebhookWithStats extends Webhook {
  stats_24h?: {
    total: number;
    delivered: number;
    failed: number;
  };
}

export interface WebhookEvent {
  id: string;
  webhook_id: string;
  organization_id: string;
  event_type: WebhookEventType;
  event_id: string;
  project_id: string | null;
  application_id: string | null;
  incentive_program_id: string | null;
  payload: WebhookPayload;
  payload_hash: string | null;
  status: WebhookEventStatus;
  request_url: string | null;
  request_headers: Record<string, string> | null;
  request_body: string | null;
  response_status_code: number | null;
  response_headers: Record<string, string> | null;
  response_body: string | null;
  response_time_ms: number | null;
  attempt_count: number;
  max_attempts: number;
  next_retry_at: string | null;
  error_message: string | null;
  error_code: string | null;
  scheduled_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  failed_at: string | null;
  created_at: string;
}

export type WebhookEventStatus =
  | 'pending'
  | 'sending'
  | 'delivered'
  | 'failed'
  | 'retrying'
  | 'exhausted';

export type WebhookEventType =
  // Project events
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.status_changed'
  | 'project.archived'
  // Eligibility events
  | 'eligibility.scan_completed'
  | 'eligibility.new_match'
  | 'eligibility.match_updated'
  | 'eligibility.match_expired'
  // Application events
  | 'application.created'
  | 'application.submitted'
  | 'application.status_changed'
  | 'application.approved'
  | 'application.rejected'
  | 'application.document_added'
  // Deadline events
  | 'deadline.approaching'
  | 'deadline.today'
  | 'deadline.passed'
  // Incentive program events
  | 'program.new_available'
  | 'program.updated'
  | 'program.expiring'
  | 'program.expired'
  // Document events
  | 'document.uploaded'
  | 'document.processed'
  | 'document.ai_extracted'
  // Cost estimation events
  | 'cost_estimate.generated'
  | 'cost_estimate.updated'
  // Integration events
  | 'integration.connected'
  | 'integration.disconnected'
  | 'integration.sync_completed'
  | 'integration.sync_failed'
  // System events
  | 'webhook.test';

export interface WebhookFilters {
  project_ids?: string[];
  application_ids?: string[];
  incentive_program_ids?: string[];
  statuses?: string[];
  sectors?: string[];
  states?: string[];
  min_value?: number;
  max_value?: number;
}

export interface WebhookPayload<T = unknown> {
  id: string;
  event: WebhookEventType;
  created_at: string;
  organization_id: string;
  api_version: string;
  data: T;
  metadata?: {
    user_id?: string;
    user_email?: string;
    ip_address?: string;
    triggered_by?: string;
  };
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  key_hash: string; // Never exposed
  scopes: ApiKeyScope[];
  allowed_ips: string[];
  allowed_domains: string[];
  rate_limit_per_minute: number;
  rate_limit_per_day: number;
  last_used_at: string | null;
  last_used_ip: string | null;
  request_count: number;
  is_active: boolean;
  expires_at: string | null;
  environment: 'live' | 'test';
  created_by: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  revoked_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyWithSecret extends Omit<ApiKey, 'key_hash'> {
  key: string; // Full key, only shown once on creation
}

export type ApiKeyScope =
  | 'projects:read'
  | 'projects:write'
  | 'applications:read'
  | 'applications:write'
  | 'incentives:read'
  | 'documents:read'
  | 'documents:write'
  | 'webhooks:read'
  | 'webhooks:manage'
  | 'integrations:read'
  | 'integrations:manage'
  | 'reports:read'
  | 'reports:generate';

// ============================================================================
// INTEGRATION CONNECTION TYPES
// ============================================================================

export interface IntegrationConnection {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  provider_display_name: string | null;
  access_token: string | null; // Encrypted, never exposed
  refresh_token: string | null; // Encrypted, never exposed
  token_type: string;
  token_expires_at: string | null;
  provider_account_id: string | null;
  provider_account_name: string | null;
  provider_metadata: Record<string, unknown>;
  scopes: string[];
  settings: IntegrationSettings;
  sync_enabled: boolean;
  sync_frequency: SyncFrequency;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
  status: IntegrationStatus;
  health_check_at: string | null;
  health_status: HealthStatus;
  consecutive_failures: number;
  connected_by: string | null;
  disconnected_by: string | null;
  disconnected_at: string | null;
  disconnected_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type IntegrationProvider =
  // Tax Credit Marketplaces
  | 'crux'
  | 'foss_co'
  | 'reunion'
  // Accounting
  | 'quickbooks'
  | 'xero'
  | 'sage'
  // CRM
  | 'salesforce'
  | 'hubspot'
  // Automation
  | 'zapier'
  | 'make'
  // Document Management
  | 'docusign'
  | 'google_drive'
  | 'dropbox'
  // Project Management
  | 'procore';

export type IntegrationCategory =
  | 'tax_credit_marketplace'
  | 'accounting'
  | 'crm'
  | 'automation'
  | 'document_management'
  | 'project_management';

export type IntegrationStatus =
  | 'active'
  | 'inactive'
  | 'expired'
  | 'error'
  | 'pending';

export type SyncFrequency =
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'manual';

export type HealthStatus =
  | 'healthy'
  | 'degraded'
  | 'unhealthy'
  | 'unknown';

export interface IntegrationSettings {
  // Common settings
  auto_sync?: boolean;
  sync_direction?: 'inbound' | 'outbound' | 'bidirectional';

  // Accounting-specific
  default_account_code?: string;
  tax_category_mapping?: Record<string, string>;

  // CRM-specific
  lead_source?: string;
  deal_pipeline?: string;
  custom_field_mappings?: Record<string, string>;

  // Automation-specific
  trigger_events?: WebhookEventType[];
  action_mapping?: Record<string, unknown>;

  // Provider-specific
  [key: string]: unknown;
}

export interface IntegrationProviderConfig {
  name: string;
  displayName: string;
  description: string;
  category: IntegrationCategory;
  oauthSupported: boolean;
  scopes: string[];
  connected?: boolean;
  connection_id?: string;
  connection_status?: IntegrationStatus;
}

// ============================================================================
// TAX CREDIT MARKETPLACE TYPES (Crux, Foss & Co, etc.)
// ============================================================================

export interface TaxCreditListing {
  id: string;
  provider: 'crux' | 'foss_co' | 'reunion';
  external_id: string;
  project_id: string;
  credit_type: TaxCreditType;
  credit_year: number;
  face_value: number;
  asking_price: number;
  discount_rate: number;
  status: TaxCreditListingStatus;
  listing_date: string;
  expiration_date: string | null;
  buyer_id: string | null;
  sale_price: number | null;
  sale_date: string | null;
  created_at: string;
  updated_at: string;
}

export type TaxCreditType =
  | 'itc_solar'          // Investment Tax Credit - Solar
  | 'itc_storage'        // Investment Tax Credit - Battery Storage
  | 'itc_offshore_wind'  // Investment Tax Credit - Offshore Wind
  | 'ptc_wind'           // Production Tax Credit - Wind
  | 'ptc_solar'          // Production Tax Credit - Solar
  | '45q_ccs'            // Carbon Capture and Storage
  | '45v_hydrogen'       // Clean Hydrogen
  | '45x_manufacturing'  // Advanced Manufacturing
  | '48c_energy'         // Energy Community Credits
  | 'lihtc_9pct'         // Low Income Housing Tax Credit 9%
  | 'lihtc_4pct'         // Low Income Housing Tax Credit 4%
  | 'nmtc'               // New Markets Tax Credit
  | 'htc'                // Historic Tax Credit
  | 'state_credit';      // State-level credits

export type TaxCreditListingStatus =
  | 'draft'
  | 'pending_verification'
  | 'active'
  | 'under_negotiation'
  | 'sold'
  | 'expired'
  | 'withdrawn';

export interface CruxCredential {
  api_key: string;
  account_id: string;
  environment: 'sandbox' | 'production';
}

export interface FossCoCredential {
  client_id: string;
  client_secret: string;
  account_id: string;
}

// ============================================================================
// ACCOUNTING INTEGRATION TYPES
// ============================================================================

export interface AccountingExport {
  id: string;
  organization_id: string;
  provider: 'quickbooks' | 'xero' | 'sage';
  export_type: AccountingExportType;
  format: 'csv' | 'json' | 'api';
  date_range_start: string;
  date_range_end: string;
  projects: string[];
  data: AccountingExportData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url: string | null;
  error_message: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
}

export type AccountingExportType =
  | 'incentive_receivables'
  | 'project_costs'
  | 'application_fees'
  | 'tax_credit_transactions'
  | 'full_export';

export interface AccountingExportData {
  transactions: AccountingTransaction[];
  summary: {
    total_receivables: number;
    total_costs: number;
    total_credits: number;
    transaction_count: number;
  };
}

export interface AccountingTransaction {
  transaction_id: string;
  date: string;
  type: 'receivable' | 'expense' | 'credit' | 'adjustment';
  description: string;
  project_id: string;
  project_name: string;
  incentive_program_id: string | null;
  program_name: string | null;
  amount: number;
  account_code: string | null;
  tax_category: string | null;
  reference: string | null;
}

// ============================================================================
// CRM INTEGRATION TYPES
// ============================================================================

export interface CRMContact {
  id: string;
  external_id: string | null;
  provider: 'salesforce' | 'hubspot';
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  phone: string | null;
  type: 'lead' | 'contact' | 'partner';
  source: string | null;
  owner_id: string | null;
  custom_fields: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMDeal {
  id: string;
  external_id: string | null;
  provider: 'salesforce' | 'hubspot';
  name: string;
  project_id: string | null;
  incentive_program_id: string | null;
  stage: string;
  amount: number;
  probability: number | null;
  close_date: string | null;
  owner_id: string | null;
  contacts: string[];
  custom_fields: Record<string, unknown>;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CRMSyncConfig {
  sync_contacts: boolean;
  sync_deals: boolean;
  contact_mapping: Record<string, string>;
  deal_mapping: Record<string, string>;
  auto_create_deals: boolean;
  deal_pipeline: string | null;
  deal_stage_mapping: Record<string, string>;
}

// ============================================================================
// AUTOMATION PLATFORM TYPES (Zapier, Make)
// ============================================================================

export interface AutomationTrigger {
  id: string;
  organization_id: string;
  provider: 'zapier' | 'make';
  name: string;
  description: string | null;
  event_type: WebhookEventType;
  filters: WebhookFilters;
  is_active: boolean;
  external_zap_id: string | null;
  external_scenario_id: string | null;
  last_triggered_at: string | null;
  trigger_count: number;
  created_at: string;
  updated_at: string;
}

export interface AutomationAction {
  id: string;
  trigger_id: string;
  action_type: AutomationActionType;
  config: Record<string, unknown>;
  order: number;
}

export type AutomationActionType =
  | 'create_project'
  | 'update_project'
  | 'submit_application'
  | 'send_notification'
  | 'export_data'
  | 'create_document'
  | 'sync_crm'
  | 'sync_accounting'
  | 'custom_webhook';

export interface ZapierWebhook {
  subscribe_url: string;
  unsubscribe_url: string;
  perform_list_url: string;
  sample_data: Record<string, unknown>;
}

// ============================================================================
// SYNC LOG TYPES
// ============================================================================

export interface IntegrationSyncLog {
  id: string;
  connection_id: string;
  organization_id: string;
  sync_type: 'full' | 'incremental' | 'webhook' | 'manual';
  sync_direction: 'inbound' | 'outbound' | 'bidirectional';
  entity_type: string | null;
  entity_id: string | null;
  external_entity_id: string | null;
  status: SyncLogStatus;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export type SyncLogStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'skipped';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface WebhooksListResponse {
  data: WebhookWithStats[];
}

export interface WebhookCreateResponse {
  data: Webhook;
  message: string;
}

export interface ApiKeysListResponse {
  data: Omit<ApiKey, 'key_hash'>[];
  meta: {
    available_scopes: ApiKeyScope[];
  };
}

export interface ApiKeyCreateResponse {
  data: ApiKeyWithSecret;
  message: string;
}

export interface ConnectionsListResponse {
  data: {
    connections: Array<Omit<IntegrationConnection, 'access_token' | 'refresh_token'> & {
      has_access_token: boolean;
      provider_description?: string;
      provider_category?: IntegrationCategory;
    }>;
    available_providers: IntegrationProviderConfig[];
  };
}

export interface ConnectionInitiateResponse {
  data: {
    connection_id: string;
    provider: IntegrationProvider;
    provider_display_name: string;
    authorization_url: string;
    state: string;
    scopes: string[];
  };
  message: string;
}

export interface WebhookTestResponse {
  success: boolean;
  data: {
    event_id: string;
    webhook_id: string;
    webhook_name: string;
    url: string;
    response: {
      status_code: number | null;
      status_text: string | null;
      body: string | null;
      headers: Record<string, string> | null;
    };
    timing: {
      sent_at: string;
      received_at: string;
      duration_ms: number;
    };
    error: string | null;
  };
}
