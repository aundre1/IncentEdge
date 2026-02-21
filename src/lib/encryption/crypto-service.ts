/**
 * IncentEdge Encryption Library - Crypto Service
 *
 * Production-ready AES-256-GCM encryption service for data at rest.
 * Provides authenticated encryption with automatic key rotation support.
 *
 * Security Features:
 * - AES-256-GCM (authenticated encryption)
 * - Automatic IV generation (cryptographically random)
 * - Authentication tags prevent tampering
 * - Multiple key support for rotation
 * - Constant-time operations where possible
 * - Automatic key zeroization
 *
 * @module encryption/crypto-service
 */

import crypto from 'crypto';
import {
  EncryptedPayload,
  EncryptionKey,
  EncryptionConfig,
  EncryptionResult,
  DecryptionResult,
  EncryptionError,
  DecryptionError,
  EncryptionAuditLog,
} from './types';

/**
 * AES-256-GCM Encryption Service
 *
 * Thread-safe encryption service supporting:
 * - Encryption of sensitive data at rest
 * - Decryption with automatic key lookup
 * - Key rotation with backward compatibility
 * - Audit logging of operations
 *
 * @example
 * ```typescript
 * const service = new CryptoService(config);
 * const encrypted = await service.encrypt('sensitive-data');
 * const decrypted = await service.decrypt(encrypted.data);
 * ```
 */
export class CryptoService {
  private keys: Map<string, EncryptionKey>;
  private activeKey: EncryptionKey | null = null;
  private auditLog: EncryptionAuditLog[] = [];
  private config: EncryptionConfig;

  // Encryption constants
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly CURRENT_VERSION = 'v1';
  private static readonly ENCODING = 'base64' as const;

  constructor(config: EncryptionConfig) {
    this.config = config;
    this.keys = new Map();

    // Load and validate encryption keys
    if (!config.keys || config.keys.length === 0) {
      throw new EncryptionError('At least one encryption key required', 'NO_KEYS');
    }

    for (const key of config.keys) {
      this.validateKey(key);
      this.keys.set(key.id, key);
      if (key.isActive) {
        if (this.activeKey) {
          throw new EncryptionError('Multiple active keys found', 'MULTIPLE_ACTIVE_KEYS');
        }
        this.activeKey = key;
      }
    }

    if (!this.activeKey) {
      throw new EncryptionError('No active encryption key found', 'NO_ACTIVE_KEY');
    }
  }

