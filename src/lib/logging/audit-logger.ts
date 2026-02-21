/**
 * Audit Logger
 * Immutable audit trail for all API actions and data modifications
 */

import { logger } from './logger';
import { AuditLogEvent, AuditEventType, AuditAction } from './types';

/**
 * Audit Logger class
 */
export class AuditLogger {
  /**
   * Log audit event
   */
  static logEvent(event: AuditLogEvent): void {
    logger.info('Audit Event', {
      ...event,
      category: 'audit',
      tags: ['audit', event.eventType, event.action],
      immutable: true,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log project creation
   */
  static logProjectCreate(
    userId: string,
    organizationId: string | undefined,
    projectId: string,
    projectData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PROJECT,
      userId,
      organizationId,
      resource: 'project',
      resourceId: projectId,
      action: AuditAction.CREATE,
      changes: {
        after: projectData
      },
      metadata
    });
  }

  /**
   * Log project update
   */
  static logProjectUpdate(
    userId: string,
    organizationId: string | undefined,
    projectId: string,
    beforeData: any,
    afterData: any,
    changedFields: string[],
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PROJECT,
      userId,
      organizationId,
      resource: 'project',
      resourceId: projectId,
      action: AuditAction.UPDATE,
      changes: {
        before: beforeData,
        after: afterData,
        fields: changedFields
      },
      metadata
    });
  }

  /**
   * Log project deletion
   */
  static logProjectDelete(
    userId: string,
    organizationId: string | undefined,
    projectId: string,
    projectData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PROJECT,
      userId,
      organizationId,
      resource: 'project',
      resourceId: projectId,
      action: AuditAction.DELETE,
      changes: {
        before: projectData
      },
      metadata
    });
  }

  /**
   * Log application submission
   */
  static logApplicationSubmit(
    userId: string,
    organizationId: string | undefined,
    applicationId: string,
    applicationData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.APPLICATION,
      userId,
      organizationId,
      resource: 'application',
      resourceId: applicationId,
      action: AuditAction.SUBMIT,
      changes: {
        after: applicationData
      },
      metadata
    });
  }

  /**
   * Log application approval
   */
  static logApplicationApprove(
    userId: string,
    organizationId: string | undefined,
    applicationId: string,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.APPLICATION,
      userId,
      organizationId,
      resource: 'application',
      resourceId: applicationId,
      action: AuditAction.APPROVE,
      metadata
    });
  }

  /**
   * Log document upload
   */
  static logDocumentUpload(
    userId: string,
    organizationId: string | undefined,
    documentId: string,
    documentData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.DOCUMENT,
      userId,
      organizationId,
      resource: 'document',
      resourceId: documentId,
      action: AuditAction.CREATE,
      changes: {
        after: {
          filename: documentData.filename,
          size: documentData.size,
          type: documentData.type
        }
      },
      metadata
    });
  }

  /**
   * Log document deletion
   */
  static logDocumentDelete(
    userId: string,
    organizationId: string | undefined,
    documentId: string,
    documentData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.DOCUMENT,
      userId,
      organizationId,
      resource: 'document',
      resourceId: documentId,
      action: AuditAction.DELETE,
      changes: {
        before: {
          filename: documentData.filename,
          size: documentData.size,
          type: documentData.type
        }
      },
      metadata
    });
  }

  /**
   * Log user creation
   */
  static logUserCreate(
    adminUserId: string,
    newUserId: string,
    userData: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.USER,
      userId: adminUserId,
      resource: 'user',
      resourceId: newUserId,
      action: AuditAction.CREATE,
      changes: {
        after: {
          email: userData.email,
          role: userData.role
        }
      },
      metadata
    });
  }

  /**
   * Log permission change
   */
  static logPermissionChange(
    userId: string,
    targetUserId: string,
    beforePermissions: any,
    afterPermissions: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PERMISSION,
      userId,
      resource: 'permission',
      resourceId: targetUserId,
      action: AuditAction.UPDATE,
      changes: {
        before: beforePermissions,
        after: afterPermissions
      },
      metadata
    });
  }

  /**
   * Log settings change
   */
  static logSettingsChange(
    userId: string,
    organizationId: string | undefined,
    settingKey: string,
    beforeValue: any,
    afterValue: any,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.SETTINGS,
      userId,
      organizationId,
      resource: 'settings',
      resourceId: settingKey,
      action: AuditAction.UPDATE,
      changes: {
        before: beforeValue,
        after: afterValue
      },
      metadata
    });
  }

  /**
   * Log API key creation
   */
  static logApiKeyCreate(
    userId: string,
    organizationId: string | undefined,
    apiKeyId: string,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.API_KEY,
      userId,
      organizationId,
      resource: 'api_key',
      resourceId: apiKeyId,
      action: AuditAction.CREATE,
      metadata
    });
  }

  /**
   * Log API key deletion
   */
  static logApiKeyDelete(
    userId: string,
    organizationId: string | undefined,
    apiKeyId: string,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.API_KEY,
      userId,
      organizationId,
      resource: 'api_key',
      resourceId: apiKeyId,
      action: AuditAction.DELETE,
      metadata
    });
  }

  /**
   * Log data export
   */
  static logDataExport(
    userId: string,
    organizationId: string | undefined,
    resourceType: string,
    resourceIds: string[],
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PROJECT,
      userId,
      organizationId,
      resource: resourceType,
      action: AuditAction.EXPORT,
      metadata: {
        ...metadata,
        resourceCount: resourceIds.length,
        resourceIds
      }
    });
  }

  /**
   * Log data import
   */
  static logDataImport(
    userId: string,
    organizationId: string | undefined,
    resourceType: string,
    recordCount: number,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.PROJECT,
      userId,
      organizationId,
      resource: resourceType,
      action: AuditAction.IMPORT,
      metadata: {
        ...metadata,
        recordCount
      }
    });
  }

  /**
   * Log integration connection
   */
  static logIntegrationConnect(
    userId: string,
    organizationId: string | undefined,
    integrationId: string,
    integrationType: string,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.INTEGRATION,
      userId,
      organizationId,
      resource: 'integration',
      resourceId: integrationId,
      action: AuditAction.CREATE,
      metadata: {
        ...metadata,
        integrationType
      }
    });
  }

  /**
   * Log integration disconnection
   */
  static logIntegrationDisconnect(
    userId: string,
    organizationId: string | undefined,
    integrationId: string,
    integrationType: string,
    metadata?: Record<string, any>
  ): void {
    AuditLogger.logEvent({
      eventType: AuditEventType.INTEGRATION,
      userId,
      organizationId,
      resource: 'integration',
      resourceId: integrationId,
      action: AuditAction.DELETE,
      metadata: {
        ...metadata,
        integrationType
      }
    });
  }
}

export default AuditLogger;
