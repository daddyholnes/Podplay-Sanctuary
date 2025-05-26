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

import os
import sys
import logging
from dotenv import load_dotenv

# --- Dotenv loading (ensure this is at the very top) ---
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
# --- End Dotenv loading ---

# --- Configure logging for the sanctuary FIRST ---
logging.basicConfig(
    level=logging.INFO,  # Default level, can be overridden by env var later in main block
    format='🐻 Mama Bear: %(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('mama_bear.log'),  # Ensure this path is writable
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)  # Get the logger for this module
# --- End Logger Setup ---

# --- Standard Library Imports (alphabetical order) ---
import asyncio
import atexit
from contextlib import contextmanager
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import sqlite3
import subprocess
import threading
import time
from typing import Dict, List, Optional, Any, Tuple, Union
import uuid  # For job/workspace IDs
# --- End Standard Library Imports ---

# --- External Dependency Imports (alphabetical order) ---
from flask import Flask, request, jsonify, render_template, send_from_directory, Response, make_response
from flask_socketio import SocketIO, emit, join_room, leave_room, Namespace
from flask_cors import CORS
import requests
# --- End External Dependency Imports ---

# --- Capability Imports with Error Handling ---
# Mem0.ai for memory and RAG
try:
    from mem0 import MemoryClient
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False
    MemoryClient = None
    logger.warning("Mem0.ai client not available. Some features will be disabled.")

# Together.ai for VM sandbox
try:
    import together
    TOGETHER_AVAILABLE = True
except ImportError:
    TOGETHER_AVAILABLE = False
    together = None
    logger.warning("Together.ai client not available. VM sandbox features will be disabled.")

# NixOS Infrastructure Imports
try:
    from nixos_sandbox_orchestrator import NixOSSandboxOrchestrator, Job
    from vm_manager import LibvirtManager, VMManagerError
    from scout_logger import ScoutLogManager
    from ssh_bridge import VMSSHBridge, SSHBridgeError
    NIXOS_INFRASTRUCTURE_AVAILABLE = True
    logger.info("Successfully imported NixOS infrastructure modules.")
except ImportError as e:
    NIXOS_INFRASTRUCTURE_AVAILABLE = False
    NixOSSandboxOrchestrator = Job = LibvirtManager = VMManagerError = None
    ScoutLogManager = VMSSHBridge = SSHBridgeError = None
    logger.warning(f"NixOS infrastructure core modules not available or import error: {e}", exc_info=True)

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
import atexit
import uuid

from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room

# Enhanced Mama Bear Capabilities
try:
    from mem0 import MemoryClient
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False
    MemoryClient = None

# --- NixOS Infrastructure Imports ---
try:
    from nixos_sandbox_orchestrator import NixOSSandboxOrchestrator, Job
    from vm_manager import LibvirtManager, VMManagerError
    from scout_logger import ScoutLogManager
    from ssh_bridge import VMSSHBridge, SSHBridgeError
    NIXOS_INFRASTRUCTURE_AVAILABLE = True
    logger.info("Successfully imported NixOS infrastructure modules.")
except ImportError as e:
    NIXOS_INFRASTRUCTURE_AVAILABLE = False
    logger.warning(f"NixOS infrastructure core modules not available or import error: {e}", exc_info=True)

# Initialize Flask app and SocketIO
app = Flask(__name__)

# Enable CORS for all routes with proper preflight handling
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        "expose_headers": ["Content-Type", "X-Total-Count"],
        "supports_credentials": True,
        "max_age": 600  # 10 minutes
    }
})

# CORS already configured above

# All custom after_request and OPTIONS handlers removed. CORS is now handled globally and automatically.

socketio = SocketIO(app, cors_allowed_origins="*")

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
        # Return the serialized dictionary instead of the object
        return serialize_briefing(briefing)
    
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

# ==================== MAMA BEAR CHAT ENDPOINT ====================

