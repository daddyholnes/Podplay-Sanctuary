# backend/app.py (Updated for seamless frontend integration)
#!/usr/bin/env python3
"""
Podplay Build Backend - Enhanced for React Frontend Integration
The Sanctuary for Calm, Empowered Creation with Professional UI Support
"""

import os
import sys
import logging
from flask import Flask, send_from_directory, send_file
from flask_socketio import SocketIO
from flask_cors import CORS

# Configure UTF-8 encoding for Windows compatibility
if os.name == 'nt':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except:
            pass

def create_app(config_name='development'):
    """
    Enhanced application factory with React frontend support
    
    Args:
        config_name: Configuration environment (development, production, testing)
        
    Returns:
        tuple: (Flask app, SocketIO instance)
    """
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    
    # Load configuration
    from config.settings import get_config
    app.config.from_object(get_config(config_name))
    
    # Configure logging first
    from utils.logging_setup import setup_logging
    setup_logging(app)
    
    logger = logging.getLogger(__name__)
    logger.info("🐻 Initializing Podplay Sanctuary Backend with React Frontend Support")
    
    # Enhanced CORS configuration for React development
    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
            "expose_headers": ["Content-Type", "X-Total-Count"],
            "supports_credentials": True,
            "max_age": 600
        }
    })
    
    # Initialize SocketIO with enhanced frontend support
    socketio = SocketIO(
        app,
        cors_allowed_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
        async_mode='threading',
        logger=True,
        engineio_logger=False,
        ping_timeout=60,
        ping_interval=25,
        manage_session=False,
        path='/socket.io/'
    )
    
    # Initialize database
    from models.database import init_database
    init_database(app)
    
    # Initialize services FIRST - before registering blueprints
    from services import initialize_services
    initialize_services(app)
    
    # Register API blueprints AFTER services are initialized
    from api import register_blueprints
    register_blueprints(app)
    
    # Register Socket.IO handlers
    from api.blueprints.socket_handlers import register_socket_handlers
    register_socket_handlers(socketio)
    
    # Register global error handlers
    from utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    # React Frontend Routes (for production)
    @app.route('/')
    def serve_react_app():
        """Serve the main React application"""
        try:
            return send_file('../frontend/dist/index.html')
        except FileNotFoundError:
            # Development fallback
            return {
                "service": "Podplay Sanctuary Backend",
                "status": "running", 
                "message": "React frontend not built. Run 'npm run build' in frontend directory.",
                "api_available": True,
                "endpoints": {
                    "health": "/health",
                    "chat": "/api/chat/mama-bear",
                    "mcp": "/api/mcp/search",
                    "scout": "/api/v1/scout_agent/projects"
                }
            }
    
    @app.route('/api/frontend/config', methods=['GET'])
    def get_frontend_config():
        """Provide frontend configuration and feature flags"""
        return {
            "api_base_url": request.host_url.rstrip('/'),
            "socket_url": request.host_url.rstrip('/'),
            "features": {
                "mama_bear_chat": True,
                "mcp_marketplace": True,
                "scout_agent": True,
                "code_execution": bool(os.getenv('TOGETHER_AI_API_KEY')),
                "persistent_memory": bool(os.getenv('MEM0_API_KEY')),
                "vertex_ai": bool(os.getenv('GOOGLE_APPLICATION_CREDENTIALS')),
                "nixos_workspaces": app.config.get('NIXOS_INFRASTRUCTURE_ENABLED', False)
            },
            "themes": {
                "available": ["light", "dark", "sensory"],
                "default": "dark"
            },
            "accessibility": {
                "reduced_motion_support": True,
                "high_contrast_support": True,
                "screen_reader_support": True
            }
        }
    
    # Catch-all route for React Router (SPA support)
    @app.route('/<path:path>')
    def serve_react_routes(path):
        """Handle React Router routes in production"""
        try:
            # Try to serve static files first
            return send_from_directory('../frontend/dist', path)
        except FileNotFoundError:
            # Fall back to React app for SPA routing
            try:
                return send_file('../frontend/dist/index.html')
            except FileNotFoundError:
                return {"error": "Frontend not built"}, 404
    
    logger.info("🌟 Podplay Sanctuary Backend initialized successfully")
    logger.info("🐻 Mama Bear Control Center ready")
    logger.info("⚛️ React Frontend integration enabled")
    
    return app, socketio

