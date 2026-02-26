# IncentEdge Current Project State

**Last Updated:** February 25, 2026
**Version:** 1.2
**Status:** MVP Development - Phase 1 Launch Prep (March 10, 2026)

---

## Batch 1 Complete — February 25, 2026

All critical security audit findings resolved. Phase 2 Knowledge Intelligence Layer complete. V41 design system confirmed active.

| Work Item | Status | Date |
|-----------|--------|------|
| CORS wildcard vulnerability removed | Done | Feb 25 |
| CORS whitelist verified | Verified | Feb 25 |
| Stripe webhook signature | Verified correct | Feb 25 |
| Security headers (6 headers, all routes) | Verified | Feb 25 |
| Rate limiting (IP + tier, 2 layers) | Verified | Feb 25 |
| Environment validation at startup | Implemented (`src/instrumentation.ts`) | Feb 25 |
| React Error Boundary | Implemented (`src/components/ErrorBoundary.tsx`) | Feb 25 |
| DB migration 016 (awarded_applications — 6.5M records) | Added | Feb 25 |
| DB migration 017 (probability_scoring cache) | Added | Feb 25 |
| DB migration 018 (equipment_incentive categories) | Added | Feb 25 |
| Semantic search + knowledge index (Phase 2) | Complete (`src/lib/knowledge-index.ts`) | Feb 24 |
| Eligibility checker v2 (Phase 2) | Complete (`src/lib/eligibility-checker.ts`) | Feb 24 |
| Incentive extraction worker (Phase 2) | Complete (`src/lib/incentive-extraction-worker.ts`) | Feb 24 |
| V41 design system (IBM Plex fonts, navy/blue palette) | Confirmed active in `layout.tsx` + `globals.css` | Feb 25 |
| Comprehensive documentation (PRD, BRD, MASTER_HANDOVER, SILO_STATUS, CHANGELOG) | Created in `docs/` | Feb 25 |

---

## Executive Summary

IncentEdge is in **active MVP development** with the core Discovery Engine (Silo 1) approximately **75% complete**. Security hardening (Batch 1) is complete. Phase 2 Knowledge Intelligence Layer is complete. Next milestone: Phase 1 launch March 10, 2026.

**Development Progress:** 75% MVP Complete
**Launch Readiness:** 70% (blockers: test coverage, AI wiring to UI, onboarding flow)
**Technical Debt:** Medium (security resolved; test coverage remains critical gap)
**Stack:** Next.js 15, React 19, TypeScript 5.6, Supabase PostgreSQL 15 (`pzmunszcxmmncppbufoj`)

---

## Implementation Status by Feature

### ✅ FULLY IMPLEMENTED (Production-Ready)

#### 1. Database Schema & Infrastructure
**Status:** 100% Complete
**Files:** `/supabase/migrations/001-011_*.sql`

- **11 comprehensive migrations** covering:
  - Core schema: organizations, profiles, projects (001)
  - Sustainability tiers & incentive programs (002, 009)
  - Documents & eligibility tracking (003)
  - Application workflow engine (004)
  - Team permissions & RBAC (005)
  - Compliance tracking (006)
  - Webhooks & integrations (007)
  - Background jobs system (008)
  - Application outcomes (010)
  - Stripe subscriptions (011)

- **Key Tables:**
  - `incentive_programs` - 24,458+ records (seed data loaded)
  - `projects` - Full project lifecycle support
  - `eligibility_results` - Cached matching scores
  - `application_workflow` - Grant application tracking
  - `compliance_tracking` - Post-award monitoring
  - `organizations` - Multi-tenant architecture with RLS

**Gap:** None - schema is comprehensive and supports all PRD requirements.

---

#### 2. Authentication & Authorization
**Status:** 100% Complete
**Files:** `/src/lib/auth-middleware.ts`, `/src/lib/permissions.ts`, `/src/app/auth/callback/route.ts`

- Supabase Auth integration with SSO support
- Role-based access control (admin, manager, analyst, viewer)
- Row-level security (RLS) policies on all tables
- Session management with automatic refresh
- API key validation for external integrations
- Request signing for webhook security

**Gap:** Security audit identified CORS configuration issue (wildcard fallback) - **CRITICAL FIX REQUIRED**.

