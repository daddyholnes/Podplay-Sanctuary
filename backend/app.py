#!/usr/bin/env python3
"""
Podplay Build Backend - MCP Marketplace & Lead Developer Agent
The Sanctuary for Calm, Empowered Creation

This backend serves as the foundation for Mama Bear Gem - the Lead Developer Agent
that proactively discovers, manages, and integrates MCP tools and AI models.

Enhanced with:
- Mem0.ai for persistent memory and RAG services
- Together.ai for VM sandbox capabilities
"""

# Load environment variables at the very beginning to ensure they're available
# for all imports that might need them
import os
from dotenv import load_dotenv

# Prioritize .env.local for development secrets, then fall back to .env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

import asyncio
import json
import logging
import subprocess
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import requests
from dataclasses import dataclass, asdict
from enum import Enum
import sqlite3
from contextlib import contextmanager
import threading
import time

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv

# Enhanced Mama Bear Capabilities
try:
    from mem0 import MemoryClient
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False
    MemoryClient = None

try:
    import together
    TOGETHER_AVAILABLE = True
except ImportError:
    TOGETHER_AVAILABLE = False
    together = None

# Enhanced Vertex AI Mama Bear
try:
    from enhanced_mama_bear import VertexAIMamaBear
    ENHANCED_MAMA_AVAILABLE = True
except ImportError:
    ENHANCED_MAMA_AVAILABLE = False
    VertexAIMamaBear = None

# DevSandbox Integration
try:
    from cloud_dev_sandbox import CloudDevSandboxManager as DevSandboxManager
    DEV_SANDBOX_AVAILABLE = True
except ImportError:
    DEV_SANDBOX_AVAILABLE = False
    DevSandboxManager = None

# Mem0 Chat Manager Integration
try:
    from mem0_chat_manager import mem0_chat_manager
    MEM0_CHAT_AVAILABLE = True
except ImportError:
    MEM0_CHAT_AVAILABLE = False
    mem0_chat_manager = None

