"""
Mama Bear Agent Service

Core AI agent service providing intelligent assistance and proactive 
development environment management for the Podplay Sanctuary.
"""

import json
from datetime import datetime
from typing import Dict, Any, Optional, List
from models.database import get_db_connection
from services.enhanced_mama_service import EnhancedMamaBear
from services.discovery_agent_service import ProactiveDiscoveryAgent
from utils.logging_setup import get_logger

logger = get_logger(__name__)

class MamaBearAgent:
    """
    Professional AI agent service with comprehensive development assistance capabilities
    
    Core responsibilities:
    - Intelligent chat interactions with persistent memory
    - Proactive tool discovery and recommendations
    - Learning from user interactions to improve assistance
    - Safe code execution in sandbox environments
    """
    
    def __init__(self, marketplace_manager):
        """
        Initialize Mama Bear Agent with required dependencies
        
        Args:
            marketplace_manager: MCP marketplace service instance
        """
        self.marketplace = marketplace_manager
        self.enhanced_mama = EnhancedMamaBear()
        self.discovery_agent = ProactiveDiscoveryAgent(marketplace_manager, self.enhanced_mama)
        
        logger.info("Mama Bear Agent initialized successfully")
    
    def chat(self, message: str, user_id: str = "nathan", session_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Process chat interactions with intelligent context and memory integration
        
        Args:
            message: User message to process
            user_id: User identifier for personalization
            session_id: Session identifier for context continuity
            
        Returns:
            Dictionary containing response and metadata
        """
        try:
            # Store user message in persistent memory
            self.enhanced_mama.store_memory(
                f"User ({user_id}): {message}",
                {
                    "type": "chat_message",
                    "user_id": user_id,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            # Retrieve contextual insights for personalized response
            context_insights = self.enhanced_mama.get_contextual_insights(f"chat context for {user_id}")
            
            # Generate intelligent response based on message content
            if self._is_mcp_related_query(message):
                response = self._handle_mcp_query(message, user_id)
            elif self._is_code_related_query(message):
                response = self._handle_code_query(message, user_id)
            else:
                response = self._generate_general_response(message, user_id, context_insights)
            
            # Store response in memory for future context
            self.enhanced_mama.store_memory(
                f"Mama Bear response: {response[:100]}...",
                {
                    "type": "chat_response",
                    "user_id": user_id,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            return {
                "success": True,
                "response": response,
                "metadata": {
                    "user_id": user_id,
                    "session_id": session_id,
                    "timestamp": datetime.now().isoformat(),
                    "memory_active": bool(self.enhanced_mama.memory),
                    "sandbox_active": bool(self.enhanced_mama.together_client),
                    "context_insights": len(context_insights.get("relevant_memories", []))
                }
            }
            
        except Exception as e:
            logger.error(f"Chat processing error: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "I encountered a technical difficulty while processing your message. Please try again."
            }
    
    def _is_mcp_related_query(self, message: str) -> bool:
        """Check if message relates to MCP server operations"""
        mcp_keywords = ['mcp', 'server', 'marketplace', 'install', 'discover', 'search']
        return any(keyword in message.lower() for keyword in mcp_keywords)
    

    
    def _is_code_related_query(self, message: str) -> bool:
        """Check if message involves code execution or analysis"""
        code_keywords = ['code', 'execute', 'run', 'debug', 'analyze']
        return any(keyword in message.lower() for keyword in code_keywords)
    
    def _handle_mcp_query(self, message: str, user_id: str) -> str:
        """Handle MCP-related queries with marketplace integration"""
        if 'search' in message.lower() or 'find' in message.lower():
            trending_servers = self.marketplace.get_trending_servers(5)
            server_names = [server['name'] for server in trending_servers]
            return f"I found these popular MCP servers for you: {', '.join(server_names)}. Would you like details about any of these or help with installation?"
        
        if 'install' in message.lower():
            return "I can help you install MCP servers. Which specific server would you like to install? I have access to database tools, cloud services, development utilities, and AI integrations."
        
        return "I can help you discover, search, and manage MCP servers in our marketplace. We have servers for databases, cloud services, AI tools, and development utilities. What specific functionality are you looking for?"
    

    
    def _handle_code_query(self, message: str, user_id: str) -> str:
        """Handle code-related queries with sandbox integration"""
        if self.enhanced_mama.together_client:
            return "I can execute and analyze code safely in our sandbox environment. Please share the code you'd like me to review or run, and I'll provide analysis and results."
        return "Code execution capabilities are currently being prepared. I can still provide code guidance and suggestions. What programming challenge can I help you with?"
    
    def _generate_general_response(self, message: str, user_id: str, context_insights: Dict) -> str:
        """Generate contextual response for general queries"""
        memory_context = ""
        if context_insights.get("relevant_memories"):
            memory_context = f" I remember our previous discussions about {len(context_insights['relevant_memories'])} related topics."
        
        return f"Hello {user_id}! I'm Mama Bear, your development environment assistant.{memory_context} I can help with MCP server management, code analysis, and development guidance. How can I assist you with your Podplay Sanctuary today?"
    

    

    

    

    
    def learn_from_interaction(self, interaction_type: str, context: str, insight: str):
        """
        Learn from user interactions with persistent storage
        
        Args:
            interaction_type: Type of interaction (chat, command, etc.)
            context: Interaction context
            insight: Learning insight to store
        """
        learning_data = {
            "type": interaction_type,
            "context": context,
            "insight": insight,
            "timestamp": datetime.now().isoformat()
        }
        
        # Store in local database
        try:
            with get_db_connection() as conn:
                conn.execute(
                    "INSERT INTO agent_learning (interaction_type, context, insight) VALUES (?, ?, ?)",
                    (interaction_type, json.dumps({"raw_context": context}), insight)
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to store learning data: {e}")
        
        # Store in persistent memory
        self.enhanced_mama.store_memory(
            f"Learned from {interaction_type}: {insight}",
            {"type": "learning", "interaction_type": interaction_type}
        )
        
        logger.info(f"Learning stored: {insight[:50]}...")
    
    def execute_code_safely(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Execute code safely in sandbox environment with comprehensive error handling
        
        Args:
            code: Code to execute
            language: Programming language
            
        Returns:
            Execution result dictionary
        """
        if not self.enhanced_mama.together_client:
            return {
                "success": False,
                "error": "Sandbox environment not available",
                "output": "Please configure Together.ai API key for code execution capabilities"
            }
        
        return self.enhanced_mama.execute_in_sandbox(code, language)
    
    def get_memory_insights(self, query: str) -> Dict[str, Any]:
        """
        Retrieve insights from persistent memory system
        
        Args:
            query: Query for memory search
            
        Returns:
            Memory insights dictionary
        """
        return self.enhanced_mama.get_contextual_insights(query)