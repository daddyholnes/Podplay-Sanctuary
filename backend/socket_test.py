#!/usr/bin/env python3
"""
Standalone Socket.IO test server to diagnose Socket.IO connection issues
"""

from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='🔌 Socket.IO Test: %(levelname)s - %(message)s')
logger = logging.getLogger('socketio')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'test-secret-key'

# Enable CORS
CORS(app)

# Create Socket.IO server with debug logging
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode='threading',  # Use threading mode for compatibility
    path='/socket.io/'       # Explicitly set path
)

# Define routes
@app.route('/')
def index():
    return """
    <html>
    <head>
        <title>Socket.IO Test</title>
    </head>
    <body>
        <h1>Socket.IO Test Server</h1>
        <p>Server is running. Connect to http://localhost:5001 with a Socket.IO client.</p>
    </body>
    </html>
    """

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected!")
    emit('connected', {'status': 'success', 'message': 'Connected to test server'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected")

@socketio.on('test_event')
def handle_test(data):
    logger.info(f"Received test event: {data}")
    emit('test_response', {'status': 'success', 'message': 'Test event received', 'data': data})

@socketio.on_error()
def handle_error(e):
    logger.error(f"Socket.IO error: {e}")

if __name__ == '__main__':
    logger.info("🚀 Starting standalone Socket.IO test server on port 5001...")
    socketio.run(
        app,
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=False
    )
