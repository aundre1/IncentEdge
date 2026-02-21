#!/bin/bash
#
# IncentEdge Deployment Script
#
# Usage:
#   ./scripts/deploy.sh [environment]
#   ./scripts/deploy.sh production
#   ./scripts/deploy.sh staging
#
# Environment variables required:
#   - DEPLOYMENT_ENV: production, staging, or development
#   - NEXT_PUBLIC_SUPABASE_URL
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - SUPABASE_SERVICE_ROLE_KEY
#   - API_SIGNING_SECRET
#   - SESSION_SECRET
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV="${1:-staging}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${PROJECT_ROOT}/.backups"
LOG_FILE="${PROJECT_ROOT}/logs/deploy_${TIMESTAMP}.log"
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_DELAY=10

# Create necessary directories
mkdir -p "${BACKUP_DIR}" "$(dirname "${LOG_FILE}")"

#######################################
# Logging Functions
#######################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "${LOG_FILE}"
}

#######################################
# Validation Functions
#######################################

validate_environment() {
    log "Validating environment variables..."

    # Required environment variables
    local required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "NEXT_PUBLIC_APP_URL"
    )

    # Additional required for production
    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        required_vars+=(
            "SUPABASE_SERVICE_ROLE_KEY"
            "API_SIGNING_SECRET"
            "SESSION_SECRET"
        )
    fi

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done

    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            log_error "  - $var"
        done
        return 1
    fi

    log_success "Environment validation passed"
    return 0
}

validate_node_version() {
    log "Validating Node.js version..."

    local required_major=18
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

    if [[ ${node_version} -lt ${required_major} ]]; then
        log_error "Node.js ${required_major}+ required, found ${node_version}"
        return 1
    fi

    log_success "Node.js version OK (v${node_version})"
    return 0
}

validate_dependencies() {
    log "Validating dependencies..."

    # Check if package-lock.json or pnpm-lock.yaml exists
    if [[ ! -f "${PROJECT_ROOT}/package-lock.json" ]] && [[ ! -f "${PROJECT_ROOT}/pnpm-lock.yaml" ]]; then
        log_error "No lock file found. Run npm install or pnpm install first."
        return 1
    fi

    log_success "Dependencies validation passed"
    return 0
}

run_env_validation() {
    log "Running environment variable validation script..."

    if ! npm run validate:env > /dev/null 2>&1; then
        log_error "Environment validation script failed"
        return 1
    fi

    log_success "Environment validation script passed"
    return 0
}

#######################################
# Build Functions
#######################################

install_dependencies() {
    log "Installing dependencies..."

    cd "${PROJECT_ROOT}"

    # Use pnpm if available, otherwise npm
    if command -v pnpm &> /dev/null; then
        pnpm install --frozen-lockfile
    else
        npm ci
    fi

    log_success "Dependencies installed"
}

run_tests() {
    log "Running tests..."

    cd "${PROJECT_ROOT}"

    if ! npm run test:run; then
        log_error "Tests failed"
        return 1
    fi

    log_success "All tests passed"
    return 0
}

run_type_check() {
    log "Running TypeScript type check..."

    cd "${PROJECT_ROOT}"

    if ! npm run typecheck; then
        log_error "Type check failed"
        return 1
    fi

    log_success "Type check passed"
    return 0
}

run_lint() {
    log "Running linter..."

    cd "${PROJECT_ROOT}"

    if ! npm run lint; then
        log_warning "Linting issues found (non-blocking)"
    else
        log_success "Linting passed"
    fi

    return 0
}

build_application() {
    log "Building application for ${DEPLOYMENT_ENV}..."

    cd "${PROJECT_ROOT}"

    export NODE_ENV="${DEPLOYMENT_ENV}"

    if ! npm run build:prod; then
        log_error "Build failed"
        return 1
    fi

    log_success "Build completed successfully"
    return 0
}

#######################################
# Backup Functions
#######################################

create_backup() {
    log "Creating backup..."

    local backup_name="backup_${DEPLOYMENT_ENV}_${TIMESTAMP}.tar.gz"
    local backup_path="${BACKUP_DIR}/${backup_name}"

    # Backup current .next build and environment
    tar -czf "${backup_path}" \
        -C "${PROJECT_ROOT}" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs' \
        --exclude='.backups' \
        .next package.json package-lock.json 2>/dev/null || true

    if [[ -f "${backup_path}" ]]; then
        log_success "Backup created: ${backup_name}"
        echo "${backup_path}" > "${BACKUP_DIR}/latest_backup.txt"
    else
        log_warning "Backup creation skipped (no previous build)"
    fi
}

rollback() {
    log_warning "Initiating rollback..."

    local latest_backup=$(cat "${BACKUP_DIR}/latest_backup.txt" 2>/dev/null || echo "")

    if [[ -z "${latest_backup}" ]] || [[ ! -f "${latest_backup}" ]]; then
        log_error "No backup found for rollback"
        return 1
    fi

    log "Restoring from backup: ${latest_backup}"

    # Extract backup
    tar -xzf "${latest_backup}" -C "${PROJECT_ROOT}"

    log_success "Rollback completed"
    return 0
}

#######################################
# Health Check Functions
#######################################

