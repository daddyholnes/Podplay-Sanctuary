#!/usr/bin/env python3
"""
Chat API Blueprint - Handles chat and AI-related endpoints
Integrates with Mama Bear Service and Vertex AI Service
"""

from flask import Blueprint, request, jsonify, session
import logging
from typing import Dict, Any
import uuid
from app.services.vertex_ai_service import VertexAIService
from app.services.mama_bear_service import MamaBearService
import asyncio
import time

logger = logging.getLogger(__name__)

# Initialize blueprint
chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Services will be injected during app initialization
mama_bear_service = None
vertex_ai_service = None

def init_chat_services(mama_bear_svc, vertex_ai_svc):
    """Initialize chat services"""
    global mama_bear_service, vertex_ai_service
    mama_bear_service = mama_bear_svc
    vertex_ai_service = vertex_ai_svc
    logger.info("🐻 Chat API services initialized")

@chat_bp.route('/mama-bear', methods=['POST'])
def mama_bear_chat():
    """Main Mama Bear chat endpoint with Vertex AI integration"""
    try:
        # Handle different content types
        if request.content_type and 'application/json' in request.content_type:
            data = request.get_json()
        elif request.form:
            # Handle form data
            data = {
                'message': request.form.get('message', ''),
                'user_id': request.form.get('user_id', 'nathan'),
                'session_id': request.form.get('session_id'),
                'context': request.form.get('context')
            }
        else:
            # Try to get JSON anyway (for cases where content-type is missing)
            try:
                data = request.get_json(force=True)
            except:
                return jsonify({"success": False, "error": "Invalid request format. Expected JSON data"}), 400
        
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'nathan')
        session_id = data.get('session_id', None)
        context = data.get('context', None)
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        # Get services from request context
        mama_bear_svc = getattr(request, 'mama_bear_service', None)
        vertex_ai_svc = getattr(request, 'vertex_ai_service', None)
          # Try Vertex AI enhanced chat first if available
        if vertex_ai_svc and hasattr(vertex_ai_svc, 'vertex_initialized') and vertex_ai_svc.vertex_initialized:
            try:
                # Get chat history for session if provided
                chat_history = []
                if session_id and hasattr(vertex_ai_svc, 'chat_sessions'):
                    session_info = vertex_ai_svc.get_session_info(session_id)
                    if session_info.get('success'):
                        chat_history = session_info.get('history', [])
                
                # Call Vertex AI enhanced chat
                response = vertex_ai_svc.mama_bear_chat(
                    message=message,
                    chat_history=chat_history,
                    context=context,
                    user_id=user_id
                )
                
                if response.get('success'):
                    # Store message and response if we have a session
                    if session_id:
                        vertex_ai_svc.send_message_to_session(session_id, message, user_id)
                    
                    return jsonify({
                        "success": True,
                        "response": response.get('response', '🐻 Hello! I\'m here to help with your development sanctuary.'),
                        "model_used": response.get('model', 'vertex-ai-mama-bear'),
                        "session_id": session_id,
                        "vertex_ai": True,
                        "usage": response.get('usage', {}),
                        "metadata": response.get('metadata', {})
                    })
                else:
                    logger.warning(f"Vertex AI chat failed: {response.get('error', 'Unknown error')}")
                    # Fall through to basic chat
                    
            except Exception as e:
                logger.error(f"Vertex AI chat error: {e}")
                # Fall through to basic chat
          # Fallback to basic Mama Bear chat
        if mama_bear_svc:
            basic_response = mama_bear_svc.chat(message, user_id=user_id)
            
            return jsonify({
                "success": True,
                "response": basic_response.get('response', '🐻 Hello! I\'m Mama Bear, your development companion. How can I help you today?'),
                "model_used": "mama-bear-basic",
                "session_id": session_id,
                "vertex_ai": False,
                "metadata": basic_response.get('metadata', {})
            })
        else:
            return jsonify({
                "success": False,
                "error": "Chat services not available"
            }), 503
        
    except Exception as e:
        logger.error(f"Error in Mama Bear chat: {e}")
        return jsonify({
            "success": False, 
            "error": str(e),
            "response": "🐻 I'm having a moment of technical difficulty. Let me try again in a moment."
        }), 500

