import React, { createContext, useContext, useState, useEffect, useCallback, ComponentType } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import socketService from '../../services/socketService';

/**
 * Window Registry for dynamically registering components
 * Allows the window management system to render components by name
 */
export class WindowRegistry {
  private static components: Record<string, ComponentType<any>> = {};

  /**
   * Register a component with the window system
   * @param name Component name for reference in window content
   * @param component React component to render
   */
  static registerComponent(name: string, component: ComponentType<any>) {
    WindowRegistry.components[name] = component;
  }

  /**
   * Get a registered component by name
   * @param name Component name
   * @returns React component or null if not found
   */
  static getComponent(name: string): ComponentType<any> | null {
    return WindowRegistry.components[name] || null;
  }

  /**
   * Check if a component is registered
   * @param name Component name
   * @returns True if component exists
   */
  static hasComponent(name: string): boolean {
    return !!WindowRegistry.components[name];
  }
}

// Types for window management
export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowData {
  id: string;
  title: string;
  type: WindowType;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  linkedTaskId?: string;
  linkedWorkflowId?: string;
  content?: any;
  isVisible: boolean;
  isDragging: boolean;
  isResizing: boolean;
}

export enum WindowType {
  CHAT = 'chat',
  WORKFLOW = 'workflow',
  TASK = 'task',
  RESOURCE = 'resource',
  CODE = 'code',
  BROWSER = 'browser',
  CUSTOM = 'custom'
}

interface WindowContextType {
  windows: WindowData[];
  activeWindowId: string | null;
  createWindow: (data: Partial<WindowData>) => string;
  closeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, position: WindowPosition) => void;
  updateWindowSize: (windowId: string, size: WindowSize) => void;
  startDragging: (windowId: string) => void;
  stopDragging: (windowId: string) => void;
  startResizing: (windowId: string) => void;
  stopResizing: (windowId: string) => void;
  arrangeWindows: (arrangement: 'cascade' | 'tile' | 'grid') => void;
  saveWindowLayout: () => void;
  loadWindowLayout: () => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

// Grid settings for snap-to-grid
const GRID_SIZE = 10;
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// Default window sizes by type
const DEFAULT_SIZES: Record<WindowType, WindowSize> = {
  [WindowType.CHAT]: { width: 500, height: 600 },
  [WindowType.WORKFLOW]: { width: 800, height: 600 },
  [WindowType.TASK]: { width: 400, height: 500 },
  [WindowType.RESOURCE]: { width: 400, height: 500 },
  [WindowType.CODE]: { width: 600, height: 700 },
  [WindowType.BROWSER]: { width: 800, height: 600 },
  [WindowType.CUSTOM]: { width: 500, height: 500 }
};

// Local storage key for saving window layouts
const WINDOW_LAYOUT_STORAGE_KEY = 'podplay-window-layout';

