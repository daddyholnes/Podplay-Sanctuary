import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import socketService, { PodplaySocketEvents } from '../services/socketService';
import { useAuth } from './AuthContext'; // Assuming we have an auth context

// Define the context type
interface SocketContextType {
  isConnected: boolean;
  connecting: boolean;
  error: Error | null;
  emit: <T extends keyof PodplaySocketEvents>(
    event: T,
    ...args: Parameters<PodplaySocketEvents[T]>
  ) => void;
  on: <T extends keyof PodplaySocketEvents>(
    event: T,
    callback: PodplaySocketEvents[T]
  ) => void;
  off: <T extends keyof PodplaySocketEvents>(
    event: T,
    callback: PodplaySocketEvents[T]
  ) => void;
}

// Create the context
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Provider component
export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth(); // Get auth token from auth context

  // Connect to the socket when the component mounts or token changes
  useEffect(() => {
    if (!token) return; // Don't connect if not authenticated
    
    const connectSocket = async () => {
      setConnecting(true);
      setError(null);
      
      try {
        await socketService.connect(token);
        setIsConnected(true);
      } catch (err) {
        console.error('Failed to connect to socket:', err);
        setError(err instanceof Error ? err : new Error('Failed to connect to socket'));
      } finally {
        setConnecting(false);
      }
    };
    
    // Set up basic event listeners
    socketService.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });
    
    socketService.on('disconnect', () => {
      setIsConnected(false);
    });
    
    socketService.on('error', (err) => {
      setError(err);
    });
    
    // Connect to the socket
    connectSocket();
    
    // Clean up when the component unmounts
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Emit an event
  const emit = <T extends keyof PodplaySocketEvents>(
    event: T,
    ...args: Parameters<PodplaySocketEvents[T]>
  ) => {
    socketService.emit(event, ...args);
  };

  // Add an event listener
  const on = <T extends keyof PodplaySocketEvents>(
    event: T,
    callback: PodplaySocketEvents[T]
  ) => {
    socketService.on(event, callback);
  };

  // Remove an event listener
  const off = <T extends keyof PodplaySocketEvents>(
    event: T,
    callback: PodplaySocketEvents[T]
  ) => {
    socketService.off(event, callback);
  };

  // Provide the socket service to the rest of the app
  return (
    <SocketContext.Provider value={{ isConnected, connecting, error, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Create a simplified version that automatically handles subscriptions with cleanup
export const useSocketEvent = <T extends keyof PodplaySocketEvents>(
  event: T,
  callback: PodplaySocketEvents[T]
) => {
  const { on, off } = useSocket();
  
  useEffect(() => {
    on(event, callback);
    
    // Clean up the subscription when the component unmounts
    return () => {
      off(event, callback);
    };
  }, [event, callback, on, off]);
};