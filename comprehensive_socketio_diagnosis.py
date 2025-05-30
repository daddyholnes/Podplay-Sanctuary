#!/usr/bin/env python3
"""
Comprehensive Socket.IO Diagnosis for Podplay Sanctuary
Analyzes the Flask-SocketIO configuration and routing issues
"""

import sys
import os
import importlib.util
import inspect
from flask import Flask
from flask_socketio import SocketIO

def analyze_app_py():
    """Analyze the main app.py file for Socket.IO configuration issues"""
    
    print("=" * 80)
    print("COMPREHENSIVE SOCKET.IO DIAGNOSIS")
    print("=" * 80)
    
    app_path = os.path.join(os.path.dirname(__file__), 'backend', 'app.py')
    
    if not os.path.exists(app_path):
        print(f"❌ ERROR: app.py not found at {app_path}")
        return
    
    print(f"📁 Analyzing: {app_path}")
    
    # Load the module dynamically to avoid import conflicts
    spec = importlib.util.spec_from_file_location("app", app_path)
    app_module = importlib.util.module_from_spec(spec)
    
    try:
        print("🔄 Loading app.py module...")
        
        # Redirect stdout to capture import issues
        import io
        import contextlib
        
        f = io.StringIO()
        with contextlib.redirect_stdout(f):
            with contextlib.redirect_stderr(f):
                spec.loader.exec_module(app_module)
        
        output = f.getvalue()
        if output:
            print("📝 Import output:")
            print(output)
        
        print("✅ Module loaded successfully")
        
        # Check for Flask app
        if hasattr(app_module, 'app'):
            app = app_module.app
            print(f"✅ Flask app found: {type(app)}")
            
            # Check Flask app configuration
            print("\n📋 FLASK APP ANALYSIS:")
            print(f"   - Debug mode: {app.debug}")
            print(f"   - Secret key set: {'SECRET_KEY' in app.config}")
            print(f"   - Registered blueprints: {len(app.blueprints)}")
            
            # List all routes
            print("\n🛤️  REGISTERED ROUTES:")
            for rule in app.url_map.iter_rules():
                print(f"   - {rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")
            
        else:
            print("❌ No Flask app found in module")
            return
        
        # Check for Socket.IO
        if hasattr(app_module, 'socketio'):
            socketio = app_module.socketio
            print(f"\n✅ Socket.IO found: {type(socketio)}")
            
            # Analyze Socket.IO configuration
            print("\n🔌 SOCKET.IO CONFIGURATION:")
            print(f"   - Server: {socketio.server}")
            print(f"   - Async mode: {getattr(socketio, 'async_mode', 'unknown')}")
            print(f"   - CORS origins: {getattr(socketio.server, 'cors_allowed_origins', 'unknown')}")
            
            # Check if Socket.IO is properly attached to Flask app
            if hasattr(socketio.server, 'eio'):
                eio = socketio.server.eio
                print(f"   - Engine.IO instance: {eio}")
                print(f"   - Engine.IO path: {getattr(eio, 'path', 'unknown')}")
                
                # Check if routes are registered
                print("\n🔍 SOCKET.IO ROUTE REGISTRATION:")
                if hasattr(eio, 'create_route'):
                    print("   - Route creation method available: ✅")
                else:
                    print("   - Route creation method available: ❌")
                
                # Check Flask integration
                print("\n🔗 FLASK-SOCKETIO INTEGRATION:")
                print(f"   - Flask app in Socket.IO: {hasattr(socketio, 'app')}")
                if hasattr(socketio, 'app') and socketio.app:
                    print(f"   - Same Flask instance: {socketio.app is app}")
                
            else:
                print("   - ❌ No Engine.IO instance found")
            
            # Check for event handlers
            print("\n🎯 EVENT HANDLERS:")
            if hasattr(socketio.server, 'handlers'):
                handlers = socketio.server.handlers
                print(f"   - Number of namespaces: {len(handlers)}")
                for namespace, events in handlers.items():
                    print(f"   - Namespace '{namespace}': {list(events.keys())}")
            else:
                print("   - ❌ No event handlers found")
                
        else:
            print("❌ No Socket.IO instance found in module")
            return
        
        print("\n" + "=" * 80)
        print("DIAGNOSIS SUMMARY")
        print("=" * 80)
        
        # Check critical issues
        issues = []
        
        # Check if Socket.IO routes are in Flask routes
        socketio_routes = [rule for rule in app.url_map.iter_rules() if 'socket.io' in rule.rule]
        if not socketio_routes:
            issues.append("❌ CRITICAL: No Socket.IO routes found in Flask app")
        else:
            print(f"✅ Socket.IO routes found: {len(socketio_routes)}")
            for route in socketio_routes:
                print(f"   - {route.rule}")
        
        # Check Flask-SocketIO initialization order
        if hasattr(app_module, 'socketio') and hasattr(app_module, 'app'):
            print("✅ Both Flask app and Socket.IO instances exist")
        else:
            issues.append("❌ CRITICAL: Missing Flask app or Socket.IO instance")
        
        if issues:
            print("\n🚨 CRITICAL ISSUES FOUND:")
            for issue in issues:
                print(f"   {issue}")
        else:
            print("\n✅ No critical configuration issues found")
        
        # Generate fix recommendations
        print("\n💡 RECOMMENDATIONS:")
        if not socketio_routes:
            print("   1. Socket.IO routes not registered - this is the main issue")
            print("   2. Check if Flask-SocketIO initialization happens after Flask app creation")
            print("   3. Ensure Socket.IO instance is properly bound to Flask app")
            print("   4. Verify no import/module loading conflicts")
        
        print("\n🔧 SUGGESTED FIXES:")
        print("   1. Restart the Flask server completely")
        print("   2. Check for import errors during startup")
        print("   3. Verify Socket.IO version compatibility")
        print("   4. Test with a minimal Flask-SocketIO setup")
        
    except Exception as e:
        print(f"❌ ERROR analyzing module: {e}")
        import traceback
        traceback.print_exc()

def test_minimal_socketio():
    """Test if a minimal Socket.IO setup works"""
    print("\n" + "=" * 80)
    print("TESTING MINIMAL SOCKET.IO SETUP")
    print("=" * 80)
    
    try:
        from flask import Flask
        from flask_socketio import SocketIO
        
        # Create minimal app
        test_app = Flask(__name__)
        test_socketio = SocketIO(test_app, cors_allowed_origins="*")
        
        @test_app.route('/')
        def index():
            return "Test app"
        
        @test_socketio.on('connect')
        def test_connect():
            print("Test client connected")
        
        print("✅ Minimal Socket.IO setup successful")
        
        # Check routes
        socketio_routes = [rule for rule in test_app.url_map.iter_rules() if 'socket.io' in rule.rule]
        print(f"✅ Minimal app Socket.IO routes: {len(socketio_routes)}")
        for route in socketio_routes:
            print(f"   - {route.rule}")
        
        if socketio_routes:
            print("✅ Minimal Socket.IO correctly registers routes")
        else:
            print("❌ Even minimal Socket.IO doesn't register routes - version issue?")
        
    except Exception as e:
        print(f"❌ Minimal Socket.IO test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    analyze_app_py()
    test_minimal_socketio()
    
    print("\n" + "=" * 80)
    print("NEXT STEPS")
    print("=" * 80)
    print("1. If Socket.IO routes are missing, the Flask-SocketIO binding failed")
    print("2. Check for import conflicts or version incompatibilities")
    print("3. Try restarting the server with proper error catching")
    print("4. Consider using a minimal test server to isolate the issue")
