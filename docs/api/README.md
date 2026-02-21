# IncentEdge API Documentation

Welcome to the IncentEdge API! This guide will help you get started with integrating IncentEdge's incentive discovery and application platform into your applications.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Endpoints Overview](#endpoints-overview)
- [Code Examples](#code-examples)
- [Common Use Cases](#common-use-cases)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Webhooks](#webhooks)
- [Support](#support)

## Getting Started

### Base URL

```
Production: https://incentedge.com/api
Development: http://localhost:3000/api
```

### API Version

Current version: **v1.0.0**

The API follows semantic versioning. Breaking changes will be communicated via:
- API response headers (`X-API-Deprecation`, `Sunset`)
- Email notifications to registered developers
- Changelog updates

### Quick Start

1. **Sign up** for an IncentEdge account at [incentedge.com/signup](https://incentedge.com/signup)
2. **Generate an API key** from your account settings
3. **Make your first request**:

```bash
curl https://incentedge.com/api/health \
  -H "X-API-Key: your_api_key_here"
```

## Authentication

IncentEdge supports two authentication methods:

### 1. Session Authentication (Browser)

For browser-based applications, authentication is handled automatically via secure HTTP-only cookies after login.

```javascript
// Login first (handled by Supabase Auth)
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Then make authenticated requests
const response = await fetch('/api/projects', {
  credentials: 'include' // Include cookies
});
```

### 2. API Key Authentication (Server/Programmatic)

For server-to-server integrations, use API keys with the `X-API-Key` header.

**Generating an API Key:**

1. Navigate to Settings → API Keys
2. Click "Create New Key"
3. Set name, scopes, and expiration
4. Copy the key (shown only once!)

**Using the API Key:**

```bash
curl https://incentedge.com/api/projects \
  -H "X-API-Key: sk_live_abc123xyz789" \
  -H "Content-Type: application/json"
```

```javascript
const response = await fetch('https://incentedge.com/api/projects', {
  headers: {
    'X-API-Key': 'sk_live_abc123xyz789',
    'Content-Type': 'application/json'
  }
});
```

```python
import requests

headers = {
    'X-API-Key': 'sk_live_abc123xyz789',
    'Content-Type': 'application/json'
}

response = requests.get('https://incentedge.com/api/projects', headers=headers)
data = response.json()
```

### API Key Scopes

Control access with granular scopes:

- `read` - Read access to all resources
- `write` - Create and update resources
- `delete` - Delete resources
- `projects:read` - Read projects only
- `projects:write` - Manage projects
- `incentives:read` - Search incentive programs
- `applications:read` - View applications
- `applications:write` - Manage applications
- `analytics:read` - Access analytics data
- `webhooks:manage` - Manage webhooks
- `api_keys:manage` - Manage API keys (admin only)

## Rate Limiting

Rate limits prevent abuse and ensure fair usage across all users.

### Limits by Tier

| Tier | Requests/Hour | Burst Limit |
|------|---------------|-------------|
| Free | 100 | 20/min |
| Starter | 1,000 | 100/min |
| Professional | 10,000 | 500/min |
| Team | 50,000 | 2,000/min |
| Enterprise | Custom | Custom |

### Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1708095600
```

### Handling Rate Limits

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "details": {
    "limit": 1000,
    "remaining": 0,
    "reset": 1708095600
  },
  "requestId": "req_abc123"
}
```

**Retry-After** header indicates when you can retry (in seconds).

**Best Practices:**
- Implement exponential backoff
- Cache responses when possible
- Use webhooks instead of polling
- Batch requests where supported

## Endpoints Overview

### Core Resources

| Resource | Description | Key Endpoints |
|----------|-------------|---------------|
| **Projects** | Real estate development projects | `GET /projects`, `POST /projects`, `GET /projects/{id}` |
| **Programs** | 24,458+ incentive programs | `GET /programs`, `GET /programs/{id}`, `POST /programs/search` |
| **Applications** | Application workflow management | `GET /applications`, `POST /applications`, `POST /applications/{id}/submit` |
| **Calculate** | Incentive estimation (public) | `POST /calculate` |
| **Reports** | Multi-format report generation | `POST /reports/generate` |
| **Dashboard** | Portfolio analytics | `GET /dashboard`, `GET /dashboard/stats` |

### Supporting Resources

| Resource | Description |
|----------|-------------|
| **Analytics** | Advanced analytics and insights |
| **Documents** | Document management and AI extraction |
| **Compliance** | Compliance tracking and certification |
| **Team** | Team member management |
| **Organizations** | Organization settings |
| **Integrations** | Webhooks and API keys |

See [ENDPOINTS.md](./ENDPOINTS.md) for complete endpoint reference.

## Code Examples

### JavaScript/TypeScript

#### Search for Incentive Programs

```typescript
async function searchIncentives(state: string, buildingType: string) {
  const params = new URLSearchParams({
    state,
    building_type: buildingType,
    status: 'active',
    sort_by: 'popularity_score',
    limit: '50'
  });

  const response = await fetch(`https://incentedge.com/api/programs?${params}`, {
    headers: {
      'X-API-Key': process.env.INCENTEDGE_API_KEY!,
    }
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data; // Array of IncentiveProgram objects
}

// Usage
const nyPrograms = await searchIncentives('NY', 'multifamily');
console.log(`Found ${nyPrograms.length} programs`);
```

#### Calculate Incentive Potential

```typescript
async function calculateIncentives(projectData: {
  state: string;
  totalDevelopmentCost: number;
  equityInvestment: number;
  buildingType?: string;
  totalUnits?: number;
  affordablePercentage?: number;
}) {
  const response = await fetch('https://incentedge.com/api/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData)
  });

  const result = await response.json();
  return result;
}

// Usage
const estimate = await calculateIncentives({
  state: 'NY',
  totalDevelopmentCost: 250_000_000,
  equityInvestment: 60_000_000,
  buildingType: 'multifamily',
  totalUnits: 300,
  affordablePercentage: 30
});

console.log(`Total incentives: $${estimate.results.totals.total.toLocaleString()}`);
console.log(`IRR lift: ${estimate.results.roiImpact.irrLift.toFixed(1)}%`);
```

#### Create a Project

```typescript
async function createProject(apiKey: string, project: {
  name: string;
  state: string;
  city: string;
  address_line1: string;
  zip_code: string;
  sector_type: string;
  building_type: string;
  construction_type: string;
  total_units?: number;
  total_sqft?: number;
  total_development_cost?: number;
}) {
  const response = await fetch('https://incentedge.com/api/projects', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const { data } = await response.json();
  return data;
}
```

#### Get Dashboard Stats

```typescript
async function getDashboardStats(apiKey: string) {
  const response = await fetch('https://incentedge.com/api/dashboard', {
    headers: {
      'X-API-Key': apiKey,
    }
  });

  const { data } = await response.json();

  return {
    projects: data.totalProjects,
    totalIncentives: data.totalPotentialIncentives,
    captured: data.totalCapturedIncentives,
    subsidyRate: data.subsidyRate,
    successRate: data.successRate
  };
}
```

### Python

#### Search and Filter Programs

```python
import requests
from typing import List, Dict, Optional

class IncentEdgeClient:
    def __init__(self, api_key: str, base_url: str = "https://incentedge.com/api"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def search_programs(
        self,
        state: Optional[str] = None,
        category: Optional[str] = None,
        building_type: Optional[str] = None,
        direct_pay_eligible: Optional[bool] = None,
        limit: int = 20
    ) -> List[Dict]:
        """Search for incentive programs with filters."""
        params = {'limit': limit}

        if state:
            params['state'] = state
        if category:
            params['category'] = category
        if building_type:
            params['building_type'] = building_type
        if direct_pay_eligible is not None:
            params['direct_pay_eligible'] = str(direct_pay_eligible).lower()

        response = self.session.get(f"{self.base_url}/programs", params=params)
        response.raise_for_status()

        data = response.json()
        return data['data']

    def calculate_incentives(self, project_params: Dict) -> Dict:
        """Calculate estimated incentives for a project."""
        response = self.session.post(
            f"{self.base_url}/calculate",
            json=project_params
        )
        response.raise_for_status()
        return response.json()

    def create_project(self, project_data: Dict) -> Dict:
        """Create a new project."""
        response = self.session.post(
            f"{self.base_url}/projects",
            json=project_data
        )
        response.raise_for_status()
        return response.json()['data']

    def get_dashboard_stats(self) -> Dict:
        """Get portfolio dashboard statistics."""
        response = self.session.get(f"{self.base_url}/dashboard")
        response.raise_for_status()
        return response.json()['data']

# Usage
client = IncentEdgeClient(api_key="sk_live_abc123xyz789")

# Search for IRA Direct Pay programs in NY
ira_programs = client.search_programs(
    state="NY",
    category="federal",
    direct_pay_eligible=True
)

print(f"Found {len(ira_programs)} Direct Pay programs in NY")

# Calculate incentives
estimate = client.calculate_incentives({
    'state': 'NY',
    'buildingType': 'multifamily',
    'totalUnits': 300,
    'totalDevelopmentCost': 250_000_000,
    'equityInvestment': 60_000_000,
    'affordablePercentage': 30,
    'sustainabilityTier': 'tier_2_high_performance'
})

print(f"Total estimated incentives: ${estimate['results']['totals']['total']:,.0f}")
print(f"Federal: ${estimate['results']['totals']['federal']:,.0f}")
print(f"State: ${estimate['results']['totals']['state']:,.0f}")
```

### cURL Examples

#### Health Check

```bash
curl https://incentedge.com/api/health
```

#### Search Programs

```bash
curl -X GET "https://incentedge.com/api/programs?state=NY&category=federal&direct_pay_eligible=true&limit=10" \
  -H "X-API-Key: sk_live_abc123xyz789"
```

#### Calculate Incentives

```bash
curl -X POST https://incentedge.com/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "state": "NY",
    "buildingType": "multifamily",
    "totalUnits": 300,
    "totalDevelopmentCost": 250000000,
    "equityInvestment": 60000000,
    "affordablePercentage": 30
  }'
```

#### Create Project

```bash
curl -X POST https://incentedge.com/api/projects \
  -H "X-API-Key: sk_live_abc123xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Towers",
    "state": "CA",
    "city": "Los Angeles",
    "address_line1": "123 Main St",
    "zip_code": "90001",
    "sector_type": "real-estate",
    "building_type": "multifamily",
    "construction_type": "new-construction",
    "total_units": 150,
    "total_sqft": 180000,
    "total_development_cost": 120000000
  }'
```

#### Generate Report

```bash
curl -X POST https://incentedge.com/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "My Project",
    "projectData": {
      "state": "NY",
      "city": "Mount Vernon",
      "buildingType": "mixed_use",
      "totalUnits": 747,
      "totalSqft": 850000,
      "affordablePercentage": 30,
      "totalDevelopmentCost": 588800000
    },
    "reportType": "executive_summary",
    "format": "json"
  }'
```

## Common Use Cases

### 1. Lead Generation & Qualification

Qualify leads by estimating incentive potential:

```typescript
async function qualifyLead(leadData) {
  // Quick calculation to show potential value
  const estimate = await fetch('https://incentedge.com/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      state: leadData.state,
      totalDevelopmentCost: leadData.projectCost,
      equityInvestment: leadData.projectCost * 0.25,
      buildingType: leadData.propertyType,
      totalUnits: leadData.units
    })
  });

  const result = await estimate.json();

  return {
    potentialValue: result.results.totals.total,
    irrLift: result.results.roiImpact.irrLift,
    topIncentives: result.results.incentives.slice(0, 5)
  };
}
```

### 2. Portfolio Analytics Dashboard

Build a custom dashboard with real-time metrics:

```typescript
async function buildPortfolioDashboard(apiKey: string) {
  // Fetch dashboard stats
  const statsResponse = await fetch('https://incentedge.com/api/dashboard', {
    headers: { 'X-API-Key': apiKey }
  });
  const { data: stats } = await statsResponse.json();

  // Fetch recent activity
  const activityResponse = await fetch('https://incentedge.com/api/dashboard/activity?limit=10', {
    headers: { 'X-API-Key': apiKey }
  });
  const { data: activity } = await activityResponse.json();

  // Fetch alerts
  const alertsResponse = await fetch('https://incentedge.com/api/dashboard/alerts', {
    headers: { 'X-API-Key': apiKey }
  });
  const { data: alerts } = await alertsResponse.json();

  return {
    kpis: {
      projects: stats.totalProjects,
      captured: stats.totalCapturedIncentives,
      successRate: stats.successRate,
      subsidyRate: stats.subsidyRate
    },
    activity,
    alerts
  };
}
```

### 3. Automated Application Tracking

Monitor application status and deadlines:

```python
def monitor_applications(client: IncentEdgeClient):
    """Monitor applications and send alerts for upcoming deadlines."""
    # Get all active applications
    response = client.session.get(
        f"{client.base_url}/applications",
        params={'status': 'in-progress,submitted,under-review'}
    )
    applications = response.json()['data']

    # Check for upcoming deadlines (within 14 days)
    from datetime import datetime, timedelta
    warning_date = datetime.now() + timedelta(days=14)

    urgent = []
    for app in applications:
        if app['deadline']:
            deadline = datetime.fromisoformat(app['deadline'].replace('Z', '+00:00'))
            if deadline < warning_date:
                days_remaining = (deadline - datetime.now()).days
                urgent.append({
                    'application': app['application_number'],
                    'program': app['incentive_program']['name'],
                    'days_remaining': days_remaining,
                    'status': app['status']
                })

    return urgent
