# Structured Logging System

Production-grade structured logging system for IncentEdge using Winston.

## Overview

This logging system provides:

- **Structured JSON logging** for production
- **Pretty console logging** for development
- **Multiple log levels** (error, warn, info, debug, trace)
- **Request/response tracking** with unique request IDs
- **Security event logging** for authentication, authorization, and data access
- **Audit logging** for immutable compliance trails
- **Performance tracking** for monitoring application health
- **Log rotation** with daily rotation and compression
- **CloudWatch integration** (optional) for centralized logging
- **Log analysis tools** for searching and aggregating logs

## Quick Start

### Basic Usage

```typescript
import { logger } from '@/lib/logging/logger';

// Simple logging
logger.info('User logged in');
logger.error('Failed to process payment');
logger.warn('Rate limit approaching');
logger.debug('Cache hit');

// Logging with context
logger.info('User created project', {
  userId: 'user-123',
  projectId: 'proj-456',
  projectName: 'New Development'
});

// Error logging with stack trace
try {
  // ... some operation
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId: 'user-123'
  });
}
```

### API Route Logging

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withLogging, createRequestContext } from '@/lib/logging/middleware';
import { logger } from '@/lib/logging/logger';

export const POST = withLogging(async (req: NextRequest, context) => {
  // context includes requestId, method, path, etc.
  logger.info('Processing request', context);

  try {
    // Your logic here
    const result = await processData();

    logger.info('Request successful', { ...context, result });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Request failed', {
      ...context,
      error: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
```

### Security Logging

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// Log successful login
SecurityLogger.logSuccessfulLogin('user-123', '192.168.1.1', {
  userAgent: 'Mozilla/5.0...'
});

// Log failed login
SecurityLogger.logFailedLogin(undefined, '192.168.1.1', 'Invalid password', {
  attemptedEmail: 'user@example.com'
});

// Log permission denied
SecurityLogger.logPermissionDenied(
  'user-123',
  '/api/admin/users',
  'DELETE',
  'User is not admin'
);

// Log data access (especially PII)
SecurityLogger.logDataAccess({
  userId: 'user-123',
  resource: 'user_profile',
  action: 'read',
  result: 'success',
  isPII: true,
  metadata: { fields: ['email', 'phone'] }
});
```

### Audit Logging

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// Log project creation
AuditLogger.logProjectCreate(
  'user-123',
  'org-456',
  'proj-789',
  { name: 'New Project', location: 'New York' }
);

// Log project update
AuditLogger.logProjectUpdate(
  'user-123',
  'org-456',
  'proj-789',
  { budget: 1000000 }, // before
  { budget: 1500000 }, // after
  ['budget'], // changed fields
  { reason: 'Budget increase approved' }
);

// Log application submission
AuditLogger.logApplicationSubmit(
  'user-123',
  'org-456',
  'app-999',
  { programId: 'prog-111', amount: 50000 }
);
```

### Performance Tracking

```typescript
import { trackPerformance } from '@/lib/logging/logger';

// Track async operations
const result = await trackPerformance(
  'fetch-incentives',
  async () => {
    return await fetchIncentives(projectId);
  },
  { projectId, userId }
);

// Logs:
// {
//   message: "Performance: fetch-incentives",
//   operation: "fetch-incentives",
//   duration: 245,
//   status: "success",
//   projectId: "...",
//   userId: "..."
// }
```

## Log Levels

### When to Use Each Level

- **error**: System errors, failed operations, exceptions
- **warn**: Warnings, degraded performance, recoverable errors
- **info**: Important business events, API requests, user actions
- **debug**: Detailed debugging information (disabled in production)
- **trace**: Very detailed trace information (disabled in production)

### Setting Log Level

Via environment variable:

```bash
LOG_LEVEL=info  # Default for production
LOG_LEVEL=debug # For development
```

Via code:

```typescript
import { Logger } from '@/lib/logging/logger';

const logger = new Logger(undefined, {
  level: LogLevel.DEBUG
});
```

## Environment Configuration

Create a `.env.local` file with logging configuration:

```bash
# Log Level
LOG_LEVEL=info

# Log Format (json or pretty)
LOG_FORMAT=json

# File Logging
LOG_FILE_ENABLED=true
LOG_FILE_DIRECTORY=./logs
LOG_FILE_NAME=incentedge-%DATE%.log
LOG_FILE_MAX_SIZE=20m
LOG_FILE_MAX_FILES=14d
LOG_FILE_COMPRESSION=true

# CloudWatch (optional)
CLOUDWATCH_ENABLED=false
CLOUDWATCH_LOG_GROUP=/incentedge/production
CLOUDWATCH_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key

# Security Logging
SECURITY_LOGGING_ENABLED=true
SECURITY_LOG_ALL_ACCESS=false
SECURITY_LOG_FAILURES_ONLY=true

# Audit Logging
AUDIT_LOGGING_ENABLED=true
AUDIT_RETENTION_DAYS=2555  # 7 years for SOC 2 compliance
AUDIT_IMMUTABLE=true
```

## Log Rotation

Logs are automatically rotated daily with the following configuration:

- **Rotation**: Daily (at midnight)
- **Compression**: gzip compression for archived logs
- **Retention**: 14 days by default (configurable)
- **Max Size**: 20MB per file by default
- **Format**: `incentedge-2026-02-17.log`

Archived logs are compressed: `incentedge-2026-02-17.log.gz`

## Log Analysis

### Search Logs

```typescript
import { searchLogs } from '@/lib/logging/log-analyzer';

const logs = await searchLogs({
  logDir: './logs',
  level: 'error',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-17'),
  userId: 'user-123',
  limit: 100
});
```

### Aggregate Statistics

```typescript
import { aggregateLogs } from '@/lib/logging/log-analyzer';

const stats = await aggregateLogs({
  logDir: './logs',
  startDate: new Date('2026-02-01')
});

console.log(`Total logs: ${stats.totalLogs}`);
console.log(`Error rate: ${(stats.errorCount / stats.totalLogs * 100).toFixed(2)}%`);
console.log(`Avg duration: ${stats.avgDuration?.toFixed(2)}ms`);
```

### Detect Anomalies

```typescript
import { detectAnomalies } from '@/lib/logging/log-analyzer';

const anomalies = await detectAnomalies({
  logDir: './logs',
  startDate: new Date('2026-02-17')
});

anomalies.forEach(anomaly => {
  console.log(`[${anomaly.severity}] ${anomaly.type}: ${anomaly.description}`);
});
```

### Generate Report

```typescript
import { generateReport } from '@/lib/logging/log-analyzer';

const report = await generateReport({
  logDir: './logs',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-17')
});

console.log(report);
```

## Best Practices

### DO

1. **Use structured context**: Always provide context objects with relevant data
   ```typescript
   logger.info('User action', { userId, action, resource });
   ```

2. **Log errors with context**: Include stack traces and relevant data
   ```typescript
   logger.error('Operation failed', {
     error: error.message,
     stack: error.stack,
     userId,
     operationId
   });
   ```

3. **Use appropriate log levels**: Don't log everything as `info`

4. **Include request IDs**: Use middleware for automatic request tracking

5. **Log security events**: Authentication, authorization, data access

6. **Sanitize sensitive data**: Never log passwords, tokens, or full credit card numbers

### DON'T

1. **Don't use console.log**: Use the logger instead

2. **Don't log PII unnecessarily**: Only log when required for audit/security

3. **Don't log in loops**: Aggregate and log summaries instead

4. **Don't log sensitive data**: Sanitize before logging

5. **Don't use dynamic log levels**: Set via environment variables

## Security Considerations

### PII Handling

When logging personally identifiable information (PII):

1. **Mark as PII**: Use the security logger with `isPII: true`
2. **Minimal data**: Log only what's necessary
3. **Hashing**: Consider hashing sensitive identifiers
4. **Retention**: Follow data retention policies (7 years for SOC 2)

Example:

```typescript
SecurityLogger.logDataAccess({
  userId: 'user-123',
  resource: 'user_profile',
  action: 'read',
  result: 'success',
  isPII: true,
  metadata: {
    fields: ['email', 'phone'],
    // Don't log actual values
  }
});
```

### Audit Trail Requirements

For SOC 2 compliance, audit logs must:

1. **Be immutable**: Use `AUDIT_IMMUTABLE=true`
2. **Retained for 7 years**: Set `AUDIT_RETENTION_DAYS=2555`
3. **Include all changes**: Log before/after state
4. **Track user actions**: Include userId, IP, timestamp
5. **Be tamper-proof**: Store in write-once storage (CloudWatch, S3)

## Migration from console.log

Use the automated migration script:

```bash
# Dry run (preview changes)
npm run migrate:logging -- --dry-run

# Apply changes
npm run migrate:logging
```

The script will:

1. Find all `console.log`, `console.error`, etc.
2. Replace with appropriate logger calls
3. Add necessary imports
4. Generate a migration report

## Troubleshooting

### Logs not appearing

1. Check `LOG_LEVEL` environment variable
2. Verify file permissions for log directory
3. Check console output in development mode

### File rotation not working

1. Verify `LOG_FILE_ENABLED=true`
2. Check `LOG_FILE_DIRECTORY` exists and is writable
3. Review `LOG_FILE_MAX_FILES` and `LOG_FILE_MAX_SIZE` settings

### CloudWatch errors

1. Verify AWS credentials are correct
2. Check CloudWatch log group exists
3. Verify IAM permissions for `logs:PutLogEvents`

## Architecture

```
src/lib/logging/
├── logger.ts              # Core logger implementation
├── types.ts               # TypeScript interfaces
├── middleware.ts          # Express/Next.js middleware
├── security-logger.ts     # Security event logging
├── audit-logger.ts        # Audit trail logging
├── cloudwatch-transport.ts # CloudWatch integration
├── log-analyzer.ts        # Log analysis tools
├── README.md              # This file
└── EXAMPLES.md            # Usage examples
```

## Support

For issues or questions:

1. Check this documentation
2. Review `EXAMPLES.md` for code samples
3. Contact the development team

---

**Last Updated**: 2026-02-17
**Version**: 1.0.0
