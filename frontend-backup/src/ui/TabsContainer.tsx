import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  closable?: boolean;
}

export interface TabsContainerProps {
  tabs: Tab[];
  activeTabId?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underlined';
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onTabAdd?: () => void;
  showAddButton?: boolean;
  className?: string;
  tabClassName?: string;
  contentClassName?: string;
}

// Get size configuration
const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        tabHeight: '32px',
        fontSize: '0.75rem',
        padding: '0.25rem 0.5rem',
        gap: '0.25rem',
        borderRadius: '4px',
      };
    case 'lg':
      return {
        tabHeight: '48px',
        fontSize: '1rem',
        padding: '0.75rem 1.25rem',
        gap: '0.5rem',
        borderRadius: '8px',
      };
    case 'md':
    default:
      return {
        tabHeight: '40px',
        fontSize: '0.875rem',
        padding: '0.5rem 1rem',
        gap: '0.375rem',
        borderRadius: '6px',
      };
  }
};

// Styled Components
const TabsWrapper = styled.div<{
  orientation: string;
  isDarkMode: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.orientation === 'vertical' ? 'row' : 'column'};
  height: 100%;
  background-color: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.5)'};
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(8px);
  border: 1px solid ${props => props.isDarkMode 
    ? 'rgba(71, 85, 105, 0.5)' 
    : 'rgba(226, 232, 240, 0.8)'};
`;

const TabsList = styled.div<{
  orientation: string;
  isDarkMode: boolean;
  variant: string;
  size: string;
}>`
  display: flex;
  flex-direction: ${props => props.orientation === 'vertical' ? 'column' : 'row'};
  align-items: center;
  background-color: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(248, 250, 252, 0.8)'};
  ${props => props.orientation === 'vertical' 
    ? `
      width: ${props.size === 'sm' ? '180px' : props.size === 'lg' ? '240px' : '200px'};
      padding: 0.5rem;
      gap: 0.25rem;
      border-right: 1px solid ${props.isDarkMode 
        ? 'rgba(71, 85, 105, 0.5)' 
        : 'rgba(226, 232, 240, 0.8)'};
    `
    : `
      padding: 0.5rem 0.5rem 0;
      gap: 0.25rem;
      ${props.variant !== 'underlined' ? '' : `
        border-bottom: 1px solid ${props.isDarkMode 
          ? 'rgba(71, 85, 105, 0.5)' 
          : 'rgba(226, 232, 240, 0.8)'};
      `}
    `
  }
  flex-shrink: 0;
  overflow-x: ${props => props.orientation === 'vertical' ? 'hidden' : 'auto'};
  overflow-y: ${props => props.orientation === 'vertical' ? 'auto' : 'hidden'};
  scrollbar-width: thin;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
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

