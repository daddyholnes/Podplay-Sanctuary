#!/usr/bin/env python3
"""
MCP Docker Orchestrator
Manages Model Context Protocol servers in Docker containers for the Podplay Sanctuary

Features:
- Deploy MCP servers as Docker containers
- Dynamic server discovery and management
- Integration with Mama Bear ADK agent
- NixOS VM creation with MCP toolkit
- CodeSpace-like development environments
"""

import os
import json
import logging
import asyncio
import docker
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from dataclasses import dataclass, asdict
import yaml

logger = logging.getLogger(__name__)

@dataclass
class MCPServerSpec:
    """Specification for an MCP server deployment"""
    name: str
    description: str
    image: str
    command: List[str]
    environment: Dict[str, str]
    volumes: Dict[str, Dict[str, str]]
    ports: Dict[str, int]
    capabilities: List[str]
    dependencies: List[str]
    health_check: Dict[str, Any]
    auto_restart: bool = True
    
class MCPDockerOrchestrator:
    """
    Orchestrates MCP servers in Docker containers with NixOS VM support
    """
    
    def __init__(self):
        self.docker_client = None
        self.active_servers = {}
        self.server_registry = {}
        self.vm_environments = {}
        
        # Initialize Docker
        self._initialize_docker()
        
        # Load default MCP server specs
        self._load_default_servers()
        
        logger.info("🔌 MCP Docker Orchestrator initialized")
    
    def _initialize_docker(self):
        """Initialize Docker client"""
        try:
            self.docker_client = docker.from_env()
            # Test connection
            self.docker_client.ping()
            logger.info("🐳 Docker client connected successfully")
        except Exception as e:
            logger.error(f"Docker initialization failed: {e}")
            self.docker_client = None
    
    def _load_default_servers(self):
        """Load default MCP server specifications"""
        self.server_registry = {
            "filesystem": MCPServerSpec(
                name="filesystem",
                description="File system operations MCP server",
                image="node:18-alpine",
                command=["npx", "@modelcontextprotocol/server-filesystem", "/workspace"],
                environment={
                    "MCP_SERVER_NAME": "filesystem",
                    "MCP_LOG_LEVEL": "info"
                },
                volumes={
                    "/tmp/mcp-workspace": {"bind": "/workspace", "mode": "rw"}
                },
                ports={"3000": 3000},
                capabilities=["read_file", "write_file", "list_directory", "create_directory"],
                dependencies=["@modelcontextprotocol/server-filesystem"],
                health_check={
                    "test": ["CMD", "curl", "-f", "http://localhost:3000/health"],
                    "interval": "30s",
                    "timeout": "10s",
                    "retries": 3
                }
            ),
            
            "postgres": MCPServerSpec(
                name="postgres",
                description="PostgreSQL database MCP server",
                image="postgres:15-alpine",
                command=["postgres"],
                environment={
                    "POSTGRES_DB": "sanctuary",
                    "POSTGRES_USER": "mama_bear",
                    "POSTGRES_PASSWORD": "sanctuary_secure",
                    "MCP_SERVER_NAME": "postgres"
                },
                volumes={
                    "/tmp/postgres-data": {"bind": "/var/lib/postgresql/data", "mode": "rw"}
                },
                ports={"5432": 5432},
                capabilities=["sql_query", "database_schema", "table_operations"],
                dependencies=["pg"],
                health_check={
                    "test": ["CMD-SHELL", "pg_isready -U mama_bear"],
                    "interval": "30s",
                    "timeout": "10s",
                    "retries": 5
                }
            ),
            
            "github": MCPServerSpec(
                name="github",
                description="GitHub integration MCP server",
                image="node:18-alpine",
                command=["npx", "@modelcontextprotocol/server-github"],
                environment={
                    "GITHUB_PERSONAL_ACCESS_TOKEN": os.getenv("GITHUB_TOKEN", ""),
                    "MCP_SERVER_NAME": "github"
                },
                volumes={},
                ports={"3001": 3001},
                capabilities=["repo_management", "issue_tracking", "pr_management"],
                dependencies=["@modelcontextprotocol/server-github"],
                health_check={
                    "test": ["CMD", "curl", "-f", "http://localhost:3001/health"],
                    "interval": "30s",
                    "timeout": "10s",
                    "retries": 3
                }
            ),
            
            "brave-search": MCPServerSpec(
                name="brave-search",
                description="Brave Search API MCP server",
                image="node:18-alpine",
                command=["npx", "@modelcontextprotocol/server-brave-search"],
                environment={
                    "BRAVE_API_KEY": os.getenv("BRAVE_API_KEY", ""),
                    "MCP_SERVER_NAME": "brave-search"
                },
                volumes={},
                ports={"3002": 3002},
                capabilities=["web_search", "news_search", "image_search"],
                dependencies=["@modelcontextprotocol/server-brave-search"],
                health_check={
                    "test": ["CMD", "curl", "-f", "http://localhost:3002/health"],
                    "interval": "30s",
                    "timeout": "10s",
                    "retries": 3
                }
            ),
            
            "development-tools": MCPServerSpec(
                name="development-tools",
                description="Development tools and utilities MCP server",
                image="python:3.11-alpine",
                command=["python", "-m", "mcp_dev_tools"],
                environment={
                    "MCP_SERVER_NAME": "development-tools",
                    "PYTHONPATH": "/app"
                },
                volumes={
                    "/tmp/dev-workspace": {"bind": "/workspace", "mode": "rw"}
                },
                ports={"3003": 3003},
                capabilities=["code_analysis", "lint_check", "format_code", "run_tests"],
                dependencies=["mcp-dev-tools"],
                health_check={
                    "test": ["CMD", "python", "-c", "import requests; requests.get('http://localhost:3003/health')"],
                    "interval": "30s",
                    "timeout": "10s",
                    "retries": 3
                }
            )
        }
    
    async def deploy_mcp_server(self, server_name: str, custom_config: Optional[Dict] = None) -> Dict[str, Any]:
        """Deploy an MCP server in a Docker container"""
        if not self.docker_client:
            return {"error": "Docker not available"}
        
        if server_name not in self.server_registry:
            return {"error": f"Unknown MCP server: {server_name}"}
        
        try:
            spec = self.server_registry[server_name]
            
            # Apply custom configuration if provided
            if custom_config:
                spec = self._merge_server_config(spec, custom_config)
            
            # Check if server is already running
            if server_name in self.active_servers:
                container = self.active_servers[server_name]["container"]
                if container.status == "running":
                    return {
                        "success": True,
                        "message": f"MCP server '{server_name}' is already running",
                        "container_id": container.id
                    }
            
            # Create Docker container
            container_name = f"mcp-{server_name}-{int(datetime.now().timestamp())}"
            
            container = self.docker_client.containers.run(
                image=spec.image,
                command=spec.command,
                environment=spec.environment,
                volumes=spec.volumes,
                ports=spec.ports,
                name=container_name,
                detach=True,
                auto_remove=False,
                restart_policy={"Name": "unless-stopped"} if spec.auto_restart else None,
                healthcheck=spec.health_check if hasattr(spec, 'health_check') else None
            )
            
            # Store server info
            self.active_servers[server_name] = {
                "container": container,
                "spec": spec,
                "deployed_at": datetime.now(),
                "status": "starting"
            }
            
            # Wait for container to be ready
            await asyncio.sleep(2)
            container.reload()
            
            # Update status
            self.active_servers[server_name]["status"] = container.status
            
            logger.info(f"🔌 MCP server '{server_name}' deployed successfully")
            
            return {
                "success": True,
                "message": f"MCP server '{server_name}' deployed successfully",
                "container_id": container.id,
                "container_name": container_name,
                "status": container.status,
                "ports": self._get_container_ports(container),
                "capabilities": spec.capabilities
            }
            
        except Exception as e:
            logger.error(f"Failed to deploy MCP server '{server_name}': {e}")
            return {"error": str(e)}
    
    def _merge_server_config(self, spec: MCPServerSpec, custom_config: Dict) -> MCPServerSpec:
        """Merge custom configuration with server spec"""
        spec_dict = asdict(spec)
        
        # Deep merge configuration
        for key, value in custom_config.items():
            if key in spec_dict:
                if isinstance(spec_dict[key], dict) and isinstance(value, dict):
                    spec_dict[key].update(value)
                else:
                    spec_dict[key] = value
        
        return MCPServerSpec(**spec_dict)
    
    def _get_container_ports(self, container) -> Dict[str, int]:
        """Get exposed ports from container"""
        try:
            container.reload()
            port_bindings = container.attrs['NetworkSettings']['Ports']
            ports = {}
            for container_port, host_bindings in port_bindings.items():
                if host_bindings:
                    host_port = host_bindings[0]['HostPort']
                    ports[container_port] = int(host_port)
            return ports
        except Exception as e:
            logger.error(f"Failed to get container ports: {e}")
            return {}
    
    async def stop_mcp_server(self, server_name: str) -> Dict[str, Any]:
        """Stop an MCP server"""
        if server_name not in self.active_servers:
            return {"error": f"MCP server '{server_name}' is not running"}
        
        try:
            container = self.active_servers[server_name]["container"]
            container.stop()
            container.remove()
            
            del self.active_servers[server_name]
            
            logger.info(f"🔌 MCP server '{server_name}' stopped successfully")
            
            return {
                "success": True,
                "message": f"MCP server '{server_name}' stopped successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to stop MCP server '{server_name}': {e}")
            return {"error": str(e)}
    
    async def list_active_servers(self) -> Dict[str, Any]:
        """List all active MCP servers"""
        servers = []
        
        for server_name, server_info in self.active_servers.items():
            try:
                container = server_info["container"]
                container.reload()
                
                servers.append({
                    "name": server_name,
                    "container_id": container.id,
                    "status": container.status,
                    "image": container.image.tags[0] if container.image.tags else "unknown",
                    "deployed_at": server_info["deployed_at"].isoformat(),
                    "capabilities": server_info["spec"].capabilities,
                    "ports": self._get_container_ports(container)
                })
            except Exception as e:
                logger.error(f"Error getting info for server '{server_name}': {e}")
        
        return {
            "servers": servers,
            "total_active": len(servers),
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_server_logs(self, server_name: str, lines: int = 100) -> Dict[str, Any]:
        """Get logs from an MCP server"""
        if server_name not in self.active_servers:
            return {"error": f"MCP server '{server_name}' is not running"}
        
        try:
            container = self.active_servers[server_name]["container"]
            logs = container.logs(tail=lines, timestamps=True).decode('utf-8')
            
            return {
                "success": True,
                "server_name": server_name,
                "logs": logs,
                "lines": lines
            }
            
        except Exception as e:
            logger.error(f"Failed to get logs for server '{server_name}': {e}")
            return {"error": str(e)}
    
    async def create_nixos_vm(self, vm_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a NixOS-like development environment with MCP toolkit"""
        try:
            # Default NixOS-like configuration
            default_config = {
                "name": f"nixos-vm-{int(datetime.now().timestamp())}",
                "image": "nixos/nix:latest",
                "mcp_servers": ["filesystem", "development-tools"],
                "packages": ["git", "vim", "curl", "wget", "python3", "nodejs", "npm"],
                "environment": {
                    "NIX_PROFILES": "/nix/var/nix/profiles/default",
                    "PATH": "/nix/var/nix/profiles/default/bin:/usr/bin:/bin",
                    "MCP_ENABLED": "true",
                    "SANCTUARY_MODE": "development"
                },
                "volumes": {
                    "/tmp/nixos-workspace": {"bind": "/workspace", "mode": "rw"},
                    "/tmp/nix-store": {"bind": "/nix", "mode": "rw"}
                },
                "ports": {"22": None, "8000": None, "3000": None}  # SSH, dev server, MCP
            }
            
            # Merge configurations
            config = {**default_config, **vm_config}
            
            # Create the container
            container = self.docker_client.containers.run(
                image=config["image"],
                name=config["name"],
                environment=config["environment"],
                volumes=config["volumes"],
                ports=config["ports"],
                detach=True,
                tty=True,
                stdin_open=True,
                restart_policy={"Name": "unless-stopped"}
            )
            
            # Wait for container to start
            await asyncio.sleep(3)
            container.reload()
            
            # Install additional packages
            if config.get("packages"):
                package_cmd = f"nix-env -iA {' '.join(f'nixpkgs.{pkg}' for pkg in config['packages'])}"
                exec_result = container.exec_run(package_cmd)
                logger.info(f"Package installation result: {exec_result.exit_code}")
            
            # Deploy requested MCP servers
            deployed_mcp = []
            for mcp_server in config.get("mcp_servers", []):
                deploy_result = await self.deploy_mcp_server(mcp_server)
                if deploy_result.get("success"):
                    deployed_mcp.append(mcp_server)
            
            # Store VM environment info
            self.vm_environments[config["name"]] = {
                "container": container,
                "config": config,
                "mcp_servers": deployed_mcp,
                "created_at": datetime.now()
            }
            
            logger.info(f"🏗️ NixOS VM '{config['name']}' created successfully")
            
            return {
                "success": True,
                "vm_name": config["name"],
                "container_id": container.id,
                "status": container.status,
                "ports": self._get_container_ports(container),
                "mcp_servers": deployed_mcp,
                "ip_address": container.attrs['NetworkSettings']['IPAddress']
            }
            
        except Exception as e:
            logger.error(f"Failed to create NixOS VM: {e}")
            return {"error": str(e)}
    
    async def create_codespace_environment(self, project_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a CodeSpace-like development environment"""
        try:
            # CodeSpace configuration
            codespace_config = {
                "name": f"codespace-{project_config.get('name', 'unnamed')}-{int(datetime.now().timestamp())}",
                "image": "mcr.microsoft.com/vscode/devcontainers/base:ubuntu",
                "mcp_servers": ["filesystem", "github", "development-tools"],
                "environment": {
                    "CODESPACE_NAME": project_config.get('name', 'unnamed'),
                    "GITHUB_REPOSITORY": project_config.get('repository', ''),
                    "MCP_ENABLED": "true",
                    "VSCODE_ENABLED": "true"
                },
                "volumes": {
                    "/tmp/codespace-workspace": {"bind": "/workspaces", "mode": "rw"},
                    "/tmp/vscode-server": {"bind": "/home/vscode/.vscode-server", "mode": "rw"}
                },
                "ports": {
                    "22": None,    # SSH
                    "8000": None,  # Development server
                    "3000": None,  # React dev server
                    "5000": None,  # Flask/API server
                    "8080": None   # VS Code Server
                }
            }
            
            # Create NixOS VM with CodeSpace configuration
            vm_result = await self.create_nixos_vm(codespace_config)
            
            if vm_result.get("success"):
                # Additional CodeSpace setup
                container_id = vm_result["container_id"]
                container = self.docker_client.containers.get(container_id)
                
                # Install VS Code Server
                vscode_install_cmd = [
                    "bash", "-c",
                    "curl -fsSL https://code-server.dev/install.sh | sh && "
                    "code-server --install-extension ms-python.python --install-extension ms-vscode.vscode-typescript-next"
                ]
                
                exec_result = container.exec_run(vscode_install_cmd)
                logger.info(f"VS Code Server installation: {exec_result.exit_code}")
                
                # Clone repository if specified
                if project_config.get('repository'):
                    clone_cmd = f"git clone {project_config['repository']} /workspaces/{project_config.get('name', 'project')}"
                    container.exec_run(clone_cmd)
                
                return {
                    **vm_result,
                    "type": "codespace",
                    "vscode_url": f"http://localhost:{self._get_container_ports(container).get('8080/tcp', 8080)}",
                    "project_name": project_config.get('name'),
                    "repository": project_config.get('repository')
                }
            else:
                return vm_result
                
        except Exception as e:
            logger.error(f"Failed to create CodeSpace environment: {e}")
            return {"error": str(e)}
    
    async def execute_in_container(self, container_name: str, command: str) -> Dict[str, Any]:
        """Execute command in a container"""
        try:
            # Find container
            container = None
            if container_name in self.active_servers:
                container = self.active_servers[container_name]["container"]
            elif container_name in self.vm_environments:
                container = self.vm_environments[container_name]["container"]
            else:
                # Try to find by name
                containers = self.docker_client.containers.list(all=True)
                for c in containers:
                    if container_name in c.name:
                        container = c
                        break
            
            if not container:
                return {"error": f"Container '{container_name}' not found"}
            
            # Execute command
            result = container.exec_run(command, stream=False, demux=True)
            stdout, stderr = result.output
            
            return {
                "success": True,
                "exit_code": result.exit_code,
                "stdout": stdout.decode('utf-8') if stdout else "",
                "stderr": stderr.decode('utf-8') if stderr else "",
                "command": command
            }
            
        except Exception as e:
            logger.error(f"Command execution failed: {e}")
            return {"error": str(e)}
    
    async def get_available_servers(self) -> Dict[str, Any]:
        """Get list of available MCP server specifications"""
        return {
            "available_servers": [
                {
                    "name": name,
                    "description": spec.description,
                    "capabilities": spec.capabilities,
                    "dependencies": spec.dependencies
                }
                for name, spec in self.server_registry.items()
            ],
            "total_available": len(self.server_registry)
        }
    
    async def cleanup_all(self) -> Dict[str, Any]:
        """Cleanup all MCP servers and VMs"""
        results = {
            "stopped_servers": [],
            "stopped_vms": [],
            "errors": []
        }
        
        # Stop MCP servers
        for server_name in list(self.active_servers.keys()):
            try:
                stop_result = await self.stop_mcp_server(server_name)
                if stop_result.get("success"):
                    results["stopped_servers"].append(server_name)
                else:
                    results["errors"].append(f"Failed to stop {server_name}: {stop_result.get('error')}")
            except Exception as e:
                results["errors"].append(f"Error stopping {server_name}: {str(e)}")
        
        # Stop VMs
        for vm_name, vm_info in list(self.vm_environments.items()):
            try:
                container = vm_info["container"]
                container.stop()
                container.remove()
                results["stopped_vms"].append(vm_name)
                del self.vm_environments[vm_name]
            except Exception as e:
                results["errors"].append(f"Error stopping VM {vm_name}: {str(e)}")
        
        return results


# Global instance
mcp_orchestrator = MCPDockerOrchestrator()

async def deploy_server(server_name: str, config: Optional[Dict] = None):
    """Convenience function to deploy MCP server"""
    return await mcp_orchestrator.deploy_mcp_server(server_name, config)

async def create_development_environment(env_type: str = "nixos", config: Dict = None):
    """Create development environment"""
    config = config or {}
    
    if env_type == "nixos":
        return await mcp_orchestrator.create_nixos_vm(config)
    elif env_type == "codespace":
        return await mcp_orchestrator.create_codespace_environment(config)
    else:
        return {"error": f"Unknown environment type: {env_type}"}
