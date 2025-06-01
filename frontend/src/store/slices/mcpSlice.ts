/**
 * @fileoverview MCP slice for Redux store
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 * 
 * Manages Model Context Protocol state including:
 * - Server connections and lifecycle management
 * - Protocol message handling and routing
 * - Tool and resource discovery
 * - Real-time connection monitoring
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

/**
 * MCP server configuration interface
 */
export interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  cwd?: string;
  autoStart: boolean;
  reconnectOnFailure: boolean;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
  version: string;
  capabilities: {
    tools?: boolean;
    resources?: boolean;
    prompts?: boolean;
    sampling?: boolean;
  };
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * MCP connection interface
 */
export interface MCPConnection {
  id: string;
  serverId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error' | 'timeout';
  startedAt: number;
  lastActivity: number;
  protocol: {
    version: string;
    capabilities: Record<string, any>;
    serverInfo: {
      name: string;
      version: string;
    };
  };
  stats: {
    messagesReceived: number;
    messagesSent: number;
    errors: number;
    uptime: number;
    avgResponseTime: number;
  };
  error?: string;
  reconnectAttempts: number;
}

/**
 * MCP tool interface
 */
export interface MCPTool {
  name: string;
  description: string;
  serverId: string;
  schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  examples?: {
    description: string;
    arguments: Record<string, any>;
  }[];
  category?: string;
  tags: string[];
  lastUsed?: number;
  usageCount: number;
}

/**
 * MCP resource interface
 */
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  serverId: string;
  mimeType?: string;
  size?: number;
  lastModified?: number;
  metadata?: Record<string, any>;
  category?: string;
  tags: string[];
  cached: boolean;
  lastAccessed?: number;
}

/**
 * MCP prompt interface
 */
export interface MCPPrompt {
  name: string;
  description?: string;
  serverId: string;
  arguments?: {
    name: string;
    description?: string;
    required?: boolean;
  }[];
  template: string;
  examples?: {
    description: string;
    arguments: Record<string, any>;
    expected_output?: string;
  }[];
  category?: string;
  tags: string[];
  lastUsed?: number;
  usageCount: number;
}

/**
 * MCP message interface
 */
export interface MCPMessage {
  id: string;
  type: 'request' | 'response' | 'notification';
  method: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  timestamp: number;
  serverId: string;
  direction: 'incoming' | 'outgoing';
  duration?: number;
}

/**
 * MCP operation interface
 */
export interface MCPOperation {
  id: string;
  type: 'tool_call' | 'resource_read' | 'prompt_get' | 'sampling_create';
  serverId: string;
  target: string; // tool name, resource URI, prompt name
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  input?: any;
  output?: any;
  error?: string;
  progress?: number;
}

/**
 * MCP state interface
 */
export interface MCPState {
  // Server management
  servers: Record<string, MCPServerConfig>;
  connections: Record<string, MCPConnection>;
  activeConnections: string[];
  
  // Protocol entities
  tools: Record<string, MCPTool>;
  resources: Record<string, MCPResource>;
  prompts: Record<string, MCPPrompt>;
  
  // Operations and messaging
  activeOperations: Record<string, MCPOperation>;
  messageHistory: MCPMessage[];
  messageQueue: MCPMessage[];
  
  // Discovery and sync
  lastDiscovery: number;
  discoveryInProgress: boolean;
  autoDiscovery: boolean;
  discoveryInterval: number;
  
  // Filtering and search
  filters: {
    serverIds: string[];
    toolCategories: string[];
    resourceTypes: string[];
    promptCategories: string[];
    statuses: MCPConnection['status'][];
  };
  searchQuery: string;
  
  // UI state
  selectedServer: string | null;
  selectedTool: string | null;
  selectedResource: string | null;
  selectedPrompt: string | null;
  expandedSections: Record<string, boolean>;
  
  // Monitoring and analytics
  monitoring: {
    enabled: boolean;
    collectMetrics: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    retentionDays: number;
  };
  
