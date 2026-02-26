# IncentEdge — Product Requirements Document

**Last Updated:** February 25, 2026
**Status:** Phase 1 MVP — Target Launch March 10, 2026
**Version:** 1.2
**Authors:** Aundre Oldacre (Founder), Steve Kumar (CTO)

---

## 1. Executive Summary

IncentEdge is an AI-powered platform that transforms how real estate developers discover, apply for, and monetize government incentive programs. The platform delivers on one core promise:

> **Transform developers from 20% minority partner to 55%+ majority owner** by unlocking the $500B+ annual incentive landscape that currently requires 200+ hours of manual research per project.

The insight behind IncentEdge is structural: the U.S. incentive landscape — IRA clean energy credits, LIHTC, HTC, NMTC, PACE, CDBG, HOME, federal/state grants — is so fragmented that most developers leave money on the table. A developer pursuing a mixed-use affordable housing + solar project in Ohio can access 40+ overlapping programs across four jurisdictions. No individual or small team has the capacity to find, score, and stack them all.

IncentEdge solves this with three integrated revenue silos:

1. **Discovery Engine (Silo 1, SaaS):** AI matches a project to 24,458+ programs in under 60 seconds, returning eligibility scores, stacking opportunities, and a PDF report — vs. the 200+ hours a consultant charges for.
2. **Grant Writing AI (Silo 2, Service):** Uses 6.5M awarded application records to generate high-probability grant narratives. Target: 70%+ approval rate vs. 40% industry average.
3. **Tax Credit Marketplace (Silo 3, Transaction):** Direct transfer marketplace for Section 6418 credits (IRA). Developers sell tax credits at 92-94 cents on the dollar, closing in days vs. 3-6 months through traditional broker channels.

---

## 2. Problem Statement

### The Fragmentation Problem

The U.S. government incentive ecosystem spans:
- 24,458+ active programs across federal, state, county, and municipal levels
- 9 major program categories (grants, tax credits, loans, rebates, bonds, etc.)
- Rapidly changing IRA bonus adders (domestic content, energy community, prevailing wage) worth 10-30% on top of base credits
- No single authoritative database — DSIRE covers renewables only, federal.grants.gov covers grants only, IRS handles tax credits separately

### The Developer Experience Today

An affordable housing developer pursuing a mixed-use project:
- Spends 200+ hours manually researching applicable programs
- Hires a grant consultant at $150-400/hour with no guarantee of approval
- Lacks a stacking analysis — misses compatible program combinations
- Sells tax credits through a broker who takes 3-8% and takes 3-6 months to close
- Leaves 20-30% of available incentive value uncaptured

### The Market Opportunity

| Segment | TAM | Notes |
|---------|-----|-------|
| Discovery SaaS | $500B+ incentive programs annually | 5% SaaS penetration = $25B |
| Grant Writing AI | $2B+ consulting market | Disrupts $400/hr consultants |
| Tax Credit Marketplace | $50B+ IRA/LIHTC credit transfers | 2-3% transaction fees |

---

## 3. Three Revenue Silos

### Silo 1: Discovery Engine (SaaS Subscription)

**What it does:** Matches real estate development projects to incentive programs using AI eligibility scoring, stacking analysis, and investor-ready PDF reports.

**Implementation status:** ~75% complete (see Silo Status document for detail)

**Key capabilities:**
- Project intake: location, sector, size, construction type, technologies, certifications
- Eligibility scoring: multi-factor match (geography, sector, entity type, size, financials)
- Bonus detection: domestic content, prevailing wage, energy community, low-income community adders
- Stacking optimizer: compatible program combinations for maximum value
- PDF report generation: investor-ready output with charts
- Direct Pay checker: IRA Section 6417 direct pay eligibility for tax-exempt entities

**Pricing:**
| Tier | Monthly | Annual | Projects | Seats |
|------|---------|--------|----------|-------|
| Solo | $499 | $4,990 | 5 | 1 |
| Team | $1,299 | $12,990 | 25 | 5 |
| Enterprise | Custom | Custom | Unlimited | Unlimited |

---

### Silo 2: Grant Writing AI (Service + SaaS)

