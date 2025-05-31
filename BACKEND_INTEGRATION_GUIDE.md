# 🐻 Podplay Sanctuary - Backend Integration Guide

> **Complete API documentation, integration patterns, and troubleshooting guide for seamless frontend-backend connectivity**

## 📖 Table of Contents

1. [Quick Start](#-quick-start)
2. [API Endpoints Reference](#-api-endpoints-reference)
3. [WebSocket Integration](#-websocket-integration)
4. [Authentication & Security](#-authentication--security)
5. [Environment Configuration](#-environment-configuration)
6. [Error Handling Patterns](#-error-handling-patterns)
7. [Integration Examples](#-integration-examples)
8. [Troubleshooting Guide](#-troubleshooting-guide)
9. [Performance Optimization](#-performance-optimization)
10. [Testing & Validation](#-testing--validation)

---

## 🚀 Quick Start

### Server Information
- **Backend URL**: `http://localhost:5000`
- **WebSocket URL**: `ws://localhost:5000/socket.io/`
- **API Version**: `v1`
- **Protocol**: HTTP/1.1, WebSocket

### Prerequisites
```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Configure environment variables
cp .env.production.template .env.local
# Add your API keys to .env.local

# 3. Start the backend server
python app.py
```

### Frontend Integration
```typescript
// Basic connection setup
const API_BASE_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Socket.IO connection
import { io } from 'socket.io-client';
const socket = io(SOCKET_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  timeout: 20000
});
```

---

## 🔗 API Endpoints Reference

### Health & Status Endpoints

#### `GET /` - Root Health Check
```typescript
// Simple connectivity test
const response = await fetch(`${API_BASE_URL}/`);
const data = await response.json();
// Response: { status: "success", message: "Podplay Sanctuary Backend is running", timestamp: "..." }
```

#### `GET /health` - Basic Health Check
```typescript
const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', backend_running: false };
  }
};

// Response Format:
// {
//   "status": "healthy",
//   "backend_running": true,
//   "timestamp": "2024-01-01T12:00:00.000000",
//   "uptime": 3600.5,
//   "services": {
//     "database": "operational",
//     "mama_bear_agent": "running",
//     "marketplace_manager": "running"
//   }
// }
```

#### `GET /health/detailed` - Comprehensive Health Status
```typescript
const detailedHealth = await fetch(`${API_BASE_URL}/health/detailed`);
const healthData = await detailedHealth.json();

// Response includes:
// - Service status for all components
// - Database connection status
// - AI model availability
// - System resource usage
// - Performance metrics
```

### Chat & AI Endpoints

#### `POST /api/chat/mama-bear` - Primary Chat Endpoint
```typescript
interface ChatRequest {
  message: string;
  user_id?: string;
  session_id?: string;
  context?: any;
}

interface ChatResponse {
  success: boolean;
  response: string;
  session_id: string;
  user_id: string;
  timestamp: string;
  metadata?: {
    model_used?: string;
    processing_time?: number;
    tokens_used?: number;
  };
  error?: string;
}

const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/mama-bear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: 'nathan',
        session_id: generateSessionId(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Chat request failed:', error);
    throw error;
  }
};
```

#### `POST /api/chat/vertex-garden/chat` - Direct Vertex AI Chat
```typescript
// Same interface as mama-bear but routes directly to Vertex AI
const vertexChat = await fetch(`${API_BASE_URL}/api/chat/vertex-garden/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "Hello, Vertex AI!" })
});
```

#### `GET /api/chat/sessions` - List Chat Sessions
```typescript
const getSessions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/chat/sessions`);
  return await response.json();
};

// Response: Array of session objects with metadata
```

#### `POST /api/chat/sessions` - Create New Chat Session
```typescript
const createSession = async (sessionData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  return await response.json();
};
```

### Scout Agent Endpoints

#### `GET /api/v1/scout_agent/projects` - List All Projects
```typescript
interface Project {
  name: string;
  status: 'active' | 'inactive' | 'building' | 'error';
  last_updated: string;
  health_score: number;
  dependencies: string[];
}

const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/scout_agent/projects`);
  return await response.json();
};
```

#### `GET /api/v1/scout_agent/projects/{project_name}/status` - Project Status
```typescript
interface ProjectStatus {
  name: string;
  status: 'active' | 'inactive' | 'building' | 'error';
  last_updated: string;
  health_score: number;
  git: {
    branch: string;
    last_commit: string;
    dirty: boolean;
  };
  dependencies: {
    installed: number;
    total: number;
    outdated: string[];
  };
  build: {
    last_build: string;
    success: boolean;
    errors: string[];
  };
  performance: {
    build_time: number;
    memory_usage: number;
    cpu_usage: number;
  };
}

const getProjectStatus = async (projectName: string): Promise<ProjectStatus> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/scout_agent/projects/${projectName}/status`);
  return await response.json();
};
```

#### `GET /api/v1/scout_agent/system/metrics` - System Metrics
```typescript
const getSystemMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/scout_agent/system/metrics`);
  return await response.json();
};

// Response includes CPU, memory, disk usage, network stats
```

### MCP Marketplace Endpoints

#### `GET /api/mcp/servers` - List Available MCP Servers
```typescript
interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  download_count: number;
  rating: number;
  last_updated: string;
  repository_url: string;
  documentation_url: string;
}

const getMCPServers = async (): Promise<MCPServer[]> => {
  const response = await fetch(`${API_BASE_URL}/api/mcp/servers`);
  return await response.json();
};
```

#### `POST /api/mcp/servers/{server_name}/install` - Install MCP Server
```typescript
const installMCPServer = async (serverName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverName}/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
};
```

### Development Tools Endpoints

#### `GET /api/dev/ping` - Simple Connectivity Test
```typescript
const ping = async () => {
  const response = await fetch(`${API_BASE_URL}/api/dev/ping`);
  return await response.json();
};
// Response: { status: "pong", timestamp: "...", service: "podplay-sanctuary", version: "2.0.0" }
```

#### `POST /api/dev/echo` - Echo Test for Request Validation
```typescript
const echoTest = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/dev/echo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await response.json();
};
```

---

## 🔌 WebSocket Integration

### Connection Setup
```typescript
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(): void {
    this.socket = io('http://localhost:5000', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to backend');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from backend:', reason);
      this.isConnected = false;
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 Backend connection confirmed:', data);
    });

    // Error handling
    this.socket.on('connect_error', (error) => {
      console.error('🚨 Connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('🚨 Socket error:', error);
    });
  }

  // Send a test event
  sendTestEvent(data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('test_event', data);
    }
  }

  // Listen for test responses
  onTestResponse(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('test_response', callback);
    }
  }
}