// Provider component
export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(100);
  const { isConnected } = useSocket();

  // Create a new window
  const createWindow = useCallback((data: Partial<WindowData>): string => {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const windowType = data.type || WindowType.CUSTOM;
    
    const newWindow: WindowData = {
      id: windowId,
      title: data.title || 'New Window',
      type: windowType,
      position: data.position || { 
        x: snapToGrid(Math.random() * 100), 
        y: snapToGrid(Math.random() * 100) 
      },
      size: data.size || DEFAULT_SIZES[windowType],
      zIndex: highestZIndex + 1,
      isMinimized: false,
      isMaximized: false,
      linkedTaskId: data.linkedTaskId,
      linkedWorkflowId: data.linkedWorkflowId,
      content: data.content,
      isVisible: true,
      isDragging: false,
      isResizing: false
    };
    
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
    
    const emitWindowCreated = (windowData: WindowData) => {
      if (isConnected) {
        socketService.emit('window:created', { windowId: windowData.id, data: windowData });
      }
    };
    emitWindowCreated(newWindow);
    
    return windowId;
  }, [highestZIndex, isConnected]);

  // Close a window
  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(window => window.id !== windowId));
    
    // If the closed window was active, set another window as active
    if (activeWindowId === windowId) {
      setWindows(prev => {
        const remainingWindows = prev.filter(w => w.id !== windowId);
        if (remainingWindows.length > 0) {
          // Find the window with the highest z-index
          const highestWindow = remainingWindows.reduce((highest, current) => 
            current.zIndex > highest.zIndex ? current : highest
          , remainingWindows[0]);
          setActiveWindowId(highestWindow.id);
        } else {
          setActiveWindowId(null);
        }
        return prev;
      });
    }
    
    const emitWindowClosed = (windowId: string) => {
      if (isConnected) {
        socketService.emit('window:closed', { windowId });
      }
    };
    emitWindowClosed(windowId);
  }, [activeWindowId, isConnected]);

  // Minimize a window
  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isMinimized: true, isMaximized: false } 
          : window
      )
    );
    
    const emitWindowMinimized = (windowId: string) => {
      if (isConnected) {
        socketService.emit('window:minimized', { windowId });
      }
    };
    emitWindowMinimized(windowId);
  }, [isConnected]);

  // Maximize a window
  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isMaximized: true, isMinimized: false, zIndex: highestZIndex + 1 } 
          : window
      )
    );
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
    
    const emitWindowMaximized = (windowId: string) => {
      if (isConnected) {
        socketService.emit('window:maximized', { windowId });
      }
    };
    emitWindowMaximized(windowId);
  }, [highestZIndex, isConnected]);

  // Restore a window from minimized or maximized state
  const restoreWindow = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isMaximized: false, isMinimized: false, zIndex: highestZIndex + 1 } 
          : window
      )
    );
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
    
    const emitWindowRestored = (windowId: string) => {
      if (isConnected) {
        socketService.emit('window:restored', { windowId });
      }
    };
    emitWindowRestored(windowId);
  }, [highestZIndex, isConnected]);

  // Focus a window
  const focusWindow = useCallback((windowId: string) => {
    if (activeWindowId === windowId) return;
    
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, zIndex: highestZIndex + 1 } 
          : window
      )
    );
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
    
    // Emit window focused event
    if (isConnected) {
      socketService.emit('window:focused', { windowId });
    }
  }, [activeWindowId, highestZIndex, isConnected]);

  // Update window position
  const updateWindowPosition = useCallback((windowId: string, position: WindowPosition) => {
    const snappedPosition = {
      x: snapToGrid(position.x),
      y: snapToGrid(position.y)
    };
    
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, position: snappedPosition } 
          : window
      )
    );
    
    const emitWindowPositionUpdated = (windowId: string, position: WindowPosition) => {
      if (isConnected) {
        socketService.emit('window:position_updated', { windowId, position });
      }
    };
    emitWindowPositionUpdated(windowId, snappedPosition);
  }, [isConnected]);

  // Update window size
  const updateWindowSize = useCallback((windowId: string, size: WindowSize) => {
    const snappedSize = {
      width: snapToGrid(size.width),
      height: snapToGrid(size.height)
    };
    
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, size: snappedSize } 
          : window
      )
    );
    
    const emitWindowSizeUpdated = (windowId: string, size: WindowSize) => {
      if (isConnected) {
        socketService.emit('window:size_updated', { windowId, size });
      }
    };
    emitWindowSizeUpdated(windowId, snappedSize);
  }, [isConnected]);

  // Start dragging a window
  const startDragging = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isDragging: true, zIndex: highestZIndex + 1 } 
          : window
      )
    );
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
  }, [highestZIndex]);

  // Stop dragging a window
  const stopDragging = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isDragging: false } 
          : window
      )
    );
  }, []);

  // Start resizing a window
  const startResizing = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isResizing: true, zIndex: highestZIndex + 1 } 
          : window
      )
    );
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
  }, [highestZIndex]);

  // Stop resizing a window
  const stopResizing = useCallback((windowId: string) => {
    setWindows(prev => 
      prev.map(window => 
        window.id === windowId 
          ? { ...window, isResizing: false } 
          : window
      )
    );
  }, []);

  // Arrange windows in different layouts
  const arrangeWindows = useCallback((arrangement: 'cascade' | 'tile' | 'grid') => {
    const visibleWindows = windows.filter(window => window.isVisible && !window.isMinimized);
    const windowCount = visibleWindows.length;
    
    if (windowCount === 0) return;
    
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    let newWindows = [...windows];
    
    switch (arrangement) {
      case 'cascade':
        visibleWindows.forEach((window, index) => {
          const offset = index * 30;
          const newWindow = { 
            ...window, 
            position: { x: snapToGrid(offset), y: snapToGrid(offset) },
            isMaximized: false,
            zIndex: highestZIndex + index
          };
          newWindows = newWindows.map(w => w.id === window.id ? newWindow : w);
        });
        break;
        
      case 'tile':
        const columns = Math.ceil(Math.sqrt(windowCount));
        const rows = Math.ceil(windowCount / columns);
        const tileWidth = snapToGrid(containerWidth / columns);
        const tileHeight = snapToGrid(containerHeight / rows);
        
        visibleWindows.forEach((window, index) => {
          const row = Math.floor(index / columns);
          const col = index % columns;
          
          const newWindow = {
            ...window,
            position: { x: snapToGrid(col * tileWidth), y: snapToGrid(row * tileHeight) },
            size: { width: tileWidth, height: tileHeight },
            isMaximized: false,
            zIndex: highestZIndex
          };
          newWindows = newWindows.map(w => w.id === window.id ? newWindow : w);
        });
        break;
        
      case 'grid':
        const gridColumns = Math.ceil(Math.sqrt(windowCount));
        const gridRows = Math.ceil(windowCount / gridColumns);
        const cellWidth = snapToGrid(containerWidth / gridColumns);
        const cellHeight = snapToGrid(containerHeight / gridRows);
        
        visibleWindows.forEach((window, index) => {
          const row = Math.floor(index / gridColumns);
          const col = index % gridColumns;
          
          // Add some margin within each cell
          const margin = snapToGrid(10);
          const newWindow = {
            ...window,
            position: { 
              x: snapToGrid(col * cellWidth + margin), 
              y: snapToGrid(row * cellHeight + margin) 
            },
            size: { 
              width: snapToGrid(cellWidth - 2 * margin), 
              height: snapToGrid(cellHeight - 2 * margin) 
            },
            isMaximized: false,
            zIndex: highestZIndex
          };
          newWindows = newWindows.map(w => w.id === window.id ? newWindow : w);
        });
        break;
    }
    
    setWindows(newWindows);
    setHighestZIndex(prev => prev + windowCount);
    
    // Emit windows arranged event
    if (isConnected) {
      socketService.emit('windows:arranged', { arrangement, windows: newWindows });
    }
  }, [windows, highestZIndex, isConnected]);

  // Save window layout to local storage
  const saveWindowLayout = useCallback(() => {
    const layoutData = windows.map(window => ({
      id: window.id,
      title: window.title,
      type: window.type,
      position: window.position,
      size: window.size,
      isMinimized: window.isMinimized,
      isMaximized: window.isMaximized,
      linkedTaskId: window.linkedTaskId,
      linkedWorkflowId: window.linkedWorkflowId
    }));
    
    localStorage.setItem(WINDOW_LAYOUT_STORAGE_KEY, JSON.stringify(layoutData));
    
    // Emit layout saved event
    if (isConnected) {
      socketService.emit('window:layout_saved', { layout: layoutData });
    }
  }, [windows, isConnected]);

  // Load window layout from local storage
  const loadWindowLayout = useCallback(() => {
    const savedLayout = localStorage.getItem(WINDOW_LAYOUT_STORAGE_KEY);
    
    if (savedLayout) {
      try {
        const layoutData = JSON.parse(savedLayout);
        
        if (Array.isArray(layoutData) && layoutData.length > 0) {
          const newWindows = layoutData.map((item, index) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            position: item.position,
            size: item.size,
            zIndex: 100 + index,
            isMinimized: item.isMinimized,
            isMaximized: item.isMaximized,
            linkedTaskId: item.linkedTaskId,
            linkedWorkflowId: item.linkedWorkflowId,
            isVisible: true,
            isDragging: false,
            isResizing: false,
            content: item.content
          }));
          
          setWindows(newWindows);
          setHighestZIndex(100 + layoutData.length);
          
          if (newWindows.length > 0) {
            const nonMinimizedWindows = newWindows.filter(w => !w.isMinimized);
            if (nonMinimizedWindows.length > 0) {
              setActiveWindowId(nonMinimizedWindows[0].id);
            }
          }
          
          // Emit layout loaded event
          if (isConnected) {
            socketService.emit('window:layout_loaded', { layout: newWindows });
          }
        }
      } catch (error) {
        console.error('Error loading window layout:', error);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    const handleWindowsChange = () => {
      // Only emit if we have a connected socket
      if (isConnected) {
        socketService.emit('windows:state', { windows });
      }
    };
    
    handleWindowsChange();
    
    // This could be optimized to only emit on actual state changes
    const intervalId = setInterval(handleWindowsChange, 5000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [windows, isConnected]);

  useEffect(() => {
    const handleSocketError = (error: Error) => {
      console.error('Socket error:', error);
    };
    
    if (isConnected) {
      socketService.on('error', handleSocketError);
      
      return () => {
        socketService.off('error', handleSocketError);
      };
    }
  }, [isConnected]);

  useEffect(() => {
    if (!isConnected) return;

    // Handle window created event
    const handleWindowCreated = (data: { windowId: string, data: any }) => {
      const existingWindow = windows.find(w => w.id === data.windowId);
      
      if (!existingWindow && data.data) {
        setWindows(prev => [...prev, data.data as WindowData]);
      }
    };
    
    // Handle window closed event
    const handleWindowClosed = (data: { windowId: string }) => {
      setWindows(prev => prev.filter(w => w.id !== data.windowId));
      
      if (activeWindowId === data.windowId) {
        setActiveWindowId(null);
      }
    };
    
    // Handle window minimized event
    const handleWindowMinimized = (data: { windowId: string }) => {
      setWindows(prev => 
        prev.map(w => 
          w.id === data.windowId 
            ? { ...w, isMinimized: true, isMaximized: false } 
            : w
        )
      );
    };
    
    // Handle window maximized event
    const handleWindowMaximized = (data: { windowId: string }) => {
      setWindows(prev => 
        prev.map(w => 
          w.id === data.windowId 
            ? { ...w, isMaximized: true, isMinimized: false } 
            : w
        )
      );
    };
    
    // Handle window restored event
    const handleWindowRestored = (data: { windowId: string }) => {
      setWindows(prev => 
        prev.map(w => 
          w.id === data.windowId 
            ? { ...w, isMaximized: false, isMinimized: false } 
            : w
        )
      );
    };
    
    // Handle window position updated event
    const handleWindowPositionUpdated = (data: { windowId: string, position: any }) => {
      setWindows(prev => 
        prev.map(w => 
          w.id === data.windowId 
            ? { ...w, position: data.position as WindowPosition } 
            : w
        )
      );
    };
    
    // Handle window size updated event
    const handleWindowSizeUpdated = (data: { windowId: string, size: any }) => {
      setWindows(prev => 
        prev.map(w => 
          w.id === data.windowId 
            ? { ...w, size: data.size as WindowSize } 
            : w
        )
      );
    };
    
    // Register socket event handlers using socketService
    socketService.on('window:created', handleWindowCreated);
    socketService.on('window:closed', handleWindowClosed);
    socketService.on('window:minimized', handleWindowMinimized);
    socketService.on('window:maximized', handleWindowMaximized);
    socketService.on('window:restored', handleWindowRestored);
    socketService.on('window:position_updated', handleWindowPositionUpdated);
    socketService.on('window:size_updated', handleWindowSizeUpdated);
    
    return () => {
      // Clean up socket event handlers
      socketService.off('window:created', handleWindowCreated);
      socketService.off('window:closed', handleWindowClosed);
      socketService.off('window:minimized', handleWindowMinimized);
      socketService.off('window:maximized', handleWindowMaximized);
      socketService.off('window:restored', handleWindowRestored);
      socketService.off('window:position_updated', handleWindowPositionUpdated);
      socketService.off('window:size_updated', handleWindowSizeUpdated);
    };
  }, [windows, activeWindowId, isConnected]);

  const contextValue: WindowContextType = {
    windows,
    activeWindowId,
    createWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing,
    arrangeWindows,
    saveWindowLayout,
    loadWindowLayout
  };

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
    </WindowContext.Provider>
  );
};

// Custom hook for using the window context
export const useWindow = (): WindowContextType => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
};