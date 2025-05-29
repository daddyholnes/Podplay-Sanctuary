// API Configuration for Podplay Build Sanctuary

// Backend API base URL - Use relative URLs in Codespaces to avoid mixed content issues
export const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '' // Use empty base URL for relative paths to work in Codespaces
  : 'https://mama-bear-backend-197406322381.us-central1.run.app'; // Deployed backend URL

// Socket.io connection URL - Same approach for WebSockets
export const SOCKET_URL = process.env.NODE_ENV === 'development'
  ? '' // Use relative URL for socket.io as well
  : 'https://mama-bear-backend-197406322381.us-central1.run.app';

// Helper to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${cleanBase}/${cleanEndpoint}`;
};

// Helper to build dynamic endpoint URLs (with path parameters)
export const buildDynamicApiUrl = (endpointTemplate: string, params: Record<string, string | number>): string => {
  let url = endpointTemplate;
  for (const key in params) {
    url = url.replace(`:${key}`, encodeURIComponent(String(params[key])));
  }
  return buildApiUrl(url);
};

// Helper to construct WebSocket URLs
export const getTerminalWebSocketBaseUrl = (): string => {
  // Derives ws/wss from window.location, and uses configured backend host/port for dev
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(SOCKET_URL); // SOCKET_URL should be http://localhost:PORT
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}`; // e.g., ws://localhost:5001
  } else {
    // For production, derive from window.location
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}`;
  }
};

