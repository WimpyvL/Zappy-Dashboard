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
LOG_FILE=".logs/setup.log"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Step tracking
CURRENT_STEP=0
TOTAL_STEPS=8

# Progress indicator
show_progress() {
    ((CURRENT_STEP++))
    echo -e "\n${BLUE}Step $CURRENT_STEP/$TOTAL_STEPS: $1${NC}"
}

# Error handling
handle_error() {
    log "${RED}Error in step $CURRENT_STEP: $1${NC}"
    
    if [ "$SKIP_ERRORS" = true ]; then
        log "${YELLOW}Continuing despite error...${NC}"
        return 0
    else
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    show_progress "Installing dependencies"
    
    if ! bash "$SCRIPTS_DIR/install.sh"; then
        handle_error "Failed to install dependencies"
    fi
}

# Setup development environment
setup_dev_env() {
    show_progress "Setting up development environment"
    
    if ! bash "$SCRIPTS_DIR/setup-dev.sh"; then
        handle_error "Failed to setup development environment"
    fi
}

# Configure database
setup_database() {
    show_progress "Configuring database"
    
    if ! bash "$SCRIPTS_DIR/maintain-db.sh" --setup; then
        handle_error "Failed to configure database"
    fi
}

# Setup logging and monitoring
setup_monitoring() {
    show_progress "Setting up logging and monitoring"
    
    # Create required directories
    mkdir -p .logs .metrics .temp
    
    # Initialize monitoring
    if ! bash "$SCRIPTS_DIR/monitor.sh" --init; then
        handle_error "Failed to setup monitoring"
    fi
}

# Configure cron jobs
setup_cron_jobs() {
    show_progress "Configuring maintenance tasks"
    
    if ! bash "$SCRIPTS_DIR/cron-setup.sh" install; then
        handle_error "Failed to setup cron jobs"
    fi
}

# Initialize backup system
setup_backup() {
    show_progress "Initializing backup system"
    
    if ! bash "$SCRIPTS_DIR/backup.sh" --init; then
        handle_error "Failed to initialize backup system"
    fi
}

# Run tests
run_tests() {
    show_progress "Running tests"
    
    if ! bash "$SCRIPTS_DIR/test-scripts.sh"; then
        handle_error "Tests failed"
    fi
}

# Verify installation
verify_setup() {
    show_progress "Verifying setup"
    
    local failed=0
    
    # Check required directories
    for dir in .logs .metrics .temp .backups; do
        if [ ! -d "$dir" ]; then
            log "${RED}Missing directory: $dir${NC}"
            failed=1
        fi
    done
    
    # Check script permissions
    for script in "$SCRIPTS_DIR"/*.sh; do
        if [ ! -x "$script" ]; then
            log "${RED}Script not executable: $script${NC}"
            failed=1
        fi
    done
    
    # Check database connection
    if ! psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        log "${RED}Database connection failed${NC}"
        failed=1
    fi
    
    # Check cron jobs
    if ! crontab -l | grep -q "webhook"; then
        log "${RED}Cron jobs not installed${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log "${GREEN}Setup verification passed${NC}"
        return 0
    else
        handle_error "Setup verification failed"
        return 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --skip-deps    Skip dependency installation"
    echo "  --skip-db      Skip database setup"
    echo "  --skip-cron    Skip cron job setup"
    echo "  --skip-tests   Skip testing"
    echo "  --quick        Quick setup (minimal configuration)"
    echo "  --force        Continue despite errors"
    echo "  --help         Show this help message"
}

# Parse command line arguments
SKIP_DEPS=false
SKIP_DB=false
SKIP_CRON=false
SKIP_TESTS=false
QUICK_SETUP=false
SKIP_ERRORS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --skip-db)
            SKIP_DB=true
            shift
            ;;
        --skip-cron)
            SKIP_CRON=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --quick)
            QUICK_SETUP=true
            SKIP_TESTS=true
            shift
            ;;
        --force)
            SKIP_ERRORS=true
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

# Main setup process
main() {
    log "Starting webhook handler setup..."
    echo -e "${BLUE}This will setup the Stripe webhook handler and all its components${NC}"
    
    # Run setup steps
    if [ "$SKIP_DEPS" = false ]; then
        install_dependencies
    fi
    
    setup_dev_env
    
    if [ "$SKIP_DB" = false ]; then
        setup_database
    fi
    
    setup_monitoring
    
    if [ "$SKIP_CRON" = false ]; then
        setup_cron_jobs
    fi
    
    if [ "$QUICK_SETUP" = false ]; then
        setup_backup
    fi
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    verify_setup
    
    log "${GREEN}Setup completed successfully!${NC}"
    log "Use './scripts/manage.sh' to manage the webhook handler"
}

# Run setup
main