"""
Enhanced Agent Framework - Core Classes and Enums
File: backend/services/agent_framework_enhanced.py

This file contains the core agent framework that other services import from.
"""

import os
import asyncio
import json
import logging
import random
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# ===================================================================
# Core Enums and Data Classes
# ===================================================================

class AgentType(Enum):
    MAIN_CHAT = "main_chat"
    SCOUT_AGENT = "scout_agent" 
    DEV_WORKSPACE = "dev_workspace"

class ModelProvider(Enum):
    GEMINI_API = "gemini_api"
    GEMINI_VERTEX_1 = "gemini_vertex_1"
    GEMINI_VERTEX_2 = "gemini_vertex_2"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"

@dataclass
class ModelConfig:
    provider: ModelProvider
    model_name: str
    api_key: Optional[str] = None
    service_file: Optional[str] = None
    cost_per_1k_tokens: float = 0.0
    quota_limit: int = 1000000
    current_usage: int = 0
    capabilities: List[str] = None
    billing_account: str = "default"

@dataclass
class AgentCapability:
    name: str
    description: str
    tools: List[str]
    models_preferred: List[ModelProvider]
    cost_tier: int  # 1=cheapest, 5=most expensive
    quota_weight: float

# ===================================================================
# Intelligent Model Router
# ===================================================================

