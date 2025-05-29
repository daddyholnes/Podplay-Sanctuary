#!/usr/bin/env python3
"""
Standalone Socket.IO test server to diagnose Socket.IO connection issues
Enhanced debugging version
"""

from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import logging
import os
import sys
import json
from datetime import datetime

# Configure logging with detailed format
logging.basicConfig(level=logging.DEBUG, 
                   format='🔌 Socket.IO Test [%(asctime)s] %(levelname)s: %(message)s',
                   datefmt='%Y-%m-%d %H:%M:%S')

# Set up module loggers
logger = logging.getLogger('socketio')
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

engineio_logger = logging.getLogger('engineio')
engineio_logger.setLevel(logging.DEBUG)
engineio_logger.addHandler(logging.StreamHandler())

werkzeug_logger = logging.getLogger('werkzeug')
werkzeug_logger.setLevel(logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'test-secret-key'
app.config['DEBUG'] = True

# Enable CORS with specific configuration
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Create Socket.IO server with debug logging
# CRITICAL: Set path to 'socket.io' without leading slash to match client
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    async_mode='threading',  # Use threading mode for compatibility
    path='socket.io',        # No leading slash - matches client exactly
    ping_timeout=60,
    ping_interval=25,
    manage_session=False     # Don't manage Flask sessions
)

# Define routes
@app.route('/')
def index():
    """Main test page with interactive Socket.IO test interface"""
    return """
    <html>
    <head>
        <title>Enhanced Socket.IO Test Server</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2 { color: #333; }
            pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow: auto; }
            .success { color: #28a745; }
            .error { color: #dc3545; }
            .info { color: #17a2b8; }
            button { padding: 8px 16px; margin: 5px; background: #007bff; color: white; 
                    border: none; border-radius: 4px; cursor: pointer; }
            #events { margin-top: 20px; }
            .event-item { padding: 8px; margin: 5px 0; border-left: 4px solid #ddd; }
        </style>
        <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
    </head>
    <body>
        <h1>Enhanced Socket.IO Test Server</h1>
        <p>Server is running on port 5001 with path <code>socket.io</code> (no leading slash)</p>
        
        <div id="status" style="padding: 15px; margin: 10px 0; border-radius: 5px; font-weight: bold; 
                              background: #d1ecf1; color: #0c5460;">
            Ready to connect
        </div>
        
        <div>
            <button id="connectBtn">Connect</button>
            <button id="disconnectBtn">Disconnect</button>
            <button id="testEventBtn">Send Test Event</button>
            <button id="clearBtn">Clear Events</button>
        </div>
        
        <h2>Transport Options</h2>
        <div>
            <label>
                <input type="checkbox" id="websocketCb" checked> WebSocket
            </label>
            <label>
                <input type="checkbox" id="pollingCb" checked> Polling
            </label>
        </div>
        
        <h2>Events</h2>
        <div id="events"></div>
        
        <h2>Connection Details</h2>
        <pre id="details">Not connected</pre>
        
        <h2>Server Environment</h2>
        <pre>
Path: socket.io (no leading slash)
Port: 5001
CORS: Enabled (all origins)
Async Mode: threading
Ping Timeout: 60s
Ping Interval: 25s
        </pre>
        
        <script>
            const statusEl = document.getElementById('status');
            const detailsEl = document.getElementById('details');
            const eventsEl = document.getElementById('events');
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            const testEventBtn = document.getElementById('testEventBtn');
            const clearBtn = document.getElementById('clearBtn');
            const websocketCb = document.getElementById('websocketCb');
            const pollingCb = document.getElementById('pollingCb');
            
            let socket = null;
            
            function updateStatus(message, type) {
                statusEl.textContent = message;
                statusEl.className = type;
            }
            
            function logEvent(message) {
                const eventEl = document.createElement('div');
                eventEl.className = 'event-item';
                eventEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
                eventsEl.prepend(eventEl);
            }
            
            function updateDetails() {
                if (!socket) {
                    detailsEl.textContent = 'No active connection';
                    return;
                }
                
                const details = {
                    id: socket.id || 'Not assigned yet',
                    connected: socket.connected,
                    disconnected: socket.disconnected,
                    transport: socket.io?.engine?.transport?.name || 'N/A',
                    protocol: socket.io?.engine?.protocol || 'N/A',
                    uri: socket.io?.uri || 'N/A'
                };
                
                detailsEl.textContent = JSON.stringify(details, null, 2);
            }
            
            connectBtn.addEventListener('click', () => {
                try {
                    updateStatus('Connecting...', 'info');
                    
                    // Determine transports based on checkboxes
                    const transports = [];
                    if (pollingCb.checked) transports.push('polling');
                    if (websocketCb.checked) transports.push('websocket');
                    
                    if (transports.length === 0) {
                        updateStatus('Error: Select at least one transport', 'error');
                        return;
                    }
                    
                    const url = 'http://localhost:5001';
                    logEvent(`Connecting to ${url} with transports: ${transports.join(', ')}`);
                    
                    socket = io(url, {
                        transports: transports,
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        timeout: 20000,
                        path: 'socket.io',  // No leading slash - matches server exactly
                        upgrade: true,
                        forceNew: true,
                        autoConnect: true,
                        reconnection: true
                    });
                    
                    socket.on('connect', () => {
                        updateStatus('Connected!', 'success');
                        logEvent('Connected to server');
                        updateDetails();
                    });
                    
                    socket.on('disconnect', (reason) => {
                        updateStatus('Disconnected: ' + reason, 'error');
                        logEvent(`Disconnected: ${reason}`);
                        updateDetails();
                    });
                    
                    socket.on('connect_error', (error) => {
                        updateStatus('Connection Error: ' + error.message, 'error');
                        logEvent(`Connection Error: ${error.message}`);
                        updateDetails();
                    });
                    
                    socket.on('reconnect_attempt', (attemptNumber) => {
                        updateStatus(`Reconnect attempt #${attemptNumber}`, 'info');
                        logEvent(`Reconnect attempt #${attemptNumber}`);
                    });
                    
                    socket.on('connected', (data) => {
                        logEvent(`Server welcomes us: ${JSON.stringify(data)}`);
                    });
                    
                    socket.on('test_response', (data) => {
                        logEvent(`Received test_response: ${JSON.stringify(data)}`);
                    });
                    
                } catch (err) {
                    updateStatus('Error: ' + err.message, 'error');
                    console.error(err);
                }
            });
            
            disconnectBtn.addEventListener('click', () => {
                if (socket) {
                    socket.disconnect();
                    logEvent('Manually disconnected');
                }
            });
            
            testEventBtn.addEventListener('click', () => {
                if (socket && socket.connected) {
                    socket.emit('test_event', { message: 'Hello from test client!', timestamp: new Date().toISOString() });
                    logEvent('Sent test_event');
                } else {
                    logEvent('Cannot send event: Not connected');
                }
            });
            
            clearBtn.addEventListener('click', () => {
                eventsEl.innerHTML = '';
            });
            
            // Update details periodically
            setInterval(updateDetails, 2000);
        </script>
    </body>
    </html>
    """

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection with debug info"""
    client_id = request.sid
    logger.info(f"✅ Client connected! ID: {client_id}")
    logger.info(f"✅ Transport: {request.namespace.server.eio.transport(sid=client_id)}")
    
    # Log all headers and connection info for debugging
    if hasattr(request, 'headers'):
        headers = {k: v for k, v in request.headers.items()}
        logger.info(f"✅ Connection headers: {json.dumps(headers)}")
    
    emit('connected', {
        'status': 'success',
        'message': 'Connected to enhanced test server',
        'server_time': datetime.now().isoformat(),
        'client_id': client_id
    })

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection with reason"""
    logger.info(f"❌ Client disconnected: {request.sid}")

