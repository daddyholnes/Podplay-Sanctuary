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
import together
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

# NixOS Provider Detection Integration
try:
    from nixos_provider_detector import DevSandboxProviderDetector
    NIXOS_PROVIDER_DETECTOR_AVAILABLE = True
except ImportError:
    NIXOS_PROVIDER_DETECTOR_AVAILABLE = False
    DevSandboxProviderDetector = None

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

# NixOS VM Infrastructure Imports (after logger is available)
try:
    from nixos_sandbox_orchestrator import NixOSSandboxOrchestrator, Job as EphemeralJob
    from vm_manager import LibvirtManager, VMManagerError
    from scout_logger import ScoutLogManager
    from ssh_bridge import VMSSHBridge, SSHBridgeError
    NIXOS_INFRASTRUCTURE_AVAILABLE = True
except ImportError as e:
    NIXOS_INFRASTRUCTURE_AVAILABLE = False
    logger.warning(f"NixOS infrastructure not available: {e}")

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
            # Docker MCP server removed (deprecated)
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
        trending_servers_data = self.marketplace.get_trending_servers(5)
        
        # Convert to proper MCPServer objects
        new_tools: List[MCPServer] = []
        
        # Add discovered tools
        if discovered_tools:
            for tool in discovered_tools[:3]:  # Limit to 3 new discoveries
                mcp_tool = MCPServer(
                    name=tool['name'],
                    description=tool['description'],
                    author=tool['author'],
                    repository_url=tool.get('repository_url', ''),
                    category=MCPCategory.DEVELOPMENT_TOOLS,  # Use valid enum value
                    version=tool.get('version', '1.0.0'),
                    installation_method=tool.get('installation_method', 'npm'),
                    capabilities=tool.get('capabilities', []),
                    dependencies=tool.get('dependencies', []),
                    configuration_schema=tool.get('configuration_schema', {}),
                    popularity_score=tool.get('popularity_score', 0),
                    last_updated=tool.get('last_updated', today),
                    is_official=tool.get('is_official', False),
                    is_installed=False,
                    installation_status='not_installed',
                    tags=['new', 'discovered']
                )
                new_tools.append(mcp_tool)
        
        # Add trending servers (convert from Dict to MCPServer)
        for server_data in trending_servers_data[:3]:  # Limit to 3 trending
            try:
                # Convert category string to enum
                category_str = server_data.get('category', 'development_tools')
                category = MCPCategory(category_str) if category_str in [c.value for c in MCPCategory] else MCPCategory.DEVELOPMENT_TOOLS
                
                mcp_server = MCPServer(
                    name=server_data['name'],
                    description=server_data['description'],
                    author=server_data['author'],
                    repository_url=server_data.get('repository_url', ''),
                    category=category,
                    version=server_data.get('version', '1.0.0'),
                    installation_method=server_data.get('installation_method', 'npm'),
                    capabilities=server_data.get('capabilities', []),
                    dependencies=server_data.get('dependencies', []),
                    configuration_schema=server_data.get('configuration_schema', {}),
                    popularity_score=server_data.get('popularity_score', 0),
                    last_updated=server_data.get('last_updated', today),
                    is_official=server_data.get('is_official', False),
                    is_installed=server_data.get('is_installed', False),
                    installation_status=server_data.get('installation_status', 'not_installed'),
                    tags=server_data.get('tags', ['trending'])
                )
                new_tools.append(mcp_server)
            except (KeyError, ValueError) as e:
                logger.warning(f"Skipping invalid server data: {e}")
                continue
        
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
            "installed_mcp_servers": len([s for s in new_tools if s.is_installed]),
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
        
        # Store briefing in database with proper enum serialization
        def serialize_briefing(briefing_obj):
            """Serialize briefing with proper enum handling"""
            briefing_dict = asdict(briefing_obj)
            # Convert MCPCategory enum values to strings in new_mcp_tools
            for tool in briefing_dict.get('new_mcp_tools', []):
                if 'category' in tool and hasattr(tool['category'], 'value'):
                    tool['category'] = tool['category'].value
                elif 'category' in tool and tool['category']:
                    tool['category'] = str(tool['category'])
                else:
                    tool['category'] = "uncategorized"
            return briefing_dict
        
        with self.db.get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO daily_briefings (date, briefing_data) VALUES (?, ?)",
                (today, json.dumps(serialize_briefing(briefing)))
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
                mem0_api_key = os.getenv('MEM0_API_KEY')
                if mem0_api_key:
                    os.environ["MEM0_API_KEY"] = mem0_api_key
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
                together_api_key = os.getenv('TOGETHER_AI_API_KEY')
                if together_api_key:
                    import together
                    together.api_key = together_api_key
                    self.together_client = together  # Use the module directly
                    logger.info("🔧 Mama Bear sandbox initialized with Together.ai")
            except Exception as e:
                logger.error(f"Failed to initialize Together.ai: {e}")
                self.together_client = None
    
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
            
            # Generate response using Together.ai
            response = self._generate_together_ai_response(message, memory_context, user_id)
            
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

    def _generate_together_ai_response(self, message: str, memory_context: str, user_id: str) -> str:
        """Generate response using Together.ai API with Mama Bear personality"""
        try:
            logger.info(f"🔧 Together.ai client status: {self.together_client is not None}")
            if self.together_client:
                logger.info(f"🔧 Together.ai API key available: {bool(os.getenv('TOGETHER_AI_API_KEY'))}")
            
            if not self.together_client:
                # Fallback to intelligent placeholder responses if Together.ai not available
                logger.warning("🔧 Together.ai client not available, using fallback")
                return self._generate_fallback_response(message, memory_context, user_id)
            
            # Build the system prompt for Mama Bear
            system_prompt = f"""You are Mama Bear, the lead developer agent for Nathan's Podplay Build Sanctuary. 

Your personality:
- Warm, caring, and nurturing like a protective mother bear 🐻
- Proactive and deeply knowledgeable about software development
- Expert in MCP (Model Context Protocol) servers, AI integration, and development tools
- Always focused on Nathan's productivity, well-being, and creating calm empowered environments
- Use the 🐻 emoji occasionally to show your bear nature

Your capabilities in Nathan's sanctuary:
- MCP server discovery and management (500+ servers available)
- Persistent memory system via Mem0.ai for learning preferences
- Code execution in secure Together.ai sandbox environments
- Multi-model AI integration and development assistance
- Proactive daily briefings and project recommendations

Context from our previous conversations:
{memory_context if memory_context else "This is our first conversation together."}

Always provide helpful, actionable advice while maintaining your warm, caring tone. Focus on practical solutions that help Nathan build amazing things in his sanctuary."""

            # Generate response using Together.ai
            logger.info(f"🔧 Calling Together.ai API with model: meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo")
            response = self.together_client.Complete.create(
                prompt=f"{system_prompt}\n\nUser: {message}\nAssistant:",
                model="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                max_tokens=1024,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                stop=["User:", "Human:"]
            )
            
            logger.info(f"🔧 Together.ai response received: {response.get('status', 'no status')}")
            response_text = response['output']['choices'][0]['text'].strip()
            logger.info(f"🔧 Response text length: {len(response_text)}")
            return response_text
            
        except Exception as e:
            logger.error(f"Together.ai API error: {e}")
            return self._generate_fallback_response(message, memory_context, user_id)
    
    def _generate_fallback_response(self, message: str, memory_context: str, user_id: str) -> str:
        """Generate intelligent fallback responses when Together.ai is not available"""
        # Check if this is an MCP-related query
        mcp_keywords = ['mcp', 'server', 'database', 'search', 'discover', 'install']
        is_mcp_query = any(keyword in message.lower() for keyword in mcp_keywords)
        
        if is_mcp_query:
            # MCP-specific response
            if 'database' in message.lower():
                return "🐻 I found some excellent database MCP servers for you! The PostgreSQL MCP server is official and highly rated (85 popularity score). There's also SQLite and MySQL options available. Would you like me to help you install one of these?"
            elif 'search' in message.lower() or 'discover' in message.lower():
                return "🐻 I can help you discover MCP servers! I have access to a marketplace with servers for databases, cloud services, AI/ML, development tools, and more. What specific functionality are you looking for?"
            else:
                return f"🐻 Hello {user_id}! I'm here to help you with MCP server management and development tasks. I can search, discover, and help install MCP servers for your sanctuary. What would you like to explore?"
        else:
            # General response
            response = f"🐻 Hello {user_id}! I'm Mama Bear, your lead developer agent. I'm here to help with your Podplay Build sanctuary. "
            
            if memory_context:
                response += f"Based on our previous conversations, I remember:\n{memory_context}\n\nHow can I assist you today?"
            else:
                response += "This appears to be our first conversation. I'm equipped with memory capabilities, MCP server management, and code execution tools. How can I help you today?"
            
            return response

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

