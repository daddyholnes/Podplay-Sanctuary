import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../store/useAppStore';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: string;
  showArrow?: boolean;
  className?: string;
  tooltipClassName?: string;
  disabled?: boolean;
}

// Styled Components
const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  vertical-align: middle;
`;

const TooltipContent = styled(motion.div)<{
  isDarkMode: boolean;
  position: string;
  maxWidth: string;
}>`
  position: absolute;
  z-index: 1000;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(15, 23, 42, 0.9)'};
  color: ${({ isDarkMode }) => (isDarkMode ? '#f8fafc' : '#f8fafc')};
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 400;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: ${({ maxWidth }) => maxWidth};
  backdrop-filter: blur(4px);
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)'};
    
  ${({ position }) => {
    if (position === 'top') return 'bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);';
    if (position === 'bottom') return 'top: calc(100% + 8px); left: 50%; transform: translateX(-50%);';
    if (position === 'left') return 'right: calc(100% + 8px); top: 50%; transform: translateY(-50%);';
    if (position === 'right') return 'left: calc(100% + 8px); top: 50%; transform: translateY(-50%);';
    return '';
  }}
`;

const Arrow = styled.div<{
  isDarkMode: boolean;
  position: string;
}>`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(15, 23, 42, 0.9)'};
  transform: rotate(45deg);
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(51, 65, 85, 0.3)'};
    
  ${({ position }) => {
    if (position === 'top') return 'top: 100%; left: 50%; margin-left: -4px; border-top: none; border-left: none;';
    if (position === 'bottom') return 'bottom: 100%; left: 50%; margin-left: -4px; border-bottom: none; border-right: none;';
    if (position === 'left') return 'left: 100%; top: 50%; margin-top: -4px; border-left: none; border-bottom: none;';
    if (position === 'right') return 'right: 100%; top: 50%; margin-top: -4px; border-right: none; border-top: none;';
    return '';
  }}
`;

// Animation variants
const tooltipVariants = {
  hidden: (position: string) => {
    if (position === 'top') return { opacity: 0, y: 5 };
    if (position === 'bottom') return { opacity: 0, y: -5 };
    if (position === 'left') return { opacity: 0, x: 5 };
    if (position === 'right') return { opacity: 0, x: -5 };
    return {};
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: (position: string) => {
    if (position === 'top') return { opacity: 0, y: 3, transition: { duration: 0.1 } };
    if (position === 'bottom') return { opacity: 0, y: -3, transition: { duration: 0.1 } };
    if (position === 'left') return { opacity: 0, x: 3, transition: { duration: 0.1 } };
    if (position === 'right') return { opacity: 0, x: -3, transition: { duration: 0.1 } };
    return {};
  },
};

// Main Component
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = '200px',
  showArrow = true,
  className,
  tooltipClassName,
  disabled = false,
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  
  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsVisible(false);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Handle keyboard focus
  const handleFocus = () => {
    if (!disabled) setIsVisible(true);
  };
  
  const handleBlur = () => {
    setIsVisible(false);
  };
  
  // Render tooltip with child element
  return (
    <TooltipContainer
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={triggerRef}
    >
      {/* Clone and pass necessary props to child to handle focus/blur events */}
      {React.isValidElement(children) ? 
        React.cloneElement(children as React.ReactElement, {
          onFocus: handleFocus,
          onBlur: handleBlur,
          'aria-describedby': isVisible ? 'tooltip' : undefined,
        }) : 
        children}
      
      <AnimatePresence>
        {isVisible && content && (
          <TooltipContent
            isDarkMode={isDarkMode}
            position={position}
            maxWidth={maxWidth}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tooltipVariants}
            custom={position}
            className={tooltipClassName}
            id="tooltip"
            role="tooltip"
            aria-live="polite"
          >
            {content}
            {showArrow && (
              <Arrow isDarkMode={isDarkMode} position={position} />
            )}
          </TooltipContent>
        )}
      </AnimatePresence>
    </TooltipContainer>
  );
};

export default Tooltip;