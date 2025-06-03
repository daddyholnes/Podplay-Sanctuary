import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Enhanced utility to combine class names with Tailwind support
 * This handles conditional classes and resolves Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if the system prefers dark mode
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Creates a Podplay purple gradient for backgrounds
 * @param isDark Whether to use the dark variant
 */
export function podplayGradient(isDark: boolean = false): string {
  return isDark
    ? 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950 text-purple-50'
    : 'bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 text-purple-950';
}

/**
 * Applies consistent focus styles for accessibility
 */
export function focusRingStyles(): string {
  return 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 transition-all duration-200';
}

/**
 * Sensory-friendly hover effect (subtle)
 */
export function gentleHoverEffect(isDark: boolean = false): string {
  return isDark 
    ? 'hover:bg-purple-800/50 transition-colors duration-200'
    : 'hover:bg-purple-300/50 transition-colors duration-200';
}