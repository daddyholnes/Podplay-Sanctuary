#!/bin/bash

# Stop Podplay Sanctuary Development Services

echo "🛑 Stopping Podplay Sanctuary development services..."

# Function to stop a process by PID
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                echo "Force stopping $service_name..."
                kill -9 "$pid"
            fi
            echo "✅ $service_name stopped"
        else
            echo "⚠️  $service_name process not found (PID: $pid)"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️  No PID file found for $service_name"
    fi
}

# Stop backend
stop_process "/tmp/podplay_backend.pid" "Backend"

# Stop frontend  
stop_process "/tmp/podplay_frontend.pid" "Frontend"

# Also kill any remaining processes on the ports
echo "🧹 Cleaning up any remaining processes on ports 5000 and 5173..."
pkill -f "python.*app.py" 2>/dev/null || true
pkill -f "vite.*dev" 2>/dev/null || true

echo "✅ All services stopped!"
