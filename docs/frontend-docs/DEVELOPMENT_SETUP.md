# 🛠️ PodPlay Sanctuary Development Setup Guide

> **Complete developer environment setup and configuration guide for contributing to the PodPlay Sanctuary Agent Framework**

This guide provides step-by-step instructions for setting up a complete development environment, from initial installation to advanced debugging and testing procedures.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Service Initialization](#service-initialization)
5. [Development Workflow](#development-workflow)
6. [Testing Procedures](#testing-procedures)
7. [Debugging Guide](#debugging-guide)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Configuration](#advanced-configuration)

## 🔧 Prerequisites

### System Requirements

#### Minimum Requirements
- **OS**: macOS 10.15+, Ubuntu 20.04+, Windows 10+ (WSL2 recommended)
- **RAM**: 8GB (16GB recommended for workspace features)
- **Storage**: 20GB free space
- **CPU**: 2+ cores (4+ cores recommended)

#### Required Software
- **Python 3.12+** with pip
- **Node.js 20+** with npm/bun
- **Git 2.30+**
- **Docker 24+** (optional, for containerized workspaces)
- **Code Editor**: VS Code, PyCharm, or similar

#### Optional Tools
- **NixOS** (for reproducible environments)
- **PostgreSQL** (for production database)
- **Redis** (for caching and sessions)

### Verification Commands

Run these commands to verify your system meets the requirements:

```bash
# Check Python version
python3 --version  # Should be 3.12+

# Check Node.js version
node --version     # Should be v20+

# Check Git version
git --version      # Should be 2.30+

# Check Docker (if using containerized features)
docker --version   # Should be 24+

# Check available memory
free -h            # Linux
system_profiler SPHardwareDataType | grep Memory  # macOS
```

## 🚀 Environment Setup

### 1. Clone the Repository

```bash
# Clone the main repository
git clone https://github.com/your-org/podplay-sanctuary.git
cd podplay-sanctuary

# Create development branch
git checkout -b dev/your-feature-name
```

### 2. Python Environment Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 3. Frontend Environment Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies (using bun for speed)
bun install

# Or use npm if bun is not available
npm install

# Return to root directory
cd ..
```

### 4. Environment Variables Configuration

Create environment files for different stages:

#### Development Environment (`.env.development`)
```bash
# === DEVELOPMENT CONFIGURATION ===

# Application Settings
FLASK_ENV=development
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
LOG_LEVEL=DEBUG
PORT=5000

# Frontend Configuration
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database (SQLite for development)
DATABASE_URL=sqlite:///./dev_database.db
DB_ECHO=True

# === AI MODEL CONFIGURATION ===

# OpenAI Configuration
OPENAI_API_KEY=sk-your-development-key-here
OPENAI_ORG_ID=your-org-id

# Google Gemini Configuration  
GEMINI_API_KEY=your-gemini-development-key
GOOGLE_APPLICATION_CREDENTIALS=./config/dev-service-account.json
PRIMARY_SERVICE_ACCOUNT_PROJECT_ID=your-dev-gcp-project

# Anthropic Configuration
ANTHROPIC_API_KEY=sk-ant-your-development-key

# === ENHANCED SERVICES ===

# Mem0.ai (Persistent Memory)
MEM0_API_KEY=your-mem0-dev-key
MEM0_USER_ID=dev_user
MEM0_MEMORY_ENABLED=True
MEM0_RAG_ENABLED=True

# Together.ai (Code Execution Sandbox)
TOGETHER_AI_API_KEY=your-together-dev-key
TOGETHER_AI_SANDBOX_ENABLED=True
TOGETHER_AI_MODEL=meta-llama/Llama-2-70b-chat-hf

# === INTEGRATION SERVICES ===

# GitHub Integration
GITHUB_PAT=ghp_your-development-token
GITHUB_TOKEN=ghp_alternative-token
GITHUB_CALLBACK_URL=http://localhost:5000/oauth/github/callback

# Docker Configuration (if using containerized workspaces)
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_REGISTRY=localhost:5000

# === DEVELOPMENT FEATURES ===

# Hot Reload and Development Tools
HOT_RELOAD=True
DEBUG_TOOLBAR=True
PROFILING_ENABLED=True

# Mock Data and Testing
MOCK_DATA_ENABLED=True
ENABLE_TEST_ROUTES=True

# Performance Monitoring
ENABLE_METRICS=True
METRICS_PORT=9090

# === WORKSPACE CONFIGURATION ===

# NixOS VM Configuration
NIXOS_SANDBOX_BASE_IMAGE=./dev/nixos_vms/base.qcow2
NIXOS_VM_DEFAULT_MEMORY_MB=2048
NIXOS_VM_DEFAULT_VCPUS=2
NIXOS_MAX_CONCURRENT_VMS=3

# === SECURITY (Development) ===
RATE_LIMITING=False
ENABLE_CORS=True
SECURE_COOKIES=False
```

#### Production Environment (`.env.production`)
```bash
# === PRODUCTION CONFIGURATION ===

# Application Settings
FLASK_ENV=production
DEBUG=False
SECRET_KEY=your-super-secure-production-secret-key
LOG_LEVEL=INFO
PORT=5000

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@localhost:5432/podplay_production
DB_POOL_SIZE=20
DB_POOL_TIMEOUT=30

# === PRODUCTION AI CONFIGURATION ===

# Production API Keys (use environment-specific keys)
OPENAI_API_KEY=${PROD_OPENAI_API_KEY}
GEMINI_API_KEY=${PROD_GEMINI_API_KEY}
ANTHROPIC_API_KEY=${PROD_ANTHROPIC_API_KEY}

# Production Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/app/config/production-service-account.json
PRIMARY_SERVICE_ACCOUNT_PROJECT_ID=podplay-production

# === PRODUCTION SECURITY ===
RATE_LIMITING=True
RATE_LIMIT_STORAGE_URL=redis://localhost:6379/0
SESSION_TIMEOUT=3600
SECURE_COOKIES=True
HTTPS_ONLY=True

# === MONITORING ===
SENTRY_DSN=your-sentry-dsn
ENABLE_APM=True
LOG_TO_FILE=True
LOG_ROTATION=True
```

### 5. Service Account Setup

#### Google Cloud Service Account
```bash
# Create service account directory
mkdir -p config/

# Download your service account JSON file from Google Cloud Console
# Place it in config/dev-service-account.json for development

# Set proper permissions
chmod 600 config/dev-service-account.json

# Verify service account works
export GOOGLE_APPLICATION_CREDENTIALS=./config/dev-service-account.json
python3 -c "
import google.auth
credentials, project = google.auth.default()
print(f'Service account configured for project: {project}')
"
```

#### GitHub Integration Setup
```bash
# Create GitHub Personal Access Token
# 1. Go to GitHub Settings > Developer settings > Personal access tokens
# 2. Generate new token with these scopes:
#    - repo (full repository access)
#    - workflow (GitHub Actions access)
#    - read:org (organization read access)
# 3. Add token to .env.development as GITHUB_PAT
```

## 🗄️ Database Configuration

### Development Database (SQLite)

SQLite is used for development due to its simplicity and zero-configuration setup.

```bash
# Initialize development database
python3 -c "
from app import create_app
from models.database import init_database

app, socketio = create_app('development')
with app.app_context():
    init_database(app)
    print('Development database initialized successfully')
"

# Verify database creation
ls -la *.db  # Should show dev_database.db

# Check database schema
sqlite3 dev_database.db ".schema"
```

### Production Database (PostgreSQL)

For production environments, PostgreSQL is recommended.

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create production database
sudo -u postgres createdb podplay_production
sudo -u postgres createuser podplay_user
sudo -u postgres psql -c "ALTER USER podplay_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE podplay_production TO podplay_user;"
```

#### Database Migration
```bash
# Install Alembic for database migrations
pip install alembic

# Initialize migration repository
alembic init migrations

# Create first migration
alembic revision --autogenerate -m "Initial database schema"

# Apply migrations
alembic upgrade head
```

### Database Backup and Restore

#### Development (SQLite)
```bash
# Backup development database
cp dev_database.db backups/dev_backup_$(date +%Y%m%d_%H%M%S).db

# Restore from backup
cp backups/dev_backup_20240602_223045.db dev_database.db
```

#### Production (PostgreSQL)
```bash
# Backup production database
pg_dump -h localhost -U podplay_user podplay_production > backups/prod_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h localhost -U podplay_user podplay_production < backups/prod_backup_20240602_223045.sql
```

## 🔧 Service Initialization

### Development Service Startup

Create a development startup script:

```bash
#!/bin/bash
# dev-start.sh

echo "🚀 Starting PodPlay Sanctuary Development Environment"

# Activate Python virtual environment
source venv/bin/activate

# Load development environment variables
export $(cat .env.development | grep -v '^#' | xargs)

# Check and start required services
echo "📋 Checking required services..."

# Check Python dependencies
python3 -c "import flask, flask_socketio, flask_cors" || {
    echo "❌ Python dependencies missing. Run: pip install -r requirements.txt"
    exit 1
}

# Check Node.js dependencies
cd frontend && npm list --depth=0 >/dev/null 2>&1 || {
    echo "❌ Node.js dependencies missing. Run: cd frontend && npm install"
    exit 1
}
cd ..

# Start database (if using PostgreSQL)
if [[ $DATABASE_URL == postgresql* ]]; then
    echo "🗄️ Starting PostgreSQL..."
    brew services start postgresql 2>/dev/null || sudo systemctl start postgresql 2>/dev/null
fi

# Start Redis (if configured)
if [[ -n $REDIS_URL ]]; then
    echo "🔴 Starting Redis..."
    brew services start redis 2>/dev/null || sudo systemctl start redis 2>/dev/null
fi

echo "✅ All services ready!"

# Start backend and frontend in parallel
echo "🐍 Starting backend server on port $PORT..."
python3 app.py &
BACKEND_PID=$!

echo "⚛️ Starting frontend development server on port $FRONTEND_PORT..."
cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 3

echo "🌟 Development environment ready!"
echo "📍 Backend: http://localhost:$PORT"
echo "📍 Frontend: http://localhost:$FRONTEND_PORT"
echo "📍 API Docs: http://localhost:$PORT/api/docs"

# Handle shutdown
trap 'echo "🛑 Shutting down development environment..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT

# Keep script running
wait
```

Make the script executable:
```bash
chmod +x dev-start.sh
./dev-start.sh
```

### Service Health Verification

Create a health check script:

```bash
#!/bin/bash
# health-check.sh

echo "🏥 PodPlay Sanctuary Health Check"

# Check backend health
echo "🐍 Checking backend health..."
BACKEND_HEALTH=$(curl -s http://localhost:5000/api/test-connection | jq -r '.status' 2>/dev/null)
if [[ $BACKEND_HEALTH == "connected" ]]; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Check frontend health
echo "⚛️ Checking frontend health..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [[ $FRONTEND_HEALTH == "200" ]]; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# Check database connectivity
echo "🗄️ Checking database connectivity..."
python3 -c "
from models.database import get_db_connection
try:
    with get_db_connection() as conn:
        conn.execute('SELECT 1')
    print('✅ Database: Connected')
except Exception as e:
    print(f'❌ Database: {str(e)}')
"

# Check AI model availability
echo "🧠 Checking AI model availability..."
python3 -c "
import os
services = []
if os.getenv('OPENAI_API_KEY'): services.append('OpenAI')
if os.getenv('GEMINI_API_KEY'): services.append('Gemini')
if os.getenv('ANTHROPIC_API_KEY'): services.append('Anthropic')
print(f'✅ AI Models: {len(services)} configured ({", ".join(services)})')
"

# Check MCP servers
echo "🔌 Checking MCP servers..."
python3 -c "
from services.marketplace_service import MCPMarketplaceManager
try:
    manager = MCPMarketplaceManager()
    servers = manager.search_servers(limit=5)
    print(f'✅ MCP Marketplace: {len(servers)} servers available')
except Exception as e:
    print(f'❌ MCP Marketplace: {str(e)}')
"

echo "🏁 Health check complete!"
```

## 🔄 Development Workflow

### 1. Feature Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Set up development environment
./dev-start.sh

# 3. Make changes and test locally
# ... develop your feature ...

# 4. Run tests
python3 -m pytest tests/ -v
cd frontend && npm test

# 5. Run linting and formatting
black . --check
flake8 .
cd frontend && npm run lint

# 6. Commit changes
git add .
git commit -m "feat: add your feature description"

# 7. Push and create pull request
git push origin feature/your-feature-name
```

### 2. Code Quality Tools

#### Python Code Quality
```bash
# Install development tools
pip install black flake8 isort mypy pytest pytest-cov

# Format code
black .

# Check formatting
black . --check --diff

# Sort imports
isort .

# Lint code
flake8 .

# Type checking
mypy .

# Security scanning
bandit -r . -f json -o security-report.json
```

#### Frontend Code Quality
```bash
# Install frontend tools
cd frontend
npm install --save-dev eslint prettier @typescript-eslint/parser

# Lint TypeScript/JavaScript
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

### 3. Git Hooks Setup

Create pre-commit hooks for code quality:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running pre-commit checks..."

# Backend checks
echo "🐍 Checking Python code..."
black . --check || {
    echo "❌ Python code formatting failed. Run: black ."
    exit 1
}

flake8 . || {
    echo "❌ Python linting failed. Fix issues and try again."
    exit 1
}

# Frontend checks
echo "⚛️ Checking frontend code..."
cd frontend
npm run lint || {
    echo "❌ Frontend linting failed. Fix issues and try again."
    exit 1
}

npm run type-check || {
    echo "❌ TypeScript type checking failed. Fix issues and try again."
    exit 1
}

echo "✅ All pre-commit checks passed!"
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## 🧪 Testing Procedures

### Backend Testing

#### Unit Tests
```bash
# Run all tests
python3 -m pytest tests/ -v

# Run specific test file
python3 -m pytest tests/test_mama_bear_agent.py -v

# Run tests with coverage
python3 -m pytest tests/ --cov=services --cov-report=html

# Run tests in parallel
python3 -m pytest tests/ -n auto
```

#### Integration Tests
```bash
# Run integration tests
python3 -m pytest tests/integration/ -v

# Test API endpoints
python3 -m pytest tests/integration/test_chat_api.py -v

# Test MCP marketplace
python3 -m pytest tests/integration/test_mcp_marketplace.py -v
```

#### Test Configuration
```python
# tests/conftest.py
import pytest
from app import create_app
from models.database import init_database
import tempfile
import os

@pytest.fixture
def app():
    """Create test app instance"""
    db_fd, db_path = tempfile.mkstemp()
    
    app, socketio = create_app('testing')
    app.config.update({
        'TESTING': True,
        'DATABASE_URL': f'sqlite:///{db_path}',
        'SECRET_KEY': 'test-secret-key'
    })
    
    with app.app_context():
        init_database(app)
    
    yield app
    
    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()
```

#### Example Test Cases
```python
# tests/test_mama_bear_agent.py
import pytest
from services.mama_bear_agent import MamaBearAgent

def test_mama_bear_initialization():
    """Test Mama Bear agent initialization"""
    agent = MamaBearAgent()
    assert agent.name == "MamaBearAgent"
    assert agent.version is not None

def test_mama_bear_response(app):
    """Test Mama Bear response generation"""
    with app.app_context():
        agent = MamaBearAgent()
        response = agent.get_response(
            message="Hello, how are you?",
            user_id="test_user"
        )
        assert response['success'] is True
        assert 'response' in response
        assert len(response['response']) > 0

def test_mama_bear_context_awareness(app):
    """Test context-aware responses"""
    with app.app_context():
        agent = MamaBearAgent()
        
        # Store context
        agent.store_memory("User prefers React development")
        
        # Get response with context
        response = agent.get_response(
            message="Help me with a frontend issue",
            user_id="test_user"
        )
        
        assert response['success'] is True
        # Response should mention React due to stored context
        assert 'react' in response['response'].lower()
```

### Frontend Testing

#### Component Tests
```bash
# Run all frontend tests
cd frontend
npm test

# Run specific test
npm test -- --testNamePattern="ChatInterface"

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

#### Example Component Test
```typescript
// frontend/src/components/__tests__/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '../ChatInterface';
import { api } from '../../lib/api';

// Mock API calls
jest.mock('../../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ChatInterface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat interface', () => {
    render(<ChatInterface />);
    expect(screen.getByPlaceholderText(/message mama bear/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('sends message when form is submitted', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        response: 'Hello! How can I help you?',
        message_id: 'msg_123'
      }
    });

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/message mama bear/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/api/chat/mama-bear', {
        message: 'Hello',
        user_id: expect.any(String)
      });
    });
  });

  test('displays error message on API failure', async () => {
    mockedApi.post.mockRejectedValueOnce(new Error('API Error'));

    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/message mama bear/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });
  });
});
```

#### End-to-End Testing
```bash
# Install Playwright for E2E testing
cd frontend
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test

