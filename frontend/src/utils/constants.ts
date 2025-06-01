/**
 * Application Constants
 * Centralized configuration values and constants used throughout the application
 */

// Application metadata
export const APP_CONFIG = {
  name: 'Podplay Sanctuary',
  version: '1.0.0',
  description: 'AI-powered development environment with real-time collaboration',
  author: 'Podplay Team',
  repository: 'https://github.com/podplay/sanctuary',
  documentation: 'https://docs.podplay.dev',
  support: 'https://support.podplay.dev',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  maxConcurrentRequests: 10,
  rateLimitWindow: 60000, // 1 minute
  rateLimitMaxRequests: 100,
} as const;

// WebSocket Configuration
export const SOCKET_CONFIG = {
  url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 5000, // 5 seconds
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000, // 30 seconds
  messageQueueSize: 1000,
  connectionTimeout: 10000, // 10 seconds
} as const;

// AI/LLM Configuration
export const AI_CONFIG = {
  defaultModel: 'gemini-1.5-pro',
  maxTokens: 8192,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  safetySettings: {
    harassment: 'BLOCK_MEDIUM_AND_ABOVE',
    hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
    sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
    dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
  },
  models: {
    'gemini-1.5-pro': {
      displayName: 'Gemini 1.5 Pro',
      maxTokens: 2097152,
      supportsVision: true,
      supportsCode: true,
    },
    'gemini-1.5-flash': {
      displayName: 'Gemini 1.5 Flash',
      maxTokens: 1048576,
      supportsVision: true,
      supportsCode: true,
    },
    'claude-3-sonnet': {
      displayName: 'Claude 3 Sonnet',
      maxTokens: 200000,
      supportsVision: true,
      supportsCode: true,
    },
    'gpt-4-turbo': {
      displayName: 'GPT-4 Turbo',
      maxTokens: 128000,
      supportsVision: true,
      supportsCode: true,
    },
  },
} as const;

// File System Configuration
export const FILE_CONFIG = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxUploadSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  allowedDocumentTypes: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  allowedCodeTypes: [
    'text/javascript',
    'text/typescript',
    'text/python',
    'text/java',
    'text/c',
    'text/cpp',
    'text/csharp',
    'text/go',
    'text/rust',
    'text/php',
    'text/ruby',
    'text/swift',
    'text/kotlin',
    'text/scala',
    'text/r',
    'text/sql',
    'text/shell',
    'text/yaml',
    'text/xml',
    'text/html',
    'text/css',
  ],
  tempFileExpiry: 24 * 60 * 60 * 1000, // 24 hours
  autoSaveInterval: 30000, // 30 seconds
} as const;

// UI Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: {
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
    secondary: {
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
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
    display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '5xl': '8rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
} as const;

// Layout Configuration
export const LAYOUT_CONFIG = {
  sidebar: {
    collapsed: {
      width: '4rem',
    },
    expanded: {
      width: '16rem',
    },
    breakpoint: 1024, // px
  },
  header: {
    height: '3.5rem',
  },
  footer: {
    height: '2.5rem',
  },
  content: {
    maxWidth: '1200px',
    padding: '1rem',
  },
  chat: {
    maxWidth: '800px',
    minHeight: '400px',
    maxMessages: 1000,
  },
} as const;

// Animation Configuration
export const ANIMATION_CONFIG = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  user: 'podplay_user',
  preferences: 'podplay_preferences',
  theme: 'podplay_theme',
  sidebar: 'podplay_sidebar',
  chatHistory: 'podplay_chat_history',
  workspaceState: 'podplay_workspace_state',
  recentFiles: 'podplay_recent_files',
  searchHistory: 'podplay_search_history',
  apiTokens: 'podplay_api_tokens',
  settings: 'podplay_settings',
  tempData: 'podplay_temp_data',
} as const;

// Event Types
export const EVENT_TYPES = {
  // UI Events
  THEME_CHANGED: 'theme:changed',
  SIDEBAR_TOGGLED: 'sidebar:toggled',
  MODAL_OPENED: 'modal:opened',
  MODAL_CLOSED: 'modal:closed',
  NOTIFICATION_SHOWN: 'notification:shown',
  NOTIFICATION_DISMISSED: 'notification:dismissed',
  
  // Chat Events
  MESSAGE_SENT: 'chat:message:sent',
  MESSAGE_RECEIVED: 'chat:message:received',
  TYPING_STARTED: 'chat:typing:started',
  TYPING_STOPPED: 'chat:typing:stopped',
  CONVERSATION_STARTED: 'chat:conversation:started',
  CONVERSATION_ENDED: 'chat:conversation:ended',
  
  // Workspace Events
  FILE_OPENED: 'workspace:file:opened',
  FILE_SAVED: 'workspace:file:saved',
  FILE_DELETED: 'workspace:file:deleted',
  PROJECT_LOADED: 'workspace:project:loaded',
  PROJECT_CHANGED: 'workspace:project:changed',
  
  // AI Events
  AI_REQUEST_STARTED: 'ai:request:started',
  AI_REQUEST_COMPLETED: 'ai:request:completed',
  AI_REQUEST_FAILED: 'ai:request:failed',
  AI_MODEL_CHANGED: 'ai:model:changed',
  
  // System Events
  CONNECTION_ESTABLISHED: 'system:connection:established',
  CONNECTION_LOST: 'system:connection:lost',
  ERROR_OCCURRED: 'system:error:occurred',
  PERFORMANCE_METRIC: 'system:performance:metric',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  
  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // File System Errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  DISK_FULL: 'DISK_FULL',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // AI Service Errors
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_MODEL_NOT_FOUND: 'AI_MODEL_NOT_FOUND',
  AI_SAFETY_FILTER: 'AI_SAFETY_FILTER',
  
  // General Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  enableBetaFeatures: process.env.REACT_APP_ENABLE_BETA === 'true',
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableOfflineMode: true,
  enableRealTimeCollaboration: true,
  enableAIAssistant: true,
  enableCodeSuggestions: true,
  enableVoiceInput: false,
  enableVideoChat: false,
  enableMobileApp: false,
} as const;

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API URLs
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  
  // External Services
  geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
  anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  
  // Analytics
  gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID,
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  
  // Feature toggles
  enableBeta: process.env.REACT_APP_ENABLE_BETA === 'true',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  enableLogging: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  url: /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w)*)?)?)$/,
  phoneUS: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/,
  postalCodeUS: /^\d{5}(-\d{4})?$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  semver: /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// Size Constants (in bytes)
export const SIZE_CONSTANTS = {
  BYTE: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
  TB: 1024 * 1024 * 1024 * 1024,
} as const;
