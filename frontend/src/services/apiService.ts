/**
 * Podplay Sanctuary API Service
 * Handles all API communication with the Podplay backend
 */

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
}

// Base API URL - would come from env in production
const API_BASE_URL = 'http://localhost:5000/api';

// API Endpoints
const API_ENDPOINTS = {
  // Chat
  CHAT_SESSIONS: '/chat/sessions',
  CHAT_MESSAGES: '/chat/messages',
  
  // Agents
  AGENTS: '/agents',
  
  // MCP Marketplace
  MCP_PACKAGES: '/mcp/packages',
  MCP_INSTALL: '/mcp/install',
  MCP_UNINSTALL: '/mcp/uninstall',
  
  // Workspaces
  WORKSPACES: '/workspaces',
  
  // System
  HEALTH: '/system/health',
};

/**
 * Generic API request handler with proper error management
 */
async function apiRequest<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, data.error || 'Unknown error');
      return {
        status: 'error',
        error: data.error || `Request failed with status ${response.status}`,
      };
    }
    
    return {
      status: 'success',
      data,
    };
  } catch (error) {
    console.error('API Request failed:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// API Service methods
export const apiService = {
  // System Health
  checkHealth: async (): Promise<ApiResponse<{ status: string }>> => {
    return apiRequest<{ status: string }>(API_ENDPOINTS.HEALTH);
  },
  
  // Chat Sessions
  getChatSessions: async (): Promise<ApiResponse<Array<any>>> => {
    return apiRequest(API_ENDPOINTS.CHAT_SESSIONS);
  },
  
  createChatSession: async (data: { title: string; model?: string }): Promise<ApiResponse<any>> => {
    return apiRequest(API_ENDPOINTS.CHAT_SESSIONS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getChatSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.CHAT_SESSIONS}/${sessionId}`);
  },
  
  // Chat Messages
  getChatMessages: async (sessionId: string): Promise<ApiResponse<Array<any>>> => {
    return apiRequest(`${API_ENDPOINTS.CHAT_SESSIONS}/${sessionId}/messages`);
  },
  
  sendChatMessage: async (
    sessionId: string, 
    data: { role: 'user' | 'assistant' | 'system'; content: string; attachments?: any[] }
  ): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.CHAT_SESSIONS}/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // MCP Marketplace
  getMcpPackages: async (): Promise<ApiResponse<Array<any>>> => {
    return apiRequest(API_ENDPOINTS.MCP_PACKAGES);
  },
  
  installMcpPackage: async (packageId: string): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.MCP_INSTALL}/${packageId}`, {
      method: 'POST',
    });
  },
  
  uninstallMcpPackage: async (packageId: string): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.MCP_UNINSTALL}/${packageId}`, {
      method: 'POST',
    });
  },
  
  // Workspaces
  getWorkspaces: async (): Promise<ApiResponse<Array<any>>> => {
    return apiRequest(API_ENDPOINTS.WORKSPACES);
  },
  
  createWorkspace: async (data: any): Promise<ApiResponse<any>> => {
    return apiRequest(API_ENDPOINTS.WORKSPACES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getWorkspace: async (workspaceId: string): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.WORKSPACES}/${workspaceId}`);
  },
  
  updateWorkspace: async (workspaceId: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.WORKSPACES}/${workspaceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  deleteWorkspace: async (workspaceId: string): Promise<ApiResponse<any>> => {
    return apiRequest(`${API_ENDPOINTS.WORKSPACES}/${workspaceId}`, {
      method: 'DELETE',
    });
  },
};

export default apiService;