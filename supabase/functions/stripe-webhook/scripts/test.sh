#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
MIN_COVERAGE=80
TIMEOUT=30000

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

# Run linting
run_lint() {
    print_header "Running linter"
    
    deno lint
    
    if [ $? -ne 0 ]; then
        print_error "Linting failed"
        exit 1
    fi
    
    echo "Linting passed"
}

# Run type checking
run_type_check() {
    print_header "Running type check"
    
    deno check *.ts **/*.ts
    
    if [ $? -ne 0 ]; then
        print_error "Type checking failed"
        exit 1
    fi
    
    echo "Type checking passed"
}

# Run tests with coverage
run_tests() {
    print_header "Running tests"
    
    # Create coverage directory if it doesn't exist
    mkdir -p coverage
    
    # Run tests with coverage
    deno test \
        --allow-env \
        --allow-net \
        --allow-read \
        --coverage=coverage \
        --timeout=$TIMEOUT
    
    if [ $? -ne 0 ]; then
        print_error "Tests failed"
        exit 1
    fi
    
    echo "All tests passed"
}

# Generate and check coverage report
check_coverage() {
    print_header "Checking test coverage"
    
    # Generate coverage report
    deno coverage coverage
    
    # Extract coverage percentage
    coverage=$(deno coverage coverage | grep "cover:" | awk '{print $2}' | sed 's/%//')
    
    echo "Coverage: $coverage%"
    
    # Check if coverage meets minimum requirement
    if (( $(echo "$coverage < $MIN_COVERAGE" | bc -l) )); then
        print_error "Coverage ($coverage%) is below minimum required ($MIN_COVERAGE%)"
        exit 1
    fi
    
    echo "Coverage check passed"
}

# Clean up previous coverage data
cleanup() {
    print_header "Cleaning up"
    
    rm -rf coverage
    
    echo "Cleanup complete"
}

# Main script
main() {
    # Clean up first
    cleanup
    
    # Run all checks
    run_lint
    run_type_check
    run_tests
    check_coverage
    
    print_header "All checks passed! 🎉"
}

# Run main function
main