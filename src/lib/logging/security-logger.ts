/**
 * Security Logger
 * Specialized logging for security events, authentication, and authorization
 */

import { logger } from './logger';
import { SecurityLogEvent, SecurityEventType, LogContext } from './types';

/**
 * Security Logger class
 */
export class SecurityLogger {
  /**
   * Log authentication event
   */
  static logAuthentication(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.AUTHENTICATION;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.AUTHENTICATION
    };

    const level = event.result === 'failure' ? 'warn' : 'info';

    logger[level]('Authentication Event', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'authentication']
    });
  }

  /**
   * Log authorization event
   */
  static logAuthorization(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.AUTHORIZATION;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.AUTHORIZATION
    };

    const level = event.result === 'failure' || event.result === 'blocked' ? 'warn' : 'info';

    logger[level]('Authorization Event', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'authorization']
    });
  }

  /**
   * Log data access event (especially for PII)
   */
  static logDataAccess(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.DATA_ACCESS;
      isPII?: boolean;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.DATA_ACCESS
    };

    const tags = ['security', 'data-access'];
    if (event.isPII) {
      tags.push('pii');
    }

    logger.info('Data Access Event', {
      ...securityEvent,
      category: 'security',
      tags
    });
  }

  /**
   * Log configuration change
   */
  static logConfigurationChange(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.CONFIGURATION_CHANGE;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.CONFIGURATION_CHANGE
    };

    logger.warn('Configuration Change', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'configuration']
    });
  }

  /**
   * Log security violation
   */
  static logSecurityViolation(
    event: Omit<SecurityLogEvent, 'eventType' | 'result'> & {
      eventType?: SecurityEventType.SECURITY_VIOLATION;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.SECURITY_VIOLATION,
      result: 'blocked'
    };

    logger.error('Security Violation', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'violation', event.severity || 'medium']
    });
  }

  /**
   * Log rate limit event
   */
  static logRateLimit(
    event: Omit<SecurityLogEvent, 'eventType' | 'result'> & {
      eventType?: SecurityEventType.RATE_LIMIT;
      limit?: number;
      current?: number;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.RATE_LIMIT,
      result: 'blocked'
    };

    logger.warn('Rate Limit Exceeded', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'rate-limit']
    });
  }

  /**
   * Log API key usage
   */
  static logApiKeyUsage(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.API_KEY_USAGE;
      apiKeyId?: string;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.API_KEY_USAGE
    };

    logger.info('API Key Usage', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'api-key']
    });
  }

  /**
   * Log password change
   */
  static logPasswordChange(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.PASSWORD_CHANGE;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.PASSWORD_CHANGE
    };

    logger.info('Password Change', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'password']
    });
  }

  /**
   * Log MFA event
   */
  static logMfaEvent(
    event: Omit<SecurityLogEvent, 'eventType'> & {
      eventType?: SecurityEventType.MFA_EVENT;
      mfaMethod?: string;
    }
  ): void {
    const securityEvent: SecurityLogEvent = {
      ...event,
      eventType: SecurityEventType.MFA_EVENT
    };

    const level = event.result === 'failure' ? 'warn' : 'info';

    logger[level]('MFA Event', {
      ...securityEvent,
      category: 'security',
      tags: ['security', 'mfa']
    });
  }

  /**
   * Log failed login attempt
   */
  static logFailedLogin(
    userId: string | undefined,
    ipAddress: string | undefined,
    reason: string,
    metadata?: Record<string, any>
  ): void {
    SecurityLogger.logAuthentication({
      userId,
      ipAddress,
      action: 'login',
      result: 'failure',
      reason,
      metadata
    });
  }

  /**
   * Log successful login
   */
  static logSuccessfulLogin(
    userId: string,
    ipAddress: string | undefined,
    metadata?: Record<string, any>
  ): void {
    SecurityLogger.logAuthentication({
      userId,
      ipAddress,
      action: 'login',
      result: 'success',
      metadata
    });
  }

  /**
   * Log permission denied
   */
  static logPermissionDenied(
    userId: string | undefined,
    resource: string,
    action: string,
    reason?: string,
    metadata?: Record<string, any>
  ): void {
    SecurityLogger.logAuthorization({
      userId,
      resource,
      action,
      result: 'blocked',
      reason,
      metadata
    });
  }

  /**
   * Log suspicious activity
   */
  static logSuspiciousActivity(
    description: string,
    userId: string | undefined,
    ipAddress: string | undefined,
    metadata?: Record<string, any>
  ): void {
    SecurityLogger.logSecurityViolation({
      userId,
      ipAddress,
      action: description,
      reason: 'Suspicious activity detected',
      severity: 'high',
      metadata
    });
  }
}

export default SecurityLogger;
