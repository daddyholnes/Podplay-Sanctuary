# ❄️ NixOS Workspaces Documentation

## Overview

The NixOS Workspaces system provides cloud-based, reproducible development environments powered by NixOS. Each workspace is an isolated, configurable instance that can be created, managed, and accessed through the Podplay Build Sanctuary desktop application.

## Key Features

### 🏗️ Workspace Lifecycle Management
- **Creation**: Configure CPU, memory, storage, and environment templates
- **Management**: Start, stop, restart, and delete workspaces
- **Monitoring**: Real-time health, resource usage, and connectivity status
- **Scaling**: Dynamically adjust resources based on project needs

### 💻 Terminal Integration
- **Browser Terminal**: Full xterm.js terminal with SSH connectivity
- **Session Persistence**: Maintain terminal sessions across browser refreshes
- **Multi-Tab Support**: Multiple terminal sessions per workspace
- **File System Access**: Direct access to workspace file systems

### 📊 Monitoring & Analytics
- **Resource Usage**: CPU, memory, storage, and network monitoring
- **Performance Metrics**: Response times and system health indicators
- **Usage History**: Track workspace utilization over time
- **Cost Tracking**: Monitor resource consumption and associated costs

## API Reference

### Workspace Management Endpoints

#### List All Workspaces
```
GET /api/nixos/workspaces
```
Returns a list of all workspaces with their current status and configuration.

**Response:**
```json
{
  "workspaces": [
    {
      "id": "ws-12345",
      "name": "development-env",
      "status": "running",
      "cpu": 2,
      "memory": 4,
      "storage": 20,
      "created_at": "2025-05-26T10:00:00Z",
      "last_accessed": "2025-05-26T14:30:00Z"
    }
  ]
}
```

#### Create New Workspace
```
POST /api/nixos/workspaces/create
```

**Request Body:**
```json
{
  "name": "my-dev-env",
  "cpu": 2,
  "memory": 4,
  "storage": 20,
  "template": "development",
  "packages": ["nodejs", "python3", "git"]
}
```

**Response:**
```json
{
  "workspace": {
    "id": "ws-67890",
    "name": "my-dev-env",
    "status": "creating",
    "config": {
      "cpu": 2,
      "memory": 4,
      "storage": 20
    }
  }
}
```

#### Get Workspace Details
```
GET /api/nixos/workspaces/{workspace_id}
```

**Response:**
```json
{
  "workspace": {
    "id": "ws-12345",
    "name": "development-env",
    "status": "running",
    "config": {
      "cpu": 2,
      "memory": 4,
      "storage": 20
    },
    "metrics": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "storage_usage": 23.4
    },
    "ssh_info": {
      "host": "workspace-12345.nixos.dev",
      "port": 22,
      "username": "nixos"
    }
  }
}
```

#### Start Workspace
```
POST /api/nixos/workspaces/{workspace_id}/start
```

#### Stop Workspace
```
POST /api/nixos/workspaces/{workspace_id}/stop
```

#### Delete Workspace
```
DELETE /api/nixos/workspaces/{workspace_id}
```

### Terminal Access

#### Get Terminal Connection Info
```
GET /api/nixos/workspaces/{workspace_id}/terminal
```

**Response:**
```json
{
  "terminal": {
    "websocket_url": "ws://localhost:5000/ws/nixos/workspaces/ws-12345/terminal",
    "ssh_host": "workspace-12345.nixos.dev",
    "ssh_port": 22,
    "username": "nixos"
  }
}
```

#### WebSocket Terminal Connection
```
WS /ws/nixos/workspaces/{workspace_id}/terminal
```

WebSocket messages:
- **Input**: `{"type": "input", "data": "ls -la\n"}`
- **Output**: `{"type": "output", "data": "total 8\ndrwxr-xr-x..."}`
- **Resize**: `{"type": "resize", "cols": 80, "rows": 24}`

### File Management

#### List Workspace Files
```
GET /api/nixos/workspaces/{workspace_id}/files?path=/home/nixos
```

#### Upload Files
```
POST /api/nixos/workspaces/{workspace_id}/files/upload
Content-Type: multipart/form-data
```

#### Download File
```
GET /api/nixos/workspaces/{workspace_id}/files/{file_path}
```

## Frontend Components

### WorkspacesView Component

The main workspace management interface provides:

```typescript
interface WorkspacesViewProps {
  // No props required - manages its own state
}

interface WorkspaceState {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  selectedWorkspace: Workspace | null;
  showCreateModal: boolean;
}
```

**Key Features:**
- Real-time workspace status updates
- Workspace creation modal
- Resource usage monitoring
- Quick action buttons

### WorkspaceListComponent

Displays all workspaces with filtering and sorting:

```typescript
interface WorkspaceListProps {
  workspaces: Workspace[];
  onWorkspaceSelect: (workspace: Workspace) => void;
  onWorkspaceAction: (action: WorkspaceAction, workspace: Workspace) => void;
}
```

### WorkspaceItem Component

Individual workspace cards showing:

```typescript
interface WorkspaceItemProps {
  workspace: Workspace;
  onSelect: (workspace: Workspace) => void;
  onAction: (action: WorkspaceAction) => void;
}
```

**Features:**
- Status indicators with color coding
- Resource usage visualization
- Quick actions (start/stop/terminal/files)
- Real-time metrics updates

### WebTerminalComponent

Browser-based terminal with full SSH integration:

```typescript
interface WebTerminalProps {
  workspaceId: string;
  onClose: () => void;
}
```

**Features:**
- xterm.js integration for full terminal emulation
- WebSocket-based SSH connection
- Session persistence across refreshes
- Resize handling and terminal customization

### WorkspaceCreationModal

Workspace configuration and creation interface:

```typescript
interface WorkspaceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (config: WorkspaceConfig) => void;
}

interface WorkspaceConfig {
  name: string;
  cpu: number;
  memory: number;
  storage: number;
  template: string;
  packages: string[];
}
```

## Styling and Theming

### CSS Classes

The NixOS Workspaces components use a consistent styling system:

```css
/* Main workspace view */
.workspaces-view {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
}

/* Workspace items */
.workspace-item {
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
}

.workspace-item:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Status indicators */
.status-running { color: var(--success-color); }
.status-stopped { color: var(--warning-color); }
.status-error { color: var(--error-color); }
.status-creating { color: var(--info-color); }
```

### CSS Variables

```css
:root {
  --nixos-primary: #7ebae4;
  --nixos-secondary: #4a90b8;
  --workspace-bg: #1a1a1a;
  --workspace-border: #333;
  --terminal-bg: #000;
  --terminal-text: #fff;
}
```

## Backend Implementation

### NixOS Orchestrator

The `nixos_sandbox_orchestrator.py` module handles:

```python
class NixOSSandboxOrchestrator:
    def __init__(self):
        self.workspaces = {}
        self.ssh_bridge = SSHBridge()
    
    async def create_workspace(self, config: WorkspaceConfig) -> Workspace:
        """Create a new NixOS workspace with specified configuration"""
        
    async def start_workspace(self, workspace_id: str) -> bool:
        """Start an existing workspace"""
        
    async def stop_workspace(self, workspace_id: str) -> bool:
        """Stop a running workspace"""
        
    async def get_workspace_status(self, workspace_id: str) -> WorkspaceStatus:
        """Get real-time workspace status and metrics"""
        
    async def delete_workspace(self, workspace_id: str) -> bool:
        """Delete a workspace and clean up resources"""
```

### SSH Bridge

The `ssh_bridge.py` module provides WebSocket-to-SSH connectivity:

```python
class SSHBridge:
    def __init__(self):
        self.connections = {}
    
    async def create_terminal_session(self, workspace_id: str, websocket) -> SSHSession:
        """Create a new SSH session for terminal access"""
        
    async def handle_terminal_input(self, session_id: str, data: str):
        """Handle terminal input from WebSocket"""
        
    async def send_terminal_output(self, session_id: str, data: str):
        """Send terminal output to WebSocket"""
```

## Security Considerations

### Access Control
- Each workspace is isolated with unique SSH keys
- WebSocket connections are authenticated and validated
- File access is restricted to workspace boundaries

### Network Security
- SSH connections use key-based authentication
- WebSocket connections require valid session tokens
- Network access is controlled through NixOS firewall rules

### Data Protection
- Workspace data is encrypted at rest
- SSH communications are encrypted in transit
- Audit logging for all workspace operations

## Troubleshooting

### Common Issues

#### Workspace Won't Start
1. Check resource availability
2. Verify NixOS infrastructure status
3. Review workspace configuration
4. Check system logs

#### Terminal Connection Failed
1. Verify workspace is running
2. Check SSH service status
3. Validate WebSocket connection
4. Review network connectivity

#### File Access Issues
1. Check workspace permissions
2. Verify SSH authentication
3. Review file system status
4. Check disk space availability

### Debug Commands

```bash
# Check workspace status
curl http://localhost:5000/api/nixos/workspaces

# Test SSH connectivity
ssh -i workspace_key nixos@workspace-host

# Monitor WebSocket connections
wscat -c ws://localhost:5000/ws/nixos/workspaces/ws-12345/terminal
```

## Best Practices

### Workspace Management
- Use descriptive names for workspaces
- Regular backup of important data
- Monitor resource usage to optimize costs
- Clean up unused workspaces regularly

### Development Workflow
- Use version control within workspaces
- Document workspace configurations
- Share workspace templates across team
- Implement automated testing pipelines

### Resource Optimization
- Right-size workspace resources for tasks
- Use workspace templates for common configurations
- Implement auto-shutdown for idle workspaces
- Monitor and optimize resource utilization

## Future Enhancements

### Planned Features
- **Workspace Templates**: Pre-configured environments for specific tech stacks
- **Collaborative Workspaces**: Multi-user workspace sharing
- **Snapshot Management**: Backup and restore workspace states
- **Auto-scaling**: Dynamic resource adjustment based on usage
- **Integration APIs**: Connect with external development tools
- **Cost Management**: Advanced billing and usage analytics

### Community Contributions
- Custom workspace configurations
- Integration with popular development tools
- Performance optimizations
- Security enhancements
- Documentation improvements

---

For more information, see the [main README](../README.md) or contact the development team.
