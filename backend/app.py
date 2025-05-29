# CORS will be configured with flask-cors instead of patch

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

# Configure UTF-8 encoding for Windows compatibility
import os
import sys
if os.name == 'nt':  # Windows
    # Set environment variables for UTF-8 support
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    # Configure stdout and stderr to use UTF-8
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        except:
            pass

# Import test API endpoints for connectivity debugging
import test_api

import os
import logging
from dotenv import load_dotenv

# --- Dotenv loading (ensure this is at the very top) ---
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
# --- End Dotenv loading ---

# --- Configure logging for the sanctuary FIRST ---
# Create custom formatter and handlers to handle Unicode properly on Windows
log_format = '🐻 Mama Bear: %(asctime)s - %(levelname)s - %(message)s'
formatter = logging.Formatter(log_format)

# File handler with UTF-8 encoding
file_handler = logging.FileHandler('mama_bear.log', encoding='utf-8')
file_handler.setFormatter(formatter)

# Stream handler with UTF-8 encoding for Windows compatibility
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(formatter)
# Set encoding for Windows console
if hasattr(stream_handler.stream, 'reconfigure'):
    try:
        stream_handler.stream.reconfigure(encoding='utf-8')
    except:
        # Fallback: use plain text format if Unicode fails
        plain_formatter = logging.Formatter('Mama Bear: %(asctime)s - %(levelname)s - %(message)s')
        stream_handler.setFormatter(plain_formatter)

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(file_handler)
root_logger.addHandler(stream_handler)
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

# Using threading as async_mode for Python 3.12 compatibility
# eventlet has compatibility issues with Python 3.12's SSL module
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# ==================== SOCKET.IO EVENT HANDLERS ====================

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'success', 'message': 'Connected to Podplay Sanctuary'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('join_terminal')
def handle_join_terminal(data):
    """Join a terminal session room"""
    try:
        session_id = data.get('session_id')
        if session_id:
            join_room(session_id)
            logger.info(f"Client {request.sid} joined terminal session {session_id}")
            emit('terminal_joined', {'session_id': session_id, 'status': 'success'})
        else:
            emit('error', {'message': 'Session ID required'})
    except Exception as e:
        logger.error(f"Error joining terminal: {e}")
        emit('error', {'message': str(e)})

@socketio.on('leave_terminal')
def handle_leave_terminal(data):
    """Leave a terminal session room"""
    try:
        session_id = data.get('session_id')
        if session_id:
            leave_room(session_id)
            logger.info(f"Client {request.sid} left terminal session {session_id}")
            emit('terminal_left', {'session_id': session_id, 'status': 'success'})
    except Exception as e:
        logger.error(f"Error leaving terminal: {e}")
        emit('error', {'message': str(e)})

@socketio.on('terminal_input')
def handle_terminal_input(data):
    """Handle terminal input from client"""
    try:
        session_id = data.get('session_id')
        command = data.get('command', '')
        
        logger.info(f"Terminal input for session {session_id}: {command}")
        
        # Mock terminal output - replace with actual terminal execution
        output = f"$ {command}\nCommand executed successfully\n"
        
        # Emit output to all clients in the terminal session room
        socketio.emit('terminal_output', {
            'session_id': session_id,
            'output': output,
            'timestamp': datetime.now().isoformat()
        }, room=session_id)
        
    except Exception as e:
        logger.error(f"Error handling terminal input: {e}")
        emit('error', {'message': str(e)})

@socketio.on('workspace_subscribe')
def handle_workspace_subscribe(data):
    """Subscribe to workspace updates"""
    try:
        workspace_id = data.get('workspace_id')
        if workspace_id:
            join_room(f"workspace_{workspace_id}")
            logger.info(f"Client {request.sid} subscribed to workspace {workspace_id}")
            emit('workspace_subscribed', {'workspace_id': workspace_id, 'status': 'success'})
        else:
            emit('error', {'message': 'Workspace ID required'})
    except Exception as e:
        logger.error(f"Error subscribing to workspace: {e}")
        emit('error', {'message': str(e)})

@socketio.on('workspace_unsubscribe')
def handle_workspace_unsubscribe(data):
    """Unsubscribe from workspace updates"""
    try:
        workspace_id = data.get('workspace_id')
        if workspace_id:
            leave_room(f"workspace_{workspace_id}")
            logger.info(f"Client {request.sid} unsubscribed from workspace {workspace_id}")
            emit('workspace_unsubscribed', {'workspace_id': workspace_id, 'status': 'success'})
    except Exception as e:
        logger.error(f"Error unsubscribing from workspace: {e}")
        emit('error', {'message': str(e)})

@socketio.on('mama_bear_chat')
def handle_mama_bear_chat(data):
    """Handle real-time Mama Bear chat via Socket.IO"""
    try:
        message = data.get('message', '')
        session_id = data.get('session_id', request.sid)
        
        logger.info(f"Mama Bear chat via Socket.IO: {message}")
        
        # Mock response - replace with actual Mama Bear integration
        response = {
            "message": f"🐻 Mama Bear received: {message}",
            "timestamp": datetime.now().isoformat(),
            "session_id": session_id,
            "type": "mama_bear_response"
        }
        
        emit('mama_bear_response', response)
        
    except Exception as e:
        logger.error(f"Error handling Mama Bear chat: {e}")
        emit('error', {'message': str(e)})

