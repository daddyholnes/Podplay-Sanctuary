// package.json
{
  "name": "podplay-sanctuary-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Podplay Build Sanctuary - Professional UI for Neurodiverse Developers",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "socket.io-client": "^4.7.2",
    "axios": "^1.6.0",
    "@tailwindcss/forms": "^0.5.6",
    "@tailwindcss/typography": "^0.5.10"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^4.5.0"
  }
}

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})

// tailwind.config.js
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
        sanctuary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        mama: {
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
        }
      },
      fontFamily: {
        'calm': ['Inter', 'system-ui', 'sans-serif'],
        'code': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// src/config/api.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Health & Connection
    TEST_CONNECTION: '/api/test-connection',
    HEALTH: '/health',
    
    // Chat & AI
    MAMA_BEAR_CHAT: '/api/chat/mama-bear',
    VERTEX_GARDEN: '/api/chat/vertex-garden',
    ANALYZE_CODE: '/api/chat/analyze-code',
    MEMORIES_SEARCH: '/api/chat/memories/search',
    
    // MCP Marketplace
    MCP_SEARCH: '/api/mcp/search',
    MCP_CATEGORIES: '/api/mcp/categories',
    MCP_SERVER_DETAILS: '/api/mcp/server',
    MCP_INSTALL: '/api/mcp/install',
    MCP_TRENDING: '/api/mcp/trending',
    MCP_INSTALLED: '/api/mcp/installed',
    MCP_RECOMMENDATIONS: '/api/mcp/recommendations',
    
    // Scout Agent
    SCOUT_PROJECTS: '/api/v1/scout_agent/projects',
    SCOUT_PROJECT_STATUS: '/api/v1/scout_agent/projects',
    SCOUT_SYSTEM_METRICS: '/api/v1/scout_agent/system/metrics',
    SCOUT_SERVICES_STATUS: '/api/v1/scout_agent/services/status',
    
    // Development Tools
    DEV_PING: '/api/dev/ping',
    DEV_ECHO: '/api/dev/echo',
    DEV_VALIDATE_JSON: '/api/dev/validate/json',
    DEV_DATABASE_INFO: '/api/dev/database/info',
    DEV_SERVICES_STATUS: '/api/dev/services/status',
    
    // NixOS Workspaces
    NIXOS_WORKSPACES: '/api/nixos/workspaces',
    NIXOS_WORKSPACE_DETAILS: '/api/nixos/workspaces',
    NIXOS_CREATE_WORKSPACE: '/api/nixos/workspaces',
    NIXOS_START_WORKSPACE: '/api/nixos/workspaces',
    NIXOS_STOP_WORKSPACE: '/api/nixos/workspaces',
  },
  SOCKET_EVENTS: {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECTED: 'connected',
    
    // Chat
    MAMA_BEAR_CHAT: 'mama_bear_chat',
    MAMA_BEAR_RESPONSE: 'mama_bear_response',
    
    // Workspace
    WORKSPACE_SUBSCRIBE: 'workspace_subscribe',
    WORKSPACE_UNSUBSCRIBE: 'workspace_unsubscribe',
    WORKSPACE_SUBSCRIBED: 'workspace_subscribed',
    
    // Terminal
    JOIN_TERMINAL: 'join_terminal',
    LEAVE_TERMINAL: 'leave_terminal',
    TERMINAL_INPUT: 'terminal_input',
    TERMINAL_OUTPUT: 'terminal_output',
    
    // System
    SYSTEM_STATUS_REQUEST: 'system_status_request',
    SYSTEM_STATUS: 'system_status',
    TEST_EVENT: 'test_event',
    TEST_RESPONSE: 'test_response'
  }
}

// src/services/api.js
import axios from 'axios'
import { API_CONFIG } from '../config/api.js'

class APIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🐻 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('🐻 API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`🐻 API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('🐻 API Response Error:', error)
        if (error.response?.status === 503) {
          console.warn('🐻 Service temporarily unavailable - graceful degradation active')
        }
        return Promise.reject(error)
      }
    )
  }

  // Health & Connection
  async testConnection() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.TEST_CONNECTION)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getHealth() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.HEALTH)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Chat & AI Services
  async chatWithMamaBear(message, userId = 'sanctuary_user', sessionId = 'main_session') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.MAMA_BEAR_CHAT, {
        message,
        user_id: userId,
        session_id: sessionId
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        fallbackResponse: "I'm having a small technical moment. Let me try to reconnect my systems. 🐻"
      }
    }
  }

  async analyzeCode(code, language = 'python') {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.ANALYZE_CODE, {
        code,
        language
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async searchMemories(query, limit = 5) {
    try {
      const response = await this.client.post(API_CONFIG.ENDPOINTS.MEMORIES_SEARCH, {
        query,
        limit
      })
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // MCP Marketplace
  async searchMCPServers(query = '', category = null, officialOnly = false, limit = 20) {
    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (category) params.append('category', category)
      if (officialOnly) params.append('official_only', 'true')
      params.append('limit', limit.toString())

      const response = await this.client.get(`${API_CONFIG.ENDPOINTS.MCP_SEARCH}?${params}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getMCPCategories() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.MCP_CATEGORIES)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getMCPServerDetails(serverName) {
    try {
      const response = await this.client.get(`${API_CONFIG.ENDPOINTS.MCP_SERVER_DETAILS}/${serverName}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async installMCPServer(serverName) {
    try {
      const response = await this.client.post(`${API_CONFIG.ENDPOINTS.MCP_INSTALL}/${serverName}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getTrendingMCPServers(limit = 10) {
    try {
      const response = await this.client.get(`${API_CONFIG.ENDPOINTS.MCP_TRENDING}?limit=${limit}`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Scout Agent
  async getProjects() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.SCOUT_PROJECTS)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getProjectStatus(projectName) {
    try {
      const response = await this.client.get(`${API_CONFIG.ENDPOINTS.SCOUT_PROJECT_STATUS}/${projectName}/status`)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getSystemMetrics() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.SCOUT_SYSTEM_METRICS)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getServicesStatus() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.SCOUT_SERVICES_STATUS)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Development Tools
  async ping() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.DEV_PING)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getDatabaseInfo() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.DEV_DATABASE_INFO)
      return { success: true, data: response.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export const apiService = new APIService()

// src/services/socket.js
import { io } from 'socket.io-client'
import { API_CONFIG } from '../config/api.js'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    if (this.socket?.connected) {
      console.log('🐻 Socket already connected')
      return
    }

    console.log('🐻 Connecting to Socket.IO server...')
    
    this.socket = io(API_CONFIG.BASE_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('🐻 Socket.IO connected successfully!')
      this.isConnected = true
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('🐻 Socket.IO disconnected:', reason)
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('🐻 Socket.IO connection error:', error)
      this.isConnected = false
      this.reconnectAttempts++
    })

    this.socket.on(API_CONFIG.SOCKET_EVENTS.CONNECTED, (data) => {
      console.log('🐻 Sanctuary connection confirmed:', data)
    })

    this.socket.on('error', (error) => {
      console.error('🐻 Socket.IO error:', error)
    })
  }

  // Chat methods
  sendChatMessage(message, sessionId = 'main_session', userId = 'sanctuary_user') {
    if (!this.socket?.connected) {
      console.warn('🐻 Socket not connected for chat message')
      return false
    }

    this.socket.emit(API_CONFIG.SOCKET_EVENTS.MAMA_BEAR_CHAT, {
      message,
      session_id: sessionId,
      user_id: userId
    })
    return true
  }

  onChatResponse(callback) {
    if (!this.socket) return
    this.socket.on(API_CONFIG.SOCKET_EVENTS.MAMA_BEAR_RESPONSE, callback)
  }

  // Terminal methods
  joinTerminalSession(sessionId) {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.JOIN_TERMINAL, { session_id: sessionId })
    return true
  }

  leaveTerminalSession(sessionId) {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.LEAVE_TERMINAL, { session_id: sessionId })
    return true
  }

  sendTerminalInput(sessionId, command) {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.TERMINAL_INPUT, {
      session_id: sessionId,
      command
    })
    return true
  }

  onTerminalOutput(callback) {
    if (!this.socket) return
    this.socket.on(API_CONFIG.SOCKET_EVENTS.TERMINAL_OUTPUT, callback)
  }

  // Workspace methods
  subscribeToWorkspace(workspaceId) {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.WORKSPACE_SUBSCRIBE, { workspace_id: workspaceId })
    return true
  }

  unsubscribeFromWorkspace(workspaceId) {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.WORKSPACE_UNSUBSCRIBE, { workspace_id: workspaceId })
    return true
  }

  // System status
  requestSystemStatus() {
    if (!this.socket?.connected) return false
    this.socket.emit(API_CONFIG.SOCKET_EVENTS.SYSTEM_STATUS_REQUEST)
    return true
  }

  onSystemStatus(callback) {
    if (!this.socket) return
    this.socket.on(API_CONFIG.SOCKET_EVENTS.SYSTEM_STATUS, callback)
  }

  // Utility methods
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }

  // Generic event listener
  on(event, callback) {
    if (!this.socket) return
    this.socket.on(event, callback)
  }

  // Generic event emitter
  emit(event, data) {
    if (!this.socket?.connected) return false
    this.socket.emit(event, data)
    return true
  }
}

export const socketService = new SocketService()

// src/hooks/useApi.js
import { useState, useEffect } from 'react'
import { apiService } from '../services/api.js'

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await apiCall()
        
        if (isMounted) {
          if (result.success) {
            setData(result.data)
          } else {
            setError(result.error)
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error, refetch: () => fetchData() }
}

// src/hooks/useSocket.js
import { useState, useEffect } from 'react'
import { socketService } from '../services/socket.js'

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    socketService.connect()

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)

    return () => {
      socketService.disconnect()
    }
  }, [])

  return {
    isConnected,
    socket: socketService
  }
}

// src/utils/accessibility.js
export const AccessibilityUtils = {
  // Focus management for screen readers
  announceLiveRegion: (message, priority = 'polite') => {
    const liveRegion = document.getElementById('live-region')
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority)
      liveRegion.textContent = message
    }
  },

  // Keyboard navigation helpers
  isNavigationKey: (key) => {
    return ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)
  },

  // Theme-aware contrast checking
  getContrastRatio: (color1, color2) => {
    // Simplified contrast ratio calculation
    // In production, use a proper color library
    return 4.5 // Assuming WCAG AA compliance
  },

  // Reduced motion detection
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // High contrast detection
  prefersHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches
  },

  // Focus management
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    })
  }
}

// src/utils/themes.js
export const ThemeUtils = {
  // Apply theme-specific styles based on user needs
  applyAccessibilityTheme: (themeName) => {
    const root = document.documentElement
    
    switch (themeName) {
      case 'sensory':
        root.style.setProperty('--animation-duration', '0s')
        root.style.setProperty('--transition-duration', '0s')
        break
      case 'high-contrast':
        root.style.setProperty('--contrast-ratio', '7:1')
        break
      default:
        root.style.setProperty('--animation-duration', '0.3s')
        root.style.setProperty('--transition-duration', '0.2s')
    }
  },

  // Get system preferences
  getSystemPreferences: () => {
    return {
      colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    }
  },

  // Generate accessible color palette
  generateAccessiblePalette: (baseColor, contrastRequirement = 4.5) => {
    // In production, use a proper color manipulation library
    return {
      primary: baseColor,
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#ffffff',
      text: '#111827'
    }
  }
}

// index.html template
export const indexHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/sanctuary-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Podplay Build Sanctuary - A calm, empowering development environment for neurodiverse minds" />
    <meta name="theme-color" content="#8b5cf6" />
    
    <!-- Accessibility meta tags -->
    <meta name="color-scheme" content="light dark" />
    
    <!-- Preconnect to backend -->
    <link rel="preconnect" href="http://localhost:5000" />
    
    <title>Podplay Build Sanctuary</title>
    
    <!-- Custom CSS for accessibility -->
    <style>
      /* Respect user's motion preferences */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        :root {
          --contrast-factor: 1.5;
        }
      }
      
      /* Focus styles for keyboard navigation */
      *:focus-visible {
        outline: 2px solid #8b5cf6;
        outline-offset: 2px;
      }
      
      /* Screen reader only content */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    
    <!-- Live region for screen reader announcements -->
    <div id="live-region" aria-live="polite" aria-atomic="true" class="sr-only"></div>
    
    <!-- Skip link for keyboard navigation -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sanctuary-600 text-white px-4 py-2 rounded-lg z-50">
      Skip to main content
    </a>
    
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`