@socketio.on('test_event')
def handle_test(data):
    """Handle test event with echo"""
    logger.info(f"📢 Received test event from {request.sid}: {data}")
    
    # Echo the data back with timestamp
    response_data = {
        'status': 'success',
        'message': 'Test event received',
        'server_time': datetime.now().isoformat(),
        'original_data': data,
        'client_id': request.sid
    }
    
    emit('test_response', response_data)
    logger.info(f"📤 Sent test response to {request.sid}")

@socketio.on_error()
def handle_error(e):
    """Handle Socket.IO errors with detailed logging"""
    logger.error(f"🚨 Socket.IO error for {request.sid}: {str(e)}")
    logger.exception(e)

@socketio.on_error_default
def handle_default_error(e):
    """Handle default Socket.IO errors"""
    logger.error(f"🚨 Default error handler: {str(e)}")
    logger.exception(e)

# Debug route to check server status
@app.route('/status')
def status():
    """Server status route for diagnostics"""
    status_info = {
        'server': 'Enhanced Socket.IO Test Server',
        'time': datetime.now().isoformat(),
        'python_version': sys.version,
        'socketio_path': socketio.server.eio.path,
        'socketio_async_mode': socketio.async_mode,
        'clients_count': len(socketio.server.eio.sockets) if hasattr(socketio.server.eio, 'sockets') else 0,
    }
    
    return f"""
    <html>
        <head><title>Server Status</title></head>
        <body>
            <h1>Socket.IO Test Server Status</h1>
            <pre>{json.dumps(status_info, indent=2)}</pre>
        </body>
    </html>
    """

if __name__ == '__main__':
    # Print startup banner
    print("=" * 60)
    print("🚀 Enhanced Socket.IO Test Server")
    print("📡 Debug mode: ENABLED")
    print("🔌 Socket.IO path: socket.io (no leading slash)")
    print("🌐 Server will be available at: http://localhost:5001")
    print("📊 Status page: http://localhost:5001/status")
    print("=" * 60)
    
    # Run the server
    socketio.run(
        app,
        host='0.0.0.0',
        port=5001,
        debug=True,
        use_reloader=False,
        log_output=True
    )
