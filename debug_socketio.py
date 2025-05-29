#!/usr/bin/env python3
"""
Socket.IO debugging script for Podplay Sanctuary

This script runs a minimal Flask server with Socket.IO enabled
to help diagnose Socket.IO connection issues.
"""

import os
import sys
import logging
import subprocess
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='DEBUG SCRIPT: %(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def create_debugging_code():
    """Create a debug version of app.py with enhanced logging and simplified structure"""
    script_dir = os.path.abspath(os.path.dirname(__file__))
    original_path = os.path.join(script_dir, "backend", "app.py")
    debug_path = os.path.join(script_dir, "backend", "app_debug.py")
    
    # Check if original app.py exists
    if not os.path.exists(original_path):
        logger.error(f"Original app.py not found at {original_path}")
        return False
        
    logger.info(f"Creating debug version of app.py at {debug_path}")
    
    # Create a backup of the original file if it doesn't exist
    backup_path = os.path.join(script_dir, "backend", f"app_original_{datetime.now().strftime('%Y%m%d%H%M%S')}.py.bak")
    try:
        with open(original_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
            
        # Create backup
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(original_content)
        logger.info(f"Created backup at {backup_path}")
            
        # Create debug version with added logging and exception handling
        debug_content = """#!/usr/bin/env python3
\"\"\"
DEBUG VERSION - Podplay Build Backend with Socket.IO debugging
\"\"\"

import os
import sys
import logging
import traceback
from datetime import datetime
import time

# Configure debug logging
logging.basicConfig(
    level=logging.DEBUG,
    format='DEBUG: %(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app_debug.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Log startup info
logger.debug("="*80)
logger.debug("Starting Socket.IO DEBUG version")
logger.debug(f"Python version: {sys.version}")
logger.debug(f"Current directory: {os.getcwd()}")
logger.debug("="*80)

try:
    # Import minimal Flask and Socket.IO dependencies
    logger.debug("Importing Flask dependencies...")
    from flask import Flask, request, jsonify
    from flask_socketio import SocketIO, emit
    from flask_cors import CORS
    
    # Configure Socket.IO and Engine.IO logging
    logging.getLogger('socketio').setLevel(logging.DEBUG)
    logging.getLogger('engineio').setLevel(logging.DEBUG)
    logging.getLogger('websockets').setLevel(logging.DEBUG)
    
    # Initialize Flask app with minimal configuration
    logger.debug("Initializing Flask app...")
    app = Flask(__name__)
    
    # Enable CORS for all origins
    logger.debug("Configuring CORS...")
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    @app.route('/')
    def index():
        return "Podplay Sanctuary DEBUG Mode - Socket.IO Server"
    
    @app.route('/debug')
    def debug():
        return jsonify({
            "status": "running",
            "mode": "debug",
            "time": datetime.now().isoformat()
        })
    
    # Initialize Socket.IO with proper configuration
    logger.debug("Initializing Socket.IO...")
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
    
    # ==================== SOCKET.IO EVENT HANDLERS ====================
    
    @socketio.on('connect')
    def handle_connect():
        \"\"\"Handle client connection\"\"\"
        logger.info(f"Client connected: {request.sid}")
        emit('connected', {'status': 'success', 'message': 'Connected to DEBUG server'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        \"\"\"Handle client disconnection\"\"\"
        logger.info(f"Client disconnected: {request.sid}")
    
    @socketio.on('test_event')
    def handle_test_event(data):
        \"\"\"Handle test events\"\"\"
        logger.info(f"Received test event: {data}")
        emit('test_response', {
            'status': 'success',
            'message': 'Test event received by DEBUG server',
            'data': data,
            'time': datetime.now().isoformat()
        })
    
    if __name__ == '__main__':
        logger.debug("Starting Socket.IO server...")
        
        try:
            # Run the Socket.IO server
            socketio.run(
                app,
                host="0.0.0.0", 
                port=5000, 
                debug=True,
                use_reloader=False,
                allow_unsafe_werkzeug=True,
                log_output=True
            )
        except Exception as e:
            logger.error(f"Error in socketio.run(): {e}")
            logger.error(traceback.format_exc())
            
except Exception as e:
    logger.error(f"Error during initialization: {e}")
    logger.error(traceback.format_exc())
"""
        
        # Write the debug version
        with open(debug_path, 'w', encoding='utf-8') as f:
            f.write(debug_content)
            
        logger.info(f"Created debug version at {debug_path}")
        return debug_path
        
    except Exception as e:
        logger.error(f"Error creating debug version: {e}")
        return False

def run_debug_server(script_path):
    """Run the debug server"""
    try:
        # Use Python executable from the current environment
        python_exec = sys.executable
        
        logger.info(f"Starting debug server using Python: {python_exec}")
        logger.info(f"Script path: {script_path}")
        
        # Run the server in a new process and capture output
        process = subprocess.Popen(
            [python_exec, script_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1  # Line buffered
        )
        
        logger.info(f"Server process started with PID: {process.pid}")
        
        # Monitor output
        while True:
            stdout_line = process.stdout.readline()
            if stdout_line:
                print(stdout_line.strip())
            
            stderr_line = process.stderr.readline()
            if stderr_line:
                print(f"ERROR: {stderr_line.strip()}")
                
            # Check if process is still running
            if process.poll() is not None:
                # Process ended
                logger.warning(f"Server process exited with code: {process.returncode}")
                
                # Get any remaining output
                remaining_stdout, remaining_stderr = process.communicate()
                if remaining_stdout:
                    print(remaining_stdout.strip())
                if remaining_stderr:
                    print(f"ERROR: {remaining_stderr.strip()}")
                    
                break
                
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt detected. Stopping server...")
        if 'process' in locals() and process:
            process.terminate()
            process.wait(timeout=5)
            
    except Exception as e:
        logger.error(f"Error running debug server: {e}")

if __name__ == "__main__":
    print("="*80)
    print("Podplay Sanctuary - Socket.IO Debug Script")
    print("="*80)
    
    debug_path = create_debugging_code()
    if debug_path:
        print(f"\nCreated debug version at {debug_path}")
        print("\nStarting the debug server...\n")
        run_debug_server(debug_path)
    else:
        print("Failed to create debug version. Check the logs for details.")
