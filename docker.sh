#!/bin/bash
# Docker management script for Fake API Generator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        if [ -f .env.docker ]; then
            echo "Copying .env.docker to .env..."
            cp .env.docker .env
            print_warning "Please edit .env and fill in your values"
            exit 1
        else
            print_error "No .env.docker template found"
            exit 1
        fi
    fi
    print_success ".env file found"
}

dev() {
    echo "Starting development environment..."
    check_requirements
    check_env_file
    docker compose -f docker/docker-compose.yml --profile dev up --build
}

dev_detached() {
    echo "Starting development environment in detached mode..."
    check_requirements
    check_env_file
    docker compose -f docker/docker-compose.yml --profile dev up --build -d
    print_success "Development environment started"
    echo "View logs: docker compose -f docker/docker-compose.yml logs -f app-dev"
}

prod() {
    echo "Starting production environment..."
    check_requirements
    check_env_file
    docker compose -f docker/docker-compose.yml --profile prod up --build -d
    print_success "Production environment started"
    echo "View logs: docker compose -f docker/docker-compose.yml logs -f app-prod"
}

stop() {
    echo "Stopping all services..."
    docker compose -f docker/docker-compose.yml down
    print_success "All services stopped"
}

clean() {
    echo "Cleaning up containers, networks, and volumes..."
    read -p "This will delete all data. Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f docker/docker-compose.yml down -v
        print_success "Cleanup complete"
    else
        print_warning "Cleanup cancelled"
    fi
}

logs() {
    if [ "$1" = "dev" ]; then
        docker compose -f docker/docker-compose.yml logs -f app-dev
    elif [ "$1" = "prod" ]; then
        docker compose -f docker/docker-compose.yml logs -f app-prod
    elif [ "$1" = "mongodb" ]; then
        docker compose -f docker/docker-compose.yml logs -f mongodb
    else
        docker compose -f docker/docker-compose.yml logs -f
    fi
}

status() {
    echo "Service Status:"
    docker compose -f docker/docker-compose.yml ps
    echo ""
    echo "Health Status:"
    curl -s http://localhost:3000/api/health | jq . || print_warning "Application not responding"
}

backup() {
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    echo "Creating backup..."
    docker exec fake-api-mongodb mongodump \
        --uri="mongodb://admin:password@localhost:27017/fake_api_generator?authSource=admin" \
        --out=/tmp/backup 2>/dev/null || {
        print_error "Backup failed"
        exit 1
    }
    
    docker cp fake-api-mongodb:/tmp/backup "$BACKUP_DIR/mongodb"
    print_success "Backup created at $BACKUP_DIR"
}

shell() {
    if [ "$1" = "app" ]; then
        docker exec -it fake-api-generator-prod sh || \
        docker exec -it fake-api-generator-dev sh
    elif [ "$1" = "mongo" ]; then
        docker exec -it fake-api-mongodb mongosh -u admin -p password
    else
        print_error "Usage: $0 shell [app|mongo]"
        exit 1
    fi
}

# Main script
case "$1" in
    dev)
        dev
        ;;
    dev:detached)
        dev_detached
        ;;
    prod)
        prod
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    backup)
        backup
        ;;
    shell)
        shell "$2"
        ;;
    *)
        echo "Fake API Generator - Docker Management Script"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  dev              Start development environment (with logs)"
        echo "  dev:detached     Start development environment (detached)"
        echo "  prod             Start production environment (detached)"
        echo "  stop             Stop all services"
        echo "  clean            Stop and remove all containers and volumes"
        echo "  logs [service]   View logs (services: dev, prod, mongodb)"
        echo "  status           Check service and health status"
        echo "  backup           Backup MongoDB data"
        echo "  shell [target]   Access shell (targets: app, mongo)"
        echo ""
        echo "Examples:"
        echo "  $0 dev           # Start development with hot-reload"
        echo "  $0 prod          # Start production"
        echo "  $0 logs dev      # View dev logs"
        echo "  $0 status        # Check health"
        echo "  $0 shell mongo   # Access MongoDB shell"
        exit 1
        ;;
esac
