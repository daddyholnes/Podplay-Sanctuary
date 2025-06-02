import React, { useState, useEffect, useRef } from 'react';
import Menu, { MenuItem } from './Menu';

interface ContextMenuProps {
  items: MenuItem[];
  children: React.ReactNode;
  onItemClick?: (id: string) => void;
  width?: string;
  maxHeight?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  onItemClick,
  width = '220px',
  maxHeight = 'calc(100vh - 20px)',
  disabled = false,
  className,
  menuClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get mouse position
    const x = e.clientX;
    const y = e.clientY;
    
    // Calculate position for menu
    setPosition({ top: y, left: x });
    setIsOpen(true);
  };
  
  // Close context menu
  const handleClose = () => {
    setIsOpen(false);
  };
  
  // Close context menu when clicking elsewhere on the page
  useEffect(() => {
    const handleGlobalClick = () => {
      if (isOpen) {
        handleClose();
      }
    };
    
    // Use mousedown instead of click for more responsive closing
    document.addEventListener('mousedown', handleGlobalClick);
    
    return () => {
      document.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [isOpen]);
  
  // Close context menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);
  
  // Handle item click and close menu
  const handleItemClick = (id: string) => {
    if (onItemClick) {
      onItemClick(id);
    }
    handleClose();
  };
  
  return (
    <div
      ref={containerRef}
      className={className}
      onContextMenu={handleContextMenu}
      style={{ position: 'relative' }}
    >
      {children}
      
      <Menu
        items={items}
        isOpen={isOpen}
        onClose={handleClose}
        position={position}
        width={width}
        maxHeight={maxHeight}
        onItemClick={handleItemClick}
        className={menuClassName}
      />
    </div>
  );
};

export default ContextMenu;