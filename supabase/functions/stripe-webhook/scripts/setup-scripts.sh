#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# List of all scripts
SCRIPTS=(
    "analyze-logs.sh"
    "backup.sh"
    "cleanup.sh"
    "cron-setup.sh"
    "env.sh"
    "health-check.sh"
    "install.sh"
    "load-test.sh"
    "maintain-db.sh"
    "manage-deps.sh"
    "manage.sh"
    "monitor.sh"
    "reconcile.sh"
    "rotate-logs.sh"
    "security.sh"
    "setup.sh"
    "test-scripts.sh"
    "test-webhook.sh"
    "uninstall.sh"
    "validate.sh"
)

# Create bin directory
mkdir -p "$SCRIPTS_DIR/../bin"

# Function to make script executable and create symlink
setup_script() {
    local script=$1
    local script_path="$SCRIPTS_DIR/$script"
    local bin_name="${script%.sh}"
    local bin_path="$SCRIPTS_DIR/../bin/$bin_name"
    
    # Check if script exists
    if [ -f "$script_path" ]; then
        # Make executable
        chmod +x "$script_path"
        echo -e "${GREEN}✓${NC} Made executable: $script"
        
        # Create symlink
        ln -sf "../../scripts/$script" "$bin_path"
        echo -e "${GREEN}✓${NC} Created symlink: bin/$bin_name"
    else
        echo -e "${RED}✗${NC} Script not found: $script"
    fi
}

# Setup shell integration
setup_shell() {
    local shell_rc="$HOME/.bashrc"
    if [[ "$SHELL" == *"zsh"* ]]; then
        shell_rc="$HOME/.zshrc"
    fi
    
    # Add bin directory to PATH
    if ! grep -q "webhook/bin" "$shell_rc"; then
        echo -e "\n# Stripe Webhook Handler" >> "$shell_rc"
        echo "export PATH=\"\$PATH:$SCRIPTS_DIR/../bin\"" >> "$shell_rc"
        echo -e "${GREEN}✓${NC} Added bin directory to PATH"
    fi
    
    # Add aliases
    cat >> "$shell_rc" << EOF

# Webhook Handler Aliases
alias wh='webhook'
alias wh-dev='webhook dev'
alias wh-deploy='webhook deploy'
alias wh-monitor='webhook monitor'
alias wh-logs='webhook logs'
EOF
    
    echo -e "${GREEN}✓${NC} Added shell aliases"
}

# Create main webhook command
create_main_command() {
    local main_script="$SCRIPTS_DIR/../bin/webhook"
    
    cat > "$main_script" << 'EOF'
#!/bin/bash
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../scripts" && pwd)"

if [ $# -eq 0 ]; then
    exec "$SCRIPTS_DIR/manage.sh"
else
    exec "$SCRIPTS_DIR/manage.sh" "$@"
fi
EOF
    
    chmod +x "$main_script"
    echo -e "${GREEN}✓${NC} Created main webhook command"
}

# Verify scripts
verify_scripts() {
    local failed=0
    
    echo "Verifying scripts..."
    
    for script in "${SCRIPTS[@]}"; do
        if [ ! -x "$SCRIPTS_DIR/$script" ]; then
            echo -e "${RED}✗${NC} $script is not executable"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All scripts verified successfully${NC}"
    else
        echo -e "${RED}$failed scripts failed verification${NC}"
        return 1
    fi
}

# Main setup process
echo "Setting up maintenance scripts..."

# Make all scripts executable and create symlinks
for script in "${SCRIPTS[@]}"; do
    setup_script "$script"
done

# Create main command
create_main_command

# Setup shell integration
echo
echo "Setting up shell integration..."
setup_shell

# Verify setup
echo
verify_scripts

echo
echo -e "${GREEN}Setup completed!${NC}"
echo "Please run 'source $shell_rc' or restart your shell to use the commands"
echo
echo "Available commands:"
echo "- webhook         : Main management interface"
echo "- webhook dev     : Development commands"
echo "- webhook deploy  : Deployment commands"
echo "- webhook monitor : Monitoring commands"
echo "- webhook logs    : View and analyze logs"
echo
echo "Or use the individual commands directly:"
for script in "${SCRIPTS[@]}"; do
    echo "- ${script%.sh}"
done