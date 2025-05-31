"""
Proactive Discovery Agent Service

Intelligent MCP server and AI model discovery system that proactively identifies
new tools, analyzes trends, and provides personalized recommendations for the
Podplay Sanctuary development environment.
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional

from utils.logging_setup import get_logger

logger = get_logger(__name__)

class ProactiveDiscoveryAgent:
    """
    Professional discovery service for automated tool identification and recommendation
    
    Core capabilities:
    - GitHub repository monitoring for new MCP servers
    - Trend analysis and popularity tracking
    - Personalized recommendation generation
    - Integration compatibility assessment
    - Discovery result caching and optimization
    """
    
    def __init__(self, marketplace_manager, enhanced_mama):
        """
        Initialize discovery agent with service dependencies
        
        Args:
            marketplace_manager: MCP marketplace service instance
            enhanced_mama: Enhanced AI service for memory and insights
        """
        self.marketplace = marketplace_manager
        self.enhanced_mama = enhanced_mama
        self.discovery_enabled = True
        self.last_discovery_time = None
        self.discovery_cache = {}
        self.cache_duration = timedelta(hours=6)  # Cache discoveries for 6 hours
        
        logger.info("Proactive Discovery Agent initialized successfully")
    
    def discover_new_mcp_servers(self) -> List[Dict[str, Any]]:
        """
        Discover new MCP servers from GitHub and other sources with intelligent caching
        
        Returns:
            List of newly discovered server dictionaries with metadata
        """
        if not self.discovery_enabled:
            logger.debug("Discovery disabled - returning empty results")
            return []
        
        # Check cache validity
        if self._is_cache_valid('github_discovery'):
            cached_results = self.discovery_cache.get('github_discovery', [])
            logger.debug(f"Returning {len(cached_results)} cached discovery results")
            return cached_results
        
        try:
            discovered_servers = []
            
            # Search GitHub for MCP-related repositories
            github_discoveries = self._discover_from_github()
            discovered_servers.extend(github_discoveries)
            
            # Search for trending AI/development tools
            trending_discoveries = self._discover_trending_tools()
            discovered_servers.extend(trending_discoveries)
            
            # Remove duplicates and validate discoveries
            unique_servers = self._deduplicate_discoveries(discovered_servers)
            validated_servers = self._validate_discoveries(unique_servers)
            
            # Cache results for future requests
            self.discovery_cache['github_discovery'] = validated_servers
            self.discovery_cache['github_discovery_time'] = datetime.now()
            
            # Store discovery insights in memory
            if validated_servers:
                self.enhanced_mama.store_memory(
                    f"Discovered {len(validated_servers)} new MCP servers",
                    {
                        "type": "discovery_session",
                        "count": len(validated_servers),
                        "sources": ["github", "trending"],
                        "timestamp": datetime.now().isoformat()
                    }
                )
            
            self.last_discovery_time = datetime.now()
            logger.info(f"Discovery completed: {len(validated_servers)} new servers found")
            
            return validated_servers
            
        except Exception as e:
            logger.error(f"Discovery operation failed: {e}")
            return []
    
    def _discover_from_github(self) -> List[Dict[str, Any]]:
        """Search GitHub for new MCP server repositories"""
        try:
            # GitHub API search for MCP-related repositories
            search_params = {
                "q": "topic:model-context-protocol OR topic:mcp-server created:>2024-12-01",
                "sort": "created",
                "order": "desc",
                "per_page": 10
            }
            
            response = requests.get(
                "https://api.github.com/search/repositories",
                params=search_params,
                timeout=10
            )
            
            if response.status_code == 200:
                repositories = response.json().get('items', [])
                github_servers = []
                
                for repo in repositories:
                    server_data = {
                        "name": repo['name'],
                        "description": repo.get('description') or "No description available",
                        "repository_url": repo['html_url'],
                        "author": repo['owner']['login'],
                        "version": "latest",
                        "installation_method": self._detect_installation_method(repo),
                        "capabilities": self._extract_capabilities(repo),
                        "dependencies": [],
                        "configuration_schema": {},
                        "popularity_score": self._calculate_popularity_score(repo),
                        "last_updated": repo['updated_at'],
                        "is_official": self._is_official_repo(repo),
                        "is_installed": False,
                        "installation_status": "not_installed",
                        "tags": ["new", "discovered", "github"],
                        "discovery_source": "github_api",
                        "discovery_date": datetime.now().isoformat()
                    }
                    github_servers.append(server_data)
                
                logger.debug(f"Discovered {len(github_servers)} servers from GitHub")
                return github_servers
                
            else:
                logger.warning(f"GitHub API request failed: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"GitHub discovery failed: {e}")
            return []
    
    def _discover_trending_tools(self) -> List[Dict[str, Any]]:
        """Discover trending development tools that could become MCP servers"""
        try:
            # Search for trending development tools
            trending_searches = [
                "mcp server",
                "model context protocol",
                "ai development tools",
                "llm integration tools"
            ]
            
            trending_servers = []
            
            for search_term in trending_searches[:2]:  # Limit to avoid rate limits
                search_params = {
                    "q": f"{search_term} created:>2024-11-01",
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 5
                }
                
                try:
                    response = requests.get(
                        "https://api.github.com/search/repositories",
                        params=search_params,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        repos = response.json().get('items', [])
                        
                        for repo in repos[:3]:  # Limit results per search
                            if repo['stargazers_count'] >= 10:  # Only include repos with some traction
                                server_data = {
                                    "name": f"{repo['name']}-mcp-potential",
                                    "description": f"Trending tool: {repo.get('description', 'No description')}",
                                    "repository_url": repo['html_url'],
                                    "author": repo['owner']['login'],
                                    "version": "potential",
                                    "installation_method": "evaluation_needed",
                                    "capabilities": ["trending_tool"],
                                    "dependencies": [],
                                    "configuration_schema": {},
                                    "popularity_score": min(repo['stargazers_count'], 100),
                                    "last_updated": repo['updated_at'],
                                    "is_official": False,
                                    "is_installed": False,
                                    "installation_status": "evaluation_needed",
                                    "tags": ["trending", "potential", "evaluation"],
                                    "discovery_source": "trending_analysis",
                                    "discovery_date": datetime.now().isoformat()
                                }
                                trending_servers.append(server_data)
                
                except Exception as search_error:
                    logger.warning(f"Trending search failed for '{search_term}': {search_error}")
                    continue
            
            logger.debug(f"Discovered {len(trending_servers)} trending tools")
            return trending_servers
            
        except Exception as e:
            logger.error(f"Trending discovery failed: {e}")
            return []
    
    def _detect_installation_method(self, repo: Dict) -> str:
        """Detect installation method based on repository contents"""
        repo_name = repo.get('name', '').lower()
        description = repo.get('description', '').lower()
        
        if 'package.json' in description or 'npm' in description or repo_name.endswith('-js'):
            return "npm"
        elif 'setup.py' in description or 'pip' in description or repo_name.endswith('-py'):
            return "pip"
        elif 'dockerfile' in description or 'docker' in description:
            return "docker"
        else:
            return "manual"
    
    def _extract_capabilities(self, repo: Dict) -> List[str]:
        """Extract potential capabilities from repository metadata"""
        description = repo.get('description', '').lower()
        topics = repo.get('topics', [])
        
        capabilities = []
        
        # Analyze description for capability keywords
        capability_keywords = {
            'database': ['database', 'sql', 'postgres', 'mysql', 'mongodb'],
            'cloud': ['aws', 'azure', 'gcp', 'cloud'],
            'ai': ['ai', 'ml', 'openai', 'anthropic', 'llm'],
            'development': ['github', 'git', 'ci', 'cd', 'deploy'],
            'communication': ['slack', 'discord', 'teams', 'chat'],
            'search': ['search', 'elasticsearch', 'solr'],
            'monitoring': ['monitoring', 'metrics', 'logging']
        }
        
        for capability, keywords in capability_keywords.items():
            if any(keyword in description for keyword in keywords):
                capabilities.append(capability)
        
        # Add capabilities from topics
        for topic in topics:
            if topic not in capabilities:
                capabilities.append(topic)
        
        return capabilities[:5]  # Limit to 5 capabilities
    
    def _calculate_popularity_score(self, repo: Dict) -> int:
        """Calculate popularity score based on GitHub metrics"""
        stars = repo.get('stargazers_count', 0)
        forks = repo.get('forks_count', 0)
        watchers = repo.get('watchers_count', 0)
        
        # Weighted popularity calculation
        score = (stars * 2) + forks + (watchers * 0.5)
        return min(int(score), 100)  # Cap at 100
    
    def _is_official_repo(self, repo: Dict) -> bool:
        """Determine if repository is from an official source"""
        official_orgs = ['anthropic', 'openai', 'modelcontextprotocol', 'microsoft', 'google']
        owner = repo.get('owner', {}).get('login', '').lower()
        return owner in official_orgs
    
    def _deduplicate_discoveries(self, servers: List[Dict]) -> List[Dict]:
        """Remove duplicate discoveries based on repository URL"""
        seen_urls = set()
        unique_servers = []
        
        for server in servers:
            repo_url = server.get('repository_url', '')
            if repo_url not in seen_urls:
                seen_urls.add(repo_url)
                unique_servers.append(server)
        
        return unique_servers
    
    def _validate_discoveries(self, servers: List[Dict]) -> List[Dict]:
        """Validate discovered servers for quality and relevance"""
        validated_servers = []
        
        for server in servers:
            # Basic validation criteria
            if (server.get('name') and 
                server.get('description') and 
                server.get('repository_url') and
                len(server.get('description', '')) > 10):
                validated_servers.append(server)
        
        return validated_servers
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Check if cached discovery results are still valid"""
        cache_time = self.discovery_cache.get(f"{cache_key}_time")
        if not cache_time:
            return False
        
        return datetime.now() - cache_time < self.cache_duration
    
    def get_personalized_recommendations(self, context: str = "") -> List[str]:
        """
        Generate personalized recommendations based on user context and memory
        
        Args:
            context: Context string for recommendation generation
            
        Returns:
            List of personalized recommendation strings
        """
        try:
            # Get insights from memory system
            insights = self.enhanced_mama.get_contextual_insights(context or "development tools usage")
            
            # Base recommendations
            recommendations = [
                "🔍 Explore the latest GitHub MCP integration for enhanced repository management",
                "🗄️ Consider PostgreSQL MCP server for robust database operations",
                "📝 Notion MCP integration could streamline your project documentation workflow",
                "☁️ AWS MCP server provides comprehensive cloud service management",
                "🤖 OpenAI MCP server enables advanced AI model integration"
            ]
            
            # Memory-based recommendations
            if insights.get("relevant_memories"):
                memory_patterns = {}
                for memory in insights["relevant_memories"]:
                    memory_type = memory.get('metadata', {}).get('type', 'general')
                    memory_patterns[memory_type] = memory_patterns.get(memory_type, 0) + 1
                
                # Generate recommendations based on usage patterns
                if memory_patterns.get('code_execution', 0) > 2:
                    recommendations.append("💻 Based on your coding activity, consider exploring development-focused MCP servers")
                
                if memory_patterns.get('chat_message', 0) > 5:
                    recommendations.append("🗣️ You're actively using chat features - explore communication MCP integrations")
                
                if memory_patterns.get('discovery_session', 0) > 1:
                    recommendations.append("🔍 Your exploration pattern suggests interest in cutting-edge tools - check trending repositories")
            
            # Recent discovery recommendations
            recent_discoveries = self.discover_new_mcp_servers()
            if recent_discoveries:
                top_discovery = recent_discoveries[0]
                recommendations.append(f"⭐ New discovery: {top_discovery['name']} - {top_discovery['description'][:50]}...")
            
            logger.debug(f"Generated {len(recommendations)} personalized recommendations")
            return recommendations[:5]  # Return top 5 recommendations
            
        except Exception as e:
            logger.error(f"Recommendation generation failed: {e}")
            return [
                "🐻 I'm currently optimizing my recommendation system",
                "🔧 Check the MCP marketplace for the latest tools",
                "💡 Consider exploring official Anthropic MCP servers"
            ]
    
    def get_discovery_stats(self) -> Dict[str, Any]:
        """
        Get statistics about discovery operations and cache status
        
        Returns:
            Dictionary containing discovery statistics and system status
        """
        return {
            "discovery_enabled": self.discovery_enabled,
            "last_discovery": self.last_discovery_time.isoformat() if self.last_discovery_time else None,
            "cache_entries": len(self.discovery_cache),
            "cache_duration_hours": self.cache_duration.total_seconds() / 3600,
            "services_status": {
                "github_api": "available",
                "memory_system": bool(self.enhanced_mama.memory),
                "marketplace_integration": bool(self.marketplace)
            }
        }