# Enhanced error handling for API responses
@app.errorhandler(404)
def not_found_handler(error):
    """Enhanced 404 handler that differentiates API and frontend routes"""
    if request.path.startswith('/api/'):
        return {
            "error": "API endpoint not found",
            "path": request.path,
            "available_endpoints": [
                "/api/chat/mama-bear",
                "/api/mcp/search", 
                "/api/v1/scout_agent/projects",
                "/api/dev/ping",
                "/health"
            ]
        }, 404
    else:
        # Try to serve React app for frontend routes
        try:
            return send_file('../frontend/dist/index.html')
        except FileNotFoundError:
            return {"error": "Frontend not available"}, 404

if __name__ == '__main__':
    try:
        app, socketio = create_app()
        
        print("🚀 Starting Podplay Sanctuary Backend Server...")
        print("🐻 Mama Bear Control Center is ready!")
        print("⚛️ React Frontend integration enabled!")
        print("🌐 Server will be available at: http://127.0.0.1:5000")
        print("🎨 Frontend will be available at: http://127.0.0.1:3000 (development)")
        print("📡 API endpoints ready for frontend connections")
        print("🔌 Socket.IO enabled for real-time communication")
        print("==================================================")
        
        socketio.run(
            app,
            host="0.0.0.0",
            port=5000,
            debug=True,
            use_reloader=False,
            allow_unsafe_werkzeug=True,
            log_output=True
        )
        
    except Exception as e:
        logging.error(f"💥 Failed to start server: {e}")
        sys.exit(1)

# docker-compose.yml (Complete development setup)
version: '3.8'

services:
  # Backend Service
  podplay-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - FLASK_DEBUG=True
      - DATABASE_URL=sqlite:///sanctuary.db
      - MEM0_API_KEY=${MEM0_API_KEY}
      - TOGETHER_AI_API_KEY=${TOGETHER_AI_API_KEY}
      - GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./backend:/app
      - ./backend/data:/app/data
      - ./credentials:/app/credentials:ro
    networks:
      - sanctuary-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  podplay-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://localhost:5000
      - VITE_SOCKET_URL=http://localhost:5000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - podplay-backend
    networks:
      - sanctuary-network
    command: npm run dev

  # Database (PostgreSQL for production)
  sanctuary-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=sanctuary
      - POSTGRES_USER=sanctuary_user
      - POSTGRES_PASSWORD=sanctuary_pass
    volumes:
      - sanctuary_db_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - sanctuary-network
    profiles:
      - production

  # Redis for caching and sessions
  sanctuary-redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - sanctuary_redis_data:/data
    networks:
      - sanctuary-network
    profiles:
      - production

networks:
  sanctuary-network:
    driver: bridge

volumes:
  sanctuary_db_data:
  sanctuary_redis_data:

# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/data /app/logs

# Set proper permissions
RUN chmod +x /app/app.py

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Expose port
EXPOSE 5000

# Start the application
CMD ["python", "app.py"]

# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create build directory
RUN mkdir -p dist

# Expose port
EXPOSE 3000

# Development command (will be overridden by docker-compose)
CMD ["npm", "run", "dev"]

# frontend/Dockerfile.prod (Production build)
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# frontend/nginx.conf (Production nginx configuration)
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Handle React Router routes
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy (for production if needed)
        location /api/ {
            proxy_pass http://backend:5000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Socket.IO proxy
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

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}

# scripts/start-development.sh
#!/bin/bash

echo "🐻 Starting Podplay Sanctuary Development Environment"
echo "=================================================="

