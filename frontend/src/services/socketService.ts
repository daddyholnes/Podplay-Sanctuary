import { io, Socket } from 'socket.io-client';
import useAppStore from '../store/useAppStore';

// Types
export interface SocketMessage {
  type: string;
  payload: any;
}

// Events we listen for from the server
export enum SocketInEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  CHAT_MESSAGE = 'chat_message',
  AGENT_ACTION = 'agent_action',
  WORKSPACE_UPDATE = 'workspace_update',
  FILE_CREATED = 'file_created',
  FILE_UPDATED = 'file_updated',
  FILE_DELETED = 'file_deleted',
  MODEL_STATUS = 'model_status',
  SYSTEM_STATUS = 'system_status',
}

// Events we emit to the server
export enum SocketOutEvent {
  CHAT_MESSAGE = 'chat_message',
  REQUEST_AGENT_ACTION = 'request_agent_action',
  CREATE_WORKSPACE = 'create_workspace',
  UPDATE_WORKSPACE = 'update_workspace',
  DELETE_WORKSPACE = 'delete_workspace',
  CREATE_FILE = 'create_file',
  UPDATE_FILE = 'update_file',
  DELETE_FILE = 'delete_file',
}

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // Connect to the Socket.IO server
  connect(url: string = 'http://localhost:5000'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        console.log('Socket already connected');
        resolve();
        return;
      }
      
      this.connectionAttempts = 0;
      this.socket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });
      
      // Setup event handlers
      this.socket.on(SocketInEvent.CONNECT, () => {
        console.log('Socket connected');
        this.connectionAttempts = 0;
        resolve();
      });
      
      this.socket.on(SocketInEvent.ERROR, (error) => {
        console.error('Socket error:', error);
        reject(error);
      });
      
      this.socket.on(SocketInEvent.DISCONNECT, (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        this.handleDisconnect(reason);
      });
      
      // Setup handlers for all registered events
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach(handler => {
          this.socket?.on(event, handler);
        });
      });
    });
  }
  
  // Handle socket disconnection
  private handleDisconnect(reason: string) {
    const appStore = useAppStore.getState();
    
    if (
      reason === 'io server disconnect' || 
      reason === 'transport close' ||
      reason === 'ping timeout'
    ) {
      this.connectionAttempts++;
      
      if (this.connectionAttempts <= this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${this.connectionAttempts}/${this.maxReconnectAttempts})...`);
        this.reconnectTimer = setTimeout(() => {
          this.socket?.connect();
        }, this.reconnectDelay * this.connectionAttempts);
      } else {
        console.error('Maximum reconnect attempts reached. Connection failed.');
        // Update global state to show connection error
        appStore.checkApiStatus();
      }
    }
  }
  
  // Disconnect from the server
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Subscribe to an event
  on(event: SocketInEvent, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    
    this.eventHandlers.get(event)?.add(handler);
    this.socket?.on(event, handler);
  }
  
  // Unsubscribe from an event
  off(event: SocketInEvent, handler: (data: any) => void): void {
    const handlers = this.eventHandlers.get(event);
    
    if (handlers) {
      handlers.delete(handler);
      this.socket?.off(event, handler);
      
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }
  
  // Send a message to the server
  emit(event: SocketOutEvent, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected. Cannot emit event:', event);
      throw new Error('Socket not connected');
    }
  }
  
  // Check if the socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create and export a singleton instance
export const socketService = new SocketService();
export default socketService;