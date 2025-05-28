 Design Document: Dynamic Model Switching & Core Scout Agent Logic

**1. Introduction**

This document outlines the core logic for the Scout Agent (Mama Bear), focusing on dynamic AI model switching, task processing, integration of various capabilities (NixOS code execution, MCP tools, RAG with Mem0.ai, Web Search), and robust logging. The goal is to create an agent that can autonomously break down complex goals into manageable steps and execute them efficiently and cost-effectively.

**2. Task Categories for the Scout Agent**

The Scout Agent will categorize its operational steps to apply appropriate logic, tools, and AI models. The initial set of categories includes:

*   **`ProjectUnderstanding`**:
    *   **Scope:** Initial analysis of your high-level goal, clarifying requirements, identifying key entities, constraints, and deliverables. Involves dialogue with you if ambiguity exists.
    *   **Primary Capability:** LLM reasoning, RAG for similar past projects or domain knowledge.
*   **`Planning`**:
    *   **Scope:** Breaking down the understood goal into a sequence of actionable steps (the "plan"). Each step will itself be assigned a `TaskCategory`. Involves defining dependencies between steps.
    *   **Primary Capability:** LLM reasoning.
*   **`CodeGeneration`**:
    *   **Scope:** Writing new code in a specified language (primarily Python for NixOS sandbox execution). Includes generating boilerplate, implementing functions/classes, creating scripts.
    *   **Primary Capability:** LLM (Code-specific model), RAG for relevant snippets/APIs, NixOS Sandbox for testing generated code.
*   **`CodeAnalysis`**:
    *   **Scope:** Reviewing existing code for understanding, identifying bugs, suggesting improvements, explaining functionality, or checking for adherence to requirements.
    *   **Primary Capability:** LLM (Code-specific model), RAG for project context/libraries.
*   **`Debugging`**:
    *   **Scope:** Diagnosing and attempting to fix errors in code, often based on output from code execution (stderr, logs).
    *   **Primary Capability:** LLM (Code-specific model), NixOS Sandbox for iterative testing of fixes, RAG for error patterns/solutions.
*   **`ResearchAndInformationGathering`**:
    *   **Scope:** Finding information from external sources (web, documentation).
    *   **Primary Capability:** Web Search (e.g., Brave Search MCP), RAG (if querying ingested documentation), LLM for summarizing findings.
*   **`DataProcessingOrManipulation`**:
    *   **Scope:** Tasks involving transformation, analysis, or extraction of data from text, files, or structured sources.
    *   **Primary Capability:** Python script execution in NixOS Sandbox, LLM for understanding requirements or interpreting results.
*   **`FileManipulation`**:
    *   **Scope:** Creating, reading, writing, modifying files within the project's NixOS workspace.
    *   **Primary Capability:** Python script execution in NixOS Sandbox (using planned File I/O capabilities).
*   **`MCPToolInteraction`**:
    *   **Scope:** Using a specific Model Context Protocol tool (e.g., GitHub MCP, specialized data APIs).
    *   **Primary Capability:** Direct API calls to the MCP server. LLM might be used to format parameters or interpret results.
*   **`UserFeedbackIncorporation`**:
    *   **Scope:** Processing explicit feedback or instructions from you (via the intervention API) and modifying the plan, code, or approach accordingly.
    *   **Primary Capability:** LLM reasoning, plan modification.
*   **`SystemManagement`**:
    *   **Scope:** Internal agent tasks like managing its own state, deciding when a step is truly complete, or when to ask for your help.
    *   **Primary Capability:** Agent's internal logic, possibly LLM for complex decision-making.
*   **`FinalReviewAndPackaging`**:
    *   **Scope:** Once all steps seem complete, reviewing the overall project against the initial goal, preparing a summary, and packaging deliverables (e.g., identifying key files, creating a summary document).
    *   **Primary Capability:** LLM reasoning, RAG for project history.

## 3. Dynamic AI Model Switching Logic

