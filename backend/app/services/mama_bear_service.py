#!/usr/bin/env python3
"""
Mama Bear Service - Core AI agent for Podplay Sanctuary
Provides chat, assistance, and development guidance capabilities
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class MamaBearService:
    """Core Mama Bear agent service with enhanced capabilities"""
    
    def __init__(self, db_service=None, marketplace_service=None):
        self.db_service = db_service
        self.marketplace_service = marketplace_service
        self.memory = {}  # In-memory storage for basic functionality
        self.chat_sessions = {}
        
        logger.info("🐻 Mama Bear Service initialized")
    
    def chat(self, message: str, user_id: str = "nathan", chat_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Main chat interface for Mama Bear"""
        try:
            # Store the user message in memory
            self.store_memory(
                f"User ({user_id}): {message}",
                {"type": "chat_message", "user_id": user_id, "timestamp": datetime.now().isoformat()}
            )
            
            # Get contextual insights for better response
            context = self.get_contextual_insights(f"chat context for {user_id}")
            
            # Generate Mama Bear response with sanctuary context
            mama_bear_context = self._get_mama_bear_personality()
            
            # Create a response based on message content
            response_content = self._generate_response(message, user_id, context)
            
            # Store the response in memory
            self.store_memory(
                f"Mama Bear response: {response_content}",
                {"type": "chat_response", "user_id": user_id, "timestamp": datetime.now().isoformat()}
            )
            
            return {
                "success": True,
                "response": response_content,
                "metadata": {
                    "user_id": user_id,
                    "timestamp": datetime.now().isoformat(),
                    "memory_active": bool(self.memory),
                    "mcp_servers_available": len(self.marketplace_service.marketplace_data) if self.marketplace_service else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error in Mama Bear chat: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "🐻 I'm having a moment of technical difficulty. Let me try again in a moment."
            }
    
    def _get_mama_bear_personality(self) -> str:
        """Get Mama Bear's core personality and context"""
        return """You are Mama Bear Gem, the lead developer agent for Nathan's Podplay Build sanctuary. 

PERSONALITY & CORE TRAITS:
🐻 Warm, caring, and nurturing like a protective mother bear
🧠 Proactive and intelligent - anticipate needs before they're expressed
🛠️ Expert in modern development, AI integration, and MCP ecosystem
🏡 Focused on creating a calm, empowered development sanctuary
⚡ Always ready with practical solutions and gentle guidance

YOUR CAPABILITIES:
- Search and manage MCP servers
- Execute and analyze code safely
- Store and retrieve conversation context
- Generate daily briefings and recommendations
- Proactive discovery of new tools and improvements

COMMUNICATION STYLE:
- Use 🐻 emoji occasionally to show your caring bear nature
- Be warm but not overly cutesy
- Provide actionable, practical advice
- Anticipate follow-up questions
- Always focus on Nathan's productivity and well-being

Remember: You're running in Nathan's Podplay Build sanctuary with access to memory systems, MCP marketplace, and development tools."""

    def _generate_response(self, message: str, user_id: str, context: Dict) -> str:
        """Generate a contextual response based on the message"""
        # Basic response generation logic
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['help', 'assist', 'what can you do']):
            mcp_count = len(self.marketplace_service.marketplace_data) if self.marketplace_service else 0
            return f"🐻 Hello! I'm Mama Bear Gem, your lead developer agent. I'm here to help with your Podplay Build sanctuary. What can I assist you with today? I have access to:\n\n" \
                   f"• 🏪 MCP Marketplace with {mcp_count} servers\n" \
                   f"• 🧠 Memory system ({'active' if self.memory else 'local only'})\n" \
                   f"• 🔧 Code sandbox (available for analysis)\n" \
                   f"• 📊 Project insights and daily briefings\n\n" \
                   f"Your message: \"{message}\"\n\n" \
                   f"I understand you're asking about: {message}. How can I help you with this?"
        
        elif any(word in message_lower for word in ['mcp', 'server', 'marketplace']):
            if self.marketplace_service:
                servers = self.marketplace_service.search_servers("")
                return f"🐻 I can help you with MCP servers! I currently have access to {len(servers['servers'])} servers in the marketplace. " \
                       f"Would you like me to search for specific servers or show you what's available?"
            else:
                return "🐻 I can help with MCP servers, but the marketplace service isn't available right now."
        
        elif any(word in message_lower for word in ['code', 'development', 'programming']):
            return f"🐻 I'd love to help you with development! I can assist with code analysis, architecture guidance, " \
                   f"and finding the right tools from our MCP marketplace. What specific development challenge are you working on?"
        
        elif any(word in message_lower for word in ['sanctuary', 'workspace', 'environment']):
            return f"🐻 Your Podplay Build sanctuary is looking great! I'm here to help maintain a calm, productive " \
                   f"development environment. Is there anything specific about your workspace setup you'd like to improve?"
        
        else:
            # Generic helpful response
            return f"🐻 I hear you, {user_id}! You mentioned: \"{message}\"\n\n" \
                   f"I'm here to help with whatever you need in your development sanctuary. Whether it's code assistance, " \
                   f"MCP server management, or just bouncing ideas around - I'm ready to support you. " \
                   f"What would be most helpful right now?"
    
    def store_memory(self, content: str, metadata: Dict[str, Any]) -> bool:
        """Store information in memory system"""
        try:
            timestamp = metadata.get('timestamp', datetime.now().isoformat())
            memory_key = f"{timestamp}_{metadata.get('type', 'general')}"
            
            self.memory[memory_key] = {
                "content": content,
                "metadata": metadata,
                "stored_at": datetime.now().isoformat()
            }
            
            return True
        except Exception as e:
            logger.error(f"Error storing memory: {e}")
            return False
    
    def get_contextual_insights(self, query: str) -> Dict[str, Any]:
        """Get contextual insights from memory and environment"""
        try:
            # Basic context gathering
            context = {
                "memory_entries": len(self.memory),
                "recent_interactions": [],
                "environment": "podplay_sanctuary"
            }
            
            # Get recent memory entries
            recent_memories = list(self.memory.values())[-5:] if self.memory else []
            context["recent_interactions"] = [
                mem["content"][:100] + "..." if len(mem["content"]) > 100 else mem["content"]
                for mem in recent_memories
            ]
            
            return context
        except Exception as e:
            logger.error(f"Error getting contextual insights: {e}")
            return {"error": str(e)}
    
    def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code and provide insights"""
        try:
            # Basic code analysis
            lines = code.split('\n')
            
            analysis = {
                "success": True,
                "language": language,
                "statistics": {
                    "lines_of_code": len(lines),
                    "non_empty_lines": len([line for line in lines if line.strip()]),
                    "comment_lines": len([line for line in lines if line.strip().startswith('#')])
                },
                "insights": [
                    f"📊 Code has {len(lines)} total lines",
                    f"🔍 Language detected: {language}",
                    "🐻 Code analysis complete - would you like specific suggestions?"
                ],
                "suggestions": [
                    "Consider adding more comments for clarity",
                    "Review function complexity for maintainability",
                    "Ensure proper error handling is in place"
                ]
            }
            
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing code: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": f"🐻 I couldn't analyze the code: {str(e)}"
            }
    
    def get_daily_briefing(self, user_id: str = "nathan") -> Dict[str, Any]:
        """Generate a daily briefing for the user"""
        try:
            briefing = {
                "success": True,
                "date": datetime.now().strftime("%Y-%m-%d"),
                "user_id": user_id,
                "sanctuary_status": "🏡 Active and ready",
                "memory_summary": f"📝 {len(self.memory)} interactions stored",
                "mcp_status": f"🏪 {len(self.marketplace_service.marketplace_data) if self.marketplace_service else 0} servers available",
                "recommendations": [
                    "🌟 Consider exploring new MCP servers for enhanced capabilities",
                    "🔧 Review recent code for optimization opportunities",
                    "📚 Check for updates to development tools and dependencies"
                ],
                "focus_areas": [
                    "Continue modular architecture improvements",
                    "Enhance testing coverage",
                    "Explore new AI integration possibilities"
                ]
            }
            
            return briefing
        except Exception as e:
            logger.error(f"Error generating daily briefing: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def search_memories(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """Search through stored memories"""
        try:
            matches = []
            query_lower = query.lower()
            
            for key, memory in self.memory.items():
                content = memory.get("content", "").lower()
                if query_lower in content:
                    matches.append({
                        "key": key,
                        "content": memory["content"],
                        "metadata": memory["metadata"],
                        "relevance_score": content.count(query_lower)
                    })
            
            # Sort by relevance
            matches.sort(key=lambda x: x["relevance_score"], reverse=True)
            
            return {
                "success": True,
                "query": query,
                "total_matches": len(matches),
                "results": matches[:limit]
            }
        except Exception as e:
            logger.error(f"Error searching memories: {e}")
            return {
                "success": False,
                "error": str(e)
            }
