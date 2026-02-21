/**
 * Core Logger Implementation
 * Production-grade structured logging with Winston
 */

import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { LogLevel, LogContext, LoggerConfig } from './types';

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  format: (process.env.LOG_FORMAT as 'json' | 'pretty') ||
          (process.env.NODE_ENV === 'production' ? 'json' : 'pretty'),
  console: true,
  file: {
    enabled: process.env.LOG_FILE_ENABLED === 'true',
    directory: process.env.LOG_FILE_DIRECTORY || './logs',
    filename: process.env.LOG_FILE_NAME || 'incentedge-%DATE%.log',
    maxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_FILE_MAX_FILES || '14d',
    compression: process.env.LOG_FILE_COMPRESSION === 'true'
  },
  cloudwatch: {
    enabled: process.env.CLOUDWATCH_ENABLED === 'true',
    logGroup: process.env.CLOUDWATCH_LOG_GROUP || '/incentedge/production',
    logStream: process.env.CLOUDWATCH_LOG_STREAM,
    region: process.env.CLOUDWATCH_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  security: {
    enabled: process.env.SECURITY_LOGGING_ENABLED === 'true',
    logAllAccess: process.env.SECURITY_LOG_ALL_ACCESS === 'true',
    logFailuresOnly: process.env.SECURITY_LOG_FAILURES_ONLY === 'true'
  },
  audit: {
    enabled: process.env.AUDIT_LOGGING_ENABLED === 'true',
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555', 10), // 7 years default
    immutable: process.env.AUDIT_IMMUTABLE === 'true'
  }
};

/**
 * Create Winston format for production (JSON)
 */
const createProductionFormat = () => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'ISO' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );
};

/**
 * Create Winston format for development (Pretty)
 */
const createDevelopmentFormat = () => {
  return winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info as any;
      let metaString = '';
      if (Object.keys(meta).length > 0) {
        metaString = '\n' + JSON.stringify(meta, null, 2);
      }
      return `${timestamp} [${level}]: ${message}${metaString}`;
    })
  );
};

/**
 * Create Winston transports
 */
const createTransports = (config: LoggerConfig): winston.transport[] => {
  const transports: winston.transport[] = [];

  // Console transport
  if (config.console) {
    transports.push(
      new winston.transports.Console({
        format: config.format === 'json'
          ? createProductionFormat()
          : createDevelopmentFormat()
      })
    );
  }

  // File transport with rotation
  if (config.file.enabled) {
    // @ts-ignore - DailyRotateFile has complex type that may not resolve correctly
    transports.push(
      new DailyRotateFile({
        dirname: config.file.directory,
        filename: config.file.filename,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: config.file.compression ?? true,
        maxSize: config.file.maxSize,
        maxFiles: config.file.maxFiles,
        format: createProductionFormat()
      })
    );
  }

  return transports;
};

/**
 * Create Winston logger instance
 */
const createWinstonLogger = (config: LoggerConfig = DEFAULT_CONFIG): winston.Logger => {
  return winston.createLogger({
    level: config.level,
    format: config.format === 'json'
      ? createProductionFormat()
      : createDevelopmentFormat(),
    transports: createTransports(config),
    exitOnError: false,
    defaultMeta: {
      service: 'incentedge',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || '1.0.0'
    }
  });
};

// Global logger instance
let globalLogger: winston.Logger;

/**
 * Get or create global logger instance
 */
export const getLogger = (config?: LoggerConfig): winston.Logger => {
  if (!globalLogger) {
    globalLogger = createWinstonLogger(config || DEFAULT_CONFIG);
  }
  return globalLogger;
};

/**
 * Create logger with context
 */
export const createLogger = (context?: LogContext): winston.Logger => {
  const logger = getLogger();
  if (context) {
    return logger.child(context);
  }
  return logger;
};

/**
 * Structured logger class
 */
export class Logger {
  private logger: winston.Logger;
  private context: LogContext;

  constructor(context?: LogContext, config?: LoggerConfig) {
    this.context = context || {};
    this.logger = getLogger(config);
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger({ ...this.context, ...context });
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log trace message
   */
  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const mergedContext = { ...this.context, ...context };

    // Add timestamp if not present
    if (!mergedContext.timestamp) {
      mergedContext.timestamp = new Date().toISOString();
    }

    this.logger.log(level, message, mergedContext);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Export convenience methods
 */
export const error = (message: string, context?: LogContext) => logger.error(message, context);
export const warn = (message: string, context?: LogContext) => logger.warn(message, context);
export const info = (message: string, context?: LogContext) => logger.info(message, context);
export const debug = (message: string, context?: LogContext) => logger.debug(message, context);
export const trace = (message: string, context?: LogContext) => logger.trace(message, context);

/**
 * Performance tracking helper
 */
export const trackPerformance = async <T>(
  operation: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> => {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logger.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      status: 'success'
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(`Performance: ${operation} failed`, {
      ...context,
      operation,
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    });

    throw error;
  }
};

/**
 * Sync performance tracking helper
 */
export const trackPerformanceSync = <T>(
  operation: string,
  fn: () => T,
  context?: LogContext
): T => {
  const startTime = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - startTime;

    logger.info(`Performance: ${operation}`, {
      ...context,
      operation,
      duration,
      status: 'success'
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(`Performance: ${operation} failed`, {
      ...context,
      operation,
      duration,
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    });

    throw error;
  }
};

export default logger;
