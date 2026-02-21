# IncentEdge Encryption Library

Production-ready AES-256-GCM encryption for sensitive data at rest.

## Features

- **AES-256-GCM**: Authenticated encryption with 256-bit keys
- **Automatic IV Generation**: Cryptographically random initialization vectors
- **Key Rotation**: Support for multiple keys with backward compatibility
- **Field-Level Encryption**: Database field encryption helpers
- **AWS KMS Ready**: Optional integration with AWS Key Management Service
- **Audit Logging**: Track all encryption/decryption operations
- **Type-Safe**: Full TypeScript support

## Security Features

- Authenticated encryption prevents tampering
- Constant-time comparisons prevent timing attacks
- Automatic key zeroization from memory
- PBKDF2 key derivation with 100,000+ iterations
- No plaintext or keys logged in errors
- Authentication tag verification

## Quick Start

### 1. Generate Master Secret

```bash
node -e "console.log('ENCRYPTION_MASTER_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

Add to your `.env`:

```bash
ENCRYPTION_MASTER_SECRET=your-generated-secret-here
```

### 2. Initialize Encryption Service

```typescript
import { FieldEncryption } from '@/lib/encryption';

// Initialize once at app startup
const encryption = await FieldEncryption.initialize();
```

### 3. Encrypt/Decrypt Data

```typescript
// Encrypt PII
const encrypted = await encryption.encryptPII('12-3456789');

// Decrypt PII
const decrypted = await encryption.decryptPII(encrypted);
```

## Usage Examples

### Basic Encryption/Decryption

```typescript
import { FieldEncryption } from '@/lib/encryption';

const encryption = await FieldEncryption.initialize();

// Encrypt
const encryptedEIN = await encryption.encryptPII('12-3456789', 'organizations.ein');

// Decrypt
const decryptedEIN = await encryption.decryptPII(encryptedEIN, 'organizations.ein');
```

### Database Field Encryption

```typescript
import { FieldEncryption } from '@/lib/encryption';

const encryption = await FieldEncryption.initialize();

// Encrypt multiple fields before insert
const organization = {
  name: 'Acme Corp',
  ein: '12-3456789',
  duns_number: '123456789',
};

const encrypted = await encryption.encryptFields(
  organization,
  ['ein', 'duns_number'],
  'organizations'
);

// Insert into database
await supabase.from('organizations').insert(encrypted);

// Decrypt after select
const { data } = await supabase.from('organizations').select('*').single();
const decrypted = await encryption.decryptFields(data, ['ein', 'duns_number'], 'organizations');
```

### Batch Operations

```typescript
// Encrypt multiple records
const organizations = [
  { name: 'Acme Corp', ein: '12-3456789' },
  { name: 'TechCo', ein: '98-7654321' },
];

const encrypted = await encryption.encryptBatch(organizations, ['ein'], 'organizations');

// Decrypt multiple records
const decrypted = await encryption.decryptBatch(encrypted, ['ein'], 'organizations');
```

### Database Hooks

```typescript
import { createEncryptionHooks } from '@/lib/encryption';

// Create hooks for automatic encryption
const hooks = createEncryptionHooks('organizations', ['ein', 'duns_number']);

// Before insert - automatically encrypts
const encryptedData = await hooks.beforeInsert(organizationData);
await supabase.from('organizations').insert(encryptedData);

// After select - automatically decrypts
const { data } = await supabase.from('organizations').select('*');
const decryptedData = await hooks.afterSelect(data);
```

### Supabase Integration

```typescript
import { withEncryption } from '@/lib/encryption';

// Initialize once
await FieldEncryption.initialize();

// Use wrapped client for automatic encryption/decryption
const client = withEncryption(supabase);

// Insert - automatically encrypts sensitive fields
await client.from('organizations').insert({
  name: 'Acme Corp',
  ein: '12-3456789', // Encrypted automatically
});