# ==================== APPLICATION INITIALIZATION ====================

# Initialize core systems
db = SanctuaryDB()
marketplace = MCPMarketplaceManager(db)
mama_bear = MamaBearAgent(db, marketplace)

# Initialize enhanced Vertex AI Mama Bear if available
enhanced_vertex_mama = None
if ENHANCED_MAMA_AVAILABLE and VertexAIMamaBear:
    try:
        enhanced_vertex_mama = VertexAIMamaBear()
        logger.info("🐻 Enhanced Vertex AI Mama Bear initialized")
    except Exception as e:
        logger.warning(f"Enhanced Mama Bear not available: {e}")

# Initialize enhanced mama bear for backward compatibility
enhanced_mama_bear = mama_bear.enhanced_mama

# Initialize DevSandbox manager
dev_sandbox_manager = None
if DEV_SANDBOX_AVAILABLE and DevSandboxManager:
    try:
        dev_sandbox_manager = DevSandboxManager()
        logger.info("🏗️ DevSandbox manager initialized")
    except Exception as e:
        logger.warning(f"DevSandbox not available: {e}")

# Initialize NixOS Provider Detector
provider_detector = None
if NIXOS_PROVIDER_DETECTOR_AVAILABLE and DevSandboxProviderDetector:
    try:
        provider_detector = DevSandboxProviderDetector()
        logger.info("🔍 NixOS Provider Detector initialized")
    except Exception as e:
        logger.warning(f"NixOS Provider Detector not available: {e}")