# Run E2E tests with UI
npx playwright test --ui
```

```typescript
// frontend/e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete chat flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000');

  // Wait for app to load
  await expect(page.getByText('PodPlay Studio')).toBeVisible();

  // Navigate to Mama Bear chat
  await page.click('[data-testid="mama-bear-chat"]');

  // Send a message
  await page.fill('[data-testid="chat-input"]', 'Hello, can you help me?');
  await page.click('[data-testid="send-button"]');

  // Wait for response
  await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 10000 });

  // Verify message appears in chat
  await expect(page.getByText('Hello, can you help me?')).toBeVisible();
});
```

## 🐛 Debugging Guide

### Backend Debugging

#### Debug Mode Setup
```python
# app.py - Development configuration
if __name__ == '__main__':
    app, socketio = create_app('development')
    
    # Enable debug mode
    app.config['DEBUG'] = True
    app.config['TESTING'] = True
    
    # Run with debugger
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=True,
        use_debugger=True
    )
```

#### VS Code Debug Configuration
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Flask Backend",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/app.py",
            "env": {
                "FLASK_ENV": "development",
                "PYTHONPATH": "${workspaceFolder}"
            },
            "console": "integratedTerminal",
            "justMyCode": false
        },
        {
            "name": "Python: Pytest",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["tests/", "-v"],
            "console": "integratedTerminal",
            "justMyCode": false
        }
    ]
}
```

