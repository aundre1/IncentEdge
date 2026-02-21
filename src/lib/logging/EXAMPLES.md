# Logging Examples

Comprehensive examples for using the IncentEdge logging system.

## Table of Contents

1. [Basic Logging](#basic-logging)
2. [API Route Logging](#api-route-logging)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Access Logging](#data-access-logging)
5. [Audit Logging](#audit-logging)
6. [Performance Tracking](#performance-tracking)
7. [Error Handling](#error-handling)
8. [Webhook Logging](#webhook-logging)
9. [Job Processing](#job-processing)
10. [Database Operations](#database-operations)

---

## Basic Logging

### Simple Messages

```typescript
import { logger } from '@/lib/logging/logger';

// Info level (default for general events)
logger.info('Application started');
logger.info('User session initialized');

// Warning level (recoverable issues)
logger.warn('API rate limit approaching');
logger.warn('Cache miss - fetching from database');

// Error level (failures requiring attention)
logger.error('Failed to send email');
logger.error('Database connection timeout');

// Debug level (development only)
logger.debug('Cache key generated');
logger.debug('Request payload validated');
```

### Logging with Context

```typescript
import { logger } from '@/lib/logging/logger';

logger.info('User logged in', {
  userId: 'user-123',
  email: 'user@example.com',
  loginMethod: 'password',
  ipAddress: '192.168.1.1'
});

logger.error('Payment processing failed', {
  userId: 'user-123',
  amount: 5000,
  currency: 'USD',
  errorCode: 'INSUFFICIENT_FUNDS'
});
```

### Creating Child Loggers

```typescript
import { Logger } from '@/lib/logging/logger';

// Create logger with base context
const baseLogger = new Logger({
  service: 'payment-processor',
  environment: 'production'
});

// Create child logger with additional context
const requestLogger = baseLogger.child({
  requestId: 'req-abc-123',
  userId: 'user-456'
});

// All logs will include both base and child context
requestLogger.info('Processing payment');
// Logs: { service: 'payment-processor', environment: 'production', requestId: 'req-abc-123', userId: 'user-456', message: 'Processing payment' }
```

---

## API Route Logging

### Next.js API Route with Auto-Logging

```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/logging/middleware';
import { logger } from '@/lib/logging/logger';

export const GET = withLogging(async (req: NextRequest, context) => {
  // context automatically includes: requestId, method, path, ipAddress, userAgent

  logger.info('Fetching projects', context);

  try {
    const projects = await fetchProjects();

    logger.info('Projects fetched successfully', {
      ...context,
      count: projects.length
    });

    return NextResponse.json({ projects });
  } catch (error) {
    logger.error('Failed to fetch projects', {
      ...context,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
});
```

### POST Request with Validation

```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/logging/middleware';
import { logger } from '@/lib/logging/logger';
import AuditLogger from '@/lib/logging/audit-logger';

export const POST = withLogging(async (req: NextRequest, context) => {
  const userId = 'user-123'; // Extract from auth

  logger.info('Creating project', { ...context, userId });

  try {
    const body = await req.json();

    // Validate input
    if (!body.name || !body.location) {
      logger.warn('Invalid project data', {
        ...context,
        userId,
        errors: ['Missing required fields']
      });

      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create project
    const project = await createProject(userId, body);

    // Audit log
    AuditLogger.logProjectCreate(
      userId,
      body.organizationId,
      project.id,
      project
    );

    logger.info('Project created successfully', {
      ...context,
      userId,
      projectId: project.id,
      projectName: project.name
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    logger.error('Failed to create project', {
      ...context,
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
});
```

### Custom API Logger

```typescript
import { createApiLogger } from '@/lib/logging/middleware';

const apiLogger = createApiLogger('/api/stripe/webhook');

apiLogger.info('Webhook received', {
  type: event.type,
  eventId: event.id
});

apiLogger.error('Webhook processing failed', {
  error: error.message
});
```

---

## Authentication & Authorization

### Successful Login

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// After successful authentication
SecurityLogger.logSuccessfulLogin(
  userId,
  req.headers.get('x-forwarded-for') || 'unknown',
  {
    userAgent: req.headers.get('user-agent'),
    loginMethod: 'password',
    mfaEnabled: user.mfaEnabled
  }
);
```

### Failed Login Attempt

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

SecurityLogger.logFailedLogin(
  undefined, // userId unknown on failure
  req.headers.get('x-forwarded-for') || 'unknown',
  'Invalid password',
  {
    attemptedEmail: email,
    userAgent: req.headers.get('user-agent'),
    failureCount: 3 // Track consecutive failures
  }
);
```

### Permission Denied

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// When user tries to access unauthorized resource
SecurityLogger.logPermissionDenied(
  userId,
  '/api/admin/users',
  'DELETE',
  'User does not have admin role',
  {
    userRole: user.role,
    requiredRole: 'admin'
  }
);
```

### MFA Event

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// MFA verification attempt
SecurityLogger.logMfaEvent({
  userId,
  ipAddress,
  action: 'verify',
  result: 'success',
  mfaMethod: 'totp',
  metadata: {
    deviceName: 'iPhone 12'
  }
});
```

### Rate Limiting

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

SecurityLogger.logRateLimit({
  userId,
  ipAddress,
  resource: '/api/projects',
  action: 'GET',
  limit: 100,
  current: 105,
  metadata: {
    window: '1 hour',
    resetAt: new Date(Date.now() + 3600000).toISOString()
  }
});
```

---

## Data Access Logging

### PII Access

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// When accessing user's personal information
SecurityLogger.logDataAccess({
  userId: currentUserId,
  resource: 'user_profile',
  resourceId: targetUserId,
  action: 'read',
  result: 'success',
  isPII: true,
  metadata: {
    fields: ['email', 'phone', 'ssn'],
    reason: 'Profile view'
  }
});
```

### Document Download

```typescript
import SecurityLogger from '@/lib/logging/security-logger';
import { logger } from '@/lib/logging/logger';

// Log document access
SecurityLogger.logDataAccess({
  userId,
  resource: 'document',
  resourceId: documentId,
  action: 'download',
  result: 'success',
  isPII: document.containsPII,
  metadata: {
    filename: document.filename,
    size: document.size,
    type: document.type
  }
});

logger.info('Document downloaded', {
  userId,
  documentId,
  filename: document.filename
});
```

### Bulk Export

```typescript
import AuditLogger from '@/lib/logging/audit-logger';
import { logger } from '@/lib/logging/logger';

const projectIds = ['proj-1', 'proj-2', 'proj-3'];

// Log bulk export for audit
AuditLogger.logDataExport(
  userId,
  organizationId,
  'project',
  projectIds,
  {
    format: 'csv',
    requestedBy: userId,
    exportReason: 'Monthly report'
  }
);

logger.info('Data exported', {
  userId,
  organizationId,
  resourceType: 'project',
  count: projectIds.length,
  format: 'csv'
});
```

---

## Audit Logging

### Project Lifecycle

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// Create
AuditLogger.logProjectCreate(
  userId,
  organizationId,
  projectId,
  {
    name: 'New Development',
    location: 'New York, NY',
    budget: 1000000
  }
);

// Update
const before = { budget: 1000000, status: 'draft' };
const after = { budget: 1500000, status: 'active' };

AuditLogger.logProjectUpdate(
  userId,
  organizationId,
  projectId,
  before,
  after,
  ['budget', 'status'],
  { reason: 'Budget increase approved by CFO' }
);

// Delete
AuditLogger.logProjectDelete(
  userId,
  organizationId,
  projectId,
  projectData,
  { reason: 'Project cancelled' }
);
```

### Application Workflow

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// Submit application
AuditLogger.logApplicationSubmit(
  userId,
  organizationId,
  applicationId,
  {
    programId: 'prog-123',
    amount: 50000,
    submittedDocuments: ['tax-cert', 'proof-ownership']
  }
);

// Approve application
AuditLogger.logApplicationApprove(
  reviewerId,
  organizationId,
  applicationId,
  {
    approvedAmount: 50000,
    approvalDate: new Date().toISOString(),
    notes: 'All requirements met'
  }
);
```

### Settings Changes

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// Track critical settings changes
AuditLogger.logSettingsChange(
  userId,
  organizationId,
  'notification_preferences',
  { emailEnabled: true, frequency: 'daily' },
  { emailEnabled: false, frequency: 'weekly' },
  {
    changedBy: userId,
    reason: 'User preference update'
  }
);
```

### API Key Management

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// API key creation
AuditLogger.logApiKeyCreate(
  userId,
  organizationId,
  apiKeyId,
  {
    name: 'Production API Key',
    permissions: ['read', 'write'],
    expiresAt: new Date('2027-02-17').toISOString()
  }
);

// API key deletion
AuditLogger.logApiKeyDelete(
  userId,
  organizationId,
  apiKeyId,
  {
    name: 'Production API Key',
    deletedReason: 'Key compromised'
  }
);
```

---

## Performance Tracking

### Async Operation Tracking

```typescript
import { trackPerformance } from '@/lib/logging/logger';

const incentives = await trackPerformance(
  'fetch-eligible-incentives',
  async () => {
    return await eligibilityEngine.findEligible(projectId);
  },
  {
    projectId,
    userId,
    jurisdiction: 'NY'
  }
);

// Automatically logs:
// {
//   message: "Performance: fetch-eligible-incentives",
//   operation: "fetch-eligible-incentives",
//   duration: 245,
//   status: "success",
//   projectId: "...",
//   userId: "...",
//   jurisdiction: "NY"
// }
```

### Database Query Tracking

```typescript
import { logger } from '@/lib/logging/logger';

const startTime = Date.now();

try {
  const result = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId);

  const duration = Date.now() - startTime;

  logger.info('Database query completed', {
    query: 'select_projects',
    duration,
    rowCount: result.data?.length || 0,
    userId
  });

  return result;
} catch (error) {
  const duration = Date.now() - startTime;

  logger.error('Database query failed', {
    query: 'select_projects',
    duration,
    error: error instanceof Error ? error.message : String(error),
    userId
  });

  throw error;
}
```

### API Call Tracking

```typescript
import { trackPerformance } from '@/lib/logging/logger';
import { logger } from '@/lib/logging/logger';

const externalData = await trackPerformance(
  'external-api-call',
  async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  },
  {
    endpoint: 'https://api.example.com/data',
    userId,
    requestId
  }
);
```

---

## Error Handling

### Structured Error Logging

```typescript
import { logger } from '@/lib/logging/logger';

try {
  await processPayment(userId, amount);
} catch (error) {
  logger.error('Payment processing failed', {
    userId,
    amount,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
    timestamp: new Date().toISOString()
  });

  throw error; // Re-throw after logging
}
```

### Custom Error Classes

```typescript
import { logger } from '@/lib/logging/logger';

class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public userId: string,
    public amount: number
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

try {
  throw new PaymentError(
    'Insufficient funds',
    'INSUFFICIENT_FUNDS',
    'user-123',
    5000
  );
} catch (error) {
  if (error instanceof PaymentError) {
    logger.error('Payment error', {
      errorType: error.name,
      errorCode: error.code,
      userId: error.userId,
      amount: error.amount,
      message: error.message,
      stack: error.stack
    });
  }
}
```

### Global Error Handler

```typescript
// src/lib/error-handler.ts
import { logger } from '@/lib/logging/logger';

export function handleError(error: unknown, context?: Record<string, any>) {
  if (error instanceof Error) {
    logger.error(error.message, {
      ...context,
      error: error.message,
      stack: error.stack,
      errorType: error.constructor.name
    });
  } else {
    logger.error('Unknown error', {
      ...context,
      error: String(error)
    });
  }
}

// Usage
try {
  await someOperation();
} catch (error) {
  handleError(error, { userId, operation: 'someOperation' });
}
```

---

## Webhook Logging

### Stripe Webhook Example

```typescript
// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import SecurityLogger from '@/lib/logging/security-logger';

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  logger.info('Stripe webhook received', {
    requestId,
    ipAddress: req.headers.get('x-forwarded-for')
  });

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    logger.info('Webhook verified', {
      requestId,
      eventType: event.type,
      eventId: event.id
    });

    // Process event
    await processStripeEvent(event);

    logger.info('Webhook processed successfully', {
      requestId,
      eventType: event.type,
      eventId: event.id
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Log security event for webhook failures
    SecurityLogger.logSecurityViolation({
      action: 'webhook_verification',
      result: 'blocked',
      severity: 'high',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      metadata: {
        error: error instanceof Error ? error.message : String(error)
      }
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
```

---

## Job Processing

### Background Job Logging

```typescript
import { logger } from '@/lib/logging/logger';
import { trackPerformance } from '@/lib/logging/logger';

async function processIncentiveSync() {
  const jobId = crypto.randomUUID();

  logger.info('Starting incentive sync job', { jobId });

  try {
    const result = await trackPerformance(
      'incentive-sync',
      async () => {
        const programs = await fetchLatestPrograms();
        const updated = await updateDatabase(programs);
        return { programCount: programs.length, updatedCount: updated };
      },
      { jobId }
    );

    logger.info('Incentive sync completed', {
      jobId,
      ...result
    });

    return result;
  } catch (error) {
    logger.error('Incentive sync failed', {
      jobId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw error;
  }
}
```

### Scheduled Task Logging

```typescript
import { logger } from '@/lib/logging/logger';

export async function runDailyCleanup() {
  const taskId = `cleanup-${Date.now()}`;

  logger.info('Starting daily cleanup', {
    taskId,
    scheduledTime: new Date().toISOString()
  });

  const startTime = Date.now();
  let deletedCount = 0;

  try {
    // Delete expired sessions
    const sessions = await deleteExpiredSessions();
    deletedCount += sessions.count;

    // Delete old logs
    const logs = await deleteOldLogs();
    deletedCount += logs.count;

    const duration = Date.now() - startTime;

    logger.info('Daily cleanup completed', {
      taskId,
      duration,
      deletedCount,
      details: {
        sessions: sessions.count,
        logs: logs.count
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Daily cleanup failed', {
      taskId,
      duration,
      deletedCount,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
```

---

## Database Operations

### Migration Logging

```typescript
import { logger } from '@/lib/logging/logger';

async function runMigration(migrationName: string) {
  logger.info('Starting database migration', {
    migration: migrationName
  });

  const startTime = Date.now();

  try {
    await executeMigration(migrationName);

    const duration = Date.now() - startTime;

    logger.info('Migration completed successfully', {
      migration: migrationName,
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('Migration failed', {
      migration: migrationName,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    throw error;
  }
}
```

### Bulk Operations

```typescript
import { logger } from '@/lib/logging/logger';

async function bulkImportProjects(projects: Project[]) {
  logger.info('Starting bulk project import', {
    count: projects.length
  });

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  for (const project of projects) {
    try {
      await createProject(project);
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push({
        projectId: project.id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const duration = Date.now() - startTime;

  logger.info('Bulk import completed', {
    total: projects.length,
    successCount,
    errorCount,
    duration,
    errors: errors.slice(0, 10) // Log first 10 errors
  });

  return { successCount, errorCount, errors };
}
```

---

This document provides comprehensive examples for most common logging scenarios in the IncentEdge application. For more information, see [README.md](./README.md).
