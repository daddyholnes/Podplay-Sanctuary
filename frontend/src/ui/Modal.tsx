import React, { useRef, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { Button } from './index';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
  height?: string | number;
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  modalClassName?: string;
  overlayClassName?: string;
}

// Styled Components
const ModalOverlay = styled(motion.div)<{ isDarkMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ isDarkMode }) => 
    isDarkMode 
      ? 'rgba(15, 23, 42, 0.8)'
      : 'rgba(15, 23, 42, 0.3)'};
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)<{ 
  isDarkMode: boolean;
  width: string | number;
  height: string | number;
}>`
  position: relative;
  background: ${({ isDarkMode }) => 
    isDarkMode 
      ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))'};
  border-radius: 16px;
  overflow: hidden;
  width: ${({ width }) => typeof width === 'number' ? `${width}px` : width};
  max-width: calc(100vw - 2rem);
  height: ${({ height }) => typeof height === 'number' ? `${height}px` : height};
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ isDarkMode }) => 
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 
              0 10px 10px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ isDarkMode }) => 
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
`;

const ModalTitle = styled.h3<{ isDarkMode: boolean }>`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f1f5f9' : '#1e293b')};
  flex: 1;
`;

const CloseButton = styled.button<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${({ isDarkMode }) => 
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.7)'};
  color: ${({ isDarkMode }) => isDarkMode ? '#cbd5e1' : '#64748b'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ isDarkMode }) => 
      isDarkMode ? 'rgba(71, 85, 105, 0.7)' : 'rgba(226, 232, 240, 0.9)'};
    color: ${({ isDarkMode }) => isDarkMode ? '#f1f5f9' : '#1e293b'};
    transform: scale(1.05);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ isDarkMode }) => 
      isDarkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)'};
  }
`;

const ModalContent = styled.div<{ isDarkMode: boolean; hasFooter: boolean }>`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f1f5f9' : '#1e293b')};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
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
  
  ${({ hasFooter }) => !hasFooter && `
    border-radius: 0 0 16px 16px;
  `}
`;

const ModalFooter = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ isDarkMode }) => 
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
  gap: 0.75rem;
`;

// Modal animations
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, delay: 0.1 }
  }
};

const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 }
  }
};

// Main Modal Component
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = '500px',
  height = 'auto',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  modalClassName,
  overlayClassName,
}) => {
  const isDarkMode = useAppStore(state => state.isDarkMode);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && closeOnEsc && e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);
  
  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Find all focusable elements
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        // Focus the first element
        (focusableElements[0] as HTMLElement).focus();
        
        // Handle tab navigation
        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        };
        
        modalRef.current.addEventListener('keydown', handleTabKey);
        return () => modalRef.current?.removeEventListener('keydown', handleTabKey);
      }
    }
  }, [isOpen]);
  
  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    // Delay actual close to allow animation to complete
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };
  
  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay 
          isDarkMode={isDarkMode}
          className={overlayClassName}
          onClick={handleOverlayClick}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          data-testid="modal-overlay"
        >
          <ModalContainer
            ref={modalRef}
            isDarkMode={isDarkMode}
            width={width}
            height={height}
            className={`${className} ${modalClassName}`}
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {title && (
              <ModalHeader isDarkMode={isDarkMode}>
                <ModalTitle isDarkMode={isDarkMode} id="modal-title">
                  {title}
                </ModalTitle>
                
                {showCloseButton && (
                  <CloseButton 
                    isDarkMode={isDarkMode}
                    onClick={handleClose}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </CloseButton>
                )}
              </ModalHeader>
            )}
            
            <ModalContent isDarkMode={isDarkMode} hasFooter={!!footer}>
              {children}
            </ModalContent>
            
            {footer && (
              <ModalFooter isDarkMode={isDarkMode}>
                {footer}
              </ModalFooter>
            )}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

// Convenience modal components

interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      footer={
        <>
          <Button 
            variant="ghost" 
            onClick={modalProps.onClose}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant === 'danger' ? 'danger' : confirmVariant} 
            onClick={() => {
              onConfirm();
              modalProps.onClose();
            }}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      {typeof message === 'string' ? <p>{message}</p> : message}
    </Modal>
  );
};

export default Modal;