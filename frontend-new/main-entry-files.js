// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import PodplaySanctuaryApp from './App.jsx'
import './index.css'

// Initialize accessibility features
import { AccessibilityUtils } from './utils/accessibility.js'

// Apply system preferences on load
const applySystemPreferences = () => {
  const preferences = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', preferences)
  
  // Apply reduced motion if preferred
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms')
    document.documentElement.style.setProperty('--transition-duration', '0.01ms')
  }
}

applySystemPreferences()

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemPreferences)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PodplaySanctuaryApp />
  </React.StrictMode>,
)

// src/index.css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom CSS Variables for Accessibility */
:root {
  --animation-duration: 0.3s;
  --transition-duration: 0.2s;
  --focus-ring-color: #8b5cf6;
  --focus-ring-width: 2px;
}

/* Base typography for readability */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  line-height: 1.6;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Enhanced focus styles for accessibility */
*:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(243 244 246);
}

.dark ::-webkit-scrollbar-track {
  background: rgb(31 41 55);
}

::-webkit-scrollbar-thumb {
  background: rgb(156 163 175);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgb(75 85 99);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgb(107 114 128);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .bg-gradient-to-br {
    background: var(--tw-gradient-to) !important;
  }
  
  .border {
    border-width: 2px !important;
  }
}

