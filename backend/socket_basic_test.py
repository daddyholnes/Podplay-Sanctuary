#!/usr/bin/env python3
"""
Ultra-minimal Socket.IO test server 
For diagnosing Socket.IO connection issues
"""

from flask import Flask
from flask_socketio import SocketIO

# Create Flask app
app = Flask(__name__)

# Create Socket.IO server with basic configuration
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
        <title>Basic Socket.IO Test</title>
        <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const socket = io();
                const logEl = document.getElementById('log');
                
                function log(msg) {
                    const div = document.createElement('div');
                    div.textContent = msg;
                    logEl.appendChild(div);
                    console.log(msg);
                }
                
                log('Connecting...');
                
                socket.on('connect', function() {
                    log('Connected! Socket ID: ' + socket.id);
                });
                
                socket.on('connect_error', function(err) {
                    log('Connection error: ' + err.message);
                });
                
                socket.on('message', function(data) {
                    log('Received message: ' + JSON.stringify(data));
                });
                
                // Send a test message after 2 seconds
                setTimeout(function() {
                    socket.emit('message', 'Hello from client');
                    log('Sent message');
                }, 2000);
            });
        </script>
    </head>
    <body>
        <h1>Basic Socket.IO Test Server</h1>
        <div id="log" style="border: 1px solid #ccc; padding: 10px; margin-top: 20px; height: 200px; overflow: auto;"></div>
    </body>
    </html>
    """

@socketio.on('connect')
def handle_connect():
    print(f"Client connected!")
    socketio.emit('message', {'status': 'Connected to basic test server'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected")

@socketio.on('message')
def handle_message(data):
    print(f"Received message: {data}")
    socketio.emit('message', {'received': data, 'response': 'Message received by server'})

if __name__ == '__main__':
    print("Starting basic Socket.IO test server on port 5002...")
    socketio.run(app, host='0.0.0.0', port=5002, debug=True)