export const socketService = new SocketService();
```

### Real-time Chat Integration
```typescript
class ChatSocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupChatHandlers();
  }

  private setupChatHandlers(): void {
    // Handle real-time chat responses
    this.socket.on('mama_bear_response', (data) => {
      console.log('💬 Mama Bear response:', data);
      this.onChatResponse(data);
    });

    // Handle chat errors
    this.socket.on('chat_error', (error) => {
      console.error('💬 Chat error:', error);
      this.onChatError(error);
    });
  }

  // Send real-time chat message
  sendMessage(message: string, sessionId: string = 'default'): void {
    this.socket.emit('mama_bear_chat', {
      message,
      session_id: sessionId,
      user_id: 'nathan',
      timestamp: new Date().toISOString()
    });
  }

  // Chat response handler (to be implemented by consumer)
  private onChatResponse(data: any): void {
    // Emit to state management or component
  }

  private onChatError(error: any): void {
    // Handle chat errors
  }
}
```

### Terminal Session Management
```typescript
class TerminalSocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupTerminalHandlers();
  }

  private setupTerminalHandlers(): void {
    this.socket.on('terminal_joined', (data) => {
      console.log('🖥️ Joined terminal session:', data);
    });

    this.socket.on('terminal_output', (data) => {
      console.log('🖥️ Terminal output:', data);
    });

    this.socket.on('terminal_left', (data) => {
      console.log('🖥️ Left terminal session:', data);
    });
  }

  // Join a terminal session
  joinTerminal(sessionId: string): void {
    this.socket.emit('join_terminal', { session_id: sessionId });
  }

  // Send command to terminal
  sendCommand(sessionId: string, command: string): void {
    this.socket.emit('terminal_input', {
      session_id: sessionId,
      command,
      timestamp: new Date().toISOString()
    });
  }

  // Leave terminal session
  leaveTerminal(sessionId: string): void {
    this.socket.emit('leave_terminal', { session_id: sessionId });
  }
}
```

### Workspace Subscription
```typescript
class WorkspaceSocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupWorkspaceHandlers();
  }

  private setupWorkspaceHandlers(): void {
    this.socket.on('workspace_subscribed', (data) => {
      console.log('🏗️ Subscribed to workspace:', data);
    });

    this.socket.on('workspace_update', (data) => {
      console.log('🏗️ Workspace update:', data);
    });
  }

  // Subscribe to workspace updates
  subscribeToWorkspace(workspaceId: string): void {
    this.socket.emit('workspace_subscribe', { workspace_id: workspaceId });
  }

  // Unsubscribe from workspace
  unsubscribeFromWorkspace(workspaceId: string): void {
    this.socket.emit('workspace_unsubscribe', { workspace_id: workspaceId });
  }
}
```

---

## 🔐 Authentication & Security

### CORS Configuration
The backend is configured with the following CORS settings:
```python
# Backend CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        "expose_headers": ["Content-Type", "X-Total-Count"],
        "supports_credentials": True,
        "max_age": 600
    }
})
```

### Request Headers
```typescript
// Standard headers for API requests
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// For authenticated requests (when authentication is implemented)
const authenticatedHeaders = {
  ...defaultHeaders,
  'Authorization': `Bearer ${authToken}`
};
```

### Error Response Format
```typescript
interface APIError {
  success: false;
  error: string;
  message?: string;
  timestamp?: string;
  details?: any;
}