class IntelligentModelRouter:
    """
    Enhanced Model Router with Nathan's specific model configuration
    Prioritizes Gemini, manages quotas, handles billing optimization
    """
    
    def __init__(self):
        self.models = self._initialize_models()
        self.usage_tracker = {}
        self.daily_quotas = {}
        self._reset_daily_usage()
        
    def _initialize_models(self) -> Dict[str, ModelConfig]:
        """Initialize Nathan's exact model configuration"""
        models = {}
        
        # Gemini API Models (Primary - cheapest, Nathan's preferred)
        models['gemini-2.0-flash'] = ModelConfig(
            provider=ModelProvider.GEMINI_API,
            model_name='gemini-2.0-flash-exp',
            api_key=os.getenv('GEMINI_API_KEY'),
            cost_per_1k_tokens=0.075,
            quota_limit=2000000,
            capabilities=['vision', 'audio', 'fast', 'reasoning'],
            billing_account="gemini_api_main"
        )
        
        models['gemini-1.5-flash'] = ModelConfig(
            provider=ModelProvider.GEMINI_API,
            model_name='gemini-1.5-flash',
            api_key=os.getenv('GEMINI_API_KEY'),
            cost_per_1k_tokens=0.075,
            quota_limit=2000000,
            capabilities=['vision', 'audio', 'fast'],
            billing_account="gemini_api_main"
        )
        
        models['gemini-1.5-pro'] = ModelConfig(
            provider=ModelProvider.GEMINI_API,
            model_name='gemini-1.5-pro',
            api_key=os.getenv('GEMINI_API_KEY'),
            cost_per_1k_tokens=1.25,
            quota_limit=1000000,
            capabilities=['vision', 'reasoning', 'complex', 'long-context'],
            billing_account="gemini_api_main"
        )
        
        # Vertex AI Models (Different billing accounts)
        models['gemini-vertex-1'] = ModelConfig(
            provider=ModelProvider.GEMINI_VERTEX_1,
            model_name='gemini-1.5-pro',
            service_file=os.getenv('VERTEX_SERVICE_FILE_1'),
            cost_per_1k_tokens=1.25,
            quota_limit=1500000,
            capabilities=['vision', 'reasoning', 'long-context'],
            billing_account="vertex_account_1"
        )
        
        models['gemini-vertex-2'] = ModelConfig(
            provider=ModelProvider.GEMINI_VERTEX_2,
            model_name='gemini-1.5-flash',
            service_file=os.getenv('VERTEX_SERVICE_FILE_2'),
            cost_per_1k_tokens=0.075,
            quota_limit=2000000,
            capabilities=['vision', 'fast', 'efficient'],
            billing_account="vertex_account_2"
        )
        
        # OpenAI (Fallback)
        models['gpt-4o'] = ModelConfig(
            provider=ModelProvider.OPENAI,
            model_name='gpt-4o',
            api_key=os.getenv('OPENAI_API_KEY'),
            cost_per_1k_tokens=2.50,
            quota_limit=500000,
            capabilities=['vision', 'reasoning', 'code'],
            billing_account="openai_main"
        )
        
        # Anthropic (High-quality fallback)
        models['claude-3.5-sonnet'] = ModelConfig(
            provider=ModelProvider.ANTHROPIC,
            model_name='claude-3-5-sonnet-20241022',
            api_key=os.getenv('ANTHROPIC_API_KEY'),
            cost_per_1k_tokens=3.00,
            quota_limit=300000,
            capabilities=['reasoning', 'analysis', 'code', 'complex'],
            billing_account="anthropic_main"
        )
        
        return models
    
    def _reset_daily_usage(self):
        """Reset daily usage counters"""
        for model in self.models.values():
            model.current_usage = 0
    
    async def route_request(self, agent_type: AgentType, prompt: str, 
                          context: Dict, task_type: str = "general") -> str:
        """
        Intelligent routing strategy:
        1. Always prefer Gemini models (cheapest)
        2. Distribute load across different billing accounts
        3. Fallback gracefully when quotas hit
        4. Match model capabilities to task requirements
        """
        
        # Analyze what the task needs
        task_requirements = self._analyze_task_requirements(prompt, task_type, agent_type)
        
        # Get available models that can handle this task
        suitable_models = self._get_suitable_models(task_requirements)
        
        # Select optimal model using Nathan's strategy
        selected_model = self._select_optimal_model(suitable_models, task_requirements)
        
        logger.info(f"🎯 {agent_type.value} → {selected_model.model_name} (${selected_model.cost_per_1k_tokens:.3f}/1k)")
        
        try:
            # Make the API call
            response = await self._call_model(selected_model, prompt, context, task_requirements)
            
            # Update usage tracking
            estimated_tokens = len(prompt.split()) + len(response.split())
            self._update_usage_tracking(selected_model, estimated_tokens)
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Model {selected_model.model_name} failed: {e}")
            # Try fallback model
            return await self._try_fallback(suitable_models, selected_model, prompt, context, task_requirements)
    
    def _analyze_task_requirements(self, prompt: str, task_type: str, agent_type: AgentType) -> Dict:
        """Analyze what the task needs"""
        requirements = {
            'complexity': 'simple',
            'needs_vision': 'image' in prompt.lower() or 'visual' in prompt.lower(),
            'needs_reasoning': any(word in prompt.lower() for word in ['analyze', 'plan', 'design', 'architecture']),
            'needs_code': any(word in prompt.lower() for word in ['code', 'script', 'function', 'implement']),
            'is_urgent': task_type == 'urgent',
            'estimated_tokens': len(prompt.split()) * 1.3
        }
        
        # Adjust complexity based on agent type and task
        if agent_type == AgentType.SCOUT_AGENT:
            if 'plan' in prompt.lower() or 'architecture' in prompt.lower():
                requirements['complexity'] = 'complex'
            elif 'implement' in prompt.lower() or 'build' in prompt.lower():
                requirements['complexity'] = 'medium'
                
        elif agent_type == AgentType.DEV_WORKSPACE:
            if 'workspace' in prompt.lower() or 'environment' in prompt.lower():
                requirements['complexity'] = 'medium'
        
        # Long prompts usually need more capable models
        if len(prompt) > 1000:
            requirements['complexity'] = 'complex'
            
        return requirements
    
    def _get_suitable_models(self, requirements: Dict) -> List[ModelConfig]:
        """Get models that can handle the task"""
        suitable = []
        
        for model in self.models.values():
            # Check quota availability (reserve 20% for emergencies)
            if model.current_usage >= (model.quota_limit * 0.8):
                continue
                
            # Check capabilities
            if requirements['needs_vision'] and 'vision' not in (model.capabilities or []):
                continue
                
            if requirements['needs_reasoning'] and requirements['complexity'] == 'complex':
                if not any(cap in (model.capabilities or []) for cap in ['reasoning', 'complex']):
                    continue
                    
            suitable.append(model)
            
        return suitable
    
    def _select_optimal_model(self, suitable_models: List[ModelConfig], requirements: Dict) -> ModelConfig:
        """Select the best model using Nathan's strategy"""
        
        if not suitable_models:
            # Emergency: use any available model
            available = [m for m in self.models.values() if m.current_usage < m.quota_limit * 0.9]
            if available:
                return available[0]
            # Last resort: use lowest usage model
            return min(self.models.values(), key=lambda x: x.current_usage)
        
        # STRATEGY 1: Gemini First (Nathan's preference)
        gemini_models = [m for m in suitable_models if 'gemini' in m.provider.value]
        
        if gemini_models:
            # For simple tasks: prefer Flash models
            if requirements['complexity'] == 'simple':
                flash_models = [m for m in gemini_models if 'flash' in m.model_name.lower()]
                if flash_models:
                    # Distribute across billing accounts
                    return self._distribute_by_billing_account(flash_models)
            
            # For complex tasks: prefer Pro models
            if requirements['complexity'] == 'complex':
                pro_models = [m for m in gemini_models if 'pro' in m.model_name.lower()]
                if pro_models:
                    return self._distribute_by_billing_account(pro_models)
            
            # Default: least used Gemini model
            return min(gemini_models, key=lambda x: (x.current_usage / x.quota_limit))
        
        # STRATEGY 2: Non-Gemini fallbacks
        if requirements['complexity'] == 'complex':
            # Claude is excellent for complex reasoning
            anthropic_models = [m for m in suitable_models if m.provider == ModelProvider.ANTHROPIC]
            if anthropic_models and anthropic_models[0].current_usage < anthropic_models[0].quota_limit * 0.8:
                return anthropic_models[0]
        
        # STRATEGY 3: Cost-based selection
        return min(suitable_models, key=lambda x: (x.cost_per_1k_tokens, x.current_usage))
    
    def _distribute_by_billing_account(self, models: List[ModelConfig]) -> ModelConfig:
        """Distribute load across Nathan's different billing accounts"""
        # Group by billing account
        by_account = {}
        for model in models:
            account = model.billing_account
            if account not in by_account:
                by_account[account] = []
            by_account[account].append(model)
        
        # Pick account with lowest relative usage
        best_account = min(by_account.keys(), 
                         key=lambda acc: sum(m.current_usage / m.quota_limit for m in by_account[acc]))
        
        # Return least used model in that account
        return min(by_account[best_account], key=lambda x: x.current_usage)
    
    async def _call_model(self, model: ModelConfig, prompt: str, context: Dict, requirements: Dict) -> str:
        """Route to the appropriate model API"""
        
        if model.provider == ModelProvider.GEMINI_API:
            return await self._call_gemini_api(model, prompt, context)
        elif model.provider in [ModelProvider.GEMINI_VERTEX_1, ModelProvider.GEMINI_VERTEX_2]:
            return await self._call_gemini_vertex(model, prompt, context)
        elif model.provider == ModelProvider.OPENAI:
            return await self._call_openai(model, prompt, context)
        elif model.provider == ModelProvider.ANTHROPIC:
            return await self._call_anthropic(model, prompt, context)
    
    async def _call_gemini_api(self, model: ModelConfig, prompt: str, context: Dict) -> str:
        """Call Gemini via API key - Nathan's primary route"""
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=model.api_key)
            model_instance = genai.GenerativeModel(model.model_name)
            
            # Build context-aware prompt
            system_prompt = self._build_mama_bear_system_prompt(context)
            full_prompt = f"{system_prompt}\n\nUser: {prompt}"
            
            response = await model_instance.generate_content_async(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=4000,
                )
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise
    
    async def _call_gemini_vertex(self, model: ModelConfig, prompt: str, context: Dict) -> str:
        """Call Gemini via Vertex AI - Nathan's billing account alternatives"""
        try:
            from google.cloud import aiplatform
            from vertexai.generative_models import GenerativeModel
            import vertexai
            
            # Initialize with the specific service account
            project_id = os.getenv('VERTEX_PROJECT_ID', 'your-vertex-project')
            vertexai.init(project=project_id, location="us-central1")
            
            model_instance = GenerativeModel(model.model_name)
            
            system_prompt = self._build_mama_bear_system_prompt(context)
            full_prompt = f"{system_prompt}\n\nUser: {prompt}"
            
            response = await model_instance.generate_content_async(full_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Vertex AI call failed: {e}")
            raise
    
    async def _call_openai(self, model: ModelConfig, prompt: str, context: Dict) -> str:
        """Call OpenAI API"""
        try:
            import openai
            
            client = openai.AsyncOpenAI(api_key=model.api_key)
            
            system_prompt = self._build_mama_bear_system_prompt(context)
            
            response = await client.chat.completions.create(
                model=model.model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI call failed: {e}")
            raise
    
    async def _call_anthropic(self, model: ModelConfig, prompt: str, context: Dict) -> str:
        """Call Anthropic Claude API"""
        try:
            import anthropic
            
            client = anthropic.AsyncAnthropic(api_key=model.api_key)
            
            system_prompt = self._build_mama_bear_system_prompt(context)
            full_prompt = f"{system_prompt}\n\nUser: {prompt}"
            
            response = await client.messages.create(
                model=model.model_name,
                max_tokens=4000,
                messages=[{"role": "user", "content": full_prompt}]
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic call failed: {e}")
            raise
    
    def _build_mama_bear_system_prompt(self, context: Dict) -> str:
        """Build Mama Bear personality prompt"""
        agent_type = context.get('agent_type', 'main_chat')
        
        base_prompt = """You are Mama Bear 💝, Nathan's caring AI development partner. You create a calm, empowering sanctuary for development and research."""
        
        if agent_type == 'scout_agent':
            return f"{base_prompt} As Scout Mama Bear, you specialize in autonomous full-stack development with the 4-stage workflow (Welcome → Planning → Workspace → Production). You transform ideas into working applications."
        elif agent_type == 'dev_workspace':
            return f"{base_prompt} As Workspace Mama Bear, you manage development environments (Docker, NixOS, Codespaces) and create organized, sensory-friendly development spaces."
        else:
            return f"{base_prompt} As Main Chat Mama Bear, you coordinate research, planning, and analysis while working with Scout and Workspace Mama Bears."
    
    async def _try_fallback(self, suitable_models: List[ModelConfig], failed_model: ModelConfig, 
                           prompt: str, context: Dict, requirements: Dict) -> str:
        """Try fallback models when primary fails"""
        fallback_models = [m for m in suitable_models if m.model_name != failed_model.model_name]
        
        if fallback_models:
            logger.info(f"🔄 Falling back to {fallback_models[0].model_name}")
            return await self._call_model(fallback_models[0], prompt, context, requirements)
        
        # Last resort - try any available model
        available = [m for m in self.models.values() if m.current_usage < m.quota_limit]
        if available:
            logger.warning(f"⚠️ Emergency fallback to {available[0].model_name}")
            return await self._call_model(available[0], prompt, context, requirements)
        
        raise Exception("No models available - all quotas exceeded")
    
    def _update_usage_tracking(self, model: ModelConfig, tokens_used: int):
        """Update usage tracking for quota management"""
        model.current_usage += tokens_used
        
        # Log usage for monitoring
        logger.debug(f"📊 {model.model_name}: {model.current_usage}/{model.quota_limit} tokens used")
    
    def get_model_usage_stats(self) -> Dict[str, Any]:
        """Get current model usage statistics"""
        stats = {}
        for model_name, model in self.models.items():
            stats[model_name] = {
                'usage': model.current_usage,
                'quota': model.quota_limit,
                'percentage': (model.current_usage / model.quota_limit) * 100,
                'cost_per_1k': model.cost_per_1k_tokens,
                'billing_account': model.billing_account,
                'capabilities': model.capabilities or [],
                'available': model.current_usage < model.quota_limit * 0.9
            }
        return stats

# ===================================================================
# Base Agent Classes
# ===================================================================

class MamaBarAgent:
    """Base class for all Mama Bear agents"""
    
    def __init__(self, agent_type: AgentType, enhanced_mama=None, 
                 marketplace=None, model_router=None):
        self.agent_type = agent_type
        self.enhanced_mama = enhanced_mama
        self.marketplace = marketplace
        self.model_router = model_router
        self.capabilities = self._define_capabilities()
    
    def _define_capabilities(self) -> List[AgentCapability]:
        """Define capabilities for this agent type"""
        if self.agent_type == AgentType.MAIN_CHAT:
            return [
                AgentCapability(
                    name="research_coordination",
                    description="Coordinate research and planning across platforms",
                    tools=["web_search", "mem0_memory", "mcp_tools"],
                    models_preferred=[ModelProvider.GEMINI_API, ModelProvider.ANTHROPIC],
                    cost_tier=2,
                    quota_weight=0.3
                )
            ]
        elif self.agent_type == AgentType.SCOUT_AGENT:
            return [
                AgentCapability(
                    name="autonomous_development",
                    description="Full-stack autonomous development workflows",
                    tools=["code_generation", "project_scaffolding", "deployment"],
                    models_preferred=[ModelProvider.GEMINI_API, ModelProvider.OPENAI],
                    cost_tier=3,
                    quota_weight=0.5
                )
            ]
        else:  # DEV_WORKSPACE
            return [
                AgentCapability(
                    name="environment_management",
                    description="Development environment orchestration",
                    tools=["docker", "nixos", "github_codespaces"],
                    models_preferred=[ModelProvider.GEMINI_API],
                    cost_tier=2,
                    quota_weight=0.4
                )
            ]
    
    async def process_message(self, user_id: str, message: str, context: Dict) -> Dict:
        """Process a user message and return response"""
        try:
            # Get conversation context if enhanced_mama is available
            if self.enhanced_mama:
                conversation_context = await self._get_conversation_context(user_id, context)
                context.update(conversation_context)
            
            # Add agent type to context
            context['agent_type'] = self.agent_type.value
            
            # Route to AI model if model_router is available
            if self.model_router:
                response = await self.model_router.route_request(
                    self.agent_type, message, context, 
                    task_type=self._classify_task(message)
                )
            else:
                # Fallback response
                response = f"I'm {self.agent_type.value} Mama Bear! I received your message: {message}"
            
            # Store conversation in memory if enhanced_mama is available
            if self.enhanced_mama:
                await self._store_conversation_memory(user_id, message, response, context)
            
            return {
                'response': response,
                'agent_type': self.agent_type.value,
                'capabilities_used': self._extract_capabilities_used(response),
                'context': context,
                'success': True
            }
            
        except Exception as e:
            logger.error(f"Agent {self.agent_type.value} error: {e}")
            return {
                'response': f"I encountered an issue processing your message. Please try again! 💝",
                'agent_type': self.agent_type.value,
                'error': str(e),
                'success': False
            }
    
    async def _get_conversation_context(self, user_id: str, context: Dict) -> Dict:
        """Get conversation context from memory"""
        if not self.enhanced_mama:
            return {}
        
        try:
            # Search for relevant memories
            memories = await self.enhanced_mama.search_memory(
                f"user {user_id} conversation {self.agent_type.value}", limit=5
            )
            
            return {
                'relevant_memories': memories,
                'conversation_history': memories[:3] if memories else []
            }
        except:
            return {}
    
    async def _store_conversation_memory(self, user_id: str, message: str, response: str, context: Dict):
        """Store conversation in memory"""
        if not self.enhanced_mama:
            return
        
        try:
            memory_content = f"User ({user_id}): {message}\nMama Bear ({self.agent_type.value}): {response}"
            
            await self.enhanced_mama.store_memory(
                memory_content,
                metadata={
                    'type': 'agent_conversation',
                    'agent_type': self.agent_type.value,
                    'user_id': user_id,
                    'timestamp': datetime.now().isoformat()
                }
            )
        except:
            pass  # Don't fail the whole conversation if memory storage fails
    
    def _classify_task(self, message: str) -> str:
        """Classify the task type for routing"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['urgent', 'emergency', 'asap']):
            return 'urgent'
        elif any(word in message_lower for word in ['plan', 'design', 'architecture']):
            return 'complex'
        elif any(word in message_lower for word in ['code', 'implement', 'build']):
            return 'code'
        else:
            return 'general'
    
    def _extract_capabilities_used(self, response: str) -> List[str]:
        """Extract which capabilities were likely used in the response"""
        capabilities_used = []
        response_lower = response.lower()
        
        for capability in self.capabilities:
            if any(tool.lower() in response_lower for tool in capability.tools):
                capabilities_used.append(capability.name)
        
        return capabilities_used

# ===================================================================
# Specific Agent Implementations
# ===================================================================

class MainChatAgent(MamaBarAgent):
    """Main Chat Mama Bear - Research and coordination specialist"""
    
    def __init__(self, enhanced_mama=None, marketplace=None, model_router=None):
        super().__init__(AgentType.MAIN_CHAT, enhanced_mama, marketplace, model_router)

class ScoutAgent(MamaBarAgent):
    """Scout Mama Bear - Autonomous development specialist"""
    
    def __init__(self, enhanced_mama=None, marketplace=None, model_router=None):
        super().__init__(AgentType.SCOUT_AGENT, enhanced_mama, marketplace, model_router)
        self.current_projects = {}  # Track active projects by user

class WorkspaceAgent(MamaBarAgent):
    """Workspace Mama Bear - Environment management specialist"""
    
    def __init__(self, enhanced_mama=None, marketplace=None, model_router=None):
        super().__init__(AgentType.DEV_WORKSPACE, enhanced_mama, marketplace, model_router)

# ===================================================================
# Agent Orchestrator
# ===================================================================

class AgentOrchestrator:
    """Main orchestrator integrating with Nathan's existing service framework"""
    
    def __init__(self, enhanced_mama=None, marketplace=None):
        self.model_router = IntelligentModelRouter()
        self.enhanced_mama = enhanced_mama
        self.marketplace = marketplace
        
        # Initialize agents
        self.scout_agent = ScoutAgent(enhanced_mama, marketplace, self.model_router)
        self.main_chat_agent = MainChatAgent(enhanced_mama, marketplace, self.model_router)
        self.workspace_agent = WorkspaceAgent(enhanced_mama, marketplace, self.model_router)
        
        logger.info("🤖 Agent Orchestrator initialized with intelligent model routing")
    
    async def chat(self, agent_type: str, user_id: str, message: str, context: Dict = None) -> Dict:
        """Route chat to appropriate agent"""
        
        context = context or {}
        
        if agent_type == 'scout_agent':
            agent = self.scout_agent
        elif agent_type == 'dev_workspace':
            agent = self.workspace_agent
        else:
            agent = self.main_chat_agent
        
        return await agent.process_message(user_id, message, context)
    
    def get_model_usage_stats(self) -> Dict:
        """Get current model usage statistics"""
        return self.model_router.get_model_usage_stats()
    
    def get_agent_status(self) -> Dict:
        """Get status of all agents"""
        return {
            'main_chat': {'status': 'ready', 'type': 'research_coordination'},
            'scout_agent': {'status': 'ready', 'type': 'autonomous_development'},
            'workspace_agent': {'status': 'ready', 'type': 'environment_management'},
            'model_router': {'models_configured': len(self.model_router.models)}
        }

# ===================================================================
# Export main classes for import
# ===================================================================

__all__ = [
    'AgentType',
    'ModelProvider', 
    'ModelConfig',
    'AgentCapability',
    'IntelligentModelRouter',
    'MamaBarAgent',
    'MainChatAgent',
    'ScoutAgent', 
    'WorkspaceAgent',
    'AgentOrchestrator'
]