# Encryption Library Setup Guide

Step-by-step guide to implement field-level encryption in IncentEdge.

## Phase 1: Initial Setup (Day 1)

### 1. Generate Master Secret

```bash
cd /Users/dremacmini/Desktop/OC/IncentEdge/Site

# Generate master secret
node -e "console.log('ENCRYPTION_MASTER_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Update Environment Variables

Add to `.env.local` and `.env.production`:

```bash
# Encryption Configuration
ENCRYPTION_MASTER_SECRET=your-generated-secret-here
```

IMPORTANT:
- Store production secret in Vercel/deployment environment
- Never commit master secret to git
- Use different secrets per environment

### 3. Run Database Migration

```bash
# Apply migration
npx supabase migration up

# Or manually:
psql $DATABASE_URL -f supabase/migrations/013_field_encryption.sql
```

### 4. Verify Installation

```bash
# Run tests
npm test src/lib/encryption

# Expected: All tests pass
```

## Phase 2: Application Integration (Day 2-3)

### 1. Initialize at App Startup

Create `/src/lib/encryption/init.ts`:

```typescript
import { FieldEncryption } from '@/lib/encryption';

let encryptionInitialized = false;

export async function initializeEncryption() {
  if (encryptionInitialized) return;

  try {
    await FieldEncryption.initialize();
    encryptionInitialized = true;
    console.log('✓ Encryption service initialized');
  } catch (error) {
    console.error('✗ Encryption initialization failed:', error);
    throw error;
  }
}
```

Add to `/src/app/layout.tsx`:

```typescript
import { initializeEncryption } from '@/lib/encryption/init';

// Initialize encryption on server startup
if (typeof window === 'undefined') {
  initializeEncryption().catch(console.error);
}
```

### 2. Update Organization API Routes

Edit `/src/app/api/organizations/route.ts`:

```typescript
import { FieldEncryption } from '@/lib/encryption';

export async function POST(request: Request) {
  const body = await request.json();
  const encryption = FieldEncryption.getInstance();

  // Encrypt sensitive fields before insert
  const encryptedData = await encryption.encryptFields(
    body,
    ['ein', 'duns_number', 'sam_uei'],
    'organizations'
  );

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      ...encryptedData,
      encrypted_at: new Date().toISOString(),
      encryption_key_id: encryption.getCryptoService().getActiveKeyId(),
    });

  // ... rest of handler
}

export async function GET(request: Request) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*');

  if (data) {
    const encryption = FieldEncryption.getInstance();
    // Decrypt sensitive fields after select
    const decrypted = await encryption.decryptBatch(
      data,
      ['ein', 'duns_number', 'sam_uei'],
      'organizations'
    );
    return Response.json(decrypted);
  }

  // ... error handling
}
```

### 3. Update Webhook Configuration

Edit `/src/app/api/webhooks/route.ts`:

```typescript
import { encryptWebhookSecret, decryptWebhookSecret } from '@/lib/encryption';

export async function POST(request: Request) {
  const { url, secret, events } = await request.json();

  // Encrypt webhook secret
  const encryptedSecret = await encryptWebhookSecret(secret);

  const { data, error } = await supabase
    .from('webhook_configs')
    .insert({
      url,
      encrypted_secret: encryptedSecret,
      events,
      secret_encrypted_at: new Date().toISOString(),
    });

  // ... rest of handler
}
```

### 4. Update API Key Generation

Edit `/src/app/api/keys/route.ts`:

```typescript
import { encryptAPIKey } from '@/lib/encryption';
import crypto from 'crypto';

export async function POST(request: Request) {
  // Generate API key
  const apiKey = 'ie_live_' + crypto.randomBytes(32).toString('hex');

  // Hash the key for storage
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Encrypt the hash
  const encryptedHash = await encryptAPIKey(hash);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      key_prefix: 'ie_live_',
      encrypted_key_hash: encryptedHash,
      key_encrypted_at: new Date().toISOString(),
    });

  // Return the plaintext key ONCE (cannot be retrieved later)
  return Response.json({ api_key: apiKey });
}
```

## Phase 3: Data Migration (Day 4-5)

### 1. Create Migration Script

Create `/scripts/migrate-encryption.ts`:

```typescript
import { FieldEncryption } from '@/lib/encryption';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateOrganizations() {
  const encryption = await FieldEncryption.initialize();

  // Get all organizations with unencrypted data
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .is('encrypted_ein', null);

  console.log(`Migrating ${orgs?.length || 0} organizations...`);

  for (const org of orgs || []) {
    try {
      const updates: any = {};

      if (org.ein) {
        updates.encrypted_ein = await encryption.encryptPII(org.ein, 'organizations.ein');
      }
      if (org.duns_number) {
        updates.encrypted_duns_number = await encryption.encryptPII(org.duns_number, 'organizations.duns_number');
      }
      if (org.sam_uei) {
        updates.encrypted_sam_uei = await encryption.encryptPII(org.sam_uei, 'organizations.sam_uei');
      }

      if (Object.keys(updates).length > 0) {
        updates.encrypted_at = new Date().toISOString();
        updates.encryption_key_id = encryption.getCryptoService().getActiveKeyId();

        await supabase
          .from('organizations')
          .update(updates)
          .eq('id', org.id);

        console.log(`✓ Migrated organization ${org.id}`);
      }
    } catch (error) {
      console.error(`✗ Failed to migrate organization ${org.id}:`, error);
    }
  }

  console.log('Migration complete!');
}

