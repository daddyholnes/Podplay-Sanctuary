#!/usr/bin/env python3
"""
Minimal Socket.IO server for testing connections
This is a stripped-down version of the app.py file with just Socket.IO functionality
"""

import os
import sys
import logging
from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='SOCKETIO_TEST: %(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configure Socket.IO and Engine.IO logging
logging.getLogger('socketio').setLevel(logging.DEBUG)
logging.getLogger('engineio').setLevel(logging.DEBUG)
logging.getLogger('websockets').setLevel(logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Socket.IO with proper configuration
socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    async_mode='threading',
    engineio_logger=True,
    logger=True,
    ping_timeout=60,
    ping_interval=25,
    manage_session=False
)

@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Socket.IO Test</title>
    </head>
    <body>
        <h1>Socket.IO Test Server</h1>
        <p>This is a minimal Socket.IO test server. Open the browser console to see connection logs.</p>
        <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
        <script>
            const socket = io();
            
            socket.on('connect', () => {
                console.log('Connected to server with ID:', socket.id);
                document.body.innerHTML += '<p>Connected to server!</p>';
                
                // Send test event
                socket.emit('test_event', {message: 'Hello from browser client!'});
            });
            
            socket.on('test_response', (data) => {
                console.log('Received test response:', data);
                document.body.innerHTML += '<p>Received: ' + JSON.stringify(data) + '</p>';
            });
            
            socket.on('disconnect', () => {
                console.log('Disconnected from server');
                document.body.innerHTML += '<p>Disconnected from server</p>';
            });
            
            socket.on('connect_error', (err) => {
                console.error('Connection error:', err);
                document.body.innerHTML += '<p>Connection error: ' + err.message + '</p>';
            });
        </script>
    </body>
    </html>
    """

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'success', 'message': 'Connected to test server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('test_event')
def handle_test_event(data):
    """Handle test events"""
    logger.info(f"Received test_event: {data}")
    emit('test_response', {
        'status': 'success',
        'message': 'Test event received',
        'data': data
    })

if __name__ == '__main__':
    print("Starting minimal Socket.IO test server...")
    print("Server will be available at http://127.0.0.1:5005")
    print("Socket.IO path: /socket.io/")
    
    # Run the Socket.IO server
    socketio.run(
        app,
        host="0.0.0.0",
        port=5005,
        debug=True,
        use_reloader=False,
        allow_unsafe_werkzeug=True,
        log_output=True
    )
