import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: MenuItem[];
  selected?: boolean;
  shortcut?: string;
  danger?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  anchor?: HTMLElement | null;
  position?: { top?: number; left?: number; bottom?: number; right?: number };
  maxHeight?: string;
  width?: string;
  className?: string;
  onItemClick?: (id: string) => void;
}

// Styled Components
const MenuContainer = styled(motion.div)<{
  isDarkMode: boolean;
  maxHeight: string;
  width: string;
  hasPosition: boolean;
}>`
  position: ${({ hasPosition }) => (hasPosition ? 'fixed' : 'absolute')};
  z-index: 1000;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.8)'};
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.2),
              0 8px 15px -5px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  width: ${({ width }) => width};
  max-height: ${({ maxHeight }) => maxHeight};
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)'};
    border-radius: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(71, 85, 105, 0.7)' : 'rgba(148, 163, 184, 0.7)'};
    border-radius: 8px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(100, 116, 139, 0.9)' : 'rgba(100, 116, 139, 0.7)'};
  }
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
`;

const MenuItemContainer = styled.li<{
  isDarkMode: boolean;
  disabled: boolean;
  danger: boolean;
  isSelected: boolean;
  hasSubmenu: boolean;
}>`
  padding: 0.5rem 1rem;
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  position: relative;
  color: ${({ isDarkMode, disabled, danger }) =>
    disabled
      ? isDarkMode
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(100, 116, 139, 0.5)'
      : danger
        ? isDarkMode ? '#f87171' : '#ef4444'
        : isDarkMode
          ? 'white'
          : '#1e293b'};
  background: ${({ isDarkMode, isSelected }) =>
    isSelected
      ? isDarkMode
        ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
        : 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
      : 'transparent'};
  transition: all 0.15s ease;
  font-size: 0.875rem;
  
  ${({ hasSubmenu }) => hasSubmenu && `
    padding-right: 2rem;
  `}
  
  &:hover:not(:disabled) {
    background: ${({ isDarkMode, danger, isSelected }) =>
      isSelected
        ? isDarkMode
          ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))'
          : 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
        : isDarkMode
          ? danger
            ? 'rgba(239, 68, 68, 0.2)'
            : 'rgba(51, 65, 85, 0.7)'
          : danger
            ? 'rgba(254, 226, 226, 0.5)'
            : 'rgba(241, 245, 249, 0.7)'};
  }
  
  &:active:not(:disabled) {
    background: ${({ isDarkMode, danger }) =>
      isDarkMode
        ? danger
          ? 'rgba(239, 68, 68, 0.3)'
          : 'rgba(71, 85, 105, 0.8)'
        : danger
          ? 'rgba(254, 202, 202, 0.6)'
          : 'rgba(226, 232, 240, 0.8)'};
  }
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const LabelContainer = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShortcutText = styled.span<{ isDarkMode: boolean }>`
  font-size: 0.75rem;
  color: ${({ isDarkMode }) => (isDarkMode ? '#94a3b8' : '#94a3b8')};
  margin-left: 0.5rem;
`;

const SubmenuIcon = styled.span<{ isOpen: boolean }>`
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(90deg)' : 'none')};
  transition: transform 0.2s ease;
`;

const Divider = styled.div<{ isDarkMode: boolean }>`
  height: 1px;
  background: ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(226, 232, 240, 0.8)'};
  margin: 0.5rem 0;
`;

const CheckIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
`;

// Animation variants
const menuVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

const submenuVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: -5,
    transition: {
      duration: 0.1,
    },
  },
};