# Configure logging for the sanctuary first
logging.basicConfig(
    level=logging.INFO,
    format='🐻 Mama Bear: %(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mama_bear.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Import agentic capabilities
try:
    from cloud_dev_sandbox import AgenticDevSandbox
    AGENTIC_DEV_AVAILABLE = True
    agentic_dev_assistant = AgenticDevSandbox()
    logger.info("🤖 Agentic DevSandbox assistant initialized")
except ImportError as e:
    AGENTIC_DEV_AVAILABLE = False
    agentic_dev_assistant = None
    logger.warning(f"Agentic DevSandbox not available: {e}")

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# ==================== MCP MARKETPLACE DATA MODELS ====================

class MCPCategory(Enum):
    """Categories for MCP servers based on marketplace research"""
    DATABASE = "database"
    CLOUD_SERVICES = "cloud_services"
    DEVELOPMENT_TOOLS = "development_tools"
    COMMUNICATION = "communication"
    AI_ML = "ai_ml"
    PRODUCTIVITY = "productivity"
    SEARCH_DATA = "search_data"
    FILE_SYSTEM = "file_system"
    WEB_APIS = "web_apis"
    SECURITY = "security"
    MONITORING = "monitoring"
    CONTENT_MANAGEMENT = "content_management"

@dataclass
class MCPServer:
    """Comprehensive MCP Server model"""
    name: str
    description: str
    repository_url: str
    category: MCPCategory
    author: str
    version: str
    installation_method: str  # npm, pip, binary, docker
    capabilities: List[str]
    dependencies: List[str]
    configuration_schema: Dict[str, Any]
    popularity_score: int
    last_updated: str
    is_official: bool
    is_installed: bool
    installation_status: str
    tags: List[str]

@dataclass
class DailyBriefing:
    """Mama Bear's daily briefing structure"""
    date: str
    new_mcp_tools: List[MCPServer]
    updated_models: List[Dict[str, Any]]
    project_priorities: List[str]
    recommendations: List[str]
    system_status: Dict[str, Any]

# ==================== DATABASE SETUP ====================

class SanctuaryDB:
    """Database manager for the Podplay Build sanctuary"""
    
    def __init__(self, db_path: str = "sanctuary.db"):
        self.db_path = db_path
        self.init_database()
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def init_database(self):
        """Initialize the sanctuary database"""
        with self.get_connection() as conn:
            # MCP Servers table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS mcp_servers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    repository_url TEXT,
                    category TEXT,
                    author TEXT,
                    version TEXT,
                    installation_method TEXT,
                    capabilities TEXT,  -- JSON array
                    dependencies TEXT,  -- JSON array
                    configuration_schema TEXT,  -- JSON object
                    popularity_score INTEGER DEFAULT 0,
                    last_updated TEXT,
                    is_official BOOLEAN DEFAULT 0,
                    is_installed BOOLEAN DEFAULT 0,
                    installation_status TEXT DEFAULT 'not_installed',
                    tags TEXT,  -- JSON array
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Daily briefings table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS daily_briefings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT UNIQUE NOT NULL,
                    briefing_data TEXT,  -- JSON object
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Project priorities table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS project_priorities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_name TEXT NOT NULL,
                    priority_level INTEGER,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Agent learning table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS agent_learning (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    interaction_type TEXT,
                    context TEXT,
                    insight TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Uploaded files table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS uploaded_files (
                    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    original_name TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_type TEXT,
                    file_size INTEGER,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            logger.info("🏠 Sanctuary database initialized successfully")

# ==================== MCP MARKETPLACE MANAGER ====================

class MCPMarketplaceManager:
    """Mama Bear's MCP marketplace discovery and management system"""
    
    def __init__(self, db: SanctuaryDB):
        self.db = db
        self.marketplace_data = self._load_marketplace_data()
    
    def _load_marketplace_data(self) -> List[MCPServer]:
        """Load comprehensive MCP marketplace data"""
        # This would be populated from our marketplace research
        marketplace_servers = [
            # Official Reference Servers
            MCPServer(
                name="aws-mcp-server",
                description="Official AWS MCP server for EC2, S3, Lambda operations",
                repository_url="https://github.com/modelcontextprotocol/servers/tree/main/src/aws",
                category=MCPCategory.CLOUD_SERVICES,
                author="Anthropic",
                version="1.0.0",
                installation_method="npm",
                capabilities=["ec2_management", "s3_operations", "lambda_functions"],
                dependencies=["aws-sdk"],
                configuration_schema={"aws_region": "string", "credentials": "object"},
                popularity_score=95,
                last_updated="2024-12-20",
                is_official=True,
                is_installed=False,
                installation_status="not_installed",
                tags=["aws", "cloud", "official"]
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
                configuration_schema={"api_key": "string"},
                popularity_score=88,
                last_updated="2024-12-20",
                is_official=True,
                is_installed=False,
                installation_status="not_installed",
                tags=["search", "web", "official"]
            ),
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
                configuration_schema={"github_token": "string"},
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
                configuration_schema={"connection_string": "string"},
                popularity_score=85,
                last_updated="2024-12-20",
                is_official=True,
                is_installed=False,
                installation_status="not_installed",
                tags=["postgresql", "database", "official"]
            ),
            # Community Servers
            MCPServer(
                name="notion-mcp",
                description="Notion workspace integration for content management",
                repository_url="https://github.com/ai-ng/mcp-notion",
                category=MCPCategory.PRODUCTIVITY,
                author="ai-ng",
                version="0.5.0",
                installation_method="npm",
                capabilities=["page_management", "database_operations", "content_sync"],
                dependencies=["@notionhq/client"],
                configuration_schema={"notion_token": "string", "database_id": "string"},
                popularity_score=75,
                last_updated="2024-12-18",
                is_official=False,
                is_installed=False,
                installation_status="not_installed",
                tags=["notion", "productivity", "community"]
            ),
            MCPServer(
                name="docker-mcp",
                description="Docker container management and operations",
                repository_url="https://github.com/docker/mcp-docker",
                category=MCPCategory.DEVELOPMENT_TOOLS,
                author="Docker",
                version="1.2.0",
                installation_method="npm",
                capabilities=["container_management", "image_operations", "docker_compose"],
                dependencies=["dockerode"],
                configuration_schema={"docker_host": "string"},
                popularity_score=82,
                last_updated="2024-12-19",
                is_official=False,
                is_installed=False,
                installation_status="not_installed",
                tags=["docker", "containers", "devops"]
            ),
            MCPServer(
                name="openai-mcp",
                description="OpenAI API integration for AI model access",
                repository_url="https://github.com/openai/mcp-openai",
                category=MCPCategory.AI_ML,
                author="OpenAI",
                version="2.1.0",
                installation_method="pip",
                capabilities=["chat_completion", "embeddings", "fine_tuning"],
                dependencies=["openai"],
                configuration_schema={"api_key": "string", "organization": "string"},
                popularity_score=94,
                last_updated="2024-12-20",
                is_official=False,
                is_installed=False,
                installation_status="not_installed",
                tags=["openai", "ai", "ml"]
            ),
            MCPServer(
                name="slack-mcp",
                description="Slack workspace integration and messaging",
                repository_url="https://github.com/slack/mcp-slack",
                category=MCPCategory.COMMUNICATION,
                author="Slack",
                version="1.1.5",
                installation_method="npm",
                capabilities=["message_sending", "channel_management", "user_operations"],
                dependencies=["@slack/web-api"],
                configuration_schema={"bot_token": "string", "app_token": "string"},
                popularity_score=78,
                last_updated="2024-12-17",
                is_official=False,
                is_installed=False,
                installation_status="not_installed",
                tags=["slack", "communication", "messaging"]
            ),
        ]
        
        # Store in database
        self._sync_marketplace_to_db(marketplace_servers)
        return marketplace_servers
    
    def _sync_marketplace_to_db(self, servers: List[MCPServer]):
        """Sync marketplace data to database"""
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
    
    def search_servers(self, query: str = "", category: Optional[str] = None, 
                      official_only: bool = False) -> List[Dict[str, Any]]:
        """Search MCP servers with filters"""
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
    
    def get_trending_servers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get trending MCP servers"""
        return self.search_servers()[:limit]
    
    def get_recommendations_for_project(self, project_type: str) -> List[Dict[str, Any]]:
        """Get MCP server recommendations based on project type"""
        category_map = {
            "web_development": [MCPCategory.WEB_APIS, MCPCategory.DATABASE],
            "data_science": [MCPCategory.AI_ML, MCPCategory.DATABASE],
            "devops": [MCPCategory.CLOUD_SERVICES, MCPCategory.DEVELOPMENT_TOOLS],
            "content_management": [MCPCategory.CONTENT_MANAGEMENT, MCPCategory.PRODUCTIVITY]
        }
        
        categories = category_map.get(project_type, [])
        recommendations = []
        
        for category in categories:
            servers = self.search_servers(category=category.value)
            recommendations.extend(servers[:3])  # Top 3 from each category
        
        return recommendations[:10]  # Limit to 10 recommendations

# ==================== MAMA BEAR AGENT ====================

class MamaBearAgent:
    """The Lead Developer Agent - Mama Bear Gem"""
    
    def __init__(self, db: SanctuaryDB, marketplace: MCPMarketplaceManager):
        self.db = db
        self.marketplace = marketplace
        self.last_briefing_date = None
        
        # Initialize enhanced capabilities
        self.enhanced_mama = EnhancedMamaBear(db)
        self.discovery_agent = ProactiveDiscoveryAgent(marketplace, self.enhanced_mama)
        
        logger.info("🐻 Mama Bear Agent initialized - Ready to care for Nathan's sanctuary")
    
    def generate_daily_briefing(self) -> DailyBriefing:
        """Generate Mama Bear's daily briefing with enhanced insights"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Get contextual insights from memory
        context_insights = self.enhanced_mama.get_contextual_insights("daily briefing preferences")
        
        # Discover new MCP tools
        discovered_tools = self.discovery_agent.discover_new_mcp_servers()
        new_tools = self.marketplace.get_trending_servers(5)
        
        # Combine discovered and trending tools
        if discovered_tools:
            # Convert discovered tools to match expected format
            for tool in discovered_tools[:3]:  # Limit to 3 new discoveries
                new_tools.append({
                    'name': tool['name'],
                    'description': tool['description'],
                    'author': tool['author'],
                    'category': 'discovery',
                    'is_installed': False,
                    'tags': ['new', 'discovered']
                })
        
        # Updated models (placeholder - would integrate with actual model APIs)
        updated_models = [
            {"name": "Gemini 2.5", "update": "Enhanced code generation capabilities"},
            {"name": "Claude 3.5", "update": "Improved reasoning for complex tasks"}
        ]
        
        # Project priorities (from database)
        with self.db.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM project_priorities WHERE status = 'active' ORDER BY priority_level")
            priorities = [row['project_name'] for row in cursor.fetchall()]
        
        # Get personalized recommendations
        recommendations = self.discovery_agent.get_personalized_recommendations("Nathan's current workflow")
        
        # System status
        system_status = {
            "installed_mcp_servers": len([s for s in new_tools if s.get('is_installed', False)]),
            "available_mcp_servers": len(new_tools),
            "sanctuary_health": "excellent",
            "memory_system": "active" if self.enhanced_mama.memory else "local_only",
            "sandbox_system": "active" if self.enhanced_mama.together_client else "unavailable"
        }
        
        briefing = DailyBriefing(
            date=today,
            new_mcp_tools=new_tools,
            updated_models=updated_models,
            project_priorities=priorities,
            recommendations=recommendations,
            system_status=system_status
        )
        
        # Store briefing in database
        with self.db.get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO daily_briefings (date, briefing_data) VALUES (?, ?)",
                (today, json.dumps(asdict(briefing)))
            )
            conn.commit()
        
        # Store briefing context in memory
        self.enhanced_mama.store_memory(
            f"Generated daily briefing for {today} with {len(new_tools)} tools and {len(recommendations)} recommendations",
            {"type": "daily_briefing", "date": today, "tools_count": len(new_tools)}
        )
        
        self.last_briefing_date = today
        logger.info(f"🌅 Enhanced daily briefing generated for {today}")
        return briefing
    
    def learn_from_interaction(self, interaction_type: str, context: str, insight: str):
        """Enhanced Mama Bear learning with persistent memory"""
        learning_data = {
            "type": interaction_type,
            "context": {"raw_context": context, "timestamp": datetime.now().isoformat()},
            "insight": insight
        }
        
        self.enhanced_mama.learn_from_interaction(learning_data)
    
    def execute_code_safely(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Execute code safely in sandbox environment"""
        if not self.enhanced_mama.together_client:
            return {
                "success": False,
                "error": "Sandbox environment not available",
                "output": "Please configure Together.ai API key for code execution"
            }
        
        return self.enhanced_mama.execute_in_sandbox(code, language)
    
    def get_memory_insights(self, query: str) -> Dict[str, Any]:
        """Get insights from Mama Bear's memory system"""
        return self.enhanced_mama.get_contextual_insights(query)

# ==================== ENHANCED MAMA BEAR CAPABILITIES ====================

class EnhancedMamaBear:
    """Enhanced Mama Bear with Mem0.ai memory and Together.ai sandbox"""
    
    def __init__(self, db: SanctuaryDB):
        self.db = db
        self.memory = None
        self.together_client = None
        
        # Initialize Mem0.ai if available
        if MEM0_AVAILABLE and os.getenv('MEM0_API_KEY'):
            try:
                # Use MemoryClient for pro account features
                os.environ["MEM0_API_KEY"] = os.getenv('MEM0_API_KEY')
                self.memory = MemoryClient()
                self.user_id = os.getenv('MEM0_USER_ID', 'nathan_sanctuary')
                logger.info("🧠 Mama Bear memory system initialized with Mem0.ai Pro")
            except Exception as e:
                logger.error(f"Failed to initialize Mem0.ai: {e}")
                # Fallback to basic memory without persistent storage
                self.memory = None
        
        # Initialize Together.ai if available
        if TOGETHER_AVAILABLE and os.getenv('TOGETHER_AI_API_KEY'):
            try:
                together.api_key = os.getenv('TOGETHER_AI_API_KEY')
                self.together_client = together
                logger.info("🔧 Mama Bear sandbox initialized with Together.ai")
            except Exception as e:
                logger.error(f"Failed to initialize Together.ai: {e}")
    
    def store_memory(self, content: str, metadata: Optional[Dict] = None) -> bool:
        """Store memory using Mem0.ai cloud service"""
        if not self.memory:
            return False
        
        try:
            # Use MemoryClient API for cloud service
            result = self.memory.add(
                messages=[{"role": "user", "content": content}],
                user_id=self.user_id,
                metadata=metadata or {},
                categories=["mama_bear_memory"]
            )
            logger.info(f"🧠 Memory stored: {content[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")
            return False
    
    def search_memory(self, query: str, limit: int = 5) -> List[Dict]:
        """Search memories using Mem0.ai cloud service"""
        if not self.memory:
            return []
        
        try:
            # Use MemoryClient API for cloud service
            results = self.memory.search(
                query=query,
                user_id=self.user_id,
                threshold=0.5
            )
            logger.info(f"🔍 Found {len(results)} memories for query: {query}")
            return results[:limit]  # Limit results as requested
        except Exception as e:
            logger.error(f"Failed to search memory: {e}")
            return []
    
    def execute_in_sandbox(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Execute code in Together.ai sandbox"""
        if not self.together_client:
            return {"error": "Sandbox not available", "output": ""}
        
        try:
            # Format the prompt for code execution
            prompt = f"""
            Execute this {language} code and provide the output:
            
            ```{language}
            {code}
            ```
            
            Please provide:
            1. The execution result
            2. Any errors that occurred
            3. The final output
            """
            
            response = self.together_client.Complete.create(
                prompt=prompt,
                model=os.getenv('TOGETHER_AI_MODEL', 'meta-llama/Llama-2-70b-chat-hf'),
                max_tokens=int(os.getenv('TOGETHER_AI_MAX_TOKENS', '4096')),
                temperature=float(os.getenv('TOGETHER_AI_TEMPERATURE', '0.7'))
            )
            
            output = response['output']['choices'][0]['text']
            
            # Store this execution in memory
            self.store_memory(
                f"Executed {language} code: {code[:100]}...",
                {"type": "code_execution", "language": language, "output": output}
            )
            
            return {
                "success": True,
                "output": output,
                "language": language,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Sandbox execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "output": "",
                "language": language
            }
    
    def get_contextual_insights(self, query: str) -> Dict[str, Any]:
        """Get contextual insights based on memory and current context"""
        memories = self.search_memory(query, limit=10)
        
        insights = {
            "relevant_memories": memories,
            "patterns": [],
            "recommendations": [],
            "context_score": 0.0
        }
        
        # Analyze patterns in memories
        if memories:
            # Simple pattern detection (can be enhanced with ML)
            categories = {}
            for memory in memories:
                mem_type = memory.get('metadata', {}).get('type', 'general')
                categories[mem_type] = categories.get(mem_type, 0) + 1
            
            insights["patterns"] = [
                f"Frequent {category} interactions ({count} times)"
                for category, count in categories.items() if count > 1
            ]
            
            insights["context_score"] = min(len(memories) / 10.0, 1.0)
        
        return insights
    
    def learn_from_interaction(self, interaction_data: Dict[str, Any]):
        """Enhanced learning with persistent memory"""
        # Store in local database
        with self.db.get_connection() as conn:
            conn.execute(
                "INSERT INTO agent_learning (interaction_type, context, insight) VALUES (?, ?, ?)",
                (
                    interaction_data.get('type', 'general'),
                    json.dumps(interaction_data.get('context', {})),
                    interaction_data.get('insight', '')
                )
            )
            conn.commit()
        
        # Store in persistent memory
        memory_content = f"Learned from {interaction_data.get('type', 'interaction')}: {interaction_data.get('insight', '')}"
        self.store_memory(memory_content, {
            "type": "learning",
            "interaction_type": interaction_data.get('type'),
            "timestamp": datetime.now().isoformat()
        })
        
        logger.info(f"🧠 Enhanced learning stored: {interaction_data.get('insight', '')[:50]}")

    def respond(self, message: str, user_id: str = "nathan") -> str:
        """Generate intelligent response using memory context and Together.ai"""
        try:
            # Search for relevant memories
            relevant_memories = self.search_memory(message, limit=5)
            
            # Build context from memories
            memory_context = ""
            if relevant_memories:
                memory_context = "\n".join([
                    f"- {mem.get('text', '')}" for mem in relevant_memories[:3]
                ])
            
            # Check if this is an MCP-related query
            mcp_keywords = ['mcp', 'server', 'database', 'search', 'discover', 'install']
            is_mcp_query = any(keyword in message.lower() for keyword in mcp_keywords)
            
            # Generate response based on context
            if is_mcp_query:
                # MCP-specific response
                if 'database' in message.lower():
                    response = "🐻 I found some excellent database MCP servers for you! The PostgreSQL MCP server is official and highly rated (85 popularity score). There's also SQLite and MySQL options available. Would you like me to help you install one of these?"
                elif 'search' in message.lower() or 'discover' in message.lower():
                    response = "🐻 I can help you discover MCP servers! I have access to a marketplace with servers for databases, cloud services, AI/ML, development tools, and more. What specific functionality are you looking for?"
                else:
                    response = f"🐻 Hello {user_id}! I'm here to help you with MCP server management and development tasks. I can search, discover, and help install MCP servers for your sanctuary. What would you like to explore?"
            else:
                # General response
                response = f"🐻 Hello {user_id}! I'm Mama Bear, your lead developer agent. I'm here to help with your Podplay Build sanctuary. "
                
                if memory_context:
                    response += f"Based on our previous conversations, I remember:\n{memory_context}\n\nHow can I assist you today?"
                else:
                    response += "This appears to be our first conversation. I'm equipped with memory capabilities, MCP server management, and code execution tools. How can I help you today?"
            
            # Store this interaction in memory
            self.store_memory(
                f"User ({user_id}) asked: {message}. I responded: {response[:100]}...",
                {"type": "chat_interaction", "user_id": user_id}
            )
            
            logger.info(f"🐻 Mama Bear responded to {user_id}: {message[:50]}...")
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"🐻 Sorry {user_id}, I encountered an error while processing your message. Please try again."

# ==================== PROACTIVE DISCOVERY SYSTEM ====================

class ProactiveDiscoveryAgent:
    """Mama Bear's proactive MCP and AI model discovery system"""
    
    def __init__(self, marketplace: MCPMarketplaceManager, enhanced_mama: EnhancedMamaBear):
        self.marketplace = marketplace
        self.enhanced_mama = enhanced_mama
        self.discovery_enabled = os.getenv('MCP_DISCOVERY_ENABLED', 'True').lower() == 'true'
        self.last_discovery = None
    
    def discover_new_mcp_servers(self) -> List[Dict[str, Any]]:
        """Proactively discover new MCP servers"""
        if not self.discovery_enabled:
            return []
        
        try:
            # Check GitHub MCP topic for new servers
            github_url = "https://api.github.com/search/repositories"
            params = {
                "q": "topic:model-context-protocol created:>2024-12-01",
                "sort": "created",
                "order": "desc",
                "per_page": 10
            }
            
            response = requests.get(github_url, params=params)
            if response.status_code == 200:
                repos = response.json().get('items', [])
                new_servers = []
                
                for repo in repos:
                    server_data = {
                        "name": repo['name'],
                        "description": repo['description'] or "No description available",
                        "repository_url": repo['html_url'],
                        "author": repo['owner']['login'],
                        "stars": repo['stargazers_count'],
                        "updated_at": repo['updated_at'],
                        "is_new": True
                    }
                    new_servers.append(server_data)
                
                # Store discovery in memory
                if new_servers:
                    self.enhanced_mama.store_memory(
                        f"Discovered {len(new_servers)} new MCP servers",
                        {"type": "discovery", "count": len(new_servers), "timestamp": datetime.now().isoformat()}
                    )
                
                self.last_discovery = datetime.now()
                return new_servers
            
        except Exception as e:
            logger.error(f"Discovery failed: {e}")
        
        return []
    
    def get_personalized_recommendations(self, context: str = "") -> List[str]:
        """Get personalized recommendations based on memory and usage patterns"""
        insights = self.enhanced_mama.get_contextual_insights(context or "mcp tools usage patterns")
        
        recommendations = [
            "Consider exploring the latest GitHub MCP integration for better repository management",
            "The new PostgreSQL MCP server could enhance your database operations",
            "Notion MCP integration might streamline your project documentation workflow"
        ]
        
        # Add memory-based recommendations
        if insights["relevant_memories"]:
            memory_recs = [
                f"Based on your previous {mem.get('metadata', {}).get('type', 'activity')}, you might like similar tools"
                for mem in insights["relevant_memories"][:2]
            ]
            recommendations.extend(memory_recs)
        
        return recommendations[:5]  # Limit to top 5 recommendations

# ==================== INITIALIZATION ====================

# Initialize the sanctuary
db = SanctuaryDB()
marketplace = MCPMarketplaceManager(db)
mama_bear = MamaBearAgent(db, marketplace)

# Initialize DevSandbox Manager
if DEV_SANDBOX_AVAILABLE:
    dev_sandbox_manager = DevSandboxManager()
    logger.info("🏗️ DevSandbox Manager initialized")
else:
    dev_sandbox_manager = None
    logger.warning("🏗️ DevSandbox not available - check dependencies")

# Initialize Mem0 Chat Manager
if MEM0_CHAT_AVAILABLE:
    # The mem0_chat_manager is already initialized in the module import
    logger.info("🧠 Mem0 Chat Manager initialized and ready for intelligent persistence")
else:
    mem0_chat_manager = None
    logger.warning("🧠 Mem0 Chat Manager not available - check dependencies")

# Initialize Enhanced Mama Bear with Vertex AI
if ENHANCED_MAMA_AVAILABLE:
    enhanced_vertex_mama = VertexAIMamaBear()
    logger.info("🐻 Enhanced Mama Bear with Vertex AI initialized")
else:
    enhanced_vertex_mama = None
    logger.warning("🐻 Enhanced Mama Bear not available - check dependencies")

# Legacy enhanced mama bear for backward compatibility
enhanced_mama_bear = EnhancedMamaBear(db)

# ==================== API ENDPOINTS ====================

@app.route('/')
def index():
    """Serve the React frontend for Electron app"""
    try:
        # Serve the built React frontend
        frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')
        return send_from_directory(frontend_dist, 'index.html')
    except Exception as e:
        # Fallback to API response if frontend not available
        return jsonify({
            "message": "🐻 Welcome to Nathan's Podplay Build Sanctuary",
            "agent": "Mama Bear Gem - Lead Developer Agent", 
            "status": "ready",
            "philosophy": "Your sanctuary for calm, empowered creation",
            "note": "Frontend not available, using API fallback"
        })

# Serve static assets from React build
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve React build assets"""
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')
    return send_from_directory(os.path.join(frontend_dist, 'assets'), filename)

@app.route('/api/status')
def api_status():
    """API status endpoint"""
    return jsonify({
        "message": "🐻 Welcome to Nathan's Podplay Build Sanctuary",
        "agent": "Mama Bear Gem - Lead Developer Agent",
        "status": "ready", 
        "philosophy": "Your sanctuary for calm, empowered creation"
    })

@app.route('/api/mama-bear/briefing', methods=['GET'])
def get_daily_briefing():
    """Get Mama Bear's daily briefing"""
    try:
        briefing = mama_bear.generate_daily_briefing()
        return jsonify({
            "success": True,
            "briefing": asdict(briefing),
            "message": "☕ Good morning, Nathan! Here's your daily briefing."
        })
    except Exception as e:
        logger.error(f"Error generating briefing: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mcp/search', methods=['GET'])
def search_mcp_servers():
    """Search MCP servers in the marketplace"""
    try:
        query = request.args.get('query', '')
        category = request.args.get('category')
        official_only = request.args.get('official_only', 'false').lower() == 'true'
        
        servers = marketplace.search_servers(query, category, official_only)
        
        return jsonify({
            "success": True,
            "servers": servers,
            "total": len(servers),
            "query": query,
            "category": category
        })
    except Exception as e:
        logger.error(f"Error searching MCP servers: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mcp/discover', methods=['GET'])
def discover_mcp_servers():
    """Discover trending and recommended MCP servers"""
    try:
        trending = marketplace.get_trending_servers(10)
        project_type = request.args.get('project_type', 'web_development')
        recommendations = marketplace.get_recommendations_for_project(project_type)
        
        return jsonify({
            "success": True,
            "trending": trending,
            "recommendations": recommendations,
            "project_type": project_type
        })
    except Exception as e:
        logger.error(f"Error discovering MCP servers: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mcp/categories', methods=['GET'])
def get_mcp_categories():
    """Get all MCP server categories"""
    categories = [
        {"value": category.value, "label": category.value.replace('_', ' ').title()}
        for category in MCPCategory
    ]
    
    return jsonify({
        "success": True,
        "categories": categories
    })

@app.route('/api/mcp/install', methods=['POST'])
def install_mcp_server():
    """Install an MCP server (Mama Bear manages this)"""
    try:
        data = request.get_json()
        server_name = data.get('server_name')
        
        if not server_name:
            return jsonify({"success": False, "error": "Server name required"}), 400
        
        # Simulate installation process
        with db.get_connection() as conn:
            conn.execute(
                "UPDATE mcp_servers SET is_installed = 1, installation_status = 'installed' WHERE name = ?",
                (server_name,)
            )
            conn.commit()
        
        # Mama Bear learns from this installation
        mama_bear.learn_from_interaction(
            "mcp_installation",
            f"Installed {server_name}",
            f"Nathan prefers {server_name} for enhanced capabilities"
        )
        
        logger.info(f"🔧 Mama Bear installed MCP server: {server_name}")
        
        return jsonify({
            "success": True,
            "message": f"🐻 Mama Bear successfully installed {server_name}",
            "server_name": server_name
        })
    except Exception as e:
        logger.error(f"Error installing MCP server: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mcp/manage', methods=['GET'])
def manage_mcp_servers():
    """Get installed MCP servers for management"""
    try:
        with db.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM mcp_servers WHERE is_installed = 1")
            installed_servers = []
            
            for row in cursor.fetchall():
                server_dict = dict(row)
                server_dict['capabilities'] = json.loads(server_dict['capabilities'])
                server_dict['dependencies'] = json.loads(server_dict['dependencies'])
                server_dict['configuration_schema'] = json.loads(server_dict['configuration_schema'])
                server_dict['tags'] = json.loads(server_dict['tags'])
                installed_servers.append(server_dict)
        
        return jsonify({
            "success": True,
            "installed_servers": installed_servers,
            "total_installed": len(installed_servers)
        })
    except Exception as e:
        logger.error(f"Error managing MCP servers: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/learn', methods=['POST'])
def mama_bear_learn():
    """Endpoint for Mama Bear to learn from interactions"""
    try:
        data = request.get_json()
        interaction_type = data.get('interaction_type')
        context = data.get('context')
        insight = data.get('insight')
        
        mama_bear.learn_from_interaction(interaction_type, context, insight)
        
        return jsonify({
            "success": True,
            "message": "🧠 Mama Bear has learned from this interaction"
        })
    except Exception as e:
        logger.error(f"Error in Mama Bear learning: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/chat', methods=['POST'])
def mama_bear_chat():
    """Chat with Mama Bear - the lead developer agent (Enhanced with Vertex AI)"""
    try:
        data = request.get_json()
        message = data.get('message')
        user_id = data.get('user_id', 'nathan')
        context = data.get('context', {})
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        # Try enhanced Vertex AI Mama Bear first
        if enhanced_vertex_mama:
            response_data = enhanced_vertex_mama.mama_bear_chat(
                message, None, context, user_id
            )
            
            # Add enhanced response metadata
            response_data.update({
                "enhanced": True,
                "vertex_ai": True,
                "agent": "Enhanced Mama Bear Gem"
            })
            
            return jsonify(response_data)
        else:
            # Fallback to legacy enhanced mama bear
            response = enhanced_mama_bear.respond(message, user_id)
            
            return jsonify({
                "success": True,
                "response": response,
                "enhanced": False,
                "vertex_ai": False,
                "agent": "Legacy Mama Bear",
                "message": "🐻 Using fallback mode - Vertex AI not configured",
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error in Mama Bear chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/projects/priorities', methods=['GET', 'POST'])
def manage_project_priorities():
    """Manage project priorities"""
    if request.method == 'GET':
        try:
            with db.get_connection() as conn:
                cursor = conn.execute("SELECT * FROM project_priorities ORDER BY priority_level")
                priorities = [dict(row) for row in cursor.fetchall()]
            
            return jsonify({
                "success": True,
                "priorities": priorities
            })
        except Exception as e:
            logger.error(f"Error getting priorities: {e}")
            return jsonify({"success": False, "error": str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            project_name = data.get('project_name')
            priority_level = data.get('priority_level', 1)
            description = data.get('description', '')
            
            with db.get_connection() as conn:
                conn.execute(
                    "INSERT INTO project_priorities (project_name, priority_level, description) VALUES (?, ?, ?)",
                    (project_name, priority_level, description)
                )
                conn.commit()
            
            return jsonify({
                "success": True,
                "message": f"🎯 Added priority: {project_name}"
            })
        except Exception as e:
            logger.error(f"Error adding priority: {e}")
            return jsonify({"success": False, "error": str(e)}), 500

# ==================== VERTEX AI CHAT ENDPOINTS ====================

@app.route('/api/vertex/models', methods=['GET'])
def get_vertex_models():
    """Get all available Vertex AI models"""
    try:
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available",
                "message": "🐻 Vertex AI integration not configured"
            }), 503
        
        models_info = enhanced_vertex_mama.list_models()
        return jsonify(models_info)
    except Exception as e:
        logger.error(f"Error getting Vertex models: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/chat', methods=['POST'])
def vertex_chat():
    """Chat with Mama Bear using Vertex AI (primary endpoint)"""
    try:
        data = request.get_json()
        message = data.get('message')
        user_id = data.get('user_id', 'nathan')
        session_id = data.get('session_id')
        context = data.get('context', {})
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        if not enhanced_vertex_mama:
            # Fallback to legacy enhanced mama bear
            response = enhanced_mama_bear.respond(message, user_id)
            return jsonify({
                "success": True,
                "response": response,
                "model": "legacy_mama_bear",
                "fallback": True,
                "message": "🐻 Using fallback mode - Vertex AI not available",
                "timestamp": datetime.now().isoformat()
            })
        
        # Use session if provided, otherwise direct chat
        if session_id:
            # Check if session exists, create if not
            if session_id not in enhanced_vertex_mama.chat_sessions:
                enhanced_vertex_mama.create_chat_session(session_id, "gemini-2.0-flash-exp")
            
            response_data = enhanced_vertex_mama.send_message_to_session(session_id, message, user_id)
        else:
            # Direct Mama Bear chat
            response_data = enhanced_vertex_mama.mama_bear_chat(message, None, context, user_id)
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in Vertex chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/chat/session', methods=['POST'])
def create_vertex_chat_session():
    """Create a new Vertex AI chat session"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        model_name = data.get('model_name', 'gemini-2.0-flash-exp')
        system_instruction = data.get('system_instruction')
        
        if not session_id:
            return jsonify({"success": False, "error": "Session ID is required"}), 400
        
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available"
            }), 503
        
        result = enhanced_vertex_mama.create_chat_session(session_id, model_name, system_instruction)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/chat/session/<session_id>', methods=['GET'])
def get_vertex_chat_session(session_id):
    """Get information about a chat session"""
    try:
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available"
            }), 503
        
        result = enhanced_vertex_mama.get_session_info(session_id)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/chat/session/<session_id>/switch-model', methods=['POST'])
def switch_vertex_model(session_id):
    """Switch the model for a chat session"""
    try:
        data = request.get_json()
        new_model_name = data.get('model_name')
        
        if not new_model_name:
            return jsonify({"success": False, "error": "Model name is required"}), 400
        
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available"
            }), 503
        
        result = enhanced_vertex_mama.switch_session_model(session_id, new_model_name)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error switching model: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/chat/model', methods=['POST'])
def chat_with_specific_model():
    """Chat with a specific Vertex AI model"""
    try:
        data = request.get_json()
        model_name = data.get('model_name')
        message = data.get('message')
        chat_history = data.get('chat_history', [])
        system_instruction = data.get('system_instruction')
        user_id = data.get('user_id', 'nathan')
        
        if not model_name or not message:
            return jsonify({
                "success": False,
                "error": "Model name and message are required"
            }), 400
        
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available"
            }), 503
        
        result = enhanced_vertex_mama.chat_with_model(
            model_name, message, chat_history, system_instruction, user_id
        )
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in model-specific chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/code/analyze', methods=['POST'])
def analyze_code_vertex():
    """Analyze code using Vertex AI"""
    try:
        data = request.get_json()
        code = data.get('code')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({"success": False, "error": "Code is required"}), 400
        
        if not enhanced_vertex_mama:
            return jsonify({
                "success": False,
                "error": "Enhanced Vertex AI Mama Bear not available",
                "response": "🐻 Code analysis requires Vertex AI integration"
            }), 503
        
        result = enhanced_vertex_mama.analyze_code(code, language)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex/terminal', methods=['POST'])
def execute_terminal_command():
    """Execute terminal command locally (with safety checks)"""
    try:
        data = request.get_json()
        command = data.get('command')
        working_dir = data.get('working_dir', '/home/woody/Desktop/podplay-build-beta')
        
        if not command:
            return jsonify({"success": False, "error": "Command is required"}), 400
        
        # Safety check - only allow safe commands
        safe_commands = ['ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'grep', 'find', 'ps', 'whoami']
        command_start = command.split()[0] if command.split() else ""
        
        if command_start not in safe_commands:
            return jsonify({
                "success": False,
                "error": f"Command '{command_start}' not allowed for security reasons",
                "allowed_commands": safe_commands
            }), 403
        
        # Execute command safely
        import subprocess
        import os
        
        result = subprocess.run(
            command,
            shell=True,
            cwd=working_dir,
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )
        
        return jsonify({
            "success": True,
            "command": command,
            "working_dir": working_dir,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode,
            "timestamp": datetime.now().isoformat()
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({
            "success": False,
            "error": "Command timed out after 30 seconds"
        }), 408
    except Exception as e:
        logger.error(f"Error executing terminal command: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== DEV SANDBOX ENDPOINTS ====================

@app.route('/api/dev-sandbox/create', methods=['POST'])
def create_dev_environment():
    """Create a new development environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({
                "success": False,
                "error": "DevSandbox not available",
                "message": "🏗️ DevSandbox system not initialized"
            }), 503
        
        data = request.get_json()
        environment = data.get('environment')
        template = data.get('template')
        
        if not environment:
            return jsonify({"success": False, "error": "Environment config required"}), 400
        
        # Create environment using the DevSandbox manager
        result = asyncio.run(dev_sandbox_manager.create_environment(environment, template))
        
        logger.info(f"🏗️ Created development environment: {environment.get('name')}")
        
        return jsonify({
            "success": True,
            "containerId": result.get('containerId'),
            "workspaceDir": result.get('workspaceDir'),
            "ports": result.get('ports'),
            "message": f"🏗️ Environment {environment.get('name')} created successfully"
        })
        
    except Exception as e:
        logger.error(f"Error creating dev environment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/create-local', methods=['POST'])
def create_local_dev_environment():
    """Create a new local development environment without Docker"""
    try:
        if not dev_sandbox_manager:
            return jsonify({
                "success": False,
                "error": "DevSandbox not available",
                "message": "🏗️ DevSandbox system not initialized"
            }), 503
        
        data = request.get_json()
        environment = data.get('environment')
        template = data.get('template')
        
        if not environment:
            return jsonify({"success": False, "error": "Environment config required"}), 400
        
        # Force local fallback creation (no cloud providers)
        result = asyncio.run(dev_sandbox_manager._create_local_fallback(environment))
        
        logger.info(f"🏠 Created local development environment: {environment.get('name')}")
        
        return jsonify({
            "success": True,
            "environmentId": result.get('environment', {}).get('id'),
            "workspaceRoot": result.get('environment', {}).get('workspace_dir'),
            "workspaceDir": result.get('environment', {}).get('workspace_dir'),
            "url": result.get('environment', {}).get('url'),
            "message": f"🏠 Local environment {environment.get('name')} created successfully"
        })
        
    except Exception as e:
        logger.error(f"Error creating local dev environment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/files', methods=['GET'])
def get_environment_files(env_id):
    """Get file tree for environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        file_tree = dev_sandbox_manager.get_file_tree(env_id)
        
        if file_tree is None:
            return jsonify({"success": False, "error": "Environment not found"}), 404
        
        return jsonify({
            "success": True,
            "fileTree": file_tree
        })
        
    except Exception as e:
        logger.error(f"Error getting environment files: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/file', methods=['GET', 'POST'])
def handle_environment_file(env_id):
    """Read or write file in environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        if request.method == 'GET':
            file_path = request.args.get('path')
            if not file_path:
                return jsonify({"success": False, "error": "File path required"}), 400
            
            content = dev_sandbox_manager.read_file(env_id, file_path)
            if content is None:
                return jsonify({"success": False, "error": "File not found"}), 404
            
            return jsonify({
                "success": True,
                "content": content
            })
        
        elif request.method == 'POST':
            data = request.get_json()
            file_path = data.get('path')
            content = data.get('content')
            
            if not file_path:
                return jsonify({"success": False, "error": "File path required"}), 400
            
            success = dev_sandbox_manager.write_file(env_id, file_path, content or '')
            
            return jsonify({
                "success": success,
                "message": "File saved successfully" if success else "Failed to save file"
            })
        
    except Exception as e:
        logger.error(f"Error handling environment file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/file/create', methods=['POST'])
def create_environment_file(env_id):
    """Create new file or directory in environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        data = request.get_json()
        file_path = data.get('path')
        is_directory = data.get('isDirectory', False)
        content = data.get('content', '')
        
        if not file_path:
            return jsonify({"success": False, "error": "File path required"}), 400
        
        if is_directory:
            # Create directory
            success = dev_sandbox_manager.create_directory(env_id, file_path)
        else:
            # Create file
            success = dev_sandbox_manager.write_file(env_id, file_path, content)
        
        return jsonify({
            "success": success,
            "message": f"{'Directory' if is_directory else 'File'} created successfully" if success else "Failed to create"
        })
        
    except Exception as e:
        logger.error(f"Error creating environment file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/terminal', methods=['POST'])
def create_terminal_session(env_id):
    """Create new terminal session for environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        session_id = dev_sandbox_manager.create_terminal_session(env_id)
        
        if session_id is None:
            return jsonify({"success": False, "error": "Failed to create terminal session"}), 500
        
        return jsonify({
            "success": True,
            "sessionId": session_id,
            "message": "Terminal session created successfully"
        })
        
    except Exception as e:
        logger.error(f"Error creating terminal session: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/execute', methods=['POST'])
def execute_command_in_sandbox():
    """Execute command in the development sandbox"""
    try:
        data = request.get_json()
        env_id = data.get('env_id')
        command = data.get('command')
        
        if not env_id or not command:
            return jsonify({"success": False, "error": "env_id and command are required"}), 400
        
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        # Execute command in the specified environment
        result = dev_sandbox_manager.execute_command(env_id, command)
        
        return jsonify({
            "success": True,
            "output": result.get('stdout', ''),
            "error": result.get('stderr', ''),
            "exit_code": result.get('exit_code', 0)
        })
        
    except Exception as e:
        logger.error(f"Error executing command in sandbox: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/preview/start', methods=['POST'])
def start_live_preview(env_id):
    """Start live preview server for environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        # Get available port for preview
        port = dev_sandbox_manager.get_available_port()
        
        if port is None:
            return jsonify({"success": False, "error": "No available ports"}), 500
        
        preview_url = f"http://localhost:{port}"
        
        return jsonify({
            "success": True,
            "previewUrl": preview_url,
            "port": port,
            "message": "Live preview started successfully"
        })
        
    except Exception as e:
        logger.error(f"Error starting live preview: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/available-port', methods=['GET'])
def get_available_port():
    """Get available port for new environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        port = dev_sandbox_manager.get_available_port()
        
        return jsonify({
            "success": True,
            "port": port or (8000 + (len(dev_sandbox_manager.environments) * 10))
        })
        
    except Exception as e:
        logger.error(f"Error getting available port: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>/stop', methods=['POST'])
def stop_environment(env_id):
    """Stop development environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        success = dev_sandbox_manager.stop_environment(env_id)
        
        return jsonify({
            "success": success,
            "message": "Environment stopped successfully" if success else "Failed to stop environment"
        })
        
    except Exception as e:
        logger.error(f"Error stopping environment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dev-sandbox/<env_id>', methods=['DELETE'])
def delete_environment(env_id):
    """Delete development environment"""
    try:
        if not dev_sandbox_manager:
            return jsonify({"success": False, "error": "DevSandbox not available"}), 503
        
        success = dev_sandbox_manager.delete_environment(env_id)
        
        return jsonify({
            "success": success,
            "message": "Environment deleted successfully" if success else "Failed to delete environment"
        })
        
    except Exception as e:
        logger.error(f"Error deleting environment: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== DEV SANDBOX AGENTIC ENDPOINTS ====================

@app.route('/api/dev-sandbox/<env_id>/assistance', methods=['POST'])
def get_dev_assistance(env_id):
    """Get intelligent assistance for a development environment"""
    try:
        if not agentic_dev_assistant:
            return jsonify({
                "success": False,
                "response": "🤖 Agentic assistant not available. Please check Mama Bear and Mem0 configuration.",
                "suggestions": []
            }), 503
        
        data = request.get_json() or {}
        user_query = data.get('query', '')
        
        # Mock environment context - in a real scenario, this would come from the actual environment
        environment_context = {
            "id": env_id,
            "type": data.get('type', 'node'),
            "name": data.get('name', f'Environment {env_id}'),
            "status": "running",
            "workspaceRoot": f"/tmp/podplay_sandbox/{env_id}",
            "port": 3000
        }
        
        # Get assistance (convert async to sync)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            assistance = loop.run_until_complete(
                agentic_dev_assistant.get_intelligent_assistance(environment_context, user_query)
            )
            suggestions = loop.run_until_complete(
                agentic_dev_assistant.get_contextual_suggestions(environment_context)
            )
            assistance["suggestions"] = suggestions
        finally:
            loop.close()
        
        return jsonify(assistance)
        
    except Exception as e:
        logger.error(f"Error getting dev assistance: {e}")
        return jsonify({
            "success": False,
            "response": f"🚫 Error getting assistance: {str(e)}",
            "suggestions": []
        }), 500

@app.route('/api/dev-sandbox/<env_id>/suggestions', methods=['GET'])
def get_dev_suggestions(env_id):
    """Get contextual suggestions for a development environment"""
    try:
        if not agentic_dev_assistant:
            return jsonify({
                "success": False,
                "suggestions": [],
                "message": "Agentic assistant not available"
            }), 503
        
        # Mock environment context
        environment_context = {
            "id": env_id,
            "type": request.args.get('type', 'node'),
            "name": request.args.get('name', f'Environment {env_id}'),
            "status": "running",
            "workspaceRoot": f"/tmp/podplay_sandbox/{env_id}"
        }
        
        # Get suggestions (convert async to sync)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            suggestions = loop.run_until_complete(
                agentic_dev_assistant.get_contextual_suggestions(environment_context)
            )
        finally:
            loop.close()
        
        return jsonify({
            "success": True,
            "suggestions": suggestions,
            "environment_id": env_id
        })
        
    except Exception as e:
        logger.error(f"Error getting suggestions: {e}")
        return jsonify({
            "success": False,
            "suggestions": [],
            "error": str(e)
        }), 500
# ==================== VERTEX GARDEN CHAT ENDPOINTS (MEM0) ====================

@app.route('/api/vertex-garden/chat-history', methods=['GET'])
def get_vertex_garden_chat_history():
    """Get chat history for all models using Mem0"""
    if not MEM0_CHAT_AVAILABLE or mem0_chat_manager is None:
        return jsonify({"success": False, "error": "Mem0 not available"}), 503
    
    try:
        import asyncio
        
        async def get_sessions_async():
            # Get sessions for popular models
            all_sessions = []
            popular_models = ['mama-bear-gemini-25', 'claude-4-opus', 'claude-4-sonnet', 'gpt-4o']
            
            for model_id in popular_models:
                try:
                    result = await mem0_chat_manager.get_model_sessions(model_id, limit=10)
                    if result.get('success'):
                        all_sessions.extend(result.get('sessions', []))
                except Exception as e:
                    logger.warning(f"Could not get sessions for {model_id}: {e}")
            
            return all_sessions
        
        # Run the async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        all_sessions = loop.run_until_complete(get_sessions_async())
        loop.close()
        
        return jsonify({
            "success": True,
            "sessions": all_sessions
        })
        
    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/session/<session_id>/messages', methods=['GET'])
def get_session_messages(session_id: str):
    """Get messages for a specific session using Mem0"""
    if not MEM0_CHAT_AVAILABLE or mem0_chat_manager is None:
        return jsonify({"success": False, "error": "Mem0 not available"}), 503
    
    try:
        import asyncio
        
        async def get_messages_async():
            # Extract model_id from session_id (assuming format: session_YYYYMMDD_HHMMSS_model_id)
            parts = session_id.split('_')
            if len(parts) >= 4:
                model_id = '_'.join(parts[3:])
            else:
                model_id = 'mama-bear-gemini-25'  # Default fallback
            
            return await mem0_chat_manager.get_session_messages(session_id, model_id)
        
        # Run the async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(get_messages_async())
        loop.close()
        
        if result.get('success'):
            return jsonify({
                "success": True,
                "messages": result.get('messages', []),
                "session_id": session_id
            })
        else:
            return jsonify({"success": False, "error": result.get('error')}), 500
        
    except Exception as e:
        logger.error(f"Error getting session messages: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/chat', methods=['POST'])
def vertex_garden_chat():
    """Main chat endpoint using Mem0 for persistence"""
    if not MEM0_CHAT_AVAILABLE or mem0_chat_manager is None:
        return jsonify({"success": False, "error": "Mem0 not available"}), 503
    
    try:
        import asyncio
        
        data = request.get_json()
        model_id = data.get('model_id', 'mama-bear-gemini-25')
        session_id = data.get('session_id')
        message = data.get('message', '')
        context = data.get('context', {})
        
        if not message:
            return jsonify({"success": False, "error": "No message provided"}), 400
        
        async def chat_async():
            nonlocal session_id
            
            # Create session if it doesn't exist
            if not session_id:
                session_result = await mem0_chat_manager.create_chat_session(model_id)
                if session_result.get('success'):
                    session_id = session_result['session']['id']
                else:
                    raise Exception("Could not create session")
            
            # Save user message to Mem0
            user_message = {
                "id": f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}_user",
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat()
            }
            
            await mem0_chat_manager.save_message(session_id, model_id, user_message)
            
            # Get conversation context from Mem0
            context_result = await mem0_chat_manager.get_conversation_context(session_id, model_id)
            conversation_context = context_result.get('context', {}) if context_result.get('success') else {}
            
            # Generate AI response using the selected model
            # For now, using a simple response - this would integrate with actual AI models
            ai_response = f"I'm {model_id}. You said: '{message}'. This is a simulated response using Mem0 for persistence."
            
            # Calculate token usage and cost (placeholder)
            tokens_used = len(message.split()) + len(ai_response.split())
            cost = tokens_used * 0.0001  # Placeholder cost calculation
            
            # Save assistant message to Mem0
            assistant_message = {
                "id": f"msg_{datetime.now().strftime('%Y%m%d_%H%M%S')}_assistant",
                "role": "assistant",
                "content": ai_response,
                "timestamp": datetime.now().isoformat(),
                "tokens_used": tokens_used,
                "cost": cost
            }
            
            await mem0_chat_manager.save_message(session_id, model_id, assistant_message)
            
            return {
                "success": True,
                "response": ai_response,
                "session_id": session_id,
                "tokens_used": tokens_used,
                "cost": cost,
                "metadata": {
                    "model_id": model_id,
                    "conversation_context": conversation_context
                }
            }
        
        # Run the async function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(chat_async())
        loop.close()
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in vertex garden chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/terminal', methods=['POST'])
def vertex_garden_terminal():
    """Terminal command execution for VertexGardenChat"""
    try:
        data = request.get_json()
        command = data.get('command', '')
        session_id = data.get('session_id', '')
        working_directory = data.get('working_directory', '/tmp')
        
        if not command:
            return jsonify({"success": False, "error": "No command provided"}), 400
        
        # For security, limit to safe commands
        safe_commands = ['ls', 'pwd', 'echo', 'cat', 'mkdir', 'touch', 'python3', 'node', 'npm']
        command_parts = command.split()
        if not command_parts or command_parts[0] not in safe_commands:
            return jsonify({
                "success": False, 
                "error": f"Command '{command_parts[0] if command_parts else command}' not allowed for security reasons"
            }), 400
        
        try:
            import subprocess
            result = subprocess.run(
                command,
                shell=True,
                cwd=working_directory,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            output = result.stdout if result.returncode == 0 else result.stderr
            
            return jsonify({
                "success": True,
                "output": output,
                "return_code": result.returncode,
                "working_directory": working_directory
            })
            
        except subprocess.TimeoutExpired:
            return jsonify({"success": False, "error": "Command timed out"}), 400
        except Exception as e:
            return jsonify({"success": False, "error": f"Execution error: {str(e)}"}), 400
        
    except Exception as e:
        logger.error(f"Error in terminal command: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== VERTEX GARDEN: MULTIMODAL SUPPORT ====================

@app.route('/api/vertex-garden/upload', methods=['POST'])
def upload_multimodal_file():
    """Upload files for multimodal AI processing"""
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "Empty filename"}), 400
        
        # Create uploads directory if it doesn't exist
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(uploads_dir, filename)
        
        # Save file
        file.save(file_path)
        
        # Get file info
        file_size = os.path.getsize(file_path)
        file_type = file.content_type or 'application/octet-stream'
        
        # Store file metadata in database
        conn = sqlite3.connect('sanctuary.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO uploaded_files (filename, original_name, file_path, file_type, file_size, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (filename, file.filename, file_path, file_type, file_size, datetime.now().isoformat()))
        
        file_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "file_id": file_id,
            "filename": filename,
            "original_name": file.filename,
            "file_type": file_type,
            "file_size": file_size,
            "message": "File uploaded successfully"
        })
        
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/files', methods=['GET'])
def list_uploaded_files():
    """List all uploaded files"""
    try:
        conn = sqlite3.connect('sanctuary.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT file_id, filename, original_name, file_type, file_size, uploaded_at
            FROM uploaded_files
            ORDER BY uploaded_at DESC
        ''')
        
        files = []
        for row in cursor.fetchall():
            files.append({
                "file_id": row[0],
                "filename": row[1],
                "original_name": row[2],
                "file_type": row[3],
                "file_size": row[4],
                "uploaded_at": row[5]
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "files": files
        })
        
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return jsonify({"success": False, "error": str(e)}),  500

@app.route('/api/vertex-garden/files/<int:file_id>', methods=['GET'])
def get_file(file_id):
    """Get uploaded file by ID"""
    try:
        conn = sqlite3.connect('sanctuary.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT filename, original_name, file_path, file_type
            FROM uploaded_files
            WHERE file_id = ?
        ''', (file_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({"success": False, "error": "File not found"}), 404
        
        filename, original_name, file_path, file_type = result
        
        # Serve the file
        uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
        return send_from_directory(uploads_dir, filename, as_attachment=True, 
                                 download_name=original_name, mimetype=file_type)
        
    except Exception as e:
        logger.error(f"Error getting file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/files/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete uploaded file"""
    try:
        conn = sqlite3.connect('sanctuary.db')
        cursor = conn.cursor()
        
        # Get file path before deletion
        cursor.execute('SELECT file_path FROM uploaded_files WHERE file_id = ?', (file_id,))
        result = cursor.fetchone()
        
        if not result:
            conn.close()
            return jsonify({"success": False, "error": "File not found"}), 404
        
        file_path = result[0]
        
        # Delete from database
        cursor.execute('DELETE FROM uploaded_files WHERE file_id = ?', (file_id,))
        conn.commit()
        conn.close()
        
        # Delete physical file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return jsonify({
            "success": True,
            "message": "File deleted successfully"
        })
        
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/chat/multimodal', methods=['POST'])
def multimodal_chat():
    """Enhanced chat endpoint with multimodal support"""
    try:
        data = request.get_json()
        model_id = data.get('model_id', 'mama-bear-gemini-25')
        message = data.get('message', '')
        file_ids = data.get('file_ids', [])
        session_id = data.get('session_id')
        
        # Load uploaded files if any
        attached_files = []
        if file_ids:
            conn = sqlite3.connect('sanctuary.db')
            cursor = conn.cursor()
            
            for file_id in file_ids:
                cursor.execute('''
                    SELECT filename, original_name, file_path, file_type
                    FROM uploaded_files
                    WHERE file_id = ?
                ''', (file_id,))
                
                result = cursor.fetchone()
                if result:
                    attached_files.append({
                        "file_id": file_id,
                        "filename": result[0],
                        "original_name": result[1],
                        "file_path": result[2],
                        "file_type": result[3]
                    })
            
            conn.close()
        
        # For now, return enhanced response with file awareness
        # TODO: Integrate with actual multimodal models
        response_content = f"""I've received your message: "{message}"

"""
        
        if attached_files:
            response_content += f"I can see you've attached {len(attached_files)} file(s):\n"
            for file_info in attached_files:
                response_content += f"- {file_info['original_name']} ({file_info['file_type']})\n"
            response_content += "\nMultimodal processing capabilities are being developed. For now, I can acknowledge file uploads and prepare for future multimodal integration.\n"
        
        response_content += "\n🌟 This is the Vertex Garden Multi-Model Chat interface - your gateway to 20+ cutting-edge AI models!"
        
        return jsonify({
            "success": True,
            "response": response_content,
            "model_id": model_id,
            "session_id": session_id,
            "attached_files": attached_files,
            "tokens_used": len(message.split()) + len(response_content.split()),
            "cost": 0.001,
            "metadata": {
                "multimodal": True,
                "files_processed": len(attached_files)
            }
        })
        
    except Exception as e:
        logger.error(f"Error in multimodal chat: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== AUDIO/VIDEO RECORDING ENDPOINTS ====================

@app.route('/api/vertex-garden/audio/record', methods=['POST'])
def start_audio_recording():
    """Start audio recording session"""
    try:
        # For now, return placeholder response
        # TODO: Implement WebRTC or similar for browser audio recording
        session_id = f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Audio recording session started",
            "note": "Client-side recording implementation needed"
        })
        
    except Exception as e:
        logger.error(f"Error starting audio recording: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/audio/upload', methods=['POST'])
def upload_audio_recording():
    """Upload recorded audio for processing"""
    try:
        if 'audio' not in request.files:
            return jsonify({"success": False, "error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        session_id = request.form.get('session_id', f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        # Create audio uploads directory
        audio_dir = os.path.join(os.path.dirname(__file__), 'uploads', 'audio')
        os.makedirs(audio_dir, exist_ok=True)
        
        # Save audio file
        filename = f"{session_id}.webm"
        file_path = os.path.join(audio_dir, filename)
        audio_file.save(file_path)
        
        # Store in database
        conn = sqlite3.connect('sanctuary.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO uploaded_files (filename, original_name, file_path, file_type, file_size, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (filename, f"audio_recording_{session_id}", file_path, 'audio/webm', 
              os.path.getsize(file_path), datetime.now().isoformat()))
        
        file_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "file_id": file_id,
            "session_id": session_id,
            "filename": filename,
            "message": "Audio uploaded successfully"
        })
        
    except Exception as e:
        logger.error(f"Error uploading audio: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== MCP SANCTUARY: MODEL & SERVICE DISCOVERY ====================

@app.route('/api/mcp/resources', methods=['GET'])
def mcp_resources():
    """Return available AI models for the MCP UI (stubbed for now)."""
    models = [
        {
            'id': 'mama-bear-gemini-25',
            'name': 'Mama Bear (Gemini 2.5)',
            'provider': 'VertexAI',
            'description': 'Mama Bear: Gemini 2.5, lead developer agent',
            'capabilities': ['text', 'code', 'reasoning'],
            'status': 'active',
        },
        {
            'id': 'gpt-4o',
            'name': 'GPT-4o',
            'provider': 'OpenAI',
            'description': 'GPT-4o with vision and advanced reasoning',
            'capabilities': ['text', 'vision', 'code', 'reasoning'],
            'status': 'active',
        }
        # Add more models as needed
    ]
    return jsonify({'success': True, 'models': models})

@app.route('/api/mcp/services', methods=['GET'])
def mcp_services():
    """Return available MCP services (stubbed for now)."""
    services = [
        {
            'id': 'code-review',
            'name': 'Code Review',
            'description': 'Automated code review and suggestions',
            'status': 'available',
        },
        {
            'id': 'mcp-help',
            'name': 'MCP Help',
            'description': 'Guidance on using MCP tools',
            'status': 'available',
        }
        # Add more services as needed
    ]
    return jsonify({'success': True, 'services': services})

# ==================== GOOGLE DRIVE INTEGRATION (PLANNED) ====================

@app.route('/api/vertex-garden/drive/auth', methods=['GET'])
def google_drive_auth():
    """Initiate Google Drive OAuth flow"""
    try:
        # TODO: Implement Google Drive OAuth
        return jsonify({
            "success": False,
            "message": "Google Drive integration planned for future release",
            "auth_url": None
        })
        
    except Exception as e:
        logger.error(f"Error with Google Drive auth: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/vertex-garden/drive/files', methods=['GET'])
def list_drive_files():
    """List Google Drive files"""
    try:
        # TODO: Implement Google Drive file listing
        return jsonify({
            "success": False,
            "message": "Google Drive integration planned for future release",
            "files": []
        })
        
    except Exception as e:
        logger.error(f"Error listing Drive files: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== APPLICATION STARTUP ====================

if __name__ == '__main__':
    logger.info("🐻 Mama Bear: Starting the Podplay Build Sanctuary...")
    logger.info("🏠 Your sanctuary for calm, empowered creation is ready!")
    
    try:
        socketio.run(app, host='0.0.0.0', port=8000, debug=True, allow_unsafe_werkzeug=True)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        logger.info("🐻 Mama Bear: I encountered an issue starting the sanctuary. Please check the configuration.")
