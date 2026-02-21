/**
 * IncentEdge Encryption Library - Key Management
 *
 * Secure key derivation, rotation, and management for encryption keys.
 * Supports both environment variable keys and AWS KMS integration.
 *
 * Security Features:
 * - PBKDF2 key derivation from master secrets
 * - Automatic key rotation with backward compatibility
 * - AWS KMS integration for enterprise deployments
 * - Key version management
 * - Secure key storage and retrieval
 *
 * @module encryption/key-management
 */

import crypto from 'crypto';
import {
  EncryptionKey,
  KeyDerivationConfig,
  KMSConfig,
  KeyManagementError,
} from './types';

/**
 * Key Manager for encryption key lifecycle
 *
 * Handles:
 * - Key generation and derivation
 * - Key rotation
 * - AWS KMS integration
 * - Key storage and retrieval
 *
 * @example
 * ```typescript
 * const manager = new KeyManager();
 * const keys = await manager.initializeFromEnv();
 * const newKey = await manager.rotateKey(keys);
 * ```
 */
export class KeyManager {
  private static readonly DEFAULT_ITERATIONS = 100000;
  private static readonly DEFAULT_KEY_LENGTH = 32; // AES-256
  private static readonly DEFAULT_SALT_LENGTH = 16;

  private kmsConfig?: KMSConfig;

  constructor(kmsConfig?: KMSConfig) {
    this.kmsConfig = kmsConfig;
  }

  /**
   * Initialize encryption keys from environment variables
   *
   * Environment variables:
   * - ENCRYPTION_MASTER_SECRET: Master secret for key derivation
   * - ENCRYPTION_KEY_1, ENCRYPTION_KEY_2, etc.: Direct key values
   * - ENCRYPTION_ACTIVE_KEY: ID of the active key (default: latest)
   *
   * @returns Array of encryption keys
   */
  async initializeFromEnv(): Promise<EncryptionKey[]> {
    const keys: EncryptionKey[] = [];

    // Method 1: Derive from master secret (recommended)
    const masterSecret = process.env.ENCRYPTION_MASTER_SECRET;
    if (masterSecret) {
      const derivedKey = await this.deriveKeyFromMasterSecret(masterSecret);
      keys.push(derivedKey);
    }

    // Method 2: Load direct keys (for rotation/backward compatibility)
    let keyIndex = 1;
    while (true) {
      const keyValue = process.env[`ENCRYPTION_KEY_${keyIndex}`];
      if (!keyValue) break;

      const keyId = process.env[`ENCRYPTION_KEY_ID_${keyIndex}`] || `key-${keyIndex}`;
      const key = this.parseKeyValue(keyValue, keyId);
      keys.push(key);

      keyIndex++;
    }

    if (keys.length === 0) {
      throw new KeyManagementError(
        'No encryption keys found. Set ENCRYPTION_MASTER_SECRET or ENCRYPTION_KEY_1',
        'NO_KEYS_CONFIGURED'
      );
    }

    // Determine active key
    const activeKeyId = process.env.ENCRYPTION_ACTIVE_KEY || keys[keys.length - 1].id;
    keys.forEach((key) => {
      key.isActive = key.id === activeKeyId;
    });

    return keys;
  }

