import React from 'react';
import styled from '@emotion/styled';
import useAppStore from '../store/useAppStore';

export interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  showStatus?: boolean;
  className?: string;
}

// Get avatar size in pixels
const getAvatarSize = (size: string): number => {
  switch (size) {
    case 'xs': return 24;
    case 'sm': return 32;
    case 'lg': return 48;
    case 'xl': return 64;
    case 'md':
    default: return 40;
  }
};

// Generate a consistent color based on name
const getAvatarColor = (name: string): string => {
  // Calculate hash code from name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Purple-focused color palette
  const colorPalette = [
    '#a855f7', // purple-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#c084fc', // purple-400
    '#9333ea', // purple-600
    '#7e22ce', // purple-700
    '#a78bfa', // violet-400
    '#6d28d9', // violet-700
    '#e879f9', // fuchsia-400
    '#9d174d', // pink-800
  ];
  
  // Pick a color from the palette based on the hash
  const colorIndex = Math.abs(hash) % colorPalette.length;
  return colorPalette[colorIndex];
};

// Extract initials from name
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const parts = name.trim().split(/\\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Status indicator colors
const getStatusColor = (status: string, isDarkMode: boolean): string => {
  switch (status) {
    case 'online': return '#10b981'; // emerald-500
    case 'away': return '#f59e0b'; // amber-500
    case 'busy': return '#ef4444'; // red-500
    case 'offline':
    default: return isDarkMode ? '#475569' : '#94a3b8'; // slate-600 or slate-400
  }
};

// Styled components
const AvatarContainer = styled.div<{
  size: number;
  isDarkMode: boolean;
}>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${props => props.isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: scale(1.05);
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitials = styled.div<{
  size: number;
  color: string;
  isDarkMode: boolean;
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color};
  color: white;
  font-weight: 600;
  font-size: ${props => props.size * 0.4}px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const StatusIndicator = styled.div<{
  size: number;
  status: string;
  isDarkMode: boolean;
}>`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${props => props.size * 0.3}px;
  height: ${props => props.size * 0.3}px;
  border-radius: 50%;
  background-color: ${props => getStatusColor(props.status, props.isDarkMode)};
  border: 2px solid ${props => props.isDarkMode ? '#1e293b' : 'white'};
`;

const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  src,
  status,
  showStatus = false,
  className = '',
}) => {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const avatarSize = getAvatarSize(size);
  const avatarColor = getAvatarColor(name);
  const initials = getInitials(name);
  
  return (
    <AvatarContainer 
      size={avatarSize} 
      isDarkMode={isDarkMode} 
      className={className}
      aria-label={name}
    >
      {src ? (
        <AvatarImage src={src} alt={name} />
      ) : (
        <AvatarInitials 
          size={avatarSize} 
          color={avatarColor}
          isDarkMode={isDarkMode}
        >
          {initials}
        </AvatarInitials>
      )}
      
      {showStatus && status && (
        <StatusIndicator 
          size={avatarSize} 
          status={status}
          isDarkMode={isDarkMode}
          aria-label={`Status: ${status}`}
        />
      )}
    </AvatarContainer>
  );
};

export default Avatar;