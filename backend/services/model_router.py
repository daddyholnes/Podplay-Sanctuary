"""
Model Router
Intelligently routes requests to appropriate models based on cost, availability, and capability
"""
import os
import json
import time
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple

from google.cloud import aiplatform
from utils.logging_setup import get_logger
from vertexai.generative_models import GenerativeModel

logger = get_logger(__name__)

class ModelConfig:
    """Configuration for a specific model"""
    
    def __init__(self, name: str, provider: str, version: str, billing_account: str, 
                 cost_per_1k_tokens: float, capabilities: List[str], max_input_tokens: int,
                 max_output_tokens: int, api_key_env: str = None, project_id: str = None):
        self.name = name
        self.provider = provider  # 'gemini', 'claude', 'openai'
        self.version = version
        self.billing_account = billing_account
        self.cost_per_1k_tokens = cost_per_1k_tokens
        self.capabilities = capabilities
        self.max_input_tokens = max_input_tokens
        self.max_output_tokens = max_output_tokens
        self.api_key_env = api_key_env
        self.project_id = project_id
        
        # Runtime properties
        self.available = True
        self.quota_reset_time = None
        self.error_count = 0
        self.last_error_time = None
        self.total_tokens_used = 0
        self.request_count = 0
        
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        return {
            'name': self.name,
            'provider': self.provider,
            'version': self.version,
            'billing_account': self.billing_account,
            'cost_per_1k_tokens': self.cost_per_1k_tokens,
            'capabilities': self.capabilities,
            'max_input_tokens': self.max_input_tokens,
            'max_output_tokens': self.max_output_tokens,
            'available': self.available,
            'quota_reset_time': self.quota_reset_time.isoformat() if self.quota_reset_time else None,
            'error_count': self.error_count,
            'total_tokens_used': self.total_tokens_used,
            'request_count': self.request_count
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'ModelConfig':
        """Create from dictionary"""
        model = cls(
            name=data['name'],
            provider=data['provider'],
            version=data['version'],
            billing_account=data['billing_account'],
            cost_per_1k_tokens=data['cost_per_1k_tokens'],
            capabilities=data['capabilities'],
            max_input_tokens=data['max_input_tokens'],
            max_output_tokens=data['max_output_tokens'],
            api_key_env=data.get('api_key_env'),
            project_id=data.get('project_id')
        )
        
        model.available = data.get('available', True)
        if data.get('quota_reset_time'):
            model.quota_reset_time = datetime.fromisoformat(data['quota_reset_time'])
        model.error_count = data.get('error_count', 0)
        model.total_tokens_used = data.get('total_tokens_used', 0)
        model.request_count = data.get('request_count', 0)
        
        return model


class NoModelsAvailableError(Exception):
    """Raised when no models are available to process a request"""
    pass


class ModelRouter:
    """Intelligently routes requests to the most appropriate model"""
    
    def __init__(self):
        self.models: Dict[str, ModelConfig] = {}
        self.model_clients: Dict[str, Any] = {}
        self.default_model = None
        self.usage_stats = {
            'total_tokens': 0,
            'total_cost': 0.0,
            'requests_served': 0,
            'errors': 0
        }
        self.load_models_from_env()
        logger.info(f"🔀 Model Router initialized with {len(self.models)} models")
    
    def load_models_from_env(self):
        """Load model configurations from environment variables or config file"""
        try:
            # Check for config file first
            config_path = os.environ.get('MODEL_CONFIG_PATH', 'config/model_config.json')
            
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    
                for model_config in config.get('models', []):
                    model = ModelConfig.from_dict(model_config)
                    self.models[model.name] = model
                    
                self.default_model = config.get('default_model')
            else:
                # Fall back to environment variables
                self._configure_default_models()
                
            # Initialize model clients
            self._initialize_model_clients()
                
        except Exception as e:
            logger.error(f"Error loading model configuration: {e}")
            # Set up minimal default configuration
            self._configure_default_models()
    
    def _configure_default_models(self):
        """Configure default models based on environment variables"""
        # Gemini 2.0 Flash-Lite (cheapest)
        self.models["gemini-2-flash-lite"] = ModelConfig(
            name="gemini-2-flash-lite",
            provider="gemini",
            version="2.0-flash-lite",
            billing_account="primary",
            cost_per_1k_tokens=0.075,
            capabilities=["chat", "tool_use", "vision"],
            max_input_tokens=12000,
            max_output_tokens=8000,
            api_key_env="GEMINI_API_KEY",
            project_id=os.environ.get("GOOGLE_CLOUD_PROJECT")
        )
        
        # Gemini 2.0 Flash (balanced)
        self.models["gemini-2-flash"] = ModelConfig(
            name="gemini-2-flash",
            provider="gemini",
            version="2.0-flash",
            billing_account="primary",
            cost_per_1k_tokens=0.075,
            capabilities=["chat", "tool_use", "vision", "code"],
            max_input_tokens=24000,
            max_output_tokens=12000,
            api_key_env="GEMINI_API_KEY",
            project_id=os.environ.get("GOOGLE_CLOUD_PROJECT")
        )
        
        # Gemini 2.5 Flash (enhanced reasoning)
        self.models["gemini-2.5-flash"] = ModelConfig(
            name="gemini-2.5-flash",
            provider="gemini",
            version="2.5-flash",
            billing_account="secondary",
            cost_per_1k_tokens=0.13,
            capabilities=["chat", "tool_use", "vision", "code", "reasoning"],
            max_input_tokens=32000,
            max_output_tokens=16000,
            api_key_env="GEMINI_API_KEY_SECONDARY",
            project_id=os.environ.get("GOOGLE_CLOUD_PROJECT_SECONDARY")
        )
        
        # Gemini 2.5 Pro (most advanced)
        self.models["gemini-2.5-pro"] = ModelConfig(
            name="gemini-2.5-pro",
            provider="gemini",
            version="2.5-pro",
            billing_account="enterprise",
            cost_per_1k_tokens=0.35,
            capabilities=["chat", "tool_use", "vision", "code", "reasoning", "planning"],
            max_input_tokens=64000,
            max_output_tokens=32000,
            api_key_env="GEMINI_API_KEY_ENTERPRISE",
            project_id=os.environ.get("GOOGLE_CLOUD_PROJECT_ENTERPRISE")
        )
        
        # Set default model
        self.default_model = "gemini-2-flash-lite"
    
    def _initialize_model_clients(self):
        """Initialize API clients for each model"""
        for model_name, model_config in self.models.items():
            try:
                if model_config.provider == "gemini":
                    # Set up Gemini client
                    if model_config.api_key_env and os.environ.get(model_config.api_key_env):
                        # API key-based authentication
                        api_key = os.environ.get(model_config.api_key_env)
                        self.model_clients[model_name] = self._init_gemini_client(
                            model_config.version, api_key
                        )
                    elif model_config.project_id:
                        # Service account-based authentication
                        self.model_clients[model_name] = self._init_gemini_client_with_service_account(
                            model_config.version, model_config.project_id
                        )
                    else:
                        logger.warning(f"No authentication for model {model_name}")
                        model_config.available = False
                
                # Add other providers like Claude, OpenAI as needed
                
            except Exception as e:
                logger.error(f"Error initializing client for {model_name}: {e}")
                model_config.available = False
                model_config.error_count += 1
    
    def _init_gemini_client(self, version: str, api_key: str) -> Any:
        """Initialize Gemini client with API key"""
        # Map version to actual model name
        model_name_map = {
            "2.0-flash-lite": "gemini-2.0-flash-lite",
            "2.0-flash": "gemini-2.0-flash",
            "2.5-flash": "gemini-2.5-flash",
            "2.5-pro": "gemini-2.5-pro"
        }
        
        gemini_model_name = model_name_map.get(version, version)
        
        # Initialize with API key
        return GenerativeModel(gemini_model_name, api_key=api_key)
    
    def _init_gemini_client_with_service_account(self, version: str, project_id: str) -> Any:
        """Initialize Gemini client with service account"""
        # Map version to actual model name
        model_name_map = {
            "2.0-flash-lite": "gemini-2.0-flash-lite",
            "2.0-flash": "gemini-2.0-flash",
            "2.5-flash": "gemini-2.5-flash",
            "2.5-pro": "gemini-2.5-pro"
        }
        
        gemini_model_name = model_name_map.get(version, version)
        
        # Initialize with service account
        aiplatform.init(project=project_id)
        return GenerativeModel(gemini_model_name)
    
    async def select_model_for_request(self, agent_type: str, complexity: str, urgency: str = "normal") -> Tuple[ModelConfig, Any]:
        """
        Select the most appropriate model for a request based on multiple factors
        Returns (model_config, model_client) tuple
        """
        # Get available models
        available_models = [m for m in self.models.values() if m.available]
        
        if not available_models:
            raise NoModelsAvailableError("All models have reached quota limits or are unavailable")
        
        # Define preferred models for each agent type
        agent_model_preferences = {
            "main_chat": ["gemini-2-flash-lite", "gemini-2-flash", "gemini-2.5-flash"],
            "scout": ["gemini-2-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
            "dev_workspace": ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2-flash"],
            "mcp": ["gemini-2-flash", "gemini-2-flash-lite", "gemini-2.5-flash"]
        }
        
        # Get preferred models for this agent type
        preferred_models = agent_model_preferences.get(agent_type, [self.default_model])
        
        # Adjust based on complexity
        if complexity == "high" and agent_type in ["scout", "dev_workspace"]:
            # Move more capable models to the front
            if "gemini-2.5-pro" in preferred_models:
                preferred_models.remove("gemini-2.5-pro")
                preferred_models.insert(0, "gemini-2.5-pro")
        
        # Try preferred models in order
        for model_name in preferred_models:
            if model_name in self.models and self.models[model_name].available:
                model = self.models[model_name]
                client = self.model_clients.get(model_name)
                
                if client:
                    return model, client
        
        # Fall back to any available model if preferred ones aren't available
        for model_name, model in self.models.items():
            if model.available and model_name in self.model_clients:
                return model, self.model_clients[model_name]
        
        # If we got here, no model with a client is available
        raise NoModelsAvailableError("No models with initialized clients are available")
    
    async def process_request(self, agent_type: str, prompt: str, complexity: str = "medium", 
                             urgency: str = "normal", tools: List[Dict] = None) -> Dict:
        """
        Process a request using the most appropriate model
        Returns the model response
        """
        start_time = time.time()
        
        try:
            # Select model
            model, client = await self.select_model_for_request(agent_type, complexity, urgency)
            
            logger.info(f"Selected model {model.name} for {agent_type} request")
            
            # Process with selected model
            if model.provider == "gemini":
                response = await self._process_with_gemini(client, prompt, tools, model)
            # Add other providers as needed
            else:
                raise ValueError(f"Unsupported provider: {model.provider}")
            
            # Update usage statistics
            self._update_usage_stats(model, response.get("usage", {}), start_time)
            
            return {
                "content": response.get("content", ""),
                "model_used": model.name,
                "usage": response.get("usage", {}),
                "processing_time": time.time() - start_time
            }
            
        except NoModelsAvailableError as e:
            logger.error(f"No models available: {e}")
            self.usage_stats["errors"] += 1
            return {
                "error": str(e),
                "model_used": None,
                "processing_time": time.time() - start_time
            }
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            self.usage_stats["errors"] += 1
            return {
                "error": f"Failed to process request: {str(e)}",
                "model_used": None,
                "processing_time": time.time() - start_time
            }
    
    async def _process_with_gemini(self, client, prompt: str, tools: List[Dict] = None, model: ModelConfig = None) -> Dict:
        """Process a request using Gemini"""
        try:
            # Format prompt for Gemini
            chat = client.start_chat()
            
            # Add tools if provided
            if tools:
                response = await chat.send_message_async(
                    prompt,
                    tools=tools
                )
            else:
                response = await chat.send_message_async(prompt)
            
            # Extract token usage (estimated until Gemini provides actual counts)
            token_estimate = len(prompt.split()) + len(response.text.split())
            token_usage = {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response.text.split()),
                "total_tokens": token_estimate
            }
            
            # Update model usage
            if model:
                model.total_tokens_used += token_estimate
                model.request_count += 1
            
            return {
                "content": response.text,
                "usage": token_usage
            }
            
        except Exception as e:
            logger.error(f"Gemini processing error: {e}")
            
            # Update model error stats
            if model:
                model.error_count += 1
                model.last_error_time = datetime.now()
                
                # If too many errors, mark as unavailable temporarily
                if model.error_count >= 5:
                    model.available = False
                    model.quota_reset_time = datetime.now() + timedelta(minutes=5)
                    logger.warning(f"Marked {model.name} as unavailable due to errors")
            
            raise
    
    def _update_usage_stats(self, model: ModelConfig, usage: Dict, start_time: float) -> None:
        """Update usage statistics"""
        tokens = usage.get("total_tokens", 0)
        cost = (tokens / 1000) * model.cost_per_1k_tokens
        
        # Update global stats
        self.usage_stats["total_tokens"] += tokens
        self.usage_stats["total_cost"] += cost
        self.usage_stats["requests_served"] += 1
        
        # Update model stats
        model.total_tokens_used += tokens
        model.request_count += 1
        
        # Log usage
        processing_time = time.time() - start_time
        logger.info(f"Request processed with {model.name}: {tokens} tokens, ${cost:.4f}, {processing_time:.2f}s")
    
    def get_model_usage_stats(self) -> Dict:
        """Get current model usage statistics"""
        stats = {
            "global": self.usage_stats,
            "models": {}
        }
        
        for name, model in self.models.items():
            stats["models"][name] = {
                "total_tokens": model.total_tokens_used,
                "request_count": model.request_count,
                "error_count": model.error_count,
                "available": model.available,
                "cost_per_1k": model.cost_per_1k_tokens,
                "estimated_cost": (model.total_tokens_used / 1000) * model.cost_per_1k_tokens,
                "quota_reset_time": model.quota_reset_time.isoformat() if model.quota_reset_time else None
            }
        
        return stats
    
    def reset_quota_for_model(self, model_name: str) -> bool:
        """Reset quota for a specific model"""
        if model_name in self.models:
            model = self.models[model_name]
            model.available = True
            model.quota_reset_time = None
            model.error_count = 0
            logger.info(f"Reset quota for {model_name}")
            return True
        return False
    
    def get_model_by_name(self, name: str) -> Optional[Tuple[ModelConfig, Any]]:
        """Get a model by name"""
        if name in self.models and name in self.model_clients:
            return self.models[name], self.model_clients[name]
        return None
    
    def check_quotas(self) -> None:
        """Check and update quotas for all models"""
        now = datetime.now()
        
        for name, model in self.models.items():
            # Reset quota if reset time has passed
            if not model.available and model.quota_reset_time and now >= model.quota_reset_time:
                model.available = True
                model.quota_reset_time = None
                model.error_count = 0
                logger.info(f"Automatically reset quota for {name}")
                
            # Reset error count periodically
            if model.last_error_time and (now - model.last_error_time) > timedelta(hours=1):
                model.error_count = 0
                logger.info(f"Reset error count for {name}")
    
    async def run_quota_check_loop(self):
        """Run a continuous loop to check quotas"""
        while True:
            try:
                self.check_quotas()
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Error in quota check loop: {e}")
                await asyncio.sleep(60)  # Try again after a minute