import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDesignSystem } from '../../contexts/DesignSystemContext';
import { EnhancedChatInterface } from '../../EnhancedChatInterface';
import './CentralizedChatInterface.css';

// ==================== CENTRALIZED CHAT INTERFACE ==================== 

interface CentralizedChatProps {
  isVisible?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onToggleVisible?: () => void;
  contextInfo?: {
    currentView?: string;
    activeProject?: string;
    currentFile?: string;
  };
}

export const CentralizedChatInterface: React.FC<CentralizedChatProps> = ({
  isVisible = true,
  isExpanded = false,
  onToggleExpanded,
  onToggleVisible,
  contextInfo
}) => {
  const { theme, workspaceState } = useDesignSystem();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const chatRef = useRef<HTMLDivElement>(null);

  // Handle drag functionality for floating mode
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (workspaceState.chatMode === 'floating') {
      setIsDragging(true);
      const rect = chatRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  }, [workspaceState.chatMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && workspaceState.chatMode === 'floating' && chatRef.current) {
      const newX = e.clientX - position.x;
      const newY = e.clientY - position.y;
      
      chatRef.current.style.left = `${Math.max(0, Math.min(window.innerWidth - 400, newX))}px`;
      chatRef.current.style.top = `${Math.max(0, Math.min(window.innerHeight - 600, newY))}px`;
    }
  }, [isDragging, position, workspaceState.chatMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) {
    return (
      <button 
        className="chat-toggle-fab"
        onClick={onToggleVisible}
        title="Open Chat"
      >
        💬
      </button>
    );
  }

  const chatClasses = [
    'centralized-chat-interface',
    `theme-${theme.name}`,
    `mode-${workspaceState.chatMode}`,
    isExpanded ? 'expanded' : 'collapsed',
    isDragging ? 'dragging' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      ref={chatRef}
      className={chatClasses}
      style={{
        '--chat-width': isExpanded ? '600px' : '400px',
        '--chat-height': isExpanded ? '800px' : '500px'
      } as React.CSSProperties}
    >
      {/* Chat Header */}
      <div 
        className="chat-header"
        onMouseDown={handleMouseDown}
        style={{ cursor: workspaceState.chatMode === 'floating' ? 'move' : 'default' }}
      >
        <div className="chat-header-content">
          <div className="chat-title">
            <span className="chat-icon">🐻</span>
            <span>Mama Bear Assistant</span>
            {contextInfo?.currentView && (
              <span className="context-indicator">
                {contextInfo.currentView}
              </span>
            )}
          </div>
          
          <div className="chat-controls">
            {onToggleExpanded && (
              <button 
                className="chat-control-btn"
                onClick={onToggleExpanded}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '🗗' : '🗖'}
              </button>
            )}
            
            {onToggleVisible && (
              <button 
                className="chat-control-btn"
                onClick={onToggleVisible}
                title="Minimize Chat"
              >
                ➖
              </button>
            )}
          </div>
        </div>
        
        {/* Context Information */}
        {contextInfo && (
          <div className="chat-context-bar">
            {contextInfo.activeProject && (
              <span className="context-item">
                📁 {contextInfo.activeProject}
              </span>
            )}
            {contextInfo.currentFile && (
              <span className="context-item">
                📄 {contextInfo.currentFile}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="chat-content">
        <EnhancedChatInterface />
      </div>

      {/* Resize Handle */}
      {workspaceState.chatMode === 'floating' && (
        <div className="chat-resize-handle" />
      )}
    </div>
  );
};

export default CentralizedChatInterface;
