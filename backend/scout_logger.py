"""
Scout Logger Module

This module provides structured logging and project management functionality using TinyDB.
It includes the following key components:
- ScoutLogManager: Manages multiple project log databases
- ScoutProjectLogger: Handles logging operations for individual projects

The module supports:
- Structured logging with metadata
- Project-specific log storage
- Status tracking and management
- Workspace integration
"""

import os
import uuid
import logging
from datetime import datetime, timezone
from tinydb import TinyDB, Query, where
from tinydb.operations import set as tinydb_set
from typing import Dict, List, Optional, Any, Union

logger = logging.getLogger(__name__)

# Configuration
DEFAULT_SCOUT_LOGS_DIR = "./scout_logs"
SCOUT_LOGS_DIR = os.getenv("SCOUT_LOGS_DIR", DEFAULT_SCOUT_LOGS_DIR)

# Ensure logs directory exists
os.makedirs(SCOUT_LOGS_DIR, exist_ok=True)

# Log Entry Types/Keys (for consistency, based on design)
LOG_KEY_LOG_ID = "log_id"
LOG_KEY_PROJECT_ID = "project_id"  # Part of DB path, but included in record for reference
LOG_KEY_TIMESTAMP = "timestamp"
LOG_KEY_STEP_ID = "step_id"
LOG_KEY_STEP_NAME = "step_name"
LOG_KEY_AGENT_ACTION = "agent_action" # e.g., "tool_call", "thought_process", "status_update"
LOG_KEY_VM_ID = "vm_id" # If action involves a VM
LOG_KEY_PARAMETERS = "parameters" # Dict of parameters for the action
LOG_KEY_OUTPUTS = "outputs" # Dict: stdout, stderr, tool_result (can be complex)
LOG_KEY_AGENT_THOUGHTS = "agent_thoughts" # String or structured thoughts
LOG_KEY_STATUS_UPDATE = "status_update" # e.g., "step_started", "step_completed", "step_failed", "project_completed"
LOG_KEY_IS_ERROR = "is_error" # Boolean
LOG_KEY_MESSAGE = "message" # General human-readable message for the log entry
LOG_KEY_TOOL_CALLS = "tool_calls"  # To store tool invocation details (name, params)
LOG_KEY_TOOL_OUTPUTS = "tool_outputs" # To store direct results from tools


# --- Project Level Keys ---
# These might be stored in a separate table or as special log entries
PROJECT_KEY_GOAL = "project_goal"
PROJECT_KEY_OVERALL_STATUS = "project_overall_status" # e.g., "running", "paused", "completed", "failed"
PROJECT_KEY_CURRENT_PLAN = "project_current_plan" # List of steps (id, name, status)
PROJECT_KEY_ACTIVE_STEP_ID = "project_active_step_id"
PROJECT_KEY_ASSOCIATED_WORKSPACE_ID = "project_associated_workspace_id"


class ScoutLogManager: # Renamed from ScoutAgentDBManager for clarity
    _dbs: Dict[str, TinyDB] = {}

    def __init__(self, logs_dir: str = SCOUT_LOGS_DIR):
        self.logs_dir = logs_dir
        os.makedirs(self.logs_dir, exist_ok=True)

    def _get_db(self, project_id: str) -> TinyDB:
        if project_id not in self._dbs:
            db_path = os.path.join(self.logs_dir, f"scout_project_{project_id}.json")
            logger.info(f"Initializing TinyDB for project {project_id} at {db_path}")
            self._dbs[project_id] = TinyDB(db_path, indent=2, sort_keys=True)
        return self._dbs[project_id]

    def get_project_logger(self, project_id: str) -> 'ScoutProjectLogger':
        """Factory method to get a logger instance for a specific project."""
        if not project_id or not isinstance(project_id, str):
            raise ValueError("project_id must be a non-empty string")
        # Basic sanitization for project_id to prevent path traversal issues, though TinyDB handles filenames.
        # A more robust way is to hash or UUID map project_id if it comes from untrusted sources.
        safe_project_id = "".join(c for c in project_id if c.isalnum() or c in ('-', '_'))
        if not safe_project_id:
             raise ValueError("project_id contains invalid characters or is empty after sanitization.")
        return ScoutProjectLogger(safe_project_id, self)

    def close_db(self, project_id: str):
        """Closes a specific project's database connection."""
        if project_id in self._dbs:
            self._dbs[project_id].close()
            del self._dbs[project_id]
            logger.info(f"Closed TinyDB for project {project_id}")

    def close_all_dbs(self):
        """Closes all open database connections."""
        for project_id in list(self._dbs.keys()):
            self.close_db(project_id)
        logger.info("All TinyDB connections closed.")


