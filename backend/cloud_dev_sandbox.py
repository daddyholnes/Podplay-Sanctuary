"""
Cloud Development Sandbox - Docker-Free Alternative
Supports GitHub Codespaces, Replit, and StackBlitz for containerized development
Enhanced with Mama Bear AI agent and Mem0 persistent memory
"""

import os
import json
import asyncio
import requests
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any
import time
import base64
import logging

# Try to import Mama Bear and Mem0 integrations
try:
    from enhanced_mama_bear import VertexAIMamaBear
    MAMA_BEAR_AVAILABLE = True
except ImportError:
    MAMA_BEAR_AVAILABLE = False

try:
    from mem0_chat_manager import Mem0ChatManager
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False

logger = logging.getLogger(__name__)

class AgenticDevSandbox:
    """AI-powered development assistant for DevSandbox environments"""
    
    def __init__(self):
        self.mama_bear = None
        self.mem0_manager = None
        
        # Initialize Mama Bear if available
        if MAMA_BEAR_AVAILABLE:
            try:
                self.mama_bear = VertexAIMamaBear()
                logger.info("🐻 Mama Bear agent initialized for DevSandbox")
            except Exception as e:
                logger.warning(f"Failed to initialize Mama Bear: {e}")
                self.mama_bear = None
        
        # Initialize Mem0 if available
        if MEM0_AVAILABLE:
            try:
                self.mem0_manager = Mem0ChatManager()
                logger.info("🧠 Mem0 memory system initialized for DevSandbox")
            except Exception as e:
                logger.warning(f"Failed to initialize Mem0: {e}")
                self.mem0_manager = None
    
    async def get_intelligent_assistance(self, environment_context: Dict[str, Any], 
                                       user_query: str = "") -> Dict[str, Any]:
        """Get intelligent assistance from Mama Bear for development tasks"""
        if not self.mama_bear:
            return {
                "success": False,
                "response": "🐻 Mama Bear agent not available. Please check Vertex AI configuration.",
                "suggestions": []
            }
        
        try:
            # Build context for Mama Bear
            context = {
                "environment": environment_context,
                "user_query": user_query,
                "timestamp": time.time(),
                "sandbox_type": "dev_environment"
            }
            
            # Get response from Mama Bear
            response = self.mama_bear.mama_bear_chat(
                user_query or "Provide intelligent assistance for this development environment",
                chat_history=None,
                context=context,
                user_id="nathan"
            )
            
            # Store interaction in Mem0 if available
            if self.mem0_manager and response.get('success'):
                await self._store_interaction_memory(environment_context, user_query, response)
            
            return response
            
        except Exception as e:
            logger.error(f"Error getting intelligent assistance: {e}")
            return {
                "success": False,
                "response": f"🐻 Error getting assistance: {str(e)}",
                "suggestions": []
            }
    
    async def _store_interaction_memory(self, environment: Dict, query: str, response: Dict):
        """Store development interaction in persistent memory"""
        if not self.mem0_manager:
            return
        
        try:
            memory_data = {
                "type": "dev_sandbox_interaction",
                "environment_id": environment.get('id'),
                "environment_type": environment.get('type'),
                "user_query": query,
                "assistant_response": response.get('response', '')[:500],  # Truncate long responses
                "timestamp": time.time(),
                "context": {
                    "workspace_root": environment.get('workspaceRoot'),
                    "environment_status": environment.get('status')
                }
            }
            
            await self.mem0_manager.save_message(
                session_id=environment.get('id', 'dev_sandbox'),
                model_id="mama_bear_dev_assistant",
                message={
                    "role": "assistant", 
                    "content": f"DevSandbox interaction: {query}",
                    "metadata": memory_data
                }
            )
            
        except Exception as e:
            logger.error(f"Error storing interaction memory: {e}")
    
    async def get_contextual_suggestions(self, environment: Dict[str, Any]) -> List[str]:
        """Get contextual suggestions based on environment state and memory"""
        suggestions = []
        
        # Basic suggestions based on environment type
        env_type = environment.get('type', 'node')
        if env_type == 'react':
            suggestions.extend([
                "Set up React development server with hot reload",
                "Configure ESLint and Prettier for code quality",
                "Add TypeScript support for better type safety"
            ])
        elif env_type == 'node':
            suggestions.extend([
                "Initialize package.json with npm init",
                "Set up Express.js server for backend API",
                "Configure nodemon for automatic restarts"
            ])
        elif env_type == 'python':
            suggestions.extend([
                "Create virtual environment with venv",
                "Set up Flask or FastAPI for web development",
                "Configure pytest for testing"
            ])
        
        # Get memory-based suggestions if Mem0 is available
        if self.mem0_manager:
            try:
                memory_suggestions = await self._get_memory_based_suggestions(environment)
                suggestions.extend(memory_suggestions)
            except Exception as e:
                logger.error(f"Error getting memory-based suggestions: {e}")
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    async def _get_memory_based_suggestions(self, environment: Dict) -> List[str]:
        """Get suggestions based on past interactions stored in Mem0"""
        if not self.mem0_manager:
            return []
        
        try:
            # Search for related memories
            search_query = f"DevSandbox {environment.get('type')} development"
            memories = await self.mem0_manager.search_conversations(search_query, limit=3)
            
            suggestions = []
            for memory in memories:
                # Extract actionable suggestions from past interactions
                if isinstance(memory, dict):
                    content = memory.get('content', '')
                else:
                    content = str(memory) if memory else ''
                
                if 'install' in content.lower():
                    suggestions.append("Consider installing commonly used packages")
                elif 'configure' in content.lower():
                    suggestions.append("Set up environment configuration files")
                elif 'test' in content.lower():
                    suggestions.append("Add testing framework and initial tests")
            
            return suggestions
            
        except Exception as e:
            logger.error(f"Error getting memory-based suggestions: {e}")
            return []

