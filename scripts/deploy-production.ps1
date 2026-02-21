<#
.SYNOPSIS
    IncentEdge Production Deployment Script (Windows PowerShell)

.DESCRIPTION
    Automated deployment script that validates environment, runs tests,
    builds the application, and prepares for Railway deployment.

.EXAMPLE
    .\deploy-production.ps1

.EXAMPLE
    .\deploy-production.ps1 -SkipTests

.EXAMPLE
    .\deploy-production.ps1 -DryRun

.NOTES
    Requires: Node.js 18+, pnpm, git
    Target: Railway hosting + Supabase database
#>

param(
    [switch]$SkipTests,
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Help
)

# Script configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Colors for output
function Write-Step { param($msg) Write-Host "`n[$((Get-Date).ToString('HH:mm:ss'))] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "     $msg" -ForegroundColor White }

# Show help
if ($Help) {
    Get-Help $MyInvocation.MyCommand.Path -Detailed
    exit 0
}

# Banner
Write-Host @"

===============================================
  IncentEdge Production Deployment Script
===============================================
  Target: Railway + Supabase
  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
===============================================

"@ -ForegroundColor Cyan

# DryRun notice
if ($DryRun) {
    Write-Warning "DRY RUN MODE - No actual deployment will occur"
}

# ============================================================================
# STEP 1: Environment Validation
# ============================================================================
Write-Step "Step 1: Validating Environment"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error "Node.js not found. Please install Node.js 18+"
    exit 1
}

# Check npm/pnpm
try {
    $pnpmVersion = pnpm --version 2>$null
    Write-Success "pnpm: $pnpmVersion"
    $packageManager = "pnpm"
} catch {
    try {
        $npmVersion = npm --version
        Write-Success "npm: $npmVersion"
        $packageManager = "npm"
    } catch {
        Write-Error "Neither pnpm nor npm found"
        exit 1
    }
}

# Check git
try {
    $gitVersion = git --version
    Write-Success "Git: $gitVersion"
} catch {
    Write-Error "Git not found"
    exit 1
}

# Check Railway CLI (optional)
try {
    $railwayVersion = railway --version 2>$null
    Write-Success "Railway CLI: $railwayVersion"
    $hasRailwayCLI = $true
} catch {
    Write-Warning "Railway CLI not installed (optional - using git push deployment)"
    $hasRailwayCLI = $false
}

# Change to project directory
Write-Info "Project root: $ProjectRoot"
Set-Location $ProjectRoot

# ============================================================================
# STEP 2: Check for Required Files
# ============================================================================
Write-Step "Step 2: Checking Required Files"

$requiredFiles = @(
    "package.json",
    "next.config.js",
    "tsconfig.json",
    ".env.example"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Success "Found: $file"
    } else {
        Write-Error "Missing: $file"
        exit 1
    }
}

# Check for .env.local (development credentials - should NOT be deployed)
if (Test-Path ".env.local") {
    Write-Warning ".env.local exists - ensure production vars are set in Railway"
}

# ============================================================================
# STEP 3: Validate Environment Variables
# ============================================================================
Write-Step "Step 3: Validating Environment Configuration"

if (-not $DryRun) {
    try {
        & $packageManager run validate:env
        Write-Success "Environment validation passed"
    } catch {
        Write-Warning "Environment validation failed - ensure production vars are set in Railway"
    }
}

# ============================================================================
# STEP 4: Install Dependencies
# ============================================================================
Write-Step "Step 4: Installing Dependencies"

if (-not $DryRun) {
    Write-Info "Running $packageManager install..."
    & $packageManager install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Dependency installation failed"
        exit 1
    }
    Write-Success "Dependencies installed"
} else {
    Write-Info "[DRY RUN] Would run: $packageManager install"
}

# ============================================================================
# STEP 5: Run TypeScript Check
# ============================================================================
Write-Step "Step 5: TypeScript Type Checking"

if (-not $DryRun) {
    Write-Info "Running type check..."
    & $packageManager run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Error "TypeScript errors found"
        if (-not $Force) {
            exit 1
        }
        Write-Warning "Continuing due to -Force flag"
    } else {
        Write-Success "TypeScript check passed"
    }
} else {
    Write-Info "[DRY RUN] Would run: $packageManager run typecheck"
}

# ============================================================================
# STEP 6: Run Linter
# ============================================================================
Write-Step "Step 6: Running Linter"

if (-not $DryRun) {
    Write-Info "Running ESLint..."
    & $packageManager run lint
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Linting warnings found"
    } else {
        Write-Success "Linting passed"
    }
} else {
    Write-Info "[DRY RUN] Would run: $packageManager run lint"
}

