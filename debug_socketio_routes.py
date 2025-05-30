#!/usr/bin/env python3
"""
Debug Socket.IO route registration
"""

import sys
import os
sys.path.append('backend')

def debug_socketio():
    print("=== Importing Flask and SocketIO ===")
    from flask import Flask
    from flask_socketio import SocketIO
    
    # Create a simple test app
    test_app = Flask(__name__)
    test_socketio = SocketIO(test_app, cors_allowed_origins="*")
    
    print("Test app routes:")
    for rule in test_app.url_map.iter_rules():
        print(f"  {rule.rule} -> {rule.endpoint}")
    
    print("\n=== Loading main app ===")
    try:
        from app import app, socketio
        print("Main app routes:")
        for rule in app.url_map.iter_rules():
            print(f"  {rule.rule} -> {rule.endpoint}")
        
        print(f"\nSocketIO server type: {type(socketio.server)}")
        print(f"SocketIO path: {getattr(socketio.server, 'path', 'Not found')}")
        print(f"SocketIO async_mode: {socketio.async_mode}")
        
        # Check if SocketIO routes are in Flask app
        socketio_routes = [rule for rule in app.url_map.iter_rules() 
                          if 'socket.io' in rule.rule]
        print(f"\nSocket.IO routes found: {len(socketio_routes)}")
        for route in socketio_routes:
            print(f"  {route.rule} -> {route.endpoint}")
        
        # Force route registration
        print("\n=== Forcing Socket.IO route registration ===")
        socketio.init_app(app, cors_allowed_origins="*")
        
        print("Routes after re-initialization:")
        socketio_routes = [rule for rule in app.url_map.iter_rules() 
                          if 'socket.io' in rule.rule]
        print(f"Socket.IO routes found: {len(socketio_routes)}")
        for route in socketio_routes:
            print(f"  {route.rule} -> {route.endpoint}")
            
    except Exception as e:
        print(f"Error loading main app: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_socketio()
