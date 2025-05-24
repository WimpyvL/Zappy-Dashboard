#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
CONCURRENT_USERS=10
TOTAL_REQUESTS=1000
RAMP_UP_TIME=30
TEST_DURATION=300
WEBHOOK_URL=""
LOG_FILE=".logs/load-test.log"
REPORT_DIR=".logs/load-test-reports"
EVENT_TYPES=(
    "payment_intent.succeeded"
    "payment_intent.payment_failed"
    "customer.subscription.created"
    "customer.subscription.updated"
)

# Initialize directories
mkdir -p .logs/load-test-reports

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Generate test webhook payload
generate_payload() {
    local event_type=${EVENT_TYPES[$RANDOM % ${#EVENT_TYPES[@]}]}
    local event_id="evt_$(openssl rand -hex 12)"
    
    cat << EOF
{
    "id": "$event_id",
    "type": "$event_type",
    "created": $(date +%s),
    "data": {
        "object": {
            "id": "pi_$(openssl rand -hex 12)",
            "amount": $((RANDOM % 10000 + 1000)),
            "currency": "usd",
            "status": "succeeded"
        }
    }
}
EOF
}

# Generate webhook signature
generate_signature() {
    local payload=$1
    local timestamp=$(date +%s)
    local signed_payload="${timestamp}.${payload}"
    
    echo "t=${timestamp},v1=$(echo -n "$signed_payload" | openssl sha256 -hmac "$STRIPE_WEBHOOK_SECRET" | cut -d' ' -f2)"
}

# Send webhook request
send_webhook() {
    local payload=$(generate_payload)
    local signature=$(generate_signature "$payload")
    
    curl -s -o /dev/null -w "%{http_code},%{time_total},%{size_download}\n" \
        -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $signature" \
        -d "$payload"
}

# Run single user test
run_user_test() {
    local user_id=$1
    local requests_per_user=$((TOTAL_REQUESTS / CONCURRENT_USERS))
    local results_file=".logs/load-test-reports/user_${user_id}_results.csv"
    
    echo "status_code,response_time,response_size" > "$results_file"
    
    for ((i=1; i<=requests_per_user; i++)); do
        send_webhook >> "$results_file"
        sleep 0.$(($RANDOM % 10))  # Random delay between requests
    done
}

# Generate test report
generate_report() {
    local report_file="$REPORT_DIR/report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Load Test Report"
        echo "================"
        echo
        echo "Test Configuration:"
        echo "- Concurrent Users: $CONCURRENT_USERS"
        echo "- Total Requests: $TOTAL_REQUESTS"
        echo "- Test Duration: $TEST_DURATION seconds"
        echo
        
        echo "Response Time Statistics:"
        awk -F',' '
            NR>1 {
                sum+=$2; 
                sumsq+=$2*$2;
                if(NR==2 || $2<min) min=$2;
                if(NR==2 || $2>max) max=$2;
            }
            END {
                avg=sum/(NR-1);
                std=sqrt(sumsq/(NR-1) - avg*avg);
                p95=percentile(95);
                p99=percentile(99);
                print "- Min: " min " sec";
                print "- Max: " max " sec";
                print "- Avg: " avg " sec";
                print "- Std Dev: " std " sec";
                print "- P95: " p95 " sec";
                print "- P99: " p99 " sec";
            }
        ' .logs/load-test-reports/user_*_results.csv
        
        echo
        echo "Response Status Codes:"
        awk -F',' '
            NR>1 {codes[$1]++}
            END {
                for (code in codes) 
                    print "- " code ": " codes[code]
            }
        ' .logs/load-test-reports/user_*_results.csv
        
        echo
        echo "Throughput:"
        awk -F',' '
            END {
                total=NR-1;
                duration='"$TEST_DURATION"';
                print "- Requests/sec: " total/duration;
            }
        ' .logs/load-test-reports/user_*_results.csv
        
    } > "$report_file"
    
    log "${GREEN}Test report generated: $report_file${NC}"
}

# Monitor system resources
monitor_resources() {
    while true; do
        top -b -n 1 | head -n 5 >> "$LOG_FILE"
        sleep 5
    done
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --users N        Number of concurrent users (default: 10)"
    echo "  --requests N     Total number of requests (default: 1000)"
    echo "  --duration N     Test duration in seconds (default: 300)"
    echo "  --ramp-up N     Ramp-up time in seconds (default: 30)"
    echo "  --url URL       Webhook URL to test"
    echo "  --help          Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --users)
                CONCURRENT_USERS="$2"
                shift 2
                ;;
            --requests)
                TOTAL_REQUESTS="$2"
                shift 2
                ;;
            --duration)
                TEST_DURATION="$2"
                shift 2
                ;;
            --ramp-up)
                RAMP_UP_TIME="$2"
                shift 2
                ;;
            --url)
                WEBHOOK_URL="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
    
    if [ -z "$WEBHOOK_URL" ]; then
        log "${RED}Webhook URL is required${NC}"
        exit 1
    fi
}

# Main load test process
main() {
    log "Starting load test..."
    
    # Start resource monitoring
    monitor_resources &
    MONITOR_PID=$!
    
    # Run user tests
    for ((i=1; i<=CONCURRENT_USERS; i++)); do
        log "Starting user $i..."
        run_user_test $i &
        
        if [ $i -lt $CONCURRENT_USERS ]; then
            sleep $(echo "scale=2; $RAMP_UP_TIME/$CONCURRENT_USERS" | bc)
        fi
    done
    
    # Wait for all tests to complete
    wait
    
    # Stop resource monitoring
    kill $MONITOR_PID
    
    # Generate report
    generate_report
    
    log "${GREEN}Load test completed${NC}"
}

# Error handling
set -e
trap 'log "${RED}Error occurred. Check logs for details.${NC}"' ERR

# Run main process
parse_args "$@"
main