import React, { useState, useEffect } from 'react';
import { cn, focusRingStyles, gentleHoverEffect, podplayGradient } from './utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import * as Icons from 'lucide-react';

// Input Component with purple theme and sensory-friendly styling
export const Input = ({ 
  className,
  type = 'text',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border-2 border-purple-500/20 bg-white/70 dark:bg-slate-800/70 px-3 py-2",
        "text-sm text-purple-900 dark:text-purple-100 placeholder:text-purple-500/40 dark:placeholder:text-purple-300/40",
        "shadow-sm transition-all duration-200",
        "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none",
        className
      )}
      {...props}
    />
  );
};

// Badge Component with purple theme and sensory-friendly styling
export const Badge = ({ 
  children, 
  className,
  variant = 'default',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'outline' | 'secondary' | 'success' | 'warning' | 'danger'
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        "border border-transparent",
        variant === 'default' && "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
        variant === 'outline' && "border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300",
        variant === 'secondary' && "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
        variant === 'success' && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
        variant === 'warning' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
        variant === 'danger' && "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Alert Component with purple theme and sensory-friendly styling
export const Alert = ({ 
  children, 
  className,
  variant = 'default',
  title,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  title?: string
}) => {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border-2 p-4 mb-4 transition-all duration-200",
        variant === 'default' && "bg-purple-50/60 border-purple-200 text-purple-800 dark:bg-purple-950/30 dark:border-purple-800/40 dark:text-purple-200",
        variant === 'info' && "bg-blue-50/60 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/40 dark:text-blue-200",
        variant === 'success' && "bg-green-50/60 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800/40 dark:text-green-200",
        variant === 'warning' && "bg-yellow-50/60 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800/40 dark:text-yellow-200",
        variant === 'danger' && "bg-red-50/60 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-200",
        className
      )}
      {...props}
    >
      {title && <h5 className="font-medium mb-1">{title}</h5>}
      <div className="text-sm">{children}</div>
    </div>
  );
};

