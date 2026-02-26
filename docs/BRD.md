# IncentEdge — Business Requirements Document

**Last Updated:** February 25, 2026
**Status:** Phase 1 MVP — Target Launch March 10, 2026
**Version:** 1.1
**Authors:** Aundre Oldacre (Founder/CEO), Dr. Malcolm Adams (Strategic Advisor)

---

## 1. Business Problem & Market Opportunity

### The Problem

The $500B+ U.S. government incentive market is functionally inaccessible to most real estate developers. The programs exist — IRA clean energy tax credits, LIHTC, HTC, NMTC, PACE, CDBG, HOME, state/municipal grants — but accessing them requires:

- 200+ hours of manual research per project
- Specialized knowledge of federal, state, county, and municipal programs
- Legal/accounting expertise to stack programs without violating exclusivity rules
- A broker network to monetize tax credits (who charge 3-8% and take 3-6 months)

This creates a structural advantage for large developers and REPE firms who have dedicated incentive teams. Smaller developers — including minority-owned firms, nonprofit CHDOs, and mission-driven developers — are systematically disadvantaged.

**The core business insight:** IncentEdge is infrastructure, not software. The same way Bloomberg gave financial professionals unified access to fragmented capital markets data, IncentEdge gives real estate developers unified access to the fragmented incentive landscape.

### The Opportunity

| Dimension | Size | Source |
|-----------|------|--------|
| Annual incentive programs | $500B+ | IRS, HUD, DOE estimates |
| LIHTC market | $8-10B/year | IRS Form 8586 data |
| IRA direct transfer credits (est.) | $50B+/year | Treasury IRA projections |
| Historic Tax Credit market | $1.5B/year | NPS annual report |
| NMTC market | $5B/year authorized | CDFI Fund |
| Grant consulting industry | $2B+/year | IBISWorld |

**Addressable by IncentEdge (SaaS Discovery):** Any real estate development firm that files federal taxes and develops in the U.S. Estimated 50,000+ professional developers.

**SaaS addressable market:** At $10K average contract value, 1% penetration of 50,000 developers = $5B ARR ceiling.

---

## 2. Competitive Landscape

### Current State: Manual Consultants Dominate

| Player | Model | Pricing | Weakness |
|--------|-------|---------|----------|
| Grant consultants (boutique) | Hourly or % of award | $150-400/hr | Slow, expensive, not scalable |
| Large accounting firms (Big 4) | Project-based | $50K-500K/engagement | Only for large deals |
| DSIRE.org | Free database | Free | Renewable energy only, no matching |
| federal.grants.gov | Free database | Free | Grants only, no eligibility scoring |
| Manual research (in-house) | Staff time | $80-150/hr loaded | Incomplete, no stacking analysis |

### Emerging SaaS Competition (Limited)

| Player | Focus | Status |
|--------|-------|--------|
| Novogradac & Company (tools) | LIHTC compliance | Not a discovery platform |
| Civic Eagle (Enview) | Legislative tracking | Different use case |
| GrantStation | Nonprofit grants | Not real estate focused |

**Assessment:** No direct competitor offering AI-powered eligibility scoring + stacking + grant writing + marketplace in a single platform. IncentEdge is building in an uncontested category.

### Competitive Moats (To Be Built)
1. **Data network effect:** Every application submitted improves the probability model
2. **Program database depth:** 24,458+ programs is a significant data asset
3. **Institutional buyer relationships:** Marketplace liquidity comes from buyer network
4. **Switching costs:** Multi-year project tracking creates retention

---

## 3. Business Model

### Revenue Streams

**Stream 1: SaaS Discovery Subscriptions (Silo 1)**

| Tier | Monthly | Annual | Included |
|------|---------|--------|----------|
| Solo | $499 | $4,990 | 5 projects, 1 seat, PDF reports |
| Team | $1,299 | $12,990 | 25 projects, 5 seats, API access |
| Enterprise | Custom | Custom | Unlimited projects + seats, custom integrations |

*Target: $85K ARR from 10 beta customers at Phase 1 launch*

**Stream 2: Grant Writing AI (Silo 2)**

Per-application fee model. No contingency fees (prohibited under 31 USC 3905 for federal grants).

| Tier | Fee | Application Type |
|------|-----|-----------------|
| Standard | $2,500 | State/local grants under $500K |
| Professional | $10,000 | Federal grants, $500K-$5M |
| Enterprise | $35,000 | Large federal, competitive programs |

*Human review included in Professional/Enterprise tiers. AI generates 90% of content; specialist reviews before submission.*

**Stream 3: Marketplace (Silo 3)**

Transaction fee on successful tax credit transfers.

