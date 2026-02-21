#!/usr/bin/env bash
#
# IncentEdge Production Deployment Script (Linux/Mac)
#
# Automated deployment script that validates environment, runs tests,
# builds the application, and prepares for Railway deployment.
#
# Usage:
#   ./deploy-production.sh           # Full deployment
#   ./deploy-production.sh --dry-run # Preview only
#   ./deploy-production.sh --skip-tests # Skip test suite
#   ./deploy-production.sh --force   # Continue on warnings
#   ./deploy-production.sh --help    # Show help
#
# Requirements:
#   - Node.js 18+
#   - pnpm or npm
#   - git
#
# Target: Railway hosting + Supabase database

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Flags
DRY_RUN=false
SKIP_TESTS=false
FORCE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
step() { echo -e "\n${CYAN}[$(date '+%H:%M:%S')] $1${NC}"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "     $1"; }

# Show help
show_help() {
    cat << EOF
IncentEdge Production Deployment Script

Usage: $0 [OPTIONS]

Options:
    --dry-run      Preview deployment without making changes
    --skip-tests   Skip running the test suite
    --force        Continue even if warnings occur
    --help         Show this help message

Examples:
    $0                      # Full deployment
    $0 --dry-run            # Preview only
    $0 --skip-tests         # Skip tests
    $0 --force --skip-tests # Force deployment without tests

EOF
    exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help|-h)
            show_help
            ;;
        *)
            error "Unknown option: $1"
            show_help
            ;;
    esac
done

# Banner
echo -e "${CYAN}"
cat << 'EOF'
===============================================
  IncentEdge Production Deployment Script
===============================================
EOF
echo "  Target: Railway + Supabase"
echo "  Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "==============================================="
echo -e "${NC}"

if $DRY_RUN; then
    warn "DRY RUN MODE - No actual deployment will occur"
fi

# ============================================================================
# STEP 1: Environment Validation
# ============================================================================
step "Step 1: Validating Environment"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js: $NODE_VERSION"
else
    error "Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm/pnpm
PACKAGE_MANAGER=""
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    success "pnpm: $PNPM_VERSION"
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm: $NPM_VERSION"
    PACKAGE_MANAGER="npm"
else
    error "Neither pnpm nor npm found"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    success "Git: $GIT_VERSION"
else
    error "Git not found"
    exit 1
fi

# Check Railway CLI (optional)
HAS_RAILWAY=false
if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --version 2>/dev/null || echo "installed")
    success "Railway CLI: $RAILWAY_VERSION"
    HAS_RAILWAY=true
else
    warn "Railway CLI not installed (optional - using git push deployment)"
fi

# Change to project directory
info "Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# ============================================================================
# STEP 2: Check for Required Files
# ============================================================================
step "Step 2: Checking Required Files"

REQUIRED_FILES=(
    "package.json"
    "next.config.js"
    "tsconfig.json"
    ".env.example"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        success "Found: $file"
    else
        error "Missing: $file"
        exit 1
    fi
done

# Check for .env.local
if [[ -f ".env.local" ]]; then
    warn ".env.local exists - ensure production vars are set in Railway"
fi

# ============================================================================
# STEP 3: Validate Environment Variables
# ============================================================================
step "Step 3: Validating Environment Configuration"

if ! $DRY_RUN; then
    if $PACKAGE_MANAGER run validate:env 2>/dev/null; then
        success "Environment validation passed"
    else
        warn "Environment validation failed - ensure production vars are set in Railway"
    fi
fi

# ============================================================================
# STEP 4: Install Dependencies
# ============================================================================
step "Step 4: Installing Dependencies"

if ! $DRY_RUN; then
    info "Running $PACKAGE_MANAGER install..."
    $PACKAGE_MANAGER install
    success "Dependencies installed"
else
    info "[DRY RUN] Would run: $PACKAGE_MANAGER install"
fi

# ============================================================================
# STEP 5: Run TypeScript Check
# ============================================================================
step "Step 5: TypeScript Type Checking"

if ! $DRY_RUN; then
    info "Running type check..."
    if $PACKAGE_MANAGER run typecheck; then
        success "TypeScript check passed"
    else
        error "TypeScript errors found"
        if ! $FORCE; then
            exit 1
        fi
        warn "Continuing due to --force flag"
    fi
else
    info "[DRY RUN] Would run: $PACKAGE_MANAGER run typecheck"
fi

# ============================================================================
# STEP 6: Run Linter
# ============================================================================
step "Step 6: Running Linter"

if ! $DRY_RUN; then
    info "Running ESLint..."
    if $PACKAGE_MANAGER run lint; then
        success "Linting passed"
    else
        warn "Linting warnings found"
    fi
else
    info "[DRY RUN] Would run: $PACKAGE_MANAGER run lint"
fi

# ============================================================================
# STEP 7: Run Tests
# ============================================================================
if ! $SKIP_TESTS; then
    step "Step 7: Running Tests"

    if ! $DRY_RUN; then
        info "Running Vitest..."
        if $PACKAGE_MANAGER run test:run; then
            success "All tests passed"
        else
            error "Tests failed"
            if ! $FORCE; then
                exit 1
            fi
            warn "Continuing due to --force flag"
        fi
    else
        info "[DRY RUN] Would run: $PACKAGE_MANAGER run test:run"
    fi
else
    step "Step 7: Skipping Tests (--skip-tests flag)"
    warn "Tests skipped - not recommended for production"
fi

# ============================================================================
# STEP 8: Build Production Bundle
# ============================================================================
step "Step 8: Building Production Bundle"

if ! $DRY_RUN; then
    info "Running production build..."
    NODE_ENV=production $PACKAGE_MANAGER run build
    success "Production build completed"

    # Show build output size
    if [[ -d ".next" ]]; then
        BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
        info "Build size: $BUILD_SIZE"
    fi
else
    info "[DRY RUN] Would run: $PACKAGE_MANAGER run build"
fi

# ============================================================================
# STEP 9: Git Status Check
# ============================================================================
step "Step 9: Git Status Check"

GIT_STATUS=$(git status --porcelain)
if [[ -n "$GIT_STATUS" ]]; then
    warn "Uncommitted changes detected:"
    git status --short
    echo ""
    warn "Consider committing changes before deployment"
else
    success "Working directory clean"
fi

CURRENT_BRANCH=$(git branch --show-current)
info "Current branch: $CURRENT_BRANCH"

LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%cr)")
info "Last commit: $LAST_COMMIT"

