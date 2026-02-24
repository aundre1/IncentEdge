# IncentEdge MVP Final Testing Report
**Date:** February 24, 2026
**Status:** READY FOR TESTING
**Target Launch:** February 28, 2026 (Soft Launch)

---

## Executive Summary

IncentEdge MVP has completed Phase 2 (Knowledge Intelligence Layer) and is ready for comprehensive E2E testing across all 65+ API routes. This document tracks all testing activities prior to soft launch on Feb 28.

**Test Scope:** 65 API routes, 24,458 incentive programs, eligibility matching, semantic search, direct pay detection, full CRUD operations, error handling, security validation, RLS policies.

**Success Criteria:** 100% of critical routes pass. Zero regressions. All test projects show accurate eligibility matches.

---

## Test Infrastructure

### Test Runner Configuration

**Status:** Vitest setup required
**Location:** `/Users/dremacmini/Desktop/OC/incentedge/Site`

```bash
# Install test dependencies (if needed)
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom ts-node

# Add to package.json scripts:
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

### Test Database

**Database:** Supabase (dxbtycycyvmzgufdhnae)
**Env:** .env.local (connected to staging)
**Seed Data:** 24,458 incentive programs (loaded)

```bash
# Verify database connectivity
curl -X GET http://localhost:3000/api/health
# Expected: { status: "ok", timestamp: "..." }
```

---

## Test Categories & Execution Plan

### Category 1: Core API Routes (15 routes)

**Routing & Health Endpoints**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/health` | GET | Service is running | 200 OK, status=ok | ⏳ |
| `/api/status` | GET | System status | 200 OK, all systems green | ⏳ |
| `/api/seed` | POST | Seed database (DEV only) | Seeds 100 programs | ⏳ |

**Organization Management (3 routes)**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/organizations` | GET | List user orgs | 200 OK, array of orgs | ⏳ |
| `/api/organizations` | POST | Create new org | 201 Created, org object | ⏳ |
| `/api/organizations/[id]` | PUT | Update org | 200 OK, updated object | ⏳ |

**Settings & Configuration (2 routes)**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/settings` | GET | User settings | 200 OK, settings object | ⏳ |
| `/api/settings` | PATCH | Update settings | 200 OK, updated settings | ⏳ |

**Navigation & Stats (3 routes)**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/stats` | GET | Platform stats | 200 OK, stat counts | ⏳ |
| `/api/dashboard` | GET | User dashboard | 200 OK, dashboard data | ⏳ |
| `/api/dashboard/stats` | GET | Dashboard stats | 200 OK, stats breakdown | ⏳ |

---

### Category 2: Program Search & Discovery (5 routes)

**Semantic Search (New in Phase 2)**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/programs` | GET | List programs (paginated) | 200 OK, 25 programs | ⏳ |
| `/api/programs/[id]` | GET | Get single program | 200 OK, program detail | ⏳ |
| `/api/programs/search` | POST | Keyword search | 200 OK, matching programs | ⏳ |
| `/api/programs/search/semantic` | POST | Semantic search (embeddings) | 200 OK, ranked results | ⏳ |
| `/api/programs/search/semantic` | GET | Semantic search cached | 200 OK, cached results | ⏳ |

**Specific Search Queries to Test**

```json
// Test 1: Simple eligibility search
{
  "query": "solar energy tax credit residential",
  "filters": { "state": "NY" }
}

// Test 2: Program stacking search
{
  "query": "Section 45L combined with investment tax credit",
  "filters": { "type": "federal" }
}

// Test 3: Direct pay detection
{
  "query": "Section 6417 direct pay elective pay alternative",
  "filters": {}
}
```

---

### Category 3: Eligibility & Matching (4 routes)