const TabItem = styled(motion.button)<{
  isActive: boolean;
  isDarkMode: boolean;
  variant: string;
  orientation: string;
  size: string;
}>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.orientation === 'vertical' ? 'flex-start' : 'center'};
  height: ${props => getSizeStyles(props.size).tabHeight};
  padding: ${props => getSizeStyles(props.size).padding};
  font-size: ${props => getSizeStyles(props.size).fontSize};
  gap: ${props => getSizeStyles(props.size).gap};
  width: ${props => props.orientation === 'vertical' ? '100%' : 'auto'};
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: ${props => props.isActive 
    ? (props.isDarkMode ? '#f1f5f9' : '#1e293b')
    : (props.isDarkMode ? '#94a3b8' : '#64748b')};
  font-weight: ${props => props.isActive ? '600' : '400'};
  border: none;
  text-align: left;
  
  ${props => {
    if (props.variant === 'pills') {
      return `
        background-color: ${props.isActive 
          ? (props.isDarkMode 
              ? 'rgba(139, 92, 246, 0.2)' 
              : 'rgba(139, 92, 246, 0.1)')
          : 'transparent'};
        border-radius: ${getSizeStyles(props.size).borderRadius};
        
        &:hover:not(:disabled) {
          background-color: ${props.isDarkMode 
            ? 'rgba(139, 92, 246, 0.15)' 
            : 'rgba(139, 92, 246, 0.08)'};
        }
      `;
    } else if (props.variant === 'underlined') {
      return `
        background-color: transparent;
        border-radius: 0;
        ${props.orientation === 'vertical'
          ? `
            border-left: 2px solid ${props.isActive 
              ? (props.isDarkMode ? '#a855f7' : '#8b5cf6')
              : 'transparent'};
            padding-left: calc(${getSizeStyles(props.size).padding.split(' ')[0]} - 2px);
          `
          : `
            border-bottom: 2px solid ${props.isActive 
              ? (props.isDarkMode ? '#a855f7' : '#8b5cf6')
              : 'transparent'};
            margin-bottom: -1px;
          `
        }
        
        &:hover:not(:disabled) {
          background-color: ${props.isDarkMode 
            ? 'rgba(51, 65, 85, 0.5)' 
            : 'rgba(241, 245, 249, 0.8)'};
        }
      `;
    } else {
      // Default variant
      return `
        background-color: ${props.isActive 
          ? (props.isDarkMode 
              ? 'rgba(51, 65, 85, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)')
          : 'transparent'};
        border-radius: ${getSizeStyles(props.size).borderRadius};
        
        &:hover:not(:disabled) {
          background-color: ${props.isDarkMode 
            ? 'rgba(51, 65, 85, 0.5)' 
            : 'rgba(241, 245, 249, 0.8)'};
        }
      `;
    }
  }}
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.isDarkMode 
      ? 'rgba(139, 92, 246, 0.4)' 
      : 'rgba(139, 92, 246, 0.3)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TabIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabLabel = styled.span<{
  orientation: string;
}>`
  flex: ${props => props.orientation === 'vertical' ? '1' : 'none'};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CloseButton = styled.span<{
  isDarkMode: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-left: 0.25rem;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    background-color: ${props => props.isDarkMode 
      ? 'rgba(71, 85, 105, 0.7)' 
      : 'rgba(226, 232, 240, 0.8)'};
  }
`;

const AddButton = styled.button<{
  isDarkMode: boolean;
  size: string;
  variant: string;
  orientation: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => props.orientation === 'vertical' ? '100%' : '32px'};
  height: ${props => getSizeStyles(props.size).tabHeight};
  padding: ${props => props.orientation === 'vertical' 
    ? getSizeStyles(props.size).padding
    : '0 0.5rem'};
  color: ${props => props.isDarkMode ? '#94a3b8' : '#64748b'};
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${props => getSizeStyles(props.size).borderRadius};
  
  &:hover {
    background-color: ${props => props.isDarkMode 
      ? 'rgba(51, 65, 85, 0.5)' 
      : 'rgba(241, 245, 249, 0.8)'};
    color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.isDarkMode 
      ? 'rgba(139, 92, 246, 0.4)' 
      : 'rgba(139, 92, 246, 0.3)'};
  }
`;

const TabContent = styled(motion.div)<{
  isDarkMode: boolean;
}>`
  flex: 1;
  overflow: auto;
  position: relative;
  background-color: ${props => props.isDarkMode 
    ? 'rgba(30, 41, 59, 0.5)' 
    : 'rgba(255, 255, 255, 0.5)'};
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode 
      ? 'rgba(71, 85, 105, 0.5)' 
      : 'rgba(203, 213, 225, 0.5)'};
    border-radius: 4px;
    
    &:hover {
      background: ${props => props.isDarkMode 
        ? 'rgba(100, 116, 139, 0.7)' 
        : 'rgba(148, 163, 184, 0.7)'};
    }
  }
