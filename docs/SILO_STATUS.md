# IncentEdge — Silo Status Document

**Last Updated:** February 25, 2026
**Status:** Phase 1 MVP in active development

> For each silo: what exists, what doesn't, dependencies, and effort estimates.

---

## Silo 1: Discovery Engine

**Overall Status:** ~75% complete
**Target:** Launch-ready March 10, 2026

### What Backend Files Exist

| File | Size | Status | Notes |
|------|------|--------|-------|
| `src/lib/eligibility-engine.ts` | 59,947 bytes | 90% complete | Multi-factor rule-based scoring; no ML model |
| `src/lib/eligibility-checker.ts` | 19,383 bytes | 90% complete | Phase 2 checker with hybrid search integration |
| `src/lib/incentive-matcher.ts` | 20,653 bytes | 90% complete | Program matching + confidence scoring |
| `src/lib/stacking-analyzer.ts` | 28,086 bytes | 70% complete | Compatible program combinations; perf not tested at scale |
| `src/lib/knowledge-index.ts` | 14,510 bytes | 90% complete | Hybrid search: Anthropic embeddings + pgvector + BM25 |
| `src/lib/direct-pay-checker.ts` | 12,950 bytes | 85% complete | IRA §6417 direct pay eligibility |
| `src/lib/pdf-generator.ts` | 26,291 bytes | 85% complete | PDF reports via @react-pdf/renderer; no logo upload |
| `src/lib/incentive-extraction-worker.ts` | 13,537 bytes | 80% complete | Async document extraction job worker |
| `src/lib/incentive-program-processor.ts` | 12,571 bytes | 80% complete | Program data processor + normalization |
| `src/lib/compliance-checker.ts` | 31,014 bytes | 50% complete | Post-award compliance; no email triggers wired |
| `src/lib/analytics-engine.ts` | 62,547 bytes | 30% complete | Framework exists; no customer-facing BI |
| `src/lib/job-processor.ts` | 30,243 bytes | 90% complete | Background job processor |
| `src/lib/job-scheduler.ts` | 26,055 bytes | 90% complete | Recurring job scheduling |
| `src/lib/document-processor.ts` | 38,608 bytes | 40% complete | Document parsing; no OCR; limited file types |
| `src/lib/email.ts` | 8,205 bytes | 40% complete | Resend integration; templates not wired |
| `src/lib/email-triggers.ts` | 9,752 bytes | 40% complete | Trigger definitions; not connected to events |

### What Frontend Exists

| Page/Component | Status | Notes |
|----------------|--------|-------|
| Landing page (`src/app/page.tsx`) | 85% | Hero, stats, features, pricing, CTAs |
| Auth pages (`src/app/(auth)/`) | 100% | Login, signup, password reset |
| Dashboard layout | 60% | Navigation, sidebar, app shell |
| Projects list + detail | 60% | CRUD works; analysis results UI partial |
| Direct Pay page (`src/app/direct-pay/`) | 80% | IRA §6417 checker UI |
| Pricing page (`src/app/pricing/`) | 90% | Tier cards + Stripe checkout |
| Legal pages (`src/app/legal/`) | 90% | Terms, Privacy |
| 38 shadcn/ui components | 100% | Button, Card, Dialog, Tabs, Table, Badge, etc. |
| ErrorBoundary | 100% | Batch 1 — wraps all pages |

### What's Missing in Silo 1

| Gap | Impact | Effort |
|-----|--------|--------|
| Onboarding flow (3-step new user wizard) | High — no activation path | 3 days |
| AI integration in UI (Claude API not wired to analysis) | High — rule-based only | 1 week |
| Deadline reminder emails | Medium — retention risk | 3 days |
| Word document export | Medium — grant writing prereq | 2 days |
| Test coverage | Critical — zero tests | 2 weeks |
| DSIRE API integration (currently static seed data) | High — data freshness | 2 weeks |
| Full mobile responsiveness | Medium | 3 days |
| Custom logo in PDF reports | Low | 1 day |

