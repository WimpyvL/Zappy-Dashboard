#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"
LOG_FILE=".logs/validation.log"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Required files
REQUIRED_FILES=(
    ".env"
    "deno.json"
    "import_map.json"
    "index.ts"
    "config.ts"
    "db.ts"
    "types.ts"
)

# Required directories
REQUIRED_DIRS=(
    ".logs"
    ".metrics"
    ".backups"
    "__tests__"
    "scripts"
)

# Required environment variables
REQUIRED_ENV_VARS=(
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

# Required dependencies
REQUIRED_DEPS=(
    "stripe"
    "@supabase/supabase-js"
)

# Check configuration files
check_files() {
    log "Checking required files..."
    local failed=0
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            echo -e "${GREEN}✓${NC} $file exists"
        else
            echo -e "${RED}✗${NC} Missing $file"
            failed=1
        fi
    done
    
    return $failed
}

# Check directories
check_directories() {
    log "Checking required directories..."
    local failed=0
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            echo -e "${GREEN}✓${NC} $dir exists"
        else
            echo -e "${RED}✗${NC} Missing directory: $dir"
            failed=1
        fi
    done
    
    return $failed
}

# Check environment variables
check_env_vars() {
    log "Checking environment variables..."
    local failed=0
    
    if [ -f "$PROJECT_ROOT/.env" ]; then
        source "$PROJECT_ROOT/.env"
    fi
    
    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if [ -n "${!var}" ]; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${RED}✗${NC} $var is not set"
            failed=1
        fi
    done
    
    return $failed
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    local failed=0
    
    if [ -f "$PROJECT_ROOT/deps.ts" ]; then
        for dep in "${REQUIRED_DEPS[@]}"; do
            if grep -q "$dep" "$PROJECT_ROOT/deps.ts"; then
                echo -e "${GREEN}✓${NC} $dep is imported"
            else
                echo -e "${RED}✗${NC} Missing dependency: $dep"
                failed=1
            fi
        done
    else
        echo -e "${RED}✗${NC} deps.ts not found"
        failed=1
    fi
    
    return $failed
}

# Check TypeScript configuration
check_typescript() {
    log "Checking TypeScript configuration..."
    
    if ! deno check "$PROJECT_ROOT"/**/*.ts; then
        echo -e "${RED}✗${NC} TypeScript check failed"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} TypeScript check passed"
    return 0
}

# Check database connection
check_database() {
    log "Checking database connection..."
    
    if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${RED}✗${NC} Database connection failed"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} Database connection successful"
    return 0
}

# Check Stripe configuration
check_stripe() {
    log "Checking Stripe configuration..."
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        echo -e "${RED}✗${NC} STRIPE_SECRET_KEY not set"
        return 1
    fi
    
    # Test Stripe API key
    if ! curl -s "https://api.stripe.com/v1/customers" \
        -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        -H "Content-Type: application/json" \
        >/dev/null; then
        echo -e "${RED}✗${NC} Invalid Stripe API key"
        return 1
    fi
    
    echo -e "${GREEN}✓${NC} Stripe configuration valid"
    return 0
}

# Check permissions
check_permissions() {
    log "Checking file permissions..."
    local failed=0
    
    # Check script permissions
    for script in "$SCRIPTS_DIR"/*.sh; do
        if [ ! -x "$script" ]; then
            echo -e "${RED}✗${NC} $script is not executable"
            failed=1
        fi
    done
    
    # Check directory permissions
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ ! -w "$PROJECT_ROOT/$dir" ]; then
            echo -e "${RED}✗${NC} $dir is not writable"
            failed=1
        fi
    done
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All permissions correct"
    fi
    
    return $failed
}

# Generate validation report
generate_report() {
    local report_file="$PROJECT_ROOT/.logs/validation_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Webhook Handler Validation Report"
        echo "================================"
        echo
        echo "Generated: $(date)"
        echo
        echo "Environment: $NODE_ENV"
        echo "Deno Version: $(deno --version)"
        echo "Node Version: $(node --version)"
        echo
        echo "Validation Results:"
        echo "-----------------"
        echo "Files: $FILE_STATUS"
        echo "Directories: $DIR_STATUS"
        echo "Environment Variables: $ENV_STATUS"
        echo "Dependencies: $DEP_STATUS"
        echo "TypeScript: $TS_STATUS"
        echo "Database: $DB_STATUS"
        echo "Stripe: $STRIPE_STATUS"
        echo "Permissions: $PERM_STATUS"
        
    } > "$report_file"
    
    log "Report generated: $report_file"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --quick        Quick validation (skip heavy checks)"
    echo "  --fix          Attempt to fix issues"
    echo "  --report       Generate detailed report"
    echo "  --help         Show this help message"
}

# Parse command line arguments
QUICK_CHECK=false
FIX_ISSUES=false
GENERATE_REPORT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_CHECK=true
            shift
            ;;
        --fix)
            FIX_ISSUES=true
            shift
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main validation process
main() {
    log "Starting validation..."
    
    check_files
    FILE_STATUS=$?
    
    check_directories
    DIR_STATUS=$?
    
    check_env_vars
    ENV_STATUS=$?
    
    check_dependencies
    DEP_STATUS=$?
    
    if [ "$QUICK_CHECK" = false ]; then
        check_typescript
        TS_STATUS=$?
        
        check_database
        DB_STATUS=$?
        
        check_stripe
        STRIPE_STATUS=$?
    fi
    
    check_permissions
    PERM_STATUS=$?
    
    if [ "$GENERATE_REPORT" = true ]; then
        generate_report
    fi
    
    # Calculate overall status
    TOTAL_FAILED=$((FILE_STATUS + DIR_STATUS + ENV_STATUS + DEP_STATUS + TS_STATUS + DB_STATUS + STRIPE_STATUS + PERM_STATUS))
    
    if [ $TOTAL_FAILED -eq 0 ]; then
        log "${GREEN}All validations passed!${NC}"
        exit 0
    else
        log "${RED}Validation failed with $TOTAL_FAILED errors${NC}"
        exit 1
    fi
}

# Run validation
main