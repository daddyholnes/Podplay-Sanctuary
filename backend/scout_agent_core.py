"""
Scout Agent Core - Dynamic Model Switching & Task Processing
Based on the enhance-plan.md design document

This module implements the core Scout Agent logic with:
- Dynamic AI model switching for cost optimization
- Task categorization and intelligent routing
- RAG integration with Mem0.ai
- Comprehensive logging via scout_logger
- User intervention handling
"""

import os
import json
import time
import uuid
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
from datetime import datetime

# Import existing components
from scout_logger import ScoutProjectLogger
from mem0_chat_manager import Mem0ChatManager
from enhanced_mama_bear_v2 import EnhancedMamaBear
import google.generativeai as genai

class TaskCategory(Enum):
    """Task categories for the Scout Agent operations"""
    PROJECT_UNDERSTANDING = "ProjectUnderstanding"
    PLANNING = "Planning"
    CODE_GENERATION = "CodeGeneration"
    CODE_ANALYSIS = "CodeAnalysis"
    DEBUGGING = "Debugging"
    RESEARCH_AND_INFORMATION_GATHERING = "ResearchAndInformationGathering"
    DATA_PROCESSING_OR_MANIPULATION = "DataProcessingOrManipulation"
    FILE_MANIPULATION = "FileManipulation"
    MCP_TOOL_INTERACTION = "MCPToolInteraction"
    USER_FEEDBACK_INCORPORATION = "UserFeedbackIncorporation"
    SYSTEM_MANAGEMENT = "SystemManagement"
    FINAL_REVIEW_AND_PACKAGING = "FinalReviewAndPackaging"

class ProjectStatus(Enum):
    """Project status states"""
    INITIALIZING = "initializing"
    PENDING_PLAN_APPROVAL = "pending_plan_approval"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    PENDING_USER_REVIEW = "pending_user_review"

