# API Documentation Installation & Setup

This guide will help you set up and access the IncentEdge API documentation.

## Quick Start

### 1. Install Dependencies

The interactive API docs page requires `swagger-ui-react`:

```bash
# Using npm
npm install swagger-ui-react@^5.11.0

# Using pnpm (recommended for this project)
pnpm add swagger-ui-react@^5.11.0

# Using yarn
yarn add swagger-ui-react@^5.11.0
```

### 2. Verify Files

All documentation files should be in place:

```bash
# Check documentation files
ls -la docs/api/
# Should see: openapi.yaml, README.md, ENDPOINTS.md, API_DOCUMENTATION_SUMMARY.md

# Check Postman collection
ls -la postman/
# Should see: IncentEdge.postman_collection.json

# Check API docs page
ls -la src/app/api-docs/
# Should see: page.tsx
```

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

### 4. Access Documentation

Once the server is running, access the documentation at:

- **Interactive Docs:** http://localhost:3000/api-docs
- **OpenAPI Spec:** http://localhost:3000/docs/api/openapi.yaml
- **API Guide:** http://localhost:3000/docs/api/README.md
- **Quick Reference:** http://localhost:3000/docs/api/ENDPOINTS.md

## Production Deployment

### Static Files

Ensure the following directories are included in your build:

```javascript
// next.config.js
module.exports = {
  // ... other config

  async rewrites() {
    return [
      {
        source: '/docs/:path*',
        destination: '/docs/:path*'
      }
    ]
  }
}
```

### Environment Variables

No additional environment variables are needed for the API documentation itself. However, for testing:

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Testing the API

### Using the Interactive Docs

1. Navigate to `/api-docs`
2. Click "Authorize" button
3. Enter your API key (format: `sk_live_...`)
4. Click any endpoint
5. Click "Try it out"
6. Fill in parameters
7. Click "Execute"

### Using Postman

1. Import the collection:
   ```bash
   # From file
   File → Import → /postman/IncentEdge.postman_collection.json

   # From URL (production)
   https://incentedge.com/postman/IncentEdge.postman_collection.json
   ```

2. Set environment variables:
   - `base_url`: `http://localhost:3000/api` (dev) or `https://incentedge.com/api` (prod)
   - `api_key`: Your API key

3. Run requests or entire collection

### Using cURL

Test a public endpoint (no auth required):

```bash
# Health check
curl http://localhost:3000/api/health

# Calculate incentives
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "state": "NY",
    "totalDevelopmentCost": 250000000,
    "equityInvestment": 60000000,
    "buildingType": "multifamily",
    "totalUnits": 300
  }'
```

Test an authenticated endpoint:

```bash
# Get projects
curl http://localhost:3000/api/projects \
  -H "X-API-Key: sk_live_your_key_here"
```

## Customization

### Modifying the OpenAPI Spec

Edit `/docs/api/openapi.yaml`:

```yaml
# Update version
info:
  version: 1.1.0

# Add new endpoint
paths:
  /new-endpoint:
    get:
      summary: New endpoint
      # ... endpoint definition
```

Changes will be reflected immediately in the interactive docs.

### Styling the Swagger UI

Edit `/src/app/api-docs/page.tsx`:

```typescript
// Custom CSS in useEffect
const style = document.createElement('style');
style.textContent = `
  .swagger-ui .info .title {
    color: #your-brand-color;
  }
  // ... more custom styles
`;
```

### Adding More Examples

In `openapi.yaml`, add examples to request bodies:

```yaml
requestBody:
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/Project'
      examples:
        example1:
          summary: Multifamily project
          value:
            name: "Example Project"
            state: "NY"
            # ... more fields
```

## Troubleshooting

### Swagger UI Not Loading

**Problem:** Blank page at `/api-docs`

**Solutions:**
1. Check browser console for errors
2. Verify `swagger-ui-react` is installed:
   ```bash
   npm list swagger-ui-react
   ```
3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

### OpenAPI Spec Not Found

**Problem:** 404 error loading `openapi.yaml`

**Solutions:**
1. Verify file exists: `ls docs/api/openapi.yaml`
2. Check Next.js static file serving
3. Use absolute path in SwaggerUI component:
   ```typescript
   <SwaggerUI url="/docs/api/openapi.yaml" />
   ```

