#!/bin/bash

# 🐻 Podplay Build Sanctuary - Setup Script
# Mama Bear's automated sanctuary preparation

echo "🐻 Welcome to Nathan's Podplay Build Sanctuary Setup"
echo "🏠 Mama Bear is preparing your sanctuary for calm, empowered creation..."
echo ""

# Color codes for beautiful output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BEAR='🐻'

# Function to print colored messages
print_status() {
    echo -e "${BLUE}${BEAR} Mama Bear:${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if running in correct directory
if [ ! -f "MISSION_STATEMENT.md" ]; then
    print_error "Please run this script from the podplay-build-beta directory"
    exit 1
fi

print_status "Checking system requirements..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python 3 found: $PYTHON_VERSION"
else
    print_error "Python 3 is required but not found"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is required but not found"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm is required but not found"
    exit 1
fi

print_status "Setting up the backend sanctuary..."

# Setup backend
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
print_status "Installing Python dependencies..."
if pip install -r requirements.txt; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Return to root directory
cd ..

print_status "Setting up the frontend sanctuary interface..."

# Setup frontend
cd frontend

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Return to root directory
cd ..

# Create start scripts
print_status "Creating convenience scripts..."

# Create start-sanctuary.sh
cat > start-sanctuary.sh << 'EOF'
#!/bin/bash

# 🐻 Podplay Build Sanctuary - Start Script
# Start both backend and frontend services

echo "🐻 Mama Bear is starting your sanctuary..."

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🐻 Mama Bear: Shutting down sanctuary gracefully..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting Mama Bear's backend brain..."
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend
echo "🎨 Starting sanctuary interface..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🏠 Your Podplay Build Sanctuary is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo ""
echo "🐻 Mama Bear: Welcome home, Nathan! Press Ctrl+C to close the sanctuary."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start-sanctuary.sh

# Create development script
cat > dev-sanctuary.sh << 'EOF'
#!/bin/bash

# 🐻 Development mode with auto-reload
echo "🐻 Starting sanctuary in development mode..."

# Kill any existing processes on these ports
echo "🧹 Cleaning up any existing processes..."
pkill -f "python app.py" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🐻 Mama Bear: Development session ended"
    pkill -f "python app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in development mode
echo "🔧 Starting backend with auto-reload..."
cd backend
source venv/bin/activate
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py &

sleep 2

# Start frontend in development mode
echo "🎨 Starting frontend with hot reload..."
cd ../frontend
npm run dev &

echo ""
echo "🏠 Development Sanctuary Ready!"
echo "📱 Frontend: http://localhost:3000 (with hot reload)"
echo "🔧 Backend: http://localhost:5000 (with auto-reload)"
echo ""
echo "🐻 Mama Bear: Happy coding! Changes will reload automatically."

wait
EOF

chmod +x dev-sanctuary.sh

print_success "Setup complete!"
echo ""
echo "🎉 Your Podplay Build Sanctuary is ready for calm, empowered creation!"
echo ""
echo "🚀 Quick Start Commands:"
echo "   ./start-sanctuary.sh    - Start the full sanctuary"
echo "   ./dev-sanctuary.sh      - Start in development mode"
echo ""
echo "🐻 Mama Bear: I'm here whenever you need me. Let's create amazing things together!"
