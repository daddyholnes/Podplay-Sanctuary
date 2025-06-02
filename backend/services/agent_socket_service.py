"""
Agent Socket Service
Handles socket communication between frontend and agent orchestrator
"""
import asyncio
from datetime import datetime
import json
from typing import Dict, Any, Optional, List

from flask_socketio import SocketIO, emit, join_room, leave_room
from utils.logging_setup import get_logger

logger = get_logger(__name__)

class AgentSocketService:
    """Socket service for connecting agents with frontend"""
    
    def __init__(self, socketio: SocketIO, agent_orchestrator):
        self.socketio = socketio
        self.agent_orchestrator = agent_orchestrator
        self.active_sessions = {}
        self.user_rooms = {}
        
        # Register socket event handlers
        self.register_handlers()
        
        logger.info("🔌 Agent Socket Service initialized")
    
    def register_handlers(self):
        """Register all socket event handlers"""
        
        @self.socketio.on('connect')
        def handle_connect():
            logger.info(f"Client connected: {request.sid}")
            emit('connected', {'status': 'connected'})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            logger.info(f"Client disconnected: {request.sid}")
            # Clean up any user rooms or sessions
            self._cleanup_session(request.sid)
        
        @self.socketio.on('agent:message')
        def handle_agent_message(data):
            """Handle incoming messages to agents"""
            try:
                agent_type = data.get('agentType')
                content = data.get('content')
                metadata = data.get('metadata', {})
                user_id = data.get('user_id', 'nathan')  # Default to nathan
                
                if not agent_type or not content:
                    emit('agent:error', {
                        'message': 'Invalid message format',
                        'timestamp': datetime.now().isoformat()
                    })
                    return
                
                # Add user to room based on agent type if not already
                room_name = f"{user_id}_{agent_type}"
                if request.sid not in self.user_rooms.get(room_name, []):
                    join_room(room_name)
                    if room_name not in self.user_rooms:
                        self.user_rooms[room_name] = []
                    self.user_rooms[room_name].append(request.sid)
                
                # Start async task to process message
                asyncio.create_task(self._process_agent_message(
                    agent_type, content, metadata, user_id, room_name
                ))
                
                # Emit typing indicator immediately
                emit('agent:state_update', {
                    'agentType': agent_type,
                    'state': {'busy': True, 'typing': True},
                    'timestamp': datetime.now().isoformat()
                }, room=room_name)
                
            except Exception as e:
                logger.error(f"Error handling agent message: {e}")
                emit('agent:error', {
                    'message': f"Failed to process message: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.socketio.on('model_usage_request')
        def handle_model_usage_request(data):
            """Handle requests for model usage statistics"""
            try:
                user_id = data.get('user_id', 'nathan')
                
                # Get usage stats from orchestrator
                usage_stats = self.agent_orchestrator.get_model_usage_stats()
                
                # Emit usage stats
                emit('model_usage_update', {
                    'usage_stats': usage_stats,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error getting model usage: {e}")
                emit('agent:error', {
                    'message': f"Failed to get model usage: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.socketio.on('scout:start_planning')
        def handle_scout_planning(data):
            """Handle start of Scout planning process"""
            try:
                user_id = data.get('user_id', 'nathan')
                project_request = data.get('project_request')
                
                if not project_request:
                    emit('agent:error', {
                        'message': 'Missing project request',
                        'timestamp': datetime.now().isoformat()
                    })
                    return
                
                # Add user to scout room
                room_name = f"{user_id}_scout"
                join_room(room_name)
                if room_name not in self.user_rooms:
                    self.user_rooms[room_name] = []
                self.user_rooms[room_name].append(request.sid)
                
                # Start async task for scout workflow
                asyncio.create_task(self._start_scout_workflow(
                    project_request, user_id, room_name
                ))
                
                # Emit initial state
                emit('scout_workflow_progress', {
                    'stage': 'welcome',
                    'message': 'Starting project planning...',
                    'progress': 0,
                    'timestamp': datetime.now().isoformat()
                }, room=room_name)
                
            except Exception as e:
                logger.error(f"Error starting scout planning: {e}")
                emit('agent:error', {
                    'message': f"Failed to start planning: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.socketio.on('window:requestSync')
        def handle_window_sync_request():
            """Handle window sync requests"""
            try:
                # Get all window states from orchestrator
                windows = self.agent_orchestrator.get_all_window_states()
                
                # Emit full window sync
                emit('window:fullSync', {
                    'windows': windows,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error syncing windows: {e}")
                emit('agent:error', {
                    'message': f"Failed to sync windows: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.socketio.on('window:update')
        def handle_window_update(data):
            """Handle window update events"""
            try:
                window_data = data.get('window')
                
                if not window_data or 'id' not in window_data:
                    emit('agent:error', {
                        'message': 'Invalid window data',
                        'timestamp': datetime.now().isoformat()
                    })
                    return
                
                # Update window in orchestrator
                self.agent_orchestrator.update_window_state(window_data)
                
                # Broadcast update to all clients except sender
                emit('window:update', {
                    'window': window_data,
                    'timestamp': datetime.now().isoformat()
                }, broadcast=True, include_self=False)
                
            except Exception as e:
                logger.error(f"Error updating window: {e}")
                emit('agent:error', {
                    'message': f"Failed to update window: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
        
        @self.socketio.on('window:create')
        def handle_window_create(data):
            """Handle window creation events"""
            try:
                # Create window in orchestrator
                window_id = self.agent_orchestrator.create_window(data)
                
                # Get updated window data
                window_data = self.agent_orchestrator.get_window_state(window_id)
                
                # Broadcast to all clients except sender
                emit('window:create', window_data, broadcast=True, include_self=False)
                
            except Exception as e:
                logger.error(f"Error creating window: {e}")
                emit('agent:error', {
                    'message': f"Failed to create window: {str(e)}",
                    'timestamp': datetime.now().isoformat()
                })
    
    async def _process_agent_message(self, agent_type, content, metadata, user_id, room):
        """Process an agent message asynchronously"""
        try:
            # Get response from orchestrator
            response = await self.agent_orchestrator.process_agent_message(
                agent_type, content, metadata, user_id
            )
            
            # Update agent state
            self.socketio.emit('agent:state_update', {
                'agentType': agent_type,
                'state': {'busy': False, 'typing': False},
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Send response
            self.socketio.emit('agent:response', {
                'agentType': agent_type,
                'content': response.get('content', ''),
                'id': response.get('id', datetime.now().timestamp()),
                'timestamp': datetime.now().isoformat(),
                'metadata': response.get('metadata', {})
            }, room=room)
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            self.socketio.emit('agent:error', {
                'message': f"Failed to process message: {str(e)}",
                'timestamp': datetime.now().isoformat(),
                'agentType': agent_type
            }, room=room)
            
            # Update agent state to not busy
            self.socketio.emit('agent:state_update', {
                'agentType': agent_type,
                'state': {'busy': False, 'typing': False, 'error': True},
                'timestamp': datetime.now().isoformat()
            }, room=room)
    
    async def _start_scout_workflow(self, project_request, user_id, room):
        """Start Scout workflow process asynchronously"""
        try:
            # Initialize workflow
            self.socketio.emit('scout_workflow_progress', {
                'stage': 'welcome',
                'message': 'Analyzing your request...',
                'progress': 5,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Process welcome stage
            await asyncio.sleep(2)  # Simulate processing time
            welcome_result = await self.agent_orchestrator.process_scout_workflow(
                'welcome', project_request, user_id
            )
            
            self.socketio.emit('scout_workflow_progress', {
                'stage': 'planning',
                'message': 'Creating project plan...',
                'progress': 25,
                'data': welcome_result,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Process planning stage
            await asyncio.sleep(3)  # Simulate processing time
            planning_result = await self.agent_orchestrator.process_scout_workflow(
                'planning', project_request, user_id, welcome_result
            )
            
            self.socketio.emit('scout_workflow_progress', {
                'stage': 'workspace',
                'message': 'Setting up workspace...',
                'progress': 50,
                'data': planning_result,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Process workspace stage
            await asyncio.sleep(3)  # Simulate processing time
            workspace_result = await self.agent_orchestrator.process_scout_workflow(
                'workspace', project_request, user_id, planning_result
            )
            
            self.socketio.emit('scout_workflow_progress', {
                'stage': 'production',
                'message': 'Implementing solution...',
                'progress': 75,
                'data': workspace_result,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Process production stage
            await asyncio.sleep(4)  # Simulate processing time
            production_result = await self.agent_orchestrator.process_scout_workflow(
                'production', project_request, user_id, workspace_result
            )
            
            # Complete workflow
            self.socketio.emit('scout_workflow_progress', {
                'stage': 'complete',
                'message': 'Project completed!',
                'progress': 100,
                'data': production_result,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
            # Also emit project_complete event
            self.socketio.emit('scout_project_complete', {
                'project': production_result,
                'timestamp': datetime.now().isoformat()
            }, room=room)
            
        except Exception as e:
            logger.error(f"Error in Scout workflow: {e}")
            self.socketio.emit('agent:error', {
                'message': f"Scout workflow error: {str(e)}",
                'timestamp': datetime.now().isoformat(),
                'agentType': 'scout'
            }, room=room)
            
            # Update agent state
            self.socketio.emit('agent:state_update', {
                'agentType': 'scout',
                'state': {'busy': False, 'error': True},
                'timestamp': datetime.now().isoformat()
            }, room=room)
    
    def _cleanup_session(self, sid):
        """Clean up session data when a client disconnects"""
        # Remove from any rooms
        for room_name, sids in self.user_rooms.items():
            if sid in sids:
                sids.remove(sid)
                leave_room(room_name, sid)
        
        # Remove any active sessions
        if sid in self.active_sessions:
            del self.active_sessions[sid]
    
    def broadcast_model_usage_update(self, usage_stats):
        """Broadcast model usage updates to all clients"""
        self.socketio.emit('model_usage_update', {
            'usage_stats': usage_stats,
            'timestamp': datetime.now().isoformat()
        }, broadcast=True)
    
    def broadcast_quota_alert(self, model_name, quota_info):
        """Broadcast quota alerts to all clients"""
        self.socketio.emit('model_quota_alert', {
            'model': model_name,
            'quota_info': quota_info,
            'timestamp': datetime.now().isoformat()
        }, broadcast=True)
    
    def broadcast_window_update(self, window_data):
        """Broadcast window updates to all clients"""
        self.socketio.emit('window:update', {
            'window': window_data,
            'timestamp': datetime.now().isoformat()
        }, broadcast=True)