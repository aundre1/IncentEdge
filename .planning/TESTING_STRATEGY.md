# IncentEdge Testing Strategy

**Document Version:** 1.0
**Last Updated:** February 16, 2026
**Status:** Testing infrastructure 5% complete, 0% test coverage

---

## Executive Summary

IncentEdge currently has **zero test coverage** despite having Vitest configured. This document outlines a comprehensive testing strategy to achieve **80%+ code coverage** before MVP launch, with focus on critical business logic (eligibility engine, stacking analyzer, API security) and user-facing workflows (signup → analysis → report).

**Current State:**
- ✅ Vitest 2.1.8 installed and configured
- ✅ Empty `/tests/` directory exists
- ✅ `__tests__/` folder in `/src/lib/` (empty)
- ❌ 0 test files written
- ❌ 0% code coverage
- ❌ No CI/CD test enforcement

**Target State (MVP Launch):**
- ✅ 80%+ coverage on `/src/lib/` (business logic)
- ✅ 60%+ coverage on `/src/app/api/` (API routes)
- ✅ E2E tests for 5 critical user paths
- ✅ CI/CD fails on coverage drop
- ✅ Tests run in <2 minutes

---

## Testing Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲         10 tests (5%)
                 ╱      ╲        Critical user paths
                ╱────────╲
               ╱          ╲
              ╱Integration╲     50 tests (25%)
             ╱              ╲    API routes, DB queries
            ╱────────────────╲
           ╱                  ╲
          ╱   Unit Tests       ╲  140 tests (70%)
         ╱                      ╲ Business logic, utils
        ╱────────────────────────╲
```

**Philosophy:** More unit tests (fast, cheap), fewer E2E tests (slow, expensive).

---

## Test Categories

### 1. Unit Tests (70% of test suite)

**What to Test:**
- Pure functions in `/src/lib/`
- Business logic (eligibility, stacking, matching)
- Utility functions (validation, formatting, calculations)
- Type guards and validators

**What NOT to Test:**
- React component rendering (use E2E instead)
- Database queries (use integration tests)
- External API calls (mock in unit tests)

**Coverage Target:** 90%+ on `/src/lib/`

---

### 2. Integration Tests (25% of test suite)

**What to Test:**
- API routes with real database
- Authentication/authorization flows
- Multi-step workflows (create project → analyze → export PDF)
- External API integrations (Stripe, Resend)

**What NOT to Test:**
- UI interactions (use E2E)
- Business logic in isolation (use unit tests)

**Coverage Target:** 70%+ on `/src/app/api/`

---

### 3. End-to-End Tests (5% of test suite)

**What to Test:**
- Critical user journeys (signup → dashboard → create project → generate report)
- Cross-browser compatibility (Chrome, Safari, Firefox)
- Mobile responsive behavior
- Payment flows (with Stripe test mode)

**What NOT to Test:**
- Edge cases (use unit tests)
- Internal APIs (use integration tests)
- All possible paths (too slow)

**Coverage Target:** 5 happy paths + 3 error scenarios

---

## Testing Tools & Setup

### Test Runner: Vitest

**Why Vitest over Jest?**
- 10x faster (uses Vite's transform)
- Native ESM support
- TypeScript out-of-box
- Jest-compatible API (easy migration)
- Better watch mode

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // For React components
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/',
        'src/app/layout.tsx', // Excluded (just providers)
      ],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

### Assertion Library: Vitest (Built-in)

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateEligibility', () => {
  it('returns 100 for perfect match', () => {
    const score = calculateEligibility({
      sector: 'real-estate',
      location: 'NY',
      // ... project data
    });
    expect(score).toBe(100);
  });
});
```

---

### Mocking: Vitest + MSW (Mock Service Worker)

**API Mocking:**
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/projects', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Project' }
    ]);
  }),

  http.post('/api/projects', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: '123', ...body }, { status: 201 });
  }),
];
```

**Setup:**
```typescript
// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### E2E Testing: Playwright

