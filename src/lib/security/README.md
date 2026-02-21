# Security Library - Quick Reference

## Purpose

Prevent SQL injection, XSS, and other injection attacks by validating and sanitizing all user input.

## Usage

```typescript
import { sanitizeQueryParams, sanitizeSearchTerm } from '@/lib/security/input-sanitizer';
```

## Common Patterns

### 1. URL Query Parameters

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = sanitizeQueryParams(searchParams);

  // Get string with max length
  const query = params.getString('q', 200);

  // Get number with constraints
  const page = params.getNumber('page', { min: 1, max: 100, integer: true });

  // Get UUID (validates format)
  const id = params.getUUID('id');

  // Get enum value
  const status = params.getEnum('status', ['active', 'inactive']);

  // Get search term (escapes SQL LIKE chars)
  const search = params.getSearchTerm('search');
}
```

### 2. Search Queries

```typescript
// ALWAYS sanitize search terms
const sanitized = sanitizeSearchTerm(userInput);

// Use with Supabase text search (preferred)
query = query.textSearch('fts', sanitized.value);

// Or with ILIKE (if text search unavailable)
query = query.ilike('column', `%${sanitized.value}%`);
```

### 3. Type Validation

```typescript
import { sanitizeUUID, sanitizeEmail, sanitizeNumber } from '@/lib/security/input-sanitizer';

// Validate UUID
const uuidResult = sanitizeUUID(input);
if (uuidResult.valid) {
  const uuid = uuidResult.value;
} else {
  console.error(uuidResult.errors);
}

// Validate email
const emailResult = sanitizeEmail(input);

// Validate number
const numResult = sanitizeNumber(input, { min: 0, max: 100, integer: true });
```

### 4. Threat Detection

```typescript
import { validateInput, containsSQLInjection, containsXSS } from '@/lib/security/input-sanitizer';

// Check for threats
const validation = validateInput(userInput);
if (!validation.safe) {
  console.warn('Security threat detected:', validation.threats);
  // Log to security monitoring
}

// Check specific threats
if (containsSQLInjection(input)) {
  // Handle SQL injection attempt
}

if (containsXSS(input)) {
  // Handle XSS attempt
}
```

## What Gets Sanitized

### SQL Injection Protection
- Detects SQL keywords (SELECT, DROP, UNION, etc.)
- Escapes LIKE special chars (%, _, [, ])
- Removes null bytes
- Validates against injection patterns

### XSS Protection
- Detects script tags
- Detects event handlers (onclick, onerror, etc.)
- Detects javascript: protocol
- Validates iframe and other dangerous tags

### General Sanitization
- Trims whitespace
- Enforces max lengths
- Removes control characters
- Validates data types

## Example: Secure API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeQueryParams, sanitizeSearchTerm } from '@/lib/security/input-sanitizer';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Sanitize all query parameters
    const { searchParams } = new URL(request.url);
    const params = sanitizeQueryParams(searchParams);

    const search = params.getSearchTerm('search');
    const category = params.getEnum('category', ['all', 'federal', 'state', 'local']);
    const limit = params.getNumber('limit', { min: 1, max: 100, integer: true }) || 20;

    // Build safe query
    let query = supabase.from('programs').select('*');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      const sanitized = sanitizeSearchTerm(search);
      query = query.textSearch('fts', sanitized.value);
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## When to Use

### ALWAYS Use For:
- ✅ Search queries
- ✅ User-provided filters
- ✅ Sort parameters
- ✅ Pagination parameters
- ✅ Any URL query parameters
- ✅ Any user input used in database queries

### Optional (Already Safe):
- Database RPC calls with named parameters (Supabase handles this)
- Supabase query builder with .eq(), .in(), etc. (already parameterized)
- Schema validation with Zod (happens after this)

### Never Skip:
- ❌ NEVER concatenate user input directly into queries
- ❌ NEVER use `.or()` with string interpolation
- ❌ NEVER skip validation on "trusted" inputs

## Testing

Run tests:
```bash
npm test -- src/lib/security/input-sanitizer.test.ts
```

## Available Functions

### Query Parameters
- `sanitizeQueryParams()` - Safe parameter extraction

### String Sanitization
- `sanitizeString()` - General string sanitization
- `sanitizeSearchTerm()` - SQL LIKE-safe search terms
- `buildSafeLikePattern()` - Build LIKE patterns

### Type Validation
- `sanitizeUUID()` - UUID validation
- `sanitizeEmail()` - Email validation
- `sanitizeURL()` - URL validation (HTTP/HTTPS only)
- `sanitizeNumber()` - Number validation with constraints
- `sanitizeBoolean()` - Boolean parsing
- `sanitizeDate()` - Date validation and ISO conversion
- `sanitizeStateCode()` - US state code (2 letters)
- `sanitizeZipCode()` - US ZIP code
- `sanitizeEnum()` - Enum value validation

### Array Sanitization
- `sanitizeStringArray()` - Array with item limits

### Threat Detection
- `containsSQLInjection()` - Check for SQL injection
- `containsXSS()` - Check for XSS
- `validateInput()` - Comprehensive threat check

## Common Mistakes

### ❌ WRONG
```typescript
const search = request.query.get('search');
query = query.or(`name.ilike.%${search}%`);  // SQL INJECTION RISK!
```

### ✅ RIGHT
```typescript
const params = sanitizeQueryParams(request.query);
const search = params.getSearchTerm('search');
const sanitized = sanitizeSearchTerm(search);
query = query.textSearch('fts', sanitized.value);
```

### ❌ WRONG
```typescript
const id = request.params.get('id');
query = query.eq('id', id);  // Not validated!
```

### ✅ RIGHT
```typescript
const params = sanitizeQueryParams(request.params);
const id = params.getUUID('id');
if (!id) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
query = query.eq('id', id);
```

## Security Monitoring

The sanitizer logs warnings when threats are detected. Monitor these logs:

```typescript
const result = sanitizeSearchTerm(input);
if (result.warnings.length > 0) {
  logger.warn('Input sanitization warning', {
    warnings: result.warnings,
    input: input.substring(0, 100), // First 100 chars
    endpoint: request.url,
  });
}
```

## Resources

- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [CWE-89: SQL Injection](https://cwe.mitre.org/data/definitions/89.html)
- [Supabase Security](https://supabase.com/docs/guides/database/database-linter)

---
**Last Updated**: February 17, 2026
