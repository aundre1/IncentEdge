# Docker Setup for IncentEdge

This directory contains Docker configuration for local development with full Supabase stack.

## Quick Start

1. **Configure environment**
   ```bash
   cp .env.docker .env.local
   # Edit .env.local with your settings
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access services**
   - **IncentEdge App**: http://localhost:3000
   - **Supabase Studio**: http://localhost:3010
   - **PostgreSQL**: localhost:5432
   - **pgAdmin**: http://localhost:5050
   - **Kong API Gateway**: http://localhost:8000

## Services

### IncentEdge Application
- **Port**: 3000
- **Description**: Main Next.js application
- **Logs**: `docker-compose logs -f app`

### Supabase Studio
- **Port**: 3010
- **Description**: Database management UI
- **Access**: http://localhost:3010

### PostgreSQL
- **Port**: 5432
- **User**: postgres
- **Password**: Set in `.env.local` (POSTGRES_PASSWORD)
- **Database**: postgres

### Kong API Gateway
- **Port**: 8000
- **Description**: Routes requests to Supabase services
- **Configuration**: `volumes/api/kong.yml`

### Auth (GoTrue)
- **Internal Port**: 9999
- **Description**: Supabase authentication service

### Rest (PostgREST)
- **Internal Port**: 3000
- **Description**: Automatic REST API for PostgreSQL

### Realtime
- **Internal Port**: 4000
- **Description**: WebSocket connections for real-time features

### Storage
- **Internal Port**: 5000
- **Description**: File storage service
- **Data**: `volumes/storage/`

### Meta
- **Internal Port**: 8080
- **Description**: Database metadata service

### pgAdmin
- **Port**: 5050
- **Email**: Set in `.env.local` (PGADMIN_EMAIL)
- **Password**: Set in `.env.local` (PGADMIN_PASSWORD)
- **Description**: Advanced PostgreSQL management UI

## Common Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app

# Start with logs
docker-compose up
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild
```bash
# Rebuild app after code changes
docker-compose build app
docker-compose up -d app

# Rebuild all services
docker-compose build
docker-compose up -d
```

## Volume Management

### Database Data
- **Location**: `volumes/db/data/`
- **Description**: PostgreSQL data files
- **Backup**: Regular backups recommended

### Storage Files
- **Location**: `volumes/storage/`
- **Description**: Uploaded files and documents

### pgAdmin Configuration
- **Location**: `volumes/pgadmin/`
- **Description**: pgAdmin settings and saved connections

## Database Connection

### From Host Machine

```bash
# Using psql
psql -h localhost -p 5432 -U postgres -d postgres

# Connection string
postgresql://postgres:your-password@localhost:5432/postgres
```

### From Application

Use the environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
```

### From pgAdmin

1. Open http://localhost:5050
2. Login with credentials from `.env.local`
3. Add new server:
   - **Name**: IncentEdge Local
   - **Host**: db
   - **Port**: 5432
   - **Username**: postgres
   - **Password**: From `.env.local`

## Troubleshooting

### Services Won't Start

1. **Check if ports are available**
   ```bash
   # Check if port 3000 is in use
   lsof -i :3000

   # Kill process if needed
   kill -9 <PID>
   ```

2. **View service logs**
   ```bash
   docker-compose logs <service-name>
   ```

3. **Restart Docker**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Database Connection Issues

1. **Verify database is running**
   ```bash
   docker-compose ps db
   ```

2. **Check database logs**
   ```bash
   docker-compose logs db
   ```

3. **Reset database**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

### App Build Failures

1. **Clear build cache**
   ```bash
   docker-compose build --no-cache app
   ```

2. **Check app logs**
   ```bash
   docker-compose logs app
   ```

### Permission Issues

```bash
# Fix volume permissions (Linux/Mac)
sudo chown -R $USER:$USER volumes/
```

## Development Workflow

1. **Make code changes** in `src/`
2. **Auto-reload** works via volume mount
3. **For dependency changes**:
   ```bash
   docker-compose restart app
   ```
4. **For config changes**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Production Notes

This Docker Compose setup is for **local development only**.

For production:
- Use `Dockerfile` for building production image
- Don't expose database ports publicly
- Use proper secrets management
- Enable SSL/TLS
- Configure proper backup strategy

See `DEPLOYMENT.md` for production deployment instructions.

## Clean Up

### Remove All Containers and Volumes
```bash
docker-compose down -v
```

### Remove Images
```bash
docker-compose down --rmi all
```

### Complete Cleanup
```bash
docker-compose down -v --rmi all
rm -rf volumes/db/data volumes/storage volumes/pgadmin
```

## Environment Variables

Key environment variables in `.env.docker`:

- `POSTGRES_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `ANON_KEY` - Public API key
- `SERVICE_ROLE_KEY` - Service role key
- `SITE_URL` - Application URL

See `.env.docker` for complete list.

---

For more information, see [DEPLOYMENT.md](../DEPLOYMENT.md)
