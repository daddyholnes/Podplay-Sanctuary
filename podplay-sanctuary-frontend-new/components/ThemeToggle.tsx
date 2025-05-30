
import React from 'react';
import { useAppStore } from '../store/useAppStore';
import Icon from './Icon';
import Button from './Button';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      className="p-2 rounded-full"
    >
      {theme === 'light' ? (
        <Icon name="moon" className="w-5 h-5 text-text-secondary" />
      ) : (
        <Icon name="sun" className="w-5 h-5 text-text-secondary" />
      )}
    </Button>
  );
};

export default ThemeToggle;
