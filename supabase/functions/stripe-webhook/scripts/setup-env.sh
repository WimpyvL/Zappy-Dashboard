#!/bin/bash

# Set default values for testing
DEFAULT_STRIPE_SECRET="sk_test_mock"
DEFAULT_WEBHOOK_SECRET="whsec_mock"
DEFAULT_SUPABASE_URL="http://localhost:54321"
DEFAULT_SERVICE_KEY="mock_service_key"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check for required tools
check_dependencies() {
    print_header "Checking dependencies"
    
    local missing_deps=0
    
    if ! command -v deno &> /dev/null; then
        print_error "deno is not installed"
        missing_deps=1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "node is not installed"
        missing_deps=1
    fi
    
    if ! command -v supabase &> /dev/null; then
        print_error "supabase CLI is not installed"
        missing_deps=1
    fi
    
    if [ $missing_deps -eq 1 ]; then
        exit 1
    fi
    
    echo "All dependencies found"
}

# Set up environment variables
setup_environment() {
    print_header "Setting up environment variables"
    
    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Created new .env file from .env.example"
    fi
    
    # Source existing .env file if it exists
    if [ -f .env ]; then
        source .env
    fi
    
    # Set environment variables if they're not already set
    if [ -z "$STRIPE_SECRET_KEY" ]; then
        export STRIPE_SECRET_KEY=$DEFAULT_STRIPE_SECRET
        print_warning "Using default Stripe secret key"
    fi
    
    if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
        export STRIPE_WEBHOOK_SECRET=$DEFAULT_WEBHOOK_SECRET
        print_warning "Using default webhook secret"
    fi
    
    if [ -z "$SUPABASE_URL" ]; then
        export SUPABASE_URL=$DEFAULT_SUPABASE_URL
        print_warning "Using default Supabase URL"
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        export SUPABASE_SERVICE_ROLE_KEY=$DEFAULT_SERVICE_KEY
        print_warning "Using default service role key"
    fi
    
    echo "Environment variables set"
}

# Install dependencies
install_dependencies() {
    print_header "Installing dependencies"
    
    # Install Node.js dependencies for debugging tools
    cd scripts
    npm install
    cd ..
    
    echo "Dependencies installed"
}

# Set up development environment
setup_development() {
    print_header "Setting up development environment"
    
    # Start Supabase if not running
    if ! supabase status &> /dev/null; then
        echo "Starting Supabase..."
        supabase start
    fi
    
    # Create test tables if they don't exist
    echo "Applying database migrations..."
    supabase migration up
    
    echo "Development environment ready"
}

# Main script
main() {
    print_header "Setting up Stripe webhook development environment"
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_development
    
    print_header "Setup complete!"
    echo "You can now:"
    echo "1. Run 'npm run chrome:debug' to start Chrome in debug mode"
    echo "2. Run 'npm start' to connect to Chrome debugging"
    echo "3. Run 'node test-webhook.js paymentSuccess' to send test webhooks"
}

# Run main function
main