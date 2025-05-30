#!/usr/bin/env python3
"""
Podplay Sanctuary - Modular Flask Application
Clean, maintainable architecture with application factory pattern

This is the new main application file that replaces the monolithic app.py
"""

import os
import sys
import logging
from pathlib import Path

# Configure UTF-8 encoding for Windows compatibility
if os.name == 'nt':  # Windows
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except:
            pass

# Add the app directory to Python path for imports
app_dir = Path(__file__).parent / 'app'
sys.path.insert(0, str(app_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Main application entry point"""
    try:
        # Create application using factory pattern
        from app.factory import create_app
        app, socketio = create_app()
        
        logger.info("🐻 Podplay Sanctuary starting...")
        logger.info("🏗️ New modular architecture active")
        logger.info("🔧 Application factory pattern implemented")
        logger.info("📦 External MCP data configuration loaded")
        logger.info("🔌 Socket.IO handlers registered")
        
        # Start the application
        port = int(os.getenv('PORT', 5000))
        host = os.getenv('HOST', '0.0.0.0')
        debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        
        logger.info(f"🚀 Starting server on {host}:{port} (debug={debug})")
        
        socketio.run(
            app,
            host=host,
            port=port,
            debug=debug,
            allow_unsafe_werkzeug=True
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start application: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