class ScoutProjectLogger:
    def __init__(self, project_id: str, manager: ScoutLogManager):
        self.project_id = project_id
        self.manager = manager
        self._db = self.manager._get_db(project_id)
        self._log_table = self._db.table('logs')
        self._metadata_table = self._db.table('metadata') # For project-level info

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def log_entry(self,
                  message: str,
                  step_id: Optional[str] = None,
                  step_name: Optional[str] = None,
                  agent_action: Optional[str] = None,
                  vm_id: Optional[str] = None,
                  parameters: Optional[Dict[str, Any]] = None,
                  outputs: Optional[Dict[str, Any]] = None, # stdout, stderr, tool_result
                  agent_thoughts: Optional[Union[str, Dict, List]] = None, # Allow more structured thoughts
                  status_update: Optional[str] = None, # step_started, step_completed, etc.
                  is_error: bool = False,
                  tool_calls: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None, # For tool call details
                  tool_outputs: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None, # For tool call results
                  **extra_data: Any) -> str:
        """
        Creates a structured log entry.
        Returns the log_id of the new entry.
        """
        log_id = str(uuid.uuid4())
        entry = {
            LOG_KEY_LOG_ID: log_id,
            LOG_KEY_PROJECT_ID: self.project_id,
            LOG_KEY_TIMESTAMP: self._now_iso(),
            LOG_KEY_MESSAGE: message,
            LOG_KEY_STEP_ID: step_id,
            LOG_KEY_STEP_NAME: step_name,
            LOG_KEY_AGENT_ACTION: agent_action,
            LOG_KEY_VM_ID: vm_id,
            LOG_KEY_PARAMETERS: parameters or {},
            LOG_KEY_OUTPUTS: outputs or {},
            LOG_KEY_AGENT_THOUGHTS: agent_thoughts,
            LOG_KEY_STATUS_UPDATE: status_update,
            LOG_KEY_IS_ERROR: is_error,
            LOG_KEY_TOOL_CALLS: tool_calls,
            LOG_KEY_TOOL_OUTPUTS: tool_outputs,
        }
        entry.update(extra_data) # Merge any additional custom data

        # Remove keys with None values for cleaner logs, unless it's a boolean
        cleaned_entry = {k: v for k, v in entry.items() if v is not None or isinstance(v, bool)}
        
        self._log_table.insert(cleaned_entry)
        logger.debug(f"Project {self.project_id} logged entry: {log_id} - {message[:50]}")
        return log_id

    def get_logs(self, limit: Optional[int] = None, skip: int = 0, sort_desc: bool = True) -> List[Dict[str, Any]]:
        """Retrieves logs for the project, sorted by timestamp."""
        # TinyDB does not have built-in server-side sorting for all records easily.
        # We fetch all, then sort in Python. For very large logs, this could be inefficient.
        # Consider querying with a range or other filters if performance becomes an issue.
        all_logs = self._log_table.all()
        
        # Sort by timestamp
        try:
            sorted_logs = sorted(all_logs, key=lambda x: x.get(LOG_KEY_TIMESTAMP, ""), reverse=sort_desc)
        except Exception as e: # Catch issues if timestamp is missing or malformed in some records
            logger.warning(f"Error sorting logs for project {self.project_id}, possibly due to malformed timestamps: {e}")
            sorted_logs = all_logs # Return unsorted or partially sorted

        if skip > 0:
            sorted_logs = sorted_logs[skip:]
        if limit is not None and limit > 0:
            sorted_logs = sorted_logs[:limit]
            
        return sorted_logs

    # --- Project Metadata Management ---
    def _set_project_metadata(self, key: str, value: Any):
        self._metadata_table.upsert({'key': key, 'value': value}, Query().key == key)

    def _get_project_metadata(self, key: str, default: Any = None) -> Any:
        result = self._metadata_table.get(Query().key == key)
        return result['value'] if result else default

    def set_project_goal(self, goal: str):
        self._set_project_metadata(PROJECT_KEY_GOAL, goal)
        self.log_entry(message=f"Project goal set/updated: {goal}", agent_action="project_management")

    def get_project_goal(self) -> Optional[str]:
        return self._get_project_metadata(PROJECT_KEY_GOAL)

    def set_overall_status(self, status: str, message: Optional[str] = None):
        self._set_project_metadata(PROJECT_KEY_OVERALL_STATUS, status)
        log_msg = message or f"Project overall status updated to: {status}"
        self.log_entry(message=log_msg, status_update=f"project_{status}", agent_action="project_management")
    
    def get_overall_status(self) -> str:
        return self._get_project_metadata(PROJECT_KEY_OVERALL_STATUS, default="unknown")

    def update_plan_step_status(self, step_id: str, step_name: str, status: str):
        """Updates or adds a step's status in the project's current plan."""
        plan = self._get_project_metadata(PROJECT_KEY_CURRENT_PLAN, default=[])
        step_found = False
        for step in plan:
            if step.get('id') == step_id:
                step['status'] = status
                step['name'] = step_name # Update name too, in case it changes
                step_found = True
                break
        if not step_found:
            plan.append({'id': step_id, 'name': step_name, 'status': status})
        self._set_project_metadata(PROJECT_KEY_CURRENT_PLAN, plan)
        # Also log this as a discrete event
        self.log_entry(message=f"Step '{step_name}' (ID: {step_id}) status updated to: {status}",
                       step_id=step_id, step_name=step_name, status_update=f"step_{status}",
                       agent_action="plan_update")


    def get_current_plan(self) -> List[Dict[str, Any]]:
        return self._get_project_metadata(PROJECT_KEY_CURRENT_PLAN, default=[])

    def set_project_plan(self, plan: List[Dict[str, Any]], project_goal: Optional[str] = None):
        """Sets the entire project plan and optionally updates the project goal."""
        self._set_project_metadata(PROJECT_KEY_CURRENT_PLAN, plan)
        if project_goal is not None:
            self.set_project_goal(project_goal)
        self.log_entry(
            message="Project plan set/updated.",
            agent_action="project_management",
            parameters={"plan_length": len(plan), "has_goal": project_goal is not None}
        )

    def set_active_step(self, step_id: Optional[str]):
        self._set_project_metadata(PROJECT_KEY_ACTIVE_STEP_ID, step_id)
        if step_id:
            self.log_entry(message=f"Active step set to: {step_id}", step_id=step_id, agent_action="execution_flow")

    def get_active_step_id(self) -> Optional[str]:
        return self._get_project_metadata(PROJECT_KEY_ACTIVE_STEP_ID)

    def set_associated_workspace(self, workspace_id: Optional[str]):
        self._set_project_metadata(PROJECT_KEY_ASSOCIATED_WORKSPACE_ID, workspace_id)
        if workspace_id:
            self.log_entry(message=f"Project associated with workspace: {workspace_id}", vm_id=workspace_id, agent_action="project_management")

    def get_associated_workspace_id(self) -> Optional[str]:
        return self._get_project_metadata(PROJECT_KEY_ASSOCIATED_WORKSPACE_ID)

    def get_project_status_summary(self, recent_logs_count: int = 10) -> Dict[str, Any]:
        """Provides a summary for the /status API endpoint."""
        return {
            PROJECT_KEY_GOAL: self.get_project_goal(),
            PROJECT_KEY_OVERALL_STATUS: self.get_overall_status(),
            PROJECT_KEY_CURRENT_PLAN: self.get_current_plan(),
            PROJECT_KEY_ACTIVE_STEP_ID: self.get_active_step_id(),
            PROJECT_KEY_ASSOCIATED_WORKSPACE_ID: self.get_associated_workspace_id(),
            "recent_logs": self.get_logs(limit=recent_logs_count, sort_desc=True)
        }

