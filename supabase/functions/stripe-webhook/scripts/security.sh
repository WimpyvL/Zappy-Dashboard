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
LOG_FILE=".logs/security.log"
AUDIT_DIR=".security"
SENSITIVE_PATTERNS=(
    "secret"
    "password"
    "key"
    "token"
    "credential"
    "api_key"
)

# Initialize directories
mkdir -p .logs .security

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check for sensitive information in files
check_sensitive_info() {
    log "Checking for sensitive information..."
    local found=0
    
    for pattern in "${SENSITIVE_PATTERNS[@]}"; do
        log "Checking for pattern: $pattern"
        # Exclude node_modules, .git, and our security logs
        local matches=$(find . -type f \
            ! -path "*/node_modules/*" \
            ! -path "*/.git/*" \
            ! -path "*/.security/*" \
            ! -path "*/.logs/*" \
            -exec grep -l -i "$pattern" {} \;)
        
        if [ -n "$matches" ]; then
            echo -e "${YELLOW}Found potential sensitive information ($pattern):${NC}"
            echo "$matches"
            ((found++))
        fi
    done
    
    if [ $found -eq 0 ]; then
        echo -e "${GREEN}No sensitive information found${NC}"
    fi
    
    return $found
}

# Verify file permissions
check_permissions() {
    log "Checking file permissions..."
    local failed=0
    
    # Check script permissions
    for script in "$SCRIPTS_DIR"/*.sh; do
        if [ ! -x "$script" ]; then
            echo -e "${RED}Script not executable: $script${NC}"
            ((failed++))
        fi
    done
    
    # Check sensitive file permissions
    if [ -f ".env" ] && [ "$(stat -c %a .env)" != "600" ]; then
        echo -e "${RED}.env file has incorrect permissions${NC}"
        ((failed++))
    fi
    
    # Check directory permissions
    for dir in .logs .security .backups; do
        if [ -d "$dir" ] && [ "$(stat -c %a $dir)" != "700" ]; then
            echo -e "${RED}$dir directory has incorrect permissions${NC}"
            ((failed++))
        fi
    done
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}All permissions are correct${NC}"
    fi
    
    return $failed
}

# Check SSL/TLS configuration
check_ssl() {
    log "Checking SSL/TLS configuration..."
    
    if [ -n "$WEBHOOK_URL" ]; then
        echo "Testing webhook endpoint SSL configuration..."
        curl --silent --head https://$(echo "$WEBHOOK_URL" | cut -d/ -f3) | grep -i "strict-transport-security"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}HSTS is enabled${NC}"
        else
            echo -e "${YELLOW}HSTS is not enabled${NC}"
        fi
    fi
}

# Audit environment variables
audit_env() {
    log "Auditing environment variables..."
    
    local required_vars=(
        "STRIPE_WEBHOOK_SECRET"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    local failed=0
    
    # Check required variables
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo -e "${RED}Missing required variable: $var${NC}"
            ((failed++))
        fi
    done
    
    # Check for weak values
    if [ -n "$STRIPE_WEBHOOK_SECRET" ] && [ ${#STRIPE_WEBHOOK_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}STRIPE_WEBHOOK_SECRET might be too short${NC}"
        ((failed++))
    fi
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}Environment variables are properly configured${NC}"
    fi
    
    return $failed
}

# Check dependencies for vulnerabilities
check_dependencies() {
    log "Checking dependencies for vulnerabilities..."
    
    if command -v deno > /dev/null; then
        deno info --json | jq '.deps' > "$AUDIT_DIR/deps.json"
    fi
    
    if [ -f "package.json" ]; then
        if command -v npm > /dev/null; then
            npm audit --json > "$AUDIT_DIR/npm-audit.json"
        fi
    fi
}

# Generate security report
generate_report() {
    local report_file="$AUDIT_DIR/security_report_$(date +%Y%m%d_%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Security Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .warning { color: orange; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Security Audit Report</h1>
    <p>Generated: $(date)</p>
    
    <h2>Sensitive Information Check</h2>
    <pre>$(check_sensitive_info)</pre>
    
    <h2>Permission Check</h2>
    <pre>$(check_permissions)</pre>
    
    <h2>SSL/TLS Configuration</h2>
    <pre>$(check_ssl)</pre>
    
    <h2>Environment Variables</h2>
    <pre>$(audit_env)</pre>
    
    <h2>Dependency Vulnerabilities</h2>
    <pre>$(check_dependencies)</pre>
</body>
</html>
EOF

    log "Report generated: $report_file"
}

# Fix security issues
fix_issues() {
    log "Attempting to fix security issues..."
    
    # Fix file permissions
    chmod 600 .env 2>/dev/null || true
    chmod 700 .logs .security .backups 2>/dev/null || true
    chmod +x "$SCRIPTS_DIR"/*.sh
    
    # Remove .env files from version control
    if [ -f ".gitignore" ]; then
        if ! grep -q "^.env" .gitignore; then
            echo ".env" >> .gitignore
            echo "*.env" >> .gitignore
        fi
    fi
    
    log "${GREEN}Basic security fixes applied${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --check        Run security checks"
    echo "  --fix          Attempt to fix security issues"
    echo "  --audit        Run full security audit"
    echo "  --report       Generate security report"
    echo "  --help         Show this help message"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --check)
            check_sensitive_info
            check_permissions
            check_ssl
            audit_env
            shift
            ;;
        --fix)
            fix_issues
            shift
            ;;
        --audit)
            check_sensitive_info
            check_permissions
            check_ssl
            audit_env
            check_dependencies
            generate_report
            shift
            ;;
        --report)
            generate_report
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

# Default action if no arguments
if [ $# -eq 0 ]; then
    show_help
fi