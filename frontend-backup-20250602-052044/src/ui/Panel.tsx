import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Move } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export interface PanelProps {
  title?: string;
  children: React.ReactNode;
  defaultSize?: number; // Width or height in px
  minSize?: number;
  maxSize?: number;
  position?: 'left' | 'right' | 'top' | 'bottom';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  resizable?: boolean;
  draggable?: boolean;
  className?: string;
  onResize?: (size: number) => void;
  onCollapse?: (collapsed: boolean) => void;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

// Get appropriate chevron icon based on position and collapsed state
const getChevronIcon = (position: string, collapsed: boolean, size = 18) => {
  if (position === 'left') return collapsed ? <ChevronRight size={size} /> : <ChevronLeft size={size} />;
  if (position === 'right') return collapsed ? <ChevronLeft size={size} /> : <ChevronRight size={size} />;
  if (position === 'top') return collapsed ? <ChevronDown size={size} /> : <ChevronUp size={size} />;
  if (position === 'bottom') return collapsed ? <ChevronUp size={size} /> : <ChevronDown size={size} />;
  return <ChevronLeft size={size} />;
};

// Determine if panel is vertical or horizontal based on position
const isVertical = (position: string) => {
  return position === 'left' || position === 'right';
};

// Styled components
const PanelContainer = styled(motion.div)<{
  position: string;
  collapsed: boolean;
  size: number;
  minSize: number;
  maxSize: number;
  isDarkMode: boolean;
  isVerticalPanel: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: ${props => props.isVerticalPanel ? 'column' : 'row'};
  ${props => props.isVerticalPanel ? 'height: 100%;' : 'width: 100%;'}
  
  ${props => {
    const sizeValue = props.collapsed ? '0px' : `${props.size}px`;
    if (props.isVerticalPanel) {
      return `
        width: ${sizeValue};
        min-width: ${props.collapsed ? '0px' : `${props.minSize}px`};
        max-width: ${props.maxSize}px;
      `;
    } else {
      return `
        height: ${sizeValue};
        min-height: ${props.collapsed ? '0px' : `${props.minSize}px`};
        max-height: ${props.maxSize}px;
      `;
    }
  }}
  
  background-color: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)' 
    : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 8px;
  overflow: hidden;
  transition: ${props => props.collapsed 
    ? 'all 0.3s ease-out' 
    : 'background-color 0.3s ease, border-color 0.3s ease'};
  box-shadow: 0 4px 6px ${props => props.isDarkMode 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.05)'};
`;

const PanelHeader = styled.div<{
  isDarkMode: boolean;
  isVerticalPanel: boolean;
  draggable: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  ${props => props.isVerticalPanel 
    ? 'border-bottom: 1px solid' 
    : 'border-right: 1px solid'};
  border-color: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)' 
    : 'rgba(226, 232, 240, 0.8)'};
  cursor: ${props => props.draggable ? 'move' : 'default'};
  user-select: none;
  ${props => !props.isVerticalPanel && 'width: 100%;'}
  background-color: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)' 
    : 'rgba(248, 250, 252, 0.8)'};
`;

const PanelTitle = styled.h3<{ isDarkMode: boolean }>`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  flex: 1;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PanelContent = styled.div<{
  collapsed: boolean;
  isDarkMode: boolean;
}>`
  flex: 1;
  overflow: auto;
  padding: ${props => props.collapsed ? '0' : '0.75rem'};
  display: ${props => props.collapsed ? 'none' : 'block'};
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  
  /* Customize scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode 
      ? 'rgba(30, 41, 59, 0.3)' 
      : 'rgba(241, 245, 249, 0.3)'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode 
      ? 'rgba(71, 85, 105, 0.5)' 
      : 'rgba(203, 213, 225, 0.5)'};
    border-radius: 3px;
    
    &:hover {
      background: ${props => props.isDarkMode 
        ? 'rgba(100, 116, 139, 0.7)' 
        : 'rgba(148, 163, 184, 0.7)'};
    }
  }
`;

const PanelFooter = styled.div<{
  isDarkMode: boolean;
  isVerticalPanel: boolean;
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  ${props => props.isVerticalPanel 
    ? 'border-top: 1px solid' 
    : 'border-left: 1px solid'};
  border-color: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)' 
    : 'rgba(226, 232, 240, 0.8)'};
  background-color: ${props => props.isDarkMode 
    ? 'rgba(51, 65, 85, 0.5)' 
    : 'rgba(248, 250, 252, 0.8)'};
`;

const CollapseButton = styled.button<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background-color: ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)' 
    : 'rgba(226, 232, 240, 0.8)'};
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isDarkMode 
      ? 'rgba(100, 116, 139, 0.7)' 
      : 'rgba(203, 213, 225, 0.7)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.4);
  }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
  color: ${props => props.theme.isDarkMode ? '#94a3b8' : '#64748b'};
`;

const ResizeHandle = styled.div<{
  position: string;
  isDarkMode: boolean;
  isVerticalPanel: boolean;
}>`
  position: absolute;
  z-index: 10;
  background-color: transparent;
  
  ${props => {
    if (props.isVerticalPanel) {
      const side = props.position === 'left' ? 'right' : 'left';
      return `
        cursor: col-resize;
        ${side}: -3px;
        width: 6px;
        top: 0;
        bottom: 0;
        
        &:hover::after {
          content: '';
          position: absolute;
          ${side}: 2px;
          width: 2px;
          top: 0;
          bottom: 0;
          background-color: ${props.isDarkMode 
            ? 'rgba(139, 92, 246, 0.6)' 
            : 'rgba(139, 92, 246, 0.4)'};
          border-radius: 1px;
        }
      `;
    } else {
      const side = props.position === 'top' ? 'bottom' : 'top';
      return `
        cursor: row-resize;
        ${side}: -3px;
        height: 6px;
        left: 0;
        right: 0;
        
        &:hover::after {
          content: '';
          position: absolute;
          ${side}: 2px;
          height: 2px;
          left: 0;
          right: 0;
          background-color: ${props.isDarkMode 
            ? 'rgba(139, 92, 246, 0.6)' 
            : 'rgba(139, 92, 246, 0.4)'};
          border-radius: 1px;
        }
      `;
    }
  }}
`;

const Panel: React.FC<PanelProps> = ({
  title,
  children,
  defaultSize = 280,
  minSize = 120,
  maxSize = 600,
  position = 'left',
  collapsible = true,
  defaultCollapsed = false,
  resizable = true,
  draggable = false,
  className = '',
  onResize,
  onCollapse,
  headerContent,
  footerContent,
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const [size, setSize] = useState(defaultSize);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(defaultSize);
  const isVerticalPanel = isVertical(position);

  // Toggle panel collapse
  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    
    if (onCollapse) {
      onCollapse(newCollapsed);
    }
  };

  // Start resize
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    
    if (isVerticalPanel) {
      startPosRef.current = e.clientX;
    } else {
      startPosRef.current = e.clientY;
    }
    
    startSizeRef.current = size;
    
    // Add document event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  // Handle mouse move during resize
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    
    let newSize: number;
    const pos = isVerticalPanel ? e.clientX : e.clientY;
    const diff = isVerticalPanel 
      ? (position === 'left' ? 1 : -1) * (pos - startPosRef.current)
      : (position === 'top' ? 1 : -1) * (pos - startPosRef.current);
    
    newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + diff));
    setSize(newSize);
    
    if (onResize) {
      onResize(newSize);
    }
  };

  // Stop resize
  const stopResize = () => {
    setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResize);
    };
  }, []);

  return (
    <PanelContainer
      ref={panelRef}
      position={position}
      collapsed={collapsed}
      size={size}
      minSize={minSize}
      maxSize={maxSize}
      isDarkMode={isDarkMode}
      isVerticalPanel={isVerticalPanel}
      className={className}
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      data-testid="panel"
      role="region"
      aria-label={title || 'Panel'}
      aria-expanded={!collapsed}
    >
      <PanelHeader
        isDarkMode={isDarkMode}
        isVerticalPanel={isVerticalPanel}
        draggable={draggable}
        aria-label={title ? `${title} panel header` : 'Panel header'}
      >
        {draggable && (
          <DragHandle>
            <Move size={16} />
          </DragHandle>
        )}
        
        {title && <PanelTitle isDarkMode={isDarkMode}>{title}</PanelTitle>}
        {headerContent}
        
        {collapsible && (
          <CollapseButton
            isDarkMode={isDarkMode}
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {getChevronIcon(position, collapsed)}
          </CollapseButton>
        )}
      </PanelHeader>
      
      <PanelContent
        collapsed={collapsed}
        isDarkMode={isDarkMode}
      >
        {children}
      </PanelContent>
      
      {footerContent && (
        <PanelFooter
          isDarkMode={isDarkMode}
          isVerticalPanel={isVerticalPanel}
        >
          {footerContent}
        </PanelFooter>
      )}
      
      {resizable && !collapsed && (
        <ResizeHandle
          position={position}
          isDarkMode={isDarkMode}
          isVerticalPanel={isVerticalPanel}
          onMouseDown={startResize}
          aria-label="Resize panel"
        />
      )}
    </PanelContainer>
  );
};

export default Panel;