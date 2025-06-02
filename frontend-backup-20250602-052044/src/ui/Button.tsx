import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import useAppStore from '../store/useAppStore';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

// Size configurations
const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        height: '32px',
        fontSize: '0.75rem',
        padding: '0 0.75rem',
        iconMargin: '0.25rem',
      };
    case 'lg':
      return {
        height: '48px',
        fontSize: '1rem',
        padding: '0 1.5rem',
        iconMargin: '0.5rem',
      };
    case 'md':
    default:
      return {
        height: '40px',
        fontSize: '0.875rem',
        padding: '0 1rem',
        iconMargin: '0.375rem',
      };
  }
};

// Spinner animation
const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const StyledButton = styled.button<{
  isDarkMode: boolean;
  variant: string;
  size: string;
  fullWidth: boolean;
  isLoading: boolean;
}>`
  /* Common styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${({ size }) => getSizeStyles(size).height};
  padding: ${({ size }) => getSizeStyles(size).padding};
  font-size: ${({ size }) => getSizeStyles(size).fontSize};
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'pointer')};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  font-family: inherit;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  
  /* Variant-specific styles */
  ${({ variant, isDarkMode }) => {
    if (variant === 'primary') {
      return `
        background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
        color: white;
        border: none;
        box-shadow: 0 2px 4px ${isDarkMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'};
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
          box-shadow: 0 4px 8px ${isDarkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'};
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          box-shadow: 0 1px 2px ${isDarkMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'};
          transform: translateY(1px);
        }
      `;
    } else if (variant === 'secondary') {
      return `
        background: ${isDarkMode 
          ? 'rgba(30, 41, 59, 0.8)' 
          : 'rgba(241, 245, 249, 0.8)'};
        color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        border: 1px solid ${isDarkMode 
          ? 'rgba(71, 85, 105, 0.5)' 
          : 'rgba(226, 232, 240, 0.8)'};
        backdrop-filter: blur(8px);
        
        &:hover:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(51, 65, 85, 0.9)' 
            : 'rgba(226, 232, 240, 0.9)'};
          border-color: ${isDarkMode 
            ? 'rgba(100, 116, 139, 0.6)' 
            : 'rgba(203, 213, 225, 0.9)'};
        }
        
        &:active:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(71, 85, 105, 0.9)' 
            : 'rgba(203, 213, 225, 0.9)'};
        }
      `;
    } else if (variant === 'ghost') {
      return `
        background: transparent;
        color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        border: none;
        
        &:hover:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(51, 65, 85, 0.5)' 
            : 'rgba(241, 245, 249, 0.8)'};
        }
        
        &:active:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(71, 85, 105, 0.6)' 
            : 'rgba(226, 232, 240, 0.9)'};
        }
      `;
    } else if (variant === 'outline') {
      return `
        background: transparent;
        color: ${isDarkMode ? '#a855f7' : '#8b5cf6'};
        border: 1px solid ${isDarkMode 
          ? 'rgba(168, 85, 247, 0.5)' 
          : 'rgba(139, 92, 246, 0.5)'};
        
        &:hover:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(168, 85, 247, 0.1)' 
            : 'rgba(139, 92, 246, 0.1)'};
          border-color: ${isDarkMode ? '#a855f7' : '#8b5cf6'};
        }
        
        &:active:not(:disabled) {
          background: ${isDarkMode 
            ? 'rgba(168, 85, 247, 0.15)' 
            : 'rgba(139, 92, 246, 0.15)'};
        }
      `;
    } else if (variant === 'danger') {
      return `
        background: ${isDarkMode 
          ? '#ef4444' 
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background: ${isDarkMode 
            ? '#dc2626' 
            : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'};
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          background: ${isDarkMode ? '#b91c1c' : '#b91c1c'};
          box-shadow: 0 1px 2px rgba(239, 68, 68, 0.2);
          transform: translateY(1px);
        }
      `;
    } else if (variant === 'success') {
      return `
        background: ${isDarkMode 
          ? '#10b981' 
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background: ${isDarkMode 
            ? '#059669' 
            : 'linear-gradient(135deg, #059669 0%, #047857 100%)'};
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          background: ${isDarkMode ? '#047857' : '#047857'};
          box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);
          transform: translateY(1px);
        }
      `;
    }
    
    return '';
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ isDarkMode }) => 
      isDarkMode ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'};
  }
`;

const ButtonContent = styled.div<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: ${({ isLoading }) => (isLoading ? '0' : '1')};
`;

const LeftIcon = styled.span<{ size: string }>`
  display: inline-flex;
  margin-right: ${({ size }) => getSizeStyles(size).iconMargin};
`;

const RightIcon = styled.span<{ size: string }>`
  display: inline-flex;
  margin-left: ${({ size }) => getSizeStyles(size).iconMargin};
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Spinner = styled.div<{ isDarkMode: boolean; size: string; variant: string }>`
  width: ${({ size }) => size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px'};
  height: ${({ size }) => size === 'sm' ? '14px' : size === 'lg' ? '20px' : '16px'};
  border: 2px solid transparent;
  border-top-color: ${({ variant, isDarkMode }) => 
    (variant === 'primary' || variant === 'danger' || variant === 'success') 
      ? 'white'
      : variant === 'outline'
        ? isDarkMode ? '#a855f7' : '#8b5cf6'
        : isDarkMode ? '#f1f5f9' : '#1e293b'};
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;

// Main Button Component
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    
    return (
      <StyledButton
        ref={ref}
        isDarkMode={isDarkMode}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        isLoading={isLoading}
        disabled={disabled || isLoading}
        {...props}
      >
        <ButtonContent isLoading={isLoading}>
          {leftIcon && <LeftIcon size={size}>{leftIcon}</LeftIcon>}
          {children}
          {rightIcon && <RightIcon size={size}>{rightIcon}</RightIcon>}
        </ButtonContent>
        
        {isLoading && (
          <LoadingContainer>
            <Spinner 
              isDarkMode={isDarkMode} 
              size={size} 
              variant={variant} 
            />
            {loadingText && <span>{loadingText}</span>}
          </LoadingContainer>
        )}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;