**Eligibility Engine (Phase 2 Knowledge Intelligence)**

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/programs/eligible` | POST | Single project eligibility | 200 OK, matched programs + scores | ⏳ |
| `/api/programs/eligible` | PUT | Batch eligibility (30 projects) | 200 OK, all projects analyzed | ⏳ |
| `/api/calculate` | POST | Savings calculation | 200 OK, estimated savings | ⏳ |
| `/api/cost-estimation` | POST | Cost impact analysis | 200 OK, cost estimate | ⏳ |

**Eligibility Test Projects**

Test 30 different project profiles covering all criteria:

```json
// Profile 1: Energy efficiency retrofit
{
  "entity_type": "S-Corp",
  "state": "NY",
  "sector": "commercial-real-estate",
  "investment_amount": 500000,
  "technology": "hvac-upgrade"
}

// Profile 2: Solar + storage hybrid
{
  "entity_type": "Non-Profit",
  "state": "CA",
  "sector": "residential",
  "investment_amount": 250000,
  "technology": "solar-plus-battery"
}

// Profile 3: Heat pump retrofit
{
  "entity_type": "LLC",
  "state": "MA",
  "sector": "residential",
  "investment_amount": 75000,
  "technology": "heat-pump"
}
```

Expected: Each should return 15-50 eligible programs with confidence scores 0.5-1.0

---

### Category 4: Project Management (5 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/projects` | GET | List user projects | 200 OK, array of projects | ⏳ |
| `/api/projects` | POST | Create new project | 201 Created, project object | ⏳ |
| `/api/projects/[id]` | GET | Get project detail | 200 OK, full project | ⏳ |
| `/api/projects/[id]` | PUT | Update project | 200 OK, updated project | ⏳ |
| `/api/projects/analyze` | POST | Analyze project | 200 OK, analysis results | ⏳ |

**Test Project Data**

```json
{
  "name": "Downtown Solar Complex",
  "description": "5MW rooftop solar + 2MWh storage",
  "sector": "commercial",
  "location": {
    "state": "NY",
    "county": "Kings",
    "census_tract": "36047001000"
  },
  "investment_amount": 3500000,
  "timeline": {
    "start_date": "2026-03-01",
    "completion_date": "2026-12-31"
  },
  "technologies": ["solar", "battery-storage"],
  "entity_type": "C-Corp",
  "employees": 50
}
```

---

### Category 5: Applications & Workflow (6 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/applications` | GET | List applications | 200 OK, user's applications | ⏳ |
| `/api/applications` | POST | Create application | 201 Created, app object | ⏳ |
| `/api/applications/[id]` | GET | Get application | 200 OK, full app details | ⏳ |
| `/api/applications/[id]` | PUT | Update application | 200 OK, updated app | ⏳ |
| `/api/applications/[id]/submit` | POST | Submit application | 200 OK, status changed | ⏳ |
| `/api/applications/[id]/comments` | POST | Add comment to app | 201 Created, comment object | ⏳ |

---

### Category 6: Compliance & Documentation (7 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/compliance` | GET | List compliance items | 200 OK, items array | ⏳ |
| `/api/compliance` | POST | Create compliance item | 201 Created, item object | ⏳ |
| `/api/compliance/[projectId]` | GET | Project compliance status | 200 OK, status report | ⏳ |
| `/api/compliance/[projectId]/items` | GET | Project compliance items | 200 OK, items for project | ⏳ |
| `/api/compliance/[projectId]/certify` | POST | Certify compliance | 200 OK, certified status | ⏳ |
| `/api/documents` | GET | List documents | 200 OK, documents array | ⏳ |
| `/api/documents/upload` | POST | Upload document | 201 Created, document object | ⏳ |

---

### Category 7: Reporting & Analytics (6 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/reports` | GET | List reports | 200 OK, reports array | ⏳ |
| `/api/reports/generate` | POST | Generate new report | 201 Created, report object | ⏳ |
| `/api/analytics` | GET | Analytics dashboard | 200 OK, analytics data | ⏳ |
| `/api/analytics/applications` | GET | Application analytics | 200 OK, stats | ⏳ |
| `/api/analytics/incentives` | GET | Incentive analytics | 200 OK, distribution data | ⏳ |
| `/api/analytics/portfolio` | GET | Portfolio analytics | 200 OK, portfolio stats | ⏳ |

