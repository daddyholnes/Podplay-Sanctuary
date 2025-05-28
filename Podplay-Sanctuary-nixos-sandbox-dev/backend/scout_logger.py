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

# --- Log Entry Types/Keys (for consistency, based on design) ---
# These are not strictly enforced by TinyDB but guide usage.
LOG_KEY_LOG_ID = "log_id"
LOG_KEY_PROJECT_ID = "project_id" # Will be part of DB path, but can be in record too
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
                  agent_thoughts: Optional[Union[str, Dict]] = None,
                  status_update: Optional[str] = None, # step_started, step_completed, etc.
                  is_error: bool = False,
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
        all_logs = self_log_table.all()
        
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

    # import time # Ensure time is imported if using sleep
    # time.sleep(0.1) # Ensure timestamps differ slightly

    project1_logger.log_entry(
        message="VM created successfully.",
        step_id="1.0", step_name="Initialize Environment",
        agent_action="tool_call", vm_id="vm_alpha_123",
        parameters={"tool_name": "create_vm", "vm_type": "nixos"},
        outputs={"vm_ip": "192.168.1.10"},
        status_update="progress_update"
    )
    time.sleep(0.1)

    project1_logger.log_entry(
        message="Environment setup complete.",
        step_id="1.0", step_name="Initialize Environment",
        agent_action="setup", status_update="step_completed",
        agent_thoughts="Base environment ready."
    )
    project1_logger.update_plan_step_status("1.0", "Initialize Environment", "completed")


    # Log for project2
    project2_logger.set_project_goal("Research quantum computing algorithms.")
    project2_logger.log_entry(message="Literature review started.", step_id="q_research_1", agent_action="research")

    # Retrieve logs and status
    print("\n--- Project Alpha Logs (last 5) ---")
    for log in project1_logger.get_logs(limit=5):
        print(f"  {log.get(LOG_KEY_TIMESTAMP)} - {log.get(LOG_KEY_MESSAGE)}")

    print("\n--- Project Alpha Status Summary ---")
    summary = project1_logger.get_project_status_summary(recent_logs_count=2)
    import json
    print(json.dumps(summary, indent=2))
    
    # Close DBs (optional, TinyDB auto-saves)
    log_manager.close_all_dbs()

    # Clean up test log directory (optional)
    # import shutil
    # shutil.rmtree("./test_scout_logs")

