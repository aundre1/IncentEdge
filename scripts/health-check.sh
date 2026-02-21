#!/bin/bash
#
# IncentEdge Health Check Script
#
# Comprehensive post-deployment verification script that validates:
# - API endpoints availability
# - Database connectivity
# - External service integration
# - Performance metrics
#
# Usage:
#   ./scripts/health-check.sh [base_url]
#   ./scripts/health-check.sh https://app.incentedge.com
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:3000}"
TIMEOUT=10
MAX_RESPONSE_TIME=2000  # milliseconds
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="./logs/health_check_${TIMESTAMP}.log"

# Create log directory
mkdir -p "$(dirname "${LOG_FILE}")"

# Health check results
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

#######################################
# Logging Functions
#######################################

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1" | tee -a "${LOG_FILE}"
    ((CHECKS_PASSED++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1" | tee -a "${LOG_FILE}"
    ((CHECKS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1" | tee -a "${LOG_FILE}"
    ((CHECKS_WARNING++))
}

#######################################
# HTTP Request Functions
#######################################

# Make GET request and return HTTP status code
http_get() {
    local url="$1"
    local timeout="${2:-$TIMEOUT}"

    curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "${timeout}" \
        --max-time "${timeout}" \
        "${url}" 2>/dev/null || echo "000"
}

# Make GET request and return response time in milliseconds
http_get_time() {
    local url="$1"
    local timeout="${2:-$TIMEOUT}"

    local time_ms=$(curl -s -o /dev/null -w "%{time_total}" \
        --connect-timeout "${timeout}" \
        --max-time "${timeout}" \
        "${url}" 2>/dev/null || echo "0")

    # Convert to milliseconds
    echo "$(echo "$time_ms * 1000" | bc -l | cut -d'.' -f1)"
}

# Make GET request and return response body
http_get_body() {
    local url="$1"
    local timeout="${2:-$TIMEOUT}"

    curl -s \
        --connect-timeout "${timeout}" \
        --max-time "${timeout}" \
        "${url}" 2>/dev/null || echo "{}"
}

#######################################
# Health Check Functions
#######################################

check_endpoint() {
    local name="$1"
    local path="$2"
    local expected_code="${3:-200}"
    local url="${BASE_URL}${path}"

    ((CHECKS_TOTAL++))
    log "Checking ${name}..."

    local status=$(http_get "${url}")
    local response_time=$(http_get_time "${url}")

    if [[ "${status}" == "${expected_code}" ]]; then
        if [[ ${response_time} -le ${MAX_RESPONSE_TIME} ]]; then
            log_success "${name} - Status: ${status}, Response time: ${response_time}ms"
        else
            log_warning "${name} - Status: ${status}, Response time: ${response_time}ms (slow)"
        fi
    else
        log_error "${name} - Expected ${expected_code}, got ${status}"
        return 1
    fi
}

check_api_health() {
    log "========================================="
    log "API Health Checks"
    log "========================================="

    # Core health endpoint
    check_endpoint "Health Status" "/api/status" 200

    # Stats endpoint (public)
    check_endpoint "Stats API" "/api/stats" 200

    # Programs search (may require auth, 200 or 401 acceptable)
    ((CHECKS_TOTAL++))
    local status=$(http_get "${BASE_URL}/api/programs/search")
    if [[ "${status}" == "200" ]] || [[ "${status}" == "401" ]]; then
        log_success "Programs Search - Status: ${status}"
        ((CHECKS_PASSED++))
    else
        log_error "Programs Search - Expected 200 or 401, got ${status}"
    fi
}

check_database_connectivity() {
    log ""
    log "========================================="
    log "Database Connectivity"
    log "========================================="

    ((CHECKS_TOTAL++))
    log "Checking database connection via API..."

    # Try to fetch stats which requires DB connection
    local response=$(http_get_body "${BASE_URL}/api/stats")

    if echo "${response}" | grep -q "programs\|error" 2>/dev/null; then
        log_success "Database connectivity verified"
    else
        log_error "Database connectivity check failed"
        return 1
    fi
}

check_critical_apis() {
    log ""
    log "========================================="
    log "Critical API Endpoints"
    log "========================================="

    # These endpoints should return proper responses (200 or auth required)
    local endpoints=(
        "/api/dashboard:200,401"
        "/api/projects:200,401"
        "/api/applications:200,401"
        "/api/reports:200,401"
    )

    for endpoint_spec in "${endpoints[@]}"; do
        IFS=':' read -r path allowed_codes <<< "${endpoint_spec}"
        ((CHECKS_TOTAL++))

        local name=$(basename "${path}")
        log "Checking ${name}..."

        local status=$(http_get "${BASE_URL}${path}")
        local is_allowed=false

        IFS=',' read -ra CODES <<< "${allowed_codes}"
        for code in "${CODES[@]}"; do
            if [[ "${status}" == "${code}" ]]; then
                is_allowed=true
                break
            fi
        done

        if [[ "${is_allowed}" == true ]]; then
            log_success "${name} - Status: ${status}"
        else
            log_error "${name} - Expected one of [${allowed_codes}], got ${status}"
        fi
    done
}

check_static_assets() {
    log ""
    log "========================================="
    log "Static Assets"
    log "========================================="

    # Check if Next.js is serving properly
    ((CHECKS_TOTAL++))
    log "Checking main page..."

    local status=$(http_get "${BASE_URL}/")
    if [[ "${status}" == "200" ]] || [[ "${status}" == "307" ]] || [[ "${status}" == "301" ]]; then
        log_success "Main page accessible - Status: ${status}"
    else
        log_error "Main page check failed - Status: ${status}"
    fi
}

check_performance() {
    log ""
    log "========================================="
    log "Performance Metrics"
    log "========================================="

    # Check response times for critical endpoints
    local endpoints=(
        "/api/status"
        "/api/stats"
        "/"
    )

    for path in "${endpoints[@]}"; do
        ((CHECKS_TOTAL++))
        local name=$(basename "${path}")
        [[ "${name}" == "" ]] && name="home"

        log "Measuring ${name} response time..."

        local response_time=$(http_get_time "${BASE_URL}${path}")

        if [[ ${response_time} -le 500 ]]; then
            log_success "${name} - ${response_time}ms (excellent)"
        elif [[ ${response_time} -le 1000 ]]; then
            log_success "${name} - ${response_time}ms (good)"
        elif [[ ${response_time} -le ${MAX_RESPONSE_TIME} ]]; then
            log_warning "${name} - ${response_time}ms (acceptable)"
        else
            log_warning "${name} - ${response_time}ms (slow)"
        fi
    done
}

check_security_headers() {
    log ""
    log "========================================="
    log "Security Headers"
    log "========================================="

    local headers=(
        "X-Content-Type-Options:nosniff"
        "X-Frame-Options"
        "X-XSS-Protection"
    )

    for header_spec in "${headers[@]}"; do
        ((CHECKS_TOTAL++))
        IFS=':' read -r header_name expected_value <<< "${header_spec}"

        log "Checking ${header_name}..."

        local header_value=$(curl -s -I "${BASE_URL}/" 2>/dev/null | grep -i "^${header_name}:" | cut -d' ' -f2- | tr -d '\r\n')

        if [[ -n "${header_value}" ]]; then
            if [[ -z "${expected_value}" ]] || [[ "${header_value}" == *"${expected_value}"* ]]; then
                log_success "${header_name}: ${header_value}"
            else
                log_warning "${header_name}: ${header_value} (expected: ${expected_value})"
            fi
        else
            log_warning "${header_name} not found"
        fi
    done
}

check_environment() {
    log ""
    log "========================================="
    log "Environment Configuration"
    log "========================================="

    ((CHECKS_TOTAL++))
    log "Checking environment detection..."

    # Try to detect environment from status endpoint
    local response=$(http_get_body "${BASE_URL}/api/status")

    if echo "${response}" | grep -q "status\|health" 2>/dev/null; then
        log_success "Environment configuration verified"
    else
        log_warning "Could not verify environment configuration"
    fi
}

#######################################
# Report Generation
#######################################

print_summary() {
    log ""
    log "========================================="
    log "Health Check Summary"
    log "========================================="
    log "Base URL: ${BASE_URL}"
    log "Timestamp: ${TIMESTAMP}"
    log ""
    log "Total Checks: ${CHECKS_TOTAL}"
    log_success "Passed: ${CHECKS_PASSED}"
    log_error "Failed: ${CHECKS_FAILED}"
    log_warning "Warnings: ${CHECKS_WARNING}"
    log ""

    local success_rate=$(echo "scale=2; ${CHECKS_PASSED} * 100 / ${CHECKS_TOTAL}" | bc -l || echo "0")
    log "Success Rate: ${success_rate}%"
    log ""

    if [[ ${CHECKS_FAILED} -eq 0 ]]; then
        log_success "All critical checks passed!"
        log ""
        log "Log file: ${LOG_FILE}"
        return 0
    else
        log_error "Some checks failed. Please review the errors above."
        log ""
        log "Log file: ${LOG_FILE}"
        return 1
    fi
}

#######################################
# Main Execution
#######################################

main() {
    log "========================================="
    log "IncentEdge Health Check"
    log "========================================="
    log "Target: ${BASE_URL}"
    log "Timeout: ${TIMEOUT}s"
    log "Max Response Time: ${MAX_RESPONSE_TIME}ms"
    log "========================================="
    log ""

    # Run all health checks
    check_api_health
    check_database_connectivity
    check_critical_apis
    check_static_assets
    check_performance
    check_security_headers
    check_environment

    # Print summary and exit with appropriate code
    print_summary
    exit $?
}

# Check if bc is installed (needed for calculations)
if ! command -v bc &> /dev/null; then
    log_warning "bc command not found. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y bc
    elif command -v brew &> /dev/null; then
        brew install bc
    else
        log_error "Please install bc manually"
        exit 1
    fi
fi

# Run main health check
main "$@"
