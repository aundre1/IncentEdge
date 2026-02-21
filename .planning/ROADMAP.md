# IncentEdge Feature Roadmap

**Document Version:** 1.0
**Last Updated:** February 16, 2026
**Planning Horizon:** 12 months (Feb 2026 - Feb 2027)
**Based on:** IncentEdge_PRD_VibeCoding_Suite.md

---

## Roadmap Overview

IncentEdge follows a **4-phase launch strategy** to deliver three integrated revenue streams:

1. **Phase 1: MVP Launch** (2-3 weeks) - Discovery Engine SaaS
2. **Phase 2: Grant Writing** (4-6 weeks) - AI-powered application generation
3. **Phase 3: Marketplace** (8-12 weeks) - Tax credit monetization
4. **Phase 4: Scale Features** (3-6 months) - Advanced analytics, mobile, API

**Strategic Principle:** Launch lean, iterate fast, scale proven features.

---

## Phase 1: MVP Launch - Discovery Engine
**Timeline:** Weeks 1-3 (Feb 16 - Mar 8, 2026)
**Goal:** Ship production-ready Discovery Engine to first 10 paying customers
**Target Revenue:** $85K ARR from beta cohort

### Week 1: Critical Fixes & Foundation (Feb 16-23)

#### Security & Stability (P0)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Fix SQL injection in search params | Backend | 1 | None | **1000** |
| Add error handling to 57 async ops | Backend | 2 | None | **950** |
| Implement environment validation | DevOps | 0.5 | None | **900** |
| Fix CORS wildcard vulnerability | Backend | 0.5 | None | **900** |
| Add React error boundaries | Frontend | 1 | None | **850** |
| Remove sensitive console.log (330) | Full Stack | 1 | None | **800** |
| Audit & test all RLS policies | Backend | 2 | Supabase | **950** |

**Success Criteria:**
- [ ] Zero critical security issues in audit
- [ ] All API routes have try-catch
- [ ] App doesn't crash on component errors
- [ ] No sensitive data in logs
- [ ] RLS policies verified on all tables

---

#### AI Integration (P0)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Integrate Claude API (Anthropic) | Backend | 2 | API key | **900** |
| Build prompt templates for analysis | AI/Product | 1 | Claude | **850** |
| Implement streaming responses | Backend | 1 | Claude | **700** |
| Add AI result caching (Redis) | Backend | 1 | Infrastructure | **650** |
| Create fallback for AI failures | Backend | 0.5 | None | **600** |

**Success Criteria:**
- [ ] AI analysis completes in <10 minutes
- [ ] Streaming progress updates work
- [ ] Graceful degradation if API fails
- [ ] Results cached for 24 hours

---

### Week 2: Core Features & Testing (Feb 24 - Mar 2)

#### Testing Infrastructure (P0)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Write unit tests for eligibility engine | Backend | 2 | Vitest | **850** |
| Write integration tests for API routes | Backend | 2 | Vitest | **800** |
| E2E tests for critical user paths | QA | 2 | Playwright | **750** |
| Set up CI/CD with test automation | DevOps | 1 | GitHub Actions | **700** |
| Implement test coverage reporting | DevOps | 0.5 | Codecov | **650** |

**Success Criteria:**
- [ ] 80%+ code coverage on /lib files
- [ ] All API routes have integration tests
- [ ] E2E tests for signup → analysis → report
- [ ] CI fails on <80% coverage

---

#### UI/UX Polish (P1)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Complete PDF export with branding | Frontend | 2 | None | **800** |
| Add Word document export | Frontend | 1 | docx.js | **700** |
| Build onboarding flow (3 steps) | Frontend | 2 | Design | **750** |
| Add loading states to all async ops | Frontend | 1 | None | **650** |
| Implement toast notifications | Frontend | 0.5 | shadcn | **600** |
| Mobile responsive fixes | Frontend | 1.5 | None | **550** |

**Success Criteria:**
- [ ] PDF reports include custom logo
- [ ] Word export for grant applications
- [ ] New users see onboarding on first login
- [ ] No blank states during loading
- [ ] Mobile works on iPhone/Android

---