# Ensure time is imported for the sleep call in the example
import time
```

**Explanation of `scout_logger.py`:**

*   **Configuration:** Sets up `SCOUT_LOGS_DIR` for TinyDB JSON files.
*   **Log Keys:** Defines constants for common log entry keys to ensure consistency, based on the design document.
*   **`ScoutLogManager`:**
    *   Manages multiple TinyDB database instances, one per project ID. This keeps logs for different projects separate.
    *   `_get_db()`: Lazily creates/opens a `TinyDB` instance for a project in a subdirectory.
    *   `get_project_logger()`: A factory method to obtain a `ScoutProjectLogger` instance for a given project ID. Includes basic sanitization for `project_id` to be used in filenames.
    *   `close_db()`, `close_all_dbs()`: For explicit DB connection closing if needed (TinyDB auto-saves, but good for cleanup).
*   **`ScoutProjectLogger`:**
    *   **`__init__`**: Takes `project_id` and the manager. Gets the TinyDB instance and specific tables (`logs`, `metadata`).
    *   **`log_entry()`**:
        *   The main logging method. Accepts various structured parameters as defined in the design (message, step info, action, VM details, parameters, outputs, thoughts, status, error flag).
        *   Automatically generates a `log_id` (UUID) and a UTC timestamp.
        *   Merges any `extra_data` provided.
        *   Cleans the entry by removing keys with `None` values (except booleans) before insertion into the `logs` table.
    *   **`get_logs()`**: Retrieves log entries. Sorts them by timestamp in Python (TinyDB's querying for sorted results on all data is less direct). Supports limit and skip for basic pagination.
    *   **Project Metadata Methods:** (`_set_project_metadata`, `_get_project_metadata`, `set_project_goal`, `get_project_goal`, `set_overall_status`, `update_plan_step_status`, `get_current_plan`, etc.)
        *   These methods use a separate `metadata` table within the project's TinyDB file to store and retrieve project-level information like the goal, overall status, current plan (list of steps with their statuses), active step, and associated workspace.
        *   Updating metadata (e.g., `set_overall_status`, `update_plan_step_status`) also creates a corresponding log entry in the `logs` table for auditability.
    *   **`get_project_status_summary()`**: Consolidates various metadata and recent logs into a single dictionary, suitable for the `/status` API endpoint.
*   **Example Usage (`if __name__ == '__main__':`)**: Demonstrates creating loggers for two different projects, logging various types of entries (including goal setting, status updates, step progress), and retrieving logs and a status summary.

This module provides a flexible and structured way to log Scout Agent activities on a per-project basis using TinyDB. The separation of logs and metadata within each project's DB file allows for both detailed audit trails and quick retrieval of current project status.

**Next Steps:**

1.  **Integrate `ScoutLogManager` into `app.py`:**
    *   Initialize an instance of `ScoutLogManager`.
    *   Use it in the new Scout Agent API endpoints.
2.  **Implement the Scout Agent API endpoints in `app.py`:**
    *   `GET /api/v1/scout_agent/projects/{project_id}/status`
    *   `POST /api/v1/scout_agent/projects/{project_id}/intervene`
3.  **Implement the Workspace API endpoints in `app.py`** (using `LibvirtManager` from `vm_manager.py`).
4.  **Implement the WebSocket SSH Bridge in `app.py`** (using `VMSSHBridge` from `ssh_bridge.py`).
5.  Add `tinydb` to `requirements.txt`.I have created `backend/scout_logger.py` for Scout Agent logging using TinyDB.

Now, I will proceed to implement the new Flask API endpoints in `app.py` for:
1.  **Workspace VM Management:** Using `LibvirtManager` from `vm_manager.py`.
2.  **Scout Agent Status & Intervention:** Using `ScoutLogManager` from `scout_logger.py`.
3.  **WebSocket SSH Bridge:** Using `VMSSHBridge` from `ssh_bridge.py` and Flask-SocketIO.

**Plan for `app.py` modifications:**

1.  **Imports:** Import `NixOSSandboxOrchestrator` (for ephemeral execution, already added but might need review), `LibvirtManager`, `ScoutLogManager`, `VMSSHBridge`, and Flask-SocketIO components.
2.  **Initialization:**
    *   Initialize `LibvirtManager` (for workspaces, separate from any instance used by ephemeral orchestrator).
    *   Initialize `ScoutLogManager`.
    *   The `nixos_orchestrator` for ephemeral VMs is already set up.
    *   The `socketio` object is already initialized.
3.  **Workspace API Endpoints:**
    *   `POST /api/v1/workspaces`: Calls `libvirt_manager.define_workspace_vm()` and `libvirt_manager.start_vm()`.
    *   `GET /api/v1/workspaces`: Calls `libvirt_manager.list_domains_with_metadata(domain_type_filter="workspace")`.
    *   `GET /api/v1/workspaces/{workspace_id}`: Calls `libvirt_manager.get_domain_details()`. Will include WebSocket URL construction.
    *   `DELETE /api/v1/workspaces/{workspace_id}`: Calls `libvirt_manager.delete_workspace_vm()`.
    *   `POST /api/v1/workspaces/{workspace_id}/start`: Calls `libvirt_manager.start_vm()`.
    *   `POST /api/v1/workspaces/{workspace_id}/stop`: Calls `libvirt_manager.stop_vm(for_workspace=True)`.
4.  **Scout Agent API Endpoints:**
    *   `GET /api/v1/scout_agent/projects/{project_id}/status`: Uses `scout_log_manager.get_project_logger(project_id).get_project_status_summary()`.
    *   `POST /api/v1/scout_agent/projects/{project_id}/intervene`: Gets a logger for the project and logs the intervention command (e.g., `project_logger.log_entry(message=f"User intervention: {command}", parameters=payload, agent_action="user_intervention")`).
5.  **WebSocket SSH Bridge Endpoints (Flask-SocketIO):**
    *   Define a namespace (e.g., `/terminal_ws`).
    *   `connect` event:
        *   Client will pass `workspace_id` (e.g., in connect query string or initial message).
        *   Authenticate/authorize user for this workspace (conceptual for now, actual auth logic is separate).
        *   Use `libvirt_manager.get_domain_details(workspace_id)` to get IP.
        *   Create a `VMSSHBridge` instance and store it in a dictionary mapping `request.sid` (SocketIO session ID) to the bridge instance.
        *   Start a greenlet/thread to continuously poll `bridge.get_output()` and `socketio.emit('terminal_out', data, room=request.sid)`.
    *   `terminal_in` event (client sends data): Call `bridge.send_input(data)` for the corresponding `request.sid`.
    *   `resize` event (client sends new dimensions): Call `bridge.resize_pty()`.
    *   `disconnect` event: Call `bridge.close()` and remove from the dictionary.
6.  **Configuration:** Ensure `ENABLE_WORKSPACE_MANAGER` and `ENABLE_SCOUT_LOGGER` environment variables control initialization, similar to `ENABLE_NIXOS_SANDBOX`.
7.  **Error Handling:** Add `try-except` blocks for new routes.
8.  **Dependencies:** Add `Flask-SocketIO`, `paramiko`, `scp`, `tinydb`, `libvirt-python` to `requirements.txt` if not already covered. (I will list them in the final report).

This is a large set of changes. I will focus on getting the structure and core logic for each part into `app.py`.
I'll start by adding initializations and then the Workspace API endpoints.
The `paramiko` library is used by `ssh_executor.py` and `ssh_bridge.py`. `scp` is used by `ssh_executor.py`. It's good to ensure these are noted.

Given this is the last turn, I will implement as much as possible and then provide a summary. I'll prioritize the Workspace and Scout Agent REST APIs. The WebSocket bridge is more complex and might only have its structure laid out.
