/**
 * Test Utilities and Helpers
 * 
 * Comprehensive testing utilities for Podplay Sanctuary application.
 * Provides mock data, render helpers, and testing utilities for all components.
 * 
 * @fileoverview Testing utilities and helper functions
 * @version 1.0.0
 * @author Podplay Sanctuary Team
 */

import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { configureStore, Store } from '@reduxjs/toolkit';
import { rootReducer } from '../store/rootReducer';
import { defaultTheme } from '../styles/theme';
import type { RootState } from '../store';
import type { 
  Message, 
  Conversation, 
  Workspace, 
  Project, 
  ScoutAnalysis,
  McpServer,
  AuthUser 
} from '../types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Generate mock user data
 */
export const createMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: 'user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  roles: ['user'],
  permissions: ['read', 'write'],
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: true,
  },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  isActive: true,
  isVerified: true,
  ...overrides,
});

/**
 * Generate mock message data
 */
export const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: `msg-${Date.now()}`,
  content: 'This is a test message',
  type: 'text',
  senderId: 'user-123',
  conversationId: 'conv-123',
  timestamp: new Date().toISOString(),
  status: 'sent',
  metadata: {
    edited: false,
    pinned: false,
    reactions: [],
  },
  ...overrides,
});

/**
 * Generate mock conversation data
 */
export const createMockConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: `conv-${Date.now()}`,
  title: 'Test Conversation',
  type: 'direct',
  participants: ['user-123', 'user-456'],
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    lastMessageId: null,
    unreadCount: 0,
    isArchived: false,
    isMuted: false,
  },
  settings: {
    notifications: true,
    autoSave: true,
    encryption: false,
  },
  ...overrides,
});

/**
 * Generate mock workspace data
 */
export const createMockWorkspace = (overrides: Partial<Workspace> = {}): Workspace => ({
  id: `ws-${Date.now()}`,
  name: 'Test Workspace',
  description: 'A test workspace for development',
  ownerId: 'user-123',
  projects: [],
  collaborators: [],
  settings: {
    public: false,
    allowInvites: true,
    defaultPermissions: 'read',
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    tags: ['test', 'development'],
  },
  ...overrides,
});

/**
 * Generate mock project data
 */
export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: `proj-${Date.now()}`,
  name: 'Test Project',
  description: 'A test project',
  type: 'web',
  workspaceId: 'ws-123',
  ownerId: 'user-123',
  files: [],
  config: {
    language: 'typescript',
    framework: 'react',
    buildTool: 'vite',
  },
  metadata: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'active',
  },
  ...overrides,
});

/**
 * Generate mock Scout analysis data
 */
export const createMockScoutAnalysis = (overrides: Partial<ScoutAnalysis> = {}): ScoutAnalysis => ({
  id: `analysis-${Date.now()}`,
  projectId: 'proj-123',
  type: 'code-quality',
  status: 'completed',
  results: {
    score: 85,
    metrics: {
      complexity: 'medium',
      maintainability: 'high',
      coverage: 80,
    },
    suggestions: [
      {
        type: 'refactor',
        severity: 'medium',
        message: 'Consider breaking down large functions',
        file: 'src/components/LargeComponent.tsx',
        line: 42,
      },
    ],
  },
  metadata: {
    createdAt: new Date().toISOString(),
    duration: 1500,
    version: '1.0.0',
  },
  ...overrides,
});

/**
 * Generate mock MCP server data
 */
export const createMockMcpServer = (overrides: Partial<McpServer> = {}): McpServer => ({
  id: `mcp-${Date.now()}`,
  name: 'Test MCP Server',
  url: 'http://localhost:3001',
  status: 'connected',
  capabilities: ['tools', 'resources'],
  tools: [
    {
      name: 'test-tool',
      description: 'A test tool',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
      },
    },
  ],
  config: {
    timeout: 5000,
    retries: 3,
    auth: {
      type: 'api-key',
      token: 'test-token',
    },
  },
  metadata: {
    connectedAt: new Date().toISOString(),
    version: '1.0.0',
    health: 'healthy',
  },
  ...overrides,
});

// ============================================================================
// MOCK STORE UTILITIES
// ============================================================================

/**
 * Create mock Redux store for testing
 */
export const createMockStore = (initialState: Partial<RootState> = {}): Store => {
  const defaultState: RootState = {
    chat: {
      conversations: [],
      activeConversationId: null,
      messages: {},
      typing: {},
      loading: false,
      error: null,
    },
    workspace: {
      workspaces: [],
      activeWorkspaceId: null,
      projects: [],
      files: {},
      loading: false,
      error: null,
    },
    scout: {
      analyses: [],
      activeAnalysisId: null,
      insights: [],
      loading: false,
      error: null,
    },
    mcp: {
      servers: [],
      activeServerId: null,
      tools: [],
      connections: {},
      loading: false,
      error: null,
    },
    ui: {
      theme: 'light',
      layout: 'default',
      notifications: [],
      modals: {},
      loading: {},
      errors: {},
    },
    ...initialState,
  };

  return configureStore({
    reducer: rootReducer,
    preloadedState: defaultState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

// ============================================================================
// CUSTOM RENDER FUNCTIONS
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: Partial<RootState>;
  store?: Store;
  theme?: any;
  router?: boolean;
}

/**
 * Custom render function with all providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    initialState = {},
    store = createMockStore(initialState),
    theme = defaultTheme,
    router = true,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult & { store: Store } => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    let content = (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </Provider>
    );

    if (router) {
      content = <BrowserRouter>{content}</BrowserRouter>;
    }

    return content;
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

/**
 * Render with Redux only (no router)
 */
export const renderWithStore = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => renderWithProviders(ui, { ...options, router: false });

/**
 * Render with theme only
 */
export const renderWithTheme = (
  ui: React.ReactElement,
  theme = defaultTheme,
  options: RenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// ============================================================================
// API MOCK UTILITIES
// ============================================================================

/**
 * Mock fetch responses
 */
export const mockFetch = {
  success: (data: any) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    });
  },

  error: (status = 500, message = 'Internal Server Error') => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status,
      json: () => Promise.resolve({ error: message }),
      text: () => Promise.resolve(JSON.stringify({ error: message })),
    });
  },

  networkError: () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );
  },

  reset: () => {
    (global.fetch as jest.Mock).mockReset();
  },
};

