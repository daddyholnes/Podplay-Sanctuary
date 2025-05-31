"""
MCP Server Data Model

Defines the core data structures for Model Context Protocol servers including
categories, server specifications, and validation logic for the Podplay
Sanctuary marketplace system.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Dict, Any, Optional
from datetime import datetime

class MCPCategory(Enum):
    """Comprehensive categorization system for MCP servers based on functionality"""
    
    # Core Infrastructure
    DATABASE = "database"
    CLOUD_SERVICES = "cloud_services"
    FILE_SYSTEM = "file_system"
    
    # Development Tools
    DEVELOPMENT_TOOLS = "development_tools"
    WEB_APIS = "web_apis"
    SECURITY = "security"
    MONITORING = "monitoring"
    
    # AI and Machine Learning
    AI_ML = "ai_ml"
    
    # Communication and Productivity
    COMMUNICATION = "communication"
    PRODUCTIVITY = "productivity"
    CONTENT_MANAGEMENT = "content_management"
    
    # Data and Search
    SEARCH_DATA = "search_data"
    
    def __str__(self) -> str:
        """Return human-readable category name"""
        return self.value.replace('_', ' ').title()
    
    @classmethod
    def get_category_info(cls) -> Dict[str, Dict[str, str]]:
        """Get comprehensive category information with descriptions"""
        return {
            cls.DATABASE.value: {
                "name": "Database",
                "description": "Database operations, SQL queries, and data management tools",
                "examples": ["PostgreSQL", "MySQL", "MongoDB", "SQLite"]
            },
            cls.CLOUD_SERVICES.value: {
                "name": "Cloud Services",
                "description": "Cloud provider integrations and infrastructure management",
                "examples": ["AWS", "Azure", "Google Cloud", "DigitalOcean"]
            },
            cls.DEVELOPMENT_TOOLS.value: {
                "name": "Development Tools",
                "description": "Version control, CI/CD, and development workflow tools",
                "examples": ["GitHub", "GitLab", "Jenkins", "Docker"]
            },
            cls.COMMUNICATION.value: {
                "name": "Communication",
                "description": "Team communication and collaboration platforms",
                "examples": ["Slack", "Discord", "Microsoft Teams", "Telegram"]
            },
            cls.AI_ML.value: {
                "name": "AI & Machine Learning",
                "description": "AI model integrations and machine learning tools",
                "examples": ["OpenAI", "Anthropic", "Hugging Face", "TensorFlow"]
            },
            cls.PRODUCTIVITY.value: {
                "name": "Productivity",
                "description": "Task management, calendars, and productivity enhancement",
                "examples": ["Notion", "Trello", "Asana", "Google Calendar"]
            },
            cls.SEARCH_DATA.value: {
                "name": "Search & Data",
                "description": "Search engines, data processing, and information retrieval",
                "examples": ["Brave Search", "Elasticsearch", "Algolia", "Pinecone"]
            },
            cls.WEB_APIS.value: {
                "name": "Web APIs",
                "description": "REST APIs, GraphQL, and web service integrations",
                "examples": ["REST APIs", "GraphQL", "Webhooks", "API Gateways"]
            },
            cls.SECURITY.value: {
                "name": "Security",
                "description": "Security scanning, vulnerability assessment, and compliance",
                "examples": ["Vault", "1Password", "Security scanners", "Compliance tools"]
            },
            cls.MONITORING.value: {
                "name": "Monitoring",
                "description": "System monitoring, logging, and observability tools",
                "examples": ["Prometheus", "Grafana", "DataDog", "New Relic"]
            },
            cls.CONTENT_MANAGEMENT.value: {
                "name": "Content Management",
                "description": "Content creation, management, and publishing systems",
                "examples": ["WordPress", "Strapi", "Contentful", "Ghost"]
            },
            cls.FILE_SYSTEM.value: {
                "name": "File System",
                "description": "File operations, storage, and document management",
                "examples": ["Local files", "S3", "Google Drive", "Dropbox"]
            }
        }

@dataclass
class MCPServerConfiguration:
    """Configuration schema definition for MCP server setup"""
    
    required_fields: List[str] = field(default_factory=list)
    optional_fields: List[str] = field(default_factory=list)
    field_types: Dict[str, str] = field(default_factory=dict)
    validation_rules: Dict[str, Any] = field(default_factory=dict)
    
    def validate_configuration(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate configuration against schema requirements
        
        Args:
            config: Configuration dictionary to validate
            
        Returns:
            Validation result with success status and error details
        """
        errors = []
        
        # Check required fields
        for field_name in self.required_fields:
            if field_name not in config:
                errors.append(f"Required field '{field_name}' is missing")
        
        # Validate field types
        for field_name, expected_type in self.field_types.items():
            if field_name in config:
                value = config[field_name]
                if expected_type == "string" and not isinstance(value, str):
                    errors.append(f"Field '{field_name}' must be a string")
                elif expected_type == "number" and not isinstance(value, (int, float)):
                    errors.append(f"Field '{field_name}' must be a number")
                elif expected_type == "boolean" and not isinstance(value, bool):
                    errors.append(f"Field '{field_name}' must be a boolean")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "validated_config": config if len(errors) == 0 else None
        }

