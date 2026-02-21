# IncentEdge API Endpoint Reference

Quick reference guide for all IncentEdge API endpoints.

**Legend:**
- 🔓 = Public (no authentication required)
- 🔐 = Authentication required
- 🔑 = API key or session auth required
- ⭐ = Most commonly used

## Health & Status

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | 🔓 | Health check with optional verbose mode |
| HEAD | `/health` | 🔓 | Simple liveness probe |
| GET | `/status` | 🔓 | System status overview |

## Projects ⭐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/projects` | 🔑 | List all projects with filters and pagination |
| POST | `/projects` | 🔑 | Create a new project |
| GET | `/projects/{id}` | 🔑 | Get project details by ID |
| PATCH | `/projects/{id}` | 🔑 | Update project |
| DELETE | `/projects/{id}` | 🔑 | Delete project (soft delete) |
| POST | `/projects/analyze` | 🔑 | Run AI-powered incentive matching for project |

**Common Query Parameters:**
- `?status=active` - Filter by project status
- `?sector=real-estate` - Filter by sector
- `?search=mount+vernon` - Search projects
- `?page=1&limit=20` - Pagination

## Incentive Programs ⭐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/programs` | 🔓 | Search 24,458+ incentive programs |
| HEAD | `/programs` | 🔓 | Get program statistics in headers |
| GET | `/programs/{id}` | 🔓 | Get program details |
| POST | `/programs/search` | 🔓 | Advanced search with AI recommendations |
| POST | `/programs/sync` | 🔑 | Sync program database (admin) |

**Common Query Parameters:**
- `?state=NY` - Filter by state
- `?category=federal` - Filter by category (federal/state/local/utility)
- `?direct_pay_eligible=true` - IRA Direct Pay programs only
- `?transferable=true` - Transferable tax credits
- `?building_type=multifamily` - Filter by building type
- `?sector=clean-energy` - Filter by sector
- `?search=solar` - Full-text search
- `?sort_by=popularity_score&sort_order=desc` - Sort results
- `?page=1&limit=50` - Pagination

## Calculate ⭐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/calculate` | 🔓 | Calculate incentive potential for project parameters |

**Request Body Example:**
```json
{
  "state": "NY",
  "totalDevelopmentCost": 250000000,
  "equityInvestment": 60000000,
  "buildingType": "multifamily",
  "totalUnits": 300,
  "affordablePercentage": 30
}
```

**Response Includes:**
- Matched incentive programs with estimated values
- ROI impact analysis (IRR lift, equity multiple)
- Confidence scores
- Eligibility requirements

## Applications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/applications` | 🔑 | List all applications |
| POST | `/applications` | 🔑 | Create new application |
| GET | `/applications/{id}` | 🔑 | Get application details |
| PATCH | `/applications/{id}` | 🔑 | Update application |
| DELETE | `/applications/{id}` | 🔑 | Delete application |
| POST | `/applications/{id}/submit` | 🔑 | Submit application to program administrator |
| PATCH | `/applications/{id}/status` | 🔑 | Update application status |
| GET | `/applications/{id}/tasks` | 🔑 | Get application tasks |
| POST | `/applications/{id}/tasks` | 🔑 | Create application task |
| GET | `/applications/{id}/comments` | 🔑 | Get application comments |
| POST | `/applications/{id}/comments` | 🔑 | Add comment to application |

**Common Query Parameters:**
- `?status=draft,in-progress` - Filter by status (comma-separated)
- `?project_id={uuid}` - Filter by project
- `?program_id={uuid}` - Filter by incentive program
- `?sort_by=deadline` - Sort by field
- `?page=1&limit=20` - Pagination

## Reports ⭐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports` | 🔑 | List saved reports |
| POST | `/reports/generate` | 🔓 | Generate incentive report |

**Report Types:**
- `executive_summary` - High-level overview
- `full_analysis` - Complete analysis with all sections
- `incentive_matrix` - Detailed program matrix
- `application_checklist` - Phase-by-phase implementation checklist

**Formats:**
- `json` - Structured data (default)
- `html` - Printable HTML
- `pdf` - PDF structure for client rendering
- `text` - Plain text

**Request Example:**
```json
{
  "projectName": "My Project",
  "projectData": {
    "state": "NY",
    "buildingType": "multifamily",
    "totalUnits": 300,
    "totalDevelopmentCost": 250000000
  },
  "reportType": "executive_summary",
  "format": "json"
}
```

## Dashboard ⭐

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | 🔑 | Get portfolio KPIs and stats |
| GET | `/dashboard/stats` | 🔑 | Get time-series analytics |
| GET | `/dashboard/activity` | 🔑 | Get recent activity feed |
| GET | `/dashboard/alerts` | 🔑 | Get critical alerts and deadlines |

**Dashboard Stats Include:**
- Project counts (total, active, completed)
- Financial metrics (TDC, incentives, capture rate)
- Application metrics (total, pending, success rate)
- Breakdown by category and tier
- Time-based metrics (monthly, quarterly, yearly)

## Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics` | 🔑 | Get portfolio analytics overview |
| GET | `/analytics/incentives` | 🔑 | Incentive program analytics |
| GET | `/analytics/applications` | 🔑 | Application pipeline analytics |
| GET | `/analytics/portfolio` | 🔑 | Portfolio performance metrics |

## Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/documents` | 🔑 | List documents |
| POST | `/documents/upload` | 🔑 | Upload document |
| GET | `/documents/{id}` | 🔑 | Get document details |
| DELETE | `/documents/{id}` | 🔑 | Delete document |
| POST | `/documents/{id}/extract` | 🔑 | AI-powered data extraction from document |

## Compliance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/compliance` | 🔑 | List compliance trackers |
| GET | `/compliance/{projectId}` | 🔑 | Get project compliance status |
| GET | `/compliance/{projectId}/items` | 🔑 | Get compliance checklist items |
| POST | `/compliance/{projectId}/items` | 🔑 | Add compliance item |
| POST | `/compliance/{projectId}/certify` | 🔑 | Submit certification |

## Team Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/team` | 🔑 | List team members |
| POST | `/team` | 🔐 | Invite team member |
| GET | `/team/{userId}` | 🔑 | Get team member details |
| PATCH | `/team/{userId}` | 🔐 | Update team member role |
| DELETE | `/team/{userId}` | 🔐 | Remove team member |
| GET | `/team/invitations` | 🔑 | List pending invitations |
| POST | `/team/invitations` | 🔐 | Send invitation |
| GET | `/team/roles` | 🔑 | List available roles and permissions |

## Organizations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/organizations` | 🔐 | List organizations (admin only) |
| POST | `/organizations` | 🔐 | Create organization |
| GET | `/organizations/{id}` | 🔑 | Get organization details |
| PATCH | `/organizations/{id}` | 🔐 | Update organization |

## Cost Estimation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/cost-estimation` | 🔑 | Estimate project costs using AI |

## Stripe / Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/stripe/checkout` | 🔓 | Create Stripe checkout session |
| POST | `/stripe/portal` | 🔐 | Create customer portal session |
| POST | `/stripe/webhook` | 🔓 | Stripe webhook endpoint (signature verified) |

## Integrations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/integrations/api-keys` | 🔑 | List API keys |
| POST | `/integrations/api-keys` | 🔐 | Create API key |
| DELETE | `/integrations/api-keys/{id}` | 🔐 | Revoke API key |
| GET | `/integrations/connections` | 🔑 | List third-party connections |
| POST | `/integrations/connections` | 🔐 | Create connection |
| GET | `/integrations/webhooks` | 🔑 | List webhooks |
| POST | `/integrations/webhooks` | 🔐 | Create webhook |
| DELETE | `/integrations/webhooks/{id}` | 🔐 | Delete webhook |
| POST | `/integrations/webhooks/test` | 🔐 | Test webhook delivery |

## Jobs / Background Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/jobs` | 🔑 | List background jobs |
| GET | `/jobs/{id}` | 🔑 | Get job status |
| POST | `/jobs/process` | 🔑 | Trigger job processing |

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | 🔑 | Get user notifications |
| PATCH | `/notifications/{id}` | 🔑 | Mark notification as read |

## Settings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings` | 🔐 | Get user settings |
| PATCH | `/settings` | 🔐 | Update user settings |

## Contact

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contact` | 🔓 | Submit contact/support request |

## Email

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/email/send` | 🔑 | Send email via Resend |

## Export

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/export` | 🔑 | Export data (CSV, Excel, JSON) |

## Database Operations (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/seed` | 🔐 | Seed database with demo data (dev only) |
| GET | `/stats` | 🔓 | Get public database statistics |

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/logout` | 🔐 | Logout current session |

---

## Query Parameter Standards

### Pagination

All list endpoints support:
- `page` - Page number (1-indexed, default: 1)
- `limit` - Items per page (1-100, default: 20)

### Sorting

Most list endpoints support:
- `sort_by` - Field to sort by (varies by endpoint)
- `sort_order` - `asc` or `desc` (default varies)

### Filtering

Common filter parameters:
- `status` - Resource status (supports comma-separated values)
- `search` - Full-text search
- `created_after` - Filter by creation date (ISO 8601)
- `created_before` - Filter by creation date (ISO 8601)

### Response Metadata

All list responses include a `meta` object:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Response Headers

### Rate Limiting

All authenticated endpoints return rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1708095600
```

### Request Tracking

All responses include:
```
X-Request-ID: req_abc123xyz789
```

### Caching

Cacheable responses include:
```
Cache-Control: public, max-age=300
ETag: "abc123"
Last-Modified: Fri, 16 Feb 2024 12:00:00 GMT
```

### CORS

All API endpoints support CORS:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
```

---

## Error Response Format

All errors follow this structure:
```json
{
  "error": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "requestId": "req_abc123xyz789"
}
```

---

## Webhook Events

Subscribe to these events via `/integrations/webhooks`:

### Projects
- `project.created`
- `project.updated`
- `project.deleted`
- `project.analyzed`

### Applications
- `application.created`
- `application.submitted`
- `application.status_changed`
- `application.approved`
- `application.rejected`
- `application.withdrawn`

### Documents
- `document.uploaded`
- `document.processed`

### Compliance
- `compliance.item_completed`
- `compliance.certified`

### Team
- `team.member_added`
- `team.member_removed`
- `team.role_changed`

---

**For detailed request/response schemas, see [openapi.yaml](./openapi.yaml)**

**For usage examples, see [README.md](./README.md)**
