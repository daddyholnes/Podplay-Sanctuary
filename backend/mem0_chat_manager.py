"""
Enhanced Mem0 Chat Manager for Multi-Model Persistence
Handles intelligent storage and retrieval of chat sessions across different AI models
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Optional, Any
from mem0 import MemoryClient

class Mem0ChatManager:
    def __init__(self):
        """Initialize Mem0 client with API key"""
        # Get API key from environment variables for security
        api_key = os.getenv('MEM0_API_KEY')
        if not api_key:
            raise ValueError("MEM0_API_KEY environment variable not set or empty")
        
        os.environ["MEM0_API_KEY"] = api_key
        self.client = MemoryClient()
        self.base_user_id = "podplay_vertex_garden"
        
    def _get_model_user_id(self, model_id: str) -> str:
        """Create unique user ID for each model to separate their conversations"""
        return f"{self.base_user_id}_{model_id}"
    
    def _get_session_agent_id(self, session_id: str) -> str:
        """Create unique agent ID for each session"""
        return f"session_{session_id}"
    
    async def create_chat_session(self, model_id: str, session_title: str = None) -> Dict[str, Any]:
        """Create a new chat session for a specific model"""
        session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{model_id}"
        
        if not session_title:
            session_title = f"Chat with {model_id}"
        
        session_metadata = {
            "session_id": session_id,
            "model_id": model_id,
            "title": session_title,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "message_count": 0,
            "total_tokens": 0,
            "cost_estimate": 0.0,
            "is_archived": False,
            "tags": [],
            "type": "chat_session"
        }
        
        try:
            # Save session metadata to Mem0
            response = await self._save_to_mem0(
                content=f"Started new chat session: {session_title}",
                user_id=self._get_model_user_id(model_id),
                agent_id=self._get_session_agent_id(session_id),
                metadata=session_metadata,
                categories=["chat_session", "initialization", model_id]
            )
            
            return {
                "success": True,
                "session": {
                    "id": session_id,
                    "model_id": model_id,
                    "title": session_title,
                    "created_at": session_metadata["created_at"],
                    "updated_at": session_metadata["updated_at"],
                    "message_count": 0,
                    "total_tokens": 0,
                    "cost_estimate": 0.0,
                    "is_archived": False,
                    "tags": [],
                    "mem0_memory_id": response.get('id') if response else None
                }
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def save_message(self, session_id: str, model_id: str, message: Dict[str, Any]) -> Dict[str, Any]:
        """Save a single message to the chat session"""
        try:
            message_metadata = {
                "session_id": session_id,
                "model_id": model_id,
                "message_id": message.get("id"),
                "role": message.get("role"),
                "timestamp": message.get("timestamp", datetime.now().isoformat()),
                "tokens_used": message.get("tokens_used", 0),
                "cost": message.get("cost", 0.0),
                "type": "chat_message"
            }
            
            # Format content for better memory storage
            content = f"[{message['role'].upper()}]: {message['content']}"
            
            response = await self._save_to_mem0(
                content=content,
                user_id=self._get_model_user_id(model_id),
                agent_id=self._get_session_agent_id(session_id),
                metadata=message_metadata,
                categories=["chat_message", message["role"], model_id]
            )
            
            return {
                "success": True,
                "message_id": message.get("id"),
                "mem0_memory_id": response.get('id') if response else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_session_messages(self, session_id: str, model_id: str) -> Dict[str, Any]:
        """Retrieve all messages for a specific session"""
        try:
            # Search for all messages in this session
            search_query = f"session_id:{session_id}"
            
            results = self.client.search(
                query=search_query,
                user_id=self._get_model_user_id(model_id),
                threshold=0.1,  # Very low threshold to get all session messages
                page_size=100
            )
            
            messages = []
            if results and isinstance(results, list):
                for result in results:
                    metadata = result.get('metadata', {})
                    if metadata.get('type') == 'chat_message' and metadata.get('session_id') == session_id:
                        # Parse the content back to message format
                        content = result.get('content', '')
                        if content.startswith('[USER]:'):
                            role = 'user'
                            text = content[7:].strip()
                        elif content.startswith('[ASSISTANT]:'):
                            role = 'assistant'
                            text = content[12:].strip()
                        else:
                            continue
                        
                        messages.append({
                            "id": metadata.get('message_id'),
                            "session_id": session_id,
                            "role": role,
                            "content": text,
                            "timestamp": metadata.get('timestamp'),
                            "tokens_used": metadata.get('tokens_used', 0),
                            "cost": metadata.get('cost', 0.0),
                            "metadata": metadata
                        })
            
            # Sort messages by timestamp
            messages.sort(key=lambda x: x.get('timestamp', ''))
            
            return {
                "success": True,
                "messages": messages,
                "session_id": session_id,
                "message_count": len(messages)
            }
        except Exception as e:
            return {"success": False, "error": str(e), "messages": []}
    
    async def get_model_sessions(self, model_id: str, limit: int = 50) -> Dict[str, Any]:
        """Get all chat sessions for a specific model"""
        try:
            # Search for all sessions for this model
            search_query = f"model_id:{model_id} type:chat_session"
            
            results = self.client.search(
                query=search_query,
                user_id=self._get_model_user_id(model_id),
                threshold=0.1,
                page_size=limit
            )
            
            sessions = []
            if results and isinstance(results, list):
                for result in results:
                    metadata = result.get('metadata', {})
                    if metadata.get('type') == 'chat_session':
                        sessions.append({
                            "id": metadata.get('session_id'),
                            "model_id": model_id,
                            "title": metadata.get('title'),
                            "created_at": metadata.get('created_at'),
                            "updated_at": metadata.get('updated_at'),
                            "message_count": metadata.get('message_count', 0),
                            "total_tokens": metadata.get('total_tokens', 0),
                            "cost_estimate": metadata.get('cost_estimate', 0.0),
                            "is_archived": metadata.get('is_archived', False),
                            "tags": metadata.get('tags', [])
                        })
            
            # Sort sessions by updated_at (most recent first)
            sessions.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
            
            return {
                "success": True,
                "sessions": sessions,
                "model_id": model_id,
                "total_count": len(sessions)
            }
        except Exception as e:
            return {"success": False, "error": str(e), "sessions": []}
    
    async def search_conversations(self, query: str, model_id: str = None, limit: int = 20) -> Dict[str, Any]:
        """Search across conversations using natural language"""
        try:
            user_id = self._get_model_user_id(model_id) if model_id else None
            
            results = self.client.search(
                query=query,
                user_id=user_id,
                threshold=0.3,  # Medium threshold for relevant results
                page_size=limit
            )
            
            conversations = []
            if results and isinstance(results, list):
                for result in results:
                    metadata = result.get('metadata', {})
                    conversations.append({
                        "content": result.get('content'),
                        "score": result.get('score', 0),
                        "session_id": metadata.get('session_id'),
                        "model_id": metadata.get('model_id'),
                        "timestamp": metadata.get('timestamp'),
                        "type": metadata.get('type'),
                        "metadata": metadata
                    })
            
            return {
                "success": True,
                "results": conversations,
                "query": query,
                "total_count": len(conversations)
            }
        except Exception as e:
            return {"success": False, "error": str(e), "results": []}
    
    async def update_session_metadata(self, session_id: str, model_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update session metadata (title, tags, etc.)"""
        try:
            # This would require retrieving the session memory and updating it
            # For now, we'll create a new memory entry with the updates
            update_content = f"Session updated: {json.dumps(updates)}"
            
            update_metadata = {
                "session_id": session_id,
                "model_id": model_id,
                "type": "session_update",
                "updates": updates,
                "updated_at": datetime.now().isoformat()
            }
            
            response = await self._save_to_mem0(
                content=update_content,
                user_id=self._get_model_user_id(model_id),
                agent_id=self._get_session_agent_id(session_id),
                metadata=update_metadata,
                categories=["session_update", model_id]
            )
            
            return {
                "success": True,
                "session_id": session_id,
                "updates_applied": updates,
                "mem0_memory_id": response.get('id') if response else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def get_conversation_context(self, session_id: str, model_id: str, message_limit: int = 10) -> Dict[str, Any]:
        """Get recent conversation context for better AI responses"""
        try:
            session_data = await self.get_session_messages(session_id, model_id)
            
            if not session_data.get("success"):
                return session_data
            
            messages = session_data.get("messages", [])
            
            # Get the most recent messages
            recent_messages = messages[-message_limit:] if len(messages) > message_limit else messages
            
            # Format for AI context
            context = {
                "session_id": session_id,
                "model_id": model_id,
                "recent_messages": recent_messages,
                "total_messages": len(messages),
                "conversation_summary": self._generate_conversation_summary(messages)
            }
            
            return {
                "success": True,
                "context": context
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _generate_conversation_summary(self, messages: List[Dict[str, Any]]) -> str:
        """Generate a brief summary of the conversation"""
        if not messages:
            return "New conversation"
        
        total_messages = len(messages)
        user_messages = len([m for m in messages if m.get('role') == 'user'])
        assistant_messages = len([m for m in messages if m.get('role') == 'assistant'])
        
        # Get first and last message timestamps
        first_msg_time = messages[0].get('timestamp', '') if messages else ''
        last_msg_time = messages[-1].get('timestamp', '') if messages else ''
        
        summary = f"Conversation with {total_messages} messages ({user_messages} user, {assistant_messages} assistant)"
        
        if first_msg_time and last_msg_time:
            summary += f" from {first_msg_time[:10]} to {last_msg_time[:10]}"
        
        return summary
    
    async def _save_to_mem0(self, content: str, user_id: str, agent_id: str, 
                          metadata: Dict[str, Any], categories: List[str]) -> Optional[Dict[str, Any]]:
        """Internal method to save data to Mem0"""
        try:
            # Format as a message for Mem0
            messages = [{
                "role": "user",
                "content": content
            }]
            
            response = self.client.add(
                messages=messages,
                user_id=user_id,
                agent_id=agent_id,
                metadata=metadata,
                categories=categories
            )
            
            return response
        except Exception as e:
            print(f"Error saving to Mem0: {str(e)}")
            return None

    async def get_all_memories(self, user_id: str = None) -> Dict[str, Any]:
        """Get all memories for a user"""
        try:
            if not user_id:
                user_id = self.base_user_id
            
            # Get all memories for the user
            memories = self.client.get_all(user_id=user_id)
            
            return {
                "success": True,
                "memories": memories,
                "count": len(memories) if memories else 0
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "memories": [],
                "count": 0
            }
    
    async def search_memories(self, query: str, user_id: str = None, limit: int = 10) -> Dict[str, Any]:
        """Search memories using a query"""
        try:
            if not user_id:
                user_id = self.base_user_id
            
            # Search memories using Mem0's search functionality
            results = self.client.search(
                query=query,
                user_id=user_id,
                limit=limit
            )
            
            return {
                "success": True,
                "results": results,
                "query": query,
                "count": len(results) if results else 0
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "results": [],
                "query": query,
                "count": 0
            }

# Global instance - only create if API key is available
try:
    if os.getenv('MEM0_API_KEY'):
        mem0_chat_manager = Mem0ChatManager()
    else:
        mem0_chat_manager = None
        print("🐻 Mama Bear: MEM0_API_KEY not set, mem0 functionality disabled")
except Exception as e:
    mem0_chat_manager = None
    print(f"🐻 Mama Bear: Failed to initialize Mem0ChatManager: {e}")
