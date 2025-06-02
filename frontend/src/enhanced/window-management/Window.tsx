import React, { useState, useRef, useEffect } from 'react';
import { useWindow, WindowData, WindowPosition, WindowSize } from './WindowContext';
import './Window.css';

interface WindowProps {
  window: WindowData;
  children: React.ReactNode;
}

/**
 * Window Component - Creates a draggable, resizable window container
 */
const Window: React.FC<WindowProps> = ({ window, children }) => {
  const { 
    focusWindow, 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
    startDragging,
    stopDragging,
    startResizing,
    stopResizing
  } = useWindow();
  
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStartPosition, setResizeStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<WindowSize | null>(null);
  
  // Handle window focus
  const handleFocus = () => {
    focusWindow(window.id);
  };
  
  // Handle window close
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeWindow(window.id);
  };
  
  // Handle window minimize
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    minimizeWindow(window.id);
  };
  
  // Handle window maximize/restore
  const handleMaximizeRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.isMaximized) {
      restoreWindow(window.id);
    } else {
      maximizeWindow(window.id);
    }
  };
  
  // Start window drag
  const handleDragStart = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    
    // Only start dragging if the target is the header (not buttons)
    if (headerRef.current && headerRef.current.contains(e.target as Node)) {
      const targetClassNames = (e.target as HTMLElement).className || '';
      
      // Don't start dragging if clicking on a button
      if (
        targetClassNames.includes('window-control-button') ||
        targetClassNames.includes('minimize-button') ||
        targetClassNames.includes('maximize-button') ||
        targetClassNames.includes('close-button')
      ) {
        return;
      }
      
      e.preventDefault();
      const rect = windowRef.current?.getBoundingClientRect();
      
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        startDragging(window.id);
      }
    }
  };
  
  // Handle window drag
  const handleDrag = (e: MouseEvent) => {
    if (dragOffset) {
      const newPosition: WindowPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      updateWindowPosition(window.id, newPosition);
    }
  };
  
  // End window drag
  const handleDragEnd = () => {
    if (dragOffset) {
      setDragOffset(null);
      stopDragging(window.id);
    }
  };
  
  // Start window resize
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    if (window.isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setResizeDirection(direction);
    setResizeStartPosition({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: window.size.width, height: window.size.height });
    startResizing(window.id);
  };
  
  // Handle window resize
  const handleResize = (e: MouseEvent) => {
    if (!resizeDirection || !resizeStartPosition || !resizeStartSize) return;
    
    // Calculate position delta
    const deltaX = e.clientX - resizeStartPosition.x;
    const deltaY = e.clientY - resizeStartPosition.y;
    
    // Minimum size constraints
    const minWidth = 200;
    const minHeight = 150;
    
    let newSize: WindowSize = { ...window.size };
    
    // Apply resize based on direction
    switch (resizeDirection) {
      case 'e': // East - right edge
        newSize = {
          width: Math.max(resizeStartSize.width + deltaX, minWidth),
          height: resizeStartSize.height
        };
        break;
      case 's': // South - bottom edge
        newSize = {
          width: resizeStartSize.width,
          height: Math.max(resizeStartSize.height + deltaY, minHeight)
        };
        break;
      case 'se': // Southeast - bottom-right corner
        newSize = {
          width: Math.max(resizeStartSize.width + deltaX, minWidth),
          height: Math.max(resizeStartSize.height + deltaY, minHeight)
        };
        break;
      case 'sw': // Southwest - bottom-left corner
        // For sw, we need to adjust both size and position
        const swWidth = Math.max(resizeStartSize.width - deltaX, minWidth);
        newSize = {
          width: swWidth,
          height: Math.max(resizeStartSize.height + deltaY, minHeight)
        };
        
        // Adjust position if width changed
        if (swWidth !== window.size.width) {
          updateWindowPosition(window.id, {
            x: window.position.x + (window.size.width - swWidth),
            y: window.position.y
          });
        }
        break;
      case 'w': // West - left edge
        // For w, we need to adjust both width and x position
        const wWidth = Math.max(resizeStartSize.width - deltaX, minWidth);
        newSize = {
          width: wWidth,
          height: resizeStartSize.height
        };
        
        // Adjust position if width changed
        if (wWidth !== window.size.width) {
          updateWindowPosition(window.id, {
            x: window.position.x + (window.size.width - wWidth),
            y: window.position.y
          });
        }
        break;
      case 'n': // North - top edge
        // For n, we need to adjust both height and y position
        const nHeight = Math.max(resizeStartSize.height - deltaY, minHeight);
        newSize = {
          width: resizeStartSize.width,
          height: nHeight
        };
        
        // Adjust position if height changed
        if (nHeight !== window.size.height) {
          updateWindowPosition(window.id, {
            x: window.position.x,
            y: window.position.y + (window.size.height - nHeight)
          });
        }
        break;
      case 'ne': // Northeast - top-right corner
        // For ne, we need to adjust height, width, and y position
        const neHeight = Math.max(resizeStartSize.height - deltaY, minHeight);
        newSize = {
          width: Math.max(resizeStartSize.width + deltaX, minWidth),
          height: neHeight
        };
        
        // Adjust position if height changed
        if (neHeight !== window.size.height) {
          updateWindowPosition(window.id, {
            x: window.position.x,
            y: window.position.y + (window.size.height - neHeight)
          });
        }
        break;
      case 'nw': // Northwest - top-left corner
        // For nw, we need to adjust height, width, x and y position
        const nwWidth = Math.max(resizeStartSize.width - deltaX, minWidth);
        const nwHeight = Math.max(resizeStartSize.height - deltaY, minHeight);
        newSize = {
          width: nwWidth,
          height: nwHeight
        };
        
        // Adjust position if dimensions changed
        updateWindowPosition(window.id, {
          x: window.position.x + (window.size.width - nwWidth),
          y: window.position.y + (window.size.height - nwHeight)
        });
        break;
    }
    
    updateWindowSize(window.id, newSize);
  };
  
  // End window resize
  const handleResizeEnd = () => {
    if (resizeDirection) {
      setResizeDirection(null);
      setResizeStartPosition(null);
      setResizeStartSize(null);
      stopResizing(window.id);
    }
  };
  
  // Set up global event listeners for drag and resize
  useEffect(() => {
    // Drag event listeners
    if (dragOffset) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
    
    // Resize event listeners
    if (resizeDirection) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
    
    return undefined;
  }, [dragOffset, resizeDirection]);
  
  // Generate CSS styles for the window
  const windowStyles: React.CSSProperties = {
    zIndex: window.zIndex,
    display: window.isMinimized ? 'none' : 'flex',
    ...(!window.isMaximized ? {
      width: `${window.size.width}px`,
      height: `${window.size.height}px`,
      transform: `translate(${window.position.x}px, ${window.position.y}px)`
    } : {
      width: '100%',
      height: '100%',
      transform: 'translate(0, 0)'
    })
  };
  
  // Determine window class names based on state
  const windowClassName = `window-container ${window.type.toLowerCase()}-window` +
    (window.isMaximized ? ' maximized' : '') +
    (window.isDragging ? ' dragging' : '') +
    (window.isResizing ? ' resizing' : '');

  return (
    <div 
      ref={windowRef}
      className={windowClassName}
      style={windowStyles}
      onClick={handleFocus}
    >
      {/* Window Header */}
      <div 
        ref={headerRef}
        className="window-header"
        onMouseDown={handleDragStart}
      >
        <div className="window-title">{window.title}</div>
        <div className="window-controls">
          <button 
            className="window-control-button minimize-button"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="5" width="8" height="2" fill="currentColor" />
            </svg>
          </button>
          <button 
            className="window-control-button maximize-button"
            onClick={handleMaximizeRestore}
            aria-label={window.isMaximized ? "Restore" : "Maximize"}
          >
            {window.isMaximized ? (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path fill="currentColor" d="M3 3v6h6V3H3zm1 1h4v4H4V4z"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path fill="currentColor" d="M2 2v8h8V2H2zm1 1h6v6H3V3z"/>
              </svg>
            )}
          </button>
          <button 
            className="window-control-button close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M2.5 2.5l7 7m0-7l-7 7"/>
              <path stroke="currentColor" strokeWidth="1.5" d="M2.5 2.5l7 7m0-7l-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="window-content">
        {children}
      </div>
      
      {/* Resize Handles - only shown when not maximized */}
      {!window.isMaximized && (
        <>
          <div 
            className="resize-handle resize-n" 
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="resize-handle resize-e" 
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="resize-handle resize-s" 
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="resize-handle resize-w" 
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div 
            className="resize-handle resize-ne" 
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="resize-handle resize-se" 
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="resize-handle resize-sw" 
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="resize-handle resize-nw" 
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
        </>
      )}
    </div>
  );
};

export default Window;