// Main Component
const Menu: React.FC<MenuProps> = ({
  items,
  isOpen,
  onClose,
  anchor,
  position,
  maxHeight = 'calc(100vh - 20px)',
  width = '220px',
  className,
  onItemClick,
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([]);
  const [menuPosition, setMenuPosition] = useState({
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    bottom: position?.bottom,
    right: position?.right,
  });
  
  // Calculate position based on anchor element
  useEffect(() => {
    if (anchor && isOpen) {
      const rect = anchor.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Default position at the bottom of the anchor
      let newTop = rect.bottom + 5;
      let newLeft = rect.left;
      
      // Check if menu goes off the bottom of the screen
      if (newTop + 200 > windowHeight) {
        // Position above the anchor instead
        newTop = rect.top - 5;
        setMenuPosition((prev) => ({
          ...prev,
          bottom: windowHeight - newTop,
          top: undefined,
        }));
      } else {
        setMenuPosition((prev) => ({
          ...prev,
          top: newTop,
          bottom: undefined,
        }));
      }
      
      // Check if menu goes off the right of the screen
      if (newLeft + parseInt(width, 10) > windowWidth) {
        newLeft = rect.right - parseInt(width, 10);
      }
      
      setMenuPosition((prev) => ({
        ...prev,
        left: newLeft,
        right: undefined,
      }));
    } else if (position) {
      setMenuPosition({
        top: position.top,
        left: position.left,
        bottom: position.bottom,
        right: position.right,
      });
    }
  }, [anchor, isOpen, position, width]);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        anchor !== event.target &&
        !anchor?.contains(event.target as Node)
      ) {
        onClose();
        setOpenSubmenuIds([]);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchor]);
  
  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
        setOpenSubmenuIds([]);
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Toggle submenu
  const toggleSubmenu = (id: string, hasSubmenu: boolean) => {
    if (hasSubmenu) {
      setOpenSubmenuIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };
  
  // Handle menu item click
  const handleItemClick = (item: MenuItem) => {
    if (item.disabled) return;
    
    if (item.submenu) {
      toggleSubmenu(item.id, true);
    } else {
      if (item.onClick) {
        item.onClick();
      }
      
      if (onItemClick) {
        onItemClick(item.id);
      }
      
      if (!item.submenu) {
        onClose();
        setOpenSubmenuIds([]);
      }
    }
  };
  
  // Render menu items recursively
  const renderMenuItems = (menuItems: MenuItem[], level = 0) => {
    return (
      <MenuList role="menu">
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} isDarkMode={isDarkMode} />;
          }
          
          const isSubmenuOpen = openSubmenuIds.includes(item.id);
          
          return (
            <React.Fragment key={item.id}>
              <MenuItemContainer
                isDarkMode={isDarkMode}
                disabled={!!item.disabled}
                danger={!!item.danger}
                isSelected={!!item.selected}
                hasSubmenu={!!item.submenu}
                onClick={() => handleItemClick(item)}
                role="menuitem"
                aria-disabled={item.disabled}
                aria-haspopup={!!item.submenu}
                aria-expanded={isSubmenuOpen}
              >
                {item.icon && <IconContainer>{item.icon}</IconContainer>}
                
                <LabelContainer>{item.label}</LabelContainer>
                
                {item.selected && !item.submenu && (
                  <CheckIcon>
                    <Check size={16} />
                  </CheckIcon>
                )}
                
                {item.shortcut && (
                  <ShortcutText isDarkMode={isDarkMode}>
                    {item.shortcut}
                  </ShortcutText>
                )}
                
                {item.submenu && (
                  <SubmenuIcon isOpen={isSubmenuOpen}>
                    <ChevronRight size={14} />
                  </SubmenuIcon>
                )}
              </MenuItemContainer>
              
              {item.submenu && (
                <AnimatePresence>
                  {isSubmenuOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={submenuVariants}
                      style={{ paddingLeft: '1rem' }}
                    >
                      {renderMenuItems(item.submenu, level + 1)}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </React.Fragment>
          );
        })}
      </MenuList>
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <MenuContainer
          ref={menuRef}
          isDarkMode={isDarkMode}
          maxHeight={maxHeight}
          width={width}
          hasPosition={!!position || !!anchor}
          style={menuPosition}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
          className={className}
        >
          {renderMenuItems(items)}
        </MenuContainer>
      )}
    </AnimatePresence>
  );
};

export default Menu;