---

#### 3. API Security Infrastructure
**Status:** 95% Complete
**Files:** `/src/lib/api-security.ts`, `/src/lib/rate-limiter.ts`, `/src/lib/error-handler.ts`

- Input sanitization with XSS/SQL injection prevention
- Rate limiting framework (100 req/min read, 20 req/min write)
- Centralized error handling with production log sanitization
- CORS headers with origin validation
- Request validation and security logging

**Gaps:**
- Rate limiting not applied to all endpoints (contact, email, upload)
- Environment variable validation not enforced at startup
- Console.log statements leak sensitive data (330 occurrences)

---

#### 4. Core Business Logic Engines
**Status:** 90% Complete
**Files:** `/src/lib/eligibility-engine.ts`, `/src/lib/incentive-matcher.ts`, `/src/lib/stacking-analyzer.ts`

**Eligibility Engine:**
- Multi-factor scoring algorithm (location, sector, size, financials)
- Census tract lookup for energy communities
- AMI (Area Median Income) calculations for affordable housing
- Sustainability tier bonus scoring
- Stacking rule validation

**Incentive Matcher:**
- AI-powered program matching
- Confidence scoring (0-100)
- Jurisdiction filtering (federal, state, county, city)
- Sector-specific filtering (real-estate, clean-energy, water, etc.)
- Deadline tracking and expiration alerts

**Stacking Analyzer:**
- Compatibility matrix for program combinations
- Maximum value optimization
- Conflict detection (mutually exclusive programs)
- Compliance requirement aggregation

**Gaps:**
- AI recommendation engine integration incomplete
- No ML model integration (currently rule-based)
- Stacking optimizer needs performance testing at scale

---

#### 5. PDF Report Generation
**Status:** 85% Complete
**Files:** `/src/lib/pdf-generator.ts`

- Investor-ready PDF reports with charts
- Multi-section layout (summary, details, financials)
- Recharts integration for visualizations
- Export to PDF via @react-pdf/renderer

**Gaps:**
- No custom branding/logo upload support
- Limited chart customization options
- No Word document export (required by PRD for grant applications)

---

### 🚧 IN PROGRESS (Partially Implemented)

#### 6. Dashboard & UI Components
**Status:** 60% Complete
**Files:** `/src/app/(dashboard)/*`, `/src/components/ui/*`

**Completed:**
- 38 shadcn/ui components (button, card, dialog, tabs, etc.)
- Dashboard layout with navigation
- Project list view with filtering
- Direct Pay eligibility checker UI
- Settings page for organizations

**In Progress:**
- Analytics dashboard with charts
- Compliance tracking UI
- Application workflow status views
- Team collaboration features

**Gaps:**
- No error boundaries (React crashes on component errors)
- Missing loading states for async operations
- Limited mobile responsiveness
- No onboarding flow for new users

---

#### 7. API Routes
**Status:** 70% Complete
**Files:** `/src/app/api/**/*.ts`

**Implemented Routes (27 total):**

**Core:**
- `GET/POST /api/projects` - Project CRUD
- `GET/PUT/DELETE /api/projects/[id]` - Project details
- `POST /api/projects/analyze` - Eligibility analysis
- `GET /api/organizations` - Org management
- `POST /api/calculate` - Eligibility calculation

**Compliance & Applications:**
- `/api/compliance/[projectId]` - Compliance tracking
- `/api/compliance/[projectId]/certify` - Certification
- `/api/applications/*` - Application workflow (exists but not in src/)

**Supporting:**
- `/api/health` - Health checks
- `/api/status` - System status
- `/api/contact` - Contact form
- `/api/seed` - Demo data seeding

**Gaps:**
- SQL injection risk in search parameters (CRITICAL)
- Missing try-catch on 57 async operations
- No timeout configuration
- Rate limiting not applied to 12 endpoints
- Missing input validation on dashboard/analytics routes

---

#### 8. Compliance & Document Processing
**Status:** 50% Complete
**Files:** `/src/lib/compliance-checker.ts`, `/src/lib/document-processor.ts`

**Completed:**
- Compliance tracking schema and API
- Document upload infrastructure
- Metadata extraction framework

