#!/usr/bin/env python3
"""
Socket.IO Test - Restart Server
"""

import os
import signal
import subprocess
import sys
import time

def kill_processes_on_port(port=5000):
    """Kill processes running on the specified port"""
    try:
        if os.name == 'nt':  # Windows
            # Find PID using netstat
            netstat = subprocess.Popen(
                ['netstat', '-ano', '|', 'findstr', f':{port}'],
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                shell=True
            )
            stdout, _ = netstat.communicate()
            
            # Extract PIDs
            for line in stdout.decode().split('\n'):
                if f':{port}' in line and 'LISTENING' in line:
                    parts = line.strip().split()
                    if len(parts) >= 5:
                        pid = parts[4]
                        print(f"Killing process {pid} on port {port}")
                        try:
                            os.kill(int(pid), signal.SIGTERM)
                            print(f"Killed process {pid}")
                        except (ProcessLookupError, PermissionError) as e:
                            print(f"Failed to kill process {pid}: {e}")
        else:  # Linux/Mac
            # Find PID using lsof
            lsof = subprocess.Popen(
                ['lsof', '-t', '-i', f':{port}'],
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE
            )
            stdout, _ = lsof.communicate()
            
            # Extract PIDs
            for pid in stdout.decode().split('\n'):
                if pid:
                    print(f"Killing process {pid} on port {port}")
                    try:
                        os.kill(int(pid), signal.SIGTERM)
                        print(f"Killed process {pid}")
                    except (ProcessLookupError, PermissionError) as e:
                        print(f"Failed to kill process {pid}: {e}")
    except Exception as e:
        print(f"Error killing processes: {e}")

def start_server():
    """Start the Flask Socket.IO server"""
    print("Starting Flask Socket.IO server...")
    
    # Change to the backend directory
    os.chdir('backend')
    
    if os.name == 'nt':  # Windows
        # Start the server and detach
        subprocess.Popen(
            ['start', 'cmd', '/k', 'python', 'app.py'],
            shell=True
        )
    else:  # Linux/Mac
        # Start the server and detach
        subprocess.Popen(
            ['python3', 'app.py'],
            start_new_session=True
        )
    
    # Wait for server to start
    time.sleep(3)
    print("Server started!")

if __name__ == "__main__":
    print("Socket.IO Test - Restart Server")
    
    # 1. Kill any existing processes
    kill_processes_on_port(5000)
    
    # 2. Wait a moment
    time.sleep(2)
    
    # 3. Start the server
    start_server()
    
    print("Server restart complete!")
    print("Test Socket.IO connection with socket-io-test.html or origin-socket-test.html")