@chat_bp.route('/vertex-garden', methods=['POST'])
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

@chat_bp.route('/vertex-garden/chat', methods=['POST'])
def vertex_garden_chat_endpoint():
    """Vertex Garden direct chat endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        # Forward to vertex-garden endpoint
        return vertex_garden_chat()
        
    except Exception as e:
        logger.error(f"Error in Vertex Garden chat endpoint: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/vertex-garden/chat-history', methods=['GET'])
def vertex_garden_chat_history():
    """Get Vertex Garden chat history"""
    try:
        # Return a basic chat history structure
        return jsonify({
            "success": True,
            "history": [],
            "sessions": [],
            "message": "Vertex Garden chat history - feature in development"
        })
        
    except Exception as e:
        logger.error(f"Error getting Vertex Garden chat history: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "history": []
        }), 500

@chat_bp.route('/vertex-garden/session/<session_id>/messages', methods=['GET'])
def vertex_garden_session_messages(session_id: str):
    """Get messages for a specific Vertex Garden session"""
    try:
        # Return empty messages for now - this would integrate with actual session storage
        return jsonify({
            "success": True,
            "session_id": session_id,
            "messages": [],
            "message": "Session messages - feature in development"
        })
        
    except Exception as e:
        logger.error(f"Error getting Vertex Garden session messages: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "messages": []
        }), 500

@chat_bp.route('/sessions', methods=['POST'])
def create_chat_session():
    """Create a new chat session"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        session_id = data.get('session_id') or str(uuid.uuid4())
        model_name = data.get('model_name', 'gemini-1.5-flash')
        system_instruction = data.get('system_instruction')
        
        if not vertex_ai_service:
            return jsonify({"success": False, "error": "Vertex AI service not available"}), 503
        
        response = vertex_ai_service.create_chat_session(
            session_id=session_id,
            model_name=model_name,
            system_instruction=system_instruction
        )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error creating chat session: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/sessions/<session_id>', methods=['GET'])
def get_chat_session(session_id: str):
    """Get information about a chat session"""
    try:
        if not vertex_ai_service:
            return jsonify({"success": False, "error": "Vertex AI service not available"}), 503
        
        response = vertex_ai_service.get_session_info(session_id)
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error getting chat session: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/sessions/<session_id>/message', methods=['POST'])
def send_session_message(session_id: str):
    """Send a message to a specific chat session"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'nathan')
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        if not vertex_ai_service:
            return jsonify({"success": False, "error": "Vertex AI service not available"}), 503
        
        response = vertex_ai_service.send_message_to_session(
            session_id=session_id,
            message=message,
            user_id=user_id
        )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error sending session message: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/sessions/<session_id>/model', methods=['PUT'])
def switch_session_model(session_id: str):
    """Switch the model for a chat session"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        new_model_name = data.get('model_name', '')
        
        if not new_model_name:
            return jsonify({"success": False, "error": "Model name is required"}), 400
        
        if not vertex_ai_service:
            return jsonify({"success": False, "error": "Vertex AI service not available"}), 503
        
        response = vertex_ai_service.switch_session_model(
            session_id=session_id,
            new_model_name=new_model_name
        )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error switching session model: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/models', methods=['GET'])
def list_models():
    """List all available AI models"""
    try:
        if not vertex_ai_service:
            return jsonify({
                "success": False,
                "error": "Vertex AI service not available",
                "models": {},
                "vertex_ai_available": False
            })
        
        response = vertex_ai_service.list_models()
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error listing models: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "models": {},
            "vertex_ai_available": False
        }), 500

