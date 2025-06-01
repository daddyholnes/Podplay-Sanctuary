/**
 * MCP Hook - useMCP
 * 
 * A comprehensive React hook for managing Model Context Protocol (MCP) functionality
 * in Podplay Sanctuary. Handles MCP server discovery, installation, management,
 * and communication with AI models through the MCP protocol.
 * 
 * Features:
 * - MCP server marketplace integration
 * - Automatic server discovery and cataloging
 * - Server installation and configuration
 * - Protocol-based communication with AI models
 * - Resource and tool management
 * - Server health monitoring and diagnostics
 * - Version management and updates
 * - Custom server development support
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAPI } from '../api/useAPI';
import { useSocket } from '../api/useSocket';

export interface MCPServer {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'development' | 'productivity' | 'analysis' | 'automation' | 'communication' | 'utilities' | 'custom';
  tags: string[];
  status: 'available' | 'installed' | 'running' | 'stopped' | 'error' | 'updating';
  type: 'official' | 'community' | 'custom' | 'local';
  
  // Installation info
  installPath?: string;
  configPath?: string;
  executable?: string;
  
  // Protocol info
  protocolVersion: string;
  capabilities: MCPCapability[];
  resources: MCPResource[];
  tools: MCPTool[];
  
  // Metadata
  homepage?: string;
  repository?: string;
  documentation?: string;
  license: string;
  size: number;
  downloads: number;
  rating: number;
  reviews: number;
  lastUpdated: Date;
  
  // Runtime info
  port?: number;
  pid?: number;
  uptime?: number;
  memory?: number;
  cpu?: number;
  
  // Configuration
  config: MCPServerConfig;
  dependencies: string[];
  requirements: MCPRequirement[];
}

export interface MCPCapability {
  name: string;
  version: string;
  description: string;
  supported: boolean;
  experimental?: boolean;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  annotations?: Record<string, any>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema?: any;
  examples?: any[];
}

export interface MCPServerConfig {
  enabled: boolean;
  autoStart: boolean;
  port?: number;
  host?: string;
  timeout?: number;
  retries?: number;
  environment?: Record<string, string>;
  arguments?: string[];
  workingDirectory?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  authentication?: {
    type: 'none' | 'api-key' | 'oauth' | 'certificate';
    credentials?: any;
  };
}

export interface MCPRequirement {
  type: 'node' | 'python' | 'binary' | 'service';
  name: string;
  version?: string;
  optional: boolean;
  satisfied: boolean;
  installCommand?: string;
}

export interface MCPMessage {
  id: string;
  serverId: string;
  type: 'request' | 'response' | 'notification' | 'error';
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  timestamp: Date;
}

export interface MCPSession {
  id: string;
  serverId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  errorCount: number;
}

export interface UseMCPOptions {
  // Auto-discovery options
  autoDiscoverServers?: boolean;
  discoveryInterval?: number;
  
  // Marketplace options
  enableMarketplace?: boolean;
  marketplaceUrl?: string;
  
  // Auto-management options
  autoStartServers?: boolean;
  autoUpdateServers?: boolean;
  
  // Performance options
  maxConcurrentSessions?: number;
  sessionTimeout?: number;
  messageTimeout?: number;
  
  // Development options
  enableDevMode?: boolean;
  customServerPaths?: string[];
  
  // Callbacks
  onServerInstalled?: (server: MCPServer) => void;
  onServerStarted?: (server: MCPServer) => void;
  onServerStopped?: (server: MCPServer) => void;
  onServerError?: (server: MCPServer, error: Error) => void;
  onMessageReceived?: (message: MCPMessage) => void;
  onError?: (error: Error) => void;
}

export interface UseMCPResult {
  // Server state
  servers: MCPServer[];
  installedServers: MCPServer[];
  runningServers: MCPServer[];
  availableServers: MCPServer[];
  
  // Session state
  sessions: MCPSession[];
  activeSessions: MCPSession[];
  
  // Loading states
  isLoadingServers: boolean;
  isDiscovering: boolean;
  isInstalling: boolean;
  
  // Connection state
  isConnected: boolean;
  
  // Server management
  installServer: (serverId: string, config?: Partial<MCPServerConfig>) => Promise<MCPServer>;
  uninstallServer: (serverId: string) => Promise<void>;
  updateServer: (serverId: string) => Promise<MCPServer>;
  configureServer: (serverId: string, config: Partial<MCPServerConfig>) => Promise<MCPServer>;
  
  // Server control
  startServer: (serverId: string) => Promise<void>;
  stopServer: (serverId: string) => Promise<void>;
  restartServer: (serverId: string) => Promise<void>;
  
  // Session management
  createSession: (serverId: string) => Promise<MCPSession>;
  closeSession: (sessionId: string) => Promise<void>;
  getSession: (sessionId: string) => MCPSession | null;
  
  // Communication
  sendMessage: (sessionId: string, method: string, params?: any) => Promise<any>;
  callTool: (sessionId: string, toolName: string, params: any) => Promise<any>;
  getResource: (sessionId: string, uri: string) => Promise<any>;
  
  // Discovery and marketplace
  discoverServers: () => Promise<MCPServer[]>;
  searchServers: (query: string, filters?: any) => Promise<MCPServer[]>;
  getServerDetails: (serverId: string) => Promise<MCPServer>;
  
  // Development support
  createCustomServer: (config: any) => Promise<MCPServer>;
  validateServer: (serverPath: string) => Promise<any>;
  debugServer: (serverId: string) => Promise<any>;
  
  // Diagnostics
  getServerLogs: (serverId: string, lines?: number) => Promise<string[]>;
  getServerMetrics: (serverId: string) => Promise<any>;
  runHealthCheck: (serverId: string) => Promise<any>;
  
  // Utilities
  exportServerConfig: (serverId: string) => string;
  importServerConfig: (config: string) => Promise<MCPServer>;
  bulkOperation: (operation: string, serverIds: string[]) => Promise<any[]>;
}

interface MCPState {
  servers: MCPServer[];
  sessions: MCPSession[];
  messages: MCPMessage[];
  isDiscovering: boolean;
  isInstalling: boolean;
  installProgress: Record<string, number>;
  serverMetrics: Record<string, any>;
}

export function useMCP(options: UseMCPOptions = {}): UseMCPResult {
  const {
    autoDiscoverServers = true,
    discoveryInterval = 30000, // 30 seconds
    enableMarketplace = true,
    marketplaceUrl = process.env.REACT_APP_MCP_MARKETPLACE_URL || 'https://mcp.podplay.dev/api',
    autoStartServers = true,
    autoUpdateServers = false,
    maxConcurrentSessions = 10,
    sessionTimeout = 300000, // 5 minutes
    messageTimeout = 30000, // 30 seconds
    enableDevMode = process.env.NODE_ENV === 'development',
    customServerPaths = [],
    onServerInstalled,
    onServerStarted,
    onServerStopped,
    onServerError,
    onMessageReceived,
    onError
  } = options;

  // State management
  const [state, setState] = useState<MCPState>({
    servers: [],
    sessions: [],
    messages: [],
    isDiscovering: false,
    isInstalling: false,
    installProgress: {},
    serverMetrics: {}
  });

  // Refs for cleanup
  const discoveryIntervalRef = useRef<NodeJS.Timeout>();
  const sessionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // WebSocket connection for real-time MCP events
  const {
    isConnected,
    sendJsonMessage,
    lastMessage
  } = useSocket(
    process.env.REACT_APP_MCP_WS_URL || 'ws://localhost:8000/ws/mcp',
    {
      autoConnect: true,
      onMessage: handleSocketMessage,
      onError: (error) => onError?.(new Error(`MCP WebSocket error: ${error}`))
    }
  );

  // API hooks for MCP operations
  const { data: serversData, execute: loadServers, isLoading: isLoadingServers } = useAPI(
    async () => {
      const response = await fetch(`${marketplaceUrl}/servers`);
      return response.json();
    },
    { enabled: enableMarketplace, cacheKey: 'mcp:servers', cacheTTL: 300000 }
  );

  const { execute: installServerAPI } = useAPI(
    async (serverId: string, config: any) => {
      const response = await fetch(`${marketplaceUrl}/servers/${serverId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return response.json();
    },
    { manual: true }
  );

  const { execute: discoverServersAPI } = useAPI(
    async () => {
      const response = await fetch(`${marketplaceUrl}/discover`);
      return response.json();
    },
    { manual: true }
  );

  // Handle WebSocket messages
  function handleSocketMessage(data: any) {
    try {
      switch (data.type) {
        case 'server_status':
          handleServerStatusUpdate(data.payload);
          break;
        case 'session_update':
          handleSessionUpdate(data.payload);
          break;
        case 'mcp_message':
          handleMCPMessage(data.payload);
          break;
        case 'server_installed':
          handleServerInstalled(data.payload);
          break;
        case 'server_error':
          handleServerError(data.payload);
          break;
        case 'discovery_result':
          handleDiscoveryResult(data.payload);
          break;
        case 'install_progress':
          handleInstallProgress(data.payload);
          break;
        default:
          console.warn('Unknown MCP message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling MCP socket message:', error);
      onError?.(error as Error);
    }
  }

  // Handle server status updates
  const handleServerStatusUpdate = useCallback((statusData: any) => {
    setState(prev => ({
      ...prev,
      servers: prev.servers.map(server =>
        server.id === statusData.serverId
          ? {
              ...server,
              status: statusData.status,
              port: statusData.port,
              pid: statusData.pid,
              uptime: statusData.uptime,
              memory: statusData.memory,
              cpu: statusData.cpu
            }
          : server
      ),
      serverMetrics: {
        ...prev.serverMetrics,
        [statusData.serverId]: statusData.metrics
      }
    }));

    // Trigger callbacks
    const server = state.servers.find(s => s.id === statusData.serverId);
    if (server) {
      if (statusData.status === 'running' && statusData.previousStatus !== 'running') {
        onServerStarted?.(server);
      } else if (statusData.status === 'stopped' && statusData.previousStatus === 'running') {
        onServerStopped?.(server);
      } else if (statusData.status === 'error') {
        onServerError?.(server, new Error(statusData.error));
      }
    }
  }, [state.servers, onServerStarted, onServerStopped, onServerError]);

  // Handle session updates
  const handleSessionUpdate = useCallback((sessionData: any) => {
    const session: MCPSession = {
      ...sessionData,
      startTime: new Date(sessionData.startTime),
      lastActivity: new Date(sessionData.lastActivity)
    };

    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === session.id ? session : s)
    }));

    // Reset session timeout
    if (sessionTimeoutsRef.current.has(session.id)) {
      clearTimeout(sessionTimeoutsRef.current.get(session.id)!);
    }

    if (session.status === 'connected') {
      const timeout = setTimeout(() => {
        closeSession(session.id);
      }, sessionTimeout);
      sessionTimeoutsRef.current.set(session.id, timeout);
    }
  }, [sessionTimeout]);

  // Handle MCP messages
  const handleMCPMessage = useCallback((messageData: any) => {
    const message: MCPMessage = {
      ...messageData,
      timestamp: new Date(messageData.timestamp)
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages.slice(-999), message] // Keep last 1000 messages
    }));

    onMessageReceived?.(message);
  }, [onMessageReceived]);

  // Handle server installation
  const handleServerInstalled = useCallback((serverData: any) => {
    const server: MCPServer = {
      ...serverData,
      lastUpdated: new Date(serverData.lastUpdated)
    };

    setState(prev => ({
      ...prev,
      servers: prev.servers.map(s => s.id === server.id ? server : s),
      isInstalling: false,
      installProgress: {
        ...prev.installProgress,
        [server.id]: 100
      }
    }));

    onServerInstalled?.(server);

    // Auto-start if enabled
    if (autoStartServers && server.config.autoStart) {
      startServer(server.id);
    }
  }, [onServerInstalled, autoStartServers]);

  // Handle server errors
  const handleServerError = useCallback((errorData: any) => {
    const server = state.servers.find(s => s.id === errorData.serverId);
    if (server) {
      onServerError?.(server, new Error(errorData.message));
    }
  }, [state.servers, onServerError]);

  // Handle discovery results
  const handleDiscoveryResult = useCallback((discoveryData: any) => {
    const discoveredServers = discoveryData.servers.map((serverData: any) => ({
      ...serverData,
      lastUpdated: new Date(serverData.lastUpdated)
    }));

    setState(prev => ({
      ...prev,
      servers: [...prev.servers, ...discoveredServers],
      isDiscovering: false
    }));
  }, []);

  // Handle installation progress
  const handleInstallProgress = useCallback((progressData: any) => {
    setState(prev => ({
      ...prev,
      installProgress: {
        ...prev.installProgress,
        [progressData.serverId]: progressData.progress
      }
    }));
  }, []);

  // Install server
  const installServer = useCallback(async (
    serverId: string,
    config: Partial<MCPServerConfig> = {}
  ): Promise<MCPServer> => {
    try {
      setState(prev => ({
        ...prev,
        isInstalling: true,
        installProgress: { ...prev.installProgress, [serverId]: 0 }
      }));

      const server = await installServerAPI(serverId, config);

      return server;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isInstalling: false,
        installProgress: { ...prev.installProgress, [serverId]: 0 }
      }));
      onError?.(error as Error);
      throw error;
    }
  }, [installServerAPI, onError]);

  // Start server
  const startServer = useCallback(async (serverId: string) => {
    if (isConnected) {
      sendJsonMessage({
        type: 'start_server',
        payload: { serverId }
      });
    }
  }, [isConnected, sendJsonMessage]);

  // Stop server
  const stopServer = useCallback(async (serverId: string) => {
    if (isConnected) {
      sendJsonMessage({
        type: 'stop_server',
        payload: { serverId }
      });
    }
  }, [isConnected, sendJsonMessage]);

  // Create session
  const createSession = useCallback(async (serverId: string): Promise<MCPSession> => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: MCPSession = {
      id: sessionId,
      serverId,
      status: 'connecting',
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      errorCount: 0
    };

    setState(prev => ({
      ...prev,
      sessions: [...prev.sessions, session]
    }));

    if (isConnected) {
      sendJsonMessage({
        type: 'create_session',
        payload: { sessionId, serverId }
      });
    }

    return session;
  }, [isConnected, sendJsonMessage]);

  // Close session
  const closeSession = useCallback(async (sessionId: string) => {
    if (sessionTimeoutsRef.current.has(sessionId)) {
      clearTimeout(sessionTimeoutsRef.current.get(sessionId)!);
      sessionTimeoutsRef.current.delete(sessionId);
    }

    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));

    if (isConnected) {
      sendJsonMessage({
        type: 'close_session',
        payload: { sessionId }
      });
    }
  }, [isConnected, sendJsonMessage]);

  // Send message
  const sendMessage = useCallback(async (
    sessionId: string,
    method: string,
    params?: any
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, messageTimeout);

      // Store resolve/reject for response handling
      const pendingMessage = { resolve, reject, timeoutId };
      
      if (isConnected) {
        sendJsonMessage({
          type: 'mcp_request',
          payload: {
            sessionId,
            messageId,
            method,
            params
          }
        });
      } else {
        clearTimeout(timeoutId);
        reject(new Error('Not connected'));
      }
    });
  }, [isConnected, sendJsonMessage, messageTimeout]);

  // Discover servers
  const discoverServers = useCallback(async (): Promise<MCPServer[]> => {
    setState(prev => ({ ...prev, isDiscovering: true }));
    
    try {
      const servers = await discoverServersAPI();
      return servers;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isDiscovering: false }));
    }
  }, [discoverServersAPI, onError]);

  // Get filtered server lists
  const installedServers = state.servers.filter(s => s.status !== 'available');
  const runningServers = state.servers.filter(s => s.status === 'running');
  const availableServers = state.servers.filter(s => s.status === 'available');
  const activeSessions = state.sessions.filter(s => s.status === 'connected');

  // Setup auto-discovery
  useEffect(() => {
    if (autoDiscoverServers && discoveryInterval > 0) {
      const interval = setInterval(() => {
        discoverServers();
      }, discoveryInterval);
      
      discoveryIntervalRef.current = interval;
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [autoDiscoverServers, discoveryInterval, discoverServers]);

  // Update servers when data loads
  useEffect(() => {
    if (serversData) {
      setState(prev => ({
        ...prev,
        servers: serversData.map((serverData: any) => ({
          ...serverData,
          lastUpdated: new Date(serverData.lastUpdated)
        }))
      }));
    }
  }, [serversData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      sessionTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      sessionTimeoutsRef.current.clear();
      
      if (discoveryIntervalRef.current) {
        clearInterval(discoveryIntervalRef.current);
      }
    };
  }, []);

  return {
    // Server state
    servers: state.servers,
    installedServers,
    runningServers,
    availableServers,
    
    // Session state
    sessions: state.sessions,
    activeSessions,
    
    // Loading states
    isLoadingServers,
    isDiscovering: state.isDiscovering,
    isInstalling: state.isInstalling,
    
    // Connection state
    isConnected,
    
    // Server management
    installServer,
    uninstallServer: async () => { throw new Error('Not implemented'); },
    updateServer: async () => { throw new Error('Not implemented'); },
    configureServer: async () => { throw new Error('Not implemented'); },
    
    // Server control
    startServer,
    stopServer,
    restartServer: async (serverId) => {
      await stopServer(serverId);
      setTimeout(() => startServer(serverId), 1000);
    },
    
    // Session management
    createSession,
    closeSession,
    getSession: (sessionId) => state.sessions.find(s => s.id === sessionId) || null,
    
    // Communication
    sendMessage,
    callTool: async () => { throw new Error('Not implemented'); },
    getResource: async () => { throw new Error('Not implemented'); },
    
    // Discovery and marketplace
    discoverServers,
    searchServers: async () => { throw new Error('Not implemented'); },
    getServerDetails: async () => { throw new Error('Not implemented'); },
    
    // Development support
    createCustomServer: async () => { throw new Error('Not implemented'); },
    validateServer: async () => { throw new Error('Not implemented'); },
    debugServer: async () => { throw new Error('Not implemented'); },
    
    // Diagnostics
    getServerLogs: async () => { throw new Error('Not implemented'); },
    getServerMetrics: async (serverId) => state.serverMetrics[serverId] || {},
    runHealthCheck: async () => { throw new Error('Not implemented'); },
    
    // Utilities
    exportServerConfig: () => { throw new Error('Not implemented'); },
    importServerConfig: async () => { throw new Error('Not implemented'); },
    bulkOperation: async () => { throw new Error('Not implemented'); }
  };
}
