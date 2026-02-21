/**
 * Security Test Suite for Input Sanitizer
 *
 * Tests SQL injection prevention, XSS prevention, and input validation
 */

import { describe, it, expect } from 'vitest';
import {
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
  buildSafeLikePattern,
  containsSQLInjection,
  containsXSS,
  validateInput,
  MAX_LENGTHS,
} from './input-sanitizer';

describe('SQL Injection Prevention', () => {
  it('should detect SQL injection patterns', () => {
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "1; DELETE FROM users WHERE 1=1",
      "' UNION SELECT * FROM passwords--",
      "1' AND 1=1 UNION SELECT null, version()--",
    ];

    sqlInjectionAttempts.forEach(attempt => {
      expect(containsSQLInjection(attempt)).toBe(true);
    });
  });

  it('should sanitize search terms to prevent SQL injection', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const result = sanitizeSearchTerm(maliciousInput);

    // Should not throw error, but should warn
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('SQL injection');
  });

  it('should escape SQL LIKE special characters', () => {
    const input = '50% complete [test]';
    const result = sanitizeSearchTerm(input);

    // Special characters should be escaped
    expect(result.value).toContain('\\%');
    expect(result.value).toContain('\\[');
    expect(result.sanitized).toBe(true);
  });

  it('should build safe LIKE patterns', () => {
    const searchTerm = 'test';
    const contains = buildSafeLikePattern(searchTerm, 'contains');
    const starts = buildSafeLikePattern(searchTerm, 'starts');
    const ends = buildSafeLikePattern(searchTerm, 'ends');

    expect(contains).toBe('%test%');
    expect(starts).toBe('test%');
    expect(ends).toBe('%test');
  });

  it('should handle SQL injection attempts in search patterns', () => {
    const malicious = "test' OR '1'='1";
    const pattern = buildSafeLikePattern(malicious, 'contains');

    // Should not contain unescaped SQL
    expect(pattern).not.toContain("' OR '");
  });
});

describe('XSS Prevention', () => {
  it('should detect XSS patterns', () => {
    const xssAttempts = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      'javascript:alert("XSS")',
      '<div onclick="alert(\'XSS\')">Click me</div>',
    ];

    xssAttempts.forEach(attempt => {
      expect(containsXSS(attempt)).toBe(true);
    });
  });

  it('should warn about XSS patterns in input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const result = sanitizeString(maliciousInput);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('XSS'))).toBe(true);
  });

  it('should allow safe HTML-like text', () => {
    const safeInput = 'Less than < or greater than > symbols are OK';
    const result = sanitizeString(safeInput);

    expect(result.warnings.length).toBe(0);
  });
});

describe('String Sanitization', () => {
  it('should trim whitespace', () => {
    const input = '  test  ';
    const result = sanitizeString(input);

    expect(result.value).toBe('test');
  });

  it('should enforce maximum length', () => {
    const longInput = 'a'.repeat(500);
    const result = sanitizeString(longInput, 100);

    expect(result.value.length).toBe(100);
    expect(result.sanitized).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should remove null bytes', () => {
    const input = 'test\0value';
    const result = sanitizeSearchTerm(input);

    expect(result.value).not.toContain('\0');
    expect(result.sanitized).toBe(true);
  });
});

