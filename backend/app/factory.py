"""
Flask Application Factory
Clean, modular application initialization
"""
import logging
import os
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

def create_app(config_name='default'):
    """Create and configure Flask application"""
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    from .config.settings import get_config
    config_class = get_config()
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, origins="*")
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
    
    # Initialize database
    from .models.database import SanctuaryDB
    db = SanctuaryDB(app.config['DATABASE_PATH'])
    app.config['DATABASE_INSTANCE'] = db
      # Initialize marketplace service
    from .services.marketplace_manager import MCPMarketplaceManager
    marketplace = MCPMarketplaceManager(
        db=db, 
        data_path=str(app.config['MCP_SERVERS_DATA_PATH'])
    )
    app.config['MARKETPLACE_INSTANCE'] = marketplace
    
    # Initialize AI services
    from .services.vertex_ai_service import VertexAIService
    from .services.mama_bear_service import MamaBearService
    
    # Create database service wrapper
    from .models.database import DatabaseService
    db_service = DatabaseService(db)
    
    # Initialize Vertex AI service
    vertex_ai_service = VertexAIService()
    app.config['VERTEX_AI_INSTANCE'] = vertex_ai_service
      # Initialize Mama Bear service with dependencies
    mama_bear_service = MamaBearService(
        db_service=db_service,
        marketplace_service=marketplace
    )
    app.config['MAMA_BEAR_INSTANCE'] = mama_bear_service
    
    # Initialize Proactive Discovery Agent
    from .services.proactive_discovery_agent import ProactiveDiscoveryAgent
    discovery_agent = ProactiveDiscoveryAgent(
        marketplace_service=marketplace,
        mama_bear_service=mama_bear_service
    )
    app.config['DISCOVERY_AGENT_INSTANCE'] = discovery_agent
      # Register blueprints
    from .api.blueprints.health import health_bp
    from .api.blueprints.mcp_api import mcp_bp
    from .api.blueprints.chat_api import chat_bp, init_chat_services
    
    app.register_blueprint(health_bp)
    app.register_blueprint(mcp_bp)
    app.register_blueprint(chat_bp)
    
    # Initialize chat services
    init_chat_services(mama_bear_service, vertex_ai_service)
    
    # Register Socket.IO handlers
    from .api.blueprints.socket_handlers import register_socketio_handlers
    register_socketio_handlers(socketio)
    
    # Store socketio instance for external access
    app.config['SOCKETIO_INSTANCE'] = socketio
    
    # Add basic route for testing
    @app.route('/')
    def index():
        return {
            "service": "Podplay Sanctuary",
            "version": "2.0.0",
            "status": "running",
            "endpoints": {
                "health": "/health",
                "mcp_search": "/api/mcp/search",
                "mcp_categories": "/api/mcp/categories"
            }
        }
    
    logger.info("🚀 Podplay Sanctuary application factory complete")
    logger.info("📋 Registered routes:")
    for rule in app.url_map.iter_rules():
        logger.info(f"  - {rule.rule} [{', '.join(rule.methods)}]")
    
    return app, socketio
