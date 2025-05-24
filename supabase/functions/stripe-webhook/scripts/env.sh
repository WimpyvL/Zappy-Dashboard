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
ENV_FILES=(
    ".env"
    ".env.development"
    ".env.test"
    ".env.staging"
    ".env.production"
)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if environment file exists
check_env_file() {
    local env_file="$1"
    if [ ! -f "$env_file" ]; then
        log "${RED}Environment file not found: $env_file${NC}"
        return 1
    fi
}

# List available environments
list_environments() {
    log "Available environments:"
    for file in "${ENV_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            echo -e "${GREEN}✓${NC} ${file#.env.}"
        else
            echo -e "${RED}✗${NC} ${file#.env.} (missing)"
        fi
    done
}

# Switch environment
switch_environment() {
    local env=$1
    local source_file="$PROJECT_ROOT/.env.$env"
    local target_file="$PROJECT_ROOT/.env"
    
    if [ ! -f "$source_file" ]; then
        log "${RED}Environment '$env' not found${NC}"
        return 1
    fi
    
    # Backup current environment
    if [ -f "$target_file" ]; then
        cp "$target_file" "$target_file.backup"
        log "${YELLOW}Backed up current environment${NC}"
    fi
    
    # Copy new environment
    cp "$source_file" "$target_file"
    log "${GREEN}Switched to $env environment${NC}"
}

# Validate environment file
validate_env() {
    local env_file=$1
    log "Validating $env_file..."
    
    local required_vars=(
        "STRIPE_SECRET_KEY"
        "STRIPE_WEBHOOK_SECRET"
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    local failed=0
    
    # Source environment file
    if [ -f "$env_file" ]; then
        source "$env_file"
    else
        log "${RED}File not found: $env_file${NC}"
        return 1
    fi
    
    # Check required variables
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}✗${NC} Missing required variable: $var"
            ((failed++))
        else
            echo -e "${GREEN}✓${NC} $var is set"
        fi
    done
    
    # Check for sensitive values in development
    if [[ "$env_file" == *"development"* ]] || [[ "$env_file" == *"test"* ]]; then
        if [[ "$STRIPE_SECRET_KEY" == sk_live_* ]]; then
            echo -e "${RED}✗${NC} Production Stripe key detected in development environment"
            ((failed++))
        fi
    fi
    
    # Check for test keys in production
    if [[ "$env_file" == *"production"* ]]; then
        if [[ "$STRIPE_SECRET_KEY" == sk_test_* ]]; then
            echo -e "${RED}✗${NC} Test Stripe key detected in production environment"
            ((failed++))
        fi
    fi
    
    return $failed
}

# Create new environment file
create_environment() {
    local env=$1
    local template=$2
    local target_file="$PROJECT_ROOT/.env.$env"
    
    if [ -f "$target_file" ]; then
        log "${RED}Environment file already exists: $target_file${NC}"
        return 1
    fi
    
    if [ -n "$template" ] && [ -f "$PROJECT_ROOT/.env.$template" ]; then
        cp "$PROJECT_ROOT/.env.$template" "$target_file"
        log "${GREEN}Created $env environment from $template template${NC}"
    else
        cp "$PROJECT_ROOT/.env.example" "$target_file"
        log "${GREEN}Created $env environment from example template${NC}"
    fi
}

# Delete environment file
delete_environment() {
    local env=$1
    local target_file="$PROJECT_ROOT/.env.$env"
    
    if [ "$env" = "production" ]; then
        log "${RED}Cannot delete production environment${NC}"
        return 1
    fi
    
    if [ ! -f "$target_file" ]; then
        log "${RED}Environment file not found: $target_file${NC}"
        return 1
    fi
    
    # Backup before deletion
    cp "$target_file" "$target_file.backup"
    rm "$target_file"
    
    log "${GREEN}Deleted $env environment (backup created)${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo
    echo "Commands:"
    echo "  list                     List available environments"
    echo "  switch <env>             Switch to environment"
    echo "  validate [env]           Validate environment(s)"
    echo "  create <env> [template]  Create new environment"
    echo "  delete <env>            Delete environment"
    echo "  help                    Show this help message"
    echo
    echo "Options:"
    echo "  --force                 Force operation without confirmation"
    echo
    echo "Environments:"
    echo "  development             Development environment"
    echo "  test                    Test environment"
    echo "  staging                 Staging environment"
    echo "  production             Production environment"
}

# Parse command line arguments
case $1 in
    list)
        list_environments
        ;;
    switch)
        if [ -z "$2" ]; then
            log "${RED}Environment name required${NC}"
            exit 1
        fi
        switch_environment "$2"
        ;;
    validate)
        if [ -z "$2" ]; then
            # Validate all environments
            for file in "${ENV_FILES[@]}"; do
                if [ -f "$PROJECT_ROOT/$file" ]; then
                    validate_env "$PROJECT_ROOT/$file"
                fi
            done
        else
            validate_env "$PROJECT_ROOT/.env.$2"
        fi
        ;;
    create)
        if [ -z "$2" ]; then
            log "${RED}Environment name required${NC}"
            exit 1
        fi
        create_environment "$2" "$3"
        ;;
    delete)
        if [ -z "$2" ]; then
            log "${RED}Environment name required${NC}"
            exit 1
        fi
        delete_environment "$2"
        ;;
    help|-h|--help)
        show_help
        exit 0
        ;;
    *)
        show_help
        exit 1
        ;;
esac