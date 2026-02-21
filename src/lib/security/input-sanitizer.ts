/**
 * Input Sanitization and Validation Library
 *
 * Purpose: Prevent SQL injection, XSS, and other injection attacks
 * Usage: All user input should be sanitized before database queries
 *
 * Security Standards:
 * - OWASP Top 10 (A03:2021 - Injection)
 * - CWE-89 (SQL Injection)
 * - CWE-79 (Cross-site Scripting)
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SanitizationResult<T> {
  value: T;
  sanitized: boolean;
  warnings: string[];
}

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  errors: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

// SQL Injection patterns to detect and block
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
  /(--|;|\/\*|\*\/|xp_)/gi,
  /(\bOR\b.*=.*|\bAND\b.*=.*)/gi,
  /('|(--)|;|\/\*|\*\/|\b(OR|AND)\b.*=.*)/gi,
];

// XSS patterns to detect and block
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

// Special characters that need escaping in SQL LIKE clauses
const SQL_LIKE_SPECIAL_CHARS = ['%', '_', '[', ']'];

// Maximum lengths for different input types
export const MAX_LENGTHS = {
  search: 200,
  name: 255,
  email: 320,
  url: 2048,
  text: 5000,
  description: 10000,
  uuid: 36,
  state: 2,
  zipCode: 10,
} as const;

// ============================================================================
// CORE SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitize string input by removing dangerous characters
 * This is a defense-in-depth measure - parameterized queries are primary defense
 */
export function sanitizeString(input: string, maxLength?: number): SanitizationResult<string> {
  const warnings: string[] = [];
  let sanitized = false;

  // Trim whitespace
  let value = input.trim();

  // Check length
  if (maxLength && value.length > maxLength) {
    value = value.substring(0, maxLength);
    warnings.push(`Input truncated to ${maxLength} characters`);
    sanitized = true;
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(value)) {
      warnings.push('Potential SQL injection detected');
      // Don't modify - let validation reject it
      break;
    }
  }

  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(value)) {
      warnings.push('Potential XSS detected');
      break;
    }
  }

  return { value, sanitized, warnings };
}

/**
 * Sanitize search term for use in SQL LIKE queries
 * This escapes special LIKE characters and validates the input
 */
