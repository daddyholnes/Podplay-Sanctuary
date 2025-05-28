# 🚀 VPS Installation Guide - Podplay Build Sanctuary

> **Complete guide for deploying Podplay Build Sanctuary to your VPS**

[![VPS Ready](https://img.shields.io/badge/VPS-Ready-green.svg)](https://github.com/yourusername/podplay-build-sanctuary)
[![Production](https://img.shields.io/badge/Production-Stable-blue.svg)](https://github.com/yourusername/podplay-build-sanctuary)
[![SSL](https://img.shields.io/badge/SSL-Enabled-orange.svg)](https://letsencrypt.org/)

## 📋 Prerequisites

### System Requirements
- **Ubuntu 22.04 LTS** or **Debian 12** (recommended)
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **Root or sudo access**
- **Domain name** pointed to your VPS IP (for SSL)

### Required Software
- Docker & Docker Compose
- Nginx (reverse proxy)
- Certbot (SSL certificates)
- Git
- UFW (firewall)

## 🔐 Initial VPS Security Setup

### 1. Connect to Your VPS
```bash
# Use the SSH key you generated earlier
ssh -i ~/.ssh/id_ed25519_vps root@your-vps-ip
```

### 2. Create Non-Root User
```bash
# Create deployment user
adduser podplay
usermod -aG sudo podplay
usermod -aG docker podplay

# Copy SSH keys to new user
mkdir -p /home/podplay/.ssh
cp ~/.ssh/authorized_keys /home/podplay/.ssh/
chown -R podplay:podplay /home/podplay/.ssh
chmod 700 /home/podplay/.ssh
chmod 600 /home/podplay/.ssh/authorized_keys
```

### 3. Configure SSH Security
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Add these settings:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22222  # Change default port for security

# Restart SSH
systemctl restart ssh
```

### 4. Setup Firewall
```bash
# Install and configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22222/tcp  # SSH on custom port
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw enable
```

## 🐻 System Dependencies Installation

### 1. Update System
```bash
# Switch to deployment user
su - podplay

# Update packages
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Install Certbot for SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5. Install Additional Tools
```bash
sudo apt install git curl wget htop unzip fail2ban -y
```

## 🏗️ Application Deployment

### 1. Clone Repository
```bash
# Create application directory
sudo mkdir -p /opt/podplay-sanctuary
sudo chown podplay:podplay /opt/podplay-sanctuary
cd /opt/podplay-sanctuary

# Clone the repository
git clone https://github.com/yourusername/podplay-build-sanctuary.git .
```

### 2. Create Production Environment Files
```bash
# Copy environment template
cp .env.example .env.production

# Edit production environment
nano .env.production
```

Add your production environment variables:
```env
# Production Environment Configuration
NODE_ENV=production
FLASK_ENV=production
DEBUG=False

# Server Configuration
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Database Configuration
DATABASE_URL=sqlite:///production.db

# API Keys (replace with your actual keys)
GOOGLE_CLOUD_PROJECT=your-project-id
TOGETHER_API_KEY=your-together-api-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Security
SECRET_KEY=your-super-secret-production-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# NixOS Configuration (if using)
NIXOS_SSH_HOST=your-nixos-host
NIXOS_SSH_USER=your-nixos-user
NIXOS_SSH_KEY_PATH=/opt/podplay-sanctuary/keys/nixos-key

# Monitoring
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn-if-using
```

### 3. Create Docker Compose for Production
```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  # Backend Service
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: podplay-backend
    restart: unless-stopped
    env_file:
      - .env.production
    volumes:
      - ./sanctuary.db:/app/sanctuary.db
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    networks:
      - podplay-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: podplay-frontend
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      - backend
    networks:
      - podplay-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis for caching (optional but recommended)
  redis:
    image: redis:7-alpine
    container_name: podplay-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - podplay-network
    command: redis-server --appendonly yes

volumes:
  redis_data:

networks:
  podplay-network:
    driver: bridge
```

### 4. Create Production Dockerfiles

#### Backend Dockerfile
```bash
nano backend/Dockerfile.prod
```

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs uploads

# Health check script
RUN echo '#!/bin/bash\ncurl -f http://localhost:5000/health || exit 1' > /health.sh && chmod +x /health.sh

# Expose port
EXPOSE 5000

# Production startup
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--worker-class", "gevent", "--worker-connections", "1000", "--timeout", "120", "app:app"]
```

#### Frontend Dockerfile
```bash
nano frontend/Dockerfile.prod
```

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 5. Create Nginx Configuration
```bash
nano frontend/nginx.conf
```

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    server {
        listen 80;
        server_name _;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API proxy to backend
        location /api/ {
            proxy_pass http://backend:5000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket support
        location /socket.io/ {
            proxy_pass http://backend:5000/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 🌐 Reverse Proxy & SSL Setup

### 1. Configure Main Nginx
```bash
sudo nano /etc/nginx/sites-available/podplay-sanctuary
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration (will be managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Main application
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://localhost:8081/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:8081/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Enable Site & Test Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/podplay-sanctuary /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 3. Setup SSL Certificate
```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🚀 Build and Deploy Application

### 1. Update Docker Compose Ports
```bash
nano docker-compose.prod.yml
```

Add port mappings:
```yaml
services:
  backend:
    # ... other config ...
    ports:
      - "8081:5000"
  
  frontend:
    # ... other config ...
    ports:
      - "8080:80"
```

### 2. Build and Start Services
```bash
# Build the application
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### 3. Monitor Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🔄 Deployment Automation

### 1. Create Deployment Script
```bash
nano deploy-vps.sh
chmod +x deploy-vps.sh
```

```bash
#!/bin/bash
# VPS Deployment Script for Podplay Sanctuary

set -e

echo "🐻 Mama Bear VPS Deployment Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APP_DIR="/opt/podplay-sanctuary"
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="/opt/backups/podplay"

# Create backup
echo -e "${YELLOW}📦 Creating backup...${NC}"
sudo mkdir -p $BACKUP_DIR
sudo cp $APP_DIR/sanctuary.db $BACKUP_DIR/sanctuary-$(date +%Y%m%d-%H%M%S).db

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
cd $APP_DIR
git pull origin main

# Rebuild and restart services
echo -e "${YELLOW}🔨 Rebuilding services...${NC}"
docker-compose -f $COMPOSE_FILE build --no-cache

echo -e "${YELLOW}🔄 Restarting services...${NC}"
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 30

if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Application available at: https://yourdomain.com${NC}"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}📋 Container status:${NC}"
    docker-compose -f $COMPOSE_FILE ps
    exit 1
fi

# Cleanup old Docker images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f
```

### 2. Create Systemd Service for Auto-Start
```bash
sudo nano /etc/systemd/system/podplay-sanctuary.service
```

```ini
[Unit]
Description=Podplay Sanctuary Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/opt/podplay-sanctuary
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=podplay
Group=podplay

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable podplay-sanctuary.service
sudo systemctl start podplay-sanctuary.service
```

## 📊 Monitoring & Maintenance

### 1. Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/podplay-sanctuary
```

```
/opt/podplay-sanctuary/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 podplay podplay
}
```

### 2. Create Backup Script
```bash
nano /opt/podplay-sanctuary/backup.sh
chmod +x /opt/podplay-sanctuary/backup.sh
```

```bash
#!/bin/bash
# Automated backup script

BACKUP_DIR="/opt/backups/podplay"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /opt/podplay-sanctuary/sanctuary.db $BACKUP_DIR/sanctuary-$DATE.db

# Backup configuration
tar -czf $BACKUP_DIR/config-$DATE.tar.gz /opt/podplay-sanctuary/.env.production

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 3. Setup Cron Jobs
```bash
crontab -e
```

Add these lines:
```cron
# Daily backup at 2 AM
0 2 * * * /opt/podplay-sanctuary/backup.sh >> /var/log/podplay-backup.log 2>&1

# Weekly SSL certificate renewal check
0 3 * * 0 /usr/bin/certbot renew --quiet

# Daily Docker cleanup
0 4 * * * /usr/bin/docker system prune -f
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using ports
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Kill process if needed
sudo fuser -k 80/tcp
```

#### 2. Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

#### 4. Database Migration Issues
```bash
# Backup current database
cp sanctuary.db sanctuary.db.backup

# Check logs for database errors
docker-compose -f docker-compose.prod.yml logs backend | grep -i database
```

### Performance Optimization

#### 1. Enable Docker Buildkit
```bash
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
```

#### 2. Optimize Nginx
```bash
sudo nano /etc/nginx/nginx.conf
```

Add these optimizations:
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # ... existing config ...
    
    # Performance optimizations
    tcp_nopush on;
    tcp_nodelay on;
    types_hash_max_size 2048;
    server_tokens off;
    
    # Buffers
    client_body_buffer_size 128k;
    client_max_body_size 16m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
}
```

## 🎉 Post-Deployment Checklist

- [ ] **SSL Certificate**: Verify HTTPS is working
- [ ] **Application Health**: Check all services are running
- [ ] **Database**: Verify data persistence
- [ ] **File Uploads**: Test file upload functionality
- [ ] **API Endpoints**: Test all API routes
- [ ] **WebSocket**: Verify real-time features work
- [ ] **Backups**: Confirm automated backups are working
- [ ] **Monitoring**: Setup monitoring alerts
- [ ] **Performance**: Run performance tests
- [ ] **Security**: Run security audit

## 📞 Support

If you encounter issues during deployment:

1. **Check Logs**: Always start with application logs
2. **Docker Status**: Verify all containers are healthy
3. **Network**: Ensure firewall rules are correct
4. **SSL**: Verify certificate status
5. **DNS**: Confirm domain points to your VPS

For additional support, refer to the main documentation or create an issue in the repository.

---

**🐻 Mama Bear says**: *"Your sanctuary is now ready for production! Remember to monitor your application and keep backups current."*
