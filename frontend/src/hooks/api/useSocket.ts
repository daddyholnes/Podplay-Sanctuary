/**
 * WebSocket Hook - useSocket
 * 
 * A comprehensive React hook for WebSocket management with automatic reconnection,
 * message queuing, connection state management, and event handling.
 * Built specifically for Podplay Sanctuary's real-time communication needs.
 * 
 * Features:
 * - Automatic connection management
 * - Reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Event-driven message handling
 * - Connection state monitoring
 * - Heartbeat/ping-pong support
 * - Message history tracking
 * - TypeScript support with generic message types
 * 
 * @author Podplay Sanctuary Team
 * @version 1.0.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SocketService } from '../../services/socket/SocketService';

export interface UseSocketOptions {
  // Connection options
  autoConnect?: boolean;
  protocols?: string[];
  
  // Reconnection options
  reconnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  reconnectBackoff?: boolean;
  
  // Message options
  messageQueueSize?: number;
  retainMessageHistory?: boolean;
  messageHistorySize?: number;
  
  // Heartbeat options
  heartbeat?: boolean;
  heartbeatInterval?: number;
  heartbeatMessage?: string | object;
  
  // Event handlers
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (data: any, event: MessageEvent) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFail?: (attempts: number) => void;
}

export interface UseSocketResult {
  // Connection state
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  
  // Connection info
  url: string | null;
  protocol: string | null;
  readyState: number;
  reconnectCount: number;
  lastError: Event | null;
  
  // Message handling
  sendMessage: (data: any) => boolean;
  sendJsonMessage: (data: object) => boolean;
  messageHistory: any[];
  lastMessage: any;
  
  // Connection management
  connect: (url?: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Event subscription
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
}

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  reconnectCount: number;
  lastError: Event | null;
  messageHistory: any[];
  lastMessage: any;
}

export function useSocket(
  url: string | null,
  options: UseSocketOptions = {}
): UseSocketResult {
  const {
    autoConnect = true,
    protocols,
    reconnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 1000,
    reconnectBackoff = true,
    messageQueueSize = 100,
    retainMessageHistory = true,
    messageHistorySize = 50,
    heartbeat = false,
    heartbeatInterval = 30000,
    heartbeatMessage = 'ping',
    onOpen,
    onClose,
    onError,
    onMessage,
    onReconnect,
    onReconnectFail
  } = options;

  // State management
  const [state, setState] = useState<SocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    reconnectCount: 0,
    lastError: null,
    messageHistory: [],
    lastMessage: null
  });

  // Refs for cleanup and persistence
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Interval>();
  const messageQueueRef = useRef<any[]>([]);
  const eventListenersRef = useRef<Map<string, Set<EventListener>>>(new Map());
  const mountedRef = useRef(true);

  // Get current connection state
  const getConnectionState = useCallback(() => {
    if (state.isReconnecting) return 'reconnecting';
    if (state.isConnecting) return 'connecting';
    if (state.isConnected) return 'connected';
    if (state.lastError) return 'error';
    return 'disconnected';
  }, [state.isConnected, state.isConnecting, state.isReconnecting, state.lastError]);

  // Add message to history
  const addToHistory = useCallback((message: any) => {
    if (!retainMessageHistory) return;
    
    setState(prev => ({
      ...prev,
      messageHistory: [
        ...prev.messageHistory.slice(-(messageHistorySize - 1)),
        message
      ],
      lastMessage: message
    }));
  }, [retainMessageHistory, messageHistorySize]);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    const queue = messageQueueRef.current;
    if (queue.length === 0 || !state.socket || state.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    while (queue.length > 0) {
      const message = queue.shift();
      try {
        state.socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send queued message:', error);
        break;
      }
    }
  }, [state.socket]);

  // Setup heartbeat
  const setupHeartbeat = useCallback(() => {
    if (!heartbeat || !state.socket) return;

    heartbeatIntervalRef.current = setInterval(() => {
      if (state.socket?.readyState === WebSocket.OPEN) {
        try {
          const message = typeof heartbeatMessage === 'string' 
            ? heartbeatMessage 
            : JSON.stringify(heartbeatMessage);
          state.socket.send(message);
        } catch (error) {
          console.error('Failed to send heartbeat:', error);
        }
      }
    }, heartbeatInterval);
  }, [heartbeat, heartbeatInterval, heartbeatMessage, state.socket]);

  // Cleanup heartbeat
  const cleanupHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback((connectUrl?: string) => {
    const targetUrl = connectUrl || url;
    if (!targetUrl) {
      console.error('No URL provided for WebSocket connection');
      return;
    }

    if (state.socket?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected');
      return;
    }

    setState(prev => ({
      ...prev,
      isConnecting: true,
      lastError: null
    }));

    try {
      const socket = new WebSocket(targetUrl, protocols);

      socket.onopen = (event) => {
        if (!mountedRef.current) return;

        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          isReconnecting: false,
          reconnectCount: 0,
          lastError: null
        }));

        // Process queued messages
        processMessageQueue();
        
        // Setup heartbeat
        setupHeartbeat();

        // Call custom handler
        onOpen?.(event);

        // Notify event listeners
        eventListenersRef.current.get('open')?.forEach(listener => {
          listener(event);
        });
      };

      socket.onclose = (event) => {
        if (!mountedRef.current) return;

        cleanupHeartbeat();

        setState(prev => ({
          ...prev,
          socket: null,
          isConnected: false,
          isConnecting: false
        }));

        // Call custom handler
        onClose?.(event);

        // Notify event listeners
        eventListenersRef.current.get('close')?.forEach(listener => {
          listener(event);
        });

        // Handle reconnection
        if (reconnect && event.code !== 1000 && state.reconnectCount < reconnectAttempts) {
          const delay = reconnectBackoff 
            ? reconnectInterval * Math.pow(2, state.reconnectCount)
            : reconnectInterval;

          setState(prev => ({
            ...prev,
            isReconnecting: true,
            reconnectCount: prev.reconnectCount + 1
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              onReconnect?.(state.reconnectCount + 1);
              connect(targetUrl);
            }
          }, delay);
        } else if (state.reconnectCount >= reconnectAttempts) {
          onReconnectFail?.(state.reconnectCount);
        }
      };

      socket.onerror = (event) => {
        if (!mountedRef.current) return;

        setState(prev => ({
          ...prev,
          lastError: event,
          isConnecting: false,
          isReconnecting: false
        }));

        // Call custom handler
        onError?.(event);

        // Notify event listeners
        eventListenersRef.current.get('error')?.forEach(listener => {
          listener(event);
        });
      };

      socket.onmessage = (event) => {
        if (!mountedRef.current) return;

        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }

        addToHistory(data);

        // Call custom handler
        onMessage?.(data, event);

        // Notify event listeners
        eventListenersRef.current.get('message')?.forEach(listener => {
          const customEvent = new CustomEvent('message', { detail: { data, event } });
          listener(customEvent);
        });
      };

      setState(prev => ({ ...prev, socket }));
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        lastError: error as Event
      }));
    }
  }, [url, protocols, state, options, processMessageQueue, setupHeartbeat, cleanupHeartbeat]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    cleanupHeartbeat();

    if (state.socket) {
      state.socket.close(1000, 'Manual disconnect');
    }

    setState(prev => ({
      ...prev,
      socket: null,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      reconnectCount: 0
    }));
  }, [state.socket, cleanupHeartbeat]);

  // Reconnect manually
  const reconnectManually = useCallback(() => {
    disconnect();
    setTimeout(() => connect(), 100);
  }, [disconnect, connect]);

  // Send message
  const sendMessage = useCallback((data: any): boolean => {
    if (!state.socket || state.socket.readyState !== WebSocket.OPEN) {
      // Queue message if not connected
      if (messageQueueRef.current.length < messageQueueSize) {
        messageQueueRef.current.push(data);
      }
      return false;
    }

    try {
      state.socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, [state.socket, messageQueueSize]);

  // Send JSON message
  const sendJsonMessage = useCallback((data: object): boolean => {
    return sendMessage(JSON.stringify(data));
  }, [sendMessage]);

  // Event listener management
  const addEventListener = useCallback((type: string, listener: EventListener) => {
    const listeners = eventListenersRef.current.get(type) || new Set();
    listeners.add(listener);
    eventListenersRef.current.set(type, listeners);
  }, []);

  const removeEventListener = useCallback((type: string, listener: EventListener) => {
    const listeners = eventListenersRef.current.get(type);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        eventListenersRef.current.delete(type);
      }
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [url, autoConnect]); // Only run when URL or autoConnect changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupHeartbeat();
    };
  }, [cleanupHeartbeat]);

  return {
    // Connection state
    socket: state.socket,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isReconnecting: state.isReconnecting,
    connectionState: getConnectionState(),
    
    // Connection info
    url,
    protocol: state.socket?.protocol || null,
    readyState: state.socket?.readyState ?? WebSocket.CLOSED,
    reconnectCount: state.reconnectCount,
    lastError: state.lastError,
    
    // Message handling
    sendMessage,
    sendJsonMessage,
    messageHistory: state.messageHistory,
    lastMessage: state.lastMessage,
    
    // Connection management
    connect,
    disconnect,
    reconnect: reconnectManually,
    
    // Event subscription
    addEventListener,
    removeEventListener
  };
}