  analytics: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    avgOperationTime: number;
    popularTools: { name: string; count: number }[];
    popularResources: { uri: string; count: number }[];
    errorFrequency: Record<string, number>;
  };
  
  // Configuration
  globalConfig: {
    defaultTimeout: number;
    maxConcurrentOperations: number;
    enableAutoReconnect: boolean;
    logMessages: boolean;
    cacheResources: boolean;
    maxCacheSize: number;
  };
  
  // Error handling
  error: string | null;
  warnings: string[];
  
  // Loading states
  isLoading: boolean;
  isConnecting: Record<string, boolean>;
  isDiscovering: boolean;
  
  // Statistics
  stats: {
    totalServers: number;
    activeServers: number;
    totalTools: number;
    totalResources: number;
    totalPrompts: number;
    uptime: number;
  };
}

/**
 * Initial state
 */
const initialState: MCPState = {
  servers: {},
  connections: {},
  activeConnections: [],
  
  tools: {},
  resources: {},
  prompts: {},
  
  activeOperations: {},
  messageHistory: [],
  messageQueue: [],
  
  lastDiscovery: 0,
  discoveryInProgress: false,
  autoDiscovery: true,
  discoveryInterval: 30000, // 30 seconds
  
  filters: {
    serverIds: [],
    toolCategories: [],
    resourceTypes: [],
    promptCategories: [],
    statuses: ['connected'],
  },
  searchQuery: '',
  
  selectedServer: null,
  selectedTool: null,
  selectedResource: null,
  selectedPrompt: null,
  expandedSections: {},
  
  monitoring: {
    enabled: true,
    collectMetrics: true,
    logLevel: 'info',
    retentionDays: 7,
  },
  
  analytics: {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    avgOperationTime: 0,
    popularTools: [],
    popularResources: [],
    errorFrequency: {},
  },
  
  globalConfig: {
    defaultTimeout: 30000,
    maxConcurrentOperations: 10,
    enableAutoReconnect: true,
    logMessages: true,
    cacheResources: true,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
  },
  
  error: null,
  warnings: [],
  
  isLoading: false,
  isConnecting: {},
  isDiscovering: false,
  
  stats: {
    totalServers: 0,
    activeServers: 0,
    totalTools: 0,
    totalResources: 0,
    totalPrompts: 0,
    uptime: 0,
  },
};

/**
 * Async thunks for MCP operations
 */

// Connect to MCP server
export const connectToServer = createAsyncThunk(
  'mcp/connectToServer',
  async (serverId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { mcp: MCPState };
      const server = state.mcp.servers[serverId];
      
      if (!server) {
        throw new Error('Server configuration not found');
      }
      
      // This would integrate with actual MCP client
      // For now, simulate connection
      const connection: MCPConnection = {
        id: `conn_${serverId}_${Date.now()}`,
        serverId,
        status: 'connected',
        startedAt: Date.now(),
        lastActivity: Date.now(),
        protocol: {
          version: '1.0.0',
          capabilities: server.capabilities,
          serverInfo: {
            name: server.name,
            version: server.version,
          },
        },
        stats: {
          messagesReceived: 0,
          messagesSent: 0,
          errors: 0,
          uptime: 0,
          avgResponseTime: 0,
        },
        reconnectAttempts: 0,
      };
      
      return connection;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to connect to server');
    }
  }
);

// Disconnect from MCP server
export const disconnectFromServer = createAsyncThunk(
  'mcp/disconnectFromServer',
  async (serverId: string, { rejectWithValue }) => {
    try {
      // This would integrate with actual MCP client
      // For now, just return success
      return { serverId, disconnectedAt: Date.now() };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to disconnect from server');
    }
  }
);

// Discover tools, resources, and prompts
export const discoverCapabilities = createAsyncThunk(
  'mcp/discoverCapabilities',
  async (serverId?: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { mcp: MCPState };
      const targetServers = serverId 
        ? [serverId] 
        : state.mcp.activeConnections;
      
      const discoveries = await Promise.all(
        targetServers.map(async (id) => {
          // This would integrate with actual MCP discovery
          // For now, return mock data
          return {
            serverId: id,
            tools: [] as MCPTool[],
            resources: [] as MCPResource[],
            prompts: [] as MCPPrompt[],
          };
        })
      );
      
      return discoveries;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to discover capabilities');
    }
  }
);

