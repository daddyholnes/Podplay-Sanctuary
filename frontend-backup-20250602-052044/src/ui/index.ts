/**
 * Shared UI Component Library for Podplay Sanctuary
 * 
 * This module exports reusable UI components with consistent styling,
 * accessibility, and behavior across the Podplay Sanctuary application.
 * 
 * All components follow these design principles:
 * - Purple-themed color palette
 * - Sensory-friendly animations and transitions
 * - Full dark mode support
 * - Accessibility compliance
 * - Consistent spacing and sizing
 */

export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as ChatInput } from './ChatInput';
export { default as ThemeToggle } from './ThemeToggle';
export { default as Panel } from './Panel';
export { default as Avatar } from './Avatar';
export { default as Toast } from './Toast';
export { default as TabsContainer } from './TabsContainer';
export { default as Modal, ConfirmModal } from './Modal';
export { default as Dropdown } from './Dropdown';
export { default as Input } from './Input';
export { default as Tooltip } from './Tooltip';
export { default as Menu } from './Menu';
export { default as ContextMenu } from './ContextMenu';
export { Checkbox, Radio, Switch, Textarea } from './FormElements';

// Theme configuration (CSS variables will be defined in the root App component)
export const themeColors = {
  // Base colors
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Shared theme object creator
export const createTheme = (isDarkMode: boolean) => ({
  bg: isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
  cardBg: isDarkMode ? 'bg-slate-800/80' : 'bg-white/80',
  border: isDarkMode ? 'border-slate-700/50' : 'border-purple-200/50',
  text: isDarkMode ? 'text-white' : 'text-gray-900',
  textSecondary: isDarkMode ? 'text-slate-300' : 'text-gray-600',
  textTertiary: isDarkMode ? 'text-slate-400' : 'text-gray-500',
  input: isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white/50 border-purple-300/50 text-gray-900',
  button: isDarkMode ? 'bg-slate-700/50 hover:bg-slate-600/50' : 'bg-purple-100/50 hover:bg-purple-200/50',
  accent: 'from-purple-500 to-pink-500',
});

// Animation durations (in ms)
export const animationDurations = {
  fast: 150,
  medium: 300,
  slow: 500,
};

// Spacing scale (in pixels)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Media queries
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};