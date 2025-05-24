#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_DIR=".logs"
REPORT_DIR=".logs/reports"
METRICS_DIR=".metrics"
DEFAULT_DAYS=7
ALERT_THRESHOLD_ERRORS=10
ALERT_THRESHOLD_LATENCY=1000

# Initialize directories
mkdir -p "$REPORT_DIR" "$METRICS_DIR"

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Parse logs for event types
analyze_events() {
    log "Analyzing event types..."
    
    echo "Event Type Distribution:"
    echo "----------------------"
    grep "Event type:" "$LOG_DIR"/*.log | \
        awk -F': ' '{print $2}' | \
        sort | uniq -c | sort -nr | \
        while read -r count type; do
            printf "%-30s %5d\n" "$type" "$count"
        done
}

# Analyze error rates
analyze_errors() {
    log "Analyzing errors..."
    
    echo "Error Distribution:"
    echo "-----------------"
    grep "ERROR" "$LOG_DIR"/*.log | \
        awk -F'ERROR: ' '{print $2}' | \
        sort | uniq -c | sort -nr | head -n 10 | \
        while read -r count error; do
            printf "%-50s %5d\n" "$error" "$count"
        done
    
    # Calculate error rate
    local total_requests=$(grep -c "Request received" "$LOG_DIR"/*.log)
    local total_errors=$(grep -c "ERROR" "$LOG_DIR"/*.log)
    local error_rate=0
    
    if [ "$total_requests" -gt 0 ]; then
        error_rate=$(echo "scale=2; $total_errors * 100 / $total_requests" | bc)
    fi
    
    echo
    echo "Total Requests: $total_requests"
    echo "Total Errors: $total_errors"
    echo "Error Rate: ${error_rate}%"
}

# Analyze response times
analyze_latency() {
    log "Analyzing response times..."
    
    echo "Response Time Statistics (ms):"
    echo "--------------------------"
    grep "Processing time:" "$LOG_DIR"/*.log | \
        awk '{print $NF}' | \
        sort -n | \
        awk '
            BEGIN {
                sum = 0
                count = 0
            }
            {
                sum += $1
                values[count++] = $1
                if($1 > max) max = $1
                if($1 < min || min == 0) min = $1
            }
            END {
                avg = sum/count
                if (count % 2) {
                    median = values[int(count/2)]
                } else {
                    median = (values[count/2-1] + values[count/2])/2
                }
                print "Min: " min
                print "Max: " max
                print "Avg: " avg
                print "Median: " median
                print "90th Percentile: " values[int(count*0.9)]
                print "95th Percentile: " values[int(count*0.95)]
                print "99th Percentile: " values[int(count*0.99)]
            }
        '
}

# Analyze traffic patterns
analyze_traffic() {
    log "Analyzing traffic patterns..."
    
    echo "Hourly Traffic Pattern:"
    echo "---------------------"
    grep "Request received" "$LOG_DIR"/*.log | \
        awk '{print $2}' | \
        awk -F':' '{print $1}' | \
        sort | uniq -c | \
        awk '{ printf "%02d:00 %s\n", $2, repeat("█", $1/10) }'
}

# Generate time-series metrics
generate_metrics() {
    log "Generating metrics..."
    
    local metrics_file="$METRICS_DIR/metrics_$(date +%Y%m%d_%H%M%S).json"
    
    # Calculate metrics
    local requests=$(grep -c "Request received" "$LOG_DIR"/*.log)
    local errors=$(grep -c "ERROR" "$LOG_DIR"/*.log)
    local avg_latency=$(grep "Processing time:" "$LOG_DIR"/*.log | \
        awk '{sum += $NF} END {print sum/NR}')
    
    # Create JSON
    cat > "$metrics_file" << EOF
{
    "timestamp": $(date +%s),
    "metrics": {
        "requests": $requests,
        "errors": $errors,
        "error_rate": $(echo "scale=4; $errors/$requests" | bc),
        "avg_latency": $avg_latency
    }
}
EOF

    log "Metrics saved to $metrics_file"
}

# Generate HTML report
generate_report() {
    local report_file="$REPORT_DIR/analysis_$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Log Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        .error { color: red; }
        .warning { color: orange; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Log Analysis Report</h1>
    <p>Generated: $(date)</p>
    
    <div class="section">
        <h2>Event Analysis</h2>
        <pre>$(analyze_events)</pre>
    </div>
    
    <div class="section">
        <h2>Error Analysis</h2>
        <pre>$(analyze_errors)</pre>
    </div>
    
    <div class="section">
        <h2>Performance Analysis</h2>
        <pre>$(analyze_latency)</pre>
    </div>
    
    <div class="section">
        <h2>Traffic Analysis</h2>
        <pre>$(analyze_traffic)</pre>
    </div>
</body>
</html>
EOF

    log "Report generated: $report_file"
}

# Check for issues
check_issues() {
    log "Checking for issues..."
    
    local issues=0
    
    # Check error rate
    local error_rate=$(grep -c "ERROR" "$LOG_DIR"/*.log)
    if [ "$error_rate" -gt "$ALERT_THRESHOLD_ERRORS" ]; then
        echo -e "${RED}High error rate detected: $error_rate errors${NC}"
        ((issues++))
    fi
    
    # Check response times
    local high_latency=$(grep "Processing time:" "$LOG_DIR"/*.log | \
        awk -v threshold="$ALERT_THRESHOLD_LATENCY" \
        '$NF > threshold {count++} END {print count}')
    
    if [ "$high_latency" -gt 0 ]; then
        echo -e "${YELLOW}$high_latency requests exceeded latency threshold${NC}"
        ((issues++))
    fi
    
    # Check for repeated errors
    local repeated_errors=$(grep "ERROR" "$LOG_DIR"/*.log | \
        sort | uniq -c | sort -nr | head -1)
    
    if [ "$(echo "$repeated_errors" | awk '{print $1}')" -gt 5 ]; then
        echo -e "${RED}Repeated error detected: $repeated_errors${NC}"
        ((issues++))
    fi
    
    return $issues
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --days N       Analyze last N days (default: 7)"
    echo "  --report       Generate HTML report"
    echo "  --metrics      Generate metrics JSON"
    echo "  --check        Check for issues"
    echo "  --help         Show this help message"
}

# Parse command line arguments
DAYS=$DEFAULT_DAYS
GENERATE_HTML=false
GENERATE_METRICS=false
CHECK_ISSUES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --days)
            DAYS="$2"
            shift 2
            ;;
        --report)
            GENERATE_HTML=true
            shift
            ;;
        --metrics)
            GENERATE_METRICS=true
            shift
            ;;
        --check)
            CHECK_ISSUES=true
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

# Main analysis process
main() {
    log "Starting log analysis..."
    
    # Filter logs by date
    find "$LOG_DIR" -name "*.log" -mtime -"$DAYS" -exec cat {} + > "$LOG_DIR/analysis_temp.log"
    
    if [ "$GENERATE_HTML" = true ]; then
        generate_report
    else
        echo -e "\n=== Event Analysis ===\n"
        analyze_events
        
        echo -e "\n=== Error Analysis ===\n"
        analyze_errors
        
        echo -e "\n=== Performance Analysis ===\n"
        analyze_latency
        
        echo -e "\n=== Traffic Analysis ===\n"
        analyze_traffic
    fi
    
    if [ "$GENERATE_METRICS" = true ]; then
        generate_metrics
    fi
    
    if [ "$CHECK_ISSUES" = true ]; then
        check_issues
    fi
    
    rm "$LOG_DIR/analysis_temp.log"
    
    log "Analysis completed"
}

# Run analysis
main