@app.route('/api/mama-bear/chat', methods=['POST'])
def mama_bear_chat():
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        attachments = data.get('attachments', [])
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        # Try to use enhanced Vertex AI Mama Bear first (preferred)
        if enhanced_vertex_mama:
            try:
                response = enhanced_vertex_mama.mama_bear_chat(
                    message=message,
                    user_id=user_id,
                    context={"attachments": attachments} if attachments else None
                )
                return jsonify(response)
            except Exception as e:
                logger.error(f"Enhanced Vertex Mama Bear failed: {e}")
                # Fall back to enhanced mama bear
        
        # Fallback to enhanced mama bear (Together.ai)
        if enhanced_mama_bear:
            try:
                response_text = enhanced_mama_bear.respond(message)
                return jsonify({
                    "success": True,
                    "response": response_text,
                    "metadata": {"provider": "together_ai", "user_id": user_id}
                })
            except Exception as e:
                logger.error(f"Enhanced Mama Bear failed: {e}")
        
        # Ultimate fallback
        return jsonify({
            "success": False,
            "error": "Mama Bear is temporarily unavailable"
        }), 503
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": "Internal server error"
        }), 500

# ==================== NIXOS VM INFRASTRUCTURE SETUP ====================
nixos_ephemeral_orchestrator = None
libvirt_workspace_manager = None
scout_log_manager = None
active_ssh_bridges: Dict[str, VMSSHBridge] = {}  # For WebSocket SSH bridge

if NIXOS_INFRASTRUCTURE_AVAILABLE:
    # Initialize NixOS Ephemeral Sandbox Orchestrator
    if os.getenv("ENABLE_NIXOS_SANDBOX", "false").lower() == "true":
        try:
            nixos_ephemeral_orchestrator = NixOSSandboxOrchestrator()
            logger.info("🚀 NixOS Ephemeral Sandbox Orchestrator initialized and enabled.")
            atexit.register(nixos_ephemeral_orchestrator.shutdown)
        except Exception as e:
            logger.error(f"Failed to initialize NixOS Ephemeral Sandbox Orchestrator: {e}", exc_info=True)
            nixos_ephemeral_orchestrator = None  # Ensure it's None if init fails
    else:
        logger.info("NixOS Ephemeral Sandbox disabled by ENABLE_NIXOS_SANDBOX environment variable.")

    # Initialize Libvirt Workspace Manager - Make it non-blocking
    libvirt_workspace_manager = None
    if os.getenv("ENABLE_WORKSPACE_MANAGER", "false").lower() == "true":
        try:
            libvirt_workspace_manager = LibvirtManager()
            logger.info("🛠️  Libvirt Workspace Manager initialized and enabled.")
            atexit.register(libvirt_workspace_manager.close_connection)
        except Exception as e:
            logger.warning(f"⚠️  Libvirt Workspace Manager is disabled due to: {str(e)}")
            logger.info("⚠️  Some VM-related features will be unavailable, but the core application will continue to run.")
            libvirt_workspace_manager = None
    else:
        logger.info("ℹ️  Libvirt Workspace Manager is disabled by ENABLE_WORKSPACE_MANAGER environment variable.")

    # Initialize Scout Agent Logger
    if os.getenv("ENABLE_SCOUT_LOGGER", "false").lower() == "true":
        try:
            scout_log_manager = ScoutLogManager()  # Uses SCOUT_LOGS_DIR from its own module's config
            logger.info("📜 Scout Agent Log Manager initialized and enabled.")
            atexit.register(scout_log_manager.close_all_dbs)
        except Exception as e:
            logger.error(f"Failed to initialize Scout Log Manager: {e}", exc_info=True)
            scout_log_manager = None  # Ensure it's None if init fails
    else:
        logger.info("Scout Agent Log Manager disabled by ENABLE_SCOUT_LOGGER environment variable.")
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

@app.route('/api/nixos/workspaces', methods=['POST'])
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

