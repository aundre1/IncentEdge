# Changelog

All notable changes to IncentEdge are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for Phase 1 Launch (March 10, 2026)
- Onboarding flow for new users (3-step wizard)
- Claude API wired to analysis UI (currently rule-based only)
- Test suite — unit tests for eligibility engine + integration tests for API routes
- Deadline reminder email triggers

---

## [1.0.0-alpha.2] — 2026-02-25

### Security Hardening — Batch 1

All critical findings from the security audit resolved before soft launch.

#### Fixed
- **CORS wildcard removed** (`src/lib/api-security.ts`): Removed latent `Access-Control-Allow-Origin: *` fallback block. Unknown origins now receive no CORS headers (blocked by browser). Explicit whitelist: localhost:3000/3001, incentedge.com, www.incentedge.com, app.incentedge.com.
- **CORS whitelist verified**: `DEFAULT_CORS_CONFIG.origins` confirmed correct — no changes required.
- **Stripe webhook signature**: `src/app/api/stripe/webhook/route.ts` already reads body as `request.text()` and calls `stripe.webhooks.constructEvent()` correctly — verified, no changes required.
- **Security headers verified** (`middleware.ts`): All 6 headers confirmed on every response — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Content-Security-Policy`, `Referrer-Policy`, `Strict-Transport-Security` (production).
- **Rate limiting verified**: Two-layer rate limiting confirmed — IP-based 100 req/min in `middleware.ts` (Edge runtime) + per-endpoint token bucket by subscription tier in `rate-limiter.ts`.

#### Added
- **Environment validation at startup** (`src/instrumentation.ts`): New Next.js instrumentation hook calls `validateEnvironment()` once on server startup. Dev mode warns; production mode throws on missing required vars, preventing unsafe startup.
- **React Error Boundary** (`src/components/ErrorBoundary.tsx`): Class component error boundary with user-friendly fallback UI (navy/blue V41 design), "Try again" reset button, and `section` prop for context-specific messages. Applied to `src/app/layout.tsx` wrapping `<Providers>`.

---

## [1.0.0-alpha.1] — 2026-02-24 / 2026-02-25

### Phase 2 — Knowledge Intelligence Layer

Semantic search, hybrid eligibility matching, awarded application probability scoring, and equipment categorization.

#### Added
- **Knowledge Index** (`src/lib/knowledge-index.ts`): Hybrid search engine using Anthropic API for 1536-dim embeddings stored in Supabase pgvector. Combines 60% semantic similarity + 40% BM25 keyword scoring. Supports `initializeKnowledgeIndex()` for bulk embedding generation, `search()` for hybrid queries, and result re-ranking with citation enrichment.
- **Eligibility Checker v2** (`src/lib/eligibility-checker.ts`): Phase 2 project-to-program matching engine. Scores programs by geography, sector, entity type, project size, financial thresholds, and IRA bonus adders (domestic content, prevailing wage, energy community, low-income community). Integrates with `HybridSearchEngine` from knowledge-index.
- **Incentive Extraction Worker** (`src/lib/incentive-extraction-worker.ts`): Async job worker for document extraction. Processes `document_extraction` job type from `background_jobs` queue — fetches document, parses PDF via `pdf-parse`, processes with AI via `incentive-program-processor`, saves results, updates job status with progress percentage.
- **Program Processor** (`src/lib/incentive-program-processor.ts`): Normalizes and enriches raw extracted program data for storage in `incentive_programs` table.
- **Job Processor** (`src/lib/job-processor.ts`): Central job dispatch router — reads jobs from `background_jobs` queue and routes to appropriate worker (extraction, sync, etc.).
- **Migration 015** (`supabase/migrations/015_knowledge_index_embeddings.sql`): pgvector embedding column on `incentive_programs`, HNSW index for fast similarity search, `search_programs_semantic()` and `search_programs_hybrid()` SQL functions.
- **Migration 016** (`supabase/migrations/016_awarded_applications.sql`): `awarded_applications` table — 6.5M external government award records. Schema for project_type, sector, TDC range, jurisdiction, award amount, applicant characteristics. Data foundation for Silo 2 probability scoring engine.
- **Migration 017** (`supabase/migrations/017_probability_scoring.sql`): `probability_scores` table — cached approval probability per `(project_id, program_id)` combination. Stores `approval_probability` (0-100), `sample_size`, `confidence_level` (very_high/high/medium/low/insufficient_data), `factors` JSONB, 7-day TTL with `is_stale` flag.
- **Migration 018** (`supabase/migrations/018_equipment_incentives.sql`): `equipment_category` column and `sector_tags TEXT[]` column added to `incentive_programs`. Partial index on `equipment_category`, GIN index on `sector_tags`. Enables filtering 700+ equipment-specific programs separately from real estate programs.

---

## [0.9.0] — 2026-02-17 to 2026-02-20

### Security Infrastructure Additions

#### Added
- **Field encryption** (`supabase/migrations/013_field_encryption.sql`): `encryption_keys` and `encryption_audit_log` tables for field-level encryption key management.
- **Tier 1 import schema** (`supabase/migrations/014_tier1_import_schema.sql`): Schema for bulk incentive program imports from external sources.
- **Incentive program sources** (`supabase/migrations/015_incentive_program_sources.sql`): `incentive_program_sources` table for tracking data provenance per program.
- **Encryption module** (`src/lib/encryption/`): Field-level encryption utilities.
- **Logging module** (`src/lib/logging/`): Structured logging infrastructure.
- **Security module** (`src/lib/security/`): Security utilities (input sanitization, token validation).
- **Compliance sub-module** (`src/lib/compliance/`): Compliance helper utilities.
- **Stripe sub-module** (`src/lib/stripe/`): Extended Stripe integration helpers.
- **API docs** (`src/app/api-docs/`): API documentation endpoint.

---

## [0.8.0] — 2026-01-18 to 2026-01-19

### Core Business Logic Completion

#### Added
- **Analytics engine** (`src/lib/analytics-engine.ts`, 62KB): Comprehensive analytics framework — activity logging, portfolio metrics, trend analysis scaffolding.
- **Compliance checker** (`src/lib/compliance-checker.ts`, 31KB): Post-award compliance tracking logic — milestone tracking, deadline detection, certification workflows.
- **Document processor** (`src/lib/document-processor.ts`, 38KB): Document parsing framework — metadata extraction, PDF processing (no OCR).
- **Workflow engine** (`src/lib/workflow-engine.ts`, 32KB): Grant application workflow — task management, status transitions, collaboration system.
- **AI recommendation engine** (`src/lib/ai-recommendation-engine.ts`, 26KB): Scaffolding for LLM-powered recommendations (Claude integration not yet wired).
- **Stacking analyzer** (`src/lib/stacking-analyzer.ts`, 28KB): Compatible program combination analysis, conflict detection, maximum value optimization.
- **Eligibility engine** (`src/lib/eligibility-engine.ts`, 59KB): Comprehensive rule-based multi-factor eligibility scoring — Census tract lookup, AMI calculations, sustainability tier bonuses.
- **Incentive matcher** (`src/lib/incentive-matcher.ts`, 20KB): AI-powered program matching with confidence scoring, jurisdiction filtering, sector filtering.
- **Direct Pay checker** (`src/lib/direct-pay-checker.ts`): IRA Section 6417 direct pay eligibility logic for tax-exempt entities.
- **PDF generator** (`src/lib/pdf-generator.ts`): Investor-ready PDF reports via `@react-pdf/renderer` with Recharts visualizations.
- **Email system** (`src/lib/email.ts`, `src/lib/email-triggers.ts`): Resend integration with email template framework and trigger definitions.
- **API security** (`src/lib/api-security.ts`): CORS configuration, request signing (HMAC), input sanitization, XSS/SQL injection prevention.
- **Rate limiter** (`src/lib/rate-limiter.ts`): Token bucket rate limiting by subscription tier (100 req/min read, 20 req/min write).
- **API utils** (`src/lib/api-utils.ts`): Shared API response helpers, pagination, error formatting.
- **Webhook dispatcher** (`src/lib/webhook-dispatcher.ts`): HMAC-signed webhook delivery with retry logic.
- **Job scheduler** (`src/lib/job-scheduler.ts`): Recurring background job management (Vercel cron-compatible).
- **Stripe subscriptions** (migration 011): `subscriptions` and `billing_events` tables.
- **Application outcomes** (migration 010): `application_outcomes` table for FOIA data + user-submitted results.
- **Auth providers** (`src/lib/auth-providers.ts`): OAuth provider configuration.

---

## [0.5.0] — 2026-01-09 to 2026-01-15

### Database Foundation + Authentication

#### Added
- **Initial schema** (migration 001): `organizations`, `profiles`, `projects`, `incentive_programs`, `project_incentive_matches` — core multi-tenant data model with RLS.
- **Sustainability tiers** (migration 002): `sustainability_tiers` table — LEED, ENERGY STAR, Passive House tier definitions.
- **Documents + eligibility** (migration 003): `documents`, `eligibility_results` tables — document management and eligibility caching.
- **Application workflow** (migration 004): `application_workflow`, `application_tasks`, `application_comments` — full grant application lifecycle.
- **Team permissions** (migration 005): `team_members`, `invitations` — RBAC membership management.
- **Compliance tracking** (migration 006): `compliance_tracking`, `compliance_milestones` — post-award compliance monitoring.
- **Webhooks + integrations** (migration 007): `webhooks`, `webhook_events`, `integration_connections`, `integration_sync_logs`.
- **Background jobs** (migration 008): `background_jobs`, `job_schedules`, `job_logs`, `job_metrics`, `job_dead_letter_queue`.
- **Incentive seed data** (migration 009, 91KB): 24,458 incentive programs loaded — federal, state-level programs across all major categories.
- **Authentication middleware** (`src/lib/auth-middleware.ts`): Supabase Auth integration, session validation, API key support.
- **Permissions** (`src/lib/permissions.ts`): RBAC — admin, manager, analyst, viewer roles with resource-level checks.
- **Constants** (`src/lib/constants.ts`): Platform-wide constants — program types, sectors, jurisdictions.
- **Supabase client** (`src/lib/supabase/`): Server and client Supabase instances (SSR-aware).
- **Next.js app structure**: App Router, `(auth)/` and `(dashboard)/` route groups, landing page, pricing page, legal pages, direct-pay tool.
- **38 shadcn/ui components**: Full component library (Button, Card, Dialog, Tabs, Table, Badge, Select, Input, etc.).
- **27 API route groups**: Complete API surface (see MASTER_HANDOVER.md Section 7).
- **V41 design system** (`src/app/globals.css`, `src/app/layout.tsx`): IBM Plex Sans/Mono + Sora fonts, navy/blue CSS custom property palette, dark mode support.
- **Stripe integration** (`src/lib/stripe.ts`): Subscription management, checkout sessions, customer portal, webhook handling.
- **Auth middleware** (`middleware.ts`): Route protection + all 6 security headers on every response.

---

[Unreleased]: https://github.com/aundre1/incentedge/compare/v1.0.0-alpha.2...HEAD
[1.0.0-alpha.2]: https://github.com/aundre1/incentedge/compare/v1.0.0-alpha.1...v1.0.0-alpha.2
[1.0.0-alpha.1]: https://github.com/aundre1/incentedge/compare/v0.9.0...v1.0.0-alpha.1
[0.9.0]: https://github.com/aundre1/incentedge/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/aundre1/incentedge/compare/v0.5.0...v0.8.0
[0.5.0]: https://github.com/aundre1/incentedge/compare/v0.1.0...v0.5.0