@chat_bp.route('/analyze-code', methods=['POST'])
def analyze_code():
    """Analyze code using AI"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({"success": False, "error": "Code is required"}), 400
        
        # Try Vertex AI analysis first
        if vertex_ai_service and vertex_ai_service.vertex_initialized:
            try:
                response = vertex_ai_service.analyze_code(code, language)
                if response.get('success'):
                    return jsonify(response)
            except Exception as e:
                logger.error(f"Vertex AI code analysis error: {e}")
        
        # Fallback to basic analysis
        if mama_bear_service:
            response = mama_bear_service.analyze_code(code, language)
            return jsonify(response)
        else:
            return jsonify({
                "success": False,
                "error": "Code analysis services not available"
            }), 503
        
    except Exception as e:
        logger.error(f"Error analyzing code: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@chat_bp.route('/memories/search', methods=['POST'])
def search_memories():
    """Search through stored memories"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        query = data.get('query', '')
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({"success": False, "error": "Query is required"}), 400
        
        if mama_bear_service:
            response = mama_bear_service.search_memories(query, limit)
            return jsonify(response)
        else:
            return jsonify({
                "success": False,
                "error": "Mama Bear service not available"
            }), 503
        
    except Exception as e:
        logger.error(f"Error searching memories: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Unified multi-model API endpoints
@chat_bp.route('/models/available', methods=['GET'])
def get_available_models():
    """Get all available AI models across all providers"""
    try:
        vertex_service = VertexAIService()
        mama_bear_service = MamaBearService()
        
        models = {
            'vertex_ai': {
                'gemini': [
                    'gemini-2.5-flash-002',
                    'gemini-exp-1206', 
                    'gemini-2.0-flash-exp',
                    'gemini-1.5-pro-002',
                    'gemini-1.5-flash-002'
                ],
                'claude': [
                    'claude-3-5-sonnet-v2@20241022',
                    'claude-3-5-haiku@20241022',
                    'claude-3-opus@20240229'
                ],
                'llama': [
                    'llama3-405b-instruct-maas',
                    'llama-3.2-90b-vision-instruct-maas',
                    'llama-3.1-70b-instruct-maas'
                ],
                'mistral': [
                    'mistral-large-2407',
                    'mistral-nemo-2407'
                ]
            },
            'adk_priority_queue': [
                'gpt-4o',
                'claude-3-opus-20240229',
                'gemini-1.5-pro',
                'claude-3-5-sonnet-20241022',
                'gpt-4-turbo',
                'gemini-1.5-flash',
                'claude-3-haiku-20240307'
            ],
            'openai': [
                'gpt-4o',
                'gpt-4-turbo',
                'gpt-3.5-turbo'
            ],
            'anthropic': [
                'claude-3-opus-20240229',
                'claude-3-5-sonnet-20241022',
                'claude-3-haiku-20240307'
            ]
        }
        
        return jsonify({
            'status': 'success',
            'models': models,
            'total_models': sum(len(provider_models) if isinstance(provider_models, list) else sum(len(models) for models in provider_models.values()) for provider_models in models.values())
        })
        
    except Exception as e:
        logging.error(f"Error getting available models: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/models/switch', methods=['POST'])
def switch_model():
    """Switch model for a specific session with conversation persistence"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        new_model = data.get('model')
        provider = data.get('provider', 'auto')
        
        if not session_id or not new_model:
            return jsonify({'status': 'error', 'message': 'session_id and model are required'}), 400
        
        # Update session model preference
        session_data = session.get('chat_sessions', {})
        if session_id not in session_data:
            session_data[session_id] = {}
        
        session_data[session_id]['current_model'] = new_model
        session_data[session_id]['provider'] = provider
        session_data[session_id]['switched_at'] = time.time()
        session['chat_sessions'] = session_data
        
        return jsonify({
            'status': 'success',
            'message': f'Model switched to {new_model}',
            'session_id': session_id,
            'model': new_model,
            'provider': provider
        })
        
    except Exception as e:
        logging.error(f"Error switching model: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/models/performance', methods=['GET'])
def get_model_performance():
    """Get real-time performance metrics for all models"""
    try:
        # Mock performance data - in production, this would come from monitoring
        performance_data = {
            'vertex_ai': {
                'gemini-2.5-flash-002': {
                    'avg_response_time': 1.2,
                    'success_rate': 0.98,
                    'quota_remaining': 85,
                    'last_updated': time.time()
                },
                'claude-3-5-sonnet-v2@20241022': {
                    'avg_response_time': 2.1,
                    'success_rate': 0.96,
                    'quota_remaining': 73,
                    'last_updated': time.time()
                }
            },
            'adk_priority': {
                'gpt-4o': {
                    'avg_response_time': 1.8,
                    'success_rate': 0.97,
                    'quota_remaining': 90,
                    'last_updated': time.time()
                },
                'claude-3-opus-20240229': {
                    'avg_response_time': 2.3,
                    'success_rate': 0.95,
                    'quota_remaining': 68,
                    'last_updated': time.time()
                }
            }
        }
        
        return jsonify({
            'status': 'success',
            'performance': performance_data,
            'timestamp': time.time()
        })
        
    except Exception as e:
        logging.error(f"Error getting model performance: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/unified', methods=['POST'])
def unified_chat():
    """Unified chat endpoint with automatic model selection and fallback"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id', str(uuid.uuid4()))
        preferred_model = data.get('model')
        task_type = data.get('task_type', 'general')
        
        if not message:
            return jsonify({'status': 'error', 'message': 'Message is required'}), 400
        
        # Get session data
        session_data = session.get('chat_sessions', {})
        current_session = session_data.get(session_id, {})
        
        # Determine best model based on task type and availability
        if preferred_model:
            selected_model = preferred_model
        elif task_type == 'code':
            selected_model = 'claude-3-5-sonnet-v2@20241022'  # Best for coding
        elif task_type == 'creative':
            selected_model = 'claude-3-opus-20240229'  # Best for creative tasks
        elif task_type == 'analysis':
            selected_model = 'gemini-2.0-flash-exp'  # Best for analysis
        else:
            selected_model = 'gemini-2.5-flash-002'  # Fast general purpose
        
        # Try primary model first, then fallback
        models_to_try = [
            selected_model,
            'gemini-2.5-flash-002',  # Fast fallback
            'claude-3-5-sonnet-v2@20241022',  # Quality fallback
            'gpt-4o'  # External fallback
        ]
        
        response = None
        used_model = None
        
        for model in models_to_try:
            try:
                if model.startswith('gemini') or model.startswith('claude') or model.startswith('llama') or model.startswith('mistral'):
                    # Use Vertex AI
                    vertex_service = VertexAIService()
                    response = vertex_service.chat_with_model(message, model, session_id)
                    used_model = model
                    break
                else:
                    # Use ADK for OpenAI/Anthropic direct
                    mama_bear_service = MamaBearService()
                    response = mama_bear_service.chat_with_adk(message, model, session_id)
                    used_model = model
                    break
            except Exception as model_error:
                logging.warning(f"Model {model} failed: {model_error}")
                continue
        
        if not response:
            return jsonify({'status': 'error', 'message': 'All models failed'}), 500
        
        # Update session
        current_session.update({
            'last_model': used_model,
            'last_message_time': time.time(),
            'message_count': current_session.get('message_count', 0) + 1
        })
        session_data[session_id] = current_session
        session['chat_sessions'] = session_data
        
        return jsonify({
            'status': 'success',
            'response': response,
            'model_used': used_model,
            'session_id': session_id,
            'fallback_used': used_model != selected_model
        })
        
    except Exception as e:
        logging.error(f"Error in unified chat: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@chat_bp.route('/compare-models', methods=['POST'])
def compare_models():
    """Compare responses from multiple models for the same prompt"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        models = data.get('models', ['gemini-2.5-flash-002', 'claude-3-5-sonnet-v2@20241022', 'gpt-4o'])
        
        if not message:
            return jsonify({'status': 'error', 'message': 'Message is required'}), 400
        
        results = {}
        
        for model in models:
            try:
                start_time = time.time()
                
                if model.startswith('gemini') or model.startswith('claude') or model.startswith('llama') or model.startswith('mistral'):
                    vertex_service = VertexAIService()
                    response = vertex_service.chat_with_model(message, model)
                else:
                    mama_bear_service = MamaBearService()
                    response = mama_bear_service.chat_with_adk(message, model)
                
                response_time = time.time() - start_time
                
                results[model] = {
                    'response': response,
                    'response_time': response_time,
                    'status': 'success'
                }
                
            except Exception as model_error:
                results[model] = {
                    'response': None,
                    'error': str(model_error),
                    'status': 'error'
                }
        
        return jsonify({
            'status': 'success',
            'prompt': message,
            'results': results,
            'comparison_time': time.time()
        })
        
    except Exception as e:
        logging.error(f"Error comparing models: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Error handlers
@chat_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "message": "The requested chat endpoint does not exist"
    }), 404

@chat_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": "An unexpected error occurred in the chat service"
    }), 500