  /**
   * Derive encryption key from master secret using PBKDF2
   *
   * @param masterSecret - Master secret string
   * @param keyId - Optional key identifier
   * @param salt - Optional salt (will be derived from master secret if not provided)
   * @returns Derived encryption key
   */
  async deriveKeyFromMasterSecret(
    masterSecret: string,
    keyId?: string,
    salt?: string
  ): Promise<EncryptionKey> {
    if (!masterSecret || masterSecret.length < 32) {
      throw new KeyManagementError(
        'Master secret must be at least 32 characters',
        'WEAK_MASTER_SECRET'
      );
    }

    // Generate or use provided salt
    const saltBuffer = salt
      ? Buffer.from(salt, 'hex')
      : this.deriveSaltFromSecret(masterSecret);

    // Derive key using PBKDF2
    const keyBuffer = await this.pbkdf2(
      masterSecret,
      saltBuffer,
      KeyManager.DEFAULT_ITERATIONS,
      KeyManager.DEFAULT_KEY_LENGTH
    );

    return {
      id: keyId || this.generateKeyId(),
      key: keyBuffer,
      createdAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Derive multiple keys with rotation support
   *
   * Creates new key while keeping old keys for decryption
   *
   * @param currentKeys - Existing encryption keys
   * @param masterSecret - Master secret for new key
   * @returns Updated key array with new active key
   */
  async rotateKey(
    currentKeys: EncryptionKey[],
    masterSecret?: string
  ): Promise<EncryptionKey[]> {
    // Mark all existing keys as inactive
    const rotatedKeys = currentKeys.map((key) => ({
      ...key,
      isActive: false,
      rotatedAt: key.isActive ? new Date() : key.rotatedAt,
    }));

    // Generate new key
    let newKey: EncryptionKey;
    if (masterSecret) {
      // Derive new key from master secret with rotation counter
      const rotationCount = currentKeys.length;
      const keyId = `key-v${rotationCount + 1}`;
      newKey = await this.deriveKeyFromMasterSecret(masterSecret, keyId);
    } else if (this.kmsConfig) {
      // Generate new key using KMS
      newKey = await this.generateKMSKey();
    } else {
      // Generate random key
      newKey = this.generateRandomKey();
    }

    return [...rotatedKeys, newKey];
  }

  /**
   * Generate a cryptographically random encryption key
   *
   * @param keyId - Optional key identifier
   * @returns New encryption key
   */
  generateRandomKey(keyId?: string): EncryptionKey {
    return {
      id: keyId || this.generateKeyId(),
      key: crypto.randomBytes(KeyManager.DEFAULT_KEY_LENGTH),
      createdAt: new Date(),
      isActive: true,
    };
  }

  /**
   * Generate encryption key using AWS KMS
   *
   * @returns KMS-backed encryption key
   */
  async generateKMSKey(): Promise<EncryptionKey> {
    if (!this.kmsConfig) {
      throw new KeyManagementError('KMS not configured', 'KMS_NOT_CONFIGURED');
    }

    // Note: This is a placeholder for actual AWS KMS integration
    // In production, you would:
    // 1. Use AWS SDK to generate data key
    // 2. Store encrypted key in KMS
    // 3. Return plaintext key for use
    //
    // Example:
    // const kms = new AWS.KMS({ region: this.kmsConfig.region });
    // const { Plaintext, CiphertextBlob } = await kms.generateDataKey({
    //   KeyId: this.kmsConfig.keyId,
    //   KeySpec: 'AES_256'
    // }).promise();

    throw new KeyManagementError(
      'KMS integration not yet implemented - use ENCRYPTION_MASTER_SECRET instead',
      'KMS_NOT_IMPLEMENTED'
    );
  }

  /**
   * Export keys to environment variable format
   *
   * WARNING: Handle with extreme care - these are unencrypted keys
   *
   * @param keys - Encryption keys to export
   * @returns Object with environment variable assignments
   */
  exportKeysToEnv(keys: EncryptionKey[]): Record<string, string> {
    const env: Record<string, string> = {};

    keys.forEach((key, index) => {
      const keyNum = index + 1;
      env[`ENCRYPTION_KEY_${keyNum}`] = key.key.toString('hex');
      env[`ENCRYPTION_KEY_ID_${keyNum}`] = key.id;

      if (key.isActive) {
        env.ENCRYPTION_ACTIVE_KEY = key.id;
      }
    });

    return env;
  }

  /**
   * Validate key strength and configuration
   *
   * @param keys - Keys to validate
   * @throws KeyManagementError if validation fails
   */
  validateKeys(keys: EncryptionKey[]): void {
    if (keys.length === 0) {
      throw new KeyManagementError('No keys provided', 'NO_KEYS');
    }

    const activeKeys = keys.filter((k) => k.isActive);
    if (activeKeys.length === 0) {
      throw new KeyManagementError('No active key found', 'NO_ACTIVE_KEY');
    }

    if (activeKeys.length > 1) {
      throw new KeyManagementError('Multiple active keys found', 'MULTIPLE_ACTIVE_KEYS');
    }

    for (const key of keys) {
      if (!key.id || key.id.length === 0) {
        throw new KeyManagementError('Key ID required', 'MISSING_KEY_ID');
      }

      if (!Buffer.isBuffer(key.key)) {
        throw new KeyManagementError('Key must be a Buffer', 'INVALID_KEY_TYPE');
      }

      if (key.key.length !== KeyManager.DEFAULT_KEY_LENGTH) {
        throw new KeyManagementError(
          `Key must be ${KeyManager.DEFAULT_KEY_LENGTH} bytes`,
          'INVALID_KEY_LENGTH'
        );
      }
    }

    // Check for duplicate key IDs
    const keyIds = new Set(keys.map((k) => k.id));
    if (keyIds.size !== keys.length) {
      throw new KeyManagementError('Duplicate key IDs found', 'DUPLICATE_KEY_IDS');
    }
  }

  /**
   * Parse key value from string (hex or base64)
   */
  private parseKeyValue(value: string, keyId: string): EncryptionKey {
    let keyBuffer: Buffer;

    // Try hex first
    if (/^[0-9a-fA-F]+$/.test(value)) {
      keyBuffer = Buffer.from(value, 'hex');
    } else {
      // Try base64
      keyBuffer = Buffer.from(value, 'base64');
    }

    if (keyBuffer.length !== KeyManager.DEFAULT_KEY_LENGTH) {
      throw new KeyManagementError(
        `Key ${keyId} must be ${KeyManager.DEFAULT_KEY_LENGTH} bytes (got ${keyBuffer.length})`,
        'INVALID_KEY_LENGTH'
      );
    }

    return {
      id: keyId,
      key: keyBuffer,
      createdAt: new Date(),
      isActive: false, // Will be set by caller
    };
  }

  /**
   * Derive deterministic salt from master secret
   */
  private deriveSaltFromSecret(masterSecret: string): Buffer {
    // Use HMAC to derive salt from master secret
    // This ensures the salt is deterministic but unpredictable
    const hmac = crypto.createHmac('sha256', 'incentedge-salt-derivation');
    hmac.update(masterSecret);
    return hmac.digest().slice(0, KeyManager.DEFAULT_SALT_LENGTH);
  }

  /**
   * PBKDF2 key derivation
   */
  private pbkdf2(
    password: string,
    salt: Buffer,
    iterations: number,
    keyLength: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
        if (err) {
          reject(new KeyManagementError('Key derivation failed', 'DERIVATION_ERROR'));
        } else {
          resolve(derivedKey);
        }
      });
    });
  }

  /**
   * Generate unique key identifier
   */
  private generateKeyId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `key-${timestamp}-${random}`;
  }
}

