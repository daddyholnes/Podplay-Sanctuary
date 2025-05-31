"""
MCP Servers Data Loader

Handles loading and parsing of external MCP server configuration data,
replacing the hardcoded server definitions with maintainable JSON configuration
for the Podplay Sanctuary marketplace system.
"""

import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

from models.mcp_server import MCPServer, MCPCategory
from utils.logging_setup import get_logger

logger = get_logger(__name__)

def load_mcp_servers() -> List[MCPServer]:
    """
    Load MCP servers from external JSON configuration with error handling
    
    Returns:
        List of MCPServer instances loaded from configuration
    """
    try:
        # Get path to data file
        data_file_path = _get_data_file_path()
        
        if not data_file_path.exists():
            logger.warning(f"MCP servers data file not found: {data_file_path}")
            return _get_fallback_servers()
        
        # Load and parse JSON data
        with open(data_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        # Validate data structure
        validation_result = _validate_data_structure(data)
        if not validation_result['valid']:
            logger.error(f"Invalid data structure: {validation_result['error']}")
            return _get_fallback_servers()
        
        # Convert server data to MCPServer objects
        servers = []
        for server_data in data.get('servers', []):
            try:
                server = _create_server_from_data(server_data)
                servers.append(server)
            except Exception as e:
                logger.warning(f"Failed to create server from data: {e}")
                logger.warning(f"Problematic server data: {server_data.get('name', 'unknown')}")
                continue
        
        logger.info(f"Successfully loaded {len(servers)} MCP servers from configuration")
        
        # Log metadata information
        metadata = data.get('metadata', {})
        if metadata:
            logger.debug(f"Data version: {metadata.get('schema_version', 'unknown')}")
            logger.debug(f"Last updated: {data.get('last_updated', 'unknown')}")
        
        return servers
        
    except Exception as e:
        logger.error(f"Failed to load MCP servers: {e}")
        return _get_fallback_servers()

def _get_data_file_path() -> Path:
    """Get the path to the MCP servers data file"""
    # Try multiple possible locations
    possible_paths = [
        Path(__file__).parent / "mcp_servers.json",
        Path(__file__).parent.parent / "data" / "mcp_servers.json",
        Path("data") / "mcp_servers.json",
        Path("mcp_servers.json")
    ]
    
    for path in possible_paths:
        if path.exists():
            logger.debug(f"Found MCP servers data at: {path}")
            return path
    
    # Return the first path as default (will be created if needed)
    return possible_paths[0]

def _validate_data_structure(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate the structure of loaded MCP server data
    
    Args:
        data: Loaded JSON data dictionary
        
    Returns:
        Validation result with success status and error details
    """
    required_fields = ['servers', 'version']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return {
            'valid': False,
            'error': f"Missing required fields: {', '.join(missing_fields)}"
        }
    
    servers = data.get('servers', [])
    if not isinstance(servers, list):
        return {
            'valid': False,
            'error': "Servers field must be a list"
        }
    
    if len(servers) == 0:
        return {
            'valid': False,
            'error': "No servers defined in configuration"
        }
    
    # Validate server data structure
    for i, server in enumerate(servers):
        if not isinstance(server, dict):
            return {
                'valid': False,
                'error': f"Server {i} is not a dictionary"
            }
        
        required_server_fields = ['name', 'description', 'category', 'author']
        missing_server_fields = [field for field in required_server_fields if field not in server]
        
        if missing_server_fields:
            return {
                'valid': False,
                'error': f"Server {i} missing fields: {', '.join(missing_server_fields)}"
            }
    
    return {'valid': True}

def _create_server_from_data(server_data: Dict[str, Any]) -> MCPServer:
    """
    Create MCPServer instance from data dictionary with proper type conversion
    
    Args:
        server_data: Server data dictionary from JSON
        
    Returns:
        MCPServer instance
    """
    # Handle category conversion
    category_str = server_data.get('category', 'development_tools')
    try:
        category = MCPCategory(category_str)
    except ValueError:
        logger.warning(f"Invalid category '{category_str}' for server '{server_data.get('name')}', using default")
        category = MCPCategory.DEVELOPMENT_TOOLS
    
    # Create server instance with proper defaults
    server = MCPServer(
        name=server_data['name'],
        description=server_data['description'],
        repository_url=server_data.get('repository_url', ''),
        author=server_data['author'],
        category=category,
        version=server_data.get('version', '1.0.0'),
        installation_method=server_data.get('installation_method', 'npm'),
        capabilities=server_data.get('capabilities', []),
        dependencies=server_data.get('dependencies', []),
        configuration_schema=server_data.get('configuration_schema', {}),
        popularity_score=server_data.get('popularity_score', 0),
        last_updated=server_data.get('last_updated', '2024-01-01'),
        is_official=server_data.get('is_official', False),
        is_installed=server_data.get('is_installed', False),
        installation_status=server_data.get('installation_status', 'not_installed'),
        tags=server_data.get('tags', [])
    )
    
    return server

def _get_fallback_servers() -> List[MCPServer]:
    """
    Provide fallback MCP servers when data file cannot be loaded
    
    Returns:
        List of essential MCP servers for basic functionality
    """
    logger.info("Using fallback MCP servers due to data loading failure")
    
    fallback_servers = [
        MCPServer(
            name="github-mcp-server",
            description="GitHub integration for repository management",
            repository_url="https://github.com/modelcontextprotocol/servers/tree/main/src/github",
            category=MCPCategory.DEVELOPMENT_TOOLS,
            author="Anthropic",
            version="1.0.0",
            installation_method="npm",
            capabilities=["repo_management", "issue_tracking", "pr_management"],
            dependencies=["octokit"],
            configuration_schema={"required": ["github_token"]},
            popularity_score=92,
            last_updated="2024-12-20",
            is_official=True,
            is_installed=False,
            installation_status="not_installed",
            tags=["github", "git", "official"]
        ),
        MCPServer(
            name="postgresql-mcp-server",
            description="PostgreSQL database operations and queries",
            repository_url="https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
            category=MCPCategory.DATABASE,
            author="Anthropic",
            version="1.0.0",
            installation_method="npm",
            capabilities=["sql_queries", "schema_management", "data_operations"],
            dependencies=["pg"],
            configuration_schema={"required": ["connection_string"]},
            popularity_score=85,
            last_updated="2024-12-20",
            is_official=True,
            is_installed=False,
            installation_status="not_installed",
            tags=["postgresql", "database", "official"]
        ),
        MCPServer(
            name="brave-search",
            description="Search the web using Brave Search API",
            repository_url="https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
            category=MCPCategory.SEARCH_DATA,
            author="Anthropic",
            version="1.0.0",
            installation_method="npm",
            capabilities=["web_search", "news_search", "image_search"],
            dependencies=["brave-search-api"],
            configuration_schema={"required": ["api_key"]},
            popularity_score=88,
            last_updated="2024-12-20",
            is_official=True,
            is_installed=False,
            installation_status="not_installed",
            tags=["search", "web", "official"]
        )
    ]
    
    return fallback_servers

def save_mcp_servers(servers: List[MCPServer], backup_existing: bool = True) -> bool:
    """
    Save MCP servers to JSON configuration file
    
    Args:
        servers: List of MCPServer instances to save
        backup_existing: Whether to backup existing file before overwriting
        
    Returns:
        Success status of save operation
    """
    try:
        data_file_path = _get_data_file_path()
        
        # Create backup if requested and file exists
        if backup_existing and data_file_path.exists():
            backup_path = data_file_path.with_suffix('.json.backup')
            data_file_path.rename(backup_path)
            logger.info(f"Created backup: {backup_path}")
        
        # Convert servers to dictionary format
        servers_data = []
        for server in servers:
            server_dict = server.to_dict()
            # Remove fields that shouldn't be in the config file
            server_dict.pop('created_at', None)
            server_dict.pop('updated_at', None)
            server_dict.pop('installation_command', None)
            servers_data.append(server_dict)
        
        # Create complete data structure
        data = {
            "version": "2.0.0",
            "last_updated": "2024-12-25T00:00:00Z",
            "description": "MCP server marketplace data for Podplay Sanctuary",
            "total_servers": len(servers_data),
            "servers": servers_data,
            "metadata": {
                "schema_version": "2.0",
                "generated_by": "Podplay Sanctuary",
                "update_frequency": "as_needed"
            }
        }
        
        # Ensure directory exists
        data_file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write data to file
        with open(data_file_path, 'w', encoding='utf-8') as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(servers)} MCP servers to {data_file_path}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save MCP servers: {e}")
        return False

def get_data_file_info() -> Dict[str, Any]:
    """
    Get information about the MCP servers data file
    
    Returns:
        Dictionary containing file information and statistics
    """
    try:
        data_file_path = _get_data_file_path()
        
        if not data_file_path.exists():
            return {
                "exists": False,
                "path": str(data_file_path),
                "error": "Data file not found"
            }
        
        # Get file statistics
        stat = data_file_path.stat()
        
        # Load and analyze data
        with open(data_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
        
        servers = data.get('servers', [])
        categories = {}
        official_count = 0
        
        for server in servers:
            category = server.get('category', 'unknown')
            categories[category] = categories.get(category, 0) + 1
            if server.get('is_official', False):
                official_count += 1
        
        return {
            "exists": True,
            "path": str(data_file_path),
            "size_bytes": stat.st_size,
            "last_modified": stat.st_mtime,
            "version": data.get('version', 'unknown'),
            "last_updated": data.get('last_updated', 'unknown'),
            "total_servers": len(servers),
            "official_servers": official_count,
            "community_servers": len(servers) - official_count,
            "categories": categories,
            "schema_version": data.get('metadata', {}).get('schema_version', 'unknown')
        }
        
    except Exception as e:
        return {
            "exists": False,
            "path": str(_get_data_file_path()),
            "error": str(e)
        }

def validate_server_data(server_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate individual server data structure
    
    Args:
        server_data: Server data dictionary to validate
        
    Returns:
        Validation result with detailed error information
    """
    errors = []
    warnings = []
    
    # Required fields check
    required_fields = ['name', 'description', 'category', 'author']
    for field in required_fields:
        if field not in server_data:
            errors.append(f"Missing required field: {field}")
        elif not server_data[field]:
            errors.append(f"Empty required field: {field}")
    
    # Category validation
    if 'category' in server_data:
        try:
            MCPCategory(server_data['category'])
        except ValueError:
            errors.append(f"Invalid category: {server_data['category']}")
    
    # URL validation
    if 'repository_url' in server_data:
        url = server_data['repository_url']
        if url and not (url.startswith('http://') or url.startswith('https://')):
            warnings.append("Repository URL should start with http:// or https://")
    
    # Version format check
    if 'version' in server_data:
        version = server_data['version']
        if version and not isinstance(version, str):
            warnings.append("Version should be a string")
    
    # Dependencies validation
    if 'dependencies' in server_data:
        deps = server_data['dependencies']
        if not isinstance(deps, list):
            errors.append("Dependencies must be a list")
    
    # Capabilities validation
    if 'capabilities' in server_data:
        caps = server_data['capabilities']
        if not isinstance(caps, list):
            errors.append("Capabilities must be a list")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'warnings': warnings,
        'score': max(0, 100 - (len(errors) * 20) - (len(warnings) * 5))
    }