health_check() {
    local url="${1:-http://localhost:3000}"
    local retries="${2:-$HEALTH_CHECK_RETRIES}"
    local delay="${3:-$HEALTH_CHECK_DELAY}"

    log "Running health check on ${url}..."

    for i in $(seq 1 ${retries}); do
        log "Health check attempt ${i}/${retries}..."

        # Check if health endpoint exists
        if curl -f -s "${url}/api/status" > /dev/null 2>&1; then
            log_success "Health check passed"
            return 0
        fi

        if [[ ${i} -lt ${retries} ]]; then
            log "Waiting ${delay}s before retry..."
            sleep ${delay}
        fi
    done

    log_error "Health check failed after ${retries} attempts"
    return 1
}

run_smoke_tests() {
    local url="${1:-http://localhost:3000}"

    log "Running smoke tests..."

    # Test critical endpoints
    local endpoints=(
        "/api/status"
        "/api/stats"
    )

    for endpoint in "${endpoints[@]}"; do
        if ! curl -f -s "${url}${endpoint}" > /dev/null 2>&1; then
            log_error "Smoke test failed for ${endpoint}"
            return 1
        fi
        log_success "Smoke test passed: ${endpoint}"
    done

    log_success "All smoke tests passed"
    return 0
}

#######################################
# Deployment Functions
#######################################

deploy_vercel() {
    log "Deploying to Vercel (${DEPLOYMENT_ENV})..."

    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI not installed. Run: npm i -g vercel"
        return 1
    fi

    cd "${PROJECT_ROOT}"

    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        vercel --prod
    else
        vercel
    fi

    log_success "Vercel deployment completed"
}

deploy_docker() {
    log "Deploying with Docker..."

    cd "${PROJECT_ROOT}"

    # Build Docker image
    docker build -t incentedge:${DEPLOYMENT_ENV} .

    # Stop existing container
    docker stop incentedge-${DEPLOYMENT_ENV} 2>/dev/null || true
    docker rm incentedge-${DEPLOYMENT_ENV} 2>/dev/null || true

    # Run new container
    docker run -d \
        --name incentedge-${DEPLOYMENT_ENV} \
        -p 3000:3000 \
        --env-file .env.${DEPLOYMENT_ENV} \
        incentedge:${DEPLOYMENT_ENV}

    log_success "Docker deployment completed"
}

deploy_standalone() {
    log "Starting standalone server..."

    cd "${PROJECT_ROOT}"

    # Kill existing process if running
    if [[ -f ".next/server.pid" ]]; then
        local pid=$(cat .next/server.pid)
        if ps -p ${pid} > /dev/null 2>&1; then
            log "Stopping existing server (PID: ${pid})..."
            kill ${pid}
            sleep 2
        fi
    fi

    # Start new process
    NODE_ENV="${DEPLOYMENT_ENV}" npm run start:prod &
    echo $! > .next/server.pid

    log_success "Standalone server started"
}

#######################################
# Main Deployment Flow
#######################################

main() {
    log "========================================="
    log "IncentEdge Deployment"
    log "Environment: ${DEPLOYMENT_ENV}"
    log "Timestamp: ${TIMESTAMP}"
    log "========================================="

    # Pre-deployment validation
    validate_node_version || exit 1
    validate_environment || exit 1
    validate_dependencies || exit 1
    run_env_validation || exit 1

    # Create backup before build
    create_backup

    # Build process
    install_dependencies || exit 1
    run_type_check || exit 1
    run_lint

    # Only run tests in non-production or if explicitly enabled
    if [[ "${DEPLOYMENT_ENV}" != "production" ]] || [[ "${RUN_TESTS:-true}" == "true" ]]; then
        run_tests || exit 1
    fi

    build_application || {
        log_error "Build failed, initiating rollback..."
        rollback
        exit 1
    }

    # Deployment method (detect from environment)
    if [[ -n "${VERCEL:-}" ]] || [[ -f "vercel.json" ]]; then
        deploy_vercel || {
            log_error "Deployment failed, initiating rollback..."
            rollback
            exit 1
        }
    elif [[ -f "Dockerfile" ]] && command -v docker &> /dev/null; then
        deploy_docker || {
            log_error "Deployment failed, initiating rollback..."
            rollback
            exit 1
        }
        # Health check for Docker deployment
        sleep 5
        health_check "http://localhost:3000" || {
            log_error "Health check failed, initiating rollback..."
            docker stop incentedge-${DEPLOYMENT_ENV}
            rollback
            exit 1
        }
    else
        deploy_standalone || {
            log_error "Deployment failed, initiating rollback..."
            rollback
            exit 1
        }
        # Health check for standalone deployment
        sleep 5
        health_check "http://localhost:3000" || {
            log_error "Health check failed, initiating rollback..."
            rollback
            exit 1
        }
    fi

    # Post-deployment verification
    if [[ -f "scripts/health-check.sh" ]]; then
        log "Running comprehensive health check..."
        bash scripts/health-check.sh || {
            log_error "Health check failed"
            exit 1
        }
    fi

    log_success "========================================="
    log_success "Deployment completed successfully!"
    log_success "Environment: ${DEPLOYMENT_ENV}"
    log_success "Timestamp: ${TIMESTAMP}"
    log_success "Log file: ${LOG_FILE}"
    log_success "========================================="
}

# Run main deployment
main "$@"