@app.route('/api/nixos/workspaces', methods=['GET'])
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

@app.route('/api/nixos/workspaces/<workspace_id>', methods=['GET'])
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

@app.route('/api/nixos/workspaces/<workspace_id>', methods=['DELETE'])
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

@app.route('/api/nixos/workspaces/<workspace_id>/start', methods=['POST'])
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

@app.route('/api/nixos/workspaces/<workspace_id>/stop', methods=['POST'])
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
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== SCOUT AGENT MONITORING API ENDPOINTS ====================

@app.route('/api/v1/scout_agent/status', methods=['GET'])
def get_scout_status():
    """Get Scout Agent status and logs"""
    if not scout_log_manager:
        return jsonify({
            "success": False,
            "error": "Scout Agent logger is not enabled or available."
        }), 503

    try:
        status = scout_log_manager.get_status()
        return jsonify({"success": True, "status": status})
    except Exception as e:
        logger.error(f"Error getting Scout Agent status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/v1/scout_agent/logs', methods=['GET'])
def get_scout_logs():
    """Get Scout Agent logs"""
    if not scout_log_manager:
        return jsonify({
            "success": False,
            "error": "Scout Agent logger is not enabled or available."
        }), 503

    try:
        logs = scout_log_manager.get_recent_logs()
        return jsonify({"success": True, "logs": logs})
    except Exception as e:
        logger.error(f"Error getting Scout Agent logs: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/scout/projects/<project_id>', methods=['GET'])
def get_scout_project_details(project_id):
    """Get details for a specific Scout project."""
    try:
        # Check if scout_log_manager is available
        # Although we'll use mock data for project-specific details for now,
        # this check is kept for future enhancements if scout_log_manager gets project-specific methods.
        if scout_log_manager:
            # Placeholder for future: If scout_log_manager could fetch project-specific data
            # For now, we assume it cannot, so we proceed to mock data.
            # Example:
            # if hasattr(scout_log_manager, 'get_project_status') and hasattr(scout_log_manager, 'get_project_logs'):
            #     status = scout_log_manager.get_project_status(project_id)
            #     logs = scout_log_manager.get_project_logs(project_id)
            #     project_data = {
            #         "id": project_id,
            #         "name": f"Project {project_id}", # Or fetched name
            #         "status": status or "fetched_status_or_default",
            #         "logs": logs or "fetched_logs_or_default",
            #         "details": "Live data from Scout Log Manager."
            #     }
            #     return jsonify({"success": True, "project": project_data}), 200
            pass # Fall through to mock data as per current understanding

        # Fallback to Mock Response
        mock_project_data = {
            "id": project_id,
            "name": f"Project {project_id}",
            "status": "mock_status_monitoring_active",
            "logs": [
                {"timestamp": datetime.utcnow().isoformat() + "Z", "message": "Mock log: System nominal."},
                {"timestamp": (datetime.utcnow() + timedelta(seconds=5)).isoformat() + "Z", "message": "Mock log: Activity detected."}
            ],
            "details": "This is mock data. Live project-specific data retrieval is pending full Scout Agent integration."
        }
        return jsonify({"success": True, "project": mock_project_data}), 200

    except Exception as e:
        logger.error(f"Error in /api/scout/projects/{project_id}: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Failed to retrieve project data."}), 500

# ==================== WebSocket SSH Bridge ====================

@socketio.on('connect', namespace='/terminal_ws')
def terminal_ws_connect():
    """Handle new WebSocket connection to terminal"""
    logger.info(f"WebSocket client connected: {request.sid} to /terminal_ws namespace.")
    emit('terminal_ready_ack', {'message': 'Connection established to /terminal_ws. Please send workspace ID to join a specific terminal.'}, room=request.sid)

@socketio.on('join_workspace_terminal', namespace='/terminal_ws')
def terminal_ws_join_workspace(data):
    """Join a workspace terminal session"""
    workspace_id = data.get('workspace_id')
    logger.info(f"Client {request.sid} attempting to join workspace terminal for: {workspace_id}")

    if not workspace_id:
        logger.warning(f"Client {request.sid} did not provide workspace_id for join_workspace_terminal.")
        emit('terminal_error', {'error': 'Workspace ID is required to join terminal.'}, room=request.sid)
        return

    if not libvirt_workspace_manager:
        logger.error(f"Libvirt Workspace Manager not available for client {request.sid} request for workspace {workspace_id}.")
        emit('terminal_error', {'error': 'Workspace manager service is not available on the server.'}, room=request.sid)
        return

    try:
        details = libvirt_workspace_manager.get_domain_details(workspace_id)
        if not details:
            logger.warning(f"Workspace {workspace_id} not found for client {request.sid}.")
            emit('terminal_error', {'error': f'Workspace {workspace_id} not found.'}, room=request.sid)
            return
        if not details.get('ip_address'):
            logger.warning(f"IP address for workspace {workspace_id} not available (client {request.sid}). VM might be off or agent issues.")
            emit('terminal_error', {'error': f'IP address for workspace {workspace_id} not available. Is the workspace running?'}, room=request.sid)
            return
        if not details.get('status') == 'running':
            logger.warning(f"Workspace {workspace_id} is not running (client {request.sid}). Current status: {details.get('status')}")
            emit('terminal_error', {'error': f'Workspace {workspace_id} is not currently running.'}, room=request.sid)
            return

        # Create and store the SSH bridge instance
        bridge = VMSSHBridge(host_ip=details['ip_address'])
        active_ssh_bridges[request.sid] = bridge
        
        def emit_output_for_sid(sid, current_bridge_instance, ws_id_for_log):
            logger.info(f"Starting output emit thread for SID: {sid}, Workspace: {ws_id_for_log}")
            try:
                while current_bridge_instance.is_active():
                    output = current_bridge_instance.get_output(timeout=0.1)
                    if output is None:
                        logger.info(f"Bridge stream explicitly ended for SID: {sid}, Workspace: {ws_id_for_log}")
                        socketio.emit('terminal_closed', {'message': 'SSH session ended.'}, namespace='/terminal_ws', room=sid)
                        break 
                    if output:
                        socketio.emit('terminal_out', {'output': output}, namespace='/terminal_ws', room=sid)
                    
                    if not current_bridge_instance.is_active():
                        logger.info(f"Bridge became inactive for SID: {sid}, Workspace: {ws_id_for_log}. Exiting emit loop.")
                        socketio.emit('terminal_closed', {'message': 'SSH bridge became inactive.'}, namespace='/terminal_ws', room=sid)
                        break
                    socketio.sleep(0.02)
                
                if not output and current_bridge_instance.is_active():
                    logger.warning(f"Emit loop for SID {sid} exited while bridge still claims active.")
                elif not current_bridge_instance.is_active() and output is not None:
                    logger.info(f"Bridge for SID {sid} became inactive, ensuring terminal_closed is emitted.")
                    socketio.emit('terminal_closed', {'message': 'SSH bridge was closed.'}, namespace='/terminal_ws', room=sid)

            except Exception as e_thread:
                logger.error(f"Exception in terminal output thread for SID {sid}, Workspace {ws_id_for_log}: {e_thread}", exc_info=True)
                try:
                    socketio.emit('terminal_error', {'error': f'Terminal bridge output error: {str(e_thread)}'}, namespace='/terminal_ws', room=sid)
                except Exception as e_emit_err:
                    logger.error(f"Failed to emit terminal_error to SID {sid} (client likely disconnected): {e_emit_err}")
            finally:
                if sid in active_ssh_bridges:
                    logger.info(f"Output thread for SID {sid} (Workspace {ws_id_for_log}) is terminating. Cleaning up bridge.")
                    active_ssh_bridges[sid].close()
                    del active_ssh_bridges[sid]
                else:
                    logger.info(f"Output thread for SID {sid} (Workspace {ws_id_for_log}) ended, bridge already cleaned up.")

        socketio.start_background_task(emit_output_for_sid, request.sid, bridge, workspace_id)
        emit('terminal_ready', {'message': f'SSH bridge to workspace {workspace_id} is ready.'}, room=request.sid)
        logger.info(f"SSH Bridge created and output thread started for client {request.sid} to workspace {workspace_id}")

    except SSHBridgeError as e:
        logger.error(f"Failed to create SSH bridge for workspace {workspace_id} (Client SID: {request.sid}): {e}", exc_info=True)
        emit('terminal_error', {'error': f'Failed to connect to workspace terminal: {str(e)}'}, room=request.sid)
    except VMManagerError as e:
        logger.error(f"VMManagerError for workspace {workspace_id} (Client SID: {request.sid}): {e}", exc_info=True)
        emit('terminal_error', {'error': f'Workspace error: {str(e)}'}, room=request.sid)
    except Exception as e:
        logger.error(f"Unexpected error during 'join_workspace_terminal' for {workspace_id} (Client SID: {request.sid}): {e}", exc_info=True)
        emit('terminal_error', {'error': 'An unexpected server error occurred while setting up the terminal.'}, room=request.sid)

@socketio.on('terminal_in', namespace='/terminal_ws')
def terminal_ws_input(data):
    """Handle terminal input from WebSocket client"""
    sid = request.sid
    bridge = active_ssh_bridges.get(sid)
    terminal_input_data = data.get('input')

    if bridge and bridge.is_active():
        if terminal_input_data is not None:
            try:
                bridge.send_input(terminal_input_data)
            except SSHBridgeError as e:
                logger.error(f"SSHBridgeError on send_input for SID {sid}: {e}")
                emit('terminal_error', {'error': f'Error sending input to terminal: {str(e)}'}, room=sid)
                if sid in active_ssh_bridges:
                    active_ssh_bridges[sid].close()
                    del active_ssh_bridges[sid]
    elif not bridge:
        logger.warning(f"terminal_in event from {sid}: No active SSH bridge found for this session.")
        emit('terminal_error', {'error': 'No active SSH session. Please try rejoining.'}, room=sid)

@socketio.on('terminal_resize', namespace='/terminal_ws')
def terminal_ws_resize(data):
    """Handle terminal resize event"""
    sid = request.sid
    bridge = active_ssh_bridges.get(sid)
    if bridge and bridge.is_active():
        cols = data.get('cols')
        rows = data.get('rows')
        if isinstance(cols, int) and isinstance(rows, int):
            try:
                bridge.resize_pty(cols=cols, rows=rows)
            except SSHBridgeError as e:
                logger.error(f"SSHBridgeError on resize_pty for SID {sid}: {e}")
                emit('terminal_error', {'error': f'Error resizing terminal: {str(e)}'}, room=sid)
            except Exception as e_resize:
                logger.error(f"Unexpected error on resize_pty for SID {sid}: {e_resize}", exc_info=True)
                emit('terminal_error', {'error': f'Unexpected error resizing terminal: {str(e_resize)}'}, room=sid)
        else:
            logger.warning(f"Invalid resize parameters from {sid}: cols={cols}, rows={rows}")
            emit('terminal_error', {'error': 'Invalid resize parameters (cols and rows must be integers).'}, room=sid)
    elif not bridge:
        logger.warning(f"terminal_resize event from {sid}: No active SSH bridge.")
        emit('terminal_error', {'error': 'No active SSH session for resize.'}, room=sid)

@socketio.on('disconnect', namespace='/terminal_ws')
def terminal_ws_disconnect():
    """Handle WebSocket disconnection"""
    sid = request.sid
    bridge = active_ssh_bridges.pop(sid, None)
    if bridge:
        logger.info(f"WebSocket client {sid} disconnected from /terminal_ws. Closing associated SSH bridge.")
        bridge.close()
    else:
        logger.info(f"WebSocket client {sid} disconnected from /terminal_ws. No active SSH bridge found for this SID.")

# ==================== API ENDPOINTS ====================

# MCP Management Endpoints
@app.route('/api/mcp/manage', methods=['GET'])
def get_mcp_servers():
    """Get list of MCP servers"""
    try:
        # Return a mock response for now
        return jsonify({
            "servers": [
                {
                    "id": "filesystem",
                    "name": "File System",
                    "description": "Access to local file system",
                    "status": "active"
                },
                {
                    "id": "git",
                    "name": "Git",
                    "description": "Git version control integration",
                    "status": "active"
                }
            ]
        }), 200
    except Exception as e:
        logger.error(f"Error getting MCP servers: {e}")
        return jsonify({"error": "Failed to get MCP servers"}), 500

@app.route('/api/mcp/discover', methods=['GET'])
def discover_mcp_servers():
    """Discover available MCP servers"""
    try:
        project_type = request.args.get('project_type', 'general')
        # Return a mock response for now
        return jsonify({
            "servers": [
                {
                    "id": "postgresql",
                    "name": "PostgreSQL",
                    "description": "PostgreSQL database server",
                    "category": "database",
                    "recommended": project_type in ["web_development", "data_analysis"]
                },
                {
                    "id": "playwright",
                    "name": "Playwright",
                    "description": "Browser automation for testing",
                    "category": "testing",
                    "recommended": project_type in ["web_development"]
                }
            ]
        }), 200
    except Exception as e:
        logger.error(f"Error discovering MCP servers: {e}")
        return jsonify({"error": "Failed to discover MCP servers"}), 500

@app.route('/api/mcp/search', methods=['GET'])
def search_mcp_servers_route():
    try:
        query = request.args.get('query', '')
        category = request.args.get('category', None)
        official_only_str = request.args.get('official_only', 'false').lower()
        official_only = official_only_str == 'true'

        # The marketplace instance is globally available
        servers = marketplace.search_servers(
            query=query, 
            category=category, 
            official_only=official_only
        )
        # The search_servers method already returns a list of dicts suitable for JSON
        return jsonify({"success": True, "servers": servers}), 200
    except Exception as e:
        logger.error(f"Error in /api/mcp/search: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Failed to search MCP servers."}), 500

