#!/bin/bash
# 🐻 Podplay Sanctuary VPS Deployment Script
# Automated deployment and management for VPS environments

set -e

echo "🐻 Mama Bear VPS Deployment Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/podplay-sanctuary"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/backups/podplay"
LOG_FILE="/var/log/podplay-deployment.log"
DOMAIN=""
EMAIL=""

# Function to print colored messages
print_status() {
    echo -e "${BLUE}🐻 Mama Bear:${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}❌${NC} $1" | tee -a "$LOG_FILE"
}

print_info() {
    echo -e "${PURPLE}ℹ️${NC} $1" | tee -a "$LOG_FILE"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  install           Full VPS installation"
    echo "  deploy            Deploy/update application"
    echo "  start             Start all services"
    echo "  stop              Stop all services"
    echo "  restart           Restart all services"
    echo "  status            Show service status"
    echo "  backup            Create backup"
    echo "  restore [FILE]    Restore from backup"
    echo "  logs [SERVICE]    Show logs"
    echo "  ssl               Setup/renew SSL certificates"
    echo "  cleanup           Clean up old containers and images"
    echo "  health            Run health checks"
    echo ""
    echo "Options:"
    echo "  --domain DOMAIN   Set domain name"
    echo "  --email EMAIL     Set email for SSL certificates"
    echo "  --force           Force operation without prompts"
    echo ""
    echo "Examples:"
    echo "  $0 install --domain yourdomain.com --email admin@yourdomain.com"
    echo "  $0 deploy"
    echo "  $0 logs backend"
}

# Parse command line arguments
COMMAND=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        install|deploy|start|stop|restart|status|backup|restore|logs|ssl|cleanup|health)
            COMMAND="$1"
            shift
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            if [[ "$COMMAND" == "restore" && -z "$RESTORE_FILE" ]]; then
                RESTORE_FILE="$1"
            elif [[ "$COMMAND" == "logs" && -z "$LOG_SERVICE" ]]; then
                LOG_SERVICE="$1"
            else
                print_error "Unknown option: $1"
                show_usage
                exit 1
            fi
            shift
            ;;
    esac
done

# Function to check if running as appropriate user
check_user() {
    if [[ $EUID -eq 0 && "$COMMAND" != "install" ]]; then
        print_error "Don't run this script as root (except for install)"
        exit 1
    fi
}

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing_deps+="docker"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+="docker-compose"
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        missing_deps+="git"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_info "Please install missing dependencies first"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_name="podplay-backup-$timestamp"
    
    sudo mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if [[ -f "$APP_DIR/sanctuary.db" ]]; then
        sudo cp "$APP_DIR/sanctuary.db" "$BACKUP_DIR/sanctuary-$timestamp.db"
        print_success "Database backed up"
    fi
    
    # Backup configuration
    if [[ -f "$APP_DIR/.env.production" ]]; then
        sudo tar -czf "$BACKUP_DIR/config-$timestamp.tar.gz" \
            -C "$APP_DIR" .env.production docker-compose.prod.yml
        print_success "Configuration backed up"
    fi
    
    # Backup uploads
    if [[ -d "$APP_DIR/uploads" ]]; then
        sudo tar -czf "$BACKUP_DIR/uploads-$timestamp.tar.gz" \
            -C "$APP_DIR" uploads/
        print_success "Uploads backed up"
    fi
    
    print_success "Backup completed: $backup_name"
}

# Function to install application
install_app() {
    print_status "Installing Podplay Sanctuary..."
    
    if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
        print_error "Domain and email are required for installation"
        print_info "Use: $0 install --domain yourdomain.com --email admin@yourdomain.com"
        exit 1
    fi
    
    # Create application directory
    sudo mkdir -p "$APP_DIR"
    sudo chown "$USER:$USER" "$APP_DIR"
    
    # Clone repository if not exists
    if [[ ! -d "$APP_DIR/.git" ]]; then
        print_status "Cloning repository..."
        git clone https://github.com/yourusername/podplay-build-sanctuary.git "$APP_DIR"
        cd "$APP_DIR"
    else
        print_status "Repository already exists, pulling updates..."
        cd "$APP_DIR"
        git pull origin main
    fi
    
    # Create production environment file
    if [[ ! -f ".env.production" ]]; then
        print_status "Creating production environment file..."
        cp .env.production.template .env.production
        
        # Update domain in environment file
        sed -i "s/yourdomain.com/$DOMAIN/g" .env.production
        
        print_warning "Please edit .env.production with your API keys and configuration"
        print_info "File location: $APP_DIR/.env.production"
    fi
    
    # Create directories
    mkdir -p logs uploads backups secrets
    
    # Set permissions
    chmod 755 logs uploads backups
    chmod 700 secrets
    
    print_success "Application installed successfully"
    print_info "Next steps:"
    print_info "1. Edit $APP_DIR/.env.production with your configuration"
    print_info "2. Run: $0 ssl --domain $DOMAIN --email $EMAIL"
    print_info "3. Run: $0 deploy"
}

