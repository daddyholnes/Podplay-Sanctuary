#!/usr/bin/env python3
"""
Minimal Flask-SocketIO server for Podplay Studio
"""

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'podplay-sanctuary-secret'
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Sample in-memory data for testing
conversations = [
    {
        "id": "1",
        "title": "Podplay Studio Architecture",
        "lastMessage": "Let me draft the technical architecture for your multi-modal platform...",
        "timestamp": "2 hours ago",
        "messageCount": 47,
        "type": "project"
    },
    {
        "id": "2",
        "title": "Scout Agent Development",
        "lastMessage": "I've researched the latest autonomous agent patterns for you...",
        "timestamp": "Yesterday",
        "messageCount": 23,
        "type": "research"
    }
]

messages = {
    "1": [
        {
            "id": "101",
            "sender": "user",
            "text": "Can you help me with the Podplay Studio architecture?",
            "timestamp": datetime.now().isoformat(),
            "type": "message"
        },
        {
            "id": "102",
            "sender": "mama-bear",
            "text": "Of course! I'd be happy to draft a technical architecture for your multi-modal platform.",
            "timestamp": datetime.now().isoformat(),
            "type": "response",
            "suggestions": ["Discuss components", "Focus on UI architecture", "Review data flow"]
        }
    ]
}

@app.route('/')
def index():
    return "Podplay Sanctuary Minimal Backend - WebSocket Server"

# API Routes
@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    return jsonify(conversations)

@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def get_messages(conversation_id):
    return jsonify(messages.get(conversation_id, []))

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    emit('connected', {
        'status': 'success',
        'message': 'Connected to Podplay Sanctuary Minimal Backend',
        'client_id': request.sid,
        'timestamp': datetime.now().isoformat()
    })

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_chat_conversation')
def handle_join_chat_conversation(data):
    conversation_id = data.get('conversation_id')
    if not conversation_id:
        emit('error', {'message': 'Conversation ID is required to join chat.'})
        return

    join_room(conversation_id)
    print(f"Client {request.sid} joined chat conversation {conversation_id}")
    emit('chat_conversation_joined', {
        'conversation_id': conversation_id,
        'status': 'success',
        'message': f'Successfully joined conversation {conversation_id}.'
    })

@socketio.on('leave_chat_conversation')
def handle_leave_chat_conversation(data):
    conversation_id = data.get('conversation_id')
    if not conversation_id:
        emit('error', {'message': 'Conversation ID is required to leave chat.'})
        return

    leave_room(conversation_id)
    print(f"Client {request.sid} left chat conversation {conversation_id}")
    emit('chat_conversation_left', {
        'conversation_id': conversation_id,
        'status': 'success',
        'message': f'Successfully left conversation {conversation_id}.'
    })

@socketio.on('send_chat_message')
def handle_send_chat_message(data):
    conversation_id = data.get('conversation_id')
    message_payload = data.get('message')

    if not conversation_id or not message_payload:
        emit('error', {'message': 'Conversation ID and message payload are required.'})
        return
    
    # Augment message with server-side info
    message_id = f"{len(messages.get(conversation_id, []))}-{datetime.now().timestamp()}"
    message_payload['id'] = message_id
    message_payload['timestamp'] = datetime.now().isoformat()
    
    print(f"Message received for conversation {conversation_id}: {message_payload.get('text')[:50]}...")
    
    # Store the message
    if conversation_id not in messages:
        messages[conversation_id] = []
    messages[conversation_id].append(message_payload)
    
    # Broadcast the message to everyone in the conversation room
    socketio.emit('new_chat_message', {
        'conversation_id': conversation_id,
        'message': message_payload
    }, room=conversation_id)
    
    # If this is a user message, generate a Mama Bear response
    if message_payload.get('sender') == 'user':
        # Create a simulated Mama Bear response
        response_text = generate_mama_bear_response(message_payload.get('text', ''))
        
        response = {
            'id': f"{message_id}-response",
            'sender': 'mama-bear',
            'text': response_text,
            'timestamp': datetime.now().isoformat(),
            'type': 'response',
            'suggestions': ['Tell me more', 'Help me understand', 'Continue the conversation']
        }
        
        # Add to stored messages
        messages[conversation_id].append(response)
        
        # Emit after a short delay to simulate thinking time
        import time
        time.sleep(1)
        
        socketio.emit('new_chat_message', {
            'conversation_id': conversation_id,
            'message': response
        }, room=conversation_id)
        
        print(f"Mama Bear responded in conversation {conversation_id}")

def generate_mama_bear_response(user_message):
    """Generate a simple response based on user input"""
    lower_message = user_message.lower()
    
    if 'research' in lower_message or 'find' in lower_message or 'analyze' in lower_message:
        return "🔍 **Starting deep research for you...**\n\nI'm using my full capabilities:\n• Searching current web data\n• Cross-referencing with your memory\n• Analyzing patterns and trends\n• Preparing comprehensive findings\n\nLet me gather the most relevant and up-to-date information on this topic. I'll provide you with insights that connect to your existing projects and goals."
        
    elif 'plan' in lower_message or 'architecture' in lower_message or 'design' in lower_message:
        return "📋 **Excellent! Let me draft a comprehensive plan...**\n\nI'm drawing from:\n• Your previous project patterns (from mem0)\n• Current best practices and technologies\n• Your sensory preferences and workflow needs\n• Integration with your existing tools\n\nI'll create a detailed plan that I can then share with Scout Mama Bear or Workspaces Mama Bear for implementation. Would you like me to start with a high-level overview or dive into specific technical details?"
        
    elif 'scout' in lower_message or 'workspace' in lower_message:
        return "🤝 **Coordinating with your other Mama Bears...**\n\nI can seamlessly collaborate with:\n• **Scout Mama Bear** - for autonomous development workflows\n• **Workspaces Mama Bear** - for environment management\n\nI'll draft detailed plans and hand them off, ensuring perfect continuity of your vision. They'll have all the context they need from our conversation and your memory storage. What would you like me to prepare for them?"
        
    else:
        return "I'm here to help with whatever you need! 💝 \n\nAs your main Mama Bear, I can:\n• **Deep research** any topic with web search + memory\n• **Plan and architect** your projects\n• **Coordinate** with Scout and Workspaces Mama Bears\n• **Remember everything** with your mem0 storage\n• **Browse together** using our shared web preview\n\nWhat's on your mind today? I'm ready to dive deep into any project, research question, or planning challenge you have. 🚀"

if __name__ == '__main__':
    print("🚀 Starting Podplay Sanctuary Minimal WebSocket Server...")
    print("🐻 Mama Bear Control Center is ready!")
    print("🌐 Server will be available at: http://127.0.0.1:5000")
    print("🔌 Socket.IO enabled for real-time communication")
    print("==================================================")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)