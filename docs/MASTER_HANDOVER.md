# IncentEdge — Master Handover Document

**Last Updated:** February 25, 2026
**Status:** Phase 1 MVP — Launch March 10, 2026
**Version:** 1.0

> This is the single source of truth for the IncentEdge codebase. If you are a new engineer or an AI reading this cold, start here.

---

## 1. What IncentEdge Is

IncentEdge is an AI-powered platform for real estate developers to discover, apply for, and monetize government incentive programs. The tagline — "Infrastructure's Bloomberg Terminal for Incentives" — captures the core concept: a unified intelligence layer over the $500B+ annual U.S. incentive landscape (tax credits, grants, loans, rebates), which is currently fragmented across federal, state, county, and municipal sources with no single access point.

The platform operates in three revenue silos: (1) a SaaS Discovery Engine that matches a project to 24,458+ programs in under 60 seconds using AI eligibility scoring and hybrid semantic search; (2) a Grant Writing AI that uses 6.5M awarded application records to compute approval probability and draft grant narratives; and (3) a Tax Credit Marketplace for Section 6418 IRA direct credit transfers. Silo 1 is ~75% complete. Silo 2 has backend schema but no UI. Silo 3 is schema-only.

---

## 2. Quick Status Table

| Component | % Complete | Status | Key Files |
|-----------|-----------|--------|-----------|
| Database schema (18 migrations) | 100% | Production-ready | `supabase/migrations/001-018_*.sql` |
| Auth + RBAC | 100% | Production-ready | `src/lib/auth-middleware.ts`, `src/lib/permissions.ts` |
| API security (CORS, rate limit, sanitization) | 95% | Production-ready | `src/lib/api-security.ts`, `src/lib/rate-limiter.ts` |
| Security headers | 100% | Verified Batch 1 | `middleware.ts` |
| React Error Boundary | 100% | Batch 1 complete | `src/components/ErrorBoundary.tsx` |
| Env validation at startup | 100% | Batch 1 complete | `src/instrumentation.ts` |
| Eligibility engine (rule-based) | 90% | Functional | `src/lib/eligibility-engine.ts` |
| Eligibility checker v2 (Phase 2) | 90% | Functional | `src/lib/eligibility-checker.ts` |
| Incentive matcher | 90% | Functional | `src/lib/incentive-matcher.ts` |
| Knowledge index (semantic search) | 90% | Functional | `src/lib/knowledge-index.ts` |
| Stacking analyzer | 70% | Partial | `src/lib/stacking-analyzer.ts` |
| Direct Pay checker (IRA §6417) | 85% | Functional | `src/lib/direct-pay-checker.ts` |
| PDF report generation | 85% | Functional | `src/lib/pdf-generator.ts` |
| Incentive extraction worker | 80% | Functional | `src/lib/incentive-extraction-worker.ts` |
| Program processor | 80% | Functional | `src/lib/incentive-program-processor.ts` |
| Stripe subscriptions | 95% | Functional | `src/lib/stripe.ts`, migration 011 |
| Dashboard UI | 60% | In progress | `src/app/(dashboard)/*` |
| Email system (Resend) | 40% | Framework only | `src/lib/email.ts`, `src/lib/email-triggers.ts` |
| Compliance checker | 50% | Partial | `src/lib/compliance-checker.ts` |
| Workflow engine | 60% | Backend only | `src/lib/workflow-engine.ts` |
| Analytics engine | 30% | Schema only | `src/lib/analytics-engine.ts` |
| Grant writing UI | 0% | Not started | Planned Phase 2 |
| Tax credit marketplace | 10% | Schema only | Planned Phase 3 |
| Test coverage | 5% | Critical gap | `tests/` directory empty |

---

## 3. How to Run Locally

**Prerequisites:** Node.js 20+, npm 10+, Supabase account

