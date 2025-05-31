#!/bin/bash

# 🐻 Podplay Build Sanctuary - Start Script
# Starts backend and frontend for Podplay Sanctuary

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🐻 Mama Bear: Sanctuary session ended"
    pkill -f "python app.py" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 3

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Info
echo "\n🏠 Your Podplay Build Sanctuary is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "\n🐻 Mama Bear: Welcome home, Nathan! Press Ctrl+C to close the sanctuary."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
