import React from 'react';
import logoMap from '../logoMap';

interface LogoProps {
  name: string; // model or mini app name
  size?: number;
  alt?: string;
  darkMode?: boolean;
}

const Logo: React.FC<LogoProps> = ({ name, size = 48, alt, darkMode }) => {
  const logo = logoMap[name.toLowerCase()] || logoMap['default'];
  if (!logo) return null;
  return (
    <img
      src={darkMode && logo.dark ? logo.dark : logo.light}
      width={size}
      height={size}
      alt={alt || `${name} logo`}
      style={{ borderRadius: 8, background: 'transparent', objectFit: 'contain' }}
    />
  );
};

export default Logo;