**In Progress:**
- AI document parsing (extracts project data from PDFs/Word)
- Compliance deadline reminders
- Automated reporting generation

**Gaps:**
- No OCR integration for scanned documents
- Limited file type support (PDFs only)
- No virus scanning on uploads
- Missing file size limits and validation

---

#### 9. Grant Writing System (Revenue Stream 2)
**Status:** 25% Complete
**Files:** `/src/lib/ai-recommendation-engine.ts`, `/src/lib/workflow-engine.ts`

**Completed:**
- Application workflow schema (migration 004)
- Task assignment and tracking
- Comment/collaboration system

**Gaps:**
- No AI integration for narrative generation
- No document template library
- No winning application repository
- No submission API integrations
- Missing human review workflow UI

**PRD Requirement:** 70% success rate, ML trained on 500+ winning applications
**Current Status:** Infrastructure only, no AI implementation

---

#### 10. Marketplace (Revenue Stream 3)
**Status:** 10% Complete (Schema Only)
**Files:** Database schema exists, no implementation

**Completed:**
- Conceptual schema design for buyers/sellers
- Stripe integration for payments

**Gaps:**
- No buyer matching algorithm
- No bidding/auction system
- No transaction escrow
- No API integrations with institutional buyers
- No KYC/AML verification

**PRD Requirement:** 50+ institutional buyers, 92-94 cents on dollar
**Current Status:** Deferred to V1.1 (per MVP scope)

---

### ❌ NOT STARTED

#### 11. AI/ML Integration
**Status:** 0% Complete (Critical Gap)

**PRD Requirements:**
- 92% eligibility prediction accuracy (ML-based)
- AI project intake from documents
- 70% grant approval rate (AI-generated applications)
- Pattern matching from 500+ winning applications

**Current Reality:**
- Rule-based eligibility scoring (no ML model)
- No LLM integration (Claude/GPT-4)
- No training data pipeline
- No model deployment infrastructure

**Impact:** Major differentiator missing; competitor parity only.

---

#### 12. External API Integrations
**Status:** 5% Complete

**Required Integrations:**
- DSIRE (Database of State Incentives for Renewables) - Planned
- Census Bureau API - Partial (tract lookup implemented)
- IRS Energy Community Map - Not started
- EPA Green Communities - Not started
- State/local program APIs - Not started

**Impact:** Limited to static database; no real-time program updates.

---

#### 13. Analytics & Reporting
**Status:** 30% Complete
**Files:** `/src/lib/analytics-engine.ts`

**Completed:**
- Basic analytics schema
- Activity logging framework

**Gaps:**
- No BI dashboard for customers
- No market intelligence features
- No portfolio-level reporting
- No trend analysis or forecasting

---

#### 14. Email & Notification System
**Status:** 40% Complete
**Files:** `/src/lib/email.ts`, `/src/lib/email-triggers.ts`

**Completed:**
- Resend integration
- Email template framework
- Trigger definitions

**Gaps:**
- No transactional emails implemented
- No deadline reminder system
- No in-app notifications
- No SMS/push notification support

---

#### 15. Testing Infrastructure
**Status:** 5% Complete

**Current State:**
- Vitest configured in package.json
- Empty `/tests/` directory
- `__tests__/` folder in `/src/lib/` (empty)
- No test files found

**Required:**
- Unit tests for business logic (eligibility, stacking, matching)
- Integration tests for API routes
- E2E tests for critical paths
- Security tests (XSS, SQL injection, CSRF)
- Performance/load tests

**Impact:** Zero test coverage = high regression risk.

---

## Dependencies Analysis

### Production Dependencies (39 total)

**Framework:**
- `next@14.2.20` - React framework with App Router
- `react@18.3.1`, `react-dom@18.3.1` - UI library

**Database & Auth:**
- `@supabase/supabase-js@2.47.10` - Database client
- `@supabase/ssr@0.5.2` - Server-side rendering support

**UI Components:**
- `@radix-ui/*` (18 packages) - Headless UI primitives
- `lucide-react@0.469.0` - Icon library
- `tailwindcss@3.4.17` - Utility-first CSS
- `shadcn/ui` - Pre-built component library (via Radix)

