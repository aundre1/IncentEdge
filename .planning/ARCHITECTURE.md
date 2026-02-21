# IncentEdge Technical Architecture

**Document Version:** 1.0
**Last Updated:** February 16, 2026
**System:** IncentEdge - Real Estate Incentive Discovery & Monetization Platform

---

## Architecture Overview

IncentEdge is a **modern full-stack SaaS platform** built on a serverless, edge-first architecture optimized for AI workloads and real-time collaboration. The system follows a **microservices-inspired modular design** within a Next.js monolith, with clear separation between presentation, business logic, and data layers.

### Key Architectural Principles

1. **API-First Design** - All features exposed via RESTful APIs
2. **Database-Centric** - PostgreSQL as source of truth, RLS for security
3. **Edge Computing** - Global CDN distribution via Vercel
4. **Serverless Functions** - Auto-scaling API routes
5. **AI-Native** - LLM integration as first-class citizen
6. **Progressive Enhancement** - Works without JavaScript, better with it

---

## Tech Stack

### Frontend Layer
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Next.js** | 14.2.20 | React framework | App Router, SSR, API routes, SEO |
| **React** | 18.3.1 | UI library | Component model, ecosystem |
| **TypeScript** | 5.7.2 | Type safety | Catch errors at compile time |
| **Tailwind CSS** | 3.4.17 | Styling | Utility-first, fast development |
| **shadcn/ui** | Latest | Component library | Accessible, customizable Radix primitives |
| **Radix UI** | 18 packages | Headless components | WAI-ARIA compliant, unstyled |
| **Recharts** | 2.15.0 | Data visualization | React-native charts, animations |
| **Lucide React** | 0.469.0 | Icons | Lightweight, tree-shakeable |
| **React Hook Form** | 7.54.2 | Form management | Performance, validation |
| **Zod** | 3.24.1 | Schema validation | Type-safe runtime checks |

**Why Next.js 14 App Router?**
- Server Components reduce bundle size (90% smaller)
- Streaming SSR for instant page loads
- Built-in API routes eliminate backend
- Vercel deployment optimized
- Edge runtime for global low latency

---

### Backend Layer
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Supabase** | 2.47.10 | Database + Auth | PostgreSQL, realtime, RLS, Auth out-of-box |
| **PostgreSQL** | 15.x | Relational database | ACID, complex queries, JSON support |
| **Supabase Auth** | Built-in | User management | OAuth, JWT, row-level security |
| **Stripe** | 20.2.0 | Payments | Industry standard, compliance |
| **Resend** | 6.8.0 | Transactional email | Developer-friendly API, deliverability |
| **@react-pdf/renderer** | 4.3.2 | PDF generation | Server-side PDF from React components |

**Why Supabase over Firebase/AWS?**
- Full PostgreSQL (not NoSQL) for complex queries
- Row-Level Security (RLS) policies for multi-tenancy
- Real-time subscriptions via WebSockets
- Open-source (can self-host if needed)
- Better developer experience than AWS RDS

---

### AI/ML Layer (Planned)
| Technology | Purpose | Status |
|------------|---------|--------|
| **Anthropic Claude** | LLM for grant writing, analysis | 🚧 Integration planned |
| **OpenAI GPT-4** | Fallback LLM | 🚧 Future |
| **Pinecone** | Vector database for embeddings | ❌ Not started |
| **Langchain** | LLM orchestration | ❌ Not started |
| **Hugging Face** | ML model hosting | ❌ Not started |

**Current State:** Rule-based logic only, no ML models deployed.

---

