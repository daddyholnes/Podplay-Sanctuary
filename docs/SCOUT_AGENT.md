# 🤖 Scout Agent Documentation

## Overview

The Scout Agent system provides real-time monitoring and control of automated development processes within the Podplay Build Sanctuary. It tracks project progress, visualizes execution plans, logs development activities, and allows human intervention when needed.

## Key Features

### 📊 Real-Time Project Monitoring
- **Live Analytics**: Continuous monitoring of development workflows
- **Status Dashboard**: Visual indicators for project health and progress
- **Performance Metrics**: Track execution times and resource usage
- **Historical Data**: Analyze trends and patterns over time

### 📋 Plan Visualization
- **Step Tracking**: Visual representation of project execution steps
- **Progress Indicators**: Real-time progress updates for each step
- **Dependency Mapping**: Show relationships between project components
- **Timeline View**: Chronological view of project milestones

### 📝 Activity Logging
- **Comprehensive Logs**: Detailed activity recording with timestamps
- **Structured Data**: JSON-formatted log entries for analysis
- **Filtering**: Search and filter logs by type, time, or keywords
- **Export**: Export logs for external analysis

### 🎛️ Intervention Controls
- **Pause/Resume**: Control automated process execution
- **Feedback System**: Provide guidance to automated agents
- **Override Controls**: Manual intervention when needed
- **Approval Gates**: Require human approval for critical actions

## API Reference

### Project Management Endpoints

#### List All Scout Projects
```
GET /api/scout/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "proj-12345",
      "name": "Frontend Development",
      "status": "running",
      "progress": 65.5,
      "started_at": "2025-05-26T09:00:00Z",
      "last_activity": "2025-05-26T14:30:00Z",
      "steps_total": 20,
      "steps_completed": 13
    }
  ]
}
```

#### Get Project Details
```
GET /api/scout/projects/{project_id}
```

**Response:**
```json
{
  "project": {
    "id": "proj-12345",
    "name": "Frontend Development",
    "description": "React component development with TypeScript",
    "status": "running",
    "progress": 65.5,
    "metrics": {
      "execution_time": 14520,
      "steps_total": 20,
      "steps_completed": 13,
      "errors_count": 2,
      "warnings_count": 5
    },
    "configuration": {
      "auto_pause_on_error": true,
      "require_approval": ["deployment", "database_changes"],
      "notification_level": "normal"
    }
  }
}
```

#### Start Project Monitoring
```
POST /api/scout/projects/{project_id}/start
```

#### Stop Project Monitoring
```
POST /api/scout/projects/{project_id}/stop
```

### Monitoring & Control Endpoints

#### Get Real-Time Project Status
```
GET /api/scout/projects/{project_id}/status
```

**Response:**
```json
{
  "status": {
    "current_step": {
      "id": "step-14",
      "name": "Component Testing",
      "status": "running",
      "progress": 40.2,
      "started_at": "2025-05-26T14:25:00Z"
    },
    "overall_progress": 65.5,
    "estimated_completion": "2025-05-26T16:45:00Z",
    "resource_usage": {
      "cpu": 45.2,
      "memory": 67.8,
      "disk_io": 23.4
    }
  }
}
```

#### Get Project Execution Plan
```
GET /api/scout/projects/{project_id}/plan
```

**Response:**
```json
{
  "plan": {
    "steps": [
      {
        "id": "step-1",
        "name": "Environment Setup",
        "description": "Initialize development environment",
        "status": "completed",
        "dependencies": [],
        "estimated_duration": 300,
        "actual_duration": 285
      },
      {
        "id": "step-2",
        "name": "Code Analysis",
        "description": "Analyze existing codebase",
        "status": "completed",
        "dependencies": ["step-1"],
        "estimated_duration": 600,
        "actual_duration": 545
      },
      {
        "id": "step-14",
        "name": "Component Testing",
        "description": "Run component unit tests",
        "status": "running",
        "dependencies": ["step-12", "step-13"],
        "estimated_duration": 900,
        "progress": 40.2
      }
    ]
  }
}
```

#### Get Project Activity Logs
```
GET /api/scout/projects/{project_id}/logs?limit=100&offset=0&level=info
```

**Response:**
```json
{
  "logs": [
    {
      "id": "log-67890",
      "timestamp": "2025-05-26T14:30:15Z",
      "level": "info",
      "message": "Component test suite started",
      "step_id": "step-14",
      "data": {
        "test_count": 45,
        "test_files": ["Button.test.tsx", "Modal.test.tsx"]
      }
    },
    {
      "id": "log-67889",
      "timestamp": "2025-05-26T14:29:42Z",
      "level": "warning",
      "message": "Deprecated API usage detected",
      "step_id": "step-13",
      "data": {
        "api": "React.createClass",
        "file": "OldComponent.tsx",
        "line": 42
      }
    }
  ],
  "pagination": {
    "total": 1250,
    "limit": 100,
    "offset": 0,
    "has_more": true
  }
}
```

#### Pause Project Execution
```
POST /api/scout/projects/{project_id}/pause
```

