# Podplay Sanctuary Agent Orchestration: Backend Code Reference

This document provides a detailed reference for developers to quickly locate, understand, and extend all agent orchestration and workflow logic in the Podplay Sanctuary backend. Use this as a search guide and onboarding tool.

---

## 1. Key API Blueprints

### scout_agent_blueprint.py
- **Location:** `/backend/api/blueprints/scout_agent_blueprint.py`
- **Purpose:** API endpoints for Scout agent orchestration and actions.
- **Example Snippet:**
```python
@scout_agent_blueprint.route('/scout/execute', methods=['POST'])
def execute_scout_action():
    data = request.get_json()
    # ... agent action logic ...
    return jsonify({'status': 'ok'})
```

### adk_workflow_api.py
- **Location:** `/backend/app/api/blueprints/adk_workflow_api.py`
- **Purpose:** ADK workflow orchestration endpoints (list, execute, status).
- **Example Snippet:**
```python
@adk_workflow_api.route('/workflows/execute', methods=['POST'])
def execute_workflow():
    data = request.get_json()
    workflow_id = data.get('workflow_id')
    params = data.get('params', {})
    exec_id = ADKWorkflowManager.execute(workflow_id, params)
    return jsonify({'execution_id': exec_id})
```

---

## 2. Agent Frameworks and Services

### agent_framework_enhanced.py
- **Location:** `/backend/services/agent_framework_enhanced.py`
- **Purpose:** Core agent orchestration, agent creation, registry, and lifecycle.
- **Example Snippet:**
```python
class AgentOrchestrator:
    def __init__(self, db, socketio):
        self.db = db
        self.socketio = socketio
        self.agents = {}

    def create_agent(self, agent_type, config):
        agent = AgentFactory.create(agent_type, config)
        self.agents[agent.id] = agent
        return agent
```

### mama_bear_agent.py
- **Location:** `/backend/services/mama_bear_agent.py`
- **Purpose:** Lead agent (Mama Bear) logic, chat, memory, agent actions.
- **Example Snippet:**
```python
class MamaBearAgent:
    def handle_message(self, message, context):
        # ... process message, access memory, orchestrate actions ...
        return response
```

### discovery_agent_service.py
- **Location:** `/backend/services/discovery_agent_service.py`
- **Purpose:** Discovery/research agent logic and service orchestration.

### proactive_discovery_agent.py
- **Location:** `/backend/app/services/proactive_discovery_agent.py`
- **Purpose:** Proactive agent for research, RAG, and workspace discovery.

---

## 3. Orchestration Services

### orchestration_service.py (pyc only)
- **Location:** `/backend/app/services/orchestration_service.cpython-312.pyc`
- **Purpose:** Orchestration logic (source not available, but referenced in API blueprints).

---

## 4. ADK & Vertex Agent Integration

### adk_workflow_api.py
- **Location:** `/backend/app/api/blueprints/adk_workflow_api.py`
- **Purpose:** Orchestrates workflows using Vertex Agent ADK.

### Vertex Agent ADK (site-packages)
- **Location:** `/backend/venv/lib/python3.12/site-packages/google/adk/agents/`
- **Purpose:** Vertex AI agent templates, flows, tools, and evaluation modules.

---

## 5. How to Search for Logic
- Search for `AgentOrchestrator`, `create_agent`, `workflow`, `orchestrate`, `ADK`, `MamaBearAgent`, `ScoutAgent`, `discovery` in the above files.
- Use the code snippets to quickly spot the entry points for agent creation, orchestration, and workflow execution.

---

## 6. Recommended Files to Share with Devs
- `/docs/AGENT_ORCHESTRATION_LOGIC.md` (requirements/logic)
- `/backend/api/blueprints/scout_agent_blueprint.py`
- `/backend/app/api/blueprints/adk_workflow_api.py`
- `/backend/services/agent_framework_enhanced.py`
- `/backend/services/mama_bear_agent.py`
- `/backend/services/discovery_agent_service.py`
- `/backend/app/services/proactive_discovery_agent.py`

---

## 7. Notes
- If you need to extend orchestration, start with `agent_framework_enhanced.py` and `adk_workflow_api.py`.
- For ADK/Vertex AI integration, see the blueprints and the ADK modules in site-packages.
- If orchestration_service.py source is needed, check version control or regenerate.

---

This reference will help any backend developer quickly locate, search, and understand the agent orchestration logic in Podplay Sanctuary. For further details, consult the code snippets and filenames above.