### Week 3: Launch Prep & Beta (Mar 3-8)

#### Documentation & Monitoring (P1)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Set up Sentry error tracking | DevOps | 0.5 | Sentry account | **800** |
| Configure Vercel Analytics | DevOps | 0.5 | Vercel | **750** |
| Write API documentation | Backend | 1 | None | **650** |
| Create user help center (10 articles) | Product | 2 | None | **600** |
| Build admin dashboard for monitoring | Full Stack | 2 | None | **550** |

**Success Criteria:**
- [ ] Error tracking sends alerts to Slack
- [ ] Analytics track conversion funnel
- [ ] API docs published at /docs
- [ ] Help center live at help.incentedge.com
- [ ] Admin can view system health metrics

---

#### Beta Launch (P0)
| Task | Owner | Days | Dependencies | ICE Score |
|------|-------|------|--------------|-----------|
| Deploy to production (Vercel) | DevOps | 0.5 | Tests pass | **1000** |
| Invite 10 beta customers | Sales | 1 | None | **950** |
| Set up support ticketing (Intercom) | Product | 0.5 | Intercom | **700** |
| Monitor for critical issues (48hr) | Full Stack | 2 | Sentry | **900** |
| Collect feedback & prioritize fixes | Product | 1 | Beta users | **850** |

**Success Criteria:**
- [ ] 10 beta users signed up
- [ ] 8/10 complete first analysis
- [ ] <5% error rate in production
- [ ] Average analysis time <10 minutes
- [ ] NPS score >40

---

## Phase 1 Feature List (Must-Have for MVP)

### ✅ Core Features

| Feature | Description | Status | ICE Score |
|---------|-------------|--------|-----------|
| **AI Project Intake** | Address + docs → auto-extract project details | 🚧 60% | **800** |
| **Incentive Matching** | Rank 1,000+ programs by eligibility | ✅ 90% | **700** |
| **PDF Report Generation** | Investor-ready exports with charts | ✅ 85% | **720** |
| **User Auth + RBAC** | SSO, roles, permissions | ✅ 100% | **560** |
| **Payment Processing** | Stripe subscriptions (Solo/Team/Enterprise) | ✅ 95% | **504** |
| **Eligibility Scoring** | Multi-factor algorithm (location, sector, size) | ✅ 90% | **450** |
| **Project CRUD** | Create, view, edit, delete projects | ✅ 95% | **540** |
| **Dashboard Analytics** | Portfolio summary, trends | 🚧 60% | **480** |

### 🔄 Nice-to-Have (If Time Permits)

| Feature | Description | Status | ICE Score |
|---------|-------------|--------|-----------|
| **Deadline Reminders** | Email alerts 30/14/7 days before | ❌ 0% | **480** |
| **Team Collaboration** | Comments, @mentions, sharing | ❌ 0% | **378** |
| **Document Upload AI** | Extract data from PDFs/Word | ❌ 0% | **750** |
| **Stacking Optimizer** | Max value from compatible programs | ✅ 70% | **360** |

**MVP Scope Decision:** Defer Document Upload AI, Collaboration, Reminders to Phase 2.

---

## Phase 2: Grant Writing System
**Timeline:** Weeks 4-9 (Mar 9 - Apr 19, 2026)
**Goal:** Launch AI-powered grant application generator (Revenue Stream 2)
**Target Revenue:** $300K in Year 1 from 30+ applications

### Week 4-5: Application Workflow (Mar 9-22)

#### Core Infrastructure
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **Application Templates** | Library of 20+ grant forms | 5 | **850** | Legal review |
| **Document Requirements** | Checklist per incentive type | 2 | **700** | Program database |
| **Status Tracking UI** | Kanban board for applications | 3 | **680** | Workflow engine |
| **Task Assignment** | Assign to team members | 2 | **540** | Permissions |
| **Deadline Dashboard** | Calendar view with alerts | 2 | **600** | Email system |

**Success Criteria:**
- [ ] 20 templates covering top federal/state programs
- [ ] Users can create applications from incentive results
- [ ] Team members get email notifications for tasks
- [ ] Calendar shows all deadlines with color coding

---