# Initialize Mem0 Chat Manager for global access
mem0_manager = None
if MEM0_CHAT_AVAILABLE and mem0_chat_manager:
    try:
        mem0_manager = mem0_chat_manager
        logger.info("🧠 Mem0 Chat Manager initialized for global access")
    except Exception as e:
        logger.warning(f"Mem0 Chat Manager not available: {e}")

logger.info("🐻 Mama Bear Sanctuary - All systems initialized!")

# ==================== NIXOS VM INFRASTRUCTURE SETUP ====================

# Initialize NixOS Ephemeral Sandbox Orchestrator
nixos_ephemeral_orchestrator = None
if NIXOS_INFRASTRUCTURE_AVAILABLE and os.getenv("ENABLE_NIXOS_SANDBOX", "false").lower() == "true":
    try:
        nixos_ephemeral_orchestrator = NixOSSandboxOrchestrator()
        logger.info("🚀 NixOS Ephemeral Sandbox Orchestrator initialized and enabled.")
        
        def shutdown_ephemeral_orchestrator():
            if nixos_ephemeral_orchestrator:
                logger.info("Flask app exiting, shutting down NixOS Ephemeral Orchestrator...")
                nixos_ephemeral_orchestrator.shutdown()
        import atexit
        atexit.register(shutdown_ephemeral_orchestrator)
    except Exception as e:
        logger.error(f"Failed to initialize NixOS Ephemeral Sandbox Orchestrator: {e}")
        nixos_ephemeral_orchestrator = None
else:
    logger.info("NixOS Ephemeral Sandbox is disabled via ENABLE_NIXOS_SANDBOX environment variable.")

# Initialize Libvirt Workspace Manager
libvirt_workspace_manager = None
if NIXOS_INFRASTRUCTURE_AVAILABLE and os.getenv("ENABLE_WORKSPACE_MANAGER", "false").lower() == "true":
    try:
        libvirt_workspace_manager = LibvirtManager()
        logger.info("🛠️ Libvirt Workspace Manager initialized and enabled.")
        
        def close_libvirt_workspace_connection():
            if libvirt_workspace_manager:
                logger.info("Flask app exiting, closing Libvirt Workspace Manager connection...")
                libvirt_workspace_manager.close_connection()
        import atexit
        atexit.register(close_libvirt_workspace_connection)
    except Exception as e:
        logger.error(f"Failed to initialize Libvirt Workspace Manager: {e}")
        libvirt_workspace_manager = None
