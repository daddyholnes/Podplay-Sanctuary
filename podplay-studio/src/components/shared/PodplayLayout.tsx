'use client';
import React, { useEffect, ReactNode } from 'react';
import { useChatStore } from '@/lib/stores/chat';
import { cn } from '@/lib/utils';

interface PodplayLayoutProps {
  children: ReactNode;
  className?: string;
}

export const PodplayLayout: React.FC<PodplayLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { isDarkMode } = useChatStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-300',
      isDarkMode 
        ? 'bg-podplay-dark' 
        : 'bg-podplay-gradient',
      className
    )}>
      {children}
    </div>
  );
};