# Function to deploy application
deploy_app() {
    print_status "Deploying application..."
    
    cd "$APP_DIR"
    
    # Create backup before deployment
    create_backup
    
    # Pull latest changes
    print_status "Pulling latest changes..."
    git pull origin main
    
    # Build images
    print_status "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start services
    print_status "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to start
    print_status "Waiting for services to start..."
    sleep 30
    
    # Run health checks
    health_check
    
    # Cleanup old images
    print_status "Cleaning up old images..."
    docker image prune -f
    
    print_success "Deployment completed successfully"
}

# Function to setup SSL
setup_ssl() {
    if [[ -z "$DOMAIN" || -z "$EMAIL" ]]; then
        print_error "Domain and email are required for SSL setup"
        exit 1
    fi
    
    print_status "Setting up SSL certificates for $DOMAIN..."
    
    # Install certbot if not installed
    if ! command -v certbot &> /dev/null; then
        print_status "Installing certbot..."
        sudo apt update
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Get certificate
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" --agree-tos --non-interactive
    
    # Setup auto-renewal
    if ! sudo crontab -l | grep -q certbot; then
        print_status "Setting up automatic certificate renewal..."
        (sudo crontab -l 2>/dev/null; echo "0 3 * * 0 /usr/bin/certbot renew --quiet") | sudo crontab -
    fi
    
    print_success "SSL certificates configured successfully"
}

# Function to run health checks
health_check() {
    print_status "Running health checks..."
    
    cd "$APP_DIR"
    
    # Check if containers are running
    local running_containers=$(docker-compose -f "$COMPOSE_FILE" ps --services --filter "status=running")
    local total_containers=$(docker-compose -f "$COMPOSE_FILE" ps --services)
    
    print_info "Container status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    # Check backend health
    if curl -f http://localhost:8081/health &>/dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:8080/health.html &>/dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
    fi
    
    # Check Redis
    if docker exec podplay-redis redis-cli ping &>/dev/null; then
        print_success "Redis health check passed"
    else
        print_error "Redis health check failed"
    fi
    
    # Check disk space
    local disk_usage=$(df "$APP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt 80 ]]; then
        print_warning "Disk usage is at ${disk_usage}%"
    else
        print_success "Disk usage is at ${disk_usage}%"
    fi
    
    # Check memory usage
    local mem_usage=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    print_info "Memory usage: ${mem_usage}%"
}

# Function to show logs
show_logs() {
    cd "$APP_DIR"
    
    if [[ -n "$LOG_SERVICE" ]]; then
        print_status "Showing logs for $LOG_SERVICE..."
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "$LOG_SERVICE"
    else
        print_status "Showing logs for all services..."
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=50
    fi
}

# Function to manage services
manage_service() {
    cd "$APP_DIR"
    
    case $1 in
        start)
            print_status "Starting services..."
            docker-compose -f "$COMPOSE_FILE" up -d
            ;;
        stop)
            print_status "Stopping services..."
            docker-compose -f "$COMPOSE_FILE" down
            ;;
        restart)
            print_status "Restarting services..."
            docker-compose -f "$COMPOSE_FILE" restart
            ;;
        status)
            print_status "Service status:"
            docker-compose -f "$COMPOSE_FILE" ps
            ;;
    esac
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove old backups (keep last 30 days)
    sudo find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete
    sudo find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
    
    print_success "Cleanup completed"
}

# Main execution
main() {
    # Create log file
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo touch "$LOG_FILE"
    sudo chmod 666 "$LOG_FILE"
    
    print_status "Starting Podplay Sanctuary VPS Management"
    print_info "Command: $COMMAND"
    print_info "Timestamp: $(date)"
    
    case $COMMAND in
        install)
            check_dependencies
            install_app
            ;;
        deploy)
            check_user
            check_dependencies
            deploy_app
            ;;
        start|stop|restart|status)
            check_user
            manage_service "$COMMAND"
            ;;
        backup)
            check_user
            create_backup
            ;;
        ssl)
            setup_ssl
            ;;
        logs)
            check_user
            show_logs
            ;;
        health)
            check_user
            health_check
            ;;
        cleanup)
            check_user
            cleanup
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
    
    print_success "Operation completed successfully"
}

# Run main function if not being sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ -z "$COMMAND" ]]; then
        show_usage
        exit 1
    fi
    
    main "$@"
fi
