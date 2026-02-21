# IncentEdge API Documentation - Summary

## Overview

Comprehensive API documentation has been created for the IncentEdge platform, covering all 63 API endpoints across multiple resource categories.

**Created on:** February 16, 2026
**API Version:** 1.0.0
**Status:** Complete ✅

---

## Files Created

### 1. OpenAPI Specification
**Location:** `/docs/api/openapi.yaml`

- ✅ Complete OpenAPI 3.1 specification
- ✅ All 63 endpoints documented with request/response schemas
- ✅ Authentication schemes (Session + API Key)
- ✅ Comprehensive schema definitions
- ✅ Rate limiting documentation
- ✅ Error response formats
- ✅ Pagination standards
- ✅ Code examples in multiple languages

**Key Features:**
- Standardized error handling
- Consistent pagination across all list endpoints
- Detailed parameter validation
- Security scheme definitions
- Tagged endpoints for easy navigation

### 2. API Usage Guide
**Location:** `/docs/api/README.md`

- ✅ Getting Started guide
- ✅ Authentication methods (Session + API Key)
- ✅ Rate limiting explanation with tier breakdown
- ✅ Complete code examples in:
  - JavaScript/TypeScript
  - Python
  - cURL
- ✅ Common use cases:
  - Lead generation & qualification
  - Portfolio analytics dashboard
  - Automated application tracking
  - Property management system integration
- ✅ Error handling best practices
- ✅ Pagination guidelines
- ✅ Webhook integration guide
- ✅ Support contact information

### 3. Quick Reference Guide
**Location:** `/docs/api/ENDPOINTS.md`

- ✅ Complete endpoint table with 63 endpoints
- ✅ Method, path, auth requirement, and description
- ✅ Organized by resource category
- ✅ Common query parameters documented
- ✅ Response headers explained
- ✅ Webhook events listed
- ✅ Legend for authentication requirements

### 4. Postman Collection
**Location:** `/postman/IncentEdge.postman_collection.json`

- ✅ Complete Postman Collection v2.1
- ✅ All major endpoints included with examples
- ✅ Pre-configured environment variables
- ✅ Request examples with realistic data
- ✅ Global test scripts for all requests
- ✅ Authentication configured at collection level
- ✅ Organized into logical folders

**Collection Features:**
- Health checks
- Projects CRUD operations
- Incentive program search with filters
- Calculate endpoint with multiple examples
- Report generation in multiple formats
- Dashboard and analytics
- Applications workflow
- Stripe payment integration
- Contact form submission

### 5. Interactive API Documentation Page
**Location:** `/src/app/api-docs/page.tsx`

- ✅ Next.js page component with Swagger UI
- ✅ Loads OpenAPI spec dynamically
- ✅ Interactive "Try it out" functionality
- ✅ Custom styled header and navigation
- ✅ Quick stats cards (24,458+ programs, AI-powered, etc.)
- ✅ Getting started guide embedded
- ✅ Download links for all documentation
- ✅ Footer with support resources
- ✅ Rate limit tier information

**Dependency Added:** `swagger-ui-react@^5.11.0` to `package.json`

---

## API Endpoint Summary

### Total Endpoints: 63

#### By Category:

| Category | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Health & Status** | 3 | No |
| **Projects** | 6 | Yes |
| **Incentive Programs** | 5 | No* |
| **Calculate** | 1 | No |
| **Reports** | 2 | No* |
| **Dashboard** | 4 | Yes |
| **Applications** | 10 | Yes |
| **Analytics** | 4 | Yes |
| **Documents** | 5 | Yes |
| **Compliance** | 5 | Yes |
| **Team** | 6 | Yes |
| **Organizations** | 4 | Yes |
| **Stripe** | 3 | Partial |
| **Integrations** | 7 | Yes |
| **Other** | 8 | Varies |

*Some endpoints public, others require auth

### Most Important Endpoints:

1. **GET /programs** - Search 24,458+ incentive programs
2. **POST /calculate** - Calculate incentive potential (PUBLIC)
3. **POST /reports/generate** - Generate reports in multiple formats
4. **GET /projects** - List projects with filtering
5. **GET /dashboard** - Portfolio KPIs and analytics
6. **POST /applications** - Create incentive applications
7. **GET /health** - Health check and status

---

## Key Features Documented

### 1. Authentication
- **Session Auth:** Browser-based via Supabase Auth cookies
- **API Key Auth:** Server-to-server with `X-API-Key` header
- **Scopes:** Granular permissions (read, write, delete, resource-specific)