**What it does:** Uses 6.5M awarded application records (migration 016) to compute approval probability scores and generate AI-drafted grant narratives tailored to each program's requirements.

**Implementation status:** ~30% complete — database schema done (migrations 016, 017), no frontend UI yet

**Key capabilities (planned):**
- Probability scoring: "Based on 1,247 comparable awards, your project has 73% approval probability"
- AI narrative generation: Claude-powered section drafting (project description, need statement, impact, budget)
- Application templates: 20+ program-specific forms
- Document assembly: Word/PDF output
- Winning application repository: indexed successful submissions for pattern matching

**Pricing:** $2,500–$35,000 per application (no contingency fees per regulatory requirements)

---

### Silo 3: Tax Credit Marketplace (Transaction Fees)

**What it does:** Direct transfer marketplace for Section 6418 IRA tax credits. Also refers C-PACE financing.

**Implementation status:** ~10% complete — schema only, no implementation

**Regulatory path:**
- **Section 6418 marketplace:** Operates as a technology marketplace facilitating buyer-seller introductions. Does NOT purchase or hold credits. No broker-dealer license required for this model (technology facilitator exemption). Consult securities counsel before launch.
- **C-PACE financing:** Debt instrument, not a security. Referral model to lenders (Greenworks Lending, Nuveen, Counterpoint Capital) earns referral fees without a license.
- **Tax credit advisory:** Requires engagement of a registered BD partner for any advisory services. Structure as technology fee only until BD partnership in place.

**Revenue model:** 3% on first $5M volume, 2.5% on $5-15M, 2.25% above $15M

---

## 4. User Personas

### Persona 1: Affordable Housing Developer

**Profile:** Marcus, VP of Development at a nonprofit CHDO with 300 units in pipeline.

**Pain:** Marcus knows LIHTC, HOME, and CDBG but misses IRA bonus adders worth $2-4M per project. He doesn't have staff to research state programs and can't afford a $50K grant consultant on every deal.

**Jobs to be done:**
- Identify every applicable federal + state + local program for a given address
- Quantify the stacking opportunity for LIHTC + ITC + HUD grants
- Generate a grant application for the Ohio HOME program without a 40-hour engagement

**Success metric:** IncentEdge surfaces $168.7M+ in identified incentives per project in under 60 seconds.

---

### Persona 2: Commercial Real Estate Developer

**Profile:** Diana, Principal at a 10-person commercial RE firm developing a 200,000 SF mixed-use in an Opportunity Zone.

**Pain:** Diana's deals are sensitive to incentive stack changes. She needs a quick eligibility scan before committing to LOI on a site — not a 3-week consultant engagement.

**Jobs to be done:**
- 60-second eligibility scan during site underwriting
- PDF report for LP investor deck
- Understand stacking of Opportunity Zone + HTC + state tax credits

**Success metric:** Underwriting analysis in under 10 minutes with stackable incentive values.

---

### Persona 3: Clean Energy / IRA Developer

**Profile:** Kenji, Director at a solar + storage developer chasing IRA bonus adders on 15 projects/year.

**Pain:** The IRA bonus adder rules (domestic content, energy community, low-income adders) change fast. Kenji's team manually tracks energy community maps and prevailing wage guidance — a full-time job.

**Jobs to be done:**
- Confirm energy community eligibility at specific census tract
- Calculate ITC/PTC base + adders for each project
- Sell surplus tax credits via direct transfer (Section 6418) quickly

**Success metric:** Accurate IRA bonus calculation + tax credit marketplace with 7-day close vs. 3-6 months.

---

## 5. Core User Flows

### Flow 1: Discovery (Primary MVP Flow)

```
1. Signup / Login (Supabase Auth)
2. Create Project
   - Enter: address, sector, building type, total development cost
   - Select: technologies, certifications, entity type
   - Confirm: bonus eligibility checkboxes (energy community, prevailing wage, etc.)
3. Run Analysis
   - System runs eligibility-checker.ts against 24,458+ programs
   - Knowledge-index.ts hybrid search (semantic + keyword) surfaces top matches
   - Stacking analyzer finds compatible program combinations
4. Review Results
   - List view: programs ranked by match confidence + estimated value
   - Detail view: eligibility score breakdown, documentation requirements
   - Stacking view: max-value program combinations
5. Export Report
   - PDF: investor-ready report with charts (pdf-generator.ts)
   - In future: Word doc for grant applications
```

