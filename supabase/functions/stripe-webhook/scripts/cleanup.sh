#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR=".logs"
ARCHIVE_DIR=".archive"
BACKUP_DIR=".backups"
TEMP_DIR=".temp"
METRICS_DIR=".metrics"
LOG_RETENTION_DAYS=30
METRICS_RETENTION_DAYS=90
BACKUP_RETENTION_DAYS=180

# Initialize directories
mkdir -p "$LOG_DIR" "$ARCHIVE_DIR" "$BACKUP_DIR" "$TEMP_DIR" "$METRICS_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/cleanup.log"
}

# Check disk usage
check_disk_usage() {
    log "Checking disk usage..."
    
    local threshold=90
    local usage=$(df -h . | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [ "$usage" -gt "$threshold" ]; then
        log "${RED}Warning: Disk usage is at ${usage}%${NC}"
        return 1
    else
        log "${GREEN}Disk usage is at ${usage}%${NC}"
        return 0
    fi
}

# Clean temporary files
clean_temp_files() {
    log "Cleaning temporary files..."
    
    # Remove temp files older than 1 day
    find "$TEMP_DIR" -type f -mtime +1 -delete
    
    # Remove empty directories
    find "$TEMP_DIR" -type d -empty -delete
    
    log "${GREEN}Temporary files cleaned${NC}"
}

# Clean old logs
clean_old_logs() {
    log "Cleaning old logs..."
    
    local count=$(find "$LOG_DIR" -type f -mtime +"$LOG_RETENTION_DAYS" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        # Archive old logs before deletion
        local archive_file="$ARCHIVE_DIR/logs_$(date +%Y%m%d).tar.gz"
        find "$LOG_DIR" -type f -mtime +"$LOG_RETENTION_DAYS" -print0 | \
            tar czf "$archive_file" --null -T -
        
        # Delete old logs
        find "$LOG_DIR" -type f -mtime +"$LOG_RETENTION_DAYS" -delete
        
        log "${GREEN}Archived and removed $count old log files${NC}"
    else
        log "No old logs to clean"
    fi
}

# Clean old metrics
clean_old_metrics() {
    log "Cleaning old metrics..."
    
    find "$METRICS_DIR" -type f -mtime +"$METRICS_RETENTION_DAYS" -delete
    
    log "${GREEN}Old metrics cleaned${NC}"
}

# Clean old backups
clean_old_backups() {
    log "Cleaning old backups..."
    
    find "$BACKUP_DIR" -type f -mtime +"$BACKUP_RETENTION_DAYS" -delete
    
    log "${GREEN}Old backups cleaned${NC}"
}

# Compress large files
compress_large_files() {
    log "Compressing large files..."
    
    find "$LOG_DIR" "$METRICS_DIR" -type f -size +10M -not -name "*.gz" | while read -r file; do
        gzip -9 "$file"
        log "Compressed $file"
    done
}

# Clean node_modules
clean_node_modules() {
    log "Cleaning node_modules..."
    
    if [ -d "node_modules" ]; then
        # Remove unused dependencies
        npm prune --production
        
        # Clear npm cache
        npm cache clean --force
        
        log "${GREEN}node_modules cleaned${NC}"
    fi
}

# Clean cached data
clean_cache() {
    log "Cleaning cached data..."
    
    # Clear Deno cache
    deno cache --reload deps.ts
    
    # Clear system cache
    if [ -d ".cache" ]; then
        rm -rf .cache/*
    fi
    
    log "${GREEN}Cache cleaned${NC}"
}

# Generate cleanup report
generate_report() {
    local report_file="$LOG_DIR/cleanup_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Cleanup Report"
        echo "============="
        echo
        echo "Generated: $(date)"
        echo
        
        echo "Disk Usage:"
        df -h .
        echo
        
        echo "Directory Sizes:"
        du -sh "$LOG_DIR" "$ARCHIVE_DIR" "$BACKUP_DIR" "$TEMP_DIR" "$METRICS_DIR"
        echo
        
        echo "Files Removed:"
        echo "- Logs: $(find "$LOG_DIR" -type f -mtime +"$LOG_RETENTION_DAYS" | wc -l)"
        echo "- Metrics: $(find "$METRICS_DIR" -type f -mtime +"$METRICS_RETENTION_DAYS" | wc -l)"
        echo "- Backups: $(find "$BACKUP_DIR" -type f -mtime +"$BACKUP_RETENTION_DAYS" | wc -l)"
        echo "- Temp: $(find "$TEMP_DIR" -type f -mtime +1 | wc -l)"
        echo
        
        echo "Compressed Files:"
        find . -type f -name "*.gz" -mtime -1 -ls
        
    } > "$report_file"
    
    log "${GREEN}Cleanup report generated: $report_file${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --logs-only      Clean only log files"
    echo "  --metrics-only   Clean only metrics files"
    echo "  --temp-only      Clean only temporary files"
    echo "  --cache-only     Clean only cached data"
    echo "  --report-only    Generate cleanup report"
    echo "  --help           Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --logs-only)
                clean_old_logs
                exit 0
                ;;
            --metrics-only)
                clean_old_metrics
                exit 0
                ;;
            --temp-only)
                clean_temp_files
                exit 0
                ;;
            --cache-only)
                clean_cache
                exit 0
                ;;
            --report-only)
                generate_report
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

# Main cleanup process
main() {
    log "Starting cleanup process..."
    
    check_disk_usage
    clean_temp_files
    clean_old_logs
    clean_old_metrics
    clean_old_backups
    compress_large_files
    clean_node_modules
    clean_cache
    generate_report
    
    log "${GREEN}Cleanup completed${NC}"
}

# Run cleanup
parse_args "$@" || main