#### Logging Configuration
```python
# utils/logging_setup.py - Enhanced for debugging
import logging
import sys
from datetime import datetime

def setup_debug_logging():
    """Setup detailed logging for debugging"""
    
    # Create formatter with detailed information
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    # Console handler with debug level
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)
    console_handler.setFormatter(formatter)
    
    # File handler for persistent logging
    file_handler = logging.FileHandler(f'debug_{datetime.now().strftime("%Y%m%d")}.log')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Set specific loggers
    logging.getLogger('werkzeug').setLevel(logging.INFO)
    logging.getLogger('socketio').setLevel(logging.DEBUG)
    logging.getLogger('engineio').setLevel(logging.DEBUG)
```

#### Common Debugging Scenarios

##### Debugging AI Model Responses
```python
# Add to services/mama_bear_agent.py
import logging
logger = logging.getLogger(__name__)

def get_response(self, message, context=None):
    logger.debug(f"Processing message: {message[:100]}...")
    logger.debug(f"Context provided: {bool(context)}")
    
    try:
        # Your existing code...
        response = self.model_router.route_request(request_data)
        
        logger.debug(f"Model used: {response.get('model_used')}")
        logger.debug(f"Response length: {len(response.get('response', ''))}")
        logger.debug(f"Cost: ${response.get('cost', 0):.4f}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating response: {e}", exc_info=True)
        raise
```