### Flow 2: Direct Pay Check (IRA Section 6417)

```
1. Navigate to /direct-pay
2. Enter entity type, project type, technologies
3. System checks direct-pay-checker.ts logic
4. Returns: eligible/ineligible with qualifying conditions
```

### Flow 3: Grant Writing (Phase 2 — not yet in UI)

```
1. Select matched program from Discovery results
2. System pulls probability score from probability_scores table
   (computed from awarded_applications — migration 016)
3. User reviews "73% approval probability (1,247 comparable awards)"
4. User triggers AI draft generation
5. System generates section-by-section narrative via Claude API
6. User reviews, edits, exports Word/PDF
```

---

## 6. Feature Requirements

### Implemented (Production-Ready or Near)

| Feature | File(s) | Status |
|---------|---------|--------|
| Supabase Auth + SSO | `src/lib/auth-middleware.ts`, `src/lib/permissions.ts` | 100% |
| Role-based access control | `src/lib/permissions.ts` | 100% |
| Database schema (18 migrations) | `supabase/migrations/001-018_*.sql` | 100% |
| API security (CORS, rate limiting, sanitization) | `src/lib/api-security.ts`, `src/lib/rate-limiter.ts` | 95% |
| Eligibility scoring engine | `src/lib/eligibility-engine.ts` | 90% |
| Incentive matching | `src/lib/incentive-matcher.ts` | 90% |
| Stacking analyzer | `src/lib/stacking-analyzer.ts` | 70% |
| Direct Pay checker (IRA §6417) | `src/lib/direct-pay-checker.ts` | 85% |
| PDF report generation | `src/lib/pdf-generator.ts` | 85% |
| Semantic + hybrid search | `src/lib/knowledge-index.ts` | 90% |
| Eligibility checker v2 | `src/lib/eligibility-checker.ts` | 90% |
| Incentive extraction worker | `src/lib/incentive-extraction-worker.ts` | 80% |
| Program processor | `src/lib/incentive-program-processor.ts` | 80% |
| Stripe subscriptions | `src/lib/stripe.ts`, migration 011 | 95% |
| Email framework (Resend) | `src/lib/email.ts`, `src/lib/email-triggers.ts` | 40% |
| Compliance tracking | `src/lib/compliance-checker.ts` | 50% |
| Workflow engine (backend) | `src/lib/workflow-engine.ts` | 60% |
| Analytics engine (backend) | `src/lib/analytics-engine.ts` | 30% |
| React Error Boundary | `src/components/ErrorBoundary.tsx` | 100% |
| Environment validation at startup | `src/instrumentation.ts` | 100% |
| Security headers (middleware) | `middleware.ts` | 100% |
| Dashboard UI | `src/app/(dashboard)/*` | 60% |

### Planned (Not Yet Implemented)

| Feature | Silo | Priority | Effort |
|---------|------|----------|--------|
| AI grant narrative generation | 2 | P0 | 2 weeks |
| Application template library (20+ forms) | 2 | P0 | 1 week |
| Grant writing UI | 2 | P0 | 2 weeks |
| Probability score display in UI | 2 | P1 | 3 days |
| Tax credit marketplace (Section 6418) | 3 | P1 | 12 weeks |
| KYC/AML for marketplace | 3 | P1 | 2 weeks |
| Escrow / payment processing | 3 | P1 | 2 weeks |
| C-PACE referral integration | 3 | P2 | 1 week |
| DSIRE API real-time sync | 1 | P1 | 2 weeks |
| Onboarding flow | 1 | P1 | 3 days |
| Deadline reminder emails | 1 | P2 | 3 days |
| Word document export | 1+2 | P2 | 2 days |
| Mobile app | 4 | P3 | 3 months |
| Procore / Yardi integrations | 4 | P3 | 4 weeks |

---

## 7. Silo 3 Regulatory Path