@app.route('/api/mcp/categories', methods=['GET'])
def get_mcp_categories_route():
    try:
        categories_list = []
        # MCPCategory enum is globally available
        for category_enum_member in MCPCategory:
            categories_list.append({
                "value": category_enum_member.value,
                # Use .name for the enum member name, then format it
                "label": category_enum_member.name.replace('_', ' ').title() 
            })
        return jsonify({"success": True, "categories": categories_list}), 200
    except Exception as e:
        logger.error(f"Error in /api/mcp/categories: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Failed to retrieve MCP categories."}), 500

# Root endpoint for health checks
@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "Podplay Backend",
        "version": "1.0.0"
    }), 200

# Mama Bear Endpoints
@app.route('/api/mama-bear/briefing', methods=['GET'])
def get_daily_briefing():
    """Get Mama Bear's daily briefing"""
    try:
        # This call now generates, stores, and returns the serializable briefing dictionary
        briefing_data_serializable = mama_bear.generate_daily_briefing()

        if not briefing_data_serializable:
            logger.error("Failed to generate briefing data.")
            return jsonify({"success": False, "error": "Failed to generate briefing data."}), 500

        return jsonify({"success": True, "briefing": briefing_data_serializable}), 200
    except Exception as e:
        logger.error(f"Error in get_daily_briefing: {e}", exc_info=True)
        return jsonify({"success": False, "error": "Failed to generate daily briefing due to an internal error."}), 500

