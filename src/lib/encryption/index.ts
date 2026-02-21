/**
 * IncentEdge Encryption Library
 *
 * Production-ready AES-256-GCM encryption for data at rest.
 *
 * @module encryption
 */

// Core services
export { CryptoService, constantTimeCompare, zeroizeBuffer, generateRandomKey } from './crypto-service';
export { KeyManager, getKeyManager, initializeEncryptionKeys, generateMasterSecret, rotateEncryptionKeys } from './key-management';
export {
  FieldEncryption,
  createEncryptionHooks,
  withEncryption,
  getEncryptedFields,
  isEncryptedField,
  encryptEIN,
  decryptEIN,
  encryptAPIKey,
  decryptAPIKey,
  encryptWebhookSecret,
  decryptWebhookSecret,
  TABLE_ENCRYPTION_CONFIG,
} from './field-encryption';

// Types
export type {
  EncryptedPayload,
  EncryptionKey,
  KeyDerivationConfig,
  KMSConfig,
  EncryptionConfig,
  EncryptionResult,
  DecryptionResult,
  TableEncryptionConfig,
  EncryptionAuditLog,
} from './types';

export type { DatabaseHooks } from './field-encryption';

export {
  EncryptedField,
  EncryptionError,
  DecryptionError,
  KeyManagementError,
} from './types';

/**
 * Quick start example:
 *
 * ```typescript
 * import { FieldEncryption, generateMasterSecret } from '@/lib/encryption';
 *
 * // 1. Generate master secret (once, store in .env)
 * console.log('ENCRYPTION_MASTER_SECRET=' + generateMasterSecret());
 *
 * // 2. Initialize encryption service
 * const encryption = await FieldEncryption.initialize();
 *
 * // 3. Encrypt PII
 * const encrypted = await encryption.encryptPII('12-3456789');
 *
 * // 4. Decrypt PII
 * const decrypted = await encryption.decryptPII(encrypted);
 * ```
 */