// Handle API errors consistently
const handleAPIError = (error: any): APIError => {
  if (error.response?.data) {
    return error.response.data;
  }
  return {
    success: false,
    error: 'Network error',
    message: error.message
  };
};
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

#### Backend (.env.local)
```bash
# Core Configuration
SECRET_KEY=your-super-secret-key-minimum-32-characters
FLASK_ENV=development
DEBUG=true

# Database
DATABASE_URL=sqlite:///sanctuary.db

# API Keys
GEMINI_API_KEY=your-gemini-api-key-here
TOGETHER_API_KEY=your-together-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
OPENAI_API_KEY=your-openai-api-key-here

# Google Cloud (Optional)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
VERTEX_AI_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# Mem0 Integration
MEM0_API_KEY=your-mem0-api-key
MEM0_USER_ID=nathan_sanctuary

# Socket.IO Configuration
SOCKETIO_ASYNC_MODE=threading
SOCKETIO_PING_TIMEOUT=60
SOCKETIO_PING_INTERVAL=25

# Logging
LOG_LEVEL=INFO
LOG_FILE=mama_bear.log

# Feature Flags
MCP_DISCOVERY_ENABLED=true
NIXOS_INFRASTRUCTURE_ENABLED=false
```

#### Frontend (.env.local)
```bash
# Gemini API Key (for direct frontend integration)
GEMINI_API_KEY=your-gemini-api-key-here

# API Endpoints
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_SOCKET_LOGS=true
```

### Configuration Loading Pattern
```typescript
// config.ts
export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
    socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
    timeout: 30000,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  },
  debug: {
    enabled: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    socketLogs: import.meta.env.VITE_ENABLE_SOCKET_LOGS === 'true',
  }
};
```

---

## 🚨 Error Handling Patterns

### API Error Handling
```typescript
class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      
      if (data.success === false) {
        throw new APIError(data.error || data.message || 'API request failed', response.status, data);
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors
      throw new APIError(
        `Network error: ${error.message}`,
        0,
        { originalError: error }
      );
    }
  }
}

class APIError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 0, details?: any) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }

  isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}
```

### Socket.IO Error Handling
```typescript
class SocketErrorHandler {
  static setupErrorHandling(socket: Socket): void {
    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this.handleConnectionError(error);
    });

    socket.on('error', (error) => {
      console.error('🔌 Socket error:', error);
      this.handleSocketError(error);
    });

    socket.on('disconnect', (reason, details) => {
      console.warn('🔌 Socket disconnected:', reason, details);
      this.handleDisconnection(reason, details);
    });
  }

  private static handleConnectionError(error: any): void {
    // Implement retry logic or user notification
    if (error.message.includes('timeout')) {
      // Handle timeout specifically
    } else if (error.message.includes('refused')) {
      // Handle connection refused
    }
  }

  private static handleSocketError(error: any): void {
    // Log error and optionally notify user
  }

  private static handleDisconnection(reason: string, details?: any): void {
    if (reason === 'io server disconnect') {
      // Server initiated disconnect - don't auto-reconnect
    } else {
      // Client side disconnect - socket.io will auto-reconnect
    }
  }
}
```

### Chat Error Handling
```typescript
interface ChatError {
  type: 'network' | 'api_key' | 'quota' | 'server' | 'validation';
  message: string;
  details?: any;
  canRetry: boolean;
}

class ChatErrorHandler {
  static handleChatError(error: any): ChatError {
    // Handle Gemini API key errors
    if (error.message?.toLowerCase().includes('api key not valid')) {
      return {
        type: 'api_key',
        message: 'Invalid Gemini API key. Please check your configuration.',
        canRetry: false,
        details: { 
          solution: 'Update GEMINI_API_KEY in .env.local',
          docsUrl: 'https://aistudio.google.com/app/apikey'
        }
      };
    }

    // Handle quota errors
    if (error.message?.toLowerCase().includes('quota')) {
      return {
        type: 'quota',
        message: 'API quota exceeded. Please try again later.',
        canRetry: true,
        details: { retryAfter: 3600000 } // 1 hour
      };
    }

    // Handle network errors
    if (error.statusCode === 0 || !error.statusCode) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        canRetry: true
      };
    }

    // Handle server errors
    if (error.statusCode >= 500) {
      return {
        type: 'server',
        message: 'Server error occurred. Please try again later.',
        canRetry: true
      };
    }

    // Default error
    return {
      type: 'server',
      message: error.message || 'An unexpected error occurred.',
      canRetry: true
    };
  }
}
```