/**
 * Singleton instance for global key management
 */
let keyManagerInstance: KeyManager | null = null;

/**
 * Get or create the global key manager instance
 *
 * @param kmsConfig - Optional KMS configuration
 * @returns Global key manager
 */
export function getKeyManager(kmsConfig?: KMSConfig): KeyManager {
  if (!keyManagerInstance) {
    keyManagerInstance = new KeyManager(kmsConfig);
  }
  return keyManagerInstance;
}

/**
 * Initialize encryption keys from environment
 * Convenience function for common use case
 *
 * @returns Promise resolving to encryption keys
 */
export async function initializeEncryptionKeys(): Promise<EncryptionKey[]> {
  const manager = getKeyManager();
  return manager.initializeFromEnv();
}

/**
 * Generate a new master secret for key derivation
 * Use this to create initial ENCRYPTION_MASTER_SECRET value
 *
 * @param length - Secret length in bytes (default 64)
 * @returns Hex-encoded master secret
 */
export function generateMasterSecret(length: number = 64): string {
  const secret = crypto.randomBytes(length);
  return secret.toString('hex');
}

/**
 * Rotate encryption keys
 * Convenience function for key rotation
 *
 * @param currentKeys - Current encryption keys
 * @returns Promise resolving to rotated keys
 */
export async function rotateEncryptionKeys(
  currentKeys: EncryptionKey[]
): Promise<EncryptionKey[]> {
  const manager = getKeyManager();
  const masterSecret = process.env.ENCRYPTION_MASTER_SECRET;

  if (!masterSecret) {
    throw new KeyManagementError(
      'ENCRYPTION_MASTER_SECRET required for key rotation',
      'NO_MASTER_SECRET'
    );
  }

  return manager.rotateKey(currentKeys, masterSecret);
}
