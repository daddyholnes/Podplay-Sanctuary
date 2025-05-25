// API Configuration for Podplay Build Sanctuary
// This file centralizes API URLs to make switching between development and production easier

// Backend API base URL
export const API_BASE_URL = 'http://localhost:8000';

// Socket.io connection URL
export const SOCKET_URL = 'http://localhost:8000';

// Helper to build full API URLs
export const buildApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// API endpoint map
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
};

// Helper to build dynamic endpoint URLs
export const buildDynamicApiUrl = (endpoint: string, params: Record<string, string>) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, encodeURIComponent(value));
  });
  
  return buildApiUrl(url);
};
