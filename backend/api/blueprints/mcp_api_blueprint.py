"""
MCP Marketplace API Blueprint

Provides comprehensive Model Context Protocol server management capabilities
including search, discovery, installation, and marketplace operations for the
Podplay Sanctuary development environment.
"""

from flask import Blueprint, request, jsonify
from typing import Dict, Any

from services.marketplace_service import MCPMarketplaceManager
from utils.logging_setup import get_logger
from utils.validators import validate_search_params, validate_server_name

logger = get_logger(__name__)

# Create blueprint for MCP marketplace operations
mcp_bp = Blueprint('mcp', __name__, url_prefix='/api/mcp')

# Initialize marketplace manager (will be injected by service initialization)
marketplace_manager: MCPMarketplaceManager = None

def init_mcp_api(manager: MCPMarketplaceManager):
    """
    Initialize MCP API blueprint with marketplace manager dependency
    
    Args:
        manager: Initialized marketplace manager instance
    """
    global marketplace_manager
    marketplace_manager = manager
    logger.info("MCP API blueprint initialized with marketplace manager")

@mcp_bp.route('/search', methods=['GET'])
def search_servers():
    """
    Search MCP servers with comprehensive filtering and sorting capabilities
    
    Query Parameters:
        query (str): Search term for server names, descriptions, or tags
        category (str): Filter by server category
        official_only (bool): Limit results to official servers only
        limit (int): Maximum number of results to return
    
    Returns:
        JSON response with matching servers and search metadata
    """
    try:
        # Extract and validate search parameters
        search_params = {
            'query': request.args.get('query', ''),
            'category': request.args.get('category', None),
            'official_only': request.args.get('official_only', 'false').lower() == 'true',
            'limit': int(request.args.get('limit', 20))
        }
        
        validation_result = validate_search_params(search_params)
        if not validation_result['valid']:
            return jsonify({
                "success": False,
                "error": validation_result['error'],
                "servers": []
            }), 400
        
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "servers": []
            }), 503
        
        # Execute server search
        servers = marketplace_manager.search_servers(
            query=search_params['query'],
            category=search_params['category'],
            official_only=search_params['official_only']
        )
        
        # Apply result limit
        limited_servers = servers[:search_params['limit']]
        
        logger.info(f"Server search completed: {len(limited_servers)} results for query '{search_params['query']}'")
        
        return jsonify({
            "success": True,
            "servers": limited_servers,
            "total": len(servers),
            "returned": len(limited_servers),
            "query": search_params['query'],
            "filters": {
                "category": search_params['category'],
                "official_only": search_params['official_only']
            }
        })
        
    except ValueError as e:
        logger.warning(f"Invalid search parameters: {e}")
        return jsonify({
            "success": False,
            "error": f"Invalid parameter: {str(e)}",
            "servers": []
        }), 400
        
    except Exception as e:
        logger.error(f"Server search failed: {e}")
        return jsonify({
            "success": False,
            "error": "Search operation failed",
            "servers": []
        }), 500

