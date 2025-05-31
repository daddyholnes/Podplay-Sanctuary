"""
Chat API Blueprint

Manages intelligent conversation capabilities with Mama Bear AI agent, including
chat sessions, daily briefings, and contextual development assistance for the
Podplay Sanctuary environment.
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

from services.mama_bear_agent import MamaBearAgent
from utils.logging_setup import get_logger
from utils.validators import validate_chat_input

logger = get_logger(__name__)

# Create blueprint for chat and AI interaction operations
chat_bp = Blueprint('chat', __name__, url_prefix='/api/mama-bear')

# Agent instance will be injected by service initialization
mama_bear_agent: MamaBearAgent = None

def init_chat_api(agent: MamaBearAgent):
    """
    Initialize Chat API blueprint with Mama Bear agent dependency
    
    Args:
        agent: Initialized Mama Bear agent instance
    """
    global mama_bear_agent
    mama_bear_agent = agent
    logger.info("Chat API blueprint initialized with Mama Bear agent")

@chat_bp.route('/chat', methods=['POST'])
def process_chat_message():
    """
    Process chat interaction with Mama Bear AI agent including context management
    
    Request Body:
        message (str): User message content
        user_id (str): User identifier for personalization
        session_id (str, optional): Session identifier for context continuity
        context (dict, optional): Additional context information
    
    Returns:
        JSON response with AI-generated response and interaction metadata
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body required",
                "response": "Please provide a message for Mama Bear to process."
            }), 400
        
        # Validate and extract request parameters
        validation_result = validate_chat_input(request_data)
        if not validation_result['valid']:
            return jsonify({
                "success": False,
                "error": validation_result['error'],
                "response": "Invalid input parameters provided."
            }), 400
        
        message = request_data.get('message', '')
        user_id = request_data.get('user_id', 'nathan')
        session_id = request_data.get('session_id', str(uuid.uuid4()))
        context = request_data.get('context', None)
        
        if not mama_bear_agent:
            return jsonify({
                "success": False,
                "error": "Mama Bear agent not available",
                "response": "AI agent service is currently initializing. Please try again shortly."
            }), 503
        
        # Process chat message through agent
        chat_result = mama_bear_agent.chat(
            message=message,
            user_id=user_id,
            session_id=session_id
        )
        
        if chat_result.get('success'):
            logger.info(f"Chat processed successfully for user: {user_id}")
            
            return jsonify({
                "success": True,
                "response": chat_result.get('response'),
                "session_id": session_id,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat(),
                "metadata": chat_result.get('metadata', {})
            })
        else:
            logger.warning(f"Chat processing failed for user {user_id}: {chat_result.get('error')}")
            return jsonify({
                "success": False,
                "error": chat_result.get('error', 'Unknown processing error'),
                "response": "I encountered difficulty processing your message. Please try rephrasing your request."
            }), 500
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": "Chat processing failed",
            "response": "An unexpected error occurred while processing your message. Please try again."
        }), 500



@chat_bp.route('/execute-code', methods=['POST'])
def execute_code():
    """
    Execute code safely in sandbox environment with comprehensive error handling
    
    Request Body:
        code (str): Code content to execute
        language (str): Programming language (default: python)
        user_id (str): User identifier for context
    
    Returns:
        JSON response with execution results and output
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body required",
                "output": "Please provide code to execute."
            }), 400
        
        code = request_data.get('code', '')
        language = request_data.get('language', 'python')
        user_id = request_data.get('user_id', 'nathan')
        
        if not code.strip():
            return jsonify({
                "success": False,
                "error": "Code content required",
                "output": "Please provide valid code to execute."
            }), 400
        
        if not mama_bear_agent:
            return jsonify({
                "success": False,
                "error": "Mama Bear agent not available",
                "output": "Code execution service is currently initializing."
            }), 503
        
        # Execute code through agent sandbox
        execution_result = mama_bear_agent.execute_code_safely(code, language)
        
        if execution_result.get('success'):
            logger.info(f"Code execution successful for user: {user_id}")
        else:
            logger.warning(f"Code execution failed for user {user_id}: {execution_result.get('error')}")
        
        return jsonify({
            "success": execution_result.get('success', False),
            "output": execution_result.get('output', ''),
            "error": execution_result.get('error'),
            "language": language,
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id
        })
        
    except Exception as e:
        logger.error(f"Code execution endpoint error: {e}")
        return jsonify({
            "success": False,
            "error": "Code execution failed",
            "output": "An unexpected error occurred during code execution."
        }), 500

@chat_bp.route('/memory/search', methods=['GET'])
def search_memory():
    """
    Search Mama Bear's persistent memory for relevant context and insights
    
    Query Parameters:
        query (str): Search term for memory retrieval
        limit (int): Maximum number of memories to return
    
    Returns:
        JSON response with relevant memory insights and context
    """
    try:
        query = request.args.get('query', '')
        limit = int(request.args.get('limit', 5))
        
        if not query.strip():
            return jsonify({
                "success": False,
                "error": "Search query required",
                "insights": []
            }), 400
        
        if not mama_bear_agent:
            return jsonify({
                "success": False,
                "error": "Mama Bear agent not available",
                "insights": []
            }), 503
        
        # Retrieve memory insights through agent
        memory_insights = mama_bear_agent.get_memory_insights(query)
        
        logger.debug(f"Memory search completed for query: {query}")
        
        return jsonify({
            "success": True,
            "insights": memory_insights,
            "query": query,
            "timestamp": datetime.now().isoformat()
        })
        
    except ValueError as e:
        logger.warning(f"Invalid memory search parameters: {e}")
        return jsonify({
            "success": False,
            "error": "Invalid search parameters",
            "insights": []
        }), 400
        
    except Exception as e:
        logger.error(f"Memory search failed: {e}")
        return jsonify({
            "success": False,
            "error": "Memory search operation failed",
            "insights": []
        }), 500

@chat_bp.route('/learn', methods=['POST'])
def record_learning():
    """
    Record learning insight from user interaction for agent improvement
    
    Request Body:
        interaction_type (str): Type of interaction (chat, command, etc.)
        context (str): Interaction context description
        insight (str): Learning insight to record
    
    Returns:
        JSON response confirming learning storage
    """
    try:
        request_data = request.get_json()
        if not request_data:
            return jsonify({
                "success": False,
                "error": "Request body required"
            }), 400
        
        interaction_type = request_data.get('interaction_type', 'general')
        context = request_data.get('context', '')
        insight = request_data.get('insight', '')
        
        if not insight.strip():
            return jsonify({
                "success": False,
                "error": "Learning insight required"
            }), 400
        
        if not mama_bear_agent:
            return jsonify({
                "success": False,
                "error": "Mama Bear agent not available"
            }), 503
        
        # Record learning through agent
        mama_bear_agent.learn_from_interaction(interaction_type, context, insight)
        
        logger.info(f"Learning recorded: {interaction_type} - {insight[:50]}...")
        
        return jsonify({
            "success": True,
            "message": "Learning insight recorded successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Learning recording failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to record learning insight"
        }), 500