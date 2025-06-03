"""
Models API - Handles requests to AI models and file operations
"""

import os
import uuid
import json
import logging
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import google.generativeai as genai
import openai
import anthropic
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize the blueprint
models_api = Blueprint('models_api', __name__)

# Initialize model APIs
openai.api_key = os.getenv('OPENAI_API_KEY')
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Load available models from configuration
MODELS_CONFIG_PATH = os.path.join(os.path.dirname(__file__), '../config/models_catalog.json')
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'doc', 'docx', 'mp3', 'mp4', 'wav'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

try:
    with open(MODELS_CONFIG_PATH, 'r') as f:
        MODELS = json.load(f)
except (FileNotFoundError, json.JSONDecodeError) as e:
    logger.error(f"Error loading models configuration: {e}")
    MODELS = {
        "gemini-2.5-pro-preview-05-06": {
            "provider": "google",
            "max_tokens": 8192,
            "capabilities": ["text", "images", "code"]
        },
        "gpt-4o": {
            "provider": "openai",
            "max_tokens": 8192,
            "capabilities": ["text", "images", "code"]
        },
        "claude-3-opus": {
            "provider": "anthropic",
            "max_tokens": 100000,
            "capabilities": ["text", "images", "code"]
        }
    }

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@models_api.route('/api/models', methods=['GET'])
def get_models():
    """Return list of available models"""
    return jsonify({"models": MODELS})

@models_api.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle file uploads for AI processing"""
    if 'files' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({"error": "No files selected"}), 400
    
    uploaded_files = []
    for file in files:
        if file and allowed_file(file.filename):
            # Generate secure filename with UUID to avoid collisions
            filename = secure_filename(file.filename)
            file_uuid = str(uuid.uuid4())
            unique_filename = f"{file_uuid}_{filename}"
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            # Save the file
            file.save(file_path)
            
            # Create relative URL and handle preview generation
            file_url = f"/uploads/{unique_filename}"
            preview_url = None
            
            # If it's an image, use the same URL for preview
            if file.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}:
                preview_url = file_url
            
            uploaded_files.append({
                "id": file_uuid,
                "name": filename,
                "type": file.content_type,
                "size": os.path.getsize(file_path),
                "url": file_url,
                "preview": preview_url,
                "uploadTime": datetime.now().isoformat()
            })
    
    return jsonify({"files": uploaded_files})

@models_api.route('/api/chat/completion', methods=['POST'])
def chat_completion():
    """Process chat completion requests for various models"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        model_id = data.get('model')
        messages = data.get('messages', [])
        files = data.get('files', [])
        
        if not model_id or not messages:
            return jsonify({"error": "Model ID and messages are required"}), 400
        
        # Determine provider based on model ID
        provider = data.get('provider') or get_provider(model_id)
        
        # Process based on provider
        if provider == 'google':
            response = process_gemini_request(model_id, messages, files)
        elif provider == 'openai':
            response = process_openai_request(model_id, messages, files)
        elif provider == 'anthropic':
            response = process_anthropic_request(model_id, messages, files)
        else:
            return jsonify({"error": f"Unsupported provider: {provider}"}), 400
        
        return jsonify(response)
    
    except Exception as e:
        logger.error(f"Error processing chat completion: {str(e)}")
        return jsonify({
            "error": "Failed to process request",
            "message": str(e)
        }), 500

