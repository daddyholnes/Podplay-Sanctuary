#!/usr/bin/env python3
"""
Socket.IO Configuration Fix
Modifies app.py to fix Socket.IO connection issues
"""

import os
import re
import sys
import shutil
import fileinput

# Path to app.py
APP_PY_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), 
    'backend', 
    'app.py'
)

# Backup the original file
BACKUP_PATH = APP_PY_PATH + '.bak'
print(f"Creating backup of {APP_PY_PATH} to {BACKUP_PATH}")
shutil.copy2(APP_PY_PATH, BACKUP_PATH)

# The pattern to find the Socket.IO initialization
SOCKETIO_PATTERN = r"socketio\s*=\s*SocketIO\s*\(\s*app[\s\S]*?\)"

# The replacement Socket.IO initialization
SOCKETIO_REPLACEMENT = """socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    async_mode='threading',
    engineio_logger=True,
    logger=True,
    ping_timeout=60,
    ping_interval=25,
    manage_session=False
)"""

# The pattern to find the socketio.run call
RUN_PATTERN = r"socketio.run\s*\(\s*app[\s\S]*?\)"

# The replacement socketio.run call
RUN_REPLACEMENT = """socketio.run(
        app,
        host="0.0.0.0", 
        port=5000, 
        debug=True,
        use_reloader=False,
        allow_unsafe_werkzeug=True,
        log_output=True
    )"""

def fix_socketio_config():
    """Fix the Socket.IO configuration in app.py"""
    with open(APP_PY_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix Socket.IO initialization
    new_content = re.sub(SOCKETIO_PATTERN, SOCKETIO_REPLACEMENT, content)
    
    # Fix socketio.run call
    new_content = re.sub(RUN_PATTERN, RUN_REPLACEMENT, new_content)
    
    with open(APP_PY_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Additional modifications to add logging for Socket.IO
def add_socketio_logging():
    """Add additional logging for Socket.IO at the start of the file"""
    with open(APP_PY_PATH, 'r', encoding='utf-8') as f:
        content = f.readlines()
    
    # Find the right spot to add logging (after imports)
    for i, line in enumerate(content):
        if "import requests" in line:
            insert_point = i + 1
            break
    else:
        insert_point = 20  # Default if not found
    
    # Add logging configuration
    logging_code = [
        "\n# Configure Socket.IO and Engine.IO logging\n",
        "logging.getLogger('socketio').setLevel(logging.DEBUG)\n",
        "logging.getLogger('engineio').setLevel(logging.DEBUG)\n",
        "logging.getLogger('websockets').setLevel(logging.DEBUG)\n",
        "\n"
    ]
    
    content[insert_point:insert_point] = logging_code
    
    with open(APP_PY_PATH, 'w', encoding='utf-8') as f:
        f.writelines(content)

if __name__ == "__main__":
    try:
        # Fix Socket.IO configuration
        fix_socketio_config()
        print("✅ Fixed Socket.IO configuration")
        
        # Add Socket.IO logging
        add_socketio_logging()
        print("✅ Added Socket.IO logging")
        
        print(f"✅ Successfully updated {APP_PY_PATH}")
        print("Please restart the Flask server to apply changes")
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"Restoring backup from {BACKUP_PATH}")
        shutil.copy2(BACKUP_PATH, APP_PY_PATH)
        sys.exit(1)