// Call MCP tool
export const callTool = createAsyncThunk(
  'mcp/callTool',
  async (payload: {
    serverId: string;
    toolName: string;
    arguments: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const { serverId, toolName, arguments: args } = payload;
      
      // This would integrate with actual MCP tool calling
      // For now, simulate operation
      const operation: MCPOperation = {
        id: `op_${Date.now()}`,
        type: 'tool_call',
        serverId,
        target: toolName,
        status: 'completed',
        startedAt: Date.now(),
        completedAt: Date.now() + 1000,
        input: args,
        output: { result: 'Mock tool execution result' },
      };
      
      return operation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to call tool');
    }
  }
);

// Read MCP resource
export const readResource = createAsyncThunk(
  'mcp/readResource',
  async (payload: {
    serverId: string;
    resourceUri: string;
  }, { rejectWithValue }) => {
    try {
      const { serverId, resourceUri } = payload;
      
      // This would integrate with actual MCP resource reading
      // For now, simulate operation
      const operation: MCPOperation = {
        id: `op_${Date.now()}`,
        type: 'resource_read',
        serverId,
        target: resourceUri,
        status: 'completed',
        startedAt: Date.now(),
        completedAt: Date.now() + 500,
        input: { uri: resourceUri },
        output: { 
          contents: [{ 
            uri: resourceUri, 
            mimeType: 'text/plain',
            text: 'Mock resource content'
          }]
        },
      };
      
      return operation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to read resource');
    }
  }
);

// Get MCP prompt
export const getPrompt = createAsyncThunk(
  'mcp/getPrompt',
  async (payload: {
    serverId: string;
    promptName: string;
    arguments?: Record<string, any>;
  }, { rejectWithValue }) => {
    try {
      const { serverId, promptName, arguments: args } = payload;
      
      // This would integrate with actual MCP prompt getting
      // For now, simulate operation
      const operation: MCPOperation = {
        id: `op_${Date.now()}`,
        type: 'prompt_get',
        serverId,
        target: promptName,
        status: 'completed',
        startedAt: Date.now(),
        completedAt: Date.now() + 200,
        input: { name: promptName, arguments: args },
        output: {
          description: 'Mock prompt description',
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: 'Mock prompt content' }
            }
          ]
        },
      };
      
      return operation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to get prompt');
    }
  }
);

