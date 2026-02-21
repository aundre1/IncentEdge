/**
 * IncentEdge Encryption Library - Field-Level Encryption
 *
 * Database field-level encryption helpers and middleware.
 * Provides transparent encryption/decryption for sensitive fields.
 *
 * Features:
 * - Simple encrypt/decrypt functions for PII
 * - Database hooks for automatic encryption
 * - Supabase middleware integration
 * - Batch encryption/decryption
 * - Column mapping for encrypted fields
 *
 * @module encryption/field-encryption
 */

import { CryptoService } from './crypto-service';
import { EncryptionKey, EncryptedField, TableEncryptionConfig } from './types';
import { initializeEncryptionKeys } from './key-management';

/**
 * Field-level encryption service
 *
 * Provides high-level API for encrypting specific fields in database records.
 *
 * @example
 * ```typescript
 * const service = await FieldEncryption.initialize();
 * const encrypted = await service.encryptPII('123-45-6789');
 * const decrypted = await service.decryptPII(encrypted);
 * ```
 */
export class FieldEncryption {
  private cryptoService: CryptoService;
  private static instance: FieldEncryption | null = null;

  private constructor(cryptoService: CryptoService) {
    this.cryptoService = cryptoService;
  }

  /**
   * Initialize the field encryption service
   *
   * @param keys - Optional encryption keys (will load from env if not provided)
   * @returns Initialized field encryption service
   */
  static async initialize(keys?: EncryptionKey[]): Promise<FieldEncryption> {
    if (!FieldEncryption.instance) {
      const encryptionKeys = keys || (await initializeEncryptionKeys());
      const cryptoService = new CryptoService({
        keys: encryptionKeys,
        enableAuditLog: true,
      });
      FieldEncryption.instance = new FieldEncryption(cryptoService);
    }
    return FieldEncryption.instance;
  }

  /**
   * Get singleton instance (must call initialize first)
   */
  static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      throw new Error('FieldEncryption not initialized. Call initialize() first.');
    }
    return FieldEncryption.instance;
  }

  /**
   * Encrypt PII data
   *
   * @param plaintext - Plaintext PII to encrypt
   * @param context - Optional context (e.g., 'organizations.ein')
   * @returns Encrypted ciphertext
   * @throws Error if encryption fails
   */
  async encryptPII(plaintext: string, context?: string): Promise<string> {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty value');
    }

    const result = await this.cryptoService.encrypt(plaintext, context);
    if (!result.success || !result.data) {
      throw new Error(`Encryption failed: ${result.error}`);
    }

    return result.data;
  }

  /**
   * Decrypt PII data
   *
   * @param ciphertext - Encrypted ciphertext
   * @param context - Optional context (e.g., 'organizations.ein')
   * @returns Decrypted plaintext
   * @throws Error if decryption fails
   */
  async decryptPII(ciphertext: string, context?: string): Promise<string> {
    if (!ciphertext) {
      throw new Error('Cannot decrypt empty value');
    }

    const result = await this.cryptoService.decrypt(ciphertext, context);
    if (!result.success || !result.data) {
      throw new Error(`Decryption failed: ${result.error}`);
    }

    // Re-encrypt if using old key
    if (result.shouldReencrypt) {
      console.warn(`Data encrypted with old key (${result.keyId}), consider re-encrypting`);
    }

    return result.data;
  }

  /**
   * Encrypt multiple fields in a record
   *
   * @param record - Database record
   * @param fields - Fields to encrypt
   * @param tableName - Table name for context
   * @returns Record with encrypted fields
   */
  async encryptFields<T extends Record<string, any>>(
    record: T,
    fields: string[],
    tableName?: string
  ): Promise<T> {
    const encrypted: Record<string, any> = { ...record };

    for (const field of fields) {
      if (record[field] !== null && record[field] !== undefined) {
        const context = tableName ? `${tableName}.${field}` : field;
        encrypted[field] = await this.encryptPII(String(record[field]), context);
      }
    }

    return encrypted as T;
  }

  /**
   * Decrypt multiple fields in a record
   *
   * @param record - Database record with encrypted fields
   * @param fields - Fields to decrypt
   * @param tableName - Table name for context
   * @returns Record with decrypted fields
   */
  async decryptFields<T extends Record<string, any>>(
    record: T,
    fields: string[],
    tableName?: string
  ): Promise<T> {
    const decrypted: Record<string, any> = { ...record };

    for (const field of fields) {
      if (record[field] !== null && record[field] !== undefined) {
        try {
          const context = tableName ? `${tableName}.${field}` : field;
          decrypted[field] = await this.decryptPII(String(record[field]), context);
        } catch (error) {
          // Log error but don't fail entire record
          console.error(`Failed to decrypt ${field}:`, error);
          decrypted[field] = null;
        }
      }
    }

    return decrypted as T;
  }

  /**
   * Batch encrypt multiple records
   *
   * @param records - Array of database records
   * @param fields - Fields to encrypt
   * @param tableName - Table name for context
   * @returns Array of records with encrypted fields
   */
  async encryptBatch<T extends Record<string, any>>(
    records: T[],
    fields: string[],
    tableName?: string
  ): Promise<T[]> {
    return Promise.all(
      records.map((record) => this.encryptFields(record, fields, tableName))
    );
  }

  /**
   * Batch decrypt multiple records
   *
   * @param records - Array of records with encrypted fields
   * @param fields - Fields to decrypt
   * @param tableName - Table name for context
   * @returns Array of records with decrypted fields
   */
  async decryptBatch<T extends Record<string, any>>(
    records: T[],
    fields: string[],
    tableName?: string
  ): Promise<T[]> {
    return Promise.all(
      records.map((record) => this.decryptFields(record, fields, tableName))
    );
  }

  /**
   * Get the underlying crypto service
   */
  getCryptoService(): CryptoService {
    return this.cryptoService;
  }

  /**
   * Clean up and destroy service
   */
  destroy(): void {
    this.cryptoService.destroy();
    FieldEncryption.instance = null;
  }
}