migrateOrganizations().catch(console.error);
```

### 2. Run Migration

```bash
# Dry run (check what would be migrated)
ENCRYPTION_MASTER_SECRET=xxx npx ts-node scripts/migrate-encryption.ts

# Backup database first!
pg_dump $DATABASE_URL > backup-before-encryption.sql

# Run actual migration
ENCRYPTION_MASTER_SECRET=xxx npx ts-node scripts/migrate-encryption.ts
```

### 3. Monitor Progress

```sql
-- Check encryption coverage
SELECT * FROM v_encryption_coverage;

-- Check for failures
SELECT * FROM encryption_audit_log
WHERE success = false
ORDER BY created_at DESC
LIMIT 100;

-- Get stats
SELECT * FROM get_encryption_stats();
```

## Phase 4: Validation & Cleanup (Day 6-7)

### 1. Validate Encrypted Data

```typescript
// Test script to verify encryption
import { FieldEncryption } from '@/lib/encryption';
import { createClient } from '@supabase/supabase-js';

async function validateEncryption() {
  const encryption = await FieldEncryption.initialize();
  const supabase = createClient(...);

  // Get sample encrypted records
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .not('encrypted_ein', 'is', null)
    .limit(10);

  for (const org of orgs || []) {
    // Decrypt and verify
    if (org.encrypted_ein) {
      const decrypted = await encryption.decryptPII(org.encrypted_ein);
      console.log(`EIN decrypted successfully: ${decrypted.slice(0, 3)}***`);
    }
  }

  console.log('✓ Validation complete');
}
```

### 2. Update Application to Use Encrypted Columns

Once 100% of data is encrypted:

```sql
-- Update application_workflow to prefer encrypted columns
-- This is done gradually, not all at once

-- Example: Update a view
CREATE OR REPLACE VIEW v_organization_details AS
SELECT
  id,
  name,
  COALESCE(encrypted_ein, ein) as ein_value,
  -- ... other fields
FROM organizations;
```

### 3. Deprecate Plaintext Columns

After validation period (2-4 weeks):

```sql
-- Migration: 014_drop_plaintext_columns.sql
-- ONLY run after 100% encryption and validation period

-- Add warnings
COMMENT ON COLUMN organizations.ein IS 'DEPRECATED: Will be dropped in 30 days. Use encrypted_ein';

-- Eventually drop (separate migration after grace period)
-- ALTER TABLE organizations DROP COLUMN ein;
```

## Security Checklist

- [ ] Master secret stored securely in environment
- [ ] Different secrets for dev/staging/production
- [ ] Encryption keys never logged
- [ ] Audit log monitoring enabled
- [ ] Failed decryption alerts configured
- [ ] Database backups before migration
- [ ] Rollback plan documented
- [ ] Access controls on encryption_audit_log
- [ ] Key rotation schedule established
- [ ] Compliance requirements verified

## Monitoring

### 1. Set Up Alerts

```typescript
// Add to monitoring service
const failedDecryptions = await supabase
  .from('encryption_audit_log')
  .select('count')
  .eq('success', false)
  .gte('created_at', new Date(Date.now() - 3600000).toISOString());

if (failedDecryptions.count > 10) {
  // Alert: High rate of decryption failures
  // Possible tampering or key issues
}
```

### 2. Performance Monitoring

```typescript
// Track encryption overhead
console.time('encryption');
await encryption.encryptPII(data);
console.timeEnd('encryption');

// Typical: 0.1-0.5ms per field
// Alert if > 10ms
```

## Rollback Plan

If encryption causes issues:

1. **Application rollback**: Deploy previous version
2. **Data intact**: Plaintext columns remain untouched
3. **Re-encryption**: Can re-run migration with fixes
4. **No data loss**: Encrypted columns are additive

## Support

Issues? Check:

1. Environment variables set correctly
2. Migration applied successfully
3. Test suite passes
4. Audit log for errors

Contact: security@incentedge.com
