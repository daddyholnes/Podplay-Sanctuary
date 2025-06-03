#!/usr/bin/env python3
"""
Podplay Build Backend - Clean Application Factory
The Sanctuary for Calm, Empowered Creation

Mama Bear Gem - Lead Developer Agent with clean modular architecture
Integration Workbench - Universal Automation Hub
"""

import os
import sys
import logging
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

# Configure UTF-8 encoding for Windows compatibility
if os.name == 'nt':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except:
            pass

def create_app(config_name='development'):
    """
    Application factory pattern for clean, testable Flask app creation
    
    Args:
        config_name: Configuration environment (development, production, testing)
        
    Returns:
        tuple: (Flask app, SocketIO instance)
    """
    app = Flask(__name__)
    
    # Load configuration
    from config.settings import get_config
    app.config.from_object(get_config(config_name))
    
    # Configure logging first
    from utils.logging_setup import setup_logging
    setup_logging(app)
    
    logger = logging.getLogger(__name__)
    logger.info("🐻 Initializing Podplay Sanctuary Backend")
    
    # Register Models API Blueprint
    try:
        from api.models_api import models_api
        app.register_blueprint(models_api)
        logger.info("📝 Registered Models API Blueprint")
    except Exception as e:
        logger.error(f"❌ Failed to register Models API Blueprint: {e}")
    
    # Initialize CORS with proper configuration
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
            "expose_headers": ["Content-Type", "X-Total-Count"],
            "supports_credentials": True,
            "max_age": 600
        }
    })
    
    # Initialize SocketIO with clean configuration
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode='threading',
        engineio_logger=True,
        logger=True,
        ping_timeout=60,
        ping_interval=25,
        manage_session=False,
        path='/socket.io/'
    )
      # Initialize database
    from models.database import init_database
    init_database(app)
    
    # Initialize services FIRST - before registering blueprints
    from services import initialize_services
    services = initialize_services(app)
    
    # Initialize integration workbench with required services
    from api.blueprints.integration_api import integration_bp, init_integration_workbench
    enhanced_mama = services.get('enhanced_mama')
    marketplace = services.get('marketplace_manager')
    
    if enhanced_mama and marketplace:
        init_integration_workbench(enhanced_mama, marketplace)
        logger.info("🔧 Integration Workbench initialized successfully")
    else:
        logger.warning("⚠️ Could not initialize Integration Workbench: required services not available")
    
    # Register API blueprints AFTER services are initialized
    from api import register_blueprints
    register_blueprints(app)
    
    # Register Integration Workbench blueprint
    app.register_blueprint(integration_bp)
    
    # Register Socket.IO handlers
    from api.blueprints.socket_handlers import register_socket_handlers
    register_socket_handlers(socketio)
    
    # Create uploads directory if it doesn't exist
    uploads_dir = os.path.join(app.root_path, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    logger.info(f"📁 Ensured uploads directory exists at {uploads_dir}")
    
    # Configure static route for uploads
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(uploads_dir, filename)
    
    # Register global error handlers
    from utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    logger.info("🌟 Podplay Sanctuary Backend initialized successfully")
    logger.info("🐻 Mama Bear Control Center ready")
    
    # If called by Flask CLI, only return the app instance (not the tuple)
    if os.environ.get("FLASK_RUN_FROM_CLI") == "1":
        return app
    return app, socketio

if __name__ == '__main__':
    try:
        app, socketio = create_app()
        # Use port 5001 since 5000 is in use
        port = 5000
        
        print("🚀 Starting Podplay Sanctuary Backend Server...")
        print("🐻 Mama Bear Control Center is ready!")
        print("🔧 Integration Workbench - Universal Automation Hub initialized!")
        print("🌐 Server will be available at: http://127.0.0.1:5001")
        print("📡 API endpoints ready for frontend connections")
        print("🔌 Socket.IO enabled for real-time communication")
        print("==================================================")
        
        socketio.run(
            app,
            host="0.0.0.0",
            port=port,
            debug=True,
            use_reloader=False,
            allow_unsafe_werkzeug=True,
            log_output=True
        )
        
    except Exception as e:
        logging.error(f"💥 Failed to start server: {e}")
        sys.exit(1)
