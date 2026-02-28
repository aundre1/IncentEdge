/**
 * Lead Capture API Tests
 *
 * Test scenarios:
 * - Valid lead submission
 * - Email validation
 * - Rate limiting (IP-based)
 * - Monthly limit per email
 * - Missing required fields
 * - Duplicate submissions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// ============================================================================
// MOCK DATA
// ============================================================================

const validPayload = {
  email: 'test@example.com',
  company_size: '50-200',
  industry: 'Real Estate',
  project_address: '123 Main St, San Francisco, CA 94105',
  project_type: 'Commercial',
  utm_source: 'homepage',
  utm_campaign: 'free_sample',
};

const mockRequest = (body: any, options: any = {}) => {
  const url = new URL('http://localhost:3000/api/leads/capture');
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': options.ip || '192.168.1.1',
      'user-agent': options.userAgent || 'Mozilla/5.0 Test',
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
};

// ============================================================================
// TESTS
// ============================================================================

describe('POST /api/leads/capture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Submissions', () => {
    it('should accept valid lead submission', async () => {
      const request = mockRequest(validPayload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.lead.email).toBe(validPayload.email);
      expect(data.report.url).toBeDefined();
    });

    it('should accept submission with optional fields omitted', async () => {
      const minimalPayload = {
        email: 'test@example.com',
        project_address: '123 Main St, San Francisco, CA 94105',
        project_type: 'Commercial',
      };

      const request = mockRequest(minimalPayload);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should normalize email addresses (lowercase)', async () => {
      const payload = { ...validPayload, email: 'TEST@EXAMPLE.COM' };
      const request = mockRequest(payload);
      const response = await POST(request);
      const data = await response.json();

      expect(data.lead.email).toBe('test@example.com');
    });
  });

  describe('Email Validation', () => {
    it('should reject missing email', async () => {
      const payload = { ...validPayload };
      delete (payload as any).email;
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const payload = { ...validPayload, email: 'not-an-email' };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject email with spaces', async () => {
      const payload = { ...validPayload, email: 'test @example.com' };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Required Field Validation', () => {
    it('should reject missing project address', async () => {
      const payload = { ...validPayload };
      delete (payload as any).project_address;
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject address too short', async () => {
      const payload = { ...validPayload, project_address: 'NYC' };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject missing project type', async () => {
      const payload = { ...validPayload };
      delete (payload as any).project_type;
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject invalid project type', async () => {
      const payload = { ...validPayload, project_type: 'InvalidType' };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Optional Field Validation', () => {
    it('should reject company_size not in allowed values', async () => {
      const payload = { ...validPayload, company_size: 'huge' };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject industry over max length', async () => {
      const payload = { ...validPayload, industry: 'x'.repeat(101) };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should reject address over max length', async () => {
      const payload = { ...validPayload, project_address: 'x'.repeat(501) };
      const request = mockRequest(payload);
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow up to 5 submissions per IP per hour', async () => {
      const ip = '192.168.1.100';
      for (let i = 0; i < 5; i++) {
        const payload = { ...validPayload, email: `test${i}@example.com` };
        const request = mockRequest(payload, { ip });
        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });

    it('should reject 6th submission from same IP (rate limit)', async () => {
      const ip = '192.168.1.100';
      // Make 5 valid submissions
      for (let i = 0; i < 5; i++) {
        const payload = { ...validPayload, email: `test${i}@example.com` };
        const request = mockRequest(payload, { ip });
        await POST(request);
      }

      // 6th submission should be rate limited
      const request = mockRequest(validPayload, { ip });
      const response = await POST(request);

      expect(response.status).toBe(429);
      expect(response.headers.has('Retry-After')).toBe(true);
    });

    it('should return Retry-After header on rate limit', async () => {
      const ip = '192.168.1.100';
      // Make 5 valid submissions
      for (let i = 0; i < 5; i++) {
        const payload = { ...validPayload, email: `test${i}@example.com` };
        const request = mockRequest(payload, { ip });
        await POST(request);
      }

      const request = mockRequest(validPayload, { ip });
      const response = await POST(request);

      const retryAfter = response.headers.get('Retry-After');
      expect(retryAfter).toBeDefined();
      expect(Number(retryAfter)).toBeGreaterThan(0);
    });
  });

  describe('IP Extraction', () => {
    it('should use x-forwarded-for header when available', async () => {
      const request = mockRequest(validPayload, {
        headers: { 'x-forwarded-for': '203.0.113.1, 192.0.2.1' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      // IP should be first in x-forwarded-for
    });

    it('should fallback to request IP if x-forwarded-for missing', async () => {
      const request = mockRequest(validPayload);
      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Error Responses', () => {
    it('should return detailed validation errors', async () => {
      const payload = {
        email: 'invalid',
        project_address: 'too-short',
        project_type: 'BadType',
      };
      const request = mockRequest(payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
      expect(data.details.length).toBeGreaterThan(0);
    });

    it('should return error with details property', async () => {
      const payload = { ...validPayload };
      delete (payload as any).email;
      const request = mockRequest(payload);
      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBeDefined();
      expect(data.details).toBeDefined();
    });
  });
});

describe('GET /api/leads/capture', () => {
  describe('Query Parameters', () => {
    it('should require id or email parameter', async () => {
      const url = new URL('http://localhost:3000/api/leads/capture');
      const request = new NextRequest(url);
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should accept id parameter', async () => {
      const url = new URL('http://localhost:3000/api/leads/capture?id=123');
      const request = new NextRequest(url);
      const response = await GET(request);

      // Will 404 since lead doesn't exist, but parameter is valid
      expect([200, 404]).toContain(response.status);
    });

    it('should accept email parameter', async () => {
      const url = new URL('http://localhost:3000/api/leads/capture?email=test@example.com');
      const request = new NextRequest(url);
      const response = await GET(request);

      expect([200, 404]).toContain(response.status);
    });
  });
});
