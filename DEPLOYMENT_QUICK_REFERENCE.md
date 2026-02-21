# IncentEdge Deployment Quick Reference

Essential commands and configurations for deploying IncentEdge.

## Pre-Deployment Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Run `npm run validate:env` successfully
- [ ] All tests passing: `npm run test:run`
- [ ] Type check passing: `npm run typecheck`
- [ ] Lint check passing: `npm run lint`
- [ ] Database migrations applied
- [ ] Secrets rotated (if needed)

## Environment Variables Quick Setup

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Generate secrets
openssl rand -base64 32  # Use for API_SIGNING_SECRET
openssl rand -base64 32  # Use for SESSION_SECRET
openssl rand -base64 32  # Use for WEBHOOK_SIGNING_SECRET

# 3. Validate
npm run validate:env
```

## Deployment Commands

### Vercel

```bash
# Staging
vercel

# Production
vercel --prod

# Using script
./scripts/deploy.sh production
```

### Docker (Local Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Docker (Production)

```bash
# Build
docker build -t incentedge:latest .

# Run
docker run -d \
  --name incentedge \
  -p 3000:3000 \
  --env-file .env.production \
  incentedge:latest
```

### Standalone Server

```bash
# Build
npm run build:prod

# Start
npm run start:prod

# With PM2
pm2 start npm --name "incentedge" -- run start:prod
```

## Health Checks

```bash
# Run health check script
./scripts/health-check.sh https://yourdomain.com

# Manual checks
curl https://yourdomain.com/api/status
curl https://yourdomain.com/api/stats
```

## Rollback Procedures

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker stop incentedge
docker rm incentedge
docker run -d --name incentedge -p 3000:3000 incentedge:previous-tag
```

## Troubleshooting

### Build Fails
```bash
rm -rf node_modules .next
pnpm install
npm run build
```

### Environment Issues
```bash
npm run validate:env
```

### Database Connection
```bash
# Check Supabase status
curl https://your-project.supabase.co/rest/v1/

# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

### Clear Cache
```bash
# Next.js
rm -rf .next

# pnpm
pnpm store prune

# Docker
docker system prune -a
```

## GitHub Actions

### Required Secrets

Set in GitHub repo settings > Secrets and variables > Actions:

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

### Workflow Triggers

- **PR to main**: Run tests, lint, type check
- **Merge to main**: Deploy to staging automatically
- **Manual approval**: Deploy to production

## Service URLs

### Local Development
- App: http://localhost:3000
- Supabase Studio: http://localhost:3010
- pgAdmin: http://localhost:5050
- Kong Gateway: http://localhost:8000

### Production
- Production: https://app.incentedge.com
- Staging: https://staging.incentedge.com

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` then `kill -9 <PID>` |
| Build timeout | Increase Vercel function timeout in `vercel.json` |
| Database connection error | Verify Supabase credentials and project status |
| Environment variable missing | Run `npm run validate:env` |
| Docker won't start | `docker-compose down && docker-compose up -d` |
| Slow performance | Check database query performance, enable caching |

## Monitoring

```bash
# Vercel logs
vercel logs

# Docker logs
docker logs incentedge

# PM2 logs
pm2 logs incentedge
```

## Database

### Backup
```bash
# Using Supabase CLI
supabase db dump > backup.sql

# Using pg_dump
pg_dump -h localhost -U postgres -d postgres > backup.sql
```

### Restore
```bash
# Using Supabase CLI
supabase db reset
psql -h localhost -U postgres -d postgres < backup.sql
```

## Security Checklist

- [ ] All secrets use strong random values (32+ chars)
- [ ] `.env.local` not committed to git
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API key validation enabled
- [ ] Security headers configured
- [ ] Dependencies audited: `pnpm audit`
- [ ] HTTPS enabled in production

## Performance Optimization

```bash
# Analyze bundle
ANALYZE=true npm run build

# Check build size
npm run build

# Lighthouse audit
npx lighthouse https://yourdomain.com
```

## Support Contacts

- **DevOps Issues**: See DEPLOYMENT.md
- **Application Issues**: Check logs and health checks
- **Database Issues**: Verify Supabase dashboard

---

**For detailed information, see [DEPLOYMENT.md](./DEPLOYMENT.md)**
