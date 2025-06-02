#!/bin/bash
# Podplay Sanctuary - Installation Verification Script
# Tests that all components are properly installed and configured
# Run after ./install_podplay.sh to verify everything works

set -e  # Exit on any error

# Colors for output
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_header() { echo -e "\n${PURPLE}[Podplay] ${1}${NC}"; }
log_info() { echo -e "${CYAN}[TEST] ${1}${NC}"; }
log_success() { echo -e "${GREEN}[PASS] ${1}${NC}"; }
log_warning() { echo -e "${YELLOW}[WARN] ${1}${NC}"; }
log_error() { echo -e "${RED}[FAIL] ${1}${NC}"; }

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   PODPLAY SANCTUARY INSTALLATION TEST                     ║${NC}"
echo -e "${PURPLE}║                Verifying Your Digital Sanctuary Setup                     ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"

# Check if running from project root
if [[ ! -d "backend" || ! -d "frontend" ]]; then
    log_error "This script must be run from the Podplay Sanctuary project root directory."
    exit 1
fi

# ===== VIRTUAL ENVIRONMENT TEST =====
log_header "Testing Python Virtual Environment"

if [[ ! -d "venv" ]]; then
    log_error "Virtual environment not found! Please run install_podplay.sh first."
    ((TESTS_FAILED++))
else
    log_info "Virtual environment exists. Testing activation..."
    if source venv/bin/activate 2>/dev/null; then
        log_success "Virtual environment activates correctly."
        ((TESTS_PASSED++))
        
        # Test Python version
        PYTHON_VERSION=$(python --version 2>&1)
        log_info "Python version: $PYTHON_VERSION"
        
        # Deactivate venv
        deactivate
    else
        log_error "Failed to activate virtual environment."
        ((TESTS_FAILED++))
    fi
fi

# ===== BACKEND TEST =====
log_header "Testing Backend Setup"

# Check if requirements are installed
log_info "Checking backend dependencies..."
source venv/bin/activate

# Test Flask installation
if python -c "import flask" 2>/dev/null; then
    log_success "Flask is installed correctly."
    ((TESTS_PASSED++))
else
    log_error "Flask is not installed correctly."
    ((TESTS_FAILED++))
fi

# Test Flask-CORS installation
if python -c "import flask_cors" 2>/dev/null; then
    log_success "Flask-CORS is installed correctly."
    ((TESTS_PASSED++))
else
    log_error "Flask-CORS is not installed correctly."
    ((TESTS_FAILED++))
fi

# Test agent framework
log_info "Testing agent framework imports..."
if [[ -f "backend/services/agent_framework_enhanced.py" ]]; then
    log_success "Agent framework file exists."
    ((TESTS_PASSED++))
else
    if [[ -f "backend/services/agent_framework_enhanced_file.py" ]]; then
        log_warning "Agent framework file exists but may have wrong name. Creating symlink..."
        ln -sf agent_framework_enhanced_file.py backend/services/agent_framework_enhanced.py
        log_success "Symlink created."
        ((TESTS_PASSED++))
    else
        log_error "Agent framework file is missing!"
        ((TESTS_FAILED++))
    fi
fi

# Test import of agent framework
cd backend
if python -c "import sys; sys.path.append('.'); from services.agent_framework_enhanced import logger" 2>/dev/null; then
    log_success "Agent framework imports correctly."
    ((TESTS_PASSED++))
else
    log_error "Failed to import agent framework."
    ((TESTS_FAILED++))
fi
cd ..

deactivate

# ===== FRONTEND TEST =====
log_header "Testing Frontend Setup"

# Check if node_modules exists
if [[ -d "frontend/node_modules" ]]; then
    log_success "Frontend dependencies are installed."
    ((TESTS_PASSED++))
else
    log_error "Frontend dependencies are not installed. Please run install_podplay.sh first."
    ((TESTS_FAILED++))
fi

# Check if critical packages are installed
cd frontend
if npm list react >/dev/null 2>&1; then
    log_success "React is installed correctly."
    ((TESTS_PASSED++))
else
    log_error "React is not installed correctly."
    ((TESTS_FAILED++))
fi

if npm list typescript >/dev/null 2>&1; then
    log_success "TypeScript is installed correctly."
    ((TESTS_PASSED++))
else
    log_error "TypeScript is not installed correctly."
    ((TESTS_FAILED++))
fi

if npm list vite >/dev/null 2>&1; then
    log_success "Vite is installed correctly."
    ((TESTS_PASSED++))
else
    log_error "Vite is not installed correctly."
    ((TESTS_FAILED++))
fi
cd ..

# ===== INTEGRATION WORKBENCH TEST =====
log_header "Testing Integration Workbench Setup"

# Check if Integration Workbench component exists
if [[ -f "frontend/src/enhanced/mama-bear-agents/MamaBearIntegrationWorkbench.tsx" ]]; then
    log_success "Integration Workbench frontend component exists."
    ((TESTS_PASSED++))
else
    log_error "Integration Workbench frontend component is missing!"
    ((TESTS_FAILED++))
fi

# Check if Integration Workbench is exported in index.ts
if grep -q "MamaBearIntegrationWorkbench" "frontend/src/enhanced/mama-bear-agents/index.ts" 2>/dev/null; then
    log_success "Integration Workbench is properly exported in index.ts."
    ((TESTS_PASSED++))
else
    log_error "Integration Workbench is not exported in index.ts!"
    ((TESTS_FAILED++))
fi

# Check if Integration Workbench API exists
if [[ -f "backend/api/blueprints/integration_api.py" ]]; then
    log_success "Integration Workbench API exists."
    ((TESTS_PASSED++))
else
    log_error "Integration Workbench API is missing!"
    ((TESTS_FAILED++))
fi

# ===== FINAL REPORT =====
log_header "Installation Test Summary"

echo -e "${CYAN}Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "${CYAN}Tests failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed! Your Podplay Sanctuary is correctly installed.${NC}"
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                     INSTALLATION VERIFIED SUCCESSFULLY                     ║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${CYAN}To start the application:${NC}"
    echo -e "  Backend:   source venv/bin/activate && cd backend && python app.py"
    echo -e "  Frontend:  cd frontend && npm run dev"
    echo -e ""
    echo -e "${PURPLE}Enjoy your Podplay Sanctuary! Your digital haven is ready.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues before proceeding.${NC}"
    echo -e "${CYAN}Run ./install_podplay.sh to attempt to fix installation issues.${NC}"
    exit 1
fi
