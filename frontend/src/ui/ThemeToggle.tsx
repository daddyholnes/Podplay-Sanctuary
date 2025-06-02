import React from 'react';
import styled from '@emotion/styled';
import { Sun, Moon } from 'lucide-react';
import useAppStore from '../store/useAppStore';

interface ThemeToggleProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ToggleContainer = styled.button<{ isDarkMode: boolean; size: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'rgba(51, 65, 85, 0.5)'
      : 'rgba(241, 245, 249, 0.7)'};
  color: ${({ isDarkMode }) =>
    isDarkMode ? '#f1f5f9' : '#1e293b'};
  
  ${({ size }) => {
    switch (size) {
      case 'small':
        return `
          width: 32px;
          height: 32px;
          padding: 6px;
        `;
      case 'large':
        return `
          width: 48px;
          height: 48px;
          padding: 12px;
        `;
      case 'medium':
      default:
        return `
          width: 40px;
          height: 40px;
          padding: 8px;
        `;
    }
  }}
  
  &:hover {
    background: ${({ isDarkMode }) =>
      isDarkMode
        ? 'rgba(71, 85, 105, 0.7)'
        : 'rgba(226, 232, 240, 0.9)'};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ isDarkMode }) =>
      isDarkMode
        ? 'rgba(139, 92, 246, 0.5)'
        : 'rgba(139, 92, 246, 0.3)'};
  }
`;

const IconContainer = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
  
  svg {
    position: absolute;
    transition: all 0.3s ease;
    
    &.sun {
      opacity: ${({ isDarkMode }) => (isDarkMode ? 0 : 1)};
      transform: ${({ isDarkMode }) => (isDarkMode ? 'rotate(-90deg) scale(0.5)' : 'rotate(0) scale(1)')};
    }
    
    &.moon {
      opacity: ${({ isDarkMode }) => (isDarkMode ? 1 : 0)};
      transform: ${({ isDarkMode }) => (isDarkMode ? 'rotate(0) scale(1)' : 'rotate(90deg) scale(0.5)')};
    }
  }
`;

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, size = 'medium' }) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  return (
    <ToggleContainer
      isDarkMode={isDarkMode}
      size={size}
      onClick={toggleDarkMode}
      className={className}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <IconContainer isDarkMode={isDarkMode}>
        <Sun className="sun" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        <Moon className="moon" size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
      </IconContainer>
    </ToggleContainer>
  );
};

export default ThemeToggle;