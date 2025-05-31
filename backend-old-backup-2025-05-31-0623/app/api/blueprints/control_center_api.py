#!/usr/bin/env python3
"""
Mama Bear Control Center API Blueprint
Handles VS Code instance management, agent commands, and system monitoring
"""

import os
import json
import logging
from typing import Dict, List, Any
from datetime import datetime
from flask import Blueprint, request, jsonify

logger = logging.getLogger(__name__)

# Create the Control Center API blueprint
control_center_bp = Blueprint('control_center', __name__, url_prefix='/api/mama-bear')

# ==================== VS CODE INSTANCE MANAGEMENT ====================

@control_center_bp.route('/code-server/instances', methods=['GET'])
def get_code_server_instances():
    """Get all active code-server instances"""
    try:
        # In production, this would query actual running instances
        # For now, return mock data structure
        instances = [
            {
                "id": "instance-react-dev",
                "name": "React Development - Main",
                "url": "http://localhost:8080",
                "status": "running",
                "workspace": "/workspaces/react-project",
                "theme": "dark",
                "port": 8080,
                "cpu_usage": 15.2,
                "memory_usage": 45.8,
                "last_activity": datetime.now().isoformat(),
                "created_at": "2024-01-15T10:00:00Z",
                "template": "react-typescript"
            },
            {
                "id": "instance-python-api",
                "name": "Python API Development",
                "url": "http://localhost:8081",
                "status": "stopped",
                "workspace": "/workspaces/python-api",
                "theme": "light",
                "port": 8081,
                "cpu_usage": 0,
                "memory_usage": 0,
                "last_activity": "2024-01-15T14:30:00Z",
                "created_at": "2024-01-15T14:00:00Z",
                "template": "python-fastapi"
            }
        ]
        
        return jsonify({
            "success": True,
            "instances": instances,
            "count": len(instances)
        })
        
    except Exception as e:
        logger.error(f"Error getting code-server instances: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@control_center_bp.route('/code-server/templates', methods=['GET'])
def get_workspace_templates():
    """Get available workspace templates"""
    try:
        templates = [
            {
                "id": "react-typescript",
                "name": "React TypeScript",
                "description": "Modern React app with TypeScript, Vite, and Tailwind CSS",
                "category": "frontend",
                "icon": "⚛️",
                "tags": ["react", "typescript", "vite", "tailwind"],
                "features": [
                    "React 18 with TypeScript",
                    "Vite for fast development",
                    "Tailwind CSS for styling",
                    "ESLint and Prettier configured",
                    "Testing setup with Vitest"
                ]
            },
            {
                "id": "python-fastapi",
                "name": "Python FastAPI",
                "description": "High-performance Python API with FastAPI and async support",
                "category": "backend",
                "icon": "🐍",
                "tags": ["python", "fastapi", "async", "api"],
                "features": [
                    "FastAPI with async support",
                    "SQLAlchemy ORM",
                    "Pydantic data validation",
                    "OpenAPI documentation",
                    "Poetry dependency management"
                ]
            },
            {
                "id": "nextjs-fullstack",
                "name": "Next.js Full-Stack",
                "description": "Complete Next.js application with API routes and database",
                "category": "fullstack",
                "icon": "🚀",
                "tags": ["nextjs", "react", "api", "database"],
                "features": [
                    "Next.js 14 with App Router",
                    "TypeScript configuration",
                    "Prisma database ORM",
                    "NextAuth.js authentication",
                    "Tailwind CSS styling"
                ]
            },
            {
                "id": "node-express",
                "name": "Node.js Express",
                "description": "Classic Node.js backend with Express and MongoDB",
                "category": "backend",
                "icon": "🟢",
                "tags": ["nodejs", "express", "mongodb", "api"],
                "features": [
                    "Express.js server",
                    "MongoDB with Mongoose",
                    "JWT authentication",
                    "API documentation",
                    "Error handling middleware"
                ]
            },
            {
                "id": "vue-nuxt",
                "name": "Vue.js Nuxt",
                "description": "Vue.js application with Nuxt.js framework",
                "category": "frontend",
                "icon": "🟩",
                "tags": ["vue", "nuxt", "ssr", "spa"],
                "features": [
                    "Vue 3 with Composition API",
                    "Nuxt 3 framework",
                    "Server-side rendering",
                    "Auto-imports",
                    "Built-in routing"
                ]
            },
            {
                "id": "docker-microservices",
                "name": "Docker Microservices",
                "description": "Multi-service architecture with Docker Compose",
                "category": "microservices",
                "icon": "🐳",
                "tags": ["docker", "microservices", "compose", "kubernetes"],
                "features": [
                    "Docker Compose setup",
                    "Multiple service containers",
                    "Nginx load balancer",
                    "Redis caching",
                    "PostgreSQL database"
                ]
            }
        ]
        
        return jsonify({
            "success": True,
            "templates": templates,
            "count": len(templates)
        })
        
    except Exception as e:
        logger.error(f"Error getting workspace templates: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@control_center_bp.route('/code-server/create', methods=['POST'])
def create_code_server_instance():
    """Create a new code-server instance from template"""
    try:
        data = request.get_json()
        template_id = data.get('template_id')
        instance_name = data.get('name', f"New {template_id} Instance")
        theme = data.get('theme', 'dark')
        
        if not template_id:
            return jsonify({"success": False, "error": "Template ID is required"}), 400
        
        # Generate unique instance ID and port
        instance_id = f"instance-{template_id}-{int(datetime.now().timestamp())}"
        port = 8080 + len(instance_id) % 100  # Simple port assignment
        
        # Create new instance object
        new_instance = {
            "id": instance_id,
            "name": instance_name,
            "url": f"http://localhost:{port}",
            "status": "starting",
            "workspace": f"/workspaces/{template_id}",
            "theme": theme,
            "port": port,
            "cpu_usage": 0,
            "memory_usage": 0,
            "last_activity": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "template": template_id
        }
        
        # In production, this would actually start a code-server process
        logger.info(f"🏗️ Creating code-server instance for template: {template_id}")
        
        # Get Mama Bear service for learning (if available)
        mama_bear_service = getattr(request, 'mama_bear_service', None)
        if mama_bear_service:
            mama_bear_service.store_memory(
                f"Created {template_id} workspace with {theme} theme",
                {"type": "workspace_creation", "template": template_id, "theme": theme}
            )
        
        return jsonify({
            "success": True,
            "instance": new_instance,
            "message": f"🐻 Creating {template_id} workspace with love and care!"
        })
        
    except Exception as e:
        logger.error(f"Error creating code-server instance: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@control_center_bp.route('/code-server/control/<instance_id>', methods=['POST'])
def control_code_server_instance(instance_id):
    """Control a code-server instance (start/stop/restart/delete)"""
    try:
        data = request.get_json()
        action = data.get('action')
        
        if action not in ['start', 'stop', 'restart', 'delete']:
            return jsonify({"success": False, "error": "Invalid action"}), 400
        
        # In production, this would control actual code-server processes
        logger.info(f"🔧 {action.title()}ing code-server instance: {instance_id}")
        
        action_messages = {
            'start': f"🚀 Starting workspace {instance_id}",
            'stop': f"⏹️ Stopping workspace {instance_id}",
            'restart': f"🔄 Restarting workspace {instance_id}",
            'delete': f"🗑️ Removing workspace {instance_id}"
        }
        
        return jsonify({
            "success": True,
            "instance_id": instance_id,
            "action": action,
            "message": action_messages[action]
        })
        
    except Exception as e:
        logger.error(f"Error controlling code-server instance: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== AGENT COMMANDS ====================

@control_center_bp.route('/agent/commands', methods=['GET'])
def get_mama_bear_commands():
    """Get available Mama Bear agent commands"""
    try:
        commands = [
            {
                "id": "create-workspace",
                "name": "Create Workspace",
                "description": "Set up a new development workspace with Mama Bear assistance",
                "category": "workspace",
                "icon": "🏗️",
                "hotkey": "Ctrl+Shift+N"
            },
            {
                "id": "ai-code-review",
                "name": "AI Code Review",
                "description": "Get intelligent code suggestions and reviews from Mama Bear",
                "category": "ai",
                "icon": "🔍",
                "hotkey": "Ctrl+Shift+R"
            },
            {
                "id": "deploy-app",
                "name": "Deploy Application",
                "description": "Deploy your application with Mama Bear deployment pipeline",
                "category": "deployment",
                "icon": "🚀",
                "hotkey": "Ctrl+Shift+D"
            },
            {
                "id": "system-health",
                "name": "System Health Check",
                "description": "Monitor system performance and workspace health",
                "category": "monitoring",
                "icon": "💊",
                "hotkey": "Ctrl+Shift+H"
            },
            {
                "id": "mcp-discover",
                "name": "Discover MCP Tools",
                "description": "Find and install new Model Context Protocol tools",
                "category": "ai",
                "icon": "🔧",
                "hotkey": "Ctrl+Shift+M"
            },
            {
                "id": "sanctuary-optimize",
                "name": "Optimize Sanctuary",
                "description": "Let Mama Bear optimize your development environment",
                "category": "workspace",
                "icon": "✨",
                "hotkey": "Ctrl+Shift+O"
            }
        ]
        
        return jsonify({
            "success": True,
            "commands": commands,
            "count": len(commands)
        })
        
    except Exception as e:
        logger.error(f"Error getting Mama Bear commands: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@control_center_bp.route('/agent/execute', methods=['POST'])
def execute_mama_bear_command():
    """Execute a Mama Bear agent command"""
    try:
        data = request.get_json()
        command_id = data.get('command_id')
        parameters = data.get('parameters', {})
        
        if not command_id:
            return jsonify({"success": False, "error": "Command ID is required"}), 400
        
        logger.info(f"🐻 Executing Mama Bear command: {command_id}")
        
        # Command execution responses
        command_responses = {
            "create-workspace": {
                "success": True,
                "message": "🏗️ Opening workspace creation wizard...",
                "action": "open_modal",
                "modal_type": "create_workspace"
            },
            "ai-code-review": {
                "success": True,
                "message": "🔍 Analyzing your code for improvements...",
                "action": "start_code_review",
                "suggestions": [
                    "Consider adding TypeScript strict mode",
                    "Add error boundaries to React components",
                    "Implement proper error handling"
                ]
            },
            "deploy-app": {
                "success": True,
                "message": "🚀 Preparing deployment pipeline...",
                "action": "start_deployment",
                "steps": ["Build", "Test", "Deploy", "Monitor"]
            },
            "system-health": {
                "success": True,
                "message": "💊 Running system health diagnostics...",
                "action": "show_metrics",
                "metrics": {
                    "cpu": "25%",
                    "memory": "68%",
                    "disk": "45%",
                    "instances": "3 active"
                }
            },
            "mcp-discover": {
                "success": True,
                "message": "🔧 Discovering new MCP tools for you...",
                "action": "open_mcp_marketplace",
                "new_tools": ["@anthropic/mcp-server-github", "@openai/mcp-server-sqlite"]
            },
            "sanctuary-optimize": {
                "success": True,
                "message": "✨ Analyzing your sanctuary for optimization opportunities...",
                "action": "show_optimizations",
                "optimizations": [
                    "Enable VS Code settings sync",
                    "Install productivity extensions",
                    "Configure automatic backups"
                ]
            }
        }
        
        response = command_responses.get(command_id, {
            "success": False,
            "error": f"Unknown command: {command_id}"
        })
        
        # Learn from command execution (if Mama Bear service available)
        mama_bear_service = getattr(request, 'mama_bear_service', None)
        if mama_bear_service and response.get("success"):
            mama_bear_service.store_memory(
                f"Executed {command_id} command",
                {"type": "command_execution", "command": command_id, "parameters": parameters}
            )
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error executing Mama Bear command: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== SYSTEM MONITORING ====================

@control_center_bp.route('/system/metrics', methods=['GET'])
def get_system_metrics():
    """Get current system metrics for the control center"""
    try:
        # Try to get real system metrics
        try:
            import psutil
            
            # Get system metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            metrics = {
                "cpu": round(cpu_percent, 1),
                "memory": round(memory.percent, 1),
                "disk": round(disk.percent, 1),
                "active_instances": 0,  # Would count actual instances
                "timestamp": datetime.now().isoformat(),
                "uptime": "2d 14h 23m",  # Would calculate real uptime
                "sanctuary_health": "excellent"
            }
            
        except ImportError:
            # Fallback if psutil not available
            logger.warning("psutil not available, using mock metrics")
            metrics = {
                "cpu": 15.5,
                "memory": 68.2,
                "disk": 45.0,
                "active_instances": 2,
                "timestamp": datetime.now().isoformat(),
                "uptime": "2d 14h 23m",
                "sanctuary_health": "excellent"
            }
        
        return jsonify({
            "success": True,
            "metrics": metrics
        })
        
    except Exception as e:
        logger.error(f"Error getting system metrics: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== ENHANCED ENDPOINTS ====================

@control_center_bp.route('/workspace/list', methods=['GET'])
def list_workspaces():
    """List all available workspaces and their status"""
    try:
        workspaces = [
            {
                "id": "podplay-sanctuary",
                "name": "Podplay Sanctuary",
                "path": "/workspaces/podplay-sanctuary",
                "type": "fullstack",
                "status": "active",
                "last_opened": datetime.now().isoformat(),
                "technologies": ["python", "react", "typescript", "flask"]
            },
            {
                "id": "react-demo",
                "name": "React Demo Project",
                "path": "/workspaces/react-demo",
                "type": "frontend",
                "status": "idle",
                "last_opened": "2024-01-15T10:00:00Z",
                "technologies": ["react", "typescript", "vite"]
            }
        ]
        
        return jsonify({
            "success": True,
            "workspaces": workspaces,
            "count": len(workspaces)
        })
        
    except Exception as e:
        logger.error(f"Error listing workspaces: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@control_center_bp.route('/extensions/list', methods=['GET'])
def list_extensions():
    """List available VS Code extensions for workspaces"""
    try:
        extensions = [
            {
                "id": "ms-python.python",
                "name": "Python",
                "publisher": "Microsoft",
                "description": "IntelliSense, linting, debugging, and more for Python",
                "category": "programming-languages",
                "installed": True,
                "version": "2024.0.1"
            },
            {
                "id": "bradlc.vscode-tailwindcss",
                "name": "Tailwind CSS IntelliSense",
                "publisher": "Tailwind Labs",
                "description": "Intelligent Tailwind CSS tooling",
                "category": "other",
                "installed": True,
                "version": "0.10.5"
            },
            {
                "id": "esbenp.prettier-vscode",
                "name": "Prettier - Code formatter",
                "publisher": "Prettier",
                "description": "Code formatter using prettier",
                "category": "formatters",
                "installed": False,
                "version": "10.1.0"
            }
        ]
        
        return jsonify({
            "success": True,
            "extensions": extensions,
            "count": len(extensions)
        })
        
    except Exception as e:
        logger.error(f"Error listing extensions: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== HEALTH CHECK ====================

@control_center_bp.route('/health', methods=['GET'])
def control_center_health():
    """Health check for the Control Center API"""
    try:
        return jsonify({
            "success": True,
            "service": "mama_bear_control_center",
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "features": [
                "VS Code instance management",
                "Workspace templates",
                "Agent commands",
                "System monitoring"
            ]
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