@dataclass
class MCPServer:
    """
    Comprehensive MCP Server data model with full metadata and functionality tracking
    
    This model represents a complete MCP server specification including installation,
    configuration, popularity metrics, and integration capabilities for the Podplay
    Sanctuary development environment.
    """
    
    # Core Identity
    name: str
    description: str
    repository_url: str
    author: str
    
    # Classification and Versioning
    category: MCPCategory
    version: str
    tags: List[str] = field(default_factory=list)
    
    # Installation and Dependencies
    installation_method: str = "npm"  # npm, pip, docker, binary, manual
    dependencies: List[str] = field(default_factory=list)
    capabilities: List[str] = field(default_factory=list)
    
    # Configuration
    configuration_schema: Dict[str, Any] = field(default_factory=dict)
    
    # Metrics and Status
    popularity_score: int = 0
    last_updated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    
    # Official and Installation Status
    is_official: bool = False
    is_installed: bool = False
    installation_status: str = "not_installed"  # not_installed, installing, installed, error
    
    # Timestamps
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    def __post_init__(self):
        """Post-initialization validation and defaults"""
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()
        
        # Ensure category is MCPCategory enum
        if isinstance(self.category, str):
            try:
                self.category = MCPCategory(self.category)
            except ValueError:
                self.category = MCPCategory.DEVELOPMENT_TOOLS
    
    def get_configuration_schema(self) -> MCPServerConfiguration:
        """
        Get structured configuration schema for this server
        
        Returns:
            MCPServerConfiguration object with validation rules
        """
        schema_data = self.configuration_schema
        
        return MCPServerConfiguration(
            required_fields=schema_data.get('required', []),
            optional_fields=schema_data.get('optional', []),
            field_types=schema_data.get('types', {}),
            validation_rules=schema_data.get('validation', {})
        )
    
    def is_compatible_with(self, environment: Dict[str, Any]) -> bool:
        """
        Check if server is compatible with given environment
        
        Args:
            environment: Environment specification dictionary
            
        Returns:
            Compatibility status boolean
        """
        # Check installation method compatibility
        available_methods = environment.get('installation_methods', [])
        if self.installation_method not in available_methods:
            return False
        
        # Check dependency availability
        available_deps = environment.get('available_dependencies', [])
        for dep in self.dependencies:
            if dep not in available_deps:
                return False
        
        return True
    
    def get_installation_command(self) -> str:
        """
        Generate installation command based on installation method
        
        Returns:
            Installation command string
        """
        if self.installation_method == "npm":
            return f"npm install {self.name}"
        elif self.installation_method == "pip":
            return f"pip install {self.name}"
        elif self.installation_method == "docker":
            return f"docker pull {self.name}"
        else:
            return f"# Manual installation required - see {self.repository_url}"
    
    def update_popularity_score(self, github_data: Optional[Dict] = None) -> int:
        """
        Update popularity score based on GitHub metrics or other signals
        
        Args:
            github_data: Optional GitHub repository data for scoring
            
        Returns:
            Updated popularity score
        """
        if github_data:
            stars = github_data.get('stargazers_count', 0)
            forks = github_data.get('forks_count', 0)
            watchers = github_data.get('watchers_count', 0)
            
            # Weighted scoring algorithm
            score = (stars * 2) + forks + (watchers * 0.5)
            
            # Bonus for official servers
            if self.is_official:
                score *= 1.2
            
            # Bonus for recent updates
            try:
                last_update = datetime.fromisoformat(self.last_updated.replace('Z', '+00:00'))
                days_since_update = (datetime.now() - last_update).days
                if days_since_update < 30:
                    score *= 1.1
            except:
                pass
            
            self.popularity_score = min(int(score), 100)  # Cap at 100
        
        return self.popularity_score
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert server to dictionary representation for API serialization
        
        Returns:
            Dictionary representation of the MCP server
        """
        return {
            "name": self.name,
            "description": self.description,
            "repository_url": self.repository_url,
            "author": self.author,
            "category": self.category.value,
            "version": self.version,
            "tags": self.tags,
            "installation_method": self.installation_method,
            "dependencies": self.dependencies,
            "capabilities": self.capabilities,
            "configuration_schema": self.configuration_schema,
            "popularity_score": self.popularity_score,
            "last_updated": self.last_updated,
            "is_official": self.is_official,
            "is_installed": self.is_installed,
            "installation_status": self.installation_status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "installation_command": self.get_installation_command()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MCPServer':
        """
        Create MCPServer instance from dictionary data
        
        Args:
            data: Dictionary containing server data
            
        Returns:
            MCPServer instance
        """
        # Handle category conversion
        category = data.get('category', 'development_tools')
        if isinstance(category, str):
            try:
                category = MCPCategory(category)
            except ValueError:
                category = MCPCategory.DEVELOPMENT_TOOLS
        
        return cls(
            name=data['name'],
            description=data.get('description', ''),
            repository_url=data.get('repository_url', ''),
            author=data.get('author', ''),
            category=category,
            version=data.get('version', '1.0.0'),
            tags=data.get('tags', []),
            installation_method=data.get('installation_method', 'npm'),
            dependencies=data.get('dependencies', []),
            capabilities=data.get('capabilities', []),
            configuration_schema=data.get('configuration_schema', {}),
            popularity_score=data.get('popularity_score', 0),
            last_updated=data.get('last_updated', datetime.now().strftime("%Y-%m-%d")),
            is_official=data.get('is_official', False),
            is_installed=data.get('is_installed', False),
            installation_status=data.get('installation_status', 'not_installed'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )