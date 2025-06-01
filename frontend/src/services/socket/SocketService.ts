/**
 * SocketService - WebSocket management for real-time communication
 * Handles connection, reconnection, and message routing for all socket-based features
 */

import { io, Socket } from 'socket.io-client';
import { SocketMessage, SocketError } from '../api/APITypes';

export interface SocketConfig {
  url: string;
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    maxReconnectionDelay?: number;
    timeout?: number;
  };
}

export type SocketEventHandler<T = any> = (data: T) => void;
export type SocketErrorHandler = (error: SocketError) => void;

export class SocketService {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private eventHandlers: Map<string, Set<SocketEventHandler>> = new Map();
  private errorHandlers: Set<SocketErrorHandler> = new Set();
  private connectionPromise: Promise<void> | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(config: SocketConfig) {
    this.config = {
      ...config,
      options: {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        maxReconnectionDelay: 5000,
        timeout: 10000,
        ...config.options,
      },
    };
    this.maxReconnectAttempts = this.config.options.reconnectionAttempts || 5;
  }

  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = io(this.config.url, this.config.options);
        
        // Connection successful
        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnecting = false;
          this.handleConnectionError(error);
          reject(new Error(`Socket connection failed: ${error.message}`));
        });

        // Disconnection handling
        this.socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          this.handleDisconnection(reason);
        });

        // Generic error handling
        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
          this.emitError({
            type: 'error',
            message: error.message || 'Socket error occurred',
            code: error.code,
            timestamp: new Date().toISOString(),
          });
        });

        // Start connection
        this.socket.connect();

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if socket is connected
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  get status(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this.isConnected) return 'connected';
    if (this.isConnecting) return 'connecting';
    if (this.socket && !this.socket.connected) return 'error';
    return 'disconnected';
  }

  /**
   * Send a message through the socket
   */
  async send<T>(event: string, data: T): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    if (!this.socket) {
      throw new Error('Socket not initialized');
    }

    const message: SocketMessage<T> = {
      type: event,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId(),
    };

    this.socket.emit(event, message);
  }

  /**
   * Send a message and wait for a response
   */
  async sendWithResponse<T, R>(
    event: string, 
    data: T, 
    responseEvent: string,
    timeout: number = 30000
  ): Promise<R> {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.off(responseEvent, responseHandler);
        reject(new Error(`Timeout waiting for ${responseEvent}`));
      }, timeout);

      const responseHandler = (response: R) => {
        clearTimeout(timeoutId);
        this.off(responseEvent, responseHandler);
        resolve(response);
      };

      this.on(responseEvent, responseHandler);
      this.send(event, data).catch(reject);
    });
  }

  /**
   * Subscribe to a socket event
   */
  on<T>(event: string, handler: SocketEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Register with actual socket if connected
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Unsubscribe from a socket event
   */
  off<T>(event: string, handler: SocketEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    // Unregister from actual socket if connected
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Subscribe to socket errors
   */
  onError(handler: SocketErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  /**
   * Unsubscribe from socket errors
   */
  offError(handler: SocketErrorHandler): void {
    this.errorHandlers.delete(handler);
  }

  /**
   * Join a room
   */
  async joinRoom(room: string): Promise<void> {
    await this.send('join_room', { room });
  }

  /**
   * Leave a room
   */
  async leaveRoom(room: string): Promise<void> {
    await this.send('leave_room', { room });
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    this.emitError({
      type: 'error',
      message: `Connection error: ${error.message}`,
      code: 'CONNECTION_ERROR',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle disconnection
   */
  private handleDisconnection(reason: string): void {
    console.log(`Socket disconnected: ${reason}`);
    
    // Attempt reconnection if not manual disconnect
    if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    }
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnection(): Promise<void> {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        await this.connect();
        console.log('Reconnection successful');
      } catch (error) {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnection();
        } else {
          this.emitError({
            type: 'error',
            message: 'Maximum reconnection attempts exceeded',
            code: 'MAX_RECONNECTIONS_EXCEEDED',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, delay);
  }

  /**
   * Emit error to all error handlers
   */
  private emitError(error: SocketError): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register all stored event handlers with the socket
   */
  private registerEventHandlers(): void {
    if (!this.socket) return;

    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket!.on(event, handler);
      });
    });
  }
}

// Export singleton instance
export const socketService = new SocketService({
  url: process.env.SOCKET_URL || 'http://localhost:8000',
});

export default socketService;