### Week 6-7: AI Content Generation (Mar 23 - Apr 5)

#### LLM-Powered Writing
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **Narrative Generator** | Project description, impact, sustainability | 4 | **950** | Claude API |
| **Budget Table Builder** | Auto-populate from project financials | 2 | **800** | Project data |
| **Compliance Statements** | Generate required certifications | 2 | **750** | Legal templates |
| **Document Assembly** | Combine sections into Word/PDF | 3 | **820** | docx.js |
| **Review & Edit Mode** | Track changes, comments | 3 | **720** | Rich text editor |

**Success Criteria:**
- [ ] AI generates 90% of application in <15 minutes
- [ ] Output matches program-specific requirements
- [ ] Human reviewer can edit without breaking formatting
- [ ] Final export passes automated validation

---

### Week 8-9: Winning Application Repository (Apr 6-19)

#### Training Data & Pattern Matching
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **Application Upload** | Users/partners submit winning apps | 2 | **900** | Storage (S3) |
| **Data Extraction** | Parse PDFs to structured data | 3 | **850** | OCR, NLP |
| **Pattern Library** | Index by program, sector, size | 3 | **820** | Embeddings |
| **Similar Examples** | Show 3 relevant examples per section | 2 | **780** | Vector search |
| **Success Analytics** | Track approval rate by template | 2 | **650** | Analytics |

**Success Criteria:**
- [ ] 100+ winning applications uploaded (partners + web scraping)
- [ ] Users see relevant examples when writing
- [ ] Approval rate tracked per incentive type
- [ ] Target: 70% success rate on submitted apps

**Dependency:** Requires partnerships with grant consultants for anonymized samples.

---

## Phase 2 Feature List

| Feature | Description | Status | ICE Score |
|---------|-------------|--------|-----------|
| **AI Grant Writer** | Generate 90% of application | ❌ 0% | **950** |
| **Application Templates** | 20+ program-specific forms | ❌ 0% | **850** |
| **Workflow Engine** | Task assignment, status tracking | ✅ 60% | **680** |
| **Document Assembly** | Word/PDF export with formatting | 🚧 40% | **820** |
| **Winning App Repository** | 500+ indexed successful submissions | ❌ 0% | **900** |
| **Review Collaboration** | Comments, track changes | ❌ 0% | **720** |
| **Submission API** | Direct submit to programs (where available) | ❌ 0% | **600** |
| **Deadline Reminders** | Email 30/14/7 days before | ❌ 0% | **750** |

**Revenue Model:** $2.5K-35K per application (no contingency fees per regulations).

---

## Phase 3: Tax Credit Marketplace
**Timeline:** Weeks 10-21 (Apr 20 - Jul 12, 2026)
**Goal:** Launch marketplace for tax credit monetization (Revenue Stream 3)
**Target Revenue:** $200K in Year 1 from $10M transaction volume

### Week 10-12: Marketplace Infrastructure (Apr 20 - May 10)

#### Buyer/Seller Platform
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **Credit Listing UI** | Sellers post available credits | 4 | **880** | None |
| **Buyer Dashboard** | Institutional buyers browse listings | 4 | **860** | Auth |
| **Matching Algorithm** | Auto-match credits to buyers | 5 | **920** | ML model |
| **Bidding System** | Real-time offers, counter-offers | 5 | **800** | WebSockets |
| **Transaction Escrow** | Hold funds until deal closes | 4 | **950** | Stripe Connect |
| **Document Vault** | Secure storage for closing docs | 3 | **720** | S3 + encryption |

**Success Criteria:**
- [ ] Sellers can list credits in <5 minutes
- [ ] Buyers see matched opportunities in dashboard
- [ ] Bidding completes in <3 days (vs. 3-6 months traditional)
- [ ] Funds held in escrow until verified transfer

---

### Week 13-15: Buyer Onboarding (May 11-31)

#### Institutional Partnerships
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **KYC/AML Verification** | Identity verification for compliance | 4 | **950** | Stripe Identity |
| **API for Institutions** | Bulk credit purchase API | 5 | **850** | REST API |
| **Aggregation Engine** | Bundle small credits ($500K+) into packages | 4 | **880** | Algorithm |
| **Pricing Calculator** | Real-time valuation (92-94 cents) | 3 | **820** | Market data |
| **Legal Templates** | Purchase agreements, transfer docs | 4 | **900** | Legal review |