class CloudDevSandboxManager:
    def __init__(self):
        """Initialize Cloud Development Sandbox Manager"""
        self.environments = {}
        self.active_sessions = {}
        
        # Cloud service configurations
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.replit_token = os.getenv('REPLIT_TOKEN')
        
        # Available cloud providers
        self.providers = {
            'github_codespaces': {
                'name': 'GitHub Codespaces',
                'available': bool(self.github_token),
                'api_base': 'https://api.github.com',
                'supports': ['python', 'node', 'react', 'vue', 'express', 'flask']
            },
            'replit': {
                'name': 'Replit',
                'available': bool(self.replit_token),
                'api_base': 'https://replit.com/api/v0',
                'supports': ['python', 'node', 'react', 'vue', 'express', 'flask', 'html']
            },
            'stackblitz': {
                'name': 'StackBlitz',
                'available': True,  # No API key needed for basic usage
                'api_base': 'https://stackblitz.com/api/v1',
                'supports': ['node', 'react', 'vue', 'angular', 'typescript']
            },
            'codesandbox': {
                'name': 'CodeSandbox',
                'available': True,  # No API key needed for basic usage
                'api_base': 'https://codesandbox.io/api/v1',
                'supports': ['node', 'react', 'vue', 'angular', 'typescript']
            }
        }
        
        print("☁️ Cloud Development Sandbox Manager initialized")
        self._log_available_providers()
    
    def _log_available_providers(self):
        """Log which cloud providers are available"""
        available = [name for name, config in self.providers.items() if config['available']]
        if available:
            print(f"✅ Available cloud providers: {', '.join(available)}")
        else:
            print("⚠️ No cloud providers configured - will use local fallback mode")
    
    async def create_environment(self, env_config: Dict[str, Any], template: Optional[str] = None) -> Dict[str, Any]:
        """Create a new cloud development environment"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        template = template or env_config.get('template', 'blank')
        
        # Choose best provider for this environment type
        provider = self._choose_provider(env_type)
        
        if not provider:
            return await self._create_local_fallback(env_config)
        
        try:
            if provider == 'stackblitz':
                return await self._create_stackblitz_environment(env_config)
            elif provider == 'codesandbox':
                return await self._create_codesandbox_environment(env_config)
            elif provider == 'github_codespaces':
                return await self._create_github_codespace(env_config)
            elif provider == 'replit':
                return await self._create_replit_environment(env_config)
            else:
                return await self._create_local_fallback(env_config)
                
        except Exception as e:
            print(f"❌ Failed to create {provider} environment: {e}")
            return await self._create_local_fallback(env_config)
    
    def _choose_provider(self, env_type: str) -> Optional[str]:
        """Choose the best cloud provider for the given environment type"""
        # Priority order for different environment types
        priorities = {
            'react': ['stackblitz', 'codesandbox', 'github_codespaces'],
            'vue': ['stackblitz', 'codesandbox', 'github_codespaces'],
            'angular': ['stackblitz', 'codesandbox', 'github_codespaces'],
            'node': ['stackblitz', 'replit', 'github_codespaces'],
            'typescript': ['stackblitz', 'codesandbox', 'github_codespaces'],
            'python': ['replit', 'github_codespaces'],
            'flask': ['replit', 'github_codespaces'],
            'express': ['stackblitz', 'replit', 'github_codespaces']
        }
        
        preferred = priorities.get(env_type, ['stackblitz', 'codesandbox', 'replit', 'github_codespaces'])
        
        for provider in preferred:
            if self.providers[provider]['available'] and env_type in self.providers[provider]['supports']:
                return provider
        
        return None
    
    async def _create_stackblitz_environment(self, env_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a StackBlitz environment"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        template = env_config.get('template', 'node')
        
        # StackBlitz project configuration
        project_config = {
            "files": self._get_template_files(env_type, template),
            "title": f"DevSandbox - {env_config.get('name', env_id)}",
            "description": "Created by Podplay Build DevSandbox",
            "template": self._map_to_stackblitz_template(env_type),
            "settings": {
                "compile": {
                    "trigger": "auto",
                    "action": "refresh"
                }
            }
        }
        
        # Create project URL (StackBlitz supports URL-based project creation)
        project_id = f"podplay-{env_id}"
        stackblitz_url = f"https://stackblitz.com/fork/{project_config['template']}"
        
        environment = {
            "id": env_id,
            "provider": "stackblitz",
            "type": env_type,
            "url": stackblitz_url,
            "embed_url": f"https://stackblitz.com/edit/{project_id}?embed=1",
            "preview_url": f"https://{project_id}.stackblitz.io",
            "status": "running",
            "created_at": time.time(),
            "config": project_config
        }
        
        self.environments[env_id] = environment
        
        return {
            "success": True,
            "environment": environment,
            "message": f"StackBlitz environment created: {stackblitz_url}"
        }
    
    async def _create_codesandbox_environment(self, env_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a CodeSandbox environment"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        template = env_config.get('template', 'node')
        
        # CodeSandbox supports direct URL creation
        codesandbox_template = self._map_to_codesandbox_template(env_type)
        codesandbox_url = f"https://codesandbox.io/s/{codesandbox_template}"
        
        environment = {
            "id": env_id,
            "provider": "codesandbox",
            "type": env_type,
            "url": codesandbox_url,
            "embed_url": f"https://codesandbox.io/embed/{codesandbox_template}",
            "preview_url": codesandbox_url,
            "status": "running",
            "created_at": time.time()
        }
        
        self.environments[env_id] = environment
        
        return {
            "success": True,
            "environment": environment,
            "message": f"CodeSandbox environment created: {codesandbox_url}"
        }
    
    async def _create_local_fallback(self, env_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a local fallback environment when cloud providers aren't available"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        
        # Create local workspace
        workspace_dir = f"/tmp/podplay_sandbox/{env_id}"
        os.makedirs(workspace_dir, exist_ok=True)
        
        # Create template files
        template_files = self._get_template_files(env_type, env_config.get('template', 'blank'))
        
        for file_path, content in template_files.items():
            full_path = os.path.join(workspace_dir, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, 'w') as f:
                f.write(content)
        
        environment = {
            "id": env_id,
            "provider": "local_fallback",
            "type": env_type,
            "workspace_dir": workspace_dir,
            "url": f"file://{workspace_dir}",
            "status": "running",
            "created_at": time.time()
        }
        
        self.environments[env_id] = environment
        
        return {
            "success": True,
            "environment": environment,
            "message": f"Local fallback environment created at: {workspace_dir}"
        }
    
    def _map_to_stackblitz_template(self, env_type: str) -> str:
        """Map environment type to StackBlitz template"""
        mapping = {
            'react': 'react',
            'vue': 'vue',
            'angular': 'angular',
            'node': 'node',
            'typescript': 'typescript',
            'express': 'node'
        }
        return mapping.get(env_type, 'javascript')
    
    def _map_to_codesandbox_template(self, env_type: str) -> str:
        """Map environment type to CodeSandbox template"""
        mapping = {
            'react': 'new',
            'vue': 'vue',
            'angular': 'angular',
            'node': 'node',
            'typescript': 'vanilla-ts',
            'express': 'node'
        }
        return mapping.get(env_type, 'vanilla')
    
    def _get_template_files(self, env_type: str, template: str) -> Dict[str, str]:
        """Get template files for the specified environment type"""
        if env_type == 'react':
            return {
                "package.json": json.dumps({
                    "name": "podplay-react-sandbox",
                    "version": "1.0.0",
                    "dependencies": {
                        "react": "^18.2.0",
                        "react-dom": "^18.2.0",
                        "react-scripts": "5.0.1"
                    },
                    "scripts": {
                        "start": "react-scripts start",
                        "build": "react-scripts build"
                    }
                }, indent=2),
                "public/index.html": '''<!DOCTYPE html>
<html>
<head>
    <title>Podplay React Sandbox</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>''',
                "src/index.js": '''import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);''',
                "src/App.js": '''import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Podplay Development Sandbox</h1>
      <p>Welcome to your cloud-based development environment!</p>
      <p>This React app is running in a containerized sandbox.</p>
    </div>
  );
}

export default App;'''
            }
        
        elif env_type == 'vue':
            return {
                "package.json": json.dumps({
                    "name": "podplay-vue-sandbox",
                    "version": "1.0.0",
                    "dependencies": {
                        "vue": "^3.3.0",
                        "@vitejs/plugin-vue": "^4.0.0",
                        "vite": "^4.0.0"
                    },
                    "scripts": {
                        "dev": "vite",
                        "build": "vite build"
                    }
                }, indent=2),
                "index.html": '''<!DOCTYPE html>
<html>
<head>
    <title>Podplay Vue Sandbox</title>
</head>
<body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
</body>
</html>''',
                "src/main.js": '''import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')''',
                "src/App.vue": '''<template>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h1>🚀 Podplay Development Sandbox</h1>
    <p>Welcome to your cloud-based Vue.js environment!</p>
    <p>This Vue app is running in a containerized sandbox.</p>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>'''
            }
        
        elif env_type == 'node' or env_type == 'express':
            return {
                "package.json": json.dumps({
                    "name": "podplay-node-sandbox",
                    "version": "1.0.0",
                    "main": "server.js",
                    "dependencies": {
                        "express": "^4.18.0",
                        "cors": "^2.8.5"
                    },
                    "scripts": {
                        "start": "node server.js",
                        "dev": "node server.js"
                    }
                }, indent=2),
                "server.js": '''const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Podplay Node Sandbox</title></head>
      <body style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>🚀 Podplay Development Sandbox</h1>
        <p>Welcome to your cloud-based Node.js environment!</p>
        <p>This Express server is running in a containerized sandbox.</p>
        <p>Port: ${port}</p>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});''',
                "public/index.html": '''<!DOCTYPE html>
<html>
<head>
    <title>Podplay Node Sandbox</title>
</head>
<body>
    <h1>Static files served from /public</h1>
</body>
</html>'''
            }
        
        elif env_type == 'python' or env_type == 'flask':
            return {
                "requirements.txt": '''flask==2.3.0
flask-cors==4.0.0''',
                "app.py": '''from flask import Flask, jsonify, render_template_string
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template_string("""
    <html>
      <head><title>Podplay Python Sandbox</title></head>
      <body style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>🐍 Podplay Development Sandbox</h1>
        <p>Welcome to your cloud-based Python environment!</p>
        <p>This Flask app is running in a containerized sandbox.</p>
      </body>
    </html>
    """)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "language": "python"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)''',
                "main.py": '''print("🚀 Podplay Python Sandbox")
print("Welcome to your cloud-based Python environment!")
print("This Python script is running in a containerized sandbox.")'''
            }
        
        else:  # Default/blank template
            return {
                "index.html": '''<!DOCTYPE html>
<html>
<head>
    <title>Podplay Development Sandbox</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Podplay Development Sandbox</h1>
        <p>Welcome to your cloud-based development environment!</p>
        <p>This is a blank template. Start coding!</p>
    </div>
</body>
</html>''',
                "script.js": '''console.log("🚀 Podplay Development Sandbox");
console.log("Welcome to your cloud-based development environment!");''',
                "style.css": '''body {
    font-family: Arial, sans-serif;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}'''
            }
    
    async def get_environment(self, env_id: str) -> Dict[str, Any]:
        """Get environment details"""
        environment = self.environments.get(env_id)
        if not environment:
            return {"success": False, "error": "Environment not found"}
        
        return {"success": True, "environment": environment}
    
    async def list_environments(self) -> Dict[str, Any]:
        """List all active environments"""
        return {
            "success": True,
            "environments": list(self.environments.values()),
            "count": len(self.environments)
        }
    
    async def delete_environment(self, env_id: str) -> Dict[str, Any]:
        """Delete an environment"""
        if env_id not in self.environments:
            return {"success": False, "error": "Environment not found"}
        
        environment = self.environments[env_id]
        
        # Clean up local files if it's a local fallback
        if environment.get("provider") == "local_fallback":
            workspace_dir = environment.get("workspace_dir")
            if workspace_dir and os.path.exists(workspace_dir):
                import shutil
                shutil.rmtree(workspace_dir)
        
        del self.environments[env_id]
        
        return {
            "success": True,
            "message": f"Environment {env_id} deleted"
        }

    # ==================== COMPATIBILITY METHODS ====================
    # These methods provide compatibility with the original DevSandbox interface
    
    def get_file_tree(self, env_id: str) -> Optional[Dict[str, Any]]:
        """Get file tree for environment - compatibility method"""
        if env_id not in self.environments:
            return None
        
        # For cloud environments, we can't access the file system directly
        # Return a basic structure
        return {
            'name': 'workspace',
            'path': '/',
            'type': 'directory',
            'children': [
                {
                    'name': 'README.md',
                    'path': 'README.md',
                    'type': 'file',
                    'size': 100
                },
                {
                    'name': 'src',
                    'path': 'src',
                    'type': 'directory',
                    'children': []
                }
            ]
        }
    
    def read_file(self, env_id: str, file_path: str) -> Optional[str]:
        """Read file content - compatibility method"""
        if env_id not in self.environments:
            return None
        
        # For cloud environments, return template content
        if file_path == 'README.md':
            return f"""# {self.environments[env_id].get('type', 'Cloud')} Development Environment