else:
    logger.info("Libvirt Workspace Manager is disabled via ENABLE_WORKSPACE_MANAGER environment variable.")

# Initialize Scout Agent Logger
scout_log_manager = None
if NIXOS_INFRASTRUCTURE_AVAILABLE and os.getenv("ENABLE_SCOUT_LOGGER", "false").lower() == "true":
    try:
        scout_log_manager = ScoutLogManager()
        logger.info("📜 Scout Agent Log Manager initialized and enabled.")
        
        def close_scout_log_dbs():
            if scout_log_manager:
                logger.info("Flask app exiting, closing Scout Log Manager DBs...")
                scout_log_manager.close_all_dbs()
        import atexit
        atexit.register(close_scout_log_dbs)
    except Exception as e:
        logger.error(f"Failed to initialize Scout Log Manager: {e}")
        scout_log_manager = None
else:
    logger.info("Scout Agent Log Manager is disabled via ENABLE_SCOUT_LOGGER environment variable.")

# ==================== NIXOS VM SANDBOX API ENDPOINTS ====================

@app.route('/api/v1/execute_python_nixos', methods=['POST'])
def execute_python_nixos_vm():
    """Execute Python code in a NixOS VM ephemeral sandbox"""
    if not nixos_ephemeral_orchestrator:
        return jsonify({
            "success": False, 
            "error": "NixOS ephemeral sandboxing service is not enabled or available."
        }), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Invalid JSON payload"}), 400

        code = data.get('code')
        language = data.get('language', 'python')
        timeout_seconds = data.get('timeout_seconds', 30)
        resource_profile = data.get('resource_profile', 'default')

        # Input validation
        if not code or not isinstance(code, str):
            return jsonify({"success": False, "error": "Valid 'code' string is required."}), 400
        if language != 'python':
            return jsonify({"success": False, "error": "Only 'python' language supported."}), 400
        
        try:
            timeout_seconds = int(timeout_seconds)
            if not (1 <= timeout_seconds <= 300):
                raise ValueError()
        except ValueError:
            return jsonify({"success": False, "error": "'timeout_seconds' must be int 1-300."}), 400
        
        job_id = nixos_ephemeral_orchestrator.submit_execution_job(
            code=code, language=language, timeout=timeout_seconds, resource_profile=resource_profile
        )
        return jsonify({
            "success": True, 
            "job_id": job_id, 
            "status": "queued", 
            "message": "Ephemeral code execution job queued."
        }), 202

    except Exception as e:
        logger.error(f"Error submitting NixOS execution job: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/job_status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """Get the status of a NixOS VM execution job"""
    if not nixos_ephemeral_orchestrator:
        return jsonify({
            "success": False, 
            "error": "NixOS ephemeral sandboxing service is not enabled."
        }), 503

    try:
        status = nixos_ephemeral_orchestrator.get_job_status(job_id)
        if status is None:
            return jsonify({"success": False, "error": "Job not found."}), 404
        
        return jsonify({"success": True, "job_status": status})

    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== NIXOS WORKSPACE MANAGEMENT API ENDPOINTS ====================

@app.route('/api/v1/workspaces', methods=['POST'])
def create_workspace():
    """Create a new persistent NixOS workspace VM"""
    if not libvirt_workspace_manager:
        return jsonify({
            "success": False, 
            "error": "Workspace manager is not enabled or available."
        }), 503

    try:
        data = request.get_json()
        workspace_name = data.get('name', f"workspace_{int(time.time())}")
        memory_mb = data.get('memory_mb', 1024)
        vcpus = data.get('vcpus', 2)
        
        workspace_id = libvirt_workspace_manager.define_workspace_vm(
            workspace_name, memory_mb, vcpus
        )[0].name()  # Returns (domain, disk_path) tuple
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "name": workspace_name,
            "message": "Workspace VM created successfully"
        }), 201

    except Exception as e:
        logger.error(f"Error creating workspace: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/workspaces', methods=['GET'])
def list_workspaces():
    """List all workspace VMs"""
    if not libvirt_workspace_manager:
        return jsonify({"success": False, "error": "Workspace manager not available."}), 503

    try:
        workspaces = libvirt_workspace_manager.list_domains_with_metadata("workspace")
        return jsonify({"success": True, "workspaces": workspaces})
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/workspaces/<workspace_id>', methods=['GET'])
def get_workspace(workspace_id):
    """Get details of a specific workspace"""
    if not libvirt_workspace_manager:
        return jsonify({"success": False, "error": "Workspace manager not available."}), 503

    try:
        workspace = libvirt_workspace_manager.get_domain_details(workspace_id)
        if not workspace:
            return jsonify({"success": False, "error": "Workspace not found."}), 404
        
        return jsonify({"success": True, "workspace": workspace})
    except Exception as e:
        logger.error(f"Error getting workspace: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/workspaces/<workspace_id>', methods=['DELETE'])
def delete_workspace(workspace_id):
    """Delete a workspace VM"""
    if not libvirt_workspace_manager:
        return jsonify({"success": False, "error": "Workspace manager not available."}), 503

    try:
        success = libvirt_workspace_manager.delete_workspace_vm(workspace_id)
        if success:
            return jsonify({"success": True, "message": "Workspace deleted successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to delete workspace"}), 500
    except Exception as e:
        logger.error(f"Error deleting workspace: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/workspaces/<workspace_id>/start', methods=['POST'])
def start_workspace(workspace_id):
    """Start a workspace VM"""
    if not libvirt_workspace_manager:
        return jsonify({"success": False, "error": "Workspace manager not available."}), 503

    try:
        success = libvirt_workspace_manager.start_vm(workspace_id)
        if success:
            return jsonify({"success": True, "message": "Workspace started successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to start workspace"}), 500
    except Exception as e:
        logger.error(f"Error starting workspace: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/workspaces/<workspace_id>/stop', methods=['POST'])
def stop_workspace(workspace_id):
    """Stop a workspace VM"""
    if not libvirt_workspace_manager:
        return jsonify({"success": False, "error": "Workspace manager not available."}), 503

    try:
        success = libvirt_workspace_manager.stop_vm(workspace_id, force=False, for_workspace=True)
        if success:
            return jsonify({"success": True, "message": "Workspace stopped successfully"})
        else:
            return jsonify({"success": False, "error": "Failed to stop workspace"}), 500
    except Exception as e:
        logger.error(f"Error stopping workspace: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== SCOUT AGENT MONITORING API ENDPOINTS ====================

@app.route('/api/v1/scout/status', methods=['GET'])
def get_scout_status():
    """Get Scout Agent status and logs"""
    if not scout_log_manager:
        return jsonify({"success": False, "error": "Scout Agent monitoring not available."}), 503

    try:
        # Get status for default project
        project_logger = scout_log_manager.get_project_logger("default")
        status = project_logger.get_project_status_summary()
        return jsonify({"success": True, "status": status})
    except Exception as e:
        logger.error(f"Error getting scout status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/scout/logs', methods=['GET'])
def get_scout_logs():
    """Get Scout Agent logs"""
    if not scout_log_manager:
        return jsonify({"success": False, "error": "Scout Agent monitoring not available."}), 503

    try:
        limit = request.args.get('limit', 50, type=int)
        project_id = request.args.get('project_id', 'default')
        
        # Get project logger and retrieve logs
        project_logger = scout_log_manager.get_project_logger(project_id)
        logs = project_logger.get_logs(limit=limit)
        
        return jsonify({"success": True, "logs": logs, "project_id": project_id})
    except Exception as e:
        logger.error(f"Error getting scout logs: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# Start the Flask application
if __name__ == '__main__':
    print("\n🚀 Starting Podplay Backend Server...")
    print(f"🌐 Server will be available at: http://localhost:5000")
    print("📊 API endpoints ready for DevSandbox, Mama Bear, and Vertex Garden")
    print("🔧 Press Ctrl+C to stop the server\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
