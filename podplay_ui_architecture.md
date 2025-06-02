# Podplay Sanctuary UI Architecture

## Core UI Files & Backend Connections

This document outlines the essential UI components of Podplay Sanctuary, their relationships, and how they connect to the backend services to create your digital sanctuary.

## 1. Core Application Structure

### Main Application Entry Points

| File | Purpose | Key Features |
|------|---------|-------------|
| `/frontend/src/App.tsx` | Main application component | Routing, agent registration, window system initialization |
| `/frontend/src/components/layout/AppLayout.tsx` | Main layout structure | Side navigation, theme toggle, content area |
| `/frontend/src/components/layout/SideNavigation.tsx` | Navigation sidebar | Agent navigation links, purple-themed icons |

### Context Providers

| File | Purpose | Backend Connection |
|------|---------|-------------------|
| `/frontend/src/contexts/ThemeContext.tsx` | Manages dark/light theme | Local storage persistence |
| `/frontend/src/contexts/SocketContext.tsx` | WebSocket connection | Connects to Flask Socket.IO on port 5000 |
| `/frontend/src/contexts/ChatSessionContext.tsx` | Chat state management | `/api/chat/sessions` and `/api/chat/messages` endpoints |

## 2. Agent Components

### Mama Bear (Lead Agent)

| File | Purpose | Backend Connection |
|------|---------|-------------------|
| `/frontend/src/enhanced/mama-bear-agents/MamaBearMainChat.tsx` | Primary chat interface | WebSockets for real-time chat, `/api/agents/mama-bear` endpoints |
| `/frontend/src/enhanced/mama-bear-agents/MamaBearScout.tsx` | Scout coordination | Connects to Scout agent endpoints |
| `/frontend/src/enhanced/mama-bear-agents/MamaBearDevWorkspace.tsx` | Dev environment | File/workspace management endpoints |
| `/frontend/src/enhanced/mama-bear-agents/MamaBearMCP.tsx` | MCP integration | MCP tool connection APIs |
| `/frontend/src/enhanced/mama-bear-agents/MamaBearIntegrationWorkbench.tsx` | Integration testing | `/api/integration` endpoints |

### Mama Bear Main Chat Components

| File | Purpose | UI Elements |
|------|---------|------------|
| `/frontend/src/enhanced/mama-bear-main-chat/components/ChatHeader.tsx` | Chat header | Title, session info, purple gradient |
| `/frontend/src/enhanced/mama-bear-main-chat/components/ChatSidebar.tsx` | Session management | Session list, purple accents |
| `/frontend/src/enhanced/mama-bear-main-chat/components/MessageList.tsx` | Message display | Message bubbles, code blocks, markdown |
| `/frontend/src/enhanced/mama-bear-main-chat/components/MultiModalInput.tsx` | Input interface | Text area, file upload, audio/video recording |
| `/frontend/src/enhanced/mama-bear-main-chat/components/WebBrowserPanel.tsx` | Integrated browser | Internal web browser for research |

### Scout Agent Components

| File | Purpose | Backend Connection |
|------|---------|-------------------|
| `/frontend/src/enhanced/scout-agents/ScoutChatWindow.tsx` | Scout chat | Scout agent WebSockets and REST endpoints |
| `/frontend/src/enhanced/scout-dev-workspaces/ScoutDevWorkspaces.tsx` | Workspace management | File system and dev environment APIs |
| `/frontend/src/enhanced/scout-mcp-marketplace/ScoutMcpMarketplace.tsx` | MCP tools | MCP tool registry endpoints |
| `/frontend/src/enhanced/scout-multimodal-chat/ScoutMultiModalChat.tsx` | Multimodal chat | File upload, audio processing endpoints |
| `/frontend/src/enhanced/scout-mini-apps/ScoutMiniAppsHub.tsx` | Mini applications | Mini-app registry and loading APIs |

## 3. Window Management System

The window system allows for dynamic, draggable panels with the purple-themed UI:

