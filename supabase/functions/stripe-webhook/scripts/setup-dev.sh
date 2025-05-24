#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE=".logs/setup.log"
MIN_DENO_VERSION="1.32.3"
MIN_NODE_VERSION="18.0.0"
REQUIRED_TOOLS=(
    "deno"
    "node"
    "npm"
    "git"
    "curl"
    "jq"
    "psql"
)

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Compare versions
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    local missing_tools=()
    
    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command_exists "$tool"; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        log "${RED}Missing required tools: ${missing_tools[*]}${NC}"
        log "Please install the missing tools and try again"
        exit 1
    fi
    
    # Check Deno version
    local deno_version=$(deno --version | head -n 1 | cut -d ' ' -f 2)
    if version_gt "$MIN_DENO_VERSION" "$deno_version"; then
        log "${RED}Deno version $deno_version is lower than required version $MIN_DENO_VERSION${NC}"
        exit 1
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d 'v' -f 2)
    if version_gt "$MIN_NODE_VERSION" "$node_version"; then
        log "${RED}Node.js version $node_version is lower than required version $MIN_NODE_VERSION${NC}"
        exit 1
    fi
    
    log "${GREEN}All system requirements met${NC}"
}

# Setup Git hooks
setup_git_hooks() {
    log "Setting up Git hooks..."
    
    mkdir -p .git/hooks
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
set -e

echo "Running pre-commit checks..."

# Format code
deno fmt

# Run linter
deno lint

# Run type check
deno check **/*.ts

# Run tests
deno test --allow-env --allow-net
EOF
    
    chmod +x .git/hooks/pre-commit
    
    # Pre-push hook
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
set -e

echo "Running pre-push checks..."

# Run full test suite
deno test --allow-all --coverage
EOF
    
    chmod +x .git/hooks/pre-push
    
    log "${GREEN}Git hooks installed${NC}"
}

# Setup development database
setup_database() {
    log "Setting up development database..."
    
    # Check if database exists
    if psql -lqt | cut -d \| -f 1 | grep -qw "stripe_webhook_dev"; then
        log "${YELLOW}Development database already exists${NC}"
    else
        createdb stripe_webhook_dev
        log "${GREEN}Created development database${NC}"
    fi
    
    # Run migrations
    if psql -d stripe_webhook_dev -f migrations/setup.sql; then
        log "${GREEN}Database migrations applied${NC}"
    else
        log "${RED}Failed to apply database migrations${NC}"
        exit 1
    fi
}

# Install development dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Cache Deno dependencies
    deno cache deps.ts
    
    # Install npm development tools
    npm install
    
    log "${GREEN}Dependencies installed${NC}"
}

# Configure development environment
configure_environment() {
    log "Configuring development environment..."
    
    # Copy example environment file if not exists
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log "${YELLOW}Created .env file from example. Please update with your settings.${NC}"
    fi
    
    # Create necessary directories
    mkdir -p .logs .metrics .temp .cache
    
    # Set file permissions
    chmod +x scripts/*.sh
    
    log "${GREEN}Environment configured${NC}"
}

# Setup VS Code configuration
setup_vscode() {
    log "Setting up VS Code configuration..."
    
    mkdir -p .vscode
    
    # Install recommended extensions
    if command_exists code; then
        xargs -n 1 code --install-extension < .vscode/extensions.json
        log "${GREEN}VS Code extensions installed${NC}"
    else
        log "${YELLOW}VS Code CLI not available. Please install extensions manually.${NC}"
    fi
}

# Verify setup
verify_setup() {
    log "Verifying setup..."
    
    local failed=0
    
    # Check database connection
    if ! psql -d stripe_webhook_dev -c "SELECT 1;" >/dev/null 2>&1; then
        log "${RED}Database connection failed${NC}"
        failed=1
    fi
    
    # Check environment
    if [ ! -f ".env" ]; then
        log "${RED}Environment file missing${NC}"
        failed=1
    fi
    
    # Run test webhook
    if ! deno run --allow-all scripts/test-webhook.js --verify; then
        log "${RED}Webhook test failed${NC}"
        failed=1
    fi
    
    if [ $failed -eq 0 ]; then
        log "${GREEN}Setup verification passed${NC}"
    else
        log "${RED}Setup verification failed${NC}"
        exit 1
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --check-only    Only check requirements"
    echo "  --no-database   Skip database setup"
    echo "  --no-hooks      Skip Git hooks setup"
    echo "  --help          Show this help message"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check-only)
                check_requirements
                exit 0
                ;;
            --no-database)
                NO_DATABASE=1
                shift
                ;;
            --no-hooks)
                NO_HOOKS=1
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
}

# Main setup process
main() {
    log "Starting development environment setup..."
    
    check_requirements
    
    if [ -z "$NO_HOOKS" ]; then
        setup_git_hooks
    fi
    
    if [ -z "$NO_DATABASE" ]; then
        setup_database
    fi
    
    install_dependencies
    configure_environment
    setup_vscode
    verify_setup
    
    log "${GREEN}Development environment setup completed${NC}"
    log "Please update .env with your settings and run 'deno task dev' to start"
}

# Run setup
parse_args "$@"
main