import React, { useState, useEffect } from 'react';
import { useWindow, WindowType } from './WindowContext';
import Window from './Window';
import './WindowManager.css';

interface WindowManagerProps {
  children?: React.ReactNode;
}

/**
 * WindowManager - Central component for managing windows and layouts
 * Provides a dock for minimized windows and controls for window management
 */
const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const { 
    windows, 
    createWindow, 
    arrangeWindows, 
    saveWindowLayout, 
    loadWindowLayout,
    restoreWindow
  } = useWindow();
  
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  
  // Load saved window layout on mount
  useEffect(() => {
    loadWindowLayout();
  }, [loadWindowLayout]);
  
  // Create a new window of the specified type
  const handleCreateWindow = (type: WindowType) => {
    const titles: Record<WindowType, string> = {
      [WindowType.CHAT]: 'Chat Window',
      [WindowType.WORKFLOW]: 'Workflow Window',
      [WindowType.TASK]: 'Task Window',
      [WindowType.RESOURCE]: 'Resource Window',
      [WindowType.CODE]: 'Code Window',
      [WindowType.BROWSER]: 'Browser Window',
      [WindowType.CUSTOM]: 'Custom Window'
    };
    
    createWindow({
      title: titles[type],
      type
    });
    
    setIsControlPanelOpen(false);
  };
  
  // Handle arranging windows
  const handleArrangeWindows = (arrangement: 'cascade' | 'tile' | 'grid') => {
    arrangeWindows(arrangement);
    setIsControlPanelOpen(false);
  };
  
  // Handle saving window layout
  const handleSaveLayout = () => {
    saveWindowLayout();
    setIsControlPanelOpen(false);
    
    // Show a toast or notification
    // This is a placeholder - you would implement a proper notification system
    alert('Window layout saved');
  };
  
  // Render minimized windows in the dock
  const minimizedWindows = windows.filter(window => window.isMinimized);
  
  // Get active windows (not minimized)
  const activeWindows = windows.filter(window => !window.isMinimized);

  return (
    <div className="window-manager">
      {/* Render all non-minimized windows */}
      {activeWindows.map(window => (
        <Window key={window.id} window={window}>
          {/* Placeholder for window content - in a real app, you would render different content based on window type */}
          <div className="window-content-placeholder">
            <div className="window-type-icon">
              {window.type === WindowType.CHAT && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              )}
              {window.type === WindowType.WORKFLOW && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                </svg>
              )}
              {window.type === WindowType.TASK && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                </svg>
              )}
              {window.type === WindowType.RESOURCE && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6H6z"/>
                </svg>
              )}
              {window.type === WindowType.CODE && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
              )}
              {window.type === WindowType.BROWSER && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
                </svg>
              )}
              {window.type === WindowType.CUSTOM && (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                </svg>
              )}
            </div>
            <div className="placeholder-text">
              {window.content || `${window.type} Window Content`}
            </div>
          </div>
        </Window>
      ))}
      
      {/* Window control dock */}
      <div className="window-dock">
        {/* Minimized windows dock */}
        <div className="minimized-windows">
          {minimizedWindows.map(window => (
            <button 
              key={window.id}
              className="minimized-window-button"
              onClick={() => restoreWindow(window.id)}
              title={window.title}
            >
              <span className="window-icon">
                {window.type.charAt(0).toUpperCase()}
              </span>
              <span className="minimized-title">{window.title}</span>
            </button>
          ))}
        </div>
        
        {/* Control panel toggle */}
        <button 
          className={`control-panel-toggle ${isControlPanelOpen ? 'active' : ''}`}
          onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
        
        {/* Window control panel */}
        {isControlPanelOpen && (
          <div className="window-control-panel">
            <div className="panel-section">
              <h3>Create Window</h3>
              <div className="window-type-buttons">
                <button 
                  className="window-type-button chat"
                  onClick={() => handleCreateWindow(WindowType.CHAT)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                  </svg>
                  Chat
                </button>
                <button 
                  className="window-type-button workflow"
                  onClick={() => handleCreateWindow(WindowType.WORKFLOW)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
                  </svg>
                  Workflow
                </button>
                <button 
                  className="window-type-button task"
                  onClick={() => handleCreateWindow(WindowType.TASK)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  Task
                </button>
                <button 
                  className="window-type-button resource"
                  onClick={() => handleCreateWindow(WindowType.RESOURCE)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8l-6-6H6z"/>
                  </svg>
                  Resource
                </button>
                <button 
                  className="window-type-button code"
                  onClick={() => handleCreateWindow(WindowType.CODE)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                  Code
                </button>
                <button 
                  className="window-type-button browser"
                  onClick={() => handleCreateWindow(WindowType.BROWSER)}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>
                  </svg>
                  Browser
                </button>
              </div>
            </div>
            
            <div className="panel-section">
              <h3>Arrange Windows</h3>
              <div className="arrange-buttons">
                <button 
                  className="arrange-button"
                  onClick={() => handleArrangeWindows('cascade')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M4 4h16v16H4V4zm2 4h10v10H6V8z"/>
                  </svg>
                  Cascade
                </button>
                <button 
                  className="arrange-button"
                  onClick={() => handleArrangeWindows('tile')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M3 3v8h8V3H3zm10 0v8h8V3h-8zM3 13v8h8v-8H3zm10 0v8h8v-8h-8z"/>
                  </svg>
                  Tile
                </button>
                <button 
                  className="arrange-button"
                  onClick={() => handleArrangeWindows('grid')}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>
                  </svg>
                  Grid
                </button>
              </div>
            </div>
            
            <div className="panel-section">
              <h3>Window Layout</h3>
              <button 
                className="save-layout-button"
                onClick={handleSaveLayout}
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                Save Current Layout
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Optional additional content */}
      {children}
    </div>
  );
};

export default WindowManager;