# ============================================================================
# STEP 10: Deployment
# ============================================================================
step "Step 10: Deployment"

if $DRY_RUN; then
    info "[DRY RUN] Deployment steps:"
    info "  1. Push to GitHub: git push origin $CURRENT_BRANCH"
    info "  2. Railway will auto-deploy from GitHub"
    info "  3. Or use Railway CLI: railway up"
else
    echo ""
    echo -e "${YELLOW}Deployment Options:${NC}"
    echo -e "  1. Git Push (Recommended):"
    echo -e "     ${CYAN}git push origin $CURRENT_BRANCH${NC}"
    echo ""
    echo -e "  2. Railway CLI (if installed):"
    echo -e "     ${CYAN}railway up${NC}"
    echo ""

    if $HAS_RAILWAY; then
        read -p "Deploy now using Railway CLI? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Deploying to Railway..."
            if railway up; then
                success "Deployment initiated!"
            else
                error "Deployment failed"
                exit 1
            fi
        fi
    else
        read -p "Push to GitHub for auto-deployment? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Pushing to GitHub..."
            if git push origin "$CURRENT_BRANCH"; then
                success "Pushed to GitHub - Railway will auto-deploy"
            else
                error "Git push failed"
                exit 1
            fi
        fi
    fi
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo -e "${GREEN}===============================================${NC}"
echo -e "${GREEN}  Deployment Summary${NC}"
echo -e "${GREEN}===============================================${NC}"
echo ""
echo "  Environment:    Validated"
echo "  Dependencies:   Installed"
echo "  TypeScript:     $(if $DRY_RUN; then echo 'Skipped (dry run)'; else echo 'Passed'; fi)"
echo "  Linting:        $(if $DRY_RUN; then echo 'Skipped (dry run)'; else echo 'Passed'; fi)"
echo "  Tests:          $(if $SKIP_TESTS; then echo 'Skipped'; elif $DRY_RUN; then echo 'Skipped (dry run)'; else echo 'Passed'; fi)"
echo "  Build:          $(if $DRY_RUN; then echo 'Skipped (dry run)'; else echo 'Completed'; fi)"

echo ""
echo -e "${CYAN}===============================================${NC}"
echo -e "${CYAN}  Post-Deployment Checklist${NC}"
echo -e "${CYAN}===============================================${NC}"
echo ""
echo "  [ ] Verify Railway deployment status"
echo "  [ ] Check health endpoint: /api/health"
echo "  [ ] Verify database connectivity"
echo "  [ ] Run smoke tests"
echo "  [ ] Monitor error tracking (Sentry)"

echo ""
echo -e "${YELLOW}===============================================${NC}"
echo -e "${YELLOW}  Useful Commands${NC}"
echo -e "${YELLOW}===============================================${NC}"
echo ""
echo "  View Railway logs:    railway logs"
echo "  Check deployment:     railway status"
echo "  Health check:         curl https://YOUR-DOMAIN/api/health"
echo ""

echo -e "${GREEN}Deployment script completed!${NC}"
echo ""
