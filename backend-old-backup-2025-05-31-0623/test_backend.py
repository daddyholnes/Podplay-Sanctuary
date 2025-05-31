#!/usr/bin/env python3
"""
Simple backend test to verify functionality
"""

import os
import sys
import time
import threading
import requests
from pathlib import Path

# Add the app directory to Python path for imports
app_dir = Path(__file__).parent / 'app'
sys.path.insert(0, str(app_dir))

def start_server():
    """Start the backend server in a separate thread"""
    try:
        from app.factory import create_app
        app, socketio = create_app()
        
        print("✅ Server created successfully")
        
        # Start server
        socketio.run(
            app,
            host='127.0.0.1',
            port=5000,
            debug=False,
            allow_unsafe_werkzeug=True
        )
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()

def test_endpoints():
    """Test the backend endpoints"""
    print("⏳ Waiting for server to start...")
    time.sleep(5)
    
    endpoints = [
        'http://127.0.0.1:5000/api/health',
        'http://127.0.0.1:5000/api/chat/daily-briefing',
        'http://127.0.0.1:5000/api/mcp/categories'
    ]
    
    for endpoint in endpoints:
        try:
            print(f"🔍 Testing {endpoint}")
            response = requests.get(endpoint, timeout=10)
            print(f"  ✅ Status: {response.status_code}")
            if response.headers.get('content-type', '').startswith('application/json'):
                print(f"  📄 Response: {response.json()}")
            else:
                print(f"  📄 Response: {response.text[:100]}...")
        except Exception as e:
            print(f"  ❌ Error: {e}")

if __name__ == '__main__':
    print("🚀 Starting Podplay Sanctuary Test")
    
    # Start server in background thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    
    # Test endpoints
    test_endpoints()
    
    print("✅ Test completed")
