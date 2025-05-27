#!/usr/bin/env python3
"""
Production startup script for Mama Bear Backend on Google Cloud Run
"""
import os
import sys
from app import app, socketio

if __name__ == "__main__":
    # Get port from environment (Cloud Run sets this)
    port = int(os.environ.get("PORT", 8080))
    
    # Production configuration
    if os.environ.get("FLASK_ENV") == "production":
        # Use Gunicorn for production
        from gunicorn.app.wsgiapp import WSGIApplication
        
        # Set Gunicorn options
        sys.argv = [
            "gunicorn",
            "--config", "gunicorn.conf.py",
            "--bind", f"0.0.0.0:{port}",
            "--worker-class", "eventlet",
            "--workers", "1",
            "app:app"
        ]
        
        # Run Gunicorn
        WSGIApplication().run()
    else:
        # Development mode
        socketio.run(
            app,
            host="0.0.0.0",
            port=port,
            debug=False,
            allow_unsafe_werkzeug=True
        )
