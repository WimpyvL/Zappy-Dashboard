#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR=".logs"
ARCHIVE_DIR=".logs/archive"
RETENTION_DAYS=30
MAX_SIZE_MB=100
COMPRESS=true
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Initialize directories
mkdir -p "$LOG_DIR" "$ARCHIVE_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check file size in MB
get_file_size_mb() {
    local file=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file" | awk '{print $1/1048576}'
    else
        stat -f %s "$file" | awk '{print $1/1048576}'
    fi
}

# Compress file
compress_file() {
    local file=$1
    if [[ "$COMPRESS" == "true" ]]; then
        gzip -9 "$file"
        log "${GREEN}Compressed $file${NC}"
    fi
}

# Archive log file
archive_log() {
    local file=$1
    local basename=$(basename "$file")
    local archive_path="$ARCHIVE_DIR/${basename}_${TIMESTAMP}"
    
    # Copy to archive
    cp "$file" "$archive_path"
    
    # Truncate original
    : > "$file"
    
    # Compress archive
    compress_file "$archive_path"
    
    log "${GREEN}Archived $file to $archive_path${NC}"
}

# Clean old archives
clean_old_archives() {
    log "Cleaning old archives..."
    
    find "$ARCHIVE_DIR" -type f -mtime +"$RETENTION_DAYS" -exec rm -f {} \;
    
    log "${GREEN}Removed archives older than $RETENTION_DAYS days${NC}"
}

# Rotate logs based on size
rotate_by_size() {
    log "Checking log sizes..."
    
    find "$LOG_DIR" -type f -name "*.log" | while read -r file; do
        local size=$(get_file_size_mb "$file")
        if (( $(echo "$size > $MAX_SIZE_MB" | bc -l) )); then
            log "${YELLOW}Rotating $file (size: ${size}MB)${NC}"
            archive_log "$file"
        fi
    done
}

# Analyze log statistics
analyze_logs() {
    log "Analyzing logs..."
    
    echo "Log Statistics:"
    echo "---------------"
    
    # Count total log files
    local total_files=$(find "$LOG_DIR" -type f -name "*.log" | wc -l)
    echo "Total log files: $total_files"
    
    # Calculate total size
    local total_size=$(du -sh "$LOG_DIR" | cut -f1)
    echo "Total log size: $total_size"
    
    # Show largest files
    echo -e "\nLargest log files:"
    find "$LOG_DIR" -type f -name "*.log" -exec du -h {} \; | sort -rh | head -n 5
    
    # Show newest files
    echo -e "\nMost recently modified:"
    find "$LOG_DIR" -type f -name "*.log" -exec ls -lth {} \; | head -n 5
}

# Create log summary
create_summary() {
    local summary_file="$LOG_DIR/rotation_summary_${TIMESTAMP}.txt"
    
    {
        echo "Log Rotation Summary"
        echo "===================="
        echo "Timestamp: $(date)"
        echo
        echo "Statistics before rotation:"
        analyze_logs
        echo
        echo "Rotated files:"
        find "$ARCHIVE_DIR" -type f -name "*_${TIMESTAMP}*" -exec ls -lh {} \;
        echo
        echo "Removed archives:"
        find "$ARCHIVE_DIR" -type f -mtime +"$RETENTION_DAYS" -exec ls -lh {} \;
    } > "$summary_file"
    
    log "${GREEN}Created rotation summary: $summary_file${NC}"
}

# Monitor log growth
monitor_growth() {
    log "Monitoring log growth..."
    
    local data_file="$LOG_DIR/.growth_data"
    local current_size=$(du -s "$LOG_DIR" | cut -f1)
    local current_date=$(date +%s)
    
    # Save current measurement
    echo "$current_date $current_size" >> "$data_file"
    
    # Calculate growth rate (keep last 7 days of data)
    tail -n 7 "$data_file" > "$data_file.tmp"
    mv "$data_file.tmp" "$data_file"
    
    # Alert if growth rate is high
    local first_measurement=$(head -n 1 "$data_file")
    local first_date=$(echo "$first_measurement" | cut -d' ' -f1)
    local first_size=$(echo "$first_measurement" | cut -d' ' -f2)
    
    local days=$(( (current_date - first_date) / 86400 ))
    if [ "$days" -gt 0 ]; then
        local growth_rate=$(( (current_size - first_size) / days ))
        log "Average daily growth rate: ${growth_rate}KB"
        
        if [ "$growth_rate" -gt 10000 ]; then # 10MB per day
            log "${YELLOW}WARNING: High log growth rate detected${NC}"
        fi
    fi
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --max-size)
                MAX_SIZE_MB="$2"
                shift 2
                ;;
            --retention)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            --no-compress)
                COMPRESS=false
                shift
                ;;
            --analyze)
                analyze_logs
                exit 0
                ;;
            --monitor)
                monitor_growth
                exit 0
                ;;
            *)
                log "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
}

# Main rotation process
main() {
    log "Starting log rotation..."
    
    monitor_growth
    rotate_by_size
    clean_old_archives
    create_summary
    
    log "Log rotation completed"
}

# Error handling
set -e
trap 'log "${RED}Error occurred. Check rotation_summary for details.${NC}"' ERR

# Run main process
parse_args "$@"
main