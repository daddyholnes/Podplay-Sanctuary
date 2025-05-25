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
