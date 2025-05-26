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
