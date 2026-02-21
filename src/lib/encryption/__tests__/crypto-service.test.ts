/**
 * Tests for CryptoService - AES-256-GCM encryption
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CryptoService, generateRandomKey, constantTimeCompare, zeroizeBuffer } from '../crypto-service';
import { EncryptionKey, EncryptionConfig } from '../types';

describe('CryptoService', () => {
  let service: CryptoService;
  let testKey: EncryptionKey;

  beforeEach(() => {
    // Generate test key
    testKey = {
      id: 'test-key-1',
      key: generateRandomKey(),
      createdAt: new Date(),
      isActive: true,
    };

    const config: EncryptionConfig = {
      keys: [testKey],
      enableAuditLog: true,
    };

    service = new CryptoService(config);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('Encryption', () => {
    it('should encrypt plaintext successfully', async () => {
      const plaintext = 'sensitive-data-12345';
      const result = await service.encrypt(plaintext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).not.toBe(plaintext);
      expect(result.keyId).toBe('test-key-1');
    });

    it('should reject empty plaintext', async () => {
      const result = await service.encrypt('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should produce different ciphertexts for same plaintext', async () => {
      const plaintext = 'test-data';
      const result1 = await service.encrypt(plaintext);
      const result2 = await service.encrypt(plaintext);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data).not.toBe(result2.data); // Different IVs
    });

    it('should handle special characters', async () => {
      const plaintext = '🔒 Special chars: <>&"\'\\n\\t';
      const result = await service.encrypt(plaintext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle long strings', async () => {
      const plaintext = 'A'.repeat(10000);
      const result = await service.encrypt(plaintext);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Decryption', () => {
    it('should decrypt ciphertext successfully', async () => {
      const plaintext = 'secret-message';
      const encrypted = await service.encrypt(plaintext);
      const decrypted = await service.decrypt(encrypted.data!);

      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(plaintext);
    });

    it('should reject empty ciphertext', async () => {
      const result = await service.decrypt('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid ciphertext', async () => {
      const result = await service.decrypt('invalid-base64-data');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject tampered ciphertext', async () => {
      const plaintext = 'original-data';
      const encrypted = await service.encrypt(plaintext);

      // Tamper with the ciphertext
      const tampered = encrypted.data!.slice(0, -5) + 'XXXXX';
      const decrypted = await service.decrypt(tampered);

      expect(decrypted.success).toBe(false);
      expect(decrypted.error).toBeDefined();
    });

    it('should handle round-trip encryption/decryption', async () => {
      const testData = [
        'simple-text',
        '12-3456789',
        'user@example.com',
        'Multi\nLine\nText',
        '{"json": "data"}',
      ];

      for (const plaintext of testData) {
        const encrypted = await service.encrypt(plaintext);
        const decrypted = await service.decrypt(encrypted.data!);

        expect(decrypted.success).toBe(true);
        expect(decrypted.data).toBe(plaintext);
      }
    });
  });

  describe('Key Rotation', () => {
    it('should decrypt data encrypted with old key', async () => {
      const oldKey: EncryptionKey = {
        id: 'old-key',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: false,
        rotatedAt: new Date(),
      };

      const newKey: EncryptionKey = {
        id: 'new-key',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };

      // Create service with old key, encrypt data
      const oldService = new CryptoService({ keys: [oldKey] });
      const plaintext = 'old-encrypted-data';
      const encrypted = await oldService.encrypt(plaintext);
      oldService.destroy();

      // Create service with both keys, decrypt with old key
      const newService = new CryptoService({ keys: [oldKey, newKey] });
      const decrypted = await newService.decrypt(encrypted.data!);

      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(plaintext);
      expect(decrypted.keyId).toBe('old-key');
      expect(decrypted.shouldReencrypt).toBe(true);

      newService.destroy();
    });

    it('should use active key for encryption', async () => {
      const key1: EncryptionKey = {
        id: 'key-1',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: false,
      };

      const key2: EncryptionKey = {
        id: 'key-2',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };

      const multiKeyService = new CryptoService({ keys: [key1, key2] });
      const encrypted = await multiKeyService.encrypt('test');

      expect(encrypted.success).toBe(true);
      expect(encrypted.keyId).toBe('key-2'); // Active key

      multiKeyService.destroy();
    });
  });

  describe('Re-encryption', () => {
    it('should re-encrypt with active key', async () => {
      const oldKey: EncryptionKey = {
        id: 'old-key',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: false,
      };

      const newKey: EncryptionKey = {
        id: 'new-key',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };

      // Encrypt with old key
      const oldService = new CryptoService({ keys: [oldKey] });
      const plaintext = 'data-to-reencrypt';
      const oldEncrypted = await oldService.encrypt(plaintext);
      oldService.destroy();

      // Re-encrypt with new key
      const newService = new CryptoService({ keys: [oldKey, newKey] });
      const reencrypted = await newService.reencrypt(oldEncrypted.data!);

      expect(reencrypted.success).toBe(true);
      expect(reencrypted.keyId).toBe('new-key');
      expect(reencrypted.data).not.toBe(oldEncrypted.data);

      // Verify decryption works
      const decrypted = await newService.decrypt(reencrypted.data!);
      expect(decrypted.success).toBe(true);
      expect(decrypted.data).toBe(plaintext);

      newService.destroy();
    });
  });

  describe('Audit Logging', () => {
    it('should log encryption operations', async () => {
      await service.encrypt('test-data-1');
      await service.encrypt('test-data-2');

      const log = service.getAuditLog(10);

      expect(log.length).toBe(2);
      expect(log[0].operation).toBe('encrypt');
      expect(log[0].success).toBe(true);
    });

    it('should log decryption operations', async () => {
      const encrypted = await service.encrypt('test-data');
      await service.decrypt(encrypted.data!);

      const log = service.getAuditLog(10);

      expect(log.length).toBe(2);
      expect(log[0].operation).toBe('encrypt');
      expect(log[1].operation).toBe('decrypt');
    });

    it('should log failed operations', async () => {
      await service.decrypt('invalid-data');

      const log = service.getAuditLog(10);

      expect(log.length).toBe(1);
      expect(log[0].operation).toBe('decrypt');
      expect(log[0].success).toBe(false);
      expect(log[0].error).toBeDefined();
    });

    it('should limit audit log size', async () => {
      // Generate many operations
      for (let i = 0; i < 1500; i++) {
        await service.encrypt(`test-${i}`);
      }

      const log = service.getAuditLog(2000);
      expect(log.length).toBeLessThanOrEqual(1000); // Max 1000 entries
    });
  });

  describe('Error Handling', () => {
    it('should handle missing active key', () => {
      const inactiveKey: EncryptionKey = {
        id: 'inactive',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: false,
      };

      expect(() => {
        new CryptoService({ keys: [inactiveKey] });
      }).toThrow('No active encryption key found');
    });

    it('should handle multiple active keys', () => {
      const key1: EncryptionKey = {
        id: 'key-1',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };

      const key2: EncryptionKey = {
        id: 'key-2',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };

      expect(() => {
        new CryptoService({ keys: [key1, key2] });
      }).toThrow('Multiple active keys found');
    });

    it('should handle wrong key length', () => {
      const shortKey: EncryptionKey = {
        id: 'short-key',
        key: Buffer.from('too-short', 'utf8'),
        createdAt: new Date(),
        isActive: true,
      };

      expect(() => {
        new CryptoService({ keys: [shortKey] });
      }).toThrow('Key must be 32 bytes');
    });

    it('should handle missing key for decryption', async () => {
      const encrypted = await service.encrypt('test');

      // Create new service without the encryption key
      const newKey: EncryptionKey = {
        id: 'different-key',
        key: generateRandomKey(),
        createdAt: new Date(),
        isActive: true,
      };
      const newService = new CryptoService({ keys: [newKey] });

      const result = await newService.decrypt(encrypted.data!);

      expect(result.success).toBe(false);
      expect(result.error).toContain('key not found');

      newService.destroy();
    });
  });

  describe('Utility Functions', () => {
    it('should perform constant-time comparison', () => {
      const str1 = 'test-string';
      const str2 = 'test-string';
      const str3 = 'different';

      expect(constantTimeCompare(str1, str2)).toBe(true);
      expect(constantTimeCompare(str1, str3)).toBe(false);
      expect(constantTimeCompare(str1, str1.slice(0, -1))).toBe(false);
    });

    it('should generate random keys', () => {
      const key1 = generateRandomKey();
      const key2 = generateRandomKey();

      expect(key1.length).toBe(32);
      expect(key2.length).toBe(32);
      expect(key1).not.toEqual(key2); // Different random values
    });

    it('should zeroize buffers', () => {
      const buffer = Buffer.from('sensitive-data');
      zeroizeBuffer(buffer);

      expect(buffer.every((byte) => byte === 0)).toBe(true);
    });
  });

  describe('Security', () => {
    it('should not leak plaintext in error messages', async () => {
      const sensitiveData = 'SSN-123-45-6789';
      const encrypted = await service.encrypt(sensitiveData);

      // Tamper with data to cause decryption error
      const tampered = encrypted.data!.slice(0, -10) + 'tampered!!';
      const result = await service.decrypt(tampered);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain(sensitiveData);
    });

    it('should clean up keys on destroy', () => {
      const key = generateRandomKey();
      const testService = new CryptoService({
        keys: [
          {
            id: 'cleanup-test',
            key,
            createdAt: new Date(),
            isActive: true,
          },
        ],
      });

      testService.destroy();

      // Key should be zeroized
      expect(key.every((byte) => byte === 0)).toBe(true);
    });
  });
});