##### Debugging MCP Server Connections
```python
# Add to services/marketplace_service.py
def install_server(self, server_name, config):
    logger.debug(f"Installing MCP server: {server_name}")
    logger.debug(f"Configuration: {config}")
    
    try:
        # Installation logic...
        result = self._perform_installation(server_name, config)
        
        logger.debug(f"Installation result: {result}")
        return result
        
    except Exception as e:
        logger.error(f"MCP server installation failed: {e}", exc_info=True)
        # Log additional context
        logger.error(f"Server name: {server_name}")
        logger.error(f"Config: {config}")
        raise
```

### Frontend Debugging

#### Browser DevTools Setup
```typescript
// frontend/src/lib/debug.ts
export const debug = {
  enabled: process.env.NODE_ENV === 'development',
  
  log: (...args: any[]) => {
    if (debug.enabled) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
  
  api: (method: string, url: string, data?: any) => {
    if (debug.enabled) {
      console.group(`[API] ${method.toUpperCase()} ${url}`);
      if (data) console.log('Data:', data);
      console.groupEnd();
    }
  }
};

// Make debug available globally in development
if (debug.enabled) {
  (window as any).debug = debug;
}
```

#### React DevTools Configuration
```typescript
// frontend/src/index.tsx
if (process.env.NODE_ENV === 'development') {
  // Enable React DevTools
  import('@hookform/devtools').then(({ DevTool }) => {
    // Hook form debugging
  });
  
  // Enable Zustand DevTools
  import('zustand/middleware').then(({ devtools }) => {
    // State debugging
  });
}
```

