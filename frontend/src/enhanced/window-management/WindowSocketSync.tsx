import React, { useEffect, useContext } from 'react';
import { useWindow, WindowData, WindowPosition, WindowSize } from './WindowContext';
import { SocketContext } from '../../contexts/SocketContext';

/**
 * WindowSocketSync - Component for handling real-time window state synchronization via WebSockets
 * 
 * This component listens for window-related socket events and updates the local window state
 * accordingly. It also emits socket events when window state changes locally.
 */
const WindowSocketSync: React.FC = () => {
  const { socket, isConnected } = useContext(SocketContext);
  const { 
    windows, 
    createWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow, 
    updateWindowPosition, 
    updateWindowSize, 
    focusWindow,
    setWindowData,
    saveWindowLayout,
    loadWindowLayout
  } = useWindow();
  
  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Listen for window creation events
    socket.on('window:create', (windowData: Omit<WindowData, 'id'> & { id?: string }) => {
      // Don't recreate windows that already exist
      if (windowData.id && windows.some(w => w.id === windowData.id)) return;
      createWindow(windowData);
    });
    
    // Listen for window close events
    socket.on('window:close', (data: { id: string }) => {
      closeWindow(data.id);
    });
    
    // Listen for window minimize events
    socket.on('window:minimize', (data: { id: string }) => {
      minimizeWindow(data.id);
    });
    
    // Listen for window maximize events
    socket.on('window:maximize', (data: { id: string }) => {
      maximizeWindow(data.id);
    });
    
    // Listen for window restore events
    socket.on('window:restore', (data: { id: string }) => {
      restoreWindow(data.id);
    });
    
    // Listen for window position update events
    socket.on('window:position', (data: { id: string, position: WindowPosition }) => {
      updateWindowPosition(data.id, data.position);
    });
    
    // Listen for window size update events
    socket.on('window:size', (data: { id: string, size: WindowSize }) => {
      updateWindowSize(data.id, data.size);
    });
    
    // Listen for window focus events
    socket.on('window:focus', (data: { id: string }) => {
      focusWindow(data.id);
    });
    
    // Listen for full window data update events
    socket.on('window:update', (data: { window: WindowData }) => {
      setWindowData(data.window);
    });
    
    // Listen for window layout load events
    socket.on('window:loadLayout', () => {
      loadWindowLayout();
    });
    
    // Listen for window layout save events
    socket.on('window:saveLayout', () => {
      saveWindowLayout();
    });
    
    // Listen for window full sync events
    socket.on('window:fullSync', (data: { windows: WindowData[] }) => {
      data.windows.forEach(window => {
        setWindowData(window);
      });
    });
    
    // Clean up listeners on unmount
    return () => {
      socket.off('window:create');
      socket.off('window:close');
      socket.off('window:minimize');
      socket.off('window:maximize');
      socket.off('window:restore');
      socket.off('window:position');
      socket.off('window:size');
      socket.off('window:focus');
      socket.off('window:update');
      socket.off('window:loadLayout');
      socket.off('window:saveLayout');
      socket.off('window:fullSync');
    };
  }, [socket, isConnected, windows]);
  
  // Emit window changes to the socket
  useEffect(() => {
    if (!socket || !isConnected || !windows.length) return;
    
    // Only emit changes for windows that have changed
    // This could be optimized further with a proper diff mechanism
    // or by tracking which windows have changed since last emit
    const handleWindowChange = (window: WindowData) => {
      // Emit window data change event
      socket.emit('window:update', { window });
    };
    
    // Add change handler to all windows
    const windowChangeHandlers = windows.map(window => ({
      id: window.id,
      handler: () => handleWindowChange(window)
    }));
    
    // Clean up handlers
    return () => {
      windowChangeHandlers.forEach(({ id }) => {
        // No specific cleanup needed here since we're using the useEffect cleanup
      });
    };
  }, [socket, isConnected, windows]);
  
  // Request full sync when connecting
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Request full window state sync when component mounts or connection is established
    socket.emit('window:requestSync');
    
    // Also set up a mechanism to periodically request sync (e.g., every 30 seconds)
    const syncInterval = setInterval(() => {
      if (socket && isConnected) {
        socket.emit('window:requestSync');
      }
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(syncInterval);
    };
  }, [socket, isConnected]);

  // This component doesn't render anything
  return null;
};

export default WindowSocketSync;