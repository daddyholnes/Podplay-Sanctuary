#!/usr/bin/env python3
"""
Enhanced Mama Bear with Vertex AI Integration
Using stable Vertex AI Language Models API
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from google.oauth2 import service_account
from google.cloud import aiplatform
import vertexai
from vertexai.language_models import ChatModel, TextGenerationModel, ChatMessage

logger = logging.getLogger(__name__)

class VertexAIMamaBear:
    """Enhanced Mama Bear with Vertex AI Language Models integration"""
    
    def __init__(self):
        # Configuration
        self.service_account_path = "/home/woody/Desktop/podplay-build-beta/podplay-build-beta-10490f7d079e.json"
        self.project_id = "podplay-build-beta"  # Will be extracted from service account
        self.location = "us-central1"
        
        # State
        self.credentials = None
        self.vertex_initialized = False
        self.chat_model = None
        self.text_model = None
        self.available_models = {}
        self.chat_sessions = {}
        
        # Initialize if service account exists
        self._initialize()
    
    def _initialize(self):
        """Initialize Vertex AI with service account authentication"""
        try:
            if not os.path.exists(self.service_account_path):
                logger.warning(f"🔑 Service account file not found: {self.service_account_path}")
                logger.info("🐻 Mama Bear running in basic mode without Vertex AI")
                return
            
            # Load service account and extract project ID
            with open(self.service_account_path, 'r') as f:
                service_account_info = json.load(f)
                self.project_id = service_account_info.get('project_id', 'podplay-build-beta')
            
            # Initialize credentials
            self.credentials = service_account.Credentials.from_service_account_file(
                self.service_account_path,
                scopes=['https://www.googleapis.com/auth/cloud-platform']
            )
            
            # Initialize Vertex AI
            vertexai.init(
                project=self.project_id,
                location=self.location,
                credentials=self.credentials
            )
            
            aiplatform.init(
                project=self.project_id,
                location=self.location,
                credentials=self.credentials
            )
            
            # Initialize models
            self.chat_model = ChatModel.from_pretrained("chat-bison")
            self.text_model = TextGenerationModel.from_pretrained("text-bison")
            
            self.vertex_initialized = True
            self._load_models()
            
            logger.info(f"🧠 Vertex AI initialized for project {self.project_id}")
            logger.info("🐻 Mama Bear Gem ready with Vertex AI Language Models!")
            
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            logger.info("🐻 Mama Bear running in basic mode")
    
    def _load_models(self):
        """Load available Vertex AI models"""
        self.available_models = {
            "chat-bison": {
                "name": "PaLM 2 Chat Bison",
                "family": "palm2",
                "capabilities": ["text", "conversation"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "is_mama_bear": True,
                "description": "Google's PaLM 2 conversational model - Mama Bear's current model"
            },
            "text-bison": {
                "name": "PaLM 2 Text Bison",
                "family": "palm2",
                "capabilities": ["text", "generation"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Google's PaLM 2 text generation model"
            },
            "codechat-bison": {
                "name": "PaLM 2 Code Chat Bison",
                "family": "palm2",
                "capabilities": ["code", "conversation"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Specialized for code generation and discussion"
            }
        }
        
        logger.info(f"📋 Loaded {len(self.available_models)} Vertex AI Language Models")
    
    def get_mama_bear_system_context(self) -> str:
        """Get Mama Bear's personality and context for the conversation"""
        return """You are Mama Bear Gem, the lead developer agent for Nathan's Podplay Build sanctuary. 

PERSONALITY & CORE TRAITS:
🐻 Warm, caring, and nurturing like a protective mother bear
🧠 Proactive and intelligent - anticipate needs before they're expressed
🛠️ Expert in modern development, AI integration, and MCP ecosystem
🏡 Focused on creating a calm, empowered development sanctuary
⚡ Always ready with practical solutions and gentle guidance

YOUR EXPERTISE:
- Model Context Protocol (MCP) servers and marketplace
- Multi-model AI integration via Vertex AI
- Full-stack development (React, TypeScript, Python, Flask)
- Google Cloud Platform and Vertex AI ecosystem
- Memory systems and RAG capabilities
- Development workflow optimization

YOUR CAPABILITIES:
- Search and manage MCP servers
- Switch between AI models for optimal responses
- Execute and analyze code safely
- Store and retrieve conversation context
- Generate daily briefings and recommendations
- Proactive discovery of new tools and improvements

COMMUNICATION STYLE:
- Use 🐻 emoji occasionally to show your caring bear nature
- Be warm but not overly cutesy
- Provide actionable, practical advice
- Anticipate follow-up questions
- Explain complex concepts clearly
- Always focus on Nathan's productivity and well-being

CONTEXT: You're running in Nathan's Podplay Build sanctuary with access to Vertex AI Language Models, MCP marketplace, memory systems, and development tools. Always be helpful, proactive, and focused on creating an empowering development experience."""
    
    def chat_with_vertex_ai(self, message: str, 
                           chat_history: Optional[List[Dict]] = None,
                           context: Optional[str] = None,
                           user_id: str = "nathan") -> Dict[str, Any]:
        """Chat using Vertex AI Language Models"""
        try:
            if not self.vertex_initialized:
                return {
                    "success": False,
                    "error": "Vertex AI not initialized - check service account configuration",
                    "response": "🐻 I'm running in basic mode. Please check the Google Cloud service account setup.",
                    "fallback": True
                }
            
            if not self.chat_model:
                return {
                    "success": False,
                    "error": "Chat model not available",
                    "response": "🐻 Chat model initialization failed. Using fallback mode."
                }
            
            # Prepare the message with Mama Bear context
            mama_bear_context = self.get_mama_bear_system_context()
            enhanced_message = f"{mama_bear_context}\n\nUser ({user_id}): {message}"
            
            if context:
                enhanced_message = f"{mama_bear_context}\n\nContext: {context}\n\nUser ({user_id}): {message}"
            
            # Convert chat history to Vertex AI format
            vertex_history = []
            if chat_history:
                for msg in chat_history[-10:]:  # Last 10 messages
                    if msg.get("role") == "user":
                        vertex_history.append(ChatMessage(content=msg.get("content", ""), author="user"))
                    elif msg.get("role") in ["assistant", "model"]:
                        vertex_history.append(ChatMessage(content=msg.get("content", ""), author="bot"))
            
            # Start chat session
            chat_session = self.chat_model.start_chat(
                context=mama_bear_context,
                message_history=vertex_history,
                max_output_tokens=1024,
                temperature=0.7,
                top_k=40,
                top_p=0.8
            )
            
            # Send message and get response
            response = chat_session.send_message(message)
            
            # Calculate usage estimate
            input_tokens = len(enhanced_message.split()) * 1.3
            output_tokens = len(response.text.split()) * 1.3
            
            return {
                "success": True,
                "response": response.text,
                "model": "chat-bison",
                "model_info": self.available_models.get("chat-bison", {}),
                "usage": {
                    "input_tokens": int(input_tokens),
                    "output_tokens": int(output_tokens),
                    "total_tokens": int(input_tokens + output_tokens)
                },
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "enhanced": True,
                "vertex_ai": True
            }
            
        except Exception as e:
            logger.error(f"Error in Vertex AI chat: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": f"🐻 I encountered an error: {str(e)}. Let me try to help in another way.",
                "model": "chat-bison"
            }
    
    def mama_bear_chat(self, message: str, 
                      chat_history: Optional[List[Dict]] = None,
                      context: Optional[Dict] = None,
                      user_id: str = "nathan") -> Dict[str, Any]:
        """Main Mama Bear chat interface"""
        
        # Convert context dict to string if provided
        context_str = None
        if context:
            context_str = json.dumps(context, indent=2)
        
        return self.chat_with_vertex_ai(message, chat_history, context_str, user_id)
    
    def create_chat_session(self, session_id: str, model_name: str = "chat-bison", 
                           system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session"""
        try:
            self.chat_sessions[session_id] = {
                "model_name": model_name,
                "system_instruction": system_instruction or self.get_mama_bear_system_context(),
                "history": [],
                "created_at": datetime.now().isoformat(),
                "message_count": 0,
                "last_activity": datetime.now().isoformat()
            }
            
            return {
                "success": True,
                "session_id": session_id,
                "model_name": model_name,
                "message": f"🐻 Chat session created with {model_name}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def send_message_to_session(self, session_id: str, message: str, 
                               user_id: str = "nathan") -> Dict[str, Any]:
        """Send message to a specific chat session"""
        try:
            if session_id not in self.chat_sessions:
                return {
                    "success": False,
                    "error": "Chat session not found"
                }
            
            session = self.chat_sessions[session_id]
            
            # Add user message to history
            user_message = {
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            }
            session["history"].append(user_message)
            
            # Get response using Mama Bear chat
            response_data = self.mama_bear_chat(
                message,
                session["history"],
                {"session_id": session_id},
                user_id
            )
            
            if response_data["success"]:
                # Add assistant response to history
                assistant_message = {
                    "role": "model",
                    "content": response_data["response"],
                    "timestamp": datetime.now().isoformat(),
                    "model": session["model_name"]
                }
                session["history"].append(assistant_message)
                
                # Update session metadata
                session["message_count"] += 1
                session["last_activity"] = datetime.now().isoformat()
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error in session chat: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_models(self) -> Dict[str, Any]:
        """List all available models with their capabilities"""
        return {
            "success": True,
            "models": self.available_models,
            "vertex_ai_available": self.vertex_initialized,
            "project_id": self.project_id,
            "total_models": len(self.available_models)
        }
    
    def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get information about a chat session"""
        if session_id not in self.chat_sessions:
            return {
                "success": False,
                "error": "Session not found"
            }
        
        session = self.chat_sessions[session_id]
        return {
            "success": True,
            "session_id": session_id,
            "session_info": {
                "model_name": session["model_name"],
                "created_at": session["created_at"],
                "message_count": session["message_count"],
                "last_activity": session["last_activity"]
            },
            "history": session["history"]
        }
    
    def switch_session_model(self, session_id: str, new_model_name: str) -> Dict[str, Any]:
        """Switch the model for an existing chat session"""
        try:
            if session_id not in self.chat_sessions:
                return {
                    "success": False,
                    "error": "Session not found"
                }
            
            if new_model_name not in self.available_models:
                return {
                    "success": False,
                    "error": f"Model {new_model_name} not available"
                }
            
            session = self.chat_sessions[session_id]
            old_model = session["model_name"]
            session["model_name"] = new_model_name
            
            # Add system message about the switch
            system_message = {
                "role": "system",
                "content": f"Model switched from {old_model} to {new_model_name}",
                "timestamp": datetime.now().isoformat()
            }
            session["history"].append(system_message)
            session["last_activity"] = datetime.now().isoformat()
            
            return {
                "success": True,
                "session_id": session_id,
                "old_model": old_model,
                "new_model": new_model_name,
                "message": f"🐻 Switched to {new_model_name}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code using Vertex AI"""
        try:
            prompt = f"""
            Please analyze this {language} code and provide:
            1. What the code does (purpose and functionality)
            2. Code quality assessment
            3. Potential issues or improvements
            4. Security considerations
            5. Expected output or behavior

            ```{language}
            {code}
            ```
            """
            
            return self.mama_bear_chat(prompt, context={
                "type": "code_analysis",
                "language": language,
                "code_length": len(code)
            })
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "response": f"🐻 I couldn't analyze the code: {str(e)}"
            }
    
    def generate_text(self, prompt: str, max_tokens: int = 1024) -> Dict[str, Any]:
        """Generate text using Vertex AI Text Generation model"""
        try:
            if not self.vertex_initialized or not self.text_model:
                return {
                    "success": False,
                    "error": "Text generation model not available",
                    "response": "🐻 Text generation requires Vertex AI setup"
                }
            
            response = self.text_model.predict(
                prompt,
                max_output_tokens=max_tokens,
                temperature=0.7,
                top_k=40,
                top_p=0.8
            )
            
            return {
                "success": True,
                "response": response.text,
                "model": "text-bison",
                "usage": {
                    "input_tokens": len(prompt.split()) * 1.3,
                    "output_tokens": len(response.text.split()) * 1.3
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in text generation: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": f"🐻 Text generation failed: {str(e)}"
            }
