// WebSocketService.ts - Handles WebSocket connections for real-time updates
import { SOCKET_URL } from '../config/api';
import { io, Socket } from 'socket.io-client';

export type MessageHandler = (data: any) => void;

/**
 * WebSocketService - Manages real-time WebSocket connections for various features
 * Supports chat streaming, resource monitoring, and agent updates
 */
class WebSocketService {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Initial delay in ms

  /**
   * Initialize and connect the WebSocket
   * @returns Promise that resolves when connection is established
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        resolve();
        return;
      }

      // Close existing socket if any
      if (this.socket) {
        this.socket.close();
      }

      // Create new socket connection
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      // Setup event handlers
      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts === 1) {
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      // Handle incoming messages by event type
      this.socket.onAny((eventName, ...args) => {
        const handlers = this.handlers.get(eventName);
        if (handlers) {
          handlers.forEach(handler => handler(args[0]));
        }
      });
    });
  }

  /**
   * Subscribe to a specific event
   * @param eventName - Name of the event to listen for
   * @param handler - Callback function to handle the event
   * @returns Function to unsubscribe
   */
  subscribe(eventName: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    
    const handlers = this.handlers.get(eventName)!;
    handlers.add(handler);
    
    // Auto-connect if not connected yet
    if (!this.socket || !this.socket.connected) {
      this.connect().catch(err => console.error('Failed to auto-connect:', err));
    }
    
    // Return unsubscribe function
    return () => {
      const handlersSet = this.handlers.get(eventName);
      if (handlersSet) {
        handlersSet.delete(handler);
        if (handlersSet.size === 0) {
          this.handlers.delete(eventName);
        }
      }
    };
  }

  /**
   * Emit an event to the server
   * @param eventName - Name of the event to emit
   * @param data - Data to send with the event
   * @returns Promise that resolves when server acknowledges
   */
  emit(eventName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        this.connect()
          .then(() => {
            this.socket!.emit(eventName, data, resolve);
          })
          .catch(reject);
      } else {
        this.socket.emit(eventName, data, resolve);
      }
    });
  }

  /**
   * Subscribe to streaming chat updates
   * @param sessionId - ID of the chat session to stream
   * @param onMessageChunk - Handler for each message chunk
   * @param onComplete - Handler for stream completion
   * @returns Function to unsubscribe
   */
  subscribeToStreamingChat(
    sessionId: string,
    onMessageChunk: (chunk: string) => void,
    onComplete: () => void
  ): () => void {
    const streamHandler = (data: any) => {
      if (data.type === 'chunk' && data.sessionId === sessionId) {
        onMessageChunk(data.content);
      } else if (data.type === 'end' && data.sessionId === sessionId) {
        onComplete();
      }
    };
    
    return this.subscribe('chat_stream', streamHandler);
  }

  /**
   * Subscribe to resource metric updates
   * @param onMetricsUpdate - Handler for metric updates
   * @returns Function to unsubscribe
   */
  subscribeToSystemMetrics(onMetricsUpdate: (metrics: any) => void): () => void {
    return this.subscribe('system_metrics', onMetricsUpdate);
  }

  /**
   * Subscribe to Scout agent project updates
   * @param projectId - ID of the project to monitor
   * @param onProjectUpdate - Handler for project updates
   * @returns Function to unsubscribe
   */
  subscribeToProjectUpdates(
    projectId: string,
    onProjectUpdate: (update: any) => void
  ): () => void {
    const projectHandler = (data: any) => {
      if (data.projectId === projectId) {
        onProjectUpdate(data);
      }
    };
    
    return this.subscribe('project_update', projectHandler);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.handlers.clear();
  }
}

// Export a singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
