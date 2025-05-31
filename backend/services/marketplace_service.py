"""
MCP Marketplace Management Service

Handles Model Context Protocol server discovery, installation, and management.
Extracted from monolithic structure for improved maintainability and testing.
"""

import json
import requests
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
from datetime import datetime

from models.mcp_server import MCPServer, MCPCategory
from models.database import get_db_connection
from data.mcp_data_loader import load_mcp_servers
from utils.logging_setup import get_logger

logger = get_logger(__name__)

class MCPMarketplaceManager:
    """
    Professional MCP marketplace operations with clean separation of concerns
    
    Responsibilities:
    - Server discovery and search
    - Installation management
    - Popularity tracking
    - Database synchronization
    """
    
    def __init__(self):
        """Initialize marketplace manager with database connection"""
        self.marketplace_data = []
        self._initialize_marketplace()
        logger.info("MCP Marketplace Manager initialized successfully")
    
    def _initialize_marketplace(self):
        """Load and synchronize MCP server data"""
        try:
            self.marketplace_data = load_mcp_servers()
            self._sync_marketplace_to_database()
            logger.info(f"Loaded {len(self.marketplace_data)} MCP servers from marketplace")
        except Exception as e:
            logger.error(f"Failed to initialize marketplace: {e}")
            self.marketplace_data = []
    
    def _sync_marketplace_to_database(self):
        """Synchronize marketplace data to database"""
        with get_db_connection() as conn:
            for server in self.marketplace_data:
                self._upsert_server(conn, server)
            conn.commit()
    
    def _upsert_server(self, conn, server: MCPServer):
        """Insert or update server record in database"""
        conn.execute('''
            INSERT OR REPLACE INTO mcp_servers 
            (name, description, repository_url, category, author, version, 
             installation_method, capabilities, dependencies, configuration_schema,
             popularity_score, last_updated, is_official, is_installed, 
             installation_status, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            server.name, server.description, server.repository_url,
            server.category.value, server.author, server.version,
            server.installation_method, json.dumps(server.capabilities),
            json.dumps(server.dependencies), json.dumps(server.configuration_schema),
            server.popularity_score, server.last_updated, server.is_official,
            server.is_installed, server.installation_status, json.dumps(server.tags)
        ))
    
    def search_servers(self, query: str = "", category: Optional[str] = None, 
                      official_only: bool = False) -> List[Dict[str, Any]]:
        """
        Search MCP servers with comprehensive filtering options
        
        Args:
            query: Search term for name, description, or tags
            category: Filter by server category
            official_only: Limit results to official servers only
            
        Returns:
            List of server dictionaries matching search criteria
        """
        try:
            with get_db_connection() as conn:
                sql = "SELECT * FROM mcp_servers WHERE 1=1"
                params = []
                
                if query:
                    sql += " AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)"
                    search_term = f"%{query}%"
                    params.extend([search_term, search_term, search_term])
                
                if category:
                    sql += " AND category = ?"
                    params.append(category)
                
                if official_only:
                    sql += " AND is_official = 1"
                
                sql += " ORDER BY popularity_score DESC, name ASC"
                
                cursor = conn.execute(sql, params)
                servers = []
                
                for row in cursor.fetchall():
                    server_dict = dict(row)
                    server_dict.update({
                        'capabilities': json.loads(server_dict['capabilities']),
                        'dependencies': json.loads(server_dict['dependencies']),
                        'configuration_schema': json.loads(server_dict['configuration_schema']),
                        'tags': json.loads(server_dict['tags'])
                    })
                    servers.append(server_dict)
                
                logger.info(f"Found {len(servers)} servers for query: '{query}'")
                return servers
                
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []
    
    def get_trending_servers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Retrieve trending MCP servers based on popularity metrics
        
        Args:
            limit: Maximum number of servers to return
            
        Returns:
            List of trending server dictionaries
        """
        return self.search_servers()[:limit]
    
    def get_server_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve specific server by name
        
        Args:
            name: Server name to search for
            
        Returns:
            Server dictionary if found, None otherwise
        """
        servers = self.search_servers(query=name)
        return servers[0] if servers else None
    
    def get_recommendations_for_project(self, project_type: str) -> List[Dict[str, Any]]:
        """
        Generate server recommendations based on project requirements
        
        Args:
            project_type: Type of project (web_development, data_science, etc.)
            
        Returns:
            List of recommended server dictionaries
        """
        category_mapping = {
            "web_development": [MCPCategory.WEB_APIS, MCPCategory.DATABASE],
            "data_science": [MCPCategory.AI_ML, MCPCategory.DATABASE],
            "devops": [MCPCategory.CLOUD_SERVICES, MCPCategory.DEVELOPMENT_TOOLS],
            "content_management": [MCPCategory.CONTENT_MANAGEMENT, MCPCategory.PRODUCTIVITY]
        }
        
        categories = category_mapping.get(project_type, [MCPCategory.DEVELOPMENT_TOOLS])
        recommendations = []
        
        for category in categories:
            servers = self.search_servers(category=category.value)
            recommendations.extend(servers[:3])
        
        return recommendations[:10]
    
    def install_server(self, server_name: str) -> Dict[str, Any]:
        """
        Install MCP server (placeholder for actual installation logic)
        
        Args:
            server_name: Name of server to install
            
        Returns:
            Installation result dictionary
        """
        server = self.get_server_by_name(server_name)
        if not server:
            return {"success": False, "error": f"Server '{server_name}' not found"}
        
        try:
            # Update installation status in database
            with get_db_connection() as conn:
                conn.execute(
                    "UPDATE mcp_servers SET is_installed = 1, installation_status = 'installed' WHERE name = ?",
                    (server_name,)
                )
                conn.commit()
            
            logger.info(f"Server '{server_name}' marked as installed")
            return {
                "success": True,
                "message": f"Server '{server_name}' installed successfully",
                "server": server
            }
            
        except Exception as e:
            logger.error(f"Installation failed for '{server_name}': {e}")
            return {"success": False, "error": str(e)}
    
    def get_installed_servers(self) -> List[Dict[str, Any]]:
        """
        Retrieve all currently installed servers
        
        Returns:
            List of installed server dictionaries
        """
        with get_db_connection() as conn:
            cursor = conn.execute("SELECT * FROM mcp_servers WHERE is_installed = 1")
            servers = []
            
            for row in cursor.fetchall():
                server_dict = dict(row)
                server_dict.update({
                    'capabilities': json.loads(server_dict['capabilities']),
                    'dependencies': json.loads(server_dict['dependencies']),
                    'configuration_schema': json.loads(server_dict['configuration_schema']),
                    'tags': json.loads(server_dict['tags'])
                })
                servers.append(server_dict)
            
            return servers
    
    def get_categories(self) -> List[Dict[str, str]]:
        """
        Get available MCP server categories
        
        Returns:
            List of category dictionaries with id, name, and description
        """
        return [
            {"id": "database", "name": "Database", "description": "Database operations and management"},
            {"id": "cloud_services", "name": "Cloud Services", "description": "AWS, GCP, Azure integrations"},
            {"id": "development_tools", "name": "Development Tools", "description": "GitHub, GitLab, CI/CD tools"},
            {"id": "communication", "name": "Communication", "description": "Slack, Discord, messaging tools"},
            {"id": "ai_ml", "name": "AI & ML", "description": "AI models and machine learning tools"},
            {"id": "productivity", "name": "Productivity", "description": "Notion, calendar, task management"},
            {"id": "search_data", "name": "Search & Data", "description": "Web search, data processing"},
            {"id": "security", "name": "Security", "description": "Security scanning and monitoring"},
        ]