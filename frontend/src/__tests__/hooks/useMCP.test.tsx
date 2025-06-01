/**
 * @fileoverview Comprehensive test suite for MCP (Model Context Protocol) hooks
 * Tests server connections, tool management, resource handling,
 * capability discovery, and protocol communication
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WS from 'jest-websocket-mock';
import { useMCP, useServerManager, useTools } from '../../hooks/mcp';
import { mcpSlice } from '../../store/slices/mcpSlice';
import { mockMCPData, mockServerData, mockToolData } from '../utils';
import type { 
  MCPServer, 
  MCPTool, 
  MCPResource,
  ServerConnection,
  ToolDefinition,
  ProtocolMessage 
} from '../../types';

// Mock dependencies
jest.mock('../../services/api/ApiService');
jest.mock('../../services/socket/SocketService');

// Test store setup
const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      mcp: mcpSlice.reducer,
    },
    preloadedState: {
      mcp: {
        servers: {
          available: [],
          connected: [],
          connecting: [],
          failed: [],
        },
        tools: {
          available: [],
          loaded: [],
          executing: [],
          error: null,
        },
        resources: {
          available: [],
          loaded: {},
          loading: [],
          error: null,
        },
        protocol: {
          version: '1.0.0',
          capabilities: {},
          error: null,
        },
        settings: {
          autoConnect: true,
          timeout: 30000,
          retryAttempts: 3,
          enableLogging: true,
        },
        ...initialState,
      },
    },
  });

// Test wrapper component
const TestWrapper: React.FC<{ 
  children: React.ReactNode; 
  store?: ReturnType<typeof createTestStore>;
}> = ({ children, store = createTestStore() }) => (
  <Provider store={store}>
    {children}
  </Provider>
);

describe('useMCP Hook', () => {
  let mockServer: WS;
  const mockApiService = {
    request: jest.fn(),
    upload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = new WS('ws://localhost:3001');
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    WS.clean();
  });

  describe('Server Management', () => {
    it('should connect to MCP server successfully', async () => {
      const mockServerConfig: MCPServer = mockServerData.localServer;

      mockApiService.request.mockResolvedValue({
        data: { 
          connection: { 
            id: 'conn-123', 
            serverId: mockServerConfig.id, 
            status: 'connected' 
          } 
        },
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.connectToServer(mockServerConfig);
      });

      expect(result.current.servers.connected).toContainEqual(
        expect.objectContaining({
          id: mockServerConfig.id,
          status: 'connected',
        })
      );
      expect(result.current.servers.connecting).toHaveLength(0);
    });

    it('should handle server connection failure', async () => {
      const mockServer: MCPServer = mockServerData.remoteServer;
      const connectionError = new Error('Connection timeout');

      mockApiService.request.mockRejectedValue(connectionError);

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        try {
          await result.current.connectToServer(mockServer);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.servers.failed).toContainEqual(
        expect.objectContaining({
          id: mockServer.id,
          error: connectionError.message,
        })
      );
      expect(result.current.servers.connected).toHaveLength(0);
    });

    it('should disconnect from server gracefully', async () => {
      const store = createTestStore({
        servers: {
          connected: [mockServerData.localServer],
          available: [mockServerData.localServer],
          connecting: [],
          failed: [],
        },
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
      });

      mockApiService.request.mockResolvedValue({
        data: { success: true },
        success: true,
      });

      await act(async () => {
        await result.current.disconnectFromServer(mockServerData.localServer.id);
      });

      expect(result.current.servers.connected).toHaveLength(0);
      expect(result.current.servers.available).toContainEqual(
        expect.objectContaining({ id: mockServerData.localServer.id })
      );
    });

    it('should discover available servers', async () => {
      const mockDiscoveredServers = [
        mockServerData.localServer,
        mockServerData.remoteServer,
        mockServerData.customServer,
      ];

      mockApiService.request.mockResolvedValue({
        data: { servers: mockDiscoveredServers },
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.discoverServers();
      });

      expect(result.current.servers.available).toEqual(mockDiscoveredServers);
    });

    it('should handle server capability negotiation', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const capabilityMessage: ProtocolMessage = {
        type: 'capabilities',
        data: {
          version: '1.0.0',
          capabilities: {
            tools: ['execute', 'list', 'describe'],
            resources: ['read', 'list', 'search'],
            notifications: ['progress', 'log'],
          },
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(capabilityMessage));
      });

      expect(result.current.protocol.capabilities).toEqual(capabilityMessage.data.capabilities);
      expect(result.current.protocol.version).toBe('1.0.0');
    });
  });

  describe('Tool Management', () => {
    it('should load available tools from server', async () => {
      const mockTools: MCPTool[] = mockToolData.availableTools;

      mockApiService.request.mockResolvedValue({
        data: { tools: mockTools },
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.loadTools('server-123');
      });

      expect(result.current.tools.available).toEqual(mockTools);
      expect(result.current.tools.error).toBeNull();
    });

    it('should execute tool with parameters', async () => {
      const mockTool: MCPTool = mockToolData.fileSystemTool;
      const mockExecutionResult = {
        output: 'File created successfully',
        success: true,
        metadata: { fileSize: 1024, path: '/tmp/test.txt' },
      };

      mockApiService.request.mockResolvedValue({
        data: mockExecutionResult,
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const toolParams = {
        action: 'create',
        path: '/tmp/test.txt',
        content: 'Hello, World!',
      };

      await act(async () => {
        await result.current.executeTool(mockTool.id, toolParams);
      });

      expect(mockApiService.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(`/tools/${mockTool.id}/execute`),
          data: { parameters: toolParams },
        })
      );
    });

    it('should handle tool execution with streaming results', async () => {
      const mockTool: MCPTool = mockToolData.codeAnalysisTool;

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Start tool execution
      act(() => {
        result.current.executeTool(mockTool.id, { 
          file: 'src/components/Chat.tsx',
          analysis: 'comprehensive' 
        });
      });

      // Simulate streaming results
      const streamingUpdate = {
        type: 'tool_output',
        data: {
          toolId: mockTool.id,
          chunk: 'Analyzing component structure...',
          progress: 25,
          isComplete: false,
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(streamingUpdate));
      });

      expect(result.current.tools.executing).toContainEqual(
        expect.objectContaining({
          toolId: mockTool.id,
          progress: 25,
        })
      );
    });

    it('should validate tool parameters', async () => {
      const mockTool: MCPTool = mockToolData.webScrapeTool;
      
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Invalid parameters (missing required URL)
      const invalidParams = { timeout: 5000 };

      await act(async () => {
        try {
          await result.current.executeTool(mockTool.id, invalidParams);
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toContain('validation');
        }
      });

      expect(result.current.tools.error).toContain('validation');
    });

    it('should cancel tool execution', async () => {
      const mockTool: MCPTool = mockToolData.longRunningTool;

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Start execution
      act(() => {
        result.current.executeTool(mockTool.id, { duration: 60000 });
      });

      expect(result.current.tools.executing).toHaveLength(1);

      // Cancel execution
      act(() => {
        result.current.cancelToolExecution(mockTool.id);
      });

      expect(result.current.tools.executing).toHaveLength(0);
    });
  });

  describe('Resource Management', () => {
    it('should load resource from server', async () => {
      const mockResource: MCPResource = mockMCPData.textResource;

      mockApiService.request.mockResolvedValue({
        data: mockResource,
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.loadResource(mockResource.uri);
      });

      expect(result.current.resources.loaded[mockResource.uri]).toEqual(mockResource);
      expect(result.current.resources.loading).not.toContain(mockResource.uri);
    });

    it('should search resources by query', async () => {
      const mockSearchResults = [
        mockMCPData.textResource,
        mockMCPData.imageResource,
        mockMCPData.jsonResource,
      ];

      mockApiService.request.mockResolvedValue({
        data: { resources: mockSearchResults },
        success: true,
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.searchResources({
          query: 'user data',
          type: 'text',
          limit: 10,
        });
      });

      expect(result.current.resources.available).toEqual(mockSearchResults);
    });

    it('should handle resource streaming', async () => {
      const mockResource: MCPResource = mockMCPData.largeDataResource;

      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Start loading resource
      act(() => {
        result.current.loadResource(mockResource.uri);
      });

      // Simulate streaming chunks
      const streamChunk = {
        type: 'resource_chunk',
        data: {
          uri: mockResource.uri,
          chunk: 'partial data chunk...',
          offset: 1024,
          total: 10240,
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(streamChunk));
      });

      expect(result.current.resources.loading).toContain(mockResource.uri);
    });

    it('should cache frequently accessed resources', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const resourceUri = 'mcp://server/data/user-preferences.json';

      // First load
      await act(async () => {
        await result.current.loadResource(resourceUri);
      });

      // Second load should use cache
      await act(async () => {
        await result.current.loadResource(resourceUri);
      });

      // API should only be called once due to caching
      expect(mockApiService.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Protocol Communication', () => {
    it('should handle protocol version negotiation', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const versionNegotiation = {
        type: 'protocol_version',
        data: {
          clientVersion: '1.0.0',
          serverVersion: '1.1.0',
          compatibleVersion: '1.0.0',
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(versionNegotiation));
      });

      expect(result.current.protocol.version).toBe('1.0.0');
    });

    it('should handle protocol errors gracefully', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const protocolError = {
        type: 'protocol_error',
        data: {
          code: 'INVALID_MESSAGE',
          message: 'Malformed protocol message',
          details: { messageId: 'msg-123' },
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(protocolError));
      });

      expect(result.current.protocol.error).toContain('INVALID_MESSAGE');
    });

    it('should maintain message queue during disconnection', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Queue messages while disconnected
      act(() => {
        result.current.sendMessage({
          type: 'tool_request',
          data: { toolId: 'test-tool', parameters: {} },
        });
      });

      expect(result.current.messageQueue).toHaveLength(1);

      // Messages should be sent when reconnected
      await act(async () => {
        await result.current.connectToServer(mockServerData.localServer);
      });

      expect(result.current.messageQueue).toHaveLength(0);
    });
  });

  describe('Settings and Configuration', () => {
    it('should update MCP settings', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const newSettings = {
        autoConnect: false,
        timeout: 60000,
        retryAttempts: 5,
        enableLogging: false,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings).toEqual(
        expect.objectContaining(newSettings)
      );
    });

    it('should persist settings to localStorage', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      const settings = { autoConnect: false };

      act(() => {
        result.current.updateSettings(settings);
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mcp_settings',
        JSON.stringify(expect.objectContaining(settings))
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle server disconnection gracefully', async () => {
      const store = createTestStore({
        servers: { connected: [mockServerData.localServer] },
      });

      const { result } = renderHook(() => useMCP(), {
        wrapper: ({ children }) => <TestWrapper store={store}>{children}</TestWrapper>,
      });

      // Simulate server disconnection
      act(() => {
        mockServer.close();
      });

      await waitFor(() => {
        expect(result.current.servers.connected).toHaveLength(0);
        expect(result.current.connectionStatus).toBe('disconnected');
      });
    });

    it('should retry failed connections', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      mockApiService.request
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Still failing'))
        .mockResolvedValue({
          data: { connection: { status: 'connected' } },
          success: true,
        });

      await act(async () => {
        await result.current.connectToServer(mockServerData.localServer);
      });

      expect(mockApiService.request).toHaveBeenCalledTimes(3);
      expect(result.current.servers.connected).toHaveLength(1);
    });

    it('should handle malformed protocol messages', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Send malformed JSON
      await act(async () => {
        mockServer.send('invalid json{');
      });

      expect(result.current.protocol.error).toContain('parse');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete MCP workflow', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // Step 1: Connect to server
      await act(async () => {
        await result.current.connectToServer(mockServerData.localServer);
      });

      expect(result.current.servers.connected).toHaveLength(1);

      // Step 2: Load tools
      await act(async () => {
        await result.current.loadTools(mockServerData.localServer.id);
      });

      expect(result.current.tools.available.length).toBeGreaterThan(0);

      // Step 3: Execute tool
      await act(async () => {
        await result.current.executeTool(
          result.current.tools.available[0].id,
          { test: 'parameter' }
        );
      });

      // Step 4: Load resource
      await act(async () => {
        await result.current.loadResource('mcp://server/test/resource');
      });

      expect(Object.keys(result.current.resources.loaded)).toHaveLength(1);
    });

    it('should coordinate with other application features', async () => {
      const { result } = renderHook(() => useMCP(), {
        wrapper: TestWrapper,
      });

      // MCP tool execution should trigger UI updates
      const uiUpdateMessage = {
        type: 'ui_update',
        data: {
          component: 'ChatWindow',
          action: 'scroll_to_bottom',
          metadata: { messageId: 'msg-456' },
        },
      };

      await act(async () => {
        mockServer.send(JSON.stringify(uiUpdateMessage));
      });

      expect(result.current.uiUpdates).toContainEqual(
        expect.objectContaining({
          component: 'ChatWindow',
          action: 'scroll_to_bottom',
        })
      );
    });
  });
});

describe('useServerManager Hook', () => {
  it('should provide server management functionality', async () => {
    const { result } = renderHook(() => useServerManager(), {
      wrapper: TestWrapper,
    });

    expect(result.current.addServer).toBeDefined();
    expect(result.current.removeServer).toBeDefined();
    expect(result.current.connectServer).toBeDefined();
    expect(result.current.disconnectServer).toBeDefined();
  });

  it('should manage server configurations', async () => {
    const { result } = renderHook(() => useServerManager(), {
      wrapper: TestWrapper,
    });

    const serverConfig = {
      name: 'Custom Server',
      url: 'ws://localhost:4000',
      capabilities: ['tools', 'resources'],
    };

    act(() => {
      result.current.addServer(serverConfig);
    });

    expect(result.current.servers).toContainEqual(
      expect.objectContaining(serverConfig)
    );
  });
});

describe('useTools Hook', () => {
  it('should provide tool management functionality', async () => {
    const { result } = renderHook(() => useTools(), {
      wrapper: TestWrapper,
    });

    expect(result.current.executeTool).toBeDefined();
    expect(result.current.getToolDefinition).toBeDefined();
    expect(result.current.validateParameters).toBeDefined();
  });

  it('should validate tool parameters against schema', async () => {
    const { result } = renderHook(() => useTools(), {
      wrapper: TestWrapper,
    });

    const toolDef: ToolDefinition = {
      id: 'test-tool',
      name: 'Test Tool',
      description: 'A test tool',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          age: { type: 'number', minimum: 0 },
        },
      },
    };

    const validParams = { name: 'John', age: 30 };
    const invalidParams = { age: -5 };

    expect(result.current.validateParameters(toolDef, validParams)).toBe(true);
    expect(result.current.validateParameters(toolDef, invalidParams)).toBe(false);
  });
});