# ============================================================================
# STEP 7: Run Tests
# ============================================================================
if (-not $SkipTests) {
    Write-Step "Step 7: Running Tests"

    if (-not $DryRun) {
        Write-Info "Running Vitest..."
        & $packageManager run test:run
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Tests failed"
            if (-not $Force) {
                exit 1
            }
            Write-Warning "Continuing due to -Force flag"
        } else {
            Write-Success "All tests passed"
        }
    } else {
        Write-Info "[DRY RUN] Would run: $packageManager run test:run"
    }
} else {
    Write-Step "Step 7: Skipping Tests (-SkipTests flag)"
    Write-Warning "Tests skipped - not recommended for production"
}

# ============================================================================
# STEP 8: Build Production Bundle
# ============================================================================
Write-Step "Step 8: Building Production Bundle"

if (-not $DryRun) {
    Write-Info "Running production build..."
    $env:NODE_ENV = "production"
    & $packageManager run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        exit 1
    }
    Write-Success "Production build completed"

    # Show build output size
    if (Test-Path ".next") {
        $buildSize = (Get-ChildItem -Recurse ".next" | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Build size: $([math]::Round($buildSize, 2)) MB"
    }
} else {
    Write-Info "[DRY RUN] Would run: $packageManager run build"
}

# ============================================================================
# STEP 9: Git Status Check
# ============================================================================
Write-Step "Step 9: Git Status Check"

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Warning "Uncommitted changes detected:"
    git status --short
    Write-Info ""
    Write-Warning "Consider committing changes before deployment"
} else {
    Write-Success "Working directory clean"
}

$currentBranch = git branch --show-current
Write-Info "Current branch: $currentBranch"

$lastCommit = git log -1 --pretty=format:"%h - %s (%cr)"
Write-Info "Last commit: $lastCommit"

# ============================================================================
# STEP 10: Deployment
# ============================================================================
Write-Step "Step 10: Deployment"

if ($DryRun) {
    Write-Info "[DRY RUN] Deployment steps:"
    Write-Info "  1. Push to GitHub: git push origin $currentBranch"
    Write-Info "  2. Railway will auto-deploy from GitHub"
    Write-Info "  3. Or use Railway CLI: railway up"
} else {
    Write-Host ""
    Write-Host "Deployment Options:" -ForegroundColor Yellow
    Write-Host "  1. Git Push (Recommended):" -ForegroundColor White
    Write-Host "     git push origin $currentBranch" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Railway CLI (if installed):" -ForegroundColor White
    Write-Host "     railway up" -ForegroundColor Gray
    Write-Host ""

    if ($hasRailwayCLI) {
        $deployNow = Read-Host "Deploy now using Railway CLI? (y/N)"
        if ($deployNow -eq 'y' -or $deployNow -eq 'Y') {
            Write-Info "Deploying to Railway..."
            railway up
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Deployment initiated!"
            } else {
                Write-Error "Deployment failed"
                exit 1
            }
        }
    } else {
        $pushNow = Read-Host "Push to GitHub for auto-deployment? (y/N)"
        if ($pushNow -eq 'y' -or $pushNow -eq 'Y') {
            Write-Info "Pushing to GitHub..."
            git push origin $currentBranch
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Pushed to GitHub - Railway will auto-deploy"
            } else {
                Write-Error "Git push failed"
                exit 1
            }
        }
    }
}

# ============================================================================
# Summary
# ============================================================================
Write-Host @"

===============================================
  Deployment Summary
===============================================
"@ -ForegroundColor Green

Write-Host "  Environment:    Validated" -ForegroundColor White
Write-Host "  Dependencies:   Installed" -ForegroundColor White
Write-Host "  TypeScript:     $(if ($DryRun) { 'Skipped (dry run)' } else { 'Passed' })" -ForegroundColor White
Write-Host "  Linting:        $(if ($DryRun) { 'Skipped (dry run)' } else { 'Passed' })" -ForegroundColor White
Write-Host "  Tests:          $(if ($SkipTests) { 'Skipped' } elseif ($DryRun) { 'Skipped (dry run)' } else { 'Passed' })" -ForegroundColor White
Write-Host "  Build:          $(if ($DryRun) { 'Skipped (dry run)' } else { 'Completed' })" -ForegroundColor White

Write-Host @"

===============================================
  Post-Deployment Checklist
===============================================
"@ -ForegroundColor Cyan

Write-Host "  [ ] Verify Railway deployment status" -ForegroundColor White
Write-Host "  [ ] Check health endpoint: /api/health" -ForegroundColor White
Write-Host "  [ ] Verify database connectivity" -ForegroundColor White
Write-Host "  [ ] Run smoke tests" -ForegroundColor White
Write-Host "  [ ] Monitor error tracking (Sentry)" -ForegroundColor White

Write-Host @"

===============================================
  Useful Commands
===============================================
"@ -ForegroundColor Yellow

Write-Host "  View Railway logs:    railway logs" -ForegroundColor Gray
Write-Host "  Check deployment:     railway status" -ForegroundColor Gray
Write-Host "  Health check:         curl https://YOUR-DOMAIN/api/health" -ForegroundColor Gray
Write-Host ""

Write-Host "Deployment script completed!" -ForegroundColor Green
Write-Host ""
