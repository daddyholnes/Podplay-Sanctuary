#!/usr/bin/env python3
"""
Backend Cleanup Script
Removes unused files before integrating new modular architecture
"""

import os
import shutil
from pathlib import Path

def cleanup_backend():
    """Remove unused files from backend folder"""
    backend_path = Path("backend")
    
    # Files to KEEP (essential)
    keep_files = {
        "app.py",           # Current main application
        "requirements.txt", # Dependencies
        "Dockerfile",       # Docker configuration
        "gunicorn.conf.py", # Production server config
        ".dockerignore",    # Docker ignore
        ".gcloudignore",    # Google Cloud ignore
        "cloudbuild.yaml",  # Cloud build config
        "package.json",     # Node dependencies if any
    }
    
    # Directories to KEEP (essential)
    keep_dirs = {
        "app",              # Current modular structure
        "uploads",          # File uploads
        "scout_logs",       # Logs directory
        "nixos_vms",        # NixOS VMs if used
        "__pycache__",      # Python cache (will regenerate)
        "venv",             # Virtual environment
    }
    
    # Files to REMOVE (obsolete/test files)
    remove_files = [
        "adk_mama_bear.py",
        "app-old-monolithic-backup.py", 
        "app-original-backup.py",
        "app.py.bak",
        "backend_master_test.py",
        "cloud_dev_sandbox.py",
        "cloud_vps_manager.py", 
        "cors_patch.py",
        "dev_sandbox.py",
        "dev_sandbox.py.removed",
        "digitalocean_vm_manager.py",
        "Dockerfile.dev",
        "Dockerfile.prod", 
        "enhanced_mama_bear.py",
        "enhanced_mama_bear_v2.py",
        "environment_selector.py",
        "flask_socketio_minimal.py",
        "integration_test.py",
        "main.py",
        "mama_bear.log",
        "mama_bear_extensions.py",
        "mcp_docker_orchestrator.py",
        "mem0_chat_manager.py",
        "minimal_socket.py",
        "minimal_socketio.py", 
        "nixos_provider_detector.py",
        "nixos_sandbox_orchestrator.py",
        "oci_vm_manager.py",
        "sanctuary.db",
        "scout_agent_core.py",
        "scout_logger.py",
        "socketio_minimal.py",
        "socket_basic_test.py",
        "socket_test.py",
        "ssh_bridge.py",
        "ssh_executor.py",
        "test_api.py",
        "test_backend.py",
        "test_chat_endpoint.py",
        "test_comprehensive_api.py",
        "test_paths.py",
        "test_server.py",
        "test_socketio_integration.html",
        "vertex_integration.py",
        "vm_manager.py",
    ]
    
    # Directories to REMOVE (obsolete)
    remove_dirs = [
        "backend",  # Nested backend directory (confusing)
    ]
    
    print("🧹 Cleaning up backend folder...")
    print("=" * 50)
    
    # Remove obsolete files
    removed_count = 0
    for filename in remove_files:
        file_path = backend_path / filename
        if file_path.exists():
            try:
                file_path.unlink()
                print(f"✅ Removed file: {filename}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {filename}: {e}")
    
    # Remove obsolete directories
    for dirname in remove_dirs:
        dir_path = backend_path / dirname
        if dir_path.exists():
            try:
                shutil.rmtree(dir_path)
                print(f"✅ Removed directory: {dirname}")
                removed_count += 1
            except Exception as e:
                print(f"❌ Failed to remove {dirname}: {e}")
    
    print("=" * 50)
    print(f"🎯 Cleanup complete! Removed {removed_count} obsolete files/directories")
    
    # Show what's left
    print("\n📁 Remaining backend structure:")
    for item in sorted(backend_path.iterdir()):
        if item.is_file():
            print(f"   📄 {item.name}")
        elif item.is_dir():
            print(f"   📁 {item.name}/")
    
    print("\n✅ Backend folder is now clean and ready for modular architecture integration!")

if __name__ == "__main__":
    cleanup_backend()
