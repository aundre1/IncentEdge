/**
 * IncentEdge Encryption Library - Usage Examples
 *
 * Practical examples for common encryption scenarios
 */

import { FieldEncryption, generateMasterSecret, encryptEIN, decryptEIN } from './index';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// EXAMPLE 1: Basic Setup and Initialization
// ============================================================================

async function example1_basicSetup() {
  // Generate a master secret (do this ONCE and store in .env)
  const masterSecret = generateMasterSecret();
  console.log('Add to .env:', `ENCRYPTION_MASTER_SECRET=${masterSecret}`);

  // Initialize the encryption service
  const encryption = await FieldEncryption.initialize();

  // Encrypt some PII
  const ein = '12-3456789';
  const encrypted = await encryption.encryptPII(ein);
  console.log('Encrypted EIN:', encrypted);

  // Decrypt it back
  const decrypted = await encryption.decryptPII(encrypted);
  console.log('Decrypted EIN:', decrypted); // "12-3456789"
}

// ============================================================================
// EXAMPLE 2: Encrypting Organization Data
// ============================================================================

async function example2_organizationEncryption() {
  const encryption = await FieldEncryption.initialize();

  // Sample organization data
  const organization = {
    name: 'Acme Corporation',
    ein: '12-3456789',
    duns_number: '123456789',
    sam_uei: 'ABCDEFG12345',
    address: '123 Main St',
    city: 'New York',
  };

  // Encrypt sensitive fields
  const encrypted = await encryption.encryptFields(
    organization,
    ['ein', 'duns_number', 'sam_uei'],
    'organizations'
  );

  console.log('Original:', organization.ein);
  console.log('Encrypted:', encrypted.ein);

  // Store in database (encrypted fields are now safe)
  // await supabase.from('organizations').insert(encrypted);

  // Later, decrypt when reading
  const decrypted = await encryption.decryptFields(
    encrypted,
    ['ein', 'duns_number', 'sam_uei'],
    'organizations'
  );

  console.log('Decrypted:', decrypted.ein); // "12-3456789"
}

// ============================================================================
// EXAMPLE 3: Supabase Integration
// ============================================================================

async function example3_supabaseIntegration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const encryption = await FieldEncryption.initialize();

  // INSERT with encryption
  const newOrg = {
    name: 'TechCo Inc',
    ein: '98-7654321',
    duns_number: '987654321',
  };

  // Encrypt before insert
  const encrypted = await encryption.encryptFields(newOrg, ['ein', 'duns_number'], 'organizations');

  const { data: inserted, error: insertError } = await supabase
    .from('organizations')
    .insert({
      ...encrypted,
      encrypted_at: new Date().toISOString(),
      encryption_key_id: encryption.getCryptoService().getActiveKeyId(),
    })
    .select()
    .single();

  // SELECT with decryption
  const { data: org, error: selectError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', inserted!.id)
    .single();

  if (org) {
    // Decrypt after select
    const decrypted = await encryption.decryptFields(org, ['ein', 'duns_number'], 'organizations');
    console.log('Retrieved EIN:', decrypted.ein);
  }
}

// ============================================================================
// EXAMPLE 4: Batch Operations
// ============================================================================

async function example4_batchOperations() {
  const encryption = await FieldEncryption.initialize();

  // Batch encrypt multiple organizations
  const organizations = [
    { name: 'Org 1', ein: '11-1111111', duns_number: '111111111' },
    { name: 'Org 2', ein: '22-2222222', duns_number: '222222222' },
    { name: 'Org 3', ein: '33-3333333', duns_number: '333333333' },
  ];

  const encrypted = await encryption.encryptBatch(
    organizations,
    ['ein', 'duns_number'],
    'organizations'
  );

  console.log('Encrypted', encrypted.length, 'organizations');

  // Batch decrypt
  const decrypted = await encryption.decryptBatch(
    encrypted,
    ['ein', 'duns_number'],
    'organizations'
  );

  console.log('Decrypted EINs:', decrypted.map((o) => o.ein));
}

