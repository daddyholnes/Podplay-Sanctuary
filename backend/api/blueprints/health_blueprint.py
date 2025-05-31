"""
Health Check API Blueprint

Provides system health monitoring endpoints for operational status verification
and service availability confirmation across the Podplay Sanctuary platform.
"""

from flask import Blueprint, jsonify
from datetime import datetime

from models.database import get_database_stats
from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Create blueprint for health check operations
health_bp = Blueprint('health', __name__)

@health_bp.route('/api/test-connection', methods=['GET'])
def test_connection():
    """
    Test connection endpoint specifically expected by frontend
    Used by frontend components for backend connectivity verification
    
    Returns:
        JSON response confirming backend connection is successful
    """
    try:
        return jsonify({
            "status": "connected",
            "message": "Backend connection successful",
            "service": "podplay-sanctuary",
            "backend_running": True,
            "version": "2.0.0",
            "features": [
                "mcp-marketplace",
                "mama-bear-chat", 
                "vertex-garden",
                "scout-agent",
                "socket-io"
            ],
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Test connection failed: {e}")
        return jsonify({
            "status": "error",
            "message": f"Connection test failed: {str(e)}",
            "backend_running": False,
            "timestamp": datetime.now().isoformat()
        }), 500

@health_bp.route('/', methods=['GET'])
def root():
    """
    Root endpoint returning basic service information
    
    Returns:
        JSON response with welcome message and basic service status
    """
    return jsonify({
        "message": "Welcome to Podplay Sanctuary Backend",
        "service": "podplay-sanctuary", 
        "status": "running",
        "version": "2.0.0",
        "description": "The Sanctuary for Calm, Empowered Creation",
        "timestamp": datetime.now().isoformat()
    })

@health_bp.route('/health', methods=['GET'])
def health_check():
    """
    Primary health check endpoint for system status verification
    
    Returns:
        JSON response with overall system health status
    """
    try:
        # Basic health confirmation
        health_status = {
            "status": "healthy",
            "service": "podplay-sanctuary",
            "timestamp": datetime.now().isoformat(),
            "version": "2.0.0"
        }
        
        logger.debug("Health check requested - system operational")
        return jsonify(health_status), 200
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "service": "podplay-sanctuary",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@health_bp.route('/health/detailed', methods=['GET'])
def detailed_health_check():
    """
    Comprehensive health check with service component status
    
    Returns:
        JSON response with detailed system component health information
    """
    try:
        # Gather component health information
        database_stats = get_database_stats()
        
        detailed_status = {
            "status": "healthy",
            "service": "podplay-sanctuary",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "database": {
                    "status": "operational",
                    "initialized": database_stats.get("initialized", False),
                    "total_records": sum(v for k, v in database_stats.items() if k.endswith('_count')),
                    "size_bytes": database_stats.get("database_size_bytes", 0)
                },
                "api_endpoints": {
                    "status": "operational",
                    "blueprints_loaded": True
                },
                "logging_system": {
                    "status": "operational",
                    "level": "INFO"
                }
            }
        }
        
        # Check for any component issues
        if not database_stats.get("initialized"):
            detailed_status["status"] = "degraded"
            detailed_status["components"]["database"]["status"] = "initialization_required"
        
        status_code = 200 if detailed_status["status"] == "healthy" else 503
        
        logger.info(f"Detailed health check completed - status: {detailed_status['status']}")
        return jsonify(detailed_status), status_code
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {e}")
        return jsonify({
            "status": "unhealthy",
            "service": "podplay-sanctuary",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
            "components": {
                "database": {"status": "error"},
                "api_endpoints": {"status": "error"},
                "logging_system": {"status": "unknown"}
            }
        }), 500

@health_bp.route('/health/ready', methods=['GET'])
def readiness_check():
    """
    Kubernetes-style readiness probe for deployment orchestration
    
    Returns:
        JSON response indicating service readiness for traffic acceptance
    """
    try:
        # Verify critical dependencies are available
        database_stats = get_database_stats()
        
        if database_stats.get("initialized"):
            return jsonify({
                "ready": True,
                "service": "podplay-sanctuary",
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                "ready": False,
                "service": "podplay-sanctuary",
                "reason": "database_not_initialized",
                "timestamp": datetime.now().isoformat()
            }), 503
            
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return jsonify({
            "ready": False,
            "service": "podplay-sanctuary",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 503

@health_bp.route('/health/live', methods=['GET'])
def liveness_check():
    """
    Kubernetes-style liveness probe for container health verification
    
    Returns:
        JSON response confirming service process is alive and responsive
    """
    try:
        return jsonify({
            "alive": True,
            "service": "podplay-sanctuary",
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Liveness check failed: {e}")
        return jsonify({
            "alive": False,
            "service": "podplay-sanctuary",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500