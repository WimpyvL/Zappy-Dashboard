#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE=".logs/dependencies.log"
DEPS_FILE="deps.ts"
BACKUP_DIR=".backups/deps"
UPDATE_LOCK="deps.update.lock"

# Initialize directories
mkdir -p .logs .backups/deps

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if update is already running
check_lock() {
    if [ -f "$UPDATE_LOCK" ]; then
        log "${RED}Another update process is running${NC}"
        exit 1
    fi
    touch "$UPDATE_LOCK"
}

# Release lock
release_lock() {
    rm -f "$UPDATE_LOCK"
}

# Backup current dependencies
backup_deps() {
    local backup_file="$BACKUP_DIR/deps_$(date +%Y%m%d_%H%M%S).ts"
    cp "$DEPS_FILE" "$backup_file"
    log "${GREEN}Dependencies backed up to $backup_file${NC}"
}

# Update Deno dependencies
update_deno_deps() {
    log "Updating Deno dependencies..."
    
    # Get current versions
    local current_versions=$(grep "https://" "$DEPS_FILE" | sort)
    
    # Update cache and get latest versions
    deno cache --reload "$DEPS_FILE"
    
    # Check for updates
    local updates=0
    while IFS= read -r line; do
        if [[ $line =~ https://deno.land/std@([0-9]+\.[0-9]+\.[0-9]+) ]]; then
            local current_version="${BASH_REMATCH[1]}"
            local latest_version=$(curl -s "https://cdn.deno.land/std/meta/versions.json" | jq -r '.latest')
            
            if [ "$current_version" != "$latest_version" ]; then
                log "${YELLOW}Updating std from $current_version to $latest_version${NC}"
                sed -i "s/@$current_version/@$latest_version/g" "$DEPS_FILE"
                ((updates++))
            fi
        fi
    done < <(echo "$current_versions")
    
    if [ "$updates" -eq 0 ]; then
        log "${GREEN}All Deno dependencies are up to date${NC}"
    else
        log "${GREEN}Updated $updates Deno dependencies${NC}"
    fi
}

# Update npm dependencies
update_npm_deps() {
    log "Updating npm dependencies..."
    
    if [ -f "package.json" ]; then
        # Backup package.json
        cp package.json "$BACKUP_DIR/package_$(date +%Y%m%d_%H%M%S).json"
        
        # Update dependencies
        npm outdated --json | jq -r 'to_entries[] | select(.value.latest != .value.current) | .key' | while read -r package; do
            local current_version=$(npm list "$package" --json | jq -r ".dependencies[\"$package\"].version")
            local latest_version=$(npm view "$package" version)
            
            log "${YELLOW}Updating $package from $current_version to $latest_version${NC}"
            npm install "$package@latest"
        done
        
        # Update package-lock.json
        npm install
    fi
}

# Check for security vulnerabilities
check_security() {
    log "Checking for security vulnerabilities..."
    
    # Check Deno dependencies
    deno audit
    
    # Check npm dependencies
    if [ -f "package.json" ]; then
        npm audit
    fi
}

# Run tests after updates
run_tests() {
    log "Running tests..."
    
    if ! deno test --allow-all; then
        log "${RED}Tests failed after dependency updates${NC}"
        return 1
    fi
    
    log "${GREEN}All tests passed${NC}"
    return 0
}

# Generate dependency report
generate_report() {
    local report_file=".logs/deps_report_$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "Dependency Update Report"
        echo "======================="
        echo
        echo "Updated on: $(date)"
        echo
        
        echo "Deno Dependencies:"
        echo "-----------------"
        grep "https://" "$DEPS_FILE" | sort
        echo
        
        if [ -f "package.json" ]; then
            echo "NPM Dependencies:"
            echo "----------------"
            npm list --prod --depth=0
            echo
        fi
        
        echo "Security Scan:"
        echo "-------------"
        deno audit
        
        if [ -f "package.json" ]; then
            echo
            npm audit
        fi
        
    } > "$report_file"
    
    log "${GREEN}Report generated: $report_file${NC}"
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check)
                check_security
                exit 0
                ;;
            --report)
                generate_report
                exit 0
                ;;
            --deno-only)
                update_deno_deps
                exit 0
                ;;
            --npm-only)
                update_npm_deps
                exit 0
                ;;
            *)
                log "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done
}

# Main update process
main() {
    log "Starting dependency update process..."
    
    check_lock
    trap release_lock EXIT
    
    backup_deps
    update_deno_deps
    update_npm_deps
    check_security
    
    if run_tests; then
        generate_report
        log "${GREEN}Dependency update completed successfully${NC}"
    else
        log "${RED}Dependency update failed - rolling back${NC}"
        cp "$BACKUP_DIR/$(ls -t "$BACKUP_DIR" | head -n1)" "$DEPS_FILE"
        exit 1
    fi
}

# Run main process if no specific command provided
parse_args "$@" || main