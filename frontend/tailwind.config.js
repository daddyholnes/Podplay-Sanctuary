/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Purple theme palette
        purple: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Secondary colors
        sanctuary: {
          light: '#f9fafb',
          dark: '#1f2937',
          accent: '#8b5cf6', // Purple main accent
          highlight: '#a78bfa', // Lighter purple for highlights
          success: '#10b981', // Green for success states
          warning: '#f59e0b', // Amber for warnings
          error: '#ef4444', // Red for errors
          info: '#3b82f6', // Blue for info
        }
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'sanctuary': '0 4px 14px 0 rgba(139, 92, 246, 0.15)',
        'sanctuary-lg': '0 10px 25px -3px rgba(139, 92, 246, 0.15), 0 4px 6px -2px rgba(139, 92, 246, 0.05)',
        'sanctuary-inner': 'inset 0 2px 4px 0 rgba(139, 92, 246, 0.1)',
        'neon': '0 0 5px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