@mcp_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Retrieve available MCP server categories with descriptions
    
    Returns:
        JSON response with category definitions and usage statistics
    """
    try:
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "categories": []
            }), 503
        
        categories = marketplace_manager.get_categories()
        
        logger.debug("MCP categories retrieved successfully")
        
        return jsonify({
            "success": True,
            "categories": categories,
            "total": len(categories)
        })
        
    except Exception as e:
        logger.error(f"Category retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve categories",
            "categories": []
        }), 500

@mcp_bp.route('/server/<server_name>', methods=['GET'])
def get_server_details(server_name: str):
    """
    Retrieve detailed information for a specific MCP server
    
    Args:
        server_name: Name of the server to retrieve
    
    Returns:
        JSON response with comprehensive server details
    """
    try:
        if not validate_server_name(server_name):
            return jsonify({
                "success": False,
                "error": "Invalid server name format"
            }), 400
        
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available"
            }), 503
        
        server = marketplace_manager.get_server_by_name(server_name)
        
        if not server:
            return jsonify({
                "success": False,
                "error": f"Server '{server_name}' not found"
            }), 404
        
        logger.info(f"Server details retrieved for: {server_name}")
        
        return jsonify({
            "success": True,
            "server": server
        })
        
    except Exception as e:
        logger.error(f"Server detail retrieval failed for '{server_name}': {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve server details"
        }), 500

@mcp_bp.route('/install/<server_name>', methods=['POST'])
def install_server(server_name: str):
    """
    Install specified MCP server with configuration validation
    
    Args:
        server_name: Name of the server to install
    
    Returns:
        JSON response with installation status and details
    """
    try:
        if not validate_server_name(server_name):
            return jsonify({
                "success": False,
                "error": "Invalid server name format"
            }), 400
        
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available"
            }), 503
        
        # Execute server installation
        installation_result = marketplace_manager.install_server(server_name)
        
        if installation_result["success"]:
            logger.info(f"Server installation successful: {server_name}")
            return jsonify(installation_result), 200
        else:
            logger.warning(f"Server installation failed: {server_name} - {installation_result.get('error')}")
            return jsonify(installation_result), 400
        
    except Exception as e:
        logger.error(f"Server installation error for '{server_name}': {e}")
        return jsonify({
            "success": False,
            "error": "Installation operation failed"
        }), 500

@mcp_bp.route('/trending', methods=['GET'])
def get_trending_servers():
    """
    Retrieve currently trending MCP servers based on popularity metrics
    
    Query Parameters:
        limit (int): Maximum number of trending servers to return
    
    Returns:
        JSON response with trending servers and popularity data
    """
    try:
        limit = int(request.args.get('limit', 10))
        
        if limit < 1 or limit > 50:
            return jsonify({
                "success": False,
                "error": "Limit must be between 1 and 50",
                "servers": []
            }), 400
        
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "servers": []
            }), 503
        
        trending_servers = marketplace_manager.get_trending_servers(limit)
        
        logger.debug(f"Retrieved {len(trending_servers)} trending servers")
        
        return jsonify({
            "success": True,
            "servers": trending_servers,
            "count": len(trending_servers),
            "limit": limit
        })
        
    except ValueError as e:
        logger.warning(f"Invalid limit parameter: {e}")
        return jsonify({
            "success": False,
            "error": "Invalid limit parameter",
            "servers": []
        }), 400
        
    except Exception as e:
        logger.error(f"Trending servers retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve trending servers",
            "servers": []
        }), 500

@mcp_bp.route('/installed', methods=['GET'])
def get_installed_servers():
    """
    Retrieve all currently installed MCP servers with status information
    
    Returns:
        JSON response with installed servers and their operational status
    """
    try:
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "servers": []
            }), 503
        
        installed_servers = marketplace_manager.get_installed_servers()
        
        logger.debug(f"Retrieved {len(installed_servers)} installed servers")
        
        return jsonify({
            "success": True,
            "servers": installed_servers,
            "count": len(installed_servers)
        })
        
    except Exception as e:
        logger.error(f"Installed servers retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve installed servers",
            "servers": []
        }), 500

@mcp_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """
    Generate personalized MCP server recommendations based on project context
    
    Query Parameters:
        project_type (str): Type of project for contextualized recommendations
    
    Returns:
        JSON response with recommended servers and reasoning
    """
    try:
        project_type = request.args.get('project_type', 'general')
        
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "recommendations": []
            }), 503
        
        recommendations = marketplace_manager.get_recommendations_for_project(project_type)
        
        logger.info(f"Generated {len(recommendations)} recommendations for project type: {project_type}")
        
        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "count": len(recommendations),
            "project_type": project_type
        })
        
    except Exception as e:
        logger.error(f"Recommendation generation failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to generate recommendations",
            "recommendations": []
        }), 500

@mcp_bp.route('/manage', methods=['GET'])
def manage_installed_servers():
    """
    Get list of installed MCP servers for management interface
    
    Returns:
        JSON response with installed servers and management options
    """
    try:
        if not marketplace_manager:
            return jsonify({
                "success": False,
                "error": "Marketplace service not available",
                "installed_servers": []
            }), 503
        
        # Get installed servers (same as /installed but formatted for management UI)
        installed_servers = marketplace_manager.get_installed_servers()
        
        # Format for management interface
        management_data = []
        for server in installed_servers:
            management_data.append({
                "name": server.get("name", "Unknown"),
                "status": server.get("status", "unknown"),
                "description": server.get("description", ""),
                "version": server.get("version", "latest"),
                "last_updated": server.get("last_updated", ""),
                "actions": ["restart", "update", "uninstall", "configure"]
            })
        
        logger.debug(f"Management interface serving {len(management_data)} installed servers")
        
        return jsonify({
            "success": True,
            "installed_servers": management_data,
            "total_count": len(management_data),
            "management_actions": ["install_new", "update_all", "restart_all"]
        })
        
    except Exception as e:
        logger.error(f"MCP management endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve management data",
            "installed_servers": []
        }), 500