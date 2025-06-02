import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatSession } from './chatApi';

// Define all the event types for our socket
export interface PodplaySocketEvents {
  // Connection events
  'connect': () => void;
  'disconnect': () => void;
  'reconnect': (attemptNumber: number) => void;
  'error': (error: Error) => void;
  
  // Chat events
  'message:new': (message: ChatMessage, sessionId: string) => void;
  'message:typing': (sessionId: string, isTyping: boolean) => void;
  'message:read': (sessionId: string, messageId: string, userId: string) => void;
  'session:updated': (session: ChatSession) => void;
  'session:deleted': (sessionId: string) => void;
  
  // Workspace events
  'workspace:updated': (workspaceId: string, data: any) => void;
  'file:created': (workspaceId: string, filePath: string, data: any) => void;
  'file:updated': (workspaceId: string, filePath: string, data: any) => void;
  'file:deleted': (workspaceId: string, filePath: string) => void;
  
  // Agent events
  'agent:thinking': (agentId: string, status: string) => void;
  'agent:action': (agentId: string, action: string, data: any) => void;
  'agent:complete': (agentId: string, result: any) => void;
  
  // Status events
  'system:status': (status: { cpu: number, memory: number, storage: number }) => void;
  
  // Window management events
  'window:created': (data: { windowId: string, data: any }) => void;
  'window:closed': (data: { windowId: string }) => void;
  'window:minimized': (data: { windowId: string }) => void;
  'window:maximized': (data: { windowId: string }) => void;
  'window:restored': (data: { windowId: string }) => void;
  'window:focused': (data: { windowId: string }) => void;
  'window:position_updated': (data: { windowId: string, position: any }) => void;
  'window:size_updated': (data: { windowId: string, size: any }) => void;
  'windows:arranged': (data: { arrangement: string, windows: any[] }) => void;
  'window:layout_saved': (data: { layout: any }) => void;
  'window:layout_loaded': (data: { layout: any }) => void;
  'windows:state': (data: { windows: any[] }) => void;
}

// Define a type for our socket that includes the correct events
type PodplaySocket = Socket<PodplaySocketEvents, PodplaySocketEvents>;

class SocketService {
  private socket: PodplaySocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private retryCount: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  
  // Initialize the socket connection
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected');
        resolve();
        return;
      }
      
      // Get WebSocket URL from environment variable or use default
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
      
      // Connect to the socket server with auth token if provided
      this.socket = io(wsUrl, {
        auth: token ? { token } : undefined,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      }) as PodplaySocket;
      
      // Set up basic event handlers
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.retryCount = 0;
        this.notifyListeners('connect');
        resolve();
      });
      
      this.socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        this.notifyListeners('disconnect');
      });
      
      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        this.notifyListeners('reconnect', attemptNumber);
      });
      
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        this.notifyListeners('error', error);
        reject(error);
      });
      
      // Connect to the server
      this.socket.connect();
      
      // Set up event handlers for all defined events
      Object.keys(this.listeners).forEach(event => {
        if (this.socket) {
          this.socket.on(event as keyof PodplaySocketEvents, (...args: any[]) => {
            this.notifyListeners(event, ...args);
          });
        }
      });
    });
  }
  
  // Disconnect from the socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Emit an event to the server
  emit<T extends keyof PodplaySocketEvents>(
    event: T,
    ...args: Parameters<PodplaySocketEvents[T]>
  ): void {
    if (!this.socket) {
      console.warn(`Tried to emit ${event} but socket is not connected`);
      return;
    }
    
    this.socket.emit(event, ...args);
  }
  
  // Listen for an event from the server
  on<T extends keyof PodplaySocketEvents>(
    event: T,
    callback: PodplaySocketEvents[T]
  ): void {
    // First, register with our internal listener map for reconnection support
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }
    
    const eventListeners = this.listeners.get(event as string);
    eventListeners?.add(callback as Function);
    
    // Then register with the socket if it exists
    if (this.socket) {
      // Using type assertion to work around Socket.io's type constraints
      // This is safe because we're ensuring the callback signature matches our event definitions
      this.socket.on(event, callback as any);
    }
  }
  
  // Remove an event listener
  off<T extends keyof PodplaySocketEvents>(
    event: T, 
    callback: PodplaySocketEvents[T]
  ): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback as Function);
    }
  }
  
  // Notify all listeners for an event
  private notifyListeners(event: string, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }
  
  // Check if the socket is connected
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
  
  // Get socket instance (for advanced usage)
  getSocket(): PodplaySocket | null {
    return this.socket;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;