#### API Debugging
```typescript
// frontend/src/lib/api.ts - Enhanced with debugging
import axios from 'axios';
import { debug } from './debug';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    debug.api(config.method || 'unknown', config.url || '', config.data);
    return config;
  },
  (error) => {
    debug.error('Request failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    debug.log(`[API Response] ${response.status}:`, response.data);
    return response;
  },
  (error) => {
    debug.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);
```

### Network Debugging

#### WebSocket Connection Debugging
```typescript
// frontend/src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { debug } from '../lib/debug';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Debug connection events
    newSocket.on('connect', () => {
      debug.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      debug.log('Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      debug.error('Socket connection error:', error);
    });

    // Debug all events in development
    if (debug.enabled) {
      const originalEmit = newSocket.emit;
      newSocket.emit = function(event, ...args) {
        debug.log(`[Socket Emit] ${event}:`, args);
        return originalEmit.apply(this, [event, ...args]);
      };

      const originalOn = newSocket.on;
      newSocket.on = function(event, callback) {
        return originalOn.call(this, event, (...args) => {
          debug.log(`[Socket Receive] ${event}:`, args);
          return callback(...args);
        });
      };
    }

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};
```

## ⚡ Performance Optimization

### Backend Performance

#### Database Optimization
```python
# models/database.py - Connection pooling
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

def create_optimized_engine(database_url):
    """Create optimized database engine"""
    return create_engine(
        database_url,
        poolclass=QueuePool,
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False  # Disable in production
    )

# Query optimization
def get_chat_history_optimized(user_id, limit=50):
    """Optimized chat history query"""
    with get_db_connection() as conn:
        # Use indexed query with limit
        result = conn.execute('''
            SELECT message_id, user_message, ai_response, timestamp
            FROM chat_messages 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (user_id, limit))
        
        return [dict(row) for row in result.fetchall()]
```