```bash
# 1. Clone and install
git clone <repo>
cd incentedge/Site
npm install

# 2. Set environment variables (copy template, fill in values)
cp .env.example .env.local
# Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#           SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, RESEND_API_KEY

# 3. Run database migrations
npx supabase db push  # or apply migrations manually in Supabase dashboard

# 4. Seed demo data (optional)
npx ts-node scripts/seed-demo-data.ts

# 5. Start development server
npm run dev

# App runs at: http://localhost:3000
# API routes at: http://localhost:3000/api/*
```

**Useful dev commands:**
```bash
npm run build          # Production build (catches TypeScript errors)
npm run lint           # ESLint check
npm test               # Vitest (currently no tests — will show empty suite)
```

---

## 4. How to Deploy to Vercel

1. **Connect repository:** Vercel Dashboard → New Project → Import from GitHub
2. **Set environment variables:** Vercel Dashboard → Settings → Environment Variables (see section 8 below)
3. **Set build command:** `npm run build` (auto-detected for Next.js)
4. **Set root directory:** `incentedge/Site` (if repo is a monorepo)
5. **Deploy:** Vercel auto-deploys on push to `main`. Manual: `vercel --prod` from project root.

**Post-deploy verification:**
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

## 5. Critical File Map (Top 20)

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — V41 fonts (IBM Plex Sans/Mono, Sora), Error Boundary wrapper |
| `src/app/page.tsx` | Landing page — hero, stats, features, CTA |
| `src/app/globals.css` | V41 design system — CSS custom properties, Tailwind base |
| `middleware.ts` | Auth gate + all security headers on every request |
| `src/lib/eligibility-checker.ts` | Phase 2 eligibility checker — matches projects to programs via hybrid search |
| `src/lib/knowledge-index.ts` | Hybrid search engine — 1536-dim embeddings (Anthropic) + BM25 keyword, pgvector |
| `src/lib/eligibility-engine.ts` | Rule-based eligibility scoring — 59KB, comprehensive multi-factor algorithm |
| `src/lib/incentive-matcher.ts` | AI-powered program matching with confidence scoring |
| `src/lib/stacking-analyzer.ts` | Compatible program combinations + max value optimization |
| `src/lib/pdf-generator.ts` | Investor-ready PDF reports via @react-pdf/renderer |
| `src/lib/direct-pay-checker.ts` | IRA Section 6417 Direct Pay eligibility logic |
| `src/lib/api-security.ts` | CORS whitelist, request signing, input sanitization, rate limiting |
| `src/lib/rate-limiter.ts` | Token bucket rate limiting by subscription tier |
| `src/lib/auth-middleware.ts` | Supabase Auth session validation + API key validation |
| `src/lib/permissions.ts` | RBAC — admin, manager, analyst, viewer roles |
| `src/lib/stripe.ts` | Stripe subscriptions + webhook handling |
| `src/lib/incentive-extraction-worker.ts` | Async document extraction job worker (PDF parsing + AI) |
| `src/components/ErrorBoundary.tsx` | React error boundary — prevents full-app crashes |
| `src/instrumentation.ts` | Next.js startup hook — validates required env vars |
| `supabase/migrations/` | All 18 SQL migrations — canonical schema source |

---

## 6. Database Overview

**Supabase project:** `pzmunszcxmmncppbufoj` | Region: us-west-2
**Total migrations:** 18 | **Lines of SQL:** ~9,000+

