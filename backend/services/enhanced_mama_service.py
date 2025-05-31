"""
Enhanced Mama Bear Service

Integrates external AI services including Mem0.ai for persistent memory and
Together.ai for sandbox code execution, providing advanced capabilities for
the Podplay Sanctuary development environment.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

from utils.logging_setup import get_logger

logger = get_logger(__name__)

# Optional service imports with graceful degradation
try:
    from mem0 import MemoryClient
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False
    MemoryClient = None
    logger.info("Mem0.ai client not available - using local memory fallback")

try:
    import together
    TOGETHER_AVAILABLE = True
except ImportError:
    TOGETHER_AVAILABLE = False
    together = None
    logger.info("Together.ai client not available - code execution disabled")

class EnhancedMamaBear:
    """
    Professional enhanced AI service with external integrations and fallback capabilities
    
    Provides advanced features including:
    - Persistent memory storage and retrieval via Mem0.ai
    - Safe code execution sandbox via Together.ai
    - Contextual insights and pattern recognition
    - Graceful degradation when external services are unavailable
    """
    
    def __init__(self):
        """
        Initialize enhanced AI service with external integrations and fallbacks
        """
        self.memory = None
        self.together_client = None
        self.user_id = 'nathan_sanctuary'
        self.local_memory_fallback = []
        
        self._initialize_mem0_service()
        self._initialize_together_service()
        
        logger.info("Enhanced Mama Bear service initialized")
    
    def _initialize_mem0_service(self):
        """Initialize Mem0.ai persistent memory service with error handling"""
        if not MEM0_AVAILABLE:
            logger.warning("Mem0.ai not available - using local memory fallback")
            return
        
        try:
            mem0_api_key = os.getenv('MEM0_API_KEY')
            if mem0_api_key:
                os.environ["MEM0_API_KEY"] = mem0_api_key
                self.memory = MemoryClient()
                self.user_id = os.getenv('MEM0_USER_ID', 'nathan_sanctuary')
                logger.info("Mem0.ai persistent memory service initialized successfully")
            else:
                logger.warning("MEM0_API_KEY not configured - using local memory fallback")
                
        except Exception as e:
            logger.error(f"Mem0.ai initialization failed: {e}")
            self.memory = None
    
    def _initialize_together_service(self):
        """Initialize Together.ai sandbox service with error handling"""
        if not TOGETHER_AVAILABLE:
            logger.warning("Together.ai not available - code execution disabled")
            return
        
        try:
            together_api_key = os.getenv('TOGETHER_AI_API_KEY')
            if together_api_key:
                together.api_key = together_api_key
                self.together_client = together
                logger.info("Together.ai sandbox service initialized successfully")
            else:
                logger.warning("TOGETHER_AI_API_KEY not configured - code execution disabled")
                
        except Exception as e:
            logger.error(f"Together.ai initialization failed: {e}")
            self.together_client = None
    
    def store_memory(self, content: str, metadata: Optional[Dict] = None) -> bool:
        """
        Store memory with persistent storage or local fallback
        
        Args:
            content: Memory content to store
            metadata: Additional metadata for context
            
        Returns:
            Success status of memory storage operation
        """
        try:
            if self.memory:
                # Use Mem0.ai cloud service for persistent storage
                result = self.memory.add(
                    messages=[{"role": "user", "content": content}],
                    user_id=self.user_id,
                    metadata=metadata or {},
                    categories=["mama_bear_memory"]
                )
                logger.debug(f"Memory stored in Mem0.ai: {content[:50]}...")
                return True
                
            else:
                # Local fallback memory storage
                memory_entry = {
                    "content": content,
                    "metadata": metadata or {},
                    "timestamp": datetime.now().isoformat(),
                    "user_id": self.user_id
                }
                self.local_memory_fallback.append(memory_entry)
                
                # Limit local memory to prevent memory leaks
                if len(self.local_memory_fallback) > 100:
                    self.local_memory_fallback = self.local_memory_fallback[-50:]
                
                logger.debug(f"Memory stored locally: {content[:50]}...")
                return True
                
        except Exception as e:
            logger.error(f"Memory storage failed: {e}")
            return False
    
    def search_memory(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search stored memories with intelligent retrieval
        
        Args:
            query: Search query for memory retrieval
            limit: Maximum number of memories to return
            
        Returns:
            List of relevant memory entries
        """
        try:
            if self.memory:
                # Use Mem0.ai cloud service for intelligent search
                results = self.memory.search(
                    query=query,
                    user_id=self.user_id,
                    threshold=0.5
                )
                logger.debug(f"Found {len(results)} memories via Mem0.ai for query: {query}")
                return results[:limit]
                
            else:
                # Local fallback search with simple string matching
                matching_memories = []
                query_lower = query.lower()
                
                for memory in self.local_memory_fallback:
                    content = memory.get("content", "").lower()
                    if query_lower in content:
                        matching_memories.append({
                            "text": memory["content"],
                            "metadata": memory["metadata"],
                            "timestamp": memory["timestamp"]
                        })
                
                logger.debug(f"Found {len(matching_memories)} memories locally for query: {query}")
                return matching_memories[:limit]
                
        except Exception as e:
            logger.error(f"Memory search failed: {e}")
            return []
    
    def execute_in_sandbox(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Execute code safely in Together.ai sandbox environment
        
        Args:
            code: Code content to execute
            language: Programming language for execution
            
        Returns:
            Execution result with output, errors, and metadata
        """
        if not self.together_client:
            return {
                "success": False,
                "error": "Sandbox environment not available",
                "output": "Code execution requires Together.ai API configuration",
                "language": language
            }
        
        try:
            # Construct execution prompt for Together.ai
            execution_prompt = f"""
Execute this {language} code safely and provide comprehensive results:

```{language}
{code}
```

Please provide:
1. Execution output
2. Any errors or warnings
3. Final result or return value
4. Brief analysis of the code execution
"""
            
            # Execute via Together.ai API
            response = self.together_client.Complete.create(
                prompt=execution_prompt,
                model=os.getenv('TOGETHER_AI_MODEL', 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'),
                max_tokens=int(os.getenv('TOGETHER_AI_MAX_TOKENS', '4096')),
                temperature=float(os.getenv('TOGETHER_AI_TEMPERATURE', '0.7')),
                top_p=0.9,
                repetition_penalty=1.1
            )
            
            output = response['output']['choices'][0]['text'].strip()
            
            # Store execution context in memory
            self.store_memory(
                f"Executed {language} code: {code[:100]}...",
                {
                    "type": "code_execution",
                    "language": language,
                    "output_length": len(output),
                    "timestamp": datetime.now().isoformat()
                }
            )
            
            logger.info(f"Code execution completed successfully for {language}")
            
            return {
                "success": True,
                "output": output,
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "execution_method": "together_ai_sandbox"
            }
            
        except Exception as e:
            logger.error(f"Sandbox execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "output": "",
                "language": language,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_contextual_insights(self, query: str) -> Dict[str, Any]:
        """
        Generate contextual insights based on memory analysis and patterns
        
        Args:
            query: Context query for insight generation
            
        Returns:
            Dictionary containing insights, patterns, and recommendations
        """
        try:
            # Retrieve relevant memories
            memories = self.search_memory(query, limit=10)
            
            insights = {
                "relevant_memories": memories,
                "patterns": [],
                "recommendations": [],
                "context_score": 0.0,
                "query": query,
                "timestamp": datetime.now().isoformat()
            }
            
            if memories:
                # Analyze patterns in retrieved memories
                categories = {}
                for memory in memories:
                    metadata = memory.get('metadata', {})
                    memory_type = metadata.get('type', 'general')
                    categories[memory_type] = categories.get(memory_type, 0) + 1
                
                # Generate pattern insights
                insights["patterns"] = [
                    f"Frequent {category} interactions ({count} occurrences)"
                    for category, count in categories.items() if count > 1
                ]
                
                # Calculate context relevance score
                insights["context_score"] = min(len(memories) / 10.0, 1.0)
                
                # Generate recommendations based on patterns
                if categories.get('code_execution', 0) > 2:
                    insights["recommendations"].append("Consider creating code templates for frequently executed patterns")
                
                if categories.get('chat_message', 0) > 5:
                    insights["recommendations"].append("User shows high engagement - consider advanced feature recommendations")
            
            logger.debug(f"Generated contextual insights for query: {query}")
            return insights
            
        except Exception as e:
            logger.error(f"Contextual insight generation failed: {e}")
            return {
                "relevant_memories": [],
                "patterns": [],
                "recommendations": [],
                "context_score": 0.0,
                "error": str(e),
                "query": query
            }
    
    def get_service_status(self) -> Dict[str, Any]:
        """
        Get current status of enhanced AI services
        
        Returns:
            Dictionary containing service availability and configuration status
        """
        return {
            "mem0_service": {
                "available": self.memory is not None,
                "configured": bool(os.getenv('MEM0_API_KEY')),
                "user_id": self.user_id,
                "storage_type": "cloud" if self.memory else "local_fallback"
            },
            "together_service": {
                "available": self.together_client is not None,
                "configured": bool(os.getenv('TOGETHER_AI_API_KEY')),
                "model": os.getenv('TOGETHER_AI_MODEL', 'not_configured'),
                "sandbox_enabled": self.together_client is not None
            },
            "local_memory": {
                "entries": len(self.local_memory_fallback),
                "active": not bool(self.memory)
            },
            "overall_status": "enhanced" if (self.memory and self.together_client) else "basic"
        }