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
LOG_FILE=".logs/uninstall.log"
BACKUP_DIR=".uninstall_backup"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Backup important data
backup_data() {
    log "Backing up important data..."
    
    mkdir -p "$BACKUP_DIR"/{config,logs,metrics,db}
    
    # Backup configuration
    cp .env* "$BACKUP_DIR/config/" 2>/dev/null || true
    cp deno.json* "$BACKUP_DIR/config/" 2>/dev/null || true
    cp import_map.json "$BACKUP_DIR/config/" 2>/dev/null || true
    
    # Backup logs
    cp -r .logs/* "$BACKUP_DIR/logs/" 2>/dev/null || true
    
    # Backup metrics
    cp -r .metrics/* "$BACKUP_DIR/metrics/" 2>/dev/null || true
    
    # Backup database
    if command -v pg_dump > /dev/null; then
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db/backup.sql" 2>/dev/null || true
    fi
    
    log "${GREEN}Data backed up to $BACKUP_DIR${NC}"
}

# Remove cron jobs
remove_cron_jobs() {
    log "Removing cron jobs..."
    
    if command -v crontab > /dev/null; then
        bash "$SCRIPTS_DIR/cron-setup.sh" remove
    fi
}

# Remove database
remove_database() {
    log "Removing database..."
    
    if command -v psql > /dev/null; then
        psql -c "DROP DATABASE IF EXISTS webhook_dev;" 2>/dev/null || true
        psql -c "DROP DATABASE IF EXISTS webhook_test;" 2>/dev/null || true
    fi
}

# Remove installed tools
remove_tools() {
    log "Removing installed tools..."
    
    # Remove Deno
    if command -v deno > /dev/null; then
        rm -rf "$HOME/.deno"
        log "${GREEN}Removed Deno${NC}"
    fi
    
    # Remove global npm packages
    if command -v npm > /dev/null; then
        npm uninstall -g typescript prettier eslint
        log "${GREEN}Removed global npm packages${NC}"
    fi
}

# Clean shell configuration
clean_shell_config() {
    log "Cleaning shell configuration..."
    
    local shell_rc="$HOME/.bashrc"
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
    fi
    
    # Remove our additions
    sed -i.bak '/# Webhook handler/,+5d' "$shell_rc"
    
    log "${GREEN}Shell configuration cleaned${NC}"
}

# Remove project files
remove_project_files() {
    log "Removing project files..."
    
    # Remove generated directories
    rm -rf \
        .logs \
        .metrics \
        .temp \
        .cache \
        .backups \
        node_modules \
        dist
    
    log "${GREEN}Project files removed${NC}"
}

# Verify uninstallation
verify_uninstallation() {
    log "Verifying uninstallation..."
    
    local failed=0
    
    # Check if directories are removed
    for dir in .logs .metrics .temp .cache .backups node_modules dist; do
        if [ -d "$dir" ]; then
            log "${RED}Directory still exists: $dir${NC}"
            failed=1
        fi
    done
    
    # Check if cron jobs are removed
    if crontab -l 2>/dev/null | grep -q "webhook"; then
        log "${RED}Cron jobs still exist${NC}"
        failed=1
    fi
    
    # Check if databases are removed
    if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "webhook"; then
        log "${RED}Database still exists${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log "${GREEN}Uninstallation verified${NC}"
    else
        log "${RED}Some components were not properly uninstalled${NC}"
        return 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --no-backup    Don't backup data before uninstalling"
    echo "  --force        Don't ask for confirmation"
    echo "  --keep-config  Keep configuration files"
    echo "  --help         Show this help message"
}

# Parse command line arguments
NO_BACKUP=false
FORCE=false
KEEP_CONFIG=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --keep-config)
            KEEP_CONFIG=true
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

# Confirm uninstallation
if [ "$FORCE" = false ]; then
    echo -e "${RED}WARNING: This will remove the webhook handler and all associated data${NC}"
    echo "Consider making a backup before proceeding."
    echo
    read -p "Are you sure you want to continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Uninstallation cancelled"
        exit 1
    fi
fi

# Main uninstallation process
main() {
    log "Starting uninstallation..."
    
    if [ "$NO_BACKUP" = false ]; then
        backup_data
    fi
    
    remove_cron_jobs
    remove_database
    remove_tools
    clean_shell_config
    
    if [ "$KEEP_CONFIG" = false ]; then
        remove_project_files
    fi
    
    verify_uninstallation
    
    log "${GREEN}Uninstallation completed${NC}"
    
    if [ "$NO_BACKUP" = false ]; then
        log "Your data has been backed up to: $BACKUP_DIR"
        log "Keep this directory if you need to restore anything later."
    fi
}

# Run uninstallation
main