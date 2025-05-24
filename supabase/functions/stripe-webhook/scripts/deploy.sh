#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="stripe-webhook"
ENVIRONMENT=${1:-"production"} # Default to production if no argument provided

# Print step with color
print_step() {
    echo -e "${GREEN}==> $1${NC}"
}

# Print warning with color
print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Print error with color
print_error() {
    echo -e "${RED}ERROR: $1${NC}"
}

# Check required tools
check_requirements() {
    print_step "Checking requirements..."
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed"
        exit 1
    }

    if ! command -v deno &> /dev/null; then
        print_error "Deno is not installed"
        exit 1
    }
}

# Validate environment variables
validate_env() {
    print_step "Validating environment..."
    
    required_vars=(
        "SUPABASE_ACCESS_TOKEN"
        "SUPABASE_PROJECT_ID"
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_error "$var is not set"
            exit 1
        fi
    done
}

# Run tests
run_tests() {
    print_step "Running tests..."
    
    if ! deno test --allow-all; then
        print_error "Tests failed"
        exit 1
    fi
}

# Build and validate function
build_function() {
    print_step "Building function..."
    
    # Check types
    if ! deno check **/*.ts; then
        print_error "Type check failed"
        exit 1
    }

    # Lint code
    if ! deno lint; then
        print_error "Linting failed"
        exit 1
    }
}

# Deploy function
deploy_function() {
    print_step "Deploying function to $ENVIRONMENT..."
    
    # Set environment-specific variables
    case $ENVIRONMENT in
        "production")
            ENV_SUFFIX=""
            ;;
        "staging")
            ENV_SUFFIX="-staging"
            ;;
        "development")
            ENV_SUFFIX="-dev"
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            exit 1
            ;;
    esac

    # Deploy function
    if ! supabase functions deploy "$FUNCTION_NAME$ENV_SUFFIX"; then
        print_error "Function deployment failed"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Wait for function to be ready
    sleep 5

    # Send test webhook
    if ! node scripts/test-webhook.js --verify; then
        print_warning "Deployment verification failed"
        print_warning "Please check logs and monitor for issues"
    fi
}

# Run database migrations
run_migrations() {
    print_step "Running database migrations..."
    
    if ! supabase db push; then
        print_error "Database migration failed"
        exit 1
    fi
}

# Update configuration
update_config() {
    print_step "Updating configuration..."
    
    # Update Stripe webhook endpoint
    WEBHOOK_URL="https://$SUPABASE_PROJECT_ID.supabase.co/functions/v1/$FUNCTION_NAME$ENV_SUFFIX"
    
    print_warning "Please update your Stripe webhook endpoint to: $WEBHOOK_URL"
    print_warning "And verify the webhook signature secret is configured correctly"
}

# Main deployment process
main() {
    print_step "Starting deployment to $ENVIRONMENT environment"
    
    check_requirements
    validate_env
    run_tests
    build_function
    deploy_function
    run_migrations
    verify_deployment
    update_config
    
    print_step "Deployment completed successfully!"
}

# Error handling
set -e
trap 'print_error "Deployment failed! See error above"' ERR

# Run main function
main

exit 0