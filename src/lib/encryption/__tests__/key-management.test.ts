/**
 * Tests for KeyManager - Key derivation and rotation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyManager, generateMasterSecret } from '../key-management';
import { EncryptionKey } from '../types';

describe('KeyManager', () => {
  let manager: KeyManager;

  beforeEach(() => {
    manager = new KeyManager();
    // Clear environment variables
    delete process.env.ENCRYPTION_MASTER_SECRET;
    delete process.env.ENCRYPTION_KEY_1;
  });

  describe('Key Derivation', () => {
    it('should derive key from master secret', async () => {
      const masterSecret = generateMasterSecret();
      const key = await manager.deriveKeyFromMasterSecret(masterSecret, 'test-key-1');

      expect(key.id).toBe('test-key-1');
      expect(key.key).toBeInstanceOf(Buffer);
      expect(key.key.length).toBe(32);
      expect(key.isActive).toBe(true);
      expect(key.createdAt).toBeInstanceOf(Date);
    });

    it('should produce consistent keys for same secret', async () => {
      const masterSecret = generateMasterSecret();
      const key1 = await manager.deriveKeyFromMasterSecret(masterSecret, 'test-key');
      const key2 = await manager.deriveKeyFromMasterSecret(masterSecret, 'test-key');

      expect(key1.key).toEqual(key2.key);
    });

    it('should produce different keys for different secrets', async () => {
      const secret1 = generateMasterSecret();
      const secret2 = generateMasterSecret();

      const key1 = await manager.deriveKeyFromMasterSecret(secret1, 'key-1');
      const key2 = await manager.deriveKeyFromMasterSecret(secret2, 'key-2');

      expect(key1.key).not.toEqual(key2.key);
    });

    it('should reject weak master secrets', async () => {
      const weakSecret = 'short';

      await expect(
        manager.deriveKeyFromMasterSecret(weakSecret, 'key-1')
      ).rejects.toThrow('Master secret must be at least 32 characters');
    });

    it('should generate unique key IDs automatically', async () => {
      const secret = generateMasterSecret();
      const key1 = await manager.deriveKeyFromMasterSecret(secret);
      const key2 = await manager.deriveKeyFromMasterSecret(secret);

      expect(key1.id).toBeDefined();
      expect(key2.id).toBeDefined();
      expect(key1.id).not.toBe(key2.id);
    });
  });

  describe('Random Key Generation', () => {
    it('should generate random keys', () => {
      const key1 = manager.generateRandomKey('random-1');
      const key2 = manager.generateRandomKey('random-2');

      expect(key1.id).toBe('random-1');
      expect(key2.id).toBe('random-2');
      expect(key1.key.length).toBe(32);
      expect(key2.key.length).toBe(32);
      expect(key1.key).not.toEqual(key2.key);
    });

    it('should generate unique IDs when not provided', () => {
      const key1 = manager.generateRandomKey();
      const key2 = manager.generateRandomKey();

      expect(key1.id).toBeDefined();
      expect(key2.id).toBeDefined();
      expect(key1.id).not.toBe(key2.id);
    });

    it('should mark new keys as active', () => {
      const key = manager.generateRandomKey('new-key');
      expect(key.isActive).toBe(true);
    });
  });

  describe('Key Rotation', () => {
    it('should rotate keys and mark old as inactive', async () => {
      const masterSecret = generateMasterSecret();
      const oldKey = await manager.deriveKeyFromMasterSecret(masterSecret, 'old-key');

      const rotatedKeys = await manager.rotateKey([oldKey], masterSecret);

      expect(rotatedKeys.length).toBe(2);
      expect(rotatedKeys[0].id).toBe('old-key');
      expect(rotatedKeys[0].isActive).toBe(false);
      expect(rotatedKeys[0].rotatedAt).toBeInstanceOf(Date);
      expect(rotatedKeys[1].isActive).toBe(true);
    });

    it('should keep old keys for decryption', async () => {
      const secret = generateMasterSecret();
      const key1 = await manager.deriveKeyFromMasterSecret(secret, 'key-1');
      const key2 = await manager.deriveKeyFromMasterSecret(secret, 'key-2');

      const rotated = await manager.rotateKey([key1, key2], secret);

      expect(rotated.length).toBe(3);
      expect(rotated[0].id).toBe('key-1');
      expect(rotated[1].id).toBe('key-2');
      expect(rotated[2].isActive).toBe(true);
    });

    it('should generate new key ID during rotation', async () => {
      const secret = generateMasterSecret();
      const oldKey = await manager.deriveKeyFromMasterSecret(secret, 'old');

      const rotated = await manager.rotateKey([oldKey], secret);

      expect(rotated[1].id).not.toBe('old');
      expect(rotated[1].id).toContain('key-v');
    });

    it('should rotate without master secret using random keys', async () => {
      const oldKey = manager.generateRandomKey('old');

      const rotated = await manager.rotateKey([oldKey]);

      expect(rotated.length).toBe(2);
      expect(rotated[0].isActive).toBe(false);
      expect(rotated[1].isActive).toBe(true);
    });
  });

  describe('Environment Initialization', () => {
    it('should load keys from ENCRYPTION_MASTER_SECRET', async () => {
      const secret = generateMasterSecret();
      process.env.ENCRYPTION_MASTER_SECRET = secret;

      const keys = await manager.initializeFromEnv();

      expect(keys.length).toBe(1);
      expect(keys[0].key.length).toBe(32);
      expect(keys[0].isActive).toBe(true);
    });

    it('should load direct keys from environment', async () => {
      const key = Buffer.alloc(32);
      key.fill(0xab);

      process.env.ENCRYPTION_KEY_1 = key.toString('hex');
      process.env.ENCRYPTION_KEY_ID_1 = 'env-key-1';

      const keys = await manager.initializeFromEnv();

      expect(keys.length).toBe(1);
      expect(keys[0].id).toBe('env-key-1');
      expect(keys[0].key).toEqual(key);
    });

    it('should load multiple direct keys', async () => {
      const key1 = Buffer.alloc(32).fill(0x01);
      const key2 = Buffer.alloc(32).fill(0x02);

      process.env.ENCRYPTION_KEY_1 = key1.toString('hex');
      process.env.ENCRYPTION_KEY_ID_1 = 'key-1';
      process.env.ENCRYPTION_KEY_2 = key2.toString('hex');
      process.env.ENCRYPTION_KEY_ID_2 = 'key-2';

      const keys = await manager.initializeFromEnv();

      expect(keys.length).toBe(2);
      expect(keys[0].id).toBe('key-1');
      expect(keys[1].id).toBe('key-2');
    });

    it('should set active key from ENCRYPTION_ACTIVE_KEY', async () => {
      const key1 = Buffer.alloc(32).fill(0x01);
      const key2 = Buffer.alloc(32).fill(0x02);

      process.env.ENCRYPTION_KEY_1 = key1.toString('hex');
      process.env.ENCRYPTION_KEY_ID_1 = 'key-1';
      process.env.ENCRYPTION_KEY_2 = key2.toString('hex');
      process.env.ENCRYPTION_KEY_ID_2 = 'key-2';
      process.env.ENCRYPTION_ACTIVE_KEY = 'key-1';

      const keys = await manager.initializeFromEnv();

      expect(keys[0].isActive).toBe(true);
      expect(keys[1].isActive).toBe(false);
    });

    it('should use last key as active by default', async () => {
      const key1 = Buffer.alloc(32).fill(0x01);
      const key2 = Buffer.alloc(32).fill(0x02);

      process.env.ENCRYPTION_KEY_1 = key1.toString('hex');
      process.env.ENCRYPTION_KEY_2 = key2.toString('hex');

      const keys = await manager.initializeFromEnv();

      expect(keys[0].isActive).toBe(false);
      expect(keys[1].isActive).toBe(true);
    });

    it('should throw if no keys configured', async () => {
      await expect(manager.initializeFromEnv()).rejects.toThrow('No encryption keys found');
    });

    it('should accept base64 encoded keys', async () => {
      const key = Buffer.alloc(32).fill(0xcd);
      process.env.ENCRYPTION_KEY_1 = key.toString('base64');

      const keys = await manager.initializeFromEnv();

      expect(keys[0].key).toEqual(key);
    });
  });

  describe('Key Validation', () => {
    it('should validate correct keys', () => {
      const validKeys: EncryptionKey[] = [
        {
          id: 'key-1',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: true,
        },
      ];

      expect(() => manager.validateKeys(validKeys)).not.toThrow();
    });

    it('should reject empty key array', () => {
      expect(() => manager.validateKeys([])).toThrow('No keys provided');
    });

    it('should reject no active key', () => {
      const keys: EncryptionKey[] = [
        {
          id: 'key-1',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: false,
        },
      ];

      expect(() => manager.validateKeys(keys)).toThrow('No active key found');
    });

    it('should reject multiple active keys', () => {
      const keys: EncryptionKey[] = [
        {
          id: 'key-1',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: true,
        },
        {
          id: 'key-2',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: true,
        },
      ];

      expect(() => manager.validateKeys(keys)).toThrow('Multiple active keys found');
    });

    it('should reject missing key ID', () => {
      const keys: EncryptionKey[] = [
        {
          id: '',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: true,
        },
      ];

      expect(() => manager.validateKeys(keys)).toThrow('Key ID required');
    });

    it('should reject wrong key length', () => {
      const keys: EncryptionKey[] = [
        {
          id: 'short-key',
          key: Buffer.alloc(16),
          createdAt: new Date(),
          isActive: true,
        },
      ];

      expect(() => manager.validateKeys(keys)).toThrow('Key must be 32 bytes');
    });

    it('should reject duplicate key IDs', () => {
      const keys: EncryptionKey[] = [
        {
          id: 'key-1',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: false,
        },
        {
          id: 'key-1',
          key: Buffer.alloc(32),
          createdAt: new Date(),
          isActive: true,
        },
      ];

      expect(() => manager.validateKeys(keys)).toThrow('Duplicate key IDs found');
    });
  });

  describe('Key Export', () => {
    it('should export keys to environment format', () => {
      const key1 = Buffer.alloc(32).fill(0x01);
      const key2 = Buffer.alloc(32).fill(0x02);

      const keys: EncryptionKey[] = [
        {
          id: 'key-1',
          key: key1,
          createdAt: new Date(),
          isActive: false,
        },
        {
          id: 'key-2',
          key: key2,
          createdAt: new Date(),
          isActive: true,
        },
      ];

      const env = manager.exportKeysToEnv(keys);

      expect(env.ENCRYPTION_KEY_1).toBe(key1.toString('hex'));
      expect(env.ENCRYPTION_KEY_ID_1).toBe('key-1');
      expect(env.ENCRYPTION_KEY_2).toBe(key2.toString('hex'));
      expect(env.ENCRYPTION_KEY_ID_2).toBe('key-2');
      expect(env.ENCRYPTION_ACTIVE_KEY).toBe('key-2');
    });
  });

  describe('Master Secret Generation', () => {
    it('should generate random master secrets', () => {
      const secret1 = generateMasterSecret();
      const secret2 = generateMasterSecret();

      expect(secret1.length).toBe(128); // 64 bytes * 2 (hex)
      expect(secret2.length).toBe(128);
      expect(secret1).not.toBe(secret2);
    });

    it('should generate custom length secrets', () => {
      const secret = generateMasterSecret(32);
      expect(secret.length).toBe(64); // 32 bytes * 2 (hex)
    });

    it('should only contain hex characters', () => {
      const secret = generateMasterSecret();
      expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
    });
  });

  describe('KMS Integration', () => {
    it('should throw not implemented error for KMS', async () => {
      const kmsManager = new KeyManager({
        region: 'us-east-1',
        keyId: 'test-key-arn',
      });

      await expect(kmsManager.generateKMSKey()).rejects.toThrow('KMS integration not yet implemented');
    });
  });
});
