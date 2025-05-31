"""
Data loading utilities for external configuration files
"""
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
from ..models.mcp_server import MCPServer, MCPCategory

logger = logging.getLogger(__name__)

def load_mcp_servers(data_path: Path) -> List[MCPServer]:
    """Load MCP servers from external JSON file"""
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        servers = []
        for server_data in data.get('servers', []):
            # Convert category string to enum
            category = MCPCategory(server_data['category'])
            
            server = MCPServer(
                name=server_data['name'],
                description=server_data['description'],
                repository_url=server_data['repository_url'],
                category=category,
                author=server_data['author'],
                version=server_data['version'],
                installation_method=server_data['installation_method'],
                capabilities=server_data['capabilities'],
                dependencies=server_data['dependencies'],
                configuration_schema=server_data['configuration_schema'],
                popularity_score=server_data['popularity_score'],
                last_updated=server_data['last_updated'],
                is_official=server_data['is_official'],
                is_installed=server_data['is_installed'],
                installation_status=server_data['installation_status'],
                tags=server_data['tags']
            )
            servers.append(server)
        
        logger.info(f"📦 Loaded {len(servers)} MCP servers from {data_path}")
        return servers
        
    except Exception as e:
        logger.error(f"Failed to load MCP servers from {data_path}: {e}")
        return []

def get_mcp_categories() -> List[Dict[str, str]]:
    """Get available MCP server categories"""
    return [
        {"id": "database", "name": "Database", "description": "Database operations and management"},
        {"id": "cloud_services", "name": "Cloud Services", "description": "AWS, GCP, Azure integrations"},
        {"id": "development_tools", "name": "Development Tools", "description": "GitHub, GitLab, CI/CD tools"},
        {"id": "communication", "name": "Communication", "description": "Slack, Discord, messaging tools"},
        {"id": "ai_ml", "name": "AI & ML", "description": "AI models and machine learning tools"},
        {"id": "productivity", "name": "Productivity", "description": "Notion, calendar, task management"},
        {"id": "search_data", "name": "Search & Data", "description": "Web search, data processing"},
        {"id": "file_system", "name": "File System", "description": "File operations and management"},
        {"id": "web_apis", "name": "Web APIs", "description": "REST APIs and web services"},
        {"id": "security", "name": "Security", "description": "Security scanning and monitoring"},
        {"id": "monitoring", "name": "Monitoring", "description": "System monitoring and alerts"},
        {"id": "content_management", "name": "Content Management", "description": "CMS and content tools"}
    ]
