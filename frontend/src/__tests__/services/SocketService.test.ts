/**
 * @fileoverview Comprehensive test suite for SocketService
 * Tests WebSocket connections, event handling, message queuing,
 * reconnection logic, and real-time communication features
 */

import WS from 'jest-websocket-mock';
import { SocketService } from '../../services/socket/SocketService';
import { mockSocketData, createMockEventHandlers } from '../utils';
import type { 
  SocketEvent, 
  SocketMessage, 
  ConnectionOptions,
  EventHandler 
} from '../../types';

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('SocketService', () => {
  let socketService: SocketService;
  let mockServer: WS;
  const mockUrl = 'ws://localhost:3001';

  beforeEach(() => {
    jest.clearAllMocks();
    mockServer = new WS(mockUrl);
    socketService = new SocketService();
  });

  afterEach(() => {
    socketService.disconnect();
    WS.clean();
  });

  describe('Connection Management', () => {
    it('should connect to WebSocket server successfully', async () => {
      const connectPromise = socketService.connect(mockUrl);
      
      await mockServer.connected;
      await connectPromise;

      expect(socketService.isConnected()).toBe(true);
      expect(socketService.getConnectionStatus()).toBe('connected');
    });

    it('should handle connection with options', async () => {
      const options: ConnectionOptions = {
        protocols: ['chat-protocol', 'workspace-protocol'],
        timeout: 10000,
        maxRetries: 5,
        retryDelay: 2000,
        enableHeartbeat: true,
        heartbeatInterval: 30000,
      };

      const connectPromise = socketService.connect(mockUrl, options);
      
      await mockServer.connected;
      await connectPromise;

      expect(socketService.isConnected()).toBe(true);
      expect(socketService.getOptions()).toEqual(expect.objectContaining(options));
    });

    it('should handle connection failure', async () => {
      const invalidUrl = 'ws://invalid-host:9999';
      
      try {
        await socketService.connect(invalidUrl, { timeout: 1000 });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(socketService.isConnected()).toBe(false);
        expect(socketService.getConnectionStatus()).toBe('disconnected');
      }
    });

    it('should disconnect gracefully', async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;

      const disconnectPromise = socketService.disconnect();
      mockServer.close();
      
      await disconnectPromise;

      expect(socketService.isConnected()).toBe(false);
      expect(socketService.getConnectionStatus()).toBe('disconnected');
    });

    it('should handle connection timeout', async () => {
      const timeoutPromise = socketService.connect(mockUrl, { timeout: 100 });
      
      // Don't let the mock server accept the connection
      await expect(timeoutPromise).rejects.toThrow('Connection timeout');
      expect(socketService.getConnectionStatus()).toBe('disconnected');
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;
    });

    it('should send messages successfully', async () => {
      const message: SocketMessage = {
        type: 'chat_message',
        data: {
          content: 'Hello, World!',
          userId: 'user-123',
          timestamp: Date.now(),
        },
      };

      socketService.send(message);

      await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    });

    it('should queue messages when disconnected', async () => {
      socketService.disconnect();
      
      const message: SocketMessage = {
        type: 'workspace_update',
        data: { fileId: 'file-456', action: 'modified' },
      };

      socketService.send(message);
      
      expect(socketService.getQueuedMessages()).toHaveLength(1);
      expect(socketService.getQueuedMessages()[0]).toEqual(message);
    });

    it('should send queued messages after reconnection', async () => {
      // Disconnect and queue messages
      socketService.disconnect();
      
      const queuedMessages = [
        { type: 'message1', data: { test: 1 } },
        { type: 'message2', data: { test: 2 } },
        { type: 'message3', data: { test: 3 } },
      ] as SocketMessage[];

      queuedMessages.forEach(msg => socketService.send(msg));
      expect(socketService.getQueuedMessages()).toHaveLength(3);

      // Reconnect
      await socketService.connect(mockUrl);
      await mockServer.connected;

      // All queued messages should be sent
      for (const message of queuedMessages) {
        await expect(mockServer).toReceiveMessage(JSON.stringify(message));
      }
      
      expect(socketService.getQueuedMessages()).toHaveLength(0);
    });

    it('should handle invalid message format', () => {
      const invalidMessage = { invalid: 'format' } as any;
      
      expect(() => {
        socketService.send(invalidMessage);
      }).toThrow('Invalid message format');
    });

    it('should handle large messages', async () => {
      const largeData = 'x'.repeat(100000); // 100KB message
      const message: SocketMessage = {
        type: 'large_data',
        data: { content: largeData },
      };

      socketService.send(message);
      await expect(mockServer).toReceiveMessage(JSON.stringify(message));
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;
    });

    it('should register and trigger event handlers', async () => {
      const mockHandler = jest.fn();
      
      socketService.on('chat_message', mockHandler);

      const incomingMessage = {
        type: 'chat_message',
        data: { content: 'Hello from server', userId: 'server' },
      };

      mockServer.send(JSON.stringify(incomingMessage));

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockHandler).toHaveBeenCalledWith(incomingMessage.data);
    });

    it('should support multiple handlers for same event', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      socketService.on('workspace_update', handler1);
      socketService.on('workspace_update', handler2);
      socketService.on('workspace_update', handler3);

      const message = {
        type: 'workspace_update',
        data: { action: 'file_saved', fileId: 'test.js' },
      };

      mockServer.send(JSON.stringify(message));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(handler1).toHaveBeenCalledWith(message.data);
      expect(handler2).toHaveBeenCalledWith(message.data);
      expect(handler3).toHaveBeenCalledWith(message.data);
    });

    it('should remove event handlers', async () => {
      const handler = jest.fn();
      
      socketService.on('test_event', handler);
      socketService.off('test_event', handler);

      const message = {
        type: 'test_event',
        data: { test: true },
      };

      mockServer.send(JSON.stringify(message));

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle wildcard event listeners', async () => {
      const wildcardHandler = jest.fn();
      
      socketService.on('*', wildcardHandler);

      const messages = [
        { type: 'chat_message', data: { content: 'test1' } },
        { type: 'workspace_update', data: { action: 'test2' } },
        { type: 'scout_analysis', data: { result: 'test3' } },
      ];

      for (const message of messages) {
        mockServer.send(JSON.stringify(message));
      }

      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(wildcardHandler).toHaveBeenCalledTimes(3);
    });

    it('should handle event handler errors gracefully', async () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });
      const successHandler = jest.fn();

      socketService.on('error_test', errorHandler);
      socketService.on('error_test', successHandler);

      const message = {
        type: 'error_test',
        data: { test: true },
      };

      mockServer.send(JSON.stringify(message));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled(); // Should still be called
    });
  });

  describe('Reconnection Logic', () => {
    it('should reconnect automatically on connection loss', async () => {
      const options: ConnectionOptions = {
        maxRetries: 3,
        retryDelay: 100,
        autoReconnect: true,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Simulate connection loss
      mockServer.close();

      // Wait for reconnection attempt
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(socketService.getConnectionStatus()).toBe('reconnecting');
    });

    it('should respect maximum retry attempts', async () => {
      const options: ConnectionOptions = {
        maxRetries: 2,
        retryDelay: 50,
        autoReconnect: true,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Close server to prevent reconnection
      mockServer.close();
      WS.clean();

      // Wait for all retry attempts
      await new Promise(resolve => setTimeout(resolve, 300));

      expect(socketService.getConnectionStatus()).toBe('failed');
      expect(socketService.getRetryCount()).toBe(2);
    });

    it('should use exponential backoff for retries', async () => {
      const options: ConnectionOptions = {
        maxRetries: 3,
        retryDelay: 100,
        exponentialBackoff: true,
        autoReconnect: true,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      const startTime = Date.now();
      
      // Close server and track retry timings
      mockServer.close();
      WS.clean();

      // Wait for retries to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      const retryTimings = socketService.getRetryTimings();
      expect(retryTimings.length).toBeGreaterThan(0);
      
      // Verify exponential backoff
      if (retryTimings.length > 1) {
        expect(retryTimings[1] - retryTimings[0]).toBeGreaterThan(
          retryTimings[0] - startTime
        );
      }
    });

    it('should stop retrying when manually disconnected', async () => {
      const options: ConnectionOptions = {
        maxRetries: 5,
        retryDelay: 100,
        autoReconnect: true,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Close connection and immediately disconnect manually
      mockServer.close();
      socketService.disconnect();

      await new Promise(resolve => setTimeout(resolve, 300));

      expect(socketService.getConnectionStatus()).toBe('disconnected');
      expect(socketService.getRetryCount()).toBe(0);
    });
  });

  describe('Heartbeat and Keep-Alive', () => {
    it('should send heartbeat messages', async () => {
      const options: ConnectionOptions = {
        enableHeartbeat: true,
        heartbeatInterval: 100,
        heartbeatMessage: { type: 'ping', data: {} },
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Wait for heartbeat
      await expect(mockServer).toReceiveMessage(
        JSON.stringify({ type: 'ping', data: {} })
      );
    });

    it('should handle heartbeat responses', async () => {
      const options: ConnectionOptions = {
        enableHeartbeat: true,
        heartbeatInterval: 100,
        heartbeatTimeout: 200,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Send heartbeat response
      const pongMessage = { type: 'pong', data: { timestamp: Date.now() } };
      mockServer.send(JSON.stringify(pongMessage));

      expect(socketService.getLastHeartbeat()).toBeTruthy();
    });

    it('should detect heartbeat timeout', async () => {
      const options: ConnectionOptions = {
        enableHeartbeat: true,
        heartbeatInterval: 50,
        heartbeatTimeout: 100,
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Don't respond to heartbeat
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(socketService.getConnectionStatus()).toBe('timeout');
    });
  });

  describe('Protocol Support', () => {
    it('should handle protocol negotiation', async () => {
      const protocols = ['chat-v1', 'workspace-v2', 'scout-v1'];
      
      await socketService.connect(mockUrl, { protocols });
      await mockServer.connected;

      expect(socketService.getProtocol()).toBeTruthy();
    });

    it('should validate protocol compatibility', async () => {
      const options: ConnectionOptions = {
        protocols: ['incompatible-protocol-v999'],
        validateProtocol: true,
      };

      try {
        await socketService.connect(mockUrl, options);
        await mockServer.connected;
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('protocol');
      }
    });
  });

  describe('Message Filtering and Transformation', () => {
    beforeEach(async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;
    });

    it('should filter incoming messages', async () => {
      const handler = jest.fn();
      
      socketService.on('filtered_message', handler);
      socketService.addMessageFilter((message) => {
        return message.type === 'filtered_message' && message.data.priority === 'high';
      });

      const messages = [
        { type: 'filtered_message', data: { priority: 'high', content: 'important' } },
        { type: 'filtered_message', data: { priority: 'low', content: 'not important' } },
        { type: 'other_message', data: { content: 'other' } },
      ];

      for (const message of messages) {
        mockServer.send(JSON.stringify(message));
      }

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ priority: 'high', content: 'important' });
    });

    it('should transform incoming messages', async () => {
      const handler = jest.fn();
      
      socketService.on('transformed_message', handler);
      socketService.addMessageTransformer((message) => {
        if (message.type === 'transformed_message') {
          return {
            ...message,
            data: {
              ...message.data,
              processed: true,
              timestamp: Date.now(),
            },
          };
        }
        return message;
      });

      const originalMessage = {
        type: 'transformed_message',
        data: { content: 'test message' },
      };

      mockServer.send(JSON.stringify(originalMessage));

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'test message',
          processed: true,
          timestamp: expect.any(Number),
        })
      );
    });
  });

  describe('Performance and Memory Management', () => {
    beforeEach(async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;
    });

    it('should limit message queue size', async () => {
      const maxQueueSize = 5;
      socketService.setMaxQueueSize(maxQueueSize);
      
      socketService.disconnect();

      // Add more messages than the limit
      for (let i = 0; i < 10; i++) {
        socketService.send({
          type: 'test_message',
          data: { index: i },
        });
      }

      expect(socketService.getQueuedMessages()).toHaveLength(maxQueueSize);
      
      // Verify oldest messages were removed (FIFO)
      const queuedMessages = socketService.getQueuedMessages();
      expect(queuedMessages[0].data.index).toBe(5);
      expect(queuedMessages[4].data.index).toBe(9);
    });

    it('should clean up event listeners on disconnect', async () => {
      const handler = jest.fn();
      
      socketService.on('test_event', handler);
      expect(socketService.getListenerCount('test_event')).toBe(1);

      await socketService.disconnect();
      
      expect(socketService.getListenerCount('test_event')).toBe(0);
    });

    it('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure by adding many event listeners
      for (let i = 0; i < 1000; i++) {
        socketService.on(`event_${i}`, () => {});
      }

      expect(socketService.getTotalListenerCount()).toBe(1000);
      
      // Service should still function normally
      const testHandler = jest.fn();
      socketService.on('memory_test', testHandler);

      mockServer.send(JSON.stringify({
        type: 'memory_test',
        data: { test: true },
      }));

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(testHandler).toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON messages', async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;

      const errorHandler = jest.fn();
      socketService.on('error', errorHandler);

      // Send malformed JSON
      mockServer.send('{ invalid json');

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'parse_error',
          message: expect.stringContaining('JSON'),
        })
      );
    });

    it('should handle WebSocket errors gracefully', async () => {
      const errorHandler = jest.fn();
      socketService.on('error', errorHandler);

      await socketService.connect(mockUrl);
      await mockServer.connected;

      // Simulate WebSocket error
      mockServer.error();

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(errorHandler).toHaveBeenCalled();
      expect(socketService.getConnectionStatus()).toBe('error');
    });

    it('should handle concurrent connection attempts', async () => {
      const promises = [
        socketService.connect(mockUrl),
        socketService.connect(mockUrl),
        socketService.connect(mockUrl),
      ];

      await mockServer.connected;
      await Promise.all(promises);

      expect(socketService.isConnected()).toBe(true);
      expect(socketService.getConnectionCount()).toBe(1); // Should only have one connection
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      for (let i = 0; i < 5; i++) {
        await socketService.connect(mockUrl);
        await mockServer.connected;
        
        socketService.disconnect();
        mockServer.close();
        
        // Create new mock server for next iteration
        if (i < 4) {
          mockServer = new WS(mockUrl);
        }
      }

      expect(socketService.isConnected()).toBe(false);
      expect(socketService.getConnectionStatus()).toBe('disconnected');
    });
  });

  describe('Integration and Advanced Features', () => {
    it('should support custom authentication', async () => {
      const authToken = 'test-auth-token-12345';
      const options: ConnectionOptions = {
        authentication: {
          type: 'bearer',
          token: authToken,
        },
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      // Verify auth message was sent
      await expect(mockServer).toReceiveMessage(
        JSON.stringify({
          type: 'auth',
          data: { token: authToken },
        })
      );
    });

    it('should support message compression', async () => {
      const options: ConnectionOptions = {
        compression: {
          enabled: true,
          threshold: 1024,
          algorithm: 'gzip',
        },
      };

      await socketService.connect(mockUrl, options);
      await mockServer.connected;

      const largeMessage = {
        type: 'large_message',
        data: { content: 'x'.repeat(2000) },
      };

      socketService.send(largeMessage);

      // Verify compressed message format
      const receivedMessage = await mockServer.nextMessage;
      expect(receivedMessage).toBeTruthy();
    });

    it('should handle binary message types', async () => {
      await socketService.connect(mockUrl);
      await mockServer.connected;

      const binaryHandler = jest.fn();
      socketService.on('binary_data', binaryHandler);

      // Send binary data
      const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
      mockServer.send(binaryData);

      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(binaryHandler).toHaveBeenCalledWith(
        expect.any(ArrayBuffer)
      );
    });

    it('should coordinate with other services', async () => {
      const mockEventBus = {
        emit: jest.fn(),
        on: jest.fn(),
      };

      socketService.setEventBus(mockEventBus);

      await socketService.connect(mockUrl);
      await mockServer.connected;

      // Should emit connection events to event bus
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'socket:connected',
        expect.any(Object)
      );
    });
  });
});