### Key Database Tables

| Table | Records | Notes |
|-------|---------|-------|
| `incentive_programs` | 24,458 | Seed data from migration 009; unverified against live sources |
| `projects` | User-created | Full lifecycle support |
| `project_incentive_matches` | User-created | Cached eligibility results |
| `knowledge_index_embeddings` | To be generated | pgvector; requires Anthropic API call to populate |
| `equipment_incentives` (columns on `incentive_programs`) | 700+ records | Equipment category classification |

### Dependencies to Launch Silo 1

1. Anthropic API key must be set — required for hybrid search embeddings
2. `knowledge_index_embeddings` must be populated (run `initializeKnowledgeIndex()` once)
3. Supabase pgvector extension must be enabled
4. Rate limiting Redis fallback (currently in-memory — won't scale beyond 1 Vercel instance)

### Effort to Production-Ready

**Remaining work:** ~3-4 weeks focused effort
- Critical security fixes: 3 days
- Onboarding flow: 3 days
- AI wiring in UI: 1 week
- Test suite (>80% on lib/): 2 weeks
- Polish + QA: 3 days

---

## Silo 2: Grant Writing AI

**Overall Status:** ~30% complete
**Target:** Launch April-May 2026

### What Backend Files Exist

| File | Status | Notes |
|------|--------|-------|
| `src/lib/workflow-engine.ts` (32KB) | 60% | Task management, status tracking, collaboration |
| `src/lib/ai-recommendation-engine.ts` (26KB) | 25% | Scaffolding only; no Claude integration |
| `supabase/migrations/004_application_workflow.sql` | 100% | Full application workflow schema |
| `supabase/migrations/010_application_outcomes.sql` | 100% | FOIA + user application results |
| `supabase/migrations/016_awarded_applications.sql` | 100% | 6.5M awarded applications (probability data foundation) |
| `supabase/migrations/017_probability_scoring.sql` | 100% | Probability score cache (7-day TTL) |
| `src/app/api/applications/` | 40% | Route stubs exist; not feature-complete |

### What Frontend Exists

**Nothing.** Silo 2 has zero frontend UI built.

### What's Missing

| Gap | Impact | Effort |
|-----|--------|--------|
| Grant writing UI | Critical — entire silo blocked | 2 weeks |
| Claude API integration for narrative generation | Critical | 1 week |
| Application template library (20+ forms) | Critical | 1 week |
| Document assembly (Word/PDF per program format) | High | 1 week |
| Human review workflow UI | High | 1 week |
| Probability score display in Discovery UI | High | 3 days |
| Winning application repository (data collection) | High — needs partnership | Ongoing |
| Submission API integrations (direct to programs) | Low — nice to have | 3 weeks |

### Dependencies to Launch Silo 2

1. **Claude API integration** — narrative generation requires Anthropic Claude
2. **Grant consultant partnerships** — needed to populate winning application repository
3. **Legal review** — application templates must be reviewed for each program
4. **Silo 1 must be live** — users need Discovery results to trigger grant writing

### Effort to Production-Ready

**Remaining work:** ~8-10 weeks focused effort
- Grant writing UI: 2 weeks
- Claude integration + prompts: 1 week
- Template library (20 forms): 1 week
- Document assembly: 1 week
- Human review workflow: 1 week
- Probability score UI: 3 days
- QA + legal review: 1 week

### Data Model

The probability scoring loop (migration 016 + 017) is the core differentiator:

```
awarded_applications table (6.5M records)
  ↓ aggregate by: sector, state, TDC range, applicant type, technologies
  ↓ compare to: project characteristics
  ↓ compute: approval_probability (0-100)
  ↓ cache in: probability_scores (7-day TTL)
  ↓ display: "73% approval probability (based on 1,247 comparable awards)"
```

The 6.5M records in `awarded_applications` need to be populated from government databases (HUD FOIA, DOE awards data, IRS program data). The table schema is built; the data ingestion pipeline is not.

---

## Silo 3: Tax Credit Marketplace

**Overall Status:** ~10% complete (schema concept only)
**Target:** Q2-Q3 2026

### What Exists

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe integration | 95% | Payments infrastructure ready; not configured for marketplace |
| Conceptual DB schema | Design only | No migrations written for marketplace-specific tables |
| Revenue model defined | Complete | 3%/2.5%/2.25% tiered on volume |

### What's Missing (Essentially Everything)

| Component | Effort | Notes |
|-----------|--------|-------|
| Credit listing UI | 2 weeks | Sellers post available tax credits |
| Buyer dashboard | 2 weeks | Institutional buyers browse listings |
| Matching algorithm | 2 weeks | Auto-match credits to buyers by type/geography |
| Bidding system | 2 weeks | Real-time offers, counter-offers (WebSockets) |
| Transaction escrow | 2 weeks | Stripe Connect for fund holding |
| KYC/AML | 1 week | Stripe Identity for buyer verification |
| IRS Form 3800 verification | 2 weeks | Verify credit eligibility pre-transfer |
| Legal template generation | 1 week | Purchase agreements per state |
| Deal pipeline (CRM view) | 1 week | Track listing → offer → closing |
| C-PACE referral integration | 1 week | Partner lender webhooks + referral tracking |

### Regulatory Path

**This silo cannot launch without legal clearance.** Full analysis in `docs/PRD.md` Section 7.

**The short version:**

| Activity | Status | Required Before Launch |
|----------|--------|----------------------|
| Section 6418 marketplace model | Tech facilitator (no BD license if structured correctly) | Written securities law opinion |
| C-PACE referrals | Referral model, debt not securities | State-level PACE statute confirmation |
| Tax credit advisory | Regulated activity | BD partner agreement OR written exemption opinion |
| KYC/AML for buyers | Required | Stripe Identity integration + compliance policy |
| Contingency fees on federal grants | PROHIBITED (31 USC 3905) | Flat-fee model only — already in pricing |

**Recommended Silo 3 launch sequence:**
1. Get securities law opinion on marketplace model (6-8 weeks)
2. Engage BD partner (or confirm tech facilitator exemption in writing)
3. Set up Stripe Connect for escrow
4. Integrate Stripe Identity for KYC
5. Build listing + matching UI
6. Soft launch with 5 pre-vetted institutional buyers

### Dependencies

1. **Securities attorney opinion** — required
2. **BD partner agreement** (or written exemption) — required
3. **5+ institutional buyers pre-committed** — marketplace needs both sides
4. **Silo 1 live** — buyers come from Discovery pipeline (developers with credits to sell)
5. **Silo 2 partially live** — awarded projects generate credits to list

### Effort to Production-Ready

**Remaining work:** ~14-16 weeks + legal process
- Legal/regulatory review: 8 weeks (parallel track, external)
- Core marketplace build: 8-10 weeks engineering
- KYC/AML integration: 1 week
- BD partner onboarding: 2-4 weeks
- Buyer pipeline (sales/BD): Ongoing from now

---

## Cross-Silo Dependencies

```
Silo 1 (Discovery Engine)
  └── Required for: Silo 2 (generates grant applications from discovery results)
  └── Required for: Silo 3 (generates tax credits from successful applications)

Silo 2 (Grant Writing AI)
  └── Feeds: Silo 3 (awarded applications generate transferable tax credits)
  └── Requires: Silo 1 live + user base

Silo 3 (Marketplace)
  └── Requires: Both Silo 1 and Silo 2 live (credits come from awarded grants)
  └── Requires: Legal clearance (independent of technical readiness)
```

**Critical path:** Silo 1 → Silo 2 → Silo 3. Do not try to build all three concurrently.

---

*Update this document after each silo milestone.*