```

### 4. Integration with Property Management Systems

Sync project data with IncentEdge:

```typescript
async function syncPropertyToIncentEdge(property, apiKey: string) {
  // Check if project already exists
  const searchResponse = await fetch(
    `https://incentedge.com/api/projects?search=${encodeURIComponent(property.name)}`,
    { headers: { 'X-API-Key': apiKey } }
  );

  const { data: existing } = await searchResponse.json();

  if (existing.length > 0) {
    // Update existing project
    const projectId = existing[0].id;
    await fetch(`https://incentedge.com/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        total_development_cost: property.totalCost,
        total_units: property.units,
        // ... other fields
      })
    });

    return { action: 'updated', projectId };
  } else {
    // Create new project
    const createResponse = await fetch('https://incentedge.com/api/projects', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: property.name,
        state: property.state,
        city: property.city,
        address_line1: property.address,
        zip_code: property.zipCode,
        sector_type: 'real-estate',
        building_type: mapBuildingType(property.type),
        construction_type: property.isNewConstruction ? 'new-construction' : 'acquisition',
        total_units: property.units,
        total_sqft: property.sqft,
        total_development_cost: property.totalCost
      })
    });

    const { data: project } = await createResponse.json();
    return { action: 'created', projectId: project.id };
  }
}
```

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "requestId": "req_abc123xyz789"
}
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request parameters and body |
| 401 | Unauthorized | Provide valid authentication |
| 403 | Forbidden | Check API key scopes |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limit | Wait and retry (see Retry-After header) |
| 500 | Server Error | Retry with exponential backoff |
| 503 | Service Unavailable | Service temporarily down, retry later |

### Error Handling Best Practices

```typescript
async function makeApiRequest(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    // Check for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
    }

    // Check for other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error (${response.status}): ${error.error}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
}
```

## Pagination

List endpoints support offset-based pagination:

### Request Parameters

```
?page=1&limit=20
```

- `page`: Page number (1-indexed)
- `limit`: Items per page (1-100, default: 20)

### Response Format

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

### Example: Iterate Through All Pages

```typescript
async function fetchAllProjects(apiKey: string) {
  const allProjects = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://incentedge.com/api/projects?page=${page}&limit=100`,
      { headers: { 'X-API-Key': apiKey } }
    );

    const { data, meta } = await response.json();
    allProjects.push(...data);

    hasMore = meta.hasNextPage;
    page++;
  }

  return allProjects;
}
```

## Webhooks

Subscribe to events in your IncentEdge account:

### Available Events

- `project.created`
- `project.updated`
- `project.deleted`
- `application.created`
- `application.submitted`
- `application.status_changed`
- `application.approved`
- `application.rejected`
- `document.uploaded`
- `compliance.certified`

### Webhook Payload

```json
{
  "id": "evt_abc123",
  "event": "application.approved",
  "timestamp": "2024-02-16T12:00:00Z",
  "data": {
    "application_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount_approved": 5000000,
    "program_name": "Section 45L Tax Credit"
  },
  "signature": "sha256=..."
}
```

### Verifying Webhook Signatures

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}

// Express.js example
app.post('/webhooks/incentedge', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-incentedge-signature'] as string;
  const payload = req.body.toString();

  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);

  // Handle event
  switch (event.event) {
    case 'application.approved':
      handleApplicationApproved(event.data);
      break;
    // ... other events
  }

  res.status(200).send('OK');
});
```

## Support

### Documentation

- **API Reference**: [ENDPOINTS.md](./ENDPOINTS.md)
- **OpenAPI Spec**: [openapi.yaml](./openapi.yaml)
- **Interactive Docs**: [https://incentedge.com/api-docs](https://incentedge.com/api-docs)

### Contact

- **Email**: support@incentedge.com
- **GitHub Issues**: [github.com/incentedge/api-issues](https://github.com/incentedge/api-issues)
- **Status Page**: [status.incentedge.com](https://status.incentedge.com)
- **Developer Slack**: [incentedge-dev.slack.com](https://incentedge-dev.slack.com)

### Response Times

- **Critical Issues**: < 1 hour
- **High Priority**: < 4 hours
- **Standard**: < 24 hours

### Changelog

Track API changes and updates:
- [CHANGELOG.md](./CHANGELOG.md)
- RSS Feed: [https://incentedge.com/api/changelog.xml](https://incentedge.com/api/changelog.xml)

---

**Need help?** Contact us at support@incentedge.com or visit our [Help Center](https://help.incentedge.com).