#### Caching Implementation
```python
# utils/cache.py
from functools import wraps
import json
import hashlib
from datetime import datetime, timedelta

class SimpleCache:
    def __init__(self):
        self.cache = {}
        self.expiry = {}
    
    def get(self, key):
        if key in self.cache and self.expiry.get(key, datetime.min) > datetime.now():
            return self.cache[key]
        return None
    
    def set(self, key, value, ttl_seconds=300):
        self.cache[key] = value
        self.expiry[key] = datetime.now() + timedelta(seconds=ttl_seconds)
    
    def clear_expired(self):
        now = datetime.now()
        expired_keys = [k for k, exp in self.expiry.items() if exp <= now]
        for key in expired_keys:
            self.cache.pop(key, None)
            self.expiry.pop(key, None)

# Global cache instance
cache = SimpleCache()

def cached(ttl_seconds=300):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            key_data = f"{func.__name__}:{args}:{sorted(kwargs.items())}"
            cache_key = hashlib.md5(key_data.encode()).hexdigest()
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result
        
        return wrapper
    return decorator

# Usage example
@cached(ttl_seconds=600)
def get_mcp_servers():
    """Cached MCP server list"""
    return marketplace_manager.search_servers()
```

#### Async Optimization
```python
# services/async_agent.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncMamaBear:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def process_multiple_requests(self, requests):
        """Process multiple requests concurrently"""
        tasks = [
            self.process_request_async(request) 
            for request in requests
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def process_request_async(self, request):
        """Process single request asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor, 
            self._process_request_sync, 
            request
        )
    
    def _process_request_sync(self, request):
        """Synchronous request processing"""
        # Your existing synchronous code
        pass
```