// ============================================================================
// EXAMPLE 5: API Route with Encryption
// ============================================================================

// File: /src/app/api/organizations/route.ts
export async function POST_example(request: Request) {
  const body = await request.json();
  const encryption = FieldEncryption.getInstance();

  try {
    // Validate input
    if (!body.name || !body.ein) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Encrypt sensitive fields
    const encryptedData = await encryption.encryptFields(
      body,
      ['ein', 'duns_number', 'sam_uei'],
      'organizations'
    );

    // Insert into database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.from('organizations').insert({
      ...encryptedData,
      encrypted_at: new Date().toISOString(),
      encryption_key_id: encryption.getCryptoService().getActiveKeyId(),
    });

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'Failed to create organization' }, { status: 500 });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Encryption error:', error);
    return Response.json({ error: 'Encryption failed' }, { status: 500 });
  }
}

// ============================================================================
// EXAMPLE 6: Webhook Secret Encryption
// ============================================================================

async function example6_webhookEncryption() {
  const encryption = await FieldEncryption.initialize();

  // Webhook configuration
  const webhook = {
    url: 'https://example.com/webhook',
    secret: 'whsec_1234567890abcdef',
    events: ['application.submitted', 'application.approved'],
  };

  // Encrypt the HMAC secret
  const encryptedSecret = await encryption.encryptPII(webhook.secret, 'webhook_configs.secret');

  // Store in database
  const webhookConfig = {
    ...webhook,
    encrypted_secret: encryptedSecret,
    secret_encrypted_at: new Date().toISOString(),
  };

  // Later, when sending webhook
  const decryptedSecret = await encryption.decryptPII(webhookConfig.encrypted_secret);

  // Use decrypted secret for HMAC signature
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', decryptedSecret)
    .update(JSON.stringify({ event: 'test' }))
    .digest('hex');

  console.log('Webhook signature:', signature);
}

// ============================================================================
// EXAMPLE 7: API Key Management
// ============================================================================

async function example7_apiKeyManagement() {
  const encryption = await FieldEncryption.initialize();
  const crypto = require('crypto');

  // Generate new API key
  const apiKey = 'ie_live_' + crypto.randomBytes(32).toString('hex');
  console.log('Generated API key:', apiKey);
  console.log('⚠️  Save this key - it will only be shown once!');

  // Hash the key
  const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Encrypt the hash
  const encryptedHash = await encryption.encryptPII(hash, 'api_keys.key_hash');

  // Store in database
  const apiKeyRecord = {
    key_prefix: 'ie_live_',
    encrypted_key_hash: encryptedHash,
    key_encrypted_at: new Date().toISOString(),
    scopes: ['read', 'write'],
    is_active: true,
  };

  // Later, verify an API key
  const providedKey = 'ie_live_xxxxx'; // From request header
  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');

  // Decrypt stored hash
  const storedHash = await encryption.decryptPII(apiKeyRecord.encrypted_key_hash);

  // Compare hashes (constant-time)
  const { constantTimeCompare } = await import('./crypto-service');
  const isValid = constantTimeCompare(providedHash, storedHash);

  console.log('API key valid:', isValid);
}

// ============================================================================
// EXAMPLE 8: Data Migration Script
// ============================================================================

