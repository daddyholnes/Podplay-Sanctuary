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
from services.mama_bear_capability_system import mama_bear_capabilities
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
        self.capability_system = mama_bear_capabilities  # Full feature awareness
        
        logger.info("🐻 Mama Bear Agent initialized with comprehensive capability awareness")
    
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
        # Check MCP server management capability
        mcp_capability = self.check_capability("mcp_server_management")
        if not mcp_capability["available"]:
            return "🐻 MCP server management capabilities are currently being prepared. I'll be able to help you discover, install, and manage MCP servers soon!"
        
        if 'search' in message.lower() or 'find' in message.lower():
            trending_servers = self.marketplace.get_trending_servers(5)
            server_names = [server['name'] for server in trending_servers]
            return f"""🔍 **I found these popular MCP servers for you:**

{chr(10).join(f'• **{server}**' for server in server_names)}

**My MCP capabilities include:**
• Discovering new servers from GitHub and marketplace
• Installing and configuring servers automatically  
• Managing server lifecycles and updates
• Providing personalized recommendations

Would you like details about any of these servers, or shall I help you search for something specific? 🛠️"""
        
        if 'install' in message.lower():
            return """🛠️ **I can help you install MCP servers!** 

I have access to servers for:
• **Database tools** (PostgreSQL, MongoDB, Redis)
• **Cloud services** (AWS, Google Cloud, Azure)  
• **Development utilities** (Git, Docker, CI/CD)
• **AI integrations** (OpenAI, Anthropic, local models)

Which specific server would you like to install? I'll handle the entire setup process including configuration and testing! 🚀"""
        
        return f"""🏪 **I can help you with our comprehensive MCP marketplace!**

**Available capabilities:**
• **Discover** new servers from 500+ repositories
• **Search** by functionality, language, or provider
• **Install** with automatic dependency management
• **Configure** optimal settings for your environment
• **Monitor** server health and performance

We have servers for databases, cloud services, AI tools, development utilities, and much more. What specific functionality are you looking for? 

💡 *I can also proactively suggest servers based on your current projects!*"""
    

    
    def _handle_code_query(self, message: str, user_id: str) -> str:
        """Handle code-related queries with sandbox integration"""
        # Check code execution and analysis capabilities
        code_exec_capability = self.check_capability("sandbox_execution")
        code_analysis_capability = self.check_capability("code_analysis")
        
        response = "🧠 **I can help with comprehensive code assistance!**\n\n"
        
        if code_exec_capability["available"] and self.enhanced_mama.together_client:
            response += """**🔒 Secure Code Execution:**
• Run Python, JavaScript, and other languages safely
• Execute in isolated NixOS sandbox environment
• Real-time output and error handling
• Memory and resource protection

"""
        
        if code_analysis_capability["available"]:
            response += """**🔍 Advanced Code Analysis:**
• Security vulnerability scanning
• Performance bottleneck identification  
• Code quality and maintainability assessment
• Best practices recommendations
• Refactoring suggestions

"""
        
        response += """**📚 Additional Code Assistance:**
• Code generation and boilerplate creation
• Debugging help and error resolution
• Architecture guidance and design patterns
• Testing strategy and implementation
• Documentation generation

"""
        
        if 'execute' in message.lower() or 'run' in message.lower():
            if code_exec_capability["available"] and self.enhanced_mama.together_client:
                response += "**Ready to execute!** Please share the code you'd like me to run, and I'll execute it safely in our sandbox environment. 🚀"
            else:
                response += "Code execution capabilities are currently being prepared. I can still provide code analysis and guidance! 🛠️"
        elif 'analyze' in message.lower() or 'review' in message.lower():
            response += "**Ready to analyze!** Share your code and I'll provide comprehensive analysis including security, performance, and quality insights. 📊"
        else:
            response += "What specific programming challenge can I help you with? I'm ready to execute, analyze, or guide you through any coding task! 💻"
        
        return response
    
    def _generate_general_response(self, message: str, user_id: str, context_insights: Dict) -> str:
        """Generate contextual response for general queries"""
        message_lower = message.lower()
        
        # Check if user is asking about Mama Bear's capabilities
        if any(phrase in message_lower for phrase in [
            "what can you do", "your capabilities", "your features", 
            "help me understand", "what are you", "tell me about yourself",
            "how can you help", "what do you offer"
        ]):
            return self.capability_system.get_feature_awareness_response()
        
        # Check for autonomous action requests
        if any(phrase in message_lower for phrase in [
            "can you automatically", "set up project", "create environment",
            "autonomous", "do this for me", "automate"
        ]):
            actions_summary = self.capability_system.get_capability_summary()
            action_list = "\n".join([f"• {action.name}: {action.description}" 
                                   for action in self.capability_system.autonomous_actions.values()])
            
            return f"""🐻 **Yes! I can autonomously handle complex workflows.** Here are my **{actions_summary['autonomous_actions']} autonomous capabilities**:

{action_list}

Just describe what you'd like to accomplish, and I'll break it down into steps and execute it autonomously. What project or task would you like me to help with? 🚀"""
        
        # Model selection guidance
        if any(phrase in message_lower for phrase in [
            "which model", "ai model", "model selection", "optimal model"
        ]):
            return """🧠 **I intelligently select the optimal AI model for each task:**

• **Flash 8B** - Quick summaries, simple questions, fast responses
• **Flash 002** - Standard development work, code review, planning  
• **Pro 002** - Complex reasoning, architecture design, difficult problems
• **Vision Models** - Image analysis, file parsing, visual content

I automatically choose based on task complexity, cost efficiency, and speed requirements. You don't need to worry about model selection - I handle it intelligently! 

What task can I help optimize for you? 🎯"""
        
        # Memory-aware default response
        memory_context = ""
        if context_insights.get("relevant_memories"):
            memory_context = f" I remember our previous discussions about {len(context_insights['relevant_memories'])} related topics."
        
        # Default helpful response with capability hints
        return f"""🐻 I understand you need help with: "{message}"{memory_context}

I'm here to assist with comprehensive development support! I can:

• **Chat intelligently** with full memory of our conversations
• **Execute code safely** in secure NixOS sandboxes  
• **Manage your workspace** and development environments
• **Discover tools** and recommend MCP servers
• **Analyze and optimize** your codebase
• **Plan and execute** complex projects autonomously

Would you like me to elaborate on any of these capabilities, or shall we dive into your specific request? 

💡 *Tip: Ask "What can you do?" for my complete feature overview!*"""
    

    

    

    

    
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
    
    def check_capability(self, capability_name: str) -> Dict[str, Any]:
        """
        Check if a specific capability is available
        
        Args:
            capability_name: Name of the capability to check
            
        Returns:
            Capability status and details
        """
        if capability_name in self.capability_system.capabilities:
            capability = self.capability_system.capabilities[capability_name]
            return {
                "available": capability.is_available,
                "name": capability.name,
                "description": capability.description,
                "category": capability.category.value,
                "complexity": capability.complexity_level.value,
                "examples": capability.examples
            }
        return {"available": False, "error": f"Capability '{capability_name}' not found"}
    
    def can_execute_autonomous_action(self, action_id: str) -> Dict[str, Any]:
        """
        Check if Mama Bear can execute a specific autonomous action
        
        Args:
            action_id: ID of the autonomous action
            
        Returns:
            Action feasibility assessment
        """
        return self.capability_system.can_execute_action(action_id)
    
    def suggest_optimal_model(self, task_description: str) -> Dict[str, Any]:
        """
        Suggest optimal AI model for a given task
        
        Args:
            task_description: Description of the task
            
        Returns:
            Model recommendation with reasoning
        """
        return self.capability_system.suggest_optimal_model(task_description)
    
    def get_full_capability_overview(self) -> str:
        """
        Get comprehensive overview of all capabilities
        
        Returns:
            Detailed capability overview response
        """
        return self.capability_system.get_feature_awareness_response()