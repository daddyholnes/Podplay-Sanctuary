/**
 * APITypes - TypeScript interfaces and types for API operations
 * Centralized type definitions for all API-related data structures
 */

// Base API Response structure
export interface APIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// API Request configuration
export interface APIRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// API Endpoint definitions
export enum APIEndpoint {
  // Health & Status
  HEALTH = '/health',
  STATUS = '/status',
  
  // Chat endpoints
  CHAT_SEND = '/api/chat/send',
  CHAT_HISTORY = '/api/chat/history',
  CHAT_CLEAR = '/api/chat/clear',
  
  // Scout endpoints
  SCOUT_QUERY = '/api/scout/query',
  SCOUT_STATUS = '/api/scout/status',
  SCOUT_FILES = '/api/scout/files',
  SCOUT_WORKSPACE = '/api/scout/workspace',
  
  // MCP endpoints
  MCP_SERVERS = '/api/mcp/servers',
  MCP_INSTALL = '/api/mcp/install',
  MCP_UNINSTALL = '/api/mcp/uninstall',
  MCP_STATUS = '/api/mcp/status',
  
  // AI Model endpoints
  AI_MODELS = '/api/ai/models',
  AI_GENERATE = '/api/ai/generate',
  AI_PLAN = '/api/ai/plan',
}

// Chat-related types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatSendRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  messageId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  sessionId: string;
  totalCount: number;
}

// Scout-related types
export interface ScoutQuery {
  query: string;
  workspacePath?: string;
  fileTypes?: string[];
  maxResults?: number;
}

export interface ScoutFile {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
  content?: string;
}

export interface ScoutResponse {
  files: ScoutFile[];
  summary: string;
  queryId: string;
  timestamp: string;
}

export interface WorkspaceInfo {
  path: string;
  name: string;
  fileCount: number;
  directoryCount: number;
  languages: string[];
  frameworks: string[];
}

// MCP-related types
export interface MCPServer {
  id: string;
  name: string;
  version: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  config?: Record<string, any>;
}

export interface MCPInstallRequest {
  serverId: string;
  config?: Record<string, any>;
}

export interface MCPInstallResponse {
  success: boolean;
  serverId: string;
  message: string;
  server?: MCPServer;
}

// AI Model types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'chat' | 'completion' | 'embedding';
  capabilities: string[];
  maxTokens: number;
  costPer1000Tokens?: number;
}

export interface AIGenerateRequest {
  prompt: string;
  modelId?: string;
  maxTokens?: number;
  temperature?: number;
  systemMessage?: string;
}

export interface AIGenerateResponse {
  content: string;
  model: string;
  tokensUsed: number;
  finishReason: string;
  timestamp: string;
}

export interface AIPlanRequest {
  goal: string;
  context?: string;
  constraints?: string[];
  modelId?: string;
}

export interface AIPlanResponse {
  plan: {
    steps: Array<{
      id: string;
      description: string;
      dependencies: string[];
      estimatedTime: string;
    }>;
    summary: string;
    totalEstimatedTime: string;
  };
  model: string;
  timestamp: string;
}

// System types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  services: {
    database: boolean;
    ai: boolean;
    mcp: boolean;
    scout: boolean;
  };
}

export interface SystemStatus {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  activeConnections: number;
  requestsPerMinute: number;
}

// Error types
export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

// WebSocket types
export interface SocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id: string;
}

export interface SocketError {
  type: 'error';
  message: string;
  code?: string;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  API_BASE_URL: string;
  SOCKET_URL: string;
  AI_MODEL_DEFAULT: string;
  DEBUG_MODE: boolean;
}

export default APIEndpoint;