---

### Category 8: Team & Access Control (4 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/team` | GET | List team members | 200 OK, members array | ⏳ |
| `/api/team` | POST | Invite team member | 201 Created, invitation sent | ⏳ |
| `/api/team/[userId]` | PUT | Update member role | 200 OK, role updated | ⏳ |
| `/api/team/invitations` | GET | Pending invitations | 200 OK, invitations array | ⏳ |

---

### Category 9: Integrations (5 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/integrations/api-keys` | GET | List API keys | 200 OK, keys array | ⏳ |
| `/api/integrations/api-keys` | POST | Create API key | 201 Created, key object | ⏳ |
| `/api/integrations/connections` | GET | List integrations | 200 OK, connections array | ⏳ |
| `/api/integrations/webhooks` | GET | List webhooks | 200 OK, webhooks array | ⏳ |
| `/api/integrations/webhooks/test` | POST | Test webhook | 200 OK, webhook sent | ⏳ |

---

### Category 10: Background Jobs (3 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/jobs` | GET | List jobs | 200 OK, jobs array | ⏳ |
| `/api/jobs` | POST | Create job | 201 Created, job object | ⏳ |
| `/api/jobs/process` | POST | Process job | 200 OK, job status updated | ⏳ |

---

### Category 11: Document Processing (4 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/documents` | POST | Upload document | 201 Created, document object | ⏳ |
| `/api/documents/[id]` | GET | Get document | 200 OK, document details | ⏳ |
| `/api/documents/[id]/extract` | POST | Extract text from doc | 200 OK, extracted text | ⏳ |
| `/api/programs/ingest` | POST | Ingest incentive PDF | 201 Created, job created | ⏳ |

---

### Category 12: Billing & Stripe (4 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/stripe/checkout` | POST | Create checkout session | 200 OK, session object | ⏳ |
| `/api/stripe/portal` | POST | Create billing portal | 200 OK, portal URL | ⏳ |
| `/api/stripe/webhook` | POST | Handle webhook | 200 OK, event processed | ⏳ |
| `/api/export` | POST | Export data | 200 OK, download URL | ⏳ |

---

### Category 13: Utility Routes (6 routes)

| Route | Method | Test Case | Expected | Status |
|-------|--------|-----------|----------|--------|
| `/api/contact` | POST | Send contact form | 200 OK, message sent | ⏳ |
| `/api/email/send` | POST | Send email | 200 OK, email queued | ⏳ |
| `/api/programs/sync` | POST | Sync program data | 200 OK, sync complete | ⏳ |
| `/api/notifications` | GET | List notifications | 200 OK, notifications array | ⏳ |
| `/api/dashboard/activity` | GET | Activity log | 200 OK, activity array | ⏳ |
| `/api/dashboard/alerts` | GET | Alerts | 200 OK, alerts array | ⏳ |

---

## Critical Test Scenarios

### Scenario 1: Direct Pay Section 6417 Detection

**Goal:** Verify the system correctly identifies Section 6417 eligible programs

```bash
curl -X POST http://localhost:3000/api/programs/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Section 6417 direct pay elective pay alternative",
    "filters": {}
  }'
```

**Expected Results:**
- Returns 15-30 Section 6417 eligible programs
- Each includes `direct_pay_eligible: true` flag
- Ranked by relevance to direct pay incentives
- Example programs: IRA Section 45L, 45Q, 48, 6418

**Test Data:** See 30 test projects above - verify each correctly identifies eligibility for direct pay programs

---

### Scenario 2: Cross-Organization RLS (Row-Level Security)

**Goal:** Verify RLS prevents data leakage between organizations

**Setup:**
1. Create Organization A with User 1
2. Create Organization B with User 2
3. Create projects in both organizations
4. Log in as User 1, query `/api/projects`
5. Log in as User 2, query `/api/projects`

**Expected:**
- User 1 sees ONLY Org A projects
- User 2 sees ONLY Org B projects
- Neither can access other's data via API manipulation
- No data leakage in responses

