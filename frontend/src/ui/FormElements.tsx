import React, { forwardRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import useAppStore from '../store/useAppStore';

// CHECKBOX COMPONENT
// ====================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const CheckboxLabel = styled.label<{ isDarkMode: boolean; disabled: boolean; size: string }>`
  display: flex;
  align-items: center;
  font-size: ${({ size }) => (size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem')};
  color: ${({ isDarkMode, disabled }) => 
    disabled 
      ? isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.5)'
      : isDarkMode ? '#f1f5f9' : '#1e293b'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
`;

const StyledCheckbox = styled.div<{
  isDarkMode: boolean;
  isChecked: boolean;
  disabled: boolean;
  hasError: boolean;
  size: string;
}>`
  width: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
  height: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
  border-radius: 4px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border: 2px solid ${({ isDarkMode, isChecked, hasError, disabled }) =>
    disabled
      ? isDarkMode ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.5)'
      : hasError
        ? 'rgba(239, 68, 68, 0.7)'
        : isChecked
          ? isDarkMode ? '#a855f7' : '#a855f7'
          : isDarkMode ? 'rgba(100, 116, 139, 0.8)' : 'rgba(148, 163, 184, 0.8)'};
  background: ${({ isDarkMode, isChecked, disabled }) =>
    isChecked
      ? disabled
        ? isDarkMode ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.4)'
        : isDarkMode ? '#a855f7' : '#a855f7'
      : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ disabled, hasError, isDarkMode }) =>
      disabled
        ? isDarkMode ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.5)'
        : hasError
          ? 'rgba(239, 68, 68, 0.8)'
          : isDarkMode ? '#a855f7' : '#a855f7'};
  }
`;

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  margin: 0;
  cursor: inherit;
  z-index: 1;
  
  &:focus + ${StyledCheckbox} {
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const CheckIcon = styled(motion.svg)<{ size: string }>`
  fill: none;
  stroke: white;
  stroke-width: 2px;
  width: ${({ size }) => (size === 'sm' ? '10px' : size === 'lg' ? '16px' : '14px')};
  height: ${({ size }) => (size === 'sm' ? '10px' : size === 'lg' ? '16px' : '14px')};
`;

const HelperText = styled.div<{ isDarkMode: boolean; hasError: boolean }>`
  font-size: 0.75rem;
  margin-top: 0.375rem;
  margin-left: ${({ hasError }) => hasError ? '0' : '2.25rem'};
  color: ${({ isDarkMode, hasError }) =>
    hasError
      ? isDarkMode ? '#f87171' : '#ef4444'
      : isDarkMode ? '#94a3b8' : '#64748b'};
`;

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      containerClassName,
      className,
      disabled = false,
      checked = false,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    
    return (
      <CheckboxContainer className={containerClassName}>
        <CheckboxWrapper>
          <CheckboxLabel
            isDarkMode={isDarkMode}
            disabled={disabled}
            size={size}
          >
            <HiddenCheckbox
              type="checkbox"
              ref={ref}
              disabled={disabled}
              checked={checked}
              {...props}
              className={className}
            />
            <StyledCheckbox
              isDarkMode={isDarkMode}
              isChecked={checked}
              disabled={disabled}
              hasError={!!error}
              size={size}
            >
              {checked && (
                <CheckIcon
                  size={size}
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </CheckIcon>
              )}
            </StyledCheckbox>
            {label}
          </CheckboxLabel>
        </CheckboxWrapper>
        
        {(error || helperText) && (
          <HelperText isDarkMode={isDarkMode} hasError={!!error}>
            {error || helperText}
          </HelperText>
        )}
      </CheckboxContainer>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// RADIO BUTTON COMPONENT
// ======================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClassName?: string;
}

const RadioContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const RadioWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const RadioLabel = styled.label<{ isDarkMode: boolean; disabled: boolean; size: string }>`
  display: flex;
  align-items: center;
  font-size: ${({ size }) => (size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem')};
  color: ${({ isDarkMode, disabled }) => 
    disabled 
      ? isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.5)'
      : isDarkMode ? '#f1f5f9' : '#1e293b'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
`;

const StyledRadio = styled.div<{
  isDarkMode: boolean;
  isChecked: boolean;
  disabled: boolean;
  hasError: boolean;
  size: string;
}>`
  width: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
  height: ${({ size }) => (size === 'sm' ? '16px' : size === 'lg' ? '24px' : '20px')};
  border-radius: 50%;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  border: 2px solid ${({ isDarkMode, isChecked, hasError, disabled }) =>
    disabled
      ? isDarkMode ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.5)'
      : hasError
        ? 'rgba(239, 68, 68, 0.7)'
        : isChecked
          ? isDarkMode ? '#a855f7' : '#a855f7'
          : isDarkMode ? 'rgba(100, 116, 139, 0.8)' : 'rgba(148, 163, 184, 0.8)'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ disabled, hasError, isDarkMode }) =>
      disabled
        ? isDarkMode ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.5)'
        : hasError
          ? 'rgba(239, 68, 68, 0.8)'
          : isDarkMode ? '#a855f7' : '#a855f7'};
  }
