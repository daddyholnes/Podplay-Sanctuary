"""
Environment Selection Manager for Podplay Build Sanctuary
Manages selection between different development/deployment environments:
- Free: GitHub Codespaces, Replit
- Paid VPS: RackNerd, GreenCloud  
- Full VM: Oracle Cloud Infrastructure
Integrates with Scout Agent plan-to-production workflow
"""

import os
import logging
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import json

logger = logging.getLogger(__name__)

class EnvironmentTier(Enum):
    FREE = "free"
    VPS = "vps"
    FULL_VM = "full_vm"

class EnvironmentType(Enum):
    CODESPACES = "codespaces"
    REPLIT = "replit"
    RACKNERD = "racknerd"
    GREENCLOUD = "greencloud"
    ORACLE = "oracle"

@dataclass
class EnvironmentOption:
    """Represents an available environment option"""
    type: EnvironmentType
    tier: EnvironmentTier
    name: str
    description: str
    cost_per_month: float
    cpu_cores: float
    memory_gb: float
    storage_gb: int
    api_key_required: bool
    always_free_option: bool
    best_for: List[str]
    limitations: List[str]
    setup_time_minutes: int

@dataclass
class EnvironmentRecommendation:
    """Represents an environment recommendation"""
    primary: EnvironmentOption
    alternatives: List[EnvironmentOption]
    reasoning: str
    estimated_cost: float
    setup_complexity: str  # "simple", "moderate", "complex"

