#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$SCRIPTS_DIR/../bin"

# List of all scripts
SCRIPTS=(
    "backup.sh"
    "cleanup.sh"
    "cron-setup.sh"
    "deploy.sh"
    "health-check.sh"
    "install.sh"
    "maintain-db.sh"
    "manage-deps.sh"
    "manage.sh"
    "monitor.sh"
    "reconcile.sh"
    "rotate-logs.sh"
    "setup-dev.sh"
    "setup.sh"
    "test-scripts.sh"
    "uninstall.sh"
)

# Make scripts executable
for script in "${SCRIPTS[@]}"; do
    if [ -f "$SCRIPTS_DIR/$script" ]; then
        chmod +x "$SCRIPTS_DIR/$script"
        echo -e "${GREEN}✓${NC} Made executable: $script"
    else
        echo -e "${RED}✗${NC} Not found: $script"
    fi
done

# Create bin directory and symlinks
echo -e "\nCreating symbolic links in bin directory..."
mkdir -p "$BIN_DIR"

for script in "${SCRIPTS[@]}"; do
    base_name=$(basename "$script" .sh)
    ln -sf "../scripts/$script" "$BIN_DIR/$base_name"
    echo -e "${GREEN}✓${NC} Created symlink: bin/$base_name -> scripts/$script"
done

# Add bin directory to PATH if not already present
SHELL_RC="$HOME/.bashrc"
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_RC="$HOME/.zshrc"
fi

if ! grep -q "export PATH=\"\$PATH:$BIN_DIR\"" "$SHELL_RC"; then
    echo -e "\n# Webhook handler scripts" >> "$SHELL_RC"
    echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_RC"
    echo -e "${YELLOW}Added bin directory to PATH in $SHELL_RC${NC}"
    echo "Please run: source $SHELL_RC"
fi

# Create main executable
cat > "$BIN_DIR/webhook" << EOF
#!/bin/bash

# Main webhook handler command
SCRIPTS_DIR="$SCRIPTS_DIR"

# Show help if no arguments
if [ \$# -eq 0 ]; then
    "\$SCRIPTS_DIR/manage.sh" --help
    exit 0
fi

# Pass all arguments to manage.sh
exec "\$SCRIPTS_DIR/manage.sh" "\$@"
EOF

chmod +x "$BIN_DIR/webhook"
echo -e "${GREEN}✓${NC} Created main executable: webhook"

# Verify executables
echo -e "\nVerifying executables..."
for script in "${SCRIPTS[@]}"; do
    if [ -x "$SCRIPTS_DIR/$script" ]; then
        echo -e "${GREEN}✓${NC} $script is executable"
    else
        echo -e "${RED}✗${NC} Failed to make $script executable"
    fi
done

# Create aliases
echo -e "\nCreating helpful aliases..."
cat >> "$SHELL_RC" << EOF

# Webhook handler aliases
alias wh='webhook'
alias wh-dev='webhook dev'
alias wh-deploy='webhook deploy'
alias wh-monitor='webhook monitor'
alias wh-maintain='webhook maintain'
alias wh-backup='webhook backup'
EOF

echo -e "${GREEN}✓${NC} Added helpful aliases to $SHELL_RC"

echo -e "\n${GREEN}All scripts are now executable!${NC}"
echo "You can access them directly from the bin directory or use the 'webhook' command."
echo "Run 'webhook --help' for usage information."
echo -e "${YELLOW}Remember to restart your shell or run: source $SHELL_RC${NC}"