// Add new server configuration
export const addServer = createAsyncThunk(
  'mcp/addServer',
  async (config: Omit<MCPServerConfig, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const server: MCPServerConfig = {
        ...config,
        id: `server_${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      return server;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add server');
    }
  }
);

/**
 * MCP slice
 */
export const mcpSlice = createSlice({
  name: 'mcp',
  initialState,
  reducers: {
    // Server management
    updateServer: (state, action: PayloadAction<{
      serverId: string;
      updates: Partial<MCPServerConfig>;
    }>) => {
      const { serverId, updates } = action.payload;
      if (state.servers[serverId]) {
        state.servers[serverId] = {
          ...state.servers[serverId],
          ...updates,
          updatedAt: Date.now(),
        };
      }
    },
    
    removeServer: (state, action: PayloadAction<string>) => {
      const serverId = action.payload;
      
      // Remove server
      delete state.servers[serverId];
      
      // Remove connection
      delete state.connections[serverId];
      
      // Remove from active connections
      state.activeConnections = state.activeConnections.filter(
        id => id !== serverId
      );
      
      // Remove related entities
      Object.keys(state.tools).forEach(key => {
        if (state.tools[key].serverId === serverId) {
          delete state.tools[key];
        }
      });
      
      Object.keys(state.resources).forEach(key => {
        if (state.resources[key].serverId === serverId) {
          delete state.resources[key];
        }
      });
      
      Object.keys(state.prompts).forEach(key => {
        if (state.prompts[key].serverId === serverId) {
          delete state.prompts[key];
        }
      });
      
      // Update stats
      state.stats.totalServers = Object.keys(state.servers).length;
      state.stats.activeServers = state.activeConnections.length;
    },
    
    // Connection management
    updateConnectionStatus: (state, action: PayloadAction<{
      serverId: string;
      status: MCPConnection['status'];
      error?: string;
    }>) => {
      const { serverId, status, error } = action.payload;
      
      if (state.connections[serverId]) {
        state.connections[serverId].status = status;
        state.connections[serverId].lastActivity = Date.now();
        
        if (error) {
          state.connections[serverId].error = error;
        }
        
        // Update active connections
        if (status === 'connected') {
          if (!state.activeConnections.includes(serverId)) {
            state.activeConnections.push(serverId);
          }
        } else {
          state.activeConnections = state.activeConnections.filter(
            id => id !== serverId
          );
        }
        
        state.stats.activeServers = state.activeConnections.length;
      }
    },
    
    updateConnectionStats: (state, action: PayloadAction<{
      serverId: string;
      stats: Partial<MCPConnection['stats']>;
    }>) => {
      const { serverId, stats } = action.payload;
      
      if (state.connections[serverId]) {
        state.connections[serverId].stats = {
          ...state.connections[serverId].stats,
          ...stats,
        };
      }
    },
    
    // Message handling
    addMessage: (state, action: PayloadAction<MCPMessage>) => {
      const message = action.payload;
      state.messageHistory.unshift(message);
      
      // Keep only last 1000 messages
      if (state.messageHistory.length > 1000) {
        state.messageHistory = state.messageHistory.slice(0, 1000);
      }
      
      // Update connection stats
      if (state.connections[message.serverId]) {
        if (message.direction === 'incoming') {
          state.connections[message.serverId].stats.messagesReceived++;
        } else {
          state.connections[message.serverId].stats.messagesSent++;
        }
        
        state.connections[message.serverId].lastActivity = message.timestamp;
      }
    },
    
    clearMessageHistory: (state) => {
      state.messageHistory = [];
    },
    
    // Operations
    updateOperation: (state, action: PayloadAction<{
      operationId: string;
      updates: Partial<MCPOperation>;
    }>) => {
      const { operationId, updates } = action.payload;
      
      if (state.activeOperations[operationId]) {
        state.activeOperations[operationId] = {
          ...state.activeOperations[operationId],
          ...updates,
        };
        
        // Remove completed operations
        if (updates.status && ['completed', 'failed', 'cancelled'].includes(updates.status)) {
          delete state.activeOperations[operationId];
          
          // Update analytics
          state.analytics.totalOperations++;
          if (updates.status === 'completed') {
            state.analytics.successfulOperations++;
          } else {
            state.analytics.failedOperations++;
          }
        }
      }
    },
    
    cancelOperation: (state, action: PayloadAction<string>) => {
      const operationId = action.payload;
      
      if (state.activeOperations[operationId]) {
        state.activeOperations[operationId].status = 'cancelled';
        delete state.activeOperations[operationId];
      }
    },
    
    // Selection
    selectServer: (state, action: PayloadAction<string | null>) => {
      state.selectedServer = action.payload;
    },
    
    selectTool: (state, action: PayloadAction<string | null>) => {
      state.selectedTool = action.payload;
      
      // Update usage stats
      if (action.payload && state.tools[action.payload]) {
        state.tools[action.payload].lastUsed = Date.now();
        state.tools[action.payload].usageCount++;
      }
    },
    
    selectResource: (state, action: PayloadAction<string | null>) => {
      state.selectedResource = action.payload;
      
      // Update access stats
      if (action.payload && state.resources[action.payload]) {
        state.resources[action.payload].lastAccessed = Date.now();
      }
    },
    
    selectPrompt: (state, action: PayloadAction<string | null>) => {
      state.selectedPrompt = action.payload;
      
      // Update usage stats
      if (action.payload && state.prompts[action.payload]) {
        state.prompts[action.payload].lastUsed = Date.now();
        state.prompts[action.payload].usageCount++;
      }
    },
    
    // UI state
    toggleSection: (state, action: PayloadAction<string>) => {
      const section = action.payload;
      state.expandedSections[section] = !state.expandedSections[section];
    },
    
    // Filters
    setFilters: (state, action: PayloadAction<Partial<MCPState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {
        serverIds: [],
        toolCategories: [],
        resourceTypes: [],
        promptCategories: [],
        statuses: ['connected'],
      };
      state.searchQuery = '';
    },
    
    // Configuration
    updateGlobalConfig: (state, action: PayloadAction<Partial<MCPState['globalConfig']>>) => {
      state.globalConfig = { ...state.globalConfig, ...action.payload };
    },
    
    updateMonitoring: (state, action: PayloadAction<Partial<MCPState['monitoring']>>) => {
      state.monitoring = { ...state.monitoring, ...action.payload };
    },
    
    // Discovery
    toggleAutoDiscovery: (state) => {
      state.autoDiscovery = !state.autoDiscovery;
    },
    
    setDiscoveryInterval: (state, action: PayloadAction<number>) => {
      state.discoveryInterval = action.payload;
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null;
    },
    
    addWarning: (state, action: PayloadAction<string>) => {
      if (!state.warnings.includes(action.payload)) {
        state.warnings.push(action.payload);
      }
    },
    
    clearWarnings: (state) => {
      state.warnings = [];
    },
    
    // Analytics
    updateAnalytics: (state, action: PayloadAction<Partial<MCPState['analytics']>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    
    resetAnalytics: (state) => {
      state.analytics = {
        totalOperations: 0,
        successfulOperations: 0,
        failedOperations: 0,
        avgOperationTime: 0,
        popularTools: [],
        popularResources: [],
        errorFrequency: {},
      };
    },
  },
  
  extraReducers: (builder) => {
    // Connect to server
    builder
      .addCase(connectToServer.pending, (state, action) => {
        const serverId = action.meta.arg;
        state.isConnecting[serverId] = true;
        state.error = null;
      })
      .addCase(connectToServer.fulfilled, (state, action) => {
        const connection = action.payload;
        const serverId = connection.serverId;
        
        state.connections[serverId] = connection;
        state.activeConnections.push(serverId);
        state.isConnecting[serverId] = false;
        
        state.stats.activeServers = state.activeConnections.length;
      })
      .addCase(connectToServer.rejected, (state, action) => {
        const serverId = action.meta.arg;
        state.isConnecting[serverId] = false;
        state.error = action.payload as string;
      });
    
    // Disconnect from server
    builder
      .addCase(disconnectFromServer.fulfilled, (state, action) => {
        const { serverId } = action.payload;
        
        delete state.connections[serverId];
        state.activeConnections = state.activeConnections.filter(
          id => id !== serverId
        );
        
        state.stats.activeServers = state.activeConnections.length;
      });
    
    // Discover capabilities
    builder
      .addCase(discoverCapabilities.pending, (state) => {
        state.isDiscovering = true;
      })
      .addCase(discoverCapabilities.fulfilled, (state, action) => {
        state.isDiscovering = false;
        state.lastDiscovery = Date.now();
        
        // Update entities from discovery results
        action.payload.forEach(discovery => {
          // Add tools
          discovery.tools.forEach(tool => {
            state.tools[`${tool.serverId}_${tool.name}`] = tool;
          });
          
          // Add resources
          discovery.resources.forEach(resource => {
            state.resources[resource.uri] = resource;
          });
          
          // Add prompts
          discovery.prompts.forEach(prompt => {
            state.prompts[`${prompt.serverId}_${prompt.name}`] = prompt;
          });
        });
        
        // Update stats
        state.stats.totalTools = Object.keys(state.tools).length;
        state.stats.totalResources = Object.keys(state.resources).length;
        state.stats.totalPrompts = Object.keys(state.prompts).length;
      })
      .addCase(discoverCapabilities.rejected, (state, action) => {
        state.isDiscovering = false;
        state.error = action.payload as string;
      });
    
    // Tool operations
    builder
      .addCase(callTool.pending, (state, action) => {
        const operation: MCPOperation = {
          id: `op_${Date.now()}`,
          type: 'tool_call',
          serverId: action.meta.arg.serverId,
          target: action.meta.arg.toolName,
          status: 'pending',
          startedAt: Date.now(),
          input: action.meta.arg.arguments,
        };
        
        state.activeOperations[operation.id] = operation;
      })
      .addCase(callTool.fulfilled, (state, action) => {
        const operation = action.payload;
        state.activeOperations[operation.id] = operation;
      })
      .addCase(callTool.rejected, (state, action) => {
        // Find and update the pending operation
        const operations = Object.values(state.activeOperations);
        const pendingOp = operations.find(op => 
          op.type === 'tool_call' && 
          op.status === 'pending'
        );
        
        if (pendingOp) {
          pendingOp.status = 'failed';
          pendingOp.error = action.payload as string;
          pendingOp.completedAt = Date.now();
        }
      });
    
    // Add server
    builder
      .addCase(addServer.fulfilled, (state, action) => {
        const server = action.payload;
        state.servers[server.id] = server;
        state.stats.totalServers = Object.keys(state.servers).length;
      });
  },
});

// Export actions
export const {
  updateServer,
  removeServer,
  updateConnectionStatus,
  updateConnectionStats,
  addMessage,
  clearMessageHistory,
  updateOperation,
  cancelOperation,
  selectServer,
  selectTool,
  selectResource,
  selectPrompt,
  toggleSection,
  setFilters,
  setSearchQuery,
  clearFilters,
  updateGlobalConfig,
  updateMonitoring,
  toggleAutoDiscovery,
  setDiscoveryInterval,
  clearError,
  addWarning,
  clearWarnings,
  updateAnalytics,
  resetAnalytics,
} = mcpSlice.actions;

// Export selectors
export const selectActiveServers = (state: { mcp: MCPState }) => 
  state.mcp.activeConnections.map(id => state.mcp.servers[id]).filter(Boolean);

export const selectConnectedServers = (state: { mcp: MCPState }) => 
  Object.values(state.mcp.connections).filter(conn => conn.status === 'connected');

export const selectAvailableTools = (state: { mcp: MCPState }) => {
  const { tools, filters, searchQuery } = state.mcp;
  let filtered = Object.values(tools);
  
  // Apply filters
  if (filters.serverIds.length > 0) {
    filtered = filtered.filter(tool => filters.serverIds.includes(tool.serverId));
  }
  
  if (filters.toolCategories.length > 0) {
    filtered = filtered.filter(tool => 
      tool.category && filters.toolCategories.includes(tool.category)
    );
  }
  
  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
};

export const selectAvailableResources = (state: { mcp: MCPState }) => {
  const { resources, filters, searchQuery } = state.mcp;
  let filtered = Object.values(resources);
  
  // Apply filters
  if (filters.serverIds.length > 0) {
    filtered = filtered.filter(resource => filters.serverIds.includes(resource.serverId));
  }
  
  if (filters.resourceTypes.length > 0) {
    filtered = filtered.filter(resource => 
      resource.mimeType && filters.resourceTypes.includes(resource.mimeType)
    );
  }
  
  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(resource => 
      resource.name.toLowerCase().includes(query) ||
      (resource.description && resource.description.toLowerCase().includes(query)) ||
      resource.uri.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};

export const selectAvailablePrompts = (state: { mcp: MCPState }) => {
  const { prompts, filters, searchQuery } = state.mcp;
  let filtered = Object.values(prompts);
  
  // Apply filters
  if (filters.serverIds.length > 0) {
    filtered = filtered.filter(prompt => filters.serverIds.includes(prompt.serverId));
  }
  
  if (filters.promptCategories.length > 0) {
    filtered = filtered.filter(prompt => 
      prompt.category && filters.promptCategories.includes(prompt.category)
    );
  }
  
  // Apply search
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(prompt => 
      prompt.name.toLowerCase().includes(query) ||
      (prompt.description && prompt.description.toLowerCase().includes(query)) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
};

export const selectActiveOperations = (state: { mcp: MCPState }) => 
  Object.values(state.mcp.activeOperations);

export const selectSelectedServer = (state: { mcp: MCPState }) => {
  const { selectedServer, servers } = state.mcp;
  return selectedServer ? servers[selectedServer] : null;
};

export const selectServerConnection = (serverId: string) => (state: { mcp: MCPState }) => 
  state.mcp.connections[serverId];

export const selectMCPStats = (state: { mcp: MCPState }) => state.mcp.stats;

export const selectMCPAnalytics = (state: { mcp: MCPState }) => state.mcp.analytics;

// Export reducer
export default mcpSlice.reducer;