**Test Code:**

```bash
# As User 1 (Org A)
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $USER1_TOKEN"
# Should return only Org A projects

# As User 2 (Org B)
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $USER2_TOKEN"
# Should return only Org B projects
```

---

### Scenario 3: Eligibility Matching Accuracy

**Goal:** Verify the eligibility engine correctly matches 30 test projects to programs

**Test:** Run `/api/programs/eligible` with each of 30 test projects

```bash
curl -X POST http://localhost:3000/api/programs/eligible \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test-project-1",
    "profile": {
      "entity_type": "S-Corp",
      "state": "NY",
      "sector": "commercial-real-estate",
      "investment_amount": 500000,
      "technology": "hvac-upgrade"
    }
  }'
```

**Expected Results:**
- Returns 20-50 eligible programs per project
- Confidence scores between 0.5-1.0
- Top matches are highest confidence
- Different projects have different matches (not a generic list)
- All returned programs match the input profile

**Acceptance:** All 30 test projects return meaningful, differentiated results

---

### Scenario 4: Semantic Search Quality

**Goal:** Verify semantic search returns relevant programs

**Test Queries:**
1. "residential solar tax credit"
2. "commercial heat pump rebate"
3. "energy efficiency retrofit incentive"
4. "Section 45L new construction credit"
5. "Direct pay elective pay 6417"

**Expected:**
- Each query returns top 10 relevant programs
- Results are semantically similar (not keyword-matched only)
- Confidence scores decrease as relevance drops
- Results change by query (not static)

**Manual Verification:**
- Results make sense to an energy professional
- Relevant programs appear in top 5
- No irrelevant results in top 10

---

### Scenario 5: Batch Eligibility Processing

**Goal:** Verify batch processing of 50 projects in single request

```bash
curl -X PUT http://localhost:3000/api/programs/eligible \
  -H "Content-Type: application/json" \
  -d '{
    "projects": [
      {"project_id": "p1", "profile": {...}},
      {"project_id": "p2", "profile": {...}},
      ...
      {"project_id": "p50", "profile": {...}}
    ]
  }'
```

**Expected:**
- All 50 projects processed in < 5 minutes
- Each project returns matched programs
- No timeouts or 503 errors
- Performance metrics logged
- Database not overloaded

---

## Error Handling Tests

### Test 5.1: Missing Authentication

```bash
curl -X GET http://localhost:3000/api/projects
# Expected: 401 Unauthorized
```

### Test 5.2: Invalid Organization

```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Org-ID: invalid-org-id"
# Expected: 403 Forbidden or 404 Not Found
```

### Test 5.3: Malformed Request

```bash
curl -X POST http://localhost:3000/api/programs/eligible \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
# Expected: 400 Bad Request with error message
```

### Test 5.4: Rate Limiting

```bash
# Make 150 requests in 1 minute
for i in {1..150}; do
  curl -X GET http://localhost:3000/api/projects \
    -H "Authorization: Bearer $TOKEN"
done
# Expected: 429 Too Many Requests after 100 requests
```

### Test 5.5: File Upload Validation

```bash
# Upload non-PDF file
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@invalid.txt"
# Expected: 400 Bad Request with "PDF required" error
```

---

## Performance Benchmarks

| Operation | Target | Threshold | Status |
|-----------|--------|-----------|--------|
| Single project eligibility | < 2s | < 3s | ⏳ |
| Batch 50 projects | < 5 min | < 10 min | ⏳ |
| Semantic search | < 200ms | < 500ms | ⏳ |
| Keyword search | < 100ms | < 300ms | ⏳ |
| Database query | < 50ms | < 100ms | ⏳ |
| API response (avg) | < 500ms | < 1s | ⏳ |
| Page load | < 2s | < 5s | ⏳ |

---

## Security Tests

### Test 6.1: SQL Injection

```bash
curl -X POST http://localhost:3000/api/programs/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "'; DROP TABLE incentive_programs; --"
  }'
# Expected: 400 Bad Request (sanitized) or normal search for the literal string
```