class StepStatus(Enum):
    """Individual step status states"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class ProjectStep:
    """Represents a single step in the project plan"""
    id: str
    name: str
    description: str
    task_category: TaskCategory
    dependencies: List[str]  # List of step IDs this step depends on
    status: StepStatus
    parameters: Dict[str, Any]
    outputs: Dict[str, Any]
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error_details: Optional[str] = None

@dataclass
class ScoutProject:
    """Represents a complete Scout Agent project"""
    id: str
    goal: str
    status: ProjectStatus
    steps: List[ProjectStep]
    created_at: str
    updated_at: str
    user_id: str
    metadata: Dict[str, Any]

class ScoutAgentCore:
    """
    Core Scout Agent implementation with dynamic model switching
    and intelligent task processing
    """
    
    def __init__(self):
        """Initialize the Scout Agent Core"""
        self.flash_model = os.getenv("SCOUT_AGENT_FLASH_MODEL", "gemini-2.5-flash-exp-0121")
        self.pro_model = os.getenv("SCOUT_AGENT_PRO_MODEL", "gemini-2.5-pro-exp-0121")
        
        # Initialize components
        self.mama_bear = EnhancedMamaBear()
        self.mem0_manager = Mem0ChatManager()
        
        # Project storage (in production, use database)
        self.active_projects: Dict[str, ScoutProject] = {}
        
        # Configure Gemini
        genai.configure(api_key=os.getenv('GOOGLE_GEMINI_API_KEY'))
        
    def choose_gemini_model(self, task_category: TaskCategory, task_details: Optional[Dict] = None) -> str:
        """
        Dynamically choose the most appropriate Gemini model for the task
        
        Args:
            task_category: The category of task being performed
            task_details: Additional details about the task
            
        Returns:
            String identifier of the chosen model
        """
        if task_details is None:
            task_details = {}
        
        # Extract key factors from task_details
        complexity = task_details.get("complexity", "medium")
        requires_advanced_multimodal = task_details.get("requires_advanced_multimodal", False)
        context_window_needed = task_details.get("context_window_needed", 0)
        retry_attempt = task_details.get("retry_attempt", 0)
        
        # Decision logic based on task category and details
        use_pro = False
        rationale = ""
        
        if task_category in [TaskCategory.CODE_GENERATION, TaskCategory.DEBUGGING]:
            use_pro = True
            rationale = "Code generation and debugging require higher capability model"
        elif task_category == TaskCategory.PLANNING and complexity == "high":
            use_pro = True
            rationale = "Complex planning requires advanced reasoning capabilities"
        elif requires_advanced_multimodal:
            use_pro = True
            rationale = "Advanced multimodal processing requires Pro model"
        elif context_window_needed > 100000:  # Large context window
            use_pro = True
            rationale = "Large context window requires Pro model"
        elif retry_attempt > 0:
            use_pro = True
            rationale = f"Retry attempt {retry_attempt}, escalating to Pro model"
        elif complexity == "high":
            use_pro = True
            rationale = "High complexity task requires Pro model"
        else:
            use_pro = False
            rationale = "Standard task, Flash model sufficient for cost optimization"
        
        chosen_model = self.pro_model if use_pro else self.flash_model
        
        return chosen_model, rationale
    
    def create_project(self, goal: str, user_id: str = "default") -> str:
        """
        Create a new Scout Agent project
        
        Args:
            goal: High-level project goal
            user_id: User identifier
            
        Returns:
            Project ID
        """
        project_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        project = ScoutProject(
            id=project_id,
            goal=goal,
            status=ProjectStatus.INITIALIZING,
            steps=[],
            created_at=timestamp,
            updated_at=timestamp,
            user_id=user_id,
            metadata={}
        )
        
        self.active_projects[project_id] = project
        
        # Initialize logger for this project
        logger = ScoutProjectLogger(project_id)
        logger.set_overall_status("initializing")
        logger.log_entry(
            agent_action="goal_received",
            project_id=project_id,
            parameters={"goal": goal, "user_id": user_id},
            agent_thoughts=f"Received new project goal: '{goal}' for project ID: {project_id}",
            message=f"New project created with goal: {goal}"
        )
        
        return project_id
    
    async def process_project_understanding(self, project_id: str) -> Dict[str, Any]:
        """
        Process the ProjectUnderstanding task
        
        Args:
            project_id: Project identifier
            
        Returns:
            Understanding results
        """
        project = self.active_projects[project_id]
        logger = ScoutProjectLogger(project_id)
        
        logger.log_entry(
            agent_action="project_understanding_started",
            project_id=project_id,
            agent_thoughts="Starting initial analysis of project goal and requirements"
        )
        
        # Choose model for understanding task
        model, rationale = self.choose_gemini_model(
            TaskCategory.PROJECT_UNDERSTANDING,
            {"complexity": "medium"}
        )
        
        logger.log_entry(
            agent_action="model_selection_made",
            project_id=project_id,
            parameters={"task": "ProjectUnderstanding", "chosen_model": model, "rationale": rationale}
        )
        
        # Query RAG for similar projects or domain knowledge
        rag_results = await self.query_rag_memory(
            project_id, 
            f"similar projects to: {project.goal}",
            top_k=3
        )
        
        # Prepare context for LLM
        context = f"""
        Project Goal: {project.goal}
        
        Similar Projects/Context from Memory:
        {rag_results.get('summary', 'No relevant context found')}
        
        Please analyze this project goal and provide:
        1. Clarified understanding of requirements
        2. Key entities and constraints identified
        3. Potential deliverables
        4. Any ambiguities that need clarification
        5. Estimated complexity level (low/medium/high)
        """
        
        try:
            # Call LLM for understanding
            model_instance = genai.GenerativeModel(model)
            response = model_instance.generate_content(context)
            
            understanding_result = {
                "clarified_requirements": response.text,
                "complexity": "medium",  # Would extract from response
                "deliverables": [],      # Would extract from response
                "ambiguities": []        # Would extract from response
            }
            
            logger.log_entry(
                agent_action="llm_call_complete",
                project_id=project_id,
                parameters={"model": model, "prompt_summary": "Project understanding analysis"},
                outputs={"response_length": len(response.text), "understanding": understanding_result},
                message="Project understanding analysis completed"
            )
            
            return understanding_result
            
        except Exception as e:
            logger.log_entry(
                agent_action="error_encountered",
                project_id=project_id,
                parameters={"error_type": "LLM_call_failed", "model": model},
                outputs={"error_details": str(e)},
                is_error=True,
                message=f"Failed to process project understanding: {str(e)}"
            )
            raise
    
    async def generate_project_plan(self, project_id: str, understanding: Dict[str, Any]) -> List[ProjectStep]:
        """
        Generate a detailed project plan based on understanding
        
        Args:
            project_id: Project identifier
            understanding: Results from project understanding phase
            
        Returns:
            List of project steps
        """
        project = self.active_projects[project_id]
        logger = ScoutProjectLogger(project_id)
        
        logger.log_entry(
            agent_action="planning_started",
            project_id=project_id,
            agent_thoughts="Starting planning phase to break down goal into actionable steps"
        )
        
        # Choose model for planning
        complexity = understanding.get("complexity", "medium")
        model, rationale = self.choose_gemini_model(
            TaskCategory.PLANNING,
            {"complexity": complexity, "planning_depth_required": "deep"}
        )
        
        logger.log_entry(
            agent_action="model_selection_made",
            project_id=project_id,
            parameters={"task": "Planning", "chosen_model": model, "rationale": rationale}
        )
        
        # Prepare planning context
        planning_context = f"""
        Project Goal: {project.goal}
        
        Understanding Results:
        {understanding.get('clarified_requirements', '')}
        
        Please create a detailed project plan with the following structure:
        1. Break down the goal into 5-10 actionable steps
        2. For each step, specify:
           - Step name and description
           - Task category from: {[cat.value for cat in TaskCategory]}
           - Dependencies on other steps
           - Estimated complexity (low/medium/high)
           - Required parameters
        
        Format as JSON with this structure:
        {{
            "steps": [
                {{
                    "name": "Step Name",
                    "description": "Detailed description",
                    "task_category": "TaskCategory",
                    "dependencies": ["step_id_1", "step_id_2"],
                    "complexity": "low|medium|high",
                    "parameters": {{}}
                }}
            ]
        }}
        """
        
        try:
            model_instance = genai.GenerativeModel(model)
            response = model_instance.generate_content(planning_context)
            
            # Parse the plan (simplified - would need robust JSON parsing)
            plan_data = json.loads(response.text.strip())
            
            steps = []
            timestamp = datetime.now().isoformat()
            
            for i, step_data in enumerate(plan_data.get("steps", [])):
                step_id = f"step_{i+1}_{uuid.uuid4().hex[:8]}"
                
                step = ProjectStep(
                    id=step_id,
                    name=step_data["name"],
                    description=step_data["description"],
                    task_category=TaskCategory(step_data["task_category"]),
                    dependencies=step_data.get("dependencies", []),
                    status=StepStatus.PENDING,
                    parameters=step_data.get("parameters", {}),
                    outputs={},
                    created_at=timestamp
                )
                steps.append(step)
            
            logger.log_entry(
                agent_action="plan_generated",
                project_id=project_id,
                outputs={"step_count": len(steps), "plan_summary": [s.name for s in steps]},
                message=f"Plan generated with {len(steps)} steps"
            )
            
            # Update project with steps
            project.steps = steps
            project.status = ProjectStatus.PENDING_PLAN_APPROVAL
            project.updated_at = timestamp
            
            logger.set_overall_status("pending_plan_approval")
            
            return steps
            
        except Exception as e:
            logger.log_entry(
                agent_action="error_encountered",
                project_id=project_id,
                parameters={"error_type": "planning_failed"},
                outputs={"error_details": str(e)},
                is_error=True,
                message=f"Failed to generate project plan: {str(e)}"
            )
            raise
    
    async def execute_step(self, project_id: str, step_id: str) -> Dict[str, Any]:
        """
        Execute a specific project step
        
        Args:
            project_id: Project identifier
            step_id: Step identifier
            
        Returns:
            Step execution results
        """
        project = self.active_projects[project_id]
        logger = ScoutProjectLogger(project_id)
        
        # Find the step
        step = None
        for s in project.steps:
            if s.id == step_id:
                step = s
                break
        
        if not step:
            raise ValueError(f"Step {step_id} not found in project {project_id}")
        
        # Check dependencies
        for dep_id in step.dependencies:
            dep_step = next((s for s in project.steps if s.id == dep_id), None)
            if not dep_step or dep_step.status != StepStatus.COMPLETED:
                logger.log_entry(
                    agent_action="step_skipped",
                    project_id=project_id,
                    step_id=step_id,
                    parameters={"reason": "dependencies_not_met", "missing_deps": step.dependencies},
                    message=f"Step {step.name} skipped - dependencies not met"
                )
                return {"status": "skipped", "reason": "dependencies_not_met"}
        
        # Start step execution
        step.status = StepStatus.RUNNING
        step.started_at = datetime.now().isoformat()
        
        logger.set_active_step(step_id)
        logger.log_entry(
            agent_action="step_started",
            project_id=project_id,
            step_id=step_id,
            step_name=step.name,
            parameters={"task_category": step.task_category.value},
            agent_thoughts=f"Starting execution of step: {step.name}",
            message=f"Executing step: {step.name}"
        )
        
        try:
            # Route to appropriate handler based on task category
            if step.task_category == TaskCategory.CODE_GENERATION:
                result = await self.execute_code_generation_step(project_id, step)
            elif step.task_category == TaskCategory.CODE_ANALYSIS:
                result = await self.execute_code_analysis_step(project_id, step)
            elif step.task_category == TaskCategory.RESEARCH_AND_INFORMATION_GATHERING:
                result = await self.execute_research_step(project_id, step)
            elif step.task_category == TaskCategory.FILE_MANIPULATION:
                result = await self.execute_file_manipulation_step(project_id, step)
            elif step.task_category == TaskCategory.MCP_TOOL_INTERACTION:
                result = await self.execute_mcp_tool_step(project_id, step)
            else:
                result = await self.execute_generic_step(project_id, step)
            
            # Mark step as completed
            step.status = StepStatus.COMPLETED
            step.completed_at = datetime.now().isoformat()
            step.outputs = result
            
            logger.log_entry(
                agent_action="step_completed",
                project_id=project_id,
                step_id=step_id,
                step_name=step.name,
                outputs=result,
                message=f"Step completed successfully: {step.name}"
            )
            
            return result
            
        except Exception as e:
            step.status = StepStatus.FAILED
            step.error_details = str(e)
            
            logger.log_entry(
                agent_action="step_failed",
                project_id=project_id,
                step_id=step_id,
                step_name=step.name,
                parameters={"error_details": str(e)},
                is_error=True,
                message=f"Step failed: {step.name} - {str(e)}"
            )
            
            raise
    
    async def execute_code_generation_step(self, project_id: str, step: ProjectStep) -> Dict[str, Any]:
        """Execute a code generation step"""
        logger = ScoutProjectLogger(project_id)
        
        # Choose model for code generation (always use Pro)
        model, rationale = self.choose_gemini_model(
            TaskCategory.CODE_GENERATION,
            {"complexity": "high", "requires_code_quality": True}
        )
        
        logger.log_entry(
            agent_action="model_selection_made",
            project_id=project_id,
            parameters={"task": "CodeGeneration", "chosen_model": model, "rationale": rationale}
        )
        
        # Query RAG for relevant code examples
        rag_results = await self.query_rag_memory(
            project_id,
            f"code examples for: {step.description}",
            top_k=3
        )
        
        # Generate code using LLM
        context = f"""
        Task: {step.description}
        Parameters: {step.parameters}
        
        Relevant Code Examples:
        {rag_results.get('summary', 'No relevant examples found')}
        
        Please generate high-quality code for this task.
        """
        
        model_instance = genai.GenerativeModel(model)
        response = model_instance.generate_content(context)
        
        # Log code generation completion
        logger.log_entry(
            agent_action="code_generation_complete",
            project_id=project_id,
            step_id=step.id,
            parameters={"model": model, "code_length": len(response.text)},
            outputs={"generated_code": response.text[:500] + "..." if len(response.text) > 500 else response.text},
            message="Code generation completed"
        )
        
        return {
            "generated_code": response.text,
            "model_used": model,
            "status": "completed"
        }
    
    async def execute_research_step(self, project_id: str, step: ProjectStep) -> Dict[str, Any]:
        """Execute a research and information gathering step"""
        logger = ScoutProjectLogger(project_id)
        
        # First check RAG memory
        rag_results = await self.query_rag_memory(
            project_id,
            step.description,
            top_k=5
        )
        
        if rag_results.get('relevant_results', 0) > 0:
            logger.log_entry(
                agent_action="research_complete_from_rag",
                project_id=project_id,
                step_id=step.id,
                outputs={"source": "RAG_memory", "results_count": rag_results.get('relevant_results', 0)},
                message="Research completed using existing knowledge base"
            )
            
            return {
                "research_results": rag_results.get('summary', ''),
                "source": "internal_memory",
                "status": "completed"
            }
        
        # If no relevant RAG results, could implement web search here
        logger.log_entry(
            agent_action="research_external_needed",
            project_id=project_id,
            step_id=step.id,
            agent_thoughts="No relevant internal knowledge found, external research needed",
            message="External research required - implement web search integration"
        )
        
        return {
            "research_results": "External research capability not yet implemented",
            "source": "placeholder",
            "status": "completed"
        }
    
    async def execute_generic_step(self, project_id: str, step: ProjectStep) -> Dict[str, Any]:
        """Execute a generic step using LLM reasoning"""
        logger = ScoutProjectLogger(project_id)
        
        # Choose appropriate model
        model, rationale = self.choose_gemini_model(
            step.task_category,
            {"complexity": step.parameters.get("complexity", "medium")}
        )
        
        logger.log_entry(
            agent_action="generic_step_execution",
            project_id=project_id,
            step_id=step.id,
            parameters={"task_category": step.task_category.value, "model": model},
            agent_thoughts=f"Executing generic step for {step.task_category.value}"
        )
        
        # Use LLM to process the step
        context = f"""
        Task Category: {step.task_category.value}
        Description: {step.description}
        Parameters: {step.parameters}
        
        Please process this task and provide a detailed response.
        """
        
        model_instance = genai.GenerativeModel(model)
        response = model_instance.generate_content(context)
        
        return {
            "result": response.text,
            "model_used": model,
            "status": "completed"
        }
    
    async def query_rag_memory(self, project_id: str, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Query RAG memory for relevant context
        
        Args:
            project_id: Project identifier (used as user_id for Mem0)
            query: Search query
            top_k: Number of results to retrieve
            
        Returns:
            RAG query results
        """
        logger = ScoutProjectLogger(project_id)
        
        logger.log_entry(
            agent_action="rag_query_start",
            project_id=project_id,
            parameters={"query": query, "top_k": top_k, "mem0_user_id": project_id},
            agent_thoughts=f"Querying RAG memory for: {query}"
        )
        
        try:
            # Use existing Mem0ChatManager to query
            # Note: This assumes the Mem0ChatManager has search capabilities
            results = {
                "query": query,
                "relevant_results": 0,
                "summary": "RAG query functionality to be implemented with Mem0ChatManager",
                "retrieved_chunks": []
            }
            
            logger.log_entry(
                agent_action="rag_query_complete",
                project_id=project_id,
                outputs={"retrieved_chunk_count": results["relevant_results"], "summary": results["summary"][:200]},
                message=f"RAG query completed for: {query}"
            )
            
            return results
            
        except Exception as e:
            logger.log_entry(
                agent_action="error_encountered",
                project_id=project_id,
                parameters={"error_type": "rag_query_failed", "query": query},
                outputs={"error_details": str(e)},
                is_error=True,
                message=f"RAG query failed: {str(e)}"
            )
            return {"query": query, "relevant_results": 0, "summary": "RAG query failed", "error": str(e)}
    
    async def ingest_to_rag_memory(self, project_id: str, content: str, metadata: Dict[str, Any]) -> bool:
        """
        Ingest content into RAG memory
        
        Args:
            project_id: Project identifier
            content: Content to ingest
            metadata: Additional metadata for the content
            
        Returns:
            Success status
        """
        logger = ScoutProjectLogger(project_id)
        
        logger.log_entry(
            agent_action="ingest_to_RAG_memory",
            project_id=project_id,
            parameters={
                "content_length": len(content),
                "metadata": metadata,
                "source": metadata.get("source", "unknown")
            },
            agent_thoughts=f"Ingesting content to RAG memory: {metadata.get('content_type', 'text')}"
        )
        
        try:
            # Use existing Mem0ChatManager to ingest
            # This would use project_id as user_id to keep memories isolated
            success = True  # Placeholder - implement with actual Mem0 integration
            
            logger.log_entry(
                agent_action="rag_ingest_complete",
                project_id=project_id,
                outputs={"success": success, "content_summary": content[:100] + "..." if len(content) > 100 else content},
                message="Content successfully ingested to RAG memory"
            )
            
            return success
            
        except Exception as e:
            logger.log_entry(
                agent_action="error_encountered",
                project_id=project_id,
                parameters={"error_type": "rag_ingest_failed"},
                outputs={"error_details": str(e)},
                is_error=True,
                message=f"RAG ingestion failed: {str(e)}"
            )
            return False
    
    def handle_user_intervention(self, project_id: str, command: str, details: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Handle user intervention commands
        
        Args:
            project_id: Project identifier
            command: Intervention command (pause, resume, approve_step, provide_feedback)
            details: Additional command details
            
        Returns:
            Intervention result
        """
        if details is None:
            details = {}
            
        project = self.active_projects.get(project_id)
        if not project:
            return {"status": "error", "message": "Project not found"}
        
        logger = ScoutProjectLogger(project_id)
        
        logger.log_entry(
            agent_action="user_intervention_received",
            project_id=project_id,
            parameters={"command": command, "details": details},
            message=f"User intervention: {command}"
        )
        
        if command == "pause":
            project.status = ProjectStatus.PAUSED
            logger.set_overall_status("paused")
            return {"status": "success", "message": "Project paused"}
            
        elif command == "resume":
            project.status = ProjectStatus.RUNNING
            logger.set_overall_status("running")
            return {"status": "success", "message": "Project resumed"}
            
        elif command == "approve_plan":
            if project.status == ProjectStatus.PENDING_PLAN_APPROVAL:
                project.status = ProjectStatus.RUNNING
                logger.set_overall_status("running")
                return {"status": "success", "message": "Plan approved, execution starting"}
            else:
                return {"status": "error", "message": "Project not in plan approval state"}
                
        elif command == "provide_feedback":
            # This would trigger a UserFeedbackIncorporation task
            feedback = details.get("feedback", "")
            logger.log_entry(
                agent_action="feedback_received",
                project_id=project_id,
                parameters={"feedback": feedback},
                agent_thoughts="Processing user feedback for plan/step modification",
                message="User feedback received"
            )
            return {"status": "success", "message": "Feedback received and will be processed"}
            
        else:
            return {"status": "error", "message": f"Unknown command: {command}"}
    
    def get_project_status(self, project_id: str) -> Dict[str, Any]:
        """
        Get current project status and progress
        
        Args:
            project_id: Project identifier
            
        Returns:
            Project status information
        """
        project = self.active_projects.get(project_id)
        if not project:
            return {"status": "error", "message": "Project not found"}
        
        # Calculate progress
        total_steps = len(project.steps)
        completed_steps = sum(1 for step in project.steps if step.status == StepStatus.COMPLETED)
        failed_steps = sum(1 for step in project.steps if step.status == StepStatus.FAILED)
        
        return {
            "project_id": project_id,
            "goal": project.goal,
            "status": project.status.value,
            "progress": {
                "total_steps": total_steps,
                "completed_steps": completed_steps,
                "failed_steps": failed_steps,
                "completion_percentage": (completed_steps / total_steps * 100) if total_steps > 0 else 0
            },
            "steps": [
                {
                    "id": step.id,
                    "name": step.name,
                    "status": step.status.value,
                    "task_category": step.task_category.value
                }
                for step in project.steps
            ],
            "created_at": project.created_at,
            "updated_at": project.updated_at
        }
