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
    # from enhanced_mama_bear import VertexAIMamaBear # Old import
    from backend.unified_mama_bear import UnifiedMamaBearAgent # New import
    MAMA_BEAR_AVAILABLE = True
except ImportError as e:
    MAMA_BEAR_AVAILABLE = False
    # logger.warning(f"UnifiedMamaBearAgent import failed: {e}") # logger might not be defined here yet
    print(f"Warning: UnifiedMamaBearAgent import failed: {e}") # Use print if logger is not yet available

# NixOS Orchestrator and VM Manager imports
try:
    from backend.nixos_sandbox_orchestrator import NixOSSandboxOrchestrator
    NIXOS_ORCHESTRATOR_AVAILABLE = True
except ImportError as e:
    NIXOS_ORCHESTRATOR_AVAILABLE = False
    print(f"Warning: NixOSSandboxOrchestrator import failed: {e}")

try:
    from backend.vm_manager import LibvirtManager, VMManagerError
    LIBVIRT_MANAGER_AVAILABLE = True
except ImportError as e:
    LIBVIRT_MANAGER_AVAILABLE = False
    print(f"Warning: LibvirtManager import failed: {e}")

try:
    from backend.ssh_executor import SSHExecutor, SSHExecutorError
    SSH_EXECUTOR_AVAILABLE = True
except ImportError as e:
    SSH_EXECUTOR_AVAILABLE = False
    print(f"Warning: SSHExecutor import failed: {e}")

try:
    from backend.scout_log_manager import ScoutLogManager # Import ScoutLogManager
    SCOUT_LOG_MANAGER_AVAILABLE = True
except ImportError as e:
    SCOUT_LOG_MANAGER_AVAILABLE = False
    print(f"Warning: ScoutLogManager import failed: {e}")

try:
    from unified_mama_bear import MamaBearTaskType # Import the Enum
except ImportError as e:
    # If this happens, it's a critical issue for this task.
    # Log it, and the parts of the code using MamaBearTaskType might fail.
    print(f"CRITICAL: Failed to import MamaBearTaskType from unified_mama_bear: {e}")
    MamaBearTaskType = None # Placeholder if import fails

try:
    from mem0_chat_manager import Mem0ChatManager
    MEM0_AVAILABLE = True
except ImportError:
    MEM0_AVAILABLE = False

logger = logging.getLogger(__name__)