### Frontend Performance

#### Code Splitting
```typescript
// frontend/src/router.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load components
const MainChat = lazy(() => import('./pages/MainChat'));
const MCPMarketplace = lazy(() => import('./pages/MCPMarketplace'));
const DevWorkspaces = lazy(() => import('./pages/DevWorkspaces'));

export const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/chat" element={<MainChat />} />
        <Route path="/marketplace" element={<MCPMarketplace />} />
        <Route path="/workspaces" element={<DevWorkspaces />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
```

#### State Management Optimization
```typescript
// frontend/src/stores/chatStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        messages: [],
        isLoading: false,
        
        addMessage: (message) =>
          set((state) => {
            state.messages.push(message);
            // Keep only last 100 messages for performance
            if (state.messages.length > 100) {
              state.messages = state.messages.slice(-100);
            }
          }),
        
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),
      }))
    )
  )
);

// Selector hooks for optimized re-renders
export const useMessages = () => useChatStore((state) => state.messages);
export const useIsLoading = () => useChatStore((state) => state.isLoading);
```

#### React Performance
```typescript
// frontend/src/components/ChatMessage.tsx
import React, { memo } from 'react';

interface ChatMessageProps {
  message: Message;
  onEdit?: (id: string) => void;
}

export const ChatMessage = memo<ChatMessageProps>(({ message, onEdit }) => {
  // Memoized component prevents unnecessary re-renders
  return (
    <div className="chat-message">
      <div className="message-content">{message.content}</div>
      {onEdit && (
        <button onClick={() => onEdit(message.id)}>
          Edit
        </button>
      )}
    </div>
  );
});

// Custom hooks for optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Issue: SQLite database locked
# Solution: Check for hanging connections
lsof | grep database.db

# Kill processes using the database
kill -9 <process_id>

# Reset database if corrupted
rm dev_database.db
python3 -c "from app import create_app; from models.database import init_database; app, _ = create_app(); init_database(app)"
```

