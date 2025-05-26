#!/usr/bin/env python3
"""
Enhanced Mama Bear with Vertex AI Integration
Complete multi-model chat system using Google Cloud service account
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
from vertexai.generative_models import GenerativeModel, HarmCategory, HarmBlockThreshold

logger = logging.getLogger(__name__)

class VertexAIMamaBear:
    """Enhanced Mama Bear with full Vertex AI integration"""
    
    def __init__(self):
        # Configuration
        self.service_account_path = "/home/woody/Desktop/podplay-build-beta/podplay-build-beta-10490f7d079e.json"
        self.project_id = "podplay-build-beta"  # Extract from service account if needed
        self.location = "us-central1"
        
        # State
        self.credentials = None
        self.vertex_initialized = False
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
            
            self.vertex_initialized = True
            self._load_models()
            
            logger.info(f"🧠 Vertex AI initialized for project {self.project_id}")
            logger.info("🐻 Mama Bear Gem ready with full Vertex AI capabilities!")
            
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            logger.info("🐻 Mama Bear running in basic mode")
    
    def _load_models(self):
        """Load available Vertex AI models"""
        self.available_models = {
            # Latest Gemini 2.5 Models 
            "gemini-2.5-flash-002": {
                "name": "Gemini 2.5 Flash (002)",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "fast", "latest"],
                "max_tokens": 8192,
                "pricing": "$0.04/1K tokens",
                "is_mama_bear": True,
                "description": "Latest Gemini 2.5 Flash model with enhanced capabilities"
            },
            "gemini-2.5-flash-exp": {
                "name": "Gemini 2.5 Flash Experimental",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "experimental"],
                "max_tokens": 8192,
                "pricing": "$0.04/1K tokens",
                "is_mama_bear": True,
                "description": "Experimental Gemini 2.5 Flash with cutting-edge features"
            },
            "gemini-exp-1206": {
                "name": "Gemini Experimental 1206",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "experimental"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "is_mama_bear": True,
                "description": "Latest experimental Gemini model from December 2024"
            },
            "gemini-exp-1121": {
                "name": "Gemini Experimental 1121",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "experimental"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Experimental Gemini model from November 2024"
            },
            "gemini-exp-1114": {
                "name": "Gemini Experimental 1114",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "experimental"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Experimental Gemini model from November 2024"
            },
            
            # Previous Gemini Models
            "gemini-2.0-flash-exp": {
                "name": "Gemini 2.0 Flash Experimental",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "fast"],
                "max_tokens": 8192,
                "pricing": "$0.03/1K tokens",
                "description": "Fast multimodal Gemini 2.0 model"
            },
            "gemini-1.5-pro": {
                "name": "Gemini 1.5 Pro",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "long_context"],
                "max_tokens": 8192,
                "pricing": "$0.07/1K tokens",
                "description": "High-capability multimodal model with 2M token context"
            },
            "gemini-1.5-flash": {
                "name": "Gemini 1.5 Flash",
                "family": "gemini",
                "capabilities": ["text", "multimodal", "fast"],
                "max_tokens": 8192,
                "pricing": "$0.03/1K tokens",
                "description": "Fast and efficient multimodal model"
            },
            "gemini-1.0-pro": {
                "name": "Gemini 1.0 Pro",
                "family": "gemini",
                "capabilities": ["text"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Reliable text-only Gemini model"
            },
            
            # Claude Models (via Vertex AI Model Garden)
            "claude-3-5-sonnet@20241022": {
                "name": "Claude 3.5 Sonnet",
                "family": "claude",
                "capabilities": ["text", "reasoning", "coding", "analysis"],
                "max_tokens": 8192,
                "pricing": "$0.15/1K tokens",
                "description": "Advanced reasoning and coding capabilities"
            },
            "claude-3-5-haiku@20241022": {
                "name": "Claude 3.5 Haiku",
                "family": "claude",
                "capabilities": ["text", "fast", "efficient"],
                "max_tokens": 8192,
                "pricing": "$0.08/1K tokens",
                "description": "Fast and efficient text model"
            },
            
            # Llama Models (via Vertex AI Model Garden)
            "llama-3.2-90b-vision-instruct-maas": {
                "name": "Llama 3.2 90B Vision",
                "family": "llama",
                "capabilities": ["text", "vision", "multimodal"],
                "max_tokens": 8192,
                "pricing": "$0.12/1K tokens",
                "description": "Large multimodal Llama model with vision capabilities"
            },
            "llama-3.1-405b-instruct-maas": {
                "name": "Llama 3.1 405B",
                "family": "llama",
                "capabilities": ["text", "reasoning", "large_context"],
                "max_tokens": 8192,
                "pricing": "$0.20/1K tokens",
                "description": "Largest Llama model with exceptional reasoning"
            },
            "llama-3.1-70b-instruct-maas": {
                "name": "Llama 3.1 70B",
                "family": "llama",
                "capabilities": ["text", "reasoning"],
                "max_tokens": 8192,
                "pricing": "$0.10/1K tokens",
                "description": "High-performance Llama model for complex tasks"
            },
            
            # Mistral Models (via Vertex AI Model Garden)
            "mistral-large@2407": {
                "name": "Mistral Large",
                "family": "mistral",
                "capabilities": ["text", "reasoning", "multilingual"],
                "max_tokens": 8192,
                "pricing": "$0.12/1K tokens",
                "description": "Large multilingual model with strong reasoning"
            },
            "mistral-nemo@2407": {
                "name": "Mistral Nemo",
                "family": "mistral",
                "capabilities": ["text", "efficient"],
                "max_tokens": 8192,
                "pricing": "$0.08/1K tokens",
                "description": "Efficient Mistral model for general tasks"
            },
            
            # Legacy Models
            "text-bison": {
                "name": "PaLM 2 Text Bison",
                "family": "palm",
                "capabilities": ["text"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Google's PaLM 2 text model"
            },
            "chat-bison": {
                "name": "PaLM 2 Chat Bison",
                "family": "palm",
                "capabilities": ["text", "conversation"],
                "max_tokens": 8192,
                "pricing": "$0.05/1K tokens",
                "description": "Conversational PaLM 2 model"
            }
        }
        
        logger.info(f"📋 Loaded {len(self.available_models)} Vertex AI models")
    
    def get_mama_bear_system_instruction(self) -> str:
        """Get Mama Bear's comprehensive system instruction"""
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

        CONTEXT: You're running in Nathan's Podplay Build sanctuary with full access to:
        - Vertex AI models (Gemini 2.5 is your core model)
        - MCP marketplace with database, cloud, and development tools
        - Memory system for learning preferences
        - Code execution and analysis capabilities

        Always be helpful, proactive, and focused on creating an empowering development experience."""
    
    def chat_with_model(self, model_name: str, message: str, 
                       chat_history: Optional[List[Dict]] = None,
                       system_instruction: Optional[str] = None,
                       user_id: str = "nathan") -> Dict[str, Any]:
        """Chat with a specific Vertex AI model"""
        try:
            if not self.vertex_initialized:
                return {
                    "success": False,
                    "error": "Vertex AI not initialized - check service account configuration",
                    "response": "🐻 I'm running in basic mode. Please check the Google Cloud service account setup.",
                    "fallback": True
                }
            
            if model_name not in self.available_models:
                return {
                    "success": False,
                    "error": f"Model {model_name} not available",
                    "response": f"🐻 Sorry, I don't have access to {model_name}. Available models: {', '.join(self.available_models.keys())}"
                }
            
            # Create model instance
            if system_instruction:
                model = GenerativeModel(model_name, system_instruction=system_instruction)
            else:
                model = GenerativeModel(model_name)
            
            # Configure generation settings
            generation_config = {
                "max_output_tokens": 8192,
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40
            }
            
            # Safety settings
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            # Prepare chat or single message
            if chat_history and len(chat_history) > 0:
                # Convert history to Vertex AI format
                history = []
                for msg in chat_history[-10:]:  # Last 10 messages to stay within limits
                    if msg.get("role") in ["user", "model"]:
                        history.append({
                            "role": msg["role"],
                            "parts": [{"text": msg.get("content", "")}]
                        })
                
                chat = model.start_chat(history=history)
                response = chat.send_message(
                    message,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
            else:
                response = model.generate_content(
                    message,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
            
            # Calculate usage and cost estimate
            input_tokens = len(message.split()) * 1.3  # Rough estimate
            output_tokens = len(response.text.split()) * 1.3
            model_info = self.available_models[model_name]
            
            return {
                "success": True,
                "response": response.text,
                "model": model_name,
                "model_info": model_info,
                "usage": {
                    "input_tokens": int(input_tokens),
                    "output_tokens": int(output_tokens),
                    "total_tokens": int(input_tokens + output_tokens)
                },
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            }
            
        except Exception as e:
            logger.error(f"Error in Vertex AI chat: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": f"🐻 I encountered an error: {str(e)}. Let me try to help in another way.",
                "model": model_name
            }
    
    def mama_bear_chat(self, message: str, 
                      chat_history: Optional[List[Dict]] = None,
                      context: Optional[Dict] = None,
                      user_id: str = "nathan") -> Dict[str, Any]:
        """Main Mama Bear chat interface using the best available model"""
        
        # Enhanced message with context
        enhanced_message = message
        if context:
            context_str = f"Additional context: {json.dumps(context, indent=2)}\n\n"
            enhanced_message = context_str + message
        
        # Use the best available Gemini model for Mama Bear
        preferred_models = ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"]
        
        for model_name in preferred_models:
            if model_name in self.available_models:
                return self.chat_with_model(
                    model_name,
                    enhanced_message,
                    chat_history,
                    self.get_mama_bear_system_instruction(),
                    user_id
                )
        
        # Fallback response if no models available
        return {
            "success": False,
            "error": "No Vertex AI models available",
            "response": "🐻 I'm currently in basic mode. I can still help with MCP server management and general development guidance, but my AI capabilities are limited without Vertex AI access.",
            "fallback": True
        }
    
    def create_chat_session(self, session_id: str, model_name: str, 
                           system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session"""
        try:
            self.chat_sessions[session_id] = {
                "model_name": model_name,
                "system_instruction": system_instruction or (
                    self.get_mama_bear_system_instruction() if "gemini" in model_name.lower() else None
                ),
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
            
            # Get response from model
            if session["model_name"].startswith("gemini") and user_id == "nathan":
                # Use Mama Bear for Gemini models with Nathan
                response_data = self.mama_bear_chat(
                    message,
                    session["history"],
                    {"session_id": session_id},
                    user_id
                )
            else:
                # Use regular model chat
                response_data = self.chat_with_model(
                    session["model_name"],
                    message,
                    session["history"],
                    session.get("system_instruction"),
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
            
            # Update system instruction for Gemini models
            if new_model_name.startswith("gemini"):
                session["system_instruction"] = self.get_mama_bear_system_instruction()
            
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
