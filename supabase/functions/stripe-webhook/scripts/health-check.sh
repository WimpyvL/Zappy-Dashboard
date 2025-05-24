#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="stripe-webhook"
CHECK_INTERVAL=300 # 5 minutes
MAX_FAILURES=3
ALERT_THRESHOLD=0.1 # 10% error rate

# Logging
LOG_FILE=".logs/health-check.log"
METRICS_FILE=".metrics/health.json"

# Initialize log directory
mkdir -p .logs .metrics

# Print with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Format check result
format_check() {
    local status=$1
    local message=$2
    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $message"
    else
        echo -e "${RED}✗${NC} $message"
    fi
}

# Check if webhook endpoint is accessible
check_endpoint() {
    log "Checking webhook endpoint..."
    
    local url="https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "401" ]; then
        # 401 is expected for unauthorized access
        format_check "pass" "Endpoint is accessible"
        return 0
    else
        format_check "fail" "Endpoint check failed (HTTP $response)"
        return 1
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    if node scripts/monitor-db.js --check; then
        format_check "pass" "Database connection successful"
        return 0
    else
        format_check "fail" "Database connection failed"
        return 1
    fi
}

# Check error rates
check_error_rates() {
    log "Checking error rates..."
    
    local error_rate=$(node scripts/analyze-logs.js --error-rate --last-hours 1)
    
    if (( $(echo "$error_rate < $ALERT_THRESHOLD" | bc -l) )); then
        format_check "pass" "Error rate within acceptable range ($error_rate)"
        return 0
    else
        format_check "fail" "Error rate too high ($error_rate)"
        return 1
    fi
}

# Check event processing
check_event_processing() {
    log "Checking event processing..."
    
    if node scripts/test-webhook.js --ping; then
        format_check "pass" "Event processing working"
        return 0
    else
        format_check "fail" "Event processing failed"
        return 1
    fi
}

# Check resource usage
check_resources() {
    log "Checking resource usage..."
    
    local metrics=$(node scripts/monitor-db.js --metrics)
    local cpu_usage=$(echo "$metrics" | jq -r '.cpu')
    local memory_usage=$(echo "$metrics" | jq -r '.memory')
    
    if (( $(echo "$cpu_usage < 80" | bc -l) )) && (( $(echo "$memory_usage < 80" | bc -l) )); then
        format_check "pass" "Resource usage normal (CPU: ${cpu_usage}%, Memory: ${memory_usage}%)"
        return 0
    else
        format_check "fail" "Resource usage high (CPU: ${cpu_usage}%, Memory: ${memory_usage}%)"
        return 1
    fi
}

# Store health metrics
store_metrics() {
    local status=$1
    local timestamp=$(date +%s)
    
    local metrics=$(cat "$METRICS_FILE" 2>/dev/null || echo "[]")
    local new_metrics=$(echo "$metrics" | jq ". + [{
        \"timestamp\": $timestamp,
        \"status\": \"$status\",
        \"checks\": {
            \"endpoint\": $ENDPOINT_STATUS,
            \"database\": $DATABASE_STATUS,
            \"errors\": $ERROR_STATUS,
            \"processing\": $PROCESSING_STATUS,
            \"resources\": $RESOURCES_STATUS
        }
    }]")
    
    echo "$new_metrics" > "$METRICS_FILE"
}

# Send alerts if needed
send_alert() {
    local message=$1
    log "ALERT: $message"
    
    # Send to monitoring system (customize as needed)
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        curl -X POST "$ALERT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"🚨 $message\"}"
    fi
}

# Run all health checks
run_health_checks() {
    echo -e "${BLUE}Running health checks at $(date)${NC}"
    echo "----------------------------------------"
    
    # Run individual checks
    check_endpoint
    ENDPOINT_STATUS=$?
    
    check_database
    DATABASE_STATUS=$?
    
    check_error_rates
    ERROR_STATUS=$?
    
    check_event_processing
    PROCESSING_STATUS=$?
    
    check_resources
    RESOURCES_STATUS=$?
    
    # Calculate overall status
    TOTAL_CHECKS=5
    FAILED_CHECKS=$(($ENDPOINT_STATUS + $DATABASE_STATUS + $ERROR_STATUS + $PROCESSING_STATUS + $RESOURCES_STATUS))
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "\n${GREEN}All checks passed!${NC}"
        store_metrics "healthy"
        CONSECUTIVE_FAILURES=0
    else
        echo -e "\n${RED}$FAILED_CHECKS/$TOTAL_CHECKS checks failed!${NC}"
        store_metrics "unhealthy"
        CONSECUTIVE_FAILURES=$((CONSECUTIVE_FAILURES + 1))
        
        if [ $CONSECUTIVE_FAILURES -ge $MAX_FAILURES ]; then
            send_alert "Health check failed $CONSECUTIVE_FAILURES times in a row!"
        fi
    fi
    
    echo "----------------------------------------"
}

# Main loop
main() {
    CONSECUTIVE_FAILURES=0
    
    while true; do
        run_health_checks
        sleep $CHECK_INTERVAL
    done
}

# Run as a one-off check if --once flag is provided
if [ "$1" = "--once" ]; then
    run_health_checks
else
    main
fi