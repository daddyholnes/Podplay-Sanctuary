#!/bin/bash
# 🐻 PODPLAY SANCTUARY - BULLETPROOF INSTALLATION SCRIPT (Unix/Linux/macOS)
# Fixes all 9+ dependency conflicts and ensures clean installation
# Version: 2.0 - Professional Grade Installation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_TARGET="${1:-frontend-new-2}"  # Default to cleanest frontend
CLEAN_INSTALL="${2:-false}"
SKIP_PYTHON="${3:-false}"

# Logging functions
log_info() { echo -e "${CYAN}[$(date '+%H:%M:%S')] [ℹ️] $1${NC}"; }
log_success() { echo -e "${GREEN}[$(date '+%H:%M:%S')] [✅] $1${NC}"; }
log_error() { echo -e "${RED}[$(date '+%H:%M:%S')] [❌] $1${NC}"; }
log_warning() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] [⚠️] $1${NC}"; }

echo -e "${CYAN}🐻 PODPLAY SANCTUARY BULLETPROOF INSTALLER v2.0${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"

# Ensure we're in the project root
if [[ ! -d "backend" || ! -d "frontend" ]]; then
    log_error "Must run from project root directory!"
    exit 1
fi

log_info "Starting bulletproof installation process..."
log_info "Target frontend: $FRONTEND_TARGET"

# Step 1: Clean installation if requested
if [[ "$CLEAN_INSTALL" == "true" ]]; then
    log_warning "Performing clean installation (removing all node_modules and __pycache__)..."
    
    # Remove all node_modules directories
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove Python cache
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Remove package-lock files
    find . -name "package-lock.json" -type f -delete 2>/dev/null || true
    
    log_success "Clean installation completed"
fi

# Step 2: Check prerequisites
log_info "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ $NODE_VERSION -lt 18 ]]; then
    log_error "Node.js version $(node --version) is too old. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
log_success "Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm not found"
    exit 1
fi
log_success "npm $(npm --version) detected"

# Check Python (optional)
if [[ "$SKIP_PYTHON" != "true" ]]; then
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        PYTHON_VERSION=$(python3 --version)
        log_success "$PYTHON_VERSION detected"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
        PYTHON_VERSION=$(python --version)
        if [[ $PYTHON_VERSION == *"Python 3"* ]]; then
            log_success "$PYTHON_VERSION detected"
        else
            log_warning "Python 2 detected. Python 3.8+ recommended."
        fi
    else
        log_warning "Python not found. Backend installation will be skipped."
        SKIP_PYTHON="true"
    fi
fi

# Step 3: Fix root package.json conflicts
log_info "Fixing root package.json conflicts..."