/**
 * Database hook configuration for automatic encryption
 */
export interface DatabaseHooks {
  /** Hook called before inserting data */
  beforeInsert?: <T extends Record<string, any>>(record: T, fields: string[]) => Promise<T>;
  /** Hook called after selecting data */
  afterSelect?: <T extends Record<string, any>>(record: T, fields: string[]) => Promise<T>;
  /** Hook called before updating data */
  beforeUpdate?: <T extends Record<string, any>>(record: T, fields: string[]) => Promise<T>;
}

/**
 * Create database hooks for automatic field encryption
 *
 * @param tableName - Database table name
 * @param encryptedFields - Fields that should be encrypted
 * @returns Database hooks object
 *
 * @example
 * ```typescript
 * const hooks = createEncryptionHooks('organizations', ['ein', 'duns_number']);
 *
 * // Before insert
 * const encryptedData = await hooks.beforeInsert(data, ['ein']);
 *
 * // After select
 * const decryptedData = await hooks.afterSelect(result, ['ein']);
 * ```
 */
export function createEncryptionHooks(
  tableName: string,
  encryptedFields: string[]
): DatabaseHooks {
  return {
    async beforeInsert<T extends Record<string, any>>(record: T, fields?: string[]): Promise<T> {
      const service = FieldEncryption.getInstance();
      const fieldsToEncrypt = fields || encryptedFields;
      return service.encryptFields(record, fieldsToEncrypt, tableName);
    },

    async afterSelect<T extends Record<string, any>>(record: T, fields?: string[]): Promise<T> {
      const service = FieldEncryption.getInstance();
      const fieldsToDecrypt = fields || encryptedFields;
      return service.decryptFields(record, fieldsToDecrypt, tableName);
    },

    async beforeUpdate<T extends Record<string, any>>(record: T, fields?: string[]): Promise<T> {
      const service = FieldEncryption.getInstance();
      const fieldsToEncrypt = fields || encryptedFields;
      return service.encryptFields(record, fieldsToEncrypt, tableName);
    },
  };
}

/**
 * Table encryption configurations
 * Maps table names to their encrypted fields
 */
