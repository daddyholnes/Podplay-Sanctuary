# 📚 PodPlay Sanctuary API Reference

> **Complete API documentation for developers integrating with the PodPlay Sanctuary Agent Framework**

This comprehensive reference covers all REST endpoints, WebSocket events, service APIs, and configuration options available in the PodPlay Sanctuary platform.

## 📋 Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication](#authentication)
3. [Chat & AI Agents API](#chat--ai-agents-api)
4. [MCP Marketplace API](#mcp-marketplace-api)
5. [Scout Agent API](#scout-agent-api)
6. [Development Workspaces API](#development-workspaces-api)
7. [Model Management API](#model-management-api)
8. [Health & Monitoring API](#health--monitoring-api)
9. [WebSocket Events](#websocket-events)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Service Configuration](#service-configuration)

## 🌐 Base Configuration

### Base URL
```
Production: https://api.podplay-sanctuary.dev
Development: http://localhost:5000
```

### API Version
Current version: `v1`

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`
- **WebSocket**: `socket.io`

### Common Headers
```http
Content-Type: application/json
Authorization: Bearer <your-api-token>
X-Request-ID: <unique-request-id>
```

## 🔐 Authentication

### API Token Authentication
```http
Authorization: Bearer podplay_api_<your-token-here>
```

### Session-Based Authentication
```http
Cookie: session=<session-id>
```

### WebSocket Authentication
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-api-token'
  }
});
```

## 🤖 Chat & AI Agents API

### Mama Bear Chat

#### POST `/api/chat/mama-bear`
Process chat interaction with Mama Bear AI agent.

**Request Body:**
```json
{
  "message": "Help me build a React component",
  "user_id": "nathan_sanctuary",
  "session_id": "sess_12345",
  "context": {
    "current_project": "podplay-frontend",
    "framework": "react",
    "preferred_style": "typescript"
  },
  "stream": false,
  "model_preference": "gemini-2.0-flash"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I'd be happy to help you build a React component! Based on your context, I see you're working with TypeScript...",
  "session_id": "sess_12345",
  "message_id": "msg_67890",
  "model_used": "gemini-2.0-flash",
  "tokens_used": 245,
  "cost": 0.018,
  "timestamp": "2024-06-02T22:30:45.123Z",
  "metadata": {
    "response_time": 1.2,
    "confidence": 0.95,
    "context_used": true,
    "memory_stored": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid message format",
  "error_code": "INVALID_INPUT",
  "message_id": null,
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### GET `/api/chat/history`
Retrieve chat history for a user.

**Query Parameters:**
- `user_id` (required): User identifier
- `session_id` (optional): Specific session
- `limit` (optional): Number of messages (default: 50, max: 200)
- `offset` (optional): Pagination offset (default: 0)
- `start_date` (optional): ISO 8601 date string
- `end_date` (optional): ISO 8601 date string

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "message_id": "msg_67890",
      "session_id": "sess_12345",
      "user_message": "Help me build a React component",
      "ai_response": "I'd be happy to help...",
      "model_used": "gemini-2.0-flash",
      "timestamp": "2024-06-02T22:30:45.123Z",
      "tokens_used": 245,
      "cost": 0.018
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

#### DELETE `/api/chat/history/{session_id}`
Delete a specific chat session.

**Response:**
```json
{
  "success": true,
  "message": "Session deleted successfully",
  "session_id": "sess_12345"
}
```

### Enhanced Mama Features

#### POST `/api/chat/store-memory`
Store information in persistent memory.

**Request Body:**
```json
{
  "user_id": "nathan_sanctuary",
  "content": "User prefers React with TypeScript and uses Tailwind for styling",
  "category": "preferences",
  "metadata": {
    "importance": "high",
    "tags": ["react", "typescript", "tailwind"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "memory_id": "mem_abc123",
  "message": "Memory stored successfully"
}
```

#### GET `/api/chat/memories`
Retrieve stored memories for contextualization.

**Query Parameters:**
- `user_id` (required): User identifier
- `category` (optional): Memory category
- `search` (optional): Search term
- `limit` (optional): Number of results (default: 20)

**Response:**
```json
{
  "success": true,
  "memories": [
    {
      "memory_id": "mem_abc123",
      "content": "User prefers React with TypeScript",
      "category": "preferences",
      "relevance_score": 0.95,
      "created_at": "2024-06-02T22:30:45.123Z",
      "metadata": {
        "importance": "high",
        "tags": ["react", "typescript"]
      }
    }
  ]
}
```

## 🏪 MCP Marketplace API

### Server Discovery

#### GET `/api/mcp/search`
Search MCP servers with filtering and sorting.

**Query Parameters:**
- `query` (optional): Search term
- `category` (optional): Server category filter
- `official_only` (optional): Boolean for official servers only
- `limit` (optional): Results limit (default: 20, max: 100)
- `sort` (optional): Sort by `popularity`, `name`, `updated` (default: popularity)
- `order` (optional): `asc` or `desc` (default: desc)

**Response:**
```json
{
  "success": true,
  "servers": [
    {
      "name": "github-mcp",
      "description": "GitHub repository management and integration",
      "category": "devops",
      "author": "GitHub",
      "version": "2.1.0",
      "repository_url": "https://github.com/github/mcp-server",
      "popularity_score": 4.8,
      "download_count": 15420,
      "is_official": true,
      "is_installed": false,
      "capabilities": ["repository", "issues", "pull_requests"],
      "dependencies": ["git", "nodejs"],
      "installation_method": "npm",
      "configuration_schema": {
        "type": "object",
        "properties": {
          "api_token": {"type": "string", "required": true},
          "organization": {"type": "string"}
        }
      },
      "tags": ["git", "github", "devops", "repository"],
      "last_updated": "2024-05-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "page": 1,
    "limit": 20,
    "has_more": true
  },
  "filters_applied": {
    "category": "devops",
    "official_only": false
  }
}
```

#### GET `/api/mcp/categories`
Get all available MCP server categories.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "name": "ai",
      "display_name": "AI & Machine Learning",
      "description": "AI model integrations and ML tools",
      "icon": "🤖",
      "server_count": 25
    },
    {
      "name": "database",
      "display_name": "Database",
      "description": "Database connectors and management tools",
      "icon": "🗄️",
      "server_count": 18
    },
    {
      "name": "devops",
      "display_name": "DevOps",
      "description": "Development and deployment tools",
      "icon": "⚙️",
      "server_count": 32
    }
  ]
}
```

### Server Management

#### POST `/api/mcp/install`
Install an MCP server.

**Request Body:**
```json
{
  "server_name": "github-mcp",
  "configuration": {
    "api_token": "ghp_your_token_here",
    "organization": "your-org"
  },
  "auto_start": true
}
```

**Response:**
```json
{
  "success": true,
  "installation_id": "inst_xyz789",
  "server_name": "github-mcp",
  "status": "installing",
  "estimated_duration": "2-3 minutes",
  "message": "Installation started successfully"
}
```

#### GET `/api/mcp/installed`
List all installed MCP servers.

**Response:**
```json
{
  "success": true,
  "servers": [
    {
      "installation_id": "inst_xyz789",
      "server_name": "github-mcp",
      "status": "running",
      "health_status": "healthy",
      "installed_at": "2024-06-02T20:15:30Z",
      "last_health_check": "2024-06-02T22:28:15Z",
      "configuration": {
        "api_token": "ghp_***_redacted",
        "organization": "your-org"
      },
      "metrics": {
        "uptime": "2h 13m",
        "requests_handled": 45,
        "avg_response_time": "150ms",
        "error_rate": 0.02
      }
    }
  ]
}
```

#### DELETE `/api/mcp/uninstall/{server_name}`
Uninstall an MCP server.

**Response:**
```json
{
  "success": true,
  "server_name": "github-mcp",
  "message": "Server uninstalled successfully"
}
```

#### POST `/api/mcp/configure/{server_name}`
Update MCP server configuration.

**Request Body:**
```json
{
  "configuration": {
    "api_token": "new_token_here",
    "timeout": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "server_name": "github-mcp",
  "message": "Configuration updated successfully",
  "restart_required": true
}
```

### Server Operations

#### POST `/api/mcp/execute/{server_name}`
Execute a tool on an MCP server.

**Request Body:**
```json
{
  "tool_name": "create_repository",
  "parameters": {
    "name": "my-new-repo",
    "description": "A new repository created via MCP",
    "private": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "tool_name": "create_repository",
  "server_name": "github-mcp",
  "result": {
    "repository_url": "https://github.com/your-org/my-new-repo",
    "clone_url": "git@github.com:your-org/my-new-repo.git",
    "repository_id": 123456789
  },
  "execution_time": "1.2s",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### GET `/api/mcp/tools/{server_name}`
Get available tools for an MCP server.

**Response:**
```json
{
  "success": true,
  "server_name": "github-mcp",
  "tools": [
    {
      "name": "create_repository",
      "description": "Create a new GitHub repository",
      "parameters": {
        "name": {"type": "string", "required": true},
        "description": {"type": "string"},
        "private": {"type": "boolean", "default": false}
      }
    },
    {
      "name": "list_repositories",
      "description": "List user repositories",
      "parameters": {
        "type": {"type": "string", "enum": ["all", "owner", "member"]}
      }
    }
  ]
}
```

## 🚀 Scout Agent API

### Project Management

#### GET `/api/v1/scout_agent/projects`
List all Scout projects.

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `completed`, `paused`)
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "project_id": "proj_abc123",
      "name": "podplay-frontend",
      "description": "Frontend for PodPlay Sanctuary",
      "status": "active",
      "created_at": "2024-06-01T10:00:00Z",
      "updated_at": "2024-06-02T22:30:45.123Z",
      "completion_percentage": 75,
      "workspace_id": "workspace_xyz789",
      "repository_url": "https://github.com/your-org/podplay-frontend",
      "technologies": ["react", "typescript", "tailwind"],
      "estimated_completion": "2024-06-05T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST `/api/v1/scout_agent/projects`
Create a new Scout project.

**Request Body:**
```json
{
  "name": "my-new-app",
  "description": "A new application built with Scout",
  "template": "react-typescript",
  "features": ["authentication", "database", "api"],
  "configuration": {
    "framework": "react",
    "styling": "tailwind",
    "backend": "node",
    "database": "postgresql"
  },
  "repository": {
    "create": true,
    "name": "my-new-app",
    "private": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "project_id": "proj_def456",
  "name": "my-new-app",
  "status": "initializing",
  "workspace_id": "workspace_new123",
  "repository_url": "https://github.com/your-org/my-new-app",
  "estimated_setup_time": "5-10 minutes",
  "next_steps": [
    "Setting up development environment",
    "Installing dependencies", 
    "Configuring project structure",
    "Implementing core features"
  ]
}
```

#### GET `/api/v1/scout_agent/projects/{project_name}/status`
Get detailed project status.

**Response:**
```json
{
  "success": true,
  "project_goal": "Develop and maintain project: my-new-app",
  "project_overall_status": "running",
  "project_current_plan": [
    {
      "id": "step_1",
      "name": "Initialize Development Environment",
      "status": "completed",
      "completed_at": "2024-06-02T20:30:00Z"
    },
    {
      "id": "step_2",
      "name": "Set Up Project Structure", 
      "status": "active",
      "started_at": "2024-06-02T20:35:00Z",
      "estimated_completion": "2024-06-02T21:00:00Z"
    }
  ],
  "project_active_step_id": "step_2",
  "project_associated_workspace_id": "workspace_new123",
  "progress_percentage": 25,
  "time_elapsed": "2h 15m",
  "estimated_remaining": "6h 30m"
}
```

#### POST `/api/v1/scout_agent/projects/{project_id}/deploy`
Deploy a project to production.

**Request Body:**
```json
{
  "environment": "production",
  "platform": "vercel",
  "configuration": {
    "domain": "my-app.com",
    "environment_variables": {
      "NODE_ENV": "production",
      "API_URL": "https://api.my-app.com"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "deployment_id": "dep_ghi789",
  "project_id": "proj_def456", 
  "status": "deploying",
  "platform": "vercel",
  "deployment_url": "https://my-app-git-main-yourorg.vercel.app",
  "estimated_duration": "3-5 minutes",
  "logs_url": "https://vercel.com/deployments/dep_ghi789"
}
```

## 🔧 Development Workspaces API

### Workspace Management

#### GET `/api/workspaces`
List all development workspaces.

**Query Parameters:**
- `status` (optional): Filter by status (`running`, `stopped`, `paused`)
- `type` (optional): Filter by type (`nixos`, `docker`, `codespace`)

**Response:**
```json
{
  "success": true,
  "workspaces": [
    {
      "workspace_id": "ws_abc123",
      "name": "React Development",
      "type": "nixos",
      "status": "running",
      "created_at": "2024-06-02T10:00:00Z",
      "last_accessed": "2024-06-02T22:25:00Z",
      "configuration": {
        "memory": "4GB",
        "cpu_cores": 2,
        "disk_space": "20GB",
        "packages": ["nodejs", "git", "vim"]
      },
      "access_url": "https://ws-abc123.podplay-sanctuary.dev",
      "port_mappings": {
        "3000": "http",
        "5000": "api"
      }
    }
  ]
}
```

#### POST `/api/workspaces`
Create a new development workspace.

**Request Body:**
```json
{
  "name": "Python ML Workspace",
  "type": "nixos",
  "template": "python-ml",
  "configuration": {
    "memory": "8GB",
    "cpu_cores": 4,
    "packages": ["python39", "jupyter", "tensorflow", "git"],
    "environment_variables": {
      "PYTHONPATH": "/workspace/src"
    }
  },
  "auto_start": true
}
```

**Response:**
```json
{
  "success": true,
  "workspace_id": "ws_def456",
  "name": "Python ML Workspace",
  "type": "nixos",
  "status": "creating",
  "estimated_setup_time": "3-5 minutes",
  "access_url": "https://ws-def456.podplay-sanctuary.dev"
}
```

#### POST `/api/workspaces/{workspace_id}/start`
Start a stopped workspace.

**Response:**
```json
{
  "success": true,
  "workspace_id": "ws_def456",
  "status": "starting",
  "estimated_start_time": "1-2 minutes"
}
```

#### POST `/api/workspaces/{workspace_id}/stop`
Stop a running workspace.

**Response:**
```json
{
  "success": true,
  "workspace_id": "ws_def456",
  "status": "stopping",
  "data_preserved": true
}
```

#### DELETE `/api/workspaces/{workspace_id}`
Delete a workspace permanently.

**Response:**
```json
{
  "success": true,
  "workspace_id": "ws_def456",
  "message": "Workspace deleted successfully",
  "data_backup_available": false
}
```

## 🧠 Model Management API

### Available Models

#### GET `/api/models`
Get all available AI models.

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "model_id": "gemini-2.0-flash",
      "provider": "google",
      "display_name": "Gemini 2.0 Flash",
      "description": "Latest Gemini model with multimodal capabilities",
      "capabilities": ["text", "images", "audio", "code"],
      "max_tokens": 32768,
      "cost_per_1k_tokens": 0.075,
      "availability": "available",
      "quota_remaining": 1250000,
      "performance_tier": "high",
      "response_time_avg": "1.2s"
    },
    {
      "model_id": "gpt-4o",
      "provider": "openai", 
      "display_name": "GPT-4o",
      "description": "OpenAI's flagship multimodal model",
      "capabilities": ["text", "images", "code", "audio"],
      "max_tokens": 32768,
      "cost_per_1k_tokens": 2.50,
      "availability": "available",
      "quota_remaining": 500000,
      "performance_tier": "premium",
      "response_time_avg": "2.1s"
    }
  ],
  "routing_preferences": {
    "primary": "gemini-2.0-flash",
    "fallback": ["gemini-1.5-pro", "gpt-4o"],
    "cost_optimization": true
  }
}
```

### Model Routing

#### POST `/api/models/route`
Route a request to the optimal model.

**Request Body:**
```json
{
  "message": "Analyze this image and explain what you see",
  "attachments": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg",
      "mime_type": "image/jpeg"
    }
  ],
  "capabilities_required": ["vision", "analysis"],
  "user_preferences": {
    "cost_preference": "balanced",
    "speed_preference": "fast"
  },
  "context": {
    "conversation_id": "conv_123",
    "user_expertise": "intermediate"
  }
}
```

**Response:**
```json
{
  "success": true,
  "model_selected": "gemini-2.0-flash",
  "selection_reason": "Optimal for vision + analysis with cost efficiency",
  "response": "I can see this image shows a modern office workspace with...",
  "confidence_score": 0.94,
  "processing_time": "1.8s",
  "tokens_used": 156,
  "cost": 0.012,
  "alternative_models": [
    {
      "model": "gpt-4o",
      "estimated_cost": 0.39,
      "estimated_time": "2.5s"
    }
  ]
}
```

#### GET `/api/models/usage`
Get model usage statistics.

**Query Parameters:**
- `period` (optional): `day`, `week`, `month` (default: day)
- `model` (optional): Specific model filter

**Response:**
```json
{
  "success": true,
  "period": "day",
  "usage_stats": [
    {
      "model": "gemini-2.0-flash",
      "requests": 245,
      "total_tokens": 125430,
      "total_cost": 9.41,
      "avg_response_time": "1.2s",
      "error_rate": 0.008
    }
  ],
  "total_cost": 15.67,
  "total_requests": 389,
  "cost_savings": 23.45,
  "quota_usage": {
    "gemini_api": {
      "used": 750000,
      "limit": 2000000,
      "percentage": 37.5
    }
  }
}
```

## 🏥 Health & Monitoring API

### System Health

#### GET `/api/test-connection`
Test backend connectivity.

**Response:**
```json
{
  "status": "connected",
  "message": "Backend connection successful",
  "service": "podplay-sanctuary",
  "backend_running": true,
  "version": "2.0.0",
  "features": [
    "mcp-marketplace",
    "mama-bear-chat",
    "vertex-garden", 
    "scout-agent",
    "socket-io"
  ],
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### GET `/api/health`
Comprehensive system health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-06-02T22:30:45.123Z",
  "services": {
    "mama_bear": {
      "status": "healthy",
      "response_time": "0.8s",
      "memory_available": true,
      "model_router": "operational"
    },
    "mcp_marketplace": {
      "status": "healthy",
      "servers_online": 12,
      "servers_total": 15,
      "last_sync": "2024-06-02T22:25:00Z"
    },
    "database": {
      "status": "healthy",
      "connection_pool": "8/10",
      "query_avg_time": "15ms"
    },
    "model_providers": {
      "gemini_api": "healthy",
      "gemini_vertex": "healthy", 
      "openai": "healthy",
      "anthropic": "healthy"
    }
  },
  "metrics": {
    "uptime": "2d 4h 30m",
    "total_requests": 15420,
    "avg_response_time": "0.8s",
    "error_rate": 0.002,
    "active_connections": 45
  },
  "resource_usage": {
    "cpu_percent": 23.5,
    "memory_percent": 67.2,
    "disk_percent": 34.1
  }
}
```

#### GET `/api/health/{service_name}`
Check specific service health.

**Response:**
```json
{
  "service": "mama_bear",
  "status": "healthy",
  "details": {
    "agent_ready": true,
    "memory_service": "connected",
    "model_router": "operational",
    "last_request": "2024-06-02T22:29:30Z",
    "performance": {
      "avg_response_time": "1.2s",
      "requests_per_minute": 15,
      "error_rate": 0.001
    }
  }
}
```

## 🔄 WebSocket Events

### Connection Events

#### `connect`
Client establishes WebSocket connection.

**Server Response:**
```json
{
  "event": "connected",
  "data": {
    "status": "success",
    "message": "Connected to Podplay Sanctuary",
    "client_id": "sock_abc123",
    "timestamp": "2024-06-02T22:30:45.123Z",
    "services": {
      "mama_bear": true,
      "marketplace": true,
      "real_time_chat": true,
      "terminal_sessions": true
    }
  }
}
```

#### `disconnect`
Client disconnects from WebSocket.

**Server Response:**
```json
{
  "event": "disconnected", 
  "data": {
    "client_id": "sock_abc123",
    "reason": "client_disconnect",
    "timestamp": "2024-06-02T22:35:45.123Z"
  }
}
```

### Chat Events

#### `mama_bear_message` (Client → Server)
Send message to Mama Bear agent.

**Client Payload:**
```json
{
  "message": "Help me debug this React component",
  "user_id": "nathan_sanctuary",
  "session_id": "sess_12345",
  "context": {
    "error": "Cannot read property 'map' of undefined",
    "file": "src/components/ProjectList.tsx"
  }
}
```

#### `mama_bear_response` (Server → Client)
Receive response from Mama Bear agent.

**Server Payload:**
```json
{
  "success": true,
  "response": "This error typically occurs when trying to map over an undefined array...",
  "message_id": "msg_67890",
  "session_id": "sess_12345",
  "model_used": "gemini-2.0-flash",
  "timestamp": "2024-06-02T22:30:45.123Z",
  "suggestions": [
    "Add null check before mapping",
    "Initialize with empty array",
    "Use optional chaining"
  ]
}
```

#### `typing_indicator` (Client ↔ Server)
Show typing indicators.

**Payload:**
```json
{
  "user_id": "nathan_sanctuary",
  "session_id": "sess_12345",
  "typing": true
}
```

### MCP Events

#### `mcp_server_status` (Server → Client)
Real-time MCP server status updates.

**Server Payload:**
```json
{
  "servers": [
    {
      "name": "github-mcp",
      "status": "online",
      "last_check": "2024-06-02T22:30:00Z",
      "response_time": 120,
      "health_score": 0.98
    },
    {
      "name": "docker-mcp",
      "status": "offline",
      "last_check": "2024-06-02T22:29:45Z",
      "error_message": "Connection timeout"
    }
  ]
}
```

#### `mcp_installation_progress` (Server → Client)
MCP server installation progress.

**Server Payload:**
```json
{
  "installation_id": "inst_xyz789",
  "server_name": "postgres-mcp",
  "progress": 65,
  "current_step": "Configuring database connection",
  "estimated_remaining": "2m 30s"
}
```

### Workspace Events

#### `workspace_status` (Server → Client)
Development workspace status updates.

**Server Payload:**
```json
{
  "workspace_id": "ws_abc123",
  "status": "starting",
  "progress": 45,
  "current_step": "Installing packages",
  "logs": [
    "Installing nodejs...",
    "Installing git...",
    "Configuring environment..."
  ]
}
```

#### `terminal_output` (Server → Client)
Terminal session output.

**Server Payload:**
```json
{
  "session_id": "term_xyz789",
  "workspace_id": "ws_abc123",
  "output": "npm install completed successfully\n",
  "output_type": "stdout",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### `terminal_input` (Client → Server)
Send commands to terminal session.

**Client Payload:**
```json
{
  "session_id": "term_xyz789",
  "workspace_id": "ws_abc123",
  "command": "npm run dev"
}
```

### Scout Agent Events

#### `project_update` (Server → Client)
Scout project status updates.

**Server Payload:**
```json
{
  "project_id": "proj_abc123",
  "status": "building",
  "progress": 75,
  "current_step": "Running tests",
  "estimated_completion": "2024-06-02T22:45:00Z",
  "logs": [
    "✓ All tests passed",
    "Building production bundle...",
    "Optimizing assets..."
  ]
}
```

#### `deployment_status` (Server → Client)
Deployment progress updates.

**Server Payload:**
```json
{
  "deployment_id": "dep_ghi789",
  "project_id": "proj_abc123",
  "status": "deploying",
  "progress": 80,
  "url": "https://my-app-git-main.vercel.app",
  "logs": [
    "Building application...",
    "Deploying to Vercel...",
    "Configuring domains..."
  ]
}
```

### System Events

#### `system_alert` (Server → Client)
System-wide alerts and notifications.

**Server Payload:**
```json
{
  "alert_type": "warning",
  "message": "High memory usage detected",
  "details": {
    "memory_usage": 85.5,
    "affected_services": ["workspace_manager"],
    "recommended_action": "Consider stopping unused workspaces"
  },
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### `maintenance_mode` (Server → Client)
Maintenance mode notifications.

**Server Payload:**
```json
{
  "maintenance_active": true,
  "start_time": "2024-06-03T02:00:00Z",
  "estimated_duration": "30 minutes",
  "affected_services": ["mcp_marketplace", "workspaces"],
  "message": "Scheduled maintenance for system upgrades"
}
```

## ❌ Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message description",
  "error_code": "ERROR_CODE_CONSTANT",
  "details": {
    "field": "specific field that caused error",
    "received": "invalid value",
    "expected": "valid format description"
  },
  "request_id": "req_abc123",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict (e.g., duplicate name) |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |
| `503` | Service Unavailable | Service temporarily down |

### Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `INVALID_INPUT` | Request parameters are invalid | Check request format and required fields |
| `AUTHENTICATION_REQUIRED` | API token missing or invalid | Provide valid authentication |
| `INSUFFICIENT_QUOTA` | Model quota exceeded | Wait for quota reset or upgrade plan |
| `SERVICE_UNAVAILABLE` | Service temporarily down | Check service status, retry later |
| `RATE_LIMITED` | Too many requests | Reduce request frequency |
| `CONFIGURATION_ERROR` | Invalid configuration provided | Check configuration parameters |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | Verify resource ID |
| `WORKSPACE_LIMIT_EXCEEDED` | Maximum workspaces reached | Delete unused workspaces |
| `MCP_SERVER_OFFLINE` | MCP server not responding | Check server status, restart if needed |

### Error Examples

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "error_code": "INVALID_INPUT",
  "details": {
    "field": "message",
    "received": "",
    "expected": "Non-empty string"
  },
  "request_id": "req_abc123",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### Rate Limit Error
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "error_code": "RATE_LIMITED",
  "details": {
    "limit": 100,
    "window": "1 hour",
    "reset_at": "2024-06-02T23:30:45.123Z"
  },
  "request_id": "req_def456",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

#### Service Unavailable Error
```json
{
  "success": false,
  "error": "MCP marketplace service unavailable",
  "error_code": "SERVICE_UNAVAILABLE",
  "details": {
    "service": "mcp_marketplace",
    "status": "maintenance",
    "estimated_return": "2024-06-02T23:00:00Z"
  },
  "request_id": "req_ghi789",
  "timestamp": "2024-06-02T22:30:45.123Z"
}
```

## 🚦 Rate Limiting

### Default Limits

| Endpoint Category | Requests per Hour | Burst Limit |
|-------------------|-------------------|-------------|
| Chat API | 1,000 | 50/minute |
| MCP Marketplace | 500 | 25/minute |
| Workspaces | 100 | 10/minute |
| Health Checks | Unlimited | 100/minute |
| Model Routing | 2,000 | 100/minute |

### Rate Limit Headers

All responses include rate limiting information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1704151200
X-RateLimit-Window: 3600
```

### WebSocket Rate Limiting

WebSocket events are also rate limited:

| Event Type | Limit | Window |
|------------|-------|---------|
| Chat messages | 120/hour | 5/minute |
| Terminal commands | 300/hour | 10/minute |
| Status requests | 60/hour | 2/minute |

## ⚙️ Service Configuration

### Environment Variables

#### Core Configuration
```bash
# Application
SECRET_KEY=your-secret-key-here
LOG_LEVEL=INFO
DEBUG=False
PORT=5000

# Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://localhost:5000
```

#### AI Model Configuration
```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Google Gemini
GEMINI_API_KEY=your-gemini-key
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
PRIMARY_SERVICE_ACCOUNT_PROJECT_ID=your-gcp-project

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

#### Enhanced Services
```bash
# Mem0.ai (Persistent Memory)
MEM0_API_KEY=your-mem0-key
MEM0_USER_ID=your-user-id
MEM0_MEMORY_ENABLED=True

# Together.ai (Code Execution)
TOGETHER_AI_API_KEY=your-together-key
TOGETHER_AI_SANDBOX_ENABLED=True
```

#### Integration Services
```bash
# GitHub
GITHUB_PAT=your-github-token
GITHUB_CALLBACK_URL=/oauth/github/callback

# Docker
DOCKER_HOST=unix:///var/run/docker.sock

# NixOS
NIXOS_SANDBOX_BASE_IMAGE=./nixos_vms/base.qcow2
NIXOS_VM_DEFAULT_MEMORY_MB=1024
```

### Service Dependencies

#### Required Services
- **SQLite Database**: Local data storage
- **Python 3.12+**: Runtime environment
- **Node.js 20+**: Frontend build tools

#### Optional Services
- **Docker**: Container workspaces
- **Git**: Repository management
- **NixOS**: Reproducible environments

### Configuration Files

#### MCP Servers (`data/mcp_servers.json`)
```json
{
  "version": 1,
  "servers": [
    {
      "name": "custom-server",
      "type": "custom",
      "url": "http://localhost:8080",
      "description": "Custom MCP server",
      "category": "custom"
    }
  ]
}
```

#### AI Models (`data/models_catalog.json`)
```json
{
  "custom-model": {
    "provider": "custom",
    "displayName": "Custom Model",
    "description": "Custom AI model integration",
    "capabilities": ["text", "reasoning"]
  }
}
```

### Database Schema

The application uses SQLite with the following key tables:

#### `chat_sessions`
```sql
CREATE TABLE chat_sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  message_count INTEGER DEFAULT 0
);
```

#### `mcp_servers`
```sql
CREATE TABLE mcp_servers (
  name TEXT PRIMARY KEY,
  description TEXT,
  category TEXT,
  installation_status TEXT,
  last_health_check TIMESTAMP,
  configuration JSON
);
```

#### `workspaces`
```sql
CREATE TABLE workspaces (
  workspace_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'stopped',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  configuration JSON
);
```

---

## 📝 Usage Examples

### Complete Chat Integration

```javascript
// Initialize API client
import { PodPlayAPI } from '@podplay/api-client';

const api = new PodPlayAPI({
  baseURL: 'http://localhost:5000',
  apiKey: 'your-api-key'
});

// Send chat message
const response = await api.chat.sendMessage({
  message: "Help me build a React component",
  user_id: "nathan_sanctuary",
  context: {
    framework: "react",
    language: "typescript"
  }
});

console.log(response.response);
```

### WebSocket Integration

```javascript
// Connect to WebSocket
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-api-key' }
});

// Listen for responses
socket.on('mama_bear_response', (data) => {
  console.log('AI Response:', data.response);
});

// Send message
socket.emit('mama_bear_message', {
  message: "Explain async/await in JavaScript",
  user_id: "nathan_sanctuary"
});
```

### MCP Server Management

```javascript
// Search for servers
const servers = await api.mcp.search({
  query: "database",
  category: "database",
  limit: 10
});

// Install server
const installation = await api.mcp.install({
  server_name: "postgres-mcp",
  configuration: {
    host: "localhost",
    port: 5432,
    database: "myapp"
  }
});

// Execute tool
const result = await api.mcp.execute('postgres-mcp', {
  tool_name: "query",
  parameters: {
    sql: "SELECT * FROM users LIMIT 10"
  }
});
```

This comprehensive API reference provides everything developers need to integrate with and extend the PodPlay Sanctuary Agent Framework. All endpoints include detailed examples, error handling, and real-world usage patterns.