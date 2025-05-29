"""
Mama Bear Extension Manager for Podplay Build Sanctuary
Provides centralized control and extension management for GitHub Codespaces
Designed to give Mama Bear full control over the development environment
"""

import os
import json
import asyncio
import logging
import subprocess
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import requests
import yaml

logger = logging.getLogger(__name__)

@dataclass
class Extension:
    """Represents a VS Code extension"""
    id: str
    name: str
    version: str
    publisher: str
    category: str
    description: str
    required: bool = False
    auto_install: bool = False
    sanctuary_optimized: bool = False
    config: Dict[str, Any] = None

@dataclass
class WorkspaceConfig:
    """Represents workspace configuration for a project"""
    project_type: str
    language: str
    framework: Optional[str]
    database: Optional[str]
    deployment: str
    extensions: List[str]
    environment_vars: Dict[str, str]
    startup_commands: List[str]
    port_forwards: List[int]

class MamaBearExtensionManager:
    """
    Centralized extension and workspace management for GitHub Codespaces
    Provides Mama Bear with complete control over development environments
    """
    
    def __init__(self):
        self.sanctuary_root = Path("/workspaces/Podplay-Sanctuary")
        self.extensions_dir = self.sanctuary_root / ".mama-bear" / "extensions"
        self.configs_dir = self.sanctuary_root / ".mama-bear" / "configs"
        self.marketplace_dir = self.sanctuary_root / ".mama-bear" / "marketplace"
        
        # Ensure directories exist
        for directory in [self.extensions_dir, self.configs_dir, self.marketplace_dir]:
            directory.mkdir(parents=True, exist_ok=True)
        
        # Core Mama Bear Extensions
        self.core_extensions = {
            "mama-bear.control-panel": Extension(
                id="mama-bear.control-panel",
                name="Mama Bear Control Panel",
                version="1.0.0",
                publisher="mama-bear",
                category="core",
                description="Centralized sanctuary dashboard and control system",
                required=True,
                auto_install=True,
                sanctuary_optimized=True,
                config={
                    "dashboard_port": 3001,
                    "monitoring_enabled": True,
                    "auto_backup": True
                }
            ),
            "podplay.scout-agent": Extension(
                id="podplay.scout-agent",
                name="Podplay Scout Agent",
                version="1.0.0",
                publisher="podplay",
                category="core",
                description="Automated project discovery and deployment",
                required=True,
                auto_install=True,
                sanctuary_optimized=True,
                config={
                    "auto_discovery": True,
                    "vps_integration": True,
                    "plan_to_production": True
                }
            ),
            "sanctuary.env-manager": Extension(
                id="sanctuary.env-manager",
                name="Sanctuary Environment Manager",
                version="1.0.0",
                publisher="sanctuary",
                category="core",
                description="Automatic environment setup and synchronization",
                required=True,
                auto_install=True,
                sanctuary_optimized=True,
                config={
                    "auto_configure": True,
                    "sync_settings": True,
                    "package_management": True
                }
            )
        }
        
        # Project-specific extension templates
        self.project_templates = {
            "react": {
                "extensions": [
                    "ms-vscode.vscode-typescript-next",
                    "bradlc.vscode-tailwindcss",
                    "esbenp.prettier-vscode",
                    "ms-vscode.vscode-eslint",
                    "formulahendry.auto-rename-tag"
                ],
                "environment": {
                    "NODE_ENV": "development",
                    "REACT_APP_SANCTUARY": "true"
                },
                "ports": [3000, 3001],
                "startup": ["npm install", "npm start"]
            },
            "python": {
                "extensions": [
                    "ms-python.python",
                    "ms-python.pylint",
                    "ms-python.black-formatter",
                    "ms-toolsai.jupyter",
                    "ms-python.autopep8"
                ],
                "environment": {
                    "PYTHONPATH": "/workspaces",
                    "SANCTUARY_MODE": "development"
                },
                "ports": [8000, 8001],
                "startup": ["pip install -r requirements.txt", "python -m uvicorn main:app --reload --host 0.0.0.0"]
            },
            "node": {
                "extensions": [
                    "ms-vscode.vscode-typescript-next",
                    "ms-vscode.vscode-eslint",
                    "esbenp.prettier-vscode",
                    "christian-kohler.npm-intellisense"
                ],
                "environment": {
                    "NODE_ENV": "development",
                    "SANCTUARY_NODE": "true"
                },
                "ports": [3000, 8080],
                "startup": ["npm install", "npm run dev"]
            },
            "next": {
                "extensions": [
                    "ms-vscode.vscode-typescript-next",
                    "bradlc.vscode-tailwindcss",
                    "esbenp.prettier-vscode",
                    "ms-vscode.vscode-eslint",
                    "formulahendry.auto-rename-tag"
                ],
                "environment": {
                    "NODE_ENV": "development",
                    "NEXT_TELEMETRY_DISABLED": "1",
                    "SANCTUARY_NEXT": "true"
                },
                "ports": [3000, 3001],
                "startup": ["npm install", "npm run dev"]
            }
        }
        
        self.installed_extensions = self._load_installed_extensions()
        logger.info("🐻 Mama Bear Extension Manager initialized")
    
    def _load_installed_extensions(self) -> Dict[str, Extension]:
        """Load currently installed extensions"""
        try:
            result = subprocess.run(
                ["code", "--list-extensions", "--show-versions"],
                capture_output=True,
                text=True
            )
            
            installed = {}
            for line in result.stdout.strip().split('\n'):
                if '@' in line:
                    ext_id, version = line.split('@')
                    installed[ext_id] = Extension(
                        id=ext_id,
                        name=ext_id.split('.')[-1],
                        version=version,
                        publisher=ext_id.split('.')[0],
                        category="installed",
                        description="Currently installed extension"
                    )
            
            return installed
        except Exception as e:
            logger.warning(f"⚠️ Could not load installed extensions: {e}")
            return {}
    
    async def install_extension(self, extension_id: str, force: bool = False) -> bool:
        """Install a VS Code extension"""
        try:
            if extension_id in self.installed_extensions and not force:
                logger.info(f"📦 Extension {extension_id} already installed")
                return True
            
            logger.info(f"🔽 Installing extension: {extension_id}")
            result = subprocess.run(
                ["code", "--install-extension", extension_id],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info(f"✅ Extension {extension_id} installed successfully")
                # Reload installed extensions
                self.installed_extensions = self._load_installed_extensions()
                return True
            else:
                logger.error(f"❌ Failed to install {extension_id}: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Extension installation failed: {e}")
            return False
    
    async def install_core_extensions(self) -> bool:
        """Install all core Mama Bear extensions"""
        logger.info("🐻 Installing core Mama Bear extensions...")
        
        success_count = 0
        for ext_id, extension in self.core_extensions.items():
            if await self.install_extension(ext_id):
                success_count += 1
                
                # Apply extension configuration
                await self._apply_extension_config(extension)
        
        logger.info(f"✅ Installed {success_count}/{len(self.core_extensions)} core extensions")
        return success_count == len(self.core_extensions)
    
    async def _apply_extension_config(self, extension: Extension) -> bool:
        """Apply configuration for an extension"""
        if not extension.config:
            return True
        
        try:
            settings_path = Path.home() / ".vscode-server" / "data" / "Machine" / "settings.json"
            
            # Load existing settings
            if settings_path.exists():
                with open(settings_path, 'r') as f:
                    settings = json.load(f)
            else:
                settings = {}
            
            # Apply extension-specific settings
            for key, value in extension.config.items():
                settings[f"{extension.id}.{key}"] = value
            
            # Save updated settings
            settings_path.parent.mkdir(parents=True, exist_ok=True)
            with open(settings_path, 'w') as f:
                json.dump(settings, f, indent=2)
            
            logger.info(f"⚙️ Applied configuration for {extension.name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to apply config for {extension.name}: {e}")
            return False
    
    async def detect_project_type(self, workspace_path: Path = None) -> str:
        """Automatically detect project type from workspace"""
        workspace_path = workspace_path or self.sanctuary_root
        
        # Check for specific files that indicate project type
        if (workspace_path / "package.json").exists():
            try:
                with open(workspace_path / "package.json", 'r') as f:
                    package_json = json.load(f)
                
                dependencies = {**package_json.get('dependencies', {}), 
                              **package_json.get('devDependencies', {})}
                
                if 'next' in dependencies:
                    return 'next'
                elif 'react' in dependencies:
                    return 'react'
                else:
                    return 'node'
                    
            except Exception:
                return 'node'
        
        elif (workspace_path / "requirements.txt").exists() or (workspace_path / "pyproject.toml").exists():
            return 'python'
        
        elif (workspace_path / "Cargo.toml").exists():
            return 'rust'
        
        elif (workspace_path / "go.mod").exists():
            return 'go'
        
        elif (workspace_path / "composer.json").exists():
            return 'php'
        
        else:
            return 'general'
    
    async def auto_configure_workspace(self, project_type: str = None) -> WorkspaceConfig:
        """Automatically configure workspace based on detected project type"""
        if not project_type:
            project_type = await self.detect_project_type()
        
        logger.info(f"🎯 Auto-configuring workspace for {project_type} project")
        
        # Get template for project type
        template = self.project_templates.get(project_type, {})
        
        # Install project-specific extensions
        extensions = template.get('extensions', [])
        for ext_id in extensions:
            await self.install_extension(ext_id)
        
        # Create workspace configuration
        config = WorkspaceConfig(
            project_type=project_type,
            language=self._get_primary_language(project_type),
            framework=self._get_framework(project_type),
            database=self._detect_database(),
            deployment="docker",
            extensions=extensions,
            environment_vars=template.get('environment', {}),
            startup_commands=template.get('startup', []),
            port_forwards=template.get('ports', [])
        )
        
        # Save configuration
        await self._save_workspace_config(config)
        
        # Generate devcontainer.json
        await self._generate_devcontainer(config)
        
        logger.info(f"✅ Workspace configured for {project_type}")
        return config
    
    def _get_primary_language(self, project_type: str) -> str:
        """Get primary language for project type"""
        language_map = {
            'react': 'typescript',
            'next': 'typescript',
            'node': 'javascript',
            'python': 'python',
            'rust': 'rust',
            'go': 'go',
            'php': 'php'
        }
        return language_map.get(project_type, 'javascript')
    
    def _get_framework(self, project_type: str) -> Optional[str]:
        """Get framework for project type"""
        framework_map = {
            'react': 'React',
            'next': 'Next.js',
            'python': 'FastAPI'
        }
        return framework_map.get(project_type)
    
    def _detect_database(self) -> Optional[str]:
        """Detect database from project files"""
        # Simple detection logic - can be enhanced
        if (self.sanctuary_root / "docker-compose.yml").exists():
            try:
                with open(self.sanctuary_root / "docker-compose.yml", 'r') as f:
                    compose_content = f.read()
                
                if 'postgres' in compose_content:
                    return 'postgresql'
                elif 'mongo' in compose_content:
                    return 'mongodb'
                elif 'redis' in compose_content:
                    return 'redis'
            except Exception:
                pass
        
        return None
    
    async def _save_workspace_config(self, config: WorkspaceConfig) -> bool:
        """Save workspace configuration"""
        try:
            config_file = self.configs_dir / "workspace.json"
            with open(config_file, 'w') as f:
                json.dump(asdict(config), f, indent=2)
            
            logger.info("💾 Workspace configuration saved")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to save workspace config: {e}")
            return False
    
    async def _generate_devcontainer(self, config: WorkspaceConfig) -> bool:
        """Generate devcontainer.json for the workspace"""
        try:
            devcontainer_dir = self.sanctuary_root / ".devcontainer"
            devcontainer_dir.mkdir(exist_ok=True)
            
            devcontainer_config = {
                "name": f"Podplay Sanctuary - {config.project_type.title()}",
                "image": self._get_base_image(config.language),
                "features": {
                    "ghcr.io/devcontainers/features/node:1": {
                        "version": "lts"
                    },
                    "ghcr.io/devcontainers/features/python:1": {
                        "version": "3.11"
                    },
                    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
                    "ghcr.io/devcontainers/features/git:1": {}
                },
                "customizations": {
                    "vscode": {
                        "extensions": config.extensions + list(self.core_extensions.keys()),
                        "settings": {
                            "mama-bear.sanctuary.enabled": True,
                            "mama-bear.sanctuary.project-type": config.project_type,
                            "terminal.integrated.defaultProfile.linux": "bash"
                        }
                    }
                },
                "forwardPorts": config.port_forwards,
                "postCreateCommand": " && ".join(config.startup_commands) if config.startup_commands else None,
                "remoteEnv": config.environment_vars
            }
            
            devcontainer_file = devcontainer_dir / "devcontainer.json"
            with open(devcontainer_file, 'w') as f:
                json.dump(devcontainer_config, f, indent=2)
            
            logger.info("📦 Generated devcontainer.json")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to generate devcontainer: {e}")
            return False
    
    def _get_base_image(self, language: str) -> str:
        """Get appropriate base image for language"""
        image_map = {
            'typescript': 'mcr.microsoft.com/devcontainers/typescript-node:18',
            'javascript': 'mcr.microsoft.com/devcontainers/javascript-node:18',
            'python': 'mcr.microsoft.com/devcontainers/python:3.11',
            'rust': 'mcr.microsoft.com/devcontainers/rust:1',
            'go': 'mcr.microsoft.com/devcontainers/go:1.21',
            'php': 'mcr.microsoft.com/devcontainers/php:8.2'
        }
        return image_map.get(language, 'mcr.microsoft.com/devcontainers/universal:2')
    
    async def sync_extensions_across_codespaces(self, user_id: str = "default") -> bool:
        """Synchronize extensions across all user codespaces"""
        logger.info("🔄 Synchronizing extensions across codespaces...")
        
        try:
            # Create extension sync file
            sync_config = {
                "user_id": user_id,
                "timestamp": asyncio.get_event_loop().time(),
                "core_extensions": list(self.core_extensions.keys()),
                "installed_extensions": list(self.installed_extensions.keys()),
                "workspace_configs": await self._get_all_workspace_configs()
            }
            
            sync_file = self.configs_dir / "extension_sync.json"
            with open(sync_file, 'w') as f:
                json.dump(sync_config, f, indent=2)
            
            logger.info("✅ Extension synchronization completed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Extension sync failed: {e}")
            return False
    
    async def _get_all_workspace_configs(self) -> List[Dict[str, Any]]:
        """Get all workspace configurations"""
        configs = []
        
        try:
            for config_file in self.configs_dir.glob("*.json"):
                if config_file.name != "extension_sync.json":
                    with open(config_file, 'r') as f:
                        configs.append(json.load(f))
        except Exception as e:
            logger.warning(f"⚠️ Could not load workspace configs: {e}")
        
        return configs
    
    def get_extension_marketplace(self) -> Dict[str, Any]:
        """Get extension marketplace information"""
        return {
            "core_extensions": {ext_id: asdict(ext) for ext_id, ext in self.core_extensions.items()},
            "project_templates": self.project_templates,
            "installed_extensions": {ext_id: asdict(ext) for ext_id, ext in self.installed_extensions.items()},
            "statistics": {
                "total_core": len(self.core_extensions),
                "total_installed": len(self.installed_extensions),
                "total_templates": len(self.project_templates)
            }
        }

# Global instance
mama_bear_extension_manager = MamaBearExtensionManager()