**Success Criteria:**
- [ ] 10+ institutional buyers onboarded
- [ ] API handles bulk purchases (>$5M)
- [ ] Pricing transparent (vs. hidden broker fees)
- [ ] Legal docs auto-generated per state

---

### Week 16-18: Transaction Processing (Jun 1-21)

#### Deal Flow & Compliance
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **Deal Pipeline** | Track listings → offers → closing | 4 | **800** | CRM |
| **IRS Form 3800 Parser** | Verify credit eligibility | 5 | **920** | Document AI |
| **State Transfer Process** | State-specific requirements | 4 | **850** | Legal |
| **Payment Processing** | Wire transfers, ACH | 3 | **900** | Stripe |
| **Commission Calculation** | 3%/2.5%/2.25% tiered | 2 | **780** | Billing |
| **Transaction Analytics** | Volume, velocity, pricing trends | 3 | **700** | BI |

**Success Criteria:**
- [ ] Average deal closes in <7 days
- [ ] 95%+ of credits pass IRS verification
- [ ] Commission auto-deducted and reported
- [ ] Transaction volume tracked in real-time

---

### Week 19-21: Scale & Optimize (Jun 22 - Jul 12)

#### Enterprise Features
| Feature | Description | Days | ICE Score | Dependencies |
|---------|-------------|------|-----------|--------------|
| **White-Label Portal** | Custom branding for large sellers | 5 | **750** | Multi-tenancy |
| **Bulk Upload** | Import 100+ credits via CSV | 3 | **700** | Data validation |
| **Advanced Analytics** | Market trends, pricing insights | 4 | **720** | BI dashboard |
| **Seller Reputation** | Rating system for transaction quality | 3 | **680** | Reviews |
| **Referral Program** | Earn 0.5% for bringing buyers/sellers | 3 | **820** | Marketing |

**Success Criteria:**
- [ ] 3+ enterprise sellers (>$10M annual volume)
- [ ] Bulk upload handles 500+ credits
- [ ] Analytics predict pricing trends
- [ ] Referral program drives 20% of new deals

---

## Phase 3 Feature List

| Feature | Description | Status | ICE Score |
|---------|-------------|--------|-----------|
| **Credit Listing** | Sellers post available tax credits | ❌ 0% | **880** |
| **Buyer Matching** | AI matches credits to institutions | ❌ 0% | **920** |
| **Bidding System** | Real-time offers, negotiations | ❌ 0% | **800** |
| **Transaction Escrow** | Secure fund holding | ❌ 0% | **950** |
| **KYC/AML Compliance** | Identity verification | ❌ 0% | **950** |
| **API for Institutions** | Bulk purchase integration | ❌ 0% | **850** |
| **Aggregation Engine** | Bundle small credits | ❌ 0% | **880** |
| **IRS Verification** | Auto-check Form 3800 | ❌ 0% | **920** |
| **Deal Analytics** | Transaction trends, pricing | ❌ 0% | **700** |

**Revenue Model:** 3% first $5M, 2.5% $5-15M, 2.25% above $15M (transparent fees).

---

## Phase 4: Scale Features
**Timeline:** Months 6-12 (Jul 2026 - Jan 2027)
**Goal:** Advanced capabilities for enterprise customers and market leadership
**Target Revenue:** $5M ARR by end of Year 1

### Advanced Analytics (Months 6-7)

| Feature | Description | ICE Score | Dependencies |
|---------|-------------|-----------|--------------|
| **Portfolio Intelligence** | Multi-project analytics, trends | **820** | BI infrastructure |
| **Market Benchmarking** | Compare to industry averages | **780** | Data partnerships |
| **Predictive Modeling** | Forecast incentive availability | **850** | ML models |
| **Custom Reports** | White-label for LP investors | **720** | Report builder |
| **API Analytics** | Developer metrics for integrations | **650** | API gateway |

---

### Mobile App (Months 7-9)

