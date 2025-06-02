import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import useAppStore from '../store/useAppStore';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: string;
  maxHeight?: string;
  className?: string;
  label?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        height: '32px',
        fontSize: '0.75rem',
        padding: '0 0.5rem',
      };
    case 'lg':
      return {
        height: '48px',
        fontSize: '1rem',
        padding: '0 1rem',
      };
    case 'md':
    default:
      return {
        height: '40px',
        fontSize: '0.875rem',
        padding: '0 0.75rem',
      };
  }
};

// Styled Components
const DropdownContainer = styled.div<{ width?: string }>`
  position: relative;
  width: ${({ width }) => width || '100%'};
`;

const Label = styled.label<{ isDarkMode: boolean }>`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ isDarkMode }) => (isDarkMode ? '#f1f5f9' : '#1e293b')};
`;

const DropdownTrigger = styled.button<{
  isDarkMode: boolean;
  isOpen: boolean;
  hasError: boolean;
  size: string;
}>`
  width: 100%;
  height: ${({ size }) => getSizeStyles(size).height};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ isDarkMode, isOpen }) =>
    isDarkMode
      ? isOpen 
        ? 'rgba(51, 65, 85, 0.8)' 
        : 'rgba(51, 65, 85, 0.5)'
      : isOpen
        ? 'rgba(248, 250, 252, 0.9)' 
        : 'rgba(255, 255, 255, 0.5)'};
  border: 1px solid ${({ isDarkMode, isOpen, hasError }) =>
    hasError
      ? 'rgba(239, 68, 68, 0.7)'
      : isDarkMode
        ? isOpen 
          ? 'rgba(139, 92, 246, 0.5)' 
          : 'rgba(71, 85, 105, 0.5)'
        : isOpen
          ? 'rgba(139, 92, 246, 0.3)' 
          : 'rgba(226, 232, 240, 0.8)'};
  color: ${({ isDarkMode }) => (isDarkMode ? 'white' : '#1e293b')};
  border-radius: 8px;
  padding: ${({ size }) => getSizeStyles(size).padding};
  font-size: ${({ size }) => getSizeStyles(size).fontSize};
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  box-shadow: ${({ isOpen, hasError }) =>
    hasError
      ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
      : isOpen
        ? '0 0 0 2px rgba(139, 92, 246, 0.2)'
        : 'none'};
  
  &:hover:not(:disabled) {
    border-color: ${({ isDarkMode, hasError }) =>
      hasError
        ? 'rgba(239, 68, 68, 0.8)'
        : isDarkMode
          ? 'rgba(139, 92, 246, 0.7)'
          : 'rgba(139, 92, 246, 0.5)'};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ hasError }) =>
      hasError
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(139, 92, 246, 0.7)'};
    box-shadow: ${({ hasError }) =>
      hasError
        ? '0 0 0 2px rgba(239, 68, 68, 0.2)'
        : '0 0 0 2px rgba(139, 92, 246, 0.2)'};
  }
  
  &:disabled {
    background: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.5)'};
    border-color: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'};
    color: ${({ isDarkMode }) =>
      isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(100, 116, 139, 0.5)'};
    cursor: not-allowed;
  }
`;

const SelectedOptionDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Placeholder = styled.span<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) => (isDarkMode ? '#94a3b8' : '#94a3b8')};
  font-weight: 400;
`;

const ChevronIcon = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  margin-left: 0.5rem;
`;

const OptionsContainer = styled(motion.div)<{
  isDarkMode: boolean;
  maxHeight?: string;
  width: string;
}>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: ${({ width }) => width};
  max-height: ${({ maxHeight }) => maxHeight || '250px'};
  overflow-y: auto;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(30, 41, 59, 0.95)'
      : 'rgba(255, 255, 255, 0.95)'};
  border: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
  border-radius: 8px;
  z-index: 1000;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
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
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
`;

const OptionItem = styled.li<{
  isDarkMode: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  size: string;
}>`
  padding: ${({ size }) =>
    size === 'sm' ? '0.5rem 0.75rem' : 
    size === 'lg' ? '0.75rem 1rem' : 
    '0.6rem 0.85rem'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  background: ${({ isDarkMode, isSelected }) =>
    isSelected
      ? isDarkMode
        ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
        : 'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
      : 'transparent'};
  color: ${({ isDarkMode, isDisabled }) =>
    isDisabled
      ? isDarkMode
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(100, 116, 139, 0.5)'
      : isDarkMode
        ? 'white'
        : '#1e293b'};
  font-size: ${({ size }) => getSizeStyles(size).fontSize};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover:not(:disabled) {
    background: ${({ isDarkMode, isSelected }) =>
      isSelected
        ? isDarkMode
          ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))'
          : 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))'
        : isDarkMode
          ? 'rgba(51, 65, 85, 0.7)'
          : 'rgba(241, 245, 249, 0.7)'};
  }
`;

const OptionLabel = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OptionIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const CheckIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a855f7;
`;

const ErrorMessage = styled.div<{ isDarkMode: boolean }>`
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#f87171' : '#ef4444'};
  font-size: 0.75rem;
  margin-top: 0.5rem;
`;

// Main Component
const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  width = '100%',
  maxHeight,
  className,
  label,
  error,
  size = 'md',
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(option => option.value === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Close dropdown with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };
  
  // Handle option selection
  const handleOptionClick = (option: DropdownOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
    }
  };
  
  // Animation variants
  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -5,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -5,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };
  
  return (
    <DropdownContainer ref={dropdownRef} width={width} className={className}>
      {label && <Label isDarkMode={isDarkMode}>{label}</Label>}
      
      <DropdownTrigger
        type="button"
        isDarkMode={isDarkMode}
        isOpen={isOpen}
        hasError={!!error}
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        size={size}
      >
        <SelectedOptionDisplay>
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <OptionIcon>{selectedOption.icon}</OptionIcon>
              )}
              <OptionLabel>{selectedOption.label}</OptionLabel>
            </>
          ) : (
            <Placeholder isDarkMode={isDarkMode}>{placeholder}</Placeholder>
          )}
        </SelectedOptionDisplay>
        
        <ChevronIcon isOpen={isOpen}>
          <ChevronDown size={16} />
        </ChevronIcon>
      </DropdownTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <OptionsContainer
            isDarkMode={isDarkMode}
            maxHeight={maxHeight}
            width={width}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
          >
            <OptionsList role="listbox" aria-activedescendant={value}>
              {options.map((option) => (
                <OptionItem
                  key={option.value}
                  isDarkMode={isDarkMode}
                  isSelected={option.value === value}
                  isDisabled={!!option.disabled}
                  onClick={() => handleOptionClick(option)}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                  id={option.value}
                  size={size}
                >
                  {option.icon && <OptionIcon>{option.icon}</OptionIcon>}
                  <OptionLabel>{option.label}</OptionLabel>
                  
                  {option.value === value && (
                    <CheckIcon>
                      <Check size={16} />
                    </CheckIcon>
                  )}
                </OptionItem>
              ))}
            </OptionsList>
          </OptionsContainer>
        )}
      </AnimatePresence>
      
      {error && <ErrorMessage isDarkMode={isDarkMode}>{error}</ErrorMessage>}
    </DropdownContainer>
  );
};

export default Dropdown;