describe('UUID Validation', () => {
  it('should accept valid UUIDs', () => {
    const validUUID = '123e4567-e89b-12d3-a456-426614174000';
    const result = sanitizeUUID(validUUID);

    expect(result.valid).toBe(true);
    expect(result.value).toBe(validUUID);
  });

  it('should reject invalid UUIDs', () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '123e4567-e89b-12d3-a456',
      '123e4567-e89b-12d3-a456-42661417400g',
      '',
      '123',
    ];

    invalidUUIDs.forEach(invalid => {
      const result = sanitizeUUID(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  it('should prevent SQL injection via UUID field', () => {
    const malicious = "'; DROP TABLE users; --";
    const result = sanitizeUUID(malicious);

    expect(result.valid).toBe(false);
  });
});

describe('Email Validation', () => {
  it('should accept valid emails', () => {
    const validEmails = [
      'user@example.com',
      'test.user@example.co.uk',
      'user+tag@example.com',
    ];

    validEmails.forEach(email => {
      const result = sanitizeEmail(email);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(email.toLowerCase());
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'user@',
      'user @example.com',
    ];

    invalidEmails.forEach(invalid => {
      const result = sanitizeEmail(invalid);
      expect(result.valid).toBe(false);
    });
  });

  it('should normalize email to lowercase', () => {
    const result = sanitizeEmail('User@EXAMPLE.COM');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('user@example.com');
  });
});

describe('URL Validation', () => {
  it('should accept valid HTTP/HTTPS URLs', () => {
    const validURLs = [
      'https://example.com',
      'http://example.com/path',
      'https://example.com:8080/path?query=value',
    ];

    validURLs.forEach(url => {
      const result = sanitizeURL(url);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject non-HTTP protocols', () => {
    const invalidURLs = [
      'javascript:alert("XSS")',
      'ftp://example.com',
      'data:text/html,<script>alert("XSS")</script>',
    ];

    invalidURLs.forEach(invalid => {
      const result = sanitizeURL(invalid);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Number Validation', () => {
  it('should accept valid numbers', () => {
    const result = sanitizeNumber(42);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(42);
  });

  it('should parse string numbers', () => {
    const result = sanitizeNumber('123.45');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(123.45);
  });

  it('should enforce min/max constraints', () => {
    const tooLow = sanitizeNumber(5, { min: 10 });
    const tooHigh = sanitizeNumber(100, { max: 50 });

    expect(tooLow.valid).toBe(false);
    expect(tooHigh.valid).toBe(false);
  });

  it('should enforce integer constraint', () => {
    const decimal = sanitizeNumber(12.5, { integer: true });
    const integer = sanitizeNumber(12, { integer: true });

    expect(decimal.valid).toBe(false);
    expect(integer.valid).toBe(true);
  });

  it('should reject SQL injection attempts', () => {
    const malicious = sanitizeNumber("1' OR '1'='1");
    expect(malicious.valid).toBe(false);
  });
});

describe('Boolean Validation', () => {
  it('should accept boolean values', () => {
    const trueResult = sanitizeBoolean(true);
    const falseResult = sanitizeBoolean(false);

    expect(trueResult.valid).toBe(true);
    expect(trueResult.value).toBe(true);
    expect(falseResult.valid).toBe(true);
    expect(falseResult.value).toBe(false);
  });

  it('should parse string boolean values', () => {
    const truthy = ['true', 'TRUE', '1', 'yes', 'YES'];
    const falsy = ['false', 'FALSE', '0', 'no', 'NO'];

    truthy.forEach(value => {
      const result = sanitizeBoolean(value);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(true);
    });

    falsy.forEach(value => {
      const result = sanitizeBoolean(value);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(false);
    });
  });

  it('should reject invalid boolean strings', () => {
    const invalid = sanitizeBoolean('maybe');
    expect(invalid.valid).toBe(false);
  });
});

describe('State Code Validation', () => {
  it('should accept valid 2-letter state codes', () => {
    const states = ['NY', 'CA', 'TX', 'FL'];

    states.forEach(state => {
      const result = sanitizeStateCode(state);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(state);
    });
  });

  it('should normalize to uppercase', () => {
    const result = sanitizeStateCode('ny');
    expect(result.valid).toBe(true);
    expect(result.value).toBe('NY');
  });

  it('should reject invalid state codes', () => {
    const invalid = ['N', 'NYC', '12', 'N1'];

    invalid.forEach(code => {
      const result = sanitizeStateCode(code);
      expect(result.valid).toBe(false);
    });
  });
});

describe('ZIP Code Validation', () => {
  it('should accept valid ZIP codes', () => {
    const valid = ['12345', '12345-6789'];

    valid.forEach(zip => {
      const result = sanitizeZipCode(zip);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject invalid ZIP codes', () => {
    const invalid = ['1234', '123456', 'ABCDE', '12345-678'];

    invalid.forEach(zip => {
      const result = sanitizeZipCode(zip);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Date Validation', () => {
  it('should accept valid ISO dates', () => {
    const isoDate = '2024-01-15T10:30:00Z';
    const result = sanitizeDate(isoDate);

    expect(result.valid).toBe(true);
    expect(result.value).toBe(isoDate);
  });

  it('should parse and convert non-ISO dates', () => {
    const result = sanitizeDate('2024-01-15');
    expect(result.valid).toBe(true);
    expect(result.value).toMatch(/2024-01-15T/);
  });

  it('should reject invalid dates', () => {
    const invalid = ['not-a-date', '2024-13-45', ''];

    invalid.forEach(date => {
      const result = sanitizeDate(date);
      expect(result.valid).toBe(false);
    });
  });
});

describe('Enum Validation', () => {
  it('should accept valid enum values', () => {
    const allowedValues = ['draft', 'published', 'archived'] as const;
    const result = sanitizeEnum('published', allowedValues);

    expect(result.valid).toBe(true);
    expect(result.value).toBe('published');
  });

  it('should reject invalid enum values', () => {
    const allowedValues = ['draft', 'published'] as const;
    const result = sanitizeEnum('invalid', allowedValues);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('draft, published');
  });
});

describe('Array Sanitization', () => {
  it('should sanitize array of strings', () => {
    const input = ['  test1  ', 'test2', 'test3'];
    const result = sanitizeStringArray(input);

    expect(result.value).toEqual(['test1', 'test2', 'test3']);
  });

  it('should enforce max items', () => {
    const input = ['a', 'b', 'c', 'd', 'e'];
    const result = sanitizeStringArray(input, { maxItems: 3 });

    expect(result.value.length).toBe(3);
    expect(result.sanitized).toBe(true);
  });

  it('should enforce max length per item', () => {
    const input = ['short', 'this is a very long string that exceeds limit'];
    const result = sanitizeStringArray(input, { maxLength: 20 });

    expect(result.value[1].length).toBe(20);
    expect(result.sanitized).toBe(true);
  });
});

describe('Comprehensive Input Validation', () => {
  it('should identify multiple threats', () => {
    const malicious = '<script>alert("XSS")</script>\'; DROP TABLE users; --';
    const result = validateInput(malicious);

    expect(result.safe).toBe(false);
    expect(result.threats).toContain('SQL Injection');
    expect(result.threats).toContain('XSS');
  });

  it('should pass safe input', () => {
    const safe = 'This is safe user input';
    const result = validateInput(safe);

    expect(result.safe).toBe(true);
    expect(result.threats.length).toBe(0);
  });

  it('should detect null bytes', () => {
    const withNull = 'test\0value';
    const result = validateInput(withNull);

    expect(result.safe).toBe(false);
    expect(result.threats).toContain('Null bytes');
  });

  it('should detect control characters', () => {
    const withControl = 'test\x01value';
    const result = validateInput(withControl);

    expect(result.safe).toBe(false);
    expect(result.threats).toContain('Control characters');
  });
});

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    const result = sanitizeString('');
    expect(result.value).toBe('');
    expect(result.warnings.length).toBe(0);
  });

  it('should handle very long strings', () => {
    const veryLong = 'a'.repeat(100000);
    const result = sanitizeString(veryLong, 1000);

    expect(result.value.length).toBe(1000);
    expect(result.sanitized).toBe(true);
  });

  it('should handle unicode characters', () => {
    const unicode = '测试 test émoji 🚀';
    const result = sanitizeString(unicode);

    expect(result.value).toContain('测试');
    expect(result.value).toContain('🚀');
  });

  it('should handle multiple spaces', () => {
    const multiSpace = '   lots   of   spaces   ';
    const result = sanitizeString(multiSpace);

    expect(result.value).not.toMatch(/^\s/);
    expect(result.value).not.toMatch(/\s$/);
  });
});

describe('Performance', () => {
  it('should handle large arrays efficiently', () => {
    const largeArray = Array.from({ length: 10000 }, (_, i) => `item${i}`);
    const start = Date.now();
    const result = sanitizeStringArray(largeArray, { maxItems: 1000 });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    expect(result.value.length).toBe(1000);
  });

  it('should handle complex validation quickly', () => {
    const start = Date.now();

    for (let i = 0; i < 1000; i++) {
      validateInput(`test input ${i}`);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500); // 1000 validations in under 500ms
  });
});
