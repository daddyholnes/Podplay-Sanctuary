"""
API Blueprint Registration System

Centralizes the registration of all API blueprints for organized endpoint management.
This replaces the scattered route definitions in the monolithic application structure.
"""

from flask import Flask
from utils.logging_setup import get_logger

logger = get_logger(__name__)

def register_blueprints(app: Flask):
    """
    Register all API blueprints with the Flask application
    
    Args:
        app: Flask application instance
    """
    try:
        # Health check endpoints
        from .blueprints.health_blueprint import health_bp
        app.register_blueprint(health_bp)
        
        # MCP marketplace API endpoints  
        from .blueprints.mcp_api_blueprint import mcp_bp
        app.register_blueprint(mcp_bp)
        
        # Chat and AI interaction endpoints
        from .blueprints.chat_api_blueprint import chat_bp
        app.register_blueprint(chat_bp)
        
        # Development tools and test endpoints
        from .blueprints.dev_tools_blueprint import dev_bp
        app.register_blueprint(dev_bp)
        
        # Scout Agent API endpoints for workspace management
        from .blueprints.scout_agent_blueprint import scout_bp
        app.register_blueprint(scout_bp)
        
        # NixOS Workspaces API endpoints
        from .blueprints.nixos_workspaces_blueprint import nixos_bp
        app.register_blueprint(nixos_bp)
        
        logger.info("All API blueprints registered successfully")
        
        # Log registered routes for debugging
        if app.config.get('DEBUG'):
            logger.debug("Registered routes:")
            for rule in app.url_map.iter_rules():
                logger.debug(f"  {rule.rule} [{', '.join(rule.methods)}]")
        
    except Exception as e:
        logger.error(f"Blueprint registration failed: {e}")
        raise