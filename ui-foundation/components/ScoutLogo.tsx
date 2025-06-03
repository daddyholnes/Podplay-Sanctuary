import React from 'react';

interface ScoutLogoProps {
  size?: number;
  className?: string;
}

const ScoutLogo: React.FC<ScoutLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <div 
      className={`flex items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.65} 
        height={size * 0.65} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M12 8L12 16" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M8 12L16 12" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M9 9L15 15" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M15 9L9 15" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default ScoutLogo;