class EnvironmentSelector:
    """
    Intelligent environment selection based on project requirements
    Provides recommendations and manages environment switching
    """
    
    def __init__(self):
        self.environments = self._initialize_environments()
        self.selection_mode = os.getenv('ENVIRONMENT_SELECTION_MODE', 'plan_based')
        self.default_environment = os.getenv('DEFAULT_ENVIRONMENT', 'codespaces')
        
        logger.info(f"🎯 Environment Selector initialized - Mode: {self.selection_mode}")
    
    def _initialize_environments(self) -> Dict[EnvironmentType, EnvironmentOption]:
        """Initialize available environment options"""
        return {
            EnvironmentType.CODESPACES: EnvironmentOption(
                type=EnvironmentType.CODESPACES,
                tier=EnvironmentTier.FREE,
                name="GitHub Codespaces",
                description="Cloud-hosted VS Code development environment",
                cost_per_month=0.0,  # Free tier: 120 hours/month
                cpu_cores=2.0,
                memory_gb=8.0,
                storage_gb=32,
                api_key_required=False,  # Just needs GitHub account
                always_free_option=True,
                best_for=["Web development", "Quick prototyping", "Learning", "Small projects"],
                limitations=["120 hours/month limit", "No root access", "Limited customization"],
                setup_time_minutes=2
            ),
            
            EnvironmentType.REPLIT: EnvironmentOption(
                type=EnvironmentType.REPLIT,
                tier=EnvironmentTier.FREE,
                name="Replit",
                description="Browser-based collaborative coding platform",
                cost_per_month=0.0,  # Free tier available
                cpu_cores=1.0,
                memory_gb=1.0,
                storage_gb=20,
                api_key_required=False,  # Just needs Replit account
                always_free_option=True,
                best_for=["Learning", "Collaboration", "Quick demos", "Education"],
                limitations=["Limited resources", "Public repos on free tier", "Basic terminal"],
                setup_time_minutes=1
            ),
            
            EnvironmentType.RACKNERD: EnvironmentOption(
                type=EnvironmentType.RACKNERD,
                tier=EnvironmentTier.VPS,
                name="RackNerd VPS",
                description="Affordable cloud VPS with full root access",
                cost_per_month=2.49,  # Starting price
                cpu_cores=1.0,
                memory_gb=0.768,
                storage_gb=15,
                api_key_required=True,
                always_free_option=False,
                best_for=["Production apps", "Full Linux control", "Docker hosting", "Databases"],
                limitations=["Requires Linux knowledge", "Manual setup", "No GUI by default"],
                setup_time_minutes=10
            ),
            
            EnvironmentType.GREENCLOUD: EnvironmentOption(
                type=EnvironmentType.GREENCLOUD,
                tier=EnvironmentTier.VPS,
                name="GreenCloud VPS",
                description="Eco-friendly VPS hosting with solid performance",
                cost_per_month=2.95,  # Starting price
                cpu_cores=1.0,
                memory_gb=0.512,
                storage_gb=10,
                api_key_required=True,
                always_free_option=False,
                best_for=["Sustainable hosting", "Small web apps", "Development servers"],
                limitations=["Requires Linux knowledge", "Manual configuration", "Limited support"],
                setup_time_minutes=10
            ),
            
            EnvironmentType.ORACLE: EnvironmentOption(
                type=EnvironmentType.ORACLE,
                tier=EnvironmentTier.FULL_VM,
                name="Oracle Cloud Infrastructure",
                description="Enterprise-grade cloud VMs with Always Free tier",
                cost_per_month=0.0,  # Always Free tier available
                cpu_cores=4.0,  # Ampere ARM
                memory_gb=24.0,
                storage_gb=200,
                api_key_required=True,
                always_free_option=True,
                best_for=["Production workloads", "High performance", "Enterprise apps", "Free hosting"],
                limitations=["Complex setup", "Requires OCI knowledge", "API configuration needed"],
                setup_time_minutes=30
            )
        }
    
    def analyze_project_requirements(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project to determine environment requirements"""
        
        # Extract project characteristics
        project_type = project_data.get('type', 'web')
        complexity = project_data.get('complexity', 'simple')
        expected_users = project_data.get('expected_users', 10)
        database_required = project_data.get('database', False)
        docker_required = project_data.get('docker', False)
        production_ready = project_data.get('production', False)
        budget = project_data.get('budget', 0.0)
        
        requirements = {
            "tier_needed": EnvironmentTier.FREE,
            "min_cpu": 1.0,
            "min_memory": 1.0,
            "min_storage": 10,
            "root_access_needed": False,
            "persistent_storage": False,
            "custom_networking": False,
            "reasoning": []
        }
        
        # Analyze requirements
        if production_ready:
            requirements["tier_needed"] = EnvironmentTier.FULL_VM
            requirements["persistent_storage"] = True
            requirements["reasoning"].append("Production deployment requires reliable infrastructure")
        
        if database_required:
            requirements["tier_needed"] = max(requirements["tier_needed"], EnvironmentTier.VPS, key=lambda x: x.value)
            requirements["root_access_needed"] = True
            requirements["min_memory"] = max(requirements["min_memory"], 2.0)
            requirements["reasoning"].append("Database hosting requires VPS or higher")
        
        if docker_required:
            requirements["tier_needed"] = max(requirements["tier_needed"], EnvironmentTier.VPS, key=lambda x: x.value)
            requirements["root_access_needed"] = True
            requirements["reasoning"].append("Docker requires root access and VPS capabilities")
        
        if expected_users > 100:
            requirements["tier_needed"] = EnvironmentTier.FULL_VM
            requirements["min_cpu"] = 2.0
            requirements["min_memory"] = 4.0
            requirements["reasoning"].append("High traffic requires dedicated VM resources")
        
        if complexity == 'complex':
            requirements["min_cpu"] = max(requirements["min_cpu"], 2.0)
            requirements["min_memory"] = max(requirements["min_memory"], 4.0)
            requirements["reasoning"].append("Complex projects need more computational resources")
        
        return requirements
    
    def get_environment_recommendations(
        self, 
        project_data: Dict[str, Any],
        budget_limit: float = None
    ) -> EnvironmentRecommendation:
        """Get environment recommendations based on project requirements"""
        
        requirements = self.analyze_project_requirements(project_data)
        suitable_environments = []
        
        # Filter environments based on requirements
        for env_type, env_option in self.environments.items():
            # Check tier compatibility
            if requirements["tier_needed"] == EnvironmentTier.FREE and env_option.tier != EnvironmentTier.FREE:
                if not env_option.always_free_option:
                    continue
            
            # Check resource requirements
            if (env_option.cpu_cores >= requirements["min_cpu"] and
                env_option.memory_gb >= requirements["min_memory"] and
                env_option.storage_gb >= requirements["min_storage"]):
                
                # Check budget constraints
                if budget_limit is None or env_option.cost_per_month <= budget_limit:
                    suitable_environments.append(env_option)
        
        # Sort by suitability score
        suitable_environments.sort(key=lambda x: self._calculate_suitability_score(x, requirements))
        
        if not suitable_environments:
            # Fallback to default
            primary = self.environments[EnvironmentType.CODESPACES]
            alternatives = []
            reasoning = "No environments meet requirements; using default free option"
        else:
            primary = suitable_environments[0]
            alternatives = suitable_environments[1:3]  # Top 3 alternatives
            reasoning = self._generate_reasoning(primary, requirements)
        
        return EnvironmentRecommendation(
            primary=primary,
            alternatives=alternatives,
            reasoning=reasoning,
            estimated_cost=primary.cost_per_month,
            setup_complexity=self._get_setup_complexity(primary)
        )
    
    def _calculate_suitability_score(
        self, 
        env: EnvironmentOption, 
        requirements: Dict[str, Any]
    ) -> float:
        """Calculate suitability score for an environment"""
        score = 0.0
        
        # Resource adequacy (higher is better)
        cpu_ratio = env.cpu_cores / requirements["min_cpu"]
        memory_ratio = env.memory_gb / requirements["min_memory"]
        storage_ratio = env.storage_gb / requirements["min_storage"]
        
        score += min(cpu_ratio, 2.0) * 10  # Cap at 2x requirement
        score += min(memory_ratio, 2.0) * 10
        score += min(storage_ratio, 2.0) * 5
        
        # Cost efficiency (lower cost is better)
        if env.cost_per_month == 0:
            score += 20  # Bonus for free
        else:
            score += max(0, 20 - env.cost_per_month)  # Penalty for high cost
        
        # Setup simplicity (lower setup time is better)
        score += max(0, 20 - env.setup_time_minutes / 2)
        
        # Always free option bonus
        if env.always_free_option:
            score += 10
        
        # Tier preference based on requirements
        if requirements["tier_needed"] == env.tier:
            score += 15
        
        return score
    
    def _generate_reasoning(
        self, 
        env: EnvironmentOption, 
        requirements: Dict[str, Any]
    ) -> str:
        """Generate human-readable reasoning for recommendation"""
        
        reasons = []
        
        if env.cost_per_month == 0:
            reasons.append("free tier available")
        elif env.cost_per_month < 5:
            reasons.append("very affordable")
        
        if env.cpu_cores >= requirements["min_cpu"] * 1.5:
            reasons.append("excellent performance")
        elif env.cpu_cores >= requirements["min_cpu"]:
            reasons.append("adequate performance")
        
        if env.setup_time_minutes <= 5:
            reasons.append("quick setup")
        
        if env.always_free_option:
            reasons.append("has free tier option")
        
        reasoning = f"Recommended because it offers {', '.join(reasons)}"
        
        if requirements["reasoning"]:
            reasoning += f". {' '.join(requirements['reasoning'])}"
        
        return reasoning
    
    def _get_setup_complexity(self, env: EnvironmentOption) -> str:
        """Determine setup complexity level"""
        if env.setup_time_minutes <= 5:
            return "simple"
        elif env.setup_time_minutes <= 15:
            return "moderate"
        else:
            return "complex"
    
    def get_api_key_requirements(self) -> Dict[str, Dict[str, Any]]:
        """Get API key requirements for each environment"""
        
        requirements = {}
        
        for env_type, env_option in self.environments.items():
            if env_option.api_key_required:
                env_name = env_type.value
                
                if env_name == "racknerd":
                    requirements[env_name] = {
                        "required": True,
                        "env_var": "RACKNERD_API_KEY",
                        "description": "RackNerd API key from your client portal",
                        "signup_url": "https://my.racknerd.com/register.php",
                        "documentation": "https://my.racknerd.com/api-docs"
                    }
                elif env_name == "greencloud":
                    requirements[env_name] = {
                        "required": True,
                        "env_var": "GREENCLOUD_API_KEY",
                        "description": "GreenCloud VPS API key from your dashboard",
                        "signup_url": "https://greencloudvps.com/register",
                        "documentation": "https://greencloudvps.com/api-docs"
                    }
                elif env_name == "oracle":
                    requirements[env_name] = {
                        "required": True,
                        "env_vars": [
                            "OCI_USER_ID",
                            "OCI_FINGERPRINT", 
                            "OCI_TENANCY_ID",
                            "OCI_COMPARTMENT_ID",
                            "OCI_PRIVATE_KEY_PATH"
                        ],
                        "description": "Oracle Cloud Infrastructure API configuration",
                        "signup_url": "https://cloud.oracle.com/en_US/tryit",
                        "documentation": "https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm"
                    }
            else:
                requirements[env_type.value] = {
                    "required": False,
                    "description": f"No API key needed - just sign up for {env_option.name}"
                }
        
        return requirements
    
    def generate_environment_switcher_ui(self) -> Dict[str, Any]:
        """Generate UI configuration for environment switching"""
        
        return {
            "title": "Choose Development Environment",
            "description": "Select the best environment for your project based on requirements and budget",
            "categories": {
                "free": {
                    "title": "Free Tier",
                    "description": "Perfect for learning, prototyping, and small projects",
                    "environments": [
                        asdict(env) for env in self.environments.values() 
                        if env.tier == EnvironmentTier.FREE
                    ]
                },
                "vps": {
                    "title": "VPS Hosting",
                    "description": "Affordable virtual servers with full control",
                    "environments": [
                        asdict(env) for env in self.environments.values() 
                        if env.tier == EnvironmentTier.VPS
                    ]
                },
                "full_vm": {
                    "title": "Full Virtual Machines",
                    "description": "Enterprise-grade cloud infrastructure",
                    "environments": [
                        asdict(env) for env in self.environments.values() 
                        if env.tier == EnvironmentTier.FULL_VM
                    ]
                }
            },
            "selection_modes": {
                "plan_based": "Automatically select based on project analysis",
                "user_choice": "Let user manually choose environment",
                "auto_optimal": "Always choose the most cost-effective option"
            },
            "api_requirements": self.get_api_key_requirements()
        }

# Global instance
environment_selector = EnvironmentSelector()