---

## 🔧 Integration Examples

### Complete Chat Integration
```typescript
// services/ChatService.ts
import { APIClient } from './APIClient';
import { SocketService } from './SocketService';
import { ChatErrorHandler } from './ChatErrorHandler';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

class ChatService {
  private apiClient: APIClient;
  private socketService: SocketService;
  private messages: ChatMessage[] = [];
  private isConnected: boolean = false;

  constructor() {
    this.apiClient = new APIClient('http://localhost:5000');
    this.socketService = new SocketService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.socketService.on('connected', () => {
      this.isConnected = true;
    });

    this.socketService.on('mama_bear_response', (data) => {
      this.handleBotResponse(data);
    });

    this.socketService.on('chat_error', (error) => {
      this.handleChatError(error);
    });
  }

  async sendMessage(content: string): Promise<ChatMessage> {
    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: this.generateId(),
        content,
        sender: 'user',
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      this.notifyMessageUpdate();

      // Send via socket for real-time response if connected
      if (this.isConnected) {
        this.socketService.emit('mama_bear_chat', {
          message: content,
          session_id: this.getSessionId(),
          user_id: 'nathan'
        });
      } else {
        // Fallback to HTTP API
        const response = await this.apiClient.request('/api/chat/mama-bear', {
          method: 'POST',
          body: JSON.stringify({
            message: content,
            user_id: 'nathan',
            session_id: this.getSessionId()
          })
        });

        this.handleBotResponse(response);
      }

      return userMessage;
    } catch (error) {
      const chatError = ChatErrorHandler.handleChatError(error);
      this.handleChatError(chatError);
      throw chatError;
    }
  }

  private handleBotResponse(data: any): void {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      content: data.message || data.response,
      sender: 'assistant',
      timestamp: new Date(),
      metadata: data.metadata
    };

    this.messages.push(botMessage);
    this.notifyMessageUpdate();
  }

  private handleChatError(error: any): void {
    // Add error message to chat
    const errorMessage: ChatMessage = {
      id: this.generateId(),
      content: `Error: ${error.message}`,
      sender: 'assistant',
      timestamp: new Date(),
      metadata: { isError: true, error }
    };

    this.messages.push(errorMessage);
    this.notifyMessageUpdate();
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSessionId(): string {
    // Get or create session ID
    return localStorage.getItem('chat_session_id') || this.createSessionId();
  }

  private createSessionId(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
    return sessionId;
  }

  private notifyMessageUpdate(): void {
    // Emit event for components to listen to
    window.dispatchEvent(new CustomEvent('chat_messages_updated', {
      detail: { messages: this.messages }
    }));
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clearMessages(): void {
    this.messages = [];
    this.notifyMessageUpdate();
  }
}

export const chatService = new ChatService();
```

### React Hook Integration
```typescript
// hooks/useChat.ts
import { useState, useEffect } from 'react';
import { chatService } from '../services/ChatService';

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearChat: () => void;
}

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for message updates
    const handleMessagesUpdate = (event: CustomEvent) => {
      setMessages(event.detail.messages);
    };

    window.addEventListener('chat_messages_updated', handleMessagesUpdate);
    
    // Load initial messages
    setMessages(chatService.getMessages());

    return () => {
      window.removeEventListener('chat_messages_updated', handleMessagesUpdate);
    };
  }, []);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await chatService.sendMessage(content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = (): void => {
    chatService.clearMessages();
    setError(null);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat
  };
};
```

