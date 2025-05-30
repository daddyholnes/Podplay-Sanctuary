#!/usr/bin/env python3
"""
Quick Start Script for Testing ADK Integration
Starts the legacy app-beta.py with minimal dependencies for testing
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

print("🚀 Starting Podplay Backend for ADK Integration Testing...")
print(f"📁 Backend directory: {backend_dir}")
print("🔧 This will start the legacy app-beta.py with ADK workflow endpoints")
print("\n⚠️  Note: Some services may not be available in test mode")
print("✅ ADK workflow endpoints should still work for basic testing")

try:
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Import and run the app
    print("\n📦 Importing app-beta.py...")
    import app_beta as app
    
    print("✅ App imported successfully!")
    print("🌐 Server should be starting on http://localhost:5000")
    print("🔗 Test endpoints:")
    print("   - GET  /api/adk/workflows")
    print("   - GET  /api/adk/models/status") 
    print("   - GET  /api/adk/system/health")
    print("   - POST /api/adk/workflows/execute")
    print("\n🔧 Press Ctrl+C to stop the server")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 This might be due to missing dependencies")
    print("   Try running: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error starting server: {e}")
    sys.exit(1)