async function example8_dataMigration() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const encryption = await FieldEncryption.initialize();

  // Get all organizations without encrypted data
  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .is('encrypted_ein', null)
    .limit(100);

  console.log(`Migrating ${orgs?.length || 0} organizations...`);

  let migrated = 0;
  let failed = 0;

  for (const org of orgs || []) {
    try {
      const updates: any = {};

      // Encrypt each sensitive field if present
      if (org.ein) {
        updates.encrypted_ein = await encryption.encryptPII(org.ein, 'organizations.ein');
      }

      if (org.duns_number) {
        updates.encrypted_duns_number = await encryption.encryptPII(
          org.duns_number,
          'organizations.duns_number'
        );
      }

      if (org.sam_uei) {
        updates.encrypted_sam_uei = await encryption.encryptPII(
          org.sam_uei,
          'organizations.sam_uei'
        );
      }

      if (Object.keys(updates).length > 0) {
        updates.encrypted_at = new Date().toISOString();
        updates.encryption_key_id = encryption.getCryptoService().getActiveKeyId();

        const { error } = await supabase.from('organizations').update(updates).eq('id', org.id);

        if (error) throw error;

        migrated++;
        console.log(`✓ Migrated org ${org.id}`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ Failed to migrate org ${org.id}:`, error);
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${failed} failed`);
}

// ============================================================================
// EXAMPLE 9: Key Rotation
// ============================================================================

async function example9_keyRotation() {
  const { rotateEncryptionKeys, initializeEncryptionKeys } = await import('./key-management');

  // Load current keys
  const currentKeys = await initializeEncryptionKeys();
  console.log('Current keys:', currentKeys.length);
  console.log('Active key:', currentKeys.find((k) => k.isActive)?.id);

  // Rotate to new key
  const newKeys = await rotateEncryptionKeys(currentKeys);
  console.log('After rotation:', newKeys.length);
  console.log('New active key:', newKeys.find((k) => k.isActive)?.id);

  // Old data can still be decrypted with old keys
  // New data will be encrypted with new active key

  // Re-encrypt old data with new key (optional, background job)
  const encryption = await FieldEncryption.initialize(newKeys);

  // Example: Re-encrypt one record
  const oldEncrypted = 'eyJrZXkiOiJvbGQta2V5IiwiZGF0YSI6Ii4uLiJ9'; // From database
  const decrypted = await encryption.decryptPII(oldEncrypted);
  const reencrypted = await encryption.encryptPII(decrypted);

  console.log('Re-encrypted with new key');
}

// ============================================================================
// EXAMPLE 10: Monitoring and Audit
// ============================================================================

async function example10_monitoring() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check encryption coverage
  const { data: coverage } = await supabase.from('v_encryption_coverage').select('*');

  console.log('Encryption Coverage:');
  coverage?.forEach((row) => {
    console.log(`${row.table_name}.${row.field_name}: ${row.encryption_percentage}%`);
  });

  // Check for failed operations
  const { data: failures } = await supabase
    .from('encryption_audit_log')
    .select('*')
    .eq('success', false)
    .order('created_at', { ascending: false })
    .limit(10);

  if (failures && failures.length > 0) {
    console.warn('⚠️  Recent encryption failures:', failures.length);
    failures.forEach((f) => {
      console.log(`- ${f.operation} on ${f.table_name}.${f.column_name}: ${f.error_message}`);
    });
  }

  // Get statistics
  const { data: stats } = await supabase.rpc('get_encryption_stats');

  if (stats) {
    console.log('\nEncryption Statistics:');
    console.log(`Total encrypted fields: ${stats.total_encrypted_fields}`);
    console.log(`Total operations: ${stats.total_operations}`);
    console.log(`Failed operations: ${stats.failed_operations}`);
    console.log(`Active keys: ${stats.active_keys}`);
    console.log(`Last encryption: ${stats.last_encryption}`);
  }
}

// ============================================================================
// Run Examples
// ============================================================================

if (require.main === module) {
  // Run specific example
  const exampleNumber = process.argv[2] || '1';

  const examples: Record<string, () => Promise<void>> = {
    '1': example1_basicSetup,
    '2': example2_organizationEncryption,
    '3': example3_supabaseIntegration,
    '4': example4_batchOperations,
    '6': example6_webhookEncryption,
    '7': example7_apiKeyManagement,
    '8': example8_dataMigration,
    '9': example9_keyRotation,
    '10': example10_monitoring,
  };

  const example = examples[exampleNumber];
  if (example) {
    console.log(`\n=== Example ${exampleNumber} ===\n`);
    example()
      .then(() => console.log('\n✓ Example complete'))
      .catch((error) => console.error('\n✗ Example failed:', error));
  } else {
    console.log('Available examples: 1-10');
  }
}