| Table | Purpose | Migration |
|-------|---------|-----------|
| `organizations` | Multi-tenant root — every resource belongs to an org | 001 |
| `profiles` | User profiles linked to Supabase Auth users | 001 |
| `projects` | Real estate development projects (core entity) | 001 |
| `incentive_programs` | 24,458+ incentive programs (seed data) | 001, 009 |
| `project_incentive_matches` | Cached eligibility results per project+program | 001 |
| `eligibility_results` | Detailed eligibility scoring output | 003 |
| `documents` | Uploaded documents (PDFs, Word) for projects | 003 |
| `application_workflow` | Grant application lifecycle management | 004 |
| `application_tasks` | Individual tasks within an application | 004 |
| `application_comments` | Collaboration comments on applications | 004 |
| `team_members` | Org team membership and role assignments | 005 |
| `invitations` | Pending team invitations | 005 |
| `compliance_tracking` | Post-award compliance monitoring | 006 |
| `compliance_milestones` | Individual compliance checkpoints | 006 |
| `webhooks` | Webhook endpoint registrations | 007 |
| `webhook_events` | Webhook delivery log | 007 |
| `background_jobs` | Async job queue (extraction, sync, etc.) | 008 |
| `job_schedules` | Recurring job definitions | 008 |
| `job_logs` | Job execution history | 008 |
| `application_outcomes` | Individual application results (FOIA + user data) | 010 |
| `subscriptions` | Stripe subscription state per org | 011 |
| `billing_events` | Stripe event log | 011 |
| `encryption_keys` | Field-level encryption key management | 013 |
| `tier1_import_schema` | Schema for bulk incentive program imports | 014 |
| `incentive_program_sources` | Data source tracking for programs | 015 |
| `knowledge_index_embeddings` | pgvector embeddings for semantic search | 015 |
| `awarded_applications` | 6.5M external award records for probability scoring | 016 |
| `probability_scores` | Cached approval probability per project+program (7-day TTL) | 017 |
| `equipment_incentives` | Equipment category classification on incentive_programs | 018 (alters table) |

**RLS:** All tables have Row Level Security policies. Users can only see data belonging to their organization.

---

## 7. API Route Groups

All routes in `src/app/api/`:

| Group | Routes | Purpose |
|-------|--------|---------|
| `projects/` | GET, POST, [id] GET/PUT/DELETE, analyze | Project CRUD + eligibility analysis |
| `programs/` | GET, [id], search, eligible, ingest, sync | Incentive program data + search |
| `compliance/` | [projectId] GET/POST, certify | Compliance tracking |
| `applications/` | Application workflow management | Grant applications |
| `documents/` | Document upload + management | File handling |
| `analytics/` | Dashboard analytics data | Metrics + reporting |
| `dashboard/` | Dashboard aggregate data | Summary views |
| `organizations/` | Org management | Multi-tenant |
| `stripe/` | webhook, checkout, portal | Payment processing |
| `jobs/` | process, schedule, status | Background job management |
| `team/` | Team member management | Collaboration |
| `integrations/` | External API integrations | Third-party connections |
| `health/` | GET | Health check — returns `{"status":"ok"}` |
| `status/` | GET | System status |
| `seed/` | POST | Demo data seeding (dev only) |
| `calculate/` | POST | Eligibility calculation |
| `contact/` | POST | Contact form |
| `export/` | PDF/data export | Report generation |
| `reports/` | Report generation | Analytics reports |
| `cost-estimation/` | Project cost estimates | Financial analysis |
| `email/` | Email triggers | Transactional email |
| `notifications/` | User notifications | Alert management |
| `settings/` | Org settings | Configuration |
| `stats/` | Platform stats | Public metrics |
| `api-docs/` | API documentation | Developer reference |

**Total API route directories:** 27

---

## 8. Required Environment Variables

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://pzmunszcxmmncppbufoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard — keep secret>

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Anthropic (required for AI features)
ANTHROPIC_API_KEY=sk-ant-...

# Email (required for transactional email)
RESEND_API_KEY=re_...

# Security (required in production)
ALLOWED_ORIGINS=https://incentedge.com,https://www.incentedge.com,https://app.incentedge.com
JWT_SECRET=<32+ char random string>
ENCRYPTION_KEY=<32 bytes hex>

