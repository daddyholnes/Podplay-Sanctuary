import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import useAppStore from '../store/useAppStore';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  onLeftIconClick?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  containerClassName?: string;
}

// Size configurations
const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        height: '32px',
        fontSize: '0.75rem',
        padding: '0 0.5rem',
        iconSize: '14px',
        iconPadding: '0 0.5rem',
      };
    case 'lg':
      return {
        height: '48px',
        fontSize: '1rem',
        padding: '0 1rem',
        iconSize: '20px',
        iconPadding: '0 1rem',
      };
    case 'md':
    default:
      return {
        height: '40px',
        fontSize: '0.875rem',
        padding: '0 0.75rem',
        iconSize: '16px',
        iconPadding: '0 0.75rem',
      };
  }
};

// Styled Components
const InputContainer = styled.div<{ fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  position: relative;
`;

const InputLabel = styled.label<{ isDarkMode: boolean; size: string }>`
  font-size: ${({ size }) => 
    size === 'sm' ? '0.75rem' : size === 'lg' ? '0.9rem' : '0.8rem'};
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f1f5f9' : '#1e293b')};
`;

const StyledInput = styled.input<{
  isDarkMode: boolean;
  hasError: boolean;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  variant: string;
  size: string;
}>`
  height: ${({ size }) => getSizeStyles(size).height};
  padding: ${({ size, hasLeftIcon, hasRightIcon }) => {
    const basePadding = getSizeStyles(size).padding;
    const [paddingV, paddingH] = basePadding.split(' ');
    const leftPadding = hasLeftIcon ? '2.25rem' : paddingH;
    const rightPadding = hasRightIcon ? '2.25rem' : paddingH;
    return `${paddingV} ${rightPadding} ${paddingV} ${leftPadding}`;
  }};
  font-size: ${({ size }) => getSizeStyles(size).fontSize};
  
  /* Common styles */
  width: 100%;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
  
  /* Variant-specific styles */
  ${({ variant, isDarkMode, hasError }) => {
    if (variant === 'filled') {
      return `
        background: ${isDarkMode ? 'rgba(51, 65, 85, 0.7)' : 'rgba(241, 245, 249, 0.7)'};
        border: 1px solid ${hasError 
          ? 'rgba(239, 68, 68, 0.7)' 
          : 'transparent'};
        color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        
        &:focus {
          background: ${isDarkMode ? 'rgba(51, 65, 85, 0.9)' : 'rgba(248, 250, 252, 0.9)'};
          border-color: ${hasError 
            ? 'rgba(239, 68, 68, 0.8)' 
            : 'rgba(139, 92, 246, 0.7)'};
          box-shadow: 0 0 0 2px ${hasError 
            ? 'rgba(239, 68, 68, 0.2)' 
            : 'rgba(139, 92, 246, 0.2)'};
        }
      `;
    } else if (variant === 'outlined') {
      return `
        background: transparent;
        border: 1px solid ${hasError 
          ? 'rgba(239, 68, 68, 0.7)' 
          : isDarkMode 
            ? 'rgba(71, 85, 105, 0.7)' 
            : 'rgba(203, 213, 225, 0.8)'};
        color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        
        &:focus {
          border-color: ${hasError 
            ? 'rgba(239, 68, 68, 0.8)' 
            : 'rgba(139, 92, 246, 0.7)'};
          box-shadow: 0 0 0 2px ${hasError 
            ? 'rgba(239, 68, 68, 0.2)' 
            : 'rgba(139, 92, 246, 0.2)'};
        }
      `;
    } else { // default
      return `
        background: ${isDarkMode 
          ? 'rgba(30, 41, 59, 0.5)' 
          : 'rgba(255, 255, 255, 0.5)'};
        border: 1px solid ${hasError 
          ? 'rgba(239, 68, 68, 0.7)' 
          : isDarkMode 
            ? 'rgba(51, 65, 85, 0.5)' 
            : 'rgba(226, 232, 240, 0.8)'};
        color: ${isDarkMode ? '#f1f5f9' : '#1e293b'};
        backdrop-filter: blur(8px);
        
        &:focus {
          border-color: ${hasError 
            ? 'rgba(239, 68, 68, 0.8)' 
            : 'rgba(139, 92, 246, 0.7)'};
          box-shadow: 0 0 0 2px ${hasError 
            ? 'rgba(239, 68, 68, 0.2)' 
            : 'rgba(139, 92, 246, 0.2)'};
        }
      `;
    }
  }}
  
  &:hover:not(:disabled) {
    border-color: ${({ hasError }) =>
      hasError 
        ? 'rgba(239, 68, 68, 0.8)' 
        : 'rgba(139, 92, 246, 0.5)'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${({ isDarkMode }) => 
      isDarkMode ? 'rgba(148, 163, 184, 0.7)' : 'rgba(148, 163, 184, 0.7)'};
  }
  
  &:focus {
    outline: none;
  }
`;

const IconContainer = styled.div<{ 
  position: 'left' | 'right';
  isDarkMode: boolean;
  clickable: boolean;
  size: string;
}>`
  position: absolute;
  top: 50%;
  ${({ position }) => position === 'left' ? 'left: 0.75rem;' : 'right: 0.75rem;'}
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ isDarkMode }) => (isDarkMode ? '#94a3b8' : '#64748b')};
  pointer-events: ${({ clickable }) => (clickable ? 'auto' : 'none')};
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ clickable, isDarkMode }) => 
      clickable 
        ? isDarkMode ? '#f1f5f9' : '#1e293b' 
        : ''};
  }
`;

const HelperText = styled.div<{ isDarkMode: boolean; hasError: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.375rem;
  color: ${({ isDarkMode, hasError }) =>
    hasError
      ? isDarkMode ? '#f87171' : '#ef4444'
      : isDarkMode ? '#94a3b8' : '#64748b'};
`;

// Main Input Component
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      onRightIconClick,
      onLeftIconClick,
      variant = 'default',
      size = 'md',
      fullWidth = true,
      containerClassName,
      className,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    const labelId = label ? `${props.id || Math.random().toString(36).substr(2, 9)}-label` : undefined;
    
    return (
      <InputContainer fullWidth={fullWidth} className={containerClassName}>
        {label && (
          <InputLabel 
            isDarkMode={isDarkMode}
            htmlFor={props.id}
            id={labelId}
            size={size}
          >
            {label}
          </InputLabel>
        )}
        
        <div style={{ position: 'relative' }}>
          {leftIcon && (
            <IconContainer
              position="left"
              isDarkMode={isDarkMode}
              clickable={!!onLeftIconClick}
              onClick={onLeftIconClick}
              size={size}
            >
              {leftIcon}
            </IconContainer>
          )}
          
          <StyledInput
            ref={ref}
            isDarkMode={isDarkMode}
            hasError={!!error}
            hasLeftIcon={!!leftIcon}
            hasRightIcon={!!rightIcon}
            variant={variant}
            size={size}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            aria-labelledby={labelId}
            className={className}
            {...props}
          />
          
          {rightIcon && (
            <IconContainer
              position="right"
              isDarkMode={isDarkMode}
              clickable={!!onRightIconClick}
              onClick={onRightIconClick}
              size={size}
            >
              {rightIcon}
            </IconContainer>
          )}
        </div>
        
        {(error || helperText) && (
          <HelperText 
            isDarkMode={isDarkMode} 
            hasError={!!error}
            id={error ? `${props.id}-error` : `${props.id}-helper`}
          >
            {error || helperText}
          </HelperText>
        )}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

export default Input;