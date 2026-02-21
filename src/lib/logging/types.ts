/**
 * Logging Types
 * TypeScript types and interfaces for structured logging
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

export interface LogContext {
  /** Unique request/correlation ID */
  requestId?: string;

  /** User context */
  userId?: string;
  organizationId?: string;

  /** Request metadata */
  method?: string;
  path?: string;
  statusCode?: number;

  /** Performance metrics */
  duration?: number;
  timestamp?: string;

  /** Environment */
  environment?: string;
  version?: string;

  /** Additional context */
  [key: string]: any;
}

export interface LogMetadata {
  /** Log level */
  level: LogLevel;

  /** Log message */
  message: string;

  /** Context data */
  context?: LogContext;

  /** Error object (if applicable) */
  error?: Error | unknown;

  /** Stack trace */
  stack?: string;

  /** Source location */
  source?: {
    file?: string;
    function?: string;
    line?: number;
  };

  /** Tags for categorization */
  tags?: string[];

  /** Additional metadata */
  [key: string]: any;
}

export interface SecurityLogEvent {
  eventType: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result: 'success' | 'failure' | 'blocked';
  reason?: string;
  metadata?: Record<string, any>;
}

export enum SecurityEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  CONFIGURATION_CHANGE = 'configuration_change',
  SECURITY_VIOLATION = 'security_violation',
  RATE_LIMIT = 'rate_limit',
  API_KEY_USAGE = 'api_key_usage',
  PASSWORD_CHANGE = 'password_change',
  MFA_EVENT = 'mfa_event'
}

export interface AuditLogEvent {
  eventType: AuditEventType;
  userId: string;
  organizationId?: string;
  resource: string;
  resourceId?: string;
  action: AuditAction;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export enum AuditEventType {
  PROJECT = 'project',
  APPLICATION = 'application',
  DOCUMENT = 'document',
  USER = 'user',
  ORGANIZATION = 'organization',
  SETTINGS = 'settings',
  INTEGRATION = 'integration',
  API_KEY = 'api_key',
  PERMISSION = 'permission'
}

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  SUBMIT = 'submit',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import'
}

export interface PerformanceLogEntry {
  operation: string;
  duration: number;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface LoggerConfig {
  /** Minimum log level */
  level: LogLevel;

  /** Log format (json or pretty) */
  format: 'json' | 'pretty';

  /** Enable console logging */
  console: boolean;

  /** Enable file logging */
  file: {
    enabled: boolean;
    directory?: string;
    filename?: string;
    maxSize?: string;
    maxFiles?: number | string;
    compression?: boolean;
  };

  /** CloudWatch configuration */
  cloudwatch?: {
    enabled: boolean;
    logGroup: string;
    logStream?: string;
    region: string;
    awsAccessKeyId?: string;
    awsSecretKey?: string;
  };

  /** Security logging */
  security?: {
    enabled: boolean;
    logAllAccess?: boolean;
    logFailuresOnly?: boolean;
  };

  /** Audit logging */
  audit?: {
    enabled: boolean;
    retentionDays?: number;
    immutable?: boolean;
  };
}

export interface Logger {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  trace(message: string, context?: LogContext): void;

  child(context: LogContext): Logger;
}
