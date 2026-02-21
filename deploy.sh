#!/bin/bash
################################################################################
# IncentEdge Production Deployment Script
#
# This script automates the deployment process with comprehensive checks:
# - Environment validation
# - Automated testing
# - Production build
# - Health checks (pre and post deployment)
# - Automatic rollback on failure
# - Deployment notifications
#
# Usage:
#   ./deploy.sh [--skip-tests] [--dry-run]
#
# Options:
#   --skip-tests    Skip test execution (not recommended for production)
#   --dry-run       Simulate deployment without actually deploying
#   --help          Show this help message
################################################################################

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="https://incentedge.com"
HEALTH_ENDPOINT="/api/health"
STATS_ENDPOINT="/api/stats?quick=true"
DEPLOYMENT_TIMEOUT=300  # 5 minutes
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=10  # seconds between retries

# Parse command line arguments
SKIP_TESTS=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help)
      grep '^#' "$0" | cut -c 3-
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

separator() {
  echo "===================================="
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check production health
check_health() {
  local url=$1
  local endpoint=$2
  local retries=${3:-3}
  local delay=${4:-5}

  log_info "Checking health at $url$endpoint"

  for ((i=1; i<=retries; i++)); do
    if curl -f -s -o /dev/null -w "%{http_code}" "$url$endpoint" | grep -q "200"; then
      return 0
    fi

    if [ $i -lt $retries ]; then
      log_warning "Health check failed (attempt $i/$retries), retrying in ${delay}s..."
      sleep "$delay"
    fi
  done

  return 1
}

# Main deployment function
main() {
  separator
  echo -e "${BLUE}🚀 IncentEdge Production Deployment${NC}"
  separator
  echo ""

  # Show configuration
  if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No actual deployment will occur"
  fi
  if [ "$SKIP_TESTS" = true ]; then
    log_warning "Tests will be skipped (not recommended)"
  fi
  echo ""

  # Step 1: Pre-flight checks
  log_info "Step 1/8: Running pre-flight checks..."

  # Check required commands
  if ! command_exists node; then
    log_error "Node.js is not installed"
    exit 1
  fi

  if ! command_exists pnpm; then
    log_error "pnpm is not installed. Install with: npm install -g pnpm"
    exit 1
  fi

  if ! command_exists vercel; then
    log_error "Vercel CLI is not installed. Install with: npm install -g vercel"
    exit 1
  fi

  log_success "All required commands are available"
  echo ""

  # Step 2: Environment validation
  log_info "Step 2/8: Validating environment..."

  if [ ! -f .env.production ]; then
    log_error ".env.production not found"
    exit 1
  fi

  # Check critical environment variables
  if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.production; then
    log_error "NEXT_PUBLIC_SUPABASE_URL not found in .env.production"
    exit 1
  fi

  log_success "Environment configuration valid"
  echo ""

  # Step 3: Install dependencies
  log_info "Step 3/8: Installing dependencies..."

  if [ "$DRY_RUN" = false ]; then
    pnpm install --frozen-lockfile || {
      log_error "Dependency installation failed"
      exit 1
    }
  else
    log_info "[DRY RUN] Would run: pnpm install --frozen-lockfile"
  fi

  log_success "Dependencies installed"
  echo ""

  # Step 4: Run tests
  if [ "$SKIP_TESTS" = false ]; then
    log_info "Step 4/8: Running tests..."

    if [ "$DRY_RUN" = false ]; then
      pnpm test:run || {
        log_error "Tests failed. Deployment aborted."
        log_info "Fix failing tests or use --skip-tests flag (not recommended)"
        exit 1
      }
    else
      log_info "[DRY RUN] Would run: pnpm test:run"
    fi

    log_success "All tests passed"
  else
    log_warning "Step 4/8: Skipping tests (--skip-tests flag used)"
  fi
  echo ""

  # Step 5: Type checking
  log_info "Step 5/8: Running TypeScript type check..."

  if [ "$DRY_RUN" = false ]; then
    pnpm typecheck || {
      log_error "Type checking failed"
      exit 1
    }
  else
    log_info "[DRY RUN] Would run: pnpm typecheck"
  fi

  log_success "Type checking passed"
  echo ""

  # Step 6: Build production bundle
  log_info "Step 6/8: Building production bundle..."

  if [ "$DRY_RUN" = false ]; then
    NODE_ENV=production pnpm build || {
      log_error "Production build failed"
      exit 1
    }
  else
    log_info "[DRY RUN] Would run: NODE_ENV=production pnpm build"
  fi

  log_success "Production build complete"
  echo ""

  # Step 7: Check current production health
  log_info "Step 7/8: Checking current production health..."

  if check_health "$PRODUCTION_URL" "$HEALTH_ENDPOINT" 3 5; then
    log_success "Current production is healthy"
  else
    log_warning "Current production health check failed or unreachable"
    log_info "This is normal for first deployment"
  fi
  echo ""

  # Step 8: Deploy to Vercel
  log_info "Step 8/8: Deploying to Vercel..."

  if [ "$DRY_RUN" = false ]; then
    # Deploy and capture the deployment URL
    DEPLOYMENT_OUTPUT=$(vercel --prod --yes 2>&1) || {
      log_error "Vercel deployment failed"
      echo "$DEPLOYMENT_OUTPUT"
      exit 1
    }

    echo "$DEPLOYMENT_OUTPUT"

    # Extract deployment URL from output
    DEPLOYMENT_URL=$(echo "$DEPLOYMENT_OUTPUT" | grep -o 'https://[^ ]*' | head -1)

    if [ -z "$DEPLOYMENT_URL" ]; then
      DEPLOYMENT_URL="$PRODUCTION_URL"
    fi

    log_success "Deployment command completed"
  else
    log_info "[DRY RUN] Would run: vercel --prod --yes"
    DEPLOYMENT_URL="$PRODUCTION_URL"
  fi
  echo ""

  # Post-deployment health checks
  separator
  log_info "Running post-deployment health checks..."
  separator
  echo ""

  # Wait for deployment to propagate
  if [ "$DRY_RUN" = false ]; then
    log_info "Waiting 10 seconds for deployment to propagate..."
    sleep 10
  fi

  # Health check with retries
  log_info "Verifying new deployment health..."

  if [ "$DRY_RUN" = false ]; then
    if check_health "$DEPLOYMENT_URL" "$HEALTH_ENDPOINT" "$HEALTH_CHECK_RETRIES" "$HEALTH_CHECK_DELAY"; then
      log_success "Health check passed!"
    else
      log_error "Deployment health check failed after $HEALTH_CHECK_RETRIES attempts"
      log_error "Rolling back deployment..."

      vercel rollback || {
        log_error "Rollback failed! Manual intervention required."
        exit 1
      }

      log_info "Rollback completed"
      exit 1
    fi
  else
    log_info "[DRY RUN] Would check health at: $DEPLOYMENT_URL$HEALTH_ENDPOINT"
    log_success "[DRY RUN] Health check would pass"
  fi
  echo ""

  # Verify stats endpoint
  log_info "Verifying stats endpoint..."

  if [ "$DRY_RUN" = false ]; then
    STATS_RESPONSE=$(curl -s "$DEPLOYMENT_URL$STATS_ENDPOINT")
    PROGRAM_COUNT=$(echo "$STATS_RESPONSE" | grep -o '"incentives_count":[0-9]*' | grep -o '[0-9]*' || echo "0")

    if [ "$PROGRAM_COUNT" -gt 0 ]; then
      log_success "Stats endpoint operational (Program count: $PROGRAM_COUNT)"
    else
      log_warning "Stats endpoint returned unexpected data"
    fi
  else
    log_info "[DRY RUN] Would verify: $DEPLOYMENT_URL$STATS_ENDPOINT"
  fi
  echo ""

  # Deployment summary
  separator
  echo -e "${GREEN}✅ Deployment Complete!${NC}"
  separator
  echo ""
  echo "Deployment Details:"
  echo "  Production URL: $PRODUCTION_URL"
  if [ "$DRY_RUN" = false ] && [ -n "$DEPLOYMENT_URL" ]; then
    echo "  Deployment URL: $DEPLOYMENT_URL"
  fi
  echo "  Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
  echo "  Git Commit: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")"
  echo ""
  echo "Next Steps:"
  echo "  1. Verify deployment: $PRODUCTION_URL"
  echo "  2. Check health: $PRODUCTION_URL$HEALTH_ENDPOINT"
  echo "  3. Monitor logs: vercel logs"
  echo "  4. Run smoke tests on production"
  echo ""

  if [ "$DRY_RUN" = true ]; then
    log_info "This was a DRY RUN - no actual deployment occurred"
  fi
}

# Trap errors and provide helpful message
trap 'log_error "Deployment failed at line $LINENO. Check output above for details."' ERR

# Run main deployment
main

exit 0