| Feature | Description | ICE Score | Dependencies |
|---------|-------------|-----------|--------------|
| **iOS App** | Native iPhone app | **780** | React Native |
| **Android App** | Native Android app | **760** | React Native |
| **Photo Capture** | Field documentation with GPS | **700** | Camera API |
| **Offline Mode** | Work without connectivity | **680** | Local storage |
| **Push Notifications** | Deadline alerts, status updates | **720** | Firebase |

---

### API & Integrations (Months 9-10)

| Feature | Description | ICE Score | Dependencies |
|---------|-------------|-----------|--------------|
| **Public API v1** | RESTful API for partners | **850** | Documentation |
| **Zapier Integration** | Connect to 5,000+ apps | **780** | Zapier SDK |
| **Procore Integration** | Construction management sync | **820** | Procore API |
| **Yardi Integration** | Property management sync | **800** | Yardi API |
| **QuickBooks Sync** | Financial data import | **750** | QuickBooks API |
| **Webhook System** | Event notifications | ✅ 70% | None |

---

### Enterprise Features (Months 10-12)

| Feature | Description | ICE Score | Dependencies |
|---------|-------------|-----------|--------------|
| **SSO (SAML/OKTA)** | Enterprise authentication | **900** | Identity provider |
| **Custom Workflows** | Tailor approval processes | **820** | Workflow builder |
| **Audit Logs** | Compliance tracking (SOC2) | **850** | Logging infra |
| **Role Customization** | Define custom permissions | **780** | RBAC engine |
| **Data Export** | Bulk export for compliance | **720** | ETL pipeline |
| **SLA Guarantees** | Contractual uptime/performance | **950** | Infrastructure |

---

## Phase 4 Feature List

| Feature | Description | Status | ICE Score |
|---------|-------------|--------|-----------|
| **Portfolio Analytics** | Multi-project intelligence | ❌ 0% | **820** |
| **Mobile App (iOS)** | Native iPhone app | ❌ 0% | **780** |
| **Mobile App (Android)** | Native Android app | ❌ 0% | **760** |
| **Public API** | Developer integrations | ❌ 0% | **850** |
| **Procore Integration** | Construction sync | ❌ 0% | **820** |
| **SSO (SAML)** | Enterprise auth | ❌ 0% | **900** |
| **Custom Workflows** | Tailored processes | ❌ 0% | **820** |
| **Audit Logs** | SOC2 compliance | ❌ 0% | **850** |
| **Predictive Modeling** | ML-based forecasting | ❌ 0% | **850** |

---

## Deferred to V2 (Year 2+)

### Won't Build in Year 1
- International incentives (Canada, UK, EU)
- Full project management suite (compete with Procore)
- General grant writing (non-real estate)
- Property management features (compete with Yardi)
- Construction financing tools (capital intensive)

### Strategic Partnerships Instead
- **Procore** - Project management integration
- **Yardi/RealPage** - Property management sync
- **Lenders** - Refer construction financing
- **Grant Consultants** - Partner for winning app repository

---

## ICE Scoring Framework

**Impact (1-10):** Revenue potential, competitive advantage, customer value
**Confidence (1-10):** Certainty of success, risk level
**Ease (1-10):** Development effort (10 = easy, 1 = hard)

**ICE Score = Impact × Confidence × Ease**

### Scoring Examples

| Feature | Impact | Confidence | Ease | Score | Rationale |
|---------|--------|------------|------|-------|-----------|
| AI Project Intake | 10 | 10 | 8 | **800** | Core differentiator, proven AI |
| Grant Writer | 10 | 8 | 4 | **320** | High value but complex |
| Marketplace MVP | 9 | 7 | 3 | **189** | High risk, hard execution |
| PDF Export | 8 | 10 | 9 | **720** | Table stakes, easy to build |

**Priority Cutoff:** ICE >500 = Must Have, 300-500 = Should Have, <300 = Could Have

---

## Dependencies & Risks

### Critical Path Dependencies

**Phase 1 → Phase 2:**
- AI integration must work before grant writing
- User base needed to collect winning applications
- Payment processing required for monetization

