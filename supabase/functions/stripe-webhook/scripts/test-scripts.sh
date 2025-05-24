#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_DIR=".test_env"
LOG_FILE=".logs/script_tests.log"

# Initialize test environment
mkdir -p "$TEST_DIR" ".logs"

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Test result tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Run test and track result
run_test() {
    local name=$1
    local cmd=$2
    
    ((TOTAL_TESTS++))
    
    log "Testing: $name"
    echo -e "${BLUE}Running: $cmd${NC}"
    
    if eval "$cmd" > "$TEST_DIR/output.log" 2>&1; then
        echo -e "${GREEN}✓ Test passed: $name${NC}"
        ((PASSED_TESTS++))
        return 0
    else
        echo -e "${RED}✗ Test failed: $name${NC}"
        echo "Output:"
        cat "$TEST_DIR/output.log"
        ((FAILED_TESTS++))
        return 1
    fi
}

# Setup test environment
setup_test_env() {
    log "Setting up test environment..."
    
    # Create test directories
    mkdir -p "$TEST_DIR"/{db,logs,metrics,backups}
    
    # Create test database
    psql -c "CREATE DATABASE webhook_test;" || true
    
    # Create test configuration
    cat > "$TEST_DIR/.env" << EOF
DATABASE_URL=postgres://localhost:5432/webhook_test
STRIPE_WEBHOOK_SECRET=whsec_test_123
STRIPE_SECRET_KEY=sk_test_123
EOF
    
    log "Test environment setup complete"
}

# Cleanup test environment
cleanup_test_env() {
    log "Cleaning up test environment..."
    
    # Drop test database
    psql -c "DROP DATABASE IF EXISTS webhook_test;"
    
    # Remove test directory
    rm -rf "$TEST_DIR"
    
    log "Test environment cleanup complete"
}

# Test individual scripts
test_scripts() {
    log "Testing maintenance scripts..."
    
    # Test setup script
    run_test "Setup Script" \
        "bash $SCRIPTS_DIR/setup-dev.sh --no-database"
    
    # Test dependency management
    run_test "Dependency Management" \
        "bash $SCRIPTS_DIR/manage-deps.sh --check"
    
    # Test monitoring
    run_test "Monitoring" \
        "bash $SCRIPTS_DIR/monitor.sh --collect"
    
    # Test health check
    run_test "Health Check" \
        "bash $SCRIPTS_DIR/health-check.sh --once"
    
    # Test backup
    run_test "Backup" \
        "bash $SCRIPTS_DIR/backup.sh --no-encrypt"
    
    # Test cleanup
    run_test "Cleanup" \
        "bash $SCRIPTS_DIR/cleanup.sh --temp-only"
    
    # Test log rotation
    run_test "Log Rotation" \
        "bash $SCRIPTS_DIR/rotate-logs.sh"
    
    # Test database maintenance
    run_test "Database Maintenance" \
        "bash $SCRIPTS_DIR/maintain-db.sh --analyze-only"
    
    # Test reconciliation
    run_test "Data Reconciliation" \
        "bash $SCRIPTS_DIR/reconcile.sh --dry-run"
}

# Test management console
test_management_console() {
    log "Testing management console..."
    
    # Test help command
    run_test "Management Console Help" \
        "bash $SCRIPTS_DIR/manage.sh --help"
    
    # Test development command
    run_test "Management Console Dev Command" \
        "bash $SCRIPTS_DIR/manage.sh dev setup"
    
    # Test monitor command
    run_test "Management Console Monitor Command" \
        "bash $SCRIPTS_DIR/manage.sh monitor health"
}

# Test script permissions
test_permissions() {
    log "Testing script permissions..."
    
    local scripts=(
        "setup-dev.sh"
        "manage-deps.sh"
        "deploy.sh"
        "monitor.sh"
        "health-check.sh"
        "backup.sh"
        "cleanup.sh"
        "rotate-logs.sh"
        "maintain-db.sh"
        "reconcile.sh"
        "manage.sh"
    )
    
    for script in "${scripts[@]}"; do
        run_test "Permission: $script" \
            "test -x $SCRIPTS_DIR/$script"
    done
}

# Generate test report
generate_report() {
    local report_file="$TEST_DIR/test_report.txt"
    
    {
        echo "Script Test Report"
        echo "================="
        echo
        echo "Run at: $(date)"
        echo
        echo "Results:"
        echo "- Total Tests: $TOTAL_TESTS"
        echo "- Passed: $PASSED_TESTS"
        echo "- Failed: $FAILED_TESTS"
        echo
        echo "Details:"
        cat "$LOG_FILE"
        
    } > "$report_file"
    
    log "Test report generated: $report_file"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --quick       Run quick tests only"
    echo "  --no-cleanup  Don't clean up test environment"
    echo "  --help       Show this help message"
}

# Parse command line arguments
QUICK_TEST=false
NO_CLEANUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_TEST=true
            shift
            ;;
        --no-cleanup)
            NO_CLEANUP=true
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

# Main test process
main() {
    log "Starting script tests..."
    
    # Setup
    setup_test_env
    
    # Run tests
    test_permissions
    
    if [ "$QUICK_TEST" = false ]; then
        test_scripts
        test_management_console
    fi
    
    # Generate report
    generate_report
    
    # Cleanup
    if [ "$NO_CLEANUP" = false ]; then
        cleanup_test_env
    fi
    
    # Show results
    echo
    echo -e "${BLUE}Test Results:${NC}"
    echo "-------------"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    echo
    
    # Return status
    [ "$FAILED_TESTS" -eq 0 ]
}

# Run tests
main