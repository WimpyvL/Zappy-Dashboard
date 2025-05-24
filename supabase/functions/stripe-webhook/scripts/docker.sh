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
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
LOG_FILE=".logs/docker.log"

# Initialize logging
mkdir -p .logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Logging function
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check Docker installation
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        log "${RED}Docker is not installed${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        log "${RED}Docker Compose is not installed${NC}"
        exit 1
    fi
}

# Create Docker network
create_network() {
    if ! docker network inspect webhook-net >/dev/null 2>&1; then
        docker network create webhook-net
        log "${GREEN}Created Docker network: webhook-net${NC}"
    fi
}

# Generate Docker Compose file
generate_compose() {
    cat > "$DOCKER_COMPOSE_FILE" << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: webhook-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: webhook
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - webhook-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: webhook-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - webhook-net
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailhog:
    image: mailhog/mailhog
    container_name: webhook-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - webhook-net

  prometheus:
    image: prom/prometheus
    container_name: webhook-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    networks:
      - webhook-net

  grafana:
    image: grafana/grafana
    container_name: webhook-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - webhook-net
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  webhook-net:
    external: true
EOF

    log "${GREEN}Generated Docker Compose file${NC}"
}

# Start containers
start_containers() {
    log "Starting containers..."
    
    docker-compose up -d
    
    # Wait for containers to be healthy
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if docker-compose ps | grep -q "unhealthy\|starting"; then
            echo -n "."
            ((retries++))
            sleep 1
        else
            echo
            log "${GREEN}All containers are healthy${NC}"
            return 0
        fi
    done
    
    log "${RED}Containers failed to start properly${NC}"
    return 1
}

# Stop containers
stop_containers() {
    log "Stopping containers..."
    docker-compose down
}

# Show container status
show_status() {
    log "Container Status:"
    echo
    docker-compose ps
    echo
    
    log "Container Logs:"
    echo
    docker-compose logs --tail=10
}

# Clean up containers and volumes
cleanup() {
    log "Cleaning up Docker resources..."
    
    # Stop containers
    docker-compose down -v
    
    # Remove network
    docker network rm webhook-net 2>/dev/null || true
    
    # Remove volumes
    docker volume rm webhook-postgres-data 2>/dev/null || true
    docker volume rm webhook-redis-data 2>/dev/null || true
    docker volume rm webhook-prometheus-data 2>/dev/null || true
    docker volume rm webhook-grafana-data 2>/dev/null || true
    
    log "${GREEN}Cleanup completed${NC}"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    while ! docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do
        echo -n "."
        sleep 1
    done
    echo
    
    # Run migrations
    if [ -f "$PROJECT_ROOT/migrations/setup.sql" ]; then
        docker-compose exec -T postgres psql -U postgres -d webhook -f /migrations/setup.sql
        log "${GREEN}Migrations completed${NC}"
    else
        log "${YELLOW}No migrations found${NC}"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  start         Start containers"
    echo "  stop          Stop containers"
    echo "  status        Show container status"
    echo "  restart       Restart containers"
    echo "  cleanup       Clean up containers and volumes"
    echo "  logs          Show container logs"
    echo "  migrate       Run database migrations"
    echo "  help          Show this help message"
}

# Parse command line arguments
case $1 in
    start)
        check_docker
        create_network
        generate_compose
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    status)
        show_status
        ;;
    restart)
        stop_containers
        start_containers
        ;;
    cleanup)
        cleanup
        ;;
    logs)
        docker-compose logs --tail=100 -f
        ;;
    migrate)
        run_migrations
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