class AgenticDevSandbox:
    """AI-powered development assistant for DevSandbox environments"""
    
    def __init__(self, user_id: Optional[str] = None): # Added user_id parameter
        self.mama_bear_agent = None 
        self.mem0_manager = None
        self.user_id = user_id if user_id else str(uuid.uuid4()) 
        
        self.nixos_orchestrator = None
        self.vm_manager = None
        self.cloud_sandbox_manager = None 
        self.scout_log_manager = None # For ScoutLogManager instance

        # Initialize Mama Bear agent
        if MAMA_BEAR_AVAILABLE:
            try:
                self.mama_bear_agent = UnifiedMamaBearAgent(user_id=self.user_id) 
                logger.info("🐻 Unified Mama Bear agent initialized for AgenticDevSandbox.")
            except Exception as e:
                logger.warning(f"Failed to initialize Unified Mama Bear agent: {e}")
                self.mama_bear_agent = None
        
        # Initialize Mem0
        if MEM0_AVAILABLE:
            try:
                self.mem0_manager = Mem0ChatManager()
                logger.info("🧠 Mem0 memory system initialized for AgenticDevSandbox.")
            except Exception as e:
                logger.warning(f"Failed to initialize Mem0: {e}")
                self.mem0_manager = None

        # Initialize NixOSSandboxOrchestrator (for ephemeral jobs, not persistent envs here)
        if NIXOS_ORCHESTRATOR_AVAILABLE:
            try:
                self.nixos_orchestrator = NixOSSandboxOrchestrator()
                logger.info("🔧 NixOS Sandbox Orchestrator initialized for AgenticDevSandbox.")
            except Exception as e:
                logger.warning(f"Failed to initialize NixOSSandboxOrchestrator: {e}")
                self.nixos_orchestrator = None
        
        # Initialize LibvirtManager (for persistent NixOS VMs)
        if LIBVIRT_MANAGER_AVAILABLE:
            try:
                self.vm_manager = LibvirtManager()
                logger.info("🛠️ LibvirtManager initialized for AgenticDevSandbox (for persistent NixOS VMs).")
            except Exception as e: # Catching broad Exception as VMManagerError might not be the only one
                logger.warning(f"Failed to initialize LibvirtManager: {e}")
                self.vm_manager = None
        
        # Initialize CloudDevSandboxManager (defined in this file)
        try:
            # Instead of global, instantiate it. Note: CloudDevSandboxManager itself uses global env vars.
            self.cloud_sandbox_manager = CloudDevSandboxManager()
            logger.info("☁️ CloudDevSandboxManager initialized for AgenticDevSandbox.")
        except Exception as e:
            logger.warning(f"Failed to initialize CloudDevSandboxManager: {e}")
            self.cloud_sandbox_manager = None
        
        # Initialize ScoutLogManager
        if SCOUT_LOG_MANAGER_AVAILABLE:
            try:
                self.scout_log_manager = ScoutLogManager()
                logger.info("📝 ScoutLogManager initialized for AgenticDevSandbox.")
            except Exception as e:
                logger.warning(f"Failed to initialize ScoutLogManager: {e}")
                self.scout_log_manager = None
        else:
            logger.warning("ScoutLogManager not available, project logging will be limited.")


    async def get_intelligent_assistance(self, environment_context: Dict[str, Any], 
                                       user_query: str = "") -> Dict[str, Any]:
        """Get intelligent assistance from Mama Bear for development tasks"""
        if not self.mama_bear_agent: # Updated to self.mama_bear_agent
            return {
                "success": False,
                "response": "🐻 Unified Mama Bear agent not available. Please check configuration.",
                "suggestions": []
            }
        
        try:
            # Build context for Mama Bear
            # The UnifiedMamaBearAgent's vertex_ai_chat expects a single prompt string.
            # We need to construct this from the available information.
            prompt_parts = []
            if user_query:
                prompt_parts.append(f"User Query: {user_query}")
            
            prompt_parts.append("Environment Context:")
            for key, value in environment_context.items():
                prompt_parts.append(f"  {key}: {json.dumps(value, indent=2) if isinstance(value, dict) else value}")
            
            prompt_parts.append("Task: Provide intelligent assistance for this development environment.")
            full_prompt = "\n".join(prompt_parts)

            logger.debug(f"Sending prompt to UnifiedMamaBearAgent: {full_prompt[:500]}...") 
            
            # Determine task type for get_intelligent_assistance
            # This is a simple heuristic; more sophisticated logic could be added.
            current_task_type = MamaBearTaskType.GENERAL_REASONING
            if user_query and any(kw in user_query.lower() for kw in ["code", "script", "function", "algorithm", "debug", "fix", "implement"]):
                current_task_type = MamaBearTaskType.CODING # Or GENERAL_REASONING if coding is too specific
            elif user_query and any(kw in user_query.lower() for kw in ["summary", "explain", "describe"]):
                current_task_type = MamaBearTaskType.SUMMARIZING
            
            if not MamaBearTaskType: # Safety check if import failed
                logger.error("MamaBearTaskType Enum not available. Cannot specify task type for AI call.")
                ai_response_text = self.mama_bear_agent.vertex_ai_chat(full_prompt) # Call without task_type
            else:
                ai_response_text = self.mama_bear_agent.vertex_ai_chat(full_prompt, task_type=current_task_type)
            
            response_dict = {
                "success": True, # Assume success if we get a response
                "response": ai_response_text,
                "suggestions": [] # UnifiedMamaBearAgent.vertex_ai_chat doesn't directly provide suggestions in this format
            }

            # Store interaction in Mem0 if available
            if self.mem0_manager and response_dict.get('success'):
                # Pass the raw AI text response to _store_interaction_memory
                await self._store_interaction_memory(environment_context, user_query, {"response": ai_response_text})
            
            return response_dict
            
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

    # --- New Project Planning and Workflow Management Methods ---

    async def plan_project(self, high_level_prompt: str) -> Dict[str, Any]:
        """
        Generates a project plan using UnifiedMamaBearAgent.
        """
        logger.info(f"Initiating project planning for prompt: '{high_level_prompt}'")
        if not self.mama_bear_agent:
            logger.error("UnifiedMamaBearAgent not available for project planning.")
            return {"success": False, "error": "AI agent not available."}

        # Construct a detailed prompt for the AI to generate a plan in JSON format
        planning_prompt = f"""
        Objective: Decompose the following high-level project prompt into a series of actionable steps.
        Project Prompt: "{high_level_prompt}"

        Output Format:
        Return a JSON object with a single key "plan". The value of "plan" should be a list of dictionaries.
        Each dictionary represents a step and must include the following keys:
        - "step_id": A unique integer identifier for the step (e.g., 1, 2, 3).
        - "description": A concise description of what needs to be done in this step.
        - "tools_required": A list of strings, naming potential MCPs (e.g., "CodeGeneratorMCP", "FileAccessMCP") or general tools/technologies (e.g., "Python", "Flask", "Docker", "Git").
        - "status": Initialize to "pending".
        - "deliverables": A brief description of what this step will produce.

        Example of a step dictionary:
        {{
            "step_id": 1,
            "description": "Set up project structure and initialize Git repository.",
            "tools_required": ["Git", "FileAccessMCP"],
            "status": "pending",
            "deliverables": "A new directory with basic project folders (e.g., src, tests, docs) and an initialized Git repo."
        }}

        Please generate the plan now.
        """

        try:
            logger.info("Sending planning prompt to UnifiedMamaBearAgent...")
            ai_response_text = self.mama_bear_agent.vertex_ai_chat(planning_prompt)
            
            if not ai_response_text or not ai_response_text.strip():
                logger.error("Received empty response from AI for project planning.")
                return {"success": False, "error": "AI returned an empty response."}

            logger.info(f"Received AI response for planning: {ai_response_text[:500]}...") # Log part of the response

            # Attempt to parse the JSON response
            # The AI might return markdown with JSON block, try to extract it.
            if "```json" in ai_response_text:
                json_block = ai_response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_block = ai_response_text.strip()
            
            parsed_response = json.loads(json_block)
            
            if "plan" not in parsed_response or not isinstance(parsed_response["plan"], list):
                logger.error(f"AI response does not contain a valid 'plan' list. Response: {parsed_response}")
                return {"success": False, "error": "AI response is not in the expected format (missing 'plan' list)."}

            # Validate basic structure of plan steps
            for step in parsed_response["plan"]:
                if not all(key in step for key in ["step_id", "description", "tools_required", "status", "deliverables"]):
                    logger.error(f"A step in the plan is missing required keys. Step: {step}")
                    return {"success": False, "error": "A step in the plan is malformed."}
            
            logger.info(f"Successfully generated project plan with {len(parsed_response['plan'])} steps.")
            return {"success": True, "plan": parsed_response["plan"]}

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response from AI for project planning: {e}. Response was: {ai_response_text}")
            return {"success": False, "error": f"JSON parsing failed. AI response: {ai_response_text}"}
        except Exception as e:
            logger.error(f"An unexpected error occurred during project planning: {e}")
            return {"success": False, "error": str(e)}

    async def execute_project_step(self, step: Dict[str, Any], project_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a single step from the project plan. Placeholder for now.
        """
        step_id = step.get("step_id", "Unknown")
        description = step.get("description", "No description")
        logger.info(f"Executing project step {step_id}: '{description}'")
        logger.info(f"Project Context: {project_context}")
        
        # Actual execution logic will be added later.
        # For now, simulate success.
        await asyncio.sleep(0.1) # Simulate some async work
        
        return {
            "success": True, 
            "step_id": step_id, 
            "status": "completed", 
            "message": f"Step {step_id} placeholder execution successful."
        }

    async def manage_project_workflow(self, high_level_prompt: str) -> Dict[str, Any]:
        """
        Manages the full project workflow from planning to execution of steps.
        """
        logger.info(f"Starting project workflow for prompt: '{high_level_prompt}'")

        # Generate a project_id (e.g., from the prompt or a new UUID)
        # Using a UUID derived from the prompt for some consistency if the same prompt is given.
        # Otherwise, a random UUID: project_id = str(uuid.uuid4())
        project_name_slug = "".join(filter(str.isalnum, high_level_prompt.lower().replace(" ", "-")[:50]))
        project_id = f"proj-{project_name_slug}-{uuid.uuid4().hex[:8]}"
        
        project_logger = None
        if self.scout_log_manager:
            project_logger = self.scout_log_manager.get_project_logger(project_id)
            project_logger.set_project_goal(high_level_prompt)
            project_logger.log_entry(
                agent_action="project_start",
                inputs={"high_level_prompt": high_level_prompt, "project_id": project_id},
                outputs={"status": "Project workflow initiated."}
            )
            project_logger.set_overall_status("starting")
        else:
            logger.warning(f"ScoutLogManager not available for project {project_id}. Detailed logging will be skipped.")

        # 0. Provision environment
        # Project requirements could be extracted from the high_level_prompt or be a separate param.
        # For this integration, let's try "auto" and provide minimal requirements.
        env_preference = "auto" # Could be configurable
        # Example: project_requirements = {"os": "nixos", "persistent_storage": True} if prompt implies it
        project_requirements = {"type": "node"} 

        logger.info(f"Provisioning environment for project ID: {project_id} (Preference: {env_preference})")
        provisioning_result = await self.provision_environment(
            project_id=project_id,
            environment_preference=env_preference,
            project_requirements=project_requirements,
            project_logger=project_logger # Pass the logger
        )

        if not provisioning_result.get("success"):
            error_msg = provisioning_result.get("error", "Unknown provisioning error.")
            logger.error(f"Environment provisioning failed: {error_msg}")
            if project_logger:
                project_logger.log_entry(agent_action="provision_environment", inputs={"project_id": project_id}, outputs={"success": False, "error": error_msg})
                project_logger.set_overall_status("failed_provisioning")
            return {
                "success": False,
                "error": f"Environment provisioning phase failed: {error_msg}",
                "summary": "Workflow failed during environment provisioning."
            }
        
        provisioned_env_details = provisioning_result.get("environment_details")
        logger.info(f"Environment provisioned successfully: {provisioned_env_details}")
        if project_logger and provisioned_env_details:
            project_logger.set_associated_workspace(provisioned_env_details.get('env_id', project_id))
            project_logger.set_overall_status("environment_ready")


        # 1. Plan the project
        planning_result = await self.plan_project(high_level_prompt, project_logger=project_logger) # Pass logger
        if not planning_result.get("success"):
            error_msg_planning = planning_result.get('error')
            logger.error(f"Project planning failed: {error_msg_planning}")
            if project_logger:
                project_logger.log_entry(agent_action="plan_generation", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": error_msg_planning})
                project_logger.set_overall_status("failed_planning")
            # Log intent to teardown environment even if planning fails
            logger.info(f"Planning failed. Managing/tearing down environment {provisioned_env_details.get('env_id') if provisioned_env_details else 'N/A'}")
            return {
                "success": False, 
                "error": f"Planning phase failed: {planning_result.get('error')}",
                "summary": "Workflow failed during planning."
            }
        
        project_plan = planning_result["plan"]
        logger.info(f"Project plan received with {len(project_plan)} steps.")

        # 2. Execute the steps
        completed_steps = 0
        failed_steps = []
        
        project_context = { # This context is passed to each step execution
            "overall_prompt": high_level_prompt,
            "project_plan": project_plan, 
            "provisioned_environment": provisioned_env_details,
            "project_logger": project_logger, # Pass logger in context
            "project_id": project_id # Pass project_id for RAG
        }
        
        if project_logger:
            project_logger.log_entry(agent_action="plan_generated", inputs={"high_level_prompt": high_level_prompt}, outputs={"plan_summary": f"{len(project_plan)} steps generated", "plan": project_plan})
            project_logger.set_overall_status("executing_plan")


        for step_data in project_plan: 
            step_id = step_data.get("step_id")
            logger.info(f"--- Starting Step {step_id}: {step_data.get('description')} ---")
            if project_logger:
                project_logger.set_active_step(step_id)
                project_logger.update_plan_step_status(step_id, step_data.get('description'), "in_progress")
            step_data["status"] = "in_progress" # Local status update in the plan list
            
            # Pass step_data (the current step's details) and the overall project_context
            execution_result = await self.execute_project_step(step_data, project_context)
            
            if execution_result.get("success"):
                step_data["status"] = "completed" # Update status in the plan list
                completed_steps += 1
                logger.info(f"Step {step_id} completed successfully.")
            else:
                step_data["status"] = "failed" 
                error_message_step = execution_result.get("message", "Unknown error during step execution.")
                failed_steps.append({"step_id": step_id, "error": error_message_step})
                logger.error(f"Step {step_id} failed: {error_message_step}")
                
                if project_logger:
                    project_logger.update_plan_step_status(step_id, step_data.get('description'), "failed", results={"error": error_message_step})
                    project_logger.set_overall_status("failed_step_execution")

                # Log intent to manage/teardown the environment
                logger.info(f"Workflow failed at step {step_id}. Environment {provisioned_env_details.get('env_id')} of type {provisioned_env_details.get('type')} would be managed/torn down here.")
                return {
                    "success": False,
                    "error": f"Step {step_id} execution failed: {error_message_step}",
                    "summary": f"Workflow failed at step {step_id}. {completed_steps}/{len(project_plan)} steps attempted.",
                    "completed_steps_count": completed_steps,
                    "failed_step_details": failed_steps,
                    "project_plan_final_state": project_plan, 
                    "provisioned_environment": provisioned_env_details
                }
            
            if project_logger: # Log successful step completion to Scout
                 project_logger.update_plan_step_status(step_id, step_data.get('description'), "completed", results=execution_result) # Log full result
            logger.info(f"--- Finished Step {step_id} ---")

        summary_message = f"Project workflow completed. {completed_steps}/{len(project_plan)} steps executed successfully."
        logger.info(summary_message)
        if project_logger:
            project_logger.set_overall_status("completed_successfully")
            project_logger.log_entry(agent_action="project_end", inputs={}, outputs={"summary": summary_message, "status": "completed"})
        
        # Log intent to manage/teardown the environment
        logger.info(f"Workflow finished. Environment {provisioned_env_details.get('env_id')} of type {provisioned_env_details.get('type')} would be managed/torn down here.")
        # Actual teardown logic is out of scope for this specific subtask.

        return {
            "success": True,
            "summary": summary_message,
            "completed_steps_count": completed_steps,
            "total_steps": len(project_plan),
            "project_plan_final_state": project_plan,
            "provisioned_environment": provisioned_env_details
        }

    async def execute_project_step(self, step_details: Dict[str, Any], project_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a single step from the project plan, including tool installation.
        """
        step_id = step_details.get("step_id", "Unknown")
        description = step_details.get("description", "No description")
        project_logger = project_context.get("project_logger")
        project_id = project_context.get("project_id")

        logger.info(f"Executing project step {step_id}: '{description}' for project {project_id}")
        if project_logger:
            project_logger.log_entry(agent_action="execute_step_start", inputs={"step_id": step_id, "description": description})
        
        provisioned_env = project_context.get("provisioned_environment")
        if not provisioned_env:
            err_msg = "Missing environment details for step execution."
            logger.error(f"{err_msg} (Step {step_id})")
            if project_logger: project_logger.log_entry(agent_action="execute_step_error", inputs={"step_id": step_id}, outputs={"error": err_msg})
            return {"success": False, "step_id": step_id, "status": "failed", "message": err_msg}

        # 1. Tool Installation
        tools_to_install = step_details.get("tools_required", [])
        if tools_to_install:
            logger.info(f"Step {step_id} requires tools: {tools_to_install}. Attempting installation...")
            if not self.mama_bear_agent or not self.mama_bear_agent.mcp_marketplace_manager:
                err_msg = "MCP Marketplace Manager not available. Cannot search/install tools."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="tool_installation_error", inputs={"step_id": step_id}, outputs={"error": err_msg})
                return {"success": False, "step_id": step_id, "status": "failed", "message": err_msg}

            for tool_name in tools_to_install:
                current_tool_details_for_log = {"tool_name": tool_name}
                logger.info(f"Searching for tool '{tool_name}' in MCP Marketplace for step {step_id}.")
                if project_logger: project_logger.log_entry(agent_action="tool_search_start", inputs=current_tool_details_for_log)
                
                try:
                    mcp_results = self.mama_bear_agent.mcp_marketplace_manager.search_servers(query=tool_name)
                    if not mcp_results:
                        warn_msg = f"Tool '{tool_name}' not found in MCP Marketplace. Skipping installation."
                        logger.warning(warn_msg)
                        if project_logger: project_logger.log_entry(agent_action="tool_search_result", inputs=current_tool_details_for_log, outputs={"found": False, "warning": warn_msg})
                        continue 
                    
                    tool_marketplace_details = mcp_results[0] 
                    current_tool_details_for_log.update(tool_marketplace_details) # Add more details for logging
                    logger.info(f"Found tool '{tool_name}': {tool_marketplace_details.get('name')}. Attempting installation for step {step_id}.")
                    if project_logger: project_logger.log_entry(agent_action="tool_search_result", inputs={"tool_name": tool_name}, outputs={"found": True, "details": tool_marketplace_details})
                    
                    install_success = await self.install_tool_in_environment(tool_marketplace_details, provisioned_env, project_logger) # Pass logger
                    
                    if install_success:
                        logger.info(f"Tool '{tool_name}' installed successfully in environment '{provisioned_env.get('env_id')}' for step {step_id}.")
                        if project_logger: project_logger.log_entry(agent_action="tool_installation_result", inputs=current_tool_details_for_log, outputs={"success": True})
                    else:
                        err_msg_install = f"Failed to install tool: {tool_name} for step {step_id}."
                        logger.error(err_msg_install)
                        if project_logger: project_logger.log_entry(agent_action="tool_installation_result", inputs=current_tool_details_for_log, outputs={"success": False, "error": err_msg_install})
                        
                        # Attempt RAG on installation failure
                        if self.mama_bear_agent:
                            logger.info(f"Attempting RAG for tool installation failure: {tool_name}")
                            rag_error_context = f"Failed to install tool '{tool_name}' (details: {tool_marketplace_details.get('name')}, method: {tool_marketplace_details.get('installation_method')}) in environment type {provisioned_env.get('type')}."
                            rag_suggestion = self.mama_bear_agent.self_debug_with_rag(
                                error_context=rag_error_context, 
                                project_id=project_id, 
                                user_id_for_mem_search=self.user_id
                            )
                            if project_logger:
                                project_logger.log_entry(
                                    agent_action="rag_suggestion_tool_install", 
                                    inputs={"failed_tool": tool_name, "error_context": rag_error_context},
                                    outputs={"suggestion": rag_suggestion if rag_suggestion else "No RAG suggestion."}
                                )
                            if rag_suggestion:
                                logger.info(f"RAG Suggestion for {tool_name} install failure: {rag_suggestion}")
                                # For now, just log. Future: could inform retry logic.
                        return {"success": False, "step_id": step_id, "status": "failed", "message": err_msg_install}
                
                except Exception as e_tool_search:
                    err_msg_tool_proc = f"Error during tool handling for '{tool_name}' in step {step_id}: {e_tool_search}"
                    logger.error(err_msg_tool_proc, exc_info=True)
                    if project_logger: project_logger.log_entry(agent_action="tool_processing_error", inputs={"tool_name": tool_name}, outputs={"error": str(e_tool_search)})
                    return {"success": False, "step_id": step_id, "status": "failed", "message": err_msg_tool_proc}
        else:
            logger.info(f"No specific tools listed as required for step {step_id}.")

        # 2. Actual execution logic of the step (Placeholder)
        # This is where the agent would use the installed tools or perform other actions
        # described in `step_details['description']`.
        logger.info(f"Placeholder for actual execution of step {step_id}: '{description}' using context and installed tools.")
        
        # --- Conceptual integration of new methods ---
        # For demonstration, call these after the main (placeholder) step logic.
        # In a real scenario, the plan would dictate when to run tests or capture output.

        # Example: If a step description implies a build or deployment, try running tests.
        if "build" in description.lower() or "deploy" in description.lower() or "setup" in description.lower() :
            logger.info(f"Step {step_id} implies build/deploy, attempting to run conceptual tests.")
            # Attempt a generic test command; this would ideally be derived from project type or plan.
            # For NixOS, a common workdir might be /home/executor/project or /app
            # For now, a very simple command that should work on most Linux.
            conceptual_test_command = "echo 'Conceptual test: Checking /app directory listing...' && ls -la /app || echo 'Skipping /app check if it fails'"
            if provisioned_env.get("type") == "cloud":
                conceptual_test_command = "echo 'Conceptual test for cloud (simulated)'"

            test_run_result = await self.run_tests_in_environment(project_context, test_command=conceptual_test_command)
            if project_logger:
                project_logger.log_entry(
                    agent_action="conceptual_test_run",
                    inputs={"step_id": step_id, "command": conceptual_test_command},
                    outputs=test_run_result
                )
            logger.info(f"Conceptual test run result for step {step_id}: {test_run_result.get('success')}")

        # Example: Always try to capture a directory listing as a preview.
        # In NixOS VMs, /home/executor or /app might be relevant.
        command_for_preview = "ls -la /app || echo 'Cannot list /app (may not exist)'" 
        if provisioned_env.get("type") == "cloud":
            command_for_preview = "echo 'Conceptual output preview for cloud (simulated)'"
            
        output_preview_result = await self.capture_output_preview(project_context, command_to_capture=command_for_preview)
        if project_logger:
            project_logger.log_entry(
                agent_action="conceptual_output_preview",
                inputs={"step_id": step_id, "command": command_for_preview},
                outputs=output_preview_result
            )
        logger.info(f"Conceptual output preview result for step {step_id} (success: {output_preview_result.get('success')}): {output_preview_result.get('stdout')[:200]}")
        
        # --- End of conceptual integration ---

        logger.info(f"Project Context for step execution: {project_context}") # This log might be too verbose for general use
        await asyncio.sleep(0.1) # Simulate some async work for the step itself
        
        return {
            "success": True, 
            "step_id": step_id, 
            "status": "completed", 
            "message": f"Step {step_id} placeholder execution (including tool checks, conceptual tests, and output preview) successful."
        }

    async def provision_environment(
        self, 
        project_id: str, 
        environment_preference: str = "auto", 
        project_requirements: Optional[Dict[str, Any]] = None,
        project_logger: Optional[Any] = None # Added project_logger param
    ) -> Dict[str, Any]:
        """
        Provisions a development environment based on preference and requirements.
        """
        log_inputs = {"project_id": project_id, "preference": environment_preference, "requirements": project_requirements}
        logger.info(f"Provisioning environment for Project ID: {project_id}, Preference: {environment_preference}")
        if project_requirements: logger.info(f"Project Requirements: {project_requirements}")
        if project_logger: project_logger.log_entry(agent_action="provision_environment_start", inputs=log_inputs)


        chosen_provider = None
        env_details = None

        if environment_preference == "nixos":
            chosen_provider = "nixos_persistent"
        elif environment_preference == "cloud":
            chosen_provider = "cloud"
        elif environment_preference == "auto":
            if project_requirements and project_requirements.get("os") == "nixos":
                chosen_provider = "nixos_persistent"
            else:
                chosen_provider = "cloud" # Default to cloud for auto
        else:
            logger.warning(f"Invalid environment_preference: {environment_preference}. Defaulting to 'auto' logic.")
            chosen_provider = "cloud" # Default if preference is unknown

        logger.info(f"Chosen provider based on preference/auto logic: {chosen_provider}")

        if chosen_provider == "nixos_persistent":
            if not self.vm_manager:
                logger.error("LibvirtManager (for NixOS persistent VMs) is not available.")
                return {"success": False, "error": "NixOS VM manager not available."}
            try:
                logger.info(f"Attempting to provision persistent NixOS VM: {project_id}")
                # Extract specific requirements for NixOS VM if provided
                memory_mb = project_requirements.get("ram_mb", 1024) if project_requirements else 1024
                vcpus = project_requirements.get("vcpus", 2) if project_requirements else 2

                # Use define_workspace_vm for persistent, networked VMs
                domain, disk_path = self.vm_manager.define_workspace_vm(
                    workspace_id=project_id, 
                    memory_mb=memory_mb, 
                    vcpus=vcpus
                )
                self.vm_manager.start_vm(domain)
                
                # Get IP address - important for project steps to connect
                # use_arp_fallback=True is good for workspace VMs that should have network
                ip_address = self.vm_manager.get_vm_ip_address(domain, timeout_seconds=120, use_arp_fallback=True)
                
                if not ip_address:
                    # This is a critical failure for a usable environment
                    logger.error(f"Failed to get IP address for NixOS VM {project_id}. Environment is not usable.")
                    # Attempt cleanup
                    try:
                        self.vm_manager.delete_workspace_vm(project_id)
                    except Exception as e_cleanup:
                        logger.error(f"Failed to cleanup NixOS VM {project_id} after IP failure: {e_cleanup}")
                    return {"success": False, "error": f"NixOS VM {project_id} provisioned but IP address could not be obtained."}

                env_details = {
                    "env_id": project_id,
                    "type": "nixos_persistent", # Changed from "nixos" to be more specific
                    "status": "ready",
                    "ip_address": ip_address,
                    "ssh_user": os.getenv("NIXOS_VM_SSH_USER", "executor"), 
                    "ssh_key_path": os.path.expanduser(os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor")),
                    "provider_details": {
                        "vm_name": project_id,
                        "disk_path": disk_path,
                        "memory_mb": memory_mb,
                        "vcpus": vcpus,
                        "libvirt_domain_uuid": domain.UUIDString()
                    }
                }
                logger.info(f"Persistent NixOS VM '{project_id}' provisioned successfully. IP: {ip_address}")
                if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": True, "details": env_details})
                return {"success": True, "environment_details": env_details}

            except VMManagerError as e:
                err_msg = f"NixOS VM provisioning failed: {str(e)}"
                logger.error(f"Failed to provision NixOS VM '{project_id}': {e}")
                if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "error": err_msg}
            except Exception as e: 
                err_msg = f"Unexpected error during NixOS VM provisioning: {str(e)}"
                logger.error(f"Unexpected error provisioning NixOS VM '{project_id}': {e}", exc_info=True)
                if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "error": err_msg}

        elif chosen_provider == "cloud":
            if not self.cloud_sandbox_manager:
                err_msg = "Cloud sandbox manager not available."
                logger.error(err_msg)
                # Fallback attempt if NixOS was the original auto choice but failed before this point
                if environment_preference == "auto" and project_requirements and project_requirements.get("os") == "nixos":
                     logger.info("Cloud provider chosen as fallback from failed NixOS attempt in 'auto' mode.")
                if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "error": err_msg}
            
            try:
                logger.info(f"Attempting to provision cloud environment for project: {project_id}")
                # Map project_requirements to env_config for cloud manager
                # Example: if project_requirements has "type": "python", pass that. Default to "node".
                cloud_env_type = project_requirements.get("type", "node") if project_requirements else "node"
                env_config = {
                    "id": project_id, # Use project_id as env_id for cloud
                    "type": cloud_env_type,
                    "name": f"agentic-proj-{project_id}" 
                    # Add other relevant fields from project_requirements if CloudDevSandboxManager supports them
                }
                # template could also be derived from project_requirements if needed
                cloud_env_result = await self.cloud_sandbox_manager.create_environment(env_config)

                if cloud_env_result.get("success"):
                    raw_cloud_env = cloud_env_result.get("environment", {})
                    env_details = {
                        "env_id": raw_cloud_env.get("id", project_id),
                        "type": "cloud",
                        "status": raw_cloud_env.get("status", "unknown"),
                        "url": raw_cloud_env.get("url"),
                        "provider": raw_cloud_env.get("provider"),
                        "provider_details": raw_cloud_env 
                    }
                    logger.info(f"Cloud environment '{project_id}' (Provider: {env_details.get('provider')}) provisioned successfully: {env_details.get('url')}")
                    if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": True, "details": env_details})
                    return {"success": True, "environment_details": env_details}
                else:
                    error_msg = cloud_env_result.get("error", cloud_env_result.get("message", "Cloud provisioning failed."))
                    logger.error(f"Failed to provision cloud environment for '{project_id}': {error_msg}")
                    if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": error_msg})
                    return {"success": False, "error": f"Cloud environment provisioning failed: {error_msg}"}

            except Exception as e:
                err_msg = f"Unexpected error during cloud environment provisioning: {str(e)}"
                logger.error(f"Unexpected error provisioning cloud environment for '{project_id}': {e}", exc_info=True)
                if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "error": err_msg}
        
        else: 
            err_msg = f"Internal error: Unknown provider '{chosen_provider}' selected."
            logger.error(err_msg)
            if project_logger: project_logger.log_entry(agent_action="provision_environment_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
            return {"success": False, "error": err_msg}

    async def install_tool_in_environment(self, tool_details: Dict, environment_context: Dict, project_logger: Optional[Any] = None) -> bool:
        """
        Installs a given tool into the specified environment.
        """
        tool_name = tool_details.get("name", "UnknownTool")
        install_method = tool_details.get("installation_method", "unknown").lower()
        package_to_install = tool_details.get("package_name", tool_name)

        env_type = environment_context.get("type")
        env_id = environment_context.get("env_id")
        
        log_inputs_install = {"tool_name": tool_name, "package": package_to_install, "method": install_method, "env_id": env_id, "env_type": env_type}
        logger.info(f"Attempting to install tool '{tool_name}' (package: '{package_to_install}', method: '{install_method}') in {env_type} environment '{env_id}'.")
        if project_logger: project_logger.log_entry(agent_action="install_tool_start", inputs=log_inputs_install)


        if env_type == "nixos_persistent":
            if not SSH_EXECUTOR_AVAILABLE:
                err_msg = "SSHExecutor is not available. Cannot install tools in NixOS VM."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False
            
            ip_address = environment_context.get("ip_address")
            ssh_user = environment_context.get("ssh_user")
            ssh_key_path = environment_context.get("ssh_key_path")

            if not all([ip_address, ssh_user, ssh_key_path]):
                err_msg = f"Missing SSH details for NixOS VM {env_id}. Cannot install tool."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False

            command = ""
            # Prioritize nix-env for NixOS if specified or as a sensible default if method is vague
            if install_method == "nix-env":
                 command = f"nix-env -iA nixos.{package_to_install}" # Example, actual attribute path might vary for nixpkgs vs nixos.*
            elif install_method == "pip":
                command = f"pip3 install {package_to_install}" 
            elif install_method == "npm":
                command = f"npm install -g {package_to_install}" 
            elif install_method == "apt":
                logger.warning(f"Installation method 'apt' specified for NixOS environment '{env_id}'. NixOS uses 'nix-env'. This command will likely fail or be inappropriate.")
                command = f"sudo apt-get update && sudo apt-get install -y {package_to_install}"
            else:
                err_msg = f"Unsupported or unknown installation method '{install_method}' for tool '{tool_name}' in NixOS."
                logger.warning(err_msg)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False
            
            if not command: # Should be caught by else above, but as a safeguard
                err_msg = f"Could not construct installation command for tool '{tool_name}'."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False

            ssh_executor = None
            try:
                logger.info(f"Creating SSHExecutor for {ssh_user}@{ip_address} using key {ssh_key_path}")
                ssh_executor = SSHExecutor(host_ip=ip_address, username=ssh_user, private_key_path=ssh_key_path)
                logger.info(f"Executing installation command in NixOS VM '{env_id}': {command}")
                
                # Provide a reasonable timeout for installations
                stdout, stderr, exit_code = ssh_executor.execute_command(command, timeout=300) 
                
                log_outputs_install = {"stdout": stdout, "stderr": stderr, "exit_code": exit_code}
                if exit_code == 0:
                    logger.info(f"Tool '{tool_name}' installed successfully in NixOS VM '{env_id}'. STDOUT: {stdout}")
                    if stderr: logger.warning(f"NixOS tool installation STDERR for '{tool_name}': {stderr}")
                    if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": True, **log_outputs_install})
                    return True
                else:
                    err_msg = f"Failed to install tool '{tool_name}' in NixOS VM '{env_id}'. Exit: {exit_code}"
                    logger.error(f"{err_msg}\nSTDOUT: {stdout}\nSTDERR: {stderr}")
                    if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg, **log_outputs_install})
                    return False
            except SSHExecutorError as e:
                err_msg = f"SSHExecutorError while installing tool '{tool_name}' in NixOS VM '{env_id}': {e}"
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False
            except Exception as e:
                err_msg = f"Unexpected error installing tool '{tool_name}' in NixOS VM '{env_id}': {e}"
                logger.error(err_msg, exc_info=True)
                if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
                return False
            finally:
                if ssh_executor:
                    ssh_executor.close()

        elif env_type == "cloud":
            sim_msg = f"Simulated successful installation for tool '{tool_name}' in cloud environment '{env_id}'. Actual process involves config file changes and provider's build system."
            logger.info(sim_msg)
            if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": True, "message": sim_msg})
            return True 

        else:
            err_msg = f"Unknown environment type '{env_type}' for tool installation. Cannot install '{tool_name}'."
            logger.warning(err_msg)
            if project_logger: project_logger.log_entry(agent_action="install_tool_result", inputs=log_inputs_install, outputs={"success": False, "error": err_msg})
            return False

    async def plan_project(self, high_level_prompt: str, project_logger: Optional[Any] = None) -> Dict[str, Any]: # Added project_logger
        """
        Generates a project plan using UnifiedMamaBearAgent.
        """
        logger.info(f"Initiating project planning for prompt: '{high_level_prompt}'")
        if project_logger: project_logger.log_entry(agent_action="plan_project_start", inputs={"prompt": high_level_prompt})

        if not self.mama_bear_agent:
            logger.error("UnifiedMamaBearAgent not available for project planning.")
            if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": "AI agent not available."})
            return {"success": False, "error": "AI agent not available."}

        planning_prompt = f"""
        Objective: Decompose the following high-level project prompt into a series of actionable steps.
        Project Prompt: "{high_level_prompt}"

        Output Format:
        Return a JSON object with a single key "plan". The value of "plan" should be a list of dictionaries.
        Each dictionary represents a step and must include the following keys:
        - "step_id": A unique integer identifier for the step (e.g., 1, 2, 3).
        - "description": A concise description of what needs to be done in this step.
        - "tools_required": A list of strings, naming potential MCPs (e.g., "CodeGeneratorMCP", "FileAccessMCP") or general tools/technologies (e.g., "Python", "Flask", "Docker", "Git").
        - "status": Initialize to "pending".
        - "deliverables": A brief description of what this step will produce.

        Example of a step dictionary:
        {{
            "step_id": 1,
            "description": "Set up project structure and initialize Git repository.",
            "tools_required": ["Git", "FileAccessMCP"],
            "status": "pending",
            "deliverables": "A new directory with basic project folders (e.g., src, tests, docs) and an initialized Git repo."
        }}

        Please generate the plan now.
        """

        try:
            logger.info("Sending planning prompt to UnifiedMamaBearAgent...")
            if not MamaBearTaskType: # Safety check
                ai_response_text = self.mama_bear_agent.vertex_ai_chat(planning_prompt)
            else:
                ai_response_text = self.mama_bear_agent.vertex_ai_chat(planning_prompt, task_type=MamaBearTaskType.PLANNING)
            
            if project_logger: project_logger.log_entry(agent_action="ai_plan_raw_response", inputs={"prompt": planning_prompt}, outputs={"raw_response": ai_response_text})
            
            if not ai_response_text or not ai_response_text.strip():
                err_msg = "AI returned an empty response for project planning."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": err_msg})
                return {"success": False, "error": err_msg}

            logger.info(f"Received AI response for planning: {ai_response_text[:500]}...") 

            if "```json" in ai_response_text:
                json_block = ai_response_text.split("```json")[1].split("```")[0].strip()
            else:
                json_block = ai_response_text.strip()
            
            parsed_response = json.loads(json_block)
            
            if "plan" not in parsed_response or not isinstance(parsed_response["plan"], list):
                err_msg = "AI response is not in the expected format (missing 'plan' list)."
                logger.error(f"{err_msg} Response: {parsed_response}")
                if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": err_msg, "raw_response": ai_response_text})
                return {"success": False, "error": err_msg}

            for step in parsed_response["plan"]:
                if not all(key in step for key in ["step_id", "description", "tools_required", "status", "deliverables"]):
                    err_msg = "A step in the plan is malformed (missing required keys)."
                    logger.error(f"{err_msg} Step: {step}")
                    if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": err_msg, "plan_attempt": parsed_response["plan"]})
                    return {"success": False, "error": err_msg}
            
            logger.info(f"Successfully generated project plan with {len(parsed_response['plan'])} steps.")
            if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": True, "plan": parsed_response["plan"]})
            return {"success": True, "plan": parsed_response["plan"]}

        except json.JSONDecodeError as e:
            err_msg = f"JSON parsing failed for AI planning response: {e}. Response was: {ai_response_text}"
            logger.error(err_msg)
            if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": err_msg, "raw_response": ai_response_text})
            return {"success": False, "error": err_msg}
        except Exception as e:
            err_msg = f"An unexpected error occurred during project planning: {e}"
            logger.error(err_msg, exc_info=True)
            if project_logger: project_logger.log_entry(agent_action="plan_project_result", inputs={"prompt": high_level_prompt}, outputs={"success": False, "error": err_msg})
            return {"success": False, "error": str(e)}

    async def run_tests_in_environment(self, project_context: Dict[str, Any], test_command: Optional[str] = None) -> Dict[str, Any]:
        """
        Runs tests in the provisioned environment.
        """
        provisioned_env = project_context.get("provisioned_environment")
        project_logger = project_context.get("project_logger")
        project_id = project_context.get("project_id", "unknown_project")

        if not provisioned_env:
            err_msg = "No provisioned environment found in project context for running tests."
            logger.error(err_msg)
            if project_logger: project_logger.log_entry(agent_action="run_tests_error", inputs={"project_id": project_id}, outputs={"error": err_msg})
            return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}

        env_type = provisioned_env.get("type")
        env_id = provisioned_env.get("env_id")
        
        actual_test_command = test_command
        if not actual_test_command:
            # Basic default command logic (can be expanded)
            # project_type = project_context.get("project_type", "unknown") # Assuming project_type might be in context
            # if project_type == "node": actual_test_command = "npm test"
            # elif project_type == "python": actual_test_command = "python -m unittest discover"
            # else:
            actual_test_command = "echo 'No specific test command provided, running conceptual health check.' && exit 0"
            logger.info(f"No specific test command provided for {env_id}. Using default: {actual_test_command}")

        log_inputs = {"env_id": env_id, "env_type": env_type, "command": actual_test_command, "project_id": project_id}
        logger.info(f"Attempting to run tests in {env_type} environment '{env_id}' with command: {actual_test_command}")
        if project_logger: project_logger.log_entry(agent_action="run_tests_start", inputs=log_inputs)

        if env_type == "nixos_persistent":
            if not SSH_EXECUTOR_AVAILABLE:
                err_msg = "SSHExecutor not available. Cannot run tests in NixOS VM."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}

            ip_address = provisioned_env.get("ip_address")
            ssh_user = provisioned_env.get("ssh_user")
            ssh_key_path = provisioned_env.get("ssh_key_path")

            if not all([ip_address, ssh_user, ssh_key_path]):
                err_msg = f"Missing SSH details for NixOS VM {env_id}. Cannot run tests."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            
            ssh_executor = None
            try:
                ssh_executor = SSHExecutor(host_ip=ip_address, username=ssh_user, private_key_path=ssh_key_path)
                # Assuming tests might run in a specific directory, e.g., /app or /home/executor/project
                # Prepending cd for now, but this should be more context-aware.
                # Caution: Chaining commands with '&&' means if 'cd' fails, the test_command won't run.
                # A more robust approach might involve multiple exec_command calls or ensuring the SSH user's default dir is correct.
                command_to_execute_in_vm = f"cd /app && {actual_test_command}" # Example: default to /app
                logger.info(f"Executing test command in NixOS VM '{env_id}': {command_to_execute_in_vm}")
                
                stdout, stderr, exit_code = ssh_executor.execute_command(command_to_execute_in_vm, timeout=600) # 10 min timeout for tests
                
                success = exit_code == 0
                log_outputs = {"success": success, "stdout": stdout, "stderr": stderr, "exit_code": exit_code}
                logger.info(f"Test run in NixOS VM '{env_id}' completed. Success: {success}. Exit Code: {exit_code}")
                if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs=log_outputs)
                return log_outputs
            except SSHExecutorError as e:
                err_msg = f"SSHExecutorError while running tests in NixOS VM '{env_id}': {e}"
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            except Exception as e:
                err_msg = f"Unexpected error running tests in NixOS VM '{env_id}': {e}"
                logger.error(err_msg, exc_info=True)
                if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            finally:
                if ssh_executor:
                    ssh_executor.close()

        elif env_type == "cloud":
            sim_stdout = f"Test execution in cloud environment '{env_id}' for command '{actual_test_command}' is provider-specific and simulated as successful."
            logger.info(sim_stdout)
            log_outputs = {"success": True, "stdout": sim_stdout, "stderr": "", "exit_code": 0}
            if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs=log_outputs)
            return log_outputs
        else:
            err_msg = f"Unsupported environment type '{env_type}' for running tests."
            logger.warning(err_msg)
            if project_logger: project_logger.log_entry(agent_action="run_tests_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
            return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}

    async def capture_output_preview(self, project_context: Dict[str, Any], command_to_capture: str) -> Dict[str, Any]:
        """
        Captures the output of a command in the provisioned environment for preview.
        """
        provisioned_env = project_context.get("provisioned_environment")
        project_logger = project_context.get("project_logger")
        project_id = project_context.get("project_id", "unknown_project")

        if not provisioned_env:
            err_msg = "No provisioned environment found in project context for capturing output."
            logger.error(err_msg)
            if project_logger: project_logger.log_entry(agent_action="capture_output_error", inputs={"project_id": project_id, "command": command_to_capture}, outputs={"error": err_msg})
            return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}

        env_type = provisioned_env.get("type")
        env_id = provisioned_env.get("env_id")

        log_inputs = {"env_id": env_id, "env_type": env_type, "command": command_to_capture, "project_id": project_id}
        logger.info(f"Attempting to capture output in {env_type} environment '{env_id}' for command: {command_to_capture}")
        if project_logger: project_logger.log_entry(agent_action="capture_output_start", inputs=log_inputs)

        if env_type == "nixos_persistent":
            if not SSH_EXECUTOR_AVAILABLE:
                err_msg = "SSHExecutor not available. Cannot capture output in NixOS VM."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}

            ip_address = provisioned_env.get("ip_address")
            ssh_user = provisioned_env.get("ssh_user")
            ssh_key_path = provisioned_env.get("ssh_key_path")

            if not all([ip_address, ssh_user, ssh_key_path]):
                err_msg = f"Missing SSH details for NixOS VM {env_id}. Cannot capture output."
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            
            ssh_executor = None
            try:
                ssh_executor = SSHExecutor(host_ip=ip_address, username=ssh_user, private_key_path=ssh_key_path)
                # Assuming commands might be relative to a project dir, e.g., /app
                command_to_execute_in_vm = f"cd /app && {command_to_capture}" # Example: default to /app
                logger.info(f"Executing command for output capture in NixOS VM '{env_id}': {command_to_execute_in_vm}")
                
                stdout, stderr, exit_code = ssh_executor.execute_command(command_to_execute_in_vm, timeout=60) # 1 min timeout for previews
                
                success = exit_code == 0
                log_outputs = {"success": success, "stdout": stdout, "stderr": stderr, "exit_code": exit_code}
                logger.info(f"Output capture in NixOS VM '{env_id}' completed. Success: {success}. Exit Code: {exit_code}")
                if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs=log_outputs)
                return log_outputs
            except SSHExecutorError as e:
                err_msg = f"SSHExecutorError while capturing output in NixOS VM '{env_id}': {e}"
                logger.error(err_msg)
                if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            except Exception as e:
                err_msg = f"Unexpected error capturing output in NixOS VM '{env_id}': {e}"
                logger.error(err_msg, exc_info=True)
                if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
                return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}
            finally:
                if ssh_executor:
                    ssh_executor.close()

        elif env_type == "cloud":
            sim_stdout = f"Output capture in cloud environment '{env_id}' for command '{command_to_capture}' is provider-specific and simulated as successful."
            logger.info(sim_stdout)
            log_outputs = {"success": True, "stdout": sim_stdout, "stderr": "", "exit_code": 0}
            if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs=log_outputs)
            return log_outputs
        else:
            err_msg = f"Unsupported environment type '{env_type}' for capturing output."
            logger.warning(err_msg)
            if project_logger: project_logger.log_entry(agent_action="capture_output_result", inputs=log_inputs, outputs={"success": False, "error": err_msg})
            return {"success": False, "stdout": "", "stderr": err_msg, "exit_code": -1}