// Select - automatically decrypts sensitive fields
const { data } = await client.from('organizations').select('*');
// data.ein is decrypted automatically
```

### Convenience Functions

```typescript
import { encryptEIN, decryptEIN, encryptAPIKey, decryptAPIKey } from '@/lib/encryption';

// EIN encryption
const encryptedEIN = await encryptEIN('12-3456789');
const decryptedEIN = await decryptEIN(encryptedEIN);

// API key encryption
const encryptedKey = await encryptAPIKey('sk_live_xxxxx');
const decryptedKey = await decryptAPIKey(encryptedKey);
```

## Key Management

### Environment-Based Keys

Recommended for most deployments:

```bash
# .env
ENCRYPTION_MASTER_SECRET=your-64-byte-hex-secret
```

### Multiple Keys (Rotation)

```bash
# .env
ENCRYPTION_MASTER_SECRET=new-secret
ENCRYPTION_KEY_1=old-key-hex
ENCRYPTION_KEY_ID_1=key-2024-01
ENCRYPTION_ACTIVE_KEY=key-2024-02
```

### Generate New Master Secret

```typescript
import { generateMasterSecret } from '@/lib/encryption';

const secret = generateMasterSecret(); // 64 bytes
console.log('ENCRYPTION_MASTER_SECRET=' + secret);
```

### Key Rotation

```typescript
import { rotateEncryptionKeys, initializeEncryptionKeys } from '@/lib/encryption';

// Load current keys
const currentKeys = await initializeEncryptionKeys();

// Rotate to new key
const newKeys = await rotateEncryptionKeys(currentKeys);

// Old keys remain available for decryption
// New encryptions use the active key
```

### Manual Key Management

```typescript
import { KeyManager } from '@/lib/encryption';

const manager = new KeyManager();

// Generate random key
const key = manager.generateRandomKey('my-key-id');

// Derive from password
const derivedKey = await manager.deriveKeyFromMasterSecret('my-secret', 'key-1');

// Rotate keys
const rotated = await manager.rotateKey([key], 'new-secret');

// Export to environment format
const env = manager.exportKeysToEnv(rotated);
```

## Advanced Usage

### Low-Level Crypto Service

```typescript
import { CryptoService } from '@/lib/encryption';

const service = new CryptoService({
  keys: await initializeEncryptionKeys(),
  enableAuditLog: true,
});

// Encrypt
const result = await service.encrypt('sensitive-data');
if (result.success) {
  console.log(result.data); // Encrypted string
}

// Decrypt
const decrypted = await service.decrypt(result.data);
if (decrypted.success) {
  console.log(decrypted.data); // Original plaintext
}

// Check if re-encryption needed
if (decrypted.shouldReencrypt) {
  const reencrypted = await service.reencrypt(result.data);
}

// Audit log
const log = service.getAuditLog(100);
```

### Custom Table Configuration

```typescript
import { TABLE_ENCRYPTION_CONFIG } from '@/lib/encryption';

// Add custom table
TABLE_ENCRYPTION_CONFIG['custom_table'] = ['sensitive_field_1', 'sensitive_field_2'];

// Get encrypted fields for table
const fields = getEncryptedFields('custom_table');

// Check if field is encrypted
const isEncrypted = isEncryptedField('custom_table', 'sensitive_field_1');
```

## Database Migration

See `supabase/migrations/013_field_encryption.sql` for:

- Adding `encrypted_*` columns to existing tables
- Migrating plaintext data to encrypted columns
- Updating indexes for encrypted fields
- Creating audit log tables

## Security Best Practices

### DO

- Generate strong master secrets (64+ bytes)
- Store master secret in secure environment variables
- Use different encryption keys per environment
- Enable audit logging in production
- Rotate keys periodically (e.g., annually)
- Monitor decryption failures (may indicate tampering)
- Use HTTPS for all data transmission

### DO NOT

- Log encryption keys or plaintext PII
- Store master secret in code or version control
- Use the same key across environments
- Disable authentication (GCM mode is required)
- Expose encrypted data without access controls
- Skip key rotation indefinitely

## Error Handling

```typescript
try {
  const encrypted = await encryption.encryptPII('data');
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('Encryption failed:', error.code, error.message);
  }
}

