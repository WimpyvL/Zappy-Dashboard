#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
METRICS_DIR=".metrics"
LOG_DIR=".logs"
ALERT_THRESHOLD_ERRORS=10
ALERT_THRESHOLD_LATENCY=1000
CHECK_INTERVAL=60
DASHBOARD_PORT=3000

# Initialize directories
mkdir -p "$METRICS_DIR" "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/monitor.log"
}

# Collect metrics
collect_metrics() {
    local timestamp=$(date +%s)
    local metrics_file="$METRICS_DIR/metrics_${timestamp}.json"
    
    # Collect system metrics
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}')
    local memory_usage=$(free | grep Mem | awk '{print ($3/$2 * 100)}')
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | tr -d '%')
    
    # Collect application metrics
    local error_count=$(grep -c "ERROR" "$LOG_DIR"/*.log)
    local event_count=$(grep -c "Event processed" "$LOG_DIR"/*.log)
    local avg_latency=$(awk '/Processing time:/ {sum+=$3; count++} END {print sum/count}' "$LOG_DIR"/*.log)
    
    # Create metrics JSON
    cat > "$metrics_file" << EOF
{
    "timestamp": $timestamp,
    "system": {
        "cpu_usage": $cpu_usage,
        "memory_usage": $memory_usage,
        "disk_usage": $disk_usage
    },
    "application": {
        "error_count": $error_count,
        "event_count": $event_count,
        "avg_latency": $avg_latency
    }
}
EOF
}

# Check alert conditions
check_alerts() {
    local metrics_file=$1
    
    # Read metrics
    local error_count=$(jq -r '.application.error_count' "$metrics_file")
    local avg_latency=$(jq -r '.application.avg_latency' "$metrics_file")
    local cpu_usage=$(jq -r '.system.cpu_usage' "$metrics_file")
    local memory_usage=$(jq -r '.system.memory_usage' "$metrics_file")
    
    local alerts=()
    
    # Check error threshold
    if [ "$error_count" -gt "$ALERT_THRESHOLD_ERRORS" ]; then
        alerts+=("High error count: $error_count")
    fi
    
    # Check latency threshold
    if (( $(echo "$avg_latency > $ALERT_THRESHOLD_LATENCY" | bc -l) )); then
        alerts+=("High latency: ${avg_latency}ms")
    fi
    
    # Check system resources
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        alerts+=("High CPU usage: ${cpu_usage}%")
    fi
    
    if (( $(echo "$memory_usage > 80" | bc -l) )); then
        alerts+=("High memory usage: ${memory_usage}%")
    fi
    
    # Send alerts if any
    if [ ${#alerts[@]} -gt 0 ]; then
        send_alerts "${alerts[@]}"
    fi
}

# Send alerts
send_alerts() {
    local alerts=("$@")
    
    log "${RED}ALERTS:${NC}"
    for alert in "${alerts[@]}"; do
        log "- $alert"
    done
    
    # Send to monitoring system
    if [ -n "$ALERT_WEBHOOK_URL" ]; then
        local alert_json=$(printf '%s\n' "${alerts[@]}" | jq -R . | jq -s .)
        curl -X POST "$ALERT_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"alerts\":$alert_json}"
    fi
}

# Generate HTML dashboard
generate_dashboard() {
    local dashboard="$METRICS_DIR/dashboard.html"
    
    cat > "$dashboard" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Webhook Monitor Dashboard</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .chart { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Webhook Monitor Dashboard</h1>
    <div id="errorChart" class="chart"></div>
    <div id="latencyChart" class="chart"></div>
    <div id="systemChart" class="chart"></div>
    
    <script>
        function updateCharts() {
            fetch('/metrics')
                .then(response => response.json())
                .then(data => {
                    // Update charts with new data
                    Plotly.newPlot('errorChart', [{
                        x: data.map(d => new Date(d.timestamp * 1000)),
                        y: data.map(d => d.application.error_count),
                        type: 'scatter',
                        name: 'Errors'
                    }], {title: 'Error Count'});
                    
                    Plotly.newPlot('latencyChart', [{
                        x: data.map(d => new Date(d.timestamp * 1000)),
                        y: data.map(d => d.application.avg_latency),
                        type: 'scatter',
                        name: 'Latency (ms)'
                    }], {title: 'Average Latency'});
                    
                    Plotly.newPlot('systemChart', [
                        {
                            x: data.map(d => new Date(d.timestamp * 1000)),
                            y: data.map(d => d.system.cpu_usage),
                            type: 'scatter',
                            name: 'CPU Usage'
                        },
                        {
                            x: data.map(d => new Date(d.timestamp * 1000)),
                            y: data.map(d => d.system.memory_usage),
                            type: 'scatter',
                            name: 'Memory Usage'
                        }
                    ], {title: 'System Resources'});
                });
        }
        
        // Update every minute
        setInterval(updateCharts, 60000);
        updateCharts();
    </script>
</body>
</html>
EOF

    # Start simple HTTP server
    python3 -m http.server "$DASHBOARD_PORT" --directory "$METRICS_DIR" &
    log "${GREEN}Dashboard available at http://localhost:$DASHBOARD_PORT/dashboard.html${NC}"
}

# Clean old metrics
clean_old_metrics() {
    find "$METRICS_DIR" -name "metrics_*.json" -mtime +7 -delete
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --dashboard     Start monitoring dashboard"
    echo "  --collect      Collect metrics once"
    echo "  --interval N   Set check interval in seconds"
    echo "  --help         Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dashboard)
                generate_dashboard
                exit 0
                ;;
            --collect)
                collect_metrics
                exit 0
                ;;
            --interval)
                CHECK_INTERVAL="$2"
                shift 2
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

# Main monitoring loop
main() {
    log "Starting monitoring..."
    
    while true; do
        collect_metrics
        check_alerts "$METRICS_DIR/metrics_$(date +%s).json"
        clean_old_metrics
        sleep "$CHECK_INTERVAL"
    done
}

# Run monitoring
parse_args "$@"
main