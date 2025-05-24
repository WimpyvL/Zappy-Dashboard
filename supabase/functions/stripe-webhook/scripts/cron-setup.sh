#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRON_FILE="$SCRIPTS_DIR/crontab.txt"
LOG_FILE=".logs/cron_setup.log"
PROJECT_ROOT="$(cd "$SCRIPTS_DIR/.." && pwd)"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log "${RED}Please run as root${NC}"
        exit 1
    fi
}

# Create cron jobs configuration
create_cron_config() {
    log "Creating cron configuration..."
    
    cat > "$CRON_FILE" << EOF
# Webhook Handler Maintenance Tasks
# m h dom mon dow command

# Health checks (every 5 minutes)
*/5 * * * * cd $PROJECT_ROOT && ./scripts/health-check.sh --once >> .logs/health.log 2>&1

# Database maintenance (daily at 2 AM)
0 2 * * * cd $PROJECT_ROOT && ./scripts/maintain-db.sh >> .logs/maintenance.log 2>&1

# Backup (daily at 3 AM)
0 3 * * * cd $PROJECT_ROOT && ./scripts/backup.sh >> .logs/backup.log 2>&1

# Log rotation (daily at 1 AM)
0 1 * * * cd $PROJECT_ROOT && ./scripts/rotate-logs.sh >> .logs/rotation.log 2>&1

# Data reconciliation (every hour)
0 * * * * cd $PROJECT_ROOT && ./scripts/reconcile.sh >> .logs/reconciliation.log 2>&1

# System cleanup (weekly on Sunday at 4 AM)
0 4 * * 0 cd $PROJECT_ROOT && ./scripts/cleanup.sh >> .logs/cleanup.log 2>&1

# Dependency updates (weekly on Saturday at 3 AM)
0 3 * * 6 cd $PROJECT_ROOT && ./scripts/manage-deps.sh --check >> .logs/deps.log 2>&1

# Generate reports (daily at 5 AM)
0 5 * * * cd $PROJECT_ROOT && ./scripts/monitor.sh --report >> .logs/reports.log 2>&1
EOF

    log "${GREEN}Cron configuration created${NC}"
}

# Install cron jobs
install_cron_jobs() {
    log "Installing cron jobs..."
    
    # Make scripts executable
    chmod +x "$SCRIPTS_DIR"/*.sh
    
    # Check if crontab exists
    if crontab -l &>/dev/null; then
        # Backup existing crontab
        crontab -l > "$SCRIPTS_DIR/crontab.backup"
        log "${YELLOW}Existing crontab backed up${NC}"
    fi
    
    # Install new crontab
    crontab "$CRON_FILE"
    
    log "${GREEN}Cron jobs installed${NC}"
}

# Remove cron jobs
remove_cron_jobs() {
    log "Removing cron jobs..."
    
    # Check if backup exists
    if [ -f "$SCRIPTS_DIR/crontab.backup" ]; then
        crontab "$SCRIPTS_DIR/crontab.backup"
        rm "$SCRIPTS_DIR/crontab.backup"
        log "${GREEN}Restored previous crontab${NC}"
    else
        crontab -r
        log "${GREEN}Removed all cron jobs${NC}"
    fi
}

# List current cron jobs
list_cron_jobs() {
    log "Current cron jobs:"
    echo
    crontab -l
}

# Verify cron jobs
verify_cron_jobs() {
    log "Verifying cron jobs..."
    
    local failed=0
    
    # Check if cron service is running
    if ! systemctl is-active --quiet cron; then
        log "${RED}Cron service is not running${NC}"
        failed=1
    fi
    
    # Check if scripts are executable
    for script in "$SCRIPTS_DIR"/*.sh; do
        if [ ! -x "$script" ]; then
            log "${RED}Script not executable: $script${NC}"
            failed=1
        fi
    done
    
    # Check if log directories exist
    if [ ! -d "$PROJECT_ROOT/.logs" ]; then
        log "${RED}Log directory does not exist${NC}"
        failed=1
    fi
    
    # Test a simple cron job
    if ! (crontab -l | grep -q "health-check.sh"); then
        log "${RED}Health check job not installed${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log "${GREEN}All cron jobs verified${NC}"
    else
        log "${RED}Cron job verification failed${NC}"
        return 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  install    Install cron jobs"
    echo "  remove     Remove cron jobs"
    echo "  list       List current cron jobs"
    echo "  verify     Verify cron job setup"
    echo "  help       Show this help message"
}

# Parse command line arguments
case $1 in
    install)
        check_root
        create_cron_config
        install_cron_jobs
        verify_cron_jobs
        ;;
    remove)
        check_root
        remove_cron_jobs
        ;;
    list)
        list_cron_jobs
        ;;
    verify)
        verify_cron_jobs
        ;;
    help|-h|--help)
        show_help
        exit 0
        ;;
    *)
        show_help
        exit 1
        ;;
esac

# Show status message
if [ $? -eq 0 ]; then
    log "${GREEN}Operation completed successfully${NC}"
else
    log "${RED}Operation failed${NC}"
    exit 1
fi