export const TABLE_ENCRYPTION_CONFIG: Record<string, string[]> = {
  // Organizations table
  organizations: ['ein', 'duns_number', 'sam_uei'],

  // Webhook configurations (secret field)
  webhook_configs: ['secret'],

  // API keys (key_hash field)
  api_keys: ['key_hash'],

  // Compliance certifications (contractor EINs)
  prevailing_wage_certifications: ['contractor_ein'],
  apprenticeship_reports: ['contractor_ein'],
};

/**
 * Get encrypted fields for a table
 *
 * @param tableName - Database table name
 * @returns Array of field names that should be encrypted
 */
export function getEncryptedFields(tableName: string): string[] {
  return TABLE_ENCRYPTION_CONFIG[tableName] || [];
}

/**
 * Check if a field should be encrypted
 *
 * @param tableName - Database table name
 * @param fieldName - Field name
 * @returns True if field should be encrypted
 */
export function isEncryptedField(tableName: string, fieldName: string): boolean {
  const fields = getEncryptedFields(tableName);
  return fields.includes(fieldName);
}

/**
 * Supabase query wrapper with automatic encryption/decryption
 *
 * @example
 * ```typescript
 * // Insert with encryption
 * await withEncryption(supabase)
 *   .from('organizations')
 *   .insert({ name: 'Acme Corp', ein: '12-3456789' });
 *
 * // Select with decryption
 * const { data } = await withEncryption(supabase)
 *   .from('organizations')
 *   .select('*');
 * ```
 */
export function withEncryption(supabaseClient: any) {
  const originalFrom = supabaseClient.from.bind(supabaseClient);

  return {
    from(table: string) {
      const query = originalFrom(table);
      const encryptedFields = getEncryptedFields(table);

      if (encryptedFields.length === 0) {
        return query; // No encryption needed
      }

      const hooks = createEncryptionHooks(table, encryptedFields);

      // Wrap insert
      const originalInsert = query.insert.bind(query);
      query.insert = async (data: Record<string, any> | Record<string, any>[]) => {
        const encrypted = Array.isArray(data)
          ? await Promise.all(data.map((d: Record<string, any>) => hooks.beforeInsert!(d, encryptedFields)))
          : await hooks.beforeInsert!(data, encryptedFields);
        return originalInsert(encrypted);
      };

      // Wrap update
      const originalUpdate = query.update.bind(query);
      query.update = async (data: Record<string, any>) => {
        const encrypted = await hooks.beforeUpdate!(data, encryptedFields);
        return originalUpdate(encrypted);
      };

      // Wrap select (decrypt results)
      const originalThen = query.then?.bind(query);
      if (originalThen) {
        query.then = async (resolve: any, reject: any) => {
          try {
            const result = await originalThen();
            if (result.data && hooks.afterSelect) {
              const decrypted = Array.isArray(result.data)
                ? await Promise.all(result.data.map((d: Record<string, any>) => hooks.afterSelect!(d, encryptedFields)))
                : await hooks.afterSelect(result.data, encryptedFields);
              result.data = decrypted;
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
      }

      return query;
    },
  };
}

/**
 * Convenience functions for common encryption tasks
 */

/**
 * Encrypt an EIN (Employer Identification Number)
 */
export async function encryptEIN(ein: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.encryptPII(ein, 'ein');
}

/**
 * Decrypt an EIN (Employer Identification Number)
 */
export async function decryptEIN(encryptedEIN: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.decryptPII(encryptedEIN, 'ein');
}

/**
 * Encrypt an API key
 */
export async function encryptAPIKey(apiKey: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.encryptPII(apiKey, 'api_key');
}

/**
 * Decrypt an API key
 */
export async function decryptAPIKey(encryptedKey: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.decryptPII(encryptedKey, 'api_key');
}

/**
 * Encrypt a webhook secret
 */
export async function encryptWebhookSecret(secret: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.encryptPII(secret, 'webhook_secret');
}

/**
 * Decrypt a webhook secret
 */
export async function decryptWebhookSecret(encryptedSecret: string): Promise<string> {
  const service = FieldEncryption.getInstance();
  return service.decryptPII(encryptedSecret, 'webhook_secret');
}