@app.route('/api/vertex-garden/chat-history', methods=['GET'])
def get_chat_history():
    """Get chat history"""
    # Return empty array for now
    return jsonify([]), 200

@app.route('/api/vertex-garden/session/<session_id>/messages', methods=['GET'])
def get_session_messages(session_id):
    """Get messages for a specific session"""
    # Return empty array for now
    return jsonify([]), 200

@app.route('/api/vertex-garden/chat', methods=['POST'])
def vertex_garden_chat():
    """Handle chat messages"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # Simple echo response for now
        response = {
            "response": f"I received your message: {message}",
            "timestamp": datetime.utcnow().isoformat()
        }
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        return jsonify({"error": "Failed to process chat"}), 500

# ==================== DEFAULT NAMESPACE SOCKET.IO DIAGNOSTIC HANDLERS ====================
# These handlers are for the default namespace ('/') often used by generic Socket.IO clients
# or for initial handshake before switching to a specific namespace.

@socketio.on('connect', namespace='/') # Or simply @socketio.on('connect')
def handle_default_connect():
    # request and logger are already available globally in this file
    logger.info(f"CLIENT_DEFAULT_CONNECT: Client {request.sid} connected to default namespace.")
    # Optionally, emit a confirmation back to the client
    # emit('default_ns_confirmation', {'sid': request.sid, 'message': 'Successfully connected to default namespace.'}, room=request.sid)

@socketio.on('disconnect', namespace='/') # Or simply @socketio.on('disconnect')
def handle_default_disconnect():
    logger.info(f"CLIENT_DEFAULT_DISCONNECT: Client {request.sid} disconnected from default namespace.")

# ==================== MAIN APP START ====================
if __name__ == '__main__':
    # Set global logging level based on environment variable
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    # Validate log level string
    if log_level_str not in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
        log_level_str = "INFO"  # Default to INFO if invalid
        logger.warning(f"Invalid LOG_LEVEL '{os.getenv('LOG_LEVEL', 'INFO')}', defaulting to INFO.")
    
    logging.getLogger().setLevel(log_level_str)  # Set for root logger
    # If you want Flask's own logger to also be at this level
    app.logger.setLevel(log_level_str)

    logger.info(f"Global logging level set to: {log_level_str}")
    logger.info("🚀 Starting Podplay Backend Server with NixOS Capabilities...")
    logger.info(f"🔧 NixOS Ephemeral Sandbox Orchestrator: {'Initialized and Enabled' if nixos_ephemeral_orchestrator else 'Disabled / Not Initialized (check ENABLE_NIXOS_SANDBOX env var and import logs)'}")
    logger.info(f"🔧 Libvirt Workspace Manager: {'Initialized and Enabled' if libvirt_workspace_manager else 'Disabled / Not Initialized (check ENABLE_WORKSPACE_MANAGER env var and import logs)'}")
    logger.info(f"🔧 Scout Agent Log Manager: {'Initialized and Enabled' if scout_log_manager else 'Disabled / Not Initialized (check ENABLE_SCOUT_LOGGER env var and import logs)'}")
    
    flask_debug_mode = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    api_host = os.getenv("API_HOST", "0.0.0.0")
    api_port = int(os.environ.get('API_PORT', '5000'))  # Default to 5000 to match frontend

    logger.info(f"Flask Debug Mode: {flask_debug_mode}, Host: {api_host}, Port: {api_port}")
    
    # Use socketio.run for development server with WebSocket support.
    # For production, a proper WSGI server like Gunicorn with eventlet or gevent worker is needed.
    try:
        socketio.run(app, 
                    host=api_host, 
                    port=api_port, 
                    debug=flask_debug_mode, 
                    use_reloader=flask_debug_mode,  # Be cautious with reloader if background threads/processes don't clean up well
                    allow_unsafe_werkzeug=True  # Needed for Werkzeug >= 2.3 with SocketIO dev server reloader
                   )
    except Exception as e_main:
        logger.critical(f"Failed to start Flask-SocketIO server: {e_main}", exc_info=True)
        sys.exit(1)