**Phase 2 → Phase 3:**
- Approved applications generate credits to sell
- Legal/compliance framework for transactions
- Institutional buyer relationships (6+ month sales cycle)

**External Dependencies:**
- **DSIRE API access** - Database of State Incentives (no confirmed partnership)
- **IRS API** - Energy community maps (public but limited)
- **Institutional buyers** - 50+ banks/insurance (outreach needed)
- **Legal review** - Grant templates, marketplace docs (consultant cost)

---

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **AI accuracy <90%** | High | Medium | Use hybrid AI + rules, continuous training |
| **DSIRE partnership fails** | Medium | Medium | Build web scraper, manual updates |
| **Marketplace low liquidity** | High | High | Guarantee first 5 buyers, aggregation |
| **Grant approval rate <60%** | High | Medium | Human review required, partner with experts |
| **Scale issues (>1000 users)** | Medium | Low | Redis caching, database optimization |

---

### Market Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Competitor launches AI grant writer** | High | Medium | Speed to market, quality differentiation |
| **Regulatory change (IRS rules)** | High | Low | Diversify incentive types, adapt quickly |
| **Economic downturn** | Medium | Medium | Focus on cost-saving value prop |
| **Low buyer demand (marketplace)** | High | Medium | Start with proven buyers, build liquidity |

---

## Success Metrics by Phase

### Phase 1 (MVP) - Weeks 1-3
- **Customers:** 10 beta users → 50 paid subscribers
- **ARR:** $0 → $500K (avg $10K/customer)
- **Engagement:** 80% activation rate (complete first analysis)
- **Technical:** <10 min analysis time, 99.9% uptime
- **Quality:** >90% eligibility accuracy, NPS >40

### Phase 2 (Grant Writing) - Weeks 4-9
- **Applications:** 30 submitted in Year 1
- **Revenue:** $300K from application fees ($10K avg)
- **Success Rate:** 70% approval (vs. 40% industry)
- **Repository:** 100+ winning applications indexed
- **Efficiency:** 90% AI-generated, 2-4 hours per app (vs. 40 hours)

### Phase 3 (Marketplace) - Weeks 10-21
- **Transaction Volume:** $10M+ in Year 1
- **Revenue:** $200K from 2.5% avg commission
- **Buyers:** 10+ institutional partners onboarded
- **Sellers:** 20+ developers listing credits
- **Pricing:** 92-94 cents on dollar (vs. 70-85 traditional)
- **Speed:** <7 days to close (vs. 3-6 months)

### Phase 4 (Scale) - Months 6-12
- **ARR:** $5M by end of Year 1
- **Customers:** 500 active subscribers
- **Incentives Processed:** $500M total value
- **Market Share:** 5% of addressable market
- **Enterprise:** 10+ customers at $100K+ ARR

---

## Resource Requirements

### Team Scaling Plan

**Current (MVP):**
- 1 Full Stack Engineer
- 1 Product Manager (part-time)
- 1 Designer (contract)

**Phase 2 (Grant Writing):**
- +1 AI/ML Engineer (LLM integration)
- +1 Grant Writer (QA/review)
- +1 Legal Consultant (templates)

**Phase 3 (Marketplace):**
- +1 Backend Engineer (transaction system)
- +1 BD/Partnerships (institutional buyers)
- +1 Compliance Officer (KYC/AML)

**Phase 4 (Scale):**
- +2 Full Stack Engineers
- +1 DevOps/SRE
- +1 Customer Success Manager
- +1 Data Scientist (ML models)

**Total Year 1 Headcount:** 8-10 FTEs + 3-4 contractors

---

### Budget Allocation

**Phase 1 (MVP):** $150K
- Development: $100K (3 engineers × 3 weeks)
- Infrastructure: $20K (Supabase, Vercel, APIs)
- Design: $15K (contract)
- Legal: $10K (terms, privacy)
- Marketing: $5K (beta outreach)

**Phase 2 (Grant Writing):** $200K
- Development: $120K (4 engineers × 6 weeks)
- AI/ML: $30K (Claude API credits)
- Legal: $25K (template review)
- Data Acquisition: $15K (winning apps)
- QA: $10K

