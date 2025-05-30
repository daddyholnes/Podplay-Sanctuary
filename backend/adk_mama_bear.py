#!/usr/bin/env python3
"""
ADK-Based Mama Bear Agent with Dynamic Model Switching
Robust AI agent using Google Agent Development Kit with fallback model priority queue

Priority Queue: Gemini 2.5-05-06 → 04-17 → Claude 4 Sonnet via Vertex → Anthropic → 
              Claude 3.7 Vertex → Anthropic → 2.5s with Vertex → Anthropic → 
              Gemini 2.0s and 1.5s
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from dataclasses import dataclass, asdict
from enum import Enum
import traceback

# ADK Imports
try:
    from google_adk import Agent, Tool, Workflow, SequentialWorkflow, ParallelWorkflow
    from google_adk.models import VertexAIModel, AnthropicModel
    from google_adk.tools import SearchTool, CodeExecutionTool
    ADK_AVAILABLE = True
except ImportError:
    ADK_AVAILABLE = False
    logging.warning("Google ADK not available - falling back to basic agent")

# MCP Integration
try:
    from fastmcp import FastMCPServer, FastMCPClient
    from mcp import McpServer, ServerSession
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    logging.warning("MCP not available - proceeding without MCP tools")

# Model Clients
try:
    import vertexai
    from vertexai.generative_models import GenerativeModel
    VERTEX_AVAILABLE = True
except ImportError:
    VERTEX_AVAILABLE = False

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Docker Integration
try:
    import docker
    DOCKER_AVAILABLE = True
except ImportError:
    DOCKER_AVAILABLE = False

logger = logging.getLogger(__name__)

@dataclass
class ModelConfig:
    """Configuration for individual AI models"""
    name: str
    provider: str  # vertex, anthropic, openai
    model_id: str
    max_tokens: int = 4096
    temperature: float = 0.7
    quota_limit: int = 1000  # requests per hour
    current_usage: int = 0
    last_reset: datetime = None
    available: bool = True
    priority: int = 0  # Lower numbers = higher priority
    
    # Task specialization capabilities
    best_for: List[str] = None  # e.g., ["coding", "research", "multimodal"]
    context_window: int = 128000  # Maximum context window
    supports_function_calling: bool = False
    supports_vision: bool = False
    cost_per_1k_tokens: float = 0.01

@dataclass 
class TaskProfile:
    """Profile for different types of tasks to determine optimal model"""
    task_type: str
    required_capabilities: List[str]
    context_size_requirement: str  # "small", "medium", "large"
    speed_requirement: str  # "fast", "medium", "thorough" 
    cost_sensitivity: str  # "low", "medium", "high"
    preferred_models: List[str] = None

class ModelProvider(Enum):
    """Supported model providers"""
    VERTEX = "vertex"
    ANTHROPIC = "anthropic"
    OPENAI = "openai"

class ADKMamaBearAgent:
    """
    Robust Mama Bear agent using Google ADK with dynamic model switching capability.
    
    Features:
    - Dynamic model fallback system
    - MCP tool orchestration
    - Docker VM management
    - Persistent memory with Mem0
    - Proactive discovery and assistance
    """
    
    def __init__(self):
        self.name = "Mama Bear Gem"
        self.version = "2.0.0-ADK"
        self.models = self._initialize_model_queue()
        self.current_model_index = 0
        self.mcp_servers = {}
        self.docker_client = None
        self.memory_client = None
        self.active_sessions = {}
        
        # Initialize components
        self._initialize_docker()
        self._initialize_memory()
        self._initialize_mcp_servers()
        
        logger.info(f"🐻 {self.name} v{self.version} initialized with ADK")
    
    def _initialize_model_queue(self) -> List[ModelConfig]:
        """Initialize the priority queue of AI models with task specialization"""
        models = [
            # Tier 1: GPT-4o (Best all-rounder)
            ModelConfig(
                name="GPT-4o",
                provider=ModelProvider.OPENAI.value,
                model_id="gpt-4o",
                priority=1,
                quota_limit=5000,
                max_tokens=4096,
                context_window=128000,
                supports_function_calling=True,
                supports_vision=True,
                best_for=["coding", "reasoning", "research", "creative_writing", "function_calling"],
                cost_per_1k_tokens=0.005
            ),
            
            # Tier 2: Claude 3 Opus (Deep analysis and long context)
            ModelConfig(
                name="Claude 3 Opus",
                provider=ModelProvider.ANTHROPIC.value,
                model_id="claude-3-opus-20240229",
                priority=2,
                quota_limit=2000,
                max_tokens=4096,
                context_window=200000,
                supports_function_calling=True,
                best_for=["deep_analysis", "long_context", "research", "planning", "document_analysis"],
                cost_per_1k_tokens=0.015
            ),
            
            # Tier 3: Gemini 1.5 Pro (Multimodal and Google integration)
            ModelConfig(
                name="Gemini 1.5 Pro",
                provider=ModelProvider.VERTEX.value,
                model_id="gemini-1.5-pro-latest",
                priority=3,
                quota_limit=3000,
                max_tokens=8192,
                context_window=1000000,
                supports_function_calling=True,
                supports_vision=True,
                best_for=["multimodal", "google_integration", "large_context", "code", "research"],
                cost_per_1k_tokens=0.0035
            ),
            
            # Tier 4: Claude 3.5 Sonnet (Fast and accurate)
            ModelConfig(
                name="Claude 3.5 Sonnet",
                provider=ModelProvider.ANTHROPIC.value,
                model_id="claude-3-5-sonnet-20241022",
                priority=4,
                quota_limit=4000,
                max_tokens=4096,
                context_window=200000,
                supports_function_calling=True,
                best_for=["coding", "chat", "lightweight_research", "fast_analysis"],
                cost_per_1k_tokens=0.003
            ),
            
            # Tier 5: GPT-4 Turbo (Cost-effective alternative)
            ModelConfig(
                name="GPT-4 Turbo",
                provider=ModelProvider.OPENAI.value,
                model_id="gpt-4-turbo",
                priority=5,
                quota_limit=4000,
                max_tokens=4096,
                context_window=128000,
                supports_function_calling=True,
                supports_vision=True,
                best_for=["general_chat", "coding", "planning", "cost_effective"],
                cost_per_1k_tokens=0.001
            ),
            
            # Tier 6: Gemini 1.5 Flash (Fast summaries)
            ModelConfig(
                name="Gemini 1.5 Flash",
                provider=ModelProvider.VERTEX.value,
                model_id="gemini-1.5-flash-latest",
                priority=6,
                quota_limit=8000,
                max_tokens=2048,
                context_window=1000000,
                supports_function_calling=True,
                supports_vision=True,
                best_for=["summaries", "simple_tasks", "lightweight_chat", "fast_response"],
                cost_per_1k_tokens=0.00035
            ),
            
            # Tier 7: Claude 3 Haiku (Fastest for simple tasks)
            ModelConfig(
                name="Claude 3 Haiku",
                provider=ModelProvider.ANTHROPIC.value,
                model_id="claude-3-haiku-20240307",
                priority=7,
                quota_limit=10000,
                max_tokens=2048,
                context_window=200000,
                supports_function_calling=False,
                best_for=["simple_qa", "chat", "summarization", "fastest_response"],
                cost_per_1k_tokens=0.00025
            ),
            
            # Backup: Latest Gemini Models
            ModelConfig(
                name="Gemini 2.0 Flash",
                provider=ModelProvider.VERTEX.value,
                model_id="gemini-2.0-flash-exp",
                priority=8,
                quota_limit=2000,
                max_tokens=8192,
                context_window=1000000,
                supports_function_calling=True,
                supports_vision=True,
                best_for=["experimental", "advanced_reasoning", "multimodal"],
                cost_per_1k_tokens=0.0035            )
        ]
        
        # Initialize task profiles for intelligent model selection
        self.task_profiles = {
            "coding": TaskProfile(
                task_type="coding",
                required_capabilities=["function_calling", "code_analysis"],
                context_size_requirement="medium",
                speed_requirement="medium",
                cost_sensitivity="medium",
                preferred_models=["GPT-4o", "Claude 3.5 Sonnet", "Gemini 1.5 Pro"]
            ),
            "research": TaskProfile(
                task_type="research",
                required_capabilities=["long_context", "reasoning"],
                context_size_requirement="large",
                speed_requirement="thorough",
                cost_sensitivity="low",
                preferred_models=["Claude 3 Opus", "GPT-4o", "Gemini 1.5 Pro"]
            ),
            "chat": TaskProfile(
                task_type="chat",
                required_capabilities=["conversational"],
                context_size_requirement="small",
                speed_requirement="fast",
                cost_sensitivity="high",
                preferred_models=["Claude 3.5 Sonnet", "GPT-4 Turbo", "Gemini 1.5 Flash"]
            ),
            "analysis": TaskProfile(
                task_type="analysis",
                required_capabilities=["reasoning", "long_context"],
                context_size_requirement="large",
                speed_requirement="thorough",
                cost_sensitivity="medium",
                preferred_models=["Claude 3 Opus", "GPT-4o", "Claude 3.5 Sonnet"]
            ),
            "summarization": TaskProfile(
                task_type="summarization",
                required_capabilities=["fast_processing"],
                context_size_requirement="medium",
                speed_requirement="fast",
                cost_sensitivity="high",
                preferred_models=["Gemini 1.5 Flash", "Claude 3 Haiku", "GPT-4 Turbo"]
            ),
            "multimodal": TaskProfile(
                task_type="multimodal",
                required_capabilities=["vision", "multimodal"],
                context_size_requirement="medium",
                speed_requirement="medium",
                cost_sensitivity="medium",
                preferred_models=["GPT-4o", "Gemini 1.5 Pro", "Gemini 1.5 Flash"]
            ),
            "planning": TaskProfile(
                task_type="planning",
                required_capabilities=["reasoning", "function_calling"],
                context_size_requirement="medium",
                speed_requirement="medium",
                cost_sensitivity="medium",
                preferred_models=["GPT-4o", "Claude 3 Opus", "Claude 3.5 Sonnet"]
            )
        }
        
        # Sort models by priority and initialize availability
        models.sort(key=lambda x: x.priority)
        
        # Initialize model clients
        self._initialize_model_clients(models)
        
        return models
    
    def _initialize_model_clients(self, models: List[ModelConfig]):
        """Initialize API clients for different model providers"""
        self.model_clients = {}
        
        # Initialize OpenAI client
        if OPENAI_AVAILABLE:
            try:
                openai_api_key = os.getenv('OPENAI_API_KEY')
                if openai_api_key:
                    self.model_clients['openai'] = OpenAI(api_key=openai_api_key)
                    logger.info("🔑 OpenAI client initialized")
                else:
                    logger.warning("OpenAI API key not found")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
        
        # Initialize Anthropic client
        if ANTHROPIC_AVAILABLE:
            try:
                anthropic_api_key = os.getenv('ANTHROPIC_API_KEY')
                if anthropic_api_key:
                    self.model_clients['anthropic'] = Anthropic(api_key=anthropic_api_key)
                    logger.info("🔑 Anthropic client initialized")
                else:
                    logger.warning("Anthropic API key not found")
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")
        
        # Initialize Vertex AI
        if VERTEX_AVAILABLE:
            try:
                project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
                if project_id:
                    vertexai.init(project=project_id)
                    self.model_clients['vertex'] = True  # Mark as available
                    logger.info("🔑 Vertex AI client initialized")
                else:
                    logger.warning("Google Cloud project not configured")
            except Exception as e:
                logger.error(f"Failed to initialize Vertex AI: {e}")
    
    def _initialize_docker(self):
        """Initialize Docker client for VM management"""
        try:
            if DOCKER_AVAILABLE:
                self.docker_client = docker.from_env()
                # Test connection
                self.docker_client.ping()
                logger.info("🐳 Docker client initialized successfully")
            else:
                logger.warning("Docker not available - VM management disabled")
        except Exception as e:
            logger.error(f"Failed to initialize Docker: {e}")
            self.docker_client = None
    
    def _initialize_memory(self):
        """Initialize Mem0 for persistent memory"""
        try:
            # Import mem0 if available
            try:
                from mem0 import Memory
                self.memory_client = Memory()
                logger.info("🧠 Mem0 memory client initialized")
            except ImportError:
                logger.warning("Mem0 not available - proceeding without persistent memory")
                self.memory_client = None
        except Exception as e:
            logger.error(f"Failed to initialize memory: {e}")
            self.memory_client = None
    
    def _initialize_mcp_servers(self):
        """Initialize MCP servers for tool orchestration"""
        try:
            if MCP_AVAILABLE:
                # Initialize core MCP tools
                self.mcp_servers = {
                    "filesystem": None,  # Will be initialized on demand
                    "web_search": None,   # Will be initialized on demand
                    "code_execution": None  # Will be initialized on demand
                }
                logger.info("🔧 MCP server framework initialized")
            else:
                logger.warning("MCP not available - tool orchestration disabled")
                self.mcp_servers = {}
        except Exception as e:
            logger.error(f"Failed to initialize MCP servers: {e}")
            self.mcp_servers = {}
    
    async def get_system_info(self) -> Dict[str, Any]:
        """Get comprehensive system information"""
        try:
            return {
                "agent_name": self.name,
                "agent_version": self.version,
                "model_status": self.get_model_status(),
                "docker_available": self.docker_client is not None,
                "memory_available": self.memory_client is not None,
                "mcp_available": len(self.mcp_servers) > 0,
                "capabilities": {
                    "dynamic_model_switching": True,
                    "workflow_orchestration": True,
                    "multi_model_execution": True,
                    "intelligent_task_routing": True,
                    "persistent_memory": self.memory_client is not None,
                    "docker_vm_management": self.docker_client is not None,
                    "mcp_tool_orchestration": len(self.mcp_servers) > 0
                },
                "supported_task_types": list(self.task_profiles.keys()),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting system info: {e}")
            return {
                "error": str(e),
                "agent_name": self.name,
                "agent_version": self.version
            }


# Example usage and testing
if __name__ == "__main__":
    async def test_adk_mama_bear():
        """Test the ADK Mama Bear agent"""
        try:
            # Initialize agent
            agent = ADKMamaBearAgent()
            
            # Test model status
            print("=== Model Status ===")
            status = agent.get_model_status()
            print(json.dumps(status, indent=2))
            
            # Test simple chat
            print("\n=== Simple Chat Test ===")
            simple_response = await agent.mama_bear_chat(
                message="Hello Mama Bear! How are you today?",
                user_id="test_user"
            )
            print(json.dumps(simple_response, indent=2))
            
            # Test workflow with complex request
            print("\n=== Workflow Test ===")
            complex_response = await agent.mama_bear_chat(
                message="Research and analyze the benefits of using multiple AI models in a single application, then provide recommendations for implementation",
                user_id="test_user"
            )
            print(json.dumps(complex_response, indent=2))
            
            # Test system info
            print("\n=== System Info ===")
            system_info = await agent.get_system_info()
            print(json.dumps(system_info, indent=2))
            
        except Exception as e:
            print(f"Test failed: {e}")
            traceback.print_exc()
    
    # Run test
    import asyncio
    asyncio.run(test_adk_mama_bear())
