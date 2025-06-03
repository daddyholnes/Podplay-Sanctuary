# 🔌 PodPlay Sanctuary Integration Guide

> **Comprehensive Developer Guide for Extending and Integrating with the PodPlay Sanctuary Agent Framework**

This guide provides detailed instructions for developers who want to extend the PodPlay Sanctuary framework, integrate external services, create custom agents, or build upon the existing infrastructure.

## 📋 Table of Contents

1. [Framework Architecture](#framework-architecture)
2. [Creating Custom Agents](#creating-custom-agents)
3. [MCP Server Integration](#mcp-server-integration)
4. [Model Integration](#model-integration)
5. [Socket.IO Real-Time Features](#socketio-real-time-features)
6. [API Blueprint Development](#api-blueprint-development)
7. [Database Integration](#database-integration)
8. [Frontend Integration](#frontend-integration)
9. [Service Extensions](#service-extensions)
10. [Advanced Patterns](#advanced-patterns)

## 🏗️ Framework Architecture

### Core Components Overview

The PodPlay Sanctuary framework is built on a modular architecture with clear separation of concerns:

```python
# Core Architecture Components
├── Agent Framework (services/agent_framework_enhanced.py)
├── Service Layer (services/)
├── API Layer (api/blueprints/)
├── Model Layer (models/)
├── Data Layer (data/)
└── Utils Layer (utils/)
```

### Dependency Injection Pattern

The framework uses dependency injection for clean service management:

```python
# services/service_initialization.py
def initialize_services(app: Flask) -> Dict[str, Any]:
    """Initialize all services with proper dependency injection"""
    services = {}
    
    # Services are initialized in dependency order
    services['marketplace_manager'] = _initialize_marketplace_manager(app)
    services['enhanced_mama'] = _initialize_enhanced_mama(app)
    services['discovery_agent'] = _initialize_discovery_agent(app)
    
    return services
```

## 🤖 Creating Custom Agents

### 1. Basic Agent Structure

Create a new agent by extending the base agent framework:

```python
# services/my_custom_agent.py
from typing import Dict, Any, Optional, List
from services.agent_framework_enhanced import AgentType, ModelProvider
from utils.logging_setup import get_logger

logger = get_logger(__name__)

class MyCustomAgent:
    """
    Custom agent for specialized tasks
    """
    
    def __init__(self, model_router=None):
        self.agent_type = AgentType.CUSTOM
        self.model_router = model_router
        self.capabilities = ['text_processing', 'analysis', 'automation']
        self.name = "MyCustomAgent"
        self.version = "1.0.0"
        
        logger.info(f"Initialized {self.name} v{self.version}")
    
    async def process_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main request processing method
        
        Args:
            request: Dictionary containing user request and context
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            # Extract request parameters
            message = request.get('message', '')
            context = request.get('context', {})
            user_id = request.get('user_id', 'anonymous')
            
            # Process the request
            response = await self._generate_response(message, context)
            
            # Return structured response
            return {
                'success': True,
                'response': response,
                'agent': self.name,
                'timestamp': datetime.now().isoformat(),
                'metadata': {
                    'user_id': user_id,
                    'context_used': bool(context),
                    'model_used': response.get('model_used')
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return {
                'success': False,
                'error': str(e),
                'agent': self.name
            }
    
    async def _generate_response(self, message: str, context: Dict) -> Dict[str, Any]:
        """
        Generate response using the model router
        """
        if not self.model_router:
            return {'response': 'Model router not available', 'model_used': 'none'}
        
        # Route to appropriate model based on capabilities
        model_request = {
            'message': message,
            'context': context,
            'capabilities_required': ['text_generation'],
            'agent_type': self.agent_type,
            'cost_preference': 'balanced'
        }
        
        return await self.model_router.route_request(model_request)
    
    def get_capabilities(self) -> List[str]:
        """Return list of agent capabilities"""
        return self.capabilities
    
    def get_health_status(self) -> Dict[str, Any]:
        """Return agent health status"""
        return {
            'status': 'healthy',
            'name': self.name,
            'version': self.version,
            'capabilities': self.capabilities,
            'model_router_available': self.model_router is not None
        }
```

### 2. Agent Registration

Register your custom agent in the service initialization:

```python
# services/service_initialization.py

def _initialize_custom_agent(app: Flask, model_router) -> MyCustomAgent:
    """Initialize custom agent with dependencies"""
    try:
        custom_agent = MyCustomAgent(model_router=model_router)
        logger.info("🎯 Custom Agent initialized successfully")
        return custom_agent
    except Exception as e:
        logger.error(f"Failed to initialize custom agent: {e}")
        raise

def initialize_services(app: Flask) -> Dict[str, Any]:
    """Modified to include custom agent"""
    # ... existing initialization code ...
    
    # Initialize custom agent after model router is available
    if 'model_router' in services:
        services['custom_agent'] = _initialize_custom_agent(app, services['model_router'])
    
    return services
```

### 3. Agent API Blueprint

Create an API blueprint for your agent:

```python
# api/blueprints/custom_agent_blueprint.py
from flask import Blueprint, request, jsonify
from flask_socketio import emit
from services import get_service
from utils.logging_setup import get_logger

logger = get_logger(__name__)
custom_agent_bp = Blueprint('custom_agent', __name__, url_prefix='/api/custom-agent')

@custom_agent_bp.route('/process', methods=['POST'])
async def process_request():
    """Process request with custom agent"""
    try:
        # Get agent service
        custom_agent = get_service('custom_agent')
        if not custom_agent:
            return jsonify({'error': 'Custom agent not available'}), 503
        
        # Extract request data
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        # Process request
        result = await custom_agent.process_request(data)
        
        # Emit real-time update
        emit('custom_agent_response', result, broadcast=True)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Custom agent request failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@custom_agent_bp.route('/health', methods=['GET'])
def get_health():
    """Get custom agent health status"""
    custom_agent = get_service('custom_agent')
    if not custom_agent:
        return jsonify({'status': 'unavailable'}), 503
    
    return jsonify(custom_agent.get_health_status())

@custom_agent_bp.route('/capabilities', methods=['GET'])
def get_capabilities():
    """Get custom agent capabilities"""
    custom_agent = get_service('custom_agent')
    if not custom_agent:
        return jsonify({'capabilities': []}), 503
    
    return jsonify({'capabilities': custom_agent.get_capabilities()})
```

### 4. Frontend Integration

Add frontend components for your custom agent:

```typescript
// frontend/src/services/customAgentAPI.ts
import { api } from '../lib/api';

export interface CustomAgentRequest {
  message: string;
  context?: Record<string, any>;
  user_id?: string;
}

export interface CustomAgentResponse {
  success: boolean;
  response?: string;
  error?: string;
  agent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export class CustomAgentAPI {
  async processRequest(request: CustomAgentRequest): Promise<CustomAgentResponse> {
    const response = await api.post('/api/custom-agent/process', request);
    return response.data;
  }

  async getHealth(): Promise<any> {
    const response = await api.get('/api/custom-agent/health');
    return response.data;
  }

  async getCapabilities(): Promise<string[]> {
    const response = await api.get('/api/custom-agent/capabilities');
    return response.data.capabilities;
  }
}

export const customAgentAPI = new CustomAgentAPI();
```

```tsx
// frontend/src/components/CustomAgentChat.tsx
import React, { useState, useEffect } from 'react';
import { customAgentAPI, CustomAgentRequest } from '../services/customAgentAPI';
import { useSocket } from '../hooks/useSocket';

export const CustomAgentChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('custom_agent_response', (response) => {
        setResponses(prev => [...prev, response]);
      });
    }
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const request: CustomAgentRequest = {
        message,
        user_id: 'current_user'
      };
      
      await customAgentAPI.processRequest(request);
      setMessage('');
    } catch (error) {
      console.error('Failed to process request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-agent-chat">
      <div className="responses">
        {responses.map((response, index) => (
          <div key={index} className="response">
            <div className="agent-name">{response.agent}</div>
            <div className="message">{response.response}</div>
            <div className="timestamp">{response.timestamp}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message custom agent..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !message.trim()}>
          {loading ? 'Processing...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
```

## 🔌 MCP Server Integration

### 1. Creating a Custom MCP Server

Define your MCP server in the catalog:

```json
// data/mcp_servers.json
{
  "version": 1,
  "servers": [
    {
      "name": "my-custom-mcp",
      "type": "custom",
      "url": "http://localhost:8080",
      "api_key": "${MY_CUSTOM_API_KEY}",
      "description": "Custom MCP server for specialized functionality",
      "category": "custom",
      "author": "Your Name",
      "version": "1.0.0",
      "capabilities": ["search", "transform", "analyze"],
      "dependencies": [],
      "configuration_schema": {
        "type": "object",
        "properties": {
          "api_key": {"type": "string", "required": true},
          "endpoint": {"type": "string", "default": "http://localhost:8080"},
          "timeout": {"type": "number", "default": 30}
        }
      },
      "installation_method": "docker",
      "docker_image": "your-registry/my-custom-mcp:latest",
      "tags": ["custom", "analysis", "transformation"]
    }
  ]
}
```

### 2. MCP Server Implementation

Create a custom MCP server implementation:

```python
# mcp_servers/my_custom_server.py
from typing import Dict, Any, List, Optional
import asyncio
import aiohttp
from models.mcp_server import MCPServer, MCPCategory

class MyCustomMCPServer:
    """
    Custom MCP server implementation
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.base_url = config.get('endpoint', 'http://localhost:8080')
        self.api_key = config.get('api_key')
        self.timeout = config.get('timeout', 30)
        self.session = None
    
    async def initialize(self) -> bool:
        """Initialize the MCP server connection"""
        try:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout),
                headers={'Authorization': f'Bearer {self.api_key}'}
            )
            
            # Test connection
            async with self.session.get(f'{self.base_url}/health') as response:
                if response.status == 200:
                    return True
                return False
                
        except Exception as e:
            print(f"Failed to initialize MCP server: {e}")
            return False
    
    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool with given parameters"""
        if not self.session:
            raise RuntimeError("MCP server not initialized")
        
        try:
            payload = {
                'tool': tool_name,
                'parameters': parameters
            }
            
            async with self.session.post(
                f'{self.base_url}/execute',
                json=payload
            ) as response:
                result = await response.json()
                return {
                    'success': response.status == 200,
                    'data': result,
                    'status_code': response.status
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'status_code': 500
            }
    
    async def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available tools"""
        if not self.session:
            return []
        
        try:
            async with self.session.get(f'{self.base_url}/tools') as response:
                if response.status == 200:
                    tools = await response.json()
                    return tools.get('tools', [])
                return []
                
        except Exception as e:
            print(f"Failed to get tools: {e}")
            return []
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()
```

### 3. Registering MCP Server

Register your custom MCP server with the marketplace:

```python
# services/marketplace_service.py - Extended

class MCPMarketplaceManager:
    """Extended marketplace manager with custom server support"""
    
    def register_custom_server(self, server_config: Dict[str, Any]) -> bool:
        """Register a custom MCP server"""
        try:
            from mcp_servers.my_custom_server import MyCustomMCPServer
            
            # Create server instance
            server = MyCustomMCPServer(server_config)
            
            # Initialize and test
            if asyncio.run(server.initialize()):
                # Store in registry
                self.custom_servers[server_config['name']] = server
                
                # Update database
                self._update_server_status(server_config['name'], 'installed')
                
                logger.info(f"Custom MCP server '{server_config['name']}' registered successfully")
                return True
            else:
                logger.error(f"Failed to initialize custom MCP server '{server_config['name']}'")
                return False
                
        except Exception as e:
            logger.error(f"Failed to register custom MCP server: {e}")
            return False
    
    def get_custom_server(self, server_name: str) -> Optional[Any]:
        """Get custom server instance"""
        return self.custom_servers.get(server_name)
```

### 4. MCP Tool Integration

Create tools that use your MCP server:

```python
# tools/my_custom_tool.py
from typing import Dict, Any
from services import get_service

async def execute_custom_analysis(data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute custom analysis using MCP server"""
    marketplace = get_service('marketplace_manager')
    if not marketplace:
        return {'error': 'Marketplace service not available'}
    
    custom_server = marketplace.get_custom_server('my-custom-mcp')
    if not custom_server:
        return {'error': 'Custom MCP server not available'}
    
    try:
        result = await custom_server.execute_tool('analyze', {
            'input_data': data,
            'analysis_type': 'comprehensive',
            'output_format': 'json'
        })
        
        return result
        
    except Exception as e:
        return {'error': f'Analysis failed: {str(e)}'}

# Register tool with agent framework
from services.agent_framework_enhanced import register_tool

register_tool('custom_analysis', execute_custom_analysis, {
    'description': 'Perform custom analysis using specialized MCP server',
    'parameters': {
        'data': {'type': 'object', 'required': True},
        'options': {'type': 'object', 'required': False}
    }
})
```

## 🧠 Model Integration

### 1. Adding a New Model Provider

Extend the model router to support new providers:

```python
# services/model_router.py - Extended

class ModelProvider(Enum):
    # Existing providers...
    CUSTOM_PROVIDER = "custom_provider"

class CustomModelProvider:
    """Custom model provider implementation"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.client = self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the custom provider client"""
        # Your custom provider initialization
        pass
    
    async def generate_response(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate response using custom provider"""
        try:
            # Custom provider API call
            response = await self.client.generate(
                prompt=request['message'],
                max_tokens=request.get('max_tokens', 1000),
                temperature=request.get('temperature', 0.7)
            )
            
            return {
                'response': response.text,
                'model_used': 'custom-model-v1',
                'provider': 'custom_provider',
                'tokens_used': response.usage.total_tokens,
                'cost': self._calculate_cost(response.usage.total_tokens)
            }
            
        except Exception as e:
            raise RuntimeError(f"Custom provider error: {e}")
    
    def _calculate_cost(self, tokens: int) -> float:
        """Calculate cost based on token usage"""
        return tokens * 0.001  # $0.001 per token

# Register custom provider in model router
class IntelligentModelRouter:
    def __init__(self):
        # ... existing initialization ...
        self._register_custom_provider()
    
    def _register_custom_provider(self):
        """Register custom model provider"""
        custom_api_key = os.getenv('CUSTOM_PROVIDER_API_KEY')
        if custom_api_key:
            self.providers[ModelProvider.CUSTOM_PROVIDER] = CustomModelProvider(
                api_key=custom_api_key,
                base_url=os.getenv('CUSTOM_PROVIDER_URL', 'https://api.custom-provider.com')
            )
            
            # Add custom models to catalog
            self.models['custom-model-v1'] = ModelConfig(
                provider=ModelProvider.CUSTOM_PROVIDER,
                model_name='custom-model-v1',
                cost_per_1k_tokens=1.0,
                quota_limit=100000,
                capabilities=['text', 'reasoning'],
                billing_account="custom_provider"
            )
```

### 2. Model Configuration

Add custom model configurations:

```python
# config/model_configs.py
CUSTOM_MODEL_CONFIGS = {
    'custom-reasoning-model': {
        'provider': 'custom_provider',
        'capabilities': ['reasoning', 'analysis', 'code'],
        'context_window': 32000,
        'cost_tier': 3,
        'preferred_for': ['complex_analysis', 'code_review', 'planning']
    },
    'custom-creative-model': {
        'provider': 'custom_provider', 
        'capabilities': ['creative', 'writing', 'storytelling'],
        'context_window': 16000,
        'cost_tier': 2,
        'preferred_for': ['content_creation', 'storytelling', 'marketing']
    }
}

# Add to models catalog
def extend_models_catalog():
    """Extend the models catalog with custom configurations"""
    with open('data/models_catalog.json', 'r') as f:
        catalog = json.load(f)
    
    for model_name, config in CUSTOM_MODEL_CONFIGS.items():
        catalog[model_name] = {
            'provider': config['provider'],
            'displayName': model_name.replace('-', ' ').title(),
            'description': f"Custom {config['provider']} model for {', '.join(config['preferred_for'])}",
            'maxTokens': config['context_window'],
            'capabilities': config['capabilities'],
            'color': 'from-orange-500 to-red-600',
            'icon': '🎯',
            'badge': {
                'text': 'Custom',
                'color': 'bg-orange-500'
            }
        }
    
    with open('data/models_catalog.json', 'w') as f:
        json.dump(catalog, f, indent=2)
```

### 3. Model Selection Logic

Implement custom model selection logic:

```python
# services/model_selector.py
class CustomModelSelector:
    """Custom logic for model selection based on specific criteria"""
    
    def __init__(self, model_router):
        self.model_router = model_router
        self.selection_history = []
        self.performance_metrics = {}
    
    def select_optimal_model(self, request: Dict[str, Any]) -> str:
        """Select optimal model based on custom criteria"""
        
        # Analyze request characteristics
        message_length = len(request.get('message', ''))
        capabilities_needed = request.get('capabilities_required', [])
        complexity_score = self._calculate_complexity(request)
        user_preferences = request.get('user_preferences', {})
        
        # Score available models
        model_scores = {}
        for model_name, model_config in self.model_router.models.items():
            score = self._score_model(
                model_config, 
                capabilities_needed, 
                complexity_score, 
                message_length,
                user_preferences
            )
            model_scores[model_name] = score
        
        # Select highest scoring model
        best_model = max(model_scores.items(), key=lambda x: x[1])
        
        # Log selection for learning
        self._log_selection(request, best_model[0], model_scores)
        
        return best_model[0]
    
    def _calculate_complexity(self, request: Dict[str, Any]) -> float:
        """Calculate request complexity score"""
        complexity = 0.0
        
        # Message length factor
        message_length = len(request.get('message', ''))
        complexity += min(message_length / 1000, 1.0) * 0.3
        
        # Capability requirements
        capabilities = request.get('capabilities_required', [])
        complexity += len(capabilities) * 0.2
        
        # Context size
        context = request.get('context', {})
        complexity += min(len(str(context)) / 500, 1.0) * 0.2
        
        # Attachments
        attachments = request.get('attachments', [])
        complexity += len(attachments) * 0.3
        
        return min(complexity, 1.0)
    
    def _score_model(self, model_config, capabilities, complexity, length, preferences):
        """Score a model for the given request"""
        score = 0.0
        
        # Capability matching
        model_caps = model_config.capabilities or []
        capability_match = len(set(capabilities) & set(model_caps)) / max(len(capabilities), 1)
        score += capability_match * 0.4
        
        # Performance for complexity
        if complexity > 0.7 and 'reasoning' in model_caps:
            score += 0.3
        elif complexity < 0.3 and 'fast' in model_caps:
            score += 0.2
        
        # Cost optimization
        cost_preference = preferences.get('cost_preference', 'balanced')
        if cost_preference == 'optimize' and model_config.cost_per_1k_tokens < 0.1:
            score += 0.2
        elif cost_preference == 'performance' and 'reasoning' in model_caps:
            score += 0.2
        
        # Quota availability
        usage_ratio = model_config.current_usage / model_config.quota_limit
        if usage_ratio < 0.8:
            score += 0.1
        
        return score
```

## 🔄 Socket.IO Real-Time Features

### 1. Custom Socket Events

Create custom Socket.IO events for your integrations:

```python
# api/blueprints/socket_handlers.py - Extended

@socketio.on('custom_agent_request')
def handle_custom_agent_request(data):
    """Handle custom agent requests via WebSocket"""
    try:
        # Get user session info
        user_id = session.get('user_id', 'anonymous')
        
        # Validate request
        if 'message' not in data:
            emit('custom_agent_error', {'error': 'Message is required'})
            return
        
        # Get custom agent
        custom_agent = get_service('custom_agent')
        if not custom_agent:
            emit('custom_agent_error', {'error': 'Custom agent not available'})
            return
        
        # Process request asynchronously
        request_data = {
            'message': data['message'],
            'context': data.get('context', {}),
            'user_id': user_id
        }
        
        # Start background task
        socketio.start_background_task(_process_custom_agent_request, request_data)
        
        # Send immediate acknowledgment
        emit('custom_agent_started', {'request_id': data.get('request_id')})
        
    except Exception as e:
        logger.error(f"Socket handler error: {e}")
        emit('custom_agent_error', {'error': 'Internal server error'})

def _process_custom_agent_request(request_data):
    """Background task to process custom agent request"""
    try:
        custom_agent = get_service('custom_agent')
        
        # Process request
        result = asyncio.run(custom_agent.process_request(request_data))
        
        # Emit result to all connected clients
        socketio.emit('custom_agent_response', result)
        
        # Emit to specific user if user_id available
        if request_data.get('user_id') != 'anonymous':
            socketio.emit(
                'custom_agent_private_response', 
                result, 
                room=f"user_{request_data['user_id']}"
            )
            
    except Exception as e:
        logger.error(f"Background task error: {e}")
        socketio.emit('custom_agent_error', {'error': str(e)})

@socketio.on('join_user_room')
def handle_join_user_room(data):
    """Join user-specific room for private messages"""
    user_id = data.get('user_id')
    if user_id:
        join_room(f"user_{user_id}")
        emit('joined_room', {'room': f"user_{user_id}"})

@socketio.on('mcp_server_status_request')
def handle_mcp_status_request():
    """Get real-time MCP server status"""
    marketplace = get_service('marketplace_manager')
    if marketplace:
        status = marketplace.get_all_server_status()
        emit('mcp_server_status', status)

# Real-time MCP server monitoring
def start_mcp_monitoring():
    """Start background monitoring of MCP servers"""
    def monitor_servers():
        while True:
            try:
                marketplace = get_service('marketplace_manager')
                if marketplace:
                    status_updates = marketplace.check_server_health()
                    if status_updates:
                        socketio.emit('mcp_status_update', status_updates)
                
                socketio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"MCP monitoring error: {e}")
                socketio.sleep(60)  # Wait longer on error
    
    socketio.start_background_task(monitor_servers)
```

### 2. Frontend Socket Integration

Create frontend hooks for Socket.IO integration:

```typescript
// frontend/src/hooks/useCustomAgent.ts
import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface CustomAgentRequest {
  message: string;
  context?: Record<string, any>;
  request_id?: string;
}

interface CustomAgentResponse {
  success: boolean;
  response?: string;
  error?: string;
  agent: string;
  timestamp: string;
}

export const useCustomAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<CustomAgentResponse[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for agent responses
    socket.on('custom_agent_response', (response: CustomAgentResponse) => {
      setResponses(prev => [...prev, response]);
      setIsProcessing(false);
    });

    // Listen for errors
    socket.on('custom_agent_error', (error: { error: string }) => {
      setErrors(prev => [...prev, error.error]);
      setIsProcessing(false);
    });

    // Listen for processing start confirmation
    socket.on('custom_agent_started', () => {
      setIsProcessing(true);
    });

    return () => {
      socket.off('custom_agent_response');
      socket.off('custom_agent_error');
      socket.off('custom_agent_started');
    };
  }, [socket]);

  const sendRequest = (request: CustomAgentRequest) => {
    if (!socket) {
      setErrors(prev => [...prev, 'Socket connection not available']);
      return;
    }

    const requestWithId = {
      ...request,
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    socket.emit('custom_agent_request', requestWithId);
  };

  const clearResponses = () => setResponses([]);
  const clearErrors = () => setErrors([]);

  return {
    sendRequest,
    responses,
    errors,
    isProcessing,
    clearResponses,
    clearErrors
  };
};
```

```typescript
// frontend/src/hooks/useMCPStatus.ts
import { useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface MCPServerStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  last_check: string;
  response_time?: number;
  error_message?: string;
}

export const useMCPStatus = () => {
  const [servers, setServers] = useState<MCPServerStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Request initial status
    socket.emit('mcp_server_status_request');

    // Listen for status updates
    socket.on('mcp_server_status', (status: MCPServerStatus[]) => {
      setServers(status);
      setLastUpdate(new Date());
    });

    socket.on('mcp_status_update', (updates: Partial<MCPServerStatus>[]) => {
      setServers(prev => {
        const updated = [...prev];
        updates.forEach(update => {
          const index = updated.findIndex(s => s.name === update.name);
          if (index >= 0) {
            updated[index] = { ...updated[index], ...update };
          }
        });
        return updated;
      });
      setLastUpdate(new Date());
    });

    return () => {
      socket.off('mcp_server_status');
      socket.off('mcp_status_update');
    };
  }, [socket]);

  const refreshStatus = () => {
    if (socket) {
      socket.emit('mcp_server_status_request');
    }
  };

  return {
    servers,
    lastUpdate,
    refreshStatus
  };
};
```

### 3. Real-Time Dashboard Component

Create a real-time dashboard using Socket.IO:

```tsx
// frontend/src/components/RealTimeDashboard.tsx
import React from 'react';
import { useCustomAgent } from '../hooks/useCustomAgent';
import { useMCPStatus } from '../hooks/useMCPStatus';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const RealTimeDashboard: React.FC = () => {
  const { responses, isProcessing } = useCustomAgent();
  const { servers, lastUpdate } = useMCPStatus();

  const onlineServers = servers.filter(s => s.status === 'online').length;
  const totalServers = servers.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Agent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Agent Status
            {isProcessing && (
              <Badge variant="secondary" className="animate-pulse">
                Processing
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Responses:</span>
              <span className="font-bold">{responses.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate:</span>
              <span className="font-bold text-green-600">
                {responses.length > 0 
                  ? Math.round((responses.filter(r => r.success).length / responses.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge variant={isProcessing ? "secondary" : "default"}>
                {isProcessing ? "Busy" : "Ready"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MCP Server Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔌 MCP Servers
            <Badge variant="outline">
              {onlineServers}/{totalServers}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {servers.slice(0, 5).map(server => (
              <div key={server.name} className="flex items-center justify-between">
                <span className="text-sm truncate">{server.name}</span>
                <Badge 
                  variant={
                    server.status === 'online' ? 'default' : 
                    server.status === 'offline' ? 'secondary' : 'destructive'
                  }
                  className="text-xs"
                >
                  {server.status}
                </Badge>
              </div>
            ))}
            {servers.length > 5 && (
              <div className="text-xs text-gray-500 text-center">
                +{servers.length - 5} more servers
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {responses.slice(-5).reverse().map((response, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Badge variant={response.success ? "default" : "destructive"} className="text-xs">
                  {response.agent}
                </Badge>
                <span className="truncate flex-1">
                  {response.success ? 'Success' : response.error}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(response.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔧 Advanced Patterns

### 1. Agent Orchestration

Create complex workflows with multiple agents:

```python
# services/agent_orchestrator.py
class AgentOrchestrator:
    """Orchestrate multiple agents for complex workflows"""
    
    def __init__(self):
        self.agents = {}
        self.workflows = {}
        self.execution_history = []
    
    def register_agent(self, name: str, agent_instance):
        """Register an agent for orchestration"""
        self.agents[name] = agent_instance
        logger.info(f"Registered agent: {name}")
    
    def create_workflow(self, name: str, steps: List[Dict[str, Any]]):
        """Create a multi-agent workflow"""
        self.workflows[name] = {
            'steps': steps,
            'created_at': datetime.now(),
            'executions': 0
        }
    
    async def execute_workflow(self, workflow_name: str, initial_input: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a multi-agent workflow"""
        if workflow_name not in self.workflows:
            return {'error': f'Workflow {workflow_name} not found'}
        
        workflow = self.workflows[workflow_name]
        execution_id = f"{workflow_name}_{int(time.time())}"
        
        try:
            current_data = initial_input
            results = []
            
            for i, step in enumerate(workflow['steps']):
                agent_name = step['agent']
                action = step['action']
                parameters = step.get('parameters', {})
                
                if agent_name not in self.agents:
                    return {'error': f'Agent {agent_name} not available'}
                
                # Execute step
                step_result = await self._execute_step(
                    self.agents[agent_name],
                    action,
                    current_data,
                    parameters
                )
                
                results.append({
                    'step': i,
                    'agent': agent_name,
                    'action': action,
                    'result': step_result,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Pass data to next step
                if step_result.get('success'):
                    current_data.update(step_result.get('data', {}))
                else:
                    # Workflow failed
                    break
            
            # Record execution
            execution_record = {
                'execution_id': execution_id,
                'workflow_name': workflow_name,
                'input': initial_input,
                'results': results,
                'success': all(r['result'].get('success', False) for r in results),
                'duration': time.time() - int(execution_id.split('_')[-1])
            }
            
            self.execution_history.append(execution_record)
            workflow['executions'] += 1
            
            return execution_record
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            return {'error': str(e)}
    
    async def _execute_step(self, agent, action: str, data: Dict[str, Any], parameters: Dict[str, Any]):
        """Execute a single workflow step"""
        try:
            if hasattr(agent, action):
                method = getattr(agent, action)
                if asyncio.iscoroutinefunction(method):
                    return await method(data, **parameters)
                else:
                    return method(data, **parameters)
            else:
                return {'error': f'Action {action} not available on agent'}
                
        except Exception as e:
            return {'error': str(e)}

# Example workflow definition
CONTENT_CREATION_WORKFLOW = [
    {
        'agent': 'research_agent',
        'action': 'research_topic',
        'parameters': {'depth': 'comprehensive'}
    },
    {
        'agent': 'writer_agent', 
        'action': 'create_outline',
        'parameters': {'style': 'professional'}
    },
    {
        'agent': 'writer_agent',
        'action': 'write_content',
        'parameters': {'tone': 'engaging'}
    },
    {
        'agent': 'review_agent',
        'action': 'review_content',
        'parameters': {'criteria': ['accuracy', 'clarity', 'engagement']}
    }
]
```

### 2. Plugin System

Create a plugin system for extensibility:

```python
# plugins/base_plugin.py
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BasePlugin(ABC):
    """Base class for all plugins"""
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
        self.description = ""
        self.author = ""
        self.dependencies = []
    
    @abstractmethod
    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize the plugin"""
        pass
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute plugin functionality"""
        pass
    
    @abstractmethod
    def get_capabilities(self) -> List[str]:
        """Return list of plugin capabilities"""
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """Return plugin metadata"""
        return {
            'name': self.name,
            'version': self.version,
            'description': self.description,
            'author': self.author,
            'dependencies': self.dependencies,
            'capabilities': self.get_capabilities()
        }

# plugins/content_analyzer_plugin.py
class ContentAnalyzerPlugin(BasePlugin):
    """Plugin for content analysis and insights"""
    
    def __init__(self):
        super().__init__()
        self.description = "Analyze content for quality, sentiment, and insights"
        self.author = "PodPlay Team"
        self.dependencies = ['nltk', 'textblob']
    
    async def initialize(self, config: Dict[str, Any]) -> bool:
        """Initialize content analysis tools"""
        try:
            import nltk
            import textblob
            
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
            
            self.analyzer = textblob.TextBlob
            return True
            
        except ImportError:
            logger.error("Required dependencies not available")
            return False
    
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze content"""
        content = input_data.get('content', '')
        if not content:
            return {'error': 'No content provided'}
        
        try:
            blob = self.analyzer(content)
            
            return {
                'success': True,
                'analysis': {
                    'sentiment': {
                        'polarity': blob.sentiment.polarity,
                        'subjectivity': blob.sentiment.subjectivity,
                        'label': self._sentiment_label(blob.sentiment.polarity)
                    },
                    'word_count': len(blob.words),
                    'sentence_count': len(blob.sentences),
                    'reading_level': self._calculate_reading_level(content),
                    'key_phrases': self._extract_key_phrases(blob),
                    'topics': self._extract_topics(blob)
                }
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    def get_capabilities(self) -> List[str]:
        """Return plugin capabilities"""
        return ['sentiment_analysis', 'readability_analysis', 'topic_extraction']
    
    def _sentiment_label(self, polarity: float) -> str:
        """Convert polarity to label"""
        if polarity > 0.1:
            return 'positive'
        elif polarity < -0.1:
            return 'negative'
        else:
            return 'neutral'

# Plugin manager
class PluginManager:
    """Manage and execute plugins"""
    
    def __init__(self):
        self.plugins = {}
        self.loaded_plugins = {}
    
    def register_plugin(self, plugin_class):
        """Register a plugin class"""
        plugin_name = plugin_class.__name__
        self.plugins[plugin_name] = plugin_class
        logger.info(f"Registered plugin: {plugin_name}")
    
    async def load_plugin(self, plugin_name: str, config: Dict[str, Any] = None) -> bool:
        """Load and initialize a plugin"""
        if plugin_name not in self.plugins:
            return False
        
        try:
            plugin_instance = self.plugins[plugin_name]()
            
            if await plugin_instance.initialize(config or {}):
                self.loaded_plugins[plugin_name] = plugin_instance
                logger.info(f"Loaded plugin: {plugin_name}")
                return True
            else:
                logger.error(f"Failed to initialize plugin: {plugin_name}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to load plugin {plugin_name}: {e}")
            return False
    
    async def execute_plugin(self, plugin_name: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a loaded plugin"""
        if plugin_name not in self.loaded_plugins:
            return {'error': f'Plugin {plugin_name} not loaded'}
        
        plugin = self.loaded_plugins[plugin_name]
        return await plugin.execute(input_data)
    
    def get_available_plugins(self) -> List[Dict[str, Any]]:
        """Get list of available plugins"""
        return [
            plugin.get_metadata() 
            for plugin in self.loaded_plugins.values()
        ]
```

This comprehensive integration guide provides developers with everything they need to extend and integrate with the PodPlay Sanctuary Agent Framework. The examples show real-world patterns and best practices for building scalable, maintainable integrations.