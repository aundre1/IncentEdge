/**
 * Logging System
 * Centralized exports for structured logging
 */

// Core logger
export {
  logger,
  Logger,
  getLogger,
  createLogger,
  error,
  warn,
  info,
  debug,
  trace,
  trackPerformance,
  trackPerformanceSync
} from './logger';

// Types - enums (runtime values)
export {
  LogLevel,
  SecurityEventType,
  AuditEventType,
  AuditAction,
} from './types';

// Types - interfaces (type-only)
export type {
  LogContext,
  LogMetadata,
  LoggerConfig,
  SecurityLogEvent,
  AuditLogEvent,
  PerformanceLogEntry,
} from './types';

// Middleware
export {
  generateRequestId,
  getClientIp,
  getUserAgent,
  createRequestContext,
  withLogging,
  loggingMiddleware,
  performanceMiddleware,
  logApiError,
  logApiSuccess,
  createApiLogger
} from './middleware';

// Security Logger
export { SecurityLogger } from './security-logger';
export { default as securityLogger } from './security-logger';

// Audit Logger
export { AuditLogger } from './audit-logger';
export { default as auditLogger } from './audit-logger';

// Log Analyzer
export {
  searchLogs,
  aggregateLogs,
  detectAnomalies,
  correlateSecurityEvents,
  exportToCSV,
  generateReport
} from './log-analyzer';

// CloudWatch
export {
  createCloudWatchTransport,
  getCloudWatchLogGroup,
  extractMetrics,
  CLOUDWATCH_LOG_GROUPS,
  RECOMMENDED_ALARMS
} from './cloudwatch-transport';