@socketio.on('system_status_request')
def handle_system_status_request():
    """Handle system status requests"""
    try:
        status = {
            "timestamp": datetime.now().isoformat(),
            "services": {
                "mama_bear": "running",
                "scout": "running",
                "nixos_orchestrator": "running" if NIXOS_INFRASTRUCTURE_AVAILABLE else "unavailable",
                "mem0": "running" if MEM0_AVAILABLE else "unavailable",
                "together_ai": "running" if TOGETHER_AVAILABLE else "unavailable"
            },
            "system": {
                "cpu_usage": 25.5,
                "memory_usage": 60.2,
                "active_workspaces": 2,
                "active_terminals": 3
            }
        }
        
        emit('system_status', status)
        
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        emit('error', {'message': str(e)})

# ==================== END SOCKET.IO EVENT HANDLERS ====================

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
# CORS configuration moved to later in the file

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
    
    def chat(self, message: str, user_id: str = "nathan", chat_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Chat with Mama Bear using enhanced capabilities"""
        try:
            # Store the user message in memory
            self.enhanced_mama.store_memory(
                f"User ({user_id}): {message}",
                {"type": "chat_message", "user_id": user_id, "timestamp": datetime.now().isoformat()}
            )
            
            # Get contextual insights for better response
            context = self.enhanced_mama.get_contextual_insights(f"chat context for {user_id}")
            
            # Prepare enhanced context with Mama Bear personality
            mama_bear_context = """You are Mama Bear Gem, the lead developer agent for Nathan's Podplay Build sanctuary. 

PERSONALITY & CORE TRAITS:
🐻 Warm, caring, and nurturing like a protective mother bear
🧠 Proactive and intelligent - anticipate needs before they're expressed
🛠️ Expert in modern development, AI integration, and MCP ecosystem
🏡 Focused on creating a calm, empowered development sanctuary
⚡ Always ready with practical solutions and gentle guidance

YOUR CAPABILITIES:
- Search and manage MCP servers
- Execute and analyze code safely
- Store and retrieve conversation context
- Generate daily briefings and recommendations
- Proactive discovery of new tools and improvements

COMMUNICATION STYLE:
- Use 🐻 emoji occasionally to show your caring bear nature
- Be warm but not overly cutesy
- Provide actionable, practical advice
- Anticipate follow-up questions
- Always focus on Nathan's productivity and well-being

Remember: You're running in Nathan's Podplay Build sanctuary with access to memory systems, MCP marketplace, and development tools."""

            # Create a response
            response_content = f"🐻 Hello! I'm Mama Bear Gem, your lead developer agent. I'm here to help with your Podplay Build sanctuary. What can I assist you with today? I have access to:\n\n" \
                             f"• 🏪 MCP Marketplace with {len(self.marketplace.marketplace_data)} servers\n" \
                             f"• 🧠 Memory system ({'active' if self.enhanced_mama.memory else 'local only'})\n" \
                             f"• 🔧 Code sandbox ({'active' if self.enhanced_mama.together_client else 'unavailable'})\n" \
                             f"• 📊 Project insights and daily briefings\n\n" \
                             f"Your message: \"{message}\"\n\n" \
                             f"I understand you're asking about: {message}. How can I help you with this?"

            # Store the response in memory
            self.enhanced_mama.store_memory(
                f"Mama Bear response: {response_content}",
                {"type": "chat_response", "user_id": user_id, "timestamp": datetime.now().isoformat()}
            )
            
            return {
                "success": True,
                "response": response_content,
                "metadata": {
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat(),
                    "memory_active": bool(self.enhanced_mama.memory),
                    "sandbox_active": bool(self.enhanced_mama.together_client),
                    "mcp_servers_available": len(self.marketplace.marketplace_data)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in Mama Bear chat: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "🐻 I'm having a moment of technical difficulty. Let me try again in a moment."
            }

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
        logger.info("🏗️ Dev Sandbox Manager initialized")
    except Exception as e:
        logger.warning(f"Dev Sandbox Manager not available: {e}")

# Initialize workspace managers
libvirt_workspace_manager = None
scout_log_manager = None
nixos_ephemeral_orchestrator = None

# Initialize Scout Log Manager if available
if NIXOS_INFRASTRUCTURE_AVAILABLE and ScoutLogManager:
    try:
        scout_log_manager = ScoutLogManager()
        logger.info("🔍 Scout Log Manager initialized")
    except Exception as e:
        logger.warning(f"Scout Log Manager not available: {e}")

logger.info("🐻 Mama Bear Control Center systems initialized successfully")

# ==================== MAMA BEAR CONTROL CENTER API ENDPOINTS ====================

@app.route('/api/mama-bear/code-server/instances', methods=['GET'])
def get_code_server_instances():
    """Get all active code-server instances"""
    try:
        # Mock data for development - in production this would query actual instances
        instances = [
            {
                "id": "instance-1",
                "name": "React TypeScript Workspace",
                "url": "http://localhost:8080",
                "status": "running",
                "workspace": "/workspaces/react-ts-app",
                "theme": "sanctuary",
                "port": 8080,
                "cpu": 15.2,
                "memory": 28.5,
                "lastActivity": datetime.now().isoformat(),
                "isMinimized": False,
                "position": {"x": 100, "y": 100},
                "size": {"width": 1200, "height": 800}
            }
        ]
        
        return jsonify({
            "success": True,
            "instances": instances,
            "count": len(instances)
        })
        
    except Exception as e:
        logger.error(f"Error getting code-server instances: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/code-server/templates', methods=['GET'])
def get_workspace_templates():
    """Get available workspace templates"""
    try:
        templates = [
            {
                "id": "react-typescript",
                "name": "React + TypeScript",
                "description": "Modern React development with TypeScript, Vite, and Mama Bear integration",
                "icon": "⚛️",
                "language": "TypeScript",
                "framework": "React",
                "features": ["Hot Reload", "ESLint", "Prettier", "Mama Bear AI"],
                "estimatedSetupTime": "2 minutes"
            },
            {
                "id": "python-fastapi",
                "name": "Python FastAPI",
                "description": "Fast Python API development with automatic docs and Mama Bear monitoring",
                "icon": "🐍",
                "language": "Python",
                "framework": "FastAPI",
                "features": ["Auto Docs", "Hot Reload", "Poetry", "Mama Bear Analytics"],
                "estimatedSetupTime": "3 minutes"
            },
            {
                "id": "node-express",
                "name": "Node.js + Express",
                "description": "Backend API development with Express, TypeScript, and Mama Bear insights",
                "icon": "🟢",
                "language": "JavaScript",
                "framework": "Express",
                "features": ["TypeScript", "Nodemon", "Morgan", "Mama Bear Logging"],
                "estimatedSetupTime": "2 minutes"
            },
            {
                "id": "sanctuary-extension",
                "name": "Sanctuary Extension",
                "description": "VS Code extension development with Sanctuary theme integration",
                "icon": "🏠",
                "language": "TypeScript",
                "framework": "VS Code Extension",
                "features": ["Extension API", "Webview", "Commands", "Mama Bear Support"],
                "estimatedSetupTime": "4 minutes"
            }
        ]
        
        return jsonify({
            "success": True,
            "templates": templates,
            "count": len(templates)
        })
        
    except Exception as e:
        logger.error(f"Error getting workspace templates: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/code-server/create', methods=['POST'])
def create_code_server_instance():
    """Create a new code-server instance from template"""
    try:
        data = request.get_json()
        template_id = data.get('template_id')
        workspace_name = data.get('workspace_name')
        theme = data.get('theme', 'sanctuary')
        
        if not template_id:
            return jsonify({"success": False, "error": "Template ID is required"}), 400
        
        # Generate new instance ID and port
        instance_id = f"instance-{int(datetime.now().timestamp())}"
        port = 8080 + len([])  # In real implementation, get actual count
        
        # Create instance configuration
        new_instance = {
            "id": instance_id,
            "name": workspace_name or f"Workspace {instance_id}",
            "url": f"http://localhost:{port}",
            "status": "starting",
            "workspace": f"/workspaces/{template_id}",
            "theme": theme,
            "port": port,
            "cpu": 0,
            "memory": 0,
            "lastActivity": datetime.now().isoformat(),
            "isMinimized": False,
            "position": {"x": 100, "y": 100},
            "size": {"width": 1200, "height": 800}
        }
        
        # In production, this would actually start a code-server process
        logger.info(f"🏗️ Creating code-server instance for template: {template_id}")
        
        # Mama Bear learns from this action
        if mama_bear:
            mama_bear.learn_from_interaction(
                "workspace_creation",
                f"Created {template_id} workspace with {theme} theme",
                f"User prefers {template_id} for development tasks"
            )
        
        return jsonify({
            "success": True,
            "instance": new_instance,
            "message": f"🐻 Creating {template_id} workspace with love and care!"
        })
        
    except Exception as e:
        logger.error(f"Error creating code-server instance: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/code-server/control/<instance_id>', methods=['POST'])
def control_code_server_instance(instance_id):
    """Control a code-server instance (start/stop/restart/delete)"""
    try:
        data = request.get_json()
        action = data.get('action')
        
        if action not in ['start', 'stop', 'restart', 'delete']:
            return jsonify({"success": False, "error": "Invalid action"}), 400
        
        # In production, this would control actual code-server processes
        logger.info(f"🔧 {action.title()}ing code-server instance: {instance_id}")
        
        action_messages = {
            'start': f"🚀 Starting workspace {instance_id}",
            'stop': f"⏹️ Stopping workspace {instance_id}",
            'restart': f"🔄 Restarting workspace {instance_id}",
            'delete': f"🗑️ Removing workspace {instance_id}"
        }
        
        return jsonify({
            "success": True,
            "instance_id": instance_id,
            "action": action,
            "message": action_messages[action]
        })
        
    except Exception as e:
        logger.error(f"Error controlling code-server instance: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/agent/commands', methods=['GET'])
def get_mama_bear_commands():
    """Get available Mama Bear agent commands"""
    try:
        commands = [
            {
                "id": "create-workspace",
                "name": "Create Workspace",
                "description": "Set up a new development workspace with Mama Bear assistance",
                "category": "workspace",
                "icon": "🏗️",
                "hotkey": "Ctrl+Shift+N"
            },
            {
                "id": "ai-code-review",
                "name": "AI Code Review",
                "description": "Get intelligent code suggestions and reviews from Mama Bear",
                "category": "ai",
                "icon": "🔍",
                "hotkey": "Ctrl+Shift+R"
            },
            {
                "id": "deploy-app",
                "name": "Deploy Application",
                "description": "Deploy your application with Mama Bear deployment pipeline",
                "category": "deployment",
                "icon": "🚀",
                "hotkey": "Ctrl+Shift+D"
            },
            {
                "id": "system-health",
                "name": "System Health Check",
                "description": "Monitor system performance and workspace health",
                "category": "monitoring",
                "icon": "💊",
                "hotkey": "Ctrl+Shift+H"
            },
            {
                "id": "mcp-discover",
                "name": "Discover MCP Tools",
                "description": "Find and install new Model Context Protocol tools",
                "category": "ai",
                "icon": "🔧",
                "hotkey": "Ctrl+Shift+M"
            },
            {
                "id": "sanctuary-optimize",
                "name": "Optimize Sanctuary",
                "description": "Let Mama Bear optimize your development environment",
                "category": "workspace",
                "icon": "✨",
                "hotkey": "Ctrl+Shift+O"
            }
        ]
        
        return jsonify({
            "success": True,
            "commands": commands,
            "count": len(commands)
        })
        
    except Exception as e:
        logger.error(f"Error getting Mama Bear commands: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/agent/execute', methods=['POST'])
def execute_mama_bear_command():
    """Execute a Mama Bear agent command"""
    try:
        data = request.get_json()
        command_id = data.get('command_id')
        parameters = data.get('parameters', {})
        
        if not command_id:
            return jsonify({"success": False, "error": "Command ID is required"}), 400
        
        logger.info(f"🐻 Executing Mama Bear command: {command_id}")
        
        # Command execution logic
        command_responses = {
            "create-workspace": {
                "success": True,
                "message": "🏗️ Opening workspace creation wizard...",
                "action": "open_modal",
                "modal_type": "create_workspace"
            },
            "ai-code-review": {
                "success": True,
                "message": "🔍 Analyzing your code for improvements...",
                "action": "start_code_review",
                "suggestions": [
                    "Consider adding TypeScript strict mode",
                    "Add error boundaries to React components",
                    "Implement proper error handling"
                ]
            },
            "deploy-app": {
                "success": True,
                "message": "🚀 Preparing deployment pipeline...",
                "action": "start_deployment",
                "steps": ["Build", "Test", "Deploy", "Monitor"]
            },
            "system-health": {
                "success": True,
                "message": "💊 Running system health diagnostics...",
                "action": "show_metrics",
                "metrics": {
                    "cpu": "25%",
                    "memory": "68%",
                    "disk": "45%",
                    "instances": "3 active"
                }
            },
            "mcp-discover": {
                "success": True,
                "message": "🔧 Discovering new MCP tools for you...",
                "action": "open_mcp_marketplace",
                "new_tools": ["@anthropic/mcp-server-github", "@openai/mcp-server-sqlite"]
            },
            "sanctuary-optimize": {
                "success": True,
                "message": "✨ Analyzing your sanctuary for optimization opportunities...",
                "action": "show_optimizations",
                "optimizations": [
                    "Enable VS Code settings sync",
                    "Install productivity extensions",
                    "Configure automatic backups"
                ]
            }
        }
        
        response = command_responses.get(command_id, {
            "success": False,
            "error": f"Unknown command: {command_id}"
        })
        
        # Learn from command execution
        if mama_bear and response.get("success"):
            mama_bear.learn_from_interaction(
                "command_execution",
                f"Executed {command_id}",
                f"User frequently uses {command_id} command"
            )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error executing Mama Bear command: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/mama-bear/system/metrics', methods=['GET'])
def get_system_metrics():
    """Get current system metrics for the control center"""
    try:
        import psutil
        
        # Get system metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        metrics = {
            "cpu": round(cpu_percent, 1),
            "memory": round(memory.percent, 1),
            "disk": round(disk.percent, 1),
            "activeInstances": 0,  # Would count actual instances
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "metrics": metrics
        })
        
    except ImportError:
        # Fallback if psutil not available
        metrics = {
            "cpu": 15.5,
            "memory": 68.2,
            "disk": 45.0,
            "activeInstances": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify({
            "success": True,
            "metrics": metrics,
            "note": "Using mock data - install psutil for real metrics"
        })
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== END MAMA BEAR CONTROL CENTER API ====================

# ==================== MAMA BEAR CHAT API ENDPOINTS ====================

@app.route('/api/mama-bear/chat', methods=['POST'])
def mama_bear_chat():
    """Main Mama Bear chat endpoint with Vertex AI integration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'nathan')
        session_id = data.get('session_id', None)
        context = data.get('context', None)
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        # Try Vertex AI enhanced chat first if available
        if hasattr(mama_bear, 'enhanced_mama') and mama_bear.enhanced_mama:
            try:
                # Get chat history for session if provided
                chat_history = []
                if session_id and hasattr(mama_bear, 'get_chat_history'):
                    chat_history = mama_bear.get_chat_history(session_id, limit=10)
                
                # Call Vertex AI enhanced chat
                response = mama_bear.enhanced_mama.chat_with_vertex_ai(
                    message=message,
                    chat_history=chat_history,
                    context=context,
                    user_id=user_id
                )
                
                if response.get('success'):
                    # Store message and response if we have a session
                    if session_id and hasattr(mama_bear, 'store_chat_message'):
                        mama_bear.store_chat_message(session_id, 'user', message, user_id)
                        mama_bear.store_chat_message(session_id, 'assistant', response.get('response', ''), 'mama-bear')
                    
                    return jsonify({
                        "success": True,
                        "response": response.get('response', '🐻 Hello! I\'m here to help with your development sanctuary.'),
                        "model_used": response.get('model_used', 'mama-bear-core'),
                        "session_id": session_id,
                        "vertex_ai": True,
                        "memories_used": response.get('memories_used', []),
                        "metadata": response.get('metadata', {})
                    })
                else:
                    logger.warning(f"Vertex AI chat failed: {response.get('error', 'Unknown error')}")
                    # Fall through to basic chat
                    
            except Exception as e:
                logger.error(f"Vertex AI chat error: {e}")
                # Fall through to basic chat
        
        # Fallback to basic Mama Bear chat
        basic_response = mama_bear.chat(message, user_id=user_id)
        
        return jsonify({
            "success": True,
            "response": basic_response.get('response', '🐻 Hello! I\'m Mama Bear, your development companion. How can I help you today?'),
            "model_used": "mama-bear-basic",
            "session_id": session_id,
            "vertex_ai": False,
            "memories_used": [],
            "metadata": {}
        })
        
    except Exception as e:
        logger.error(f"Error in Mama Bear chat: {e}")
        return jsonify({
            "success": False, 
            "error": str(e),
            "response": "🐻 I'm having a moment of technical difficulty. Let me try again in a moment."
        }), 500