// Comprehensive API endpoint mapping for all systems
export const API_ENDPOINTS = {
  // Mama Bear endpoints
  MAMA_BEAR: {
    CHAT: '/api/mama-bear/chat',
    BRIEFING: '/api/mama-bear/briefing',
  },
  
  // MCP endpoints
  MCP: {
    MANAGE: '/api/mcp/manage',
    SEARCH: '/api/mcp/search',
    INSTALL: '/api/mcp/install',
    CATEGORIES: '/api/mcp/categories',
    DISCOVER: '/api/mcp/discover',
  },
  
  // Vertex Garden endpoints
  VERTEX_GARDEN: {
    CHAT: '/api/vertex-garden/chat',
    CHAT_HISTORY: '/api/vertex-garden/chat-history',
    SESSION_MESSAGES: '/api/vertex-garden/session/:sessionId/messages',
    TERMINAL: '/api/vertex-garden/terminal',
    EXECUTE_CODE: '/api/vertex-garden/execute-code',
  },
  
  // Dev Sandbox endpoints
  DEV_SANDBOX: {
    CREATE: '/api/dev-sandbox/create',
    STOP: '/api/dev-sandbox/:envId/stop',
    DELETE: '/api/dev-sandbox/:envId',
    GET_FILES: '/api/dev-sandbox/:envId/files',
    GET_FILE: '/api/dev-sandbox/:envId/file',
    UPDATE_FILE: '/api/dev-sandbox/:envId/file',
    CREATE_FILE: '/api/dev-sandbox/:envId/file/create',
    TERMINAL: '/api/dev-sandbox/:envId/terminal',
    TERMINAL_EXECUTE: '/api/dev-sandbox/terminal/:terminalId/execute',
    PREVIEW_START: '/api/dev-sandbox/:envId/preview/start',
  },

  // NixOS Workspaces endpoints
  NIXOS_WORKSPACES: {
    // Workspace Management
    LIST: '/api/nixos/workspaces',
    CREATE: '/api/nixos/workspaces',
    GET: '/api/nixos/workspaces/:id',
    UPDATE: '/api/nixos/workspaces/:id',
    DELETE: '/api/nixos/workspaces/:id',
    
    // Workspace Operations
    START: '/api/nixos/workspaces/:id/start',
    STOP: '/api/nixos/workspaces/:id/stop',
    RESTART: '/api/nixos/workspaces/:id/restart',
    STATUS: '/api/nixos/workspaces/:id/status',
    
    // Configuration Management
    GET_CONFIG: '/api/nixos/workspaces/:id/config',
    UPDATE_CONFIG: '/api/nixos/workspaces/:id/config',
    REBUILD: '/api/nixos/workspaces/:id/rebuild',
    
    // Terminal Access
    TERMINAL_CONNECT: '/api/nixos/workspaces/:id/terminal',
    TERMINAL_WEBSOCKET: '/ws/nixos/workspaces/:id/terminal',
    
    // File Management
    LIST_FILES: '/api/nixos/workspaces/:id/files',
    GET_FILE: '/api/nixos/workspaces/:id/files/*',
    PUT_FILE: '/api/nixos/workspaces/:id/files/*',
    DELETE_FILE: '/api/nixos/workspaces/:id/files/*',
    
    // Environment Management
    LIST_ENVIRONMENTS: '/api/nixos/workspaces/:id/environments',
    ACTIVATE_ENVIRONMENT: '/api/nixos/workspaces/:id/environments/:envName/activate',
    DEACTIVATE_ENVIRONMENT: '/api/nixos/workspaces/:id/environments/:envName/deactivate',
    
    // Package Management
    SEARCH_PACKAGES: '/api/nixos/packages/search',
    INSTALL_PACKAGE: '/api/nixos/workspaces/:id/packages/install',
    UNINSTALL_PACKAGE: '/api/nixos/workspaces/:id/packages/uninstall',
    LIST_INSTALLED: '/api/nixos/workspaces/:id/packages',
    
    // System Information
    SYSTEM_INFO: '/api/nixos/workspaces/:id/system-info',
    RESOURCE_USAGE: '/api/nixos/workspaces/:id/resources',
    LOGS: '/api/nixos/workspaces/:id/logs',
    
    // Snapshot Management
    LIST_SNAPSHOTS: '/api/nixos/workspaces/:id/snapshots',
    CREATE_SNAPSHOT: '/api/nixos/workspaces/:id/snapshots',
    RESTORE_SNAPSHOT: '/api/nixos/workspaces/:id/snapshots/:snapshotId/restore',
    DELETE_SNAPSHOT: '/api/nixos/workspaces/:id/snapshots/:snapshotId',
  },

  // Scout Agent endpoints
  SCOUT_AGENT: {
    // Project Monitoring
    LIST_PROJECTS: '/api/scout/projects',
    GET_PROJECT: '/api/v1/scout_agent/projects/:id/status',
    CREATE_PROJECT: '/api/scout/projects',
    UPDATE_PROJECT: '/api/scout/projects/:id',
    DELETE_PROJECT: '/api/scout/projects/:id',
    
    // Project Analysis
    ANALYZE_PROJECT: '/api/scout/projects/:id/analyze',
    GET_ANALYSIS: '/api/scout/projects/:id/analysis',
    
    // Monitoring & Alerts
    GET_METRICS: '/api/scout/projects/:id/metrics',
    GET_ALERTS: '/api/scout/projects/:id/alerts',
    ACKNOWLEDGE_ALERT: '/api/scout/projects/:id/alerts/:alertId/acknowledge',
    
    // Agent Actions
    LIST_INTERVENTIONS: '/api/scout/projects/:id/interventions',
    CREATE_INTERVENTION: '/api/scout/projects/:id/interventions',
    GET_INTERVENTION: '/api/scout/projects/:id/interventions/:interventionId',
    EXECUTE_INTERVENTION: '/api/scout/projects/:id/interventions/:interventionId/execute',
    
    // Real-time Features
    WEBSOCKET_CONNECT: '/ws/scout/projects/:id',
    SUBSCRIBE_METRICS: '/ws/scout/projects/:id/metrics',
    SUBSCRIBE_ALERTS: '/ws/scout/projects/:id/alerts',
    
    // Configuration
    GET_CONFIG: '/api/scout/projects/:id/config',
    UPDATE_CONFIG: '/api/scout/projects/:id/config',
    
    // Reports & History
    GET_REPORTS: '/api/scout/projects/:id/reports',
    GET_HISTORY: '/api/scout/projects/:id/history',
    EXPORT_DATA: '/api/scout/projects/:id/export',
  },

  // System Management endpoints
  SYSTEM: {
    HEALTH: '/api/system/health',
    STATUS: '/api/system/status',
    METRICS: '/api/system/metrics',
    LOGS: '/api/system/logs',
    CONFIG: '/api/system/config',
  },

  // WebSocket endpoints for real-time features
  WEBSOCKETS: {
    TERMINAL: '/ws/terminal/:workspaceId',
    SCOUT_MONITORING: '/ws/scout/projects/:projectId',
    SYSTEM_METRICS: '/ws/system/metrics',
    WORKSPACE_EVENTS: '/ws/nixos/workspaces/:workspaceId/events',
  },
};

// Export endpoint builders for common patterns
export const endpointBuilders = {
  // NixOS Workspace builders
  nixosWorkspace: (id: string) => ({
    get: () => buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.GET, { id }),
    start: () => buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.START, { id }),
    stop: () => buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.STOP, { id }),
    terminal: () => buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.TERMINAL_CONNECT, { id }),
    terminalWs: () => buildDynamicApiUrl(API_ENDPOINTS.NIXOS_WORKSPACES.TERMINAL_WEBSOCKET, { id }),
  }),
  
  // Scout Project builders
  scoutProject: (id: string) => ({
    get: () => buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_PROJECT, { id }),
    analyze: () => buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.ANALYZE_PROJECT, { id }),
    metrics: () => buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.GET_METRICS, { id }),
    websocket: () => buildDynamicApiUrl(API_ENDPOINTS.SCOUT_AGENT.WEBSOCKET_CONNECT, { id }),
  }),
};
