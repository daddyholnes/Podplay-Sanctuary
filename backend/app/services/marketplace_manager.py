"""
MCP Marketplace Management Service
Clean, focused service for MCP server operations
"""
import json
import logging
from typing import List, Dict, Any, Optional
from ..models.mcp_server import MCPServer, MCPCategory
from ..models.database import SanctuaryDB
from ..data import load_mcp_servers

logger = logging.getLogger(__name__)

class MCPMarketplaceManager:
    """Clean, focused MCP marketplace operations"""
    
    def __init__(self, db: SanctuaryDB, data_path: str):
        self.db = db
        self.data_path = data_path
        self._initialize_marketplace()
    
    def _initialize_marketplace(self):
        """Load MCP servers from external JSON and sync to database"""
        try:
            from pathlib import Path
            servers = load_mcp_servers(Path(self.data_path))
            self._sync_to_database(servers)
            logger.info("🛒 MCP Marketplace initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize marketplace: {e}")
    
    def _sync_to_database(self, servers: List[MCPServer]):
        """Sync marketplace data to database"""
        try:
            with self.db.get_connection() as conn:
                for server in servers:
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
                conn.commit()
                logger.info(f"📦 Synced {len(servers)} servers to database")
        except Exception as e:
            logger.error(f"Failed to sync servers to database: {e}")
    
    def search_servers(self, query: str = "", category: Optional[str] = None, 
                      official_only: bool = False) -> List[Dict[str, Any]]:
        """Search MCP servers with filters"""
        try:
            with self.db.get_connection() as conn:
                sql = "SELECT * FROM mcp_servers WHERE 1=1"
                params = []
                
                if query:
                    sql += " AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)"
                    params.extend([f"%{query}%", f"%{query}%", f"%{query}%"])
                
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
                    # Parse JSON fields
                    server_dict['capabilities'] = json.loads(server_dict['capabilities'])
                    server_dict['dependencies'] = json.loads(server_dict['dependencies'])
                    server_dict['configuration_schema'] = json.loads(server_dict['configuration_schema'])
                    server_dict['tags'] = json.loads(server_dict['tags'])
                    servers.append(server_dict)
                
                return servers
        except Exception as e:
            logger.error(f"Error searching servers: {e}")
            return []
    
    def get_trending_servers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending MCP servers"""
        return self.search_servers()[:limit]
    
    def get_server_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Get specific server by name"""
        servers = self.search_servers(query=name)
        return servers[0] if servers else None
    
    def install_server(self, server_name: str) -> Dict[str, Any]:
        """Install MCP server (placeholder for actual installation logic)"""
        try:
            server = self.get_server_by_name(server_name)
            if not server:
                return {"success": False, "error": "Server not found"}
            
            # Update installation status in database
            with self.db.get_connection() as conn:
                conn.execute('''
                    UPDATE mcp_servers 
                    SET is_installed = 1, installation_status = 'installed'
                    WHERE name = ?
                ''', (server_name,))
                conn.commit()
            
            logger.info(f"📥 Installed MCP server: {server_name}")
            return {"success": True, "message": f"Successfully installed {server_name}"}
        except Exception as e:
            logger.error(f"Failed to install server {server_name}: {e}")
            return {"success": False, "error": str(e)}
    
    def get_recommendations_for_project(self, project_type: str) -> List[Dict[str, Any]]:
        """Get MCP server recommendations based on project type"""
        category_map = {
            "web_development": ["web_apis", "database"],
            "data_science": ["ai_ml", "database"],
            "devops": ["cloud_services", "development_tools"],
            "content_management": ["content_management", "productivity"]
        }
        
        categories = category_map.get(project_type, [])
        recommendations = []
        
        for category in categories:
            servers = self.search_servers(category=category)
            recommendations.extend(servers[:3])  # Top 3 from each category
        
        return recommendations[:10]  # Limit to 10 recommendations
