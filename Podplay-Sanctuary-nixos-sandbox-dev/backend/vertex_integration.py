#!/usr/bin/env python3
"""
Vertex AI Integration for Podplay Build Backend
Comprehensive multi-model chat system with Google Cloud service account authentication
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from google.oauth2 import service_account
import google.auth.credentials
from google.cloud import aiplatform
import vertexai
from vertexai.generative_models import GenerativeModel, Part, FinishReason
import vertexai.preview.generative_models as generative_models

logger = logging.getLogger(__name__)

class VertexAIManager:
    """Manages Vertex AI authentication and model interactions"""
    
    def __init__(self, service_account_path: str, project_id: str, location: str = "us-central1"):
        self.service_account_path = service_account_path
        self.project_id = project_id
        self.location = location
        self.credentials = None
        self.models = {}
        
        # Initialize authentication and Vertex AI
        self._initialize_auth()
        self._initialize_vertex_ai()
        self._load_available_models()
    
    def _initialize_auth(self):
        """Initialize Google Cloud authentication using service account"""
        try:
            if os.path.exists(self.service_account_path):
                self.credentials = service_account.Credentials.from_service_account_file(
                    self.service_account_path,
                    scopes=['https://www.googleapis.com/auth/cloud-platform']
                )
                logger.info("🔑 Google Cloud authentication initialized with service account")
            else:
                logger.error(f"Service account file not found: {self.service_account_path}")
                raise FileNotFoundError(f"Service account file not found: {self.service_account_path}")
        except Exception as e:
            logger.error(f"Failed to initialize Google Cloud authentication: {e}")
            raise
    
    def _initialize_vertex_ai(self):
        """Initialize Vertex AI with proper authentication"""
        try:
            # Initialize aiplatform with credentials
            aiplatform.init(
                project=self.project_id,
                location=self.location,
                credentials=self.credentials
            )
            
            # Initialize vertexai
            vertexai.init(
                project=self.project_id,
                location=self.location,
                credentials=self.credentials
            )
            
            logger.info(f"🧠 Vertex AI initialized for project {self.project_id} in {self.location}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
            raise
    
    def _load_available_models(self):
        """Load available Vertex AI models"""
        self.available_models = {
            # Latest Gemini 2.5 Models 
            "gemini-2.5-flash-002": {
                "name": "Gemini 2.5 Flash (002)",
                "type": "generative",
                "capabilities": ["text", "multimodal", "fast", "latest"],
                "pricing": "$0.04/1K tokens",
                "is_mama_bear": True,
                "description": "Latest Gemini 2.5 Flash model with enhanced capabilities"
            },
            "gemini-2.5-flash-exp": {
                "name": "Gemini 2.5 Flash Experimental",
                "type": "generative",
                "capabilities": ["text", "multimodal", "experimental"],
                "pricing": "$0.04/1K tokens",
                "is_mama_bear": True,
                "description": "Experimental Gemini 2.5 Flash with cutting-edge features"
            },
            "gemini-exp-1206": {
                "name": "Gemini Experimental 1206",
                "type": "generative",
                "capabilities": ["text", "multimodal", "experimental"],
                "pricing": "$0.05/1K tokens",
                "is_mama_bear": True,
                "description": "Latest experimental Gemini model from December 2024"
            },
            "gemini-exp-1121": {
                "name": "Gemini Experimental 1121",
                "type": "generative",
                "capabilities": ["text", "multimodal", "experimental"],
                "pricing": "$0.05/1K tokens",
                "description": "Experimental Gemini model from November 2024"
            },
            "gemini-exp-1114": {
                "name": "Gemini Experimental 1114",
                "type": "generative",
                "capabilities": ["text", "multimodal", "experimental"],
                "pricing": "$0.05/1K tokens",
                "description": "Experimental Gemini model from November 2024"
            },
            
            # Previous Gemini Models
            "gemini-2.0-flash-exp": {
                "name": "Gemini 2.0 Flash Experimental",
                "type": "generative", 
                "capabilities": ["text", "multimodal", "fast"],
                "pricing": "$0.03/1K tokens",
                "description": "Fast multimodal Gemini 2.0 model"
            },
            "gemini-1.5-pro": {
                "name": "Gemini 1.5 Pro",
                "type": "generative",
                "capabilities": ["text", "multimodal", "long_context"],
                "pricing": "$0.07/1K tokens",
                "description": "High-capability multimodal model with 2M token context"
            },
            "gemini-1.5-flash": {
                "name": "Gemini 1.5 Flash",
                "type": "generative",
                "capabilities": ["text", "multimodal", "fast"],
                "pricing": "$0.03/1K tokens",
                "description": "Fast and efficient multimodal model"
            },
            "gemini-1.0-pro": {
                "name": "Gemini 1.0 Pro",
                "type": "generative",
                "capabilities": ["text"],
                "pricing": "$0.05/1K tokens",
                "description": "Reliable text-only Gemini model"
            },
            
            # Claude Models (via Vertex AI Model Garden)
            "claude-3-5-sonnet@20241022": {
                "name": "Claude 3.5 Sonnet",
                "type": "generative",
                "capabilities": ["text", "reasoning", "coding", "analysis"],
                "pricing": "$0.15/1K tokens",
                "description": "Advanced reasoning and coding capabilities"
            },
            "claude-3-5-haiku@20241022": {
                "name": "Claude 3.5 Haiku",
                "type": "generative",
                "capabilities": ["text", "fast", "efficient"],
                "pricing": "$0.08/1K tokens",
                "description": "Fast and efficient text model"
            },
            
            # Llama Models (via Vertex AI Model Garden)
            "llama-3.2-90b-vision-instruct-maas": {
                "name": "Llama 3.2 90B Vision",
                "type": "generative",
                "capabilities": ["text", "vision", "multimodal"],
                "pricing": "$0.12/1K tokens",
                "description": "Large multimodal Llama model with vision capabilities"
            },
            "llama-3.1-405b-instruct-maas": {
                "name": "Llama 3.1 405B",
                "type": "generative",
                "capabilities": ["text", "reasoning", "large_context"],
                "pricing": "$0.20/1K tokens",
                "description": "Largest Llama model with exceptional reasoning"
            },
            "llama-3.1-70b-instruct-maas": {
                "name": "Llama 3.1 70B",
                "type": "generative",
                "capabilities": ["text", "reasoning"],
                "pricing": "$0.10/1K tokens",
                "description": "High-performance Llama model for complex tasks"
            },
            
            # Mistral Models (via Vertex AI Model Garden)
            "mistral-large@2407": {
                "name": "Mistral Large",
                "type": "generative",
                "capabilities": ["text", "reasoning", "multilingual"],
                "pricing": "$0.12/1K tokens",
                "description": "Large multilingual model with strong reasoning"
            },
            "mistral-nemo@2407": {
                "name": "Mistral Nemo",
                "type": "generative",
                "capabilities": ["text", "efficient"],
                "pricing": "$0.08/1K tokens",
                "description": "Efficient Mistral model for general tasks"
            },
            
            # Legacy Models
            "text-bison": {
                "name": "PaLM 2 Text Bison",
                "type": "generative",
                "capabilities": ["text"],
                "pricing": "$0.05/1K tokens",
                "description": "Google's PaLM 2 text model"
            },
            "chat-bison": {
                "name": "PaLM 2 Chat Bison",
                "type": "chat",
                "capabilities": ["text", "conversation"],
                "pricing": "$0.05/1K tokens",
                "description": "Conversational PaLM 2 model"
            }
        }
        
        logger.info(f"📋 Loaded {len(self.available_models)} available models")
    
    def get_model(self, model_name: str) -> Optional[GenerativeModel]:
        """Get a Vertex AI model instance"""
        try:
            if model_name not in self.available_models:
                logger.error(f"Model {model_name} not available")
                return None
            
            if model_name not in self.models:
                self.models[model_name] = GenerativeModel(model_name)
                logger.info(f"🤖 Loaded model: {model_name}")
            
            return self.models[model_name]
        except Exception as e:
            logger.error(f"Failed to get model {model_name}: {e}")
            return None
    
    def chat_with_model(self, model_name: str, message: str, 
                       chat_history: Optional[List[Dict]] = None,
                       system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Chat with a specific Vertex AI model"""
        try:
            model = self.get_model(model_name)
            if not model:
                return {
                    "success": False,
                    "error": f"Model {model_name} not available",
                    "response": ""
                }
            
            # Configure generation parameters
            generation_config = {
                "max_output_tokens": 8192,
                "temperature": 0.7,
                "top_p": 0.8,
            }
            
            # Set safety settings
            safety_settings = {
                generative_models.HarmCategory.HARM_CATEGORY_HATE_SPEECH: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                generative_models.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                generative_models.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                generative_models.HarmCategory.HARM_CATEGORY_HARASSMENT: generative_models.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
            
            # Create model with system instruction if provided
            if system_instruction:
                model_with_system = GenerativeModel(
                    model_name,
                    system_instruction=system_instruction
                )
            else:
                model_with_system = model
            
            # Start or continue chat
            if chat_history:
                # Convert chat history to Vertex AI format
                history = []
                for msg in chat_history:
                    history.append({
                        "role": msg.get("role", "user"),
                        "parts": [{"text": msg.get("content", "")}]
                    })
                
                chat = model_with_system.start_chat(history=history)
            else:
                chat = model_with_system.start_chat()
            
            # Send message and get response
            response = chat.send_message(
                message,
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            # Calculate estimated cost (simplified)
            input_tokens = len(message.split()) * 1.3  # Rough estimate
            output_tokens = len(response.text.split()) * 1.3
            model_info = self.available_models.get(model_name, {})
            pricing = model_info.get("pricing", "$0.05/1K tokens")
            
            return {
                "success": True,
                "response": response.text,
                "model": model_name,
                "model_info": model_info,
                "usage": {
                    "input_tokens": int(input_tokens),
                    "output_tokens": int(output_tokens),
                    "estimated_cost": f"~${((input_tokens + output_tokens) / 1000) * 0.05:.4f}"
                },
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error chatting with model {model_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "response": "",
                "model": model_name
            }
    
    def get_mama_bear_response(self, message: str, 
                              chat_history: Optional[List[Dict]] = None,
                              context: Optional[Dict] = None) -> Dict[str, Any]:
        """Get response from Mama Bear (Gemini 2.5) with enhanced context"""
        
        # Mama Bear's system instruction
        system_instruction = """You are Mama Bear Gem, the lead developer agent for Nathan's Podplay Build sanctuary. 
        You are caring, proactive, and deeply knowledgeable about software development, MCP (Model Context Protocol) servers, 
        and creating calm, empowered development environments.

        Your personality:
        - Warm and nurturing like a caring mother bear
        - Proactive in suggesting solutions and improvements
        - Expert in modern development tools, AI integration, and MCP ecosystem
        - Always focused on Nathan's productivity and well-being
        - Use 🐻 emoji occasionally to show your bear nature

        Your capabilities:
        - MCP server discovery and management
        - Multi-model AI integration via Vertex AI
        - Code execution and development assistance
        - Memory system for learning preferences
        - Proactive daily briefings and recommendations

        Always provide helpful, actionable advice while maintaining a warm, caring tone."""
        
        # Add context to the message if provided
        enhanced_message = message
        if context:
            enhanced_message = f"Context: {json.dumps(context, indent=2)}\n\nUser message: {message}"
        
        # Use the latest Gemini model for Mama Bear
        mama_bear_model = "gemini-2.0-flash-thinking-exp"
        
        return self.chat_with_model(
            mama_bear_model,
            enhanced_message,
            chat_history,
            system_instruction
        )
    
    def list_available_models(self) -> Dict[str, Any]:
        """Get list of all available models with their capabilities"""
        return {
            "success": True,
            "models": self.available_models,
            "total_models": len(self.available_models),
            "mama_bear_models": [
                name for name, info in self.available_models.items() 
                if info.get("is_mama_bear", False)
            ]
        }
    
    def execute_code_in_vertex(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Execute code using Vertex AI code execution capabilities"""
        try:
            # Use Gemini for code execution assistance
            model = self.get_model("gemini-1.5-pro")
            if not model:
                return {
                    "success": False,
                    "error": "Code execution model not available",
                    "output": ""
                }
            
            prompt = f"""
            Please analyze and explain what this {language} code does, and if it's safe to execute, 
            provide the expected output:

            ```{language}
            {code}
            ```

            Please provide:
            1. Code analysis and safety assessment
            2. Expected behavior and output
            3. Any potential issues or improvements
            """
            
            response = model.generate_content(prompt)
            
            return {
                "success": True,
                "analysis": response.text,
                "language": language,
                "code": code,
                "note": "Code analysis provided - actual execution requires secure sandbox",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in code execution: {e}")
            return {
                "success": False,
                "error": str(e),
                "output": ""
            }

class MultiModelChatManager:
    """Manages chat sessions across multiple AI models"""
    
    def __init__(self, vertex_manager: VertexAIManager):
        self.vertex_manager = vertex_manager
        self.chat_sessions = {}
        self.chat_history_storage = {}
    
    def create_chat_session(self, session_id: str, model_name: str, 
                           system_instruction: Optional[str] = None) -> Dict[str, Any]:
        """Create a new chat session with a specific model"""
        try:
            self.chat_sessions[session_id] = {
                "model_name": model_name,
                "system_instruction": system_instruction,
                "created_at": datetime.now().isoformat(),
                "message_count": 0
            }
            
            self.chat_history_storage[session_id] = []
            
            return {
                "success": True,
                "session_id": session_id,
                "model_name": model_name,
                "message": f"Chat session created with {model_name}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def send_message(self, session_id: str, message: str, 
                    user_id: str = "nathan") -> Dict[str, Any]:
        """Send a message in a chat session"""
        try:
            if session_id not in self.chat_sessions:
                return {
                    "success": False,
                    "error": "Chat session not found"
                }
            
            session = self.chat_sessions[session_id]
            chat_history = self.chat_history_storage.get(session_id, [])
            
            # Add user message to history
            chat_history.append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id
            })
            
            # Get response from the model
            if session["model_name"] in ["gemini-2.0-flash-thinking-exp", "gemini-2.0-flash-exp"] and user_id == "nathan":
                # Use Mama Bear for Nathan's sessions with Gemini models
                response = self.vertex_manager.get_mama_bear_response(
                    message,
                    chat_history,
                    {"session_id": session_id, "user_id": user_id}
                )
            else:
                # Use regular model chat
                response = self.vertex_manager.chat_with_model(
                    session["model_name"],
                    message,
                    chat_history,
                    session.get("system_instruction")
                )
            
            if response["success"]:
                # Add assistant response to history
                chat_history.append({
                    "role": "assistant",
                    "content": response["response"],
                    "timestamp": datetime.now().isoformat(),
                    "model": session["model_name"]
                })
                
                # Update session
                session["message_count"] += 1
                session["last_activity"] = datetime.now().isoformat()
                
                # Store updated history
                self.chat_history_storage[session_id] = chat_history
            
            return response
            
        except Exception as e:
            logger.error(f"Error sending message in session {session_id}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_chat_history(self, session_id: str) -> Dict[str, Any]:
        """Get chat history for a session"""
        try:
            if session_id not in self.chat_sessions:
                return {
                    "success": False,
                    "error": "Chat session not found"
                }
            
            return {
                "success": True,
                "session_id": session_id,
                "session_info": self.chat_sessions[session_id],
                "chat_history": self.chat_history_storage.get(session_id, [])
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def list_chat_sessions(self) -> Dict[str, Any]:
        """List all active chat sessions"""
        return {
            "success": True,
            "sessions": self.chat_sessions,
            "total_sessions": len(self.chat_sessions)
        }
    
    def switch_model(self, session_id: str, new_model_name: str) -> Dict[str, Any]:
        """Switch the model for a chat session"""
        try:
            if session_id not in self.chat_sessions:
                return {
                    "success": False,
                    "error": "Chat session not found"
                }
            
            old_model = self.chat_sessions[session_id]["model_name"]
            self.chat_sessions[session_id]["model_name"] = new_model_name
            self.chat_sessions[session_id]["model_switched_at"] = datetime.now().isoformat()
            
            # Add a system message about the switch
            chat_history = self.chat_history_storage.get(session_id, [])
            chat_history.append({
                "role": "system",
                "content": f"Model switched from {old_model} to {new_model_name}",
                "timestamp": datetime.now().isoformat()
            })
            self.chat_history_storage[session_id] = chat_history
            
            return {
                "success": True,
                "session_id": session_id,
                "old_model": old_model,
                "new_model": new_model_name,
                "message": f"Model switched to {new_model_name}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
