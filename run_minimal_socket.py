#!/usr/bin/env python3
"""
Quick script to restart and run the minimal Socket.IO test server
"""

import os
import sys
import subprocess
import signal
import time
import psutil

# Path to the minimal Socket.IO server script
SOCKET_SERVER_PATH = os.path.join(os.path.dirname(__file__), "backend", "minimal_socket.py")

def find_process_by_name(name):
    """Find a process by name"""
    result = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if name in proc.info['name'] or any(name in cmd for cmd in (proc.info['cmdline'] or [])):
                result.append(proc)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return result

def kill_existing_servers():
    """Kill any existing Python processes running our server files"""
    try:
        # Find processes that match our server scripts
        processes = find_process_by_name("minimal_socket.py")
        
        if processes:
            print(f"Found {len(processes)} existing server processes. Stopping them...")
            
            for process in processes:
                try:
                    pid = process.pid
                    print(f"Stopping process {pid}...")
                    process.terminate()
                    
                    # Give it a moment to terminate gracefully
                    try:
                        process.wait(timeout=5)
                    except psutil.TimeoutExpired:
                        print(f"Process {pid} did not terminate gracefully, forcing...")
                        process.kill()
                        
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    print(f"Could not terminate process {pid}")
            
            time.sleep(1)  # Wait a bit for ports to be released
            print("Existing servers stopped.")
        else:
            print("No existing server processes found.")
            
    except Exception as e:
        print(f"Error stopping existing servers: {e}")

def start_minimal_server():
    """Start the minimal Socket.IO test server"""
    try:
        print("\nStarting minimal Socket.IO test server...")
        print(f"Server script: {SOCKET_SERVER_PATH}")
        
        # Use Python executable from the current environment
        python_exec = sys.executable
        
        # Start the server in a new process
        subprocess.Popen([python_exec, SOCKET_SERVER_PATH], 
                         stdout=sys.stdout, 
                         stderr=sys.stderr)
        
        print("\nMinimal Socket.IO Test server started successfully!")
        print("Test server should be available at: http://localhost:5005")
        print("You can access the test client at: file://" + os.path.abspath("minimal_socket_test.html"))
        
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    print("===== Minimal Socket.IO Test Server Restart =====")
    
    # Kill any existing server processes
    kill_existing_servers()
    
    # Start the server
    start_minimal_server()
    
    print("\nPress Ctrl+C to stop the script")
    try:
        # Keep the main script running
        signal.pause()
    except (KeyboardInterrupt, SystemExit):
        print("\nExiting...")
    except:
        pass