| Volume | Fee |
|--------|-----|
| First $5M | 3% |
| $5M - $15M | 2.5% |
| Above $15M | 2.25% |

C-PACE referral fees: negotiated per partnership with lenders ($500-2,000 per closed loan).

### Unit Economics (Target)

| Metric | Target |
|--------|--------|
| SaaS CAC | < $3,000 |
| SaaS ACV | $8,000 (blended) |
| Payback period | < 4 months |
| Gross margin (SaaS) | 80%+ |
| Gross margin (Grant Writing) | 60%+ (includes human review) |
| Marketplace take rate | 2-3% net |

---

## 4. Revenue Projections by Silo

### Phase 1 (MVP, Weeks 1-3, Mar 2026)

| Source | Projected |
|--------|-----------|
| Silo 1: 10 beta customers avg $8.5K/yr | $85K ARR |
| Silo 2: Not yet launched | $0 |
| Silo 3: Not yet launched | $0 |
| **Total** | **$85K ARR** |

### Phase 2 (Grant Writing, Weeks 4-9, Apr-May 2026)

| Source | Projected |
|--------|-----------|
| Silo 1: 50 subscribers | $500K ARR |
| Silo 2: 30 applications at $10K avg | $300K Year 1 |
| Silo 3: Not yet launched | $0 |
| **Total** | **$800K ARR run rate** |

### Phase 3 (Marketplace, Q2-Q3 2026)

| Source | Projected |
|--------|-----------|
| Silo 1: 200 subscribers | $2M ARR |
| Silo 2: 100 applications | $700K Year 1 |
| Silo 3: $10M transaction volume at 2.5% avg | $250K Year 1 |
| **Total** | **$2.95M ARR run rate** |

### End of Year 1 (Feb 2027 target)

| Source | Projected |
|--------|-----------|
| Silo 1: 500 subscribers | $4M ARR |
| Silo 2: 200 applications | $1.4M Year 1 |
| Silo 3: $50M transaction volume | $1.2M Year 1 |
| **Total** | **$5M ARR** |

---

## 5. Go-To-Market Strategy

### Target Customer Sequence

**Phase 1 (Beta): Affordable Housing Developers**
- Rationale: Highest incentive complexity (LIHTC + IRA + state grants + HUD), highest pain, mission-aligned early adopters, active in NMHC and ULI networks
- Channels: NMHC Annual Conference, ULI Fall Meeting, CDFI networks, NHP Foundation, Enterprise Community Partners
- Messaging: "You're leaving $2-4M per project on the table. We find it in 60 seconds."

**Phase 2: Commercial RE + Clean Energy Developers**
- Rationale: IRA bonus adder complexity, large deal sizes, higher ACV
- Channels: Urban Land Institute, NAIOP, American Clean Power Association, solar/storage developer groups
- Messaging: "Bloomberg Terminal for incentives — know your IRA stack before you close on a site."

**Phase 3: Institutional RE Firms**
- Rationale: Portfolio-level analytics, enterprise pricing
- Channels: Procore partner network, Yardi partner network, direct enterprise sales
- Messaging: "Every project in your pipeline, analyzed automatically. Enterprise SLA with API access."

### Sales Motion

**Phase 1 (Founder-Led)**
- Aundre drives outbound to NMHC/ULI network
- Demo + free analysis on prospect's actual project
- Close on Team or Enterprise tier within 2 weeks

**Phase 2 (Product-Led + Founder)**
- Free trial (Solo tier, 1 project, no credit card)
- Automated onboarding with email nurture
- Upgrade triggers: project limit hit, export attempt

**Phase 3 (Enterprise Sales)**
- Dedicated AE for $100K+ opportunities
- Land-and-expand: start with 1 analyst, expand to team
- Annual contracts with multi-project discounts

---

## 6. Partnership Requirements

### Data Partners
- **DSIRE (NC Clean Energy Technology Center):** License access to Database of State Incentives for Renewables and Efficiency. Currently not integrated — IncentEdge uses static seed data (migration 009).
- **IRS Energy Community Maps:** Public data, partial integration via Census tract lookup.
- **HUD CDBG/HOME data:** Public, not yet integrated.

### Marketplace Partners (Silo 3 — Required Before Launch)
- **Institutional buyers (required):** At least 5 institutional buyers (banks, insurance companies, corporate tax departments) must be onboarded before marketplace goes live. Target: JP Morgan, Bank of America, large insurers.
- **C-PACE lenders:** Greenworks Lending, Nuveen, Counterpoint Capital. Referral agreements required.
- **BD partner (required for advisory):** Registered broker-dealer for any tax credit advisory services. Without this, IncentEdge must stay strictly technology marketplace.

