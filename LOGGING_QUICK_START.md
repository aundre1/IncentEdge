# Logging System Quick Start Guide

Get started with IncentEdge's production-grade structured logging in 5 minutes.

---

## 1. Environment Setup (2 minutes)

### Create `.env.local`

Copy the logging configuration from `.env.example`:

```bash
# Copy and edit
cp .env.example .env.local

# Or add these lines to your existing .env.local:
LOG_LEVEL=debug              # Use 'debug' for development
LOG_FORMAT=pretty            # Use 'pretty' for development
LOG_FILE_ENABLED=true
LOG_FILE_DIRECTORY=./logs
SECURITY_LOGGING_ENABLED=true
AUDIT_LOGGING_ENABLED=true
```

### Create logs directory

```bash
mkdir logs
```

---

## 2. Basic Usage (1 minute)

### Simple Logging

```typescript
import { logger } from '@/lib/logging/logger';

// Replace console.log with logger.info
logger.info('User logged in', { userId, email });

// Replace console.error with logger.error
logger.error('Operation failed', {
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined
});

// Replace console.warn with logger.warn
logger.warn('Rate limit approaching', { usage, threshold });
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/logging/middleware';
import { logger } from '@/lib/logging/logger';

export const POST = withLogging(async (req: NextRequest, context) => {
  // context automatically includes: requestId, method, path, ipAddress
  logger.info('Processing request', context);

  try {
    const result = await doSomething();
    logger.info('Request successful', { ...context, result });
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Request failed', {
      ...context,
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
});
```

---

## 3. View Logs (1 minute)

### Development (Console)

When running `npm run dev`, logs appear in your console with pretty formatting:

```
2026-02-17 14:30:15 [info]: User logged in
{
  "userId": "user-123",
  "email": "user@example.com"
}
```

### Production (Files)

Logs are written to `./logs/incentedge-YYYY-MM-DD.log`:

```bash
# View today's logs
tail -f logs/incentedge-$(date +%Y-%m-%d).log

# Search for errors
grep "error" logs/incentedge-*.log

# View specific user's activity
grep "user-123" logs/incentedge-*.log
```

---

## 4. Security & Audit Logging (1 minute)

### Security Events

```typescript
import SecurityLogger from '@/lib/logging/security-logger';

// Log successful login
SecurityLogger.logSuccessfulLogin(userId, ipAddress, {
  userAgent,
  loginMethod: 'password'
});

// Log permission denied
SecurityLogger.logPermissionDenied(
  userId,
  '/api/admin/users',
  'DELETE',
  'User is not admin'
);
```

### Audit Trail

```typescript
import AuditLogger from '@/lib/logging/audit-logger';

// Log project creation
AuditLogger.logProjectCreate(
  userId,
  organizationId,
  projectId,
  projectData
);

// Log project update
AuditLogger.logProjectUpdate(
  userId,
  organizationId,
  projectId,
  beforeData,
  afterData,
  ['budget', 'status']
);
```

---

## 5. Migration from console.log

### Check Current Status

```bash
# Run verification script
npm run logging:verify

# Or manually:
npx ts-node scripts/verify-logging-migration.ts
```

This will show you:
- How many console.log statements remain
- Which files need migration
- Detailed list of each occurrence

### Replace console.log

Follow the simple pattern:

```typescript
// ❌ BEFORE
console.log('User logged in');
console.log('Creating project:', projectData);
console.error('Failed to save:', error);

// ✅ AFTER
import { logger } from '@/lib/logging/logger';

logger.info('User logged in');
logger.info('Creating project', { projectData });
logger.error('Failed to save', {
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined
});
```

---

## Common Patterns

### Pattern 1: Error Handling

```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId,
    operation: 'someName'
  });
  throw error; // Re-throw after logging
}
```

### Pattern 2: Performance Tracking

```typescript
import { trackPerformance } from '@/lib/logging/logger';

const result = await trackPerformance(
  'fetch-incentives',
  async () => fetchIncentives(projectId),
  { projectId, userId }
);

// Automatically logs duration and status
```

### Pattern 3: Request Context

```typescript
export const POST = withLogging(async (req, context) => {
  // context includes: requestId, method, path, ipAddress, userAgent
  logger.info('Processing payment', {
    ...context,
    amount,
    currency
  });
});
```

---

## Log Levels Guide

Choose the right level for your logs:

| Level | When to Use | Example |
|-------|-------------|---------|
| `error` | Failures, exceptions | Failed payment, DB error |
| `warn` | Warnings, degraded performance | Rate limit approaching |
| `info` | Important business events | User login, project created |
| `debug` | Development debugging | Cache hit/miss, validation |
| `trace` | Very detailed tracing | Function entry/exit |

**Production Tip**: Set `LOG_LEVEL=info` in production to avoid debug/trace noise.

---

## Verification Checklist

After implementing logging:

- [ ] Added logger import to file
- [ ] Replaced all console.log with logger.info (or appropriate level)
- [ ] Added context objects with relevant data
- [ ] Tested logging output in development
- [ ] Verified logs appear in log files
- [ ] Checked no sensitive data is logged (passwords, tokens, etc.)
- [ ] Run `npm run logging:verify` to confirm no console.log remains

---

## Next Steps

### For Development
1. Use `LOG_LEVEL=debug` and `LOG_FORMAT=pretty` in `.env.local`
2. Replace console.log in files you're actively working on
3. Add security/audit logging for new features

### For Production
1. Set `LOG_LEVEL=info` and `LOG_FORMAT=json`
2. Enable file logging: `LOG_FILE_ENABLED=true`
3. Set up log rotation and monitoring
4. Optional: Configure CloudWatch for centralized logging

---

## Need Help?

### Documentation
- **README.md**: Complete API reference
- **EXAMPLES.md**: 20+ real-world examples
- **MIGRATION_GUIDE.md**: Detailed migration instructions
- **LOGGING_SYSTEM_SUMMARY.md**: Full implementation details

### Commands
```bash
# Verify migration progress
npm run logging:verify

# View logs
tail -f logs/incentedge-*.log

# Run tests
npm test
```

### Quick Tips
1. **Always include context**: `logger.info('message', { userId, data })`
2. **Use appropriate levels**: error for failures, info for events
3. **Don't log secrets**: Never log passwords, tokens, API keys
4. **Test your logs**: Run the code and verify output
5. **Check migration**: Run `npm run logging:verify` regularly

---

## That's It!

You now have production-grade structured logging. Start by:

1. ✅ Setting up `.env.local` with logging config
2. ✅ Importing logger in your files
3. ✅ Replacing console.log with logger calls
4. ✅ Adding context objects to all logs
5. ✅ Running verification to track progress

**Happy Logging!** 🚀

---

For detailed examples and advanced usage, see the full documentation in `src/lib/logging/`.
