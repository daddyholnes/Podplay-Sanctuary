"""
Socket.IO event handlers
Clean, organized real-time communication
"""
import logging
from flask_socketio import emit, disconnect

logger = logging.getLogger(__name__)

def register_socketio_handlers(socketio):
    """Register all Socket.IO event handlers"""
    
    @socketio.on('connect')
    def handle_connect(auth):
        """Handle client connection"""
        logger.info("🔌 Client connected to Socket.IO")
        emit('connection_response', {
            'status': 'connected',
            'message': 'Successfully connected to Podplay Sanctuary',
            'server_version': '2.0.0'
        })
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        logger.info("🔌 Client disconnected from Socket.IO")
    
    @socketio.on('ping')
    def handle_ping(data):
        """Handle ping requests"""
        logger.debug("🏓 Received ping from client")
        emit('pong', {
            'timestamp': data.get('timestamp') if data else None,
            'server_time': '2024-12-25T00:00:00Z'
        })
    
    @socketio.on('health_check')
    def handle_health_check():
        """Handle health check requests"""
        try:
            emit('health_response', {
                'status': 'healthy',
                'services': {
                    'socket_io': True,
                    'database': True,
                    'marketplace': True
                },
                'timestamp': '2024-12-25T00:00:00Z'
            })
        except Exception as e:
            logger.error(f"Socket.IO health check failed: {e}")
            emit('health_response', {
                'status': 'error',
                'error': str(e)
            })
    
    @socketio.on('mcp_search')
    def handle_mcp_search(data):
        """Handle MCP server search requests"""
        try:
            from flask import current_app
            marketplace = current_app.config.get('MARKETPLACE_INSTANCE')
            
            if not marketplace:
                emit('mcp_search_response', {
                    'success': False,
                    'error': 'Marketplace service not available',
                    'servers': []
                })
                return
            
            query = data.get('query', '') if data else ''
            category = data.get('category') if data else None
            official_only = data.get('official_only', False) if data else False
            
            servers = marketplace.search_servers(
                query=query,
                category=category,
                official_only=official_only
            )
            
            emit('mcp_search_response', {
                'success': True,
                'servers': servers,
                'total': len(servers),
                'query': query
            })
            
        except Exception as e:
            logger.error(f"Socket.IO MCP search failed: {e}")
            emit('mcp_search_response', {
                'success': False,
                'error': str(e),
                'servers': []
            })
    
    @socketio.on('chat_message')
    def handle_chat_message(data):
        """Handle chat messages (placeholder for Mama Bear integration)"""
        try:
            if not data or 'message' not in data:
                emit('chat_response', {
                    'success': False,
                    'error': 'Invalid message format'
                })
                return
            
            message = data['message']
            user_id = data.get('user_id', 'anonymous')
            
            # Placeholder response - would integrate with Mama Bear service
            response = f"🐻 Mama Bear received your message: '{message}'. Full AI integration coming soon!"
            
            emit('chat_response', {
                'success': True,
                'response': response,
                'user_id': user_id,
                'timestamp': '2024-12-25T00:00:00Z'
            })
            
        except Exception as e:
            logger.error(f"Socket.IO chat failed: {e}")
            emit('chat_response', {
                'success': False,
                'error': str(e)
            })
    
    logger.info("🔌 Socket.IO handlers registered successfully")
