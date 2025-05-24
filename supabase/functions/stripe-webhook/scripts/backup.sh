#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR=".backups"
RETENTION_DAYS=30
COMPRESS=true
ENCRYPT=true
GPG_RECIPIENT="backup@company.com"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE=".logs/backup.log"

# Initialize directories
mkdir -p "$BACKUP_DIR"/{db,config,logs}
mkdir -p .logs

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create backup filename
get_backup_name() {
    local type=$1
    echo "${BACKUP_DIR}/${type}/backup_${type}_${TIMESTAMP}"
}

# Compress file
compress_file() {
    local file=$1
    if [[ "$COMPRESS" == "true" ]]; then
        gzip -9 "$file"
        log "${GREEN}Compressed $file${NC}"
    fi
}

# Encrypt file
encrypt_file() {
    local file=$1
    if [[ "$ENCRYPT" == "true" && -n "$GPG_RECIPIENT" ]]; then
        gpg --recipient "$GPG_RECIPIENT" --encrypt "$file"
        rm "$file"
        log "${GREEN}Encrypted $file${NC}"
    fi
}

# Backup database
backup_database() {
    log "Backing up database..."
    
    local backup_file=$(get_backup_name "db")
    
    if pg_dump "$DATABASE_URL" > "$backup_file.sql"; then
        compress_file "$backup_file.sql"
        encrypt_file "$backup_file.sql.gz"
        log "${GREEN}Database backup created: $backup_file.sql.gz.gpg${NC}"
        return 0
    else
        log "${RED}Database backup failed${NC}"
        return 1
    fi
}

# Backup configuration
backup_config() {
    log "Backing up configuration..."
    
    local backup_file=$(get_backup_name "config")
    local temp_dir=$(mktemp -d)
    
    # Copy configuration files
    cp .env "$temp_dir"/ 2>/dev/null || true
    cp .env.* "$temp_dir"/ 2>/dev/null || true
    cp deno.json "$temp_dir"/ 2>/dev/null || true
    cp import_map.json "$temp_dir"/ 2>/dev/null || true
    
    # Create tarball
    tar -czf "$backup_file.tar.gz" -C "$temp_dir" .
    rm -rf "$temp_dir"
    
    encrypt_file "$backup_file.tar.gz"
    log "${GREEN}Configuration backup created: $backup_file.tar.gz.gpg${NC}"
}

# Backup logs
backup_logs() {
    log "Backing up logs..."
    
    local backup_file=$(get_backup_name "logs")
    
    if [ -d ".logs" ]; then
        tar -czf "$backup_file.tar.gz" .logs/
        encrypt_file "$backup_file.tar.gz"
        log "${GREEN}Logs backup created: $backup_file.tar.gz.gpg${NC}"
    else
        log "${YELLOW}No logs directory found${NC}"
    fi
}

# Verify backup integrity
verify_backup() {
    local file=$1
    local type=$2
    
    log "Verifying $type backup..."
    
    case $type in
        db)
            # Test database dump
            if pg_restore --list "$file" >/dev/null 2>&1; then
                log "${GREEN}Database backup verified${NC}"
                return 0
            else
                log "${RED}Database backup verification failed${NC}"
                return 1
            fi
            ;;
        config|logs)
            # Test archive
            if tar -tzf "$file" >/dev/null 2>&1; then
                log "${GREEN}$type backup verified${NC}"
                return 0
            else
                log "${RED}$type backup verification failed${NC}"
                return 1
            fi
            ;;
    esac
}

# Clean old backups
clean_old_backups() {
    log "Cleaning old backups..."
    
    find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -delete
    
    log "${GREEN}Removed backups older than $RETENTION_DAYS days${NC}"
}

# Generate backup report
generate_report() {
    local report_file="$BACKUP_DIR/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "Backup Report"
        echo "============="
        echo
        echo "Generated: $(date)"
        echo
        
        echo "Backup Files:"
        find "$BACKUP_DIR" -type f -mtime -1 -ls
        echo
        
        echo "Storage Usage:"
        du -sh "$BACKUP_DIR"/*
        echo
        
        echo "Verification Results:"
        echo "- Database: $DB_VERIFY_STATUS"
        echo "- Config: $CONFIG_VERIFY_STATUS"
        echo "- Logs: $LOGS_VERIFY_STATUS"
        
    } > "$report_file"
    
    log "${GREEN}Backup report generated: $report_file${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --no-compress    Don't compress backups"
    echo "  --no-encrypt    Don't encrypt backups"
    echo "  --retention N   Set retention period in days"
    echo "  --verify        Only verify existing backups"
    echo "  --clean        Only clean old backups"
    echo "  --help         Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-compress)
                COMPRESS=false
                shift
                ;;
            --no-encrypt)
                ENCRYPT=false
                shift
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --verify)
                verify_all_backups
                exit 0
                ;;
            --clean)
                clean_old_backups
                exit 0
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
}

# Main backup process
main() {
    log "Starting backup process..."
    
    backup_database
    DB_VERIFY_STATUS=$?
    
    backup_config
    CONFIG_VERIFY_STATUS=$?
    
    backup_logs
    LOGS_VERIFY_STATUS=$?
    
    clean_old_backups
    generate_report
    
    log "${GREEN}Backup process completed${NC}"
}

# Run backup
parse_args "$@"
main