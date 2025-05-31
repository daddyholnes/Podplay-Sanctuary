"""
Vertex Garden API endpoints
Direct access endpoints for Vertex Garden UI
"""
from flask import Blueprint, request, jsonify
import logging

logger = logging.getLogger(__name__)

vertex_garden_bp = Blueprint('vertex_garden', __name__, url_prefix='/api/vertex-garden')

@vertex_garden_bp.route('/chat', methods=['POST'])
def vertex_garden_chat():
    """Vertex Garden direct chat endpoint"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        message = data.get('message', '')
        user_id = data.get('user_id', 'nathan')
        session_id = data.get('session_id', None)
        
        if not message:
            return jsonify({"success": False, "error": "Message is required"}), 400
        
        # Get services from request context
        mama_bear_svc = getattr(request, 'mama_bear_service', None)
        vertex_ai_svc = getattr(request, 'vertex_ai_service', None)
        
        if not mama_bear_svc:
            return jsonify({
                "success": False,
                "error": "Chat services not available"
            }), 503
        
        # Add Vertex Garden context to the message
        enhanced_message = f"[Vertex Garden UI] {message}"
        
        # Try Vertex AI enhanced chat first if available
        if vertex_ai_svc and vertex_ai_svc.vertex_initialized:
            try:
                response = vertex_ai_svc.enhanced_chat(
                    message=enhanced_message,
                    user_id=user_id,
                    session_id=session_id,
                    context={"ui_context": "vertex_garden", "original_message": message}
                )
                
                if response.get('success'):
                    return jsonify({
                        "success": True,
                        "response": response.get('response', '🌟 Vertex Garden response ready!'),
                        "model_used": response.get('model_used', 'vertex-ai'),
                        "session_id": session_id,
                        "vertex_ai": True,
                        "metadata": response.get('metadata', {})
                    })
            except Exception as e:
                logger.error(f"Vertex AI chat error: {e}")
        
        # Fallback to basic Mama Bear chat
        basic_response = mama_bear_svc.chat(enhanced_message, user_id=user_id)
        
        return jsonify({
            "success": True,
            "response": basic_response.get('response', '🌟 Vertex Garden via Mama Bear is ready to help!'),
            "model_used": "mama-bear-vertex-garden",
            "session_id": session_id,
            "vertex_ai": False,
            "metadata": basic_response.get('metadata', {})
        })
        
    except Exception as e:
        logger.error(f"Error in Vertex Garden chat: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "response": "🌟 Vertex Garden is experiencing difficulties. Please try again."
        }), 500

@vertex_garden_bp.route('/chat-history', methods=['GET'])
def vertex_garden_chat_history():
    """Get Vertex Garden chat history"""
    try:
        user_id = request.args.get('user_id', 'nathan')
        
        # Return a basic chat history structure for now
        return jsonify({
            "success": True,
            "history": [],
            "sessions": [],
            "user_id": user_id,
            "message": "Vertex Garden chat history - feature in development"
        })
        
    except Exception as e:
        logger.error(f"Error getting Vertex Garden chat history: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "history": []
        }), 500

@vertex_garden_bp.route('/session/<session_id>/messages', methods=['GET'])
def vertex_garden_session_messages(session_id: str):
    """Get messages for a specific Vertex Garden session"""
    try:
        user_id = request.args.get('user_id', 'nathan')
        
        # Return empty messages for now - this would integrate with actual session storage
        return jsonify({
            "success": True,
            "session_id": session_id,
            "user_id": user_id,
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

@vertex_garden_bp.route('/models', methods=['GET'])
def vertex_garden_models():
    """Get available models for Vertex Garden"""
    try:
        vertex_ai_svc = getattr(request, 'vertex_ai_service', None)
        
        models = []
        if vertex_ai_svc:
            models = vertex_ai_svc.get_available_models()
        
        return jsonify({
            "success": True,
            "models": models,
            "default_model": "gemini-1.5-flash",
            "vertex_ai_available": vertex_ai_svc is not None
        })
        
    except Exception as e:
        logger.error(f"Error getting Vertex Garden models: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "models": []
        }), 500
