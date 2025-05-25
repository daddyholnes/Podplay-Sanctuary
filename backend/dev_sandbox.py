"""
Local Development Sandbox Backend
Container-based development environments with MCP integration
"""

import os
import json
import asyncio
import docker
import subprocess
import tempfile
import shutil
import socket
from pathlib import Path
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
import uuid
import psutil
import threading
import time

class DevSandboxManager:
    def __init__(self):
        try:
            self.docker_client = docker.from_env()
            self.docker_available = True
            print("✅ Docker client initialized successfully")
        except Exception as e:
            print(f"⚠️  Docker not available: {e}")
            print("📝 DevSandbox will run in simulation mode")
            self.docker_client = None
            self.docker_available = False
        
        self.environments = {}
        self.terminal_sessions = {}
        self.active_ports = set()
        
    async def create_environment(self, env_config, template=None):
        """Create a new containerized development environment"""
        if not self.docker_available:
            # Create a simulated environment for testing when Docker isn't available
            env_id = env_config['id']
            env_type = env_config['type']
            env_name = env_config['name']
            port = env_config['port']
            
            # Create workspace directory in fallback location
            workspace_dir = f"/tmp/sandbox_fallback/{env_id}"
            os.makedirs(workspace_dir, exist_ok=True)
            
            # Create basic files based on environment type
            await self._create_basic_structure(workspace_dir, env_type)
            
            # Store environment info (without container)
            self.environments[env_id] = {
                'config': env_config,
                'container': None,  # No container in fallback mode
                'workspace_dir': workspace_dir,
                'image_tag': None,
                'status': 'simulated',
                'is_fallback': True
            }
            
            print(f"📝 Created simulated environment: {env_id} ({env_type})")
            
            return {
                'success': True,
                'containerId': f"simulated-{env_id}",
                'workspaceDir': workspace_dir,
                'ports': {
                    'app': port,
                    'codeserver': port + 1000,
                    'ssh': port + 2000
                },
                'is_simulated': True,
                'message': 'Running in simulation mode due to Docker unavailability'
            }
        
        env_id = env_config['id']
        env_type = env_config['type']
        env_name = env_config['name']
        port = env_config['port']
        
        # Create workspace directory
        workspace_dir = f"/tmp/sandbox/{env_id}"
        os.makedirs(workspace_dir, exist_ok=True)
        
        # Initialize project from template
        if template:
            await self._initialize_from_template(workspace_dir, env_type, template)
        else:
            # Create basic structure
            await self._create_basic_structure(workspace_dir, env_type)
        
        # Build Docker image based on environment type
        dockerfile_content = self._generate_dockerfile(env_type)
        
        # Write Dockerfile
        with open(f"{workspace_dir}/Dockerfile", 'w') as f:
            f.write(dockerfile_content)
            
        # Build image
        image_tag = f"sandbox-{env_id}"
        try:
            image, logs = self.docker_client.images.build(
                path=workspace_dir,
                tag=image_tag,
                rm=True
            )
        except Exception as e:
            raise Exception(f"Failed to build Docker image: {str(e)}")
        
        # Run container
        try:
            container = self.docker_client.containers.run(
                image_tag,
                detach=True,
                ports={
                    '3000/tcp': port,  # App port
                    '8080/tcp': port + 1000,  # Code server port
                    '22/tcp': port + 2000  # SSH port (if needed)
                },
                volumes={
                    workspace_dir: {'bind': '/workspace', 'mode': 'rw'}
                },
                environment={
                    'WORKSPACE_DIR': '/workspace',
                    'PORT': '3000',
                    'NODE_ENV': 'development'
                },
                name=f"sandbox-{env_id}",
                working_dir='/workspace'
            )
            
            # Wait for container to be ready
            await asyncio.sleep(2)
            
            # Store environment info
            self.environments[env_id] = {
                'config': env_config,
                'container': container,
                'workspace_dir': workspace_dir,
                'image_tag': image_tag,
                'status': 'running'
            }
            
            return {
                'success': True,
                'containerId': container.id,
                'workspaceDir': workspace_dir,
                'ports': {
                    'app': port,
                    'codeserver': port + 1000,
                    'ssh': port + 2000
                }
            }
            
        except Exception as e:
            raise Exception(f"Failed to start container: {str(e)}")
    
    def _generate_dockerfile(self, env_type):
        """Generate Dockerfile based on environment type"""
        
        base_images = {
            'react': 'node:18-alpine',
            'node': 'node:18-alpine', 
            'python': 'python:3.11-alpine',
            'web': 'nginx:alpine',
            'custom': 'ubuntu:22.04'
        }
        
        base_image = base_images.get(env_type, 'ubuntu:22.04')
        
        dockerfile = f"""
FROM {base_image}

# Install basic tools
RUN apk update && apk add --no-cache \\
    git \\
    curl \\
    wget \\
    vim \\
    nano \\
    bash \\
    openssh \\
    sudo

# Install code-server for web-based VS Code
RUN curl -fsSL https://code-server.dev/install.sh | sh

# Create workspace directory
WORKDIR /workspace

# Environment-specific setup
"""

        if env_type == 'react':
            dockerfile += """
# Install global packages for React development
RUN npm install -g create-react-app vite @vitejs/create-app

# Expose ports
EXPOSE 3000 8080
"""

        elif env_type == 'node':
            dockerfile += """
# Install global packages for Node.js development
RUN npm install -g nodemon express-generator nest

# Expose ports  
EXPOSE 3000 8080
"""

        elif env_type == 'python':
            dockerfile += """
# Install Python development tools
RUN pip install --no-cache-dir \\
    flask \\
    django \\
    fastapi \\
    uvicorn \\
    jupyter \\
    black \\
    flake8

# Expose ports
EXPOSE 8000 8080
"""

        elif env_type == 'web':
            dockerfile += """
# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 8080
"""

        dockerfile += """
# Start code-server and application
CMD code-server --bind-addr 0.0.0.0:8080 --auth none /workspace & \\
    if [ -f package.json ]; then npm start; \\
    elif [ -f requirements.txt ]; then python -m pip install -r requirements.txt && python app.py; \\
    elif [ -f index.html ]; then python -m http.server 3000; \\
    else bash; fi
"""
        
        return dockerfile
    
    async def _initialize_from_template(self, workspace_dir, env_type, template):
        """Initialize project from template"""
        
        templates = {
            'react': {
                'create-react-app': 'npx create-react-app .',
                'vite-react': 'npm create vite@latest . -- --template react-ts',
                'next.js': 'npx create-next-app@latest .'
            },
            'node': {
                'express': self._create_express_template,
                'fastify': self._create_fastify_template,
                'nest.js': 'npx @nestjs/cli new .'
            },
            'python': {
                'flask': self._create_flask_template,
                'django': 'django-admin startproject . .',
                'fastapi': self._create_fastapi_template
            },
            'web': {
                'vanilla-html': self._create_html_template,
                'bootstrap': self._create_bootstrap_template,
                'tailwind': self._create_tailwind_template
            }
        }
        
        template_cmd = templates.get(env_type, {}).get(template)
        
        if callable(template_cmd):
            # Custom template function
            template_cmd(workspace_dir)
        elif template_cmd:
            # Shell command
            subprocess.run(template_cmd, shell=True, cwd=workspace_dir)
        else:
            # Fallback to basic structure
            await self._create_basic_structure(workspace_dir, env_type)
    
    def _create_express_template(self, workspace_dir):
        """Create Express.js template"""
        
        package_json = {
            "name": "express-sandbox",
            "version": "1.0.0",
            "scripts": {
                "start": "node server.js",
                "dev": "nodemon server.js"
            },
            "dependencies": {
                "express": "^4.18.2",
                "cors": "^2.8.5"
            },
            "devDependencies": {
                "nodemon": "^3.0.1"
            }
        }
        
        server_js = """
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express Sandbox!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
"""
        
        with open(f"{workspace_dir}/package.json", 'w') as f:
            json.dump(package_json, f, indent=2)
            
        with open(f"{workspace_dir}/server.js", 'w') as f:
            f.write(server_js)
    
    def _create_flask_template(self, workspace_dir):
        """Create Flask template"""
        
        app_py = """
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello():
    return jsonify({'message': 'Hello from Flask Sandbox!'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
"""
        
        requirements_txt = """
flask==2.3.3
flask-cors==4.0.0
"""
        
        with open(f"{workspace_dir}/app.py", 'w') as f:
            f.write(app_py)
            
        with open(f"{workspace_dir}/requirements.txt", 'w') as f:
            f.write(requirements_txt)
    
    def _create_html_template(self, workspace_dir):
        """Create basic HTML template"""
        
        html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sandbox Project</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏗️ Welcome to your Sandbox!</h1>
        <p>This is your development environment. Start building something amazing!</p>
        <button onclick="alert('Hello from JavaScript!')">Click me!</button>
    </div>
