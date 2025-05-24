#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="stripe-webhook-maintenance"
INSTALL_DIR="/opt/supabase/functions/stripe-webhook"
SYSTEMD_DIR="/etc/systemd/system"

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root"
        exit 1
    fi
}

# Check if systemd is available
check_systemd() {
    if ! command -v systemctl &> /dev/null; then
        print_error "systemd is not available on this system"
        exit 1
    fi
}

# Create required directories
create_directories() {
    print_header "Creating directories"

    mkdir -p "$INSTALL_DIR"
    mkdir -p "$INSTALL_DIR/scripts"
    mkdir -p "$INSTALL_DIR/.logs"
    mkdir -p "$INSTALL_DIR/.metrics"

    # Set proper ownership
    chown -R supabase:supabase "$INSTALL_DIR"
    
    echo "Directories created"
}

# Install service files
install_service_files() {
    print_header "Installing service files"

    # Copy service files
    cp "$SERVICE_NAME.service" "$SYSTEMD_DIR/$SERVICE_NAME.service"
    cp "$SERVICE_NAME.timer" "$SYSTEMD_DIR/$SERVICE_NAME.timer"

    # Set proper permissions
    chmod 644 "$SYSTEMD_DIR/$SERVICE_NAME.service"
    chmod 644 "$SYSTEMD_DIR/$SERVICE_NAME.timer"

    # Reload systemd
    systemctl daemon-reload

    echo "Service files installed"
}

# Configure service
configure_service() {
    print_header "Configuring service"

    # Create environment file if it doesn't exist
    if [ ! -f "$INSTALL_DIR/.env" ]; then
        cp .env.example "$INSTALL_DIR/.env"
        print_warning "Created new .env file at $INSTALL_DIR/.env"
        print_warning "Please update the environment variables"
    fi

    # Set proper permissions
    chown supabase:supabase "$INSTALL_DIR/.env"
    chmod 600 "$INSTALL_DIR/.env"

    echo "Service configured"
}

# Enable and start service
enable_service() {
    print_header "Enabling service"

    # Enable and start timer
    systemctl enable "$SERVICE_NAME.timer"
    systemctl start "$SERVICE_NAME.timer"

    # Run initial maintenance
    systemctl start "$SERVICE_NAME.service"

    echo "Service enabled and started"
}

# Check service status
check_service() {
    print_header "Checking service status"

    echo "Timer status:"
    systemctl status "$SERVICE_NAME.timer"

    echo -e "\nLast service run:"
    systemctl status "$SERVICE_NAME.service"

    echo -e "\nRecent logs:"
    journalctl -u "$SERVICE_NAME.service" -n 10
}

# Uninstall service
uninstall_service() {
    print_header "Uninstalling service"

    # Stop and disable services
    systemctl stop "$SERVICE_NAME.timer"
    systemctl stop "$SERVICE_NAME.service"
    systemctl disable "$SERVICE_NAME.timer"
    systemctl disable "$SERVICE_NAME.service"

    # Remove service files
    rm -f "$SYSTEMD_DIR/$SERVICE_NAME.service"
    rm -f "$SYSTEMD_DIR/$SERVICE_NAME.timer"

    # Reload systemd
    systemctl daemon-reload

    echo "Service uninstalled"
}

# Main script
main() {
    check_root
    check_systemd

    # Parse command line arguments
    case "$1" in
        install)
            create_directories
            install_service_files
            configure_service
            enable_service
            check_service
            ;;
        uninstall)
            uninstall_service
            ;;
        status)
            check_service
            ;;
        *)
            echo "Usage: $0 {install|uninstall|status}"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"