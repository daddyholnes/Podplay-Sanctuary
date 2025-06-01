#!/usr/bin/env python3
"""
Mama Bear Capability System
Comprehensive feature awareness and autonomous logic for Scout Agent

This system gives Mama Bear full awareness of her capabilities and 
enables intelligent autonomous decision-making for complex tasks.
"""

import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
from utils.logging_setup import get_logger

logger = get_logger(__name__)

class CapabilityCategory(Enum):
    """Categories of Mama Bear's capabilities"""
    COMMUNICATION = "communication"
    DEVELOPMENT = "development" 
    PROJECT_MANAGEMENT = "project_management"
    SYSTEM_ADMINISTRATION = "system_administration"
    AI_INTEGRATION = "ai_integration"
    LEARNING_MEMORY = "learning_memory"
    WORKSPACE_ORCHESTRATION = "workspace_orchestration"
    ANALYSIS_INSIGHTS = "analysis_insights"

class TaskComplexity(Enum):
    """Task complexity levels for model selection"""
    SIMPLE = "simple"           # Flash model - quick responses, summaries
    MODERATE = "moderate"       # Standard model - general development
    COMPLEX = "complex"         # Pro model - deep reasoning, architecture
    MULTIMODAL = "multimodal"   # Vision models - image/file analysis

@dataclass
class Capability:
    """Individual capability definition"""
    name: str
    description: str
    category: CapabilityCategory
    requires_tools: List[str] = field(default_factory=list)
    complexity_level: TaskComplexity = TaskComplexity.MODERATE
    prerequisites: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)
    is_available: bool = True

@dataclass
class AutonomousAction:
    """Represents an autonomous action Mama Bear can take"""
    action_id: str
    name: str
    description: str
    required_capabilities: List[str]
    steps: List[str]
    success_criteria: List[str]
    estimated_duration: str
    risk_level: str = "low"