**Request Body:**
```json
{
  "reason": "Manual intervention required",
  "pause_after_current_step": true
}
```

#### Resume Project Execution
```
POST /api/scout/projects/{project_id}/resume
```

#### Send Feedback to Agent
```
POST /api/scout/projects/{project_id}/feedback
```

**Request Body:**
```json
{
  "type": "guidance",
  "message": "Focus on performance optimization in the next steps",
  "context": {
    "step_id": "step-14",
    "priority": "high"
  }
}
```

### Analytics Endpoints

#### Get Project Performance Metrics
```
GET /api/scout/projects/{project_id}/metrics?timeframe=24h
```

**Response:**
```json
{
  "metrics": {
    "timeframe": "24h",
    "execution_efficiency": 87.3,
    "average_step_duration": 445,
    "error_rate": 2.1,
    "intervention_count": 3,
    "resource_utilization": {
      "cpu_avg": 42.8,
      "memory_avg": 65.4,
      "peak_usage": "2025-05-26T12:15:00Z"
    }
  }
}
```

#### Get Project Timeline Data
```
GET /api/scout/projects/{project_id}/timeline?start=2025-05-26T00:00:00Z&end=2025-05-26T23:59:59Z
```

## Frontend Components

### ScoutProjectView Component

The main Scout Agent monitoring interface:

```typescript
interface ScoutProjectViewProps {
  // No props required - manages its own state
}

interface ScoutProjectState {
  projects: ScoutProject[];
  selectedProject: ScoutProject | null;
  loading: boolean;
  error: string | null;
  autoRefresh: boolean;
  refreshInterval: number;
}
```

**Key Features:**
- Project selection and overview
- Real-time status dashboard
- Auto-refresh configuration
- Navigation to detailed views

### ScoutPlanDisplayComponent

Visual project plan tracking:

```typescript
interface ScoutPlanDisplayProps {
  projectId: string;
  plan: ProjectPlan;
  onStepSelect: (step: PlanStep) => void;
}

interface PlanStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  dependencies: string[];
  progress?: number;
  estimatedDuration: number;
  actualDuration?: number;
}
```

**Features:**
- Step-by-step plan visualization
- Progress indicators for each step
- Status badges with color coding
- Dependency relationship mapping

### ScoutLogViewerComponent

Comprehensive activity log viewer:

```typescript
interface ScoutLogViewerProps {
  projectId: string;
  autoScroll?: boolean;
  filterLevel?: LogLevel;
  maxEntries?: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  stepId?: string;
  data?: any;
}
```

**Features:**
- Real-time log streaming
- Timestamp formatting
- JSON data expansion
- Search and filtering capabilities
- Export functionality

### ScoutInterventionControlsComponent

Agent control and feedback interface:

```typescript
interface ScoutInterventionControlsProps {
  projectId: string;
  projectStatus: ProjectStatus;
  onPause: () => void;
  onResume: () => void;
  onFeedback: (feedback: AgentFeedback) => void;
}

interface AgentFeedback {
  type: 'guidance' | 'approval' | 'correction';
  message: string;
  context?: any;
}
```

**Features:**
- Pause/resume controls
- Feedback submission forms
- Status indicators
- Emergency intervention options

## Styling and Theming

### CSS Classes

The Scout Agent components use a professional monitoring interface theme:

```css
/* Main Scout view */
.scout-project-view {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "controls main";
  grid-template-columns: 300px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  height: 100vh;
  padding: 1rem;
}

/* Project status dashboard */
.status-dashboard {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Plan step visualization */
.plan-step {
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  position: relative;
  transition: all 0.3s ease;
}

.plan-step.running {
  border-color: var(--info-color);
  box-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
}

.plan-step.completed {
  border-color: var(--success-color);
}

.plan-step.failed {
  border-color: var(--error-color);
}
```

### Status Indicators

```css
/* Status badges */
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-running { 
  background: var(--info-color); 
  color: white; 
}

.status-completed { 
  background: var(--success-color); 
  color: white; 
}

.status-failed { 
  background: var(--error-color); 
  color: white; 
}

.status-paused { 
  background: var(--warning-color); 
  color: white; 
}
```

### Progress Visualization

```css
/* Progress bars */
.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Circular progress indicators */
.circular-progress {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    var(--primary-color) 0deg,
    var(--primary-color) calc(var(--progress) * 3.6deg),
    var(--border-color) calc(var(--progress) * 3.6deg)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}
```

## Backend Implementation

### Scout Logger

The `scout_logger.py` module handles comprehensive activity logging:

```python
class ScoutLogger:
    def __init__(self):
        self.projects = {}
        self.log_handlers = []
    
    async def start_project_monitoring(self, project_id: str, config: MonitoringConfig):
        """Start monitoring a project with specified configuration"""
        
    async def log_activity(self, project_id: str, level: str, message: str, data: dict = None):
        """Log a development activity with structured data"""
        
    async def update_project_status(self, project_id: str, status: ProjectStatus):
        """Update the current status of a monitored project"""
        
    async def get_project_logs(self, project_id: str, filters: LogFilters) -> List[LogEntry]:
        """Retrieve filtered project logs"""
        
    async def get_project_metrics(self, project_id: str, timeframe: str) -> ProjectMetrics:
        """Calculate and return project performance metrics"""
```

### Project Plan Manager

```python
class ProjectPlanManager:
    def __init__(self):
        self.plans = {}
        self.execution_engine = ExecutionEngine()
    
    async def create_project_plan(self, project_id: str, plan_config: PlanConfig) -> ProjectPlan:
        """Create a new project execution plan"""
        
    async def update_step_status(self, project_id: str, step_id: str, status: StepStatus):
        """Update the status of a specific plan step"""
        
    async def get_execution_timeline(self, project_id: str) -> Timeline:
        """Get the execution timeline for project visualization"""
        
    async def handle_intervention(self, project_id: str, intervention: Intervention):
        """Process human intervention in project execution"""
```

### Intervention Controller

```python
class InterventionController:
    def __init__(self):
        self.active_interventions = {}
        self.approval_queue = []
    
    async def pause_project(self, project_id: str, reason: str) -> bool:
        """Pause project execution with specified reason"""
        
    async def resume_project(self, project_id: str) -> bool:
        """Resume paused project execution"""
        
    async def submit_feedback(self, project_id: str, feedback: AgentFeedback):
        """Submit feedback to guide agent behavior"""
        
    async def request_approval(self, project_id: str, action: str) -> ApprovalRequest:
        """Request human approval for critical actions"""
```

## Configuration

### Project Monitoring Configuration

```yaml
# scout_config.yaml
monitoring:
  auto_refresh_interval: 5000  # milliseconds
  log_retention_days: 30
  max_log_entries: 10000
  
  # Notification settings
  notifications:
    email_alerts: true
    desktop_notifications: true
    alert_thresholds:
      error_rate: 5.0  # percentage
      execution_time: 3600  # seconds
      resource_usage: 90.0  # percentage

  # Intervention settings
  intervention:
    auto_pause_on_error: true
    require_approval:
      - deployment
      - database_changes
      - external_api_calls
    
  # Performance monitoring
  performance:
    track_resource_usage: true
    profile_execution_time: true
    monitor_dependencies: true
```

### Agent Feedback Configuration

```yaml
# feedback_config.yaml
feedback:
  types:
    - guidance
    - approval
    - correction
    - optimization_suggestion
  
  priority_levels:
    - low
    - normal
    - high
    - critical
  
  auto_actions:
    high_priority_pause: true
    critical_immediate_stop: true
    auto_retry_on_transient_error: true
```

## Security and Privacy

### Access Control
- Project monitoring requires authenticated access
- Role-based permissions for intervention controls
- Audit logging for all monitoring activities

### Data Protection
- Activity logs are encrypted at rest
- Sensitive data is masked in logs
- Retention policies for log cleanup

### Monitoring Ethics
- Transparent monitoring with clear boundaries
- Opt-in monitoring for development activities
- Privacy controls for sensitive operations

## Troubleshooting

### Common Issues

#### Project Not Appearing in Dashboard
1. Verify project is registered with Scout Agent
2. Check monitoring configuration
3. Review authentication status
4. Validate API connectivity

#### Missing or Incomplete Logs
1. Check log retention settings
2. Verify logging level configuration
3. Review disk space availability
4. Validate log file permissions

#### Intervention Controls Not Working
1. Verify user permissions
2. Check project execution status
3. Review intervention configuration
4. Validate WebSocket connections

### Debug Commands

```bash
# Check Scout Agent status
curl http://localhost:5000/api/scout/projects

# Test project monitoring
curl http://localhost:5000/api/scout/projects/proj-12345/status

# Monitor WebSocket connections
wscat -c ws://localhost:5000/ws/scout/projects/proj-12345/logs
```

## Best Practices

### Monitoring Strategy
- Set appropriate refresh intervals for real-time updates
- Configure meaningful log levels and filters
- Implement proper error handling and retry logic
- Use structured logging for better analysis

### Intervention Guidelines
- Use pause controls judiciously to avoid disrupting workflows
- Provide clear, actionable feedback to agents
- Document intervention decisions for future reference
- Establish approval workflows for critical operations

### Performance Optimization
- Limit log retention to reasonable timeframes
- Use efficient filtering and pagination for large datasets
- Implement caching for frequently accessed data
- Monitor resource usage of the monitoring system itself

## Future Enhancements

### Planned Features
- **Machine Learning Integration**: Predictive analytics for project outcomes
- **Advanced Visualization**: Interactive charts and graphs for metrics
- **Integration APIs**: Connect with external monitoring tools
- **Collaborative Monitoring**: Multi-user monitoring and intervention
- **Custom Alerting**: Configurable alert rules and notifications
- **Historical Analysis**: Long-term trend analysis and reporting

### Community Contributions
- Custom monitoring plugins
- Integration with popular development tools
- Enhanced visualization components
- Performance optimizations
- Documentation improvements

---

For more information, see the [main README](../README.md) or the [NixOS Workspaces documentation](NIXOS_WORKSPACES.md).