### Health Check Service
```typescript
// services/HealthService.ts
interface HealthStatus {
  backend_running: boolean;
  status: 'healthy' | 'degraded' | 'error';
  services: Record<string, boolean>;
  last_check: Date;
}

class HealthService {
  private apiClient: APIClient;
  private healthStatus: HealthStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.apiClient = new APIClient('http://localhost:5000');
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      const response = await this.apiClient.request('/health');
      
      this.healthStatus = {
        backend_running: true,
        status: response.status === 'healthy' ? 'healthy' : 'degraded',
        services: response.services || {},
        last_check: new Date()
      };

      this.notifyHealthUpdate();
      return this.healthStatus;
    } catch (error) {
      this.healthStatus = {
        backend_running: false,
        status: 'error',
        services: {},
        last_check: new Date()
      };

      this.notifyHealthUpdate();
      throw error;
    }
  }

  startHealthMonitoring(intervalMs: number = 30000): void {
    this.stopHealthMonitoring();
    
    this.checkInterval = setInterval(() => {
      this.checkHealth().catch(error => {
        console.error('Health check failed:', error);
      });
    }, intervalMs);

    // Initial check
    this.checkHealth();
  }

  stopHealthMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getCurrentHealth(): HealthStatus | null {
    return this.healthStatus;
  }

  private notifyHealthUpdate(): void {
    window.dispatchEvent(new CustomEvent('health_status_updated', {
      detail: { health: this.healthStatus }
    }));
  }
}

export const healthService = new HealthService();
```

---

## 🐛 Troubleshooting Guide

### Common Issues & Solutions

#### 1. **Backend Connection Failed (CORS Errors)**

**Problem**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solutions**:
```bash
# 1. Ensure backend is running
cd backend
python app.py

# 2. Check backend CORS configuration
# Verify frontend URL is in CORS_ORIGINS

# 3. Check frontend URL configuration
# Ensure API_BASE_URL matches backend host:port
```

**Debug Commands**:
```typescript
// Test backend connectivity
const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    console.log('Backend status:', await response.json());
  } catch (error) {
    console.error('Backend unreachable:', error);
  }
};
```

#### 2. **Socket.IO Connection Failed**

**Problem**: `WebSocket connection failed` or `Socket.IO timeout`

**Solutions**:
```typescript
// 1. Check Socket.IO configuration
const socket = io('http://localhost:5000', {
  path: '/socket.io/',           // Ensure correct path
  transports: ['websocket', 'polling'], // Allow polling fallback
  timeout: 20000,                // Increase timeout
  forceNew: true                 // Force new connection
});

// 2. Test connection manually
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
  socket.emit('test_event', { message: 'Hello from frontend' });
});

socket.on('test_response', (data) => {
  console.log('📡 Test response:', data);
});
```

**Backend Socket Debug**:
```bash
# Check if backend socket handlers are registered
grep -r "register_socket_handlers" backend/
# Should show registration in app.py
```

#### 3. **Chat Responses Not Working**

**Problem**: Chat messages sent but no responses received

**Check API Key Configuration**:
```bash
# 1. Backend .env.local
echo $GEMINI_API_KEY

# 2. Frontend .env.local
echo $VITE_GEMINI_API_KEY
```

**Test Chat Endpoint Directly**:
```bash
curl -X POST http://localhost:5000/api/chat/mama-bear \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user_id": "test"}'
```

**Debug Chat Service**:
```typescript
// Check if services are initialized
const debugServices = async () => {
  const response = await fetch('http://localhost:5000/health/detailed');
  const health = await response.json();
  console.log('Service status:', health.services);
};
```

#### 4. **Gemini API Key Errors**

**Problem**: `Invalid API key` or `API key not valid` errors

**Solutions**:
1. **Get Valid API Key**:
   - Visit: https://aistudio.google.com/app/apikey
   - Generate new API key
   - Copy to `.env.local` files

2. **Update Environment Variables**:
```bash
# Backend: backend/.env.local
GEMINI_API_KEY=your_actual_api_key_here

# Frontend: frontend-new-2/.env.local  
GEMINI_API_KEY=your_actual_api_key_here
```

3. **Restart Services**:
```bash
# Restart backend
cd backend && python app.py

# Restart frontend
cd frontend-new-2 && npm run dev
```

**Verify API Key**:
```typescript
// Test Gemini API directly
import { GoogleGenerativeAI } from '@google/generative-ai';

const testGeminiKey = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    console.log('✅ Gemini API working:', result.response.text());
  } catch (error) {
    console.error('❌ Gemini API error:', error);
  }
};
```

#### 5. **Performance Issues (Laggy UI)**

**Problem**: UI feels slow or unresponsive

**Solutions**:

1. **Optimize React Rendering**:
```typescript
// Use React.memo for expensive components
const ChatMessage = React.memo(({ message }: { message: ChatMessage }) => {
  return <div>{message.content}</div>;
});

// Debounce user input
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedSendMessage = useMemo(
  () => debounce((message: string) => {
    chatService.sendMessage(message);
  }, 300),
  []
);
```

