#!/usr/bin/env python3
"""
Minimal Flask Socket.IO server
For diagnosing Socket.IO connection issues
"""

from flask import Flask, request
from flask_socketio import SocketIO
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='DEBUG: %(levelname)s - %(message)s')
logging.getLogger('socketio').setLevel(logging.DEBUG)
logging.getLogger('engineio').setLevel(logging.DEBUG)

# Create Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Socket.IO with minimal config
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode='threading'  # Use threading mode for Windows compatibility
)

@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>Minimal Flask Socket.IO Test</title>
        <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const socket = io();
                
                document.getElementById('status').textContent = 'Connecting...';
                
                socket.on('connect', function() {
                    document.getElementById('status').textContent = 'Connected: ' + socket.id;
                    document.getElementById('status').style.color = 'green';
                    console.log('Connected!', socket.id);
                });
                
                socket.on('connect_error', function(err) {
                    document.getElementById('status').textContent = 'Error: ' + err.message;
                    document.getElementById('status').style.color = 'red';
                    console.error('Connection error:', err);
                });
                
                socket.on('message', function(data) {
                    const p = document.createElement('p');
                    p.textContent = JSON.stringify(data);
                    document.getElementById('messages').appendChild(p);
                    console.log('Received:', data);
                });
                
                document.getElementById('sendBtn').onclick = function() {
                    socket.emit('client_message', {text: 'Hello from client'});
                    console.log('Message sent');
                };
            });
        </script>
    </head>
    <body>
        <h1>Minimal Flask Socket.IO Test</h1>
        <p id="status">Waiting for connection...</p>
        <button id="sendBtn">Send Message</button>
        <div id="messages"></div>
    </body>
    </html>
    """

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")
    socketio.emit('message', {'status': 'Connected to server', 'id': request.sid})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('client_message')
def handle_message(data):
    print(f"Received message from {request.sid}: {data}")
    socketio.emit('message', {'received': data, 'response': 'Server got your message!'})

if __name__ == '__main__':
    print("Starting minimal Flask Socket.IO server on port 5050")
    socketio.run(
        app,
        host='0.0.0.0',
        port=5050,
        debug=True,
        allow_unsafe_werkzeug=True
    )
