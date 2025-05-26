import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors (optional, for auth tokens, error handling, etc.)
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., network errors, 500s)
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Define API endpoints
const apiEndpoints = {
  // Existing DevSandbox Endpoints (example, adjust if needed)
  getDevSandboxCapabilities: () => apiClient.get('/dev-sandbox/capabilities'),
  createLocalDevEnvironment: (environmentConfig: any) => apiClient.post('/dev-sandbox/create-local', environmentConfig),
  getEnvironmentFiles: (envId: string) => apiClient.get(`/dev-sandbox/${envId}/files`),
  readFileContent: (envId: string, filePath: string) => apiClient.get(`/dev-sandbox/${envId}/file`, { params: { path: filePath } }),
  writeFileContent: (envId: string, filePath: string, content: string) => apiClient.post(`/dev-sandbox/${envId}/file`, { path: filePath, content }),
  createFileOrDirectory: (envId: string, filePath: string, content: string = '', isDirectory: boolean = false) => 
    apiClient.post(`/dev-sandbox/${envId}/file/create`, { path: filePath, content, isDirectory }),
  executeCommandInSandbox: (envId: string, command: string) => apiClient.post('/dev-sandbox/execute', { env_id: envId, command }),
  // Add other DevSandbox endpoints as needed...
  
  // MamaBear / Vertex AI Endpoints (example, adjust if needed)
  mamaBearChat: (message: string, context?: any) => apiClient.post('/mama-bear/chat', { message, context }), // Or /api/vertex/chat
  getVertexModels: () => apiClient.get('/vertex/models'),
  vertexChat: (payload: any) => apiClient.post('/vertex/chat', payload), // For more complex chat payloads
  
  // NixOS Ephemeral Code Execution Endpoints
  executeNixOSCode: (payload: { code: string; language?: string; timeout_seconds?: number; resource_profile?: string; }) => 
    apiClient.post('/v1/execute_python_nixos', payload),
  getNixOSExecutionResult: (jobId: string) => apiClient.get(`/v1/execution_result/${jobId}`),

  // Workspace VM Management Endpoints
  listWorkspaces: () => apiClient.get('/v1/workspaces'),
  createWorkspace: (payload: { workspace_id?: string; memory_mb?: number; vcpus?: number; }) => 
    apiClient.post('/v1/workspaces', payload),
  getWorkspaceDetails: (workspaceId: string) => apiClient.get(`/v1/workspaces/${workspaceId}`),
  deleteWorkspace: (workspaceId: string) => apiClient.delete(`/v1/workspaces/${workspaceId}`),
  startWorkspace: (workspaceId: string) => apiClient.post(`/v1/workspaces/${workspaceId}/start`),
  stopWorkspace: (workspaceId: string) => apiClient.post(`/v1/workspaces/${workspaceId}/stop`),

  // Scout Agent Endpoints
  getScoutProjectStatus: (projectId: string) => apiClient.get(`/v1/scout_agent/projects/${projectId}/status`),
  interveneScoutProject: (projectId: string, payload: { command: string; parameters?: any; }) => 
    apiClient.post(`/v1/scout_agent/projects/${projectId}/intervene`, payload),

  // WebSocket Base URL (conceptual, actual connection done by WebSocket client)
  // The path will be appended with workspaceId etc. in the component.
  getTerminalWebSocketBaseUrl: (): string => {
    // Determine if SSL (wss) or not (ws)
    const isSecure = window.location.protocol === 'https:';
    // Use API_BASE_URL to derive WebSocket host and port if it's full URL, else use window.location
    let host = window.location.host;
    if (API_BASE_URL.startsWith('http')) {
        try {
            const apiUrl = new URL(API_BASE_URL);
            host = apiUrl.host; // Use host from API_BASE_URL if it's absolute
        } catch (e) {
            console.warn("Could not parse API_BASE_URL for WebSocket host, using window.location.host");
        }
    }
    // Path prefix for WebSocket connections, e.g., '/ws'
    // This needs to match the namespace/path used in Flask-SocketIO setup on backend
    const wsProtocol = isSecure ? 'wss' : 'ws';
    // The path part e.g. `/ws/terminal` needs to be handled by the SocketIO server
    // For now, just returning the base. Components will append specifics.
    return `${wsProtocol}://${host}`; 
  },
};

export default apiEndpoints;
