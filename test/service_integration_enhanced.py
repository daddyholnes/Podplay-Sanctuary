"""
Integration with Your Existing Podplay Backend Services
Enhances your current service architecture with intelligent agents
"""

# ===================================================================
# Enhanced Service Initialization (updates your existing services/__init__.py)
# ===================================================================

from services.service_initialization import initialize_services as base_initialize_services
from services.agent_framework_enhanced import AgentOrchestrator
from services.enhanced_mama_service import EnhancedMamaBear
from services.marketplace_service import MCPMarketplaceManager
from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Global agent orchestrator
_agent_orchestrator = None

def initialize_services_with_agents(app):
    """Enhanced initialization including intelligent agents"""
    global _agent_orchestrator
    
    # Initialize base services first
    services = base_initialize_services(app)
    
    try:
        # Get existing services
        enhanced_mama = services.get('enhanced_mama')
        marketplace_manager = services.get('marketplace_manager')
        
        if not enhanced_mama or not marketplace_manager:
            raise RuntimeError("Base services not initialized properly")
        
        # Initialize agent orchestrator
        _agent_orchestrator = AgentOrchestrator(enhanced_mama, marketplace_manager)
        services['agent_orchestrator'] = _agent_orchestrator
        
        logger.info("🤖 Intelligent Agent Framework initialized")
        logger.info(f"📊 Model Router: {len(_agent_orchestrator.model_router.models)} models configured")
        
        # Log model configuration
        for model_name, model in _agent_orchestrator.model_router.models.items():
            logger.info(f"  💎 {model_name}: {model.billing_account} (${model.cost_per_1k_tokens:.3f}/1k)")
        
        return services
        
    except Exception as e:
        logger.error(f"❌ Agent initialization failed: {e}")
        services['agent_initialization_error'] = str(e)
        return services

def get_agent_orchestrator() -> AgentOrchestrator:
    """Get the global agent orchestrator"""
    return _agent_orchestrator

# ===================================================================
# Enhanced API Blueprints (extends your existing API structure)
# ===================================================================

# api/blueprints/agents_api.py
from flask import Blueprint, request, jsonify
from flask_socketio import emit
from services import get_agent_orchestrator
from datetime import datetime
import asyncio

agents_bp = Blueprint('agents', __name__, url_prefix='/api/agents')

@agents_bp.route('/chat', methods=['POST'])
def chat_with_agent():
    """Enhanced chat endpoint supporting all agent types"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id', 'nathan')
        agent_type = data.get('agent_type', 'main_chat')  # main_chat, scout_agent, dev_workspace
        message = data.get('message')
        conversation_id = data.get('conversation_id')
        context = data.get('context', {})
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Add conversation ID to context
        context['conversation_id'] = conversation_id
        
        # Get agent orchestrator
        orchestrator = get_agent_orchestrator()
        if not orchestrator:
            return jsonify({'error': 'Agent system not initialized'}), 500
        
        # Process message asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                orchestrator.chat(agent_type, user_id, message, context)
            )
        finally:
            loop.close()
        
        # Emit real-time update if socket available
        try:
            emit('agent_response', {
                'conversation_id': conversation_id,
                'agent_type': agent_type,
                'response': result,
                'timestamp': datetime.now().isoformat()
            }, room=user_id)
        except:
            pass  # Socket not available
        
        return jsonify({
            'success': True,
            'agent_type': agent_type,
            'response': result,
            'model_used': result.get('model_used'),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Agent chat error: {e}")
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/scout/workflow', methods=['POST'])
def scout_workflow():
    """Handle Scout Agent 4-stage workflow actions"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id', 'nathan')
        action = data.get('action')  # start_planning, transition_workspace, begin_production
        context = data.get('context', {})
        
        # Add workflow action to context
        context['workflow_action'] = action
        
        orchestrator = get_agent_orchestrator()
        if not orchestrator:
            return jsonify({'error': 'Agent system not initialized'}), 500
        
        # Process workflow action
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                orchestrator.scout_agent.process_message(user_id, '', context)
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'stage': result.get('stage'),
            'response': result.get('response'),
            'ui_actions': result.get('ui_actions', {}),
            'files': result.get('files', []),
            'timeline': result.get('timeline', [])
        })
        
    except Exception as e:
        logger.error(f"Scout workflow error: {e}")
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/model-usage', methods=['GET'])
def get_model_usage():
    """Get current model usage statistics"""
    try:
        orchestrator = get_agent_orchestrator()
        if not orchestrator:
            return jsonify({'error': 'Agent system not initialized'}), 500
        
        stats = orchestrator.get_model_usage_stats()
        
        return jsonify({
            'success': True,
            'usage_stats': stats,
            'total_models': len(stats),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Model usage stats error: {e}")
        return jsonify({'error': str(e)}), 500

@agents_bp.route('/capabilities/<agent_type>', methods=['GET'])
def get_agent_capabilities(agent_type):
    """Get capabilities for a specific agent type"""
    try:
        orchestrator = get_agent_orchestrator()
        if not orchestrator:
            return jsonify({'error': 'Agent system not initialized'}), 500
        
        if agent_type == 'scout_agent':
            agent = orchestrator.scout_agent
        elif agent_type == 'dev_workspace':
            agent = orchestrator.workspace_agent
        else:
            agent = orchestrator.main_chat_agent
        
        # Get available tools for this agent
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            tools = loop.run_until_complete(agent._get_available_tools())
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'agent_type': agent_type,
            'capabilities': agent.capabilities,
            'available_tools': tools,
            'total_tools': len(tools)
        })
        
    except Exception as e:
        logger.error(f"Agent capabilities error: {e}")
        return jsonify({'error': str(e)}), 500

