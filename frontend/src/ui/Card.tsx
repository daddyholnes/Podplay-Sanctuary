import React from 'react';
import styled from '@emotion/styled';
import { useAppStore } from '../store';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  noPadding?: boolean;
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
}

// Styled Card Component
const CardContainer = styled.div<{
  isDarkMode: boolean;
  hoverable?: boolean;
  noPadding?: boolean;
  variant?: 'default' | 'outlined' | 'elevated' | 'gradient';
}>`
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  
  /* Base theme */
  background: ${({ isDarkMode, variant }) => {
    if (variant === 'gradient') {
      return `linear-gradient(135deg, 
        ${isDarkMode ? 'rgba(91, 33, 182, 0.2)' : 'rgba(139, 92, 246, 0.1)'} 0%, 
        ${isDarkMode ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)'} 100%)`;
    }
    return isDarkMode ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.75)';
  }};

  border: 1px solid ${({ isDarkMode, variant }) => {
    if (variant === 'outlined') {
      return isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(139, 92, 246, 0.2)';
    }
    return isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
  }};

  /* Elevation */
  box-shadow: ${({ variant, isDarkMode }) => {
    if (variant === 'elevated') {
      return isDarkMode
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    }
    return 'none';
  }};

  /* Hover effect */
  ${({ hoverable }) =>
    hoverable &&
    `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px -5px rgba(139, 92, 246, 0.2);
    }
  `}

  /* Padding */
  padding: ${({ noPadding }) => (noPadding ? '0' : '1rem')};
`;

// Card Header
const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: ${({ hasSubtitle }) => (hasSubtitle ? '0.5rem' : '1rem')};
`;

const IconWrapper = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${({ isDarkMode }) =>
    isDarkMode
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))'
      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'};
  color: ${({ isDarkMode }) => (isDarkMode ? '#c4b5fd' : '#8b5cf6')};
`;

const TitleWrapper = styled.div`
  flex: 1;
`;

const Title = styled.h3<{ isDarkMode: boolean }>`
  margin: 0;
  color: ${({ isDarkMode }) => (isDarkMode ? 'white' : '#1e293b')};
  font-size: 1.125rem;
  font-weight: 600;
`;

const Subtitle = styled.p<{ isDarkMode: boolean }>`
  margin: 0;
  color: ${({ isDarkMode }) => (isDarkMode ? '#94a3b8' : '#64748b')};
  font-size: 0.875rem;
`;

const Footer = styled.div<{ isDarkMode: boolean }>`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ isDarkMode }) =>
    isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'};
`;

// Card Component
const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  className = '',
  hoverable = false,
  noPadding = false,
  variant = 'default',
}) => {
  // Access the global isDarkMode state
  const isDarkMode = useAppStore(state => state.isDarkMode);

  return (
    <CardContainer
      isDarkMode={isDarkMode}
      hoverable={hoverable}
      noPadding={noPadding}
      variant={variant}
      className={className}
    >
      {(title || icon) && (
        <CardHeader hasSubtitle={!!subtitle}>
          {icon && <IconWrapper isDarkMode={isDarkMode}>{icon}</IconWrapper>}
          {(title || subtitle) && (
            <TitleWrapper>
              {title && <Title isDarkMode={isDarkMode}>{title}</Title>}
              {subtitle && <Subtitle isDarkMode={isDarkMode}>{subtitle}</Subtitle>}
            </TitleWrapper>
          )}
        </CardHeader>
      )}
      
      {children}
      
      {footer && <Footer isDarkMode={isDarkMode}>{footer}</Footer>}
    </CardContainer>
  );
};

export default Card;