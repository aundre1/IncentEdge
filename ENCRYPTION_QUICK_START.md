# Encryption Library - Quick Start

One-page reference for getting started with IncentEdge encryption.

## 1. Install (Already Done ✅)

Library location: `/src/lib/encryption/`

## 2. Generate Master Secret (ONE TIME)

```bash
node -e "console.log('ENCRYPTION_MASTER_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Add output to `.env.local` and `.env.production`

## 3. Apply Database Migration

```bash
cd /Users/dremacmini/Desktop/OC/IncentEdge/Site
npx supabase migration up

# Or manually:
# psql $DATABASE_URL -f supabase/migrations/013_field_encryption.sql
```

## 4. Initialize in Application

Add to `/src/app/layout.tsx` or main entry point:

```typescript
import { FieldEncryption } from '@/lib/encryption';

// Initialize once at startup (server-side only)
if (typeof window === 'undefined') {
  FieldEncryption.initialize().catch(console.error);
}
```

## 5. Use in API Routes

### Encrypt on Insert

```typescript
import { FieldEncryption } from '@/lib/encryption';

export async function POST(request: Request) {
  const body = await request.json();
  const encryption = FieldEncryption.getInstance();

  // Encrypt sensitive fields
  const encrypted = await encryption.encryptFields(
    body,
    ['ein', 'duns_number'],
    'organizations'
  );

  const { data } = await supabase
    .from('organizations')
    .insert({
      ...encrypted,
      encrypted_at: new Date().toISOString(),
    });

  return Response.json(data);
}
```

### Decrypt on Select

```typescript
export async function GET(request: Request) {
  const { data } = await supabase
    .from('organizations')
    .select('*');

  if (data) {
    const encryption = FieldEncryption.getInstance();
    const decrypted = await encryption.decryptBatch(
      data,
      ['ein', 'duns_number'],
      'organizations'
    );
    return Response.json(decrypted);
  }
}
```

## 6. Common Operations

### Encrypt PII

```typescript
import { encryptEIN } from '@/lib/encryption';

const encrypted = await encryptEIN('12-3456789');
```

### Decrypt PII

```typescript
import { decryptEIN } from '@/lib/encryption';

const decrypted = await decryptEIN(encryptedValue);
```

### Batch Operations

```typescript
const encryption = FieldEncryption.getInstance();

// Encrypt multiple records
const encrypted = await encryption.encryptBatch(
  organizations,
  ['ein', 'duns_number'],
  'organizations'
);

// Decrypt multiple records
const decrypted = await encryption.decryptBatch(
  encrypted,
  ['ein', 'duns_number'],
  'organizations'
);
```

## 7. Migrate Existing Data

Create `/scripts/migrate-encryption.ts`:

```typescript
import { FieldEncryption } from '@/lib/encryption';
import { createClient } from '@supabase/supabase-js';

async function migrate() {
  const encryption = await FieldEncryption.initialize();
  const supabase = createClient(/* ... */);

  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .is('encrypted_ein', null);

  for (const org of orgs || []) {
    const updates: any = {};

    if (org.ein) {
      updates.encrypted_ein = await encryption.encryptPII(org.ein);
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('organizations')
        .update(updates)
        .eq('id', org.id);
    }
  }
}

migrate().catch(console.error);
```

Run with:

```bash
ENCRYPTION_MASTER_SECRET=xxx npx ts-node scripts/migrate-encryption.ts
```

## 8. Monitor Encryption

### Check Coverage

```sql
SELECT * FROM v_encryption_coverage;
```

### Check Failures

```sql
SELECT * FROM encryption_audit_log
WHERE success = false
ORDER BY created_at DESC
LIMIT 100;
```

### Get Statistics

```sql
SELECT * FROM get_encryption_stats();
```

## 9. Encrypted Fields

### Organizations
- `ein` → `encrypted_ein`
- `duns_number` → `encrypted_duns_number`
- `sam_uei` → `encrypted_sam_uei`

### Webhooks
- `secret` → `encrypted_secret`

### API Keys
- `key_hash` → `encrypted_key_hash`

### Compliance
- `contractor_ein` → `encrypted_contractor_ein`

## 10. Environment Variables

### Minimum Required

```bash
ENCRYPTION_MASTER_SECRET=<64-byte-hex-string>
```

### With Key Rotation

```bash
ENCRYPTION_MASTER_SECRET=<new-secret>
ENCRYPTION_KEY_1=<old-key-hex>
ENCRYPTION_KEY_ID_1=key-2024-01
ENCRYPTION_ACTIVE_KEY=key-2024-02
```

## Common Issues

### "No encryption keys found"
→ Set `ENCRYPTION_MASTER_SECRET` in `.env`

### "FieldEncryption not initialized"
→ Call `await FieldEncryption.initialize()` at startup

### "Key not found"
→ Add old encryption key to environment for decryption

### "Decryption failed"
→ Verify data not corrupted, correct key being used

## Testing

```bash
# Run all encryption tests
npm test src/lib/encryption

# Run specific test file
npm test src/lib/encryption/__tests__/crypto-service.test.ts
```

## Security Checklist

- [ ] Master secret generated (64+ bytes)
- [ ] Different secrets per environment
- [ ] Secrets stored in secure environment variables
- [ ] Never commit secrets to git
- [ ] Database backed up before migration
- [ ] Audit logging enabled
- [ ] Failed operations monitored

## Documentation

- **Full Guide**: `/src/lib/encryption/README.md`
- **Setup**: `/src/lib/encryption/SETUP.md`
- **Examples**: `/src/lib/encryption/examples.ts`
- **Summary**: `/ENCRYPTION_IMPLEMENTATION_SUMMARY.md`

## Support

- **Email**: security@incentedge.com
- **Issues**: [GitHub Issues](https://github.com/incentedge/issues)

---

**Version**: 1.0.0
**Date**: 2026-02-17
**Status**: Production Ready