  /**
   * Encrypt plaintext using AES-256-GCM
   *
   * @param plaintext - Data to encrypt
   * @param context - Optional context for audit logging
   * @returns Encrypted data in base64 format
   */
  async encrypt(plaintext: string, context?: string): Promise<EncryptionResult> {
    try {
      if (!plaintext || plaintext.length === 0) {
        return {
          success: false,
          error: 'Empty plaintext provided',
        };
      }

      if (!this.activeKey) {
        throw new EncryptionError('No active encryption key', 'NO_ACTIVE_KEY');
      }

      // Generate cryptographically random IV
      const iv = crypto.randomBytes(CryptoService.IV_LENGTH);

      // Create cipher with active key
      const cipher = crypto.createCipheriv(
        CryptoService.ALGORITHM,
        this.activeKey.key,
        iv,
        {
          authTagLength: CryptoService.AUTH_TAG_LENGTH,
        }
      );

      // Encrypt the plaintext
      let ciphertext = cipher.update(plaintext, 'utf8', CryptoService.ENCODING);
      ciphertext += cipher.final(CryptoService.ENCODING);

      // Get authentication tag
      const authTag = cipher.getAuthTag();

      // Construct encrypted payload
      const payload: EncryptedPayload = {
        version: CryptoService.CURRENT_VERSION,
        keyId: this.activeKey.id,
        iv: iv.toString(CryptoService.ENCODING),
        authTag: authTag.toString(CryptoService.ENCODING),
        ciphertext,
      };

      // Encode as single base64 string
      const encoded = this.encodePayload(payload);

      // Audit log
      if (this.config.enableAuditLog) {
        this.logOperation('encrypt', this.activeKey.id, context, true);
      }

      return {
        success: true,
        data: encoded,
        keyId: this.activeKey.id,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown encryption error';

      if (this.config.enableAuditLog) {
        this.logOperation('encrypt', this.activeKey?.id || 'unknown', context, false, errorMsg);
      }

      // Never log the plaintext in error messages
      console.error('Encryption failed:', errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Decrypt ciphertext using appropriate key
   *
   * @param encrypted - Encrypted data string
   * @param context - Optional context for audit logging
   * @returns Decrypted plaintext
   */
  async decrypt(encrypted: string, context?: string): Promise<DecryptionResult> {
    try {
      if (!encrypted || encrypted.length === 0) {
        return {
          success: false,
          error: 'Empty ciphertext provided',
        };
      }

      // Decode the payload
      const payload = this.decodePayload(encrypted);

      // Find the correct key
      const key = this.keys.get(payload.keyId);
      if (!key) {
        throw new DecryptionError(
          `Encryption key not found: ${payload.keyId}`,
          'KEY_NOT_FOUND'
        );
      }

      // Decode components
      const iv = Buffer.from(payload.iv, CryptoService.ENCODING);
      const authTag = Buffer.from(payload.authTag, CryptoService.ENCODING);

      // Create decipher
      const decipher = crypto.createDecipheriv(
        CryptoService.ALGORITHM,
        key.key,
        iv,
        {
          authTagLength: CryptoService.AUTH_TAG_LENGTH,
        }
      );

      // Set auth tag
      decipher.setAuthTag(authTag);

      // Decrypt the ciphertext
      let plaintext = decipher.update(payload.ciphertext, CryptoService.ENCODING, 'utf8');
      plaintext += decipher.final('utf8');

      // Check if data should be re-encrypted with active key
      const shouldReencrypt = !key.isActive && this.activeKey !== null;

      // Audit log
      if (this.config.enableAuditLog) {
        this.logOperation('decrypt', key.id, context, true);
      }

      return {
        success: true,
        data: plaintext,
        keyId: key.id,
        shouldReencrypt,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown decryption error';

      if (this.config.enableAuditLog) {
        this.logOperation('decrypt', 'unknown', context, false, errorMsg);
      }

      // Authentication failure indicates tampering
      if (errorMsg.includes('auth')) {
        console.error('SECURITY ALERT: Authentication tag verification failed - data may be tampered');
      }

      // Never log the ciphertext in error messages
      console.error('Decryption failed:', errorMsg);

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Re-encrypt data with current active key
   *
   * @param encrypted - Data encrypted with old key
   * @param context - Optional context for audit logging
   * @returns Re-encrypted data with active key
   */
  async reencrypt(encrypted: string, context?: string): Promise<EncryptionResult> {
    try {
      // First decrypt with old key
      const decrypted = await this.decrypt(encrypted, context);
      if (!decrypted.success || !decrypted.data) {
        return {
          success: false,
          error: `Decryption failed: ${decrypted.error}`,
        };
      }

      // Encrypt with active key
      const reencrypted = await this.encrypt(decrypted.data, context);

      // Audit log
      if (this.config.enableAuditLog && reencrypted.success) {
        this.logOperation('reencrypt', this.activeKey!.id, context, true);
      }

      return reencrypted;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown re-encryption error';
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Validate encryption key format and strength
   */
  private validateKey(key: EncryptionKey): void {
    if (!key.id || key.id.length === 0) {
      throw new EncryptionError('Key ID is required', 'INVALID_KEY_ID');
    }

    if (!Buffer.isBuffer(key.key)) {
      throw new EncryptionError('Key must be a Buffer', 'INVALID_KEY_TYPE');
    }

    if (key.key.length !== CryptoService.KEY_LENGTH) {
      throw new EncryptionError(
        `Key must be ${CryptoService.KEY_LENGTH} bytes for AES-256`,
        'INVALID_KEY_LENGTH'
      );
    }
  }

  /**
   * Encode encrypted payload to base64 string
   */
  private encodePayload(payload: EncryptedPayload): string {
    const json = JSON.stringify(payload);
    return Buffer.from(json, 'utf8').toString(CryptoService.ENCODING);
  }

  /**
   * Decode base64 string to encrypted payload
   */
  private decodePayload(encoded: string): EncryptedPayload {
    try {
      const json = Buffer.from(encoded, CryptoService.ENCODING).toString('utf8');
      const payload = JSON.parse(json) as EncryptedPayload;

      // Validate payload structure
      if (!payload.version || !payload.keyId || !payload.iv || !payload.authTag || !payload.ciphertext) {
        throw new DecryptionError('Invalid encrypted payload structure', 'INVALID_PAYLOAD');
      }

      if (payload.version !== CryptoService.CURRENT_VERSION) {
        throw new DecryptionError(
          `Unsupported encryption version: ${payload.version}`,
          'UNSUPPORTED_VERSION'
        );
      }

      return payload;
    } catch (error) {
      if (error instanceof DecryptionError) {
        throw error;
      }
      throw new DecryptionError('Failed to decode encrypted payload', 'DECODE_ERROR');
    }
  }

  /**
   * Log encryption operation for audit trail
   */
  private logOperation(
    operation: 'encrypt' | 'decrypt' | 'reencrypt',
    keyId: string,
    context?: string,
    success: boolean = true,
    error?: string
  ): void {
    const entry: EncryptionAuditLog = {
      timestamp: new Date(),
      operation,
      keyId,
      context,
      success,
      error,
    };

    this.auditLog.push(entry);

    // Keep last 1000 entries in memory
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get audit log entries
   */
  getAuditLog(limit: number = 100): EncryptionAuditLog[] {
    return this.auditLog.slice(-limit);
  }

  /**
   * Get active encryption key ID
   */
  getActiveKeyId(): string | null {
    return this.activeKey?.id || null;
  }

  /**
   * Get all available key IDs
   */
  getAvailableKeyIds(): string[] {
    return Array.from(this.keys.keys());
  }

  /**
   * Safely destroy the crypto service and zeroize keys
   */
  destroy(): void {
    // Zeroize all keys from memory
    for (const key of this.keys.values()) {
      if (Buffer.isBuffer(key.key)) {
        key.key.fill(0);
      }
    }

    this.keys.clear();
    this.activeKey = null;
    this.auditLog = [];
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Used for comparing authentication tags and secrets
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Safely zeroize a buffer from memory
 */
export function zeroizeBuffer(buffer: Buffer): void {
  if (Buffer.isBuffer(buffer)) {
    buffer.fill(0);
  }
}

/**
 * Generate a cryptographically random key
 *
 * @param length - Key length in bytes (default 32 for AES-256)
 * @returns Random key buffer
 */
export function generateRandomKey(length: number = 32): Buffer {
  return crypto.randomBytes(length);
}
