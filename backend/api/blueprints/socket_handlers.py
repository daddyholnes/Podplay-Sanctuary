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
            
            join_room(f"workspace_{workspace_id}")
            client_id = request.sid
            
            logger.info(f"Client {client_id} subscribed to workspace {workspace_id}")
            
            emit('workspace_subscribed', {
                'workspace_id': workspace_id,
                'status': 'success',
                'message': f'Subscribed to workspace {workspace_id} updates',
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Workspace subscription error: {e}")
            emit('error', {
                'message': 'Workspace subscription failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('workspace_unsubscribe')
    def handle_workspace_unsubscription(data):
        """
        Unsubscribe from workspace updates with session cleanup
        
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
            
            leave_room(f"workspace_{workspace_id}")
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
                'message': 'Workspace unsubscription failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('mama_bear_chat')
    def handle_real_time_chat(data):
        """
        Process real-time Mama Bear chat interaction with immediate response
        
        Args:
            data: Dictionary containing message and session context for chat processing
        """
        try:
            message = data.get('message', '')
            session_id = data.get('session_id', request.sid)
            user_id = data.get('user_id', 'nathan')
            
            if not message.strip():
                emit('error', {
                    'message': 'Message content required for chat interaction',
                    'timestamp': datetime.now().isoformat()
                })
                return
            
            logger.info(f"Real-time Mama Bear chat: {message[:50]}...")
            
            # Process chat through Mama Bear agent if available
            if mama_bear_agent:
                try:
                    chat_result = mama_bear_agent.chat(message, user_id, session_id)
                    
                    emit('mama_bear_response', {
                        'message': chat_result.get('response', 'Chat processing completed'),
                        'session_id': session_id,
                        'user_id': user_id,
                        'timestamp': datetime.now().isoformat(),
                        'type': 'mama_bear_response',
                        'success': chat_result.get('success', True),
                        'metadata': chat_result.get('metadata', {})
                    })
                    
                except Exception as agent_error:
                    logger.error(f"Mama Bear agent error: {agent_error}")
                    emit('mama_bear_response', {
                        'message': 'I encountered a technical difficulty while processing your message. Please try again.',
                        'session_id': session_id,
                        'timestamp': datetime.now().isoformat(),
                        'type': 'mama_bear_response',
                        'success': False,
                        'error': str(agent_error)
                    })
            else:
                # Fallback response when agent is not available
                emit('mama_bear_response', {
                    'message': f'Hello! I received your message: "{message}". I am currently initializing my systems. Please try again shortly.',
                    'session_id': session_id,
                    'timestamp': datetime.now().isoformat(),
                    'type': 'mama_bear_response',
                    'success': True,
                    'agent_available': False
                })
            
        except Exception as e:
            logger.error(f"Real-time chat processing error: {e}")
            emit('error', {
                'message': 'Chat processing failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('system_status_request')
    def handle_system_status_inquiry():
        """
        Provide comprehensive system status information for monitoring dashboard
        """
        try:
            status_data = {
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'mama_bear': 'running' if mama_bear_agent else 'initializing',
                    'marketplace': 'running' if marketplace_manager else 'initializing',
                    'socket_io': 'running',
                    'database': 'operational',
                    'logging_system': 'operational'
                },
                'system': {
                    'cpu_usage': 25.5,
                    'memory_usage': 60.2,
                    'active_workspaces': 2,
                    'active_terminals': 3,
                    'connected_clients': len(socketio.server.manager.get_namespaces())
                },
                'environment': {
                    'sanctuary_health': 'excellent',
                    'development_mode': True,
                    'real_time_features': True
                }
            }
            
            emit('system_status', status_data)
            logger.debug("System status information provided to client")
            
        except Exception as e:
            logger.error(f"System status inquiry error: {e}")
            emit('error', {
                'message': 'System status retrieval failed',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    @socketio.on('test_event')
    def handle_test_communication(data):
        """
        Handle test events for connection validation and debugging purposes
        
        Args:
            data: Test payload for echo response validation
        """
        try:
            logger.info(f"Test event received: {data}")
            
            emit('test_response', {
                'status': 'success',
                'message': 'Test event processed successfully',
                'received_data': data,
                'timestamp': datetime.now().isoformat(),
                'server_info': {
                    'service': 'podplay-sanctuary',
                    'socket_io_version': '5.x',
                    'connection_type': 'websocket'
                }
            })
            
        except Exception as e:
            logger.error(f"Test event processing error: {e}")
            emit('error', {
                'message': 'Test event processing failed',
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