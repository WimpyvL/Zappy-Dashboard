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
LOG_FILE=".logs/webhook_tests.log"
TEST_RESULTS_DIR=".logs/test_results"

# Initialize directories
mkdir -p "$TEST_RESULTS_DIR"

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Test event types
TEST_EVENTS=(
    "payment_intent.succeeded"
    "payment_intent.payment_failed"
    "customer.subscription.created"
    "customer.subscription.updated"
    "customer.subscription.deleted"
    "invoice.payment_succeeded"
    "invoice.payment_failed"
    "charge.succeeded"
    "charge.failed"
    "refund.created"
)

# Generate test webhook payload
generate_payload() {
    local event_type=$1
    local timestamp=$(date +%s)
    local event_id="evt_test_$(openssl rand -hex 10)"
    local object_id="pi_test_$(openssl rand -hex 10)"
    
    case $event_type in
        payment_intent.*)
            cat << EOF
{
    "id": "$event_id",
    "type": "$event_type",
    "created": $timestamp,
    "data": {
        "object": {
            "id": "$object_id",
            "amount": 1000,
            "currency": "usd",
            "status": "${event_type#*.}",
            "client_secret": "pi_test_secret_$(openssl rand -hex 10)",
            "customer": "cus_test_$(openssl rand -hex 10)"
        }
    }
}
EOF
            ;;
        customer.subscription.*)
            cat << EOF
{
    "id": "$event_id",
    "type": "$event_type",
    "created": $timestamp,
    "data": {
        "object": {
            "id": "sub_test_$(openssl rand -hex 10)",
            "customer": "cus_test_$(openssl rand -hex 10)",
            "status": "active",
            "current_period_end": $((timestamp + 2592000)),
            "items": {
                "data": [
                    {
                        "id": "si_test_$(openssl rand -hex 10)",
                        "price": {
                            "id": "price_test_$(openssl rand -hex 10)",
                            "product": "prod_test_$(openssl rand -hex 10)"
                        }
                    }
                ]
            }
        }
    }
}
EOF
            ;;
        *)
            cat << EOF
{
    "id": "$event_id",
    "type": "$event_type",
    "created": $timestamp,
    "data": {
        "object": {
            "id": "$object_id",
            "created": $timestamp
        }
    }
}
EOF
            ;;
    esac
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
    local payload=$1
    local signature=$2
    
    curl -s -o "$TEST_RESULTS_DIR/response.json" -w "%{http_code}" \
        -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $signature" \
        -d "$payload"
}

# Run basic test suite
run_basic_tests() {
    log "Running basic test suite..."
    
    for event_type in "${TEST_EVENTS[@]}"; do
        log "Testing event: $event_type"
        
        local payload=$(generate_payload "$event_type")
        local signature=$(generate_signature "$payload")
        local response=$(send_webhook "$payload" "$signature")
        
        if [ "$response" -eq 200 ]; then
            echo -e "${GREEN}✓${NC} $event_type: Success"
        else
            echo -e "${RED}✗${NC} $event_type: Failed (HTTP $response)"
            cat "$TEST_RESULTS_DIR/response.json"
        fi
    done
}

# Run error test cases
run_error_tests() {
    log "Running error test cases..."
    
    # Invalid signature
    log "Testing invalid signature..."
    local payload=$(generate_payload "payment_intent.succeeded")
    local response=$(send_webhook "$payload" "invalid_signature")
    
    if [ "$response" -eq 401 ]; then
        echo -e "${GREEN}✓${NC} Invalid signature test passed"
    else
        echo -e "${RED}✗${NC} Invalid signature test failed"
    fi
    
    # Invalid payload
    log "Testing invalid payload..."
    local response=$(send_webhook "invalid_json" "$(generate_signature "invalid_json")")
    
    if [ "$response" -eq 400 ]; then
        echo -e "${GREEN}✓${NC} Invalid payload test passed"
    else
        echo -e "${RED}✗${NC} Invalid payload test failed"
    fi
}

# Run load test
run_load_test() {
    local concurrent_requests=$1
    local total_requests=$2
    
    log "Running load test ($total_requests requests, $concurrent_requests concurrent)..."
    
    local payload=$(generate_payload "payment_intent.succeeded")
    local signature=$(generate_signature "$payload")
    
    seq "$total_requests" | xargs -n1 -P"$concurrent_requests" -I{} \
        curl -s -o /dev/null -w "%{http_code}\n" \
            -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -H "Stripe-Signature: $signature" \
            -d "$payload" | \
        sort | uniq -c
}

# Generate test report
generate_report() {
    local report_file="$TEST_RESULTS_DIR/test_report_$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Webhook Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
    </style>
</head>
<body>
    <h1>Webhook Test Report</h1>
    <p>Generated: $(date)</p>
    
    <h2>Test Results</h2>
    <pre>$(cat "$LOG_FILE")</pre>
</body>
</html>
EOF

    log "Report generated: $report_file"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --url URL      Webhook URL to test"
    echo "  --basic        Run basic test suite"
    echo "  --errors       Run error test cases"
    echo "  --load N M     Run load test with N concurrent requests, M total"
    echo "  --report       Generate HTML report"
    echo "  --help         Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            WEBHOOK_URL="$2"
            shift 2
            ;;
        --basic)
            RUN_BASIC=true
            shift
            ;;
        --errors)
            RUN_ERRORS=true
            shift
            ;;
        --load)
            CONCURRENT_REQUESTS="$2"
            TOTAL_REQUESTS="$3"
            RUN_LOAD=true
            shift 3
            ;;
        --report)
            GENERATE_REPORT=true
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

# Validate configuration
if [ -z "$WEBHOOK_URL" ]; then
    log "${RED}Webhook URL is required${NC}"
    exit 1
fi

if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    log "${RED}STRIPE_WEBHOOK_SECRET is not set${NC}"
    exit 1
fi

# Main test process
main() {
    log "Starting webhook tests..."
    
    if [ "$RUN_BASIC" = true ]; then
        run_basic_tests
    fi
    
    if [ "$RUN_ERRORS" = true ]; then
        run_error_tests
    fi
    
    if [ "$RUN_LOAD" = true ]; then
        run_load_test "$CONCURRENT_REQUESTS" "$TOTAL_REQUESTS"
    fi
    
    if [ "$GENERATE_REPORT" = true ]; then
        generate_report
    fi
    
    log "Tests completed"
}

# Run tests
main