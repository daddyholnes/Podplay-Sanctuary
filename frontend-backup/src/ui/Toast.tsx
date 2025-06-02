import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // milliseconds
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast container system
interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  children: React.ReactNode;
}

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top-left':
      return { top: '1rem', left: '1rem' };
    case 'bottom-right':
      return { bottom: '1rem', right: '1rem' };
    case 'bottom-left':
      return { bottom: '1rem', left: '1rem' };
    case 'top-center':
      return { top: '1rem', left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-center':
      return { bottom: '1rem', left: '50%', transform: 'translateX(-50%)' };
    case 'top-right':
    default:
      return { top: '1rem', right: '1rem' };
  }
};

// Toast icons
const getToastIcon = (type: string, size = 20) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={size} />;
    case 'warning':
      return <AlertTriangle size={size} />;
    case 'error':
      return <AlertCircle size={size} />;
    case 'info':
    default:
      return <Info size={size} />;
  }
};

// Color scheme by type
const getToastColors = (type: string, isDarkMode: boolean) => {
  switch (type) {
    case 'success':
      return {
        bg: isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
        border: isDarkMode ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)',
        icon: '#10b981', // emerald-500
      };
    case 'warning':
      return {
        bg: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
        border: isDarkMode ? 'rgba(245, 158, 11, 0.5)' : 'rgba(245, 158, 11, 0.3)',
        icon: '#f59e0b', // amber-500
      };
    case 'error':
      return {
        bg: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
        border: isDarkMode ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.3)',
        icon: '#ef4444', // red-500
      };
    case 'info':
    default:
      return {
        bg: isDarkMode ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.1)',
        border: isDarkMode ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.3)',
        icon: '#a855f7', // purple-500
      };
  }
};

// Styled components
const ToastContainerStyled = styled(motion.div)<{ position: string }>`
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 420px;
  ${props => getPositionStyles(props.position)}
`;

const ToastStyled = styled(motion.div)<{
  type: string;
  isDarkMode: boolean;
}>`
  display: flex;
  position: relative;
  padding: 1rem;
  border-radius: 8px;
  backdrop-filter: blur(8px);
  background-color: ${props => getToastColors(props.type, props.isDarkMode).bg};
  border: 1px solid ${props => getToastColors(props.type, props.isDarkMode).border};
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
  box-shadow: 0 4px 6px ${props => 
    props.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  overflow: hidden;
`;

const IconContainer = styled.div<{
  type: string;
}>`
  display: flex;
  align-items: flex-start;
  color: ${props => getToastColors(props.type, false).icon};
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.h3<{ isDarkMode: boolean }>`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f1f5f9' : '#1e293b'};
`;

const ToastMessage = styled.p<{ isDarkMode: boolean }>`
  margin: 0.25rem 0 0 0;
  font-size: 0.75rem;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#475569'};
  line-height: 1.4;
`;

const ActionButton = styled.button<{
  type: string;
  isDarkMode: boolean;
}>`
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
  background-color: ${props => 
    props.isDarkMode 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(255, 255, 255, 0.5)'};
  color: ${props => getToastColors(props.type, false).icon};
  border: 1px solid ${props => getToastColors(props.type, props.isDarkMode).border};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => 
      props.isDarkMode 
        ? 'rgba(0, 0, 0, 0.3)' 
        : 'rgba(255, 255, 255, 0.7)'};
  }
`;

const CloseButton = styled.button<{ isDarkMode: boolean }>`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 4px;
  background-color: transparent;
  color: ${props => props.isDarkMode ? '#cbd5e1' : '#475569'};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => 
      props.isDarkMode 
        ? 'rgba(0, 0, 0, 0.2)' 
        : 'rgba(0, 0, 0, 0.05)'};
  }
`;

// Progress bar animation
const ProgressBar = styled(motion.div)<{
  type: string;
  isDarkMode: boolean;
}>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: ${props => getToastColors(props.type, false).icon};
  opacity: 0.7;
`;

// Individual Toast component
export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
  action,
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      // Small delay to allow exit animation to play
      setTimeout(onClose, 300);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <ToastStyled
          key={id}
          type={type}
          isDarkMode={isDarkMode}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          role="alert"
          aria-live="polite"
        >
          <IconContainer type={type}>
            {getToastIcon(type)}
          </IconContainer>

          <ContentContainer>
            <ToastTitle isDarkMode={isDarkMode}>{title}</ToastTitle>
            {message && <ToastMessage isDarkMode={isDarkMode}>{message}</ToastMessage>}
            
            {action && (
              <ActionButton 
                type={type}
                isDarkMode={isDarkMode}
                onClick={action.onClick}
              >
                {action.label}
              </ActionButton>
            )}
          </ContentContainer>

          <CloseButton 
            isDarkMode={isDarkMode}
            onClick={handleClose}
            aria-label="Close notification"
          >
            <X size={14} />
          </CloseButton>

          {duration > 0 && (
            <ProgressBar
              type={type}
              isDarkMode={isDarkMode}
              initial={{ width: '100%' }}
              animate={{ width: '0%', transition: { duration: duration / 1000, ease: 'linear' } }}
            />
          )}
        </ToastStyled>
      )}
    </AnimatePresence>
  );
};

// Toast Container component
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children
}) => {
  return (
    <ToastContainerStyled
      position={position}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </ToastContainerStyled>
  );
};

// Toast context and hook for global toast management
export const createToast = (toastOptions: Omit<ToastProps, 'id'>) => {
  // This would normally be implemented with a React context or state management
  // For now, a placeholder that would be replaced with actual implementation
  console.log('Toast created:', toastOptions);
};

export default Toast;