2. **Optimize WebSocket Usage**:
```typescript
// Batch socket events
class SocketOptimizer {
  private eventQueue: any[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  queueEvent(event: string, data: any): void {
    this.eventQueue.push({ event, data });
    
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushEvents();
      }, 100); // Batch events every 100ms
    }
  }

  private flushEvents(): void {
    if (this.eventQueue.length > 0) {
      socket.emit('batch_events', this.eventQueue);
      this.eventQueue = [];
    }
    this.flushTimer = null;
  }
}
```

3. **Check Backend Performance**:
```bash
# Monitor backend resource usage
top -p $(pgrep -f "python app.py")

# Check for database locks
# If using SQLite, consider PostgreSQL for production
```

#### 6. **React Key Conflicts**

**Problem**: `Warning: Each child in a list should have a unique "key" prop`

**Solution**:
```typescript
// Ensure unique keys for list items
const ChatMessages = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <div>
      {messages.map((message) => (
        <ChatMessage
          key={`${message.id}-${message.timestamp.getTime()}`}
          message={message}
        />
      ))}
    </div>
  );
};

// For timeline components
const Timeline = ({ events }: { events: TimelineEvent[] }) => {
  return (
    <div>
      {events.map((event, index) => (
        <TimelineItem
          key={`${event.id || index}-${event.timestamp}`}
          event={event}
        />
      ))}
    </div>
  );
};
```

### Debug Tools & Commands

#### Backend Debug Commands
```bash
# 1. Check if all services are running
curl http://localhost:5000/health/detailed

# 2. Test specific endpoints
curl http://localhost:5000/api/dev/ping

# 3. Check database connection
curl http://localhost:5000/api/dev/database/info

# 4. Monitor logs
tail -f mama_bear.log

# 5. Check Python dependencies
pip list | grep -E "(flask|socketio|genai)"
```

#### Frontend Debug Commands
```bash
# 1. Check environment variables
npm run dev -- --debug

# 2. Build and check for errors
npm run build

# 3. Check network requests
# Open browser dev tools > Network tab

# 4. Test socket connection
# Open browser console and run:
# io('http://localhost:5000').on('connect', () => console.log('Connected'))
```

#### Database Debug
```bash
# SQLite database inspection
sqlite3 sanctuary.db
.tables
.schema
SELECT * FROM chat_sessions LIMIT 5;
```

### Error Code Reference

| Code | Type | Meaning | Solution |
|------|------|---------|----------|
| 404 | API | Endpoint not found | Check URL path and method |
| 500 | Server | Internal server error | Check backend logs |
| CORS | Network | Cross-origin blocked | Update CORS configuration |
| ECONNREFUSED | Network | Connection refused | Start backend server |
| API_KEY_INVALID | Auth | Invalid API key | Update API key in .env.local |
| QUOTA_EXCEEDED | Limit | API quota exceeded | Wait or upgrade API plan |

---

## ⚡ Performance Optimization

### Frontend Optimizations

#### 1. **Bundle Optimization**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          socket: ['socket.io-client'],
          ai: ['@google/generative-ai']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

#### 2. **Lazy Loading**
```typescript
// Lazy load heavy components
const ChatInterface = React.lazy(() => import('./components/ChatInterface'));
const TerminalView = React.lazy(() => import('./components/TerminalView'));

const App = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/terminal" element={<TerminalView />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
```

#### 3. **State Management Optimization**
```typescript
// Use context for global state
const AppContext = createContext<AppState | undefined>(undefined);

// Use local state for component-specific data
const ChatComponent = () => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const globalState = useContext(AppContext);
  
  // Only re-render when relevant data changes
  const memoizedMessages = useMemo(() => {
    return localMessages.filter(msg => msg.visible);
  }, [localMessages]);
  
  return <MessageList messages={memoizedMessages} />;
};
```

### Backend Optimizations

#### 1. **Database Connection Pooling**
```python
# config/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

#### 2. **Async Processing**
```python
# services/async_chat_service.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

class AsyncChatService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
    
    async def process_chat_async(self, message: str, user_id: str):
        loop = asyncio.get_event_loop()
        
        # Run AI processing in thread pool
        result = await loop.run_in_executor(
            self.executor,
            self._process_with_ai,
            message,
            user_id
        )
        
        return result
    
    def _process_with_ai(self, message: str, user_id: str):
        # Heavy AI processing here
        return ai_service.generate_response(message)
```

#### 3. **Caching Strategy**
```python
# utils/cache.py
from functools import lru_cache
import redis

# Redis cache for session data
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Memory cache for frequently accessed data
@lru_cache(maxsize=1000)
def get_user_preferences(user_id: str):
    return database.get_user_preferences(user_id)

# Cache chat responses
def cache_chat_response(message_hash: str, response: str, ttl: int = 3600):
    redis_client.setex(f"chat:{message_hash}", ttl, response)