### Infrastructure & DevOps
| Technology | Purpose | Status |
|------------|---------|--------|
| **Vercel** | Hosting, edge functions | ✅ In use |
| **GitHub** | Version control | ✅ In use |
| **GitHub Actions** | CI/CD | 🚧 Configured, not enforced |
| **Sentry** | Error tracking | ❌ Not implemented |
| **Vercel Analytics** | Web vitals, performance | ❌ Not implemented |
| **Vitest** | Testing framework | ✅ Configured, 0% coverage |

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Browser)                      │
├─────────────────────────────────────────────────────────────────────┤
│  Next.js Frontend (React 18 + TypeScript)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Landing Page │  │  Dashboard   │  │ Project View │             │
│  │   (Static)   │  │ (SSR + RSC)  │  │  (Dynamic)   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│         │                  │                  │                     │
│         └──────────────────┴──────────────────┘                     │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EDGE RUNTIME (Vercel)                          │
├─────────────────────────────────────────────────────────────────────┤
│  Middleware (Auth, CORS, Rate Limiting)                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ /api/projects/*     - Project CRUD, eligibility analysis      │ │
│  │ /api/compliance/*   - Compliance tracking, certification      │ │
│  │ /api/organizations/* - Multi-tenant management                │ │
│  │ /api/calculate      - Eligibility scoring engine              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│         │                                                            │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  Core Engines (TypeScript Modules in /src/lib)                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ Eligibility    │  │ Incentive      │  │ Stacking       │       │
│  │ Engine         │  │ Matcher        │  │ Analyzer       │       │
│  │ (60KB)         │  │ (21KB)         │  │ (28KB)         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ Workflow       │  │ Compliance     │  │ Document       │       │
│  │ Engine         │  │ Checker        │  │ Processor      │       │
│  │ (32KB)         │  │ (31KB)         │  │ (39KB)         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │ AI             │  │ PDF            │  │ Analytics      │       │
│  │ Recommendation │  │ Generator      │  │ Engine         │       │
│  │ (26KB)         │  │ (26KB)         │  │ (63KB)         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (Primary Data Store)                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Core Tables:                                                  │ │
│  │ • organizations (multi-tenant)                                │ │
│  │ • profiles (user accounts)                                    │ │
│  │ • projects (development projects)                             │ │
│  │ • incentive_programs (24,458 records)                         │ │
│  │ • eligibility_results (cached scores)                         │ │
│  │ • application_workflow (grant tracking)                       │ │
│  │ • compliance_tracking (post-award monitoring)                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│         │                                                            │
│  Row-Level Security (RLS) Policies for isolation                   │
└─────────┼────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Stripe       │  │ Resend       │  │ Anthropic    │             │
│  │ (Payments)   │  │ (Email)      │  │ (AI)         │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ DSIRE API    │  │ Census.gov   │  │ IRS APIs     │             │
│  │ (Planned)    │  │ (Partial)    │  │ (Planned)    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Architecture

### Schema Design Philosophy
1. **Multi-tenancy via Row-Level Security (RLS)** - No shared data between orgs
2. **Audit trail on all tables** - created_at, updated_at timestamps
3. **JSONB for flexibility** - preferences, settings, dynamic fields
4. **Foreign key constraints** - Referential integrity enforced
5. **Indexes on common queries** - Performance optimization

---

### Core Schema (11 Migrations)

#### Migration 001: Foundation
```sql
organizations
├── id (uuid, PK)
├── name, legal_name
├── organization_type (developer, owner, consultant)
├── tax_status (for-profit, nonprofit, municipal, tribal)
├── certifications (mwbe, sdvob, hubzone)
├── subscription_tier (free, starter, professional, team, enterprise)
└── stripe_customer_id

profiles (extends auth.users)
├── id (uuid, PK → auth.users)
├── organization_id (FK → organizations)
├── role (admin, manager, analyst, viewer)
├── preferences (jsonb)
└── onboarding_completed

projects
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── name, description
├── location (address, city, state, zip, county, census_tract)
├── sector_type (real-estate, clean-energy, water, waste)
├── construction_type (new, rehab, acquisition, refinance)
├── size_metrics (units, sqft, capacity_mw)
├── financials (total_cost, hard_costs, soft_costs)
├── timeline (start_date, completion_date)
└── sustainability_tier (bronze, silver, gold, platinum)
```

#### Migration 002: Sustainability & Incentives
```sql
sustainability_tiers
├── tier_name (bronze, silver, gold, platinum)
├── min_points, max_points
├── incentive_multiplier (1.0 - 1.5x)
└── certification_requirements

incentive_programs
├── id (uuid, PK)
├── program_name, program_type
├── jurisdiction (federal, state, county, city)
├── sector (real-estate, clean-energy, etc.)
├── eligibility_criteria (jsonb)
├── incentive_amount (min, max, per_unit)
├── application_deadline
├── stacking_rules (jsonb)
└── status (active, expired, suspended)
```

#### Migration 003: Documents & Eligibility
```sql
documents
├── id (uuid, PK)
├── project_id (FK → projects)
├── document_type (pro-forma, offering-memo, permit, etc.)
├── file_url, file_size, mime_type
├── ai_extracted_data (jsonb)
└── uploaded_by (FK → profiles)

eligibility_results
├── id (uuid, PK)
├── project_id (FK → projects)
├── incentive_id (FK → incentive_programs)
├── eligibility_score (0-100)
├── match_reasons (jsonb)
├── disqualifiers (jsonb)
└── calculated_at (timestamp)
```

#### Migration 004: Application Workflow
```sql
applications
├── id (uuid, PK)
├── project_id (FK → projects)
├── incentive_id (FK → incentive_programs)
├── status (draft, submitted, approved, rejected)
├── submitted_date, decision_date
├── award_amount
└── ai_generated_content (jsonb)

application_tasks
├── id (uuid, PK)
├── application_id (FK → applications)
├── task_type (document, review, submit)
├── assigned_to (FK → profiles)
├── status (pending, in-progress, completed)
└── due_date

application_comments
├── id (uuid, PK)
├── application_id (FK → applications)
├── author_id (FK → profiles)
├── comment_text
└── created_at
```

#### Migration 005: Team Permissions
```sql
team_members
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── user_id (FK → profiles)
├── role (admin, manager, analyst, viewer)
└── permissions (jsonb)

activity_log
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── user_id (FK → profiles)
├── action (create, update, delete, view)
├── entity_type (project, application, etc.)
├── entity_id
└── timestamp
```

#### Migration 006: Compliance Tracking
```sql
compliance_tracking
├── id (uuid, PK)
├── project_id (FK → projects)
├── incentive_id (FK → incentive_programs)
├── compliance_type (reporting, audit, inspection)
├── due_date, completion_date
├── status (pending, completed, overdue)
└── documentation (jsonb)

compliance_items
├── id (uuid, PK)
├── tracking_id (FK → compliance_tracking)
├── item_description
├── responsible_party (FK → profiles)
└── status
```

#### Migration 007: Webhooks & Integrations
```sql
webhooks
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── event_type (application.submitted, compliance.due, etc.)
├── url, secret
└── status (active, inactive)

webhook_logs
├── id (uuid, PK)
├── webhook_id (FK → webhooks)
├── event_data (jsonb)
├── response_status, response_body
└── timestamp

api_keys
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── key_name, key_hash
├── permissions (jsonb)
└── last_used_at
```

#### Migration 008: Background Jobs
```sql
background_jobs
├── id (uuid, PK)
├── job_type (eligibility_calculation, pdf_generation, etc.)
├── status (pending, running, completed, failed)
├── parameters (jsonb)
├── result (jsonb)
├── scheduled_at, started_at, completed_at
└── retry_count
```

#### Migration 009: Seed Data
- 24,458 incentive program records (federal + state)
- Sustainability tier definitions
- Default organization settings

#### Migration 010: Application Outcomes
```sql
application_outcomes
├── id (uuid, PK)
├── application_id (FK → applications)
├── outcome (approved, rejected, pending)
├── award_amount, reason
└── decision_date
```

#### Migration 011: Stripe Subscriptions
```sql
subscriptions
├── id (uuid, PK)
├── organization_id (FK → organizations)
├── stripe_subscription_id
├── tier (free, starter, professional, team, enterprise)
├── status (active, canceled, past_due)
├── current_period_start, current_period_end
└── cancel_at_period_end
```

---

### Database Performance Optimizations

#### Indexes (Recommended)
```sql
-- High-frequency queries
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_eligibility_project ON eligibility_results(project_id);
CREATE INDEX idx_incentives_sector ON incentive_programs(sector);
CREATE INDEX idx_incentives_jurisdiction ON incentive_programs(jurisdiction);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_activity_org_timestamp ON activity_log(organization_id, timestamp DESC);

-- Full-text search
CREATE INDEX idx_incentive_name_search ON incentive_programs USING gin(to_tsvector('english', program_name));
CREATE INDEX idx_project_name_search ON projects USING gin(to_tsvector('english', name));
```

#### Materialized Views (Future)
```sql
-- Portfolio summary (expensive aggregation)
CREATE MATERIALIZED VIEW portfolio_summary AS
SELECT
  organization_id,
  COUNT(*) as project_count,
  SUM(total_development_cost) as total_investment,
  COUNT(CASE WHEN status='active' THEN 1 END) as active_projects
FROM projects
GROUP BY organization_id;

-- Refresh nightly via cron job
```

---

## API Design Patterns

### RESTful Conventions

**Base URL:** `https://incentedge.com/api`

**Endpoints:**
```
GET    /api/projects              - List projects (paginated)
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get project details
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project

POST   /api/projects/:id/analyze  - Run eligibility analysis
GET    /api/projects/:id/eligibility - Get cached results

GET    /api/organizations         - List orgs (admin only)
POST   /api/organizations         - Create org
GET    /api/organizations/:id     - Get org details
PUT    /api/organizations/:id     - Update org

POST   /api/calculate             - Calculate eligibility scores
GET    /api/compliance/:projectId - Get compliance items
POST   /api/compliance/:projectId/certify - Certify completion

GET    /api/health                - Health check
GET    /api/status                - System status
```

### Request/Response Format

**Request (Create Project):**
```json
POST /api/projects
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "name": "Mount Vernon Affordable Housing",
  "address_line1": "123 Main St",
  "city": "Mount Vernon",
  "state": "NY",
  "zip_code": "10550",
  "sector_type": "real-estate",
  "construction_type": "new-construction",
  "total_units": 150,
  "affordable_units": 120,
  "total_development_cost": 45000000,
  "sustainability_tier": "gold"
}
```

**Response (Success):**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Mount Vernon Affordable Housing",
    "created_at": "2026-02-16T12:00:00Z",
    ...
  }
}
```

**Response (Error):**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "zip_code": "Must be 5 or 9 digits",
    "total_units": "Must be greater than 0"
  }
}
```

### Authentication Flow

**JWT-based authentication via Supabase:**

```
1. User signs up/logs in
   POST /auth/v1/signup (Supabase)
   → Returns access_token (JWT) + refresh_token

2. Client stores tokens in httpOnly cookies
   Set-Cookie: sb-access-token=<jwt>; HttpOnly; Secure; SameSite=Strict
   Set-Cookie: sb-refresh-token=<refresh>; HttpOnly; Secure

3. Client makes API request
   GET /api/projects
   Cookie: sb-access-token=<jwt>

4. Middleware validates JWT
   /src/middleware.ts
   → Verifies signature with Supabase public key
   → Extracts user_id from token
   → Attaches to request context

5. API route checks permissions
   const user = await getUser(request);
   const canAccess = await checkPermission(user, 'projects:read');

6. Database query with RLS
   SELECT * FROM projects WHERE organization_id = user.organization_id
   → RLS policies auto-filter by user's org
```

---

### Authorization Model (RBAC)

**Roles:**
- **Admin** - Full access, can manage billing
- **Manager** - Create/edit projects, view analytics
- **Analyst** - View projects, run analyses, read-only
- **Viewer** - View-only access, no edits

**Permissions Matrix:**

| Resource | Admin | Manager | Analyst | Viewer |
|----------|-------|---------|---------|--------|
| Projects - Create | ✅ | ✅ | ❌ | ❌ |
| Projects - Edit | ✅ | ✅ | ❌ | ❌ |
| Projects - View | ✅ | ✅ | ✅ | ✅ |
| Projects - Delete | ✅ | ⚠️ Own only | ❌ | ❌ |
| Applications - Submit | ✅ | ✅ | ❌ | ❌ |
| Applications - View | ✅ | ✅ | ✅ | ✅ |
| Team - Invite | ✅ | ⚠️ Limited | ❌ | ❌ |
| Billing - Manage | ✅ | ❌ | ❌ | ❌ |
| Analytics - View | ✅ | ✅ | ✅ | ✅ |
| Settings - Edit | ✅ | ⚠️ Profile only | ❌ | ❌ |

**Implementation:**
```typescript
// /src/lib/permissions.ts
const permissions = {
  admin: ['*'],
  manager: ['projects:*', 'applications:*', 'team:invite'],
  analyst: ['projects:read', 'applications:read', 'analytics:read'],
  viewer: ['projects:read', 'applications:read']
};

export function hasPermission(user: User, permission: string): boolean {
  const userPermissions = permissions[user.role];
  return userPermissions.includes('*') || userPermissions.includes(permission);
}
```

---

## Row-Level Security (RLS) Policies

**Concept:** PostgreSQL policies auto-filter queries based on user context.

**Example Policy:**
```sql
-- Only return projects belonging to user's organization
CREATE POLICY projects_isolation ON projects
FOR ALL
USING (organization_id = auth.jwt() ->> 'organization_id');

-- Users can only view their own profile
CREATE POLICY profiles_privacy ON profiles
FOR SELECT
USING (id = auth.uid());

-- Applications visible to org members
CREATE POLICY applications_org_access ON applications
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);
```

**Security Benefits:**
- No SQL injection risk (enforced at DB level)
- No accidental data leaks (impossible to query other orgs)
- Centralized authorization logic
- Works across all clients (web, mobile, API)

**Critical Requirement:** ALL RLS policies must be audited before production.

---

## File Structure Conventions

### Directory Organization
```
/src
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group: Login, signup
│   ├── (dashboard)/       # Route group: Protected pages
│   ├── api/               # API routes (serverless functions)
│   ├── layout.tsx         # Root layout (global providers)
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles (Tailwind)
│
├── components/
│   ├── ui/                # Reusable UI primitives (shadcn)
│   ├── layout/            # Layout components (Header, Sidebar)
│   ├── forms/             # Form components
│   └── providers/         # Context providers
│
├── lib/                   # Business logic (pure functions)
│   ├── eligibility-engine.ts
│   ├── incentive-matcher.ts
│   ├── stacking-analyzer.ts
│   ├── workflow-engine.ts
│   ├── compliance-checker.ts
│   ├── document-processor.ts
│   ├── ai-recommendation-engine.ts
│   ├── pdf-generator.ts
│   ├── analytics-engine.ts
│   ├── job-processor.ts
│   ├── job-scheduler.ts
│   ├── auth-middleware.ts
│   ├── api-security.ts
│   ├── rate-limiter.ts
│   ├── error-handler.ts
│   ├── permissions.ts
│   ├── stripe.ts
│   ├── email.ts
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client (cookies)
│       └── middleware.ts  # Middleware client
│
├── types/                 # TypeScript definitions
│   ├── index.ts           # Shared types
│   ├── eligibility.ts
│   ├── api.ts
│   ├── documents.ts
│   ├── compliance.ts
│   └── analytics.ts
│
└── contexts/
    └── DashboardContext.tsx
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `ProjectCard.tsx`)
- Utilities: `kebab-case.ts` (e.g., `eligibility-engine.ts`)
- Pages: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- API routes: `route.ts`

**Variables:**
- Components: `PascalCase` (e.g., `const ProjectCard = () => {}`)
- Functions: `camelCase` (e.g., `calculateEligibility()`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_PROJECTS`)
- Types/Interfaces: `PascalCase` (e.g., `interface Project {}`)

**Code Organization:**
```typescript
// 1. Imports (external, then internal)
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// 2. Types
interface Props {
  projectId: string;
}

// 3. Constants
const DEFAULT_LIMIT = 10;

// 4. Component
export function ProjectList({ projectId }: Props) {
  // 4a. Hooks
  const [projects, setProjects] = useState([]);

  // 4b. Event handlers
  const handleClick = () => {};

  // 4c. Render
  return <div>...</div>;
}
```

---

## Third-Party Integrations

### Current Integrations

#### 1. Supabase (Database + Auth)
**Purpose:** Primary data store, user authentication
**Integration Type:** SDK (@supabase/supabase-js)
**Configuration:**
```typescript
// /src/lib/supabase/client.ts
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```
**API Usage:**
- Database queries: `supabase.from('projects').select()`
- Auth: `supabase.auth.signInWithPassword()`
- Real-time: `supabase.channel().on('postgres_changes')`

---

#### 2. Stripe (Payments)
**Purpose:** Subscription billing, payment processing
**Integration Type:** SDK (stripe)
**Configuration:**
```typescript
// /src/lib/stripe.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```
**Webhook Handler:**
```typescript
// /src/app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);

  switch (event.type) {
    case 'customer.subscription.created':
      // Update database
      break;
  }
}
```

---

#### 3. Resend (Email)
**Purpose:** Transactional emails, notifications
**Integration Type:** SDK (resend)
**Configuration:**
```typescript
// /src/lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```
**Email Templates:**
```typescript
// /src/emails/WelcomeEmail.tsx (React Email)
export function WelcomeEmail({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body>
        <h1>Welcome to IncentEdge, {name}!</h1>
      </Body>
    </Html>
  );
}
```

---

### Planned Integrations

#### 4. Anthropic Claude (AI/LLM)
**Purpose:** Grant writing, project analysis
**Integration Type:** REST API
**Planned Usage:**
```typescript
// /src/lib/ai-recommendation-engine.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateGrantNarrative(project: Project) {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [{
      role: "user",
      content: `Write a grant narrative for: ${JSON.stringify(project)}`
    }]
  });

  return message.content[0].text;
}
```

---

#### 5. DSIRE API (Database of State Incentives)
**Purpose:** Real-time incentive program updates
**Integration Type:** REST API (partnership required)
**Status:** Not started (no confirmed partnership)

**Planned Architecture:**
```typescript
// Nightly sync job
async function syncIncentives() {
  const response = await fetch('https://api.dsireusa.org/v1/programs', {
    headers: { 'Authorization': `Bearer ${DSIRE_API_KEY}` }
  });

  const programs = await response.json();

  // Upsert to database
  for (const program of programs) {
    await supabase.from('incentive_programs').upsert({
      external_id: program.id,
      program_name: program.name,
      // ... map fields
    });
  }
}
```

---

#### 6. IRS Energy Community Map API
**Purpose:** Determine energy community bonus eligibility
**Integration Type:** Public API
**Status:** Planned

```typescript
async function checkEnergyCommunity(censusTract: string) {
  const response = await fetch(
    `https://arcgis.netl.doe.gov/energycommunities/api/check/${censusTract}`
  );

  const data = await response.json();
  return data.isEnergyComity;
}
```

---

## Security Architecture

### Defense in Depth Strategy

**Layer 1: Edge (Middleware)**
- CORS validation
- Rate limiting (100 req/min)
- Request signing verification
- DDoS protection (Vercel built-in)

**Layer 2: API Routes**
- Input sanitization (XSS, SQL injection)
- Authentication (JWT validation)
- Authorization (RBAC checks)
- Request timeout (30 seconds)

**Layer 3: Business Logic**
- Type validation (Zod schemas)
- Business rule enforcement
- Data transformation
- Error handling

**Layer 4: Database**
- Row-Level Security (RLS)
- Prepared statements (no SQL injection)
- Encrypted at rest (Supabase default)
- Connection pooling (limited)

**Layer 5: Network**
- HTTPS only (TLS 1.3)
- Encrypted cookies (httpOnly, secure)
- CSP headers (Content Security Policy)
- HSTS (HTTP Strict Transport Security)

---

### Security Headers
```typescript
// /next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  }
];
```

---

### Secrets Management

**Environment Variables:**
```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

**Production Secrets (Vercel):**
- Stored in Vercel environment variables
- Encrypted at rest
- Scoped to production environment
- Rotated quarterly

**Validation:**
```typescript
// /src/lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  // ... all required vars
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

**Gap:** Not currently enforced at startup (see STATE.md).

---

## Performance Optimizations

### Frontend

**Code Splitting:**
```typescript
// Dynamic imports for heavy components
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  loading: () => <Skeleton />,
  ssr: false
});
```

**Image Optimization:**
```typescript
// next/image auto-optimizes
import Image from 'next/image';

<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  alt="Hero"
  priority // LCP optimization
/>
```

**Caching Strategy:**
```typescript
// React Query for server state
const { data } = useQuery({
  queryKey: ['projects', orgId],
  queryFn: () => fetchProjects(orgId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000  // 30 minutes
});
```

---

### Backend

**Database Connection Pooling:**
```typescript
// Supabase handles pooling, but configure:
const supabase = createClient(url, key, {
  db: {
    pooler: {
      connectionString: process.env.DATABASE_POOLER_URL
    }
  }
});
```

**Query Optimization:**
```sql
-- Use select() with specific columns (not SELECT *)
supabase.from('projects').select('id, name, status')

-- Limit results
supabase.from('projects').select().limit(20)

-- Use single() for single-row queries (faster)
supabase.from('projects').select().eq('id', projectId).single()
```

**Redis Caching (Planned):**
```typescript
// Cache expensive calculations
async function getEligibilityScore(projectId: string) {
  const cached = await redis.get(`eligibility:${projectId}`);
  if (cached) return JSON.parse(cached);

  const score = await calculateEligibility(projectId);
  await redis.set(`eligibility:${projectId}`, JSON.stringify(score), 'EX', 3600);

  return score;
}
```

---

### Monitoring & Observability

**Error Tracking (Planned):**
```typescript
// Sentry integration
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event, hint) {
    // Scrub sensitive data
    if (event.request) {
      delete event.request.cookies;
    }
    return event;
  }
});
```

**Performance Monitoring:**
```typescript
// Web Vitals tracking
export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (metric.label === 'web-vital') {
    console.log(metric); // Send to analytics
  }
}
```

**Health Checks:**
```typescript
// /src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
    timestamp: new Date().toISOString()
  };

  const healthy = Object.values(checks).every(v => v === true);

  return Response.json(checks, {
    status: healthy ? 200 : 503
  });
}
```

---

## Deployment Architecture

### Hosting: Vercel

**Why Vercel?**
- Zero-config Next.js deployment
- Global edge network (300+ locations)
- Automatic HTTPS, CDN, compression
- Preview deployments per PR
- Built-in analytics and monitoring

**Architecture:**
```
User Request
    │
    ▼
Vercel Edge Network (Global CDN)
    │
    ├─► Static Assets (Cached at Edge)
    │   └─► Images, CSS, JS
    │
    ├─► Server Components (Edge Runtime)
    │   └─► React Server Components
    │
    └─► API Routes (Serverless Functions)
        └─► Node.js 18.x runtime
            │
            ▼
        Supabase (Database)
            │
            └─► PostgreSQL 15.x
```

**Deployment Flow:**
```bash
# 1. Commit code to GitHub
git push origin main

# 2. Vercel auto-deploys
# - Runs build: next build
# - Runs tests: npm test (if configured)
# - Generates static pages
# - Deploys to edge

# 3. Deployment URL
https://incentedge-xyz123.vercel.app (preview)
https://incentedge.com (production)
```

---

### CI/CD Pipeline (Planned)

**GitHub Actions Workflow:**
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run test:coverage

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

**Status:** Not enforced (tests exist but CI not configured).

---

### Environment Strategy

**Development:**
- Local: `npm run dev` (localhost:3000)
- Database: Local Supabase instance or staging DB
- Stripe: Test mode keys
- Emails: Console output (no sending)

**Staging:**
- URL: `https://staging.incentedge.com`
- Database: Supabase staging project
- Stripe: Test mode
- Emails: Test inbox (Mailtrap)

**Production:**
- URL: `https://incentedge.com`
- Database: Supabase production (multi-region)
- Stripe: Live mode
- Emails: Real sending (Resend)

**Gap:** No staging environment currently configured.

---

## Scalability Considerations

### Current Limits
- **Database:** Supabase Free Tier (500MB, 2 connections)
- **API Routes:** Vercel Serverless (10-second timeout, 50MB response)
- **File Uploads:** 50MB max per file
- **Concurrent Users:** ~100 (limited by DB connections)

### Scale Targets (Year 1)
- **Users:** 500 active organizations
- **Projects:** 5,000 projects
- **Database:** 2GB (within Supabase Pro tier)
- **API Requests:** 10M/month

### Scaling Strategy

**Database:**
- Upgrade to Supabase Pro ($25/month) at 50 orgs
- Add read replicas at 200 orgs
- Consider dedicated cluster at 1,000 orgs

**API:**
- Redis caching for eligibility results
- Background jobs for heavy calculations
- Rate limiting per tier (free: 10/min, pro: 100/min)

**Storage:**
- Move to S3/Cloudflare R2 for files >50MB
- Implement CDN for static assets
- Compress images/PDFs before storage

---

## Disaster Recovery

### Backup Strategy
- **Database:** Supabase auto-backups (daily, 7-day retention)
- **Code:** GitHub (version control)
- **Configuration:** Vercel environment variables (manual export)

### Recovery Plan
1. **Database Failure:** Restore from Supabase backup (RTO: 1 hour)
2. **Vercel Outage:** Re-deploy to Netlify (RTO: 2 hours)
3. **Data Corruption:** Rollback migration, restore backup (RTO: 4 hours)

**RPO (Recovery Point Objective):** 24 hours (daily backups)
**RTO (Recovery Time Objective):** 4 hours (manual restore)

---

## Future Architecture Considerations

### When to Migrate Away from Monolith

**Triggers:**
- >1,000 active organizations
- >100,000 API requests/day
- >10GB database size
- >5 engineers on team

**Microservices Candidates:**
1. **AI Service** - LLM orchestration (heavy compute)
2. **Analytics Service** - BI, reporting (separate DB)
3. **Marketplace Service** - Transaction processing (PCI compliance)
4. **Document Service** - File processing (OCR, NLP)

**Migration Path:**
```
Monolith → Modular Monolith → Microservices
  (Today)     (Year 2)           (Year 3+)
```

---

*This architecture document is a living blueprint. Update when major technical decisions are made.*