**Forms & Validation:**
- `react-hook-form@7.54.2` - Form state management
- `zod@3.24.1` - Schema validation
- `@hookform/resolvers@3.9.1` - Form validation integration

**Data Visualization:**
- `recharts@2.15.0` - Charts for analytics/reports
- `@react-pdf/renderer@4.3.2` - PDF generation

**State Management:**
- `zustand@5.0.2` - Global state (lightweight)
- `@tanstack/react-query@5.62.8` - Server state caching
- `@tanstack/react-table@8.20.6` - Table state/filtering

**Payments & Email:**
- `stripe@20.2.0` - Payment processing
- `resend@6.8.0` - Transactional email
- `@react-email/components@1.0.4` - Email templates

**Utilities:**
- `date-fns@4.1.0` - Date manipulation
- `clsx@2.1.1`, `tailwind-merge@2.6.0` - Class name utilities
- `class-variance-authority@0.7.1` - Component variants

**Gaps:**
- No AI/LLM SDK (OpenAI, Anthropic Claude)
- No monitoring (Sentry, LogRocket)
- No analytics (Mixpanel, Amplitude)
- No feature flags (LaunchDarkly, PostHog)

---

### Dev Dependencies (10 total)

**TypeScript:**
- `typescript@5.7.2` - Type checking
- `@types/*` - Type definitions

**Testing:**
- `vitest@2.1.8` - Test runner (configured, not used)
- `@vitest/coverage-v8@2.1.8` - Coverage reports

**Build Tools:**
- `autoprefixer@10.4.20` - CSS post-processing
- `postcss@8.4.49` - CSS transformation
- `ts-node@10.9.2` - TypeScript execution

**Linting:**
- `eslint@8.57.0` - Code linting
- `eslint-config-next@14.2.20` - Next.js ESLint rules

**Gaps:**
- No Prettier (code formatting)
- No Husky (git hooks)
- No lint-staged (pre-commit)
- No Storybook (component docs)

---

## Gaps Between PRD and Current Implementation

### Critical Gaps (Launch Blockers)

| PRD Requirement | Current Status | Gap | Priority |
|-----------------|----------------|-----|----------|
| **92% eligibility accuracy (ML)** | Rule-based scoring only | No ML model, no training pipeline | P0 |
| **AI project intake from docs** | Manual form entry only | No document parsing AI | P0 |
| **10-minute analysis time** | ~30 seconds (rule-based) | Will increase 20x with AI | P0 |
| **Grant writing (70% success)** | 0% - Schema only | No AI generation, no templates | P1 |
| **500+ winning apps repository** | 0 applications indexed | No data collection system | P1 |
| **DSIRE API integration** | Not implemented | Static database only | P1 |
| **Investor-ready PDF reports** | 85% complete | Missing branding, Word export | P2 |
| **Automated deadline reminders** | Schema only | No email triggers implemented | P2 |

### High-Impact Missing Features

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| **Error boundaries** | Prevents app crashes | 1 day | P0 |
| **Security fixes (audit)** | Critical vulnerabilities | 3 days | P0 |
| **Test coverage (>80%)** | Quality assurance | 2 weeks | P0 |
| **LLM integration** | Core differentiator | 2 weeks | P0 |
| **Document upload AI** | User experience | 1 week | P1 |
| **Application workflow UI** | Revenue Stream 2 | 2 weeks | P1 |
| **Deadline notification system** | User retention | 3 days | P2 |
| **Portfolio analytics** | Enterprise feature | 1 week | P2 |

### Technical Debt from Audit Report

**Critical Issues (Must Fix Before Launch):**
1. SQL injection risk in search parameters
2. Missing error handling (57 async operations)
3. Environment variable validation
4. CORS wildcard fallback vulnerability
5. No React error boundaries
6. Sensitive data in console logs (330 occurrences)

**High Priority:**
7. 28 files using `any` type (reduces type safety)
8. Rate limiting missing on 12 endpoints
9. No request timeout configuration
10. Missing CSRF protection
11. Insufficient security event logging

**Estimated Fix Time:** 3-5 days for critical, 2 weeks for high priority

---

## Broken or Incomplete Features