### 2. Rate Limiting
- **Free:** 100 requests/hour
- **Starter:** 1,000 requests/hour
- **Professional:** 10,000 requests/hour
- **Team:** 50,000 requests/hour
- **Enterprise:** Custom limits

### 3. Pagination
- Standard offset-based pagination
- `page` and `limit` query parameters
- Response includes `meta` object with pagination info
- Consistent across all list endpoints

### 4. Error Handling
- Standard HTTP status codes
- Consistent error response format
- Request ID tracking for support
- Detailed validation errors

### 5. Public Endpoints
- `/calculate` - No auth required for incentive estimation
- `/programs` - Public search of incentive programs
- `/health` - Public health check
- `/reports/generate` - Public report generation

---

## Developer Resources

### Documentation Files
```
docs/api/
├── openapi.yaml                      # OpenAPI 3.1 specification
├── README.md                         # API usage guide with examples
├── ENDPOINTS.md                      # Quick reference table
└── API_DOCUMENTATION_SUMMARY.md      # This file
```

### Integration Files
```
postman/
└── IncentEdge.postman_collection.json  # Postman collection

src/app/api-docs/
└── page.tsx                            # Swagger UI page
```

### Access Points
- **OpenAPI Spec:** `/docs/api/openapi.yaml`
- **Interactive Docs:** `https://incentedge.com/api-docs`
- **Postman Collection:** Download from `/postman/IncentEdge.postman_collection.json`

---

## Code Examples Provided

### JavaScript/TypeScript
- ✅ Search incentive programs
- ✅ Calculate incentives
- ✅ Create projects
- ✅ Get dashboard stats
- ✅ Error handling with TypeScript types
- ✅ Complete client class implementation

### Python
- ✅ IncentEdgeClient class
- ✅ Search programs with filters
- ✅ Calculate incentives
- ✅ Create projects
- ✅ Dashboard analytics
- ✅ Application monitoring

### cURL
- ✅ All major endpoints
- ✅ GET and POST examples
- ✅ Header configuration
- ✅ Request body formatting

---

## Next Steps

### For Development Team:

1. **Install Dependencies:**
   ```bash
   npm install swagger-ui-react@^5.11.0
   # or
   pnpm add swagger-ui-react@^5.11.0
   ```

2. **Access Interactive Docs:**
   - Navigate to `/api-docs` route
   - OpenAPI spec will load from `/docs/api/openapi.yaml`

3. **Test with Postman:**
   - Import `/postman/IncentEdge.postman_collection.json`
   - Set environment variables (`base_url`, `api_key`)
   - Run collection tests

4. **Update as Needed:**
   - Keep OpenAPI spec in sync with API changes
   - Update version numbers when releasing
   - Add new examples as use cases emerge

### For Users:

1. **Read the Guides:**
   - Start with `/docs/api/README.md`
   - Reference `/docs/api/ENDPOINTS.md` for quick lookups
   - Use interactive docs at `/api-docs` for testing

2. **Try Public Endpoints:**
   - `/calculate` - No API key needed!
   - `/programs` - Search incentive programs
   - Test with provided examples

3. **Get API Key:**
   - Sign up at incentedge.com/signup
   - Generate key from Settings → API Keys
   - Set scopes based on needs

---

## API Highlights

### 24,458+ Incentive Programs
- Federal, state, local, and utility programs
- Real-time search and filtering
- IRA Direct Pay eligible programs tagged
- Confidence scores and popularity rankings

### AI-Powered Matching
- DeepSeek for Tier 1 analysis
- Claude for Tier 2-3 deep analysis
- Probability-weighted scenarios
- ROI impact calculations

### Multi-Format Reports
- **JSON:** Structured data for integrations
- **HTML:** Printable documents
- **PDF:** Client-side rendering structure
- **Text:** Plain text export

### Real-Time Analytics
- Portfolio-wide KPIs
- Time-series metrics
- Activity feeds
- Alert system

---

## Support

**Email:** support@incentedge.com
**Status:** status.incentedge.com
**GitHub Issues:** github.com/incentedge/api-issues
**Help Center:** help.incentedge.com

**Response Times:**
- Critical: < 1 hour
- High Priority: < 4 hours
- Standard: < 24 hours

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-16 | Initial comprehensive API documentation |

---

**Status:** All deliverables completed ✅

- ✅ OpenAPI 3.1 specification (`openapi.yaml`)
- ✅ API usage guide with examples (`README.md`)
- ✅ Quick reference table (`ENDPOINTS.md`)
- ✅ Postman collection (`IncentEdge.postman_collection.json`)
- ✅ Interactive API docs page (`page.tsx`)

The IncentEdge API is now fully documented and ready for developer integration!
