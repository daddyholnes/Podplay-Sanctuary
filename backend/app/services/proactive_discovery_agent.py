#!/usr/bin/env python3
"""
Proactive Discovery Agent - Mama Bear's intelligent discovery system
Automatically discovers new MCP servers and AI tools
"""

import os
import json
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class ProactiveDiscoveryAgent:
    """Mama Bear's proactive MCP and AI model discovery system"""
    
    def __init__(self, marketplace_service=None, mama_bear_service=None):
        self.marketplace_service = marketplace_service
        self.mama_bear_service = mama_bear_service
        self.discovery_enabled = os.getenv('MCP_DISCOVERY_ENABLED', 'True').lower() == 'true'
        self.last_discovery = None
        self.github_token = os.getenv('GITHUB_TOKEN')  # Optional for higher rate limits
        
        # Discovery configuration
        self.discovery_interval_hours = 24  # Run discovery daily
        self.github_search_queries = [
            "mcp-server language:typescript",
            "model-context-protocol language:python", 
            "mcp-tool language:javascript",
            "anthropic-mcp-server",
            "openai-mcp-server"
        ]
        
        logger.info("🔍 Proactive Discovery Agent initialized")
    
    def should_run_discovery(self) -> bool:
        """Check if discovery should run based on schedule"""
        if not self.discovery_enabled:
            return False
            
        if not self.last_discovery:
            return True
            
        time_since_last = datetime.now() - self.last_discovery
        return time_since_last.total_seconds() > (self.discovery_interval_hours * 3600)
    
    def discover_new_mcp_servers(self) -> List[Dict[str, Any]]:
        """Proactively discover new MCP servers from GitHub and other sources"""
        if not self.should_run_discovery():
            logger.info("🔍 Discovery not scheduled to run yet")
            return []
        
        try:
            logger.info("🔍 Starting proactive MCP server discovery...")
            new_servers = []
            
            # Search GitHub for new MCP servers
            for query in self.github_search_queries:
                github_results = self._search_github_repositories(query)
                
                for repo in github_results:
                    # Skip if we already know about this server
                    if self._is_known_server(repo['name']):
                        continue
                    
                    # Extract server information
                    server_data = {
                        "name": repo['name'],
                        "description": repo.get('description', 'MCP Server discovered via GitHub'),
                        "repository_url": repo['html_url'],
                        "author": repo['owner']['login'],
                        "stars": repo['stargazers_count'],
                        "updated_at": repo['updated_at'],
                        "language": repo.get('language', 'Unknown'),
                        "is_new": True,
                        "discovery_source": "github",
                        "discovery_date": datetime.now().isoformat()
                    }
                    new_servers.append(server_data)
            
            # Limit results to avoid overwhelming users
            new_servers = new_servers[:10]
            
            # Store discovery results in memory
            if new_servers and self.mama_bear_service:
                self.mama_bear_service.store_memory(
                    f"Discovered {len(new_servers)} new MCP servers",
                    {
                        "type": "discovery", 
                        "count": len(new_servers), 
                        "timestamp": datetime.now().isoformat(),
                        "servers": [s["name"] for s in new_servers]
                    }
                )
            
            self.last_discovery = datetime.now()
            logger.info(f"🔍 Discovery complete: found {len(new_servers)} new servers")
            
            return new_servers
            
        except Exception as e:
            logger.error(f"Discovery failed: {e}")
            return []
    
    def _search_github_repositories(self, query: str, per_page: int = 10) -> List[Dict]:
        """Search GitHub repositories for MCP servers"""
        try:
            url = "https://api.github.com/search/repositories"
            params = {
                "q": query,
                "sort": "updated",
                "order": "desc",
                "per_page": per_page
            }
            
            headers = {
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Podplay-Sanctuary-Discovery-Agent"
            }
            
            # Add GitHub token if available for higher rate limits
            if self.github_token:
                headers["Authorization"] = f"token {self.github_token}"
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return data.get('items', [])
            
        except requests.RequestException as e:
            logger.warning(f"GitHub search failed for query '{query}': {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error in GitHub search: {e}")
            return []
    
    def _is_known_server(self, server_name: str) -> bool:
        """Check if a server is already known in the marketplace"""
        if not self.marketplace_service:
            return False
        
        try:
            # Search existing servers
            search_result = self.marketplace_service.search_servers(server_name)
            servers = search_result.get('servers', [])
            
            # Check if any server matches the name
            for server in servers:
                if server.get('name', '').lower() == server_name.lower():
                    return True
            
            return False
            
        except Exception as e:
            logger.warning(f"Error checking if server is known: {e}")
            return False
    
    def get_personalized_recommendations(self, context: str = "") -> List[str]:
        """Get personalized recommendations based on memory and usage patterns"""
        try:
            recommendations = []
            
            # Base recommendations
            base_recommendations = [
                "🔧 Consider exploring database MCP servers for enhanced data management",
                "🌐 Look into web scraping MCP tools for content discovery", 
                "🤖 Try AI-powered MCP servers for enhanced development assistance",
                "📊 Explore analytics MCP tools for project insights",
                "🔐 Consider security-focused MCP servers for safer development"
            ]
            
            # Add context-specific recommendations
            if "python" in context.lower():
                recommendations.extend([
                    "🐍 Explore Python-specific MCP servers for enhanced development",
                    "📦 Consider package management MCP tools"
                ])
            
            if "react" in context.lower():
                recommendations.extend([
                    "⚛️ Look for React component library MCP servers",
                    "🎨 Consider UI/UX focused MCP tools"
                ])
            
            if "api" in context.lower():
                recommendations.extend([
                    "🔌 Explore API testing and documentation MCP servers",
                    "📡 Consider microservices management tools"
                ])
            
            # Get memory-based recommendations
            if self.mama_bear_service:
                memory_insights = self.mama_bear_service.get_contextual_insights("mcp preferences")
                if memory_insights and not memory_insights.get("error"):
                    # Add memory-informed recommendations
                    recommendations.append("🧠 Based on your usage patterns, consider trying new AI integration tools")
            
            # Combine and limit recommendations
            all_recommendations = base_recommendations + recommendations
            return all_recommendations[:6]  # Limit to 6 recommendations
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return [
                "🔧 Explore the MCP marketplace for new development tools",
                "🌟 Consider trying AI-powered development assistants",
                "📚 Look into documentation and learning resources"
            ]
    
    def analyze_trending_technologies(self) -> Dict[str, Any]:
        """Analyze trending technologies and suggest relevant MCP servers"""
        try:
            # Simulate trending analysis (in production, this would use real data sources)
            trending_data = {
                "programming_languages": [
                    {"name": "TypeScript", "growth": "+15%", "relevance": "high"},
                    {"name": "Python", "growth": "+12%", "relevance": "high"},
                    {"name": "Rust", "growth": "+25%", "relevance": "medium"}
                ],
                "frameworks": [
                    {"name": "Next.js", "growth": "+20%", "relevance": "high"},
                    {"name": "FastAPI", "growth": "+18%", "relevance": "high"},
                    {"name": "SvelteKit", "growth": "+30%", "relevance": "medium"}
                ],
                "ai_tools": [
                    {"name": "Claude MCP", "growth": "+50%", "relevance": "high"},
                    {"name": "OpenAI MCP", "growth": "+40%", "relevance": "high"},
                    {"name": "Vertex AI Integration", "growth": "+35%", "relevance": "high"}
                ],
                "suggestions": [
                    "Consider adopting TypeScript MCP servers for better development experience",
                    "Explore Next.js specific MCP tools for full-stack development",
                    "Look into Claude MCP integration for enhanced AI assistance"
                ]
            }
            
            return {
                "success": True,
                "analysis_date": datetime.now().isoformat(),
                "trending_data": trending_data
            }
            
        except Exception as e:
            logger.error(f"Error analyzing trending technologies: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_discovery_status(self) -> Dict[str, Any]:
        """Get current discovery system status"""
        try:
            return {
                "success": True,
                "enabled": self.discovery_enabled,
                "last_discovery": self.last_discovery.isoformat() if self.last_discovery else None,
                "next_discovery": (
                    self.last_discovery + timedelta(hours=self.discovery_interval_hours)
                ).isoformat() if self.last_discovery else "soon",
                "discovery_interval_hours": self.discovery_interval_hours,
                "github_token_configured": bool(self.github_token),
                "search_queries": self.github_search_queries
            }
        except Exception as e:
            logger.error(f"Error getting discovery status: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def set_discovery_enabled(self, enabled: bool) -> bool:
        """Enable or disable discovery system"""
        try:
            self.discovery_enabled = enabled
            logger.info(f"🔍 Discovery system {'enabled' if enabled else 'disabled'}")
            
            if self.mama_bear_service:
                self.mama_bear_service.store_memory(
                    f"Discovery system {'enabled' if enabled else 'disabled'}",
                    {"type": "system_config", "discovery_enabled": enabled}
                )
            
            return True
        except Exception as e:
            logger.error(f"Error setting discovery enabled state: {e}")
            return False