### Test 6.2: XSS Prevention

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(1)</script>"
  }'
# Expected: 400 Bad Request or script removed from response
```

### Test 6.3: CORS Header Validation

```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Origin: https://evil.com"
# Expected: CORS headers should NOT include evil.com
```

### Test 6.4: JWT Expiration

```bash
# Create an old JWT token (expired)
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $EXPIRED_TOKEN"
# Expected: 401 Unauthorized or redirect to login
```

---

## Test Execution Schedule

### Day 1 (Feb 25): Categories 1-4
- Core routes, health checks, projects
- **Target:** 4 hours, all green

### Day 2 (Feb 26): Categories 5-8
- Applications, compliance, team access
- **Target:** 4 hours, all green

### Day 3 (Feb 27): Categories 9-13 + Scenarios
- Integrations, jobs, critical test scenarios
- **Target:** 4 hours, all green
- **Contingency:** Fix any blocking issues found

### Day 4 (Feb 28): Final Review + Launch
- Re-test any fixed issues
- Run full smoke test suite
- Deploy to production
- Monitor first 2 hours live

---

## Test Result Tracking

### Pass/Fail Criteria

**PASS:** Endpoint returns expected status code and data structure
**FAIL:** Endpoint returns error or unexpected data
**SKIP:** Test blocked by infrastructure issue (note blocker)
**MANUAL:** Test requires manual verification (document results)

### Status Codes

```
✅ PASS      - Test completed successfully
❌ FAIL      - Test failed (needs fix)
⏳ PENDING   - Test not yet run
⚠️  SKIP      - Test skipped (blocked or not applicable)
📝 MANUAL    - Manual verification required
🔧 FIXING    - Issue found, fix in progress
```

---

## Supabase RLS Policy Validation

**Requirement:** Verify all 27 tables have proper RLS policies

**Tables to Check:**

```sql
-- Run this query to verify RLS is enabled
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- For each table, verify RLS is enabled:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: ALL tables show rowsecurity = true

-- For each table, verify policies exist:
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: All org-scoped tables have per-user/org policies
```

**Critical RLS Tests:**

1. Users cannot see other orgs' projects
2. Admins can see all orgs' data (if applicable)
3. Deleted records are not visible
4. Historic data is read-only (where applicable)

---

## Sign-Off & Next Steps

### After All Tests Pass

```bash
# Create final test report
git add FINAL_TEST_REPORT.md
git commit -m "test: Phase 3 E2E testing complete - 100% pass rate"

# Tag the release
git tag -a v1.0.0-beta -m "Beta launch Feb 28"
git push origin v1.0.0-beta
```

### Launch Checklist (Feb 28)

- [ ] All 65+ routes tested and passing
- [ ] 30 test projects show correct eligibility matches
- [ ] RLS policies verified (no data leakage)
- [ ] Direct pay Section 6417 detection working
- [ ] Semantic search quality validated
- [ ] Error handling verified
- [ ] Performance benchmarks met
- [ ] Security tests passed
- [ ] Database backups confirmed
- [ ] Monitoring & alerts configured
- [ ] Rollback plan documented
- [ ] Beta user communication sent

---

## Known Issues & Blockers

*(Update as testing progresses)*

| Issue | Severity | Status | Fix ETA |
|-------|----------|--------|---------|
| Vitest not configured | Medium | 🔧 | Feb 25 |
| (none currently) | - | - | - |

---

## Test Data Files

**Location:** `/Users/dremacmini/Desktop/OC/incentedge/Site/tests/fixtures/`

Files available:
- `30-test-projects.json` - 30 diverse project profiles for eligibility testing
- `incentive-search-queries.json` - Test queries for semantic search
- `error-scenarios.json` - Malformed requests for error testing

---

**Report Status:** READY FOR EXECUTION
**Created:** 2026-02-24
**Owner:** Claude Code (IncentEdge MVP Agent)
**Next Update:** Daily during Feb 25-28 testing window
