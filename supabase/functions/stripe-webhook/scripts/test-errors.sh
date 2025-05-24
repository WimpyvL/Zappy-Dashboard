#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_URL="http://localhost:54321/functions/v1/stripe-webhook"
MOCK_SIGNATURE="t=1234,v1=mock"

# Helper functions
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

print_result() {
    local status=$1
    local expected=$2
    if [ $status -eq $expected ]; then
        echo -e "${GREEN}✓ Test passed (Got expected status $status)${NC}"
    else
        echo -e "${RED}✗ Test failed (Expected $expected, got $status)${NC}"
    fi
}

# Test cases
test_missing_signature() {
    print_header "Testing missing signature"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"type":"test"}' \
        $WEBHOOK_URL)
    
    print_result $status 401
}

test_invalid_signature() {
    print_header "Testing invalid signature"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: invalid" \
        -d '{"type":"test"}' \
        $WEBHOOK_URL)
    
    print_result $status 401
}

test_invalid_json() {
    print_header "Testing invalid JSON"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $MOCK_SIGNATURE" \
        -d 'invalid json' \
        $WEBHOOK_URL)
    
    print_result $status 400
}

test_missing_event_type() {
    print_header "Testing missing event type"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $MOCK_SIGNATURE" \
        -d '{"id":"evt_123"}' \
        $WEBHOOK_URL)
    
    print_result $status 400
}

test_unsupported_event_type() {
    print_header "Testing unsupported event type"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $MOCK_SIGNATURE" \
        -d '{"type":"unsupported.event","id":"evt_123"}' \
        $WEBHOOK_URL)
    
    print_result $status 200  # Should be handled gracefully
}

test_missing_event_data() {
    print_header "Testing missing event data"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $MOCK_SIGNATURE" \
        -d '{"type":"payment_intent.succeeded","id":"evt_123"}' \
        $WEBHOOK_URL)
    
    print_result $status 400
}

test_invalid_payment_intent() {
    print_header "Testing invalid payment intent data"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Stripe-Signature: $MOCK_SIGNATURE" \
        -d '{
            "type":"payment_intent.succeeded",
            "id":"evt_123",
            "data": {
                "object": {
                    "id": "invalid_id"
                }
            }
        }' \
        $WEBHOOK_URL)
    
    print_result $status 400
}

test_method_not_allowed() {
    print_header "Testing invalid HTTP method"
    
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET \
        $WEBHOOK_URL)
    
    print_result $status 405
}

# Main script
main() {
    print_header "Running error scenario tests"
    
    test_missing_signature
    test_invalid_signature
    test_invalid_json
    test_missing_event_type
    test_unsupported_event_type
    test_missing_event_data
    test_invalid_payment_intent
    test_method_not_allowed
    
    print_header "Error testing complete"
}

# Run main function
main