# Example Usage
if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # Initialize the manager
    log_manager = ScoutLogManager(logs_dir="./test_scout_logs") # Use a test directory

    # Get a logger for a specific project
    project1_logger = log_manager.get_project_logger("project_alpha")
    project2_logger = log_manager.get_project_logger("project_beta")

    # Log some entries for project1
    project1_logger.set_project_goal("Develop a web application for task management.")
    project1_logger.set_overall_status("running")
    project1_logger.set_associated_workspace("ws_alpha_001")

    project1_logger.log_entry(
        message="Starting initial setup.",
        step_id="1.0", step_name="Initialize Environment",
        agent_action="setup", status_update="step_started",
        agent_thoughts="Need to create a VM and install base packages."
    )
    project1_logger.update_plan_step_status("1.0", "Initialize Environment", "in_progress")
    project1_logger.set_active_step("1.0")

    # Example of setting a full plan
    example_plan = [
        {"id": "1.0", "name": "Initialize Environment", "status": "pending"},
        {"id": "2.0", "name": "Develop Feature X", "status": "pending"},
        {"id": "3.0", "name": "Test Feature X", "status": "pending"},
        {"id": "4.0", "name": "Deploy", "status": "pending"}
    ]
    project1_logger.set_project_plan(example_plan, project_goal="Complete Project Alpha with Feature X")

    # import time # Already imported if running as a script, but good for clarity if this snippet is isolated
    # time.sleep(0.1) # Ensure timestamps differ slightly

    project1_logger.log_entry(
        message="VM created successfully.",
        step_id="1.0", step_name="Initialize Environment",
        agent_action="tool_call", 
        vm_id="vm_alpha_123",
        parameters={"tool_name": "create_vm", "vm_type": "nixos"}, # General parameters for this specific log entry
        outputs={"vm_ip": "192.168.1.10", "status_code": 200}, # General outputs for this specific log entry
        tool_calls=[ # Specific structured data for tool calls
            {"tool_name": "create_vm", "parameters": {"vm_type": "nixos", "region": "us-central1"}},
            {"tool_name": "assign_ip", "parameters": {"vm_id": "vm_alpha_123"}}
        ],
        tool_outputs=[ # Specific structured data for tool outputs
            {"tool_name": "create_vm", "result": {"vm_id": "vm_alpha_123", "status": "created"}},
            {"tool_name": "assign_ip", "result": {"vm_ip": "192.168.1.10"}}
        ],
        agent_thoughts=[ # Example of structured thoughts
            {"type": "reasoning", "text": "VM creation was successful, proceeding to IP assignment."},
            {"type": "next_action", "tool_name": "configure_firewall"}
        ],
        status_update="progress_update"
    )
    
    project1_logger.log_entry(
        message="Firewall configuration failed.",
        step_id="1.0", step_name="Initialize Environment",
        agent_action="tool_interaction_result",
        is_error=True,
        tool_calls={"tool_name": "configure_firewall", "parameters": {"rules": "allow_ssh"}},
        tool_outputs={"tool_name": "configure_firewall", "error": "permission_denied", "stdout": "", "stderr": "Permission denied to access firewall rules."}
    )
    
    # Get and print logs for project1
    logs1 = project1_logger.get_logs(limit=5)
    logger.info(f"--- Logs for {project1_logger.project_id} ---")
    for log in logs1:
        logger.info(f"{log.get('timestamp')} [{log.get('step_name', 'General')}] - {log.get('message')}")

    # Example for project2 (less detailed)
    project2_logger.set_project_goal("Maintain legacy system.")
    project2_logger.log_entry("Performing routine maintenance.", agent_action="maintenance")
    project2_logger.set_overall_status("completed")

    logs2 = project2_logger.get_logs(limit=3)
    logger.info(f"--- Logs for {project2_logger.project_id} ---")
    for log in logs2:
        logger.info(f"{log.get('timestamp')} - {log.get('message')}")

    # Demonstrate get_project_status_summary
    summary1 = project1_logger.get_project_status_summary()
    logger.info(f"--- Status Summary for {project1_logger.project_id} ---")
    logger.info(f"Goal: {summary1.get(PROJECT_KEY_GOAL)}")
    logger.info(f"Overall Status: {summary1.get(PROJECT_KEY_OVERALL_STATUS)}")
    logger.info(f"Plan: {summary1.get(PROJECT_KEY_CURRENT_PLAN)}")
    logger.info(f"Active Step: {summary1.get(PROJECT_KEY_ACTIVE_STEP_ID)}")
    
    # Close connections
    log_manager.close_all_dbs()
