# IncentEdge API Documentation

**Version:** 1.0.0
**Last Updated:** February 17, 2026
**Base URL:** `https://incentedge.com/api` (production) or `http://localhost:3000/api` (development)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Core Endpoints](#core-endpoints)
   - [Programs](#programs)
   - [Projects](#projects)
   - [Calculate](#calculate)
   - [Health](#health)
   - [Stats](#stats)
5. [Advanced Endpoints](#advanced-endpoints)
   - [Applications](#applications)
   - [Analytics](#analytics)
   - [Reports](#reports)
   - [Organizations](#organizations)
6. [Webhook Integration](#webhook-integration)
7. [Examples](#examples)

---

## Authentication

All authenticated endpoints require a valid JWT bearer token obtained through Supabase Auth.

### Headers

```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Public Endpoints

The following endpoints do NOT require authentication:
- `GET /api/health`
- `GET /api/stats`
- `POST /api/calculate`
- `POST /api/contact`

---

## Rate Limiting

API requests are rate-limited by IP address and tier:

| Tier | Requests per Minute | Burst Limit |
|------|---------------------|-------------|
| Free | 10 | 20 |
| Professional | 60 | 120 |
| Enterprise | 600 | 1200 |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1645123456
Retry-After: 30 (if rate limited)
```

---

## Error Handling

All errors follow a consistent format:

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  },
  "requestId": "uuid-v4",
  "timestamp": "2026-02-17T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request succeeded |
| 400 | Bad Request | Invalid parameters or body |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error (contact support) |
| 503 | Service Unavailable | Temporary outage or maintenance |

---

## Core Endpoints

### Programs

Search and retrieve incentive programs.

#### GET /api/programs

Search incentive programs with filters.

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by category: `federal`, `state`, `local`, `utility` | `?category=federal` |
| `state` | string | Two-letter state code | `?state=NY` |
| `county` | string | County name | `?county=Westchester` |
| `municipality` | string | City/municipality name | `?municipality=New York City` |
| `program_type` | string | Type: `tax_credit`, `grant`, `rebate`, etc. | `?program_type=tax_credit` |
| `sector` | string | Sector type | `?sector=commercial` |
| `technology` | string | Technology type | `?technology=solar` |
| `building_type` | string | Building type | `?building_type=multifamily` |
| `status` | string | Program status: `active`, `inactive`, `expired`, `pending` | `?status=active` |
| `direct_pay_eligible` | boolean | IRA direct pay eligibility | `?direct_pay_eligible=true` |
| `transferable` | boolean | Transferable tax credit | `?transferable=true` |
| `min_tier` | string | Minimum sustainability tier | `?min_tier=tier_2_high_performance` |
| `search` | string | Full-text search | `?search=solar` |
| `page` | number | Page number (1-indexed) | `?page=1` |
| `limit` | number | Results per page (max 100) | `?limit=20` |
| `sort_by` | string | Sort field: `name`, `created_at`, `amount_max`, `popularity_score` | `?sort_by=popularity_score` |
| `sort_order` | string | Sort direction: `asc`, `desc` | `?sort_order=desc` |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "external_id": "IRA-45L",
      "name": "Section 45L New Energy Efficient Home Credit",
      "short_name": "45L Tax Credit",
      "description": "Tax credit for builders of energy-efficient residential properties...",
      "summary": "Up to $5,000 per dwelling unit for ENERGY STAR or Zero Energy Ready homes.",
      "program_type": "tax_credit",
      "category": "federal",
      "subcategory": "IRA",
      "sector_types": ["residential", "multifamily"],
      "technology_types": ["energy_efficiency", "building_envelope"],
      "building_types": ["multifamily", "single_family", "townhouse"],
      "jurisdiction_level": "federal",
      "state": null,
      "counties": null,
      "municipalities": null,
      "utility_territories": null,
      "incentive_type": "tax_credit",
      "amount_type": "per_unit",
      "amount_fixed": null,
      "amount_percentage": null,
      "amount_per_unit": 5000,
      "amount_per_kw": null,
      "amount_per_sqft": null,
      "amount_min": 2500,
      "amount_max": 5000,
      "direct_pay_eligible": true,
      "transferable": true,
      "domestic_content_bonus": false,
      "energy_community_bonus": false,
      "prevailing_wage_bonus": true,
      "low_income_bonus": false,
      "status": "active",
      "start_date": "2023-01-01",
      "end_date": "2032-12-31",
      "application_deadline": null,
      "next_deadline": null,
      "funding_remaining": null,
      "administrator": "Internal Revenue Service",
      "administering_agency": "IRS",
      "source_url": "https://www.irs.gov/credits-deductions/45l-new-energy-efficient-home-credit",
      "application_url": null,
      "application_complexity": "medium",
      "typical_processing_days": 30,
      "stackable": true,
      "eligibility_criteria": {
        "min_efficiency": "ENERGY STAR"
      },
      "eligibility_summary": "Available to builders of new energy-efficient homes meeting ENERGY STAR or Zero Energy Ready standards.",
      "entity_types": ["corporation", "partnership", "llc"],
      "tier_bonuses": {
        "zero_energy": 5000,
        "energy_star": 2500
      },
      "minimum_sustainability_tier": "tier_1_efficient",
      "last_verified_at": "2026-02-17T12:00:00Z",
      "data_source": "IRS",
      "confidence_score": 0.98,
      "popularity_score": 95,
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2026-02-17T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 19633,
    "totalPages": 982,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters_applied": {
    "category": "federal",
    "state": null,
    "search": null
  }
}
```

**Example Request:**

```bash
curl -X GET "https://incentedge.com/api/programs?category=federal&state=NY&limit=10" \
  -H "Content-Type: application/json"
```

---

#### GET /api/programs/[id]

Get details for a single program.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Program ID |

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Section 45L Tax Credit",
    ...
  }
}
```

**Example Request:**

```bash
curl -X GET "https://incentedge.com/api/programs/abc-123-def" \
  -H "Content-Type: application/json"
```

---

#### HEAD /api/programs

Get program statistics without fetching full data.

**Response Headers:**

```http
X-Total-Programs: 19633
X-Federal-Count: 482
X-State-Count: 11847
X-Local-Count: 6128
X-Utility-Count: 1176
```

**Example Request:**

```bash
curl -I "https://incentedge.com/api/programs"
```

---

### Projects

Manage user projects and portfolios.

#### GET /api/projects

List all projects for the authenticated user's organization.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Specific project ID | `?id=mt-vernon` |
| `status` | string | Filter by status: `active`, `planning`, `in_development`, `completed` | `?status=active` |
| `sector` | string | Filter by sector | `?sector=real-estate` |
| `search` | string | Search project name/description | `?search=solar` |
| `page` | number | Page number | `?page=1` |
| `limit` | number | Results per page | `?limit=20` |
| `demo` | boolean | Return demo data (for unauthenticated testing) | `?demo=true` |

**Response:**

```json
{
  "success": true,
  "portfolio": {
    "id": "portfolio",
    "name": "Full Portfolio",
    "address": "3 projects in Westchester County",
    "kpis": {
      "value": "$1.1B",
      "identified": "$484.2M",
      "captured": "$134.8M",
      "rate": "28%",
      "programs": 100,
      "actions": 3
    }
  },
  "projects": [
    {
      "id": "mt-vernon",
      "name": "Mount Vernon Mixed-Use",
      "shortName": "Mt Vernon",
      "address": "225 South 4th Ave, Mount Vernon, NY 10550",
      "city": "Mount Vernon",
      "state": "NY",
      "county": "Westchester",
      "buildingType": "mixed_use",
      "units": "747 units",
      "type": "Mixed-Use",
      "tier": "Tier 3",
      "totalUnits": 747,
      "totalSqft": 850000,
      "affordableUnits": 224,
      "affordablePercentage": 30,
      "tdc": 588.8,
      "totalDevelopmentCost": 588800000,
      "status": "in_development",
      "kpis": {
        "value": "$588.8M",
        "identified": "$252.2M",
        "captured": "$88.1M",
        "rate": "35%",
        "programs": 48,
        "actions": 2
      },
      "scenarios": {
        "conservative": {
          "value": 88.1,
          "coverage": 15.0,
          "confidence": 80,
          "label": "Conservative"
        },
        "realistic": {
          "value": 156.1,
          "coverage": 26.5,
          "confidence": 65,
          "label": "Realistic (Base Case)"
        },
        "optimistic": {
          "value": 204.5,
          "coverage": 34.7,
          "confidence": 40,
          "label": "Optimistic"
        },
        "bestcase": {
          "value": 252.2,
          "coverage": 42.8,
          "confidence": 20,
          "label": "Best Case"
        }
      }
    }
  ],
  "fallback": false
}
```

**Example Request:**

```bash
curl -X GET "https://incentedge.com/api/projects?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

#### POST /api/projects

Create a new project.

**Authentication:** Required

**Request Body:**

```json
{
  "name": "Solar Installation Project",
  "description": "Commercial solar + storage installation",
  "sector_type": "clean-energy",
  "building_type": "commercial",
  "construction_type": "new-construction",
  "address_line1": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001",
  "county": "New York",
  "total_sqft": 50000,
  "total_units": 0,
  "affordable_units": 0,
  "capacity_mw": 2.5,
  "total_development_cost": 5000000,
  "hard_costs": 4000000,
  "soft_costs": 1000000,
  "target_certification": "LEED Gold",
  "renewable_energy_types": ["solar", "battery_storage"],
  "projected_energy_reduction_pct": 40,
  "domestic_content_eligible": true,
  "prevailing_wage_commitment": true,
  "estimated_start_date": "2026-06-01",
  "estimated_completion_date": "2027-12-31"
}
```

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Solar Installation Project",
    "organization_id": "org-uuid",
    "created_by": "user-uuid",
    "project_status": "active",
    "created_at": "2026-02-17T12:00:00Z",
    ...
  }
}
```

**Example Request:**

```bash
curl -X POST "https://incentedge.com/api/projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Solar Installation",
    "state": "NY",
    "total_development_cost": 5000000,
    ...
  }'
```

---

#### GET /api/projects/[id]

Get specific project details.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Project ID |

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Project Name",
    ...
  }
}
```

---

#### GET /api/projects/[id]/matches

Get AI-matched programs for a specific project.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max programs to return (default: 50) |
| `min_confidence` | number | Minimum confidence score 0-1 (default: 0.5) |

**Response:**

```json
{
  "data": {
    "project_id": "uuid",
    "matched_programs": [
      {
        "program": { ... },
        "match_score": 0.95,
        "eligibility_summary": "Highly eligible",
        "recommended_action": "Apply immediately",
        "estimated_value": 250000
      }
    ],
    "total_potential_value": 5000000,
    "high_confidence_count": 12
  }
}
```

---

### Calculate

Calculate potential incentives for a hypothetical project.

#### POST /api/calculate

Calculate incentive eligibility and potential value.

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "state": "NY",
  "county": "Westchester",
  "municipality": "Mount Vernon",
  "buildingType": "multifamily",
  "totalUnits": 300,
  "totalSqft": 350000,
  "affordableUnits": 90,
  "affordablePercentage": 30,
  "totalDevelopmentCost": 300000000,
  "equityInvestment": 75000000,
  "projectedNOI": 19500000,
  "holdPeriod": 5,
  "sustainabilityTier": "tier_2_high_performance",
  "solarCapacityKw": 500,
  "storageCapacityKwh": 1000,
  "entityType": "llc"
}
```

**Response:**

```json
{
  "project": {
    "state": "NY",
    "buildingType": "multifamily",
    "totalUnits": 300,
    "totalSqft": 350000,
    "totalDevelopmentCost": 300000000,
    "equityInvestment": 75000000
  },
  "results": {
    "incentives": [
      {
        "id": "calc-45L",
        "name": "Section 45L Tax Credit",
        "type": "tax_credit",
        "category": "federal",
        "description": "$3,750/unit for 300 units",
        "estimatedValue": 1125000,
        "confidence": 0.95,
        "eligible": true,
        "notes": [
          "ENERGY STAR certification required"
        ]
      },
      {
        "id": "calc-179D",
        "name": "Section 179D Deduction",
        "type": "tax_deduction",
        "category": "federal",
        "description": "$2.50/sqft for 350,000 sqft",
        "estimatedValue": 875000,
        "confidence": 0.92,
        "eligible": true,
        "notes": [
          "Prevailing wage requirement for full deduction"
        ]
      },
      {
        "id": "calc-ITC",
        "name": "Solar Investment Tax Credit",
        "type": "tax_credit",
        "category": "federal",
        "description": "30% ITC on 500 kW system",
        "estimatedValue": 500000,
        "confidence": 0.98,
        "eligible": true,
        "notes": [
          "Direct pay eligible for tax-exempt entities",
          "+10% domestic content bonus assumed"
        ]
      }
    ],
    "totals": {
      "federal": 8500000,
      "state": 1200000,
      "local": 15000000,
      "utility": 150000,
      "total": 24850000
    },
    "roiImpact": {
      "baseIRR": 14.2,
      "enhancedIRR": 22.8,
      "irrLift": 8.6,
      "equityMultipleLift": 0.42
    }
  },
  "meta": {
    "calculatedAt": "2026-02-17T12:00:00Z",
    "responseTime": "245ms",
    "version": "1.0.0"
  }
}
```

**Example Request:**

```bash
curl -X POST "https://incentedge.com/api/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "NY",
    "totalUnits": 300,
    "totalDevelopmentCost": 300000000,
    "equityInvestment": 75000000,
    "sustainabilityTier": "tier_2_high_performance"
  }'
```

---

### Health

Service health check endpoint.

#### GET /api/health

Comprehensive health check with dependency status.

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `quick` | boolean | Quick liveness check (no dependency checks) |
| `verbose` | boolean | Include detailed metrics and build info |

**Response (Full Check):**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-17T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": [
    {
      "name": "database",
      "status": "pass",
      "message": "Connected to Supabase",
      "lastChecked": "2026-02-17T12:00:00Z",
      "responseTime": "12ms"
    },
    {
      "name": "external_api",
      "status": "pass",
      "message": "All external services operational",
      "lastChecked": "2026-02-17T12:00:00Z"
    }
  ],
  "metrics": {
    "memory": {
      "used": 234567890,
      "total": 536870912,
      "percentage": 43.7
    },
    "cpu": {
      "usage": 12.5
    }
  }
}
```

**Response (Quick Check):**

```json
{
  "status": "alive",
  "timestamp": "2026-02-17T12:00:00Z",
  "version": "1.0.0"
}
```

**Response (Verbose):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "environment": "production",
  "build": {
    "time": "2026-02-17T08:00:00Z",
    "commit": "abc123def456"
  },
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "supabase": "2.x"
  },
  ...
}
```

**Example Request:**

```bash
# Quick check
curl "https://incentedge.com/api/health?quick=true"

# Full check
curl "https://incentedge.com/api/health"

# Verbose check
curl "https://incentedge.com/api/health?verbose=true"
```

---

#### HEAD /api/health

Simple liveness probe (returns 200 if service is running).

**Response Headers:**

```http
X-Health-Status: alive
X-Version: 1.0.0
```

---

### Stats

Platform-wide statistics and metrics.

#### GET /api/stats

Get comprehensive platform statistics.

**Authentication:** Not required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `quick` | boolean | Quick stats for KPI cards only |

**Response (Full):**

```json
{
  "incentives": {
    "total": 30007,
    "active": 30007,
    "by_category": {
      "federal": 482,
      "state": 18127,
      "local": 9222,
      "utility": 2176
    }
  },
  "awards": {
    "total": 8000000,
    "success_rate": 0.85,
    "average_processing_days": 45
  },
  "coverage": {
    "states_covered": 50,
    "states_list": ["AL", "AK", "AZ", ...]
  },
  "platform": {
    "total_projects": 1250,
    "total_applications": 3840
  },
  "value": {
    "total_incentives_identified": 2800000000,
    "total_incentives_captured": 450000000,
    "capture_rate": 0.16
  },
  "meta": {
    "timestamp": "2026-02-17T12:00:00Z",
    "response_time_ms": 45,
    "cache_max_age": 300
  }
}
```

**Response (Quick):**

```json
{
  "incentives_count": 30007,
  "awards_count": 8000000,
  "states_covered": 50,
  "success_rate": 0.85,
  "timestamp": "2026-02-17T12:00:00Z"
}
```

**Example Request:**

```bash
# Full stats
curl "https://incentedge.com/api/stats"

# Quick stats
curl "https://incentedge.com/api/stats?quick=true"
```

---

## Advanced Endpoints

### Applications

Track grant/incentive applications.

#### GET /api/applications

List applications (requires authentication).

**Authentication:** Required

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "program_id": "uuid",
      "project_id": "uuid",
      "status": "submitted",
      "submitted_at": "2026-02-01T10:00:00Z",
      "estimated_value": 500000
    }
  ]
}
```

---

#### POST /api/applications

Create new application tracking record.

**Authentication:** Required

**Request Body:**

```json
{
  "program_id": "uuid",
  "project_id": "uuid",
  "estimated_value": 500000,
  "notes": "Application submitted via portal"
}
```

---

### Analytics

Advanced analytics and insights.

#### GET /api/analytics/portfolio

Portfolio-level analytics (requires authentication).

**Authentication:** Required

**Response:**

```json
{
  "total_value": 500000000,
  "incentive_value": 125000000,
  "capture_rate": 0.25,
  "projects_count": 15,
  "trending": {
    "programs_added_this_month": 125,
    "value_increase_pct": 8.5
  }
}
```

---

### Reports

Generate PDF/Excel reports.

#### POST /api/reports/generate

Generate custom report.

**Authentication:** Required

**Request Body:**

```json
{
  "project_id": "uuid",
  "format": "pdf",
  "sections": ["executive_summary", "programs", "financials"]
}
```

**Response:**

```json
{
  "report_url": "https://cdn.incentedge.com/reports/abc123.pdf",
  "expires_at": "2026-02-24T12:00:00Z"
}
```

---

### Organizations

Manage organizations (multi-tenant).

#### GET /api/organizations

Get current user's organization.

**Authentication:** Required

**Response:**

```json
{
  "data": {
    "id": "uuid",
    "name": "Acme Development Corp",
    "tier": "enterprise",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## Webhook Integration

IncentEdge can send webhooks for key events.

### Webhook Events

| Event | Description |
|-------|-------------|
| `program.matched` | New program matched to project |
| `application.status_changed` | Application status update |
| `deadline.approaching` | Application deadline within 7 days |

### Webhook Payload

```json
{
  "event": "program.matched",
  "timestamp": "2026-02-17T12:00:00Z",
  "data": {
    "project_id": "uuid",
    "program_id": "uuid",
    "match_score": 0.95
  }
}
```

---

## Examples

### Example 1: Find Solar Incentives in California

```bash
curl -X GET "https://incentedge.com/api/programs?state=CA&technology=solar&limit=10" \
  -H "Content-Type: application/json"
```

### Example 2: Calculate Incentives for Multifamily Project

```bash
curl -X POST "https://incentedge.com/api/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "state": "NY",
    "buildingType": "multifamily",
    "totalUnits": 200,
    "totalDevelopmentCost": 200000000,
    "equityInvestment": 50000000,
    "affordablePercentage": 30
  }'
```

### Example 3: Create Project and Get Matches

```bash
# Step 1: Create project
PROJECT_ID=$(curl -X POST "https://incentedge.com/api/projects" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brooklyn Mixed-Use",
    "state": "NY",
    "total_development_cost": 150000000,
    ...
  }' | jq -r '.data.id')

# Step 2: Get matched programs
curl -X GET "https://incentedge.com/api/projects/$PROJECT_ID/matches" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Support

For API support, contact:
- **Email:** api-support@incentedge.com
- **Documentation:** https://docs.incentedge.com
- **Status Page:** https://status.incentedge.com

---

**IncentEdge API Documentation v1.0.0**
**Copyright © 2026 IncentEdge. All rights reserved.**