try {
  const decrypted = await encryption.decryptPII('encrypted-data');
} catch (error) {
  if (error instanceof DecryptionError) {
    console.error('Decryption failed:', error.code, error.message);
    // Possible causes:
    // - Data tampered with (auth tag failed)
    // - Wrong encryption key
    // - Corrupted ciphertext
  }
}
```

## Performance Considerations

- **Encryption overhead**: ~0.1-0.5ms per field
- **Batch operations**: Use `encryptBatch`/`decryptBatch` for multiple records
- **Caching**: Consider caching decrypted values in memory (with TTL)
- **Indexing**: Encrypted fields cannot be indexed or searched directly
- **Key rotation**: Old keys must remain available for decryption

## Compliance

This library helps meet compliance requirements for:

- **PCI DSS**: Encryption of cardholder data at rest
- **HIPAA**: Encryption of PHI (Protected Health Information)
- **GDPR**: Encryption of personal data
- **SOC 2**: Encryption controls for sensitive data
- **IRS Pub 1075**: Encryption of tax information (EIN, SSN)

## AWS KMS Integration

(Coming soon - placeholder for now)

```typescript
import { KeyManager } from '@/lib/encryption';

const manager = new KeyManager({
  region: 'us-east-1',
  keyId: 'arn:aws:kms:us-east-1:123456789:key/xxx',
});

const kmsKey = await manager.generateKMSKey();
```

## Testing

```typescript
import { FieldEncryption, generateRandomKey } from '@/lib/encryption';

// Test with random keys
const testKeys = [{
  id: 'test-key',
  key: generateRandomKey(),
  createdAt: new Date(),
  isActive: true,
}];

const encryption = await FieldEncryption.initialize(testKeys);

// Test encryption/decryption
const encrypted = await encryption.encryptPII('test-data');
const decrypted = await encryption.decryptPII(encrypted);
expect(decrypted).toBe('test-data');
```

## API Reference

### CryptoService

- `encrypt(plaintext, context?)`: Encrypt data
- `decrypt(encrypted, context?)`: Decrypt data
- `reencrypt(encrypted, context?)`: Re-encrypt with active key
- `getAuditLog(limit?)`: Get audit log
- `destroy()`: Clean up and zeroize keys

### KeyManager

- `initializeFromEnv()`: Load keys from environment
- `deriveKeyFromMasterSecret(secret, keyId?, salt?)`: Derive key
- `rotateKey(currentKeys, masterSecret?)`: Rotate keys
- `generateRandomKey(keyId?)`: Generate random key
- `validateKeys(keys)`: Validate key array

### FieldEncryption

- `initialize(keys?)`: Initialize service
- `encryptPII(plaintext, context?)`: Encrypt PII
- `decryptPII(ciphertext, context?)`: Decrypt PII
- `encryptFields(record, fields, table?)`: Encrypt record fields
- `decryptFields(record, fields, table?)`: Decrypt record fields
- `encryptBatch(records, fields, table?)`: Batch encrypt
- `decryptBatch(records, fields, table?)`: Batch decrypt

## Troubleshooting

### "No encryption keys found"

Set `ENCRYPTION_MASTER_SECRET` in your `.env` file.

### "Authentication tag verification failed"

Data may be corrupted or tampered with. Check:
- Ciphertext not modified
- Using correct encryption key
- Data not truncated in database

### "Key not found"

Old encryption key not available. Ensure all keys used for encryption are in your key array.

### Performance issues

- Use batch operations for multiple records
- Cache decrypted values when appropriate
- Avoid encrypting large text fields (>1KB)

## License

Proprietary - IncentEdge Platform

## Support

For issues or questions:
- GitHub Issues: [IncentEdge/issues](https://github.com/incentedge/issues)
- Email: security@incentedge.com