### 1. Demo Mode Fallback
**File:** `/src/app/api/projects/route.ts`
**Issue:** Returns demo data on ANY error, masking real failures
**Impact:** Production errors invisible to monitoring
**Fix:** Remove error handler fallback, explicit demo parameter only

### 2. Placeholder Implementations
**File:** `/src/lib/rate-limiter.ts:479`
**Issue:** Redis integration commented as placeholder
**Impact:** In-memory rate limiting won't scale across instances
**Fix:** Implement Redis or use Vercel rate limiting

### 3. Client-Side Supabase Anon Key
**File:** `/src/lib/supabase/client.ts`
**Issue:** Anon key exposed in browser (standard practice but risky)
**Impact:** Relies entirely on RLS policies for security
**Fix:** Audit and test ALL RLS policies immediately

### 4. Missing API Validation
**Routes:** `/api/dashboard`, `/api/analytics`, `/api/notifications`
**Issue:** No Zod schemas, direct parameter usage
**Impact:** Potential injection attacks, type errors
**Fix:** Add validation schemas to all endpoints

### 5. Unused Imports & Dead Code
**Locations:** Multiple files
**Issue:** Commented code, TODOs, unused variables
**Impact:** Code bloat, confusion
**Fix:** ESLint cleanup pass

---

## Database Status

### Data Quality
- **incentive_programs:** 24,458 records loaded (seed data)
- **Data source:** Migration 009 (seed data)
- **Completeness:** Federal + state programs, lacks local/municipal
- **Accuracy:** Unverified (no validation against live sources)
- **Freshness:** Static snapshot, no update mechanism

### Schema Completeness
- All PRD entities implemented
- RLS policies defined (unverified)
- Indexes on common query paths
- Foreign key constraints enforced

### Missing Elements
- No database backups configured
- No replication for high availability
- No query performance monitoring
- No data retention policies

---

## File Structure Analysis

```
/Users/dremacmini/Desktop/OC/IncentEdge/Site/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes (login, signup)
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── projects/     # Project management UI
│   │   │   ├── compliance/   # Compliance tracking UI
│   │   │   └── analytics/    # Analytics dashboard
│   │   ├── api/              # API routes (27 endpoints)
│   │   │   ├── projects/     # Project CRUD & analysis
│   │   │   ├── compliance/   # Compliance API
│   │   │   ├── organizations/# Multi-tenant API
│   │   │   └── dashboard/    # Dashboard data
│   │   ├── legal/            # Terms, Privacy
│   │   ├── pricing/          # Pricing page
│   │   ├── direct-pay/       # IRA Direct Pay tool
│   │   ├── layout.tsx        # Root layout (1,909 lines)
│   │   ├── page.tsx          # Landing page (6,736 lines)
│   │   └── globals.css       # Tailwind styles
│   │
│   ├── components/
│   │   ├── ui/               # 38 shadcn components
│   │   ├── layout/           # Header, AppLayout
│   │   └── providers/        # React Query, Theme
│   │
│   ├── lib/                  # Core business logic (28 files)
│   │   ├── eligibility-engine.ts        (59,947 bytes)
│   │   ├── analytics-engine.ts          (62,547 bytes)
│   │   ├── document-processor.ts        (38,608 bytes)
│   │   ├── workflow-engine.ts           (32,153 bytes)
│   │   ├── compliance-checker.ts        (31,014 bytes)
│   │   ├── job-scheduler.ts             (26,291 bytes)
│   │   ├── ai-recommendation-engine.ts  (25,983 bytes)
│   │   ├── stacking-analyzer.ts         (28,086 bytes)
│   │   ├── incentive-matcher.ts         (20,653 bytes)
│   │   └── [18 more files]
│   │
│   ├── types/                # TypeScript definitions
│   │   ├── index.ts          # Main types
│   │   ├── eligibility.ts    # Eligibility types
│   │   ├── api.ts            # API response types
│   │   └── [6 more files]
│   │
│   └── contexts/
│       └── DashboardContext.tsx  # Dashboard state
│
├── supabase/
│   ├── migrations/           # 11 SQL migrations (9,000+ lines)
│   ├── seeds/                # Demo data
│   └── scripts/              # Migration validation
│
├── scripts/
│   ├── seed-demo-data.ts     # Demo seeding
│   ├── import-incentives.ts  # Bulk import
│   └── validate-env.ts       # Env validation
│
├── tests/                    # EMPTY (critical gap)
│
├── package.json              # 49 dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── next.config.js            # Next.js config
└── middleware.ts             # Auth middleware
```

