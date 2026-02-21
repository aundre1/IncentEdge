# Console.log Migration Guide

Step-by-step guide to migrate from `console.log` to structured logging.

## Quick Reference

### Before and After Examples

```typescript
// ❌ BEFORE: console.log
console.log('User logged in');
console.log('Creating project:', projectData);
console.error('Failed to save:', error);
console.warn('Rate limit approaching');

// ✅ AFTER: Structured logging
import { logger } from '@/lib/logging/logger';

logger.info('User logged in');
logger.info('Creating project', { projectData });
logger.error('Failed to save', { error: error.message, stack: error.stack });
logger.warn('Rate limit approaching');
```

## Migration Steps

### Step 1: Add Import

At the top of your file, add the logger import:

```typescript
import { logger } from '@/lib/logging/logger';
```

### Step 2: Replace console.log

| Before | After | Log Level |
|--------|-------|-----------|
| `console.log('message')` | `logger.info('message')` | info |
| `console.error('message')` | `logger.error('message')` | error |
| `console.warn('message')` | `logger.warn('message')` | warn |
| `console.info('message')` | `logger.info('message')` | info |
| `console.debug('message')` | `logger.debug('message')` | debug |

### Step 3: Add Context

Always include relevant context data:

```typescript
// ❌ BAD
logger.info('User created project');

// ✅ GOOD
logger.info('User created project', {
  userId: user.id,
  projectId: project.id,
  projectName: project.name
});
```

## Common Patterns

### Pattern 1: Simple Message

```typescript
// Before
console.log('Application started');

// After
logger.info('Application started');
```

### Pattern 2: Message with Variable

```typescript
// Before
console.log('User ID:', userId);

// After
logger.info('User activity', { userId });
```

### Pattern 3: Error Logging

```typescript
// Before
console.error('Operation failed:', error);

// After
logger.error('Operation failed', {
  error: error instanceof Error ? error.message : String(error),
  stack: error instanceof Error ? error.stack : undefined
});
```

### Pattern 4: Debug Information

```typescript
// Before
console.log('Request payload:', JSON.stringify(data));

// After
logger.debug('Request payload', { data });
```

### Pattern 5: API Route Logging

```typescript
// Before
export async function POST(req: NextRequest) {
  console.log('Received request');
  // ... logic
  console.log('Response sent');
}

// After
import { withLogging } from '@/lib/logging/middleware';

export const POST = withLogging(async (req: NextRequest, context) => {
  logger.info('Processing request', context);
  // ... logic
  logger.info('Request completed', context);
});
```

### Pattern 6: Try-Catch Blocks

```typescript
// Before
try {
  await someOperation();
  console.log('Success');
} catch (error) {
  console.error('Failed:', error);
}

// After
import { logger } from '@/lib/logging/logger';

try {
  await someOperation();
  logger.info('Operation succeeded');
} catch (error) {
  logger.error('Operation failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    operation: 'someOperation'
  });
}
```

### Pattern 7: Mock/Development Logging

```typescript
// Before
if (process.env.NODE_ENV === 'development') {
  console.log('[MockStripe] Creating session:', data);
}

// After
import { logger } from '@/lib/logging/logger';

logger.debug('[MockStripe] Creating session', { data });
// Debug logs are automatically disabled in production
```

### Pattern 8: Warning Conditions

```typescript
// Before
if (usage > threshold * 0.8) {
  console.warn('Rate limit approaching:', usage, '/', threshold);
}

// After
import { logger } from '@/lib/logging/logger';

if (usage > threshold * 0.8) {
  logger.warn('Rate limit approaching', {
    usage,
    threshold,
    percentage: (usage / threshold * 100).toFixed(2)
  });
}
```

## File-by-File Migration Checklist

For each file:

- [ ] Add logger import at the top
- [ ] Replace all `console.log` → `logger.info`
- [ ] Replace all `console.error` → `logger.error`
- [ ] Replace all `console.warn` → `logger.warn`
- [ ] Replace all `console.debug` → `logger.debug`
- [ ] Add context objects to all logger calls
- [ ] Test the file to ensure logging works
- [ ] Remove unused console references

## Special Cases

### Stripe Mock Mode

```typescript
// Before
console.warn('[MockStripe] Creating mock checkout session:', params);

// After
import { logger } from '@/lib/logging/logger';

logger.warn('[MockStripe] Creating mock checkout session', {
  mode: 'mock',
  params: {
    success_url: params.success_url,
    cancel_url: params.cancel_url,
    // Don't log sensitive data
  }
});
```

### Authentication Events

```typescript
// Before
console.log('User logged in:', userId);

// After
import SecurityLogger from '@/lib/logging/security-logger';

SecurityLogger.logSuccessfulLogin(userId, ipAddress, {
  userAgent,
  loginMethod: 'password'
});
```

### Audit Events

```typescript
// Before
console.log('Project created:', projectId, projectData);

// After
import AuditLogger from '@/lib/logging/audit-logger';

AuditLogger.logProjectCreate(
  userId,
  organizationId,
  projectId,
  projectData
);
```

## Testing Your Migration

After migrating a file:

1. **Run the application**: `npm run dev`
2. **Check log output**: Verify logs appear in console (development) or files (production)
3. **Trigger operations**: Execute the code paths to see logs
4. **Verify context**: Ensure all context data is logged correctly

## Automated Find & Replace

Use your IDE's find and replace feature:

### VS Code

1. Open find and replace (Cmd+Shift+H)
2. Enable regex mode (Alt+Cmd+R)
3. Find: `console\.(log|error|warn|info|debug)`
4. Manually replace each occurrence with appropriate logger call

### IntelliJ/WebStorm

1. Open find and replace (Cmd+Shift+R)
2. Enable regex mode
3. Find: `console\.(log|error|warn|info|debug)`
4. Review and replace each occurrence

## Verification

After migration, verify all console.log statements are gone:

```bash
# Search for remaining console statements
grep -r "console\.(log|error|warn|info|debug)" src/

# Should return no results (except in test files)
```

## Tips

1. **Start small**: Migrate one file at a time
2. **Test frequently**: Run and test after each file
3. **Group by module**: Migrate related files together
4. **Use context**: Always include relevant data in context objects
5. **Don't log secrets**: Never log passwords, tokens, or API keys
6. **Be specific**: Use descriptive messages and relevant context

## Need Help?

- See [README.md](./README.md) for detailed documentation
- See [EXAMPLES.md](./EXAMPLES.md) for more code examples
- Review existing migrated files for patterns

---

**Next Steps**: After migrating console.log statements, consider:
1. Adding security logging for authentication events
2. Adding audit logging for data modifications
3. Implementing performance tracking for slow operations
4. Setting up log rotation and retention policies