def get_cached_response(message_hash: str) -> str | None:
    return redis_client.get(f"chat:{message_hash}")
```

### Network Optimizations

#### 1. **Request Batching**
```typescript
// utils/RequestBatcher.ts
class RequestBatcher {
  private batch: any[] = [];
  private timer: NodeJS.Timeout | null = null;

  addRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.batch.push({ ...request, resolve, reject });
      
      if (!this.timer) {
        this.timer = setTimeout(() => {
          this.flushBatch();
        }, 50); // Batch requests for 50ms
      }
    });
  }

  private flushBatch(): void {
    if (this.batch.length === 0) return;

    const requests = this.batch.splice(0);
    this.timer = null;

    // Send batch request to backend
    fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: requests.map(r => r.request) })
    })
    .then(response => response.json())
    .then(results => {
      results.forEach((result: any, index: number) => {
        if (result.success) {
          requests[index].resolve(result.data);
        } else {
          requests[index].reject(new Error(result.error));
        }
      });
    })
    .catch(error => {
      requests.forEach(req => req.reject(error));
    });
  }
}
```

#### 2. **WebSocket Optimization**
```typescript
// services/OptimizedSocketService.ts
class OptimizedSocketService {
  private socket: Socket;
  private messageQueue: any[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.socket = io(config.api.socketUrl, {
      transports: ['websocket'], // Prefer WebSocket
      upgrade: true,
      rememberUpgrade: true,
      compression: true, // Enable compression
    });

    this.setupOptimizations();
  }

  private setupOptimizations(): void {
    // Handle offline/online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushMessageQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Heartbeat to keep connection alive
    setInterval(() => {
      if (this.socket.connected) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 30000);
  }

  send(event: string, data: any): void {
    if (this.isOnline && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      // Queue messages for when connection is restored
      this.messageQueue.push({ event, data, timestamp: Date.now() });
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && Date.now() - message.timestamp < 300000) { // 5 minutes
        this.socket.emit(message.event, message.data);
      }
    }
  }
}
```

---

## 🧪 Testing & Validation

### API Testing

#### Unit Tests for API Client
```typescript
// tests/APIClient.test.ts
import { APIClient } from '../src/services/APIClient';

describe('APIClient', () => {
  let apiClient: APIClient;

  beforeEach(() => {
    apiClient = new APIClient('http://localhost:5000');
  });

  test('should make successful GET request', async () => {
    const response = await apiClient.request('/health');
    expect(response.status).toBe('healthy');
  });

  test('should handle API errors correctly', async () => {
    await expect(apiClient.request('/nonexistent')).rejects.toThrow('HTTP 404');
  });

  test('should include proper headers', async () => {
    // Mock fetch to test headers
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    await apiClient.request('/test');
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });
});
```

#### Integration Tests
```typescript
// tests/integration/ChatService.test.ts
import { ChatService } from '../src/services/ChatService';

describe('ChatService Integration', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = new ChatService();
  });

  test('should send message and receive response', async () => {
    const message = 'Hello, Mama Bear!';
    const userMessage = await chatService.sendMessage(message);

    expect(userMessage.content).toBe(message);
    expect(userMessage.sender).toBe('user');

    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const messages = chatService.getMessages();
    expect(messages.length).toBeGreaterThan(1);
    expect(messages[1].sender).toBe('assistant');
  });
});
```

### Backend API Tests
```python
# tests/test_api_endpoints.py
import pytest
from app import create_app