| File | Purpose | Key Features |
|------|---------|-------------|
| `/frontend/src/enhanced/window-management/WindowContext.tsx` | Window state management | Context provider, window registry |
| `/frontend/src/enhanced/window-management/Window.tsx` | Window component | Draggable, resizable panels with purple headers |
| `/frontend/src/enhanced/window-management/WindowManager.tsx` | Window coordination | Arranges, saves, and loads window layouts |
| `/frontend/src/enhanced/window-management/WindowRegistry.tsx` | Component registry | Dynamic component loading system |
| `/frontend/src/enhanced/window-management/WindowSocketSync.tsx` | Backend sync | Syncs window state via WebSockets |

## 4. Key UI Elements and Design Files

### Purple Theme and UI Components

The purple gradients and UI components are defined in:

| File | Purpose | Key Elements |
|------|---------|-------------|
| `/frontend/src/enhanced/mama-bear-main-chat/MamaBearMainChat.css` | Main chat styling | Purple gradient chat bubbles, animations |
| `/frontend/tailwind.config.js` | Tailwind configuration | Custom purple color palette |
| `/frontend/src/styles/global.css` | Global styling | Base color scheme, dark/light theme variables |

## 5. Backend Connections

### Socket Services

| File | Purpose | Backend Endpoint |
|------|---------|------------------|
| `/frontend/src/services/socketService.ts` | Main socket connection | `http://localhost:5000` (Socket.IO) |
| `/frontend/src/services/agentSocketService.ts` | Agent-specific sockets | `/socket.io/agents` namespace |
| `/frontend/src/services/workspaceSocketService.ts` | Workspace sync | `/socket.io/workspaces` namespace |

### API Services

| File | Purpose | Backend Endpoints |
|------|---------|-------------------|
| `/frontend/src/services/api.ts` | Base API setup | Axios instance, error handling, authentication |
| `/frontend/src/services/chatApi.ts` | Chat endpoints | `/api/chat/*` routes |
| `/frontend/src/services/agentApi.ts` | Agent management | `/api/agents/*` routes |
| `/frontend/src/services/workspaceApi.ts` | Workspace endpoints | `/api/workspaces/*` routes |
| `/frontend/src/services/realtimeChatService.ts` | Real-time chat | Combines WebSockets with REST endpoints |

## 6. Integration Architecture

### Agent Window Bridge

| File | Purpose | Backend Integration |
|------|---------|---------------------|
| `/frontend/src/enhanced/agent-integration/AgentWindowBridge.tsx` | Multi-agent coordination | Enables Mama Bear and Scout agents to communicate |

## 7. Backend Routes and Key Endpoints

Key Flask Blueprint routes that the UI connects to:

```
/api/chat/sessions
/api/chat/messages
/api/agents/mama-bear
/api/agents/scout
/api/workspaces
/api/integration
/api/resources
/api/mcp
```

## 8. Resource Monitoring

| File | Purpose | Backend Connection |
|------|---------|-------------------|
| `/frontend/src/enhanced/scout-dev-workspaces/components/ResourceMonitor.tsx` | System monitoring | `/api/system/resources` endpoint |

## 9. Custom UI Elements with Purple Theme

The purple theme is consistently applied across:

1. Window headers with purple gradients
2. Buttons with purple hover effects
3. Input fields with purple focus states
4. Message bubbles with purple gradient backgrounds
5. Navigation items with purple selection indicators

## 10. Workflow Engine

| File | Purpose | Backend Connection |
|------|---------|-------------------|
| `/frontend/src/enhanced/scout-workflow-engine/ScoutWorkflowEngine.tsx` | Workflow management | Workflow state endpoints |
| `/frontend/src/enhanced/scout-workflow-engine/components/StageTimeline.tsx` | Progress visualization | Timeline update WebSockets |

## Connection Diagram

```
Frontend (React/TypeScript)
    │
    ├── HTTP/REST API ─────► Backend Flask API (/api/*)
    │                            │
    ├── WebSockets ──────────► Socket.IO Server
    │                            │
    └── File Operations ─────► File System API
                                │
                                ▼
                           Database (SQLite)
```

## Further Development

For a full UI overhaul while preserving the purple theme and agent architecture:

1. Focus on the files in `/enhanced/*` directories first
2. Maintain the purple gradients in all component styling
3. Preserve the Mama Bear and Scout agent relationship
4. Keep the window management system for draggable panels
5. Ensure WebSocket connections remain intact for real-time features