### Technology Partners
- **Anthropic (Claude):** LLM for eligibility analysis and grant writing. API key required.
- **Stripe:** Payment processing and Connect for marketplace. Already integrated.
- **Vercel:** Deployment platform. Already configured.
- **Supabase:** Database and auth. Project `pzmunszcxmmncppbufoj` active.

### Channel Partners (Phase 2+)
- Grant consultants willing to white-label AI writing tools
- Real estate law firms for referrals
- CPA firms specializing in real estate tax (KBKG, Engineered Tax Services)

---

## 7. Regulatory Analysis for Silo 3

### Risk Assessment Matrix

| Activity | Regulation | Risk Level | Mitigation |
|----------|-----------|------------|------------|
| Section 6418 credit marketplace | Securities Act of 1933 | Medium | Structure as tech fee only; no advisory; no principal transactions |
| C-PACE referrals | State PACE statutes | Low | Confirm enabling legislation per state; referral only |
| Tax credit valuation | IRC / IRS guidance | Medium | Do not provide valuations; buyer determines own value |
| KYC/AML for marketplace | Bank Secrecy Act | High | Stripe Identity for buyer verification; legal review required |
| Contingency fees on federal grants | 31 USC 3905 | Critical | Explicitly prohibited; use flat-fee model only |
| State grant application fees | State regulations | Low | Varies; generally permitted for flat-fee consulting |

### Recommended Pre-Launch Checklist for Silo 3
1. Securities law opinion from qualified counsel on marketplace model
2. BD partnership agreement in place or written legal opinion exemption is applicable
3. Stripe Identity KYC/AML integration tested
4. State-by-state PACE enabling legislation confirmed for C-PACE referrals
5. Form 3800 transfer mechanics confirmed with tax counsel

---

## 8. Risk Analysis

### Data Quality Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Static database becomes stale | Programs expire/change; wrong eligibility results | High | DSIRE API integration; quarterly manual audit |
| 24,458 programs partially incomplete | Low match accuracy on edge cases | Medium | Ongoing data enrichment; user feedback loop |
| Seed data not verified against live sources | Liability if developer relies on wrong info | Medium | Disclaimer in ToS; verified badge system for audited programs |

### Regulatory Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| IRS reinterprets Section 6418 transfer rules | Silo 3 marketplace model disrupted | Low | Securities counsel review; monitor IRS guidance |
| State changes incentive rules between crawl and user analysis | Wrong eligibility shown | Medium | Freshness badges on data; data source citations |
| Contingency fee prohibition misconfigured in pricing | Federal compliance violation | Low | Flat-fee only policy enforced at contract level |

### AI / Product Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| AI hallucination in grant narratives | Developer submits inaccurate application | High | Human review required tier; explicit AI disclosure |
| Eligibility accuracy < 90% | Users trust wrong results | Medium | Hybrid rule+AI; confidence scores shown; legal disclaimer |
| AI model availability / cost escalation | Service degradation | Low | Fallback to rule-based; cost monitoring |

### Competition Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Established consulting firm builds SaaS | Direct competition | Medium | Speed to market; data moat; marketplace liquidity |
| DSIRE builds premium API product | Reduces data differentiation | Low | Value-add in AI + application + marketplace |
| Large enterprise software (Procore, Yardi) adds incentive module | Embedded competition | Low | Partnership before competition; API-first strategy |

---

## 9. Operating Model

### Team (Current)

| Name | Role | Responsibility |
|------|------|----------------|
| Aundre Oldacre | Founder & CEO | Product vision, enterprise sales, fundraising, partnerships |
| Steve Kumar | CTO | Technical architecture, engineering oversight |
| Dr. Malcolm Adams | Strategic Advisor | Governance, compliance, real estate industry relationships |

### Hiring Plan

**Phase 2 (Grant Writing launch, March-April 2026):**
- AI/ML Engineer (Claude API integration, prompt engineering)
- Grant Writing Specialist (human review QA, subject matter expert)
- Legal Consultant (grant template review, marketplace regulatory analysis)

**Phase 3 (Marketplace launch, Q2-Q3 2026):**
- Backend Engineer (transaction infrastructure, escrow, WebSockets)
- BD/Partnerships Lead (institutional buyer onboarding, C-PACE lender relationships)
- Compliance Officer (KYC/AML, marketplace operations)

**Phase 4 (Scale):**
- 2x Full Stack Engineers
- DevOps/SRE
- Customer Success Manager
- Data Scientist (ML model training for probability scoring)

---

*This document is the authoritative business requirements reference. Update at each phase milestone.*