// Toggle Component with purple theme and sensory-friendly styling
export const Toggle = ({ 
  className,
  checked,
  onChange,
  disabled,
  ...props 
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> & {
  checked?: boolean
  onChange?: (checked: boolean) => void
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event.target.checked);
    }
  };

  return (
    <label className={cn(
      "relative inline-flex items-center cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only peer"
        {...props}
      />
      <div className={cn(
        "w-11 h-6 rounded-full transition-all duration-300",
        "bg-slate-300 dark:bg-slate-700", 
        "peer-focus:ring-2 peer-focus:ring-purple-500/30",
        "peer-checked:bg-purple-500 dark:peer-checked:bg-purple-500",
        "after:content-[''] after:absolute after:top-[2px] after:left-[2px]", 
        "after:bg-white after:rounded-full after:h-5 after:w-5", 
        "after:transition-all after:duration-300",
        "peer-checked:after:translate-x-full"
      )}></div>
    </label>
  );
};

// Button Component with sensory-friendly animations
export const Button = ({ 
  children, 
  className, 
  variant = 'default',
  size = 'default',
  onClick,
  disabled,
  icon,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'gradient',
  size?: 'default' | 'sm' | 'lg' | 'icon',
  icon?: keyof typeof Icons
}) => {
  // Custom icon rendering based on the icon prop
  const renderIcon = () => {
    if (!icon) return null;
    
    // Handle specific icons with switch case for better type safety
    switch (icon) {
      case 'ArrowRight':
        return <Icons.ArrowRight className="w-4 h-4" />;
      case 'Check':
        return <Icons.Check className="w-4 h-4" />;
      case 'Download':
        return <Icons.Download className="w-4 h-4" />;
      case 'Github':
        return <Icons.Github className="w-4 h-4" />;
      case 'Moon':
        return <Icons.Moon className="w-4 h-4" />;
      case 'Sun':
        return <Icons.Sun className="w-4 h-4" />;
      case 'Settings':
        return <Icons.Settings className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
        focusRingStyles(),
        variant === 'default' ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' : '',
        variant === 'outline' ? 'border-2 border-purple-500 bg-transparent text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30' : '',
        variant === 'ghost' ? 'bg-transparent text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30' : '',
        variant === 'gradient' ? `${podplayGradient()} hover:brightness-105 text-white shadow-md` : '',
        size === 'default' ? 'h-10 px-4 py-2 text-sm' : '',
        size === 'sm' ? 'h-8 px-3 py-1 text-xs' : '',
        size === 'lg' ? 'h-12 px-6 py-3 text-base' : '',
        size === 'icon' ? 'h-10 w-10 p-2' : '',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {renderIcon()}
      {children}
    </button>
  );
};

// Card Component with sensory-friendly animations
export const Card = ({ 
  children, 
  className,
  animate = false,
  ...props 
}: Omit<React.HTMLAttributes<HTMLDivElement>, 'animate'> & {
  animate?: boolean
}) => {
  const cardClasses = cn(
    "rounded-xl border-2 border-purple-500/20 bg-white/80 dark:bg-slate-800/80", 
    "backdrop-blur-md shadow-md transition-all duration-200",
    "hover:shadow-lg hover:border-purple-500/30",
    className
  );
  
  // For animated cards, use framer-motion with gentle animations
  if (animate) {
    // Create a properly typed motion component
    const MotionCard = motion.div;
    
    return (
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cardClasses}
      >
        {children}
      </MotionCard>
    );
  }
  
  // For static cards, use regular div
  return (
    <div
      className={cardClasses}
      {...props}
    >
      {children}
    </div>
  );
};

// Textarea Component with purple theme and sensory-friendly styling
export const Textarea = ({ 
  className,
  resizable = true,
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  resizable?: boolean
}) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border-2 border-purple-500/20 bg-white/70 dark:bg-slate-800/70 px-3 py-2",
        "text-sm shadow-sm transition-all duration-200",
        "focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none",
        "placeholder:text-purple-500/40 dark:placeholder:text-purple-300/40",
        "dark:text-purple-100 text-purple-900",
        resizable ? "resize" : "resize-none",
        className
      )}
      {...props}
    />
  );
};

// Enhanced Tabs Components with purple theme and sensory-friendly styling
export const Tabs = ({
  children,
  value,
  onValueChange,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col w-full", 
        "rounded-md overflow-hidden",
        "bg-purple-50/50 dark:bg-purple-950/20", 
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsList = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "flex w-full border-b-2 border-purple-200 dark:border-purple-800",
        "p-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  children,
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
}) => {
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-md",
        "text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100",
        "border-b-2 border-transparent",
        "hover:bg-purple-100/70 dark:hover:bg-purple-900/30",
        "data-[state=active]:border-purple-500 data-[state=active]:bg-purple-100/90", 
        "data-[state=active]:text-purple-800 dark:data-[state=active]:bg-purple-900/50", 
        "dark:data-[state=active]:text-purple-200 data-[state=active]:font-semibold",
        "focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:ring-offset-1",
        className
      )}
      data-state={props['data-state']}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  children,
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value: string;
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-b-md transition-all duration-200", 
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        "data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-50",
        className
      )}
      data-state={props['data-state']}
      {...props}
    >
      {children}
    </div>
  );
};

