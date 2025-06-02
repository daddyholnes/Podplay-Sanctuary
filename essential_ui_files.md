# Essential Podplay UI Files for Export

## UI Foundation Core Files

These files from your `ui-foundation` folder contain all the main UI pages:

1. **`mama-bear-main-chat.tsx`** - Main chat interface with purple gradient styling
2. **`scout-dev-workspaces.tsx`** - Development workspace UI
3. **`scout-mcp-marketplace (1).tsx`** - MCP tools marketplace
4. **`scout-multimodal-chat (1).tsx`** - Multimodal chat interface
5. **`scout-miniapps-hub.tsx`** - Mini applications hub
6. **`integration_workbench_frontend.tsx`** - Integration testing workbench
7. **`scout-workspace-layout (1).tsx`** - Workspace layout system

## Backend Connection Instructions

### Socket Connection Setup

The UI components connect to the backend using this pattern:

```typescript
// Add to the top of each component
import io from 'socket.io-client';

// Connection function
const connectToBackend = () => {
  const socket = io('http://localhost:5000', {
    transports: ['websocket'],
    path: '/socket.io',
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  // Listen for connection events
  socket.on('connect', () => {
    console.log('Connected to backend socket');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from backend socket');
  });
  
  return socket;
};
```

### REST API Connection

For HTTP requests, add this to each component:

```typescript
// API service setup
const API_BASE_URL = 'http://localhost:5000/api';

const fetchFromBackend = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

## Backend Endpoints for Each UI Component

1. **Main Chat (mama-bear-main-chat.tsx)**
   - Fetch messages: `GET /api/chat/messages`
   - Send message: `POST /api/chat/messages`
   - Socket events: `message:new`, `message:typing`

2. **Dev Workspaces (scout-dev-workspaces.tsx)**
   - List files: `GET /api/workspaces/files`
   - Create file: `POST /api/workspaces/files`
   - Update file: `PUT /api/workspaces/files/{id}`
   - Socket events: `file:created`, `file:updated`

3. **MCP Marketplace (scout-mcp-marketplace)**
   - List tools: `GET /api/mcp/tools`
   - Get tool details: `GET /api/mcp/tools/{id}`
   - Run tool: `POST /api/mcp/tools/{id}/run`

4. **Multimodal Chat (scout-multimodal-chat)**
   - Send text: `POST /api/chat/messages`
   - Upload file: `POST /api/chat/attachments`
   - Send audio: `POST /api/chat/audio`
   - Socket events: `message:new`, `file:uploaded`

5. **Mini Apps Hub (scout-miniapps-hub.tsx)**
   - List apps: `GET /api/miniapps`
   - Launch app: `POST /api/miniapps/{id}/launch`
   - Close app: `POST /api/miniapps/{id}/close`

6. **Integration Workbench (integration_workbench_frontend.tsx)**
   - Test connection: `GET /api/integration/status`
   - Run test: `POST /api/integration/test`
   - Get results: `GET /api/integration/results`

7. **Workspace Layout (scout-workspace-layout)**
   - Save layout: `POST /api/layouts`
   - Load layout: `GET /api/layouts/{id}`
   - Socket events: `layout:updated`, `window:moved`

## Purple Theme Integration

The purple gradients and UI theme are defined in these CSS snippets to include:

```css
/* Purple theme variables */
:root {
  --purple-light: #c9a2ff;
  --purple-main: #9a56ff;
  --purple-dark: #7638dc;
  --purple-gradient: linear-gradient(135deg, var(--purple-light) 0%, var(--purple-dark) 100%);
}

/* Button styling */
.button-purple {
  background: var(--purple-gradient);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.button-purple:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(154, 86, 255, 0.4);
}

/* Chat message bubbles */
.message-bubble.agent {
  background: var(--purple-gradient);
  border-radius: 12px 12px 0 12px;
  color: white;
}

/* Window headers */
.window-header {
  background: var(--purple-gradient);
  color: white;
  padding: 0.5rem;
  border-radius: 8px 8px 0 0;
  cursor: move;
}
```

## Implementation Steps

1. Copy all files from the `ui-foundation` folder
2. Create each component with backend connections as specified above
3. Add the purple theme CSS to a common stylesheet
4. Connect WebSocket handlers in each component
5. Implement API calls for data fetching and submission

This compact setup provides everything needed to recreate the Podplay UI with proper backend connections while maintaining the purple-themed aesthetic and agent architecture.