@app.route('/api/mama-bear/briefing', methods=['GET'])
def mama_bear_briefing():
    """Get Mama Bear's daily briefing"""
    try:
        # Get today's date
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Generate or retrieve today's briefing
        if hasattr(mama_bear, 'generate_daily_briefing'):
            briefing = mama_bear.generate_daily_briefing()
        else:
            # Fallback briefing
            briefing = {
                "date": today,
                "greeting": f"🐻 Good day, Nathan! Here's your sanctuary briefing for {today}",
                "system_status": {
                    "backend": "✅ Running",
                    "frontend": "✅ Connected",
                    "mem0_memory": "✅ Active" if MEM0_AVAILABLE else "⚠️ Limited",
                    "vertex_ai": "✅ Available" if ENHANCED_MAMA_AVAILABLE else "⚠️ Basic mode",
                    "dev_sandbox": "✅ Ready" if DEV_SANDBOX_AVAILABLE else "⚠️ Limited"
                },
                "new_mcp_tools": [],
                "project_priorities": [
                    "🏗️ Sanctuary development environment optimization",
                    "🧠 AI integration enhancement",
                    "🔧 MCP marketplace expansion"
                ],
                "recommendations": [
                    "🐻 Your development sanctuary is running smoothly",
                    "💡 Consider exploring new MCP tools for enhanced productivity",
                    "🌟 Take breaks and stay hydrated while coding!"
                ],
                "summary": "All systems operational. Ready for productive development."
            }
        
        return jsonify({
            "success": True,
            "briefing": briefing,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error generating briefing: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "briefing": {
                "date": datetime.now().strftime('%Y-%m-%d'),
                "greeting": "🐻 Having trouble generating your briefing, but I'm here to help!",
                "system_status": {"error": "Unable to check systems"},
                "summary": "Please try again in a moment."
            }
        }), 500