`;

const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  margin: 0;
  cursor: inherit;
  z-index: 1;
  
  &:focus + ${StyledRadio} {
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const RadioDot = styled(motion.div)<{
  isDarkMode: boolean;
  disabled: boolean;
  size: string;
}>`
  width: ${({ size }) => (size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px')};
  height: ${({ size }) => (size === 'sm' ? '6px' : size === 'lg' ? '10px' : '8px')};
  border-radius: 50%;
  background: ${({ disabled }) =>
    disabled ? 'rgba(255, 255, 255, 0.7)' : 'white'};
`;

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      containerClassName,
      className,
      disabled = false,
      checked = false,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    
    return (
      <RadioContainer className={containerClassName}>
        <RadioWrapper>
          <RadioLabel
            isDarkMode={isDarkMode}
            disabled={disabled}
            size={size}
          >
            <HiddenRadio
              type="radio"
              ref={ref}
              disabled={disabled}
              checked={checked}
              {...props}
              className={className}
            />
            <StyledRadio
              isDarkMode={isDarkMode}
              isChecked={checked}
              disabled={disabled}
              hasError={!!error}
              size={size}
            >
              {checked && (
                <RadioDot
                  isDarkMode={isDarkMode}
                  disabled={disabled}
                  size={size}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </StyledRadio>
            {label}
          </RadioLabel>
        </RadioWrapper>
        
        {(error || helperText) && (
          <HelperText isDarkMode={isDarkMode} hasError={!!error}>
            {error || helperText}
          </HelperText>
        )}
      </RadioContainer>
    );
  }
);

Radio.displayName = 'Radio';

// SWITCH COMPONENT
// ================

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  containerClassName?: string;
}

const SwitchContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SwitchLabel = styled.label<{ isDarkMode: boolean; disabled: boolean; size: string }>`
  display: flex;
  align-items: center;
  font-size: ${({ size }) => (size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.875rem')};
  color: ${({ isDarkMode, disabled }) => 
    disabled 
      ? isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(100, 116, 139, 0.5)'
      : isDarkMode ? '#f1f5f9' : '#1e293b'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
`;

const getSwitchSize = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        width: '28px',
        height: '16px',
        knobSize: '12px',
        knobOffset: '2px',
        activeOffset: '14px',
      };
    case 'lg':
      return {
        width: '52px',
        height: '28px',
        knobSize: '22px',
        knobOffset: '3px',
        activeOffset: '27px',
      };
    case 'md':
    default:
      return {
        width: '40px',
        height: '22px',
        knobSize: '16px',
        knobOffset: '3px',
        activeOffset: '21px',
      };
  }
};

const SwitchTrack = styled.div<{
  isDarkMode: boolean;
  isChecked: boolean;
  disabled: boolean;
  hasError: boolean;
  size: string;
  activeColor: string;
}>`
  position: relative;
  width: ${({ size }) => getSwitchSize(size).width};
  height: ${({ size }) => getSwitchSize(size).height};
  border-radius: 999px;
  background: ${({ isDarkMode, isChecked, disabled, activeColor }) =>
    disabled
      ? isDarkMode
        ? isChecked ? `rgba(${activeColor}, 0.4)` : 'rgba(71, 85, 105, 0.4)'
        : isChecked ? `rgba(${activeColor}, 0.4)` : 'rgba(203, 213, 225, 0.5)'
      : isChecked
        ? activeColor
        : isDarkMode ? 'rgba(71, 85, 105, 0.7)' : 'rgba(203, 213, 225, 0.8)'};
  margin-right: 0.75rem;
  transition: all 0.2s ease;
  border: 1px solid ${({ isDarkMode, isChecked, hasError, disabled, activeColor }) =>
    disabled
      ? 'transparent'
      : hasError
        ? 'rgba(239, 68, 68, 0.7)'
        : isChecked
          ? 'transparent'
          : isDarkMode ? 'rgba(71, 85, 105, 0.9)' : 'rgba(203, 213, 225, 0.9)'};
  
  &:hover {
    background: ${({ isDarkMode, isChecked, disabled, activeColor }) =>
      disabled
        ? isDarkMode
          ? isChecked ? `rgba(${activeColor}, 0.4)` : 'rgba(71, 85, 105, 0.4)'
          : isChecked ? `rgba(${activeColor}, 0.4)` : 'rgba(203, 213, 225, 0.5)'
        : isChecked
          ? activeColor
          : isDarkMode ? 'rgba(100, 116, 139, 0.7)' : 'rgba(148, 163, 184, 0.8)'};
  }
`;

const SwitchKnob = styled(motion.div)<{
  isDarkMode: boolean;
  disabled: boolean;
  size: string;
}>`
  position: absolute;
  width: ${({ size }) => getSwitchSize(size).knobSize};
  height: ${({ size }) => getSwitchSize(size).knobSize};
  border-radius: 50%;
  background: ${({ isDarkMode, disabled }) =>
    disabled
      ? isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)'
      : 'white'};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  top: 50%;
  transform: translateY(-50%);
  left: ${({ size }) => getSwitchSize(size).knobOffset};
`;

const HiddenSwitch = styled.input`
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  margin: 0;
  cursor: inherit;
  z-index: 1;
  
  &:focus-visible + ${SwitchTrack} {
    box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.3);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      activeColor = '#a855f7',
      containerClassName,
      className,
      disabled = false,
      checked = false,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    const switchSize = getSwitchSize(size);
    
    return (
      <SwitchContainer className={containerClassName}>
        <SwitchWrapper>
          <SwitchLabel
            isDarkMode={isDarkMode}
            disabled={disabled}
            size={size}
          >
            <div style={{ position: 'relative' }}>
              <HiddenSwitch
                type="checkbox"
                ref={ref}
                disabled={disabled}
                checked={checked}
                {...props}
                className={className}
              />
              <SwitchTrack
                isDarkMode={isDarkMode}
                isChecked={checked}
                disabled={disabled}
                hasError={!!error}
                size={size}
                activeColor={activeColor}
              >
                <SwitchKnob
                  isDarkMode={isDarkMode}
                  disabled={disabled}
                  size={size}
                  animate={{
                    left: checked ? switchSize.activeOffset : switchSize.knobOffset,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                />
              </SwitchTrack>
            </div>
            {label}
          </SwitchLabel>
        </SwitchWrapper>
        
        {(error || helperText) && (
          <HelperText isDarkMode={isDarkMode} hasError={!!error}>
            {error || helperText}
          </HelperText>
        )}
      </SwitchContainer>
    );
  }
);

Switch.displayName = 'Switch';

// TEXTAREA COMPONENT
// =================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: 'default' | 'filled' | 'outlined';
  containerClassName?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  rows?: number;
  maxRows?: number;
}

const TextareaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TextareaLabel = styled.label<{ isDarkMode: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f1f5f9' : '#1e293b')};
`;

const StyledTextarea = styled.textarea<{
  isDarkMode: boolean;
  hasError: boolean;
  variant: string;
  resize: string;
}>`
  /* Common styles */
  width: 100%;
  min-height: 100px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: ${({ resize }) => resize};
  
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

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'default',
      containerClassName,
      className,
      resize = 'vertical',
      rows = 4,
      maxRows,
      ...props
    },
    ref
  ) => {
    const isDarkMode = useAppStore((state) => state.isDarkMode);
    const labelId = label ? `${props.id || Math.random().toString(36).substr(2, 9)}-label` : undefined;
    
    return (
      <TextareaContainer className={containerClassName}>
        {label && (
          <TextareaLabel 
            isDarkMode={isDarkMode}
            htmlFor={props.id}
            id={labelId}
          >
            {label}
          </TextareaLabel>
        )}
        
        <StyledTextarea
          ref={ref}
          isDarkMode={isDarkMode}
          hasError={!!error}
          variant={variant}
          resize={resize}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          aria-labelledby={labelId}
          className={className}
          {...props}
        />
        
        {(error || helperText) && (
          <HelperText 
            isDarkMode={isDarkMode} 
            hasError={!!error}
            id={error ? `${props.id}-error` : `${props.id}-helper`}
          >
            {error || helperText}
          </HelperText>
        )}
      </TextareaContainer>
    );
  }
);

Textarea.displayName = 'Textarea';

// Export all form elements
export { Checkbox, Radio, Switch, Textarea };