To optimize for cost and capability, I will dynamically select the most appropriate Gemini 2.5 model for tasks requiring LLM reasoning. I'll primarily switch between a "Flash" model (e.g., `gemini-2.5-flash-preview-05-20` or its latest equivalent, optimized for speed and cost) and a "Pro" model (e.g., `gemini-2.5-pro-preview-05-06` or latest, for higher capability).

**Model Configuration:**
The specific model names/identifiers will be configurable (e.g., via `.env` or a backend configuration file) to allow easy updates as Google releases new model versions.
*   `SCOUT_AGENT_FLASH_MODEL="gemini-2.5-flash-preview-05-20"` (example)
*   `SCOUT_AGENT_PRO_MODEL="gemini-2.5-pro-preview-05-06"` (example)

**`choose_gemini_model(task_category: str, task_details: Optional[Dict] = None) -> str` Function:**

This function will be central to my decision-making process when an LLM is needed.

**Pseudocode/Logic:**

```python
def choose_gemini_model(task_category: str, task_details: Optional[Dict] = None) -> str:
    flash_model = os.getenv("SCOUT_AGENT_FLASH_MODEL", "gemini-2.5-flash-preview-05-20") # Default if not set
    pro_model = os.getenv("SCOUT_AGENT_PRO_MODEL", "gemini-2.5-pro-preview-05-06")       # Default if not set

    if task_details is None:
        task_details = {}

    # Default to Flash model for its cost-effectiveness and speed
    chosen_model = flash_model

    # --- Category-based decisions ---
    if task_category == "ProjectUnderstanding":
        # Flash might be sufficient for initial understanding or if RAG provides good context.
        # Pro might be chosen if the goal is very complex or ambiguous after initial Flash attempt.
        if task_details.get("complexity") == "high" or task_details.get("ambiguity_level", 0) > 0.7:
            chosen_model = pro_model
    
    elif task_category == "Planning":
        # Flash is generally suitable for breaking down tasks.
        # Pro could be used if the initial plan from Flash is insufficient or needs deeper thought.
        if task_details.get("planning_depth_required") == "deep":
            chosen_model = pro_model

    elif task_category in ["CodeGeneration", "CodeAnalysis", "Debugging"]:
        # These often benefit from the stronger capabilities of Pro, especially for complex code.
        chosen_model = pro_model
        # Potentially use Flash for very simple, small snippets or if Pro fails due to rate limits/cost and a simpler attempt is viable.
        if task_details.get("code_snippet_size") == "small" and task_details.get("complexity") == "low":
            # Allow an override or a tiered attempt strategy later
            pass # Stick with Pro for now as default for these tasks

    elif task_category == "ResearchAndInformationGathering":
        # Flash is good for summarizing search results or RAG outputs.
        # Pro might be used if complex synthesis of multiple sources is needed.
        if task_details.get("synthesis_complexity") == "high":
            chosen_model = pro_model
            
    elif task_category == "DataProcessingOrManipulation":
        # If LLM is used to *generate* the script for this, Pro might be better.
        # If LLM is used to *interpret* results, Flash might be fine.
        if task_details.get("task_phase") == "script_generation":
            chosen_model = pro_model
        else: # result interpretation or simple questions
            chosen_model = flash_model

    elif task_category == "UserFeedbackIncorporation":
        # Understanding and incorporating nuanced user feedback might benefit from Pro.
        chosen_model = pro_model

    elif task_category == "FinalReviewAndPackaging":
        # Pro for a comprehensive final review and summarization.
        chosen_model = pro_model
        
    # --- Task detail overrides (examples) ---
    # These can override category-based decisions if specific details demand it.

    if task_details.get("requires_advanced_multimodal") and "pro" not in flash_model: # Assuming Pro has better multimodal
        logger.info(f"Switching to Pro model for task {task_category} due to advanced multimodal requirement.")
        chosen_model = pro_model
        
    if task_details.get("context_window_needed", 0) > 128000: # Example: Flash has smaller context window
         if "pro" in pro_model: # Check if pro_model identifier suggests it's a pro variant
            logger.info(f"Switching to Pro model for task {task_category} due to large context window requirement.")
            chosen_model = pro_model
         # Else, if no pro model can handle it, this is a limitation.

    # Cost-saving override: If a Pro model task previously failed due to transient errors (not capability limits)
    # and a retry is attempted, it might try Flash if applicable. (More complex logic for later)
    if task_details.get("retry_attempt", 0) > 0 and task_details.get("can_retry_with_flash", False):
        if chosen_model == pro_model: # If it was about to use Pro
            logger.info(f"Retry attempt for {task_category}: trying Flash model as a fallback.")
            chosen_model = flash_model
            
    logger.info(f"Task Category: '{task_category}', Details: {task_details} -> Chosen Model: '{chosen_model}'")
    return chosen_model
Considerations for task_details:

This dictionary can be populated by me as I process a step. Examples:

"complexity": "low" | "medium" | "high" (estimated by me or previous step)
"code_snippet_size": "small" | "medium" | "large"
"requires_advanced_multimodal": True | False
"context_window_needed": <token_count>
"planning_depth_required": "shallow" | "deep"
"retry_attempt": <integer>
"can_retry_with_flash": True | False (Can this specific task be acceptably done by Flash if Pro fails?)
Handling Model Capabilities:

My core logic, when preparing to call the chosen Gemini model, must be aware of the general capabilities of "Flash" vs. "Pro" type models (e.g., which one to use for image-related prompts if requires_advanced_multimodal is true).
If a task requires a capability only available in the Pro model (e.g., a very large context window that Flash doesn't support), the choose_gemini_model function (or the calling logic) must ensure Pro is selected, or the task cannot proceed as planned.
The selection function prioritizes Pro for tasks known to need higher capabilities (Coding, Debugging).
Logging: The choice of model for each LLM call will be logged, including the task_category and key task_details that influenced the decision. This is crucial for debugging, performance analysis, and cost tracking.

## 4. Scout Agent Primary Control Loop

This section describes my main operational flow when assigned a high-level project goal.

**A. Goal Intake & Initial Understanding:**

1.  **Receive Goal:** I receive a high-level goal from you (e.g., via a new API endpoint like `POST /api/v1/scout_agent/projects` which stores the goal or through a UI interaction that calls this). A new project ID is generated.
2.  **Initial Processing (`ProjectUnderstanding` Task):**
    *   **Log:** "Received new project goal: '{goal}' for project ID: {project_id}".
    *   I may use an LLM (chosen by `choose_gemini_model` for `ProjectUnderstanding`) to:
        *   Parse the goal, identify key requirements, entities, and desired outcomes.
        *   Perform initial RAG queries (Mem0.ai) for very similar past projects or relevant boilerplate/templates.
        *   If ambiguities are high, I might log these and set the project status to "Pending Clarification," notifying you. For now, assume goal is clear enough or I make reasonable assumptions.
    *   **Log:** Key insights from understanding, assumptions made.
    *   **Update Project Metadata (via `ScoutProjectLogger`):**
        *   `set_project_goal(goal_text)`
        *   `set_overall_status("planning")`

**B. Planning (Decomposition into Steps):**

1.  **`Planning` Task:**
    *   **Log:** "Starting planning phase for project {project_id}."
    *   **Context:** Goal, insights from `ProjectUnderstanding`, relevant RAG results.
    *   **Model Selection:** `choose_gemini_model("Planning", sub_task_details={"planning_depth_required": "deep" (or "shallow" based on goal complexity)})`.
    *   **Action (LLM Call):** Prompt the selected Gemini model to break down the goal into a sequence of actionable, high-level steps. Each step should ideally be mappable to one of the defined `TaskCategory` types. The prompt should ask for a list of steps with:
        *   `step_id` (e.g., "1.0", "1.1", "2.0")
        *   `step_name` (brief description)
        *   `assigned_task_category` (from our defined list)
        *   Brief `step_description_or_goal`
        *   `dependencies` (list of other `step_id`s that must be completed first) - *Advanced, can be simplified for v1.*
    *   **Log:** The raw plan output from the LLM.
2.  **Store Plan:**
    *   Parse the LLM's plan.
    *   For each step, call `scout_logger.update_plan_step_status(step_id, step_name, "pending")`.
    *   The full plan structure is stored via `scout_logger._set_project_metadata(PROJECT_KEY_CURRENT_PLAN, parsed_plan_list)`.
    *   **Log:** "Plan generated with {N} steps. Project status set to 'Pending Plan Approval' (or directly to 'Running' if auto-approved)."
3.  **User Intervention Point (Optional but Recommended):**
    *   Set project status to "Pending Plan Approval" (`scout_logger.set_overall_status("pending_plan_approval")`).
    *   The UI can then display this plan, and you can approve it or provide feedback via the `/intervene` API. I pause here.

**C. Step-by-Step Execution Cycle:**

1.  **Initialize:**
    *   If resuming or approved, set project status to "Running" (`scout_logger.set_overall_status("running")`).
    *   Identify the next "pending" step from the plan that has its dependencies met. If no such step, move to Final Review or mark as completed/stuck.
2.  **Loop Through Steps:** For the current `active_step`:
    *   **Set Active Step:** `scout_logger.set_active_step(active_step.id)`.
    *   **Log:** "Starting step {active_step.id}: {active_step.name} ({active_step.assigned_task_category})".
    *   `scout_logger.update_plan_step_status(active_step.id, active_step.name, "active")`.
    *   **Prepare Context for Step:** Gather relevant information.
    *   **Model Selection for Step (if LLM needed):** `chosen_model = choose_gemini_model(...)`. Log choice.
    *   **Capability Selection & Execution:** Based on `active_step.assigned_task_category`:
        *   `CodeGeneration`: LLM call to generate code, then execute in NixOS sandbox. Log results.
        *   `ResearchAndInformationGathering`: Call Search MCP, summarize with LLM. Log. Optionally ingest to RAG.
        *   `MCPToolInteraction`: Call specific MCP. Log params and results.
    *   **Process Step Output:** Analyze results, log `agent_thoughts`, store key outputs.
    *   **Error Handling for Step:** Log failure, update step status to "failed". Implement retry logic (e.g., retry once, maybe switch model). If retries exhausted, set project to "pending_user_intervention" and pause.
    *   If successful: `scout_logger.update_plan_step_status(active_step.id, active_step.name, "completed")`.
    *   **Clear Active Step:** `scout_logger.set_active_step(None)`.
    *   If project status is "paused", break loop.
3.  **Loop Continuation:** Go to next step or Final Review.

**D. Context Management (Between Steps):**

*   **Short-Term "Scratchpad":** In-memory dictionary for current project session.
*   **NixOS Workspace Files:** For persistent code, data, artifacts. I track key file paths. File I/O for sandbox is crucial.
*   **Mem0.ai for Medium/Long-Term Context & RAG:** Store key decisions, summaries, code snippets, research, user feedback, tagged with `project_id` and `step_id`.

**E. Final Review and Packaging (Conceptual):**

1.  **`FinalReviewAndPackaging` Task:** Log start. Use LLM (Pro) with full context to assess goal completion, generate summary, identify deliverables. Log LLM review.
2.  **Set Final Status:** "completed" or "pending_user_review" (if gaps found). Log.

**F. User Intervention Handling:**

*   `/intervene` API call logs the command (`pause`, `resume`, `approve_step`, `provide_feedback`).
*   I react: set status for `pause`/`resume`/`approve`. For `provide_feedback`, I trigger a `UserFeedbackIncorporation` task to analyze feedback with LLM and potentially modify plan/retry step. Log interpretation and actions.
## 5. RAG (Retrieval Augmented Generation) with Mem0.ai Pro

I will leverage your existing Mem0.ai Pro package for Retrieval Augmented Generation to enhance my context and knowledge for various tasks.

**A. Proactive Ingestion Strategy:**

I (or potentially a separate background process triggered by project events) will ingest relevant information into Mem0.ai. Each piece of information will be associated with the `project_id` and potentially a `step_id` or other relevant tags.

1.  **Triggers for Ingestion:**
    *   **New Project Creation:** Ingest initial project goal, your requirements, and any context documents or URLs you provide.
    *   **Your Uploads:** When you upload relevant files (code, docs, data) to the project workspace.
    *   **My Web Research:** Key findings or downloaded documentation from `ResearchAndInformationGathering` tasks can be summarized and ingested.
    *   **Code Generation/Modification:** Successfully generated or modified code snippets (especially core logic or reusable components) can be ingested.
    *   **Your Feedback:** Important pieces of your feedback or clarification that have broad relevance to the project.
    *   **Completed Step Summaries:** A concise summary of a complex step's outcome and key learnings.

2.  **Content Types for Ingestion:**
    *   Plain text (requirements, summaries, feedback).
    *   Code snippets (Python, and potentially other languages if the project involves them).
    *   URLs to relevant documentation or resources (Mem0.ai might have its own web scraping, or I provide a summary).
    *   Potentially, structured data summaries if applicable.

3.  **My Action & Logging:**
    *   When I decide to ingest data, I will log this action:
        `scout_logger.log_entry(agent_action="ingest_to_RAG_memory", project_id=..., parameters={"source": "user_upload", "content_type": "text/markdown", "reference": "path/to/file.md"}, agent_thoughts="Ingesting project requirements for future context.")`
    *   The actual call to `mem0.add()` will use appropriate metadata including `project_id`, `step_id` (if applicable), `source_type` (e.g., `code_snippet`, `documentation_url`, `user_requirement`).

**B. Reactive Retrieval Strategy (During Task Execution):**

I will query Mem0.ai to retrieve relevant context before or during the execution of many task categories.

1.  **Triggers for Retrieval:**
    *   **`ProjectUnderstanding` / `Planning`:** Retrieve context from similar past projects or general domain knowledge if available.
    *   **`CodeGeneration`:** Query for existing relevant code snippets, API usage examples, best practices, or project-specific architectural patterns before generating new code.
    *   **`CodeAnalysis`:** Retrieve context about the specific module or functions being analyzed, or common patterns related to the language/framework.
    *   **`Debugging`:** Query with error messages or code context to find similar past issues, known solutions, or relevant documentation for the error.
    *   **`ResearchAndInformationGathering`:** Use RAG to see if the information needed has already been captured before performing external web searches.
    *   **`UserFeedbackIncorporation`:** Retrieve original requirements or previous discussions to understand the context of the new feedback.

2.  **Query Formulation:**
    *   Queries will be formulated by me, often using an LLM (e.g., Gemini Flash) to transform the current task or question into an effective search query for Mem0.ai.
    *   The query will include the `project_id` to scope the search appropriately.
    *   Examples:
        *   "Python function for calculating moving average in project {project_id}"
        *   "Common solutions for 'TypeError: x is not a function' in JavaScript related to {library_name} for project {project_id}"
        *   "Architectural overview or key components for {feature_name} in project {project_id}"

3.  **My Action & Logging:**
    *   When I query RAG:
        `scout_logger.log_entry(agent_action="query_RAG_memory", project_id=..., parameters={"query": "...", "top_k": 3}, agent_thoughts="Looking for existing implementations of similar features.")`
    *   The retrieved results from Mem0.ai (e.g., top N relevant chunks) will be logged (or a summary/reference if too large) and incorporated into the context provided to the primary LLM for the current task.
        `scout_logger.log_entry(agent_action="RAG_results_received", project_id=..., outputs={"retrieved_chunk_ids": [...], "summary_of_top_hit": "..."})`

**C. Memory Structure within Mem0.ai:**

*   Leverage Mem0.ai's capabilities for organizing memories (e.g., by user ID, which can be the `project_id` or a combination).
*   Use rich metadata with each memory:
    *   `project_id`
    *   `step_id` (if applicable, when the memory was generated/ingested)
    *   `task_category` (that generated the info)
    *   `source` (e.g., "llm_generated_code", "user_doc", "web_research_summary")
    *   `content_type` (e.g., "python_code", "markdown_summary", "error_solution")
    *   `keywords` (generated by LLM or extracted)

This structured approach to RAG will allow me to build and utilize a project-specific knowledge base, improving my efficiency and the quality of my work over time.

## 6. Logging via `scout_logger.py`

Comprehensive and structured logging is paramount for my transparency, debuggability, and for you to monitor progress. The `scout_logger.py` module (using TinyDB) will be the central point for all logging.

**Key Logging Principles:**

1.  **Atomicity of Actions:** Each distinct action or significant decision point I make should result in a log entry.
2.  **Structured Data:** Log entries will use the `log_entry()` method of `ScoutProjectLogger`, providing data for the defined keys (timestamp, step_id, step_name, agent_action, vm_id, parameters, outputs, agent_thoughts, status_update, is_error, message).
3.  **`agent_action` Field:** This field is crucial for categorizing log entries. Examples:
    *   `goal_received`, `planning_started`, `plan_generated`
    *   `step_started`, `step_completed`, `step_failed`, `step_skipped`
    *   `model_selection_made` (parameters: task, chosen_model, rationale)
    *   `llm_call_start`, `llm_call_complete` (parameters: model, prompt (or hash/summary); outputs: response (or hash/summary), token_usage, cost)
    *   `nixos_code_execution_start`, `nixos_code_execution_complete` (parameters: script, vm_id; outputs: stdout, stderr, exit_code)
    *   `tool_call_start`, `tool_call_complete` (parameters: tool_name, params; outputs: tool_response)
    *   `rag_ingest_start`, `rag_ingest_complete`
    *   `rag_query_start`, `rag_query_complete` (parameters: query; outputs: retrieved_ids, summary)
    *   `web_search_start`, `web_search_complete`
    *   `user_intervention_received` (parameters: command, details)
    *   `error_encountered` (parameters: error_details, context; is_error=True)
    *   `retry_attempt` (parameters: action_retried, attempt_number)
4.  **`agent_thoughts` Field:** Before taking a significant action (especially an LLM call or using a capability), I should log my "thoughts" or rationale. This is invaluable for debugging and understanding my behavior.
5.  **Parameter & Output Logging:** Log key input parameters and key results received for calls to LLMs, code execution, internal capabilities, etc. For very large data, log summaries or references.
6.  **Status Updates:** Use `status_update` field in logs AND the dedicated metadata methods in `ScoutProjectLogger` to keep the project's state current.
7.  **Error Logging:** All errors logged with `is_error=True` and include details.
8.  **Project Association:** All log entries are tied to a `project_id` via `ScoutProjectLogger`.

**Benefits of This Logging Approach:**
Transparency, Debuggability, Monitoring, Cost Tracking, Performance Analysis.
## 5. RAG (Retrieval Augmented Generation) with Mem0.ai Pro

I will leverage your existing Mem0.ai Pro package for Retrieval Augmented Generation to enhance my context and knowledge for various tasks. Your `.env` file indicates `MEM0_MEMORY_ENABLED=False` and `MEM0_RAG_ENABLED=False`. For this RAG design to be effective, these would need to be set to `true` when I am performing RAG-related tasks. My logic can be designed to check these flags.

**A. Proactive Ingestion Strategy:**

I will ingest relevant information into Mem0.ai. Each piece of information will be associated with the `project_id` and potentially a `step_id` or other relevant tags.

1.  **Triggers for Ingestion:**
    *   **New Project Creation:** I'll ingest the initial project goal, your requirements, and any documents or URLs you provide.
    *   **Your Uploads:** When you upload relevant files (code, docs, data) to the project workspace.
    *   **My Web Research:** I can summarize and ingest key findings or downloaded documentation from research tasks.
    *   **Code Generation/Modification:** I can ingest successfully generated or modified code snippets (especially core logic or reusable components).
    *   **Your Feedback:** Important pieces of your feedback or clarification that have broad relevance to the project.
    *   **Completed Step Summaries:** I can ingest a concise summary of a complex step's outcome and key learnings, especially if the outputs were large.

2.  **Content Types for Ingestion:**
    *   Plain text (requirements, summaries, feedback, web research summaries).
    *   Code snippets (Python, and potentially other languages if the project involves them).
    *   URLs to relevant documentation or resources (I will provide a summary or key excerpts for ingestion if Mem0.ai doesn't scrape URLs itself).

3.  **My Action & Logging:**
    *   When I decide to ingest data:
        `scout_logger.log_entry(agent_action="ingest_to_RAG_memory", project_id=..., parameters={"source": "user_upload", "content_type": "text/markdown", "reference": "workspace:/path/to/file.md"}, agent_thoughts="Ingesting project requirements for future context.")`
    *   The actual call to `mem0.add()` (or equivalent method in `EnhancedMamaBear` which uses `MemoryClient`) will use appropriate metadata including `project_id`, `step_id` (if applicable), `source_type` (e.g., `code_snippet`, `documentation_url`, `user_requirement`). The `user_id` for `mem0.add` should be the `project_id` to keep project memories distinct.

**B. Reactive Retrieval Strategy (During Task Execution):**

I will query Mem0.ai to retrieve relevant context.

1.  **Triggers for Retrieval:**
    *   **`ProjectUnderstanding` / `Planning`:** I'll retrieve context from similar past projects or general domain knowledge.
    *   **`CodeGeneration`:** I'll query for existing relevant code snippets, API usage examples, best practices, project-specific architectural patterns.
    *   **`CodeAnalysis`:** I'll retrieve context about the module/functions being analyzed.
    *   **`Debugging`:** I'll query with error messages/code context to find similar past issues or solutions.
    *   **`ResearchAndInformationGathering`:** I'll check RAG before external web searches.
    *   **`UserFeedbackIncorporation`:** I'll retrieve original requirements/discussions.

2.  **Query Formulation:**
    *   An LLM (e.g., Gemini Flash) can transform the current task/question into an effective search query for Mem0.ai.
    *   The query should include `project_id` (as `user_id` for Mem0.ai) to scope the search.

3.  **My Action & Logging:**
    *   Querying RAG:
        `scout_logger.log_entry(agent_action="query_RAG_memory", project_id=..., parameters={"query": "...", "top_k": 3, "mem0_user_id": project_id}, agent_thoughts="Looking for existing implementations.")`
    *   Retrieved results will be incorporated into the context for the primary LLM for the current task.
        `scout_logger.log_entry(agent_action="RAG_results_received", project_id=..., outputs={"retrieved_chunk_count": ..., "summary_of_top_hit": "..."})`

**C. Memory Structure within Mem0.ai:**

*   I will use `project_id` as the `user_id` in Mem0.ai to isolate memories per project.
*   I will utilize rich metadata with each memory item: `project_id`, `step_id`, `task_category`, `source`, `content_type`, `keywords`.

## 6. Logging via `scout_logger.py`

Comprehensive and structured logging using `scout_logger.py` (TinyDB backend) is critical.

**Key Logging Principles (Recap & Reinforcement):**

1.  **Atomicity & Structure:** Each distinct action or decision I make will be logged via `scout_logger.log_entry()` with structured data.
2.  **`agent_action` Field:** Essential for categorizing entries (e.g., `goal_received`, `planning_started`, `model_selection_made`, `llm_call_start`, `nixos_code_execution_start`, `rag_query_start`, `user_intervention_received`, `error_encountered`, `retry_attempt`).
3.  **`agent_thoughts` Field:** I will log my rationale before significant actions.
4.  **Parameter & Output Logging:** I will log key inputs and outputs for external calls (LLMs, NixOS, MCPs, RAG). I will summarize or reference large data. For LLM calls, I will log the model used, prompt (or its hash/summary), response (or summary), token usage, and cost (if available from API).
5.  **Status Updates:** I will use `status_update` in logs and `ScoutProjectLogger` metadata methods.
6.  **Error Logging:** I will use `is_error=True` and include details.
7.  **Project Association:** All logs are tied to `project_id`.

This approach will make my operations transparent, debuggable, and provide data for monitoring and future analysis.
END EXPLANATION BLOCK

This concludes the design document for Step 1: Design Dynamic Model Switching & Core Scout Agent Logic.

