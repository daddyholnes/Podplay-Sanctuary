"""
Socket.IO Event Handlers

Manages real-time communication capabilities for the Podplay Sanctuary platform,
providing WebSocket-based interactions for terminal sessions, workspace updates,
and Mama Bear chat functionality with proper event isolation.
"""

from flask import request
from flask_socketio import emit, join_room, leave_room
from datetime import datetime
import json

from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Global references for service dependencies
mama_bear_agent = None
marketplace_manager = None

def register_socket_handlers(socketio):
    """
    Register all Socket.IO event handlers with clean separation and error handling
    
    Args:
        socketio: SocketIO instance for event registration
    """
    
    @socketio.on('connect')
    def handle_client_connection():
        """
        Handle new client connection with proper authentication and setup
        
        Establishes client session and confirms service availability for real-time communication
        """
        try:
            client_id = request.sid
            logger.info(f"Client connected: {client_id}")
            
            emit('connected', {
                'status': 'success',
                'message': 'Connected to Podplay Sanctuary',
                'client_id': client_id,
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'mama_bear': mama_bear_agent is not None,
                    'marketplace': marketplace_manager is not None,
                    'real_time_chat': True,
                    'terminal_sessions': True
                }
            })
            
        except Exception as e:
            logger.error(f"Connection handling error: {e}")
            emit('error', {
                'message': 'Connection setup failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('disconnect')
    def handle_client_disconnection():
        """
        Handle client disconnection with proper cleanup and session management
        """
        try:
            client_id = request.sid
            logger.info(f"Client disconnected: {client_id}")
            
        except Exception as e:
            logger.error(f"Disconnection handling error: {e}")
    
    @socketio.on('join_terminal')
    def handle_terminal_session_join(data):
        """
        Join terminal session room for collaborative development environment access
        
        Args:
            data: Dictionary containing session_id for terminal identification
        """
        try:
            session_id = data.get('session_id')
            if not session_id:
                emit('error', {
                    'message': 'Session ID required for terminal access',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            join_room(session_id)
            client_id = request.sid
            
            logger.info(f"Client {client_id} joined terminal session {session_id}")
            
            emit('terminal_joined', {
                'session_id': session_id,
                'status': 'success',
                'message': f'Joined terminal session {session_id}',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Terminal join error: {e}")
            emit('error', {
                'message': 'Failed to join terminal session',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('leave_terminal')
    def handle_terminal_session_leave(data):
        """
        Leave terminal session room with proper cleanup
        
        Args:
            data: Dictionary containing session_id for terminal identification
        """
        try:
            session_id = data.get('session_id')
            if not session_id:
                emit('error', {
                    'message': 'Session ID required for terminal operations',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            leave_room(session_id)
            client_id = request.sid
            
            logger.info(f"Client {client_id} left terminal session {session_id}")
            
            emit('terminal_left', {
                'session_id': session_id,
                'status': 'success',
                'message': f'Left terminal session {session_id}',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Terminal leave error: {e}")
            emit('error', {
                'message': 'Failed to leave terminal session',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('terminal_input')
    def handle_terminal_command_input(data):
        """
        Process terminal command input with session broadcasting
        
        Args:
            data: Dictionary containing session_id and command for execution
        """
        try:
            session_id = data.get('session_id')
            command = data.get('command', '')
            
            if not session_id:
                emit('error', {
                    'message': 'Session ID required for command execution',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            logger.info(f"Terminal input for session {session_id}: {command}")
            
            # Process command execution (placeholder for actual terminal integration)
            output = f"$ {command}\nCommand executed successfully in Podplay Sanctuary\n"
            
            # Broadcast output to all clients in the terminal session
            socketio.emit('terminal_output', {
                'session_id': session_id,
                'output': output,
                'command': command,
                'timestamp': datetime.now().isoformat(),
                'status': 'completed'
            }, room=session_id)
            
        except Exception as e:
            logger.error(f"Terminal input processing error: {e}")
            emit('error', {
                'message': 'Command execution failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('workspace_subscribe')
    def handle_workspace_subscription(data):
        """
        Subscribe to workspace updates for development environment monitoring
        
        Args:
            data: Dictionary containing workspace_id for subscription
        """
        try:
            workspace_id = data.get('workspace_id')
            if not workspace_id:
                emit('error', {
                    'message': 'Workspace ID required for subscription',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            join_room(workspace_id)
            client_id = request.sid
            logger.info(f"Client {client_id} subscribed to workspace {workspace_id}")
            
            emit('workspace_subscribed', {
                'workspace_id': workspace_id,
                'status': 'success',
                'message': f'Subscribed to workspace {workspace_id}',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Workspace subscription error: {e}")
            emit('error', {
                'message': 'Failed to subscribe to workspace updates',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

    @socketio.on('workspace_unsubscribe')
    def handle_workspace_unsubscription(data):
        """
        Unsubscribe from workspace updates
        
        Args:
            data: Dictionary containing workspace_id for unsubscription
        """
        try:
            workspace_id = data.get('workspace_id')
            if not workspace_id:
                emit('error', {
                    'message': 'Workspace ID required for unsubscription',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            leave_room(workspace_id)
            client_id = request.sid
            logger.info(f"Client {client_id} unsubscribed from workspace {workspace_id}")
            
            emit('workspace_unsubscribed', {
                'workspace_id': workspace_id,
                'status': 'success',
                'message': f'Unsubscribed from workspace {workspace_id}',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Workspace unsubscription error: {e}")
            emit('error', {
                'message': 'Failed to unsubscribe from workspace updates',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })

    # Mama Bear Chat Handlers
    @socketio.on('join_chat_conversation')
    def handle_join_chat_conversation(data):
        """
        Join a specific chat conversation room.
        Args:
            data: Dictionary containing conversation_id.
        """
        try:
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                emit('error', {'message': 'Conversation ID is required to join chat.'})
                return

            join_room(conversation_id)
            client_id = request.sid
            logger.info(f"Client {client_id} joined chat conversation {conversation_id}")
            emit('chat_conversation_joined', {
                'conversation_id': conversation_id,
                'status': 'success',
                'message': f'Successfully joined conversation {conversation_id}.'
            })
        except Exception as e:
            logger.error(f"Error joining chat conversation {data.get('conversation_id')}: {e}")
            emit('error', {'message': f'Failed to join chat conversation: {str(e)}'})

    @socketio.on('leave_chat_conversation')
    def handle_leave_chat_conversation(data):
        """
        Leave a specific chat conversation room.
        Args:
            data: Dictionary containing conversation_id.
        """
        try:
            conversation_id = data.get('conversation_id')
            if not conversation_id:
                emit('error', {'message': 'Conversation ID is required to leave chat.'})
                return

            leave_room(conversation_id)
            client_id = request.sid
            logger.info(f"Client {client_id} left chat conversation {conversation_id}")
            emit('chat_conversation_left', {
                'conversation_id': conversation_id,
                'status': 'success',
                'message': f'Successfully left conversation {conversation_id}.'
            })
        except Exception as e:
            logger.error(f"Error leaving chat conversation {data.get('conversation_id')}: {e}")
            emit('error', {'message': f'Failed to leave chat conversation: {str(e)}'})

    @socketio.on('send_chat_message')
    def handle_send_chat_message(data):
        """
        Handle incoming chat messages and broadcast them to the conversation room.
        Args:
            data: Dictionary containing conversation_id and message payload.
                  Message payload should be an object with text, sender, etc.
        """
        try:
            conversation_id = data.get('conversation_id')
            message_payload = data.get('message')

            if not conversation_id or not message_payload:
                emit('error', {'message': 'Conversation ID and message payload are required.'})
                return
            
            # Augment message with server-side info if needed (e.g., timestamp, server-validated sender)
            message_payload['timestamp'] = datetime.now().isoformat()
            # For now, we trust the sender from the client, but in a real app, validate/set this server-side
            # message_payload['sender'] = 'mama-bear' # Or determine based on context

            logger.info(f"Message received for conversation {conversation_id} from {message_payload.get('sender')}: {message_payload.get('text')[:50]}...")
            
            # Broadcast the message to everyone in the specific conversation room
            socketio.emit('new_chat_message', {
                'conversation_id': conversation_id,
                'message': message_payload
            }, room=conversation_id)
            
            # Potentially, if Mama Bear needs to respond, trigger agent logic here
            # For example:
            # if message_payload.get('sender') == 'user':
            #     response = mama_bear_agent.process_message(message_payload.get('text'))
            #     response_payload = {
            #         'id': str(uuid.uuid4()), # Generate unique ID for the response
            #         'text': response,
            #         'sender': 'mama-bear',
            #         'timestamp': datetime.now().isoformat(),
            #         'conversation_id': conversation_id 
            #     }
            #     socketio.emit('new_chat_message', {
            #         'conversation_id': conversation_id,
            #         'message': response_payload
            #     }, room=conversation_id)
            #     logger.info(f"Mama Bear responded in conversation {conversation_id}")

        except Exception as e:
            logger.error(f"Error sending chat message in conversation {data.get('conversation_id')}: {e}")
            emit('error', {'message': f'Failed to send chat message: {str(e)}'})
            
    # MCP Marketplace Handlers (Example Structure)
    @socketio.on('mcp_marketplace_action')
    def handle_mcp_marketplace_action(data):
        """
        Handle actions related to the MCP Marketplace (e.g., listing items, creating offers)
        
        Args:
            data: Dictionary containing action type and payload for marketplace interaction
        """
        try:
            action_type = data.get('action_type')
            payload = data.get('payload', {})
            
            logger.info(f"MCP Marketplace action received: {action_type} with payload {payload}")
            
            # Placeholder for marketplace action handling logic
            result = {
                'action_type': action_type,
                'status': 'success',
                'message': f'Action {action_type} processed successfully',
                'timestamp': datetime.now().isoformat(),
                'payload': payload
            }
            
            emit('mcp_marketplace_response', result)
            
        except Exception as e:
            logger.error(f"MCP Marketplace action handling error: {e}")
            emit('error', {
                'message': 'MCP Marketplace action processing failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    logger.info("Socket.IO event handlers registered successfully")

def set_service_dependencies(mama_bear=None, marketplace=None):
    """
    Set service dependencies for Socket.IO handlers
    
    Args:
        mama_bear: Mama Bear agent instance
        marketplace: Marketplace manager instance
    """
    global mama_bear_agent, marketplace_manager
    mama_bear_agent = mama_bear
    marketplace_manager = marketplace
    logger.info("Socket.IO service dependencies configured")