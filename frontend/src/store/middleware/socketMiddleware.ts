/**
 * Socket Middleware
 * 
 * Redux middleware for handling WebSocket connections, real-time events,
 * automatic reconnection, and state synchronization
 */

import { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { SocketService } from '../../services/socket/SocketService';
import { ChatSocketService } from '../../services/socket/ChatSocketService';
import { WorkspaceSocketService } from '../../services/socket/WorkspaceSocketService';
import { ScoutSocketService } from '../../services/socket/ScoutSocketService';
import { setLoadingState, showNotification } from '../slices/uiSlice';

// ============================================================================
// Types & Constants
// ============================================================================

export interface SocketAction extends AnyAction {
  type: string;
  payload?: any;
  meta?: {
    socket?: {
      type: 'connect' | 'disconnect' | 'emit' | 'subscribe' | 'unsubscribe';
      service?: 'main' | 'chat' | 'workspace' | 'scout';
      event?: string;
      data?: any;
      room?: string;
      namespace?: string;
      options?: {
        timeout?: number;
        retries?: number;
        persistent?: boolean;
        priority?: 'low' | 'normal' | 'high';
      };
    };
  };
}

const SOCKET_CONNECT = 'SOCKET_CONNECT';
const SOCKET_DISCONNECT = 'SOCKET_DISCONNECT';
const SOCKET_CONNECTED = 'SOCKET_CONNECTED';
const SOCKET_DISCONNECTED = 'SOCKET_DISCONNECTED';
const SOCKET_ERROR = 'SOCKET_ERROR';
const SOCKET_EMIT = 'SOCKET_EMIT';
const SOCKET_SUBSCRIBE = 'SOCKET_SUBSCRIBE';
const SOCKET_UNSUBSCRIBE = 'SOCKET_UNSUBSCRIBE';
const SOCKET_MESSAGE = 'SOCKET_MESSAGE';

// ============================================================================
// Service Manager
// ============================================================================

class SocketServiceManager {
  private services = new Map<string, SocketService>();
  private eventHandlers = new Map<string, Function[]>();
  private store: MiddlewareAPI<Dispatch<AnyAction>, RootState> | null = null;

  initialize(store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) {
    this.store = store;
    this.setupServices();
  }

  private setupServices() {
    // Main socket service
    const mainService = SocketService.getInstance();
    this.services.set('main', mainService);

    // Specialized services
    const chatService = ChatSocketService.getInstance();
    const workspaceService = WorkspaceSocketService.getInstance();
    const scoutService = ScoutSocketService.getInstance();

    this.services.set('chat', chatService);
    this.services.set('workspace', workspaceService);
    this.services.set('scout', scoutService);

    // Setup event listeners for all services
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.services.forEach((service, serviceName) => {
      // Connection events
      service.on('connect', () => {
        this.dispatchAction({
          type: SOCKET_CONNECTED,
          payload: { service: serviceName },
        });
      });

      service.on('disconnect', (reason: string) => {
        this.dispatchAction({
          type: SOCKET_DISCONNECTED,
          payload: { service: serviceName, reason },
        });
      });

      service.on('error', (error: any) => {
        this.dispatchAction({
          type: SOCKET_ERROR,
          payload: { service: serviceName, error },
        });
      });

      // Reconnection events
      service.on('reconnecting', (attempt: number) => {
        this.dispatchAction({
          type: 'SOCKET_RECONNECTING',
          payload: { service: serviceName, attempt },
        });
      });

      service.on('reconnect', (attempt: number) => {
        this.dispatchAction({
          type: 'SOCKET_RECONNECTED',
          payload: { service: serviceName, attempt },
        });
      });

      service.on('reconnect_failed', () => {
        this.dispatchAction({
          type: 'SOCKET_RECONNECT_FAILED',
          payload: { service: serviceName },
        });
      });

      // Custom message handler
      service.on('message', (data: any) => {
        this.handleMessage(serviceName, data);
      });
    });
  }

  private dispatchAction(action: AnyAction) {
    if (this.store) {
      this.store.dispatch(action);
    }
  }

  private handleMessage(serviceName: string, data: any) {
    const { event, payload, metadata } = data;
    
    // Dispatch generic socket message
    this.dispatchAction({
      type: SOCKET_MESSAGE,
      payload: {
        service: serviceName,
        event,
        data: payload,
        metadata,
        timestamp: Date.now(),
      },
    });

    // Dispatch specific event
    if (event) {
      this.dispatchAction({
        type: `SOCKET_${event.toUpperCase()}`,
        payload: {
          service: serviceName,
          data: payload,
          metadata,
          timestamp: Date.now(),
        },
      });
    }

    // Handle registered event handlers
    const eventKey = `${serviceName}:${event}`;
    const handlers = this.eventHandlers.get(eventKey) || [];
    handlers.forEach(handler => {
      try {
        handler(payload, metadata);
      } catch (error) {
        console.error(`Error in socket event handler for ${eventKey}:`, error);
      }
    });
  }

  getService(name: string): SocketService | undefined {
    return this.services.get(name);
  }

  connect(serviceName: string, options?: any): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Socket service '${serviceName}' not found`);
    }

    return service.connect(options);
  }

  disconnect(serviceName: string): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.disconnect();
    }
  }

  emit(serviceName: string, event: string, data?: any, options?: any): Promise<any> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Socket service '${serviceName}' not found`);
    }

    return service.emit(event, data, options);
  }

  subscribe(serviceName: string, event: string, handler?: Function): void {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Socket service '${serviceName}' not found`);
    }

    service.on(event, handler || ((data: any) => {
      this.handleMessage(serviceName, { event, payload: data });
    }));

    // Store handler for cleanup
    if (handler) {
      const eventKey = `${serviceName}:${event}`;
      const handlers = this.eventHandlers.get(eventKey) || [];
      handlers.push(handler);
      this.eventHandlers.set(eventKey, handlers);
    }
  }

  unsubscribe(serviceName: string, event: string, handler?: Function): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.off(event, handler);
    }

    // Remove from handlers map
    if (handler) {
      const eventKey = `${serviceName}:${event}`;
      const handlers = this.eventHandlers.get(eventKey) || [];
      const updatedHandlers = handlers.filter(h => h !== handler);
      if (updatedHandlers.length > 0) {
        this.eventHandlers.set(eventKey, updatedHandlers);
      } else {
        this.eventHandlers.delete(eventKey);
      }
    }
  }

  joinRoom(serviceName: string, room: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Socket service '${serviceName}' not found`);
    }

    return service.emit('join_room', { room });
  }

  leaveRoom(serviceName: string, room: string): Promise<void> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Socket service '${serviceName}' not found`);
    }

    return service.emit('leave_room', { room });
  }

  getConnectionStatus(serviceName?: string): Record<string, boolean> {
    if (serviceName) {
      const service = this.services.get(serviceName);
      return { [serviceName]: service ? service.isConnected() : false };
    }

    const status: Record<string, boolean> = {};
    this.services.forEach((service, name) => {
      status[name] = service.isConnected();
    });
    return status;
  }
}

const socketManager = new SocketServiceManager();

// ============================================================================
// Message Queue for Offline Support
// ============================================================================

interface QueuedMessage {
  serviceName: string;
  event: string;
  data: any;
  timestamp: number;
  retries: number;
  options?: any;
}

class MessageQueue {
  private queue: QueuedMessage[] = [];
  private maxRetries = 3;
  private maxQueueSize = 100;

  add(message: Omit<QueuedMessage, 'timestamp' | 'retries'>): void {
    // Prevent queue overflow
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest message
    }

    this.queue.push({
      ...message,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  async processQueue(): Promise<void> {
    const messagesToProcess = [...this.queue];
    this.queue = [];

    for (const message of messagesToProcess) {
      try {
        await socketManager.emit(message.serviceName, message.event, message.data, message.options);
      } catch (error) {
        console.error('Failed to process queued message:', error);
        
        // Retry if under limit
        if (message.retries < this.maxRetries) {
          message.retries++;
          this.queue.push(message);
        }
      }
    }
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }
}

const messageQueue = new MessageQueue();

// ============================================================================
// Helper Functions
// ============================================================================

const isSocketAction = (action: AnyAction): action is SocketAction => {
  return action.meta?.socket !== undefined;
};

const createSocketAction = (type: string, payload?: any, meta?: any): SocketAction => ({
  type,
  payload,
  meta,
});

// ============================================================================
// Middleware Implementation
// ============================================================================

export const socketMiddleware: Middleware<{}, RootState> = 
  (store: MiddlewareAPI<Dispatch<AnyAction>, RootState>) => 
  (next: Dispatch<AnyAction>) => 
  async (action: AnyAction) => {
    // Initialize socket manager on first action
    if (!socketManager['store']) {
      socketManager.initialize(store);
    }

    // Pass through non-socket actions
    if (!isSocketAction(action)) {
      return next(action);
    }

    const socketAction = action as SocketAction;
    const socketConfig = socketAction.meta!.socket!;
    const serviceName = socketConfig.service || 'main';

    try {
      switch (socketConfig.type) {
        case 'connect':
          store.dispatch(setLoadingState({ key: `socket_${serviceName}`, loading: true }));
          
          try {
            await socketManager.connect(serviceName, socketConfig.options);
            
            // Process any queued messages
            if (messageQueue.size() > 0) {
              await messageQueue.processQueue();
            }

            store.dispatch(showNotification({
              type: 'success',
              title: 'Connected',
              message: `Connected to ${serviceName} service`,
              duration: 3000,
            }));

          } catch (error) {
            store.dispatch(showNotification({
              type: 'error',
              title: 'Connection Failed',
              message: `Failed to connect to ${serviceName} service`,
              duration: 5000,
            }));
            throw error;
          } finally {
            store.dispatch(setLoadingState({ key: `socket_${serviceName}`, loading: false }));
          }
          break;

        case 'disconnect':
          socketManager.disconnect(serviceName);
          store.dispatch(showNotification({
            type: 'info',
            title: 'Disconnected',
            message: `Disconnected from ${serviceName} service`,
            duration: 3000,
          }));
          break;

        case 'emit':
          if (!socketConfig.event) {
            throw new Error('Socket emit action requires an event name');
          }

          try {
            const result = await socketManager.emit(
              serviceName, 
              socketConfig.event, 
              socketConfig.data,
              socketConfig.options
            );
            
            // Dispatch success action
            store.dispatch(createSocketAction(`SOCKET_EMIT_SUCCESS`, {
              service: serviceName,
              event: socketConfig.event,
              result,
            }));

            return result;

          } catch (error) {
            // Queue message for retry if connection is lost
            const service = socketManager.getService(serviceName);
            if (service && !service.isConnected()) {
              messageQueue.add({
                serviceName,
                event: socketConfig.event,
                data: socketConfig.data,
                options: socketConfig.options,
              });

              store.dispatch(showNotification({
                type: 'warning',
                title: 'Message Queued',
                message: 'Message queued for delivery when connection is restored',
                duration: 3000,
              }));
            }

            // Dispatch error action
            store.dispatch(createSocketAction(`SOCKET_EMIT_ERROR`, {
              service: serviceName,
              event: socketConfig.event,
              error,
            }));

            throw error;
          }

        case 'subscribe':
          if (!socketConfig.event) {
            throw new Error('Socket subscribe action requires an event name');
          }

          socketManager.subscribe(serviceName, socketConfig.event);
          
          // Join room if specified
          if (socketConfig.room) {
            await socketManager.joinRoom(serviceName, socketConfig.room);
          }

          store.dispatch(createSocketAction(`SOCKET_SUBSCRIBED`, {
            service: serviceName,
            event: socketConfig.event,
            room: socketConfig.room,
          }));
          break;

        case 'unsubscribe':
          if (!socketConfig.event) {
            throw new Error('Socket unsubscribe action requires an event name');
          }

          socketManager.unsubscribe(serviceName, socketConfig.event);
          
          // Leave room if specified
          if (socketConfig.room) {
            await socketManager.leaveRoom(serviceName, socketConfig.room);
          }

          store.dispatch(createSocketAction(`SOCKET_UNSUBSCRIBED`, {
            service: serviceName,
            event: socketConfig.event,
            room: socketConfig.room,
          }));
          break;
      }

      // Pass action to next middleware
      return next(action);

    } catch (error) {
      console.error('Socket middleware error:', error);
      
      store.dispatch(createSocketAction(SOCKET_ERROR, {
        service: serviceName,
        action: socketConfig.type,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));

      throw error;
    }
  };

// ============================================================================
// Action Creators
// ============================================================================

export const connectSocket = (service: string = 'main', options?: any): SocketAction => ({
  type: SOCKET_CONNECT,
  meta: {
    socket: {
      type: 'connect',
      service,
      options,
    },
  },
});

export const disconnectSocket = (service: string = 'main'): SocketAction => ({
  type: SOCKET_DISCONNECT,
  meta: {
    socket: {
      type: 'disconnect',
      service,
    },
  },
});

export const emitSocketEvent = (
  event: string,
  data?: any,
  service: string = 'main',
  options?: any
): SocketAction => ({
  type: SOCKET_EMIT,
  meta: {
    socket: {
      type: 'emit',
      service,
      event,
      data,
      options,
    },
  },
});

export const subscribeToEvent = (
  event: string,
  service: string = 'main',
  room?: string
): SocketAction => ({
  type: SOCKET_SUBSCRIBE,
  meta: {
    socket: {
      type: 'subscribe',
      service,
      event,
      room,
    },
  },
});

export const unsubscribeFromEvent = (
  event: string,
  service: string = 'main',
  room?: string
): SocketAction => ({
  type: SOCKET_UNSUBSCRIBE,
  meta: {
    socket: {
      type: 'unsubscribe',
      service,
      event,
      room,
    },
  },
});

// ============================================================================
// Utility Functions
// ============================================================================

export const getSocketConnectionStatus = () => socketManager.getConnectionStatus();

export const clearMessageQueue = () => messageQueue.clear();

export const getQueuedMessageCount = () => messageQueue.size();

// ============================================================================
// Auto-reconnection Handler
// ============================================================================

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Attempt to reconnect all services
    const status = socketManager.getConnectionStatus();
    Object.keys(status).forEach(serviceName => {
      if (!status[serviceName]) {
        socketManager.connect(serviceName).catch(console.error);
      }
    });
  });

  window.addEventListener('offline', () => {
    // Services will handle disconnection automatically
    console.log('Connection lost - messages will be queued');
  });
}

export default socketMiddleware;