# ===================================================================
# Enhanced Socket Handlers (extends your existing socket_handlers.py)
# ===================================================================

# api/blueprints/enhanced_socket_handlers.py
from flask_socketio import emit, join_room, leave_room
from services import get_agent_orchestrator
import asyncio

def register_enhanced_socket_handlers(socketio):
    """Register enhanced socket handlers for real-time agent interaction"""
    
    @socketio.on('join_agent_room')
    def on_join_agent_room(data):
        """Join room for real-time agent updates"""
        user_id = data.get('user_id', 'nathan')
        join_room(user_id)
        emit('agent_room_joined', {'user_id': user_id})
    
    @socketio.on('agent_chat_stream')
    def on_agent_chat_stream(data):
        """Handle streaming chat with agents"""
        try:
            user_id = data.get('user_id', 'nathan')
            agent_type = data.get('agent_type', 'main_chat')
            message = data.get('message')
            context = data.get('context', {})
            
            # Emit typing indicator
            emit('agent_typing', {
                'agent_type': agent_type,
                'is_typing': True
            }, room=user_id)
            
            # Process message
            orchestrator = get_agent_orchestrator()
            if orchestrator:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    result = loop.run_until_complete(
                        orchestrator.chat(agent_type, user_id, message, context)
                    )
                    
                    # Emit response
                    emit('agent_response_stream', {
                        'agent_type': agent_type,
                        'response': result,
                        'timestamp': datetime.now().isoformat()
                    }, room=user_id)
                    
                finally:
                    loop.close()
            
            # Stop typing indicator
            emit('agent_typing', {
                'agent_type': agent_type,
                'is_typing': False
            }, room=user_id)
            
        except Exception as e:
            emit('agent_error', {'error': str(e)}, room=user_id)
    
    @socketio.on('scout_workflow_stream')
    def on_scout_workflow_stream(data):
        """Handle Scout workflow with real-time updates"""
        try:
            user_id = data.get('user_id', 'nathan')
            action = data.get('action')
            context = data.get('context', {})
            
            # Emit workflow start
            emit('scout_workflow_started', {
                'action': action,
                'stage': context.get('current_stage')
            }, room=user_id)
            
            orchestrator = get_agent_orchestrator()
            if orchestrator:
                context['workflow_action'] = action
                
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                try:
                    result = loop.run_until_complete(
                        orchestrator.scout_agent.process_message(user_id, '', context)
                    )
                    
                    # Emit workflow progress
                    emit('scout_workflow_progress', {
                        'stage': result.get('stage'),
                        'response': result.get('response'),
                        'ui_actions': result.get('ui_actions', {}),
                        'files': result.get('files', []),
                        'timeline': result.get('timeline', [])
                    }, room=user_id)
                    
                finally:
                    loop.close()
            
        except Exception as e:
            emit('scout_workflow_error', {'error': str(e)}, room=user_id)
    
    @socketio.on('model_usage_request')
    def on_model_usage_request(data):
        """Send real-time model usage statistics"""
        try:
            user_id = data.get('user_id', 'nathan')
            
            orchestrator = get_agent_orchestrator()
            if orchestrator:
                stats = orchestrator.get_model_usage_stats()
                
                emit('model_usage_update', {
                    'usage_stats': stats,
                    'timestamp': datetime.now().isoformat()
                }, room=user_id)
                
        except Exception as e:
            emit('model_usage_error', {'error': str(e)}, room=user_id)

# ===================================================================
# Enhanced App Initialization (updates your app.py)
# ===================================================================