/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Calm animations */
.animate-gentle-pulse {
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-soft-bounce {
  animation: soft-bounce 2s ease-in-out infinite;
}

@keyframes soft-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

/* Sanctuary-specific styles */
.sanctuary-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.mama-bear-gradient {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.calm-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.dark .calm-shadow {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Accessible button styles */
.btn-primary {
  @apply px-4 py-2 bg-sanctuary-600 text-white rounded-lg font-medium;
  @apply hover:bg-sanctuary-700 focus:ring-2 focus:ring-sanctuary-500 focus:ring-offset-2;
  @apply transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium border border-gray-300;
  @apply hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
  @apply dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700;
  @apply transition-colors duration-200;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg font-medium;
  @apply hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
  @apply transition-colors duration-200;
}

/* Input styles */
.input-primary {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg;
  @apply focus:ring-2 focus:ring-sanctuary-500 focus:border-sanctuary-500;
  @apply dark:bg-gray-800 dark:border-gray-600 dark:text-white;
  @apply transition-colors duration-200;
}

/* Card styles */
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700;
  @apply transition-all duration-300;
}

.card:hover {
  @apply shadow-xl;
}

/* Loading states */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.dark .loading-shimmer {
  background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Notification styles */
.notification-enter {
  opacity: 0;
  transform: translateY(-20px);
}

.notification-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}

.notification-exit {
  opacity: 1;
  transform: translateY(0);
}

.notification-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 300ms, transform 300ms;
}

// src/components/AccessibilityProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { AccessibilityUtils, ThemeUtils } from '../utils/accessibility.js'

const AccessibilityContext = createContext()

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export const AccessibilityProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'normal',
    theme: 'dark'
  })

  useEffect(() => {
    // Get initial system preferences
    const systemPrefs = ThemeUtils.getSystemPreferences()
    setPreferences(prev => ({
      ...prev,
      ...systemPrefs
    }))

    // Listen for changes
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)')
    }

    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        theme: mediaQueries.colorScheme.matches ? 'dark' : 'light'
      }))
    }

    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences)
    })

    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences)
      })
    }
  }, [])

  const announceToScreenReader = (message, priority = 'polite') => {
    AccessibilityUtils.announceLiveRegion(message, priority)
  }

  const updateTheme = (themeName) => {
    setPreferences(prev => ({ ...prev, theme: themeName }))
    ThemeUtils.applyAccessibilityTheme(themeName)
    
    // Update document class
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
    document.documentElement.classList.add(`theme-${themeName}`)
    
    if (themeName === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const value = {
    preferences,
    announceToScreenReader,
    updateTheme,
    isReducedMotion: preferences.reducedMotion,
    isHighContrast: preferences.highContrast
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

// src/components/NotificationSystem.jsx
import React, { createContext, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const Notification = ({ notification, onDismiss }) => {
  const bgColor = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700',
    error: 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700'
  }[notification.type] || 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-600'

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border ${bgColor} shadow-sm animate-slide-up`}
      role="alert"
      aria-live="polite"
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {notification.title}
          </h3>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {notification.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = (notification) => {
    const id = Date.now().toString()
    const newNotification = { id, ...notification }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto-dismiss after 5 seconds unless it's an error
    if (notification.type !== 'error' && !notification.persistent) {
      setTimeout(() => {
        removeNotification(id)
      }, 5000)
    }

    return id
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    // Convenience methods
    success: (message, title) => addNotification({ type: 'success', message, title }),
    error: (message, title) => addNotification({ type: 'error', message, title, persistent: true }),
    info: (message, title) => addNotification({ type: 'info', message, title })
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      {notifications.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full"
          aria-label="Notifications"
        >
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              notification={notification}
              onDismiss={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

// src/components/LoadingSpinner.jsx
import React from 'react'
import { Heart } from 'lucide-react'

export const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  show = true 
}) => {
  if (!show) return null

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-label={message}>
      <div className={`${sizeClasses[size]} mb-4`}>
        <Heart className={`${sizeClasses[size]} text-mama-500 animate-gentle-pulse`} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
        {message}
      </p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  )
}

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded loading-shimmer" />
    ))}
  </div>
)

// src/components/ErrorBoundary.jsx
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🐻 Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900 dark:to-pink-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Don't worry, Mama Bear is working to fix this. Try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full btn-secondary"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Show Error Details
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// README.md
export const README = \`# Podplay Build Sanctuary Frontend

A professional, accessible React application designed specifically for neurodiverse developers and creators.

## Features

- **Accessibility First**: Full WCAG 2.1 AA compliance with multiple theme options
- **Neurodiverse Friendly**: Sensory-aware design with calm animations and reduced cognitive load
- **Real-time Integration**: Socket.IO connection with Mama Bear AI agent
- **Responsive Design**: Beautiful on all devices and screen sizes
- **Professional Architecture**: Clean, maintainable code with proper error handling

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Make sure your backend is running on http://localhost:5000

## Project Structure

\`\`\`
src/
├── components/           # Reusable UI components
│   ├── AccessibilityProvider.jsx
│   ├── NotificationSystem.jsx
│   ├── LoadingSpinner.jsx
│   └── ErrorBoundary.jsx
├── services/            # API and Socket.IO services
│   ├── api.js
│   └── socket.js
├── hooks/               # Custom React hooks
│   ├── useApi.js
│   └── useSocket.js
├── utils/               # Utility functions
│   ├── accessibility.js
│   └── themes.js
├── config/              # Configuration files
│   └── api.js
├── App.jsx              # Main application component
├── main.jsx             # Entry point
└── index.css            # Global styles
\`\`\`

## Accessibility Features

- **Screen Reader Support**: Full ARIA labels and live regions
- **Keyboard Navigation**: Complete keyboard accessibility
- **Multiple Themes**: Light, dark, and sensory-calm themes
- **Reduced Motion**: Respects prefers-reduced-motion settings
- **High Contrast**: Support for high contrast preferences
- **Focus Management**: Clear focus indicators and logical tab order

## Integration with Backend

The frontend seamlessly integrates with your Podplay Sanctuary backend:

- **Real-time Chat**: Socket.IO connection for Mama Bear conversations
- **MCP Marketplace**: Browse and install MCP servers
- **Project Management**: Full project lifecycle support
- **System Monitoring**: Real-time system metrics and health
- **Development Tools**: Integrated terminal, code editor, and file manager

## Theme System

Three carefully designed themes:

1. **Light Theme**: Clean, bright interface for well-lit environments
2. **Dark Theme**: Easy on the eyes for low-light coding sessions
3. **Sensory Calm**: Specially designed for sensory sensitivities with reduced contrast and motion

## Contributing

This application is built with accessibility and neurodiversity in mind. When contributing:

- Follow WCAG 2.1 guidelines
- Test with screen readers
- Ensure keyboard navigation works
- Respect reduced motion preferences
- Maintain semantic HTML structure

## License

MIT License - Built with ❤️ for the neurodiverse community
\`

export default {
  README,
  indexHtmlTemplate
}\`