@pytest.fixture
def client():
    app, socketio = create_app('testing')
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_chat_endpoint(client):
    """Test chat endpoint"""
    response = client.post('/api/chat/mama-bear', 
        json={'message': 'Hello', 'user_id': 'test'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'response' in data

def test_invalid_chat_request(client):
    """Test chat endpoint with invalid data"""
    response = client.post('/api/chat/mama-bear', json={})
    assert response.status_code == 400
```

### Socket.IO Tests
```typescript
// tests/socket.test.ts
import { io } from 'socket.io-client';

describe('Socket.IO Integration', () => {
  let socket: any;

  beforeEach((done) => {
    socket = io('http://localhost:5000');
    socket.on('connect', done);
  });

  afterEach(() => {
    socket.disconnect();
  });

  test('should connect successfully', () => {
    expect(socket.connected).toBe(true);
  });

  test('should receive test response', (done) => {
    socket.emit('test_event', { message: 'test' });
    
    socket.on('test_response', (data: any) => {
      expect(data.status).toBe('success');
      expect(data.message).toBe('Test event processed successfully');
      done();
    });
  });

  test('should handle chat messages', (done) => {
    const testMessage = 'Hello via socket';
    
    socket.emit('mama_bear_chat', {
      message: testMessage,
      user_id: 'test',
      session_id: 'test_session'
    });

    socket.on('mama_bear_response', (data: any) => {
      expect(data.message).toBeDefined();
      expect(data.session_id).toBe('test_session');
      done();
    });
  });
});
```

### Load Testing
```bash
# Load test chat endpoint
hey -n 1000 -c 50 -m POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","user_id":"test"}' \
  http://localhost:5000/api/chat/mama-bear

# WebSocket load test using artillery
# artillery-config.yml
config:
  target: 'ws://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Socket.IO Connection Test"
    engine: socketio
    steps:
      - emit:
          channel: "test_event"
          data: { "message": "load test" }
      - think: 1
```

### Performance Monitoring
```typescript
// utils/PerformanceMonitor.ts
class PerformanceMonitor {
  static measureAPICall<T>(
    name: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    return apiCall()
      .then(result => {
        const duration = performance.now() - start;
        console.log(`API Call ${name}: ${duration.toFixed(2)}ms`);
        
        // Send to analytics if configured
        if (window.gtag) {
          window.gtag('event', 'api_performance', {
            api_name: name,
            duration: Math.round(duration)
          });
        }
        
        return result;
      })
      .catch(error => {
        const duration = performance.now() - start;
        console.error(`API Call ${name} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      });
  }

  static measureSocketEvent(eventName: string, data: any): void {
    const start = performance.now();
    
    socket.emit(eventName, data);
    
    const handleResponse = (response: any) => {
      const duration = performance.now() - start;
      console.log(`Socket Event ${eventName}: ${duration.toFixed(2)}ms`);
      socket.off(`${eventName}_response`, handleResponse);
    };
    
    socket.on(`${eventName}_response`, handleResponse);
  }
}
```

---

## 🚀 Final Implementation Checklist

### ✅ Backend Setup
- [ ] Backend server running on port 5000
- [ ] All API endpoints responding correctly
- [ ] Socket.IO handlers registered
- [ ] Database initialized
- [ ] Services initialized (Mama Bear, Marketplace, etc.)
- [ ] Environment variables configured
- [ ] CORS configured for frontend origins

### ✅ Frontend Integration
- [ ] API client configured with correct base URL
- [ ] Socket.IO client connected successfully
- [ ] Chat service integrated and working
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Real-time updates functioning

### ✅ API Key Configuration
- [ ] Gemini API key added to backend `.env.local`
- [ ] Gemini API key added to frontend `.env.local`
- [ ] API key validation working
- [ ] Error messages for invalid keys

### ✅ Performance Optimization
- [ ] Request batching implemented
- [ ] Socket message optimization
- [ ] React rendering optimized
- [ ] Bundle size optimized
- [ ] Caching strategies implemented

### ✅ Testing & Validation
- [ ] Unit tests for API client
- [ ] Integration tests for chat service
- [ ] Socket.IO connection tests
- [ ] Error handling tests
- [ ] Performance monitoring setup

---

## 📚 Additional Resources

### Documentation Links
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Google Gemini API](https://ai.google.dev/docs)

### Useful Commands
```bash
# Backend
python app.py                 # Start backend server
pip install -r requirements.txt  # Install dependencies
python -m pytest tests/      # Run backend tests

# Frontend
npm run dev                   # Start development server
npm run build                 # Build for production
npm test                      # Run frontend tests
npm run lint                  # Check code quality

# Database
sqlite3 sanctuary.db .dump    # Backup database
sqlite3 sanctuary.db .schema  # Show database schema

# Debugging
tail -f mama_bear.log         # Monitor backend logs
curl -X POST http://localhost:5000/api/chat/mama-bear -H "Content-Type: application/json" -d '{"message":"test"}'
```

### Environment Templates
```bash
# Copy environment templates
cp .env.production.template .env.local
cp frontend-new-2/.env.local.template frontend-new-2/.env.local

# Set required API keys
nano .env.local               # Edit backend environment
nano frontend-new-2/.env.local  # Edit frontend environment
```

---

## 🎯 Next Steps

1. **Implement API Key Configuration**: Set up proper Gemini API keys in both backend and frontend
2. **Fix Performance Issues**: Address laggy behavior through optimization techniques
3. **Resolve React Key Conflicts**: Ensure all list items have unique keys
4. **Implement Proper Error Handling**: Add comprehensive error boundaries and user feedback
5. **Complete Integration Testing**: Run full integration tests between frontend and backend
6. **Deploy to Production**: Set up production environment with proper security

---

*This documentation serves as the complete reference for integrating the Podplay Sanctuary frontend with the backend services. All code examples are production-ready and follow best practices for scalability and maintainability.*
