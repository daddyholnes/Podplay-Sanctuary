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
  const [isLoading, setIsLoading] = useState(true);
  const logo: LogoAsset = getLogo(appId);
  const iconSize = sizeMap[size];

  useEffect(() => {
    if (!logo.logoUrl) {
      setLogoError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Logo loaded successfully for ${appId}:`, logo.logoUrl);
      setLogoLoaded(true);
      setLogoError(false);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.warn(`❌ Logo failed to load for ${appId}:`, logo.logoUrl, 'falling back to', logo.fallbackIcon);
      setLogoError(true);
      setLogoLoaded(false);
      setIsLoading(false);
    };
    img.src = logo.logoUrl;
  }, [logo.logoUrl, appId, logo.fallbackIcon]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`logo-icon-fallback logo-loading ${className}`}
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: '6px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.floor(iconSize * 0.4),
          ...style
        }}
      >
        ⏳
      </div>
    );
  }

  // Use logo if loaded successfully
  if (logoLoaded && !logoError && logo.logoUrl) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
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
        {size !== 'small' && (
          <div className="logo-status loaded" title="Official logo loaded">
            ✓
          </div>
        )}
      </div>
    );
  }

  // Fallback to styled emoji icon
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
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
      {size !== 'small' && (
        <div className="logo-status fallback" title="Using fallback icon">
          !
        </div>
      )}
    </div>
  );
};

export default LogoIcon;