class CloudDevSandboxManager:
    def __init__(self):
                step["status"] = "completed"
                completed_steps += 1
                logger.info(f"Step {step_id} completed successfully.")
            else:
                step["status"] = "failed"
                failed_steps.append({"step_id": step_id, "error": execution_result.get("message", "Unknown error")})
                logger.error(f"Step {step_id} failed: {execution_result.get('message')}")
                # Decide if workflow should stop on first failure or continue
                # For now, let's stop on first failure to keep it simple
                return {
                    "success": False,
                    "error": f"Step {step_id} execution failed: {execution_result.get('message')}",
                    "summary": f"Workflow failed at step {step_id}. {completed_steps}/{len(project_plan)} steps attempted.",
                    "completed_steps_count": completed_steps,
                    "failed_step_details": failed_steps,
                    "project_plan_final_state": project_plan
                }
            logger.info(f"--- Finished Step {step_id} ---")

        summary_message = f"Project workflow completed. {completed_steps}/{len(project_plan)} steps executed successfully."
        logger.info(summary_message)
        
        # Log intent to manage/teardown the environment
        logger.info(f"Workflow finished. Environment {provisioned_env_details.get('env_id')} of type {provisioned_env_details.get('type')} would be managed/torn down here.")
        # Actual teardown logic (e.g., self.vm_manager.delete_workspace_vm(project_id) or self.cloud_sandbox_manager.delete_environment(project_id))
        # is out of scope for this specific subtask but would be added in a full lifecycle management.

        return {
            "success": True,
            "summary": summary_message,
            "completed_steps_count": completed_steps,
            "total_steps": len(project_plan),
            "project_plan_final_state": project_plan,
            "provisioned_environment": provisioned_env_details
        }

    async def provision_environment(
        self, 
        project_id: str, 
        environment_preference: str = "auto", 
        project_requirements: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Provisions a development environment based on preference and requirements.
        """
        logger.info(f"Provisioning environment for Project ID: {project_id}, Preference: {environment_preference}")
        if project_requirements:
            logger.info(f"Project Requirements: {project_requirements}")

        chosen_provider = None
        env_details = None

        if environment_preference == "nixos":
            chosen_provider = "nixos_persistent"
        elif environment_preference == "cloud":
            chosen_provider = "cloud"
        elif environment_preference == "auto":
            if project_requirements and project_requirements.get("os") == "nixos":
                chosen_provider = "nixos_persistent"
            else:
                chosen_provider = "cloud" # Default to cloud for auto
        else:
            logger.warning(f"Invalid environment_preference: {environment_preference}. Defaulting to 'auto' logic.")
            chosen_provider = "cloud" # Default if preference is unknown

        logger.info(f"Chosen provider based on preference/auto logic: {chosen_provider}")

        if chosen_provider == "nixos_persistent":
            if not self.vm_manager:
                logger.error("LibvirtManager (for NixOS persistent VMs) is not available.")
                return {"success": False, "error": "NixOS VM manager not available."}
            try:
                logger.info(f"Attempting to provision persistent NixOS VM: {project_id}")
                # Extract specific requirements for NixOS VM if provided
                memory_mb = project_requirements.get("ram_mb", 1024) if project_requirements else 1024
                vcpus = project_requirements.get("vcpus", 2) if project_requirements else 2

                # Use define_workspace_vm for persistent, networked VMs
                domain, disk_path = self.vm_manager.define_workspace_vm(
                    workspace_id=project_id, 
                    memory_mb=memory_mb, 
                    vcpus=vcpus
                )
                self.vm_manager.start_vm(domain)
                
                # Get IP address - important for project steps to connect
                # use_arp_fallback=True is good for workspace VMs that should have network
                ip_address = self.vm_manager.get_vm_ip_address(domain, timeout_seconds=120, use_arp_fallback=True)
                
                if not ip_address:
                    # This is a critical failure for a usable environment
                    logger.error(f"Failed to get IP address for NixOS VM {project_id}. Environment is not usable.")
                    # Attempt cleanup
                    try:
                        self.vm_manager.delete_workspace_vm(project_id)
                    except Exception as e_cleanup:
                        logger.error(f"Failed to cleanup NixOS VM {project_id} after IP failure: {e_cleanup}")
                    return {"success": False, "error": f"NixOS VM {project_id} provisioned but IP address could not be obtained."}

                env_details = {
                    "env_id": project_id,
                    "type": "nixos_persistent",
                    "status": "ready",
                    "ip_address": ip_address,
                    "ssh_user": os.getenv("NIXOS_VM_SSH_USER", "executor"), # Assuming same user as ephemeral
                    "ssh_key_path": os.path.expanduser(os.getenv("NIXOS_VM_SSH_KEY_PATH", "~/.ssh/id_rsa_nixos_vm_executor")),
                    "provider_details": {
                        "vm_name": project_id,
                        "disk_path": disk_path,
                        "memory_mb": memory_mb,
                        "vcpus": vcpus,
                        "libvirt_domain_uuid": domain.UUIDString()
                    }
                }
                logger.info(f"Persistent NixOS VM '{project_id}' provisioned successfully. IP: {ip_address}")
                return {"success": True, "environment_details": env_details}

            except VMManagerError as e:
                logger.error(f"Failed to provision NixOS VM '{project_id}': {e}")
                return {"success": False, "error": f"NixOS VM provisioning failed: {str(e)}"}
            except Exception as e: # Catch any other unexpected error from LibvirtManager
                logger.error(f"Unexpected error provisioning NixOS VM '{project_id}': {e}", exc_info=True)
                return {"success": False, "error": f"Unexpected error during NixOS VM provisioning: {str(e)}"}

        elif chosen_provider == "cloud":
            if not self.cloud_sandbox_manager:
                logger.error("CloudDevSandboxManager is not available.")
                # Fallback attempt if NixOS was the original auto choice but failed before this point
                if environment_preference == "auto" and project_requirements and project_requirements.get("os") == "nixos":
                     logger.info("Cloud provider chosen as fallback from failed NixOS attempt in 'auto' mode.")
                return {"success": False, "error": "Cloud sandbox manager not available."}
            
            try:
                logger.info(f"Attempting to provision cloud environment for project: {project_id}")
                # Map project_requirements to env_config for cloud manager
                # Example: if project_requirements has "type": "python", pass that. Default to "node".
                cloud_env_type = project_requirements.get("type", "node") if project_requirements else "node"
                env_config = {
                    "id": project_id, # Use project_id as env_id for cloud
                    "type": cloud_env_type,
                    "name": f"agentic-proj-{project_id}" 
                    # Add other relevant fields from project_requirements if CloudDevSandboxManager supports them
                }
                # template could also be derived from project_requirements if needed
                cloud_env_result = await self.cloud_sandbox_manager.create_environment(env_config)

                if cloud_env_result.get("success"):
                    raw_cloud_env = cloud_env_result.get("environment", {})
                    env_details = {
                        "env_id": raw_cloud_env.get("id", project_id),
                        "type": "cloud",
                        "status": raw_cloud_env.get("status", "unknown"),
                        "url": raw_cloud_env.get("url"),
                        "provider": raw_cloud_env.get("provider"),
                        "provider_details": raw_cloud_env 
                    }
                    logger.info(f"Cloud environment '{project_id}' (Provider: {env_details.get('provider')}) provisioned successfully: {env_details.get('url')}")
                    return {"success": True, "environment_details": env_details}
                else:
                    error_msg = cloud_env_result.get("error", cloud_env_result.get("message", "Cloud provisioning failed."))
                    logger.error(f"Failed to provision cloud environment for '{project_id}': {error_msg}")
                    return {"success": False, "error": f"Cloud environment provisioning failed: {error_msg}"}

            except Exception as e:
                logger.error(f"Unexpected error provisioning cloud environment for '{project_id}': {e}", exc_info=True)
                return {"success": False, "error": f"Unexpected error during cloud environment provisioning: {str(e)}"}
        
        else: # Should not happen if logic is correct
            logger.error(f"Unknown provider '{chosen_provider}' selected. This is a bug.")
            return {"success": False, "error": f"Internal error: Unknown provider '{chosen_provider}' selected."}


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
    
    async def _create_github_codespace(self, env_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a GitHub Codespace environment"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        
        if not self.github_token:
            return await self._create_local_fallback(env_config)
        
        try:
            # GitHub Codespaces API call would go here
            # For now, return a placeholder URL structure
            codespace_url = f"https://github.com/codespaces/new?machine=basicLinux32gb"
            
            environment = {
                "id": env_id,
                "provider": "github_codespaces",
                "type": env_type,
                "url": codespace_url,
                "status": "creating",
                "created_at": time.time()
            }
            
            self.environments[env_id] = environment
            
            return {
                "success": True,
                "environment": environment,
                "message": f"GitHub Codespace environment initiated: {codespace_url}"
            }
            
        except Exception as e:
            logger.error(f"Error creating GitHub Codespace: {e}")
            return await self._create_local_fallback(env_config)
    
    async def _create_replit_environment(self, env_config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a Replit environment"""
        env_id = env_config.get('id', str(uuid.uuid4()))
        env_type = env_config.get('type', 'node')
        
        if not self.replit_token:
            return await self._create_local_fallback(env_config)
        
        try:
            # Replit API call would go here
            # For now, return a placeholder URL structure
            replit_url = f"https://replit.com/@username/podplay-{env_id}"
            
            environment = {
                "id": env_id,
                "provider": "replit",
                "type": env_type,
                "url": replit_url,
                "status": "creating",
                "created_at": time.time()
            }
            
            self.environments[env_id] = environment
            
            return {
                "success": True,
                "environment": environment,
                "message": f"Replit environment initiated: {replit_url}"
            }
            
        except Exception as e:
            logger.error(f"Error creating Replit environment: {e}")
            return await self._create_local_fallback(env_config)
    
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

# Global instance
cloud_dev_sandbox = CloudDevSandboxManager()
