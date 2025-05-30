
import React from 'react';
import Icon from '../Icon';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Icon name="cog" className={`animate-spin text-accent ${sizeClasses[size]}`} />
      {text && <p className="mt-2 text-sm text-text-secondary">{text}</p>}
    </div>
  );
};

export default Spinner;