`;

const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  activeTabId,
  orientation = 'horizontal',
  size = 'md',
  variant = 'default',
  onTabChange,
  onTabClose,
  onTabAdd,
  showAddButton = false,
  className = '',
  tabClassName = '',
  contentClassName = '',
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const [activeTab, setActiveTab] = useState<string | undefined>(activeTabId || (tabs.length > 0 ? tabs[0].id : undefined));
  const tabsRef = useRef<HTMLDivElement>(null);

  // Update active tab when activeTabId prop changes
  useEffect(() => {
    if (activeTabId !== undefined && activeTabId !== activeTab) {
      setActiveTab(activeTabId);
    }
  }, [activeTabId]);

  // Update active tab if current tab is removed
  useEffect(() => {
    if (activeTab && !tabs.some(tab => tab.id === activeTab) && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Handle tab close
  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (onTabClose) {
      onTabClose(tabId);
    }
  };

  // Scroll to active tab
  useEffect(() => {
    if (tabsRef.current && activeTab) {
      const activeTabElement = tabsRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
      if (activeTabElement) {
        if (orientation === 'horizontal') {
          const tabsRect = tabsRef.current.getBoundingClientRect();
          const activeTabRect = activeTabElement.getBoundingClientRect();
          
          const isTabVisible = 
            activeTabRect.left >= tabsRect.left &&
            activeTabRect.right <= tabsRect.right;
            
          if (!isTabVisible) {
            const scrollLeft = activeTabElement.offsetLeft - tabsRef.current.offsetWidth / 2 + activeTabElement.offsetWidth / 2;
            tabsRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        } else {
          const tabsRect = tabsRef.current.getBoundingClientRect();
          const activeTabRect = activeTabElement.getBoundingClientRect();
          
          const isTabVisible = 
            activeTabRect.top >= tabsRect.top &&
            activeTabRect.bottom <= tabsRect.bottom;
            
          if (!isTabVisible) {
            const scrollTop = activeTabElement.offsetTop - tabsRef.current.offsetHeight / 2 + activeTabElement.offsetHeight / 2;
            tabsRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
          }
        }
      }
    }
  }, [activeTab, orientation]);

  // Get current active tab content
  const getActiveTabContent = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab ? currentTab.content : null;
  };

  return (
    <TabsWrapper 
      orientation={orientation}
      isDarkMode={isDarkMode}
      className={className}
      role="tablist"
      aria-orientation={orientation}
    >
      <TabsList 
        ref={tabsRef}
        orientation={orientation}
        isDarkMode={isDarkMode}
        variant={variant}
        size={size}
        className={tabClassName}
      >
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            data-tab-id={tab.id}
            isActive={tab.id === activeTab}
            isDarkMode={isDarkMode}
            variant={variant}
            orientation={orientation}
            size={size}
            onClick={() => handleTabChange(tab.id)}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            whileTap={{ scale: 0.98 }}
          >
            {tab.icon && <TabIcon>{tab.icon}</TabIcon>}
            <TabLabel orientation={orientation}>{tab.label}</TabLabel>
            {tab.closable && (
              <CloseButton 
                isDarkMode={isDarkMode}
                onClick={(e) => handleTabClose(e, tab.id)}
                aria-label={`Close ${tab.label} tab`}
              >
                <X size={12} />
              </CloseButton>
            )}
          </TabItem>
        ))}
        
        {showAddButton && onTabAdd && (
          <AddButton
            isDarkMode={isDarkMode}
            size={size}
            variant={variant}
            orientation={orientation}
            onClick={onTabAdd}
            aria-label="Add new tab"
          >
            <Plus size={16} />
          </AddButton>
        )}
      </TabsList>
      
      <TabContent
        isDarkMode={isDarkMode}
        className={contentClassName}
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={activeTab}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ height: '100%' }}
          >
            {getActiveTabContent()}
          </motion.div>
        </AnimatePresence>
      </TabContent>
    </TabsWrapper>
  );
};

export default TabsContainer;