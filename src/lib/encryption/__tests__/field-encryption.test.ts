/**
 * Tests for FieldEncryption - Database field-level encryption
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FieldEncryption, getEncryptedFields, isEncryptedField } from '../field-encryption';
import { generateRandomKey } from '../crypto-service';
import { EncryptionKey } from '../types';

describe('FieldEncryption', () => {
  let service: FieldEncryption;
  let testKeys: EncryptionKey[];

  beforeAll(async () => {
    // Create test keys
    testKeys = [
      {
        id: 'test-key-1',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      },
    ];

    service = await FieldEncryption.initialize(testKeys);
  });

  afterAll(() => {
    service.destroy();
  });

  describe('PII Encryption/Decryption', () => {
    it('should encrypt PII data', async () => {
      const plaintext = '12-3456789';
      const encrypted = await service.encryptPII(plaintext);

      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(plaintext.length);
    });

    it('should decrypt PII data', async () => {
      const plaintext = '98-7654321';
      const encrypted = await service.encryptPII(plaintext);
      const decrypted = await service.decryptPII(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle context parameter', async () => {
      const plaintext = 'sensitive-data';
      const encrypted = await service.encryptPII(plaintext, 'organizations.ein');
      const decrypted = await service.decryptPII(encrypted, 'organizations.ein');

      expect(decrypted).toBe(plaintext);
    });

    it('should throw on empty plaintext', async () => {
      await expect(service.encryptPII('')).rejects.toThrow('Cannot encrypt empty value');
    });

    it('should throw on empty ciphertext', async () => {
      await expect(service.decryptPII('')).rejects.toThrow('Cannot decrypt empty value');
    });

    it('should throw on decryption failure', async () => {
      await expect(service.decryptPII('invalid-ciphertext')).rejects.toThrow('Decryption failed');
    });
  });

  describe('Field Encryption', () => {
    it('should encrypt multiple fields in record', async () => {
      const record = {
        name: 'Acme Corp',
        ein: '12-3456789',
        duns_number: '123456789',
        city: 'New York',
      };

      const encrypted = await service.encryptFields(record, ['ein', 'duns_number'], 'organizations');

      expect(encrypted.name).toBe('Acme Corp');
      expect(encrypted.city).toBe('New York');
      expect(encrypted.ein).not.toBe('12-3456789');
      expect(encrypted.duns_number).not.toBe('123456789');
    });

    it('should decrypt multiple fields in record', async () => {
      const record = {
        name: 'TechCo',
        ein: '98-7654321',
        duns_number: '987654321',
      };

      const encrypted = await service.encryptFields(record, ['ein', 'duns_number'], 'organizations');
      const decrypted = await service.decryptFields(encrypted, ['ein', 'duns_number'], 'organizations');

      expect(decrypted.name).toBe('TechCo');
      expect(decrypted.ein).toBe('98-7654321');
      expect(decrypted.duns_number).toBe('987654321');
    });

    it('should handle null values', async () => {
      const record = {
        name: 'Test Corp',
        ein: null,
        duns_number: '123456789',
      };

      const encrypted = await service.encryptFields(record, ['ein', 'duns_number'], 'organizations');

      expect(encrypted.ein).toBeNull();
      expect(encrypted.duns_number).not.toBe('123456789');
    });

    it('should handle undefined values', async () => {
      const record = {
        name: 'Test Corp',
        ein: undefined,
        duns_number: '123456789',
      };

      const encrypted = await service.encryptFields(record, ['ein', 'duns_number'], 'organizations');

      expect(encrypted.ein).toBeUndefined();
      expect(encrypted.duns_number).not.toBe('123456789');
    });
  });

  describe('Batch Operations', () => {
    it('should encrypt batch of records', async () => {
      const records = [
        { name: 'Org 1', ein: '11-1111111' },
        { name: 'Org 2', ein: '22-2222222' },
        { name: 'Org 3', ein: '33-3333333' },
      ];

      const encrypted = await service.encryptBatch(records, ['ein'], 'organizations');

      expect(encrypted.length).toBe(3);
      expect(encrypted[0].ein).not.toBe('11-1111111');
      expect(encrypted[1].ein).not.toBe('22-2222222');
      expect(encrypted[2].ein).not.toBe('33-3333333');
    });

    it('should decrypt batch of records', async () => {
      const records = [
        { name: 'Org 1', ein: '11-1111111' },
        { name: 'Org 2', ein: '22-2222222' },
      ];

      const encrypted = await service.encryptBatch(records, ['ein'], 'organizations');
      const decrypted = await service.decryptBatch(encrypted, ['ein'], 'organizations');

      expect(decrypted[0].ein).toBe('11-1111111');
      expect(decrypted[1].ein).toBe('22-2222222');
    });

    it('should handle empty batch', async () => {
      const encrypted = await service.encryptBatch([], ['ein']);
      expect(encrypted).toEqual([]);
    });

    it('should handle failed decryption in batch', async () => {
      const records = [
        { name: 'Org 1', ein: 'invalid-encrypted-data' },
        { name: 'Org 2', ein: 'also-invalid' },
      ];

      const decrypted = await service.decryptBatch(records, ['ein'], 'organizations');

      expect(decrypted[0].ein).toBeNull();
      expect(decrypted[1].ein).toBeNull();
    });
  });

  describe('Table Configuration', () => {
    it('should get encrypted fields for table', () => {
      const fields = getEncryptedFields('organizations');
      expect(fields).toContain('ein');
      expect(fields).toContain('duns_number');
      expect(fields).toContain('sam_uei');
    });

    it('should return empty array for unknown table', () => {
      const fields = getEncryptedFields('unknown_table');
      expect(fields).toEqual([]);
    });

    it('should check if field is encrypted', () => {
      expect(isEncryptedField('organizations', 'ein')).toBe(true);
      expect(isEncryptedField('organizations', 'name')).toBe(false);
      expect(isEncryptedField('webhook_configs', 'secret')).toBe(true);
    });

    it('should return false for unknown table/field', () => {
      expect(isEncryptedField('unknown', 'field')).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide EIN encryption helpers', async () => {
      // Note: These use the singleton instance, so we need to re-import
      const { encryptEIN, decryptEIN } = await import('../field-encryption');

      const ein = '12-3456789';
      const encrypted = await encryptEIN(ein);
      const decrypted = await decryptEIN(encrypted);

      expect(decrypted).toBe(ein);
    });

    it('should provide API key encryption helpers', async () => {
      const { encryptAPIKey, decryptAPIKey } = await import('../field-encryption');

      const apiKey = 'sk_live_1234567890abcdef';
      const encrypted = await encryptAPIKey(apiKey);
      const decrypted = await decryptAPIKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it('should provide webhook secret encryption helpers', async () => {
      const { encryptWebhookSecret, decryptWebhookSecret } = await import('../field-encryption');

      const secret = 'whsec_1234567890abcdef';
      const encrypted = await encryptWebhookSecret(secret);
      const decrypted = await decryptWebhookSecret(encrypted);

      expect(decrypted).toBe(secret);
    });
  });

  describe('Singleton Instance', () => {
    it('should throw if getInstance called before initialize', () => {
      // Create a new module context
      const uninitializedService = FieldEncryption as any;
      uninitializedService.instance = null;

      expect(() => FieldEncryption.getInstance()).toThrow('FieldEncryption not initialized');

      // Restore service
      uninitializedService.instance = service;
    });

    it('should return same instance', async () => {
      const instance1 = FieldEncryption.getInstance();
      const instance2 = FieldEncryption.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Integration', () => {
    it('should handle complex encryption workflow', async () => {
      // Simulate database record
      const organization = {
        id: 'org-123',
        name: 'Test Organization',
        ein: '12-3456789',
        duns_number: '123456789',
        sam_uei: 'ABCDEFG12345',
        stripe_customer_id: 'cus_ABC123',
        settings: { theme: 'dark' },
      };

      // Encrypt sensitive fields
      const encrypted = await service.encryptFields(
        organization,
        ['ein', 'duns_number', 'sam_uei'],
        'organizations'
      );

      // Verify non-sensitive fields unchanged
      expect(encrypted.id).toBe('org-123');
      expect(encrypted.name).toBe('Test Organization');
      expect(encrypted.settings).toEqual({ theme: 'dark' });

      // Verify sensitive fields encrypted
      expect(encrypted.ein).not.toBe('12-3456789');
      expect(encrypted.duns_number).not.toBe('123456789');
      expect(encrypted.sam_uei).not.toBe('ABCDEFG12345');

      // Decrypt and verify
      const decrypted = await service.decryptFields(
        encrypted,
        ['ein', 'duns_number', 'sam_uei'],
        'organizations'
      );

      expect(decrypted.ein).toBe('12-3456789');
      expect(decrypted.duns_number).toBe('123456789');
      expect(decrypted.sam_uei).toBe('ABCDEFG12345');
    });

    it('should handle webhook configuration encryption', async () => {
      const webhook = {
        id: 'webhook-1',
        url: 'https://example.com/webhook',
        secret: 'whsec_super_secret_key',
        events: ['application.submitted'],
      };

      const encrypted = await service.encryptFields(webhook, ['secret'], 'webhook_configs');
      expect(encrypted.secret).not.toBe('whsec_super_secret_key');

      const decrypted = await service.decryptFields(encrypted, ['secret'], 'webhook_configs');
      expect(decrypted.secret).toBe('whsec_super_secret_key');
    });

    it('should handle API key encryption', async () => {
      const apiKey = {
        id: 'key-1',
        key_prefix: 'ie_live_',
        key_hash: 'sha256_hash_of_key',
        scopes: ['read', 'write'],
      };

      const encrypted = await service.encryptFields(apiKey, ['key_hash'], 'api_keys');
      expect(encrypted.key_hash).not.toBe('sha256_hash_of_key');

      const decrypted = await service.decryptFields(encrypted, ['key_hash'], 'api_keys');
      expect(decrypted.key_hash).toBe('sha256_hash_of_key');
    });
  });
});
