#!/bin/bash

# Podplay Sanctuary Development Startup Script
# This script starts both backend and frontend in development mode

echo "🚀 Starting Podplay Sanctuary Development Environment..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use. Please stop the process using this port first."
        return 1
    fi
    return 0
}

# Check if ports are available
if ! check_port 5000; then
    echo "❌ Backend port 5000 is busy"
    exit 1
fi

if ! check_port 5173; then
    echo "❌ Frontend port 5173 is busy"
    exit 1
fi

echo "✅ Ports are available"

# Start backend in background
echo "🐍 Starting Python backend (Flask)..."
cd /workspaces/Podplay-Sanctuary/backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "⚛️  Starting React frontend (Vite)..."
cd /workspaces/Podplay-Sanctuary/frontend
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🎉 Development environment is starting up!"
echo "📝 Backend (Flask): http://localhost:5000"
echo "🌐 Frontend (React): http://localhost:5173"
echo ""
echo "📊 Process IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "To stop both services, run: ./stop-dev.sh"
echo "Or manually kill processes: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop this script (services will continue running in background)"

# Save PIDs for the stop script
echo "$BACKEND_PID" > /tmp/podplay_backend.pid
echo "$FRONTEND_PID" > /tmp/podplay_frontend.pid

# Keep script running to show logs
wait