/**
 * Mock WebSocket utilities
 */
export const mockWebSocket = {
  create: () => {
    const mockSocket = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      readyState: 1,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    };

    (global.WebSocket as any).mockImplementation(() => mockSocket);
    return mockSocket;
  },

  simulateMessage: (socket: any, data: any) => {
    if (socket.onmessage) {
      socket.onmessage({ data: JSON.stringify(data) });
    }
  },

  simulateError: (socket: any, error: any) => {
    if (socket.onerror) {
      socket.onerror(error);
    }
  },
};

// ============================================================================
// FILE SYSTEM MOCKS
// ============================================================================

/**
 * Mock file operations
 */
export const mockFileSystem = {
  createFile: (name: string, content: string, type = 'text/plain') => {
    return new File([content], name, { type });
  },

  createBinaryFile: (name: string, size = 1024) => {
    const buffer = new ArrayBuffer(size);
    return new File([buffer], name, { type: 'application/octet-stream' });
  },

  mockFileReader: (result: string | ArrayBuffer) => {
    const mockReader = {
      result,
      readAsText: jest.fn(function(this: any) {
        this.onload && this.onload({ target: this });
      }),
      readAsDataURL: jest.fn(function(this: any) {
        this.onload && this.onload({ target: this });
      }),
      readAsArrayBuffer: jest.fn(function(this: any) {
        this.onload && this.onload({ target: this });
      }),
      onerror: null,
      onload: null,
    };

    (global.FileReader as any) = jest.fn(() => mockReader);
    return mockReader;
  },
};

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

/**
 * Accessibility testing helpers
 */
export const a11yUtils = {
  /**
   * Check if element has proper ARIA attributes
   */
  checkAriaAttributes: (element: HTMLElement) => {
    const hasAriaLabel = element.getAttribute('aria-label');
    const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
    const hasAriaDescribedBy = element.getAttribute('aria-describedby');
    
    return {
      hasLabel: !!(hasAriaLabel || hasAriaLabelledBy),
      hasDescription: !!hasAriaDescribedBy,
      role: element.getAttribute('role'),
    };
  },

  /**
   * Check keyboard navigation
   */
  checkKeyboardNavigation: (element: HTMLElement) => {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(
      element.tagName.toLowerCase()
    );
    
    return {
      isFocusable: tabIndex !== '-1' && (isInteractive || tabIndex !== null),
      tabIndex: tabIndex ? parseInt(tabIndex) : undefined,
    };
  },
};

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Performance testing helpers
 */
export const performanceUtils = {
  /**
   * Measure render time
   */
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },

  /**
   * Mock performance observer
   */
  mockPerformanceObserver: () => {
    const mockObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => []),
    };

    (global.PerformanceObserver as any) = jest.fn(() => mockObserver);
    return mockObserver;
  },
};

// ============================================================================
// ASYNC TESTING UTILITIES
// ============================================================================

/**
 * Async testing helpers
 */
export const asyncUtils = {
  /**
   * Wait for async operations with timeout
   */
  waitFor: async (condition: () => boolean, timeout = 5000) => {
    const start = Date.now();
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  },

  /**
   * Resolve promises in next tick
   */
  flushPromises: () => new Promise(resolve => setImmediate(resolve)),

  /**
   * Mock delayed promise
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};

// ============================================================================
// FORM TESTING UTILITIES
// ============================================================================

/**
 * Form testing helpers
 */
export const formUtils = {
  /**
   * Fill form fields
   */
  fillForm: async (fields: Record<string, string>) => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    for (const [name, value] of Object.entries(fields)) {
      const field = document.querySelector(`[name="${name}"]`) as HTMLElement;
      if (field) {
        await user.clear(field);
        await user.type(field, value);
      }
    }
  },

  /**
   * Submit form
   */
  submitForm: async (formSelector = 'form') => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const form = document.querySelector(formSelector) as HTMLElement;
    if (form) {
      await user.click(form.querySelector('[type="submit"]') as HTMLElement);
    }
  },
};

// Export test configuration
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  DELAYS: {
    ANIMATION: 300,
    DEBOUNCE: 500,
    API_CALL: 1000,
  },
  MOCK_IDS: {
    USER: 'test-user-123',
    WORKSPACE: 'test-workspace-123',
    PROJECT: 'test-project-123',
    CONVERSATION: 'test-conversation-123',
  },
} as const;
