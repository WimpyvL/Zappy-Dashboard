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
LOG_FILE=".logs/monitoring.log"
MONITORING_DIR="$PROJECT_ROOT/monitoring"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check Docker services
check_services() {
    log "Checking monitoring services..."
    
    local services=(
        "prometheus"
        "grafana"
        "alertmanager"
        "loki"
        "jaeger"
        "node-exporter"
    )
    
    local failed=0
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*running"; then
            echo -e "${GREEN}✓${NC} $service is running"
        else
            echo -e "${RED}✗${NC} $service is not running"
            ((failed++))
        fi
    done
    
    return $failed
}

# Initialize monitoring stack
init_monitoring() {
    log "Initializing monitoring stack..."
    
    # Create required directories
    mkdir -p {prometheus,grafana}/{data,config,dashboards}
    
    # Copy configuration files
    cp "$PROJECT_ROOT/prometheus/"*.yml prometheus/config/
    cp "$PROJECT_ROOT/grafana/provisioning/"* grafana/config/
    cp "$PROJECT_ROOT/grafana/dashboards/"* grafana/dashboards/
    
    # Start services
    docker-compose up -d prometheus grafana alertmanager
    
    log "${GREEN}Monitoring stack initialized${NC}"
}

# Update dashboards
update_dashboards() {
    log "Updating Grafana dashboards..."
    
    # Copy dashboard files
    cp "$PROJECT_ROOT/grafana/dashboards/"* /var/lib/grafana/dashboards/
    
    # Reload Grafana
    curl -X POST http://admin:admin@localhost:3000/api/admin/provisioning/dashboards/reload
    
    log "${GREEN}Dashboards updated${NC}"
}

# Check metrics
check_metrics() {
    log "Checking metrics collection..."
    
    # Query Prometheus
    local response=$(curl -s http://localhost:9090/api/v1/query?query=up)
    
    if echo "$response" | grep -q '"status":"success"'; then
        echo -e "${GREEN}✓${NC} Metrics collection is working"
    else
        echo -e "${RED}✗${NC} Metrics collection failed"
        return 1
    fi
}

# Generate monitoring report
generate_report() {
    local report_file="$MONITORING_DIR/report_$(date +%Y%m%d_%H%M%S).html"
    
    {
        echo "<html><body>"
        echo "<h1>Monitoring Status Report</h1>"
        echo "<p>Generated: $(date)</p>"
        
        echo "<h2>Services Status</h2>"
        echo "<pre>"
        docker-compose ps
        echo "</pre>"
        
        echo "<h2>Metrics Status</h2>"
        echo "<pre>"
        curl -s http://localhost:9090/api/v1/targets | jq .
        echo "</pre>"
        
        echo "<h2>Alert Status</h2>"
        echo "<pre>"
        curl -s http://localhost:9093/api/v2/alerts | jq .
        echo "</pre>"
        
        echo "</body></html>"
    } > "$report_file"
    
    log "Report generated: $report_file"
}

# Reset monitoring stack
reset_monitoring() {
    log "Resetting monitoring stack..."
    
    # Stop services
    docker-compose stop prometheus grafana alertmanager
    
    # Remove data
    rm -rf {prometheus,grafana}/data/*
    
    # Restart services
    docker-compose up -d prometheus grafana alertmanager
    
    log "${GREEN}Monitoring stack reset${NC}"
}

# Backup monitoring data
backup_monitoring() {
    local backup_dir="$MONITORING_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    
    log "Backing up monitoring data to $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # Stop services
    docker-compose stop prometheus grafana
    
    # Backup data
    cp -r prometheus/data "$backup_dir/prometheus"
    cp -r grafana/data "$backup_dir/grafana"
    
    # Restart services
    docker-compose start prometheus grafana
    
    # Compress backup
    tar -czf "$backup_dir.tar.gz" "$backup_dir"
    rm -rf "$backup_dir"
    
    log "${GREEN}Backup completed: $backup_dir.tar.gz${NC}"
}

# Show monitoring dashboard URLs
show_urls() {
    local host=${MONITORING_HOST:-localhost}
    
    echo "Monitoring URLs:"
    echo "---------------"
    echo "Grafana:      http://$host:3000"
    echo "Prometheus:   http://$host:9090"
    echo "Alertmanager: http://$host:9093"
    echo "Jaeger:       http://$host:16686"
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  init       Initialize monitoring stack"
    echo "  check      Check monitoring services"
    echo "  update     Update dashboards"
    echo "  metrics    Check metrics collection"
    echo "  report     Generate monitoring report"
    echo "  reset      Reset monitoring stack"
    echo "  backup     Backup monitoring data"
    echo "  urls       Show monitoring URLs"
    echo "  help       Show this help message"
}

# Parse command line arguments
case $1 in
    init)
        init_monitoring
        ;;
    check)
        check_services
        ;;
    update)
        update_dashboards
        ;;
    metrics)
        check_metrics
        ;;
    report)
        generate_report
        ;;
    reset)
        reset_monitoring
        ;;
    backup)
        backup_monitoring
        ;;
    urls)
        show_urls
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