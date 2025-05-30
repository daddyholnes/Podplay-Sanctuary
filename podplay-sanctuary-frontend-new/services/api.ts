
import { API_BASE_URL } from '../utils/constants';
import { 
  ChatMessage, 
  DailyBriefingResponse, 
  MemorySearchResult, 
  CodeAnalysisResponse,
  ModelInfo,
  WorkspaceCreationResponse,
  ActiveWorkspaceResponse,
  ScoutRequestResponse,
  ScoutTimelineResponse,
  AttachmentFile
} from '../types';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  // Add Authorization header if needed:
  // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
});

const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

export const apiService = {
  // Mama Bear Chat Hub
  sendMamaBearMessage: async (
    message: string, 
    currentSection: string, 
    context?: unknown, 
    attachments?: AttachmentFile[]
  ): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/chat/mama-bear`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, user_id: 'nathan', section: currentSection, context, attachments }),
    });
    return handleResponse<ChatMessage>(response);
  },

  getDailyBriefing: async (): Promise<DailyBriefingResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/daily-briefing`, { headers: getHeaders() });
    return handleResponse<DailyBriefingResponse>(response);
  },

  searchMemories: async (query: string): Promise<MemorySearchResult[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/memories/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    return handleResponse<MemorySearchResult[]>(response);
  },

  analyzeCode: async (code: string, language: string): Promise<CodeAnalysisResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/analyze-code`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, language }),
    });
    return handleResponse<CodeAnalysisResponse>(response);
  },

  // Vertex Garden
  sendVertexGardenMessage: async (formData: FormData): Promise<ChatMessage> => {
    // FormData sets its own Content-Type header (multipart/form-data)
    const response = await fetch(`${API_BASE_URL}/chat/vertex-garden`, {
      method: 'POST',
      body: formData, 
      // Do not set Content-Type header when using FormData, browser does it.
    });
    return handleResponse<ChatMessage>(response);
  },

  getAvailableModels: async (): Promise<ModelInfo[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/models`, { headers: getHeaders() });
    return handleResponse<ModelInfo[]>(response);
  },

  createVertexSession: async (model: string): Promise<{ sessionId: string }> => {
    const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ model }),
    });
    return handleResponse<{ sessionId: string }>(response);
  },

  // Dynamic Workspace Center
  requestWorkspace: async (payload: {
    type: string;
    packages: string[];
    mcpServers: string[];
    repositories: string[];
    description: string;
  }): Promise<WorkspaceCreationResponse> => {
    const response = await fetch(`${API_BASE_URL}/workspaces/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<WorkspaceCreationResponse>(response);
  },

  getActiveWorkspaces: async (): Promise<ActiveWorkspaceResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/workspaces/active`, { headers: getHeaders() });
    return handleResponse<ActiveWorkspaceResponse[]>(response);
  },

  configureWorkspace: async (id: string, configuration: unknown): Promise<unknown> => {
     const response = await fetch(`${API_BASE_URL}/workspaces/${id}/configure`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ configuration }),
    });
    return handleResponse<unknown>(response);
  },

  // Scout Agent
  sendScoutAutonomousRequest: async (request: string, context?: unknown): Promise<ScoutRequestResponse> => {
    const response = await fetch(`${API_BASE_URL}/scout/autonomous-request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ request, context }),
    });
    return handleResponse<ScoutRequestResponse>(response);
  },

  getScoutTimeline: async (taskId: string): Promise<ScoutTimelineResponse> => {
    const response = await fetch(`${API_BASE_URL}/scout/timeline/${taskId}`, { headers: getHeaders() });
    return handleResponse<ScoutTimelineResponse>(response);
  },

  // MCP Search (Example, not explicitly in brief but useful)
  searchMCPServers: async (query: string): Promise<any[]> => { // Replace 'any' with actual MCP server type
    const response = await fetch(`${API_BASE_URL}/mcp/search?query=${encodeURIComponent(query)}`, { headers: getHeaders() });
    return handleResponse<any[]>(response);
  },
};