</body>
</html>
"""
        
        with open(f"{workspace_dir}/index.html", 'w') as f:
            f.write(html_content)
    
    async def _create_basic_structure(self, workspace_dir, env_type):
        """Create basic project structure"""
        
        # Create common directories
        os.makedirs(f"{workspace_dir}/src", exist_ok=True)
        os.makedirs(f"{workspace_dir}/docs", exist_ok=True)
        
        # Create README
        readme_content = f"""
# Sandbox Project

This is a {env_type} development environment.

## Getting Started

1. Open the terminal
2. Install dependencies
3. Start developing!

## Features

- 🚀 Hot reload
- 🛠️ Built-in tools
- 📁 File explorer
- 💻 Integrated terminal
- 🌐 Live preview
"""
        
        with open(f"{workspace_dir}/README.md", 'w') as f:
            f.write(readme_content)
    
    def get_file_tree(self, env_id):
        """Get file tree for environment"""
        if env_id not in self.environments:
            return None
            
        workspace_dir = self.environments[env_id]['workspace_dir']
        return self._build_file_tree(workspace_dir)
    
    def _build_file_tree(self, directory):
        """Recursively build file tree"""
        items = []
        
        try:
            for item in os.listdir(directory):
                if item.startswith('.'):
                    continue
                    
                item_path = os.path.join(directory, item)
                relative_path = os.path.relpath(item_path, directory)
                
                if os.path.isdir(item_path):
                    items.append({
                        'name': item,
                        'path': relative_path,
                        'type': 'directory',
                        'children': self._build_file_tree(item_path)
                    })
                else:
                    stat = os.stat(item_path)
                    items.append({
                        'name': item,
                        'path': relative_path,
                        'type': 'file',
                        'size': stat.st_size,
                        'lastModified': stat.st_mtime
                    })
        except PermissionError:
            pass
            
        return sorted(items, key=lambda x: (x['type'] == 'file', x['name']))
    
    def read_file(self, env_id, file_path):
        """Read file content"""
        if env_id not in self.environments:
            return None
            
        workspace_dir = self.environments[env_id]['workspace_dir']
        full_path = os.path.join(workspace_dir, file_path)
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return None
    
    def write_file(self, env_id, file_path, content):
        """Write file content"""
        if env_id not in self.environments:
            return False
            
        workspace_dir = self.environments[env_id]['workspace_dir']
        full_path = os.path.join(workspace_dir, file_path)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        try:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        except Exception as e:
            return False
    
    def create_directory(self, env_id, dir_path):
        """Create a new directory"""
        if env_id not in self.environments:
            return False
            
        workspace_dir = self.environments[env_id]['workspace_dir']
        full_path = os.path.join(workspace_dir, dir_path)
        
        try:
            os.makedirs(full_path, exist_ok=True)
            return True
        except Exception as e:
            return False
    
    def create_terminal_session(self, env_id):
        """Create new terminal session for environment"""
        if env_id not in self.environments:
            return None
        
        session_id = str(uuid.uuid4())
        
        # Check if this is a fallback/simulated environment
        if self.environments[env_id].get('is_fallback', False) or not self.docker_available:
            workspace_dir = self.environments[env_id]['workspace_dir']
            
            # Create a simulated terminal session
            self.terminal_sessions[session_id] = {
                'env_id': env_id,
                'exec_id': None,
                'container': None,
                'workspace_dir': workspace_dir,
                'is_simulated': True
            }
            
            return session_id
            
        # Normal Docker-based terminal session
        container = self.environments[env_id]['container']
        
        # Execute bash in container
        exec_result = container.exec_run(
            'bash',
            stdin=True,
            tty=True,
            detach=True
        )
        
        self.terminal_sessions[session_id] = {
            'env_id': env_id,
            'exec_id': exec_result,
            'container': container
        }
        
        return session_id
    
    def execute_command(self, session_id, command):
        """Execute command in terminal session"""
        if session_id not in self.terminal_sessions:
            return None
            
        session = self.terminal_sessions[session_id]
        
        # Handle simulated terminal sessions
        if session.get('is_simulated', False):
            workspace_dir = session['workspace_dir']
            
            try:
                # Use subprocess to execute command locally for simulated environments
                process = subprocess.Popen(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    cwd=workspace_dir
                )
                stdout, stderr = process.communicate()
                
                return {
                    'stdout': stdout,
                    'stderr': stderr,
                    'exit_code': process.returncode,
                    'simulated': True
                }
            except Exception as e:
                return {
                    'stderr': str(e),
                    'exit_code': 1,
                    'simulated': True
                }
        
        # Normal Docker-based terminal command execution
        container = session['container']
        
        try:
            result = container.exec_run(command, workdir='/workspace')
            return {
                'stdout': result.output.decode('utf-8'),
                'exit_code': result.exit_code
            }
        except Exception as e:
            return {
                'stderr': str(e),
                'exit_code': 1
            }
    
    def get_available_port(self):
        """Get available port for new environment"""
        for port in range(8000, 9000):
            if port not in self.active_ports:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                if result != 0:  # Port is available
                    self.active_ports.add(port)
                    return port
        return None
    
    def stop_environment(self, env_id):
        """Stop environment container"""
        if env_id not in self.environments:
            return False
        
        # Handle simulated environments
        if self.environments[env_id].get('is_fallback', False):
            self.environments[env_id]['status'] = 'stopped'
            return True
            
        # Normal Docker environment
        try:
            container = self.environments[env_id]['container']
            if container:
                container.stop()
            self.environments[env_id]['status'] = 'stopped'
            return True
        except Exception as e:
            print(f"Error stopping environment: {e}")
            return False
    
    def delete_environment(self, env_id):
        """Delete environment and cleanup"""
        if env_id not in self.environments:
            return False
            
        try:
            env = self.environments[env_id]
            
            # Handle simulated environments
            if env.get('is_fallback', False) or not self.docker_available:
                # Just clean up workspace and tracking
                shutil.rmtree(env['workspace_dir'], ignore_errors=True)
                port = env['config']['port']
                self.active_ports.discard(port)
                del self.environments[env_id]
                return True
            
            # Normal Docker cleanup
            if env['container']:
                container = env['container']
                container.stop()
                container.remove()
                
            # Remove image if exists
            if env['image_tag'] and self.docker_client:
                try:
                    self.docker_client.images.remove(env['image_tag'])
                except Exception:
                    pass
            
            # Cleanup workspace
            shutil.rmtree(env['workspace_dir'], ignore_errors=True)
            
            # Remove from tracking
            del self.environments[env_id]
            
            # Free up port
            port = env['config']['port']
            self.active_ports.discard(port)
            
            return True
        except Exception as e:
            print(f"Error deleting environment: {e}")
            return False

# Global sandbox manager instance
sandbox_manager = DevSandboxManager()
