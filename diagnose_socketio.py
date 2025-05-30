#!/usr/bin/env python3
"""
Diagnose Socket.IO issues in the main app
"""

import sys
import os
sys.path.append('backend')

try:
    from app import app, socketio
    
    print("=== Flask App Analysis ===")
    print(f"Flask app: {app}")
    print(f"Flask debug mode: {app.debug}")
    
    print("\n=== Flask Routes ===")
    for rule in app.url_map.iter_rules():
        print(f"{rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")
    
    print("\n=== SocketIO Analysis ===")
    print(f"SocketIO instance: {socketio}")
    print(f"SocketIO server: {socketio.server}")
    print(f"SocketIO async_mode: {socketio.async_mode}")
    print(f"SocketIO path: {getattr(socketio.server, 'path', 'Not set')}")
    
    # Check if SocketIO handlers are registered
    print("\n=== SocketIO Handlers ===")
    if hasattr(socketio.server, 'handlers'):
        for namespace, handlers in socketio.server.handlers.items():
            print(f"Namespace: {namespace}")
            for event, handler in handlers.items():
                print(f"  {event} -> {handler}")
    
    print("\n=== SocketIO Server Manager ===")
    if hasattr(socketio.server, 'manager'):
        print(f"Manager: {socketio.server.manager}")
        print(f"Manager namespaces: {getattr(socketio.server.manager, 'namespaces', 'N/A')}")
    
    # Test creating a test client
    print("\n=== SocketIO Test Client ===")
    try:
        client = socketio.test_client(app)
        print("✅ Test client created successfully")
        client.disconnect()
    except Exception as e:
        print(f"❌ Test client failed: {e}")
    
    print("\n=== EngineIO Path Check ===")
    # Check if the engineio endpoints are properly set up
    import engineio
    print(f"EngineIO version: {engineio.__version__}")
    
except Exception as e:
    print(f"Error importing app: {e}")
    import traceback
    traceback.print_exc()
