#!/bin/bash

# 🐻 Podplay Build Sanctuary - Complete Startup Script
# This script starts both backend and desktop app

echo "🐻 Mama Bear is starting your sanctuary..."

# Change to the project directory
cd "/home/woody/Desktop/podplay-build-beta"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🐻 Mama Bear: Shutting down sanctuary gracefully..."
    kill $(jobs -p) 2>/dev/null
    pkill -f "python app.py" 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if backend is already running
if pgrep -f "python app.py" > /dev/null; then
    echo "🔧 Backend is already running"
else
    echo "🔧 Starting Mama Bear's backend brain..."
    cd backend
    source venv/bin/activate
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    # Give backend time to start
    echo "⏳ Waiting for backend to initialize..."
    sleep 5
fi

# Check if backend is responding
echo "🔍 Checking backend health..."
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding, waiting a bit more..."
    sleep 3
    if curl -s http://localhost:8000 > /dev/null; then
        echo "✅ Backend is now healthy"
    else
        echo "❌ Backend failed to start properly"
        exit 1
    fi
fi

echo "🖥️ Starting desktop application..."
./dist/Podplay\ Build\ Sanctuary-1.0.0.AppImage &

echo ""
echo "🏠 Your Podplay Build Sanctuary is ready!"
echo "🐻 Mama Bear: Welcome home! Press Ctrl+C to close the sanctuary."

# Wait for processes
wait