**Why Playwright over Cypress?**
- Faster execution
- True multi-browser (Chrome, Firefox, Safari)
- Better TypeScript support
- Auto-wait (no flaky tests)
- Built-in test runner

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Configuration:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Database Testing: Supabase Test Instance

**Strategy:**
1. **Unit/Integration tests:** Mock Supabase client
2. **E2E tests:** Use Supabase test project with seed data

**Mock Setup:**
```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({
          data: { id: '1', name: 'Test Project' },
          error: null
        }))
      }))
    })),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    update: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    delete: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: 'user-123' } },
      error: null
    }))
  }
};
```

**Usage:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { mockSupabase } from '@/tests/mocks/supabase';

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

describe('API Route: /api/projects', () => {
  it('returns user projects', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

---

## Test Coverage Targets

### By Directory

| Directory | Target | Rationale |
|-----------|--------|-----------|
| `/src/lib/` | **90%** | Core business logic, critical to get right |
| `/src/app/api/` | **70%** | API routes, integration with DB |
| `/src/components/ui/` | **50%** | UI components, E2E covers most cases |
| `/src/types/` | **N/A** | Type definitions, no runtime code |
| `/src/app/(dashboard)/` | **30%** | Server components, E2E covers |

### By File (Priority Order)

**Must Test (P0) - 90%+ Coverage:**
1. `/src/lib/eligibility-engine.ts` (59KB) - Core scoring algorithm
2. `/src/lib/stacking-analyzer.ts` (28KB) - Compliance rules
3. `/src/lib/incentive-matcher.ts` (21KB) - Matching logic
4. `/src/lib/api-security.ts` (26KB) - Security critical
5. `/src/lib/auth-middleware.ts` (15KB) - Authentication
6. `/src/lib/permissions.ts` (19KB) - Authorization
7. `/src/lib/error-handler.ts` (10KB) - Error handling
8. `/src/lib/rate-limiter.ts` (14KB) - DDoS protection

**Should Test (P1) - 70%+ Coverage:**
9. `/src/lib/compliance-checker.ts` (31KB)
10. `/src/lib/workflow-engine.ts` (32KB)
11. `/src/lib/document-processor.ts` (39KB)
12. `/src/lib/pdf-generator.ts` (26KB)
13. `/src/lib/analytics-engine.ts` (63KB)
14. `/src/app/api/projects/route.ts`
15. `/src/app/api/calculate/route.ts`

**Could Test (P2) - 50%+ Coverage:**
16. `/src/lib/email.ts` (8KB)
17. `/src/lib/stripe.ts` (8KB)
18. `/src/lib/utils.ts` (3KB)
19. All other API routes

---

## Unit Test Examples

### Example 1: Eligibility Engine

```typescript
// /src/lib/__tests__/eligibility-engine.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateEligibilityScore,
  checkSectorMatch,
  checkLocationMatch,
  calculateAffordabilityBonus
} from '../eligibility-engine';
import type { Project, IncentiveProgram } from '@/types';

describe('Eligibility Engine', () => {
  describe('calculateEligibilityScore', () => {
    it('returns 100 for perfect match', () => {
      const project: Project = {
        id: 'p1',
        sector_type: 'real-estate',
        state: 'NY',
        county: 'Westchester',
        affordable_units: 100,
        total_units: 100,
        sustainability_tier: 'gold',
        // ... full project
      };

      const program: IncentiveProgram = {
        id: 'prog1',
        sector: 'real-estate',
        jurisdiction: 'state',
        state_code: 'NY',
        eligibility_criteria: {
          min_affordable_pct: 80,
          sustainability_tiers: ['gold', 'platinum']
        },
        // ... full program
      };

      const score = calculateEligibilityScore(project, program);

      expect(score).toBe(100);
    });

    it('returns 0 for wrong sector', () => {
      const project = { sector_type: 'clean-energy' } as Project;
      const program = { sector: 'real-estate' } as IncentiveProgram;

      const score = calculateEligibilityScore(project, program);

      expect(score).toBe(0);
    });

    it('returns partial score for county program in different county', () => {
      const project = { state: 'NY', county: 'Manhattan' } as Project;
      const program = {
        jurisdiction: 'county',
        state_code: 'NY',
        county: 'Westchester'
      } as IncentiveProgram;

      const score = calculateEligibilityScore(project, program);

      expect(score).toBeLessThan(50);
    });
  });

  describe('checkSectorMatch', () => {
    it('returns true for exact sector match', () => {
      expect(checkSectorMatch('real-estate', 'real-estate')).toBe(true);
    });

    it('returns false for different sectors', () => {
      expect(checkSectorMatch('clean-energy', 'real-estate')).toBe(false);
    });

    it('handles multi-sector programs', () => {
      expect(checkSectorMatch('real-estate', ['real-estate', 'clean-energy'])).toBe(true);
    });
  });

  describe('calculateAffordabilityBonus', () => {
    it('adds 10 points for 100% affordable', () => {
      const bonus = calculateAffordabilityBonus(100, 100);
      expect(bonus).toBe(10);
    });

    it('adds 5 points for 80% affordable', () => {
      const bonus = calculateAffordabilityBonus(80, 100);
      expect(bonus).toBe(5);
    });

    it('adds 0 points for <50% affordable', () => {
      const bonus = calculateAffordabilityBonus(40, 100);
      expect(bonus).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles missing project data gracefully', () => {
      const project = { sector_type: 'real-estate' } as Project;
      const program = {} as IncentiveProgram;

      expect(() => calculateEligibilityScore(project, program)).not.toThrow();
    });

    it('handles zero units without division by zero', () => {
      const bonus = calculateAffordabilityBonus(0, 0);
      expect(bonus).toBe(0);
    });
  });
});
```

**Coverage:** This test file covers ~80% of eligibility-engine.ts.

---

### Example 2: Stacking Analyzer

```typescript
// /src/lib/__tests__/stacking-analyzer.test.ts
import { describe, it, expect } from 'vitest';
import {
  analyzeStackingCompatibility,
  detectConflicts,
  optimizeStackCombination
} from '../stacking-analyzer';

describe('Stacking Analyzer', () => {
  describe('analyzeStackingCompatibility', () => {
    it('identifies compatible programs', () => {
      const programs = [
        { id: 'p1', stacking_rules: { allows: ['p2', 'p3'] } },
        { id: 'p2', stacking_rules: { allows: ['p1'] } },
      ];

      const result = analyzeStackingCompatibility(programs);

      expect(result.compatible).toEqual([['p1', 'p2']]);
    });

    it('identifies mutually exclusive programs', () => {
      const programs = [
        { id: 'p1', stacking_rules: { excludes: ['p2'] } },
        { id: 'p2', stacking_rules: { excludes: ['p1'] } },
      ];

      const result = analyzeStackingCompatibility(programs);

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toMatchObject({
        program1: 'p1',
        program2: 'p2',
        reason: 'mutually_exclusive'
      });
    });

    it('handles max_total_value limits', () => {
      const programs = [
        { id: 'p1', incentive_amount: 5000000, stacking_rules: { max_total_value: 10000000 } },
        { id: 'p2', incentive_amount: 6000000, stacking_rules: {} },
      ];

      const result = analyzeStackingCompatibility(programs);

      expect(result.conflicts).toContainEqual({
        program1: 'p1',
        program2: 'p2',
        reason: 'exceeds_max_total',
        limit: 10000000
      });
    });
  });

  describe('optimizeStackCombination', () => {
    it('returns highest value combination', () => {
      const programs = [
        { id: 'p1', incentive_amount: 1000000, stacking_rules: {} },
        { id: 'p2', incentive_amount: 2000000, stacking_rules: {} },
        { id: 'p3', incentive_amount: 500000, stacking_rules: { excludes: ['p2'] } },
      ];

      const optimal = optimizeStackCombination(programs);

      expect(optimal.programs).toContain('p1');
      expect(optimal.programs).toContain('p2');
      expect(optimal.programs).not.toContain('p3'); // Excluded by p2
      expect(optimal.totalValue).toBe(3000000);
    });
  });
});
```

---

### Example 3: API Security

```typescript
// /src/lib/__tests__/api-security.test.ts
import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateRequestOrigin,
  checkRateLimit,
  validateRequestBody
} from '../api-security';

describe('API Security', () => {
  describe('sanitizeInput', () => {
    it('removes script tags from input', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Hello');
      expect(clean).not.toContain('<script>');
    });

    it('escapes SQL injection attempts', () => {
      const dirty = "1' OR '1'='1";
      const clean = sanitizeInput(dirty);
      expect(clean).not.toContain("'");
    });

    it('preserves safe HTML entities', () => {
      const safe = '&amp; &lt; &gt;';
      const clean = sanitizeInput(safe);
      expect(clean).toBe(safe);
    });
  });

  describe('validateRequestOrigin', () => {
    it('allows requests from allowed origins', () => {
      const result = validateRequestOrigin('https://incentedge.com');
      expect(result).toBe(true);
    });

    it('blocks requests from unknown origins', () => {
      const result = validateRequestOrigin('https://evil.com');
      expect(result).toBe(false);
    });

    it('allows localhost in development', () => {
      process.env.NODE_ENV = 'development';
      const result = validateRequestOrigin('http://localhost:3000');
      expect(result).toBe(true);
    });
  });

  describe('checkRateLimit', () => {
    it('allows requests under limit', async () => {
      const result = await checkRateLimit('user-123', 'read');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('blocks requests over limit', async () => {
      // Simulate 100 requests
      for (let i = 0; i < 100; i++) {
        await checkRateLimit('spammer-456', 'read');
      }

      const result = await checkRateLimit('spammer-456', 'read');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('validateRequestBody', () => {
    it('validates schema and returns parsed data', async () => {
      const schema = z.object({ name: z.string() });
      const body = { name: 'Test Project' };

      const result = await validateRequestBody(body, schema);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(body);
    });

    it('returns error for invalid schema', async () => {
      const schema = z.object({ age: z.number() });
      const body = { age: 'not a number' };

      const result = await validateRequestBody(body, schema);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
```

---

## Integration Test Examples

### Example 1: API Route - Projects

```typescript
// /src/app/api/projects/__tests__/route.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../route';
import { mockSupabase } from '@/tests/mocks/supabase';

describe('API Route: /api/projects', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSupabase.from.mockClear();
  });

  describe('GET /api/projects', () => {
    it('returns user projects', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: '1', name: 'Project A' },
            { id: '2', name: 'Project B' }
          ],
          error: null
        })
      });

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(2);
    });

    it('returns 401 if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req);

      expect(response.status).toBe(401);
    });

    it('supports pagination', async () => {
      const { req } = createMocks({
        method: 'GET',
        query: { page: '2', limit: '10' }
      });

      const response = await GET(req);
      const data = await response.json();

      expect(mockSupabase.from).toHaveBeenCalledWith('projects');
      expect(data.page).toBe(2);
    });
  });

  describe('POST /api/projects', () => {
    it('creates new project', async () => {
      const projectData = {
        name: 'New Project',
        city: 'New York',
        state: 'NY'
      };

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          data: { id: 'new-123', ...projectData },
          error: null
        })
      });

      const { req } = createMocks({
        method: 'POST',
        body: projectData
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.id).toBe('new-123');
      expect(data.data.name).toBe('New Project');
    });

    it('validates required fields', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: { name: '' } // Missing required fields
      });

      const response = await POST(req);

      expect(response.status).toBe(400);
    });

    it('sanitizes input to prevent XSS', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          name: '<script>alert("XSS")</script>Legit Name',
          city: 'New York'
        }
      });

      const response = await POST(req);
      const data = await response.json();

      expect(data.data.name).not.toContain('<script>');
      expect(data.data.name).toContain('Legit Name');
    });
  });
});
```

---

### Example 2: Authentication Flow

```typescript
// /src/lib/__tests__/auth-middleware.test.ts
import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { authMiddleware } from '../auth-middleware';

describe('Auth Middleware', () => {
  it('allows authenticated requests', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects', {
      headers: {
        'Cookie': 'sb-access-token=valid-jwt-token'
      }
    });

    const response = await authMiddleware(req);

    expect(response).toBeNull(); // Passes through
  });

  it('redirects unauthenticated requests to login', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard');

    const response = await authMiddleware(req);

    expect(response.status).toBe(307); // Redirect
    expect(response.headers.get('Location')).toContain('/login');
  });

  it('returns 401 for API requests without auth', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects');

    const response = await authMiddleware(req);

    expect(response.status).toBe(401);
  });

  it('refreshes expired tokens automatically', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects', {
      headers: {
        'Cookie': 'sb-access-token=expired; sb-refresh-token=valid-refresh'
      }
    });

    const response = await authMiddleware(req);

    expect(response).toBeNull(); // Refreshed and allowed
    // Check that new access token set in cookies
  });
});
```

---

## E2E Test Examples

### Example 1: Critical User Journey

```typescript
// /tests/e2e/signup-to-report.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Journey: Signup → Create Project → Generate Report', () => {
  test('complete flow works end-to-end', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/IncentEdge/);

    // 2. Click signup
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/\/signup/);

    // 3. Fill signup form
    await page.fill('input[name=email]', 'test@example.com');
    await page.fill('input[name=password]', 'SecurePass123!');
    await page.fill('input[name=organization]', 'Test Development Co');
    await page.click('button[type=submit]');

    // 4. Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');

    // 5. Create new project
    await page.click('text=New Project');
    await page.fill('input[name=name]', 'Mount Vernon Housing');
    await page.fill('input[name=address]', '123 Main St');
    await page.fill('input[name=city]', 'Mount Vernon');
    await page.selectOption('select[name=state]', 'NY');
    await page.fill('input[name=zip]', '10550');
    await page.fill('input[name=total_units]', '150');
    await page.fill('input[name=affordable_units]', '120');
    await page.fill('input[name=total_cost]', '45000000');
    await page.click('button[type=submit]');

    // 6. Wait for analysis to complete
    await expect(page.locator('text=Analyzing')).toBeVisible();
    await expect(page.locator('text=Analysis Complete')).toBeVisible({ timeout: 60000 });

    // 7. Verify results displayed
    const resultsCount = await page.locator('[data-testid=incentive-card]').count();
    expect(resultsCount).toBeGreaterThan(0);

    // 8. Generate PDF report
    await page.click('text=Export PDF');
    await expect(page.locator('text=Generating report')).toBeVisible();

    // 9. Verify download started
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('shows error for invalid project data', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=New Project');

    // Submit with invalid data
    await page.fill('input[name=total_units]', '-10'); // Negative units
    await page.click('button[type=submit]');

    // Verify error message
    await expect(page.locator('text=Units must be positive')).toBeVisible();
  });
});
```

---

### Example 2: Payment Flow

```typescript
// /tests/e2e/subscription.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test('user can upgrade to paid plan', async ({ page }) => {
    // Login as free user
    await page.goto('/login');
    await page.fill('input[name=email]', 'free-user@example.com');
    await page.fill('input[name=password]', 'password123');
    await page.click('button[type=submit]');

    // Navigate to pricing
    await page.goto('/pricing');

    // Select Professional plan
    await page.click('[data-testid=professional-plan] >> text=Upgrade');

    // Fill Stripe test card
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name=cardnumber]').fill('4242424242424242');
    await stripeFrame.locator('input[name=exp-date]').fill('12/34');
    await stripeFrame.locator('input[name=cvc]').fill('123');
    await stripeFrame.locator('input[name=postal]').fill('10001');

    // Submit payment
    await page.click('button:text("Subscribe")');

    // Verify success
    await expect(page.locator('text=Subscription active')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify badge shows Professional
    await expect(page.locator('[data-testid=subscription-badge]')).toContainText('Professional');
  });

  test('handles payment failure gracefully', async ({ page }) => {
    await page.goto('/pricing');
    await page.click('[data-testid=professional-plan] >> text=Upgrade');

    // Use Stripe test card that fails
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
    await stripeFrame.locator('input[name=cardnumber]').fill('4000000000000002');
    await stripeFrame.locator('input[name=exp-date]').fill('12/34');
    await stripeFrame.locator('input[name=cvc]').fill('123');

    await page.click('button:text("Subscribe")');

    // Verify error message
    await expect(page.locator('text=Payment failed')).toBeVisible();
  });
});
```

---

### Example 3: Mobile Responsiveness

```typescript
// /tests/e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use(devices['iPhone 12']);

test.describe('Mobile Experience', () => {
  test('dashboard is usable on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify mobile menu visible
    await expect(page.locator('[data-testid=mobile-menu-button]')).toBeVisible();

    // Open menu
    await page.click('[data-testid=mobile-menu-button]');
    await expect(page.locator('[data-testid=mobile-nav]')).toBeVisible();

    // Navigate to projects
    await page.click('text=Projects');
    await expect(page).toHaveURL(/\/projects/);

    // Verify cards stack vertically
    const firstCard = page.locator('[data-testid=project-card]').first();
    const box = await firstCard.boundingBox();
    expect(box.width).toBeGreaterThan(300); // Full width on mobile
  });

  test('project creation form works on mobile', async ({ page }) => {
    await page.goto('/projects/new');

    // Fill form (should be touch-friendly)
    await page.tap('input[name=name]');
    await page.keyboard.type('Mobile Test Project');

    // Verify virtual keyboard doesn't obscure submit button
    const submitButton = page.locator('button[type=submit]');
    await expect(submitButton).toBeInViewport();
  });
});
```

---

## Performance Testing

### Load Testing with k6

**Installation:**
```bash
brew install k6  # macOS
# or
choco install k6  # Windows
```

**Test Script:**
```javascript
// /tests/performance/api-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // <1% failure rate
  },
};

export default function () {
  // Login
  const loginRes = http.post('https://incentedge.com/api/auth/login', {
    email: 'load-test@example.com',
    password: 'password123'
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  const token = loginRes.json('token');

  // Fetch projects
  const projectsRes = http.get('https://incentedge.com/api/projects', {
    headers: { Authorization: `Bearer ${token}` }
  });

  check(projectsRes, {
    'projects loaded': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run:**
```bash
k6 run tests/performance/api-load.js
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run typecheck

      - name: Run unit tests
        run: npm run test:run

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## Test Data Management

### Seed Data for Tests

```typescript
// /tests/fixtures/projects.ts
export const mockProjects = [
  {
    id: 'p1',
    name: 'Mount Vernon Affordable Housing',
    city: 'Mount Vernon',
    state: 'NY',
    total_units: 150,
    affordable_units: 120,
    total_development_cost: 45000000,
    sustainability_tier: 'gold'
  },
  {
    id: 'p2',
    name: 'Brooklyn Solar Farm',
    city: 'Brooklyn',
    state: 'NY',
    sector_type: 'clean-energy',
    capacity_mw: 5.0,
    sustainability_tier: 'platinum'
  },
];

export const mockIncentivePrograms = [
  {
    id: 'prog1',
    program_name: 'NY State Green Homes Initiative',
    jurisdiction: 'state',
    state_code: 'NY',
    sector: 'real-estate',
    incentive_amount: 5000000,
    eligibility_criteria: {
      min_affordable_pct: 80,
      sustainability_tiers: ['gold', 'platinum']
    }
  },
  {
    id: 'prog2',
    program_name: 'IRS 45L New Energy Efficient Home Credit',
    jurisdiction: 'federal',
    sector: 'real-estate',
    incentive_amount: 5000,
    per_unit_amount: true
  },
];
```

### Database Setup for Integration Tests

```typescript
// /tests/setup-db.ts
import { createClient } from '@supabase/supabase-js';

const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL,
  process.env.TEST_SUPABASE_KEY
);

export async function setupTestDatabase() {
  // Clear existing test data
  await testSupabase.from('projects').delete().neq('id', '');
  await testSupabase.from('organizations').delete().neq('id', '');

  // Seed test data
  const { data: org } = await testSupabase.from('organizations').insert({
    name: 'Test Organization',
    subscription_tier: 'professional'
  }).select().single();

  await testSupabase.from('projects').insert(mockProjects.map(p => ({
    ...p,
    organization_id: org.id
  })));
}

export async function teardownTestDatabase() {
  // Clean up after tests
  await testSupabase.from('projects').delete().neq('id', '');
  await testSupabase.from('organizations').delete().neq('id', '');
}
```

---

## Testing Best Practices

### Do's ✅

1. **Write tests before fixing bugs** (TDD for bug fixes)
2. **Test behavior, not implementation** (refactor-safe tests)
3. **Use descriptive test names** ("should return 401 when user not authenticated")
4. **Arrange-Act-Assert pattern** (AAA for clarity)
5. **One assertion per test** (when possible)
6. **Mock external dependencies** (APIs, database)
7. **Clean up after tests** (avoid test pollution)
8. **Run tests in CI/CD** (automated quality gates)

### Don'ts ❌

1. **Don't test framework code** (React, Next.js internals)
2. **Don't test third-party libraries** (Stripe, Supabase)
3. **Don't write brittle tests** (tied to DOM structure)
4. **Don't skip error cases** (happy path only)
5. **Don't ignore flaky tests** (fix or delete)
6. **Don't commit .only() or .skip()** (temporary debugging)
7. **Don't use real API keys in tests** (always mock)
8. **Don't test private functions** (test public API)

---

## Test Metrics & Reporting

### Coverage Goals

**Overall:** 80%+ (enforced in CI)

**By Type:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

### Dashboard

**Codecov Integration:**
- Badge in README showing coverage %
- Per-PR coverage diff
- File-level coverage heatmap

**Test Results:**
- Playwright HTML report (on failure)
- Vitest coverage report (HTML)
- CI/CD status badges

---

## Roadmap: Testing Implementation

### Week 1 (Feb 16-23)
- [ ] Write tests for eligibility-engine.ts (90%+ coverage)
- [ ] Write tests for stacking-analyzer.ts (90%+ coverage)
- [ ] Write tests for api-security.ts (90%+ coverage)
- [ ] Write tests for auth-middleware.ts (90%+ coverage)
- [ ] Set up CI/CD with test enforcement

### Week 2 (Feb 24 - Mar 2)
- [ ] Write integration tests for /api/projects routes
- [ ] Write integration tests for /api/calculate route
- [ ] Write integration tests for /api/compliance routes
- [ ] Set up E2E test infrastructure (Playwright)
- [ ] Write 3 critical E2E tests (signup, project, report)

### Week 3 (Mar 3-8)
- [ ] Write tests for remaining /src/lib files (70%+ coverage)
- [ ] Write tests for PDF generation
- [ ] Write tests for workflow engine
- [ ] Write 2 more E2E tests (payment, mobile)
- [ ] Achieve 80%+ overall coverage

### Ongoing
- [ ] Add test for every new feature
- [ ] Add test for every bug fix
- [ ] Monitor coverage in CI/CD
- [ ] Refactor tests as needed
- [ ] Update test documentation

---

*This testing strategy is a living document. Update as testing practices evolve.*
