#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="http://localhost:54321/functions/v1/stripe-webhook"
METRICS_DIR="../.metrics"
LOGS_DIR="../.logs"
MAINTENANCE_LOCK="$METRICS_DIR/.maintenance.lock"
ALERT_THRESHOLD=3

# Helper functions
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Check if maintenance is already running
check_lock() {
    if [ -f "$MAINTENANCE_LOCK" ]; then
        if ps -p $(cat "$MAINTENANCE_LOCK") > /dev/null; then
            print_error "Maintenance is already running"
            exit 1
        else
            rm "$MAINTENANCE_LOCK"
        fi
    fi
    echo $$ > "$MAINTENANCE_LOCK"
}

# Clean up lock file on exit
cleanup() {
    rm -f "$MAINTENANCE_LOCK"
}
trap cleanup EXIT

# Create required directories
setup_directories() {
    mkdir -p "$METRICS_DIR"
    mkdir -p "$LOGS_DIR"
}

# Run database maintenance tasks
run_db_maintenance() {
    print_header "Running database maintenance"

    # Run maintenance SQL script
    psql -f maintain-db.sql
    
    if [ $? -ne 0 ]; then
        print_error "Database maintenance failed"
        return 1
    fi

    echo "Database maintenance completed"
}

# Check system health
check_health() {
    print_header "Checking system health"
    
    local unhealthy=0

    # Check webhook endpoint
    curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL" | grep -q "405"
    if [ $? -ne 0 ]; then
        print_error "Webhook endpoint is not responding correctly"
        ((unhealthy++))
    fi

    # Check database connectivity
    node monitor-db.js --check-connection
    if [ $? -ne 0 ]; then
        print_error "Database connectivity check failed"
        ((unhealthy++))
    fi

    # Check disk space
    local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        print_warning "Disk usage is high: ${disk_usage}%"
        ((unhealthy++))
    fi

    # Check log file sizes
    find "$LOGS_DIR" -type f -size +100M | while read file; do
        print_warning "Large log file: $file"
        ((unhealthy++))
    done

    return $unhealthy
}

# Analyze metrics
analyze_metrics() {
    print_header "Analyzing metrics"

    # Run database metrics collection
    node monitor-db.js

    # Analyze logs
    node analyze-logs.js

    # Run error tests
    bash test-errors.sh --quiet

    echo "Metrics analysis completed"
}

# Generate reports
generate_reports() {
    print_header "Generating reports"

    local report_date=$(date +%Y-%m-%d)
    local report_file="$METRICS_DIR/maintenance-report-${report_date}.txt"

    {
        echo "Maintenance Report - ${report_date}"
        echo "==============================="
        echo ""
        
        echo "Database Metrics:"
        node monitor-db.js --report
        echo ""
        
        echo "Error Analysis:"
        node analyze-logs.js --summary
        echo ""
        
        echo "Performance Summary:"
        tail -n 100 "$LOGS_DIR/webhook.log" | \
            grep "responseTime" | \
            awk '{sum+=$2; count++} END {print "Average response time: " sum/count "ms"}'
        echo ""
        
        echo "Alerts:"
        if [ -f "$METRICS_DIR/alerts.json" ]; then
            cat "$METRICS_DIR/alerts.json"
        else
            echo "No active alerts"
        fi
    } > "$report_file"

    echo "Report generated: $report_file"

    # Send report if there are warnings
    if grep -q "WARNING\|ERROR" "$report_file"; then
        print_warning "Issues found in report"
        # TODO: Implement report sending (email/Slack)
    fi
}

# Rotate logs
rotate_logs() {
    print_header "Rotating logs"

    # Compress logs older than 7 days
    find "$LOGS_DIR" -type f -name "*.log" -mtime +7 -exec gzip {} \;

    # Delete logs older than 30 days
    find "$LOGS_DIR" -type f -name "*.log.gz" -mtime +30 -delete

    echo "Log rotation completed"
}

# Main maintenance workflow
main() {
    print_header "Starting maintenance tasks"

    # Check for running maintenance
    check_lock
    
    # Ensure directories exist
    setup_directories
    
    # Run all maintenance tasks
    run_db_maintenance
    check_health
    analyze_metrics
    generate_reports
    rotate_logs

    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_header "Maintenance completed successfully"
    else
        print_error "Maintenance completed with errors"
    fi

    return $exit_code
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --check-only)
            check_health
            exit $?
            ;;
        --analyze-only)
            analyze_metrics
            exit $?
            ;;
        --report-only)
            generate_reports
            exit $?
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
    shift
done

# Run main function
main