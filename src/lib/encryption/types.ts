/**
 * IncentEdge Encryption Library - Type Definitions
 *
 * Provides type-safe encryption for sensitive data at rest.
 * Uses AES-256-GCM for authenticated encryption.
 *
 * @module encryption/types
 */

/**
 * Encrypted data payload structure
 * Format: base64(version:keyId:iv:authTag:ciphertext)
 */
export interface EncryptedPayload {
  /** Encryption version (currently v1) */
  version: string;
  /** Key identifier for rotation support */
  keyId: string;
  /** Initialization vector (12 bytes for GCM) */
  iv: string;
  /** Authentication tag (16 bytes) */
  authTag: string;
  /** Encrypted ciphertext */
  ciphertext: string;
}

/**
 * Encryption key metadata
 */
export interface EncryptionKey {
  /** Unique identifier for this key */
  id: string;
  /** The actual encryption key (32 bytes for AES-256) */
  key: Buffer;
  /** When this key was created */
  createdAt: Date;
  /** Whether this is the active key for new encryptions */
  isActive: boolean;
  /** Optional: When this key was rotated out */
  rotatedAt?: Date;
  /** Optional: KMS key ARN if using AWS KMS */
  kmsArn?: string;
}

/**
 * Key derivation configuration
 */
export interface KeyDerivationConfig {
  /** Master secret to derive keys from */
  masterSecret: string;
  /** Salt for key derivation (16 bytes minimum) */
  salt: string;
  /** Number of iterations for PBKDF2 (minimum 100,000) */
  iterations: number;
  /** Key length in bytes (32 for AES-256) */
  keyLength: number;
}

/**
 * AWS KMS configuration (optional)
 */
export interface KMSConfig {
  /** AWS region */
  region: string;
  /** KMS key ARN or alias */
  keyId: string;
  /** AWS access key ID */
  accessKeyId?: string;
  /** AWS secret access key */
  secretAccessKey?: string;
}

/**
 * Encryption service configuration
 */
export interface EncryptionConfig {
  /** Array of encryption keys (first active key used for encryption) */
  keys: EncryptionKey[];
  /** Optional KMS configuration for key management */
  kms?: KMSConfig;
  /** Whether to enable audit logging of encryption operations */
  enableAuditLog?: boolean;
  /** Maximum age of encrypted data before re-encryption (in days) */
  maxDataAge?: number;
}

/**
 * Encryption operation result
 */
export interface EncryptionResult {
  /** Success status */
  success: boolean;
  /** Encrypted data (if successful) */
  data?: string;
  /** Error message (if failed) */
  error?: string;
  /** Key ID used for encryption */
  keyId?: string;
}

/**
 * Decryption operation result
 */
export interface DecryptionResult {
  /** Success status */
  success: boolean;
  /** Decrypted plaintext (if successful) */
  data?: string;
  /** Error message (if failed) */
  error?: string;
  /** Key ID used for decryption */
  keyId?: string;
  /** Whether data should be re-encrypted with newer key */
  shouldReencrypt?: boolean;
}

/**
 * Fields that should be encrypted in the database
 */
export enum EncryptedField {
  // Organization sensitive data
  EIN = 'ein',
  DUNS_NUMBER = 'duns_number',
  SAM_UEI = 'sam_uei',

  // Stripe/payment data
  STRIPE_CUSTOMER_ID = 'stripe_customer_id',

  // API keys and secrets
  API_KEY = 'api_key',
  API_KEY_HASH = 'key_hash',
  WEBHOOK_SECRET = 'secret',

  // Contractor/compliance data
  CONTRACTOR_EIN = 'contractor_ein',

  // Custom encrypted fields
  CUSTOM_PII = 'custom_pii',
}

/**
 * Database table configuration for encrypted fields
 */
export interface TableEncryptionConfig {
  /** Database table name */
  table: string;
  /** Fields to encrypt in this table */
  fields: EncryptedField[];
  /** Whether to add encrypted_* columns or replace existing */
  mode: 'addColumn' | 'replace';
}

/**
 * Encryption audit log entry
 */
export interface EncryptionAuditLog {
  /** Timestamp of operation */
  timestamp: Date;
  /** Operation type */
  operation: 'encrypt' | 'decrypt' | 'reencrypt';
  /** Key ID used */
  keyId: string;
  /** Table/field being encrypted */
  context?: string;
  /** Success status */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

/**
 * Error types for encryption operations
 */
export class EncryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

export class DecryptionError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

export class KeyManagementError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'KeyManagementError';
  }
}
