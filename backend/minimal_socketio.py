#!/usr/bin/env python3
"""
Minimal Flask-SocketIO test server
Just the basics to confirm Socket.IO functioning
"""

from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('socketio')
logger.setLevel(logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key'
CORS(app)

# Create Socket.IO instance with minimal configuration
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
        <title>Minimal Socket.IO Test</title>
    </head>
    <body>
        <h1>Minimal Socket.IO Test Server</h1>
        <p>Running on port 5002</p>
    </body>
    </html>
    """

@socketio.on('connect')
def test_connect():
    print("Client connected!")
    emit('connected', {'data': 'Connected!'})

@socketio.on('disconnect')
def test_disconnect():
    print("Client disconnected!")

@socketio.on('message')
def test_message(message):
    print(f"Received message: {message}")
    emit('response', {'data': f'Server received: {message}'})

if __name__ == '__main__':
    print("Starting minimal Socket.IO test server on port 5002...")
    socketio.run(app, host='0.0.0.0', port=5002, debug=True)