**Total Source Files:** ~168 TypeScript files
**Total Lines of Code:** ~25,000+ (estimated)
**Largest Files:**
1. `analytics-engine.ts` - 62,547 bytes
2. `eligibility-engine.ts` - 59,947 bytes
3. `document-processor.ts` - 38,608 bytes

---

## Configuration & Environment

### Environment Variables (28 files access process.env)

**Required but Unvalidated:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `ALLOWED_ORIGINS` (CORS)

**Gap:** `/src/lib/env-validation.ts` exists but not enforced at startup.

### Build Configuration
- Next.js 14 with App Router
- TypeScript strict mode enabled
- Tailwind JIT compilation
- PostCSS with autoprefixer
- ESLint with Next.js config

---

## Deployment Readiness

### ✅ Ready
- Next.js production build works
- Database migrations deployable
- Supabase connection stable
- Stripe integration configured

### ⚠️ Needs Attention
- Security vulnerabilities (audit report)
- Zero test coverage
- No monitoring/logging
- No CI/CD pipeline
- No staging environment
- Missing health checks

### ❌ Blockers
- Critical security fixes
- AI/ML integration
- Test suite implementation
- Error boundaries
- Environment validation
- RLS policy verification

---

## Recommendations for Next Steps

### Immediate (This Week)
1. **Fix critical security issues** (SQL injection, error handling, CORS) - 3 days
2. **Add error boundaries** to prevent app crashes - 1 day
3. **Implement environment validation** at startup - 0.5 days
4. **Remove sensitive console.log statements** - 0.5 days

### Short-Term (Next 2 Weeks)
1. **Build test suite** (unit, integration, E2E) - target 80% coverage
2. **Integrate LLM API** (Claude or GPT-4) for AI features
3. **Complete PDF export** with branding and Word support
4. **Add rate limiting** to all public endpoints
5. **Implement CSRF protection**

### Medium-Term (Next Month)
1. **Launch grant writing UI** (Revenue Stream 2)
2. **Build document upload AI** (project intake from PDFs)
3. **Create deadline notification system**
4. **Implement portfolio analytics dashboard**
5. **Set up monitoring** (Sentry, logs, uptime)

### Long-Term (Next Quarter)
1. **DSIRE API integration** for real-time program updates
2. **ML model training** for eligibility prediction
3. **Winning application repository** (500+ samples)
4. **Marketplace MVP** (Revenue Stream 3)
5. **Mobile app** (iOS/Android)

---

## Success Criteria for MVP Launch

**Technical Readiness:**
- [ ] All critical security issues resolved
- [ ] Test coverage >80% on core logic
- [ ] Error boundaries on all pages
- [ ] Monitoring and alerting configured
- [ ] RLS policies audited and verified

**Feature Completeness:**
- [ ] AI-powered project analysis (10-minute SLA)
- [ ] PDF report generation with branding
- [ ] User authentication and RBAC
- [ ] Payment processing (Stripe)
- [ ] Basic analytics dashboard

**Quality Metrics:**
- [ ] Eligibility accuracy >90% (validated against test set)
- [ ] Page load time <2 seconds (Lighthouse score >90)
- [ ] Zero critical bugs in staging
- [ ] API response time <500ms (p95)

**Current Progress:** 60% toward launch readiness

---

## Conclusion

IncentEdge has a **strong technical foundation** with comprehensive database schema, robust API security infrastructure, and 75% of core business logic implemented. The platform is **viable for beta testing** but requires **critical security fixes, AI integration, and comprehensive testing** before production launch.

**Biggest Risks:**
1. **Zero test coverage** - High regression risk
2. **Missing AI/ML** - Core differentiator not implemented
3. **Security vulnerabilities** - Audit identified critical issues
4. **No monitoring** - Production failures will be invisible

**Estimated Time to MVP Launch:** 4-6 weeks with focused effort on above priorities.

---

*This document is a living snapshot. Update after each sprint.*
