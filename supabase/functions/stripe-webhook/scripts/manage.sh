#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR=".logs"

# Initialize logging
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/manage.log"
}

# Show menu
show_menu() {
    clear
    echo -e "${BLUE}Webhook Handler Management Console${NC}"
    echo "================================="
    echo
    echo "1) Development Tasks"
    echo "   a) Setup development environment"
    echo "   b) Update dependencies"
    echo "   c) Run tests"
    echo "   d) Format code"
    echo
    echo "2) Deployment Tasks"
    echo "   a) Deploy webhook handler"
    echo "   b) Run database migrations"
    echo "   c) Verify deployment"
    echo "   d) Rollback deployment"
    echo
    echo "3) Maintenance Tasks"
    echo "   a) Backup system"
    echo "   b) Clean up system"
    echo "   c) Rotate logs"
    echo "   d) Maintain database"
    echo
    echo "4) Monitoring Tasks"
    echo "   a) Show status dashboard"
    echo "   b) View logs"
    echo "   c) Check health"
    echo "   d) Generate reports"
    echo
    echo "5) Data Management"
    echo "   a) Reconcile data"
    echo "   b) Export data"
    echo "   c) Run analytics"
    echo "   d) Verify data integrity"
    echo
    echo "x) Exit"
    echo
    echo "Enter your choice:"
}

# Handle development tasks
handle_dev_tasks() {
    case $1 in
        a)
            log "Setting up development environment..."
            bash "$SCRIPTS_DIR/setup-dev.sh"
            ;;
        b)
            log "Updating dependencies..."
            bash "$SCRIPTS_DIR/manage-deps.sh"
            ;;
        c)
            log "Running tests..."
            deno test --allow-all
            ;;
        d)
            log "Formatting code..."
            deno fmt
            ;;
        *)
            log "${RED}Invalid development task${NC}"
            ;;
    esac
}

# Handle deployment tasks
handle_deploy_tasks() {
    case $1 in
        a)
            log "Deploying webhook handler..."
            bash "$SCRIPTS_DIR/deploy.sh"
            ;;
        b)
            log "Running database migrations..."
            supabase db push
            ;;
        c)
            log "Verifying deployment..."
            bash "$SCRIPTS_DIR/deploy.sh" --verify
            ;;
        d)
            log "Rolling back deployment..."
            bash "$SCRIPTS_DIR/deploy.sh" --rollback
            ;;
        *)
            log "${RED}Invalid deployment task${NC}"
            ;;
    esac
}

# Handle maintenance tasks
handle_maintenance_tasks() {
    case $1 in
        a)
            log "Running backup..."
            bash "$SCRIPTS_DIR/backup.sh"
            ;;
        b)
            log "Cleaning up system..."
            bash "$SCRIPTS_DIR/cleanup.sh"
            ;;
        c)
            log "Rotating logs..."
            bash "$SCRIPTS_DIR/rotate-logs.sh"
            ;;
        d)
            log "Maintaining database..."
            bash "$SCRIPTS_DIR/maintain-db.sh"
            ;;
        *)
            log "${RED}Invalid maintenance task${NC}"
            ;;
    esac
}

# Handle monitoring tasks
handle_monitoring_tasks() {
    case $1 in
        a)
            log "Starting status dashboard..."
            bash "$SCRIPTS_DIR/monitor.sh" --dashboard
            ;;
        b)
            log "Viewing logs..."
            less "$LOG_DIR/webhook.log"
            ;;
        c)
            log "Checking health..."
            bash "$SCRIPTS_DIR/health-check.sh" --once
            ;;
        d)
            log "Generating reports..."
            bash "$SCRIPTS_DIR/monitor.sh" --report
            ;;
        *)
            log "${RED}Invalid monitoring task${NC}"
            ;;
    esac
}

# Handle data management tasks
handle_data_tasks() {
    case $1 in
        a)
            log "Reconciling data..."
            bash "$SCRIPTS_DIR/reconcile.sh"
            ;;
        b)
            log "Exporting data..."
            bash "$SCRIPTS_DIR/backup.sh" --export
            ;;
        c)
            log "Running analytics..."
            bash "$SCRIPTS_DIR/monitor.sh" --analyze
            ;;
        d)
            log "Verifying data integrity..."
            bash "$SCRIPTS_DIR/reconcile.sh" --verify
            ;;
        *)
            log "${RED}Invalid data management task${NC}"
            ;;
    esac
}

# Handle user input
handle_input() {
    local choice=$1
    local subtask=$2
    
    case $choice in
        1)
            handle_dev_tasks "$subtask"
            ;;
        2)
            handle_deploy_tasks "$subtask"
            ;;
        3)
            handle_maintenance_tasks "$subtask"
            ;;
        4)
            handle_monitoring_tasks "$subtask"
            ;;
        5)
            handle_data_tasks "$subtask"
            ;;
        x|X)
            echo "Exiting..."
            exit 0
            ;;
        *)
            log "${RED}Invalid choice${NC}"
            ;;
    esac
}

# Show help
show_help() {
    echo "Usage: $0 [command] [subtask]"
    echo
    echo "Commands:"
    echo "  dev        Development tasks"
    echo "  deploy     Deployment tasks"
    echo "  maintain   Maintenance tasks"
    echo "  monitor    Monitoring tasks"
    echo "  data       Data management tasks"
    echo
    echo "Example:"
    echo "  $0 dev setup    # Setup development environment"
    echo "  $0 monitor dash # Show monitoring dashboard"
}

# Parse command line arguments
if [ $# -gt 0 ]; then
    case $1 in
        dev|1)
            handle_dev_tasks "$2"
            ;;
        deploy|2)
            handle_deploy_tasks "$2"
            ;;
        maintain|3)
            handle_maintenance_tasks "$2"
            ;;
        monitor|4)
            handle_monitoring_tasks "$2"
            ;;
        data|5)
            handle_data_tasks "$2"
            ;;
        help|-h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
else
    # Interactive mode
    while true; do
        show_menu
        read -r choice subtask
        
        if [ "$choice" = "x" ] || [ "$choice" = "X" ]; then
            echo "Exiting..."
            break
        fi
        
        handle_input "$choice" "$subtask"
        
        echo
        read -p "Press Enter to continue..."
    done
fi