#!/usr/bin/env python3
"""
Socket.IO Minimal Test
For diagnosing Socket.IO connection issues
"""

from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('socketio')
logger.setLevel(logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key'

# Enable CORS for all origins
CORS(app)

# Create Socket.IO instance with very basic configuration
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>Socket.IO Minimal Test</title>
        <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const socket = io();
                
                document.getElementById('status').textContent = 'Connecting...';
                
                socket.on('connect', function() {
                    document.getElementById('status').textContent = 'Connected: ' + socket.id;
                    document.getElementById('status').style.color = 'green';
                });
                
                socket.on('connect_error', function(err) {
                    document.getElementById('status').textContent = 'Error: ' + err.message;
                    document.getElementById('status').style.color = 'red';
                });
                
                socket.on('welcome', function(data) {
                    const p = document.createElement('p');
                    p.textContent = 'Server says: ' + data.message;
                    document.getElementById('messages').appendChild(p);
                });
                
                document.getElementById('sendBtn').addEventListener('click', function() {
                    socket.emit('message', 'Hello Server!');
                    const p = document.createElement('p');
                    p.textContent = 'You sent: Hello Server!';
                    document.getElementById('messages').appendChild(p);
                });
            });
        </script>
    </head>
    <body>
        <h1>Socket.IO Minimal Test</h1>
        <p id="status">Waiting for connection...</p>
        <button id="sendBtn">Send Message</button>
        <div id="messages"></div>
    </body>
    </html>
    """

@socketio.on('connect')
def handle_connect():
    print("Client connected!")
    socketio.emit('welcome', {'message': 'Welcome to the minimal test server!'})

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

@socketio.on('message')
def handle_message(data):
    print(f"Received message: {data}")
    socketio.emit('welcome', {'message': f'You said: {data}'})

if __name__ == '__main__':
    print("Starting Socket.IO minimal test server on port 5003")
    socketio.run(
        app,
        host='0.0.0.0',
        port=5003,
        debug=True,
        allow_unsafe_werkzeug=True
    )
