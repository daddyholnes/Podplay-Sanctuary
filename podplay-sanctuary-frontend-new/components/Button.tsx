
import React from 'react';
import Icon, { IconName } from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: IconName;
  rightIcon?: IconName;
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  children,
  className,
  ...props
}) => {
  const baseStyle = 'font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-accent hover:bg-accent-hover text-white focus:ring-accent',
    secondary: 'bg-secondary-bg hover:bg-tertiary-bg text-text-primary border border-border focus:ring-accent',
    danger: 'bg-error hover:bg-red-700 text-white focus:ring-error',
    ghost: 'bg-transparent hover:bg-tertiary-bg text-text-primary focus:ring-accent',
    link: 'bg-transparent hover:underline text-accent focus:ring-accent p-0',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Icon name="cog" className="animate-spin -ml-1 mr-2 h-5 w-5" />}
      {leftIcon && !isLoading && <Icon name={leftIcon} className="-ml-1 mr-2 h-5 w-5" />}
      {children}
      {rightIcon && !isLoading && <Icon name={rightIcon} className="ml-2 -mr-1 h-5 w-5" />}
    </button>
  );
};

export default Button;