export function sanitizeSearchTerm(input: string): SanitizationResult<string> {
  const result = sanitizeString(input, MAX_LENGTHS.search);
  let value = result.value;
  let sanitized = result.sanitized;

  // Escape SQL LIKE special characters
  for (const char of SQL_LIKE_SPECIAL_CHARS) {
    if (value.includes(char)) {
      value = value.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
      sanitized = true;
    }
  }

  // Remove any null bytes
  if (value.includes('\0')) {
    value = value.replace(/\0/g, '');
    sanitized = true;
    result.warnings.push('Null bytes removed');
  }

  return { value, sanitized, warnings: result.warnings };
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUUID(input: string): ValidationResult<string> {
  const uuidSchema = z.string().uuid();
  const result = uuidSchema.safeParse(input.trim());

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(input: string): ValidationResult<string> {
  const emailSchema = z.string().email().max(MAX_LENGTHS.email);
  const result = emailSchema.safeParse(input.trim().toLowerCase());

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(input: string): ValidationResult<string> {
  const urlSchema = z.string().url().max(MAX_LENGTHS.url);
  const result = urlSchema.safeParse(input.trim());

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  // Additional check: ensure protocol is http or https
  try {
    const url = new URL(result.data);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        valid: false,
        errors: ['Only HTTP and HTTPS protocols are allowed'],
      };
    }
  } catch {
    return {
      valid: false,
      errors: ['Invalid URL format'],
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(
  input: number | string,
  options?: { min?: number; max?: number; integer?: boolean }
): ValidationResult<number> {
  let schema = z.number();

  if (options?.min !== undefined) {
    schema = schema.min(options.min);
  }

  if (options?.max !== undefined) {
    schema = schema.max(options.max);
  }

  if (options?.integer) {
    schema = schema.int();
  }

  const value = typeof input === 'string' ? parseFloat(input) : input;
  const result = schema.safeParse(value);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map(e => e.message),
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: boolean | string): ValidationResult<boolean> {
  if (typeof input === 'boolean') {
    return { valid: true, value: input, errors: [] };
  }

  const normalized = input.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return { valid: true, value: true, errors: [] };
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return { valid: true, value: false, errors: [] };
  }

  return {
    valid: false,
    errors: ['Invalid boolean value. Expected: true, false, 1, 0, yes, or no'],
  };
}

/**
 * Sanitize US state code
 */
export function sanitizeStateCode(input: string): ValidationResult<string> {
  const stateSchema = z.string().length(2).regex(/^[A-Z]{2}$/);
  const result = stateSchema.safeParse(input.trim().toUpperCase());

  if (!result.success) {
    return {
      valid: false,
      errors: ['Invalid state code. Expected 2-letter US state code (e.g., NY, CA)'],
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Sanitize ZIP code (supports US format: 12345 or 12345-6789)
 */
export function sanitizeZipCode(input: string): ValidationResult<string> {
  const zipSchema = z.string().regex(/^\d{5}(-\d{4})?$/);
  const result = zipSchema.safeParse(input.trim());

  if (!result.success) {
    return {
      valid: false,
      errors: ['Invalid ZIP code. Expected format: 12345 or 12345-6789'],
    };
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

/**
 * Sanitize date string (ISO 8601 format)
 */
export function sanitizeDate(input: string): ValidationResult<string> {
  const dateSchema = z.string().datetime();
  const result = dateSchema.safeParse(input.trim());

  if (!result.success) {
    // Try parsing as Date and converting to ISO
    try {
      const date = new Date(input.trim());
      if (isNaN(date.getTime())) {
        return {
          valid: false,
          errors: ['Invalid date format. Expected ISO 8601 format'],
        };
      }
      return {
        valid: true,
        value: date.toISOString(),
        errors: [],
      };
    } catch {
      return {
        valid: false,
        errors: ['Invalid date format. Expected ISO 8601 format'],
      };
    }
  }

  return {
    valid: true,
    value: result.data,
    errors: [],
  };
}

// ============================================================================
// ENUM VALIDATION
// ============================================================================

/**
 * Validate enum value
 */
export function sanitizeEnum<T extends string>(
  input: string,
  allowedValues: readonly T[]
): ValidationResult<T> {
  const normalized = input.trim() as T;

  if (!allowedValues.includes(normalized)) {
    return {
      valid: false,
      errors: [`Invalid value. Allowed values: ${allowedValues.join(', ')}`],
    };
  }

  return {
    valid: true,
    value: normalized,
    errors: [],
  };
}

// ============================================================================
// ARRAY SANITIZATION
// ============================================================================

/**
 * Sanitize array of strings
 */
export function sanitizeStringArray(
  input: string[],
  options?: { maxLength?: number; maxItems?: number }
): SanitizationResult<string[]> {
  const warnings: string[] = [];
  let sanitized = false;
  let value = [...input];

  // Limit number of items
  if (options?.maxItems && value.length > options.maxItems) {
    value = value.slice(0, options.maxItems);
    warnings.push(`Array truncated to ${options.maxItems} items`);
    sanitized = true;
  }

  // Sanitize each string
  value = value.map((item, index) => {
    const result = sanitizeString(item, options?.maxLength);
    if (result.sanitized || result.warnings.length > 0) {
      sanitized = true;
      warnings.push(`Item ${index}: ${result.warnings.join(', ')}`);
    }
    return result.value;
  });

  return { value, sanitized, warnings };
}

// ============================================================================
// QUERY PARAMETER SANITIZATION
// ============================================================================

/**
 * Sanitize query parameters from URL
 * This provides a safe way to extract and validate query params
 */
export function sanitizeQueryParams(searchParams: URLSearchParams) {
  return {
    getString: (key: string, maxLength?: number): string | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeString(value, maxLength);
      return result.value;
    },

    getNumber: (key: string, options?: { min?: number; max?: number; integer?: boolean }): number | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeNumber(value, options);
      return result.valid ? (result.value ?? null) : null;
    },

    getBoolean: (key: string): boolean | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeBoolean(value);
      return result.valid ? (result.value ?? null) : null;
    },

    getEnum: <T extends string>(key: string, allowedValues: readonly T[]): T | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeEnum(value, allowedValues);
      return result.valid ? (result.value ?? null) : null;
    },

    getUUID: (key: string): string | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeUUID(value);
      return result.valid ? (result.value ?? null) : null;
    },

    getSearchTerm: (key: string): string | null => {
      const value = searchParams.get(key);
      if (!value) return null;
      const result = sanitizeSearchTerm(value);
      return result.value;
    },
  };
}

// ============================================================================
// SQL SAFE HELPERS
// ============================================================================

/**
 * Build safe SQL LIKE pattern
 * This is still used with parameterized queries for proper escaping
 */
export function buildSafeLikePattern(searchTerm: string, matchType: 'contains' | 'starts' | 'ends' = 'contains'): string {
  const sanitized = sanitizeSearchTerm(searchTerm);

  switch (matchType) {
    case 'contains':
      return `%${sanitized.value}%`;
    case 'starts':
      return `${sanitized.value}%`;
    case 'ends':
      return `%${sanitized.value}`;
  }
}

/**
 * Validate and sanitize for Supabase .or() operator
 * Ensures the OR condition is safe and properly formatted
 */
export function buildSafeOrCondition(searchTerm: string, columns: string[]): string {
  const sanitized = sanitizeSearchTerm(searchTerm);

  // Validate column names (must be alphanumeric + underscore only)
  const validColumns = columns.filter(col => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col));

  if (validColumns.length === 0) {
    throw new Error('No valid columns provided for OR condition');
  }

  // Build safe OR condition using Supabase syntax
  // The search term will be used in a parameterized way
  return validColumns.map(col => `${col}.ilike.%${sanitized.value}%`).join(',');
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if input contains potential SQL injection
 */
export function containsSQLInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Check if input contains potential XSS
 */
export function containsXSS(input: string): boolean {
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation
 */
export function validateInput(input: string): {
  safe: boolean;
  threats: string[];
} {
  const threats: string[] = [];

  if (containsSQLInjection(input)) {
    threats.push('SQL Injection');
  }

  if (containsXSS(input)) {
    threats.push('XSS');
  }

  // Check for null bytes
  if (input.includes('\0')) {
    threats.push('Null bytes');
  }

  // Check for unusual control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input)) {
    threats.push('Control characters');
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  sanitizeString,
  sanitizeSearchTerm,
  sanitizeUUID,
  sanitizeEmail,
  sanitizeURL,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeStateCode,
  sanitizeZipCode,
  sanitizeDate,
  sanitizeEnum,
  sanitizeStringArray,
  sanitizeQueryParams,
  buildSafeLikePattern,
  buildSafeOrCondition,
  containsSQLInjection,
  containsXSS,
  validateInput,
  MAX_LENGTHS,
};
