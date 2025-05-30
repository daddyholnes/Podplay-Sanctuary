"""
MCP Marketplace API endpoints
Clean, focused MCP server operations
"""
from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

mcp_bp = Blueprint('mcp', __name__, url_prefix='/api/mcp')

@mcp_bp.route('/search', methods=['GET'])
def search_servers():
    """Search MCP servers"""
    try:
        from flask import current_app
        marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
        
        if not marketplace:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "servers": []
            }), 503
        
        query = request.args.get('query', '')
        category = request.args.get('category', None)
        official_only = request.args.get('official_only', 'false').lower() == 'true'
        
        servers = marketplace.search_servers(
            query=query,
            category=category,
            official_only=official_only
        )
        
        return jsonify({
            "success": True,
            "servers": servers,
            "total": len(servers),
            "query": query,
            "filters": {
                "category": category,
                "official_only": official_only
            }
        })
        
    except Exception as e:
        logger.error(f"Error searching MCP servers: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "servers": []
        }), 500

@mcp_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get MCP categories"""
    try:
        from ...data import get_mcp_categories
        categories = get_mcp_categories()
        
        return jsonify({
            "success": True,
            "categories": categories
        })
        
    except Exception as e:
        logger.error(f"Error getting MCP categories: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "categories": []
        }), 500

@mcp_bp.route('/trending', methods=['GET'])
def get_trending():
    """Get trending MCP servers"""
    try:
        from flask import current_app
        marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
        
        if not marketplace:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "servers": []
            }), 503
        
        limit = int(request.args.get('limit', 10))
        servers = marketplace.get_trending_servers(limit=limit)
        
        return jsonify({
            "success": True,
            "servers": servers,
            "total": len(servers)
        })
        
    except Exception as e:
        logger.error(f"Error getting trending servers: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "servers": []
        }), 500

@mcp_bp.route('/install', methods=['POST'])
def install_server():
    """Install MCP server"""
    try:
        from flask import current_app
        marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
        
        if not marketplace:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available"
            }), 503
        
        data = request.get_json()
        if not data or 'server_name' not in data:
            return jsonify({
                "success": False,
                "error": "Missing server_name in request"
            }), 400
        
        result = marketplace.install_server(data['server_name'])
        status_code = 200 if result.get('success') else 400
        
        return jsonify(result), status_code
        
    except Exception as e:
        logger.error(f"Error installing server: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@mcp_bp.route('/server/<server_name>', methods=['GET'])
def get_server_details(server_name):
    """Get specific server details"""
    try:
        from flask import current_app
        marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
        
        if not marketplace:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available"
            }), 503
        
        server = marketplace.get_server_by_name(server_name)
        if not server:
            return jsonify({
                "success": False,
                "error": "Server not found"
            }), 404
        
        return jsonify({
            "success": True,
            "server": server
        })
        
    except Exception as e:
        logger.error(f"Error getting server details: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@mcp_bp.route('/recommendations/<project_type>', methods=['GET'])
def get_project_recommendations(project_type):
    """Get MCP server recommendations for project type"""
    try:
        from flask import current_app
        marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
        
        if not marketplace:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "recommendations": []
            }), 503
        
        recommendations = marketplace.get_recommendations_for_project(project_type)
        
        return jsonify({
            "success": True,
            "project_type": project_type,
            "recommendations": recommendations,
            "total": len(recommendations)
        })
        
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "recommendations": []
        }), 500