**Phase 3 (Marketplace):** $300K
- Development: $150K (5 engineers × 12 weeks)
- Legal/Compliance: $50K (transaction docs)
- BD/Partnerships: $40K (buyer outreach)
- Infrastructure: $30K (escrow, APIs)
- Marketing: $30K (launch campaign)

**Phase 4 (Scale):** $400K
- Development: $200K (6 engineers × 6 months)
- Mobile: $80K (React Native devs)
- Infrastructure: $50K (scaling, monitoring)
- Sales/Marketing: $40K (enterprise outreach)
- Customer Success: $30K

**Total Year 1 Budget:** $1.05M

---

## Go/No-Go Decision Points

### After Phase 1 (Week 3)
**Go Criteria:**
- [ ] 8/10 beta users active
- [ ] Average analysis time <15 minutes
- [ ] Zero critical bugs in production
- [ ] NPS >30

**No-Go Triggers:**
- <50% activation rate
- Major security breach
- AI accuracy <80%
- Negative user feedback

**Decision:** Proceed to Phase 2 if 3/4 criteria met.

---

### After Phase 2 (Week 9)
**Go Criteria:**
- [ ] 10+ applications submitted
- [ ] 60%+ approval rate
- [ ] $100K revenue from grant writing
- [ ] 50+ winning apps in repository

**No-Go Triggers:**
- <40% approval rate (below industry avg)
- Major legal/compliance issues
- AI generates unusable content
- No user adoption of feature

**Decision:** Proceed to Phase 3 if 3/4 criteria met.

---

### After Phase 3 (Week 21)
**Go Criteria:**
- [ ] $5M+ transaction volume
- [ ] 5+ institutional buyers
- [ ] <10 days avg time to close
- [ ] 90-95 cents on dollar pricing

**No-Go Triggers:**
- Zero buyer liquidity
- Regulatory roadblocks
- Pricing uncompetitive (<85 cents)
- Legal/compliance failures

**Decision:** Proceed to Phase 4 if 3/4 criteria met.

---

## Appendix: Feature Prioritization Matrix

### High Impact, High Confidence, High Ease (Ship First)
- PDF Report Generation (ICE 720)
- User Auth + RBAC (ICE 560)
- Incentive Matching Engine (ICE 700)
- AI Project Intake (ICE 800)

### High Impact, High Confidence, Low Ease (Core Differentiators)
- AI Grant Writer (ICE 320)
- Winning App Repository (ICE 900)
- Marketplace Matching (ICE 920)
- Transaction Escrow (ICE 950)

### High Impact, Low Confidence (Validate First)
- Marketplace MVP (ICE 189)
- ML Prediction Model (ICE 850)
- International Expansion (Deferred)

### Low Impact (Defer or Cut)
- Custom Workflows (ICE 820) - Wait for enterprise demand
- Mobile App (ICE 780) - Desktop users first
- API Marketplace (ICE 650) - Year 2+

---

## Roadmap Visualization

```
Feb 2026        Mar             Apr             May             Jun             Jul             2027
│               │               │               │               │               │               │
├─ Phase 1 ─────┤               │               │               │               │               │
│  MVP Launch   │               │               │               │               │               │
│  (3 weeks)    │               │               │               │               │               │
│               │               │               │               │               │               │
│               ├─── Phase 2 ───┤               │               │               │               │
│               │ Grant Writing │               │               │               │               │
│               │  (6 weeks)    │               │               │               │               │
│               │               │               │               │               │               │
│               │               ├──────── Phase 3 ───────────────┤               │               │
│               │               │      Marketplace (12 weeks)    │               │               │
│               │               │                                │               │               │
│               │               │                                ├────── Phase 4 ────────────────┤
│               │               │                                │   Scale Features (6 months)   │
│               │               │                                │                               │
▼               ▼               ▼                                ▼                               ▼
$0 ARR      $500K ARR       $1M ARR                          $2M ARR                         $5M ARR
0 users     50 users        200 users                        400 users                       500 users
Stream 1    Stream 1        Stream 1+2                       Stream 1+2+3                    All streams
```

---

*This roadmap is a living document. Update quarterly based on learnings and market feedback.*
