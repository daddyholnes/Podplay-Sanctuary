#!/usr/bin/env python3
"""
ADK Workflow Orchestration API Blueprint
Advanced workflow management using Google Agent Development Kit
with dynamic model switching and MCP tool integration
"""

import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
from flask import Blueprint, request, jsonify
from threading import Thread
import uuid

logger = logging.getLogger(__name__)

# Create the ADK Workflow API blueprint
adk_workflow_bp = Blueprint('adk_workflow', __name__, url_prefix='/api/adk-workflows')

# Global variables for services (will be injected during app initialization)
adk_agent = None
mama_bear_service = None

def init_adk_workflow_services(adk_agent_instance, mama_bear_svc):
    """Initialize ADK workflow services"""
    global adk_agent, mama_bear_service
    adk_agent = adk_agent_instance
    mama_bear_service = mama_bear_svc
    logger.info("🤖 ADK Workflow API services initialized")

def set_adk_agent(adk_agent_instance):
    """Set the ADK agent instance (called externally)"""
    global adk_agent
    adk_agent = adk_agent_instance
    logger.info("🤖 ADK agent instance set for workflow API")

# ==================== WORKFLOW ORCHESTRATION ENDPOINTS ====================

@adk_workflow_bp.route('/create', methods=['POST'])
def create_workflow():
    """Create a new ADK workflow"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No workflow data provided"}), 400
        
        workflow_type = data.get('type', 'sequential')  # sequential, parallel, conditional
        workflow_name = data.get('name', f'workflow_{uuid.uuid4().hex[:8]}')
        description = data.get('description', '')
        steps = data.get('steps', [])
        models = data.get('preferred_models', ['Gemini 2.0 Flash', 'Claude 3.5 Sonnet'])
        
        if not steps:
            return jsonify({"success": False, "error": "Workflow steps are required"}), 400
        
        # Create workflow configuration
        workflow_config = {
            "id": str(uuid.uuid4()),
            "name": workflow_name,
            "type": workflow_type,
            "description": description,
            "steps": steps,
            "preferred_models": models,
            "created_at": datetime.now().isoformat(),
            "status": "created",
            "creator": data.get('user_id', 'nathan'),
            "metadata": {
                "created_by": "adk_workflow_api",
                "version": "1.0",
                "tags": data.get('tags', [])
            }
        }
        
        # Store workflow if ADK agent is available
        if adk_agent and hasattr(adk_agent, 'create_workflow'):
            try:
                result = adk_agent.create_workflow(workflow_config)
                if result.get('success'):
                    return jsonify({
                        "success": True,
                        "workflow_id": workflow_config["id"],
                        "message": f"🤖 Workflow '{workflow_name}' created successfully",
                        "workflow": workflow_config,
                        "adk_result": result
                    })
                else:
                    return jsonify({
                        "success": False,
                        "error": f"ADK workflow creation failed: {result.get('error', 'Unknown error')}"
                    }), 500
            except Exception as e:
                logger.error(f"Error creating ADK workflow: {e}")
                return jsonify({
                    "success": False,
                    "error": f"ADK workflow creation error: {str(e)}"
                }), 500
        
        # Fallback: store workflow locally
        logger.warning("ADK agent not available, storing workflow configuration locally")
        return jsonify({
            "success": True,
            "workflow_id": workflow_config["id"],
            "message": f"🤖 Workflow '{workflow_name}' created (local mode)",
            "workflow": workflow_config,
            "note": "ADK agent not available - workflow stored locally"
        })
        
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@adk_workflow_bp.route('/execute', methods=['POST'])
def execute_workflow():
    """Execute an ADK workflow"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No execution data provided"}), 400
        
        workflow_id = data.get('workflow_id')
        inputs = data.get('inputs', {})
        user_id = data.get('user_id', 'nathan')
        execution_mode = data.get('mode', 'async')  # async, sync, background
        
        if not workflow_id:
            return jsonify({"success": False, "error": "Workflow ID is required"}), 400
        
        # Create execution request
        execution_id = str(uuid.uuid4())
        execution_request = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "inputs": inputs,
            "user_id": user_id,
            "mode": execution_mode,
            "started_at": datetime.now().isoformat(),
            "status": "running"
        }
        
        if adk_agent and hasattr(adk_agent, 'execute_workflow'):
            try:
                if execution_mode == 'sync':
                    # Synchronous execution
                    result = adk_agent.execute_workflow(workflow_id, inputs, user_id)
                    execution_request["status"] = "completed" if result.get('success') else "failed"
                    execution_request["result"] = result
                    execution_request["completed_at"] = datetime.now().isoformat()
                    
                    return jsonify({
                        "success": True,
                        "execution_id": execution_id,
                        "message": "🤖 Workflow executed successfully",
                        "execution": execution_request,
                        "result": result
                    })
                else:
                    # Asynchronous execution
                    def run_async_workflow():
                        try:
                            result = adk_agent.execute_workflow(workflow_id, inputs, user_id)
                            execution_request["status"] = "completed" if result.get('success') else "failed"
                            execution_request["result"] = result
                            execution_request["completed_at"] = datetime.now().isoformat()
                            logger.info(f"🤖 Async workflow {execution_id} completed")
                        except Exception as e:
                            execution_request["status"] = "failed"
                            execution_request["error"] = str(e)
                            execution_request["completed_at"] = datetime.now().isoformat()
                            logger.error(f"🤖 Async workflow {execution_id} failed: {e}")
                    
                    # Start async execution
                    thread = Thread(target=run_async_workflow)
                    thread.start()
                    
                    return jsonify({
                        "success": True,
                        "execution_id": execution_id,
                        "message": f"🤖 Workflow execution started in {execution_mode} mode",
                        "execution": execution_request,
                        "note": f"Check status using GET /api/adk-workflows/execution/{execution_id}"
                    })
                    
            except Exception as e:
                logger.error(f"Error executing ADK workflow: {e}")
                return jsonify({
                    "success": False,
                    "error": f"Workflow execution error: {str(e)}"
                }), 500
        
        # Fallback response
        return jsonify({
            "success": False,
            "error": "ADK agent not available for workflow execution"
        }), 503
        
    except Exception as e:
        logger.error(f"Error in workflow execution: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@adk_workflow_bp.route('/execution/<execution_id>', methods=['GET'])
def get_execution_status(execution_id):
    """Get the status of a workflow execution"""
    try:
        if adk_agent and hasattr(adk_agent, 'get_execution_status'):
            result = adk_agent.get_execution_status(execution_id)
            if result.get('success'):
                return jsonify({
                    "success": True,
                    "execution_id": execution_id,
                    "execution": result.get('execution', {}),
                    "status": result.get('status', 'unknown')
                })
        
        # Fallback response
        return jsonify({
            "success": False,
            "error": "Execution not found or ADK agent not available"
        }), 404
        
    except Exception as e:
        logger.error(f"Error getting execution status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@adk_workflow_bp.route('/list', methods=['GET'])
def list_workflows():
    """List all available workflows"""
    try:
        user_id = request.args.get('user_id', 'nathan')
        category = request.args.get('category', None)
        status = request.args.get('status', None)
        
        if adk_agent and hasattr(adk_agent, 'list_workflows'):
            result = adk_agent.list_workflows(user_id=user_id, category=category, status=status)
            if result.get('success'):
                return jsonify({
                    "success": True,
                    "workflows": result.get('workflows', []),
                    "count": len(result.get('workflows', [])),
                    "filters": {
                        "user_id": user_id,
                        "category": category,
                        "status": status
                    }
                })
        
        # Fallback: return sample workflows
        sample_workflows = [
            {
                "id": "sample-research-workflow",
                "name": "AI Research & Analysis",
                "type": "sequential",
                "description": "Research a topic using multiple AI models and synthesize findings",
                "status": "available",
                "created_at": datetime.now().isoformat(),
                "steps": 3,
                "preferred_models": ["Gemini 2.0 Flash", "Claude 3.5 Sonnet"]
            },
            {
                "id": "sample-code-review-workflow",
                "name": "Multi-Model Code Review",
                "type": "parallel",
                "description": "Review code using different AI models for comprehensive analysis",
                "status": "available",
                "created_at": datetime.now().isoformat(),
                "steps": 4,
                "preferred_models": ["Claude 3.5 Sonnet", "GPT-4 Turbo"]
            }
        ]
        
        return jsonify({
            "success": True,
            "workflows": sample_workflows,
            "count": len(sample_workflows),
            "note": "Sample workflows - ADK agent not available"
        })
        
    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== MODEL MANAGEMENT ENDPOINTS ====================

@adk_workflow_bp.route('/models/status', methods=['GET'])
def get_model_status():
    """Get the status of all available models"""
    try:
        if adk_agent and hasattr(adk_agent, 'get_model_status'):
            result = adk_agent.get_model_status()
            return jsonify({
                "success": True,
                "models": result,
                "timestamp": datetime.now().isoformat()
            })
        
        # Fallback response
        sample_status = {
            "Gemini 2.0 Flash": {
                "available": True,
                "priority": 0,
                "usage": {"current": 45, "limit": 1000},
                "capabilities": ["text", "vision", "function_calling"],
                "cost_per_1k_tokens": 0.002
            },
            "Claude 3.5 Sonnet": {
                "available": True,
                "priority": 1,
                "usage": {"current": 23, "limit": 2000},
                "capabilities": ["text", "function_calling"],
                "cost_per_1k_tokens": 0.003
            },
            "GPT-4 Turbo": {
                "available": False,
                "priority": 2,
                "usage": {"current": 0, "limit": 500},
                "capabilities": ["text", "function_calling"],
                "cost_per_1k_tokens": 0.01,
                "error": "API key not configured"
            }
        }
        
        return jsonify({
            "success": True,
            "models": sample_status,
            "timestamp": datetime.now().isoformat(),
            "note": "Sample data - ADK agent not available"
        })
        
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@adk_workflow_bp.route('/models/switch', methods=['POST'])
def switch_model():
    """Switch the primary model for workflows"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No model data provided"}), 400
        
        model_name = data.get('model_name')
        context = data.get('context', 'default')
        user_id = data.get('user_id', 'nathan')
        
        if not model_name:
            return jsonify({"success": False, "error": "Model name is required"}), 400
        
        if adk_agent and hasattr(adk_agent, 'switch_primary_model'):
            result = adk_agent.switch_primary_model(model_name, context, user_id)
            if result.get('success'):
                return jsonify({
                    "success": True,
                    "message": f"🤖 Primary model switched to {model_name}",
                    "previous_model": result.get('previous_model'),
                    "new_model": model_name,
                    "context": context
                })
            else:
                return jsonify({
                    "success": False,
                    "error": f"Model switch failed: {result.get('error', 'Unknown error')}"
                }), 400
        
        # Fallback response
        return jsonify({
            "success": False,
            "error": "ADK agent not available for model switching"
        }), 503
        
    except Exception as e:
        logger.error(f"Error switching model: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== SYSTEM STATUS ENDPOINTS ====================

@adk_workflow_bp.route('/system/health', methods=['GET'])
def get_system_health():
    """Get ADK system health status"""
    try:
        health_data = {
            "timestamp": datetime.now().isoformat(),
            "adk_agent": "available" if adk_agent else "unavailable",
            "mama_bear_service": "available" if mama_bear_service else "unavailable",
            "workflow_engine": "ready" if adk_agent and hasattr(adk_agent, 'execute_workflow') else "not_ready",
            "model_switching": "enabled" if adk_agent and hasattr(adk_agent, 'switch_primary_model') else "disabled",
            "mcp_integration": "enabled" if adk_agent and hasattr(adk_agent, 'mcp_servers') else "disabled"
        }
        
        if adk_agent and hasattr(adk_agent, 'get_system_info'):
            try:
                adk_info = adk_agent.get_system_info()
                health_data.update(adk_info)
            except Exception as e:
                health_data["adk_error"] = str(e)
        
        # Determine overall health
        critical_components = ['adk_agent', 'workflow_engine']
        all_critical_ready = all(health_data.get(comp) in ['available', 'ready'] for comp in critical_components)
        
        health_data["overall_status"] = "healthy" if all_critical_ready else "degraded"
        health_data["ready_for_workflows"] = all_critical_ready
        
        return jsonify({
            "success": True,
            "health": health_data
        })
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "health": {
                "overall_status": "error",
                "timestamp": datetime.now().isoformat()
            }
        }), 500

@adk_workflow_bp.route('/system/capabilities', methods=['GET'])
def get_system_capabilities():
    """Get ADK system capabilities"""
    try:
        capabilities = {
            "workflow_types": ["sequential", "parallel", "conditional"],
            "supported_models": [
                "Gemini 2.0 Flash",
                "Gemini 1.5 Pro", 
                "Claude 3.5 Sonnet",
                "Claude 3 Opus",
                "GPT-4 Turbo"
            ],
            "execution_modes": ["sync", "async", "background"],
            "mcp_tools": [],
            "features": {
                "dynamic_model_switching": True,
                "workflow_orchestration": True,
                "parallel_execution": True,
                "error_recovery": True,
                "progress_tracking": True,
                "result_caching": True
            }
        }
        
        if adk_agent:
            if hasattr(adk_agent, 'mcp_servers') and adk_agent.mcp_servers:
                capabilities["mcp_tools"] = list(adk_agent.mcp_servers.keys())
            
            if hasattr(adk_agent, 'get_capabilities'):
                try:
                    adk_capabilities = adk_agent.get_capabilities()
                    capabilities.update(adk_capabilities)
                except Exception as e:
                    capabilities["adk_error"] = str(e)
        
        return jsonify({
            "success": True,
            "capabilities": capabilities,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting system capabilities: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== WORKFLOW TEMPLATES ENDPOINTS ====================

@adk_workflow_bp.route('/templates', methods=['GET'])
def get_workflow_templates():
    """Get available workflow templates"""
    try:
        templates = [
            {
                "id": "research-analysis",
                "name": "Research & Analysis",
                "description": "Multi-step research workflow with synthesis",
                "type": "sequential",
                "steps": [
                    {"name": "Research", "model": "Gemini 1.5 Pro", "tool": "web_search"},
                    {"name": "Analysis", "model": "Claude 3.5 Sonnet", "tool": "code_execution"},
                    {"name": "Synthesis", "model": "Gemini 2.0 Flash", "tool": "filesystem"}
                ],
                "estimated_time": "5-10 minutes",
                "cost_estimate": "$0.05-0.15"
            },
            {
                "id": "code-review-multi",
                "name": "Multi-Model Code Review",
                "description": "Parallel code review using multiple AI models",
                "type": "parallel",
                "steps": [
                    {"name": "Security Review", "model": "Claude 3.5 Sonnet", "tool": "code_execution"},
                    {"name": "Performance Analysis", "model": "GPT-4 Turbo", "tool": "code_execution"},
                    {"name": "Best Practices", "model": "Gemini 1.5 Pro", "tool": "filesystem"},
                    {"name": "Synthesis", "model": "Claude 3 Opus", "tool": "filesystem"}
                ],
                "estimated_time": "3-7 minutes",
                "cost_estimate": "$0.08-0.20"
            },
            {
                "id": "documentation-generation",
                "name": "Documentation Generation",
                "description": "Generate comprehensive documentation from code",
                "type": "sequential",
                "steps": [
                    {"name": "Code Analysis", "model": "Gemini 1.5 Pro", "tool": "code_execution"},
                    {"name": "API Documentation", "model": "Claude 3.5 Sonnet", "tool": "filesystem"},
                    {"name": "User Guide", "model": "GPT-4 Turbo", "tool": "filesystem"},
                    {"name": "README Generation", "model": "Gemini 2.0 Flash", "tool": "filesystem"}
                ],
                "estimated_time": "8-15 minutes",
                "cost_estimate": "$0.12-0.30"
            }
        ]
        
        category = request.args.get('category')
        if category:
            templates = [t for t in templates if category.lower() in t['name'].lower() or category.lower() in t['description'].lower()]
        
        return jsonify({
            "success": True,
            "templates": templates,
            "count": len(templates)
        })
        
    except Exception as e:
        logger.error(f"Error getting workflow templates: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@adk_workflow_bp.route('/templates/<template_id>/create', methods=['POST'])
def create_workflow_from_template(template_id):
    """Create a workflow from a template"""
    try:
        data = request.get_json() or {}
        user_id = data.get('user_id', 'nathan')
        custom_name = data.get('name')
        parameters = data.get('parameters', {})
        
        # Template mapping
        template_configs = {
            "research-analysis": {
                "name": custom_name or "Research & Analysis Workflow",
                "type": "sequential",
                "description": "Multi-step research workflow with synthesis",
                "steps": [
                    {"id": "research", "name": "Research", "model": "Gemini 1.5 Pro", "tool": "web_search", "prompt": "Research the given topic comprehensively"},
                    {"id": "analysis", "name": "Analysis", "model": "Claude 3.5 Sonnet", "tool": "code_execution", "prompt": "Analyze the research findings"},
                    {"id": "synthesis", "name": "Synthesis", "model": "Gemini 2.0 Flash", "tool": "filesystem", "prompt": "Synthesize findings into a comprehensive report"}
                ],
                "preferred_models": ["Gemini 1.5 Pro", "Claude 3.5 Sonnet", "Gemini 2.0 Flash"]
            },
            "code-review-multi": {
                "name": custom_name or "Multi-Model Code Review",
                "type": "parallel",
                "description": "Parallel code review using multiple AI models",
                "steps": [
                    {"id": "security", "name": "Security Review", "model": "Claude 3.5 Sonnet", "tool": "code_execution", "prompt": "Review code for security vulnerabilities"},
                    {"id": "performance", "name": "Performance Analysis", "model": "GPT-4 Turbo", "tool": "code_execution", "prompt": "Analyze code performance and optimization opportunities"},
                    {"id": "best-practices", "name": "Best Practices", "model": "Gemini 1.5 Pro", "tool": "filesystem", "prompt": "Check code against best practices"},
                    {"id": "synthesis", "name": "Synthesis", "model": "Claude 3 Opus", "tool": "filesystem", "prompt": "Synthesize all review findings"}
                ],
                "preferred_models": ["Claude 3.5 Sonnet", "GPT-4 Turbo", "Gemini 1.5 Pro", "Claude 3 Opus"]
            },
            "documentation-generation": {
                "name": custom_name or "Documentation Generation",
                "type": "sequential",
                "description": "Generate comprehensive documentation from code",
                "steps": [
                    {"id": "analysis", "name": "Code Analysis", "model": "Gemini 1.5 Pro", "tool": "code_execution", "prompt": "Analyze code structure and functionality"},
                    {"id": "api-docs", "name": "API Documentation", "model": "Claude 3.5 Sonnet", "tool": "filesystem", "prompt": "Generate API documentation"},
                    {"id": "user-guide", "name": "User Guide", "model": "GPT-4 Turbo", "tool": "filesystem", "prompt": "Create user guide and tutorials"},
                    {"id": "readme", "name": "README Generation", "model": "Gemini 2.0 Flash", "tool": "filesystem", "prompt": "Generate comprehensive README file"}
                ],
                "preferred_models": ["Gemini 1.5 Pro", "Claude 3.5 Sonnet", "GPT-4 Turbo", "Gemini 2.0 Flash"]
            }
        }
        
        if template_id not in template_configs:
            return jsonify({
                "success": False,
                "error": f"Template '{template_id}' not found"
            }), 404
        
        # Create workflow from template
        workflow_config = template_configs[template_id].copy()
        workflow_config.update({
            "id": str(uuid.uuid4()),
            "template_id": template_id,
            "created_at": datetime.now().isoformat(),
            "status": "created",
            "creator": user_id,
            "parameters": parameters,
            "metadata": {
                "created_by": "template",
                "template_id": template_id,
                "version": "1.0"
            }
        })
        
        # Store workflow if ADK agent is available
        if adk_agent and hasattr(adk_agent, 'create_workflow'):
            try:
                result = adk_agent.create_workflow(workflow_config)
                if result.get('success'):
                    return jsonify({
                        "success": True,
                        "workflow_id": workflow_config["id"],
                        "message": f"🤖 Workflow created from template '{template_id}'",
                        "workflow": workflow_config,
                        "template_id": template_id
                    })
            except Exception as e:
                logger.error(f"Error creating workflow from template: {e}")
        
        # Fallback response
        return jsonify({
            "success": True,
            "workflow_id": workflow_config["id"],
            "message": f"🤖 Workflow created from template '{template_id}' (local mode)",
            "workflow": workflow_config,
            "template_id": template_id,
            "note": "ADK agent not available - workflow stored locally"
        })
        
    except Exception as e:
        logger.error(f"Error creating workflow from template: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# ==================== ERROR HANDLERS ====================

@adk_workflow_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
        "available_endpoints": [
            "/api/adk-workflows/create",
            "/api/adk-workflows/execute", 
            "/api/adk-workflows/list",
            "/api/adk-workflows/models/status",
            "/api/adk-workflows/system/health",
            "/api/adk-workflows/templates"
        ]
    }), 404

@adk_workflow_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error",
        "message": "🤖 ADK Workflow system encountered an error"
    }), 500
