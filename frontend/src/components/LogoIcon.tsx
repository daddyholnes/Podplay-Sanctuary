// LogoIcon component for Mini App Launcher
// Handles logo loading with graceful fallbacks

import React, { useState, useEffect } from 'react';
import { getLogo, LogoAsset } from '../assets/logos';

interface LogoIconProps {
  appId: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

const sizeMap = {
  small: 20,
  medium: 32,
  large: 48
};

export const LogoIcon: React.FC<LogoIconProps> = ({ 
  appId, 
  size = 'medium', 
  className = '',
  style = {}
}) => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const logo: LogoAsset = getLogo(appId);
  const iconSize = sizeMap[size];

  useEffect(() => {
    if (!logo.logoUrl) {
      setLogoError(true);
      return;
    }

    const img = new Image();
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoError(true);
    img.src = logo.logoUrl;
  }, [logo.logoUrl]);

  // Use logo if loaded, otherwise fallback to styled icon
  if (logoLoaded && !logoError && logo.logoUrl) {
    return (
      <img
        src={logo.logoUrl}
        alt={`${logo.name} logo`}
        width={iconSize}
        height={iconSize}
        className={`logo-icon ${className}`}
        style={{
          borderRadius: '6px',
          objectFit: 'contain',
          ...style
        }}
        onError={() => setLogoError(true)}
      />
    );
  }

  // Fallback to styled emoji icon
  return (
    <div
      className={`logo-icon-fallback ${className}`}
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: '6px',
        backgroundColor: logo.bgColor || '#6B7280',
        color: logo.textColor || '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.floor(iconSize * 0.6),
        fontWeight: '600',
        ...style
      }}
    >
      {logo.fallbackIcon}
    </div>
  );
};

export default LogoIcon;
