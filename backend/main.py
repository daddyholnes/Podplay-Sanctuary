#!/usr/bin/env python3
"""
Production startup script for Mama Bear Backend on Google Cloud Run
"""
import os
from app import app, socketio

if __name__ == "__main__":
    # Get port from environment (Cloud Run sets this)
    port = int(os.environ.get("PORT", 8080))
    
    # Always use socketio.run for production in Cloud Run
    # Gunicorn will be configured to use eventlet workers for SocketIO compatibility
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=False,
        allow_unsafe_werkzeug=True
    )