**Critical: Confirm with securities attorney before Silo 3 launch.**

### Section 6418 Tax Credit Direct Transfer

The Inflation Reduction Act (2022) created a new mechanism (Section 6418) allowing direct transfer of clean energy tax credits between unrelated parties. Key regulatory facts:

- **No broker-dealer license required** for a technology marketplace that facilitates buyer-seller introductions without holding credits or providing investment advice.
- IncentEdge's model: technology fee for connecting buyers and sellers; no principal transactions; no advisory services.
- **Risk:** If IncentEdge materially structures transactions (e.g., aggregating credits into packages, pricing credits, providing valuation opinions), this may constitute regulated activity. Maintain "pure marketplace" model at launch.
- **IRS Notice 2023-29:** Governs direct pay and transfer mechanics. Credits transfer via IRS Form 3800 (General Business Credit).

### C-PACE Financing

- C-PACE is a **debt instrument** (property-assessed clean energy lien), not a security.
- Referral model to licensed C-PACE lenders (Greenworks Lending, Nuveen, Counterpoint Capital) earns referral fees without requiring a license.
- Check state-level C-PACE enabling legislation — not all states have it.

### Advisory Services

- Any service characterized as "advising" on tax credit valuation or transfer structuring requires a BD partner.
- Recommended path: engage a registered BD partner for advisory wrapper; IncentEdge provides technology infrastructure.

---

## 8. Success Metrics

### Phase 1 (MVP, March 10 Launch)
- 10 beta customers signed up by March 10
- 80%+ complete first analysis (activation)
- Analysis time < 10 minutes (currently ~30 seconds rule-based; target with AI: < 10 min)
- Eligibility accuracy > 90% (vs. consultant benchmark)
- Zero critical security issues
- NPS > 40

### Phase 2 (Grant Writing, April-May 2026)
- 30 grant applications submitted
- 70%+ approval rate (vs. 40% industry average)
- $300K revenue from application fees
- 100+ winning applications indexed in repository

### Phase 3 (Marketplace, Q2-Q3 2026)
- $10M+ transaction volume
- 10+ institutional buyers onboarded
- Average deal close < 7 days
- 92-94 cents on dollar pricing

### Year 1
- $5M ARR
- 500 active subscribers
- $500M incentive value processed

---

## 9. Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js | 15.x |
| UI library | React | 19.x |
| Language | TypeScript | 5.6.3 |
| CSS | Tailwind CSS | 3.4.17 |
| UI components | shadcn/ui + Radix UI | Latest |
| Database | Supabase PostgreSQL | 15.x |
| Vector search | pgvector (Supabase) | Latest |
| Auth | Supabase Auth | 2.47.10 |
| AI/LLM | Anthropic Claude | @anthropic-ai/sdk |
| Payments | Stripe | 20.2.0 |
| Email | Resend | 6.8.0 |
| State management | Zustand + React Query | 5.x |
| PDF generation | @react-pdf/renderer | 4.3.2 |
| Charts | Recharts | 2.15.0 |
| Forms | React Hook Form + Zod | 7.54.2 / 3.24.1 |
| Deployment | Vercel (serverless) | Latest |
| Database project | Supabase `pzmunszcxmmncppbufoj` | us-west-2 |

**Design system:** V41 — IBM Plex Sans (body), IBM Plex Mono (numbers), Sora (headings). Navy/Blue palette (`#0f172a` navy, `#3b82f6` blue). CSS custom properties in `globals.css`.

---

## 10. Phase Roadmap

| Phase | Target | Goal | Revenue |
|-------|--------|------|---------|
| **Phase 1: MVP** | March 10, 2026 | Discovery Engine to 10 beta customers | $85K ARR |
| **Phase 2: Grant Writing** | April-May 2026 | AI grant application generator | $300K Year 1 |
| **Phase 3: Marketplace** | Q2-Q3 2026 | Section 6418 tax credit marketplace | $200K Year 1 |
| **Phase 4: Scale** | H2 2026 | Mobile, API, enterprise features | $5M ARR |

---

*This document is the authoritative product requirements reference. Update after each phase milestone.*