# Update your existing app.py to use the enhanced services:

"""
In your app.py, replace the services initialization:

OLD:
from services import initialize_services
services = initialize_services(app)

NEW:
from services.enhanced_service_init import initialize_services_with_agents
services = initialize_services_with_agents(app)

# Register enhanced blueprints
from api.blueprints.agents_api import agents_bp
app.register_blueprint(agents_bp)

# Register enhanced socket handlers
from api.blueprints.enhanced_socket_handlers import register_enhanced_socket_handlers
register_enhanced_socket_handlers(socketio)
"""

# ===================================================================
# Environment Configuration Template
# ===================================================================

# .env configuration for your multi-model setup:
"""
# ===== GEMINI CONFIGURATION (Primary - Cheapest) =====
GEMINI_API_KEY=your_gemini_api_key_here

# ===== VERTEX AI CONFIGURATION (Alternative Billing) =====
VERTEX_SERVICE_FILE_1=path/to/vertex-service-account-1.json
VERTEX_SERVICE_FILE_2=path/to/vertex-service-account-2.json
VERTEX_PROJECT_ID=your-vertex-project-id

# ===== OPENAI CONFIGURATION (Fallback) =====
OPENAI_API_KEY=your_openai_api_key_here

# ===== ANTHROPIC CONFIGURATION (High-Quality Fallback) =====
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ===== MEM0 CONFIGURATION =====
MEM0_API_KEY=your_mem0_api_key_here
MEM0_USER_ID=nathan_sanctuary

# ===== TOGETHER AI CONFIGURATION (Optional Sandbox) =====
TOGETHER_AI_API_KEY=your_together_api_key_here
TOGETHER_AI_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
TOGETHER_AI_MAX_TOKENS=4096
TOGETHER_AI_TEMPERATURE=0.7

# ===== MODEL ROUTING CONFIGURATION =====
# Daily quota limits (tokens)
GEMINI_DAILY_QUOTA=2000000
VERTEX_1_DAILY_QUOTA=1500000
VERTEX_2_DAILY_QUOTA=2000000
OPENAI_DAILY_QUOTA=500000
ANTHROPIC_DAILY_QUOTA=300000

# Cost preferences (1=highest priority, 5=lowest priority)
GEMINI_PRIORITY=1
VERTEX_PRIORITY=2
OPENAI_PRIORITY=3
ANTHROPIC_PRIORITY=4
"""

# ===================================================================
# Usage Examples for Your Frontend
# ===================================================================

# JavaScript examples for your React components:

"""
// Main Chat Mama Bear
const chatWithMainMamaBear = async (message) => {
  const response = await fetch('/api/agents/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'nathan',
      agent_type: 'main_chat',
      message: message,
      conversation_id: currentConversationId,
      context: {
        current_project: 'podplay_studio',
        user_preferences: { theme: 'dark', sensory_friendly: true }
      }
    })
  });
  
  return response.json();
};

// Scout Agent Workflow
const startScoutPlanning = async (projectRequest) => {
  const response = await fetch('/api/agents/scout/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'nathan',
      action: 'start_planning',
      context: {
        original_request: projectRequest,
        current_stage: 'welcome'
      }
    })
  });
  
  return response.json();
};

// Real-time model usage monitoring
const subscribeToModelUsage = () => {
  socket.on('model_usage_update', (data) => {
    console.log('Model Usage:', data.usage_stats);
    updateModelUsageUI(data.usage_stats);
  });
  
  socket.emit('model_usage_request', { user_id: 'nathan' });
};

// Stream Scout workflow updates
const subscribeToScoutWorkflow = () => {
  socket.on('scout_workflow_progress', (data) => {
    console.log('Scout Progress:', data.stage);
    updateScoutUI(data);
  });
};
"""

# ===================================================================
# Additional Utility Functions
# ===================================================================

class AgentHealthMonitor:
    """Monitor agent health and model performance"""
    
    def __init__(self, orchestrator: AgentOrchestrator):
        self.orchestrator = orchestrator
        
    def get_system_health(self) -> Dict:
        """Get comprehensive system health"""
        return {
            'agents': {
                'scout': 'healthy',
                'main_chat': 'healthy', 
                'workspace': 'healthy'
            },
            'models': self.orchestrator.get_model_usage_stats(),
            'services': {
                'mem0': bool(self.orchestrator.enhanced_mama.memory),
                'together_ai': bool(self.orchestrator.enhanced_mama.together_client),
                'mcp_marketplace': len(self.orchestrator.marketplace.get_installed_servers())
            },
            'timestamp': datetime.now().isoformat()
        }