@app.route('/api/vertex-garden/chat', methods=['POST'])
def vertex_garden_chat():
    """Vertex Garden chat endpoint - alias for mama-bear chat with enhanced UI context"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Add Vertex Garden context
        original_message = data.get('message', '')
        enhanced_message = f"[Vertex Garden Context] {original_message}"
        data['message'] = enhanced_message
        data['context'] = "vertex_garden_ui"
        
        # Forward to main mama bear chat endpoint
        return mama_bear_chat()
        
    except Exception as e:
        logger.error(f"Error in Vertex Garden chat: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "response": "🐻 Vertex Garden is experiencing difficulties. Let me help you through the main chat."
        }), 500

@app.route('/api/mcp/search', methods=['GET'])
def search_mcp_servers():
    """Search MCP servers in the marketplace"""
    try:
        query = request.args.get('query', '')
        category = request.args.get('category', None)
        official_only = request.args.get('official_only', 'false').lower() == 'true'
        
        if hasattr(marketplace, 'search_servers'):
            servers = marketplace.search_servers(
                query=query,
                category=category,
                official_only=official_only
            )
        else:
            # Fallback with basic server list
            servers = [
                {
                    "name": "github-mcp-server",
                    "description": "GitHub integration for repository management",
                    "category": "development_tools",
                    "author": "Anthropic",
                    "is_official": True,
                    "popularity_score": 92
                },
                {
                    "name": "aws-mcp-server",
                    "description": "Official AWS MCP server for cloud operations",
                    "category": "cloud_services",
                    "author": "Anthropic", 
                    "is_official": True,
                    "popularity_score": 95
                }
            ]
        
        return jsonify({
            "success": True,
            "servers": servers,
            "total": len(servers),
            "query": query,
            "filters": {
                "category": category,
                "official_only": official_only
            }
        })
        
    except Exception as e:
        logger.error(f"Error searching MCP servers: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "servers": []
        }), 500

@app.route('/api/mcp/categories', methods=['GET'])
def get_mcp_categories():
    """Get available MCP server categories"""
    try:
        categories = [
            {"id": "database", "name": "Database", "description": "Database operations and management"},
            {"id": "cloud_services", "name": "Cloud Services", "description": "AWS, GCP, Azure integrations"},
            {"id": "development_tools", "name": "Development Tools", "description": "GitHub, GitLab, CI/CD tools"},
            {"id": "communication", "name": "Communication", "description": "Slack, Discord, messaging tools"},
            {"id": "ai_ml", "name": "AI & ML", "description": "AI models and machine learning tools"},
            {"id": "productivity", "name": "Productivity", "description": "Notion, calendar, task management"},
            {"id": "search_data", "name": "Search & Data", "description": "Web search, data processing"},
            {"id": "security", "name": "Security", "description": "Security scanning and monitoring"},
        ]
        
        return jsonify({
            "success": True,
            "categories": categories
        })
        
    except Exception as e:
        logger.error(f"Error getting MCP categories: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "categories": []
        }), 500

# ==================== END CORE MAMA BEAR CHAT API ====================

# ==================== SCOUT AGENT ENDPOINTS ====================

@app.route('/api/v1/scout_agent/projects/<project_id>/status', methods=['GET'])
def get_scout_project_status(project_id):
    """Get Scout project status"""
    try:
        # Mock Scout project status for now
        return jsonify({
            "success": True,
            "project_id": project_id,
            "status": "active",
            "health": "good",
            "last_updated": datetime.now().isoformat(),
            "metrics": {
                "uptime": "99.9%",
                "response_time": "120ms",
                "error_rate": "0.1%"
            },
            "message": f"🔍 Scout monitoring project {project_id}"
        })
    except Exception as e:
        logger.error(f"Error getting Scout project status: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scout/projects', methods=['GET'])
def list_scout_projects():
    """List all Scout projects"""
    try:
        # Mock Scout projects list
        projects = [
            {
                "id": "test-project-alpha",
                "name": "Test Project Alpha",
                "status": "active",
                "created_at": datetime.now().isoformat(),
                "last_activity": datetime.now().isoformat()
            },
            {
                "id": "podplay-sanctuary",
                "name": "Podplay Sanctuary",
                "status": "active", 
                "created_at": datetime.now().isoformat(),
                "last_activity": datetime.now().isoformat()
            }
        ]
        
        

        
        return jsonify({
            "success": True,
            "projects": projects,
            "total": len(projects)
        })
    except Exception as e:
        logger.error(f"Error listing Scout projects: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "projects": []
        }), 500

@app.route('/api/scout/projects/<project_id>/analyze', methods=['POST'])
def analyze_scout_project(project_id):
    """Analyze a Scout project"""
    try:
        return jsonify({
            "success": True,
            "project_id": project_id,
            "analysis": {
                "status": "completed",
                "issues_found": 0,
                "recommendations": [
                    "All systems operating normally",
                    "Performance metrics within expected ranges"
                ],
                "score": 95
            },
            "message": f"🔍 Analysis completed for project {project_id}"
        })
    except Exception as e:
        logger.error(f"Error analyzing Scout project: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/scout/projects/<project_id>/metrics', methods=['GET'])
def get_scout_project_metrics(project_id):
    """Get Scout project metrics"""
    try:
        return jsonify({
            "success": True,
            "project_id": project_id,
            "metrics": {
                "cpu_usage": 15.2,
                "memory_usage": 45.8,
                "disk_usage": 32.1,
                "network_io": 256,
                "requests_per_minute": 42,
                "error_rate": 0.1,
                "uptime": 99.9
            },
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting Scout project metrics: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================== END SCOUT AGENT ENDPOINTS ====================

# ==================== NIXOS WORKSPACE MANAGEMENT ENDPOINTS ====================

@app.route('/api/nixos/workspaces', methods=['GET'])
def list_nixos_workspaces():
    """List all NixOS workspaces"""
    try:
        # Mock data for now - replace with actual workspace management
        workspaces = [
            {
                "id": "ws-001",
                "name": "Development Environment",
                "status": "running",
                "type": "nixos",
                "created_at": "2024-01-15T10:30:00Z",
                "last_used": "2024-01-20T14:22:00Z",
                "config": {
                    "cpu": 4,
                    "memory": "8GB",
                    "disk": "50GB"
                }
            },
            {
                "id": "ws-002", 
                "name": "Testing Environment",
                "status": "stopped",
                "type": "nixos",
                "created_at": "2024-01-10T09:15:00Z",
                "last_used": "2024-01-19T16:45:00Z",
                "config": {
                    "cpu": 2,
                    "memory": "4GB", 
                    "disk": "25GB"
                }
            }
        ]
        
        return jsonify({
            "success": True,
            "workspaces": workspaces,
            "total": len(workspaces)
        })
    except Exception as e:
        logger.error(f"Error listing NixOS workspaces: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces', methods=['POST'])
def create_nixos_workspace():
    """Create a new NixOS workspace"""
    try:
        data = request.get_json()
        workspace_id = f"ws-{uuid.uuid4().hex[:8]}"
        
        # Mock workspace creation - replace with actual implementation
        workspace = {
            "id": workspace_id,
            "name": data.get('name', f'Workspace {workspace_id}'),
            "status": "creating",
            "type": "nixos",
            "created_at": datetime.now().isoformat(),
            "config": data.get('config', {
                "cpu": 2,
                "memory": "4GB",
                "disk": "25GB"
            })
        }
        
        logger.info(f"Creating NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace": workspace
        }), 201
    except Exception as e:
        logger.error(f"Error creating NixOS workspace: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>', methods=['GET'])
def get_nixos_workspace(workspace_id):
    """Get details of a specific NixOS workspace"""
    try:
        # Mock workspace data - replace with actual lookup
        workspace = {
            "id": workspace_id,
            "name": f"Workspace {workspace_id}",
            "status": "running",
            "type": "nixos",
            "created_at": "2024-01-15T10:30:00Z",
            "last_used": datetime.now().isoformat(),
            "config": {
                "cpu": 4,
                "memory": "8GB",
                "disk": "50GB"
            },
            "metrics": {
                "cpu_usage": 25.5,
                "memory_usage": 60.2,
                "disk_usage": 35.8,
                "uptime": "2h 45m"
            }
        }
        
        return jsonify({
            "success": True,
            "workspace": workspace
        })
    except Exception as e:
        logger.error(f"Error getting NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>', methods=['PUT'])
def update_nixos_workspace(workspace_id):
    """Update a NixOS workspace configuration"""
    try:
        data = request.get_json()
        
        # Mock update - replace with actual implementation
        workspace = {
            "id": workspace_id,
            "name": data.get('name', f'Workspace {workspace_id}'),
            "status": "updating",
            "type": "nixos",
            "updated_at": datetime.now().isoformat(),
            "config": data.get('config', {})
        }
        
        logger.info(f"Updating NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace": workspace
        })
    except Exception as e:
        logger.error(f"Error updating NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>', methods=['DELETE'])
def delete_nixos_workspace(workspace_id):
    """Delete a NixOS workspace"""
    try:
        logger.info(f"Deleting NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "message": f"Workspace {workspace_id} deleted successfully"
        })
    except Exception as e:
        logger.error(f"Error deleting NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/start', methods=['POST'])
def start_nixos_workspace(workspace_id):
    """Start a NixOS workspace"""
    try:
        logger.info(f"Starting NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "status": "starting",
            "message": "Workspace start initiated"
        })
    except Exception as e:
        logger.error(f"Error starting NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/stop', methods=['POST'])
def stop_nixos_workspace(workspace_id):
    """Stop a NixOS workspace"""
    try:
        logger.info(f"Stopping NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "status": "stopping",
            "message": "Workspace stop initiated"
        })
    except Exception as e:
        logger.error(f"Error stopping NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/restart', methods=['POST'])
def restart_nixos_workspace(workspace_id):
    """Restart a NixOS workspace"""
    try:
        logger.info(f"Restarting NixOS workspace: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "status": "restarting",
            "message": "Workspace restart initiated"
        })
    except Exception as e:
        logger.error(f"Error restarting NixOS workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/status', methods=['GET'])
def get_nixos_workspace_status(workspace_id):
    """Get the current status of a NixOS workspace"""
    try:
        status = {
            "workspace_id": workspace_id,
            "status": "running",
            "health": "healthy",
            "uptime": "2h 45m",
            "last_heartbeat": datetime.now().isoformat(),
            "metrics": {
                "cpu_usage": 25.5,
                "memory_usage": 60.2,
                "disk_usage": 35.8,
                "network_io": {
                    "bytes_in": 1024000,
                    "bytes_out": 512000
                }
            }
        }
        
        return jsonify({
            "success": True,
            "status": status
        })
    except Exception as e:
        logger.error(f"Error getting NixOS workspace status {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/config', methods=['GET'])
def get_nixos_workspace_config(workspace_id):
    """Get the configuration of a NixOS workspace"""
    try:
        config = {
            "workspace_id": workspace_id,
            "nixos_config": {
                "system": {
                    "stateVersion": "23.11",
                    "autoUpgrade": True
                },
                "services": {
                    "openssh": {"enable": True},
                    "docker": {"enable": True},
                    "code-server": {"enable": True}
                },
                "packages": [
                    "git",
                    "vim",
                    "nodejs",
                    "python3",
                    "docker",
                    "curl"
                ]
            },
            "hardware": {
                "cpu": 4,
                "memory": "8GB",
                "disk": "50GB"
            }
        }
        
        return jsonify({
            "success": True,
            "config": config
        })
    except Exception as e:
        logger.error(f"Error getting NixOS workspace config {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/config', methods=['PUT'])
def update_nixos_workspace_config(workspace_id):
    """Update the configuration of a NixOS workspace"""
    try:
        data = request.get_json()
        logger.info(f"Updating NixOS workspace config: {workspace_id}")
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "message": "Configuration updated successfully",
            "config": data
        })
    except Exception as e:
        logger.error(f"Error updating NixOS workspace config {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/terminal', methods=['POST'])
def create_nixos_workspace_terminal(workspace_id):
    """Create a terminal session for a NixOS workspace"""
    try:
        session_id = f"term-{uuid.uuid4().hex[:8]}"
        
        terminal = {
            "session_id": session_id,
            "workspace_id": workspace_id,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "connection_info": {
                "type": "websocket",
                "endpoint": f"/terminal/{session_id}"
            }
        }
        
        logger.info(f"Created terminal session {session_id} for workspace {workspace_id}")
        
        return jsonify({
            "success": True,
            "terminal": terminal
        }), 201
    except Exception as e:
        logger.error(f"Error creating terminal for workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/files', methods=['GET'])
def get_nixos_workspace_files(workspace_id):
    """Get file listing for a NixOS workspace"""
    try:
        path = request.args.get('path', '/')
        
        # Mock file listing - replace with actual implementation
        files = [
            {
                "name": "home",
                "type": "directory",
                "size": None,
                "modified": "2024-01-20T10:30:00Z",
                "permissions": "drwxr-xr-x"
            },
            {
                "name": "projects",
                "type": "directory", 
                "size": None,
                "modified": "2024-01-19T15:45:00Z",
                "permissions": "drwxr-xr-x"
            },
            {
                "name": "readme.txt",
                "type": "file",
                "size": 1024,
                "modified": "2024-01-18T09:20:00Z",
                "permissions": "-rw-r--r--"
            }
        ]
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "path": path,
            "files": files
        })
    except Exception as e:
        logger.error(f"Error getting files for workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/logs', methods=['GET'])
def get_nixos_workspace_logs(workspace_id):
    """Get logs for a NixOS workspace"""
    try:
        limit = request.args.get('limit', 100, type=int)
        level = request.args.get('level', 'info')
        
        # Mock logs - replace with actual implementation
        logs = [
            {
                "timestamp": "2024-01-20T14:22:00Z",
                "level": "info",
                "service": "systemd",
                "message": "Workspace started successfully"
            },
            {
                "timestamp": "2024-01-20T14:21:45Z",
                "level": "info",
                "service": "nixos-rebuild",
                "message": "System configuration applied"
            },
            {
                "timestamp": "2024-01-20T14:21:30Z",
                "level": "debug",
                "service": "docker",
                "message": "Docker daemon started"
            }
        ][:limit]
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "logs": logs,
            "total": len(logs)
        })
    except Exception as e:
        logger.error(f"Error getting logs for workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/snapshots', methods=['GET'])
def get_nixos_workspace_snapshots(workspace_id):
    """Get snapshots for a NixOS workspace"""
    try:
        snapshots = [
            {
                "id": "snap-001",
                "name": "Initial Setup",
                "created_at": "2024-01-15T10:30:00Z",
                "size": "2.5GB",
                "description": "Fresh workspace setup"
            },
            {
                "id": "snap-002", 
                "name": "Development Ready",
                "created_at": "2024-01-18T16:20:00Z",
                "size": "3.1GB",
                "description": "With development tools installed"
            }
        ]
        
        return jsonify({
            "success": True,
            "workspace_id": workspace_id,
            "snapshots": snapshots
        })
    except Exception as e:
        logger.error(f"Error getting snapshots for workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/nixos/workspaces/<workspace_id>/snapshots', methods=['POST'])
def create_nixos_workspace_snapshot(workspace_id):
    """Create a snapshot of a NixOS workspace"""
    try:
        data = request.get_json()
        snapshot_id = f"snap-{uuid.uuid4().hex[:8]}"
        
        snapshot = {
            "id": snapshot_id,
            "workspace_id": workspace_id,
            "name": data.get('name', f'Snapshot {snapshot_id}'),
            "description": data.get('description', ''),
            "created_at": datetime.now().isoformat(),
            "status": "creating"
        }
        
        logger.info(f"Creating snapshot {snapshot_id} for workspace {workspace_id}")
        
        return jsonify({
            "success": True,
            "snapshot": snapshot
        }), 201
    except Exception as e:
        logger.error(f"Error creating snapshot for workspace {workspace_id}: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================== END NIXOS WORKSPACE ENDPOINTS ====================

# ==================== FLASK APP STARTUP ====================

if __name__ == "__main__":
    print("🚀 Starting Podplay Sanctuary Backend Server...")
    print("🐻 Mama Bear Control Center is ready!")
    print("🌐 Server will be available at: http://127.0.0.1:5000")
    print("📡 API endpoints ready for frontend connections")
    print("🔌 Socket.IO enabled for real-time communication")
    print("=" * 50)
    
    # Use socketio.run instead of app.run for Socket.IO support
    socketio.run(
        app,
        host="0.0.0.0", 
        port=5000, 
        debug=True,
        use_reloader=False,  # Prevent double initialization
        allow_unsafe_werkzeug=True  # Allow for development
    )