@models_api.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio files to text"""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({"error": "Empty audio file"}), 400
    
    try:
        # Save temporary file
        temp_filename = f"temp_audio_{uuid.uuid4()}.wav"
        temp_path = os.path.join(UPLOAD_FOLDER, temp_filename)
        audio_file.save(temp_path)
        
        # Use OpenAI's Whisper for transcription
        with open(temp_path, "rb") as file:
            transcription = openai.audio.transcriptions.create(
                model="whisper-1", 
                file=file
            )
        
        # Clean up temp file
        os.remove(temp_path)
        
        return jsonify({"text": transcription.text})
    
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        return jsonify({"error": str(e)}), 500

def get_provider(model_id):
    """Determine provider based on model ID"""
    if model_id.startswith('gpt') or model_id.startswith('text-davinci'):
        return 'openai'
    elif model_id.startswith('gemini') or model_id.startswith('gemma'):
        return 'google'
    elif model_id.startswith('claude'):
        return 'anthropic'
    else:
        return 'unknown'

def process_gemini_request(model_id, messages, files):
    """Process request for Google's Gemini models"""
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel(model_id)
        
        # Format messages for Gemini
        gemini_messages = []
        for msg in messages:
            role = "user" if msg['role'] == 'user' else "model"
            gemini_messages.append({"role": role, "parts": [{"text": msg['content']}]})
        
        # Add image parts for multimodal support
        if files:
            for file in files:
                if file.get('type', '').startswith('image/'):
                    file_path = os.path.join(current_app.root_path, file['url'].lstrip('/'))
                    if os.path.exists(file_path):
                        gemini_messages[-1]["parts"].append({
                            "inline_data": {
                                "mime_type": file['type'],
                                "data": open(file_path, "rb").read()
                            }
                        })
        
        # Generate response from Gemini
        gemini_chat = model.start_chat(history=gemini_messages)
        response = gemini_chat.send_message(gemini_messages[-1]["parts"])
        
        # Format response
        return {
            "id": str(uuid.uuid4()),
            "content": response.text,
            "role": "assistant",
            "model": model_id,
            "usage": {
                "promptTokens": response.usage.prompt_tokens if hasattr(response, 'usage') else 0,
                "completionTokens": response.usage.completion_tokens if hasattr(response, 'usage') else 0,
                "totalTokens": response.usage.total_tokens if hasattr(response, 'usage') else 0
            }
        }
    except Exception as e:
        logger.error(f"Error processing Gemini request: {str(e)}")
        raise

def process_openai_request(model_id, messages, files):
    """Process request for OpenAI models"""
    try:
        # Format messages for OpenAI
        openai_messages = []
        for msg in messages:
            openai_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add image URLs for vision models
        if files and "vision" in model_id:
            content_parts = []
            content_parts.append({"type": "text", "text": messages[-1]['content']})
            
            for file in files:
                if file.get('type', '').startswith('image/'):
                    file_path = os.path.join(current_app.root_path, file['url'].lstrip('/'))
                    if os.path.exists(file_path):
                        content_parts.append({
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file['type']};base64,{open(file_path, 'rb').read().encode('base64')}"
                            }
                        })
            
            # Replace the last message content with the content parts
            openai_messages[-1]["content"] = content_parts
        
        # Generate response from OpenAI
        response = openai.chat.completions.create(
            model=model_id,
            messages=openai_messages
        )
        
        # Format response
        return {
            "id": response.id,
            "content": response.choices[0].message.content,
            "role": "assistant",
            "model": model_id,
            "usage": {
                "promptTokens": response.usage.prompt_tokens,
                "completionTokens": response.usage.completion_tokens,
                "totalTokens": response.usage.total_tokens
            }
        }
    except Exception as e:
        logger.error(f"Error processing OpenAI request: {str(e)}")
        raise

def process_anthropic_request(model_id, messages, files):
    """Process request for Anthropic Claude models"""
    try:
        # Initialize Anthropic client
        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        
        # Format messages for Claude
        claude_messages = []
        for msg in messages:
            claude_messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add image URLs for multimodal support
        if files:
            content_blocks = []
            content_blocks.append({"type": "text", "text": messages[-1]['content']})
            
            for file in files:
                if file.get('type', '').startswith('image/'):
                    file_path = os.path.join(current_app.root_path, file['url'].lstrip('/'))
                    if os.path.exists(file_path):
                        with open(file_path, "rb") as img_file:
                            image_data = img_file.read()
                            content_blocks.append({
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": file['type'],
                                    "data": image_data.encode('base64')
                                }
                            })
            
            # Replace the last message content with the content blocks
            claude_messages[-1]["content"] = content_blocks
        
        # Generate response from Claude
        response = client.messages.create(
            model=model_id,
            messages=claude_messages,
            max_tokens=2048
        )
        
        # Format response
        return {
            "id": response.id,
            "content": response.content[0].text,
            "role": "assistant",
            "model": model_id,
            "usage": {
                "promptTokens": 0,  # Claude doesn't provide token usage in the same way
                "completionTokens": 0,
                "totalTokens": 0
            }
        }
    except Exception as e:
        logger.error(f"Error processing Anthropic request: {str(e)}")
        raise