#### Python Import Errors
```bash
# Issue: Module not found errors
# Solution: Check Python path and virtual environment

# Verify virtual environment is activated
which python3  # Should point to venv/bin/python3

# Check installed packages
pip list | grep flask

# Reinstall requirements if needed
pip install -r requirements.txt --force-reinstall
```

#### Node.js/Frontend Issues
```bash
# Issue: npm/bun install failures
# Solution: Clear cache and reinstall

cd frontend

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If using bun
rm -rf node_modules bun.lockb
bun install
```

#### API Connection Issues
```bash
# Issue: Frontend can't connect to backend
# Solution: Check CORS and network configuration

# Test backend directly
curl -v http://localhost:5000/api/test-connection

# Check if backend is running
netstat -an | grep :5000

# Verify environment variables
echo $VITE_API_BASE_URL  # Should be http://localhost:5000
```

#### WebSocket Connection Issues
```typescript
// frontend/src/lib/socketDiagnostics.ts
export const diagnoseSocketConnection = () => {
  const socket = io(import.meta.env.VITE_API_BASE_URL, {
    transports: ['websocket', 'polling'],
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket connected');
    console.log('Socket ID:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ WebSocket connection failed:', error);
    console.log('Falling back to polling...');
  });

  socket.on('disconnect', (reason) => {
    console.log('WebSocket disconnected:', reason);
  });

  return socket;
};
```

### Performance Issues

#### Memory Leaks
```python
# Backend memory monitoring
import psutil
import gc
from functools import wraps

def monitor_memory(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        process = psutil.Process()
        memory_before = process.memory_info().rss / 1024 / 1024  # MB
        
        result = func(*args, **kwargs)
        
        memory_after = process.memory_info().rss / 1024 / 1024  # MB
        memory_diff = memory_after - memory_before
        
        if memory_diff > 10:  # Alert if > 10MB increase
            logger.warning(f"Memory increase: {memory_diff:.2f}MB in {func.__name__}")
            # Force garbage collection
            gc.collect()
        
        return result
    return wrapper
```

#### Database Performance
```sql
-- Check SQLite performance
PRAGMA compile_options;
PRAGMA cache_size = 10000;
PRAGMA synchronous = NORMAL;
PRAGMA journal_mode = WAL;
PRAGMA temp_store = MEMORY;

-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM chat_messages WHERE user_id = ?;

-- Create indexes for common queries
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
```

### Log Analysis

#### Backend Log Analysis
```bash
# Analyze error patterns
grep "ERROR" mama_bear.log | tail -20

# Count error types
grep "ERROR" mama_bear.log | cut -d'-' -f4 | sort | uniq -c

# Monitor API response times
grep "response_time" mama_bear.log | awk '{print $NF}' | sort -n | tail -10

# Watch logs in real-time
tail -f mama_bear.log | grep -E "(ERROR|WARNING)"
```

#### Frontend Log Analysis
```typescript
// frontend/src/utils/errorReporting.ts
export class ErrorReporter {
  private errors: Array<{ error: Error; timestamp: Date; context?: any }> = [];

  report(error: Error, context?: any) {
    this.errors.push({
      error,
      timestamp: new Date(),
      context
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`Error at ${new Date().toISOString()}`);
      console.error(error);
      if (context) console.log('Context:', context);
      console.groupEnd();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(error, context);
    }
  }

  getErrorSummary() {
    return {
      totalErrors: this.errors.length,
      recentErrors: this.errors.slice(-10),
      errorTypes: this.errors.reduce((acc, { error }) => {
        const type = error.constructor.name;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private sendToMonitoring(error: Error, context?: any) {
    // Implementation for production error monitoring
    // e.g., Sentry, LogRocket, etc.
  }
}

export const errorReporter = new ErrorReporter();
```

This comprehensive development setup guide provides everything needed to establish a professional development environment for the PodPlay Sanctuary Agent Framework, from initial setup through advanced debugging and optimization techniques.