# Check if required commands exist
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v python >/dev/null 2>&1 || { echo "❌ Python is required but not installed. Aborting." >&2; exit 1; }

# Create necessary directories
mkdir -p backend/data backend/logs frontend/dist

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "📝 Please edit .env file with your API keys"
    else
        echo "❌ No .env.example found. Please create .env file manually."
        exit 1
    fi
fi

# Start backend
echo "🐻 Starting Mama Bear Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "🚀 Starting backend server..."
python app.py &
BACKEND_PID=$!

# Switch to frontend
cd ../frontend

# Install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend
echo "⚛️ Starting React frontend..."
npm run dev &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

echo ""
echo "✅ Podplay Sanctuary is starting up!"
echo "🌐 Frontend: http://localhost:3000"
echo "🐻 Backend:  http://localhost:5000"
echo "📡 API Docs: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Wait for processes
wait $BACKEND_PID
wait $FRONTEND_PID

# scripts/build-production.sh
#!/bin/bash

echo "🏗️ Building Podplay Sanctuary for Production"
echo "============================================="

# Build frontend
echo "⚛️ Building React frontend..."
cd frontend
npm run build
cd ..

# Copy frontend build to backend static folder
echo "📁 Copying frontend build to backend..."
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

# Build backend container
echo "🐻 Building backend container..."
cd backend
docker build -t podplay-sanctuary-backend .
cd ..

# Build frontend container for production
echo "🌐 Building frontend container..."
cd frontend
docker build -f Dockerfile.prod -t podplay-sanctuary-frontend .
cd ..

echo "✅ Production build complete!"
echo "🚀 To deploy: docker-compose -f docker-compose.prod.yml up -d"

# .env.example
# 🐻 Podplay Build Sanctuary - Environment Configuration Template
# Copy this to .env and fill in your values

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=app.py

# Sanctuary Settings
SANCTUARY_NAME="Your Podplay Build Sanctuary"
MAMA_BEAR_PERSONALITY=gentle_supportive

# Database Configuration
DATABASE_URL=sqlite:///sanctuary.db

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# AI/ML Integration (Enhanced Mama Bear Capabilities)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Mem0.ai Configuration (Persistent Chat Memory)
MEM0_API_KEY=your_mem0_api_key_here
MEM0_USER_ID=sanctuary_user

# Together.ai Configuration (VM Sandbox)
TOGETHER_AI_API_KEY=your_together_ai_api_key_here
TOGETHER_AI_MODEL=meta-llama/Llama-2-70b-chat-hf

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
GOOGLE_CLOUD_PROJECT=your_project_id

# Development Settings
HOT_RELOAD=True
DEBUG_TOOLBAR=True

# Security Settings (Change in production!)
SECRET_KEY=change_this_in_production_sanctuary_secret_2024

# package.json (Root project management)
{
  "name": "podplay-sanctuary",
  "version": "1.0.0",
  "description": "Podplay Build Sanctuary - Complete Development Environment",
  "private": true,
  "scripts": {
    "dev": "./scripts/start-development.sh",
    "build": "./scripts/build-production.sh",
    "start": "docker-compose up -d",
    "stop": "docker-compose down",
    "logs": "docker-compose logs -f",
    "install": "cd frontend && npm install && cd ../backend && pip install -r requirements.txt",
    "clean": "docker-compose down -v && docker system prune -f",
    "backend": "cd backend && python app.py",
    "frontend": "cd frontend && npm run dev",
    "test": "cd frontend && npm test && cd ../backend && python -m pytest",
    "lint": "cd frontend && npm run lint",
    "format": "cd frontend && npm run format"
  },
  "workspaces": [
    "frontend"
  ],
  "keywords": [
    "sanctuary",
    "neurodiverse",
    "accessibility",
    "development",
    "ai-agent",
    "mama-bear"
  ],
  "author": "Podplay Sanctuary Team",
  "license": "MIT"
}