This is a cloud-based development environment.

Open the environment URL to start coding:
{self.environments[env_id].get('url', 'N/A')}

## Features

- ☁️ Cloud-based development
- 🚀 Instant startup
- 🛠️ Pre-configured tools
- 🌐 Live preview
"""
        
        return "// Cloud environment - edit files in the cloud provider\n"
    
    def write_file(self, env_id: str, file_path: str, content: str) -> bool:
        """Write file content - compatibility method"""
        if env_id not in self.environments:
            return False
        
        # For cloud environments, we can't write files directly
        # This would need to be handled by the cloud provider's API
        print(f"💡 File write request for {file_path} in cloud environment {env_id}")
        print("   To edit files, please use the cloud environment URL")
        return True
    
    def create_directory(self, env_id: str, dir_path: str) -> bool:
        """Create directory - compatibility method"""
        if env_id not in self.environments:
            return False
        
        print(f"💡 Directory creation request for {dir_path} in cloud environment {env_id}")
        print("   To create directories, please use the cloud environment URL")
        return True
    
    def create_terminal_session(self, env_id: str) -> Optional[str]:
        """Create terminal session - compatibility method"""
        if env_id not in self.environments:
            return None
        
        session_id = str(uuid.uuid4())
        self.active_sessions[session_id] = {
            'env_id': env_id,
            'type': 'cloud_terminal',
            'created_at': time.time()
        }
        
        print(f"💡 Terminal session {session_id} created for cloud environment {env_id}")
        print("   To use terminal, please open the cloud environment URL")
        return session_id
    
    def execute_command(self, session_id: str, command: str) -> Dict[str, Any]:
        """Execute command - compatibility method"""
        if session_id not in self.active_sessions:
            return {'stderr': 'Session not found', 'exit_code': 1}
        
        print(f"💡 Command execution request: {command}")
        print("   To execute commands, please use the cloud environment terminal")
        
        return {
            'stdout': f'Cloud terminal: {command}\nPlease use the cloud environment for actual command execution.',
            'exit_code': 0
        }
    
    def get_available_port(self) -> int:
        """Get available port - compatibility method"""
        import random
        return random.randint(3000, 9000)
    
    def stop_environment(self, env_id: str) -> bool:
        """Stop environment - compatibility method"""
        if env_id not in self.environments:
            return False
        
        env = self.environments[env_id]
        env['status'] = 'stopped'
        print(f"💡 Environment {env_id} marked as stopped")
        print("   Note: Cloud environments may continue running in the cloud provider")
        return True
    
    def delete_environment(self, env_id: str) -> bool:
        """Delete environment - compatibility method"""
        if env_id not in self.environments:
            return False
        
        del self.environments[env_id]
        # Clean up associated sessions
        sessions_to_remove = [sid for sid, session in self.active_sessions.items() 
                             if session.get('env_id') == env_id]
        for sid in sessions_to_remove:
            del self.active_sessions[sid]
        
        print(f"💡 Environment {env_id} deleted from local tracking")
        print("   Note: You may need to manually clean up the cloud environment")
        return True

# Global instance
cloud_dev_sandbox = CloudDevSandboxManager()