### API Key Not Working

**Problem:** 401 Unauthorized with valid API key

**Solutions:**
1. Check header format: `X-API-Key` (not `Authorization`)
2. Verify key hasn't expired
3. Check API key scopes match required permissions
4. Test with a different endpoint

### CORS Errors

**Problem:** CORS errors when testing from docs

**Solutions:**
1. Ensure API routes include CORS headers:
   ```typescript
   return NextResponse.json(data, {
     headers: {
       'Access-Control-Allow-Origin': '*',
       'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
       'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
     }
   });
   ```

2. Add OPTIONS handler to routes:
   ```typescript
   export async function OPTIONS(request: NextRequest) {
     return new NextResponse(null, {
       status: 204,
       headers: {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
         'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
       }
     });
   }
   ```

## Validation

### OpenAPI Spec Validation

Validate your OpenAPI spec:

```bash
# Using npx (no install needed)
npx @apidevtools/swagger-cli validate docs/api/openapi.yaml

# Or install globally
npm install -g @apidevtools/swagger-cli
swagger-cli validate docs/api/openapi.yaml
```

### Postman Collection Testing

Run automated tests:

```bash
# Install newman (Postman CLI)
npm install -g newman

# Run collection
newman run postman/IncentEdge.postman_collection.json \
  --env-var "base_url=http://localhost:3000/api" \
  --env-var "api_key=your_key_here"
```

## Updating Documentation

### When Adding New Endpoints

1. **Update OpenAPI Spec** (`docs/api/openapi.yaml`):
   ```yaml
   paths:
     /new-endpoint:
       get:
         summary: Description
         tags: [Category]
         # ... full definition
   ```

2. **Update Quick Reference** (`docs/api/ENDPOINTS.md`):
   ```markdown
   | GET | `/new-endpoint` | 🔑 | Description |
   ```

3. **Add to Postman Collection** (`postman/IncentEdge.postman_collection.json`):
   - Add request to appropriate folder
   - Include example request/response

4. **Update Usage Guide** (`docs/api/README.md`):
   - Add code examples if it's a common use case
   - Update any relevant sections

### Version Management

When releasing a new API version:

1. Update version in `openapi.yaml`:
   ```yaml
   info:
     version: 1.1.0
   ```

2. Update version in Postman collection:
   ```json
   {
     "info": {
       "version": "1.1.0"
     }
   }
   ```

3. Update `API_DOCUMENTATION_SUMMARY.md` version history

4. Consider maintaining old versions for backward compatibility

## Best Practices

### Documentation
- ✅ Keep OpenAPI spec as single source of truth
- ✅ Add examples for all request/response bodies
- ✅ Document all query parameters and headers
- ✅ Include error responses (400, 401, 404, 500)
- ✅ Use consistent naming conventions

### Testing
- ✅ Test all endpoints in Postman collection
- ✅ Include both success and error cases
- ✅ Validate request/response against OpenAPI spec
- ✅ Test with different authentication methods
- ✅ Verify rate limiting behavior

### Maintenance
- ✅ Review docs quarterly for accuracy
- ✅ Update examples with real-world use cases
- ✅ Monitor API usage to identify popular endpoints
- ✅ Collect developer feedback
- ✅ Version documentation alongside API changes

## Resources

### External Tools
- **Swagger Editor:** https://editor.swagger.io (online OpenAPI editor)
- **Postman:** https://www.postman.com (API testing)
- **Newman:** https://www.npmjs.com/package/newman (CLI runner)
- **Swagger CLI:** https://www.npmjs.com/package/@apidevtools/swagger-cli (validation)

### IncentEdge Resources
- **API Docs:** `/api-docs`
- **Support:** support@incentedge.com
- **Status:** status.incentedge.com
- **GitHub:** github.com/incentedge/api-issues

## Next Steps

1. ✅ Install `swagger-ui-react` dependency
2. ✅ Start development server
3. ✅ Access interactive docs at `/api-docs`
4. ✅ Import Postman collection
5. ✅ Test public endpoints
6. ✅ Generate API key
7. ✅ Test authenticated endpoints
8. ✅ Read usage guide and examples

---

**Questions?** Contact support@incentedge.com
