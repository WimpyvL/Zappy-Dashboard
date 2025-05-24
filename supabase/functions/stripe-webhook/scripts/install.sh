#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE=".logs/install.log"
MIN_NODE_VERSION="18.0.0"
MIN_DENO_VERSION="1.32.3"
REQUIRED_PACKAGES=(
    "curl"
    "jq"
    "git"
    "postgresql"
    "gpg"
)

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log "${RED}Please do not run as root${NC}"
        exit 1
    fi
}

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if [ -f /etc/debian_version ]; then
            PACKAGE_MANAGER="apt"
        elif [ -f /etc/redhat-release ]; then
            PACKAGE_MANAGER="yum"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PACKAGE_MANAGER="brew"
    else
        log "${RED}Unsupported operating system${NC}"
        exit 1
    fi
    
    log "Detected OS: $OS"
    log "Package manager: $PACKAGE_MANAGER"
}

# Check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Compare versions
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

# Install system packages
install_system_packages() {
    log "Installing system packages..."
    
    case $PACKAGE_MANAGER in
        apt)
            sudo apt update
            sudo apt install -y "${REQUIRED_PACKAGES[@]}"
            ;;
        yum)
            sudo yum update
            sudo yum install -y "${REQUIRED_PACKAGES[@]}"
            ;;
        brew)
            brew update
            brew install "${REQUIRED_PACKAGES[@]}"
            ;;
    esac
}

# Install Node.js
install_node() {
    log "Installing Node.js..."
    
    if command_exists "node"; then
        local current_version=$(node --version | cut -d 'v' -f 2)
        if version_gt "$MIN_NODE_VERSION" "$current_version"; then
            log "${YELLOW}Node.js version $current_version is older than required $MIN_NODE_VERSION${NC}"
        else
            log "${GREEN}Node.js $current_version is already installed${NC}"
            return 0
        fi
    fi
    
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Install Node.js
    nvm install --lts
    nvm use --lts
    
    log "${GREEN}Node.js installed: $(node --version)${NC}"
}

# Install Deno
install_deno() {
    log "Installing Deno..."
    
    if command_exists "deno"; then
        local current_version=$(deno --version | head -n 1 | cut -d ' ' -f 2)
        if version_gt "$MIN_DENO_VERSION" "$current_version"; then
            log "${YELLOW}Deno version $current_version is older than required $MIN_DENO_VERSION${NC}"
        else
            log "${GREEN}Deno $current_version is already installed${NC}"
            return 0
        fi
    fi
    
    curl -fsSL https://deno.land/x/install/install.sh | sh
    
    log "${GREEN}Deno installed: $(deno --version)${NC}"
}

# Install Supabase CLI
install_supabase_cli() {
    log "Installing Supabase CLI..."
    
    if command_exists "supabase"; then
        log "${GREEN}Supabase CLI is already installed${NC}"
        return 0
    fi
    
    case $OS in
        linux)
            wget -qO- https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
            ;;
        macos)
            brew install supabase/tap/supabase
            ;;
    esac
    
    log "${GREEN}Supabase CLI installed: $(supabase --version)${NC}"
}

# Configure shell
configure_shell() {
    log "Configuring shell..."
    
    # Add environment variables
    local shell_rc="$HOME/.bashrc"
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
    fi
    
    # Add paths
    echo 'export PATH="$HOME/.deno/bin:$PATH"' >> "$shell_rc"
    echo 'export PATH="./node_modules/.bin:$PATH"' >> "$shell_rc"
    
    # Add aliases
    cat >> "$shell_rc" << EOF

# Webhook handler aliases
alias webhook="./scripts/manage.sh"
alias wh-dev="./scripts/manage.sh dev"
alias wh-deploy="./scripts/manage.sh deploy"
alias wh-monitor="./scripts/manage.sh monitor"
EOF
    
    log "${GREEN}Shell configuration updated${NC}"
}

# Install development tools
install_dev_tools() {
    log "Installing development tools..."
    
    # Install global npm packages
    npm install -g typescript
    npm install -g prettier
    npm install -g eslint
    
    # Install Deno tools
    deno install -A -f --unstable -n denon https://deno.land/x/denon/denon.ts
    
    log "${GREEN}Development tools installed${NC}"
}

# Verify installation
verify_installation() {
    log "Verifying installation..."
    
    local failed=0
    
    # Check commands
    for cmd in node deno supabase psql jq curl git; do
        if command_exists "$cmd"; then
            log "${GREEN}✓ $cmd installed${NC}"
        else
            log "${RED}✗ $cmd not installed${NC}"
            failed=1
        fi
    done
    
    # Check versions
    if command_exists "node"; then
        local node_version=$(node --version | cut -d 'v' -f 2)
        if version_gt "$MIN_NODE_VERSION" "$node_version"; then
            log "${RED}Node.js version too old: $node_version${NC}"
            failed=1
        fi
    fi
    
    if command_exists "deno"; then
        local deno_version=$(deno --version | head -n 1 | cut -d ' ' -f 2)
        if version_gt "$MIN_DENO_VERSION" "$deno_version"; then
            log "${RED}Deno version too old: $deno_version${NC}"
            failed=1
        fi
    fi
    
    return $failed
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --no-dev-tools  Don't install development tools"
    echo "  --no-shell     Don't configure shell"
    echo "  --help         Show this help message"
}

# Parse command line arguments
NO_DEV_TOOLS=false
NO_SHELL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-dev-tools)
            NO_DEV_TOOLS=true
            shift
            ;;
        --no-shell)
            NO_SHELL=true
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

# Main installation process
main() {
    log "Starting installation..."
    
    check_root
    detect_os
    
    install_system_packages
    install_node
    install_deno
    install_supabase_cli
    
    if [ "$NO_DEV_TOOLS" = false ]; then
        install_dev_tools
    fi
    
    if [ "$NO_SHELL" = false ]; then
        configure_shell
    fi
    
    verify_installation
    
    log "${GREEN}Installation completed${NC}"
    log "Please restart your shell or run: source ~/.bashrc"
}

# Run installation
main