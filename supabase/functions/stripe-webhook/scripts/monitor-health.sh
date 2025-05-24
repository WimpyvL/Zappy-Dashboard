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
LOG_FILE=".logs/health-check.log"
ALERT_FILE=".logs/alerts.log"
METRICS_FILE=".metrics/health.prom"

# Initialize directories
mkdir -p .logs .metrics
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Send alert
send_alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date +%s)
    
    # Log alert
    echo "[$severity] $message" >> "$ALERT_FILE"
    
    # Send to alertmanager if configured
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        curl -s -X POST "$ALERT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"severity\": \"$severity\",
                \"message\": \"$message\",
                \"timestamp\": $timestamp
            }"
    fi
    
    # Send email for critical alerts
    if [ "$severity" = "critical" ] && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "[CRITICAL] Webhook Health Alert" "$ALERT_EMAIL"
    fi
}

# Update Prometheus metrics
update_metrics() {
    local name=$1
    local value=$2
    local timestamp=$(date +%s)
    
    echo "# HELP $name Webhook health check metric" > "$METRICS_FILE"
    echo "# TYPE $name gauge" >> "$METRICS_FILE"
    echo "${name}{} ${value} ${timestamp}000" >> "$METRICS_FILE"
}

# Check system resources
check_resources() {
    log "Checking system resources..."
    local failed=0
    
    # Check memory usage
    local memory_usage=$(free | awk '/Mem:/ {print int($3/$2 * 100)}')
    update_metrics "webhook_memory_usage_percent" "$memory_usage"
    
    if [ "$memory_usage" -gt 90 ]; then
        send_alert "critical" "Memory usage is ${memory_usage}%"
        ((failed++))
    elif [ "$memory_usage" -gt 80 ]; then
        send_alert "warning" "Memory usage is ${memory_usage}%"
    fi
    
    # Check disk usage
    local disk_usage=$(df -h / | awk 'NR==2 {print int($5)}')
    update_metrics "webhook_disk_usage_percent" "$disk_usage"
    
    if [ "$disk_usage" -gt 90 ]; then
        send_alert "critical" "Disk usage is ${disk_usage}%"
        ((failed++))
    elif [ "$disk_usage" -gt 80 ]; then
        send_alert "warning" "Disk usage is ${disk_usage}%"
    fi
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk -F, '{print int($1)}')
    update_metrics "webhook_cpu_load" "$cpu_load"
    
    if [ "$cpu_load" -gt 5 ]; then
        send_alert "critical" "CPU load is ${cpu_load}"
        ((failed++))
    elif [ "$cpu_load" -gt 3 ]; then
        send_alert "warning" "CPU load is ${cpu_load}"
    fi
    
    return $failed
}

# Check monitoring services
check_services() {
    log "Checking monitoring services..."
    local failed=0
    
    local services=(
        "prometheus:9090"
        "grafana:3000"
        "alertmanager:9093"
    )
    
    for service in "${services[@]}"; do
        local host=${service%:*}
        local port=${service#*:}
        
        if ! nc -z localhost "$port"; then
            send_alert "critical" "$host is not responding on port $port"
            ((failed++))
        fi
    done
    
    return $failed
}

# Check webhook endpoint
check_webhook() {
    log "Checking webhook endpoint..."
    local failed=0
    
    # Test endpoint health
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL/health")
    update_metrics "webhook_health_check_status" "$response"
    
    if [ "$response" != "200" ]; then
        send_alert "critical" "Webhook health check failed with status $response"
        ((failed++))
    fi
    
    return $failed
}

# Check metrics collection
check_metrics() {
    log "Checking metrics collection..."
    local failed=0
    
    # Query latest metrics
    local response=$(curl -s "http://localhost:9090/api/v1/query?query=up")
    
    if ! echo "$response" | grep -q '"status":"success"'; then
        send_alert "critical" "Metrics collection failed"
        ((failed++))
    fi
    
    return $failed
}

# Generate health report
generate_report() {
    local report_file=".logs/health_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Health Check Report"
        echo "==================="
        echo "Generated: $(date)"
        echo
        echo "System Status"
        echo "-------------"
        echo "Memory Usage: ${memory_usage}%"
        echo "Disk Usage: ${disk_usage}%"
        echo "CPU Load: ${cpu_load}"
        echo
        echo "Service Status"
        echo "--------------"
        docker-compose ps
        echo
        echo "Recent Alerts"
        echo "-------------"
        tail -n 10 "$ALERT_FILE"
        echo
        echo "Metrics Status"
        echo "--------------"
        curl -s "http://localhost:9090/api/v1/targets" | jq .
        
    } > "$report_file"
    
    log "Report generated: $report_file"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --all         Run all checks"
    echo "  --resources   Check system resources"
    echo "  --services    Check monitoring services"
    echo "  --webhook     Check webhook endpoint"
    echo "  --metrics     Check metrics collection"
    echo "  --report      Generate health report"
    echo "  --help        Show this help message"
}

# Main health check
main() {
    local failed=0
    
    if [ "$CHECK_RESOURCES" = true ]; then
        check_resources
        ((failed+=$?))
    fi
    
    if [ "$CHECK_SERVICES" = true ]; then
        check_services
        ((failed+=$?))
    fi
    
    if [ "$CHECK_WEBHOOK" = true ]; then
        check_webhook
        ((failed+=$?))
    fi
    
    if [ "$CHECK_METRICS" = true ]; then
        check_metrics
        ((failed+=$?))
    fi
    
    if [ "$GENERATE_REPORT" = true ]; then
        generate_report
    fi
    
    if [ $failed -gt 0 ]; then
        log "${RED}Health check failed with $failed errors${NC}"
        exit 1
    else
        log "${GREEN}Health check passed${NC}"
        exit 0
    fi
}

# Parse command line arguments
CHECK_RESOURCES=false
CHECK_SERVICES=false
CHECK_WEBHOOK=false
CHECK_METRICS=false
GENERATE_REPORT=false

case $1 in
    --all)
        CHECK_RESOURCES=true
        CHECK_SERVICES=true
        CHECK_WEBHOOK=true
        CHECK_METRICS=true
        GENERATE_REPORT=true
        ;;
    --resources)
        CHECK_RESOURCES=true
        ;;
    --services)
        CHECK_SERVICES=true
        ;;
    --webhook)
        CHECK_WEBHOOK=true
        ;;
    --metrics)
        CHECK_METRICS=true
        ;;
    --report)
        GENERATE_REPORT=true
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        show_help
        exit 1
        ;;
esac

# Run health check
main