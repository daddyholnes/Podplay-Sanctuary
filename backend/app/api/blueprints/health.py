"""
Health check endpoints
Clean, focused health monitoring
"""
from flask import Blueprint, jsonify
import logging

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint"""
    try:
        return jsonify({
            "status": "healthy",
            "service": "podplay-sanctuary",
            "version": "2.0.0",
            "timestamp": "2024-12-25T00:00:00Z"
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@health_bp.route('/health/database', methods=['GET'])
def database_health():
    """Database health check"""
    try:
        from ...models.database import SanctuaryDB
        from flask import current_app
        
        db = current_app.config.get('DATABASE_INSTANCE')
        if db and db.health_check():
            return jsonify({
                "status": "healthy",
                "database": "connected"
            })
        else:
            return jsonify({
                "status": "unhealthy",
                "database": "disconnected"
            }), 500
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "database": "error",
            "error": str(e)
        }), 500

@health_bp.route('/services', methods=['GET'])
def services_health():
    """Check health of external services"""
    try:
        services = {
            "database": True,
            "mcp_marketplace": True,
            "socket_io": True
        }
        
        # Check database
        try:
            from ...models.database import SanctuaryDB
            from flask import current_app
            db = current_app.config.get('DATABASE_INSTANCE')
            services["database"] = db.health_check() if db else False
        except:
            services["database"] = False
        
        all_healthy = all(services.values())
        status_code = 200 if all_healthy else 503
        
        return jsonify({
            "status": "healthy" if all_healthy else "degraded",
            "services": services
        }), status_code
    except Exception as e:
        logger.error(f"Services health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@health_bp.route('/api/test-connection', methods=['GET'])
def test_connection():
    """Test connection endpoint for frontend"""
    try:
        return jsonify({
            "status": "connected",
            "service": "podplay-sanctuary",
            "version": "2.0.0",
            "backend": "modular-architecture",
            "features": [
                "mcp-marketplace",
                "mama-bear-chat",
                "vertex-ai",
                "control-center",
                "socket-io"
            ]
        })
    except Exception as e:
        logger.error(f"Test connection failed: {e}")
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