class MamaBearCapabilitySystem:
    """
    Comprehensive capability awareness and autonomous logic system for Mama Bear
    """
    
    def __init__(self):
        self.capabilities = self._initialize_capabilities()
        self.autonomous_actions = self._initialize_autonomous_actions()
        self.current_context = {}
        self.active_projects = {}
        
        logger.info("🐻 Mama Bear Capability System initialized with full feature awareness")
    
    def _initialize_capabilities(self) -> Dict[str, Capability]:
        """Initialize comprehensive capability registry"""
        capabilities = {
            # Communication & Interaction
            "chat_conversation": Capability(
                name="Intelligent Chat Conversation",
                description="Engage in natural, context-aware conversations with persistent memory",
                category=CapabilityCategory.COMMUNICATION,
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Answer technical questions with context",
                    "Provide coding assistance and guidance", 
                    "Discuss project architecture and design decisions"
                ]
            ),
            
            "proactive_suggestions": Capability(
                name="Proactive Suggestions",
                description="Anticipate needs and provide helpful suggestions before being asked",
                category=CapabilityCategory.COMMUNICATION,
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Suggest MCP servers for current project needs",
                    "Recommend architecture improvements",
                    "Identify potential technical debt areas"
                ]
            ),
            
            # Development Capabilities
            "code_analysis": Capability(
                name="Code Analysis & Review",
                description="Analyze code for quality, security, performance, and best practices",
                category=CapabilityCategory.DEVELOPMENT,
                requires_tools=["sandbox_execution", "static_analysis"],
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Review code for security vulnerabilities",
                    "Suggest performance optimizations",
                    "Identify anti-patterns and technical debt"
                ]
            ),
            
            "code_generation": Capability(
                name="Code Generation",
                description="Generate high-quality code following best practices",
                category=CapabilityCategory.DEVELOPMENT,
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Create API endpoints with proper error handling",
                    "Generate TypeScript interfaces and React components",
                    "Build database schemas and migration scripts"
                ]
            ),
            
            "sandbox_execution": Capability(
                name="Safe Code Execution",
                description="Execute code safely in isolated NixOS sandbox environments",
                category=CapabilityCategory.DEVELOPMENT,
                requires_tools=["nixos_sandbox", "docker_containers"],
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Test code snippets safely",
                    "Run data processing scripts",
                    "Validate configuration files"
                ]
            ),
            
            # Project Management
            "project_planning": Capability(
                name="Intelligent Project Planning",
                description="Break down complex projects into manageable tasks with timelines",
                category=CapabilityCategory.PROJECT_MANAGEMENT,
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Create development roadmaps",
                    "Estimate project timelines",
                    "Identify dependencies and critical paths"
                ]
            ),
            
            "daily_briefings": Capability(
                name="Daily Briefings & Status Updates",
                description="Generate comprehensive daily briefings with insights and recommendations",
                category=CapabilityCategory.PROJECT_MANAGEMENT,
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Summarize project progress and blockers",
                    "Highlight new tools and opportunities",
                    "Provide priority recommendations"
                ]
            ),
            
            # System Administration
            "workspace_orchestration": Capability(
                name="Workspace Orchestration",
                description="Create and manage development environments and VMs",
                category=CapabilityCategory.WORKSPACE_ORCHESTRATION,
                requires_tools=["libvirt", "nixos_configuration", "docker"],
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Provision new development VMs",
                    "Configure project-specific environments",
                    "Manage container deployments"
                ]
            ),
            
            "mcp_server_management": Capability(
                name="MCP Server Discovery & Management",
                description="Discover, install, and manage Model Context Protocol servers",
                category=CapabilityCategory.SYSTEM_ADMINISTRATION,
                requires_tools=["mcp_marketplace", "package_managers"],
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Find relevant MCP servers for project needs",
                    "Install and configure MCP servers",
                    "Monitor MCP server health and updates"
                ]
            ),
            
            # AI Integration
            "dynamic_model_switching": Capability(
                name="Dynamic AI Model Selection",
                description="Intelligently select optimal AI models based on task complexity",
                category=CapabilityCategory.AI_INTEGRATION,
                complexity_level=TaskComplexity.SIMPLE,
                examples=[
                    "Use Flash for quick summaries",
                    "Use Pro for complex reasoning",
                    "Use Vision models for image analysis"
                ]
            ),
            
            "multi_agent_coordination": Capability(
                name="Multi-Agent Coordination",
                description="Coordinate with other AI agents for complex tasks",
                category=CapabilityCategory.AI_INTEGRATION,
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Delegate research tasks to specialized agents",
                    "Coordinate parallel workstreams",
                    "Aggregate results from multiple agents"
                ]
            ),
            
            # Learning & Memory
            "persistent_memory": Capability(
                name="Persistent Memory & Learning",
                description="Store and retrieve context, learn from interactions",
                category=CapabilityCategory.LEARNING_MEMORY,
                requires_tools=["mem0_rag", "vector_database"],
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Remember user preferences and patterns",
                    "Learn from past project experiences",
                    "Build knowledge base from interactions"
                ]
            ),
            
            "contextual_insights": Capability(
                name="Contextual Insights & Analysis",
                description="Analyze patterns and provide intelligent insights",
                category=CapabilityCategory.ANALYSIS_INSIGHTS,
                complexity_level=TaskComplexity.COMPLEX,
                examples=[
                    "Identify development patterns and trends",
                    "Predict potential issues before they occur",
                    "Suggest optimization opportunities"
                ]
            ),
            
            # File & Documentation Management
            "documentation_generation": Capability(
                name="Intelligent Documentation",
                description="Generate and maintain comprehensive project documentation",
                category=CapabilityCategory.DEVELOPMENT,
                complexity_level=TaskComplexity.MODERATE,
                examples=[
                    "Generate API documentation from code",
                    "Create README files and guides",
                    "Maintain architectural decision records"
                ]
            ),
            
            "file_analysis": Capability(
                name="File & Project Analysis",
                description="Analyze files, dependencies, and project structure",
                category=CapabilityCategory.ANALYSIS_INSIGHTS,
                complexity_level=TaskComplexity.MULTIMODAL,
                examples=[
                    "Analyze project dependencies",
                    "Review configuration files",
                    "Examine log files for issues"
                ]
            )
        }
        
        return capabilities
    
    def _initialize_autonomous_actions(self) -> Dict[str, AutonomousAction]:
        """Initialize autonomous actions Mama Bear can perform"""
        actions = {
            "new_project_setup": AutonomousAction(
                action_id="new_project_setup",
                name="Autonomous New Project Setup",
                description="Completely set up a new development project from requirements",
                required_capabilities=[
                    "project_planning", "workspace_orchestration", 
                    "code_generation", "mcp_server_management"
                ],
                steps=[
                    "Analyze project requirements and goals",
                    "Create development roadmap and task breakdown",
                    "Provision optimal development environment",
                    "Install relevant MCP servers and tools",
                    "Generate initial project structure and boilerplate",
                    "Set up CI/CD pipeline and deployment configuration",
                    "Create comprehensive documentation"
                ],
                success_criteria=[
                    "Working development environment accessible",
                    "All required tools and dependencies installed",
                    "Initial code structure generated and tested",
                    "Documentation complete and accessible"
                ],
                estimated_duration="15-30 minutes",
                risk_level="low"
            ),
            
            "code_optimization_audit": AutonomousAction(
                action_id="code_optimization_audit",
                name="Comprehensive Code Optimization",
                description="Analyze entire codebase and implement optimizations",
                required_capabilities=[
                    "code_analysis", "sandbox_execution", 
                    "contextual_insights", "documentation_generation"
                ],
                steps=[
                    "Scan entire codebase for analysis",
                    "Identify performance bottlenecks",
                    "Analyze security vulnerabilities",
                    "Check for code quality issues",
                    "Generate optimization recommendations",
                    "Implement approved optimizations",
                    "Run comprehensive tests",
                    "Update documentation with changes"
                ],
                success_criteria=[
                    "Performance improvements measured and documented",
                    "Security issues identified and resolved",
                    "Code quality metrics improved",
                    "All tests passing"
                ],
                estimated_duration="45-90 minutes",
                risk_level="medium"
            ),
            
            "environment_troubleshooting": AutonomousAction(
                action_id="environment_troubleshooting",
                name="Development Environment Troubleshooting",
                description="Diagnose and fix development environment issues",
                required_capabilities=[
                    "workspace_orchestration", "file_analysis",
                    "sandbox_execution", "contextual_insights"
                ],
                steps=[
                    "Analyze system logs and error messages",
                    "Check configuration files for issues",
                    "Test network connectivity and services",
                    "Verify dependencies and versions",
                    "Identify root cause of issues",
                    "Implement fixes and workarounds",
                    "Test resolution and document solution"
                ],
                success_criteria=[
                    "Environment issues resolved",
                    "All services running properly",
                    "Documentation updated with solution"
                ],
                estimated_duration="20-45 minutes",
                risk_level="medium"
            ),
            
            "proactive_maintenance": AutonomousAction(
                action_id="proactive_maintenance",
                name="Proactive System Maintenance",
                description="Perform regular maintenance tasks to prevent issues",
                required_capabilities=[
                    "mcp_server_management", "contextual_insights",
                    "daily_briefings", "persistent_memory"
                ],
                steps=[
                    "Check for system and dependency updates",
                    "Analyze system performance metrics",
                    "Review and rotate logs",
                    "Check disk space and resource usage",
                    "Update MCP servers and tools",
                    "Generate maintenance report",
                    "Schedule follow-up tasks if needed"
                ],
                success_criteria=[
                    "All systems updated and healthy",
                    "Performance within normal parameters",
                    "Maintenance report generated"
                ],
                estimated_duration="15-20 minutes",
                risk_level="low"
            )
        }
        
        return actions
    
    def get_capability_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of Mama Bear's capabilities"""
        summary = {
            "total_capabilities": len(self.capabilities),
            "available_capabilities": len([c for c in self.capabilities.values() if c.is_available]),
            "categories": {},
            "autonomous_actions": len(self.autonomous_actions),
            "feature_highlights": []
        }
        
        # Group by category
        for capability in self.capabilities.values():
            category = capability.category.value
            if category not in summary["categories"]:
                summary["categories"][category] = []
            summary["categories"][category].append({
                "name": capability.name,
                "description": capability.description,
                "available": capability.is_available,
                "complexity": capability.complexity_level.value
            })
        
        # Add feature highlights
        summary["feature_highlights"] = [
            "🧠 Intelligent conversation with persistent memory",
            "⚡ Dynamic AI model switching for optimal performance", 
            "🛠️ Safe code execution in NixOS sandboxes",
            "🏗️ Complete project setup and workspace orchestration",
            "🔍 Proactive discovery and recommendations",
            "📊 Comprehensive code analysis and optimization",
            "🤖 Multi-agent coordination capabilities",
            "📚 Intelligent documentation generation",
            "🔄 Continuous learning and improvement",
            "🎯 Autonomous task execution and problem solving"
        ]
        
        return summary
    
    def can_execute_action(self, action_id: str) -> Dict[str, Any]:
        """Check if Mama Bear can execute a specific autonomous action"""
        if action_id not in self.autonomous_actions:
            return {"can_execute": False, "reason": "Action not found"}
        
        action = self.autonomous_actions[action_id]
        missing_capabilities = []
        
        for required_cap in action.required_capabilities:
            if required_cap not in self.capabilities:
                missing_capabilities.append(required_cap)
            elif not self.capabilities[required_cap].is_available:
                missing_capabilities.append(f"{required_cap} (unavailable)")
        
        if missing_capabilities:
            return {
                "can_execute": False,
                "reason": f"Missing capabilities: {', '.join(missing_capabilities)}",
                "missing_capabilities": missing_capabilities
            }
        
        return {
            "can_execute": True,
            "action": action,
            "estimated_duration": action.estimated_duration,
            "risk_level": action.risk_level
        }
    
    def suggest_optimal_model(self, task_description: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Suggest optimal AI model based on task complexity and requirements"""
        task_lower = task_description.lower()
        
        # Analyze task complexity
        if any(keyword in task_lower for keyword in [
            "architecture", "design", "complex", "analyze", "research", 
            "comprehensive", "deep", "reasoning", "strategy"
        ]):
            complexity = TaskComplexity.COMPLEX
            suggested_model = "gemini-2.5-pro-002"
            reason = "Complex reasoning and analysis required"
            
        elif any(keyword in task_lower for keyword in [
            "image", "screenshot", "diagram", "visual", "photo", "file"
        ]):
            complexity = TaskComplexity.MULTIMODAL
            suggested_model = "gemini-2.5-flash-002"
            reason = "Multimodal content analysis needed"
            
        elif any(keyword in task_lower for keyword in [
            "summary", "quick", "simple", "list", "status", "brief"
        ]):
            complexity = TaskComplexity.SIMPLE
            suggested_model = "gemini-2.5-flash-8b"
            reason = "Simple task suitable for fast model"
            
        else:
            complexity = TaskComplexity.MODERATE
            suggested_model = "gemini-2.5-flash-002"
            reason = "Standard task complexity"
        
        return {
            "suggested_model": suggested_model,
            "complexity": complexity.value,
            "reason": reason,
            "estimated_cost": self._estimate_cost(complexity),
            "estimated_speed": self._estimate_speed(complexity)
        }
    
    def _estimate_cost(self, complexity: TaskComplexity) -> str:
        """Estimate relative cost based on complexity"""
        cost_map = {
            TaskComplexity.SIMPLE: "Very Low",
            TaskComplexity.MODERATE: "Low", 
            TaskComplexity.COMPLEX: "Medium",
            TaskComplexity.MULTIMODAL: "Medium"
        }
        return cost_map.get(complexity, "Medium")
    
    def _estimate_speed(self, complexity: TaskComplexity) -> str:
        """Estimate relative speed based on complexity"""
        speed_map = {
            TaskComplexity.SIMPLE: "Very Fast",
            TaskComplexity.MODERATE: "Fast",
            TaskComplexity.COMPLEX: "Moderate", 
            TaskComplexity.MULTIMODAL: "Moderate"
        }
        return speed_map.get(complexity, "Moderate")
    
    def get_feature_awareness_response(self) -> str:
        """Generate comprehensive response about Mama Bear's capabilities"""
        summary = self.get_capability_summary()
        
        response = f"""🐻 **Hello Nathan! I'm Mama Bear, your comprehensive AI development assistant.**

I have **{summary['total_capabilities']} core capabilities** across **{len(summary['categories'])} major areas**:

**🎯 MY KEY STRENGTHS:**
{chr(10).join(f"• {highlight}" for highlight in summary['feature_highlights'])}

**📋 CAPABILITY CATEGORIES:**"""

        for category, capabilities in summary['categories'].items():
            response += f"\n\n**{category.replace('_', ' ').title()}:**"
            for cap in capabilities[:3]:  # Show top 3 per category
                status = "✅" if cap['available'] else "⏳"
                response += f"\n  {status} {cap['name']} - {cap['description']}"
            
            if len(capabilities) > 3:
                response += f"\n  ... and {len(capabilities) - 3} more capabilities"

        response += f"""

**🤖 AUTONOMOUS ACTIONS:**
I can autonomously execute **{summary['autonomous_actions']} complex workflows** including:
• Complete project setup from requirements to deployment
• Comprehensive code analysis and optimization
• Environment troubleshooting and maintenance
• Proactive system maintenance and monitoring

**⚡ INTELLIGENT MODEL SWITCHING:**
I automatically select the optimal AI model for each task:
• **Flash 8B** for quick summaries and simple tasks
• **Flash 002** for standard development work
• **Pro 002** for complex reasoning and architecture
• **Vision models** for analyzing images and files

**🧠 WHAT MAKES ME SPECIAL:**
- **Persistent Memory**: I remember our conversations and learn from interactions
- **Proactive Intelligence**: I anticipate your needs and suggest improvements
- **Safe Execution**: All code runs in secure NixOS sandboxes
- **Context Awareness**: I understand your project goals and preferences
- **Continuous Learning**: I improve with every interaction

**Ready to help with your Podplay Build Sanctuary! What would you like to work on?** 🚀"""

        return response

# Initialize the capability system
mama_bear_capabilities = MamaBearCapabilitySystem()