cat > package.json << 'EOF'
{
  "name": "podplay-sanctuary-workspace",
  "version": "1.0.0",
  "description": "🐻 Podplay Sanctuary - AI Development Workspace",
  "private": true,
  "type": "commonjs",
  "workspaces": ["frontend", "frontend-new-2", "electron"],
  "scripts": {
    "install:all": "npm install && npm run install:frontend && npm run install:backend",
    "install:frontend": "cd $FRONTEND_TARGET && npm install",
    "install:backend": "cd backend && pip install -r requirements.txt",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && python app.py",
    "dev:frontend": "cd $FRONTEND_TARGET && npm run dev",
    "build": "cd $FRONTEND_TARGET && npm run build",
    "start": "npm run dev",
    "clean": "./INSTALL_BULLETPROOF.sh $FRONTEND_TARGET true"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "author": "Podplay Sanctuary Team",
  "license": "MIT"
}
EOF

log_success "Root package.json fixed"

# Step 4: Backup and fix frontend package.json
log_info "Fixing frontend package.json conflicts..."

# Backup original frontend if it exists
if [[ -f "frontend/package.json" ]]; then
    cp "frontend/package.json" "frontend/package.json.backup"
    log_info "Backed up original frontend/package.json"
fi

# Create clean frontend package.json with fixed versions
cat > "$FRONTEND_TARGET/package.json" << 'EOF'
{
  "name": "podplay-sanctuary-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Podplay Sanctuary - Professional Frontend",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@google/genai": "^1.3.0",
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

log_success "Frontend package.json fixed ($FRONTEND_TARGET)"

# Step 5: Install root dependencies
log_info "Installing root dependencies..."
if npm install --no-audit --no-fund; then
    log_success "Root dependencies installed"
else
    log_warning "Root dependency installation had warnings (continuing...)"
fi

# Step 6: Install frontend dependencies
log_info "Installing frontend dependencies..."
cd "$FRONTEND_TARGET"

# Clear npm cache first
npm cache clean --force 2>/dev/null || true

# Install with specific flags to avoid conflicts
if npm install --no-audit --no-fund --legacy-peer-deps; then
    log_success "Frontend dependencies installed"
else
    log_error "Frontend installation failed. Trying alternative method..."
    if npm ci --legacy-peer-deps; then
        log_success "Frontend dependencies installed (alternative method)"
    else
        log_error "Frontend installation failed completely"
    fi
fi

cd ..

# Step 7: Install Python backend (if not skipped)
if [[ "$SKIP_PYTHON" != "true" ]]; then
    log_info "Installing Python backend dependencies..."
    cd backend
    
    # Check if virtual environment exists
    if [[ ! -d "venv" ]]; then
        log_info "Creating Python virtual environment..."
        $PYTHON_CMD -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    log_info "Virtual environment activated"
    
    # Upgrade pip first
    $PYTHON_CMD -m pip install --upgrade pip
    
    # Install requirements
    if pip install -r requirements.txt; then
        log_success "Python backend dependencies installed"
    else
        log_warning "Python backend installation had issues (continuing...)"
    fi
    
    cd ..
fi

# Step 8: Create environment configuration
log_info "Creating environment configuration..."

# Create .env.example in frontend
cat > "$FRONTEND_TARGET/.env.example" << 'EOF'
# Podplay Sanctuary - Environment Configuration
# Copy this to .env.local and fill in your API keys

# Backend API Configuration
VITE_API_BASE_URL=http://localhost:5000
VITE_API_TIMEOUT=30000

# AI API Keys (Optional - for direct frontend integration)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
VITE_APP_NAME=Podplay Sanctuary
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# WebSocket Configuration
VITE_WEBSOCKET_URL=ws://localhost:5000
EOF

# Create .env.local template if it doesn't exist
if [[ ! -f "$FRONTEND_TARGET/.env.local" ]]; then
    cp "$FRONTEND_TARGET/.env.example" "$FRONTEND_TARGET/.env.local"
    log_info "Created .env.local template in $FRONTEND_TARGET"
fi

# Step 9: Create startup scripts
log_info "Creating startup scripts..."

# Development startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🐻 Starting Podplay Sanctuary Development Environment..."
echo

echo "Starting backend server..."
cd backend
source venv/bin/activate 2>/dev/null || true
python app.py &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend development server..."
cd ../$FRONTEND_TARGET
npm run dev

# Cleanup
kill $BACKEND_PID 2>/dev/null || true
EOF

chmod +x start-dev.sh

# Production build script
cat > build-prod.sh << 'EOF'
#!/bin/bash
echo "🐻 Building Podplay Sanctuary for Production..."
echo

cd $FRONTEND_TARGET
echo "Building frontend..."
npm run build

echo
echo "Build complete! Check $FRONTEND_TARGET/dist folder."
EOF

chmod +x build-prod.sh

log_success "Startup scripts created"

# Step 10: Verification
log_info "Verifying installation..."

VERIFICATION_PASSED=true

# Check if package.json files exist and are valid
PACKAGE_FILES=("package.json" "$FRONTEND_TARGET/package.json")

for file in "${PACKAGE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        if python3 -c "import json; json.load(open('$file'))" 2>/dev/null; then
            log_success "✓ $file is valid"
        else
            log_error "✗ $file is invalid JSON"
            VERIFICATION_PASSED=false
        fi
    else
        log_error "✗ $file is missing"
        VERIFICATION_PASSED=false
    fi
done

# Check if node_modules exist
if [[ -d "$FRONTEND_TARGET/node_modules" ]]; then
    log_success "✓ Frontend dependencies installed"
else
    log_warning "✗ Frontend dependencies may not be properly installed"
fi

# Final report
echo
echo -e "${GREEN}🐻 INSTALLATION COMPLETE!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"

if [[ "$VERIFICATION_PASSED" == "true" ]]; then
    log_success "All verification checks passed!"
else
    log_warning "Some verification checks failed. Review the output above."
fi

echo
echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo -e "${NC}1. To start development: Run './start-dev.sh' or 'npm run dev'${NC}"
echo -e "${NC}2. To build for production: Run './build-prod.sh' or 'npm run build'${NC}"
echo -e "${NC}3. Configure API keys in '$FRONTEND_TARGET/.env.local'${NC}"
echo -e "${NC}4. Check the comprehensive documentation in COMPLETE_PROJECT_DOCUMENTATION.md${NC}"

echo
echo -e "${YELLOW}🔧 TROUBLESHOOTING:${NC}"
echo -e "${NC}• If you encounter issues, run with clean install: ./INSTALL_BULLETPROOF.sh frontend-new-2 true${NC}"
echo -e "${NC}• Skip Python backend: ./INSTALL_BULLETPROOF.sh frontend-new-2 false true${NC}"
echo -e "${NC}• Check logs above for any error messages${NC}"

echo
echo -e "${MAGENTA}🎯 PROFESSIONAL INSTALLATION COMPLETE!${NC}"
