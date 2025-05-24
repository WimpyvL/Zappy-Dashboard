#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BATCH_SIZE=100
MAX_RETRIES=3
START_DATE=${START_DATE:-"24h"} # Default to last 24 hours
DRY_RUN=${DRY_RUN:-"false"}
LOG_FILE=".logs/reconciliation.log"

# Initialize log directory
mkdir -p .logs

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    log "${RED}ERROR: $1${NC}"
    exit 1
}

# Verify prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        handle_error "STRIPE_SECRET_KEY is not set"
    fi
    
    if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        handle_error "Supabase credentials are not set"
    }
    
    command -v stripe >/dev/null 2>&1 || handle_error "Stripe CLI is not installed"
    command -v jq >/dev/null 2>&1 || handle_error "jq is not installed"
}

# Fetch events from Stripe
fetch_stripe_events() {
    local start_time=$(date -d "now - $START_DATE" +%s)
    log "Fetching Stripe events since $(date -d @$start_time)..."
    
    stripe events list \
        --limit $BATCH_SIZE \
        --starting-after $start_time \
        --format json > .temp/stripe_events.json
}

# Fetch events from database
fetch_db_events() {
    log "Fetching database events..."
    
    node scripts/monitor-db.js --export-events \
        --start-date "$START_DATE" \
        --output .temp/db_events.json
}

# Find missing events
find_missing_events() {
    log "Finding missing events..."
    
    jq -s '
        def normalize: sort_by(.id);
        ($input_filename | normalize) - ($db_filename | normalize)
    ' \
        --arg input_filename .temp/stripe_events.json \
        --arg db_filename .temp/db_events.json \
        > .temp/missing_events.json
    
    local count=$(jq length .temp/missing_events.json)
    log "Found $count missing events"
}

# Process missing events
process_missing_events() {
    local count=$(jq length .temp/missing_events.json)
    if [ "$count" -eq 0 ]; then
        log "${GREEN}No missing events to process${NC}"
        return 0
    fi
    
    log "Processing $count missing events..."
    
    if [ "$DRY_RUN" = "true" ]; then
        log "${YELLOW}DRY RUN: Would process these events:${NC}"
        jq '.[].id' .temp/missing_events.json
        return 0
    fi
    
    local success=0
    local failed=0
    
    jq -c '.[]' .temp/missing_events.json | while read -r event; do
        local event_id=$(echo "$event" | jq -r '.id')
        log "Processing event $event_id..."
        
        if node scripts/process-event.js --event "$event"; then
            ((success++))
            log "${GREEN}Successfully processed event $event_id${NC}"
        else
            ((failed++))
            log "${RED}Failed to process event $event_id${NC}"
        fi
    done
    
    log "Processed $success events successfully, $failed failed"
}

# Verify data consistency
verify_consistency() {
    log "Verifying data consistency..."
    
    if node scripts/verify-data.js --thorough; then
        log "${GREEN}Data consistency verified${NC}"
    else
        log "${RED}Data inconsistencies found${NC}"
        if [ "$AUTO_FIX" = "true" ]; then
            log "Attempting automatic fixes..."
            node scripts/fix-data.js --auto
        fi
    fi
}

# Clean up temporary files
cleanup() {
    log "Cleaning up..."
    rm -rf .temp
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --start-date DATE   Start date for reconciliation (default: 24h)"
    echo "  --dry-run          Show what would be done without making changes"
    echo "  --auto-fix         Automatically fix inconsistencies"
    echo "  --batch-size N     Number of events to process at once"
    echo "  --help            Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --start-date)
                START_DATE="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --auto-fix)
                AUTO_FIX="true"
                shift
                ;;
            --batch-size)
                BATCH_SIZE="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                handle_error "Unknown option: $1"
                ;;
        esac
    done
}

# Main reconciliation process
main() {
    log "Starting reconciliation process..."
    
    # Create temporary directory
    mkdir -p .temp
    
    # Run steps
    check_prerequisites
    fetch_stripe_events
    fetch_db_events
    find_missing_events
    process_missing_events
    verify_consistency
    cleanup
    
    log "Reconciliation completed"
}

# Parse arguments and run main process
parse_args "$@"
trap cleanup EXIT
main