"""
Development Tools API Blueprint

Provides development utilities, testing endpoints, and debugging capabilities
for the Podplay Sanctuary platform including connectivity tests, data validation,
and development environment management.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import os

from models.database import get_database_stats
from data.mcp_data_loader import get_data_file_info, validate_server_data
from services import get_service_status, get_service
from utils.logging_setup import get_logger
from utils.validators import validate_json_data, validate_url

logger = get_logger(__name__)

# Create blueprint for development tools
dev_bp = Blueprint('dev_tools', __name__, url_prefix='/api/dev')

@dev_bp.route('/ping', methods=['GET'])
def ping():
    """
    Simple ping endpoint for connectivity testing
    
    Returns:
        JSON response confirming service availability
    """
    return jsonify({
        "status": "pong",
        "timestamp": datetime.now().isoformat(),
        "service": "podplay-sanctuary",
        "version": "2.0.0"
    })

@dev_bp.route('/echo', methods=['POST'])
def echo():
    """
    Echo endpoint for testing request/response cycle
    
    Returns:
        JSON response echoing the request data with metadata
    """
    try:
        request_data = request.get_json() if request.is_json else {}
        
        echo_response = {
            "echo": request_data,
            "metadata": {
                "method": request.method,
                "endpoint": request.endpoint,
                "timestamp": datetime.now().isoformat(),
                "content_type": request.content_type,
                "content_length": request.content_length,
                "user_agent": request.headers.get('User-Agent', 'unknown'),
                "remote_addr": request.remote_addr
            }
        }
        
        return jsonify(echo_response)
        
    except Exception as e:
        logger.error(f"Echo endpoint error: {e}")
        return jsonify({
            "error": "Echo processing failed",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/validate/json', methods=['POST'])
def validate_json():
    """
    Validate JSON data structure and format
    
    Returns:
        JSON response with validation results and analysis
    """
    try:
        raw_data = request.get_data(as_text=True)
        
        if not raw_data:
            return jsonify({
                "valid": False,
                "error": "No JSON data provided"
            }), 400
        
        validation_result = validate_json_data(raw_data)
        
        if validation_result['valid']:
            # Additional analysis for valid JSON
            parsed_data = validation_result['data']
            analysis = {
                "type": type(parsed_data).__name__,
                "size_bytes": validation_result['size_bytes'],
                "keys": list(parsed_data.keys()) if isinstance(parsed_data, dict) else None,
                "length": len(parsed_data) if isinstance(parsed_data, (list, dict, str)) else None,
                "nested_levels": _count_nested_levels(parsed_data)
            }
            validation_result['analysis'] = analysis
        
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"JSON validation error: {e}")
        return jsonify({
            "valid": False,
            "error": f"Validation processing failed: {str(e)}"
        }), 500

@dev_bp.route('/validate/url', methods=['POST'])
def validate_url_endpoint():
    """
    Validate URL format and accessibility
    
    Returns:
        JSON response with URL validation results
    """
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({
                "valid": False,
                "error": "URL parameter required"
            }), 400
        
        url = data['url']
        validation_result = validate_url(url)
        
        # Add timestamp to result
        validation_result['timestamp'] = datetime.now().isoformat()
        
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"URL validation error: {e}")
        return jsonify({
            "valid": False,
            "error": f"URL validation failed: {str(e)}"
        }), 500

@dev_bp.route('/validate/mcp-server', methods=['POST'])
def validate_mcp_server():
    """
    Validate MCP server data structure against schema
    
    Returns:
        JSON response with detailed validation results
    """
    try:
        server_data = request.get_json()
        if not server_data:
            return jsonify({
                "valid": False,
                "error": "MCP server data required"
            }), 400
        
        validation_result = validate_server_data(server_data)
        validation_result['timestamp'] = datetime.now().isoformat()
        
        return jsonify(validation_result)
        
    except Exception as e:
        logger.error(f"MCP server validation error: {e}")
        return jsonify({
            "valid": False,
            "error": f"MCP server validation failed: {str(e)}"
        }), 500

@dev_bp.route('/database/info', methods=['GET'])
def get_database_info():
    """
    Get comprehensive database information and statistics
    
    Returns:
        JSON response with database details and health metrics
    """
    try:
        db_stats = get_database_stats()
        
        # Calculate additional metrics
        total_records = sum(v for k, v in db_stats.items() if k.endswith('_count') and isinstance(v, int))
        
        database_info = {
            "timestamp": datetime.now().isoformat(),
            "statistics": db_stats,
            "summary": {
                "total_records": total_records,
                "total_tables": len([k for k in db_stats.keys() if k.endswith('_count')]),
                "initialized": db_stats.get('initialized', False),
                "size_mb": round(db_stats.get('database_size_bytes', 0) / (1024 * 1024), 2)
            },
            "health": {
                "status": "healthy" if db_stats.get('initialized') else "needs_initialization",
                "recommendations": []
            }
        }
        
        # Add health recommendations
        if total_records == 0:
            database_info["health"]["recommendations"].append("Database appears empty - consider loading initial data")
        elif total_records > 10000:
            database_info["health"]["recommendations"].append("Large dataset detected - consider optimization")
        
        return jsonify({
            "success": True,
            "database": database_info
        })
        
    except Exception as e:
        logger.error(f"Database info retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Database information unavailable",
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/mcp-data/info', methods=['GET'])
def get_mcp_data_info():
    """
    Get information about MCP servers data file and configuration
    
    Returns:
        JSON response with data file statistics and status
    """
    try:
        data_info = get_data_file_info()
        
        # Add development-specific information
        if data_info.get('exists'):
            dev_info = {
                "file_accessible": True,
                "last_modified_readable": datetime.fromtimestamp(
                    data_info['last_modified']
                ).strftime('%Y-%m-%d %H:%M:%S'),
                "size_kb": round(data_info['size_bytes'] / 1024, 2),
                "data_integrity": "good" if data_info.get('total_servers', 0) > 0 else "questionable"
            }
            data_info.update(dev_info)
        
        return jsonify({
            "success": True,
            "mcp_data": data_info,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"MCP data info retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "MCP data information unavailable",
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/services/status', methods=['GET'])
def get_services_status():
    """
    Get detailed status of all application services for debugging
    
    Returns:
        JSON response with comprehensive service status information
    """
    try:
        service_status = get_service_status()
        
        # Add development-specific debugging information
        debug_info = {
            "environment_variables": {
                "MEM0_API_KEY": "configured" if os.getenv('MEM0_API_KEY') else "not_configured",
                "TOGETHER_AI_API_KEY": "configured" if os.getenv('TOGETHER_AI_API_KEY') else "not_configured",
                "GOOGLE_APPLICATION_CREDENTIALS": "configured" if os.getenv('GOOGLE_APPLICATION_CREDENTIALS') else "not_configured",
                "DATABASE_URL": "configured" if os.getenv('DATABASE_URL') else "using_default"
            },
            "service_instances": {
                "mama_bear_agent": bool(get_service('mama_bear_agent')),
                "marketplace_manager": bool(get_service('marketplace_manager')),
                "enhanced_mama": bool(get_service('enhanced_mama')),
                "discovery_agent": bool(get_service('discovery_agent'))
            }
        }
        
        service_status['debug_info'] = debug_info
        
        return jsonify({
            "success": True,
            "services": service_status
        })
        
    except Exception as e:
        logger.error(f"Services status retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Services status unavailable",
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/logs/recent', methods=['GET'])
def get_recent_logs():
    """
    Get recent application logs for debugging (last 50 entries)
    
    Returns:
        JSON response with recent log entries
    """
    try:
        # In a real implementation, this would read from log files
        # For now, return mock log data
        mock_logs = [
            {
                "timestamp": "2024-12-25T10:30:15.123Z",
                "level": "INFO",
                "logger": "mama_bear_agent",
                "message": "Chat interaction processed successfully",
                "user_id": "nathan"
            },
            {
                "timestamp": "2024-12-25T10:29:45.456Z", 
                "level": "DEBUG",
                "logger": "marketplace_manager",
                "message": "MCP server search completed: 5 results",
                "query": "database"
            },
            {
                "timestamp": "2024-12-25T10:29:12.789Z",
                "level": "INFO",
                "logger": "discovery_agent", 
                "message": "GitHub discovery completed: 3 new servers found",
                "servers_found": 3
            },
            {
                "timestamp": "2024-12-25T10:28:33.012Z",
                "level": "WARNING",
                "logger": "enhanced_mama",
                "message": "Mem0.ai not configured - using local memory fallback",
                "fallback_active": True
            }
        ]
        
        return jsonify({
            "success": True,
            "logs": mock_logs,
            "total": len(mock_logs),
            "note": "This is mock data - real implementation would read from log files"
        })
        
    except Exception as e:
        logger.error(f"Log retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Log retrieval unavailable",
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/performance/metrics', methods=['GET'])
def get_performance_metrics():
    """
    Get performance metrics for development monitoring
    
    Returns:
        JSON response with performance data and system metrics
    """
    try:
        # Mock performance data - in production would use actual monitoring
        metrics = {
            "timestamp": datetime.now().isoformat(),
            "response_times": {
                "api_average_ms": 85,
                "database_query_ms": 12,
                "mcp_search_ms": 45,
                "chat_processing_ms": 120
            },
            "resource_usage": {
                "cpu_percent": 25.5,
                "memory_percent": 68.2,
                "disk_percent": 45.0,
                "network_io": {
                    "bytes_sent": 1024000,
                    "bytes_received": 2048000
                }
            },
            "service_performance": {
                "mama_bear_agent": {"avg_response_ms": 120, "requests_per_minute": 15},
                "marketplace_manager": {"avg_response_ms": 45, "requests_per_minute": 8},
                "database": {"query_time_ms": 12, "connection_pool_usage": 3}
            },
            "error_rates": {
                "total_requests": 1250,
                "errors": 2,
                "error_rate_percent": 0.16
            }
        }
        
        return jsonify({
            "success": True,
            "metrics": metrics
        })
        
    except Exception as e:
        logger.error(f"Performance metrics retrieval failed: {e}")
        return jsonify({
            "success": False,
            "error": "Performance metrics unavailable",
            "timestamp": datetime.now().isoformat()
        }), 500

@dev_bp.route('/test/connectivity', methods=['GET'])
def test_connectivity():
    """
    Test connectivity to all external services and dependencies
    
    Returns:
        JSON response with connectivity test results
    """
    try:
        connectivity_tests = {
            "timestamp": datetime.now().isoformat(),
            "tests": []
        }
        
        # Test GitHub API connectivity
        try:
            import requests
            response = requests.get("https://api.github.com/zen", timeout=5)
            connectivity_tests["tests"].append({
                "service": "GitHub API",
                "status": "connected" if response.status_code == 200 else "error",
                "response_time_ms": int(response.elapsed.total_seconds() * 1000),
                "status_code": response.status_code
            })
        except Exception as e:
            connectivity_tests["tests"].append({
                "service": "GitHub API",
                "status": "failed",
                "error": str(e)
            })
        
        # Test Mem0.ai connectivity (if configured)
        mem0_key = os.getenv('MEM0_API_KEY')
        connectivity_tests["tests"].append({
            "service": "Mem0.ai",
            "status": "configured" if mem0_key else "not_configured",
            "note": "API key available" if mem0_key else "API key not provided"
        })
        
        # Test Together.ai connectivity (if configured)
        together_key = os.getenv('TOGETHER_AI_API_KEY')
        connectivity_tests["tests"].append({
            "service": "Together.ai",
            "status": "configured" if together_key else "not_configured",
            "note": "API key available" if together_key else "API key not provided"
        })
        
        # Calculate overall connectivity status
        connected_services = len([t for t in connectivity_tests["tests"] if t["status"] in ["connected", "configured"]])
        total_services = len(connectivity_tests["tests"])
        
        connectivity_tests["summary"] = {
            "connected_services": connected_services,
            "total_services": total_services,
            "connectivity_rate": round((connected_services / total_services) * 100, 1) if total_services > 0 else 0,
            "overall_status": "good" if connected_services >= total_services * 0.8 else "degraded"
        }
        
        return jsonify({
            "success": True,
            "connectivity": connectivity_tests
        })
        
    except Exception as e:
        logger.error(f"Connectivity test failed: {e}")
        return jsonify({
            "success": False,
            "error": "Connectivity test failed",
            "timestamp": datetime.now().isoformat()
        }), 500

def _count_nested_levels(data, current_level=0):
    """
    Count the maximum nesting level in a data structure
    
    Args:
        data: Data structure to analyze
        current_level: Current nesting level
        
    Returns:
        Maximum nesting level found
    """
    if isinstance(data, dict):
        if not data:
            return current_level
        return max(_count_nested_levels(value, current_level + 1) for value in data.values())
    elif isinstance(data, list):
        if not data:
            return current_level
        return max(_count_nested_levels(item, current_level + 1) for item in data)
    else:
        return current_level