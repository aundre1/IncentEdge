# IncentEdge Deployment Guide

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Validate environment
pnpm validate:env

# 3. Run type check
pnpm typecheck

# 4. Build for production
pnpm build:prod

# 5. Start production server
pnpm start:prod
```

## Environment Setup

### Required Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# CRITICAL - Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
API_SIGNING_SECRET=<generate-32-char-secret>
```

### Generate Secrets

```bash
# Generate API signing secret
openssl rand -base64 32
```

## Database Setup

### 1. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL
# Execute files in supabase/migrations/ in order
```

### 2. Seed Demo Data (Optional)

```bash
pnpm db:seed
```

### 3. Import Incentive Programs

```bash
# Dry run first
pnpm db:import:dry-run --file path/to/incentives.csv

# Then import
pnpm db:import --file path/to/incentives.csv
```

## Deployment Options

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

```bash
# Or via CLI
vercel --prod
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Railway / Render

Set these in your platform:

- Build Command: `pnpm build`
- Start Command: `pnpm start`
- Port: `3000`

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Supabase project created and credentials set
- [ ] Database migrations applied
- [ ] Demo data seeded (if needed)
- [ ] Build succeeds locally
- [ ] Type check passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] SSL/HTTPS configured
- [ ] Domain DNS configured

## Post-Deployment Verification

1. Check health endpoint: `GET /api/health`
2. Check status endpoint: `GET /api/status`
3. Verify authentication flows work
4. Test incentive search API
5. Verify realtime connections

## Monitoring

### Health Check Endpoints

- `/api/health` - Basic health check
- `/api/status` - Detailed system status

### Recommended Monitoring

- Sentry for error tracking
- PostHog for analytics
- Supabase dashboard for database monitoring

## Scaling Considerations

- Enable Vercel Edge Functions for global latency
- Configure Supabase connection pooling
- Set up CDN for static assets
- Enable Redis caching for frequent queries (future)

## Troubleshooting

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next
pnpm build
```

### Database Connection Issues

1. Verify Supabase credentials
2. Check connection pooling settings
3. Verify RLS policies

### Authentication Issues

1. Check callback URL in Supabase Auth settings
2. Verify OAuth provider configuration
3. Check cookie settings for production domain