# App config
NEXT_PUBLIC_APP_URL=https://app.incentedge.com
NODE_ENV=production
```

**Validation:** `src/instrumentation.ts` calls `validateEnvironment()` on server startup. In production, missing required vars throw and prevent unsafe startup.

---

## 9. Current Work Status (as of Feb 25, 2026)

### Batch 1 Complete (Security + Infrastructure)

Completed Feb 25, 2026. All critical security audit findings resolved.

| Item | Status | File |
|------|--------|------|
| CORS wildcard vulnerability removed | Done | `src/lib/api-security.ts` |
| CORS whitelist verified (explicit origins) | Verified | `src/lib/api-security.ts` |
| Stripe webhook signature verification | Verified correct | `src/app/api/stripe/webhook/route.ts` |
| Security headers (all 6 headers) | Verified on all routes | `middleware.ts` |
| Rate limiting (two layers: IP + tier) | Verified | `middleware.ts`, `src/lib/rate-limiter.ts` |
| Environment validation at startup | Implemented | `src/instrumentation.ts` |
| React Error Boundary | Implemented | `src/components/ErrorBoundary.tsx`, `src/app/layout.tsx` |

### Phase 2 Knowledge Intelligence Layer (Complete)

Completed Feb 24, 2026.

| Item | Status | File |
|------|--------|------|
| Semantic search (Anthropic embeddings + pgvector) | Complete | `src/lib/knowledge-index.ts` |
| Hybrid search (60% semantic + 40% keyword) | Complete | `src/lib/knowledge-index.ts` |
| Eligibility checker v2 | Complete | `src/lib/eligibility-checker.ts` |
| Incentive extraction worker | Complete | `src/lib/incentive-extraction-worker.ts` |
| Program processor | Complete | `src/lib/incentive-program-processor.ts` |
| Job processor | Complete | `src/lib/job-processor.ts` |
| DB migration 015 (knowledge index / embeddings) | Complete | `supabase/migrations/015_knowledge_index_embeddings.sql` |
| DB migration 016 (awarded applications — 6.5M records) | Complete | `supabase/migrations/016_awarded_applications.sql` |
| DB migration 017 (probability scoring cache) | Complete | `supabase/migrations/017_probability_scoring.sql` |
| DB migration 018 (equipment incentive categories) | Complete | `supabase/migrations/018_equipment_incentives.sql` |

### V41 Design System (Confirmed Active)

Design system V41 is active in the Next.js app.

| Element | Implementation | File |
|---------|---------------|------|
| IBM Plex Sans (body) | Next.js Google Fonts | `src/app/layout.tsx` |
| IBM Plex Mono (numbers/metrics) | Next.js Google Fonts | `src/app/layout.tsx` |
| Sora (headings) | Next.js Google Fonts | `src/app/layout.tsx` |
| Navy/Blue palette | CSS custom properties | `src/app/globals.css` |
| Dark mode support | `.dark` class variables | `src/app/globals.css` |

---

## 10. Three Silos Detailed Status

### Silo 1: Discovery Engine (~75% complete)

**What works:**
- Project creation and management (CRUD)
- Eligibility scoring against 24,458+ programs (rule-based engine)
- Hybrid semantic + keyword search (embeddings via Anthropic, pgvector)
- Stacking analysis (70% complete)
- Direct Pay checker for IRA §6417
- PDF report generation
- Stripe subscriptions with tier-based access
- Auth, RBAC, multi-tenant RLS

**What's missing:**
- Onboarding flow for new users
- AI-powered analysis (currently rule-based, Claude integration not wired to UI)
- Deadline reminder email system (framework exists, triggers not wired)
- Word document export
- Full mobile responsiveness
- Test coverage

### Silo 2: Grant Writing AI (~30% complete)

**What exists (backend only):**
- Application workflow schema (migration 004) — task assignment, status, comments
- Workflow engine backend (`src/lib/workflow-engine.ts`)
- 6.5M awarded applications table (migration 016)
- Probability scoring cache (migration 017)
- AI recommendation engine scaffolding (`src/lib/ai-recommendation-engine.ts`)

**What's missing (all UI + AI integration):**
- Grant writing UI (none built)
- Claude API integration for narrative generation
- Application template library (20+ forms)
- Document assembly (Word/PDF output per program format)
- Human review workflow
- Winning application repository population

### Silo 3: Tax Credit Marketplace (~10% complete)

**What exists:**
- Stripe integration for future payment processing
- Conceptual schema design

**What's missing (essentially everything):**
- Credit listing UI
- Buyer/seller matching
- Bidding system
- Transaction escrow
- KYC/AML
- IRS Form 3800 verification
- BD partner agreement (required)
- Legal/regulatory review

**Do NOT launch Silo 3 without securities law opinion and BD partner arrangement.**

---

## 11. Known Issues and TODOs

### Critical (Block Launch)
- [ ] SQL injection risk in search parameters — `src/app/api/programs/route.ts` — add parameterized queries / Zod validation
- [ ] 57 async operations missing try-catch blocks — audit via `npm run lint`
- [ ] Zero test coverage — `tests/` directory is empty; `src/lib/__tests__/` is empty
- [ ] Rate limiting not applied to 12 endpoints — needs audit

### High Priority
- [ ] 28 files using `any` type — reduces TypeScript safety
- [ ] Demo mode fallback in `src/app/api/projects/route.ts` swallows real errors — remove
- [ ] In-memory rate limiting in `src/lib/rate-limiter.ts` won't scale across Vercel instances — needs Redis or Vercel KV
- [ ] No CSRF protection
- [ ] Missing input validation on `/api/dashboard`, `/api/analytics`, `/api/notifications`

### Medium Priority
- [ ] No Sentry error tracking configured
- [ ] No CI/CD pipeline
- [ ] No staging environment
- [ ] PDF reports missing custom logo upload
- [ ] No Word document export (grants require Word format)
- [ ] No onboarding flow for new users

### Backlog
- DSIRE API integration (currently static seed data)
- IRS Energy Community Map API
- OCR integration for scanned documents
- Virus scanning on file uploads
- Database backup configuration
- Mobile responsiveness

---

## 12. Design System (V41)

**Theme name:** V41 (referenced in `layout.tsx` comments)

**Typography:**
| Role | Font | Weights |
|------|------|---------|
| Body text | IBM Plex Sans | 400, 500, 600, 700 |
| Numbers, metrics, code | IBM Plex Mono | 400, 500, 600 |
| Headings, display | Sora | 400, 500, 600, 700, 800 |

**Color palette:**
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Primary | `hsl(221.2 83.2% 53.3%)` = `#3b82f6` | `hsl(217.2 91.2% 59.8%)` | Buttons, links, active states |
| Background | `hsl(210 40% 98%)` | `hsl(222.2 84% 4.9%)` = `#0f172a` | Page background |
| Foreground | `hsl(222.2 84% 4.9%)` | `hsl(210 40% 98%)` | Body text |
| Card | `white` | `hsl(217.2 32.6% 12%)` | Card backgrounds |
| Muted | `hsl(210 40% 96.1%)` | `hsl(217.2 32.6% 17.5%)` | Subdued backgrounds |

**Components:** 38 shadcn/ui components (Button, Card, Dialog, Tabs, Table, Badge, etc.)

**CSS location:** `src/app/globals.css` — all CSS custom properties at `:root` and `.dark`.

**Favicon:** Navy rectangle with "IE" in blue — defined inline in `layout.tsx` as SVG data URL.

---

## 13. Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| Aundre Oldacre | Founder & CEO | Product vision, enterprise sales, partnerships, fundraising |
| Steve Kumar | CTO | Technical architecture, engineering decisions |
| Dr. Malcolm Adams | Strategic Advisor | Governance, compliance, real estate industry relationships |

**AI partner:** CoCo (Claude Code) — handles implementation, architecture, documentation.

---

*Read this document before every session. Update the "Current Work Status" section after each batch of work.*
