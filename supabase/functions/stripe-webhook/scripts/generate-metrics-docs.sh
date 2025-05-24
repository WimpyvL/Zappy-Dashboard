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
DOCS_DIR="$PROJECT_ROOT/docs/metrics"
LOG_FILE=".logs/metrics-docs.log"

# Initialize logging
mkdir -p .logs "$DOCS_DIR"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Get all metric names from Prometheus
get_metrics() {
    curl -s "http://localhost:9090/api/v1/label/__name__/values" | jq -r '.data[]' | grep '^webhook_'
}

# Get metric metadata from Prometheus
get_metric_metadata() {
    local metric=$1
    curl -s "http://localhost:9090/api/v1/metadata?metric=$metric"
}

# Get metric type from Prometheus
get_metric_type() {
    local metric=$1
    curl -s "http://localhost:9090/api/v1/targets/metadata?metric=$metric" | \
        jq -r '.data[0].type' 2>/dev/null
}

# Get sample values for metric
get_metric_samples() {
    local metric=$1
    curl -s "http://localhost:9090/api/v1/query?query=$metric" | \
        jq -r '.data.result[].metric | del(.__name__)'
}

# Generate markdown documentation for a metric
generate_metric_doc() {
    local metric=$1
    local type=$(get_metric_type "$metric")
    local metadata=$(get_metric_metadata "$metric")
    local samples=$(get_metric_samples "$metric")
    
    local doc_file="$DOCS_DIR/${metric#webhook_}.md"
    
    {
        echo "# $metric"
        echo
        echo "## Overview"
        echo
        echo "Type: \`$type\`"
        echo
        echo "## Description"
        echo
        jq -r ".data.\"$metric\".help" <<< "$metadata" || echo "No description available"
        echo
        echo "## Labels"
        echo
        if [ -n "$samples" ]; then
            echo "Available labels:"
            echo '```json'
            echo "$samples"
            echo '```'
        else
            echo "No labels defined"
        fi
        echo
        echo "## Usage"
        echo
        echo "### PromQL Examples"
        echo
        case $type in
            counter)
                echo "Rate over 5 minutes:"
                echo '```promql'
                echo "rate(${metric}[5m])"
                echo '```'
                echo
                echo "Total increases:"
                echo '```promql'
                echo "increase(${metric}[1h])"
                echo '```'
                ;;
            gauge)
                echo "Current value:"
                echo '```promql'
                echo "$metric"
                echo '```'
                echo
                echo "Average over 5 minutes:"
                echo '```promql'
                echo "avg_over_time(${metric}[5m])"
                echo '```'
                ;;
            histogram)
                echo "95th percentile latency:"
                echo '```promql'
                echo "histogram_quantile(0.95, rate(${metric}_bucket[5m]))"
                echo '```'
                echo
                echo "Average latency:"
                echo '```promql'
                echo "rate(${metric}_sum[5m]) / rate(${metric}_count[5m])"
                echo '```'
                ;;
        esac
        echo
        echo "## Related Metrics"
        echo
        local prefix="${metric%_*}"
        local related=$(get_metrics | grep "^$prefix" | grep -v "^$metric$" || true)
        if [ -n "$related" ]; then
            echo "$related" | while read -r m; do
                echo "- [$m](./${m#webhook_}.md)"
            done
        else
            echo "No related metrics found"
        fi
        
    } > "$doc_file"
    
    log "${GREEN}Generated documentation for $metric${NC}"
}

# Generate index file
generate_index() {
    local index_file="$DOCS_DIR/README.md"
    
    {
        echo "# Webhook Handler Metrics"
        echo
        echo "## Available Metrics"
        echo
        
        echo "### Request Metrics"
        echo
        get_metrics | grep '_requests_' | sort | while read -r metric; do
            echo "- [$metric](./${metric#webhook_}.md)"
        done
        echo
        
        echo "### Event Processing"
        echo
        get_metrics | grep '_events_\|_processing_' | sort | while read -r metric; do
            echo "- [$metric](./${metric#webhook_}.md)"
        done
        echo
        
        echo "### Performance Metrics"
        echo
        get_metrics | grep '_duration_\|_latency_' | sort | while read -r metric; do
            echo "- [$metric](./${metric#webhook_}.md)"
        done
        echo
        
        echo "### Cache Metrics"
        echo
        get_metrics | grep '_cache_' | sort | while read -r metric; do
            echo "- [$metric](./${metric#webhook_}.md)"
        done
        echo
        
        echo "### Security Metrics"
        echo
        get_metrics | grep '_signature_\|_rate_limit_' | sort | while read -r metric; do
            echo "- [$metric](./${metric#webhook_}.md)"
        done
        
    } > "$index_file"
    
    log "${GREEN}Generated metrics index${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --metric NAME  Generate docs for specific metric"
    echo "  --all         Generate docs for all metrics"
    echo "  --index       Generate index only"
    echo "  --help        Show this help message"
}

# Parse command line arguments
case $1 in
    --metric)
        if [ -z "$2" ]; then
            log "${RED}Metric name required${NC}"
            exit 1
        fi
        generate_metric_doc "$2"
        ;;
    --all)
        get_metrics | while read -r metric; do
            generate_metric_doc "$metric"
        done
        generate_index
        ;;
    --index)
        generate_index
        ;;
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        show_help
        exit 1
        ;;
esac