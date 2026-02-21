# IncentEdge Deployment Guide

Comprehensive deployment documentation for IncentEdge across multiple platforms.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Deployment Methods](#deployment-methods)
  - [Vercel (Recommended)](#vercel-deployment)
  - [Docker](#docker-deployment)
  - [Standalone Server](#standalone-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- pnpm or npm
- PostgreSQL database (Supabase recommended)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/incentedge.git
   cd incentedge
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

4. **Validate environment**
   ```bash
   npm run validate:env
   ```

5. **Run database migrations**
   ```bash
   # If using Supabase, run migrations through Supabase CLI or dashboard
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Environment Setup

### Required Environment Variables

See `.env.example` for a complete list. Critical variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Security (generate with: openssl rand -base64 32)
API_SIGNING_SECRET=your_32_char_secret
SESSION_SECRET=your_32_char_secret
```

### Environment Validation

Run validation before deployment:

```bash
npm run validate:env
```

This checks:
- All required variables are present
- Values have correct formats
- Security secrets meet minimum length requirements

## Deployment Methods

### Vercel Deployment (Recommended)

#### Prerequisites

- Vercel account
- GitHub repository connected to Vercel

#### Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Vercel project**
   ```bash
   vercel link
   ```

3. **Add environment variables in Vercel dashboard**
   - Go to Project Settings > Environment Variables
   - Add all required variables from `.env.example`
   - Separate variables for Production/Preview/Development

4. **Deploy**

   **Staging deployment:**
   ```bash
   vercel
   ```

   **Production deployment:**
   ```bash
   vercel --prod
   ```

   **Or use the deployment script:**
   ```bash
   ./scripts/deploy.sh production
   ```

#### Automatic Deployments

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:
- Deploys to staging on merge to `main`
- Deploys to production with manual approval

#### Vercel Configuration

The `vercel.json` file configures:
- Build settings
- Environment variables
- Headers (security, caching)
- Redirects
- Function timeouts
- Cron jobs

### Docker Deployment

#### Local Development with Docker Compose

Includes full Supabase stack for local development:

1. **Configure environment**
   ```bash
   cp .env.docker .env.local
   # Edit .env.local with your settings
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **Access services**
   - IncentEdge: http://localhost:3000
   - Supabase Studio: http://localhost:3010
   - PostgreSQL: localhost:5432
   - pgAdmin: http://localhost:5050

4. **View logs**
   ```bash
   docker-compose logs -f app
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

#### Production Docker Deployment

1. **Build image**
   ```bash
   docker build -t incentedge:latest \
     --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
     --build-arg NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
     .
   ```

2. **Run container**
   ```bash
   docker run -d \
     --name incentedge \
     -p 3000:3000 \
     --env-file .env.production \
     incentedge:latest
   ```

3. **Health check**
   ```bash
   curl http://localhost:3000/api/status
   ```

### Standalone Deployment

Deploy to your own server without Docker:

1. **Build application**
   ```bash
   npm run build:prod
   ```

2. **Start server**
   ```bash
   npm run start:prod
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "incentedge" -- run start:prod
   pm2 save
   pm2 startup
   ```

4. **Configure reverse proxy (nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

Located at `.github/workflows/ci.yml`

#### On Pull Request

Runs these jobs in parallel:
1. **Lint & Type Check** - ESLint + TypeScript
2. **Unit Tests** - Vitest test suite
3. **Build** - Production build test
4. **Security Audit** - npm/pnpm audit
5. **Environment Validation** - Check required env vars

#### On Merge to Main

After all checks pass:
1. **Deploy to Staging** - Automatic deployment
2. **Deploy to Production** - Manual approval required

#### Required Secrets

Add these to GitHub repository secrets:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
API_SIGNING_SECRET
SESSION_SECRET
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

### Deployment Script

Use the automated deployment script:

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

The script:
1. Validates environment variables
2. Runs type check and tests
3. Creates backup of current deployment
4. Builds application
5. Deploys to target environment
6. Runs health checks
7. Rolls back on failure

## Health Checks

### Automated Health Check

Run comprehensive health check:

```bash
./scripts/health-check.sh https://yourdomain.com
```

Checks:
- API endpoint availability
- Database connectivity
- Response times
- Security headers
- Environment configuration

### Manual Health Check

```bash
# Check API status
curl https://yourdomain.com/api/status

# Check stats endpoint
curl https://yourdomain.com/api/stats

# Check with headers
curl -I https://yourdomain.com
```

### Health Check Endpoints

- `GET /api/status` - Basic health check
- `GET /api/stats` - Database connectivity check

## Rollback Procedures

### Vercel Rollback

1. **Via Vercel Dashboard**
   - Go to Deployments
   - Find previous successful deployment
   - Click "Promote to Production"

2. **Via CLI**
   ```bash
   vercel rollback
   ```

### Docker Rollback

1. **Stop current container**
   ```bash
   docker stop incentedge
   docker rm incentedge
   ```

2. **Run previous image**
   ```bash
   docker run -d \
     --name incentedge \
     -p 3000:3000 \
     --env-file .env.production \
     incentedge:previous-tag
   ```

### Automated Rollback

The deployment script automatically rolls back on:
- Build failure
- Health check failure
- Deployment errors

## Performance Optimization

### Build Optimization

1. **Analyze bundle**
   ```bash
   ANALYZE=true npm run build
   ```

2. **Check bundle size**
   - Vercel automatically checks bundle size
   - View in deployment logs

### Runtime Optimization

1. **Enable caching** - Configured in `vercel.json`
2. **Use CDN** - Vercel provides edge caching
3. **Database connection pooling** - Configured in Supabase
4. **API rate limiting** - Built into application

## Monitoring

### Recommended Tools

1. **Vercel Analytics** - Built-in
2. **Sentry** - Error tracking (configure with `SENTRY_DSN`)
3. **PostHog** - Product analytics (configure with `NEXT_PUBLIC_POSTHOG_KEY`)

### Logs

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker logs incentedge
```

**PM2:**
```bash
pm2 logs incentedge
```

## Troubleshooting

### Common Issues

#### Build Failures

**Problem:** `Module not found` errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
pnpm install
npm run build
```

**Problem:** TypeScript errors
```bash
# Solution: Run type check locally
npm run typecheck
```

#### Runtime Issues

**Problem:** Database connection errors
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check Supabase project status

**Problem:** API returns 500 errors
- Check environment variables are set
- Review server logs
- Verify all required secrets are present

#### Performance Issues

**Problem:** Slow page loads
- Check database query performance
- Review API response times
- Enable caching headers

### Debug Mode

Enable debug mode in development:

```bash
DEBUG_MODE=true npm run dev
```

**WARNING:** Never enable in production

### Support

For deployment issues:
1. Check this documentation
2. Review logs
3. Run health check script
4. Contact DevOps team

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` or `.env.production`
   - Use secrets management (GitHub Secrets, Vercel Env Vars)
   - Rotate secrets regularly

2. **Dependencies**
   - Run `pnpm audit` regularly
   - Keep dependencies updated
   - Review security advisories

3. **Headers**
   - Security headers configured in `next.config.js` and `vercel.json`
   - CSP, X-Frame-Options, etc.

4. **API Security**
   - API key validation enabled
   - Rate limiting configured
   - CORS properly configured

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check performance metrics
- Monitor database size

**Monthly:**
- Update dependencies
- Review and rotate secrets
- Audit user access

**Quarterly:**
- Security audit
- Performance optimization review
- Database maintenance

---

**Last Updated:** 2026-02-16
**Version:** 1.0.0
