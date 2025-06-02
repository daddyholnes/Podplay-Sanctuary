#!/bin/bash
# Podplay Sanctuary - Bulletproof Installation Script
# Creates virtual environments and handles all dependencies properly
# Version: 3.0 - Nathan's Digital Sanctuary Installer

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
log_info() { echo -e "${CYAN}[INFO] ${1}${NC}"; }
log_success() { echo -e "${GREEN}[SUCCESS] ${1}${NC}"; }
log_warning() { echo -e "${YELLOW}[WARNING] ${1}${NC}"; }
log_error() { echo -e "${RED}[ERROR] ${1}${NC}"; }

clear
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                        PODPLAY SANCTUARY INSTALLER                        ║${NC}"
echo -e "${PURPLE}║                     Your Digital Sanctuary Awaits                         ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"

# Check if running from project root
if [[ ! -d "backend" || ! -d "frontend" ]]; then
    log_error "This script must be run from the Podplay Sanctuary project root directory."
    exit 1
fi

# ===== CONFIGURATION =====
VENV_DIR="venv"
SKIP_PYTHON=false
SKIP_FRONTEND=false
SKIP_ELECTRON=false
CLEAN_INSTALL=false

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-python) SKIP_PYTHON=true ;;
        --skip-frontend) SKIP_FRONTEND=true ;;
        --skip-electron) SKIP_ELECTRON=true ;;
        --clean) CLEAN_INSTALL=true ;;
        --help) 
            echo "Usage: ./install_podplay.sh [options]"
            echo "Options:"
            echo "  --skip-python     Skip Python backend installation"
            echo "  --skip-frontend   Skip frontend installation"
            echo "  --skip-electron   Skip electron installation" 
            echo "  --clean           Perform clean installation (remove existing modules)"
            exit 0
            ;;
        *) log_error "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# ===== PREPARATION =====
log_header "Preparing Installation"

# Create necessary directories if they don't exist
mkdir -p logs

# Clean installation if requested
if [[ "$CLEAN_INSTALL" == "true" ]]; then
    log_warning "Performing clean installation..."
    
    log_info "Removing node_modules directories..."
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    
    log_info "Removing Python cache..."
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    
    log_info "Removing virtual environment..."
    rm -rf "$VENV_DIR" 2>/dev/null || true
    
    log_success "Clean-up complete!"
fi

# Check required system dependencies
log_info "Checking system dependencies..."
MISSING_DEPS=()

# Check for Python
if ! command -v python3 &> /dev/null; then
    MISSING_DEPS+=("python3")
fi

# Check for pip
if ! command -v pip3 &> /dev/null && ! command -v pip &> /dev/null; then
    MISSING_DEPS+=("pip3")
fi

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
    MISSING_DEPS+=("nodejs")
fi
if ! command -v npm &> /dev/null; then
    MISSING_DEPS+=("npm")
fi

# Report missing dependencies
if [ ${#MISSING_DEPS[@]} -ne 0 ]; then
    log_error "Missing required dependencies: ${MISSING_DEPS[*]}"
    log_info "Please install these dependencies and try again."
    exit 1
fi

log_success "All system dependencies are available!"

# ===== PYTHON BACKEND INSTALLATION =====
if [[ "$SKIP_PYTHON" == "false" ]]; then
    log_header "Installing Python Backend"
    
    # Create virtual environment if it doesn't exist
    if [[ ! -d "$VENV_DIR" ]]; then
        log_info "Creating Python virtual environment in $VENV_DIR..."
        python3 -m venv "$VENV_DIR"
        log_success "Virtual environment created!"
    else
        log_info "Using existing virtual environment."
    fi
    
    # Activate virtual environment
    log_info "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    log_info "Upgrading pip..."
    pip install --upgrade pip
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    if [[ -f "backend/requirements.txt" ]]; then
        cd backend
        pip install -r requirements.txt
        cd ..
        log_success "Backend dependencies installed successfully!"
    else
        log_error "requirements.txt not found in backend directory!"
        exit 1
    fi
    
    # Link agent_framework_enhanced_file.py if needed
    log_info "Setting up agent framework symlinks..."
    if [[ -f "backend/services/agent_framework_enhanced_file.py" && ! -f "backend/services/agent_framework_enhanced.py" ]]; then
        ln -sf agent_framework_enhanced_file.py backend/services/agent_framework_enhanced.py
        log_success "Agent framework symlink created!"
    fi
    
    # Deactivate virtual environment
    deactivate
    log_success "Python backend installation complete!"
else
    log_info "Skipping Python backend installation."
fi

# ===== FRONTEND INSTALLATION =====
if [[ "$SKIP_FRONTEND" == "false" ]]; then
    log_header "Installing Frontend"
    
    if [[ -d "frontend" ]]; then
        cd frontend
        
        # Check package.json
        if [[ ! -f "package.json" ]]; then
            log_error "package.json not found in frontend directory!"
            exit 1
        fi
        
        log_info "Installing frontend dependencies..."
        npm install
        
        log_success "Frontend dependencies installed successfully!"
        cd ..
    else
        log_error "Frontend directory not found!"
        exit 1
    fi
else
    log_info "Skipping frontend installation."
fi

# ===== ELECTRON INSTALLATION =====
if [[ "$SKIP_ELECTRON" == "false" ]]; then
    log_header "Installing Electron App"
    
    if [[ -d "electron" ]]; then
        cd electron
        
        # Check package.json
        if [[ ! -f "package.json" ]]; then
            log_error "package.json not found in electron directory!"
            exit 1
        fi
        
        log_info "Installing electron dependencies..."
        npm install
        
        log_success "Electron dependencies installed successfully!"
        cd ..
    else
        log_info "Electron directory not found, skipping."
    fi
else
    log_info "Skipping electron installation."
fi

# ===== FINISHING UP =====
log_header "Installation Complete!"

# Create a helper script to activate the environment
cat > activate_podplay.sh << EOL
#!/bin/bash
# Activate Podplay Sanctuary environment
source "$VENV_DIR/bin/activate"
echo -e "${PURPLE}Podplay Sanctuary environment activated!${NC}"
echo -e "${CYAN}Use 'deactivate' to exit the environment when done.${NC}"
EOL

chmod +x activate_podplay.sh

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                      INSTALLATION SUCCESSFUL!                             ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "${CYAN}To activate the Python environment:${NC}"
echo -e "  source ./activate_podplay.sh"
echo -e ""
echo -e "${CYAN}To start the backend:${NC}"
echo -e "  source ./activate_podplay.sh"
echo -e "  cd backend"
echo -e "  python app.py"
echo -e ""
echo -e "${CYAN}To start the frontend:${NC}"
echo -e "  cd frontend"
echo -e "  npm run dev"
echo -e ""
echo -e "${PURPLE}Welcome to your Podplay Sanctuary! Your digital haven awaits.${NC}"