// Enhanced Resizable Panel Components with purple theme and sensory-friendly styling
export const ResizablePanelGroup = ({
  children,
  direction = 'horizontal',
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  direction?: 'horizontal' | 'vertical';
}) => {
  return (
    <div
      className={cn(
        "flex h-full w-full rounded-lg overflow-hidden",
        "border-2 border-purple-300/20 dark:border-purple-700/30",
        "bg-purple-50/30 dark:bg-purple-950/20 backdrop-blur-sm",
        direction === 'vertical' ? 'flex-col' : '',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ResizablePanel = ({
  children,
  defaultSize,
  minSize,
  maxSize,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}) => {
  const style: React.CSSProperties = {};
  if (defaultSize) {
    style.flexBasis = `${defaultSize}%`;
  }
  if (minSize) {
    style.minWidth = `${minSize}%`;
    style.minHeight = `${minSize}%`;
  }
  if (maxSize) {
    style.maxWidth = `${maxSize}%`;
    style.maxHeight = `${maxSize}%`;
  }

  return (
    <div
      className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        "bg-white/90 dark:bg-slate-900/90",
        "rounded-md shadow-inner",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center group",
        "w-3 h-full cursor-col-resize transition-colors duration-200",
        "hover:bg-purple-200/50 dark:hover:bg-purple-800/30",
        withHandle ? 'bg-purple-100/50 dark:bg-purple-900/20' : 'bg-transparent',
        withHandle ? "after:content-[''] after:w-1 after:h-20 after:bg-purple-400/60 dark:after:bg-purple-500/60 after:rounded-full after:transition-all after:duration-200 group-hover:after:bg-purple-500 dark:group-hover:after:bg-purple-400" : '',
        className
      )}
      {...props}
    />
  );
};

// Separator Component with purple theme
export const Separator = ({
  className,
  orientation = 'horizontal',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'horizontal' | 'vertical';
}) => {
  return (
    <div
      className={cn(
        "shrink-0 bg-purple-300/30 dark:bg-purple-700/30",
        "transition-all duration-200",
        orientation === 'horizontal' ? 'h-[2px] w-full' : 'h-full w-[2px]',
        className
      )}
      {...props}
    />
  );
};

// Tooltip Component with purple theme and sensory-friendly styling
export const Tooltip = ({
  children,
  content,
  side = 'top',
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block" 
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      {...props}
    >
      {children}
      {show && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white",
            "rounded bg-purple-700 dark:bg-purple-900 shadow-sm transition-opacity duration-200",
            side === 'top' && "bottom-full left-1/2 -translate-x-1/2 mb-1",
            side === 'right' && "left-full top-1/2 -translate-y-1/2 ml-1",
            side === 'bottom' && "top-full left-1/2 -translate-x-1/2 mt-1",
            side === 'left' && "right-full top-1/2 -translate-y-1/2 mr-1",
            className
          )}
          role="tooltip"
        >
          {content}
          <div 
            className={cn(
              "absolute w-2 h-2 bg-purple-700 dark:bg-purple-900 rotate-45",
              side === 'top' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
              side === 'right' && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
              side === 'bottom' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
              side === 'left' && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
};

// ProgressBar Component with purple theme and sensory-friendly styling
export const ProgressBar = ({
  value = 0,
  max = 100,
  className,
  showValue = false,
  size = 'default',
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number
  max?: number
  showValue?: boolean
  size?: 'default' | 'sm' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/50",
        size === 'sm' && "h-1",
        size === 'default' && "h-2",
        size === 'lg' && "h-4",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full transition-all duration-500 ease-in-out",
          variant === 'default' && "bg-purple-600 dark:bg-purple-400",
          variant === 'success' && "bg-green-600 dark:bg-green-400",
          variant === 'warning' && "bg-yellow-600 dark:bg-yellow-400",
          variant === 'danger' && "bg-red-600 dark:bg-red-400"
        )}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
      {showValue && size === 'lg' && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// ScrollArea Component with purple theme and sensory-friendly styling
export const ScrollArea = ({
  children,
  className,
  orientation = 'vertical',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: 'vertical' | 'horizontal' | 'both'
}) => {
  return (
    <div
      className={cn(
        "relative overflow-auto",
        orientation === 'vertical' && "overflow-x-hidden scrollbar-thin scrollbar-thumb-purple-400/50 dark:scrollbar-thumb-purple-600/50 scrollbar-track-transparent",
        orientation === 'horizontal' && "overflow-y-hidden scrollbar-thin scrollbar-thumb-purple-400/50 dark:scrollbar-thumb-purple-600/50 scrollbar-track-transparent",
        orientation === 'both' && "scrollbar-thin scrollbar-thumb-purple-400/50 dark:scrollbar-thumb-purple-600/50 scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};